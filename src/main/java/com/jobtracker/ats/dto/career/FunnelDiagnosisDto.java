package com.jobtracker.ats.dto.career;

import java.util.List;

public record FunnelDiagnosisDto(
    String healthStatus, // "EXCELLENT", "HEALTHY", "WARNING_ATS_FILTER", "WARNING_TECH_INTERVIEW", "EARLY_STAGE"
    String headline,
    String primaryBottleneck,
    String rootCauseExplanation,
    String recommendedActionPlan,
    String directNavigationTab, // "cv_studio", "skill_roadmap", "outreach", "job_search"
    List<String> keyMetricInsights
) {}
