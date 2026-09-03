package com.jobtracker.ats.dto;

import java.util.List;

public record UnifiedJobListingDto(
    String id,
    String jobTitle,
    String companyName,
    String companyLogoUrl,
    String location,
    String workModel, // "REMOTE", "HYBRID", "ONSITE"
    String experienceLevel, // "INTERNSHIP", "JUNIOR", "MID", "SENIOR"
    String sourcePlatform, // "LINKEDIN", "STAGIIPEBUNE", "JUNIORS_RO", "EJOBS", "UNDELUCRAM", "GREENHOUSE", "ASHBY", "SMARTRECRUITERS", "REMOTIVE", "ARBEITNOW"
    String directApplyUrl,
    String rawDescription,
    String salaryRange,
    List<String> skillsRequired,
    List<String> matchingSkills,
    List<String> missingSkills,
    String postedDateAgo,
    double atsMatchScore,
    String competitiveness, // "LOW", "MEDIUM", "HIGH"
    String competitivenessLabel, // "🟢 Șansă Mare (Sub 25 Aplicanți)", "🟡 Competiție Medie", "🔴 Competiție Mare (100+ Aplicanți)"
    String applicantCountText, // "Peste 100 de aplicanți", "Sub 25 de candidați (Early Applicant)", "50-100 candidați"
    int postedDaysAgo // 0 for today, 1 for yesterday, 7 for 1 week, etc. for sorting
) {}
