package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.digest.DailyDigestPreviewDto;
import com.jobtracker.ats.dto.digest.DigestSettingsDto;
import com.jobtracker.ats.dto.digest.DigestTestRequest;
import com.jobtracker.ats.service.DailyJobDigestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/digest")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DailyJobDigestController {

    private final DailyJobDigestService digestService;

    @GetMapping("/settings")
    public ResponseEntity<DigestSettingsDto> getSettings() {
        return ResponseEntity.ok(digestService.getSettings());
    }

    @PostMapping("/settings")
    public ResponseEntity<DigestSettingsDto> updateSettings(@RequestBody DigestSettingsDto settings) {
        return ResponseEntity.ok(digestService.updateSettings(settings));
    }

    @GetMapping("/preview")
    public ResponseEntity<DailyDigestPreviewDto> getPreview() {
        return ResponseEntity.ok(digestService.generatePreview());
    }

    @PostMapping("/test-webhook")
    public ResponseEntity<Map<String, Object>> testWebhook(@RequestBody DigestTestRequest request) {
        return ResponseEntity.ok(digestService.testWebhook(request));
    }

    @PostMapping("/send-now")
    public ResponseEntity<Map<String, Object>> sendNow() {
        var settings = digestService.getSettings();
        DigestTestRequest req = new DigestTestRequest(
                settings.primaryChannel(),
                "DISCORD".equalsIgnoreCase(settings.primaryChannel()) ? settings.discordWebhookUrl() : settings.telegramChatId(),
                settings.telegramBotToken(),
                true
        );
        return ResponseEntity.ok(digestService.testWebhook(req));
    }
}
