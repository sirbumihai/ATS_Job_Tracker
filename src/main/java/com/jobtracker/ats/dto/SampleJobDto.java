package com.jobtracker.ats.dto;

public record SampleJobDto(
    String id,
    String jobTitle,
    String companyName,
    String location,
    String workModel,
    String experienceLevel,
    String competitiveness,
    String salaryRange,
    String directApplyUrl,
    String sourcePlatform
) {}
