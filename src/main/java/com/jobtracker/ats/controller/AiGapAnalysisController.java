package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.AiGapAnalysisResponse;
import com.jobtracker.ats.service.AiGapAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications/{applicationId}/analysis")
@RequiredArgsConstructor
public class AiGapAnalysisController {

    private final AiGapAnalysisService aiGapAnalysisService;

    @PostMapping
    public ResponseEntity<AiGapAnalysisResponse> generateAnalysis(@PathVariable UUID applicationId) {
        AiGapAnalysisResponse response = aiGapAnalysisService.generateGapAnalysis(applicationId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<AiGapAnalysisResponse> getAnalysis(@PathVariable UUID applicationId) {
        AiGapAnalysisResponse response = aiGapAnalysisService.generateGapAnalysis(applicationId);
        return ResponseEntity.ok(response);
    }
}
