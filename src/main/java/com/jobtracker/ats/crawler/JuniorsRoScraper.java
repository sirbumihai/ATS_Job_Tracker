package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@Slf4j
public class JuniorsRoScraper implements JobScraper {

    @Override
    public String getPlatformName() {
        return "JUNIORS_RO";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        Set<String> seenUrls = new HashSet<>();
        List<String> targetUrls = List.of(
                "https://juniors.ro/jobs",
                "https://juniors.ro/jobs/programming",
                "https://juniors.ro/jobs/devops",
                "https://juniors.ro/jobs/software-testing",
                "https://juniors.ro/jobs/data-science",
                "https://juniors.ro/jobs/artificial-intelligence",
                "https://juniors.ro/jobs?page=2",
                "https://juniors.ro/jobs?page=3"
        );

        for (String url : targetUrls) {
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(10000)
                        .get();

                Elements jobItems = doc.select("li.job");
                for (Element item : jobItems) {
                    Element linkEl = item.selectFirst("a[href*=/jobs/][href*=/link]");
                    if (linkEl == null) continue;

                    String href = linkEl.attr("href");
                    if (href == null || href.isEmpty() || seenUrls.contains(href)) continue;

                    String directUrl = href.startsWith("http") ? href : "https://juniors.ro" + href;

                    Element titleEl = item.selectFirst(".job_header_title h3");
                    String title = titleEl != null ? titleEl.text().trim() : "Junior Software Engineer";
                    if (!isStrictlyItJob(title)) continue;

                    Element logoEl = item.selectFirst(".job_header_logo img");
                    String logoUrl = logoEl != null && logoEl.hasAttr("src") ? 
                            logoEl.attr("src") : 
                            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80";

                    String company = "Companie Parteneră Juniors.ro";
                    if (logoEl != null && logoEl.hasAttr("src")) {
                        String src = logoEl.attr("src");
                        String file = src.substring(src.lastIndexOf('/') + 1).replace(".png", "").replace(".jpg", "").replace(".svg", "").replace("-logo", "");
                        if (!file.isEmpty() && !file.equals("logo")) {
                            company = capitalize(file);
                        }
                    }

                    String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                    if (!seenDedupKeys.add(dedupKey)) continue;

                    seenUrls.add(href);

                    Element dateStrong = item.selectFirst(".job_header_title strong");
                    String location = "Bucharest, Romania";
                    String postedDate = "Postat recent";
                    if (dateStrong != null) {
                        String text = dateStrong.text().trim();
                        String[] parts = text.split("\\|");
                        if (parts.length >= 1) location = parts[0].trim();
                        if (parts.length >= 2) postedDate = parts[1].trim();
                    }

                    List<String> tags = new ArrayList<>();
                    Elements tagLinks = item.select(".job_tags li a");
                    for (Element tLink : tagLinks) {
                        String tText = tLink.text().trim();
                        if (!tText.isEmpty()) tags.add(tText);
                    }
                    if (tags.isEmpty()) {
                        tags = extractSkillsFromTitle(title);
                    }

                    String salary = "Salariu Nespecificat / Conform Anunț";
                    String level = determineExperienceLevel(title);
                    int daysAgo = parseDaysAgo(postedDate);
                    OffsetDateTime postedAt = null;
                    String postedDateAgo = "Dată nespecificată";
                    if (daysAgo >= 0) {
                        postedAt = OffsetDateTime.now().minusDays(daysAgo);
                        postedDateAgo = daysAgo == 0 ? "Astăzi" : daysAgo == 1 ? "Ieri" : daysAgo + " zile în urmă";
                    }
                    String extId = href.replaceAll("[^a-zA-Z0-9-]", "");
                    String desc = "Oportunitate IT pentru juniori și începători publicată pe Juniors.ro la compania " + company + ". Tech stack: " + String.join(", ", tags) + ". Rol dedicat debutului în cariera tech.";
                    String contentHash = computeContentHash(title, company, desc, salary, String.join(",", tags), location);
                    OffsetDateTime now = OffsetDateTime.now();

                    String compLevel = (daysAgo >= 0 && daysAgo <= 2) ? "LOW" : "MEDIUM";
                    String compLabel = (daysAgo >= 0 && daysAgo <= 2) ? "Șansă Mare" : "Competiție Medie";
                    String applicantCountText = (daysAgo >= 0 && daysAgo <= 2) ? "Sub 30 de candidați" : "40-75 de candidați";

                    freshList.add(new UnifiedJobListingDto(
                            "jun-live-" + extId,
                            title,
                            company,
                            logoUrl,
                            location,
                            location.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID",
                            level,
                            "JUNIORS_RO",
                            directUrl,
                            desc,
                            salary,
                            tags,
                            Collections.emptyList(),
                            Collections.emptyList(),
                            postedDateAgo,
                            96.0,
                            compLevel,
                            compLabel,
                            applicantCountText,
                            daysAgo,
                            extId,
                            contentHash,
                            postedAt,
                            now,
                            now,
                            "ACTIVE"
                    ));
                }
            } catch (Exception e) {
                log.warn("[JOB CRAWLER] Juniors.ro scrape fallback pentru {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] Juniors.ro Multi-Category: {} joburi reale preluate.", seenUrls.size());
    }
}
