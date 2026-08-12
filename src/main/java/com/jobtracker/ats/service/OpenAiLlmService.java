package com.jobtracker.ats.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenAiLlmService {

    private final RestClient restClient;
    private final String apiKey;

    public OpenAiLlmService(
            RestClient.Builder restClientBuilder,
            @Value("${spring.ai.groq.api-key:${SPRING_AI_GROQ_API_KEY:}}") String apiKey) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
    }

    public String generateCompletion(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Cheia API Groq (SPRING_AI_GROQ_API_KEY) nu este configurata in mediu.");
        }

        String endpoint = "https://api.groq.com/openai/v1/chat/completions";

        Map<String, Object> requestBody = Map.of(
                "model", "llama-3.3-70b-versatile",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userPrompt)
                ),
                "temperature", 0.2
        );

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> response = restClient.post()
                    .uri(endpoint)
                    .header("Authorization", "Bearer " + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    Map<String, Object> firstChoice = choices.getFirst();
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
                    String content = (String) message.get("content");
                    log.info("[GROQ LLM SUCCESS] Raspuns primit cu succes de la Groq Llama 3.3 70B");
                    return content;
                }
            }
        } catch (Exception e) {
            log.error("[GROQ LLM ERROR] Eroare la apelul Groq API: {}", e.getMessage());
            throw new RuntimeException("Eroare la comunicarea cu serviciul AI Groq: " + e.getMessage(), e);
        }

        throw new RuntimeException("Serviciul AI Groq nu a returnat niciun raspuns valid.");
    }
}
