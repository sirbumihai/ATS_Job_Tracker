package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.normalizeForDedup;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobScraperOrchestrator {

    private final List<JobScraper> scrapers;
    private static final int SCRAPER_TIMEOUT_SECONDS = 40;

    // Executor bazat pe Virtual Threads (Java 21) pentru I/O concurent optim
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    // Ultimul raport de telemetrie per platformă
    private volatile List<PlatformScrapeResult> lastExecutionReports = Collections.emptyList();

    public List<PlatformScrapeResult> getLastExecutionReports() {
        return lastExecutionReports;
    }

    private record ScraperTaskResult(
            PlatformScrapeResult report,
            List<UnifiedJobListingDto> jobs
    ) {}

    /**
     * Rulează în paralel toate crawler-ele active din sistem folosind Virtual Threads Java 21,
     * izolând eventualele erori sau timeout-uri per sursă și asigurând deduplicarea globală a anunțurilor.
     *
     * @param knownDbUrls Set de URL-uri existente în baza de date pentru crawling diferențial
     * @return Lista completă de joburi unificate nou colectate
     */
    public List<UnifiedJobListingDto> scrapeAll(Set<String> knownDbUrls) {
        log.info("[JOB ORCHESTRATOR] Începere agregare concurentă (Virtual Threads) pentru {} platforme active.", scrapers.size());
        long totalStartTime = System.currentTimeMillis();

        List<CompletableFuture<ScraperTaskResult>> futures = scrapers.stream()
                .map(scraper -> CompletableFuture.supplyAsync(() -> {
                    long startTime = System.currentTimeMillis();
                    List<UnifiedJobListingDto> platformList = new ArrayList<>();
                    Set<String> platformDedup = new HashSet<>();
                    try {
                        log.info("[JOB ORCHESTRATOR] [START] Lansare scraper: {}", scraper.getPlatformName());
                        scraper.scrape(platformList, platformDedup, knownDbUrls);
                        long duration = System.currentTimeMillis() - startTime;
                        log.info("[JOB ORCHESTRATOR] [SUCCESS] Scraper {} a colectat {} joburi în {} ms.",
                                scraper.getPlatformName(), platformList.size(), duration);
                        return new ScraperTaskResult(
                                PlatformScrapeResult.success(scraper.getPlatformName(), platformList.size(), duration),
                                platformList
                        );
                    } catch (Exception e) {
                        long duration = System.currentTimeMillis() - startTime;
                        log.error("[JOB ORCHESTRATOR] [ERROR] Scraper {} a eșuat după {} ms: {}",
                                scraper.getPlatformName(), duration, e.getMessage(), e);
                        return new ScraperTaskResult(
                                PlatformScrapeResult.failed(scraper.getPlatformName(), duration, e.getMessage()),
                                Collections.emptyList()
                        );
                    }
                }, executor)
                .orTimeout(SCRAPER_TIMEOUT_SECONDS, TimeUnit.SECONDS)
                .exceptionally(ex -> {
                    long duration = SCRAPER_TIMEOUT_SECONDS * 1000L;
                    log.warn("[JOB ORCHESTRATOR] [TIMEOUT] Scraper {} a depășit timpul limită de {} secunde.",
                            scraper.getPlatformName(), SCRAPER_TIMEOUT_SECONDS);
                    return new ScraperTaskResult(
                            PlatformScrapeResult.timeout(scraper.getPlatformName(), duration),
                            Collections.emptyList()
                    );
                }))
                .toList();

        // Așteptăm finalizarea tuturor crawlerelor
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

        List<UnifiedJobListingDto> freshList = new ArrayList<>();
        Set<String> globalDedupKeys = new HashSet<>();
        List<PlatformScrapeResult> reports = new ArrayList<>();

        for (CompletableFuture<ScraperTaskResult> future : futures) {
            try {
                ScraperTaskResult res = future.join();
                reports.add(res.report());
                for (UnifiedJobListingDto job : res.jobs()) {
                    String dedupKey = normalizeForDedup(job.jobTitle()) + "::" + normalizeForDedup(job.companyName());
                    if (globalDedupKeys.add(dedupKey)) {
                        freshList.add(job);
                    }
                }
            } catch (Exception e) {
                log.error("[JOB ORCHESTRATOR] Eroare la citirea rezultatelor unui scraper: {}", e.getMessage());
            }
        }

        this.lastExecutionReports = Collections.unmodifiableList(reports);
        long totalDuration = System.currentTimeMillis() - totalStartTime;
        log.info("[JOB ORCHESTRATOR] Ciclu concurent finalizat în {} ms. Total joburi agregate și deduplicate: {}",
                totalDuration, freshList.size());

        return freshList;
    }
}
