package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.GmailSyncRequest;
import com.jobtracker.ats.dto.GmailSyncResult;
import com.jobtracker.ats.service.GmailSyncService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/integrations/gmail")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gmail ATS Integration", description = "Sincronizare automată a candidaturilor din emailurile Gmail")
public class GmailSyncController {

    private final GmailSyncService gmailSyncService;

    @PostMapping("/test")
    @Operation(summary = "Testează conexiunea IMAP cu Gmail", description = "Verifică dacă adresa de email și Parola de Aplicație Google sunt valide")
    public ResponseEntity<?> testConnection(@Valid @RequestBody GmailSyncRequest request) {
        try {
            boolean connected = gmailSyncService.testConnection(request);
            return ResponseEntity.ok(Map.of(
                    "success", connected,
                    "message", "Conexiunea cu serverul Gmail IMAP a fost realizată cu succes!"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Eroare la conectare: " + e.getMessage()
            ));
        }
    }

    @PostMapping("/sync")
    @Operation(summary = "Sincronizează candidaturile din Gmail", description = "Scanează emailurile recente de recrutare și actualizează stadiile din Kanban sau creează candidaturi noi")
    public ResponseEntity<GmailSyncResult> syncGmail(
            @RequestParam(required = false) UUID userId,
            @Valid @RequestBody GmailSyncRequest request) {
        log.info("[GMAIL CONTROLLER] Cerere de sincronizare primită pentru {}", request.getEmail());
        try {
            GmailSyncResult result = gmailSyncService.syncWithGmail(userId, request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("[GMAIL CONTROLLER] Eroare la sincronizare: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(GmailSyncResult.builder()
                    .success(false)
                    .message("Eroare la sincronizare: " + e.getMessage())
                    .build());
        }
    }
}
