package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.CreateJobRequest;
import com.jobtracker.ats.dto.JobResponse;
import com.jobtracker.ats.service.JobPostingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService jobPostingService;

    @PostMapping
    public ResponseEntity<JobResponse> createJob(
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateJobRequest request) {
        
        JobResponse createdJob = jobPostingService.createJob(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdJob);
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponse> getJobById(@PathVariable UUID id) {
        JobResponse job = jobPostingService.getJobById(id);
        return ResponseEntity.ok(job);
    }
}
