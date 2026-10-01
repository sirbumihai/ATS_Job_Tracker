// Deck Masiv: Java Core, OOP, JVM Internals, Colectii, Concurenta & Java 21
// Preluat din: Baeldung, DopplerHQ, kgurcharan/java-interview-questions, Junior-Java-Guide
// Peste 50 de intrebari reale de interviu tehnic complet structurate cu cod, capcane si concluzii.
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const JAVA_DECK = [
  // ==========================================
  // 1. OOP, DESIGN & CORE LANGUAGE FUNDAMENTALS
  // ==========================================
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
    difficulty: 'USOR',
    title: 'String vs StringBuilder vs StringBuffer',
    question: 'Care este diferenta de performanta si siguranta a firelor de executie (Thread-Safety) intre String, StringBuilder si StringBuffer?',
    answer: '1. String: Imutabil. Orice modificare (concatenare cu +) creeaza un obiect NOU pe Heap. In bucle mari genereaza cantitati uriase de obiecte temporare si incetineste Garbage Collector-ul.\n2. StringBuffer (Java 1.0): Mutabil si THREAD-SAFE. Toate metodele sale principale (append, insert) sunt sincronizate cu cuvantul cheie synchronized. Are cost suplimentar de sincronizare chiar daca ruleaza pe un singur thread.\n3. StringBuilder (Java 5): Mutabil si NON-THREAD-SAFE. Nu foloseste synchronized, fiind cu 50-80% mai rapid decat StringBuffer. Este alegerea standard pentru constructia de siruri pe un singur fir de executie (in metode locale).',
    codeSnippet: `// GRESIT (Creeaza 10.000 de obiecte String in Heap):
String s = "";
for (int i = 0; i < 10000; i++) s += i;

// CORECT (Modifica un singur buffer intern de caractere):
StringBuilder sb = new StringBuilder(10000);
for (int i = 0; i < 10000; i++) sb.append(i);
String result = sb.toString();`,
    interviewTrap: 'Daca stii dinainte marimea aproximativa a sirului, paseaza capacitatea initiala constructorului new StringBuilder(capacity) pentru a evita redimensionarile interne repetate ale array-ului de caractere.',
    keyTakeaway: 'StringBuilder pentru performanta pe un singur thread; StringBuffer doar daca partajezi bufferul intre thread-uri multiple; String pentru constante.'
  },
  {
    id: 'java-04',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'De ce Java este STRICT Pass-by-Value si NU Pass-by-Reference?',
    question: 'Explica de ce se spune ca Java este strict "Pass-by-Value". Ce se transmite efectiv cand pasezi un obiect ca argument intr-o metoda?',
    answer: 'In Java, absolut totul se transmite prin valoare (Pass-by-Value):\n1. Pentru tipuri primitive (int, double): Se transmite o COPIE a valorii numerice. Modificarea parametrului in interiorul metodei nu afecteaza variabila originala a apelantului.\n2. Pentru obiecte: Nu se transmite obiectul in sine si nici o referinta mutabila C++, ci se transmite O COPIE A REFERINTEI (valoarea adresei de memorie din Stack). Ca urmare:\n   - Poti modifica starea interna a obiectului prin apelul de metode (ex: user.setName("Mihai")).\n   - Dar daca reasignezi parametrul cu new User(), reasignezi doar copia locala din stiva; variabila originala a apelantului ramane neschimbata!',
    codeSnippet: `public static void modify(User u) {
    u.setName("Alex"); // Afecteaza obiectul original din Heap!
    u = new User("Dan"); // Reasigneaza doar copia locala a referintei!
}

User user = new User("Ion");
modify(user);
System.out.println(user.getName()); // Afiseaza "Alex", NU "Dan"!`,
    interviewTrap: 'Multi candidati spun gresit ca "primitivele sunt pass-by-value, iar obiectele sunt pass-by-reference". In Java, chiar si referintele la obiecte sunt transmise prin valoarea lor!',
    keyTakeaway: 'In Java se copiaza mereu valoarea: la primitive valoarea numerica, la obiecte valoarea pointerului catre Heap.'
  },
  {
    id: 'java-05',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Poti suprascrie (Override) o metoda statica in Java?',
    question: 'Poate o clasa copil sa suprascrie o metoda statica definita in clasa parinte? Ce este Method Hiding?',
    answer: 'NU, metodele statice NU pot fi suprascrise (Override)! Polimorfismul dinamic (Overriding) functioneaza pe baza instantei reale de pe Heap la runtime prin Dynamic Dispatch (tabela vtable). Metodele statice apartin clasei (nu instantei) si sunt legate static la compilare (Compile-time / Early Binding).\n\nDaca declari o metoda statica cu aceeasi semnatura in clasa copil, fenomenul se numeste "Method Hiding" (Ascunderea Metodei). Metoda care se apeleaza depinde strict de tipul referintei declarate la compilare, nu de instanta de pe Heap!',
    codeSnippet: `class Parent { static void print() { System.out.println("Parent"); } }
class Child extends Parent { static void print() { System.out.println("Child"); } }

Parent p = new Child();
p.print(); // Afiseaza "Parent"! Nu s-a apelat metoda din Child!`,
    interviewTrap: 'Daca adaugi adnotarea @Override pe o metoda statica in clasa copil, codul NU compileaza!',
    keyTakeaway: 'Metodele statice se ascund (Method Hiding) si se leaga la compilare; metodele de instanta se suprascriu (Overriding) si se leaga la runtime.'
  },
  {
    id: 'java-06',
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
    id: 'java-07',
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
    id: 'java-08',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Shallow Copy vs Deep Copy in Java',
    question: 'Care este diferenta dintre o copie superficiala (Shallow Copy) si o copie profunda (Deep Copy) si cum implementezi Deep Copy in mod sigur?',
    answer: '1. Shallow Copy (Copie Superficiala):\n   - Creeaza un obiect nou, dar campurile care sunt referinte catre alte obiecte copiaza doar adresa de memorie. Ambele obiecte (originalul si copia) indica spre aceleasi instante interne. Modificarea unui camp intern din copie va altera si originalul!\n   - Metoda Object.clone() face shallow copy implicit.\n\n2. Deep Copy (Copie Profunda):\n   - Creeaza un obiect nou si cloneaza recursiv toate obiectele interne referentiate. Originalul si copia sunt complet independente in memorie.\n\nModalitati de implementare Deep Copy:\n- Copy Constructor dedicat (cea mai rapida si curata metoda recomandata de Joshua Bloch).\n- Serializare/Deserializare JSON cu Jackson sau binary serialization.',
    codeSnippet: `// Copy Constructor pentru Deep Copy:
public class CandidateProfile {
    private String name;
    private List<String> skills;

    // Deep Copy Constructor:
    public CandidateProfile(CandidateProfile other) {
        this.name = other.name;
        this.skills = new ArrayList<>(other.skills); // Lista NOUA separata!
    }
}`,
    interviewTrap: 'Interfata Cloneable din Java este considerata defectuoasa (broken design) deoarece clone() este declarata protected in Object si nu exista metoda clone() in interfata Cloneable!',
    keyTakeaway: 'Foloseste Copy Constructors sau factory methods in loc de Cloneable pentru a crea copii profunde.'
  },
  {
    id: 'java-09',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Ordinea de Initializare la Instantierea unei Clase',
    question: 'In ce ordine se executa blocurile statice, variabilele de instanta, blocurile de initializare si constructorii cand creezi o instanta Child care mosteneste Parent?',
    answer: 'Ordinea stricta de executie este:\n1. Variabilele statice si blocurile de initializare statica ale clasei PARINTE (o singura data, la incarcarea clasei).\n2. Variabilele statice si blocurile statice ale clasei COPIL.\n3. Variabilele de instanta si blocurile non-statice ale clasei PARINTE.\n4. Constructorul clasei PARINTE.\n5. Variabilele de instanta si blocurile non-statice ale clasei COPIL.\n6. Constructorul clasei COPIL.',
    codeSnippet: `class Parent {
    static { System.out.println("1. Static Parent"); }
    { System.out.println("3. Instance Parent"); }
    Parent() { System.out.println("4. Constructor Parent"); }
}
class Child extends Parent {
    static { System.out.println("2. Static Child"); }
    { System.out.println("5. Instance Child"); }
    Child() { System.out.println("6. Constructor Child"); }
}`,
    interviewTrap: 'Blocurile statice se executa o singura data in toata viata aplicatiei cand clasa este incarcata de ClassLoader, in timp ce blocurile de instanta se executa la fiecare apel new!',
    keyTakeaway: 'Static Parent -> Static Child -> Instance Parent -> Constructor Parent -> Instance Child -> Constructor Child.'
  },

  // ==========================================
  // 2. JVM INTERNALS, GC & MEMORY MANAGEMENT
  // ==========================================
  {
    id: 'java-10',
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
    id: 'java-11',
    category: 'JAVA',
    difficulty: 'DIFICIL',
    title: 'Algoritmi de Garbage Collection: G1GC vs ZGC vs Parallel GC',
    question: 'Care sunt diferentele cheie intre colectorii de gunoi G1GC (default in Java 9-21) si ZGC (Zero Latency GC din Java 21)?',
    answer: '1. Parallel GC (Throughput Collector):\n   - Optimizeaza throughput-ul maxim al procesorului. Pauzele Stop-the-World pot dura secunde intregi; ideal pentru aplicatii batch offline.\n\n2. G1GC (Garbage-First GC - Default in Java 9+):\n   - Imparte Heap-ul in mii de regiuni de dimensiuni egale (1MB - 32MB).\n   - Curata mai intai regiunile cu cel mai mult gunoi ("Garbage First").\n   - Permite setarea unui obiectiv de pauza (ex: -XX:MaxGCPauseMillis=200), dar la heap-uri foarte mari pauzele pot depasi tinta.\n\n3. ZGC (Z Garbage Collector - Modern in Java 21):\n   - Scalabil la heap-uri de pana la 16 Terabytes!\n   - Toate fazele costisitoare de marcare, relocare si compactare ruleaza CONCURENT cu aplicatia folosind Colored Pointers si Load Barriers.\n   - Garanteaza pauze Stop-the-World de sub 1 MILISECUNDA, indiferent de marimea memoriei Heap!',
    codeSnippet: `// Activare ZGC generational in Java 21:
java -XX:+UseZGC -XX:+ZGenerational -jar app.jar`,
    interviewTrap: 'ZGC consuma putin mai mult CPU din cauza Load Barriers la accesarea referintelor de obiecte, dar elimina complet blocajele de latenta in aplicatiile web.',
    keyTakeaway: 'G1GC este excelentul default; ZGC este alegerea ideala in Java 21 pentru aplicatii cu cerinte stricte de latenta mica.'
  },
  {
    id: 'java-12',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Ce cauzeaza OutOfMemoryError: Java heap space vs Metaspace vs StackOverflowError?',
    question: 'Care este diferenta dintre OutOfMemoryError pe Heap, OutOfMemoryError pe Metaspace si StackOverflowError?',
    answer: '1. StackOverflowError:\n   - Apare pe stiva thread-ului (Thread Stack Memory) cand numarul de cadre de apel depaseste limita (de obicei cauzat de o recursivitate infinita fara caz de baza).\n\n2. OutOfMemoryError: Java heap space:\n   - Apare cand memoria Heap este plina si Garbage Collector-ul nu poate elibera suficient spatiu pentru a aloca un obiect nou (cauzat de alocari gigantice sau Memory Leaks cu obiecte referentiate permanent).\n\n3. OutOfMemoryError: Metaspace:\n   - Apare in memoria nativa (Off-Heap) cand numarul de clase incarcate in memorie este prea mare (cauzat de generare dinamica necontrolata de proxy-uri CGLIB/Spring, hot reload repetat fara restart sau librarii de bytecode).',
    codeSnippet: `// 1. StackOverflow:
void infiniteRecursion() { infiniteRecursion(); }

// 2. Heap OOM:
List<byte[]> list = new ArrayList<>();
while(true) list.add(new byte[1024 * 1024]);`,
    interviewTrap: 'StackOverflowError este o subclasa de Error, nu de Exception! Nu incerca sa o prinzi cu catch (Exception e).',
    keyTakeaway: 'Recursivitate infinita -> StackOverflowError; colectii nesterse pe Heap -> Heap OOM; generare masiva de clase -> Metaspace OOM.'
  },
  {
    id: 'java-13',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza Ierarhia de ClassLoaders in JVM?',
    question: 'Cum incarca JVM-ul clasele in memorie si ce reprezinta modelul de delegare (Delegation Principle) intre ClassLoaders?',
    answer: 'JVM foloseste o ierarhie stricta de ClassLoaders bazata pe principiul delegarii (Parent Delegation Model):\n1. Bootstrap ClassLoader: Scris in cod nativ C++, incarca clasele fundamentale de baza ale JDK-ului din modulul java.base (java.lang.*, java.util.*).\n2. Platform / Extension ClassLoader: Incarca modulele si extensiile platformei standard.\n3. Application / System ClassLoader: Incarca clasele din classpath-ul aplicatiei tale (fisierele .class si dependintele din JAR-uri).\n\nModelul de Delegare:\nCand o clasa este ceruta, ApplicationClassLoader NU o incarca direct. El deleaga cererea catre parintele sau (Platform), care deleaga mai departe catre Bootstrap. Daca parintele gaseste clasa, o incarca el. Doar daca niciun parinte nu o gaseste, ApplicationClassLoader o incarca din propriul classpath. Acest mecanism previne ca un programator sa rescrie o versiune malitioasa a clasei java.lang.String!',
    codeSnippet: `ClassLoader appCl = Candidate.class.getClassLoader();
ClassLoader platformCl = appCl.getParent();
ClassLoader bootstrapCl = platformCl.getParent(); // Returneaza NULL (C++ nativ)`,
    interviewTrap: 'Daca apelezi String.class.getClassLoader(), metoda returneaza NULL deoarece Bootstrap ClassLoader este implementat in C++ si nu are instanta de obiect Java.',
    keyTakeaway: 'ClassLoaders deleaga intotdeauna cererea parintilor mai intai pentru a proteja integritatea claselor de baza ale JDK-ului.'
  },

  // ==========================================
  // 3. DATA TYPES, STRINGS & WRAPPERS
  // ==========================================
  {
    id: 'java-14',
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
    id: 'java-15',
    category: 'JAVA',
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
  {
    id: 'java-16',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'Autoboxing si capcana NullPointerException',
    question: 'Cum poate o simpla atribuire de tip primitiv sa arunce NullPointerException in timpul unboxing-ului automat?',
    answer: 'Autoboxing-ul este conversia automata facuta de compilator intre tipuri primitive si clase wrapper (ex: int -> Integer). Unboxing-ul este operatiunea inversa (ex: Integer -> int apeland sub capota intValue()).\n\nDaca ai un obiect wrapper (Integer) care are valoarea null si incerci sa il asignezi unei variabile primitive (int) sau il folosesti intr-o expresie aritmetica (==, +, >), JVM apeleaza metoda .intValue() pe referinta nula, aruncand instant NullPointerException!',
    codeSnippet: `Integer countWrapper = null;

// ARUNCA NullPointerException la runtime:
int count = countWrapper; // Compilatorul genereaza: countWrapper.intValue()

// La fel si in conditii logice:
if (countWrapper > 0) { ... } // NPE!`,
    interviewTrap: 'Aceasta eroare apare frecvent in entitati JPA unde campurile numerice din baza de date contin NULL (ex: coloana nullable in Postgres), dar in cod DTO-ul le mapeaza in tipuri primitive (int, boolean).',
    keyTakeaway: 'Verifica intotdeauna daca wrapperul este null inainte de unboxing sau foloseste tipuri primitive doar cand campul este garantat non-null.'
  },

  // ==========================================
  // 4. COLLECTIONS & DATA STRUCTURES
  // ==========================================
  {
    id: 'java-17',
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
    id: 'java-18',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'Cum functioneaza HashSet intern in Java?',
    question: 'Ce structura de date foloseste clasa HashSet in interiorul sau pentru a asigura unicitatea elementelor?',
    answer: 'HashSet NU implementeaza un mecanism propriu de hashing de la zero! Intern, HashSet este doar un simplu wrapper peste o instanta de HashMap (private transient HashMap<E,Object> map).\n\nCand adaugi un element cu set.add(e):\n- Elementul tau este inserat ca si CHEIE in HashMap-ul intern (map.put(e, PRESENT)).\n- Valoarea asociata este o simpla constanta statica "dummy" de tip Object numita PRESENT.\n- Deoarece un HashMap garanteaza ca cheile sunt unice, HashSet garanteaza automat unicitatea elementelor!',
    codeSnippet: `public class HashSet<E> implements Set<E> {
    private transient HashMap<E,Object> map;
    private static final Object PRESENT = new Object();

    public boolean add(E e) {
        return map.put(e, PRESENT) == null; // Daca returneaza null, elementul nu exista
    }
}`,
    interviewTrap: 'Daca obiectul inserat in HashSet nu are implementate corect metodele equals() si hashCode(), HashSet va permite duplicate logice!',
    keyTakeaway: 'HashSet este pur si simplu un HashMap unde valorile sunt ignorate si cheile reprezinta elementele setului.'
  },
  {
    id: 'java-19',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'ArrayList vs LinkedList: De ce evitam LinkedList?',
    question: 'Care este diferenta dintre ArrayList si LinkedList si de ce in aplicatiile enterprise reale se prefera ArrayList in 99% din cazuri?',
    answer: '1. ArrayList: Bazat pe un array dinamic redimensionabil. Ofera acces instantaneu prin index in timp O(1) si este compact in memorie.\n\n2. LinkedList: Lista dublu inlantuita. Fiecare element este impachetat intr-un nod (Node<E>) cu doi pointeri (prev, next).\n\nDe ce evitam LinkedList chiar si la inserari:\n- Cache Locality (Performanta hardware): Elementele dintr-un ArrayList sunt contigue in memorie, potrivindu-se perfect pe liniile de CPU Cache (L1/L2). In LinkedList, nodurile sunt dispersate aleatoriu pe Heap, generand masive CPU Cache Misses.\n- Consum Memorie: Pe un JVM pe 64 de biti, un nod de LinkedList consuma 24-32 bytes overhead suplimentar doar pentru pointeri si header de obiect, pe langa data utila.',
    codeSnippet: `// 1. ArrayList:
List<String> fastList = new ArrayList<>(100);

// 2. Pentru operatii de Coada / Stiva (FIFO/LIFO):
Deque<String> queue = new ArrayDeque<>();`,
    interviewTrap: 'Manualele vechi spun ca LinkedList are O(1) pentru inserare la mijloc. In practica, pana sa inserezi la mijloc trebuie sa parcurgi lista pana acolo in O(n), facand operatia mai lenta decat copierea de memorie din ArrayList (System.arraycopy).',
    keyTakeaway: 'ArrayList este alegerea implicita pentru liste. Pentru cozi sau stive, foloseste ArrayDeque.'
  },
  {
    id: 'java-20',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Fail-Fast vs Fail-Safe Iterators',
    question: 'Ce este un iterator Fail-Fast si de ce apare ConcurrentModificationException daca stergi un element dintr-o lista cu list.remove() in interiorul unui for-each?',
    answer: '1. Fail-Fast (ArrayList, HashMap, HashSet):\n   - Daca structura colectiei este modificata structural (adaugari, stergeri) in timp ce o parcurgi, iteratorul detecteaza diferenta dintre contorul modCount si expectedModCount si arunca instantaneu ConcurrentModificationException.\n   - Scopul este sa previna coruperea silentioasa a datelor.\n\n2. Fail-Safe / Weakly Consistent (ConcurrentHashMap, CopyOnWriteArrayList):\n   - Itereaza pe un snapshot sau pe o vizualizare slab consistenta a datelor. Nu arunca niciodata ConcurrentModificationException cand colectia este modificata concurent.',
    codeSnippet: `List<String> list = new ArrayList<>(List.of("A", "B", "C"));

// CORECT cu removeIf() din Java 8:
list.removeIf(item -> item.equals("B"));`,
    interviewTrap: 'For-each-ul este doar syntactic sugar peste Iterator. Daca apelezi list.remove() in for-each, iteratorul nu stie ca ai modificat lista si da eroare la urmatorul it.next().',
    keyTakeaway: 'Pentru stergere curata in iteratii, foloseste mereu metoda list.removeIf() sau iteratorul dedicat.'
  },
  {
    id: 'java-21',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza ConcurrentHashMap?',
    question: 'Cum reuseste ConcurrentHashMap sa fie thread-safe cu performanta ridicata fata de Collections.synchronizedMap sau vechiul Hashtable?',
    answer: 'Hashtable si Collections.synchronizedMap blocheaza INTREAGA tabela la orice operatiune de citire sau scriere (un singur lock global pe toata colectia), devenind o strangulare masiva de performanta.\n\nConcurrentHashMap (in Java 8+):\n1. Citirile (get): Sunt complet NON-BLOCANTE (Lock-Free), folosind variabile volatile pe noduri.\n2. Scrierile (put): Blocheaza DOAR PRIMUL NOD din bucket-ul specific unde se face inserarea (folosind synchronized pe primul nod din bucket). Nicio alta celula sau bucket nu este blocat!\n3. Daca bucket-ul este gol: Inserarea se face complet fara lock folosind instructiunea hardware CAS (Compare-And-Swap).\n4. Nu permite chei sau valori NULL.',
    codeSnippet: `ConcurrentMap<String, Long> userHits = new ConcurrentHashMap<>();
userHits.computeIfAbsent("user_42", k -> queryDatabase(k));
userHits.merge("user_42", 1L, Long::sum); // Incrementare atomica`,
    interviewTrap: 'Daca folosesti verificari separate: if (!map.containsKey(key)) map.put(key, val), operatia per ansamblu NU este atomica! Foloseste mereu operatiile atomice native: putIfAbsent, computeIfAbsent sau merge.',
    keyTakeaway: 'ConcurrentHashMap scaleaza la mii de thread-uri prin lock-uri granulare pe bucket si citiri fara lock.'
  },
  {
    id: 'java-22',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'PriorityQueue: Arhitectura si Cautarea Top-K elemente',
    question: 'Ce structura de date sta la baza clasei PriorityQueue in Java si cum se foloseste pentru a gasi cele mai mari K elemente dintr-un stream masiv?',
    answer: 'PriorityQueue este o coada de prioritati implementata pe baza unui Min-Heap (sau Max-Heap daca se trimite un Comparator inversat) reprezentat intern ca un array dinamic.\n\nComplexitati:\n- Inserare (offer): O(log N)\n- Extragere minim (poll): O(log N)\n- Inspectare minim (peek): O(1)\n\nAlgoritmul Top-K:\nPentru a retine cele mai mari K elemente dintr-un flux de milioane de joburi, mentinem o PriorityQueue (Min-Heap) de capacitate fixa K. La fiecare element nou, daca e mai mare decat minimul din heap (peek), dam poll() si adaugam elementul nou. La final, heap-ul contine exact cele mai mari K elemente in timp O(N log K), consumand doar O(K) memorie!',
    codeSnippet: `PriorityQueue<Integer> topK = new PriorityQueue<>(k);
for (int salary : allSalaries) {
    topK.offer(salary);
    if (topK.size() > k) topK.poll();
}`,
    interviewTrap: 'Iteratorul unui PriorityQueue NU parcurge elementele in ordine sortata! Pentru a le parcurge in ordine sortata, trebuie sa le extragi pe rand cu poll().',
    keyTakeaway: 'PriorityQueue este cheia rezolvarii problemelor de clasament (Top-K, Kth largest) si algoritmului Dijkstra.'
  },
  {
    id: 'java-23',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'ArrayDeque vs java.util.Stack: De ce Stack este Deprecated?',
    question: 'De ce documentatia oficiala Java recomanda folosirea lui ArrayDeque in locul clasei java.util.Stack?',
    answer: 'Clasa java.util.Stack este o clasa relicva din Java 1.0 care mosteneste direct din java.util.Vector:\n1. Sincronizare inutila: Toate metodele din Vector si Stack sunt synchronized, adaugand un cost de performanta masiv chiar si cand lucrezi pe un singur thread.\n2. Incalca principiul OOP LIFO: Mostenind din Vector, Stack permite apelarea de metode precum get(index) sau insertElementAt(item, 0), permitand acces la orice pozitie a stivei, nu doar la varf!\n\nArrayDeque implementeaza interfata Deque, este nesincronizat, mai rapid ca Stack si LinkedList si functioneaza atat ca Stiva (push/pop) cat si ca Coada (offer/poll).',
    codeSnippet: `Deque<String> modernStack = new ArrayDeque<>();
modernStack.push("A");
modernStack.push("B");
String top = modernStack.pop(); // "B"`,
    interviewTrap: 'ArrayDeque nu permite elemente NULL (arunca NullPointerException).',
    keyTakeaway: 'Foloseste intotdeauna ArrayDeque atat pentru implementari de stiva (LIFO) cat si pentru cozi (FIFO).'
  },
  {
    id: 'java-24',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'TreeMap & TreeSet: Structura si NavigableMap',
    question: 'Ce structura de date sta la baza TreeMap si TreeSet si ce metode speciale ofera interfata NavigableMap?',
    answer: 'TreeMap si TreeSet sunt colectii ordonate bazate pe arbori rosu-negru (Red-Black Trees - arbori binari de cautare auto-echilibrati).\n\nComplexitate garantata:\n- O(log N) pentru get, put, remove, containsKey.\n\nInterfata NavigableMap ofera metode puternice de cautare de proximitate:\n- ceilingKey(k): Returneaza cea mai mica cheie >= k.\n- floorKey(k): Returneaza cea mai mare cheie <= k.\n- higherKey(k) si lowerKey(k): Cautare stricta > k sau < k.\n- subMap(from, to): Vizualizare a unui interval de chei.',
    codeSnippet: `NavigableMap<Integer, String> scores = new TreeMap<>();
scores.put(100, "Mihai");
scores.put(85, "Alex");
scores.put(70, "Dan");

System.out.println(scores.floorKey(90)); // 85 (cel mai apropiat scor <= 90)`,
    interviewTrap: 'Obiectele folosite ca chei intr-un TreeMap trebuie sa implementeze Comparable sau trebuie sa trimiti un Comparator constructorului; altfel, la prima inserare vei primi ClassCastException!',
    keyTakeaway: 'TreeMap garanteaza chei sortate in O(log N) si operatii avansate de proximitate de interval.'
  },
  {
    id: 'java-25',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'LinkedHashMap si implementarea unui LRU Cache',
    question: 'Cum pastreaza LinkedHashMap ordinea elementelor si cum poti construi un LRU Cache (Least Recently Used) in doar 5 linii de cod?',
    answer: 'LinkedHashMap extinde HashMap si adauga o lista dublu inlantuita care trece prin toate intrarile (Node).\n\nPoate fi configurat in doua moduri:\n1. Insertion-Order (Implicit): Itereaza elementele in ordinea in care au fost inserate.\n2. Access-Order: Cand este creat cu constructorul new LinkedHashMap(cap, loadFactor, true), fiecare accesare a unei chei (get sau put) muta nodul respectiv la finalul listei inlantuite!\n\nConstruirea unui LRU Cache:\nSuprascrii metoda removeEldestEntry(Map.Entry eldest) pentru a returna true cand dimensiunea depaseste capacitatea dorita. Cele mai vechi elemente neaccesate vor fi eliminate automat!',
    codeSnippet: `public class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    public LruCache(int capacity) {
        // Al treilea parametru 'true' activeaza ACCESS-ORDER!
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity; // Sterge cel mai vechi nod nefolosit
    }
}`,
    interviewTrap: 'LinkedHashMap este NON-thread-safe. Daca il folosesti ca cache in mediu multi-threaded, trebuie impachetat cu Collections.synchronizedMap.',
    keyTakeaway: 'LinkedHashMap cu access-order = true este solutia nativa eleganta pentru crearea unui LRU Cache.'
  },

  // ==========================================
  // 5. GENERICS, EXCEPtII & ENUMS
  // ==========================================
  {
    id: 'java-26',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Generics si fenomenul de Type Erasure',
    question: 'Ce este Type Erasure in Java si ce se intampla cu tipurile generice (ex: List<String> vs List<Integer>) la compilare si in timpul rularii (runtime)?',
    answer: 'Generics au fost adaugate in Java 5 cu cerinta de compatibilitate retroactiva (backward compatibility) cu versiunile vechi.\n\nType Erasure inseamna ca toate informatiile despre tipurile generice din parametri (<T>, <String>) sunt verificate la COMPILARE si apoi STERSE din bytecode. La runtime, List<String> si List<Integer> devin ambele clasa simpla List (cu elemente de tip Object sau bounded type-ul superior).\n\nConsecinte practice:\n1. Nu poti face new T() sau new T[10].\n2. Nu poti face instanceof List<String> (doar instanceof List<?>).\n3. Nu poti avea metode supraincarcate cu aceeasi semnatura dupa stergere.',
    codeSnippet: `List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();

// La runtime, ambele apartin exact aceleiasi clase:
System.out.println(list1.getClass() == list2.getClass()); // TRUE!`,
    interviewTrap: 'Daca ai nevoie sa afli tipul generic la runtime (de exemplu la deserializare JSON in Jackson/Spring), se foloseste tehnica TypeReference sau Super Type Tokens.',
    keyTakeaway: 'Generics asigura siguranta tipurilor la compilare (Compile-time Type Safety) fara overhead de memorie la runtime.'
  },
  {
    id: 'java-27',
    category: 'JAVA',
    difficulty: 'DIFICIL',
    title: 'Principiul PECS in Generics: Producer Extends, Consumer Super',
    question: 'Ce inseamna principiul PECS (Producer Extends, Consumer Super) propus de Joshua Bloch si cand folosesti <? extends T> vs <? super T>?',
    answer: 'PECS stabileste regulile pentru wildcard-urile generice:\n1. Producer Extends (<? extends T>):\n   - Folosit cand colectia doar PRODUCE date pe care vrei sa le citesti (Read-Only).\n   - Poti citi elemente ca fiind de tip T (deoarece orice element extinde T).\n   - NU poti adauga nimic in colectie (cu exceptia lui null), deoarece compilatorul nu stie tipul exact al subtype-ului!\n\n2. Consumer Super (<? super T>):\n   - Folosit cand colectia CONSUMA date (Write-Only), adica adaugi elemente in ea.\n   - Poti adauga in siguranta obiecte de tip T sau derivate din T.\n   - Citirile returneaza doar Object.',
    codeSnippet: `// Exemplul canonic din Collections.copy(dest, src):
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (int i = 0; i < src.size(); i++) {
        dest.set(i, src.get(i)); // src PRODUCE (get), dest CONSUMA (set)
    }
}`,
    interviewTrap: 'Daca incerci sa apelezi list.add(new Apple()) pe o variabila List<? extends Fruit>, codul NU compileaza!',
    keyTakeaway: 'Daca doar citesti din lista: extends. Daca doar scrii in lista: super. Daca faci si citire si scriere: tip exact fara wildcard.'
  },
  {
    id: 'java-28',
    category: 'JAVA',
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
    if (val < 0) throw new IllegalArgumentException("Valoarea nu poate fi negativa");
}`,
    interviewTrap: 'Error (ex: OutOfMemoryError, StackOverflowError) este de asemenea Unchecked, dar reprezinta defectiuni catastrofale ale JVM-ului; nu incerca sa prinzi Error cu try-catch!',
    keyTakeaway: 'Spring Boot mapeaza majoritatea exceptiilor de baze de date in Unchecked Exceptions (DataAccessException).'
  },
  {
    id: 'java-29',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'try-with-resources si Suppressed Exceptions',
    question: 'Cum functioneaza blocul try-with-resources introdus in Java 7 si ce se intampla cand atat codul din try cat si metoda close() arunca exceptii?',
    answer: 'try-with-resources asigura ca orice resursa care implementeaza java.lang.AutoCloseable este inchisa automat la finalul blocului.\n\nCe sunt Suppressed Exceptions:\nIn vechiul model try-catch-finally, daca atat codul din try cat si cel din finally aruncau cate o exceptie, exceptia din finally o ascundea pe cea din try.\nIn try-with-resources, exceptia aruncata de corpul blocului try este exceptia principala (Primary Exception), iar daca close() arunca si ea o exceptie, aceasta este atasata ca Suppressed Exception (accesibila prin ex.getSuppressed()), pastrand ambele erori!',
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
  },
  {
    id: 'java-30',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'De ce este Enum considerat cel mai sigur Singleton Pattern?',
    question: 'De ce Joshua Bloch recomanda folosirea unui Enum cu o singura valoare ca fiind cel mai sigur mod de a implementa Singleton Pattern in Java?',
    answer: 'Implementarile clasice de Singleton (chiar si Double-Checked Locking cu volatile) pot fi sparte prin:\n1. Reflection: Un programator poate accesa constructorul privat cu constructor.setAccessible(true).\n2. Serializare: La deserializarea unui obiect Singleton se creeaza o instanta complet noua daca nu implementezi corect readResolve().\n\nDe ce Enum este 100% sigur:\n- JVM garanteaza ca un Enum este instantiat o singura data si este thread-safe nativ.\n- Reflection refuza explicit sa creeze instante de Enum (arunca IllegalArgumentException: Cannot reflectively create enum objects).\n- Serializarea Enum-urilor este gestionata special de JVM fara a crea instante duplicate.',
    codeSnippet: `public enum DatabaseConnectionPool {
    INSTANCE;

    private DataSource dataSource;

    public void init() { /* conexiuni */ }
    public Connection getConnection() { return dataSource.getConnection(); }
}

// Utilizare:
DatabaseConnectionPool.INSTANCE.getConnection();`,
    interviewTrap: 'Daca ai nevoie sa extinzi o alta clasa de baza, Enum nu poate fi folosit deoarece mosteneste deja implicit java.lang.Enum.',
    keyTakeaway: 'Un Enum cu o singura valoare este cel mai robust Singleton din Java (rezistent la Reflection si Deserializare).'
  },

  // ==========================================
  // 6. MULTITHREADING, CONCURRENCY & JAVA 21
  // ==========================================
  {
    id: 'java-31',
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
    id: 'java-32',
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
    id: 'java-33',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Stari ale unui Thread in Java si wait() vs sleep()',
    question: 'Care sunt cele 6 stari ale unui fir de executie in Thread.State si care este diferenta fundamentala intre Object.wait() si Thread.sleep()?',
    answer: 'Cele 6 stari ale unui thread in Java:\n1. NEW: Creat dar nepornit (inainte de .start()).\n2. RUNNABLE: Se executa activ pe CPU sau asteapta alocare de timp de procesor in OS.\n3. BLOCKED: Asteapta sa obtina un monitor lock (pentru a intra intr-o sectiune synchronized).\n4. WAITING: Asteapta la infinit ca alt thread sa semnalizeze (wait(), join(), LockSupport.park()).\n5. TIMED_WAITING: Asteapta pentru un interval limitat de timp (sleep(ms), wait(timeout)).\n6. TERMINATED: Executia metodei run() s-a finalizat sau a picat cu exceptie netratata.\n\nwait() vs sleep():\n- Thread.sleep(ms): Nu elibereaza lock-ul detinut pe obiect! Thread-ul adoarme tinand lock-ul blocat pentru oricine altcineva.\n- Object.wait(): ELIBEREAZA lock-ul pe obiectul respectiv, permitand altor thread-uri sa intre in synchronized pana la primirea unui notify() sau notifyAll().',
    codeSnippet: `synchronized (lock) {
    while (!condition) {
        lock.wait(); // Elibereaza lock-ul si asteapta
    }
}`,
    interviewTrap: 'Apelul wait() fara bloc synchronized arunca instantaneu IllegalMonitorStateException!',
    keyTakeaway: 'Apeleaza intotdeauna wait() intr-o bucla while, niciodata intr-un simplu if, pentru a preveni Spurious Wakeups.'
  },
  {
    id: 'java-34',
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
    id: 'java-35',
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
    id: 'java-36',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'ReentrantLock vs synchronized in Java',
    question: 'Ce avantaje ofera clasa ReentrantLock din java.util.concurrent.locks fata de cuvantul cheie nativ synchronized?',
    answer: 'ReentrantLock ofera capabilitati avansate inexistente in synchronized:\n1. Non-blocking Lock Acquisition: Metoda tryLock() incearca sa obtina lock-ul fara sa ramana blocata la infinit.\n2. Lock cu Timeout: lock.tryLock(2, TimeUnit.SECONDS) renunta daca lock-ul nu devine disponibil in 2 secunde (previne deadlock-uri).\n3. Intreruptibilitate: lockInterruptibly() permite unui thread blocat sa fie intrerupt prin thread.interrupt().\n4. Fairness Policy: Poate fi configurat cu new ReentrantLock(true) pentru a acorda lock-ul in ordinea sosirii thread-urilor (FIFO - Fair Lock).\n5. Multiple Conditii: Permite crearea de multiple Condition objects (ex: notFull, notEmpty) pe acelasi lock.',
    codeSnippet: `Lock lock = new ReentrantLock();
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try {
        // Sectiune critica
    } finally {
        lock.unlock(); // OBLIGATORIU in finally!
    }
}`,
    interviewTrap: 'Daca uiti sa apelezi lock.unlock() in interiorul unui bloc finally, lock-ul ramane blocat pentru totdeauna!',
    keyTakeaway: 'synchronized este mai curat si auto-eliberat; ReentrantLock este necesar pentru timeouts, fairness sau Virtual Threads in Java 21.'
  },
  {
    id: 'java-37',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Parametrii critici ai unui ThreadPoolExecutor in Java',
    question: 'Care sunt cei 5 parametri de baza ai unui ThreadPoolExecutor si cum decide executorul cand creeaza thread-uri noi sau pune task-urile in coada?',
    answer: 'Cei 5 parametri sunt:\n1. corePoolSize: Numarul de thread-uri mentinute active permanent in pool.\n2. maximumPoolSize: Numarul maxim de thread-uri permise la sarcina mare.\n3. keepAliveTime: Timpul dupa care thread-urile suplimentare peste corePoolSize sunt oprite daca sunt inactive.\n4. workQueue (BlockingQueue): Coada unde asteapta task-urile cand toate core threads sunt ocupate.\n5. handler (RejectedExecutionHandler): Politica aplicata cand coada este plina si s-a atins maximumPoolSize (AbortPolicy, CallerRunsPolicy).\n\nFluxul de executie surprinzator:\nCand soseste un task nou:\n- Daca numarul de thread-uri < corePoolSize: Creeaza un thread nou.\n- Daca corePoolSize este plin: Pune task-ul in COADA (workQueue)!\n- Doar daca COADA DEVINE PLINA, creeaza thread-uri noi pana la maximumPoolSize!\n- Daca si coada si maximumPoolSize sunt pline: Apeleaza RejectedExecutionHandler.',
    codeSnippet: `ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,                      // corePoolSize
    10,                     // maximumPoolSize
    60L, TimeUnit.SECONDS,  // keepAliveTime
    new ArrayBlockingQueue<>(500), // Coada limitata (Bounded Queue)
    new ThreadPoolExecutor.CallerRunsPolicy() // Backpressure graceful
);`,
    interviewTrap: 'Metodele factory Executors.newFixedThreadPool() folosesc o coada LinkedBlockingQueue NELIMITATA (Integer.MAX_VALUE). Daca task-urile sosesc mai repede decat pot fi procesate, coada consuma tot RAM-ul si duce la OutOfMemoryError!',
    keyTakeaway: 'Foloseste intotdeauna ThreadPoolExecutor cu coada de dimensiune limitata si politica CallerRunsPolicy pentru protectie in productie.'
  },
  {
    id: 'java-38',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'CountDownLatch vs CyclicBarrier in Java',
    question: 'Care este diferenta dintre clasele de sincronizare CountDownLatch si CyclicBarrier din java.util.concurrent?',
    answer: '1. CountDownLatch (One-Shot):\n   - Functioneaza ca un numarator invers (countdown).\n   - Unul sau mai multe thread-uri asteapta apeland latch.await() pana cand alte thread-uri decrementeaza contorul la 0 prin latch.countDown().\n   - Nu poate fi resetat dupa ce a ajuns la 0 (este de unica folosinta).\n   - Exemplu: Asteptarea ca 3 microservicii independente sa finalizeze initializarea inainte de a deschide traficul HTTP.\n\n2. CyclicBarrier (Reutilizabil):\n   - Ofera un punct comun de intalnire (rendezvous point) pentru un numar fix de N thread-uri.\n   - Fiecare thread apeleaza barrier.await() si ramane blocat pana cand toate cele N thread-uri au sosit la bariera. In acel moment, toate firele sunt eliberate simultan.\n   - Poate fi resetata si refolosita in bucle ciclice pe runde repetate.',
    codeSnippet: `// 1. CountDownLatch (Start dupa ce 3 servicii sunt gata):
