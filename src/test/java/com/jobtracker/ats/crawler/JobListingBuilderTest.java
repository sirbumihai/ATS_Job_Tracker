package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;
import static org.junit.jupiter.api.Assertions.*;

class JobListingBuilderTest {

    @Test
    @DisplayName("Valorile implicite sunt neutre: fără scor, logo sau număr de candidați")
    void defaultsAreNeutral() {
        UnifiedJobListingDto job = JobListingBuilder.of("TEST", "t-")
                .title("Java Developer")
                .applyUrl("https://example.com/jobs/1")
                .build();

        assertEquals(UNKNOWN_COMPANY, job.companyName());
        assertEquals(UNKNOWN_LOCATION, job.location());
        assertEquals(UNKNOWN_SALARY, job.salaryRange());
        assertEquals(UNKNOWN_POSTED_DATE, job.postedDateAgo());
        assertNull(job.companyLogoUrl());
        assertNull(job.applicantCountText());
        assertNull(job.postedAt());
        assertEquals(0.0, job.atsMatchScore());
        assertEquals(-1, job.postedDaysAgo());
        assertEquals("MEDIUM", job.competitiveness());
        assertEquals("t-" + stableId("https://example.com/jobs/1"), job.id());
        assertEquals("ACTIVE", job.status());
    }

    @Test
    @DisplayName("Data publicării determină vechimea și estimarea competiției")
    void postedDateDrivesRecencyFields() {
        UnifiedJobListingDto fresh = JobListingBuilder.of("TEST", "t-")
                .title("Java Developer")
                .applyUrl("https://example.com/jobs/2")
                .postedAt(OffsetDateTime.now().minusDays(1))
                .build();
        assertEquals(1, fresh.postedDaysAgo());
        assertEquals("Ieri", fresh.postedDateAgo());
        assertEquals("LOW", fresh.competitiveness());

        UnifiedJobListingDto old = JobListingBuilder.of("TEST", "t-")
                .title("Java Developer")
                .applyUrl("https://example.com/jobs/3")
                .postedDaysAgo(30)
                .build();
        assertNotNull(old.postedAt());
        assertEquals("HIGH", old.competitiveness());
        assertEquals("Competiție Ridicată", old.competitivenessLabel());
    }

    @Test
    @DisplayName("Valorile goale primite de la scraper devin valori neutre")
    void blankValuesBecomeUnknown() {
        UnifiedJobListingDto job = JobListingBuilder.of("TEST", "t-")
                .title("Java Developer")
                .company("  ")
                .location("")
                .salary(null)
                .logoUrl("")
                .applyUrl("https://example.com/jobs/4")
                .build();

        assertEquals(UNKNOWN_COMPANY, job.companyName());
        assertEquals(UNKNOWN_LOCATION, job.location());
        assertEquals(UNKNOWN_SALARY, job.salaryRange());
        assertNull(job.companyLogoUrl());
    }

    @Test
    @DisplayName("Același titlu fără companie cunoscută nu comasează joburi cu URL-uri diferite")
    void unknownCompanyDedupIncludesUrl() {
        ScrapeContext ctx = new ScrapeContext(new java.util.ArrayList<>(), new HashSet<>(), new HashSet<>());

        assertTrue(ctx.claim("Java Developer", null, "https://example.com/a"));
        assertTrue(ctx.claim("Java Developer", null, "https://example.com/b"));
        assertFalse(ctx.claim("Java Developer", null, "https://example.com/a"));

        assertTrue(ctx.claim("Java Developer", "Acme", "https://example.com/c"));
        assertFalse(ctx.claim("Java Developer", "Acme", "https://example.com/d"));
        assertEquals(3, ctx.collectedCount());
    }

    @Test
    @DisplayName("ID-ul stabil e determinist și diferă între URL-uri")
    void stableIdIsDeterministic() {
        assertEquals(stableId("https://example.com/a"), stableId("https://example.com/a"));
        assertNotEquals(stableId("https://example.com/a"), stableId("https://example.com/b"));
        assertEquals(16, stableId("https://example.com/a").length());
        assertEquals(List.of(), JobListingBuilder.of("TEST", "t-").title("x").applyUrl("u").build().skillsRequired());
    }
}
