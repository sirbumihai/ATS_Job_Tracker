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
    List<String> certifications
) {
    public static LinkedInProfileDto createEmpty() {
        return new LinkedInProfileDto(
            "", "", "București, România", "", "", "", "500+ conexiuni",
            "", List.of(), List.of(), List.of(), List.of(), List.of()
        );
    }
}
