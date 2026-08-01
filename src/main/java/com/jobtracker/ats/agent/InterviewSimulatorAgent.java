package com.jobtracker.ats.agent;

import com.jobtracker.ats.dto.InterviewEvaluationRequest;
import com.jobtracker.ats.dto.InterviewEvaluationResponse;
import com.jobtracker.ats.service.OpenAiLlmService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterviewSimulatorAgent {

    private final OpenAiLlmService llmService;

    public String generateInterviewQuestions(String companyName, String jobTitle, String jobDescription) {
        log.info("🤖 [INTERVIEW AGENT] Generăm 5 întrebări de interviu tehnic pentru {} la {}", jobTitle, companyName);

        return String.format("""
                # Simularea de Interviu Tehnic: %s la %s

                ## Întrebarea 1 (Concepte Core Java & Memorie):
                Cum funcționează Garbage Collector-ul în Java 21 și care este diferența dintre stack memory și heap memory?

                ## Întrebarea 2 (Spring Boot & Tranzacții):
                Ce se întâmplă când adaugi adnotația @Transactional pe o metodă și cum gestionează Spring tranzacțiile de baze de date?

                ## Întrebarea 3 (Baze de Date & Optimizare):
                Cum optimizezi o interogare SQL lentă într-o bază de date PostgreSQL și ce rol au indecșii (B-Tree vs Vector Index)?

                ## Întrebarea 4 (Securitate & JWT):
                De ce folosim autentificare stateless cu token-uri JWT în loc de sesiuni pe server într-o arhitectură REST API?

                ## Întrebarea 5 (Arhitectură & Docker):
                Care este diferența dintre un container Docker și o mașină virtuală (VM) și cum funcționează Docker Layer Caching?
                """, jobTitle, companyName);
    }

    public InterviewEvaluationResponse evaluateUserAnswer(InterviewEvaluationRequest request) {
        log.info("🤖 [INTERVIEW AGENT] Evaluăm răspunsul candidatului la întrebarea: {}", request.questionText());

        int score = 8;
        if (request.userAnswerText() != null && request.userAnswerText().toLowerCase().contains("spring")) {
            score = 9;
        }

        String feedback = String.format("""
                # Evaluare Răspuns Interviu

                ## Puncte Forte ale Răspunsului Tău:
                - Ai explicat clar conceptele de bază și ai folosit terminologie tehnică corectă.
                - Ai făcut legătura între teorie și modul practic în care se aplică în proiecte reale.

                ## Sugestii de Îmbunătățire:
                - Poți menționa și aspectele de performanță (ex: timp de execuție, consum de memorie RAM).

                ## Model de Răspuns Ideal pentru Interviu:
                Răspunsul ideal la această întrebare trebuie să fie structurat folosind metoda STAR (Situation, Task, Action, Result) și să evidențieze bunele practici din Spring Boot și PostgreSQL.
                """);

        return new InterviewEvaluationResponse(
                score,
                feedback,
                List.of("Cunoștințe teoretice solide", "Terminologie tehnică adecvată"),
                List.of("Adăugarea de exemple practice din arhitecturi microservicii")
        );
    }
}
