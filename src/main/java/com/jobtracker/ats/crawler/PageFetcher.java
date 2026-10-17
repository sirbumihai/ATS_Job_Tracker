package com.jobtracker.ats.crawler;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.parser.Parser;
import org.springframework.stereotype.Component;

import java.io.IOException;

import static com.jobtracker.ats.util.JobNormalizationUtils.BROWSER_USER_AGENT;

/**
 * Descarcă paginile pentru crawlere. Separat de parsare, ca scraperele să poată fi testate
 * pe HTML salvat fără acces la rețea.
 */
@Component
public class PageFetcher {

    public static final int DEFAULT_TIMEOUT_MS = 10_000;

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
}
