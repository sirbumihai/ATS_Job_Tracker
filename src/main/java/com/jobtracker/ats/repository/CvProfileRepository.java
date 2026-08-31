package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.CvProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvProfileRepository extends JpaRepository<CvProfile, UUID> {
    List<CvProfile> findByUserIdOrderByUpdatedAtDesc(UUID userId);
    Optional<CvProfile> findFirstByUserIdAndIsPrimaryTrue(UUID userId);
    Optional<CvProfile> findFirstByUserIdOrderByUpdatedAtDesc(UUID userId);
    Optional<CvProfile> findByIdAndUserId(UUID id, UUID userId);
}
