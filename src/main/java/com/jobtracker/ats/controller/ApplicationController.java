package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.CreateApplicationRequest;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponse> createApplication(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateApplicationRequest request) {

        ApplicationResponse response = applicationService.createApplication(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ApplicationResponse>> getUserApplications(
            @RequestHeader("X-User-Id") UUID userId) {

        List<ApplicationResponse> applications = applicationService.getUserApplications(userId);
        return ResponseEntity.ok(applications);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApplicationResponse> updateStatus(
            @PathVariable UUID id,
            @RequestParam ApplicationStatus status) {

        ApplicationResponse response = applicationService.updateApplicationStatus(id, status);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/cv/{cvProfileId}")
    public ResponseEntity<ApplicationResponse> attachCvProfile(
            @PathVariable UUID id,
            @PathVariable UUID cvProfileId) {

        ApplicationResponse response = applicationService.attachCvProfile(id, cvProfileId);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/resume/{resumeId}")
    public ResponseEntity<ApplicationResponse> attachResume(
            @PathVariable UUID id,
            @PathVariable UUID resumeId) {

        ApplicationResponse response = applicationService.attachResume(id, resumeId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponse> getApplicationById(@PathVariable UUID id) {
        ApplicationResponse response = applicationService.getApplicationById(id);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable UUID id) {
        applicationService.deleteApplication(id);
        return ResponseEntity.noContent().build();
    }
}
