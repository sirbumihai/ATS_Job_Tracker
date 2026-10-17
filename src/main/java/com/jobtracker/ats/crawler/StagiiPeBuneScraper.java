package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class StagiiPeBuneScraper implements JobScraper {

    static final String PLATFORM = "STAGIIPEBUNE";
    private static final int MAX_PAGES = 4;
    private static final Pattern DATE_PATTERN = Pattern.compile(
            "\\b\\d{1,2}\\s+(ian|feb|mar|apr|mai|iun|iul|aug|sep|oct|noi|nov|dec)", Pattern.CASE_INSENSITIVE);
    private static final List<String> CITY_HINTS = List.of("bucure", "cluj", "iasi", "timisoara", "brasov", "remote");

    private final PageFetcher pageFetcher;

    @Override
    public String getPlatformName() {
        return PLATFORM;
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        ScrapeContext ctx = new ScrapeContext(freshList, seenDedupKeys, knownDbUrls);
        for (int page = 1; page <= MAX_PAGES; page++) {
            String url = page == 1 ? "https://stagiipebune.ro/students/jobs/" : "https://stagiipebune.ro/students/jobs/?page=" + page;
            try {
                if (!parsePage(pageFetcher.fetchHtml(url), ctx)) break;
            } catch (Exception e) {
                log.warn("[JOB CRAWLER] StagiiPeBune scrape error pe pagina {}: {}", page, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] StagiiPeBune: {} stagii IT preluate.", ctx.collectedCount());
    }

    /**
     * @return false dacă pagina nu mai conține anunțuri (sfârșitul paginării)
     */
    boolean parsePage(Document doc, ScrapeContext ctx) {
        Elements jobBodies = doc.select("tbody.job-table-body");
        if (jobBodies.isEmpty()) return false;

        for (Element body : jobBodies) {
            Element linkEl = body.selectFirst("p.job-row-title a");
            if (linkEl == null) continue;

            String href = linkEl.attr("href");
            if (href.isEmpty()) continue;
            String directUrl = href.startsWith("http") ? href : "https://stagiipebune.ro" + href;

            String title = linkEl.text().trim();
            if (!isStrictlyItJob(title)) continue;

            Element compEl = body.selectFirst("p.job-row-sub a.color-link");
            String company = compEl != null ? compEl.text().trim() : null;
            if (!ctx.claim(title, company, directUrl)) continue;

            Element logoEl = body.selectFirst("td.job-logo img");

            String salary = null;
            String postedDateRaw = null;
            String location = null;
            for (Element span : body.select("p.job-row-sub span.muted")) {
                String text = span.text().replace("•", "").trim();
                String lower = text.toLowerCase();
                // Data se verifică prima: "12 aug 2026" conține și un număr de 4 cifre
                if (DATE_PATTERN.matcher(text).find()) {
                    postedDateRaw = text;
                } else if (lower.contains("platit") || lower.contains("plătit") || lower.contains("remunerat")
                        || text.matches(".*\\d+.*RON.*") || text.matches(".*\\d{3,}.*")) {
                    salary = text;
                } else if (CITY_HINTS.stream().anyMatch(normalizeDiacritics(lower)::contains)) {
                    location = text;
                }
            }

            List<String> skills = extractSkillsFromTitle(title);

            ctx.add(JobListingBuilder.of(PLATFORM, "spb-live-")
                    .externalId(href.replaceAll("[^a-zA-Z0-9-]", ""))
                    .title(title)
                    .company(company)
                    .logoUrl(logoEl != null ? logoEl.attr("src") : null)
                    .location(location)
                    .workModel(location != null && location.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID")
                    .level("INTERNSHIP")
                    .applyUrl(directUrl)
                    .description(listingSummary("StagiiPeBune.ro", title, company, location, skills))
                    .salary(salary)
                    .skills(skills)
                    .postedAt(parseExactDate(postedDateRaw))
                    .build());
        }
        return true;
    }
}
