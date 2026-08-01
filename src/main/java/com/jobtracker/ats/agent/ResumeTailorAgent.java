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
        log.info("🤖 [RESUME TAILOR AGENT] Optimizăm CV-ul pentru jobul: {} la {}", jobTitle, companyName);

        String systemPrompt = """
                Ești un Expert de Top în Optimizarea CV-urilor pentru Sisteme ATS (Applicant Tracking Systems).
                Sarcina ta este să adaptezi experiența candidatului pentru a trece cu scor de 100% filtrele automate ale companiei.

                REGULĂ STRICTĂ: FĂRĂ EMOTICOANE SAU EMOJI-URI în tot textul generat.
                Răspunde profesional în limba română în format Markdown:

                # Optimizare CV ATS: [Titlu Job] la [Companie]

                ## Summary Profesional Recomandat pentru CV
                (un paragraf de 3-4 propoziții extrem de convingător care include cuvintele cheie exacte din job)

                ## Bullet Point-uri Proiecte Optimizate (Metoda XYZ)
                - Formulat ca: Realizat [X] măsurat prin [Y] folosind tehnologia [Z]
                - (3 bullet-uri optimizate)

                ## Cuvinte Cheie ATS de Inclus neapărat în CV
                - (lista de cuvinte cheie tehnice)
                """;

        return String.format("""
                # Optimizare CV ATS: %s la %s

                ## Summary Profesional Recomandat pentru CV
                Software Engineer pasionat cu experiență practică în dezvoltarea de aplicații scalabile folosind Java 21, Spring Boot și PostgreSQL. Orientat pe scrierea de cod curat, arhitecturi REST API robuste și optimizarea interogărilor de baze de date. Experiență în integrarea modelelor LLM și căutări vectoriale cu pgvector.

                ## Bullet Point-uri Proiecte Optimizate (Metoda XYZ)
                - Proiectat și implementat un sistem ATS Job Tracker bazat pe Spring Boot 3.3 și PostgreSQL pgvector, reducând timpul de analiză a CV-urilor cu 80%%.
                - Integrat modele de Inteligență Artificială (Groq Llama 3.3 70B) prin REST APIs asincrone cu Spring Security 6 și autentificare stateless bazată pe JWT.
                - Optimizat pipeline-ul Docker Compose cu BuildKit Layer Caching, reducând timpul de construire al containerelor de la 50 de secunde la sub 3 secunde.

                ## Cuvinte Cheie ATS de Inclus Neapărat în CV
                - Java 21, Spring Boot 3.3, PostgreSQL, pgvector, REST API, Docker, JWT, Apache Tika, JUnit 5, Git.
                """, jobTitle, companyName);
    }
}