CountDownLatch latch = new CountDownLatch(3);
latch.countDown();
latch.await();

// 2. CyclicBarrier:
CyclicBarrier barrier = new CyclicBarrier(4, () -> System.out.println("Toti au sosit!"));
barrier.await();`,
    interviewTrap: 'CountDownLatch este axat pe evenimente (numara de cate ori s-a apelat countDown), in timp ce CyclicBarrier este axat pe thread-uri (toate firele asteapta la aceeasi bariera).',
    keyTakeaway: 'Pentru task-uri de initializare: CountDownLatch. Pentru simulari paralele in runde: CyclicBarrier.'
  },
  {
    id: 'java-39',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Ce este Semaphore si cum controleaza accesul la resurse finite?',
    question: 'Ce este un Semaphore in Java si cum se foloseste pentru a implementa Rate Limiting sau un Connection Pool simplificat?',
    answer: 'Un Semaphore gestioneaza un set de "permise" (permits) numerice virtuale:\n- acquire(): Blocheaza thread-ul curent pana cand un permis devine disponibil si il consuma (scade contorul cu 1).\n- release(): Returneaza un permis inapoi la semafor (creste contorul cu 1), eliberand eventualele thread-uri blocate in acquire().\n\nEste utilizat pentru a limita numarul maxim de fire concurente care pot accesa simultan o resursa finita (ex: maxim 5 apeluri simultane catre un API extern scump sau o baza de date).',
    codeSnippet: `Semaphore semaphore = new Semaphore(3); // Maxim 3 conexiuni simultane

