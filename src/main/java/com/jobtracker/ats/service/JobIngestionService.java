package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import com.jobtracker.ats.entity.CachedJobListing;
import com.jobtracker.ats.entity.JobChange;
import com.jobtracker.ats.entity.JobStaging;
import com.jobtracker.ats.repository.CachedJobListingRepository;
import com.jobtracker.ats.repository.JobChangeRepository;
import com.jobtracker.ats.repository.JobStagingRepository;
import com.jobtracker.ats.util.JobNormalizationUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class JobIngestionService {

    private final CachedJobListingRepository cachedJobListingRepository;
    private final JobStagingRepository jobStagingRepository;
    private final JobChangeRepository jobChangeRepository;

    public void cleanRemovedPlatforms() {
        try {
            cachedJobListingRepository.deleteBySourcePlatformIn(REMOVED_PLATFORMS);
            jobStagingRepository.deleteBySourcePlatformIn(REMOVED_PLATFORMS);
        } catch (Exception e) {
            log.warn("[JOB INGESTION] Curățare platforme eliminate: {}", e.getMessage());
        }
    }

    public Set<String> getKnownDatabaseUrls() {
        Set<String> knownDbUrls = new HashSet<>();
        try {
            knownDbUrls.addAll(cachedJobListingRepository.findAllDirectApplyUrls());
        } catch (Exception e) {
            log.warn("[JOB INGESTION] Nu s-au putut citi URL-urile existente din DB: {}", e.getMessage());
        }
        return knownDbUrls;
    }

    @Transactional
    public void saveNewJobsToDatabase(List<UnifiedJobListingDto> freshList) {
        if (freshList == null || freshList.isEmpty()) return;
        try {
            OffsetDateTime now = OffsetDateTime.now();

            // 1. Ingestie decuplată în staging (jobs_staging)
            List<JobStaging> stagingBatch = new ArrayList<>();
            for (UnifiedJobListingDto dto : freshList) {
                if (dto.directApplyUrl() == null || dto.directApplyUrl().isBlank()) continue;
                stagingBatch.add(JobStaging.builder()
                        .externalId(dto.externalId() != null ? dto.externalId() : dto.id())
                        .sourcePlatform(dto.sourcePlatform())
                        .directApplyUrl(dto.directApplyUrl())
                        .rawPayload("{\"title\":\"" + dto.jobTitle() + "\",\"company\":\"" + dto.companyName() + "\",\"postedDate\":\"" + dto.postedDateAgo() + "\"}")
                        .processed(true)
                        .processedAt(now)
                        .build());
            }
            if (!stagingBatch.isEmpty()) {
                int stageBatchSize = 500;
                for (int i = 0; i < stagingBatch.size(); i += stageBatchSize) {
                    int end = Math.min(i + stageBatchSize, stagingBatch.size());
                    try {
                        jobStagingRepository.saveAll(stagingBatch.subList(i, end));
                    } catch (Exception ignored) {}
                }
            }

            // 2. Mapare pentru upsert & tracking modificări (cached_live_jobs & job_changes)
            try {
                cachedJobListingRepository.clearAllNewlyDiscovered();
            } catch (Exception e) {
                log.warn("[JOB INGESTION] Nu s-a putut reseta newlyDiscovered: {}", e.getMessage());
            }

            // Interogare selectivă în loturi pe baza URL-urilor primite (în loc de încărcare completă a tabelei cu findAll)
            Set<String> freshUrls = freshList.stream()
                    .map(UnifiedJobListingDto::directApplyUrl)
                    .filter(u -> u != null && !u.isBlank())
                    .collect(Collectors.toSet());

            Map<String, CachedJobListing> existingByUrl = new HashMap<>();
            if (!freshUrls.isEmpty()) {
                List<String> urlList = new ArrayList<>(freshUrls);
                int urlBatchSize = 500;
                for (int i = 0; i < urlList.size(); i += urlBatchSize) {
                    int end = Math.min(i + urlBatchSize, urlList.size());
                    List<CachedJobListing> chunk = cachedJobListingRepository.findByDirectApplyUrlIn(urlList.subList(i, end));
                    for (CachedJobListing j : chunk) {
                        if (j.getDirectApplyUrl() != null) {
                            existingByUrl.put(j.getDirectApplyUrl(), j);
                        }
                    }
                }
            }

            List<CachedJobListing> toInsert = new ArrayList<>();
            List<CachedJobListing> toUpdate = new ArrayList<>();
            List<JobChange> changesToInsert = new ArrayList<>();

            for (UnifiedJobListingDto dto : freshList) {
                if (dto.directApplyUrl() == null || dto.directApplyUrl().isBlank()) continue;

                String skillsStr = dto.skillsRequired() != null ? String.join(",", dto.skillsRequired()) : "";
                String newHash = computeContentHash(dto.jobTitle(), dto.companyName(), dto.rawDescription(), dto.salaryRange(), skillsStr, dto.location());

                CachedJobListing existing = existingByUrl.get(dto.directApplyUrl());

                if (existing != null) {
                    existing.setLastSeenAt(now);
                    existing.setNewlyDiscovered(false);
                    boolean modified = false;

                    // Reactivare dacă fusese marcat ca EXPIRED
                    if ("EXPIRED".equalsIgnoreCase(existing.getStatus())) {
                        existing.setStatus("ACTIVE");
                        modified = true;
                        changesToInsert.add(JobChange.builder()
                                .jobId(existing.getId())
                                .oldHash(existing.getContentHash())
                                .newHash(newHash)
                                .changeType("REACTIVATED")
                                .details("Job reactivat: re-detectat activ pe " + dto.sourcePlatform())
                                .changedAt(now)
                                .build());
                    }

                    // Detectare modificări de conținut (Hash Change)
                    if (existing.getContentHash() != null && !existing.getContentHash().equals(newHash)) {
                        String oldHash = existing.getContentHash();

                        List<String> diffs = new ArrayList<>();
                        if (existing.getJobTitle() != null && !existing.getJobTitle().equalsIgnoreCase(dto.jobTitle())) {
                            diffs.add("Titlu: \"" + existing.getJobTitle() + "\" ➔ \"" + dto.jobTitle() + "\"");
                        }
                        if (existing.getSalaryRange() != null && !existing.getSalaryRange().equalsIgnoreCase(dto.salaryRange())) {
                            diffs.add("Salariu: \"" + existing.getSalaryRange() + "\" ➔ \"" + (dto.salaryRange() != null ? dto.salaryRange() : "Nespecificat") + "\"");
                        }
                        if (existing.getLocation() != null && !existing.getLocation().equalsIgnoreCase(dto.location())) {
                            diffs.add("Locație: \"" + existing.getLocation() + "\" ➔ \"" + dto.location() + "\"");
                        }
                        if (existing.getWorkModel() != null && !existing.getWorkModel().equalsIgnoreCase(dto.workModel())) {
                            diffs.add("Mod lucru: " + existing.getWorkModel() + " ➔ " + dto.workModel());
                        }
                        if (existing.getExperienceLevel() != null && !existing.getExperienceLevel().equalsIgnoreCase(dto.experienceLevel())) {
                            diffs.add("Nivel: " + existing.getExperienceLevel() + " ➔ " + dto.experienceLevel());
                        }
                        int oldLen = existing.getRawDescription() != null ? existing.getRawDescription().length() : 0;
                        int newLen = dto.rawDescription() != null ? dto.rawDescription().length() : 0;
                        if (Math.abs(newLen - oldLen) > 20) {
                            diffs.add("Descriere text: " + (newLen > oldLen ? "+" : "") + (newLen - oldLen) + " caractere");
                        }
                        String detailsMessage = diffs.isEmpty() ? "Conținut actualizat de la platformă" : String.join(" | ", diffs);

                        existing.setContentHash(newHash);
                        existing.setJobTitle(dto.jobTitle());
                        existing.setCompanyName(dto.companyName());
                        existing.setRawDescription(dto.rawDescription());
                        existing.setSalaryRange(dto.salaryRange());
                        existing.setLocation(dto.location());
                        existing.setWorkModel(dto.workModel());
                        existing.setExperienceLevel(dto.experienceLevel());
                        existing.setSkillsRequired(skillsStr);
                        existing.setUpdatedAt(now);
                        modified = true;

                        changesToInsert.add(JobChange.builder()
                                .jobId(existing.getId())
                                .oldHash(oldHash)
                                .newHash(newHash)
                                .changeType("CONTENT_UPDATED")
                                .details(detailsMessage)
                                .changedAt(now)
                                .build());
                    }

                    if (modified) {
                        toUpdate.add(existing);
                    }
                } else {
                    CachedJobListing newJob = CachedJobListing.fromDto(dto);
                    newJob.setContentHash(newHash);
                    newJob.setStatus("ACTIVE");
                    newJob.setFirstSeenAt(now);

                    boolean isRecentlyPosted = true;
                    if (dto.postedAt() != null) {
                        long daysOld = java.time.temporal.ChronoUnit.DAYS.between(dto.postedAt().toLocalDate(), LocalDate.now());
                        if (daysOld > 2) {
                            isRecentlyPosted = false;
                        }
                    } else if (dto.postedDaysAgo() > 2) {
                        isRecentlyPosted = false;
                    }
                    newJob.setNewlyDiscovered(isRecentlyPosted);
                    toInsert.add(newJob);
                    existingByUrl.put(dto.directApplyUrl(), newJob);

                    changesToInsert.add(JobChange.builder()
                            .jobId(newJob.getId())
                            .newHash(newHash)
                            .changeType("CREATED")
                            .details("Descoperit pentru prima dată pe " + dto.sourcePlatform())
                            .changedAt(now)
                            .build());
                }
            }

            if (!toInsert.isEmpty()) {
                int batchSize = 250;
                for (int i = 0; i < toInsert.size(); i += batchSize) {
                    int end = Math.min(i + batchSize, toInsert.size());
                    List<CachedJobListing> chunk = toInsert.subList(i, end);
                    try {
                        cachedJobListingRepository.saveAll(chunk);
                    } catch (Exception batchEx) {
                        for (CachedJobListing singleJob : chunk) {
                            try { cachedJobListingRepository.save(singleJob); } catch (Exception ignored) {}
                        }
                    }
                }
                log.info("[JOB INGESTION] Salvate {} joburi NOI în PostgreSQL.", toInsert.size());
            }

            if (!toUpdate.isEmpty()) {
                int batchSize = 250;
                for (int i = 0; i < toUpdate.size(); i += batchSize) {
                    int end = Math.min(i + batchSize, toUpdate.size());
                    try {
                        cachedJobListingRepository.saveAll(toUpdate.subList(i, end));
                    } catch (Exception ignored) {}
                }
                log.info("[JOB INGESTION] Actualizate {} joburi existente (reactivate / conținut modificat).", toUpdate.size());
            }

            if (!changesToInsert.isEmpty()) {
                int batchSize = 250;
                for (int i = 0; i < changesToInsert.size(); i += batchSize) {
                    int end = Math.min(i + batchSize, changesToInsert.size());
                    try {
                        jobChangeRepository.saveAll(changesToInsert.subList(i, end));
                    } catch (Exception ignored) {}
                }
                log.info("[JOB INGESTION] Înregistrate {} evenimente în job_changes.", changesToInsert.size());
            }

            markExpiredJobs();

        } catch (Exception e) {
            log.error("[JOB INGESTION] Eroare în pipeline-ul de ingestie: {}", e.getMessage(), e);
        }
    }

    @Transactional
    public int markExpiredJobs() {
        try {
            OffsetDateTime threshold = OffsetDateTime.now().minusDays(3);
            List<CachedJobListing> staleJobs = cachedJobListingRepository.findActiveJobsNotSeenSince(threshold);
            if (staleJobs.isEmpty()) return 0;

            OffsetDateTime now = OffsetDateTime.now();
            List<JobChange> changes = new ArrayList<>();
            for (CachedJobListing job : staleJobs) {
                job.setStatus("EXPIRED");
                job.setUpdatedAt(now);
                changes.add(JobChange.builder()
                        .jobId(job.getId())
                        .changeType("EXPIRED")
                        .details("Jobul nu a mai fost găsit pe platformă de peste 3 zile (ultima apariție: " + job.getLastSeenAt() + ")")
                        .changedAt(now)
                        .build());
            }
            cachedJobListingRepository.saveAll(staleJobs);
            jobChangeRepository.saveAll(changes);
            log.info("[JOB INGESTION] Marcate {} joburi ca EXPIRED (nevăzute în ultimele 3 zile).", staleJobs.size());
            return staleJobs.size();
        } catch (Exception e) {
            log.warn("[JOB INGESTION] Eroare la marcarea joburilor expirate: {}", e.getMessage());
            return 0;
        }
    }

    public List<JobChange> getJobChanges(String jobId) {
        return jobChangeRepository.findByJobIdOrderByChangedAtDesc(jobId);
    }
}
