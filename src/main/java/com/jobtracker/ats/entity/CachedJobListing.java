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
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "job_title", nullable = false, length = 255)
    private String jobTitle;

    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;

    @Column(name = "company_logo_url", length = 1024)
    private String companyLogoUrl;

    @Column(name = "location", length = 255)
    private String location;

    @Column(name = "work_model", length = 50)
    private String workModel;

    @Column(name = "experience_level", length = 50)
    private String experienceLevel;

    @Column(name = "source_platform", nullable = false, length = 50)
    private String sourcePlatform;

    @Column(name = "direct_apply_url", nullable = false, columnDefinition = "TEXT", unique = true)
    private String directApplyUrl;

    @Column(name = "raw_description", columnDefinition = "TEXT")
    private String rawDescription;

    @Column(name = "salary_range", length = 150)
    private String salaryRange;

    @Column(name = "skills_required", columnDefinition = "TEXT")
    private String skillsRequired;

    @Column(name = "posted_date_ago", length = 100)
    private String postedDateAgo;

    @Column(name = "ats_match_score")
    private double atsMatchScore;

    @Column(name = "competitiveness", length = 50)
    private String competitiveness;

    @Column(name = "competitiveness_label", length = 150)
    private String competitivenessLabel;

    @Column(name = "applicant_count_text", length = 150)
    private String applicantCountText;

    @Column(name = "posted_days_ago")
    private int postedDaysAgo;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    public static CachedJobListing fromDto(UnifiedJobListingDto dto) {
        String skillsStr = dto.skillsRequired() != null && !dto.skillsRequired().isEmpty()
                ? String.join(",", dto.skillsRequired())
                : "";

        return CachedJobListing.builder()
                .id(dto.id())
                .jobTitle(dto.jobTitle())
                .companyName(dto.companyName())
                .companyLogoUrl(dto.companyLogoUrl())
                .location(dto.location())
                .workModel(dto.workModel())
                .experienceLevel(dto.experienceLevel())
                .sourcePlatform(dto.sourcePlatform())
                .directApplyUrl(dto.directApplyUrl())
                .rawDescription(dto.rawDescription())
                .salaryRange(dto.salaryRange())
                .skillsRequired(skillsStr)
                .postedDateAgo(dto.postedDateAgo())
                .atsMatchScore(dto.atsMatchScore())
                .competitiveness(dto.competitiveness())
                .competitivenessLabel(dto.competitivenessLabel())
                .applicantCountText(dto.applicantCountText())
                .postedDaysAgo(dto.postedDaysAgo())
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
                this.postedDaysAgo
        );
    }
}
