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

    // LISTA DE MODELE ACTIVE REALE PE GROQCLOUD CU LIMITĂ RIDICATĂ DE TOKENI (30k TPM)
    private static final List<String> ACTIVE_GROQ_MODELS = List.of(
            "llama-3.1-8b-instant",
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "openai/gpt-oss-120b"
    );

    private static final Pattern THINK_TAG_PATTERN = Pattern.compile("<think>[\\s\\S]*?</think>", Pattern.CASE_INSENSITIVE);

    public OpenAiLlmService(
            RestClient.Builder restClientBuilder,
            @Value("${spring.ai.groq.api-key:${SPRING_AI_GROQ_API_KEY:}}") String apiKey,
            @Value("${spring.ai.groq.model:${SPRING_AI_GROQ_MODEL:llama-3.1-8b-instant}}") String defaultModel) {
        this.restClient = restClientBuilder.build();
        this.apiKey = apiKey;
        this.defaultModel = defaultModel;
    }

    public boolean isConfigured() {
        return apiKey != null && !apiKey.isBlank() && !apiKey.contains("dummy");
    }

    public String generateCompletion(String systemPrompt, String userPrompt) {
        return generateCompletion(systemPrompt, userPrompt, 8192, 0.0);
    }

    public String generateCompletion(String systemPrompt, String userPrompt, int maxTokens, double temperature) {
        if (!isConfigured()) {
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
            int retries = 2;
            while (retries > 0) {
                try {
                    Map<String, Object> requestBody = Map.of(
                            "model", modelName,
                            "messages", List.of(
                                    Map.of("role", "system", "content", systemPrompt),
                                    Map.of("role", "user", "content", userPrompt)
                            ),
                            "temperature", temperature,
                            "max_tokens", maxTokens
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
                                log.info("[GROQ LLM SUCCESS] Răspuns primit cu succes de la modelul: {}", modelName);
                                return content;
                            }
                        }
                    }
                    break;
                } catch (Exception e) {
                    lastException = e;
                    String msg = e.getMessage() != null ? e.getMessage() : "";
                    if (msg.contains("429") || msg.contains("Rate limit")) {
                        retries--;
                        long sleepMs = parseRetryDelayMs(msg);
                        log.warn("[GROQ RATE LIMIT] 429 pe modelul {}. Așteptăm {}ms înainte de reîncercare...", modelName, sleepMs);
                        try {
                            Thread.sleep(sleepMs);
                        } catch (InterruptedException ie) {
                            Thread.currentThread().interrupt();
                            break;
                        }
                    } else {
                        log.warn("[GROQ LLM RETRY] Modelul {} nu a putut fi apelat ({}), se încearcă următorul model activ...", modelName, msg);
                        break;
                    }
                }
            }
        }

        log.error("[GROQ LLM ALL FAILED] Toate modelele Groq au esuat.");
        throw new RuntimeException("Eroare la comunicarea cu serviciul AI Groq: " + (lastException != null ? lastException.getMessage() : "Niciun model disponibil"), lastException);
    }

    private long parseRetryDelayMs(String msg) {
        try {
            java.util.regex.Matcher msMatcher = Pattern.compile("try again in (\\d+(?:\\.\\d+)?)ms", Pattern.CASE_INSENSITIVE).matcher(msg);
            if (msMatcher.find()) {
                double ms = Double.parseDouble(msMatcher.group(1));
                return Math.max(250L, Math.min((long) (ms + 150), 4000L));
            }
            java.util.regex.Matcher sMatcher = Pattern.compile("try again in (\\d+(?:\\.\\d+)?)s", Pattern.CASE_INSENSITIVE).matcher(msg);
            if (sMatcher.find()) {
                double s = Double.parseDouble(sMatcher.group(1));
                return Math.max(500L, Math.min((long) (s * 1000 + 300), 5000L));
            }
        } catch (Exception ignored) {}
        return 1200L;
    }
}
