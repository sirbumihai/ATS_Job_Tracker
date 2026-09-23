package com.jobtracker.ats.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GmailSyncRequest {

    @NotBlank(message = "Adresa de email Gmail este obligatorie")
    @Email(message = "Formatul adresei de email este invalid")
    private String email;

    @NotBlank(message = "Parola de aplicatie Google (16 caractere) este obligatorie")
    private String appPassword;

    @Builder.Default
    private int daysToLookBack = 30;

    @Builder.Default
    private boolean autoCreateMissing = true;
}
