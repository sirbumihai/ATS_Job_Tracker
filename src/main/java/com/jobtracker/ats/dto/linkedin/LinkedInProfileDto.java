package com.jobtracker.ats.dto.linkedin;

import java.util.List;

public record LinkedInProfileDto(
    String fullName,
    String headline,
    String location,
    String email,
    String linkedinUrl,
    String phone,
    String connectionsCount,
    String about,
    List<LinkedInEducationDto> education,
    List<LinkedInExperienceDto> experience,
    List<String> skills,
    List<String> languages,
    List<String> certifications,
    List<LinkedInProjectDto> projects,
    List<LinkedInFeaturedDto> featured,
    String bannerTheme,
    boolean isOpenToWork,
    boolean isCreatorMode,
    List<String> creatorTopics
) {
    public LinkedInProfileDto(
        String fullName,
        String headline,
        String location,
        String email,
        String linkedinUrl,
        String phone,
        String connectionsCount,
        String about,
        List<LinkedInEducationDto> education,
        List<LinkedInExperienceDto> experience,
        List<String> skills,
        List<String> languages,
        List<String> certifications,
        List<LinkedInProjectDto> projects,
        List<LinkedInFeaturedDto> featured
    ) {
        this(fullName, headline, location, email, linkedinUrl, phone, connectionsCount, about,
             education, experience, skills, languages, certifications, projects, featured,
             "tech_terminal", true, true,
             List.of("#java", "#springboot", "#backend", "#algorithms", "#softwareengineering"));
    }

    public LinkedInProfileDto(
        String fullName,
        String headline,
        String location,
        String email,
        String linkedinUrl,
        String phone,
        String connectionsCount,
        String about,
        List<LinkedInEducationDto> education,
        List<LinkedInExperienceDto> experience,
        List<String> skills,
        List<String> languages,
        List<String> certifications
    ) {
        this(fullName, headline, location, email, linkedinUrl, phone, connectionsCount, about,
             education, experience, skills, languages, certifications, List.of(), List.of());
    }

    public static LinkedInProfileDto createEmpty() {
        return new LinkedInProfileDto(
            "", "", "București, România", "", "", "", "500+ conexiuni",
            "", List.of(), List.of(), List.of(), List.of(), List.of(), List.of(), List.of()
        );
    }
}
