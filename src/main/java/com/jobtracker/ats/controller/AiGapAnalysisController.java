package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.dto.AtsPillarBreakdownDto;
import com.jobtracker.ats.service.AiGapAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class AiGapAnalysisController {

    private final AiGapAnalysisService aiGapAnalysisService;

    @PostMapping("/api/v1/applications/{applicationId}/analysis")
    public ResponseEntity<AiGapAnalysisResponse> generateAnalysis(@PathVariable UUID applicationId) {
        AiGapAnalysisResponse response = aiGapAnalysisService.generateGapAnalysis(applicationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/applications/{applicationId}/analysis")
    public ResponseEntity<AiGapAnalysisResponse> getAnalysis(@PathVariable UUID applicationId) {
        AiGapAnalysisResponse response = aiGapAnalysisService.generateGapAnalysis(applicationId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/ai/gap-analysis")
    public ResponseEntity<AiGapAnalysisResponse> generateGapAnalysisAlias(
            @RequestParam(required = false) UUID applicationId,
            @RequestBody(required = false) Map<String, Object> body) {
        UUID appId = applicationId;
        if (appId == null && body != null && body.containsKey("applicationId")) {
            appId = UUID.fromString(String.valueOf(body.get("applicationId")));
        }
        if (appId == null) {
            throw new IllegalArgumentException("Parametrul applicationId este obligatoriu.");
        }
        AiGapAnalysisResponse response = aiGapAnalysisService.generateGapAnalysis(appId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/ai/gap-analysis")
    public ResponseEntity<AiGapAnalysisResponse> getGapAnalysisAlias(@RequestParam UUID applicationId) {
        AiGapAnalysisResponse response = aiGapAnalysisService.generateGapAnalysis(applicationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/api/v1/ai/polish-diagnosis")
    public ResponseEntity<AtsPillarBreakdownDto> getPolishDiagnosis(
            @RequestParam(required = false) UUID applicationId,
            @RequestParam(required = false) UUID cvProfileId) {
        AtsPillarBreakdownDto dto = aiGapAnalysisService.calculateDetailedPillarBreakdown(applicationId, cvProfileId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/api/v1/ai/polish-diagnosis")
    public ResponseEntity<AtsPillarBreakdownDto> getPolishDiagnosisPost(@RequestBody(required = false) Map<String, Object> body) {
        UUID appId = null;
        UUID cvId = null;
        if (body != null) {
            if (body.containsKey("applicationId") && body.get("applicationId") != null) {
                appId = UUID.fromString(String.valueOf(body.get("applicationId")));
            }
            if (body.containsKey("cvProfileId") && body.get("cvProfileId") != null) {
                cvId = UUID.fromString(String.valueOf(body.get("cvProfileId")));
            }
        }
        AtsPillarBreakdownDto dto = aiGapAnalysisService.calculateDetailedPillarBreakdown(appId, cvId);
        return ResponseEntity.ok(dto);
    }

    @PostMapping("/api/v1/ai/rewrite-bullet")
    public ResponseEntity<Map<String, String>> rewriteBullet(@RequestBody Map<String, String> request) {
        String bulletText = request.getOrDefault("bulletText", "");
        String context = request.getOrDefault("context", "");
        Map<String, String> response = aiGapAnalysisService.rewriteSingleBullet(bulletText, context);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/v1/ai/match-job")
    public ResponseEntity<Map<String, Object>> matchJobWithAi(
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestBody Map<String, Object> request) {
        UUID userId = headerUserId;
        if (userId == null && request.containsKey("userId") && request.get("userId") != null) {
            try {
                userId = UUID.fromString(String.valueOf(request.get("userId")));
            } catch (Exception ignored) {}
        }
        if (userId == null) {
            userId = UUID.fromString("23fe8bdd-08f4-413d-9985-f99c21040b59");
        }
        String jobTitle = (String) request.getOrDefault("jobTitle", "");
        String rawDescription = (String) request.getOrDefault("rawDescription", "");
        String jobId = (String) request.getOrDefault("jobId", null);

        Map<String, Object> result = aiGapAnalysisService.matchJobWithAi(jobId, jobTitle, rawDescription, userId);
        return ResponseEntity.ok(result);
    }
}
