package com.jobtracker.ats.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record AiGapAnalysisResponse(
    UUID id,
    UUID applicationId,
    List<String> matchingSkills,
    List<String> missingSkills,
    String actionPlanMarkdown,
    OffsetDateTime generatedAt
) {}
