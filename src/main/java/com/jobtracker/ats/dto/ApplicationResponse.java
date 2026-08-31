package com.jobtracker.ats.dto;

import com.jobtracker.ats.entity.Application.ApplicationStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ApplicationResponse(
    UUID id,
    UUID userId,
    UUID jobId,
    String companyName,
    String jobTitle,
    UUID resumeId,
    String resumeFileName,
    UUID cvProfileId,
    String cvProfileTitle,
    ApplicationStatus status,
    BigDecimal semanticMatchScore,
    String notes,
    LocalDate appliedDate,
    OffsetDateTime createdAt
) {}
