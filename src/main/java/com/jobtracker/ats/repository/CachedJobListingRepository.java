package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.CachedJobListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CachedJobListingRepository extends JpaRepository<CachedJobListing, String> {

    @Query("SELECT j FROM CachedJobListing j ORDER BY j.postedAt DESC NULLS LAST, j.postedDaysAgo ASC, j.createdAt DESC")
    List<CachedJobListing> findAllOrderedByRecency();

    @Query("SELECT j FROM CachedJobListing j WHERE j.status = 'ACTIVE' ORDER BY j.postedAt DESC NULLS LAST, j.createdAt DESC")
    List<CachedJobListing> findAllActiveOrderedByPostedAt();

    @Query("SELECT j.directApplyUrl FROM CachedJobListing j")
    List<String> findAllDirectApplyUrls();

    Optional<CachedJobListing> findByDirectApplyUrl(String directApplyUrl);

    boolean existsByDirectApplyUrl(String directApplyUrl);

    @Query("SELECT j FROM CachedJobListing j WHERE j.status = 'ACTIVE' AND j.lastSeenAt < :threshold")
    List<CachedJobListing> findActiveJobsNotSeenSince(@Param("threshold") OffsetDateTime threshold);

    long countByStatus(String status);
}
