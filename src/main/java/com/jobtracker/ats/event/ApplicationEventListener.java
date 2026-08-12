package com.jobtracker.ats.event;

import com.jobtracker.ats.service.AiGapAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ApplicationEventListener {

    private final AiGapAnalysisService aiGapAnalysisService;

    @Async("asyncExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleApplicationCreated(ApplicationCreatedEvent event) {
        log.info("[BACKGROUND ASYNC WORKER] Procesam analiza AI Gap pentru aplicatia ID: {}", event.applicationId());
        try {
            aiGapAnalysisService.generateAnalysis(event.applicationId());
            log.info("[BACKGROUND ASYNC WORKER] Analiza AI Gap a fost salvata cu succes!");
        } catch (Exception e) {
            log.error("[BACKGROUND ASYNC WORKER] Eroare la generarea analizei AI: {}", e.getMessage(), e);
        }
    }
}
