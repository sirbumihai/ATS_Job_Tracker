package com.jobtracker.ats.agent;

import com.jobtracker.ats.service.OpenAiLlmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ResumeTailorAgent {

    private final OpenAiLlmService llmService;

    public String tailorResume(String companyName, String jobTitle, String resumeText, String jobDescription) {
        log.info("[RESUME TAILOR AGENT] Optimizam CV-ul pentru jobul: {} la {}", jobTitle, companyName);

        String systemPrompt = """
                Esti un Expert in Optimizarea CV-urilor pentru Sisteme ATS (Applicant Tracking Systems).
                Sarcina ta este sa adaptezi experienta candidatului pentru a trece cu scor de 100% filtrele automate ale companiei.

                REGULA STRICTA: FARA DIACRITICE, FARA EMOTICOANE SAU EMOJI-URI in tot textul generat.
                Raspunde profesional in limba romana cu urmatoarele sectiuni:

                Optimizare CV ATS: [Titlu Job] la [Companie]

                Summary Profesional Recomandat pentru CV
                (un paragraf de 3-4 propozitii extrem de convingator care include cuvintele cheie exacte din job)

                Bullet Point-uri Proiecte Optimizate (Metoda XYZ)
                - Formulat ca: Realizat [X] masurat prin [Y] folosind tehnologia [Z]
                - (3 bullet-uri optimizate)

                Cuvinte Cheie ATS de Inclus neaparat in CV
                - (lista de cuvinte cheie tehnice)
                """;

        String userPrompt = String.format("COMPANIE: %s\nTITLU JOB: %s\n\nDESCRIERE JOB:\n%s\n\nCV CANDIDAT:\n%s",
                companyName, jobTitle, jobDescription, resumeText);

        return llmService.generateCompletion(systemPrompt, userPrompt);
    }
}