public void callExternalApi() throws InterruptedException {
    semaphore.acquire();
    try {
        executeHttpCall();
    } finally {
        semaphore.release(); // OBLIGATORIU in finally!
    }
}`,
    interviewTrap: 'Un Semaphore cu 1 singur permis (new Semaphore(1)) se comporta similar cu un Lock binar, dar cu o diferenta critica: permisul poate fi eliberat de un ALT thread decat cel care l-a achizitionat!',
    keyTakeaway: 'Semaphore limiteaza numarul de accesari concurente la o resursa externa.'
  },
  {
    id: 'java-40',
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

  // ==========================================
  // 7. MODERN JAVA (JAVA 8 - JAVA 21)
  // ==========================================
  {
    id: 'java-41',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Interfete Functionale de baza in java.util.function',
    question: 'Care sunt cele 4 interfete functionale fundamentale din Java 8 si care sunt semnaturile metodelor lor abstracte (Predicate, Function, Consumer, Supplier)?',
    answer: 'Cele 4 interfete canonice pe care se bazeaza Lambdas si Streams API:\n1. Predicate<T>: Primeste T si returneaza boolean (metoda: boolean test(T t)). Folosit in Stream.filter().\n2. Function<T, R>: Primeste T si returneaza R (metoda: R apply(T t)). Folosit in Stream.map().\n3. Consumer<T>: Primeste T si nu returneaza nimic / void (metoda: void accept(T t)). Folosit in Stream.forEach().\n4. Supplier<T>: Nu primeste niciun parametru si produce o valoare T (metoda: T get()). Folosit in Optional.orElseGet() sau generatoare.',
    codeSnippet: `Predicate<String> isShort = s -> s.length() < 5;
