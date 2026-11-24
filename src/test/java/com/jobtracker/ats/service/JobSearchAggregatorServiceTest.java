package com.jobtracker.ats.service;

import com.jobtracker.ats.crawler.JobScraperOrchestrator;
import com.jobtracker.ats.crawler.PlatformScrapeListener;
import com.jobtracker.ats.crawler.PlatformScrapeResult;
import com.jobtracker.ats.dto.CrawlerSyncStatus;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executor;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobSearchAggregatorServiceTest {

    @Mock
    private JobScraperOrchestrator orchestrator;

    @Mock
    private JobIngestionService ingestion;

    @Mock
    private JobSearchService search;

    private UnifiedJobListingDto createJob(String id, String platform) {
        return new UnifiedJobListingDto(
                id,
                "Java Developer " + id,
                "Firma " + id,
                null,
                "Bucuresti",
                "HYBRID",
                "JUNIOR",
                platform,
                "https://apply.url/" + id,
                "Descriere " + id,
                "Nespecificat",
                List.of("Java"),
                List.of("Java"),
                Collections.emptyList(),
                "Astazi",
                0.0,
                "MEDIUM",
                "Competitie Medie",
                null,
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

    private JobSearchAggregatorService service(Executor executor) {
        return new JobSearchAggregatorService(orchestrator, ingestion, search, executor);
    }

    @Test
    @DisplayName("Joburile fiecărei platforme sunt salvate și vizibile imediat ce platforma termină, nu la finalul rulării")
    void testSavesEachPlatformAsSoonAsItFinishes() {
        UnifiedJobListingDto ejobsJob = createJob("e1", "EJOBS");
        UnifiedJobListingDto linkedinJob = createJob("l1", "LINKEDIN");
        AtomicReference<CrawlerSyncStatus> statusAfterEjobs = new AtomicReference<>();

        JobSearchAggregatorService service = service(Runnable::run);
        when(orchestrator.getActivePlatforms()).thenReturn(List.of("HIPO", "EJOBS", "LINKEDIN"));
        when(search.loadJobsFromDatabase()).thenReturn(1, 2);
        when(orchestrator.scrapeAll(anySet(), any(PlatformScrapeListener.class))).thenAnswer(invocation -> {
            PlatformScrapeListener listener = invocation.getArgument(1);
            listener.onPlatformFinished(PlatformScrapeResult.failed("HIPO", 300, "HTTP 503"), List.of());
            listener.onPlatformFinished(PlatformScrapeResult.success("EJOBS", 1, 4_000), List.of(ejobsJob));
            statusAfterEjobs.set(service.getSyncStatus());
            listener.onPlatformFinished(PlatformScrapeResult.success("LINKEDIN", 1, 150_000), List.of(linkedinJob));
            return List.of(ejobsJob, linkedinJob);
        });

        service.refreshLiveJobs();

        // Cât timp LinkedIn rula, joburile eJobs erau deja salvate și numărate
        CrawlerSyncStatus midRun = statusAfterEjobs.get();
        assertTrue(midRun.running());
        assertEquals(List.of("LINKEDIN"), midRun.runningPlatforms());
        assertEquals(List.of("HIPO", "EJOBS"), midRun.finishedPlatforms().stream().map(PlatformScrapeResult::platformName).toList());
        assertEquals(1, midRun.jobsSaved());

        // Marcajul „nou descoperit” se resetează o dată, la primul lot, iar expirarea se verifică o dată, la final
        InOrder order = inOrder(ingestion, search);
        order.verify(ingestion).resetNewlyDiscovered();
        order.verify(ingestion).saveNewJobsToDatabase(List.of(ejobsJob));
        order.verify(search).loadJobsFromDatabase();
        order.verify(ingestion).saveNewJobsToDatabase(List.of(linkedinJob));
        order.verify(search).loadJobsFromDatabase();
        order.verify(ingestion).markExpiredJobs();
        verify(ingestion, times(1)).resetNewlyDiscovered();
        verify(ingestion, times(2)).saveNewJobsToDatabase(any());

        CrawlerSyncStatus done = service.getSyncStatus();
        assertFalse(done.running());
        assertNotNull(done.finishedAt());
        assertEquals(3, done.platformsTotal());
        assertEquals(List.of(), done.runningPlatforms());
        assertEquals(3, done.finishedPlatforms().size());
        assertEquals(2, done.jobsSaved());
    }

    @Test
    @DisplayName("sync-live pornește rularea în fundal și revine imediat; cât rulează, alte cereri nu pornesc alta")
    void testStartsInBackgroundAndRejectsConcurrentRuns() {
        List<Runnable> background = new ArrayList<>();
        JobSearchAggregatorService service = service(background::add);
        when(orchestrator.getActivePlatforms()).thenReturn(List.of("EJOBS", "LINKEDIN"));

        assertTrue(service.startLiveRefresh());
        verify(orchestrator, never()).scrapeAll(anySet(), any(PlatformScrapeListener.class));
        assertTrue(service.getSyncStatus().running());
        assertEquals(List.of("EJOBS", "LINKEDIN"), service.getSyncStatus().runningPlatforms());

        // A doua apăsare și rularea orară nu pornesc încă o sincronizare
        assertFalse(service.startLiveRefresh());
        service.refreshLiveJobs();
        assertEquals(1, background.size());
        verify(orchestrator, never()).scrapeAll(anySet(), any(PlatformScrapeListener.class));

        background.get(0).run();
        verify(orchestrator, times(1)).scrapeAll(anySet(), any(PlatformScrapeListener.class));
        assertFalse(service.getSyncStatus().running());

        // După ce rularea s-a terminat, se poate porni alta
        assertTrue(service.startLiveRefresh());
        assertEquals(2, background.size());
    }

    @Test
    @DisplayName("O sincronizare eșuată eliberează starea, ca următoarea să poată porni")
    void testFailedRunReleasesTheSyncState() {
        JobSearchAggregatorService service = service(Runnable::run);
        when(orchestrator.getActivePlatforms()).thenReturn(List.of("EJOBS"));
        when(orchestrator.scrapeAll(anySet(), any(PlatformScrapeListener.class)))
                .thenThrow(new IllegalStateException("Executor oprit"))
                .thenReturn(List.of());

        service.refreshLiveJobs();
        assertFalse(service.getSyncStatus().running());

        assertTrue(service.startLiveRefresh());
        verify(orchestrator, times(2)).scrapeAll(anySet(), any(PlatformScrapeListener.class));
    }

    @Test
    @DisplayName("Fără bază de date, căutarea primește joburile fiecărei platforme pe măsură ce termină")
    void testFallsBackToCollectedJobsWithoutDatabase() {
        UnifiedJobListingDto ejobsJob = createJob("e1", "EJOBS");
        UnifiedJobListingDto linkedinJob = createJob("l1", "LINKEDIN");
        List<UnifiedJobListingDto> cache = new CopyOnWriteArrayList<>();
        List<List<String>> cacheAfterEachPlatform = new ArrayList<>();

        JobSearchAggregatorService service = service(Runnable::run);
        when(orchestrator.getActivePlatforms()).thenReturn(List.of("EJOBS", "LINKEDIN"));
        when(search.loadJobsFromDatabase()).thenReturn(0);
        when(search.getActiveLiveJobsCache()).thenReturn(cache);
        when(orchestrator.scrapeAll(anySet(), any(PlatformScrapeListener.class))).thenAnswer(invocation -> {
            PlatformScrapeListener listener = invocation.getArgument(1);
            listener.onPlatformFinished(PlatformScrapeResult.success("EJOBS", 1, 4_000), List.of(ejobsJob));
            cacheAfterEachPlatform.add(cache.stream().map(UnifiedJobListingDto::id).toList());
            listener.onPlatformFinished(PlatformScrapeResult.success("LINKEDIN", 1, 150_000), List.of(linkedinJob));
            cacheAfterEachPlatform.add(cache.stream().map(UnifiedJobListingDto::id).toList());
            return List.of(ejobsJob, linkedinJob);
        });

        assertEquals(2, service.refreshLiveJobs());
        assertEquals(List.of(List.of("e1"), List.of("e1", "l1")), cacheAfterEachPlatform);
    }
}
