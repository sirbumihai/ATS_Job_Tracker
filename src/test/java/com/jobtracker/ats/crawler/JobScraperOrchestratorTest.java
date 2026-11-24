package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.convert.ApplicationConversionService;
import org.springframework.context.annotation.AnnotationConfigApplicationContext;
import org.springframework.core.env.MapPropertySource;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

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

    @Test
    @DisplayName("Platformele rulează simultan, nu una după alta")
    void testScrapersRunConcurrently() {
        // Fiecare scraper așteaptă ca și celălalt să fi pornit; rulate pe rând, primul n-ar trece de barieră
        CountDownLatch bothStarted = new CountDownLatch(2);
        JobScraper first = new AwaitingScraper("FIRST", bothStarted, createJob("j40", "Java Developer", "Acme", "FIRST"));
        JobScraper second = new AwaitingScraper("SECOND", bothStarted, createJob("j41", "QA Engineer", "Beta", "SECOND"));

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(first, second));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet());

        assertEquals(2, results.size());
        assertTrue(orchestrator.getLastExecutionReports().stream().allMatch(r -> "SUCCESS".equals(r.status())));
    }

    @Test
    @DisplayName("Joburile adăugate din mai multe fire ale aceleiași platforme sunt păstrate toate")
    void testKeepsJobsAddedFromSeveralThreads() {
        JobScraper parallelScraper = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "PARALLEL_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
                    for (int t = 0; t < 4; t++) {
                        int thread = t;
                        executor.submit(() -> {
                            for (int i = 0; i < 50; i++) {
                                String id = "p" + thread + "-" + i;
                                freshList.add(createJob(id, "Developer " + id, "Firma " + id, "PARALLEL_PLATFORM"));
                            }
                        });
                    }
                }
            }
        };

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(parallelScraper));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet());

        assertEquals(200, results.size());
        PlatformScrapeResult report = orchestrator.getLastExecutionReports().get(0);
        assertEquals("SUCCESS", report.status());
        assertEquals(200, report.jobsCollected());
    }

    @Test
    @DisplayName("Fiecare platformă e anunțată imediat ce termină, iar cea care termină mai târziu nu reintroduce duplicatele")
    void testAnnouncesEachPlatformAsSoonAsItFinishes() {
        CountDownLatch fastAnnounced = new CountDownLatch(1);
        JobScraper fast = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "FAST";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("fast-1", "Java Developer", "Acme", "FAST"));
                freshList.add(createJob("fast-2", "QA Engineer", "Beta", "FAST"));
            }
        };
        JobScraper slow = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "SLOW";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                // Platforma lentă termină abia după ce rezultatele celei rapide au fost anunțate
                try {
                    if (!fastAnnounced.await(5, TimeUnit.SECONDS)) {
                        throw new IllegalStateException("Platforma rapidă n-a fost anunțată cât timp rula cea lentă");
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    throw new IllegalStateException(e);
                }
                freshList.add(createJob("slow-1", "Java Developer", "Acme", "SLOW"));
                freshList.add(createJob("slow-2", "DevOps Engineer", "Gamma", "SLOW"));
            }
        };

        List<String> announcements = new ArrayList<>();
        PlatformScrapeListener listener = (report, newJobs) -> {
            announcements.add(report.platformName() + " " + report.status() + " "
                    + newJobs.stream().map(UnifiedJobListingDto::id).toList());
            if ("FAST".equals(report.platformName())) fastAnnounced.countDown();
        };

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(slow, fast));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet(), listener);

        assertEquals(List.of("FAST SUCCESS [fast-1, fast-2]", "SLOW SUCCESS [slow-2]"), announcements);
        assertEquals(List.of("fast-1", "fast-2", "slow-2"), results.stream().map(UnifiedJobListingDto::id).toList());
    }

    @Test
    @DisplayName("Platforma eșuată e anunțată cu joburile colectate înainte de eroare, iar o eroare a listener-ului nu oprește celelalte platforme")
    void testAnnouncesFailedPlatformsAndSurvivesListenerErrors() {
        JobScraper failing = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "PARTIAL_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("j50", "Data Engineer", "Snowflake", "PARTIAL_PLATFORM"));
                throw new RuntimeException("Network drop after collecting 1 job");
            }
        };
        JobScraper good = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "GOOD_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("j51", "Backend Engineer", "Stripe", "GOOD_PLATFORM"));
            }
        };

        Map<String, String> announcements = new HashMap<>();
        PlatformScrapeListener listener = (report, newJobs) -> {
            announcements.put(report.platformName(), report.status() + " " + newJobs.size());
            throw new IllegalStateException("Salvare eșuată pentru " + report.platformName());
        };

        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(List.of(failing, good));
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet(), listener);

        assertEquals(Map.of("PARTIAL_PLATFORM", "FAILED 1", "GOOD_PLATFORM", "SUCCESS 1"), announcements);
        assertEquals(2, results.size());
        assertEquals(2, orchestrator.getLastExecutionReports().size());
    }

    static class AwaitingScraper implements JobScraper {
        private final String name;
        private final CountDownLatch bothStarted;
        private final UnifiedJobListingDto job;

        AwaitingScraper(String name, CountDownLatch bothStarted, UnifiedJobListingDto job) {
            this.name = name;
            this.bothStarted = bothStarted;
            this.job = job;
        }

        @Override
        public String getPlatformName() {
            return name;
        }

        @Override
        public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
            bothStarted.countDown();
            try {
                if (!bothStarted.await(5, TimeUnit.SECONDS)) {
                    throw new IllegalStateException("Platformele nu au rulat simultan");
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new IllegalStateException(e);
            }
            freshList.add(job);
        }
    }

    @Test
    @DisplayName("Platformele din app.crawler.disabled-platforms nu sunt rulate")
    void testDisabledPlatformsAreSkipped() {
        JobScraper enabled = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "ENABLED_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                freshList.add(createJob("j30", "Java Developer", "Acme", "ENABLED_PLATFORM"));
            }
        };

        JobScraper disabled = new JobScraper() {
            @Override
            public String getPlatformName() {
                return "DISABLED_PLATFORM";
            }

            @Override
            public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
                fail("Platforma dezactivată nu trebuie rulată");
            }
        };

        // Configurarea nu ține cont de majuscule și ignoră spațiile
        JobScraperOrchestrator orchestrator = new JobScraperOrchestrator(
                List.of(enabled, disabled), Set.of(" disabled_platform ", ""));

        assertEquals(List.of("ENABLED_PLATFORM"), orchestrator.getActivePlatforms());
        List<UnifiedJobListingDto> results = orchestrator.scrapeAll(Collections.emptySet());
        assertEquals(1, results.size());
        assertEquals(1, orchestrator.getLastExecutionReports().size());
    }

    static class NamedScraper implements JobScraper {
        private final String name;

        NamedScraper(String name) {
            this.name = name;
        }

        @Override
        public String getPlatformName() {
            return name;
        }

        @Override
        public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        }
    }

    @Test
    @DisplayName("Configurarea din application.yml (listă separată prin virgulă) se leagă corect în contextul Spring")
    void testSpringBindsCrawlerProperties() {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()) {
            ctx.getBeanFactory().setConversionService(ApplicationConversionService.getSharedInstance());
            ctx.getEnvironment().getPropertySources().addFirst(new MapPropertySource("test", Map.of(
                    "app.crawler.disabled-platforms", "LINKEDIN, ejobs")));
            ctx.registerBean("linkedin", JobScraper.class, () -> new NamedScraper("LINKEDIN"));
            ctx.registerBean("ejobs", JobScraper.class, () -> new NamedScraper("EJOBS"));
            ctx.registerBean("hipo", JobScraper.class, () -> new NamedScraper("HIPO"));
            ctx.register(JobScraperOrchestrator.class);
            ctx.refresh();

            assertEquals(List.of("HIPO"), ctx.getBean(JobScraperOrchestrator.class).getActivePlatforms());
        }
    }

    @Test
    @DisplayName("Fără configurare, toate platformele rămân active")
    void testSpringDefaultsKeepAllPlatforms() {
        try (AnnotationConfigApplicationContext ctx = new AnnotationConfigApplicationContext()) {
            ctx.getBeanFactory().setConversionService(ApplicationConversionService.getSharedInstance());
            ctx.getEnvironment().getPropertySources().addFirst(new MapPropertySource("test", Map.of(
                    "app.crawler.disabled-platforms", "")));
            ctx.registerBean("linkedin", JobScraper.class, () -> new NamedScraper("LINKEDIN"));
            ctx.registerBean("hipo", JobScraper.class, () -> new NamedScraper("HIPO"));
            ctx.register(JobScraperOrchestrator.class);
            ctx.refresh();

            assertEquals(Set.of("LINKEDIN", "HIPO"), Set.copyOf(ctx.getBean(JobScraperOrchestrator.class).getActivePlatforms()));
        }
    }
}
