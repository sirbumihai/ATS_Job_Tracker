package com.jobtracker.ats.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("AI-Powered Job Tracker & ATS Matcher API")
                        .version("1.0.0")
                        .description("Sistem Backend Enterprise pentru gestionarea aplicațiilor la joburi, parsarea CV-urilor PDF cu Apache Tika, căutare semantică cu PostgreSQL pgvector și analiza asincronă AI Gap.")
                        .contact(new Contact()
                                .name("Alexandru Sîrbu")
                                .email("sarbumihai0@gmail.com")
                                .url("https://github.com/sirbumihai"))
                        .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")));
    }
}
