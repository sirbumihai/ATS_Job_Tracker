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

    // 1. Zgomot comercial / marketing / finante / comenzi (0 tokens - eliminare instantanee)
    private static final Pattern NON_RECRUITMENT_PATTERN = Pattern.compile(
            "(?i)\\b(?:factur[aă]|invoice|chitan[tț][aă]|comanda ta|awb|curier|sameday|fan courier|" +
            "dpd|gls|livrare|tracking number|revolut|banca transilvania|ing bank|raiffeisen|bcr|brd|" +
            "paypal|extras de cont|card de credit|imprumut|credit nevoi personale|" +
            "superbet|betano|unibet|pacanele|cazinou|" +
            "reducere|reducerea de|voucher|cod promotional|promo[tț]ie|black friday|" +
            "oferta s[aă]pt[aă]m[aă]nii|ofert[aă] special[aă]|ofert[aă] exclusiv[aă]|discount|cashback|" +
            "abonament|re[iî]nnoire abonament|netflix|spotify|youtube premium|google cloud alert|" +
            "security alert|codul t[aă]u de securitate|resetare parol[aă]|confirm[aă] contul|" +
            "who viewed your profile|a vizualizat profilul|a ad[aă]ugat un articol|" +
            "job alert|alert[aă] de joburi|noi joburi pentru tine|jobs you may be interested in|" +
            "recomandate pentru tine|top oportunit[aă][tț]i|newsletter|dezabonare|unsubscribe)\\b"
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

            // Generare compactă (max 120 tokens, temperature 0.0) pentru cost minim și viteză instantanee
            String aiJson = openAiLlmService.generateCompletion(systemPrompt, userPrompt, 120, 0.0);
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
                    title = extractJobTitle(subject, bodySnippet);
                }

                String snippet = subject.length() > 80 ? subject.substring(0, 80) + "..." : subject;

                return new ParsedJobEmail(
                        true,
                        comp != null ? cleanCompany(comp) : "Companie Parteneră",
                        title != null && !title.isBlank() ? title.trim() : "Software Position",
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
        String jobTitle = extractJobTitle(subject, bodyText);

        String snippet = subject.length() > 80 ? subject.substring(0, 80) + "..." : subject;

        return new ParsedJobEmail(
                true,
                company != null ? cleanCompany(company) : "Companie Parteneră",
                jobTitle != null && !jobTitle.isBlank() ? jobTitle.trim() : "Software Position",
                status != null ? status : ApplicationStatus.APPLIED,
                company != null ? "HIGH" : "MEDIUM",
                snippet
        );
    }

    public boolean isCandidateRecruitmentEmail(String sender, String subject, java.util.Set<String> knownCompanies) {
        if (sender == null) sender = "";
        if (subject == null) subject = "";

        // Eliminare instantanee dacă se potrivește cu zgomot comercial, bănci, facturi sau alerte
        if (isDefiniteNonRecruitmentEmail(sender, subject)) {
            return false;
        }

        String sLower = sender.toLowerCase(Locale.ROOT);
        String subLower = subject.toLowerCase(Locale.ROOT);

        // LinkedIn: doar aplicări / candidaturi, nu alerte sau recomandări săptămânale de joburi
        if (sLower.contains("linkedin.com")) {
            return subLower.contains("applied") || subLower.contains("application") || subLower.contains("aplicat")
                    || subLower.contains("candidat") || subLower.contains("interview") || subLower.contains("interviu");
        }

        // Platforme ATS internaționale
        if (sLower.contains("greenhouse.io") || sLower.contains("lever.co") || sLower.contains("smartrecruiters.com")
                || sLower.contains("myworkday") || sLower.contains("workday") || sLower.contains("ashbyhq.com")
                || sLower.contains("taleo.net") || sLower.contains("icims.com") || sLower.contains("recruitee.com")
                || sLower.contains("workable.com") || sLower.contains("personio") || sLower.contains("bamboohr.com")
                || sLower.contains("breezy.hr") || sLower.contains("jobvite.com") || sLower.contains("join.com")) {
            return true;
        }

        // Platforme locale din România (eJobs, BestJobs, Hipo) - excludem alertele de joburi generice
        if (sLower.contains("ejobs.ro") || sLower.contains("bestjobs.eu") || sLower.contains("hipo.ro")) {
            if (subLower.contains("alert") || subLower.contains("recomandat") || subLower.contains("newsletter")) {
                return false;
            }
            return true;
        }

        // Expeditor HR / Recrutare
        if (sLower.contains("recruiting") || sLower.contains("recruitment") || sLower.contains("recruiter")
                || sLower.contains("careers") || sLower.contains("cariere") || sLower.contains("talent")
                || sLower.contains("hiring") || sLower.contains("jobs@") || sLower.contains("hr@")
                || sLower.contains("hr.") || sLower.contains("people team") || sLower.contains("resurse umane")) {
            return true;
        }

        // Subiect relevant pentru candidaturi / interviuri / oferte / respingeri
        if (subLower.contains("applied") || subLower.contains("application") || subLower.contains("aplicat")
                || subLower.contains("aplicație") || subLower.contains("aplicatie") || subLower.contains("candidat")
                || subLower.contains("candidatur") || subLower.contains("interview") || subLower.contains("interviu")
                || subLower.contains("screening") || subLower.contains("job offer") || subLower.contains("oferta de angajare")
                || subLower.contains("ofertă de angajare") || subLower.contains("postul de") || subLower.contains("rolul de")
                || subLower.contains("career opportunity") || subLower.contains("unfortunately") || subLower.contains("regretam")
                || subLower.contains("regretăm") || subLower.contains("nu vom continua") || subLower.contains("thank you for applying")
                || subLower.contains("am primit candidatura") || subLower.contains("multumim pentru") || subLower.contains("mulțumim pentru")
                || subLower.contains("assessment") || subLower.contains("codility") || subLower.contains("hackerrank")
                || subLower.contains("recruitment") || subLower.contains("recrutare") || subLower.contains("next steps")
                || subLower.contains("statusul candidaturii") || subLower.contains("procesul de recrutare")) {
            return true;
        }

        // Companie existentă pe bordul utilizatorului
        if (knownCompanies != null && !knownCompanies.isEmpty()) {
            for (String comp : knownCompanies) {
                if (comp != null && comp.trim().length() >= 3) {
                    String clean = comp.toLowerCase(Locale.ROOT).trim();
                    if (sLower.contains(clean) || subLower.contains(clean)) {
                        return true;
                    }
                }
            }
        }

        return false;
    }

    private boolean isRecruitmentEmail(String senderLower, String subLower, String combined) {
        if (senderLower.contains("linkedin.com") && (subLower.contains("applied") || subLower.contains("application") || subLower.contains("aplicat"))) return true;
        if (senderLower.contains("greenhouse.io") || senderLower.contains("lever.co") || senderLower.contains("smartrecruiters.com") || senderLower.contains("myworkday") || senderLower.contains("workday")) return true;
        if (senderLower.contains("ejobs.ro") || senderLower.contains("bestjobs.eu") || senderLower.contains("hipo.ro")) return true;
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

        // Verificăm dacă este respingere (sau mențiune că nu putem oferi o poziție)
        boolean isRejection = combined.contains("unfortunately") || combined.contains("not moving forward")
                || combined.contains("not be moving forward") || combined.contains("nu vom continua")
                || combined.contains("regretam sa te informam") || combined.contains("regretăm să te informăm")
                || combined.contains("after careful consideration") || combined.contains("other candidates")
                || combined.contains("alți candidați") || combined.contains("alti candidati")
                || combined.contains("decided to proceed with") || combined.contains("candidatura ta nu a fost selectata")
                || combined.contains("nu a fost selectată") || combined.contains("nu a fost selectata")
                || combined.contains("nu vă putem oferi") || combined.contains("nu va putem oferi")
                || combined.contains("nu putem oferi") || combined.contains("unable to offer")
                || combined.contains("cannot offer");

        // 1. Ofertă de angajare (STRICTĂ: interzisă dacă e respingere sau dacă apare un context de ofertă falsă)
        boolean hasGenuineOffer = GENUINE_OFFER_PATTERN.matcher(combined).find()
                || ((subLower.contains("job offer") || subLower.contains("formal offer") || subLower.contains("contract de muncă") || subLower.contains("contract de munca"))
                    && !FALSE_OFFER_PATTERN.matcher(combined).find());

        if (hasGenuineOffer && !isRejection) {
            return ApplicationStatus.OFFER_RECEIVED;
        }

        // 2. Invitație la interviu / screening
        if (subLower.contains("interview") || subLower.contains("interviu") || subLower.contains("screening call")
                || combined.contains("invitation to interview") || combined.contains("invitatie la interviu")
                || combined.contains("invitație la interviu") || combined.contains("schedule a call")
                || combined.contains("schedule an interview") || combined.contains("programare interviu")
                || combined.contains("technical interview") || combined.contains("interviu tehnic")
                || combined.contains("discutie tehnica") || combined.contains("video call")
                || combined.contains("availability for a chat") || combined.contains("next round")) {
            return ApplicationStatus.INTERVIEWING;
        }

        // 3. Respingere
        if (isRejection) {
            return ApplicationStatus.REJECTED;
        }

        // 4. Confirmare aplicare (Default)
        return ApplicationStatus.APPLIED;
    }

    private String extractCompany(String sender, String subject, String bodyText) {
        // A. Căutare din expeditori tip Workday / Greenhouse (ex: "Endava Careers <careers@endava.com>")
        Matcher senderMatcher = Pattern.compile("(?i)\"?([A-Za-z0-9&.\\s-]{2,30})\\s*(?:careers|recruitment|talent|jobs|hr)?\"?\\s*<").matcher(sender);
        if (senderMatcher.find()) {
            String candidate = senderMatcher.group(1).trim();
            if (isValidCompanyCandidate(candidate)) {
                return candidate;
            }
        }

        // B. Căutare din domeniu expeditor (ex: no-reply@uipath.com -> UiPath)
        Matcher domainMatcher = Pattern.compile("(?i)@(?:jobs\\.|careers\\.|recruitment\\.)?([a-zA-Z0-9-]{3,25})\\.(?:com|ro|eu|org|net|io)").matcher(sender);
        if (domainMatcher.find()) {
            String domain = domainMatcher.group(1).trim();
            if (!isGenericAtsDomain(domain) && isValidCompanyCandidate(domain)) {
                return capitalize(domain);
            }
        }

        // C. Căutare în subiect: "Your application to Microsoft", "Applied to Adobe"
        Matcher toMatcher = PATTERN_GENERIC_TO.matcher(subject);
        if (toMatcher.find()) {
            String cand = toMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cand;
        }

        // D. Căutare în subiect: "... at Google", "... la Bitdefender"
        Matcher atMatcher = PATTERN_GENERIC_AT.matcher(subject);
        if (atMatcher.find()) {
            String cand = atMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cand;
        }

        // E. Căutare eJobs / BestJobs
        Matcher ejobsMatcher = PATTERN_EJOBS.matcher(subject);
        if (ejobsMatcher.find()) {
            String cand = ejobsMatcher.group(1).trim();
            if (isValidCompanyCandidate(cand)) return cand;
        }

        return null;
    }

    private String extractJobTitle(String subject, String bodyText) {
        // Ex: "Your application for Junior Java Developer at Google"
        Matcher m1 = Pattern.compile("(?i)(?:application for|applied for|aplicat pentru|postul de|rolul de)\\s+([^\\n\\r–—|()]+?)(?:\\s+(?:at|la|has been|a fost)|$)").matcher(subject);
        if (m1.find()) {
            return m1.group(1).trim();
        }

        // Ex: "Interviu: Software Engineer - Microsoft"
        Matcher m2 = Pattern.compile("(?i)(?:interview|interviu)[:\\s-]+\\s*([^–—|-]+?)(?:\\s*[-–—|]|$)").matcher(subject);
        if (m2.find()) {
            return m2.group(1).trim();
        }

        return "Software Position";
    }

    private boolean isGenericAtsDomain(String domain) {
        String d = domain.toLowerCase();
        return d.contains("greenhouse") || d.contains("lever") || d.contains("workday") ||
               d.contains("smartrecruiters") || d.contains("linkedin") || d.contains("ejobs") ||
               d.contains("bestjobs") || d.contains("hipo") || d.contains("gmail") ||
               d.contains("google") || d.contains("yahoo") || d.contains("outlook");
    }

    private boolean isValidCompanyCandidate(String name) {
        if (name == null || name.length() < 2 || name.length() > 35) return false;
        String n = name.toLowerCase();
        return !n.contains("notification") && !n.contains("no-reply") && !n.contains("noreply") &&
               !n.contains("support") && !n.contains("recruitment") && !n.contains("careers") &&
               !n.contains("talent") && !n.contains("hiring") && !n.contains("candidatura") &&
               !n.contains("application") && !n.contains("interview");
    }

    private String cleanCompany(String raw) {
        if (raw == null) return "Companie Parteneră";
        return raw.replaceAll("(?i)\\b(?:s\\.r\\.l|srl|s\\.a\\.|sa|inc|ltd|corp|corporation|gmbh)\\b", "")
                .replaceAll("[\"']", "")
                .trim();
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        return Character.toUpperCase(text.charAt(0)) + text.substring(1);
    }
}
