package com.jobtracker.ats.crawler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
public class EjobsScraper implements JobScraper {

    static final String PLATFORM = "EJOBS";
    private static final List<String> TARGET_URLS = List.of(
            "https://www.ejobs.ro/locuri-de-munca/it-software?sort=date",
            "https://www.ejobs.ro/locuri-de-munca/it-software/pagina1?sort=date",
            "https://www.ejobs.ro/locuri-de-munca/it-software/pagina2?sort=date",
            "https://www.ejobs.ro/locuri-de-munca/it-software/pagina3?sort=date"
    );

    private final ObjectMapper objectMapper;
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
                log.warn("[JOB CRAWLER] eJobs scrape error pe {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] eJobs: {} joburi IT preluate.", ctx.collectedCount());
    }

    void parsePage(Document doc, ScrapeContext ctx) {
        // 1. Starea Nuxt 3 (__NUXT_DATA__) are date mai complete decât HTML-ul randat
        if (!parseNuxtState(doc, ctx)) {
            // 2. Fallback pe link-urile din HTML
            parseHtmlLinks(doc, ctx);
        }
    }

    private boolean parseNuxtState(Document doc, ScrapeContext ctx) {
        Element nuxtEl = doc.selectFirst("script#__NUXT_DATA__");
        if (nuxtEl == null || nuxtEl.data().isBlank()) return false;

        boolean parsed = false;
        try {
            JsonNode arr = objectMapper.readTree(nuxtEl.data());
            if (!arr.isArray()) return false;

            for (JsonNode item : arr) {
                if (!item.isObject() || !item.has("title") || !item.has("creationDate") || !item.has("slug")) continue;

                JsonNode idNode = derefNuxt(item.get("id"), arr);
                JsonNode titleNode = derefNuxt(item.get("title"), arr);
                JsonNode dateNode = derefNuxt(item.get("creationDate"), arr);
                JsonNode slugNode = derefNuxt(item.get("slug"), arr);
                if (idNode == null || titleNode == null || slugNode == null) continue;

                String title = titleNode.asText().trim();
                if (!isStrictlyItJob(title)) continue;

                long ejobId = idNode.asLong();
                String slug = slugNode.asText().trim();
                String directUrl = "https://www.ejobs.ro/user/locuri-de-munca/" + slug + "/" + ejobId;

                String company = null;
                JsonNode compNode = derefNuxt(item.get("company"), arr);
                if (compNode != null && compNode.isObject() && compNode.has("name")) {
                    JsonNode nameNode = derefNuxt(compNode.get("name"), arr);
                    if (nameNode != null && !nameNode.asText().isBlank()) {
                        company = nameNode.asText().trim();
                    }
                }

                if (!ctx.claim(title, company, directUrl)) continue;

                String salary = null;
                if (item.has("salary")) {
                    JsonNode salNode = derefNuxt(item.get("salary"), arr);
                    if (salNode != null && !salNode.isNull() && !salNode.isContainerNode()) {
                        salary = salNode.asText();
                    }
                }

                String level = determineExperienceLevel(title);
                List<String> skills = extractSkillsFromTitle(title);

                ctx.add(JobListingBuilder.of(PLATFORM, "ejobs-live-")
                        .externalId("userlocuri-de-munca" + slug.replaceAll("[^a-zA-Z0-9-]", "") + ejobId)
                        .title(title)
                        .company(company)
                        .level(level)
                        .applyUrl(directUrl)
                        .description(listingSummary("eJobs.ro", title, company, null, skills))
                        .salary(salary)
                        .skills(skills)
                        .postedAt(dateNode != null ? parseExactDate(dateNode.asText().trim()) : null)
                        .build());
                parsed = true;
            }
        } catch (Exception e) {
            log.warn("[JOB CRAWLER] Eroare la parsarea Nuxt state eJobs: {}", e.getMessage());
        }
        return parsed;
    }

    private void parseHtmlLinks(Document doc, ScrapeContext ctx) {
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

            String directUrl = href.startsWith("http") ? href : "https://www.ejobs.ro" + href;
            if (!ctx.claim(title, null, directUrl)) continue;

            String level = determineExperienceLevel(title);
            List<String> skills = extractSkillsFromTitle(title);

            ctx.add(JobListingBuilder.of(PLATFORM, "ejobs-live-")
                    .externalId(href.replaceAll("[^a-zA-Z0-9-]", ""))
                    .title(title)
                    .level(level)
                    .applyUrl(directUrl)
                    .description(listingSummary("eJobs.ro", title, null, null, skills))
                    .skills(skills)
                    .build());
        }
    }

    private JsonNode derefNuxt(JsonNode node, JsonNode arr) {
        if (node == null || arr == null || !arr.isArray()) return null;
        if (node.isInt()) {
            int idx = node.asInt();
            if (idx >= 0 && idx < arr.size()) {
                return arr.get(idx);
            }
        }
        return node;
    }
}
