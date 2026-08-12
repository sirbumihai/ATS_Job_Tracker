package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.CvProfileDto;
import com.jobtracker.ats.dto.ResumeResponse;
import com.jobtracker.ats.entity.Resume;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.ResumeRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ResumeService {

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final TextExtractionService textExtractionService;
    private final CvProfileService cvProfileService;

    @Transactional
    public ResumeResponse uploadResume(UUID userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul cu ID-ul " + userId + " nu a fost gasit."));

        String extractedText = textExtractionService.extractText(file);

        Resume resume = Resume.builder()
                .user(user)
                .fileName(file.getOriginalFilename() != null ? file.getOriginalFilename() : "cv_upload.pdf")
                .filePath("uploads/" + file.getOriginalFilename())
                .rawText(extractedText)
                .build();

        Resume savedResume = resumeRepository.saveAndFlush(resume);

        // PARSE RAW TEXT INTO STRUCTURED CV PROFILE AND SAVE TO POSTGRESQL DB
        CvProfileDto parsedProfile = cvProfileService.parseAndSaveResumeText(userId, extractedText);

        return mapToResponse(savedResume, parsedProfile);
    }

    @Transactional(readOnly = true)
    public ResumeResponse getResumeById(UUID id) {
        Resume resume = resumeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("CV-ul cu ID-ul " + id + " nu a fost gasit."));
        CvProfileDto profile = cvProfileService.getCvProfileByUserId(resume.getUser().getId());
        return mapToResponse(resume, profile);
    }

    private ResumeResponse mapToResponse(Resume resume, CvProfileDto parsedProfile) {
        String snippet = resume.getRawText() != null && resume.getRawText().length() > 200 
                ? resume.getRawText().substring(0, 200) + "..." 
                : (resume.getRawText() != null ? resume.getRawText() : "");

        return new ResumeResponse(
                resume.getId(),
                resume.getFileName(),
                snippet,
                resume.getRawText() != null ? resume.getRawText() : "",
                parsedProfile,
                resume.getCreatedAt()
        );
    }
}
