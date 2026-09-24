package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.CoverLetterRequest;
import com.jobtracker.ats.dto.CoverLetterResponse;
import com.jobtracker.ats.entity.Application;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.JobPosting;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.repository.ApplicationRepository;
import com.jobtracker.ats.repository.CvProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CoverLetterServiceTest {

    @Mock
    private CvProfileRepository cvProfileRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private OpenAiLlmService openAiLlmService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private CoverLetterService coverLetterService;

    private UUID userId;
    private UUID cvProfileId;
    private UUID appId;
    private CvProfile testProfile;
    private Application testApp;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        cvProfileId = UUID.randomUUID();
        appId = UUID.randomUUID();

        User testUser = User.builder().id(userId).email("user@test.com").fullName("Mihai Sîrbu").build();

        testProfile = CvProfile.builder()
                .id(cvProfileId)
                .user(testUser)
                .fullName("Mihai Sîrbu")
                .email("mihai@example.com")
                .phone("+40 712 345 678")
                .location("București, România")
                .linkedin("https://linkedin.com/in/mihai")
                .summary("Inginer Software pasionat de Java, Spring Boot și arhitecturi scalabile.")
                .skillsLanguages("Java, Python, SQL, JavaScript")
                .skillsFrameworks("Spring Boot, React, Tailwind CSS")
                .skillsDatabases("PostgreSQL, Redis")
                .skillsDevops("Docker, Git, CI/CD")
                .isPrimary(true)
                .build();

        JobPosting jobPosting = JobPosting.builder()
                .companyName("Tech Innovators")
                .jobTitle("Junior Java Developer")
                .rawDescription("Căutăm un Junior Java Developer cu bune cunoștințe de Spring Boot, baze de date SQL și dorință de învățare.")
                .build();

        testApp = Application.builder()
                .id(appId)
                .user(testUser)
                .jobPosting(jobPosting)
                .build();
    }

    @Test
    @DisplayName("Generează cover letter deterministic (fără erori când AI nu este configurat)")
    void testDeterministicFallbackWhenAiNotConfigured() {
        when(openAiLlmService.isConfigured()).thenReturn(false);
        when(cvProfileRepository.findById(cvProfileId)).thenReturn(Optional.of(testProfile));

        CoverLetterRequest request = new CoverLetterRequest(
                cvProfileId,
                null,
                "Tech Innovators",
                "Junior Java Developer",
                "Căutăm un dezvoltator Java și Spring Boot pasionat.",
                "RO",
                "SIMPLE_DIRECT",
                null, null, null, null
        );

        CoverLetterResponse response = coverLetterService.generateCoverLetter(userId, request);

        assertNotNull(response);
        assertEquals("Mihai Sîrbu", response.candidateName());
        assertEquals("Tech Innovators", response.companyName());
        assertEquals("Junior Java Developer", response.jobTitle());
        assertNotNull(response.openingParagraph());
        assertNotNull(response.bodyParagraph1());
        assertNotNull(response.fullText());
        assertTrue(response.fullText().contains("Mihai Sîrbu"));
        assertTrue(response.fullText().contains("Tech Innovators"));
    }

    @Test
    @DisplayName("Rezolvă automat jobul din aplicația utilizatorului când se specifică applicationId")
    void testResolveJobFromApplicationId() {
        when(openAiLlmService.isConfigured()).thenReturn(false);
        when(cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(userId)).thenReturn(Optional.of(testProfile));
        when(applicationRepository.findById(appId)).thenReturn(Optional.of(testApp));

        CoverLetterRequest request = new CoverLetterRequest(
                null,
                appId,
                null,
                null,
                null,
                "RO",
                "SIMPLE_DIRECT",
                null, null, null, null
        );

        CoverLetterResponse response = coverLetterService.generateCoverLetter(userId, request);

        assertNotNull(response);
        assertEquals("Tech Innovators", response.companyName());
        assertEquals("Junior Java Developer", response.jobTitle());
        assertTrue(response.fullText().contains("Junior Java Developer"));
    }

    @Test
    @DisplayName("Generează cover letter cu AI când Groq LLM este activ și returnează JSON valid")
    void testAiGenerationSuccess() {
        when(openAiLlmService.isConfigured()).thenReturn(true);
        when(cvProfileRepository.findById(cvProfileId)).thenReturn(Optional.of(testProfile));

        String mockAiJson = """
            {
              "recipientTitle": "Echipa de Recrutare",
              "subjectLine": "Candidatură: Junior Java Developer – Mihai Sîrbu",
              "salutation": "Stimate Manager de Recrutare,",
              "openingParagraph": "Vă adresez această scrisoare cu entuziasm pentru rolul de Junior Java Developer.",
              "bodyParagraph1": "Experiența mea cu Java și Spring Boot se potrivește excelent cu cerințele dumneavoastră.",
              "bodyParagraph2": "Apreciez proiectele Tech Innovators și sunt motivat să aduc valoare.",
              "closingParagraph": "Aștept cu plăcere oportunitatea unui interviu.",
              "signOff": "Cu respect,",
              "matchedSkills": ["Java", "Spring Boot", "SQL"]
            }
            """;

        when(openAiLlmService.generateCompletion(anyString(), anyString(), anyInt(), anyDouble()))
                .thenReturn(mockAiJson);

        CoverLetterRequest request = new CoverLetterRequest(
                cvProfileId,
                null,
                "Tech Innovators",
                "Junior Java Developer",
                "Cerinte: Java, Spring Boot, SQL",
                "RO",
                "SIMPLE_DIRECT",
                null, null, null, null
        );

        CoverLetterResponse response = coverLetterService.generateCoverLetter(userId, request);

        assertNotNull(response);
        assertEquals("Mihai Sîrbu", response.candidateName());
        assertEquals("Stimate Manager de Recrutare,", response.salutation());
        assertTrue(response.openingParagraph().contains("Junior Java Developer"));
        assertEquals(3, response.matchedSkills().size());
        assertTrue(response.matchedSkills().contains("Spring Boot"));
    }
}
