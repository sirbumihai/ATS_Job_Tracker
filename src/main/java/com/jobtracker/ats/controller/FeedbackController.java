package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.feedback.*;
import com.jobtracker.ats.entity.FeedbackSubmission;
import com.jobtracker.ats.service.FeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ResponseEntity<Map<String, Object>> submitFeedback(@RequestBody FeedbackRequest request) {
        FeedbackSubmission submission = feedbackService.submitFeedback(request);
        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Feedback inregistrat cu succes si expediat catre sarbumihai0@gmail.com",
                "id", submission.getId()
        ));
    }

    @GetMapping("/ideas")
    public ResponseEntity<List<CommunityIdeaDto>> getCommunityIdeas(
            @RequestParam(required = false) String voterToken
    ) {
        return ResponseEntity.ok(feedbackService.getCommunityIdeas(voterToken));
    }

    @PostMapping("/ideas")
    public ResponseEntity<CommunityIdeaDto> createCommunityIdea(@RequestBody NewIdeaRequest request) {
        return ResponseEntity.ok(feedbackService.createCommunityIdea(request));
    }

    @PostMapping("/ideas/{id}/vote")
    public ResponseEntity<VoteResponse> toggleVote(
            @PathVariable UUID id,
            @RequestBody VoteRequest request
    ) {
        return ResponseEntity.ok(feedbackService.toggleVote(id, request.getVoterToken()));
    }
}
