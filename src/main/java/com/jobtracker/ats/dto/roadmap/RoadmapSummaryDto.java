package com.jobtracker.ats.dto.roadmap;

public record RoadmapSummaryDto(
    String id,
    String skillName,
    String iconKey,
    String category,
    String marketDemandRomania,
    String difficulty,
    int totalDays,
    String shortPitch
) {}
