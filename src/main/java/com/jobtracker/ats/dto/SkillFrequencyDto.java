package com.jobtracker.ats.dto;

public record SkillFrequencyDto(
    String skill,
    int count,
    double percentage
) {}
