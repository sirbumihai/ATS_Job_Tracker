package com.jobtracker.ats.dto;

import java.util.List;

public record CoverLetterResponse(
        String candidateName,
        String candidateEmail,
        String candidatePhone,
        String candidateLocation,
        String candidateLinkedin,
        String companyName,
        String jobTitle,
        String letterDate,
        String recipientTitle,
        String subjectLine,
        String salutation,
        String openingParagraph,
        String bodyParagraph1,
        String bodyParagraph2,
        String closingParagraph,
        String signOff,
        String fullText,
        List<String> matchedSkills
) {}
