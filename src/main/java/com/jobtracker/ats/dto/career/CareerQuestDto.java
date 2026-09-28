package com.jobtracker.ats.dto.career;

public record CareerQuestDto(
    String id,
    String title,
    String description,
    String category, // "APPLICATIONS", "NETWORKING", "SKILLS", "DISCIPLINE"
    int currentProgress,
    int targetProgress,
    int rewardXp,
    boolean completed,
    boolean claimed,
    String actionTab
) {}
