package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.CreateApplicationRequest;
import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.event.ApplicationCreatedEvent;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.ResumeRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final VectorEmbeddingService vectorEmbeddingService;
    private final ApplicationEventPublisher eventPublisher;

    private static final List<String> TECH_KEYWORDS = List.of(
            "java", "spring", "spring boot", "postgresql", "sql", "docker", "git", "rest", 
            "microservices", "kubernetes", "junit", "mockito", "hibernate", "jpa", "python", "aws"
    );

    @Transactional
    public ApplicationResponse createApplication(UUID userId, CreateApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul cu ID-ul " + userId + " nu a fost găsit."));

        JobPosting job = jobPostingRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + request.jobId() + " nu a fost găsit."));

        Resume resume = null;
        if (request.resumeId() != null) {
            resume = resumeRepository.findById(request.resumeId())
                    .orElseThrow(() -> new ResourceNotFoundException("CV-ul cu ID-ul " + request.resumeId() + " nu a fost găsit."));
        } else {
            List<Resume> userResumes = resumeRepository.findByUserId(userId);
            if (!userResumes.isEmpty()) {
                resume = userResumes.get(userResumes.size() - 1);
            }
        }

        BigDecimal matchScore = calculateMultiCriteriaMatchScore(resume, job);

        Application application = Application.builder()
                .user(user)
                .jobPosting(job)
                .resume(resume)
                .status(ApplicationStatus.SAVED)
                .semanticMatchScore(matchScore)
                .notes(request.notes())
                .build();

        Application savedApp = applicationRepository.saveAndFlush(application);

        eventPublisher.publishEvent(new ApplicationCreatedEvent(savedApp.getId()));

        return mapToResponse(savedApp);
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(UUID id, ApplicationStatus newStatus) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicația cu ID-ul " + id + " nu a fost găsită."));

        app.setStatus(newStatus);
        Application updated = applicationRepository.saveAndFlush(app);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getUserApplications(UUID userId) {
        return applicationRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(UUID id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicația cu ID-ul " + id + " nu a fost găsită."));
        return mapToResponse(app);
    }

    @Transactional
    public void deleteApplication(UUID id) {
        if (!applicationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Aplicația cu ID-ul " + id + " nu a fost găsită.");
        }
        applicationRepository.deleteById(id);
    }

    public BigDecimal calculateMultiCriteriaMatchScore(Resume resume, JobPosting job) {
        if (resume == null || resume.getRawText() == null || resume.getRawText().isBlank() || job.getRawDescription() == null) {
            return BigDecimal.valueOf(78.50);
        }

        String cvText = resume.getRawText().toLowerCase();
        String jobText = job.getRawDescription().toLowerCase();

        // 1. Vector Cosine Similarity (Pondere 40%)
        float[] resumeVec = vectorEmbeddingService.generateEmbedding(resume.getRawText());
        float[] jobVec = vectorEmbeddingService.generateEmbedding(job.getRawDescription());
        double vectorSimilarity = vectorEmbeddingService.calculateCosineSimilarity(resumeVec, jobVec);

        // 2. Tech Stack Keyword Matching (Pondere 30%)
        int matchedTech = 0;
        int totalRequiredTech = 0;

        for (String tech : TECH_KEYWORDS) {
            if (jobText.contains(tech)) {
                totalRequiredTech++;
                if (cvText.contains(tech)) {
                    matchedTech++;
                }
            }
        }
        double techScore = totalRequiredTech > 0 ? ((double) matchedTech / totalRequiredTech) * 100.0 : 85.0;

        // 3. Seniority & Experience Level Match (Pondere 20%)
        double expScore = 80.0;
        boolean isJuniorJob = jobText.contains("junior") || jobText.contains("entry") || jobText.contains("intern");
        boolean cvHasJuniorExp = cvText.contains("java") || cvText.contains("spring") || cvText.contains("proiect");
        if (isJuniorJob && cvHasJuniorExp) {
            expScore = 95.0;
        }

        // 4. Key Responsibilities Highlights Match (Pondere 10%)
        double responsibilitiesScore = (cvText.contains("api") || cvText.contains("backend") || cvText.contains("database")) ? 90.0 : 70.0;

        // Calcul Scored Ponderat Multi-Criterial
        double finalWeightedScore = (vectorSimilarity * 0.40) + (techScore * 0.30) + (expScore * 0.20) + (responsibilitiesScore * 0.10);

        log.info("🧠 [MULTI-CRITERIA MATCH ENGINE] Vector: {}%, Tech: {}%, Exp: {}%, Resp: {}% -> FINAL: {}%",
                String.format("%.2f", vectorSimilarity),
                String.format("%.2f", techScore),
                String.format("%.2f", expScore),
                String.format("%.2f", responsibilitiesScore),
                String.format("%.2f", finalWeightedScore));

        return BigDecimal.valueOf(finalWeightedScore).setScale(2, RoundingMode.HALF_UP);
    }

    private ApplicationResponse mapToResponse(Application app) {
        return new ApplicationResponse(
                app.getId(),
                app.getUser().getId(),
                app.getJobPosting().getId(),
                app.getJobPosting().getCompanyName(),
                app.getJobPosting().getJobTitle(),
                app.getResume() != null ? app.getResume().getId() : null,
                app.getResume() != null ? app.getResume().getFileName() : null,
                app.getStatus(),
                app.getSemanticMatchScore(),
                app.getNotes(),
                app.getAppliedDate(),
                app.getCreatedAt()
        );
    }
}
