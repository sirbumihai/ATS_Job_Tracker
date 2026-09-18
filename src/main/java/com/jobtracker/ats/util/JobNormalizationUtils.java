package com.jobtracker.ats.util;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
public final class JobNormalizationUtils {

    private JobNormalizationUtils() {}

    public static final Set<String> REMOVED_PLATFORMS = Set.of(
            "GREENHOUSE", "ASHBY", "SMARTRECRUITERS", "REMOTIVE", "ARBEITNOW", "WWR", "EU_TECH", "GERMANTECHJOBS", "SWISSDEVJOBS"
    );

    public static final String BROWSER_USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    private static final List<String> NON_IT_KEYWORDS = List.of(
            "vanzari", "vanzator", "vanzare", "sales", "comercial", "merchandiser", "promoter", "casier",
            "curatenie", "cleaner", "menaj", "curatitor",
            "sofer", "driver", "curier", "livrator", "conducator auto", "transport marfa",
            "contabil", "contabilitate", "accounting", "financiar", "financial", "finante", "economist", "credite", "casierie",
            "medical", "medic", "asistent medical", "infirmier", "farmacist", "farmacie", "stomatolog", "dentist",
            "magazin", "lucrator comercial", "operator depozit", "picker", "stivuitorist", "manipulant", "depozit", "gestionar", "supply chain",
            "muncitor", "montator", "sudor", "lacatus", "mecanic", "electrician", "instalator", "strungar", "vopsitor", "tamplar",
            "bucatar", "ospatar", "barman", "barista", "camerista", "receptie", "receptionist", "hotel", "restaurant",
            "consilier vanzari", "consilier clienti", "consilier relatii", "relatii clienti", "customer care", "call center",
            "nutritionist", "terapeut", "psiholog", "educator", "asistent vanzari",
            "jurist", "avocat", "legal counsel", "notar", "secretara", "secretariat",
            "constructii", "constructie", "santier", "infrastructura rutiera", "drumuri", "poduri", "agronom", "agronomie", "zootehnie", "veterinar", "cadastru", "topograf"
    );

    private static final List<Pattern> IT_ROLE_PATTERNS = List.of(
            Pattern.compile("\\b(developer|software|engineer|programmer|programator|inginer|coder|coding)\\b"),
            Pattern.compile("\\b(frontend|front-end|backend|back-end|fullstack|full-stack|web)\\b"),
            Pattern.compile("\\b(devops|sre|sysadmin|system administrator|administrator sistem|cloud|infrastructure)\\b"),
            Pattern.compile("\\b(java|python|c\\+\\+|c#|\\.net|dotnet|javascript|typescript|react|angular|vue|node|golang|rust|kotlin|swift|php|ruby)\\b"),
            Pattern.compile("\\b(qa|tester|testing|testare|quality assurance|automation)\\b"),
            Pattern.compile("\\b(data analyst|data engineer|data scientist|analist date|database|dba|sql|bi developer|big data|analytics)\\b"),
            Pattern.compile("\\b(ai|ml|machine learning|deep learning|llm|nlp|computer vision)\\b"),
            Pattern.compile("\\b(cybersecurity|cyber security|securitate cibernetica|security engineer|infosec|soc analyst)\\b"),
            Pattern.compile("\\b(scrum master|agile coach|product owner|tech lead|team lead it|it project manager)\\b"),
            Pattern.compile("\\b(it support|helpdesk|service desk|suport it|tehnician it|suport tehnic it|administrator retea|network engineer)\\b"),
            Pattern.compile("\\b(it internship|it trainee|software intern|developer intern|internship it|stagiu it|stagiu programare)\\b"),
            Pattern.compile("\\b(embedded|firmware|iot|microcontroller|hardware engineer|telecom|retele|network)\\b"),
            Pattern.compile("\\b(ui/ux|ux designer|ui designer|product designer)\\b")
    );

    private static final Pattern STANDALONE_IT_PATTERN = Pattern.compile("\\b(it|i\\.t\\.)\\b");

