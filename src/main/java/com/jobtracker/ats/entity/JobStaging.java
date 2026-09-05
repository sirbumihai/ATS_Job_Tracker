package com.jobtracker.ats.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "jobs_staging")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobStaging {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id", length = 255)
    private String externalId;

    @Column(name = "source_platform", nullable = false, length = 100)
    private String sourcePlatform;

    @Column(name = "direct_apply_url", nullable = false, columnDefinition = "TEXT")
    private String directApplyUrl;

    @Column(name = "raw_payload", columnDefinition = "TEXT")
    private String rawPayload;

    @CreationTimestamp
    @Column(name = "crawled_at", updatable = false)
    private OffsetDateTime crawledAt;

    @Column(name = "processed")
    private Boolean processed;

    @Column(name = "processed_at")
    private OffsetDateTime processedAt;
}
