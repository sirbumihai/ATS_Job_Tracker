package com.jobtracker.ats.dto;

public record SkillFrequencyDto(
    String skill,
    int count,
    double percentage,
    String category
) {
    public SkillFrequencyDto(String skill, int count, double percentage) {
        this(skill, count, percentage, "General");
    }
}
