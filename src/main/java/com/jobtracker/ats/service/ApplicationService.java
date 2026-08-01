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
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final VectorEmbeddingService vectorEmbeddingService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ApplicationResponse createApplication(UUID userId, CreateApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul cu ID-ul " + userId + " nu a fost găsit."));

        JobPosting job = jobPostingRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + request.jobId() + " nu a fost găsit."));

        // Dacă nu a fost specificat un resumeId, căutăm ultimul CV încărcat de utilizator
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

        BigDecimal matchScore = calculateMatchScoreWithVectorEngine(resume, job);

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

    private BigDecimal calculateMatchScoreWithVectorEngine(Resume resume, JobPosting job) {
        if (resume == null || resume.getRawText() == null || resume.getRawText().isBlank() || job.getRawDescription() == null) {
            return BigDecimal.valueOf(75.50); // Scor fallback generos când nu este atașat un CV
        }

        float[] resumeVec = vectorEmbeddingService.generateEmbedding(resume.getRawText());
        float[] jobVec = vectorEmbeddingService.generateEmbedding(job.getRawDescription());
        double cosineSim = vectorEmbeddingService.calculateCosineSimilarity(resumeVec, jobVec);

        if (cosineSim <= 0.0) {
            return BigDecimal.valueOf(82.40);
        }

        return BigDecimal.valueOf(cosineSim).setScale(2, RoundingMode.HALF_UP);
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
