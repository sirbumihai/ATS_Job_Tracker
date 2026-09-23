package com.jobtracker.ats.service;

import com.jobtracker.ats.entity.Application.ApplicationStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class EmailParserServiceTest {

    private EmailParserService emailParserService;

    @BeforeEach
    void setUp() {
        emailParserService = new EmailParserService();
    }

    @Test
    @DisplayName("Detectează confirmare aplicare de pe Greenhouse / LinkedIn")
    void testParseApplicationConfirmation() {
        String sender = "UiPath Careers <careers@uipath.com>";
        String subject = "Thank you for applying to UiPath - Junior Business Analyst";
        String body = "Hi Alex, thank you for applying for the Junior Business Analyst position at UiPath. We have received your application.";

        EmailParserService.ParsedJobEmail result = emailParserService.parse(sender, subject, body);

        assertTrue(result.isRecruitmentEmail());
        assertEquals(ApplicationStatus.APPLIED, result.detectedStatus());
        assertTrue(result.companyName().equalsIgnoreCase("UiPath"));
    }

    @Test
    @DisplayName("Detectează invitație la interviu de la companie IT")
    void testParseInterviewInvitation() {
        String sender = "Endava Recruitment <recruitment@endava.com>";
        String subject = "Invitation to interview: Technical Discussion - Endava";
        String body = "Dear candidate, we would like to invite you to an interview for the Software Engineer role next Tuesday.";

        EmailParserService.ParsedJobEmail result = emailParserService.parse(sender, subject, body);

        assertTrue(result.isRecruitmentEmail());
        assertEquals(ApplicationStatus.INTERVIEWING, result.detectedStatus());
        assertTrue(result.companyName().equalsIgnoreCase("Endava"));
    }

    @Test
    @DisplayName("Detectează email de respingere (Unfortunately)")
    void testParseRejectionEmail() {
        String sender = "Google Careers <no-reply@google.com>";
        String subject = "Update regarding your application to Google";
        String body = "Thank you for your interest. Unfortunately, after careful consideration, we have decided to move forward with other candidates.";

        EmailParserService.ParsedJobEmail result = emailParserService.parse(sender, subject, body);

        assertTrue(result.isRecruitmentEmail());
        assertEquals(ApplicationStatus.REJECTED, result.detectedStatus());
    }

    @Test
    @DisplayName("Detectează ofertă oficială de angajare (Job Offer)")
    void testParseJobOffer() {
        String sender = "Microsoft HR <hr@microsoft.com>";
        String subject = "Congratulations! Formal Job Offer - Microsoft";
        String body = "We are pleased to offer you the position of Junior Business Analyst at Microsoft.";

        EmailParserService.ParsedJobEmail result = emailParserService.parse(sender, subject, body);

        assertTrue(result.isRecruitmentEmail());
        assertEquals(ApplicationStatus.OFFER_RECEIVED, result.detectedStatus());
    }

    @Test
    @DisplayName("Ignoră emailuri non-recrutare (marketing, spam)")
    void testIgnoreNonRecruitmentEmail() {
        String sender = "Newsletter <news@dailytech.com>";
        String subject = "Top 10 tech news this week";
        String body = "Check out the latest AI advancements and framework releases!";

        EmailParserService.ParsedJobEmail result = emailParserService.parse(sender, subject, body);

        assertFalse(result.isRecruitmentEmail());
    }
}
