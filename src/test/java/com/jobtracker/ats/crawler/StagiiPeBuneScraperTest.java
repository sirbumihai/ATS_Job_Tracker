package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_LOCATION;
import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_SALARY;
import static org.junit.jupiter.api.Assertions.*;

class StagiiPeBuneScraperTest {

    private final StagiiPeBuneScraper scraper = new StagiiPeBuneScraper(null);

    @Test
    @DisplayName("Separă data, plata și orașul din metadatele stagiului")
    void parsesMetadataSpans() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        boolean hasJobs = scraper.parsePage(CrawlerFixtures.html("stagiipebune/listing.html"), CrawlerFixtures.newContext(jobs));

        assertTrue(hasJobs);
        assertEquals(2, jobs.size());

        UnifiedJobListingDto dev = jobs.get(0);
        assertEquals("Software Developer Intern", dev.jobTitle());
        assertEquals("Acme Software", dev.companyName());
        assertEquals("Plătit", dev.salaryRange());
        assertEquals("București", dev.location());
        assertNotNull(dev.postedAt());
        assertEquals("INTERNSHIP", dev.experienceLevel());
        assertEquals("https://stagiipebune.ro/students/jobs/321/", dev.directApplyUrl());
    }

    @Test
    @DisplayName("Nu presupune că un stagiu e plătit sau că e în București")
    void doesNotAssumePaidOrBucharest() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("stagiipebune/listing.html"), CrawlerFixtures.newContext(jobs));

        UnifiedJobListingDto data = jobs.get(1);
        assertEquals(UNKNOWN_SALARY, data.salaryRange());
        assertEquals(UNKNOWN_LOCATION, data.location());
        assertNull(data.companyLogoUrl());
    }

    @Test
    @DisplayName("O pagină fără anunțuri oprește paginarea")
    void emptyPageStopsPagination() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        assertFalse(scraper.parsePage(CrawlerFixtures.html("stagiipebune/empty.html"), CrawlerFixtures.newContext(jobs)));
        assertTrue(jobs.isEmpty());
    }
}
