package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.CommunityIdea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommunityIdeaRepository extends JpaRepository<CommunityIdea, UUID> {
    List<CommunityIdea> findAllByOrderByVotesCountDescCreatedAtDesc();
}
