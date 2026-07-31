package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.AiGapAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiGapAnalysisRepository extends JpaRepository<AiGapAnalysis, UUID> {
    Optional<AiGapAnalysis> findByApplicationId(UUID applicationId);
}
