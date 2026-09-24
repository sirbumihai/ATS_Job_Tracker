package com.jobtracker.ats.dto;

import java.util.UUID;

public record CoverLetterRequest(
        UUID cvProfileId,
        UUID applicationId,
        String companyName,
        String jobTitle,
        String jobDescription,
        String languagePreference, // "RO", "EN", etc.
        String tone, // "SIMPLE_DIRECT", "PROFESSIONAL", "MODERN_TECH"
        String candidateName,
        String candidateEmail,
        String candidatePhone,
        String candidateLocation
) {}
