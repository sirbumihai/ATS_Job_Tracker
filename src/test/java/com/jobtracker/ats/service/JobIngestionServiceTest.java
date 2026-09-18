package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.CachedJobListing;
import com.jobtracker.ats.entity.JobChange;
import com.jobtracker.ats.entity.JobStaging;
import com.jobtracker.ats.repository.CachedJobListingRepository;
import com.jobtracker.ats.repository.JobChangeRepository;
import com.jobtracker.ats.repository.JobStagingRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobIngestionServiceTest {

    @Mock
    private CachedJobListingRepository cachedJobListingRepository;

    @Mock
    private JobStagingRepository jobStagingRepository;

    @Mock
    private JobChangeRepository jobChangeRepository;

    @InjectMocks
    private JobIngestionService jobIngestionService;

    private UnifiedJobListingDto createJobDto(String id, String title, String company, String url, String desc) {
        return new UnifiedJobListingDto(
                id,
                title,
                company,
                "https://logo.url/" + id,
                "Bucuresti",
                "HYBRID",
                "MID",
                "DEVJOB_RO",
                url,
                desc,
                "2000 - 3000 EUR",
                List.of("Java"),
                List.of("Java"),
                Collections.emptyList(),
                "Astazi",
                80.0,
                "MEDIUM",
                "Competitie Medie",
                "10 aplicanti",
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
    @DisplayName("saveNewJobsToDatabase folosește interogare selectivă findByDirectApplyUrlIn și salvează joburi noi și modificate")
    void testSaveNewJobsToDatabaseSelectiveQuery() {
        UnifiedJobListingDto newJob = createJobDto("new-1", "Java Junior", "Startup SRL", "https://apply.com/job-1", "Descriere noua");
        UnifiedJobListingDto existingJobUpdated = createJobDto("ext-2", "Senior Lead Architect", "Tech Corp", "https://apply.com/job-2", "Descriere mult modificata");

        CachedJobListing dbJob = CachedJobListing.builder()
                .id("ext-2")
                .jobTitle("Senior Software Engineer")
                .companyName("Tech Corp")
                .directApplyUrl("https://apply.com/job-2")
                .contentHash("vechi-hash-123")
                .status("ACTIVE")
                .lastSeenAt(OffsetDateTime.now().minusDays(1))
                .build();

        // findByDirectApplyUrlIn returnează doar jobul existent
        when(cachedJobListingRepository.findByDirectApplyUrlIn(any())).thenReturn(List.of(dbJob));

        jobIngestionService.saveNewJobsToDatabase(List.of(newJob, existingJobUpdated));

        // Verificăm că NU s-a apelat findAll()
        verify(cachedJobListingRepository, never()).findAll();

        // Verificăm că s-a apelat interogarea selectivă findByDirectApplyUrlIn
        verify(cachedJobListingRepository).findByDirectApplyUrlIn(any());

        // Verificăm salvarea în staging
        verify(jobStagingRepository, atLeastOnce()).saveAll(anyList());

        // Verificăm salvarea în cached_live_jobs pentru inserare și actualizare
        verify(cachedJobListingRepository, atLeastOnce()).saveAll(anyList());

        // Verificăm înregistrarea evenimentelor în job_changes (CREATED pentru newJob, CONTENT_UPDATED pentru existingJobUpdated)
        ArgumentCaptor<List<JobChange>> changesCaptor = ArgumentCaptor.forClass(List.class);
        verify(jobChangeRepository, atLeastOnce()).saveAll(changesCaptor.capture());

        List<JobChange> capturedChanges = changesCaptor.getAllValues().stream().flatMap(List::stream).toList();
        assertTrue(capturedChanges.stream().anyMatch(c -> "CREATED".equals(c.getChangeType())));
        assertTrue(capturedChanges.stream().anyMatch(c -> "CONTENT_UPDATED".equals(c.getChangeType())));
    }

    @Test
    @DisplayName("markExpiredJobs marchează joburile nevăzute în ultimele 3 zile ca EXPIRED")
    void testMarkExpiredJobs() {
        CachedJobListing staleJob = CachedJobListing.builder()
                .id("stale-1")
                .jobTitle("Legacy Developer")
                .companyName("Old Corp")
                .directApplyUrl("https://apply.com/stale-1")
                .status("ACTIVE")
                .lastSeenAt(OffsetDateTime.now().minusDays(4))
                .build();

        when(cachedJobListingRepository.findActiveJobsNotSeenSince(any())).thenReturn(List.of(staleJob));

        int expiredCount = jobIngestionService.markExpiredJobs();

        assertEquals(1, expiredCount);
        assertEquals("EXPIRED", staleJob.getStatus());

        verify(cachedJobListingRepository).saveAll(List.of(staleJob));
        verify(jobChangeRepository).saveAll(anyList());
    }
}
