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
public class JuniorsRoScraper implements JobScraper {

    static final String PLATFORM = "JUNIORS_RO";
    private static final List<String> TARGET_URLS = List.of(
            "https://juniors.ro/jobs",
            "https://juniors.ro/jobs/programming",
            "https://juniors.ro/jobs/devops",
            "https://juniors.ro/jobs/software-testing",
            "https://juniors.ro/jobs/data-science",
            "https://juniors.ro/jobs/artificial-intelligence",
            "https://juniors.ro/jobs?page=2",
            "https://juniors.ro/jobs?page=3"
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
                log.warn("[JOB CRAWLER] Juniors.ro scrape error pe {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] Juniors.ro: {} joburi IT preluate.", ctx.collectedCount());
    }

    void parsePage(Document doc, ScrapeContext ctx) {
        for (Element item : doc.select("li.job")) {
            Element linkEl = item.selectFirst("a[href*=/jobs/][href*=/link]");
            if (linkEl == null) continue;

            String href = linkEl.attr("href");
            if (href.isEmpty()) continue;
            String directUrl = href.startsWith("http") ? href : "https://juniors.ro" + href;

            Element titleEl = item.selectFirst(".job_header_title h3");
            if (titleEl == null) continue;
            String title = titleEl.text().trim();
            if (!isStrictlyItJob(title)) continue;

            Element logoEl = item.selectFirst(".job_header_logo img");
            String logoUrl = logoEl != null ? logoEl.attr("src") : null;
            String company = companyFromLogo(logoUrl);
            if (!ctx.claim(title, company, directUrl)) continue;

            // Format: "<Locație> | <Data publicării>"
            String location = null;
            String postedDate = null;
            Element dateStrong = item.selectFirst(".job_header_title strong");
            if (dateStrong != null) {
                String[] parts = dateStrong.text().trim().split("\\|");
                if (parts.length >= 1 && !parts[0].isBlank()) location = parts[0].trim();
                if (parts.length >= 2) postedDate = parts[1].trim();
            }

            List<String> tags = new ArrayList<>();
            for (Element tLink : item.select(".job_tags li a")) {
                String tText = tLink.text().trim();
                if (!tText.isEmpty()) tags.add(tText);
            }
            if (tags.isEmpty()) {
                tags = extractSkillsFromTitle(title);
            }

            ctx.add(JobListingBuilder.of(PLATFORM, "jun-live-")
                    .externalId(href.replaceAll("[^a-zA-Z0-9-]", ""))
                    .title(title)
                    .company(company)
                    .logoUrl(logoUrl)
                    .location(location)
                    .workModel(location != null && location.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID")
                    .level(determineExperienceLevel(title))
                    .applyUrl(directUrl)
                    .description(listingSummary("Juniors.ro", title, company, location, tags))
                    .skills(tags)
                    .postedDaysAgo(parseDaysAgo(postedDate))
                    .build());
        }
    }

    // Juniors.ro nu afișează numele companiei în listă; îl deducem din numele fișierului de logo
    private static String companyFromLogo(String logoUrl) {
        if (logoUrl == null || logoUrl.isBlank()) return null;
        String file = logoUrl.substring(logoUrl.lastIndexOf('/') + 1)
                .replace(".png", "").replace(".jpg", "").replace(".svg", "").replace("-logo", "");
        if (file.isEmpty() || file.equals("logo")) return null;
        return capitalize(file);
    }
}
