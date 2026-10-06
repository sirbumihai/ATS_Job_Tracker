package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.feedback.*;
import com.jobtracker.ats.entity.CommunityIdea;
import com.jobtracker.ats.entity.CommunityIdeaVote;
import com.jobtracker.ats.entity.FeedbackSubmission;
import com.jobtracker.ats.repository.CommunityIdeaRepository;
import com.jobtracker.ats.repository.CommunityIdeaVoteRepository;
import com.jobtracker.ats.repository.FeedbackSubmissionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FeedbackService {

    private final FeedbackSubmissionRepository feedbackSubmissionRepository;
    private final CommunityIdeaRepository communityIdeaRepository;
    private final CommunityIdeaVoteRepository communityIdeaVoteRepository;
    private final EmailNotificationService emailNotificationService;

    @Transactional
    public FeedbackSubmission submitFeedback(FeedbackRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Titlul feedback-ului este obligatoriu.");
        }
        if (request.getMessage() == null || request.getMessage().trim().isEmpty()) {
            throw new IllegalArgumentException("Mesajul feedback-ului este obligatoriu.");
        }

        FeedbackSubmission submission = FeedbackSubmission.builder()
                .authorName(request.getName() != null && !request.getName().trim().isEmpty() ? request.getName().trim() : "Anonim")
                .authorEmail(request.getEmail() != null && !request.getEmail().trim().isEmpty() ? request.getEmail().trim() : null)
                .category(request.getCategory() != null ? request.getCategory() : "other")
                .rating(request.getRating() != null ? request.getRating() : 5)
                .title(request.getTitle().trim())
                .message(request.getMessage().trim())
                .shareInCommunity(Boolean.TRUE.equals(request.getShareInCommunity()))
                .build();

        FeedbackSubmission saved = feedbackSubmissionRepository.save(submission);

        // Daca utilizatorul a bifat partajarea in comunitate, cream automat o propunere pe roadmap
        if (Boolean.TRUE.equals(request.getShareInCommunity())) {
            try {
                CommunityIdea idea = CommunityIdea.builder()
                        .title(saved.getTitle())
                        .description(saved.getMessage())
                        .category(resolveCategoryLabel(saved.getCategory()))
                        .authorName(saved.getAuthorName())
                        .authorEmail(saved.getAuthorEmail())
                        .votesCount(1)
                        .status("IN_ANALIZA")
                        .build();
                communityIdeaRepository.save(idea);
            } catch (Exception e) {
                log.warn("[FEEDBACK SERVICE] Nu s-a putut insera ideea in comunitate: {}", e.getMessage());
            }
        }

        // Trimitere notificare pe email catre sarbumihai0@gmail.com
        try {
            emailNotificationService.sendFeedbackNotification(saved);
        } catch (Exception e) {
            log.warn("[FEEDBACK SERVICE] Trimiterea notificarii pe email a intampinat o eroare: {}", e.getMessage());
        }

        return saved;
    }

    @Transactional(readOnly = true)
    public List<CommunityIdeaDto> getCommunityIdeas(String voterToken) {
        List<CommunityIdea> ideas = communityIdeaRepository.findAllByOrderByVotesCountDescCreatedAtDesc();

        Set<UUID> votedIdeaIds = new HashSet<>();
        if (voterToken != null && !voterToken.trim().isEmpty()) {
            votedIdeaIds = communityIdeaVoteRepository.findAllByVoterToken(voterToken.trim())
                    .stream()
                    .map(CommunityIdeaVote::getIdeaId)
                    .collect(Collectors.toSet());
        }

        Set<UUID> finalVotedIdeaIds = votedIdeaIds;
        return ideas.stream().map(idea -> CommunityIdeaDto.builder()
                .id(idea.getId())
                .title(idea.getTitle())
                .description(idea.getDescription())
                .category(idea.getCategory())
                .authorName(idea.getAuthorName())
                .votesCount(idea.getVotesCount())
                .status(idea.getStatus())
                .hasVoted(finalVotedIdeaIds.contains(idea.getId()))
                .createdAt(idea.getCreatedAt())
                .build()
        ).collect(Collectors.toList());
    }

    @Transactional
    public VoteResponse toggleVote(UUID ideaId, String voterToken) {
        if (voterToken == null || voterToken.trim().isEmpty()) {
            throw new IllegalArgumentException("Token-ul votantului este obligatoriu.");
        }

        CommunityIdea idea = communityIdeaRepository.findById(ideaId)
                .orElseThrow(() -> new IllegalArgumentException("Ideea solicitata nu exista."));

        Optional<CommunityIdeaVote> existingVote = communityIdeaVoteRepository.findByIdeaIdAndVoterToken(ideaId, voterToken.trim());

        boolean hasVoted;
        if (existingVote.isPresent()) {
            // Retrage votul
            communityIdeaVoteRepository.deleteByIdeaIdAndVoterToken(ideaId, voterToken.trim());
            idea.setVotesCount(Math.max(0, idea.getVotesCount() - 1));
            hasVoted = false;
        } else {
            // Adauga votul
            CommunityIdeaVote vote = CommunityIdeaVote.builder()
                    .ideaId(ideaId)
                    .voterToken(voterToken.trim())
                    .build();
            communityIdeaVoteRepository.save(vote);
            idea.setVotesCount(idea.getVotesCount() + 1);
            hasVoted = true;
        }

        communityIdeaRepository.save(idea);

        return VoteResponse.builder()
                .ideaId(idea.getId())
                .hasVoted(hasVoted)
                .votesCount(idea.getVotesCount())
                .build();
    }

    @Transactional
    public CommunityIdeaDto createCommunityIdea(NewIdeaRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Titlul ideii este obligatoriu.");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Descrierea ideii este obligatorie.");
        }

        CommunityIdea idea = CommunityIdea.builder()
                .title(request.getTitle().trim())
                .description(request.getDescription().trim())
                .category(request.getCategory() != null && !request.getCategory().trim().isEmpty() ? request.getCategory() : "Functie Noua")
                .authorName(request.getAuthorName() != null && !request.getAuthorName().trim().isEmpty() ? request.getAuthorName().trim() : "Comunitate")
                .authorEmail(request.getAuthorEmail() != null && !request.getAuthorEmail().trim().isEmpty() ? request.getAuthorEmail().trim() : null)
                .votesCount(1)
                .status("IN_ANALIZA")
                .build();

        CommunityIdea saved = communityIdeaRepository.save(idea);

        // Notifica autorul pe email
        try {
            emailNotificationService.sendNewIdeaNotification(saved);
        } catch (Exception e) {
            log.warn("[FEEDBACK SERVICE] Eroare notificare email pentru idee noua: {}", e.getMessage());
        }

        return CommunityIdeaDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .category(saved.getCategory())
                .authorName(saved.getAuthorName())
                .votesCount(saved.getVotesCount())
                .status(saved.getStatus())
                .hasVoted(true)
                .createdAt(saved.getCreatedAt())
                .build();
    }

    private String resolveCategoryLabel(String categoryKey) {
        if (categoryKey == null) return "Altele";
        return switch (categoryKey) {
            case "feature" -> "Functie Noua";
            case "interview" -> "Pregatire Interviu";
            case "ats_cv" -> "ATS & Optimizare CV";
            case "bug" -> "Raportare Problema";
            default -> "Altele";
        };
    }
}
