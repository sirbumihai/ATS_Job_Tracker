package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.HttpStatusException;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.function.Supplier;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

/**
 * Scraper pentru LinkedIn România, prin API-ul public de căutare (fără cont).
 * Fiecare căutare rulează pe propriul Virtual Thread, iar {@link RequestThrottle} dozează cererile
 * comune către LinkedIn: o rafală la pornire, apoi un ritm constant cât LinkedIn îl acceptă.
 * O pagină refuzată cu HTTP 429 se reîncearcă după o pauză comună, ca să nu se piardă joburi.
 */
@Component
@Slf4j
public class LinkedInScraper implements JobScraper {

    static final String PLATFORM = "LINKEDIN";
    private static final String SEARCH_URL = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search";
    private static final Pattern JOB_ID_PATTERN = Pattern.compile("(\\d{7,15})");
    private static final int REQUEST_TIMEOUT_MS = 8_000;

    // API-ul de căutare întoarce câte 10 carduri pe pagină
    private static final int PAGE_SIZE = 10;
    private static final int MIN_CARDS_FOR_NEXT_PAGE = 5;
    private static final int MAX_ATTEMPTS_PER_PAGE = 4;

    // Măsurat (noiembrie 2026): LinkedIn acceptă o rafală de ~15 cereri, apoi răspunde cu 429 la cam una
    // din 6-8 cereri chiar și la 0,5-1 cereri/s, și mai des peste ~1 cerere/s. Pornim în rafală (4 cereri
    // simultane, la 250-400 ms una după alta), apoi ținem ~1 cerere la 0,85-1 s: un ritm mai rar nu rărește
    // 429-urile destul cât să merite, unul mai des le înmulțește și pierde timp în pauze.
    static final int MAX_PARALLEL_REQUESTS = 4;
    private static final long BURST_GAP_MS = 250;
    private static final long STEADY_GAP_MS = 850;
    private static final long MAX_GAP_MS = 2_000;
    private static final long GAP_JITTER_MS = 150;

    private static final List<String> USER_AGENTS = List.of(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/123.0.0.0 Safari/537.36",
            "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36"
    );

    record SearchQuery(String query, String location, String expFilter, int maxPages) {
        SearchQuery {
            location = location != null ? location : "Romania";
            expFilter = expFilter != null ? expFilter : "";
        }

        SearchQuery(String query, String expFilter, int maxPages) {
            this(query, "Romania", expFilter, maxPages);
        }
    }

    // Căutări focusate pe Junior, Graduate și Tester; maxPages = câte pagini de 10 joburi se citesc cel mult
    static final List<SearchQuery> SEARCH_QUERIES = List.of(
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

    /** Descarcă o pagină de rezultate; separat de scraper, ca testele să poată simula răspunsurile LinkedIn. */
    @FunctionalInterface
    interface SearchPageSource {
        Document fetch(String url, String userAgent) throws IOException;
    }

    private final SearchPageSource pageSource;
    private final Supplier<RequestThrottle> throttleFactory;

    public LinkedInScraper() {
        this(LinkedInScraper::fetchSearchPage, LinkedInScraper::newThrottle);
    }

    LinkedInScraper(SearchPageSource pageSource, Supplier<RequestThrottle> throttleFactory) {
        this.pageSource = pageSource;
        this.throttleFactory = throttleFactory;
    }

    @Override
    public String getPlatformName() {
        return PLATFORM;
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        scrape(SEARCH_QUERIES, freshList, seenDedupKeys, knownDbUrls);
    }

    void scrape(List<SearchQuery> queries, List<UnifiedJobListingDto> freshList,
                Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        long startTime = System.currentTimeMillis();
        int sizeBefore = freshList.size();
        RequestThrottle throttle = throttleFactory.get();
        Set<String> seenJobUrls = ConcurrentHashMap.newKeySet();

        // Un Virtual Thread per căutare; close() așteaptă să se termine toate
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (SearchQuery sq : queries) {
                executor.submit(() -> scrapeQuery(sq, throttle, freshList, seenDedupKeys, knownDbUrls, seenJobUrls));
            }
        }

        if (throttle.isBlocked()) {
            log.warn("[JOB CRAWLER] LinkedIn refuză sau nu mai răspunde la cereri; se păstrează joburile colectate până acum.");
        }
        log.info("[JOB CRAWLER] LinkedIn România: {} joburi noi din {} anunțuri parcurse în {} ms.",
                freshList.size() - sizeBefore, seenJobUrls.size(), System.currentTimeMillis() - startTime);
    }

