package com.jobtracker.ats.service;

import com.jobtracker.ats.repository.CvProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JobAtsMatchEngineTest {

    private JobAtsMatchEngine matchEngine;

    @BeforeEach
    void setUp() {
        CvProfileRepository cvProfileRepository = Mockito.mock(CvProfileRepository.class);
        ApplicationService applicationService = Mockito.mock(ApplicationService.class);
        matchEngine = new JobAtsMatchEngine(cvProfileRepository, applicationService);
    }

    @Test
    @DisplayName("Evaluare ATS Junior / Internship: permite scoruri mari (80-98%) dacă abilitățile se potrivesc")
    void testEvaluateAtsMatchJunior() {
        String cv = "java 21, spring boot 3.3, sql, docker, git, rest api";
        List<String> skills = List.of("Java", "Spring Boot", "Docker", "Git");

        JobAtsMatchEngine.AtsMatchResult result = matchEngine.evaluateAtsMatch("JUNIOR", skills, cv);

        assertNotNull(result);
        assertTrue(result.finalScore() >= 80.0, "Un profil de junior cu toate skill-urile ar trebui să obțină peste 80%");
        assertEquals(4, result.matchingSkills().size());
        assertTrue(result.missingSkills().isEmpty());
    }

    @Test
    @DisplayName("Evaluare ATS Mid-Level: plafon strict de maximum 48% pentru un profil de junior")
    void testEvaluateAtsMatchMidCapping() {
        String cv = "java 21, spring boot 3.3, sql, docker, git, rest api";
        List<String> skills = List.of("Java", "Spring Boot", "Docker", "Git");

        JobAtsMatchEngine.AtsMatchResult result = matchEngine.evaluateAtsMatch("MID", skills, cv);

        assertNotNull(result);
        assertTrue(result.finalScore() <= 48.0, "Un rol Mid trebuie să fie plafonat la max 48% din cauza cerinței de 2-4 ani experiență");
    }

    @Test
    @DisplayName("Evaluare ATS Senior: plafon strict de maximum 25% pentru un profil de junior")
    void testEvaluateAtsMatchSeniorCapping() {
        String cv = "java 21, spring boot 3.3, sql, docker, git, rest api";
        List<String> skills = List.of("Java", "Spring Boot", "Docker", "Git");

        JobAtsMatchEngine.AtsMatchResult result = matchEngine.evaluateAtsMatch("SENIOR", skills, cv);

        assertNotNull(result);
        assertTrue(result.finalScore() <= 25.0, "Un rol Senior trebuie să fie plafonat la max 25% din cauza deficitului critic de senioritate");
    }

    @Test
    @DisplayName("Identifică corect competențele lipsă (missing skills)")
    void testMissingSkillsIdentification() {
        String cv = "java 21, spring boot 3.3, sql";
        List<String> skills = List.of("Java", "Spring Boot", "Docker", "Kubernetes", "AWS");

        JobAtsMatchEngine.AtsMatchResult result = matchEngine.evaluateAtsMatch("JUNIOR", skills, cv);

        assertTrue(result.matchingSkills().contains("Java"));
        assertTrue(result.matchingSkills().contains("Spring Boot"));
        assertTrue(result.missingSkills().contains("Docker"));
        assertTrue(result.missingSkills().contains("Kubernetes"));
        assertTrue(result.missingSkills().contains("AWS"));
    }
}
