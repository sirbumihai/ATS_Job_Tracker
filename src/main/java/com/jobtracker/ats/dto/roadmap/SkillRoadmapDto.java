package com.jobtracker.ats.dto.roadmap;

import java.util.List;

public record SkillRoadmapDto(
    String id,
    String skillName,
    String iconKey, // "kafka", "redis", "docker", "kubernetes", "microservices", "generic"
    String category,
    String marketDemandRomania,
    String difficulty, // "Intermediar", "Avansat"
    int totalDays,
    String targetRole,
    String overviewDescription,
    List<RoadmapDayDto> days,
    String capstoneProjectTitle,
    String capstoneProjectArchitecture,
    String cvBulletPoint, // Pre-formatted Google XYZ bullet point ready to insert in CV
    String gitHubRepoTemplateName
) {}
