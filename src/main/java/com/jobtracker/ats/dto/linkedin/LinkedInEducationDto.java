package com.jobtracker.ats.dto.linkedin;

import java.util.List;

public record LinkedInEducationDto(
    String institution,
    String degree,
    String period,
    String logoBadge
) {}
