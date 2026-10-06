package com.jobtracker.ats.repository;

import com.jobtracker.ats.entity.CommunityIdeaVote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CommunityIdeaVoteRepository extends JpaRepository<CommunityIdeaVote, UUID> {
    Optional<CommunityIdeaVote> findByIdeaIdAndVoterToken(UUID ideaId, String voterToken);
    boolean existsByIdeaIdAndVoterToken(UUID ideaId, String voterToken);
    void deleteByIdeaIdAndVoterToken(UUID ideaId, String voterToken);
    List<CommunityIdeaVote> findAllByVoterToken(String voterToken);
}
