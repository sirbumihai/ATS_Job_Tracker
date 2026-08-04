package com.jobtracker.ats.dto;

import java.util.UUID;

public record CvProfileDto(
    UUID id,
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
    String languagePreference
) {}
