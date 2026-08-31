package com.jobtracker.ats.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "cv_profile")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title")
    private String title;

    @Column(name = "is_primary")
    private Boolean isPrimary;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "email")
    private String email;

    @Column(name = "phone")
    private String phone;

    @Column(name = "location")
    private String location;

    @Column(name = "linkedin")
    private String linkedin;

    @Column(name = "github")
    private String github;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "skills_languages", columnDefinition = "TEXT")
    private String skillsLanguages;

    @Column(name = "skills_frameworks", columnDefinition = "TEXT")
    private String skillsFrameworks;

    @Column(name = "skills_databases", columnDefinition = "TEXT")
    private String skillsDatabases;

    @Column(name = "skills_devops", columnDefinition = "TEXT")
    private String skillsDevops;

    @Column(name = "work_experience_json", columnDefinition = "TEXT")
    private String workExperienceJson;

    @Column(name = "projects_json", columnDefinition = "TEXT")
    private String projectsJson;

    @Column(name = "education_json", columnDefinition = "TEXT")
    private String educationJson;

    @Column(name = "language_preference")
    private String languagePreference;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
