package com.jobtracker.ats.dto;

import java.util.List;

public record SeniorityComparisonDto(
    List<String> juniorFocus,
    List<String> midFocus,
    List<String> seniorFocus
) {}
