package com.jobtracker.ats.dto.linkedin;

import com.jobtracker.ats.dto.CvProfileDto;

public record LinkedInCvSyncRequest(
    LinkedInProfileDto profile,
    CvProfileDto cv
) {}
