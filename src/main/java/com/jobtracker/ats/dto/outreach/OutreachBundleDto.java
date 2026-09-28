package com.jobtracker.ats.dto.outreach;

import java.util.List;

public record OutreachBundleDto(
    String companyName,
    String jobTitle,
    String recruiterName,
    String recruiterSearchUrl,
    String engineeringManagerSearchUrl,
    OutreachMessageDto linkedinNote,
    OutreachMessageDto coldEmail,
    OutreachMessageDto followUp1,
    OutreachMessageDto followUp2,
    OutreachCadenceDto cadence,
    List<String> recruiterBooleanQueries,
    List<String> conversationStarters
) {}
