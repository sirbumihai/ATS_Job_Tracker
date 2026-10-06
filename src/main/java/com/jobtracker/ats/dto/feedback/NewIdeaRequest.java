package com.jobtracker.ats.dto.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NewIdeaRequest {
    private String title;
    private String description;
    private String category;
    private String authorName;
    private String authorEmail;
}
