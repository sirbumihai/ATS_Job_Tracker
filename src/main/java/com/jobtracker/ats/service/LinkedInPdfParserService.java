package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.linkedin.LinkedInEducationDto;
import com.jobtracker.ats.dto.linkedin.LinkedInExperienceDto;
import com.jobtracker.ats.dto.linkedin.LinkedInProfileDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class LinkedInPdfParserService {

    private final TextExtractionService textExtractionService;

    private static final Pattern EMAIL_PATTERN = Pattern.compile("[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}");
    private static final Pattern PHONE_PATTERN = Pattern.compile("(?:\\+?\\d{1,4}[\\s.-]*)?\\(?\\d{2,4}\\)?[\\s.-]*\\d{2,4}[\\s.-]*\\d{2,4}");
    private static final Pattern LINKEDIN_URL_PATTERN = Pattern.compile("(?:https?:\\/\\/)?(?:www\\.)?linkedin\\.com\\/in\\/[a-zA-Z0-9_%-]+", Pattern.CASE_INSENSITIVE);

    public LinkedInProfileDto parsePdfFile(MultipartFile file) {
        String rawText = textExtractionService.extractText(file);
        return parseRawLinkedInText(rawText);
    }

    public LinkedInProfileDto parseRawLinkedInText(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return LinkedInProfileDto.createEmpty();
        }

        // Normalizare spații Unicode (NBSP \u00A0, zero-width space \u200B etc.)
        String normalized = rawText.replace('\u00A0', ' ').replace('\u200B', ' ');
        String[] lines = normalized.split("\\r?\\n");
        List<String> cleanLines = new ArrayList<>();
        for (String line : lines) {
            String trimmed = line.replaceAll("\\s+", " ").trim();
            if (trimmed.isEmpty()) continue;
            // Ignoră numere de pagină specifice LinkedIn PDF
            if (trimmed.matches("(?i).*page\\s+\\d+\\s+of\\s+\\d+.*") || trimmed.matches("(?i)^page\\s+\\d+.*")) {
                continue;
            }
            cleanLines.add(trimmed);
        }

        if (cleanLines.isEmpty()) {
            return LinkedInProfileDto.createEmpty();
        }

        String email = "";
        String linkedinUrl = "";
        String phone = "";
        List<String> skills = new ArrayList<>();
        List<String> languages = new ArrayList<>();
        List<LinkedInEducationDto> educationList = new ArrayList<>();
        List<LinkedInExperienceDto> experienceList = new ArrayList<>();

        // Căutare primară pe rawText pentru URL complet LinkedIn (evită trunchierea la sfârșit de linie din PDF)
        Matcher rawLm = LINKEDIN_URL_PATTERN.matcher(rawText);
        while (rawLm.find()) {
            String m = rawLm.group(0);
            if (m.contains("?")) {
                m = m.substring(0, m.indexOf('?'));
            }
            if (!m.endsWith("-") && m.length() > linkedinUrl.length()) {
                linkedinUrl = m.startsWith("http") ? m : "https://" + m;
            }
        }

        String fullName = "";
        String headline = "";
        String location = "";
        StringBuilder aboutBuilder = new StringBuilder();

        // Identificăm secțiunile majore
        String currentSection = "HEADER"; // HEADER, CONTACT, SKILLS, LANGUAGES, EXPERIENCE, EDUCATION, SUMMARY

        for (int i = 0; i < cleanLines.size(); i++) {
            String line = cleanLines.get(i);
            String lower = line.toLowerCase();

            // Detectare email și linkedin url oriunde apar
            if (email.isEmpty()) {
                Matcher em = EMAIL_PATTERN.matcher(line);
                if (em.find()) email = em.group(0);
            }
            if (linkedinUrl.isEmpty()) {
                Matcher lm = LINKEDIN_URL_PATTERN.matcher(line);
                if (lm.find()) {
                    String match = lm.group(0);
                    if (match.contains("?")) {
                        match = match.substring(0, match.indexOf('?'));
                    }
                    if (match.endsWith("-") && i + 1 < cleanLines.size()) {
                        String nextToken = cleanLines.get(i + 1).split("\\s+")[0].replaceAll("[^a-zA-Z0-9-]", "");
                        if (!nextToken.isEmpty() && !nextToken.equalsIgnoreCase("linkedin")) {
                            match = match + nextToken;
                        }
                    }
                    linkedinUrl = match.startsWith("http") ? match : "https://" + match;
                }
            }

            // Ignoră linkuri reziduale din footer-ul PDF-ului
            if (line.startsWith("mailto:") || line.startsWith("http://") || line.startsWith("https://") || line.contains("jobid=")) {
                continue;
            }

            // Detectare tranzitie sectiuni
            if (lower.equals("contactați") || lower.equals("contact") || lower.equals("contact details")) {
                currentSection = "CONTACT";
                continue;
            } else if (lower.equals("aptitudini principale") || lower.equals("top skills") || lower.equals("skills") || lower.equals("aptitudini")) {
                currentSection = "SKILLS";
                continue;
            } else if (lower.equals("languages") || lower.equals("limbi") || lower.equals("limbi străine")) {
                currentSection = "LANGUAGES";
                continue;
            } else if (lower.equals("studii") || lower.equals("education") || lower.equals("educație")) {
                currentSection = "EDUCATION";
                continue;
            } else if (lower.equals("experiență") || lower.equals("experience") || lower.equals("experienta profesionala")) {
                currentSection = "EXPERIENCE";
                continue;
            } else if (lower.equals("rezumat") || lower.equals("summary") || lower.equals("despre") || lower.equals("about")) {
                currentSection = "SUMMARY";
                continue;
            }

            // Parsează în funcție de secțiunea activă
            switch (currentSection) {
                case "CONTACT" -> {
                    if (phone.isEmpty()) {
                        Matcher pm = PHONE_PATTERN.matcher(line);
                        if (pm.find() && line.replaceAll("[^0-9]", "").length() >= 9) {
                            phone = pm.group(0);
                        }
                    }
                }
                case "SKILLS" -> {
                    if (isLikelyNameOrHeader(cleanLines, i)) {
                        currentSection = "HEADER";
                        i--; // Re-evaluează linia ca header
                    } else if (!line.startsWith("Page ") && !line.contains("@") && !line.contains("linkedin.com")) {
                        skills.add(line);
                    }
                }
                case "LANGUAGES" -> {
                    if (isLikelyNameOrHeader(cleanLines, i)) {
                        currentSection = "HEADER";
                        i--;
                    } else {
                        languages.add(line);
                    }
                }
                case "HEADER" -> {
                    // Căutăm Nume, Headline și Locație
                    if (fullName.isEmpty() && !line.contains("@") && !line.contains("linkedin.com") && line.matches(".*[a-zA-ZăâîșțĂÂÎȘȚ].*") && line.split("\\s+").length <= 4) {
                        fullName = line;
                        // Următoarele rânduri sunt cel mai probabil Headline și Locație
                        if (i + 1 < cleanLines.size() && !isSectionHeader(cleanLines.get(i + 1))) {
                            headline = cleanLines.get(i + 1);
                            i++;
                        }
                        if (i + 1 < cleanLines.size() && !isSectionHeader(cleanLines.get(i + 1))) {
                            String possibleLoc = cleanLines.get(i + 1);
                            if (possibleLoc.contains("România") || possibleLoc.contains("Romania") || possibleLoc.contains("Bucur") || possibleLoc.contains("Cluj") || possibleLoc.contains(",")) {
                                location = possibleLoc;
                                i++;
                            }
                        }
                    }
                }
                case "EDUCATION" -> {
                    if (isSectionHeader(line)) {
                        i--;
                        currentSection = "OTHER";
                        break;
                    }
                    if (line.toLowerCase().startsWith("page ") || line.startsWith("mailto:") || line.startsWith("http")) {
                        break;
                    }

                    String institution = line;
                    String degree = "";
                    String period = "";

                    if (i + 1 < cleanLines.size() && !isSectionHeader(cleanLines.get(i + 1))) {
                        String detailsLine = cleanLines.get(i + 1);
                        if (!detailsLine.startsWith("mailto:") && !detailsLine.startsWith("http") && !detailsLine.contains("jobid=")) {
                            if (detailsLine.contains("·") || detailsLine.contains("-") || detailsLine.contains("–") || detailsLine.matches(".*\\d{4}.*")) {
                                String[] parts = detailsLine.split("·");
                                if (parts.length > 1) {
                                    degree = parts[0].trim();
                                    period = parts[1].replace("(", "").replace(")", "").trim();
                                } else {
                                    degree = detailsLine;
                                }
                                i++;
                            }
                        }
                    }

                    String logo = institution.toLowerCase().contains("politehnica") ? "UP" :
                            institution.toLowerCase().contains("automatica") ? "FD" :
                            institution.substring(0, Math.min(2, institution.length())).toUpperCase();

                    educationList.add(new LinkedInEducationDto(institution, degree, period, logo));
                }
                case "EXPERIENCE" -> {
                    if (isSectionHeader(line)) {
                        i--;
                        currentSection = "OTHER";
                        break;
                    }
                    if (line.toLowerCase().startsWith("page ") || line.startsWith("mailto:") || line.startsWith("http")) {
                        break;
                    }

                    String title = line;
                    String company = "";
                    String period = "";
                    String expLoc = "";
                    String desc = "";

                    if (i + 1 < cleanLines.size() && !isSectionHeader(cleanLines.get(i + 1))) {
                        company = cleanLines.get(i + 1);
                        i++;
                    }
                    if (i + 1 < cleanLines.size() && !isSectionHeader(cleanLines.get(i + 1))) {
                        period = cleanLines.get(i + 1);
                        i++;
                    }

                    experienceList.add(new LinkedInExperienceDto(title, company, period, expLoc, desc));
                }
                case "SUMMARY" -> {
                    if (isSectionHeader(line)) {
                        i--;
                        currentSection = "OTHER";
                        break;
                    }
                    aboutBuilder.append(line).append("\n\n");
                }
            }
        }

        // Fallback dacă nu a găsit numele în HEADER
        if (fullName.isBlank()) {
            for (String l : cleanLines) {
                if (!l.contains("@") && !l.contains("linkedin.com") && !l.startsWith("http") && !isSectionHeader(l) && l.matches(".*[a-zA-ZăâîșțĂÂÎȘȚ].*") && l.split("\\s+").length >= 2 && l.split("\\s+").length <= 3) {
                    fullName = l;
                    break;
                }
            }
        }

        if (fullName.isBlank()) {
            fullName = "Utilizator LinkedIn";
        }
        if (location.isEmpty()) {
            location = "București, România";
        }

        return new LinkedInProfileDto(
                fullName,
                headline.isEmpty() ? "Student / Software Engineer" : headline,
                location,
                email,
                linkedinUrl,
                phone,
                "500+ conexiuni",
                aboutBuilder.toString().trim(),
                educationList,
                experienceList,
                skills,
                languages,
                List.of()
        );
    }

    private boolean isSectionHeader(String line) {
        String lower = line.toLowerCase().trim();
        return lower.equals("contactați") || lower.equals("contact")
                || lower.equals("aptitudini principale") || lower.equals("top skills") || lower.equals("skills")
                || lower.equals("languages") || lower.equals("limbi")
                || lower.equals("studii") || lower.equals("education")
                || lower.equals("experiență") || lower.equals("experience")
                || lower.equals("rezumat") || lower.equals("summary") || lower.equals("despre") || lower.equals("about");
    }

    private boolean isLikelyNameOrHeader(List<String> lines, int currentIndex) {
        if (currentIndex + 1 < lines.size()) {
            String curr = lines.get(currentIndex);
            String next = lines.get(currentIndex + 1);
            // Dacă linia arată ca un nume (2-3 cuvinte cu majusculă) și următoarea conține "Student", "Engineer", "Developer"
            if (curr.split("\\s+").length >= 2 && curr.split("\\s+").length <= 3 && Character.isUpperCase(curr.charAt(0))) {
                String nLower = next.toLowerCase();
                if (nLower.contains("student") || nLower.contains("engineer") || nLower.contains("developer") || nLower.contains("la universitatea")) {
                    return true;
                }
            }
        }
        return false;
    }
}
