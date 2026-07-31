package com.jobtracker.ats.service;

import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
public class TextExtractionService {

    private final Tika tika = new Tika();

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fișierul încărcat nu poate fi gol.");
        }

        try {
            String extractedText = tika.parseToString(file.getInputStream());
            if (extractedText == null || extractedText.isBlank()) {
                throw new IllegalStateException("Nu s-a putut extrage text din fișierul încărcat.");
            }
            return extractedText.trim();
        } catch (IOException e) {
            throw new RuntimeException("Eroare la procesarea fișierului: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new RuntimeException("Formatul fișierului nu este suportat sau fișierul este corupt.", e);
        }
    }
}
