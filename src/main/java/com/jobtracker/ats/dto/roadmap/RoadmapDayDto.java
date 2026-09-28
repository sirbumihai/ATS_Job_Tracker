package com.jobtracker.ats.dto.roadmap;

import java.util.List;

public record RoadmapDayDto(
    int dayNumber,
    String phase, // "FOUNDATIONS", "ENVIRONMENT_SETUP", "SPRING_BOOT_INTEGRATION", "PRODUCTION_PROJECT"
    String title,
    String estimatedHours,
    String coreObjective,
    List<String> keyConcepts,
    String handsOnLab,
    String codeSnippet,
    String codeSnippetLanguage, // "java", "yaml", "bash", "sql"
    List<String> interviewVerificationQuestions
) {}
