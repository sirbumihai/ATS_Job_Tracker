package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.CvProfileDto;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class CvProfileService {

    private final CvProfileRepository cvProfileRepository;
    private final UserRepository userRepository;
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
