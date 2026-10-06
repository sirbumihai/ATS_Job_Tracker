package com.jobtracker.ats.service;

import com.jobtracker.ats.entity.CommunityIdea;
import com.jobtracker.ats.entity.FeedbackSubmission;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
@Slf4j
public class EmailNotificationService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.feedback.recipient-email:sarbumihai0@gmail.com}")
    private String recipientEmail;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public boolean sendFeedbackNotification(FeedbackSubmission feedback) {
        log.info("[FEEDBACK EMAIL] Notificare receptie feedback pentru {} de la '{}' <{}>. Categorie: {}",
                recipientEmail, feedback.getAuthorName(), feedback.getAuthorEmail(), feedback.getCategory());

        if (mailSender == null || mailUsername == null || mailUsername.trim().isEmpty()) {
            log.info("[FEEDBACK EMAIL] Serverul SMTP nu are credentiale active in .env (SPRING_MAIL_USERNAME / SPRING_MAIL_PASSWORD). Mesajul este salvat in baza de date PostgreSQL.");
            return false;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailUsername);
            msg.setTo(recipientEmail);
            msg.setSubject("[JobFlow AI Feedback] [" + feedback.getCategory() + "] " + feedback.getTitle());
            
            String timestamp = feedback.getCreatedAt() != null 
                    ? feedback.getCreatedAt().format(DateTimeFormatter.ISO_OFFSET_DATE_TIME) 
                    : "Acum";

            String body = String.format(
                    "Ai primit un feedback nou pe platforma JobFlow AI:\n\n" +
                    "Autor: %s\n" +
                    "Email Contact: %s\n" +
                    "Categorie: %s\n" +
                    "Rating Satisfactie: %s/5 stele\n" +
                    "Subiect: %s\n\n" +
                    "Mesaj Detaliat:\n%s\n\n" +
                    "Partajat in Comunitate: %s\n" +
                    "Data Transmiterii: %s\n\n" +
                    "---\n" +
                    "Trimis automat de JobFlow AI Engine",
                    feedback.getAuthorName() != null ? feedback.getAuthorName() : "Anonim",
                    feedback.getAuthorEmail() != null ? feedback.getAuthorEmail() : "Nespecificat",
                    feedback.getCategory(),
                    feedback.getRating() != null ? feedback.getRating().toString() : "5",
                    feedback.getTitle(),
                    feedback.getMessage(),
                    Boolean.TRUE.equals(feedback.getShareInCommunity()) ? "DA (Apare in roadmap-ul comunitar)" : "NU",
                    timestamp
            );

            msg.setText(body);
            mailSender.send(msg);
            log.info("[FEEDBACK EMAIL] Email trimis cu succes catre {}", recipientEmail);
            return true;
        } catch (Exception e) {
            log.warn("[FEEDBACK EMAIL] Trimiterea SMTP a esuat catre {}: {}. Feedback-ul ramane salvat in DB.", recipientEmail, e.getMessage());
            return false;
        }
    }

    public boolean sendNewIdeaNotification(CommunityIdea idea) {
        log.info("[COMMUNITY IDEA EMAIL] Notificare idee noua propusa: '{}' de catre '{}'",
                idea.getTitle(), idea.getAuthorName());

        if (mailSender == null || mailUsername == null || mailUsername.trim().isEmpty()) {
            return false;
        }

        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom(mailUsername);
            msg.setTo(recipientEmail);
            msg.setSubject("[JobFlow AI Comunitate] Idee noua: " + idea.getTitle());

            String body = String.format(
                    "O idee noua a fost adaugata pe Roadmap-ul Comunitar JobFlow AI:\n\n" +
                    "Titlu: %s\n" +
                    "Categorie: %s\n" +
                    "Autor: %s (%s)\n\n" +
                    "Descriere:\n%s\n\n" +
                    "Voturi Initiale: %d\n" +
                    "Status: %s\n\n" +
                    "---\n" +
                    "Trimis automat de JobFlow AI Engine",
                    idea.getTitle(),
                    idea.getCategory(),
                    idea.getAuthorName() != null ? idea.getAuthorName() : "Comunitate",
                    idea.getAuthorEmail() != null ? idea.getAuthorEmail() : "Nespecificat",
                    idea.getDescription(),
                    idea.getVotesCount(),
                    idea.getStatus()
            );

            msg.setText(body);
            mailSender.send(msg);
            log.info("[COMMUNITY IDEA EMAIL] Email trimis cu succes catre {}", recipientEmail);
            return true;
        } catch (Exception e) {
            log.warn("[COMMUNITY IDEA EMAIL] Trimiterea SMTP a esuat catre {}: {}", recipientEmail, e.getMessage());
            return false;
        }
    }
}
