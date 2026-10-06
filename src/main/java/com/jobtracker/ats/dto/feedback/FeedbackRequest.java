package com.jobtracker.ats.dto.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackRequest {
    private String name;
    private String email;
    private String category;
    private Integer rating;
    private String title;
    private String message;
    private Boolean shareInCommunity;
}
