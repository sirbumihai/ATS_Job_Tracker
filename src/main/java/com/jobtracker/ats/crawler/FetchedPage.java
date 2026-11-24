package com.jobtracker.ats.crawler;

import org.jsoup.nodes.Document;

import java.io.IOException;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;

/**
 * O pagină descărcată de {@link PageFetcher#fetchAllHtml}: documentul sau eroarea apărută la descărcare.
 */
public final class FetchedPage {

    private final String url;
    private final Document document;
    private final Exception error;

    private FetchedPage(String url, Document document, Exception error) {
        this.url = url;
        this.document = document;
        this.error = error;
    }

    static FetchedPage await(String url, Future<Document> download) {
        try {
            return new FetchedPage(url, download.get(), null);
        } catch (ExecutionException e) {
            return new FetchedPage(url, null, e.getCause() instanceof Exception cause ? cause : e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return new FetchedPage(url, null, e);
        }
    }

    public String url() {
        return url;
    }

    /**
     * @return documentul descărcat
     * @throws IOException eroarea de la descărcare, dacă pagina nu a putut fi adusă
     */
    public Document document() throws IOException {
        if (error == null) return document;
        if (error instanceof IOException io) throw io;
        if (error instanceof RuntimeException runtime) throw runtime;
        throw new IOException(error);
    }
}