Function<String, Integer> toLength = String::length;
Consumer<String> printer = System.out::println;
Supplier<Double> randomGen = Math::random;`,
    interviewTrap: 'Daca o interfata are mai mult de o metoda abstracta, NU este o interfata functionala chiar daca are adnotarea @FunctionalInterface (compilatorul va da eroare)! Metodele default si statice nu se contorizeaza ca abstracte.',
    keyTakeaway: 'Predicate = test boolean; Function = transformare; Consumer = consum void; Supplier = furnizare valoare.'
  },
  {
    id: 'java-42',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Operatii Intermediare (Lazy) vs Terminale in Streams API',
    question: 'De ce operatiile dintr-un Java Stream sunt "Lazy" (lenese) si ce declanseaza executia efectiva a procesarii?',
    answer: '1. Operatii Intermediare (Intermediate Operations):\n   - Exemple: filter(), map(), flatMap(), distinct(), sorted(), limit().\n   - Sunt complet LAZY: Nu proceseaza niciun element si nu consuma memorie cand sunt apelate. Ele doar construiesc un pipeline declarativ de transformari.\n\n2. Operatii Terminale (Terminal Operations):\n   - Exemple: collect(), forEach(), reduce(), count(), anyMatch(), findFirst().\n   - Sunt EAGER: Doar apelarea unei operatii terminale declanseaza executia pipeline-ului.\n\nOptimizarea Short-Circuiting:\nDeoarece stream-urile sunt lazy, Java poate procesa elementele pe rand pe verticala (nu genereaza colectii intermediare). De exemplu, intr-un filter() urmat de findFirst(), procesarea se opreste imediat dupa primul element valid!',
    codeSnippet: `List<String> names = List.of("Ana", "Bogdan", "Cristian");

