package com.jobtracker.ats.crawler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_COMPANY;
import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_LOCATION;
import static org.junit.jupiter.api.Assertions.*;

class EjobsScraperTest {

    private final EjobsScraper scraper = new EjobsScraper(new ObjectMapper(), null);

    @Test
    @DisplayName("Citește joburile din starea Nuxt (__NUXT_DATA__) rezolvând referințele")
    void parsesNuxtState() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("ejobs/nuxt-state.html"), CrawlerFixtures.newContext(jobs));

        assertEquals(2, jobs.size());

        UnifiedJobListingDto java = jobs.get(0);
        assertEquals("Junior Java Developer", java.jobTitle());
        assertEquals("Acme Software", java.companyName());
        assertEquals("6000 - 8000 RON", java.salaryRange());
        assertEquals("https://www.ejobs.ro/user/locuri-de-munca/junior-java-developer/4512345", java.directApplyUrl());
        assertEquals("ejobs-live-userlocuri-de-muncajunior-java-developer4512345", java.id());
        assertNotNull(java.postedAt());
        assertTrue(java.postedDaysAgo() >= 0);
        // eJobs nu publică locația în starea Nuxt: nu o mai inventăm
        assertEquals(UNKNOWN_LOCATION, java.location());

        UnifiedJobListingDto data = jobs.get(1);
        assertEquals("Data Analyst", data.jobTitle());
        assertEquals(UNKNOWN_COMPANY, data.companyName());
    }

    @Test
    @DisplayName("Fără stare Nuxt, folosește link-urile din HTML și deduce titlul din slug")
    void fallsBackToHtmlLinks() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("ejobs/html-fallback.html"), CrawlerFixtures.newContext(jobs));

        assertEquals(List.of("Frontend React Developer", "Devops engineer"),
                jobs.stream().map(UnifiedJobListingDto::jobTitle).toList());
        assertEquals("https://www.ejobs.ro/user/locuri-de-munca/devops-engineer/4700002", jobs.get(1).directApplyUrl());
        assertNull(jobs.get(0).companyLogoUrl());
    }
}
