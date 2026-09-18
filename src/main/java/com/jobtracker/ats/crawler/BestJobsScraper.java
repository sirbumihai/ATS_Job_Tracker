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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@Slf4j
public class BestJobsScraper implements JobScraper {

    @Override
    public String getPlatformName() {
        return "BESTJOBS";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        Set<String> seenUrls = new HashSet<>();
        List<String> bestJobsUrls = List.of(
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
                "https://www.bestjobs.eu/locuri-de-munca?keyword=cloud&order=date"
        );

        for (String url : bestJobsUrls) {
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(10000)
                        .get();

                Elements jobLinks = doc.select("a[href^=/loc-de-munca/]");
                for (Element linkEl : jobLinks) {
                    String href = linkEl.attr("href");
                    if (href == null || href.isBlank() || seenUrls.contains(href)) continue;

                    Element card = linkEl.parent();
                    if (card == null) continue;

                    Element titleEl = card.selectFirst("h2");
                    String title = titleEl != null ? titleEl.text().trim() : linkEl.attr("aria-label").trim();
                    if (title.isEmpty() || title.length() < 3) continue;
                    if (!isStrictlyItJob(title)) continue;

                    Element compEl = card.selectFirst(".text-ink-medium");
                    String company = compEl != null ? compEl.text().trim() : "Companie Parteneră BestJobs";
                    if (company.isEmpty()) company = "Companie Parteneră BestJobs";

                    String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                    if (!seenDedupKeys.add(dedupKey)) continue;

                    seenUrls.add(href);
                    String cleanHref = href.contains("?") ? href.split("\\?")[0] : href;
                    String directUrl = cleanHref.startsWith("http") ? cleanHref : "https://www.bestjobs.eu" + cleanHref;

                    Element logoEl = card.selectFirst("img[src*=imgcdn.bestjobs.eu]");
                    String logoUrl = (logoEl != null && !logoEl.attr("src").isBlank())
                            ? logoEl.attr("src")
                            : "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80";

                    String cardText = card.text();
                    String salaryRange = "Salariu Conform Anunț";
                    Matcher salMatcher = Pattern.compile("(\\d[\\d\\s.,]*-\\s*[\\d\\s.,]+(?:\\s*€|\\s*RON|\\s*EUR)?(?:\\s*\\(Estimare\\))?|\\d[\\d\\s.,]+\\s*€|\\d[\\d\\s.,]+\\s*RON)").matcher(cardText);
                    if (salMatcher.find()) {
                        salaryRange = salMatcher.group(1).trim();
                    }

                    Element locLink = card.selectFirst("a[href*=/ro/locuri-de-munca-in-]");
                    String location = locLink != null ? locLink.text().trim() : "România";
                    String workModel = "HYBRID";
                    if (location.toLowerCase().contains("remote") || cardText.toLowerCase().contains("remote") || title.toLowerCase().contains("remote")) {
                        workModel = "REMOTE";
                        location = "Remote / România";
                    }

                    int daysAgo = -1;
                    OffsetDateTime postedAt = null;
                    String postedDateAgo = "Dată nespecificată";

                    String level = determineExperienceLevel(title, null);
                    List<String> skills = extractSkills(title, "");
                    String extId = cleanHref.replace("/loc-de-munca/", "").replaceAll("[^a-zA-Z0-9-]", "");
                    String desc = "Oportunitate IT oficială publicată pe BestJobs.eu de către " + company + ". Rol: " + title + ". Locație: " + location + ". Nivel: " + level + ". Competențe: " + String.join(", ", skills) + ". Salariu: " + salaryRange + ". Aplică direct pe portalul BestJobs.";
                    String contentHash = computeContentHash(title, company, desc, salaryRange, String.join(",", skills), location);
                    OffsetDateTime now = OffsetDateTime.now();

                    String compLevel = level.equals("JUNIOR") || level.equals("INTERNSHIP") ? "LOW" : "MEDIUM";
                    String compLabel = level.equals("JUNIOR") || level.equals("INTERNSHIP") ? "Șansă Mare" : "Competiție Medie";
                    String applicantCountText = level.equals("JUNIOR") ? "Sub 25 de candidați" : "30-60 de candidați";

                    freshList.add(new UnifiedJobListingDto(
                            "bestjobs-live-" + extId,
                            title,
                            company,
                            logoUrl,
                            location,
                            workModel,
                            level,
                            "BESTJOBS",
                            directUrl,
                            desc,
                            salaryRange,
                            skills,
                            Collections.emptyList(),
                            Collections.emptyList(),
                            postedDateAgo,
                            92.0,
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
                log.warn("[JOB CRAWLER] BestJobs scrape error pe {}: {}", url, e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] BestJobs.eu: {} joburi IT preluate.", seenUrls.size());
    }
}
