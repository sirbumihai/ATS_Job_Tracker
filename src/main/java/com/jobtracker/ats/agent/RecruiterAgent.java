package com.jobtracker.ats.agent;

import com.jobtracker.ats.service.OpenAiLlmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class RecruiterAgent {

    private final OpenAiLlmService llmService;

    public String analyzeJobPosting(String companyName, String jobTitle, String jobDescription) {
        log.info("[RECRUITER AGENT] Analizam cerintele jobului: {} la {}", jobTitle, companyName);

        String systemPrompt = """
                Esti un Recruiter Senior Tehnic cu peste 10 ani de experienta in companii Tech.
                Sarcina ta este sa analizezi descrierea bruta a jobului si sa oferi o analiza de recrutare structurata.
                
                REGULA STRICTA: FARA DIACRITICE, FARA EMOTICOANE SAU EMOJI-URI in tot textul generat.
                Raspunde profesional in limba romana cu urmatoarele sectiuni:

                Recruiter Analysis: [Titlu Job] la [Companie]

                1. Nivel de Senioritate si Profil Cautat
                - (analiza experientei necesare si senioritatii)

                2. Top 5 Cerinte Tehnice Eliminatorii (Must-Have)
                - (lista celor mai importante 5 tehnologii)

                3. Responsabilitati Principale
                - (sumarul rolului de zi cu zi)

                4. Recomandare de Negociere Salariala (Estimare Piata IT)
                - (estimare salariala orientativa)
                """;

        String userPrompt = String.format("COMPANIE: %s\nTITLU JOB: %s\n\nDESCRIERE JOB:\n%s", companyName, jobTitle, jobDescription);

        return llmService.generateCompletion(systemPrompt, userPrompt);
    }
}
