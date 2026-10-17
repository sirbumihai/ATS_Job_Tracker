package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_LOCATION;
import static org.junit.jupiter.api.Assertions.*;

class HipoScraperTest {

    private final HipoScraper scraper = new HipoScraper(null);

    @Test
    @DisplayName("Parsează cardurile Hipo cu companie, locație și logo reale")
    void parsesCards() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("hipo/listing.html"), CrawlerFixtures.newContext(jobs));

        assertEquals(2, jobs.size());

        UnifiedJobListingDto dev = jobs.get(0);
        assertEquals("Junior Developer", dev.jobTitle());
        assertEquals("Acme Software", dev.companyName());
        assertEquals("Iași", dev.location());
        assertEquals("https://www.hipo.ro/logos/acme.png", dev.companyLogoUrl());
        assertEquals("https://www.hipo.ro/locuri-de-munca/vizualizareOferta/12345/Acme-Software/Junior-Developer", dev.directApplyUrl());
        assertEquals("HYBRID", dev.workModel());
    }

    @Test
    @DisplayName("Deduce compania din URL când lipsește din card și nu inventează logo")
    void derivesCompanyFromHref() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("hipo/listing.html"), CrawlerFixtures.newContext(jobs));

        UnifiedJobListingDto cloud = jobs.get(1);
        assertEquals("Beta Tech", cloud.companyName());
        assertEquals("REMOTE", cloud.workModel());
        assertNull(cloud.companyLogoUrl());
        assertNotEquals(UNKNOWN_LOCATION, cloud.location());
    }
}