    private void scrapeQuery(SearchQuery sq, RequestThrottle throttle, List<UnifiedJobListingDto> freshList,
                             Set<String> seenDedupKeys, Set<String> knownDbUrls, Set<String> seenJobUrls) {
        try {
            for (int page = 0; page < sq.maxPages(); page++) {
                Document doc = fetchPage(sq, page * PAGE_SIZE, throttle);
                if (doc == null) return;

                PageResult result = parseResultsPage(doc, sq, freshList, seenDedupKeys, knownDbUrls, seenJobUrls);
                // Ultima pagină de rezultate sau una fără anunțuri noi: paginile următoare nu mai aduc nimic
                if (result.cards() < MIN_CARDS_FOR_NEXT_PAGE || (result.newJobs() == 0 && page > 0)) return;
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        } catch (RuntimeException e) {
            log.warn("[JOB CRAWLER] LinkedIn: căutarea „{}” s-a oprit: {}", sq.query(), e.getMessage());
        }
    }

    // După 429, timeout sau 5xx pagina se reîncearcă; pauza dintre încercări o impune RequestThrottle
    private Document fetchPage(SearchQuery sq, int offset, RequestThrottle throttle) throws InterruptedException {
        String url = searchUrl(sq, offset);
        String userAgent = USER_AGENTS.get(Math.floorMod(sq.query().hashCode() + offset, USER_AGENTS.size()));

        IOException lastError = null;
        for (int attempt = 1; attempt <= MAX_ATTEMPTS_PER_PAGE; attempt++) {
            try {
                return throttle.execute(() -> pageSource.fetch(url, userAgent));
            } catch (RequestThrottle.BlockedException e) {
                return null;
            } catch (HttpStatusException e) {
                if (e.getStatusCode() != 429 && e.getStatusCode() < 500) {
                    log.warn("[JOB CRAWLER] LinkedIn status {} pentru „{}” (start={}).", e.getStatusCode(), sq.query(), offset);
                    return null;
                }
                lastError = e;
            } catch (IOException e) {
                lastError = e;
            }
        }
        log.warn("[JOB CRAWLER] LinkedIn: „{}” (start={}) a eșuat după {} încercări: {}",
                sq.query(), offset, MAX_ATTEMPTS_PER_PAGE, lastError.getMessage());
        return null;
    }

    static String searchUrl(SearchQuery sq, int offset) {
        StringBuilder url = new StringBuilder(SEARCH_URL)
                .append("?keywords=").append(URLEncoder.encode(sq.query(), StandardCharsets.UTF_8))
                .append("&location=").append(URLEncoder.encode(sq.location(), StandardCharsets.UTF_8))
                .append("&sortBy=DD&f_TPR=r2592000");
        if (!sq.expFilter().isBlank()) {
            url.append('&').append(sq.expFilter());
        }
        return url.append("&start=").append(offset).toString();
    }

    static boolean isRateLimited(IOException e) {
        return e instanceof HttpStatusException status && status.getStatusCode() == 429;
    }

    private static RequestThrottle newThrottle() {
        return new RequestThrottle(MAX_PARALLEL_REQUESTS, BURST_GAP_MS, STEADY_GAP_MS, MAX_GAP_MS, GAP_JITTER_MS,
                LinkedInScraper::isRateLimited);
    }

    private static Document fetchSearchPage(String url, String userAgent) throws IOException {
        return Jsoup.connect(url)
                .userAgent(userAgent)
                .header("Accept-Language", "en-US,en;q=0.9,ro;q=0.8")
                .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                .header("Sec-Fetch-Dest", "empty")
                .header("Sec-Fetch-Mode", "cors")
                .header("Sec-Fetch-Site", "same-origin")
                .timeout(REQUEST_TIMEOUT_MS)
                .get();
    }

    record PageResult(int cards, int newJobs) {}

    PageResult parseResultsPage(Document doc, SearchQuery sq, List<UnifiedJobListingDto> freshList,
                                Set<String> seenDedupKeys, Set<String> knownDbUrls, Set<String> seenJobUrls) {
        String expFilter = sq.expFilter();

        Elements cards = doc.select("li div.base-card");
        int newJobsThisPage = 0;
        for (Element card : cards) {
            Element linkEl = card.selectFirst("a.base-card__full-link");
            if (linkEl == null) continue;

            String directUrl = linkEl.attr("href");
            if (directUrl.isBlank()) continue;

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
            if (title == null || title.isBlank()) continue;
            if (!isStrictlyItJob(title)) continue;

            Element compEl = card.selectFirst(".base-search-card__subtitle");
            Element locEl = card.selectFirst(".job-search-card__location");
            Element dateEl = card.selectFirst("time.job-search-card__listdate, time.job-search-card__listdate--new, time");
            Element logoEl = card.selectFirst("img.artdeco-entity-image");
            Element benefitEl = card.selectFirst(".job-posting-benefits__text");

            String company = compEl != null ? compEl.text().trim() : null;
            String loc = locEl != null ? locEl.text().trim() : sq.location();
            String postedDate = dateEl != null ? dateEl.text().trim() : null;
            String dtAttr = dateEl != null ? dateEl.attr("datetime") : null;
            String benefitText = benefitEl != null ? benefitEl.text().trim().toLowerCase() : "";

            String level = determineExperienceLevel(title, null);
            String tLower = title.toLowerCase();
            if (level.equals("MID") && expFilter.contains("f_E=1") &&
                    (tLower.contains("intern") || tLower.contains("stagiu") || tLower.contains("trainee") || tLower.contains("student"))) {
                level = "INTERNSHIP";
            } else if (level.equals("MID") && expFilter.contains("f_E=4") &&
                    (tLower.contains("senior") || tLower.contains("lead") || tLower.contains("principal"))) {
                level = "SENIOR";
            }

            String dedupKey = dedupKey(title, company, cleanUrl);
            synchronized (seenDedupKeys) {
                if (!seenDedupKeys.add(dedupKey)) continue;
            }

            Matcher m = JOB_ID_PATTERN.matcher(cleanUrl);
            String externalId = m.find() ? m.group(1) : null;

            List<String> skills = extractSkillsFromTitle(title);
            JobListingBuilder builder = JobListingBuilder.of(PLATFORM, "li-live-")
                    .externalId(externalId)
                    .title(title)
                    .company(company)
                    .logoUrl(logoEl != null ? logoEl.attr("data-delayed-url") : null)
                    .location(loc)
                    .workModel(loc.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID")
                    .level(level)
                    .applyUrl(cleanUrl)
                    .description(listingSummary("LinkedIn", title, company, loc, skills)
                            + (benefitText.isEmpty() ? "" : " Beneficii evidențiate: " + benefitText + "."))
                    .skills(skills);

            OffsetDateTime postedAt = parseExactDate(dtAttr);
            if (postedAt != null) {
                builder.postedAt(postedAt);
            } else {
                builder.postedDaysAgo(parseDaysAgo(postedDate));
            }

            // Singurul semnal real despre numărul de candidați pe care îl afișează LinkedIn
            if (benefitText.contains("early applicant") || benefitText.contains("primii 25")) {
                builder.competitiveness("LOW", "Șansă Mare")
                        .applicantCountText("Printre primii candidați (LinkedIn)");
            }

            freshList.add(builder.build());
        }
        return new PageResult(cards.size(), newJobsThisPage);
    }
}
