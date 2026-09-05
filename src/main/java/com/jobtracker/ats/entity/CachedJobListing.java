package com.jobtracker.ats.entity;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Entity
@Table(name = "cached_live_jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CachedJobListing {

    @Id
    @Column(name = "id", length = 255)
    private String id;

    @Column(name = "job_title", nullable = false, length = 500)
    private String jobTitle;

    @Column(name = "company_name", nullable = false, length = 500)
    private String companyName;

    @Column(name = "company_logo_url", columnDefinition = "TEXT")
    private String companyLogoUrl;

    @Column(name = "location", length = 500)
    private String location;

    @Column(name = "work_model", length = 100)
    private String workModel;

    @Column(name = "experience_level", length = 100)
    private String experienceLevel;

    @Column(name = "source_platform", nullable = false, length = 100)
    private String sourcePlatform;

    @Column(name = "direct_apply_url", nullable = false, columnDefinition = "TEXT", unique = true)
    private String directApplyUrl;

    @Column(name = "raw_description", columnDefinition = "TEXT")
    private String rawDescription;

    @Column(name = "salary_range", length = 255)
    private String salaryRange;

    @Column(name = "skills_required", columnDefinition = "TEXT")
    private String skillsRequired;

    @Column(name = "posted_date_ago", length = 255)
    private String postedDateAgo;

    @Column(name = "ats_match_score")
    private double atsMatchScore;

    @Column(name = "competitiveness", length = 100)
    private String competitiveness;

    @Column(name = "competitiveness_label", length = 255)
    private String competitivenessLabel;

    @Column(name = "applicant_count_text", length = 255)
    private String applicantCountText;

    @Column(name = "posted_days_ago")
    private int postedDaysAgo;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @Column(name = "posted_at")
    private OffsetDateTime postedAt;

    @Column(name = "first_seen_at")
    private OffsetDateTime firstSeenAt;

    @Column(name = "last_seen_at")
    private OffsetDateTime lastSeenAt;

    @Column(name = "status", length = 30)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    private static String safeSub(String val, int maxLen) {
        if (val == null) return null;
        return val.length() <= maxLen ? val : val.substring(0, maxLen);
    }

    public static CachedJobListing fromDto(UnifiedJobListingDto dto) {
        String skillsStr = dto.skillsRequired() != null && !dto.skillsRequired().isEmpty()
                ? String.join(",", dto.skillsRequired())
                : "";

        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime posted = dto.postedAt() != null 
                ? dto.postedAt() 
                : now.minusDays(Math.max(0, dto.postedDaysAgo()));

        return CachedJobListing.builder()
                .id(dto.id() != null ? safeSub(dto.id(), 250) : java.util.UUID.randomUUID().toString())
                .jobTitle(safeSub(dto.jobTitle() != null ? dto.jobTitle() : "Job Title", 490))
                .companyName(safeSub(dto.companyName() != null ? dto.companyName() : "Tech Company", 490))
                .companyLogoUrl(dto.companyLogoUrl())
                .location(safeSub(dto.location(), 490))
                .workModel(safeSub(dto.workModel(), 90))
                .experienceLevel(safeSub(dto.experienceLevel(), 90))
                .sourcePlatform(safeSub(dto.sourcePlatform() != null ? dto.sourcePlatform() : "OTHER", 90))
                .directApplyUrl(dto.directApplyUrl())
                .rawDescription(dto.rawDescription())
                .salaryRange(safeSub(dto.salaryRange(), 250))
                .skillsRequired(skillsStr)
                .postedDateAgo(safeSub(dto.postedDateAgo(), 250))
                .atsMatchScore(dto.atsMatchScore())
                .competitiveness(safeSub(dto.competitiveness(), 90))
                .competitivenessLabel(safeSub(dto.competitivenessLabel(), 250))
                .applicantCountText(safeSub(dto.applicantCountText(), 250))
                .postedDaysAgo(dto.postedDaysAgo())
                .externalId(safeSub(dto.externalId() != null ? dto.externalId() : dto.id(), 250))
                .contentHash(dto.contentHash())
                .postedAt(posted)
                .firstSeenAt(dto.firstSeenAt() != null ? dto.firstSeenAt() : now)
                .lastSeenAt(dto.lastSeenAt() != null ? dto.lastSeenAt() : now)
                .status(dto.status() != null ? safeSub(dto.status(), 25) : "ACTIVE")
                .build();
    }

    public UnifiedJobListingDto toDto() {
        List<String> skills = (this.skillsRequired != null && !this.skillsRequired.isBlank())
                ? Arrays.stream(this.skillsRequired.split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
                : Collections.emptyList();

        return new UnifiedJobListingDto(
                this.id,
                this.jobTitle,
                this.companyName,
                this.companyLogoUrl,
                this.location,
                this.workModel,
                this.experienceLevel,
                this.sourcePlatform,
                this.directApplyUrl,
                this.rawDescription,
                this.salaryRange,
                skills,
                Collections.emptyList(),
                Collections.emptyList(),
                this.postedDateAgo,
                this.atsMatchScore,
                this.competitiveness,
                this.competitivenessLabel,
                this.applicantCountText,
                this.postedDaysAgo,
                this.externalId != null ? this.externalId : this.id,
                this.contentHash,
                this.postedAt != null ? this.postedAt : (this.createdAt != null ? this.createdAt : OffsetDateTime.now()),
                this.firstSeenAt != null ? this.firstSeenAt : this.createdAt,
                this.lastSeenAt != null ? this.lastSeenAt : this.updatedAt,
                this.status != null ? this.status : "ACTIVE"
        );
    }
}
