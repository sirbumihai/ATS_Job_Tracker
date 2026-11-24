package com.jobtracker.ats.crawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.parser.Parser;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;

import static com.jobtracker.ats.util.JobNormalizationUtils.BROWSER_USER_AGENT;

/**
 * Descarcă paginile pentru crawlere. Separat de parsare, ca scraperele să poată fi testate
 * pe HTML salvat fără acces la rețea.
 */
@Component
public class PageFetcher {

    public static final int DEFAULT_TIMEOUT_MS = 10_000;
    // Destul cât paginile să nu se mai descarce una după alta, puțin cât să nu încărcăm site-ul
    public static final int MAX_PARALLEL_REQUESTS_PER_SITE = 4;

    public Document fetchHtml(String url) throws IOException {
        return Jsoup.connect(url)
                .userAgent(BROWSER_USER_AGENT)
                .timeout(DEFAULT_TIMEOUT_MS)
                .get();
    }

    public Document fetchXml(String url, int timeoutMs) throws IOException {
        return Jsoup.connect(url)
                .parser(Parser.xmlParser())
                .userAgent(BROWSER_USER_AGENT)
                .ignoreContentType(true)
                .maxBodySize(0)
                .timeout(timeoutMs)
                .get();
    }

    /**
     * Descarcă în paralel, pe Virtual Threads, paginile aceluiași site (cel mult
     * {@value #MAX_PARALLEL_REQUESTS_PER_SITE} cereri simultane) și le întoarce în ordinea listei,
     * ca deduplicarea să dea același rezultat ca o parcurgere una câte una.
     * O pagină care nu se descarcă nu le oprește pe celelalte.
     */
    public List<FetchedPage> fetchAllHtml(List<String> urls) {
        Semaphore permits = new Semaphore(MAX_PARALLEL_REQUESTS_PER_SITE);
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Document>> downloads = urls.stream()
                    .map(url -> executor.submit(() -> fetchWithPermit(url, permits)))
                    .toList();

            List<FetchedPage> pages = new ArrayList<>(urls.size());
            for (int i = 0; i < urls.size(); i++) {
                pages.add(FetchedPage.await(urls.get(i), downloads.get(i)));
            }
            return pages;
        }
    }

    private Document fetchWithPermit(String url, Semaphore permits) throws IOException, InterruptedException {
        permits.acquire();
        try {
            return fetchHtml(url);
        } finally {
            permits.release();
        }
    }
}
