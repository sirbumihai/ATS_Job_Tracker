// Deck Masiv: System Design, Scalabilitate, Caching, Cozi & Arhitecturi Distribuite (Junior & Mid-Level)
// Preluat din: donnemartin/system-design-primer, ByteByteGoHq/system-design-101, High-Scalability & Top Interview Repos
// 100 de carduri realiste de interviu (Scalare, Load Balancing, Caching, Cozi, CAP, Rate Limiting, Scenarii Clasice)
// FARA intrebari de Senior / Arhitect (Zero Paxos/Raft in adancime, Zero Multi-Region Active-Active CRDT)
// Dificultati: USOR si MEDIU (Zero DIFICIL)
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const SYSTEM_DESIGN_DECK = [
  {
    id: "sys-01",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Scalare Verticala (Scale Up) vs Scalare Orizontala (Scale Out)",
    question: "Care este diferenta dintre scalarea verticala si scalarea orizontala si care sunt limitele fiecareia?",
    answer: "1. Scalare Verticala (Scale Up):\n   - Adaugarea de resurse suplimentare (CPU, RAM, stocare SSD/NVMe) pe ACELASI server existent.\n   - Avantaje: Simpla, nu necesita modificari in arhitectura aplicatiei sau cod, nu exista probleme de consistenta intre noduri.\n   - Limite: Plafon fizic hardware (nu poti pune RAM infinit), costuri exponentiale pentru componente de top si ramane un Single Point of Failure (SPOF) - daca pica serverul, pica toata aplicatia.\n\n2. Scalare Orizontala (Scale Out):\n   - Adaugarea mai multor servere/instante ieftine care lucreaza impreuna in cluster, distribuind traficul printr-un Load Balancer.\n   - Avantaje: Capacitate practic nelimitata, redundanta si High Availability (daca un nod cade, restul preiau traficul).\n   - Limite: Complexitate ridicata in cod (stare stateless obligatorie, sincronizare date, cache distribuit).",
    codeSnippet: `# Scalare Orizontala in Docker Compose / Kubernetes:
# Adaugare instanta noua la runtime fara downtime:
docker compose up -d --scale backend=4

# Kubernetes ReplicaSet:
kubectl scale deployment backend-api --replicas=5`,
    interviewTrap: "Multi candidati spun ca scalarea orizontala este mereu mai buna. Pentru startups mici sau aplicatii cu trafic redus, scalarea verticala este mult mai ieftina si mai rapida de implementat.",
    keyTakeaway: "Scale Up = server mai mare (simplu, dar cu plafon si SPOF). Scale Out = mai multe servere paralele (scalabilitate infinita si disponibilitate ridicata)."
  },
  {
    id: "sys-02",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Load Balancer: Layer 4 vs Layer 7",
    question: "Ce este un Load Balancer si care este diferenta dintre un balancer Layer 4 (Transport) si Layer 7 (Application)?",
    answer: "Un Load Balancer distribuie traficul de retea primit intre mai multe servere backend pentru a preveni supraincarcarea.\n\n1. Layer 4 Load Balancing (Nivel Transport - TCP / UDP):\n   - Actioneaza doar pe baza de adresa IP si port (fara a inspecta continutul pachetelor).\n   - Este ultra-rapid si consuma resurse infime de CPU, deoarece nu decripteaza sau parseaza HTTP.\n   - Nu poate lua decizii de rutare bazate pe URL sau cookies.\n\n2. Layer 7 Load Balancing (Nivel Aplicatie - HTTP / HTTPS / gRPC):\n   - Inspecteaza continutul mesajului: URL path, HTTP Headers, Cookies, corp JSON.\n   - Permite rutare inteligenta: ruteaza cererile `/api/payments` catre serviciul de plati si `/static/*` catre CDN/servere statice.\n   - Permite SSL Termination, validare de token JWT si filtrare WAF (Web Application Firewall).",
    codeSnippet: `# Nginx (Layer 7 Routing inteligent dupa path):
http {
    upstream payments_backend {
        server 10.0.0.1:8080;
        server 10.0.0.2:8080;
    }
    server {
        listen 80;
        location /api/payments/ {
            proxy_pass http://payments_backend;
        }
    }
}`,
    interviewTrap: "Layer 7 este mai inteligent si mai flexibil, dar consuma mult mai mult CPU si memorie deoarece trebuie sa decripteze TLS si sa parseze anteturile fiecarui request.",
    keyTakeaway: "Layer 4 ruteaza rapid dupa IP/Port (TCP); Layer 7 ruteaza inteligent dupa URL, headers si cookies (HTTP)."
  },
  {
    id: "sys-03",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Algoritmi Clasici de Load Balancing",
    question: "Care sunt principalii algoritmi de distribuire a traficului intr-un Load Balancer si cand se foloseste IP Hash?",
    answer: "Algoritmi fundamentali de Load Balancing:\n1. Round Robin:\n   - Trimite fiecare cerere secvential urmatorului server din lista (Server 1 -> Server 2 -> Server 3 -> Server 1).\n   - Bun cand toate serverele au putere hardware identica si cererile au durata de executie similara.\n2. Weighted Round Robin:\n   - Aloca o pondere fiecarui nod (ex: un server puternic primeste greutate 3, unul slab 1).\n3. Least Connections:\n   - Trimite cererea catre serverul care are cel mai mic numar de conexiuni active in acel moment. Excelent pentru conexiuni lungi (video streaming, WebSockets).\n4. IP Hash (Sticky Sessions):\n   - Calculeaza un hash pe adresa IP a clientului si asigura ca acelasi client ajunge mereu pe acelasi server backend (util pentru aplicatii legacy cu sesiuni stocate in memoria locala a serverului).",
    codeSnippet: `# Configurare Least Connections in Nginx:
upstream backend_cluster {
    least_conn;
    server backend1.internal:8080;
    server backend2.internal:8080;
    server backend3.internal:8080;
}`,
    interviewTrap: "IP Hash are o problema grava: daca 10.000 de angajati ai unei companii acceseaza site-ul din spatele aceluiasi proxy corporativ (acelasi IP public), toti vor fi trimisi pe un singur nod backend, supraincarcandu-l!",
    keyTakeaway: "Round Robin = distributie simpla; Least Connections = ideal pentru conexiuni lungi; IP Hash = asigura sticky session dar poate crea dezechilibre."
  },
  {
    id: "sys-04",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Reverse Proxy vs Forward Proxy",
    question: "Care este diferenta esentiala intre un Forward Proxy si un Reverse Proxy?",
    answer: "Diferenta consta in cine este protejat si reprezentat de catre proxy:\n\n1. Forward Proxy (Protejeaza si reprezinta CLIENTUL):\n   - Se afla in fata clientilor (browsere, aplicatii de retea).\n   - Clientul stie ca foloseste un proxy pentru a accesa internetul.\n   - Rol: Anonimizare IP (VPN), filtrare de securitate in retele corporative (blocare acces la retele sociale), caching local de download-uri.\n   - Serverul web final vede adresa IP a proxy-ului, nu a utilizatorului real.\n\n2. Reverse Proxy (Protejeaza si reprezinta SERVERUL):\n   - Se afla in fata serverelor backend web.\n   - Clientul crede ca comunica direct cu serverul web final.\n   - Rol: Load Balancing, SSL/TLS Termination, Caching HTTP, compresie Gzip/Brotli, protectie impotriva atacurilor DDoS (ex: Cloudflare, Nginx, HAProxy).",
    codeSnippet: `Client Browser 
      | (cerere anonima)
Forward Proxy (ex: Corporate Proxy / VPN)
      | (Internet)
Reverse Proxy (ex: Cloudflare / Nginx pe port 443)
      |
Backend Serviciu (ex: Spring Boot pe port 8080)`,
    interviewTrap: "Regula de aur pentru a nu le confunda: Forward proxy ascunde clientul de servere; Reverse proxy ascunde serverele de clienti.",
    keyTakeaway: "Forward Proxy = in fata clientilor (anonimizare, securitate corporativa). Reverse Proxy = in fata serverelor (load balancing, caching, SSL)."
  },
  {
    id: "sys-05",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Strategia Cache-Aside (Lazy Loading)",
    question: "Cum functioneaza strategia Cache-Aside si de ce invalidam cheia prin stergere in loc sa o suprascriem la actualizare?",
    answer: "Cache-Aside este cel mai folosit model de caching in backend (Redis / Memcached):\n\n1. Flux de Citire (Read):\n   - Aplicatia cauta cheia in Cache (Redis).\n   - Cache Hit: Datele sunt returnate instant catre client.\n   - Cache Miss: Aplicatia citeste datele din baza de date relationala, le scrie in Cache cu un TTL si le returneaza clientului.\n\n2. Flux de Scriere (Write / Update):\n   - Aplicatia scrie si comite modificarea in Baza de Date (System of Record).\n   - Dupa succesul commit-ului, aplicatia STERGE (DEL) cheia din Cache!\n\nDe ce STERGEM in loc sa suprascriem:\n- Previne race conditions de concurenta! Daca doua thread-uri concurente (T1 si T2) actualizeaza aceeasi resursa, T1 ar putea suprascrie in cache dupa T2 din cauza intarzierilor de retea, lasand date vechi in cache permanent. Stergerea garanteaza ca urmatoarea citire va aduce starea exacta din baza de date.",
    codeSnippet: `// Model Cache-Aside in Spring Boot / Java:
public Produs getProdus(Long id) {
    String key = "produs:" + id;
    Produs cached = redis.get(key);
    if (cached != null) return cached;
    
    Produs dbData = produsRepository.findById(id).orElseThrow();
    redis.set(key, dbData, Duration.ofMinutes(30)); // TTL obligatoriu
    return dbData;
}

@Transactional
public void updateProdus(Produs produs) {
    produsRepository.save(produs); // 1. Scrie in DB
    redis.delete("produs:" + produs.getId()); // 2. Sterge din cache
}`,
    interviewTrap: "Niciodata nu actualiza cache-ul inainte de commit-ul pe baza de date! Daca commit-ul pe baza esueaza cu rollback, cache-ul ramane cu date corupte care nu exista in realitate.",
    keyTakeaway: "In Cache-Aside, la citire incarci in cache daca lipseste (lazy loading), iar la actualizare scrii in DB si STERGI cheia din cache."
  },
  {
    id: "sys-06",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Modele de Caching: Write-Through vs Write-Back vs Write-Around",
    question: "Care sunt diferentele si cazurile de utilizare pentru Write-Through, Write-Back (Write-Behind) si Write-Around?",
    answer: "Trei strategii pentru operatiunile de scriere in cache:\n\n1. Write-Through:\n   - Aplicatia scrie intotdeauna in Cache, iar Cache-ul scrie sincron in Baza de Date inainte de a confirma succesul.\n   - Avantaj: Datele din cache sunt permanent consistente cu DB.\n   - Dezavantaj: Latenta mai mare la scriere (doua scrieri consecutive).\n\n2. Write-Back (Write-Behind):\n   - Aplicatia scrie doar in Cache si primeste raspuns de succes instantaneu.\n   - Cache-ul acumuleaza scrierile si le salveaza asincron in baza de date in loturi (batch-uri).\n   - Avantaj: Viteza extrema de scriere si debit masiv de operatii.\n   - Dezavantaj: Risc de PIERDERE DE DATE daca serverul de cache pica inainte de scrierea pe disc!\n\n3. Write-Around:\n   - Scrierile ocolesc complet cache-ul si merg direct in baza de date.\n   - Doar citirile ulterioare aduc datele in cache.\n   - Ideal pentru date scrise des dar citite rar (ex: loguri de audit sau arhive).",
    codeSnippet: `Write-Through:  Client -> Cache -> (Sync) -> DB
Write-Back:     Client -> Cache -> (Async Batch mai tarziu) -> DB
Write-Around:   Client -> DB direct (Cache-ul este ocolit)`,
    interviewTrap: "Write-Back nu este niciodata folosit pentru tranzactii bancare din cauza riscului de pierdere a datelor la crash. Este folosit pentru contoare de vizualizari, analitice sau loguri.",
    keyTakeaway: "Write-Through = scriere sincrona in cache si DB; Write-Back = scriere rapida in cache cu sincronizare asincrona; Write-Around = scriere directa in DB."
  },
  {
    id: "sys-07",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Politici de Evacuare Cache: LRU vs LFU vs FIFO",
    question: "Ce se intampla cand memoria Cache-ului este plina si cum functioneaza politicile LRU, LFU si FIFO?",
    answer: "Cand memoria alocata (ex: maxmemory 4GB in Redis) este atinsa, motorul trebuie sa evacueze (stearga) chei pentru a face loc celor noi:\n\n1. LRU (Least Recently Used) - Cea mai populara:\n   - Evacueaza cheia care a fost accesata cel mai demult in timp.\n   - Logica: Daca nu a fost citita recent, probabil nu va fi ceruta nici in viitorul apropiat.\n   - Implementare clasica: Hash Table + Doubly Linked List in O(1).\n\n2. LFU (Least Frequently Used):\n   - Evacueaza cheia cu cel mai mic contor de accesari (frecventa).\n   - Logica: O cheie citita de 10.000 de ori este pastrata chiar daca in ultimele 5 minute nu a fost accesata.\n\n3. FIFO (First In, First Out):\n   - Evacueaza cheia cea mai veche pe baza momentului inserarii, indiferent de cat de des a fost accesata.\n\n4. TTL (Time to Live) Expiration:\n   - Fiecare cheie are un termen de expirare prestabilit (ex: EXPIRE 300s).",
    codeSnippet: `# Configurare politica de evacuare in redis.conf:
maxmemory 2gb
maxmemory-policy allkeys-lru
# Alte optiuni: volatile-lru (doar chei cu TTL), allkeys-lfu, noeviction (arunca eroare)`,
    interviewTrap: "Politica `noeviction` refuza scrierile noi cand memoria este plina si arunca eroare de out-of-memory. In aplicatii web se foloseste de regula `allkeys-lru`.",
    keyTakeaway: "LRU elimina cele mai vechi accesate, LFU elimina cele mai rar folosite, iar TTL asigura curatarea automata a datelor expirate."
  },
  {
    id: "sys-08",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Cache Stampede (Thundering Herd Problem)",
    question: "Ce este un Cache Stampede (Thundering Herd) si prin ce metode se previne prabusirea bazei de date?",
    answer: "1. Ce este Cache Stampede:\n   - Apare cand o cheie de cache extrem de populara (hot key, ex: pagina principala e-commerce sau stirea de ultima ora) EXPIRA brusc sau este stearsa.\n   - In aceeasi milisecunda, mii de cereri concurente gasesc Cache Miss.\n   - Toate aceste mii de thread-uri trimit simultan interogari grele catre baza de date relationala, incercand sa recalculeze aceeasi valoare.\n   - Baza de date atinge 100% CPU si conexiunile se blocheaza, ducand la caderea intregului sistem.\n\n2. Solutii de Prevenire:\n   a) Blocare Mutex / Distributed Lock (Redis SETNX):\n      - Doar PRIMUL thread care intalneste cache miss obtine un lock si merge la baza de date.\n      - Celelalte thread-uri asteapta sau returneaza o valoare veche (stale data) pentru 1-2 secunde.\n   b) Background Refresh anticipat (Probabilistic Early Expiration):\n      - Un worker asincron reimprospateaza cheia inainte de expirarea oficiala a TTL-ului.\n   c) TTL cu Jitter (Adaugare zgomot aleator):\n      - In loc ca 10.000 de chei sa expire toate la fix ora 12:00, pui `TTL = 3600 + random(0, 300)` secunde.",
    codeSnippet: `// Prevenire Cache Stampede cu Redis Mutex Lock:
String data = redis.get(key);
if (data == null) {
    if (redis.setNx("lock:" + key, "1", Duration.ofSeconds(5))) {
        try {
            data = db.query();
            redis.set(key, data, Duration.ofMinutes(10));
        } finally {
            redis.delete("lock:" + key);
        }
    } else {
        Thread.sleep(100); // Asteapta putin ca primul thread sa populeze cache-ul
        return redis.get(key);
    }
}`,
    interviewTrap: "Daca pui acelasi TTL fix pe toate produsele dintr-o categorie la import, ele vor expira toate in aceeasi secunda, garantand un Cache Stampede! Adauga intotdeauna Jitter aleator la TTL.",
    keyTakeaway: "Cache Stampede este asaltul bazei de date de catre mii de cereri simultane la expirarea unei chei fierbinti; se combate prin Mutex locks si TTL cu Jitter."
  },
  {
    id: "sys-09",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Cache Penetration vs Cache Breakdown",
    question: "Care este diferenta intre Cache Penetration si Cache Breakdown si cum se foloseste un Bloom Filter?",
    answer: "1. Cache Breakdown (Caderea unei singure chei fierbinti):\n   - O cheie existenta si foarte solicitata expira din cache, iar un numar mare de cereri lovesc baza de date (vezi Cache Stampede).\n   - Solutie: Mutex lock sau reimprospatare de background.\n\n2. Cache Penetration (Cautarea de date INEXISTENTE):\n   - Un utilizator sau un atacator cere in mod repetat resurse care NU EXISTA nici in cache, nici in baza de date (ex: `GET /users/id=-99999` sau ID-uri generate aleator).\n   - Deoarece resursa nu exista in DB, nu este adaugata niciodata in cache, astfel incat FIECARE cerere loveste baza de date!\n\nSolutii pentru Cache Penetration:\n- Caching-ul valorilor NULL: Salveaza in Redis `id:-999 -> NULL` cu un TTL scurt (ex: 2 minute).\n- Bloom Filter: O structura probabilistica de memorie asezata in fata cache-ului; daca Bloom Filter spune ca ID-ul \"sigur nu exista\", cererea este respinsa instant fara a atinge nici macar Redis sau baza de date!",
    codeSnippet: `// Salvarea valorilor NULL cu TTL scurt pentru a opri penetrarea:
String user = redis.get("user:99999999");
if (user == null) {
    User dbUser = repo.findById(99999999L);
    if (dbUser == null) {
        redis.set("user:99999999", "NOT_FOUND", Duration.ofMinutes(2));
        return null;
    }
}`,
    interviewTrap: "Multi candidati confunda Breakdown cu Penetration. Tine minte: Breakdown = data exista in DB dar a expirat din cache. Penetration = data NU exista nici in cache, nici in DB.",
    keyTakeaway: "Breakdown = cheie populara expirata (se rezolva cu lock). Penetration = interogari malitioase pe ID-uri inexistente (se rezolva cu Bloom Filter sau cache pe NULL)."
  },
  {
    id: "sys-10",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Redis vs Memcached",
    question: "De ce a devenit Redis alegerea standard in industrie in detrimentul Memcached?",
    answer: "Diferente cheie intre Redis si Memcached:\n\n1. Structuri de Date Complexe:\n   - Memcached suporta DOAR perechi simple String-to-String (sau bytes).\n   - Redis suporta structuri native avansate: Strings, Hashes, Lists, Sets, Sorted Sets (ZSET - ideal pentru clasamente/leaderboards), Bitmaps, HyperLogLog si Geospatial indexes.\n\n2. Persistenta pe Disc:\n   - Memcached este pur in-memory; la restart se pierde absolut tot.\n   - Redis ofera mecanisme de persistenta: RDB (snapshots periodice pe disc) si AOF (Append Only File log).\n\n3. Functionalitati Suplimentare:\n   - Redis suporta Pub/Sub, Tranzactii atomice (MULTI/EXEC), Scripturi Lua si clustering nativ cu failover automat (Redis Sentinel / Cluster).\n\nCand mai are sens Memcached:\n- Aplicatii foarte simple multithreaded de caching pur de siruri mari de date unde performanta pe masini multicore masive este singura cerinta.",
    codeSnippet: `# Comenzi Redis unice imposibile in Memcached:
ZADD clasament 1500 "user_ana"
ZADD clasament 2300 "user_dan"
# Extragere top 10 utilizatori dupa scor instant:
ZREVRANGE clasament 0 9 WITHSCORES`,
    interviewTrap: "Memcached este multithreaded intern, pe cand Redis are arhitectura single-threaded pentru executia comenzilor (folosind un event loop asincron non-blocant bazat pe epoll). Asta face comenzile Redis complet ferite de race-conditions pe date!",
    keyTakeaway: "Redis domina datorita structurilor bogate de date (ZSET, Hash, Set), persistentei pe disc si capabilitatilor de Pub/Sub."
  },
  {
    id: "sys-11",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Content Delivery Network (CDN): Functionare si Tipuri",
    question: "Ce este un CDN, cum reduce latenta pentru utilizatorii globali si ce diferenta este intre Push CDN si Pull CDN?",
    answer: "Un CDN este o retea globala de servere distribuite geografic (Edge Servers / Points of Presence - PoP) care pastreaza copii cache ale resurselor statice (imagini, fisiere CSS/JS, clipuri video).\n\nCum functioneaza:\n- Cand un utilizator din Tokio acceseaza un site hostat in Frankfurt, in loc sa astepte 250ms round-trip de retea pana in Germania, cererea este servita de un server CDN local din Tokio in 5ms!\n\n1. Pull CDN (Cel mai comun, ex: Cloudflare, AWS CloudFront):\n   - Serverul CDN preia (\"trage\") resursa de pe serverul de origine doar atunci cand un utilizator o cere prima data (Lazy Cache).\n   - Administrare usoara, dar prima cerere intr-o regiune are o latenta de preluare.\n\n2. Push CDN:\n   - Aplicatia incarca (\"impinge\") proactiv noile fisiere catre toate serverele CDN globale la fiecare release sau cand un continut nou este publicat.\n   - Excelent pentru continut rar modificat sau fisiere mari de instalare (gaming patches).",
    codeSnippet: `Utilizator din Bucuresti
       |
Edge PoP Otopeni (CDN) -> Cache Hit? -> Servit in 4ms!
       | (Cache Miss)
Origin Server (AWS Irlanda Frankfurt) -> 65ms latenta`,
    interviewTrap: "Un CDN nu este doar pentru fisiere statice! CDN-urile moderne ofera Dynamic Site Acceleration (pastreaza conexiuni TCP/TLS calde catre origine) si Edge Computing (Cloudflare Workers).",
    keyTakeaway: "CDN-ul aduce continutul aproape de utilizator prin servere edge locale; Pull CDN incarca la cerere, Push CDN pre-incarca proactiv."
  },
  {
    id: "sys-12",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "REST vs GraphQL: Ghid Decizional",
    question: "Care sunt diferentele fundamentale dintre REST si GraphQL si ce probleme rezolva GraphQL?",
    answer: "1. Problemele rezolvate de GraphQL:\n   - Over-fetching: REST returneaza un obiect JSON masiv cu 40 de campuri cand tie pe mobil iti trebuia doar numele si poza de profil.\n   - Under-fetching (problema N+1 la API): In REST, pentru a afisa un autor si cartile sale, faci un apel `GET /authors/1` si apoi 10 apeluri `GET /books/{id}`. GraphQL permite cererea tuturor datelor relationate intr-un singur request!\n\n2. De ce REST ramane standardul majoritar:\n   - Caching HTTP Nativ: REST foloseste standardul HTTP (coduri 200, 304, headere Cache-Control, ETag). Un reverse proxy sau CDN poate memora usor rezultatele `GET`.\n   - GraphQL foloseste aproape intotdeauna `POST /graphql` si raspunde cu HTTP 200 chiar si la erori, facand caching-ul la nivel de retea/CDN extrem de dificil.\n   - Securitate: In GraphQL, un client poate trimite interogari recursive profunde care doboara baza de date (necesita query complexity limiting).",
    codeSnippet: `# Cerere GraphQL unica (clientul cere strict ce are nevoie):
query {
    user(id: "42") {
        name
        orders {
            id
            total
        }
    }
}`,
    interviewTrap: "Nu raspunde niciodata ca \"GraphQL inlocuieste REST\". Pentru majoritatea aplicatiilor CRUD, REST cu paginare si filtrare este mult mai simplu si mai usor de optimizat la nivel de CDN.",
    keyTakeaway: "GraphQL elimina over/under-fetching dar complica caching-ul HTTP; REST este predictibil, standardizat si usor de memorat in cache."
  },
  {
    id: "sys-13",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "gRPC vs REST in Comunicarea Microserviciilor",
    question: "De ce este gRPC mult mai rapid decat REST/JSON pentru comunicarea interna dintre microservicii?",
    answer: "gRPC (dezvoltat de Google) este un framework RPC de inalta performanta preferat pentru comunicarea backend-to-backend:\n\n1. Format Binar Compact (Protocol Buffers - Protobuf):\n   - REST foloseste JSON (format text冗an cu chei repetitive: `\"nume\": \"Ion\"`).\n   - Protobuf serializeaza datele intr-un format binar extrem de dens, de 5-10 ori mai mic si de 10 ori mai rapid de parsat de catre CPU.\n\n2. Transport pe HTTP/2:\n   - Suporta multiplexare completa (sute de cereri paralele pe o singura conexiune TCP persistenta, eliminand handshake-urile repetate).\n   - Suporta Streaming nativ: Client-streaming, Server-streaming si Bidirectional streaming.\n\n3. Contract Strict de Tipuri (Schema First):\n   - Fisierele `.proto` definesc mesajele si metodele; codul client si server (in Java, Go, Python) este generat automat.",
    codeSnippet: `// Fisier user_service.proto:
syntax = "proto3";

message UserRequest {
    int32 id = 1;
}

message UserResponse {
    string name = 1;
    string email = 2;
}

service UserService {
    rpc GetUser (UserRequest) returns (UserResponse);
}`,
    interviewTrap: "gRPC este fantastic intre microservicii backend, dar este greu de consumat direct din browsere web fara un proxy (gRPC-Web) si mesajele binare nu pot fi citite direct in Wireshark/Postman fara fisierul proto.",
    keyTakeaway: "gRPC este considerabil mai rapid decat REST datorita formatului binar Protobuf si transportului HTTP/2 multiplexat."
  },
  {
    id: "sys-14",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Comunicare in Timp Real: WebSockets vs SSE vs Long Polling",
    question: "Care sunt diferentele practice intre WebSockets, Server-Sent Events (SSE) si Long Polling?",
    answer: "Trei tehnici pentru fluxuri de date in timp real:\n\n1. WebSockets:\n   - Protocol complet BIDIRECTIONAL si full-duplex peste o singura conexiune TCP persistenta.\n   - Clientul si serverul pot trimite date simultan in orice moment cu overhead minim.\n   - Ideal pentru: Aplicatii de chat, jocuri multiplayer online, platforme de trading.\n\n2. Server-Sent Events (SSE):\n   - Conexiune UNIDIRECTIONALA (doar Server -> Client) peste HTTP standard.\n   - Browserul asculta evenimente text (`text/event-stream`); serverul trimite actualizari cand apar.\n   - Are reconectare automata nativa in browser.\n   - Ideal pentru: Notificari, preturi de actiuni la bursa, streaming de raspunsuri LLM (stil ChatGPT), dashboard-uri de monitorizare.\n\n3. Long Polling:\n   - Tehnica veche de rezerva: Clientul trimite un request HTTP; serverul tine conexiunea deschisa pana are date; dupa ce raspunde, clientul initiaza imediat un nou request.",
    codeSnippet: `// Server-Sent Events in Spring Boot (Java):
@GetMapping(value = "/stiri-live", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
public Flux<String> streamStiri() {
    return stiriService.getLiveUpdates();
}`,
    interviewTrap: "Daca ai nevoie doar ca serverul sa trimita date catre client (cum face ChatGPT cand genereaza text), WebSockets este un over-engineering inutil! SSE este mult mai simplu, foloseste HTTP simplu si trece usor de firewall-uri.",
    keyTakeaway: "WebSockets = bidirectionale (chat, gaming). SSE = unidirectionale de la server la client (notificari, fluxuri AI). Long Polling = fallback istoric."
  },
  {
    id: "sys-15",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Idempotenta in API-uri REST si Idempotency Keys",
    question: "Ce inseamna ca o metoda HTTP este Idempotenta si cum implementezi plata unui serviciu fara a risca debitarea dubla?",
    answer: "1. Ce este Idempotenta:\n   - O operatiune este Idempotenta daca executarea ei de N ori produce EXACT ACELASI EFECT pe server ca si o singura executare.\n   - Metode Idempotente: `GET` (doar citeste), `PUT` (inlocuire completa a resursei), `DELETE` (stergerea unui ID inexistent are acelasi efect final).\n   - Metode NON-Idempotente: `POST` (executarea de 5 ori insereaza 5 comenzi noi sau debiteaza contul de 5 ori!).\n\n2. Cum implementezi protectia cu Idempotency Key (Standard Stripe):\n   - Clientul genereaza un UUID unic pentru fiecare intentie de plata si il trimite in header-ul: `Idempotency-Key: a5f2...`.\n   - Cand cererea ajunge pe backend, verificam in Redis cu `SET key \"PROCESSING\" NX EX 120`:\n     - Daca cheia NU exista (NX true): Se proceseaza plata cu banca, iar la final se salveaza rezultatul tranzactiei in Redis.\n     - Daca cheia EXISTA deja si e finalizata: Se returneaza direct rezultatul salvat anterior, FARA a mai apela banca!\n     - Daca cheia este in procesare: Se refuza cu `HTTP 409 Conflict`.",
    codeSnippet: `// Header trimis de aplicatia client:
POST /api/v1/payments
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d
{
  "suma": 150.00,
  "moneda": "RON"
}`,
    interviewTrap: "Nu pune Idempotency Key pe GET sau pe toata durata vietii aplicatiei fara TTL! Pune intotdeauna un TTL rezonabil (ex: 24 de ore) pe cheile de idempotenta.",
    keyTakeaway: "Idempotenta asigura ca retrimiterile automate in caz de timeout de retea nu dubleaza operatiunile critice de business."
  },
  {
    id: "sys-16",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Coduri de Stare HTTP Esentiale la Interviuri",
    question: "Care sunt cele mai frecvente coduri HTTP cerute la interviurile de System Design si diferenta dintre 401 si 403?",
    answer: "Coduri critice de retinut:\n\n1. Succes (2xx):\n   - 200 OK: Cerere procesata cu succes.\n   - 201 Created: Resursa a fost creata cu succes pe server (la `POST`).\n   - 204 No Content: Succes, dar raspunsul nu are corp (ex: dupa `DELETE`).\n\n2. Erori Client (4xx):\n   - 400 Bad Request: Date trimise gresit, schema JSON invalida.\n   - 401 Unauthorized: Lipseste autentificarea (nu stim cine esti, lipseste token-ul sau este expirat).\n   - 403 Forbidden: Esti autentificat, dar NU ai drepturile necesare pentru a accesa resursa (lipsa rol ADMIN).\n   - 404 Not Found: Resursa ceruta nu exista.\n   - 409 Conflict: Conflict de stare (ex: cheie duplicata sau operatie concurenta).\n   - 429 Too Many Requests: Limita de Rate Limiting a fost depasita.\n\n3. Erori Server (5xx):\n   - 500 Internal Server Error: Exceptie neprinsa in codul backend.\n   - 502 Bad Gateway: Proxy-ul a primit un raspuns invalid de la serverul backend.\n   - 503 Service Unavailable: Serverul este supraincarcat sau in mentenanta.\n   - 504 Gateway Timeout: Serverul backend a durat prea mult si proxy-ul a renuntat.",
    codeSnippet: `// Raspuns standard cu Problem Details (RFC 7807) la eroare 429:
HTTP/1.1 429 Too Many Requests
Retry-After: 60
Content-Type: application/json
{
  "title": "Rate limit exceeded",
  "detail": "Ati atins limita de 100 de cereri pe minut. Reincercati peste 60 secunde."
}`,
    interviewTrap: "Diferenta 401 vs 403 este intrebarea clasica de filtrare! 401 inseamna \"neautentificat\" (nu stim cine esti), iar 403 inseamna \"neautorizat\" (stim cine esti, dar n-ai voie).",
    keyTakeaway: "Stapaneste codurile: 201 creat, 204 sters, 401 fara login, 403 fara drepturi, 409 conflict, 429 rate limit, 502/504 gateway fail."
  },
  {
    id: "sys-17",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Componenta API Gateway: Roluri si Avantaje",
    question: "Ce este un API Gateway intr-o arhitectura de microservicii si ce responsabilitati preia?",
    answer: "API Gateway este punctul unic de intrare pentru toti clientii externi (web, aplicatii mobile) catre microserviciile interne din backend.\n\nResponsabilitati principale:\n1. Rutare inteligenta a cererilor (Routing): Transmite cererea catre microserviciul corect pe baza rutei URL (ex: `/orders/*` -> Serviciul Comenzi).\n2. Autentificare si Autorizare: Valideaza semnaturile token-urilor JWT o singura data la intrare, propagand identitatea utilizatorului catre microservicii prin headere interne securizate.\n3. Rate Limiting & Throttling: Protejeaza backend-ul de atacuri DDoS sau utilizatori abuzivi (ex: maxim 50 req/sec per IP).\n4. SSL/TLS Termination: Decripteaza traficul HTTPS la intrare, permitand comunicare HTTP interna rapida in interiorul retelei private.\n5. Agregare de Raspunsuri (BFF - Backend For Frontend): Combina datele din 3 microservicii diferite intr-un singur JSON pentru clienti mobili.",
    codeSnippet: `Client Extern (Mobile / Web)
            |
      [ API Gateway ] (Rate Limit, JWT Check, SSL Term)
       /      |      \\
  Serviciu  Serviciu  Serviciu
   Users     Orders   Payments`,
    interviewTrap: "API Gateway poate deveni un Single Point of Failure (SPOF) si un bottleneck daca se adauga prea multa logica de afaceri in el. Gateway-ul trebuie sa fie stateless si duplicat in spatele unui Load Balancer.",
    keyTakeaway: "API Gateway asigura intrarea unica, securitatea, rate limiting-ul si rutarea, degrevand microserviciile de logica repetitiva."
  },
  {
    id: "sys-18",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Teorema CAP Explicata Simplu",
    question: "Ce afirma Teorema CAP si de ce un sistem distribuit in retea poate alege doar intre CP si AP?",
    answer: "Teorema CAP (Eric Brewer) afirma ca un sistem distribuit de date poate garanta simultan maxim 2 din urmatoarele 3 proprietati:\n\n1. Consistenta (C - Consistency):\n   - Fiecare citire primeste cea mai recenta scriere sau arunca eroare (toate nodurile vad exact aceleasi date in aceeasi clipa).\n2. Disponibilitate (A - Availability):\n   - Fiecare cerere primeste un raspuns non-eroare (succes), fara garantia ca este cea mai recenta scriere.\n3. Toleranta la Partitionare (P - Partition Tolerance):\n   - Sistemul continua sa functioneze chiar daca pachetele de retea dintre noduri sunt pierdute sau intarziate (reteaua este rupta in doua tabere).\n\nDe ce alegem doar CP sau AP:\n- In lumea reala, CABLURILE SI RETELELE PICA INTOTDEAUNA. Toleranta la Partitionare (P) este o realitate fizica inevitabila in orice sistem distribuit!\n- Cand apare o partitie de retea intre Nodul 1 si Nodul 2:\n  - Daca alegi CP: Opresti scrierile/citirile pe nodurile izolate pentru a preveni date inconsistente (sacrifici Disponibilitatea).\n  - Daca alegi AP: Permiti nodurilor sa raspunda chiar daca nu pot sincroniza datele intre ele (sacrifici Consistenta).",
    codeSnippet: `Retea Rupta (Network Partition):
[Nod 1 (Scriere noua)]  <--- X (Cablu rupt) X --->  [Nod 2 (Date vechi)]

Dilema:
- Daca Nod 2 raspunde clientului: AP (Disponibil, dar inconsistent!)
- Daca Nod 2 arunca eroare: CP (Consistent, dar indisponibil!)`,
    interviewTrap: "Nu exista sisteme \"CA\" distribuite in lumea reala! O retea fizica care nu tolereaza caderi de pachete (fara P) este doar un singur server pe un singur calculator.",
    keyTakeaway: "Deoarece partitiile de retea (P) sunt inevitabile, un sistem distribuit trebuie sa aleaga intre Consistenta stricta (CP) si Disponibilitate ridicata (AP)."
  },
  {
    id: "sys-19",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Sisteme CP vs Sisteme AP: Exemple Practice",
    question: "Da exemple de baze de date CP si AP si explica de ce o banca alege CP iar un social media alege AP.",
    answer: "1. Sisteme CP (Consistenta peste Disponibilitate):\n   - Exemple: MongoDB (in configuratie majoritara), HBase, Redis Cluster, Zookeeper, etcd.\n   - Daca apare o ruptura de retea, nodul minoritar refuza cererile pentru a nu permite scrieri divergente (\"split-brain\").\n   - Caz ideal: Sisteme bancare, transferuri de bani, inventar de stocuri unice, emitere bilete de avion.\n\n2. Sisteme AP (Disponibilitate peste Consistenta):\n   - Exemple: Apache Cassandra, Amazon DynamoDB, CouchDB, Riak.\n   - Fiecare nod disponibil continua sa accepte scrieri si citiri; datele se vor sincroniza mai tarziu cand reteaua se repara (Eventual Consistency).\n   - Caz ideal: Numar de like-uri pe YouTube/TikTok, postari pe Instagram, mesagerie, stream de analitice unde e mai grav sa dai ecran alb decat sa vezi un comentariu cu 2 secunde intarziere.",
    codeSnippet: `// Scenariu Banca (CP):
// Daca soldul este 100 RON si retragi 100, este interzis ca alt nod sa zica ca inca mai ai 100!
// Mai bine refuza tranzactia (Error 500) decat sa lase soldul sa devina inconsistent.

// Scenariu Social Media (AP):
// Daca cineva da Like la un video, serverul raspunde instant OK.
// Nu conteaza daca un prieten din alta tara vede contorul actualizat 2 secunde mai tarziu.`,
    interviewTrap: "Baze relationale traditionale (PostgreSQL, MySQL pe un singur nod) sunt strict ACID, nu intra in clasificarea CAP distributed pana nu activezi replicarea clusterizata.",
    keyTakeaway: "Alege CP cand banii si integritatea stricta sunt in joc; alege AP cand serviciul trebuie sa raspunda non-stop si intarzierile de sincronizare sunt tolerate."
  },
  {
    id: "sys-20",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Consistenta Eventuala (Eventual Consistency)",
    question: "Ce este Consistenta Eventuala si care sunt compromisurile pe care le facem cand o adoptam?",
    answer: "1. Ce este:\n   - Un model de consistenta specifica sistemelor distribuite de mare disponibilitate (AP):\n   - Daca nu se mai fac scrieri noi asupra unei resurse, TOATE copiile si nodurile din cluster vor deveni consistente in cele din urma (\"eventually\").\n   - Datele nu devin sincronizate instantaneu in toate centrele de date, dar garantia este ca sincronizarea se va finaliza intr-o fractiune de secunda sau secunde.\n\n2. Compromisuri:\n   - \"Stale Reads\": Un utilizator care citeste imediat dupa o scriere ar putea vedea valoarea veche daca cererea lui ajunge pe o replica care inca nu a primit datele.\n   - Rezolvarea conflictelor: Daca doua noduri au primit actualizari diferite in timpul unei ruperi de retea, trebuie aplicata o regula de unificare (ex: Last-Write-Wins pe baza de timestamp sau vector clocks).",
    codeSnippet: `1. Utilizator posteaza o poza pe serverul din Europa.
2. Serverul Europa confirma: HTTP 201 Created (Instant).
3. Replicarea asincrona trimite poza catre serverele din SUA si Asia.
4. Utilizatorii din Asia vad poza dupa 800ms (Consistenta Eventuala reusita).`,
    interviewTrap: "Multi cred ca \"eventual\" inseamna \"candva in viitor, poate niciodata\". In realitate, in retele sanatoase, eventual consistency dureaza cateva milisecunde (sub 100-500ms).",
    keyTakeaway: "Consistenta eventuala prioritizeaza viteza si disponibilitatea scrierilor, acceptand mici intarzieri temporare pana cand toate nodurile ajung la aceeasi stare."
  },
  {
    id: "sys-21",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Read Replicas si Problema \"Replication Lag\"",
    question: "Cum se folosesc replicile de citire (Read Replicas) pentru scalarea bazelor de date si ce este Replication Lag?",
    answer: "In aplicatiile web obisnuite, raportul citiri-scrieri este adesea 95% citiri si 5% scrieri (Read-Heavy).\n\n1. Modelul Primary - Replica (Master-Replica):\n   - Nodul Primary primeste TOATE scrierile (INSERT, UPDATE, DELETE).\n   - Nodurile Replicas primesc asincron jurnalul de tranzactii (WAL / binlog) de la Primary si deservesc cererile de CITIRE (SELECT).\n   - Daca citirile cresc, adaugam pur si simplu 3 replici noi in spatele unui Load Balancer de baza de date.\n\n2. Ce este Replication Lag:\n   - Intarzierea in timp (milisecunde sau secunde) dintre momentul in care Primary a scris o modificare si momentul cand Replica a aplicat-o.\n   - Problema \"Read Your Own Writes\": Utilizatorul isi actualizeaza numele de profil, da click pe salvare, pagina se reincarca imediat printr-un SELECT pe Replica, si utilizatorul vede vechiul nume!",
    codeSnippet: `// Solutie eleganta pentru "Read Your Own Writes":
// Daca utilizatorul a facut o scriere in ultimele 5 secunde, 
// ruteaza citirile lui temporar direct catre nodul PRIMARY:
if (session.hasRecentWrite(userId)) {
    dataSource = primaryDataSource;
} else {
    dataSource = readReplicaLoadBalancer;
}`,
    interviewTrap: "Daca o replica pica sau e aglomerata, replication lag-ul poate creste la minute. Nu citi niciodata informatii de plata sau solduri bancare de pe o replica asincrona!",
    keyTakeaway: "Read Replicas scaleaza citirile ieftin; atentie la Replication Lag cand utilizatorii doresc sa-si vada imediat propriile modificari."
  },
  {
    id: "sys-22",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Partitionare Orizontala (Sharding) vs Partitionare Verticala",
    question: "Care este diferenta dintre Sharding (partitionare orizontala) si partitionarea verticala a bazelor de date?",
    answer: "Cand volumul de date depaseste capacitatea unui singur server fizic:\n\n1. Partitionare Verticala:\n   - Impartirea bazei de date pe baza de DOMENII sau COLOANE:\n   - Exemplu: Mutarea tabelelor de Utilizatori pe Serverul A, a tabelelor de Comenzi pe Serverul B, si a tabelelor de Produse pe Serverul C.\n   - Sau pe aceeasi tabela: extragerea coloanelor grele text/blob (ex: `descriere_produs TEXT`) intr-o tabela separata.\n   - Limita: Daca tabela de Comenzi ajunge la 2 miliarde de randuri, ea tot nu mai incape pe un singur server.\n\n2. Sharding (Partitionare Orizontala):\n   - Impartirea RANDURILOR aceleiasi tabele pe servere/noduri separate (numite Shards).\n   - Exemplu: Utilizatorii cu ID 1 - 10.000.000 pe Shard 1, ID 10.000.001 - 20.000.000 pe Shard 2.\n   - Toti shards au exact aceeasi schema SQL, dar seturi diferite de date.",
    codeSnippet: `Tabela utilizatori:
Shard 1: ID-uri 1..1M      (Server Fizic 1)
Shard 2: ID-uri 1M+1..2M   (Server Fizic 2)
Shard 3: ID-uri 2M+1..3M   (Server Fizic 3)`,
    interviewTrap: "Sharding-ul este extrem de complex in practica: JOIN-urile intre tabele aflate pe shard-uri diferite devin aproape imposibile sau extrem de lente, iar tranzactiile ACID pe mai multe noduri necesita protocoale grele.",
    keyTakeaway: "Partitionarea verticala imparte tabelele/coloanele; Sharding-ul imparte randurile aceleiasi tabele pe noduri multiple pentru scalare orizontala masiva."
  },
  {
    id: "sys-23",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Alegerea unei Chei de Sharding (Sharding Key) si Hotspots",
    question: "Ce este un Sharding Key si ce se intampla daca alegem o cheie care produce \"Hotspot Partitions\"?",
    answer: "1. Ce este Sharding Key:\n   - Coloana aleasa pentru a decide pe care nod/shard va fi salvat si cautat fiecare rand (ex: `user_id`, `tara`, `data_creare`).\n   - Formula simpla de rutare: `shard_id = hash(sharding_key) % numar_noduri`.\n\n2. Problema Hotspot (Nod supra-solicitat):\n   - Daca alegi ca Sharding Key `data_creare`:\n     - Toate scrierile din ziua de azi vor merge pe UN SINGUR shard (shard-ul zilei curente), in timp ce restul de 50 de shard-uri stau idle!\n   - Daca alegi `tara`:\n     - Shard-ul pentru SUA sau Romania va primi 90% din trafic, iar cel pentru tari mici 0.1%.\n   - Rezultat: Nodul hotspot se prabuseste din cauza CPU si discului plin.\n\n3. Cum alegi o cheie buna:\n   - Alege o cheie cu cardinalitate mare si distributie uniforma a datelor (ex: `user_id` generat uniform prin hash).",
    codeSnippet: `// Antipattern Hotspot:
shard_id = data.getYear(); // Toate comenzile din 2026 merg pe un singur server!

// Pattern Recomandat (Distributie Uniforma):
shard_id = Math.abs(userUuid.hashCode()) % TOTAL_SHARDS;`,
    interviewTrap: "Daca interoghezi dupa o coloana care NU este Sharding Key (ex: cauti comanda dupa `numar_factura` in loc de `user_id`), baza de date trebuie sa trimita query-ul pe TOATE shard-urile simultan (Scatter-Gather), ceea ce e extrem de lent.",
    keyTakeaway: "O cheie de sharding proasta concentreaza traficul pe un singur nod (hotspot); alege coloane cu valori uniforme si cardinalitate ridicata."
  },
  {
    id: "sys-24",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Consistent Hashing: Inelul Hash si Noduri Virtuale",
    question: "De ce formula simpla `hash(key) % N` esueaza la scalare si cum rezolva Consistent Hashing aceasta problema?",
    answer: "1. De ce esueaza `hash(key) % N`:\n   - Daca ai `N = 4` servere de cache si adaugi un server nou (`N = 5`) sau unul pica (`N = 3`), valoarea `hash(key) % N` se schimba pentru aproape 99% din chei!\n   - Toate cheile existente devin invalide instant, cauzand un Cache Miss masiv pe toata baza de date (Storm).\n\n2. Cum rezolva Consistent Hashing:\n   - Mapeaza atat Serverele cat si Cheile pe un cerc logic (Inelul de Hash de la 0 la 2^32 - 1).\n   - O cheie este alocata primului server gasit in sensul acelor de ceasornic pe inel.\n   - Cand se adauga sau se sterge un server, DOAR cheile dintre acel server si vecinul sau sunt migrate! Restul de chei raman intacte pe celelalte servere (doar `K/N` chei re-mapate).\n\n3. Rolul Nodurilor Virtuale (Virtual Nodes):\n   - Daca avem doar 3 servere fizice, ele pot fi plasate neuniform pe inel.\n   - Se creeaza zeci de noduri virtuale pentru fiecare server fizic (ex: Server A1, A2, A3) distribuite aleatoriu, asigurand o incarcare perfect uniforma a memoriei.",
    codeSnippet: `Inel de Hash (0 -> 2^32 - 1):
        [Server A]
       /          \\
  Cheie 1          Cheie 2
     |                |
[Server C]        [Server B]`,
    interviewTrap: "Fara noduri virtuale, Consistent Hashing sufera de distributie asimetrica a datelor (un server poate prinde o felie uriasa din inel).",
    keyTakeaway: "Consistent Hashing minimizeaza re-alocarea cheilor cand se adauga/sterg noduri (doar K/N migrate), iar nodurile virtuale asigura echilibrarea uniforma."
  },
  {
    id: "sys-25",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Cozi de Mesaje: Point-to-Point vs Publish-Subscribe (Pub/Sub)",
    question: "Care este diferenta intre modelul de coada Point-to-Point si modelul Publish-Subscribe (Pub/Sub)?",
    answer: "Doua modele fundamentale de rutare a mesajelor asincrone:\n\n1. Point-to-Point (Queue Clasica):\n   - Fiecare mesaj trimis de producator este consumat si procesat de EXACT UN SINGUR consumator.\n   - Daca exista 5 consumatori care asculta aceeasi coada, mesajele sunt distribuite intre ei in sistem Round Robin (Load Balancing de task-uri).\n   - Odata ce un consumator a dat ACK, mesajul dispare din coada.\n   - Exemplu: Coada de trimitere emailuri, procesare plati, generare PDF.\n\n2. Publish-Subscribe (Pub/Sub - Topics):\n   - Mesajul trimis de un producator catre un Topic este MULTIPLICAT si trimis catre TOTI consumatorii abonati (1-to-Many / Broadcast).\n   - Exemplu: Cand o comanda a fost plasata (`OrderCreatedEvent`), atat Serviciul Facturare, cat si Serviciul Notificari si Serviciul Logistica primesc fiecare o copie a aceluiasi mesaj.",
    codeSnippet: `// Point-to-Point: 1 mesaj -> 1 consumator castigator
Producer -> [ Queue ] -> Consumer 1 (sau Consumer 2)

// Pub/Sub: 1 mesaj -> Toti abonatii primesc o copie
Producer -> [ Topic: comanda_noua ]
                 |--> Consumer Facturi
                 |--> Consumer Notificari
                 |--> Consumer Depozit`,
    interviewTrap: "Daca folosesti Pub/Sub cand voiai procesare paralela a unui task, 5 instante de backend vor genera aceeasi factura de 5 ori!",
    keyTakeaway: "Point-to-Point asigura ca un singur worker proceseaza fiecare sarcina; Pub/Sub asigura ca toti abonatii interesati sunt anuntati de un eveniment."
  },
  {
    id: "sys-26",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "RabbitMQ vs Apache Kafka: Arhitectura si Diferente",
    question: "Care sunt diferentele cheie de arhitectura dintre RabbitMQ si Apache Kafka si cand se alege fiecare?",
    answer: "Diferente fundamentale:\n\n1. RabbitMQ (Message Broker Traditional - Smart Broker / Dumb Consumer):\n   - Proiectat pentru mesagerie orientata pe task-uri si rute complexe (Direct, Fanout, Topic exchanges).\n   - Broker-ul tine evidenta starii fiecarui mesaj: cand un consumator da ACK, mesajul este STERS din coada.\n   - Ofera garantii puternice de livrare, prioritizare de mesaje si latenta infima la volum moderat.\n\n2. Apache Kafka (Distributed Append-Only Commit Log - Dumb Broker / Smart Consumer):\n   - Nu sterge mesajele dupa consumare! Mesajele raman stocate pe disc pentru o perioada definita (Retention Period, ex: 7 zile).\n   - Consumatorul isi gestioneaza propriul cursor (Offset-ul curent).\n   - Permite re-citirea datelor (Replay): Daca un serviciu are un bug, poti da reset la offset si procesa din nou mesajele din ultimele 3 zile!\n   - Debit masiv (milioane de mesaje/secunda) prin partitionare paralela.",
    codeSnippet: `# RabbitMQ: Mesajul dispare dupa ACK
Producer -> [ RabbitMQ Queue ] -> Consumer (ACK -> Mesaj Sters)

# Kafka: Mesajul ramane pe disc in log secvential
Producer -> [ Kafka Log: [0] [1] [2] [3] [4]... ]
                                ^ Consumer A (Offset=2)
                                      ^ Consumer B (Offset=4)`,
    interviewTrap: "Nu alege Kafka pentru cozi simple de background jobs unde vrei prioritizare sau retry individual per mesaj. Kafka nu suporta prioritati de mesaje per-element si e mai greu de administrat decat RabbitMQ.",
    keyTakeaway: "RabbitMQ este ideal pentru fluxuri complexe de sarcini unde mesajele se sterg dupa ACK; Kafka este un log distribuit masiv pentru streaming de evenimente cu replay."
  },
  {
    id: "sys-27",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Semantica de Livrare a Mesajelor: At-Least-Once vs At-Most-Once",
    question: "Care este diferenta dintre At-Most-Once, At-Least-Once si de ce este obligatorie Idempotenta la consumator?",
    answer: "Trei niveluri de garantie de livrare a mesajelor in sisteme distribuite:\n\n1. At-Most-Once (Maxim o data):\n   - Mesajul este livrat o data sau deloc (poate fi pierdut).\n   - Cum se obtine: Consumatorul trimite confirmarea (ACK) INAINTE de a procesa mesajul. Daca procesul pica in timpul procesarii, mesajul este pierdut definitiv.\n   - Caz de uz: Metrici sau date de telemetrie unde viteza e prioritara si pierderea unui pachet este neglijabila.\n\n2. At-Least-Once (Cel putin o data - STANDARDUL IN INDUSTRIE):\n   - Mesajul nu este pierdut NICIODATA, dar poate fi livrat DE MAI MULTE ORI (duplicate)!\n   - Cum se obtine: Consumatorul trimite ACK doar DUPA ce a procesat cu succes mesajul. Daca pica reteaua inainte de a trimite ACK-ul, brokerul va retine mesajul si il va retrimite catre alt worker.\n\n3. De ce este obligatorie IDEMPOTENTA:\n   - Pentru ca At-Least-Once produce inevitabil duplicate in caz de caderi de retea!\n   - Consumatorul trebuie sa fie IDEMPOTENT (sa retina ID-ul mesajului deja procesat intr-o tabela/Redis si sa ignore duplicatele).",
    codeSnippet: `// Consumator Idempotent in Kafka / RabbitMQ:
@RabbitListener(queues = "comenzi")
public void onMesaj(ComandaEvent event) {
    if (mesajeProcesateRepo.existsById(event.getEventId())) {
        log.info("Mesaj duplicat detectat {}, il ignoram.", event.getEventId());
        return; // Skip fara reprocesare
    }
    proceseazaComanda(event);
    mesajeProcesateRepo.save(new MesajProcesat(event.getEventId()));
}`,
    interviewTrap: "Chiar daca un broker se lauda cu \"Exactly-Once Semantics\" (cum are Kafka cu tranzactii end-to-end), daca serviciul tau trimite un SMS sau apeleaza un API extern bancar, dublarea se poate produce in continuare fara idempotenta pe consumator.",
    keyTakeaway: "At-Least-Once garanteaza ca datele nu se pierd dar genereaza duplicate; consumatorii trebuie intotdeauna sa fie proiectati Idempotenti."
  },
  {
    id: "sys-28",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Dead Letter Queue (DLQ) si Poison Pills",
    question: "Ce este un Dead Letter Queue (DLQ), ce este un \"Poison Pill\" si cum se gestioneaza mesajele corupte?",
    answer: "1. Ce este un Poison Pill (Mesaj Otravit):\n   - Un mesaj corupt sau cu un format JSON invalid care cauzeaza o eroare fatala (ex: `NullPointerException` sau `ClassCastException`) la fiecare deserializare in consumator.\n   - Daca mecanismul de retry incearca la infinit, consumatorul intra intr-o bucla infinita de crash si repornire, blocand toata coada!\n\n2. Ce este Dead Letter Queue (DLQ):\n   - O coada auxiliara speciala separata unde sunt mutate automat mesajele care au esuat dupa un numar maxim de incercari (ex: dupa 3 retry-uri esuate).\n\n3. Beneficii DLQ:\n   - Permite consumatorului principal sa mearga mai departe si sa proceseze restul cozii sanatoase.\n   - Mesajele din DLQ pot fi inspectate manual de programatori pentru debugging si pot fi retrimise (replay) in coada principala dupa ce bug-ul este reparat.",
    codeSnippet: `# Exemplu configurare RabbitMQ DLQ:
x-dead-letter-exchange: "dlx_exchange"
x-dead-letter-routing-key: "dlq_orders"
x-max-retries: 3`,
    interviewTrap: "Daca nu setezi alerte pe DLQ, mii de mesaje esuate se pot acumula silentios fara ca echipa de suport sa stie ca utilizatorii au comenzi blocate!",
    keyTakeaway: "DLQ izoleaza mesajele otravite care pica repetat, prevenind blocarea cozii principale si permitand investigarea si reincercarea manuala."
  },
  {
    id: "sys-29",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Backpressure in Sisteme Asincrone",
    question: "Ce este Backpressure (contrapresiunea) si cum protejeaza un consumator lent impotriva unui producator rapid?",
    answer: "1. Ce este problema dezechilibrului:\n   - Cand producatorii genereaza evenimente cu o viteza mai mare decat pot consumatorii sa le proceseze (ex: producatorul trimite 10.000 mesaje/secunda, dar consumatorul poate procesa maxim 500 mesaje/secunda din cauza bazei de date).\n   - Fara protectie, memoria RAM a consumatorului sau a cozii se umple rapid si serverul moare cu OutOfMemory (OOM).\n\n2. Ce este Backpressure:\n   - Un mecanism de feedback prin care consumatorul semnalizeaza producatorului sau brokerului sa incetineasca ritmul de trimitere a datelor.\n\n3. Strategii de control:\n   - Modelul PULL (utilizat in Kafka): Consumatorul este cel care cere mesaje (`poll()`) doar atunci cand este gata si are resurse libere.\n   - Prefetch Count (in RabbitMQ): `basic.qos(prefetch=50)` instruieste brokerul sa nu trimita mai mult de 50 de mesaje neconfirmate catre acel worker.\n   - Aruncarea mesajelor (Dropping / Load Shedding): Daca datele nu sunt critice (ex: stream video), se arunca pachetele noi pana la eliberarea bufferului.",
    codeSnippet: `// RabbitMQ: limitare prefetch la 10 mesaje simultan pe thread:
channel.basicQos(10);

// Kafka: consumatorul controleaza ritmul prin apelul manual poll:
ConsumerRecords<String, String> records = consumer.poll(Duration.ofMillis(100));`,
    interviewTrap: "In arhitecturile Push-based (unde serverul impinge continuu date), consumatorul nu are control si poate fi coplesit daca nu se foloseste un buffer limitat cu politici de respingere.",
    keyTakeaway: "Backpressure previne prabusirea consumatorilor lenti prin controlul ritmului de primire (model Pull sau limite de prefetch)."
  },
  {
    id: "sys-30",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Monolit vs Microservicii: Cand Alegem Monolitul?",
    question: "De ce este Monolitul adesea alegerea corecta la inceputul unui proiect si cand este justificata migrarea la microservicii?",
    answer: "1. De ce sa incepi cu un Monolit (Monolit Modular):\n   - Dezvoltare si testare mult mai rapida: tot codul e intr-un singur loc, pornesti aplicatia cu un singur click in IDE.\n   - Tranzactii ACID locale simple: un transfer bancar se face intr-un simplu `@Transactional` pe aceeasi baza de date, fara SAGA sau tranzactii distribuite.\n   - Zero latenta de retea interna: apelurile intre module sunt simple apeluri de metode Java in memorie (nanosecunde), nu HTTP/gRPC prin cablu (milisecunde).\n   - Mentenanta si deployment simplu: un singur jar/container Docker de deployat.\n\n2. Cand devin justificate Microserviciile:\n   - Echipe de dezvoltare mari (peste 50-100 de ingineri) care se calca pe picioare pe acelasi repository.\n   - Nevoi de scalare asimetrice: 99% din trafic loveste modulul de Video Streaming si doar 1% loveste Facturarea (poti scala doar serviciul de video).\n   - Tehnologii diferite justificate (ex: Python pentru AI/ML si Java pentru tranzactii financiare).",
    codeSnippet: `Monolit:
[ Utilizatori | Comenzi | Facturi ] -> [ O singura Baza de Date ]

Microservicii:
[ Serviciu Utilizatori ] -> (DB Users)
[ Serviciu Comenzi ]     -> (DB Orders)
[ Serviciu Facturi ]     -> (DB Invoices)`,
    interviewTrap: "Multe companii trec la microservicii crezand ca \"va fi mai rapid\", dar descopera ca aplicatia a devenit mai lenta din cauza latentei de retea si a overhead-ului de serializare JSON/HTTP intre zeci de containere!",
    keyTakeaway: "Monolitul este simplu, rapid si fara overhead distribuit; treci la microservicii doar cand organizarea echipelor sau nevoile de scalare asimetrice o cer expres."
  },
  {
    id: "sys-31",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Iluziile Retelelor Distribuite (Fallacies of Distributed Computing)",
    question: "Care sunt cele mai mari 3 presupuneri false pe care le fac programatorii cand trec la sisteme distribuite?",
    answer: "Cele mai periculoase erori de gandire formulate de L. Peter Deutsch:\n\n1. \"Reteaua este fiabila\" (The network is reliable):\n   - In realitate: Retelele pica oricand. Pachetele se pierd, apar timeout-uri, switch-urile se repornesc. Fiecare apel HTTP/RPC extern TREBUIE sa gestioneze posibilitatea unui esec prin timeout si retry.\n\n2. \"Latenta este zero\" (Latency is zero):\n   - In realitate: Un apel in memorie dureaza sub 10 nanosecunde. Un apel prin retea intre doua containere dureaza 1-5 milisecunde (de 500.000 de ori mai lent!). Un lant de 10 microservicii sincrone adauga 50ms de latenta pura doar pe cablu.\n\n3. \"Latimea de banda este infinita\" (Bandwidth is infinite):\n   - In realitate: Daca microserviciile isi paseaza payload-uri uriase de JSON neoptimizat la fiecare cerere, placa de retea devine un bottleneck masiv.",
    codeSnippet: `// Pericol: tratarea apelului extern de retea ca o metoda locala:
Order order = orderClient.getOrder(id); // Ce faci daca dureaza 30 de secunde sau pica?`,
    interviewTrap: "Daca tratezi un apel de retea la fel ca pe un apel de metoda locala in Java, vei scrie cod fragil care va bloca toate thread-urile la prima problema de router sau DNS.",
    keyTakeaway: "Nu uita niciodata: reteaua pica, are latenta reala si latime de banda finita. Proiecteaza mereu sisteme defensive cu timeout-uri si fallback-uri."
  },
  {
    id: "sys-32",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Service Discovery: Client-Side vs Server-Side",
    question: "Ce problema rezolva Service Discovery in microservicii si cum difera Client-Side de Server-Side discovery?",
    answer: "1. Problema:\n   - In containere (Docker, Kubernetes), instantele de microservicii pornesc, se opresc si isi schimba adresele IP dinamice la fiecare cateva ore. Serviciul A nu poate sti pe ce IP fizic raspunde Serviciul B.\n\n2. Registrul de Servicii (Service Registry):\n   - O baza de date centrala (ex: Netflix Eureka, HashiCorp Consul, etcd, K8s DNS) unde fiecare instanta isi inregistreaza IP-ul si portul la pornire si trimite periodic un Heartbeat.\n\n3. Client-Side Discovery:\n   - Clientul (Serviciul A) intreaba direct Registrul: \"Unde e Serviciul B?\".\n   - Registrul returneaza lista de IP-uri active, iar Serviciul A alege un IP (folosind un algoritm intern de load balancing, ex: Spring Cloud LoadBalancer).\n\n4. Server-Side Discovery (Standardul Kubernetes):\n   - Clientul face cererea catre un nume DNS fix (ex: `http://serviciu-b`).\n   - Un router/load balancer intermediar (ex: Kube-Proxy / Ingress) interogheaza registrul si ruteaza traficul catre un pod sanatos.",
    codeSnippet: `# In Kubernetes (Server-side discovery curat prin DNS intern):
curl http://payments-service.default.svc.cluster.local:8080/pay`,
    interviewTrap: "In Kubernetes nu mai ai nevoie de Netflix Eureka! Sistemul nativ de K8s Services si CoreDNS se ocupa automat de Service Discovery la nivel de infrastructura.",
    keyTakeaway: "Service Discovery descopera dinamic IP-urile instantelor de containere; K8s DNS este standardul modern de Server-Side discovery."
  },
  {
    id: "sys-33",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Circuit Breaker Pattern: Starile Closed, Open si Half-Open",
    question: "Cum functioneaza un Circuit Breaker (Resilience4j) si cum previne caderea in cascada a microserviciilor?",
    answer: "Daca Serviciul B este picat si Serviciul A continua sa trimita cereri, thread-urile Serviciului A se vor bloca in asteptare, iar in scurt timp Serviciul A se va prabusi si el (Cadere in Cascada).\n\nCele 3 stari ale unui Circuit Breaker:\n1. CLOSED (Functionare Normala):\n   - Toate cererile trec nestingherite catre Serviciul B.\n   - Daca procentul de erori depaseste un prag (ex: 50% din ultimele 20 de cereri au esuat), circuitul \"se declanseaza\" si trece in starea OPEN.\n\n2. OPEN (Circuit Intrerupt - Protectie Totala):\n   - Nicio cerere NU mai este trimisa catre Serviciul B!\n   - Circuit Breaker-ul respinge cererile instantaneu sau apeleaza o metoda de FALLBACK (ex: returneaza date din cache sau o lista goala).\n   - Serviciul B are timp sa se recupereze fara a fi bombardat cu trafic.\n\n3. HALF-OPEN (Testare Recuperare):\n   - Dupa o perioada de asteptare (ex: 10 secunde), circuitul lasa sa treaca un numar limitat de cereri de proba (ex: 5 cereri).\n   - Daca toate cele 5 reusesc, circuitul revine in starea CLOSED.\n   - Daca oricare esueaza, circuitul se intoarce in starea OPEN.",
    codeSnippet: `// Utilizare Resilience4j in Spring Boot:
@CircuitBreaker(name = "paymentService", fallbackMethod = "plataFallback")
public PaymentResponse initiazaPlata(PaymentRequest req) {
    return paymentClient.charge(req);
}

public PaymentResponse plataFallback(PaymentRequest req, Throwable t) {
    return new PaymentResponse("PENDING_RETRY", "Plata in asteptare, revenim curand.");
}`,
    interviewTrap: "Daca uiti sa setezi timeout-ul de apel pe clientul HTTP, Circuit Breaker-ul nu se va declansa rapid, deoarece fiecare cerere va ramane blocata 60 de secunde inainte sa se considere esec!",
    keyTakeaway: "Circuit Breaker-ul opreste traficul catre un serviciu cazut (OPEN), oferind raspunsuri fallback instantanee si testand recuperarea in starea HALF-OPEN."
  },
  {
    id: "sys-34",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Retry Pattern cu Exponential Backoff si Jitter",
    question: "De ce reincercarea imediata a unei cereri este periculoasa si ce aduce tehnica de Exponential Backoff cu Jitter?",
    answer: "1. Pericolul reincercarii oarbe (Immediate Retry):\n   - Daca o baza de date sau un server este deja supraincarcat (CPU 100%), iar 1.000 de clienti trimit instantaneu cate 3 retry-uri in aceeasi milisecunda, volumul de trafic se tripleaza instant (Self-inflicted DDoS), garantand ca serverul nu se va mai ridica niciodata!\n\n2. Exponential Backoff:\n   - Mareste timpul de asteptare intre reincercari la nivel exponential:\n   - Incercarea 1: asteapta 100ms.\n   - Incercarea 2: asteapta 200ms.\n   - Incercarea 3: asteapta 400ms.\n   - Incercarea 4: asteapta 800ms.\n\n3. Rolul lui JITTER (Zgomot Aleator):\n   - Daca 10.000 de telefoane mobile au primit eroare in aceeasi clipa si folosesc doar exponential backoff, toate vor reincerca simultan la secunda 1, apoi toate simultan la secunda 2 (valuri periodice de trafic).\n   - Adaugarea unui Jitter (o intarziere aleatorie: `pauza = delay_baza + random(0, 50ms)`) disperseaza cererile uniform pe axa timpului, eliberand serverul.",
    codeSnippet: `// Algoritm simplu Exponential Backoff cu Jitter:
long delay = (long) (Math.pow(2, attempt) * 100);
long jitter = ThreadLocalRandom.current().nextLong(0, 50);
Thread.sleep(delay + jitter);`,
    interviewTrap: "Nu aplica niciodata retry pe erori non-tranzitorii! Daca serverul raspunde cu `400 Bad Request` sau `401 Unauthorized`, reincercarea de 5 ori va da garantat acelasi 400/401. Reincercarea se aplica doar pe `503 Service Unavailable`, `504 Timeout` sau erori de I/O de retea.",
    keyTakeaway: "Exponential Backoff mareste treptat pauza intre retry-uri, iar Jitter adauga variatie aleatorie pentru a preveni valurile sincronizate de trafic."
  },
  {
    id: "sys-35",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Bulkhead Pattern: Izolarea Resurselor",
    question: "Ce este Bulkhead Pattern si cum este inspirat din constructia navala pentru a proteja sistemele distribuite?",
    answer: "1. Originea metaforei:\n   - Navele maritime au pereti despartitori etansi numiti \"bulkheads\". Daca o bresa inunda un compartiment, apa este izolata acolo, iar nava ramane pe linia de plutire.\n\n2. In Arhitectura Software:\n   - Impartirea resurselor aplicatiei (Thread Pools, Conexiuni DB, Memorie) in \"compartimente etanse\" izolate per functionalitate.\n\n3. Exemplu practic de utilizare:\n   - Un backend Spring Boot are un Thread Pool global de 100 de thread-uri.\n   - Daca un serviciu extern lent (ex: verificarea cursului valutar) dureaza 10 secunde, toate cele 100 de thread-uri vor fi ocupate asteptand dupa el.\n   - Rezultat: Niciun utilizator nu mai poate face login sau plati, desi modulul de plati functioneaza perfect!\n\n4. Solutia Bulkhead:\n   - Aloca un Thread Pool separat dedicat (ex: maxim 10 thread-uri) pentru cursul valutar.\n   - Chiar daca cursul valutar este blocat, consuma maxim cele 10 thread-uri ale sale; celelalte 90 de thread-uri raman libere pentru restul aplicatiei!",
    codeSnippet: `// Configurare Bulkhead cu ThreadPool dedicat in Resilience4j:
resilience4j.thread-pool-bulkhead.instances.cursValutar:
  maxThreadPoolSize: 10
  coreThreadPoolSize: 5
  queueCapacity: 20`,
    interviewTrap: "Daca folosesti aceeasi baza de date si acelasi connection pool pentru generarea de rapoarte gigantice si pentru tranzactiile clientilor pe site, un raport greu va epuiza conexiunile si va bloca tot magazinul.",
    keyTakeaway: "Bulkhead Pattern partitioneaza pool-urile de resurse pentru a asigura ca blocarea unei functionalitati secundare nu ingenuncheaza intreaga aplicatie."
  },
  {
    id: "sys-36",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Algoritmul Token Bucket pentru Rate Limiting",
    question: "Cum functioneaza algoritmul Token Bucket si de ce este cel mai raspandit mecanism de Rate Limiting?",
    answer: "Token Bucket este algoritmul standard folosit de marile companii (AWS, Stripe, Cloudflare) pentru limitarea traficului:\n\n1. Functionare simpla:\n   - Exista o \"galeata\" (bucket) cu o capacitate maxima prestabilita de jetoane (ex: maxim 10 jetoane).\n   - Un generator adauga jetoane in galeata cu o rata constanta fixa (ex: 2 jetoane pe secunda).\n   - Daca galeata este plina, jetoanele suplimentare se revarsa si sunt ignorate.\n\n2. La fiecare cerere HTTP a clientului:\n   - Daca exista cel putin 1 jeton in galeata: se extrage 1 jeton si cererea este procesata.\n   - Daca galeata este goala (0 jetoane): cererea este respinsa imediat cu `HTTP 429 Too Many Requests`.\n\n3. De ce este atat de iubit:\n   - Permite \"Burst Traffic\": Daca utilizatorul a fost inactiv 5 secunde, galeata s-a umplut cu 10 jetoane, deci poate trimite o rafala scurta de 10 cereri instant.\n   - Implementare extrem de eficienta in memorie: nu trebuie sa stochezi timestamp-uri pentru fiecare cerere; ai nevoie doar de 2 numere in Redis (numar jetoane ramase si ultimul timestamp calculat).",
    codeSnippet: `// Pseudocod Token Bucket:
current_tokens = min(capacity, last_tokens + (now - last_time) * refill_rate);
if (current_tokens >= 1) {
    current_tokens -= 1;
    last_time = now;
    return ACCEPT; // HTTP 200
} else {
    return REJECT; // HTTP 429
}`,
    interviewTrap: "Token Bucket este acuzat ca este complicat, dar in realitate este cel mai compact ca spatiu de memorie in Redis (O(1) memorie per utilizator).",
    keyTakeaway: "Token Bucket acumuleaza jetoane la o rata fixa; accepta rafale scurte (bursts) si este usor de implementat in Redis."
  },
  {
    id: "sys-37",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Leaky Bucket vs Fixed Window Counter",
    question: "Care sunt principiile si limitele algoritmilor Leaky Bucket si Fixed Window Counter?",
    answer: "1. Leaky Bucket (Galeata cu gaura):\n   - Cererile sosesc cu viteze variabile si intra intr-o coada FIFO (galeata).\n   - Cererile \"se scurg\" din galeata si sunt procesate la o RATA STRICT CONSTANTA (ex: fix 3 cereri/secunda).\n   - Daca galeata se umple, cererile noi dau pe afara si sunt respinse.\n   - Avantaj: Niveleaza complet traficul (Smooth Traffic).\n   - Dezavantaj: O rafala legitima de cereri va sta la coada chiar daca serverul are resurse libere in acel moment.\n\n2. Fixed Window Counter (Contor cu fereastra fixa):\n   - Imparte timpul in ferestre fixe de 1 minut (ex: 12:00:00 - 12:00:59) si permite maxim 100 de cereri per fereastra.\n   - Problema grava de granita (\"Edge Burst\"):\n     - Clientul trimite 100 de cereri la secunda 12:00:59 si inca 100 de cereri la secunda 12:01:01.\n     - Ambele ferestre sunt valide din punctul de vedere al contorului, dar serverul a primit 200 de cereri in doar 2 secunde (dublul limitei admise)!",
    codeSnippet: `Fixed Window Problem:
[12:00:00              12:00:59] [12:01:00              12:01:59]
                 (100 req)        (100 req)
                 ^-------------------^
                 200 de cereri in 2 secunde!`,
    interviewTrap: "Fixed Window Counter este cel mai usor de implementat cu `INCR` si `EXPIRE` in Redis, dar trebuie evitat pe sisteme critice din cauza problemei de trafic dublu la granita ferestrei.",
    keyTakeaway: "Leaky Bucket asigura o iesire strict constanta; Fixed Window este simplu dar permite dublarea traficului la tranzitiile dintre ferestre."
  },
  {
    id: "sys-38",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Sliding Window Counter: Solutia Ideala de Rate Limiting",
    question: "Cum elimina algoritmul Sliding Window Counter problema traficului dublu de la granita ferestrei?",
    answer: "Algoritmul hibrid Sliding Window Counter combina memoria redusa a Fixed Window cu acuratetea ferestrei glisante:\n\nCum functioneaza calculul matematic:\n- In loc sa reseteze contorul la zero cand incepe un nou minut, calculeaza o medie ponderata intre Fereastra Precedenta si Fereastra Curenta.\n\nFormula:\n`Cereri_Estimate = Cereri_Fereastra_Curenta + (Cereri_Fereastra_Anterioara * (1 - Procent_Timp_Scurs_In_Fereastra_Curenta))`\n\nExemplu concret:\n- Limita: maxim 100 cereri pe minut.\n- In minutul anterior au fost: 80 cereri.\n- In minutul curent au sosit: 30 de cereri, iar minutul s-a scurs in proportie de 30% (adica au trecut 18 secunde).\n- Calcul ponderat: 30 + (80 * (1 - 0.3)) = 30 + (80 * 0.7) = 30 + 56 = 86 cereri estimate in ultima fereastra glisanta de 60s.\n- 86 < 100, deci cererea este ACCEPTATA!\n- Daca soseau 50 de cereri in primele secunde, calculul depasea 100 si cererea era respinsa!",
    codeSnippet: `// Implementare Sliding Window Counter in Redis (2 chei mici per user):
int prevCount = redis.get("rate:" + userId + ":" + (currentMinute - 1));
int currentCount = redis.get("rate:" + userId + ":" + currentMinute);
double weight = 1.0 - (currentSecond / 60.0);
if (currentCount + (prevCount * weight) > LIMIT) {
    return HTTP_429_TOO_MANY_REQUESTS;
}`,
    interviewTrap: "Spre deosebire de Sliding Window Log (care retine fiecare timestamp intr-un ZSET si consuma memorie uriasa), Sliding Window Counter necesita doar 2 contoare intregi in memorie.",
    keyTakeaway: "Sliding Window Counter ofera o aproximare excelenta a traficului real cu o amprenta de memorie infima, prevenind complet spike-urile de la granita minutului."
  },
  {
    id: "sys-39",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Generarea de ID-uri Unice Distribuite: De ce nu Auto-Increment?",
    question: "De ce cheile primare de tip auto-increment (SERIAL / AUTO_INCREMENT) din SQL nu functioneaza in sisteme distribuite?",
    answer: "Trei limitari majore ale auto-increment-ului intr-un sistem scalat:\n\n1. Sharding / Baze Distribuite:\n   - Daca baza este impartita pe 4 noduri independente, fiecare server ar incepe sa numere de la 1: 1, 2, 3... generand COLIZIUNI masive cand vrei sa imbini datele.\n   - Un singur nod central de generare ID-uri ar deveni un Single Point of Failure si un bottleneck urias.\n\n2. Securitate si Enumerare (Insecure Direct Object References - IDOR):\n   - Daca factura mea are adresa `/facturi/1042`, un atacator stie ca factura `1043` exista si poate descarca toate comenzile competitorilor.\n   - Expune date de afaceri concurentei: daca plasezi o comanda azi si are ID 1000, iar maine are 1200, concurenta stie ca vinzi 200 de produse pe zi!\n\n3. Tranzactii Concurente:\n   - Alocarea de ID-uri secventiale necesita blocaje (locks) interne in motorul de baza de date, limitand numarul de scrieri paralele.",
    codeSnippet: `-- Problematic in arhitecturi distribuite:
CREATE TABLE comenzi (
    id SERIAL PRIMARY KEY -- Nu scaleaza pe 5 servere paralele!
);`,
    interviewTrap: "Unii spun \"folosim auto-increment cu pas (auto_increment_increment = 5 pe fiecare nod)\". Aceasta solutie este rigida: cand vrei sa adaugi al 6-lea server, trebuie sa schimbi configuratia pe toate nodurile!",
    keyTakeaway: "Auto-increment creeaza coliziuni pe noduri multiple, scurge metrici de business si e vulnerabil la atacuri de enumerare IDOR."
  },
  {
    id: "sys-40",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "UUID (v4 vs v7) vs Twitter Snowflake ID",
    question: "Care este diferenta dintre UUIDv4, UUIDv7 si Twitter Snowflake ID si de ce UUIDv4 strica performanta indecsilor B-Tree?",
    answer: "1. UUIDv4 (Complet Aleator - 128 biti):\n   - Avantaj: Zero coordonare intre servere, coliziuni practic imposibile statistic.\n   - Problema grava la baze de date: Fiind complet aleator, distruge indecsii B-Tree (Clustered Index)! Fiecare inserare noua loveste o pagina oarecare din mijlocul arborelui pe disc, provocand masive page splits si I/O lent.\n\n2. UUIDv7 (Standard Modern - Sortabil temporal):\n   - Combina un timestamp Unix de 48 biti la inceput + 74 biti de aleator.\n   - Este sortabil cronologic (K-Sortable), fiind 100% prietenos cu indecsii B-Tree, pastrand in acelasi timp avantajele UUID!\n\n3. Twitter Snowflake ID (64 biti compact):\n   - Structura pe 64 de biti (incape intr-un `BIGINT` in loc de 128 biti ca UUID):\n     - 1 bit de semn (0)\n     - 41 biti: Timestamp in milisecunde (~69 de ani)\n     - 10 biti: ID-ul Masinii/Datacenter-ului (permite 1024 de noduri)\n     - 12 biti: Numar de secventa local (permite 4096 ID-uri per milisecunda per nod!)\n   - Cel mai popular mecanism de generare ID-uri numerice distribuite de mare performanta.",
    codeSnippet: `// Twitter Snowflake ID (64-bit):
// [1 bit 0] [41 biti Timestamp] [5 biti Datacenter] [5 biti Worker] [12 biti Sequence]
// Exemplu ID rezultat: 1541815603606036480 (compact, sortabil, numeric)`,
    interviewTrap: "Daca ai nevoie de ID-uri scurte si numerice pe 64 de biti (cum e cazul in tabele relationale gigantice unde un UUID de 128 biti ar dubla dimensiunea indecsilor), Snowflake este alegerea ideala.",
    keyTakeaway: "UUIDv4 e aleator si strica indecsii; UUIDv7 e sortabil dupa timp pe 128 biti; Snowflake genereaza ID-uri numerice sortabile compacte pe 64 biti."
  },
  {
    id: "sys-41",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Procesare Asincrona de Background Jobs",
    question: "De ce operatiunile consumatoare de timp nu trebuie rulate in thread-ul cererii HTTP si cum se foloseste un Worker Queue?",
    answer: "1. Pericolul procesarii sincrone in request:\n   - Daca utilizatorul se inregistreaza si aplicatia trimite un email de confirmare, genereaza un PDF de bun venit si re-scaleaza poza de profil in cadrul cererii HTTP `POST /register`:\n   - Cererea va dura 5-10 secunde! Daca serverul SMTP are lag, cererea da timeout.\n   - Thread-ul de Tomcat/Jetty ramane blocat, scazand dramatic capacitatea de cereri concurente a serverului.\n\n2. Solutia cu Background Worker Queue:\n   - Thread-ul HTTP salveaza datele in baza de date (stare `PENDING`), pune un mesaj usor in coada (RabbitMQ/Redis/Kafka) si raspunde clientului in 20 de milisecunde: `202 Accepted` sau `201 Created`.\n   - Un grup dedicat de Background Workers (procese separate pe alte masini) consuma mesajele din coada si fac treaba grea (procesare video, trimitere email, generare facturi PDF) in liniste.",
    codeSnippet: `// Flux Asincron Curat in Controller:
@PostMapping("/inregistrare")
public ResponseEntity<Void> register(@RequestBody UserDto dto) {
    User user = userService.salveaza(dto);
    
    // Doar trimite eveniment in coada, nu trimite emailul aici!
    rabbitTemplate.convertAndSend("user_events", new UserRegisteredEvent(user.getId()));
    
    return ResponseEntity.status(HttpStatus.ACCEPTED).build(); // 202 Instant!
}`,
    interviewTrap: "Daca folosesti `@Async` in memoria aceleiasi aplicatii Java in loc de o coada persistenta externa (RabbitMQ/Redis), in caz de crash sau restart al serverului, toate task-urile aflate in executie se pierd definitiv!",
    keyTakeaway: "Elibereaza imediat conexiunea HTTP trimitand sarcina grea intr-o coada externa consumata asincron de worker processes."
  },
  {
    id: "sys-42",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Database Connection Pooling: De Ce Conteaza (HikariCP)",
    question: "Ce este un Connection Pool, de ce deschiderea de conexiuni la baza de date este scumpa si de ce mai multe conexiuni nu inseamna mai multa viteza?",
    answer: "1. De ce este scumpa crearea unei conexiuni:\n   - O conexiune noua la PostgreSQL/MySQL necesita: stabilire socket TCP (3-way handshake), negociere TLS, autentificare utilizator/parola si alocare de memorie pe serverul de baza de date (proces per sesiune in Postgres).\n   - Daca ai deschide o conexiune la fiecare request HTTP, 50% din timpul aplicatiei s-ar pierde facand handshakes de retea!\n\n2. Rolul Connection Pool-ului (ex: HikariCP in Spring Boot):\n   - Mentine un \"bazin\" de conexiuni gata deschise si autentificate.\n   - Un thread ia o conexiune libera, o foloseste pentru interogare si o returneaza inapoi in bazin (fara a o inchide fizic).\n\n3. De ce mai multe conexiuni NU inseamna viteza mai mare:\n   - Daca serverul de PostgreSQL are 8 nuclee CPU si tu deschizi un pool de 500 de conexiuni concurente:\n   - CPU-ul va pierde tot timpul facand Context Switching intre cele 500 de procese, iar performanta scade dramatic!\n   - Formula faimoasa PostgreSQL/Hikari: `conexiuni = (cpu_cores * 2) + effective_spindle_count` (pe un server cu 8 nuclee, ~16-20 de conexiuni e maximul optim!).",
    codeSnippet: `# Setare HikariCP optima in application.properties:
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=10
spring.datasource.hikari.connection-timeout=30000`,
    interviewTrap: "Candidatii juniori au tendinta sa seteze pool-ul la 200 crezand ca \"va fi mai rapid\". In realitate, un pool mic (10-20) bate aproape intotdeauna un pool masiv prin eliminarea certurilor pe CPU si disc (disk thrashing).",
    keyTakeaway: "Connection pool-ul recicleaza conexiunile gata deschise; dimensionarea corecta (mici conexiuni ~2x nuclee CPU) asigura cel mai mare debit."
  },
  {
    id: "sys-43",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "SAGA Pattern: Orchestration vs Choreography",
    question: "Cum asigura SAGA Pattern consistenta tranzactiilor pe multiple microservicii fara Two-Phase Commit (2PC)?",
    answer: "In microservicii, fiecare serviciu are propria baza de date (Database-per-Service), facand imposibila utilizarea unei tranzactii `@Transactional` clasice.\n\nCe este SAGA Pattern:\n- O serie de tranzactii locale. Fiecare serviciu isi executa propria tranzactie locala si emite un eveniment.\n- Daca un pas esueaza (ex: lipsa fonduri la plata), SAGA apeleaza o serie de TRANZACTII COMPENSATORII (tranzactii inverse) pentru a anula pasii anteriori reusiti (ex: deblocheaza stocul rezervat).\n\n1. SAGA Choreography (Fara coordonator central):\n   - Fiecare microserviciu asculta evenimentele altor servicii si decide ce sa faca.\n   - Simplu pentru 2-3 servicii, dar devine un \"spaghetti\" imposibil de urmarit la 10 servicii.\n\n2. SAGA Orchestration (Cu orchestrator central):\n   - Un serviciu dedicat (\"Saga Orchestrator\") controleaza fluxul pas cu pas: trimite comanda catre Serviciul Stoc, asteapta confirmarea, trimite catre Serviciul Plata, etc.\n   - Daca plata esueaza, orchestratorul trimite comanda de compensare \"anuleazaRezervare\" catre Serviciul Stoc.",
    codeSnippet: `Flux SAGA Orchestration (Comanda Plasata):
1. Orchestrator -> Serviciu Stoc: "Rezerva Produs" (Succes)
2. Orchestrator -> Serviciu Plata: "Debiteaza Card" (Esec: Fonduri Insuficiente!)
3. Orchestrator -> Serviciu Stoc: "Compensare: Deblocheaza Produs!"
4. Stare finala: Comanda marcata ESUATA, date consistente.`,
    interviewTrap: "O tranzactie compensatorie nu este un ROLLBACK automat SQL! Este o NOUA scriere care repara logic starea (ex: daca ai emis o factura, compensarea este emiterea unei facturi de stornare).",
    keyTakeaway: "SAGA gestioneaza tranzactii distribuite prin tranzactii locale si actiuni compensatorii in caz de esec; Orchestration este recomandata pentru procese complexe."
  },
  {
    id: "sys-44",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Health Checks in Sisteme Distribuite: Liveness vs Readiness",
    question: "Care este diferenta critica intre o verificare de tip Liveness si una de tip Readiness in Kubernetes sau Spring Boot Actuator?",
    answer: "Cele doua mecanisme prin care un orchestrator de containere verifica sanatatea unei aplicatii:\n\n1. Liveness Probe (Sunt viu?):\n   - Verifica daca aplicatia ruleaza si procesul nu este blocat intr-un Deadlock sau bucla infinita.\n   - Ce face Kubernetes daca Liveness pica: REPORNESTE (KILL & RESTART) containerul!\n   - Implementare: un simplu ping HTTP care returneaza 200 OK daca serverul JVM raspunde.\n\n2. Readiness Probe (Sunt gata sa primesc clienti?):\n   - Verifica daca aplicatia este pregatita sa primeasca si sa proceseze trafic de la utilizatori (ex: conexiunea la baza de date e stabilita, cache-ul initial e incarcat in memorie).\n   - Ce face Kubernetes daca Readiness pica: SCOATE POD-ul din Load Balancer (nu mai trimite trafic catre el), dar NU IL REPORNESTE!\n   - Ii da timp aplicatiei sa se elibereze de sarcina pana cand devine din nou \"gata\".",
    codeSnippet: `# Configurare Kubernetes Pod Health Probes:
livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080`,
    interviewTrap: "Nu pune verificarea conexiunii la baza de date in Liveness Probe! Daca baza de date are un lag de 10 secunde, Kubernetes va omori si reporni toate cele 50 de pod-uri backend simultan, creand haos total. Conexiunea la DB se verifica in Readiness!",
    keyTakeaway: "Liveness pica -> K8s da restart containerului. Readiness pica -> K8s opreste temporar traficul de la load balancer pana cand containerul este gata."
  },
  {
    id: "sys-45",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Observabilitate: Cei 3 Piloni (Logs, Metrics, Traces)",
    question: "Care sunt cei 3 piloni ai observabilitatii intr-un sistem distribuit si ce rol are fiecare?",
    answer: "Pentru a diagnostica probleme intr-un cluster cu zeci de servicii distribuite:\n\n1. Logs (Jurnale de evenimente discrete):\n   - Inregistrari text sau JSON ale unor evenimente specifice la un moment dat (ex: \"Eroare la plata pentru user 42: Card expirat\").\n   - Tehnologii: Logback, ELK Stack (Elasticsearch, Logstash, Kibana), Grafana Loki.\n\n2. Metrics (Date numerice agregate in timp):\n   - Valori numerice masurate periodic pentru a evalua sanatatea generala a sistemului: Utilizare CPU, Memorie, Numar cereri/secunda (QPS), Durata medie a request-urilor, Procent erori 5xx.\n   - Tehnologii: Prometheus, Micrometer, Grafana, Datadog.\n\n3. Traces (Urmarirea fluxului unei cereri cap-coada):\n   - Inregistreaza traseul exact al unei cereri HTTP de la intrarea in API Gateway prin toate cele 5 microservicii si interogari de baza de date parcurse.\n   - Masoara latenta fiecarei bucati individuale (Span-uri).\n   - Tehnologii: OpenTelemetry, Jaeger, Zipkin.",
    codeSnippet: `Logs:    "Utilizatorul X a primit eroare 500 la ora 14:02"
Metrics: "Rata de erori a crescut cu 15% in ultimul minut"
Traces:  "Cererea a durat 4.2 secunde, din care 4.1s au fost petrecute in query-ul SQL din Serviciul Stoc"`,
    interviewTrap: "Doar logurile nu sunt suficiente in microservicii! Daca ai 50 de instante si 10.000 de cereri pe secunda, cautarea in gigabytes de loguri fara metrici si tracing este imposibila.",
    keyTakeaway: "Metrics arata CA exista o problema; Traces arata UNDE este problema in retea; Logs arata DE CE a aparut problema in cod."
  },
  {
    id: "sys-46",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Distributed Tracing si Rolul Correlation ID (Trace ID)",
    question: "Cum ajuta un Correlation ID (Trace ID) la diagnosticarea unei cereri care traverseaza multiple microservicii?",
    answer: "1. Problema:\n   - Un utilizator da click pe \"Cumpara\", iar cererea lui trece prin: API Gateway -> Serviciul Comenzi -> Serviciul Plati -> Serviciul Facturare -> Serviciul Email.\n   - Daca plata esueaza, in ce fisier de log te uiti si cum legi erorile din 5 servere diferite intre ele?\n\n2. Solutia Correlation ID (Trace ID):\n   - API Gateway genereaza un ID unic (UUID) la intrarea cererii in sistem (ex: `X-Correlation-ID: c1a8...`).\n   - Acest ID este injectat in headerele HTTP ale tuturor apelurilor interne dintre microservicii si in mesajele din cozi.\n   - Fiecare microserviciu include acest ID in fiecare linie de log generata (prin MDC - Mapped Diagnostic Context in Java/SLF4J).\n\n3. Rezultatul in productie:\n   - Cand utilizatorul raporteaza o eroare sau primeste 500, cauti `c1a8...` in Kibana sau Grafana si vezi instantaneu TOATE logurile din toate cele 5 servicii generate strict pentru acea cerere, ordonate cronologic!",
    codeSnippet: `// Log formatat cu Correlation ID via Logback MDC:
2026-10-02 14:00:01 [trace-c1a8bf92] INFO  ComandaController - Primita comanda noua
2026-10-02 14:00:02 [trace-c1a8bf92] ERROR PlatiService - Card respins de banca`,
    interviewTrap: "Daca ai thread-uri asincrone sau reactive (CompletableFuture, WebFlux), contextul MDC se poate pierde daca nu este propagat manual sau configurat prin interceptoare dedicate OpenTelemetry.",
    keyTakeaway: "Correlation ID leaga toate logurile si span-urile unei cereri distribuite sub o cheie unica, permitand depanarea instanta a erorilor."
  },
  {
    id: "sys-47",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "SQL vs NoSQL: Ghid Decizional de Arhitectura",
    question: "Care sunt criteriile de arhitectura pentru a alege intre o baza SQL relationala si una NoSQL?",
    answer: "Criterii clare de decizie la interviu:\n\n1. Alege SQL Relational (PostgreSQL, MySQL):\n   - Date puternic relationate intre ele (relatii 1-to-N, N-to-N: clienti, comenzi, facturi, adrese).\n   - Ai nevoie de tranzactionalitate stricta ACID (sisteme financiare, contabilitate, comert).\n   - Schema este stabila si integritatea datelor trebuie impusa la nivel de baza (Foreign Keys, NOT NULL, CHECK).\n   - Ai nevoie de interogari analitice complexe, rapoarte ad-hoc, JOIN-uri si Window Functions.\n\n2. Alege NoSQL (MongoDB, Cassandra, DynamoDB, Redis):\n   - Modele de date Document / Key-Value: cataloage de produse cu atribute complet diferite per categorie.\n   - Date mari care nu necesita relatii cu alte tabele (scrieri masive de senzori IoT, loguri, evenimente clickstream).\n   - Nevoie nativa de sharding automat orizontal pe zeci de masini fizice.\n   - Viteza de scriere si citire simpla dupa cheie (Key-Value) la scara planetara.",
    codeSnippet: `// SQL: Schema rigida cu relatii sigure
SELECT c.nume, o.total FROM clienti c JOIN comenzi o ON c.id = o.client_id;

// NoSQL Document: Totul denormalizat intr-un singur JSON de sine statator
{
  "client": "Mihai",
  "comenzi": [{ "produs": "Laptop", "total": 4500 }]
}`,
    interviewTrap: "Un mit depasit este ca \"Postgres nu stie documente\". PostgreSQL modern suporta tipul JSONB si indecsi GIN, oferind avantajele NoSQL pastrand in acelasi timp tranzactiile ACID!",
    keyTakeaway: "Alege SQL pentru relatii, integritate ferma si tranzactii ACID; alege NoSQL pentru date nestructurate, sharding masiv si acces simplu dupa cheie."
  },
  {
    id: "sys-48",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "DNS si Anycast Routing pe Intelesul Tuturor",
    question: "Cum functioneaza DNS in fluxul unei cereri web si ce este Anycast Routing?",
    answer: "1. DNS (Domain Name System):\n   - \"Cartea de telefon\" a internetului: converteste un nume prietenos precum `api.jobtracker.ro` intr-o adresa IP numerica (`198.51.100.24`).\n   - Ierarhie de caching: Browser Cache -> OS Cache -> Router DNS -> ISP Resolver -> Root DNS (.) -> TLD (.ro) -> Authoritative Nameserver.\n   - DNS are TTL (Time To Live); schimbarile de IP nu sunt instantanee la nivel global din cauza caching-ului intermediar.\n\n2. Anycast Routing:\n   - Tehnica inteligenta de rutare la nivel de retea BGP (folosita de Cloudflare, Google DNS 8.8.8.8):\n   - Aceeasi adresa IP fizica este alocata pe sute de servere diferite din intreaga lume!\n   - Routerele de internet directioneaza pachetele automat catre cel mai apropiat server din punct de vedere al numarului de salturi de retea.\n   - Daca un server pica, routerele trimit automat traficul catre urmatorul cel mai apropiat nod fara niciun downtime!",
    codeSnippet: `DNS Lookup: utilizator -> "api.exemplu.ro" -> 1.1.1.1
Anycast:   IP-ul 1.1.1.1 exista simultan in Frankfurt, Bucuresti si Tokio!
           Clientul din Bucuresti ajunge direct la nodul din Otopeni.`,
    interviewTrap: "Nu folosi DNS Round Robin ca Load Balancer principal de aplicatie! Daca un server din spatele DNS pica, browserele care au memorat acel IP vor continua sa trimita cereri catre serverul mort pana la expirarea TTL-ului.",
    keyTakeaway: "DNS traduce numele in adrese IP; Anycast aloca acelasi IP pe servere din toata lumea, rutand utilizatorii catre cel mai apropiat nod fizic."
  },
  {
    id: "sys-49",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Session Management in Sisteme Scalate: 3 Abordari",
    question: "Cum gestionezi starea de sesiune a unui utilizator logat intr-un cluster cu 10 servere backend?",
    answer: "Trei solutii clasice de arhitectura:\n\n1. Sticky Sessions (Session Affinity la Load Balancer):\n   - Load Balancer-ul trimite acelasi utilizator intotdeauna pe acelasi server backend (prin cookie sau IP hash).\n   - Dezavantaj: Daca serverul respectiv pica sau este restartat la deploy, sesiunea utilizatorului este pierduta! In plus, impiedica distribuirea uniforma a incarcarii.\n\n2. Sesiuni Centralizate Distribuite (Standard cu Redis - Recomandat):\n   - Serverele backend sunt 100% Stateless (nu pastreaza nicio sesiune in memoria lor locala).\n   - ID-ul de sesiune este trimis intr-un Cookie, iar datele de sesiune sunt citite si scrise dintr-un cluster comun de Redis (`Spring Session Data Redis`).\n   - Oricare din cele 10 servere poate servi orice request fara nicio problema.\n\n3. JWT (JSON Web Token - Stateless Token):\n   - Toate datele de identitate si roluri sunt semnate criptografic si stocate direct in token la client.\n   - Backend-ul doar valideaza semnatura cu cheia publica, fara sa consulte nicio baza de date.",
    codeSnippet: `// Modelul Recomandat (Stateless Backend + Redis Sessions):
Client -> [ Load Balancer (Round Robin Pur) ]
              |           |           |
          Backend 1   Backend 2   Backend 3
              \\           |           /
               [ Cluster Redis Comun ]`,
    interviewTrap: "Daca folosesti JWT, reviziunea imediata a drepturilor este dificila (daca blochezi un user sau ii schimbi rolul, tokenul ramane valid pana la expirare, cu exceptia cazului in care tii un blacklist in Redis).",
    keyTakeaway: "Serverele backend trebuie sa fie Stateless; stocheaza sesiunile intr-un cluster distribuit de Redis sau foloseste JWT-uri bine configurate."
  },
  {
    id: "sys-50",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Heartbeat Mechanism si Detectia Caderilor (Failure Detection)",
    question: "Cum detecteaza un Load Balancer sau un cluster distribuit cand un nod a picat?",
    answer: "Mecanismul de Heartbeat (bataie de inima):\n\n1. Functionare:\n   - Nodurile trimit periodic (ex: la fiecare 3-5 secunde) un semnal scurt de tip \"sunt viu\" catre Load Balancer sau catre nodurile vecine (coordonator).\n   - Daca coordonatorul nu primeste niciun heartbeat timp de un interval prestabilit (Heartbeat Timeout, ex: 15 secunde), nodul este declarat DEAD (mort).\n\n2. Ce se intampla cand un nod este declarat mort:\n   - Load Balancer-ul il scoate instant din lista de rutare (nu mai trimite cereri catre el).\n   - Intr-o baza de date distribuita (ex: ReplicaSet Postgres sau Kafka), se declanseaza un proces automat de Leader Election pentru a alege un alt nod ca Primary.\n\n3. False Positives (Alerte False):\n   - Daca serverul este viu dar procesorul este ocupat temporar cu un Garbage Collection lung (Stop-The-World pause), heartbeat-ul poate intarzia.\n   - De aceea se folosesc de regula 3 incercari consecutive esuate inainte de declararea decesului.",
    codeSnippet: `Nod Backend:  [ Heartbeat: 14:00:00 ] -> OK
Nod Backend:  [ Heartbeat: 14:00:03 ] -> OK
Nod Backend:  [ Lipsa raspuns 15s... ] -> NODUL A PICAT!
Load Balancer: Ruteaza traficul exclusiv pe restul nodurilor active.`,
    interviewTrap: "Daca setezi un timeout prea mic la heartbeat (ex: 500ms), o mica pauza de retea va face nodurile sa fie declarate moarte si reinviate continuu (Flapping), provocand instabilitate in cluster.",
    keyTakeaway: "Heartbeat-ul trimite semnale periodice de viata; lipsa lor peste o limita de timeout declanseaza scoaterea din cluster si failover automat."
  },
  {
    id: "sys-51",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design URL Shortener: Algoritm de Codificare (Hash vs Base62)",
    question: "Cum convertesti un URL lung intr-un URL scurt (ex: tinyurl.com/aB3x9) si care este avantajul Base62 fata de un hash MD5?",
    answer: "La proiectarea unui serviciu de scurtare URL (TinyURL / Bitly):\n\n1. De ce NU folosim direct MD5 / SHA-256:\n   - Un hash MD5 are 128 biti (32 caractere hexazecimale, ex: `9e107d9d372bb6826bd81d3542a419d6`), ceea ce este prea lung pentru un URL scurt.\n   - Daca trunchiem hash-ul la primele 7 caractere, apar garantat COLIZIUNI masive (doua URL-uri diferite genereaza aceeasi bucata de 7 caractere).\n\n2. Solutia Recomandata: Base62 Encoding pe un ID Numeric Unic:\n   - Setul de caractere Base62 foloseste: `[0-9]` (10), `[a-z]` (26) si `[A-Z]` (26) = 62 de caractere sigure pentru URL (fara caractere speciale gen ?, &, /).\n   - Cu doar 7 caractere Base62 poti genera: `62^7 = 3.5 trilioane` de combinatii unice!\n   - Flux: Fiecare URL primeste un ID numeric unic generat de un generator distribuit (ex: Snowflake ID sau secventa DB) si se converteste numarul in baza 62.",
    codeSnippet: `// Algoritm conversie Numar -> Base62 (fara coliziuni):
public static String toBase62(long id) {
    String chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    StringBuilder sb = new StringBuilder();
    while (id > 0) {
        sb.append(chars.charAt((int) (id % 62)));
        id /= 62;
    }
    return sb.reverse().toString();
}
// ID: 1253000 -> Rezultat: "55m8"`,
    interviewTrap: "Daca folosesti auto-increment SQL simplu pentru ID, oricine poate ghici URL-urile scurte anterioare prin decrementarea valorii Base62. Se recomanda utilizarea unui generator neliniar sau Snowflake ID.",
    keyTakeaway: "Base62 converteste un ID numeric unic intr-un sir scurt si compact de 7 caractere, garantand 3.5 trilioane de URL-uri fara nicio coliziune."
  },
  {
    id: "sys-52",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design URL Shortener: Baza de Date, Caching si Redirect 301 vs 302",
    question: "Ce cod de redirect HTTP folosim la un URL Shortener (301 vs 302) si cum folosim Redis pentru viteza?",
    answer: "1. Redirect HTTP: 301 Moved Permanently vs 302 Found (Temporary Redirect):\n   - 301 (Permanent): Browserul utilizatorului memoreaza in cache redirectarea locala! Urmatoarele click-uri merg direct la URL-ul destinatie fara a mai atinge serverul TinyURL.\n     - Avantaj: Reduce traficul pe server.\n     - Dezavantaj: Nu mai poti contoriza statisticile de click-uri (Analytics)!\n   - 302 (Temporar - ALEGEREA STANDARD PENTRU ANALYTICS):\n     - Toate click-urile trec prin serverul TinyURL, permitand inregistrarea de statistici (tara, dispozitiv, ora) inainte de redirectare.\n\n2. Caching cu Redis:\n   - Raport citiri-scrieri urias (100:1 - Read-Heavy).\n   - Cele mai accesate 20% din URL-uri (regula 80/20) sunt memorate in Redis cu politica `allkeys-lru`.\n   - La fiecare redirectare, verificam intai Redis (`GET short_code`); daca exista, facem redirect in sub 2 milisecunde!",
    codeSnippet: `// Controller Spring Boot pentru redirect 302 cu contorizare:
@GetMapping("/{code}")
public ResponseEntity<Void> redirect(@PathVariable String code) {
    String longUrl = redis.get(code);
    if (longUrl == null) {
        longUrl = urlRepository.findByCode(code)
            .map(UrlMapping::getLongUrl)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        redis.set(code, longUrl, Duration.ofDays(7));
    }
    analyticsQueue.send(new ClickEvent(code, Instant.now())); // Async
    return ResponseEntity.status(HttpStatus.FOUND) // HTTP 302
        .location(URI.create(longUrl))
        .build();
}`,
    interviewTrap: "Daca raspunzi 301 la interviu fara sa mentionezi ca 301 opreste colectarea de date analitice pe click-uri, intervievatorul va deduce ca nu stii cum functioneaza caching-ul in browser.",
    keyTakeaway: "Foloseste HTTP 302 pentru a putea colecta statistici de click-uri si retine cele mai accesate coduri in Redis LRU pentru redirectionare instantanee."
  },
  {
    id: "sys-53",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Upload Masiv de Fisiere: De Ce Folosim S3 Pre-Signed URLs",
    question: "De ce este un anti-pattern sa incarci fisiere video sau PDF mari prin serverul backend Java si cum functioneaza Pre-Signed URLs?",
    answer: "1. De ce NU incarcam fisiere mari prin Backend (Spring Boot):\n   - Daca 500 de utilizatori incarca simultan clipuri video de 500MB prin controller-ul Java:\n   - Latimea de banda (Network Bandwidth) si memoria RAM a serverului backend sunt complet epuizate transferand fluxuri de octeti.\n   - Thread-urile Tomcat raman blocate zeci de secunde pentru fiecare fisier, iar aplicatia devine indisponibila pentru restul utilizatorilor!\n\n2. Solutia Arhitecturala: Pre-Signed URLs (Upload Direct in Cloud Storage):\n   - Pas 1: Clientul (React/Mobile) intreaba backend-ul: \"Vreau sa incarc fisierul avatar.png de 2MB. Imi dai voie?\".\n   - Pas 2: Backend-ul valideaza permisiunile utilizatorului si genereaza rapid un URL semnat temporar securizat direct catre AWS S3 / Google Cloud Storage (cu valabilitate de 5 minute).\n   - Pas 3: Clientul face `PUT` direct din browser catre AWS S3 folosind acel URL semnat!\n   - Pas 4: La finalul upload-ului, AWS S3 emite un webhook/eveniment catre backend pentru confirmare.\n   - Rezultat: Niciun megaoctet de fisier nu trece prin CPU-ul sau memoria serverului tau backend!",
    codeSnippet: `Browser Web 
     | 1. POST /api/upload-request (nume, marime)
Backend API (Java) 
     | 2. Genereaza S3 Pre-Signed URL semnat cu cheia AWS
Browser Web 
     | 3. PUT https://s3.amazonaws.com/bucket/avatar.png?Signature=...
Amazon S3 (Cloud Storage Direct)`,
    interviewTrap: "Asigura-te ca URL-ul pre-semnat are un TTL scurt (5-15 minute) si constrangeri de dimensiune maxima a fisierului (content-length restriction) pentru a nu permite incarcarea de fisiere gigantice.",
    keyTakeaway: "Pre-Signed URLs permit clientilor sa incarce fisiere direct in S3, eliminand complet presiunea de retea si memorie de pe serverele de backend."
  },
  {
    id: "sys-54",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design Sistem de Notificari: Arhitectura pe Canale Multiple",
    question: "Care sunt componentele cheie ale unui sistem scalabil de notificari (Email, SMS, Push Notif)?",
    answer: "Componentele de baza ale unui Notification Service:\n\n1. API Gateway & Serviciu de Notificari:\n   - Primeste cereri interne de la alte microservicii (ex: \"Trimite confirmare comanda 42 catre user 10\").\n   - Valideaza datele si verifica preferintele utilizatorului (ex: daca utilizatorul a dezactivat notificarile SMS).\n\n2. Cozi de Mesaje Separate per Canal (RabbitMQ / Kafka):\n   - O coada dedicata pentru EMAIL (trimitere prin SendGrid / SES).\n   - O coada dedicata pentru SMS (trimitere prin Twilio).\n   - O coada dedicata pentru PUSH (trimitere prin Firebase Cloud Messaging - FCM / Apple APNs).\n   - De ce SEPARATE: Daca Twilio are un lag de 10 secunde pe SMS, coada de Email nu este afectata deloc!\n\n3. Worker Processes Dedicati:\n   - Consuma din cozi, apeleaza providerii externi si gestioneaza erorile prin retry cu exponential backoff.\n\n4. Rate Limiting per Utilizator:\n   - Pentru a preveni spam-ul utilizatorilor in caz de bug in backend (maxim 3 notificari pe ora per user).",
    codeSnippet: `Serviciu Notificari
        |
  [ RabbitMQ / Kafka ]
   /        |        \\
[Coada]   [Coada]   [Coada]
 Email      SMS      Push
   |         |         |
Worker    Worker    Worker
SendGrid  Twilio     FCM`,
    interviewTrap: "Daca folosesti o singura coada comuna pentru toate canalele, o blocare a serviciului de SMS va opri instantaneu si trimiterea tuturor emailurilor si notificarilor push!",
    keyTakeaway: "Foloseste cozi complet izolate pentru fiecare canal de notificare (Email, SMS, Push) pentru a preveni blocarea in cascada a providerilor terti."
  },
  {
    id: "sys-55",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Sistem de Notificari: Deduplicare si Sabloane Dinamice",
    question: "Cum previi trimiterea de notificari duplicate (ex: 2 SMS-uri identice) si cum separi continutul de cod?",
    answer: "1. Deduplicarea Notificarilor (Prevenirea SMS-urilor duble):\n   - Daca un worker pica dupa ce a trimis SMS-ul dar inainte de a da ACK in coada, mesajul va fi retrimis (At-Least-Once delivery).\n   - Solutie: Se genereaza un Deduplication Hash pe baza datelor mesajului: `hash(user_id + tip_eveniment + id_entitate)` (ex: `hash(user:10:comanda:42:plata)`).\n   - Inainte de trimitere, worker-ul verifica in Redis: `SET deduplication_key \"1\" NX EX 3600`:\n     - Daca cheia exista deja, trimiterea este anulata imediat!\n\n2. Sabloane Dinamice (Template Engine):\n   - Textele notificarilor nu se hardcodeaza niciodata in codul Java!\n   - Se folosesc sabloane HTML/Text externe (ex: Thymeleaf, FreeMarker, Mustache) salvate in baza de date sau fisiere de configurare:\n     - \"Buna {{nume}}, comanda ta {{numar_comanda}} a fost expediata!\".\n   - Permite schimbarea textelor de catre echipa de marketing fara a fi nevoie de un nou deploy de aplicatie.",
    codeSnippet: `// Verificare deduplicare in Redis inainte de apelul Twilio:
String dedupKey = "notif:" + user.getId() + ":" + order.getId() + ":SHIPPED";
Boolean isFirst = redis.setIfAbsent(dedupKey, "SENT", Duration.ofHours(24));

if (Boolean.FALSE.equals(isFirst)) {
    log.warn("Notificare duplicata detectata, ignoram.");
    return; // Nu mai trimite SMS!
}
twilioService.sendSms(user.getPhone(), mesajRenderat);`,
    interviewTrap: "SMS-urile costa bani reali! Trimiterea unui SMS duplicat din cauza unui retry netratat nu doar ca enerveaza utilizatorul, dar genereaza costuri uriase companiei la scara de milioane de mesaje.",
    keyTakeaway: "Deduplicarea prin chei unice in Redis previne trimiterile multiple cauzate de retry-uri; sabloanele externe decupleaza textele de codul sursa."
  },
  {
    id: "sys-56",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design Flash Sale: Prevenirea Vanzarii Peste Stoc (Overbooking)",
    question: "Cum gestionezi un Flash Sale (100.000 de cereri pe secunda pentru 500 de bilete la concert) fara a bloca baza de date si fara a vinde peste stoc?",
    answer: "La un Flash Sale (ex: Black Friday sau vanzare bilete), baza de date relationala ar muri instant daca fiecare cerere ar executa `UPDATE stoc SET cantitate = cantitate - 1 WHERE id = 1` din cauza certurilor pe row-lock.\n\nArhitectura pe 3 niveluri de protectie:\n\n1. Nivelul 1: Caching agresiv la CDN & Nginx:\n   - Detaliile concertului si pretul sunt 100% statice la nivel de CDN (0 trafic catre backend pentru citiri).\n\n2. Nivelul 2: Decrementare Atomica in REDIS in-memory:\n   - Stocul de 500 de bilete este incarcat in prealabil in Redis ca un contor intreg: `SET stoc_concert_42 500`.\n   - Cand utilizatorul apasa \"Cumpara\", backend-ul ruleaza comanda atomica `DECR stoc_concert_42`:\n     - Daca rezultatul este `>= 0`: Utilizatorul a prins un loc! Cererea lui primeste un Token de Rezervare.\n     - Daca rezultatul este `< 0`: Stocul este epuizat! Cererea este respinsa instant in memorie (sub 1ms), FARA a atinge vreodata baza de date relationala!\n\n3. Nivelul 3: Procesare Asincrona de Comenzi:\n   - Doar cele 500 de cereri castigatoare sunt trimise intr-o coada (RabbitMQ) pentru generarea comenzilor si plata in baza de date PostgreSQL.",
    codeSnippet: `// Script atomic Redis (Lua) pentru rezervare sigura de stoc:
Long stocRamas = redisTemplate.opsForValue().decrement("stoc:concert:42");
if (stocRamas < 0) {
    return ResponseEntity.status(HttpStatus.GONE).body("Bilete epuizate!");
}
// Doar castigatorii ajung aici:
comenziQueue.send(new CreareComandaEvent(userId, concertId));
return ResponseEntity.ok("Bilet rezervat! Finalizati plata in 10 minute.");`,
    interviewTrap: "Daca utilizatorul nu finalizeaza plata in 10 minute, stocul trebuie returnat! Se foloseste un scheduler sau un mesaj cu intarziere (delayed message) care apeleaza `INCR stoc_concert_42` daca plata nu a fost confirmata.",
    keyTakeaway: "Decupleaza stocul fierbinte din DB; foloseste decrementarea atomica in Redis (DECR) pentru a respinge instant 99.5% din trafic si trimite doar castigatorii in coada."
  },
  {
    id: "sys-57",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Flash Sale: Coada Virtuala de Asteptare (Virtual Waiting Room)",
    question: "Ce este o Camera Virtuala de Asteptare (Waiting Room) si cum niveleaza traficul extrem?",
    answer: "1. Ce este o Camera Virtuala de Asteptare:\n   - Cand 500.000 de oameni acceseaza un magazin online la fix ora 00:00, trimiterea lor directa catre backend ar dobori chiar si sistemele scalate.\n   - In loc sa le dai eroare 503, utilizatorii sunt intampinati la nivel de CDN / Edge de un ecran elegant de asteptare: \"Esti pe pozitia #1.420 in coada. Timp estimat: 2 minute\".\n\n2. Cum functioneaza tehnic:\n   - Fiecare utilizator primeste un token semnat cu pozitia lui intr-o coada Redis (Sorted Set ZSET ordonat dupa timestamp-ul sosirii).\n   - Un mecanism de control elibereaza utilizatorii din coada in transe mici controlate (ex: 200 de utilizatori la fiecare 5 secunde) catre magazinul real.\n   - Toti ceilalti utilizatori stau pe o pagina statica usoara care face polling la fiecare 5 secunde pe CDN.",
    codeSnippet: `# Adaugare user in coada virtuala ordonata dupa timp (ZSET in Redis):
ZADD coada_asteptare 1727900001 "user_ana"
ZADD coada_asteptare 1727900002 "user_bogdan"

# Aflare pozitie exacta in coada in timp real:
ZRANK coada_asteptare "user_bogdan" # Intoarce indexul 1 (pozitia 2)`,
    interviewTrap: "Nu lasa clientii sa faca polling la 500ms pe serverul principal! Polling-ul statusului de coada trebuie servit din Redis sau dintr-un CDN Edge Worker usor.",
    keyTakeaway: "Waiting Room protejeaza backend-ul transformand un soc violent de trafic simultan intr-un flux continuu si predictibil de utilizatori serviti pe rand."
  },
  {
    id: "sys-58",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design Sistem de Chat: Arhitectura WebSockets cu Redis Pub/Sub",
    question: "Daca Utilizatorul A este conectat prin WebSocket la Serverul 1 si Utilizatorul B la Serverul 2, cum transmiti mesajul intre ei?",
    answer: "Problema fundamentala a chat-urilor scalate orizontal:\n- Conexiunile WebSocket sunt STARI PERSISTENTE (Stateful).\n- Serverul 1 tine socketul deschis cu Utilizatorul A.\n- Serverul 2 tine socketul deschis cu Utilizatorul B.\n- Daca Utilizatorul A trimite un mesaj pentru B catre Serverul 1, Serverul 1 nu are socket deschis cu B si nu il poate atinge direct!\n\nSolutia cu Message Broker Distribuit (Redis Pub/Sub):\n1. Fiecare server de WebSocket se aboneaza la un canal de mesaje distribuit (Redis Pub/Sub).\n2. Cand Serverul 1 primeste mesajul de la A destinat lui B, il publica in Redis: `PUBLISH user_b_channel \"Salut B!\"`.\n3. Serverul 2, care stie ca gazduieste conexiunea activa a lui B, asculta canalul lui B din Redis, primeste mesajul si il impinge instantaneu prin conexiunea WebSocket locala catre telefonul lui B!\n4. Rezultat: Orice utilizator poate vorbi cu oricine, indiferent pe ce masina fizica este conectat.",
    codeSnippet: `Utilizator A
     | (WebSocket)
[ Server 1 ]
     | (PUBLISH canal:user_b)
[ Redis Pub/Sub Cluster ]
     | (Eveniment)
[ Server 2 ]
     | (WebSocket)
Utilizator B`,
    interviewTrap: "Redis Pub/Sub nu retine mesajele in istoric (nu este persistent)! Daca B este offline in acel moment, mesajul se pierde din Pub/Sub. Mesajul trebuie salvat in paralel si intr-o baza de date de mesagerie.",
    keyTakeaway: "Redis Pub/Sub leaga serverele de WebSocket intr-o panza comuna, permitand rutarea mesajelor catre conexiunea corecta pe masini diferite."
  },
  {
    id: "sys-59",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Sistem de Chat: Stocarea Mesajelor Istorice (Cassandra vs RDBMS)",
    question: "Ce model de baza de date este optim pentru stocarea a miliarde de mesaje de chat (WhatsApp / Discord style)?",
    answer: "Caracteristicile traficului de chat:\n- Volum masiv de scriere (Write-Heavy) continuu.\n- Mesajele noi sunt citite de 100 de ori mai des decat cele vechi.\n- Accesul la date este aproape intotdeauna secvential: \"arata-mi ultimele 50 de mesaje din conversatia X ordonate dupa data\".\n- Mesajele nu se modifica aproape niciodata dupa trimitere (immutable append-only).\n\nDe ce este preferata o baza NoSQL Wide-Column (Apache Cassandra / ScyllaDB) sau DynamoDB:\n1. Scrieri Secventiale Fulgeratoare: Cassandra scrie in memorie (MemTable) si pe disc secvential (CommitLog / SSTables) in O(1), fara lock-uri pe randuri.\n2. Sharding Nativ Excelent:\n   - Cheie de Partitionare: `conversation_id` (toate mesajele dintr-un grup sunt pastrate pe acelasi nod).\n   - Cheie de Sortare (Clustering Key): `message_id` / `timestamp` descrescator.\n3. Scalare orizontala nelimitata prin simpla adaugare de noduri.",
    codeSnippet: `-- Schema Cassandra CQL ideala pentru chat:
CREATE TABLE mesaje_chat (
    conversation_id UUID,
    created_at TIMESTAMP,
    message_id TIMEUUID,
    sender_id UUID,
    continut TEXT,
    PRIMARY KEY ((conversation_id), created_at, message_id)
) WITH CLUSTERING ORDER BY (created_at DESC);`,
    interviewTrap: "Nu folosi PostgreSQL pentru miliarde de mesaje de chat fara partitionare riguroasa! La miliarde de randuri, re-indexarea B-Tree la fiecare insertie incepe sa incetineasca masiv scrierile.",
    keyTakeaway: "Cassandra este ideala pentru mesagerie istorica datorita modelului append-only rapid si partitionarii dupa conversation_id cu sortare temporala."
  },
  {
    id: "sys-60",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Design Web Crawler: Componente si Reguli de Politete",
    question: "Care sunt componentele esentiale ale unui Web Crawler (Google Bot style) si ce inseamna politetea (Politeness)?",
    answer: "Componentele de baza ale unui Web Crawler:\n\n1. URL Frontier (Coada de prioritati):\n   - Stocheaza lista de URL-uri care asteapta sa fie descarcate.\n\n2. HTML Fetcher & Parser:\n   - Descarca pagina web via HTTP, extrage continutul text pentru indexare si gaseste toate link-urile noi `<a href=\"...\">` pe care le adauga in URL Frontier.\n\n3. Duplicate URL Eliminator:\n   - Previne descarcarea aceleiasi pagini de 100 de ori (foloseste un Bloom Filter sau tabela Hash pe baza de hash-uri de URL).\n\n4. Ce inseamna Regula de Politete (Politeness):\n   - Un crawler necivilizat ar putea trimite 500 de cereri pe secunda catre un site mic, doborandu-i serverul (DDoS neintentionat).\n   - Politetea presupune:\n     - Respectarea fisierului `robots.txt` al site-ului (care indica paginile interzise si directiva `Crawl-delay`).\n     - Rate Limiting strict per domeniu (ex: maxim 1 cerere la fiecare 1-2 secunde catre acelasi server gazda).",
    codeSnippet: `URL Frontier -> [ Scheduler cu Politete per Domeniu ]
                      |
                 [ Fetcher ] -> Citeste robots.txt
                      |
                 [ Parser ]  -> Extrage text & link-uri noi
                      |
              [ Bloom Filter ] -> E link nou? -> Adauga in Frontier`,
    interviewTrap: "Daca nu detectezi buclele infinite (spider traps, ex: calendare web dinamice cu link catre \"urmatoarea luna\" la infinit), crawler-ul se va bloca descarcand milioane de pagini generate artificial.",
    keyTakeaway: "Web Crawler-ul descarca si extrage link-uri recurent; politetea (respectarea robots.txt si pauze per domeniu) previne sabotarea serverelor terte."
  },
  {
    id: "sys-61",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Search Autocomplete (Typeahead): Structura Trie si Caching",
    question: "Ce structura de date este ideala pentru un sistem de Search Autocomplete (Google Sugestii) si cum scaleaza?",
    answer: "1. Structura de date de baza: TRIE (Prefix Tree):\n   - Un arbore in care fiecare nod reprezinta un caracter.\n   - Cautarea tuturor cuvintelor care incep cu un prefix (ex: \"jav\") se face parcurgand arborele: Radacina -> j -> a -> v in timp `O(L)`, unde L este lungimea prefixului (independent de milioanele de cuvinte existente)!\n\n2. Optimizare pentru Viteza Instantanee:\n   - In loc sa parcurgi toti descendentii nodului la runtime, FIECARE NOD stocheaza deja in memoria sa TOP 5 cele mai populare cautari din ramura sa!\n   - Astfel, cand utilizatorul tasteaza \"jav\", citirea primelor 5 sugestii este `O(1)`!\n\n3. Scalabilitate si Productie:\n   - Memorie Cache in Redis: Prefixe comune salvate direct in memorie (`prefix:jav -> [\"java\", \"javascript\", \"java interview\"]`).\n   - Distribuire: Trie-ul este compilat offline o data pe zi pe baza jurnalelor de cautari si replicat pe servere de memorie.",
    codeSnippet: `Structura Trie cu Top Sugestii Pre-calculate:
       (radacina)
           |
          [j] (top: java, jobs)
           |
          [a] (top: java, javascript)
           |
          [v] -> Contine deja salvat: ["java", "javascript", "java 21"]`,
    interviewTrap: "Daca incerci sa faci `SELECT query FROM searches WHERE query LIKE 'jav%' ORDER BY frequency DESC LIMIT 5` in SQL la fiecare tasta apasata de 100 de milioane de utilizatori, baza de date va muri instant. Autocomplete-ul se tine exclusiv in memorie RAM!",
    keyTakeaway: "Trie-ul pre-calculeaza cele mai populare cautari la nivel de nod prefix, asigurand timpi de raspuns in sub 10ms direct din memorie."
  },
  {
    id: "sys-62",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Top-K Heavy Hitters (Cele Mai Populare Elemente)",
    question: "Cum gasesti in timp real cele mai vizionate 10 clipuri de pe YouTube din ultimele 24 de ore fara a sorta miliarde de inregistrari?",
    answer: "Sortarea a 10 miliarde de inregistrari la fiecare minut este imposibila computational.\n\n1. Solutia de Streaming cu Fereastra Glisanta:\n   - Arhitectura bazata pe Apache Flink, Kafka Streams sau Redis.\n   - Datele sunt agregate in micro-loturi pe ferestre de timp (ex: ferestre glisante de 1 minut).\n\n2. Algoritmul Probabilistic Count-Min Sketch:\n   - Daca memoria este limitata, Count-Min Sketch este o structura de date 2D pe baza de functii hash care estimeaza frecventa fiecarui eveniment cu o precizie de 99.9% folosind doar cativa megabytes de memorie!\n\n3. Min-Heap de Dimensiune K (K = 10):\n   - Mentine un Min-Heap de maxim 10 elemente in memorie.\n   - Daca un video are contorul mai mare decat radacina heap-ului (cel mai mic din top 10), se scoate radacina si se insereaza noul video in `O(log K)`.\n   - La final, heap-ul contine garantat primele 10 cele mai populare elemente!",
    codeSnippet: `// Mentinere Top 10 cu PriorityQueue (Min-Heap) in Java:
PriorityQueue<VideoStats> top10 = new PriorityQueue<>(Comparator.comparingLong(v -> v.views));

for (VideoStats v : streamAgregat) {
    if (top10.size() < 10) {
        top10.offer(v);
    } else if (v.views > top10.peek().views) {
        top10.poll(); // Scoate minimul
        top10.offer(v); // Adauga noul lider
    }
}`,
    interviewTrap: "La interviuri, candidatii spun adesea \"rulez un GROUP BY video_id ORDER BY COUNT(*) DESC LIMIT 10\". Pe un stream continuu de date mari, o astfel de interogare pe disc nu poate rula in timp real.",
    keyTakeaway: "Problema Top-K se rezolva prin agregare in streaming, structuri probabilistice (Count-Min Sketch) si un Min-Heap de dimensiune K in memorie."
  },
  {
    id: "sys-63",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design News Feed: Fan-out-on-Write vs Fan-out-on-Read",
    question: "Care este diferenta dintre modelul Push (Fan-out-on-Write) si modelul Pull (Fan-out-on-Read) la un sistem de Feed (Twitter/Facebook)?",
    answer: "Cele doua abordari fundamentale pentru generarea feed-ului de noutati:\n\n1. Fan-out-on-Write (Modelul PUSH):\n   - Cand un utilizator posteaza o noutate, un worker ia lista tuturor urmaritorilor sai si SCRIE imediat acel ID de postare in Feed-ul (inbox-ul din Redis) al fiecarui urmaritor!\n   - Avantaj: CITIREA feed-ului este instantanee (`O(1)` - utilizatorul doar citeste lista gata preparata din Redis).\n   - Dezavantaj: Daca utilizatorul are 50 de milioane de urmaritori (ex: o celebritate), o singura postare necesita 50 de milioane de scrieri in memorie, blocand cozile!\n\n2. Fan-out-on-Read (Modelul PULL):\n   - Cand un utilizator posteaza, noutatea se salveaza doar in tabela lui personala de postari.\n   - Cand un urmaritor isi deschide aplicatia, feed-ul este compus pe loc (PULL): se iau toti cei 200 de oameni pe care ii urmareste, se citesc cele mai recente postari ale lor si se unesc/sorteaza cronologic.\n   - Avantaj: Scrieri instantanee.\n   - Dezavantaj: Citirea este lenta si scumpa.",
    codeSnippet: `Push (Fan-out-on-Write):
User posteaza -> Worker -> Scrie in Redis Feed User A
                        -> Scrie in Redis Feed User B
                        -> Scrie in Redis Feed User C

Pull (Fan-out-on-Read):
User deschide app -> Query: Citeste si uneste postarile celor 100 de prieteni`,
    interviewTrap: "Niciunul dintre aceste modele pure nu rezista la scara mare! Twitter foloseste un model HIBRID (vezi intrebarea urmatoare).",
    keyTakeaway: "Push pre-calculeaza feed-ul la scriere (citire rapida, scriere scumpa); Pull calculeaza feed-ul la cerere (scriere ieftina, citire lenta)."
  },
  {
    id: "sys-64",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "News Feed: Problema Celebritatilor (\"Celebrity Problem\") si Modelul Hibrid",
    question: "Cum rezolva marile retele sociale (Twitter / X) \"Problema Celebritatilor\" in livrarea feed-ului?",
    answer: "1. \"The Celebrity / Hotkey Problem\":\n   - Daca un cont cu 100 de milioane de urmaritori (ex: Elon Musk) publica un tweet folosind Fan-out-on-Write pur:\n   - Sistemul trebuie sa scrie acelasi tweet in 100.000.000 de casute de feed in Redis.\n   - Acest proces dureaza cateva minute, iar serverele de background sunt saturate complet.\n\n2. Solutia: Arhitectura HIBRIDA PUSH + PULL:\n   - Pentru 99.9% din utilizatorii obisnuiti (care au sub 5.000 de urmaritori): se foloseste FAN-OUT-ON-WRITE (Push) in Redis. Este ieftin si face ca citirea feed-ului sa fie instantanee.\n   - Pentru CELEBRITATI (utilizatori cu peste 100.000 de urmaritori): NU se mai face Push in feed-ul nimanui!\n   - Cand un utilizator deschide aplicatia:\n     1. Ia feed-ul sau pre-calculat din Redis (care contine postarile prietenilor obisnuiti).\n     2. Face un Pull rapid doar pentru postarile recente ale celebritatilor pe care le urmareste.\n     3. Uneste cele doua liste in memorie in doar cateva milisecunde!\n   - Rezultat: Zero risipa de scrieri si latenta infima la citire.",
    codeSnippet: `// Model Hibrid in Backend:
List<Post> feedPrieteni = redis.getFeed(userId); // Push pre-calculat
List<Post> feedCelebritati = celebrityService.getRecentPostsForFollowed(userId); // Pull dinamic

List<Post> feedFinal = mergeSortDescByTimestamp(feedPrieteni, feedCelebritati);`,
    interviewTrap: "Daca la interviu spui ca folosesti doar Push sau doar Pull, vei primi imediat contra-intrebarea: \"Ce faci cand posteaza o celebritate?\". Mentionarea modelului hibrid demonstreaza gandire matura de nivel Mid/Senior.",
    keyTakeaway: "Foloseste Push pentru utilizatorii obisnuiti si Pull dinamic pentru celebritati, unind rezultatele in memoria clientului."
  },
  {
    id: "sys-65",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Design Sistem de Rezervari: Locuri de Zbor / Camere de Hotel",
    question: "Cum gestionezi rezervarea unui loc de avion sau camera de hotel pe durata procesului de plata (Hold cu expirare)?",
    answer: "La rezervari de zboruri sau camere de hotel, clientul are nevoie de 10-15 minute pentru a introduce datele cardului fara ca altcineva sa-i fure locul.\n\nMasina de Stari (State Machine) si Caching:\n1. Starile unei Rezervari:\n   - `LIBER` -> `BLOCAT_TEMPORAR` (Hold) -> `CONFIRMAT` (Platit) sau `EXPIRAT` (Returnat la liber).\n\n2. Implementare cu Redis TTL & Locks:\n   - Cand utilizatorul selecteaza camera 101, backend-ul incearca sa puna un lacat atomic in Redis cu TTL de 15 minute: `SET lock:camera:101 user_id NX EX 900`.\n   - Daca `SETNX` reuseste: camera trece in status `BLOCAT_TEMPORAR`, iar utilizatorul este trimis pe pagina de checkout.\n   - Daca alt utilizator incearca simultan sa rezerve aceeasi camera, `SETNX` esueaza si primeste mesajul \"Camera este in curs de rezervare de catre altcineva\".\n\n3. Ce se intampla dupa 15 minute:\n   - Daca plata nu este confirmata, cheia din Redis EXPIRA AUTOMAT (sau un mesaj din coada de delayed jobs ruleaza), iar camera revine instantaneu la status `LIBER`.\n   - Daca plata reuseste, se executa tranzactia finala in PostgreSQL si camera trece in `CONFIRMAT`.",
    codeSnippet: `// Blocare temporara pe 15 minute in Redis:
Boolean locked = redis.setIfAbsent("room:101:hold", userId, Duration.ofMinutes(15));
if (!Boolean.TRUE.equals(locked)) {
    throw new RoomUnavailableException("Camera este deja selectata de alt client.");
}
// Trimite un event intarziat in coada pentru eliberare automata daca nu se plateste
delayedQueue.send("expire_hold_room:101", Duration.ofMinutes(15));`,
    interviewTrap: "Nu tine conexiuni deschise pe baza de date sau tranzactii lungi de 15 minute in SQL! Blocajele tranzactionale din SQL trebuie sa dureze milisecunde; rezervarea temporara de 15 minute se tine exclusiv in Redis.",
    keyTakeaway: "Foloseste blocarea temporara in Redis cu TTL (Hold) pentru rezervari in curs de plata si tranzactii scurte SQL doar la finalizarea platii."
  },
  {
    id: "sys-66",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Scalarea Citirilor vs Scalarea Scrierilor: Tehnici Distincte",
    question: "De ce este scalarea scrierilor mult mai dificila decat scalarea citirilor si ce solutii specifice exista pentru fiecare?",
    answer: "1. Scalarea Citirilor (Read Scaling - Relativ Simpla):\n   - Datele nu se modifica, deci pot fi duplicate nelimitat!\n   - Tehnici:\n     - Caching agresiv la nivel de Browser, CDN, Nginx si Redis.\n     - Adaugarea de Read Replicas (adaugam 5 servere secundare de PostgreSQL doar pentru SELECT-uri).\n     - Denormalizare pentru a reduce JOIN-urile costisitoare.\n\n2. Scalarea Scrierilor (Write Scaling - Complexa):\n   - Fiecare scriere trebuie sa modifice starea unica adevarata (System of Record) si sa mentina constrangerile de consistenta si unicitate.\n   - Nu poti pune CDN in fata unui `UPDATE`!\n   - Tehnici:\n     - Sharding (partitionare orizontala): impartirea datelor pe noduri diferite.\n     - Buffer asincron prin Cozi de Mesaje (Kafka / RabbitMQ): transformarea scrierilor sincrone in procesari asincrone in loturi.\n     - Baze NoSQL Append-Only (LSM Trees in Cassandra/RocksDB) optimizate special pentru scrieri rapide in memorie si pe disc.",
    codeSnippet: `Citiri:  Client -> CDN -> Redis -> Read Replicas (Scaleaza 100x usor)
Scrieri: Client -> API -> Message Queue -> Sharded DB Master (Necesita coordonare)`,
    interviewTrap: "Daca o aplicatie are 95% citiri si doar 5% scrieri, nu propune Sharding de baza de date la interviu! Un simplu strat de Redis si 2 replici de citire rezolva 99% din problemele de performanta.",
    keyTakeaway: "Citirile se scaleaza usor prin replicare si caching; scrierile necesita sharding, optimizari de I/O append-only si cozi de procesare asincrona."
  },
  {
    id: "sys-67",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Nivelurile de Caching intr-o Arhitectura Web Completa",
    question: "Care sunt cele 5 straturi de Caching dintr-o aplicatie web moderna de la browser pana la disc?",
    answer: "Cele 5 niveluri esentiale de memorare in cache:\n\n1. Browser Cache:\n   - Fisiere statice (imagini, fonturi, bundle-uri JS) salvate direct pe discul dispozitivului utilizatorului (controlat prin antetul `Cache-Control`).\n\n2. CDN Cache (Edge Caching):\n   - Serverele Cloudflare / CloudFront situate aproape geografic de utilizator, servind continut static si pagini randate in 5ms.\n\n3. Reverse Proxy Cache (Nginx / Varnish):\n   - Asezat in fata clusterului backend; poate retine raspunsuri HTML sau JSON intregi pentru cereri repetate comune.\n\n4. Application Cache (In-Memory / Redis / Memcached):\n   - Cache la nivel de cod de backend: obiecte Java, rezultate de calcule complexe, sesiuni de utilizator.\n\n5. Database Buffer Pool (Shared Buffers in Postgres / InnoDB Buffer Pool):\n   - Baza de date pastreaza paginile de disc cele mai citite direct in memoria RAM a serverului SQL, evitand citirile fizice lente de pe SSD.",
    codeSnippet: `Browser -> CDN (Edge) -> Nginx (Proxy) -> Redis (App) -> Buffer Pool (DB RAM) -> Disc SSD`,
    interviewTrap: "Cu cat datele sunt memorate mai aproape de utilizator (Browser/CDN), cu atat invalidarea lor devine mai grea. Invers, cache-ul din DB se invalideaza automat dar adauga latenta de retea.",
    keyTakeaway: "Arhitectura moderna foloseste caching multi-strat: de la browser si CDN, la Nginx, Redis si pana la buffer pool-ul intern al bazei de date."
  },
  {
    id: "sys-68",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Header-uri HTTP de Caching: Cache-Control, ETag si 304 Not Modified",
    question: "Cum functioneaza antetele ETag si Cache-Control pentru revalidarea conditionata a resurselor?",
    answer: "1. Antetul `Cache-Control`:\n   - `max-age=3600`: Browserul sau CDN-ul poate folosi copia locala timp de 1 ora fara sa mai intrebe deloc serverul!\n   - `no-cache`: Browserul poate pastra copia in cache, dar TREBUIE sa intrebe serverul la fiecare accesare daca resursa s-a schimbat.\n   - `no-store`: Resursa este confidentiala (ex: date bancare) si este STRICT INTERZISA salvarea ei pe orice disc sau cache.\n\n2. Ce este un ETag (Entity Tag) si Revalidarea 304:\n   - Serverul calculeaza o amprenta hash a continutului resursei (ex: `ETag: \"68ab9-34b\"`) si o trimite la client.\n   - La urmatoarea cerere, clientul trimite header-ul: `If-None-Match: \"68ab9-34b\"`.\n   - Serverul compara noul hash cu cel primit:\n     - Daca resursa NU s-a modificat: Serverul raspunde cu `HTTP 304 Not Modified` FARA CORP (0 octeti de date payload)!\n     - Browserul refoloseste copia din cache, economisind 99% din latimea de banda.",
    codeSnippet: `// Raspuns initial de la server:
HTTP/1.1 200 OK
ETag: "abc123hash"
Cache-Control: no-cache

// Cererea urmatoare a browserului:
GET /api/profile
If-None-Match: "abc123hash"

// Raspuns server daca profilul nu s-a schimbat:
HTTP/1.1 304 Not Modified
(Corp gol)`,
    interviewTrap: "Diferenta `no-cache` vs `no-store`: `no-cache` inseamna \"fa revalidare cu ETag inainte de folosire\", in timp ce `no-store` inseamna \"nu salva absolut nimic niciodata\". Multi le confunda!",
    keyTakeaway: "ETag permite revalidarea conditionata (HTTP 304) fara re-descarcarea datelor neschimbate, iar Cache-Control dicteaza timpul de valabilitate."
  },
  {
    id: "sys-69",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "SSL/TLS Termination la Load Balancer",
    question: "Ce este SSL/TLS Termination si care sunt beneficiile si riscurile acestei abordari?",
    answer: "1. Ce este SSL/TLS Termination (Offloading):\n   - Traficul dintre utilizator (Internet) si Load Balancer este complet criptat prin HTTPS (port 443).\n   - Load Balancer-ul (ex: Nginx, AWS ALB, Cloudflare) decripteaza pachetele TLS folosind certificatul SSL.\n   - Traficul intern dintre Load Balancer si serverele backend Spring Boot se desfasoara necriptat prin HTTP simplu (port 8080) in interiorul unei retele private securizate (VPC).\n\n2. Beneficii:\n   - Degrevare masiva de CPU (Offloading): Calculele matematice grele de criptare/decriptare asimetrica TLS sunt preluate de load balancer (sau cipuri hardware specializate), lasand 100% din CPU-ul backend-ului pentru logica de afaceri.\n   - Management centralizat al certificatelor: Reinnoiesti certificatul SSL intr-un singur loc (pe balancer), nu pe 50 de microservicii!\n   - Permite inspectia pachetelor Layer 7 (WAF, inspectie malware, rutare dupa path).\n\n3. Riscuri:\n   - Daca un atacator patrunde in reteaua interna privata (VPC), traficul intern necriptat poate fi interceptat (Zero Trust architecture cere criptare end-to-end mTLS in medii bancare).",
    codeSnippet: `Internet (HTTPS 443 Criptat)
          |
   [ Load Balancer ] -> Decripteaza TLS cu certificatul SSL
          |
   VPC Retea Privata Interna (HTTP 8080 Necriptat, Rapid)
          |-------------------|
      Backend 1           Backend 2`,
    interviewTrap: "Daca reteaua interna nu este securizata sau este partajata intre echipe diferite, transmiterea de parole sau date bancare in clar prin HTTP simplu este o incalcare a standardelor de conformitate PCI-DSS.",
    keyTakeaway: "SSL Termination decripteaza traficul pe Load Balancer pentru a economisi CPU pe backend si a simplifica reinnoirea certificatelor."
  },
  {
    id: "sys-70",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Securitate in Retele Distribuite: DMZ si Subneturi Private",
    question: "De ce o baza de date nu trebuie sa aiba NICIODATA o adresa IP publica si cum se structureaza subneturile?",
    answer: "Regula de fier a securitatii de infrastructura cloud (AWS VPC / Azure VNet):\n\n1. Subnet Public (DMZ - Demilitarized Zone):\n   - Are acces direct la Internet Gateway.\n   - Aici se amplaseaza EXCLUSIV: Load Balancerele, Bastion Host (Jump Server) si API Gateways.\n   - Doar porturile standard 80 si 443 sunt deschise catre lume.\n\n2. Subnet Privat (Application Tier):\n   - Nu are IP-uri publice; serverele backend (Spring Boot) nu pot fi accesate direct de pe internet.\n   - Primeste trafic doar de la Load Balancer-ul din Subnetul Public.\n\n3. Subnet Privat Izolat (Database Tier):\n   - Niciun IP public si nicio ruta directa catre Internet!\n   - Baza de date PostgreSQL accepta conexiuni pe portul 5432 DOAR de la adresele IP specifice ale serverelor backend din Subnetul Privat.\n   - Rezultat: Chiar daca un hacker descopera parola bazei de date, el nu se poate conecta fizic din exterior pentru ca ruta de retea nu exista!",
    codeSnippet: `Internet
   |
[ Subnet Public (DMZ) ]   -> Load Balancer (IP Public: 54.21.0.4)
   |
[ Subnet Privat App ]     -> Backend Spring Boot (IP Privat: 10.0.1.5)
   |
[ Subnet Privat DB ]      -> PostgreSQL (IP Privat: 10.0.2.10 - Fara acces Internet)`,
    interviewTrap: "Multi dezvoltatori juniori bifeaza \"Publicly Accessible = True\" cand creeaza o baza RDS in AWS pentru ca vor sa se conecteze usor din DBeaver de acasa. Aceasta este o bresa catastrofala de securitate! Conectarea sigura se face prin SSH Tunneling peste un Bastion Host.",
    keyTakeaway: "Separarea in subneturi publice (load balancer) si private izolate (backend si DB) asigura ca baza de date este complet invizibila pe internet."
  },
  {
    id: "sys-71",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Zero-Downtime Deployment: Blue-Green vs Rolling vs Canary",
    question: "Care sunt diferentele intre Blue-Green Deployment, Rolling Deployment si Canary Releases?",
    answer: "Trei strategii pentru livrarea de versiuni noi fara a intrerupe functionarea aplicatiei:\n\n1. Blue-Green Deployment:\n   - Exista doua medii identice: mediul BLUE (versiunea veche, curenta) si mediul GREEN (versiunea noua v2).\n   - Noua versiune este testata complet in GREEN.\n   - Cand totul este verificat, Load Balancer-ul comuta instant 100% din trafic de la Blue la Green.\n   - Avantaj: Rollback instantaneu (doar comuti balancerul inapoi daca apar erori).\n   - Dezavantaj: Cost dublu de infrastructura pe perioada deploy-ului.\n\n2. Rolling Deployment (Standard Kubernetes):\n   - Inlocuieste pod-urile vechi unul cate unul: opreste 1 pod v1, porneste 1 pod v2, asteapta readiness probe, apoi trece la urmatorul.\n   - Avantaj: Fara cost dublu de servere.\n   - Dezavantaj: Pe durata deploy-ului, ambele versiuni (v1 si v2) ruleaza simultan.\n\n3. Canary Release:\n   - Trimite versiunea noua doar catre un procent minuscul de utilizatori reali (ex: 2% din trafic sau doar angajatii interni).\n   - Se monitorizeaza rata de erori si performanta. Daca totul e stabil, procentul creste treptat: 10% -> 50% -> 100%.",
    codeSnippet: `Blue-Green:   100% Trafic -> [ Blue v1 ] ===> Comutare instant: 100% -> [ Green v2 ]
Rolling:      [ v1 ] [ v1 ] [ v2 ] -> [ v1 ] [ v2 ] [ v2 ] -> [ v2 ] [ v2 ] [ v2 ]
Canary:       98% Trafic -> [ v1 Stabil ] | 2% Trafic -> [ v2 Nou (Canary Test) ]`,
    interviewTrap: "La Blue-Green si Rolling deployment, schema bazei de date TREBUIE sa fie compatibila cu ambele versiuni simultan! Nu poti sterge o coloana din DB inainte ca toata versiunea veche sa fie oprita.",
    keyTakeaway: "Blue-Green comuta instant intre medii dublate; Rolling actualizeaza treptat instantele; Canary testeaza versiunea pe un procentaj mic de utilizatori."
  },
  {
    id: "sys-72",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Migrari de Baza de Date Fara Downtime: Expand and Contract Pattern",
    question: "Cum redenumesti o coloana dintr-o tabela mare de productie fara downtime folosind tiparul Expand and Contract?",
    answer: "Daca rulezi `ALTER TABLE users RENAME COLUMN email TO contact_email;` pe productie, versiunea curenta a codului va arunca erori masive de tip `Column not found` inainte ca noua versiune sa porneasca.\n\nTiparul Expand and Contract (sau Parallel Run):\n\n1. Pasul 1 (Expand - Expansiune):\n   - Adauga coloana NOUA in schema (`ALTER TABLE users ADD COLUMN contact_email VARCHAR(255);`).\n   - Nu sterge vechea coloana!\n\n2. Pasul 2 (Scriere Dubla - Dual Write):\n   - Deploy la o versiune de cod intermediara care SCRIE in ambele coloane (`email` si `contact_email`), dar continua sa citeasca din cea veche.\n   - Ruleaza un script de backfill in fundal care copiaza datele istorice din coloana veche in cea noua.\n\n3. Pasul 3 (Comutare Citiri):\n   - Deploy la o noua versiune de cod care citeste si scrie exclusiv din noua coloana (`contact_email`).\n\n4. Pasul 4 (Contract - Contractie & Curatare):\n   - Dupa cateva zile de stabilitate, sterge vechea coloana neatinsa: `ALTER TABLE users DROP COLUMN email;`.",
    codeSnippet: `Faza 1 (Expand):    DB are [email] si [contact_email]
Faza 2 (Dual Write): Codul scrie in ambele, citeste din vechi
Faza 3 (Read New):   Codul foloseste doar [contact_email]
Faza 4 (Contract):   DROP COLUMN email`,
    interviewTrap: "Nu rula niciodata scripturi masive de backfill (`UPDATE users SET contact_email = email`) pe toata tabela de 10 milioane de randuri intr-o singura tranzactie! Va bloca tabela. Ruleaza update-ul in batch-uri mici de cate 5.000 de randuri.",
    keyTakeaway: "Expand and Contract introduce campuri noi in paralel cu cele vechi, mentine compatibilitatea backward la deploy si curata structurile vechi la final."
  },
  {
    id: "sys-73",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Soft Delete vs Hard Delete in Sisteme Scalabile",
    question: "Care sunt avantajele si capcanele ascunse ale Soft Delete (`is_deleted = true`) la scara mare?",
    answer: "1. Soft Delete (Stergere Logica):\n   - In loc de comanda SQL `DELETE`, se seteaza un flag: `UPDATE comenzi SET is_deleted = TRUE, deleted_at = NOW() WHERE id = 42;`.\n   - Avantaje: Recuperare instantanee in caz de greseala a utilizatorului, trasabilitate si audit.\n\n2. Capcanele majore la scara mare:\n   - Poluarea indecsilor: Tabela pastreaza milioane de randuri moarte, marind dimensiunea indecsilor B-Tree si a memoriei RAM necesare.\n   - Complicarea constrangerilor UNIQUE: Daca ai `UNIQUE(email)`, un utilizator sters cu `is_deleted = true` va bloca re-inregistrarea unui utilizator nou cu acelasi email!\n   - Fiecare interogare din aplicatie TREBUIE sa includa `WHERE is_deleted = FALSE` (daca uiti la un singur query, afisezi date sterse).\n\n3. Reglementari GDPR:\n   - Conform GDPR (\"Dreptul de a fi uitat\"), un Soft Delete NU este o stergere legala! Datele personale trebuie anonimizate sau sterse fizic (Hard Delete).",
    codeSnippet: `-- Rezolvarea unicitatii cu index partial in PostgreSQL:
CREATE UNIQUE INDEX idx_user_email_activ 
ON utilizatori (email) 
WHERE is_deleted = FALSE;
-- Permite utilizatori noi cu acelasi email daca cei vechi sunt stersi!`,
    interviewTrap: "Daca ai nevoie de istoric pentru audit dar vrei o baza curata si rapida, o solutie superioara este sa faci Hard Delete pe tabela activa si sa muti randul sters intr-o tabela separata de arhiva (`comenzi_istoric_audit`).",
    keyTakeaway: "Soft Delete permite recuperarea datelor dar umfla indecsii si complica unicitatea; foloseste indecsi partiali sau tabele dedicate de arhivare."
  },
  {
    id: "sys-74",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "OAuth 2.0 si OpenID Connect (OIDC) pe Intelesul Tuturor",
    question: "Care este diferenta intre OAuth 2.0 si OpenID Connect (OIDC) si care sunt cele 4 roluri fundamentale?",
    answer: "Diferenta esentiala:\n- OAuth 2.0 este un protocol de AUTORIZARE (permisiuni: \"ce are voie aplicatia sa faca in numele meu?\").\n- OpenID Connect (OIDC) este un strat construit deasupra OAuth 2.0 pentru AUTENTIFICARE (identitate: \"cine este utilizatorul?\").\n\nCele 4 roluri in fluxul Authorization Code Grant (ex: \"Logheaza-te cu Google\"):\n1. Resource Owner (Utilizatorul):\n   - Persoana care detine contul Google si doreste sa intre in aplicatie.\n2. Client (Aplicatia ta web / mobila):\n   - Aplicatia Job Tracker care cere acces la profilul utilizatorului.\n3. Authorization Server (Serverul Google OAuth):\n   - Autentifica utilizatorul, cere consimtamantul (\"Permiti aplicatiei accesul la email?\") si emite token-urile.\n4. Resource Server (API-ul Google):\n   - Serverul care pastreaza datele protejate (Google Contacts / Gmail API) si raspunde pe baza Access Token-ului primit.",
    codeSnippet: `Utilizator -> Click "Logheaza-te cu Google"
Client     -> Redirect catre Google Auth Server
Google     -> Utilizatorul introduce parola si aproba
Google     -> Redirect inapoi catre Client cu un \`code\` temporar
Client     -> Schimba codul pe un ID Token (OIDC) si un Access Token (OAuth 2.0)`,
    interviewTrap: "Nu folosi un simplu Access Token OAuth 2.0 pentru autentificare! Un Access Token nu contine informatii de identitate garantate; pentru a sti cine s-a logat, se foloseste `id_token`-ul (JWT) oferit de OpenID Connect.",
    keyTakeaway: "OAuth 2.0 se ocupa de autorizare si drepturi (Access Token); OpenID Connect se ocupa de identitate si autentificare (ID Token)."
  },
  {
    id: "sys-75",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "JWT in Microservicii: Avantaje si Revocare (Token Revocation)",
    question: "Cum scaleaza token-urile JWT intr-o arhitectura distribuita si cum gestionezi revocarea imediata a unui token compromis?",
    answer: "1. De ce scaleaza JWT excelent (Stateless):\n   - Token-ul JWT este semnat criptografic (HMAC SHA-256 sau RSA) de catre serverul de autentificare.\n   - Fiecare microserviciu poate valida semnatura folosind cheia publica FARA a face vreun apel de retea sau interogare la baza de date!\n\n2. Marea problema a JWT-ului: Cum il revoci inainte de expirare?\n   - Fiind complet stateless, daca un utilizator este concediat, isi schimba parola sau token-ul este furat de un hacker, token-ul ramane valid pana la data de expirare (`exp`)!\n\n3. Solutia Practica in Productie:\n   a) Durata scurta de viata pentru Access Token:\n      - Access Token-ul expira rapid (ex: 15 minute).\n      - Se foloseste un Refresh Token cu durata lunga (7 zile), salvat in baza de date/Redis, folosit pentru a obtine access token-uri noi.\n   b) Blacklist distribuit in Redis (pentru Logout):\n      - Cand utilizatorul da Logout, ID-ul token-ului (`jti` - JWT ID) este salvat in Redis cu un TTL egal cu timpul ramas pana la expirare.\n      - API Gateway verifica rapid in Redis daca `jti` este pe lista neagra.",
    codeSnippet: `// Structura JWT (3 parti despartite prin punct):
// [Header Base64] . [Payload Claims Base64] . [Semnatura Criptografica]

// Verificare Blacklist rapid la API Gateway:
if (redis.hasKey("blacklist:" + jwt.getClaim("jti"))) {
    return HTTP_401_UNAUTHORIZED;
}`,
    interviewTrap: "Daca la fiecare request verifici tot JWT-ul in baza de date SQL, ai anulat complet principalul avantaj al JWT-ului (faptul ca este stateless)! Verificarea de revocare se face doar la nivel de API Gateway in Redis.",
    keyTakeaway: "JWT asigura validare rapida stateless in microservicii; foloseste durate scurte (15 min) si liste negre in Redis pentru revocare la delogare."
  },
  {
    id: "sys-76",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Content Ingestion Pipeline: Procesarea Fisierelor CSV Masive",
    question: "Cum proiectezi un sistem care sa proceseze un fisier CSV de 10GB primit de la un client fara a bloca memoria RAM?",
    answer: "Daca incerci sa incarci tot fisierul in memorie cu `Files.readAllLines()` sau biblioteci naive de parsare, vei primi instant `OutOfMemoryError`.\n\nArhitectura unui Pipeline Scalabil de Ingestie:\n\n1. Upload Asincron:\n   - Fisierul este incarcat direct in Cloud Storage (S3 / Blob Storage) folosind un Pre-signed URL.\n\n2. Chunking / Impartire in Bucati:\n   - Un proces usor citeste fisierul linie cu linie prin Streaming (folosind `BufferedReader` cu consum constant de cativa KB de RAM).\n   - Imparte fisierul in bucati independente de cate 10.000 de randuri (chunks).\n\n3. Procesare Paralela cu Cozi:\n   - Fiecare bucata este trimisa ca un mesaj intr-o coada RabbitMQ sau Kafka.\n   - 20 de instante paralele de Background Workers preiau bucatile si insereaza datele in baza de date prin operatii de `BATCH INSERT`.\n\n4. Monitorizare si Progres:\n   - Starea fiecarei bucati este urmarita intr-o tabela de joburi; cand toate bucatile sunt gata, jobul este marcat `COMPLETED`.",
    codeSnippet: `// Citire eficienta prin Streaming cu memorie O(1):
try (BufferedReader br = new BufferedReader(new FileReader("masiv_10gb.csv"))) {
    String line;
    List<String> batch = new ArrayList<>(10000);
    while ((line = br.readLine()) != null) {
        batch.add(line);
        if (batch.size() >= 10000) {
            queue.send(new CsvBatchEvent(batch)); // Trimite la workers
            batch.clear();
        }
    }
}`,
    interviewTrap: "Nu face `INSERT INTO ...` rand cu rand pentru milioane de inregistrari! Inserarea trebuie facuta obligatoriu prin batch inserts (`COPY` in PostgreSQL sau multi-row insert) pentru performanta de 100x mai mare.",
    keyTakeaway: "Fisierele mari se proceseaza prin streaming linie cu linie, impartire in bucati (chunking) si trimitere catre workeri paraleli cu batch inserts."
  },
  {
    id: "sys-77",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Single Point of Failure (SPOF): Identificare si Eliminare",
    question: "Ce este un SPOF (Single Point of Failure) si cum elimini SPOF-urile dintr-o arhitectura web clasica?",
    answer: "1. Ce este un SPOF:\n   - O componenta singulara a unui sistem care, daca pica sau se opreste, duce la oprirea COMPLETA a intregului sistem.\n\n2. Exemple tipice de SPOF si cum le eliminam prin REDUNDANTA:\n   - Un singur Load Balancer Nginx: Daca pica serverul Nginx, tot site-ul e mort.\n     - Solutie: 2 Load Balancere configurate in mod Active-Passive cu IP flotant virtual (Keepalived / VRRP) sau AWS ALB redundant automat.\n   - O singura instanta de backend: Daca JVM-ul ia crash, aplicatia e oprita.\n     - Solutie: Cel putin 2-3 instante backend in spatele balancer-ului.\n   - O singura baza de date PostgreSQL: Daca pica discul, datele sunt indisponibile.\n     - Solutie: Primary-Standby cu failover automat (ex: Patroni, AWS RDS Multi-AZ).\n   - O singura zona geografica / Datacenter: O pana generala de curent opreste tot.\n     - Solutie: Multi-AZ (Multiple Availability Zones) sau Multi-Region deployment.",
    codeSnippet: `Arhitectura fara SPOF:
DNS (Anycast)
   |
[ Load Balancer 1 ] <---> [ Load Balancer 2 (Standby) ]
   |---------------------------|
   |                           |
[ App Node 1 ]            [ App Node 2 ]
   |                           |
[ Primary DB ] ---------> [ Standby Replica (Auto-Failover) ]`,
    interviewTrap: "Redundanta nu inseamna doar hardware! Daca toate serverele tale depind de un singur script nesigur sau de o singura cheie API externa fara timeout, acel API extern devine noul tau SPOF logic.",
    keyTakeaway: "Un SPOF este o veriga slaba a carei cadere doboara intreg sistemul; se elimina prin redundanta la fiecare nivel (retea, aplicatie, date)."
  },
  {
    id: "sys-78",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "High Availability (HA): Active-Passive vs Active-Active",
    question: "Care este diferenta intre o configuratie Active-Passive si una Active-Active?",
    answer: "Doua modele de asigurare a Disponibilitatii Ridicate (High Availability):\n\n1. Active-Passive (Master-Standby / Failover):\n   - Nodul Activ preia 100% din trafic in mod normal.\n   - Nodul Pasiv sta in asteptare (Standby), sincronizandu-si starea continuu cu nodul activ, dar fara a primi trafic de la utilizatori.\n   - Daca nodul Activ pica (heartbeat timeout), sistemul de monitorizare initiaza FAILOVER: nodul pasiv este promovat la rolul activ si preia traficul.\n   - Avantaj: Fara conflicte de scriere concurenta, simplitate.\n   - Dezavantaj: Resurse hardware platite care stau degeaba 99% din timp, plus o mica pauza de downtime in secunda failover-ului.\n\n2. Active-Active:\n   - Toate nodurile primesc si proceseaza trafic activ simultan!\n   - Daca oricare nod pica, celelalte preiau automat diferenta de incarcare.\n   - Avantaj: Utilizare 100% a resurselor si capacitate dubla de procesare.\n   - Provocare: Gestionarea scrierilor concurente pe noduri diferite (necesita baze de date multi-master sau rutare geografica inteligenta).",
    codeSnippet: `Active-Passive:
Client -> [ Nod Activ (100% Trafic) ]
                   | (Replicare)
          [ Nod Pasiv (0% Trafic - Asteapta) ]

Active-Active:
Client -> [ Load Balancer ]
             |          |
      [ Nod 1 (50%) ] [ Nod 2 (50%) ]`,
    interviewTrap: "Active-Active pe baze de date relationale traditionale (Postgres/MySQL) este extrem de periculos din cauza conflictelor de scriere (\"split-brain\"). Active-Active este usor pentru backend-uri stateless, dar greu pentru baze de date.",
    keyTakeaway: "Active-Passive tine un server de rezerva gata de failover; Active-Active foloseste toate serverele simultan pentru capacitate maxima."
  },
  {
    id: "sys-79",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Disaster Recovery: RPO vs RTO pe Intelesul Tuturor",
    question: "Ce inseamna RPO (Recovery Point Objective) si RTO (Recovery Time Objective) intr-un plan de Disaster Recovery?",
    answer: "Cei doi indicatori cheie de masurare a recuperarii in caz de dezastru (cutremur, atac cibernetic, stergere accidentala):\n\n1. RPO (Recovery Point Objective - CAT DE MULTE DATE ACCEPTI SA PIERZI?):\n   - Se masoara in UNITATI DE TIMP inapoi fata de momentul dezastrului.\n   - Daca faci backup pe baza de date o data la 24 de ore (la miezul noptii) si serverul explodeaza la ora 23:00, ai pierdut 23 de ore de date!\n     - RPO = 24 de ore.\n   - Intr-un sistem bancar, RPO trebuie sa fie aproape 0 (prin replicare sincrona a fiecarui log WAL).\n\n2. RTO (Recovery Time Objective - CAT TIMP DUREAZA PANA REPOLESTI SISTEMUL?):\n   - Timpul maxim admisibil in care aplicatia poate fi oprita (downtime) pana cand este repusa complet in functiune.\n   - Daca dupa explozia serverului echipa are nevoie de 4 ore pentru a cumpara alt server, a restaura backup-ul si a schimba DNS-ul:\n     - RTO = 4 ore.\n   - La un sistem cu High Availability si failover automat, RTO este de doar cateva secunde.",
    codeSnippet: `Dezastru la Ora 12:00
| <--- Pierdere Date (RPO: ex. 15 min) ---> | <--- Timp de Restituire (RTO: ex. 30 min) ---> |
Ultimul Backup Valid (11:45)                 Sistemul revine ONLINE (12:30)`,
    interviewTrap: "Un RPO = 0 si RTO = 0 inseamna Active-Active Multi-Region cu replicare sincrona, ceea ce costa milioane de dolari si adauga latenta de retea. Stabilirea valorilor RPO/RTO este intotdeauna o decizie de buget de afaceri.",
    keyTakeaway: "RPO masoara volumul de date pierdute (timpul de la ultimul backup); RTO masoara durata de downtime pana la revenirea sistemului online."
  },
  {
    id: "sys-80",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Cautare dupa Proximitate Geografica: Geohash si PostGIS",
    question: "Cum gasesti rapid \"cei mai apropiati 10 soferi Uber\" sau \"restaurantele pe o raza de 5km\" fara a calcula distante trigonometrice pe milioane de randuri?",
    answer: "1. De ce esueaza formula matematica clasica (Haversine Formula) in SQL:\n   - `SELECT * FROM soferi WHERE sqrt((lat - x)^2 + (lng - y)^2) < 5`:\n   - Pentru ca aplica o formula matematica pe fiecare rand, baza de date trebuie sa scaneze TOATA tabela (Sequential Scan)! Nu poate folosi indecsi B-Tree 1D obisnuiti pe 2 coordonate simultan.\n\n2. Solutia 1: GEOHASH (Conversie 2D -> 1D):\n   - Imparte harta Pamantului intr-o grila ierarhica de patrate.\n   - Fiecare patrat primeste un sir scurt de caractere (ex: `u80q9` reprezinta o zona din Bucuresti).\n   - Doua puncte aflate in aceeasi zona au acelasi PREFIX de geohash!\n   - Permite cautarea folosind un simplu index B-Tree: `WHERE geohash LIKE \\'u80q9%\\'`!\n\n3. Solutia 2: Indecsi Spatiali R-Tree (PostGIS in PostgreSQL):\n   - PostGIS ofera indecsi spatiali R-Tree (GIST index) care organizeaza cutii de incadrare (Bounding Boxes) ierarhice, gasind punctele vecine in `O(log N)`.",
    codeSnippet: `-- Cautare instantanee cu index GIST in PostgreSQL (PostGIS):
CREATE INDEX idx_soferi_locatie ON soferi USING GIST (locatie_geom);

-- Gaseste cele mai apropiate 10 masini active:
SELECT id, nume 
FROM soferi 
WHERE activ = TRUE 
ORDER BY locatie_geom <-> ST_SetSRID(ST_MakePoint(26.10, 44.43), 4326) 
LIMIT 10;`,
    interviewTrap: "Geohash are o problema la marginea patratelor (Border Problem): doua persoane pot fi la 5 metri distanta dar separate de granita a doua patrate de geohash diferite. De aceea, la cautare se interogheaza intotdeauna patratul curent + cele 8 patrate vecine.",
    keyTakeaway: "Geohash transforma coordonatele 2D intr-un prefix 1D usor de indexat, iar PostGIS foloseste indecsi R-Tree (GIST) pentru calcule spatiale fulgeratoare."
  },
  {
    id: "sys-81",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Versionarea API-urilor: URI Path vs Custom Headers",
    question: "Care sunt principalele metode de versionare a unui API REST si care este abordarea recomandata?",
    answer: "Cand un API sufera modificari care rup compatibilitatea inversa (Breaking Changes, ex: stergerea unui camp obligatoriu sau redenumirea unei rute):\n\n1. Versionare prin URI Path (Cea mai folosita si recomandata in practica):\n   - `https://api.exemplu.ro/v1/users` -> `https://api.exemplu.ro/v2/users`.\n   - Avantaje: Extrem de vizibila, usor de testat direct din browser, usor de rutat la nivel de API Gateway / Nginx catre containere diferite.\n   - Alegerea companiilor mari: Google, Stripe, Twitter.\n\n2. Versionare prin Custom Request Header:\n   - `GET /users` cu antetul `X-API-Version: 2` sau `Accept: application/vnd.company.v2+json`.\n   - Avantaj: Pastreaza URL-ul curat conform teoriei REST pure (o resursa ar trebui sa aiba un singur identificator URI).\n   - Dezavantaj: Dificil de testat rapid, complica regulile de rutare pe Load Balancer si caching-ul pe CDN.",
    codeSnippet: `// Rutare eleganta prin URI in Spring Boot Controller:
@RestController
@RequestMapping("/api/v1/orders")
public class OrderV1Controller { ... }

@RestController
@RequestMapping("/api/v2/orders")
public class OrderV2Controller { ... }`,
    interviewTrap: "Nu crea versiuni noi (v2) pentru adaugari minore de campuri optionale! Daca doar adaugi o proprietate noua in JSON, aplicatiile client bine scrise o vor ignora. Versiunile noi se creeaza doar cand elimini sau modifici radical structura existenta.",
    keyTakeaway: "Versionarea prin URI Path (`/v1/`, `/v2/`) este standardul industriei datorita vizibilitatii clare si usurintei de rutare si caching."
  },
  {
    id: "sys-82",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Paginare REST: Offset-Based vs Cursor-Based (Keyset)",
    question: "De ce marile API-uri publice (Stripe, Twitter, Slack) impun Paginarea bazata pe Cursor in locul paginarii cu Offset?",
    answer: "1. Paginare cu Offset (`?limit=20&offset=40`):\n   - Merge bine doar la pagini mici.\n   - Probleme fatale:\n     - Performanta O(N): la `offset=1000000`, baza de date citeste si arunca un milion de randuri.\n     - Problema elementelor duplicate sau sarite (\"Page Drift\"): Daca utilizatorul este pe pagina 1 si un alt utilizator insereaza un rand nou la inceput, cand utilizatorul da click pe pagina 2, ultimul element de pe pagina 1 a alunecat pe pagina 2 si apare ca duplicat!\n\n2. Paginare bazata pe Cursor (Keyset Pagination):\n   - In loc de offset, clientul primeste un \"cursor\" opac (care contine ultimul ID sau timestamp vazut, ex: `?limit=20&after_cursor=eyJpZCI6NDJ9`).\n   - Urmatoarea interogare filtreaza direct: `WHERE id < :cursor ORDER BY id DESC LIMIT 20`.\n   - Performanta este constanta `O(1)` indiferent de adancime, iar inserarea de date noi nu produce duplicate in timp ce derulezi!",
    codeSnippet: `// Raspuns standard cu Cursor Pagination (Stripe Style):
{
  "data": [ { "id": "ch_10" }, { "id": "ch_11" } ],
  "has_more": true,
  "next_cursor": "ch_11"
}`,
    interviewTrap: "Cursor-based pagination este ideala pentru \"Infinite Scroll\" si feed-uri mobile, dar nu permite saritul direct la o pagina arbitrara (ex: \"Du-ma la pagina 50\").",
    keyTakeaway: "Paginarea pe baza de cursor previne duplicarile la inserari concurente si asigura performanta O(1) la adancimi uriase de date."
  },
  {
    id: "sys-83",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Distributed Locks cu Redis: Comanda Atomica SETNX PX",
    question: "Cum implementezi un lacat distribuit (Distributed Lock) sigur intr-o singura instanta de Redis?",
    answer: "Cand ai 5 instante de backend si vrei ca o operatiune critica (ex: rularea unui raport lunar sau plata unei comenzi) sa fie executata de UN SINGUR server:\n\n1. Comanda corecta in Redis:\n   `SET lock_key unique_request_id NX PX 30000`\n   - `NX`: Seteaza cheia DOAR daca NU exista deja (asigura atomicitatea exclusiva).\n   - `PX 30000`: Seteaza automat un TTL de expirare de 30.000 milisecunde (previne blocarea definitiva a sistemului daca serverul care a luat lock-ul ia crash brusc!).\n   - `unique_request_id`: Fiecare instanta pune un UUID propriu unic ca valoare.\n\n2. Cum se elibereaza lacatul in siguranta:\n   - NU se da un simplu `DEL lock_key`!\n   - Daca procesarea a durat 31 de secunde, TTL-ul a expirat si alt server a preluat lock-ul. Daca primul server da `DEL`, el ar sterge lock-ul noului server!\n   - Eliberarea se face atomic printr-un script Lua care verifica daca valoarea din Redis este egala cu UUID-ul sau inainte de stergere.",
    codeSnippet: `// Script Lua pentru eliberare sigura a lock-ului in Redis:
String script = "if redis.call(\\'get\\', KEYS[1]) == ARGV[1] then " +
                "   return redis.call(\\'del\\', KEYS[1]) " +
                "else " +
                "   return 0 " +
                "end";`,
    interviewTrap: "Daca procesarea dureaza mai mult decat TTL-ul setat, lock-ul este pierdut prematur. Pentru procesari lungi se foloseste un mecanism de \"Lock Renewal\" (Watchdog timer in Redisson) care prelungeste automat TTL-ul cat timp thread-ul este viu.",
    keyTakeaway: "Foloseste `SET key uuid NX PX timeout` pentru achizitionarea atomica si un script Lua la eliberare pentru a nu sterge lock-ul altui proces."
  },
  {
    id: "sys-84",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Algoritmul Redlock (Distributed Locks pe Cluster)",
    question: "Ce este algoritmul Redlock si de ce o singura instanta de Redis cu replica asincrona nu este suficienta pentru lock-uri critice?",
    answer: "1. De ce esueaza lacatul pe Redis cu Primary-Replica clasic:\n   - Serverul A obtine lock-ul pe instanta Primary.\n   - Inainte ca scrierea sa se replice pe Replica, Primary pica!\n   - Replica este promovata ca noul Primary.\n   - Serverul B cere acelasi lock si il obtine, deoarece noul Primary nu stia de el!\n   - Rezultat: Atat Serverul A cat si Serverul B detin acelasi lock concomitent!\n\n2. Cum rezolva algoritmul Redlock (propus de Salvatore Sanfilippo - antirez):\n   - Foloseste `N` instante de Redis complet INDEPENDENTE (fara replicare intre ele, de regula `N = 5`).\n   - Clientul incearca sa achizitioneze lock-ul secvential pe toate cele 5 instante cu acelasi UUID si un timeout scurt.\n   - Lock-ul este considerat REUSIT doar daca clientul a reusit sa-l obtina pe MAJORITATEA nodurilor (adica cel putin 3 din 5 noduri) intr-un timp mai mic decat valabilitatea lock-ului.\n   - Daca esueaza sa ia majoritatea, clientul trimite comanda de deblocare pe toate nodurile.",
    codeSnippet: `Client vrea Lock:
Nod 1: ACQUIRED [OK]
Nod 2: ACQUIRED [OK]
Nod 3: ACQUIRED [OK]  <-- Majoritate (3/5) atinsa!
Nod 4: TIMEOUT
Nod 5: ACQUIRED [OK]
-> Lock-ul este VALID si sigur impotriva caderii a 2 noduri!`,
    interviewTrap: "Redlock a fost subiectul unei dezbateri celebre intre Martin Kleppmann si antirez legata de pauzele de Garbage Collection lungi din aplicatie care pot invalida timpul lock-ului.",
    keyTakeaway: "Redlock obtine consensul pe o majoritate de instante Redis independente, prevenind pierderea lock-urilor in caz de failover asincron."
  },
  {
    id: "sys-85",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Deduplicarea Evenimentelor (Message Deduplication)",
    question: "Cum garantezi ca un eveniment de plata trimis accidental de 3 ori este procesat o singura data de consumator?",
    answer: "In sistemele distribuite, garantia livrarii este aproape intotdeauna `At-Least-Once`, ceea ce inseamna ca duplicatele sunt inevitabile.\n\nTehnici standard de Deduplicare:\n\n1. Identificator Unic de Eveniment (Message / Event ID):\n   - Producatorul adauga un UUID unic in fiecare mesaj generat (ex: `event_id: \"evt_981a...\"`).\n\n2. Verificare si Salvare Atomica in Baza de Date:\n   - Tabela de evenimente procesate (`processed_events`) cu constrangere `PRIMARY KEY (event_id)`.\n   - Cand worker-ul primeste mesajul, executa in cadrul aceleiasi tranzactii locale:\n     `INSERT INTO processed_events (event_id, processed_at) VALUES (\\'evt_981a...\\', NOW());`\n   - Daca mesajul este un duplicat, inserarea esueaza instant cu `Unique Constraint Violation` (SQLSTATE 23505)!\n   - Tranzactia este anulata, worker-ul ignora duplicatul si da ACK brokerului.\n\n3. Alternativa rapida cu Redis:\n   - `SET event:evt_981a 1 NX EX 86400`.\n   - Daca intoarce null, evenimentul a mai fost procesat in ultimele 24 de ore.",
    codeSnippet: `// Deduplicare atomica in Spring Data JPA:
@Transactional
public void handleEvent(PaymentEvent event) {
    try {
        processedEventRepo.saveAndFlush(new ProcessedEvent(event.getId()));
    } catch (DataIntegrityViolationException ex) {
        log.info("Mesaj duplicat detectat {}, salt peste executie.", event.getId());
        return;
    }
    // Logica reala de procesare a platii se executa strict daca save-ul a reusit:
    executaPlata(event);
}`,
    interviewTrap: "Daca verifici existenta printr-un `SELECT` si apoi faci `INSERT` separat, doua thread-uri paralele pot rula ambele SELECT-ul simultan si pot procesa ambele plata (Race Condition)! Constrangerea UNIQUE din baza este singura garantie atomica.",
    keyTakeaway: "Deduplicarea necesita un Event ID unic si o constrangere PRIMARY KEY/UNIQUE sau SETNX in Redis pentru a respinge atomic procesarile duble."
  },
  {
    id: "sys-86",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Transactional Outbox Pattern",
    question: "Cum rezolva Transactional Outbox Pattern problema sincronizarii atomice dintre baza de date si Kafka?",
    answer: "1. Problema \"Dual-Write\":\n   - Daca un serviciu trebuie sa salveze o comanda in PostgreSQL si sa trimita un eveniment in Kafka:\n     - Daca scrii in DB si serverul pica inainte de a trimite in Kafka -> Evenimentul se pierde!\n     - Daca trimiti in Kafka si commit-ul in DB esueaza -> Ai trimis un eveniment despre o comanda care nu exista!\n   - Baza de date si Kafka sunt doua sisteme separate; nu pot imparti o tranzactie `@Transactional` comuna.\n\n2. Solutia: Transactional Outbox Pattern:\n   - Adaugi o tabela auxiliara `outbox` in ACEEASI baza de date PostgreSQL.\n   - Cand salvezi comanda, inserezi mesajul si in tabela `outbox` in CADRUL ACELEIASI TRANZACTII ACID LOCALE!\n     - Daca tranzactia reuseste, atat comanda cat si evenimentul din outbox sunt salvate garantat pe disc.\n     - Daca tranzactia pica, ambele sunt anulate complet.\n   - Un proces separat (Message Relay sau CDC Debezium) citeste inregistrarile din `outbox`, le trimite in Kafka si apoi le marcheaza ca trimise.",
    codeSnippet: `BEGIN TRANSACTION;
INSERT INTO comenzi (id, total, status) VALUES (101, 250, 'CREAT');
INSERT INTO outbox_events (id, aggregat_id, tip, payload) 
VALUES (gen_random_uuid(), 101, 'ORDER_CREATED', '{"total": 250}');
COMMIT;
-- Salvare 100% atomica pe aceeasi conexiune!`,
    interviewTrap: "Daca procesul Message Relay citeste tabela Outbox prin polling SQL continuu (`SELECT * FROM outbox WHERE sent = false`), poate incarca baza de date. Solutia de elita moderna este ascultarea transaction log-ului prin CDC (Change Data Capture).",
    keyTakeaway: "Transactional Outbox salveaza mesajele destinate brokerului in aceeasi tranzactie locala de baza de date, garantand ca niciun eveniment nu se pierde."
  },
  {
    id: "sys-87",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Change Data Capture (CDC) si Debezium",
    question: "Ce este Change Data Capture (CDC) si cum extrage Debezium modificari din PostgreSQL fara a incarca serverul?",
    answer: "1. Ce este CDC:\n   - Tehnica de identificare si capturare in timp real a tuturor modificarilor (INSERT, UPDATE, DELETE) care au loc intr-o baza de date si transformarea lor intr-un flux de evenimente (event stream).\n\n2. Cum functioneaza Debezium cu PostgreSQL:\n   - Debezium NU face interogari repetate de tip `SELECT *` pe tabele!\n   - El se conecteaza direct la mecanismul nativ de Logical Decoding si citeste direct Write-Ahead Log-ul (WAL-ul) bazei de date (jurnalul binar secvential de pe disc).\n   - La fiecare commit, Debezium citeste octetii modificati, ii impacheteaza intr-un mesaj JSON/Avro si ii publica direct intr-un topic de Apache Kafka in cateva milisecunde!\n\n3. Beneficii majore:\n   - Impact zero asupra performantei interogarilor aplicatiei.\n   - Garanteaza ca nicio modificare nu este ratata.\n   - Excelent pentru sincronizarea unei baze relationale cu un motor de cautare (Elasticsearch) sau un cache (Redis).",
    codeSnippet: `PostgreSQL (Write-Ahead Log) 
           |
     [ Debezium CDC Connector ]
           |
     [ Apache Kafka Topic: dbserver1.public.orders ]
       /             \\
Elasticsearch       Microserviciu Analitice`,
    interviewTrap: "Daca Debezium este oprit mai multe zile sau conexiunea cu Kafka pica, fisierele WAL din PostgreSQL se vor acumula pe disc pana cand umplu tot spatiul serverului! Trebuie monitorizat slotul de replicare logica.",
    keyTakeaway: "CDC citeste modificarile direct din jurnalul binar de tranzactii (WAL) al bazei de date, transmitand schimbarile catre Kafka fara interogari de polling."
  },
  {
    id: "sys-88",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Polling vs Webhooks",
    question: "De ce este utilizarea Webhooks superioara mecanismului de Polling pentru integrari intre platforme (ex: plati Stripe)?",
    answer: "Doua moduri prin care Aplicatia A afla ca ceva s-a intamplat in Aplicatia B:\n\n1. Polling (Interogare repetata la interval fix):\n   - Aplicatia A trimite o cerere HTTP la fiecare 5 secunde catre Stripe: \"S-a platit comanda 42? ... Dar acum? ... Dar acum?\".\n   - Dezavantaje majore:\n     - 99% din cereri sunt apeluri inutile care raspund \"Nu inca\", consumand banda, CPU si resurse de retea.\n     - Daca plata are loc la secunda 1 si urmatorul poll este la secunda 5, apare o intarziere artificiala de 4 secunde.\n\n2. Webhooks (Push orientat pe evenimente - \"Inverse API\"):\n   - Aplicatia A nu intreaba nimic!\n   - Aplicatia A expune un endpoint HTTP public (ex: `POST /api/webhooks/stripe`).\n   - Cand banca confirma plata, Stripe TRIMITE PROACTIV o cerere HTTP POST direct catre endpoint-ul aplicatiei tale continand detaliile platii!\n   - Avantaje: Latenta instantanee (eveniment in timp real) si zero apeluri de retea inutile.",
    codeSnippet: `Polling:  App -> (req) -> Stripe ("Nu")
          App -> (req) -> Stripe ("Nu")
          App -> (req) -> Stripe ("Da!")

Webhook:  Stripe -> POST https://app.ro/api/stripe-webhook (Instant cand plata reuseste)`,
    interviewTrap: "Endpoint-ul tau de Webhook este expus pe internet; oricine ar putea trimite o cerere falsa `POST /webhook` pretinzand ca plata a reusit! Validarea semnaturii criptografice este obligatorie (vezi intrebarea urmatoare).",
    keyTakeaway: "Polling-ul iroseste resurse verificand continuu schimbarile; Webhook-urile notifica proactiv aplicatia instantaneu cand evenimentul are loc."
  },
  {
    id: "sys-89",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Securitatea si Robustetea Receptorului de Webhooks",
    question: "Cum construiesti un endpoint de Webhooks sigur si rezistent la caderi de retea?",
    answer: "Cele 3 reguli de aur pentru receptionarea webhooks in productie:\n\n1. Validarea Semnaturii Criptografice (HMAC):\n   - Providerul (ex: Stripe, GitHub) semneaza corpul cererii cu o cheie secreta comuna (Secret Key) si o trimite intr-un header: `Stripe-Signature: t=16...,v1=4a9b...`.\n   - Endpoint-ul tau recalculeaza hash-ul HMAC-SHA256 pe baza corpului primit si a cheii secrete; daca nu se potriveste perfect, cererea este respinsa cu `401 Unauthorized`!\n\n2. Raspuns Fulgerator (HTTP 200 OK sub 200ms):\n   - Nu executa procesari grele (generare PDF, trimitere email) in interiorul endpoint-ului de webhook!\n   - Daca webhook-ul dureaza mai mult de 2-5 secunde, providerul extern va considera apelul ca esuat prin timeout si va retrimite cererea continuu.\n   - Procedura corecta: Valideaza semnatura, pune evenimentul brut intr-o coada interna (RabbitMQ/Redis) si intoarce instant `200 OK`.\n\n3. Trateaza Evenimentele ca Idempotente:\n   - Providerii trimit uneori acelasi webhook de mai multe ori (retries). Verifica intotdeauna `event.id` inainte de a livra produsul.",
    codeSnippet: `@PostMapping("/api/webhooks/stripe")
public ResponseEntity<String> handleStripeWebhook(
        @RequestBody String payload, 
        @RequestHeader("Stripe-Signature") String sigHeader) {
    
    // 1. Validare semnatura HMAC:
    Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
    
    // 2. Trimite in coada interna pentru procesare asincrona:
    webhookQueue.send(event);
    
    // 3. Raspuns instant catre Stripe:
    return ResponseEntity.ok("Received");
}`,
    interviewTrap: "Daca parsezi JSON-ul inainte de validarea semnaturii, spatiile albe sau ordinea campurilor se pot schimba, facand ca semnatura HMAC sa nu se mai potriveasca. Semnatura se calculeaza intotdeauna pe sirul JSON brut (raw body)!",
    keyTakeaway: "Receptorul de webhooks trebuie sa valideze semnatura HMAC, sa salveze mesajul intr-o coada interna si sa raspunda imediat cu 200 OK."
  },
  {
    id: "sys-90",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Data Lake vs Data Warehouse",
    question: "Care este diferenta fundamentala de arhitectura intre un Data Warehouse si un Data Lake?",
    answer: "Doua concepte majore de stocare centralizata a datelor corporative:\n\n1. Data Warehouse (ex: Snowflake, Amazon Redshift, Google BigQuery):\n   - Schema-on-Write (Date puternic structurate si curatate inainte de inserare).\n   - Proces ETL (Extract, Transform, Load): Datele sunt extrase din bazele relationale, transformate/agregate si incarcate intr-o schema relationala optimizata pentru BI.\n   - Utilizatori principali: Analisti de afaceri, dashboard-uri SQL, rapoarte financiare.\n   - Cost ridicat per terabyte.\n\n2. Data Lake (ex: AWS S3 + Apache Spark / Delta Lake, Hadoop HDFS):\n   - Schema-on-Read (Stocheaza orice tip de date in formatul lor BRUT initial: fisiere JSON nestructurate, fisiere CSV, imagini, fisiere audio, loguri server).\n   - Proces ELT (Extract, Load, Transform): Datele sunt aruncate direct in lac, iar transformarile se fac doar la momentul interogarii.\n   - Utilizatori principali: Data Scientists, modele de Machine Learning, procesare Big Data masiva.\n   - Cost extrem de redus de stocare.",
    codeSnippet: `Data Warehouse: Date curate -> Schema relationala rigida -> SQL BI Reports
Data Lake:      Fisiere brute (JSON, Audio, Loguri) -> AWS S3 Bucket -> ML Training / Spark`,
    interviewTrap: "Un Data Lake fara guvernanta si catalog de metadate devine rapid un \"Data Swamp\" (Mlastina de Date) in care nimeni nu mai stie ce reprezinta fisierele vechi.",
    keyTakeaway: "Data Warehouse stocheaza date structurate si curate pentru rapoarte de afaceri; Data Lake pastreaza date brute la cost redus pentru analitice si AI."
  },
  {
    id: "sys-91",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "OLTP vs OLAP pe Intelesul Tuturor",
    question: "Care sunt diferentele cheie intre sistemele OLTP si OLAP si de ce nu folosim aceeasi baza de date pentru ambele?",
    answer: "1. OLTP (Online Transaction Processing):\n   - Focus pe OPERATIUNI CURENTE de afaceri (inregistrare utilizator, plasare comanda, debitare cont).\n   - Interogari scurte, simple si extrem de rapide (milisecunde), pe un numar mic de randuri (selectie dupa Primary Key).\n   - Volum mare de tranzactii concurente (mii de scrieri/secunda).\n   - Baza de date normalizata (3NF) pentru a asigura integritatea ACID.\n   - Exemple: PostgreSQL, MySQL, Oracle.\n\n2. OLAP (Online Analytical Processing):\n   - Focus pe ANALIZA SI DECIZII strategice de afaceri (\"Care a fost profitul mediu pe categorii in ultimii 3 ani?\").\n   - Interogari complexe care scaneaza milioane sau miliarde de randuri agregate (`SUM`, `AVG`, `GROUP BY`).\n   - Volum mic de cereri paralele, dar fiecare cerere poate rula secunde sau minute.\n   - Baze columnare denormalizate (Star Schema / Snowflake Schema).\n   - Exemple: ClickHouse, Snowflake, BigQuery.",
    codeSnippet: `// OLTP (Rapid, dupa ID):
SELECT * FROM utilizatori WHERE id = 452;

// OLAP (Scanare pe coloane a miliarde de randuri):
SELECT categorie, SUM(total) FROM vanzari 
WHERE data BETWEEN '2023-01-01' AND '2026-01-01' 
GROUP BY categorie;`,
    interviewTrap: "Daca rulezi o interogare analitica grea de OLAP direct pe baza de productie OLTP, interogarea va umple memoria RAM si va bloca discul, paralizand magazinul pentru clientii activi!",
    keyTakeaway: "OLTP proceseaza rapid tranzactii individuale de business; OLAP executa agregari analitice pe volume uriase de date istorice."
  },
  {
    id: "sys-92",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Baze de Date Columnare: De Ce Sunt de 100x Mai Rapide la Analitice?",
    question: "Cum stocheaza datele o baza de date pe coloane (ex: ClickHouse) si de ce executa agregari `SUM()` instantaneu?",
    answer: "1. Stocare pe Randuri (Row-oriented - PostgreSQL clasic):\n   - Tabela este stocata pe disc rand dupa rand: `[ID1, Nume1, Salariu1, Adresa1], [ID2, Nume2, Salariu2, Adresa2]...`.\n   - Daca vrei sa calculezi `SUM(salariu)` pe 100 de milioane de randuri, motorul este OBLIGAT sa citeasca de pe disc intregul bloc cu toate coloanele (nume, adrese, telefoane) chiar daca tie iti trebuia doar salariul!\n   - Se consuma o latime de banda de disc uriasa citind date inutile.\n\n2. Stocare pe Coloane (Column-oriented - ClickHouse, Redshift):\n   - Fiecare coloana este stocata fizic intr-un fisier complet separat pe disc!\n   - Cand rulezi `SUM(salariu)`: motorul citeste EXCLUSIV blocul binar al coloanei `salariu`, sarind complet peste restul de 50 de coloane ale tabelei!\n   - Compresie Exceptionala: Deoarece o coloana contine date de acelasi tip (ex: doar intregi sau doar date calendaristice), algoritmii de compresie (LZ4, ZSTD) comprima datele de 5-10 ori mai eficient, permitand citiri de pe disc la viteza memoriei RAM.",
    codeSnippet: `Row-Oriented (Postgres):
[Rand 1: 1, Ana, 5000, Str X] -> [Rand 2: 2, Dan, 7000, Str Y]

Column-Oriented (ClickHouse):
Fisier ID:      [1, 2, 3, ...]
Fisier Nume:    ["Ana", "Dan", "Ion", ...]
Fisier Salariu: [5000, 7000, 6500, ...] -> Se citeste DOAR acesta pentru SUM()!`,
    interviewTrap: "Bazele columnare sunt incredibil de rapide la SELECT-uri analitice, dar sunt extrem de LENTE la operatiuni de `UPDATE` sau `DELETE` pe un singur rand. Ele sunt proiectate strict pentru adaugare de date in loturi (bulk append-only).",
    keyTakeaway: "Bazele columnare citesc strict coloanele cerute in interogare si comprima datele masiv, fiind de pana la 100x mai rapide decat bazele traditionale la agregari mari."
  },
  {
    id: "sys-93",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Bloom Filters in Sisteme Distribuite: Salvarea I/O-ului",
    question: "Ce este un Bloom Filter, care sunt garantiile sale matematice si cum este folosit in Cassandra sau Bigtable?",
    answer: "1. Ce este un Bloom Filter:\n   - O structura de date probabilistica extrem de compacta in memorie, bazata pe un tablou de biti si multiple functii hash, folosita pentru a testa daca un element face parte dintr-o multime.\n\n2. Garantiile Matematice:\n   - Raspuns cert negativ: Daca Bloom Filter zice \"NU\", elementul SIGUR NU EXISTA in baza de date (Zero False Negatives)!\n   - Raspuns probabil pozitiv: Daca zice \"DA\", elementul PROBABIL EXISTA, dar poate fi o alarma falsa (Posibile False Positives, ex: 1% sansa).\n\n3. Utilizare salvatoare in Apache Cassandra / RocksDB:\n   - Inainte ca motorul sa caute o cheie pe disc in zecile de fisiere SSTable (operatiune scumpa de citire I/O de pe SSD), el consulta mai intai Bloom Filter-ul din memoria RAM.\n   - Daca Bloom Filter zice \"Nu exista\", Cassandra renunta instant fara sa mai atinga discul deloc!\n   - Elimina 99% din citirile inutile pe disc pentru chei inexistente.",
    codeSnippet: `Client cauta cheia "user:42":
Consultare Bloom Filter in RAM -> Raspuns: "SIGUR NU EXISTA!"
-> Returneaza 404 instant, fara a efectua nicio citire I/O de pe disc SSD!`,
    interviewTrap: "Elementele NU pot fi sterse dintr-un Bloom Filter standard (deoarece resetarea unui bit la zero ar putea strica verificarile altor elemente care foloseau acelasi bit hash).",
    keyTakeaway: "Bloom Filter este o structura de memorie care garanteaza daca o data NU exista, scutind baza de date de operatii I/O costisitoare pe disc."
  },
  {
    id: "sys-94",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Time-to-Live (TTL) si Politici de Expirare in Cache",
    question: "De ce este obligatoriu ca fiecare cheie de cache sa aiba un TTL si cum se curata cheile expirate in Redis?",
    answer: "1. De ce este TTL-ul (Time-to-Live) obligatoriu pe orice cheie de cache:\n   - Prevenirea Memory Leaks: Daca nu pui TTL, datele temporare (sesiuni vechi, utilizatori inactivi de 2 ani, cosuri abandonate) vor ramane pe veci in memorie pana umplu tot RAM-ul.\n   - Consistenta Eventuala de Rezerva: Daca logica de invalidare a aplicatiei are un bug si uita sa stearga o cheie la update, TTL-ul garanteaza ca dupa expirarea perioadei (ex: 1 ora), datele noi vor fi incarcate automat.\n\n2. Cum curata Redis cheile expirate (2 mecanisme combinate):\n   - Expirare Pasiva: Cand un client acceseaza o cheie, Redis verifica daca a expirat. Daca da, o sterge pe loc si returneaza null.\n   - Expirare Activa in Background: De 10 ori pe secunda, un proces intern testeaza aleatoriu un esantion de chei cu TTL; daca peste 25% din ele au expirat, continua sa le curete pentru a elibera RAM.",
    codeSnippet: `# Setare cheie cu expirare automata in 600 de secunde (10 minute):
SET token:session:9812 "user_id_42" EX 600

# Verificare timp ramas:
TTL token:session:9812 # Intoarce secundele ramase`,
    interviewTrap: "Nu pune chei fara TTL crezand ca politica LRU le va sterge mereu la nevoie. Daca ai multe chei fara TTL si politica e `volatile-lru`, memoria se va umple si Redis va arunca erori!",
    keyTakeaway: "TTL-ul asigura curatarea automata a memoriei si serveste drept plasa de siguranta pentru consistenta datelor in cache."
  },
  {
    id: "sys-95",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Two-Phase Commit (2PC): De Ce Este Evitat in Microservicii Moderne",
    question: "Ce este protocolul Two-Phase Commit (2PC) si de ce este considerat un anti-pattern in sistemele distribuite scalabile?",
    answer: "1. Ce este 2PC (Two-Phase Commit):\n   - Un protocol clasic de consens distribuit condus de un Coordonator Tranzactional:\n   - Faza 1 (Prepare): Coordonatorul intreaba toate nodurile participante: \"Sunteti gata sa comiteti?\". Fiecare nod blocheaza resursele local si raspunde \"DA\".\n   - Faza 2 (Commit): Daca toate au zis \"DA\", coordonatorul trimite comanda finala de `COMMIT`. Daca oricare a zis \"NU\", trimite `ROLLBACK`.\n\n2. De ce este evitat in arhitecturi moderne de microservicii:\n   - Protocol BLOCANT (Blocking): In timpul Fazei 1, toate bazele de date participante tin lacate (row locks) deschise pe tabele. Daca un nod sau reteaua are lag de 5 secunde, toata lumea ramane blocata, distrugand throughput-ul!\n   - Single Point of Failure (SPOF): Daca Coordonatorul pica la jumatatea Fazei 2, toate nodurile participante raman blocate in incertitudine, cu resursele incuiate, nestiind daca sa dea commit sau rollback.\n   - Incompatibil cu scalarea peste centre de date diferite.",
    codeSnippet: `2PC Coordinator
      |
  Faza 1: "Prepare?" -> Nod A (Lock Resurse) | Nod B (Lock Resurse)
      |
  Faza 2: "Commit!"  -> Confirmare finala (Latenta adunata a tuturor nodurilor)`,
    interviewTrap: "In locul lui 2PC, in microservicii moderne se foloseste intotdeauna SAGA Pattern (cu tranzactii locale si actiuni compensatorii) sau Eventual Consistency.",
    keyTakeaway: "2PC garanteaza consistenta atomica stricta dar blocheaza resursele si este vulnerabil la caderi de coordonator; la scara larga este inlocuit cu SAGA."
  },
  {
    id: "sys-96",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Graceful Degradation (Degradare Controlata a Serviciului)",
    question: "Ce inseamna principiul Graceful Degradation si cum asigura ca o aplicatie continua sa vanda chiar daca unele componente pica?",
    answer: "1. Ce este Graceful Degradation:\n   - Capacitatea unui sistem de a continua sa functioneze si sa ofere functionalitatile CRITICE de baza, chiar si atunci cand servicii secundare neesentiale sufera caderi sau sunt oprite.\n\n2. Exemplu practic (E-Commerce / Magazin Online):\n   - Pica Serviciul de Recomandari Personalizate (AI / Machine Learning):\n     - Degradare gresita: Pagina de produs da ecran alb sau eroare 500.\n     - Graceful Degradation: Pagina de produs se incarca perfect, iar in sectiunea de recomandari se afiseaza o lista statica de \"Cele mai vandute produse\" din cache sau sectiunea este ascunsa complet!\n   - Utilizatorul poate plasa comanda in continuare si compania nu pierde bani.\n\n3. Alte exemple:\n   - Daca serviciul de cautare Elasticsearch pica, se face fallback temporar pe un `LIKE` simplu in SQL cu rate limit.\n   - Daca serviciul de comentarii e lent, se dezactiveaza comentariile pe blog, dar continutul articolului ramane lizibil.",
    codeSnippet: `// Implementare fallback in cod cu Resilience4j / Try-Catch:
try {
    return recommendationService.getPersonalized(userId);
} catch (Exception e) {
    log.warn("Serviciul de recomandari indisponibil, fallback pe lista statica.");
    return staticTrendingCache.getTopProducts(); // Utilizatorul nu simte eroarea!
}`,
    interviewTrap: "Niciodata sa nu legi functionalitatea principala (checkout, plata) intr-un mod sincron dependent de un serviciu secundar (recomandari, recenzii, analytics)!",
    keyTakeaway: "Graceful Degradation mentine active operatiunile critice ascunzand sau inlocuind componentele secundare cazute cu solutii de rezerva statice."
  },
  {
    id: "sys-97",
    category: "SYSTEM_DESIGN",
    difficulty: "MEDIU",
    title: "Estimari de Capacitate (Back-of-the-Envelope Calculations)",
    question: "Cum aproximezi rapid cererile pe secunda (QPS) si spatiul de stocare necesar pentru un serviciu de 10 milioane de utilizatori activi zilnic?",
    answer: "Formule mentale standard pentru interviul de System Design:\n\n1. Constante de memorat:\n   - 1 zi = ~86.400 secunde $\\approx$ 100.000 de secunde (pentru calcule rapide).\n   - 1 milion de secunde $\\approx$ 11.5 zile.\n\n2. Calcul QPS (Queries Per Second):\n   - Presupunere: 10 milioane DAU (Daily Active Users), fiecare face 10 cereri pe zi = 100.000.000 cereri/zi.\n   - `QPS Mediu = 100.000.000 / 100.000 secunde = 1.000 cereri/secunda`.\n   - `Peak QPS (Varf de trafic)`: De regula de 2-3 ori media: `2.000 - 3.000 QPS`.\n   - Un singur server web bine optimizat poate duce ~1.000 - 2.000 QPS, deci ai nevoie de cel putin 2-3 servere backend.\n\n3. Calcul Stocare pe 5 Ani:\n   - Daca fiecare cerere genereaza o postare de 500 octeti (bytes):\n   - `10.000.000 postari/zi * 500 bytes = 5 GB/zi`.\n   - `Intr-un an: 5 GB * 365 = ~1.8 TB/an`.\n   - `In 5 ani: 1.8 TB * 5 = ~9 TB stocare totala` (o dimensiune rezonabila, usor de tinut pe un cluster de discuri).",
    codeSnippet: `# Cheat sheet estimari rapide la interviu:
# 1 KB = 10^3 bytes
# 1 MB = 10^6 bytes
# 1 GB = 10^9 bytes
# 1 TB = 10^12 bytes
# 1 PB = 10^15 bytes
# 100M cereri/zi = ~1.150 QPS`,
    interviewTrap: "La interviu nu se cauta rezultatul matematic exact la virgula! Intervievatorul vrea sa vada ca stii ordinul de marime si ca poti deduce daca ai nevoie de un singur server sau de 50 de servere.",
    keyTakeaway: "Imparte cererile zilnice la 100.000 pentru a afla QPS-ul aproximativ; dubleaza valoarea pentru varfuri (Peak QPS)."
  },
  {
    id: "sys-98",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Masurarea Performantei: Latenta vs Throughput si Perceptilele P95/P99",
    question: "De ce media simpla (Average) a timpului de raspuns este o capcana si ce masoara percentilele P95 si P99?",
    answer: "1. Diferenta Latenta vs Throughput:\n   - Latenta: Cat timp dureaza ca o singura cerere sa fie procesata si sa primeasca raspuns (masurat in milisecunde).\n   - Throughput (Debit): Cate cereri poate procesa sistemul intr-o unitate de timp (masurat in QPS / RPS).\n\n2. De ce Media (Average / Mean) este o minciuna:\n   - Daca 99 de utilizatori primesc raspuns in 10ms, dar 1 utilizator ghinionist asteapta 10.000ms (10 secunde din cauza unui lock):\n   - Media matematica este: `(99*10 + 10000)/100 = ~109ms`.\n   - Media arata rezonabil (109ms), ascunzand complet faptul ca un utilizator a trait o experienta dezastruoasa!\n\n3. Rolul Percentilelor (P50, P95, P99):\n   - Ordoneaza toate cererile crescator dupa durata lor:\n   - P50 (Mediana): 50% din utilizatori au primit raspuns sub aceasta valoare.\n   - P95: 95% din utilizatori au primit raspuns sub aceasta valoare (arata performanta pentru majoritatea covarsitoare).\n   - P99 (Tail Latency): 99% din utilizatori au fost mai rapizi, iar cei mai lenti 1% au atins acest prag maxim.\n   - In SLA-uri (Service Level Agreements) se monitorizeaza strict P99!",
    codeSnippet: `Statistica Reala de Performanta:
P50: 12ms   (Foarte bine)
P95: 45ms   (Stabil)
P99: 850ms  (Aici trebuie optimizat - lock-uri sau GC pauses!)`,
    interviewTrap: "Intr-o arhitectura de microservicii unde o pagina apeleaza 20 de servicii paralele, probabilitatea ca utilizatorul sa loveasca cel putin un serviciu aflat in P99 creste la peste 18%! De aceea latenta cozii (tail latency) este critica.",
    keyTakeaway: "Media ascunde anomaliile grave; monitorizeaza intotdeauna P95 si P99 (latenta cozii) pentru a intelege experienta utilizatorilor afectati de varfuri."
  },
  {
    id: "sys-99",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Cei 4 Pasi Standard intr-un Interviu de System Design",
    question: "Care este structura recomandata in 4 pasi pentru a raspunde cu succes la orice intrebare de System Design?",
    answer: "Structura standard de abordare pentru un interviu de 45 de minute:\n\n1. Pasul 1: Clarificarea Cerintelor (5-8 minute):\n   - Cerinte Functionale: Ce anume face sistemul? (ex: \"utilizatorul introduce un URL si primeste un link scurt; cand da click este redirectionat\").\n   - Cerinte Non-Functionale: Scalabilitate, disponibilitate vs consistenta (CAP), latenta ceruta (sub 100ms), volum estimat (DAU, QPS, citiri vs scrieri).\n\n2. Pasul 2: Design de Nivel Inalt (High-Level Design - 10-15 minute):\n   - Schitarea componentelor principale: Client -> Load Balancer -> API Gateway -> Backend -> Baza de Date si Cache.\n   - Definirea modelelor de date si a endpoint-urilor de baza.\n\n3. Pasul 3: Deep Dive pe Componente Specifice (15 minute):\n   - Focalizare pe cerinta cheie a problemei (ex: algoritmul Base62 la TinyURL, gestionarea concurentei la Flash Sale, structura Trie la Autocomplete).\n\n4. Pasul 4: Scalabilitate, Erori si Bottlenecks (5-10 minute):\n   - Identificarea SPOF-urilor, adaugarea de replici, strategii de cache stampede, rate limiting si securitate.",
    codeSnippet: `Cronologia celor 45 de minute:
[0-8 min]   Clarificare cerinte (Scope & Scale)
[8-20 min]  High-Level Diagram (Cutii si Sageti)
[20-35 min] Deep Dive pe provocarile majore
[35-45 min] Bottlenecks, Redundanta si Optimizari`,
    interviewTrap: "Cea mai mare greseala este sa incepi sa desenezi servere si baze de date in primele 30 de secunde fara sa clarifici cerintele! Intervievatorii vor sa vada ca pui intrebari inainte de a oferi solutii.",
    keyTakeaway: "Urmeaza intotdeauna cei 4 pasi: Clarifica cerintele, schiteaza arhitectura de nivel inalt, analizeaza componentele critice si discuta scalabilitatea si punctele unice de cadere."
  },
  {
    id: "sys-100",
    category: "SYSTEM_DESIGN",
    difficulty: "USOR",
    title: "Top 5 Erori la Interviul de System Design pentru Junior / Mid",
    question: "Care sunt cele mai frecvente 5 greseli care duc la respingerea unui candidat la interviul de System Design?",
    answer: "Top 5 greseli fatale de evitat:\n\n1. \"Buzzword Bingo\" / Saritul la unelte sofisticate fara justificare:\n   - Aruncarea cu termeni precum Kafka, Kubernetes, Cassandra si GraphQL inainte de a intelege daca sistemul are nevoie de ele (un simplu PostgreSQL pe un singur nod e adesea suficient la inceput!).\n\n2. Tratarea apelurilor de retea ca fiind sigure (Neglijarea caderilor):\n   - Schitarea de servicii care apeleaza alte servicii in lant sincron fara timeout-uri, circuite de protectie (Circuit Breaker) sau retry-uri.\n\n3. Neglijarea complet a Bazei de Date:\n   - Schitarea backend-ului cu detalii fine, dar desenarea unui singur cilindru generic pe care scrie \"Database\", fara a specifica daca e SQL sau NoSQL, cum e indexata sau cum se face sharding.\n\n4. Ignorarea raportului Citiri vs Scrieri:\n   - Propunerea de solutii grele de sharding pentru sisteme cu 99% citiri unde un simplu Redis Cache rezolva toata problema.\n\n5. Monologul fara comunicare:\n   - Vorbitul continuu timp de 20 de minute fara a cere feedback de la intervievator (\"Are sens directia aceasta sau doriti sa intram in detaliu pe componenta de plati?\").",
    codeSnippet: `// Reteta succesului la interviu:
1. Pune intrebari de clarificare.
2. Incepe simplu (Keep It Simple, Stupid - KISS).
3. Scaleaza doar acolo unde apar blocaje identificate.
4. Justifica fiecare decizie tehnica prin compromisuri (Trade-offs: De ce X si nu Y).`,
    interviewTrap: "Nu exista un design \"perfect\" in System Design! Exista doar compromisuri (Trade-offs). Daca prezinti o solutie ca fiind 100% buna fara niciun dezavantaj, intervievatorul stie ca nu intelegi limitarile reale ale tehnologiei.",
    keyTakeaway: "Evita tehnologiile exagerate fara justificare, incepe simplu, comunica constant si explica intotdeauna compromisurile deciziilor tale."
  }
];
