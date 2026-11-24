package com.jobtracker.ats.crawler;

import java.io.IOException;
import java.util.concurrent.Semaphore;
import java.util.concurrent.ThreadLocalRandom;
import java.util.function.LongSupplier;
import java.util.function.Predicate;

/**
 * Dozează cererile pe care mai multe fire (Virtual Threads) le trimit aceleiași platforme:
 * cel mult {@code maxConcurrent} cereri simultane și o pauză minimă între pornirea a două cereri.
 * <p>
 * Pornește în rafală ({@code burstGapMs} între cereri). La primul răspuns „prea multe cereri”
 * (HTTP 429) trece pe ritmul constant {@code steadyGapMs}, iar toate firele fac o pauză comună
 * înainte de a reîncerca. Un 429 izolat nu încetinește mai mult; doar 429 la rând, fără niciun
 * răspuns reușit între ele, dublează pauza dintre cereri (până la {@code maxGapMs}), care apoi
 * revine treptat după răspunsuri reușite.
 * Platforma e considerată blocată după {@value #MAX_BACKOFFS_IN_A_ROW} pauze la rând sau după
 * {@value #MAX_FAILURES_IN_A_ROW} cereri eșuate la rând din alte motive (timeout, rețea, 5xx);
 * de atunci cererile sunt refuzate cu {@link BlockedException}, ca rularea să se termine repede.
 */
final class RequestThrottle {

    static final long BASE_COOLDOWN_MS = 2_000;
    static final long MAX_COOLDOWN_MS = 30_000;
    static final int MAX_BACKOFFS_IN_A_ROW = 5;
    static final int MAX_FAILURES_IN_A_ROW = 12;
    static final long RECOVERY_STEP_MS = 50;

    @FunctionalInterface
    interface Request<T> {
        T send() throws IOException;
    }

    @FunctionalInterface
    interface Sleeper {
        void sleep(long millis) throws InterruptedException;
    }

    /** Platforma refuză sau nu răspunde de prea multe ori la rând; alte cereri n-ar mai aduce nimic. */
    static final class BlockedException extends IOException {
        BlockedException() {
            super("Platforma refuză sau nu răspunde la cereri de prea multe ori la rând");
        }
    }

    private final Semaphore permits;
    private final long steadyGapMs;
    private final long maxGapMs;
    private final long jitterMs;
    private final Predicate<IOException> isRateLimited;
    private final LongSupplier clock;
    private final Sleeper sleeper;

    // Stare comună tuturor firelor, protejată de monitorul obiectului
    private long gapMs;
    private long minGapMs;
    private long nextStartAt;
    private long cooldownUntil;
    private long lastBackoffAt = Long.MIN_VALUE;
    private int backoffsInARow;
    private int failuresInARow;

    RequestThrottle(int maxConcurrent, long burstGapMs, long steadyGapMs, long maxGapMs, long jitterMs,
                    Predicate<IOException> isRateLimited) {
        this(maxConcurrent, burstGapMs, steadyGapMs, maxGapMs, jitterMs, isRateLimited,
                System::currentTimeMillis, Thread::sleep);
    }

    RequestThrottle(int maxConcurrent, long burstGapMs, long steadyGapMs, long maxGapMs, long jitterMs,
                    Predicate<IOException> isRateLimited, LongSupplier clock, Sleeper sleeper) {
        this.permits = new Semaphore(maxConcurrent);
        this.steadyGapMs = Math.max(burstGapMs, steadyGapMs);
        this.maxGapMs = Math.max(this.steadyGapMs, maxGapMs);
        this.jitterMs = jitterMs;
        this.isRateLimited = isRateLimited;
        this.clock = clock;
        this.sleeper = sleeper;
        this.gapMs = burstGapMs;
        this.minGapMs = burstGapMs;
    }

    /**
     * Trimite cererea când îi vine rândul. Rezultatul (reușită, limitare, eroare) ajustează ritmul
     * pentru toate firele, apoi eroarea e aruncată mai departe, ca apelantul să decidă dacă reîncearcă.
     */
    <T> T execute(Request<T> request) throws IOException, InterruptedException {
        permits.acquire();
        try {
            long startedAt = awaitTurn();
            try {
                T response = request.send();
                onSuccess();
                return response;
            } catch (IOException e) {
                if (isRateLimited.test(e)) {
                    onRateLimited(startedAt);
                } else {
                    onFailure();
                }
                throw e;
            }
        } finally {
            permits.release();
        }
    }

    synchronized boolean isBlocked() {
        return backoffsInARow >= MAX_BACKOFFS_IN_A_ROW || failuresInARow >= MAX_FAILURES_IN_A_ROW;
    }

    synchronized long currentGapMs() {
        return gapMs;
    }

    synchronized void onSuccess() {
        backoffsInARow = 0;
        failuresInARow = 0;
        gapMs = Math.max(minGapMs, gapMs - RECOVERY_STEP_MS);
    }

    synchronized void onFailure() {
        failuresInARow++;
    }

    synchronized void onRateLimited(long requestStartedAt) {
        // Cererile pornite înaintea ultimei pauze sunt din același val: pauza le acoperă deja
        if (requestStartedAt <= lastBackoffAt) return;

        long now = clock.getAsLong();
        lastBackoffAt = now;
        backoffsInARow++;
        // Rafala de la pornire s-a terminat: de aici ritmul nu mai coboară sub steadyGapMs
        minGapMs = steadyGapMs;
        gapMs = backoffsInARow == 1 ? Math.max(gapMs, steadyGapMs) : Math.min(maxGapMs, gapMs * 2);
        if (!isBlocked()) {
            long cooldown = Math.min(MAX_COOLDOWN_MS, BASE_COOLDOWN_MS << (backoffsInARow - 1));
            cooldownUntil = Math.max(cooldownUntil, now + cooldown);
        }
    }

    // Așteaptă să treacă pauza comună și intervalul minim de la pornirea cererii anterioare
    private long awaitTurn() throws InterruptedException, BlockedException {
        while (true) {
            long waitMs;
            synchronized (this) {
                if (isBlocked()) throw new BlockedException();
                long now = clock.getAsLong();
                long readyAt = Math.max(nextStartAt, cooldownUntil);
                if (now >= readyAt) {
                    nextStartAt = now + gapMs + randomJitter();
                    return now;
                }
                waitMs = readyAt - now;
            }
            sleeper.sleep(waitMs);
        }
    }

    private long randomJitter() {
        return jitterMs > 0 ? ThreadLocalRandom.current().nextLong(jitterMs + 1) : 0;
    }
}
