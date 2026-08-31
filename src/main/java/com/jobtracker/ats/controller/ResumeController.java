package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.ResumeResponse;
import com.jobtracker.ats.service.ResumeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/resumes")
@RequiredArgsConstructor
public class ResumeController {

    private final ResumeService resumeService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ResumeResponse> uploadResume(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam("file") MultipartFile file) {

        ResumeResponse response = resumeService.uploadResume(userId, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/user")
    public ResponseEntity<java.util.List<ResumeResponse>> getUserResumes(
            @RequestHeader("X-User-Id") UUID userId) {
        java.util.List<ResumeResponse> response = resumeService.getUserResumes(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ResumeResponse> getResumeById(@PathVariable UUID id) {
        ResumeResponse response = resumeService.getResumeById(id);
        return ResponseEntity.ok(response);
    }
}
