package com.jobtracker.ats.service;

import com.jobtracker.ats.crawler.JobScraperOrchestrator;
import com.jobtracker.ats.crawler.PlatformScrapeListener;
import com.jobtracker.ats.crawler.PlatformScrapeResult;
import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.CrawlerSyncStatus;
import com.jobtracker.ats.dto.JobSearchResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.JobChange;
import com.jobtracker.ats.util.JobNormalizationUtils;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.concurrent.Executors;
import java.util.concurrent.RejectedExecutionException;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Facade Service pentru motorul de căutare a joburilor.
 * Coordonează crawler-ele (JobScraperOrchestrator), persistența și auditul (JobIngestionService)
 * și motorul de căutare în memorie (JobSearchService).
 *
 * Menține 100% compatibilitate retroactivă pentru toate componentele existente.
 */
@Service
@Slf4j
public class JobSearchAggregatorService {

    private final JobScraperOrchestrator jobScraperOrchestrator;
    private final JobIngestionService jobIngestionService;
    private final JobSearchService jobSearchService;
    // Rulează sincronizările din fundal (la pornire și cele cerute din interfață)
    private final Executor syncExecutor;

    // Starea sincronizării curente sau a ultimei; o rulare nouă pornește doar dacă nu rulează alta
    private final AtomicReference<CrawlerSyncStatus> syncStatus = new AtomicReference<>(CrawlerSyncStatus.idle());

    public static final Set<String> REMOVED_PLATFORMS = JobNormalizationUtils.REMOVED_PLATFORMS;
    public static final String BROWSER_USER_AGENT = JobNormalizationUtils.BROWSER_USER_AGENT;

    @Autowired
    public JobSearchAggregatorService(
            JobScraperOrchestrator jobScraperOrchestrator,
            JobIngestionService jobIngestionService,
            JobSearchService jobSearchService) {
        this(jobScraperOrchestrator, jobIngestionService, jobSearchService,
                Executors.newThreadPerTaskExecutor(Thread.ofVirtual().name("sincronizare-joburi-", 1).factory()));
    }

    JobSearchAggregatorService(
            JobScraperOrchestrator jobScraperOrchestrator,
            JobIngestionService jobIngestionService,
            JobSearchService jobSearchService,
            Executor syncExecutor) {
        this.jobScraperOrchestrator = jobScraperOrchestrator;
        this.jobIngestionService = jobIngestionService;
        this.jobSearchService = jobSearchService;
        this.syncExecutor = syncExecutor;
    }

    @PostConstruct
    public void initializeLiveFeed() {
        log.info("[JOB AGGREGATOR FACADE] Inițializare feed din baza de date persistentă PostgreSQL...");
        jobIngestionService.cleanRemovedPlatforms();

        int loaded = jobSearchService.loadJobsFromDatabase();
        log.info("[JOB AGGREGATOR FACADE] Încărcate {} joburi din baza de date în cache-ul activ.", loaded);

        // Rulare asincronă a sincronizării diferențiale după pornirea serverului Tomcat
        CompletableFuture.runAsync(() -> {
            try {
                Thread.sleep(3000);
                log.info("[JOB AGGREGATOR FACADE] Pornire sincronizare automată în fundal...");
                refreshLiveJobs();
            } catch (Exception e) {
                log.warn("[JOB AGGREGATOR FACADE] Eroare la sincronizarea asincronă din fundal: {}", e.getMessage());
            }
        }, syncExecutor);
    }

    /**
     * Sincronizare automată în fundal o dată pe oră (every 60 minutes)
     */
    @Scheduled(fixedRate = 3600000, initialDelay = 3600000)
    public void scheduledHourlyJobRefresh() {
        log.info("[JOB AGGREGATOR FACADE] Rulare orară de sincronizare a joburilor...");
        refreshLiveJobs();
    }

