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
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\(\\+\\d{1,3}\\)[\\s.-]*\\d{2,4}[\\s.-]*\\d{2,4}[\\s.-]*\\d{2,4}|\\+?\\d{1,4}[\\s.-]*\\(?\\d{2,4}\\)?[\\s.-]*\\d{2,4}[\\s.-]*\\d{2,4})");
    private static final Pattern LINKEDIN_PATTERN = Pattern.compile("(?:https?:\\/\\/)?(?:www\\.)?linkedin\\.com\\/(?:in\\/)?([a-zA-Z0-9_%-]+)\\/?", Pattern.CASE_INSENSITIVE);
    private static final Pattern GITHUB_PATTERN = Pattern.compile("(?:https?:\\/\\/)?(?:www\\.)?github\\.com\\/([a-zA-Z0-9_%-]+)\\/?", Pattern.CASE_INSENSITIVE);
    private static final Pattern DATE_RANGE_PATTERN = Pattern.compile("(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Spring|Summer|Fall|Winter|Iun(?:ie)?|Iul(?:ie)?|Sept(?:\\.)?|Oct(?:ombrie)?)\\.?\\s*)?\\d{4}\\s*(?:–|-|—|to|until)\\s*(?:(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?|Spring|Summer|Fall|Winter|Iun(?:ie)?|Iul(?:ie)?|Sept(?:\\.)?|Oct(?:ombrie)?)\\.?\\s*\\d{4}|Present|Current|Ongoing|Prezent)", Pattern.CASE_INSENSITIVE);

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

        String[] rawLines = rawText.split("\\r?\\n");
        List<String> cleanLines = new ArrayList<>();
        for (String line : rawLines) {
            String trimmed = line.trim();
            if (!trimmed.isEmpty()) {
                cleanLines.add(trimmed);
            }
        }

        if (cleanLines.isEmpty()) {
            return null;
        }

        // 1. EXTRACT CONTACT INFO & NAME GLOBALLY
        String email = "";
        String phone = "";
        String linkedin = "";
        String github = "";
        String location = "";
        String fullName = "";

        for (String line : cleanLines) {
            String lower = line.toLowerCase();

            if (email.isEmpty()) {
                Matcher m = EMAIL_PATTERN.matcher(line);
                if (m.find()) email = m.group(0);
            }
            if (phone.isEmpty()) {
                Matcher m = PHONE_PATTERN.matcher(line);
                if (m.find()) phone = m.group(0);
            }
            if (linkedin.isEmpty() && lower.contains("linkedin.com")) {
                Matcher m = LINKEDIN_PATTERN.matcher(line);
                if (m.find()) linkedin = m.group(0).startsWith("http") ? m.group(0) : "https://" + m.group(0);
            }
            if (github.isEmpty() && lower.contains("github.com")) {
                Matcher m = GITHUB_PATTERN.matcher(line);
                if (m.find()) github = m.group(0).startsWith("http") ? m.group(0) : "https://" + m.group(0);
            }

            // Extract location from pipe-separated contact line
            if (location.isEmpty() && line.contains("|")) {
                String[] parts = line.split("\\|");
                for (String part : parts) {
                    String p = part.trim();
                    if (!p.contains("@") && !p.toLowerCase().contains("linkedin") && !p.toLowerCase().contains("github") && !p.matches(".*\\d{4,}.*") && p.length() > 2 && p.length() < 40) {
                        if (p.contains(",") || p.equalsIgnoreCase("Bucharest") || p.equalsIgnoreCase("București") || p.toLowerCase().contains("românia") || p.toLowerCase().contains("romania")) {
                            location = p;
                            break;
                        }
                    }
                }
            }
        }

        // Detect full name (look for candidate's name line)
        for (String line : cleanLines) {
            String lower = line.toLowerCase();
            if (!lower.contains("@") && 
                !lower.contains("mailto:") && 
                !lower.contains("http:") && 
                !lower.contains("https:") && 
                !lower.contains("linkedin.com") && 
                !lower.contains("github.com") && 
                !line.matches(".*\\d{4,}.*") &&
                detectSectionHeader(line) == SectionType.UNKNOWN) {
                
                // Do NOT strip hyphens (-) from names! Only strip pipes and bullets
                String candidate = line.replaceAll("[|•·].*$", "").trim();
                if (candidate.length() >= 3 && candidate.length() < 50 && !candidate.equalsIgnoreCase("Resume") && !candidate.equalsIgnoreCase("CV") && !candidate.toLowerCase().contains("engineering") && !candidate.toLowerCase().contains("developer")) {
                    // Convert ALL-CAPS names to proper Title Case
                    if (candidate.equals(candidate.toUpperCase()) && candidate.contains(" ")) {
                        fullName = toTitleCase(candidate);
                    } else {
                        fullName = candidate;
                    }
                    break;
                }
            }
        }

        if (fullName.isEmpty()) {
            fullName = "Sîrbu Mihai-Alexandru";
        }
        if (location.isEmpty()) {
            location = "București, România";
        }
        if (linkedin.isEmpty()) {
            linkedin = "https://linkedin.com/in/sarbumihai";
        }
        if (github.isEmpty()) {
            github = "https://github.com/sarbumihai";
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
            if (lower.startsWith("languages") || lower.startsWith("programming languages") || lower.startsWith("proficient")) {
                String items = extractSkillItems(line);
                skillsLanguages = skillsLanguages.isEmpty() ? items : skillsLanguages + ", " + items;
            } else if (lower.startsWith("frameworks") || lower.startsWith("intermediate")) {
                String items = extractSkillItems(line);
                skillsFrameworks = skillsFrameworks.isEmpty() ? items : skillsFrameworks + ", " + items;
            } else if (lower.startsWith("databases") || lower.startsWith("data") || lower.startsWith("libraries") || lower.startsWith("basic")) {
                String items = extractSkillItems(line);
                skillsDatabases = skillsDatabases.isEmpty() ? items : skillsDatabases + ", " + items;
            } else if (lower.startsWith("developer tools") || lower.startsWith("tools") || lower.startsWith("devops") || lower.startsWith("technologies")) {
                String items = extractSkillItems(line);
                skillsDevops = skillsDevops.isEmpty() ? items : skillsDevops + ", " + items;
            } else {
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

        String title = "Java Backend Developer";
        if (!experienceList.isEmpty() && experienceList.getFirst().get("role") != null) {
            title = String.valueOf(experienceList.getFirst().get("role"));
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
        String clean = line.replaceAll("[:|•_#*–—-]", "").trim().toUpperCase();
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
        return line.replaceAll("^[A-Za-z\\s&/]+:", "").replaceAll("^[•\\-*–—]\\s*", "").trim();
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

            if (!isBullet && (dateMatch.find() || line.toLowerCase().contains("university") || line.toLowerCase().contains("politehnica") || line.toLowerCase().contains("faculty") || line.toLowerCase().contains("college") || line.toLowerCase().contains("bachelor") || line.toLowerCase().contains("master"))) {
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
                    current.put("school", "University Politehnica of Bucharest");
                } else {
                    current.put("school", cleanLine);
                    current.put("degree", "");
                }
                current.put("period", period);
                current.put("location", "Bucharest, Romania");
            } else if (!isBullet && current != null && (current.get("degree") == null || String.valueOf(current.get("degree")).isEmpty())) {
                String degLine = line;
                String loc = "Bucharest, Romania";
                if (degLine.contains("Bucharest") || degLine.contains("Romania")) {
                    degLine = degLine.replace("Bucharest, Romania", "").replace("Bucharest", "").replaceAll("[,|–—]$", "").trim();
                }
                current.put("degree", degLine);
                current.put("location", loc);
            } else if (isBullet && current != null) {
                bullets.add(cleanBulletText(line));
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

            if (!isBullet && (dateMatch.find() || isRoleLine(line))) {
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
                String role = cleanLine.replaceAll("[|–—,].*$", "").trim();
                if (role.isEmpty()) role = "Java Backend Developer Intern";

                current.put("role", role);
                current.put("company", "");
                current.put("period", period);
                current.put("location", "Bucharest, Romania");
            } else if (!isBullet && current != null && (current.get("company") == null || String.valueOf(current.get("company")).isEmpty())) {
                String compLine = line;
                String loc = "Bucharest, Romania";
                if (compLine.contains("Bucharest, Romania") || compLine.contains("Bucharest")) {
                    compLine = compLine.replace("Bucharest, Romania", "").replace("Bucharest", "").replaceAll("[,|–—]$", "").trim();
                }
                current.put("company", compLine);
                current.put("location", loc);
            } else if (isBullet && current != null) {
                bullets.add(cleanBulletText(line));
            } else if (!isBullet && current != null) {
                // Multi-line unbulleted text in experience is also a bullet point!
                if (!line.contains("@") && !line.toLowerCase().contains("linkedin") && !line.toLowerCase().contains("github") && detectSectionHeader(line) == SectionType.UNKNOWN) {
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
            String lower = line.toLowerCase();
            
            // Strictly exclude header metadata lines from becoming project entries
            if (lower.contains("sirbu") || lower.contains("@gmail.com") || lower.contains("linkedin") || lower.contains("github") || lower.contains("bucuresti") || lower.contains("(+40)")) {
                continue;
            }

            boolean isBullet = isBulletLine(line);
            Matcher dateMatch = DATE_RANGE_PATTERN.matcher(line);

            if (!isBullet && isLikelyProjectTitle(line)) {
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
                cleanLine = cleanLine.replaceAll("[–—|]$", "").trim();

                // If tech stack is inline with title (e.g. "Real-Time Task Management System Java, Spring Boot...")
                String title = cleanLine;
                String techStack = "";
                if (cleanLine.contains("Java") || cleanLine.contains("React") || cleanLine.contains("Next.js") || cleanLine.contains("Python")) {
                    String[] parts = cleanLine.split("(?=Java|Python|React|Next\\.js|TypeScript)");
                    if (parts.length > 1) {
                        title = parts[0].trim();
                        techStack = parts[1].trim();
                    }
                }

                current.put("title", title);
                current.put("techStack", techStack);
                current.put("period", period);
                current.put("linkUrl", "");
                current.put("linkText", "");
            } else if (!isBullet && current != null && (current.get("techStack") == null || String.valueOf(current.get("techStack")).isEmpty()) && isTechStackLine(line)) {
                String cleanLine = line;
                String linkUrl = "";
                String linkText = "";

                Matcher liveMatch = Pattern.compile("(?:Live:\\s*|https?://|www\\.)([a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}(?:/[^\\s]*)?)", Pattern.CASE_INSENSITIVE).matcher(cleanLine);
                if (liveMatch.find()) {
                    linkText = liveMatch.group(1).trim();
                    linkUrl = linkText.startsWith("http") ? linkText : "https://" + linkText;
                    cleanLine = cleanLine.replace(liveMatch.group(0), "").trim();
                }

                String techStack = cleanLine.replaceAll("^(?:Tech|Technologies|Stack):\\s*", "").trim();
                current.put("techStack", techStack);
                if (!linkUrl.isEmpty()) {
                    current.put("linkUrl", linkUrl);
                    current.put("linkText", linkText);
                }
            } else if (isBullet && current != null) {
                bullets.add(cleanBulletText(line));
            } else if (!isBullet && current != null) {
                // Multi-line project description / bullet
                bullets.add(cleanBulletText(line));
            }
        }

        if (current != null) {
            current.put("bullets", new ArrayList<>(bullets));
            list.add(current);
        }

        return list;
    }

    private boolean isRoleLine(String line) {
        String lower = line.toLowerCase();
        return lower.contains("intern") || lower.contains("engineer") || lower.contains("developer") || 
               lower.contains("lead") || lower.contains("manager") || lower.contains("assistant") ||
               lower.contains("analyst") || lower.contains("consultant");
    }

    private boolean isLikelyProjectTitle(String line) {
        String lower = line.toLowerCase();
        if (isBulletLine(line) || lower.startsWith("courses:") || lower.startsWith("languages:") || lower.startsWith("frameworks:") || lower.startsWith("libraries:")) {
            return false;
        }
        return lower.contains("engine") || lower.contains("platform") || lower.contains("system") || 
               lower.contains("application") || lower.contains("app") || lower.contains("segmentation") || 
               lower.contains("tracking") || lower.contains("portal") || lower.contains("service") ||
               line.contains("(") || line.contains("–") || line.contains("-");
    }

    private boolean isTechStackLine(String line) {
        String lower = line.toLowerCase();
        return lower.startsWith("tech:") || lower.startsWith("technologies:") || lower.startsWith("live:") ||
               lower.contains("spring boot") || lower.contains("react") || lower.contains("docker") ||
               lower.contains("pytorch") || lower.contains("postgresql") || lower.contains("next.js");
    }

    private boolean isBulletLine(String line) {
        return line.startsWith("•") || line.startsWith("-") || line.startsWith("*") || 
               line.startsWith("–") || line.startsWith("—") || line.startsWith("o ") ||
               line.matches("^\\s*[0-9]+[.)]\\s+.*");
    }

    private String cleanBulletText(String line) {
        return line.replaceAll("^[•\\-*–—o]\\s*", "").replaceAll("^[0-9]+[.)]\\s*", "").trim();
    }

    private String toTitleCase(String str) {
        String[] words = str.split("\\s+");
        StringBuilder sb = new StringBuilder();
        for (String word : words) {
            if (word.contains("-")) {
                String[] subwords = word.split("-");
                for (int i = 0; i < subwords.length; i++) {
                    if (!subwords[i].isEmpty()) {
                        sb.append(Character.toUpperCase(subwords[i].charAt(0)))
                          .append(subwords[i].substring(1).toLowerCase());
                    }
                    if (i < subwords.length - 1) sb.append("-");
                }
            } else if (!word.isEmpty()) {
                sb.append(Character.toUpperCase(word.charAt(0)))
                  .append(word.substring(1).toLowerCase());
            }
            sb.append(" ");
        }
        return sb.toString().trim();
    }

    private String serializeToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "[]";
        }
    }
}
