package com.jobtracker.ats.dto.outreach;

public record OutreachCadenceDto(
    int daysElapsed,
    String stageKey, // "DAY_0_APPLY", "DAY_5_CHECKIN", "DAY_10_CLOSING", "DAY_15_ARCHIVED"
    String stageLabel,
    String badgeColor, // "emerald", "amber", "blue", "gray"
    String actionRecommendation,
    String timingAdvice
) {}
