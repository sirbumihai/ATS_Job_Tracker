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

Frontend (from `frontend/`): `npm install`, `npm run dev` (port 3000, proxies `/api` → `localhost:8080`), `npm run build`, `npm run test:e2e` (Playwright, Chromium only; first time `npx playwright install chromium`). The e2e tests in `frontend/e2e/` start Vite on port 4317 and answer every `/api` call from `e2e/fixtures/*.json` (`e2e/support/mockApi.js`), so no backend or DB is needed; an `/api` call without a fixture or any console error fails the test. CI runs them in the `frontend-e2e` job. There is no lint setup for the frontend.

Frontend test commands (from `frontend/`): `npx playwright test e2e/cv-library.spec.js` (one file), `npx playwright test -g "text"` (by test name), `npx playwright test e2e/app-wide.spec.js` (global checks). Every page has its own `e2e/<page>.spec.js`; new `/api` endpoints need a route in `e2e/support/mockApi.js` (+ a fixture). `e2e/app-wide.spec.js` reads `TAB_METADATA` from `App.jsx` and, for the landing and every tab, checks no emoji in visible text, no horizontal scroll at 375px and visible content under `prefers-reduced-motion`, so a new tab is covered automatically (it needs a `targetPath` in `handleTabChange`). Helpers: `e2e/support/checks.js` (`expectNoEmoji`, `expectNoHorizontalScroll`, `expectContentVisible`).

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
- **Job aggregation pipeline**: `crawler/` holds one `JobScraper` implementation per Romanian job board (Strategy pattern; Spring injects all of them as `List<JobScraper>`). `JobScraperOrchestrator.scrapeAll` runs them concurrently on virtual threads and waits for every scraper with no overall time limit (each HTTP request has its own timeout), keeps partial results when a scraper throws, and dedups cross-platform via `JobNormalizationUtils.normalizeForDedup`. `JobSearchAggregatorService` drives it (on startup and hourly via `@Scheduled`), passing known URLs for differential crawling; `JobIngestionService` writes to `jobs_staging`, upserts `cached_live_jobs`, and records field changes in `job_changes`. To add a source: implement `JobScraper` as a Spring bean; to drop one, add it to `JobNormalizationUtils.REMOVED_PLATFORMS` (purged on refresh). To switch one off without deleting it, list it in `app.crawler.disabled-platforms` (env `CRAWLER_DISABLED_PLATFORMS`).
- **Scraper conventions**: fetch through `PageFetcher` (`fetchAllHtml` downloads a URL list in parallel, at most 4 requests per site, and returns pages in list order so dedup stays deterministic) and keep parsing in a separate package-private method (`parsePage` / `parseFeed` / `parseResultsPage`) that takes a Jsoup `Document`, so it can be tested against fixtures in `src/test/resources/crawler/<platform>/`. Build DTOs with `JobListingBuilder` and dedup through `ScrapeContext.claim`. Never fill in data the source doesn't publish: unknown company/location/salary use the `UNKNOWN_*` constants, logo and applicant count stay `null`, `atsMatchScore` stays 0 (it's computed per CV at search time), and IDs come from the source or `stableId(url)`, never a random UUID.
- **LinkedIn rate limit**: the guest search API allows a burst of about 15 requests, then answers HTTP 429 to roughly one request in 6-8 even at 0.5-1 requests/s, and more often above that (measured November 2026). `LinkedInScraper` runs one virtual thread per query and shares a `RequestThrottle`: max 4 in flight, burst at the start, then about one request per 0.85-1 s; a 429 pauses all threads ~2 s and the page is retried; only consecutive 429s slow the pace further. A full first crawl (empty DB) took 110-150 s in live runs and hourly runs are shorter. LinkedIn's limit, not the thread count, is the bottleneck: more parallelism does not make it faster, fewer requests do.
- **ATS scoring**: `JobAtsMatchEngine` computes CV↔job match/pillar breakdowns used by search, market insights and the CV studio.
- **Agents** (`agent/`): prompt-driven LLM helpers (recruiter, resume tailor, interview simulator) built on `OpenAiLlmService`.
- **Scheduled jobs**: `@EnableScheduling` on the main class; daily digest emails (`DailyJobDigestService`, 09:00), roadmap reminders (`SkillRoadmapService`), hourly job refresh. Mail uses `spring.mail.*` (`SPRING_MAIL_*` env vars); Gmail IMAP sync lives in `GmailSyncService` / `EmailParserService`.

Tests are plain JUnit 5 + Mockito unit tests (`@ExtendWith(MockitoExtension.class)`) — no Spring context or DB needed, even though CI provisions Postgres.

## Frontend architecture

- No router library: `App.jsx` keeps an `activeTab` state, derived on load from `window.location.pathname` / hash / `localStorage` (`ats_active_tab`), and renders one page component per tab (`TAB_METADATA` lists them). Adding a page means adding a tab key, its metadata, path matching in `getInitialTab`, and a Navbar entry.
- JWT is stored in `localStorage` as `ats_jwt_token` and handled in `App.jsx`.
- **`lucide-react` is aliased** in `vite.config.js` to `src/components/animated-icons/lucide-proxy.jsx`, which wraps every Lucide icon with Framer Motion hover animations and substitutes custom animated icons from `animated-icons/index.js`. Import icons from `'lucide-react'` as usual; a new custom animated icon must be exported from that `index.js`.
- Static content (interview flashcard decks, roadmap tracks, HR questions) lives in `src/data/`.
- **Shared UI primitives** live in `src/components/ui/`: `Card` (single thin border, marks itself with `data-card`; never nest cards), `PageHeader`, `Modal` (portal, Escape/backdrop close, scroll lock — use it for every dialog), `ScoreRing`, `ScoreBar`, `BrandMark`. App pages get only the palette (`brand-500` accent), Lora headings (`font-serif`) and these primitives; they stay compact with sans text. Light mode only: do not add `dark:` classes. No emoji anywhere — use Lucide icons where an icon has a role. Long explanations go behind `<details>`.
- **Lenis smooth scroll** runs only on the landing (`components/landing/lenis.jsx`); it is stopped when leaving the landing and disabled under `prefers-reduced-motion`. The landing's scroll animations and parallax live in `components/landing/` and must render fully static with reduced motion.
- `src/data/` files (HR playbook, role tracks, flashcard decks) are static content kept without diacritics by convention; page chrome around them uses diacritics.
- In Docker, nginx (`frontend/nginx.conf`) serves the SPA and proxies `/api` to `backend:8080` with 300 s timeouts (LLM calls are slow).

## Agent skills

### Issue tracker

Issues live as local markdown files under `.scratch/<feature-slug>/`; never publish to GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: one `GLOSSARY.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
