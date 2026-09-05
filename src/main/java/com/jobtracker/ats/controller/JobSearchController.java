package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
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
    public ResponseEntity<List<UnifiedJobListingDto>> searchJobs(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) UUID userId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false, defaultValue = "ALL") String platform,
            @RequestParam(required = false, defaultValue = "ALL") String level,
            @RequestParam(required = false, defaultValue = "ALL") String roleCategory,
            @RequestParam(required = false, defaultValue = "ALL") String workModel,
            @RequestParam(required = false, defaultValue = "MATCH_AND_RECENCY") String sortBy,
            @RequestParam(required = false, defaultValue = "ALL") String datePosted
    ) {
        UUID activeUserId = headerUserId != null ? headerUserId : userId;
        List<UnifiedJobListingDto> jobs = jobSearchAggregatorService.searchJobs(
                activeUserId,
                keyword,
                location,
                platform,
                level,
                roleCategory,
                workModel,
                sortBy,
                datePosted
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
    public ResponseEntity<UnifiedJobListingDto> getJobDetails(@PathVariable String id) {
        UnifiedJobListingDto details = jobSearchAggregatorService.getJobDetails(id);
        if (details == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(details);
    }

    @PostMapping("/sync-live")
    public ResponseEntity<Map<String, Object>> syncLiveJobs() {
        int totalJobs = jobSearchAggregatorService.refreshLiveJobs();
        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Feed-ul de joburi a fost actualizat cu succes.",
                "totalLiveJobs", totalJobs
        ));
    }
}
