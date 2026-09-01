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

    private final Tika standardTika;
    private final Parser ocrParser;
    private final ParseContext ocrParseContext;

    public TextExtractionService() {
        this.standardTika = new Tika();
        this.standardTika.setMaxStringLength(-1);

        this.ocrParser = new AutoDetectParser();
        this.ocrParseContext = new ParseContext();

        PDFParserConfig ocrPdfConfig = new PDFParserConfig();
        ocrPdfConfig.setExtractInlineImages(true);
        ocrPdfConfig.setOcrStrategy(PDFParserConfig.OCR_STRATEGY.OCR_ONLY);
        
        TesseractOCRConfig ocrConfig = new TesseractOCRConfig();
        ocrConfig.setLanguage("eng+ron");

        this.ocrParseContext.set(PDFParserConfig.class, ocrPdfConfig);
        this.ocrParseContext.set(TesseractOCRConfig.class, ocrConfig);
        this.ocrParseContext.set(Parser.class, this.ocrParser);
    }

    public String extractText(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Fisierul incarcat nu poate fi gol.");
        }

        String extractedText = "";

        // 1. PRIMARY PASS: Fast & Clean Vector Text Extraction (NO OCR Duplication)
        try (InputStream stream = file.getInputStream()) {
            extractedText = standardTika.parseToString(stream);
            if (extractedText != null) {
                extractedText = extractedText.trim();
            }
        } catch (Exception e) {
            log.warn("[TIKA VECTOR EXTRACT WARN] Eroare la extragerea vectoriala: {}", e.getMessage());
        }

        // 2. OCR FALLBACK: If document is scanned / image-based with very little text (< 120 characters)
        if (extractedText == null || extractedText.length() < 120) {
            log.info("[TIKA OCR FALLBACK] Text insuficient ({} caractere), rulare OCR Tesseract...", 
                    extractedText != null ? extractedText.length() : 0);
            try (InputStream stream = file.getInputStream()) {
                BodyContentHandler handler = new BodyContentHandler(-1);
                Metadata metadata = new Metadata();
                ocrParser.parse(stream, handler, metadata, ocrParseContext);
                String ocrResult = handler.toString();
                if (ocrResult != null && !ocrResult.isBlank()) {
                    extractedText = ocrResult.trim();
                }
            } catch (Exception e) {
                log.warn("[TIKA OCR WARN] Eroare la procesarea OCR: {}", e.getMessage());
            }
        }

        if (extractedText == null || extractedText.isBlank()) {
            throw new IllegalStateException("Nu s-a putut extrage text din fisierul incarcat.");
        }

        log.info("[TIKA SUCCESS] Extrase {} caractere unice din fisierul: {}", extractedText.length(), file.getOriginalFilename());
        return extractedText.trim();
    }
}
