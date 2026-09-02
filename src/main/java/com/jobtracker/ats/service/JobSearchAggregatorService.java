package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobSearchAggregatorService {

    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CvProfileRepository cvProfileRepository;
    private final ApplicationService applicationService;

    // CATALOG DE JOBURI MULTI-PLATFORMĂ STRUCTURAT PENTRU IT / SOFTWARE ENGINEERING
    private static final List<UnifiedJobListingDto> BASE_JOBS_CATALOG = List.of(
            // --- STAGIIPEBUNE.RO (STAGII DE PRACTICĂ & INTERNSHIPS IT ROMÂNIA) ---
            new UnifiedJobListingDto(
                    "spb-simavi-01",
                    "Java Backend Developer Intern",
                    "SIMAVI (Software Imagination & Vision)",
                    "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "SIMAVI caută Software Engineering Interns pasionați de Java 21, Spring Boot și arhitecturi de microservicii. Vei lucra la dezvoltarea modulelor de tranzacții financiare, optimizarea interogărilor SQL în PostgreSQL și scrierea de teste automate cu JUnit 5 și Mockito.",
                    "3.500 - 4.500 RON / lună",
                    List.of("Java 21", "Spring Boot", "PostgreSQL", "SQL", "Git", "JUnit 5", "Mockito"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    96.5
            ),
            new UnifiedJobListingDto(
                    "spb-bitdefender-02",
                    "Software Security & Backend Intern",
                    "Bitdefender",
                    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Alătură-te echipei Bitdefender Cloud Security! Căutăm studenți talentați pentru dezvoltarea de servicii de analiză a amenințărilor cibernetice folosind Java, C++, Docker și baze de date de înaltă performanță.",
                    "4.000 - 5.500 RON / lună",
                    List.of("Java", "C/C++", "Linux", "Docker", "Algorithms", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    92.0
            ),
            new UnifiedJobListingDto(
                    "spb-uipath-03",
                    "Software Engineering Intern (Automation Cloud)",
                    "UiPath",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "UiPath Automation Cloud Team oferă stagii de vară pentru dezvoltarea de microservicii scalabile în Java / C# și integrare de căutare semantică / AI. Căutăm studenți cu bune cunoștințe de algoritmi și structuri de date.",
                    "5.000 - 6.500 RON / lună",
                    List.of("Java", "REST API", "Microservices", "Docker", "PostgreSQL", "Data Structures"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    94.0
            ),
            new UnifiedJobListingDto(
                    "spb-adobe-04",
                    "Software Engineering Intern (Cloud Platform)",
                    "Adobe Romania",
                    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Adobe Experience Cloud caută stagiari în dezvoltare backend Java și tehnologii Web. Vei contribui la servicii distribuite de mare volum, API-uri REST și pipelines de date.",
                    "5.500 - 7.000 RON / lună",
                    List.of("Java", "Spring Boot", "Distributed Systems", "AWS", "Git", "REST API"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 4 zile",
                    93.5
            ),

            // --- JUNIORS.RO (JUNIOR IT POSITIONS ROMÂNIA) ---
            new UnifiedJobListingDto(
                    "jun-endava-01",
                    "Junior Java Developer",
                    "Endava",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                    "Bucharest / Cluj-Napoca, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "JUNIORS_RO",
                    "https://juniors.ro/jobs",
                    "Endava recrutează Junior Java Developers pentru proiecte internaționale de digital banking și e-commerce. Cerințe: Java 17+, Spring Boot, Hibernate, baze de date relaționale (PostgreSQL/Oracle) și cunoștințe de Git.",
                    "5.000 - 7.000 RON / lună",
                    List.of("Java 17+", "Spring Boot", "Hibernate", "PostgreSQL", "Git", "Agile"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    96.0
            ),
            new UnifiedJobListingDto(
                    "jun-zitec-02",
                    "Junior Backend Developer (Spring Boot)",
                    "Zitec",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "REMOTE",
                    "JUNIOR",
                    "JUNIORS_RO",
                    "https://juniors.ro/jobs",
                    "Zitec caută Junior Backend Developer entuziast pentru dezvoltarea de aplicații web personalizate. Lucru cu Spring Boot 3, REST APIs, PostgreSQL, Docker și servicii cloud. Mediu 100% flexibil și orientat pe dezvoltare profesională.",
                    "4.500 - 6.500 RON / lună",
                    List.of("Spring Boot", "Java", "PostgreSQL", "Docker", "REST API", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    95.0
            ),
            new UnifiedJobListingDto(
                    "jun-tremend-03",
                    "Junior Full-Stack Engineer (Java & React)",
                    "Tremend Software Labs",
                    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "JUNIORS_RO",
                    "https://juniors.ro/jobs",
                    "Tremend (Publicis Sapient) caută Junior Engineers cu abilități full-stack: Java/Spring pe backend și React/TypeScript pe frontend. Vei lucra la soluții enterprise pentru clienți globali de top.",
                    "5.500 - 7.500 RON / lună",
                    List.of("Java", "Spring Boot", "React", "TypeScript", "SQL", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    94.5
            ),

            // --- DIRECT ATS PLATFORMS: GREENHOUSE, ASHBY, LEVER, WORKABLE ---
            new UnifiedJobListingDto(
                    "gh-stripe-01",
                    "Software Engineer - Backend Infrastructure",
                    "Stripe (Direct Careers)",
                    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
                    "Remote / Europe",
                    "REMOTE",
                    "JUNIOR",
                    "GREENHOUSE",
                    "https://boards.greenhouse.io/stripe",
                    "Stripe is hiring Backend Infrastructure Engineers to build the economic infrastructure of the internet. Requirements: Strong foundations in Java, Go, or distributed systems, API design, high-concurrency architectures, and relational databases under heavy load.",
                    "€45,000 - €65,000 / an",
                    List.of("Java", "Distributed Systems", "SQL", "REST API", "Docker", "Kubernetes", "Concurrency"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    93.0
            ),
            new UnifiedJobListingDto(
                    "gh-databricks-02",
                    "Software Engineer - Core Backend & Data Platforms",
                    "Databricks (Direct Careers)",
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&auto=format&fit=crop&q=80",
                    "Remote / Europe",
                    "REMOTE",
                    "JUNIOR",
                    "GREENHOUSE",
                    "https://boards.greenhouse.io/databricks",
                    "Databricks builds the Lakehouse Platform. Join our backend platform team working with Java, Scala, and cloud distributed data processing engines. You will work on query optimization, caching layers, and high-performance RPC services.",
                    "€50,000 - €70,000 / an",
                    List.of("Java", "Distributed Systems", "PostgreSQL", "Algorithms", "Docker", "Cloud"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    92.5
            ),
            new UnifiedJobListingDto(
                    "ash-linear-01",
                    "Product & Backend Software Engineer",
                    "Linear (Direct Careers)",
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
                    "Remote Global",
                    "REMOTE",
                    "MID",
                    "ASHBY",
                    "https://jobs.ashbyhq.com/linear",
                    "Linear is building the future of software development tracking tools. We focus on craft, speed, and real-time WebSocket synchronization with high-performance TypeScript and backend relational databases.",
                    "$80,000 - $110,000 / an",
                    List.of("TypeScript", "React", "Node.js", "WebSocket", "PostgreSQL", "REST API"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    89.0
            ),
            new UnifiedJobListingDto(
                    "lev-spotify-01",
                    "Backend Engineer - Payments & Subscriptions",
                    "Spotify (Direct Careers)",
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80",
                    "Remote / Stockholm / London",
                    "REMOTE",
                    "JUNIOR",
                    "LEVER",
                    "https://jobs.lever.co/spotify",
                    "Join Spotify's Payments & Subscriptions platform tribe. We write scalable Java microservices, deploy on GCP using Docker and Kubernetes, and process millions of audio streaming transactions every day.",
                    "€55,000 - €75,000 / an",
                    List.of("Java", "Spring Boot", "Microservices", "GCP", "Docker", "PostgreSQL", "JUnit"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    95.5
            ),

            // --- LINKEDIN & WELLFOUND & INDEED ---
            new UnifiedJobListingDto(
                    "li-google-01",
                    "Junior Software Engineer (Cloud & Systems)",
                    "Google",
                    "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "LINKEDIN",
                    "https://www.linkedin.com/jobs/search/?keywords=Junior+Software+Engineer+Google+Bucharest",
                    "Google Bucharest is looking for Software Engineers to join our Google Cloud and Fitbit engineering teams. Solid knowledge of Java, C++, or Python, data structures, algorithms, and distributed systems is required.",
                    "10.000 - 15.000 RON / lună",
                    List.of("Java", "C/C++", "Python", "Data Structures", "Algorithms", "Distributed Systems"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    94.0
            ),
            new UnifiedJobListingDto(
                    "wf-startup-01",
                    "Full-Stack Java & React Developer",
                    "FinTech AI ScaleUp",
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80",
                    "Remote / Bucharest",
                    "REMOTE",
                    "JUNIOR",
                    "WELLFOUND",
                    "https://wellfound.com/jobs",
                    "Fast-growing European FinTech startup building an AI-powered automated career & financial analytics platform. Tech stack: Java 21, Spring Boot 3.3, PostgreSQL pgvector, Next.js, and Docker.",
                    "€2,500 - €3,800 / lună",
                    List.of("Java 21", "Spring Boot", "PostgreSQL", "pgvector", "React", "Docker", "Next.js"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    98.0
            ),
            new UnifiedJobListingDto(
                    "ind-amazon-01",
                    "Software Development Engineer I (SDE I)",
                    "Amazon Development Center Romania",
                    "https://images.unsplash.com/photo-1523474253243-231a473859d0?w=100&auto=format&fit=crop&q=80",
                    "Bucharest / Iasi, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "INDEED",
                    "https://ro.indeed.com/jobs?q=Software+Development+Engineer+Amazon",
                    "Amazon Romania is hiring SDE I engineers to work on AWS services and retail technologies. Key technologies: Object-Oriented Design (Java), scalable distributed architectures, relational databases, and automated testing.",
                    "8.500 - 12.000 RON / lună",
                    List.of("Java", "AWS", "OOP", "Data Structures", "Git", "SQL", "Unit Testing"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    93.0
            ),

            // --- EJOBS, HIPO & BESTJOBS (ROMÂNIA) ---
            new UnifiedJobListingDto(
                    "ej-cegeka-01",
                    "Java Software Engineer",
                    "Cegeka Tech",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "EJOBS",
                    "https://www.ejobs.ro/",
                    "Cegeka Tech recrutează Java Software Engineer pentru dezvoltarea de aplicații bancare și microservicii cloud. Tech stack: Java 17+, Spring Boot, SQL/PostgreSQL, Git, Docker și metodologie Agile/Scrum.",
                    "6.000 - 8.500 RON / lună",
                    List.of("Java 17+", "Spring Boot", "SQL", "PostgreSQL", "Git", "Docker", "Agile"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    97.5
            ),
            new UnifiedJobListingDto(
                    "hipo-ing-01",
                    "Java Tech Trainee / Junior Developer",
                    "ING Hubs Romania",
                    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "HIPO",
                    "https://www.hipo.ro/",
                    "ING Hubs Romania lansează programul de Trainee & Junior Developer în Java și Spring Boot. Oferim training intensiv în tehnologii de microservicii, securitate bancară și CI/CD pipelines.",
                    "4.500 - 6.000 RON / lună",
                    List.of("Java", "Spring Boot", "SQL", "REST API", "Git", "Clean Code"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    95.0
            ),
            new UnifiedJobListingDto(
                    "bj-vodafone-01",
                    "Junior Cloud & Backend Engineer",
                    "Vodafone Shared Services",
                    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "REMOTE",
                    "JUNIOR",
                    "BESTJOBS",
                    "https://www.bestjobs.eu/",
                    "Vodafone caută tineri dezvoltatori software pentru echipa de Cloud & Backend Services. Lucru cu Java, Spring, microservicii containerizate în Docker și baze de date SQL.",
                    "5.000 - 7.000 RON / lună",
                    List.of("Java", "Spring", "Docker", "SQL", "REST API", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    94.0
            )
    );

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level
    ) {
        // Preluare text CV candidat pentru calculul dinamic de ATS Match
        String cvText = getCandidateCvText(userId);
        String cvLower = cvText.toLowerCase();

        String kwLower = (keyword != null && !keyword.isBlank()) ? keyword.toLowerCase().trim() : "";
        String locLower = (location != null && !location.isBlank()) ? location.toLowerCase().trim() : "";
        String platUpper = (platform != null && !platform.isBlank()) ? platform.toUpperCase().trim() : "ALL";
        String lvlUpper = (level != null && !level.isBlank()) ? level.toUpperCase().trim() : "ALL";

        List<UnifiedJobListingDto> results = new ArrayList<>();

        for (UnifiedJobListingDto job : BASE_JOBS_CATALOG) {
            // 1. Filtrare Keyword
            if (!kwLower.isEmpty()) {
                boolean matchKw = job.jobTitle().toLowerCase().contains(kwLower) ||
                        job.companyName().toLowerCase().contains(kwLower) ||
                        job.rawDescription().toLowerCase().contains(kwLower) ||
                        job.skillsRequired().stream().anyMatch(s -> s.toLowerCase().contains(kwLower));
                if (!matchKw) continue;
            }

            // 2. Filtrare Locatie
            if (!locLower.isEmpty()) {
                boolean matchLoc = job.location().toLowerCase().contains(locLower) ||
                        job.workModel().toLowerCase().contains(locLower);
                if (!matchLoc) continue;
            }

            // 3. Filtrare Platforma
            if (!platUpper.equals("ALL")) {
                if (platUpper.equals("DIRECT_ATS")) {
                    if (!List.of("GREENHOUSE", "ASHBY", "LEVER", "WORKABLE").contains(job.sourcePlatform())) {
                        continue;
                    }
                } else if (!job.sourcePlatform().equals(platUpper)) {
                    continue;
                }
            }

            // 4. Filtrare Nivel Experienta
            if (!lvlUpper.equals("ALL")) {
                if (!job.experienceLevel().equals(lvlUpper)) {
                    continue;
                }
            }

            // 5. Calcul Dinamic al Scorului ATS & Identificare Skill-uri Match / Missing
            List<String> matching = new ArrayList<>();
            List<String> missing = new ArrayList<>();

            for (String skill : job.skillsRequired()) {
                String sLower = skill.toLowerCase();
                if (cvLower.contains(sLower) || 
                    (sLower.contains("java") && cvLower.contains("java")) ||
                    (sLower.contains("spring") && cvLower.contains("spring")) ||
                    (sLower.contains("sql") && (cvLower.contains("sql") || cvLower.contains("postgres"))) ||
                    (sLower.contains("docker") && cvLower.contains("docker")) ||
                    (sLower.contains("git") && cvLower.contains("git")) ||
                    (sLower.contains("react") && cvLower.contains("react"))) {
                    matching.add(skill);
                } else {
                    missing.add(skill);
                }
            }

            double calculatedMatchScore;
            if (job.skillsRequired().isEmpty()) {
                calculatedMatchScore = 90.0;
            } else {
                double matchRatio = (double) matching.size() / job.skillsRequired().size();
                calculatedMatchScore = 75.0 + (matchRatio * 24.0); // 75% - 99%
            }
            calculatedMatchScore = Math.min(99.0, Math.max(60.0, Math.round(calculatedMatchScore * 10.0) / 10.0));

            results.add(new UnifiedJobListingDto(
                    job.id(),
                    job.jobTitle(),
                    job.companyName(),
                    job.companyLogoUrl(),
                    job.location(),
                    job.workModel(),
                    job.experienceLevel(),
                    job.sourcePlatform(),
                    job.directApplyUrl(),
                    job.rawDescription(),
                    job.salaryRange(),
                    job.skillsRequired(),
                    matching,
                    missing,
                    job.postedDateAgo(),
                    calculatedMatchScore
            ));
        }

        // Sorteaza dupa cel mai mare scor de potrivire ATS
        results.sort((a, b) -> Double.compare(b.atsMatchScore(), a.atsMatchScore()));

        return results;
    }

    /**
     * 1-CLICK SAVE TO KANBAN & AUTO-TRACKING
     */
    @Transactional
    public ApplicationResponse saveJobToKanban(UUID userId, UnifiedJobListingDto jobDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit."));

        // Salveaza sau gaseste JobPosting
        JobPosting jobPosting = JobPosting.builder()
                .user(user)
                .jobTitle(jobDto.jobTitle())
                .companyName(jobDto.companyName())
                .jobUrl(jobDto.directApplyUrl())
                .rawDescription(jobDto.rawDescription())
                .build();

        JobPosting savedJob = jobPostingRepository.save(jobPosting);

        // Gaseste CV-ul principal al candidatului
        Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));

        BigDecimal score = BigDecimal.valueOf(jobDto.atsMatchScore() > 0 ? jobDto.atsMatchScore() : 94.5)
                .setScale(1, RoundingMode.HALF_UP);

        Application application = Application.builder()
                .user(user)
                .jobPosting(savedJob)
                .cvProfile(primaryCv.orElse(null))
                .status(ApplicationStatus.SAVED)
                .semanticMatchScore(score)
                .notes("Salvat din motorul de cautare Job Discovery (Sursa: " + jobDto.sourcePlatform() + ")")
                .appliedDate(LocalDate.now())
                .build();

        Application savedApp = applicationRepository.save(application);
        log.info("[JOB AGGREGATOR] Jobul {} la {} a fost salvat in Kanban pentru utilizatorul {}",
                jobDto.jobTitle(), jobDto.companyName(), userId);

        return new ApplicationResponse(
                savedApp.getId(),
                user.getId(),
                savedJob.getId(),
                savedJob.getCompanyName(),
                savedJob.getJobTitle(),
                null,
                null,
                primaryCv.map(CvProfile::getId).orElse(null),
                primaryCv.map(CvProfile::getTitle).orElse(null),
                savedApp.getStatus(),
                savedApp.getSemanticMatchScore(),
                savedApp.getNotes(),
                savedApp.getAppliedDate(),
                savedApp.getCreatedAt()
        );
    }

    private String getCandidateCvText(UUID userId) {
        if (userId != null) {
            Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                    .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));
            if (primaryCv.isPresent()) {
                return applicationService.buildCvProfileText(primaryCv.get());
            }
        }
        return """
            Sîrbu Mihai-Alexandru
            Java Backend Developer
            Java 21, Spring Boot 3.3, PostgreSQL, pgvector, Docker, Git, JUnit 5, Mockito, REST APIs, Microservices, React
            """;
    }
}
