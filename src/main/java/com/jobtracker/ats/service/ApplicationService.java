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
import java.util.*;

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

    // LISTA DE STOP-WORDS PENTRU FILTRAREA TEXTELOR DE HR SI BENEFICII
    private static final Set<String> COMMON_HR_STOP_WORDS = Set.of(
            "about", "after", "again", "against", "agree", "allow", "almost", "along", "already",
            "also", "although", "always", "among", "and", "another", "apply", "around",
            "available", "based", "been", "before", "being", "below", "benefits", "between",
            "both", "bring", "building", "candidate", "candidates", "career", "careers",
            "client", "clients", "collaborate", "collaborating", "collaborative", "colleagues",
            "company", "compensation", "competitive", "confidential", "contract", "culture",
            "daily", "dental", "description", "desired", "details", "developer", "development",
            "direct", "diversity", "during", "dynamic", "either", "eligible", "email",
            "employee", "employees", "employer", "employment", "ensuring", "environment",
            "equal", "every", "excellent", "experience", "experienced", "flexible", "following",
            "from", "full", "further", "general", "good", "great", "grow", "growth",
            "guidance", "hands", "have", "health", "help", "here", "high", "hiring",
            "holidays", "home", "hybrid", "impact", "improve", "including", "individual",
            "industry", "initiative", "insurance", "interest", "international", "interview",
            "into", "join", "joining", "knowledge", "learn", "learning", "level",
            "life", "like", "located", "location", "looking", "lunch", "main",
            "major", "make", "manage", "management", "manager", "many", "market",
            "match", "meal", "medical", "meet", "meeting", "member", "members",
            "mentor", "mentoring", "metro", "minimum", "more", "most", "must",
            "needs", "next", "nice", "office", "offers", "only", "open",
            "opportunities", "opportunity", "order", "organization", "other", "others",
            "our", "package", "part", "participate", "people", "performance", "perks",
            "personal", "position", "preferred", "presence", "primary", "private",
            "process", "processes", "professional", "profile", "program", "project",
            "provide", "providing", "qualifications", "quality", "quick", "range",
            "recruiting", "recruitment", "regular", "remote", "required", "requirements",
            "responsibilities", "responsible", "results", "role", "roles", "salary",
            "schedule", "scope", "seeking", "self", "senior", "share", "should",
            "skills", "smart", "solution", "solutions", "somewhere", "space", "status",
            "strong", "successful", "support", "talent", "team", "teams", "technical",
            "technology", "their", "them", "then", "there", "these", "they", "this",
            "those", "through", "time", "title", "today", "together", "training",
            "understand", "understanding", "university", "upon", "urgent", "user",
            "users", "using", "vacation", "value", "values", "various", "very",
            "vouchers", "want", "weekly", "well", "what", "when", "where",
            "which", "while", "will", "with", "within", "without", "work",
            "working", "workplace", "world", "would", "year", "years", "your"
    );

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

        BigDecimal matchScore = BigDecimal.valueOf(88.50);
        if (cvProfile != null && job.getRawDescription() != null) {
            matchScore = calculateMatchScoreFromText(job.getRawDescription(), buildCvProfileText(cvProfile));
        } else if (resume != null) {
            try {
                matchScore = calculateMultiCriteriaMatchScore(job, resume);
            } catch (Exception ignored) {}
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

    @Transactional
    public List<ApplicationResponse> getUserApplications(UUID userId) {
        List<Application> apps = applicationRepository.findByUserIdOrderByCreatedAtDesc(userId);

        Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));

        // Actualizeaza dinamic scorurile daca este atasat un CV sau exista CV-ul principal
        for (Application app : apps) {
            if (app.getJobPosting() != null && app.getJobPosting().getRawDescription() != null) {
                String cvText = null;
                if (app.getCvProfile() != null) {
                    cvText = buildCvProfileText(app.getCvProfile());
                } else if (app.getResume() != null) {
                    cvText = app.getResume().getRawText();
                } else if (primaryCv.isPresent()) {
                    cvText = buildCvProfileText(primaryCv.get());
                    app.setCvProfile(primaryCv.get());
                }

                if (cvText != null && !cvText.isBlank()) {
                    BigDecimal updatedScore = calculateMatchScoreFromText(app.getJobPosting().getRawDescription(), cvText);
                    app.setSemanticMatchScore(updatedScore);
                }
            }
        }

        applicationRepository.saveAll(apps);

        return apps.stream()
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

        if (app.getCvProfile() != null && app.getJobPosting() != null && app.getJobPosting().getRawDescription() != null) {
            BigDecimal updatedScore = calculateMatchScoreFromText(app.getJobPosting().getRawDescription(), buildCvProfileText(app.getCvProfile()));
            app.setSemanticMatchScore(updatedScore);
        } else if (app.getResume() != null) {
            try {
                BigDecimal updatedScore = calculateMultiCriteriaMatchScore(app.getJobPosting(), app.getResume());
                app.setSemanticMatchScore(updatedScore);
            } catch (Exception ignored) {}
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
            return BigDecimal.valueOf(80.0).setScale(2, RoundingMode.HALF_UP);
        }

        // 1. Similitudine Vectoriala
        double vectorSimilarity = 80.0;
        try {
            float[] jobVector = vectorEmbeddingService.generateEmbedding(jobDescription);
            float[] cvVector = vectorEmbeddingService.generateEmbedding(cvText);
            vectorSimilarity = vectorEmbeddingService.calculateCosineSimilarity(jobVector, cvVector);
        } catch (Exception ignored) {}

        // 2. Extragere Cuvinte Cheie Tehnice & Cerinte Reale din Job Description (Fara Stop-Words HR)
        String[] jobWords = jobDescription.toLowerCase().split("[^a-zA-Z0-9#+.]+");
        String cvLower = cvText.toLowerCase();

        Set<String> keyTechTerms = new HashSet<>();
        for (String word : jobWords) {
            String w = word.trim();
            if (w.length() >= 2 && !COMMON_HR_STOP_WORDS.contains(w) && !w.matches("^\\d+$")) {
                keyTechTerms.add(w);
            }
        }

        int matchedTechCount = 0;
        for (String term : keyTechTerms) {
            if (cvLower.contains(term)) {
                matchedTechCount++;
            }
        }

        double techCoveragePercent = keyTechTerms.isEmpty() ? 90.0 : ((double) matchedTechCount / keyTechTerms.size()) * 100.0;

        // 3. Calcul Scor Compozit ATS Realist
        // Daca acopera majoritatea termenilor tehnici relevanti (Java, Spring, SQL, Git, etc.), scorul este de top
        double finalScore;
        if (techCoveragePercent >= 70.0) {
            finalScore = 88.0 + Math.min(11.5, (techCoveragePercent - 70.0) * (11.5 / 30.0));
        } else if (techCoveragePercent >= 40.0) {
            finalScore = 75.0 + ((techCoveragePercent - 40.0) * (13.0 / 30.0));
        } else {
            finalScore = Math.max(50.0, (techCoveragePercent * 0.55) + (Math.max(40.0, vectorSimilarity) * 0.35) + 10.0);
        }

        finalScore = Math.min(99.5, Math.max(25.0, finalScore));

        return BigDecimal.valueOf(finalScore).setScale(1, RoundingMode.HALF_UP);
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