    /**
     * Rulează în firul curent agregarea completă de la toate platformele active (la pornire și orar).
     * Joburile fiecărei platforme sunt salvate în PostgreSQL și apar în căutare imediat ce platforma
     * termină. Dacă rulează deja o sincronizare, nu pornește alta.
     *
     * @return numărul de joburi active din cache-ul de căutare
     */
    public int refreshLiveJobs() {
        if (!tryBeginSync()) {
            log.info("[JOB AGGREGATOR FACADE] O sincronizare rulează deja; nu se pornește alta.");
            return jobSearchService.getActiveLiveJobsCache().size();
        }
        return runBegunSync();
    }

    /**
     * Pornește sincronizarea în fundal și revine imediat; progresul se citește din {@link #getSyncStatus()}.
     *
     * @return false dacă rulează deja o sincronizare (caz în care nu se pornește alta)
     */
    public boolean startLiveRefresh() {
        if (!tryBeginSync()) {
            return false;
        }
        try {
            syncExecutor.execute(this::runBegunSync);
        } catch (RejectedExecutionException e) {
            syncStatus.updateAndGet(CrawlerSyncStatus::finish);
            throw e;
        }
        return true;
    }

    public CrawlerSyncStatus getSyncStatus() {
        return syncStatus.get();
    }

    private boolean tryBeginSync() {
        CrawlerSyncStatus current = syncStatus.get();
        while (!current.running()) {
            if (syncStatus.compareAndSet(current, CrawlerSyncStatus.start(jobScraperOrchestrator.getActivePlatforms()))) {
                return true;
            }
            current = syncStatus.get();
        }
        return false;
    }

    private int runBegunSync() {
        try {
            Set<String> knownDbUrls = jobIngestionService.getKnownDatabaseUrls();
            log.info("[JOB AGGREGATOR FACADE] Baza de date conține {} joburi salvate. Lansare crawlere...", knownDbUrls.size());

            List<UnifiedJobListingDto> freshList = jobScraperOrchestrator.scrapeAll(knownDbUrls, new PlatformJobSaver());

            // O singură dată pe rulare, după ce toate platformele au actualizat lastSeenAt: altfel un job
            // al unei platforme lente ar fi marcat expirat și apoi reactivat în aceeași sincronizare
            if (!freshList.isEmpty() && jobIngestionService.markExpiredJobs() > 0) {
                jobSearchService.loadJobsFromDatabase();
            }

            int totalLoaded = jobSearchService.getActiveLiveJobsCache().size();
            log.info("[JOB AGGREGATOR FACADE] Sincronizare finalizată. Total joburi active în cache: {}", totalLoaded);
            return totalLoaded;
        } catch (RuntimeException e) {
            log.error("[JOB AGGREGATOR FACADE] Sincronizarea joburilor a eșuat: {}", e.getMessage(), e);
            return jobSearchService.getActiveLiveJobsCache().size();
        } finally {
            syncStatus.updateAndGet(CrawlerSyncStatus::finish);
        }
    }

    /**
     * Salvează joburile fiecărei platforme imediat ce termină și reîncarcă cache-ul de căutare,
     * apoi o marchează terminată în starea sincronizării. Orchestratorul o apelează pe rând.
     */
    private final class PlatformJobSaver implements PlatformScrapeListener {

        private final List<UnifiedJobListingDto> savedThisRun = new ArrayList<>();

        @Override
        public void onPlatformFinished(PlatformScrapeResult report, List<UnifiedJobListingDto> newJobs) {
            if (!newJobs.isEmpty()) {
                if (savedThisRun.isEmpty()) {
                    // Marcajul „nou descoperit” rămâne doar pe joburile găsite în rularea curentă
                    jobIngestionService.resetNewlyDiscovered();
                }
                savedThisRun.addAll(newJobs);
                jobIngestionService.saveNewJobsToDatabase(newJobs);
                reloadSearchCache();
            }
            syncStatus.updateAndGet(status -> status.withPlatformFinished(report, newJobs.size()));
            log.info("[JOB AGGREGATOR FACADE] Platforma {} a terminat: {} joburi salvate și vizibile în căutare.",
                    report.platformName(), newJobs.size());
        }

