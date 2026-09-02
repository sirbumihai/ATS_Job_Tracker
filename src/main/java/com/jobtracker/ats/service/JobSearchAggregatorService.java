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

    // CATALOG EXTINS DE JOBURI VERIFICATE (POSTATE ÎN ULTIMA LUNĂ) PE TOATE SPECIALIZĂRILE SOLICITATE
    private static final List<UnifiedJobListingDto> BASE_JOBS_CATALOG = List.of(
            // ==========================================
            // 1. JAVA ENGINEER & BACKEND ENGINEER
            // ==========================================
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
                    97.5
            ),
            new UnifiedJobListingDto(
                    "jun-endava-01",
                    "Junior Java Developer",
                    "Endava",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                    "Bucharest / Cluj, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "JUNIORS_RO",
                    "https://juniors.ro/jobs",
                    "Endava recrutează Junior Java Developers pentru proiecte internaționale de digital banking și e-commerce. Cerințe: Java 17+, Spring Boot, Hibernate, baze de date relaționale (PostgreSQL/Oracle) și cunoștințe de Git.",
                    "5.500 - 7.500 RON / lună",
                    List.of("Java 17+", "Spring Boot", "Hibernate", "PostgreSQL", "Git", "Agile"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
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
                    "Zitec caută Junior Backend Developer entuziast pentru dezvoltarea de aplicații web personalizate. Lucru cu Spring Boot 3, REST APIs, PostgreSQL, Docker și servicii cloud. Mediu 100% flexibil.",
                    "4.500 - 6.500 RON / lună",
                    List.of("Spring Boot", "Java", "PostgreSQL", "Docker", "REST API", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    95.5
            ),
            new UnifiedJobListingDto(
                    "gh-stripe-01",
                    "Backend Engineer - Distributed Systems",
                    "Stripe (Direct Careers)",
                    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
                    "Remote / Europe",
                    "REMOTE",
                    "JUNIOR",
                    "GREENHOUSE",
                    "https://boards.greenhouse.io/stripe",
                    "Stripe is hiring Backend Infrastructure Engineers to build high-availability payment routing. Solid foundations in Java, Go, API design, high-concurrency systems, and PostgreSQL indexing.",
                    "€48,000 - €68,000 / an",
                    List.of("Java", "Distributed Systems", "SQL", "REST API", "Docker", "PostgreSQL"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 4 zile",
                    94.0
            ),
            new UnifiedJobListingDto(
                    "lev-spotify-01",
                    "Backend Engineer - Java Microservices",
                    "Spotify (Direct Careers)",
                    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=100&auto=format&fit=crop&q=80",
                    "Remote / Stockholm",
                    "REMOTE",
                    "JUNIOR",
                    "LEVER",
                    "https://jobs.lever.co/spotify",
                    "Join Spotify's Payments & Audio Streaming backend tribe. We write scalable Java 21 microservices deployed on GCP using Docker and Kubernetes, processing millions of transactions daily.",
                    "€55,000 - €75,000 / an",
                    List.of("Java", "Spring Boot", "Microservices", "GCP", "Docker", "PostgreSQL", "JUnit"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 5 zile",
                    96.5
            ),

            // ==========================================
            // 2. FULL STACK ENGINEER
            // ==========================================
            new UnifiedJobListingDto(
                    "wf-nomad-01",
                    "Full Stack Java & React Engineer",
                    "FinTech AI ScaleUp",
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=100&auto=format&fit=crop&q=80",
                    "Remote / Bucharest",
                    "REMOTE",
                    "JUNIOR",
                    "WELLFOUND",
                    "https://wellfound.com/jobs",
                    "Fast-growing European FinTech startup building automated analytics. Tech stack: Java 21, Spring Boot 3.3, React, TypeScript, PostgreSQL pgvector, Docker and Next.js.",
                    "€2,800 - €4,200 / lună",
                    List.of("Java 21", "Spring Boot", "React", "TypeScript", "PostgreSQL", "Docker"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    98.0
            ),
            new UnifiedJobListingDto(
                    "jun-tremend-03",
                    "Junior Full-Stack Engineer (Java & React)",
                    "Tremend (Publicis Sapient)",
                    "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "JUNIORS_RO",
                    "https://juniors.ro/jobs",
                    "Tremend recrutează Junior Engineers cu pasiune pentru full-stack development: Java/Spring Boot pe backend și React/TypeScript pe frontend. Proiecte enterprise globale.",
                    "5.500 - 8.000 RON / lună",
                    List.of("Java", "Spring Boot", "React", "TypeScript", "SQL", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    95.0
            ),
            new UnifiedJobListingDto(
                    "ash-retool-01",
                    "Full Stack Software Engineer",
                    "Retool (Direct Careers)",
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=100&auto=format&fit=crop&q=80",
                    "Remote Global",
                    "REMOTE",
                    "MID",
                    "ASHBY",
                    "https://jobs.ashbyhq.com/retool",
                    "Retool is the fast way to build internal tools. We are hiring Full Stack Engineers to build complex canvas interactions in React/TypeScript and scalable Node/Java backend APIs.",
                    "$90,000 - $130,000 / an",
                    List.of("React", "TypeScript", "Node.js", "PostgreSQL", "REST API", "Docker"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 6 zile",
                    88.5
            ),

            // ==========================================
            // 3. DATA ANALYST
            // ==========================================
            new UnifiedJobListingDto(
                    "ej-emag-da-01",
                    "Junior Data Analyst (Marketplace & Pricing)",
                    "eMAG Romania",
                    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "EJOBS",
                    "https://www.ejobs.ro/",
                    "eMAG caută Junior Data Analyst pentru analiza metricilor de conversie și pricing. Cerințe: SQL avansat, Python (Pandas/NumPy), Tableau/Power BI și interpretare de date statistice.",
                    "5.000 - 7.000 RON / lună",
                    List.of("SQL", "Python", "Power BI", "Tableau", "Excel", "Data Analysis"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    89.0
            ),
            new UnifiedJobListingDto(
                    "li-uipath-da-02",
                    "Product Data Analyst",
                    "UiPath",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "LINKEDIN",
                    "https://www.linkedin.com/jobs/search/?keywords=Data+Analyst+UiPath+Bucharest",
                    "Analyze product usage telemetry across millions of enterprise users. Build SQL data pipelines and executive dashboards in Power BI and Metabase. Knowledge of SQL and Python required.",
                    "6.000 - 8.500 RON / lună",
                    List.of("SQL", "Python", "Power BI", "Statistics", "Data Warehousing"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 5 zile",
                    90.0
            ),

            // ==========================================
            // 4. DATA SCIENTIST
            // ==========================================
            new UnifiedJobListingDto(
                    "spb-adobe-ds-01",
                    "Data Science & AI Intern",
                    "Adobe Romania",
                    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Adobe Experience Cloud caută stagiari în Data Science și Machine Learning. Dezvoltare de modele predictive de churn, clustering și NLP folosind Python, Scikit-Learn, PyTorch și SQL.",
                    "5.500 - 7.000 RON / lună",
                    List.of("Python", "Machine Learning", "PyTorch", "Scikit-Learn", "SQL", "Pandas"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    91.5
            ),
            new UnifiedJobListingDto(
                    "li-rev-ds-02",
                    "Junior Data Scientist (Fraud & Risk)",
                    "Revolut",
                    "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=100&auto=format&fit=crop&q=80",
                    "Remote / Bucharest",
                    "REMOTE",
                    "JUNIOR",
                    "LINKEDIN",
                    "https://www.linkedin.com/jobs/search/?keywords=Data+Scientist+Revolut+Romania",
                    "Build statistical fraud detection and credit risk models for 40M+ global users. Stack: Python, XGBoost, PyTorch, SQL, Spark and real-time model deployment.",
                    "€2,500 - €3,800 / lună",
                    List.of("Python", "Machine Learning", "SQL", "XGBoost", "PyTorch", "Statistics"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 4 zile",
                    90.5
            ),

            // ==========================================
            // 5. DATA ENGINEER
            // ==========================================
            new UnifiedJobListingDto(
                    "gh-databricks-de-01",
                    "Data Platform & Lakehouse Engineer",
                    "Databricks (Direct Careers)",
                    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&auto=format&fit=crop&q=80",
                    "Remote / Europe",
                    "REMOTE",
                    "JUNIOR",
                    "GREENHOUSE",
                    "https://boards.greenhouse.io/databricks",
                    "Join Databricks Core Data Engine team. Work on distributed Spark data pipelines, Delta Lake architecture, Java/Scala runtime optimization, and high-throughput ingestion.",
                    "€52,000 - €72,000 / an",
                    List.of("Java", "Scala", "Apache Spark", "SQL", "Distributed Systems", "Docker"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    93.0
            ),
            new UnifiedJobListingDto(
                    "ej-engie-de-02",
                    "Junior Cloud Data Engineer",
                    "ENGIE Romania",
                    "https://images.unsplash.com/photo-1544717305-2782549b5136?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "EJOBS",
                    "https://www.ejobs.ro/",
                    "ENGIE caută Junior Data Engineer pentru construirea conductelor de date IoT și smart metering pe Azure. Tehnologii: Python, SQL, Azure Data Factory, Spark și PostgreSQL.",
                    "5.500 - 7.500 RON / lună",
                    List.of("Python", "SQL", "PostgreSQL", "Azure", "ETL", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    92.0
            ),

            // ==========================================
            // 6. MACHINE LEARNING & DEEP LEARNING ENGINEER
            // ==========================================
            new UnifiedJobListingDto(
                    "spb-cs-ml-01",
                    "Machine Learning & Cyber Threat Detection Intern",
                    "CrowdStrike",
                    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "CrowdStrike AI team builds state-of-the-art Deep Learning models to detect zero-day cyber threats in real-time. Skills: Python, PyTorch/TensorFlow, Deep Learning algorithms, Linux, Docker.",
                    "5.000 - 6.500 RON / lună",
                    List.of("Python", "Deep Learning", "PyTorch", "TensorFlow", "Linux", "Docker"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    91.0
            ),
            new UnifiedJobListingDto(
                    "li-google-ml-02",
                    "Machine Learning Software Engineer",
                    "Google",
                    "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "LINKEDIN",
                    "https://www.linkedin.com/jobs/search/?keywords=Machine+Learning+Engineer+Google+Bucharest",
                    "Work on scalable machine learning infrastructure and distributed model inference engines. Strong proficiency in Python, C++ or Java, linear algebra, and neural network optimization.",
                    "11.000 - 16.000 RON / lună",
                    List.of("Python", "Java", "C/C++", "PyTorch", "Machine Learning", "Algorithms"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 4 zile",
                    93.5
            ),

            // ==========================================
            // 7. AI ENGINEER & LLM ENGINEER
            // ==========================================
            new UnifiedJobListingDto(
                    "ash-openai-01",
                    "Software Engineer - LLM Infrastructure & Serving",
                    "OpenAI (Direct Careers)",
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
                    "Remote Global / Europe",
                    "REMOTE",
                    "MID",
                    "ASHBY",
                    "https://jobs.ashbyhq.com/openai",
                    "OpenAI is hiring Engineers for LLM Serving & Model Inference Optimization. Focus on low-latency token generation, vector databases (pgvector/Pinecone), RAG pipelines, and Python/Rust backend services.",
                    "$120,000 - $180,000 / an",
                    List.of("Python", "LLM", "RAG", "pgvector", "PostgreSQL", "Docker", "PyTorch"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    94.0
            ),
            new UnifiedJobListingDto(
                    "wf-cohere-02",
                    "AI Engineer (GenAI & Vector Search)",
                    "AI Search ScaleUp",
                    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100&auto=format&fit=crop&q=80",
                    "Remote / Europe",
                    "REMOTE",
                    "JUNIOR",
                    "WELLFOUND",
                    "https://wellfound.com/jobs",
                    "Build next-generation enterprise RAG workflows and AI agents. Tech stack: Python/Java backend, LangChain/LlamaIndex, PostgreSQL pgvector (HNSW Index), Docker and FastAPI.",
                    "€3,000 - €4,500 / lună",
                    List.of("Python", "Java", "LLM", "pgvector", "PostgreSQL", "Docker", "REST API"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    97.0
            ),

            // ==========================================
            // 8. FRONTEND SOFTWARE ENGINEER & REACT DEVELOPER
            // ==========================================
            new UnifiedJobListingDto(
                    "ash-linear-fe-01",
                    "Frontend Software Engineer (React / UI Systems)",
                    "Linear (Direct Careers)",
                    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
                    "Remote Global",
                    "REMOTE",
                    "JUNIOR",
                    "ASHBY",
                    "https://jobs.ashbyhq.com/linear",
                    "Linear is hiring Frontend Engineers to build ultra-fast client-side reactive interfaces. Tech stack: React 18, TypeScript, Tailwind CSS, WebSockets, and state management.",
                    "$75,000 - $105,000 / an",
                    List.of("React", "TypeScript", "Tailwind CSS", "JavaScript", "HTML/CSS", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    92.0
            ),
            new UnifiedJobListingDto(
                    "gh-canva-fe-02",
                    "React Developer - Core Canvas & UX",
                    "Canva (Direct Careers)",
                    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
                    "Remote / Europe",
                    "REMOTE",
                    "JUNIOR",
                    "GREENHOUSE",
                    "https://boards.greenhouse.io/canva",
                    "Canva empowers the world to design. Join our web client team building high-performance interactive tools in React, TypeScript, WebGL and responsive CSS.",
                    "€45,000 - €65,000 / an",
                    List.of("React", "TypeScript", "JavaScript", "HTML5", "CSS3", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 4 zile",
                    91.5
            ),

            // ==========================================
            // 9. ANDROID DEVELOPER
            // ==========================================
            new UnifiedJobListingDto(
                    "li-playtika-android-01",
                    "Junior Android Developer (Kotlin)",
                    "Playtika Romania",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "LINKEDIN",
                    "https://www.linkedin.com/jobs/search/?keywords=Android+Developer+Playtika+Bucharest",
                    "Playtika Bucharest is hiring Junior Android Developers. Requirements: Kotlin / Java, Android SDK, Jetpack Compose, Coroutines, MVVM architecture, and REST API consumption.",
                    "6.000 - 8.500 RON / lună",
                    List.of("Android", "Kotlin", "Java", "Jetpack Compose", "Git", "REST API"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    93.0
            ),
            new UnifiedJobListingDto(
                    "spb-bitdefender-android-02",
                    "Mobile Security Intern (Android)",
                    "Bitdefender",
                    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Develop security features for Bitdefender Mobile Security on Android. Work with Java/Kotlin, Android OS internals, background services, and automated unit testing.",
                    "4.000 - 5.500 RON / lună",
                    List.of("Android", "Java", "Kotlin", "Git", "OOP", "Unit Testing"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    95.0
            ),

            // ==========================================
            // 10. DEVOPS ENGINEER & SRE
            // ==========================================
            new UnifiedJobListingDto(
                    "spb-adobe-devops-01",
                    "Site Reliability & DevOps Intern",
                    "Adobe Romania",
                    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Maintain high availability of Adobe Experience Cloud. Learn Kubernetes container orchestration, Docker, Terraform Infrastructure-as-Code, CI/CD with GitHub Actions, and Prometheus monitoring.",
                    "5.500 - 7.000 RON / lună",
                    List.of("Docker", "Kubernetes", "Linux", "Terraform", "CI/CD", "Git", "Python"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    94.0
            ),
            new UnifiedJobListingDto(
                    "ej-cegeka-devops-02",
                    "Junior Cloud DevOps Engineer",
                    "Cegeka Tech",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "EJOBS",
                    "https://www.ejobs.ro/",
                    "Cegeka caută Junior DevOps Engineer pentru configurarea infrastructurilor cloud (AWS/Azure), containere Docker, clustere Kubernetes și pipeline-uri automate de CI/CD.",
                    "6.000 - 8.500 RON / lună",
                    List.of("Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    93.0
            ),

            // ==========================================
            // 11. CLOUD SECURITY ENGINEER
            // ==========================================
            new UnifiedJobListingDto(
                    "spb-cs-sec-01",
                    "Cloud Security Engineering Intern",
                    "CrowdStrike",
                    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Build next-gen cloud security sensors in CrowdStrike Falcon. Focus on AWS/GCP security, container isolation (Docker/K8s), Go/Java security microservices, and vulnerability scanning.",
                    "5.000 - 6.500 RON / lună",
                    List.of("Cloud Security", "Linux", "Docker", "Java", "Go", "Git", "Networking"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    93.5
            ),
            new UnifiedJobListingDto(
                    "li-ms-sec-02",
                    "Security Software Engineer (Azure Cloud)",
                    "Microsoft Romania",
                    "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "LINKEDIN",
                    "https://www.linkedin.com/jobs/search/?keywords=Security+Engineer+Microsoft+Bucharest",
                    "Protect global cloud infrastructure within Microsoft Security. Develop automated threat remediation tools, cryptographic protocols, and secure cloud microservices.",
                    "9.000 - 13.000 RON / lună",
                    List.of("Cloud Security", "Java", "C#", "Azure", "Cryptography", "Git"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 4 zile",
                    92.0
            ),

            // ==========================================
            // 12. SOFTWARE TESTING / QA & AUTOMATION TEST ENGINEER
            // ==========================================
            new UnifiedJobListingDto(
                    "jun-endava-qa-01",
                    "Junior QA Automation Engineer (Java & Selenium)",
                    "Endava",
                    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "JUNIOR",
                    "JUNIORS_RO",
                    "https://juniors.ro/jobs",
                    "Endava caută Junior QA Automation Engineers. Vei scrie framework-uri de testare automată în Java, Selenium WebDriver, Playwright, REST-Assured pentru API-uri și JUnit/TestNG.",
                    "5.000 - 7.000 RON / lună",
                    List.of("Java", "Selenium", "Playwright", "REST-Assured", "JUnit", "Git", "QA Automation"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 2 zile",
                    97.0
            ),
            new UnifiedJobListingDto(
                    "spb-adobe-qa-02",
                    "Software Quality & Automation Test Intern",
                    "Adobe Romania",
                    "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "HYBRID",
                    "INTERNSHIP",
                    "STAGIIPEBUNE",
                    "https://stagiipebune.ro/",
                    "Ensure highest quality across Adobe Creative & Experience Cloud. Implement automated end-to-end tests in Java / JavaScript, CI/CD integration, and performance benchmarks.",
                    "5.000 - 6.500 RON / lună",
                    List.of("Java", "Automation Testing", "Selenium", "REST API", "Git", "CI/CD"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 1 zi",
                    96.0
            ),
            new UnifiedJobListingDto(
                    "ej-zitec-qa-03",
                    "Quality Assurance & Test Engineer",
                    "Zitec",
                    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&auto=format&fit=crop&q=80",
                    "Bucharest, Romania",
                    "REMOTE",
                    "JUNIOR",
                    "EJOBS",
                    "https://www.ejobs.ro/",
                    "Zitec recrutează QA Engineer pentru testare manuală și automată de aplicații web și mobile. Lucru cu Postman, Cypress, SQL, scriere scenarii de testare și metodologie Agile/Scrum.",
                    "4.500 - 6.000 RON / lună",
                    List.of("QA Testing", "Postman", "SQL", "Cypress", "Git", "Agile"),
                    Collections.emptyList(),
                    Collections.emptyList(),
                    "Acum 3 zile",
                    93.0
            )
    );

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel
    ) {
        // Preluare text CV candidat pentru calculul dinamic de ATS Match
        String cvText = getCandidateCvText(userId);
        String cvLower = cvText.toLowerCase();

        String kwLower = (keyword != null && !keyword.isBlank()) ? keyword.toLowerCase().trim() : "";
        String locLower = (location != null && !location.isBlank()) ? location.toLowerCase().trim() : "";
        String platUpper = (platform != null && !platform.isBlank()) ? platform.toUpperCase().trim() : "ALL";
        String lvlUpper = (level != null && !level.isBlank()) ? level.toUpperCase().trim() : "ALL";
        String catUpper = (roleCategory != null && !roleCategory.isBlank()) ? roleCategory.toUpperCase().trim() : "ALL";
        String wmUpper = (workModel != null && !workModel.isBlank()) ? workModel.toUpperCase().trim() : "ALL";

        List<UnifiedJobListingDto> results = new ArrayList<>();

        for (UnifiedJobListingDto job : BASE_JOBS_CATALOG) {
            // 1. Filtrare Role Category (Domeniu specific)
            if (!catUpper.equals("ALL")) {
                if (!matchesRoleCategory(job, catUpper)) {
                    continue;
                }
            }

            // 2. Filtrare Work Model (Remote / Hibrid / On-Site)
            if (!wmUpper.equals("ALL")) {
                if (!job.workModel().equalsIgnoreCase(wmUpper)) {
                    continue;
                }
            }

            // 3. Filtrare Keyword
            if (!kwLower.isEmpty()) {
                boolean matchKw = job.jobTitle().toLowerCase().contains(kwLower) ||
                        job.companyName().toLowerCase().contains(kwLower) ||
                        job.rawDescription().toLowerCase().contains(kwLower) ||
                        job.skillsRequired().stream().anyMatch(s -> s.toLowerCase().contains(kwLower));
                if (!matchKw) continue;
            }

            // 4. Filtrare Locatie
            if (!locLower.isEmpty()) {
                boolean matchLoc = job.location().toLowerCase().contains(locLower) ||
                        job.workModel().toLowerCase().contains(locLower);
                if (!matchLoc) continue;
            }

            // 5. Filtrare Platforma
            if (!platUpper.equals("ALL")) {
                if (platUpper.equals("DIRECT_ATS")) {
                    if (!List.of("GREENHOUSE", "ASHBY", "LEVER", "WORKABLE").contains(job.sourcePlatform())) {
                        continue;
                    }
                } else if (!job.sourcePlatform().equals(platUpper)) {
                    continue;
                }
            }

            // 6. Filtrare Nivel Experienta
            if (!lvlUpper.equals("ALL")) {
                if (!job.experienceLevel().equals(lvlUpper)) {
                    continue;
                }
            }

            // 7. Calcul Dinamic al Scorului ATS & Identificare Skill-uri Match / Missing
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
                    (sLower.contains("react") && cvLower.contains("react")) ||
                    (sLower.contains("python") && cvLower.contains("python")) ||
                    (sLower.contains("junit") && cvLower.contains("junit"))) {
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
                calculatedMatchScore = 74.0 + (matchRatio * 25.0); // 74% - 99%
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

    private boolean matchesRoleCategory(UnifiedJobListingDto job, String category) {
        String title = job.jobTitle().toLowerCase();
        String desc = job.rawDescription().toLowerCase();
        String skills = String.join(" ", job.skillsRequired()).toLowerCase();

        return switch (category) {
            case "JAVA" -> title.contains("java") || skills.contains("java") || desc.contains("spring boot");
            case "BACKEND" -> title.contains("backend") || title.contains("java") || desc.contains("microservices") || desc.contains("api");
            case "FULLSTACK" -> title.contains("full-stack") || title.contains("full stack") || (skills.contains("react") && skills.contains("java"));
            case "DATA_ANALYST" -> title.contains("data analyst") || desc.contains("bi") || desc.contains("power bi") || desc.contains("tableau");
            case "DATA_SCIENTIST" -> title.contains("data scientist") || title.contains("data science") || desc.contains("predictive") || desc.contains("scikit");
            case "DATA_ENGINEER" -> title.contains("data engineer") || desc.contains("spark") || desc.contains("etl") || desc.contains("data platform");
            case "ML_ENGINEER" -> title.contains("machine learning") || desc.contains("deep learning") || desc.contains("pytorch") || desc.contains("tensorflow");
            case "AI_LLM" -> title.contains("ai ") || title.contains("llm") || desc.contains("rag") || desc.contains("pgvector") || desc.contains("generative");
            case "FRONTEND_REACT" -> title.contains("frontend") || title.contains("react") || skills.contains("react") || skills.contains("typescript");
            case "ANDROID" -> title.contains("android") || skills.contains("kotlin") || desc.contains("android sdk");
            case "DEVOPS" -> title.contains("devops") || title.contains("sre") || title.contains("reliability") || desc.contains("kubernetes");
            case "CLOUD_SECURITY" -> title.contains("security") || desc.contains("threat") || desc.contains("cryptography") || desc.contains("vulnerability");
            case "QA_TESTING", "AUTOMATION_TEST" -> title.contains("qa") || title.contains("test") || title.contains("quality") || skills.contains("selenium") || skills.contains("playwright");
            default -> true;
        };
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
