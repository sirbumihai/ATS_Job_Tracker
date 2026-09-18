package com.jobtracker.ats.service;

import com.jobtracker.ats.crawler.JobScraperOrchestrator;
import com.jobtracker.ats.crawler.PlatformScrapeResult;
import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.JobSearchResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.JobChange;
import com.jobtracker.ats.util.JobNormalizationUtils;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;

/**
 * Facade Service pentru motorul de căutare a joburilor.
 * Coordonează crawler-ele (JobScraperOrchestrator), persistența și auditul (JobIngestionService)
 * și motorul de căutare în memorie (JobSearchService).
 *
 * Menține 100% compatibilitate retroactivă pentru toate componentele existente.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class JobSearchAggregatorService {

    private final JobScraperOrchestrator jobScraperOrchestrator;
    private final JobIngestionService jobIngestionService;
    private final JobSearchService jobSearchService;

    public static final Set<String> REMOVED_PLATFORMS = JobNormalizationUtils.REMOVED_PLATFORMS;
    public static final String BROWSER_USER_AGENT = JobNormalizationUtils.BROWSER_USER_AGENT;

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
        });
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
     * Declanșează agregarea completă de la toate platformele active,
     * persistă noile joburi în PostgreSQL și actualizează cache-ul de căutare.
     */
    public synchronized int refreshLiveJobs() {
        Set<String> knownDbUrls = jobIngestionService.getKnownDatabaseUrls();
        log.info("[JOB AGGREGATOR FACADE] Baza de date conține {} joburi salvate. Lansare crawlere...", knownDbUrls.size());

        List<UnifiedJobListingDto> freshList = jobScraperOrchestrator.scrapeAll(knownDbUrls);
        jobIngestionService.saveNewJobsToDatabase(freshList);

        int totalLoaded = jobSearchService.loadJobsFromDatabase();
        if (totalLoaded == 0 && !freshList.isEmpty()) {
            jobSearchService.getActiveLiveJobsCache().clear();
            jobSearchService.getActiveLiveJobsCache().addAll(freshList);
            totalLoaded = jobSearchService.getActiveLiveJobsCache().size();
        }

        log.info("[JOB AGGREGATOR FACADE] Sincronizare finalizată. Total joburi active în cache: {}", totalLoaded);
        return totalLoaded;
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

    public List<PlatformScrapeResult> getLastExecutionReports() {
        return jobScraperOrchestrator.getLastExecutionReports();
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
