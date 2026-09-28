package com.jobtracker.ats.dto.digest;

public record DigestSettingsDto(
    boolean enabled,
    String primaryChannel, // "DISCORD", "TELEGRAM", "EMAIL"
    String discordWebhookUrl,
    String telegramBotToken,
    String telegramChatId,
    String emailRecipient,
    int minMatchScore, // default 80
    int maxJobsCount, // default 5
    boolean onlyRomania,
    boolean onlyJunior,
    int scheduledHour, // e.g. 9 (09:00 AM)
    String lastDispatchedAt,
    String lastDispatchStatus
) {}
