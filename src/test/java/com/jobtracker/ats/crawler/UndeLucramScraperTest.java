package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_COMPANY;
import static com.jobtracker.ats.util.JobNormalizationUtils.UNKNOWN_LOCATION;
import static org.junit.jupiter.api.Assertions.*;

class UndeLucramScraperTest {

    private final UndeLucramScraper scraper = new UndeLucramScraper(null);

    @Test
    @DisplayName("Preia doar link-urile de anunț IT, o singură dată per URL")
    void parsesJobLinksOnce() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("undelucram/listing.html"), CrawlerFixtures.newContext(jobs));

        assertEquals(List.of("Junior Java Developer", "Backend engineer"),
                jobs.stream().map(UnifiedJobListingDto::jobTitle).toList());
        assertEquals("https://www.undelucram.ro/ro/locuri-de-munca/junior-java-developer/98765", jobs.get(0).directApplyUrl());
    }

    @Test
    @DisplayName("Compania și locația lipsesc din listă, deci nu sunt inventate")
    void doesNotInventCompanyOrLocation() {
        List<UnifiedJobListingDto> jobs = CrawlerFixtures.newSink();
        scraper.parsePage(CrawlerFixtures.html("undelucram/listing.html"), CrawlerFixtures.newContext(jobs));

        for (UnifiedJobListingDto job : jobs) {
            assertEquals(UNKNOWN_COMPANY, job.companyName());
            assertEquals(UNKNOWN_LOCATION, job.location());
            assertNull(job.companyLogoUrl());
            assertNull(job.applicantCountText());
        }
    }
}
