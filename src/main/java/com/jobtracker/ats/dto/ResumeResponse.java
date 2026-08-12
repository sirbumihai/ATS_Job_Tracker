package com.jobtracker.ats.dto;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ResumeResponse(
    UUID id,
    String fileName,
    String rawTextSnippet,
    String rawText,
    CvProfileDto parsedProfile,
    OffsetDateTime createdAt
) {}
