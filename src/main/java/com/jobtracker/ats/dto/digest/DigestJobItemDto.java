package com.jobtracker.ats.dto.digest;

import java.util.List;

public record DigestJobItemDto(
    String id,
    String title,
    String company,
    String location,
    String workModel,
    String directApplyUrl,
    int matchScore,
    String competitiveness,
    String postedDateAgo,
    List<String> keySkills,
    String matchHighlights,
    String outreachHook
) {}
