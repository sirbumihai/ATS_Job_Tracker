package com.jobtracker.ats.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class OpenAiLlmService {

    private final RestClient restClient;
    private final String apiKey;
    private final String defaultModel;

    // LISTA DE MODELE ACTIVE PE GROQCLOUD CU FALLBACK AUTOMAT IN CAZ DE DECOMMISSIONING
    private static final List<String> FALLBACK_MODELS = List.of(
            "llama-3.1-8b-instant",
            "llama-3.3-70b-specdec",
            "qwen-2.5-32b",
            "llama-3.2-11b-vision-preview",
            "llama3-70b-8192",
            "llama3-8b-8192"
    );

    public OpenAiLlmService(
            RestClient.Builder restClientBuilder,
            @Value("${spring.ai.groq.api-key:${SPRING_AI_GROQ_API_KEY:}}") String apiKey,
            @Value("${spring.ai.groq.model:${SPRING_AI_GROQ_MODEL:llama-3.1-8b-instant}}") String defaultModel) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
    }

    public String generateCompletion(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new IllegalStateException("Cheia API Groq (SPRING_AI_GROQ_API_KEY) nu este configurata in mediu.");
        }

        String endpoint = "https://api.groq.com/openai/v1/chat/completions";

        List<String> modelsToTry = new ArrayList<>();
        if (defaultModel != null && !defaultModel.isBlank()) {
            modelsToTry.add(defaultModel);
        }
        for (String m : FALLBACK_MODELS) {
            if (!modelsToTry.contains(m)) {
                modelsToTry.add(m);
            }
        }

        Exception lastException = null;

        for (String modelName : modelsToTry) {
            try {
                Map<String, Object> requestBody = Map.of(
                        "model", modelName,
                        "messages", List.of(
                                Map.of("role", "system", "content", systemPrompt),
                                Map.of("role", "user", "content", userPrompt)
                        ),
                        "temperature", 0.2
                );

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
                        log.info("[GROQ LLM SUCCESS] Raspuns primit cu succes de la modelul Groq: {}", modelName);
                        return content;
                    }
                }
            } catch (Exception e) {
                log.warn("[GROQ LLM RETRY] Modelul {} nu a putut fi apelat ({}), se incearca urmatorul model fallback...", modelName, e.getMessage());
                lastException = e;
            }
        }

        log.error("[GROQ LLM ALL FAILED] Toate modelele Groq au esuat.");
        throw new RuntimeException("Eroare la comunicarea cu serviciul AI Groq: " + (lastException != null ? lastException.getMessage() : "Niciun model disponibil"), lastException);
    }
}
