package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByUserId(UUID userId);
    List<Application> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<Application> findByUserIdAndJobPostingId(UUID userId, UUID jobId);
}
