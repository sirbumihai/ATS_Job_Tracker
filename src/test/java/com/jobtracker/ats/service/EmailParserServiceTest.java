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

    @Test
    @DisplayName("Fast prefilter: identifică corect emailurile candidate de recrutare și ignoră spamul/marketingul")
    void testIsCandidateRecruitmentEmail() {
        java.util.Set<String> knownCompanies = java.util.Set.of("Google", "Microsoft");

        // Pozitive
        assertTrue(emailParserService.isCandidateRecruitmentEmail(
                "jobs-noreply@linkedin.com", "Your application to Endava has been sent", java.util.Collections.emptySet()));
        assertTrue(emailParserService.isCandidateRecruitmentEmail(
                "no-reply@greenhouse.io", "Application received", java.util.Collections.emptySet()));
        assertTrue(emailParserService.isCandidateRecruitmentEmail(
                "talent@startup.io", "Invitation to technical interview", java.util.Collections.emptySet()));
        assertTrue(emailParserService.isCandidateRecruitmentEmail(
                "custom@domain.com", "Important update from Microsoft recruitment team", knownCompanies));

        // Negative (spam, newslettere, alerte)
        assertFalse(emailParserService.isCandidateRecruitmentEmail(
                "newsletter@dailytech.com", "Top 10 tech news this week", knownCompanies));
        assertFalse(emailParserService.isCandidateRecruitmentEmail(
                "updates@linkedin.com", "Alex and 5 others viewed your profile", knownCompanies));
        assertFalse(emailParserService.isCandidateRecruitmentEmail(
                "alerts@ejobs.ro", "Joburi recomandate pentru tine astăzi", knownCompanies));
        assertFalse(emailParserService.isCandidateRecruitmentEmail(
                "support@revolut.com", "Extras de cont și confirmare card", knownCompanies));
    }

    @Test
    @DisplayName("Protecție anti-false-offer: un refuz care conține 'nu putem oferi' este clasificat REJECTED, NU OFFER")
    void testRejectionWithOfferWordIsNotOffer() {
        String sender = "HR Team <hr@techcompany.com>";
        String subject = "Update privind candidatura ta la TechCompany";
        String body = "Bună ziua, vă mulțumim pentru interes. Din păcate, după analizarea candidaturilor, nu vă putem oferi poziția în acest moment.";

        EmailParserService.ParsedJobEmail result = emailParserService.parse(sender, subject, body);

        assertTrue(result.isRecruitmentEmail());
        assertEquals(ApplicationStatus.REJECTED, result.detectedStatus(), "Nu trebuie să clasifice drept ofertă o scrisoare de respingere!");
        assertNotEquals(ApplicationStatus.OFFER_RECEIVED, result.detectedStatus());
    }

    @Test
    @DisplayName("Protecție anti-false-positives: facturile, comenzile și alertele sunt eliminate complet")
    void testIgnoreCommercialAndFinancialEmails() {
        String sender1 = "comenzi@emag.ro";
        String subject1 = "Confirmare comandă și factură fiscală";
        String body1 = "Comanda ta a fost predată curierului Sameday.";

        EmailParserService.ParsedJobEmail res1 = emailParserService.parse(sender1, subject1, body1);
        assertFalse(res1.isRecruitmentEmail());

        String sender2 = "newsletter@altex.ro";
        String subject2 = "Oferta săptămânii: reducere 20% la laptopuri";
        String body2 = "Vezi cele mai tari reduceri!";

        EmailParserService.ParsedJobEmail res2 = emailParserService.parse(sender2, subject2, body2);
        assertFalse(res2.isRecruitmentEmail());
    }
}
