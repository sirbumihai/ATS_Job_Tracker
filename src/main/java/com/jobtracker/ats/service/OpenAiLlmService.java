package com.jobtracker.ats.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

@Service
@Slf4j
public class OpenAiLlmService {

    private final RestClient restClient;
    private final String apiKey;
    private final String defaultModel;

    // LISTA DE MODELE ACTIVE REALE PE GROQCLOUD (ACTUALIZATE DUPA DECOMMISSIONING-UL LLAMA DIN AUGUST 2026)
    private static final List<String> ACTIVE_GROQ_MODELS = List.of(
            "openai/gpt-oss-120b",
            "qwen/qwen3.6-27b",
            "openai/gpt-oss-20b",
            "groq/compound",
            "groq/compound-mini"
    );

    private static final Pattern THINK_TAG_PATTERN = Pattern.compile("<think>[\\s\\S]*?</think>", Pattern.CASE_INSENSITIVE);

    public OpenAiLlmService(
            RestClient.Builder restClientBuilder,
            @Value("${spring.ai.groq.api-key:${SPRING_AI_GROQ_API_KEY:}}") String apiKey,
            @Value("${spring.ai.groq.model:${SPRING_AI_GROQ_MODEL:openai/gpt-oss-120b}}") String defaultModel) {
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
        for (String m : ACTIVE_GROQ_MODELS) {
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
                        "temperature", 0.0,
                        "max_tokens", 8192
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
                        if (content != null) {
                            // Strip <think>...</think> if reasoning tags are present
                            content = THINK_TAG_PATTERN.matcher(content).replaceAll("").trim();
                            log.info("[GROQ LLM SUCCESS] Raspuns valid primit cu succes de la modelul activ Groq: {}", modelName);
                            return content;
                        }
                    }
                }
            } catch (Exception e) {
                log.warn("[GROQ LLM RETRY] Modelul {} nu a putut fi apelat ({}), se incearca urmatorul model activ...", modelName, e.getMessage());
                lastException = e;
            }
        }

        log.error("[GROQ LLM ALL FAILED] Toate modelele Groq au esuat.");
        throw new RuntimeException("Eroare la comunicarea cu serviciul AI Groq: " + (lastException != null ? lastException.getMessage() : "Niciun model disponibil"), lastException);
    }
}
