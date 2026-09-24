package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.CoverLetterRequest;
import com.jobtracker.ats.dto.CoverLetterResponse;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class CoverLetterService {

    private final CvProfileRepository cvProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final OpenAiLlmService openAiLlmService;
    private final ObjectMapper objectMapper;

    private static final Pattern THINK_TAG_PATTERN = Pattern.compile("<think>[\\s\\S]*?</think>", Pattern.CASE_INSENSITIVE);

    public CoverLetterResponse generateCoverLetter(UUID userId, CoverLetterRequest request) {
        log.info("[COVER LETTER] Incepe generarea cover letter pentru userId={}, req={}", userId, request);

        // 1. Resolve Candidate Profile
        CvProfile profile = resolveCvProfile(userId, request.cvProfileId());

        String candidateName = coalesce(request.candidateName(), profile != null ? profile.getFullName() : null, "Candidat");
        String candidateEmail = coalesce(request.candidateEmail(), profile != null ? profile.getEmail() : null, "candidat@email.com");
        String candidatePhone = coalesce(request.candidatePhone(), profile != null ? profile.getPhone() : null, "+40 700 000 000");
        String candidateLocation = coalesce(request.candidateLocation(), profile != null ? profile.getLocation() : null, "București, România");
        String candidateLinkedin = profile != null ? profile.getLinkedin() : null;

        // 2. Resolve Job Details
        String companyName = request.companyName();
        String jobTitle = request.jobTitle();
        String jobDescription = request.jobDescription();

        if (request.applicationId() != null) {
            Application app = applicationRepository.findById(request.applicationId()).orElse(null);
            if (app != null && app.getJobPosting() != null) {
                if (companyName == null || companyName.isBlank()) companyName = app.getJobPosting().getCompanyName();
                if (jobTitle == null || jobTitle.isBlank()) jobTitle = app.getJobPosting().getJobTitle();
                if (jobDescription == null || jobDescription.isBlank()) jobDescription = app.getJobPosting().getRawDescription();
            }
        }

        companyName = coalesce(companyName, "Companie Parteneră");
        jobTitle = coalesce(jobTitle, "Software Engineer");
        jobDescription = coalesce(jobDescription, "Căutăm un profesionist dedicat, pasionat de tehnologie și capabil să livreze soluții de calitate.");

        // 3. Language & Date
        String language = resolveLanguage(request.languagePreference(), jobDescription);
        String letterDate = formatCurrentDate(language);

        // 4. Extract Candidate CV Context
        String cvSummary = profile != null && profile.getSummary() != null ? profile.getSummary() : "";
        String skillsAll = extractAllSkills(profile);
        String experienceSnippet = extractExperienceSnippet(profile);

        // 5. Try AI Generation with Groq
        if (openAiLlmService.isConfigured()) {
            try {
                CoverLetterResponse aiResponse = callAiForCoverLetter(
                        candidateName, candidateEmail, candidatePhone, candidateLocation, candidateLinkedin,
                        companyName, jobTitle, jobDescription, cvSummary, skillsAll, experienceSnippet,
                        language, request.tone(), letterDate
                );
                if (aiResponse != null && aiResponse.fullText() != null && !aiResponse.fullText().isBlank()) {
                    log.info("[COVER LETTER SUCCESS] Generat cu AI pentru compania '{}', rolul '{}'", companyName, jobTitle);
                    return aiResponse;
                }
            } catch (Exception e) {
                log.warn("[COVER LETTER WARN] Apelul AI a esuat: {}. Se foloseste generatorul determinist de fallback.", e.getMessage());
            }
        }

        // 6. Deterministic Fallback Generator (0 tokens, 100% reliable)
        log.info("[COVER LETTER] Rulare generator determinist (fallback) pentru '{}'", jobTitle);
        return buildDeterministicCoverLetter(
                candidateName, candidateEmail, candidatePhone, candidateLocation, candidateLinkedin,
                companyName, jobTitle, jobDescription, skillsAll, language, request.tone(), letterDate
        );
    }

    private CvProfile resolveCvProfile(UUID userId, UUID cvProfileId) {
        if (cvProfileId != null) {
            return cvProfileRepository.findById(cvProfileId).orElse(null);
        }
        if (userId != null) {
            return cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                    .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId))
                    .orElse(null);
        }
        return null;
    }

    private CoverLetterResponse callAiForCoverLetter(
            String candidateName, String candidateEmail, String candidatePhone, String candidateLocation, String candidateLinkedin,
            String companyName, String jobTitle, String jobDescription, String cvSummary, String skillsAll, String experienceSnippet,
            String language, String tone, String letterDate) throws Exception {

        String toneInstruction = switch (tone != null ? tone.toUpperCase() : "SIMPLE_DIRECT") {
            case "MODERN_TECH" -> "Ton modern, dinamic, orientat spre tehnologie, rezultate concrete și impact direct.";
            case "PROFESSIONAL" -> "Ton formal, impecabil profesional, politicos și structurat clasic.";
            default -> "Ton simplu, direct, concis și natural. Fără clișee corporatiste, fără fraze lungi și fără lingușeli artificiale.";
        };

        String systemPrompt = String.format("""
            You are an expert executive career coach and technical copywriter.
            Write a clean, concise, modern, and high-impact Cover Letter (Scrisoare de Intenție).

            CRITICAL GUIDELINES:
            1. SIMPLICITY & BREVITY FIRST: The user wants a clean, simple cover letter (max 220-280 words). No fluff, no filler, no corporate buzzwords.
            2. TONE: %s
            3. LANGUAGE: Output strictly in %s. If language is 'RO', write in fluent, natural Romanian (fără formulări arhaice). If 'EN', write in clear, modern English.
            4. MATCHING: Seamlessly connect the candidate's real skills and experience with the core requirements of the job description.
            5. STRUCTURE:
               - salutation: Polite greeting (e.g. 'Stimate Manager de Recrutare,' or 'Dear Hiring Team,')
               - openingParagraph: Direct hook mentioning the exact position at %s and why candidate's background is an immediate fit (2-3 sentences).
               - bodyParagraph1: Concrete technical skills and relevant achievements from the CV matching this specific job (3-4 sentences).
               - bodyParagraph2: Value proposition and why the candidate is enthusiastic about %s (2-3 sentences).
               - closingParagraph: Confident, professional invitation to an interview and contact availability (1-2 sentences).
               - signOff: 'Cu respect,' / 'Cu stimă,' (RO) or 'Sincerely,' (EN).
               - matchedSkills: Array of 3 to 6 key technical/soft skills from candidate's CV directly relevant to the role.

            Return ONLY valid JSON matching this exact structure (no markdown fences, no conversational text):
            {
              "recipientTitle": "Echipa de Recrutare",
              "subjectLine": "Candidatură: %s – %s",
              "salutation": "Stimate Manager de Recrutare,",
              "openingParagraph": "...",
              "bodyParagraph1": "...",
              "bodyParagraph2": "...",
              "closingParagraph": "...",
              "signOff": "Cu stimă,",
              "matchedSkills": ["Skill 1", "Skill 2", "Skill 3"]
            }
            """, toneInstruction, "RO".equalsIgnoreCase(language) ? "Romanian" : "English", companyName, companyName, jobTitle, candidateName);

        String userPrompt = String.format("""
            Candidate Information:
            - Name: %s
            - Email: %s | Phone: %s | Location: %s
            - Summary: %s
            - Skills: %s
            - Key Experience / Projects: %s

            Target Job:
            - Company: %s
            - Role / Title: %s
            - Job Description snippet:
            %s
            """, candidateName, candidateEmail, candidatePhone, candidateLocation, cvSummary, skillsAll, experienceSnippet,
                companyName, jobTitle, truncateText(jobDescription, 2000));

        String rawResponse = openAiLlmService.generateCompletion(systemPrompt, userPrompt, 1500, 0.3);
        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }

        String cleaned = cleanJsonFences(rawResponse);
        JsonNode root = objectMapper.readTree(cleaned);

        String recipientTitle = getText(root, "recipientTitle", "RO".equalsIgnoreCase(language) ? "Echipa de Recrutare" : "Hiring Team");
        String subjectLine = getText(root, "subjectLine",
                "RO".equalsIgnoreCase(language)
                        ? "Candidatură pentru poziția de " + jobTitle + " – " + candidateName
                        : "Application for " + jobTitle + " – " + candidateName);
        String salutation = getText(root, "salutation", "RO".equalsIgnoreCase(language) ? "Stimate Manager de Recrutare," : "Dear Hiring Manager,");
        String openingParagraph = getText(root, "openingParagraph", "");
        String bodyParagraph1 = getText(root, "bodyParagraph1", "");
        String bodyParagraph2 = getText(root, "bodyParagraph2", "");
        String closingParagraph = getText(root, "closingParagraph", "");
        String signOff = getText(root, "signOff", "RO".equalsIgnoreCase(language) ? "Cu stimă," : "Sincerely,");

        List<String> matchedSkills = new ArrayList<>();
        if (root.has("matchedSkills") && root.get("matchedSkills").isArray()) {
            for (JsonNode item : root.get("matchedSkills")) {
                if (item.isTextual() && !item.asText().isBlank()) {
                    matchedSkills.add(item.asText().trim());
                }
            }
        }

        String fullText = String.join("\n\n",
                candidateName + "\n" + candidateEmail + " • " + candidatePhone + " • " + candidateLocation +
                        (candidateLinkedin != null && !candidateLinkedin.isBlank() ? " • " + candidateLinkedin : ""),
                letterDate,
                recipientTitle + "\n" + companyName,
                subjectLine,
                salutation,
                openingParagraph,
                bodyParagraph1,
                bodyParagraph2,
                closingParagraph,
                signOff + "\n" + candidateName
        );

        return new CoverLetterResponse(
                candidateName,
                candidateEmail,
                candidatePhone,
                candidateLocation,
                candidateLinkedin,
                companyName,
                jobTitle,
                letterDate,
                recipientTitle,
                subjectLine,
                salutation,
                openingParagraph,
                bodyParagraph1,
                bodyParagraph2,
                closingParagraph,
                signOff,
                fullText,
                matchedSkills
        );
    }

    private CoverLetterResponse buildDeterministicCoverLetter(
            String candidateName, String candidateEmail, String candidatePhone, String candidateLocation, String candidateLinkedin,
            String companyName, String jobTitle, String jobDescription, String skillsAll,
            String language, String tone, String letterDate) {

        boolean isRo = "RO".equalsIgnoreCase(language);

        String recipientTitle = isRo ? "Echipa de Recrutare" : "Hiring Team";
        String subjectLine = isRo
                ? "Candidatură pentru rolul de " + jobTitle + " – " + candidateName
                : "Application for " + jobTitle + " – " + candidateName;
        String salutation = isRo ? "Stimate Manager de Recrutare," : "Dear Hiring Manager,";

        List<String> sampleSkills = extractTopMatchingSkills(skillsAll, jobDescription);
        String skillsListStr = !sampleSkills.isEmpty() ? String.join(", ", sampleSkills) : (isRo ? "dezvoltare software și rezolvare de probleme" : "software engineering and problem solving");

        String openingParagraph = isRo
                ? String.format("Vă transmit candidatura mea pentru poziția de %s în cadrul echipei %s. Cu un profil axat pe performanță și o experiență solidă în tehnologii moderne, sunt convins că pot aduce o contribuție valoroasă proiectelor dumneavoastră încă din prima zi.",
                jobTitle, companyName)
                : String.format("I am writing to express my strong interest in the %s position at %s. With a solid foundation in software development and hands-on technical problem solving, I am confident in my ability to quickly add value to your engineering team.",
                jobTitle, companyName);

        String bodyParagraph1 = isRo
                ? String.format("Privind cerințele rolului, competențele mele în %s se aliniază direct cu obiectivele echipei dumneavoastră. Am dezvoltat soluții software robuste, acordând o atenție deosebită calității codului, scalabilității și optimizării performanței. Învăț rapid cerințele de business și transform specificațiile complexe în funcționalități eficiente.",
                skillsListStr)
                : String.format("In reviewing the responsibilities for this role, my experience with %s aligns closely with your team's technical roadmap. I have consistently built reliable solutions prioritizing clean architecture, maintainability, and responsiveness, translating business requirements into scalable features.",
                skillsListStr);

        String bodyParagraph2 = isRo
                ? String.format("Apreciez în mod deosebit dinamismul și standardele companiei %s. Îmi doresc să lucrez alături de o echipă dedicată, unde colaborarea activă și dorința continuă de perfecționare fac diferența în succesul fiecărei lansări.",
                companyName)
                : String.format("What excites me most about %s is your commitment to high engineering standards and collaborative innovation. I thrive in environments where team members share knowledge and focus on delivering dependable results.",
                companyName);

        String closingParagraph = isRo
                ? "Aș aprecia oportunitatea de a discuta mai detaliat despre modul în care abilitățile mele pot susține planurile de dezvoltare ale companiei. Vă mulțumesc pentru timpul și atenția acordate candidaturii mele."
                : "I would welcome the opportunity to discuss in an interview how my skills and background can best support your upcoming initiatives. Thank you for your time and consideration.";

        String signOff = isRo ? "Cu stimă," : "Sincerely,";

        String fullText = String.join("\n\n",
                candidateName + "\n" + candidateEmail + " • " + candidatePhone + " • " + candidateLocation +
                        (candidateLinkedin != null && !candidateLinkedin.isBlank() ? " • " + candidateLinkedin : ""),
                letterDate,
                recipientTitle + "\n" + companyName,
                subjectLine,
                salutation,
                openingParagraph,
                bodyParagraph1,
                bodyParagraph2,
                closingParagraph,
                signOff + "\n" + candidateName
        );

        return new CoverLetterResponse(
                candidateName,
                candidateEmail,
                candidatePhone,
                candidateLocation,
                candidateLinkedin,
                companyName,
                jobTitle,
                letterDate,
                recipientTitle,
                subjectLine,
                salutation,
                openingParagraph,
                bodyParagraph1,
                bodyParagraph2,
                closingParagraph,
                signOff,
                fullText,
                sampleSkills
        );
    }

    private String resolveLanguage(String preference, String jobDescription) {
        if (preference != null && !preference.isBlank()) {
            return preference.trim().toUpperCase();
        }
        if (jobDescription != null) {
            String lower = jobDescription.toLowerCase();
            if (lower.contains("experien") || lower.contains("candidat") || lower.contains("cerin") || lower.contains("responsabilit")) {
                return "RO";
            }
        }
        return "RO";
    }

    private String formatCurrentDate(String language) {
        LocalDate now = LocalDate.now();
        if ("RO".equalsIgnoreCase(language)) {
            String[] monthsRo = {"Ianuarie", "Februarie", "Martie", "Aprilie", "Mai", "Iunie",
                    "Iulie", "August", "Septembrie", "Octombrie", "Noiembrie", "Decembrie"};
            return now.getDayOfMonth() + " " + monthsRo[now.getMonthValue() - 1] + " " + now.getYear();
        } else {
            return now.format(DateTimeFormatter.ofPattern("MMMM d, yyyy", Locale.ENGLISH));
        }
    }

    private String extractAllSkills(CvProfile profile) {
        if (profile == null) return "Java, Spring Boot, React, SQL, Git";
        List<String> list = new ArrayList<>();
        if (profile.getSkillsLanguages() != null && !profile.getSkillsLanguages().isBlank()) list.add(profile.getSkillsLanguages());
        if (profile.getSkillsFrameworks() != null && !profile.getSkillsFrameworks().isBlank()) list.add(profile.getSkillsFrameworks());
        if (profile.getSkillsDatabases() != null && !profile.getSkillsDatabases().isBlank()) list.add(profile.getSkillsDatabases());
        if (profile.getSkillsDevops() != null && !profile.getSkillsDevops().isBlank()) list.add(profile.getSkillsDevops());
        return String.join(", ", list);
    }

    private String extractExperienceSnippet(CvProfile profile) {
        if (profile == null || profile.getWorkExperienceJson() == null || profile.getWorkExperienceJson().isBlank()) {
            return "Software engineering experience building full stack web apps and REST APIs.";
        }
        return truncateText(profile.getWorkExperienceJson(), 1000);
    }

    private List<String> extractTopMatchingSkills(String skillsStr, String jobDescription) {
        if (skillsStr == null || skillsStr.isBlank()) return List.of("Java", "Spring Boot", "SQL", "Git");
        String[] tokens = skillsStr.split("[,;•\\n]+");
        List<String> matches = new ArrayList<>();
        String jdLower = jobDescription != null ? jobDescription.toLowerCase() : "";

        for (String t : tokens) {
            String skill = t.trim();
            if (skill.length() > 1 && jdLower.contains(skill.toLowerCase())) {
                matches.add(skill);
            }
        }
        if (matches.size() < 3) {
            for (String t : tokens) {
                String skill = t.trim();
                if (skill.length() > 1 && !matches.contains(skill)) {
                    matches.add(skill);
                    if (matches.size() >= 5) break;
                }
            }
        }
        return matches.stream().distinct().limit(6).toList();
    }

    private String cleanJsonFences(String raw) {
        String clean = THINK_TAG_PATTERN.matcher(raw).replaceAll("").trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    private String getText(JsonNode node, String fieldName, String fallback) {
        if (node.has(fieldName) && !node.get(fieldName).isNull()) {
            return node.get(fieldName).asText();
        }
        return fallback;
    }

    private String coalesce(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v.trim();
        }
        return "";
    }

    private String truncateText(String text, int maxChars) {
        if (text == null) return "";
        if (text.length() <= maxChars) return text;
        return text.substring(0, maxChars) + "...";
    }
}
