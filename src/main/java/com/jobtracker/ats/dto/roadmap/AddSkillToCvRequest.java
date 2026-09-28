package com.jobtracker.ats.dto.roadmap;

import java.util.UUID;

public record AddSkillToCvRequest(
    UUID cvProfileId,
    String skillName,
    String cvBulletPoint,
    String projectTitle,
    String projectDescription,
    String technologiesUsed
) {}
