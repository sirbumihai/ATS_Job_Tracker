package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.GmailSyncRequest;
import com.jobtracker.ats.dto.GmailSyncResult;
import com.jobtracker.ats.dto.GmailSyncResult.SyncItemDetail;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.UserRepository;
import jakarta.mail.*;
import jakarta.mail.internet.MimeMultipart;
import jakarta.mail.search.ComparisonTerm;
import jakarta.mail.search.ReceivedDateTerm;
import jakarta.mail.search.SearchTerm;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GmailSyncService {

    private final ApplicationRepository applicationRepository;
    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;
    private final EmailParserService emailParserService;

    public boolean testConnection(GmailSyncRequest request) {
        Properties props = getImapProperties();
        Session session = Session.getInstance(props);
        try (Store store = session.getStore("imaps")) {
            String cleanPassword = cleanPassword(request.getAppPassword());
            store.connect("imap.gmail.com", 993, request.getEmail().trim(), cleanPassword);
            return store.isConnected();
        } catch (AuthenticationFailedException e) {
            log.warn("[GMAIL SYNC] Autentificare IMAP eșuată pentru {}: {}", request.getEmail(), e.getMessage());
            throw new IllegalArgumentException("Autentificare eșuată. Asigură-te că folosești o Parolă de Aplicație Google (16 caractere) generată din Cont Google -> Securitate -> Verificare în 2 pași -> Parole pentru aplicații.");
        } catch (Exception e) {
            log.error("[GMAIL SYNC] Eroare la testul conexiunii IMAP: {}", e.getMessage());
            throw new RuntimeException("Nu s-a putut stabili conexiunea cu serverul Gmail IMAP: " + e.getMessage(), e);
        }
    }

    public GmailSyncResult syncWithGmail(UUID userId, GmailSyncRequest request) {
        User user = resolveUser(userId);
        
        // Auto-repară aplicațiile corupte anterior de parsare eronată înainte de noua scanare
        try {
            repairExistingCorruptedGmailApplications(user.getId());
        } catch (Exception e) {
            log.warn("[GMAIL SYNC] Nu s-a putut rula auto-repararea preliminară: {}", e.getMessage());
        }

        Properties props = getImapProperties();
        Session session = Session.getInstance(props);

        GmailSyncResult result = GmailSyncResult.builder()
                .success(false)
                .emailsScanned(0)
                .matchedEmails(0)
                .updatedApplications(0)
                .createdApplications(0)
                .syncDetails(new ArrayList<>())
                .build();

        String cleanPassword = cleanPassword(request.getAppPassword());

        try (Store store = session.getStore("imaps")) {
            store.connect("imap.gmail.com", 993, request.getEmail().trim(), cleanPassword);
            Folder inbox = store.getFolder("INBOX");
            inbox.open(Folder.READ_ONLY);

            int days = Math.max(1, Math.min(request.getDaysToLookBack(), 90));
            Date cutoffDate = Date.from(Instant.now().minusSeconds((long) days * 24 * 3600));
            SearchTerm dateTerm = new ReceivedDateTerm(ComparisonTerm.GE, cutoffDate);

            Message[] messages = inbox.search(dateTerm);
            log.info("[GMAIL SYNC] Identificate {} mesaje primite în ultimele {} zile pentru {}", messages.length, days, request.getEmail());
            result.setEmailsScanned(messages.length);

            if (messages.length > 0) {
                // Pre-încărcare rapidă a plicurilor (Envelope) în batch printr-o singură comandă IMAP
                FetchProfile fp = new FetchProfile();
                fp.add(FetchProfile.Item.ENVELOPE);
                fp.add(FetchProfile.Item.FLAGS);
                fp.add(FetchProfile.Item.CONTENT_INFO);
                inbox.fetch(messages, fp);
            }

            List<Application> userApps = applicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            Set<String> knownCompanies = userApps.stream()
                    .map(a -> a.getJobPosting() != null ? a.getJobPosting().getCompanyName() : null)
                    .filter(Objects::nonNull)
                    .map(s -> s.toLowerCase(Locale.ROOT).trim())
                    .collect(java.util.stream.Collectors.toSet());

            record CandidateEmailRecord(
                    int id,
                    String sender,
                    String subject,
                    String body,
                    String snippet,
                    LocalDate emailDate
            ) {}

            List<CandidateEmailRecord> candidateList = new ArrayList<>();
            int idCounter = 1;

            // 1. Colectăm toate emailurile candidate relevante din plicuri
            for (int i = messages.length - 1; i >= 0; i--) {
                Message msg = messages[i];
                try {
                    String sender = extractSender(msg);
                    String subject = msg.getSubject() != null ? msg.getSubject() : "";

                    // Filtrare rapidă pe baza headerelor în memorie: evităm descărcarea corpurilor pentru emailuri irelevante
                    if (!emailParserService.isCandidateRecruitmentEmail(sender, subject, knownCompanies)) {
                        continue;
                    }

                    String body = extractMessageBody(msg);
                    LocalDate emailDate = extractEmailDate(msg);
                    String snippet = body.length() > 350 ? body.substring(0, 350) : body;

                    candidateList.add(new CandidateEmailRecord(idCounter++, sender, subject, body, snippet, emailDate));
                } catch (Exception msgEx) {
                    log.debug("[GMAIL SYNC] Eroare la citirea plicului mesajului: {}", msgEx.getMessage());
                }
            }

            log.info("[GMAIL SYNC] Colectate {} emailuri candidate de recrutare pentru {}. Rezolvare rapidă...", candidateList.size(), request.getEmail());

            // 2. Fast-Path Deterministic: verificam daca putem parsa direct cu acuratete 100% fara a consuma tokeni AI
            List<CandidateEmailRecord> ambiguousList = new ArrayList<>();
            for (CandidateEmailRecord item : candidateList) {
                EmailParserService.ParsedJobEmail fastParsed = emailParserService.parseFastOrDeterministic(item.sender(), item.subject(), item.body());
                if (fastParsed != null) {
                    if (fastParsed.isRecruitmentEmail()) {
                        processMatchedEmail(user, userApps, fastParsed, item.sender(), item.subject(), item.emailDate(), item.body(), request.isAutoCreateMissing(), result);
                    }
                } else {
                    ambiguousList.add(item);
                }
            }

            // 3. Procesam un numar strict limitat (maxim 8) de emailuri ambigue cu modelul AI, iar restul deterministic
            if (!ambiguousList.isEmpty()) {
                int maxAiToProcess = Math.min(8, ambiguousList.size());
                List<CandidateEmailRecord> aiToProcess = ambiguousList.subList(0, maxAiToProcess);
                List<CandidateEmailRecord> remainingDeterministic = ambiguousList.subList(maxAiToProcess, ambiguousList.size());

                log.info("[GMAIL SYNC] {} emailuri trimise la clasificatorul AI (max 8 pentru viteza), restul de {} rezolvate direct deterministic.",
                        aiToProcess.size(), remainingDeterministic.size());

                int chunkSize = 4;
                for (int i = 0; i < aiToProcess.size(); i += chunkSize) {
                    List<CandidateEmailRecord> chunk = aiToProcess.subList(i, Math.min(i + chunkSize, aiToProcess.size()));
                    List<EmailParserService.CandidateEmailItem> batchItems = chunk.stream()
                            .map(c -> new EmailParserService.CandidateEmailItem(c.id(), c.sender(), c.subject(), c.snippet()))
                            .toList();

                    Map<Integer, EmailParserService.ParsedJobEmail> aiBatchResults = emailParserService.classifyBatchWithAi(batchItems);

                    for (CandidateEmailRecord item : chunk) {
                        try {
                            EmailParserService.ParsedJobEmail parsed = aiBatchResults.get(item.id());
                            if (parsed == null) {
                                // Fallback direct deterministic (fara apeluri individuale suplimentare AI ca sa evitam rate limit 429)
                                parsed = emailParserService.parseFastOrDeterministic(item.sender(), item.subject(), item.body());
                            }

                            if (parsed == null || !parsed.isRecruitmentEmail()) {
                                continue;
                            }

                            processMatchedEmail(user, userApps, parsed, item.sender(), item.subject(), item.emailDate(), item.body(), request.isAutoCreateMissing(), result);
                        } catch (Exception e) {
                            log.debug("[GMAIL SYNC] Eroare la aplicarea rezultatului pentru un mesaj: {}", e.getMessage());
                        }
                    }
                }

                // Pentru restul de mesaje ambigue peste plafonul AI, aplicam fallback deterministic rapid (0 ms, 0 tokeni)
                for (CandidateEmailRecord item : remainingDeterministic) {
                    EmailParserService.ParsedJobEmail detParsed = emailParserService.parseFastOrDeterministic(item.sender(), item.subject(), item.body());
                    if (detParsed != null && detParsed.isRecruitmentEmail()) {
                        processMatchedEmail(user, userApps, detParsed, item.sender(), item.subject(), item.emailDate(), item.body(), request.isAutoCreateMissing(), result);
                    }
                }
            }

            inbox.close(false);
            result.setSuccess(true);
            result.setMessage("Sincronizare finalizata cu succes. " + result.getUpdatedApplications() + " aplicatii actualizate, "
                    + result.getCreatedApplications() + " candidaturi noi adaugate automat.");

            log.info("[GMAIL SYNC] Finalizat pentru {}: {} actualizate, {} create din {} emailuri de recrutare potrivite.",
                    request.getEmail(), result.getUpdatedApplications(), result.getCreatedApplications(), result.getMatchedEmails());

        } catch (AuthenticationFailedException e) {
            log.warn("[GMAIL SYNC] Autentificare eșuată pentru {}: {}", request.getEmail(), e.getMessage());
            result.setMessage("Autentificare eșuată pe serverul Gmail. Verifică adresa de email și Parola de Aplicație.");
        } catch (Exception e) {
            log.error("[GMAIL SYNC] Eroare generală la sincronizare: {}", e.getMessage(), e);
            result.setMessage("Eroare la conectarea cu Gmail: " + e.getMessage());
        }

        return result;
    }

    private String extractSender(Message msg) {
        try {
            Address[] from = msg.getFrom();
            if (from != null && from.length > 0) {
                return from[0].toString();
            }
        } catch (Exception ignored) {}
        return "";
    }

    private void processMatchedEmail(User user, List<Application> userApps, EmailParserService.ParsedJobEmail parsed,
                                     String sender, String subject, LocalDate emailDate, String body, boolean autoCreateMissing,
                                     GmailSyncResult result) {
        result.setMatchedEmails(result.getMatchedEmails() + 1);

        Optional<Application> existingAppOpt = findMatchingApplication(userApps, parsed.companyName());

        if (existingAppOpt.isPresent()) {
            Application app = existingAppOpt.get();
            ApplicationStatus oldStatus = app.getStatus();
            ApplicationStatus newStatus = parsed.detectedStatus();

            if (shouldUpgradeStatus(oldStatus, newStatus)) {
                app.setStatus(newStatus);
                if (newStatus == ApplicationStatus.APPLIED && app.getAppliedDate() == null) {
                    app.setAppliedDate(emailDate);
                }
                String noteUpdate = "\n[Gmail Sync " + (emailDate != null ? emailDate : LocalDate.now()) + "] Status actualizat automat la "
                        + newStatus + " din emailul: \"" + parsed.snippet() + "\" (" + sender + ")";
                app.setNotes((app.getNotes() != null ? app.getNotes() : "") + noteUpdate);

                // Îmbogățim descrierea jobului dacă era minimă sau generică
                if (app.getJobPosting() != null) {
                    JobPosting jp = app.getJobPosting();
                    String currentDesc = jp.getRawDescription();
                    if (currentDesc == null || currentDesc.isBlank() || currentDesc.startsWith("Aplicație detectată automat")) {
                        jp.setRawDescription(buildGmailJobDescription(sender, subject, emailDate, newStatus, body));
                        jobPostingRepository.save(jp);
                    }
                }

                applicationRepository.save(app);
                result.setUpdatedApplications(result.getUpdatedApplications() + 1);

                result.getSyncDetails().add(SyncItemDetail.builder()
                        .companyName(app.getJobPosting() != null ? app.getJobPosting().getCompanyName() : parsed.companyName())
                        .jobTitle(app.getJobPosting() != null ? app.getJobPosting().getJobTitle() : parsed.jobTitle())
                        .oldStatus(oldStatus.name())
                        .newStatus(newStatus.name())
                        .emailSubject(subject)
                        .sender(sender)
                        .emailDate(emailDate)
                        .actionTaken("UPDATED")
                        .build());
            }
        } else if (autoCreateMissing) {
            String fullJobDescription = buildGmailJobDescription(sender, subject, emailDate, parsed.detectedStatus(), body);

            JobPosting newJob = JobPosting.builder()
                    .user(user)
                    .companyName(parsed.companyName())
                    .jobTitle(parsed.jobTitle())
                    .rawDescription(fullJobDescription)
                    .jobUrl(null)
                    .build();
            JobPosting savedJob = jobPostingRepository.save(newJob);

            Application newApp = Application.builder()
                    .user(user)
                    .jobPosting(savedJob)
                    .status(parsed.detectedStatus())
                    .appliedDate(emailDate)
                    .semanticMatchScore(BigDecimal.valueOf(80.00))
                    .notes("[Gmail Sync " + (emailDate != null ? emailDate : LocalDate.now()) + "] Candidatură detectată automat din emailul: \""
                            + parsed.snippet() + "\" (" + sender + ")")
                    .build();
            Application savedApp = applicationRepository.save(newApp);
            userApps.add(savedApp);

            result.setCreatedApplications(result.getCreatedApplications() + 1);
            result.getSyncDetails().add(SyncItemDetail.builder()
                    .companyName(savedJob.getCompanyName())
                    .jobTitle(savedJob.getJobTitle())
                    .oldStatus("NONE")
                    .newStatus(newApp.getStatus().name())
                    .emailSubject(subject)
                    .sender(sender)
                    .emailDate(emailDate)
                    .actionTaken("CREATED")
                    .build());
        }
    }

    private String buildGmailJobDescription(String sender, String subject, LocalDate emailDate, ApplicationStatus status, String body) {
        StringBuilder sb = new StringBuilder();
        sb.append("📩 EMAIL DE RECRUTARE GMAIL (Sincronizat Automat)\n");
        sb.append("============================================================\n");
        sb.append("📅 Data Primirii: ").append(emailDate != null ? emailDate.toString() : "Data Nespecificata").append("\n");
        sb.append("👤 Expeditor: ").append(sender != null && !sender.isBlank() ? sender : "Nespecificat").append("\n");
        sb.append("📌 Subiect: ").append(subject != null && !subject.isBlank() ? subject : "Fara Subiect").append("\n");
        sb.append("🏷️ Status Detectat: ").append(status != null ? status.name() : "APPLIED").append("\n");
        sb.append("============================================================\n\n");
        sb.append("📝 CONTINUT COMPLET EMAIL:\n");
        sb.append("------------------------------------------------------------\n");
        String clean = body != null ? body.trim() : "";
        if (clean.length() > 5000) {
            sb.append(clean, 0, 5000).append("\n\n[... Trunchiat pentru afisare optimizata ...]");
        } else if (!clean.isEmpty()) {
            sb.append(clean);
        } else {
            sb.append("(Corpul mesajului nu contine text aditional)");
        }
        return sb.toString();
    }

    @Transactional
    public int repairExistingCorruptedGmailApplications(UUID userId) {
        User user = resolveUser(userId);
        List<Application> userApps = applicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        int repairedCount = 0;

        for (Application app : userApps) {
            JobPosting jp = app.getJobPosting();
            if (jp == null) continue;

            String rawDesc = jp.getRawDescription() != null ? jp.getRawDescription() : "";
            String notes = app.getNotes() != null ? app.getNotes() : "";
            String comp = jp.getCompanyName() != null ? jp.getCompanyName() : "";
            String title = jp.getJobTitle() != null ? jp.getJobTitle() : "";

            boolean isGmailApp = notes.contains("Gmail Sync")
                    || rawDesc.contains("EMAIL DE RECRUTARE GMAIL")
                    || rawDesc.contains("GMAIL (Sincronizat Automat)")
                    || rawDesc.contains("CONTINUT COMPLET EMAIL")
                    || rawDesc.contains("CONȚINUT COMPLET EMAIL")
                    || "REQ".equalsIgnoreCase(comp)
                    || comp.toLowerCase().contains("care ai aplicat")
                    || comp.toLowerCase().contains("acest job")
                    || "Software Position".equalsIgnoreCase(title)
                    || title.toLowerCase().contains("cu succes la acest job");

            if (!isGmailApp) continue;

            // 1. Eliminare instantanee a intrarilor spam / newsletter create accidental anterior
            boolean isSpamOrNewsletter = comp.equalsIgnoreCase("Tomas from Kickresume")
                    || comp.equalsIgnoreCase("Aleks Gornik")
                    || title.toLowerCase().contains("why mindset matters")
                    || title.toLowerCase().contains("10 joburi noi")
                    || title.toLowerCase().contains("joburi similare")
                    || title.toLowerCase().contains("verify your email")
                    || rawDesc.toLowerCase().contains("let job offers come to you")
                    || rawDesc.toLowerCase().contains("why mindset matters in engineering");

            if (isSpamOrNewsletter) {
                applicationRepository.delete(app);
                jobPostingRepository.delete(jp);
                repairedCount++;
                continue;
            }

            boolean changed = false;
            String sender = "";
            String subject = "";
            String body = "";
            LocalDate emailDate = app.getAppliedDate();

            java.util.regex.Matcher mSender = java.util.regex.Pattern.compile("👤\\s*Expeditor:\\s*([^\\n\\r]+)").matcher(rawDesc);
            if (mSender.find()) sender = mSender.group(1).trim();

            java.util.regex.Matcher mSubj = java.util.regex.Pattern.compile("📌\\s*Subiect:\\s*([^\\n\\r]+)").matcher(rawDesc);
            if (mSubj.find()) subject = mSubj.group(1).trim();

            if (rawDesc.contains("CONTINUT COMPLET EMAIL:") || rawDesc.contains("CONȚINUT COMPLET EMAIL:")) {
                String[] parts = rawDesc.split("(?:CONTINUT|CONȚINUT) COMPLET EMAIL:[\\s\\S]*?-{10,}");
                if (parts.length > 1) {
                    body = parts[1].trim();
                }
            } else {
                body = rawDesc;
            }

            if (sender.isBlank() && !notes.isBlank()) {
                java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\(([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})\\)").matcher(notes);
                if (m.find()) sender = m.group(1);
            }

            EmailParserService.ParsedJobEmail reParsed = emailParserService.parseFastOrDeterministic(sender, subject, body);

            // Corectare nume companie corupte sau generice
            if ("REQ".equalsIgnoreCase(comp)
                    || comp.toLowerCase().contains("care ai aplicat")
                    || comp.toLowerCase().contains("acest job")
                    || comp.toLowerCase().contains("companie partener")
                    || comp.equalsIgnoreCase("Ashbyhq")
                    || comp.equalsIgnoreCase("HR System")
                    || comp.equalsIgnoreCase("FlutterBe Workday")
                    || comp.equalsIgnoreCase("Your Career")) {
                
                String targetComp = null;
                if (comp.equalsIgnoreCase("Ashbyhq") && subject.toLowerCase().contains("cohere")) {
                    targetComp = "Cohere";
                } else if (comp.equalsIgnoreCase("HR System") && subject.toLowerCase().contains("capgemini")) {
                    targetComp = "Capgemini";
                } else if (comp.equalsIgnoreCase("FlutterBe Workday")) {
                    targetComp = "Flutter Entertainment";
                } else if (comp.equalsIgnoreCase("Your Career")) {
                    targetComp = "Google";
                } else if (reParsed != null && reParsed.companyName() != null && !reParsed.companyName().equalsIgnoreCase("Companie Partenera")) {
                    targetComp = reParsed.companyName();
                }

                if (targetComp != null && !targetComp.equalsIgnoreCase(comp)) {
                    jp.setCompanyName(targetComp);
                    changed = true;
                }
            }

            // Corectare titlu job generic
            if ("Software Position".equalsIgnoreCase(title)
                    || title.toLowerCase().contains("cu succes la acest job")
                    || title.toLowerCase().contains("care ai aplicat")) {
                String targetTitle = (reParsed != null && reParsed.jobTitle() != null && !reParsed.jobTitle().equalsIgnoreCase("Software Position"))
                        ? reParsed.jobTitle()
                        : (subject != null && !subject.isBlank() ? subject : "Candidatura " + jp.getCompanyName());
                jp.setJobTitle(targetTitle);
                changed = true;
            }

            // Corectare false interviuri (Bestie video promo, Sova assessment survey, Vodafone tracking)
            if (app.getStatus() == ApplicationStatus.INTERVIEWING) {
                boolean isFalseInterview = rawDesc.toLowerCase().contains("bestie")
                        || rawDesc.toLowerCase().contains("interviu video cu bestie")
                        || rawDesc.toLowerCase().contains("sova assessment")
                        || rawDesc.toLowerCase().contains("online assessment")
                        || rawDesc.toLowerCase().contains("track your")
                        || subject.toLowerCase().contains("feedback on your recent online assessment")
                        || subject.toLowerCase().contains("track your vois");

                if (isFalseInterview || (reParsed != null && reParsed.detectedStatus() == ApplicationStatus.APPLIED)) {
                    app.setStatus(ApplicationStatus.APPLIED);
                    changed = true;
                }
            }

            // Asigurare format complet standardizat de email in rawDescription
            if (!rawDesc.contains("EMAIL DE RECRUTARE GMAIL") || !rawDesc.contains("CONTINUT COMPLET EMAIL")) {
                jp.setRawDescription(buildGmailJobDescription(sender, subject, emailDate, app.getStatus(), body));
                changed = true;
            }

            if (changed) {
                jobPostingRepository.save(jp);
                applicationRepository.save(app);
                repairedCount++;
            }
        }

        if (repairedCount > 0) {
            log.info("[GMAIL REPAIR] Reparate {} candidaturi pentru utilizatorul {}", repairedCount, user.getEmail());
        }
        return repairedCount;
    }

    private Properties getImapProperties() {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", "imap.gmail.com");
        props.put("mail.imaps.port", "993");
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.timeout", "15000");
        props.put("mail.imaps.connectiontimeout", "15000");
        return props;
    }

    private String cleanPassword(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("\\s+", "").trim();
    }

    private User resolveUser(UUID userId) {
        if (userId != null) {
            return userRepository.findById(userId)
                    .orElseGet(this::getDefaultUser);
        }
        return getDefaultUser();
    }

    private User getDefaultUser() {
        return userRepository.findAll().stream().findFirst()
                .orElseGet(() -> userRepository.save(User.builder()
                        .email("user@jobtracker.com")
                        .passwordHash("$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy")
                        .fullName("Utilizator ATS")
                        .build()));
    }

    private Optional<Application> findMatchingApplication(List<Application> userApps, String companyName) {
        if (companyName == null || companyName.isBlank()) return Optional.empty();
        String cNorm = companyName.toLowerCase().replaceAll("[^a-z0-9]", "");

        for (Application app : userApps) {
            if (app.getJobPosting() != null && app.getJobPosting().getCompanyName() != null) {
                String existingNorm = app.getJobPosting().getCompanyName().toLowerCase().replaceAll("[^a-z0-9]", "");
                if (existingNorm.contains(cNorm) || cNorm.contains(existingNorm)) {
                    return Optional.of(app);
                }
            }
        }
        return Optional.empty();
    }

    private boolean shouldUpgradeStatus(ApplicationStatus current, ApplicationStatus incoming) {
        if (current == incoming) return false;
        if (current == ApplicationStatus.OFFER_RECEIVED) return false; // Nu degradăm o ofertă
        if (current == ApplicationStatus.REJECTED && incoming != ApplicationStatus.OFFER_RECEIVED) return false;

        // Dacă era doar salvat, orice email îl mută cel puțin la APPLIED
        if (current == ApplicationStatus.SAVED) return true;

        // Dacă era APPLIED, îl mutăm la INTERVIEWING, REJECTED sau OFFER_RECEIVED
        if (current == ApplicationStatus.APPLIED) {
            return incoming == ApplicationStatus.INTERVIEWING || incoming == ApplicationStatus.REJECTED || incoming == ApplicationStatus.OFFER_RECEIVED;
        }

        // Dacă era INTERVIEWING, îl mutăm la OFFER_RECEIVED sau REJECTED
        if (current == ApplicationStatus.INTERVIEWING) {
            return incoming == ApplicationStatus.OFFER_RECEIVED || incoming == ApplicationStatus.REJECTED;
        }

        return false;
    }

    private String extractMessageBody(Message msg) {
        try {
            if (msg.isMimeType("text/plain")) {
                Object c = msg.getContent();
                return c != null ? c.toString() : "";
            } else if (msg.isMimeType("text/html")) {
                Object c = msg.getContent();
                return c != null ? org.jsoup.Jsoup.parse(c.toString()).text() : "";
            } else if (msg.isMimeType("multipart/*")) {
                Object c = msg.getContent();
                if (c instanceof MimeMultipart mp) {
                    return extractTextFromMultipart(mp);
                }
            }
        } catch (Exception ignored) {}
        return "";
    }

    private String extractTextFromMultipart(MimeMultipart mp) throws MessagingException, IOException {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < mp.getCount(); i++) {
            BodyPart bp = mp.getBodyPart(i);
            if (bp.isMimeType("text/plain")) {
                Object c = bp.getContent();
                if (c != null) sb.append(c.toString()).append(" ");
            } else if (bp.isMimeType("text/html")) {
                // Dacă nu am extras deja text simplu, extragem din HTML
                if (sb.isEmpty()) {
                    Object c = bp.getContent();
                    if (c != null) {
                        sb.append(org.jsoup.Jsoup.parse(c.toString()).text()).append(" ");
                    }
                }
            } else if (bp.isMimeType("multipart/*")) {
                Object c = bp.getContent();
                if (c instanceof MimeMultipart childMp) {
                    sb.append(extractTextFromMultipart(childMp)).append(" ");
                }
            }
            if (sb.length() > 6000) {
                break;
            }
        }
        return sb.toString().trim();
    }

    private LocalDate extractEmailDate(Message msg) {
        try {
            Date d = msg.getReceivedDate() != null ? msg.getReceivedDate() : msg.getSentDate();
            if (d != null) {
                return d.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            }
        } catch (Exception ignored) {}
        return LocalDate.now();
    }
}
