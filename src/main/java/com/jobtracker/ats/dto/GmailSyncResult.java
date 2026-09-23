package com.jobtracker.ats.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GmailSyncResult {

    private boolean success;
    private String message;
    private int emailsScanned;
    private int matchedEmails;
    private int updatedApplications;
    private int createdApplications;

    @Builder.Default
    private List<SyncItemDetail> syncDetails = new ArrayList<>();

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SyncItemDetail {
        private String companyName;
        private String jobTitle;
        private String oldStatus;
        private String newStatus;
        private String emailSubject;
        private String sender;
        private LocalDate emailDate;
        private String actionTaken; // "UPDATED", "CREATED", "ALREADY_UP_TO_DATE"
    }
}
