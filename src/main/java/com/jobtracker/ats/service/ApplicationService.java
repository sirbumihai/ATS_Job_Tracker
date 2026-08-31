package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.CreateApplicationRequest;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
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
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final JobPostingRepository jobPostingRepository;
    private final ResumeRepository resumeRepository;
    private final CvProfileRepository cvProfileRepository;
    private final VectorEmbeddingService vectorEmbeddingService;

    @Transactional
    public ApplicationResponse createApplication(UUID userId, CreateApplicationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul cu ID-ul " + userId + " nu a fost gasit."));

        JobPosting job = jobPostingRepository.findById(request.jobId())
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + request.jobId() + " nu a fost gasit."));

        List<Resume> userResumes = resumeRepository.findByUserIdOrderByCreatedAtAsc(userId);
        Resume resume = userResumes.isEmpty() ? null : userResumes.getLast();

        Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));
        CvProfile cvProfile = primaryCv.orElse(null);

        BigDecimal matchScore = BigDecimal.valueOf(60.00);
        if (resume != null) {
            try {
                matchScore = calculateMultiCriteriaMatchScore(job, resume);
            } catch (Exception ignored) {}
        } else if (cvProfile != null && job.getRawDescription() != null) {
            matchScore = calculateMatchScoreFromText(job.getRawDescription(), buildCvProfileText(cvProfile));
        }

        Application application = Application.builder()
                .user(user)
                .jobPosting(job)
                .resume(resume)
                .cvProfile(cvProfile)
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
            try {
                BigDecimal updatedScore = calculateMultiCriteriaMatchScore(app.getJobPosting(), app.getResume());
                app.setSemanticMatchScore(updatedScore);
            } catch (Exception ignored) {}
        } else if (app.getCvProfile() != null && app.getJobPosting() != null && app.getJobPosting().getRawDescription() != null) {
            BigDecimal updatedScore = calculateMatchScoreFromText(app.getJobPosting().getRawDescription(), buildCvProfileText(app.getCvProfile()));
            app.setSemanticMatchScore(updatedScore);
        }

        Application updatedApp = applicationRepository.save(app);
        return mapToResponse(updatedApp);
    }

    @Transactional
    public ApplicationResponse attachCvProfile(UUID applicationId, UUID cvProfileId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicatia nu a fost gasita."));

        if (cvProfileId == null) {
            app.setCvProfile(null);
        } else {
            CvProfile cv = cvProfileRepository.findById(cvProfileId)
                    .orElseThrow(() -> new ResourceNotFoundException("Profilul CV nu a fost gasit."));
            app.setCvProfile(cv);
            app.setResume(null);

            if (app.getJobPosting() != null && app.getJobPosting().getRawDescription() != null) {
                BigDecimal score = calculateMatchScoreFromText(app.getJobPosting().getRawDescription(), buildCvProfileText(cv));
                app.setSemanticMatchScore(score);
            }
        }

        Application saved = applicationRepository.save(app);
        return mapToResponse(saved);
    }

    @Transactional
    public ApplicationResponse attachResume(UUID applicationId, UUID resumeId) {
        Application app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Aplicatia nu a fost gasita."));

        if (resumeId == null) {
            app.setResume(null);
        } else {
            Resume resume = resumeRepository.findById(resumeId)
                    .orElseThrow(() -> new ResourceNotFoundException("Fisierul Resume nu a fost gasit."));
            app.setResume(resume);
            app.setCvProfile(null);

            if (app.getJobPosting() != null) {
                BigDecimal score = calculateMultiCriteriaMatchScore(app.getJobPosting(), resume);
                app.setSemanticMatchScore(score);
            }
        }

        Application saved = applicationRepository.save(app);
        return mapToResponse(saved);
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

        return calculateMatchScoreFromText(job.getRawDescription(), resume.getRawText());
    }

    public BigDecimal calculateMatchScoreFromText(String jobDescription, String cvText) {
        if (jobDescription == null || jobDescription.isBlank() || cvText == null || cvText.isBlank()) {
            return BigDecimal.valueOf(50.0).setScale(2, RoundingMode.HALF_UP);
        }

        float[] jobVector = vectorEmbeddingService.generateEmbedding(jobDescription);
        float[] cvVector = vectorEmbeddingService.generateEmbedding(cvText);
        double vectorSimilarity = vectorEmbeddingService.calculateCosineSimilarity(jobVector, cvVector);

        String[] jobWords = jobDescription.toLowerCase().split("\\W+");
        String cvLower = cvText.toLowerCase();
        int totalUniqueWords = 0;
        int matchedWords = 0;

        for (String word : jobWords) {
            if (word.length() > 3) {
                totalUniqueWords++;
                if (cvLower.contains(word)) {
                    matchedWords++;
                }
            }
        }

        double termCoverageScore = totalUniqueWords > 0 ? ((double) matchedWords / totalUniqueWords) * 100.0 : vectorSimilarity;
        double finalWeightedScore = (vectorSimilarity * 0.50) + (termCoverageScore * 0.50);

        return BigDecimal.valueOf(finalWeightedScore).setScale(2, RoundingMode.HALF_UP);
    }

    public String buildCvProfileText(CvProfile cv) {
        StringBuilder sb = new StringBuilder();
        if (cv.getTitle() != null) sb.append(cv.getTitle()).append(" - ");
        if (cv.getFullName() != null) sb.append(cv.getFullName()).append("\n");
        if (cv.getSummary() != null) sb.append(cv.getSummary()).append("\n");
        if (cv.getSkillsLanguages() != null) sb.append(cv.getSkillsLanguages()).append(" ");
        if (cv.getSkillsFrameworks() != null) sb.append(cv.getSkillsFrameworks()).append(" ");
        if (cv.getSkillsDatabases() != null) sb.append(cv.getSkillsDatabases()).append(" ");
        if (cv.getSkillsDevops() != null) sb.append(cv.getSkillsDevops()).append("\n");
        if (cv.getWorkExperienceJson() != null) sb.append(cv.getWorkExperienceJson()).append("\n");
        if (cv.getProjectsJson() != null) sb.append(cv.getProjectsJson()).append("\n");
        if (cv.getEducationJson() != null) sb.append(cv.getEducationJson()).append("\n");
        return sb.toString();
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
                app.getCvProfile() != null ? app.getCvProfile().getId() : null,
                app.getCvProfile() != null ? app.getCvProfile().getTitle() : null,
                app.getStatus(),
                app.getSemanticMatchScore(),
                app.getNotes(),
                app.getAppliedDate(),
                app.getCreatedAt()
        );
    }
}
