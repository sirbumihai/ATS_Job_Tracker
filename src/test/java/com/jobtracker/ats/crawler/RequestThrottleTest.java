package com.jobtracker.ats.crawler;

import org.jsoup.HttpStatusException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.net.SocketTimeoutException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

class RequestThrottleTest {

    private static final long BURST_GAP = 250;
    private static final long STEADY_GAP = 800;
    private static final long MAX_GAP = 2_000;

    // Ceas fals: o pauză doar avansează timpul, deci testele nu așteaptă de fapt
    private final AtomicLong now = new AtomicLong(1_000);

    private RequestThrottle throttle() {
        return new RequestThrottle(4, BURST_GAP, STEADY_GAP, MAX_GAP, 0, LinkedInScraper::isRateLimited, now::get, now::addAndGet);
    }

    private static HttpStatusException tooManyRequests() {
        return new HttpStatusException("HTTP error fetching URL", 429, "https://www.linkedin.com/jobs");
    }

    @Test
    @DisplayName("La pornire cererile pleacă în rafală, la intervalul minim una după alta")
    void spacesRequestStarts() throws Exception {
        RequestThrottle throttle = throttle();
        List<Long> starts = new ArrayList<>();

        for (int i = 0; i < 3; i++) {
            throttle.execute(() -> starts.add(now.get()));
        }

        assertEquals(List.of(1_000L, 1_250L, 1_500L), starts);
    }

    @Test
    @DisplayName("La HTTP 429 toate cererile fac o pauză comună, apoi continuă în ritmul constant")
    void rateLimitPausesAndEndsTheBurst() throws Exception {
        RequestThrottle throttle = throttle();

        assertThrows(HttpStatusException.class, () -> throttle.execute(() -> {
            throw tooManyRequests();
        }));
        assertEquals(STEADY_GAP, throttle.currentGapMs());

        long retryStartedAt = throttle.execute(now::get);
        assertEquals(1_000 + RequestThrottle.BASE_COOLDOWN_MS, retryStartedAt);

        // După primul 429 ritmul nu mai revine la rafală
        for (int i = 0; i < 50; i++) {
            throttle.onSuccess();
        }
        assertEquals(STEADY_GAP, throttle.currentGapMs());
    }

    @Test
    @DisplayName("429-urile izolate, cu răspunsuri reușite între ele, nu încetinesc ritmul")
    void isolatedRateLimitsKeepTheSteadyPace() {
        RequestThrottle throttle = throttle();

        for (int wave = 0; wave < 10; wave++) {
            now.addAndGet(10_000);
            throttle.onRateLimited(now.get());
            throttle.onSuccess();
        }

        assertEquals(STEADY_GAP, throttle.currentGapMs());
        assertFalse(throttle.isBlocked());
    }

    @Test
    @DisplayName("Un val de 429 de la cereri pornite înainte de pauză contează o singură dată")
    void burstOfRateLimitsCountsOnce() {
        RequestThrottle throttle = throttle();

        throttle.onRateLimited(1_000);
        throttle.onRateLimited(900);
        throttle.onRateLimited(1_000);
        assertEquals(STEADY_GAP, throttle.currentGapMs());

        // Un 429 nou, pornit după pauză și fără vreun răspuns reușit între timp, dublează pauza
        now.set(5_000);
        throttle.onRateLimited(4_000);
        assertEquals(2 * STEADY_GAP, throttle.currentGapMs());
    }

    @Test
    @DisplayName("429 la rând încetinesc până la maxim, apoi ritmul revine treptat după răspunsuri reușite")
    void consecutiveRateLimitsSlowDownThenRecover() {
        RequestThrottle throttle = throttle();
        for (int wave = 0; wave < RequestThrottle.MAX_BACKOFFS_IN_A_ROW - 1; wave++) {
            now.addAndGet(60_000);
            throttle.onRateLimited(now.get());
        }
        assertEquals(MAX_GAP, throttle.currentGapMs());
        assertFalse(throttle.isBlocked());

        throttle.onSuccess();
        assertEquals(MAX_GAP - RequestThrottle.RECOVERY_STEP_MS, throttle.currentGapMs());
        for (int i = 0; i < 100; i++) {
            throttle.onSuccess();
        }
        assertEquals(STEADY_GAP, throttle.currentGapMs());
    }

    @Test
    @DisplayName("Dacă limitarea continuă, platforma e considerată blocată și cererile nu mai pleacă")
    void stopsAfterRepeatedRateLimits() {
        RequestThrottle throttle = throttle();
        AtomicInteger sent = new AtomicInteger();

        for (int attempt = 0; attempt < RequestThrottle.MAX_BACKOFFS_IN_A_ROW; attempt++) {
            assertThrows(HttpStatusException.class, () -> throttle.execute(() -> {
                sent.incrementAndGet();
                throw tooManyRequests();
            }));
        }

        assertTrue(throttle.isBlocked());
        assertThrows(RequestThrottle.BlockedException.class, () -> throttle.execute(sent::incrementAndGet));
        assertEquals(RequestThrottle.MAX_BACKOFFS_IN_A_ROW, sent.get());
        // Pauzele cresc 2 + 4 + 8 + 16 s; după ultimul 429 nu se mai așteaptă nimic
        assertEquals(1_000 + 2_000 + 4_000 + 8_000 + 16_000, now.get());
    }

    @Test
    @DisplayName("Erorile de rețea repetate opresc rularea, iar un răspuns reușit resetează numărătoarea")
    void stopsAfterRepeatedFailures() throws Exception {
        RequestThrottle throttle = new RequestThrottle(4, 0, 0, 0, 0, LinkedInScraper::isRateLimited, now::get, now::addAndGet);

        for (int i = 0; i < RequestThrottle.MAX_FAILURES_IN_A_ROW - 1; i++) {
            assertThrows(SocketTimeoutException.class, () -> throttle.execute(() -> {
                throw new SocketTimeoutException("Read timed out");
            }));
        }
        throttle.execute(() -> "ok");
        assertFalse(throttle.isBlocked());

        for (int i = 0; i < RequestThrottle.MAX_FAILURES_IN_A_ROW; i++) {
            assertThrows(SocketTimeoutException.class, () -> throttle.execute(() -> {
                throw new SocketTimeoutException("Read timed out");
            }));
        }
        assertTrue(throttle.isBlocked());
    }

    @Test
    @DisplayName("Cel mult maxConcurrent cereri sunt în desfășurare în același timp")
    void limitsConcurrentRequests() {
        RequestThrottle throttle = new RequestThrottle(2, 0, 0, 0, 0, LinkedInScraper::isRateLimited);
        AtomicInteger inFlight = new AtomicInteger();
        AtomicInteger maxInFlight = new AtomicInteger();
        AtomicInteger completed = new AtomicInteger();

        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < 8; i++) {
                executor.submit(() -> throttle.execute(() -> {
                    maxInFlight.accumulateAndGet(inFlight.incrementAndGet(), Math::max);
                    try {
                        Thread.sleep(30);
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                    inFlight.decrementAndGet();
                    return completed.incrementAndGet();
                }));
            }
        }

        assertEquals(8, completed.get());
        assertEquals(2, maxInFlight.get());
    }
}
