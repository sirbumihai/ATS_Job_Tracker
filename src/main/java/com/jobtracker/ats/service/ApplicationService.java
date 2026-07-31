package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.CreateApplicationRequest;
import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.entity.Application;
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
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final ApplicationEventPublisher eventPublisher;

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
        }

        BigDecimal matchScore = calculateMatchScore(resume, job);

        Application application = Application.builder()
                .user(user)
                .jobPosting(job)
                .resume(resume)
                .status(Application.ApplicationStatus.SAVED)
                .semanticMatchScore(matchScore)
                .notes(request.notes())
                .build();

        Application savedApp = applicationRepository.saveAndFlush(application);

        // Publicăm evenimentul asincron pentru ca Agentul AI să ruleze în fundal!
        eventPublisher.publishEvent(new ApplicationCreatedEvent(savedApp.getId()));

        return mapToResponse(savedApp);
    }

    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(UUID id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicația cu ID-ul " + id + " nu a fost găsită."));
        return mapToResponse(app);
    }

    private BigDecimal calculateMatchScore(Resume resume, JobPosting job) {
        if (resume == null || resume.getRawText() == null || job.getRawDescription() == null) {
            return BigDecimal.ZERO;
        }

        Set<String> resumeWords = extractKeywords(resume.getRawText());
        Set<String> jobWords = extractKeywords(job.getRawDescription());

        if (jobWords.isEmpty()) {
            return BigDecimal.ZERO;
        }

        Set<String> intersection = new HashSet<>(resumeWords);
        intersection.retainAll(jobWords);

        double score = ((double) intersection.size() / jobWords.size()) * 100.0;
        double adjustedScore = Math.min(100.0, Math.max(35.0, score * 2.5));

        return BigDecimal.valueOf(adjustedScore).setScale(2, RoundingMode.HALF_UP);
    }

    private Set<String> extractKeywords(String text) {
        return Arrays.stream(text.toLowerCase().split("\\W+"))
                .filter(word -> word.length() > 3)
                .collect(Collectors.toSet());
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
