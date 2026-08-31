package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.CvOptimizeRequest;
import com.jobtracker.ats.dto.CvOptimizeResponse;
import com.jobtracker.ats.dto.CvProfileDto;
import com.jobtracker.ats.service.CvProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv")
@RequiredArgsConstructor
public class CvProfileController {

    private final CvProfileService cvProfileService;

    @GetMapping("/list")
    public ResponseEntity<List<CvProfileDto>> getCvProfilesList(@RequestHeader("X-User-Id") UUID userId) {
        List<CvProfileDto> list = cvProfileService.getCvProfilesByUserId(userId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CvProfileDto> getCvProfileById(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        CvProfileDto dto = cvProfileService.getCvProfileById(id, userId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<CvProfileDto> getCvProfile(@RequestHeader("X-User-Id") UUID userId) {
        CvProfileDto dto = cvProfileService.getCvProfileByUserId(userId);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PostMapping
    public ResponseEntity<CvProfileDto> createCvProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CvProfileDto dto) {
        CvProfileDto created = cvProfileService.createCvProfile(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CvProfileDto> updateCvProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CvProfileDto dto) {
        CvProfileDto updated = cvProfileService.updateCvProfile(id, userId, dto);
        return ResponseEntity.ok(updated);
    }

    @PutMapping
    public ResponseEntity<CvProfileDto> saveOrUpdateCvProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CvProfileDto dto) {
        CvProfileDto saved = cvProfileService.saveOrUpdateCvProfile(userId, dto);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCvProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        cvProfileService.deleteCvProfile(id, userId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/duplicate")
    public ResponseEntity<CvProfileDto> duplicateCvProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        CvProfileDto duplicated = cvProfileService.duplicateCvProfile(id, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(duplicated);
    }

    @PatchMapping("/{id}/primary")
    public ResponseEntity<CvProfileDto> setPrimaryCvProfile(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId) {
        CvProfileDto updated = cvProfileService.setPrimaryCvProfile(id, userId);
        return ResponseEntity.ok(updated);
    }

    @PostMapping("/optimize")
    public ResponseEntity<CvOptimizeResponse> optimizeCvForJob(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CvOptimizeRequest request) {
        CvOptimizeResponse response = cvProfileService.optimizeCvForJob(userId, request);
        return ResponseEntity.ok(response);
    }
}