// Nimic nu se executa AICI (doar definire pipeline):
Stream<String> stream = names.stream()
    .filter(n -> { System.out.println("Filter: " + n); return n.length() > 3; });

System.out.println("Inainte de terminal");
String first = stream.findFirst().orElse(""); // Abia AICI se executa!`,
    interviewTrap: 'Un Stream poate fi consumat O SINGURA DATA! Daca incerci sa apelezi o a doua operatie terminala pe aceeasi instanta de Stream, vei primi IllegalStateException: stream has already been operated upon or closed.',
    keyTakeaway: 'Operatiile intermediare doar configureaza pipeline-ul; operatia terminala declanseaza executia element cu element.'
  },
  {
    id: 'java-43',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'De ce NU trebuie sa folosesti parallelStream() pentru operatiuni I/O?',
    question: 'De ce folosirea lui parallelStream() pentru apeluri HTTP sau interogari de baze de date poate bloca intreaga aplicatie?',
    answer: 'parallelStream() foloseste sub capota un thread pool global partajat la nivelul intregului JVM: ForkJoinPool.commonPool().\n\nMarimea acestui pool este egala cu numarul de nuclee CPU (Runtime.getRuntime().availableProcessors() - 1).\n\nDe ce este periculos pentru I/O:\nForkJoinPool a fost proiectat pentru calcule intensive de procesor (CPU-bound, divide-et-impera). Daca lansezi apeluri HTTP sau interogari DB blocante intr-un parallelStream(), toate firele din ForkJoinPool.commonPool vor ramane blocate in asteptare I/O. Niciun alt modul din aplicatie nu va mai putea rula sarcini paralele, degradand grav intregul sistem!',
    codeSnippet: `// GRESIT (Blocheaza ForkJoinPool.commonPool global cu apeluri I/O lente):
jobUrls.parallelStream().forEach(this::callExternalHttpApi);

// CORECT: Foloseste Virtual Threads (Java 21) sau un ThreadPoolExecutor dedicat!`,
    interviewTrap: 'Pentru colectii mici (sub 10.000 de elemente), parallelStream() este adesea MAI LENT decat un stream secvential simplu din cauza overhead-ului de impartire a task-urilor si combinare de rezultate.',
    keyTakeaway: 'parallelStream() este strict pentru calcule masive CPU-bound in memorie, niciodata pentru I/O de retea sau baze de date.'
  },
  {
    id: 'java-44',
    category: 'JAVA',
    difficulty: 'USOR',
    title: 'Bune practici cu Optional in Java 8+',
    question: 'Care sunt cele mai mari greseli de utilizare a clasei Optional<T> si de ce orElseGet() este preferat in locul lui orElse()?',
    answer: 'Optional a fost creat exclusiv ca tip de retur pentru metode pentru a indica clar lipsa unei valori (eliminand NullPointerException).\n\nReguli de bune practici:\n1. Nu folosi niciodata optional.get() fara verificare anterioara isPresent() (sau foloseste direct orElseThrow()).\n2. Nu folosi Optional ca tip de camp intr-o entitate (nu este Serializable).\n3. Nu folosi Optional ca parametru de metoda.\n4. orElse() vs orElseGet():\n   - orElse(expresie): Evalueaza expresia INTOTDEAUNA, chiar daca Optional-ul contine deja o valoare!\n   - orElseGet(supplier): Evalueaza expresia doar daca Optional-ul este gol (Lazy Evaluation).',
    codeSnippet: `// GRESIT: generateDefault() se apeleaza MEREU, consumand resurse!
User user = findUser().orElse(generateDefaultFromDb());

// CORECT: Supplier-ul se executa DOAR cand utilizatorul lipseste:
User user = findUser().orElseGet(() -> generateDefaultFromDb());`,
    interviewTrap: 'Nu returna niciodata null dintr-o metoda care are tipul de retur Optional<T>! Returneaza intotdeauna Optional.empty().',
    keyTakeaway: 'Foloseste orElseGet() pentru valori de fallback costisitoare si Optional strict ca tip de retur de metoda.'
  },
  {
    id: 'java-45',
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
    id: 'java-46',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Ce sunt Sealed Classes in Java 17+ (permits, final, non-sealed)?',
    question: 'Ce problema de design rezolva clasele sigilate (Sealed Classes) si care sunt cele 3 cuvinte cheie pe care le pot avea clasele descendente?',
    answer: 'In Java traditional, o clasa putea fi ori mostenita de oricine (public), ori nemostenita de nimeni (final). Nu exista o cale de mijloc.\n\nSealed Classes permit unui autor de librarie sa declare explicit care clase au voie sa o mosteneasca folosind clauza permits:\npublic sealed class PaymentMethod permits CreditCard, BankTransfer, Crypto {}\n\nRegula celor 3 modificatori pe subclase:\nFiecare clasa mentionata in permits trebuie sa aiba exact unul din cei 3 modificatori:\n1. final: Nu mai poate fi extinsa deloc.\n2. sealed: Extinde clasa, dar isi declara propria sa lista restransa de copii permits.\n3. non-sealed: Se deschide mostenirii nelimitate de catre oricine.\n\nBeneficiu major: Permite verificarea exhaustiva in switch expressions in Java 21 fara a mai fi nevoie de clauza default!',
    codeSnippet: `public sealed interface Notification permits EmailAlert, SmsAlert {}
public final class EmailAlert implements Notification {}
public final class SmsAlert implements Notification {}

// Switch exhaustiv verificat la compilare (fara default):
String send(Notification n) {
    return switch (n) {
        case EmailAlert e -> "Email trimis";
        case SmsAlert s -> "SMS trimis";
    };
}`,
    interviewTrap: 'Toate subclasele permise trebuie sa se afle in acelasi modul sau in acelasi pachet (package) cu clasa parinte sealed!',
    keyTakeaway: 'Sealed classes definesc ierarhii de mostenire controlate si permit pattern matching exhaustiv la compilare.'
  },
  {
    id: 'java-47',
    category: 'JAVA',
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

  // ==========================================
  // 8. SERIALIZARE, I/O & REFLECTION
  // ==========================================
  {
    id: 'java-48',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'La ce foloseste serialVersionUID si cuvantul cheie transient?',
    question: 'Ce rol are campul serialVersionUID intr-o clasa Serializable si ce se intampla cu campurile declarate cu cuvantul cheie transient la serializare?',
    answer: '1. serialVersionUID:\n   - Este un identificator numeric de versiune asociat fiecarei clase Serializable.\n   - La serializare, JVM scrie acest ID in fluxul de octeti. La deserializare, compara ID-ul din flux cu ID-ul clasei curente din classpath.\n   - Daca nu declari explicit serialVersionUID, compilatorul genereaza automat un hash bazat pe campurile si metodele clasei. Daca adaugi ulterior un simplu camp nou, ID-ul se schimba, iar deserializarea obiectelor vechi va esua cu InvalidClassException!\n\n2. Cuvantul cheie transient:\n   - Marcheaza un camp pentru a fi IGNORAT complet de procesul de serializare nativa Java.\n   - La deserializare, campul primeste valoarea sa default (null pentru obiecte, 0 pentru numere, false pentru booleeni).\n   - Folosit pentru date sensibile (parole, chei criptografice) sau resurse legate de mediul local (socket-uri, conexiuni la DB).',
    codeSnippet: `public class UserSession implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private transient String rawPassword; // NU se serializeaza pe disc/retea!
}`,
    interviewTrap: 'Variabilele statice (static) NU sunt serializate oricum, deoarece ele apartin clasei, nu instantei!',
    keyTakeaway: 'Declara intotdeauna explicit private static final long serialVersionUID = 1L; si marcheaza datele confidentiale cu transient.'
  },
  {
    id: 'java-49',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Java Reflection API: Putere si Riscuri in Productie',
    question: 'Ce este Java Reflection API, cum il folosesc framework-urile moderne (Spring Boot, Jackson) si care sunt cele 3 dezavantaje majore ale sale?',
    answer: 'Reflection permite inspectarea si modificarea la runtime a claselor, campurilor, metodelor si constructorilor, chiar si a celor private (prin setAccessible(true)).\n\nUtilizare in framework-uri:\n- Spring Boot: Inspecteaza adnotarile (@Autowired, @Service) si instantiaza componentele.\n- Jackson: Citeste campurile claselor pentru a le serializa in JSON.\n\n3 Dezavantaje / Riscuri majore:\n1. Performanta scazuta: Apelurile reflexive nu pot fi optimizate agresiv de compilatorul JIT (inlining-ul este dezactivat) si implica verificari de securitate la fiecare invocare.\n2. Pierderea Compile-Time Safety: Erorile de denumire a metodelor sau tipurilor apar abia la runtime sub forma de NoSuchMethodException sau ClassNotFoundException.\n3. Risc de Securitate si Incapsulare: Incalca incapsularea claselor prin accesarea datelor private; in Java 9+, sistemul de module (JPMS) blocheaza accesul reflexiv pe pachete interne fara configurare explicita (--add-opens).',
    codeSnippet: `// Inspectare reflexiva camp privat:
Field field = Candidate.class.getDeclaredField("salary");
field.setAccessible(true); // Ocoleste modificatorul private!
field.set(candidateInstance, 5000.0);`,
    interviewTrap: 'Incepand cu Java 17+, comanda setAccessible(true) pe clase interne ale JDK-ului arunca InaccessibleObjectException daca modulul nu este deschis explicit.',
    keyTakeaway: 'Reflection este esential pentru framework-uri si unelte de testare, dar trebuie evitat in logica de business curenta.'
  },
  {
    id: 'java-50',
    category: 'JAVA',
    difficulty: 'MEDIU',
    title: 'Java NIO.2 vs IO Traditional (Streams vs Channels & Buffers)',
    question: 'Care este diferenta dintre vechiul pachet java.io (bazat pe Streams) si java.nio (Non-blocking I/O) introdus pentru servere de inalta performanta?',
    answer: '1. Java IO Traditional (Stream-Oriented & Blocking):\n   - Functioneaza cu fluxuri secventiale de bytes (InputStream, OutputStream).\n   - Este BLOCKING: Cand un thread citeste din socket sau fisier (read()), el ramane complet blocat pana cand sosesc datele. Pentru a deservi 10.000 de clienti simultan, aveai nevoie de 10.000 de thread-uri (Memory & Context Switching limitat).\n\n2. Java NIO (Buffer & Channel-Oriented & Non-Blocking):\n   - Datele sunt citite dintr-un Channel intr-un Buffer de memorie nativa direct alocat (DirectByteBuffer).\n   - Selector Pattern: Un singur thread poate monitoriza mii de canale deschise folosind mecanismele native ale sistemului de operare (epoll in Linux, kqueue in macOS). Cand un canal are date disponibile pentru citire, Selector-ul notifica thread-ul.\n   - Sta la baza serverelor reactiv-asincrone de mare viteza precum Netty, Tomcat NIO si Node.js.',
    codeSnippet: `// Citire moderna si rapida cu java.nio.file.Files:
Path path = Path.of("cv.pdf");
byte[] data = Files.readAllBytes(path);
List<String> lines = Files.readAllLines(path);`,
    interviewTrap: 'Pentru fisiere mici pe disc, metodele statice din Files (Files.writeString, Files.readString) sunt mai rapide si mai sigure decat codul vechi cu BufferedReader/FileReader.',
    keyTakeaway: 'IO clasic = stream-uri blocante thread-per-client; NIO = canale non-blocante cu selectoare pentru mii de conexiuni paralele pe un singur thread.'
  }
];
