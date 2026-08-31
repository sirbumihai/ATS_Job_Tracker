package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByUserId(UUID userId);
    List<Resume> findByUserIdOrderByCreatedAtAsc(UUID userId);
    List<Resume> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query(value = """
        SELECT (1.0 - (r.text_embedding <=> j.description_embedding)) * 100.0
        FROM resumes r, job_postings j
        WHERE r.id = :resumeId AND j.id = :jobId
        """, nativeQuery = true)
    Double calculateCosineSimilarity(@Param("resumeId") UUID resumeId, @Param("jobId") UUID jobId);
}
