// Data set complet de Flashcards stil Anki pentru Pregatire Interviu Tehnic Java 2026
// Strict zero diacritice in toate textele

export const JAVA_ANKI_CATEGORIES = [
  { id: 'ALL', label: 'Toate Cardurile', icon: 'Layers' },
  { id: 'JAVA_CORE', label: 'Java Core & JVM', icon: 'Coffee', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'SPRING_JPA', label: 'Spring Boot & JPA', icon: 'Leaf', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'SQL_DB', label: 'SQL, Indecsi & Postgres', icon: 'Database', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'CONCURRENCY', label: 'Multithreading & Java 21', icon: 'Cpu', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'SYSTEM_DESIGN', label: 'System Design & REST', icon: 'Server', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'TESTING', label: 'Testing (JUnit & Mockito)', icon: 'CheckCircle', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
];

export const JAVA_ANKI_CARDS = [
  // ==========================================
  // 1. JAVA CORE & JVM
  // ==========================================
  {
    id: 'java-core-01',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza HashMap intern in Java?',
    question: 'Explica arhitectura interna a unui HashMap in Java 8+: structura de date, calculul bucket-ului, gestionarea coliziunilor si cand se transforma lista inlantuita in arbore.',
    answer: 'HashMap foloseste un array de bucket-uri (Node<K,V>[] table). Indexul se calculeaza prin formula: index = (n - 1) & hash(key.hashCode()). In caz de coliziune, elementele se adauga initial intr-o lista simplu inlantuita. Daca numarul de elemente dintr-un bucket depaseste pragul de 8 (TREEIFY_THRESHOLD) si capacitatea totala a array-ului este cel putin 64, lista se converteste intr-un arbore rosu-negru (Red-Black Tree, TreeNode), reducand complexitatea de la O(n) la O(log n). Cand numarul scade sub 6, arborele redevine lista (UNTREEIFY_THRESHOLD).',
    codeSnippet: `// 1. Calcul index bucket:
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
int index = (table.length - 1) & hash;

// 2. Praguri critice in java.util.HashMap:
static final int TREEIFY_THRESHOLD = 8;
static final int UNTREEIFY_THRESHOLD = 6;
static final int MIN_TREEIFY_CAPACITY = 64;`,
    interviewTrap: 'Capcana frecventa: Multi candidati uita ca pentru transformarea in Red-Black Tree este obligatoriu ca si capacitatea totala a tabelei sa fie >= 64. Daca este mai mica, se face resize (dublare), NU treeify!',
    keyTakeaway: 'Complexitate: O(1) amortizat pentru get/put. O(log n) in caz de coliziuni masive in acelasi bucket.'
  },
  {
    id: 'java-core-02',
    category: 'JAVA_CORE',
    difficulty: 'USOR',
    title: 'De ce este String imutabil in Java?',
    question: 'De ce clasa String este declarata "final" si imutabila (immutable) in Java? Ce avantaje concrete aduce acest design?',
    answer: 'String este imutabil din 4 motive critice:\n1. String Constant Pool (Memorie): Permite refolosirea acelorasi literali in memorie (Heap / PermGen / Metaspace) fara duplicare.\n2. Securitate (Security): String-urile sunt folosite pentru URL-uri, conexiuni la DB, socket-uri de retea si user passwords. Daca erau mutabile, un atacator putea altera destinatia dupa verificare.\n3. Thread Safety: Fiind imutabile, instantele de String pot fi partajate intre multiple thread-uri fara sincronizare externa.\n4. HashCode Caching: Valoarea hash-ului este calculata o singura data si stocata in cache. Astfel, este o cheie ideala si extrem de rapida pentru HashMap/HashSet.',
    codeSnippet: `public final class String implements java.io.Serializable, Comparable<String>, CharSequence {
    // Array-ul intern este final si privat (in Java 9+ este byte[] cu compact strings)
    @Stable
    private final byte[] value;
    private int hash; // Cache pentru hashCode
}`,
    interviewTrap: 'Daca creezi String cu "new String(\\"abc\\")", se creeaza un obiect nou in Heap in plus fata de literalul din Pool. Foloseste mereu literali simpli.',
    keyTakeaway: 'Imutabilitatea garanteaza securitate, thread-safety fara lock-uri si performanta maxima in colectii hash.'
  },
  {
    id: 'java-core-03',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Comparable vs Comparator: Cand si cum le folosim?',
    question: 'Care este diferenta fundamentala dintre interfata Comparable si Comparator? Cand alegi una in locul celeilalte?',
    answer: 'Comparable ofera ordonarea naturala (Single Natural Ordering) a obiectului. Se implementeaza chiar in interiorul clasei respective si defineste metoda: int compareTo(T o).\n\nComparator ofera criterii de sortare multiple si externe (Custom Sorting Strategy). Nu modifica clasa tinta si defineste metoda: int compare(T o1, T o2). In Java 8+, Comparator ofera factory methods fluente precum Comparator.comparing().thenComparing().',
    codeSnippet: `// 1. Comparable (Ordonare naturala dupa ID):
public class Candidate implements Comparable<Candidate> {
    private Long id;
    private int experienceYears;
    @Override
    public int compareTo(Candidate other) {
        return this.id.compareTo(other.id);
    }
}

// 2. Comparator extern (dupa ani exp descrescator, apoi nume):
Comparator<Candidate> expComparator = Comparator
    .comparingInt(Candidate::getExperienceYears).reversed()
    .thenComparing(Candidate::getName);`,
    interviewTrap: 'La compare/compareTo, evita scaderea directa: (a - b) daca lucrezi cu intregi mari, deoarece poate aparea Integer Overflow. Foloseste mereu Integer.compare(a, b).',
    keyTakeaway: 'Comparable = o singura ordine nativa in clasa. Comparator = strategii nelimitate de sortare definite in afara clasei.'
  },
  {
    id: 'java-core-04',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Ce este si cum functioneaza Garbage Collector in JVM?',
    question: 'Explica ipoteza generationala (Weak Generational Hypothesis) si partitiile principale ale memoriei Heap in JVM (Eden, Survivor, Tenured/Old).',
    answer: 'JVM Heap este impartit conform Ipotezei Generationale (majoritatea obiectelor mor la scurt timp dupa creare):\n1. Young Generation: Contine Eden Space si doua Survivor Spaces (S0 si S1 / From si To). Noile obiecte se aloca in Eden. Cand Eden se umple, ruleaza un Minor GC (rapid, compacteaza obiectele vii in Survivor).\n2. Old (Tenured) Generation: Obiectele care supravietuiesc mai multor cicluri de GC (default 15 cicluri, prag controlat de -XX:MaxTenuringThreshold) sunt promovate in Old Gen.\n3. Metaspace (Off-Heap): Stocheaza metadata despre clase, bytecode si metode (a inlocuit PermGen din Java 8).',
    codeSnippet: `// JVM Heap Layout:
// [---------- Young Generation ----------] [--- Old / Tenured ---]
// [   Eden   ] [ Survivor S0 ] [ Survivor S1 ] [ Long-lived Objects ]
// Minor GC: curata Young Gen
// Major / Full GC: curata Old Gen (stop-the-world mai lung)`,
    interviewTrap: 'Metaspace nu este in Heap! Este alocat in memoria nativa a sistemului de operare si se extinde dinamic daca nu este restrictionat cu -XX:MaxMetaspaceSize.',
    keyTakeaway: 'Majoritatea alocarilor mor in Eden. GC-urile moderne (G1GC, ZGC) folosesc regiuni dinamice pentru a reduce timpii de pauza sub 1 milisecunda.'
  },

  // ==========================================
  // 2. SPRING BOOT & JPA / HIBERNATE
  // ==========================================
  {
    id: 'spring-01',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'De ce @Transactional apelat intern NU functioneaza?',
    question: 'Daca o metoda publica fara adnotari dintr-o clasa apeleaza o metoda @Transactional din aceeasi clasa, se deschide o tranzactie? De ce?',
    answer: 'NU, tranzactia NU se deschide! Spring gestioneaza tranzactiile prin Proxy Pattern (CGLIB sau JDK Dynamic Proxies). Cand un bean extern apeleaza metoda, apelul trece prin Proxy, care intercepteaza apelul, deschide tranzactia pe EntityManager si apoi deleaga executia.\n\nCand apelezi metoda interna direct din aceeasi clasa (this.method()), apelul ocoleste complet proxy-ul Spring, executandu-se pe instanta directa (raw instance). Ca urmare, interceptorul de tranzactie nu este niciodata invocat.',
    codeSnippet: `@Service
public class OrderService {
    // Apel extern:
    public void processOrder() {
        // ATENTIE: this.saveOrder() ocoleste proxy-ul!
        // Tranzactia NU va functiona!
        saveOrder(); 
    }

    @Transactional
    public void saveOrder() {
        orderRepo.save(new Order());
    }
}

// SOLUTIE: Muta metoda in alt serviciu dedicat sau injecteaza bean-ul prin self-injection / TransactionTemplate.`,
    interviewTrap: 'Aceasta intrebare se pune la 90% din interviurile Spring Boot. Daca raspunzi ca Spring intercepteaza apelurile private sau interne "magic", pici testul de arhitectura AOP.',
    keyTakeaway: 'Spring AOP functioneaza doar prin apeluri care trec prin Proxy-ul exterior al bean-ului.'
  },
  {
    id: 'spring-02',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Cum rezolvi problema N+1 Query in JPA / Hibernate?',
    question: 'Ce este problema N+1 in ORM si care sunt cele 3 solutii canonice pentru a o preveni in Spring Data JPA?',
    answer: 'Problema N+1 apare cand interoghezi o lista de N entitati parinte (1 query) si, la accesarea unei relatii Lazy (ex: getApplications()), Hibernate executa cate un query suplimentar pentru fiecare copil in parte (N query-uri separate). Rezultat: 1 + N interogari in baza de date.\n\nSolutii:\n1. JOIN FETCH in JPQL: Incarca parintele si copiii intr-un singur query cu SQL JOIN.\n2. @EntityGraph: Adnotare declarativa pe metoda de repository care instruieste JPA sa faca fetch join.\n3. @BatchSize(size = 25): Incarca copiii in batch-uri folosind clauza WHERE parent_id IN (?, ?, ...), reducand de la N la N/25 query-uri.',
    codeSnippet: `// 1. Solutie prin JPQL JOIN FETCH:
@Query("SELECT j FROM JobPosting j LEFT JOIN FETCH j.applications WHERE j.status = 'ACTIVE'")
List<JobPosting> findAllWithApplications();

// 2. Solutie prin @EntityGraph:
@EntityGraph(attributePaths = {"applications", "company"})
List<JobPosting> findByStatus(String status);`,
    interviewTrap: 'Setarea relatiei pe FetchType.EAGER NU rezolva problema N+1! Ba din contra, duce la executarea imediata a celor N interogari chiar si cand nu ai nevoie de copii.',
    keyTakeaway: 'Foloseste mereu FetchType.LAZY ca default, si incarca relatiile necesare punctual prin JOIN FETCH sau @EntityGraph.'
  },
  {
    id: 'spring-03',
    category: 'SPRING_JPA',
    difficulty: 'USOR',
    title: 'Ciclul de viata al unui Bean Spring (Bean Lifecycle)',
    question: 'Care sunt etapele principale prin care trece un Bean in ApplicationContext de la instantiere pana la distrugere?',
    answer: 'Etapele cheie ale Bean Lifecycle sunt:\n1. Instantiere: Crearea obiectului prin constructor.\n2. Populare proprietati: Dependency Injection (@Autowired).\n3. Aware Interfaces: Setarea BeanNameAware, BeanClassLoaderAware, ApplicationContextAware.\n4. BeanPostProcessor (Pre-Initialization): Metoda postProcessBeforeInitialization.\n5. Initializare: Apelarea metodei adnotate cu @PostConstruct sau dupa implementarea InitializingBean (afterPropertiesSet).\n6. BeanPostProcessor (Post-Initialization): Aici se creeaza PROXY-ul AOP (pentru @Transactional, @Async, Securitate).\n7. Bean este GATA de utilizare.\n8. Distrugere: Cand contextul se opreste, se apeleaza metodele @PreDestroy sau DisposableBean.',
    codeSnippet: `@Component
public class PaymentGateway {
    @PostConstruct
    public void init() {
        // Se executa DUPA ce toate dependintele au fost injectate
        System.out.println("Gateway initializat cu chei API");
    }

    @PreDestroy
    public void cleanup() {
        // Se executa inainte de oprirea containerului Spring
        System.out.println("Conexiuni socket inchise curat");
    }
}`,
    interviewTrap: 'Nu incerca sa accesezi dependinte injectate prin @Autowired in interiorul constructorului clasei daca folosesti field injection, deoarece ele sunt null in momentul apelului constructorului! Foloseste constructor injection.',
    keyTakeaway: 'Foloseste intotdeauna Constructor Injection pentru imutabilitate si testabilitate usoara.'
  },
  {
    id: 'spring-04',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Ce exceptii declanseaza Rollback automat in @Transactional?',
    question: 'Daca o metoda adnotata cu @Transactional arunca o exceptie de tip Checked (de ex: Exception sau IOException), se face rollback automat? Cum modifici acest comportament?',
    answer: 'NU se face rollback automat! In mod implicit (by default), Spring Transaction Manager face rollback DOAR pentru exceptii necontrolate (Unchecked Exceptions: RuntimeException si Error).\n\nExceptiile de tip Checked (derivate din Exception dar nu RuntimeException) sunt considerate conditii de business recuperabile, iar tranzactia va fi comisa (COMMIT) chiar daca exceptia a fost aruncata.\n\nPentru a forta rollback pe orice exceptie, trebuie sa specifici explicit: @Transactional(rollbackFor = Exception.class).',
    codeSnippet: `// 1. Gresit (Checked Exception NU face rollback by default):
@Transactional
public void processFile() throws IOException {
    repo.save(entity);
    throw new IOException("Eroare disc"); // Tranzactia face COMMIT!
}

// 2. Corect:
@Transactional(rollbackFor = {Exception.class, IOException.class})
public void processFileSafe() throws Exception {
    repo.save(entity);
    throw new IOException("Eroare disc"); // Tranzactia face ROLLBACK!
}`,
    interviewTrap: 'Daca prinzi exceptia cu try-catch si NU o rearunci sau nu marchezi tranzactia manual (TransactionAspectSupport.currentTransactionStatus().setRollbackOnly()), Spring considera ca ai gestionat-o si face COMMIT!',
    keyTakeaway: 'Specificati intotdeauna rollbackFor = Exception.class pe operatiuni financiare sau critice.'
  },

  // ==========================================
  // 3. SQL, INDECSI & POSTGRESQL
  // ==========================================
  {
    id: 'sql-01',
    category: 'SQL_DB',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza un Index B-Tree si cand NU il folosim?',
    question: 'Ce structura are un index B-Tree in PostgreSQL/MySQL, care este complexitatea de cautare si in ce situatii adaugarea unui index incetineste aplicatia?',
    answer: 'Un index B-Tree (Balanced Tree) pastreaza datele sortate intr-un arbore echilibrat multi-nod. Fiecare nod contine chei si pointeri catre nodurile copil, iar nodurile frunza contin pointeri catre randurile fizice din tabel (TID / Tuple ID).\n\nComplexitate: O(log N) pentru cautare, inserare si stergere.\n\nCand NU este recomandat un index:\n1. Tabele mici (sub 1.000 de randuri): Un Sequential Scan este mai rapid decat citirea nodurilor indexului.\n2. Coloane cu cardinalitate mica (low selectivity): De exemplu un boolean "is_active" sau "gender", unde 50% din randuri au aceeasi valoare.\n3. Tabele cu volum urias de scriere (WRITE-HEAVY): La fiecare INSERT / UPDATE / DELETE, toate indecsii asociati trebuie recalculati si rescrisi pe disc.',
    codeSnippet: `-- Creare index compus:
CREATE INDEX idx_jobs_status_created 
ON job_postings (status, created_at DESC);

-- Verificare plan de executie:
EXPLAIN ANALYZE 
SELECT * FROM job_postings 
WHERE status = 'ACTIVE' 
ORDER BY created_at DESC LIMIT 20;`,
    interviewTrap: 'Un index pe (colA, colB) poate fi folosit pentru interogari pe colA, sau (colA, colB), dar NU poate fi folosit daca filtrezi doar pe colB (Leftmost Prefix Rule)!',
    keyTakeaway: 'Indecsii accelereaza dramatic SELECT-urile dar penalizeaza operatiunile de INSERT/UPDATE.'
  },
  {
    id: 'sql-02',
    category: 'SQL_DB',
    difficulty: 'DIFICIL',
    title: 'Nivele de Izolare a Tranzactiilor (ACID Isolation Levels)',
    question: 'Numeste cele 4 nivele standard de izolare a tranzactiilor SQL si anomaliile pe care le previn (Dirty Read, Non-Repeatable Read, Phantom Read).',
    answer: 'Cele 4 nivele de izolare sunt (de la cel mai permisiv la cel mai strict):\n1. Read Uncommitted: Permite Dirty Reads (citirea de date modificate de alta tranzactie inca necomisa).\n2. Read Committed (Default in Postgres): Previne Dirty Reads. Permite Non-Repeatable Reads (daca recitesti acelasi rand in aceeasi tranzactie, poti gasi alte valori daca altcineva a dat COMMIT).\n3. Repeatable Read: Previne Dirty Reads si Non-Repeatable Reads prin MVCC (snapshot consistent). In Postgres previne si Phantom Reads standard.\n4. Serializable: Izolare perfecta, previne toate anomaliile prin serializare stricta (la detectarea unui conflict, una din tranzactii este avortata cu eroare de serializare).',
    codeSnippet: `-- In PostgreSQL, nivelul default este READ COMMITTED
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT balance FROM accounts WHERE user_id = 42;
-- Chiar daca alt proces actualizeaza contul si da COMMIT,
-- a doua citire va vedea exact aceeasi valoare din snapshot-ul initial!
SELECT balance FROM accounts WHERE user_id = 42;

COMMIT;`,
    interviewTrap: 'In PostgreSQL, nivelul Repeatable Read previne inclusiv Phantom Read-urile clasice datorita arhitecturii MVCC bazata pe snapshot-uri.',
    keyTakeaway: 'Cu cat nivelul de izolare e mai inalt, cu atat creste siguranta datelor, dar scade throughput-ul de concurenta.'
  },

  // ==========================================
  // 4. CONCURRENT & MULTITHREADING / JAVA 21
  // ==========================================
  {
    id: 'conc-01',
    category: 'CONCURRENCY',
    difficulty: 'DIFICIL',
    title: 'Virtual Threads in Java 21 vs Platform Threads (OS Threads)',
    question: 'Ce sunt Virtual Threads din Java 21 (Project Loom), cum difera de Platform Threads si cand este contraindicat sa le folosesti?',
    answer: 'Platform Threads sunt mapate 1:1 cu thread-urile sistemului de operare (OS Kernel). Ele sunt costisitoare: consuma ~1MB de memorie per stack, iar context switching-ul la nivel de kernel este lent (limita practica este de cateva mii de thread-uri).\n\nVirtual Threads sunt fire de executie foarte usoare gestionate de JVM (in spatiul utilizator), nu de kernel. Poti rula milioane de fire simultan cu consum minim de RAM (~cativ KB). Cand un Virtual Thread intalneste o operatie de blocare I/O (apel HTTP, interogare baza de date JDBC, citire fisier), JVM-ul il "demonteaza" de pe thread-ul fizic purtator (Carrier Thread) si monteaza un alt Virtual Thread gata de executie.\n\nCand NU le folosim: Pentru operatiuni intensive de CPU (calcul matematic pur, procesare video/imagini), deoarece acolo nu exista blocare I/O!',
    codeSnippet: `// 1. Creare executor cu Virtual Threads per task:
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            // Operatie I/O (ex: apel REST catre furnizor)
            Thread.sleep(Duration.ofSeconds(1));
            return "Rezultat " + i;
        });
    });
} // Auto-close asteapta terminarea tuturor task-urilor!`,
    interviewTrap: 'Atentie la "Thread Pinning": Daca un Virtual Thread apeleaza o operatie blocanta in interiorul unui bloc synchronized sau apeleaza metode native JNI, el ramane lipit (pinned) de Carrier Thread, blocand OS thread-ul. Solutie: Inlocuieste synchronized cu ReentrantLock!',
    keyTakeaway: 'Virtual Threads rezolva scalabilitatea pe operatiuni de retea si baze de date (I/O bound) fara complexitatea programarii reactive (WebFlux).'
  },
  {
    id: 'conc-02',
    category: 'CONCURRENCY',
    difficulty: 'MEDIU',
    title: 'volatile vs synchronized vs AtomicInteger in Java',
    question: 'Care este diferenta de garantie intre cuvintele cheie volatile, synchronized si clasele din java.util.concurrent.atomic?',
    answer: '1. volatile: Garanteaza doar VIZIBILITATEA intre thread-uri (citirile si scrierile se fac direct in memoria principala RAM, nu in CPU cache). Nu ofera atomicitate! Operatiunea count++ este formata din 3 pasi (read, update, write), deci va avea race conditions pe variabile volatile.\n\n2. synchronized: Garanteaza atat VIZIBILITATE cat si ATOMICITATE si EXCLUZIUNE MUTUALA. Doar un singur thread poate intra in sectiunea critica la un moment dat folosind monitorul de lock al obiectului.\n\n3. AtomicInteger / AtomicLong: Folosesc instructiuni hardware native CAS (Compare-And-Swap) fara lock-uri software blocante (Lock-Free Concurrency). Ofera performanta superioara fata de synchronized pentru contori si flag-uri concurente.',
    codeSnippet: `// 1. Volatile NU este atomic pentru incrementare:
private volatile int count = 0; // count++ produce pierderi de date!

// 2. AtomicInteger foloseste hardware CAS (Lock-Free):
private final AtomicInteger atomicCount = new AtomicInteger(0);
atomicCount.incrementAndGet(); // Thread-safe si foarte rapid!

// 3. Synchronized (Blocant):
public synchronized void increment() {
    count++;
}`,
    interviewTrap: 'Daca intervievatorul intreaba daca "volatile boolean flag = true;" este thread-safe pentru oprirea unui worker thread, raspunsul este DA, deoarece scrierea si citirea unei referinte/boolean este atomica.',
    keyTakeaway: 'Pentru contori si flag-uri simple: Atomics. Pentru logica complexa cu multiple stari: Lock/synchronized.'
  },

  // ==========================================
  // 5. SYSTEM DESIGN & REST API
  // ==========================================
  {
    id: 'sys-01',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Cum implementezi Idempotenta pe un API REST de Plati?',
    question: 'Daca o retea pica in timp ce utilizatorul plateste un abonament si clientul trimite un retry automat, cum previi debitarea dubla (Double Charge)?',
    answer: 'Solutia industriala canonica este folosirea unei "Idempotency Key" (un UUID unic generat de client pe tranzactie):\n1. Clientul genereaza un Idempotency-Key in header-ul HTTP (ex: Idempotency-Key: e8a7...).\n2. Backend-ul verifica in Redis sau baza de date daca aceasta cheie exista:\n   - Daca NU exista: Creeaza un lock atomic cu TTL (ex: SETNX in Redis cu status PENDING) si proceseaza plata la Stripe/Banca.\n   - Daca plata reuseste: Salveaza raspunsul final in cache asociat cheii si comite tranzactia.\n   - Daca cheia exista si are status COMPLETED: Returneaza direct raspunsul salvat anterior fara sa reexecute operatiunea de debitare!\n   - Daca are status PENDING: Returneaza HTTP 409 Conflict sau asteapta finalizarea.',
    codeSnippet: `// Verificare atomica in Redis / Spring Cache:
String key = "idempotency:" + idempotencyKey;
Boolean acquired = redisTemplate.opsForValue()
    .setIfAbsent(key, "PROCESSING", Duration.ofMinutes(5));

if (Boolean.FALSE.equals(acquired)) {
    // Tranzactia este deja in curs sau a fost finalizata
    return getCachedResponseOrThrowConflict(key);
}

try {
    PaymentResult result = paymentGateway.charge(order);
    redisTemplate.opsForValue().set(key, serialize(result), Duration.ofHours(24));
    return result;
} catch (Exception e) {
    redisTemplate.delete(key); // Elibereaza pe eroare tehnica
    throw e;
}`,
    interviewTrap: 'Multi candidati uita sa mentioneze TTL-ul (Time-to-Live) pe cheie. Daca serverul pica in mijlocul procesarii fara TTL, cheia ramane blocata vesnic!',
    keyTakeaway: 'Idempotency Keys + Lock-uri distribuite atomice in Redis garanteaza executia o singura data (Exactly-Once Semantics).'
  },
  {
    id: 'sys-02',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Cache-Aside Pattern cu Redis: Flow si Invalidation',
    question: 'Explica pas cu pas modelul Cache-Aside. Cum gestionezi cache misses, scrierile si cum eviti Cache Stampede?',
    answer: 'Cache-Aside (Lazy Loading) este cel mai popular pattern de caching:\n1. Flow Citire (Read):\n   - Aplicatia verifica mai intai Redis Cache dupa cheie.\n   - Cache Hit: Datele se returneaza instant.\n   - Cache Miss: Aplicatia citeste datele din PostgreSQL, scrie rezultatul in Redis (cu TTL expirat) si apoi il returneaza clientului.\n2. Flow Scriere (Write / Update):\n   - Aplicatia actualizeaza mai intai baza de date relationala (System of Record).\n   - Dupa commit-ul reusit, INVALIDAZA (sterge cheia din Redis cu DEL). Nu rescrie direct in cache pentru a evita race conditions.\n3. Cache Stampede: Cand o cheie foarte populara expira si mii de request-uri concurente lovesc baza de date simultan. Se previne prin Mutex Lock (doar primul thread face query-ul, ceilalti asteapta) sau refresh anticipat asincron.',
    codeSnippet: `@Service
public class JobService {
    @Cacheable(value = "jobs", key = "#id")
    public JobPostingDto getJob(UUID id) {
        // Se executa doar la CACHE MISS:
        return jobRepo.findById(id).map(mapper::toDto).orElseThrow();
    }

    @CacheEvict(value = "jobs", key = "#id")
    @Transactional
    public void updateJob(UUID id, JobUpdateDto dto) {
        // Actualizeaza DB si sterge automat cheia din Redis
        jobRepo.updateStatus(id, dto.getStatus());
    }
}`,
    interviewTrap: 'La actualizare: Niciodata nu face update in Redis inainte de DB. Daca tranzactia DB pica si face rollback, ramai cu date corupte (dirty data) in cache!',
    keyTakeaway: 'Scrie in DB, apoi sterge cheia din Cache. Seteaza intotdeauna un TTL pe chei.'
  },

  // ==========================================
  // 6. TESTING: JUNIT 5 & MOCKITO
  // ==========================================
  {
    id: 'test-01',
    category: 'TESTING',
    difficulty: 'USOR',
    title: '@Mock vs @InjectMocks vs @Spy in Mockito',
    question: 'Care este diferenta exacta intre adnotarile @Mock, @InjectMocks si @Spy in testele unitare cu Mockito?',
    answer: '1. @Mock: Creeaza un mock complet (obiect fals) al dependintei. Toate metodele sale returneaza valori default (null, 0, false, empty collection) daca nu sunt stub-uite explicit cu when().thenReturn().\n\n2. @InjectMocks: Creeaza instanta REALA a clasei pe care doresti sa o testezi (Class Under Test) si injecteaza automat in ea campurile adnotate cu @Mock sau @Spy.\n\n3. @Spy: Creeaza un "wrapper" peste o instanta reala a obiectului. Daca o metoda nu este stub-uita, se apeleaza implementarea REALA a metodei.',
    codeSnippet: `@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock
    private JobRepository jobRepository; // Dependinta mock-uita

    @Mock
    private NotificationService notificationService; // Dependinta mock-uita

    @InjectMocks
    private ApplicationService applicationService; // Instanta REALA testata

    @Test
    void testApplyToJob() {
        when(jobRepository.findById(any())).thenReturn(Optional.of(new JobPosting()));
        
        applicationService.apply(UUID.randomUUID(), "cv.pdf");

        verify(notificationService, times(1)).sendConfirmationEmail(any());
    }
}`,
    interviewTrap: 'Daca folosesti @Spy pe o metoda care arunca exceptie sau are efecte secundare si o stub-uiesti cu when(spy.doWork()).thenReturn(), metoda reala SE EXECUTA o data inainte de stub! Foloseste doReturn().when(spy).doWork() pentru spioni!',
    keyTakeaway: '@InjectMocks este pentru clasa testata. @Mock este pentru toate dependintele externe.'
  },
  {
    id: 'test-02',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'De ce folosim Testcontainers in locul bazei de date H2?',
    question: 'De ce tot mai multe companii renunta la baza de date in-memory H2 pentru testele de integrare in favoarea Testcontainers?',
    answer: 'Baza de date H2 are dialect diferit fata de motoarele de productie (PostgreSQL, MySQL):\n1. Incompatibilitati SQL: Functii specifice Postgres (ex: JSONB, vector embeddings cu pgvector, proceduri stocate, indecsi partiali sau GIN) NU ruleaza pe H2 sau au sintaxa complet diferita.\n2. Comportament tranzactional: Modul in care H2 gestioneaza lock-urile si nivelele de izolare nu reproduce conditiile reale de productie (poti avea teste verzi pe H2 care pica in productie).\n\nTestcontainers porneste un container Docker real cu PostgreSQL 16 la rularea suitei de teste, oferind un mediu 100% fidel productiei, cu izolare perfecta si stergere automata dupa teste.',
    codeSnippet: `@SpringBootTest
@Testcontainers
class JobIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
        .withDatabaseName("test_db")
        .withUsername("test")
        .withPassword("test");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
}`,
    interviewTrap: 'Multi candidati cred ca Testcontainers este lent. Folosind optiunea withReuse(true) sau singleton containers per test suite, pornirea containerului dureaza sub 1-2 secunde.',
    keyTakeaway: 'Testcontainers elimina sindromul "Functioneaza pe masina mea, dar a picat pe Postgres in productie".'
  }
];
