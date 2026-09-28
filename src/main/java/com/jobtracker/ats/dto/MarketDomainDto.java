package com.jobtracker.ats.dto;

import java.util.List;

public record MarketDomainDto(
    String id,
    String title,
    String tagLine,
    String icon,
    int totalJobs,
    int juniorJobs,
    int midJobs,
    int seniorJobs,
    int levelJobCount,
    int lowCompetitionCount,
    double lowCompetitionRate,
    int opportunityScore,
    String opportunityBadge,
    String competitionLevel,
    List<SkillFrequencyDto> topSkills,
    List<DomainRequirementCategoryDto> requirementsChecklist,
    SeniorityComparisonDto seniorityComparison,
    List<RoadmapStageDto> preparationRoadmap,
    List<SampleJobDto> sampleJobs
) {}
