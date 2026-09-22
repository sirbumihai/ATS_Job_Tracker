package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class JobScraperOrchestratorTest {

    private UnifiedJobListingDto createJob(String id, String title, String company, String platform) {
        return new UnifiedJobListingDto(
                id,
                title,
                company,
                "https://logo.url/" + id,
                "Bucuresti",
                "HYBRID",
                "MID",
                platform,
                "https://apply.url/" + id,
                "Descriere post " + id,
                "2000 - 3000 EUR",
                List.of("Java"),
                List.of("Java"),
                Collections.emptyList(),
                "Astazi",
                80.0,
                "MEDIUM",
                "Competitie Medie",
                "15 aplicanti",
                0,
                id,
                "hash-" + id,
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                "ACTIVE",
                true
        );
    }

    @Test
    @DisplayName("scrapeAll rulează concurent și unifică rezultatele eliminând duplicatele dintre platforme")
    void testScrapeAllConcurrentDeduplication() {
        JobScraper scraperA = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "PLATFORM_A";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("j1", "Java Developer", "Google", "PLATFORM_A"));
                freshList.add(createJob("j2", "Frontend Engineer", "Meta", "PLATFORM_A"));
            }
        };

        JobScraper scraperB = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "PLATFORM_B";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                // Job duplicat (același titlu și companie ca în PLATFORM_A)
                freshList.add(createJob("j2-dup", "Frontend Engineer", "Meta", "PLATFORM_B"));
                // Job nou
                freshList.add(createJob("j3", "DevOps Engineer", "Amazon", "PLATFORM_B"));
            }
        };

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(scraperA, scraperB));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet());

        assertNotNull(results);
        // j1 (Google), j2 (Meta), j3 (Amazon) => 3 joburi unice
        assertEquals(3, results.size());

        List<PlatformScrapeResult> reports = orchestrator.getLastExecutionReports();
        assertEquals(2, reports.size());
        for (PlatformScrapeResult report : reports) {
            assertEquals("SUCCESS", report.status());
            assertTrue(report.durationMs() >= 0);
        }
    }

    @Test
    @DisplayName("scrapeAll izolează erorile: un scraper eșuat nu blochează celelalte platforme")
    void testScrapeAllErrorIsolation() {
        JobScraper goodScraper = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "GOOD_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("j10", "Backend Engineer", "Stripe", "GOOD_PLATFORM"));
            }
        };

        JobScraper failingScraper = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "FAILING_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                throw new RuntimeException("Simulated HTTP 503 Service Unavailable");
            }
        };

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(goodScraper, failingScraper));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet());

        assertNotNull(results);
        // Platforma bună continuă să furnizeze jobul
        assertEquals(1, results.size());
        assertEquals("j10", results.get(0).id());

        List<PlatformScrapeResult> reports = orchestrator.getLastExecutionReports();
        assertEquals(2, reports.size());

        PlatformScrapeResult goodReport = reports.stream()
                .filter(r -> r.platformName().equals("GOOD_PLATFORM"))
                .findFirst()
                .orElseThrow();
        assertEquals("SUCCESS", goodReport.status());
        assertEquals(1, goodReport.jobsCollected());

        PlatformScrapeResult failingReport = reports.stream()
                .filter(r -> r.platformName().equals("FAILING_PLATFORM"))
                .findFirst()
                .orElseThrow();
        assertEquals("FAILED", failingReport.status());
        assertTrue(failingReport.errorMessage().contains("Simulated HTTP 503"));
    }

    @Test
    @DisplayName("scrapeAll reține rezultatele parțiale chiar dacă un scraper eșuează după ce a adăugat câteva joburi")
    void testScrapeAllSalvagesPartialResults() {
        JobScraper partialFailingScraper = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "PARTIAL_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("j20", "Data Engineer", "Snowflake", "PARTIAL_PLATFORM"));
                freshList.add(createJob("j21", "ML Engineer", "OpenAI", "PARTIAL_PLATFORM"));
                throw new RuntimeException("Network drop after collecting 2 jobs");
            }
        };

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(partialFailingScraper));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet());

        assertNotNull(results);
        assertEquals(2, results.size());
        assertEquals("j20", results.get(0).id());
        assertEquals("j21", results.get(1).id());

        PlatformScrapeResult report = orchestrator.getLastExecutionReports().get(0);
        assertEquals("FAILED", report.status());
    }
}
