package com.jobtracker.ats.dto.digest;

public record DigestTestRequest(
    String channel, // "DISCORD", "TELEGRAM", "EMAIL"
    String targetDestination, // webhook URL, telegram chatId, or email
    String telegramBotToken, // only for telegram
    boolean sendTopJobs
) {}
