package com.jobtracker.ats.dto;

import java.util.List;

public record RoadmapStageDto(
    int stageNumber,
    String stageTitle,
    String durationEst,
    List<String> keyMilestones
) {}
