package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.CvProfileDto;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.exception.ResourceNotFoundException;
import com.jobtracker.ats.repository.CvProfileRepository;
import com.jobtracker.ats.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CvProfileService {

    private final CvProfileRepository cvProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public CvProfileDto getCvProfileByUserId(UUID userId) {
        Optional<CvProfile> profileOpt = cvProfileRepository.findByUserId(userId);
        return profileOpt.map(this::mapToDto).orElse(null);
    }

    @Transactional
    public CvProfileDto saveOrUpdateCvProfile(UUID userId, CvProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Utilizatorul nu a fost gasit."));

        CvProfile profile = cvProfileRepository.findByUserId(userId)
                .orElse(CvProfile.builder().user(user).build());

        profile.setFullName(dto.fullName());
        profile.setEmail(dto.email());
        profile.setPhone(dto.phone());
        profile.setLocation(dto.location());
        profile.setLinkedin(dto.linkedin());
        profile.setGithub(dto.github());
        profile.setSummary(dto.summary());
        profile.setSkillsLanguages(dto.skillsLanguages());
        profile.setSkillsFrameworks(dto.skillsFrameworks());
        profile.setSkillsDatabases(dto.skillsDatabases());
        profile.setSkillsDevops(dto.skillsDevops());
        profile.setWorkExperienceJson(dto.workExperienceJson());
        profile.setProjectsJson(dto.projectsJson());
        profile.setEducationJson(dto.educationJson());
        profile.setLanguagePreference(dto.languagePreference() != null ? dto.languagePreference() : "EN");

        CvProfile saved = cvProfileRepository.save(profile);
        return mapToDto(saved);
    }

    private CvProfileDto mapToDto(CvProfile entity) {
        return new CvProfileDto(
                entity.getId(),
                entity.getFullName(),
                entity.getEmail(),
                entity.getPhone(),
                entity.getLocation(),
                entity.getLinkedin(),
                entity.getGithub(),
                entity.getSummary(),
                entity.getSkillsLanguages(),
                entity.getSkillsFrameworks(),
                entity.getSkillsDatabases(),
                entity.getSkillsDevops(),
                entity.getWorkExperienceJson(),
                entity.getProjectsJson(),
                entity.getEducationJson(),
                entity.getLanguagePreference()
        );
    }
}
