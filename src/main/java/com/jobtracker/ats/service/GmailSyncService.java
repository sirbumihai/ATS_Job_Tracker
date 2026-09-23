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

    @Transactional
    public GmailSyncResult syncWithGmail(UUID userId, GmailSyncRequest request) {
        User user = resolveUser(userId);
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

            List<Application> userApps = applicationRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

            // Parcurgem mesajele de la cele mai noi la cele mai vechi
            for (int i = messages.length - 1; i >= 0; i--) {
                Message msg = messages[i];
                try {
                    String sender = msg.getFrom() != null && msg.getFrom().length > 0 ? msg.getFrom()[0].toString() : "";
                    String subject = msg.getSubject() != null ? msg.getSubject() : "";
                    String body = extractMessageBody(msg);
                    LocalDate emailDate = extractEmailDate(msg);

                    EmailParserService.ParsedJobEmail parsed = emailParserService.parse(sender, subject, body);

                    if (!parsed.isRecruitmentEmail()) {
                        continue;
                    }

                    result.setMatchedEmails(result.getMatchedEmails() + 1);

                    // Căutăm dacă există deja o aplicație pentru această companie
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
                            String noteUpdate = "\n[Gmail Sync " + LocalDate.now() + "] Status actualizat automat la "
                                    + newStatus + " din emailul: \"" + parsed.snippet() + "\"";
                            app.setNotes((app.getNotes() != null ? app.getNotes() : "") + noteUpdate);

                            applicationRepository.save(app);
                            result.setUpdatedApplications(result.getUpdatedApplications() + 1);

                            result.getSyncDetails().add(SyncItemDetail.builder()
                                    .companyName(app.getJobPosting().getCompanyName())
                                    .jobTitle(app.getJobPosting().getJobTitle())
                                    .oldStatus(oldStatus.name())
                                    .newStatus(newStatus.name())
                                    .emailSubject(subject)
                                    .sender(sender)
                                    .emailDate(emailDate)
                                    .actionTaken("UPDATED")
                                    .build());
                        }
                    } else if (request.isAutoCreateMissing()) {
                        // Creare aplicație nouă descoperită exclusiv prin email
                        JobPosting newJob = JobPosting.builder()
                                .user(user)
                                .companyName(parsed.companyName())
                                .jobTitle(parsed.jobTitle())
                                .rawDescription("Aplicație detectată automat prin sincronizare Gmail din emailul: " + subject)
                                .jobUrl(null)
                                .build();
                        JobPosting savedJob = jobPostingRepository.save(newJob);

                        Application newApp = Application.builder()
                                .user(user)
                                .jobPosting(savedJob)
                                .status(parsed.detectedStatus())
                                .appliedDate(emailDate)
                                .semanticMatchScore(BigDecimal.valueOf(80.00))
                                .notes("[Gmail Sync " + LocalDate.now() + "] Candidatură detectată automat din emailul: \""
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
                } catch (Exception msgEx) {
                    log.debug("[GMAIL SYNC] Eroare la procesarea unui mesaj individual: {}", msgEx.getMessage());
                }
            }

            inbox.close(false);
            result.setSuccess(true);
            result.setMessage("Sincronizare finalizată cu succes. " + result.getUpdatedApplications() + " aplicații actualizate, "
                    + result.getCreatedApplications() + " candidaturi noi adăugate automat.");

            log.info("[GMAIL SYNC] Finalizat pentru {}: {} actualizate, {} create din {} emailuri de recrutare.",
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

    private Properties getImapProperties() {
        Properties props = new Properties();
        props.put("mail.store.protocol", "imaps");
        props.put("mail.imaps.host", "imap.gmail.com");
        props.put("mail.imaps.port", "993");
        props.put("mail.imaps.ssl.enable", "true");
        props.put("mail.imaps.timeout", "10000");
        props.put("mail.imaps.connectiontimeout", "10000");
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
            Object content = msg.getContent();
            if (content instanceof String s) {
                return s;
            } else if (content instanceof MimeMultipart mp) {
                return extractTextFromMultipart(mp);
            }
        } catch (Exception ignored) {}
        return "";
    }

    private String extractTextFromMultipart(MimeMultipart mp) throws MessagingException, IOException {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < mp.getCount(); i++) {
            BodyPart bp = mp.getBodyPart(i);
            if (bp.isMimeType("text/plain")) {
                sb.append(bp.getContent().toString()).append(" ");
            } else if (bp.isMimeType("text/html")) {
                // Dacă nu am extras deja text simplu, extragem din HTML
                if (sb.isEmpty()) {
                    String html = bp.getContent().toString();
                    sb.append(org.jsoup.Jsoup.parse(html).text()).append(" ");
                }
            } else if (bp.getContent() instanceof MimeMultipart childMp) {
                sb.append(extractTextFromMultipart(childMp)).append(" ");
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
