package com.jobtracker.ats.dto;

import java.util.List;

public record MarketInsightsResponse(
    long totalJobsAnalyzed,
    long totalJuniorJobs,
    long totalMidJobs,
    long totalSeniorJobs,
    long totalLowCompetitionJobs,
    double overallLowCompetitionPct,
    String selectedLevel,
    String selectedLocation,
    List<MarketDomainDto> topSweetSpots,
    List<MarketDomainDto> mostInDemand,
    List<MarketDomainDto> lowestCompetition,
    List<MarketDomainDto> domains,
    List<SkillFrequencyDto> universalTopSkills
) {}
