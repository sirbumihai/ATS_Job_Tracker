package com.jobtracker.ats.dto.outreach;

public record OutreachMessageDto(
    String type, // "LINKEDIN_NOTE", "COLD_EMAIL", "FOLLOW_UP_1", "FOLLOW_UP_2"
    String title,
    String subject,
    String content,
    int characterCount,
    String targetRecipient, // "Technical Recruiter", "Engineering Manager"
    String advice
) {}
