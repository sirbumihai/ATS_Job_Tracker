package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.InterviewEvaluationRequest;
import com.jobtracker.ats.dto.InterviewEvaluationResponse;
import com.jobtracker.ats.service.AgentOrchestratorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/agents")
@RequiredArgsConstructor
public class AgentController {

    private final AgentOrchestratorService orchestratorService;

    @PostMapping("/recruiter/{jobId}")
    public ResponseEntity<Map<String, String>> runRecruiterAgent(@PathVariable UUID jobId) {
        String result = orchestratorService.runRecruiterAgent(jobId);
        return ResponseEntity.ok(Map.of("output", result));
    }

    @PostMapping("/tailor/{jobId}")
    public ResponseEntity<Map<String, String>> runTailorAgent(@PathVariable UUID jobId) {
        String result = orchestratorService.runTailorAgent(jobId);
        return ResponseEntity.ok(Map.of("output", result));
    }

    @PostMapping("/interview/generate/{jobId}")
    public ResponseEntity<Map<String, String>> generateInterviewQuestions(@PathVariable UUID jobId) {
        String result = orchestratorService.runInterviewQuestionAgent(jobId);
        return ResponseEntity.ok(Map.of("output", result));
    }

    @PostMapping("/interview/evaluate")
    public ResponseEntity<InterviewEvaluationResponse> evaluateUserAnswer(@RequestBody InterviewEvaluationRequest request) {
        InterviewEvaluationResponse response = orchestratorService.evaluateInterviewAnswer(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/outreach/{jobId}")
    public ResponseEntity<Map<String, String>> runOutreachAgent(@PathVariable UUID jobId) {
        String result = orchestratorService.runOutreachAgent(jobId);
        return ResponseEntity.ok(Map.of("output", result));
    }

    @GetMapping(value = "/stream/{jobId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamAgentWorkflow(@PathVariable UUID jobId) {
        return orchestratorService.streamAgentAnalysis(jobId);
    }
}
