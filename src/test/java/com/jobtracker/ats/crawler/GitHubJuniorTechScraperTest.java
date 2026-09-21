package com.jobtracker.ats.crawler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

class GitHubJuniorTechScraperTest {

    private GitHubJuniorTechScraper scraper;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        scraper = new GitHubJuniorTechScraper(objectMapper);
    }

    @Test
    @DisplayName("getPlatformName returnează GITHUB_COMMUNITY")
    void testPlatformName() {
        assertEquals("GITHUB_COMMUNITY", scraper.getPlatformName());
    }

    @Test
    @DisplayName("isEuropeanOrRemoteLocation filtrează corect locațiile europene și remote, excluzând țările fără acces direct")
    void testIsEuropeanOrRemoteLocation() {
        // Pozitive (Europa & Remote)
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("London, United Kingdom"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Berlin, Germany"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Amsterdam, The Netherlands +1"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("București, Romania"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Zurich, Switzerland"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Dublin, Ireland"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Paris, France"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Remote / Worldwide"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("EMEA - Remote"));
        assertTrue(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Warsaw, Poland"));

        // Negative (Locații fără drept de muncă / vize automate pentru juniori)
        assertFalse(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Bangkok, Thailand"));
        assertFalse(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Singapore"));
        assertFalse(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Sydney, Australia"));
        assertFalse(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Jakarta, Indonesia"));
        assertFalse(GitHubJuniorTechScraper.isEuropeanOrRemoteLocation("Tokyo, Japan"));
    }

    @Test
    @DisplayName("parseEuropeanTechJson extrage joburi unificate și respectă tipul de angajare")
    void testParseEuropeanTechJson() {
        String json = """
                [
                    {
                        "linkedin_job_id": "4468428616",
                        "company": "targetjobs UK",
                        "title": "Graduate Software Engineer",
                        "location": "Glasgow, Scotland, United Kingdom",
                        "link": "https://www.linkedin.com/jobs/view/4468428616",
                        "category": "software-engineering",
                        "industries": "Technology, Information and Internet",
                        "employment_type": "new-grad",
                        "start_date": "January 2027"
                    },
                    {
                        "linkedin_job_id": "4468001466",
                        "company": "Bending Spoons",
                        "title": "Software Engineering Intern",
                        "location": "Milan, Italy",
                        "link": "https://www.linkedin.com/jobs/view/4468001466",
                        "category": "software-engineering",
                        "industries": "Software Development",
                        "employment_type": "internship",
                        "start_date": null
                    },
                    {
                        "linkedin_job_id": "9999999",
                        "company": "Some Hotel",
                        "title": "Receptionist & Cleaner",
                        "location": "Madrid, Spain",
                        "link": "https://hotel.com/job/1",
                        "category": "hospitality",
                        "industries": "Hospitality",
                        "employment_type": "new-grad",
                        "start_date": null
                    }
                ]
                """;

        List<UnifiedJobListingDto> freshList = new ArrayList<>();
        Set<String> seenDedupKeys = new HashSet<>();

        scraper.parseEuropeanTechJson(json, freshList, seenDedupKeys, Collections.emptySet());

        // Doar primele 2 sunt IT ("Receptionist & Cleaner" este eliminat de isStrictlyItJob)
        assertEquals(2, freshList.size());

        UnifiedJobListingDto job1 = freshList.get(0);
        assertEquals("Graduate Software Engineer", job1.jobTitle());
        assertEquals("targetjobs UK", job1.companyName());
        assertEquals("GITHUB_COMMUNITY", job1.sourcePlatform());
        assertEquals("JUNIOR", job1.experienceLevel());
        assertEquals("Glasgow, Scotland, United Kingdom", job1.location());
        assertEquals("https://www.linkedin.com/jobs/view/4468428616", job1.directApplyUrl());

        UnifiedJobListingDto job2 = freshList.get(1);
        assertEquals("Software Engineering Intern", job2.jobTitle());
        assertEquals("Bending Spoons", job2.companyName());
        assertEquals("INTERNSHIP", job2.experienceLevel());
    }

    @Test
    @DisplayName("parseMarkdownTable extrage corect coloanele Markdown și include exclusiv Europa și Remote")
    void testParseMarkdownTable() {
        String markdown = """
                ### Early Careers Positions
                
                | Company | Position | Location | Posting | Age |
                |---|---|---|---|---|
                | <a href="https://optiver.com"><strong>Optiver</strong></a> | Graduate Software Engineer - 2027 Start | Amsterdam, The Netherlands +1 | <a href="https://www.optiver.com/jobs/8585609002"><img src="https://i.imgur.com/JpkfjIq.png" alt="Apply"/></a> | 14d |
                | <a href="https://www.janestreet.com"><strong>Jane Street</strong></a> | Quantitative Software Engineer: New Grad | London, United Kingdom | <a href="https://www.janestreet.com/position/8600948002"><img src="https://i.imgur.com/JpkfjIq.png" alt="Apply"/></a> | 2w |
                | <a href="https://www.tiktok.com"><strong>TikTok</strong></a> | Machine Learning Engineer Graduate | Bangkok, Thailand | <a href="https://lifeattiktok.com/search/123"><img src="https://i.imgur.com/JpkfjIq.png" alt="Apply"/></a> | 5d |
                | <a href="https://remote-tech.com"><strong>GitLab</strong></a> | Junior Full Stack Developer | Remote - Worldwide | [Apply](https://gitlab.com/jobs/456) | 3d |
                """;

        List<UnifiedJobListingDto> freshList = new ArrayList<>();
        Set<String> seenDedupKeys = new HashSet<>();

        scraper.parseMarkdownTable(markdown, "JUNIOR", freshList, seenDedupKeys, Collections.emptySet());

        // Optiver (Amsterdam), Jane Street (London), GitLab (Remote) sunt păstrate.
        // TikTok (Bangkok, Thailand) este exclus!
        assertEquals(3, freshList.size());

        UnifiedJobListingDto optiverJob = freshList.stream()
                .filter(j -> j.companyName().equals("Optiver"))
                .findFirst()
                .orElseThrow();
        assertEquals("Graduate Software Engineer - 2027 Start", optiverJob.jobTitle());
        assertEquals("Amsterdam, The Netherlands +1", optiverJob.location());
        assertEquals("https://www.optiver.com/jobs/8585609002", optiverJob.directApplyUrl());
        assertEquals(14, optiverJob.postedDaysAgo());

        UnifiedJobListingDto gitlabJob = freshList.stream()
                .filter(j -> j.companyName().equals("GitLab"))
                .findFirst()
                .orElseThrow();
        assertEquals("Junior Full Stack Developer", gitlabJob.jobTitle());
        assertEquals("REMOTE", gitlabJob.workModel());
        assertEquals("https://gitlab.com/jobs/456", gitlabJob.directApplyUrl());
        assertEquals(3, gitlabJob.postedDaysAgo());
    }

    @Test
    @DisplayName("parseAgeDays convertește corect zile, săptămâni și luni")
    void testParseAgeDays() {
        assertEquals(5, GitHubJuniorTechScraper.parseAgeDays("5d"));
        assertEquals(14, GitHubJuniorTechScraper.parseAgeDays("2w"));
        assertEquals(30, GitHubJuniorTechScraper.parseAgeDays("1mo"));
        assertEquals(7, GitHubJuniorTechScraper.parseAgeDays(""));
    }
}
