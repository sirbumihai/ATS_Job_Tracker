package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@Slf4j
public class StagiiPeBuneScraper implements JobScraper {

    @Override
    public String getPlatformName() {
        return "STAGIIPEBUNE";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        Set<String> seenUrls = new HashSet<>();
        int maxPages = 4;

        for (int page = 1; page <= maxPages; page++) {
            try {
                String url = page == 1 ? "https://stagiipebune.ro/students/jobs/" : "https://stagiipebune.ro/students/jobs/?page=" + page;
                Document doc = Jsoup.connect(url)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(10000)
                        .get();

                Elements jobBodies = doc.select("tbody.job-table-body");
                if (jobBodies.isEmpty()) break;

                for (Element body : jobBodies) {
                    Element linkEl = body.selectFirst("p.job-row-title a");
                    if (linkEl == null) continue;

                    String href = linkEl.attr("href");
                    if (href == null || href.isEmpty() || seenUrls.contains(href)) continue;

                    String directUrl = "https://stagiipebune.ro" + href;
                    String title = linkEl.text().trim();
                    if (!isStrictlyItJob(title)) continue;

                    Element compEl = body.selectFirst("p.job-row-sub a.color-link");
                    String company = compEl != null ? compEl.text().trim() : "Companie StagiiPeBune";

                    String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                    if (!seenDedupKeys.add(dedupKey)) continue;

                    seenUrls.add(href);

                    Element logoEl = body.selectFirst("td.job-logo img");
                    String logoUrl = logoEl != null && logoEl.hasAttr("src") ? 
                            logoEl.attr("src") : 
                            "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?w=100&auto=format&fit=crop&q=80";

                    Elements metaSpans = body.select("p.job-row-sub span.muted");
                    String salary = "Stagiu Plătit";
                    String postedDateRaw = "";
                    String location = "Bucharest, Romania";

                    for (Element span : metaSpans) {
                        String text = span.text().trim();
                        if (text.toLowerCase().contains("platit") || text.toLowerCase().contains("remunerat") || text.matches(".*\\d+.*RON.*") || text.matches(".*\\d{3,}.*")) {
                            salary = text.replace("•", "").trim();
                        } else if (text.matches(".*\\d+\\s+[A-Za-zăîșțâ]+.*") || text.toLowerCase().contains("aug") || text.toLowerCase().contains("iul") || text.toLowerCase().contains("sep") || text.toLowerCase().contains("mar") || text.toLowerCase().contains("feb")) {
                            postedDateRaw = text.replace("•", "").trim();
                        } else if (text.toLowerCase().contains("bucure") || text.toLowerCase().contains("cluj") || text.toLowerCase().contains("iasi") || text.toLowerCase().contains("timisoara") || text.toLowerCase().contains("remote")) {
                            location = text.replace("•", "").trim();
                        }
                    }

                    List<String> skills = extractSkillsFromTitle(title);
                    OffsetDateTime postedAt = parseExactDate(postedDateRaw);
                    int daysAgo = -1;
                    String postedDateAgo = "Dată nespecificată";
                    if (postedAt != null) {
                        long diff = java.time.temporal.ChronoUnit.DAYS.between(postedAt.toLocalDate(), LocalDate.now());
                        daysAgo = (int) Math.max(0, diff);
                        postedDateAgo = daysAgo == 0 ? "Astăzi" : daysAgo == 1 ? "Ieri" : daysAgo + " zile în urmă";
                    }
                    String extId = href.replaceAll("[^a-zA-Z0-9-]", "");
                    String desc = "Stagiu oficial de practică și internship publicat pe platforma universitară StagiiPeBune.ro la compania " + company + ". Program dedicat studenților și masteranzilor IT. Aplicare directă prin contul de student.";
                    String contentHash = computeContentHash(title, company, desc, salary, String.join(",", skills), location);
                    OffsetDateTime now = OffsetDateTime.now();

                    String compLevel = (daysAgo >= 0 && daysAgo <= 4) ? "LOW" : "MEDIUM";
                    String compLabel = (daysAgo >= 0 && daysAgo <= 4) ? "Șansă Mare" : "Competiție Medie";
                    String applicantCountText = (daysAgo >= 0 && daysAgo <= 4) ? "Sub 25 de candidați (Studenți)" : "30-50 de candidați";

                    freshList.add(new UnifiedJobListingDto(
                            "spb-live-" + extId,
                            title,
                            company,
                            logoUrl,
                            location,
                            location.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID",
                            "INTERNSHIP",
                            "STAGIIPEBUNE",
                            directUrl,
                            desc,
                            salary,
                            skills,
                            Collections.emptyList(),
                            Collections.emptyList(),
                            postedDateAgo,
                            97.5,
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
                log.warn("[JOB CRAWLER] StagiiPeBune detailed scrape page {} fallback: {}", page, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] StagiiPeBune Detailed: {} joburi reale preluate cu dată și salariu.", seenUrls.size());
    }
}
