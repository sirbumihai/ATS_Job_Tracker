package com.jobtracker.ats.dto;

import java.time.LocalDate;

public record UpdateApplicationNotesRequest(
        String notes,
        LocalDate appliedDate
) {}
