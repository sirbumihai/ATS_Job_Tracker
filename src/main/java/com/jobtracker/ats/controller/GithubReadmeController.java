package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.GithubReadmeRequest;
import com.jobtracker.ats.dto.GithubReadmeResponse;
import com.jobtracker.ats.service.GithubReadmeService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@Slf4j
public class GithubReadmeController {

    private final GithubReadmeService githubReadmeService;
    private static final UUID DEFAULT_USER_ID = UUID.fromString("23fe8bdd-08f4-413d-9985-f99c21040b59");

    @PostMapping({"/api/v1/github-readme", "/api/v1/ai/github-readme"})
    public ResponseEntity<GithubReadmeResponse> generateReadme(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId,
            @RequestBody GithubReadmeRequest request) {

        UUID effectiveUserId = userId != null ? userId : DEFAULT_USER_ID;
        log.info("[GITHUB README CONTROLLER] Cerere de generare README primită de la userId={}", effectiveUserId);
        GithubReadmeResponse response = githubReadmeService.generateReadme(effectiveUserId, request);
        return ResponseEntity.ok(response);
    }
}
