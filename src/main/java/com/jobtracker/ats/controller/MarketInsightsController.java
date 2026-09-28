package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.MarketDomainDto;
import com.jobtracker.ats.dto.MarketInsightsResponse;
import com.jobtracker.ats.service.MarketInsightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/market-insights")
@RequiredArgsConstructor
@Slf4j
public class MarketInsightsController {

    private final MarketInsightsService marketInsightsService;

    @GetMapping
    public ResponseEntity<MarketInsightsResponse> getInsights(
            @RequestParam(required = false, defaultValue = "JUNIOR") String level,
            @RequestParam(required = false, defaultValue = "RO_ONLY") String location,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) UUID userId
    ) {
        UUID effectiveUserId = headerUserId != null ? headerUserId : userId;
        log.info("[MARKET CONTROLLER] Cerere statistici piață IT pentru nivel: {}, location: {}, activeOnly: {}, user: {}",
                level, location, activeOnly, effectiveUserId);
        MarketInsightsResponse response = marketInsightsService.getMarketInsights(level, location, activeOnly, effectiveUserId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/domains/{domainId}")
    public ResponseEntity<MarketDomainDto> getDomainDetails(
            @PathVariable String domainId,
            @RequestParam(required = false, defaultValue = "JUNIOR") String level,
            @RequestParam(required = false, defaultValue = "RO_ONLY") String location,
            @RequestHeader(value = "X-User-Id", required = false) UUID headerUserId,
            @RequestParam(required = false) UUID userId
    ) {
        UUID effectiveUserId = headerUserId != null ? headerUserId : userId;
        log.info("[MARKET CONTROLLER] Detalii domeniu {} pentru nivel {}, location {}, user {}",
                domainId, level, location, effectiveUserId);
        MarketDomainDto domain = marketInsightsService.getDomainDetails(domainId, level, location, effectiveUserId);
        return ResponseEntity.ok(domain);
    }
}
