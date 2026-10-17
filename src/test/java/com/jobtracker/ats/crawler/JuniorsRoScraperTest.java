package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_COMPANY;
import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_LOCATION;
import static org.junit.jupiter.api.Assertions.*;

class JuniorsRoScraperTest {

    private final JuniorsRoScraper scraper = new JuniorsRoScraper(null);

    @Test
    @DisplayName("Parsează locația, data relativă și tag-urile din lista Juniors.ro")
    void parsesJobItems() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("juniors/listing.html"), CrawlerFixtures.newContext(jobs));

        assertEquals(2, jobs.size());

        UnifiedJobListingDto python = jobs.get(0);
        assertEquals("Junior Python Developer", python.jobTitle());
        assertEquals("Acme", python.companyName());
        assertEquals("Cluj-Napoca", python.location());
        assertEquals(2, python.postedDaysAgo());
        assertEquals(List.of("Python", "Django"), python.skillsRequired());
        assertEquals("https://juniors.ro/jobs/123-junior-python-developer/link", python.directApplyUrl());
    }

    @Test
    @DisplayName("Fără logo, locație sau dată: câmpurile rămân nespecificate")
    void leavesMissingFieldsUnknown() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("juniors/listing.html"), CrawlerFixtures.newContext(jobs));

        UnifiedJobListingDto tester = jobs.get(1);
        assertEquals("Software Tester", tester.jobTitle());
        assertEquals(UNKNOWN_COMPANY, tester.companyName());
        assertEquals(UNKNOWN_LOCATION, tester.location());
        assertEquals(-1, tester.postedDaysAgo());
        assertNull(tester.postedAt());
        assertNull(tester.companyLogoUrl());
    }
}
