package com.jobtracker.ats.service;

import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.repository.CvProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobAtsMatchEngine {

    private final CvProfileRepository cvProfileRepository;
    private final ApplicationService applicationService;

    public record AtsMatchResult(
            double finalScore,
            List<String> matchingSkills,
            List<String> missingSkills,
            double skillScore,
            double experienceScore
    ) {}

    /**
     * EVALUARE REALISTĂ ATS CU PENALIZARE STRICTĂ PENTRU JUNIORI LA ROLURI CU EXPERIENȚĂ:
     * - INTERNSHIP: 100% scor experiență, fără penalizare (rol dedicat debutului).
     * - JUNIOR: 95% scor experiență, fără penalizare (rol optim pentru 0-2 ani).
     * - MID-LEVEL: 15% scor experiență, multiplicator penalizare 0.55x, plafon max 48% (deficit critic 2-4 ani).
     * - SENIOR / LEAD / ARCHITECT: 0% scor experiență, multiplicator penalizare 0.30x, plafon max 25% (descalificare ATS).
     */
    public AtsMatchResult evaluateAtsMatch(
            String experienceLevel,
            List<String> skillsRequired,
            String cvLower
    ) {
        List<String> matching = new ArrayList<>();
        List<String> missing = new ArrayList<>();

        if (skillsRequired != null && !skillsRequired.isEmpty()) {
            for (String skill : skillsRequired) {
                String sLower = skill.toLowerCase().trim();
                boolean matches = false;

                if (cvLower.contains(sLower)) {
                    matches = true;
                } else if (sLower.contains("java") && !sLower.contains("javascript") && cvLower.contains("java")) {
                    matches = true;
                } else if (sLower.contains("spring") && cvLower.contains("spring")) {
                    matches = true;
                } else if (sLower.contains("sql") && (cvLower.contains("sql") || cvLower.contains("postgres") || cvLower.contains("mysql"))) {
                    matches = true;
                } else if (sLower.contains("docker") && cvLower.contains("docker")) {
                    matches = true;
                } else if (sLower.contains("git") && cvLower.contains("git")) {
                    matches = true;
                } else if (sLower.contains("react") && cvLower.contains("react")) {
                    matches = true;
                } else if (sLower.contains("python") && cvLower.contains("python")) {
                    matches = true;
                } else if (sLower.contains("junit") && cvLower.contains("junit")) {
                    matches = true;
                } else if (sLower.contains("rest") && cvLower.contains("rest")) {
                    matches = true;
                } else if (sLower.contains("microservices") && cvLower.contains("microservices")) {
                    matches = true;
                }

                if (matches) {
                    matching.add(skill);
                } else {
                    missing.add(skill);
                }
            }
        }

        double skillMatchRatio = (skillsRequired == null || skillsRequired.isEmpty())
                ? 0.70
                : ((double) matching.size() / skillsRequired.size());
        double skillScore = Math.min(100.0, skillMatchRatio * 100.0);

        String normLevel = experienceLevel != null ? experienceLevel.toUpperCase().trim() : "MID";
        double experienceScore;
        double penaltyMultiplier;
        double maxScoreCap;

        if ("INTERNSHIP".equals(normLevel)) {
            experienceScore = 100.0;
            penaltyMultiplier = 1.0;
            maxScoreCap = 99.0;
        } else if ("JUNIOR".equals(normLevel)) {
            experienceScore = 95.0;
            penaltyMultiplier = 1.0;
            maxScoreCap = 98.0;
        } else if ("MID".equals(normLevel)) {
            experienceScore = 15.0;
            penaltyMultiplier = 0.55;
            maxScoreCap = 48.0;
        } else {
            experienceScore = 0.0;
            penaltyMultiplier = 0.30;
            maxScoreCap = 25.0;
        }

        double baseScore = (skillScore * 0.50) + (experienceScore * 0.50);
        double penalizedScore = baseScore * penaltyMultiplier;

        if (matching.isEmpty() && skillsRequired != null && !skillsRequired.isEmpty()) {
            penalizedScore = Math.min(penalizedScore, 18.0);
        }

        double finalScore = Math.min(maxScoreCap, Math.max(15.0, Math.round(penalizedScore * 10.0) / 10.0));

        return new AtsMatchResult(finalScore, matching, missing, skillScore, experienceScore);
    }

    public String getCandidateCvText(UUID userId) {
        if (userId != null) {
            Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                    .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));
            if (primaryCv.isPresent()) {
                return applicationService.buildCvProfileText(primaryCv.get());
            }
        }
        return """
            Sîrbu Mihai-Alexandru
            Java Backend Developer
            Java 21, Spring Boot 3.3, PostgreSQL, pgvector, Docker, Git, JUnit 5, Mockito, REST APIs, Microservices, React
            """;
    }
}
