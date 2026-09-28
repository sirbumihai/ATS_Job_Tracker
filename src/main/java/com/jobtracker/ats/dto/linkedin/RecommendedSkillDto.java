package com.jobtracker.ats.dto.linkedin;

public record RecommendedSkillDto(
    String skillName,
    String category,
    String marketDemand,
    String rationale
) {}
