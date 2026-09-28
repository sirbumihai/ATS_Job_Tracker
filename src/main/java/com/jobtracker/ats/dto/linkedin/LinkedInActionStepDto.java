package com.jobtracker.ats.dto.linkedin;

public record LinkedInActionStepDto(
    String id,
    String stepNumber,
    String title,
    String category,
    String impact,
    String estimatedMinutes,
    String instructions,
    String exampleSnippet,
    boolean isCrucial
) {}
