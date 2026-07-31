package com.jobtracker.ats.dto;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record CreateApplicationRequest(
    @NotNull(message = "ID-ul jobului este obligatoriu")
    UUID jobId,

    UUID resumeId,

    String notes
) {}
