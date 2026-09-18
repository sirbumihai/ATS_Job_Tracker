package com.jobtracker.ats.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

/**
 * Răspuns paginat pentru căutarea și filtrarea joburilor live.
 * Reduce drastic dimensiunea payload-ului HTTP returnând doar cardurile din pagina curentă
 * și metadatele aferente paginării.
 */
public record JobSearchResponse(
    List<UnifiedJobListingDto> content,
    int currentPage,
    int pageSize,
    long totalElements,
    int totalPages,
    boolean hasNext,
    boolean hasPrevious
) {
    /**
     * Alias pentru content, pentru compatibilitate directă cu proprietatea "jobs" din frontend.
     */
    @JsonProperty("jobs")
    public List<UnifiedJobListingDto> jobs() {
        return content;
    }
}
