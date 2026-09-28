package com.jobtracker.ats.dto.outreach;

import java.time.LocalDate;
import java.util.UUID;

public record OutreachGenerateRequest(
    UUID applicationId,
    String companyName,
    String jobTitle,
    String jobDescription,
    String recruiterName,
    LocalDate appliedDate,
    String tone, // "PROFESSIONAL_ENGAGING", "CONCISE_ENGINEERING", "ENTHUSIASTIC"
    String targetRecipientRole // "RECRUITER", "HIRING_MANAGER", "ENGINEERING_LEAD"
) {}
