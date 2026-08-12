package com.jobtracker.ats.service;

import com.jobtracker.ats.agent.InterviewSimulatorAgent;
import com.jobtracker.ats.agent.OutreachAgent;
import com.jobtracker.ats.agent.RecruiterAgent;
import com.jobtracker.ats.agent.ResumeTailorAgent;
import com.jobtracker.ats.dto.InterviewEvaluationRequest;
import com.jobtracker.ats.dto.InterviewEvaluationResponse;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.JobPostingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Optional;
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
    private final CvProfileRepository cvProfileRepository;

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
        String candidateName = getCandidateNameForJob(job);
        return outreachAgent.generateOutreachMessage(job.getCompanyName(), job.getJobTitle(), candidateName);
    }

    public SseEmitter streamAgentAnalysis(UUID jobId) {
        SseEmitter emitter = new SseEmitter(180_000L); // 3 minute timeout

        executor.execute(() -> {
            try {
                JobPosting job = getJob(jobId);

                sendSseEvent(emitter, "status", "[1/3] Recruiter Agent analizeaza cerintele jobului " + job.getJobTitle() + "...");
                String recruiterOutput = recruiterAgent.analyzeJobPosting(job.getCompanyName(), job.getJobTitle(), job.getRawDescription());
                sendSseEvent(emitter, "recruiter_output", recruiterOutput);

                sendSseEvent(emitter, "status", "[2/3] Resume Tailor Agent rescrie si optimizeaza CV-ul...");
                String tailorOutput = resumeTailorAgent.tailorResume(job.getCompanyName(), job.getJobTitle(), "", job.getRawDescription());
                sendSseEvent(emitter, "tailor_output", tailorOutput);

                sendSseEvent(emitter, "status", "[3/3] Technical Interview Agent genereaza intrebarile si RAG Memory...");
                String interviewOutput = interviewSimulatorAgent.generateInterviewQuestions(job.getCompanyName(), job.getJobTitle(), job.getRawDescription());
                sendSseEvent(emitter, "interview_output", interviewOutput);

                sendSseEvent(emitter, "complete", "Orchestrarea celor 3 agenti AI s-a incheiat cu succes!");
                emitter.complete();
            } catch (Exception e) {
                log.error("Eroare la executia fluxului SSE Multi-Agent", e);
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    private void sendSseEvent(SseEmitter emitter, String name, String data) throws IOException {
        emitter.send(SseEmitter.event().name(name).data(data));
    }

    private JobPosting getJob(UUID jobId) {
        return jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + jobId + " nu a fost gasit."));
    }

    private String getCandidateNameForJob(JobPosting job) {
        if (job.getUser() != null) {
            Optional<CvProfile> profile = cvProfileRepository.findByUserId(job.getUser().getId());
            if (profile.isPresent() && profile.get().getFullName() != null && !profile.get().getFullName().isBlank()) {
                return profile.get().getFullName();
            }
            if (job.getUser().getFullName() != null && !job.getUser().getFullName().isBlank()) {
                return job.getUser().getFullName();
            }
        }
        throw new ResourceNotFoundException("Numele candidatului nu a fost gasit. Va rugam sa completati profilul CV.");
    }
}
