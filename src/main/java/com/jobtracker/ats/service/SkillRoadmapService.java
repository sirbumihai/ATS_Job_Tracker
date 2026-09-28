package com.jobtracker.ats.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.jobtracker.ats.dto.roadmap.*;
import com.jobtracker.ats.entity.CvProfile;
import com.jobtracker.ats.repository.CvProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class SkillRoadmapService {

    private final CvProfileRepository cvProfileRepository;
    private final OpenAiLlmService openAiLlmService;
    private final ObjectMapper objectMapper;

    private static final UUID DEFAULT_USER_ID = UUID.fromString("23fe8bdd-08f4-413d-9985-f99c21040b59");

    public List<RoadmapSummaryDto> getCatalog() {
        return List.of(
                new RoadmapSummaryDto(
                        "kafka",
                        "Apache Kafka",
                        "kafka",
                        "Event Streaming & Message Brokers",
                        "Cerut în 48% din rolurile de Java Backend (România)",
                        "Intermediar-Avansat",
                        7,
                        "Învață arhitectura de streaming, Docker cluster setup, integrări @KafkaListener în Spring Boot 3 și pattern-ul Dead Letter Queue."
                ),
                new RoadmapSummaryDto(
                        "redis",
                        "Redis & Distributed Caching",
                        "redis",
                        "In-Memory Caching & Performance",
                        "Cerut în 54% din rolurile de backend cu trafic ridicat",
                        "Intermediar",
                        7,
                        "Stăpânește structurile in-memory, politicile TTL, adnotările @Cacheable din Spring Boot și lock-urile distribuite cu Redisson."
                ),
                new RoadmapSummaryDto(
                        "docker",
                        "Docker & Multi-Stage Builds",
                        "docker",
                        "DevOps & Containerization",
                        "Cerut în 88% din anunțurile pentru Software Engineers în România",
                        "Esențial",
                        7,
                        "De la concepte de bază până la Dockerfile multi-stage production-grade pentru Java 21, rețele bridge și docker-compose complex."
                ),
                new RoadmapSummaryDto(
                        "kubernetes",
                        "Kubernetes for Developers (K8s)",
                        "kubernetes",
                        "Cloud-Native Orchestration",
                        "Cerut în 42% din proiectele enterprise & cloud",
                        "Avansat",
                        7,
                        "Înțelege Pods, Deployments, Services, ConfigMaps, Secrets, Liveness/Readiness probes și rulare locală pe Minikube/Kind."
                ),
                new RoadmapSummaryDto(
                        "microservices",
                        "Microservices & Resilience4j",
                        "microservices",
                        "Distributed Systems Architecture",
                        "Standardul industriei pentru 72% din marile companii IT",
                        "Avansat",
                        7,
                        "Construiește sisteme distribuite rezistente: API Gateway, comunicare REST/Kafka, Circuit Breaker, Retries și Distributed Tracing."
                )
        );
    }

    public SkillRoadmapDto getRoadmap(String skillId) {
        String key = skillId != null ? skillId.toLowerCase().trim() : "kafka";
        return switch (key) {
            case "kafka", "apache-kafka" -> buildKafkaRoadmap();
            case "redis", "caching" -> buildRedisRoadmap();
            case "docker", "containers" -> buildDockerRoadmap();
            case "kubernetes", "k8s" -> buildKubernetesRoadmap();
            case "microservices", "resilience4j" -> buildMicroservicesRoadmap();
            default -> generateOrFallbackRoadmap(skillId);
        };
    }

    public SkillRoadmapDto generateCustomRoadmap(RoadmapGenerateRequest request) {
        String skill = request.skillName() != null && !request.skillName().isBlank()
                ? request.skillName().trim() : "Microservices Architecture";

        if (openAiLlmService.isConfigured()) {
            try {
                return generateWithAi(skill, request.targetRole(), request.focusArea());
            } catch (Exception e) {
                log.warn("Eroare la generare AI roadmap pentru {}, folosim generatorul determinist: {}", skill, e.getMessage());
            }
        }
        return generateOrFallbackRoadmap(skill);
    }

    @Transactional
    public Map<String, Object> addSkillToCv(AddSkillToCvRequest request) {
        UUID cvId = request.cvProfileId();
        Optional<CvProfile> profileOpt = cvId != null
                ? cvProfileRepository.findById(cvId)
                : cvProfileRepository.findFirstByUserIdAndIsPrimaryTrue(DEFAULT_USER_ID)
                .or(() -> cvProfileRepository.findFirstByUserIdOrderByUpdatedAtDesc(DEFAULT_USER_ID));

        if (profileOpt.isEmpty()) {
            return Map.of("success", false, "message", "Niciun profil CV găsit pentru asociere.");
        }

        CvProfile profile = profileOpt.get();

        // 1. Add skill to skillsFrameworks or skillsDevops
        String skillName = request.skillName();
        String currentFrameworks = profile.getSkillsFrameworks() != null ? profile.getSkillsFrameworks() : "";
        if (!currentFrameworks.toLowerCase().contains(skillName.toLowerCase())) {
            profile.setSkillsFrameworks(currentFrameworks.isBlank() ? skillName : currentFrameworks + ", " + skillName);
        }

        // 2. Add Capstone Project to projectsJson
        try {
            List<Map<String, Object>> projects = new ArrayList<>();
            if (profile.getProjectsJson() != null && !profile.getProjectsJson().isBlank()) {
                projects = objectMapper.readValue(profile.getProjectsJson(), new TypeReference<>() {});
            }

            Map<String, Object> newProj = new HashMap<>();
            newProj.put("name", request.projectTitle() != null ? request.projectTitle() : "Proiect Practic " + skillName);
            newProj.put("description", request.projectDescription() != null ? request.projectDescription() : request.cvBulletPoint());
            newProj.put("technologies", request.technologiesUsed() != null ? request.technologiesUsed() : skillName + ", Java 21, Spring Boot, Docker");
            newProj.put("date", "finalizat recent");
            newProj.put("highlight", request.cvBulletPoint());

            // Avoid duplicate project names
            projects.removeIf(p -> Objects.equals(p.get("name"), newProj.get("name")));
            projects.add(0, newProj); // add as top project

            profile.setProjectsJson(objectMapper.writeValueAsString(projects));
            cvProfileRepository.save(profile);

            log.info("Skill {} și proiectul asociat au fost adăugate cu succes în CV-ul {}", skillName, profile.getId());
            return Map.of(
                    "success", true,
                    "message", "Skill-ul " + skillName + " și proiectul demonstrativ au fost injectate direct în CV-ul tău principal!",
                    "cvProfileId", profile.getId(),
                    "updatedSkills", profile.getSkillsFrameworks(),
                    "totalProjects", projects.size()
            );
        } catch (Exception e) {
            log.error("Eroare la actualizarea CV-ului cu skill-ul nou: {}", e.getMessage(), e);
            return Map.of("success", false, "message", "Eroare la salvare: " + e.getMessage());
        }
    }

    private SkillRoadmapDto buildKafkaRoadmap() {
        List<RoadmapDayDto> days = List.of(
                new RoadmapDayDto(
                        1,
                        "FOUNDATIONS",
                        "Ziua 1: Arhitectură Event-Driven & Concepte Esențiale",
                        "2.5 ore",
                        "Înțelege modelul publish-subscribe, diferența față de cozile tradiționale (RabbitMQ/JMS) și arhitectura clusterului.",
                        List.of("Brokers & Topics", "Partitions & Replication Factor", "KRaft (fără Zookeeper)"),
                        "Instalează Kafka CLI local sau studiază fluxul unui mesaj de la Producer până la disk commit.",
                        """
                        # Arhitectura Topic & Partitii:
                        # [Topic: order-events]
                        #   ├── Partition 0 -> Leader: Broker 1, Replicas: [1, 2]
                        #   ├── Partition 1 -> Leader: Broker 2, Replicas: [2, 3]
                        #   └── Partition 2 -> Leader: Broker 3, Replicas: [3, 1]
                        """,
                        "bash",
                        List.of("De ce sunt mesajele din Kafka ordonate doar la nivel de partiție, nu global?", "Ce reprezintă Offset-ul și cum îl commit-uiește un consumer?")
                ),
                new RoadmapDayDto(
                        2,
                        "FOUNDATIONS",
                        "Ziua 2: Semantici de Livrare & Idempotență",
                        "2.0 ore",
                        "Stăpânește garanțiile de livrare pentru a preveni duplicatele sau pierderea de date financiare/critice.",
                        List.of("At-least-once (default)", "At-most-once", "Exactly-once Semantics (EOS)", "Idempotent Producer (`enable.idempotence=true`)"),
                        "Calculează scenariile de retry și cum funcționează `acks=all`.",
                        """
                        # Setari recomandate pentru zero-data-loss producer:
                        acks=all
                        enable.idempotence=true
                        retries=2147483647
                        max.in.flight.requests.per.connection=5
                        """,
                        "properties",
                        List.of("Cum garantează un Idempotent Producer că mesajele nu sunt duplicate la retransmisie?", "Ce impact are acks=all asupra latenței de scriere?")
                ),
                new RoadmapDayDto(
                        3,
                        "ENVIRONMENT_SETUP",
                        "Ziua 3: Setup Docker Compose Cluster (KRaft + Kafdrop UI)",
                        "2.5 ore",
                        "Pornește un mediu de dezvoltare complet în Docker cu interfață grafică web de monitorizare.",
                        List.of("Docker Compose", "Apache Kafka 3.7+ în KRaft mode", "Kafdrop Web Visualizer (port 9000)"),
                        "Rulează docker-compose up și verifică clusterul în browser la http://localhost:9000.",
                        """
                        version: '3.8'
                        services:
                          kafka:
                            image: apache/kafka:latest
                            container_name: ats-kafka
                            ports:
                              - "9092:9092"
                            environment:
                              KAFKA_NODE_ID: 1
                              KAFKA_PROCESS_ROLES: broker,controller
                              KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093
                              KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092
                              KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
                              KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
                              CLUSTER_ID: 'MkU3OEVBNTcwNTJENDM2Qk'
                          kafdrop:
                            image: obsidiandynamics/kafdrop:latest
                            container_name: ats-kafdrop
                            ports:
                              - "9000:9000"
                            environment:
                              KAFKA_BROKERCONNECT: kafka:9092
                            depends_on:
                              - kafka
                        """,
                        "yaml",
                        List.of("Ce rol are variabila KAFKA_ADVERTISED_LISTENERS?", "Cum testezi conectivitatea din afara containerului Docker?")
                ),
                new RoadmapDayDto(
                        4,
                        "ENVIRONMENT_SETUP",
                        "Ziua 4: Operațiuni Kafka CLI & Consumer Groups",
                        "2.0 ore",
                        "Învață comenzile de producție pentru crearea de topicuri, inspectarea lag-ului și rebalansare.",
                        List.of("kafka-topics.sh", "kafka-console-producer.sh", "kafka-consumer-groups.sh --describe"),
                        "Creează un topic cu 3 partiții și trimite mesaje cheie-valoare din terminal.",
                        """
                        # Creare topic cu 3 partiții:
                        docker exec -it ats-kafka /opt/kafka/bin/kafka-topics.sh \\
                          --bootstrap-server localhost:9092 \\
                          --create --topic job-events --partitions 3 --replication-factor 1

                        # Monitorizare lag consumatori:
                        docker exec -it ats-kafka /opt/kafka/bin/kafka-consumer-groups.sh \\
                          --bootstrap-server localhost:9092 \\
                          --describe --group ats-digest-group
                        """,
                        "bash",
                        List.of("Ce se întâmplă când numărul consumatorilor dintr-un grup depășește numărul de partiții?", "Ce înseamnă Consumer Lag?")
                ),
                new RoadmapDayDto(
                        5,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 5: Integrare Spring Boot 3 cu Spring Kafka",
                        "3.0 ore",
                        "Implementează producători asincroni cu `KafkaTemplate` și consumatori decuplați cu adnotarea `@KafkaListener`.",
                        List.of("spring-kafka starter", "KafkaTemplate<String, Object>", "@KafkaListener", "JsonSerializer / JsonDeserializer"),
                        "Creează un serviciu Spring Boot care produce un eveniment când un candidat aplică la un job și un listener care procesează notificarea.",
                        """
                        @Service
                        @RequiredArgsConstructor
                        public class JobApplicationEventProducer {
                            private final KafkaTemplate<String, ApplicationSubmittedEvent> kafkaTemplate;

                            public void publishApplication(ApplicationSubmittedEvent event) {
                                kafkaTemplate.send("job-applications-topic", event.applicationId().toString(), event);
                            }
                        }

                        @Component
                        @Slf4j
                        public class NotificationEventConsumer {
                            @KafkaListener(topics = "job-applications-topic", groupId = "ats-notification-workers")
                            public void handleApplication(ApplicationSubmittedEvent event) {
                                log.info("Eveniment recepționat pentru candidatura: {}", event.jobTitle());
                            }
                        }
                        """,
                        "java",
                        List.of("Cum se configurează serializarea obiectelor JSON în application.yml?", "Cum gestionezi manual Acknowledgement-ul (Acks) într-un @KafkaListener?")
                ),
                new RoadmapDayDto(
                        6,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 6: Reziliență & Dead Letter Queue (DLT / Retry)",
                        "2.5 ore",
                        "Tratează excepțiile neprevăzute în producție fără a bloca coada de procesare prin Dead Letter Topic.",
                        List.of("@RetryableTopic", "BackOff cu delay exponențial", "Dead Letter Topic (`.DLT`)", "Error Handler `DefaultErrorHandler`"),
                        "Configurează `@RetryableTopic` cu 3 încercări la interval de 2 secunde înainte de rutarea pe topicul DLT.",
                        """
                        @RetryableTopic(
                            attempts = "3",
                            backoff = @Backoff(delay = 2000, multiplier = 2.0),
                            topicSuffixingStrategy = TopicSuffixingStrategy.SUFFIX_WITH_INDEX_VALUE,
                            dltTopicSuffix = ".DLT"
                        )
                        @KafkaListener(topics = "job-applications-topic", groupId = "ats-critical-processor")
                        public void processWithResilience(ApplicationSubmittedEvent event) {
                            if (event.isCorrupted()) {
                                throw new ProcessingException("Date invalide! Se încearcă retry...");
                            }
                            // business logic...
                        }

                        @DltHandler
                        public void handleDeadLetter(ApplicationSubmittedEvent event) {
                            log.error("Mesaj mutat în Dead Letter Queue după 3 eșecuri: {}", event.applicationId());
                        }
                        """,
                        "java",
                        List.of("De ce este periculos să lași un consumer să intre în buclă infinită la o excepție?", "Cum se monitorizează și re-procesează mesajele din topicul .DLT?")
                ),
                new RoadmapDayDto(
                        7,
                        "PRODUCTION_PROJECT",
                        "Ziua 7: Proiect Capstone GitHub & Injectare în CV",
                        "3.0 ore",
                        "Finalizează proiectul pe GitHub, redactează README cu diagrame arhitecturale și adaugă proiectul în CV cu formula Google XYZ.",
                        List.of("Arhitectură completă Event-Driven", "Docker Compose multi-service", "README GitHub profesional", "CV STAR Bullet Point"),
                        "Push pe GitHub repo: 'spring-kafka-event-pipeline' și conectare cu ATS Job Tracker.",
                        """
                        # Structură Repositoriu GitHub Capstone:
                        ├── docker-compose.yml       # Kafka KRaft + Kafdrop + PostgreSQL
                        ├── producer-service/        # Spring Boot 3 REST API + KafkaTemplate
                        ├── consumer-service/        # Spring Boot 3 @KafkaListener + DLT Handler
                        ├── common-dto/              # Evenimente partajate (Records)
                        └── README.md                # Arhitectură, comenzi rulare și benchmark latență
                        """,
                        "bash",
                        List.of("Cum explici la un interviu tehnic alegerea Kafka în locul unui REST API sincron?", "Cum scalează orizontal procesarea prin creșterea numărului de consumatori?")
                )
        );

        return new SkillRoadmapDto(
                "kafka",
                "Apache Kafka",
                "kafka",
                "Event Streaming & Distributed Messaging",
                "Cerut în 48% din joburile de Java Backend (România)",
                "Intermediar-Avansat",
                7,
                "Junior / Mid Java Backend Developer",
                "Curriculum intensiv de 7 zile conceput pentru a trece de la concepte teoretice la orchestrare Docker, Spring Boot 3 producer/consumer și toleranță la erori prin Dead Letter Queue.",
                days,
                "Event-Driven Job Application Pipeline cu Apache Kafka & Spring Boot 3",
                "Arhitectură decuplată cu Kafka KRaft, producător asincron, consumator cu 3 partiții paralele și politică automată de Dead Letter Topic.",
                "Conceput și implementat o arhitectură de procesare a evenimentelor asincrone cu Spring Boot 3 și Apache Kafka în Docker, reducând latența de procesare cu 40% prin partiționare distribuită și mecanism DLT de retry.",
                "spring-boot-kafka-event-pipeline"
        );
    }

    private SkillRoadmapDto buildRedisRoadmap() {
        List<RoadmapDayDto> days = List.of(
                new RoadmapDayDto(
                        1,
                        "FOUNDATIONS",
                        "Ziua 1: Concepte In-Memory & Structuri de Date Redis",
                        "2.0 ore",
                        "Înțelege de ce Redis oferă latențe sub milisecundă și cum funcționează arhitectura single-threaded event loop.",
                        List.of("Strings, Hashes, Lists, Sets, Sorted Sets (ZSET)", "Persistență RDB (Snapshot) vs AOF (Append-Only File)"),
                        "Testează structurile fundamentale în consola redis-cli.",
                        """
                        # Comenzi fundamentale Redis:
                        SET user:101:session "active_token_xyz" EX 3600
                        HSET user:101:profile name "Mihai" role "Engineer"
                        ZADD job:rankings 98 "job_java_01" 85 "job_react_02"
                        ZRANGE job:rankings 0 -1 WITHSCORES
                        """,
                        "bash",
                        List.of("De ce este Redis single-threaded și de ce este totuși extrem de rapid?", "Care este diferența dintre persistența RDB și AOF?")
                ),
                new RoadmapDayDto(
                        2,
                        "FOUNDATIONS",
                        "Ziua 2: Modele de Caching & Politici de Evaporare (TTL)",
                        "2.0 ore",
                        "Alege modelul corect de caching pentru a preveni inconsistențele între baza relațională și cache.",
                        List.of("Cache-Aside (Lazy Loading)", "Write-Through & Write-Behind", "Politici Eviction: volatile-lru, allkeys-lru, noeviction"),
                        "Analizează scenariile de Cache Avalanche, Cache Stampede și Cache Penetration.",
                        """
                        # Configurare memorie si evaporare in redis.conf:
                        maxmemory 256mb
                        maxmemory-policy allkeys-lru
                        """,
                        "properties",
                        List.of("Cum combați fenomenul de Cache Stampede când expiră o cheie foarte accesată?", "Ce este un Bloom Filter și cum previne Cache Penetration?")
                ),
                new RoadmapDayDto(
                        3,
                        "ENVIRONMENT_SETUP",
                        "Ziua 3: Docker Lab: Redis 7 Standalone & Redis Commander GUI",
                        "2.0 ore",
                        "Pornește instanța de Redis cu GUI web de explorare a cheilor în timp real.",
                        List.of("Redis 7 Alpine", "Redis Commander Web UI (port 8081)", "Parole și protecție de rețea"),
                        "Lansează containerul și explorează cheile din interfața web.",
                        """
                        version: '3.8'
                        services:
                          redis:
                            image: redis:7-alpine
                            container_name: ats-redis
                            command: redis-server --requirepass securedevpassword
                            ports:
                              - "6379:6379"
                          redis-commander:
                            image: rediscommander/redis-commander:latest
                            container_name: ats-redis-ui
                            environment:
                              REDIS_HOSTS: local:redis:6379:0:securedevpassword
                            ports:
                              - "8081:8081"
                            depends_on:
                              - redis
                        """,
                        "yaml",
                        List.of("Cum se configurează o parolă pe Redis într-un container Docker?", "Ce măsuri de securitate sunt obligatorii înainte de producție?")
                ),
                new RoadmapDayDto(
                        4,
                        "ENVIRONMENT_SETUP",
                        "Ziua 4: Pub/Sub & Rate Limiting cu Redis",
                        "2.5 ore",
                        "Implementează limitarea numărului de apeluri API pe minut (Rate Limiting) și notificări Pub/Sub.",
                        List.of("Sliding Window Rate Limiter", "PUBLISH / SUBSCRIBE channels", "Tranzacții atomice cu MULTI / EXEC sau scripturi Lua"),
                        "Scrie o comandă atomică pentru incrementare cu expirare automată.",
                        """
                        # Script atomic Redis pentru Rate Limiting (100 cereri / 60 secunde):
                        # INCR rate:ip:192.168.1.1
                        # Daca valoarea == 1 -> EXPIRE rate:ip:192.168.1.1 60
                        """,
                        "bash",
                        List.of("De ce folosim scripturi Lua în Redis pentru rate limiting?", "Care este diferența dintre Redis Pub/Sub și Kafka topics?")
                ),
                new RoadmapDayDto(
                        5,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 5: Spring Boot Cache Abstraction (@Cacheable, @CacheEvict)",
                        "3.0 ore",
                        "Optimizează endpoint-urile Spring Boot prin adnotări declarative de caching conectate la Redis.",
                        List.of("spring-boot-starter-data-redis", "@EnableCaching", "@Cacheable", "@CacheEvict", "RedisCacheConfiguration (TTL)"),
                        "Configurează TTL diferențiat pe cache-uri (10 minute pentru căutări, 24 ore pentru dicționare).",
                        """
                        @Configuration
                        @EnableCaching
                        public class RedisConfig {
                            @Bean
                            public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
                                RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
                                    .entryTtl(Duration.ofMinutes(15))
                                    .disableCachingNullValues()
                                    .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));
                                return RedisCacheManager.builder(factory).cacheDefaults(config).build();
                            }
                        }

                        @Service
                        @RequiredArgsConstructor
                        public class JobSearchService {
                            @Cacheable(value = "job-search", key = "#query + '-' + #location")
                            public List<JobDto> searchJobs(String query, String location) {
                                // Interogare costisitoare pe PostgreSQL...
                                return repository.findJobs(query, location);
                            }

                            @CacheEvict(value = "job-search", allEntries = true)
                            public void refreshCache() {
                                // Invalideaza la aparitia de joburi noi
                            }
                        }
                        """,
                        "java",
                        List.of("Ce se întâmplă dacă metoda adnotată cu @Cacheable aruncă o excepție?", "Cum se gestionează serializarea claselor Java fără ID-uri implicite?")
                ),
                new RoadmapDayDto(
                        6,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 6: Distributed Locks cu Redisson (Prevenire Race Conditions)",
                        "2.5 ore",
                        "Protejează resursele critice la nivel de cluster multi-instanță împotriva rulărilor concurente duble.",
                        List.of("Redisson Client", "RLock lock = redisson.getLock(\"key\")", "Lock Watchdog & Lease Time"),
                        "Implementează un cron job distribuit care rulează o singură dată indiferent de numărul de pod-uri Spring Boot.",
                        """
                        @Component
                        @RequiredArgsConstructor
                        @Slf4j
                        public class DistributedJobSyncScheduler {
                            private final RedissonClient redissonClient;

                            @Scheduled(cron = "0 0 9 * * ?")
                            public void runMorningSync() {
                                RLock lock = redissonClient.getLock("sync-jobs-lock");
                                try {
                                    // Incearca obtinerea lock-ului timp de 5s, eliberare automata dupa 60s
                                    if (lock.tryLock(5, 60, TimeUnit.SECONDS)) {
                                        try {
                                            log.info("Lock obtinut! Rulam sincronizarea joburilor pe acest nod...");
                                        } finally {
                                            lock.unlock();
                                        }
                                    } else {
                                        log.info("Alt nod executa deja sincronizarea. Ignoram.");
                                    }
                                } catch (InterruptedException e) {
                                    Thread.currentThread().interrupt();
                                }
                            }
                        }
                        """,
                        "java",
                        List.of("Cum funcționează algoritmul Redlock pentru lock-uri distribuite pe clustere Redis multiple?", "Ce este un Deadlock și cum îl evită leaseTime-ul din Redisson?")
                ),
                new RoadmapDayDto(
                        7,
                        "PRODUCTION_PROJECT",
                        "Ziua 7: Capstone High-Throughput Cache Layer & Adăugare în CV",
                        "3.0 ore",
                        "Publică proiectul demonstrativ pe GitHub, măsoară timpii de răspuns (înainte vs după cache) și injectează skill-ul în CV.",
                        List.of("Benchmark Latență (JMeter / Apache Bench)", "Documentație GitHub", "Formula Google XYZ CV"),
                        "Conectează modulul Redis la proiectul tău ATS Job Tracker.",
                        """
                        # Benchmark Rezultate:
                        # Fara Caching (PostgreSQL Direct): 185ms latență medie | 120 req/s
                        # Cu Redis Caching Distribuit:       12ms latență medie | 2400 req/s (20x creștere throughput!)
                        """,
                        "text",
                        List.of("Cum argumentezi într-o discuție tehnică alegerea politicii de invalidare a cache-ului?", "Ce trade-off de memorie RAM implică stocarea a 1.000.000 de înregistrări?")
                )
        );

        return new SkillRoadmapDto(
                "redis",
                "Redis & Distributed Caching",
                "redis",
                "In-Memory Caching & Performance",
                "Cerut în 54% din rolurile de backend cu trafic ridicat",
                "Intermediar",
                7,
                "Backend Software Engineer / Spring Boot Developer",
                "Curriculum practic axat pe accelerarea performanței arhitecturilor backend, gestiunea stărilor de sesiune și sincronizarea distribuită cu Redisson.",
                days,
                "High-Throughput Distributed Caching Layer cu Redis & Spring Boot 3",
                "Strat de accelerare Cache-Aside cu serializare JSON, rate limiter sliding window și lock-uri distribuite Redisson pentru noduri multiple.",
                "Optimizat performanța API-urilor backend prin implementarea unui nivel de caching distribuit Redis cu Spring Boot, atingând un hit-ratio de 85% și scăzând timpul de răspuns de la 180ms la sub 15ms.",
                "spring-boot-redis-distributed-cache"
        );
    }

    private SkillRoadmapDto buildDockerRoadmap() {
        List<RoadmapDayDto> days = List.of(
                new RoadmapDayDto(
                        1,
                        "FOUNDATIONS",
                        "Ziua 1: Arhitectura Containerelor & Linux Namespaces",
                        "2.0 ore",
                        "Înțelege diferența tehnică fundamentală între containere și mașini virtuale (Hypervisor vs Kernel Sharing).",
                        List.of("Namespaces (PID, NET, MNT)", "Control Groups (cgroups) pentru resurse", "UnionFS & Image Layers"),
                        "Inspectează containerele active cu `docker system df` și `docker inspect`.",
                        """
                        # Verificare straturi imagine și consum de resurse:
                        docker system df
                        docker inspect --format='{{.NetworkSettings.IPAddress}}' ats-postgres
                        """,
                        "bash",
                        List.of("De ce pornește un container Docker în câteva milisecunde spre deosebire de o mașină virtuală?", "Ce protecție oferă cgroups împotriva consumului excesiv de RAM?")
                ),
                new RoadmapDayDto(
                        2,
                        "FOUNDATIONS",
                        "Ziua 2: Dockerfile Multi-Stage Production Grade pentru Java 21",
                        "2.5 ore",
                        "Construiește imagini ultra-ușoare, sigure și optimizate pentru producție, separând mediul de build de cel de runtime.",
                        List.of("Multi-stage builds (Eclipse Temurin / Alpine)", "Rulare ca non-root user (`USER spring`)", "Layer caching pentru Maven dependencies"),
                        "Scrie un Dockerfile multi-stage și compară dimensiunea imaginii (de la 800MB la sub 190MB).",
                        """
                        # Stage 1: Build & Dependencies Cache
                        FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
                        WORKDIR /app
                        COPY pom.xml .
                        RUN mvn dependency:go-offline -B
                        COPY src ./src
                        RUN mvn clean package -DskipTests

                        # Stage 2: Minimal Distroless / JRE Runtime
                        FROM eclipse-temurin:21-jre-alpine
                        WORKDIR /app
                        RUN addgroup -S appgroup && adduser -S appuser -G appgroup
                        USER appuser
                        COPY --from=builder /app/target/*.jar app.jar
                        EXPOSE 8080
                        ENTRYPOINT ["java", "-XX:+UseG1GC", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
                        """,
                        "dockerfile",
                        List.of("De ce este periculos să rulezi aplicația Java ca root în container?", "Ce rol are parametrul `-XX:MaxRAMPercentage=75.0`?")
                ),
                new RoadmapDayDto(
                        3,
                        "ENVIRONMENT_SETUP",
                        "Ziua 3: Docker Networks, Bridge & Izolare",
                        "2.0 ore",
                        "Configurează rețele dedicate interne pentru comunicarea securizată între microservicii și baze de date.",
                        List.of("Bridge networks personalizate", "DNS intern Docker (rezolvare pe nume de serviciu)", "Securizare porturi (fără expunere publică la DB)"),
                        "Creează o rețea internă și conectează backend-ul la PostgreSQL fără a expune portul 5432 pe host.",
                        """
                        # Retea privata izolata:
                        docker network create ats-network
                        docker run -d --name ats-db --network ats-network -e POSTGRES_PASSWORD=secret postgres:16-alpine
                        """,
                        "bash",
                        List.of("Cum rezolvă Docker numele de containere în interiorul aceleiași rețele bridge?", "Când este recomandat să folosești `network_mode: host`?")
                ),
                new RoadmapDayDto(
                        4,
                        "ENVIRONMENT_SETUP",
                        "Ziua 4: Docker Compose Orchestration & Healthchecks",
                        "2.5 ore",
                        "Coordonează un stack complet (Backend, PostgreSQL pgvector, Redis) cu pornire condiționată `depends_on: condition: service_healthy`.",
                        List.of("docker-compose.yml spec", "Healthchecks cu pg_isready", "Restart policies (`restart: unless-stopped`)"),
                        "Asigură-te că Spring Boot pornește doar DUPĂ ce baza de date răspunde la interogări.",
                        """
                        version: '3.8'
                        services:
                          postgres:
                            image: pgvector/pgvector:pg16
                            healthcheck:
                              test: ["CMD-SHELL", "pg_isready -U ats_user -d ats_db"]
                              interval: 5s
                              timeout: 5s
                              retries: 5
                          backend:
                            build: .
                            depends_on:
                              postgres:
                                condition: service_healthy
                            ports:
                              - "8080:8080"
                        """,
                        "yaml",
                        List.of("De ce simplul `depends_on: - postgres` nu garantează că baza de date acceptă conexiuni?", "Ce avantaje aduc named volumes față de bind mounts?")
                ),
                new RoadmapDayDto(
                        5,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 5: Gestiunea Volumelor Persistente & Backup",
                        "2.0 ore",
                        "Configurează stocarea persistentă a datelor pentru a preveni pierderea informațiilor la recrearea containerelor.",
                        List.of("Named Volumes", "Bind Mounts pentru dezvoltare rapidă", "Automatizare dump PostgreSQL via container"),
                        "Creează un script bash de backup și restore automat al bazei de date din container.",
                        """
                        # Script de backup automat:
                        docker exec -t ats-db pg_dump -U ats_user ats_db | gzip > backup_$(date +%Y%m%d).sql.gz
                        """,
                        "bash",
                        List.of("Unde sunt stocate fizic pe disk datele unui Docker Named Volume?", "Cum transferi datele dintr-un volum pe un alt server?")
                ),
                new RoadmapDayDto(
                        6,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 6: Scanare Vulnerabilități & Optimizare Performanță",
                        "2.5 ore",
                        "Scanează imaginea finală împotriva vulnerabilităților CVE și optimizează consumul de memorie.",
                        List.of("Scanare imagini cu Trivy / Docker Scout", "Eliminare dependențe nefolosite", "Ajustare resurse CPU / RAM (`deploy.resources.limits`)"),
                        "Rulează o scanare completă a imaginii generate și rezolvă vulnerabilitățile HIGH / CRITICAL.",
                        """
                        # Scanare imagine cu Trivy:
                        docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image ats-job-tracker:latest
                        """,
                        "bash",
                        List.of("Ce sunt imaginile Distroless și ce avantaje aduc în materie de securitate?", "Cum limitezi memoria unui container la maxim 512MB?")
                ),
                new RoadmapDayDto(
                        7,
                        "PRODUCTION_PROJECT",
                        "Ziua 7: Publicare GitHub & Inserare Bullet Point în CV",
                        "2.5 ore",
                        "Integrează structura completă de Docker în portofoliu și adaugă realizarea în CV conform ghidului Google.",
                        List.of("Repo GitHub cu Makefile sau docker-compose start rapid", "GitHub Actions CI/CD pentru build automat imagine"),
                        "Testează pornirea completă `docker compose up --build` dintr-o singură comandă.",
                        """
                        # Lansare rapida intreg ecosistem:
                        docker compose up -d --build
                        """,
                        "bash",
                        List.of("Cum se configurează o acțiune GitHub Actions pentru a împinge automat imaginea pe Docker Hub?", "Cum explici beneficiile multi-stage build la un interviu tehnic?")
                )
        );

        return new SkillRoadmapDto(
                "docker",
                "Docker & Multi-Stage Builds",
                "docker",
                "DevOps & Containerization",
                "Cerut în 88% din joburile de software engineer România",
                "Esențial",
                7,
                "Full Stack / Backend Engineer",
                "Ghid de la zero la nivel avansat pentru containerizarea aplicațiilor Spring Boot și bazelor de date, axat pe securitate, viteza de build și imagini ultra-compacte.",
                days,
                "Production-Grade Container Architecture cu Docker Compose & Multi-Stage Java 21",
                "Arhitectură containerizată cu imagini Temurin alpine non-root, rețele bridge interne, healthchecks automate și persistență pe volume.",
                "Containerizat întregul ecosistem de servicii backend și baze de date PostgreSQL cu Docker multi-stage builds, reducând dimensiunea imaginii finale cu 65% și asigurând pornire deterministă prin healthchecks.",
                "spring-boot-docker-production-blueprint"
        );
    }

    private SkillRoadmapDto buildKubernetesRoadmap() {
        List<RoadmapDayDto> days = List.of(
                new RoadmapDayDto(
                        1,
                        "FOUNDATIONS",
                        "Ziua 1: Arhitectura Control Plane & Obiecte K8s",
                        "2.5 ore",
                        "Înțelege rolul componentelor master (API Server, Controller Manager, Scheduler, etcd) și al nodurilor worker (Kubelet, Kube-Proxy).",
                        List.of("Control Plane vs Worker Nodes", "Pods (cea mai mică unitate de execuție)", "kubectl CLI basics"),
                        "Instalează Minikube sau k3s local și rulează `kubectl get nodes`.",
                        """
                        minikube start --driver=docker
                        kubectl get nodes -o wide
                        """,
                        "bash",
                        List.of("De ce nu este recomandat să creezi Pods direct, ci prin Deployments?", "Ce rol are baza de date etcd într-un cluster Kubernetes?")
                ),
                new RoadmapDayDto(
                        2,
                        "FOUNDATIONS",
                        "Ziua 2: Deployments, ReplicaSets & Rolling Updates",
                        "2.5 ore",
                        "Configurează actualizări zero-downtime prin strategia RollingUpdate și gestionează scalarea numărului de replici.",
                        List.of("Deployment manifests (YAML)", "ReplicaSets", "RollingUpdate vs Recreate strategy", "kubectl rollout undo"),
                        "Aplică un manifest de Deployment cu 3 replici și efectuează un update de imagine fără întreruperea traficului.",
                        """
                        apiVersion: apps/v1
                        kind: Deployment
                        metadata:
                          name: ats-backend-deployment
                        spec:
                          replicas: 3
                          strategy:
                            type: RollingUpdate
                            rollingUpdate:
                              maxSurge: 1
                              maxUnavailable: 0
                          selector:
                            matchLabels:
                              app: ats-backend
                          template:
                            metadata:
                              labels:
                                app: ats-backend
                            spec:
                              containers:
                              - name: ats-backend
                                image: sirbumihai/ats-backend:v1.0
                                ports:
                                - containerPort: 8080
                        """,
                        "yaml",
                        List.of("Ce înseamnă maxSurge și maxUnavailable?", "Cum faci rollback instant dacă o nouă versiune conține un bug?")
                ),
                new RoadmapDayDto(
                        3,
                        "ENVIRONMENT_SETUP",
                        "Ziua 3: Servicii K8s (ClusterIP, NodePort, LoadBalancer, Ingress)",
                        "2.5 ore",
                        "Înțelege cum comunică Pod-urile între ele prin IP-uri dinamice și cum expui traficul către exterior.",
                        List.of("ClusterIP (intern)", "NodePort", "Ingress Controller & Ingress Rules"),
                        "Creează un Service ClusterIP pentru backend și un Ingress pentru rutare HTTP pe bază de path.",
                        """
                        apiVersion: v1
                        kind: Service
                        metadata:
                          name: ats-backend-service
                        spec:
                          type: ClusterIP
                          selector:
                            app: ats-backend
                          ports:
                          - port: 80
                            targetPort: 8080
                        """,
                        "yaml",
                        List.of("De ce nu folosim direct IP-urile Pod-urilor pentru comunicare?", "Cum funcționează un Ingress Nginx?")
                ),
                new RoadmapDayDto(
                        4,
                        "ENVIRONMENT_SETUP",
                        "Ziua 4: ConfigMaps & Secrets (Decuplare Configurație)",
                        "2.0 ore",
                        "Injectează variabile de mediu și parole criptate base64 în containere fără a recompila imaginea Docker.",
                        List.of("ConfigMaps pentru proprietăți non-sensibile", "Secrets (Base64) pentru token-uri și parole DB", "envFrom / valueFrom"),
                        "Leagă un secret de conexiune la PostgreSQL în manifestul de Deployment.",
                        """
                        apiVersion: v1
                        kind: Secret
                        metadata:
                          name: ats-db-secret
                        type: Opaque
                        data:
                          DB_PASSWORD: c2VjdXJlZGV2cGFzc3dvcmQ= # base64
                        """,
                        "yaml",
                        List.of("Sunt secretele din K8s criptate în etcd în mod implicit?", "Cum montezi un ConfigMap ca fișier pe disk în loc de variabilă de mediu?")
                ),
                new RoadmapDayDto(
                        5,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 5: Liveness & Readiness Probes cu Spring Boot Actuator",
                        "2.5 ore",
                        "Asigură disponibilitatea serviciului configurând verificări automate de sănătate via Spring Actuator.",
                        List.of("Spring Boot Actuator Health Groups", "Liveness Probe (`/actuator/health/liveness`)", "Readiness Probe (`/actuator/health/readiness`)"),
                        "Configurează probele în YAML pentru a opri rutarea traficului către pod-urile nepregătite.",
                        """
                        livenessProbe:
                          httpGet:
                            path: /actuator/health/liveness
                            port: 8080
                          initialDelaySeconds: 30
                          periodSeconds: 10
                        readinessProbe:
                          httpGet:
                            path: /actuator/health/readiness
                            port: 8080
                          initialDelaySeconds: 20
                          periodSeconds: 5
                        """,
                        "yaml",
                        List.of("Care este diferența critică între Liveness (repornire pod) și Readiness (scoatere temporară din load balancer)?")
                ),
                new RoadmapDayDto(
                        6,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 6: Autoscaling cu Horizontal Pod Autoscaler (HPA)",
                        "2.0 ore",
                        "Scalează automat numărul de replici de la 2 la 10 pe baza utilizării CPU și RAM.",
                        List.of("Metrics Server K8s", "Resource requests & limits", "HorizontalPodAutoscaler (target CPU 70%)"),
                        "Simulează trafic concurent și urmărește scalarea automată a pod-urilor.",
                        """
                        kubectl autoscale deployment ats-backend-deployment --cpu-percent=70 --min=2 --max=8
                        """,
                        "bash",
                        List.of("De ce sunt obligatorii `resources.requests` pentru ca HPA să funcționeze?")
                ),
                new RoadmapDayDto(
                        7,
                        "PRODUCTION_PROJECT",
                        "Ziua 7: Proiect Capstone K8s & Salvare în CV",
                        "2.5 ore",
                        "Creează un folder dedicat `k8s/` cu toate manifestele testate și adaugă proiectul în portofoliu.",
                        List.of("Folder complet manifests K8s (Deployments, Services, Ingress, Secrets, HPA)", "Documentare în CV conform standardului STAR"),
                        "Rulează întregul cluster local cu un singur script `kubectl apply -f k8s/`.",
                        """
                        kubectl apply -f k8s/
                        """,
                        "bash",
                        List.of("Cum explici arhitectura cloud-native a soluției tale într-un interviu de angajare?")
                )
        );

        return new SkillRoadmapDto(
                "kubernetes",
                "Kubernetes for Developers (K8s)",
                "kubernetes",
                "Cloud-Native Orchestration",
                "Cerut în 42% din cerințele cloud native",
                "Avansat",
                7,
                "DevOps / Cloud Native Backend Developer",
                "Ghid practic pentru dezvoltatorii care doresc să stăpânească conceptele K8s, manifestele declarative și monitorizarea Actuator în medii distribuite.",
                days,
                "Zero-Downtime Microservices Deployment pe Kubernetes cu Minikube & Actuator",
                "Cluster K8s local cu Deployments scalabile, Ingress Nginx, ConfigMaps securizate și Liveness/Readiness probes integrate.",
                "Orchestrat servicii backend Spring Boot pe Kubernetes cu Deployments multi-replica, Ingress routing și Liveness/Readiness probes via Actuator, obținând zero-downtime la actualizări de versiune.",
                "spring-boot-kubernetes-deployment-suite"
        );
    }

    private SkillRoadmapDto buildMicroservicesRoadmap() {
        List<RoadmapDayDto> days = List.of(
                new RoadmapDayDto(
                        1,
                        "FOUNDATIONS",
                        "Ziua 1: Principii Microservicii & Bounded Contexts",
                        "2.0 ore",
                        "Înțelege principiile Domain-Driven Design (DDD), separarea responsabilităților și de ce baza de date comună este un antipattern.",
                        List.of("Database per Service Pattern", "Loose Coupling & High Cohesion", "Sincron vs Asincron"),
                        "Desenează arhitectura serviciilor decuplate: Auth, Job Catalog, Application Tracking, Notification Service.",
                        """
                        # Arhitectura Bounded Contexts:
                        # [Client / Web Browser]
                        #           │
                        #     [API Gateway] (Port 8080)
                        #     ├── /api/v1/auth    -> [Auth Service] (DB 1)
                        #     ├── /api/v1/jobs    -> [Catalog Service] (DB 2)
                        #     └── /api/v1/outreach-> [Outreach Service] (DB 3)
                        """,
                        "text",
                        List.of("Care sunt cele mai mari riscuri ale trecerii de la un monolit modular la microservicii?", "De ce fiecare serviciu trebuie să dețină propria schemă de bază de date?")
                ),
                new RoadmapDayDto(
                        2,
                        "FOUNDATIONS",
                        "Ziua 2: API Gateway & Centralizare Rutare",
                        "2.5 ore",
                        "Configurează un punct unic de intrare pentru securitate, validare token JWT, rate limiting și rutare.",
                        List.of("Spring Cloud Gateway", "Predicates & Filters", "Cross-Origin Resource Sharing (CORS) centralizat"),
                        "Implementează rute reactive către 3 microservicii distincte.",
                        """
                        spring:
                          cloud:
                            gateway:
                              routes:
                                - id: job-service
                                  uri: http://job-service:8081
                                  predicates:
                                    - Path=/api/v1/jobs/**
                                - id: outreach-service
                                  uri: http://outreach-service:8082
                                  predicates:
                                    - Path=/api/v1/outreach/**
                        """,
                        "yaml",
                        List.of("Ce beneficii aduce un API Gateway în materie de securitate față de expunerea directă a serviciilor?")
                ),
                new RoadmapDayDto(
                        3,
                        "ENVIRONMENT_SETUP",
                        "Ziua 3: Comunicare Inter-Service cu OpenFeign & DTOs",
                        "2.5 ore",
                        "Apelează declarativ alte microservicii prin clienți HTTP tipizați fără a scrie boilerplate `RestTemplate`.",
                        List.of("Spring Cloud OpenFeign", "@FeignClient", "RequestInterceptors pentru propagare token Bearer JWT"),
                        "Creează un client Feign care preia detaliile candidatului dintr-un serviciu separat.",
                        """
                        @FeignClient(name = "user-service", url = "${services.user.url}")
                        public interface UserServiceClient {
                            @GetMapping("/api/v1/users/{userId}")
                            UserSummaryDto getUserProfile(@PathVariable("userId") UUID userId);
                        }
                        """,
                        "java",
                        List.of("Cum se propagă header-ul de autorizare Authorization către serviciul apelat?")
                ),
                new RoadmapDayDto(
                        4,
                        "ENVIRONMENT_SETUP",
                        "Ziua 4: Distributed Tracing & Observabilitate (Micrometer & Zipkin)",
                        "2.0 ore",
                        "Urmărește traseul unei cereri HTTP printr-o suită de microservicii folosind un ID de corelare unic (`traceId`).",
                        List.of("Micrometer Tracing", "Zipkin / Grafana Tempo", "Corelation ID în log-uri Logback"),
                        "Pornește Zipkin în Docker și inspectează diagrama de latență inter-service.",
                        """
                        # Lansare Zipkin UI:
                        docker run -d -p 9411:9411 openzipkin/zipkin
                        """,
                        "bash",
                        List.of("Ce reprezintă un TraceId și un SpanId?", "Cum te ajută distributed tracing să depistezi un bottleneck?")
                ),
                new RoadmapDayDto(
                        5,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 5: Reziliență cu Resilience4j (Circuit Breaker & Retry)",
                        "3.0 ore",
                        "Protejează sistemul împotriva căderilor în cascadă atunci când un serviciu terț devine lent sau indisponibil.",
                        List.of("Circuit Breaker Pattern (CLOSED -> OPEN -> HALF_OPEN)", "Fallback Methods", "RateLimiter & TimeLimiter"),
                        "Configurează un Circuit Breaker care returnează date din cache atunci când serviciul extern e picat.",
                        """
                        @Service
                        @Slf4j
                        public class ExternalJobFeedService {

                            @CircuitBreaker(name = "jobFeedBreaker", fallbackMethod = "fallbackCachedFeed")
                            public List<JobDto> fetchExternalJobs() {
                                // Apel extern către un API terț...
                                return restTemplate.getForObject("https://external-api.com/jobs", List.class);
                            }

                            public List<JobDto> fallbackCachedFeed(Throwable t) {
                                log.warn("Circuit Breaker activat! Returnam date de rezerva: {}", t.getMessage());
                                return getCachedJobsFromLocalDb();
                            }
                        }
                        """,
                        "java",
                        List.of("Care sunt stările unui Circuit Breaker și cum trece din OPEN în HALF_OPEN?", "De ce metoda de fallback trebuie să aibă aceeași semnătură?")
                ),
                new RoadmapDayDto(
                        6,
                        "SPRING_BOOT_INTEGRATION",
                        "Ziua 6: Tranzacții Distribuite: Pattern-ul SAGA & Outbox",
                        "2.5 ore",
                        "Rezolvă problema consistenței datelor între baze de date diferite fără tranzacții 2-Phase Commit lente.",
                        List.of("Saga Choreography vs Orchestration", "Compensating Transactions (anulare pași)", "Transactional Outbox Pattern"),
                        "Proiectează fluxul de creare a unei candidaturi și compensarea în caz de eșec.",
                        """
                        # Flux SAGA Compensatoriu:
                        # 1. Creează Aplicație (Status PENDING)
                        # 2. Trimite Notificare -> Dacă eșuează de 3 ori ->
                        # 3. Declanșează Tranzacție Compensatorie: Marchează Aplicația cu status FAILED și eliberează slotul.
                        """,
                        "text",
                        List.of("De ce este 2PC (Two-Phase Commit) nepotrivit pentru sisteme distribuite de mare viteză?", "Cum previne Outbox Pattern pierderea mesajelor dintre baza de date și broker?")
                ),
                new RoadmapDayDto(
                        7,
                        "PRODUCTION_PROJECT",
                        "Ziua 7: Proiect Capstone Rezilient & Adăugare în CV",
                        "3.0 ore",
                        "Asamblează întregul ecosistem de microservicii și documentează rezultatele în CV conform standardului STAR.",
                        List.of("Arhitectură distribuită completă", "Circuit Breakers & Gateway", "Salvare în CV"),
                        "Finalizează README-ul pe GitHub și simulează căderea unui nod pentru a valida fallback-ul.",
                        """
                        # Testare rezistență la erori:
                        docker stop external-job-service
                        curl http://localhost:8080/api/v1/jobs # Raspunde instantaneu prin Fallback Cache!
                        """,
                        "bash",
                        List.of("Cum argumentezi într-o discuție de arhitectură alegerea dintre Saga Choreography și Saga Orchestration?")
                )
        );

        return new SkillRoadmapDto(
                "microservices",
                "Microservices & Resilience4j",
                "microservices",
                "Distributed Systems Architecture",
                "Standardul industriei pentru 72% din marile companii IT",
                "Avansat",
                7,
                "Senior Java Engineer / Software Architect",
                "Arhitectură avansată pentru sisteme distribuite scalabile, axată pe decuplare, tracing unificat și toleranță ridicată la erori cu Resilience4j.",
                days,
                "Resilient Distributed Microservices Suite cu Spring Cloud & Resilience4j",
                "Arhitectură cu API Gateway, rutare inteligentă, protecție Circuit Breaker, tracing Zipkin și tranzacții distribuite de tip SAGA.",
                "Arhitecturat o suită scalabilă de microservicii Spring Boot cu Spring Cloud Gateway și Resilience4j, prevenind căderile în cascadă prin mecanisme automate de Circuit Breaker și latențe reduse prin tracing distribuit.",
                "spring-boot-resilient-microservices-suite"
        );
    }

    private SkillRoadmapDto generateOrFallbackRoadmap(String skillName) {
        String safeName = skillName != null ? skillName.trim() : "Custom Skill";
        List<RoadmapDayDto> days = new ArrayList<>();
        for (int i = 1; i <= 7; i++) {
            days.add(new RoadmapDayDto(
                    i,
                    i <= 2 ? "FOUNDATIONS" : i <= 4 ? "ENVIRONMENT_SETUP" : i <= 6 ? "SPRING_BOOT_INTEGRATION" : "PRODUCTION_PROJECT",
                    "Ziua " + i + ": Stăpânirea " + safeName + " (Etapa " + i + ")",
                    "2.5 ore",
                    "Aprofundează principiile esențiale pentru " + safeName + " cerute la interviurile tehnice.",
                    List.of("Concepte teoretice " + safeName, "Bune practici arhitecturale", "Securitate și scalabilitate"),
                    "Construiește un mini-laborator practic în Docker cu exemple de cod.",
                    "// Exemplu practic de implementare pentru " + safeName + "\n// TODO: Configurare și testare",
                    "java",
                    List.of("Cum scalează " + safeName + " în producție?", "Care sunt principalele capcane de evitat?")
            ));
        }

        return new SkillRoadmapDto(
                safeName.toLowerCase().replace(" ", "-"),
                safeName,
                "generic",
                "Specialized Technology",
                "Tehnologie în cerere pe piața IT din România",
                "Intermediar",
                7,
                "Software Engineer",
                "Roadmap structurat de 7 zile conceput pentru asimilarea rapidă a tehnologiei " + safeName + " și integrarea ei într-un proiect de portofoliu.",
                days,
                "Proiect Demonstrativ " + safeName + " în Producție",
                "Implementare curată și testată pentru tehnologia " + safeName + ".",
                "Dezvoltat și integrat o soluție robustă folosind " + safeName + ", îmbunătățind scalabilitatea și timpul de procesare în arhitectura backend.",
                "portfolio-" + safeName.toLowerCase().replace(" ", "-")
        );
    }

    private SkillRoadmapDto generateWithAi(String skillName, String targetRole, String focusArea) {
        String systemPrompt = "Ești un Principal Software Engineer și Lead Tech Interviewer din România. " +
                "Generează un curriculum de 7 zile ultra-structurat pentru tehnologia: " + skillName + ". " +
                "Răspunde DOAR în format JSON valid respectând structura cerută.";
        String userPrompt = "Creează un roadmap de 7 zile pentru " + skillName + " destinat rolului de " + (targetRole != null ? targetRole : "Software Engineer") + ". " +
                "Format JSON: { \"skillName\": \"" + skillName + "\", \"capstoneProjectTitle\": \"...\", \"cvBulletPoint\": \"...\" }";

        String jsonResp = openAiLlmService.generateCompletion(systemPrompt, userPrompt, 2000, 0.3);
        if (jsonResp != null && !jsonResp.isBlank()) {
            return generateOrFallbackRoadmap(skillName);
        }
        return generateOrFallbackRoadmap(skillName);
    }
}
