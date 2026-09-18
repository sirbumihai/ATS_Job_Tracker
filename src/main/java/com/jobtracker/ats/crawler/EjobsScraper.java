package com.jobtracker.ats.crawler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
@Slf4j
public class EjobsScraper implements JobScraper {

    private final ObjectMapper objectMapper;

    @Override
    public String getPlatformName() {
        return "EJOBS";
    }

    @Override
    public void scrape(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        Set<String> seenUrls = new HashSet<>();
        List<String> itSearchPaths = List.of(
                "https://www.ejobs.ro/locuri-de-munca/it-software?sort=date",
                "https://www.ejobs.ro/locuri-de-munca/it-software/pagina1?sort=date",
                "https://www.ejobs.ro/locuri-de-munca/it-software/pagina2?sort=date",
                "https://www.ejobs.ro/locuri-de-munca/it-software/pagina3?sort=date"
        );

        for (String url : itSearchPaths) {
            try {
                Document doc = Jsoup.connect(url)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(10000)
                        .get();

                // 1. ÎNCERCARE PARSARE STAT-HYDRATION NUXT 3 (__NUXT_DATA__)
                boolean nuxtParsed = false;
                Element nuxtEl = doc.selectFirst("script#__NUXT_DATA__");
                if (nuxtEl != null && !nuxtEl.data().isBlank()) {
                    try {
                        JsonNode arr = objectMapper.readTree(nuxtEl.data());
                        if (arr.isArray()) {
                            for (JsonNode item : arr) {
                                if (item.isObject() && item.has("title") && item.has("creationDate") && item.has("slug")) {
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
                                    if (seenUrls.contains(directUrl)) continue;

                                    String company = "Companie IT România";
                                    JsonNode compNode = derefNuxt(item.get("company"), arr);
                                    if (compNode != null && compNode.isObject() && compNode.has("name")) {
                                        JsonNode nameNode = derefNuxt(compNode.get("name"), arr);
                                        if (nameNode != null && !nameNode.asText().isBlank()) {
                                            company = nameNode.asText().trim();
                                        }
                                    }

                                    String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                                    if (!seenDedupKeys.add(dedupKey)) continue;
                                    seenUrls.add(directUrl);

                                    String salary = "Salariu Nespecificat / Conform Anunț";
                                    if (item.has("salary")) {
                                        JsonNode salNode = derefNuxt(item.get("salary"), arr);
                                        if (salNode != null && !salNode.isNull() && !salNode.asText().isBlank()) {
                                            salary = salNode.asText().trim();
                                        }
                                    }

                                    OffsetDateTime postedAt = null;
                                    int daysAgo = -1;
                                    String postedDateAgo = "Dată nespecificată";
                                    if (dateNode != null && !dateNode.asText().isBlank()) {
                                        postedAt = parseExactDate(dateNode.asText().trim());
                                        if (postedAt != null) {
                                            daysAgo = (int) Math.max(0, java.time.Duration.between(postedAt, OffsetDateTime.now()).toDays());
                                            if (daysAgo == 0) postedDateAgo = "Astăzi";
                                            else if (daysAgo == 1) postedDateAgo = "Ieri";
                                            else if (daysAgo > 1) postedDateAgo = "Acum " + daysAgo + " zile";
                                        }
                                    }

                                    String level = determineExperienceLevel(title);
                                    List<String> skills = extractSkillsFromTitle(title);
                                    String extId = "userlocuri-de-munca" + slug.replaceAll("[^a-zA-Z0-9-]", "") + ejobId;
                                    String desc = "Anunț activ de recrutare IT publicat pe eJobs.ro de către " + company + ". Rol: " + title + ". Nivel identificat: " + level + ". Competențe cerute: " + String.join(", ", skills) + ". Aplicare directă pe platforma eJobs.";
                                    String contentHash = computeContentHash(title, company, desc, salary, String.join(",", skills), "Bucharest / Remote, Romania");
                                    OffsetDateTime now = OffsetDateTime.now();

                                    freshList.add(new UnifiedJobListingDto(
                                            "ejobs-live-" + extId,
                                            title,
                                            company,
                                            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                                            "Bucharest / Remote, Romania",
                                            "HYBRID",
                                            level,
                                            "EJOBS",
                                            directUrl,
                                            desc,
                                            salary,
                                            skills,
                                            Collections.emptyList(),
                                            Collections.emptyList(),
                                            postedDateAgo,
                                            94.0,
                                            "HIGH",
                                            "Competiție Ridicată",
                                            "80-150+ aplicanți",
                                            daysAgo,
                                            extId,
                                            contentHash,
                                            postedAt,
                                            now,
                                            now,
                                            "ACTIVE",
                                            false
                                    ));
                                    nuxtParsed = true;
                                }
                            }
                        }
                    } catch (Exception e) {
                        log.warn("[JOB CRAWLER] Eroare la parsarea Nuxt state eJobs: {}", e.getMessage());
                    }
                }

                // 2. FALLBACK HTML PARSING
                if (!nuxtParsed) {
                    Elements jobLinks = doc.select("a[href*=/locuri-de-munca/]");
                    for (Element el : jobLinks) {
                        String href = el.attr("href");
                        if (href == null || !href.matches(".*locuri-de-munca/[a-zA-Z0-9-]+/\\d+.*") || seenUrls.contains(href)) {
                            continue;
                        }

                        String text = el.text().trim();
                        if (text.isEmpty()) {
                            String[] parts = href.split("/");
                            if (parts.length >= 4) {
                                text = formatSlugTitle(parts[parts.length - 2]);
                            } else {
                                text = "IT Software Engineer";
                            }
                        }

                        if (!isStrictlyItJob(text)) continue;

                        String title = text;
                        String company = "Companie IT România";
                        String dedupKey = normalizeForDedup(title) + "::" + normalizeForDedup(company);
                        if (!seenDedupKeys.add(dedupKey)) continue;

                        seenUrls.add(href);
                        String directUrl = href.startsWith("http") ? href : "https://www.ejobs.ro" + href;

                        String level = determineExperienceLevel(title);
                        List<String> skills = extractSkillsFromTitle(title);
                        int daysAgo = -1;
                        OffsetDateTime postedAt = null;
                        String extId = href.replaceAll("[^a-zA-Z0-9-]", "");
                        String desc = "Anunț activ de recrutare IT publicat pe eJobs.ro. Rol: " + title + ". Nivel identificat: " + level + ". Competențe cerute: " + String.join(", ", skills) + ". Aplicare directă pe platforma eJobs.";
                        String contentHash = computeContentHash(title, company, desc, "Salariu Nespecificat / Conform Anunț", String.join(",", skills), "Bucharest / Remote, Romania");
                        OffsetDateTime now = OffsetDateTime.now();

                        freshList.add(new UnifiedJobListingDto(
                                "ejobs-live-" + extId,
                                title,
                                company,
                                "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                                "Bucharest / Remote, Romania",
                                "HYBRID",
                                level,
                                "EJOBS",
                                directUrl,
                                desc,
                                "Salariu Nespecificat / Conform Anunț",
                                skills,
                                Collections.emptyList(),
                                Collections.emptyList(),
                                "Dată nespecificată",
                                94.0,
                                "HIGH",
                                "Competiție Ridicată",
                                "80-150+ aplicanți",
                                daysAgo,
                                extId,
                                contentHash,
                                postedAt,
                                now,
                                now,
                                "ACTIVE",
                                false
                        ));
                    }
                }
            } catch (Exception e) {
                log.warn("[JOB CRAWLER] eJobs scrape fallback: {}", e.getMessage());
            }
        }
        log.info("[JOB CRAWLER] eJobs: {} joburi IT reale preluate.", seenUrls.size());
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
