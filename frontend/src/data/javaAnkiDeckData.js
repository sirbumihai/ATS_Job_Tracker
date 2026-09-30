// Data set complet si masiv de Flashcards stil Anki pentru Pregatire Interviu Tehnic Java 2026
// Preluat si adaptat dupa cele mai frecvente intrebari de pe Baeldung, GitHub Awesome Interviews,
// LeetCode Discuss si interviurile reale din piata IT din Romania & Europa.
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const JAVA_ANKI_CATEGORIES = [
  { id: 'ALL', label: 'Toate Cardurile', icon: 'Layers' },
  { id: 'JAVA_CORE', label: 'Java Core & OOP', icon: 'Coffee', badgeColor: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'COLLECTIONS', label: 'Collections & DS', icon: 'Boxes', badgeColor: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'SPRING_JPA', label: 'Spring Boot & JPA', icon: 'Leaf', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'SQL_DB', label: 'SQL, Indecsi & Postgres', icon: 'Database', badgeColor: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'CONCURRENCY', label: 'Multithreading & Java 21', icon: 'Cpu', badgeColor: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'SYSTEM_DESIGN', label: 'System Design & REST', icon: 'Server', badgeColor: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'TESTING', label: 'Testing (JUnit & Mockito)', icon: 'CheckCircle', badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200' }
];

export const JAVA_ANKI_CARDS = [
  // ==========================================
  // 1. JAVA CORE & OOP DEEP DIVE
  // ==========================================
  {
    id: 'core-01',
    category: 'JAVA_CORE',
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
    interviewTrap: 'Multi candidati uita ca campurile folosite la calculul hashCode() trebuie sa fie IMUTABILE. Daca modifici un camp dupa inserarea in HashSet, nu mai poti gasi niciodata obiectul (Memory Leak)!',
    keyTakeaway: 'Equals egal implica HashCode egal. Niciodata nu suprascrie doar una din cele doua metode.'
  },
  {
    id: 'core-02',
    category: 'JAVA_CORE',
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
    interviewTrap: 'Operatorul == compara adresele de memorie, in timp ce .equals() compara continutul caracterelor. La interviu nu folosi niciodata == pentru comparat String-uri!',
    keyTakeaway: 'Foloseste intotdeauna literali ("abc") in loc de new String(), si StringBuilder pentru concatenari in bucle.'
  },
  {
    id: 'core-03',
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
    id: 'core-04',
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
  {
    id: 'core-05',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Interfata vs Clasa Abstracta in Java modern (Java 8-21)',
    question: 'Cum s-au schimbat diferentele dintre Interfete si Clase Abstracte odata cu introducerea metodelor default, statice si private in interfete? Cand alegi una in locul celeilalte?',
    answer: 'Odata cu Java 8 (default & static methods) si Java 9 (private methods), interfetele pot avea implementari de cod.\n\nDiferente ramase:\n1. State (Stare interna): Interfetele NU pot stoca stare (variabile de instanta); au doar constante publice statice finale (public static final). O clasa abstracta poate avea stare, campuri private, protected si constructori.\n2. Mostenire Multipla: O clasa poate implementa oricate interfete (implements A, B, C), dar poate extinde o singura clasa abstracta (extends AbstractClass).\n3. Constructor: O clasa abstracta are constructor apelat la instantierea copilului; o interfata nu are constructor.\n\nCand alegi:\n- Clasa abstracta: Cand ai cod comun si STARE interna partajata intr-o ierarhie stransa de obiecte (ex: AbstractJobTracker cu timestamps).\n- Interfata: Cand definesti un contract de comportament (capability) pentru clase complet nelegate (ex: Comparable, AutoCloseable, Exportable).',
    codeSnippet: `public interface Auditable {
    // Metoda default cu implementare in interfata:
    default void logAudit() {
        logInternal("Actiune inregistrata la " + Instant.now());
    }
    // Java 9: metoda privata pentru reutilizare cod intern:
    private void logInternal(String msg) {
        System.out.println("[AUDIT] " + msg);
    }
}`,
    interviewTrap: 'Daca o clasa implementeaza doua interfete care au amandoua aceeasi metoda default (Diamond Problem), compilatorul da eroare pana cand clasa suprascrie explicit metoda si alege care interfata sa o foloseasca (InterfaceA.super.method()).',
    keyTakeaway: 'Interfetele definesc "ce stie sa faca" (contract/comportament), iar clasele abstracte definesc "ce este" (identitate si stare partajata).'
  },
  {
    id: 'core-06',
    category: 'JAVA_CORE',
    difficulty: 'USOR',
    title: 'final vs finally vs finalize() in Java',
    question: 'Explica distinctia clara dintre cuvintele cheie final, blocul finally si metoda finalize() din Java.',
    answer: '1. final (Cuvant cheie modifier):\n   - Variabila: Valoarea devine constanta si nu mai poate fi reasignata.\n   - Metoda: Nu mai poate fi suprascrisa (overridden) in clasele derivate.\n   - Clasa: Nu mai poate fi mostenita (ex: clasa String sau Integer).\n\n2. finally (Bloc de control al fluxului):\n   - Se asociaza cu try-catch si se executa INTOTDEAUNA, indiferent daca se arunca o exceptie sau daca exista return in try/catch.\n   - Folosit pentru eliberarea resurselor (inchidere conexiuni, fisiere).\n   - Singurele cazuri cand NU se executa: apel System.exit(0) sau cadere de JVM / curent electric.\n\n3. finalize() (Metoda din Object):\n   - Apelata candva de GC inainte de eliberarea memoriei. Este DEPRECATED din Java 9 si eliminata treptat; nu te baza niciodata pe ea!',
    codeSnippet: `final int MAX_RETRIES = 3;

try {
    process();
    return true; // finally TOT se va executa inainte de return!
} catch (Exception e) {
    log.error(e);
} finally {
    cleanup(); // Se executa garantat
}`,
    interviewTrap: 'Daca pui "return" atat in blocul try cat si in blocul finally, valoarea returnata din FINALLY va suprascrie valoarea din try! Evita return-ul in finally.',
    keyTakeaway: 'Foloseste try-with-resources in loc de blocuri finally manuale pentru clasele care implementeaza AutoCloseable.'
  },
  {
    id: 'core-07',
    category: 'JAVA_CORE',
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
System.out.println(x.equals(y)); // TRUE (compara valorile int primitive)`,
    interviewTrap: 'Aceasta este o intrebare clasica de capcana la interviuri. Limita superioara (127) poate fi extinsa prin parametrul JVM: -XX:AutoBoxCacheMax=<size>.',
    keyTakeaway: 'Nu folosi niciodata operatorul == pentru compararea wrapper-elor (Integer, Long, Double). Foloseste mereu .equals() sau primitive simple (int).'
  },
  {
    id: 'core-08',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Generics si fenomenul de Type Erasure',
    question: 'Ce este Type Erasure in Java si ce se intampla cu tipurile generice (ex: List<String> vs List<Integer>) la compilare si in timpul rularii (runtime)?',
    answer: 'Generics au fost adaugate in Java 5 cu cerinta de compatibilitate retroactiva (backward compatibility) cu versiunile vechi.\n\nType Erasure inseamna ca toate informatiile despre tipurile generice din parametri (<T>, <String>) sunt verificate la COMPILARE si apoi STERSE din bytecode. La runtime, List<String> si List<Integer> devin ambele clasa simpla List (cu elemente de tip Object sau bounded type-ul superior).\n\nConsecinte practice:\n1. Nu poti face new T() sau new T[10].\n2. Nu poti face instanceof List<String> (doar instanceof List<?>).\n3. Nu poti avea metode supraincarcate cu aceeasi semnatura dupa stergere (ex: void process(List<String> l) si void process(List<Integer> l) NU compileaza impreuna!).',
    codeSnippet: `List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();

// La runtime, ambele apartin exact aceleiasi clase:
System.out.println(list1.getClass() == list2.getClass()); // TRUE!`,
    interviewTrap: 'Daca ai nevoie sa afli tipul generic la runtime (de exemplu la deserializare JSON in Jackson/Spring), se foloseste tehnica TypeReference sau Super Type Tokens.',
    keyTakeaway: 'Generics asigura siguranta tipurilor la compilare (Compile-time Type Safety) fara overhead de memorie la runtime.'
  },
  {
    id: 'core-09',
    category: 'JAVA_CORE',
    difficulty: 'USOR',
    title: 'Checked vs Unchecked Exceptions in Java',
    question: 'Care este diferenta dintre Checked Exceptions si Unchecked Exceptions? Care mostenesc direct Exception si care mostenesc RuntimeException?',
    answer: '1. Checked Exceptions (Mostenesc direct Exception dar NU RuntimeException):\n   - Sunt verificate la compilare. Metoda este OBLIGATA sa le prinda (try-catch) sau sa le declare in semnatura (throws IOException).\n   - Reprezinta conditii anormale dar previzibile din exterior (ex: FileNotFoundException, SQLException).\n\n2. Unchecked Exceptions (Mostenesc RuntimeException sau Error):\n   - Nu sunt verificate la compilare.\n   - Reprezinta de obicei bug-uri de programare sau erori logice ce nu pot fi recuperate curat la runtime (ex: NullPointerException, IllegalArgumentException, IndexOutOfBoundsException).\n   - Tranzactiile Spring Boot fac ROLLBACK automat doar pentru Unchecked Exceptions!',
    codeSnippet: `// Checked: compilatorul te obliga sa o declari sau tratezi
public void readFile() throws IOException {
    throw new IOException("Fisier inexistent");
}

// Unchecked: eroare de programare, nu trebuie declarata in throws
public void calculate(int val) {
    if (val < 0) {
        throw new IllegalArgumentException("Valoarea nu poate fi negativa");
    }
}`,
    interviewTrap: 'Error (ex: OutOfMemoryError, StackOverflowError) este de asemenea Unchecked, dar reprezinta defectiuni catastrofale ale JVM-ului; nu incerca niciodata sa prinzi Error cu try-catch!',
    keyTakeaway: 'In dezvoltarea moderna cu Spring Boot, majoritatea framework-urilor mapeaza exceptiile de baze de date in Unchecked Exceptions (ex: DataAccessException).'
  },
  {
    id: 'core-10',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Ce sunt Java Records (introduse in Java 16/21)?',
    question: 'Ce este un Record in Java modern, ce cod genereaza automat compilatorul si cand il folosesti in loc de o clasa DTO standard sau Lombok @Data?',
    answer: 'Un Record este o clasa speciala imutabila de tip "data carrier" (purtatoare de date transparente).\n\nCe genereaza automat compilatorul:\n1. Campuri private final pentru fiecare componenta din header.\n2. Constructor canonic cu toti parametrii.\n3. Getters cu numele campului (ex: id(), email() in loc de getId()).\n4. Implementare corecta pentru equals() si hashCode() bazata pe toate campurile.\n5. Metoda toString() formatata clar.\n\nCand le folosim: Ideale pentru DTO-uri REST, chei compuse de cache, proiectii de baze de date si mesaje de coada. Nu au nevoie de librarii externe (Lombok) si sunt integrate nativ cu Pattern Matching in Java 21.',
    codeSnippet: `// Declarare intr-o singura linie:
public record JobSummaryDto(Long id, String title, String company, double salary) {
    // Constructor compact pentru validari (fara paranteze):
    public JobSummaryDto {
        if (salary < 0) throw new IllegalArgumentException("Salariul nu poate fi negativ");
    }
}

// Utilizare:
JobSummaryDto dto = new JobSummaryDto(1L, "Java Dev", "Tech Corp", 3500.0);
System.out.println(dto.title()); // Getter-ul nu are prefixul "get"`,
    interviewTrap: 'Un Record NU poate extinde o alta clasa (deoarece extinde deja implicit java.lang.Record), dar poate implementa oricate interfete. Nu este potrivit ca entitate JPA/Hibernate cu relatii Lazy!',
    keyTakeaway: 'Records elimina sute de linii de cod boilerplate pentru DTO-uri si garanteaza imutabilitate garantata la nivel de bytecode.'
  },
  {
    id: 'core-11',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Cum apar Memory Leaks in Java daca avem Garbage Collector?',
    question: 'Cum este posibil sa ai o scurgere de memorie (Memory Leak / OutOfMemoryError) intr-un limbaj cu Garbage Collection automat ca Java? Da 3 exemple concrete.',
    answer: 'Un Memory Leak in Java apare cand obiecte care nu mai sunt necesare aplicatiei raman referentiate direct sau indirect dintr-un GC Root (obiecte vii: thread-uri active, variabile statice, stive de apel). GC-ul nu poate sterge un obiect cat timp exista o referinta valida catre el.\n\n3 Cauze clasice:\n1. Colectii Statice Nesterse: O lista sau un map static (ex: public static List<Job> cache = new ArrayList<>()) in care se adauga continuu date fara evacuare sau limita.\n2. Resurse Neinchise: Conexiuni JDBC, FileInputStream, socket-uri de retea lasate deschise tin blocate buffere native in memorie.\n3. Suprascrierea gresita a equals/hashCode in chei de HashSet/Map: Daca cheia este mutata, intrarea devine "fantoma" si nu mai poate fi gasita sau stearsa.',
    codeSnippet: `// 1. Exemplu clasic de memory leak cu colectie statica:
public class CacheService {
    // Colectia statica traieste pe toata durata aplicatiei!
    private static final Map<String, Object> memoryHog = new HashMap<>();

    public void cacheUser(String token, Object data) {
        memoryHog.put(token, data); // Daca nu expira niciodata -> OutOfMemoryError!
    }
}`,
    interviewTrap: 'Inner classes non-statice retin o referinta ascunsa catre instanta clasei parinte (OuterClass.this). Daca instanta interna supravietuieste, parintele nu poate fi curatat de GC!',
    keyTakeaway: 'Foloseste WeakReference / SoftReference, librarii de caching cu TTL (Caffeine, Redis) si inspecteaza heap dump-ul cu Eclipse MAT sau VisualVM.'
  },
  {
    id: 'core-12',
    category: 'JAVA_CORE',
    difficulty: 'USOR',
    title: 'De ce folosim BigDecimal si nu double pentru bani?',
    question: 'De ce nu trebuie NICIODATA sa folosesti tipurile primitive float sau double pentru calcule financiare, salarii sau tranzactii cu bani?',
    answer: 'Tipurile float si double sunt numere in virgula mobila bazate pe standardul binar IEEE 754. Ele nu pot reprezenta cu precizie exacta fractiile zecimale simple precum 0.1 sau 0.01 (in binar devin fractii infinite periodice, la fel cum 1/3 devine 0.3333... in zecimal).\n\nRezultatul operatiei: 0.1 + 0.2 in Java NU este 0.3, ci 0.30000000000000004! In aplicatiile bancare sau financiare, aceste rotunjiri acumulate duc la diferente de bani si erori contabile grave.\n\nSolutie: BigDecimal pastreaza reprezentarea zecimala exacta cu precizie arbitrara configurabila.',
    codeSnippet: `// 1. Cu double (GRESIT in sisteme financiare):
double d1 = 0.1;
double d2 = 0.2;
System.out.println(d1 + d2 == 0.3); // FALSE! Afiseaza 0.30000000000000004

// 2. Cu BigDecimal (CORECT):
// ATENTIE: Foloseste mereu constructorul cu String, NU cu double!
BigDecimal b1 = new BigDecimal("0.1");
BigDecimal b2 = new BigDecimal("0.2");
BigDecimal sum = b1.add(b2);
System.out.println(sum); // 0.3 EXACT`,
    interviewTrap: 'Daca scrii new BigDecimal(0.1) trecand un literal double, transferi chiar eroarea de precizie a double-ului in BigDecimal! Foloseste OBLIGATORIU new BigDecimal("0.1") sau BigDecimal.valueOf(0.1).',
    keyTakeaway: 'Pentru orice operatiune cu valuta, preturi, comisioane sau salarii: BigDecimal cu String constructor.'
  },

  // ==========================================
  // 2. COLLECTIONS & DATA STRUCTURES
  // ==========================================
  {
    id: 'coll-01',
    category: 'COLLECTIONS',
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
    id: 'coll-02',
    category: 'COLLECTIONS',
    difficulty: 'MEDIU',
    title: 'ArrayList vs LinkedList: De ce evitam LinkedList?',
    question: 'Care este diferenta dintre ArrayList si LinkedList si de ce in aplicatiile enterprise reale se prefera ArrayList in 99% din cazuri?',
    answer: '1. ArrayList: Bazat pe un array dinamic redimensionabil. Ofera acces instantaneu prin index in timp O(1) si este compact in memorie.\n\n2. LinkedList: Lista dublu inlantuita. Fiecare element este impachetat intr-un nod (Node<E>) cu doi pointeri (prev, next).\n\nDe ce evitam LinkedList chiar si la inserari:\n- Cache Locality (Performanta hardware): Elementele dintr-un ArrayList sunt contigue in memorie, potrivindu-se perfect pe liniile de CPU Cache (L1/L2). In LinkedList, nodurile sunt dispersate aleatoriu pe Heap, generand masive CPU Cache Misses.\n- Consum Memorie: Pe un JVM pe 64 de biti, un nod de LinkedList consuma 24-32 bytes overhead suplimentar doar pentru pointeri si header de obiect, pe langa data utila.',
    codeSnippet: `// 1. ArrayList:
List<String> fastList = new ArrayList<>(100); // Alocare dintr-un singur bloc O(1)

// 2. Pentru operatii de Coada / Stiva (FIFO/LIFO):
// Nici macar acolo nu folosim LinkedList, folosim ArrayDeque!
Deque<String> queue = new ArrayDeque<>();`,
    interviewTrap: 'Manualele vechi spun ca LinkedList are O(1) pentru inserare la mijloc. In practica, pana sa inserezi la mijloc trebuie sa parcurgi lista pana acolo in O(n), ceea ce face operatia mai lenta decat mutarea de memorie din ArrayList (System.arraycopy).',
    keyTakeaway: 'ArrayList este alegerea implicita pentru liste. Pentru cozi sau stive, foloseste ArrayDeque.'
  },
  {
    id: 'coll-03',
    category: 'COLLECTIONS',
    difficulty: 'MEDIU',
    title: 'Fail-Fast vs Fail-Safe Iterators',
    question: 'Ce este un iterator Fail-Fast si de ce apare ConcurrentModificationException daca stergi un element dintr-o lista cu list.remove() in interiorul unui for-each?',
    answer: '1. Fail-Fast (ArrayList, HashMap, HashSet):\n   - Daca structura colectiei este modificata structural (adaugari, stergeri) in timp ce o parcurgi, iteratorul detecteaza imediat diferenta dintre contorul modCount si expectedModCount si arunca instantaneu ConcurrentModificationException.\n   - Scopul este sa previna comportamentul imprevizibil si coruperea de date.\n\n2. Fail-Safe / Weakly Consistent (ConcurrentHashMap, CopyOnWriteArrayList):\n   - Itereaza pe o clona (snapshot) sau pe o vizualizare slab consistenta a datelor. Nu arunca niciodata ConcurrentModificationException cand colectia este modificata concurent.',
    codeSnippet: `List<String> list = new ArrayList<>(List.of("A", "B", "C"));

// GRESIT (arunca ConcurrentModificationException):
for (String item : list) {
    if (item.equals("B")) list.remove(item);
}

// CORECT 1: Folosind Iterator.remove():
Iterator<String> it = list.iterator();
while (it.hasNext()) {
    if (it.next().equals("B")) it.remove();
}

// CORECT 2: Folosind removeIf() din Java 8:
list.removeIf(item -> item.equals("B"));`,
    interviewTrap: 'For-each-ul este doar un syntactic sugar peste Iterator. Daca apelezi list.remove() in for-each, iteratorul nu stie ca ai modificat lista si da eroare la urmatorul it.next().',
    keyTakeaway: 'Pentru stergere curata in iteratii, foloseste mereu metoda list.removeIf() sau iteratorul dedicat.'
  },
  {
    id: 'coll-04',
    category: 'COLLECTIONS',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza ConcurrentHashMap?',
    question: 'Cum reuseste ConcurrentHashMap sa fie thread-safe cu performanta ridicata fata de Collections.synchronizedMap sau vechiul Hashtable?',
    answer: 'Hashtable si Collections.synchronizedMap blocheaza INTREAGA tabela la orice operatiune de citire sau scriere (un singur lock global pe toata colectia), devenind o strangulare masiva de performanta.\n\nConcurrentHashMap (in Java 8+):\n1. Citirile (get): Sunt complet NON-BLOCANTE (Lock-Free), folosind variabile volatile pe noduri (Node.val si Node.next).\n2. Scrierile (put): Blocheaza DOAR PRIMUL NOD din bucket-ul specific unde se face inserarea (folosind synchronized pe primul nod din bucket). Nicio alta celula sau bucket nu este blocat!\n3. Daca bucket-ul este gol: Inserarea se face complet fara lock folosind instructiunea hardware CAS (Compare-And-Swap).\n4. Nu permite chei sau valori NULL (pentru a evita ambiguitatea daca o valoare lipseste sau este mapata la null).',
    codeSnippet: `// Harta concurenta de mare performanta:
ConcurrentMap<String, Long> userHits = new ConcurrentHashMap<>();

// Operatii atomice compuse:
userHits.computeIfAbsent("user_42", k -> queryDatabase(k));
userHits.merge("user_42", 1L, Long::sum); // Incrementare atomica`,
    interviewTrap: 'Daca folosesti metode separate: "if (!map.containsKey(key)) map.put(key, val)", operatia NU mai este atomica per total! Foloseste mereu operatiile atomice native: putIfAbsent, computeIfAbsent sau merge.',
    keyTakeaway: 'ConcurrentHashMap scaleaza la mii de thread-uri paralele prin lock-uri granulare la nivel de bucket si citiri fara lock.'
  },

  // ==========================================
  // 3. SPRING BOOT & JPA / HIBERNATE
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
  {
    id: 'spring-05',
    category: 'SPRING_JPA',
    difficulty: 'USOR',
    title: 'Constructor Injection vs Field Injection (@Autowired)',
    question: 'De ce echipa Spring recomanda oficial Constructor Injection si descurajeaza Field Injection (@Autowired direct pe campuri)?',
    answer: 'Constructor Injection ofera 4 avantaje majore:\n1. Imutabilitate: Poti declara dependintele ca fiind "final", garantand ca nu vor fi modificate dupa instantiere.\n2. Testabilitate Unitara Simpla: Poti instantia clasa cu "new Service(mockRepo)" in teste simple JUnit fara a porni Spring Context si fara mecanisme complicate de reflection.\n3. Detectarea dependentelor circulare la pornire: Daca clasa A cere B si clasa B cere A, aplicatia refuza sa porneasca instant (fail-fast), fortand remedierea design-ului.\n4. Siguranta impotriva NullPointerException: Obiectul nu poate fi creat intr-o stare invalida, partial initializata.',
    codeSnippet: `// GRESIT / Descurajat:
@Service
public class UserService {
    @Autowired
    private UserRepository repo; // Nu poate fi final, greu de testat izolat
}

// RECOMANDAT (Constructor Injection):
@Service
public class UserService {
    private final UserRepository repo;

    // Daca exista un singur constructor, @Autowired este optional!
    public UserService(UserRepository repo) {
        this.repo = Objects.requireNonNull(repo);
    }
}`,
    interviewTrap: 'Daca folosesti Lombok, poti folosi adnotarea @RequiredArgsConstructor pe clasa, iar Lombok va genera constructorul pentru toate campurile declarate final.',
    keyTakeaway: 'Dependintele finale injectate prin constructor creeaza aplicatii sigure, imutabile si usor de testat.'
  },
  {
    id: 'spring-06',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Stari ale unei entitati JPA (Entity Lifecycle)',
    question: 'Care sunt cele 4 stari prin care poate trece o entitate in JPA (Hibernate) si ce semnifica starea Detached?',
    answer: 'Cele 4 stari fundamentale din JPA Persistence Context sunt:\n1. Transient (New): Obiectul este creat cu "new", are doar o instanta in memorie si nu are nicio legatura cu baza de date sau EntityManager.\n2. Managed (Persistent): Entitatea este asociata cu sesiunea curenta de EntityManager si are o cheie primara (ID). Orice modificare asupra campurilor va fi salvata automat in baza de date la commit/flush prin mecanismul de Dirty Checking (nu e nevoie de repo.save() explicit!).\n3. Detached: Entitatea are un ID salvat in DB, dar sesiunea EntityManager a fost inchisa sau deconectata (prin clear/detach). Modificarile nu mai sunt sincronizate automat.\n4. Removed: Entitatea a fost programata pentru stergere (DELETE) din DB la comiterea tranzactiei.',
    codeSnippet: `JobPosting job = new JobPosting("Java Dev"); // 1. TRANSIENT

entityManager.persist(job); // 2. MANAGED (urmarit de Dirty Checking)
job.setTitle("Senior Java Dev"); // Va genera automat UPDATE la commit!

entityManager.detach(job); // 3. DETACHED
job.setTitle("Lead Dev"); // NU se va salva in baza de date!

JobPosting managedAgain = entityManager.merge(job); // Revine in starea MANAGED`,
    interviewTrap: 'Apelul entityManager.merge(detachedEntity) returneaza o instanta NOUA managed; instanta veche pe care ai apelat merge ramane tot detached!',
    keyTakeaway: 'Dirty Checking functioneaza doar pentru entitatile aflate in starea Managed in interiorul unei tranzactii active.'
  },
  {
    id: 'spring-07',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'LazyInitializationException: Cauza si Prevenire',
    question: 'Ce cauzeaza celebra eroare org.hibernate.LazyInitializationException si cum se rezolva corect fara sa folosesti enable_lazy_load_no_trans?',
    answer: 'LazyInitializationException apare cand incerci sa accesezi o relatie marcata cu FetchType.LAZY (de exemplu: job.getApplications()) in afara unei tranzactii active, DUPA ce Hibernate Session (EntityManager) a fost deja inchisa.\n\nCand sesiunea este inchisa, proxy-ul Hibernate nu mai are conexiune la baza de date pentru a incarca datele la cerere.\n\nCum se rezolva corect:\n1. Incarcare prin JOIN FETCH sau @EntityGraph in Repository la nivel de query.\n2. Folosirea de proiectii DTO (incarcarea directa a datelor intr-un record sau DTO cu query dedicat inainte de a trimite raspunsul spre Controller).\n3. Mentinerea tranzactiei la nivel de Service (@Transactional(readOnly = true)).\n\nNICIODATA nu activa proprietatea spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true in productie, deoarece deschide cate o conexiune la fiecare accesare (anti-pattern cu N+1 ascuns si epuizare de conexiuni).',
    codeSnippet: `// Solutie curata cu DTO Projection:
public interface JobDtoProjection {
    Long getId();
    String getTitle();
    int getApplicantCount(); // Calculat direct in SQL, fara proxy!
}

@Query("SELECT j.id as id, j.title as title, count(a) as applicantCount " +
       "FROM JobPosting j LEFT JOIN j.applications a GROUP BY j.id, j.title")
List<JobDtoProjection> findAllSummary();`,
    interviewTrap: 'Daca serializezi o entitate cu relatii Lazy direct in JSON prin Jackson in controller, serializerul va incerca sa apeleze getterele si va arunca LazyInitializationException. Mapeaza intotdeauna in DTO!',
    keyTakeaway: 'Nu expune entitati JPA in controllere. Transforma-le in DTO-uri in Service layer cat timp tranzactia este deschisa.'
  },
  {
    id: 'spring-08',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Propagation.REQUIRED vs REQUIRES_NEW in @Transactional',
    question: 'Care este diferenta dintre valorile de propagare ale tranzactiilor: Propagation.REQUIRED (default) si Propagation.REQUIRES_NEW?',
    answer: '1. Propagation.REQUIRED (Comportament Implicit):\n   - Daca exista deja o tranzactie activa deschisa de apelant, se alatura ei.\n   - Daca nu exista nicio tranzactie, creeaza una noua.\n   - Daca metoda copil arunca o exceptie si face rollback, intreaga tranzactie parinte va fi compromisa si va pica cu rollback!\n\n2. Propagation.REQUIRES_NEW:\n   - Suspenda intotdeauna tranzactia existenta a parintelui si deschide o tranzactie COMPLET NOUA, independenta, cu o conexiune separata la baza de date.\n   - Tranzactia noua comite sau face rollback independent de tranzactia parinte.\n   - Folosita frecvent pentru: audit logging, inregistrarea incercarilor esuate de login sau trimitere de notificari care trebuie salvate chiar daca operatiunea principala a esuat.',
    codeSnippet: `@Service
public class AuditService {
    // Se salveaza chiar daca comanda principala pica cu exceptie!
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logSecurityAttempt(String user, boolean success) {
        auditRepo.save(new SecurityLog(user, success, Instant.now()));
    }
}`,
    interviewTrap: 'REQUIRES_NEW consuma doua conexiuni simultane din Hikari Connection Pool cat timp metoda ruleaza. Daca pool-ul este mic, poate genera usor Connection Pool Deadlock sub trafic mare!',
    keyTakeaway: 'Foloseste REQUIRED pentru logica de business unitara si REQUIRES_NEW doar pentru actiuni de audit care trebuie persistate independent.'
  },
  {
    id: 'spring-09',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Optimistic Locking (@Version) vs Pessimistic Locking',
    question: 'Ce este Optimistic Locking, cum se implementeaza cu adnotarea @Version si cand alegi Pessimistic Locking?',
    answer: '1. Optimistic Locking (Fara lock-uri pe baza de date):\n   - Presupune ca conflictele de scriere sunt rare.\n   - Se adauga o coloana numerica (ex: @Version private Long version) in entitate.\n   - La fiecare UPDATE, Hibernate verifica: WHERE id = ? AND version = ? si incrementeaza version = version + 1.\n   - Daca alt proces a modificat randul intre timp, numarul de randuri actualizate este 0, iar Hibernate arunca: OptimisticLockException (sau ObjectOptimisticLockingFailureException).\n\n2. Pessimistic Locking (Lock fizic SQL):\n   - Presupune ca conflictele sunt frecvente.\n   - Blocheaza randul in SQL prin clauza SELECT ... FOR UPDATE (PESSIMISTIC_WRITE).\n   - Niciun alt thread nu poate citi sau modifica randul pana cand tranzactia nu da COMMIT.\n\nCand alegi: Optimistic pentru aplicatii web de citire cu scrieri rare; Pessimistic pentru sisteme financiare, stocuri de produse cu un singur item disponibil (bilete la concert, transfer bancar).',
    codeSnippet: `// 1. Optimistic Locking:
@Entity
public class JobApplication {
    @Id private UUID id;
    private String status;
    @Version
    private Long version; // Gestionat automat de JPA
}

// 2. Pessimistic Locking in Repository:
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT b FROM BankAccount b WHERE b.id = :id")
Optional<BankAccount> findByIdForUpdate(@Param("id") Long id);`,
    interviewTrap: 'La Optimistic Locking, aplicatia trebuie sa prinda OptimisticLockException si sa decida cum gestioneaza conflictul: de obicei prin reincercare automata (Retry mechanism cu Spring Retry).',
    keyTakeaway: 'Optimistic Locking ofera throughput maxim. Pessimistic Locking previne conflictele dar blocheaza conexiunile din baza de date.'
  },
  {
    id: 'spring-10',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza Security Filter Chain in Spring Security 6',
    question: 'Care este fluxul unui request printr-un SecurityFilterChain in Spring Boot 3 si cum validezi un JWT pe fiecare apel?',
    answer: 'Fiecare request HTTP trimis catre un controller trece printr-un lant de filtre (FilterChain) inainte de a ajunge la DispatcherServlet.\n\nFluxul standard pentru JWT:\n1. Clientul trimite header-ul Authorization: Bearer <token>.\n2. Un filtru personalizat (JwtAuthenticationFilter) extins din OncePerRequestFilter intercepteaza apelul.\n3. Filtrul extrage token-ul, il valideaza criptografic (semnatura HMAC/RSA si expirarea exp).\n4. Daca token-ul este valid, extrage username-ul si rolurile/autoritatile si creeaza un obiect UsernamePasswordAuthenticationToken.\n5. Seteaza obiectul in contextul de securitate al thread-ului curent: SecurityContextHolder.getContext().setAuthentication(auth).\n6. Permite request-ului sa mearga mai departe in lant (filterChain.doFilter(request, response)).\n7. Controller-ul si adnotarile @PreAuthorize("hasRole(\'ADMIN\')") citesc permisiunile direct din SecurityContextHolder.',
    codeSnippet: `@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isTokenValid(token)) {
                var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        filterChain.doFilter(request, response);
    }
}`,
    interviewTrap: 'In Spring Boot 3+, configurarea securitatii se face exclusiv prin declararea unui bean de tip SecurityFilterChain; vechea clasa WebSecurityConfigurerAdapter a fost complet eliminata!',
    keyTakeaway: 'SecurityContextHolder foloseste ThreadLocal sub capota; informatia de securitate este disponibila pe toata durata request-ului pe acelasi thread.'
  },

  // ==========================================
  // 4. SQL, INDECSI & POSTGRESQL AVANSAT
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
  {
    id: 'sql-03',
    category: 'SQL_DB',
    difficulty: 'MEDIU',
    title: 'Leftmost Prefix Rule pentru Indecsi Compusi (Composite Indexes)',
    question: 'Daca ai un index compus creat pe trei coloane: CREATE INDEX idx_users ON users (country, city, age); care din urmatoarele interogari vor folosi indexul si care vor face Seq Scan?\n1. WHERE country = \'RO\'\n2. WHERE city = \'Bucuresti\'\n3. WHERE country = \'RO\' AND age = 25',
    answer: 'Regula Leftmost Prefix spune ca un index compus pe (A, B, C) poate fi folosit doar daca clauza WHERE contine un prefix continuu incepand de la prima coloana din stanga (A):\n\n1. WHERE country = \'RO\': VA FOLOSI indexul (coloana A este prezenta).\n2. WHERE city = \'Bucuresti\': NU VA FOLOSI indexul (va face Sequential Scan, deoarece lipseste prima coloana A - country!).\n3. WHERE country = \'RO\' AND age = 25: VA FOLOSI indexul doar partial pentru filtrarea pe country (A); filtrarea pe age (C) se face prin filtrare secundara de index, dar coloana B lipseste din lant.\n\nOrdinea coloanelor in index este critica: pune mereu in stanga coloanele cu cea mai mare selectivitate si cele care apar cel mai frecvent in clauzele WHERE de egalitate.',
    codeSnippet: `-- Index compus:
CREATE INDEX idx_jobs_location_role ON job_postings (location, role);

-- Query 1 (Rapid - Index Scan):
SELECT * FROM job_postings WHERE location = 'Bucuresti';

-- Query 2 (Lent - Sequential Scan fara prima coloana):
SELECT * FROM job_postings WHERE role = 'Backend Developer';`,
    interviewTrap: 'Daca interogarea contine o conditie de inegalitate sau range (<, >, BETWEEN) pe o coloana din mijloc, coloanele din dreapta ei din index nu mai pot fi folosite pentru cautare in arbore!',
    keyTakeaway: 'Plaseaza intotdeauna coloanele folosite in egalitati (=) in stanga indexului, si coloanele de range/sortare (ORDER BY) la final.'
  },
  {
    id: 'sql-04',
    category: 'SQL_DB',
    difficulty: 'MEDIU',
    title: 'De ce OFFSET este lent la Paginare si ce este Keyset Pagination?',
    question: 'De ce interogarea: SELECT * FROM jobs ORDER BY id LIMIT 20 OFFSET 500000 devine extrem de lenta in PostgreSQL/MySQL si cum se rezolva prin Keyset Pagination (Seek Method)?',
    answer: 'De ce OFFSET este lent:\nCand ceri OFFSET 500000 LIMIT 20, motorul bazei de date NU sare direct la randul 500.000. El trebuie sa citeasca de pe disc, sa sorteze si sa parcurga toate cele 500.000 de randuri anterioare pentru a le ignora, si abia apoi sa returneze cele 20 de randuri cerute. Cu cat pagina este mai adanca, cu atat interogarea este mai lenta O(N).\n\nSolutie: Keyset Pagination (Paginare prin Cursor / Seek Method):\nIn loc de OFFSET, folosim ultima cheie/valoare vazuta de pe pagina precedenta folosind clauza WHERE id > last_seen_id LIMIT 20. Baza de date foloseste direct indexul B-Tree pentru a sari instant in O(log N) direct la inregistrarea dorita!',
    codeSnippet: `-- GRESIT (Lent la volume mari):
SELECT * FROM job_postings 
ORDER BY id ASC LIMIT 20 OFFSET 100000; -- Citeste 100.020 randuri!

-- CORECT (Keyset Pagination - Instant O(1)):
SELECT * FROM job_postings 
WHERE id > 100000 
ORDER BY id ASC LIMIT 20; -- Sare direct prin index la pozitie!`,
    interviewTrap: 'Keyset Pagination are o singura limitare: nu permite saltul direct la o pagina arbitrara (ex: "Sari direct la pagina 45"), ci functioneaza doar pentru navigare "Next / Previous" sau Infinite Scroll.',
    keyTakeaway: 'Pentru fluxuri mari de date, API-uri publice si aplicatii cu infinite scroll, foloseste intotdeauna Keyset Pagination.'
  },

  // ==========================================
  // 5. CONCURRENCY & MULTITHREADING / JAVA 21
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
  {
    id: 'conc-03',
    category: 'CONCURRENCY',
    difficulty: 'DIFICIL',
    title: 'Ce este ThreadLocal si de ce provoaca Memory Leaks in Tomcat/Spring?',
    question: 'Ce este ThreadLocal in Java, la ce este folosit (ex: SecurityContext, Tranzactii) si de ce uitarea apelului threadLocal.remove() provoaca Memory Leaks in servere de aplicatii?',
    answer: 'ThreadLocal ofera variabile izolate la nivel de fir de executie (Thread-Confined State). Fiecare thread detine propria sa copie independenta a variabilei, accesibila global fara a fi trimisa ca parametru prin toate metodele.\n\nUtilizari celebre:\n- SecurityContextHolder (retine utilizatorul autentificat pe request-ul curent).\n- TransactionSynchronizationManager (retine conexiunea curenta JDBC a tranzactiei).\n\nDe ce provoaca Memory Leaks:\nServerele web precum Tomcat folosesc un Thread Pool (firele de executie nu mor la terminarea request-ului HTTP, ci se intorc in pool pentru a deservi alti clienti). Daca nu apelezi ThreadLocal.remove() la finalul request-ului:\n1. Obiectele din ThreadLocal raman agatate in memorie si nu pot fi sterse de GC.\n2. Urmatorul request HTTP preluat de acelasi thread reciclat va vedea datele utilizatorului anterior (bresa grava de securitate)!',
    codeSnippet: `public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();

    public static void setTenant(String tenant) { CURRENT_TENANT.set(tenant); }
    public static String getTenant() { return CURRENT_TENANT.get(); }
    
    // OBLIGATORIU de apelat intr-un bloc finally sau Interceptor:
    public static void clear() {
        CURRENT_TENANT.remove();
    }
}`,
    interviewTrap: 'Cheile din ThreadLocalMap sunt WeakReferences, dar valorile (Values) sunt StrongReferences! Daca thread-ul traieste mult timp in pool, valorile raman blocate in memorie.',
    keyTakeaway: 'Apeleaza intotdeauna threadLocal.remove() intr-un bloc finally sau Spring HandlerInterceptor.afterCompletion().'
  },
  {
    id: 'conc-04',
    category: 'CONCURRENCY',
    difficulty: 'MEDIU',
    title: 'CompletableFuture: Rularea si combinarea de operatii asincrone',
    question: 'Cum rulezi doua apeluri API externe in paralel si combini rezultatele folosind CompletableFuture in Java 8+?',
    answer: 'CompletableFuture permite programarea asincrona functionala si non-blocanta.\n\nPentru a rula task-uri independente in paralel:\n1. supplyAsync(): Lanseaza operatia asincron pe un executor (implicit ForkJoinPool.commonPool sau un Executor custom).\n2. thenCombine(): Primeste un alt CompletableFuture si o functie bi-functionala pentru a uni ambele rezultate atunci cand ambele s-au terminat cu succes.\n3. allOf(): Asteapta terminarea a N task-uri paralele.\n4. exceptionally(): Ofera o valoare de rezerva (fallback) in caz de eroare, prevenind caderea intregului flux.',
    codeSnippet: `CompletableFuture<UserDto> userFuture = CompletableFuture.supplyAsync(() -> userService.getUser(id));
CompletableFuture<List<JobDto>> jobsFuture = CompletableFuture.supplyAsync(() -> jobService.getRecommendedJobs(id));

// Rulare in paralel si combinare la final:
CompletableFuture<DashboardDto> dashboardFuture = userFuture
    .thenCombine(jobsFuture, (user, jobs) -> new DashboardDto(user, jobs))
    .exceptionally(ex -> {
        log.error("Eroare generare dashboard", ex);
        return DashboardDto.empty();
    });

DashboardDto result = dashboardFuture.join(); // Asteapta rezultatul final combinat`,
    interviewTrap: 'Daca folosesti supplyAsync fara sa specifici un Executor personalizat, va folosi ForkJoinPool.commonPool. Daca ai apeluri I/O blocante (HTTP sau DB), vei epuiza thread-urile din pool si vei bloca intreaga aplicatie!',
    keyTakeaway: 'Trimite intotdeauna un ExecutorService dedicat cu Thread Pool optimizat ca al doilea parametru in supplyAsync().'
  },
  {
    id: 'conc-05',
    category: 'CONCURRENCY',
    difficulty: 'MEDIU',
    title: 'Deadlock: Conditiile de aparitie si Prevenirea in Java',
    question: 'Ce este un Deadlock intre doua thread-uri si cum se poate preveni simplu la nivel de cod aplicativ?',
    answer: 'Deadlock-ul apare cand doua sau mai multe thread-uri sunt blocate reciproc pentru totdeauna, fiecare asteptand o resursa blocata de celalalt.\n\nExemplu clasic:\n- Thread-ul 1 detine Lock A si asteapta Lock B.\n- Thread-ul 2 detine Lock B si asteapta Lock A.\n\nCum se previne:\n1. Lock Ordering (Cea mai buna metoda): Toate thread-urile din aplicatie trebuie sa ceara lock-urile in EXACT ACEEASI ORDINE (ex: mereu intai contul cu ID-ul mai mic, apoi contul cu ID-ul mai mare).\n2. tryLock() cu Timeout din ReentrantLock: In loc de synchronized blocant la infinit, foloseste lock.tryLock(2, TimeUnit.SECONDS). Daca nu primeste lock-ul, elibereaza resursele detinute si reincearca mai tarziu.\n3. Detectare: Comanda jstack <pid> identifica instant thread-urile aflate in deadlock in JVM.',
    codeSnippet: `// Transfer bani intre conturi fara Deadlock (ordonare dupa ID):
public void transferMoney(Account from, Account to, BigDecimal amount) {
    Account firstLock = from.getId() < to.getId() ? from : to;
    Account secondLock = from.getId() < to.getId() ? to : from;

    synchronized (firstLock) {
        synchronized (secondLock) {
            from.debit(amount);
            to.credit(amount);
        }
    }
}`,
    interviewTrap: 'Daca folosesti synchronized (from) si synchronized (to) fara sortare dupa ID, cand utilizatorul A trimite bani lui B si concomitent B trimite bani lui A, apare Deadlock garantat!',
    keyTakeaway: 'Ordoneaza intotdeauna achizitia lock-urilor pentru a elimina bucla circulara de asteptare.'
  },

  // ==========================================
  // 6. SYSTEM DESIGN & REST API
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
  {
    id: 'sys-03',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'PUT vs PATCH in specificatia REST',
    question: 'Care este diferenta semantica si practica intre metodele HTTP PUT si PATCH pe un endpoint REST?',
    answer: '1. HTTP PUT (Inlocuire Completa - Full Replacement):\n   - Este Idempotent: trimiterea aceluiasi request PUT de 10 ori produce exact acelasi rezultat in baza de date.\n   - Clientul trimite INTREAGA reprezentare a resursei. Orice camp omis din payload-ul de request va fi suprascris cu null sau valoarea default!\n\n2. HTTP PATCH (Actualizare Partiala - Partial Update):\n   - NU este garantat idempotent prin specificatie (desi in practica devine).\n   - Clientul trimite DOAR campurile pe care doreste sa le modifice (ex: doar status: "CLOSED"). Campurile neincluse in payload raman nemodificate in baza de date.',
    codeSnippet: `// PUT: Suprascrie tot obiectul (daca lipseste compania, devine null):
// PUT /api/v1/jobs/42
// Body: { "title": "Senior Java Dev", "salary": 4000 }

// PATCH: Modifica punctual doar statusul, pastrand titlul si salariul:
// PATCH /api/v1/jobs/42
// Body: { "status": "INACTIVE" }`,
    interviewTrap: 'Daca implementezi un endpoint cu adnotarea @PutMapping dar in cod faci update doar la campurile nenule din JSON, incalci conventia REST! Pentru update partial foloseste @PatchMapping.',
    keyTakeaway: 'PUT inlocuieste resursa integral; PATCH modifica doar campurile trimise in cerere.'
  },
  {
    id: 'sys-04',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Kafka vs RabbitMQ: Cum alegi Message Broker-ul potrivit?',
    question: 'Care sunt diferentele de arhitectura dintre Apache Kafka si RabbitMQ si cand alegi fiecare solutie?',
    answer: '1. RabbitMQ (Traditional Message Broker / Smart Broker, Dumb Consumer):\n   - Bazat pe standardul AMQP cu cozi (Queues) si rutare prin Exchanges (Direct, Topic, Fanout).\n   - Mesajele sunt STERSE automat din coada dupa ce sunt confirmate (ACK) de catre consumator.\n   - Ideal pentru: procesare complexa de task-uri de fundal, prioritizare mesaje, tranzactii financiare punctuale, volume de ordinul zecilor de mii de mesaje/secunda.\n\n2. Apache Kafka (Distributed Append-Only Commit Log / Dumb Broker, Smart Consumer):\n   - Mesajele sunt pastrate pe disc secvential intr-un log partajat pentru o perioada de timp (retention period: ex. 7 zile), indiferent daca au fost citite sau nu.\n   - Fiecare consumator tine minte unde a ramas prin offset.\n   - Permite REPLAY de mesaje si procesare de fluxuri masive de date (Event Streaming).\n   - Ideal pentru: milioane de mesaje/secunda, audit trails, event sourcing, IoT si pipeline-uri de analiza date in timp real.',
    codeSnippet: `// RabbitMQ: Coada unde mesajul dispare dupa citire
// Producer -> Exchange -> Queue -> Consumer (ACK -> Mesaj sters)

// Kafka: Log pe disc unde consumatorul doar muta un pointer
// Producer -> Topic (Partition 0, 1, 2) -> Append la Log
// Consumer 1: citeste de la Offset 105
// Consumer 2: poate reciti de la Offset 0 oricand!`,
    interviewTrap: 'Kafka nu are cozi de Dead Letter individuale per mesaj la fel de simple ca RabbitMQ. Daca un mesaj pica in Kafka, partitia poate ramane blocata daca nu implementezi un Retry Topic separat!',
    keyTakeaway: 'Alege RabbitMQ pentru rutare complexa de task-uri; alege Kafka pentru throughput urias, streaming si stocare de evenimente durabile.'
  },
  {
    id: 'sys-05',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Circuit Breaker Pattern cu Resilience4j',
    question: 'Ce este si cum functioneaza un Circuit Breaker in arhitecturile de microservicii? Care sunt cele 3 stari ale sale?',
    answer: 'Circuit Breaker previne "efectul de cascada" (Cascading Failure): cand un serviciu downstream (ex: serviciul de plati) pica sau raspunde foarte lent, elibereaza instant resursele fara a bloca mii de thread-uri in asteptare.\n\nCele 3 stari:\n1. CLOSED (Functionare normala): Toate request-urile trec. Se monitorizeaza rata de erori sau timeout-uri dintr-o fereastra de apeluri.\n2. OPEN (Sistem cazut): Daca rata de eroare depaseste pragul (ex: 50%), circuitul se DESCHIDE. Toate apelurile viitoare sunt respinse INSTANTANEU cu eroare (CallNotPermittedException) sau directionate spre o metoda de FALLBACK, fara a mai apela serviciul defect.\n3. HALF-OPEN (Testare recuperare): Dupa o perioada de asteptare (ex: 10 secunde), circuitul permite un numar limitat de apeluri de proba. Daca acestea reusesc, revine in CLOSED; daca pica, redevine OPEN.',
    codeSnippet: `@Service
public class PaymentClient {

    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResponse callExternalGateway(PaymentRequest req) {
        return restTemplate.postForObject("/pay", req, PaymentResponse.class);
    }

    // Metoda de fallback apelata instant cand circuitul este OPEN:
    public PaymentResponse paymentFallback(PaymentRequest req, Throwable t) {
        log.warn("Gateway indisponibil. Salvare in coada de asteptare.");
        return new PaymentResponse("QUEUED_FOR_RETRY");
    }
}`,
    interviewTrap: 'Metoda de fallback trebuie sa aiba EXACT aceeasi lista de parametri ca metoda principala, plus un parametru aditional Throwable la final, altfel Spring nu o gaseste!',
    keyTakeaway: 'Resilience4j protejeaza sistemul de epuizarea thread-urilor si asigura graceful degradation cand serviciile externe pica.'
  },

  // ==========================================
  // 7. TESTING (JUNIT 5 & MOCKITO)
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
  },
  {
    id: 'test-03',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: '@SpringBootTest vs @WebMvcTest vs @DataJpaTest',
    question: 'Care este diferenta de viteza si de context intre testele de slice (@WebMvcTest, @DataJpaTest) si un test integrat complet @SpringBootTest?',
    answer: '1. @SpringBootTest (Test de Integrare Complet):\n   - Porneste INTREGUL ApplicationContext de Spring (toate controllerele, serviciile, repository-urile, security).\n   - Cel mai lent la pornire (poate dura cateva secunde), dar testeaza interactiunea completa de la HTTP la baza de date.\n\n2. @WebMvcTest (Test de Controller Slice):\n   - Incarca DOAR stratul web (Controllere, ExceptionHandlers, filtre Jackson si Security).\n   - NU incarca servicii sau repository-uri; acestea TREBUIE mock-uite explicit folosind @MockBean.\n   - Extrem de rapid, ideal pentru verificarea codurilor de stare HTTP, validari @Valid si serializare JSON.\n\n3. @DataJpaTest (Test de Repository Slice):\n   - Incarca DOAR stratul JPA (EntityManager, Spring Data Repositories).\n   - Configureaza o baza de date de test si ruleaza fiecare test intr-o tranzactie cu rollback automat la final.',
    codeSnippet: `// 1. Controller Slice Test (Rapid, mock-uieste serviciul):
@WebMvcTest(JobController.class)
class JobControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private JobService jobService;

    @Test
    void shouldReturnJob() throws Exception {
        when(jobService.getJob(1L)).thenReturn(new JobDto(1L, "Dev"));
        mockMvc.perform(get("/api/v1/jobs/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.title").value("Dev"));
    }
}`,
    interviewTrap: 'Folosirea exclusiva de @SpringBootTest pentru orice test simplu duce la o suita de teste care dureaza 20 de minute. Foloseste teste unitare pure cu Mockito pentru servicii si slice tests pentru controllere!',
    keyTakeaway: 'Alege tipul potrivit de test: Mockito pur pentru business logic (milisecunde), slice tests pentru controllere si @SpringBootTest doar pentru flow-uri critice end-to-end.'
  },
  {
    id: 'test-04',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'ArgumentCaptor in Mockito: Cand si cum il folosim?',
    question: 'La ce serveste ArgumentCaptor in Mockito si cum verifici valorile parametrilor transmisi unei dependinte mock-uite?',
    answer: 'ArgumentCaptor este folosit pentru a captura si inspecta argumentele reale transmise unei metode a unui mock in timpul executiei testului.\n\nEste extrem de util cand obiectul salvat este creat in interiorul metodei testate (de exemplu cand un DTO este mapat intr-o entitate noua JobPosting cu timestamps si UUID generat) si nu ai o referinta directa catre el inainte de apel.',
    codeSnippet: `@ExtendWith(MockitoExtension.class)
class JobServiceTest {
    @Mock private JobRepository jobRepository;
    @InjectMocks private JobService jobService;

    @Captor private ArgumentCaptor<JobPosting> jobCaptor;

    @Test
    void shouldSetDefaultStatusOnCreate() {
        jobService.createJob(new CreateJobRequest("Java Developer"));

        // Verificam ca save() a fost apelat si capturam entitatea salvata:
        verify(jobRepository).save(jobCaptor.capture());
        
        JobPosting savedJob = jobCaptor.getValue();
        assertEquals("Java Developer", savedJob.getTitle());
        assertEquals("ACTIVE", savedJob.getStatus()); // Valoare setata intern!
    }
}`,
    interviewTrap: 'Nu folosi ArgumentCaptor pe asertiuni simple de string-uri sau primitive unde poti folosi direct eq("valoare"). Foloseste-l doar cand trebuie sa inspectezi campuri interne din obiecte complexe generate intern.',
    keyTakeaway: 'ArgumentCaptor iti permite sa verifici valorile din obiectele create intern in metoda testata.'
  },

  // ==========================================
  // 8. SUPLIMENTAR: BAELDUNG & GITHUB INTERVIEW PICKS
  // ==========================================
  {
    id: 'core-13',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Polimorfism Static vs Dinamic si Virtual Method Table (vtable)',
    question: 'Care este diferenta dintre Polimorfismul la compilare (Overloading) si cel la executie (Overriding)? Cum rezolva JVM-ul apelul metodei suprascrise la runtime?',
    answer: '1. Polimorfism Static (Method Overloading):\n   - Se rezolva la COMPILARE (Compile-Time / Early Binding) pe baza semnaturii metodei (nume si lista de tipuri de parametri).\n\n2. Polimorfism Dinamic (Method Overriding):\n   - Se rezolva la RUNTIME (Late Binding / Dynamic Dispatch).\n   - JVM foloseste o structura interna numita Virtual Method Table (vtable), asociata fiecarei clase incarcate in memorie. Tabela contine pointeri catre adresele fizice ale metodelor. Cand o clasa copil suprascrie o metoda a parintelui, intrarea din vtable este actualizata cu adresa metodei copilului. La apelul obj.doWork(), JVM citeste instanta reala de pe Heap, consulta vtable-ul clasei respective si sare direct la adresa corecta.',
    codeSnippet: `class Parent { void print() { System.out.println("Parent"); } }
class Child extends Parent { void print() { System.out.println("Child"); } }

Parent p = new Child();
p.print(); // Afiseaza "Child" datorita Dynamic Dispatch prin vtable!`,
    interviewTrap: 'Metodele private, static si final NU folosesc Dynamic Dispatch (vtable); ele sunt legate static la compilare deoarece nu pot fi suprascrise!',
    keyTakeaway: 'Overloading se rezolva la compilare; Overriding se rezolva la runtime prin tabela vtable a instantei din Heap.'
  },
  {
    id: 'core-14',
    category: 'JAVA_CORE',
    difficulty: 'USOR',
    title: 'try-with-resources si Suppressed Exceptions',
    question: 'Cum functioneaza blocul try-with-resources introdus in Java 7 si ce se intampla cand atat codul din try cat si metoda close() arunca exceptii?',
    answer: 'try-with-resources asigura ca orice resursa care implementeaza java.lang.AutoCloseable (sau Closeable) este inchisa automat la finalul blocului, eliminand blocurile verbose de finally.\n\nCe sunt Suppressed Exceptions:\nIn vechiul model try-catch-finally, daca atat codul din try cat si cel din finally aruncau cate o exceptie, exceptia din finally o "ingropata" pe cea din try, pierzand cauza radacina a erorii.\nIn try-with-resources, exceptia aruncata de corpul blocului try este exceptia principala (Primary Exception), iar daca close() arunca si ea o exceptie, aceasta este atasata ca "Suppressed Exception" (accesibila prin ex.getSuppressed()), pastrand intregul istoric de erori!',
    codeSnippet: `// Inchidere automata garantata:
try (Connection conn = dataSource.getConnection();
     PreparedStatement ps = conn.prepareStatement("SELECT * FROM jobs")) {
    ps.executeQuery();
} catch (SQLException e) {
    // Daca si close() a esuat, gasim eroarea aici:
    for (Throwable suppressed : e.getSuppressed()) {
        System.err.println("Eroare la inchidere: " + suppressed.getMessage());
    }
}`,
    interviewTrap: 'Resursele sunt inchise in ORDINE INVERSA declararii lor (LIFO). In exemplul de mai sus, ps este inchis primul, apoi conn.',
    keyTakeaway: 'Foloseste intotdeauna try-with-resources pentru orice conexiune JDBC, socket sau fisier.'
  },
  {
    id: 'core-15',
    category: 'JAVA_CORE',
    difficulty: 'MEDIU',
    title: 'Pattern Matching for Switch & Record Patterns (Java 21)',
    question: 'Cum simplifica Java 21 inspectarea tipurilor de obiecte folosind Pattern Matching in switch expressions si Record Patterns?',
    answer: 'Inainte de Java 21, verificarea tipurilor cerea lanturi lungi de if (obj instanceof Type) urmate de cast-uri explicite.\n\nIn Java 21:\n1. Switch pe tipuri: Permite inspectarea tipului direct in switch, cu verificari de null si conditii aditionale (guarded patterns cu when).\n2. Record Patterns: Permite deconstructia directa a componentelor unui Record chiar in antetul cazului de switch!',
    codeSnippet: `public String handleJobStatus(Object obj) {
    return switch (obj) {
        case null -> "Status nul primit";
        case JobSummaryDto(var id, var title, var comp, var sal) when sal > 5000 -> 
            "Job Senior Top: " + title + " la " + comp;
        case JobSummaryDto dto -> "Job Standard: " + dto.title();
        case String s -> "Status text: " + s.toUpperCase();
        default -> "Tip necunoscut: " + obj;
    };
}`,
    interviewTrap: 'Switch-ul pe obiecte sigilate (sealed classes) sau exhaustive trebuie sa acopere toate cazurile posibile, altfel compilatorul cere obligatoriu clauza default.',
    keyTakeaway: 'Pattern Matching in Java 21 elimina complet cast-urile manuale si reduce codul de clasificare cu peste 70%.'
  },
  {
    id: 'coll-05',
    category: 'COLLECTIONS',
    difficulty: 'MEDIU',
    title: 'PriorityQueue: Arhitectura si Cautarea Top-K elemente',
    question: 'Ce structura de date sta la baza clasei PriorityQueue in Java si cum se foloseste pentru a gasi cele mai mari K elemente dintr-un stream masiv?',
    answer: 'PriorityQueue este o coada de prioritati implementata pe baza unui Min-Heap (sau Max-Heap daca se trimite un Comparator inversat) reprezentat intern ca un array dinamic.\n\nComplexitati:\n- Inserare (offer): O(log N)\n- Extragere minim (poll): O(log N)\n- Inspectare minim (peek): O(1)\n\nAlgoritmul Top-K:\nPentru a retine cele mai mari K elemente dintr-un flux de milioane de joburi, mentinem o PriorityQueue (Min-Heap) de capacitate fixa K. La fiecare element nou, daca e mai mare decat minimul din heap (peek), dam poll() si adaugam elementul nou. La final, heap-ul contine exact cele mai mari K elemente in timp O(N log K), consumand doar O(K) memorie!',
    codeSnippet: `// Min-Heap pentru cele mai mari K salarii:
PriorityQueue<Integer> topK = new PriorityQueue<>(k);

for (int salary : allSalaries) {
    topK.offer(salary);
    if (topK.size() > k) {
        topK.poll(); // Elimina cel mai mic element din top
    }
}`,
    interviewTrap: 'Iteratorul unui PriorityQueue NU parcurge elementele in ordine sortata! Pentru a le parcurge in ordine sortata, trebuie sa le extragi pe rand cu poll().',
    keyTakeaway: 'PriorityQueue este cheia rezolvarii problemelor de clasament (Top-K, Kth largest) si algoritmului Dijkstra.'
  },
  {
    id: 'coll-06',
    category: 'COLLECTIONS',
    difficulty: 'USOR',
    title: 'ArrayDeque vs java.util.Stack: De ce Stack este Deprecated?',
    question: 'De ce documentatia oficiala Java recomanda folosirea lui ArrayDeque in locul clasei java.util.Stack?',
    answer: 'Clasa java.util.Stack este o clasa relicva din Java 1.0 care mosteneste direct din java.util.Vector:\n1. Sincronizare inutila: Toate metodele din Vector si Stack sunt synchronized, adaugand un cost de performanta masiv chiar si cand lucrezi pe un singur thread.\n2. Incalca principiul OOP LIFO: Mostenind din Vector, Stack permite apelarea de metode precum get(index) sau insertElementAt(item, 0), permitand acces la orice pozitie a stivei, nu doar la varf!\n\nArrayDeque (Array Double Ended Queue) implementeaza interfata Deque, este nesincronizat, mai rapid ca Stack si LinkedList si functioneaza atat ca Stiva (push/pop) cat si ca Coada (offer/poll).',
    codeSnippet: `// GRESIT (Invechit):
Stack<String> oldStack = new Stack<>();

// RECOMANDAT:
Deque<String> modernStack = new ArrayDeque<>();
modernStack.push("A");
modernStack.push("B");
String top = modernStack.pop(); // "B"`,
    interviewTrap: 'ArrayDeque nu permite elemente NULL. Daca incerci sa faci push(null) va arunca NullPointerException.',
    keyTakeaway: 'Foloseste intotdeauna ArrayDeque atat pentru implementari de stiva (LIFO) cat si pentru cozi (FIFO).'
  },
  {
    id: 'spring-11',
    category: 'SPRING_JPA',
    difficulty: 'USOR',
    title: '@Controller vs @RestController in Spring Boot',
    question: 'Care este diferenta dintre adnotarea @Controller si @RestController si cum functioneaza serializarea JSON?',
    answer: '1. @Controller: Este adnotarea clasica Spring MVC pentru aplicatii cu randare de pagini pe server (Thymeleaf, JSP). Metodele sale returneaza un nume de view (un String care indica template-ul HTML). Daca doresti sa returnezi JSON direct dintr-o metoda, trebuie sa adaugi adnotarea @ResponseBody pe acea metoda.\n\n2. @RestController: Este o adnotare compusa (@Controller + @ResponseBody). Toate metodele dintr-un @RestController returneaza direct date (obiecte Java, DTO-uri) care sunt serializate automat in format JSON/XML prin HttpMessageConverters (implicit libraria Jackson) si trimise direct in corpul raspunsului HTTP.',
    codeSnippet: `@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Controller
@ResponseBody
public @interface RestController { ... }`,
    interviewTrap: 'Daca pui @Controller si returnezi un obiect JobDto fara @ResponseBody, Spring va cauta un template HTML cu numele clasei si va returna 404 sau 500!',
    keyTakeaway: '@RestController este adnotarea standard pentru construirea de RESTful Web Services in Spring Boot.'
  },
  {
    id: 'spring-12',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Gestionarea Globala a Erorilor cu @ControllerAdvice & ProblemDetails',
    question: 'Cum implementezi tratarea centralizata a exceptiilor in Spring Boot 3 folosind standardul ProblemDetails (RFC 7807)?',
    answer: 'In Spring Boot, nu tratam erorile cu try-catch in fiecare controller. Folosim un interceptor global adnotat cu @RestControllerAdvice (sau @ControllerAdvice):\n1. @ExceptionHandler(CustomNotFoundException.class): Prinde exceptiile specifice aruncate din orice controller din aplicatie.\n2. In Spring Boot 3+, se foloseste clasa ProblemDetail (conform RFC 7807), care ofera un format JSON standardizat international pentru erori HTTP (cu campuri: type, title, status, detail, instance, timestamp).',
    codeSnippet: `@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ProblemDetail handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage()
        );
        problem.setTitle("Resursa nu a fost gasita");
        problem.setProperty("timestamp", Instant.now());
        return problem;
    }
}`,
    interviewTrap: 'Nu returna stack trace-ul complet al exceptiei catre client in raspunsul JSON de eroare in productie! Reprezinta o vulnerabilitate majora de securitate (Information Disclosure).',
    keyTakeaway: '@RestControllerAdvice asigura raspunsuri de eroare curate, standardizate si consistente pe tot API-ul.'
  },
  {
    id: 'spring-13',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Injectarea unui Bean Prototype intr-un Bean Singleton',
    question: 'Ce problema apare daca injectezi un Bean cu scope Prototype intr-un Bean Singleton si care sunt solutiile corecte?',
    answer: 'Problema Scopes:\nUn Bean Singleton este instantiat O SINGURA DATA la pornirea containerului Spring. Cand dependintele sale sunt injectate in constructor, instanta Prototype este injectata tot o singura data. Ca urmare, apelurile ulterioare vor folosi mereu aceeasi instanta initiala, anuland complet scope-ul Prototype!\n\nSolutii:\n1. ObjectProvider<PrototypeBean>: Sursa dinamica ce instantiaza un bean nou la fiecare apel provider.getObject().\n2. @Lookup Method Injection: Spring suprascrie metoda abstracta la runtime folosind CGLIB pentru a returna o noua instanta din context.\n3. Folosirea unui BeanFactory programatic.',
    codeSnippet: `@Service
public class OrderProcessor { // SINGLETON
    private final ObjectProvider<TokenGenerator> tokenGenProvider; // PROTOTYPE

    public OrderProcessor(ObjectProvider<TokenGenerator> tokenGenProvider) {
        this.tokenGenProvider = tokenGenProvider;
    }

    public void process() {
        TokenGenerator tokenGen = tokenGenProvider.getObject(); // Instanta NOUA garantata!
        tokenGen.generate();
    }
}`,
    interviewTrap: 'Nu injecta direct ApplicationContext pentru a apela context.getBean(), deoarece cuplezi codul de business direct cu framework-ul Spring (incalcare IoC).',
    keyTakeaway: 'Foloseste ObjectProvider<T> pentru a consuma bean-uri Prototype in interiorul unui Singleton.'
  },
  {
    id: 'spring-14',
    category: 'SPRING_JPA',
    difficulty: 'MEDIU',
    title: 'Soft Delete in Hibernate cu @SQLDelete si @SQLRestriction',
    question: 'Cum implementezi stergerea logica (Soft Delete) a inregistrarilor in Spring Boot 3 / Hibernate 6 fara a pierde datele istorice?',
    answer: 'Soft Delete inseamna ca randul din baza de date nu este sters fizic cu SQL DELETE, ci i se seteaza o coloana de flag: deleted = true sau deleted_at = NOW().\n\nIn Hibernate 6 (Spring Boot 3):\n1. @SQLDelete(sql = "UPDATE job_postings SET deleted = true WHERE id = ?"): Intercepteaza repository.delete(job) si executa un UPDATE in locul stergerii fizice.\n2. @SQLRestriction("deleted = false"): (Inlocuitorul modern pentru @Where) Adauga automat clauza WHERE deleted = false la TOATE SELECT-urile executate pe acea entitate!',
    codeSnippet: `@Entity
@Table(name = "job_postings")
@SQLDelete(sql = "UPDATE job_postings SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false") // Adauga automat filtru pe SELECT-uri
public class JobPosting {
    @Id private UUID id;
    private String title;
    private boolean deleted = Boolean.FALSE;
}`,
    interviewTrap: 'Interogarile native cu @Query(value = "SELECT * FROM ...", nativeQuery = true) NU tin cont de @SQLRestriction! Trebuie sa adaugi manual clauza WHERE deleted = false.',
    keyTakeaway: '@SQLDelete + @SQLRestriction transforma automat operatiunile standard JPA in stergeri si citiri logice.'
  },
  {
    id: 'sql-05',
    category: 'SQL_DB',
    difficulty: 'MEDIU',
    title: 'EXPLAIN ANALYZE in PostgreSQL: Tipuri de Scan-uri',
    question: 'Ce afiseaza comanda EXPLAIN ANALYZE si care este diferenta dintre Sequential Scan, Index Scan, Index Only Scan si Bitmap Scan?',
    answer: 'EXPLAIN simplu arata planul de executie estimat de optimizatorul PostgreSQL. EXPLAIN ANALYZE executa efectiv interogarea pe server si raporteaza timpul real de executie, numarul de randuri parcurse si utilizarea memoriei.\n\nTipuri de scanare:\n1. Sequential Scan (Seq Scan): Citeste toate blocurile de pe disc rand cu rand (rapid pe tabele mici, dezastruos pe tabele mari).\n2. Index Scan: Parcurge arborele B-Tree pentru a gasi pointerii TID si apoi citeste datele din Heap table.\n3. Index Only Scan (Cel mai rapid): Toate coloanele cerute in SELECT si WHERE se afla direct in index! Baza de date nu mai atinge deloc tabela fizica de pe disc.\n4. Bitmap Index Scan: Folosit cand sunt implicate mai multe conditii cu indecsi diferiti; construieste o harta de biti in memorie si citeste blocurile ordonate fizic de pe disc.',
    codeSnippet: `-- Verificare performanta:
EXPLAIN (ANALYZE, BUFFERS)
SELECT title, company_name FROM job_postings 
WHERE status = 'ACTIVE' AND created_at > '2026-01-01';`,
    interviewTrap: 'Daca o interogare returneaza un procent mare din tabela (peste 15-20% din randuri), Postgres va alege intentionat Seq Scan in locul Index Scan, deoarece citirea secventiala este mai rapida decat sariturile aleatorii pe disc!',
    keyTakeaway: 'Pentru performanta maxima la citire, creeaza Covering Indexes (cu clauza INCLUDE in Postgres) pentru a obtine Index Only Scan.'
  },
  {
    id: 'conc-06',
    category: 'CONCURRENCY',
    difficulty: 'MEDIU',
    title: 'Stari ale unui Thread in Java si wait() vs sleep()',
    question: 'Care sunt cele 6 stari ale unui fir de executie in Thread.State si care este diferenta fundamentala intre Object.wait() si Thread.sleep()?',
    answer: 'Cele 6 stari ale unui thread in Java:\n1. NEW: Creat dar nepornit (inainte de .start()).\n2. RUNNABLE: Se executa activ pe CPU sau asteapta alocare de timp de procesor in OS.\n3. BLOCKED: Asteapta sa obtina un monitor lock (pentru a intra intr-o sectiune synchronized).\n4. WAITING: Asteapta la infinit ca alt thread sa semnalizeze (wait(), join(), LockSupport.park()).\n5. TIMED_WAITING: Asteapta pentru un interval limitat de timp (sleep(ms), wait(timeout)).\n6. TERMINATED: Executia metodei run() s-a finalizat sau a picat cu exceptie netratata.\n\nwait() vs sleep():\n- Thread.sleep(ms): Nu elibereaza lock-ul detinut pe obiect! Thread-ul adoarme tinand lock-ul blocat pentru oricine altcineva.\n- Object.wait(): ELIBEREAZA lock-ul pe obiectul respectiv, permitand altor thread-uri sa intre in synchronized pana la primirea unui notify() sau notifyAll().',
    codeSnippet: `// wait() poate fi apelat DOAR intr-un bloc synchronized pe acel obiect:
synchronized (lock) {
    while (!condition) {
        lock.wait(); // Elibereaza lock-ul si asteapta
    }
    // La trezire re-achizitioneaza lock-ul automat
}`,
    interviewTrap: 'Apelul wait() fara bloc synchronized arunca instantaneu IllegalMonitorStateException!',
    keyTakeaway: 'Apeleaza intotdeauna wait() intr-o bucla while, niciodata intr-un simplu if, pentru a preveni Spurious Wakeups.'
  },
  {
    id: 'conc-07',
    category: 'CONCURRENCY',
    difficulty: 'MEDIU',
    title: 'CountDownLatch vs CyclicBarrier in Java',
    question: 'Care este diferenta dintre clasele de sincronizare CountDownLatch si CyclicBarrier din java.util.concurrent?',
    answer: '1. CountDownLatch (One-Shot):\n   - Functioneaza ca un numarator invers (countdown).\n   - Unul sau mai multe thread-uri asteapta apeland latch.await() pana cand alte thread-uri decrementeaza contorul la 0 prin latch.countDown().\n   - Nu poate fi resetat dupa ce a ajuns la 0 (este de unica folosinta).\n   - Exemplu: Asteptarea ca 3 microservicii independente sa finalizeze initializarea inainte de a deschide traficul HTTP.\n\n2. CyclicBarrier (Reutilizabil):\n   - Ofera un punct comun de intalnire (rendezvous point) pentru un numar fix de N thread-uri.\n   - Fiecare thread apeleaza barrier.await() si ramane blocat pana cand toate cele N thread-uri au sosit la bariera. In acel moment, toate firele sunt eliberate simultan.\n   - Poate fi resetata si refolosita in bucle ciclice pe runde repetate.',
    codeSnippet: `// 1. CountDownLatch (Start dupa ce 3 servicii sunt gata):
CountDownLatch latch = new CountDownLatch(3);
// In fiecare worker:
latch.countDown();
// In main thread:
latch.await(); // Se deblocheaza cand contorul e 0

// 2. CyclicBarrier:
CyclicBarrier barrier = new CyclicBarrier(4, () -> System.out.println("Toti au ajuns la runda urmatoare!"));
barrier.await();`,
    interviewTrap: 'CountDownLatch este axat pe evenimente (numara de cate ori s-a apelat countDown), in timp ce CyclicBarrier este axat pe thread-uri (toate firele asteapta la aceeasi bariera).',
    keyTakeaway: 'Pentru task-uri de initializare: CountDownLatch. Pentru simulari paralele in runde: CyclicBarrier.'
  },
  {
    id: 'sys-06',
    category: 'SYSTEM_DESIGN',
    difficulty: 'MEDIU',
    title: 'Rate Limiting: Token Bucket vs Sliding Window',
    question: 'Cum functioneaza algoritmul Token Bucket pentru protectia API-urilor impotriva atacurilor DoS si cum se implementeaza in Spring Boot?',
    answer: 'Algoritmul Token Bucket este cel mai utilizat model de Rate Limiting:\n1. Functionare:\n   - Exista o galeata (Bucket) cu o capacitate maxima de token-uri (ex: 100 token-uri).\n   - Token-urile se adauga continuu in galeata la o rata fixa (ex: 10 token-uri pe secunda).\n   - La fiecare apel de API, clientul trebuie sa consume 1 token.\n   - Daca exista token-uri disponibile: Cererea este acceptata (HTTP 200).\n   - Daca galeata este goala: Cererea este respinsa instant cu HTTP 429 Too Many Requests (cu header-ul Retry-After: 3).\n2. Avantaj masiv: Permite "bursts" scurte de trafic (pana la capacitatea maxima a galetii) pastrand in acelasi timp media stabila pe termen lung.\n3. Implementare in Spring: Se foloseste libraria Bucket4j impreuna cu Redis pentru Rate Limiting distribuit pe cluster.',
    codeSnippet: `// Bucket4j in Spring Boot:
Bandwidth limit = Bandwidth.classic(50, Refill.greedy(10, Duration.ofSeconds(1)));
Bucket bucket = Bucket.builder().addLimit(limit).build();

if (bucket.tryConsume(1)) {
    return ResponseEntity.ok(processRequest());
} else {
    return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
        .header("Retry-After", "1")
        .body("Rata maxima de cereri depasita");
}`,
    interviewTrap: 'Daca implementezi Rate Limiter-ul in memorie locala pe un pod de Kubernetes, clientul poate ocoli limita daca da request-uri catre alte pod-uri din spatele load balancer-ului. Rate Limiter-ul trebuie sa fie distribuit in Redis!',
    keyTakeaway: 'Token Bucket cu Redis protejeaza microserviciile de caderi prin respingerea rapida a cererilor peste limita (HTTP 429).'
  }
];
