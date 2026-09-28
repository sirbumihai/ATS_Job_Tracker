package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.career.CareerGamificationDto;
import com.jobtracker.ats.service.CareerAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/career")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CareerAnalyticsController {

    private final CareerAnalyticsService careerAnalyticsService;

    @GetMapping("/analytics")
    public ResponseEntity<CareerGamificationDto> getAnalytics(
            @RequestHeader(value = "X-User-Id", required = false) UUID userId) {
        return ResponseEntity.ok(careerAnalyticsService.getCareerAnalytics(userId));
    }
}
