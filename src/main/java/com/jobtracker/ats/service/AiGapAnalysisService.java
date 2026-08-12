package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiGapAnalysisService {

    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final VectorEmbeddingService vectorEmbeddingService;
    private final OpenAiLlmService llmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // FILTRU STRICT PENTRU CUVINTE DE ZGOMOT (HR, VERBE, BENEFICII, DISCLAIMERE)
    private static final Set<String> NON_TECH_NOISE_WORDS = Set.of(
            "HANDS", "BUILDING", "DEVELOPING", "ENSURING", "COLLABORATING", "MANAGING", "INVESTIGATING",
            "PROVIDING", "DOCUMENTING", "USING", "DESIRED", "MINIMUM", "QUALITY", "BENEFITS", "PRIVATE",
            "OPPORTUNITIES", "MEAL", "ANNUAL", "COLLABORATIVE", "SAFE", "DIRECT", "WORK", "ONLY", "PRIVACY",
            "NOTICE", "CANDIDATI", "ER_NOTA", "RESPONSIBILITIES", "RESPONSABILITIES", "EXPERIENCE", "INTERMEDIATE",
            "DEGREE", "BACHELOR", "COMPUTER", "SCIENCE", "UNIVERSITY", "ROMANIA"
    );

    @Transactional(readOnly = true)
    public AiGapAnalysisResponse generateAnalysis(UUID applicationId) {
        return generateGapAnalysis(applicationId);
    }

    @Transactional(readOnly = true)
    public AiGapAnalysisResponse generateGapAnalysis(UUID applicationId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicatia cu ID-ul " + applicationId + " nu a fost gasita."));

        JobPosting job = application.getJobPosting();
        if (job == null || job.getRawDescription() == null || job.getRawDescription().isBlank()) {
            throw new ResourceNotFoundException("Descrierea jobului este lipsa sau invalida.");
        }

        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtAsc(application.getUser().getId());
        if (userResumes.isEmpty()) {
            throw new ResourceNotFoundException("Nu s-a gasit niciun CV incarcat pentru acest utilizator. Va rugam sa incarcati un CV.");
        }

        Resume resume = userResumes.getLast();
        String resumeText = resume.getRawText();

        if (resumeText == null || resumeText.isBlank()) {
            throw new ResourceNotFoundException("CV-ul incarcat nu contine text extras valid.");
        }

        // 1. Calcul Similitudine Vectoriala
        float[] jobVector = vectorEmbeddingService.generateEmbedding(job.getRawDescription());
        float[] cvVector = vectorEmbeddingService.generateEmbedding(resumeText);
        double vectorScore = vectorEmbeddingService.calculateCosineSimilarity(jobVector, cvVector);

        // 2. Extragere si Comparare Dinamica de Skill-uri Tehnice prin AI LLM cu Recunoastere de Sinonime (Groq Llama 3.3 70B JSON)
        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        try {
            String systemPrompt = """
                Esti un Recruiter Senior Tehnic si Parser ATS de Elita.
                Sarcina ta este sa extragi SKILL-URILE TEHNICE REALE din descrierea jobului si sa le compari inteligent cu CV-ul candidatului, tinand cont de ECHIVALENTE SI SINONIME TEHNICE.
                
                REGULI INTELEPTE DE MATCHING (SINONIME TEHNICE):
                1. Daca CV-ul contine "PostgreSQL" sau "MySQL", considera "Relational Databases SQL" ca fiind MATCHING (si poti recomanda adaugarea termenului exact SQL langa baza de date).
                2. Daca CV-ul contine "Unit Testing", iar jobul cere "JUnit 5", considera "Unit Testing (JUnit 5)" ca fiind MATCHING.
                3. Daca CV-ul contine "Spring Boot", considera "Spring Framework / Microservices" ca fiind MATCHING.
                
                REGULI STRICTE DE FORMATING:
                1. EXCLUDE complet cuvintele de zgomot HR: verbe (Developing, Building, Ensuring), beneficii (Meal Vouchers, Benefits) sau disclaimere.
                2. PASTREAZA CONCEPTELE COMPUSE IMPREUNA: ex "Spring Security", "Relational Databases", "Medallion Architecture", "Databricks".
                3. FARA diacritice, FARA emoticoane, FARA markdown.
                4. Raspunde EXCLUSIV in format JSON valid cu cheile "matchingSkills" si "missingSkills".

                Exemplu JSON raspuns:
                {
                  "matchingSkills": ["Java 21", "Spring Boot", "PostgreSQL (Relational Databases SQL)", "Unit Testing (JUnit 5)"],
                  "missingSkills": ["Docker", "Kubernetes", "Databricks", "Redis"]
                }
                """;

            String userPrompt = "JOB DESCRIPTION:\n" + job.getRawDescription() + "\n\nCV CANDIDAT:\n" + resumeText;
            
            String aiJsonResult = llmService.generateCompletion(systemPrompt, userPrompt);
            log.info("[AI DEBUG JSON GAP ANALYSIS] Raspuns AI primit: {}", aiJsonResult);

            if (aiJsonResult != null && !aiJsonResult.isBlank()) {
                String cleanJson = aiJsonResult.replaceAll("```json", "").replaceAll("```", "").trim();
                JsonNode root = objectMapper.readTree(cleanJson);

                if (root.has("matchingSkills") && root.get("matchingSkills").isArray()) {
                    for (JsonNode node : root.get("matchingSkills")) {
                        String skill = cleanSkill(node.asText());
                        if (isValidTechSkill(skill) && !matchingSkills.contains(skill)) {
                            matchingSkills.add(skill);
                        }
                    }
                }

                if (root.has("missingSkills") && root.get("missingSkills").isArray()) {
                    for (JsonNode node : root.get("missingSkills")) {
                        String skill = cleanSkill(node.asText());
                        if (isValidTechSkill(skill) && !missingSkills.contains(skill) && !matchingSkills.contains(skill)) {
                            missingSkills.add(skill);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.warn("[AI GAP ANALYSIS JSON PARSE ERROR] Nu s-au putut parsa skill-urile JSON via LLM: {}", e.getMessage());
        }

        // Fallback inteligent daca AI-ul nu a returnat raspuns valid
        if (matchingSkills.isEmpty() && missingSkills.isEmpty()) {
            fallbackSkillExtraction(job.getRawDescription(), resumeText, matchingSkills, missingSkills);
        }

        // 3. Generare Raport Text Curat Fara Zgomot
        String cleanReportText = generateCleanReportText(job.getCompanyName(), job.getJobTitle(), matchingSkills, missingSkills, vectorScore);

        return new AiGapAnalysisResponse(
                UUID.randomUUID(),
                applicationId,
                matchingSkills,
                missingSkills,
                cleanReportText,
                OffsetDateTime.now()
        );
    }

    private String cleanSkill(String skill) {
        if (skill == null) return "";
        return skill.trim().toUpperCase();
    }

    private boolean isValidTechSkill(String skill) {
        if (skill == null || skill.isBlank() || skill.length() < 2) return false;
        if (NON_TECH_NOISE_WORDS.contains(skill)) return false;
        return true;
    }

    private void fallbackSkillExtraction(String jobDesc, String cvText, List<String> matching, List<String> missing) {
        List<String> knownTechs = List.of(
                "JAVA", "SPRING BOOT", "SPRING SECURITY", "POSTGRESQL", "PYTHON", "DOCKER", "KUBERNETES",
                "REST API", "SQL", "DATABRICKS", "AZURE", "GIT", "JUNIT", "HIBERNATE", "REDIS", "RABBITMQ"
        );
        String jobLower = jobDesc.toLowerCase();
        String cvLower = cvText.toLowerCase();

        for (String tech : knownTechs) {
            if (jobLower.contains(tech.toLowerCase())) {
                if (cvLower.contains(tech.toLowerCase())) {
                    if (!matching.contains(tech)) matching.add(tech);
                } else {
                    if (!missing.contains(tech)) missing.add(tech);
                }
            }
        }
    }

    private String generateCleanReportText(String company, String title, List<String> matching, List<String> missing, double vectorScore) {
        StringBuilder sb = new StringBuilder();
        sb.append("Analiza ATS pentru pozitia: ").append(title).append(" la ").append(company).append("\n");
        sb.append("Scor de potrivire semantica vectorial: ").append(String.format("%.2f", vectorScore)).append("%\n\n");
        
        sb.append("Tehnologii identificate in CV:\n");
        if (matching.isEmpty()) {
            sb.append("- Nu s-au detectat potriviri pe tehnologiile principale.\n");
        } else {
            matching.forEach(s -> sb.append("- ").append(s).append("\n"));
        }

        sb.append("\nTehnologii cerute in job dar lipsa in CV:\n");
        if (missing.isEmpty()) {
            sb.append("- CV-ul acopera cerintele tehnice identificate.\n");
        } else {
            missing.forEach(s -> sb.append("- ").append(s).append("\n"));
        }

        return sb.toString();
    }
}
