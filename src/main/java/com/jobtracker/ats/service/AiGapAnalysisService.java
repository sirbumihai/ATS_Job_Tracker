package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.entity.AiGapAnalysis;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.AiGapAnalysisRepository;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiGapAnalysisService {

    private final AiGapAnalysisRepository aiGapAnalysisRepository;
    private final ApplicationRepository applicationRepository;
    private final ResumeRepository resumeRepository;
    private final VectorEmbeddingService vectorEmbeddingService;
    private final OpenAiLlmService openAiLlmService;

    private static final List<String> COMMON_TECH_SKILLS = List.of(
            "java", "spring", "spring boot", "postgresql", "sql", "docker", "git", "rest", 
            "junit", "mockito", "python", "aws", "kubernetes", "microservices", "hibernate", "jpa"
    );

    @Transactional
    public AiGapAnalysisResponse generateAnalysis(UUID applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicația cu ID-ul " + applicationId + " nu a fost găsită."));

        JobPosting job = app.getJobPosting();
        Resume resume = app.getResume();

        // Dacă aplicația nu avea atașat un CV, căutăm ultimul CV încărcat în sistem
        if (resume == null && app.getUser() != null) {
            List<Resume> userResumes = resumeRepository.findByUserId(app.getUser().getId());
            if (!userResumes.isEmpty()) {
                resume = userResumes.get(userResumes.size() - 1);
                app.setResume(resume);
                applicationRepository.saveAndFlush(app);
            }
        }

        String resumeText = resume != null ? resume.getRawText() : "Candidat cu experiență în Java, Spring Boot, PostgreSQL, Git, Docker, REST API.";
        String jobText = job.getRawDescription();

        // 1. Calculăm Vector Embeddings Semantice Reale cu 384 Dimensiuni
        float[] resumeVector = vectorEmbeddingService.generateEmbedding(resumeText);
        float[] jobVector = vectorEmbeddingService.generateEmbedding(jobText);
        double semanticSimilarity = vectorEmbeddingService.calculateCosineSimilarity(resumeVector, jobVector);

        log.info("🧠 [PGVECTOR & AI ENGINE] Calculated real 384-dim Cosine Similarity: {}%", 
                String.format("%.2f", semanticSimilarity));

        // 2. Apelăm serviciul LLM Real (Groq Llama 3.3 / OpenAI)
        String markdownPlan = openAiLlmService.generateRealAiGapReport(
                job.getCompanyName(), 
                job.getJobTitle(), 
                resumeText, 
                jobText
        );

        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : COMMON_TECH_SKILLS) {
            boolean inJob = jobText.toLowerCase().contains(skill);
            boolean inResume = resumeText.toLowerCase().contains(skill);

            if (inJob && inResume) {
                matchingSkills.add(skill.toUpperCase());
            } else if (inJob && !inResume) {
                missingSkills.add(skill.toUpperCase());
            }
        }

        if (markdownPlan == null) {
            markdownPlan = generateCleanMarkdownPlan(
                    job.getCompanyName(), 
                    job.getJobTitle(), 
                    matchingSkills, 
                    missingSkills, 
                    semanticSimilarity
            );
        }

        AiGapAnalysis analysis = aiGapAnalysisRepository.findByApplicationId(applicationId)
                .orElseGet(() -> AiGapAnalysis.builder().application(app).build());

        analysis.setActionPlanMarkdown(markdownPlan);

        AiGapAnalysis savedAnalysis = aiGapAnalysisRepository.saveAndFlush(analysis);

        return new AiGapAnalysisResponse(
                savedAnalysis.getId(),
                app.getId(),
                matchingSkills,
                missingSkills,
                savedAnalysis.getActionPlanMarkdown(),
                savedAnalysis.getGeneratedAt()
        );
    }

    @Transactional(readOnly = true)
    public AiGapAnalysisResponse getAnalysisByApplicationId(UUID applicationId) {
        AiGapAnalysis analysis = aiGapAnalysisRepository.findByApplicationId(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Analiza AI pentru aplicația " + applicationId + " nu a fost găsită. Generați una mai întâi."));

        return new AiGapAnalysisResponse(
                analysis.getId(),
                applicationId,
                List.of(),
                List.of(),
                analysis.getActionPlanMarkdown(),
                analysis.getGeneratedAt()
        );
    }

    private String generateCleanMarkdownPlan(String company, String title, List<String> matching, List<String> missing, double vectorScore) {
        StringBuilder sb = new StringBuilder();
        sb.append("# Analiza AI Career Coach: ").append(title).append(" la ").append(company).append("\n\n");
        sb.append("Scor de Potrivire Semantică Vectorială: ").append(String.format("%.2f", vectorScore)).append("%\n\n");
        
        sb.append("## Skill-uri Potrivite Identificate în CV:\n");
        if (matching.isEmpty()) {
            sb.append("- Nu s-au detectat potriviri directe pe skill-urile tehnice cheie.\n");
        } else {
            matching.forEach(s -> sb.append("- ").append(s).append("\n"));
        }

        sb.append("\n## Skill-uri Critice Lipsă (Gap Analysis):\n");
        if (missing.isEmpty()) {
            sb.append("- CV-ul tău acoperă cerințele tehnice principale ale acestui job.\n");
        } else {
            missing.forEach(s -> sb.append("- ").append(s).append("\n"));
        }

        sb.append("\n## Plan de Acțiune Recomandat (3 Zile):\n");
        sb.append("1. Ziua 1 (Aprofundare Teoretică): Recitește documentația pentru: ").append(missing.isEmpty() ? "Java și Spring Boot" : String.join(", ", missing)).append(".\n");
        sb.append("2. Ziua 2 (Exercițiu Practic): Adaugă un modul practic pe GitHub folosind aceste tehnologii.\n");
        sb.append("3. Ziua 3 (Pregătire Interviu Tehnic): Exersați răspunsurile tehnice în limba engleză.\n");

        return sb.toString();
    }
}
