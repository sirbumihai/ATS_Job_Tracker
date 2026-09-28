package com.jobtracker.ats.dto;

import java.util.List;

public record DomainRequirementCategoryDto(
    String categoryName,
    String iconName,
    List<String> items
) {}
