package com.jobtracker.ats.dto;

import java.util.List;
import java.util.UUID;

public record GithubReadmeRequest(
        UUID cvProfileId,
        String githubUsername,
        String candidateName,
        String headline,
        String targetRole,
        String archetype, // "BACKEND_SYSTEMS", "FULLSTACK_SYSTEMS", "MINIMALIST_LEAD", "OPEN_SOURCE"
        String tone, // "PRAGMATIC_HUMAN", "CONCISE_TECHNICAL", "ENG_LEAD"
        Boolean includeStatsCards,
        Boolean includeLanguages,
        Boolean includeStreak,
        String statsTheme, // "github_dark", "tokyonight", "dracula", "nord", "radical", "minimal"
        List<String> selectedTechnologies,
        List<String> projectHighlights,
        String linkedinUrl,
        String email,
        String portfolioUrl
) {}
