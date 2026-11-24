package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.dedupKey;

@Service
@Slf4j
public class JobScraperOrchestrator {

    private final List<JobScraper> scrapers;

    // Executor bazat pe Virtual Threads (Java 21) pentru I/O concurent optim
    private final ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor();

    // Ultimul raport de telemetrie per platformă
    private volatile List<PlatformScrapeResult> lastExecutionReports = Collections.emptyList();

    public JobScraperOrchestrator(List<JobScraper> scrapers) {
        this(scrapers, Set.of());
    }

    /**
     * @param disabledPlatforms platformele excluse din rulare (app.crawler.disabled-platforms), ex. LINKEDIN,EJOBS
     */
    @Autowired
    public JobScraperOrchestrator(
            List<JobScraper> scrapers,
            @Value("${app.crawler.disabled-platforms:}") Set<String> disabledPlatforms) {
        Set<String> disabled = new HashSet<>();
        for (String p : disabledPlatforms) {
            if (p != null && !p.isBlank()) disabled.add(p.trim().toUpperCase());
        }
        this.scrapers = scrapers.stream()
                .filter(s -> !disabled.contains(s.getPlatformName().toUpperCase()))
                .toList();
        if (!disabled.isEmpty()) {
            log.info("[JOB ORCHESTRATOR] Platforme dezactivate din configurare: {}", disabled);
        }
    }

    public List<String> getActivePlatforms() {
        return scrapers.stream().map(JobScraper::getPlatformName).toList();
    }

    public List<PlatformScrapeResult> getLastExecutionReports() {
        return lastExecutionReports;
    }

    private record ScraperTaskResult(
            PlatformScrapeResult report,
            List<UnifiedJobListingDto> jobs
    ) {}

    /**
     * Rulează în paralel, pe Virtual Threads Java 21, toate crawlerele active și așteaptă ca fiecare
     * să termine, fără limită de timp per platformă: fiecare cerere HTTP are propriul timeout, iar
     * scraperele se opresc singure când o platformă refuză sau nu mai răspunde, deci rularea nu rămâne
     * blocată. Erorile unei platforme nu le afectează pe celelalte, joburile colectate înainte de o
     * eroare se păstrează, iar la final se elimină duplicatele dintre platforme.
     *
     * @param knownDbUrls Set de URL-uri existente în baza de date pentru crawling diferențial
     * @return Lista completă de joburi unificate nou colectate
     */
    public List<UnifiedJobListingDto> scrapeAll(Set<String> knownDbUrls) {
        log.info("[JOB ORCHESTRATOR] Începere agregare concurentă (Virtual Threads) pentru {} platforme active.", scrapers.size());
        long totalStartTime = System.currentTimeMillis();

        List<CompletableFuture<ScraperTaskResult>> futures = scrapers.stream()
                .map(scraper -> CompletableFuture.supplyAsync(() -> runScraper(scraper, knownDbUrls), executor))
                .toList();

        List<UnifiedJobListingDto> freshList = new ArrayList<>();
        Set<String> globalDedupKeys = new HashSet<>();
        List<PlatformScrapeResult> reports = new ArrayList<>();

        // Rezultatele se citesc în ordinea platformelor, ca deduplicarea să nu depindă de cine termină primul
        for (CompletableFuture<ScraperTaskResult> future : futures) {
            try {
                ScraperTaskResult res = future.join();
                reports.add(res.report());
                for (UnifiedJobListingDto job : res.jobs()) {
                    if (globalDedupKeys.add(dedupKey(job.jobTitle(), job.companyName(), job.directApplyUrl()))) {
                        freshList.add(job);
                    }
                }
            } catch (CompletionException e) {
                log.error("[JOB ORCHESTRATOR] Eroare la citirea rezultatelor unui scraper: {}", e.getMessage());
            }
        }

        this.lastExecutionReports = Collections.unmodifiableList(reports);
        long totalDuration = System.currentTimeMillis() - totalStartTime;
        log.info("[JOB ORCHESTRATOR] Ciclu concurent finalizat în {} ms. Total joburi agregate și deduplicate: {}",
                totalDuration, freshList.size());

        return freshList;
    }

    private ScraperTaskResult runScraper(JobScraper scraper, Set<String> knownDbUrls) {
        String platform = scraper.getPlatformName();
        long startTime = System.currentTimeMillis();
        // Scraperele pot adăuga joburi din mai multe fire, de aceea colecțiile sunt sincronizate
        List<UnifiedJobListingDto> platformList = Collections.synchronizedList(new ArrayList<>());
        Set<String> platformDedup = Collections.synchronizedSet(new HashSet<>());

        try {
            log.info("[JOB ORCHESTRATOR] [START] Lansare scraper: {}", platform);
            scraper.scrape(platformList, platformDedup, knownDbUrls);
            long duration = System.currentTimeMillis() - startTime;
            log.info("[JOB ORCHESTRATOR] [SUCCESS] Scraper {} a colectat {} joburi în {} ms.",
                    platform, platformList.size(), duration);
            return new ScraperTaskResult(
                    PlatformScrapeResult.success(platform, platformList.size(), duration),
                    new ArrayList<>(platformList)
            );
        } catch (Exception e) {
            long duration = System.currentTimeMillis() - startTime;
            log.error("[JOB ORCHESTRATOR] [ERROR] Scraper {} a eșuat după {} ms: {}",
                    platform, duration, e.getMessage(), e);
            return new ScraperTaskResult(
                    PlatformScrapeResult.failed(platform, duration, e.getMessage()),
                    new ArrayList<>(platformList)
            );
        }
    }
}
