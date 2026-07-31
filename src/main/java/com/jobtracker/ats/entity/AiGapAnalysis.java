package com.jobtracker.ats.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "ai_gap_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiGapAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private Application application;

    @Column(name = "action_plan_markdown", nullable = false, columnDefinition = "TEXT")
    private String actionPlanMarkdown;

    @CreationTimestamp
    @Column(name = "generated_at", updatable = false)
    private OffsetDateTime generatedAt;
}
