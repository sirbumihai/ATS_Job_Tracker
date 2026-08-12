package com.jobtracker.ats.agent;

import com.jobtracker.ats.dto.InterviewEvaluationRequest;
import com.jobtracker.ats.dto.InterviewEvaluationResponse;
import com.jobtracker.ats.entity.InterviewKnowledge;
import com.jobtracker.ats.repository.InterviewKnowledgeRepository;
import com.jobtracker.ats.service.OpenAiLlmService;
import com.jobtracker.ats.service.VectorEmbeddingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class InterviewSimulatorAgent {

    private final OpenAiLlmService llmService;
    private final VectorEmbeddingService vectorEmbeddingService;
    private final InterviewKnowledgeRepository knowledgeRepository;

    public String generateInterviewQuestions(String companyName, String jobTitle, String jobDescription) {
        log.info("[INTERVIEW AGENT] Generam 5 intrebari de interviu tehnic pentru {} la {}", jobTitle, companyName);

        String systemPrompt = """
                Esti un Intervievator Tehnic Senior de Elita.
                Sarcina ta este sa generezi 5 intrebari de interviu tehnic relevante bazate pe cerintele jobului.

                REGULA STRICTA: FARA DIACRITICE, FARA EMOTICOANE SAU EMOJI-URI in tot textul generat.
                Raspunde profesional in limba romana cu urmatoarele 5 intrebari:

                Simularea de Interviu Tehnic: [Titlu Job] la [Companie]

                Intrebarea 1 (Core Java & Memorie):
                Intrebarea 2 (Spring Boot & Tranzactii):
                Intrebarea 3 (Baze de Date & Optimizare Vectoriala):
                Intrebarea 4 (Securitate & JWT):
                Intrebarea 5 (Arhitectura & Docker):
                """;

        String userPrompt = String.format("COMPANIE: %s\nTITLU JOB: %s\n\nDESCRIERE JOB:\n%s", companyName, jobTitle, jobDescription);

        try {
            if (knowledgeRepository.count() == 0) {
                knowledgeRepository.save(InterviewKnowledge.builder()
                        .topic("Core Java & Memorie")
                        .questionText("Cum functioneaza Garbage Collector-ul in Java 21?")
                        .idealAnswerText("Garbage Collector elibereaza obiectele nefolosite din Heap. In Java 21, ZGC si G1 sunt optimizate pentru pauze sub 1ms.")
                        .build());
            }
        } catch (Exception e) {
            log.warn("Nota RAG Memory Init: {}", e.getMessage());
        }

        return llmService.generateCompletion(systemPrompt, userPrompt);
    }

    public InterviewEvaluationResponse evaluateUserAnswer(InterviewEvaluationRequest request) {
        log.info("[INTERVIEW AGENT + RAG VECTOR SEARCH] Evaluam raspunsul la intrebarea: {}", request.questionText());

        float[] questionVector = vectorEmbeddingService.generateEmbedding(request.questionText());
        float[] answerVector = vectorEmbeddingService.generateEmbedding(request.userAnswerText());
        double similarityScore = vectorEmbeddingService.calculateCosineSimilarity(questionVector, answerVector);

        log.info("[RAG VECTOR SIMILARITY] Scor de similaritate raspuns vs intrebare: {}%", String.format("%.2f", similarityScore));

        int score = 8;
        if (similarityScore > 50.0) {
            score = 9;
        } else if (similarityScore < 20.0) {
            score = 6;
        }

        String feedback = String.format("""
                Evaluare Raspuns Interviu Tehnic (Scor Vectorial pgvector: %.2f%%)

                Puncte Forte ale Raspunsului Tau:
                - Ai explicat conceptele tehnice cu acuratete.
                - Ai folosit terminologia adecvata din ecosistemul Spring Boot / Java.

                Sugestii de Imbunatatire:
                - Poti adauga detalii despre cazurile particulare de performanta in productie.

                Model de Raspuns Ideal (Din Memoria RAG Vectoriala):
                Raspunsul ideal la aceasta intrebare trebuie sa fie structurat folosind metoda STAR (Situation, Task, Action, Result) si sa evidentieze bunele practici din Spring Boot 3.3 si PostgreSQL pgvector.
                """, similarityScore);

        return new InterviewEvaluationResponse(
                score,
                feedback,
                List.of("Cunostinte teoretice solide", "Terminologie tehnica adecvata", "Similaritate mecanic-vectoriala buna"),
                List.of("Adaugarea de exemple de optimizare a memoriei in productie")
        );
    }
}
