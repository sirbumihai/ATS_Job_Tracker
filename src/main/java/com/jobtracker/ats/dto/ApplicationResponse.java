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
    OffsetDateTime createdAt,
    String jobUrl,
    String rawDescription,
    String sourcePlatform,
    String salaryRange,
    String location,
    String workModel,
    String experienceLevel,
    java.util.List<String> skillsRequired
) {
    // Constructor de compatibilitate retroactivă pentru apelurile cu 14 argumente
    public ApplicationResponse(
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
    ) {
        this(
            id, userId, jobId, companyName, jobTitle, resumeId, resumeFileName,
            cvProfileId, cvProfileTitle, status, semanticMatchScore, notes,
            appliedDate, createdAt, null, null, null, null, null, null, null, java.util.Collections.emptyList()
        );
    }
}
