package com.jobtracker.ats.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateJobRequest(
    @NotBlank(message = "Numele companiei este obligatoriu")
    @Size(max = 150, message = "Numele companiei nu poate depăși 150 de caractere")
    String companyName,

    @NotBlank(message = "Titlul jobului este obligatoriu")
    @Size(max = 150, message = "Titlul jobului nu poate depăși 150 de caractere")
    String jobTitle,

    String jobUrl,

    @NotBlank(message = "Descrierea jobului este obligatorie")
    @Size(min = 20, message = "Descrierea jobului trebuie să aibă cel puțin 20 de caractere")
    String rawDescription
) {}
