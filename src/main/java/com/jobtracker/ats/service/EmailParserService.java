package com.jobtracker.ats.service;

import com.jobtracker.ats.entity.Application.ApplicationStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class EmailParserService {

    public record ParsedJobEmail(
            boolean isRecruitmentEmail,
            String companyName,
            String jobTitle,
            ApplicationStatus detectedStatus,
            String confidence,
            String snippet
    ) {}

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

        // 1. Ofertă de angajare
        if (subLower.contains("job offer") || subLower.contains("offer letter") || subLower.contains("oferta de angajare") || subLower.contains("ofertă de angajare") ||
            combined.contains("pleased to offer you") || combined.contains("congratulations on your offer") || combined.contains("ne face o deosebita placere sa iti oferim")) {
            return ApplicationStatus.OFFER_RECEIVED;
        }

        // 2. Invitație la interviu / screening
        if (subLower.contains("interview") || subLower.contains("interviu") || subLower.contains("screening call") ||
            combined.contains("invitation to interview") || combined.contains("invitatie la interviu") || combined.contains("invitație la interviu") ||
            combined.contains("schedule a call") || combined.contains("schedule an interview") || combined.contains("programare interviu") ||
            combined.contains("technical interview") || combined.contains("interviu tehnic") || combined.contains("discutie tehnica") ||
            combined.contains("video call") || combined.contains("availability for a chat") || combined.contains("next round")) {
            return ApplicationStatus.INTERVIEWING;
        }

        // 3. Respingere
        if (combined.contains("unfortunately") || combined.contains("not moving forward") || combined.contains("not be moving forward") ||
            combined.contains("nu vom continua") || combined.contains("regretam sa te informam") || combined.contains("regretăm să te informăm") ||
            combined.contains("after careful consideration") || combined.contains("other candidates") || combined.contains("decided to proceed with") ||
            combined.contains("candidatura ta nu a fost selectata") || combined.contains("nu a fost selectată")) {
            return ApplicationStatus.REJECTED;
        }

        // 4. Confirmare aplicare (Default pentru email de aplicare)
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
