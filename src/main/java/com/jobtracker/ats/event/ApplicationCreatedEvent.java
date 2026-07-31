package com.jobtracker.ats.event;

import java.util.UUID;

public record ApplicationCreatedEvent(
    UUID applicationId
) {}