        private void reloadSearchCache() {
            if (jobSearchService.loadJobsFromDatabase() == 0) {
                // Fără bază de date, căutarea folosește direct joburile colectate în rularea curentă
                List<UnifiedJobListingDto> cache = jobSearchService.getActiveLiveJobsCache();
                cache.clear();
                cache.addAll(savedThisRun);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel
    ) {
        return jobSearchService.searchJobs(userId, keyword, location, platform, level, roleCategory, workModel, "MATCH_AND_RECENCY", "ALL", "ACTIVE", "ALL");
    }

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy
    ) {
        return jobSearchService.searchJobs(userId, keyword, location, platform, level, roleCategory, workModel, sortBy, "ALL", "ACTIVE", "ALL");
    }

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted
    ) {
        return jobSearchService.searchJobs(userId, keyword, location, platform, level, roleCategory, workModel, sortBy, datePosted, "ACTIVE", "ALL");
    }

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted,
            String status
    ) {
        return jobSearchService.searchJobs(userId, keyword, location, platform, level, roleCategory, workModel, sortBy, datePosted, status, "ALL");
    }

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted,
            String status,
            String discovered
    ) {
        return jobSearchService.searchJobs(userId, keyword, location, platform, level, roleCategory, workModel, sortBy, datePosted, status, discovered);
    }

    @Transactional(readOnly = true)
    public JobSearchResponse searchJobsPaginated(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted,
            String status,
            String discovered,
            String competitiveness,
            String atsScore,
            int page,
            int size
    ) {
        return jobSearchService.searchJobsPaginated(
                userId, keyword, location, platform, level, roleCategory,
                workModel, sortBy, datePosted, status, discovered,
                competitiveness, atsScore, page, size
        );
    }

    public Map<String, Object> getJobStats() {
        return jobSearchService.getJobStats();
    }

    public UnifiedJobListingDto getJobDetails(String id) {
        return jobSearchService.getJobDetails(id, null);
    }

    public UnifiedJobListingDto getJobDetails(String id, UUID userId) {
        return jobSearchService.getJobDetails(id, userId);
    }

    @Transactional
    public ApplicationResponse saveJobToKanban(UUID userId, UnifiedJobListingDto jobDto) {
        return jobSearchService.saveJobToKanban(userId, jobDto);
    }

    public List<JobChange> getJobChanges(String jobId) {
        return jobIngestionService.getJobChanges(jobId);
    }

    public int markExpiredJobs() {
        return jobIngestionService.markExpiredJobs();
    }

    public int loadJobsFromDatabase() {
        return jobSearchService.loadJobsFromDatabase();
    }

    public String fetchFullDescription(String applyUrl, String platform) {
        return jobSearchService.fetchFullDescription(applyUrl, platform);
    }

    // Metode statice expuse pentru compatibilitate cu AiGapAnalysisService și alte clase existente
    public static String determineExperienceLevel(String title, String description) {
        return JobNormalizationUtils.determineExperienceLevel(title, description);
    }

    public static String determineExperienceLevel(String title) {
        return JobNormalizationUtils.determineExperienceLevel(title);
    }

    public static String computeContentHash(String title, String company, String description, String salary, String skills, String location) {
        return JobNormalizationUtils.computeContentHash(title, company, description, salary, skills, location);
    }

    public static OffsetDateTime parseExactDate(String dateStr) {
        return JobNormalizationUtils.parseExactDate(dateStr);
    }

    public static OffsetDateTime parseExactDate(String dateStr, int fallbackDaysAgo) {
        return JobNormalizationUtils.parseExactDate(dateStr, fallbackDaysAgo);
    }

    public static double parseSalaryEstimate(String salaryRange) {
        return JobNormalizationUtils.parseSalaryEstimate(salaryRange);
    }
}
