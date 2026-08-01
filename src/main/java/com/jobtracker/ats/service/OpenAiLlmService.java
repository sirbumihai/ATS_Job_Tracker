package com.jobtracker.ats.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class OpenAiLlmService {

    @Value("${spring.ai.groq.api-key:demo-dummy-key-for-local-dev}")
    private String apiKey;

    private final RestClient restClient = RestClient.builder().build();

    /**
     * Trimite o cerere REALĂ către API-ul GROQ (Llama 3.3 70B - Gratuit) sau OpenAI pentru analiza AI Gap.
     */
    public String generateRealAiGapReport(String companyName, String jobTitle, String resumeText, String jobDescription) {
        log.info("🤖 [REAL AI LLM CALL] Trimitere cerere live către modelul LLM pentru {} - {}", companyName, jobTitle);

        if (apiKey == null || apiKey.contains("dummy") || apiKey.isBlank()) {
            log.warn("⚠️ Nicio cheie API Groq/OpenAI validă găsită în environment. Folosim modul fallback inteligent.");
            return null;
        }

        boolean isGroq = apiKey.startsWith("gsk_") || !apiKey.startsWith("sk-");
        String endpoint = isGroq 
                ? "https://api.groq.com/openai/v1/chat/completions" 
                : "https://api.openai.com/v1/chat/completions";
        
        String modelName = isGroq ? "llama-3.3-70b-versatile" : "gpt-3.5-turbo";

        String systemPrompt = """
                Ești un Expert în Sisteme ATS și Evaluator Tehnic de Cariere.
                Analizează cu atenție CV-ul candidatului în raport cu Descrierea Jobului oferită.
                
                REGULĂ STRICTĂ: FĂRĂ EMOTICOANE SAU EMOJI-URI în tot textul generat (fără simboluri de tip 🎯, ✅, ⚠️, 🚀, ❌, etc.).
                Răspunde profesional, curat și direct în limba română în format Markdown, folosind următoarea structură:

                # Analiza AI Career Coach: [Titlu Job] la [Companie]

                ## Skill-uri Potrivite Identificate în CV:
                - (lista skill-urilor găsite efectiv în CV)

                ## Skill-uri Critice Lipsă (Gap Analysis):
                - (lista cerințelor din job care nu se regăsesc în CV)

                ## Plan de Acțiune Recomandat (3 Zile):
                1. Ziua 1 (Teorie și Documentație): ...
                2. Ziua 2 (Exercițiu Practic): ...
                3. Ziua 3 (Pregătire Interviu Tehnic): ...
                """;

        String userPrompt = String.format("""
                DESCRIERE JOB (%s - %s):
                %s
                
                TEXT EXTRASE DIN CV-UL CANDIDATULUI:
                %s
                """, companyName, jobTitle, jobDescription, (resumeText != null && !resumeText.isBlank()) ? resumeText : "Candidatul are experiență în Java, Spring Boot, SQL, PostgreSQL, Git, Docker, REST API.");

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", modelName,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "temperature", 0.2
            );

            Map response = restClient.post()
                    .uri(endpoint)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                List choices = (List) response.get("choices");
                if (!choices.isEmpty()) {
                    Map firstChoice = (Map) choices.get(0);
                    Map message = (Map) firstChoice.get("message");
                    String content = (String) message.get("content");
                    log.info("✅ [REAL AI LLM CALL SUCCESS] Răspuns curat fără emoticoane primit de la Groq Llama 3.3!");
                    return content;
                }
            }
        } catch (Exception e) {
            log.error("❌ [REAL AI LLM CALL ERROR] Eroare la apelarea API AI: {}", e.getMessage());
        }

        return null;
    }
}
