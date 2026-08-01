package com.jobtracker.ats.dto;

import java.util.UUID;

public record AgentRequest(
        UUID jobId,
        UUID applicationId,
        String customPrompt
) {}
