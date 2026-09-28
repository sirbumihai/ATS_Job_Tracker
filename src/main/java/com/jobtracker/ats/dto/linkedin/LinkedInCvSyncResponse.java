package com.jobtracker.ats.dto.linkedin;

import java.util.List;

public record LinkedInCvSyncResponse(
    LinkedInProfileDto profile,
    List<String> importedItems,
    int itemsCount,
    String message
) {}
