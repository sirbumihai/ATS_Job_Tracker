package com.jobtracker.ats.dto.career;

public record FunnelStageDto(
    String key, // "SAVED", "APPLIED", "SCREENING", "INTERVIEWS", "OFFERS"
    String label,
    int count,
    double conversionRateFromPrevious, // % față de etapa anterioară
    double dropOffRate, // % pierduți
    String benchmarkRange, // "Media pieței: 15-20%"
    String statusColor // "blue", "indigo", "amber", "purple", "emerald"
) {}
