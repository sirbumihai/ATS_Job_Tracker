package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.util.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class UndeLucramScraper implements JobScraper {

    static final String PLATFORM = "UNDELUCRAM";
    private static final List<String> TARGET_URLS = List.of(
            "https://www.undelucram.ro/ro/locuri-de-munca?keyword=software",
            "https://www.undelucram.ro/ro/locuri-de-munca?keyword=developer",
            "https://www.undelucram.ro/ro/locuri-de-munca?keyword=java",
            "https://www.undelucram.ro/ro/locuri-de-munca?keyword=data",
            "https://www.undelucram.ro/ro/locuri-de-munca?keyword=devops",
            "https://www.undelucram.ro/ro/locuri-de-munca",
            "https://www.undelucram.ro/ro/locuri-de-munca?page=2"
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
                log.warn("[JOB CRAWLER] UndeLucram scrape error pe {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] UndeLucram.ro: {} joburi IT preluate.", ctx.collectedCount());
    }

    void parsePage(Document doc, ScrapeContext ctx) {
        for (Element el : doc.select("a[href*=/locuri-de-munca/]")) {
            String href = el.attr("href");
            if (!href.matches(".*locuri-de-munca/[a-zA-Z0-9-]+/\\d+.*")) continue;

            String title = el.text().trim();
            if (title.isEmpty()) {
                String[] parts = href.split("/");
                if (parts.length < 4) continue;
                title = formatSlugTitle(parts[parts.length - 2]);
            }
            if (!isStrictlyItJob(title)) continue;

            String directUrl = href.startsWith("http") ? href : "https://www.undelucram.ro" + href;
            if (!ctx.claim(title, null, directUrl)) continue;

            List<String> skills = extractSkillsFromTitle(title);

            ctx.add(JobListingBuilder.of(PLATFORM, "udl-live-")
                    .externalId(href.replaceAll("[^a-zA-Z0-9-]", ""))
                    .title(title)
                    .level(determineExperienceLevel(title))
                    .applyUrl(directUrl)
                    .description(listingSummary("UndeLucram.ro", title, null, null, skills))
                    .skills(skills)
                    .build());
        }
    }
}
