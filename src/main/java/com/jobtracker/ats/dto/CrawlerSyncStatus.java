package com.jobtracker.ats.dto;

import com.jobtracker.ats.crawler.PlatformScrapeResult;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Starea sincronizării de joburi (GET /api/v1/jobs/crawler-status): platformele în curs și cele
 * terminate în rularea curentă sau, dacă nu rulează niciuna, în ultima rulare.
 * Valoare imutabilă: fiecare schimbare produce o stare nouă.
 *
 * @param running           dacă rulează acum o sincronizare
 * @param startedAt         începutul rulării curente sau al ultimei rulări (null dacă n-a rulat niciuna)
 * @param finishedAt        sfârșitul ultimei rulări (null cât timp rulează)
 * @param platformsTotal    câte platforme are rularea
 * @param runningPlatforms  platformele care n-au terminat încă
 * @param finishedPlatforms rapoartele platformelor terminate, în ordinea în care au terminat
 * @param jobsSaved         joburile salvate și vizibile în căutare până acum, după deduplicarea dintre platforme
 */
public record CrawlerSyncStatus(
        boolean running,
        OffsetDateTime startedAt,
        OffsetDateTime finishedAt,
        int platformsTotal,
        List<String> runningPlatforms,
        List<PlatformScrapeResult> finishedPlatforms,
        int jobsSaved
) {

    public static CrawlerSyncStatus idle() {
        return new CrawlerSyncStatus(false, null, null, 0, List.of(), List.of(), 0);
    }

    public static CrawlerSyncStatus start(List<String> platforms) {
        return new CrawlerSyncStatus(true, OffsetDateTime.now(), null, platforms.size(), List.copyOf(platforms), List.of(), 0);
    }

    public CrawlerSyncStatus withPlatformFinished(PlatformScrapeResult report, int savedJobs) {
        List<String> stillRunning = runningPlatforms.stream()
                .filter(platform -> !platform.equals(report.platformName()))
                .toList();
        List<PlatformScrapeResult> finished = new ArrayList<>(finishedPlatforms);
        finished.add(report);
        return new CrawlerSyncStatus(running, startedAt, finishedAt, platformsTotal, stillRunning,
                List.copyOf(finished), jobsSaved + savedJobs);
    }

    public CrawlerSyncStatus finish() {
        return new CrawlerSyncStatus(false, startedAt, OffsetDateTime.now(), platformsTotal, List.of(),
                finishedPlatforms, jobsSaved);
    }
}
