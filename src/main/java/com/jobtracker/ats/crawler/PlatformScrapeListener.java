package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;

import java.util.List;

/**
 * Primește rezultatul fiecărei platforme imediat ce aceasta termină, fără să aștepte celelalte.
 * Orchestratorul îl apelează pe rând, din firul care a pornit rularea, deci două apeluri nu se suprapun.
 */
@FunctionalInterface
public interface PlatformScrapeListener {

    PlatformScrapeListener NONE = (report, newJobs) -> { };

    /**
     * @param report  raportul platformei: succes sau eșec, durată, joburi colectate
     * @param newJobs joburile platformei rămase după deduplicarea globală, adică fără cele
     *                anunțate deja de platformele care au terminat mai devreme
     */
    void onPlatformFinished(PlatformScrapeResult report, List<UnifiedJobListingDto> newJobs);
}
