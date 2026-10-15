# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Job-application tracker ("JobFlow AI"): a Spring Boot 3.3 / Java 21 backend (`src/main`, package `com.jobtracker.ats`) plus a React 18 + Vite + Tailwind SPA (`frontend/`). PostgreSQL 16 with `pgvector`. The UI text, code comments, log messages and commit messages are written in Romanian; keep new ones consistent with the surrounding code.

## Commands

Backend (Maven, run from repo root):
- `docker compose up -d postgres` — start only the DB (`pgvector/pgvector:pg16`, `ats_db` / `ats_user` / `ats_password` on 5432). `docker compose up -d` also builds and starts backend (8080) and frontend (nginx on 3000).
- `mvn spring-boot:run` — run the API; Flyway migrates the schema on startup. Swagger UI: http://localhost:8080/swagger-ui.html
- `mvn clean test` — what CI runs (`.github/workflows/ci.yml`, on push/PR to main/master).
- `mvn test -Dtest=JobIngestionServiceTest` / `mvn test -Dtest=JobIngestionServiceTest#methodName` — single class / method.
- `mvn package -DskipTests` — build the jar (as the Dockerfile does).

Frontend (from `frontend/`): `npm install`, `npm run dev` (port 3000, proxies `/api` → `localhost:8080`), `npm run build`. There is no lint or test setup for the frontend.

`requests.http` holds sample API calls. `src/Main.java` is an unused IntelliJ stub.

## Configuration

- `AtsJobTrackerApplication.main` loads a `.env` file (dotenv-java) into system properties before Spring starts; see `.env.example`.
- LLM calls go to **Groq** (OpenAI-compatible endpoint) through `service/OpenAiLlmService`, a hand-written `RestClient` wrapper — not Spring AI's ChatClient, despite the Spring AI dependency. Key: `SPRING_AI_GROQ_API_KEY`, model: `SPRING_AI_GROQ_MODEL`. It falls back through a hardcoded list of Groq models on failure and strips `<think>` tags. `isConfigured()` returns false for blank keys or keys containing "dummy"; AI-backed services check it and fall back to deterministic/heuristic output, so the app runs without a key.
- `VectorEmbeddingService` does not call an embedding model: it builds a 384-dim hashed bag-of-words vector locally.
- `spring.jpa.hibernate.ddl-auto: validate` — every entity change needs a new Flyway migration in `src/main/resources/db/migration` (`V{n}__description.sql`, next number after the highest existing one). Never edit an applied migration.

## Backend architecture

Layered: `controller` (REST under `/api/v1/...`) → `service` → `repository` (Spring Data JPA) → `entity`. DTOs in `dto/` (and sub-packages per feature) are Java records. Errors are mapped to RFC-7807 `ProblemDetail` in `exception/GlobalExceptionHandler`.

Cross-cutting pieces that span several files:
- **Security**: `SecurityConfig` is stateless JWT (`security/JwtService`, `AuthService`), but `/api/v1/**` is currently `permitAll`, so endpoints are effectively open. User scoping comes from an `X-User-Id` (UUID) request header that controllers read and the frontend sends, not from the JWT. A demo user is seeded by `V2__seed_demo_user.sql`.
- **Async AI gap analysis**: `ApplicationService` publishes `ApplicationCreatedEvent`; `event/ApplicationEventListener` handles it `@Async("asyncExecutor")` + `@TransactionalEventListener(AFTER_COMMIT)` and calls `AiGapAnalysisService`. Executor is in `config/AsyncConfig`.
- **Resume parsing**: `TextExtractionService` (Apache Tika; Docker image adds Tesseract OCR for scanned PDFs) → `DeterministicResumeParserService` / `CvProfileService` for structured CV profiles (multiple per user).
- **Job aggregation pipeline**: `crawler/` holds one `JobScraper` implementation per Romanian job board (Strategy pattern; Spring injects all of them as `List<JobScraper>`). `JobScraperOrchestrator.scrapeAll` runs them concurrently on virtual threads with a per-scraper 90 s timeout, keeps partial results, and dedups cross-platform via `JobNormalizationUtils.normalizeForDedup`. `JobSearchAggregatorService` drives it (on startup and hourly via `@Scheduled`), passing known URLs for differential crawling; `JobIngestionService` writes to `jobs_staging`, upserts `cached_live_jobs`, and records field changes in `job_changes`. To add a source: implement `JobScraper` as a Spring bean; to drop one, add it to `JobNormalizationUtils.REMOVED_PLATFORMS` (purged on refresh).
- **ATS scoring**: `JobAtsMatchEngine` computes CV↔job match/pillar breakdowns used by search, market insights and the CV studio.
- **Agents** (`agent/`): prompt-driven LLM helpers (recruiter, resume tailor, interview simulator) built on `OpenAiLlmService`.
- **Scheduled jobs**: `@EnableScheduling` on the main class; daily digest emails (`DailyJobDigestService`, 09:00), roadmap reminders (`SkillRoadmapService`), hourly job refresh. Mail uses `spring.mail.*` (`SPRING_MAIL_*` env vars); Gmail IMAP sync lives in `GmailSyncService` / `EmailParserService`.

Tests are plain JUnit 5 + Mockito unit tests (`@ExtendWith(MockitoExtension.class)`) — no Spring context or DB needed, even though CI provisions Postgres.

## Frontend architecture

- No router library: `App.jsx` keeps an `activeTab` state, derived on load from `window.location.pathname` / hash / `localStorage` (`ats_active_tab`), and renders one page component per tab (`TAB_METADATA` lists them). Adding a page means adding a tab key, its metadata, path matching in `getInitialTab`, and a Navbar entry.
- JWT is stored in `localStorage` as `ats_jwt_token` and handled in `App.jsx`.
- **`lucide-react` is aliased** in `vite.config.js` to `src/components/animated-icons/lucide-proxy.jsx`, which wraps every Lucide icon with Framer Motion hover animations and substitutes custom animated icons from `animated-icons/index.js`. Import icons from `'lucide-react'` as usual; a new custom animated icon must be exported from that `index.js`.
- Static content (interview flashcard decks, roadmap tracks, HR questions) lives in `src/data/`.
- In Docker, nginx (`frontend/nginx.conf`) serves the SPA and proxies `/api` to `backend:8080` with 300 s timeouts (LLM calls are slow).
