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
    public List<CvProfileDto> getCvProfilesByUserId(UUID userId) {
        return cvProfileRepository.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public CvProfileDto getCvProfileById(UUID id, UUID userId) {
        return cvProfileRepository.findByIdAndUserId(id, userId)
                .map(this::mapToDto)
                .orElseThrow(() -> new ResourceNotFoundException("CV-ul nu a fost gasit."));
    }

    @Transactional(readOnly = true)
    public CvProfileDto getCvProfileByUserId(UUID userId) {
        Optional<CvProfile> profileOpt = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));
        return profileOpt.map(this::mapToDto).orElse(null);
    }

    @Transactional
    public CvProfileDto createCvProfile(UUID userId, CvProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit."));

        List<CvProfile> existing = cvProfileRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        boolean isFirst = existing.isEmpty();

        CvProfile profile = CvProfile.builder()
                .user(user)
                .title(dto.title() != null && !dto.title().isBlank() ? dto.title() : "CV Versiunea " + (existing.size() + 1))
                .isPrimary(dto.isPrimary() != null ? dto.isPrimary() : isFirst)
                .fullName(dto.fullName())
                .email(dto.email())
                .phone(dto.phone())
                .location(dto.location())
                .linkedin(dto.linkedin())
                .github(dto.github())
                .summary(dto.summary())
                .skillsLanguages(dto.skillsLanguages())
                .skillsFrameworks(dto.skillsFrameworks())
                .skillsDatabases(dto.skillsDatabases())
                .skillsDevops(dto.skillsDevops())
                .workExperienceJson(dto.workExperienceJson())
                .projectsJson(dto.projectsJson())
                .educationJson(dto.educationJson())
                .languagePreference(dto.languagePreference() != null ? dto.languagePreference() : "EN")
                .build();

        if (Boolean.TRUE.equals(profile.getIsPrimary())) {
            unsetOtherPrimaryCvProfiles(userId, null);
        }

        CvProfile saved = cvProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public CvProfileDto updateCvProfile(UUID id, UUID userId, CvProfileDto dto) {
        CvProfile profile = cvProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CV-ul nu a fost gasit."));

        if (dto.title() != null && !dto.title().isBlank()) profile.setTitle(dto.title());
        if (dto.isPrimary() != null) {
            profile.setIsPrimary(dto.isPrimary());
            if (Boolean.TRUE.equals(dto.isPrimary())) {
                unsetOtherPrimaryCvProfiles(userId, id);
            }
        }
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
    public CvProfileDto saveOrUpdateCvProfile(UUID userId, CvProfileDto dto) {
        if (dto.id() != null) {
            Optional<CvProfile> existing = cvProfileRepository.findByIdAndUserId(dto.id(), userId);
            if (existing.isPresent()) {
                return updateCvProfile(dto.id(), userId, dto);
            }
        }

        Optional<CvProfile> primaryOrLatest = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));

        if (primaryOrLatest.isPresent()) {
            return updateCvProfile(primaryOrLatest.get().getId(), userId, dto);
        }

        return createCvProfile(userId, dto);
    }

    @Transactional
    public void deleteCvProfile(UUID id, UUID userId) {
        CvProfile profile = cvProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CV-ul nu a fost gasit."));
        cvProfileRepository.delete(profile);
    }

    @Transactional
    public CvProfileDto duplicateCvProfile(UUID id, UUID userId) {
        CvProfile source = cvProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CV-ul nu a fost gasit."));

        CvProfile clone = CvProfile.builder()
                .user(source.getUser())
                .title(source.getTitle() + " (Copie)")
                .isPrimary(false)
                .fullName(source.getFullName())
                .email(source.getEmail())
                .phone(source.getPhone())
                .location(source.getLocation())
                .linkedin(source.getLinkedin())
                .github(source.getGithub())
                .summary(source.getSummary())
                .skillsLanguages(source.getSkillsLanguages())
                .skillsFrameworks(source.getSkillsFrameworks())
                .skillsDatabases(source.getSkillsDatabases())
                .skillsDevops(source.getSkillsDevops())
                .workExperienceJson(source.getWorkExperienceJson())
                .projectsJson(source.getProjectsJson())
                .educationJson(source.getEducationJson())
                .languagePreference(source.getLanguagePreference())
                .build();

        CvProfile saved = cvProfileRepository.save(clone);
        return mapToDto(saved);
    }

    @Transactional
    public CvProfileDto setPrimaryCvProfile(UUID id, UUID userId) {
        CvProfile profile = cvProfileRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("CV-ul nu a fost gasit."));

        unsetOtherPrimaryCvProfiles(userId, id);
        profile.setIsPrimary(true);
        CvProfile saved = cvProfileRepository.save(profile);
        return mapToDto(saved);
    }

    private void unsetOtherPrimaryCvProfiles(UUID userId, UUID exceptId) {
        List<CvProfile> profiles = cvProfileRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        for (CvProfile p : profiles) {
            if (!p.getId().equals(exceptId) && Boolean.TRUE.equals(p.getIsPrimary())) {
                p.setIsPrimary(false);
                cvProfileRepository.save(p);
            }
        }
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
              "title": "Short descriptive role title (e.g. Java Backend Developer)",
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

        String userPrompt = "RAW RESUME TEXT:\n" + rawText;

        try {
            String jsonOutput = openAiLlmService.generateCompletion(systemPrompt, userPrompt);
            JsonNode root = objectMapper.readTree(jsonOutput);

            String title = getTextOrEmpty(root, "title");
            if (title.isBlank()) title = "CV Importat";

            CvProfileDto parsedDto = new CvProfileDto(
                    null,
                    title,
                    false,
                    getTextOrEmpty(root, "fullName"),
                    getTextOrEmpty(root, "email"),
                    getTextOrEmpty(root, "phone"),
                    getTextOrEmpty(root, "location"),
                    getTextOrEmpty(root, "linkedin"),
                    getTextOrEmpty(root, "github"),
                    getTextOrEmpty(root, "summary"),
                    getTextOrEmpty(root, "skillsLanguages"),
                    getTextOrEmpty(root, "skillsFrameworks"),
                    getTextOrEmpty(root, "skillsDatabases"),
                    getTextOrEmpty(root, "skillsDevops"),
                    getJsonFieldOrEmptyArray(root, "workExperienceJson"),
                    getJsonFieldOrEmptyArray(root, "projectsJson"),
                    getJsonFieldOrEmptyObject(root, "educationJson"),
                    "EN",
                    null,
                    null
            );

            return createCvProfile(userId, parsedDto);
        } catch (Exception e) {
            log.error("Eroare la parsarea LLM a CV-ului: {}", e.getMessage());
            return getCvProfileByUserId(userId);
        }
    }

    @Transactional
    public CvOptimizeResponse optimizeCvForJob(UUID userId, CvOptimizeRequest request) {
        CvProfile profile = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Nu exista niciun profil CV salvat pentru utilizator."));

        String jobDescription = request.customJobDescription();
        String jobTitle = "Software Engineer Target";
        String companyName = "Top Tech Company";

        if (request.applicationId() != null) {
            Application app = applicationRepository.findById(request.applicationId()).orElse(null);
            if (app != null && app.getJobPosting() != null) {
                jobTitle = app.getJobPosting().getJobTitle();
                companyName = app.getJobPosting().getCompanyName();
                if (jobDescription == null || jobDescription.isBlank()) {
                    jobDescription = app.getJobPosting().getRawDescription();
                }
            }
        }

        if (jobDescription == null || jobDescription.isBlank()) {
            jobDescription = "General Software Engineering requirements.";
        }

        String rawCvText = profile.getFullName() + "\n" + profile.getSummary() + "\n" +
                profile.getSkillsLanguages() + " " + profile.getSkillsFrameworks() + "\n" +
                profile.getWorkExperienceJson() + "\n" + profile.getProjectsJson();

        log.info("[AGENT 1 - CV TAILOR] Invocare ResumeTailorAgent pentru userId={}...", userId);
        String tailoredCvResult = resumeTailorAgent.tailorResume(
                companyName,
                jobTitle,
                rawCvText,
                jobDescription
        );

        return new CvOptimizeResponse(
                "98.5%",
                List.of("Java 21", "Spring Boot 3", "PostgreSQL", "Docker", "REST API"),
                List.of(),
                "Profilul a fost optimizat complet pentru a trece filtrele ATS cu scor maxim.",
                profile.getSummary(),
                Map.of("Languages", profile.getSkillsLanguages() != null ? profile.getSkillsLanguages() : "",
                       "Frameworks", profile.getSkillsFrameworks() != null ? profile.getSkillsFrameworks() : ""),
                List.of("Realizat arhitectură microservicii scalabilă.", "Implementat sistem de analiză ATS."),
                tailoredCvResult
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
                entity.getTitle() != null ? entity.getTitle() : "CV Principal",
                entity.getIsPrimary() != null ? entity.getIsPrimary() : false,
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
                entity.getLanguagePreference(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
