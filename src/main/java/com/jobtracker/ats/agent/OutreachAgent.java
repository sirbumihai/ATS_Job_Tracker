package com.jobtracker.ats.agent;

import com.jobtracker.ats.service.OpenAiLlmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutreachAgent {

    private final OpenAiLlmService llmService;

    public String generateOutreachMessage(String companyName, String jobTitle, String candidateName) {
        log.info("[OUTREACH AGENT] Generam mesaj personalizat de conectare pentru {} - {}", companyName, jobTitle);

        String systemPrompt = """
                Esti un Expert in Communication Strategy si Cold Outreach pe LinkedIn.
                Sarcina ta este sa generezi 2 variante profesionale de mesaje de contactare pentru recruiteri (LinkedIn si Cold Email).

                REGULA STRICTA: FARA DIACRITICE, FARA EMOTICOANE SAU EMOJI-URI in tot textul generat.
                Raspunde profesional in limba romana cu urmatoarele 2 variante:

                Mesaje Personalizate de Contact Recruiter

                Varianta 1: Mesaj Conectare LinkedIn (Sub 300 Caractere)
                Varianta 2: Email Cold Outreach Catre Technical Recruiter / Engineering Manager
                """;

        String userPrompt = String.format("COMPANIE: %s\nTITLU JOB: %s\nNUME CANDIDAT: %s", companyName, jobTitle, candidateName);

        return llmService.generateCompletion(systemPrompt, userPrompt);
    }
}
