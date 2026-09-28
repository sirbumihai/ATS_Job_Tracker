package com.jobtracker.ats.dto.linkedin;

import java.util.List;

public record LinkedInProjectDto(
    String title,
    String description,
    String timePeriod,
    String url,
    List<String> skills,
    String associatedWith
) {}
