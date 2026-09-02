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
    String sourcePlatform, // "LINKEDIN", "WELLFOUND", "INDEED", "GREENHOUSE", "ASHBY", "LEVER", "STAGIIPEBUNE", "JUNIORS_RO", "EJOBS", "HIPO", "BESTJOBS"
    String directApplyUrl,
    String rawDescription,
    String salaryRange,
    List<String> skillsRequired,
    List<String> matchingSkills,
    List<String> missingSkills,
    String postedDateAgo,
    double atsMatchScore
) {}
