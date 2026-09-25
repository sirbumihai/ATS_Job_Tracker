package com.jobtracker.ats.dto;

import java.util.List;

public record GithubReadmeResponse(
        String fullMarkdown,
        String headline,
        String bioSection,
        String techStackSection,
        String projectsSection,
        String statsSection,
        String contactSection,
        List<String> antiAiHighlights,
        List<String> detectedTechnologies
) {}
