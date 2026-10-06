package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.FeedbackSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedbackSubmissionRepository extends JpaRepository<FeedbackSubmission, UUID> {
    List<FeedbackSubmission> findAllByOrderByCreatedAtDesc();
}
