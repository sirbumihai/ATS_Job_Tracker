package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.CachedJobListing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CachedJobListingRepository extends JpaRepository<CachedJobListing, String> {

    @Query("SELECT j FROM CachedJobListing j ORDER BY j.postedDaysAgo ASC, j.createdAt DESC")
    List<CachedJobListing> findAllOrderedByRecency();

    @Query("SELECT j.directApplyUrl FROM CachedJobListing j")
    List<String> findAllDirectApplyUrls();

    boolean existsByDirectApplyUrl(String directApplyUrl);
}
