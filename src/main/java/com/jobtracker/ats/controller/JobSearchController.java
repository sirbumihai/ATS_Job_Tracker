package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.CrawlerSyncStatus;
import com.jobtracker.ats.dto.JobSearchResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.JobChange;
import com.jobtracker.ats.service.JobSearchAggregatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobSearchController {

    private final JobSearchAggregatorService jobSearchAggregatorService;

    @GetMapping("/search")
    public ResponseEntity<?> searchJobs(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "ALL") String platform,
            @RequestParam(required = false, defaultValue = "ALL") String level,
            @RequestParam(required = false, defaultValue = "ALL") String roleCategory,
            @RequestParam(required = false, defaultValue = "ALL") String workModel,
            @RequestParam(required = false, defaultValue = "MATCH_AND_RECENCY") String sortBy,
            @RequestParam(required = false, defaultValue = "ALL") String datePosted,
            @RequestParam(required = false, defaultValue = "ACTIVE") String status,
            @RequestParam(required = false, defaultValue = "ALL") String discovered,
            @RequestParam(required = false, defaultValue = "ALL") String competitiveness,
            @RequestParam(required = false, defaultValue = "ALL") String atsScore,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false, defaultValue = "12") Integer size
    ) {
        UUID activeUserId = headerUserId != null ? headerUserId : userId;
        if (page != null) {
            JobSearchResponse response = jobSearchAggregatorService.searchJobsPaginated(
                    activeUserId,
                    keyword,
                    location,
                    platform,
                    level,
                    roleCategory,
                    workModel,
                    sortBy,
                    datePosted,
                    status,
                    discovered,
                    competitiveness,
                    atsScore,
                    page,
                    size != null ? size : 12
            );
            return ResponseEntity.ok(response);
        }

        List<UnifiedJobListingDto> jobs = jobSearchAggregatorService.searchJobs(
                activeUserId,
                keyword,
                location,
                platform,
                level,
                roleCategory,
                workModel,
                sortBy,
                datePosted,
                status,
                discovered
        );
        return ResponseEntity.ok(jobs);
    }

    @PostMapping("/save-to-kanban")
    public ResponseEntity<ApplicationResponse> saveToKanban(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) UUID userId,
            @RequestBody UnifiedJobListingDto jobDto
    ) {
        UUID activeUserId = headerUserId != null ? headerUserId : userId;
        if (activeUserId == null) {
            // Default user fallback
            activeUserId = UUID.fromString("23fe8bdd-08f4-413d-9985-f99c21040b59");
        }

        ApplicationResponse response = jobSearchAggregatorService.saveJobToKanban(activeUserId, jobDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getJobStats() {
        return ResponseEntity.ok(jobSearchAggregatorService.getJobStats());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<UnifiedJobListingDto> getJobDetails(
            @PathVariable String id,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) UUID userId
    ) {
        UUID activeUserId = headerUserId != null ? headerUserId : userId;
        UnifiedJobListingDto details = jobSearchAggregatorService.getJobDetails(id, activeUserId);
        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(details);
    }

    @GetMapping("/{id}/changes")
    public ResponseEntity<List<JobChange>> getJobChanges(@PathVariable String id) {
        List<JobChange> changes = jobSearchAggregatorService.getJobChanges(id);
        return ResponseEntity.ok(changes);
    }

    @PostMapping("/expire-old-jobs")
    public ResponseEntity<Map<String, Object>> expireOldJobs() {
        int expiredCount = jobSearchAggregatorService.markExpiredJobs();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Verificare expirare joburi finalizată cu succes.",
                "expiredCount", expiredCount
        ));
    }

    /**
     * Pornește sincronizarea în fundal și răspunde imediat (202). Joburile fiecărei platforme apar în
     * căutare imediat ce platforma termină; progresul se citește din /crawler-status. Dacă rulează deja
     * o sincronizare, nu se pornește alta.
     */
    @PostMapping("/sync-live")
    public ResponseEntity<Map<String, Object>> syncLiveJobs() {
        boolean started = jobSearchAggregatorService.startLiveRefresh();
        return ResponseEntity.accepted().body(Map.of(
                "status", started ? "STARTED" : "ALREADY_RUNNING",
                "message", started
                        ? "Sincronizarea a pornit în fundal; joburile fiecărui site apar imediat ce site-ul termină."
                        : "O sincronizare rulează deja; nu s-a pornit alta.",
                "crawlerStatus", jobSearchAggregatorService.getSyncStatus()
        ));
    }

    @GetMapping("/crawler-status")
    public ResponseEntity<CrawlerSyncStatus> getCrawlerStatus() {
        return ResponseEntity.ok(jobSearchAggregatorService.getSyncStatus());
    }
}
