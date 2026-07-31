package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.entity.AiGapAnalysis;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.AiGapAnalysisRepository;
import com.jobtracker.ats.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiGapAnalysisService {

    private final AiGapAnalysisRepository aiGapAnalysisRepository;
    private final ApplicationRepository applicationRepository;

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

        String resumeText = resume != null ? resume.getRawText().toLowerCase() : "";
        String jobText = job.getRawDescription().toLowerCase();

        List<String> matchingSkills = new ArrayList<>();
        List<String> missingSkills = new ArrayList<>();

        for (String skill : COMMON_TECH_SKILLS) {
            boolean inJob = jobText.contains(skill);
            boolean inResume = resumeText.contains(skill);

            if (inJob && inResume) {
                matchingSkills.add(skill.toUpperCase());
            } else if (inJob && !inResume) {
                missingSkills.add(skill.toUpperCase());
            }
        }

        String markdownPlan = generateMarkdownPlan(job.getCompanyName(), job.getJobTitle(), matchingSkills, missingSkills);

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

    private String generateMarkdownPlan(String company, String title, List<String> matching, List<String> missing) {
        StringBuilder sb = new StringBuilder();
        sb.append("# 🎯 AI Career Coach Analysis: ").append(title).append(" la ").append(company).append("\n\n");
        
        sb.append("## ✅ Skill-uri Potrivite Identificate în CV:\n");
        if (matching.isEmpty()) {
            sb.append("- Nu s-au detectat potriviri directe pe skill-uri tehnice cheie.\n");
        } else {
            matching.forEach(s -> sb.append("- **").append(s).append("**\n"));
        }

        sb.append("\n## ⚠️ Skill-uri Critice Lipsă (Gap Analysis):\n");
        if (missing.isEmpty()) {
            sb.append("- Excelent! CV-ul tău acoperă toate cerințele tehnice principale ale acestui job.\n");
        } else {
            missing.forEach(s -> sb.append("- ❌ **").append(s).append("**\n"));
        }

        sb.append("\n## 🚀 Planul Tău de Acțiune Recomandat (Action Plan 3 Zile):\n");
        sb.append("1. **Ziua 1 (Aprofundare Teoretică):** Recitește documentația pentru skill-urile lipsă: ").append(String.join(", ", missing)).append(".\n");
        sb.append("2. **Ziua 2 (Exercițiu Practic):** Adaugă un mic demo în proiectul tău de pe GitHub care folosește aceste tehnologii.\n");
        sb.append("3. **Ziua 3 (Pregătire Interviu):** Pregătește 2 răspunsuri în limba engleză despre cum ai aborda o problemă tehnică folosind ").append(missing.isEmpty() ? "Java & Spring" : missing.get(0)).append(".\n");

        return sb.toString();
    }
}
