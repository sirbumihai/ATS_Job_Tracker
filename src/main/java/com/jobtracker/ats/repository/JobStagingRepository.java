package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.JobStaging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobStagingRepository extends JpaRepository<JobStaging, Long> {
    List<JobStaging> findTop500ByProcessedFalseOrderByCrawledAtAsc();

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @org.springframework.data.jpa.repository.Query("DELETE FROM JobStaging j WHERE UPPER(j.sourcePlatform) IN :platforms")
    int deleteBySourcePlatformIn(@org.springframework.data.repository.query.Param("platforms") java.util.Collection<String> platforms);
}
