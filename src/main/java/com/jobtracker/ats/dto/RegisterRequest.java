package com.jobtracker.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
    @NotBlank(message = "Email-ul este obligatoriu")
    @Email(message = "Email-ul trebuie sa fie valid")
    String email,

    @NotBlank(message = "Parola este obligatorie")
    @Size(min = 6, message = "Parola trebuie sa aibă cel putin 6 caractere")
    String password,

    @NotBlank(message = "Numele complet este obligatoriu")
    String fullName
) {}
