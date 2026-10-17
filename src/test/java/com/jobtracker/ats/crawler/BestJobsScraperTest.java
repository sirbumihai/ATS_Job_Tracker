package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_COMPANY;
import static org.junit.jupiter.api.Assertions.*;

class BestJobsScraperTest {

    private final BestJobsScraper scraper = new BestJobsScraper(null);

    @Test
    @DisplayName("Parsează cardurile IT, elimină duplicatele și joburile non-IT")
    void parsesItCardsAndSkipsDuplicates() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("bestjobs/listing.html"), CrawlerFixtures.newContext(jobs));

        assertEquals(2, jobs.size());

        UnifiedJobListingDto java = jobs.get(0);
        assertEquals("Junior Java Developer", java.jobTitle());
        assertEquals("Acme Software", java.companyName());
        assertEquals("Cluj-Napoca", java.location());
        assertEquals("5000 - 7000 RON", java.salaryRange());
        assertEquals("https://www.bestjobs.eu/loc-de-munca/junior-java-developer-acme-123", java.directApplyUrl());
        assertEquals("bestjobs-live-junior-java-developer-acme-123", java.id());
        assertEquals("https://imgcdn.bestjobs.eu/cdn/el/plain/employer_logo/acme.png", java.companyLogoUrl());
        assertEquals("JUNIOR", java.experienceLevel());
        assertEquals("BESTJOBS", java.sourcePlatform());
    }

    @Test
    @DisplayName("Câmpurile lipsă rămân goale, fără logo, companie sau număr de candidați inventate")
    void leavesMissingFieldsEmpty() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("bestjobs/listing.html"), CrawlerFixtures.newContext(jobs));

        UnifiedJobListingDto qa = jobs.get(1);
        assertEquals("QA Tester", qa.jobTitle());
        assertEquals(UNKNOWN_COMPANY, qa.companyName());
        assertEquals("REMOTE", qa.workModel());
        assertNull(qa.companyLogoUrl());
        assertNull(qa.applicantCountText());
        assertEquals(0.0, qa.atsMatchScore());
        assertEquals(-1, qa.postedDaysAgo());
    }
}
