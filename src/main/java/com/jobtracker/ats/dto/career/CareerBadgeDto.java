package com.jobtracker.ats.dto.career;

public record CareerBadgeDto(
    String id,
    String title,
    String description,
    String iconKey, // "target", "sparkles", "send", "flame", "graduation", "trophy"
    boolean unlocked,
    String unlockedAt,
    String rarity // "COMMON", "RARE", "EPIC", "LEGENDARY"
) {}
