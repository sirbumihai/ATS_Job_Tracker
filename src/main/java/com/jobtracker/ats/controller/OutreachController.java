package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.outreach.OutreachBundleDto;
import com.jobtracker.ats.dto.outreach.OutreachCadenceDto;
import com.jobtracker.ats.dto.outreach.OutreachGenerateRequest;
import com.jobtracker.ats.service.OutreachService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/outreach")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class OutreachController {

    private final OutreachService outreachService;

    @PostMapping("/generate")
    public ResponseEntity<OutreachBundleDto> generateOutreach(@RequestBody OutreachGenerateRequest request) {
        return ResponseEntity.ok(outreachService.generateOutreach(request));
    }

    @GetMapping("/for-application/{applicationId}")
    public ResponseEntity<OutreachBundleDto> getForApplication(@PathVariable UUID applicationId) {
        OutreachGenerateRequest request = new OutreachGenerateRequest(
                applicationId,
                null,
                null,
                null,
                null,
                null,
                "PROFESSIONAL_ENGAGING",
                "RECRUITER"
        );
        return ResponseEntity.ok(outreachService.generateOutreach(request));
    }

    @GetMapping("/cadence")
    public ResponseEntity<OutreachCadenceDto> getCadence(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate appliedDate) {
        return ResponseEntity.ok(outreachService.calculateCadence(appliedDate));
    }
}
