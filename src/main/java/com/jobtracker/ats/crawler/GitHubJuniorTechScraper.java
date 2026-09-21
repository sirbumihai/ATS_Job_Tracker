package com.jobtracker.ats.crawler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

/**
 * Scraper specializat pentru roluri de debut (Junior, Intern, Graduate / Early Careers)
 * agregate din repository-uri comunitare GitHub dedicate:
 * 1. simonesiega/european-tech-opportunities-2027 (700+ joburi tech din Europa)
 * 2. speedyapply/2027-AI-College-Jobs (NEW_GRAD_INTL.md & INTERN_INTL.md)
 *
 * Filtrează strict oportunitățile din Europa și cele Worldwide / Remote
 * pentru a maximiza șansele reale de angajare ale candidaților din România și UE.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class GitHubJuniorTechScraper implements JobScraper {

    private final ObjectMapper objectMapper;

    public static final String PLATFORM_NAME = "GITHUB_COMMUNITY";

    private static final String EU_OPPORTUNITIES_URL =
            "https://opportunities2027.simonesiega.com/open-opportunities.json";
    private static final String SPEEDY_NEW_GRAD_INTL_URL =
            "https://raw.githubusercontent.com/speedyapply/2027-AI-College-Jobs/main/NEW_GRAD_INTL.md";
    private static final String SPEEDY_INTERN_INTL_URL =
            "https://raw.githubusercontent.com/speedyapply/2027-AI-College-Jobs/main/INTERN_INTL.md";

    private static final Pattern URL_PATTERN = Pattern.compile("href=\"([^\"]+)\"|\\((https?://[^)]+)\\)");
    private static final Pattern AGE_PATTERN = Pattern.compile("(\\d+)\\s*([dwmo])", Pattern.CASE_INSENSITIVE);

    private static final Set<String> EUROPEAN_AND_REMOTE_KEYWORDS = Set.of(
            "uk", "united kingdom", "great britain", "england", "scotland", "wales",
            "london", "manchester", "birmingham", "edinburgh", "belfast", "cambridge", "oxford", "bristol",
            "germany", "deutschland", "berlin", "munich", "munchen", "frankfurt", "hamburg", "cologne", "stuttgart",
            "netherlands", "holland", "amsterdam", "rotterdam", "utrecht", "eindhoven", "hague",
            "ireland", "dublin", "cork", "galway",
            "france", "paris", "lyon", "toulouse", "bordeaux", "nantes",
            "switzerland", "schweiz", "suisse", "zurich", "geneva", "lausanne", "basel",
            "poland", "polska", "warsaw", "warszawa", "krakow", "wroclaw", "poznan", "gdansk",
            "romania", "bucharest", "bucuresti", "cluj", "timisoara", "iasi", "brasov", "sibiu",
            "spain", "espana", "madrid", "barcelona", "valencia", "seville",
            "italy", "italia", "milan", "milano", "rome", "roma", "turin",
            "sweden", "sverige", "stockholm", "gothenburg", "malmo",
            "denmark", "danmark", "copenhagen",
            "norway", "norge", "oslo", "bergen",
            "finland", "suomi", "helsinki", "espoo",
            "austria", "vienna", "wien", "graz",
            "belgium", "belgique", "brussels", "bruxelles", "antwerp",
            "portugal", "lisbon", "lisboa", "porto",
            "czech", "czechia", "prague", "praha", "brno",
            "hungary", "budapest",
            "estonia", "tallinn", "tartu",
            "latvia", "riga",
            "lithuania", "vilnius", "kaunas",
            "slovakia", "bratislava",
            "slovenia", "ljubljana",
            "croatia", "zagreb",
            "bulgaria", "sofia",
            "greece", "athens",
            "luxembourg", "cyprus", "malta", "iceland",
            "europe", "european", "emea", "eu",
            "remote", "worldwide", "anywhere", "global", "wfh"
    );

    @Override
    public String getPlatformName() {
        return PLATFORM_NAME;
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        HttpClient client = HttpClient.newBuilder()
                .followRedirects(HttpClient.Redirect.ALWAYS)
                .connectTimeout(Duration.ofSeconds(12))
                .build();

        int initialSize = freshList.size();

        // Sursa 1: European Tech Opportunities 2027 (JSON)
        try {
            String jsonContent = fetchContent(client, EU_OPPORTUNITIES_URL);
            if (jsonContent != null && !jsonContent.isBlank()) {
                parseEuropeanTechJson(jsonContent, freshList, seenDedupKeys, knownDbUrls);
            }
        } catch (Exception e) {
            log.warn("[GITHUB CRAWLER] Eroare la preluarea European Tech Opportunities: {}", e.getMessage());
        }

        // Sursa 2: SpeedyApply New Grad International (Markdown table)
        try {
            String mdContent = fetchContent(client, SPEEDY_NEW_GRAD_INTL_URL);
            if (mdContent != null && !mdContent.isBlank()) {
                parseMarkdownTable(mdContent, "JUNIOR", freshList, seenDedupKeys, knownDbUrls);
            }
        } catch (Exception e) {
            log.warn("[GITHUB CRAWLER] Eroare la preluarea SpeedyApply New Grad Intl: {}", e.getMessage());
        }

        // Sursa 3: SpeedyApply Internships International (Markdown table)
        try {
            String mdContent = fetchContent(client, SPEEDY_INTERN_INTL_URL);
            if (mdContent != null && !mdContent.isBlank()) {
                parseMarkdownTable(mdContent, "INTERNSHIP", freshList, seenDedupKeys, knownDbUrls);
            }
        } catch (Exception e) {
            log.warn("[GITHUB CRAWLER] Eroare la preluarea SpeedyApply Intern Intl: {}", e.getMessage());
        }

        int added = freshList.size() - initialSize;
        log.info("[GITHUB CRAWLER] S-au adăugat {} joburi noi verificate (Europa & Worldwide Remote).", added);
    }

    private String fetchContent(HttpClient client, String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("User-Agent", BROWSER_USER_AGENT)
                    .timeout(Duration.ofSeconds(15))
                    .GET()
                    .build();
            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return response.body();
            } else {
                log.warn("[GITHUB CRAWLER] Status HTTP {} pentru {}", response.statusCode(), url);
            }
        } catch (Exception e) {
            // Fallback la Jsoup în caz de erori de rețea specifice
            try {
                return Jsoup.connect(url)
                        .userAgent(BROWSER_USER_AGENT)
                        .ignoreContentType(true)
                        .maxBodySize(10 * 1024 * 1024)
                        .timeout(15000)
                        .execute()
                        .body();
            } catch (Exception fallbackEx) {
                log.warn("[GITHUB CRAWLER] Fallback eșuat pentru {}: {}", url, fallbackEx.getMessage());
            }
        }
        return null;
    }

    public void parseEuropeanTechJson(String jsonContent, List<UnifiedJobListingDto> freshList,
                                      Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        try {
            JsonNode root = objectMapper.readTree(jsonContent);
            if (!root.isArray()) return;

            for (JsonNode item : root) {
                String title = item.hasNonNull("title") ? item.get("title").asText().trim() : null;
                String company = item.hasNonNull("company") ? item.get("company").asText().trim() : null;
                String link = item.hasNonNull("link") ? item.get("link").asText().trim() : null;
                String location = item.hasNonNull("location") ? item.get("location").asText().trim() : "Europe";
                String empType = item.hasNonNull("employment_type") ? item.get("employment_type").asText().trim() : "new-grad";
                String category = item.hasNonNull("category") ? item.get("category").asText().trim() : "Software Development";
                String industries = item.hasNonNull("industries") ? item.get("industries").asText().trim() : "";
                String linkedinJobId = item.hasNonNull("linkedin_job_id") ? item.get("linkedin_job_id").asText().trim() : null;

                if (title == null || company == null || link == null || link.isBlank()) continue;
                if (!isStrictlyItJob(title)) continue;

                if (knownDbUrls != null && knownDbUrls.contains(link)) continue;

                String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                if (!seenDedupKeys.add(dedupKey)) continue;

                String level = "internship".equalsIgnoreCase(empType) ? "INTERNSHIP" : determineExperienceLevel(title);
                String workModel = isRemoteWork(location) ? "REMOTE" : "HYBRID";
                List<String> skills = extractSkills(title, category + " " + industries);
                String extId = linkedinJobId != null ? linkedinJobId : String.valueOf(Math.abs(link.hashCode()));

                String desc = String.format(
                        "Oportunitate tehnică de debut (%s) la compania %s în cadrul programului european 2027. Categorie: %s. Locație: %s. Tech stack & domenii: %s. Aplicare directă pe platforma angajatorului.",
                        level.equals("INTERNSHIP") ? "Internship" : "Graduate / Junior",
                        company,
                        category,
                        location,
                        String.join(", ", skills)
                );

                String logoUrl = getCompanyLogoUrl(company);
                String contentHash = computeContentHash(title, company, desc, "Salariu Conform Anunț", String.join(",", skills), location);
                OffsetDateTime now = OffsetDateTime.now();
                OffsetDateTime postedAt = now.minusDays(3);

                freshList.add(new UnifiedJobListingDto(
                        "gh-eu-" + extId,
                        title,
                        company,
                        logoUrl,
                        location,
                        workModel,
                        level,
                        PLATFORM_NAME,
                        link,
                        desc,
                        "Salariu Conform Anunț",
                        skills,
                        Collections.emptyList(),
                        Collections.emptyList(),
                        "3 zile în urmă",
                        96.0,
                        "LOW",
                        "Șansă Mare",
                        "Sub 35 de candidați",
                        3,
                        extId,
                        contentHash,
                        postedAt,
                        now,
                        now,
                        "ACTIVE"
                ));
            }
        } catch (Exception e) {
            log.warn("[GITHUB CRAWLER] Eroare la parsarea European Tech JSON: {}", e.getMessage());
        }
    }

    public void parseMarkdownTable(String markdownContent, String defaultLevel, List<UnifiedJobListingDto> freshList,
                                   Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        String[] lines = markdownContent.split("\\r?\\n");
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.startsWith("|") || !trimmed.endsWith("|")) continue;
            if (trimmed.contains("Company") && trimmed.contains("Position")) continue;
            if (trimmed.contains("---|---")) continue;

            String[] rawCols = trimmed.split("\\|");
            // Format standard tabel: | Company | Position | Location | Posting | Age |
            // Splitting "| A | B | C | D | E |" yields: [ "", "A", "B", "C", "D", "E" ]
            if (rawCols.length < 6) continue;

            String companyCol = rawCols[1].trim();
            String positionCol = rawCols[2].trim();
            String locationCol = rawCols[3].trim();
            String postingCol = rawCols[4].trim();
            String ageCol = rawCols[5].trim();

            String company = Jsoup.parse(companyCol).text().trim();
            String title = Jsoup.parse(positionCol).text().trim();
            String location = Jsoup.parse(locationCol).text().trim();

            if (company.isEmpty() || title.isEmpty()) continue;
            if (!isStrictlyItJob(title)) continue;

            if (location.isEmpty()) {
                location = "Remote / Worldwide";
            }

            // Filtrare strictă: Acceptăm exclusiv roluri din Europa și cele Worldwide / Remote
            if (!isEuropeanOrRemoteLocation(location)) {
                continue;
            }

            String directApplyUrl = extractApplyUrl(postingCol);
            if (directApplyUrl == null || directApplyUrl.isBlank()) continue;

            if (knownDbUrls != null && knownDbUrls.contains(directApplyUrl)) continue;

            String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
            if (!seenDedupKeys.add(dedupKey)) continue;

            int daysAgo = parseAgeDays(ageCol);
            String level = "INTERNSHIP".equalsIgnoreCase(defaultLevel) ? "INTERNSHIP" : determineExperienceLevel(title);
            String workModel = isRemoteWork(location) ? "REMOTE" : "HYBRID";
            List<String> skills = extractSkills(title, company);
            String extId = String.valueOf(Math.abs(directApplyUrl.hashCode()));

            String desc = String.format(
                    "Poziție de debut tech (%s) la %s identificată în repository-urile GitHub Early Careers. Locație deschisă: %s. Tehnologii principale: %s. Candidații din România și UE pot aplica direct.",
                    level.equals("INTERNSHIP") ? "Internship / Trainee" : "Junior / Graduate",
                    company,
                    location,
                    String.join(", ", skills)
            );

            String logoUrl = getCompanyLogoUrl(company);
            String postedDateAgo = daysAgo == 0 ? "Astăzi" : daysAgo == 1 ? "Ieri" : daysAgo + " zile în urmă";
            String compLevel = daysAgo <= 14 ? "LOW" : "MEDIUM";
            String compLabel = daysAgo <= 14 ? "Șansă Mare" : "Competiție Medie";
            String applicantText = daysAgo <= 14 ? "Sub 30 de candidați" : "50-100 de candidați";

            OffsetDateTime now = OffsetDateTime.now();
            OffsetDateTime postedAt = now.minusDays(daysAgo);
            String contentHash = computeContentHash(title, company, desc, "Salariu Conform Anunț", String.join(",", skills), location);

            freshList.add(new UnifiedJobListingDto(
                    "gh-intl-" + extId,
                    title,
                    company,
                    logoUrl,
                    location,
                    workModel,
                    level,
                    PLATFORM_NAME,
                    directApplyUrl,
                    desc,
                    "Salariu Conform Anunț",
                    skills,
                    Collections.emptyList(),
                    Collections.emptyList(),
                    postedDateAgo,
                    95.0,
                    compLevel,
                    compLabel,
                    applicantText,
                    daysAgo,
                    extId,
                    contentHash,
                    postedAt,
                    now,
                    now,
                    "ACTIVE"
            ));
        }
    }

    public static boolean isEuropeanOrRemoteLocation(String location) {
        if (location == null || location.isBlank()) return false;
        String locNorm = normalizeDiacritics(location.toLowerCase());

        for (String kw : EUROPEAN_AND_REMOTE_KEYWORDS) {
            if (locNorm.contains(kw)) {
                return true;
            }
        }
        return false;
    }

    private static boolean isRemoteWork(String location) {
        if (location == null) return false;
        String loc = location.toLowerCase();
        return loc.contains("remote") || loc.contains("worldwide") || loc.contains("anywhere") || loc.contains("wfh") || loc.contains("global");
    }

    public static String extractApplyUrl(String postingCol) {
        if (postingCol == null) return null;
        Matcher m = URL_PATTERN.matcher(postingCol);
        if (m.find()) {
            String u1 = m.group(1);
            if (u1 != null && !u1.isBlank()) return u1;
            String u2 = m.group(2);
            if (u2 != null && !u2.isBlank()) return u2;
        }
        return null;
    }

    public static int parseAgeDays(String ageCol) {
        if (ageCol == null || ageCol.isBlank()) return 7;
        Matcher m = AGE_PATTERN.matcher(ageCol.trim());
        if (m.find()) {
            try {
                int value = Integer.parseInt(m.group(1));
                String unit = m.group(2).toLowerCase();
                return switch (unit) {
                    case "d" -> value;
                    case "w" -> value * 7;
                    case "mo", "m" -> value * 30;
                    default -> value;
                };
            } catch (Exception ignored) {}
        }
        return 7;
    }

    private static String getCompanyLogoUrl(String company) {
        if (company == null || company.isBlank()) {
            return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120&auto=format&fit=crop&q=80";
        }
        String clean = company.trim().toLowerCase().replaceAll("[^a-z0-9]", "");
        if (clean.contains("google")) return "https://www.google.com/favicon.ico";
        if (clean.contains("meta")) return "https://static.xx.fbcdn.net/rsrc.php/yT/r/a9RugiijeAr.ico";
        if (clean.contains("amazon")) return "https://www.amazon.com/favicon.ico";
        if (clean.contains("tiktok")) return "https://lf16-tiktok-web.ttwstatic.com/obj/tiktok-web/common/images/logo_icon.ico";
        if (clean.contains("nvidia")) return "https://www.nvidia.com/favicon.ico";
        if (clean.contains("optiver")) return "https://www.optiver.com/favicon.ico";
        if (clean.contains("bloomberg")) return "https://www.bloomberg.com/favicon.ico";
        if (clean.contains("cisco")) return "https://www.cisco.com/favicon.ico";
        if (clean.contains("jane")) return "https://www.janestreet.com/favicon.ico";
        if (clean.contains("citadel")) return "https://www.citadel.com/favicon.ico";

        return "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=120&auto=format&fit=crop&q=80";
    }
}
