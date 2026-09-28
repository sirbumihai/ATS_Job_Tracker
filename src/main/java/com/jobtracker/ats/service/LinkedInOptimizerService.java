package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.linkedin.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class LinkedInOptimizerService {

    private final OpenAiLlmService openAiLlmService;

    public LinkedInProfileDto getDemoProfile() {
        return new LinkedInProfileDto(
                "Sirbu Mihai",
                "Student la Universitatea POLITEHNICA din Bucuresti",
                "Bucureşti, Bucureşti, România",
                "sarbumihai0@gmail.com",
                "https://www.linkedin.com/in/sirbu-mihai-86133b181",
                "+40 700 000 000",
                "500+ conexiuni",
                "",
                List.of(
                        new LinkedInEducationDto(
                                "Universitatea POLITEHNICA din București",
                                "Informatică",
                                "octombrie 2022 – iulie 2026",
                                "UP"
                        ),
                        new LinkedInEducationDto(
                                "Facultatea de Automatică și Calculatoare, UPB",
                                "Informatică și servicii de asistență",
                                "octombrie 2022 – iulie 2026",
                                "FD"
                        )
                ),
                List.of(),
                List.of("Microsoft SQL Server", "Algorithms", "Trello"),
                List.of("Germană (Elementary)", "Engleză (Professional)"),
                List.of(
                        "Problem Solving (Intermediate) - HackerRank",
                        "SQL & Relational Databases Certification"
                ),
                List.of(
                        new LinkedInProjectDto(
                                "ATS Job Tracker & Recruiter AI Matching Platform",
                                "Platformă full-stack pentru agregarea și analiza inteligentă a ofertelor de muncă IT din România, cu matching semantic pgvector, calcul ATS score în timp real și generare de CV-uri personalizate.",
                                "februarie 2025 – prezent",
                                "https://github.com/sirbumihai/ATS_Job_Tracker",
                                List.of("Java 21", "Spring Boot 3", "PostgreSQL", "pgvector", "Docker", "React", "Tailwind CSS"),
                                "Facultatea de Automatică și Calculatoare, UPB"
                        ),
                        new LinkedInProjectDto(
                                "Sistem de Management & Optimizare Baze de Date Relaționale",
                                "Proiectare schemă relațională 3NF, indexare avansată B-Tree și optimizare interogări complexe pentru procesarea tranzacțiilor la latență scăzută sub 50ms.",
                                "octombrie 2024 – ianuarie 2025",
                                "https://github.com/sirbumihai",
                                List.of("Microsoft SQL Server", "SQL", "Database Design", "Algorithms"),
                                "Universitatea POLITEHNICA din București"
                        )
                ),
                List.of(
                        new LinkedInFeaturedDto(
                                "ATS Job Tracker - Repozitoriu GitHub & Arhitectură",
                                "LINK",
                                "https://github.com/sirbumihai/ATS_Job_Tracker",
                                "github.com • Proiect Open-Source Full-Stack",
                                "Proiect de Top"
                        ),
                        new LinkedInFeaturedDto(
                                "CV Tehnic Software Engineer 2026 (Format PDF)",
                                "DOCUMENT",
                                "#",
                                "Format curat de 1 pagină optimizat pentru sistemele ATS",
                                "CV Descărcabil"
                        ),
                        new LinkedInFeaturedDto(
                                "Analiză & Radar Piața IT România (Junior Backend & Java)",
                                "POST",
                                "#",
                                "Articol tehnic LinkedIn despre cerințele reale ale angajatorilor",
                                "Articol & Conținut"
                        )
                )
        );
    }

    public LinkedInOptimizationResult optimizeProfile(LinkedInOptimizationRequest request) {
        LinkedInProfileDto profile = request.profile() != null ? request.profile() : getDemoProfile();
        String domain = request.targetDomain() != null ? request.targetDomain() : "BACKEND";
        String level = request.targetRoleLevel() != null ? request.targetRoleLevel() : "JUNIOR";

        // 1. Calcul scor profil granular (6 dimensiuni)
        int headlineScore = calculateHeadlineScore(profile.headline());
        int aboutScore = calculateAboutScore(profile.about());
        int skillsScore = calculateSkillsScore(profile.skills());
        int educationScore = profile.education() != null && !profile.education().isEmpty() ? 15 : 5;
        int projectsScore = (profile.projects() != null && !profile.projects().isEmpty()) ? 15 :
                           (profile.featured() != null && !profile.featured().isEmpty() ? 10 : 0);
        int urlScore = (profile.linkedinUrl() != null && !profile.linkedinUrl().matches(".*-\\d{6,}.*")) ? 10 : 5;

        int overallScore = headlineScore + aboutScore + skillsScore + educationScore + projectsScore + urlScore;
        overallScore = Math.max(15, Math.min(100, overallScore));

        String scoreGrade;
        if (overallScore >= 85) {
            scoreGrade = "All-Star Profile (Algoritm LinkedIn Recruiter 100% Optimizat)";
        } else if (overallScore >= 65) {
            scoreGrade = "Profil Bun (Punctaj bun, mai necesită 2-3 completări strategice)";
        } else if (overallScore >= 45) {
            scoreGrade = "Nivel Mediu (Risc mare de eliminare la filtrele automate)";
        } else {
            scoreGrade = "Profil Începător (Vizibilitate scăzută în căutările recruiterilor)";
        }

        Map<String, Integer> breakdown = new HashMap<>();
        breakdown.put("Headline & Rol Țintă (SEO #1)", headlineScore);
        breakdown.put("Secțiunea Despre (About & Storytelling)", aboutScore);
        breakdown.put("Aptitudini & Pinned Skills", skillsScore);
        breakdown.put("Secțiune Proiecte & Featured", projectsScore);
        breakdown.put("Educație & Cursuri Relevante", educationScore);
        breakdown.put("Branding & URL Personalizat", urlScore);

        // 2. Gaps & Puncte Tari
        List<String> criticalGaps = new ArrayList<>();
        List<String> strengths = new ArrayList<>();

        if (profile.about() == null || profile.about().isBlank()) {
            criticalGaps.add("Lipsește secțiunea 'About' (Rezumat). Recruiterii și algoritmii semantici citesc rezumatul pentru a evalua contextul proiectelor și motivația.");
        } else if (profile.about().length() < 180) {
            criticalGaps.add("Secțiunea 'About' este foarte scurtă. Recomandat: 3 paragrafe structurate (Cine ești + Tehnologii & Proiecte + Call to action).");
        } else {
            strengths.add("Secțiunea 'About' conține o poveste profesională convingătoare și cuvinte cheie indexabile.");
        }

        if (profile.headline() != null && (profile.headline().toLowerCase().startsWith("student la") || profile.headline().equalsIgnoreCase("student"))) {
            criticalGaps.add("Headline-ul 'Student la Universitatea...' este invizibil pentru recruiteri. Ei caută titluri specifice ca 'Junior Software Engineer' sau 'Java Developer'.");
        } else if (profile.headline() != null && profile.headline().contains("|")) {
            strengths.add("Headline-ul utilizează separatorul '|' și include tehnologii cheie (semnal puternic de SEO).");
        }

        if (profile.skills() == null || profile.skills().size() < 5) {
            criticalGaps.add("Ai doar " + (profile.skills() != null ? profile.skills().size() : 0) + " aptitudini listate. Profilurile cu minimum 5 aptitudini primesc de 17x mai multe mesaje de la angajatori.");
        } else if (profile.skills().size() < 15) {
            criticalGaps.add("Ai " + profile.skills().size() + " aptitudini. Se recomandă atingerea pragului de 15-25 aptitudini din spectrul Frontend, Backend, Baze de Date și Metodologii.");
        } else {
            strengths.add("Ai peste 15 aptitudini listate, ceea ce maximizează șansele de potrivire în căutările automate.");
        }

        if (profile.projects() == null || profile.projects().isEmpty()) {
            criticalGaps.add("Nu ai adăugat proiecte în secțiunea dedicată 'Projects'. Pentru studenți și juniori, proiectele practice pe GitHub sunt principalul substitut pentru experiența în corporație.");
        } else {
            strengths.add("Secțiunea Proiecte conține aplicații practice cu tehnologii moderne (diferențiator masiv).");
        }

        if (profile.linkedinUrl() != null && profile.linkedinUrl().matches(".*-\\d{6,}.*")) {
            criticalGaps.add("URL-ul tău public conține cifre generate automat. Personalizează-l la o adresă curată: linkedin.com/in/sirbu-mihai.");
        } else {
            strengths.add("URL-ul profilului este personalizat și curat.");
        }

        if (profile.education() != null && !profile.education().isEmpty()) {
            strengths.add("Prezența studiilor la Universitatea POLITEHNICA din București (Automatică și Calculatoare) este un brand academic de prestigiu.");
        }

        // 3. Generare Headline-uri optimizate
        List<HeadlineOptionDto> optimizedHeadlines = generateHeadlineOptions(profile, domain);

        // 4. Generare secțiune About optimizată
        String optimizedAbout = generateOptimizedAbout(profile, domain);

        // 5. Aptitudini recomandate conform pieței din România
        List<RecommendedSkillDto> recommendedSkills = generateRecommendedSkills(profile, domain);

        // 6. Sfaturi strategice de recruiter (categorisite)
        List<RecruiterTipDto> recruiterTips = generateRecruiterTips();

        // 7. Plan de acțiune pas cu pas (Action Checklist)
        List<LinkedInActionStepDto> actionPlan = generateActionPlan(profile);

        // 8. Proiecte sugerate în format Google XYZ / STAR
        List<LinkedInProjectDto> suggestedProjects = generateSuggestedProjects();

        // 9. Interogări booleene rulate de recruiteri
        List<RecruiterBooleanQueryDto> recruiterQueries = generateRecruiterBooleanQueries();

        return new LinkedInOptimizationResult(
                overallScore,
                scoreGrade,
                breakdown,
                criticalGaps,
                strengths,
                optimizedHeadlines,
                optimizedAbout,
                recommendedSkills,
                recruiterTips,
                actionPlan,
                suggestedProjects,
                recruiterQueries
        );
    }

    private int calculateHeadlineScore(String headline) {
        if (headline == null || headline.isBlank()) return 3;
        String h = headline.toLowerCase();
        if (h.startsWith("student la") || h.equals("student")) return 8;
        int score = 12;
        if (h.contains("|") || h.contains("•") || h.contains("-")) score += 4;
        if (h.contains("engineer") || h.contains("developer") || h.contains("backend") || h.contains("java") || h.contains("full-stack")) score += 4;
        return Math.min(20, score);
    }

    private int calculateAboutScore(String about) {
        if (about == null || about.isBlank()) return 0;
        if (about.length() < 120) return 6;
        if (about.length() < 300) return 14;
        return 20;
    }

    private int calculateSkillsScore(List<String> skills) {
        if (skills == null || skills.isEmpty()) return 4;
        if (skills.size() < 4) return 8;
        if (skills.size() < 8) return 14;
        return 20;
    }

    private List<HeadlineOptionDto> generateHeadlineOptions(LinkedInProfileDto profile, String domain) {
        List<HeadlineOptionDto> list = new ArrayList<>();

        list.add(new HeadlineOptionDto(
                "Formula Recomandată: Rol Țintă + Core Stack + Universitate + Impact",
                "Junior Software Engineer | Java & Spring Boot | Student @ UPB Automatica & Calculatoare | Building Scalable Systems & REST APIs",
                "Rețeta #1 pentru Recruiter Search. Conține exact termenii după care filtrează HR-ul din companii ca Adobe, Bitdefender, Endava, UiPath.",
                true
        ));

        list.add(new HeadlineOptionDto(
                "Formula Inginerie Software, Baze de Date & Algoritmi",
                "Software Engineer in Training | Java • PostgreSQL • Docker | CS Student @ UPB | Passionate about Clean Code & Distributed Architecture",
                "Evidențiază rigoarea inginerească, arhitectura curată și fundația solidă în baze de date.",
                false
        ));

        list.add(new HeadlineOptionDto(
                "Formula Backend & Cloud Ready (Disponibilitate Imediată)",
                "Junior Backend Developer | Java, Spring Boot, Microservices, SQL | UPB CS | Open to Entry-Level & Internship Opportunities",
                "Semnalizează direct disponibilitatea de angajare către recruiterii activi pe piața de tineret din București.",
                false
        ));

        list.add(new HeadlineOptionDto(
                "Formula Versatilă: Full-Stack & AI Builder",
                "Junior Full-Stack / Backend Engineer | Java 21 • Spring Boot • React • pgvector | CS Student @ UPB Automatica | Building ATS Job Tracker",
                "Leagă direct profilul de proiectul tău real și complex de pe GitHub, demonstrând autonomie și execuție.",
                false
        ));

        return list;
    }

    private String generateOptimizedAbout(LinkedInProfileDto profile, String domain) {
        return "Sunt student în cadrul Facultății de Automatică și Calculatoare (Universitatea POLITEHNICA din București), dedicat ingineriei software, dezvoltării de sisteme backend robuste și scalabile și optimizării algoritmice.\n\n" +
                "🛠️ Ce construiesc și ce știu să fac:\n" +
                "• Backend & Arhitectură: Java 21, Spring Boot 3, RESTful APIs, arhitecturi orientate pe microservicii, principii Clean Architecture și SOLID.\n" +
                "• Baze de Date & Persistență: PostgreSQL, Microsoft SQL Server, indexare avansată, modelare relațională 3NF, optimizare de interogări SQL și căutare vectorială cu pgvector.\n" +
                "• DevOps & Unelte Moderne: Docker, containerizare, Git & GitHub workflows, Maven, Linux și integrare continuă (CI/CD).\n" +
                "• Proiecte Reprezentative: Am proiectat și implementat ATS Job Tracker (Spring Boot 3 + PostgreSQL + React + Docker), un sistem complex cu web crawling automat, deduplicare concurentă și potrivire semantică a joburilor.\n\n" +
                "💡 Despre mine:\n" +
                "Îmi place să înțeleg mecanismele de profunzime ale sistemelor – de la complexitatea algoritmilor și alocarea memoriei, până la fluxul complet al pachetelor printr-un API securizat. Sunt o persoană riguroasă, analitică și motivată să lucrez într-o echipă tehnică unde calitatea codului este o prioritate.\n\n" +
                "🎯 Obiectiv curent: Sunt deschis pentru roluri de Junior Software Engineer / Junior Backend Developer sau Internship tehnic.\n\n" +
                "📫 Contact direct: " + (profile.email() != null && !profile.email().isBlank() ? profile.email() : "sarbumihai0@gmail.com") + " | Bucuros să mă conectez cu colegi din industrie, mentori și tech recruiters!";
    }

    private List<RecommendedSkillDto> generateRecommendedSkills(LinkedInProfileDto profile, String domain) {
        List<RecommendedSkillDto> list = new ArrayList<>();
        Set<String> currentSkills = new HashSet<>();
        if (profile.skills() != null) {
            for (String s : profile.skills()) currentSkills.add(s.toLowerCase().trim());
        }

        addSkillIfMissing(list, currentSkills, "Java", "Limbaje de Programare", "59.6% din joburile de Backend Junior", "Limbajul de bază cel mai căutat în companiile enterprise, banking și fintech din România.");
        addSkillIfMissing(list, currentSkills, "Spring Boot", "Frameworks & Web", "Standard industrial Backend", "Framework-ul dominant pentru microservicii, securitate și API-uri sigure în ecosistemul Java.");
        addSkillIfMissing(list, currentSkills, "Git & GitHub", "Unelte & Metodologii", "23.8% cerință directă", "Esențial în orice echipă pentru branching, pull requests, versionare și colaborare pe cod.");
        addSkillIfMissing(list, currentSkills, "Docker", "Cloud & DevOps", "Top căutat în 2026", "Containerizarea este o cerință obligatorie chiar și la interviurile de junior software engineer.");
        addSkillIfMissing(list, currentSkills, "REST API", "Frameworks & Web", "17.6% prezență în cerințe", "Proiectarea endpoint-urilor conforme standardelor HTTP/JSON, serializare și integrare clienți.");
        addSkillIfMissing(list, currentSkills, "OOP & Clean Code", "Unelte & Metodologii", "15.0% frecvență", "Principii fundamentale (SOLID, DRY, Design Patterns) testate riguros la orice interviu tehnic.");
        addSkillIfMissing(list, currentSkills, "PostgreSQL", "Baze de Date", "Baza relațională open-source #1", "Cea mai apreciată bază de date relațională în startup-uri și companii moderne de produs.");
        addSkillIfMissing(list, currentSkills, "Python", "Limbaje de Programare", "11.7% cerință piață", "Excelent pentru scripting, automatizare, procesare de date și explorare în domeniul AI/ML.");
        addSkillIfMissing(list, currentSkills, "Data Structures", "Arhitectură & Concepte CS", "Testat la interviuri tehnice", "Demonstrează fundamentul academic solid în arbori, grafuri, hash maps și complexitate O(n).");
        addSkillIfMissing(list, currentSkills, "Microservices", "Arhitectură & Concepte CS", "Cerință sisteme distribuite", "Înțelegerea arhitecturilor distribuite decuplate față de monoliți crește imediat valoarea profilului.");

        return list;
    }

    private void addSkillIfMissing(List<RecommendedSkillDto> list, Set<String> current, String name, String cat, String demand, String why) {
        if (!current.contains(name.toLowerCase().trim())) {
            list.add(new RecommendedSkillDto(name, cat, demand, why));
        }
    }

    private List<RecruiterTipDto> generateRecruiterTips() {
        return List.of(
                new RecruiterTipDto(
                        "tip_headline_220",
                        "Folosește la maximum cele 220 de caractere din Headline",
                        "Headline-ul are cea mai mare pondere în algoritmul semantic de căutare. Nu lăsa doar titlul jobului – include stiva tehnică și valoarea oferită.",
                        "Algoritm SEO #1",
                        "Copiază una dintre formulele generate mai sus și adaug-o în câmpul Headline din profilul tău LinkedIn."
                ),
                new RecruiterTipDto(
                        "tip_open_to_work_hidden",
                        "Activează 'Open to Work' setat pe 'Recruiters Only'",
                        "Semnalizează disponibilitatea de angajare către sute de recruiteri care folosesc LinkedIn Recruiter, fără badge-ul verde public ce poate scădea puterea de negociere.",
                        "Secret Recruiter",
                        "Profil ➔ Open to ➔ Finding a new job ➔ Selectează 5 roluri (Junior Software Engineer, Java Developer, Backend Developer, Full Stack Developer, Software Engineer) ➔ Alege 'Recruiters only'."
                ),
                new RecruiterTipDto(
                        "tip_featured_showcase",
                        "Configurează secțiunea 'În prim-plan' (Featured) ca vitrină tehnică",
                        "Profilurile care au secțiunea Featured completată au cu 30% mai multe vizualizări. Pune primul link către proiectul tău cel mai mândru de pe GitHub.",
                        "Diferențiator Masiv",
                        "Add profile section ➔ Recommended ➔ Add featured ➔ Adaugă link-ul repo-ului ATS Job Tracker și atașează CV-ul tău în format PDF."
                ),
                new RecruiterTipDto(
                        "tip_skills_pin_top3",
                        "Adaugă minimum 25-30 aptitudini și fixează (Pin) Top 3",
                        "Filtrele automate LinkedIn Recruiter resping profilurile fără keyword-uri specifice. Fixarea primelor 3 aptitudini dictează relevanța directă a profilului.",
                        "Indexare Căutare",
                        "Fixează 'Java', 'Spring Boot' și 'SQL' / 'PostgreSQL' ca cele 3 aptitudini principale în secțiunea Skills."
                ),
                new RecruiterTipDto(
                        "tip_star_projects",
                        "Descrie proiectele folosind formula Google XYZ / STAR",
                        "Nu scrie 'Am lucrat la un proiect cu Java'. Scrie: 'Am dezvoltat o aplicație de agregare joburi în Java 21 și Spring Boot, reducând latența interogărilor sub 50ms prin indexare pgvector.'",
                        "Formulă de Impact",
                        "Vezi secțiunea 'Proiecte Sugerate STAR' de mai jos și copiază descrierile optimizate direct pe profil."
                ),
                new RecruiterTipDto(
                        "tip_clean_custom_url",
                        "Personalizează URL-ul public LinkedIn",
                        "Elimină cifrele aleatorii din link (ex: linkedin.com/in/sirbu-mihai-86133b181). Un link curat precum linkedin.com/in/sirbu-mihai arată mult mai profesionist pe CV și ajută la indexarea Google.",
                        "Branding Personal",
                        "Accesează profilul ➔ 'Public profile & URL' din dreapta-sus ➔ Editează slug-ul cu prenume-nume."
                ),
                new RecruiterTipDto(
                        "tip_500_connections_circle",
                        "Atinge pragul strategic de 500+ Conexiuni",
                        "Algoritmul de căutare LinkedIn Recruiter prioritizează candidații din gradul 1 și 2. Dacă ai sub 200 de conexiuni, majoritatea recruiterilor nu te vor vedea pe primele 3 pagini de rezultate.",
                        "Rețea & Social Proof",
                        "Conectează-te săptămânal cu 10-15 colegi de la UPB, absolvenți Automatica & Calculatoare și Technical Recruiters din companiile tech din România."
                ),
                new RecruiterTipDto(
                        "tip_recommendations_social_proof",
                        "Obține 2-3 Recomandări scrise de la colegi / profesori",
                        "Recomandările scrise oferă validare externă autentică. Statisticile arată că un profil cu cel puțin 2 recomandări primește de până la 14x mai multe vizite.",
                        "Credibilitate 14x",
                        "Cere o recomandare scurtă unui coleg de echipă cu care ai colaborat la un proiect de facultate sau unui profesor de laborator."
                ),
                new RecruiterTipDto(
                        "tip_depth_score_activity",
                        "Menține profilul 'viu' prin comentarii și postări tehnice",
                        "În 2026, LinkedIn acordă o pondere mare 'Depth Score'-ului. O postare lunară despre un proiect tehnic sau comentarii constructive la postări tech semnalizează că ești activ.",
                        "Algoritm de Activitate",
                        "Publică o postare scurtă cu capturi de ecran din ATS Job Tracker explicând ce ai învățat construind sistemul de scraping și matching vectorial."
                )
        );
    }

    private List<LinkedInActionStepDto> generateActionPlan(LinkedInProfileDto profile) {
        List<LinkedInActionStepDto> steps = new ArrayList<>();

        steps.add(new LinkedInActionStepDto(
                "step_1",
                "1",
                "Personalizează URL-ul Public al Profilului",
                "Branding & SEO",
                "+15% Vizibilitate Google & CV Curat",
                "2 min",
                "Mergi pe profil ➔ Click pe creionul de lângă 'Public profile & URL' (dreapta sus) ➔ Schimbă din sirbu-mihai-86133b181 în sirbu-mihai sau sirbumihai-dev.",
                "linkedin.com/in/sirbu-mihai",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_2",
                "2",
                "Actualizează Headline-ul cu Formula de 220 Caractere",
                "Algoritm Recruiter SEO",
                "#1 Semnal de Indexare în Căutări",
                "3 min",
                "Editează Headline-ul. Înlocuiește 'Student la Universitatea...' cu titlul rolului țintă, stiva tehnică și universitatea.",
                "Junior Software Engineer | Java & Spring Boot | Student @ UPB Automatica & Calculatoare | Building Scalable Systems",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_3",
                "3",
                "Configurează 'Open to Work' Discret (Recruiters Only)",
                "Filtre Recruiter",
                "+40% Șanse de Contact Direct (InMail)",
                "5 min",
                "Apasă butonul 'Open to' de sub headline ➔ 'Finding a new job'. Adaugă 5 roluri: Junior Software Engineer, Java Developer, Junior Backend Developer, Software Engineer, Full Stack Developer. Selectează locațiile (București, Remote România) și setează vizibilitatea pe 'Recruiters only'.",
                "Roluri: 5 | Locație: București / Remote | Vizibilitate: Recruiters only",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_4",
                "4",
                "Adaugă Rezumatul 'About' în 3 Paragrafe cu Date de Contact",
                "Conversie Recruiter",
                "+50% Rata de Răspuns la Interviu",
                "10 min",
                "Apasă 'Add profile section' ➔ 'About' ➔ 'Add about'. Copiază textul optimizat generat de asistentul nostru, care îmbină pasiunea inginerească, proiectele practice și adresa de email.",
                "Textul complet din tab-ul 'Despre (About Bio)' din această pagină.",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_5",
                "5",
                "Creează Secțiunea 'În prim-plan' (Featured) cu Proiectele de Top",
                "Dovadă Vizuală",
                "+30% Vizualizări de Profil",
                "5 min",
                "Apasă 'Add profile section' ➔ 'Recommended' ➔ 'Add featured'. Adaugă 1) Link către repozitoriul GitHub ATS Job Tracker, 2) CV-ul tău în format PDF de o pagină.",
                "Link GitHub: https://github.com/sirbumihai/ATS_Job_Tracker + CV.pdf",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_6",
                "6",
                "Adaugă Proiectele Tehnice în Formatul Google XYZ / STAR",
                "Experiență Practică",
                "Substitut #1 pentru lipsa de experiență formală",
                "15 min",
                "Apasă 'Add profile section' ➔ 'Additional' ➔ 'Add projects'. Adaugă proiectele sugerate mai jos, asociindu-le cu facultatea și listând tehnologiile cheie (Java 21, Spring Boot, PostgreSQL, Docker).",
                "Titlu: ATS Job Tracker | Tehnologii: Java, Spring Boot, Docker, pgvector",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_7",
                "7",
                "Completează 25+ Aptitudini Cheie și Fixează Top 3 Pinned Skills",
                "Filtre Automate",
                "17x mai multe apariții în căutări",
                "5 min",
                "Navighează la secțiunea Skills. Adaugă Java, Spring Boot, Docker, Git, REST API, PostgreSQL, OOP, Data Structures. Apasă pe cele trei puncte și alege Reorder pentru a pune Java, Spring Boot și SQL pe primele 3 poziții.",
                "Pinned: 1. Java | 2. Spring Boot | 3. SQL / PostgreSQL",
                true
        ));

        steps.add(new LinkedInActionStepDto(
                "step_8",
                "8",
                "Detaliază Secțiunea Educație (Cursuri Cheie din Facultate)",
                "Validare Academică",
                "Filtru Recruiter pentru Proaspeți Absolvenți",
                "5 min",
                "Editează intrarea de educație de la UPB. Adaugă la secțiunea 'Description' sau 'Associated Skills' cursurile reprezentative: Structuri de Date și Algoritmi, Proiectarea Algoritmilor, Baze de Date, Sisteme de Operare, Inginerie Software.",
                "Relevant Coursework: Data Structures, Algorithms, Relational DBs, OS, OOP",
                false
        ));

        steps.add(new LinkedInActionStepDto(
                "step_9",
                "9",
                "Solicită 2 Recomandări Reciproce de la Colegi / Asistenți",
                "Social Proof",
                "14x Creștere a Credibilității",
                "10 min",
                "Trimite un mesaj unui coleg de la facultate cu care ai făcut un proiect bun: 'Salut, ai dori să ne lăsăm reciproc o recomandare pe LinkedIn despre proiectul de la [Curs]? Te ajută și pe tine foarte mult!'",
                "Scrie recomandări specifice care menționează perseverența, lucrul în echipă și calitatea codului.",
                false
        ));

        steps.add(new LinkedInActionStepDto(
                "step_10",
                "10",
                "Crește Rețeaua Strategic către 500+ Conexiuni",
                "Algoritm de Proximitate",
                "Apariție Garantată pe Pagina 1 de Rezultate",
                "20 min / săpt.",
                "Caută pe LinkedIn: 'UPB Automatica', 'Technical Recruiter Romania', 'Talent Acquisition IT'. Trimite cereri de conectare politicoase cu o notă scurtă.",
                "Notă: 'Salut! Sunt student la Automatica & Calculatoare UPB, pasionat de Java & Backend. Mi-ar plăcea să fim conectați!'",
                false
        ));

        return steps;
    }

    private List<LinkedInProjectDto> generateSuggestedProjects() {
        return List.of(
                new LinkedInProjectDto(
                        "ATS Job Tracker & Recruiter Matching Platform",
                        "Dezvoltat o platformă full-stack completă pentru căutarea și urmărirea inteligentă a joburilor IT din România. Arhitectură modulară cu Spring Boot 3 și Java 21, bază de date PostgreSQL cu extensia pgvector pentru potrivire semantică prin cosine distance, containerizare cu Docker și interfață React reactivă. Sistemul include web crawling concurent (virtual threads) pe BestJobs și LinkedIn, calcul automat al scorului ATS și optimizator de profil.",
                        "februarie 2025 – prezent",
                        "https://github.com/sirbumihai/ATS_Job_Tracker",
                        List.of("Java 21", "Spring Boot 3", "PostgreSQL", "pgvector", "Docker", "React", "REST API", "Tailwind CSS"),
                        "Facultatea de Automatică și Calculatoare, UPB"
                ),
                new LinkedInProjectDto(
                        "Sistem de Gestiune și Optimizare Baze de Date Relaționale",
                        "Conceput și implementat o arhitectură de baze de date normalizată în 3NF pentru operațiuni tranzacționale de mare volum. Implementat indecși avansați B-Tree, proceduri stocate și proceduri de validare a integrității datelor în Microsoft SQL Server, asigurând timp de execuție sub 50ms pentru interogări analitice pe seturi de date mari.",
                        "octombrie 2024 – ianuarie 2025",
                        "https://github.com/sirbumihai",
                        List.of("Microsoft SQL Server", "SQL", "Database Optimization", "Query Tuning", "Data Modeling"),
                        "Universitatea POLITEHNICA din București"
                )
        );
    }

    private List<RecruiterBooleanQueryDto> generateRecruiterBooleanQueries() {
        return List.of(
                new RecruiterBooleanQueryDto(
                        "Junior Java / Backend Developer (București)",
                        "(\"Junior Software Engineer\" OR \"Junior Developer\" OR \"Junior Java\") AND (Java OR \"Spring Boot\") AND (SQL OR PostgreSQL) AND (Bucharest OR Bucuresti OR Romania) NOT (Senior OR Lead OR Manager)",
                        "Interogarea standard folosită de agențiile de recrutare și corporațiile din România pentru a găsi candidați de nivel entry/junior.",
                        "Te potrivești 100% dacă aplici Headline-ul recomandat, adaugi Java și Spring Boot în Pinned Skills și ai locația setată pe București."
                ),
                new RecruiterBooleanQueryDto(
                        "Absolvenți / Studenți UPB Automatică și Calculatoare",
                        "(\"Software Engineer\" OR \"Developer\") AND (\"Automatica si Calculatoare\" OR \"Universitatea Politehnica\" OR \"UPB\") AND (Java OR Python) NOT (Senior OR Principal)",
                        "Recruiterii din companiile de produs (UiPath, Bitdefender, Adobe, CrowdStrike) filtrează adesea direct după universitățile de top din România.",
                        "Profilul tău conține deja Facultatea de Automatică și Calculatoare, UPB în secțiunea Studii."
                ),
                new RecruiterBooleanQueryDto(
                        "Junior Backend cu Cunoștințe de Cloud & Docker",
                        "(\"Backend Engineer\" OR \"Backend Developer\" OR \"Software Developer\") AND (Docker OR Kubernetes OR \"REST API\") AND (Java OR Spring) AND (Entry OR Junior OR Graduate)",
                        "Căutare avansată pentru echipe moderne de microservicii și companii ce caută autonomie tehnică de la debut.",
                        "Adăugarea proiectului ATS Job Tracker și a competențelor Docker și REST API te plasează direct în topul acestei căutări."
                )
        );
    }
}
