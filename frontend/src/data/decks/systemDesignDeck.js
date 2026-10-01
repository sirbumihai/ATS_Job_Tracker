// Deck Masiv: System Design, Scalabilitate, Caching, Cozi & Arhitecturi Distribuite
// Preluat din: donnemartin/system-design-primer, ByteByteGoHq/system-design-101, DopplerHQ
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
  },
  {
    id: 'sys-08',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Consistent Hashing si Noduri Virtuale (Virtual Nodes)',
    question: 'Ce problema rezolva Consistent Hashing la scalarea clusterelor de cache (Redis) sau baze de date si ce rol au Virtual Nodes?',
    answer: 'Problema cu Hashing-ul Clasic (hash(key) % N):\nDaca ai N servere si adaugi sau elimini un server (N+1 sau N-1), formula de modulo se schimba pentru aproape toate cheile! Drept urmare, 99% din chei se mapeaza pe alte noduri, cauzand un colaps total de cache miss.\n\nConsistent Hashing (Inelul de Hash):\n1. Reprezinta spatiul de hash ca un inel circular (de la 0 la 2^32 - 1).\n2. Atat nodurile de server cat si cheile sunt mapate pe acest inel.\n3. O cheie este stocata pe primul server intalnit in sensul acelor de ceasornic.\n4. La adaugarea/stergerea unui nod, doar K/N chei trebuie remapate (unde K este numarul total de chei), restul ramanand neatinse!\n\nRolul Virtual Nodes:\nDaca ai putine servere fizice, cheile s-ar putea distribui inegal pe inel (hotspots). Fiecare server fizic este mapat pe 100-200 de pozitii virtuale diferite pe inel (ex: Server1-A, Server1-B), asigurand o distributie uniforma a memoriei.',
    codeSnippet: `// Cautare in sens orar pe TreeMap in Java:
TreeMap<Long, Node> ring = new TreeMap<>();
long hash = hashFunction(key);
Long targetHash = ring.ceilingKey(hash);
if (targetHash == null) {
    targetHash = ring.firstKey(); // Inchiderea inelului circular
}
Node targetNode = ring.get(targetHash);`,
    interviewTrap: 'Fara noduri virtuale, adaugarea unui nod nou poate crea dezechilibre mari de trafic ("hotspots") pe nodul vecin imediat.',
    keyTakeaway: 'Consistent Hashing permite adaugarea sau scoaterea dinamica de noduri cu minimul absolut de remapare de date.'
  },
  {
    id: 'sys-09',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Teorema PACELC: Extensia CAP pentru Operare Normala',
    question: 'Ce completeaza Teorema PACELC peste Teorema CAP si de ce include compromisul dintre Latenta si Consistenta?',
    answer: 'Teorema CAP descrie comportamentul unui sistem DOAR atunci cand reteaua este fragmentata (Partition Tolerance).\nTeorema PACELC raspunde la intrebarea: Ce se intampla cand reteaua functioneaza NORMAL (Else)?\n\nStructura PACELC (If Partition -> Availability or Consistency | Else -> Latency or Consistency):\n- Daca exista o partitie de retea (P): alegi intre Disponibilitate (A) si Consistenta (C).\n- ELSE (In mod normal, fara defectiuni): alegi intre Latenta (L) si Consistenta (C).\n\nExemple de Sisteme:\n1. PA/EL (ex: DynamoDB, Cassandra): In mod normal prioritizeaza Latenta redusa (L), iar in partitie prioritizeaza Disponibilitatea (A).\n2. PC/EC (ex: BigTable, HBase, PostgreSQL Master): Prioritizeaza Consistenta atat in caz de partitie (C) cat si in mod normal (C, acceptand latenta mai mare pentru confirmari de sincronizare).',
    codeSnippet: `// Clasificare PACELC:
// PA/EL: Cassandra, DynamoDB (Optimizate pentru latenta minima si disponibilitate)
// PC/EC: Spanner, HBase (Optimizate pentru consistenta garantata cu cost de latenta)`,
    interviewTrap: 'Multi ingineri ignora starea normala a sistemului; majoritatea timpului reteaua merge bine, deci trade-off-ul real zilnic este Latenta vs Consistenta!',
    keyTakeaway: 'PACELC ofera o imagine completa a arhitecturii: P-A/C in crize si E-L/C in conditii normale.'
  },
  {
    id: 'sys-10',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Event Sourcing si CQRS Architecture',
    question: 'Cum functioneaza Event Sourcing impreuna cu CQRS si de ce nu se mai stocheaza starea curenta intr-un tabel clasic?',
    answer: '1. Event Sourcing:\nIn loc sa faci UPDATE pe un rand de baza de date (stocand doar starea curenta), aplicatia salveaza o serie imutabila append-only de Evenimente de Domeniu (Domain Events): JobCreatedEvent, JobUpdatedEvent, JobPublishedEvent, ApplicationReceivedEvent.\n- Starea curenta a oricarui obiect poate fi reconstituita oricand prin "replaying" (re-rularea) tuturor evenimentelor din trecut.\n- Ofera istoric si audit nativ de 100% de la inceputul timpurilor.\n\n2. CQRS (Command Query Responsibility Segregation):\nSepara modelul de scriere (Commands) de modelul de citire (Queries):\n- Write Side: Primeste comenzi de business, valideaza logica si salveaza evenimentul in Event Store (append-only rapid).\n- Read Side: Un proces de proiectie asincron asculta evenimentele si populeaza baze de date optimizate pentru citire (Elasticsearch pentru cautare, Redis pentru cache, Postgres DTO tables).',
    codeSnippet: `// Eveniment imutabil salvat in append-only log:
public record ApplicationStatusChangedEvent(
    UUID applicationId,
    String oldStatus,
    String newStatus,
    Instant timestamp,
    String updatedBy
) implements DomainEvent {}`,
    interviewTrap: 'Event Sourcing adauga complexitate masiva si consistenta eventuala (Eventual Consistency); foloseste-l doar unde istoricul si auditul sunt cerinte fundamentale (FinTech, Logistica).',
    keyTakeaway: 'Event Sourcing pastreaza faptele imutabile din trecut, iar CQRS construieste proiectii de citire optimizate pentru fiecare client.'
  },
  {
    id: 'sys-11',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Lock-uri Distribuite cu Redis: De la SETNX la Redlock',
    question: 'Cum implementezi un Lock Distribuit corect in Redis si de ce simplul SETNX nu este suficient in clustere multi-nod?',
    answer: '1. Lock pe un singur nod Redis:\nSe foloseste comanda atomica: SET resource_name my_random_value NX PX 30000\n- NX: Creeaza cheia doar daca nu exista deja (Mutual Exclusion).\n- PX 30000: Adauga TTL de 30 secunde pentru a preveni blocarea definitiva in caz de crash.\n- my_random_value: Un UUID unic per thread apelant. La deblocare, se foloseste un script Lua atomic pentru a verifica daca UUID-ul coincide inainte de a sterge cheia (pentru a nu sterge lock-ul altui proces a carui durata a expirat).\n\n2. De ce esueaza pe cluster Redis Master-Replica:\nReplicarea Redis este asincrona! Daca Clientul 1 ia lock pe Master si Masterul pica inainte de a trimite cheia catre Replica, Replica este promovata Master si Clientul 2 poate obtine acelasi lock in paralel!\n\nSolutie: Algoritmul Redlock (Martin Kleppmann / Antirez)\nClientul incearca sa obtina lock-ul pe 5 instante independente de Redis. Lock-ul este considerat castigat doar daca o majoritate (minim 3 din 5) confirma inainte de expirarea timeout-ului.',
    codeSnippet: `-- Script Lua pentru eliberare sigura a lock-ului atomic:
if redis.call("get", KEYS[1]) == ARGV[1] then
    return redis.call("del", KEYS[1])
else
    return 0
end`,
    interviewTrap: 'Daca timpul de procesare depaseste TTL-ul setat pe lock (din cauza unui Garbage Collection lung sau I/O lent), lock-ul expira automat si alt thread intra in zona critica! Este nevoie de un "watchdog" (precum Redisson) care prelungeste automat lock-ul.',
    keyTakeaway: 'Foloseste intotdeauna UUID unic per apel si verificare atomica Lua la deblocare pentru a preveni eliberarea accidentala a lock-ului altui thread.'
  },
  {
    id: 'sys-12',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Load Balancing: L4 (Transport) vs L7 (Application)',
    question: 'Care este diferenta dintre un Load Balancer L4 si un Load Balancer L7 si cand il folosesti pe fiecare?',
    answer: '1. Load Balancer L4 (Transport Layer - TCP/UDP):\n- Ia decizii de rutare bazate exclusiv pe pachetele de retea (Adresa IP si Port TCP/UDP).\n- NU inspecteaza continutul pachetelor (nu stie ce este HTTP, URL, cookies sau JSON).\n- Throughput extrem de mare, procesare la nivel de kernel de retea.\n- Exemple: AWS NLB (Network Load Balancer), IPVS, HAProxy in mod TCP.\n\n2. Load Balancer L7 (Application Layer - HTTP/HTTPS):\n- Termina conexiunea TLS si inspecteaza corpul cererii HTTP (URL path, Cookies, Headere, User-Agent).\n- Permite rutare inteligenta: /api/jobs -> Serviciul Jobs, /api/payments -> Serviciul Payments.\n- Permite Sticky Sessions pe baza de cookie si injectare de headere de securitate.\n- Exemple: Nginx, AWS ALB (Application Load Balancer), Envoy, Traefik.',
    codeSnippet: `# Exemplu rutare L7 bazata pe Path in Nginx / ALB:
location /api/jobs {
    proxy_pass http://job_service_cluster;
}
location /api/auth {
    proxy_pass http://auth_service_cluster;
}`,
    interviewTrap: 'L7 consuma mult mai mult CPU si RAM decat L4 deoarece trebuie sa decripteze SSL/TLS si sa parseze antetele HTTP pentru fiecare apel.',
    keyTakeaway: 'Foloseste L4 la intrarea de infrastructura pentru throughput masiv si L7 pentru rutare inteligenta de microservicii.'
  },
  {
    id: 'sys-13',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Sharding de Baze de Date: Strategii si Provocari Arhitecturale',
    question: 'Ce este Sharding-ul orizontal, cum alegi cheia de sharding (Shard Key) si ce probleme creeaza operatiunile Cross-Shard?',
    answer: 'Sharding-ul este partitionarea orizontala a datelor pe masini (servere) fizice complet independente.\n\nStrategii de Sharding:\n1. Hash-based Sharding: shard_id = hash(user_id) % total_shards. Distribuie datele perfect uniform, dar face interogarile de tip range extrem de ineficiente.\n2. Range-based Sharding: Shard 1 pentru utilizatori A-F, Shard 2 pentru G-M etc. Permite scanari rapide pe intervale, dar poate crea "Hot Shards" (aglomerari pe anumite litere sau intervale temporale).\n3. Directory-based / Entity-based Sharding: Un serviciu central de lookup memoreaza ce entitate pe ce shard se afla.\n\nProvocari Majore ale Sharding-ului:\n1. Cross-Shard Joins: Nu mai poti face JOIN intre tabele aflate pe servere fizice diferite; aplicatia trebuie sa faca join-ul in memorie sau prin apeluri paralele.\n2. Tranzactii Distribuite: Salvarea datelor pe doua shard-uri diferite necesita 2PC sau Saga, cu impact masiv pe performanta.\n3. Re-sharding: Cresterea numarului de shard-uri necesita mutari complexe de date in timp ce sistemul este online.',
    codeSnippet: `// Shard Router logic in aplicatie:
int shardIndex = Math.abs(userId.hashCode()) % shardDataSources.size();
DataSource targetDb = shardDataSources.get(shardIndex);`,
    interviewTrap: 'Alegerea unei shard key gresite (de exemplu data curenta sau o valoare cu putine variante) va trimite tot traficul pe un singur server, lasand restul goale.',
    keyTakeaway: 'Alege ca Shard Key un identificator cu cardinalitate mare si uniform distribuit (ex: user_id sau tenant_id).'
  },
  {
    id: 'sys-14',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'CDN (Content Delivery Network): Edge Caching si Strategii',
    question: 'Cum functioneaza o retea CDN, care este diferenta dintre Push CDN si Pull CDN si cum optimizeaza latenta?',
    answer: 'Un CDN este o retea distribuita global de servere Proxy (PoPs - Points of Presence) plasate strategic in apropierea utilizatorilor finali (Edge).\n\nOptimizare Latenta:\nIn loc ca un utilizator din Tokio sa descarce un fisier de 5 MB de la serverul de origine din Frankfurt (latenta 250ms), el primeste fisierul din serverul Edge local din Tokio (latenta 5ms).\n\nStrategii CDN:\n1. Pull CDN (Cel mai comun):\n- CDN-ul nu contine fisiere initial.\n- Cand un utilizator cere o resursa, daca e Cache Miss pe Edge, CDN-ul o descarca automat ("trage" resursa) de la serverul de origine, o stocheaza local cu un antet Cache-Control: max-age=86400 si o serveste.\n- Perfect pentru trafic mare si variat; consum minim de stocare pe edge.\n2. Push CDN:\n- Aplicatia urca proactiv noile versiuni de fisiere direct pe CDN la fiecare deployment sau modificare (ex: build nou de frontend React).\n- Ideal pentru site-uri cu putine fisiere modificate rar, garantand ca primul utilizator nu va avea cache miss niciodata.',
    codeSnippet: `// Antet HTTP pe serverul de origine pentru CDN Caching:
Cache-Control: public, max-age=31536000, immutable
ETag: "9b8a-6058f4a2"`,
    interviewTrap: 'Daca folosesti nume de fisiere fixe (ex: app.js) si pui max-age de 1 an pe CDN, utilizatorii nu vor vedea noile versiuni dupa deploy! Foloseste mereu "cache-busting" cu hash in numele fisierului: app.a3f12b.js.',
    keyTakeaway: 'CDN-ul descarca serverele de origine de peste 90% din traficul de fisiere statice si accelereaza incarcarea globala.'
  },
  {
    id: 'sys-15',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'REST vs GraphQL vs gRPC: Criterii de Decizie Arhitecturala',
    question: 'Cand alegi gRPC pentru comunicarea interna intre microservicii in defavoarea REST-ului sau GraphQL-ului?',
    answer: '1. REST (JSON peste HTTP/1.1):\n- Standard universal pentru API-uri publice externe consumate de browsere si clienti terti.\n- Lizibil de oameni, caching nativ prin headere HTTP, decuplare buna, dar sufera de over-fetching/under-fetching si payload mare JSON (text).\n\n2. GraphQL:\n- Ideal pentru aplicatii Frontend complexe cu UI bogat (mobile/web) unde clientul specifica exact campurile cerute intr-un singur apel.\n- Dezavantaj: Caching greu la nivel HTTP, risc de query-uri abuzive complexe construite de clienti.\n\n3. gRPC (Protocol Buffers peste HTTP/2):\n- Alegerea de AUR pentru comunicare interna Service-to-Service intre microservicii:\n  - Format Binar Protobuf: Payload de 5-10 ori mai mic decat JSON si serializare/deserializare extrem de rapida in memorie.\n  - Multiplexare HTTP/2: Sute de apeluri paralele pe o singura conexiune TCP.\n  - Suport bidirectional de streaming nativ si contracte stricte tipizate generate automat (.proto).',
    codeSnippet: `// Fisier contract schema .proto:
syntax = "proto3";
service JobService {
  rpc GetJob (JobRequest) returns (JobResponse);
}
message JobRequest {
  string job_id = 1;
}
message JobResponse {
  string title = 1;
  int32 salary = 2;
}`,
    interviewTrap: 'Browserele web nu suporta nativ apeluri gRPC directe din Javascript fara un proxy intermediar (gRPC-Web); gRPC este destinat in principal comunicarii backend-to-backend.',
    keyTakeaway: 'Foloseste REST/GraphQL la frontiera publica pentru clienti web si gRPC in interiorul clusterului privat pentru viteza si contracte stricte.'
  },
  {
    id: 'sys-16',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Active-Active Multi-Master si Rezolvarea Conflictelor',
    question: 'De ce este extrem de dificila replicarea Multi-Master si cum se rezolva conflictele concurente de scriere?',
    answer: 'In configuratia Multi-Master (Active-Active), clientii pot scrie simultan in aceeasi milisecunda pe servere diferite (ex: Serverul SUA si Serverul Europa).\nDaca utilizatorul isi modifica numele in "Alex" pe Serverul SUA si in "Mihai" pe Serverul Europa, la sincronizarea asincrona apare un conflict de scriere direct (Write Conflict).\n\nStrategii de Rezolvare a Conflictelor:\n1. Last-Write-Wins (LWW):\n- Fiecare scriere are un timestamp. Baza de date pastreaza scrierea cu cel mai mare timestamp.\n- Problema: Ceasurile fizice ale serverelor nu sunt niciodata perfect sincronizate (Clock Drift / NTP skew), putand duce la pierderea de date reale.\n2. Vector Clocks / Lamport Timestamps:\n- Urmaresc cauzalitatea logica a evenimentelor pentru a detecta cand doua modificari sunt concurente.\n3. CRDT (Conflict-free Replicated Data Types):\n- Structuri de date matematice speciale care converg automat la aceeasi stare finala indiferent de ordinea primirii mesajelor (ex: counter-uri, seturi).\n4. Conflict Resolution la Nivel de Aplicatie:\n- Baza stocheaza ambele versiuni ca un conflict (asemanator cu Git merge conflict), lasand logica de business sa decida.',
    codeSnippet: `// Exemplu LWW (Last-Write-Wins):
if (incomingUpdate.timestamp > currentRecord.timestamp) {
    applyUpdate(incomingUpdate);
} else {
    discardUpdate(); // Risc de pierdere a datelor cauzat de clock drift
}`,
    interviewTrap: 'Replicarea Multi-Master nu ofera consistenta ACID clasica fara coordonare costisitoare; majoritatea companiilor prefera Single-Master cu Read Replicas pentru simplitate.',
    keyTakeaway: 'Replicarea Multi-Master aduce disponibilitate geografica dar introduce complexitatea masiva a rezolvarii conflictelor de scriere.'
  },
  {
    id: 'sys-17',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Write-Heavy vs Read-Heavy System Design',
    question: 'Cum difera arhitectura unui sistem Read-Heavy (ex: Twitter) fata de un sistem Write-Heavy (ex: Log/IoT Ingestion)?',
    answer: '1. Sisteme Read-Heavy (Raport 100:1 sau 1000:1 citiri/scrieri):\n- Bottleneck-ul este throughput-ul de SELECT si latenta de afisare.\n- Arhitectura Optima:\n  - Caching agresiv pe multiple straturi (CDN la margini, Redis in cluster, in-memory cache local Guava/Caffeine).\n  - Read Replicas scalate orizontal pentru baza de date relationala.\n  - Denormalizare calculata si tabele de proiectii precalculate (materialized views).\n\n2. Sisteme Write-Heavy (Raport 10:1 sau mai mult scrieri):\n- Bottleneck-ul este viteza de scriere pe disc, lock contention si overhead-ul de recalculare indecsi.\n- Arhitectura Optima:\n  - Baze de date bazate pe LSM-Tree (Log-Structured Merge-tree) precum Cassandra, ScyllaDB sau RocksDB, care scriu secvential in memorie (MemTable) si pe disc fara random I/O.\n  - Mesagerie tampon (Kafka) la intrare: Toate scrierile sunt receptionate asincron in log si procesate in loturi (batch insert) pentru a nu sufoca baza de date.\n  - Eliminarea indecsilor secundari inutili.',
    codeSnippet: `// Write-Heavy: Ingestion asincron prin Kafka batching:
@KafkaListener(topics = "telemetry", batch = "true")
public void handleBatch(List<TelemetryEvent> events) {
    jdbcTemplate.batchUpdate("INSERT INTO telemetry VALUES (?, ?)", events);
}`,
    interviewTrap: 'Daca pui 10 indecsi pe o tabela intr-un sistem Write-Heavy, fiecare INSERT va forta 10 scrieri aleatorii de noduri B-Tree pe disc, blocand I/O-ul sistemului.',
    keyTakeaway: 'Pentru Read-Heavy optimizeaza caching-ul si denormalizarea; pentru Write-Heavy foloseste LSM-Trees, Kafka si scrieri in batch.'
  },
  {
    id: 'sys-18',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Proiectarea unui Sistem de Notificari la Scara Mare',
    question: 'Care sunt componentele cheie pentru un serviciu care trimite 100 de milioane de notificari zilnic (Push, SMS, Email)?',
    answer: 'Componentele de baza ale unui Notification Engine:\n1. API Gateway & Rate Limiter: Valideaza cererile si previne abuzurile de trimitere.\n2. Cozi de Prioritizare (Kafka Topics):\n   - Coada Critica (High Priority): Coduri OTP 2FA, alerte de securitate (livrare in <2 secunde).\n   - Coada Normala: Confirmari de aplicare job, mesaje de chat.\n   - Coada Bulk (Low Priority): Newslettere, alerte promotionale zilnice.\n3. Workers & Integrari cu Third-Party Providers: Servicii paralele care apeleaza Firebase (FCM) pentru Push, Twilio pentru SMS, Sendgrid/SES pentru Email.\n4. Notification Deduplication & Throttling: Foloseste Redis pentru a se asigura ca un utilizator nu primeste mai mult de 5 notificari pe ora si ca aceeasi notificare nu este trimisa de doua ori.\n5. Agregare (Notification Digest): Grupeaza 10 aprecieri intr-o singura notificare ("Ion si alti 9 oameni ti-au apreciat profilul").',
    codeSnippet: `// Schema de prioritizare cu Kafka:
// Topic: notifications.critical (50 partitions) -> OTP Workers
// Topic: notifications.normal (20 partitions) -> Business Workers
// Topic: notifications.bulk (10 partitions) -> Marketing Workers`,
    interviewTrap: 'Nu trimite notificari sincron in request-ul utilizatorului; furnizorii externi (Apple APNS, Twilio) au latente variabile si pot bloca thread-urile.',
    keyTakeaway: 'Separarea cozilor pe prioritati si izolarea integrarii externe asigura livrarea instant a mesajelor critice.'
  },
  {
    id: 'sys-19',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Proiectare URL Shortener (TinyURL): Algoritm si HTTP 301 vs 302',
    question: 'Cum convertesti un URL lung intr-un cod scurt de 7 caractere si care este diferenta dintre redirectionarea HTTP 301 si HTTP 302?',
    answer: '1. Algoritmul de Codificare (Base62):\n- Setul de caractere contine [0-9, a-z, A-Z] = 62 de caractere posibile.\n- Un ID scurt de 7 caractere ofera 62^7 = ~3.5 trilioane de combinatii unice!\n- In loc de hashing MD5 (care poate avea coliziuni), se foloseste un Distributed ID Generator (auto-increment pe 64 de biti) si se converteste numarul zecimal in baza 62.\n\n2. HTTP 301 Moved Permanently vs HTTP 302 Found:\n- 301 (Permanent): Browserul memoreaza redirectionarea in cache-ul local. La urmatoarele accesari, browserul sare direct la linkul tinta fara a mai atinge serverul TinyURL. Avantaj: Incarcare rapida, mai putin trafic pe server. Dezavantaj: Nu poti numara click-urile si datele analitice!\n- 302 (Temporary Redirect): Fiecare click atinge obligatoriu serverul TinyURL inainte de redirectionare. Permite colectarea precisa de statistici si contorizarea vizitelor.',
    codeSnippet: `public static String encodeBase62(long num) {
    String chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    StringBuilder sb = new StringBuilder();
    while (num > 0) {
        sb.append(chars.charAt((int) (num % 62)));
        num /= 62;
    }
    return sb.reverse().toString();
}`,
    interviewTrap: 'Folosirea hash-ului MD5 sau SHA-256 trunchiat duce la coliziuni de chei; conversia unui ID numeric secvential in Base62 garanteaza unicitate 100% matematica fara coliziuni.',
    keyTakeaway: 'Base62 peste un generator de ID-uri unice asigura lungime fixa si zero coliziuni, iar HTTP 302 permite analiza click-urilor.'
  },
  {
    id: 'sys-20',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Bloom Filters: Structuri Probabilistice de Date',
    question: 'Ce este un Bloom Filter, care sunt caracteristicile sale O(1) si ce inseamna ca "nu are niciodata False Negatives"?',
    answer: 'Un Bloom Filter este o structura de date probabilistica ultra-eficienta in spatiu utilizata pentru a testa daca un element este membru al unei colectii.\n\nCaracteristici Fundamentale:\n1. Memorie minuscula: Un Bloom Filter poate retine 1 miliard de URL-uri in doar cativa megabytes de RAM.\n2. Raspunsuri Posibile:\n   - "Cu siguranta NU exista": 100% Garantat! Nu exista False Negatives niciodata. Daca Bloom Filter zice ca elementul nu exista, nu este nevoie sa cauti pe disc sau in DB!\n   - "S-ar putea sa existe": Exista o mica probabilitate de False Positive (elementul nu e in set, dar bitii coincid). In acest caz se face verificarea reala in baza de date.\n3. Functionare: Foloseste o matrice de biti si K functii de hash independente. La adaugare, seteaza bitii corespunzatori pe 1. La verificare, daca oricare dintre cei K biti este 0, elementul clar nu a fost adaugat niciodata.',
    codeSnippet: `// Utilizare clasica: Evitarea interogarilor inutile pe disc in PostgreSQL/Cassandra
if (!bloomFilter.mightContain(url)) {
    // Sigur 100% nu exista in DB -> returneaza 404 instant fara a atinge discul!
    return false;
}
// Altfel, citeste din baza de date pentru confirmare:
return database.exists(url);`,
    interviewTrap: 'Elementele nu pot fi sterse dintr-un Bloom Filter clasic, deoarece stergerea (setarea unui bit pe 0) ar corupe datele altor elemente care impart acelasi bit hash.',
    keyTakeaway: 'Bloom Filter economiseste milioane de operatiuni I/O de disc prin eliminarea instantanee a elementelor inexistente.'
  },
  {
    id: 'sys-21',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Social Media Feed: Fan-Out on Write vs Fan-Out on Read',
    question: 'Cum proiectezi sistemul de News Feed (Twitter/LinkedIn) si cum rezolvi "The Celebrity Problem" prin modelul hibrid?',
    answer: '1. Fan-out on Write (Push Model):\n- Cand un utilizator posteaza un mesaj, sistemul cauta toti urmaritorii (followers) si INSEREAZA postarea direct in cutia lor personala de feed (in Redis list/zset).\n- Citire (Read): Instantanee O(1)! Fiecare user isi citeste lista precalculata direct din memorie.\n- Problema: Daca o celebritate cu 50 de milioane de followers (ex: Elon Musk) posteaza, sistemul trebuie sa faca 50 de milioane de scrieri in Redis pentru o singura postare! Latenta de scriere colapseaza.\n\n2. Fan-out on Read (Pull Model):\n- Postarea se salveaza doar in tabela autorului.\n- La citire, sistemul trage postarile tuturor persoanelor urmarite si le sorteaza in timp real.\n- Scriere rapida O(1), dar citirea devine extrem de grea si lenta.\n\n3. Modelul Hibrid (Solutia de Productie):\n- Pentru 99% din utilizatori obisnuiti: Foloseste Fan-out on Write (Push).\n- Pentru celebritati (>50.000 followers): Postarile lor NU sunt impinse in feed-urile milioanelor de fani. Cand un utilizator isi deschide feed-ul, sistemul citeste feed-ul precalculat si interclaseaza dinamic doar postarile recente ale celebritatilor pe care le urmareste!',
    codeSnippet: `// In Redis: Feed-ul unui utilizator este un Sorted Set (ZSET):
// ZADD feed:userId <timestamp> <postId>
// ZREVRANGE feed:userId 0 19 (Extrage cele mai noi 20 de postari)`,
    interviewTrap: 'Daca alegi exclusiv Push sau exclusiv Pull, vei pica intrebarea de design de feed la interviurile mari; modelul hibrid este singurul care scaleaza la scara larga.',
    keyTakeaway: 'Modelul hibrid combina viteza O(1) a Push-ului pentru useri normali cu flexibilitatea Pull-ului pentru conturi celebre.'
  },
  {
    id: 'sys-22',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Chat in Timp Real: WebSockets vs SSE vs Long Polling',
    question: 'Cum alegi intre WebSockets, Server-Sent Events (SSE) si Long Polling pentru un sistem de mesagerie instant?',
    answer: '1. WebSockets (Bidirectional Full-Duplex):\n- Se deschide o conexiune persistenta TCP prin protocolul ws:// sau wss:// dupa un handshake HTTP initial.\n- Atat clientul cat si serverul pot trimite mesaje oricand fara overhead de headere HTTP.\n- Ideal pentru: Chat in timp real (WhatsApp/Slack), jocuri multiplayer, instrumente de colaborare grafica.\n\n2. Server-Sent Events (SSE - Unidirectional Server-to-Client):\n- Conexiune persistenta HTTP standard (text/event-stream) unde DOAR serverul impinge date catre client.\n- Reconnect automat nativ in browser, functioneaza peste HTTP/2 fara probleme de proxy.\n- Ideal pentru: Notificari in timp real, feed-uri live de preturi actiuni, streaming de raspunsuri text de la LLM-uri (ChatGPT).\n\n3. Long Polling:\n- Clientul trimite o cerere HTTP normala; serverul tine conexiunea deschisa pana cand are date noi, apoi raspunde si conexiunea se inchide. Clientul deschide imediat o noua cerere.\n- Overhead mare de headere HTTP repetate; utilizat astazi doar ca mecanism de fallback pentru retele sau browsere foarte vechi.',
    codeSnippet: `// WebSockets in Spring Boot:
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-chat").withSockJS();
    }
}`,
    interviewTrap: 'Daca ai nevoie doar de streaming de la server spre client (cum ar fi raspunsurile generate de AI), folosirea WebSockets este over-engineering; SSE este mult mai simplu si robust.',
    keyTakeaway: 'WebSockets pentru interactiuni bidirectionale intense; Server-Sent Events pentru fluxuri de date de la server catre client.'
  },
  {
    id: 'sys-23',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Proiectare Typeahead / Autocomplete Search cu Trie',
    question: 'Ce structura de date asigura sugestii de cautare (Autocomplete) in mai putin de 20ms si cum optimizezi memoria la milioane de interogari?',
    answer: 'Structura de Baza: Trie (Prefix Tree)\nUn arbore in care fiecare nod reprezinta un caracter. Cautarea tuturor cuvintelor care incep cu un prefix (ex: "jav") este O(K), unde K este lungimea prefixului, complet independenta de numarul total de cuvinte stocate!\n\nOptimizari Critice pentru Productie:\n1. Top-K Caching in Noduri: Pentru a nu parcurge toate nodurile copil la fiecare cautare, fiecare nod memoreaza deja cele mai populare 5 sugestii cu scorul lor de cautare (Top 5). Astfel, la gasirea nodului prefixului, returnezi sugestiile in O(1) instant!\n2. Agregare Asincrona de Date: Un pipeline Kafka + Spark/Flink citeste logurile de cautare si recalculeaza frecventele cuvintelor in fundal, actualizand arborele Trie periodic.\n3. Distributie si Caching: Arborele Trie este serializat si stocat in memoria unui cluster Redis sau CDN Edge pentru latente sub 10ms.',
    codeSnippet: `class TrieNode {
    Map<Character, TrieNode> children = new HashMap<>();
    List<String> topSuggestions = new ArrayList<>(); // Top 5 precalculate
    boolean isWord = false;
}`,
    interviewTrap: 'Nu rula interogari SQL de tip SELECT word FROM dictionary WHERE word LIKE \'termen%\' ORDER BY frequency DESC la fiecare apasare de tasta; vei distruge baza de date!',
    keyTakeaway: 'Prefix Tree-ul (Trie) cu Top-K memorat direct in noduri ofera raspunsuri de completare automata in O(1) la viteza luminii.'
  },
  {
    id: 'sys-24',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Generarea de ID-uri Unice Distribuite: Twitter Snowflake',
    question: 'De ce UUIDv4 creeaza fragmentare grava in indecsii B-Tree si cum genereaza algoritmul Twitter Snowflake ID-uri de 64 de biti ordonate temporal?',
    answer: 'Problema cu UUIDv4 (128 de biti complet aleatorii):\nGenerarea aleatorie rupe ordinea din indecsii B-Tree! Fiecare nou INSERT trebuie plasat intr-o pagina aleatorie din arbore, cauzand Page Splitting frecvent, fragmentare de memorie si degradare severa a performantei de scriere.\n\nTwitter Snowflake (ID pe 64 de biti - Long):\nGenereaza ID-uri numerice intregi care cresc continuu in timp (roughly time-sorted), incadrandu-se perfect intr-un tip BIGINT SQL:\n- 1 bit nefolosit (intotdeauna 0, pastreaza numarul pozitiv).\n- 41 biti: Timestamp in milisecunde de la o epoca custom (ofera suport pentru ~69 de ani).\n- 10 biti: Machine / Worker ID (suporta pana la 1024 de servere/containere concurente fara coordonare).\n- 12 biti: Numar de Secventa (Sequence Number) local (permite generarea a pana la 4096 de ID-uri unice per milisecunda per masina).\n\nCapacitate totala: Peste 4 milioane de ID-uri unice pe secunda per nod, sortate nativ dupa data!',
    codeSnippet: `// Structura unui Snowflake ID pe 64 de biti:
// [1b semn] [41b timestamp] [10b worker_id] [12b sequence]
long id = ((timestamp - EPOCH) << 22) | (workerId << 12) | sequence;`,
    interviewTrap: 'Daca ceasul unui server o ia inapoi (Clock Regression cauzata de sincronizari NTP), Snowflake poate genera ID-uri duplicate; implementarea trebuie sa astepte pana cand ceasul ajunge din nou la ultimul timestamp.',
    keyTakeaway: 'Snowflake ofera ID-uri compacte pe 64 de biti, native pentru SQL, sortate temporal si generate distribuit fara blocaje.'
  },
  {
    id: 'sys-25',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Backpressure in Sisteme Asincrone si Reactive',
    question: 'Ce este Backpressure intr-un flux de procesare de date si ce strategii exista cand producatorul este mult mai rapid decat consumatorul?',
    answer: 'Backpressure este mecanismul prin care un consumator lent semnaleaza unui producator rapid ca nu mai poate face fata volumului de date, prevenind colapsul memoriei (OutOfMemoryError).\n\nStrategii de Rezolvare a Dezechilibrului:\n1. Control al Ritmului (Reactive Streams): Consumatorul solicita explicit un numar de elemente: request(n). Producatorul trimite fix n mesaje si se opreste pana la urmatoarea cerere.\n2. Buffer cu Limita (Bounded Buffer): Mesajele se acumuleaza intr-o coada fixa. Daca coada se umple, se aplica o politica:\n   - Block Producer: Producatorul este pus in asteptare.\n   - Drop Latest / Drop Oldest: Arunca cele mai noi sau cele mai vechi mesaje (folosit la date de senzori/streaming video).\n3. Autoscaling pe baza de Lag: Daca Consumer Lag-ul din Kafka depaseste un prag, se scaleaza automat numarul de instante de consumatori.',
    codeSnippet: `// In Project Reactor / WebFlux:
Flux.range(1, 1000)
    .onBackpressureBuffer(50, () -> log.warn("Buffer plin!"))
    .subscribe(new BaseSubscriber<Integer>() {
        @Override
        protected void hookOnNext(Integer value) {
            request(1); // Cere un singur element odata (Pull-based backpressure)
        }
    });`,
    interviewTrap: 'Folosirea unei cozi nelimitate in memorie (Unbounded Queue) este un anti-pattern grav; sub trafic mare aplicatia va muri inevitabil cu OutOfMemoryError.',
    keyTakeaway: 'Backpressure protejeaza stabilitatea aplicatiei permitand consumatorului sa dicteze ritmul de procesare.'
  },
  {
    id: 'sys-26',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Bulkhead Pattern: Izolarea Resurselor pentru Rezilienta',
    question: 'Ce este Bulkhead Pattern in arhitectura software si cum previne blocarea intregii aplicatii cand o componenta esueaza?',
    answer: 'Metafora provine din constructia navelor: corpul vaporului este impartit in compartimente etanse (bulkheads). Daca apa patrunde intr-o camera, doar acel compartiment este inundat, iar nava continua sa pluteasca.\n\nIn Arhitecturi Software:\nFiecare dependinta sau serviciu extern primeste un Thread Pool sau Connection Pool strict izolat.\nDaca serviciul de Recomandari devine extrem de lent si blocheaza toate cele 10 fire alocate lui, acest lucru NU afecteaza pool-ul de 50 de fire dedicat serviciului critic de Checkout/Plati! Utilizatorii pot plati in continuare chiar daca recomandarile sunt temporar indisponibile.',
    codeSnippet: `@Bulkhead(name = "recommendationService", type = Bulkhead.Type.THREADPOOL)
public CompletableFuture<List<JobDto>> getRecommendations() {
    return CompletableFuture.supplyAsync(() -> client.fetchRecommendations());
}`,
    interviewTrap: 'Daca toate serviciile partajeaza un singur pool comun de thread-uri (ex: ForkJoinPool.commonPool()), o singura dependinta lenta va epuiza toate thread-urile si va dobori toata aplicatia.',
    keyTakeaway: 'Bulkhead Pattern izoleaza resursele de executie pentru ca problemele dintr-un modul periferic sa nu propage defectiunea la modulele de baza.'
  },
  {
    id: 'sys-27',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Proiectare Sistem de Video Streaming (YouTube / Netflix)',
    question: 'Cum se transmit fisiere video de gigabytes catre milioane de dispozitive fara buffering si ce rol au protocoalele HLS si DASH?',
    answer: 'Componentele de Streaming Modern:\n1. Transcodare Asincrona: Cand utilizatorul urca un video brut (MP4 4K de 2 GB), o ferma de workere il sparge in fragmente mici (chunks) de 2-10 secunde si le transcodeaza in multiple rezolutii (1080p, 720p, 480p, 360p) folosind FFmpeg.\n2. Adaptive Bitrate Streaming (HLS & MPEG-DASH):\n   - Clientul primeste un fisier manifest (playlist .m3u8) care contine lista fragmentelor video si calitatile disponibile.\n   - Playerul din browser masoara continuu viteza de descarcare a retelei utilizatorului in timp real. Daca reteaua scade, cere urmatorul fragment de 4 secunde la 480p; daca reteaua se imbunatateste, comuta instantaneu la 1080p fara intreruperea redarii!\n3. Distributie masiva prin CDN: Fragmentele video (.ts sau .m4s) sunt fisiere statice imutabile, cached masiv la marginea retelei in CDN-uri locale.',
    codeSnippet: `# Exemplu Playlist Manifest HLS (.m3u8):
#EXTM3U
#EXT-X-STREAM-INF:BANDWIDTH=5000000,RESOLUTION=1920x1080
1080p/index.m3u8
#EXT-X-STREAM-INF:BANDWIDTH=1500000,RESOLUTION=1280x720
720p/index.m3u8`,
    interviewTrap: 'Transmiterea unui fisier video gigant ca un singur download HTTP MP4 direct este ineficienta; daca conexiunea pica la minutul 50, utilizatorul trebuie sa ia totul de la capat.',
    keyTakeaway: 'Adaptive Bitrate Streaming cu fisiere segmentate si livrate prin CDN asigura redare fluida indiferent de fluctuatiile de viteza ale retelei.'
  },
  {
    id: 'sys-28',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Collaborative Document Editing: OT vs CRDT',
    question: 'Cum functioneaza editarea colaborativa in timp real (Google Docs / Figma) si care este diferenta dintre Operational Transformation (OT) si CRDT?',
    answer: 'Cand doi utilizatori scriu simultan in aceeasi pozitie a unui document text partajat:\n1. Operational Transformation (OT - Folosit in Google Docs):\n- Fiecare caracter tastat este o operatiune: Insert(pozitie, caracter) sau Delete(pozitie).\n- Necesita un server central care stabileste ordinea cronologica si transforma operatiunile primite astfel incat indicii de pozitie sa ramana corecti dupa modificarile celuilalt utilizator.\n- Algoritmii sunt complexi si greu de implementat distribuit fara server central.\n\n2. CRDT (Conflict-free Replicated Data Types - Folosit in Figma, Apple Notes):\n- Fiecare caracter inserat primeste un identificator unic global si o pozitie fractionara imutabila intre caracterele vecine (nu un simplu index numeric intreg).\n- Operatiunile sunt matematic comutative: indiferent in ce ordine primesc nodurile schimbarile prin retea, toate nodurile converg la exact aceeasi stare finala fara coordonare centrala!\n- Ideal pentru arhitecturi Peer-to-Peer si mod offline-first.',
    codeSnippet: `// CRDT: Inserare intre pozitiile "1" si "2" -> genereaza pozitia "1.5"
// Client A insereaza 'X' la 1.5, Client B insereaza 'Y' la 1.6
// Toti clientii ajung la textul "A X Y B" fara conflicte!`,
    interviewTrap: 'Folosirea unor lock-uri simple pe sectiuni de text blocheaza utilizatorii si distruge senzatia de colaborare lina in timp real.',
    keyTakeaway: 'OT se bazeaza pe transformari coordonate central de server; CRDT asigura rezolvarea matematica a conflictelor in mod descentralizat.'
  },
  {
    id: 'sys-29',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Consens Distribuit si Leader Election: Algoritmul Raft',
    question: 'Cum alege un cluster distribuit (etcd, Consul, Kafka KRaft) un nou nod lider si cum previne fenomenul de "Split-Brain"?',
    answer: 'Algoritmul de Consens Raft imparte nodurile in 3 stari: Leader, Follower si Candidate.\n\nFluxul de Alegere (Leader Election):\n1. Heartbeats: Liderul trimite continuu semnale periodice de heartbeat catre followers.\n2. Timeout Aleatoriu: Daca un follower nu primeste niciun heartbeat intr-un interval aleatoriu (ex: 150-300ms), presupune ca liderul a murit, devine Candidate si cere voturi de la celelalte noduri.\n3. Votare si Majoritate (Quorum):\nUn candidat devine noul Lider DOAR daca primeste voturile unei majoritati absolute a clusterului: Quorum = (N / 2) + 1.\n\nCum se Previne Split-Brain:\nDaca reteaua se rupe in doua jumatati (ex: o partitie cu 2 noduri si una cu 3 noduri dintr-un cluster de 5):\n- Partea cu 2 noduri NU poate atinge cvorumul (are nevoie de minim 3 voturi), deci nu poate alege un lider si refuza scrierile.\n- Partea cu 3 noduri atinge cvorumul de 3 si functioneaza normal.\nAstfel este matematic imposibil sa existe doi lideri activi simultan!',
    codeSnippet: `// Cvorum dintr-un cluster de N noduri:
// N = 3 -> Cvorum = 2 (tolereaza caderea a 1 nod)
// N = 5 -> Cvorum = 3 (tolereaza caderea a 2 noduri)`,
    interviewTrap: 'Clusterul trebuie sa aiba intotdeauna un numar IMPAR de noduri (3, 5, 7) pentru a evita situatiile de egalitate la vot (split vote).',
    keyTakeaway: 'Regula cvorumului strict majoritar (N/2 + 1) garanteaza eliminarea oricarui risc de Split-Brain in Raft.'
  },
  {
    id: 'sys-30',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Gossip Protocol in Sisteme Descentralizate',
    question: 'Cum descopera nodurile din Cassandra sau Consul starea clusterului folosind Gossip Protocol fara a avea un nod central?',
    answer: 'Gossip Protocol (sau Protocolul Epidemic) se bazeaza pe modul in care se raspandesc zvonurile sau virusii intr-o populatie:\n1. Fiecare nod alege periodic, in mod aleatoriu, un numar mic de alte noduri din cluster (ex: 3 noduri) si face schimb de mesaje de stare (heartbeat, apartenenta, sanatate noduri).\n2. Nodurile partenere transmit informatiile mai departe catre alte noduri alese aleatoriu.\n3. In O(log N) runde, informatia despre orice nod nou adaugat sau cazut este raspandita catre TOATE masinile din intregul cluster!\n\nAvantaje Majore:\n- Robustete extrema: Nu exista niciun Master sau Single Point of Failure (SPOF).\n- Scalabilitate uriasa: Poate gestiona zeci de mii de servere cu un trafic de retea constant si predictibil.',
    codeSnippet: `// Runda de Gossip (la fiecare 1 secunda):
Node randomPeer = selectRandomActiveNode();
GossipDigest digest = createLocalStateDigest();
sendGossip(randomPeer, digest);`,
    interviewTrap: 'Gossip ofera doar consistenta eventuala (Eventual Consistency); informatia nu ajunge instantaneu pe toate nodurile in aceeasi milisecunda.',
    keyTakeaway: 'Gossip Protocol permite descoperirea descentralizata si detectarea caderilor in clustere masive fara un coordonator central.'
  },
  {
    id: 'sys-31',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'LSM-Tree (Log-Structured Merge-tree) vs B-Tree',
    question: 'De ce motoarele moderne NoSQL (Cassandra, RocksDB, ScyllaDB) folosesc LSM-Tree in locul arborilor B-Tree pentru scrieri rapide?',
    answer: '1. De ce B-Tree este lent la scrieri masive:\nUn arbore B-Tree actualizeaza datele pe disc "in-place". Inserarea de chei aleatorii forteaza capul de scriere al discului sa execute operatiuni de Random I/O la pozitii diferite, limitand drastic viteza.\n\n2. Mecanismul LSM-Tree (Log-Structured Merge-tree):\n- Toate scrierile sunt adaugate secvential intr-un jurnal append-only pe disc (pentru durabilitate).\n- Datele sunt inserate direct intr-o structura in RAM sortata numita MemTable (folosind un SkipList sau Red-Black Tree) - operatie instantanee O(log N) in memorie!\n- Cand MemTable se umple, este scris secvential pe disc ca un fisier imutabil numit SSTable (Sorted String Table).\n- Deoarece scrierile pe disc sunt 100% secventiale, viteza de scriere este cu ordine de marime mai rapida decat intr-un B-Tree!\n- In fundal, un proces de Compaction uneste SSTable-urile vechi si elimina datele duplicate sau sterse.',
    codeSnippet: `// Flux LSM-Tree:
// Client Write -> WAL (Append-Only) -> MemTable (RAM) -> Flush -> SSTable (Disk)
// Background: Compaction uneste SSTable 1 + SSTable 2 -> SSTable 3`,
    interviewTrap: 'LSM-Tree este ultra-rapid la scriere, dar citirile pot fi mai lente decat intr-un B-Tree deoarece cheia cautata poate fi raspandita pe mai multe SSTable-uri de pe disc (se folosesc Bloom Filters pentru mitigare).',
    keyTakeaway: 'LSM-Tree transforma scrierile aleatorii in scrieri secventiale pe disc, oferind performanta de scriere imbatabila.'
  },
  {
    id: 'sys-32',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Upload Masiv de Fisiere: Pre-Signed URLs si Multipart Upload',
    question: 'Cum implementezi upload-ul de fisiere mari (video de 5 GB) fara ca datele sa treaca prin serverul tau Java si cum asiguri reluarea transferului?',
    answer: 'Trecerea fisierelor mari prin backend-ul aplicatiei blocheaza memoria si banda de retea a serverului.\n\nArhitectura Corecta:\n1. Pre-Signed URLs (Upload Direct in Cloud Storage):\n- Clientul cere backend-ului permisiunea de a incarca un fisier.\n- Backend-ul genereaza un URL securizat temporar semnat criptografic de AWS S3 (valabil 15 minute).\n- Clientul incarca fisierul direct din browser catre AWS S3 (PUT pe S3 URL), ocolind complet serverul Java!\n2. S3 Multipart Upload (pentru fisiere > 100 MB):\n- Fisierul este impartit de frontend in bucati mici de 10-20 MB (parts).\n- Bucatile sunt incarcate in paralel.\n- Daca upload-ul se intrerupe la 90%, doar bucata picata este reincercata, fara a relua intregul fisier de la zero!\n- La final, S3 asambleaza automat bucatile intr-un singur fisier complet.',
    codeSnippet: `// Generare Pre-signed URL in backend Spring Boot:
PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
    .signatureDuration(Duration.ofMinutes(15))
    .putObjectRequest(b -> b.bucket("ats-resumes").key(fileKey))
    .build();

PresignedPutObjectRequest presignedUrl = s3Presigner.presignPutObject(presignRequest);
return presignedUrl.url().toString();`,
    interviewTrap: 'Nu accepta upload de fisiere mari direct prin MultipartFile in Spring Boot decat pentru avatare mici; pentru documente mari foloseste intotdeauna Pre-signed URLs direct catre object storage.',
    keyTakeaway: 'Pre-signed URLs elibereaza resursele de retea ale backend-ului, iar Multipart Upload garanteaza reluarea eficienta a transferurilor.'
  },
  {
    id: 'sys-33',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Proiectare Vanzare de Bilete cu Stoc Limitat (Flash Sale)',
    question: 'Cum previi vanzarea a mai multor bilete decat locurile disponibile (Overselling) cand 100.000 de utilizatori acceseaza 1.000 de locuri simultan?',
    answer: 'La un concert mare, lovirea bazei de date relationale cu 100.000 de interogari concurente o va bloca instantaneu.\n\nArhitectura de Protectie:\n1. Virtual Waiting Room: Un proxy la intrare introduce utilizatorii intr-o coada de asteptare si permite accesul pe site doar unui numar controlat (ex: 500 pe secunda).\n2. Verificare si Decrementare Atomica in Redis:\nStocul este pastrat intr-o variabila Redis. Decrementarea se face cu comanda atomica DECR stock.\nDaca rezultatul dupa decrementare este < 0, clientul primeste imediat "Stoc Epuizat" fara a mai atinge baza de date SQL!\n3. Rezervare Temporara cu TTL (10 minute):\nDaca decrementarea reuseste, locul este rezervat temporar in Redis cu un TTL de 10 minute pentru ca utilizatorul sa poata finaliza plata bancara.\n4. Tranzactie Asincrona cu Kafka: Daca plata este confirmata, comanda se salveaza definitiv in PostgreSQL; daca TTL-ul expira fara plata, stocul din Redis este incrementat automat inapoi (INCR stock).',
    codeSnippet: `-- Script Lua Redis pentru rezervare atomica cu verificare:
local stock = tonumber(redis.call('get', KEYS[1]))
if stock and stock > 0 then
    redis.call('decr', KEYS[1])
    redis.call('setex', KEYS[2], 600, ARGV[1]) -- Rezerva 10 min
    return 1 -- Succes
else
    return 0 -- Epuizat
end`,
    interviewTrap: 'Daca verifici stocul cu un SELECT si apoi faci UPDATE in SQL, sub concurenta mare vei vinde 1.500 de bilete pentru o sala de 1.000 de locuri (Race Condition catastrofala).',
    keyTakeaway: 'Operatiunile atomice in memoria Redis (Lua scripts) absorb socul de trafic si garanteaza vanzarea stricta a stocului existent.'
  },
  {
    id: 'sys-34',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Service Mesh: Rolul Proxy-ului Sidecar (Envoy / Istio)',
    question: 'Ce este un Service Mesh si de ce mutam responsabilitatile de securitate (mTLS) si tracing din codul aplicatiei in sidecar-ul Envoy?',
    answer: 'Intr-o arhitectura mare cu sute de microservicii scrise in limbaje diferite (Java, Go, Python, Node.js), implementarea de retries, circuit breaking, metrici, logging si mTLS in fiecare cod sursa devine un cosmar de mentenanta.\n\nCe face un Service Mesh (ex: Istio + Envoy):\n1. Pattern-ul Sidecar: Langa fiecare container de aplicatie ruleaza un mic container proxy transparent (Envoy). Tot traficul de retea intra si iese EXCLUSIV prin acest proxy.\n2. mTLS Automat (Mutual TLS): Envoy cripteaza si autentifica traficul intre toate pod-urile automat prin certificate x509 rotite periodic, fara ca aplicatia Java sa stie de asta.\n3. Tracing si Retries la Nivel de Retea: Reincercarile, rutarea inteligenta de tip Canary (90% v1, 10% v2) si injectarea de headere de tracing sunt gestionate la nivel de retea infrastructura.',
    codeSnippet: `// Codul aplicatiei devine un simplu apel HTTP curat:
// Aplicatia Java apeleaza http://user-service:8080/users
// Envoy intercepteaza apelul, adauga mTLS, face retry daca e cazul si propaga traceId!`,
    interviewTrap: 'Service Mesh adauga o mica latenta de cativa milisecunde la fiecare apel si creste consumul de memorie (fiecare pod are un proxy suplimentar); este justificat doar in infrastructuri enterprise complexe.',
    keyTakeaway: 'Service Mesh separa logica de business din aplicatie de preocuparile transversale de retea si securitate.'
  },
  {
    id: 'sys-35',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Disaster Recovery: RPO vs RTO si Strategii de Backup',
    question: 'Care este diferenta dintre RPO (Recovery Point Objective) si RTO (Recovery Time Objective) in planul de recuperare in caz de dezastru?',
    answer: '1. RPO (Recovery Point Objective - Cat de multe DATE iti permiti sa pierzi):\n- Reprezinta intervalul maxim acceptabil de timp intre ultimul backup/sincronizare si momentul producerii dezastrului.\n- Un RPO de 1 ora inseamna ca in caz de cadere majora poti pierde datele din ultima ora.\n- Un sistem financiar cere un RPO = 0 (zero pierdere de date prin replicare sincrona continua).\n\n2. RTO (Recovery Time Objective - Cat de mult TIMP iti permiti sa fii offline):\n- Reprezinta timpul maxim necesar pentru a restaura serviciile si a deveni functional dupa producerea avariei.\n- Un RTO de 15 minute inseamna ca sistemul trebuie sa reporneasca in maxim 15 minute de la dezastru.\n\nStrategii Arhitecturale:\n- Backup & Restore (RPO: ore, RTO: ore) - Ieftin.\n- Pilot Light (Baza de date sincronizata continuu in alta regiune, serverele de aplicatie pornesc la cerere) - RTO: minute.\n- Multi-Region Active-Active (Trafic deservit simultan in doua regiuni cloud) - RPO = 0, RTO = 0, dar cost maxim.',
    codeSnippet: `// RPO = Masoara Pierderea de Date (in unitati de timp)
// RTO = Masoara Timpul de Intrerupere (Downtime)`,
    interviewTrap: 'Confundarea RPO cu RTO este frecventa la interviuri: retine ca RPO priveste inapoi in timp (ce date s-au pierdut), iar RTO priveste inainte in timp (cat dureaza revenirea online).',
    keyTakeaway: 'RPO dicteaza frecventa replicarii datelor; RTO dicteaza nivelul de automatizare a failover-ului de infrastructura.'
  },
  {
    id: 'sys-36',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Strategii de Caching: Write-Through vs Write-Back (Write-Behind)',
    question: 'Care este diferenta de functionare si risc dintre strategiile Write-Through si Write-Back (Write-Behind) de scriere in cache?',
    answer: '1. Write-Through Caching:\n- Aplicatia scrie datele in Cache, iar Cache-ul scrie sincron in Baza de Date inainte de a confirma succesul operatiei.\n- Datele din cache si DB sunt intotdeauna 100% consistente.\n- Dezavantaj: Latenta fiecarei scrieri creste deoarece trebuie sa astepte salvarea pe ambele sisteme.\n\n2. Write-Back / Write-Behind Caching:\n- Aplicatia scrie datele DOAR in Cache si primeste raspuns de succes imediat (latenta minima, milisecunde)!\n- Cache-ul acumuleaza scrierile si le salveaza asincron in loturi (batch) in baza de date dupa cateva secunde sau minute.\n- Throughput extrem de mare de scriere.\n- Risc Major: Daca serverul de cache pica inainte de a descarca lotul in baza de date, datele se pierd definitiv!',
    codeSnippet: `// Write-Through:
cache.put(key, value);
database.save(key, value); // Sincron, comite impreuna

// Write-Back:
cache.put(key, value); // Returneaza instant catre client!
// Background worker: periodic flush din cache in DB in loturi`,
    interviewTrap: 'Nu folosi Write-Back pentru date financiare sau comenzi de plati; este excelent insa pentru salvarea starii jocurilor video sau a vizualizarilor video.',
    keyTakeaway: 'Write-Through garanteaza siguranta datelor; Write-Back prioritizeaza viteza extrema de scriere acceptand riscul pierderilor la crash.'
  },
  {
    id: 'sys-37',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Proiectare Cautare Geografica (Nearby Places / Geohash)',
    question: 'Cum gasesti cele mai apropiate restaurante sau soferi in raza de 5 km (Uber/Yelp) fara a calcula distante trigonometrice pe toata tabela?',
    answer: 'Calcularea formulei Haversine (distanta trigonometrica) pe 10 milioane de randuri la fiecare request blocheaza CPU-ul bazei de date.\n\nSolutii de Indexare Spatiala:\n1. Geohashing:\n- Imparte harta lumii intr-o retea ierarhica de dreptunghiuri si codifica coordonatele (lat, lon) intr-un string Base32 (ex: "u80q9").\n- Proprietate Magica: Locatiile apropiate geografic impart acelasi prefix de text! Daca un restaurant are codul "u80q9z" si altul are "u80q9y", ambele sunt in acelasi cartier.\n- Cautarea devine un simplu query B-Tree de tip prefix: WHERE geohash LIKE \'u80q9%\'!\n2. Google S2 Geometry:\n- Proiecteaza globul pamantesc pe un cub si il subdivideaza cu curbe Hilbert intr-o ierarhie de celule numerice pe 64 de biti (uint64), facand cautarile si mai rapide si mai uniforme.\n3. PostgreSQL PostGIS:\n- Extensia spatiala standard care foloseste indecsi GiST (R-Tree) pe tipul de date GEOMETRY/GEOGRAPHY.',
    codeSnippet: `-- Cautare cu index spatial PostGIS in raza de 5000 metri:
SELECT id, name 
FROM venues 
WHERE ST_DWithin(location, ST_MakePoint(26.10, 44.43)::geography, 5000);`,
    interviewTrap: 'La marginile celulelor Geohash, doua locatii pot fi la 5 metri distanta dar sa aiba coduri complet diferite; cautarea trebuie sa includa intotdeauna si cele 8 celule vecine inconjuratoare.',
    keyTakeaway: 'Geohash si Google S2 transforma coordonatele bidimensionale in chei unidimensionale usor de indexat in B-Tree.'
  },
  {
    id: 'sys-38',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Clasamente in Timp Real (Leaderboard) cu Redis Sorted Sets',
    question: 'Cum construiesti un clasament in timp real (Top 100 de candidati/jucatori) care suporta milioane de utilizatori si actualizari frecvente?',
    answer: 'Utilizarea unei baze de date SQL cu SELECT * FROM scores ORDER BY score DESC LIMIT 100 este ineficienta sub actualizari masive concurente.\n\nSolutie: Redis Sorted Sets (ZSET)\nRedis ZSET pastreaza elementele unice ordonate automat dupa un scor numeric (folosind o structura interna de SkipList si Hash Table):\n1. Actualizare Scor: Comanda atomica ZADD leaderboard <score> <userId> sau ZINCRBY leaderboard <points> <userId> in complexitate O(log N).\n2. Preluare Top 100: Comanda ZREVRANGE leaderboard 0 99 WITHSCORES ruleaza in O(log N + M) in cateva milisecunde!\n3. Aflarea Rangului unui Utilizator: ZREVRANK leaderboard <userId> returneaza pozitia exacta a unui utilizator in clasamentul global instantaneu O(log N).',
    codeSnippet: `// Adaugare/Actualizare punctaj utilizator in Redis:
redisTemplate.opsForZSet().add("monthly_leaderboard", "user_42", 9500);

// Extragere Top 10 jucatori:
Set<ZSetOperations.TypedTuple<String>> topTen = 
    redisTemplate.opsForZSet().reverseRangeWithScores("monthly_leaderboard", 0, 9);`,
    interviewTrap: 'Daca ai zeci de milioane de utilizatori, un singur ZSET urias poate atinge limite de memorie pe un singur nod Redis; este necesar sharding-ul pe intervale de scoruri.',
    keyTakeaway: 'Redis Sorted Sets (ZSET) este structura de date ideala pentru clasamente dinamice in timp real de inalta performanta.'
  },
  {
    id: 'sys-39',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Zero-Downtime Deployments: Rolling vs Blue-Green vs Canary',
    question: 'Care sunt diferentele de functionare si risc dintre strategiile de release: Rolling Update, Blue-Green Deployment si Canary Release?',
    answer: '1. Rolling Update (Implicit in Kubernetes):\n- Inlocuieste pod-urile vechi cu cele noi unul cate unul treptat.\n- Nu necesita resurse duble de infrastructura.\n- Risc: Pe durata deploy-ului, ambele versiuni de aplicatie ruleaza simultan si acceseaza aceeasi baza de date (necesita compatibilitate retroactiva stricta a schemei SQL).\n\n2. Blue-Green Deployment:\n- Mentine doua medii identice de productie: Blue (versiunea curenta activa) si Green (versiunea noua inactiva).\n- Versiunea Green este testata complet inainte de expunere.\n- Trecerea se face instantaneu prin comutarea rutei din Load Balancer.\n- Rollback instant: Daca apar erori, comuti traficul inapoi pe Blue in 1 secunda.\n- Dezavantaj: Necesita dublarea costurilor de resurse hardware.\n\n3. Canary Release:\n- Trimite un procent minuscul din traficul real (ex: 2%) catre versiunea noua, restul de 98% mergand pe versiunea stabila.\n- Se monitorizeaza erorile si metricile. Daca totul e bine, procentul este crescut treptat (10% -> 50% -> 100%).',
    codeSnippet: `// Configurare Canary in Kubernetes / Istio VirtualService:
route:
  - destination:
      host: job-service
      subset: v1
    weight: 95
  - destination:
      host: job-service
      subset: v2
    weight: 5`,
    interviewTrap: 'Orice modificare distructiva a bazei de date (ex: stergerea unei coloane) va dobori versiunea veche in timpul unui Rolling sau Blue-Green deployment; migrarile de DB trebuie sa fie intotdeauna backwards-compatible in 2 faze.',
    keyTakeaway: 'Blue-Green ofera rollback instantaneu; Canary reduce la minim expunerea utilizatorilor la bug-uri neprevazute.'
  },
  {
    id: 'sys-40',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Kubernetes Probes: Liveness vs Readiness vs Startup',
    question: 'Care este diferenta dintre Liveness Probe si Readiness Probe in Kubernetes si ce se intampla cand fiecare esueaza?',
    answer: '1. Liveness Probe (Este procesul sanatos?):\n- Verifica daca aplicatia ruleaza si nu a intrat in deadlock intern.\n- Daca Liveness pica: Kubernetes OPRESTE SI REPORNESTE containerul (SIGKILL) si creeaza un container NOU (Restart).\n- Nu pune verificari de dependinte externe (baza de date cazuta) in Liveness Probe, altfel daca DB-ul pica, toate pod-urile tale vor intra intr-o bucla infinita de restart (CrashLoopBackOff)!\n\n2. Readiness Probe (Este gata sa primeasca trafic?):\n- Verifica daca aplicatia este pregatita sa primeasca cereri de la utilizatori (ex: conexiunile la DB sunt deschise, cache-ul e incarcat).\n- Daca Readiness pica: Kubernetes NU omoara containerul, ci doar SCOATE pod-ul din lista de endpoint-uri a Service-ului (nu ii mai trimite trafic de la clienti pana nu isi revine).\n\n3. Startup Probe: Blocheaza verificarile de liveness si readiness pana cand aplicatiile lente (care pornesc in 60s) termina initializarea de baza.',
    codeSnippet: `livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  periodSeconds: 5`,
    interviewTrap: 'Includerea verificarii disponibilitatii bazei de date in Liveness Probe este o eroare clasica grava; o mica fluctuatie a bazei de date va distruge toate pod-urile simultan.',
    keyTakeaway: 'Liveness controleaza restartul containerului; Readiness controleaza rutarea traficului de retea.'
  },
  {
    id: 'sys-41',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Sliding Window Counter pentru Rate Limiting Avansat',
    question: 'Cum elimina algoritmul Sliding Window Counter problema de trafic de 2x la marginea ferestrei din Fixed Window Counter?',
    answer: 'Problema Fixed Window Counter (Fereastra Fixa):\nDaca limita este de 100 de cereri pe minut, iar un utilizator trimite 100 de cereri la secunda 0:59 si inca 100 de cereri la secunda 1:01, el a trimis 200 de cereri intr-un interval de 2 secunde fara a fi blocat (burst de 2x la trecerea dintre ferestre)!\n\nAlgoritmul Sliding Window Counter:\n1. Calculeaza o pondere intre fereastra curenta si fereastra anterioara.\n2. Formula: Cereri Estimate = (Cereri din fereastra anterioara * procentul ramas din fereastra) + Cereri din fereastra curenta.\n3. Exemplu: Daca suntem la secunda 15 dintr-un minut (au trecut 25% din minut), ponderea ferestrei anterioare este de 75%.\n4. Ofera precizie excelenta fara a consuma memoria unui Sliding Window Log complet in Redis.',
    codeSnippet: `// Calcul pondere in Sliding Window Counter:
double weightPrevious = 1.0 - ((double) currentSecondInMinute / 60.0);
long estimatedRequests = (long) (requestsInPreviousWindow * weightPrevious) + requestsInCurrentWindow;
if (estimatedRequests > MAX_LIMIT) {
    return false; // Respins HTTP 429
}`,
    interviewTrap: 'Fixed Window este simplu de implementat dar permite abuzuri de 2x la granita minutului; Sliding Window Counter netezeste curba de trafic.',
    keyTakeaway: 'Sliding Window Counter ofera o aproximare rapida si precisa a traficului fara a stoca fiecare timestamp individual in memorie.'
  },
  {
    id: 'sys-42',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Proiectare Sistem de Caching Distribuit: Evitarea Hotspot-urilor',
    question: 'Ce faci cand o singura cheie Redis devine extrem de populara (Hot Key) si satura reteaua unui singur nod de cache?',
    answer: 'O cheie extrem de fierbinte (ex: datele unui eveniment live sau stocul unui produs la reducere masiva) va trimite milioane de comenzi catre un singur server din clusterul Redis, saturandu-i CPU-ul si conexiunea de retea.\n\nStrategii de Rezolvare:\n1. Local L1 Cache (Near-Cache):\nSe foloseste un cache in-memory local pe fiecare pod de aplicatie (Caffeine/Guava) cu un TTL foarte scurt (ex: 2-5 secunde). 99% din cereri sunt rezolvate local fara a mai atinge clusterul Redis!\n2. Key Splitting (Salting Chei):\nMultiplica cheia pe mai multe noduri de Redis: key_1, key_2, ..., key_N. La scriere, actualizeaza toate copiile. La citire, clientul alege o cheie aleatorie: key_ + random(1, N), distribuind traficul uniform pe mai multe noduri fizice.\n3. Read Replicas dedicate pentru Redis Cluster.',
    codeSnippet: `// Near Cache pattern:
// L1: Caffeine (Local in JVM, 3 secunde TTL)
// L2: Redis Cluster (Distribuit)
public ProductDto getProduct(String id) {
    return l1LocalCache.get(id, k -> l2RedisCache.get(k, () -> database.find(k)));
}`,
    interviewTrap: 'Scalarea clusterului de Redis prin adaugarea de noduri noi NU rezolva problema unei Hot Key, deoarece o cheie se mapeaza intotdeauna pe un singur nod hash slot!',
    keyTakeaway: 'Near-Cache local si Key Salting sunt solutiile canonice pentru a dispersa incarcarea generata de o Hot Key.'
  },
  {
    id: 'sys-43',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Asincronism si Decuplare cu Event-Driven Architecture',
    question: 'Care sunt beneficiile si compromisurile trecerii de la comunicare sincrona (REST) la comunicare asincrona bazata pe evenimente (Kafka)?',
    answer: '1. Beneficii ale Arhitecturii Asincrone (Event-Driven):\n- Decuplare Temporala: Serviciul emitent nu trebuie sa astepte finalizarea prelucrarii; isi continua activitatea imediat.\n- Rezilienta la Caderi: Daca Serviciul de Email sau Notificari este picat timp de 2 ore, mesajele se acumuleaza in topicul Kafka. Cand serviciul reporneste, consuma mesajele restante fara nicio pierdere!\n- Scalabilitate independenta a producatorilor si consumatorilor.\n\n2. Compromisuri si Dezavantaje:\n- Consistenta Eventuala (Eventual Consistency): Utilizatorul nu vede imediat efectul actiunii sale.\n- Complexitate de depanare si urmarire: Necesita Distributed Tracing (TraceId) pentru a depana fluxurile.\n- Gestionarea duplicatelelor: Mesageria garanteaza de regula livrare "At-Least-Once", cerand ca toti consumatorii sa fie strict Idempotenti.',
    codeSnippet: `// Decuplare: Emitentul arunca evenimentul si uita de el (Fire and Forget)
kafkaTemplate.send("candidate-events", new CandidateRegisteredEvent(id, email));`,
    interviewTrap: 'Daca incerci sa faci Event-Driven peste tot, vei avea mari dificultati pe fluxuri care necesita confirmare imediata (validari sincrone de date de intrare sau autorizari live).',
    keyTakeaway: 'Event-Driven aduce rezilienta si scalabilitate exceptionala prin acceptarea consistentei eventuale.'
  },
  {
    id: 'sys-44',
    category: 'SYSTEM_DESIGN',
    difficulty: 'DIFICIL',
    title: 'Two Generals Problem si Imposibilitatea Consensului Perfect',
    question: 'Ce demonstreaza "Two Generals Problem" in informatica teoretica si cum influenteaza proiectarea sistemelor distribuite?',
    answer: 'Problema Celor Doi Generali:\nDoi generali aliati se afla pe doua dealuri diferite si vor sa atace un oras inamic. Ei pot castiga doar daca ataca SIMULTAN. Singura metoda de comunicare este prin mesageri care trebuie sa traverseze valea inamica, putand fi capturati oricand.\n- Generalul 1 trimite: "Atacam maine la ora 9".\n- Mesagerul ajunge, dar Generalul 1 nu stie daca a ajuns, asa ca Generalul 2 trimite confirmare: "Am primit, sunt de acord".\n- Acum Generalul 2 nu stie daca confirmarea lui a ajuns, avand nevoie de o confirmare a confirmarii...\n\nConcluzia Matematica:\nPe un canal de comunicatie nesigur cu pierderi posibile de pachete (precum Internetul sau orice retea IP), este TEORETIC IMPOSIBIL ca doua noduri sa ajunga la un consens 100% sigur cu un numar finit de mesaje!\n\nImplicatii Practice: Toate protocoalele reale de retea (inclusiv TCP 3-way handshake) folosesc presupuneri pragmatice: timeout-uri, reincercari si considerarea livrarii reusite dupa un numar fix de incercari.',
    codeSnippet: `// In sisteme reale recunoastem imperfectiunea retelei:
// Nu asteptam certitudine absoluta, ci folosim:
// Timeout-uri clare + Retry Policies + Idempotency Keys`,
    interviewTrap: 'Nu exista "garantie de retea absoluta"; un sistem robust trebuie sa presupuna ca orice mesaj se poate pierde sau duplica oricand.',
    keyTakeaway: 'Two Generals Problem demonstreaza ca sistemele distribuite trebuie sa fie proiectate pentru toleranta la esec si timeout-uri.'
  },
  {
    id: 'sys-45',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Content Negotiation si Versionarea API-urilor REST',
    question: 'Care sunt cele 3 strategii de versionare a API-urilor REST si de ce versionarea prin URI este preferata in industrie?',
    answer: 'Strategii de Versionare:\n1. URI Versioning (ex: /api/v1/jobs vs /api/v2/jobs):\n- Cea mai clara si populara metoda in industrie.\n- Usor de testat direct in browser, compatibila 100% cu caching-ul din browsere si CDN-uri, vizibila imediat in log-uri.\n2. Header Versioning (ex: X-API-Version: 2):\n- Pastreaza URL-ul curat, dar este mai greu de testat si necesita configurare speciala a CDN-urilor (Vary header).\n3. Media Type / Content Negotiation (ex: Accept: application/vnd.company.v2+json):\n- Conformitate stricta cu standardele academice REST/HATEOAS, dar adauga complexitate inutila pentru dezvoltatorii care consuma API-ul.\n\nRegula de Aur de Modificare:\nNu rupe compatibilitatea retroactiva (Breaking Changes)! Adaugarea unui camp nou in JSON nu necesita versiune noua; modificarea tipului unui camp existent sau redenumirea lui impune crearea unei versiuni v2.',
    codeSnippet: `@RestController
@RequestMapping("/api/v1/jobs")
public class JobControllerV1 { ... }

@RestController
@RequestMapping("/api/v2/jobs")
public class JobControllerV2 { ... }`,
    interviewTrap: 'Daca folosesti versionare prin header fara sa configurezi header-ul HTTP "Vary: X-API-Version" in raspuns, un CDN va servi raspunsul din v1 unui client care a cerut v2!',
    keyTakeaway: 'Versionarea prin URI (/api/v1) este standardul practic de aur pentru predictibilitate si compatibilitate cu CDN-urile.'
  }
];
