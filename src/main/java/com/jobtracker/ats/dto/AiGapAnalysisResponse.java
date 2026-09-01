package com.jobtracker.ats.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AiGapAnalysisResponse(
    UUID id,
    UUID applicationId,
    String jobTitle,
    String companyName,
    double matchScore,
    List<String> matchingSkills,
    List<String> missingSkills,
    String cleanReportText,
    String actionPlanMarkdown,
    OffsetDateTime generatedAt
) {}
