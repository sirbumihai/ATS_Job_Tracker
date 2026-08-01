package com.jobtracker.ats.dto;

import java.util.List;

public record InterviewEvaluationResponse(
        int scoreOutOfTen,
        String detailedFeedbackMarkdown,
        List<String> strengths,
        List<String> improvementAreas
) {}
