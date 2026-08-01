package com.jobtracker.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
    @NotBlank(message = "Email-ul este obligatoriu")
    @Email(message = "Email-ul trebuie să fie valid")
    String email,

    @NotBlank(message = "Parola este obligatorie")
    String password
) {}
