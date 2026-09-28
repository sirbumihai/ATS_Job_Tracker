package com.jobtracker.ats.dto.linkedin;

public record LinkedInExperienceDto(
    String title,
    String company,
    String period,
    String location,
    String description
) {}
