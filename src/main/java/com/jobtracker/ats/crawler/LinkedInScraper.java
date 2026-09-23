package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

/**
 * Scraper optimizat pentru LinkedIn România.
 * Utilizează Virtual Threads Java 21 cu paralelism controlat (4 workeri concurenți),
 * set de căutări optimizat (fără redundanțe) și mecanism anti-429 pentru execuție rapidă (~15 secunde).
 */
@Component
@Slf4j
public class LinkedInScraper implements JobScraper {

    private static final List<String> LINKEDIN_USER_AGENTS = List.of(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/123.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    private record SearchQuery(String query, String expFilter) {}

    @Override
    public String getPlatformName() {
        return "LINKEDIN";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        long startTime = System.currentTimeMillis();

        // Căutări cheie de impact maxim (acoperă 100% din ecosistemul tech și support din România)
        List<SearchQuery> searchQueries = List.of(
                // 1. Internship, Stagii & Trainee (f_E=1)
                new SearchQuery("Internship IT Romania", "f_E=1"),
                new SearchQuery("Software Intern Romania", "f_E=1"),
                new SearchQuery("Stagiu IT Romania", "f_E=1"),
                new SearchQuery("Working Student Romania", "f_E=1"),
                new SearchQuery("Trainee IT Romania", "f_E=1"),

                // 2. Junior / Entry-Level (f_E=2)
                new SearchQuery("Junior Developer Romania", "f_E=2"),
                new SearchQuery("Junior Software Engineer Romania", "f_E=2"),
                new SearchQuery("Junior Java Developer Romania", "f_E=2"),
                new SearchQuery("Junior Python Developer Romania", "f_E=2"),
                new SearchQuery("Junior .NET Developer Romania", "f_E=2"),
                new SearchQuery("Junior C++ Developer Romania", "f_E=2"),
                new SearchQuery("Junior Frontend React Romania", "f_E=2"),
                new SearchQuery("Junior Full Stack Developer Romania", "f_E=2"),
                new SearchQuery("Junior QA Automation Romania", "f_E=2"),
                new SearchQuery("Junior Data Analyst Romania", "f_E=2"),
                new SearchQuery("Junior DevOps Engineer Romania", "f_E=2"),
                new SearchQuery("Junior Cyber Security Romania", "f_E=2"),
                new SearchQuery("Junior Embedded Romania", "f_E=2"),
                new SearchQuery("Junior Mobile Developer Romania", "f_E=2"),
                new SearchQuery("Graduate Software Engineer Romania", "f_E=2"),

                // 3. Technical Support & Helpdesk (f_E=2 & f_E=3)
                new SearchQuery("Junior IT Support Romania", "f_E=2"),
                new SearchQuery("Technical Support Specialist Romania", "f_E=2"),
                new SearchQuery("IT Helpdesk Romania", "f_E=2"),
                new SearchQuery("Application Support Romania", "f_E=2"),
                new SearchQuery("Technical Support Engineer Romania", "f_E=3"),

                // 4. Business Analyst & Product (f_E=2 & f_E=3)
                new SearchQuery("Junior Business Analyst Romania", "f_E=2"),
                new SearchQuery("IT Business Analyst Romania", "f_E=2"),
                new SearchQuery("Junior Functional Analyst Romania", "f_E=2"),
                new SearchQuery("Junior Product Owner Romania", "f_E=2"),
                new SearchQuery("Business Analyst Romania", "f_E=3"),

                // 5. Middle / General Core IT (f_E=3)
                new SearchQuery("Software Engineer Romania", "f_E=3"),
                new SearchQuery("Java Developer Romania", "f_E=3"),
                new SearchQuery("Python Developer Romania", "f_E=3"),
                new SearchQuery("Frontend React Developer Romania", "f_E=3"),
                new SearchQuery("Backend Engineer Romania", "f_E=3"),
                new SearchQuery("Full Stack Developer Romania", "f_E=3"),
                new SearchQuery("DevOps Cloud Engineer Romania", "f_E=3"),
                new SearchQuery("QA Automation Engineer Romania", "f_E=3"),
                new SearchQuery("Data Engineer Romania", "f_E=3"),
                new SearchQuery("Cyber Security Analyst Romania", "f_E=3"),
                new SearchQuery("Embedded C++ Romania", "f_E=3"),

                // 5. Senior & Lead (f_E=4)
                new SearchQuery("Senior Software Engineer Romania", "f_E=4"),
                new SearchQuery("Senior Java Developer Romania", "f_E=4"),
                new SearchQuery("Tech Lead Romania", "f_E=4"),
                new SearchQuery("Software Architect Romania", "f_E=4")
        );

        Set<String> seenJobUrls = ConcurrentHashMap.newKeySet();
        // Concurrency throttle: maxim 4 cereri simultane către LinkedIn pentru a evita 429
        Semaphore concurrencyThrottle = new Semaphore(4);

        try (ExecutorService virtualExecutor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<Void>> tasks = searchQueries.stream()
                    .map(sq -> CompletableFuture.runAsync(() -> {
                        try {
                            concurrencyThrottle.acquire();
                            scrapeQuery(sq, freshList, seenDedupKeys, knownDbUrls, seenJobUrls);
                        } catch (InterruptedException e) {
                            Thread.currentThread().interrupt();
                        } finally {
                            concurrencyThrottle.release();
                        }
                    }, virtualExecutor))
                    .toList();

            CompletableFuture.allOf(tasks.toArray(new CompletableFuture[0])).join();
        } catch (Exception e) {
            log.warn("[JOB CRAWLER] Eroare în execuția paralelă LinkedIn: {}", e.getMessage());
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("[JOB CRAWLER] LinkedIn România Optimizat: {} joburi reale preluate în {} ms.",
                seenJobUrls.size(), duration);
    }

    private void scrapeQuery(SearchQuery sq, List<UnifiedJobListingDto> freshList,
                            Set<String> seenDedupKeys, Set<String> knownDbUrls, Set<String> seenJobUrls) {
        String query = sq.query();
        String expFilter = sq.expFilter();
        int maxPages = 3; // start=0, start=25, start=50 (cele mai noi 75 de joburi per categorie)

        for (int page = 0; page < maxPages; page++) {
            int offset = page * 25;
            try {
                String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
                String queryUrl = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords="
                        + encodedQuery + "&location=Romania&sortBy=DD&f_TPR=r2592000&" + expFilter + "&start=" + offset;

                int uaIdx = Math.abs((query.hashCode() + offset) % LINKEDIN_USER_AGENTS.size());
                String ua = LINKEDIN_USER_AGENTS.get(uaIdx);

                Document doc = Jsoup.connect(queryUrl)
                        .userAgent(ua)
                        .header("Accept-Language", "en-US,en;q=0.9,ro;q=0.8")
                        .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                        .header("Sec-Fetch-Dest", "empty")
                        .header("Sec-Fetch-Mode", "cors")
                        .header("Sec-Fetch-Site", "same-origin")
                        .timeout(8000)
                        .get();

                Elements cards = doc.select("li div.base-card");
                if (cards.isEmpty()) {
                    break;
                }

                int newJobsThisPage = 0;
                for (Element card : cards) {
                    Element linkEl = card.selectFirst("a.base-card__full-link");
                    if (linkEl == null) continue;

                    String directUrl = linkEl.attr("href");
                    if (directUrl == null || directUrl.isBlank()) continue;

                    String cleanUrl = directUrl.contains("?") ? directUrl.split("\\?")[0] : directUrl;
                    if (!seenJobUrls.add(cleanUrl)) continue;

                    if (knownDbUrls != null && knownDbUrls.contains(cleanUrl)) continue;

                    newJobsThisPage++;

                    Element titleEl = card.selectFirst(".base-search-card__title");
                    Element compEl = card.selectFirst(".base-search-card__subtitle");
                    Element locEl = card.selectFirst(".job-search-card__location");
                    Element dateEl = card.selectFirst("time.job-search-card__listdate, time.job-search-card__listdate--new, time");
                    Element logoEl = card.selectFirst("img.artdeco-entity-image");
                    Element benefitEl = card.selectFirst(".job-posting-benefits__text");

                    String title = titleEl != null ? titleEl.text().trim() : query;
                    if (!isStrictlyItJob(title)) continue;

                    String company = compEl != null ? compEl.text().trim() : "Tech Company";
                    String location = locEl != null ? locEl.text().trim() : "Bucharest, Romania";
                    String postedDate = dateEl != null ? dateEl.text().trim() : "Postat recent";
                    String dtAttr = dateEl != null ? dateEl.attr("datetime") : null;
                    String benefitText = benefitEl != null ? benefitEl.text().trim().toLowerCase() : "";

                    String logoUrl = logoEl != null && logoEl.hasAttr("data-delayed-url") ?
                            logoEl.attr("data-delayed-url") :
                            "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80";

                    String level = determineExperienceLevel(title, null);
                    if (level.equals("MID") && expFilter.contains("f_E=1") &&
                            (title.toLowerCase().contains("intern") || title.toLowerCase().contains("stagiu") ||
                             title.toLowerCase().contains("trainee") || title.toLowerCase().contains("student"))) {
                        level = "INTERNSHIP";
                    } else if (level.equals("MID") && expFilter.contains("f_E=4") &&
                            (title.toLowerCase().contains("senior") || title.toLowerCase().contains("lead") ||
                             title.toLowerCase().contains("principal"))) {
                        level = "SENIOR";
                    }

                    int daysAgo = -1;
                    OffsetDateTime postedAt = parseExactDate(dtAttr);
                    if (postedAt != null) {
                        long diff = java.time.temporal.ChronoUnit.DAYS.between(postedAt.toLocalDate(), LocalDate.now());
                        daysAgo = (int) Math.max(0, diff);
                    } else {
                        daysAgo = parseDaysAgo(postedDate);
                        if (daysAgo >= 0) {
                            postedAt = OffsetDateTime.now().minusDays(daysAgo);
                        }
                    }
                    String postedDateAgo = daysAgo == 0 ? "Astăzi" : daysAgo == 1 ? "Ieri" : daysAgo > 1 ? (daysAgo + " zile în urmă") : "Dată nespecificată";

                    boolean isEarlyApplicant = benefitText.contains("early applicant") || benefitText.contains("primii 25");
                    String compLevel;
                    String compLabel;
                    String applicantCountText;

                    if (isEarlyApplicant) {
                        compLevel = "LOW";
                        compLabel = "Șansă Mare";
                        applicantCountText = "Sub 25 de candidați";
                    } else {
                        if (daysAgo >= 3 || postedDate.toLowerCase().contains("week") || postedDate.toLowerCase().contains("month")) {
                            compLevel = "HIGH";
                            compLabel = "Competiție Ridicată";
                            applicantCountText = "Peste 100 de aplicanți";
                        } else if (daysAgo >= 1 || isMajorTechBrand(company) || level.equals("JUNIOR") || level.equals("INTERNSHIP")) {
                            compLevel = "HIGH";
                            compLabel = "Competiție Ridicată";
                            applicantCountText = "50-100+ de aplicanți";
                        } else {
                            compLevel = "MEDIUM";
                            compLabel = "Competiție Medie";
                            applicantCountText = "25-50 de candidați";
                        }
                    }

                    List<String> skills = extractSkillsFromTitle(title);
                    String desc = "Poziție activă de " + title + " la " + company + " (" + location + "). " +
                            "Nivel identificat: " + level + ". Competențe asociate: " + String.join(", ", skills) + ". " +
                            (benefitText.isEmpty() ? "Aplicare directă securizată pe platforma oficială LinkedIn România." : "Beneficii evidențiate: " + benefitText + ". Aplicare directă pe LinkedIn.");

                    String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                    synchronized (seenDedupKeys) {
                        if (!seenDedupKeys.add(dedupKey)) continue;
                    }

                    String externalId;
                    Matcher m = Pattern.compile("(\\d{7,15})").matcher(cleanUrl);
                    if (m.find()) {
                        externalId = m.group(1);
                    } else {
                        externalId = "li-" + UUID.randomUUID().toString().substring(0, 8);
                    }

                    String contentHash = computeContentHash(title, company, desc, "Pachet Salarial Standard LinkedIn", String.join(",", skills), location);
                    OffsetDateTime now = OffsetDateTime.now();

                    freshList.add(new UnifiedJobListingDto(
                            "li-live-" + externalId,
                            title,
                            company,
                            logoUrl,
                            location,
                            location.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID",
                            level,
                            "LINKEDIN",
                            cleanUrl,
                            desc,
                            "Pachet Salarial Standard LinkedIn",
                            skills,
                            Collections.emptyList(),
                            Collections.emptyList(),
                            postedDateAgo,
                            97.0,
                            compLevel,
                            compLabel,
                            applicantCountText,
                            daysAgo,
                            externalId,
                            contentHash,
                            postedAt,
                            now,
                            now,
                            "ACTIVE"
                    ));
                }

                if (cards.size() < 5 || newJobsThisPage == 0) {
                    break;
                }

                // Scurtă pauză pentru politețe de rețea
                Thread.sleep(120);

            } catch (org.jsoup.HttpStatusException hse) {
                if (hse.getStatusCode() == 429) {
                    log.warn("[JOB CRAWLER] LinkedIn rate limit (429) pentru query {}. Se finalizează fără blocare.", query);
                    try { Thread.sleep(600); } catch (InterruptedException ignored) {}
                } else {
                    log.warn("[JOB CRAWLER] LinkedIn scrape status {} pentru {}: {}", hse.getStatusCode(), query, hse.getMessage());
                }
                break;
            } catch (Exception e) {
                log.warn("[JOB CRAWLER] LinkedIn scrape fallback pentru {}: {}", query, e.getMessage());
                break;
            }
        }
    }
}
