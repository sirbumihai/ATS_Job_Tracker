package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.util.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class DevJobRoScraper implements JobScraper {

    static final String PLATFORM = "DEVJOB_RO";
    private static final String RSS_URL = "https://devjob.ro/rss";
    private static final List<String> DESCRIPTION_SKILLS = List.of(
            "java", "spring", "python", "react", "c++", "docker", "sql", "aws", "angular", "node", "typescript", "kubernetes");

    private final PageFetcher pageFetcher;

    @Override
    public String getPlatformName() {
        return PLATFORM;
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        ScrapeContext ctx = new ScrapeContext(freshList, seenDedupKeys, knownDbUrls);
        try {
            parseFeed(pageFetcher.fetchXml(RSS_URL, 20_000), ctx);
        } catch (Exception e) {
            log.warn("[JOB CRAWLER] DevJob.ro RSS indisponibil: {}", e.getMessage());
        }
        log.info("[JOB CRAWLER] DevJob.ro RSS: {} joburi IT preluate.", ctx.collectedCount());
    }

    void parseFeed(Document doc, ScrapeContext ctx) {
        Elements items = doc.select("item");
        for (Element item : items) {
            Element titleEl = item.selectFirst("title");
            Element linkEl = item.selectFirst("link");
            Element descEl = item.selectFirst("description");
            if (titleEl == null || linkEl == null) continue;

            String rawTitle = titleEl.text().trim();
            String directUrl = linkEl.text().trim();
            String cleanDesc = descEl != null ? Jsoup.parse(descEl.text().trim()).text() : "";

            // Format standard DevJob: "Title @ Company [Salary]"
            String title = rawTitle;
            String company = null;
            String salary = null;
            if (rawTitle.contains("@")) {
                String[] atParts = rawTitle.split("@", 2);
                title = atParts[0].trim();
                String rightPart = atParts[1].trim();
                int openBracket = rightPart.indexOf('[');
                if (openBracket >= 0) {
                    company = rightPart.substring(0, openBracket).trim();
                    int endBracket = rightPart.indexOf(']');
                    if (endBracket > openBracket) {
                        salary = rightPart.substring(openBracket + 1, endBracket).trim();
                    }
                } else {
                    company = rightPart;
                }
            }

            if (!isStrictlyItJob(title)) continue;
            if (!ctx.claim(title, company, directUrl)) continue;

            List<String> skills = extractSkillsFromTitle(title);
            for (String word : cleanDesc.split("\\s+")) {
                String wClean = word.replaceAll("[^a-zA-Z0-9#+]", "");
                if (DESCRIPTION_SKILLS.contains(wClean.toLowerCase()) && !skills.contains(wClean)) {
                    skills.add(wClean);
                }
            }

            Element pubDateEl = item.selectFirst("pubDate");
            Element guidEl = item.selectFirst("guid");
            String guid = guidEl != null ? guidEl.text().trim().replaceAll("[^a-zA-Z0-9-]", "") : "";

            ctx.add(JobListingBuilder.of(PLATFORM, "devjob-")
                    .externalId(guid.isEmpty() ? null : guid)
                    .title(title)
                    .company(company)
                    .workModel(cleanDesc.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID")
                    .level(determineExperienceLevel(title, cleanDesc))
                    .applyUrl(directUrl)
                    .description(cleanDesc)
                    .salary(salary)
                    .skills(skills)
                    .postedAt(parseExactDate(pubDateEl != null ? pubDateEl.text().trim() : null))
                    .build());
        }
    }
}
