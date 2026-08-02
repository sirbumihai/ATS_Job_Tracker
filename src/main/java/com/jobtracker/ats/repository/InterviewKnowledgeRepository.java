package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.InterviewKnowledge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface InterviewKnowledgeRepository extends JpaRepository<InterviewKnowledge, UUID> {
    List<InterviewKnowledge> findByTopicContainingIgnoreCase(String topic);
}
