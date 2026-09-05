package com.jobtracker.ats.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "job_changes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobChange {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "job_id", nullable = false, length = 255)
    private String jobId;

    @CreationTimestamp
    @Column(name = "changed_at", updatable = false)
    private OffsetDateTime changedAt;

    @Column(name = "old_hash", length = 64)
    private String oldHash;

    @Column(name = "new_hash", length = 64)
    private String newHash;

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType; // "CREATED", "CONTENT_UPDATED", "EXPIRED", "REACTIVATED"

    @Column(name = "details", columnDefinition = "TEXT")
    private String details;
}
