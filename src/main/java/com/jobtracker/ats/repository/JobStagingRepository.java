package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.JobStaging;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobStagingRepository extends JpaRepository<JobStaging, Long> {
    List<JobStaging> findTop500ByProcessedFalseOrderByCrawledAtAsc();
}
