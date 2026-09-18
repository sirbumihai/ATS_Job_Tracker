package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;

import java.util.List;
import java.util.Set;

/**
 * Interfață de bază pentru crawler-ele de joburi (Strategy Pattern).
 * Fiecare implementare este responsabilă de extragerea și deduplicarea anunțurilor unei platforme specifice.
 */
public interface JobScraper {

    /**
     * Numele unic al platformei (ex: "DEVJOB_RO", "LINKEDIN", "EJOBS", etc.)
     */
    String getPlatformName();

    /**
     * Execută procesul de scraping pentru platforma curentă.
     *
     * @param freshList       Lista acumulatoare în care se adaugă noile joburi găsite
     * @param seenDedupKeys   Set partajat pentru deduplicare cross-platform (titlu + companie)
     * @param knownDbUrls     Set de URL-uri deja existente în baza de date pentru crawling diferențial
     */
    void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls);
}
