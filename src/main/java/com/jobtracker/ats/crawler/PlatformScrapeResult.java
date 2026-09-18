package com.jobtracker.ats.crawler;

import java.time.OffsetDateTime;

/**
 * Raport de execuție și telemetrie pentru fiecare crawler individual.
 */
public record PlatformScrapeResult(
        String platformName,
        String status, // "SUCCESS", "FAILED", "TIMEOUT"
        int jobsCollected,
        long durationMs,
        String errorMessage,
        OffsetDateTime executedAt
) {
    public static PlatformScrapeResult success(String platformName, int jobsCollected, long durationMs) {
        return new PlatformScrapeResult(platformName, "SUCCESS", jobsCollected, durationMs, null, OffsetDateTime.now());
    }

    public static PlatformScrapeResult failed(String platformName, long durationMs, String errorMessage) {
        return new PlatformScrapeResult(platformName, "FAILED", 0, durationMs, errorMessage, OffsetDateTime.now());
    }

    public static PlatformScrapeResult timeout(String platformName, long durationMs) {
        return new PlatformScrapeResult(platformName, "TIMEOUT", 0, durationMs, "Timpul maxim de executie (timeout) a fost depasit", OffsetDateTime.now());
    }
}
