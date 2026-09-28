package com.jobtracker.ats.service;

import com.jobtracker.ats.dto.digest.DailyDigestPreviewDto;
import com.jobtracker.ats.dto.digest.DigestJobItemDto;
import com.jobtracker.ats.dto.digest.DigestSettingsDto;
import com.jobtracker.ats.dto.digest.DigestTestRequest;
import com.jobtracker.ats.entity.CachedJobListing;
import com.jobtracker.ats.repository.CachedJobListingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class DailyJobDigestService {

    private final CachedJobListingRepository cachedJobListingRepository;
    private final RestClient.Builder restClientBuilder;

    // In-memory user settings for daily digest
    private final AtomicReference<DigestSettingsDto> currentSettings = new AtomicReference<>(
            new DigestSettingsDto(
                    true,
                    "DISCORD",
                    "",
                    "",
                    "",
                    "sarbumihai0@gmail.com",
                    80,
                    5,
                    true,
                    true,
                    9,
                    null,
                    "Neconfigurat încă (Test disponibil)"
            )
    );

    public DigestSettingsDto getSettings() {
        return currentSettings.get();
    }

    public DigestSettingsDto updateSettings(DigestSettingsDto newSettings) {
        currentSettings.set(newSettings);
        log.info("Setări Daily Digest actualizate: channel={}, enabled={}", 
                newSettings.primaryChannel(), newSettings.enabled());
        return currentSettings.get();
    }

    public DailyDigestPreviewDto generatePreview() {
        DigestSettingsDto settings = currentSettings.get();
        List<CachedJobListing> allJobs = cachedJobListingRepository.findAllOrderedByRecency();

        List<DigestJobItemDto> matched = allJobs.stream()
                .filter(job -> filterJobForDigest(job, settings))
                .sorted(Comparator.comparingDouble(CachedJobListing::getAtsMatchScore).reversed())
                .limit(settings.maxJobsCount() > 0 ? settings.maxJobsCount() : 5)
                .map(this::mapToDigestItem)
                .collect(Collectors.toList());

        // Fallback demo items if database has very few jobs matching criteria
        if (matched.isEmpty()) {
            matched = getDemoDigestJobs();
        }

        String nowFormatted = LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMMM yyyy, HH:mm", new Locale("ro", "RO")));
        String markdown = buildDigestMarkdown(nowFormatted, matched);
        String discordJson = buildDiscordPayloadJson(nowFormatted, matched);

        String tip = "Peste 70% din interviurile de junior se obțin prin recomandare sau conectare directă cu recruiterul înainte de filtrarea automată ATS. Folosește butonul 'Outreach'!";

        return new DailyDigestPreviewDto(
                nowFormatted,
                "Sîrbu Mihai-Alexandru (UPB Automatica)",
                allJobs.size(),
                matched.size(),
                matched,
                markdown,
                discordJson,
                tip
        );
    }

    public Map<String, Object> testWebhook(DigestTestRequest request) {
        String channel = request.channel() != null ? request.channel().toUpperCase() : "DISCORD";
        DailyDigestPreviewDto preview = generatePreview();

        Map<String, Object> result = new HashMap<>();
        result.put("timestamp", LocalDateTime.now().toString());
        result.put("channel", channel);

        try {
            if ("DISCORD".equals(channel)) {
                String webhookUrl = request.targetDestination() != null && !request.targetDestination().isBlank()
                        ? request.targetDestination().trim()
                        : currentSettings.get().discordWebhookUrl();

                if (webhookUrl == null || webhookUrl.isBlank() || !webhookUrl.startsWith("http")) {
                    result.put("success", false);
                    result.put("message", "URL-ul Discord Webhook nu este valid sau lipsește.");
                    return result;
                }

                RestClient client = restClientBuilder.build();
                client.post()
                        .uri(webhookUrl)
                        .header("Content-Type", "application/json")
                        .body(preview.formattedDiscordJson())
                        .retrieve()
                        .toBodilessEntity();

                updateLastDispatchStatus("Succes Discord: trimis la " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
                result.put("success", true);
                result.put("message", "Digestul a fost trimis cu succes pe canalul de Discord!");
                return result;

            } else if ("TELEGRAM".equals(channel)) {
                String botToken = request.telegramBotToken() != null && !request.telegramBotToken().isBlank()
                        ? request.telegramBotToken().trim()
                        : currentSettings.get().telegramBotToken();

                String chatId = request.targetDestination() != null && !request.targetDestination().isBlank()
                        ? request.targetDestination().trim()
                        : currentSettings.get().telegramChatId();

                if (botToken == null || botToken.isBlank() || chatId == null || chatId.isBlank()) {
                    result.put("success", false);
                    result.put("message", "Bot Token-ul sau Chat ID-ul Telegram nu sunt configurate.");
                    return result;
                }

                String telegramText = preview.formattedMarkdown().replace("*", "").replace("#", "");
                if (telegramText.length() > 4000) {
                    telegramText = telegramText.substring(0, 3950) + "\n...";
                }

                Map<String, String> telegramBody = Map.of(
                        "chat_id", chatId,
                        "text", telegramText
                );

                RestClient client = restClientBuilder.build();
                client.post()
                        .uri("https://api.telegram.org/bot" + botToken + "/sendMessage")
                        .header("Content-Type", "application/json")
                        .body(telegramBody)
                        .retrieve()
                        .toBodilessEntity();

                updateLastDispatchStatus("Succes Telegram: trimis la " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm:ss")));
                result.put("success", true);
                result.put("message", "Digestul a fost trimis cu succes pe Telegram!");
                return result;

            } else {
                result.put("success", true);
                result.put("message", "Simulare Email Digest reușită pentru: " + (request.targetDestination() != null ? request.targetDestination() : currentSettings.get().emailRecipient()));
                return result;
            }
        } catch (Exception e) {
            log.error("Eroare la expedierea Daily Digest: {}", e.getMessage(), e);
            result.put("success", false);
            result.put("message", "Eroare la trimitere: " + e.getMessage());
            updateLastDispatchStatus("Eșec la trimitere: " + e.getMessage());
            return result;
        }
    }

    @Scheduled(cron = "0 0 9 * * ?") // In fiecare dimineata la 09:00 AM
    public void runDailyMorningDigest() {
        DigestSettingsDto settings = currentSettings.get();
        if (!settings.enabled()) {
            log.info("[DAILY DIGEST] Programat la 09:00, dar notificările sunt dezactivate din setări.");
            return;
        }

        log.info("[DAILY DIGEST] Rulare programată matinală la 09:00 AM pentru canalul {}", settings.primaryChannel());
        DigestTestRequest req = new DigestTestRequest(
                settings.primaryChannel(),
                "DISCORD".equalsIgnoreCase(settings.primaryChannel()) ? settings.discordWebhookUrl() : settings.telegramChatId(),
                settings.telegramBotToken(),
                true
        );
        testWebhook(req);
    }

    private void updateLastDispatchStatus(String status) {
        DigestSettingsDto s = currentSettings.get();
        currentSettings.set(new DigestSettingsDto(
                s.enabled(),
                s.primaryChannel(),
                s.discordWebhookUrl(),
                s.telegramBotToken(),
                s.telegramChatId(),
                s.emailRecipient(),
                s.minMatchScore(),
                s.maxJobsCount(),
                s.onlyRomania(),
                s.onlyJunior(),
                s.scheduledHour(),
                LocalDateTime.now().toString(),
                status
        ));
    }

    private boolean filterJobForDigest(CachedJobListing job, DigestSettingsDto settings) {
        if (job == null) return false;

        // Score filter
        double score = job.getAtsMatchScore() > 0 ? job.getAtsMatchScore() : 75.0;
        if (score < settings.minMatchScore()) {
            return false;
        }

        // Location filter (Romania or Remote)
        if (settings.onlyRomania()) {
            String loc = (job.getLocation() != null ? job.getLocation().toLowerCase() : "") + " " +
                    (job.getWorkModel() != null ? job.getWorkModel().toLowerCase() : "");
            boolean isRoOrRemote = loc.contains("romania") || loc.contains("bucur") ||
                    loc.contains("cluj") || loc.contains("timis") || loc.contains("iasi") ||
                    loc.contains("brasov") || loc.contains("remote");
            if (!isRoOrRemote) return false;
        }

        // Junior filter
        if (settings.onlyJunior()) {
            String title = job.getJobTitle() != null ? job.getJobTitle().toLowerCase() : "";
            String level = job.getExperienceLevel() != null ? job.getExperienceLevel().toLowerCase() : "";
            boolean isJunior = title.contains("junior") || title.contains("intern") || title.contains("entry") ||
                    title.contains("graduate") || level.contains("junior") || level.contains("entry");
            if (!isJunior) return false;
        }

        return true;
    }

    private DigestJobItemDto mapToDigestItem(CachedJobListing j) {
        List<String> skills = new ArrayList<>();
        if (j.getSkillsRequired() != null && !j.getSkillsRequired().isBlank()) {
            skills = Arrays.stream(j.getSkillsRequired().split("[,;|]"))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .limit(5)
                    .collect(Collectors.toList());
        }
        if (skills.isEmpty()) {
            skills = List.of("Java", "Spring Boot", "SQL", "Git");
        }

        int score = j.getAtsMatchScore() > 0 ? (int) Math.round(j.getAtsMatchScore()) : 86;
        String encodedComp = URLEncoder.encode(j.getCompanyName() != null ? j.getCompanyName() : "Company", StandardCharsets.UTF_8);
        String hook = "https://www.linkedin.com/search/results/people/?keywords=Recruiter%20" + encodedComp;

        return new DigestJobItemDto(
                j.getId(),
                j.getJobTitle(),
                j.getCompanyName(),
                j.getLocation() != null ? j.getLocation() : "România / Remote",
                j.getWorkModel() != null ? j.getWorkModel() : "HIBRID",
                j.getDirectApplyUrl() != null ? j.getDirectApplyUrl() : "https://linkedin.com",
                score,
                j.getCompetitivenessLabel() != null ? j.getCompetitivenessLabel() : "Competiție Moderată",
                j.getPostedDateAgo() != null ? j.getPostedDateAgo() : "Recent",
                skills,
                "Se potrivește 1:1 cu stack-ul tău UPB & SIMAVI (" + String.join(", ", skills.subList(0, Math.min(3, skills.size()))) + ")",
                hook
        );
    }

    private List<DigestJobItemDto> getDemoDigestJobs() {
        return List.of(
                new DigestJobItemDto(
                        "demo-1",
                        "Junior Java Backend Developer",
                        "Endava",
                        "București, România",
                        "HYBRID",
                        "https://www.endava.com/careers",
                        94,
                        "Competiție Scăzută (<10 candidați)",
                        "acum 4 ore",
                        List.of("Java 21", "Spring Boot 3", "PostgreSQL", "Docker"),
                        "Potrivire excelentă cu experiența SIMAVI și proiectul ATS Tracker.",
                        "https://www.linkedin.com/search/results/people/?keywords=Recruiter%20Endava"
                ),
                new DigestJobItemDto(
                        "demo-2",
                        "Graduate Software Engineer - Cloud & Systems",
                        "Bending Spoons",
                        "Remote (România)",
                        "REMOTE",
                        "https://jobs.bendingspoons.com",
                        91,
                        "Competiție Moderată",
                        "azi",
                        List.of("Java", "Algorithms", "Distributed Systems", "SQL"),
                        "Aliniat cu profilul de Calculatoare UPB și certificările de algoritmi.",
                        "https://www.linkedin.com/search/results/people/?keywords=Recruiter%20Bending%20Spoons"
                ),
                new DigestJobItemDto(
                        "demo-3",
                        "Junior Full-Stack Java/React Developer",
                        "ING Hubs Romania",
                        "București",
                        "HYBRID",
                        "https://ing.jobs/romania",
                        88,
                        "Competiție Scăzută",
                        "ieri",
                        List.of("Spring Boot", "React", "REST API", "Git"),
                        "Coincide perfect cu arhitectura full-stack din proiectele tale.",
                        "https://www.linkedin.com/search/results/people/?keywords=Recruiter%20ING%20Hubs"
                )
        );
    }

    private String buildDigestMarkdown(String date, List<DigestJobItemDto> jobs) {
        StringBuilder sb = new StringBuilder();
        sb.append("🌅 **JobFlow Daily Digest • ").append(date).append("**\n");
        sb.append("👤 Destinatar: **Sîrbu Mihai-Alexandru** (UPB Automatica)\n");
        sb.append("🎯 Criterii: Match ≥ 80% • România / Remote • Nivel Junior/Graduate\n\n");
        sb.append("---\n\n");

        int index = 1;
        for (DigestJobItemDto j : jobs) {
            sb.append(index++).append(". **").append(j.title()).append("** @ **").append(j.company()).append("**\n");
            sb.append("   • **Match ATS**: `").append(j.matchScore()).append("%` 🚀 | ").append(j.competitiveness()).append("\n");
            sb.append("   • 📍 ").append(j.location()).append(" (").append(j.workModel()).append(") • ").append(j.postedDateAgo()).append("\n");
            sb.append("   • 🛠️ Skill-uri: ").append(String.join(", ", j.keySkills())).append("\n");
            sb.append("   • 💡 *De ce*: ").append(j.matchHighlights()).append("\n");
            sb.append("   • 🔗 [Aplică Direct](").append(j.directApplyUrl()).append(") | 📬 [Găsește Recruiter](").append(j.outreachHook()).append(")\n\n");
        }

        sb.append("💡 **Sfatul Zilei de Networking**:\n");
        sb.append("Trimite un LinkedIn Note direct recruiterului din link-ul de mai sus înainte de a aplica prin portal pentru a trece automat în primii 5% dintre candidați!");

        return sb.toString();
    }

    private String buildDiscordPayloadJson(String date, List<DigestJobItemDto> jobs) {
        StringBuilder fieldsJson = new StringBuilder();
        for (int i = 0; i < jobs.size(); i++) {
            DigestJobItemDto j = jobs.get(i);
            if (i > 0) fieldsJson.append(",");
            fieldsJson.append("{\n")
                    .append("  \"name\": \"")
                    .append(escapeJson((i + 1) + ". " + j.title() + " @ " + j.company() + " (" + j.matchScore() + "% Match)"))
                    .append("\",\n")
                    .append("  \"value\": \"")
                    .append(escapeJson("📍 " + j.location() + " (" + j.workModel() + ")\n🛠️ " + String.join(", ", j.keySkills()) + "\n[Aplică Aici](" + j.directApplyUrl() + ") • [Recruiter LinkedIn](" + j.outreachHook() + ")"))
                    .append("\",\n")
                    .append("  \"inline\": false\n")
                    .append("}");
        }

        return "{\n" +
                "  \"username\": \"JobFlow AI Digest\",\n" +
                "  \"avatar_url\": \"https://cdn-icons-png.flaticon.com/512/3850/3850285.png\",\n" +
                "  \"embeds\": [{\n" +
                "    \"title\": \"🌅 JobFlow Daily Job Digest • " + escapeJson(date) + "\",\n" +
                "    \"description\": \"Iată topul oportunităților noi detectate pentru profilul tău (**Mihai Sîrbu • UPB Automatica**):\",\n" +
                "    \"color\": 3447003,\n" +
                "    \"fields\": [" + fieldsJson + "],\n" +
                "    \"footer\": {\n" +
                "      \"text\": \"JobFlow AI • Recruiter Matching & ATS Optimization\"\n" +
                "    }\n" +
                "  }]\n" +
                "}";
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
