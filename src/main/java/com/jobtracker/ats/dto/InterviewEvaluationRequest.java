package com.jobtracker.ats.dto;

public record InterviewEvaluationRequest(
        String jobTitle,
        String companyName,
        String questionText,
        String userAnswerText
) {}
