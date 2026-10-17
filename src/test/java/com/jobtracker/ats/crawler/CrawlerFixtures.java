package com.jobtracker.ats.crawler;

import com.jobtracker.ats.dto.UnifiedJobListingDto;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.parser.Parser;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;

/**
 * Încarcă fixture-urile HTML/XML din src/test/resources/crawler pentru testele de parsare.
 */
final class CrawlerFixtures {

    private CrawlerFixtures() {}

    static Document html(String path) {
        return Jsoup.parse(read(path), "");
    }

    static Document xml(String path) {
        return Jsoup.parse(read(path), "", Parser.xmlParser());
    }

    /**
     * Context gol, cu lista acumulatoare expusă pentru verificări.
     */
    static ScrapeContext newContext(List<UnifiedJobListingDto> sink) {
        return new ScrapeContext(sink, new HashSet<>(), new HashSet<>());
    }

    static List<UnifiedJobListingDto> newSink() {
        return new ArrayList<>();
    }

    private static String read(String path) {
        try (InputStream in = CrawlerFixtures.class.getClassLoader().getResourceAsStream("crawler/" + path)) {
            if (in == null) throw new IllegalArgumentException("Fixture inexistent: " + path);
            return new String(in.readAllBytes(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }
}
