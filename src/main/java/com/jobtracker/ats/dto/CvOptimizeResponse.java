package com.jobtracker.ats.dto;

import java.util.List;
import java.util.Map;

public record CvOptimizeResponse(
        String targetMatchScore,
        List<String> matchingSkills,
        List<String> missingSkills,
        String actionPlan,
        String tailoredSummary,
        Map<String, String> tailoredSkills,
        List<String> tailoredBullets,
        String fullTailoredReport
) {}
