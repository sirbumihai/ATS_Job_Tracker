package com.jobtracker.ats.service;

import com.jobtracker.ats.agent.InterviewSimulatorAgent;
import com.jobtracker.ats.agent.OutreachAgent;
import com.jobtracker.ats.agent.RecruiterAgent;
import com.jobtracker.ats.agent.ResumeTailorAgent;
import com.jobtracker.ats.dto.InterviewEvaluationRequest;
import com.jobtracker.ats.dto.InterviewEvaluationResponse;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AgentOrchestratorService {

    private final RecruiterAgent recruiterAgent;
    private final ResumeTailorAgent resumeTailorAgent;
    private final InterviewSimulatorAgent interviewSimulatorAgent;
    private final OutreachAgent outreachAgent;
    private final JobPostingRepository jobPostingRepository;

    private final ExecutorService executor = Executors.newCachedThreadPool();

    public String runRecruiterAgent(UUID jobId) {
        JobPosting job = getJob(jobId);
        return recruiterAgent.analyzeJobPosting(job.getCompanyName(), job.getJobTitle(), job.getRawDescription());
    }

    public String runTailorAgent(UUID jobId) {
        JobPosting job = getJob(jobId);
        return resumeTailorAgent.tailorResume(job.getCompanyName(), job.getJobTitle(), "", job.getRawDescription());
    }

    public String runInterviewQuestionAgent(UUID jobId) {
        JobPosting job = getJob(jobId);
        return interviewSimulatorAgent.generateInterviewQuestions(job.getCompanyName(), job.getJobTitle(), job.getRawDescription());
    }

    public InterviewEvaluationResponse evaluateInterviewAnswer(InterviewEvaluationRequest request) {
        return interviewSimulatorAgent.evaluateUserAnswer(request);
    }

    public String runOutreachAgent(UUID jobId) {
        JobPosting job = getJob(jobId);
        return outreachAgent.generateOutreachMessage(job.getCompanyName(), job.getJobTitle(), "Sîrbu Mihai-Alexandru");
    }

    public SseEmitter streamAgentAnalysis(UUID jobId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minute timeout

        executor.execute(() -> {
            try {
                JobPosting job = getJob(jobId);
                
                emitter.send(SseEmitter.event().name("status").data("🤖 [SYSTEM] Pornim orchestrarea Sistemului Multi-Agent AI..."));
                Thread.sleep(800);

                emitter.send(SseEmitter.event().name("status").data("🔍 [RECRUITER AGENT] Extragere cerințe tehnice și profil senioritate..."));
                String recruiterAnalysis = recruiterAgent.analyzeJobPosting(job.getCompanyName(), job.getJobTitle(), job.getRawDescription());
                emitter.send(SseEmitter.event().name("recruiter_output").data(recruiterAnalysis));
                Thread.sleep(1000);

                emitter.send(SseEmitter.event().name("status").data("✍️ [RESUME TAILOR AGENT] Rescriere bullet point-uri CV pentru scor 100% ATS..."));
                String tailorOutput = resumeTailorAgent.tailorResume(job.getCompanyName(), job.getJobTitle(), "", job.getRawDescription());
                emitter.send(SseEmitter.event().name("tailor_output").data(tailorOutput));
                Thread.sleep(1000);

                emitter.send(SseEmitter.event().name("status").data("🎙️ [INTERVIEW AGENT] Generare 5 întrebări tehnice specifice pentru " + job.getCompanyName() + "..."));
                String interviewQuestions = interviewSimulatorAgent.generateInterviewQuestions(job.getCompanyName(), job.getJobTitle(), job.getRawDescription());
                emitter.send(SseEmitter.event().name("interview_output").data(interviewQuestions));
                Thread.sleep(1000);

                emitter.send(SseEmitter.event().name("status").data("✉️ [OUTREACH AGENT] Redactare mesaje personalizate de contactare Recruiter..."));
                String outreachOutput = outreachAgent.generateOutreachMessage(job.getCompanyName(), job.getJobTitle(), "Sîrbu Mihai-Alexandru");
                emitter.send(SseEmitter.event().name("outreach_output").data(outreachOutput));

                emitter.send(SseEmitter.event().name("complete").data("✅ [SYSTEM] Orchestrarea Multi-Agent AI a fost finalizată cu succes!"));
                emitter.complete();

            } catch (Exception e) {
                log.error("Eroare la streaming-ul SSE al agenților AI: {}", e.getMessage());
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private JobPosting getJob(UUID jobId) {
        return jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + jobId + " nu a fost găsit."));
    }
}
