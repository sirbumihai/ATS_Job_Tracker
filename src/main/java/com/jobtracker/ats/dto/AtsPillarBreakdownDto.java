package com.jobtracker.ats.dto;

import java.util.List;

public record AtsPillarBreakdownDto(
    double totalScore,
    double roleMatchScore,
    double projectsDepthScore,
    double productionScore,
    double techSkillsScore,
    double impactScore,
    double structureScore,
    String statusMessage,
    String summaryVerdict,
    List<PolishSuggestionDto> suggestions
) {
    public record PolishSuggestionDto(
        String id,
        String category, // "IMPACT", "TECH_DEPTH", "STACK", "PRODUCTION", "ROLE"
        String title,
        String targetSection, // "EXPERIENCE", "PROJECTS", "SKILLS", "CONTACT"
        String targetId, // e.g. project ID or experience ID
        int bulletIndex,
        String beforeText,
        String afterText,
        String rationale
    ) {}
}
