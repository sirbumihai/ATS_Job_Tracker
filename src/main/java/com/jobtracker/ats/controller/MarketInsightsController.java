package com.jobtracker.ats.controller;

import com.jobtracker.ats.dto.MarketDomainDto;
import com.jobtracker.ats.dto.MarketInsightsResponse;
import com.jobtracker.ats.service.MarketInsightsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/market-insights")
@RequiredArgsConstructor
@Slf4j
public class MarketInsightsController {

    private final MarketInsightsService marketInsightsService;

    @GetMapping
    public ResponseEntity<MarketInsightsResponse> getInsights(
            @RequestParam(required = false, defaultValue = "JUNIOR") String level,
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        log.info("[MARKET CONTROLLER] Cerere statistici piață IT pentru nivel: {}, activeOnly: {}", level, activeOnly);
        MarketInsightsResponse response = marketInsightsService.getMarketInsights(level, activeOnly);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/domains/{domainId}")
    public ResponseEntity<MarketDomainDto> getDomainDetails(
            @PathVariable String domainId,
            @RequestParam(required = false, defaultValue = "JUNIOR") String level
    ) {
        log.info("[MARKET CONTROLLER] Detalii domeniu {} pentru nivel {}", domainId, level);
        MarketDomainDto domain = marketInsightsService.getDomainDetails(domainId, level);
        return ResponseEntity.ok(domain);
    }
}
