package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.jobtracker.ats.util.JobNormalizationUtils.stableId;
import static org.junit.jupiter.api.Assertions.*;

class LinkedInScraperTest {

    private final LinkedInScraper scraper = new LinkedInScraper();
    private final LinkedInScraper.SearchQuery query = new LinkedInScraper.SearchQuery("Junior Developer", "Romania", "", 1);

    private LinkedInScraper.PageResult parse(List<UnifiedJobListingDto> sink, Set<String> knownDbUrls) {
        return scraper.parseResultsPage(CrawlerFixtures.html("linkedin/search-page.html"), query,
                sink, new HashSet<>(), knownDbUrls, new HashSet<>());
    }

    @Test
    @DisplayName("Parsează cardurile de căutare și curăță parametrii de tracking din URL")
    void parsesCards() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        LinkedInScraper.PageResult result = parse(jobs, Set.of());

        assertEquals(3, result.cards());
        assertEquals(2, jobs.size());

        UnifiedJobListingDto java = jobs.get(0);
        assertEquals("Junior Java Developer", java.jobTitle());
        assertEquals("Acme Software", java.companyName());
        assertEquals("Bucharest, Romania", java.location());
        assertEquals("https://ro.linkedin.com/jobs/view/junior-java-developer-at-acme-4012345678", java.directApplyUrl());
        assertEquals("li-live-4012345678", java.id());
        assertEquals("https://media.licdn.com/acme-logo.png", java.companyLogoUrl());
        assertNotNull(java.postedAt());
    }

    @Test
    @DisplayName("Doar semnalul 'early applicant' de la LinkedIn produce un text despre candidați")
    void applicantTextOnlyFromRealSignal() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        parse(jobs, Set.of());

        UnifiedJobListingDto java = jobs.get(0);
        assertEquals("LOW", java.competitiveness());
        assertNotNull(java.applicantCountText());

        UnifiedJobListingDto qa = jobs.get(1);
        assertNull(qa.applicantCountText());
        assertNull(qa.companyLogoUrl());
        assertEquals(7, qa.postedDaysAgo());
        assertEquals("REMOTE", qa.workModel());
    }

    @Test
    @DisplayName("URL fără ID numeric primește un ID stabil, nu unul aleator")
    void stableIdWithoutNumericJobId() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        parse(jobs, Set.of());

        String url = "https://ro.linkedin.com/jobs/view/qa-automation-engineer-at-beta";
        assertEquals("li-live-" + stableId(url), jobs.get(1).id());
    }

    @Test
    @DisplayName("URL-urile deja salvate în baza de date sunt sărite (crawling diferențial)")
    void skipsKnownDatabaseUrls() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        LinkedInScraper.PageResult result = parse(jobs,
                Set.of("https://ro.linkedin.com/jobs/view/junior-java-developer-at-acme-4012345678"));

        assertEquals(1, jobs.size());
        assertEquals("QA Automation Engineer", jobs.get(0).jobTitle());
        assertEquals(2, result.newJobs());
    }
}
