package com.jobtracker.ats.dto;

import java.util.UUID;

public record CvOptimizeRequest(
        UUID applicationId,
        String customJobDescription,
        String languagePreference
) {}
