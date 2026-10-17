package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static com.jobtracker.ats.util.JobNormalizationUtils.dedupKey;

/**
 * Starea unei rulări de scraping pentru o platformă: lista acumulatoare,
 * deduplicarea titlu + companie și URL-urile deja văzute în rularea curentă.
 */
public final class ScrapeContext {

    private final List<UnifiedJobListingDto> freshList;
    private final Set<String> seenDedupKeys;
    private final Set<String> knownDbUrls;
    private final Set<String> seenUrls = new HashSet<>();

    public ScrapeContext(List<UnifiedJobListingDto> freshList, Set<String> seenDedupKeys, Set<String> knownDbUrls) {
        this.freshList = freshList;
        this.seenDedupKeys = seenDedupKeys;
        this.knownDbUrls = knownDbUrls != null ? knownDbUrls : Set.of();
    }

    public boolean isSeenUrl(String url) {
        return url == null || seenUrls.contains(url);
    }

    public boolean isKnownInDatabase(String url) {
        return url != null && knownDbUrls.contains(url);
    }

    /**
     * Rezervă jobul pentru deduplicare. Întoarce false dacă URL-ul sau perechea titlu + companie
     * a fost deja colectată.
     */
    public boolean claim(String title, String company, String url) {
        if (isSeenUrl(url)) return false;
        boolean added;
        synchronized (seenDedupKeys) {
            added = seenDedupKeys.add(dedupKey(title, company, url));
        }
        if (!added) return false;
        seenUrls.add(url);
        return true;
    }

    public void add(UnifiedJobListingDto job) {
        freshList.add(job);
    }

    public int collectedCount() {
        return seenUrls.size();
    }
}
