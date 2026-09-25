package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.GithubReadmeRequest;
import com.jobtracker.ats.dto.GithubReadmeResponse;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.entity.User;
import com.jobtracker.ats.repository.CvProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GithubReadmeServiceTest {

    @Mock
    private CvProfileRepository cvProfileRepository;

    @Mock
    private OpenAiLlmService openAiLlmService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private GithubReadmeService githubReadmeService;

    private UUID userId;
    private UUID cvProfileId;
    private CvProfile testProfile;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        cvProfileId = UUID.randomUUID();

        User testUser = User.builder().id(userId).email("sarbumihai0@gmail.com").fullName("Mihai Sîrbu").build();

        testProfile = CvProfile.builder()
                .id(cvProfileId)
                .user(testUser)
                .fullName("Mihai Sîrbu")
                .email("sarbumihai0@gmail.com")
                .phone("+40 723 034 706")
                .location("Bucharest, Romania")
                .linkedin("https://linkedin.com/in/sarbumihai")
                .github("https://github.com/sarbumihai")
                .summary("Inginer backend specializat în Java 21, Spring Boot și sisteme distribuite.")
                .skillsLanguages("Java, Python, SQL, TypeScript")
                .skillsFrameworks("Spring Boot, React, Tailwind CSS")
                .skillsDatabases("PostgreSQL, Redis, pgvector")
                .skillsDevops("Docker, Git, GitHub Actions, Linux")
                .projectsJson("""
                    [
                      {
                        "title": "ATS Job Tracker",
                        "techStack": "Java 21, Spring Boot 3.3, PostgreSQL, Docker",
                        "bullets": [
                          "Pipeline concurent cu Virtual Threads procesand 8.5k joburi in sub-10 secunde.",
                          "Cautare semantica vectoriala cu sub-15ms latenta."
                        ]
                      }
                    ]
                    """)
                .isPrimary(true)
                .build();
    }

    @Test
    @DisplayName("Generează README deterministic cu ton non-AI autentic când AI nu este configurat")
    void testDeterministicReadmeGeneration() {
        when(openAiLlmService.isConfigured()).thenReturn(false);
        when(cvProfileRepository.findById(cvProfileId)).thenReturn(Optional.of(testProfile));

        GithubReadmeRequest request = new GithubReadmeRequest(
                cvProfileId,
                "sarbumihai",
                "Mihai Sîrbu",
                null,
                "Backend Engineer",
                "BACKEND_SYSTEMS",
                "PRAGMATIC_HUMAN",
                true,
                true,
                true,
                "github_dark",
                null,
                null,
                null,
                null,
                null
        );

        GithubReadmeResponse response = githubReadmeService.generateReadme(userId, request);

        assertNotNull(response);
        assertNotNull(response.fullMarkdown());
        assertTrue(response.fullMarkdown().contains("Hi, I'm Mihai Sîrbu"));
        assertTrue(response.fullMarkdown().contains("Java_21"));
        assertTrue(response.fullMarkdown().contains("Spring_Boot_3"));
        assertTrue(response.fullMarkdown().contains("ATS Job Tracker"));
        assertTrue(response.fullMarkdown().contains("github-readme-stats"));
        assertFalse(response.antiAiHighlights().isEmpty());
    }

    @Test
    @DisplayName("Generează README cu AI când LLM este configurat cu instrucțiuni stricte anti-buzzword")
    void testAiReadmeGeneration() {
        when(openAiLlmService.isConfigured()).thenReturn(true);
        when(cvProfileRepository.findById(cvProfileId)).thenReturn(Optional.of(testProfile));

        String mockAiJson = """
            {
              "headline": "Backend & Distributed Systems Engineer",
              "bioSection": "Focused on high-throughput microservices, sub-15ms semantic matching, and robust database architectures.",
              "techPhilosophy": "Clean architecture, predictable latency, and high test coverage over premature complexity.",
              "refinedProjects": [
                {
                  "title": "ATS Job Tracker Engine",
                  "techStack": "Java 21, Spring Boot 3.3, pgvector",
                  "bullets": [
                    "Engineered real-time scraping pipeline with Java 21 Virtual Threads.",
                    "Sub-15ms vector similarity matching with PostgreSQL pgvector."
                  ]
                }
              ],
              "statusLines": {
                "building": "ATS Job Tracker",
                "learning": "Database internals & distributed systems",
                "collaborating": "Backend architectures and latency tuning"
              },
              "antiAiTips": [
                "Zero buzzwords",
                "Grounded technical metrics"
              ]
            }
            """;

        when(openAiLlmService.generateCompletion(anyString(), anyString(), anyInt(), anyDouble()))
                .thenReturn(mockAiJson);

        GithubReadmeRequest request = new GithubReadmeRequest(
                cvProfileId,
                "sarbumihai",
                "Mihai Sîrbu",
                null,
                "Backend Engineer",
                "BACKEND_SYSTEMS",
                "PRAGMATIC_HUMAN",
                true,
                true,
                true,
                "github_dark",
                null,
                null,
                null,
                null,
                null
        );

        GithubReadmeResponse response = githubReadmeService.generateReadme(userId, request);

        assertNotNull(response);
        assertNotNull(response.fullMarkdown());
        assertTrue(response.fullMarkdown().contains("ATS Job Tracker Engine"));
        assertTrue(response.fullMarkdown().contains("Backend & Distributed Systems Engineer"));
        assertEquals(2, response.antiAiHighlights().size());
    }
}
