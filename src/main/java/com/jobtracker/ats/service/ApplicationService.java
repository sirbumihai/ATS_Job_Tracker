package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.CreateApplicationRequest;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.ResumeRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
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

    @Transactional
    public ApplicationResponse createApplication(UUID userId, CreateApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul cu ID-ul " + userId + " nu a fost gasit."));

        JobPosting job = jobPostingRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + request.jobId() + " nu a fost gasit."));

        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtAsc(userId);
        Resume resume = userResumes.isEmpty() ? null : userResumes.getLast();

        BigDecimal matchScore = calculateMultiCriteriaMatchScore(job, resume);

        Application application = Application.builder()
                .user(user)
                .jobPosting(job)
                .resume(resume)
                .status(ApplicationStatus.SAVED)
                .semanticMatchScore(matchScore)
                .notes(request.notes())
                .appliedDate(LocalDate.now())
                .build();

        Application savedApp = applicationRepository.save(application);
        return mapToResponse(savedApp);
    }

    @Transactional(readOnly = true)
    public List<ApplicationResponse> getUserApplications(UUID userId) {
        return applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(UUID applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicatia cu ID-ul " + applicationId + " nu a fost gasita."));
        return mapToResponse(app);
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(UUID applicationId, ApplicationStatus status) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicatia cu ID-ul " + applicationId + " nu a fost gasita."));

        app.setStatus(status);

        if (app.getResume() != null) {
            BigDecimal updatedScore = calculateMultiCriteriaMatchScore(app.getJobPosting(), app.getResume());
            app.setSemanticMatchScore(updatedScore);
        }

        Application updatedApp = applicationRepository.save(app);
        return mapToResponse(updatedApp);
    }

    @Transactional
    public void deleteApplication(UUID applicationId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicatia cu ID-ul " + applicationId + " nu a fost gasita."));
        applicationRepository.delete(app);
        log.info("[APPLICATION SERVICE] Aplicatia cu ID-ul {} a fost starsa cu succes.", applicationId);
    }

    public BigDecimal calculateMultiCriteriaMatchScore(JobPosting job, Resume resume) {
        if (resume == null || resume.getRawText() == null || resume.getRawText().isBlank() || job == null || job.getRawDescription() == null || job.getRawDescription().isBlank()) {
            throw new ResourceNotFoundException("Nu s-a gasit niciun CV valid sau descriere de job pentru calcularea scorului ATS.");
        }

        String jobText = job.getRawDescription().toLowerCase();
        String cvText = resume.getRawText().toLowerCase();

        // 1. Vector Cosine Similarity (Pondere 50%)
        float[] jobVector = vectorEmbeddingService.generateEmbedding(job.getRawDescription());
        float[] cvVector = vectorEmbeddingService.generateEmbedding(resume.getRawText());
        double vectorSimilarity = vectorEmbeddingService.calculateCosineSimilarity(jobVector, cvVector);

        // 2. Extragere si Match Dinamic de Termeni Fara Cuvinte Hardcodate (Pondere 50%)
        String[] jobWords = jobText.split("\\W+");
        int totalUniqueWords = 0;
        int matchedWords = 0;

        for (String word : jobWords) {
            if (word.length() > 3) {
                totalUniqueWords++;
                if (cvText.contains(word)) {
                    matchedWords++;
                }
            }
        }

        double termCoverageScore = totalUniqueWords > 0 ? ((double) matchedWords / totalUniqueWords) * 100.0 : vectorSimilarity;

        // Calcul Scored Ponderat Multi-Criterial Dinamic
        double finalWeightedScore = (vectorSimilarity * 0.50) + (termCoverageScore * 0.50);

        log.info("[MULTI-CRITERIA MATCH ENGINE] Vector Cosine: {}%, Term Coverage: {}% -> FINAL: {}%",
                String.format("%.2f", vectorSimilarity),
                String.format("%.2f", termCoverageScore),
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
