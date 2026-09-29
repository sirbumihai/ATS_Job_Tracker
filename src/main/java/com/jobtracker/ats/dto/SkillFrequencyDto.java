package com.jobtracker.ats.dto;

public record SkillFrequencyDto(
    String skill,
    int count,
    double percentage,
    String category,
    Boolean userHasSkill
) {
    public SkillFrequencyDto(String skill, int count, double percentage, String category) {
        this(skill, count, percentage, category, false);
    }

    public SkillFrequencyDto(String skill, int count, double percentage) {
        this(skill, count, percentage, "General", false);
    }
}
