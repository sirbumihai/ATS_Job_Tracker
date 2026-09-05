package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.JobChange;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobChangeRepository extends JpaRepository<JobChange, Long> {
    List<JobChange> findByJobIdOrderByChangedAtDesc(String jobId);
    List<JobChange> findTop50ByOrderByChangedAtDesc();
}
