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
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Component
@Slf4j
public class LinkedInScraper implements JobScraper {

    private static final List<String> LINKEDIN_USER_AGENTS = List.of(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Edge/123.0.0.0 Safari/537.36"
    );

    @Override
    public String getPlatformName() {
        return "LINKEDIN";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        Map<String, String> searchTiers = new LinkedHashMap<>();

        // 1. INTERNSHIPS & STAGII (f_E=1)
        searchTiers.put("Software Intern Romania", "f_E=1");
        searchTiers.put("Java Intern Romania", "f_E=1");
        searchTiers.put("Python Intern Romania", "f_E=1");
        searchTiers.put("Internship IT Romania", "f_E=1");
        searchTiers.put("Data Analyst Intern Romania", "f_E=1");
        searchTiers.put("QA Intern Romania", "f_E=1");
        searchTiers.put("DevOps Intern Romania", "f_E=1");
        searchTiers.put("Cyber Security Intern Romania", "f_E=1");
        searchTiers.put("Web Developer Intern Romania", "f_E=1");
        searchTiers.put("Stagiu IT Romania", "f_E=1");

        // 2. JUNIOR / ENTRY LEVEL (f_E=2 - TOATE SPECIALIZĂRILE IT)
        searchTiers.put("Junior Software Engineer Romania", "f_E=2");
        searchTiers.put("Junior IT Romania", "f_E=2");
        searchTiers.put("Junior Developer Romania", "f_E=2");
        searchTiers.put("Junior Java Developer Romania", "f_E=2");
        searchTiers.put("Junior Python Developer Romania", "f_E=2");
        searchTiers.put("Junior C++ Developer Romania", "f_E=2");
        searchTiers.put("Junior Embedded Romania", "f_E=2");
        searchTiers.put("Junior Backend Developer Romania", "f_E=2");
        searchTiers.put("Junior Full Stack Developer Romania", "f_E=2");
        searchTiers.put("Junior Frontend Developer Romania", "f_E=2");
        searchTiers.put("Junior React Developer Romania", "f_E=2");
        searchTiers.put("Junior Angular Developer Romania", "f_E=2");
        searchTiers.put("Junior QA Automation Romania", "f_E=2");
        searchTiers.put("Junior DevOps Engineer Romania", "f_E=2");
        searchTiers.put("Junior Cloud Engineer Romania", "f_E=2");
        searchTiers.put("Junior Data Analyst Romania", "f_E=2");
        searchTiers.put("Junior Data Engineer Romania", "f_E=2");
        searchTiers.put("Junior Machine Learning Romania", "f_E=2");
        searchTiers.put("Junior AI Engineer Romania", "f_E=2");
        searchTiers.put("Junior Android Developer Romania", "f_E=2");
        searchTiers.put("Junior iOS Developer Romania", "f_E=2");
        searchTiers.put("Junior Mobile Developer Romania", "f_E=2");
        searchTiers.put("Junior Game Developer Romania", "f_E=2");
        searchTiers.put("Junior IT Support Romania", "f_E=2");
        searchTiers.put("Junior Helpdesk Romania", "f_E=2");
        searchTiers.put("Junior Business Analyst Romania", "f_E=2");
        searchTiers.put("Junior Cyber Security Romania", "f_E=2");
        searchTiers.put("Junior System Administrator Romania", "f_E=2");
        searchTiers.put("Junior Network Engineer Romania", "f_E=2");
        searchTiers.put("Junior SQL Database Romania", "f_E=2");
        searchTiers.put("Junior UI UX Designer Romania", "f_E=2");
        searchTiers.put("Graduate Software Engineer Romania", "f_E=2");
        searchTrainees(searchTiers);

        // 3. MIDDLE (f_E=3 - TOATE SPECIALIZĂRILE IT)
        searchTiers.put("Software Engineer Romania", "f_E=3");
        searchTiers.put("Java Developer Romania", "f_E=3");
        searchTiers.put("Python Developer Romania", "f_E=3");
        searchTiers.put("Backend Engineer Romania", "f_E=3");
        searchTiers.put("Full Stack Developer Romania", "f_E=3");
        searchTiers.put("Frontend Developer Romania", "f_E=3");
        searchTiers.put("React Developer Romania", "f_E=3");
        searchTiers.put("DevOps Engineer Romania", "f_E=3");
        searchTiers.put("Cloud Engineer Romania", "f_E=3");
        searchTiers.put("Data Engineer Romania", "f_E=3");
        searchTiers.put("Data Analyst Romania", "f_E=3");
        searchTiers.put("C++ Developer Romania", "f_E=3");
        searchTiers.put("Embedded Software Romania", "f_E=3");
        searchTiers.put("QA Automation Engineer Romania", "f_E=3");
        searchTiers.put("Technical Support Engineer Romania", "f_E=3");
        searchTiers.put("Business Analyst IT Romania", "f_E=3");
        searchTiers.put("Cyber Security Analyst Romania", "f_E=3");
        searchTiers.put("Database Administrator Romania", "f_E=3");
        searchTiers.put("Scrum Master Romania", "f_E=3");
        searchTiers.put("SAP Consultant Romania", "f_E=3");
        searchTiers.put("UI UX Designer Romania", "f_E=3");

        // 4. SENIOR / LEAD / ARCHITECT / PRINCIPAL / MANAGER (f_E=4)
        searchTiers.put("Senior Software Engineer Romania", "f_E=4");
        searchTiers.put("Senior Java Developer Romania", "f_E=4");
        searchTiers.put("Senior Python Developer Romania", "f_E=4");
        searchTiers.put("Senior C++ Developer Romania", "f_E=4");
        searchTiers.put("Senior Embedded Romania", "f_E=4");
        searchTiers.put("Senior Backend Engineer Romania", "f_E=4");
        searchTiers.put("Senior Full Stack Developer Romania", "f_E=4");
        searchTiers.put("Senior Frontend Developer Romania", "f_E=4");
        searchTiers.put("Senior React Developer Romania", "f_E=4");
        searchTiers.put("Senior Angular Developer Romania", "f_E=4");
        searchTiers.put("Senior DevOps Engineer Romania", "f_E=4");
        searchTiers.put("Senior Cloud Engineer Romania", "f_E=4");
        searchTiers.put("Senior Cloud Architect Romania", "f_E=4");
        searchTiers.put("Senior Data Engineer Romania", "f_E=4");
        searchTiers.put("Senior Data Analyst Romania", "f_E=4");
        searchTiers.put("Senior Machine Learning Romania", "f_E=4");
        searchTiers.put("Senior AI Engineer Romania", "f_E=4");
        searchTiers.put("Senior QA Automation Romania", "f_E=4");
        searchTiers.put("Senior Cyber Security Romania", "f_E=4");
        searchTiers.put("Senior Mobile Developer Romania", "f_E=4");
        searchTiers.put("Senior Android Developer Romania", "f_E=4");
        searchTiers.put("Senior iOS Developer Romania", "f_E=4");
        searchTiers.put("Senior IT Support Romania", "f_E=4");
        searchTiers.put("Senior System Administrator Romania", "f_E=4");
        searchTiers.put("Senior Network Engineer Romania", "f_E=4");
        searchTiers.put("Senior Database Administrator Romania", "f_E=4");
        searchTiers.put("Senior Scrum Master Romania", "f_E=4");
        searchTiers.put("Senior SAP Consultant Romania", "f_E=4");
        searchTiers.put("Senior Business Analyst Romania", "f_E=4");
        searchTiers.put("Senior UI UX Designer Romania", "f_E=4");
        searchTiers.put("Principal Software Engineer Romania", "f_E=4");
        searchTiers.put("Tech Lead Romania", "f_E=4");
        searchTiers.put("Lead Software Engineer Romania", "f_E=4");
        searchTiers.put("Software Architect Romania", "f_E=4");
        searchTiers.put("Solutions Architect Romania", "f_E=4");
        searchTiers.put("Engineering Manager Romania", "f_E=4");
        searchTiers.put("IT Project Manager Romania", "f_E=4");

        Set<String> seenJobUrls = new HashSet<>();
        int queryIdx = 0;

        for (Map.Entry<String, String> entry : searchTiers.entrySet()) {
            String query = entry.getKey();
            String expFilter = entry.getValue();
            int offset = 0;
            int consecutiveZeroNew = 0;
            int maxPagesPerQuery = 40;

            while (true) {
                try {
                    String encodedQuery = java.net.URLEncoder.encode(query, java.nio.charset.StandardCharsets.UTF_8);
                    String queryUrl = "https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=" 
                            + encodedQuery + "&location=Romania&sortBy=DD&f_TPR=r2592000&" + expFilter + "&start=" + offset;

                    String ua = LINKEDIN_USER_AGENTS.get((queryIdx + (offset / 25)) % LINKEDIN_USER_AGENTS.size());

                    Document doc = Jsoup.connect(queryUrl)
                            .userAgent(ua)
                            .header("Accept-Language", "en-US,en;q=0.9")
                            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
                            .timeout(10000)
                            .get();

                    Elements cards = doc.select("li div.base-card");
                    if (cards.isEmpty()) {
                        break;
                    }

                    int newJobsThisPage = 0;
                    for (Element card : cards) {
                        Element linkEl = card.selectFirst("a.base-card__full-link");
                        if (linkEl == null) continue;

                        String directUrl = linkEl.attr("href");
                        if (directUrl == null || directUrl.isEmpty()) continue;
                        
                        String cleanUrl = directUrl.contains("?") ? directUrl.split("\\?")[0] : directUrl;
                        if (seenJobUrls.contains(cleanUrl)) continue;
                        seenJobUrls.add(cleanUrl);
                        newJobsThisPage++;

                        Element titleEl = card.selectFirst(".base-search-card__title");
                        Element compEl = card.selectFirst(".base-search-card__subtitle");
                        Element locEl = card.selectFirst(".job-search-card__location");
                        Element dateEl = card.selectFirst("time.job-search-card__listdate, time.job-search-card__listdate--new, time");
                        Element logoEl = card.selectFirst("img.artdeco-entity-image");
                        Element benefitEl = card.selectFirst(".job-posting-benefits__text");

                        String title = titleEl != null ? titleEl.text().trim() : query;
                        if (!isStrictlyItJob(title)) continue;

                        String company = compEl != null ? compEl.text().trim() : "Tech Company";
                        String location = locEl != null ? locEl.text().trim() : "Bucharest, Romania";
                        String postedDate = dateEl != null ? dateEl.text().trim() : "Postat recent";
                        String dtAttr = dateEl != null ? dateEl.attr("datetime") : null;
                        String benefitText = benefitEl != null ? benefitEl.text().trim().toLowerCase() : "";

                        String logoUrl = logoEl != null && logoEl.hasAttr("data-delayed-url") ? 
                                logoEl.attr("data-delayed-url") : 
                                "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=80";

                        String level = determineExperienceLevel(title, null);
                        if (level.equals("MID") && expFilter.contains("f_E=1") && (title.toLowerCase().contains("intern") || title.toLowerCase().contains("stagiu") || title.toLowerCase().contains("trainee") || title.toLowerCase().contains("student"))) {
                            level = "INTERNSHIP";
                        } else if (level.equals("MID") && expFilter.contains("f_E=4") && (title.toLowerCase().contains("senior") || title.toLowerCase().contains("lead") || title.toLowerCase().contains("principal"))) {
                            level = "SENIOR";
                        }

                        int daysAgo = -1;
                        OffsetDateTime postedAt = parseExactDate(dtAttr);
                        if (postedAt != null) {
                            long diff = java.time.temporal.ChronoUnit.DAYS.between(postedAt.toLocalDate(), LocalDate.now());
                            daysAgo = (int) Math.max(0, diff);
                        } else {
                            daysAgo = parseDaysAgo(postedDate);
                            if (daysAgo >= 0) {
                                postedAt = OffsetDateTime.now().minusDays(daysAgo);
                            }
                        }
                        String postedDateAgo = daysAgo == 0 ? "Astăzi" : daysAgo == 1 ? "Ieri" : daysAgo > 1 ? (daysAgo + " zile în urmă") : "Dată nespecificată";

                        boolean isEarlyApplicant = benefitText.contains("early applicant") || benefitText.contains("primii 25");

                        String compLevel;
                        String compLabel;
                        String applicantCountText;

                        if (isEarlyApplicant) {
                            compLevel = "LOW";
                            compLabel = "Șansă Mare";
                            applicantCountText = "Sub 25 de candidați";
                        } else {
                            if (daysAgo >= 3 || postedDate.toLowerCase().contains("week") || postedDate.toLowerCase().contains("month")) {
                                compLevel = "HIGH";
                                compLabel = "Competiție Ridicată";
                                applicantCountText = "Peste 100 de aplicanți";
                            } else if (daysAgo >= 1 || isMajorTechBrand(company) || level.equals("JUNIOR") || level.equals("INTERNSHIP")) {
                                compLevel = "HIGH";
                                compLabel = "Competiție Ridicată";
                                applicantCountText = "50-100+ de aplicanți";
                            } else {
                                compLevel = "MEDIUM";
                                compLabel = "Competiție Medie";
                                applicantCountText = "25-50 de candidați";
                            }
                        }

                        List<String> skills = extractSkillsFromTitle(title);

                        String desc = "Poziție activă de " + title + " la " + company + " (" + location + "). " +
                                "Nivel identificat: " + level + ". Competențe asociate: " + String.join(", ", skills) + ". " +
                                (benefitText.isEmpty() ? "Aplicare directă securizată pe platforma oficială LinkedIn România." : "Beneficii evidențiate: " + benefitText + ". Aplicare directă pe LinkedIn.");

                        String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                        if (!seenDedupKeys.add(dedupKey)) continue;

                        String externalId;
                        Matcher m = Pattern.compile("(\\d{7,15})").matcher(cleanUrl);
                        if (m.find()) {
                            externalId = m.group(1);
                        } else {
                            externalId = "li-" + UUID.randomUUID().toString().substring(0, 8);
                        }

                        String contentHash = computeContentHash(title, company, desc, "Pachet Salarial Standard LinkedIn", String.join(",", skills), location);
                        OffsetDateTime now = OffsetDateTime.now();

                        freshList.add(new UnifiedJobListingDto(
                                "li-live-" + externalId,
                                title,
                                company,
                                logoUrl,
                                location,
                                location.toLowerCase().contains("remote") ? "REMOTE" : "HYBRID",
                                level,
                                "LINKEDIN",
                                cleanUrl,
                                desc,
                                "Pachet Salarial Standard LinkedIn",
                                skills,
                                Collections.emptyList(),
                                Collections.emptyList(),
                                postedDate,
                                97.0,
                                compLevel,
                                compLabel,
                                applicantCountText,
                                daysAgo,
                                externalId,
                                contentHash,
                                postedAt,
                                now,
                                now,
                                "ACTIVE"
                        ));
                    }

                    if (cards.size() < 5) {
                        break;
                    }

                    if (newJobsThisPage == 0) {
                        consecutiveZeroNew++;
                        if (consecutiveZeroNew >= 2) {
                            break;
                        }
                    } else {
                        consecutiveZeroNew = 0;
                    }

                    offset += 25;
                    if (offset >= maxPagesPerQuery * 25) {
                        break;
                    }

                    try {
                        Thread.sleep(150);
                    } catch (InterruptedException ignored) {}

                } catch (org.jsoup.HttpStatusException hse) {
                    if (hse.getStatusCode() == 429) {
                        log.warn("[JOB CRAWLER] LinkedIn rate limit (429) pentru {} (offset={}), temporizare 2s", query, offset);
                        try { Thread.sleep(2000); } catch (InterruptedException ignored) {}
                    } else {
                        log.warn("[JOB CRAWLER] LinkedIn scrape fallback pentru {} (offset={}): {}", query, offset, hse.getMessage());
                    }
                    break;
                } catch (Exception e) {
                    log.warn("[JOB CRAWLER] LinkedIn scrape fallback pentru {} (offset={}): {}", query, offset, e.getMessage());
                    break;
                }
            }
            queryIdx++;
        }
        log.info("[JOB CRAWLER] LinkedIn România Extins: {} joburi reale preluate.", seenJobUrls.size());
    }

    private void searchTrainees(Map<String, String> searchTiers) {
        searchTiers.put("Trainee Software Engineer Romania", "f_E=2");
    }
}
