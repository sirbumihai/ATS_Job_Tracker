# 🚀 JobFlow AI — Job Tracker & ATS Matcher

![Java 21](https://img.shields.io/badge/Java-21-orange.svg)
![Spring Boot 3.3](https://img.shields.io/badge/Spring%20Boot-3.3.2-brightgreen.svg)
![React 18](https://img.shields.io/badge/React-18-61dafb.svg)
![PostgreSQL 16](https://img.shields.io/badge/PostgreSQL-16%20%2B%20pgvector-blue.svg)
![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

> Platformă full-stack pentru candidații IT din România: agregă joburi de pe principalele site-uri de recrutare, calculează un scor ATS realist între CV și anunț, urmărește aplicațiile într-un Kanban și oferă unelte AI pentru CV, scrisori de intenție, LinkedIn, outreach și pregătirea interviurilor.

---

## ✨ Funcționalități

**Căutare și piață**
* **Agregator de joburi multi-platformă** — scrapere pentru LinkedIn, eJobs, BestJobs, Hipo, DevJob.ro, Juniors.ro, UndeLucram, StagiiPeBune și listele GitHub cu joburi tech pentru juniori. Rulează în paralel pe Virtual Threads (Java 21), cu timeout per platformă, deduplicare între site-uri și crawling diferențial. Refresh automat la pornire și apoi la fiecare oră.
* **Istoric de modificări pe joburi** — anunțurile trec printr-o tabelă de staging; schimbările de câmpuri sunt salvate, iar joburile vechi sunt marcate ca expirate.
* **Market Insights** — cerințele reale ale pieței grupate pe domenii, cu frecvența skill-urilor și match-ul cu CV-ul tău.
* **Daily Job Digest** — selecție zilnică (09:00) de joburi filtrate după scor, locație și nivel junior, trimisă pe Discord sau Telegram (canalul de email e deocamdată doar simulat).

**Aplicații și analiză**
* **Tracker Kanban** — pipeline de aplicații cu status, notițe, CV asociat, vizualizare calendar și dashboard de statistici.
* **Scor ATS realist** (`JobAtsMatchEngine`) — evaluare pe piloni (hard skills, similaritate semantică, experiență), cu penalizare pentru roluri mid/senior când profilul e junior.
* **AI Gap Analysis asincron** — la crearea unei aplicații, un eveniment procesat `@Async` după commit generează raportul de gap și planul de acțiune, fără să blocheze request-ul HTTP.
* **Career Analytics** — funnel de conversie cu diagnostic, plus gamificare (quest-uri săptămânale, badge-uri).
* **Sincronizare Gmail** — citește inbox-ul prin IMAP și actualizează automat statusul aplicațiilor (respingere, interviu, ofertă). Clasificarea e deterministă, iar AI-ul e folosit doar pentru un număr limitat de emailuri ambigue.

**Documente și branding**
* **Bibliotecă de CV-uri** — upload PDF/DOCX cu extragere de text prin Apache Tika (+ Tesseract OCR în Docker pentru PDF-uri scanate), parsare deterministă în profil structurat, mai multe CV-uri per utilizator, CV principal.
* **CV Studio** — editor vizual, optimizare/tailoring pe un job anume, rescriere de bullet-uri și export PDF.
* **Generator de scrisori de intenție** personalizat pe cerințele jobului.
* **LinkedIn Optimizer** — import din PDF-ul exportat de LinkedIn, scor de profil pe 6 dimensiuni, headline-uri propuse, query-uri booleene de recruiter și sincronizare cu CV-ul.
* **Outreach CRM** — mesaje de contact pentru recruiteri (sub limita de 300 de caractere a LinkedIn) și cadență de follow-up.
* **GitHub README Studio** — generator de profil README pentru GitHub.

**Pregătire și comunitate**
* **Skill Roadmap** — trasee de învățare pe skill-uri, cu proiect capstone care poate fi adăugat direct în CV.
* **Pregătire interviuri** — flashcard-uri tip Anki (Java, Spring, SQL, React, Python, System Design, DevOps, Cloud, ML/AI, Testing, Design Patterns) și întrebări HR.
* **Feedback & Roadmap comunitar** — trimitere de feedback și idei votate de utilizatori.

---

## 🏗️ Arhitectură

```mermaid
graph TD
    UI[React SPA / Vite + Tailwind] -->|/api proxy| Controller[REST Controllers /api/v1]
    Controller --> Service[Servicii]
    Service --> Repo[Spring Data JPA]
    Repo --> DB[(PostgreSQL 16 + pgvector)]

    subgraph Agregare joburi
        Scheduler[@Scheduled hourly] --> Orchestrator[JobScraperOrchestrator - Virtual Threads]
        Orchestrator --> Scrapers[Scrapere per platformă]
        Orchestrator --> Ingestion[JobIngestionService: staging + changes]
        Ingestion --> DB
    end

    subgraph Procesare asincronă
        Service -->|ApplicationCreatedEvent| Listener[@Async AFTER_COMMIT]
        Listener --> Gap[AiGapAnalysisService]
    end

    Service --> LLM[Groq API - OpenAI compatibil]
    Service --> Tika[Apache Tika + OCR]
    Service --> Mail[IMAP Gmail / SMTP / Discord / Telegram]
```

* **Backend:** arhitectură pe straturi Controller → Service → Repository, DTO-uri ca Java records, erori standardizate RFC-7807 (`ProblemDetail`), schema gestionată de Flyway.
* **LLM:** apelurile merg la Groq (endpoint compatibil OpenAI), cu fallback automat între mai multe modele. Fără cheie API, aplicația funcționează în continuare cu rezultate deterministe/euristice.
* **Similaritate semantică:** vectori de 384 de dimensiuni stocați în `pgvector` și comparați cu operatorul de cosine distance (`<=>`). Embedding-urile sunt calculate local (hashing pe cuvinte), fără model extern.
* **Frontend:** React 18 + Vite + Tailwind + Framer Motion; iconițele `lucide-react` sunt animate printr-un proxy configurat în `vite.config.js`. În Docker, nginx servește SPA-ul și face proxy pe `/api` către backend.

---

## 🛠️ Stack tehnologic

* **Backend:** Java 21, Spring Boot 3.3.2, Spring Security + JWT, Spring Mail, Lombok
* **Persistență:** Spring Data JPA, Hibernate 6, PostgreSQL 16, `pgvector`, Flyway
* **AI și parsare:** Groq API, Apache Tika 2.9.2, Tesseract OCR, Jsoup
* **Frontend:** React 18, Vite 6, Tailwind CSS, Framer Motion, Axios, html2pdf.js
* **Testare și tooling:** JUnit 5, Mockito, Docker Compose, GitHub Actions, SpringDoc OpenAPI

---

## 🚦 Rulare locală

### Prerechizite
* Java 21 JDK, Maven
* Node.js 20+ (pentru frontend)
* Docker

### Configurare
```bash
cp .env.example .env
```
Completează în `.env` cheia `SPRING_AI_GROQ_API_KEY` pentru funcționalitățile AI (opțional). Pentru notificările pe email (feedback) setează `SPRING_MAIL_USERNAME` / `SPRING_MAIL_PASSWORD`.

### Varianta 1 — totul în Docker
```bash
docker compose up -d --build
```
* Frontend: http://localhost:3000
* Backend: http://localhost:8080

### Varianta 2 — dezvoltare
```bash
# Baza de date
docker compose up -d postgres

# Backend (Flyway creează schema și utilizatorul demo)
mvn spring-boot:run

# Frontend (port 3000, proxy /api -> localhost:8080)
cd frontend
npm install
npm run dev
```

---

## 📖 API

Documentația interactivă e disponibilă în Swagger UI: **http://localhost:8080/swagger-ui.html**. Exemple de request-uri se găsesc în `requests.http`.

| Prefix | Descriere |
|---|---|
| `/api/v1/auth` | Înregistrare și login (JWT) |
| `/api/v1/applications` | Aplicații Kanban: status, notițe, CV asociat |
| `/api/v1/applications/{id}/analysis`, `/api/v1/ai/*` | Gap analysis, diagnostic ATS, rescriere bullet-uri, match job |
| `/api/v1/jobs` | Căutare agregată, detalii, istoric modificări, salvare în Kanban, sincronizare live, status crawlere |
| `/api/v1/resumes`, `/api/v1/cv` | Upload CV-uri și profiluri CV structurate |
| `/api/v1/cover-letter`, `/api/v1/github-readme` | Generatoare de documente |
| `/api/v1/linkedin` | Import PDF și optimizare profil LinkedIn |
| `/api/v1/outreach` | Mesaje și cadență de outreach |
| `/api/v1/market-insights` | Statistici de piață pe domenii |
| `/api/v1/career` | Analytics și gamificare |
| `/api/v1/roadmap` | Roadmap-uri de skill-uri |
| `/api/v1/digest` | Setări, preview și trimitere digest zilnic |
| `/api/v1/integrations/gmail` | Sincronizare Gmail |
| `/api/v1/feedback` | Feedback și idei comunitare |

---

## 🧪 Teste

```bash
mvn clean test                                  # toate testele (rulează și în CI)
mvn test -Dtest=JobAtsMatchEngineTest           # o singură clasă
```
Testele sunt unit tests JUnit 5 + Mockito și nu au nevoie de baza de date. Pipeline-ul GitHub Actions rulează la fiecare push și pull request pe `main`.

---

## 👤 Autor
**Alexandru Sîrbu** — *Junior Backend Developer*
* GitHub: [@sirbumihai](https://github.com/sirbumihai)
* LinkedIn: [sirbu-mihai](https://www.linkedin.com/in/sirbu-mihai-86133b181/)
