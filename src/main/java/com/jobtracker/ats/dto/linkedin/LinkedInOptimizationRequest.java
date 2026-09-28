package com.jobtracker.ats.dto.linkedin;

public record LinkedInOptimizationRequest(
    LinkedInProfileDto profile,
    String targetDomain,
    String targetRoleLevel
) {}
