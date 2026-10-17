package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_LOCATION;
import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_SALARY;
import static com.jobtracker.ats.util.JobNormalizationUtils.stableId;
import static org.junit.jupiter.api.Assertions.*;

class DevJobRoScraperTest {

    private final DevJobRoScraper scraper = new DevJobRoScraper(null);

    @Test
    @DisplayName("Desparte titlul DevJob în rol, companie și salariu")
    void parsesTitleCompanyAndSalary() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parseFeed(CrawlerFixtures.xml("devjob/rss.xml"), CrawlerFixtures.newContext(jobs));

        assertEquals(2, jobs.size());

        UnifiedJobListingDto java = jobs.get(0);
        assertEquals("Junior Java Developer", java.jobTitle());
        assertEquals("Acme Software", java.companyName());
        assertEquals("5000-7000 RON", java.salaryRange());
        assertEquals("devjob-job-1001", java.id());
        assertEquals("REMOTE", java.workModel());
        assertNotNull(java.postedAt());
        assertTrue(java.skillsRequired().contains("Docker"));
        // DevJob nu publică locația în RSS: nu mai presupunem "Bucharest / Remote"
        assertEquals(UNKNOWN_LOCATION, java.location());
    }

    @Test
    @DisplayName("Fără guid, ID-ul derivă din URL și rămâne același la fiecare rulare")
    void stableIdWithoutGuid() {
        List<UnifiedJobListingDto> first = CrawlerFixtures.newSink();
        List<UnifiedJobListingDto> second = CrawlerFixtures.newSink();
        scraper.parseFeed(CrawlerFixtures.xml("devjob/rss.xml"), CrawlerFixtures.newContext(first));
        scraper.parseFeed(CrawlerFixtures.xml("devjob/rss.xml"), CrawlerFixtures.newContext(second));

        UnifiedJobListingDto python = first.get(1);
        assertEquals("devjob-" + stableId("https://devjob.ro/jobs/python-developer-beta"), python.id());
        assertEquals(python.id(), second.get(1).id());
        assertEquals(UNKNOWN_SALARY, python.salaryRange());
        assertNull(python.postedAt());
    }
}
