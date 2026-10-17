package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class BestJobsScraper implements JobScraper {

    static final String PLATFORM = "BESTJOBS";
    private static final Pattern SALARY_PATTERN = Pattern.compile(
            "(\\d[\\d\\s.,]*-\\s*[\\d\\s.,]+(?:\\s*€|\\s*RON|\\s*EUR)?(?:\\s*\\(Estimare\\))?|\\d[\\d\\s.,]+\\s*€|\\d[\\d\\s.,]+\\s*RON)");

    private static final List<String> TARGET_URLS = List.of(
            "https://www.bestjobs.eu/locuri-de-munca/it?order=date",
            "https://www.bestjobs.eu/locuri-de-munca/it-software?order=date",
            "https://www.bestjobs.eu/locuri-de-munca/it-telecomunicatii?order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=developer&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=software&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=junior&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=internship&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=java&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=python&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=react&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=qa&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=devops&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=data&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=cloud&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=support&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=helpdesk&order=date",
            "https://www.bestjobs.eu/locuri-de-munca?keyword=business+analyst&order=date"
    );

    private final PageFetcher pageFetcher;

    @Override
    public String getPlatformName() {
        return PLATFORM;
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        ScrapeContext ctx = new ScrapeContext(freshList, seenDedupKeys, knownDbUrls);
        for (String url : TARGET_URLS) {
            try {
                parsePage(pageFetcher.fetchHtml(url), ctx);
            } catch (Exception e) {
                log.warn("[JOB CRAWLER] BestJobs scrape error pe {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] BestJobs.eu: {} joburi IT preluate.", ctx.collectedCount());
    }

    void parsePage(Document doc, ScrapeContext ctx) {
        for (Element linkEl : doc.select("a[href^=/loc-de-munca/]")) {
            String href = linkEl.attr("href");
            if (href.isBlank()) continue;

            Element card = linkEl.parent();
            if (card == null) continue;

            Element titleEl = card.selectFirst("h2");
            String title = titleEl != null ? titleEl.text().trim() : linkEl.attr("aria-label").trim();
            if (title.length() < 3 || !isStrictlyItJob(title)) continue;

            Element compEl = card.selectFirst(".text-ink-medium");
            String company = compEl != null ? compEl.text().trim() : null;

            String cleanHref = href.contains("?") ? href.split("\\?")[0] : href;
            String directUrl = cleanHref.startsWith("http") ? cleanHref : "https://www.bestjobs.eu" + cleanHref;
            if (!ctx.claim(title, company, directUrl)) continue;

            Element logoEl = card.selectFirst("img[src*=imgcdn.bestjobs.eu]");
            String cardText = card.text();

            String salary = null;
            Matcher salMatcher = SALARY_PATTERN.matcher(cardText);
            if (salMatcher.find()) {
                salary = salMatcher.group(1).trim();
            }

            Element locLink = card.selectFirst("a[href*=/ro/locuri-de-munca-in-]");
            String location = locLink != null ? locLink.text().trim() : null;
            String workModel = "HYBRID";
            if ((location != null && location.toLowerCase().contains("remote"))
                    || cardText.toLowerCase().contains("remote") || title.toLowerCase().contains("remote")) {
                workModel = "REMOTE";
                location = "Remote / România";
            }

            String level = determineExperienceLevel(title, null);
            List<String> skills = extractSkills(title, "");

            ctx.add(JobListingBuilder.of(PLATFORM, "bestjobs-live-")
                    .externalId(cleanHref.replace("/loc-de-munca/", "").replaceAll("[^a-zA-Z0-9-]", ""))
                    .title(title)
                    .company(company)
                    .logoUrl(logoEl != null ? logoEl.attr("src") : null)
                    .location(location)
                    .workModel(workModel)
                    .level(level)
                    .applyUrl(directUrl)
                    .description(listingSummary("BestJobs.eu", title, company, location, skills))
                    .salary(salary)
                    .skills(skills)
                    .build());
        }
    }
}
