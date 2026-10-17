package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Component;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@RequiredArgsConstructor
@Slf4j
public class HipoScraper implements JobScraper {

    static final String PLATFORM = "HIPO";
    private static final List<String> TARGET_URLS = List.of(
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Hardware/Toate-Orasele",
            "https://www.hipo.ro/locuri-de-munca/cautajob/Telecomunicatii/Toate-Orasele",
            "https://www.hipo.ro/locuri-de-munca/cautajob/Internet-e-Commerce/Toate-Orasele",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/junior",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/internship",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/developer",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/java",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/qa",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/devops",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Hardware/Toate-Orasele/support",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/support",
            "https://www.hipo.ro/locuri-de-munca/cautajob/IT-Software/Toate-Orasele/business-analyst"
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
                log.warn("[JOB CRAWLER] Hipo scrape error pe {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] Hipo.ro: {} joburi IT preluate.", ctx.collectedCount());
    }

    void parsePage(Document doc, ScrapeContext ctx) {
        for (Element card : doc.select(".row.g-4")) {
            Element titleEl = card.selectFirst("a.job-title");
            if (titleEl == null) continue;

            String href = titleEl.attr("href");
            if (href.isEmpty()) continue;

            String title = titleEl.select("h5").text().trim();
            if (title.isEmpty()) title = titleEl.text().trim();
            if (title.length() < 3 || title.equalsIgnoreCase("Inscriere")) continue;
            if (!isStrictlyItJob(title)) continue;

            Element compEl = card.selectFirst(".company-name");
            String company = compEl != null ? compEl.text().trim() : null;
            if (company == null || company.isBlank() || company.equalsIgnoreCase("Companie Hipo.ro")) {
                company = companyFromHref(href);
            }

            String cleanHref = href.contains("?") ? href.split("\\?")[0] : href;
            String directUrl = cleanHref.startsWith("http") ? cleanHref : "https://www.hipo.ro" + cleanHref;
            if (!ctx.claim(title, company, directUrl)) continue;

            Element locEl = card.selectFirst("i.fa-map-marker-alt");
            String location = locEl != null && locEl.parent() != null ? locEl.parent().text().trim() : null;
            String workModel = "HYBRID";
            String locLower = location != null ? location.toLowerCase() : "";
            String tLower = title.toLowerCase();
            if (tLower.contains("remote") || locLower.contains("remote") || tLower.contains("la distan")) {
                workModel = "REMOTE";
                location = "Remote / România";
            } else if (tLower.contains("on-site") || tLower.contains("onsite")) {
                workModel = "ON_SITE";
            }

            Element logoEl = card.selectFirst(".company-img img");
            String level = determineExperienceLevel(title, null);
            List<String> skills = extractSkills(title, "");

            ctx.add(JobListingBuilder.of(PLATFORM, "hipo-live-")
                    .externalId(cleanHref.replaceAll("[^a-zA-Z0-9-]", ""))
                    .title(title)
                    .company(company)
                    .logoUrl(logoEl != null ? logoEl.attr("src") : null)
                    .location(location)
                    .workModel(workModel)
                    .level(level)
                    .applyUrl(directUrl)
                    .description(listingSummary("Hipo.ro", title, company, location, skills))
                    .skills(skills)
                    .build());
        }
    }

    // Link-urile Hipo au forma /locuri-de-munca/<tip>/<id>/<Companie>/<Titlu>
    private static String companyFromHref(String href) {
        String[] parts = href.split("/");
        if (parts.length < 5) return null;
        try {
            return URLDecoder.decode(parts[4], StandardCharsets.UTF_8).replace("-", " ").trim();
        } catch (Exception e) {
            return parts[4].replace("-", " ").trim();
        }
    }
}
