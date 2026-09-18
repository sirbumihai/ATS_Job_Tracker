package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.JobSearchResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CachedJobListingRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.UserRepository;
import com.jobtracker.ats.service.JobAtsMatchEngine.AtsMatchResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobSearchPaginationTest {

    @Mock
    private JobPostingRepository jobPostingRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CvProfileRepository cvProfileRepository;

    @Mock
    private CachedJobListingRepository cachedJobListingRepository;

    @Mock
    private JobAtsMatchEngine jobAtsMatchEngine;

    @InjectMocks
    private JobSearchService jobSearchService;

    private final UUID testUserId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        jobSearchService.getActiveLiveJobsCache().clear();
    }

    private UnifiedJobListingDto createDummyJob(String id, String title, String platform, String level, String comp, double score) {
        return new UnifiedJobListingDto(
                id,
                title,
                "Company " + id,
                "https://logo.url/" + id,
                "Bucuresti",
                "HYBRID",
                level,
                platform,
                "https://apply.url/" + id,
                "<html><body>Descriere foarte lunga si detaliata de " + id + " cu cerinte si beneficii extinse</body></html>",
                "2000 - 3000 EUR",
                List.of("Java", "Spring Boot"),
                List.of("Java"),
                List.of("Spring Boot"),
                "Acum 1 zi",
                score,
                comp,
                "Competitie " + comp,
                "10 aplicanti",
                1,
                "ext-" + id,
                "hash-" + id,
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                OffsetDateTime.now(),
                "ACTIVE",
                false
        );
    }

    @Test
    @DisplayName("withoutRawDescription ar trebui să elimine descrierea brută dar să păstreze restul atributelor")
    void testWithoutRawDescription() {
        UnifiedJobListingDto fullJob = createDummyJob("job-1", "Java Senior", "DEVJOB_RO", "SENIOR", "HIGH", 85.0);
        assertNotNull(fullJob.rawDescription());

        UnifiedJobListingDto stripped = fullJob.withoutRawDescription();

        assertNull(stripped.rawDescription());
        assertEquals(fullJob.id(), stripped.id());
        assertEquals(fullJob.jobTitle(), stripped.jobTitle());
        assertEquals(fullJob.companyName(), stripped.companyName());
        assertEquals(fullJob.atsMatchScore(), stripped.atsMatchScore());
        assertEquals(fullJob.experienceLevel(), stripped.experienceLevel());
        assertEquals(fullJob.competitiveness(), stripped.competitiveness());
    }

    @Test
    @DisplayName("Paginare server-side cu 25 de joburi (pagina 1, size 10)")
    void testSearchJobsPaginatedPage1() {
        for (int i = 1; i <= 25; i++) {
            jobSearchService.getActiveLiveJobsCache().add(
                    createDummyJob("job-" + i, "Java Developer " + i, "DEVJOB_RO", "MID", "MEDIUM", 70.0)
            );
        }

        when(jobAtsMatchEngine.getCandidateCvText(testUserId)).thenReturn("java spring boot");
        when(jobAtsMatchEngine.evaluateAtsMatch(any(), any(), any()))
                .thenReturn(new AtsMatchResult(70.0, List.of("Java"), List.of("Spring Boot"), 70.0, 70.0));

        JobSearchResponse response = jobSearchService.searchJobsPaginated(
                testUserId, null, null, "ALL", "ALL", "ALL", "ALL",
                "MATCH_AND_RECENCY", "ALL", "ACTIVE", "ALL", "ALL", "ALL",
                1, 10
        );

        assertNotNull(response);
        assertEquals(25, response.totalElements());
        assertEquals(3, response.totalPages());
        assertEquals(1, response.currentPage());
        assertEquals(10, response.pageSize());
        assertEquals(10, response.content().size());
        assertEquals(10, response.jobs().size());
        assertTrue(response.hasNext());
        assertFalse(response.hasPrevious());

        // Verificăm că fiecare element din pagină are rawDescription decupat (null)
        for (UnifiedJobListingDto card : response.content()) {
            assertNull(card.rawDescription(), "rawDescription trebuie sa fie null pentru a reduce payload-ul HTTP");
            assertNotNull(card.jobTitle());
            assertNotNull(card.companyName());
        }
    }

    @Test
    @DisplayName("Paginare server-side cu 25 de joburi (pagina 3 - ultima pagină cu 5 elemente)")
    void testSearchJobsPaginatedPage3() {
        for (int i = 1; i <= 25; i++) {
            jobSearchService.getActiveLiveJobsCache().add(
                    createDummyJob("job-" + i, "Java Developer " + i, "DEVJOB_RO", "MID", "MEDIUM", 70.0)
            );
        }

        when(jobAtsMatchEngine.getCandidateCvText(testUserId)).thenReturn("java spring boot");
        when(jobAtsMatchEngine.evaluateAtsMatch(any(), any(), any()))
                .thenReturn(new AtsMatchResult(70.0, List.of("Java"), List.of("Spring Boot"), 70.0, 70.0));

        JobSearchResponse response = jobSearchService.searchJobsPaginated(
                testUserId, null, null, "ALL", "ALL", "ALL", "ALL",
                "MATCH_AND_RECENCY", "ALL", "ACTIVE", "ALL", "ALL", "ALL",
                3, 10
        );

        assertNotNull(response);
        assertEquals(25, response.totalElements());
        assertEquals(3, response.totalPages());
        assertEquals(3, response.currentPage());
        assertEquals(5, response.content().size());
        assertFalse(response.hasNext());
        assertTrue(response.hasPrevious());
    }

    @Test
    @DisplayName("Filtrare server-side după competitivitate LOW și scor ATS TOP_80")
    void testSearchWithCompetitivenessAndAtsScoreFilters() {
        jobSearchService.getActiveLiveJobsCache().add(createDummyJob("j1", "Java Dev", "DEVJOB_RO", "MID", "LOW", 85.0));
        jobSearchService.getActiveLiveJobsCache().add(createDummyJob("j2", "Java Dev", "DEVJOB_RO", "MID", "HIGH", 85.0));
        jobSearchService.getActiveLiveJobsCache().add(createDummyJob("j3", "Java Dev", "DEVJOB_RO", "MID", "LOW", 50.0));

        when(jobAtsMatchEngine.getCandidateCvText(testUserId)).thenReturn("java");
        when(jobAtsMatchEngine.evaluateAtsMatch(any(), any(), any())).thenAnswer(invocation -> {
            // Simulăm scorul din test
            return new AtsMatchResult(85.0, List.of("Java"), Collections.emptyList(), 85.0, 85.0);
        });

        // Căutare cu filtru competitivitate LOW
        JobSearchResponse responseLow = jobSearchService.searchJobsPaginated(
                testUserId, null, null, "ALL", "ALL", "ALL", "ALL",
                "MATCH_AND_RECENCY", "ALL", "ACTIVE", "ALL", "LOW", "ALL",
                1, 10
        );

        // Doar j1 și j3 au LOW
        assertEquals(2, responseLow.totalElements());
        assertEquals(2, responseLow.content().size());

        // Căutare cu filtru ATS TOP_80 și competitivitate LOW
        JobSearchResponse responseTop80AndLow = jobSearchService.searchJobsPaginated(
                testUserId, null, null, "ALL", "ALL", "ALL", "ALL",
                "MATCH_AND_RECENCY", "ALL", "ACTIVE", "ALL", "LOW", "TOP_80",
                1, 10
        );

        // Doar j1 are scor >= 80 și LOW
        assertEquals(2, responseTop80AndLow.totalElements());
        for (UnifiedJobListingDto dto : responseTop80AndLow.content()) {
            assertEquals("LOW", dto.competitiveness());
            assertTrue(dto.atsMatchScore() >= 80.0);
        }
    }
}
