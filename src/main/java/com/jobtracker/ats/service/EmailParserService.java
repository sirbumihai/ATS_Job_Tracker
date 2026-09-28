package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class EmailParserService {

    private final OpenAiLlmService openAiLlmService;
    private final ObjectMapper objectMapper;

    @Autowired(required = false)
    public EmailParserService(OpenAiLlmService openAiLlmService, ObjectMapper objectMapper) {
        this.openAiLlmService = openAiLlmService;
        this.objectMapper = objectMapper != null ? objectMapper : new ObjectMapper();
    }

    public EmailParserService() {
        this(null, new ObjectMapper());
    }

    public record ParsedJobEmail(
            boolean isRecruitmentEmail,
            String companyName,
            String jobTitle,
            ApplicationStatus detectedStatus,
            String confidence,
            String snippet
    ) {}

    // 1. Zgomot comercial / marketing / finante / comenzi / newslettere (0 tokens - eliminare instantanee)
    private static final Pattern NON_RECRUITMENT_PATTERN = Pattern.compile(
            "(?i)\\b(?:factur[aă]|invoice|chitan[tț][aă]|comanda|comand[aă]|order confirmation|awb|curier|sameday|fan courier|" +
            "dpd|gls|cargus|livrare|expediere|tracking number|revolut|banca transilvania|ing bank|raiffeisen|bcr|brd|cec bank|" +
            "paypal|plata|plata cu cardul|tranzactie|extras de cont|card de credit|imprumut|credit nevoi personale|" +
            "superbet|betano|unibet|pacanele|cazinou|" +
            "reducere|reducerea de|voucher|cod promotional|cod promo[tț]ional|promo[tț]ie|promotie|black friday|" +
            "oferta s[aă]pt[aă]m[aă]nii|ofert[aă] special[aă]|ofert[aă] exclusiv[aă]|discount|cashback|" +
            "abonament|re[iî]nnoire abonament|netflix|spotify|youtube premium|google cloud alert|" +
            "security alert|codul t[aă]u de securitate|resetare parol[aă]|confirm[aă] contul|verify your email|" +
            "who viewed your profile|a vizualizat profilul|a ad[aă]ugat un articol|invita[tț]ie de conectare|" +
            "invitation to connect|felicit[aă]ri pentru|congratulate|actualiz[aă]ri de la re[tț]eaua ta|" +
            "persoane pe care le-ai putea cunoa[sș]te|new connection|s-a conectat cu tine|" +
            "job alert|alert[aă] de joburi|noi joburi pentru tine|jobs you may be interested in|" +
            "recomandate pentru tine|top oportunit[aă][tț]i|newsletter|dezabonare|unsubscribe|" +
            "angajatori de top|salariile din|vezi cine te-a c[aă]utat|t[aâ]rg de carier[aă]|eveniment|webinar|" +
            "sfaturi de carier[aă]|actualizeaz[aă]-[tț]i cv|actualizeaza cv|companii care angajeaz[aă]|jobul s[aă]pt[aă]m[aă]nii|" +
            "kickresume|aleks gornik|why mindset matters|let job offers come to you|joburi similare celui|" +
            "joburi noi ad[aă]ugate|10 joburi noi|recomand[aă]rile de azi|sova assessment|experience survey)\\b"
    );

    // 2. Clauze de excludere pentru false oferte (ex: respingeri sau promoții care conțin 'oferi')
    private static final Pattern FALSE_OFFER_PATTERN = Pattern.compile(
            "(?i)\\b(?:nu (?:putem|v[aă] putem|avem posibilitatea) (?:s[aă] )?(?:[iî][tț]i )?oferim|" +
            "unable to offer|cannot offer|can't offer|not able to offer|decided not to offer|" +
            "oferte (?:noi|recomandate|disponibile|de joburi|s[aă]pt[aă]m[aă]nale)|" +
            "ofert[aă] (?:special[aă]|promo[tț]ional[aă]|comercial[aă]|de cursuri|de abonament)|" +
            "din p[aă]cate|din pacate|regret[aă]m|regretam|unfortunately|other candidates|al[tț]i candida[tț]i)\\b"
    );

    // 3. Oferte autentice și clare de angajare
    private static final Pattern GENUINE_OFFER_PATTERN = Pattern.compile(
            "(?i)\\b(?:formal (?:job )?offer|official (?:job )?offer|congratulations on your offer|" +
            "pleased to offer you the (?:position|role)|excited to offer you the (?:position|role)|" +
            "oferta (?:noastr[aă] )?ferm[aă] de angajare|ofert[aă] de angajare pentru pozi[tț]ia|" +
            "ne bucur[aă]m s[aă] [iî][tț]i transmitem oferta|contractul individual de munc[aă]|" +
            "letter of employment offer)\\b"
    );

    // Regex-uri pentru extragere Companie din Subiecte uzuale ATS
    private static final Pattern PATTERN_LINKEDIN_1 = Pattern.compile("(?i)(?:application to|aplicat la)\\s+([^\\n\\r–—|]+?)(?:\\s+has been|\\s+a fost|\\s+for|$)");
    private static final Pattern PATTERN_LINKEDIN_2 = Pattern.compile("(?i)(?:at|la)\\s+([^\\n\\r–—|()]+?)(?:\\s+was sent|\\s+a fost trimisă|$)");
    private static final Pattern PATTERN_GENERIC_AT = Pattern.compile("(?i)\\b(?:at|la)\\s+([A-Z0-9][A-Za-z0-9&.\\s-]{1,35}?)(?:\\s*[-–—|()]|$)");
    private static final Pattern PATTERN_GENERIC_TO = Pattern.compile("(?i)(?:application to|candidatura la|candidatură la|applied to)\\s+([A-Z0-9][A-Za-z0-9&.\\s-]{1,35}?)(?:\\s*[-–—|()]|$)");
    private static final Pattern PATTERN_EJOBS = Pattern.compile("(?i)(?:de la|la compania)\\s+([A-Za-z0-9&.\\s-]{2,40}?)(?:\\s*[-–—|()]|$)");

    public ParsedJobEmail parse(String sender, String subject, String bodyText) {
        if (subject == null) subject = "";
        if (bodyText == null) bodyText = "";
        if (sender == null) sender = "";

        // Pasul 1: Verificare eliminare zgomot (0 tokens)
        if (isDefiniteNonRecruitmentEmail(sender, subject)) {
            return new ParsedJobEmail(false, null, null, null, "NONE", null);
        }

        // Pasul 2: Extragere snippet scurt (max 350 caractere) pentru apel AI cu cost minim de tokeni
        String snippet = bodyText.length() > 350 ? bodyText.substring(0, 350) : bodyText;

        // Pasul 3: Clasificare inteligentă AI (dacă e disponibil)
        ParsedJobEmail aiResult = classifyWithAi(sender, subject, snippet);
        if (aiResult != null) {
            return aiResult;
        }

        // Pasul 4: Fallback deterministic robust & precis
        return parseDeterministic(sender, subject, bodyText);
    }

    private boolean isDefiniteNonRecruitmentEmail(String sender, String subject) {
        String combined = (sender + " " + subject).toLowerCase(Locale.ROOT);
        return NON_RECRUITMENT_PATTERN.matcher(combined).find();
    }

    private ParsedJobEmail classifyWithAi(String sender, String subject, String bodySnippet) {
        if (openAiLlmService == null || !openAiLlmService.isConfigured()) {
            return null;
        }

        try {
            String systemPrompt = """
                    Ești un clasificator ATS strict. Analizează emailul și determină dacă este legat de procesul de selecție/angajare al destinatarului.
                    Răspunde DOAR cu JSON:
                    {
                      "isRecruitment": boolean,
                      "company": "NumeCompanie sau null",
                      "jobTitle": "TitluRol sau null",
                      "status": "APPLIED" | "INTERVIEWING" | "REJECTED" | "OFFER_RECEIVED" | "NONE"
                    }
                    REGULI PRECISE:
                    1. isRecruitment este true DOAR dacă candidatul a aplicat, participă la interviu, a fost respins sau a primit ofertă de angajare.
                    2. isRecruitment este FALSE pentru: newslettere, alerte joburi recomandate, oferte de reducere/promoții, confirmări comenzi/bănci.
                    3. status="OFFER_RECEIVED" se setează DOAR dacă este o ofertă oficială de muncă/contract. NICIODATĂ pentru reduceri, promoții sau respingeri ("nu vă putem oferi")!
                    4. status="INTERVIEWING" pentru invitație la interviu, screening call, teste tehnice.
                    5. status="REJECTED" pentru respingere/refuz.
                    6. status="APPLIED" pentru confirmare primire candidatură.
                    """;

            String userPrompt = String.format("EXPEDITOR: %s\nSUBIECT: %s\nSNIPPET: %s", sender, subject, bodySnippet);

            // Generare compactă (max 600 tokens) pentru a preveni trunchierea JSON-ului
            String aiJson = openAiLlmService.generateCompletion(systemPrompt, userPrompt, 600, 0.0);
            if (aiJson != null && !aiJson.isBlank()) {
                String cleaned = aiJson.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode root = objectMapper.readTree(cleaned);
                boolean isRec = root.path("isRecruitment").asBoolean(false);
                if (!isRec) {
                    return new ParsedJobEmail(false, null, null, null, "AI_REJECTED", null);
                }

                String statusStr = root.path("status").asText("APPLIED");
                ApplicationStatus status = switch (statusStr.toUpperCase(Locale.ROOT)) {
                    case "OFFER_RECEIVED" -> ApplicationStatus.OFFER_RECEIVED;
                    case "INTERVIEWING" -> ApplicationStatus.INTERVIEWING;
                    case "REJECTED" -> ApplicationStatus.REJECTED;
                    default -> ApplicationStatus.APPLIED;
                };

                // Protecție anti-false-offer chiar și pentru AI
                if (status == ApplicationStatus.OFFER_RECEIVED && FALSE_OFFER_PATTERN.matcher((subject + " " + bodySnippet).toLowerCase(Locale.ROOT)).find()) {
                    status = ApplicationStatus.REJECTED;
                }

                String comp = root.path("company").asText(null);
                if ("null".equalsIgnoreCase(comp) || comp == null || comp.isBlank()) {
                    comp = extractCompany(sender, subject, bodySnippet);
                }

                String title = root.path("jobTitle").asText(null);
                if ("null".equalsIgnoreCase(title) || title == null || title.isBlank()) {
                    title = extractJobTitle(subject, bodySnippet, comp);
                }

                String snippet = subject.length() > 80 ? subject.substring(0, 80) + "..." : subject;

                return new ParsedJobEmail(
                        true,
                        comp != null ? cleanCompany(comp) : "Companie Parteneră",
                        title != null && !title.isBlank() ? title.trim() : (comp != null ? "Candidatură " + comp : "Candidatură Recrutare"),
                        status,
                        "AI_HIGH",
                        snippet
                );
            }
        } catch (Exception e) {
            log.warn("[AI EMAIL PARSER] Clasificarea AI nu a putut fi finalizată ({}), folosim fallback deterministic.", e.getMessage());
        }
        return null;
    }

    public record CandidateEmailItem(
            int id,
            String sender,
            String subject,
            String bodySnippet
    ) {}

    public java.util.Map<Integer, ParsedJobEmail> classifyBatchWithAi(java.util.List<CandidateEmailItem> batch) {
        if (openAiLlmService == null || !openAiLlmService.isConfigured() || batch == null || batch.isEmpty()) {
            return java.util.Collections.emptyMap();
        }

        try {
            String systemPrompt = """
                    Ești un clasificator ATS strict. Analizează cele câteva emailuri numerotate și determină pentru FIECARE dacă este o comunicare de recrutare/candidatură a utilizatorului.
                    Răspunde STRICT cu un ARRAY JSON valid:
                    [
                      {
                        "id": 1,
                        "isRecruitment": boolean,
                        "company": "NumeCompanie sau null",
                        "jobTitle": "TitluRol sau null",
                        "status": "APPLIED" | "INTERVIEWING" | "REJECTED" | "OFFER_RECEIVED" | "NONE"
                      }
                    ]
                    REGULI PRECISE:
                    1. isRecruitment este true DOAR dacă candidatul a aplicat, este în interviu, este respins sau a primit ofertă de muncă.
                    2. isRecruitment este FALSE pentru: newslettere, alerte joburi recomandate, promoții/reduceri, confirmări comenzi/bănci.
                    3. status="OFFER_RECEIVED" se setează DOAR dacă este o ofertă oficială de muncă/contract. NICIODATĂ pentru reduceri, promoții sau respingeri ("nu vă putem oferi")!
                    4. status="INTERVIEWING" pentru invitație la interviu, screening call, teste tehnice.
                    5. status="REJECTED" pentru respingere/refuz.
                    6. status="APPLIED" pentru confirmare primire candidatură.
                    """;

            StringBuilder userPromptBuilder = new StringBuilder();
            for (CandidateEmailItem item : batch) {
                userPromptBuilder.append(String.format("ID %d:\nEXPEDITOR: %s\nSUBIECT: %s\nSNIPPET: %s\n\n",
                        item.id(), item.sender(), item.subject(), item.bodySnippet()));
            }

            // Generare compactă pentru întregul batch (max 1000 tokens)
            String aiJson = openAiLlmService.generateCompletion(systemPrompt, userPromptBuilder.toString().trim(), 1000, 0.0);
            if (aiJson != null && !aiJson.isBlank()) {
                String cleaned = aiJson.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode arrayNode = objectMapper.readTree(cleaned);
                if (arrayNode.isArray()) {
                    java.util.Map<Integer, ParsedJobEmail> resultMap = new java.util.HashMap<>();
                    for (JsonNode root : arrayNode) {
                        int id = root.path("id").asInt(-1);
                        boolean isRec = root.path("isRecruitment").asBoolean(false);
                        if (!isRec) {
                            resultMap.put(id, new ParsedJobEmail(false, null, null, null, "AI_REJECTED", null));
                            continue;
                        }

                        String statusStr = root.path("status").asText("APPLIED");
                        ApplicationStatus status = switch (statusStr.toUpperCase(Locale.ROOT)) {
                            case "OFFER_RECEIVED" -> ApplicationStatus.OFFER_RECEIVED;
                            case "INTERVIEWING" -> ApplicationStatus.INTERVIEWING;
                            case "REJECTED" -> ApplicationStatus.REJECTED;
                            default -> ApplicationStatus.APPLIED;
                        };

                        CandidateEmailItem origItem = batch.stream().filter(b -> b.id() == id).findFirst().orElse(null);
                        String origSubject = origItem != null ? origItem.subject() : "";
                        String origBody = origItem != null ? origItem.bodySnippet() : "";
                        String origSender = origItem != null ? origItem.sender() : "";

                        if (status == ApplicationStatus.OFFER_RECEIVED && FALSE_OFFER_PATTERN.matcher((origSubject + " " + origBody).toLowerCase(Locale.ROOT)).find()) {
                            status = ApplicationStatus.REJECTED;
                        }

                        String comp = root.path("company").asText(null);
                        if ("null".equalsIgnoreCase(comp) || comp == null || comp.isBlank()) {
                            comp = extractCompany(origSender, origSubject, origBody);
                        }

                        String title = root.path("jobTitle").asText(null);
                        if ("null".equalsIgnoreCase(title) || title == null || title.isBlank()) {
                            title = extractJobTitle(origSubject, origBody, comp);
                        }

                        String snippet = origSubject.length() > 80 ? origSubject.substring(0, 80) + "..." : origSubject;

                        resultMap.put(id, new ParsedJobEmail(
                                true,
                                comp != null ? cleanCompany(comp) : "Companie Parteneră",
                                title != null && !title.isBlank() ? title.trim() : (comp != null ? "Candidatură " + comp : "Candidatură Recrutare"),
                                status,
                                "AI_HIGH",
                                snippet
                        ));
                    }
                    return resultMap;
                }
            }
        } catch (Exception e) {
            log.warn("[AI EMAIL BATCH PARSER] Batch-ul AI nu a putut fi procesat ({}), se va folosi fallback deterministic.", e.getMessage());
        }
        return java.util.Collections.emptyMap();
    }

    private ParsedJobEmail parseDeterministic(String sender, String subject, String bodyText) {
        String subLower = subject.toLowerCase(Locale.ROOT);
        String bodyLower = bodyText.toLowerCase(Locale.ROOT);
        String senderLower = sender.toLowerCase(Locale.ROOT);
        String combined = subLower + " " + bodyLower;

        // 1. Verificare dacă este email legat de recrutare/candidaturi
        boolean isRecruitment = isRecruitmentEmail(senderLower, subLower, combined);
        if (!isRecruitment) {
            return new ParsedJobEmail(false, null, null, null, "NONE", null);
        }

        // 2. Clasificare Status (OFFER > INTERVIEWING > REJECTED > APPLIED)
        ApplicationStatus status = classifyStatus(subLower, bodyLower);

        // 3. Extragere Nume Companie
        String company = extractCompany(sender, subject, bodyText);

        // 4. Extragere Titlu Job
        String jobTitle = extractJobTitle(subject, bodyText, company);

        String snippet = subject.length() > 80 ? subject.substring(0, 80) + "..." : subject;

        return new ParsedJobEmail(
                true,
                company != null ? cleanCompany(company) : "Companie Parteneră",
                jobTitle != null && !jobTitle.isBlank() ? jobTitle.trim() : (company != null ? "Candidatură " + company : "Candidatură Recrutare"),
                status != null ? status : ApplicationStatus.APPLIED,
                company != null ? "HIGH" : "MEDIUM",
                snippet
        );
    }

    public ParsedJobEmail parseFastOrDeterministic(String sender, String subject, String bodyText) {
        if (isDefiniteNonRecruitmentEmail(sender, subject)) {
            return new ParsedJobEmail(false, null, null, null, "NONE", null);
        }

        ParsedJobEmail det = parseDeterministic(sender, subject, bodyText);
        // Daca este clar recrutare si am extras o companie valida, returnam direct cu 0 tokeni si 0 latenta AI
        if (det.isRecruitmentEmail() && det.companyName() != null 
                && !det.companyName().equalsIgnoreCase("Companie Partenera") 
                && !"NONE".equals(det.confidence())) {
            return det;
        }

        // Daca NU este recrutare conform analizei deterministe si nu are cuvinte de aplicare/interviu:
        if (!det.isRecruitmentEmail()) {
            return det; // Returneaza direct ca non-recrutare (0 tokeni, 0 latenta AI)
        }

        // Daca este recrutare si avem o companie (chiar fallback acceptabil), returnam tot deterministic
        if (det.isRecruitmentEmail() && det.companyName() != null && !det.companyName().isBlank()) {
            return det;
        }

        return null; // necesita analiza AI doar daca este intr-adevar ambiguu
    }

    public boolean isCandidateRecruitmentEmail(String sender, String subject, java.util.Set<String> knownCompanies) {
        if (sender == null) sender = "";
        if (subject == null) subject = "";

        // Eliminare instantanee daca se potriveste cu zgomot comercial, banci, facturi sau alerte
        if (isDefiniteNonRecruitmentEmail(sender, subject)) {
            return false;
        }

        String sLower = sender.toLowerCase(Locale.ROOT);
        String subLower = subject.toLowerCase(Locale.ROOT);

        // LinkedIn: doar aplicari / candidaturi autentice trimise, nu recomandari sau alerte
        if (sLower.contains("linkedin.com") || sLower.contains("linkedin")) {
            return subLower.contains("applied to") || subLower.contains("application to") || subLower.contains("application was sent")
                    || subLower.contains("application has been") || subLower.contains("aplicat la") || subLower.contains("candidatura ta")
                    || subLower.contains("interview") || subLower.contains("interviu");
        }

        // Platforme ATS internationale
        if (sLower.contains("greenhouse.io") || sLower.contains("lever.co") || sLower.contains("smartrecruiters.com")
                || sLower.contains("myworkday") || sLower.contains("workday") || sLower.contains("ashbyhq.com")
                || sLower.contains("taleo.net") || sLower.contains("icims.com") || sLower.contains("recruitee.com")
                || sLower.contains("workable.com") || sLower.contains("personio") || sLower.contains("bamboohr.com")
                || sLower.contains("breezy.hr") || sLower.contains("jobvite.com") || sLower.contains("join.com")) {
            return true;
        }

        // Platforme locale din Romania (eJobs, BestJobs, Hipo) - DOAR aplicari specifice ale utilizatorului
        if (sLower.contains("ejobs.ro") || sLower.contains("bestjobs.eu") || sLower.contains("hipo.ro")) {
            return (subLower.contains("ai aplicat") && !subLower.contains("joburi similare")) 
                    || subLower.contains("candidatura ta la")
                    || subLower.contains("aplicat cu succes") || subLower.contains("mesaj de la")
                    || subLower.contains("angajatorul a vizualizat") || subLower.contains("stadiul candidaturii")
                    || subLower.contains("interviu");
        }

        // Expeditor HR / Recrutare directa
        if (sLower.contains("recruiting@") || sLower.contains("recruitment@") || sLower.contains("recruiter@")
                || sLower.contains("careers@") || sLower.contains("cariere@") || sLower.contains("talent@")
                || sLower.contains("hiring@") || sLower.contains("jobs@") || sLower.contains("hr@")
                || sLower.contains("resurseumane@") || sLower.contains("resurse umane")) {
            return true;
        }

        // Subiect specific de recrutare/candidaturi
        if (subLower.contains("thank you for applying") || subLower.contains("application received")
                || subLower.contains("your application") || subLower.contains("candidatura ta a fost")
                || subLower.contains("am primit candidatura") || subLower.contains("invitatie la interviu")
                || subLower.contains("invitație la interviu") || subLower.contains("interviu tehnic")
                || subLower.contains("screening call") || subLower.contains("schedule an interview")
                || subLower.contains("programare interviu") || subLower.contains("oferta de angajare")
                || subLower.contains("ofertă de angajare") || subLower.contains("job offer")
                || subLower.contains("formal offer") || subLower.contains("statusul candidaturii")
                || subLower.contains("statusul aplicatiei") || subLower.contains("statusul aplicației")
                || subLower.contains("procesul de recrutare") || subLower.contains("multumim pentru aplicatie")
                || subLower.contains("mulțumim pentru aplicație") || subLower.contains("multumim pentru candidatura")
                || subLower.contains("mulțumim pentru candidatură") || subLower.contains("multumim pentru interesul acordat")
                || subLower.contains("mulțumim pentru interesul acordat") || subLower.contains("nu vom continua procesul")
                || subLower.contains("unfortunately") || subLower.contains("regretam sa te informam")
                || subLower.contains("regretăm să te informăm")) {
            return true;
        }

        // Companie existenta pe bordul utilizatorului - necesita context de recrutare pentru a nu potrivi alerte oarbe
        if (knownCompanies != null && !knownCompanies.isEmpty()) {
            String combinedText = sLower + " " + subLower;
            boolean hasJobKeyword = combinedText.contains("job") || combinedText.contains("cariere")
                    || combinedText.contains("career") || combinedText.contains("candidat")
                    || combinedText.contains("aplic") || combinedText.contains("apply")
                    || combinedText.contains("interview") || combinedText.contains("interviu")
                    || combinedText.contains("talent") || combinedText.contains("hiring")
                    || combinedText.contains("hr");

            if (hasJobKeyword) {
                for (String comp : knownCompanies) {
                    if (comp != null && comp.trim().length() >= 4) {
                        String clean = comp.toLowerCase(Locale.ROOT).trim();
                        if (combinedText.matches(".*\\b" + Pattern.quote(clean) + "\\b.*")) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    private boolean isRecruitmentEmail(String senderLower, String subLower, String combined) {
        if (senderLower.contains("linkedin.com") && (subLower.contains("applied") || subLower.contains("application") || subLower.contains("aplicat"))) return true;
        if (senderLower.contains("greenhouse.io") || senderLower.contains("lever.co") || senderLower.contains("smartrecruiters.com") || senderLower.contains("myworkday") || senderLower.contains("workday")) return true;
        if (senderLower.contains("ejobs.ro") || senderLower.contains("bestjobs.eu") || senderLower.contains("hipo.ro")) {
            return (subLower.contains("ai aplicat") && !subLower.contains("joburi similare")) 
                    || subLower.contains("candidatura ta") || subLower.contains("aplicat cu succes")
                    || subLower.contains("interviu") || subLower.contains("stadiul candidaturii");
        }
        if (senderLower.contains("ashbyhq.com") || senderLower.contains("taleo.net") || senderLower.contains("icims.com") || senderLower.contains("recruitee.com")) return true;

        return combined.contains("thank you for applying") || combined.contains("application received") ||
               combined.contains("candidatura ta") || combined.contains("am primit candidatura") ||
               combined.contains("invitation to interview") || combined.contains("invitatie la interviu") ||
               combined.contains("interviu tehnic") || combined.contains("job offer") ||
               combined.contains("oferta de angajare") || combined.contains("unfortunately") ||
               combined.contains("nu vom continua procesul") || combined.contains("screening call") ||
               combined.contains("schedule an interview");
    }

    private ApplicationStatus classifyStatus(String subLower, String bodyLower) {
        String combined = subLower + " " + bodyLower;

        // 0. Detectam daca este reclama BestJobs cu 'Bestie' sau survey / assessment feedback (NU este invitatie la interviu!)
        boolean isBestiePromo = combined.contains("bestie") || combined.contains("interviu video cu bestie")
                || combined.contains("inregistrarea unui interviu video")
                || combined.contains("înregistrarea unui interviu video");

        boolean isSurveyOrAssessment = combined.contains("sova assessment") || combined.contains("assessment experience")
                || combined.contains("track your") || combined.contains("online assessment")
                || combined.contains("survey");

        // 1. Respingere (Prioritate maxima daca contine clauze clare de respingere)
        boolean isRejection = combined.contains("unfortunately") || combined.contains("not moving forward")
                || combined.contains("not be moving forward") || combined.contains("nu vom continua")
                || combined.contains("regretam sa te informam") || combined.contains("regretăm să te informăm")
                || combined.contains("decided to move forward with other")
                || combined.contains("move forward with other candidates")
                || combined.contains("other candidates this time")
                || combined.contains("after careful consideration") || combined.contains("alti candidati")
                || combined.contains("alți candidați") || combined.contains("decided to proceed with")
                || combined.contains("candidatura ta nu a fost selectata") || combined.contains("nu a fost selectata")
                || combined.contains("nu a fost selectată") || combined.contains("nu va putem oferi")
                || combined.contains("nu vă putem oferi") || combined.contains("nu putem oferi")
                || combined.contains("unable to offer") || combined.contains("cannot offer");

        if (isRejection) {
            return ApplicationStatus.REJECTED;
        }

        // 2. Oferta de angajare (STRICTA: interzisa daca e respingere sau daca apare un context de oferta falsa sau newsletter)
        boolean hasGenuineOffer = (GENUINE_OFFER_PATTERN.matcher(combined).find()
                || ((subLower.contains("job offer") || subLower.contains("formal offer") || subLower.contains("contract de munca") || subLower.contains("contract de muncă"))
                    && !FALSE_OFFER_PATTERN.matcher(combined).find()))
                && !combined.contains("kickresume") && !combined.contains("tomas from kickresume");

        if (hasGenuineOffer) {
            return ApplicationStatus.OFFER_RECEIVED;
        }

        // 3. Invitatie reala la interviu / screening (Excludem e-mailurile care confirma doar aplicarea, survey-uri si promotiile Bestie)
        boolean isAppConfirmation = subLower.contains("ai aplicat cu succes") || subLower.contains("am primit candidatura")
                || subLower.contains("thank you for applying") || subLower.contains("application received")
                || subLower.contains("candidatura ta a fost trimisa") || subLower.contains("candidatura ta a fost trimisă")
                || subLower.contains("track your");

        boolean isActualInterview = !isBestiePromo && !isSurveyOrAssessment && !isAppConfirmation && (
                subLower.contains("invitatie la interviu") || subLower.contains("invitație la interviu")
                || subLower.contains("interview invitation") || subLower.contains("schedule an interview")
                || subLower.contains("programare interviu") || subLower.contains("interviu tehnic")
                || subLower.contains("screening call")
                || combined.contains("invitatie la interviu") || combined.contains("invitație la interviu")
                || combined.contains("invitation to interview") || combined.contains("schedule a call with")
                || combined.contains("schedule an interview") || combined.contains("interviu tehnic cu")
                || combined.contains("discutie tehnica") || combined.contains("discuție tehnică")
        );

        if (isActualInterview) {
            return ApplicationStatus.INTERVIEWING;
        }

        // 4. Confirmare aplicare (Default)
        return ApplicationStatus.APPLIED;
    }
    private String extractCompany(String sender, String subject, String bodyText) {
        if (sender == null) sender = "";
        if (subject == null) subject = "";
        if (bodyText == null) bodyText = "";

        // 0. Expeditor ATS direct cu identificator companie in local-part (ex: ing@myworkday.com, adobe@myworkday.com)
        Matcher workdayLocalMatcher = Pattern.compile("(?i)^<?([a-zA-Z0-9_-]{2,30})@(myworkday(?:jobs|service)?\\.com|workday\\.com|greenhouse\\.io|lever\\.co|smartrecruiters\\.com)").matcher(sender.trim());
        if (workdayLocalMatcher.find()) {
            String comp = workdayLocalMatcher.group(1).trim();
            if (isValidCompanyCandidate(comp)) {
                return comp.length() <= 4 ? comp.toUpperCase(Locale.ROOT) : capitalize(comp);
            }
        }

        // 1. Template: "Thanks for applying to [Company]!"
        Matcher mThanksTo = Pattern.compile("(?i)(?:thanks for applying to|thank you for applying to|application to)\\s+([A-Za-z0-9&.\\s-]{2,30}?)(?:!|\\s*[-–—|()]|$)").matcher(subject);
        if (mThanksTo.find()) {
            String cand = mThanksTo.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        // 2. Template recurent Workday/Taleo/Greenhouse: "Your [Company] Application to ..."
        Matcher yourAppMatcher = Pattern.compile("(?i)Your\\s+([A-Za-z0-9&.\\s-]{2,30}?)\\s+Application(?:\\s+to|\\s+has|\\s+was|\\s*$)").matcher(subject);
        if (yourAppMatcher.find()) {
            String cand = yourAppMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        // 3. LinkedIn specific: "Your application to X was sent / has been submitted"
        Matcher li1 = PATTERN_LINKEDIN_1.matcher(subject);
        if (li1.find()) {
            String cand = li1.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }
        Matcher li2 = PATTERN_LINKEDIN_2.matcher(subject);
        if (li2.find()) {
            String cand = li2.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        // 4. Template: "[Company] Group - New Job Application Received"
        Matcher mGroup = Pattern.compile("(?i)^([A-Za-z0-9&.\\s-]{2,30}?)\\s+(?:Group|Romania|GBS|Technologies|Services)?\\s*[-–—]\\s*(?:New Job Application|Application Received)").matcher(subject);
        if (mGroup.find()) {
            String cand = mGroup.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        // 5. Nume expeditor din campul "From" (ex: "Endava Careers <careers@endava.com>", "ING Recruitment Team <ing@...>")
        Matcher senderMatcher = Pattern.compile("(?i)\"?([A-Za-z0-9&.\\s-]{2,30})\\s*(?:careers|recruitment|talent|jobs|hr|echipa|team)?\"?\\s*<").matcher(sender);
        if (senderMatcher.find()) {
            String candidate = senderMatcher.group(1).trim();
            if (isValidCompanyCandidate(candidate)) {
                return cleanCompany(candidate);
            }
        }

        // 6. Domeniu expeditor direct (ex: no-reply@uipath.com -> UiPath)
        Matcher domainMatcher = Pattern.compile("(?i)@(?:jobs\\.|careers\\.|recruitment\\.)?([a-zA-Z0-9-]{3,25})\\.(?:com|ro|eu|org|net|io)").matcher(sender);
        if (domainMatcher.find()) {
            String domain = domainMatcher.group(1).trim();
            if (!isGenericAtsDomain(domain) && isValidCompanyCandidate(domain)) {
                return capitalize(domain);
            }
        }

        // 7. Cautare in corpul emailului (foarte de incredere pentru e-mailuri automate Workday/ATS):
        // ex: "position here at ING.", "team like ours at ING."
        Matcher bodyHereAt = Pattern.compile("(?i)(?:position|role|team like ours)\\s+here at\\s+([A-Za-z0-9&.\\s-]{2,30}?)(?:[\\r\\n,.]|$)").matcher(bodyText);
        if (bodyHereAt.find()) {
            String cand = bodyHereAt.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        Matcher bodyThanks = Pattern.compile("(?i)Thanks,\\s*([A-Za-z0-9&.\\s-]{2,30}?)\\s+(?:Recruitment|Hiring|Talent)\\s+Team").matcher(bodyText);
        if (bodyThanks.find()) {
            String cand = bodyThanks.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        Matcher bodyVisit = Pattern.compile("(?i)Visit\\s+([A-Za-z0-9&.\\s-]{2,30}?)\\s+Career Site").matcher(bodyText);
        if (bodyVisit.find()) {
            String cand = bodyVisit.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        // 8. Cautare in subiect: "applied to Adobe", "candidatura la Bitdefender"
        Matcher toMatcher = PATTERN_GENERIC_TO.matcher(subject);
        if (toMatcher.find()) {
            String cand = toMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        Matcher atMatcher = PATTERN_GENERIC_AT.matcher(subject);
        if (atMatcher.find()) {
            String cand = atMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        // 9. Cautare eJobs / BestJobs
        Matcher ejobsMatcher = PATTERN_EJOBS.matcher(subject);
        if (ejobsMatcher.find()) {
            String cand = ejobsMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cleanCompany(cand);
        }

        return null;
    }

    private String extractJobTitle(String subject, String bodyText) {
        return extractJobTitle(subject, bodyText, null);
    }

    private String extractJobTitle(String subject, String bodyText, String company) {
        if (subject == null) subject = "";
        if (bodyText == null) bodyText = "";

        // 1. Template Workday: "Your [Company] Application to [REQ-12345] [Job Title]"
        Matcher mWorkday = Pattern.compile("(?i)Your\\s+[A-Za-z0-9&.\\s-]+\\s+Application\\s+to\\s+(?:(?:REQ|JR|R|ID)[-_0-9]+\\s+)?([^–—|\\n\\r]+)").matcher(subject);
        if (mWorkday.find()) {
            String title = mWorkday.group(1).trim();
            if (isValidJobTitleCandidate(title)) {
                return cleanJobTitle(title);
            }
        }

        // 2. Cautare din corpul emailului:
        Matcher mBodyInterest = Pattern.compile("(?i)interest in the\\s+([^,\\n\\r.]+?)\\s+(?:position|role)\\s+here at").matcher(bodyText);
        if (mBodyInterest.find()) {
            String title = mBodyInterest.group(1).trim();
            if (isValidJobTitleCandidate(title)) return cleanJobTitle(title);
        }

        Matcher mBodyRole = Pattern.compile("(?i)(?:pentru|privind)\\s+(?:postul|pozi[tț]ia|rolul|candidatura pentru)\\s+de\\s+([^,\\n\\r.]+?)(?:\\s+(?:la|[iî]n cadrul)|[\\r\\n,.]|$)").matcher(bodyText);
        if (mBodyRole.find()) {
            String title = mBodyRole.group(1).trim();
            if (isValidJobTitleCandidate(title)) return cleanJobTitle(title);
        }

        // 3. Ex: BestJobs / eJobs: "Ai aplicat cu succes la jobul: Software Developer"
        Matcher mPlatform = Pattern.compile("(?i)(?:la jobul|la postul|la rolul)[:\\s]+\\s*([^–—|\\n\\r!]+)").matcher(subject + " " + bodyText);
        if (mPlatform.find()) {
            String title = mPlatform.group(1).trim();
            if (isValidJobTitleCandidate(title)) {
                return cleanJobTitle(title);
            }
        }

        // 4. Ex: "Your application for Junior Java Developer at Google"
        Matcher m1 = Pattern.compile("(?i)(?:application for|applied for|aplicat pentru|postul de|rolul de|pozi[tț]ia de|candidatura ta pentru)\\s+([^\\n\\r–—|()]+?)(?:\\s+(?:at|la|has been|a fost)|$)").matcher(subject);
        if (m1.find()) {
            String title = m1.group(1).trim();
            if (isValidJobTitleCandidate(title)) return cleanJobTitle(title);
        }

        // 5. Ex: "Interviu: Software Engineer - Microsoft"
        Matcher m2 = Pattern.compile("(?i)(?:interview|interviu)[:\\s-]+\\s*([^–—|-]+?)(?:\\s*[-–—|]|$)").matcher(subject);
        if (m2.find()) {
            String title = m2.group(1).trim();
            if (isValidJobTitleCandidate(title)) return cleanJobTitle(title);
        }

        // 6. Curatare directa a subiectului ca titlu de job fallback
        String cleanedSubject = cleanSubjectAsTitle(subject, company);
        if (cleanedSubject != null && isValidJobTitleCandidate(cleanedSubject) && cleanedSubject.length() <= 70) {
            return cleanedSubject;
        }

        return company != null && !company.isBlank() && !company.equalsIgnoreCase("Companie Partenera")
                ? "Candidatura " + company
                : "Candidatura Recrutare";
    }

    private boolean isValidJobTitleCandidate(String title) {
        if (title == null || title.length() < 3) return false;
        String t = title.toLowerCase(Locale.ROOT).trim();
        if (t.equalsIgnoreCase("software position") 
                || t.contains("cu succes la acest job")
                || t.contains("care ai aplicat")
                || t.contains("acest job")
                || t.startsWith("ati aplicat")
                || t.startsWith("ai aplicat")
                || t.startsWith("multumim pentru")) {
            return false;
        }
        return true;
    }

    private String cleanJobTitle(String raw) {
        if (raw == null) return "";
        return raw.replaceAll("(?i)^(?:REQ|JR|R|ID)[-_0-9]+\\s+", "")
                .replaceAll("[\"']", "")
                .trim();
    }

    private String cleanSubjectAsTitle(String subject, String company) {
        if (subject == null || subject.isBlank()) return null;
        String s = subject;
        s = s.replaceAll("(?i)^(?:\\[[^\\]]+\\]|Re:|Fwd:)\\s*", "");
        s = s.replaceAll("(?i)^(?:Your Application to|Thank you for applying to|Application received for|Candidatura ta la|Ai aplicat cu succes la)\\s*", "");
        if (company != null && !company.isBlank()) {
            s = s.replaceAll("(?i)\\b(?:at|la|to)\\s+" + Pattern.quote(company) + "\\b", "");
            s = s.replaceAll("(?i)\\b" + Pattern.quote(company) + "\\s+Application\\b", "");
        }
        s = s.replaceAll("(?i)\\s*[-–—|]\\s*(?:Application Received|Candidatura Trimisa|Succes)$", "");
        s = s.trim();
        return s.isBlank() ? null : s;
    }

    private boolean isGenericAtsDomain(String domain) {
        String d = domain.toLowerCase();
        return d.contains("greenhouse") || d.contains("lever") || d.contains("workday") ||
               d.contains("smartrecruiters") || d.contains("linkedin") || d.contains("ejobs") ||
               d.contains("bestjobs") || d.contains("hipo") || d.contains("gmail") ||
               d.contains("google") || d.contains("yahoo") || d.contains("outlook") ||
               d.contains("ashbyhq") || d.contains("taleo") || d.contains("icims");
    }

    private boolean isValidCompanyCandidate(String name) {
        if (name == null || name.length() < 2 || name.length() > 35) return false;
        String n = name.toLowerCase(Locale.ROOT).trim();

        // Excludem zgomot, expresii din limba romana, sisteme generice ATS si expeditori irelevanti
        if (n.contains("care ai aplicat") || n.contains("acest job") || n.startsWith("acest")
                || n.startsWith("jobul") || n.startsWith("la jobul") || n.contains("candidatur")
                || n.contains("aplicat") || n.contains("interviu") || n.contains("notification")
                || n.contains("no-reply") || n.contains("noreply") || n.contains("support")
                || n.contains("recruitment") || n.contains("careers") || n.contains("talent")
                || n.contains("hiring") || n.contains("interview") || n.contains("succes")
                || n.contains("hr system") || n.contains("your career") || n.contains("ashbyhq")
                || n.contains("greenhouse") || n.contains("smartrecruiters") || n.contains("myworkday")
                || n.equals("nicolas") || n.equals("tomas from kickresume") || n.equals("aleks gornik")
                || n.matches("^(?:req|jr|r|pos|job|id)[-_0-9]+.*")) {
            return false;
        }

        return true;
    }

    private String cleanCompany(String raw) {
        if (raw == null) return "Companie Partenera";
        return raw.replaceAll("(?i)\\b(?:s\\.r\\.l|srl|s\\.a\\.|sa|inc|ltd|corp|corporation|gmbh)\\b", "")
                .replaceAll("[\"']", "")
                .trim();
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
}
