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
        log.info("🤖 [OUTREACH AGENT] Generăm mesaj personalizat de conectare pentru {} - {}", companyName, jobTitle);

        return String.format("""
                # Mesaje Personalizate de Contact Recruiter

                ## Varianta 1: Mesaj Conectare LinkedIn (Sub 300 Caractere)
                Buna ziua! Am observat oportunitatea de %s la %s si consider ca experienta mea cu Java 21, Spring Boot si arhitecturi de baze de date se potriveste excelent cerintelor echipei dumneavoastra. Mi-ar face mare placere sa ne conectam!

                ## Varianta 2: Email Cold Outreach Către Technical Recruiter / Engineering Manager
                Subiect: Candidatură %s - %s

                Bună ziua,

                Vă scriu pentru a-mi exprima interesul ferm față de poziția de %s în cadrul echipei %s.

                Dețin o pregătire solidă în dezvoltarea de servicii REST backend scalabile utilizând Java 21, Spring Boot 3.3, PostgreSQL și Docker. Recent, am proiectat o platformă ATS cu căutare semantică vectorială (pgvector) și integrare LLM.

                Aș fi încântat să stabilim o scurtă discuție pentru a vă prezenta modul în care pot aduce valoare imediată proiectelor dumneavoastră.

                Cu stima,
                %s
                """, jobTitle, companyName, jobTitle, candidateName, jobTitle, companyName, candidateName);
    }
}
