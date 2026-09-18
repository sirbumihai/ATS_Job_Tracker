package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.ApplicationResponse;
import com.jobtracker.ats.dto.JobSearchResponse;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.Application.ApplicationStatus;
import com.jobtracker.ats.entity.CachedJobListing;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CachedJobListingRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.UserRepository;
import com.jobtracker.ats.service.JobAtsMatchEngine.AtsMatchResult;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobSearchService {

    private final JobPostingRepository jobPostingRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final CvProfileRepository cvProfileRepository;
    private final CachedJobListingRepository cachedJobListingRepository;
    private final JobAtsMatchEngine jobAtsMatchEngine;

    // Cache dinamic în memorie ce conține joburile active și verificate
    private final List<UnifiedJobListingDto> activeLiveJobsCache = new CopyOnWriteArrayList<>();

    public List<UnifiedJobListingDto> getActiveLiveJobsCache() {
        return activeLiveJobsCache;
    }

    public int loadJobsFromDatabase() {
        try {
            List<CachedJobListing> entities = cachedJobListingRepository.findAllOrderedByRecency();
            if (!entities.isEmpty()) {
                List<String> nonItIds = new ArrayList<>();
                List<UnifiedJobListingDto> dtos = new ArrayList<>();

                for (CachedJobListing j : entities) {
                    if (j.getSourcePlatform() != null && REMOVED_PLATFORMS.contains(j.getSourcePlatform().toUpperCase())) {
                        nonItIds.add(j.getId());
                    } else if (!isStrictlyItJob(j.getJobTitle())) {
                        nonItIds.add(j.getId());
                    } else {
                        dtos.add(j.toDto());
                    }
                }

                if (!nonItIds.isEmpty()) {
                    try {
                        int batchSize = 500;
                        for (int i = 0; i < nonItIds.size(); i += batchSize) {
                            int end = Math.min(i + batchSize, nonItIds.size());
                            cachedJobListingRepository.deleteAllByIdInBatch(nonItIds.subList(i, end));
                        }
                        log.info("[JOB DATABASE CLEANUP] Curățate {} joburi vechi non-IT din baza de date PostgreSQL.", nonItIds.size());
                    } catch (Exception e) {
                        log.warn("[JOB DATABASE CLEANUP] Eroare la curățarea joburilor non-IT: {}", e.getMessage());
                    }
                }

                activeLiveJobsCache.clear();
                activeLiveJobsCache.addAll(dtos);
                return activeLiveJobsCache.size();
            }
        } catch (Exception e) {
            log.warn("[JOB SEARCH SERVICE] Eroare la citirea joburilor din baza de date: {}", e.getMessage());
        }
        return 0;
    }

    @Transactional(readOnly = true)
    public List<UnifiedJobListingDto> searchJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted,
            String status,
            String discovered
    ) {
        return filterAndSortJobs(
                userId, keyword, location, platform, level, roleCategory,
                workModel, sortBy, datePosted, status, discovered, "ALL", "ALL"
        );
    }

    @Transactional(readOnly = true)
    public JobSearchResponse searchJobsPaginated(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted,
            String status,
            String discovered,
            String competitiveness,
            String atsScore,
            int page,
            int size
    ) {
        List<UnifiedJobListingDto> allFiltered = filterAndSortJobs(
                userId, keyword, location, platform, level, roleCategory,
                workModel, sortBy, datePosted, status, discovered,
                competitiveness, atsScore
        );

        int totalElements = allFiltered.size();
        int effectivePage = Math.max(1, page);
        int effectiveSize = Math.max(1, Math.min(size, 100));
        int totalPages = totalElements == 0 ? 1 : (int) Math.ceil((double) totalElements / effectiveSize);

        int fromIndex = Math.min((effectivePage - 1) * effectiveSize, totalElements);
        int toIndex = Math.min(fromIndex + effectiveSize, totalElements);

        List<UnifiedJobListingDto> pageContent = allFiltered.subList(fromIndex, toIndex).stream()
                .map(UnifiedJobListingDto::withoutRawDescription)
                .toList();

        boolean hasNext = effectivePage < totalPages;
        boolean hasPrevious = effectivePage > 1;

        return new JobSearchResponse(
                pageContent,
                effectivePage,
                effectiveSize,
                totalElements,
                totalPages,
                hasNext,
                hasPrevious
        );
    }

    private List<UnifiedJobListingDto> filterAndSortJobs(
            UUID userId,
            String keyword,
            String location,
            String platform,
            String level,
            String roleCategory,
            String workModel,
            String sortBy,
            String datePosted,
            String status,
            String discovered,
            String competitiveness,
            String atsScore
    ) {
        String cvText = jobAtsMatchEngine.getCandidateCvText(userId);
        String cvLower = cvText.toLowerCase();

        String kwLower = (keyword != null && !keyword.isBlank()) ? keyword.toLowerCase().trim() : "";
        String locLower = (location != null && !location.isBlank()) ? location.toLowerCase().trim() : "";
        String platUpper = (platform != null && !platform.isBlank()) ? platform.toUpperCase().trim() : "ALL";
        String lvlUpper = (level != null && !level.isBlank()) ? level.toUpperCase().trim() : "ALL";
        String catUpper = (roleCategory != null && !roleCategory.isBlank()) ? roleCategory.toUpperCase().trim() : "ALL";
        String wmUpper = (workModel != null && !workModel.isBlank()) ? workModel.toUpperCase().trim() : "ALL";
        String statusUpper = (status != null && !status.isBlank()) ? status.toUpperCase().trim() : "ACTIVE";
        String compUpper = (competitiveness != null && !competitiveness.isBlank()) ? competitiveness.toUpperCase().trim() : "ALL";
        String atsUpper = (atsScore != null && !atsScore.isBlank()) ? atsScore.toUpperCase().trim() : "ALL";

        Set<String> selectedPlatforms = Arrays.stream(platUpper.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.equals("ALL"))
                .collect(Collectors.toSet());

        Set<String> selectedCategories = Arrays.stream(catUpper.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.equals("ALL"))
                .collect(Collectors.toSet());

        Set<String> selectedLevels = Arrays.stream(lvlUpper.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty() && !s.equals("ALL"))
                .collect(Collectors.toSet());

        OffsetDateTime dateCutoff = null;
        boolean filterOnlyNewlyDiscovered = false;
        String rawDateParam = (discovered != null && !discovered.equalsIgnoreCase("ALL")) ? discovered : datePosted;
        if (rawDateParam != null && !rawDateParam.isBlank() && !rawDateParam.equalsIgnoreCase("ALL")) {
            String dp = rawDateParam.toUpperCase().trim();
            if (dp.equals("NEWLY_DISCOVERED") || dp.equals("NEW") || dp.equals("JUST_FOUND")) {
                filterOnlyNewlyDiscovered = true;
            } else {
                OffsetDateTime now = OffsetDateTime.now();
                if (dp.equals("24H") || dp.equals("TODAY") || dp.equals("1")) {
                    dateCutoff = now.minusHours(24);
                } else if (dp.equals("48H") || dp.equals("2") || dp.equals("3")) {
                    dateCutoff = now.minusHours(48);
                } else if (dp.equals("7D") || dp.equals("WEEK") || dp.equals("7")) {
                    dateCutoff = now.minusDays(7);
                } else if (dp.equals("14") || dp.equals("14D")) {
                    dateCutoff = now.minusDays(14);
                } else if (dp.equals("30") || dp.equals("30D") || dp.equals("MONTH")) {
                    dateCutoff = now.minusDays(30);
                }
            }
        }

        List<UnifiedJobListingDto> results = new ArrayList<>();
        Map<String, Double> searchRelevanceMap = new HashMap<>();

        for (UnifiedJobListingDto job : activeLiveJobsCache) {
            if (job.sourcePlatform() != null && REMOVED_PLATFORMS.contains(job.sourcePlatform().toUpperCase())) {
                continue;
            }

            if (!statusUpper.equals("ALL")) {
                String jStatus = job.status() != null ? job.status().toUpperCase().trim() : "ACTIVE";
                if (!jStatus.equals(statusUpper)) {
                    continue;
                }
            }

            if (!compUpper.equals("ALL")) {
                String jobComp = job.competitiveness() != null ? job.competitiveness().toUpperCase().trim() : "MEDIUM";
                if (!jobComp.equals(compUpper)) {
                    continue;
                }
            }

            if (filterOnlyNewlyDiscovered) {
                if (!job.newlyDiscovered()) {
                    continue;
                }
            } else if (dateCutoff != null) {
                long cutoffMilli = dateCutoff.toInstant().toEpochMilli();
                long jobMilli = getJobEpochMilli(job);
                if (jobMilli < cutoffMilli) {
                    continue;
                }
            }

            if (!selectedCategories.isEmpty()) {
                boolean matchesCategory = false;
                for (String cat : selectedCategories) {
                    if (matchesRoleCategory(job, cat)) {
                        matchesCategory = true;
                        break;
                    }
                }
                if (!matchesCategory) {
                    continue;
                }
            }

            if (!wmUpper.equals("ALL")) {
                if (!job.workModel().equalsIgnoreCase(wmUpper)) {
                    continue;
                }
            }

            if (!kwLower.isEmpty()) {
                double relevance = calculateKeywordRelevance(job, kwLower);
                if (relevance < 0) {
                    continue;
                }
                searchRelevanceMap.put(job.id(), relevance);
            }

            if (!locLower.isEmpty()) {
                if (!matchesLocationIntelligently(job, locLower)) {
                    continue;
                }
            }

            if (!selectedPlatforms.isEmpty()) {
                boolean matchesPlat = false;
                for (String p : selectedPlatforms) {
                    if (job.sourcePlatform().equalsIgnoreCase(p)) {
                        matchesPlat = true;
                        break;
                    }
                }
                if (!matchesPlat) {
                    continue;
                }
            }

            if (!selectedLevels.isEmpty()) {
                String jLvl = job.experienceLevel() != null ? job.experienceLevel().toUpperCase().trim() : "MID";
                if (!selectedLevels.contains(jLvl)) {
                    continue;
                }
            }

            AtsMatchResult matchRes = jobAtsMatchEngine.evaluateAtsMatch(job.experienceLevel(), job.skillsRequired(), cvLower);

            if (!atsUpper.equals("ALL")) {
                double score = matchRes.finalScore();
                if (atsUpper.equals("TOP_80") && score < 80.0) continue;
                if (atsUpper.equals("TOP_60") && score < 60.0) continue;
                if (atsUpper.equals("TOP_40") && score < 40.0) continue;
                if (atsUpper.equals("UNDER_40") && score >= 40.0) continue;
            }

            results.add(new UnifiedJobListingDto(
                    job.id(),
                    job.jobTitle(),
                    job.companyName(),
                    job.companyLogoUrl(),
                    job.location(),
                    job.workModel(),
                    job.experienceLevel(),
                    job.sourcePlatform(),
                    job.directApplyUrl(),
                    job.rawDescription(),
                    job.salaryRange(),
                    job.skillsRequired(),
                    matchRes.matchingSkills(),
                    matchRes.missingSkills(),
                    job.postedDateAgo(),
                    matchRes.finalScore(),
                    job.competitiveness(),
                    job.competitivenessLabel(),
                    job.applicantCountText(),
                    job.postedDaysAgo(),
                    job.externalId(),
                    job.contentHash(),
                    job.postedAt(),
                    job.firstSeenAt(),
                    job.lastSeenAt(),
                    job.status(),
                    job.newlyDiscovered()
            ));
        }

        sortJobList(results, sortBy, searchRelevanceMap, kwLower);
        return results;
    }

    public Map<String, Object> getJobStats() {
        Map<String, Integer> platformCounts = new HashMap<>();
        platformCounts.put("ALL", activeLiveJobsCache.size());

        int junior = 0;
        int intern = 0;
        int remote = 0;
        int highChance = 0;
        int newlyDiscovered = 0;

        for (UnifiedJobListingDto job : activeLiveJobsCache) {
            String p = job.sourcePlatform();
            platformCounts.put(p, platformCounts.getOrDefault(p, 0) + 1);

            if (job.newlyDiscovered()) newlyDiscovered++;
            if ("JUNIOR".equalsIgnoreCase(job.experienceLevel())) junior++;
            if ("INTERNSHIP".equalsIgnoreCase(job.experienceLevel())) intern++;
            if ("REMOTE".equalsIgnoreCase(job.workModel())) remote++;
            if ("LOW".equalsIgnoreCase(job.competitiveness())) highChance++;
        }

        return Map.of(
                "platformCounts", platformCounts,
                "summaryStats", Map.of(
                        "junior", junior,
                        "intern", intern,
                        "remote", remote,
                        "highChance", highChance,
                        "newlyDiscovered", newlyDiscovered
                ),
                "totalLiveJobs", activeLiveJobsCache.size()
        );
    }

    public UnifiedJobListingDto getJobDetails(String id, UUID userId) {
        if (id == null) return null;

        String cvText = jobAtsMatchEngine.getCandidateCvText(userId);
        String cvLower = cvText.toLowerCase();

        UnifiedJobListingDto job = activeLiveJobsCache.stream()
                .filter(j -> j.id().equals(id))
                .findFirst()
                .orElse(null);

        if (job == null) {
            try {
                UUID jobUuid = UUID.fromString(id);
                Optional<JobPosting> postingOpt = jobPostingRepository.findById(jobUuid);
                if (postingOpt.isPresent()) {
                    JobPosting jp = postingOpt.get();
                    String fullDesc = jp.getRawDescription();
                    String applyUrl = jp.getJobUrl() != null ? jp.getJobUrl() : "";
                    String platform = "OTHER";
                    if (applyUrl.contains("linkedin.com")) platform = "LINKEDIN";
                    else if (applyUrl.contains("hipo.ro")) platform = "HIPO";
                    else if (applyUrl.contains("bestjobs.eu")) platform = "BESTJOBS";

                    if ((fullDesc == null || fullDesc.length() < 400) && !applyUrl.isBlank()) {
                        String fetched = fetchFullDescription(applyUrl, platform);
                        if (fetched != null && fetched.length() > 400) {
                            fullDesc = fetched;
                            jp.setRawDescription(fullDesc);
                            jobPostingRepository.save(jp);
                        }
                    }

                    String effectiveDesc = fullDesc != null ? fullDesc : "";
                    List<String> skills = extractSkills(jp.getJobTitle(), effectiveDesc);
                    String level = determineExperienceLevel(jp.getJobTitle(), effectiveDesc);
                    AtsMatchResult ats = jobAtsMatchEngine.evaluateAtsMatch(level, skills, cvLower);

                    return new UnifiedJobListingDto(
                            jp.getId().toString(),
                            jp.getJobTitle(),
                            jp.getCompanyName(),
                            "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&auto=format&fit=crop&q=80",
                            "Romania",
                            "HYBRID",
                            level,
                            platform,
                            applyUrl,
                            effectiveDesc,
                            "Pachet Salarial Standard",
                            skills,
                            ats.matchingSkills(),
                            ats.missingSkills(),
                            "Salvat in Tracker",
                            ats.finalScore(),
                            "MEDIUM",
                            "Competitie Medie",
                            "Candidatura Activa",
                            0,
                            null,
                            null,
                            jp.getCreatedAt(),
                            jp.getCreatedAt(),
                            null,
                            "ACTIVE",
                            false
                    );
                }
            } catch (Exception e) {
                log.warn("[JOB DETAILS] Nu s-a putut încărca jobul salvat cu ID-ul {}: {}", id, e.getMessage());
            }
            return null;
        }

        AtsMatchResult userAts = jobAtsMatchEngine.evaluateAtsMatch(job.experienceLevel(), job.skillsRequired(), cvLower);
        double finalScore = userAts.finalScore();
        List<String> matchingSkills = userAts.matchingSkills();
        List<String> missingSkills = userAts.missingSkills();

        if (job.rawDescription() == null || job.rawDescription().length() < 400) {
            String fullText = fetchFullDescription(job.directApplyUrl(), job.sourcePlatform());
            if (fullText != null && fullText.length() > 400) {
                List<String> newSkills = extractSkills(job.jobTitle(), fullText);
                String newLevel = determineExperienceLevel(job.jobTitle(), fullText);
                List<String> effectiveSkills = newSkills.isEmpty() ? job.skillsRequired() : newSkills;
                AtsMatchResult updatedAts = jobAtsMatchEngine.evaluateAtsMatch(newLevel, effectiveSkills, cvLower);

                UnifiedJobListingDto updated = new UnifiedJobListingDto(
                        job.id(),
                        job.jobTitle(),
                        job.companyName(),
                        job.companyLogoUrl(),
                        job.location(),
                        job.workModel(),
                        newLevel,
                        job.sourcePlatform(),
                        job.directApplyUrl(),
                        fullText,
                        job.salaryRange(),
                        effectiveSkills,
                        updatedAts.matchingSkills(),
                        updatedAts.missingSkills(),
                        job.postedDateAgo(),
                        updatedAts.finalScore(),
                        job.competitiveness(),
                        job.competitivenessLabel(),
                        job.applicantCountText(),
                        job.postedDaysAgo(),
                        job.externalId(),
                        job.contentHash(),
                        job.postedAt(),
                        job.firstSeenAt(),
                        job.lastSeenAt(),
                        job.status(),
                        job.newlyDiscovered()
                );
                int idx = activeLiveJobsCache.indexOf(job);
                if (idx >= 0) {
                    activeLiveJobsCache.set(idx, updated);
                }
                return updated;
            }
        }

        return new UnifiedJobListingDto(
                job.id(),
                job.jobTitle(),
                job.companyName(),
                job.companyLogoUrl(),
                job.location(),
                job.workModel(),
                job.experienceLevel(),
                job.sourcePlatform(),
                job.directApplyUrl(),
                job.rawDescription(),
                job.salaryRange(),
                job.skillsRequired(),
                matchingSkills,
                missingSkills,
                job.postedDateAgo(),
                finalScore,
                job.competitiveness(),
                job.competitivenessLabel(),
                job.applicantCountText(),
                job.postedDaysAgo(),
                job.externalId(),
                job.contentHash(),
                job.postedAt(),
                job.firstSeenAt(),
                job.lastSeenAt(),
                job.status(),
                job.newlyDiscovered()
        );
    }

    @Transactional
    public ApplicationResponse saveJobToKanban(UUID userId, UnifiedJobListingDto jobDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit."));

        String effectiveDesc = jobDto.rawDescription();
        if ((effectiveDesc == null || effectiveDesc.length() < 400) && jobDto.id() != null) {
            UnifiedJobListingDto cached = activeLiveJobsCache.stream()
                    .filter(j -> j.id().equals(jobDto.id()))
                    .findFirst()
                    .orElse(null);
            if (cached != null && cached.rawDescription() != null && !cached.rawDescription().isBlank()) {
                effectiveDesc = cached.rawDescription();
            }
        }
        if ((effectiveDesc == null || effectiveDesc.length() < 400) && jobDto.directApplyUrl() != null && !jobDto.directApplyUrl().isBlank()) {
            String fetched = fetchFullDescription(jobDto.directApplyUrl(), jobDto.sourcePlatform());
            if (fetched != null && fetched.length() > 400) {
                effectiveDesc = fetched;
            }
        }

        JobPosting jobPosting = JobPosting.builder()
                .user(user)
                .jobTitle(jobDto.jobTitle())
                .companyName(jobDto.companyName())
                .jobUrl(jobDto.directApplyUrl())
                .rawDescription(effectiveDesc)
                .build();

        JobPosting savedJob = jobPostingRepository.save(jobPosting);

        Optional<CvProfile> primaryCv = cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(userId));

        BigDecimal score = BigDecimal.valueOf(jobDto.atsMatchScore() > 0 ? jobDto.atsMatchScore() : 94.5)
                .setScale(1, RoundingMode.HALF_UP);

        Application application = Application.builder()
                .user(user)
                .jobPosting(savedJob)
                .cvProfile(primaryCv.orElse(null))
                .status(ApplicationStatus.SAVED)
                .semanticMatchScore(score)
                .notes("Salvat din motorul de cautare Job Discovery (Sursa: " + jobDto.sourcePlatform() + ")")
                .appliedDate(LocalDate.now())
                .build();

        Application savedApp = applicationRepository.save(application);
        log.info("[JOB SEARCH SERVICE] Jobul {} la {} a fost salvat in Kanban pentru utilizatorul {}",
                jobDto.jobTitle(), jobDto.companyName(), userId);

        return new ApplicationResponse(
                savedApp.getId(),
                user.getId(),
                savedJob.getId(),
                savedJob.getCompanyName(),
                savedJob.getJobTitle(),
                null,
                null,
                primaryCv.map(CvProfile::getId).orElse(null),
                primaryCv.map(CvProfile::getTitle).orElse(null),
                savedApp.getStatus(),
                savedApp.getSemanticMatchScore(),
                savedApp.getNotes(),
                savedApp.getAppliedDate(),
                savedApp.getCreatedAt()
        );
    }

    public String fetchFullDescription(String applyUrl, String platform) {
        if (applyUrl == null || applyUrl.isBlank()) return null;
        try {
            if ("LINKEDIN".equalsIgnoreCase(platform) || applyUrl.contains("linkedin.com")) {
                Matcher matcher = Pattern.compile("(\\d{8,12})").matcher(applyUrl);
                if (matcher.find()) {
                    String liId = matcher.group(1);
                    String guestUrl = "https://www.linkedin.com/jobs-guest/jobs/api/jobPosting/" + liId;
                    Document doc = Jsoup.connect(guestUrl)
                            .userAgent(BROWSER_USER_AGENT)
                            .timeout(7000)
                            .get();
                    doc.select("script, style, noscript, svg, header, footer, nav, iframe").remove();
                    Element descEl = doc.selectFirst(".show-more-less-html__markup");
                    if (descEl != null) {
                        descEl.select("script, style, noscript, svg, iframe").remove();
                        String fullText = descEl.wholeText().trim();
                        fullText = sanitizeScrapedDescription(fullText);
                        if (!fullText.isEmpty()) return fullText;
                    }
                }
            } else if ("HIPO".equalsIgnoreCase(platform) || applyUrl.contains("hipo.ro")) {
                Document doc = Jsoup.connect(applyUrl)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(7000)
                        .get();
                doc.select("script, style, noscript, svg, header, footer, nav, iframe").remove();
                Element descEl = doc.selectFirst(".content-block-content");
                if (descEl == null) descEl = doc.selectFirst(".the-content");
                if (descEl != null) {
                    descEl.select("script, style, noscript, svg, iframe").remove();
                    String fullText = descEl.wholeText().trim();
                    fullText = sanitizeScrapedDescription(fullText);
                    if (!fullText.isEmpty()) return fullText;
                }
            } else if ("BESTJOBS".equalsIgnoreCase(platform) || applyUrl.contains("bestjobs.eu")) {
                Document doc = Jsoup.connect(applyUrl)
                        .userAgent(BROWSER_USER_AGENT)
                        .timeout(7000)
                        .get();
                doc.select("script, style, noscript, svg, header, footer, nav, iframe").remove();
                Element descEl = doc.selectFirst(".job-description");
                if (descEl != null) {
                    descEl.select("script, style, noscript, svg, iframe").remove();
                    String fullText = descEl.wholeText().trim();
                    fullText = sanitizeScrapedDescription(fullText);
                    if (!fullText.isEmpty()) return fullText;
                }
            }
        } catch (Exception e) {
            log.warn("[ON DEMAND DESC FETCH] Eroare la preluarea descrierii complete pentru {}: {}", applyUrl, e.getMessage());
        }
        return null;
    }

    private double calculateKeywordRelevance(UnifiedJobListingDto job, String kwLower) {
        if (kwLower == null || kwLower.isBlank()) return 0.0;

        String title = job.jobTitle().toLowerCase();
        String company = job.companyName().toLowerCase();
        String desc = job.rawDescription() != null ? job.rawDescription().toLowerCase() : "";
        String location = job.location().toLowerCase();
        String workModel = job.workModel().toLowerCase();
        String level = job.experienceLevel().toLowerCase();
        String skills = String.join(" ", job.skillsRequired()).toLowerCase();

        double relevance = 0.0;

        if (title.contains(kwLower)) {
            relevance += 120.0;
        } else if (skills.contains(kwLower)) {
            relevance += 80.0;
        } else if (company.contains(kwLower)) {
            relevance += 50.0;
        } else if (desc.contains(kwLower)) {
            relevance += 30.0;
        }

        String[] tokens = kwLower.split("[\\s,;+/]+");
        int matchedTokens = 0;

        for (String token : tokens) {
            String t = token.trim();
            if (t.isEmpty()) continue;

            List<String> synonyms = expandTechSynonyms(t);
            boolean tokenMatched = false;

            for (String syn : synonyms) {
                if (title.contains(syn)) {
                    relevance += 35.0;
                    tokenMatched = true;
                    break;
                } else if (skills.contains(syn)) {
                    relevance += 25.0;
                    tokenMatched = true;
                    break;
                } else if (company.contains(syn)) {
                    relevance += 15.0;
                    tokenMatched = true;
                    break;
                } else if (level.contains(syn)) {
                    relevance += 20.0;
                    tokenMatched = true;
                    break;
                } else if (workModel.contains(syn)) {
                    relevance += 15.0;
                    tokenMatched = true;
                    break;
                } else if (location.contains(syn)) {
                    relevance += 15.0;
                    tokenMatched = true;
                    break;
                } else if (desc.contains(syn)) {
                    relevance += 8.0;
                    tokenMatched = true;
                    break;
                }
            }

            if (tokenMatched) {
                matchedTokens++;
            }
        }

        if (tokens.length > 1 && matchedTokens < Math.min(tokens.length, 2)) {
            return -1.0;
        }
        if (tokens.length == 1 && matchedTokens == 0) {
            return -1.0;
        }

        return relevance;
    }

    private void sortJobList(List<UnifiedJobListingDto> list, String sortBy, Map<String, Double> searchRelevanceMap, String kwLower) {
        String effectiveSort = (sortBy != null && !sortBy.isBlank()) ? sortBy.toUpperCase().trim() : "MATCH_AND_RECENCY";

        switch (effectiveSort) {
            case "MATCH_SCORE" -> list.sort((a, b) -> {
                int cmp = Double.compare(b.atsMatchScore(), a.atsMatchScore());
                if (cmp != 0) return cmp;
                return Integer.compare(a.postedDaysAgo(), b.postedDaysAgo());
            });
            case "POSTED_AT_DESC", "NEWEST", "FIRST_SEEN_DESC", "DISCOVERED_NEWEST" -> list.sort((a, b) -> {
                long timeA = getJobEpochMilli(a);
                long timeB = getJobEpochMilli(b);

                int cmp = Long.compare(timeB, timeA);
                if (cmp != 0) return cmp;
                return Double.compare(b.atsMatchScore(), a.atsMatchScore());
            });
            case "SALARY_DESC" -> list.sort((a, b) -> {
                double salA = parseSalaryEstimate(a.salaryRange());
                double salB = parseSalaryEstimate(b.salaryRange());
                int cmp = Double.compare(salB, salA);
                if (cmp != 0) return cmp;
                return Double.compare(b.atsMatchScore(), a.atsMatchScore());
            });
            case "LOW_COMPETITION" -> list.sort((a, b) -> {
                int compA = "LOW".equalsIgnoreCase(a.competitiveness()) ? 0 : "MEDIUM".equalsIgnoreCase(a.competitiveness()) ? 1 : 2;
                int compB = "LOW".equalsIgnoreCase(b.competitiveness()) ? 0 : "MEDIUM".equalsIgnoreCase(b.competitiveness()) ? 1 : 2;
                if (compA != compB) return Integer.compare(compA, compB);
                return Double.compare(b.atsMatchScore(), a.atsMatchScore());
            });
            case "JUNIOR_FIRST" -> list.sort((a, b) -> {
                int rankA = "INTERNSHIP".equalsIgnoreCase(a.experienceLevel()) ? 0 : "JUNIOR".equalsIgnoreCase(a.experienceLevel()) ? 1 : "MID".equalsIgnoreCase(a.experienceLevel()) ? 2 : 3;
                int rankB = "INTERNSHIP".equalsIgnoreCase(b.experienceLevel()) ? 0 : "JUNIOR".equalsIgnoreCase(b.experienceLevel()) ? 1 : "MID".equalsIgnoreCase(b.experienceLevel()) ? 2 : 3;
                if (rankA != rankB) return Integer.compare(rankA, rankB);
                return Double.compare(b.atsMatchScore(), a.atsMatchScore());
            });
            case "COMPANY_AZ" -> list.sort((a, b) -> {
                int cmp = String.CASE_INSENSITIVE_ORDER.compare(a.companyName(), b.companyName());
                if (cmp != 0) return cmp;
                return Double.compare(b.atsMatchScore(), a.atsMatchScore());
            });
            default -> {
                list.sort((a, b) -> {
                    double relA = searchRelevanceMap.getOrDefault(a.id(), 0.0);
                    double relB = searchRelevanceMap.getOrDefault(b.id(), 0.0);
                    if (!kwLower.isEmpty() && Math.abs(relB - relA) > 15.0) {
                        return Double.compare(relB, relA);
                    }

                    int daysOldA = a.postedDaysAgo() >= 0 ? a.postedDaysAgo() :
                            a.postedAt() != null ? (int) Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(a.postedAt().toLocalDate(), LocalDate.now())) : 15;
                    int daysOldB = b.postedDaysAgo() >= 0 ? b.postedDaysAgo() :
                            b.postedAt() != null ? (int) Math.max(0, java.time.temporal.ChronoUnit.DAYS.between(b.postedAt().toLocalDate(), LocalDate.now())) : 15;

                    double recencyBoostA = Math.max(0, 30 - daysOldA) * 1.0;
                    double recencyBoostB = Math.max(0, 30 - daysOldB) * 1.0;
                    double totalA = (a.atsMatchScore() * 0.70) + (recencyBoostA * 0.30) + (relA * 0.15);
                    double totalB = (b.atsMatchScore() * 0.70) + (recencyBoostB * 0.30) + (relB * 0.15);
                    return Double.compare(totalB, totalA);
                });
            }
        }
    }

    private long getJobEpochMilli(UnifiedJobListingDto job) {
        if (job == null) return 0;
        if (job.postedAt() != null) {
            return job.postedAt().toInstant().toEpochMilli();
        }
        if (job.postedDaysAgo() >= 0) {
            return Instant.now().minusSeconds((long) job.postedDaysAgo() * 86400).toEpochMilli();
        }
        if (job.firstSeenAt() != null) {
            return job.firstSeenAt().toInstant().toEpochMilli();
        }
        return 0;
    }
}
