package com.jobtracker.ats.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record JobResponse(
    UUID id,
    String companyName,
    String jobTitle,
    String jobUrl,
    String rawDescription,
    OffsetDateTime createdAt
) {}
