package com.jobtracker.ats.dto;

import java.util.List;

public record AgentResponse(
        String agentName,
        String outputMarkdown,
        List<String> keyTakeaways
) {}
