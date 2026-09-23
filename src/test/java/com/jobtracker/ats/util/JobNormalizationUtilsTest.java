package com.jobtracker.ats.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class JobNormalizationUtilsTest {

    @Test
    @DisplayName("Filtrare strictă IT: recunoaște rolurile tehnice și respinge posturile non-IT")
    void testIsStrictlyItJob() {
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Junior Java Developer"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Cloud DevOps Engineer"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("QA Automation Tester"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Data Analyst"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Full Stack Software Engineer"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Software Solutions Architect"));

        // Suport Tehnic & Helpdesk
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Junior Technical Support"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Technical Support Specialist"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("IT Helpdesk Tier 1"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Suport Tehnic"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Application Support Analyst"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Desktop Support Technician"));

        // Business Analyst & Product
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Junior Business Analyst"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("IT Business Analyst"));
        assertTrue(JobNormalizationUtils.isStrictlyItJob("Functional Analyst"));

        // Posturi non-IT respinse
        assertFalse(JobNormalizationUtils.isStrictlyItJob("Casier Magazin Comercial"));
        assertFalse(JobNormalizationUtils.isStrictlyItJob("Șofer Curier Distribuție"));
        assertFalse(JobNormalizationUtils.isStrictlyItJob("Medic Stomatolog Specialist"));
        assertFalse(JobNormalizationUtils.isStrictlyItJob("Contabil Financiar"));
        assertFalse(JobNormalizationUtils.isStrictlyItJob("Operator Curățenie"));
    }

    @Test
    @DisplayName("Clasificare strictă nivel de experiență (Senior, Mid, Junior, Internship)")
    void testDetermineExperienceLevel() {
        assertEquals("SENIOR", JobNormalizationUtils.determineExperienceLevel("Senior Software Engineer", null));
        assertEquals("SENIOR", JobNormalizationUtils.determineExperienceLevel("Tech Lead Java", null));
        assertEquals("SENIOR", JobNormalizationUtils.determineExperienceLevel("Software Engineer", "Candidatul are minim 5 ani de experiență profesională"));

        // Roluri fără prefixul Junior sau cu 2-4 ani sunt clasificate strict ca MID
        assertEquals("MID", JobNormalizationUtils.determineExperienceLevel("Java Developer", null));
        assertEquals("MID", JobNormalizationUtils.determineExperienceLevel("Backend Engineer", "Cerem 3 ani experiență"));

        // Roluri explicit Junior / Entry
        assertEquals("JUNIOR", JobNormalizationUtils.determineExperienceLevel("Junior Java Developer", null));
        assertEquals("JUNIOR", JobNormalizationUtils.determineExperienceLevel("Entry-level Software Tester", null));

        // Stagii și internship
        assertEquals("INTERNSHIP", JobNormalizationUtils.determineExperienceLevel("Java Internship Summer 2026", null));
        assertEquals("INTERNSHIP", JobNormalizationUtils.determineExperienceLevel("Stagiu de practică IT", null));
    }

    @Test
    @DisplayName("Extindere sinonime tehnologice (k8s -> kubernetes, js -> javascript, etc.)")
    void testExpandTechSynonyms() {
        List<String> k8sSyns = JobNormalizationUtils.expandTechSynonyms("k8s");
        assertTrue(k8sSyns.contains("kubernetes"));
        assertTrue(k8sSyns.contains("devops"));

        List<String> jsSyns = JobNormalizationUtils.expandTechSynonyms("js");
        assertTrue(jsSyns.contains("javascript"));
        assertTrue(jsSyns.contains("react"));

        List<String> supportSyns = JobNormalizationUtils.expandTechSynonyms("support");
        assertTrue(supportSyns.contains("helpdesk"));
        assertTrue(supportSyns.contains("suport tehnic"));

        List<String> baSyns = JobNormalizationUtils.expandTechSynonyms("ba");
        assertTrue(baSyns.contains("business analyst"));
        assertTrue(baSyns.contains("product owner"));
    }

    @Test
    @DisplayName("Calcul hash SHA-256 pentru detecția modificărilor")
    void testComputeContentHash() {
        String hash1 = JobNormalizationUtils.computeContentHash("Java Dev", "Acme Corp", "Descriere detaliată", "8000 RON", "Java,Spring", "București");
        String hash2 = JobNormalizationUtils.computeContentHash("Java Dev", "Acme Corp", "Descriere detaliată", "8000 RON", "Java,Spring", "București");
        String hashModified = JobNormalizationUtils.computeContentHash("Java Dev", "Acme Corp", "Descriere actualizată", "9000 RON", "Java,Spring", "București");

        assertNotNull(hash1);
        assertEquals(64, hash1.length());
        assertEquals(hash1, hash2);
        assertNotEquals(hash1, hashModified);
    }
}
