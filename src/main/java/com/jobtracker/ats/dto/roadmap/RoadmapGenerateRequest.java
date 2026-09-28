package com.jobtracker.ats.dto.roadmap;

public record RoadmapGenerateRequest(
    String skillName,
    String targetRole,
    String currentLevel, // "BEGINNER", "INTERMEDIATE"
    String focusArea // "BACKEND_JAVA", "FULLSTACK", "DEVOPS", "CLOUD"
) {}
