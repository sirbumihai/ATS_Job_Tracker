package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.linkedin.LinkedInOptimizationRequest;
import com.jobtracker.ats.dto.linkedin.LinkedInOptimizationResult;
import com.jobtracker.ats.dto.linkedin.LinkedInProfileDto;
import com.jobtracker.ats.service.LinkedInOptimizerService;
import com.jobtracker.ats.service.LinkedInPdfParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/linkedin")
@RequiredArgsConstructor
@Slf4j
public class LinkedInOptimizerController {

    private final LinkedInPdfParserService linkedInPdfParserService;
    private final LinkedInOptimizerService linkedInOptimizerService;

    @PostMapping(value = "/parse-pdf", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<LinkedInProfileDto> parseLinkedInPdf(@RequestParam("file") MultipartFile file) {
        log.info("[LINKEDIN OPTIMIZER] Parsare fișier PDF exportat din LinkedIn: {}", file.getOriginalFilename());
        LinkedInProfileDto profile = linkedInPdfParserService.parsePdfFile(file);
        return ResponseEntity.ok(profile);
    }

    @PostMapping("/optimize")
    public ResponseEntity<LinkedInOptimizationResult> optimizeProfile(@RequestBody LinkedInOptimizationRequest request) {
        log.info("[LINKEDIN OPTIMIZER] Cerere optimizare profil pentru: {}",
                request.profile() != null ? request.profile().fullName() : "necunoscut");
        LinkedInOptimizationResult result = linkedInOptimizerService.optimizeProfile(request);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/demo-profile")
    public ResponseEntity<LinkedInProfileDto> getDemoProfile() {
        log.info("[LINKEDIN OPTIMIZER] Încărcare profil demonstrativ inițial (Sirbu Mihai)");
        return ResponseEntity.ok(linkedInOptimizerService.getDemoProfile());
    }

    @GetMapping("/all-star-profile")
    public ResponseEntity<LinkedInProfileDto> getAllStarProfile() {
        log.info("[LINKEDIN OPTIMIZER] Încărcare profil complet All-Star 100/100 (Sirbu Mihai)");
        return ResponseEntity.ok(linkedInOptimizerService.getAllStarProfile());
    }

    @PostMapping("/sync-cv")
    public ResponseEntity<com.jobtracker.ats.dto.linkedin.LinkedInCvSyncResponse> syncWithCv(
            @RequestBody com.jobtracker.ats.dto.linkedin.LinkedInCvSyncRequest request) {
        log.info("[LINKEDIN OPTIMIZER] Sincronizare profil LinkedIn cu datele din CV");
        com.jobtracker.ats.dto.linkedin.LinkedInCvSyncResponse response =
                linkedInOptimizerService.mergeCvIntoProfile(request.profile(), request.cv());
        return ResponseEntity.ok(response);
    }
}
