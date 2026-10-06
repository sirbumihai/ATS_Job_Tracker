package com.jobtracker.ats.dto.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommunityIdeaDto {
    private UUID id;
    private String title;
    private String description;
    private String category;
    private String authorName;
    private Integer votesCount;
    private String status;
    private Boolean hasVoted;
    private OffsetDateTime createdAt;
}
