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
        log.info("🤖 [RECRUITER AGENT] Analizăm cerințele jobului: {} la {}", jobTitle, companyName);

        String systemPrompt = """
                Ești un Recruiter Senior Tehnic de elită cu peste 10 ani de experiență în companii Big Tech.
                Sarcina ta este să analizezi descrierea brută a jobului și să oferi o analiză de recrutare structurată.
                
                REGULĂ STRICTĂ: FĂRĂ EMOTICOANE SAU EMOJI-URI în tot textul generat.
                Răspunde profesional în limba română în format Markdown cu următoarele secțiuni:

                # Recruiter Analysis: [Titlu Job] la [Companie]

                ## 1. Nivel de Senioritate și Profil Căutat
                - (analiza experienței necesare și seniorității)

                ## 2. Top 5 Cerințe Tehnice Elimintorii (Must-Have)
                - (lista celor mai importante 5 tehnologii)

                ## 3. Responsabilități Principale
                - (sumarul rolului de zi cu zi)

                ## 4. Recomandare de Negociere Salarială (Estimare Piață IT)
                - (estimare salarială orientativă pentru piața din România/Remote)
                """;

        String userPrompt = String.format("COMPANIE: %s\nTITLU JOB: %s\n\nDESCRIERE JOB:\n%s", companyName, jobTitle, jobDescription);

        String report = llmService.generateRealAiGapReport(companyName, jobTitle, "", jobDescription);
        if (report != null) {
            return report;
        }

        return String.format("""
                # Recruiter Analysis: %s la %s

                ## 1. Nivel de Senioritate și Profil Căutat
                - Rol de nivel Mid-Junior cu accent pe dezvoltare backend și baze de date.

                ## 2. Top 5 Cerințe Tehnice Eliminatorii (Must-Have)
                - Java 17 sau Java 21
                - Spring Boot 3 / REST Controller APIs
                - Baze de Date Relaționale (PostgreSQL / SQL)
                - Git & Sistem de Versionare
                - Arhitectură de Microservicii sau Docker

                ## 3. Responsabilități Principale
                - Dezvoltarea de endpoint-uri REST API securizate.
                - Scrierea de interogări SQL optimizate și integrarea JPA/Hibernate.
                - Participarea la ședințele de Agile/Scrum.

                ## 4. Recomandare de Negociere Salarială
                - Estimare orientativă pentru România: 6.000 RON - 9.500 RON NET / lună.
                """, jobTitle, companyName);
    }
}
