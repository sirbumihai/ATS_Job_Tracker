package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.GithubReadmeRequest;
import com.jobtracker.ats.dto.GithubReadmeResponse;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.repository.CvProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class GithubReadmeService {

    private final CvProfileRepository cvProfileRepository;
    private final OpenAiLlmService openAiLlmService;
    private final ObjectMapper objectMapper;

    private static final Pattern THINK_TAG_PATTERN = Pattern.compile("<think>[\\s\\S]*?</think>", Pattern.CASE_INSENSITIVE);
    private static final Pattern EMOJI_PATTERN = Pattern.compile(
            "[\\x{1F600}-\\x{1F64F}\\x{1F300}-\\x{1F5FF}\\x{1F680}-\\x{1F6FF}\\x{1F700}-\\x{1F77F}\\x{1F780}-\\x{1F7FF}" +
            "\\x{1F800}-\\x{1F8FF}\\x{1F900}-\\x{1F9FF}\\x{1FA00}-\\x{1FA6F}\\x{1FA70}-\\x{1FAFF}\\x{2600}-\\x{26FF}" +
            "\\x{2700}-\\x{27BF}\\x{FE00}-\\x{FE0F}]"
    );

    public static String stripEmojis(String text) {
        if (text == null) return "";
        String cleaned = EMOJI_PATTERN.matcher(text).replaceAll("");
        cleaned = cleaned.replace("\uFFFD", "—");
        cleaned = cleaned.replaceAll("—{2,}", "—");
        cleaned = cleaned.replaceAll("—\\?+", "—");
        return cleaned.replaceAll("[ \\t]{2,}", " ");
    }

    public GithubReadmeResponse generateReadme(UUID userId, GithubReadmeRequest request) {
        log.info("[GITHUB README] Generare README pentru userId={}, request={}", userId, request);

        // 1. Resolve CV Profile
        CvProfile profile = resolveCvProfile(userId, request.cvProfileId());

        String candidateName = coalesce(request.candidateName(), profile != null ? profile.getFullName() : null, "Software Engineer");
        String githubUsername = resolveGithubUsername(request.githubUsername(), profile);
        String linkedinUrl = coalesce(request.linkedinUrl(), profile != null ? profile.getLinkedin() : null, "https://linkedin.com");
        String email = coalesce(request.email(), profile != null ? profile.getEmail() : null, "contact@example.com");
        String portfolioUrl = coalesce(request.portfolioUrl(), null);

        String archetype = request.archetype() != null ? request.archetype().toUpperCase() : "BACKEND_SYSTEMS";
        String statsTheme = request.statsTheme() != null && !request.statsTheme().isBlank() ? request.statsTheme() : "github_dark";
        boolean includeStats = request.includeStatsCards() == null || request.includeStatsCards();
        boolean includeLanguages = request.includeLanguages() == null || request.includeLanguages();
        boolean includeStreak = request.includeStreak() == null || request.includeStreak();

        // 2. Parse Skills & Projects from CV
        List<String> detectedTechnologies = extractTechnologies(profile, request.selectedTechnologies());
        List<ProjectItem> parsedProjects = extractProjects(profile, request.projectHighlights());

        // 3. Try AI Generation for authentic, tailored wording if available
        if (openAiLlmService.isConfigured()) {
            try {
                GithubReadmeResponse aiResponse = callAiForReadme(
                        candidateName, githubUsername, archetype, request.targetRole(),
                        detectedTechnologies, parsedProjects, linkedinUrl, email, portfolioUrl,
                        statsTheme, includeStats, includeLanguages, includeStreak
                );
                if (aiResponse != null && aiResponse.fullMarkdown() != null && !aiResponse.fullMarkdown().isBlank()) {
                    log.info("[GITHUB README SUCCESS] Generat cu AI (Anti-AI prompt) pentru GitHub '{}'", githubUsername);
                    return aiResponse;
                }
            } catch (Exception e) {
                log.warn("[GITHUB README WARN] Apelul AI a esuat: {}. Se foloseste generatorul determinist non-AI.", e.getMessage());
            }
        }

        // 4. Deterministic Fallback Builder (0 tokens, 100% authentic human tone)
        log.info("[GITHUB README] Construire deterministica pentru '{}'", githubUsername);
        return buildDeterministicReadme(
                candidateName, githubUsername, archetype, request.targetRole(),
                detectedTechnologies, parsedProjects, linkedinUrl, email, portfolioUrl,
                statsTheme, includeStats, includeLanguages, includeStreak
        );
    }

    private CvProfile resolveCvProfile(UUID userId, UUID cvProfileId) {
        if (cvProfileId != null) {
            return cvProfileRepository.findById(cvProfileId).orElse(null);
        }
        if (userId != null) {
            return cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                    .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId))
                    .orElse(null);
        }
        return null;
    }

    private String resolveGithubUsername(String requestedUsername, CvProfile profile) {
        if (requestedUsername != null && !requestedUsername.isBlank()) {
            return cleanGithubHandle(requestedUsername);
        }
        if (profile != null && profile.getGithub() != null && !profile.getGithub().isBlank()) {
            return cleanGithubHandle(profile.getGithub());
        }
        return "sirbumihai";
    }

    private String cleanGithubHandle(String input) {
        String handle = input.trim();
        if (handle.startsWith("https://github.com/")) {
            handle = handle.substring("https://github.com/".length());
        } else if (handle.startsWith("http://github.com/")) {
            handle = handle.substring("http://github.com/".length());
        } else if (handle.startsWith("github.com/")) {
            handle = handle.substring("github.com/".length());
        }
        if (handle.endsWith("/")) {
            handle = handle.substring(0, handle.length() - 1);
        }
        return handle.trim();
    }

    private List<String> extractTechnologies(CvProfile profile, List<String> userSelected) {
        if (userSelected != null && !userSelected.isEmpty()) {
            return userSelected;
        }
        Set<String> set = new LinkedHashSet<>();
        if (profile != null) {
            parseTechTokens(profile.getSkillsLanguages(), set);
            parseTechTokens(profile.getSkillsFrameworks(), set);
            parseTechTokens(profile.getSkillsDatabases(), set);
            parseTechTokens(profile.getSkillsDevops(), set);
        }
        if (set.isEmpty()) {
            set.addAll(List.of("Java", "Spring Boot", "PostgreSQL", "Docker", "Git", "React", "TypeScript", "Linux"));
        }
        return new ArrayList<>(set);
    }

    private void parseTechTokens(String raw, Set<String> target) {
        if (raw == null || raw.isBlank()) return;
        String[] parts = raw.split("[,;•\\n]+");
        for (String p : parts) {
            String clean = p.trim();
            if (clean.length() >= 2 && !clean.equalsIgnoreCase("etc")) {
                target.add(clean);
            }
        }
    }

    private List<ProjectItem> extractProjects(CvProfile profile, List<String> highlights) {
        List<ProjectItem> list = new ArrayList<>();
        if (profile != null && profile.getProjectsJson() != null && !profile.getProjectsJson().isBlank()) {
            try {
                JsonNode array = objectMapper.readTree(profile.getProjectsJson());
                if (array.isArray()) {
                    for (JsonNode item : array) {
                        String title = item.has("title") ? item.get("title").asText() : "Project";
                        String tech = item.has("techStack") ? item.get("techStack").asText() : "";
                        String link = item.has("linkUrl") ? item.get("linkUrl").asText() : "";
                        List<String> bullets = new ArrayList<>();
                        if (item.has("bullets") && item.get("bullets").isArray()) {
                            for (JsonNode b : item.get("bullets")) {
                                bullets.add(b.asText());
                            }
                        }
                        list.add(new ProjectItem(title, tech, link, bullets));
                    }
                }
            } catch (Exception e) {
                log.warn("[GITHUB README] Eroare la parsarea projectsJson: {}", e.getMessage());
            }
        }

        if (list.isEmpty()) {
            list.add(new ProjectItem(
                    "ATS AI Career Coach Engine",
                    "Java 21, Spring Boot 3.3, PostgreSQL, pgvector, React, Docker",
                    "https://github.com/" + (profile != null && profile.getGithub() != null ? cleanGithubHandle(profile.getGithub()) : "username") + "/ATS_Job_Tracker",
                    List.of(
                            "High-concurrency job ingestion pipeline processing 8.5k+ postings in <10s using Java 21 Virtual Threads.",
                            "Engineered 384-dimension vector similarity search with PostgreSQL pgvector (HNSW Index), achieving sub-15ms semantic matching."
                    )
            ));
            list.add(new ProjectItem(
                    "E-Commerce Microservices Platform",
                    "Java 21, Spring Cloud, PostgreSQL, Docker, Redis",
                    "",
                    List.of(
                            "Resilient distributed backend with circuit breakers and central service discovery, maintaining 99.9% uptime under concurrent load.",
                            "Optimized database execution time by 40% with B-Tree composite indexing across high-volume relational tables."
                    )
            ));
        }

        return list;
    }

    private GithubReadmeResponse callAiForReadme(
            String candidateName, String githubUsername, String archetype, String targetRole,
            List<String> technologies, List<ProjectItem> projects,
            String linkedinUrl, String email, String portfolioUrl,
            String statsTheme, boolean includeStats, boolean includeLanguages, boolean includeStreak) throws Exception {

        String systemPrompt = """
            You are a Principal Software Engineer and Technical Recruiter.
            Generate a clean, high-impact, 100% NON-AI sounding GitHub Profile README.

            STRICT ANTI-AI & AUTHENTICITY RULES:
            1. ABSOLUTELY ZERO EMOJIS: Do NOT output any emojis anywhere in the markdown (no waving hands, rockets, hammers, tools, charts, fire, pins, etc.). Pure typographic engineering style only.
            2. NO AI BUZZWORDS: Ban words like 'passionate coder', 'crafting seamless experiences', 'delving deep into the realm of', 'transformative synergy', 'journey', 'unwavering commitment', 'spearheaded'.
            3. SOUND LIKE A REAL ENGINEER: Concise, pragmatic, concrete, and grounded. Focus on architecture, concurrency, throughput, reliability, clean code, and actual tools.
            4. REAL METRICS & ARCHITECTURE: Always highlight concrete engineering decisions and numbers (e.g. 'P99 latency', 'concurrent requests', 'virtual threads', 'sub-15ms').
            5. CLEAN MARKDOWN FORMATTING: Output proper Markdown with clear headings (## Title), badges, bullet points, and project cards.
            6. Return ONLY a valid JSON object matching the schema below. No markdown fences or conversational explanations.

            JSON Schema:
            {
              "headline": "Short punchy headline (e.g. Software Engineer | Backend & Systems)",
              "bioSection": "2-3 short, grounded sentences describing focus, stack, and engineering philosophy without fluff",
              "techPhilosophy": "1 concise sentence on engineering mindset (e.g. Focus on pragmatic system design, low latency, and maintainable codebases.)",
              "refinedProjects": [
                {
                  "title": "Project Title",
                  "techStack": "Tech Stack",
                  "bullets": ["Concrete engineering bullet 1 with metrics/decisions", "Concrete engineering bullet 2"]
                }
              ],
              "statusLines": {
                "building": "What you're currently building (concrete project)",
                "learning": "What technical topic or book you're reading/exploring",
                "collaborating": "What kinds of problems or architectures you enjoy discussing"
              },
              "antiAiTips": [
                "Concrete tip 1 on why this profile avoids AI clichés",
                "Concrete tip 2 on recruiter visibility"
              ]
            }
            """;

        String userPrompt = String.format("""
            Engineer Profile:
            - Name: %s
            - GitHub Username: %s
            - Target Archetype: %s
            - Target Role: %s
            - Tech Stack: %s
            - Real Projects from CV:
            %s
            """, candidateName, githubUsername, archetype, targetRole != null ? targetRole : "Backend / Full-Stack Engineer",
                String.join(", ", technologies), formatProjectsForPrompt(projects));

        String rawResponse = openAiLlmService.generateCompletion(systemPrompt, userPrompt, 2000, 0.2);
        if (rawResponse == null || rawResponse.isBlank()) {
            return null;
        }

        String cleanedJson = cleanJsonFences(rawResponse);
        JsonNode root = objectMapper.readTree(cleanedJson);

        String headline = stripEmojis(getText(root, "headline", candidateName + " | Backend & Systems Engineer"));
        String bioSection = stripEmojis(getText(root, "bioSection", "Software Engineer focused on high-throughput backend services, distributed systems, and clean architectural design."));
        String techPhilosophy = stripEmojis(getText(root, "techPhilosophy", "I prioritize predictable latency, type safety, test coverage, and pragmatic system design."));

        List<String> antiAiTips = new ArrayList<>();
        if (root.has("antiAiTips") && root.get("antiAiTips").isArray()) {
            for (JsonNode t : root.get("antiAiTips")) {
                antiAiTips.add(stripEmojis(t.asText()));
            }
        }
        if (antiAiTips.isEmpty()) {
            antiAiTips.addAll(List.of(
                    "Design Senior 100% Non-AI: Fără emoticoane (fără rachete, unelte, fețe zâmbitoare sau degete indicatoare).",
                    "Structură inginerească clară: Focus activ, stack tehnic grupat pe categorii, proiecte cu metrici concrete.",
                    "Zero clișee corporatiste ('passionate developer', 'crafting seamless experiences', 'transformative synergy').",
                    "Insigne Shields.io flat-square discrete cu logo-uri oficiale de brand.",
                    "Metrici tehnice măsurabile (latență P99, cereri concurente, indici de baze de date, acoperire de teste)."
            ));
        }

        String building = stripEmojis(root.has("statusLines") && root.get("statusLines").has("building") ? root.get("statusLines").get("building").asText() : "Scalable backend architectures and cloud microservices");
        String learning = stripEmojis(root.has("statusLines") && root.get("statusLines").has("learning") ? root.get("statusLines").get("learning").asText() : "High-concurrency distributed systems & database internals");
        String collaborating = stripEmojis(root.has("statusLines") && root.get("statusLines").has("collaborating") ? root.get("statusLines").get("collaborating").asText() : "Backend architecture, REST APIs, or performance tuning");

        // Build Markdown blocks
        String badgesMarkdown = buildBadgesMarkdown(technologies);
        String statsMarkdown = buildStatsMarkdown(githubUsername, statsTheme, includeStats, includeLanguages, includeStreak);
        String contactMarkdown = buildContactMarkdown(email, linkedinUrl, portfolioUrl);

        // Build Projects section
        StringBuilder projSb = new StringBuilder();
        if (root.has("refinedProjects") && root.get("refinedProjects").isArray()) {
            for (JsonNode p : root.get("refinedProjects")) {
                String title = stripEmojis(p.has("title") ? p.get("title").asText() : "Project");
                String stack = stripEmojis(p.has("techStack") ? p.get("techStack").asText() : "");
                projSb.append("### ").append(title).append("\n");
                if (!stack.isBlank()) {
                    projSb.append("`").append(stack).append("`\n\n");
                }
                if (p.has("bullets") && p.get("bullets").isArray()) {
                    for (JsonNode b : p.get("bullets")) {
                        projSb.append("- ").append(stripEmojis(b.asText())).append("\n");
                    }
                }
                projSb.append("\n");
            }
        } else {
            projSb.append(buildProjectsMarkdown(projects));
        }

        String fullMarkdown = assembleFullReadme(
                candidateName, headline, bioSection, techPhilosophy,
                building, learning, collaborating,
                badgesMarkdown, projSb.toString().trim(),
                statsMarkdown, contactMarkdown
        );

        return new GithubReadmeResponse(
                fullMarkdown,
                headline,
                bioSection,
                badgesMarkdown,
                projSb.toString().trim(),
                statsMarkdown,
                contactMarkdown,
                antiAiTips,
                technologies
        );
    }

    private GithubReadmeResponse buildDeterministicReadme(
            String candidateName, String githubUsername, String archetype, String targetRole,
            List<String> technologies, List<ProjectItem> projects,
            String linkedinUrl, String email, String portfolioUrl,
            String statsTheme, boolean includeStats, boolean includeLanguages, boolean includeStreak) {

        String headline = switch (archetype) {
            case "FULLSTACK_SYSTEMS" -> "Software Engineer | Full-Stack & Distributed Systems";
            case "MINIMALIST_LEAD" -> candidateName + " — Systems & Software Architecture";
            case "OPEN_SOURCE" -> candidateName + " | Open Source Contributor & Backend Engineer";
            default -> "Software Engineer | Java 21, Spring Boot & Backend Systems";
        };

        String bioSection = switch (archetype) {
            case "FULLSTACK_SYSTEMS" -> "I engineer end-to-end web applications and robust distributed backends. Focused on clean architecture, responsive frontends, and automated CI/CD pipelines.";
            case "MINIMALIST_LEAD" -> "Backend-focused engineer building reliable, low-latency microservices and scalable database systems. No buzzwords — just clean code, high test coverage, and dependable software.";
            default -> "Software Engineer specializing in Java, Spring Boot, and high-concurrency relational systems. Experienced in architecting REST APIs, optimizing PostgreSQL query plans, and containerizing distributed microservices.";
        };

        String techPhilosophy = "Predictable latency, clear module boundaries, and rigorous unit testing over premature complexity.";
        String building = "High-throughput job crawler pipelines and vector semantic search engines";
        String learning = "Advanced JVM tuning, distributed consensus, and database indexing internals";
        String collaborating = "Backend performance optimization and microservices architecture";

        String badgesMarkdown = buildBadgesMarkdown(technologies);
        String projectsMarkdown = buildProjectsMarkdown(projects);
        String statsMarkdown = buildStatsMarkdown(githubUsername, statsTheme, includeStats, includeLanguages, includeStreak);
        String contactMarkdown = buildContactMarkdown(email, linkedinUrl, portfolioUrl);

        String fullMarkdown = assembleFullReadme(
                candidateName, headline, bioSection, techPhilosophy,
                building, learning, collaborating,
                badgesMarkdown, projectsMarkdown,
                statsMarkdown, contactMarkdown
        );

        List<String> antiAiTips = List.of(
                "Design Senior 100% Non-AI: Fără emoticoane (fără rachete, unelte, fețe zâmbitoare sau degete indicatoare).",
                "Structură inginerească clară: Focus activ, stack tehnic grupat pe categorii, proiecte cu metrici concrete.",
                "Zero clișee corporatiste ('passionate developer', 'crafting seamless experiences', 'transformative synergy').",
                "Insigne Shields.io flat-square discrete cu logo-uri oficiale de brand.",
                "Metrici tehnice măsurabile (latență P99, cereri concurente, indici de baze de date, acoperire de teste)."
        );

        return new GithubReadmeResponse(
                stripEmojis(fullMarkdown),
                headline,
                bioSection,
                badgesMarkdown,
                projectsMarkdown,
                statsMarkdown,
                contactMarkdown,
                antiAiTips,
                technologies
        );
    }

    private String assembleFullReadme(
            String candidateName, String headline, String bio, String philosophy,
            String building, String learning, String collaborating,
            String badges, String projects, String stats, String contact) {

        StringBuilder sb = new StringBuilder();
        sb.append("# ").append(candidateName).append("\n\n");
        sb.append("**").append(headline).append("**\n\n");

        if (bio != null && !bio.isBlank()) {
            sb.append(bio).append("\n\n");
        }

        if (philosophy != null && !philosophy.isBlank()) {
            sb.append("> **Engineering Mindset**: ").append(philosophy).append("\n\n");
        }

        sb.append("---\n\n");

        // Focus & Activity
        sb.append("## Current Focus\n\n");
        sb.append("- **Active Development**: ").append(building).append("\n");
        sb.append("- **Technical Deep-Dives**: ").append(learning).append("\n");
        sb.append("- **Architecture & Discussions**: ").append(collaborating).append("\n\n");

        // Tech Stack
        sb.append("---\n\n");
        sb.append("## Tech Stack & Tooling\n\n");
        sb.append(badges).append("\n\n");

        // Featured Projects
        if (projects != null && !projects.isBlank()) {
            sb.append("---\n\n");
            sb.append("## Featured Engineering Projects\n\n");
            sb.append(projects).append("\n\n");
        }

        // GitHub Stats
        if (stats != null && !stats.isBlank()) {
            sb.append("---\n\n");
            sb.append("## GitHub Metrics\n\n");
            sb.append(stats).append("\n\n");
        }

        // Contact
        sb.append("---\n\n");
        sb.append("## Connect\n\n");
        sb.append(contact).append("\n");

        return stripEmojis(sb.toString().trim());
    }

    private String buildBadgesMarkdown(List<String> technologies) {
        StringBuilder sb = new StringBuilder();
        Map<String, String> badgeMap = getPredefinedBadges();

        Map<String, List<String>> categories = new LinkedHashMap<>();
        categories.put("Languages & Runtime", List.of("java", "python", "sql", "typescript", "javascript", "c++", "c/c++"));
        categories.put("Backend & Architecture", List.of("spring boot", "spring", "spring cloud", "rest api", "microservices"));
        categories.put("Databases & Storage", List.of("postgresql", "pgvector", "redis"));
        categories.put("DevOps & Testing", List.of("docker", "git", "github actions", "linux", "junit", "mockito"));
        categories.put("Frontend & Web", List.of("react", "tailwind css"));

        Set<String> assigned = new HashSet<>();

        for (Map.Entry<String, List<String>> entry : categories.entrySet()) {
            List<String> matchedBadges = new ArrayList<>();
            for (String tech : technologies) {
                String key = tech.toLowerCase().trim();
                if (entry.getValue().contains(key)) {
                    String b = badgeMap.get(key);
                    if (b != null) {
                        matchedBadges.add(b);
                        assigned.add(key);
                    }
                }
            }
            if (!matchedBadges.isEmpty()) {
                sb.append("#### ").append(entry.getKey()).append("\n");
                sb.append(String.join(" ", matchedBadges)).append("\n\n");
            }
        }

        List<String> leftovers = new ArrayList<>();
        for (String tech : technologies) {
            String key = tech.toLowerCase().trim();
            if (!assigned.contains(key)) {
                String b = badgeMap.get(key);
                if (b == null) {
                    String safeName = tech.replace("-", "--").replace(" ", "_");
                    b = String.format("![%s](https://img.shields.io/badge/%s-1e293b?style=flat-square)", tech, safeName);
                }
                leftovers.add(b);
            }
        }
        if (!leftovers.isEmpty()) {
            sb.append("#### Tools & Libraries\n");
            sb.append(String.join(" ", leftovers)).append("\n\n");
        }

        return sb.toString().trim();
    }

    private Map<String, String> getPredefinedBadges() {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("java", "![Java](https://img.shields.io/badge/Java_21-ED8B00?style=flat-square&logo=openjdk&logoColor=white)");
        m.put("spring boot", "![Spring Boot](https://img.shields.io/badge/Spring_Boot_3-6DB33F?style=flat-square&logo=springboot&logoColor=white)");
        m.put("spring", "![Spring](https://img.shields.io/badge/Spring-6DB33F?style=flat-square&logo=spring&logoColor=white)");
        m.put("postgresql", "![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)");
        m.put("pgvector", "![pgvector](https://img.shields.io/badge/pgvector-336791?style=flat-square&logo=postgresql&logoColor=white)");
        m.put("docker", "![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)");
        m.put("react", "![React](https://img.shields.io/badge/React_18-61DAFB?style=flat-square&logo=react&logoColor=black)");
        m.put("typescript", "![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)");
        m.put("javascript", "![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)");
        m.put("python", "![Python](https://img.shields.io/badge/Python_3-3776AB?style=flat-square&logo=python&logoColor=white)");
        m.put("c/c++", "![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white)");
        m.put("c++", "![C++](https://img.shields.io/badge/C++-00599C?style=flat-square&logo=c%2B%2B&logoColor=white)");
        m.put("tailwind css", "![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)");
        m.put("git", "![Git](https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white)");
        m.put("github actions", "![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=flat-square&logo=githubactions&logoColor=white)");
        m.put("linux", "![Linux](https://img.shields.io/badge/Linux-FCC624?style=flat-square&logo=linux&logoColor=black)");
        m.put("redis", "![Redis](https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white)");
        m.put("junit", "![JUnit 5](https://img.shields.io/badge/JUnit_5-25A162?style=flat-square&logo=junit5&logoColor=white)");
        m.put("mockito", "![Mockito](https://img.shields.io/badge/Mockito-brightgreen?style=flat-square)");
        m.put("rest api", "![REST API](https://img.shields.io/badge/REST_APIs-009688?style=flat-square)");
        m.put("sql", "![SQL](https://img.shields.io/badge/SQL-CC292B?style=flat-square)");
        return m;
    }

    private String buildProjectsMarkdown(List<ProjectItem> projects) {
        StringBuilder sb = new StringBuilder();
        for (ProjectItem p : projects) {
            sb.append("### ").append(stripEmojis(p.title())).append("\n");
            if (p.techStack() != null && !p.techStack().isBlank()) {
                sb.append("`").append(stripEmojis(p.techStack())).append("`\n\n");
            }
            if (p.bullets() != null) {
                for (String b : p.bullets()) {
                    sb.append("- ").append(stripEmojis(b)).append("\n");
                }
            }
            if (p.linkUrl() != null && !p.linkUrl().isBlank()) {
                sb.append("\n[View Repository](").append(p.linkUrl()).append(")\n");
            }
            sb.append("\n");
        }
        return sb.toString().trim();
    }

    private String buildStatsMarkdown(String username, String theme, boolean stats, boolean langs, boolean streak) {
        StringBuilder sb = new StringBuilder();
        sb.append("<p align=\"center\">\n");
        if (stats) {
            sb.append(String.format("  <img src=\"https://github-readme-stats.vercel.app/api?username=%s&show_icons=true&theme=%s&hide_border=true&count_private=true\" alt=\"GitHub Stats\" height=\"155\" />\n", username, theme));
        }
        if (langs) {
            sb.append(String.format("  <img src=\"https://github-readme-stats.vercel.app/api/top-langs/?username=%s&layout=compact&theme=%s&hide_border=true\" alt=\"Top Languages\" height=\"155\" />\n", username, theme));
        }
        sb.append("</p>\n");

        if (streak) {
            sb.append("<p align=\"center\">\n");
            sb.append(String.format("  <img src=\"https://github-readme-streak-stats.herokuapp.com/?user=%s&theme=%s&hide_border=true\" alt=\"GitHub Streak\" />\n", username, theme));
            sb.append("</p>\n");
        }
        return sb.toString().trim();
    }

    private String buildContactMarkdown(String email, String linkedin, String portfolio) {
        StringBuilder sb = new StringBuilder();
        if (linkedin != null && !linkedin.isBlank()) {
            sb.append(String.format("[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=flat-square&logo=linkedin&logoColor=white)](%s) ", linkedin));
        }
        if (email != null && !email.isBlank()) {
            sb.append(String.format("[![Email](https://img.shields.io/badge/Email-D14836?style=flat-square&logo=gmail&logoColor=white)](mailto:%s) ", email));
        }
        if (portfolio != null && !portfolio.isBlank()) {
            sb.append(String.format("[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=flat-square&logo=aboutdotme&logoColor=white)](%s) ", portfolio));
        }
        return sb.toString().trim();
    }

    private String formatProjectsForPrompt(List<ProjectItem> projects) {
        StringBuilder sb = new StringBuilder();
        for (ProjectItem p : projects) {
            sb.append("- Title: ").append(p.title()).append("\n");
            sb.append("  Stack: ").append(p.techStack()).append("\n");
            if (p.bullets() != null) {
                for (String b : p.bullets()) {
                    sb.append("  * ").append(b).append("\n");
                }
            }
        }
        return sb.toString();
    }

    private String cleanJsonFences(String raw) {
        String clean = THINK_TAG_PATTERN.matcher(raw).replaceAll("").trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }

    private String getText(JsonNode node, String fieldName, String fallback) {
        if (node.has(fieldName) && !node.get(fieldName).isNull()) {
            return node.get(fieldName).asText();
        }
        return fallback;
    }

    private String coalesce(String... values) {
        for (String v : values) {
            if (v != null && !v.isBlank()) return v.trim();
        }
        return "";
    }

    public record ProjectItem(String title, String techStack, String linkUrl, List<String> bullets) {}
}
