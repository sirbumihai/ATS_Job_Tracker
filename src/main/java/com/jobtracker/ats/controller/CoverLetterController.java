package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.CoverLetterRequest;
import com.jobtracker.ats.dto.CoverLetterResponse;
import com.jobtracker.ats.service.CoverLetterService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class CoverLetterController {

    private final CoverLetterService coverLetterService;
    private static final UUID DEFAULT_USER_ID = UUID.fromString("23fe8bdd-08f4-413d-9985-f99c21040b59");

    @PostMapping({"/api/v1/ai/cover-letter", "/api/v1/cover-letter"})
    public ResponseEntity<CoverLetterResponse> generateCoverLetter(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestBody CoverLetterRequest request) {

        UUID effectiveUserId = userId != null ? userId : DEFAULT_USER_ID;
        log.info("[COVER LETTER CONTROLLER] Cerere de generare scrisoare primită de la userId={}", effectiveUserId);
        CoverLetterResponse response = coverLetterService.generateCoverLetter(effectiveUserId, request);
        return ResponseEntity.ok(response);
    }
}
