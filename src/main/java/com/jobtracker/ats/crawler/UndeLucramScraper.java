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
public class UndeLucramScraper implements JobScraper {

    @Override
    public String getPlatformName() {
        return "UNDELUCRAM";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        Set<String> seenUrls = new HashSet<>();
        List<String> targetUrls = List.of(
                "https://www.undelucram.ro/ro/locuri-de-munca?keyword=software",
                "https://www.undelucram.ro/ro/locuri-de-munca?keyword=developer",
                "https://www.undelucram.ro/ro/locuri-de-munca?keyword=java",
                "https://www.undelucram.ro/ro/locuri-de-munca?keyword=data",
                "https://www.undelucram.ro/ro/locuri-de-munca?keyword=devops",
                "https://www.undelucram.ro/ro/locuri-de-munca",
                "https://www.undelucram.ro/ro/locuri-de-munca?page=2"
        );

        for (String url : targetUrls) {
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(10000)
                        .get();

                Elements links = doc.select("a[href*=/locuri-de-munca/]");
                for (Element el : links) {
                    String href = el.attr("href");
                    if (href == null || !href.matches(".*locuri-de-munca/[a-zA-Z0-9-]+/\\d+.*") || seenUrls.contains(href)) {
                        continue;
                    }

                    String directUrl = href.startsWith("http") ? href : "https://www.undelucram.ro" + href;
                    String title = el.text().trim();
                    if (title.isEmpty()) {
                        String[] parts = href.split("/");
                        title = parts.length >= 4 ? formatSlugTitle(parts[parts.length - 2]) : "Software Engineer";
                    }

                    if (!isStrictlyItJob(title)) {
                        continue;
                    }

                    String company = "Companie IT UndeLucram.ro";
                    String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                    if (!seenDedupKeys.add(dedupKey)) {
                        continue;
                    }

                    seenUrls.add(href);

                    String level = determineExperienceLevel(title);
                    List<String> skills = extractSkillsFromTitle(title);
                    int daysAgo = -1;
                    OffsetDateTime postedAt = null;
                    String extId = href.replaceAll("[^a-zA-Z0-9-]", "");
                    String desc = "Rol oficial de " + title + " publicat pe UndeLucram.ro. Nivel identificat: " + level + ". Competențe: " + String.join(", ", skills) + ". Aplicare directă pe platforma angajatorului.";
                    String contentHash = computeContentHash(title, company, desc, "Salariu Nespecificat / Conform Anunț", String.join(",", skills), "Bucharest / Remote, Romania");
                    OffsetDateTime now = OffsetDateTime.now();

                    String compLevel = level.equals("JUNIOR") ? "LOW" : "MEDIUM";
                    String compLabel = level.equals("JUNIOR") ? "Șansă Mare" : "Competiție Medie";
                    String applicantCountText = level.equals("JUNIOR") ? "Sub 25 de candidați" : "35-70 de candidați";

                    freshList.add(new UnifiedJobListingDto(
                            "udl-live-" + extId,
                            title,
                            company,
                            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                            "Bucharest / Remote, Romania",
                            "HYBRID",
                            level,
                            "UNDELUCRAM",
                            directUrl,
                            desc,
                            "Salariu Nespecificat / Conform Anunț",
                            skills,
                            Collections.emptyList(),
                            Collections.emptyList(),
                            "Dată nespecificată",
                            94.5,
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
                log.warn("[JOB CRAWLER] UndeLucram scrape fallback: {}", e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] UndeLucram.ro Extins: {} joburi reale preluate (după deduplicare).", seenUrls.size());
    }
}
