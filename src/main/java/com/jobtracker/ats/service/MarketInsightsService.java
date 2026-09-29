package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.*;
import com.jobtracker.ats.entity.CachedJobListing;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.repository.CachedJobListingRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import com.jobtracker.ats.util.JobNormalizationUtils;

@Service
@RequiredArgsConstructor
@Slf4j
public class MarketInsightsService {

    private final CachedJobListingRepository cachedJobListingRepository;
    private final CvProfileRepository cvProfileRepository;

    // Cache in memorie pentru a raspunde ultra-rapid (<15ms)
    private final AtomicReference<List<CachedJobListing>> rawJobsCache = new AtomicReference<>(null);
    private long lastCacheTimeMs = 0;
    private static final long CACHE_TTL_MS = 15 * 60 * 1000; // 15 minute

    public enum DomainCategory {
        AI_DATA_SCIENCE(
                "AI_DATA_SCIENCE",
                "AI, Machine Learning & Data Science",
                "Modele de limbaj (LLMs), rețele neurale, algoritmi predictivi și analiză statistică avansată.",
                "Brain",
                Pattern.compile("(?i)(data scientist|machine learning|ai |artificial intelligence|deep learning|llm|nlp|data science|computer vision|prompt engineer)"),
                "Live Coding Python / Algoritmi Matematici + Discuție Arhitectură RAG / Modele ML + Proiect Portofoliu",
                Map.of(
                        "JUNIOR", "5.000 - 8.500 RON net",
                        "MID", "9.500 - 17.000 RON net",
                        "SENIOR", "18.000 - 30.000+ RON net",
                        "ALL", "5.000 - 25.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Educație & Diplomă", "GraduationCap", List.of(
                                "Diplomă de Licență / Masterat în Informatică, Matematică, Statistică sau Inteligență Artificială",
                                "Bază solidă în algebră liniară, calcul diferențial, probabilități și statistică matematică"
                        )),
                        new DomainRequirementCategoryDto("Limbaje & Framework-uri ML", "Code2", List.of(
                                "Python avansat (NumPy, Pandas, SciPy, Scikit-Learn)",
                                "PyTorch sau TensorFlow / Keras pentru Deep Learning",
                                "Ecosistem LLM: LangChain, LlamaIndex, Ollama, HuggingFace Transformers, RAG"
                        )),
                        new DomainRequirementCategoryDto("Baze de Date & Tooling", "Database", List.of(
                                "SQL pentru extragerea și curățarea seturilor masive de date",
                                "Vector Databases (pgvector, Pinecone, ChromaDB, Qdrant)",
                                "Jupyter Notebooks, Google Colab, MLOps (MLflow, Weights & Biases)"
                        )),
                        new DomainRequirementCategoryDto("Bune Practici & Experimentare", "Sparkles", List.of(
                                "Validare riguroasă a modelelor (Cross-Validation, F1-Score, ROC-AUC)",
                                "Curățare, normalizare și feature engineering pe date reale",
                                "Abordare științifică, testare de ipoteze și documentare clară a rezultatelor"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Cunoașterea algoritmilor clasici ML (Regression, Random Forest, SVM)", "Folosire API-uri OpenAI/Groq/HuggingFace", "Proiecte pe GitHub cu Kaggle datasets", "Python & SQL fluent"),
                        List.of("Fine-tuning modele open-source", "Implementare arhitecturi RAG end-to-end", "Optimizare inferență și costuri tokens", "Integrare modele în servicii backend (FastAPI)"),
                        List.of("Arhitectură MLOps la scară mare", "Antrenare modele pe infrastructură distribuită", "Evaluare riscuri hallucination & securitate AI", "Leadership tehnic și aliniere cu strategia de business")
                ),
                List.of(
                        new RoadmapStageDto(1, "Fundamente Matematică & Python", "1-2 Luni", List.of("Algebră liniară și statistică", "Python avansat, NumPy, Pandas", "Git & baze de date relaționale")),
                        new RoadmapStageDto(2, "Machine Learning Clasic", "2 Luni", List.of("Scikit-learn, metrici de evaluare", "Curățare și pregătire date", "Participare la competiții Kaggle")),
                        new RoadmapStageDto(3, "Deep Learning & Generative AI", "2-3 Luni", List.of("PyTorch, rețele neurale feedforward și transformer", "LLMs, RAG cu pgvector", "Construire aplicație AI completă")),
                        new RoadmapStageDto(4, "Pregătire Interviuri & Portofoliu", "1 Lună", List.of("Explicare matematică a modelelor", "Portofoliu GitHub cu proiecte interactive (Streamlit/FastAPI)", "Rezolvare probleme de coding pe LeetCode"))
                )
        ),

        DEVOPS_CLOUD(
                "DEVOPS_CLOUD",
                "DevOps, Cloud & SRE",
                "Infrastructură automată, containere, pipeline-uri CI/CD, observabilitate și disponibilitate 99.99%.",
                "Cloud",
                Pattern.compile("(?i)(devops|sre|cloud|infrastructure|reliability|terraform|kubernetes|platform engineer|site reliability|helm|ansible)"),
                "Scenarii de Troubleshooting Linux / Rețele + Hands-on Docker & Kubernetes + Scripting Bash/Terraform",
                Map.of(
                        "JUNIOR", "4.800 - 8.000 RON net",
                        "MID", "9.500 - 16.500 RON net",
                        "SENIOR", "17.500 - 28.000+ RON net",
                        "ALL", "4.800 - 25.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Sisteme de Operare & Rețelistică", "Terminal", List.of(
                                "Cunoștințe avansate de Linux (Ubuntu/Debian, RedHat), comenzi bash și shell scripting",
                                "Fundamente de rețele: DNS, TCP/IP, HTTP/HTTPS, VPN, Load Balancing, CIDR, Subnetting"
                        )),
                        new DomainRequirementCategoryDto("Containere & Orchestrare", "Layers", List.of(
                                "Docker & Docker Compose (creare imagini multi-stage optimizate, gestiune volume)",
                                "Kubernetes (Pods, Deployments, Services, Ingress, ConfigMaps, Secrets, Helm Charts)"
                        )),
                        new DomainRequirementCategoryDto("Cloud & Infrastructure as Code", "CloudRain", List.of(
                                "Furnizori Cloud: AWS (EC2, S3, IAM, ECS, EKS) sau Azure / GCP",
                                "Infrastructure as Code: Terraform sau OpenTofu pentru provizionare automată"
                        )),
                        new DomainRequirementCategoryDto("CI/CD & Observabilitate", "Activity", List.of(
                                "GitHub Actions, GitLab CI sau Jenkins pentru livrare continuă",
                                "Monitoring & Logging: Prometheus, Grafana, ELK Stack / Loki, Datadog"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Scriere Dockerfile-uri eficiente", "Comenzi Linux & Bash scripting", "Configurare GitHub Actions simple", "Înțelegere concepte AWS/Cloud de bază"),
                        List.of("Cluster Kubernetes în producție", "Module Terraform reutilizabile", "Pipeline-uri complexe de deployment cu rollback", "Securizare infrastructură și secrets management"),
                        List.of("Arhitectură multi-cloud și disaster recovery", "Reducere drastică a costurilor de cloud (FinOps)", "Design sisteme de înaltă disponibilitate (99.99%)", "Cultură organizațională SRE & On-call governance")
                ),
                List.of(
                        new RoadmapStageDto(1, "Linux & Baze de Rețele", "1 Lună", List.of("Comenzi Linux & permisiuni", "Scripting Bash", "Networking, DNS, SSH, Firewall")),
                        new RoadmapStageDto(2, "Containere & CI/CD", "1.5 Luni", List.of("Docker & optimizare imagini", "GitHub Actions workflows", "GitOps concepte de bază")),
                        new RoadmapStageDto(3, "Cloud & Terraform", "2 Luni", List.of("AWS / Azure Essentials (IAM, VPC, EC2)", "Terraform IaC hands-on", "Deploy automatizat de servicii")),
                        new RoadmapStageDto(4, "Kubernetes & Monitoring", "2 Luni", List.of("K8s arhitectură & resurse de bază", "Prometheus & Grafana dashboards", "Proiect personal cu cluster live"))
                )
        ),

        BACKEND(
                "BACKEND",
                "Backend Development",
                "Logică de business scalabilă, API-uri REST/gRPC, microservicii, arhitecturi distribuite și tranzacții ACID.",
                "Server",
                Pattern.compile("(?i)(backend|back-end|java|python|\\.net|c#|golang|php|node|scala|ruby|django|flask|spring|laravel)"),
                "Live Coding Algoritmic (LeetCode Easy/Medium) + Întrebări OOP, SQL & Tranzacții + System Design de API-uri",
                Map.of(
                        "JUNIOR", "4.500 - 7.500 RON net",
                        "MID", "8.500 - 15.000 RON net",
                        "SENIOR", "16.000 - 26.000+ RON net",
                        "ALL", "4.500 - 24.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Limbaje de Programare Principale", "Code", List.of(
                                "Java (Java 17/21) sau C# (.NET 8) sau Python / Go / Node.js",
                                "Înțelegere profundă a paradigmei OOP, principii SOLID și Design Patterns clasice"
                        )),
                        new DomainRequirementCategoryDto("Framework-uri & Arhitectură", "Cpu", List.of(
                                "Spring Boot 3 (Spring MVC, Spring Data JPA, Spring Security)",
                                "Arhitectură de Microservicii, comunicare RESTful, gRPC sau GraphQL",
                                "Mesagerie asincronă: Apache Kafka, RabbitMQ sau AWS SQS"
                        )),
                        new DomainRequirementCategoryDto("Gestiunea Datelor & Persistență", "Database", List.of(
                                "Baze de date relaționale: PostgreSQL, MySQL sau Oracle (indecși, query tuning, tranzacții)",
                                "Caching & In-memory: Redis pentru stocare de sesiuni și performanță",
                                "ORM: Hibernate / JPA sau Entity Framework"
                        )),
                        new DomainRequirementCategoryDto("Calitatea Codului & Testare", "ShieldCheck", List.of(
                                "Unit Testing & Integration Testing cu JUnit 5, Mockito, Testcontainers",
                                "Documentare automată API prin Swagger / OpenAPI",
                                "Securitate API: Autentificare JWT, OAuth2, validare input"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Scriere de endpoint-uri REST curate", "Cunoștințe OOP & Collections framework", "Scriere query-uri SQL și mapare JPA", "Scriere teste unitare cu JUnit/Mockito"),
                        List.of("Design microservicii independente", "Optimizare interogări lente de DB și indecși", "Integrare cozi de mesaje (Kafka/RabbitMQ)", "Implementare fluxuri OAuth2/JWT securizate"),
                        List.of("Arhitectură distribuită și consistență eventuală", "Capacitate de scalare orizontală la milioane de request-uri", "Rezolvare blocaje de concurență și deadlock-uri", "Mentorare ingineri juniori și ghidare decizii tehnice")
                ),
                List.of(
                        new RoadmapStageDto(1, "Limbajul de Bază & Concepte OOP", "1 Lună", List.of("Sintaxă modernă Java/C#/Python", "Structuri de date și colecții", "Principii SOLID și Clean Code")),
                        new RoadmapStageDto(2, "Baze de Date & SQL", "1 Lună", List.of("Proiectare tabele și chei străine", "Tranzacții, join-uri și indecși", "Conectare din cod via JDBC/ORM")),
                        new RoadmapStageDto(3, "Framework Backend & REST API", "1.5 Luni", List.of("Spring Boot / .NET Web API", "Securitate cu JWT", "Documentare Swagger & validări")),
                        new RoadmapStageDto(4, "Testare, Docker & Proiect Portofoliu", "1 Lună", List.of("JUnit 5, Mockito, Testcontainers", "Dockerizare aplicație backend", "Deploy pe cloud cu CI/CD"))
                )
        ),

        DATA_ENGINEERING(
                "DATA_ENGINEERING",
                "Data Engineering & Big Data",
                "Pipeline-uri masive de date (ETL/ELT), data warehouses, streaming de date în timp real și business analytics.",
                "Database",
                Pattern.compile("(?i)(data engineer|etl|big data|databricks|bigquery|data analyst|analist date|reporting|business intelligence|bi developer|snowflake|spark)"),
                "Interogări Complexe SQL (Window Functions, CTE) + Scripting Python/PySpark + Modelare Dimensională",
                Map.of(
                        "JUNIOR", "4.800 - 8.000 RON net",
                        "MID", "9.000 - 16.000 RON net",
                        "SENIOR", "16.500 - 27.000+ RON net",
                        "ALL", "4.800 - 24.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Baze de Date & SQL Avansat", "Database", List.of(
                                "SQL la nivel avansat (Window functions, CTE-uri, optimizare planuri de execuție)",
                                "Data Warehouses: Snowflake, Google BigQuery, Amazon Redshift"
                        )),
                        new DomainRequirementCategoryDto("Procesare Date & Framework-uri", "Workflow", List.of(
                                "Apache Spark (PySpark) pentru procesare distribuită de date la scară mare",
                                "Python pentru data wrangling, manipulare fișiere (Parquet, Avro, JSON) și automatizări"
                        )),
                        new DomainRequirementCategoryDto("Orchestrare & Streaming", "RefreshCw", List.of(
                                "Orchestrare de pipeline-uri: Apache Airflow, Dagster sau Prefect",
                                "Streaming de date: Apache Kafka, AWS Kinesis sau Spark Streaming"
                        )),
                        new DomainRequirementCategoryDto("Modelare & Bune Practici", "TrendingUp", List.of(
                                "Arhitecturi Medallion (Bronze/Silver/Gold) pe Databricks Lakehouse",
                                "Modelare dimensională: Scheme Star & Snowflake, SCD (Slowly Changing Dimensions)"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Scriere interogări complexe SQL", "Scripting Python pentru extragere date", "Construire pipeline-uri simple Airflow/Cron", "Înțelegere concepte de Data Warehouse"),
                        List.of("Pipeline-uri PySpark optimizate pentru performanță", "Modelare tabele în Snowflake / BigQuery", "Consum mesaje de streaming din Kafka", "Automatizare teste de calitate a datelor (Great Expectations)"),
                        List.of("Arhitectură Data Lakehouse pentru petabytes de date", "Optimizare costuri de computare în cloud", "Guvernanță date, securitate și politici GDPR", "Design de platforme unificate de date pentru companie")
                ),
                List.of(
                        new RoadmapStageDto(1, "Mastery SQL & Python", "1 Lună", List.of("SQL avansat (CTE, window functions)", "Python pentru date", "Concepte de modelare dimensională")),
                        new RoadmapStageDto(2, "Data Warehousing & Cloud", "1.5 Luni", List.of("BigQuery sau Snowflake", "Stocare columnar (Parquet, Delta)", "Pipeline-uri ELT cu dbt")),
                        new RoadmapStageDto(3, "Big Data & PySpark", "2 Luni", List.of("Arhitectură Spark & execuție distribuită", "PySpark DataFrames & transformări", "Databricks hands-on")),
                        new RoadmapStageDto(4, "Orchestrare & Streaming", "1.5 Luni", List.of("Apache Airflow DAGs", "Kafka concepte de bază", "Proiect end-to-end complet pe GitHub"))
                )
        ),

        QA_AUTOMATION(
                "QA_AUTOMATION",
                "QA & Test Automation",
                "Asigurarea calității software, testare automată end-to-end, framework-uri de testare și integrare în pipeline-uri CI.",
                "CheckCircle2",
                Pattern.compile("(?i)(qa|test|automation engineer|quality assurance|tester|sdet|quality engineer|testare)"),
                "Scenarii de Testare Funcțională + Exercițiu Practic de Automatizare UI/API (Playwright/Postman) + Întrebări SQL",
                Map.of(
                        "JUNIOR", "3.800 - 6.200 RON net",
                        "MID", "7.000 - 12.500 RON net",
                        "SENIOR", "13.000 - 20.000+ RON net",
                        "ALL", "3.800 - 18.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Fundamente de Testare Software", "CheckSquare", List.of(
                                "Tipuri de testare: Funcțională, Regresie, Smoke, Sanity, Integrare, E2E, Performanță",
                                "Metodologii: Test-Driven Development (TDD), Behavior-Driven Development (BDD)",
                                "Certificări recomandate (dar opționale): ISTQB Certified Tester Foundation Level"
                        )),
                        new DomainRequirementCategoryDto("Framework-uri de Automatizare UI & API", "Code2", List.of(
                                "UI Automation: Playwright, Cypress sau Selenium WebDriver",
                                "API Testing: Postman, REST-Assured (Java), Requests / pytest (Python)",
                                "BDD Frameworks: Cucumber sau SpecFlow cu sintaxă Gherkin"
                        )),
                        new DomainRequirementCategoryDto("Limbaje de Programare & Scripting", "FileCode", List.of(
                                "Java sau Python sau JavaScript/TypeScript pentru scriere teste automate",
                                "Interogări SQL pentru verificarea consistenței datelor în baza de date"
                        )),
                        new DomainRequirementCategoryDto("Integrare CI/CD & Raportare", "BarChart", List.of(
                                "Rulare automată teste în GitHub Actions / Jenkins / GitLab la fiecare Pull Request",
                                "Generare rapoarte vizuale: Allure Framework, ExtentReports",
                                "Managementul defectelor: Jira, Zephyr, TestRail"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Scriere scenarii de testare clare și bug reports", "Automatizare teste simple de API în Postman", "Scriere teste UI de bază cu Cypress sau Playwright", "Cunoștințe SQL pentru verificare tabele"),
                        List.of("Dezvoltare framework de testare automată de la zero (Page Object Model)", "Rulare teste paralele în containere Docker", "Integrare completă în pipeline CI/CD", "Testare de performanță cu JMeter sau k6"),
                        List.of("Strategie globală de calitate software la nivel de companie", "Design arhitectură de testare pentru zeci de servicii", "Reducere timp de execuție a testelor de regresie", "Coaching pentru dezvoltatori în bune practici de testare")
                ),
                List.of(
                        new RoadmapStageDto(1, "Fundamente QA & Testare Manuală", "1 Lună", List.of("Scriere test cases, test plan", "Bug reporting precis în Jira", "Fundamente ISTQB")),
                        new RoadmapStageDto(2, "Testare API & Postman", "3 Săptămâni", List.of("Structură request/response HTTP", "Scriere teste automate în Postman / Newman", "SQL pentru verificări DB")),
                        new RoadmapStageDto(3, "Automatizare Web cu Playwright/Cypress", "1.5 Luni", List.of("Selectoare DOM robuste", "Page Object Model (POM)", "JavaScript / Python pentru teste")),
                        new RoadmapStageDto(4, "Integrare CI/CD & Rapoarte Allure", "3 Săptămâni", List.of("Rulare teste în GitHub Actions", "Rapoarte Allure interactive", "Proiect complet de testare pe GitHub"))
                )
        ),

        CYBERSECURITY(
                "CYBERSECURITY",
                "Cybersecurity & Cloud Security",
                "Protecția infrastructurii digitale, monitorizare SOC, analiză de vulnerabilități și răspuns la incidente cibernetice.",
                "ShieldCheck",
                Pattern.compile("(?i)(security|cyber|infosec|soc analyst|pentest|vulnerability|appsec|cloud security|penetration)"),
                "Analiză de Loguri și Alerte SIEM + Întrebări Rețele / OWASP Top 10 + Scenarii de Incident Response",
                Map.of(
                        "JUNIOR", "4.800 - 8.000 RON net",
                        "MID", "9.500 - 16.000 RON net",
                        "SENIOR", "17.000 - 28.000+ RON net",
                        "ALL", "4.800 - 25.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Fundamente de Securitate & Rețele", "Shield", List.of(
                                "Protocoale de rețea securizate: TLS/SSL, IPsec, SSH, DNSSEC",
                                "Arhitectură defensivă: Firewalls, WAF, IDS/IPS, segmented networks, DMZ"
                        )),
                        new DomainRequirementCategoryDto("Operațiuni de Securitate (SOC) & SIEM", "Activity", List.of(
                                "Sisteme SIEM: Splunk, Microsoft Sentinel sau Elastic Security",
                                "Analiză de loguri, detecție atacuri (Phishing, Malware, Brute-Force, DDoS)",
                                "Triage al alertelor și proceduri de Incident Response"
                        )),
                        new DomainRequirementCategoryDto("Securitate Aplicativă & Vulnerabilități", "AlertTriangle", List.of(
                                "Top 10 vulnerabilități OWASP (SQL Injection, XSS, SSRF, Broken Auth)",
                                "Scanere de vulnerabilități: Nessus, Qualys, Nmap, Burp Suite",
                                "Securitate cod: SAST, DAST și Dependency Scanning"
                        )),
                        new DomainRequirementCategoryDto("Standarde & Conformitate", "CheckCheck", List.of(
                                "Framework-uri: MITRE ATT&CK, NIST Cybersecurity Framework, ISO 27001",
                                "Certificări foarte apreciate: CompTIA Security+, CEH, Blue Team Level 1 (BTL1)"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Analiză de loguri și investigare alerte de securitate", "Înțelegere OWASP Top 10 și Nmap", "Scripting Python/Bash simplu pentru automatizare", "Certificare Security+ sau similară"),
                        List.of("Răspuns autonom la incidente de securitate (IR)", "Threat hunting proactiv folosind MITRE ATT&CK", "Configurare reguli de detecție în SIEM", "Evaluare și remediere vulnerabilități de cloud"),
                        List.of("Arhitectură Zero Trust la nivel de corporație", "Gestiune crize de securitate cibernetică", "Politici de conformitate (ISO 27001, NIS2, DORA)", "Audituri de securitate complexe și Red/Blue teaming")
                ),
                List.of(
                        new RoadmapStageDto(1, "Baze Solide de Rețele & Linux", "1 Lună", List.of("Comenzi Linux, TCP/IP, Wireshark", "Modelul OSI, porturi și protocoale", "Scripting Python de bază")),
                        new RoadmapStageDto(2, "Fundamente de Securitate & OWASP", "1 Lună", List.of("OWASP Top 10 hands-on pe PortSwigger", "Criptografie (simetrică, asimetrică, hashing)", "CompTIA Security+ curiculă")),
                        new RoadmapStageDto(3, "Practică SOC & Analiză SIEM", "1.5 Luni", List.of("Laboratoare pe TryHackMe / HackTheBox", "Analiză loguri în Splunk / Elastic", "Detecție atacuri și investigații")),
                        new RoadmapStageDto(4, "Cloud Security & Portofoliu", "1 Lună", List.of("Politici IAM în AWS/Azure", "Documentare investigații în rapoarte profesionale", "Pregătire interviu tehnic"))
                )
        ),

        FRONTEND(
                "FRONTEND",
                "Frontend Development",
                "Interfețe utilizator moderne, responsive, performanță web, componente accesibile și experiență vizuală impecabilă.",
                "Layout",
                Pattern.compile("(?i)(frontend|front-end|react|angular|vue|ui developer|web developer|next\\.?js|tailwindcss)"),
                "Live Coding JS/React + Implementare Componentă UI din Figma + Întrebări CSS & State Management",
                Map.of(
                        "JUNIOR", "4.000 - 7.000 RON net",
                        "MID", "8.000 - 14.000 RON net",
                        "SENIOR", "15.000 - 24.000+ RON net",
                        "ALL", "4.000 - 22.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Limbaje Web & Core Fundamentals", "Globe", List.of(
                                "HTML5 semantic, CSS3 modern (Flexbox, Grid, CSS Variables, animatii)",
                                "JavaScript modern (ES6+: Destructuring, Promises, Async/Await, Closures, DOM API)",
                                "TypeScript pentru type safety și prevenirea erorilor la runtime"
                        )),
                        new DomainRequirementCategoryDto("Framework-uri & Biblioteci UI", "Component", List.of(
                                "React 18/19 (Hooks, Context, Custom Hooks) sau Angular sau Vue.js",
                                "Next.js pentru Server Components, SSR și performanță SEO",
                                "Tailwind CSS pentru styling rapid, curat și responsive"
                        )),
                        new DomainRequirementCategoryDto("State Management & Data Fetching", "Layers", List.of(
                                "Gestiunea stării: Redux Toolkit, Zustand sau TanStack Query (React Query)",
                                "Consum de API-uri REST / GraphQL cu Axios sau native fetch",
                                "Formulare & validare: React Hook Form cu Zod"
                        )),
                        new DomainRequirementCategoryDto("Performanță, Accesibilitate & Testare", "Zap", List.of(
                                "Web Vitals: LCP, FID/INP, CLS, optimizare asset-uri și lazy loading",
                                "Accesibilitate (WCAG, ARIA tags, navigare din tastatură)",
                                "Testare UI cu Vitest / Jest și React Testing Library"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Construire pagini pixel-perfect din Figma", "React Hooks și componente funcționale curate", "TypeScript de bază și consum de REST APIs", "Design responsive pentru mobile și desktop"),
                        List.of("Arhitectură de componente modulare reutilizabile", "Optimizare performanță și bundle size", "State management avansat (Zustand/React Query)", "Scriere teste automate pentru componente"),
                        List.of("Design Systems la scară largă (Storybook)", "Strategie de micro-frontends sau SSR/SSG la scară", "Accesibilitate strictă WCAG AAA și SEO avansat", "Mentoring și stabilire standarde de cod frontend")
                ),
                List.of(
                        new RoadmapStageDto(1, "HTML, CSS & JavaScript ES6+", "1 Lună", List.of("Semantic HTML, Flexbox, Grid", "JS Events, DOM, Async/Await", "Tailwind CSS")),
                        new RoadmapStageDto(2, "TypeScript & React Fundamentals", "1.5 Luni", List.of("TypeScript types & interfaces", "React state, props, hooks", "Consum API cu fetch/Axios")),
                        new RoadmapStageDto(3, "State Management & Next.js", "1.5 Luni", List.of("Zustand / TanStack Query", "Next.js App Router", "Formulare robuste cu Zod")),
                        new RoadmapStageDto(4, "Testare, Portofoliu & Deploy", "1 Lună", List.of("Vitest & React Testing Library", "Construire 2-3 proiecte impresionante", "Deploy pe Vercel cu domeniu propriu"))
                )
        ),

        FULLSTACK(
                "FULLSTACK",
                "Full Stack Development",
                "Dezvoltare end-to-end completă: interfețe reactive frontend, servicii backend, baze de date și deploy.",
                "Layers",
                Pattern.compile("(?i)(fullstack|full-stack|full stack)"),
                "Live Coding Full-Stack (Frontend UI + Endpoint REST + Conectare DB) + Întrebări Arhitectură",
                Map.of(
                        "JUNIOR", "4.500 - 7.500 RON net",
                        "MID", "8.500 - 15.000 RON net",
                        "SENIOR", "16.000 - 25.000+ RON net",
                        "ALL", "4.500 - 24.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Frontend Stack", "Layout", List.of(
                                "React sau Angular sau Vue.js cu TypeScript",
                                "Tailwind CSS sau biblioteci de componente (shadcn/ui, MUI)",
                                "State management și integrare cu servicii backend"
                        )),
                        new DomainRequirementCategoryDto("Backend Stack", "Server", List.of(
                                "Node.js (Express/NestJS) sau Java Spring Boot sau .NET / Python",
                                "Arhitectură de servicii RESTful, autentificare securizată cu JWT/OAuth",
                                "Gestiune erori și middleware-uri"
                        )),
                        new DomainRequirementCategoryDto("Baze de Date & Persistență", "Database", List.of(
                                "Baze de date relaționale: PostgreSQL / MySQL cu ORM (Prisma, TypeORM, Hibernate)",
                                "Baze de date NoSQL sau Caching: MongoDB, Redis"
                        )),
                        new DomainRequirementCategoryDto("DevOps & Deployment", "Rocket", List.of(
                                "Docker pentru rularea completă locală (Frontend + Backend + DB)",
                                "Deploy în Cloud (Render, Vercel, Railway, AWS)",
                                "Automatizare fluxuri Git și CI/CD de bază"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Construire aplicații CRUD complete cap-coadă", "Conectare frontend React cu backend REST", "Autentificare utilizatori cu token JWT", "Deploy proiect pe o platformă cloud gratuită"),
                        List.of("Arhitectură curată (Clean Architecture / Hexagonal)", "Optimizare performanță atât pe client cât și pe server", "Docker-compose pentru medii de staging și testare", "Testare automată completă (Backend + Frontend)"),
                        List.of("Decizii de arhitectură tehnologică completă", "Scalabilitate orizontală și partitioning baze de date", "Securitate end-to-end și monitorizare completă", "Capacitate de a conduce tehnic un produs digital complet")
                ),
                List.of(
                        new RoadmapStageDto(1, "Baze Frontend & Backend", "1.5 Luni", List.of("HTML/CSS/JS/TS", "Node.js / Express sau Spring Boot", "PostgreSQL de bază")),
                        new RoadmapStageDto(2, "Frontend Avansat cu React", "1.5 Luni", List.of("React, Hooks, Tailwind CSS", "Integrare API cu Axios", "Autentificare JWT")),
                        new RoadmapStageDto(3, "Baze de Date Avansate & Docker", "1.5 Luni", List.of("PostgreSQL relații & migrări", "Docker & Docker Compose", "Testing backend și frontend")),
                        new RoadmapStageDto(4, "Construire SaaS Complet & Deploy", "1.5 Luni", List.of("Dezvoltare proiect real complet", "Deploy pe cloud cu CI/CD", "Documentare completă pe GitHub"))
                )
        ),

        EMBEDDED_SYSTEMS(
                "EMBEDDED_SYSTEMS",
                "Sisteme Embedded & C/C++",
                "Software pentru dispozitive fizice, microcontrollere, sisteme auto (Automotive), IoT și firmware de performanță.",
                "Cpu",
                Pattern.compile("(?i)(embedded|firmware|iot|microcontroller|c\\+\\+|autosar|rtos|hardware engineer)"),
                "Întrebări Aprofundate C (Pointeri, Structuri, Biți) + Protocoale Hardware (SPI/I2C/CAN) + Debugging",
                Map.of(
                        "JUNIOR", "4.800 - 8.000 RON net",
                        "MID", "9.000 - 15.500 RON net",
                        "SENIOR", "16.000 - 26.000+ RON net",
                        "ALL", "4.800 - 25.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Limbaje de Programare de Nivel Scăzut", "Code", List.of(
                                "C și C++ (C++14/C++17/C++20) orientate pe memorie limitată și performanță maximă",
                                "Gestiune manuală a memoriei, pointeri, aritmetică de biți, register-level programming"
                        )),
                        new DomainRequirementCategoryDto("Microcontrollere & Hardware", "Cpu", List.of(
                                "Arhitecturi: ARM Cortex-M, STM32, ESP32, AVR / Arduino, PIC",
                                "Protocoale de comunicație hardware: UART, SPI, I2C, CAN Bus, LIN, Ethernet",
                                "Citire scheme electronice, folosire osciloscop și multimetru digital"
                        )),
                        new DomainRequirementCategoryDto("Sisteme de Operare în Timp Real", "Clock", List.of(
                                "RTOS: FreeRTOS, Zephyr RTOS sau Embedded Linux",
                                "Gestiune task-uri, priorități, semafoare, mutex-uri, cozi de mesaje și ISR (Interrupts)"
                        )),
                        new DomainRequirementCategoryDto("Standarde Industriale (Automotive / Medical)", "ShieldCheck", List.of(
                                "Standarde Automotive: AUTOSAR, MISRA-C, ISO 26262 (Functional Safety)",
                                "Unelte de debugging hardware: JTAG, SWD, Segger J-Link"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Cunoștințe solide de limbaj C și pointeri", "Programare microcontrollere (STM32/ESP32)", "Comunicație pe protocoale I2C/SPI/UART", "Citire datasheet-uri de senzori și cipuri"),
                        List.of("Integrare FreeRTOS și sincronizare task-uri fără race conditions", "Dezvoltare drivere hardware de la zero", "Respectare reguli stricte de siguranță MISRA-C", "Debugging semnale electrice pe osciloscop"),
                        List.of("Arhitectură completă de sisteme de siguranță critică (Safety Critical)", "Integrare și configurare stivă completă AUTOSAR", "Optimizare consum energetic pentru device-uri pe baterie", "Conducere proiecte hardware-software industriale")
                ),
                List.of(
                        new RoadmapStageDto(1, "C Programare & Baze Electronice", "1 Lună", List.of("Limbajul C aprofundat, biți și pointeri", "Electronică de bază, legile lui Ohm/Kirchhoff", "Datasheet-uri")),
                        new RoadmapStageDto(2, "Microcontrollere & Periferice", "1.5 Luni", List.of("STM32 / ESP32 hands-on", "Configurare GPIO, Timers, ADC, DAC", "Protocoale UART, SPI, I2C")),
                        new RoadmapStageDto(3, "Real-Time OS (FreeRTOS)", "1.5 Luni", List.of("FreeRTOS concepte & task scheduling", "Semafoare, mutex-uri, queues", "ISR & memory management")),
                        new RoadmapStageDto(4, "Standarde Industriale & Proiect", "1 Lună", List.of("Reguli MISRA-C", "CAN Bus comunicație", "Proiect fizic complet documentat pe GitHub"))
                )
        ),

        MOBILE(
                "MOBILE",
                "Dezvoltare Mobile (Android / iOS)",
                "Aplicații native și cross-platform pentru smartphone-uri, performanță pe baterie și experiență tactilă fluidă.",
                "Smartphone",
                Pattern.compile("(?i)(android|ios|mobile|flutter|swift|kotlin|react native)"),
                "Live Coding UI (Compose/SwiftUI) + Consum API REST & Arhitectură MVVM + Discuție Proiecte Demo",
                Map.of(
                        "JUNIOR", "4.500 - 7.500 RON net",
                        "MID", "8.500 - 14.500 RON net",
                        "SENIOR", "15.500 - 25.000+ RON net",
                        "ALL", "4.500 - 23.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Dezvoltare Nativă Android", "Smartphone", List.of(
                                "Kotlin modern (Coroutines, Flow), Android SDK",
                                "Jetpack Compose pentru interfețe declarative moderne",
                                "Arhitectură recomandată Google: MVVM / MVI, Room DB, Retrofit, Hilt / Koin"
                        )),
                        new DomainRequirementCategoryDto("Dezvoltare Nativă iOS", "Apple", List.of(
                                "Swift 5/6, SwiftUI și UIKit",
                                "Arhitecturi iOS: MVVM, Clean Swift, Combine / Swift Concurrency (async/await)",
                                "CoreData / SwiftData, URLSession, gestiune dependințe cu SPM (Swift Package Manager)"
                        )),
                        new DomainRequirementCategoryDto("Dezvoltare Cross-Platform", "Layers", List.of(
                                "Flutter cu limbajul Dart sau React Native cu TypeScript",
                                "Gestiune stare: Bloc / Provider (Flutter) sau Redux / Zustand (React Native)"
                        )),
                        new DomainRequirementCategoryDto("Bune Practici Mobile & Publicare", "UploadCloud", List.of(
                                "Consum de API-uri offline-first și caching local",
                                "Publicare și guidelines pe Google Play Console și Apple App Store",
                                "Optimizare consum baterie, memorie și mărime APK/IPA"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Construire ecrane fluide cu Jetpack Compose sau SwiftUI", "Consum de API-uri REST și afișare liste", "Înțelegere ciclu de viață aplicație/ecran", "Publicare aplicație demo pe GitHub sau Play Store"),
                        List.of("Arhitectură modulară MVVM cu injecție de dependințe", "Funcționalitate offline-first robustă cu caching local", "Push notifications și background processing", "Testare automată UI și unitară"),
                        List.of("Arhitectură la scară pentru aplicații cu milioane de utilizatori", "Dezvoltare module native C++/Rust integrate în mobile", "Optimizare cold-start time și memory leaks", "Mentorare echipă și stabilire standarde de design mobile")
                ),
                List.of(
                        new RoadmapStageDto(1, "Limbajul Nativ (Kotlin sau Swift)", "1 Lună", List.of("Sintaxă Kotlin / Swift modernă", "OOP & programare funcțională", "Git & principii de bază")),
                        new RoadmapStageDto(2, "UI Declarativ (Compose sau SwiftUI)", "1.5 Luni", List.of("Construire layouts responsive", "Gestiune stare locală și teme (Dark/Light)", "Navigare între ecrane")),
                        new RoadmapStageDto(3, "Networking & Baze de Date Locale", "1.5 Luni", List.of("Consum REST API cu Retrofit/URLSession", "Stocare locală cu Room/SwiftData", "Arhitectură MVVM")),
                        new RoadmapStageDto(4, "Publicare & Proiect Portofoliu", "1 Lună", List.of("Testare pe dispozitive fizice", "Pregătire asset-uri pentru Store", "Publicare aplicație live"))
                )
        ),

        IT_SUPPORT_SYSADMIN(
                "IT_SUPPORT_SYSADMIN",
                "IT Support & Administrare Sisteme",
                "Mentenanță echipamente, suport pentru utilizatori, administrare Active Directory, rețele și ticketing ITIL.",
                "Headphones",
                Pattern.compile("(?i)(support|helpdesk|servicedesk|sysadmin|system admin|network|desktop support|tehnician|administrator retea|administrator sistem)"),
                "Scenarii Practice de Troubleshooting Windows/Linux + Întrebări Rețele (DNS/DHCP) + Simulare Tichet Suport",
                Map.of(
                        "JUNIOR", "3.500 - 5.500 RON net",
                        "MID", "6.000 - 10.000 RON net",
                        "SENIOR", "10.500 - 16.000+ RON net",
                        "ALL", "3.500 - 15.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Sisteme de Operare & Desktop Support", "Monitor", List.of(
                                "Windows 10/11 Pro/Enterprise și macOS la nivel avansat de troubleshooting",
                                "Instalare, configurare și depanare hardware (PC, laptopuri, imprimante, periferice)",
                                "Unelte de asistență la distanță: TeamViewer, AnyDesk, RDP"
                        )),
                        new DomainRequirementCategoryDto("Identity & Cloud Management", "Users", List.of(
                                "Microsoft Active Directory (AD), GPO (Group Policy Objects)",
                                "Microsoft 365 Admin Center, Azure AD / Microsoft Entra ID",
                                "Gestiune utilizatori, permisiuni, grupuri de securitate și resetare parole"
                        )),
                        new DomainRequirementCategoryDto("Rețelistică de Birou & Echipamente", "Wifi", List.of(
                                "Configurare routere, switch-uri, access points, VLAN-uri",
                                "Protocoale esențiale: DHCP, DNS, IPv4/IPv6, VPN-uri corporate",
                                "Cablare structurată, patch panels și diagnosticare cabluri"
                        )),
                        new DomainRequirementCategoryDto("Procese ITIL & Ticketing", "FileText", List.of(
                                "Sisteme de ticketing: ServiceNow, Jira Service Management, Zendesk",
                                "Respectare SLA-uri (Service Level Agreements) și proceduri de escaladare",
                                "Certificări utile: CompTIA A+, CompTIA Network+, ITIL 4 Foundation"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Diagnosticare rapidă probleme hardware și software", "Gestiune conturi în Active Directory / M365", "Răspuns prietenos și eficient la tichete", "Configurare conexiuni rețea și imprimante"),
                        List.of("Automatizare sarcini repetitive prin PowerShell / Bash", "Administrare servere Windows Server și Linux", "Configurare echipamente de rețea (Cisco, Fortinet)", "Participare la migrarea sistemelor on-premise în cloud"),
                        List.of("Design arhitectură IT corporate pentru sedii mari", "Politici de securitate IT și disaster recovery", "Negociere contracte de licențiere și furnizori", "Coordonare echipă de helpdesk și suport Tier 1-3")
                ),
                List.of(
                        new RoadmapStageDto(1, "Hardware, Windows & Troubleshooting", "1 Lună", List.of("Componente PC & depanare hardware", "Windows 11 depanare erori & registri", "Unelte de diagnosticare")),
                        new RoadmapStageDto(2, "Rețele de Calculatoare de Bază", "1 Lună", List.of("IP addressing, Subnetting, DNS, DHCP", "Configurare router & Wi-Fi", "Wireshark & ping/traceroute")),
                        new RoadmapStageDto(3, "Active Directory & Microsoft 365", "1 Lună", List.of("Creare useri, grupe și permisiuni", "M365 Admin Center", "PowerShell de bază pentru admin")),
                        new RoadmapStageDto(4, "ITIL, Ticketing & Pregătire Interviu", "3 Săptămâni", List.of("Procese ITIL de bază", "Simulare tichete Jira Service Desk", "Customer service & comunicare"))
                )
        ),

        PRODUCT_BUSINESS_ANALYST(
                "PRODUCT_BUSINESS_ANALYST",
                "Product & Business Analysis / Agile",
                "Traducerea nevoilor de business în specificații tehnice, prioritizare backlog, ghidare echipe Scrum și livrare de valoare.",
                "Briefcase",
                Pattern.compile("(?i)(product owner|scrum master|business analyst|product manager|analist business|functional analyst|agile coach)"),
                "Studiu de Caz de Produs + Redactare User Story cu Acceptance Criteria + Întrebări Comportamentale (STAR)",
                Map.of(
                        "JUNIOR", "4.500 - 7.000 RON net",
                        "MID", "8.500 - 14.500 RON net",
                        "SENIOR", "15.000 - 24.000+ RON net",
                        "ALL", "4.500 - 22.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Analiză de Business & Cerințe", "FileText", List.of(
                                "Scriere de User Stories clare cu Criterii de Acceptanță (Acceptance Criteria)",
                                "Modelare de procese de business: diagrame BPMN, UML, Use Cases",
                                "Colectare și clarificare cerințe de la stakeholderi și clienți"
                        )),
                        new DomainRequirementCategoryDto("Metodologii Agile & Unelte", "Kanban", List.of(
                                "Cadre de lucru: Scrum, Kanban, SAFe",
                                "Facilitare ceremonii: Sprint Planning, Daily Standup, Sprint Review, Retrospective",
                                "Management backlog în Jira, Confluence, Azure DevOps, Miro"
                        )),
                        new DomainRequirementCategoryDto("Alfabetizare Tehnică & Date", "BarChart2", List.of(
                                "Înțelegere generală a conceptelor tehnice (API-uri, baze de date, arhitectură client-server)",
                                "Interogări SQL de bază pentru extragere date și verificare ipoteze",
                                "Analiză metrici de produs: KPI-uri, retenție, conversie, funnel analytics"
                        )),
                        new DomainRequirementCategoryDto("Certificări & Soft Skills", "Award", List.of(
                                "Certificări recunoscute: PSM I (Professional Scrum Master) sau PSPO I (Scrum Product Owner)",
                                "Comunicare impecabilă, negociere, rezolvare de conflicte și gândire critică",
                                "Limba Engleză fluentă (scris și vorbit la nivel de negociere)"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Scriere User Stories clare și bine detaliate", "Documentare procese existente în Confluence / Miro", "Testare funcțională a cerințelor livrate", "Sprijin pentru Product Owner în rafinarea backlog-ului"),
                        List.of("Proprietate autonomă asupra unui modul sau feature complet", "Prioritizare backlog în funcție de ROI și impact", "Interacțiune directă cu clienți și decidenți cheie", "Facilitare ceremonii Scrum cu echipe mari"),
                        List.of("Definire viziune strategică de produs și roadmap multianual", "Lansare produse noi pe piață (Go-to-Market)", "Maximizare valoare livrată și eficiență operațională", "Lider în transformarea agilă a organizației")
                ),
                List.of(
                        new RoadmapStageDto(1, "Fundamente Agile & Scrum", "1 Lună", List.of("Ghidul Scrum oficial", "Rolurile PO și Scrum Master", "Ceremonii și artefacte Scrum")),
                        new RoadmapStageDto(2, "Scriere Cerințe & BPMN", "1 Lună", List.of("User stories cu format Given-When-Then", "Diagramare fluxuri BPMN în Draw.io/Miro", "Jira & Confluence hands-on")),
                        new RoadmapStageDto(3, "Baze Tehnice & SQL", "1 Lună", List.of("Ce este un REST API & JSON", "SQL de bază pentru extragere date", "Metrici de produs (churn, CAC, LTV)")),
                        new RoadmapStageDto(4, "Pregătire Certificare & Mock Interviews", "1 Lună", List.of("Pregătire PSM I sau PSPO I", "Studiu de caz de produs pentru portofoliu", "Pregătire întrebări comportamentale (STAR)"))
                )
        ),

        GENERAL_SOFTWARE(
                "GENERAL_SOFTWARE",
                "Software Engineering General",
                "Fundamente de inginerie software, algoritmi, structuri de date, bune practici de cod și adaptabilitate polivalentă.",
                "Code",
                Pattern.compile("(?i)(software engineer|software developer|graduate software|inginer software|programator|software architect|coder)"),
                "Live Coding Algoritmic pe Structuri de Date (Arrays, HashMaps, Trees) + Întrebări Concepte OOP & Git",
                Map.of(
                        "JUNIOR", "4.500 - 7.500 RON net",
                        "MID", "8.500 - 15.000 RON net",
                        "SENIOR", "16.000 - 26.000+ RON net",
                        "ALL", "4.500 - 24.000 RON net"
                ),
                List.of(
                        new DomainRequirementCategoryDto("Fundamente Computer Science", "BookOpen", List.of(
                                "Structuri de date esențiale: Liste, HashMaps, Arbori, Grafuri, Stive, Cozi",
                                "Algoritmi: Sortare, Căutare binară, Recursivitate, Complexitate Big-O (timp și spațiu)",
                                "Paradigme de programare: Orientată pe Obiect (OOP) și Funcțională"
                        )),
                        new DomainRequirementCategoryDto("Dezvoltare & Bune Practici", "Code2", List.of(
                                "Principii SOLID, Clean Code, DRY, KISS, YAGNI",
                                "Sisteme de versionare a codului: Git, branching, Pull Requests, Code Reviews",
                                "Consum și expunere de servicii RESTful cu formate JSON/XML"
                        )),
                        new DomainRequirementCategoryDto("Baze de Date & Tooling", "Database", List.of(
                                "Baze de date relaționale (SQL): proiectare tabele, relații, indecși",
                                "Medii de dezvoltare (IDEs): IntelliJ IDEA, VS Code, Eclipse",
                                "Containere de bază: Docker pentru rulare aplicații în medii izolate"
                        )),
                        new DomainRequirementCategoryDto("Mindset & Adaptabilitate", "Lightbulb", List.of(
                                "Capacitate de învățare rapidă a oricărui limbaj sau tehnologie nouă",
                                "Abordare sistematică de debugging și căutare a cauzei rădăcină (Root Cause Analysis)",
                                "Colaborare eficientă în echipă și comunicare tehnică clară"
                        ))
                ),
                new SeniorityComparisonDto(
                        List.of("Rezolvare probleme algoritmice de nivel easy/medium", "Scriere cod curat și ușor de citit conform ghidurilor", "Utilizare fluentă a Git și colaborare prin Pull Requests", "Dorință demonstrată de învățare prin proiecte personale"),
                        List.of("Autonomie în livrarea de funcționalități complexe end-to-end", "Alegerea structurilor de date optime pentru performanță", "Scriere teste automate și menținerea calității codului", "Design modular al componentelor software"),
                        List.of("Arhitectură de sistem de la zero și evaluare trade-offs", "Identificare și rezolvare bottlenecks majore de performanță", "Definire standarde tehnice și revizuire arhitecturală", "Mentorat tehnic pentru dezvoltatorii din organizație")
                ),
                List.of(
                        new RoadmapStageDto(1, "Fundamente CS & Limbaj la Alegere", "1.5 Luni", List.of("Un limbaj aprofundat (Java/Python/C++)", "Structuri de date & complexitate Big-O", "Rezolvare probleme pe LeetCode/HackerRank")),
                        new RoadmapStageDto(2, "Baze de Date, SQL & Git", "1 Lună", List.of("Baze de date relaționale & interogări SQL", "Git workflow profesional", "Concepte de arhitectură software")),
                        new RoadmapStageDto(3, "Construire Aplicații Practice", "1.5 Luni", List.of("Dezvoltare API RESTful complet", "Unit testing & Mocking", "Dockerizare proiect")),
                        new RoadmapStageDto(4, "Pregătire Interviu Tehnic", "1 Lună", List.of("Probleme de algoritmică sub presiune de timp", "Concepte de bază de System Design", "Prezentare proiecte personale din GitHub"))
                )
        );

        public final String id;
        public final String title;
        public final String tagLine;
        public final String icon;
        public final Pattern titlePattern;
        public final String interviewFormat;
        public final Map<String, String> salaryBenchmarks;
        public final List<DomainRequirementCategoryDto> requirements;
        public final SeniorityComparisonDto seniority;
        public final List<RoadmapStageDto> roadmap;

        DomainCategory(String id, String title, String tagLine, String icon, Pattern titlePattern,
                       String interviewFormat, Map<String, String> salaryBenchmarks,
                       List<DomainRequirementCategoryDto> requirements, SeniorityComparisonDto seniority,
                       List<RoadmapStageDto> roadmap) {
            this.id = id;
            this.title = title;
            this.tagLine = tagLine;
            this.icon = icon;
            this.titlePattern = titlePattern;
            this.interviewFormat = interviewFormat;
            this.salaryBenchmarks = salaryBenchmarks;
            this.requirements = requirements;
            this.seniority = seniority;
            this.roadmap = roadmap;
        }

        public String getSalaryEstimate(String level) {
            String lvlKey = (level != null && !level.isBlank()) ? level.toUpperCase() : "ALL";
            return salaryBenchmarks.getOrDefault(lvlKey, salaryBenchmarks.getOrDefault("ALL", "Conform Grilă Salarială"));
        }

        public static DomainCategory classify(String title, String desc, List<String> skills) {
            if (title == null) return GENERAL_SOFTWARE;
            String t = title.toLowerCase();

            // Verificare directa pe baza de regex title
            for (DomainCategory cat : values()) {
                if (cat == GENERAL_SOFTWARE) continue;
                if (cat.titlePattern.matcher(t).find()) {
                    return cat;
                }
            }

            // Fallback: verificare pe skills
            if (skills != null && !skills.isEmpty()) {
                String sJoined = String.join(" ", skills).toLowerCase();
                if (sJoined.contains("kubernetes") || sJoined.contains("docker") || sJoined.contains("cloud (aws/azure/gcp)")) return DEVOPS_CLOUD;
                if (sJoined.contains("machine learning") || sJoined.contains("llms")) return AI_DATA_SCIENCE;
                if (sJoined.contains("data pipelines") || sJoined.contains("big data")) return DATA_ENGINEERING;
                if (sJoined.contains("qa") || sJoined.contains("testing")) return QA_AUTOMATION;
                if (sJoined.contains("react") || sJoined.contains("angular") || sJoined.contains("vue")) return FRONTEND;
                if (sJoined.contains("spring") || sJoined.contains("java") || sJoined.contains(".net") || sJoined.contains("c#")) return BACKEND;
                if (sJoined.contains("cybersecurity")) return CYBERSECURITY;
                if (sJoined.contains("c++ / embedded")) return EMBEDDED_SYSTEMS;
                if (sJoined.contains("android") || sJoined.contains("ios")) return MOBILE;
                if (sJoined.contains("it support") || sJoined.contains("active directory")) return IT_SUPPORT_SYSADMIN;
                if (sJoined.contains("business analysis") || sJoined.contains("agile")) return PRODUCT_BUSINESS_ANALYST;
            }

            return GENERAL_SOFTWARE;
        }
    }

    private synchronized List<CachedJobListing> getCachedOrFetchJobs(boolean forceRefresh) {
        long now = System.currentTimeMillis();
        List<CachedJobListing> cached = rawJobsCache.get();
        if (!forceRefresh && cached != null && (now - lastCacheTimeMs) < CACHE_TTL_MS) {
            return cached;
        }

        log.info("[MARKET INSIGHTS] Incarcare joburi din PostgreSQL pentru analiza pietei IT...");
        List<CachedJobListing> allJobs = cachedJobListingRepository.findAll();
        rawJobsCache.set(allJobs);
        lastCacheTimeMs = now;
        log.info("[MARKET INSIGHTS] Incarcate cu succes {} joburi pentru analiza statistica.", allJobs.size());
        return allJobs;
    }

    public MarketInsightsResponse getMarketInsights(String levelFilter, String locationFilter, boolean activeOnly, UUID userId) {
        String level = (levelFilter == null || levelFilter.isBlank()) ? "JUNIOR" : levelFilter.toUpperCase().trim();
        String locFilter = (locationFilter == null || locationFilter.isBlank()) ? "RO_ONLY" : locationFilter.toUpperCase().trim();

        List<CachedJobListing> allJobs = getCachedOrFetchJobs(false);

        // 1. Filtrare dupa status activ daca se doreste
        List<CachedJobListing> pool = allJobs;
        if (activeOnly) {
            pool = pool.stream()
                    .filter(j -> "ACTIVE".equalsIgnoreCase(j.getStatus()))
                    .toList();
        }

        // 2. Filtrare dupa Locatie (RO_ONLY, RO_AND_REMOTE, ALL)
        List<CachedJobListing> targetPool = filterJobsByLocation(pool, locFilter);

        long totalAnalyzed = targetPool.size();
        long totalJunior = targetPool.stream().filter(this::isJuniorOrIntern).count();
        long totalMid = targetPool.stream().filter(j -> "MID".equalsIgnoreCase(j.getExperienceLevel())).count();
        long totalSenior = targetPool.stream().filter(j -> "SENIOR".equalsIgnoreCase(j.getExperienceLevel())).count();
        long totalLowComp = targetPool.stream().filter(this::isLowCompetition).count();
        double overallLowCompPct = totalAnalyzed > 0 ? Math.round((totalLowComp * 1000.0) / totalAnalyzed) / 10.0 : 0.0;

        // Preluare skill-uri din CV-ul utilizatorului (daca exista) pentru analiza de match personalizat
        Set<String> userCvSkills = getUserCvSkills(userId);

        // Clasificare joburi pe domenii
        Map<DomainCategory, List<CachedJobListing>> domainMap = new EnumMap<>(DomainCategory.class);
        for (DomainCategory cat : DomainCategory.values()) {
            domainMap.put(cat, new ArrayList<>());
        }

        for (CachedJobListing job : targetPool) {
            List<String> skills = JobNormalizationUtils.extractSkills(job.getJobTitle(), job.getRawDescription());
            DomainCategory category = DomainCategory.classify(job.getJobTitle(), job.getRawDescription(), skills);
            domainMap.get(category).add(job);
        }

        // Calculare statistici per domeniu
        List<MarketDomainDto> domainDtos = new ArrayList<>();
        int maxLevelVolume = 1;

        for (DomainCategory cat : DomainCategory.values()) {
            List<CachedJobListing> domainJobs = domainMap.get(cat);
            int countInLevel = getJobsCountForLevel(domainJobs, level);
            if (countInLevel > maxLevelVolume) {
                maxLevelVolume = countInLevel;
            }
        }

        for (DomainCategory cat : DomainCategory.values()) {
            List<CachedJobListing> domainJobs = domainMap.get(cat);
            int totalDomainJobs = domainJobs.size();
            int juniorCount = (int) domainJobs.stream().filter(this::isJuniorOrIntern).count();
            int midCount = (int) domainJobs.stream().filter(j -> "MID".equalsIgnoreCase(j.getExperienceLevel())).count();
            int seniorCount = (int) domainJobs.stream().filter(j -> "SENIOR".equalsIgnoreCase(j.getExperienceLevel())).count();
            int lowCompCount = (int) domainJobs.stream().filter(this::isLowCompetition).count();
            double lowCompRate = totalDomainJobs > 0 ? Math.round((lowCompCount * 1000.0) / totalDomainJobs) / 10.0 : 0.0;

            int levelJobCount = getJobsCountForLevel(domainJobs, level);

            // Calcul oportunitate (Sweet Spot: pondere intre volum cerere si competitie scazuta)
            int opportunityScore;
            if (levelJobCount == 0) {
                opportunityScore = 15;
            } else {
                double demandFactor = ((double) levelJobCount / maxLevelVolume) * 100.0;
                opportunityScore = (int) Math.round(0.40 * demandFactor + 0.60 * lowCompRate);
                opportunityScore = Math.max(10, Math.min(99, opportunityScore));
            }

            String opportunityBadge;
            if (opportunityScore >= 75) {
                opportunityBadge = "Oportunitate Extremă";
            } else if (opportunityScore >= 60) {
                opportunityBadge = "Oportunitate Mare";
            } else if (opportunityScore >= 45) {
                opportunityBadge = "Echilibrat";
            } else {
                opportunityBadge = "Competitivitate Înaltă";
            }

            String compLevel;
            if (lowCompRate >= 60.0) {
                compLevel = "Scăzută";
            } else if (lowCompRate >= 45.0) {
                compLevel = "Medie";
            } else {
                compLevel = "Ridicată";
            }

            // Top skills pentru domeniu (filtrate pe nivelul selectat, pana la 16 tehnologii)
            List<CachedJobListing> jobsForSkills = filterJobsByLevel(domainJobs, level);
            List<SkillFrequencyDto> rawTopSkills = calculateTopSkills(jobsForSkills, 16);

            // DEDUPLICARE STRICTA PE COMPANIE pentru sampleJobs:
            // Ne asiguram ca NICIODATA nu apar joburi de la aceeasi firma in lista de exemple!
            List<SampleJobDto> sampleJobs = pickDiverseSampleJobs(jobsForSkills, 8);

            // Estimare salariala pentru nivelul curent (pastrata in backend)
            String salaryEst = cat.getSalaryEstimate(level);

            // Match personalizat cu CV-ul utilizatorului pe TOATE cerintele extrase din anunturile reale
            List<String> matchingSkills = new ArrayList<>();
            List<String> missingSkills = new ArrayList<>();
            List<SkillFrequencyDto> topSkills = new ArrayList<>();

            for (SkillFrequencyDto sk : rawTopSkills) {
                boolean hasSkill = hasSkillInCv(userCvSkills, sk.skill());
                topSkills.add(new SkillFrequencyDto(sk.skill(), sk.count(), sk.percentage(), sk.category(), hasSkill));
                if (hasSkill) {
                    matchingSkills.add(sk.skill());
                } else {
                    missingSkills.add(sk.skill());
                }
            }

            int userMatchScore = 0;
            if (!userCvSkills.isEmpty() && !topSkills.isEmpty()) {
                userMatchScore = (int) Math.round(((double) matchingSkills.size() / topSkills.size()) * 100.0);
            }

            domainDtos.add(new MarketDomainDto(
                    cat.id,
                    cat.title,
                    cat.tagLine,
                    cat.icon,
                    totalDomainJobs,
                    juniorCount,
                    midCount,
                    seniorCount,
                    levelJobCount,
                    lowCompCount,
                    lowCompRate,
                    opportunityScore,
                    opportunityBadge,
                    compLevel,
                    salaryEst,
                    cat.interviewFormat,
                    topSkills,
                    cat.requirements,
                    cat.seniority,
                    cat.roadmap,
                    sampleJobs,
                    userMatchScore,
                    matchingSkills,
                    missingSkills
            ));
        }

        // Top Sweet Spots (Scor Oportunitate Descrescator)
        List<MarketDomainDto> topSweetSpots = domainDtos.stream()
                .sorted(Comparator.comparingInt(MarketDomainDto::opportunityScore).reversed())
                .limit(4)
                .toList();

        // Cele mai cautate (Volum joburi pe nivelul selectat descrescator)
        List<MarketDomainDto> mostInDemand = domainDtos.stream()
                .sorted(Comparator.comparingInt(MarketDomainDto::levelJobCount).reversed())
                .limit(4)
                .toList();

        // Cea mai redusa competitie (% joburi low competition descrescator)
        List<MarketDomainDto> lowestCompetition = domainDtos.stream()
                .sorted(Comparator.comparingDouble(MarketDomainDto::lowCompetitionRate).reversed())
                .limit(4)
                .toList();

        // Universal top skills pe intreg pool-ul filtrat (pana la 24 tehnologii reale)
        List<SkillFrequencyDto> universalSkills = calculateTopSkills(filterJobsByLevel(targetPool, level), 24);

        return new MarketInsightsResponse(
                totalAnalyzed,
                totalJunior,
                totalMid,
                totalSenior,
                totalLowComp,
                overallLowCompPct,
                level,
                locFilter,
                topSweetSpots,
                mostInDemand,
                lowestCompetition,
                domainDtos,
                universalSkills
        );
    }

    public MarketDomainDto getDomainDetails(String domainId, String levelFilter, String locationFilter, UUID userId) {
        MarketInsightsResponse insights = getMarketInsights(levelFilter, locationFilter, false, userId);
        return insights.domains().stream()
                .filter(d -> d.id().equalsIgnoreCase(domainId))
                .findFirst()
                .orElse(insights.domains().get(0));
    }

    private List<SampleJobDto> pickDiverseSampleJobs(List<CachedJobListing> jobs, int limit) {
        if (jobs == null || jobs.isEmpty()) return Collections.emptyList();

        Set<String> seenCompanies = new HashSet<>();
        List<SampleJobDto> diverse = new ArrayList<>();
        List<CachedJobListing> overflow = new ArrayList<>();

        for (CachedJobListing j : jobs) {
            if (j.getJobTitle() == null || j.getJobTitle().isBlank()) continue;
            String comp = normalizeCompanyName(j.getCompanyName());
            if (!comp.isEmpty() && seenCompanies.add(comp)) {
                diverse.add(toSampleJobDto(j));
                if (diverse.size() >= limit) break;
            } else {
                overflow.add(j);
            }
        }

        // Daca nu am gasit suficiente companii distincte, completam pana la minim 4 sau limita
        if (diverse.size() < 4 && !overflow.isEmpty()) {
            for (CachedJobListing ov : overflow) {
                diverse.add(toSampleJobDto(ov));
                if (diverse.size() >= Math.min(4, limit)) break;
            }
        }

        return diverse;
    }

    private String normalizeCompanyName(String name) {
        if (name == null) return "";
        return name.toLowerCase()
                .replaceAll("(?i)\\b(srl|sa|romania|gmbh|inc|ltd|solutions|technologies|group)\\b", "")
                .replaceAll("[^a-z0-9]", "")
                .trim();
    }

    private boolean isRomaniaJob(CachedJobListing j) {
        if (j == null) return false;
        String loc = j.getLocation() != null ? j.getLocation().toLowerCase() : "";
        String platform = j.getSourcePlatform() != null ? j.getSourcePlatform().toUpperCase() : "";

        // Platforme 100% romanesti
        if (Set.of("DEVJOB_RO", "STAGIIPEBUNE", "JUNIORS_RO", "UNDELUCRAM", "EJOBS", "HIPO", "BESTJOBS").contains(platform)) {
            return true;
        }

        // Orase si regiuni din Romania
        return loc.contains("romania") || loc.contains("românia") || loc.contains("bucur") || loc.contains("bucharest")
                || loc.contains("cluj") || loc.contains("timis") || loc.contains("iasi") || loc.contains("iași")
                || loc.contains("brasov") || loc.contains("brașov") || loc.contains("sibiu") || loc.contains("craiova")
                || loc.contains("oradea") || loc.contains("constant") || loc.contains("galati") || loc.contains("galați")
                || loc.contains("ploiesti") || loc.contains("ploiești") || loc.contains("pitesti") || loc.contains("pitești")
                || loc.contains("mures") || loc.contains("mureș") || loc.contains("suceava") || loc.contains("arad")
                || loc.contains("bacau") || loc.contains("bacău") || loc.contains("baia mare");
    }

    private boolean isBucharestJob(CachedJobListing j) {
        if (j == null) return false;
        String loc = j.getLocation() != null ? j.getLocation().toLowerCase() : "";
        return loc.contains("bucur") || loc.contains("bucharest") || loc.contains("ilfov") || loc.contains("otopeni") || loc.contains("voluntari");
    }

    private boolean isRemoteJob(CachedJobListing j) {
        if (j == null) return false;
        String loc = j.getLocation() != null ? j.getLocation().toLowerCase() : "";
        String wm = j.getWorkModel() != null ? j.getWorkModel().toUpperCase() : "";
        return wm.contains("REMOTE") || loc.contains("remote");
    }

    private List<CachedJobListing> filterJobsByLocation(List<CachedJobListing> jobs, String locFilter) {
        if ("BUCURESTI".equalsIgnoreCase(locFilter) || "BUCHAREST".equalsIgnoreCase(locFilter)) {
            return jobs.stream().filter(this::isBucharestJob).toList();
        } else if ("RO_ONLY".equalsIgnoreCase(locFilter)) {
            return jobs.stream().filter(this::isRomaniaJob).toList();
        } else if ("RO_AND_REMOTE".equalsIgnoreCase(locFilter)) {
            return jobs.stream().filter(j -> isRomaniaJob(j) || isRemoteJob(j)).toList();
        }
        return jobs;
    }

    private boolean isJuniorOrIntern(CachedJobListing j) {
        if (j.getExperienceLevel() == null) return false;
        String lvl = j.getExperienceLevel().toUpperCase();
        return "JUNIOR".equals(lvl) || "INTERNSHIP".equals(lvl);
    }

    private boolean isLowCompetition(CachedJobListing j) {
        if (j.getCompetitiveness() != null && "LOW".equalsIgnoreCase(j.getCompetitiveness())) {
            return true;
        }
        if (j.getApplicantCountText() != null) {
            String act = j.getApplicantCountText().toLowerCase();
            return act.contains("fii printre") || act.contains("early") || act.contains("sub 10") || act.contains("fewer than 10") || act.contains("sub 25");
        }
        return false;
    }

    private int getJobsCountForLevel(List<CachedJobListing> jobs, String level) {
        if ("ALL".equalsIgnoreCase(level)) {
            return jobs.size();
        } else if ("JUNIOR".equalsIgnoreCase(level)) {
            return (int) jobs.stream().filter(this::isJuniorOrIntern).count();
        } else if ("MID".equalsIgnoreCase(level)) {
            return (int) jobs.stream().filter(j -> "MID".equalsIgnoreCase(j.getExperienceLevel())).count();
        } else if ("SENIOR".equalsIgnoreCase(level)) {
            return (int) jobs.stream().filter(j -> "SENIOR".equalsIgnoreCase(j.getExperienceLevel())).count();
        }
        return jobs.size();
    }

    private List<CachedJobListing> filterJobsByLevel(List<CachedJobListing> jobs, String level) {
        if ("ALL".equalsIgnoreCase(level)) {
            return jobs;
        } else if ("JUNIOR".equalsIgnoreCase(level)) {
            return jobs.stream().filter(this::isJuniorOrIntern).toList();
        } else if ("MID".equalsIgnoreCase(level)) {
            return jobs.stream().filter(j -> "MID".equalsIgnoreCase(j.getExperienceLevel())).toList();
        } else if ("SENIOR".equalsIgnoreCase(level)) {
            return jobs.stream().filter(j -> "SENIOR".equalsIgnoreCase(j.getExperienceLevel())).toList();
        }
        return jobs;
    }

    private List<SkillFrequencyDto> calculateTopSkills(List<CachedJobListing> jobs, int limit) {
        if (jobs.isEmpty()) return Collections.emptyList();
        int total = jobs.size();
        Map<String, Integer> freqMap = new HashMap<>();

        for (CachedJobListing job : jobs) {
            // Extragere din titlu + descriere folosind dictionarul granular de tehnologii reale
            List<String> extracted = JobNormalizationUtils.extractSkills(job.getJobTitle(), job.getRawDescription());
            Set<String> uniquePerJob = new HashSet<>(extracted);
            for (String clean : uniquePerJob) {
                if (!clean.equalsIgnoreCase("Software Engineering") && clean.length() > 1) {
                    freqMap.merge(clean, 1, Integer::sum);
                }
            }
        }

        return freqMap.entrySet().stream()
                .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
                .limit(limit)
                .map(e -> {
                    double pct = Math.round((e.getValue() * 1000.0) / total) / 10.0;
                    String category = JobNormalizationUtils.getSkillCategory(e.getKey());
                    return new SkillFrequencyDto(e.getKey(), e.getValue(), pct, category, false);
                })
                .toList();
    }

    private Set<String> getUserCvSkills(UUID userId) {
        if (userId == null) return Collections.emptySet();
        try {
            Optional<CvProfile> profileOpt = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                    .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));
            if (profileOpt.isEmpty()) return Collections.emptySet();

            CvProfile p = profileOpt.get();
            Set<String> set = new HashSet<>();
            addSkillsToSet(set, p.getSkillsLanguages());
            addSkillsToSet(set, p.getSkillsFrameworks());
            addSkillsToSet(set, p.getSkillsDatabases());
            addSkillsToSet(set, p.getSkillsDevops());

            // De asemenea, extragem si competente mentionate in summary sau experienta
            if (p.getSummary() != null && !p.getSummary().isBlank()) {
                List<String> sumSkills = JobNormalizationUtils.extractSkills("", p.getSummary());
                for (String sk : sumSkills) set.add(sk.toLowerCase().trim());
            }
            if (p.getProjectsJson() != null && !p.getProjectsJson().isBlank()) {
                List<String> projSkills = JobNormalizationUtils.extractSkills("", p.getProjectsJson());
                for (String sk : projSkills) set.add(sk.toLowerCase().trim());
            }
            if (p.getWorkExperienceJson() != null && !p.getWorkExperienceJson().isBlank()) {
                List<String> expSkills = JobNormalizationUtils.extractSkills("", p.getWorkExperienceJson());
                for (String sk : expSkills) set.add(sk.toLowerCase().trim());
            }

            return set;
        } catch (Exception e) {
            log.warn("[MARKET INSIGHTS] Eroare la preluarea CV-ului utilizatorului {}: {}", userId, e.getMessage());
            return Collections.emptySet();
        }
    }

    private void addSkillsToSet(Set<String> set, String raw) {
        if (raw == null || raw.isBlank()) return;
        String[] tokens = raw.split("[,;\\n/|]");
        for (String t : tokens) {
            String s = t.trim().toLowerCase();
            if (!s.isEmpty()) {
                set.add(s);
            }
        }
    }

    public boolean hasSkillInCv(Set<String> userSkills, String skillName) {
        if (userSkills == null || userSkills.isEmpty() || skillName == null || skillName.isBlank()) {
            return false;
        }
        String cleanSkill = skillName.toLowerCase().trim();
        List<String> synonyms = JobNormalizationUtils.expandTechSynonyms(cleanSkill);

        for (String userRaw : userSkills) {
            String u = userRaw.toLowerCase().trim();
            if (u.isEmpty()) continue;

            // Potrivire exacta
            if (u.equals(cleanSkill)) return true;

            // Verificare sinonime extinse
            for (String syn : synonyms) {
                if (u.equals(syn)) return true;
                if (syn.length() > 3 && (u.contains(syn) || syn.contains(u))) return true;
            }

            // Tehnologii specifice uzuale
            if (cleanSkill.contains("git") && (u.contains("git") || u.contains("github") || u.contains("gitlab"))) return true;
            if (cleanSkill.contains("sql") && (u.contains("sql") || u.contains("postgres") || u.contains("mysql"))) return true;
            if (cleanSkill.contains("docker") && u.contains("docker")) return true;
            if (cleanSkill.contains("linux") && u.contains("linux")) return true;
            if (cleanSkill.contains("rest") && (u.contains("rest") || u.contains("api"))) return true;
            if (cleanSkill.contains("python") && u.contains("python")) return true;
            if (cleanSkill.contains("java") && !cleanSkill.contains("javascript") && u.equals("java")) return true;
            if (cleanSkill.contains("javascript") && (u.contains("javascript") || u.equals("js"))) return true;
            if (cleanSkill.contains("typescript") && (u.contains("typescript") || u.equals("ts"))) return true;
            if (cleanSkill.contains("react") && u.contains("react")) return true;
            if (cleanSkill.contains("spring") && u.contains("spring")) return true;
            if (cleanSkill.contains("c++") && (u.contains("c++") || u.contains("cpp"))) return true;
            if (cleanSkill.contains("c#") && (u.contains("c#") || u.contains("csharp") || u.contains(".net"))) return true;
            if (cleanSkill.contains("aws") && (u.contains("aws") || u.contains("amazon web services"))) return true;
            if (cleanSkill.contains("azure") && u.contains("azure")) return true;
            if (cleanSkill.contains("kubernetes") && (u.contains("kubernetes") || u.contains("k8s"))) return true;
            if (cleanSkill.contains("ci/cd") && (u.contains("ci/cd") || u.contains("github actions") || u.contains("jenkins") || u.contains("gitlab ci"))) return true;
            if (cleanSkill.contains("oop") && (u.contains("oop") || u.contains("object oriented") || u.contains("clean code") || u.contains("solid"))) return true;
            if (cleanSkill.contains("testing") || cleanSkill.contains("qa")) {
                if (u.contains("junit") || u.contains("mockito") || u.contains("jest") || u.contains("selenium") || u.contains("cypress") || u.contains("test")) return true;
            }
            if (cleanSkill.contains("pandas") || cleanSkill.contains("numpy")) {
                if (u.contains("pandas") || u.contains("numpy")) return true;
            }

            // Substring doar pentru cuvinte de minim 4 caractere (evita fals pozitiv pe 'c', 'go', 'r')
            if (u.length() >= 4 && cleanSkill.length() >= 4) {
                if (u.contains(cleanSkill) || cleanSkill.contains(u)) {
                    return true;
                }
            }
        }
        return false;
    }

    private SampleJobDto toSampleJobDto(CachedJobListing j) {
        return new SampleJobDto(
                j.getId(),
                j.getJobTitle(),
                j.getCompanyName(),
                j.getLocation() != null ? j.getLocation() : "România / Remote",
                j.getWorkModel() != null ? j.getWorkModel() : "HYBRID",
                j.getExperienceLevel() != null ? j.getExperienceLevel() : "JUNIOR",
                j.getCompetitiveness() != null ? j.getCompetitiveness() : "LOW",
                j.getSalaryRange() != null && !j.getSalaryRange().isBlank() ? j.getSalaryRange() : "Confidențial",
                j.getDirectApplyUrl(),
                j.getSourcePlatform() != null ? j.getSourcePlatform() : "LINKEDIN"
        );
    }
}
