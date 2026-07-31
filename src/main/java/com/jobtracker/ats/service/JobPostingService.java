package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.CreateJobRequest;
import com.jobtracker.ats.dto.JobResponse;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.JobPostingRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JobPostingService {

    private final JobPostingRepository jobPostingRepository;
    private final UserRepository userRepository;

    @Transactional
    public JobResponse createJob(UUID userId, CreateJobRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul cu ID-ul " + userId + " nu a fost găsit."));

        JobPosting jobPosting = JobPosting.builder()
                .user(user)
                .companyName(request.companyName())
                .jobTitle(request.jobTitle())
                .jobUrl(request.jobUrl())
                .rawDescription(request.rawDescription())
                .build();

        JobPosting savedJob = jobPostingRepository.saveAndFlush(jobPosting);

        return mapToResponse(savedJob);
    }

    @Transactional(readOnly = true)
    public JobResponse getJobById(UUID jobId) {
        JobPosting job = jobPostingRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Jobul cu ID-ul " + jobId + " nu a fost găsit."));
        
        return mapToResponse(job);
    }

    private JobResponse mapToResponse(JobPosting job) {
        return new JobResponse(
                job.getId(),
                job.getCompanyName(),
                job.getJobTitle(),
                job.getJobUrl(),
                job.getRawDescription(),
                job.getCreatedAt()
        );
    }
}
