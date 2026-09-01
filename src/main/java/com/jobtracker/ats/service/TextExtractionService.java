package com.jobtracker.ats.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.parser.Parser;
import org.apache.tika.parser.ocr.TesseractOCRConfig;
import org.apache.tika.parser.pdf.PDFParserConfig;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;

@Service
@Slf4j
public class TextExtractionService {

    private final Parser parser;
    private final ParseContext parseContext;

    public TextExtractionService() {
        this.parser = new AutoDetectParser();
        this.parseContext = new ParseContext();

        PDFParserConfig pdfConfig = new PDFParserConfig();
        pdfConfig.setExtractInlineImages(true);
        pdfConfig.setOcrStrategy(PDFParserConfig.OCR_STRATEGY.OCR_AND_TEXT_EXTRACTION);
        
        TesseractOCRConfig ocrConfig = new TesseractOCRConfig();
        ocrConfig.setLanguage("eng+ron");

        this.parseContext.set(PDFParserConfig.class, pdfConfig);
        this.parseContext.set(TesseractOCRConfig.class, ocrConfig);
        this.parseContext.set(Parser.class, this.parser);
    }

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fisierul incarcat nu poate fi gol.");
        }

        try (InputStream stream = file.getInputStream()) {
            BodyContentHandler handler = new BodyContentHandler(-1);
            Metadata metadata = new Metadata();
            parser.parse(stream, handler, metadata, parseContext);

            String extractedText = handler.toString();
            if (extractedText == null || extractedText.isBlank() || extractedText.length() < 100) {
                // If text is minimal, try standard Tika fallback
                try (InputStream fallbackStream = file.getInputStream()) {
                    Tika fallbackTika = new Tika();
                    fallbackTika.setMaxStringLength(-1);
                    String fallbackText = fallbackTika.parseToString(fallbackStream);
                    if (fallbackText != null && fallbackText.length() > (extractedText != null ? extractedText.length() : 0)) {
                        extractedText = fallbackText;
                    }
                }
            }

            if (extractedText == null || extractedText.isBlank()) {
                throw new IllegalStateException("Nu s-a putut extrage text din fisierul incarcat.");
            }
            log.info("[TIKA EXTRACT] Extrase {} caractere din fisierul: {}", extractedText.length(), file.getOriginalFilename());
            return extractedText.trim();
        } catch (Exception e) {
            log.warn("[TIKA EXTRACT WARN] Eroare parser avansat: {}, incercare fallback Tika standard...", e.getMessage());
            try (InputStream fallbackStream = file.getInputStream()) {
                Tika fallbackTika = new Tika();
                fallbackTika.setMaxStringLength(-1);
                return fallbackTika.parseToString(fallbackStream).trim();
            } catch (Exception ex) {
                throw new RuntimeException("Formatul fisierului nu este suportat sau fisierul este corupt: " + ex.getMessage(), ex);
            }
        }
    }
}
