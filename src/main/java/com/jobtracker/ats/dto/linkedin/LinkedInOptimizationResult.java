package com.jobtracker.ats.dto.linkedin;

import java.util.List;
import java.util.Map;

public record LinkedInOptimizationResult(
    int overallScore,
    String scoreGrade,
    Map<String, Integer> scoreBreakdown,
    List<String> criticalGaps,
    List<String> strengths,
    List<HeadlineOptionDto> optimizedHeadlines,
    String optimizedAbout,
    List<RecommendedSkillDto> recommendedSkills,
    List<RecruiterTipDto> recruiterTips,
    List<LinkedInActionStepDto> actionPlan,
    List<LinkedInProjectDto> suggestedProjects,
    List<RecruiterBooleanQueryDto> recruiterQueries
) {}
