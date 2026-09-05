package com.jobtracker.ats.dto;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

public record UnifiedJobListingDto(
    String id,
    String jobTitle,
    String companyName,
    String companyLogoUrl,
    String location,
    String workModel, // "REMOTE", "HYBRID", "ONSITE"
    String experienceLevel, // "INTERNSHIP", "JUNIOR", "MID", "SENIOR"
    String sourcePlatform, // "LINKEDIN", "STAGIIPEBUNE", "JUNIORS_RO", "EJOBS", "UNDELUCRAM", etc.
    String directApplyUrl,
    String rawDescription,
    String salaryRange,
    List<String> skillsRequired,
    List<String> matchingSkills,
    List<String> missingSkills,
    String postedDateAgo,
    double atsMatchScore,
    String competitiveness, // "LOW", "MEDIUM", "HIGH"
    String competitivenessLabel,
    String applicantCountText,
    int postedDaysAgo,
    String externalId,
    String contentHash,
    OffsetDateTime postedAt,
    OffsetDateTime firstSeenAt,
    OffsetDateTime lastSeenAt,
    String status // "ACTIVE", "EXPIRED"
) {
    // Constructor de compatibilitate retroactivă pentru apelurile cu 20 de argumente
    public UnifiedJobListingDto(
        String id,
        String jobTitle,
        String companyName,
        String companyLogoUrl,
        String location,
        String workModel,
        String experienceLevel,
        String sourcePlatform,
        String directApplyUrl,
        String rawDescription,
        String salaryRange,
        List<String> skillsRequired,
        List<String> matchingSkills,
        List<String> missingSkills,
        String postedDateAgo,
        double atsMatchScore,
        String competitiveness,
        String competitivenessLabel,
        String applicantCountText,
        int postedDaysAgo
    ) {
        this(
            id, jobTitle, companyName, companyLogoUrl, location, workModel,
            experienceLevel, sourcePlatform, directApplyUrl, rawDescription,
            salaryRange, skillsRequired, matchingSkills, missingSkills,
            postedDateAgo, atsMatchScore, competitiveness, competitivenessLabel,
            applicantCountText, postedDaysAgo,
            id, null, 
            OffsetDateTime.now().minusDays(Math.max(0, postedDaysAgo)),
            OffsetDateTime.now(), OffsetDateTime.now(), "ACTIVE"
        );
    }
}
