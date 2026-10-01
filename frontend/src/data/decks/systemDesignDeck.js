// Deck Masiv: System Design, Scalabilitate, Caching, Cozi & Arhitecturi Distribuite
// Preluat din: donnemartin/system-design-primer, ByteByteGoHq/system-design-101
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const SYSTEM_DESIGN_DECK = [
  {
    id: 'sys-01',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Cum implementezi Idempotenta pe un API REST de Plati?',
    question: 'Daca o retea pica in timp ce utilizatorul plateste un abonament si clientul trimite un retry automat, cum previi debitarea dubla (Double Charge)?',
    answer: 'Solutia canonica este folosirea unei "Idempotency Key" (UUID generat de client):\n1. Clientul trimite header-ul HTTP Idempotency-Key: e8a7...\n2. Backend-ul verifica in Redis daca cheia exista:\n   - Daca NU exista: Creeaza un lock atomic cu TTL (SETNX in Redis cu status PROCESSING) si apeleaza Stripe/banca.\n   - Daca plata reuseste: Salveaza raspunsul in cache asociat cheii si comite tranzactia.\n   - Daca cheia exista deja si e COMPLETED: Returneaza direct raspunsul salvat anterior fara a reexecuta debitarea!\n   - Daca e in status PROCESSING: Returneaza HTTP 409 Conflict sau asteapta finalizarea.',
    codeSnippet: `String key = "idempotency:" + idempotencyKey;
Boolean acquired = redisTemplate.opsForValue()
    .setIfAbsent(key, "PROCESSING", Duration.ofMinutes(5));

if (Boolean.FALSE.equals(acquired)) {
    return getCachedResponseOrThrowConflict(key);
}

try {
    PaymentResult result = paymentGateway.charge(order);
    redisTemplate.opsForValue().set(key, serialize(result), Duration.ofHours(24));
    return result;
} catch (Exception e) {
    redisTemplate.delete(key);
    throw e;
}`,
    interviewTrap: 'Daca uiti TTL-ul pe cheie, un crash al serverului in mijlocul procesarii blocheaza cheia definitiv!',
    keyTakeaway: 'Idempotency Keys + Lock atomic in Redis garanteaza executia o singura data (Exactly-Once Semantics).'
  },
  {
    id: 'sys-02',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Cache-Aside Pattern cu Redis: Flow si Invalidation',
    question: 'Explica pas cu pas modelul Cache-Aside. Cum gestionezi cache misses, scrierile si cum eviti Cache Stampede?',
    answer: 'Cache-Aside (Lazy Loading):\n1. Flow Citire (Read):\n   - Verifica Redis Cache dupa cheie.\n   - Cache Hit: Returneaza datele instant.\n   - Cache Miss: Citeste din PostgreSQL, scrie rezultatul in Redis cu TTL si il returneaza clientului.\n2. Flow Scriere (Write / Update):\n   - Actualizeaza baza de date relationala (System of Record).\n   - Dupa commit-ul reusit, STERGE (invalideaza) cheia din Redis cu DEL. Nu rescrie direct in cache pentru a evita race conditions.\n3. Cache Stampede: Cand o cheie populara expira si mii de request-uri concurente lovesc baza de date simultan. Se previne prin Mutex Lock pe redis (doar primul thread face query-ul, ceilalti asteapta) sau refresh anticipat asincron.',
    codeSnippet: `@Service
public class JobService {
    @Cacheable(value = "jobs", key = "#id")
    public JobPostingDto getJob(UUID id) {
        return jobRepo.findById(id).map(mapper::toDto).orElseThrow();
    }

    @CacheEvict(value = "jobs", key = "#id")
    @Transactional
    public void updateJob(UUID id, JobUpdateDto dto) {
        jobRepo.updateStatus(id, dto.getStatus());
    }
}`,
    interviewTrap: 'La actualizare: Scrie in DB, apoi sterge cheia din Cache. Nu modifica Redis inainte de DB.',
    keyTakeaway: 'Scrie in DB, apoi sterge cheia din Cache. Seteaza intotdeauna un TTL pe chei.'
  },
  {
    id: 'sys-03',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'PUT vs PATCH in specificatia REST',
    question: 'Care este diferenta semantica si practica intre metodele HTTP PUT si PATCH pe un endpoint REST?',
    answer: '1. HTTP PUT (Inlocuire Completa - Full Replacement):\n   - Este Idempotent: trimiterea aceluiasi request PUT de 10 ori produce acelasi rezultat.\n   - Clientul trimite INTREAGA resursa. Orice camp omis din payload va fi suprascris cu null sau valoarea default!\n2. HTTP PATCH (Actualizare Partiala - Partial Update):\n   - Clientul trimite DOAR campurile modificate (ex: status: "CLOSED"). Campurile neincluse in payload raman nemodificate in baza de date.',
    codeSnippet: `// PUT: Suprascrie tot obiectul (daca lipseste compania, devine null)
// PUT /api/v1/jobs/42 -> { "title": "Senior Dev", "salary": 4000 }

// PATCH: Modifica doar statusul, pastrand restul campurilor
// PATCH /api/v1/jobs/42 -> { "status": "INACTIVE" }`,
    interviewTrap: 'Daca folosesti @PutMapping dar in cod faci update doar la campurile nenule din JSON, incalci conventia REST. Foloseste @PatchMapping.',
    keyTakeaway: 'PUT inlocuieste resursa integral; PATCH modifica doar campurile trimise in cerere.'
  },
  {
    id: 'sys-04',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Kafka vs RabbitMQ: Cum alegi Message Broker-ul potrivit?',
    question: 'Care sunt diferentele de arhitectura dintre Apache Kafka si RabbitMQ si cand alegi fiecare solutie?',
    answer: '1. RabbitMQ (Traditional Message Broker):\n   - Bazat pe standardul AMQP cu cozi (Queues) si Exchanges.\n   - Mesajele sunt STERSE automat din coada dupa ce sunt confirmate (ACK).\n   - Ideal pentru: task-uri de fundal, rutare complexa, prioritizare mesaje, tranzactii financiare punctuale.\n2. Apache Kafka (Distributed Append-Only Commit Log):\n   - Mesajele sunt pastrate pe disc secvential intr-un log partajat pentru o perioada de retentie (ex: 7 zile).\n   - Consumatorii retin offset-ul si pot face REPLAY de mesaje.\n   - Ideal pentru: milioane de mesaje/secunda, audit logs, event streaming si pipeline-uri de analiza date in timp real.',
    codeSnippet: `// RabbitMQ: Queue unde mesajul dispare dupa ACK
// Producer -> Exchange -> Queue -> Consumer (ACK -> sters)

// Kafka: Log pe disc unde consumatorul doar muta un pointer
// Producer -> Topic (Partition 0, 1) -> Append la Log
// Consumer: citeste de la Offset 105`,
    interviewTrap: 'Kafka nu are cozi de Dead Letter individuale per mesaj atat de simple ca RabbitMQ. Un mesaj blocat necesita un Retry Topic separat.',
    keyTakeaway: 'RabbitMQ pentru rutare complexa de task-uri; Kafka pentru throughput masiv, streaming si mesaje durabile.'
  },
  {
    id: 'sys-05',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Circuit Breaker Pattern cu Resilience4j',
    question: 'Ce este si cum functioneaza un Circuit Breaker in arhitecturile de microservicii? Care sunt cele 3 stari ale sale?',
    answer: 'Circuit Breaker previne "efectul de cascada" (Cascading Failure): cand un serviciu downstream pica, elibereaza instant resursele fara a bloca thread-urile in asteptare.\n\nCele 3 stari:\n1. CLOSED (Normal): Toate apelurile trec. Se monitorizeaza rata de erori.\n2. OPEN (Cazut): Rata de eroare a depasit pragul (ex: 50%). Toate apelurile viitoare sunt respinse INSTANTANEU sau redirectionate spre FALLBACK fara a mai apela serviciul defect.\n3. HALF-OPEN (Testare): Dupa o perioada (ex: 10 secunde), permite cateva apeluri de proba. Daca reusesc, revine in CLOSED; daca pica, redevine OPEN.',
    codeSnippet: `@Service
public class PaymentClient {
    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResponse callGateway(PaymentRequest req) {
        return restTemplate.postForObject("/pay", req, PaymentResponse.class);
    }

    public PaymentResponse paymentFallback(PaymentRequest req, Throwable t) {
        return new PaymentResponse("QUEUED_FOR_RETRY");
    }
}`,
    interviewTrap: 'Metoda de fallback trebuie sa aiba exact aceeasi semnatura de parametri plus Throwable la final!',
    keyTakeaway: 'Resilience4j protejeaza sistemul de epuizarea thread-urilor si asigura graceful degradation.'
  },
  {
    id: 'sys-06',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Rate Limiting: Token Bucket vs Leaky Bucket',
    question: 'Cum functioneaza algoritmul Token Bucket pentru protectia API-urilor si de ce este cel mai popular model in productie?',
    answer: 'Token Bucket:\n1. O galeata (Bucket) are capacitate maxima (ex: 100 token-uri).\n2. Token-urile se adauga continuu la o rata fixa (ex: 10 token-uri/secunda).\n3. La fiecare apel de API, clientul consuma 1 token.\n4. Daca exista token-uri: Cererea este acceptata.\n5. Daca galeata este goala: Cererea este respinsa cu HTTP 429 Too Many Requests.\n\nAvantaj: Permite scurte "bursts" de trafic (pana la capacitatea maxima a galetii) pastrand media stabila pe termen lung. Se implementeaza distribuit cu Redis.',
    codeSnippet: `Bandwidth limit = Bandwidth.classic(50, Refill.greedy(10, Duration.ofSeconds(1)));
Bucket bucket = Bucket.builder().addLimit(limit).build();

if (bucket.tryConsume(1)) {
    return ResponseEntity.ok(processRequest());
} else {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header("Retry-After", "1")
        .body("Rata maxima depasita");
}`,
    interviewTrap: 'Daca folosesti memorie locala pe un pod K8s, clientul poate ocoli limita trimitand cereri spre alte pod-uri. Rate Limiter-ul trebuie stocat in Redis!',
    keyTakeaway: 'Token Bucket cu Redis protejeaza microserviciile de caderi prin respingerea rapida a cererilor peste limita.'
  },
  {
    id: 'sys-07',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'CAP Theorem: Consistency, Availability si Partition Tolerance',
    question: 'Ce afirma Teorema CAP si de ce in sistemele distribuite pe retea alegem mereu intre CP si AP?',
    answer: 'Teorema CAP afirma ca intr-un sistem distribuit este IMPOSIBIL sa oferi simultan toate cele 3 garantii:\n1. Consistency (C): Fiecare citire primeste cea mai recenta scriere sau o eroare.\n2. Availability (A): Fiecare request primeste un raspuns non-eroare (fara garantia ca e cel mai nou).\n3. Partition Tolerance (P): Sistemul continua sa functioneze chiar daca pachetele de retea se pierd sau reteaua se fragmenteaza intre noduri.\n\nDe ce alegem doar CP sau AP:\nIn lumea reala, Partition Tolerance (P) este OBLIGATORIE deoarece retelele fizice pica intotdeauna (cablu taiat, timeout, latenta). Asadar, cand apare o partitie de retea, poti alege:\n- CP (ex: PostgreSQL, HBase, Zookeeper): Refuza scrieri sau returneaza eroare pentru a garanta ca datele raman 100% consistente.\n- AP (ex: Cassandra, DynamoDB, CouchDB): Permite scrieri pe ambele noduri izolate pentru disponibilitate maxima, acceptand Eventual Consistency.',
    codeSnippet: `// Retea fragmentata: Nodul A nu poate vorbi cu Nodul B
// Daca alegi CP: Nodul A refuza scrierile (Availability picata, Date consistente)
// Daca alegi AP: Nodul A accepta scrieri (Availability maxima, Nodul B e temporar desincronizat)`,
    interviewTrap: 'Multi spun ca pot alege CA. In sisteme distribuite reale, "CA" este un mit pentru ca nicio retea nu are fiabilitate 100% fara partitii!',
    keyTakeaway: 'P este garantat in sistemele distribuite; arhitectul alege intre CP (consistenta bancara) si AP (disponibilitate social media).'
  }
];
