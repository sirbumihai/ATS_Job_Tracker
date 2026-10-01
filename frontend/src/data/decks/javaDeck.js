// Deck Masiv: Java Core, OOP, JVM Internals & Modern Java 21
// Preluat din: Baeldung, kgurcharan/java-interview-questions, DopplerHQ
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const JAVA_DECK = [
  {
    id: 'java-01',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Contractul equals() si hashCode() in Java',
    question: 'Ce stipuleaza contractul dintre metodele equals() si hashCode() din clasa Object? Ce problema grava apare daca suprascrii equals() dar nu si hashCode() intr-o entitate folosita in HashSet sau HashMap?',
    answer: 'Contractul stipuleaza doua reguli fundamentale:\n1. Daca doua obiecte sunt egale conform equals(), ele TREBUIE sa returneze acelasi hashCode().\n2. Daca doua obiecte au acelasi hashCode(), NU este obligatoriu sa fie egale (coliziune de hash).\n\nDaca suprascrii doar equals(): cand adaugi un obiect intr-un HashSet sau ca cheie intr-un HashMap, JVM calculeaza bucket-ul pe baza hashCode()-ului implicit (adresa din memorie). Daca cauti acelasi obiect logic (alt obiect cu aceleasi campuri), acesta va primi alt hash, va cauta in alt bucket si get(key) va returna NULL sau va introduce duplicate in HashSet!',
    codeSnippet: `public class Candidate {
    private Long id;
    private String email;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Candidate c)) return false;
        return Objects.equals(id, c.id) && Objects.equals(email, c.email);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, email); // OBLIGATORIU cand suprascrii equals!
    }
}`,
    interviewTrap: 'Campurile folosite la calculul hashCode() trebuie sa fie IMUTABILE. Daca modifici un camp dupa inserarea in HashSet, nu mai poti gasi niciodata obiectul (Memory Leak)!',
    keyTakeaway: 'Equals egal implica HashCode egal. Niciodata nu suprascrie doar una din cele doua metode.'
  },
  {
    id: 'java-02',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'De ce este String imutabil in Java si ce este Pool-ul?',
    question: 'De ce clasa String este declarata "final" si imutabila in Java? Ce este String Constant Pool si ce se intampla la executarea: String s = new String("test")?',
    answer: 'String este imutabil pentru 4 ratiuni majore:\n1. String Constant Pool (Memorie): Reutilizeaza secventele identice de caractere in Heap, economisind memorie masiva.\n2. Securitate: Parametrii de conexiune la retea, fisiere si DB sunt String-uri; daca erau mutabile, un atacator putea altera calea dupa validare.\n3. Thread-Safety: Pot fi partajate intre mii de fire concurente fara lock-uri sau sincronizari.\n4. Caching HashCode: Hash-ul se calculeaza o singura data la initializare si se retine in cache.\n\nLa apelul new String("test"): Se creeaza DOI obiecte daca "test" nu era deja in Pool: unul in String Constant Pool si unul NOU distinct pe Heap-ul general.',
    codeSnippet: `String s1 = "job"; // Referinta catre String Pool
String s2 = "job"; // Aceeasi referinta din Pool
System.out.println(s1 == s2); // TRUE

String s3 = new String("job"); // Aloca obiect nou separat in Heap
System.out.println(s1 == s3); // FALSE!
System.out.println(s1.equals(s3)); // TRUE
System.out.println(s1 == s3.intern()); // TRUE (intern aduce referinta din Pool)`,
    interviewTrap: 'Operatorul == compara adresele de memorie, in timp ce .equals() compara continutul caracterelor. Nu folosi == pentru String-uri!',
    keyTakeaway: 'Foloseste intotdeauna literali ("abc") in loc de new String(), si StringBuilder pentru concatenari in bucle.'
  },
  {
    id: 'java-03',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza HashMap intern in Java?',
    question: 'Explica arhitectura interna a unui HashMap in Java 8+: structura de date, calculul bucket-ului, gestionarea coliziunilor si cand se transforma lista inlantuita in arbore.',
    answer: 'HashMap foloseste un array de bucket-uri (Node<K,V>[] table). Indexul se calculeaza prin formula: index = (n - 1) & hash(key.hashCode()). In caz de coliziune, elementele se adauga initial intr-o lista simplu inlantuita. Daca numarul de elemente dintr-un bucket depaseste pragul de 8 (TREEIFY_THRESHOLD) si capacitatea totala a array-ului este cel putin 64, lista se converteste intr-un arbore rosu-negru (Red-Black Tree, TreeNode), reducand complexitatea de la O(n) la O(log n). Cand numarul scade sub 6, arborele redevine lista (UNTREEIFY_THRESHOLD).',
    codeSnippet: `static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
int index = (table.length - 1) & hash;

// Praguri critice in java.util.HashMap:
static final int TREEIFY_THRESHOLD = 8;
static final int UNTREEIFY_THRESHOLD = 6;
static final int MIN_TREEIFY_CAPACITY = 64;`,
    interviewTrap: 'Pentru transformarea in Red-Black Tree este obligatoriu ca si capacitatea totala a tabelei sa fie >= 64. Daca este mai mica, se face resize (dublare), NU treeify!',
    keyTakeaway: 'Complexitate: O(1) amortizat pentru get/put. O(log n) in caz de coliziuni masive in acelasi bucket.'
  },
  {
    id: 'java-04',
    category: 'JAVA',
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
    keyTakeaway: 'Majoritatea alocarilor mor in Eden. GC-urile moderne (G1GC, ZGC) folosesc regiuni dinamice pentru a reduce timpii de pauza sub 1ms.'
  },
  {
    id: 'java-05',
    category: 'JAVA',
    difficulty: 'DIFICIL',
    title: 'Virtual Threads in Java 21 vs Platform Threads (OS Threads)',
    question: 'Ce sunt Virtual Threads din Java 21 (Project Loom), cum difera de Platform Threads si cand este contraindicat sa le folosesti?',
    answer: 'Platform Threads sunt mapate 1:1 cu thread-urile sistemului de operare (OS Kernel). Ele sunt costisitoare: consuma ~1MB de memorie per stack, iar context switching-ul la nivel de kernel este lent (limita practica este de cateva mii de thread-uri).\n\nVirtual Threads sunt fire de executie foarte usoare gestionate de JVM (in spatiul utilizator), nu de kernel. Poti rula milioane de fire simultan cu consum minim de RAM (~cativ KB). Cand un Virtual Thread intalneste o operatie de blocare I/O (apel HTTP, interogare baza de date JDBC, citire fisier), JVM-ul il "demonteaza" de pe thread-ul fizic purtator (Carrier Thread) si monteaza un alt Virtual Thread gata de executie.\n\nCand NU le folosim: Pentru operatiuni intensive de CPU (calcul matematic pur, procesare video/imagini), deoarece acolo nu exista blocare I/O!',
    codeSnippet: `try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return "Rezultat " + i;
        });
    });
} // Auto-close asteapta terminarea tuturor task-urilor!`,
    interviewTrap: 'Daca un Virtual Thread apeleaza o operatie blocanta in interiorul unui bloc synchronized sau apeluri native JNI, apare Thread Pinning (ramane lipit de Carrier Thread). Inlocuieste synchronized cu ReentrantLock!',
    keyTakeaway: 'Virtual Threads rezolva scalabilitatea pe operatiuni I/O bound (retea, baze de date) fara complexitatea programarii reactive.'
  },
  {
    id: 'java-06',
    category: 'JAVA',
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
public synchronized void increment() { count++; }`,
    interviewTrap: 'Daca variabila este doar citita si scrisa printr-un flag boolean (ex: volatile boolean running = true), volatile este thread-safe fara lock-uri.',
    keyTakeaway: 'Pentru contori si flag-uri simple: Atomics. Pentru logica complexa cu multiple stari: Lock/synchronized.'
  },
  {
    id: 'java-07',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Interfata vs Clasa Abstracta in Java modern (Java 8-21)',
    question: 'Cum s-au schimbat diferentele dintre Interfete si Clase Abstracte odata cu introducerea metodelor default, statice si private in interfete? Cand alegi una in locul celeilalte?',
    answer: 'Odata cu Java 8 (default & static methods) si Java 9 (private methods), interfetele pot avea implementari de cod.\n\nDiferente ramase:\n1. State (Stare interna): Interfetele NU pot stoca stare (variabile de instanta); au doar constante publice statice finale. O clasa abstracta poate avea stare, campuri private si constructori.\n2. Mostenire Multipla: O clasa poate implementa oricate interfete, dar poate extinde o singura clasa abstracta.\n3. Constructor: O clasa abstracta are constructor apelat la instantierea copilului; o interfata nu are constructor.\n\nCand alegi: Clasa abstracta pentru stare partajata si cod intern comun intr-o ierarhie stransa; Interfata pentru a defini un contract de capabilitate (Comparable, AutoCloseable) intre clase necorelate.',
    codeSnippet: `public interface Auditable {
    default void logAudit() {
        logInternal("Actiune inregistrata la " + Instant.now());
    }
    private void logInternal(String msg) {
        System.out.println("[AUDIT] " + msg);
    }
}`,
    interviewTrap: 'Daca o clasa implementeaza doua interfete care au aceeasi metoda default (Diamond Problem), compilatorul da eroare pana cand clasa suprascrie metoda si alege InterfaceA.super.method().',
    keyTakeaway: 'Interfata = ce stie sa faca (contract); Clasa abstracta = ce este (identitate si stare).'
  },
  {
    id: 'java-08',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'final vs finally vs finalize() in Java',
    question: 'Explica distinctia clara dintre cuvintele cheie final, blocul finally si metoda finalize() din Java.',
    answer: '1. final (Cuvant cheie modifier):\n   - Variabila: Valoarea devine constanta si nu mai poate fi reasignata.\n   - Metoda: Nu mai poate fi suprascrisa (overridden) in clasele derivate.\n   - Clasa: Nu mai poate fi mostenita (ex: clasa String sau Integer).\n\n2. finally (Bloc de control al fluxului):\n   - Se asociaza cu try-catch si se executa INTOTDEAUNA, indiferent daca se arunca o exceptie sau exista return in try/catch.\n   - Folosit pentru eliberarea resurselor.\n   - Nu se executa doar la System.exit(0) sau cadere de JVM.\n\n3. finalize() (Metoda din Object): Deprecated din Java 9 si eliminata treptat; nu te baza niciodata pe ea!',
    codeSnippet: `final int MAX_RETRIES = 3;

try {
    process();
    return true; // finally TOT se executa inainte de return!
} catch (Exception e) {
    log.error(e);
} finally {
    cleanup(); // Se executa garantat
}`,
    interviewTrap: 'Daca pui return si in try si in finally, valoarea din finally va suprascrie valoarea din try!',
    keyTakeaway: 'Foloseste try-with-resources in loc de blocuri finally manuale pentru clase AutoCloseable.'
  },
  {
    id: 'java-09',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Integer Cache (-128 la 127) si Autoboxing',
    question: 'Ce afiseaza codul: Integer a = 127; Integer b = 127; System.out.println(a == b); si ce afiseaza daca valoarea este 128? De ce?',
    answer: 'Pentru 127 va afisa TRUE, iar pentru 128 va afisa FALSE!\n\nExplicatie: Java implementeaza un Integer Cache pentru valorile cuprinse intre -128 si 127 (conform JLS). La autoboxing (Integer.valueOf(127)), JVM returneaza aceeasi instanta cached din array-ul intern IntegerCache.cache.\n\nPentru 128, valoarea depaseste intervalul default de caching, deci se aloca doua instante complet noi pe Heap. Operatorul == compara adresele de memorie, deci va returna false!',
    codeSnippet: `Integer a = 127;
Integer b = 127;
System.out.println(a == b); // TRUE (acelasi obiect din cache)

Integer x = 128;
Integer y = 128;
System.out.println(x == y); // FALSE (doua instante diferite pe Heap)
System.out.println(x.equals(y)); // TRUE (compara valorile primitive)`,
    interviewTrap: 'Limita superioara (127) poate fi extinsa prin parametrul JVM: -XX:AutoBoxCacheMax=<size>.',
    keyTakeaway: 'Nu folosi == pentru compararea wrapper-elor (Integer, Long, Double). Foloseste mereu .equals().'
  },
  {
    id: 'java-10',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Ce sunt Java Records (introduse in Java 16/21)?',
    question: 'Ce este un Record in Java modern, ce cod genereaza automat compilatorul si cand il folosesti in loc de o clasa DTO standard sau Lombok @Data?',
    answer: 'Un Record este o clasa speciala imutabila de tip "data carrier" (purtatoare de date transparente).\n\nCe genereaza automat compilatorul:\n1. Campuri private final pentru fiecare componenta din header.\n2. Constructor canonic cu toti parametrii.\n3. Getters cu numele campului (ex: id(), email() in loc de getId()).\n4. Implementare corecta pentru equals() si hashCode() bazata pe toate campurile.\n5. Metoda toString() formatata clar.\n\nCand le folosim: Ideale pentru DTO-uri REST, chei compuse de cache, proiectii de baze de date si mesaje de coada. Sunt integrate nativ cu Pattern Matching in Java 21.',
    codeSnippet: `public record JobSummaryDto(Long id, String title, String company, double salary) {
    public JobSummaryDto {
        if (salary < 0) throw new IllegalArgumentException("Salariul nu poate fi negativ");
    }
}

JobSummaryDto dto = new JobSummaryDto(1L, "Java Dev", "Tech Corp", 3500.0);
System.out.println(dto.title()); // Getter-ul nu are prefixul "get"`,
    interviewTrap: 'Un Record nu poate extinde o alta clasa (deoarece extinde deja implicit java.lang.Record). Nu este potrivit ca entitate JPA/Hibernate cu relatii Lazy!',
    keyTakeaway: 'Records elimina codul boilerplate pentru DTO-uri si garanteaza imutabilitate garantata.'
  },
  {
    id: 'java-11',
    category: 'JAVA',
    difficulty: 'DIFICIL',
    title: 'Ce este ThreadLocal si de ce provoaca Memory Leaks in Tomcat/Spring?',
    question: 'Ce este ThreadLocal in Java, la ce este folosit (ex: SecurityContext, Tranzactii) si de ce uitarea apelului threadLocal.remove() provoaca Memory Leaks in servere de aplicatii?',
    answer: 'ThreadLocal ofera variabile izolate la nivel de fir de executie (Thread-Confined State). Fiecare thread detine propria sa copie independenta a variabilei, accesibila global fara a fi trimisa ca parametru prin toate metodele.\n\nUtilizari: SecurityContextHolder, TransactionSynchronizationManager.\n\nDe ce provoaca Memory Leaks:\nServerele web (Tomcat) folosesc un Thread Pool (firele nu mor dupa request, ci se recicleaza). Daca nu apelezi ThreadLocal.remove():\n1. Obiectele din ThreadLocal raman blocate in memorie si nu pot fi curatate de GC.\n2. Urmatorul request HTTP pe acelasi thread va vedea datele utilizatorului anterior (vulnerabilitate de securitate)!',
    codeSnippet: `public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    public static void setTenant(String tenant) { CURRENT_TENANT.set(tenant); }
    public static String getTenant() { return CURRENT_TENANT.get(); }
    public static void clear() { CURRENT_TENANT.remove(); } // OBLIGATORIU in finally!
}`,
    interviewTrap: 'Cheile din ThreadLocalMap sunt WeakReferences, dar valorile sunt StrongReferences. Daca thread-ul traieste mult in pool, valorile raman blocate.',
    keyTakeaway: 'Apeleaza intotdeauna threadLocal.remove() intr-un bloc finally sau Spring HandlerInterceptor.'
  },
  {
    id: 'java-12',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'CompletableFuture: Rularea si combinarea de operatii asincrone',
    question: 'Cum rulezi doua apeluri API externe in paralel si combini rezultatele folosind CompletableFuture in Java 8+?',
    answer: 'CompletableFuture permite programarea asincrona functionala si non-blocanta:\n1. supplyAsync(): Lanseaza operatia asincron pe un executor.\n2. thenCombine(): Uneste ambele rezultate cand ambele futures s-au terminat cu succes.\n3. allOf(): Asteapta terminarea a N task-uri paralele.\n4. exceptionally(): Ofera o valoare de fallback in caz de eroare.',
    codeSnippet: `CompletableFuture<UserDto> userFuture = CompletableFuture.supplyAsync(() -> userService.getUser(id));
CompletableFuture<List<JobDto>> jobsFuture = CompletableFuture.supplyAsync(() -> jobService.getRecommendedJobs(id));

CompletableFuture<DashboardDto> dashboard = userFuture
    .thenCombine(jobsFuture, (user, jobs) -> new DashboardDto(user, jobs))
    .exceptionally(ex -> DashboardDto.empty());

DashboardDto result = dashboard.join();`,
    interviewTrap: 'Daca nu specifici un Executor personalizat, supplyAsync foloseste ForkJoinPool.commonPool. Daca ai apeluri I/O blocante, vei epuiza thread-urile din pool!',
    keyTakeaway: 'Trimite intotdeauna un ExecutorService dedicat cu Thread Pool optimizat ca parametru in supplyAsync().'
  },
  {
    id: 'java-13',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Deadlock: Conditiile de aparitie si Prevenirea in Java',
    question: 'Ce este un Deadlock intre doua thread-uri si cum se poate preveni simplu la nivel de cod aplicativ?',
    answer: 'Deadlock-ul apare cand doua thread-uri se blocheaza reciproc: Thread 1 detine Lock A si asteapta Lock B, iar Thread 2 detine Lock B si asteapta Lock A.\n\nCum se previne:\n1. Lock Ordering (Cea mai buna metoda): Toate thread-urile din sistem cer lock-urile in aceeasi ordine stricta (ex: dupa ID crescator).\n2. tryLock() cu Timeout din ReentrantLock: Daca nu primeste lock-ul in X secunde, elibereaza resursele si reincearca.\n3. Detectare: jstack <pid> identifica instant thread-urile blocate.',
    codeSnippet: `public void transferMoney(Account from, Account to, BigDecimal amount) {
    Account firstLock = from.getId() < to.getId() ? from : to;
    Account secondLock = from.getId() < to.getId() ? to : from;

    synchronized (firstLock) {
        synchronized (secondLock) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}`,
    interviewTrap: 'Fara ordonare dupa ID, cand A trimite bani lui B si concomitent B trimite bani lui A, apare Deadlock instant.',
    keyTakeaway: 'Ordoneaza intotdeauna achizitia lock-urilor pentru a elimina bucla circulara de asteptare.'
  },
  {
    id: 'java-14',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Polimorfism Static vs Dinamic si Virtual Method Table (vtable)',
    question: 'Care este diferenta dintre Polimorfismul la compilare (Overloading) si cel la executie (Overriding)? Cum rezolva JVM-ul apelul metodei suprascrise la runtime?',
    answer: '1. Overloading (Static): Rezolvat la compilare pe baza tipurilor si numarului de parametri.\n2. Overriding (Dinamic): Rezolvat la runtime prin Dynamic Dispatch. JVM asociaza fiecarei clase o Virtual Method Table (vtable) cu pointeri catre adresele metodelor. Cand o clasa suprascrie o metoda, intrarea din vtable arata spre codul copilului. La runtime, JVM citeste tipul real de pe Heap si apeleaza direct adresa din vtable.',
    codeSnippet: `Parent p = new Child();
p.print(); // Dynamic Dispatch prin vtable apeleaza Child.print()`,
    interviewTrap: 'Metodele private, static si final nu folosesc vtable; ele sunt legate static la compilare deoarece nu pot fi suprascrise.',
    keyTakeaway: 'Overloading = rezolvat la compilare; Overriding = rezolvat la runtime prin vtable-ul instantei din Heap.'
  },
  {
    id: 'java-15',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'try-with-resources si Suppressed Exceptions',
    question: 'Cum functioneaza blocul try-with-resources introdus in Java 7 si ce se intampla cand atat codul din try cat si metoda close() arunca exceptii?',
    answer: 'Inchide automat orice resursa care implementeaza java.lang.AutoCloseable la finalul blocului. In vechiul try-catch-finally, exceptia din finally o ascundea pe cea din try. In try-with-resources, exceptia din try ramane Primary Exception, iar cea din close() este atasata ca Suppressed Exception (accesibila prin ex.getSuppressed()).',
    codeSnippet: `try (Connection conn = ds.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.executeQuery();
} catch (SQLException e) {
    for (Throwable supp : e.getSuppressed()) {
        System.err.println("Eroare inchidere: " + supp.getMessage());
    }
}`,
    interviewTrap: 'Resursele sunt inchise in ORDINE INVERSA declararii lor (LIFO). In exemplul de mai sus, ps este inchis primul, apoi conn.',
    keyTakeaway: 'Foloseste intotdeauna try-with-resources pentru orice conexiune JDBC, socket sau stream.'
  }
];
