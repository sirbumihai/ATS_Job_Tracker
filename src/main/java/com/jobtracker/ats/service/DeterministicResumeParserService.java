package com.jobtracker.ats.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.CvProfileDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class DeterministicResumeParserService {

    private final ObjectMapper objectMapper;

    // REGEX PATTERNS FOR CONTACT INFO
    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+?\\d{1,3}[-.\\s]?)?\\(?\\d{2,4}\\)?[-.\\s]?\\d{3,4}[-.\\s]?\\d{3,4}");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile("(?:https?:\\/\\/)?(?:www\\.)?linkedin\\.com\\/(?:in\\/)?([a-zA-Z0-9_%-]+)\\/?", Pattern.CASE_INSENSITIVE);
    private static final Pattern GITHUB_PATTERN = Pattern.compile("(?:https?:\\/\\/)?(?:www\\.)?github\\.com\\/([a-zA-Z0-9_%-]+)\\/?", Pattern.CASE_INSENSITIVE);
    private static final Pattern DATE_RANGE_PATTERN = Pattern.compile("(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Spring|Summer|Fall|Winter)\\.?\\s*)?\\d{4}\\s*(?:–|-|—|to|until)\\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Spring|Summer|Fall|Winter)\\.?\\s*\\d{4}|Present|Current|Ongoing|Prezent)", Pattern.CASE_INSENSITIVE);

    // SECTION HEADERS DETECTOR
    private enum SectionType {
        HEADER,
        SUMMARY,
        EDUCATION,
        EXPERIENCE,
        PROJECTS,
        SKILLS,
        CERTIFICATIONS,
        UNKNOWN
    }

    public CvProfileDto parseResume(UUID userId, String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return null;
        }

        String[] lines = rawText.split("\\r?\\n");
        List<String> cleanLines = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                cleanLines.add(trimmed);
            }
        }

        if (cleanLines.isEmpty()) {
            return null;
        }

        // 1. EXTRACT CONTACT INFO & NAME
        String email = "";
        String phone = "";
        String linkedin = "";
        String github = "";
        String location = "";
        String fullName = "";

        // First 8 lines usually contain the header & contact info
        int headerLimit = Math.min(cleanLines.size(), 10);
        for (int i = 0; i < headerLimit; i++) {
            String line = cleanLines.get(i);

            if (email.isEmpty()) {
                Matcher m = EMAIL_PATTERN.matcher(line);
                if (m.find()) email = m.group(0);
            }
            if (phone.isEmpty()) {
                Matcher m = PHONE_PATTERN.matcher(line);
                if (m.find()) phone = m.group(0);
            }
            if (linkedin.isEmpty()) {
                Matcher m = LINKEDIN_PATTERN.matcher(line);
                if (m.find()) linkedin = m.group(0).startsWith("http") ? m.group(0) : "https://" + m.group(0);
            }
            if (github.isEmpty()) {
                Matcher m = GITHUB_PATTERN.matcher(line);
                if (m.find()) github = m.group(0).startsWith("http") ? m.group(0) : "https://" + m.group(0);
            }
        }

        // Detect full name from top lines (first line that is not an email/phone/URL)
        for (int i = 0; i < Math.min(cleanLines.size(), 5); i++) {
            String line = cleanLines.get(i);
            if (!line.contains("@") && !line.toLowerCase().contains("linkedin.com") && !line.toLowerCase().contains("github.com") && !line.matches(".*\\d{5,}.*")) {
                // Strip separators like |, •, -
                String candidate = line.replaceAll("[|•·\\-–—].*$", "").trim();
                if (candidate.length() > 2 && candidate.length() < 50 && candidate.contains(" ")) {
                    fullName = candidate;
                    break;
                } else if (candidate.length() > 2 && candidate.length() < 40 && fullName.isEmpty()) {
                    fullName = candidate;
                }
            }
        }
        if (fullName.isEmpty() && !cleanLines.isEmpty()) {
            fullName = cleanLines.getFirst().replaceAll("[|•·].*$", "").trim();
        }

        // Try extracting location (look for City, Country or City, State patterns in header)
        Pattern locPattern = Pattern.compile("([A-Z][a-zA-Z\\s]+,\\s*[A-Z][a-zA-Z\\s]+)");
        for (int i = 0; i < headerLimit; i++) {
            String line = cleanLines.get(i);
            Matcher m = locPattern.matcher(line);
            if (m.find()) {
                String match = m.group(1).trim();
                if (!match.equalsIgnoreCase("Computer Science") && !match.equalsIgnoreCase("Software Engineer") && !match.toLowerCase().contains("university")) {
                    location = match;
                    break;
                }
            }
        }

        // 2. SEGMENT LINES INTO SECTIONS
        Map<SectionType, List<String>> sections = new LinkedHashMap<>();
        for (SectionType type : SectionType.values()) {
            sections.put(type, new ArrayList<>());
        }

        SectionType currentSection = SectionType.HEADER;

        for (String line : cleanLines) {
            SectionType detectedHeader = detectSectionHeader(line);
            if (detectedHeader != SectionType.UNKNOWN) {
                currentSection = detectedHeader;
                continue;
            }
            sections.get(currentSection).add(line);
        }

        // 3. PARSE SUMMARY
        String summary = String.join(" ", sections.get(SectionType.SUMMARY)).trim();

        // 4. PARSE SKILLS
        String skillsLanguages = "";
        String skillsFrameworks = "";
        String skillsDatabases = "";
        String skillsDevops = "";

        List<String> skillsLines = sections.get(SectionType.SKILLS);
        for (String line : skillsLines) {
            String lower = line.toLowerCase();
            if (lower.startsWith("languages") || lower.startsWith("programming languages")) {
                skillsLanguages = extractSkillItems(line);
            } else if (lower.startsWith("frameworks") || lower.startsWith("frameworks & libraries") || lower.startsWith("web frameworks")) {
                skillsFrameworks = extractSkillItems(line);
            } else if (lower.startsWith("databases") || lower.startsWith("data") || lower.startsWith("database systems")) {
                skillsDatabases = extractSkillItems(line);
            } else if (lower.startsWith("developer tools") || lower.startsWith("tools") || lower.startsWith("devops") || lower.startsWith("platforms")) {
                skillsDevops = extractSkillItems(line);
            } else if (lower.startsWith("libraries")) {
                if (skillsDatabases.isEmpty()) skillsDatabases = extractSkillItems(line);
                else skillsFrameworks += (skillsFrameworks.isEmpty() ? "" : ", ") + extractSkillItems(line);
            } else {
                // Unlabeled skills line: distribute items
                if (skillsLanguages.isEmpty()) skillsLanguages = line.replaceAll("^[•\\-*–]\\s*", "");
                else if (skillsFrameworks.isEmpty()) skillsFrameworks = line.replaceAll("^[•\\-*–]\\s*", "");
                else if (skillsDevops.isEmpty()) skillsDevops = line.replaceAll("^[•\\-*–]\\s*", "");
            }
        }

        // 5. PARSE EDUCATION
        List<Map<String, Object>> educationList = parseEducation(sections.get(SectionType.EDUCATION));

        // 6. PARSE EXPERIENCE
        List<Map<String, Object>> experienceList = parseExperience(sections.get(SectionType.EXPERIENCE));

        // 7. PARSE PROJECTS
        List<Map<String, Object>> projectsList = parseProjects(sections.get(SectionType.PROJECTS));

        // 8. SERIALIZE TO JSON
        String educationJson = serializeToJson(educationList);
        String workExperienceJson = serializeToJson(experienceList);
        String projectsJson = serializeToJson(projectsList);

        String title = "CV Principal";
        if (!experienceList.isEmpty() && experienceList.getFirst().get("role") != null) {
            title = String.valueOf(experienceList.getFirst().get("role"));
        } else if (!projectsList.isEmpty() && projectsList.getFirst().get("techStack") != null) {
            title = "Software Engineer";
        }

        return new CvProfileDto(
                null,
                title,
                false,
                fullName,
                email,
                phone,
                location,
                linkedin,
                github,
                summary,
                skillsLanguages,
                skillsFrameworks,
                skillsDatabases,
                skillsDevops,
                workExperienceJson,
                projectsJson,
                educationJson,
                "EN",
                null,
                null
        );
    }

    private SectionType detectSectionHeader(String line) {
        String clean = line.replaceAll("[:|•_#*-]", "").trim().toUpperCase();
        if (clean.length() > 40) return SectionType.UNKNOWN;

        return switch (clean) {
            case "EDUCATION", "ACADEMIC BACKGROUND", "STUDIES", "ACADEMIC HISTORY", "EDUCATION AND QUALIFICATIONS" -> SectionType.EDUCATION;
            case "EXPERIENCE", "WORK EXPERIENCE", "PROFESSIONAL EXPERIENCE", "EMPLOYMENT HISTORY", "WORK HISTORY", "INTERNSHIPS" -> SectionType.EXPERIENCE;
            case "PROJECTS", "PERSONAL PROJECTS", "TECHNICAL PROJECTS", "ACADEMIC PROJECTS", "KEY PROJECTS", "FEATURED PROJECTS" -> SectionType.PROJECTS;
            case "TECHNICAL SKILLS", "SKILLS", "SKILLS & EXPERTISE", "CORE COMPETENCIES", "TECHNOLOGIES", "AREAS OF EXPERTISE" -> SectionType.SKILLS;
            case "SUMMARY", "PROFESSIONAL SUMMARY", "ABOUT ME", "PROFILE", "OBJECTIVE", "EXECUTIVE SUMMARY" -> SectionType.SUMMARY;
            case "CERTIFICATIONS", "CERTIFICATES", "AWARDS & CERTIFICATIONS", "LICENSES & CERTIFICATIONS" -> SectionType.CERTIFICATIONS;
            default -> SectionType.UNKNOWN;
        };
    }

    private String extractSkillItems(String line) {
        String clean = line.replaceAll("^[A-Za-z\\s&/]+:", "").replaceAll("^[•\\-*–]\\s*", "").trim();
        return clean;
    }

    private List<Map<String, Object>> parseEducation(List<String> lines) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (lines.isEmpty()) return list;

        Map<String, Object> current = null;
        List<String> bullets = new ArrayList<>();
        int idCounter = 1;

        for (String line : lines) {
            boolean isBullet = isBulletLine(line);
            Matcher dateMatch = DATE_RANGE_PATTERN.matcher(line);

            if (!isBullet && (dateMatch.find() || line.toLowerCase().contains("university") || line.toLowerCase().contains("college") || line.toLowerCase().contains("faculty") || line.toLowerCase().contains("bachelor") || line.toLowerCase().contains("master"))) {
                if (current != null) {
                    current.put("bullets", new ArrayList<>(bullets));
                    list.add(current);
                    bullets.clear();
                }

                current = new LinkedHashMap<>();
                current.put("id", idCounter++);
                
                String period = "";
                if (dateMatch.find(0)) {
                    period = dateMatch.group(0);
                }

                String cleanLine = line;
                if (!period.isEmpty()) {
                    cleanLine = line.replace(period, "").replaceAll("[|–—]", "").trim();
                }

                if (cleanLine.toLowerCase().contains("bachelor") || cleanLine.toLowerCase().contains("master") || cleanLine.toLowerCase().contains("degree")) {
                    current.put("degree", cleanLine);
                    current.put("school", "University");
                } else {
                    current.put("school", cleanLine);
                    current.put("degree", "Bachelor of Science in Computer Science");
                }
                current.put("period", period);
                current.put("location", "");
            } else if (isBullet) {
                bullets.add(cleanBulletText(line));
            } else if (current != null && current.get("degree") != null && String.valueOf(current.get("degree")).equals("Bachelor of Science in Computer Science")) {
                current.put("degree", line);
            }
        }

        if (current != null) {
            current.put("bullets", new ArrayList<>(bullets));
            list.add(current);
        }

        return list;
    }

    private List<Map<String, Object>> parseExperience(List<String> lines) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (lines.isEmpty()) return list;

        Map<String, Object> current = null;
        List<String> bullets = new ArrayList<>();
        int idCounter = 1;

        for (String line : lines) {
            boolean isBullet = isBulletLine(line);
            Matcher dateMatch = DATE_RANGE_PATTERN.matcher(line);

            if (!isBullet && (dateMatch.find() || line.contains("|") || line.toLowerCase().contains("intern") || line.toLowerCase().contains("engineer") || line.toLowerCase().contains("developer"))) {
                if (current != null) {
                    current.put("bullets", new ArrayList<>(bullets));
                    list.add(current);
                    bullets.clear();
                }

                current = new LinkedHashMap<>();
                current.put("id", idCounter++);

                String period = "";
                if (dateMatch.find(0)) {
                    period = dateMatch.group(0);
                }

                String withoutDate = period.isEmpty() ? line : line.replace(period, "").trim();
                String[] parts = withoutDate.split("[|–—,]");

                String role = parts.length > 0 ? parts[0].trim() : "Software Engineer";
                String company = parts.length > 1 ? parts[1].trim() : "Company";
                String location = parts.length > 2 ? parts[2].trim() : "";

                current.put("role", role);
                current.put("company", company);
                current.put("period", period);
                current.put("location", location);
            } else {
                if (current != null) {
                    bullets.add(cleanBulletText(line));
                }
            }
        }

        if (current != null) {
            current.put("bullets", new ArrayList<>(bullets));
            list.add(current);
        }

        return list;
    }

    private List<Map<String, Object>> parseProjects(List<String> lines) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (lines.isEmpty()) return list;

        Map<String, Object> current = null;
        List<String> bullets = new ArrayList<>();
        int idCounter = 1;

        for (String line : lines) {
            boolean isBullet = isBulletLine(line);
            Matcher dateMatch = DATE_RANGE_PATTERN.matcher(line);

            // A project header line typically has |, or tech stack in parentheses/brackets or date
            if (!isBullet && (line.contains("|") || line.contains("–") || dateMatch.find() || (line.contains("(") && line.contains(")")))) {
                if (current != null) {
                    current.put("bullets", new ArrayList<>(bullets));
                    list.add(current);
                    bullets.clear();
                }

                current = new LinkedHashMap<>();
                current.put("id", idCounter++);

                String period = "";
                if (dateMatch.find(0)) {
                    period = dateMatch.group(0);
                }

                String cleanLine = period.isEmpty() ? line : line.replace(period, "").trim();
                String[] parts = cleanLine.split("[|–—]");

                String title = parts.length > 0 ? parts[0].replaceAll("[()]", "").trim() : "Project";
                String techStack = parts.length > 1 ? parts[1].replaceAll("[()]", "").trim() : "";
                
                String linkUrl = "";
                String linkText = "";
                Matcher gitMatch = GITHUB_PATTERN.matcher(line);
                if (gitMatch.find()) {
                    linkUrl = gitMatch.group(0).startsWith("http") ? gitMatch.group(0) : "https://" + gitMatch.group(0);
                    linkText = gitMatch.group(0).replace("https://", "").replace("http://", "");
                }

                current.put("title", title);
                current.put("techStack", techStack);
                current.put("period", period);
                current.put("linkUrl", linkUrl);
                current.put("linkText", linkText);
            } else {
                if (current != null) {
                    bullets.add(cleanBulletText(line));
                }
            }
        }

        if (current != null) {
            current.put("bullets", new ArrayList<>(bullets));
            list.add(current);
        }

        return list;
    }

    private boolean isBulletLine(String line) {
        return line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || 
               line.startsWith("–") || line.startsWith("—") || line.startsWith("o ") ||
               line.matches("^\\s*[0-9]+[.)]\\s+.*");
    }

    private String cleanBulletText(String line) {
        return line.replaceAll("^[•\\-*–—o]\\s*", "").replaceAll("^[0-9]+[.)]\\s*", "").trim();
    }

    private String serializeToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
}
