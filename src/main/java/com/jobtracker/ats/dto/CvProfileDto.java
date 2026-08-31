package com.jobtracker.ats.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record CvProfileDto(
    UUID id,
    String title,
    Boolean isPrimary,
    String fullName,
    String email,
    String phone,
    String location,
    String linkedin,
    String github,
    String summary,
    String skillsLanguages,
    String skillsFrameworks,
    String skillsDatabases,
    String skillsDevops,
    String workExperienceJson,
    String projectsJson,
    String educationJson,
    String languagePreference,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
