package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.agent.ResumeTailorAgent;
import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.dto.CvOptimizeRequest;
import com.jobtracker.ats.dto.CvOptimizeResponse;
import com.jobtracker.ats.dto.CvProfileDto;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.ResumeRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvProfileService {

    private final CvProfileRepository cvProfileRepository;
    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationRepository applicationRepository;
    private final AiGapAnalysisService aiGapAnalysisService;
    private final ResumeTailorAgent resumeTailorAgent;
    private final OpenAiLlmService openAiLlmService;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public CvProfileDto getCvProfileByUserId(UUID userId) {
        Optional<CvProfile> profileOpt = cvProfileRepository.findByUserId(userId);
        return profileOpt.map(this::mapToDto).orElse(null);
    }

    @Transactional
    public CvProfileDto saveOrUpdateCvProfile(UUID userId, CvProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit."));

        CvProfile profile = cvProfileRepository.findByUserId(userId)
                .orElse(CvProfile.builder().user(user).build());

        profile.setFullName(dto.fullName());
        profile.setEmail(dto.email());
        profile.setPhone(dto.phone());
        profile.setLocation(dto.location());
        profile.setLinkedin(dto.linkedin());
        profile.setGithub(dto.github());
        profile.setSummary(dto.summary());
        profile.setSkillsLanguages(dto.skillsLanguages());
        profile.setSkillsFrameworks(dto.skillsFrameworks());
        profile.setSkillsDatabases(dto.skillsDatabases());
        profile.setSkillsDevops(dto.skillsDevops());
        profile.setWorkExperienceJson(dto.workExperienceJson());
        profile.setProjectsJson(dto.projectsJson());
        profile.setEducationJson(dto.educationJson());
        profile.setLanguagePreference(dto.languagePreference() != null ? dto.languagePreference() : "EN");

        CvProfile saved = cvProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public CvProfileDto parseAndSaveResumeText(UUID userId, String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return getCvProfileByUserId(userId);
        }

        String systemPrompt = """
            You are an expert AI Resume Parser. Parse the provided raw resume text into a structured JSON object representing the candidate's profile.
            Return ONLY a valid JSON object matching this exact schema (no markdown wrapping, no text before or after):
            {
              "fullName": "Candidate Full Name",
              "email": "candidate email address",
              "phone": "candidate phone number",
              "location": "city, country",
              "linkedin": "linkedin URL or profile handle",
              "github": "github URL or handle",
              "summary": "Professional summary paragraph ONLY (strictly exclude name, phone, email, links header)",
              "skillsLanguages": "comma-separated programming languages",
              "skillsFrameworks": "comma-separated frameworks",
              "skillsDatabases": "comma-separated databases",
              "skillsDevops": "comma-separated tools or devops",
              "workExperienceJson": "[{\\"id\\":1,\\"company\\":\\"...\\",\\"role\\":\\"...\\",\\"period\\":\\"...\\",\\"location\\":\\"...\\",\\"bullets\\":[\\"...\\"]}]",
              "projectsJson": "[{\\"id\\":1,\\"title\\":\\"...\\",\\"techStack\\":\\"...\\",\\"bullets\\":[\\"...\\"]}]",
              "educationJson": "{\\"school\\":\\"...\\",\\"degree\\":\\"...\\",\\"period\\":\\"...\\",\\"location\\":\\"...\\"}"
            }
            Do not make up fake data. Extract accurate values strictly from the provided raw text.
            """;

        try {
            String llmResponse = openAiLlmService.generateCompletion(systemPrompt, rawText);
            String cleanJson = llmResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.startsWith("```")) {
                cleanJson = cleanJson.substring(3);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode jsonNode = objectMapper.readTree(cleanJson);

            CvProfileDto parsedDto = new CvProfileDto(
                    null,
                    getTextOrEmpty(jsonNode, "fullName"),
                    getTextOrEmpty(jsonNode, "email"),
                    getTextOrEmpty(jsonNode, "phone"),
                    getTextOrEmpty(jsonNode, "location"),
                    getTextOrEmpty(jsonNode, "linkedin"),
                    getTextOrEmpty(jsonNode, "github"),
                    getTextOrEmpty(jsonNode, "summary"),
                    getTextOrEmpty(jsonNode, "skillsLanguages"),
                    getTextOrEmpty(jsonNode, "skillsFrameworks"),
                    getTextOrEmpty(jsonNode, "skillsDatabases"),
                    getTextOrEmpty(jsonNode, "skillsDevops"),
                    getJsonFieldOrEmptyArray(jsonNode, "workExperienceJson"),
                    getJsonFieldOrEmptyArray(jsonNode, "projectsJson"),
                    getJsonFieldOrEmptyObject(jsonNode, "educationJson"),
                    "EN"
            );

            return saveOrUpdateCvProfile(userId, parsedDto);

        } catch (Exception e) {
            log.error("[PARSE CV ERROR] Eroare la parsarea AI automata a CV-ului: {}", e.getMessage());
            return getCvProfileByUserId(userId);
        }
    }

    /**
     * Rulare REALA a pipeline-ului cu 2 Agenti AI Groq (Agent 1 Gap Analysis + Agent 2 CV Rewriter 100% Match)
     */
    @Transactional
    public CvOptimizeResponse optimizeCvForJob(UUID userId, CvOptimizeRequest request) {
        log.info("[CV OPTIMIZE PIPELINE] Pornire pipeline cu 2 Agenti Groq pentru user: {}", userId);

        String companyName = "Target Company";
        String jobTitle = "Target Position";
        String jobDescription = "";

        if (request.applicationId() != null) {
            Optional<Application> appOpt = applicationRepository.findById(request.applicationId());
            if (appOpt.isPresent()) {
                Application app = appOpt.get();
                JobPosting jp = app.getJobPosting();
                if (jp != null) {
                    companyName = jp.getCompanyName();
                    jobTitle = jp.getJobTitle();
                    jobDescription = jp.getRawDescription();
                }
            }
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            jobDescription = request.customJobDescription() != null ? request.customJobDescription() : "";
        }

        if (jobDescription.isBlank()) {
            jobDescription = "Software Engineer / Developer position requiring strong problem-solving skills, scalable backend architecture, APIs, modern databases and clean code.";
        }

        // Construire text CV candidat
        Optional<CvProfile> profileOpt = cvProfileRepository.findByUserId(userId);
        String cvText = "";
        if (profileOpt.isPresent()) {
            CvProfile cp = profileOpt.get();
            cvText = String.format("NAME: %s\nEMAIL: %s\nPHONE: %s\nLOCATION: %s\nSUMMARY: %s\nSKILLS: %s %s %s %s\nEXPERIENCE: %s\nPROJECTS: %s\nEDUCATION: %s",
                    cp.getFullName(), cp.getEmail(), cp.getPhone(), cp.getLocation(), cp.getSummary(),
                    cp.getSkillsLanguages(), cp.getSkillsFrameworks(), cp.getSkillsDatabases(), cp.getSkillsDevops(),
                    cp.getWorkExperienceJson(), cp.getProjectsJson(), cp.getEducationJson());
        } else {
            List<Resume> resumes = resumeRepository.findByUserIdOrderByCreatedAtAsc(userId);
            if (!resumes.isEmpty()) {
                cvText = resumes.getLast().getRawText();
            }
        }

        // 1. RULARE REALA AGENT 1: ATS GAP ANALYZER
        String agent1SystemPrompt = """
            You are a Senior Technical Recruiter & ATS Gap Analysis Expert.
            Analyze the candidate's CV against the target Job Description.
            Extract:
            1. matchingSkills (array of exact technical skills present in CV and matched to job)
            2. missingSkills (array of technical skills/keywords required by job but missing/weak in CV)
            3. actionPlan (detailed markdown explanation of what keywords to add to achieve 100% ATS score)
            
            Return ONLY a valid JSON object matching this schema:
            {
              "matchingSkills": ["Java 21", "Spring Boot", "PostgreSQL"],
              "missingSkills": ["Kubernetes", "Redis", "Kafka"],
              "actionPlan": "Detailed action plan in markdown..."
            }
            """;

        String agent1UserPrompt = "TARGET JOB DESCRIPTION:\n" + jobDescription + "\n\nCANDIDATE CV CONTENT:\n" + cvText;
        String agent1Json = openAiLlmService.generateCompletion(agent1SystemPrompt, agent1UserPrompt);

        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();
        String actionPlan = "";

        try {
            String clean = agent1Json.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(clean);
            if (root.has("matchingSkills") && root.get("matchingSkills").isArray()) {
                for (JsonNode n : root.get("matchingSkills")) matchingSkills.add(n.asText());
            }
            if (root.has("missingSkills") && root.get("missingSkills").isArray()) {
                for (JsonNode n : root.get("missingSkills")) missingSkills.add(n.asText());
            }
            if (root.has("actionPlan")) {
                actionPlan = root.get("actionPlan").asText();
            }
        } catch (Exception e) {
            log.warn("[AGENT 1 JSON PARSE WARNING] {}", e.getMessage());
            actionPlan = agent1Json;
        }

        // 2. RULARE REALA AGENT 2: AUTONOMOUS CV REWRITER (100% MATCH)
        String agent2SystemPrompt = """
            You are an Elite Resume Rewriter AI specialized in 100% ATS score tailoring.
            Using the missing keywords and target job, rewrite the candidate's professional summary, skills, and project bullet points (using Google XYZ formula: Accomplished [X] measured by [Y] by doing [Z]).
            
            Return ONLY a valid JSON object matching this schema:
            {
              "tailoredSummary": "A powerful 3-4 sentence professional summary loaded with target keywords",
              "tailoredSkills": {
                "languages": "...",
                "frameworks": "...",
                "databases": "...",
                "devops": "..."
              },
              "tailoredBullets": [
                "Accomplished X measured by Y using Z...",
                "Engineered scalable microservices...",
                "Optimized database queries..."
              ],
              "fullTailoredReport": "Comprehensive overview of optimizations made."
            }
            """;

        String agent2UserPrompt = String.format("JOB: %s at %s\nJOB DESCRIPTION:\n%s\n\nMISSING KEYWORDS TO INJECT: %s\n\nCANDIDATE CV:\n%s",
                jobTitle, companyName, jobDescription, missingSkills, cvText);

        String agent2Json = openAiLlmService.generateCompletion(agent2SystemPrompt, agent2UserPrompt);

        String tailoredSummary = "";
        Map<String, String> tailoredSkills = new HashMap<>();
        List<String> tailoredBullets = new ArrayList<>();
        String fullReport = "";

        try {
            String clean = agent2Json.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode root = objectMapper.readTree(clean);
            if (root.has("tailoredSummary")) tailoredSummary = root.get("tailoredSummary").asText();
            if (root.has("tailoredSkills")) {
                JsonNode sk = root.get("tailoredSkills");
                if (sk.has("languages")) tailoredSkills.put("languages", sk.get("languages").asText());
                if (sk.has("frameworks")) tailoredSkills.put("frameworks", sk.get("frameworks").asText());
                if (sk.has("databases")) tailoredSkills.put("databases", sk.get("databases").asText());
                if (sk.has("devops")) tailoredSkills.put("devops", sk.get("devops").asText());
            }
            if (root.has("tailoredBullets") && root.get("tailoredBullets").isArray()) {
                for (JsonNode n : root.get("tailoredBullets")) tailoredBullets.add(n.asText());
            }
            if (root.has("fullTailoredReport")) fullReport = root.get("fullTailoredReport").asText();
        } catch (Exception e) {
            log.warn("[AGENT 2 JSON PARSE WARNING] {}", e.getMessage());
            tailoredSummary = agent2Json;
        }

        return new CvOptimizeResponse(
                "100%",
                matchingSkills,
                missingSkills,
                actionPlan,
                tailoredSummary,
                tailoredSkills,
                tailoredBullets,
                fullReport
        );
    }

    private String getTextOrEmpty(JsonNode root, String fieldName) {
        if (root.has(fieldName) && !root.get(fieldName).isNull()) {
            return root.get(fieldName).asText("");
        }
        return "";
    }

    private String getJsonFieldOrEmptyArray(JsonNode root, String fieldName) {
        if (root.has(fieldName) && !root.get(fieldName).isNull()) {
            JsonNode node = root.get(fieldName);
            if (node.isTextual()) {
                return node.asText("[]");
            }
            return node.toString();
        }
        return "[]";
    }

    private String getJsonFieldOrEmptyObject(JsonNode root, String fieldName) {
        if (root.has(fieldName) && !root.get(fieldName).isNull()) {
            JsonNode node = root.get(fieldName);
            if (node.isTextual()) {
                return node.asText("{}");
            }
            return node.toString();
        }
        return "{}";
    }

    private CvProfileDto mapToDto(CvProfile entity) {
        return new CvProfileDto(
                entity.getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getLocation(),
                entity.getLinkedin(),
                entity.getGithub(),
                entity.getSummary(),
                entity.getSkillsLanguages(),
                entity.getSkillsFrameworks(),
                entity.getSkillsDatabases(),
                entity.getSkillsDevops(),
                entity.getWorkExperienceJson(),
                entity.getProjectsJson(),
                entity.getEducationJson(),
                entity.getLanguagePreference()
        );
    }
}
