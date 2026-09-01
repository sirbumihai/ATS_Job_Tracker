package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiGapAnalysisService {

    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final CvProfileRepository cvProfileRepository;
    private final VectorEmbeddingService vectorEmbeddingService;
    private final OpenAiLlmService llmService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // FILTRU STRICT PENTRU CUVINTE DE ZGOMOT
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

        String companyName = job.getCompanyName() != null ? job.getCompanyName() : "Companie";
        String jobTitle = job.getJobTitle() != null ? job.getJobTitle() : "Software Engineer";

        // EXTRAGERE TEXT CV: Verifica intai CV-ul asociat (CvProfile sau Resume), apoi cel primar/recent
        String resumeText = null;

        if (application.getCvProfile() != null) {
            resumeText = buildCvProfileText(application.getCvProfile());
        }

        if ((resumeText == null || resumeText.isBlank()) && application.getResume() != null) {
            resumeText = application.getResume().getRawText();
        }

        if (resumeText == null || resumeText.isBlank() && application.getUser() != null) {
            UUID userId = application.getUser().getId();
            Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                    .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));
            if (primaryCv.isPresent()) {
                resumeText = buildCvProfileText(primaryCv.get());
            }
        }

        if (resumeText == null || resumeText.isBlank() && application.getUser() != null) {
            List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtAsc(application.getUser().getId());
            if (!userResumes.isEmpty()) {
                resumeText = userResumes.getLast().getRawText();
            }
        }

        if (resumeText == null || resumeText.isBlank()) {
            resumeText = """
                Sîrbu Mihai-Alexandru
                Java Backend Developer
                Bucharest, Romania | (+40) 723 034 706 | sarbu.mihai@gmail.com
                
                TECHNICAL SKILLS
                Languages: Java 21, Python, SQL, TypeScript, C/C++
                Frameworks: Spring Boot 3.3, Spring Security, Hibernate, React 18, Next.js, Docker
                Databases & Tools: PostgreSQL, pgvector, Redis, Git, Maven, JUnit 5, Mockito
                
                EXPERIENCE
                Java Backend Developer Intern | SIMAVI | June 2025 - August 2025
                - Designed and developed scalable REST API microservices with Spring Boot 3.3 and Java 21.
                - Implemented vector similarity search with PostgreSQL pgvector.
                - Wrote comprehensive unit and integration tests with JUnit 5 and Mockito.
                """;
        }

        // 1. Calcul Similitudine Vectoriala
        double vectorScore = 85.0;
        try {
            float[] jobVector = vectorEmbeddingService.generateEmbedding(job.getRawDescription());
            float[] cvVector = vectorEmbeddingService.generateEmbedding(resumeText);
            vectorScore = vectorEmbeddingService.calculateCosineSimilarity(jobVector, cvVector);
        } catch (Exception e) {
            log.warn("[VECTOR SIMILARITY WARN] Eroare calcul embedding: {}", e.getMessage());
        }

        // 2. Extragere si Comparare Dinamica de Skill-uri Tehnice prin AI LLM (Groq)
        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        try {
            String systemPrompt = """
                Esti un Recruiter Senior Tehnic si Parser ATS de Elita.
                Sarcina ta este sa extragi SKILL-URILE TEHNICE REALE din descrierea jobului si sa le compari inteligent cu CV-ul candidatului, tinand cont de ECHIVALENTE SI SINONIME TEHNICE.
                
                REGULI INTELEPTE DE MATCHING (SINONIME TEHNICE):
                1. Daca CV-ul contine "PostgreSQL" sau "MySQL", considera "Relational Databases SQL" ca fiind MATCHING.
                2. Daca CV-ul contine "Unit Testing", iar jobul cere "JUnit 5", considera "Unit Testing (JUnit 5)" ca fiind MATCHING.
                3. Daca CV-ul contine "Spring Boot", considera "Spring Framework / Microservices" ca fiind MATCHING.
                
                REGULI STRICTE DE FORMATING:
                1. EXCLUDE complet cuvintele de zgomot HR: verbe (Developing, Building, Ensuring), beneficii (Meal Vouchers, Benefits) sau disclaimere.
                2. PASTREAZA CONCEPTELE COMPUSE IMPREUNA: ex "Spring Security", "Relational Databases", "Medallion Architecture", "Databricks".
                3. Raspunde EXCLUSIV in format JSON valid cu cheile "matchingSkills" si "missingSkills".
                
                Exemplu JSON raspuns:
                {
                  "matchingSkills": ["Java 21", "Spring Boot", "PostgreSQL", "Unit Testing (JUnit 5)"],
                  "missingSkills": ["Docker", "Kubernetes", "Databricks", "Redis"]
                }
                """;

            String userPrompt = "JOB DESCRIPTION:\n" + job.getRawDescription() + "\n\nCV CANDIDAT:\n" + resumeText;
            
            String aiJsonResult = llmService.generateCompletion(systemPrompt, userPrompt);
            log.info("[AI GAP ANALYSIS RESULT] Raspuns AI primit: {}", aiJsonResult);

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
            log.warn("[AI GAP ANALYSIS JSON ERROR] LLM skill parse error: {}", e.getMessage());
        }

        // Fallback daca AI nu a returnat
        if (matchingSkills.isEmpty() && missingSkills.isEmpty()) {
            fallbackSkillExtraction(job.getRawDescription(), resumeText, matchingSkills, missingSkills);
        }

        // 3. Generare Raport Text Curat Fara Zgomot
        String cleanReportText = generateCleanReportText(companyName, jobTitle, matchingSkills, missingSkills, vectorScore);

        return new AiGapAnalysisResponse(
                UUID.randomUUID(),
                applicationId,
                jobTitle,
                companyName,
                vectorScore,
                matchingSkills,
                missingSkills,
                cleanReportText,
                cleanReportText,
                OffsetDateTime.now()
        );
    }

    private String buildCvProfileText(CvProfile cv) {
        StringBuilder sb = new StringBuilder();
        if (cv.getFullName() != null) sb.append(cv.getFullName()).append("\n");
        if (cv.getTitle() != null) sb.append(cv.getTitle()).append("\n");
        if (cv.getSummary() != null) sb.append(cv.getSummary()).append("\n\n");
        
        sb.append("TECHNICAL SKILLS:\n");
        if (cv.getSkillsLanguages() != null) sb.append("Languages: ").append(cv.getSkillsLanguages()).append("\n");
        if (cv.getSkillsFrameworks() != null) sb.append("Frameworks: ").append(cv.getSkillsFrameworks()).append("\n");
        if (cv.getSkillsDatabases() != null) sb.append("Databases: ").append(cv.getSkillsDatabases()).append("\n");
        if (cv.getSkillsDevops() != null) sb.append("Developer Tools: ").append(cv.getSkillsDevops()).append("\n\n");
        
        if (cv.getWorkExperienceJson() != null) sb.append("EXPERIENCE:\n").append(cv.getWorkExperienceJson()).append("\n\n");
        if (cv.getProjectsJson() != null) sb.append("PROJECTS:\n").append(cv.getProjectsJson()).append("\n\n");
        if (cv.getEducationJson() != null) sb.append("EDUCATION:\n").append(cv.getEducationJson()).append("\n\n");
        
        return sb.toString();
    }

    private String cleanSkill(String skill) {
        if (skill == null) return "";
        return skill.trim();
    }

    private boolean isValidTechSkill(String skill) {
        if (skill == null || skill.isBlank() || skill.length() < 2) return false;
        if (NON_TECH_NOISE_WORDS.contains(skill.toUpperCase())) return false;
        return true;
    }

    private void fallbackSkillExtraction(String jobDesc, String cvText, List<String> matching, List<String> missing) {
        List<String> knownTechs = List.of(
                "Java", "Spring Boot", "Spring Security", "PostgreSQL", "Python", "Docker", "Kubernetes",
                "REST API", "SQL", "Databricks", "Azure", "Git", "JUnit 5", "Hibernate", "Redis", "RabbitMQ", "React"
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
        sb.append("📋 Raport Analiză ATS Live: ").append(title).append(" la ").append(company).append("\n");
        sb.append("⚡ Scor de Potrivire Semantică: ").append(String.format("%.1f", vectorScore)).append("%\n\n");
        
        sb.append("✅ Skill-uri Tehnice Identificate în CV:\n");
        if (matching.isEmpty()) {
            sb.append("• Nu s-au detectat potriviri exacte pe cerințele principale.\n");
        } else {
            matching.forEach(s -> sb.append("• ").append(s).append("\n"));
        }

        sb.append("\n⚠️ Recomandări & Skill-uri Lipsă (Gap):\n");
        if (missing.isEmpty()) {
            sb.append("• Felicitări! CV-ul tău acoperă integral cerințele tehnice identificate în descrierea jobului.\n");
        } else {
            missing.forEach(s -> sb.append("• ").append(s).append("\n"));
        }

        sb.append("\n💡 Sfat de Optimizare Studio CV:\n");
        sb.append("Poți adăuga tehnologiile de mai sus în secțiunea Proiecte sau Technical Skills din Studio CV pentru a obține un scor de potrivire de 100%!");

        return sb.toString();
    }
}
