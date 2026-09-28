package com.jobtracker.ats.dto.linkedin;

public record RecruiterBooleanQueryDto(
    String roleTarget,
    String booleanString,
    String explanation,
    String whyYouMatch
) {}
