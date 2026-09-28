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
                List.of()
        );
    }

    public LinkedInOptimizationResult optimizeProfile(LinkedInOptimizationRequest request) {
        LinkedInProfileDto profile = request.profile() != null ? request.profile() : getDemoProfile();
        String domain = request.targetDomain() != null ? request.targetDomain() : "BACKEND";
        String level = request.targetRoleLevel() != null ? request.targetRoleLevel() : "JUNIOR";

        // 1. Calcul scor profil
        int headlineScore = calculateHeadlineScore(profile.headline());
        int aboutScore = calculateAboutScore(profile.about());
        int skillsScore = calculateSkillsScore(profile.skills());
        int educationScore = profile.education() != null && !profile.education().isEmpty() ? 25 : 10;

        int overallScore = headlineScore + aboutScore + skillsScore + educationScore;
        overallScore = Math.max(15, Math.min(100, overallScore));

        String scoreGrade;
        if (overallScore >= 85) {
            scoreGrade = "All-Star Profile (Optimizat pentru Recruiteri)";
        } else if (overallScore >= 65) {
            scoreGrade = "Profil Bun (Câteva lipsuri cheie)";
        } else if (overallScore >= 45) {
            scoreGrade = "Nivel Mediu (Necesită Completare)";
        } else {
            scoreGrade = "Profil Începător (Vizibilitate Redusă)";
        }

        Map<String, Integer> breakdown = new HashMap<>();
        breakdown.put("Headline & Poziționare", headlineScore);
        breakdown.put("Secțiunea Despre (About)", aboutScore);
        breakdown.put("Aptitudini & Cuvinte Cheie ATS", skillsScore);
        breakdown.put("Educație & Acreditare", educationScore);

        // 2. Gaps & Puncte Tari
        List<String> criticalGaps = new ArrayList<>();
        List<String> strengths = new ArrayList<>();

        if (profile.about() == null || profile.about().isBlank()) {
            criticalGaps.add("Lipsește secțiunea 'About' (Rezumat). Recruiterii citesc rezumatul pentru a evalua motivația și stack-ul tehnic.");
        } else if (profile.about().length() < 150) {
            criticalGaps.add("Secțiunea 'About' este foarte scurtă. Recomandat: 2-3 paragrafe cu storytelling și tehnologii.");
        } else {
            strengths.add("Secțiunea 'About' este completată și oferă context recruiterilor.");
        }

        if (profile.headline() != null && profile.headline().toLowerCase().startsWith("student la")) {
            criticalGaps.add("Headline-ul 'Student la UPB' este generic. Recruiterii caută după rolul vizat și tehnologii (ex: 'Junior Software Engineer | Java').");
        } else {
            strengths.add("Headline-ul include cuvinte cheie specifice.");
        }

        if (profile.skills() == null || profile.skills().size() < 5) {
            criticalGaps.add("Ai doar " + (profile.skills() != null ? profile.skills().size() : 0) + " aptitudini listate. Profilurile cu minimum 5 skills primesc de 17x mai multe vizualizări.");
        } else {
            strengths.add("Ai listat suficiente aptitudini pentru algoritmii LinkedIn Recruiter.");
        }

        if (profile.education() != null && !profile.education().isEmpty()) {
            strengths.add("Educația universitară la UPB Automatică și Calculatoare este un diferențiator tehnic puternic.");
        }

        // 3. Generare Headline-uri optimizate
        List<HeadlineOptionDto> optimizedHeadlines = generateHeadlineOptions(profile, domain);

        // 4. Generare secțiune About optimizată
        String optimizedAbout = generateOptimizedAbout(profile, domain);

        // 5. Aptitudini recomandate conform pieței din România
        List<RecommendedSkillDto> recommendedSkills = generateRecommendedSkills(profile, domain);

        // 6. Sfaturi strategice de recruiter
        List<RecruiterTipDto> recruiterTips = generateRecruiterTips();

        return new LinkedInOptimizationResult(
                overallScore,
                scoreGrade,
                breakdown,
                criticalGaps,
                strengths,
                optimizedHeadlines,
                optimizedAbout,
                recommendedSkills,
                recruiterTips
        );
    }

    private int calculateHeadlineScore(String headline) {
        if (headline == null || headline.isBlank()) return 5;
        String h = headline.toLowerCase();
        if (h.startsWith("student la") || h.equals("student")) return 10;
        int score = 15;
        if (h.contains("|") || h.contains("•") || h.contains("-")) score += 5;
        if (h.contains("engineer") || h.contains("developer") || h.contains("backend") || h.contains("java") || h.contains("python")) score += 5;
        return Math.min(25, score);
    }

    private int calculateAboutScore(String about) {
        if (about == null || about.isBlank()) return 0;
        if (about.length() < 100) return 10;
        if (about.length() < 300) return 18;
        return 25;
    }

    private int calculateSkillsScore(List<String> skills) {
        if (skills == null || skills.isEmpty()) return 5;
        if (skills.size() < 4) return 12;
        if (skills.size() < 7) return 20;
        return 25;
    }

    private List<HeadlineOptionDto> generateHeadlineOptions(LinkedInProfileDto profile, String domain) {
        List<HeadlineOptionDto> list = new ArrayList<>();

        list.add(new HeadlineOptionDto(
                "Formula Recomandată: Rol Vizat + Stack Tehnic + Universitate",
                "Junior Software Engineer | Java & Spring Boot | Student @ UPB Automatica & Calculatoare | Building Scalable Systems",
                "Ideal pentru atragerea recruiterilor de Java/Backend din România. Conține exact termenii căutați în filtrele LinkedIn Recruiter.",
                true
        ));

        list.add(new HeadlineOptionDto(
                "Formula Valoare & Pasiune: Inginerie Software & Algoritmi",
                "Aspiring Backend & AI Engineer | UPB CS Student | Java • Python • SQL | Passionate about Clean Architecture & Distributed Systems",
                "Subliniază versatilitatea tehnică (Backend + AI) și fundamentul academic solid în algoritmi.",
                false
        ));

        list.add(new HeadlineOptionDto(
                "Formula 'Ready for Hire': Deschis la Oportunități Junior & Intern",
                "Computer Science Student @ UPB Automatica | Open to Junior Backend & Software Engineering Roles | Algorithms, DBs & Cloud",
                "Semnalizează direct disponibilitatea imediată pentru roluri de debut și internship-uri tehnice.",
                false
        ));

        list.add(new HeadlineOptionDto(
                "Formula Modern Tech Stack & Tools",
                "Software Developer in the making | UPB Automatica & Calculatoare | Spring Boot • PostgreSQL • Microservices • Docker • Git",
                "Pune accent pe uneltele moderne cerute în pipeline-urile moderne de producție.",
                false
        ));

        return list;
    }

    private String generateOptimizedAbout(LinkedInProfileDto profile, String domain) {
        String name = profile.fullName() != null && !profile.fullName().isBlank() ? profile.fullName() : "Mihai";

        return "Sunt student în cadrul Facultății de Automatică și Calculatoare (Universitatea POLITEHNICA din București), pasionat de inginerie software, arhitecturi backend robuste și rezolvarea de probleme algoritmice complexe.\n\n" +
                "De-a lungul anilor de facultate și prin proiectele tehnice dezvoltate, mi-am consolidat cunoștințele în limbaje de programare precum Java, Python și C++, alături de lucrul intensiv cu baze de date relaționale (SQL, PostgreSQL, Microsoft SQL Server). Îmi place să înțeleg ce se întâmplă 'sub capotă' – de la structuri de date eficiente și algoritmi optimizați până la design curat de API-uri REST și bune practici OOP (SOLID, Clean Code).\n\n" +
                "În prezent, îmi aprofundez cunoștințele în dezvoltarea de microservicii cu Spring Boot, containerizare cu Docker și automatizare CI/CD. Sunt mereu dornic să învăț tehnologii noi și să colaborez într-o echipă dinamică de inginerie software.\n\n" +
                "🎯 Obiectivul meu actual: Caut o oportunitate de Junior Software Engineer sau Internship tehnic unde să pot contribui cu entuziasm și rigoare la produse software cu impact real.\n\n" +
                "📫 Contact: " + (profile.email() != null && !profile.email().isBlank() ? profile.email() : "sarbumihai0@gmail.com") + " | Deschis pentru networking și oportunități profesionale!";
    }

    private List<RecommendedSkillDto> generateRecommendedSkills(LinkedInProfileDto profile, String domain) {
        List<RecommendedSkillDto> list = new ArrayList<>();
        Set<String> currentSkills = new HashSet<>();
        if (profile.skills() != null) {
            for (String s : profile.skills()) currentSkills.add(s.toLowerCase().trim());
        }

        addSkillIfMissing(list, currentSkills, "Java", "Limbaje de Programare", "59.6% din joburile de Backend Junior", "Limbajul de bază cel mai căutat în companiile enterprise și fintech din România.");
        addSkillIfMissing(list, currentSkills, "Spring Boot", "Frameworks & Web", "Standard de industrie Backend", "Framework-ul dominant pentru microservicii și API-uri sigure în Java.");
        addSkillIfMissing(list, currentSkills, "Git & GitHub", "Unelte & Metodologii", "23.8% cerință directă", "Esențial în orice echipă pentru versionare, branching și colaborare pe cod.");
        addSkillIfMissing(list, currentSkills, "Docker", "Cloud & DevOps", "Căutat intens în 2026", "Containerizarea aplicațiilor este o cerință obligatorie chiar și la nivel de debut.");
        addSkillIfMissing(list, currentSkills, "REST API", "Frameworks & Web", "17.6% prezență în cerințe", "Conectarea serviciilor backend cu aplicații web și clienți externi.");
        addSkillIfMissing(list, currentSkills, "OOP & Clean Code", "Unelte & Metodologii", "15.0% frecvență", "Principii fundamentale testate la orice interviu tehnic la companii de top.");
        addSkillIfMissing(list, currentSkills, "PostgreSQL", "Baze de Date", "Bază relațională open-source #1", "Cea mai apreciată bază de date relațională în startup-uri și companii moderne de produs.");
        addSkillIfMissing(list, currentSkills, "Python", "Limbaje de Programare", "11.7% cerință piață", "Excelent pentru scripting, backend rapid și explorare în domeniul AI/Machine Learning.");

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
                        "tip_open_to_work",
                        "Activează 'Open to Work' doar pentru Recruiteri",
                        "Poți semnaliza algoritmilor că ești deschis la oferte fără ca rețeaua sau colegii să vadă badge-ul verde pe poză. Această setare crește rata de contact cu 40%.",
                        "Vizibilitate Maximă",
                        "Setări profil ➔ Open to ➔ Finding a new job ➔ Alege 'Recruiters only'."
                ),
                new RecruiterTipDto(
                        "tip_skills_endorsements",
                        "Atinge pragul critic de minimum 5 Aptitudini cheie",
                        "Filtrele automate LinkedIn Recruiter elimină profilurile fără cuvinte cheie specifice. Profilurile cu 5+ skills primesc de 17x mai multe mesaje directe.",
                        "Algoritm Recruiter",
                        "Adaugă Java, Spring Boot, Git, Docker și SQL în topul listei tale de aptitudini."
                ),
                new RecruiterTipDto(
                        "tip_featured_section",
                        "Adaugă secțiunea 'În prim-plan' (Featured) cu proiecte GitHub",
                        "O secțiune vizuală în care incluzi 2-3 proiecte de pe GitHub cu capturi de ecran și link-uri live demonstrează competența practică înainte de primul interviu.",
                        "Diferențiator Cheie",
                        "Apasă 'Add profile section' ➔ 'Recommended' ➔ 'Add featured' ➔ Link către repo-ul tău GitHub."
                ),
                new RecruiterTipDto(
                        "tip_500_connections",
                        "Construiește rețeaua strategic către pragul de '500+ conexiuni'",
                        "Algoritmul de căutare LinkedIn favorizează candidații de gradul 1 și 2. Pragul de 500+ oferă credibilitate și te aduce în rezultatele căutărilor recruiterilor din București/Cluj.",
                        "Rețea & Social Proof",
                        "Conectează-te cu colegi de facultate, absolvenți UPB și tech recruiters din companiile țintă."
                ),
                new RecruiterTipDto(
                        "tip_clean_url",
                        "Personalizează URL-ul public LinkedIn",
                        "Transformă adresa generată automat 'linkedin.com/in/prenume-nume-86133b181' într-una curată 'linkedin.com/in/sirbu-mihai'. Este mult mai profesională pe CV.",
                        "Branding Personal",
                        "Editează 'Public profile & URL' din colțul dreapta-sus al paginii de LinkedIn."
                )
        );
    }
}
