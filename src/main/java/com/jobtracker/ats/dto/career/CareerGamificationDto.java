package com.jobtracker.ats.dto.career;

import java.util.List;

public record CareerGamificationDto(
    int totalXp,
    int currentLevel,
    String levelTitle,
    int currentLevelXp,
    int nextLevelXpRequired,
    double levelProgressPercent,
    int dailyStreakDays,
    boolean streakActiveToday,
    List<FunnelStageDto> funnelStages,
    FunnelDiagnosisDto diagnosis,
    List<CareerQuestDto> weeklyQuests,
    List<CareerBadgeDto> badges,
    String antiBurnoutAdvice
) {}
