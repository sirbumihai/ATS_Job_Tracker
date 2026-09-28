package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.outreach.OutreachBundleDto;
import com.jobtracker.ats.dto.outreach.OutreachCadenceDto;
import com.jobtracker.ats.dto.outreach.OutreachGenerateRequest;
import com.jobtracker.ats.dto.outreach.OutreachMessageDto;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class OutreachService {

    private final ApplicationRepository applicationRepository;
    private final OpenAiLlmService openAiLlmService;

    public OutreachBundleDto generateOutreach(OutreachGenerateRequest request) {
        String company = request.companyName() != null && !request.companyName().isBlank()
                ? request.companyName().trim() : "Companie";
        String jobTitle = request.jobTitle() != null && !request.jobTitle().isBlank()
                ? request.jobTitle().trim() : "Software Engineer";
        String recruiterName = request.recruiterName() != null && !request.recruiterName().isBlank()
                ? request.recruiterName().trim() : "Hiring Manager";
        LocalDate appliedDate = request.appliedDate() != null ? request.appliedDate() : LocalDate.now();

        // If applicationId is provided, enrich from database
        if (request.applicationId() != null) {
            var appOpt = applicationRepository.findById(request.applicationId());
            if (appOpt.isPresent()) {
                Application app = appOpt.get();
                if (app.getJobPosting() != null) {
                    if (company.equals("Companie") && app.getJobPosting().getCompanyName() != null) {
                        company = app.getJobPosting().getCompanyName();
                    }
                    if (jobTitle.equals("Software Engineer") && app.getJobPosting().getJobTitle() != null) {
                        jobTitle = app.getJobPosting().getJobTitle();
                    }
                }
                if (app.getAppliedDate() != null) {
                    appliedDate = app.getAppliedDate();
                }
            }
        }

        OutreachCadenceDto cadence = calculateCadence(appliedDate);

        // Pre-built LinkedIn search queries
        String encodedComp = URLEncoder.encode(company, StandardCharsets.UTF_8);
        String recruiterSearchUrl = "https://www.linkedin.com/search/results/people/?keywords=Recruiter%20" + encodedComp;
        String emSearchUrl = "https://www.linkedin.com/search/results/people/?keywords=Engineering%20Manager%20" + encodedComp;

        // Try AI generation if configured
        OutreachMessageDto linkedinNote = null;
        OutreachMessageDto coldEmail = null;
        OutreachMessageDto followUp1 = null;
        OutreachMessageDto followUp2 = null;

        if (openAiLlmService.isConfigured()) {
            try {
                linkedinNote = generateAiLinkedInNote(company, jobTitle, recruiterName);
            } catch (Exception e) {
                log.warn("Eroare la generarea LinkedIn Note via AI, folosim fallback determinist: {}", e.getMessage());
            }
        }

        if (linkedinNote == null) {
            linkedinNote = buildDeterministicLinkedInNote(company, jobTitle, recruiterName);
        }

        coldEmail = buildDeterministicColdEmail(company, jobTitle, recruiterName);
        followUp1 = buildDeterministicFollowUp1(company, jobTitle, recruiterName);
        followUp2 = buildDeterministicFollowUp2(company, jobTitle, recruiterName);

        List<String> booleanQueries = List.of(
                "site:linkedin.com/in (\"technical recruiter\" OR \"talent acquisition\") \"" + company + "\" \"Romania\"",
                "site:linkedin.com/in (\"engineering manager\" OR \"software engineering manager\") \"" + company + "\"",
                "site:linkedin.com/in (\"lead software engineer\" OR \"tech lead\") \"" + company + "\""
        );

        List<String> conversationStarters = List.of(
                "Am remarcat dezvoltarea recentă a echipei de engineering de la " + company + " și am vrut să vă felicit pentru noile inițiative.",
                "Urmăresc produsele dezvoltate de " + company + " și sunt impresionat de scalabilitatea soluțiilor voastre backend.",
                "Ca student la Automatică și Calculatoare UPB, studiez îndeaproape stack-ul tehnologic utilizat în arhitectura voastră."
        );

        return new OutreachBundleDto(
                company,
                jobTitle,
                recruiterName,
                recruiterSearchUrl,
                emSearchUrl,
                linkedinNote,
                coldEmail,
                followUp1,
                followUp2,
                cadence,
                booleanQueries,
                conversationStarters
        );
    }

    public OutreachCadenceDto calculateCadence(LocalDate appliedDate) {
        if (appliedDate == null) {
            appliedDate = LocalDate.now();
        }
        long days = ChronoUnit.DAYS.between(appliedDate, LocalDate.now());
        if (days < 0) days = 0;

        if (days <= 4) {
            return new OutreachCadenceDto(
                    (int) days,
                    "DAY_0_APPLY",
                    "Ziua " + days + " • Conectare Inițială",
                    "emerald",
                    "Trimite acum o cerere de conectare pe LinkedIn cu notă personalizată (<300 caractere) către Recruiter sau Engineering Manager.",
                    "Cel mai bun moment pentru conectare este în primele 24-48h de la aplicare, când CV-ul tău e încă proaspăt în sistem."
            );
        } else if (days <= 9) {
            return new OutreachCadenceDto(
                    (int) days,
                    "DAY_5_CHECKIN",
                    "Ziua " + days + " • Follow-Up #1 Recomandat",
                    "amber",
                    "Au trecut " + days + " zile de la aplicare. Trimite mesajul de Follow-Up #1 polite bump pe LinkedIn sau Email.",
                    "Recruiterii primesc sute de CV-uri. Un bump politicos după 5-7 zile crește rata de răspuns cu peste 45% fără a fi insistent."
            );
        } else if (days <= 14) {
            return new OutreachCadenceDto(
                    (int) days,
                    "DAY_10_CLOSING",
                    "Ziua " + days + " • Follow-Up #2 (Value Add)",
                    "blue",
                    "Au trecut " + days + " zile. Trimite Follow-Up #2 adăugând un element de valoare: link către un feature recent din ATS Tracker sau repo GitHub.",
                    "Dacă nu ai primit răspuns, adăugarea unei dovezi de progres tehnic (un proiect finalizat sau certificat) poate debloca interviul."
            );
        } else {
            return new OutreachCadenceDto(
                    (int) days,
                    "DAY_15_ARCHIVED",
                    "Ziua " + days + " • Închidere Buclă / Menținere Relație",
                    "gray",
                    "Păstrează recruiterul în rețeaua ta de conexiuni. Mulțumește pentru atenție și lasă o impresie impecabilă pe termen lung.",
                    "Un candidat care mulțumește elegant chiar și fără răspuns imediat este reținut pentru deschideri viitoare."
            );
        }
    }

    private OutreachMessageDto buildDeterministicLinkedInNote(String company, String jobTitle, String recruiterName) {
        String salutation = recruiterName.equalsIgnoreCase("Hiring Manager") || recruiterName.equalsIgnoreCase("Recruiter")
                ? "Salut" : "Salut " + recruiterName;

        String note = salutation + "! Am văzut rolul de " + jobTitle + " la " + company +
                ". Ca student la UPB Automatica am dezvoltat proiecte Spring Boot & pgvector (ATS Tracker). Mi-ar plăcea mult să ne conectăm și să schimbăm câteva idei! Toate cele bune, Mihai";

        // Strictly guarantee under 300 characters
        if (note.length() > 295) {
            note = salutation + "! Am aplicat pentru rolul de " + jobTitle + " la " + company +
                    ". Sunt pasionat de Spring Boot & Java (UPB Automatica). Mi-ar face plăcere să ne conectăm! Mihai Sirbu";
        }
        if (note.length() > 295) {
            note = note.substring(0, 290) + "...";
        }

        return new OutreachMessageDto(
                "LINKEDIN_NOTE",
                "Notă de Conectare LinkedIn (<300 caractere)",
                "Conectare LinkedIn",
                note,
                note.length(),
                "Technical Recruiter / Talent Acquisition",
                "Trimite această notă atunci când apeși 'Add a note' la conectare. LinkedIn limitează nota la 300 de caractere."
        );
    }

    private OutreachMessageDto generateAiLinkedInNote(String company, String jobTitle, String recruiterName) {
        String systemPrompt = "Ești un expert în carieră IT și networking pe LinkedIn. " +
                "Generează o notă de conectare LinkedIn personalizată de maxim 280 caractere (strict sub 300). " +
                "Profilul candidatului: Sîrbu Mihai, student la Calculatoare UPB, experiență Java, Spring Boot, PostgreSQL, SIMAVI internship. " +
                "Fără clișee, directă, politicoasă, în limba română.";
        String userPrompt = "Generează nota de conectare pentru recruiterul " + recruiterName + " de la " + company + " pentru rolul " + jobTitle + ". Returnează doar textul notei, fără alte comentarii.";

        String response = openAiLlmService.generateCompletion(systemPrompt, userPrompt, 200, 0.4);
        if (response != null && !response.isBlank()) {
            String cleaned = response.trim().replaceAll("^\"|\"$", "");
            if (cleaned.length() <= 298) {
                return new OutreachMessageDto(
                        "LINKEDIN_NOTE",
                        "Notă de Conectare LinkedIn (<300 caractere - AI Tailored)",
                        "Conectare LinkedIn",
                        cleaned,
                        cleaned.length(),
                        "Technical Recruiter / Talent Acquisition",
                        "Generat inteligent pentru a evidenția background-ul tău de la UPB și alinierea cu compania."
                );
            }
        }
        return null;
    }

    private OutreachMessageDto buildDeterministicColdEmail(String company, String jobTitle, String recruiterName) {
        String subject = "Candidatură " + jobTitle + " • Sîrbu Mihai (UPB Automatica & Calculatoare)";
        String body = "Bună ziua " + (recruiterName.contains("Manager") ? "" : recruiterName) + ",\n\n" +
                "Vă scriu cu privire la poziția deschisă de " + jobTitle + " din cadrul " + company + ", pe care am remarcat-o cu deosebit interes. Urmăresc proiectele dezvoltate de echipa voastră de engineering și admir accentul pus pe soluții robuste și scalabile.\n\n" +
                "Sunt student la Facultatea de Automatică și Calculatoare, Universitatea POLITEHNICA din București. În cadrul stagiului meu la SIMAVI am conceput module backend cu Spring Boot și am optimizat interogări SQL pentru baze de date de peste 50.000 de înregistrări. De asemenea, am dezvoltat de la zero 'ATS Job Tracker', un sistem full-stack cu Java 21, Spring Boot 3.3, căutare vectorială HNSW în PostgreSQL și arhitectură containerizată Docker.\n\n" +
                "Consider că abilitățile mele de rezolvare algoritmică a problemelor și pasiunea pentru arhitecturi backend curate ar aduce un plus de valoare rapid echipei voastre de la " + company + ".\n\n" +
                "Vă las atașat CV-ul meu detaliat. Mi-ar face o deosebită plăcere să povestim timp de 10-15 minute despre cum aș putea contribui la obiectivele echipei tehnice.\n\n" +
                "Vă mulțumesc pentru timpul acordat!\n\n" +
                "Cu stimă,\n" +
                "Mihai-Alexandru Sîrbu\n" +
                "sarbumihai0@gmail.com • București\n" +
                "https://www.linkedin.com/in/sirbu-mihai-86133b181\n" +
                "https://github.com/sirbumihai";

        return new OutreachMessageDto(
                "COLD_EMAIL",
                "Cold Email Structurat către Hiring Manager (4 Paragrafe)",
                subject,
                body,
                body.length(),
                "Hiring Manager / Team Lead",
                "E-mail direct cu structură dovedită: Hook relevant -> Aliniere tehnică (UPB/SIMAVI/ATS Tracker) -> Propunere de valoare -> Call to action scurt și respectuos."
        );
    }

    private OutreachMessageDto buildDeterministicFollowUp1(String company, String jobTitle, String recruiterName) {
        String subject = "Re: Candidatură " + jobTitle + " • Sîrbu Mihai";
        String body = "Bună ziua " + (recruiterName.contains("Manager") ? "" : recruiterName) + ",\n\n" +
                "Revin cu un scurt mesaj de urmărire privind candidatura mea pentru rolul de " + jobTitle + " la " + company + ", trimisă recent.\n\n" +
                "Înțeleg pe deplin că programul dumneavoastră este extrem de încărcat și că aveți un volum ridicat de candidați. Am dorit doar să reiterez interesul meu autentic pentru echipa de la " + company + " și disponibilitatea mea imediată pentru o discuție preliminară sau un test tehnic.\n\n" +
                "Vă mulțumesc mult pentru răbdare și vă doresc o săptămână cât mai productivă!\n\n" +
                "Cu stimă,\n" +
                "Mihai Sîrbu\n" +
                "sarbumihai0@gmail.com";

        return new OutreachMessageDto(
                "FOLLOW_UP_1",
                "Follow-Up #1 (Ziua 5-7 de la aplicare)",
                subject,
                body,
                body.length(),
                "Recruiter / Hiring Manager",
                "Trimite acest mesaj la 5-7 zile de la aplicare. Este scurt, respectuos și reamintește de candidatura ta fără să fie presant."
        );
    }

    private OutreachMessageDto buildDeterministicFollowUp2(String company, String jobTitle, String recruiterName) {
        String subject = "Update Proiect & Interes " + jobTitle + " • Sîrbu Mihai";
        String body = "Bună ziua " + (recruiterName.contains("Manager") ? "" : recruiterName) + ",\n\n" +
                "Sper că acest mesaj vă găsește cu bine. Știu că sunteți probabil în faza finală de selecție pentru rolul de " + jobTitle + " la " + company + ".\n\n" +
                "Am vrut doar să vă împărtășesc un mic update tehnic: am adăugat recent în sistemul meu ATS Job Tracker un modul nou de căutare hibridă și parsare automată de date, implementat în Spring Boot și integrat cu Docker Compose. Proiectul este documentat și deschis pe GitHub la: https://github.com/sirbumihai/ATS_Job_Tracker\n\n" +
                "Dacă poziția mai este de interes sau dacă se ivesc oportunități viitoare în echipa tehnică, aș fi încântat să rămânem în contact.\n\n" +
                "Toate cele bune și mult succes în continuare!\n\n" +
                "Cu respect,\n" +
                "Mihai Sîrbu";

        return new OutreachMessageDto(
                "FOLLOW_UP_2",
                "Follow-Up #2 (Ziua 10-12 • Value Add)",
                subject,
                body,
                body.length(),
                "Engineering Lead / Recruiter",
                "În loc de un simplu 'mai știți ceva de mine?', oferă o dovadă suplimentară de progres tehnic (un repo GitHub proaspăt actualizat)."
        );
    }
}
