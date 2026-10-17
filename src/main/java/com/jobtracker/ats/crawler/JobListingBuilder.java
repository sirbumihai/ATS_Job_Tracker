package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;

import java.time.OffsetDateTime;
import java.util.Collections;
import java.util.List;

import static com.jobtracker.ats.util.JobNormalizationUtils.*;

/**
 * Builder comun pentru joburile colectate de crawlere.
 * Câmpurile pe care sursa nu le publică rămân goale sau primesc valori neutre (UNKNOWN_*):
 * fără logo-uri de rezervă, fără număr inventat de candidați și fără scor ATS fix.
 * Scorul ATS real se calculează per CV la căutare, în JobAtsMatchEngine.
 */
public final class JobListingBuilder {

    private final String platform;
    private final String idPrefix;

    private String externalId;
    private String title;
    private String company = UNKNOWN_COMPANY;
    private String logoUrl;
    private String location = UNKNOWN_LOCATION;
    private String workModel;
    private String level;
    private String applyUrl;
    private String description;
    private String salary = UNKNOWN_SALARY;
    private List<String> skills = Collections.emptyList();
    private OffsetDateTime postedAt;
    private int postedDaysAgo = -1;
    private String competitiveness;
    private String competitivenessLabel;
    private String applicantCountText;

    private JobListingBuilder(String platform, String idPrefix) {
        this.platform = platform;
        this.idPrefix = idPrefix;
    }

    public static JobListingBuilder of(String platform, String idPrefix) {
        return new JobListingBuilder(platform, idPrefix);
    }

    public JobListingBuilder externalId(String externalId) { this.externalId = externalId; return this; }
    public JobListingBuilder title(String title) { this.title = title; return this; }
    public JobListingBuilder logoUrl(String logoUrl) { this.logoUrl = isBlank(logoUrl) ? null : logoUrl; return this; }
    public JobListingBuilder workModel(String workModel) { this.workModel = workModel; return this; }
    public JobListingBuilder level(String level) { this.level = level; return this; }
    public JobListingBuilder applyUrl(String applyUrl) { this.applyUrl = applyUrl; return this; }
    public JobListingBuilder description(String description) { this.description = description; return this; }
    public JobListingBuilder skills(List<String> skills) { this.skills = skills != null ? skills : Collections.emptyList(); return this; }
    public JobListingBuilder postedAt(OffsetDateTime postedAt) { this.postedAt = postedAt; return this; }
    public JobListingBuilder postedDaysAgo(int postedDaysAgo) { this.postedDaysAgo = postedDaysAgo; return this; }
    public JobListingBuilder applicantCountText(String applicantCountText) { this.applicantCountText = applicantCountText; return this; }

    public JobListingBuilder company(String company) {
        this.company = isBlank(company) ? UNKNOWN_COMPANY : company.trim();
        return this;
    }

    public JobListingBuilder location(String location) {
        this.location = isBlank(location) ? UNKNOWN_LOCATION : location.trim();
        return this;
    }

    public JobListingBuilder salary(String salary) {
        this.salary = isBlank(salary) ? UNKNOWN_SALARY : salary.trim();
        return this;
    }

    public JobListingBuilder competitiveness(String competitiveness, String label) {
        this.competitiveness = competitiveness;
        this.competitivenessLabel = label;
        return this;
    }

    public UnifiedJobListingDto build() {
        int daysAgo = postedAt != null ? daysSince(postedAt) : postedDaysAgo;
        OffsetDateTime effectivePostedAt = postedAt;
        if (effectivePostedAt == null && daysAgo >= 0) {
            effectivePostedAt = OffsetDateTime.now().minusDays(daysAgo);
        }

        String effectiveLevel = level != null ? level : determineExperienceLevel(title, description);
        String effectiveWorkModel = workModel != null ? workModel : detectWorkModel(title, location);
        String effectiveExternalId = !isBlank(externalId) ? externalId : stableId(applyUrl);
        String effectiveDescription = description != null ? description : "";

        String comp = competitiveness;
        String compLabel = competitivenessLabel;
        if (comp == null) {
            comp = estimateCompetitiveness(daysAgo);
            compLabel = competitivenessLabelFor(comp);
        }

        String contentHash = computeContentHash(title, company, effectiveDescription, salary, String.join(",", skills), location);
        OffsetDateTime now = OffsetDateTime.now();

        return new UnifiedJobListingDto(
                idPrefix + effectiveExternalId,
                title,
                company,
                logoUrl,
                location,
                effectiveWorkModel,
                effectiveLevel,
                platform,
                applyUrl,
                effectiveDescription,
                salary,
                skills,
                Collections.emptyList(),
                Collections.emptyList(),
                formatPostedAgo(daysAgo),
                0.0,
                comp,
                compLabel,
                applicantCountText,
                daysAgo,
                effectiveExternalId,
                contentHash,
                effectivePostedAt,
                now,
                now,
                "ACTIVE",
                false
        );
    }

    /**
     * Estimare a competiției după vechimea anunțului: un anunț proaspăt are de regulă mai puțini candidați.
     * Când data publicării nu e cunoscută, estimarea rămâne MEDIUM.
     */
    static String estimateCompetitiveness(int daysAgo) {
        if (daysAgo < 0) return "MEDIUM";
        if (daysAgo <= 3) return "LOW";
        if (daysAgo > 14) return "HIGH";
        return "MEDIUM";
    }

    static String competitivenessLabelFor(String competitiveness) {
        return switch (competitiveness) {
            case "LOW" -> "Șansă Mare";
            case "HIGH" -> "Competiție Ridicată";
            default -> "Competiție Medie";
        };
    }

    private static String detectWorkModel(String title, String location) {
        String combined = ((title != null ? title : "") + " " + (location != null ? location : "")).toLowerCase();
        if (combined.contains("remote") || combined.contains("la distan")) return "REMOTE";
        return "HYBRID";
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
