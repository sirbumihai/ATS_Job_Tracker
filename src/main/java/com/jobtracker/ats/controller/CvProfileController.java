package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.CvProfileDto;
import com.jobtracker.ats.service.CvProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/cv")
@RequiredArgsConstructor
public class CvProfileController {

    private final CvProfileService cvProfileService;

    @GetMapping
    public ResponseEntity<CvProfileDto> getCvProfile(@RequestHeader("X-User-Id") UUID userId) {
        CvProfileDto dto = cvProfileService.getCvProfileByUserId(userId);
        if (dto == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(dto);
    }

    @PutMapping
    public ResponseEntity<CvProfileDto> saveOrUpdateCvProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody CvProfileDto dto) {
        CvProfileDto saved = cvProfileService.saveOrUpdateCvProfile(userId, dto);
        return ResponseEntity.ok(saved);
    }
}
