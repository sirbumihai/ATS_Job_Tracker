package com.jobtracker.ats.dto.digest;

import java.util.List;

public record DailyDigestPreviewDto(
    String generatedAt,
    String targetUserName,
    int totalAnalyzedJobs,
    int matchedJobsCount,
    List<DigestJobItemDto> jobs,
    String formattedMarkdown,
    String formattedDiscordJson,
    String dailyNetworkingTip
) {}