    public static String computeContentHash(String title, String company, String description, String salary, String skills, String location) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            String text = (title != null ? title.toLowerCase().trim() : "") + "|"
                    + (company != null ? company.toLowerCase().trim() : "") + "|"
                    + (description != null ? description.trim() : "") + "|"
                    + (salary != null ? salary.trim() : "") + "|"
                    + (skills != null ? skills.trim() : "") + "|"
                    + (location != null ? location.toLowerCase().trim() : "");
            byte[] hash = md.digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }
            return hexString.toString();
        } catch (NoSuchAlgorithmException e) {
            return Integer.toHexString(Objects.hash(title, company, description, salary, skills, location));
        }
    }

    public static OffsetDateTime parseExactDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        String s = dateStr.trim();
        try {
            return OffsetDateTime.parse(s);
        } catch (Exception ignored) {}
        try {
            return Instant.parse(s).atOffset(ZoneOffset.UTC);
        } catch (Exception ignored) {}
        try {
            return ZonedDateTime.parse(s).toOffsetDateTime();
        } catch (Exception ignored) {}
        try {
            return ZonedDateTime.parse(s, DateTimeFormatter.RFC_1123_DATE_TIME.withLocale(Locale.ENGLISH)).toOffsetDateTime();
        } catch (Exception ignored) {}
        try {
            return LocalDate.parse(s).atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        } catch (Exception ignored) {}
        try {
            DateTimeFormatter roFmt = DateTimeFormatter.ofPattern("dd.MM.yyyy");
            return LocalDate.parse(s, roFmt).atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        } catch (Exception ignored) {}
        try {
            DateTimeFormatter roFmt2 = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            return LocalDate.parse(s, roFmt2).atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        } catch (Exception ignored) {}
        try {
            DateTimeFormatter roFmt3 = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.forLanguageTag("ro-RO"));
            return LocalDate.parse(s, roFmt3).atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        } catch (Exception ignored) {}
        try {
            DateTimeFormatter roFmt4 = DateTimeFormatter.ofPattern("d MMM yyyy", Locale.forLanguageTag("ro-RO"));
            return LocalDate.parse(s, roFmt4).atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
        } catch (Exception ignored) {}

        Matcher dayMonthMatcher = Pattern.compile("^(\\d{1,2})\\s+([A-Za-zăîșțâ]+)$").matcher(s);
        if (dayMonthMatcher.find()) {
            int day = Integer.parseInt(dayMonthMatcher.group(1));
            String mStr = dayMonthMatcher.group(2);
            int month = parseMonthRomanianOrEnglish(mStr);
            if (month > 0) {
                int year = LocalDate.now().getYear();
                LocalDate ld = LocalDate.of(year, month, day);
                if (ld.isAfter(LocalDate.now())) {
                    ld = ld.minusYears(1);
                }
                return ld.atStartOfDay(ZoneOffset.UTC).toOffsetDateTime();
            }
        }
        if (s.matches("^\\d{10}$")) {
            return Instant.ofEpochSecond(Long.parseLong(s)).atOffset(ZoneOffset.UTC);
        } else if (s.matches("^\\d{13}$")) {
            return Instant.ofEpochMilli(Long.parseLong(s)).atOffset(ZoneOffset.UTC);
        }
        return null;
    }

    public static OffsetDateTime parseExactDate(String dateStr, int fallbackDaysAgo) {
        OffsetDateTime parsed = parseExactDate(dateStr);
        if (parsed != null) return parsed;
        if (fallbackDaysAgo >= 0 && (dateStr != null && !dateStr.isBlank())) {
            return OffsetDateTime.now().minusDays(fallbackDaysAgo);
        }
        return null;
    }

    public static int parseMonthRomanianOrEnglish(String mStr) {
        if (mStr == null) return -1;
        String m = mStr.toLowerCase().replace("ă", "a").replace("â", "a").replace("î", "i").replace("ș", "s").replace("ț", "t");
        if (m.startsWith("ian") || m.startsWith("jan")) return 1;
        if (m.startsWith("feb")) return 2;
        if (m.startsWith("mar")) return 3;
        if (m.startsWith("apr")) return 4;
        if (m.startsWith("mai") || m.startsWith("may")) return 5;
        if (m.startsWith("iun") || m.startsWith("jun")) return 6;
        if (m.startsWith("iul") || m.startsWith("jul")) return 7;
        if (m.startsWith("aug")) return 8;
        if (m.startsWith("sep") || m.startsWith("sept")) return 9;
        if (m.startsWith("oct")) return 10;
        if (m.startsWith("noi") || m.startsWith("nov")) return 11;
        if (m.startsWith("dec")) return 12;
        return -1;
    }

    public static String determineExperienceLevel(String title, String description) {
        if (title == null) return "MID";
        String t = title.toLowerCase();
        String d = description != null ? description.toLowerCase() : "";
        String combined = t + " " + d;

        // 1. Seniority checks (Senior, Lead, Principal, Architect, Staff, Head, Director, Manager, Confirmé)
        if (t.contains("senior") || t.contains("sr.") || t.contains("sr ") || 
            t.contains("lead") || t.contains("principal") || t.contains("staff") || 
            t.contains("head") || t.contains("architect") || t.contains("director") || 
            t.contains("manager") || t.contains("management") ||
            t.contains("expert") || t.contains("confirme") || t.contains("confirmé") ||
            combined.matches(".*\\b(?:5\\+|6\\+|7\\+|8\\+|5-7|5-8)\\s*(?:ani|years|yrs)\\b.*") ||
            combined.matches(".*\\b(?:minim(?:um)?|cel puțin|cel putin|at least|peste|more than|min\\.?)\\s*(?:of\\s+)?(?:5|6|7|8|9|10)\\s*(?:\\+|-\\s*\\d+)?\\s*(?:ani|years|yrs|an)\\b.*") ||
            combined.matches(".*\\b(?:5|6|7|8|9|10)\\s*\\+?\\s*(?:ani|years|yrs)\\s*(?:de\\s+)?(?:experiență|experienta|of\\s+experience|professional\\s+experience|relevant\\s+experience)\\b.*")) {
            return "SENIOR";
        }

        // 2. EXPLICIT 2-4+ ANI / MID-LEVEL EXPERIENCE CHECK:
        if (combined.matches(".*\\b(?:minim(?:um)?|cel puțin|cel putin|at least|peste|more than|min\\.?)\\s*(?:of\\s+)?(?:2|3|4)\\s*(?:\\+|-\\s*\\d+)?\\s*(?:ani|years|yrs|an)\\b.*") ||
            combined.matches(".*\\b[234]\\+\\s*(?:ani|years|yrs)\\b.*") ||
            combined.matches(".*\\b(?:2\\s*-\\s*[345]|3\\s*-\\s*[45])\\s*(?:ani|years|yrs)\\b.*") ||
            combined.matches(".*\\b(?:2|3|4)\\s*\\+?\\s*(?:ani|years|yrs)\\s*(?:de\\s+)?(?:experiență|experienta|of\\s+experience|professional\\s+experience|relevant\\s+experience|commercial\\s+experience)\\b.*") ||
            t.contains("mid-level") || t.contains("mid level") || t.contains("middle") || t.contains("intermediate")) {
            return "MID";
        }

        // 3. Internship checks (Intern, Stagiu, Praktikum, Trainee, Practica, Working Student)
        if (t.matches(".*\\b(?:intern|internship|interns|stagiu|stagiere|stagiari|praktikum|trainee|trainees|student|practica|practică)\\b.*")) {
            return "INTERNSHIP";
        }

        // 4. Strict Junior checks (titlul trebuie să conțină explicit Junior / Entry-level / Graduate / Începător)
        if (t.matches(".*\\b(?:junior|jr|entry-level|fresh grad|graduate|incepator|începător)\\b.*") ||
            t.contains("jr.") || t.contains("jr ") || t.contains("entry level") || 
            t.contains("0-1 ani") || t.contains("0-2 ani")) {
            return "JUNIOR";
        }

        // 5. Default: Orice rol standard fără prefixul "Junior" este MID
        return "MID";
    }

    public static String determineExperienceLevel(String title) {
        return determineExperienceLevel(title, null);
    }

    public static int parseDaysAgo(String postedText) {
        if (postedText == null || postedText.isBlank()) return -1;
        String t = postedText.toLowerCase();

        if (t.contains("astazi") || t.contains("astăzi") || t.contains("today") || t.contains("hour") || t.contains("ore") || t.contains("acum cateva")) {
            return 0;
        }
        if (t.contains("1 zi") || t.contains("1 day") || t.contains("ieri") || t.contains("yesterday")) {
            return 1;
        }
        if (t.contains("2 zi") || t.contains("2 day") || t.contains("2 days")) {
            return 2;
        }
        if (t.contains("3 zi") || t.contains("3 day") || t.contains("3 days")) {
            return 3;
        }
        if (t.contains("4 zi") || t.contains("4 day") || t.contains("4 days")) {
            return 4;
        }
        if (t.contains("5 zi") || t.contains("5 day") || t.contains("5 days")) {
            return 5;
        }
        if (t.contains("1 week") || t.contains("1 saptamana") || t.contains("1 săptămână")) {
            return 7;
        }
        if (t.contains("2 week") || t.contains("2 saptamani") || t.contains("2 săptămâni")) {
            return 14;
        }
        if (t.contains("3 week") || t.contains("3 saptamani") || t.contains("3 săptămâni")) {
            return 21;
        }
        if (t.contains("month") || t.contains("luna") || t.contains("lună")) {
            return 28;
        }
        return -1;
    }

    public static boolean isMajorTechBrand(String company) {
        if (company == null) return false;
        String c = company.toLowerCase();
        return c.contains("google") || c.contains("microsoft") || c.contains("amazon") ||
               c.contains("endava") || c.contains("luxoft") || c.contains("siemens") ||
               c.contains("deloitte") || c.contains("unicredit") || c.contains("vodafone") ||
               c.contains("cegeka") || c.contains("thales") || c.contains("continental") ||
               c.contains("bertrandt") || c.contains("uipath") || c.contains("adobe") ||
               c.contains("pwc") || c.contains("ing") || c.contains("bcr") ||
               c.contains("bearingpoint") || c.contains("cognizant") || c.contains("accenture") ||
               c.contains("linear") || c.contains("posthog") || c.contains("gitlab") || c.contains("cloudflare");
    }

    public static String formatSlugName(String slug) {
        if (slug == null || slug.isEmpty()) return "Companie Parteneră";
        String cleaned = slug.replace("-", " ").replace("2", "").trim();
        return capitalize(cleaned);
    }

    public static String formatSlugTitle(String slug) {
        if (slug == null || slug.isEmpty()) return "Software Engineer";
        String cleaned = slug.replaceAll("-\\d+$", "").replace("-", " ").trim();
        return capitalize(cleaned);
    }

    public static String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1);
    }

    public static List<String> extractSkills(String title, String description) {
        String t = title != null ? title.toLowerCase() : "";
        String d = description != null ? description.toLowerCase() : "";
        String combined = t + " " + d;
        List<String> skills = new ArrayList<>();

        // AI / ML / Data Science / LLMs
        if (combined.contains("generative ai") || combined.contains("genai") || combined.contains("llm") || combined.contains("rag") || combined.contains("prompt engineering") || combined.contains("agentic")) {
            skills.add("LLMs & Generative AI");
        }
        if (combined.contains("machine learning") || combined.contains("deep learning") || combined.contains("artificial intelligence") || t.contains("ai ") || t.contains("ai engineer")) {
            skills.add("Machine Learning");
        }
        if (combined.contains("pytorch") || combined.contains("tensorflow")) {
            skills.add("PyTorch / TensorFlow");
        }
        if (combined.contains("nlp") || combined.contains("computer vision")) {
            skills.add("NLP & Deep Learning");
        }

        // Programming Languages
        if (t.contains("java ") || t.contains("java/") || t.contains("java-") || t.endsWith("java") || (d.contains("java") && !d.contains("javascript only") && !combined.contains("javascript"))) {
            skills.add("Java");
        }
        if (combined.contains("python")) skills.add("Python");
        if (combined.contains("c++") || combined.contains("c/c++") || t.contains("embedded")) skills.add("C++ / Embedded");
        if (combined.contains("c#") || combined.contains(".net") || combined.contains("dotnet")) skills.add(".NET / C#");
        if (combined.contains("golang") || t.contains("go dev") || t.contains("go engineer")) skills.add("Go");
        if (combined.contains("rust")) skills.add("Rust");
        if (combined.contains("typescript")) skills.add("TypeScript");
        if (combined.contains("javascript") || combined.contains(" js ")) skills.add("JavaScript");
        if (combined.contains("kotlin") || t.contains("android")) skills.add("Kotlin / Android");
        if (combined.contains("swift") || t.contains("ios")) skills.add("Swift / iOS");

        // Frameworks & Libraries
        if (combined.contains("spring") || combined.contains("spring boot")) skills.add("Spring Boot");
        if (combined.contains("react")) skills.add("React");
        if (combined.contains("angular")) skills.add("Angular");
        if (combined.contains("vue")) skills.add("Vue.js");
        if (combined.contains("node") || combined.contains("nodejs") || combined.contains("express")) skills.add("Node.js");
        if (combined.contains("django") || combined.contains("fastapi") || combined.contains("flask")) skills.add("FastAPI / Django");

        // Data & Databases
        if (combined.contains("sql") || combined.contains("postgres") || combined.contains("mysql") || combined.contains("database")) skills.add("SQL");
        if (combined.contains("mongodb") || combined.contains("nosql")) skills.add("NoSQL / MongoDB");
        if (combined.contains("kafka") || combined.contains("rabbitmq")) skills.add("Kafka / Messaging");
        if (combined.contains("data engineer") || combined.contains("etl") || combined.contains("spark") || combined.contains("databricks")) skills.add("Data Pipelines / ETL");

        // Cloud & DevOps
        if (combined.contains("docker") || combined.contains("container")) skills.add("Docker");
        if (combined.contains("kubernetes") || combined.contains("k8s")) skills.add("Kubernetes");
        if (combined.contains("aws") || combined.contains("azure") || combined.contains("gcp") || combined.contains("cloud")) skills.add("Cloud (AWS/Azure/GCP)");
        if (combined.contains("ci/cd") || combined.contains("devops") || combined.contains("terraform") || combined.contains("jenkins")) skills.add("DevOps & CI/CD");
        if (combined.contains("linux") || combined.contains("bash")) skills.add("Linux");

        // Architecture & APIs
        if (combined.contains("microservices") || combined.contains("distributed")) skills.add("Microservices");
        if (combined.contains("rest api") || combined.contains("restful") || combined.contains("api development") || combined.contains("apis")) skills.add("REST API");
        if (combined.contains("git") || combined.contains("github") || combined.contains("gitlab")) skills.add("Git");

        // QA & Testing
        if (combined.contains("qa ") || combined.contains("testing") || combined.contains("automation") || combined.contains("selenium") || combined.contains("cypress") || combined.contains("junit")) {
            skills.add("QA & Testing");
        }

        // Security
        if (combined.contains("security") || combined.contains("cyber") || combined.contains("oauth")) skills.add("Cybersecurity");

        // PM / BA / Agile
        if (combined.contains("scrum") || combined.contains("agile")) skills.add("Agile / Scrum");
        if (combined.contains("business analyst") || combined.contains("product owner")) skills.add("Business Analysis");
        if (combined.contains("ui/ux") || combined.contains("figma") || combined.contains("product design")) skills.add("UI/UX & Figma");
        if (combined.contains("sap") || combined.contains("erp") || combined.contains("salesforce")) skills.add("ERP / SAP");

        // Enterprise, Core CS & Languages
        if (combined.contains("pega")) skills.add("Pega PRPC");
        if (combined.contains("oop") || combined.contains("object-oriented") || combined.contains("orientat pe obiect")) skills.add("OOP (Object-Oriented)");
        if (combined.contains("relational") || combined.contains("baze de date")) skills.add("Relational Databases");
        if (combined.contains("web technologies") || combined.contains("html") || combined.contains("css")) skills.add("Web Technologies");
        if (combined.contains("german") || combined.contains("germana") || combined.contains("deutsch")) skills.add("German Language");
        if (combined.contains("english") || combined.contains("engleza")) skills.add("English Fluency");
        if (combined.contains("business process") || combined.contains("bpm")) skills.add("BPM & Case Management");

        if (skills.isEmpty()) {
            skills.addAll(List.of("Software Engineering", "Git", "REST API", "SQL"));
        }

        if (skills.size() > 7) {
            return skills.subList(0, 7);
        }
        return skills;
    }

    public static List<String> extractSkillsFromTitle(String title) {
        return extractSkills(title, null);
    }

    public static List<String> expandTechSynonyms(String term) {
        String t = term.toLowerCase().trim();
        List<String> list = new ArrayList<>();
        list.add(t);
        switch (t) {
            case "js", "javascript" -> list.addAll(List.of("js", "javascript", "react", "node", "typescript"));
            case "ts", "typescript" -> list.addAll(List.of("ts", "typescript", "angular", "react"));
            case "c++", "cpp" -> list.addAll(List.of("c++", "cpp", "c/c++", "embedded"));
            case "c#", "csharp" -> list.addAll(List.of("c#", "csharp", ".net", "dotnet"));
            case "k8s", "kubernetes" -> list.addAll(List.of("kubernetes", "k8s", "helm", "devops"));
            case "qa", "tester", "testing" -> list.addAll(List.of("qa", "test", "testing", "quality", "automation"));
            case "devops", "sre" -> list.addAll(List.of("devops", "sre", "cloud", "docker", "kubernetes", "ci/cd"));
            case "be", "backend" -> list.addAll(List.of("backend", "back-end", "back end"));
            case "fe", "frontend" -> list.addAll(List.of("frontend", "front-end", "front end"));
            case "fullstack" -> list.addAll(List.of("fullstack", "full-stack", "full stack"));
            case "intern", "internship", "stagiu" -> list.addAll(List.of("intern", "internship", "stagiu", "practica", "trainee", "student"));
            case "junior", "entry" -> list.addAll(List.of("junior", "entry-level", "entry level", "incepator", "graduate"));
            case "ai", "ml" -> list.addAll(List.of("ai", "ml", "machine learning", "deep learning", "llm", "data science"));
            case "db", "database", "dba" -> list.addAll(List.of("database", "dba", "sql", "postgres", "oracle", "mysql"));
            default -> {}
        }
        return list;
    }

    public static String normalizeDiacritics(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replace("ă", "a")
                .replace("â", "a")
                .replace("î", "i")
                .replace("ș", "s")
                .replace("ş", "s")
                .replace("ț", "t")
                .replace("ţ", "t");
    }

    public static boolean matchesLocationIntelligently(UnifiedJobListingDto job, String locLower) {
        if (locLower == null || locLower.isBlank()) return true;

        String normQuery = normalizeDiacritics(locLower.trim());
        String jLoc = normalizeDiacritics(job.location());
        String jModel = normalizeDiacritics(job.workModel());
        String jPlatform = job.sourcePlatform().toLowerCase();

        if (jLoc.contains(normQuery) || jModel.contains(normQuery)) return true;

        if (normQuery.contains("bucur") || normQuery.contains("bucharest")) {
            return jLoc.contains("bucur") || jLoc.contains("bucharest") || jLoc.contains("sector");
        }
        if (normQuery.contains("cluj")) {
            return jLoc.contains("cluj");
        }
        if (normQuery.contains("timis")) {
            return jLoc.contains("timis");
        }
        if (normQuery.contains("iasi")) {
            return jLoc.contains("iasi");
        }
        if (normQuery.contains("brasov")) {
            return jLoc.contains("brasov");
        }
        if (normQuery.contains("sibiu")) {
            return jLoc.contains("sibiu");
        }
        if (normQuery.contains("craiova")) {
            return jLoc.contains("craiova");
        }
        if (normQuery.contains("oradea")) {
            return jLoc.contains("oradea");
        }
        if (normQuery.contains("constant")) {
            return jLoc.contains("constant");
        }
        if (normQuery.contains("romania")) {
            return jLoc.contains("romania") ||
                   List.of("devjob_ro", "stagiipebune", "juniors_ro", "undelucram", "ejobs", "hipo", "bestjobs").contains(jPlatform);
        }
        if (normQuery.contains("remote")) {
            return jModel.contains("remote") || jLoc.contains("remote");
        }
        if (normQuery.contains("europ") || normQuery.contains("germany") || normQuery.contains("germania") || normQuery.contains("elvetia") || normQuery.contains("switzerland")) {
            return jLoc.contains("europe") || jLoc.contains("germany") || jLoc.contains("switzerland") || jLoc.contains("berlin") || jLoc.contains("munich") || jLoc.contains("zurich");
        }

        return false;
    }

    public static double parseSalaryEstimate(String salaryRange) {
        if (salaryRange == null || salaryRange.isBlank()) return 0.0;
        String s = salaryRange.toLowerCase().replace(".", "").replace(",", "");

        Matcher m = Pattern.compile("(\\d{3,6})").matcher(s);
        double maxVal = 0.0;
        while (m.find()) {
            try {
                double val = Double.parseDouble(m.group(1));
                if (val > maxVal && val < 500000) {
                    maxVal = val;
                }
            } catch (Exception ignored) {}
        }

        if (maxVal == 0.0) return 0.0;

        boolean isEur = s.contains("eur") || s.contains("€");
        boolean isChf = s.contains("chf");
        boolean isAnnual = s.contains("an") || s.contains("year") || maxVal > 35000;

        double monthlyVal = isAnnual ? (maxVal / 12.0) : maxVal;
        if (isEur) {
            monthlyVal *= 5.0; // 1 EUR ~ 5.0 RON
        } else if (isChf) {
            monthlyVal *= 5.2; // 1 CHF ~ 5.2 RON
        }

        return monthlyVal;
    }

    public static boolean matchesRoleCategory(UnifiedJobListingDto job, String category) {
        String title = job.jobTitle().toLowerCase();
        String desc = job.rawDescription().toLowerCase();
        String skills = String.join(" ", job.skillsRequired()).toLowerCase();

        return switch (category) {
            case "JAVA" -> title.contains("java") || skills.contains("java") || desc.contains("spring boot");
            case "BACKEND" -> title.contains("backend") || title.contains("java") || desc.contains("microservices") || desc.contains("api") || skills.contains("backend");
            case "FULLSTACK" -> title.contains("full-stack") || title.contains("full stack") || title.contains("fullstack") || (skills.contains("react") && skills.contains("java"));
            case "DATA_ANALYST" -> title.contains("data analyst") || desc.contains("bi") || desc.contains("power bi") || desc.contains("tableau") || skills.contains("data analysis") || title.contains("analist date");
            case "DATA_SCIENTIST" -> title.contains("data scientist") || title.contains("data science") || desc.contains("predictive") || desc.contains("scikit") || skills.contains("data science");
            case "DATA_ENGINEER" -> title.contains("data engineer") || desc.contains("spark") || desc.contains("etl") || desc.contains("data platform") || skills.contains("data engineering");
            case "ML_ENGINEER" -> title.contains("machine learning") || desc.contains("deep learning") || desc.contains("pytorch") || desc.contains("tensorflow") || skills.contains("ai/ml");
            case "AI_LLM" -> title.contains("ai ") || title.contains("llm") || desc.contains("rag") || desc.contains("pgvector") || desc.contains("generative") || title.contains("genai");
            case "FRONTEND_REACT" -> title.contains("frontend") || title.contains("react") || skills.contains("react") || skills.contains("typescript");
            case "ANDROID" -> title.contains("android") || skills.contains("kotlin") || desc.contains("android sdk") || title.contains("mobile");
            case "DEVOPS" -> title.contains("devops") || title.contains("sre") || title.contains("reliability") || desc.contains("kubernetes") || skills.contains("site reliability");
            case "CLOUD_SECURITY", "CYBERSECURITY" -> title.contains("security") || desc.contains("threat") || desc.contains("cryptography") || desc.contains("vulnerability") || title.contains("cyber") || title.contains("penetration");
            case "QA_TESTING", "AUTOMATION_TEST" -> title.contains("qa") || title.contains("test") || title.contains("quality") || skills.contains("selenium") || skills.contains("playwright") || skills.contains("cypress") || skills.contains("testing");
            case "BUSINESS_ANALYST" -> title.contains("business analyst") || title.contains("product owner") || title.contains("requirements") || skills.contains("business analysis");
            case "TECH_SUPPORT" -> title.contains("support") || title.contains("helpdesk") || title.contains("servicedesk") || title.contains("suport tehnic") || title.contains("it service");
            case "SYSADMIN_NETWORK" -> title.contains("system admin") || title.contains("sysadmin") || title.contains("network") || title.contains("administrator de sistem") || title.contains("infrastructure");
            case "SCRUM_PM" -> title.contains("scrum master") || title.contains("project manager") || title.contains("agile coach") || title.contains("delivery manager");
            case "DBA_SQL" -> title.contains("database") || title.contains("dba") || title.contains("sql developer") || title.contains("oracle") || title.contains("postgres");
            case "ERP_SAP_CRM" -> title.contains("sap") || title.contains("salesforce") || title.contains("erp") || title.contains("crm") || title.contains("servicenow");
            case "UI_UX" -> title.contains("ui") || title.contains("ux") || title.contains("product designer") || title.contains("designer") || skills.contains("figma");
            case "EMBEDDED_CPP" -> title.contains("embedded") || title.contains("c++") || title.contains("c/") || skills.contains("c++") || desc.contains("autosar") || desc.contains("microcontroller") || desc.contains("firmware");
            case "IOS_SWIFT" -> title.contains("ios") || title.contains("swift") || skills.contains("swift");
            case "GAME_DEV" -> title.contains("game") || title.contains("unity") || title.contains("unreal") || skills.contains("unity") || desc.contains("gameplay");
            case "PRODUCT_MGMT" -> title.contains("product manager") || title.contains("technical product manager") || title.contains("product lead") || desc.contains("product roadmap");
            case "SOLUTIONS_ARCHITECT" -> title.contains("solutions architect") || title.contains("cloud architect") || title.contains("enterprise architect") || title.contains("software architect");
            case "BI_ETL" -> title.contains("power bi") || title.contains("bi developer") || title.contains("business intelligence") || title.contains("tableau") || title.contains("etl") || skills.contains("power bi");
            default -> true;
        };
    }

    public static String normalizeForDedup(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("\\b\\d{1,2}[./-]\\d{1,2}[./-]\\d{2,4}\\b", "")
                .replaceAll("\\b202[456789]\\b", "")
                .replaceAll("\\(m/w/d\\)|\\(f/m/d\\)|\\(m/f/d\\)|\\(h/f\\)", "")
                .replaceAll("[\\[\\]().,;:_\\-–—/\\\\]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public static String normalizeTextForFilter(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replace('ă', 'a')
                .replace('â', 'a')
                .replace('î', 'i')
                .replace('ș', 's')
                .replace('ş', 's')
                .replace('ț', 't')
                .replace('ţ', 't')
                .replaceAll("[^a-z0-9+#.\\s-]", " ")
                .replaceAll("\\s+", " ")
                .trim();
    }

    public static boolean isStrictlyItJob(String title) {
        if (title == null || title.isBlank() || title.length() < 3) return false;
        String t = normalizeTextForFilter(title);

        for (String bad : NON_IT_KEYWORDS) {
            if (t.contains(bad)) {
                if ((t.contains("engineer") || t.contains("developer")) &&
                    (t.contains("software") || t.contains("solutions") || t.contains("tech"))) {
                    // Caz tehnic permis
                } else {
                    return false;
                }
            }
        }

        for (Pattern p : IT_ROLE_PATTERNS) {
            if (p.matcher(t).find()) {
                return true;
            }
        }

        if (STANDALONE_IT_PATTERN.matcher(t).find()) {
            if (t.contains("junior") || t.contains("intern") || t.contains("specialist") ||
                t.contains("consultant") || t.contains("manager") || t.contains("officer") ||
                t.contains("expert") || t.contains("director")) {
                return true;
            }
        }

        return false;
    }

    public static String sanitizeScrapedDescription(String text) {
        if (text == null || text.isBlank()) return "";
        return text
                .replaceAll("(?i).*?Created with Sketch\\.?", "")
                .replaceAll("(?i).*?Created with Figma\\.?", "")
                .replaceAll("(?i)\\b\\d+_[A-Za-z0-9_\\- ]+Created with Sketch\\b", "")
                .replaceAll("(?m)^\\s*\\d+_[A-Za-z0-9_ -]{2,}\\s*$", "")
                .replaceAll("\\n{3,}", "\n\n")
                .trim();
    }
}
