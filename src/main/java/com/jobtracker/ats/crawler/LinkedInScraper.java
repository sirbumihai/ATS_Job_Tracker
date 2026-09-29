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
 * Scraper optimizat pentru LinkedIn Romania.
 * Rate-limit polite (concurrency controlata, delay jitter anti-429),
 * set extins si eficient de cautari pentru Junior, Graduate si Tester,
 * paginare exacta (offset = page * 10) si retry inteligent la 429.
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

    private record SearchQuery(String query, String location, String expFilter, int maxPages) {
        public SearchQuery(String query, String expFilter, int maxPages) {
            this(query, "Romania", expFilter, maxPages);
        }
    }

    @Override
    public String getPlatformName() {
        return "LINKEDIN";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        long startTime = System.currentTimeMillis();

        // 24 de interogari de cel mai inalt randament, focusate pe Junior, Graduate si Tester
        List<SearchQuery> searchQueries = List.of(
                // 1. Roluri Junior, Graduate & Companii specifice (fara f_E restrictiv pentru acoperire completa)
                new SearchQuery("Junior Software Developer Romania", "", 5),
                new SearchQuery("Graduate Software Engineer", "Bucharest, Romania", "", 5),
                new SearchQuery("Graduate Software Engineer Romania", "", 4),
                new SearchQuery("Junior Developer", "Bucharest, Romania", "", 4),
                new SearchQuery("Junior Java Developer Romania", "", 4),
                new SearchQuery("Junior Python Developer Romania", "", 4),
                new SearchQuery("Junior Frontend React Romania", "", 4),
                new SearchQuery("Junior .NET Developer Romania", "", 4),
                new SearchQuery("Junior C++ Developer Romania", "", 4),
                new SearchQuery("Junior DevOps Engineer Romania", "", 3),
                new SearchQuery("Junior Data Analyst Romania", "", 3),
                new SearchQuery("Junior Cyber Security Romania", "", 3),
                new SearchQuery("Bertrandt", "Romania", "", 4),
                new SearchQuery("Stagii pe Bune", "Romania", "", 4),

                // 2. QA, Tester & Test Automation (solicitate expres)
                new SearchQuery("Junior Tester Romania", "", 5),
                new SearchQuery("Software Tester", "Bucharest, Romania", "", 5),
                new SearchQuery("Software Tester Romania", "", 4),
                new SearchQuery("Junior QA Automation Romania", "", 4),
                new SearchQuery("QA Tester", "Bucharest, Romania", "", 4),

                // 3. Internship & Support
                new SearchQuery("Internship IT Romania", "f_E=1", 4),
                new SearchQuery("Software Intern Romania", "", 3),
                new SearchQuery("Junior IT Support Romania", "", 3),
                new SearchQuery("Technical Support Specialist Romania", "", 3),

                // 4. Middle / Senior IT
                new SearchQuery("Software Engineer Romania", "f_E=3", 3),
                new SearchQuery("Java Developer Romania", "f_E=3", 3),
                new SearchQuery("Senior Software Engineer Romania", "f_E=4", 2)
        );

        Set<String> seenJobUrls = ConcurrentHashMap.newKeySet();
        // Concurrency throttle: 1 request concurent cu pauza jitter pentru a preveni definitiv HTTP 429
        Semaphore concurrencyThrottle = new Semaphore(1);

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
            log.warn("[JOB CRAWLER] Eroare in executia LinkedIn: {}", e.getMessage());
        }

        long duration = System.currentTimeMillis() - startTime;
        log.info("[JOB CRAWLER] LinkedIn Romania Optimizat: {} joburi reale preluate in {} ms.",
                seenJobUrls.size(), duration);
    }

    private void scrapeQuery(SearchQuery sq, List<UnifiedJobListingDto> freshList,
                            Set<String> seenDedupKeys, Set<String> knownDbUrls, Set<String> seenJobUrls) {
        String query = sq.query();
        String location = sq.location() != null ? sq.location() : "Romania";
        String expFilter = sq.expFilter();
        int maxPages = sq.maxPages() > 0 ? sq.maxPages() : 3;

        for (int page = 0; page < maxPages; page++) {
            // LinkedIn guest API seeMoreJobPostings returneaza exact 10 carduri per pagina
            int offset = page * 10;
            boolean retried = false;

            while (true) {
                try {
                    // Polite delay anti-429 cu jitter
                    long delay = 350 + (long) (Math.random() * 250);
                    Thread.sleep(delay);

                    String encodedQuery = URLEncoder.encode(query, StandardCharsets.UTF_8);
                    String encodedLoc = URLEncoder.encode(location, StandardCharsets.UTF_8);
                    StringBuilder urlBuilder = new StringBuilder("https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?");
                    urlBuilder.append("keywords=").append(encodedQuery);
                    urlBuilder.append("&location=").append(encodedLoc);
                    urlBuilder.append("&sortBy=DD&f_TPR=r2592000");
                    if (expFilter != null && !expFilter.isBlank()) {
                        urlBuilder.append("&").append(expFilter);
                    }
                    urlBuilder.append("&start=").append(offset);
                    String queryUrl = urlBuilder.toString();

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
                        return; // Sfarsit de rezultate pentru acest query
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
                        String title = titleEl != null ? titleEl.text().trim() : null;
                        if (title == null || title.isBlank()) {
                            Element srOnly = linkEl.selectFirst("span.sr-only");
                            if (srOnly != null) {
                                title = srOnly.text().trim();
                            }
                        }
                        if (title == null || title.isBlank()) {
                            title = query;
                        }

                        if (!isStrictlyItJob(title)) continue;

                        Element compEl = card.selectFirst(".base-search-card__subtitle");
                        Element locEl = card.selectFirst(".job-search-card__location");
                        Element dateEl = card.selectFirst("time.job-search-card__listdate, time.job-search-card__listdate--new, time");
                        Element logoEl = card.selectFirst("img.artdeco-entity-image");
                        Element benefitEl = card.selectFirst(".job-posting-benefits__text");

                        String company = compEl != null ? compEl.text().trim() : "Tech Company";
                        String loc = locEl != null ? locEl.text().trim() : location;
                        String postedDate = dateEl != null ? dateEl.text().trim() : "Postat recent";
                        String dtAttr = dateEl != null ? dateEl.attr("datetime") : null;
                        String benefitText = benefitEl != null ? benefitEl.text().trim().toLowerCase() : "";

                        String logoUrl = logoEl != null && logoEl.hasAttr("data-delayed-url") ?
                                logoEl.attr("data-delayed-url") :
                                "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80";

                        String level = determineExperienceLevel(title, null);
                        if (level.equals("MID") && expFilter != null && expFilter.contains("f_E=1") &&
                                (title.toLowerCase().contains("intern") || title.toLowerCase().contains("stagiu") ||
                                 title.toLowerCase().contains("trainee") || title.toLowerCase().contains("student"))) {
                            level = "INTERNSHIP";
                        } else if (level.equals("MID") && expFilter != null && expFilter.contains("f_E=4") &&
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
                        String postedDateAgo = daysAgo == 0 ? "Astazi" : daysAgo == 1 ? "Ieri" : daysAgo > 1 ? (daysAgo + " zile in urma") : "Data nespecificata";

                        boolean isEarlyApplicant = benefitText.contains("early applicant") || benefitText.contains("primii 25");
                        String compLevel;
                        String compLabel;
                        String applicantCountText;

                        if (isEarlyApplicant) {
                            compLevel = "LOW";
                            compLabel = "Sansa Mare";
                            applicantCountText = "Sub 25 de candidati";
                        } else {
                            if (daysAgo >= 3 || postedDate.toLowerCase().contains("week") || postedDate.toLowerCase().contains("month")) {
                                compLevel = "HIGH";
                                compLabel = "Competitie Ridicata";
                                applicantCountText = "Peste 100 de aplicanti";
                            } else if (daysAgo >= 1 || isMajorTechBrand(company) || level.equals("JUNIOR") || level.equals("INTERNSHIP")) {
                                compLevel = "HIGH";
                                compLabel = "Competitie Ridicata";
                                applicantCountText = "50-100+ de aplicanti";
                            } else {
                                compLevel = "MEDIUM";
                                compLabel = "Competitie Medie";
                                applicantCountText = "25-50 de candidati";
                            }
                        }

                        List<String> skills = extractSkillsFromTitle(title);
                        String desc = "Pozitie activa de " + title + " la " + company + " (" + loc + "). " +
                                "Nivel identificat: " + level + ". Competente asociate: " + String.join(", ", skills) + ". " +
                                (benefitText.isEmpty() ? "Aplicare directa securizata pe platforma oficiala LinkedIn Romania." : "Beneficii evidentiate: " + benefitText + ". Aplicare directa pe LinkedIn.");

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

                        String contentHash = computeContentHash(title, company, desc, "Pachet Salarial Standard LinkedIn", String.join(",", skills), loc);
                        OffsetDateTime now = OffsetDateTime.now();

                        freshList.add(new UnifiedJobListingDto(
                                "li-live-" + externalId,
                                title,
                                company,
                                logoUrl,
                                loc,
                                loc.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID",
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

                    if (cards.size() < 5 || (newJobsThisPage == 0 && page > 0)) {
                        return;
                    }
                    break; // Pagina curenta a reusit, trecem la pagina urmatoare

                } catch (org.jsoup.HttpStatusException hse) {
                    if (hse.getStatusCode() == 429) {
                        if (!retried) {
                            retried = true;
                            log.warn("[JOB CRAWLER] LinkedIn rate limit (429) pentru query {}. Pauza racire 2.5s si reincercare...", query);
                            try { Thread.sleep(2500); } catch (InterruptedException ignored) {}
                            continue;
                        } else {
                            log.warn("[JOB CRAWLER] LinkedIn 429 persistent pentru query {}. Trecere la urmatoarea cautare.", query);
                            return;
                        }
                    } else {
                        log.warn("[JOB CRAWLER] LinkedIn scrape status {} pentru {}: {}", hse.getStatusCode(), query, hse.getMessage());
                        return;
                    }
                } catch (Exception e) {
                    log.warn("[JOB CRAWLER] LinkedIn scrape fallback pentru {}: {}", query, e.getMessage());
                    return;
                }
            }
        }
    }
}
