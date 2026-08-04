package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.CvProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CvProfileRepository extends JpaRepository<CvProfile, UUID> {
    Optional<CvProfile> findByUserId(UUID userId);
}
