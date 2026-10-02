// Deck Masiv: Java Core, OOP, JVM Internals, Colectii, Concurenta, Memorie & Java 21
// Preluat din: Baeldung, DopplerHQ, kgurcharan/java-interview-questions, Junior-Java-Guide
// Peste 200 de intrebari reale de interviu tehnic complet structurate cu cod, capcane si concluzii.
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const JAVA_DECK = [
  {
    id: "java-01",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Contractul equals() si hashCode() in Java",
    question: "Ce stipuleaza contractul dintre metodele equals() si hashCode() din clasa Object? Ce problema grava apare daca suprascrii equals() dar nu si hashCode() intr-o entitate folosita in HashSet sau HashMap?",
    answer: "Contractul stipuleaza doua reguli fundamentale:\n1. Daca doua obiecte sunt egale conform equals(), ele TREBUIE sa returneze acelasi hashCode().\n2. Daca doua obiecte au acelasi hashCode(), NU este obligatoriu sa fie egale (coliziune de hash).\n\nDaca suprascrii doar equals(): cand adaugi un obiect intr-un HashSet sau ca cheie intr-un HashMap, JVM calculeaza bucket-ul pe baza hashCode()-ului implicit (adresa din memorie). Daca cauti acelasi obiect logic (alt obiect cu aceleasi campuri), acesta va primi alt hash, va cauta in alt bucket si get(key) va returna NULL sau va introduce duplicate in HashSet!",
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
    interviewTrap: "Campurile folosite la calculul hashCode() trebuie sa fie IMUTABILE. Daca modifici un camp dupa inserarea in HashSet, nu mai poti gasi niciodata obiectul (Memory Leak)!",
    keyTakeaway: "Equals egal implica HashCode egal. Niciodata nu suprascrie doar una din cele doua metode."
  },
  {
    id: "java-02",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce este String imutabil in Java si ce este Pool-ul?",
    question: "De ce clasa String este declarata \"final\" si imutabila in Java? Ce este String Constant Pool si ce se intampla la executarea: String s = new String(\"test\")?",
    answer: "String este imutabil pentru 4 ratiuni majore:\n1. String Constant Pool (Memorie): Reutilizeaza secventele identice de caractere in Heap, economisind memorie masiva.\n2. Securitate: Parametrii de conexiune la retea, fisiere si DB sunt String-uri; daca erau mutabile, un atacator putea altera calea dupa validare.\n3. Thread-Safety: Pot fi partajate intre mii de fire concurente fara lock-uri sau sincronizari.\n4. Caching HashCode: Hash-ul se calculeaza o singura data la initializare si se retine in cache.\n\nLa apelul new String(\"test\"): Se creeaza DOI obiecte daca \"test\" nu era deja in Pool: unul in String Constant Pool si unul NOU distinct pe Heap-ul general.",
    codeSnippet: `String s1 = "job"; // Referinta catre String Pool
String s2 = "job"; // Aceeasi referinta din Pool
System.out.println(s1 == s2); // TRUE

String s3 = new String("job"); // Aloca obiect nou separat in Heap
System.out.println(s1 == s3); // FALSE!
System.out.println(s1.equals(s3)); // TRUE
System.out.println(s1 == s3.intern()); // TRUE (intern aduce referinta din Pool)`,
    interviewTrap: "Operatorul == compara adresele de memorie, in timp ce .equals() compara continutul caracterelor. Nu folosi == pentru String-uri!",
    keyTakeaway: "Foloseste intotdeauna literali (\"abc\") in loc de new String(), si StringBuilder pentru concatenari in bucle."
  },
  {
    id: "java-03",
    category: "JAVA",
    difficulty: "USOR",
    title: "String vs StringBuilder vs StringBuffer",
    question: "Care este diferenta de performanta si siguranta a firelor de executie (Thread-Safety) intre String, StringBuilder si StringBuffer?",
    answer: "1. String: Imutabil. Orice modificare (concatenare cu +) creeaza un obiect NOU pe Heap. In bucle mari genereaza cantitati uriase de obiecte temporare si incetineste Garbage Collector-ul.\n2. StringBuffer (Java 1.0): Mutabil si THREAD-SAFE. Toate metodele sale principale (append, insert) sunt sincronizate cu cuvantul cheie synchronized. Are cost suplimentar de sincronizare chiar daca ruleaza pe un singur thread.\n3. StringBuilder (Java 5): Mutabil si NON-THREAD-SAFE. Nu foloseste synchronized, fiind cu 50-80% mai rapid decat StringBuffer. Este alegerea standard pentru constructia de siruri pe un singur fir de executie (in metode locale).",
    codeSnippet: `// GRESIT (Creeaza 10.000 de obiecte String in Heap):
String s = "";
for (int i = 0; i < 10000; i++) s += i;

// CORECT (Modifica un singur buffer intern de caractere):
StringBuilder sb = new StringBuilder(10000);
for (int i = 0; i < 10000; i++) sb.append(i);
String result = sb.toString();`,
    interviewTrap: "Daca stii dinainte marimea aproximativa a sirului, paseaza capacitatea initiala constructorului new StringBuilder(capacity) pentru a evita redimensionarile interne repetate ale array-ului de caractere.",
    keyTakeaway: "StringBuilder pentru performanta pe un singur thread; StringBuffer doar daca partajezi bufferul intre thread-uri multiple; String pentru constante."
  },
  {
    id: "java-04",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce Java este STRICT Pass-by-Value si NU Pass-by-Reference?",
    question: "Explica de ce se spune ca Java este strict \"Pass-by-Value\". Ce se transmite efectiv cand pasezi un obiect ca argument intr-o metoda?",
    answer: "In Java, absolut totul se transmite prin valoare (Pass-by-Value):\n1. Pentru tipuri primitive (int, double): Se transmite o COPIE a valorii numerice. Modificarea parametrului in interiorul metodei nu afecteaza variabila originala a apelantului.\n2. Pentru obiecte: Nu se transmite obiectul in sine si nici o referinta mutabila C++, ci se transmite O COPIE A REFERINTEI (valoarea adresei de memorie din Stack). Ca urmare:\n   - Poti modifica starea interna a obiectului prin apelul de metode (ex: user.setName(\"Mihai\")).\n   - Dar daca reasignezi parametrul cu new User(), reasignezi doar copia locala din stiva; variabila originala a apelantului ramane neschimbata!",
    codeSnippet: `public static void modify(User u) {
    u.setName("Alex"); // Afecteaza obiectul original din Heap!
    u = new User("Dan"); // Reasigneaza doar copia locala a referintei!
}

User user = new User("Ion");
modify(user);
System.out.println(user.getName()); // Afiseaza "Alex", NU "Dan"!`,
    interviewTrap: "Multi candidati spun gresit ca \"primitivele sunt pass-by-value, iar obiectele sunt pass-by-reference\". In Java, chiar si referintele la obiecte sunt transmise prin valoarea lor!",
    keyTakeaway: "In Java se copiaza mereu valoarea: la primitive valoarea numerica, la obiecte valoarea pointerului catre Heap."
  },
  {
    id: "java-05",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Poti suprascrie (Override) o metoda statica in Java?",
    question: "Poate o clasa copil sa suprascrie o metoda statica definita in clasa parinte? Ce este Method Hiding?",
    answer: "NU, metodele statice NU pot fi suprascrise (Override)! Polimorfismul dinamic (Overriding) functioneaza pe baza instantei reale de pe Heap la runtime prin Dynamic Dispatch (tabela vtable). Metodele statice apartin clasei (nu instantei) si sunt legate static la compilare (Compile-time / Early Binding).\n\nDaca declari o metoda statica cu aceeasi semnatura in clasa copil, fenomenul se numeste \"Method Hiding\" (Ascunderea Metodei). Metoda care se apeleaza depinde strict de tipul referintei declarate la compilare, nu de instanta de pe Heap!",
    codeSnippet: `class Parent { static void print() { System.out.println("Parent"); } }
class Child extends Parent { static void print() { System.out.println("Child"); } }

Parent p = new Child();
p.print(); // Afiseaza "Parent"! Nu s-a apelat metoda din Child!`,
    interviewTrap: "Daca adaugi adnotarea @Override pe o metoda statica in clasa copil, codul NU compileaza!",
    keyTakeaway: "Metodele statice se ascund (Method Hiding) si se leaga la compilare; metodele de instanta se suprascriu (Overriding) si se leaga la runtime."
  },
  {
    id: "java-06",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Interfata vs Clasa Abstracta in Java modern (Java 8-21)",
    question: "Cum s-au schimbat diferentele dintre Interfete si Clase Abstracte odata cu introducerea metodelor default, statice si private in interfete? Cand alegi una in locul celeilalte?",
    answer: "Odata cu Java 8 (default & static methods) si Java 9 (private methods), interfetele pot avea implementari de cod.\n\nDiferente ramase:\n1. State (Stare interna): Interfetele NU pot stoca stare (variabile de instanta); au doar constante publice statice finale. O clasa abstracta poate avea stare, campuri private si constructori.\n2. Mostenire Multipla: O clasa poate implementa oricate interfete, dar poate extinde o singura clasa abstracta.\n3. Constructor: O clasa abstracta are constructor apelat la instantierea copilului; o interfata nu are constructor.\n\nCand alegi: Clasa abstracta pentru stare partajata si cod intern comun intr-o ierarhie stransa; Interfata pentru a defini un contract de capabilitate (Comparable, AutoCloseable) intre clase necorelate.",
    codeSnippet: `public interface Auditable {
    default void logAudit() {
        logInternal("Actiune inregistrata la " + Instant.now());
    }
    private void logInternal(String msg) {
        System.out.println("[AUDIT] " + msg);
    }
}`,
    interviewTrap: "Daca o clasa implementeaza doua interfete care au aceeasi metoda default (Diamond Problem), compilatorul da eroare pana cand clasa suprascrie metoda si alege InterfaceA.super.method().",
    keyTakeaway: "Interfata = ce stie sa faca (contract); Clasa abstracta = ce este (identitate si stare)."
  },
  {
    id: "java-07",
    category: "JAVA",
    difficulty: "USOR",
    title: "final vs finally vs finalize() in Java",
    question: "Explica distinctia clara dintre cuvintele cheie final, blocul finally si metoda finalize() din Java.",
    answer: "1. final (Cuvant cheie modifier):\n   - Variabila: Valoarea devine constanta si nu mai poate fi reasignata.\n   - Metoda: Nu mai poate fi suprascrisa (overridden) in clasele derivate.\n   - Clasa: Nu mai poate fi mostenita (ex: clasa String sau Integer).\n\n2. finally (Bloc de control al fluxului):\n   - Se asociaza cu try-catch si se executa INTOTDEAUNA, indiferent daca se arunca o exceptie sau exista return in try/catch.\n   - Folosit pentru eliberarea resurselor.\n   - Nu se executa doar la System.exit(0) sau cadere de JVM.\n\n3. finalize() (Metoda din Object): Deprecated din Java 9 si eliminata treptat; nu te baza niciodata pe ea!",
    codeSnippet: `final int MAX_RETRIES = 3;

try {
    process();
    return true; // finally TOT se executa inainte de return!
} catch (Exception e) {
    log.error(e);
} finally {
    cleanup(); // Se executa garantat
}`,
    interviewTrap: "Daca pui return si in try si in finally, valoarea din finally va suprascrie valoarea din try!",
    keyTakeaway: "Foloseste try-with-resources in loc de blocuri finally manuale pentru clase AutoCloseable."
  },
  {
    id: "java-08",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Shallow Copy vs Deep Copy in Java",
    question: "Care este diferenta dintre o copie superficiala (Shallow Copy) si o copie profunda (Deep Copy) si cum implementezi Deep Copy in mod sigur?",
    answer: "1. Shallow Copy (Copie Superficiala):\n   - Creeaza un obiect nou, dar campurile care sunt referinte catre alte obiecte copiaza doar adresa de memorie. Ambele obiecte (originalul si copia) indica spre aceleasi instante interne. Modificarea unui camp intern din copie va altera si originalul!\n   - Metoda Object.clone() face shallow copy implicit.\n\n2. Deep Copy (Copie Profunda):\n   - Creeaza un obiect nou si cloneaza recursiv toate obiectele interne referentiate. Originalul si copia sunt complet independente in memorie.\n\nModalitati de implementare Deep Copy:\n- Copy Constructor dedicat (cea mai rapida si curata metoda recomandata de Joshua Bloch).\n- Serializare/Deserializare JSON cu Jackson sau binary serialization.",
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
    interviewTrap: "Interfata Cloneable din Java este considerata defectuoasa (broken design) deoarece clone() este declarata protected in Object si nu exista metoda clone() in interfata Cloneable!",
    keyTakeaway: "Foloseste Copy Constructors sau factory methods in loc de Cloneable pentru a crea copii profunde."
  },
  {
    id: "java-09",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Ordinea de Initializare la Instantierea unei Clase",
    question: "In ce ordine se executa blocurile statice, variabilele de instanta, blocurile de initializare si constructorii cand creezi o instanta Child care mosteneste Parent?",
    answer: "Ordinea stricta de executie este:\n1. Variabilele statice si blocurile de initializare statica ale clasei PARINTE (o singura data, la incarcarea clasei).\n2. Variabilele statice si blocurile statice ale clasei COPIL.\n3. Variabilele de instanta si blocurile non-statice ale clasei PARINTE.\n4. Constructorul clasei PARINTE.\n5. Variabilele de instanta si blocurile non-statice ale clasei COPIL.\n6. Constructorul clasei COPIL.",
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
    interviewTrap: "Blocurile statice se executa o singura data in toata viata aplicatiei cand clasa este incarcata de ClassLoader, in timp ce blocurile de instanta se executa la fiecare apel new!",
    keyTakeaway: "Static Parent -> Static Child -> Instance Parent -> Constructor Parent -> Instance Child -> Constructor Child."
  },
  {
    id: "java-10",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Ce este si cum functioneaza Garbage Collector in JVM?",
    question: "Explica ipoteza generationala (Weak Generational Hypothesis) si partitiile principale ale memoriei Heap in JVM (Eden, Survivor, Tenured/Old).",
    answer: "JVM Heap este impartit conform Ipotezei Generationale (majoritatea obiectelor mor la scurt timp dupa creare):\n1. Young Generation: Contine Eden Space si doua Survivor Spaces (S0 si S1 / From si To). Noile obiecte se aloca in Eden. Cand Eden se umple, ruleaza un Minor GC (rapid, compacteaza obiectele vii in Survivor).\n2. Old (Tenured) Generation: Obiectele care supravietuiesc mai multor cicluri de GC (default 15 cicluri, prag controlat de -XX:MaxTenuringThreshold) sunt promovate in Old Gen.\n3. Metaspace (Off-Heap): Stocheaza metadata despre clase, bytecode si metode (a inlocuit PermGen din Java 8).",
    codeSnippet: `// JVM Heap Layout:
// [---------- Young Generation ----------] [--- Old / Tenured ---]
// [   Eden   ] [ Survivor S0 ] [ Survivor S1 ] [ Long-lived Objects ]
// Minor GC: curata Young Gen
// Major / Full GC: curata Old Gen (stop-the-world mai lung)`,
    interviewTrap: "Metaspace nu este in Heap! Este alocat in memoria nativa a sistemului de operare si se extinde dinamic daca nu este restrictionat cu -XX:MaxMetaspaceSize.",
    keyTakeaway: "Majoritatea alocarilor mor in Eden. GC-urile moderne (G1GC, ZGC) folosesc regiuni dinamice pentru a reduce timpii de pauza sub 1ms."
  },
  {
    id: "java-11",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Algoritmi de Garbage Collection: G1GC vs ZGC vs Parallel GC",
    question: "Care sunt diferentele cheie intre colectorii de gunoi G1GC (default in Java 9-21) si ZGC (Zero Latency GC din Java 21)?",
    answer: "1. Parallel GC (Throughput Collector):\n   - Optimizeaza throughput-ul maxim al procesorului. Pauzele Stop-the-World pot dura secunde intregi; ideal pentru aplicatii batch offline.\n\n2. G1GC (Garbage-First GC - Default in Java 9+):\n   - Imparte Heap-ul in mii de regiuni de dimensiuni egale (1MB - 32MB).\n   - Curata mai intai regiunile cu cel mai mult gunoi (\"Garbage First\").\n   - Permite setarea unui obiectiv de pauza (ex: -XX:MaxGCPauseMillis=200), dar la heap-uri foarte mari pauzele pot depasi tinta.\n\n3. ZGC (Z Garbage Collector - Modern in Java 21):\n   - Scalabil la heap-uri de pana la 16 Terabytes!\n   - Toate fazele costisitoare de marcare, relocare si compactare ruleaza CONCURENT cu aplicatia folosind Colored Pointers si Load Barriers.\n   - Garanteaza pauze Stop-the-World de sub 1 MILISECUNDA, indiferent de marimea memoriei Heap!",
    codeSnippet: `// Activare ZGC generational in Java 21:
java -XX:+UseZGC -XX:+ZGenerational -jar app.jar`,
    interviewTrap: "ZGC consuma putin mai mult CPU din cauza Load Barriers la accesarea referintelor de obiecte, dar elimina complet blocajele de latenta in aplicatiile web.",
    keyTakeaway: "G1GC este excelentul default; ZGC este alegerea ideala in Java 21 pentru aplicatii cu cerinte stricte de latenta mica."
  },
  {
    id: "java-12",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Ce cauzeaza OutOfMemoryError: Java heap space vs Metaspace vs StackOverflowError?",
    question: "Care este diferenta dintre OutOfMemoryError pe Heap, OutOfMemoryError pe Metaspace si StackOverflowError?",
    answer: "1. StackOverflowError:\n   - Apare pe stiva thread-ului (Thread Stack Memory) cand numarul de cadre de apel depaseste limita (de obicei cauzat de o recursivitate infinita fara caz de baza).\n\n2. OutOfMemoryError: Java heap space:\n   - Apare cand memoria Heap este plina si Garbage Collector-ul nu poate elibera suficient spatiu pentru a aloca un obiect nou (cauzat de alocari gigantice sau Memory Leaks cu obiecte referentiate permanent).\n\n3. OutOfMemoryError: Metaspace:\n   - Apare in memoria nativa (Off-Heap) cand numarul de clase incarcate in memorie este prea mare (cauzat de generare dinamica necontrolata de proxy-uri CGLIB/Spring, hot reload repetat fara restart sau librarii de bytecode).",
    codeSnippet: `// 1. StackOverflow:
void infiniteRecursion() { infiniteRecursion(); }

// 2. Heap OOM:
List<byte[]> list = new ArrayList<>();
while(true) list.add(new byte[1024 * 1024]);`,
    interviewTrap: "StackOverflowError este o subclasa de Error, nu de Exception! Nu incerca sa o prinzi cu catch (Exception e).",
    keyTakeaway: "Recursivitate infinita -> StackOverflowError; colectii nesterse pe Heap -> Heap OOM; generare masiva de clase -> Metaspace OOM."
  },
  {
    id: "java-13",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Cum functioneaza Ierarhia de ClassLoaders in JVM?",
    question: "Cum incarca JVM-ul clasele in memorie si ce reprezinta modelul de delegare (Delegation Principle) intre ClassLoaders?",
    answer: "JVM foloseste o ierarhie stricta de ClassLoaders bazata pe principiul delegarii (Parent Delegation Model):\n1. Bootstrap ClassLoader: Scris in cod nativ C++, incarca clasele fundamentale de baza ale JDK-ului din modulul java.base (java.lang.*, java.util.*).\n2. Platform / Extension ClassLoader: Incarca modulele si extensiile platformei standard.\n3. Application / System ClassLoader: Incarca clasele din classpath-ul aplicatiei tale (fisierele .class si dependintele din JAR-uri).\n\nModelul de Delegare:\nCand o clasa este ceruta, ApplicationClassLoader NU o incarca direct. El deleaga cererea catre parintele sau (Platform), care deleaga mai departe catre Bootstrap. Daca parintele gaseste clasa, o incarca el. Doar daca niciun parinte nu o gaseste, ApplicationClassLoader o incarca din propriul classpath. Acest mecanism previne ca un programator sa rescrie o versiune malitioasa a clasei java.lang.String!",
    codeSnippet: `ClassLoader appCl = Candidate.class.getClassLoader();
ClassLoader platformCl = appCl.getParent();
ClassLoader bootstrapCl = platformCl.getParent(); // Returneaza NULL (C++ nativ)`,
    interviewTrap: "Daca apelezi String.class.getClassLoader(), metoda returneaza NULL deoarece Bootstrap ClassLoader este implementat in C++ si nu are instanta de obiect Java.",
    keyTakeaway: "ClassLoaders deleaga intotdeauna cererea parintilor mai intai pentru a proteja integritatea claselor de baza ale JDK-ului."
  },
  {
    id: "java-14",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Integer Cache (-128 la 127) si Autoboxing",
    question: "Ce afiseaza codul: Integer a = 127; Integer b = 127; System.out.println(a == b); si ce afiseaza daca valoarea este 128? De ce?",
    answer: "Pentru 127 va afisa TRUE, iar pentru 128 va afisa FALSE!\n\nExplicatie: Java implementeaza un Integer Cache pentru valorile cuprinse intre -128 si 127 (conform JLS). La autoboxing (Integer.valueOf(127)), JVM returneaza aceeasi instanta cached din array-ul intern IntegerCache.cache.\n\nPentru 128, valoarea depaseste intervalul default de caching, deci se aloca doua instante complet noi pe Heap. Operatorul == compara adresele de memorie, deci va returna false!",
    codeSnippet: `Integer a = 127;
Integer b = 127;
System.out.println(a == b); // TRUE (acelasi obiect din cache)

Integer x = 128;
Integer y = 128;
System.out.println(x == y); // FALSE (doua instante diferite pe Heap)
System.out.println(x.equals(y)); // TRUE (compara valorile primitive)`,
    interviewTrap: "Limita superioara (127) poate fi extinsa prin parametrul JVM: -XX:AutoBoxCacheMax=<size>.",
    keyTakeaway: "Nu folosi == pentru compararea wrapper-elor (Integer, Long, Double). Foloseste mereu .equals()."
  },
  {
    id: "java-15",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce folosim BigDecimal si nu double pentru bani?",
    question: "De ce nu trebuie NICIODATA sa folosesti tipurile primitive float sau double pentru calcule financiare, salarii sau tranzactii cu bani?",
    answer: "Tipurile float si double sunt numere in virgula mobila bazate pe standardul binar IEEE 754. Ele nu pot reprezenta cu precizie exacta fractiile zecimale simple precum 0.1 sau 0.01 (in binar devin fractii infinite periodice, la fel cum 1/3 devine 0.3333... in zecimal).\n\nRezultatul operatiei: 0.1 + 0.2 in Java NU este 0.3, ci 0.30000000000000004! In aplicatiile bancare sau financiare, aceste rotunjiri acumulate duc la diferente de bani si erori contabile grave.\n\nSolutie: BigDecimal pastreaza reprezentarea zecimala exacta cu precizie arbitrara configurabila.",
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
    interviewTrap: "Daca scrii new BigDecimal(0.1) trecand un literal double, transferi chiar eroarea de precizie a double-ului in BigDecimal! Foloseste OBLIGATORIU new BigDecimal(\"0.1\") sau BigDecimal.valueOf(0.1).",
    keyTakeaway: "Pentru orice operatiune cu valuta, preturi, comisioane sau salarii: BigDecimal cu String constructor."
  },
  {
    id: "java-16",
    category: "JAVA",
    difficulty: "USOR",
    title: "Autoboxing si capcana NullPointerException",
    question: "Cum poate o simpla atribuire de tip primitiv sa arunce NullPointerException in timpul unboxing-ului automat?",
    answer: "Autoboxing-ul este conversia automata facuta de compilator intre tipuri primitive si clase wrapper (ex: int -> Integer). Unboxing-ul este operatiunea inversa (ex: Integer -> int apeland sub capota intValue()).\n\nDaca ai un obiect wrapper (Integer) care are valoarea null si incerci sa il asignezi unei variabile primitive (int) sau il folosesti intr-o expresie aritmetica (==, +, >), JVM apeleaza metoda .intValue() pe referinta nula, aruncand instant NullPointerException!",
    codeSnippet: `Integer countWrapper = null;

// ARUNCA NullPointerException la runtime:
int count = countWrapper; // Compilatorul genereaza: countWrapper.intValue()

// La fel si in conditii logice:
if (countWrapper > 0) { ... } // NPE!`,
    interviewTrap: "Aceasta eroare apare frecvent in entitati JPA unde campurile numerice din baza de date contin NULL (ex: coloana nullable in Postgres), dar in cod DTO-ul le mapeaza in tipuri primitive (int, boolean).",
    keyTakeaway: "Verifica intotdeauna daca wrapperul este null inainte de unboxing sau foloseste tipuri primitive doar cand campul este garantat non-null."
  },
  {
    id: "java-17",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Cum functioneaza HashMap intern in Java?",
    question: "Explica arhitectura interna a unui HashMap in Java 8+: structura de date, calculul bucket-ului, gestionarea coliziunilor si cand se transforma lista inlantuita in arbore.",
    answer: "HashMap foloseste un array de bucket-uri (Node<K,V>[] table). Indexul se calculeaza prin formula: index = (n - 1) & hash(key.hashCode()). In caz de coliziune, elementele se adauga initial intr-o lista simplu inlantuita. Daca numarul de elemente dintr-un bucket depaseste pragul de 8 (TREEIFY_THRESHOLD) si capacitatea totala a array-ului este cel putin 64, lista se converteste intr-un arbore rosu-negru (Red-Black Tree, TreeNode), reducand complexitatea de la O(n) la O(log n). Cand numarul scade sub 6, arborele redevine lista (UNTREEIFY_THRESHOLD).",
    codeSnippet: `static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}
int index = (table.length - 1) & hash;

// Praguri critice in java.util.HashMap:
static final int TREEIFY_THRESHOLD = 8;
static final int UNTREEIFY_THRESHOLD = 6;
static final int MIN_TREEIFY_CAPACITY = 64;`,
    interviewTrap: "Pentru transformarea in Red-Black Tree este obligatoriu ca si capacitatea totala a tabelei sa fie >= 64. Daca este mai mica, se face resize (dublare), NU treeify!",
    keyTakeaway: "Complexitate: O(1) amortizat pentru get/put. O(log n) in caz de coliziuni masive in acelasi bucket."
  },
  {
    id: "java-18",
    category: "JAVA",
    difficulty: "USOR",
    title: "Cum functioneaza HashSet intern in Java?",
    question: "Ce structura de date foloseste clasa HashSet in interiorul sau pentru a asigura unicitatea elementelor?",
    answer: "HashSet NU implementeaza un mecanism propriu de hashing de la zero! Intern, HashSet este doar un simplu wrapper peste o instanta de HashMap (private transient HashMap<E,Object> map).\n\nCand adaugi un element cu set.add(e):\n- Elementul tau este inserat ca si CHEIE in HashMap-ul intern (map.put(e, PRESENT)).\n- Valoarea asociata este o simpla constanta statica \"dummy\" de tip Object numita PRESENT.\n- Deoarece un HashMap garanteaza ca cheile sunt unice, HashSet garanteaza automat unicitatea elementelor!",
    codeSnippet: `public class HashSet<E> implements Set<E> {
    private transient HashMap<E,Object> map;
    private static final Object PRESENT = new Object();

    public boolean add(E e) {
        return map.put(e, PRESENT) == null; // Daca returneaza null, elementul nu exista
    }
}`,
    interviewTrap: "Daca obiectul inserat in HashSet nu are implementate corect metodele equals() si hashCode(), HashSet va permite duplicate logice!",
    keyTakeaway: "HashSet este pur si simplu un HashMap unde valorile sunt ignorate si cheile reprezinta elementele setului."
  },
  {
    id: "java-19",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "ArrayList vs LinkedList: De ce evitam LinkedList?",
    question: "Care este diferenta dintre ArrayList si LinkedList si de ce in aplicatiile enterprise reale se prefera ArrayList in 99% din cazuri?",
    answer: "1. ArrayList: Bazat pe un array dinamic redimensionabil. Ofera acces instantaneu prin index in timp O(1) si este compact in memorie.\n\n2. LinkedList: Lista dublu inlantuita. Fiecare element este impachetat intr-un nod (Node<E>) cu doi pointeri (prev, next).\n\nDe ce evitam LinkedList chiar si la inserari:\n- Cache Locality (Performanta hardware): Elementele dintr-un ArrayList sunt contigue in memorie, potrivindu-se perfect pe liniile de CPU Cache (L1/L2). In LinkedList, nodurile sunt dispersate aleatoriu pe Heap, generand masive CPU Cache Misses.\n- Consum Memorie: Pe un JVM pe 64 de biti, un nod de LinkedList consuma 24-32 bytes overhead suplimentar doar pentru pointeri si header de obiect, pe langa data utila.",
    codeSnippet: `// 1. ArrayList:
List<String> fastList = new ArrayList<>(100);

// 2. Pentru operatii de Coada / Stiva (FIFO/LIFO):
Deque<String> queue = new ArrayDeque<>();`,
    interviewTrap: "Manualele vechi spun ca LinkedList are O(1) pentru inserare la mijloc. In practica, pana sa inserezi la mijloc trebuie sa parcurgi lista pana acolo in O(n), facand operatia mai lenta decat copierea de memorie din ArrayList (System.arraycopy).",
    keyTakeaway: "ArrayList este alegerea implicita pentru liste. Pentru cozi sau stive, foloseste ArrayDeque."
  },
  {
    id: "java-20",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Fail-Fast vs Fail-Safe Iterators",
    question: "Ce este un iterator Fail-Fast si de ce apare ConcurrentModificationException daca stergi un element dintr-o lista cu list.remove() in interiorul unui for-each?",
    answer: "1. Fail-Fast (ArrayList, HashMap, HashSet):\n   - Daca structura colectiei este modificata structural (adaugari, stergeri) in timp ce o parcurgi, iteratorul detecteaza diferenta dintre contorul modCount si expectedModCount si arunca instantaneu ConcurrentModificationException.\n   - Scopul este sa previna coruperea silentioasa a datelor.\n\n2. Fail-Safe / Weakly Consistent (ConcurrentHashMap, CopyOnWriteArrayList):\n   - Itereaza pe un snapshot sau pe o vizualizare slab consistenta a datelor. Nu arunca niciodata ConcurrentModificationException cand colectia este modificata concurent.",
    codeSnippet: `List<String> list = new ArrayList<>(List.of("A", "B", "C"));

// CORECT cu removeIf() din Java 8:
list.removeIf(item -> item.equals("B"));`,
    interviewTrap: "For-each-ul este doar syntactic sugar peste Iterator. Daca apelezi list.remove() in for-each, iteratorul nu stie ca ai modificat lista si da eroare la urmatorul it.next().",
    keyTakeaway: "Pentru stergere curata in iteratii, foloseste mereu metoda list.removeIf() sau iteratorul dedicat."
  },
  {
    id: "java-21",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Cum functioneaza ConcurrentHashMap?",
    question: "Cum reuseste ConcurrentHashMap sa fie thread-safe cu performanta ridicata fata de Collections.synchronizedMap sau vechiul Hashtable?",
    answer: "Hashtable si Collections.synchronizedMap blocheaza INTREAGA tabela la orice operatiune de citire sau scriere (un singur lock global pe toata colectia), devenind o strangulare masiva de performanta.\n\nConcurrentHashMap (in Java 8+):\n1. Citirile (get): Sunt complet NON-BLOCANTE (Lock-Free), folosind variabile volatile pe noduri.\n2. Scrierile (put): Blocheaza DOAR PRIMUL NOD din bucket-ul specific unde se face inserarea (folosind synchronized pe primul nod din bucket). Nicio alta celula sau bucket nu este blocat!\n3. Daca bucket-ul este gol: Inserarea se face complet fara lock folosind instructiunea hardware CAS (Compare-And-Swap).\n4. Nu permite chei sau valori NULL.",
    codeSnippet: `ConcurrentMap<String, Long> userHits = new ConcurrentHashMap<>();
userHits.computeIfAbsent("user_42", k -> queryDatabase(k));
userHits.merge("user_42", 1L, Long::sum); // Incrementare atomica`,
    interviewTrap: "Daca folosesti verificari separate: if (!map.containsKey(key)) map.put(key, val), operatia per ansamblu NU este atomica! Foloseste mereu operatiile atomice native: putIfAbsent, computeIfAbsent sau merge.",
    keyTakeaway: "ConcurrentHashMap scaleaza la mii de thread-uri prin lock-uri granulare pe bucket si citiri fara lock."
  },
  {
    id: "java-22",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "PriorityQueue: Arhitectura si Cautarea Top-K elemente",
    question: "Ce structura de date sta la baza clasei PriorityQueue in Java si cum se foloseste pentru a gasi cele mai mari K elemente dintr-un stream masiv?",
    answer: "PriorityQueue este o coada de prioritati implementata pe baza unui Min-Heap (sau Max-Heap daca se trimite un Comparator inversat) reprezentat intern ca un array dinamic.\n\nComplexitati:\n- Inserare (offer): O(log N)\n- Extragere minim (poll): O(log N)\n- Inspectare minim (peek): O(1)\n\nAlgoritmul Top-K:\nPentru a retine cele mai mari K elemente dintr-un flux de milioane de joburi, mentinem o PriorityQueue (Min-Heap) de capacitate fixa K. La fiecare element nou, daca e mai mare decat minimul din heap (peek), dam poll() si adaugam elementul nou. La final, heap-ul contine exact cele mai mari K elemente in timp O(N log K), consumand doar O(K) memorie!",
    codeSnippet: `PriorityQueue<Integer> topK = new PriorityQueue<>(k);
for (int salary : allSalaries) {
    topK.offer(salary);
    if (topK.size() > k) topK.poll();
}`,
    interviewTrap: "Iteratorul unui PriorityQueue NU parcurge elementele in ordine sortata! Pentru a le parcurge in ordine sortata, trebuie sa le extragi pe rand cu poll().",
    keyTakeaway: "PriorityQueue este cheia rezolvarii problemelor de clasament (Top-K, Kth largest) si algoritmului Dijkstra."
  },
  {
    id: "java-23",
    category: "JAVA",
    difficulty: "USOR",
    title: "ArrayDeque vs java.util.Stack: De ce Stack este Deprecated?",
    question: "De ce documentatia oficiala Java recomanda folosirea lui ArrayDeque in locul clasei java.util.Stack?",
    answer: "Clasa java.util.Stack este o clasa relicva din Java 1.0 care mosteneste direct din java.util.Vector:\n1. Sincronizare inutila: Toate metodele din Vector si Stack sunt synchronized, adaugand un cost de performanta masiv chiar si cand lucrezi pe un singur thread.\n2. Incalca principiul OOP LIFO: Mostenind din Vector, Stack permite apelarea de metode precum get(index) sau insertElementAt(item, 0), permitand acces la orice pozitie a stivei, nu doar la varf!\n\nArrayDeque implementeaza interfata Deque, este nesincronizat, mai rapid ca Stack si LinkedList si functioneaza atat ca Stiva (push/pop) cat si ca Coada (offer/poll).",
    codeSnippet: `Deque<String> modernStack = new ArrayDeque<>();
modernStack.push("A");
modernStack.push("B");
String top = modernStack.pop(); // "B"`,
    interviewTrap: "ArrayDeque nu permite elemente NULL (arunca NullPointerException).",
    keyTakeaway: "Foloseste intotdeauna ArrayDeque atat pentru implementari de stiva (LIFO) cat si pentru cozi (FIFO)."
  },
  {
    id: "java-24",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "TreeMap & TreeSet: Structura si NavigableMap",
    question: "Ce structura de date sta la baza TreeMap si TreeSet si ce metode speciale ofera interfata NavigableMap?",
    answer: "TreeMap si TreeSet sunt colectii ordonate bazate pe arbori rosu-negru (Red-Black Trees - arbori binari de cautare auto-echilibrati).\n\nComplexitate garantata:\n- O(log N) pentru get, put, remove, containsKey.\n\nInterfata NavigableMap ofera metode puternice de cautare de proximitate:\n- ceilingKey(k): Returneaza cea mai mica cheie >= k.\n- floorKey(k): Returneaza cea mai mare cheie <= k.\n- higherKey(k) si lowerKey(k): Cautare stricta > k sau < k.\n- subMap(from, to): Vizualizare a unui interval de chei.",
    codeSnippet: `NavigableMap<Integer, String> scores = new TreeMap<>();
scores.put(100, "Mihai");
scores.put(85, "Alex");
scores.put(70, "Dan");

System.out.println(scores.floorKey(90)); // 85 (cel mai apropiat scor <= 90)`,
    interviewTrap: "Obiectele folosite ca chei intr-un TreeMap trebuie sa implementeze Comparable sau trebuie sa trimiti un Comparator constructorului; altfel, la prima inserare vei primi ClassCastException!",
    keyTakeaway: "TreeMap garanteaza chei sortate in O(log N) si operatii avansate de proximitate de interval."
  },
  {
    id: "java-25",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "LinkedHashMap si implementarea unui LRU Cache",
    question: "Cum pastreaza LinkedHashMap ordinea elementelor si cum poti construi un LRU Cache (Least Recently Used) in doar 5 linii de cod?",
    answer: "LinkedHashMap extinde HashMap si adauga o lista dublu inlantuita care trece prin toate intrarile (Node).\n\nPoate fi configurat in doua moduri:\n1. Insertion-Order (Implicit): Itereaza elementele in ordinea in care au fost inserate.\n2. Access-Order: Cand este creat cu constructorul new LinkedHashMap(cap, loadFactor, true), fiecare accesare a unei chei (get sau put) muta nodul respectiv la finalul listei inlantuite!\n\nConstruirea unui LRU Cache:\nSuprascrii metoda removeEldestEntry(Map.Entry eldest) pentru a returna true cand dimensiunea depaseste capacitatea dorita. Cele mai vechi elemente neaccesate vor fi eliminate automat!",
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
    interviewTrap: "LinkedHashMap este NON-thread-safe. Daca il folosesti ca cache in mediu multi-threaded, trebuie impachetat cu Collections.synchronizedMap.",
    keyTakeaway: "LinkedHashMap cu access-order = true este solutia nativa eleganta pentru crearea unui LRU Cache."
  },
  {
    id: "java-26",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Generics si fenomenul de Type Erasure",
    question: "Ce este Type Erasure in Java si ce se intampla cu tipurile generice (ex: List<String> vs List<Integer>) la compilare si in timpul rularii (runtime)?",
    answer: "Generics au fost adaugate in Java 5 cu cerinta de compatibilitate retroactiva (backward compatibility) cu versiunile vechi.\n\nType Erasure inseamna ca toate informatiile despre tipurile generice din parametri (<T>, <String>) sunt verificate la COMPILARE si apoi STERSE din bytecode. La runtime, List<String> si List<Integer> devin ambele clasa simpla List (cu elemente de tip Object sau bounded type-ul superior).\n\nConsecinte practice:\n1. Nu poti face new T() sau new T[10].\n2. Nu poti face instanceof List<String> (doar instanceof List<?>).\n3. Nu poti avea metode supraincarcate cu aceeasi semnatura dupa stergere.",
    codeSnippet: `List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();

// La runtime, ambele apartin exact aceleiasi clase:
System.out.println(list1.getClass() == list2.getClass()); // TRUE!`,
    interviewTrap: "Daca ai nevoie sa afli tipul generic la runtime (de exemplu la deserializare JSON in Jackson/Spring), se foloseste tehnica TypeReference sau Super Type Tokens.",
    keyTakeaway: "Generics asigura siguranta tipurilor la compilare (Compile-time Type Safety) fara overhead de memorie la runtime."
  },
  {
    id: "java-27",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Principiul PECS in Generics: Producer Extends, Consumer Super",
    question: "Ce inseamna principiul PECS (Producer Extends, Consumer Super) propus de Joshua Bloch si cand folosesti <? extends T> vs <? super T>?",
    answer: "PECS stabileste regulile pentru wildcard-urile generice:\n1. Producer Extends (<? extends T>):\n   - Folosit cand colectia doar PRODUCE date pe care vrei sa le citesti (Read-Only).\n   - Poti citi elemente ca fiind de tip T (deoarece orice element extinde T).\n   - NU poti adauga nimic in colectie (cu exceptia lui null), deoarece compilatorul nu stie tipul exact al subtype-ului!\n\n2. Consumer Super (<? super T>):\n   - Folosit cand colectia CONSUMA date (Write-Only), adica adaugi elemente in ea.\n   - Poti adauga in siguranta obiecte de tip T sau derivate din T.\n   - Citirile returneaza doar Object.",
    codeSnippet: `// Exemplul canonic din Collections.copy(dest, src):
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (int i = 0; i < src.size(); i++) {
        dest.set(i, src.get(i)); // src PRODUCE (get), dest CONSUMA (set)
    }
}`,
    interviewTrap: "Daca incerci sa apelezi list.add(new Apple()) pe o variabila List<? extends Fruit>, codul NU compileaza!",
    keyTakeaway: "Daca doar citesti din lista: extends. Daca doar scrii in lista: super. Daca faci si citire si scriere: tip exact fara wildcard."
  },
  {
    id: "java-28",
    category: "JAVA",
    difficulty: "USOR",
    title: "Checked vs Unchecked Exceptions in Java",
    question: "Care este diferenta dintre Checked Exceptions si Unchecked Exceptions? Care mostenesc direct Exception si care mostenesc RuntimeException?",
    answer: "1. Checked Exceptions (Mostenesc direct Exception dar NU RuntimeException):\n   - Sunt verificate la compilare. Metoda este OBLIGATA sa le prinda (try-catch) sau sa le declare in semnatura (throws IOException).\n   - Reprezinta conditii anormale dar previzibile din exterior (ex: FileNotFoundException, SQLException).\n\n2. Unchecked Exceptions (Mostenesc RuntimeException sau Error):\n   - Nu sunt verificate la compilare.\n   - Reprezinta de obicei bug-uri de programare sau erori logice ce nu pot fi recuperate curat la runtime (ex: NullPointerException, IllegalArgumentException, IndexOutOfBoundsException).\n   - Tranzactiile Spring Boot fac ROLLBACK automat doar pentru Unchecked Exceptions!",
    codeSnippet: `// Checked: compilatorul te obliga sa o declari sau tratezi
public void readFile() throws IOException {
    throw new IOException("Fisier inexistent");
}

// Unchecked: eroare de programare, nu trebuie declarata in throws
public void calculate(int val) {
    if (val < 0) throw new IllegalArgumentException("Valoarea nu poate fi negativa");
}`,
    interviewTrap: "Error (ex: OutOfMemoryError, StackOverflowError) este de asemenea Unchecked, dar reprezinta defectiuni catastrofale ale JVM-ului; nu incerca sa prinzi Error cu try-catch!",
    keyTakeaway: "Spring Boot mapeaza majoritatea exceptiilor de baze de date in Unchecked Exceptions (DataAccessException)."
  },
  {
    id: "java-29",
    category: "JAVA",
    difficulty: "USOR",
    title: "try-with-resources si Suppressed Exceptions",
    question: "Cum functioneaza blocul try-with-resources introdus in Java 7 si ce se intampla cand atat codul din try cat si metoda close() arunca exceptii?",
    answer: "try-with-resources asigura ca orice resursa care implementeaza java.lang.AutoCloseable este inchisa automat la finalul blocului.\n\nCe sunt Suppressed Exceptions:\nIn vechiul model try-catch-finally, daca atat codul din try cat si cel din finally aruncau cate o exceptie, exceptia din finally o ascundea pe cea din try.\nIn try-with-resources, exceptia aruncata de corpul blocului try este exceptia principala (Primary Exception), iar daca close() arunca si ea o exceptie, aceasta este atasata ca Suppressed Exception (accesibila prin ex.getSuppressed()), pastrand ambele erori!",
    codeSnippet: `try (Connection conn = ds.getConnection();
     PreparedStatement ps = conn.prepareStatement(sql)) {
    ps.executeQuery();
} catch (SQLException e) {
    for (Throwable supp : e.getSuppressed()) {
        System.err.println("Eroare inchidere: " + supp.getMessage());
    }
}`,
    interviewTrap: "Resursele sunt inchise in ORDINE INVERSA declararii lor (LIFO). In exemplul de mai sus, ps este inchis primul, apoi conn.",
    keyTakeaway: "Foloseste intotdeauna try-with-resources pentru orice conexiune JDBC, socket sau stream."
  },
  {
    id: "java-30",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce este Enum considerat cel mai sigur Singleton Pattern?",
    question: "De ce Joshua Bloch recomanda folosirea unui Enum cu o singura valoare ca fiind cel mai sigur mod de a implementa Singleton Pattern in Java?",
    answer: "Implementarile clasice de Singleton (chiar si Double-Checked Locking cu volatile) pot fi sparte prin:\n1. Reflection: Un programator poate accesa constructorul privat cu constructor.setAccessible(true).\n2. Serializare: La deserializarea unui obiect Singleton se creeaza o instanta complet noua daca nu implementezi corect readResolve().\n\nDe ce Enum este 100% sigur:\n- JVM garanteaza ca un Enum este instantiat o singura data si este thread-safe nativ.\n- Reflection refuza explicit sa creeze instante de Enum (arunca IllegalArgumentException: Cannot reflectively create enum objects).\n- Serializarea Enum-urilor este gestionata special de JVM fara a crea instante duplicate.",
    codeSnippet: `public enum DatabaseConnectionPool {
    INSTANCE;

    private DataSource dataSource;

    public void init() { /* conexiuni */ }
    public Connection getConnection() { return dataSource.getConnection(); }
}

// Utilizare:
DatabaseConnectionPool.INSTANCE.getConnection();`,
    interviewTrap: "Daca ai nevoie sa extinzi o alta clasa de baza, Enum nu poate fi folosit deoarece mosteneste deja implicit java.lang.Enum.",
    keyTakeaway: "Un Enum cu o singura valoare este cel mai robust Singleton din Java (rezistent la Reflection si Deserializare)."
  },
  {
    id: "java-31",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Virtual Threads in Java 21 vs Platform Threads (OS Threads)",
    question: "Ce sunt Virtual Threads din Java 21 (Project Loom), cum difera de Platform Threads si cand este contraindicat sa le folosesti?",
    answer: "Platform Threads sunt mapate 1:1 cu thread-urile sistemului de operare (OS Kernel). Ele sunt costisitoare: consuma ~1MB de memorie per stack, iar context switching-ul la nivel de kernel este lent (limita practica este de cateva mii de thread-uri).\n\nVirtual Threads sunt fire de executie foarte usoare gestionate de JVM (in spatiul utilizator), nu de kernel. Poti rula milioane de fire simultan cu consum minim de RAM (~cativ KB). Cand un Virtual Thread intalneste o operatie de blocare I/O (apel HTTP, interogare baza de date JDBC, citire fisier), JVM-ul il \"demonteaza\" de pe thread-ul fizic purtator (Carrier Thread) si monteaza un alt Virtual Thread gata de executie.\n\nCand NU le folosim: Pentru operatiuni intensive de CPU (calcul matematic pur, procesare video/imagini), deoarece acolo nu exista blocare I/O!",
    codeSnippet: `try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    IntStream.range(0, 10_000).forEach(i -> {
        executor.submit(() -> {
            Thread.sleep(Duration.ofSeconds(1));
            return "Rezultat " + i;
        });
    });
} // Auto-close asteapta terminarea tuturor task-urilor!`,
    interviewTrap: "Daca un Virtual Thread apeleaza o operatie blocanta in interiorul unui bloc synchronized sau apeluri native JNI, apare Thread Pinning (ramane lipit de Carrier Thread). Inlocuieste synchronized cu ReentrantLock!",
    keyTakeaway: "Virtual Threads rezolva scalabilitatea pe operatiuni I/O bound (retea, baze de date) fara complexitatea programarii reactive."
  },
  {
    id: "java-32",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "volatile vs synchronized vs AtomicInteger in Java",
    question: "Care este diferenta de garantie intre cuvintele cheie volatile, synchronized si clasele din java.util.concurrent.atomic?",
    answer: "1. volatile: Garanteaza doar VIZIBILITATEA intre thread-uri (citirile si scrierile se fac direct in memoria principala RAM, nu in CPU cache). Nu ofera atomicitate! Operatiunea count++ este formata din 3 pasi (read, update, write), deci va avea race conditions pe variabile volatile.\n\n2. synchronized: Garanteaza atat VIZIBILITATE cat si ATOMICITATE si EXCLUZIUNE MUTUALA. Doar un singur thread poate intra in sectiunea critica la un moment dat folosind monitorul de lock al obiectului.\n\n3. AtomicInteger / AtomicLong: Folosesc instructiuni hardware native CAS (Compare-And-Swap) fara lock-uri software blocante (Lock-Free Concurrency). Ofera performanta superioara fata de synchronized pentru contori si flag-uri concurente.",
    codeSnippet: `// 1. Volatile NU este atomic pentru incrementare:
private volatile int count = 0; // count++ produce pierderi de date!

// 2. AtomicInteger foloseste hardware CAS (Lock-Free):
private final AtomicInteger atomicCount = new AtomicInteger(0);
atomicCount.incrementAndGet(); // Thread-safe si foarte rapid!

// 3. Synchronized (Blocant):
public synchronized void increment() { count++; }`,
    interviewTrap: "Daca variabila este doar citita si scrisa printr-un flag boolean (ex: volatile boolean running = true), volatile este thread-safe fara lock-uri.",
    keyTakeaway: "Pentru contori si flag-uri simple: Atomics. Pentru logica complexa cu multiple stari: Lock/synchronized."
  },
  {
    id: "java-33",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Stari ale unui Thread in Java si wait() vs sleep()",
    question: "Care sunt cele 6 stari ale unui fir de executie in Thread.State si care este diferenta fundamentala intre Object.wait() si Thread.sleep()?",
    answer: "Cele 6 stari ale unui thread in Java:\n1. NEW: Creat dar nepornit (inainte de .start()).\n2. RUNNABLE: Se executa activ pe CPU sau asteapta alocare de timp de procesor in OS.\n3. BLOCKED: Asteapta sa obtina un monitor lock (pentru a intra intr-o sectiune synchronized).\n4. WAITING: Asteapta la infinit ca alt thread sa semnalizeze (wait(), join(), LockSupport.park()).\n5. TIMED_WAITING: Asteapta pentru un interval limitat de timp (sleep(ms), wait(timeout)).\n6. TERMINATED: Executia metodei run() s-a finalizat sau a picat cu exceptie netratata.\n\nwait() vs sleep():\n- Thread.sleep(ms): Nu elibereaza lock-ul detinut pe obiect! Thread-ul adoarme tinand lock-ul blocat pentru oricine altcineva.\n- Object.wait(): ELIBEREAZA lock-ul pe obiectul respectiv, permitand altor thread-uri sa intre in synchronized pana la primirea unui notify() sau notifyAll().",
    codeSnippet: `synchronized (lock) {
    while (!condition) {
        lock.wait(); // Elibereaza lock-ul si asteapta
    }
}`,
    interviewTrap: "Apelul wait() fara bloc synchronized arunca instantaneu IllegalMonitorStateException!",
    keyTakeaway: "Apeleaza intotdeauna wait() intr-o bucla while, niciodata intr-un simplu if, pentru a preveni Spurious Wakeups."
  },
  {
    id: "java-34",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Ce este ThreadLocal si de ce provoaca Memory Leaks in Tomcat/Spring?",
    question: "Ce este ThreadLocal in Java, la ce este folosit (ex: SecurityContext, Tranzactii) si de ce uitarea apelului threadLocal.remove() provoaca Memory Leaks in servere de aplicatii?",
    answer: "ThreadLocal ofera variabile izolate la nivel de fir de executie (Thread-Confined State). Fiecare thread detine propria sa copie independenta a variabilei, accesibila global fara a fi trimisa ca parametru prin toate metodele.\n\nUtilizari: SecurityContextHolder, TransactionSynchronizationManager.\n\nDe ce provoaca Memory Leaks:\nServerele web (Tomcat) folosesc un Thread Pool (firele nu mor dupa request, ci se recicleaza). Daca nu apelezi ThreadLocal.remove():\n1. Obiectele din ThreadLocal raman blocate in memorie si nu pot fi curatate de GC.\n2. Urmatorul request HTTP pe acelasi thread va vedea datele utilizatorului anterior (vulnerabilitate de securitate)!",
    codeSnippet: `public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    public static void setTenant(String tenant) { CURRENT_TENANT.set(tenant); }
    public static String getTenant() { return CURRENT_TENANT.get(); }
    public static void clear() { CURRENT_TENANT.remove(); } // OBLIGATORIU in finally!
}`,
    interviewTrap: "Cheile din ThreadLocalMap sunt WeakReferences, dar valorile sunt StrongReferences. Daca thread-ul traieste mult in pool, valorile raman blocate.",
    keyTakeaway: "Apeleaza intotdeauna threadLocal.remove() intr-un bloc finally sau Spring HandlerInterceptor."
  },
  {
    id: "java-35",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Deadlock: Conditiile de aparitie si Prevenirea in Java",
    question: "Ce este un Deadlock intre doua thread-uri si cum se poate preveni simplu la nivel de cod aplicativ?",
    answer: "Deadlock-ul apare cand doua thread-uri se blocheaza reciproc: Thread 1 detine Lock A si asteapta Lock B, iar Thread 2 detine Lock B si asteapta Lock A.\n\nCum se previne:\n1. Lock Ordering (Cea mai buna metoda): Toate thread-urile din sistem cer lock-urile in aceeasi ordine stricta (ex: dupa ID crescator).\n2. tryLock() cu Timeout din ReentrantLock: Daca nu primeste lock-ul in X secunde, elibereaza resursele si reincearca.\n3. Detectare: jstack <pid> identifica instant thread-urile blocate.",
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
    interviewTrap: "Fara ordonare dupa ID, cand A trimite bani lui B si concomitent B trimite bani lui A, apare Deadlock instant.",
    keyTakeaway: "Ordoneaza intotdeauna achizitia lock-urilor pentru a elimina bucla circulara de asteptare."
  },
  {
    id: "java-36",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "ReentrantLock vs synchronized in Java",
    question: "Ce avantaje ofera clasa ReentrantLock din java.util.concurrent.locks fata de cuvantul cheie nativ synchronized?",
    answer: "ReentrantLock ofera capabilitati avansate inexistente in synchronized:\n1. Non-blocking Lock Acquisition: Metoda tryLock() incearca sa obtina lock-ul fara sa ramana blocata la infinit.\n2. Lock cu Timeout: lock.tryLock(2, TimeUnit.SECONDS) renunta daca lock-ul nu devine disponibil in 2 secunde (previne deadlock-uri).\n3. Intreruptibilitate: lockInterruptibly() permite unui thread blocat sa fie intrerupt prin thread.interrupt().\n4. Fairness Policy: Poate fi configurat cu new ReentrantLock(true) pentru a acorda lock-ul in ordinea sosirii thread-urilor (FIFO - Fair Lock).\n5. Multiple Conditii: Permite crearea de multiple Condition objects (ex: notFull, notEmpty) pe acelasi lock.",
    codeSnippet: `Lock lock = new ReentrantLock();
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try {
        // Sectiune critica
    } finally {
        lock.unlock(); // OBLIGATORIU in finally!
    }
}`,
    interviewTrap: "Daca uiti sa apelezi lock.unlock() in interiorul unui bloc finally, lock-ul ramane blocat pentru totdeauna!",
    keyTakeaway: "synchronized este mai curat si auto-eliberat; ReentrantLock este necesar pentru timeouts, fairness sau Virtual Threads in Java 21."
  },
  {
    id: "java-37",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Parametrii critici ai unui ThreadPoolExecutor in Java",
    question: "Care sunt cei 5 parametri de baza ai unui ThreadPoolExecutor si cum decide executorul cand creeaza thread-uri noi sau pune task-urile in coada?",
    answer: "Cei 5 parametri sunt:\n1. corePoolSize: Numarul de thread-uri mentinute active permanent in pool.\n2. maximumPoolSize: Numarul maxim de thread-uri permise la sarcina mare.\n3. keepAliveTime: Timpul dupa care thread-urile suplimentare peste corePoolSize sunt oprite daca sunt inactive.\n4. workQueue (BlockingQueue): Coada unde asteapta task-urile cand toate core threads sunt ocupate.\n5. handler (RejectedExecutionHandler): Politica aplicata cand coada este plina si s-a atins maximumPoolSize (AbortPolicy, CallerRunsPolicy).\n\nFluxul de executie surprinzator:\nCand soseste un task nou:\n- Daca numarul de thread-uri < corePoolSize: Creeaza un thread nou.\n- Daca corePoolSize este plin: Pune task-ul in COADA (workQueue)!\n- Doar daca COADA DEVINE PLINA, creeaza thread-uri noi pana la maximumPoolSize!\n- Daca si coada si maximumPoolSize sunt pline: Apeleaza RejectedExecutionHandler.",
    codeSnippet: `ThreadPoolExecutor executor = new ThreadPoolExecutor(
    4,                      // corePoolSize
    10,                     // maximumPoolSize
    60L, TimeUnit.SECONDS,  // keepAliveTime
    new ArrayBlockingQueue<>(500), // Coada limitata (Bounded Queue)
    new ThreadPoolExecutor.CallerRunsPolicy() // Backpressure graceful
);`,
    interviewTrap: "Metodele factory Executors.newFixedThreadPool() folosesc o coada LinkedBlockingQueue NELIMITATA (Integer.MAX_VALUE). Daca task-urile sosesc mai repede decat pot fi procesate, coada consuma tot RAM-ul si duce la OutOfMemoryError!",
    keyTakeaway: "Foloseste intotdeauna ThreadPoolExecutor cu coada de dimensiune limitata si politica CallerRunsPolicy pentru protectie in productie."
  },
  {
    id: "java-38",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "CountDownLatch vs CyclicBarrier in Java",
    question: "Care este diferenta dintre clasele de sincronizare CountDownLatch si CyclicBarrier din java.util.concurrent?",
    answer: "1. CountDownLatch (One-Shot):\n   - Functioneaza ca un numarator invers (countdown).\n   - Unul sau mai multe thread-uri asteapta apeland latch.await() pana cand alte thread-uri decrementeaza contorul la 0 prin latch.countDown().\n   - Nu poate fi resetat dupa ce a ajuns la 0 (este de unica folosinta).\n   - Exemplu: Asteptarea ca 3 microservicii independente sa finalizeze initializarea inainte de a deschide traficul HTTP.\n\n2. CyclicBarrier (Reutilizabil):\n   - Ofera un punct comun de intalnire (rendezvous point) pentru un numar fix de N thread-uri.\n   - Fiecare thread apeleaza barrier.await() si ramane blocat pana cand toate cele N thread-uri au sosit la bariera. In acel moment, toate firele sunt eliberate simultan.\n   - Poate fi resetata si refolosita in bucle ciclice pe runde repetate.",
    codeSnippet: `// 1. CountDownLatch (Start dupa ce 3 servicii sunt gata):
CountDownLatch latch = new CountDownLatch(3);
latch.countDown();
latch.await();

// 2. CyclicBarrier:
CyclicBarrier barrier = new CyclicBarrier(4, () -> System.out.println("Toti au sosit!"));
barrier.await();`,
    interviewTrap: "CountDownLatch este axat pe evenimente (numara de cate ori s-a apelat countDown), in timp ce CyclicBarrier este axat pe thread-uri (toate firele asteapta la aceeasi bariera).",
    keyTakeaway: "Pentru task-uri de initializare: CountDownLatch. Pentru simulari paralele in runde: CyclicBarrier."
  },
  {
    id: "java-39",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Ce este Semaphore si cum controleaza accesul la resurse finite?",
    question: "Ce este un Semaphore in Java si cum se foloseste pentru a implementa Rate Limiting sau un Connection Pool simplificat?",
    answer: "Un Semaphore gestioneaza un set de \"permise\" (permits) numerice virtuale:\n- acquire(): Blocheaza thread-ul curent pana cand un permis devine disponibil si il consuma (scade contorul cu 1).\n- release(): Returneaza un permis inapoi la semafor (creste contorul cu 1), eliberand eventualele thread-uri blocate in acquire().\n\nEste utilizat pentru a limita numarul maxim de fire concurente care pot accesa simultan o resursa finita (ex: maxim 5 apeluri simultane catre un API extern scump sau o baza de date).",
    codeSnippet: `Semaphore semaphore = new Semaphore(3); // Maxim 3 conexiuni simultane

public void callExternalApi() throws InterruptedException {
    semaphore.acquire();
    try {
        executeHttpCall();
    } finally {
        semaphore.release(); // OBLIGATORIU in finally!
    }
}`,
    interviewTrap: "Un Semaphore cu 1 singur permis (new Semaphore(1)) se comporta similar cu un Lock binar, dar cu o diferenta critica: permisul poate fi eliberat de un ALT thread decat cel care l-a achizitionat!",
    keyTakeaway: "Semaphore limiteaza numarul de accesari concurente la o resursa externa."
  },
  {
    id: "java-40",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "CompletableFuture: Rularea si combinarea de operatii asincrone",
    question: "Cum rulezi doua apeluri API externe in paralel si combini rezultatele folosind CompletableFuture in Java 8+?",
    answer: "CompletableFuture permite programarea asincrona functionala si non-blocanta:\n1. supplyAsync(): Lanseaza operatia asincron pe un executor.\n2. thenCombine(): Uneste ambele rezultate cand ambele futures s-au terminat cu succes.\n3. allOf(): Asteapta terminarea a N task-uri paralele.\n4. exceptionally(): Ofera o valoare de fallback in caz de eroare.",
    codeSnippet: `CompletableFuture<UserDto> userFuture = CompletableFuture.supplyAsync(() -> userService.getUser(id));
CompletableFuture<List<JobDto>> jobsFuture = CompletableFuture.supplyAsync(() -> jobService.getRecommendedJobs(id));

CompletableFuture<DashboardDto> dashboard = userFuture
    .thenCombine(jobsFuture, (user, jobs) -> new DashboardDto(user, jobs))
    .exceptionally(ex -> DashboardDto.empty());

DashboardDto result = dashboard.join();`,
    interviewTrap: "Daca nu specifici un Executor personalizat, supplyAsync foloseste ForkJoinPool.commonPool. Daca ai apeluri I/O blocante, vei epuiza thread-urile din pool!",
    keyTakeaway: "Trimite intotdeauna un ExecutorService dedicat cu Thread Pool optimizat ca parametru in supplyAsync()."
  },
  {
    id: "java-41",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Interfete Functionale de baza in java.util.function",
    question: "Care sunt cele 4 interfete functionale fundamentale din Java 8 si care sunt semnaturile metodelor lor abstracte (Predicate, Function, Consumer, Supplier)?",
    answer: "Cele 4 interfete canonice pe care se bazeaza Lambdas si Streams API:\n1. Predicate<T>: Primeste T si returneaza boolean (metoda: boolean test(T t)). Folosit in Stream.filter().\n2. Function<T, R>: Primeste T si returneaza R (metoda: R apply(T t)). Folosit in Stream.map().\n3. Consumer<T>: Primeste T si nu returneaza nimic / void (metoda: void accept(T t)). Folosit in Stream.forEach().\n4. Supplier<T>: Nu primeste niciun parametru si produce o valoare T (metoda: T get()). Folosit in Optional.orElseGet() sau generatoare.",
    codeSnippet: `Predicate<String> isShort = s -> s.length() < 5;
Function<String, Integer> toLength = String::length;
Consumer<String> printer = System.out::println;
Supplier<Double> randomGen = Math::random;`,
    interviewTrap: "Daca o interfata are mai mult de o metoda abstracta, NU este o interfata functionala chiar daca are adnotarea @FunctionalInterface (compilatorul va da eroare)! Metodele default si statice nu se contorizeaza ca abstracte.",
    keyTakeaway: "Predicate = test boolean; Function = transformare; Consumer = consum void; Supplier = furnizare valoare."
  },
  {
    id: "java-42",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Operatii Intermediare (Lazy) vs Terminale in Streams API",
    question: "De ce operatiile dintr-un Java Stream sunt \"Lazy\" (lenese) si ce declanseaza executia efectiva a procesarii?",
    answer: "1. Operatii Intermediare (Intermediate Operations):\n   - Exemple: filter(), map(), flatMap(), distinct(), sorted(), limit().\n   - Sunt complet LAZY: Nu proceseaza niciun element si nu consuma memorie cand sunt apelate. Ele doar construiesc un pipeline declarativ de transformari.\n\n2. Operatii Terminale (Terminal Operations):\n   - Exemple: collect(), forEach(), reduce(), count(), anyMatch(), findFirst().\n   - Sunt EAGER: Doar apelarea unei operatii terminale declanseaza executia pipeline-ului.\n\nOptimizarea Short-Circuiting:\nDeoarece stream-urile sunt lazy, Java poate procesa elementele pe rand pe verticala (nu genereaza colectii intermediare). De exemplu, intr-un filter() urmat de findFirst(), procesarea se opreste imediat dupa primul element valid!",
    codeSnippet: `List<String> names = List.of("Ana", "Bogdan", "Cristian");

// Nimic nu se executa AICI (doar definire pipeline):
Stream<String> stream = names.stream()
    .filter(n -> { System.out.println("Filter: " + n); return n.length() > 3; });

System.out.println("Inainte de terminal");
String first = stream.findFirst().orElse(""); // Abia AICI se executa!`,
    interviewTrap: "Un Stream poate fi consumat O SINGURA DATA! Daca incerci sa apelezi o a doua operatie terminala pe aceeasi instanta de Stream, vei primi IllegalStateException: stream has already been operated upon or closed.",
    keyTakeaway: "Operatiile intermediare doar configureaza pipeline-ul; operatia terminala declanseaza executia element cu element."
  },
  {
    id: "java-43",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce NU trebuie sa folosesti parallelStream() pentru operatiuni I/O?",
    question: "De ce folosirea lui parallelStream() pentru apeluri HTTP sau interogari de baze de date poate bloca intreaga aplicatie?",
    answer: "parallelStream() foloseste sub capota un thread pool global partajat la nivelul intregului JVM: ForkJoinPool.commonPool().\n\nMarimea acestui pool este egala cu numarul de nuclee CPU (Runtime.getRuntime().availableProcessors() - 1).\n\nDe ce este periculos pentru I/O:\nForkJoinPool a fost proiectat pentru calcule intensive de procesor (CPU-bound, divide-et-impera). Daca lansezi apeluri HTTP sau interogari DB blocante intr-un parallelStream(), toate firele din ForkJoinPool.commonPool vor ramane blocate in asteptare I/O. Niciun alt modul din aplicatie nu va mai putea rula sarcini paralele, degradand grav intregul sistem!",
    codeSnippet: `// GRESIT (Blocheaza ForkJoinPool.commonPool global cu apeluri I/O lente):
jobUrls.parallelStream().forEach(this::callExternalHttpApi);

// CORECT: Foloseste Virtual Threads (Java 21) sau un ThreadPoolExecutor dedicat!`,
    interviewTrap: "Pentru colectii mici (sub 10.000 de elemente), parallelStream() este adesea MAI LENT decat un stream secvential simplu din cauza overhead-ului de impartire a task-urilor si combinare de rezultate.",
    keyTakeaway: "parallelStream() este strict pentru calcule masive CPU-bound in memorie, niciodata pentru I/O de retea sau baze de date."
  },
  {
    id: "java-44",
    category: "JAVA",
    difficulty: "USOR",
    title: "Bune practici cu Optional in Java 8+",
    question: "Care sunt cele mai mari greseli de utilizare a clasei Optional<T> si de ce orElseGet() este preferat in locul lui orElse()?",
    answer: "Optional a fost creat exclusiv ca tip de retur pentru metode pentru a indica clar lipsa unei valori (eliminand NullPointerException).\n\nReguli de bune practici:\n1. Nu folosi niciodata optional.get() fara verificare anterioara isPresent() (sau foloseste direct orElseThrow()).\n2. Nu folosi Optional ca tip de camp intr-o entitate (nu este Serializable).\n3. Nu folosi Optional ca parametru de metoda.\n4. orElse() vs orElseGet():\n   - orElse(expresie): Evalueaza expresia INTOTDEAUNA, chiar daca Optional-ul contine deja o valoare!\n   - orElseGet(supplier): Evalueaza expresia doar daca Optional-ul este gol (Lazy Evaluation).",
    codeSnippet: `// GRESIT: generateDefault() se apeleaza MEREU, consumand resurse!
User user = findUser().orElse(generateDefaultFromDb());

// CORECT: Supplier-ul se executa DOAR cand utilizatorul lipseste:
User user = findUser().orElseGet(() -> generateDefaultFromDb());`,
    interviewTrap: "Nu returna niciodata null dintr-o metoda care are tipul de retur Optional<T>! Returneaza intotdeauna Optional.empty().",
    keyTakeaway: "Foloseste orElseGet() pentru valori de fallback costisitoare si Optional strict ca tip de retur de metoda."
  },
  {
    id: "java-45",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Ce sunt Java Records (introduse in Java 16/21)?",
    question: "Ce este un Record in Java modern, ce cod genereaza automat compilatorul si cand il folosesti in loc de o clasa DTO standard sau Lombok @Data?",
    answer: "Un Record este o clasa speciala imutabila de tip \"data carrier\" (purtatoare de date transparente).\n\nCe genereaza automat compilatorul:\n1. Campuri private final pentru fiecare componenta din header.\n2. Constructor canonic cu toti parametrii.\n3. Getters cu numele campului (ex: id(), email() in loc de getId()).\n4. Implementare corecta pentru equals() si hashCode() bazata pe toate campurile.\n5. Metoda toString() formatata clar.\n\nCand le folosim: Ideale pentru DTO-uri REST, chei compuse de cache, proiectii de baze de date si mesaje de coada. Sunt integrate nativ cu Pattern Matching in Java 21.",
    codeSnippet: `public record JobSummaryDto(Long id, String title, String company, double salary) {
    public JobSummaryDto {
        if (salary < 0) throw new IllegalArgumentException("Salariul nu poate fi negativ");
    }
}

JobSummaryDto dto = new JobSummaryDto(1L, "Java Dev", "Tech Corp", 3500.0);
System.out.println(dto.title()); // Getter-ul nu are prefixul "get"`,
    interviewTrap: "Un Record nu poate extinde o alta clasa (deoarece extinde deja implicit java.lang.Record). Nu este potrivit ca entitate JPA/Hibernate cu relatii Lazy!",
    keyTakeaway: "Records elimina codul boilerplate pentru DTO-uri si garanteaza imutabilitate garantata."
  },
  {
    id: "java-46",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Ce sunt Sealed Classes in Java 17+ (permits, final, non-sealed)?",
    question: "Ce problema de design rezolva clasele sigilate (Sealed Classes) si care sunt cele 3 cuvinte cheie pe care le pot avea clasele descendente?",
    answer: "In Java traditional, o clasa putea fi ori mostenita de oricine (public), ori nemostenita de nimeni (final). Nu exista o cale de mijloc.\n\nSealed Classes permit unui autor de librarie sa declare explicit care clase au voie sa o mosteneasca folosind clauza permits:\npublic sealed class PaymentMethod permits CreditCard, BankTransfer, Crypto {}\n\nRegula celor 3 modificatori pe subclase:\nFiecare clasa mentionata in permits trebuie sa aiba exact unul din cei 3 modificatori:\n1. final: Nu mai poate fi extinsa deloc.\n2. sealed: Extinde clasa, dar isi declara propria sa lista restransa de copii permits.\n3. non-sealed: Se deschide mostenirii nelimitate de catre oricine.\n\nBeneficiu major: Permite verificarea exhaustiva in switch expressions in Java 21 fara a mai fi nevoie de clauza default!",
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
    interviewTrap: "Toate subclasele permise trebuie sa se afle in acelasi modul sau in acelasi pachet (package) cu clasa parinte sealed!",
    keyTakeaway: "Sealed classes definesc ierarhii de mostenire controlate si permit pattern matching exhaustiv la compilare."
  },
  {
    id: "java-47",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Pattern Matching for Switch & Record Patterns (Java 21)",
    question: "Cum simplifica Java 21 inspectarea tipurilor de obiecte folosind Pattern Matching in switch expressions si Record Patterns?",
    answer: "Inainte de Java 21, verificarea tipurilor cerea lanturi lungi de if (obj instanceof Type) urmate de cast-uri explicite.\n\nIn Java 21:\n1. Switch pe tipuri: Permite inspectarea tipului direct in switch, cu verificari de null si conditii aditionale (guarded patterns cu when).\n2. Record Patterns: Permite deconstructia directa a componentelor unui Record chiar in antetul cazului de switch!",
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
    interviewTrap: "Switch-ul pe obiecte sigilate (sealed classes) sau exhaustive trebuie sa acopere toate cazurile posibile, altfel compilatorul cere obligatoriu clauza default.",
    keyTakeaway: "Pattern Matching in Java 21 elimina complet cast-urile manuale si reduce codul de clasificare cu peste 70%."
  },
  {
    id: "java-48",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "La ce foloseste serialVersionUID si cuvantul cheie transient?",
    question: "Ce rol are campul serialVersionUID intr-o clasa Serializable si ce se intampla cu campurile declarate cu cuvantul cheie transient la serializare?",
    answer: "1. serialVersionUID:\n   - Este un identificator numeric de versiune asociat fiecarei clase Serializable.\n   - La serializare, JVM scrie acest ID in fluxul de octeti. La deserializare, compara ID-ul din flux cu ID-ul clasei curente din classpath.\n   - Daca nu declari explicit serialVersionUID, compilatorul genereaza automat un hash bazat pe campurile si metodele clasei. Daca adaugi ulterior un simplu camp nou, ID-ul se schimba, iar deserializarea obiectelor vechi va esua cu InvalidClassException!\n\n2. Cuvantul cheie transient:\n   - Marcheaza un camp pentru a fi IGNORAT complet de procesul de serializare nativa Java.\n   - La deserializare, campul primeste valoarea sa default (null pentru obiecte, 0 pentru numere, false pentru booleeni).\n   - Folosit pentru date sensibile (parole, chei criptografice) sau resurse legate de mediul local (socket-uri, conexiuni la DB).",
    codeSnippet: `public class UserSession implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private transient String rawPassword; // NU se serializeaza pe disc/retea!
}`,
    interviewTrap: "Variabilele statice (static) NU sunt serializate oricum, deoarece ele apartin clasei, nu instantei!",
    keyTakeaway: "Declara intotdeauna explicit private static final long serialVersionUID = 1L; si marcheaza datele confidentiale cu transient."
  },
  {
    id: "java-49",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Java Reflection API: Putere si Riscuri in Productie",
    question: "Ce este Java Reflection API, cum il folosesc framework-urile moderne (Spring Boot, Jackson) si care sunt cele 3 dezavantaje majore ale sale?",
    answer: "Reflection permite inspectarea si modificarea la runtime a claselor, campurilor, metodelor si constructorilor, chiar si a celor private (prin setAccessible(true)).\n\nUtilizare in framework-uri:\n- Spring Boot: Inspecteaza adnotarile (@Autowired, @Service) si instantiaza componentele.\n- Jackson: Citeste campurile claselor pentru a le serializa in JSON.\n\n3 Dezavantaje / Riscuri majore:\n1. Performanta scazuta: Apelurile reflexive nu pot fi optimizate agresiv de compilatorul JIT (inlining-ul este dezactivat) si implica verificari de securitate la fiecare invocare.\n2. Pierderea Compile-Time Safety: Erorile de denumire a metodelor sau tipurilor apar abia la runtime sub forma de NoSuchMethodException sau ClassNotFoundException.\n3. Risc de Securitate si Incapsulare: Incalca incapsularea claselor prin accesarea datelor private; in Java 9+, sistemul de module (JPMS) blocheaza accesul reflexiv pe pachete interne fara configurare explicita (--add-opens).",
    codeSnippet: `// Inspectare reflexiva camp privat:
Field field = Candidate.class.getDeclaredField("salary");
field.setAccessible(true); // Ocoleste modificatorul private!
field.set(candidateInstance, 5000.0);`,
    interviewTrap: "Incepand cu Java 17+, comanda setAccessible(true) pe clase interne ale JDK-ului arunca InaccessibleObjectException daca modulul nu este deschis explicit.",
    keyTakeaway: "Reflection este esential pentru framework-uri si unelte de testare, dar trebuie evitat in logica de business curenta."
  },
  {
    id: "java-50",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Java NIO.2 vs IO Traditional (Streams vs Channels & Buffers)",
    question: "Care este diferenta dintre vechiul pachet java.io (bazat pe Streams) si java.nio (Non-blocking I/O) introdus pentru servere de inalta performanta?",
    answer: "1. Java IO Traditional (Stream-Oriented & Blocking):\n   - Functioneaza cu fluxuri secventiale de bytes (InputStream, OutputStream).\n   - Este BLOCKING: Cand un thread citeste din socket sau fisier (read()), el ramane complet blocat pana cand sosesc datele. Pentru a deservi 10.000 de clienti simultan, aveai nevoie de 10.000 de thread-uri (Memory & Context Switching limitat).\n\n2. Java NIO (Buffer & Channel-Oriented & Non-Blocking):\n   - Datele sunt citite dintr-un Channel intr-un Buffer de memorie nativa direct alocat (DirectByteBuffer).\n   - Selector Pattern: Un singur thread poate monitoriza mii de canale deschise folosind mecanismele native ale sistemului de operare (epoll in Linux, kqueue in macOS). Cand un canal are date disponibile pentru citire, Selector-ul notifica thread-ul.\n   - Sta la baza serverelor reactiv-asincrone de mare viteza precum Netty, Tomcat NIO si Node.js.",
    codeSnippet: `// Citire moderna si rapida cu java.nio.file.Files:
Path path = Path.of("cv.pdf");
byte[] data = Files.readAllBytes(path);
List<String> lines = Files.readAllLines(path);`,
    interviewTrap: "Pentru fisiere mici pe disc, metodele statice din Files (Files.writeString, Files.readString) sunt mai rapide si mai sigure decat codul vechi cu BufferedReader/FileReader.",
    keyTakeaway: "IO clasic = stream-uri blocante thread-per-client; NIO = canale non-blocante cu selectoare pentru mii de conexiuni paralele pe un singur thread."
  },
  {
    id: "java-51",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Java Memory Model (JMM) si Relatia Happens-Before",
    question: "Ce este Java Memory Model (JMM) si ce garanteaza relatia Happens-Before intre instructiuni executate pe thread-uri diferite?",
    answer: "JMM defineste regulile prin care operatiile de citire si scriere in memorie (in cache-urile CPU si memoria principala) sunt vizibile intre thread-uri concurente.\\n\\nRelatia Happens-Before garanteaza ca scrierile efectuate de o actiune A sunt vizibile garantat pentru actiunea B:\\n1. Program Order Rule: Intr-un singur thread, fiecare actiune se intampla inainte de actiunile urmatoare in ordinea programului.\\n2. Monitor Lock Rule: O deblocare (unlock) a unui monitor happens-before fiecarei blocari ulterioare (lock) pe acelasi monitor.\\n3. Volatile Variable Rule: O scriere intr-un camp volatile happens-before fiecarei citiri ulterioare a aceluiasi camp.\\n4. Thread Start Rule: Apelul Thread.start() pe un fir happens-before oricarei actiuni din interiorul noului fir.\\n5. Thread Termination Rule: Orice actiune dintr-un fir happens-before momentul in care alt fir detecteaza terminarea lui prin join() sau isAlive().\\n6. Transitivity: Daca A happens-before B si B happens-before C, atunci A happens-before C.",
    codeSnippet: `// Scriere intr-un camp volatile forteaza scrierea tuturor variabilelor modificate anterior in RAM:
int a = 0;
volatile boolean flag = false;

// Thread 1:
a = 42;          // 1. Modificare variabila normala
flag = true;     // 2. Scriere volatile (flush in RAM)

// Thread 2:
if (flag) {      // 3. Citire volatile (invalideaza cache CPU)
    print(a);    // Garanteaza afisarea 42! Fara volatile, putea fi 0!
}`,
    interviewTrap: "Fara o relatie Happens-Before, compilatorul JIT si procesorul au libertatea de a reordona instructiunile (Instruction Reordering), generand valori corupte sau bucle infinite.",
    keyTakeaway: "Happens-Before este fundamentul JMM care garanteaza ordinea si vizibilitatea memoriei intre fire de executie."
  },
  {
    id: "java-52",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Operatia Atomica CAS (Compare-And-Swap) si CMPXCHG",
    question: "Cum functioneaza operatia CAS (Compare-And-Swap) la nivel hardware si cum sta la baza claselor atomice din java.util.concurrent?",
    answer: "CAS este o instructiune atomica sustinuta nativ la nivel de procesor (pe x86: instructiunea CMPXCHG):\\n\\nCum functioneaza CAS:\\n1. Primeste 3 parametri: Adresa de memorie V, Valoarea asteptata (Expected Value A) si Valoarea noua (New Value B).\\n2. Procesorul verifica atomic: Daca valoarea curenta de la adresa V este egala cu A, scrie B la adresa respectiva si returneaza true.\\n3. Daca valoarea a fost schimbata intre timp de alt procesor (V != A), nu face nicio modificare si returneaza false.\\n\\nUtilizare in java.util.concurrent (AtomicInteger, AtomicReference):\\n- In loc sa blocheze thread-ul cu un lock greoi de sistem de operare, clasele atomice folosesc o bucla optimista (spin-loop): citesc valoarea curenta, calculeaza noua valoare si incearca un CAS. Daca esueaza din cauza concurentei, reincearca imediat.",
    codeSnippet: `// Concept bucla CAS din AtomicInteger.incrementAndGet():
public final int incrementAndGet() {
    int current;
    int next;
    do {
        current = get();
        next = current + 1;
    } while (!compareAndSet(current, next)); // Reincearca daca alt fir a modificat
    return next;
}`,
    interviewTrap: "CAS este \"lock-free\", dar sub concurenta extrema (sute de thread-uri care modifica aceeasi variabila) genereaza CPU spinning excesiv si poate fi mai lent decat LongAdder.",
    keyTakeaway: "CAS realizeaza actualizari atomice fara blocare la nivel de instructiune hardware CPU (CMPXCHG)."
  },
  {
    id: "java-53",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Problema ABA in Algoritmi Lock-Free si AtomicStampedReference",
    question: "Ce este problema ABA in concurenta optimista si cum o rezolva clasa AtomicStampedReference in Java?",
    answer: "Problema ABA apare in algoritmii concurenti lock-free bazati pe CAS:\\n\\nScenariul ABA:\\n1. Thread-ul 1 citeste valoarea A de la o adresa de memorie.\\n2. Thread-ul 1 este suspendat temporar de sistemul de operare.\\n3. Thread-ul 2 intervine si schimba valoarea din A in B.\\n4. Thread-ul 3 (sau tot Thread-ul 2) schimba valoarea inapoi din B in A!\\n5. Thread-ul 1 se trezeste si executa CAS(expected=A, new=C). Deoarece valoarea curenta este din nou A, operatia CAS reuseste cu succes!\\n\\nDe ce este periculos:\\nIn structuri de date precum stive lock-free (Treiber Stack), nodul A poate parea neschimbat ca valoare, dar referintele sale interne (pointerul next) au fost complet alterate, ducand la coruperea memoriei.\\n\\nSolutia in Java: AtomicStampedReference\\n- Ataseaza fiecarei referinte un numar de versiune (stamp / timestamp intreg).\\n- Verificarea devine: (reference == expectedRef && stamp == expectedStamp). Chiar daca valoarea redevine A, stamp-ul a fost incrementat (ex: de la 1 la 3), iar CAS-ul va esua corect!",
    codeSnippet: `AtomicStampedReference<String> ref = new AtomicStampedReference<>("A", 1);

int[] stampHolder = new int[1];
String value = ref.get(stampHolder); // value = "A", stamp = 1

// Modificare cu incrementare stamp:
boolean updated = ref.compareAndSet("A", "C", stampHolder[0], stampHolder[0] + 1);`,
    interviewTrap: "Nu confunda AtomicReference cu AtomicStampedReference; prima este vulnerabila la ABA daca logica depinde de starea istorica a nodurilor, nu doar de valoare.",
    keyTakeaway: "Problema ABA este rezolvata prin versionarea referintelor cu un stamp incrementat la fiecare modificare."
  },
  {
    id: "java-54",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce LongAdder este mai rapid decat AtomicLong sub incarcare mare?",
    question: "De ce clasa LongAdder introdusa in Java 8 este mult mai performanta decat AtomicLong in scenarii cu concurenta extrema de scriere?",
    answer: "1. Problema cu AtomicLong:\\n   - Toate thread-urile incearca sa actualizeze aceeasi singura variabila din memorie folosind CAS intr-o bucla.\\n   - Sub incarcare mare (ex: 64 thread-uri), cele mai multe operatii CAS esueaza si reincearca continuu (CPU Cache line bouncing si bus saturation).\\n\\n2. Solutia din LongAdder (Striped64):\\n   - LongAdder mentine intern un array de celule (Cell[]), fiecare celula avand o valoare partiala.\\n   - Cand apare concurenta, fiecare thread este directionat pe o celula diferita pe baza hash-ului thread-ului curent, adunand valoarea la celula respectiva fara a se ciocni cu alte fire!\\n   - Cand este nevoie de valoarea totala (apelul longValue() sau sum()), LongAdder parcurge toate celulele si aduna sumele.\\n\\n3. Cand folosesti fiecare:\\n   - LongAdder: Pentru colectare de metrici, contorizari de cereri HTTP, rate limiters unde scrierile sunt foarte frecvente si citirea sumei este ocazionala.\\n   - AtomicLong: Cand ai nevoie de operatii atomice combinate de citire si scriere (ex: compareAndSet precis, incrementAndGet).",
    codeSnippet: `// Utilizare LongAdder pentru contorizare de inalta performanta:
LongAdder requestCounter = new LongAdder();

// In servlet / controller (apel concurent masiv):
requestCounter.increment(); // Nu blocheaza alte thread-uri!

// La raportare:
long total = requestCounter.sum();`,
    interviewTrap: "LongAdder nu ofera o metoda atomica compareAndSet. Daca ai nevoie de verificare si setare simultana a unei secvente de numere, trebuie sa folosesti AtomicLong.",
    keyTakeaway: "LongAdder disperseaza scrierile concurente pe un array intern de celule, eliminand contention-ul pe o singura adresa de memorie."
  },
  {
    id: "java-55",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "False Sharing pe CPU Cache Lines si adnotarea @Contended",
    question: "Ce este fenomenul de False Sharing la nivelul cache-ului de procesor si cum il previne adnotarea @Contended in Java?",
    answer: "1. Structura CPU Cache Line:\\n   - Procesoarele moderne nu citesc memoria octet cu octet, ci in blocuri numite Cache Lines (de regula 64 de bytes).\\n   - Daca doua variabile independente A si B se afla suficient de aproape in memorie incat sa incapa in aceeasi linie de 64 bytes de cache:\\n\\n2. Ce este False Sharing:\\n   - Daca Core 1 modifica variabila A, intregul Cache Line de 64 bytes devine invalidat pe toate celelalte nuclee CPU conform protocolului de coerenta a cache-ului (MESI protocol).\\n   - Chiar daca Core 2 dorea doar sa modifice variabila B (complet independenta de A), nucleul sau trebuie sa astepte reincarcarea liniei de cache din RAM!\\n   - Acest du-te-vino continuu reduce drastic performanta aplicatiilor concurente.\\n\\n3. Solutia in Java: Adnotarea @Contended (si Padding manual):\\n   - Adauga spatiu gol (padding de 128 bytes) in jurul campului, fortandu-l sa ocupe o linie de cache dedicata si eliminand interferenta intre nuclee.",
    codeSnippet: `// Folosita intern in LongAdder si ConcurrentHashMap:
// Necesita parametrul JVM: -XX:-RestrictContended
public class PaddedAtomicCounter {
    @jdk.internal.vm.annotation.Contended
    private volatile long counter1;

    @jdk.internal.vm.annotation.Contended
    private volatile long counter2;
}`,
    interviewTrap: "False Sharing este invizibil in codul Java pur si nu arunca erori; se manifesta doar printr-o cadere masiva a throughput-ului la adaugarea de nuclee CPU suplimentare.",
    keyTakeaway: "False Sharing apare cand doua fire modifica variabile diferite situate pe aceeasi linie de cache CPU (64 bytes); se rezolva prin padding."
  },
  {
    id: "java-56",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "CopyOnWriteArrayList: Mecanism si Cazuri Ideale",
    question: "Cum functioneaza CopyOnWriteArrayList, ce complexitate au scrierile si de ce este excelent pentru liste de Observeri sau Listeners?",
    answer: "CopyOnWriteArrayList este o implementare de lista thread-safe bazata pe principiul \"copiaza la fiecare scriere\":\\n\\n1. Cum functioneaza Citirile:\\n   - Citirile (get, iterator) NU folosesc niciun lock sau sincronizare.\\n   - Citesc direct din array-ul intern neschimbat la viteza maxima.\\n   - Iteratorul nu arunca niciodata ConcurrentModificationException si nu reflecta scrierile facute dupa crearea iteratorului.\\n\\n2. Cum functioneaza Scrierile:\\n   - Orice operatie de scriere (add, set, remove) obtine un lock de scriere, creaza o copie completa a array-ului existent, efectueaza modificarea pe copie si apoi schimba referinta array-ului intern (care este volatile).\\n\\n3. Cand se foloseste:\\n   - Ideal pentru liste de Listeneri / Observeri, liste de configuratii sau tabele de rutare unde CITIRILE sunt de 99% iar SCRIERILE sunt foarte rare.\\n   - Ineficient daca ai mii de inserari pe secunda (complexitate O(N) la fiecare scriere si consum urias de memorie).",
    codeSnippet: `CopyOnWriteArrayList<EventListener> listeners = new CopyOnWriteArrayList<>();

// Citire ultra-rapida fara lock pe mii de fire:
for (EventListener listener : listeners) {
    listener.onEvent(event);
}

// Scriere rara (creeaza o copie a array-ului):
listeners.add(new CustomListener());`,
    interviewTrap: "Nu folosi niciodata CopyOnWriteArrayList pentru colectii mari cu scrieri frecvente, deoarece fiecare apel add() aloca si copiaza un array intreg in memorie.",
    keyTakeaway: "CopyOnWriteArrayList asigura citiri instantanee fara lock-uri pe baza de snapshot, cu pretul unei copieri O(N) la fiecare scriere."
  },
  {
    id: "java-57",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "ReentrantReadWriteLock: Cand aduce un castig real de performanta?",
    question: "Cum functioneaza ReentrantReadWriteLock si in ce conditii de incarcare merita folosit in locul unui ReentrantLock obisnuit?",
    answer: "ReentrantReadWriteLock separa operatiile pe doua lock-uri logice:\\n1. Read Lock (Shared Lock): Multipli cititori pot detine lock-ul simultan, cata vreme nu exista niciun fir care scrie.\\n2. Write Lock (Exclusive Lock): Un singur fir poate detine lock-ul pentru scriere; niciun alt cititor sau scriitor nu are acces.\\n\\nCand aduce castig de performanta:\\n- Merita folosit NUMAI daca raportul dintre operatii este covarsitor in favoarea citirilor (ex: peste 90% citiri si sub 10% scrieri) iar durata operatiei protejate este suficient de lunga.\\n- Dezavantaj: Mentinerea starii interne pentru cele doua lock-uri (urmarirea cititorilor concurenti) are un cost de calcul mai mare decat un ReentrantLock simplu. Daca operatia este ultra-scurta (ex: citirea unei variabile intregi), ReentrantLock sau StampedLock este mult mai rapid!",
    codeSnippet: `ReentrantReadWriteLock rwLock = new ReentrantReadWriteLock();
Lock readLock = rwLock.readLock();
Lock writeLock = rwLock.writeLock();

public String readData(String key) {
    readLock.lock();
    try { return cache.get(key); }
    finally { readLock.unlock(); }
}

public void writeData(String key, String value) {
    writeLock.lock();
    try { cache.put(key, value); }
    finally { writeLock.unlock(); }
}`,
    interviewTrap: "ReentrantReadWriteLock nu suporta promovarea automata de la Read Lock la Write Lock (Lock Upgrade); daca incerci sa iei writeLock in timp ce detii readLock pe acelasi thread, vei provoca un Deadlock!",
    keyTakeaway: "ReentrantReadWriteLock permite citiri paralele dar necesita ca marea majoritate a cererilor sa fie de citire pentru a compensa overhead-ul intern."
  },
  {
    id: "java-58",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "StampedLock in Java 8: Ce este Optimistic Read?",
    question: "Cum revolutioneaza StampedLock accesul concurent prin modul Optimistic Read si cum difera de ReentrantReadWriteLock?",
    answer: "StampedLock (introdus in Java 8) ofera 3 moduri de blocare folosind un identificator de tip \"stamp\" (long):\\n1. Writing Mode: Exclusiv, similar cu write lock clasic.\\n2. Reading Mode: Pessimistic shared lock, similar cu read lock clasic.\\n3. Optimistic Reading Mode (Inovatia cheie):\\n   - Nu obtine un lock real! Nu exista nicio operatie atomica de CAS sau scriere in memorie, ci doar o citire a unui stamp.\\n   - Cititorul citeste datele optimist, crezand ca nu exista nicio scriere in paralel.\\n   - Dupa ce a citit datele, apeleaza validate(stamp) pentru a verifica daca un scriitor a intervenit in timpul citirii.\\n   - Daca validate returneaza true, datele sunt corecte si s-au citit cu ZERO overhead de sincronizare!\\n   - Daca validate returneaza false (a avut loc o scriere), cititorul face fallback la un Pessimistic Read Lock clasic.\\n\\nDiferenta fata de ReentrantReadWriteLock:\\n- Mult mai rapid, dar NU este reentrant (apelarea pe acelasi thread poate bloca definitiv).",
    codeSnippet: `StampedLock sl = new StampedLock();

public double distanceFromOrigin(double x, double y) {
    long stamp = sl.tryOptimisticRead(); // Citire optimista fara blocare
    double curX = x, curY = y;
    if (!sl.validate(stamp)) {           // A intervenit un scriitor?
        stamp = sl.readLock();           // Fallback la lock pesimist clasic
        try {
            curX = x;
            curY = y;
        } finally {
            sl.unlockRead(stamp);
        }
    }
    return Math.sqrt(curX * curX + curY * curY);
}`,
    interviewTrap: "StampedLock NU este reentrant! Daca un thread care detine deja un writeLock incearca sa mai ia o data un writeLock sau readLock, se va bloca pe el insusi pentru totdeauna.",
    keyTakeaway: "Optimistic Read din StampedLock permite citiri la viteza maxima fara niciun lock, validand la final daca a existat vreo scriere."
  },
  {
    id: "java-59",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "ForkJoinPool si Algoritmul Work-Stealing",
    question: "Cum functioneaza ForkJoinPool si ce este algoritmul de Work-Stealing in paralelismul de tip Divide-and-Conquer?",
    answer: "ForkJoinPool este conceput specific pentru task-uri recursive mici care pot fi impartite recursiv in sub-task-uri (Divide and Conquer):\\n\\n1. Structura Cozilor Deque per-Thread:\\n   - Fiecare thread muncitor (Worker Thread) din ForkJoinPool are propria sa coada dubla de task-uri (Double-Ended Queue - Deque).\\n   - Cand un task face fork(), noul sub-task este pus in capul (top) cozii proprii.\\n   - Thread-ul curent proceseaza task-urile din capul propriei cozi in regim LIFO (Last-In-First-Out), profitand de localitatea din cache-ul CPU.\\n\\n2. Algoritmul Work-Stealing (Furt de munca):\\n   - Daca un fir termina toate task-urile din coada sa si devine inactiv, el devine un \"hot\" si fura un task din coada altui fir ocupat!\\n   - Furtul se face intotdeauna de la COADA (bottom/tail) celeilalte cozi in regim FIFO (First-In-First-Out).\\n   - Aceasta asigura ca hotul fura un sub-task mare (care la randul sau poate fi descompus), minimizand conflictele cu firul proprietar.",
    codeSnippet: `public class SumTask extends RecursiveTask<Long> {
    private final long[] numbers;
    private final int start, end;

    @Override
    protected Long compute() {
        if (end - start <= 1000) { // Prag secvential
            return computeDirectly();
        }
        int mid = (start + end) / 2;
        SumTask leftTask = new SumTask(numbers, start, mid);
        SumTask rightTask = new SumTask(numbers, mid, end);
        leftTask.fork(); // Trimite pe coada pentru procesare paralela / work-stealing
        long rightResult = rightTask.compute();
        long leftResult = leftTask.join();
        return leftResult + rightResult;
    }
}`,
    interviewTrap: "Streams paralele din Java (parallelStream) folosesc implicit un pool comun ForkJoinPool.commonPool(). Daca rulezi operatii I/O blocante in el, blochezi toate operatiile paralele din intreaga aplicatie.",
    keyTakeaway: "Work-Stealing echilibreaza dinamic incarcarea intre thread-uri, permitand firelor libere sa fure task-uri de la coada firelor aglomerate."
  },
  {
    id: "java-60",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce Executors.newFixedThreadPool si newCachedThreadPool sunt periculoase in productie?",
    question: "De ce factory methods din java.util.concurrent.Executors pot cauza OutOfMemoryError in productie si ce ar trebui folosit in schimb?",
    answer: "1. Pericolul din Executors.newFixedThreadPool(n):\\n   - Foloseste intern o coada LinkedBlockingQueue FARA LIMITA (unbounded queue - Integer.MAX_VALUE = 2 miliarde de elemente).\\n   - Daca cererile vin mai repede decat pot fi procesate de cele n fire, coada acumuleaza milioane de task-uri in Heap pana cand JVM-ul crapa cu java.lang.OutOfMemoryError: Java heap space.\\n\\n2. Pericolul din Executors.newCachedThreadPool():\\n   - Creeaza fire NOI nelimitate (maximumPoolSize = Integer.MAX_VALUE) cu o coada SynchronousQueue.\\n   - Daca apare un varf de trafic (burst de 10.000 cereri simultane), va incerca sa porneasca 10.000 de thread-uri native de OS, ducand la java.lang.OutOfMemoryError: unable to create new native thread.\\n\\n3. Bune Practici in Productie:\\n   - Instantiati direct clasa ThreadPoolExecutor, specificand o coada cu limita stricta (Bounded Queue precum ArrayBlockingQueue), corePoolSize, maximumPoolSize si o politica clara de respingere a cererilor (RejectedExecutionHandler).",
    codeSnippet: `// Configurarea sigura de productie a unui ThreadPool:
ThreadPoolExecutor executor = new ThreadPoolExecutor(
    8,                                   // corePoolSize
    16,                                  // maxPoolSize
    60L, TimeUnit.SECONDS,               // keepAliveTime
    new ArrayBlockingQueue<>(500),       // COADA LIMITATA STRICT la 500 elemente!
    new ThreadPoolExecutor.CallerRunsPolicy() // Backpressure: firul apelant preia executia
);`,
    interviewTrap: "Ghidurile de bune practici (precum SonarQube si Alibaba Java Guidelines) interzic explicit utilizarea metodelor factory din Executors in aplicatii enterprise.",
    keyTakeaway: "Evita Executors; foloseste intotdeauna ThreadPoolExecutor cu cozi limitate pentru a preveni epuizarea memoriei Heap sau a resurselor OS."
  },
  {
    id: "java-61",
    category: "JAVA",
    difficulty: "USOR",
    title: "Politici de Saturatie (RejectedExecutionHandler) in ThreadPoolExecutor",
    question: "Ce se intampla cand coada unui ThreadPool este plina si numarul maxim de fire a fost atins? Ce politici de respingere exista?",
    answer: "Cand un task nou este trimis catre executor iar coada limitata este plina si worker threads = maximumPoolSize, executorul activeaza un RejectedExecutionHandler:\\n\\nCele 4 Politici Standard in Java:\\n1. AbortPolicy (Default):\\n   - Arunca o exceptie RejectedExecutionException la apelul submit()/execute(). Util daca vrei sa notifici imediat clientul ca sistemul este saturat.\\n2. CallerRunsPolicy (Cea mai buna pentru Backpressure):\\n   - Nu arunca exceptie si nu pierde task-ul; firul apelant (ex: firul HTTP principal) este obligat sa execute el insusi task-ul.\\n   - Acest lucru incetineste automat ritmul de trimitere a cererilor noi, oferind pool-ului timp sa respire.\\n3. DiscardPolicy:\\n   - Ignora task-ul in mod silentios, fara a arunca vreo eroare (risc de pierdere de date).\\n4. DiscardOldestPolicy:\\n   - Sterge cel mai vechi task neprocesat din capul cozii pentru a face loc noului task sosit.",
    codeSnippet: `// Exemplu CallerRunsPolicy:
ThreadPoolExecutor pool = new ThreadPoolExecutor(
    4, 8, 30L, TimeUnit.SECONDS,
    new ArrayBlockingQueue<>(100),
    new ThreadPoolExecutor.CallerRunsPolicy()
);`,
    interviewTrap: "DiscardPolicy si DiscardOldestPolicy pot cauza bug-uri grave greu de reprodus daca task-urile contin tranzactii critice sau daca se asteapta un Future care nu se va finaliza niciodata.",
    keyTakeaway: "CallerRunsPolicy este standardul de aur pentru mecanisme de backpressure fara pierderi de task-uri."
  },
  {
    id: "java-62",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Thread Pinning in Virtual Threads (Java 21)",
    question: "Ce este Thread Pinning in Virtual Threads (Java 21), de ce blocheaza firul OS de transport (Carrier Thread) si cum se evita?",
    answer: "1. Cum functioneaza Virtual Threads in mod normal:\\n   - Cand un Virtual Thread intalneste o operatie I/O blocanta (citire din socket, query DB, sleep), el se \"demonteaza\" (unmounts) de pe Carrier Thread (firul de sistem de operare). Carrier Thread-ul devine imediat liber sa ruleze alt Virtual Thread.\\n\\n2. Ce este Thread Pinning (Fixare pe fir):\\n   - In anumite situatii, Virtual Thread-ul devine \"prins\" (pinned) pe Carrier Thread si NU se poate demonta in timpul blocajului I/O. Carrier Thread-ul ramane blocat, distrugand scalabilitatea aplicatiei!\\n\\n3. Cauzele Thread Pinning in Java 21:\\n   - Utilizarea blocurilor sau metodelor synchronized in jurul unor operatii I/O blocante (monitoarele native din JVM mentin referinte pe stiva nativa C++).\\n   - Apeluri catre cod nativ prin JNI sau Foreign Function API.\\n\\n4. Solutie:\\n   - Inlocuirea blocurilor synchronized cu java.util.concurrent.locks.ReentrantLock, care permite demontarea normala a Virtual Threads.",
    codeSnippet: `// PROBLEMA: synchronized cauzeaza Thread Pinning daca face I/O blocant:
public synchronized String fetchRemoteData() {
    return restTemplate.getForObject(url, String.class); // Pinning pe Carrier!
}

// SOLUTIA sigura pentru Virtual Threads: ReentrantLock
private final ReentrantLock lock = new ReentrantLock();
public String fetchRemoteDataSafe() {
    lock.lock();
    try {
        return restTemplate.getForObject(url, String.class); // Virtual thread se demonteaza curat!
    } finally {
        lock.unlock();
    }
}`,
    interviewTrap: "Poti detecta Thread Pinning in productie folosind parametrul JVM: -Djdk.tracePinnedThreads=full, care emite un stack trace in consolala fiecare eveniment de pinning.",
    keyTakeaway: "Evita synchronized in jurul operatiilor I/O in Java 21; foloseste ReentrantLock pentru a permite demontarea Virtual Threads de pe Carrier."
  },
  {
    id: "java-63",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Scoped Values (Java 21) vs ThreadLocal",
    question: "Ce sunt Scoped Values (JEP 446) si de ce au fost introduse pentru a inlocui ThreadLocal in lumea milioanelor de Virtual Threads?",
    answer: "ThreadLocal are 3 probleme structurale majore in aplicatii moderne cu Virtual Threads:\\n1. Mutabilitate necontrolata: Orice cod din fir poate modifica valoarea din ThreadLocal oricand, facand fluxul de date impredictibil.\\n2. Mostenire costisitoare (InheritableThreadLocal): Copierea tuturor variabilelor locale de thread la crearea unui nou fir devine un dezastru de memorie cand aplicatia creeaza 1.000.000 de Virtual Threads!\\n3. Memory Leaks: Valorile din ThreadLocal raman agatate daca nu apelezi manual remove().\\n\\nCe aduc Scoped Values (ScopedValue<T>):\\n- Imutabilitate: Valoarea este legata (bound) strict pentru durata unui bloc de executie si nu poate fi alterata.\\n- Partajare fara copiere: Sub-task-urile pornite in interiorul aceluiasi scope partajeaza aceeasi instanta prin mostenire usoara, fara overhead de memorie.\\n- Curatare automata: Valoarea expira automat cand blocul de cod se termina.",
    codeSnippet: `// Definire ScopedValue:
private static final ScopedValue<UserContext> CURRENT_USER = ScopedValue.newInstance();

// Legare si executie protejata:
ScopedValue.runWhere(CURRENT_USER, new UserContext("admin"), () -> {
    processOrder(); // In interiorul metodei: CURRENT_USER.get() este disponibil
});
// Aici CURRENT_USER nu mai este disponibil si este curatat garantat!`,
    interviewTrap: "ScopedValue este imutabil: nu poti apela o metoda de tip set() pentru a reatribui valoarea in interiorul aceluiasi scope; poti doar crea un \"re-binding\" intr-un scope imbricat.",
    keyTakeaway: "Scoped Values ofera transmitere imutabila si usoara a contextului de securitate sau tranzactie peste milioane de Virtual Threads."
  },
  {
    id: "java-64",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Structured Concurrency in Java 21 (StructuredTaskScope)",
    question: "Ce este Structured Concurrency (JEP 453) si cum elimina problema task-urilor orfane (Thread Leaks) in Java 21?",
    answer: "In modelul concurent traditional (ne-structurat), daca pornesti doua operatii asincrone cu CompletableFuture sau ExecutorService:\\n- Daca task-ul A esueaza cu eroare, task-ul B continua sa ruleze in fundal, consumand resurse CPU si DB complet inutil (Thread Leak / Orphan Task).\\n- Daca firul principal este intrerupt, sub-firele nu stiu ca trebuie sa se opreasca.\\n\\nStructured Concurrency trateaza multiple task-uri concurente ca pe o singura unitate atomica de lucru:\\n- Relatie ierarhica parinte-copil: Daca blocul de cod parinte iese din scope, toti copiii sunt garantat finalizati sau anulati.\\n- Doua strategii de baza din StructuredTaskScope:\\n  1. ShutdownOnFailure: Asteapta ca TOATE sub-task-urile sa reuseasca. Daca UNUL SINGUR esueaza, anuleaza imediat toate celelalte sub-task-uri active si propaga exceptia!\\n  2. ShutdownOnSuccess: Returneaza rezultatul PRIMULUI sub-task finalizat cu succes si anuleaza instant restul (ideal pentru redundant queries).",
    codeSnippet: `// Exemplu ShutdownOnFailure in Java 21:
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
    Supplier<String> userTask = scope.fork(() -> fetchUserData(id));
    Supplier<Integer> balanceTask = scope.fork(() -> fetchBalance(id));

    scope.join();           // Asteapta ambele task-uri
    scope.throwIfFailed();  // Daca unul a crapat, anuleaza celalalt si arunca eroarea!

    return new AccountView(userTask.get(), balanceTask.get());
}`,
    interviewTrap: "In Structured Concurrency, este obligatoriu sa folosesti blocul try-with-resources pe StructuredTaskScope, pentru a forta asteptarea sau anularea tuturor sub-task-urilor inainte de parasirea metodei.",
    keyTakeaway: "Structured Concurrency leaga durata de viata a sub-task-urilor concurente de blocul de cod apelant, eliminand firele orfane."
  },
  {
    id: "java-65",
    category: "JAVA",
    difficulty: "USOR",
    title: "Future.get() vs CompletableFuture.join() vs thenApply()",
    question: "Care este diferenta dintre apelul blocant Future.get(), CompletableFuture.join() si procesarea non-blocanta prin thenApply()?",
    answer: "1. Future.get():\\n   - Blocant: suspenda firul curent pana cand rezultatul este disponibil.\\n   - Checked Exceptions: Arunca InterruptedException si ExecutionException, obligandu-te sa le prinzi sau sa le declari in semnatura metodei.\\n\\n2. CompletableFuture.join():\\n   - Blocant: asteapta de asemenea finalizarea rezultatului.\\n   - Unchecked Exceptions: Arunca CompletionException (exceptie ne-verificata la runtime), fiind mult mai usor de utilizat in expresii Lambda si Streams API.\\n\\n3. thenApply(Function<T, R>):\\n   - NON-BLOCANT: Inregistreaza o functie callback care se va executa automat cand rezultatul devine disponibil in viitor.\\n   - Firul apelant NU asteapta si este complet liber sa preia alte cereri; transforma rezultatul asincron fara sa iroseasca resurse.",
    codeSnippet: `CompletableFuture<String> cf = CompletableFuture.supplyAsync(() -> "hello");

// 1. Blocant checked:
try { String res1 = cf.get(); } catch (Exception e) {}

// 2. Blocant unchecked:
String res2 = cf.join();

// 3. Non-blocant asincron (Recomandat):
cf.thenApply(s -> s + " world")
  .thenAccept(System.out::println);`,
    interviewTrap: "Apelarea lui .get() sau .join() imediat dupa supplyAsync() anuleaza toate beneficiile programarii asincrone, transformand executia intr-una strict secventiala.",
    keyTakeaway: "get() si join() blocheaza firul; thenApply() proceseaza rezultatul asincron prin callback fara blocare."
  },
  {
    id: "java-66",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Compunerea Task-urilor Asincrone: thenCompose vs thenCombine",
    question: "Care este diferenta dintre thenCompose() si thenCombine() in CompletableFuture si cand se foloseste fiecare?",
    answer: "Ambele metode combina doua operatii asincrone, dar au structuri de dependenta complet diferite:\\n\\n1. thenCompose (Monadic FlatMap - Dependenta Secventiala):\\n   - Se foloseste cand al doilea task asincron depinde direct de rezultatul primului task.\\n   - Daca o functie returneaza un alt CompletableFuture, thenApply ar produce un tip imbricat CompletableFuture<CompletableFuture<User>>, in timp ce thenCompose aplatizeaza rezultatul intr-un singur CompletableFuture<User>.\\n\\n2. thenCombine (Zip / Pair - Independenta Paralela):\\n   - Se foloseste cand cele doua task-uri sunt COMPLET INDEPENDENTE si ruleaza in paralel pe fire diferite.\\n   - Primeste o functie BiFunction pentru a combina ambele rezultate odata ce ambele sunt gata (ex: obtine pretul unui produs si cursul valutar simultan, apoi calculeaza totalul).",
    codeSnippet: `// 1. thenCompose: Task 2 depinde de Task 1:
CompletableFuture<User> userCf = fetchUserIdAsync("mihai")
    .thenCompose(id -> fetchUserDetailsAsync(id)); // inputul vine din primul!

// 2. thenCombine: Task 1 si Task 2 ruleaza in paralel:
CompletableFuture<Double> priceCf = fetchPriceAsync("laptop");
CompletableFuture<Double> rateCf = fetchExchangeRateAsync("EUR");

CompletableFuture<Double> totalCf = priceCf.thenCombine(rateCf, (price, rate) -> price * rate);`,
    interviewTrap: "Daca folosesti thenApply in loc de thenCompose cand functia ta apeleaza un serviciu asincron extern, vei obtine un tip de cosmar CompletableFuture<CompletableFuture<T>>.",
    keyTakeaway: "thenCompose este FlatMap (pentru pasi secventiali dependenti); thenCombine uneste doua fluxuri paralele independente."
  },
  {
    id: "java-67",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Tratarea Erorilor in CompletableFuture: exceptionally vs handle vs whenComplete",
    question: "Cum gestionezi exceptiile intr-un lant asincron CompletableFuture folosind exceptionally(), handle() si whenComplete()?",
    answer: "1. exceptionally(Function<Throwable, T>):\\n   - Actioneaza ca un bloc \"catch\" functional.\\n   - Se activeaza DOAR daca a aparut o exceptie in lantul asincron.\\n   - Permite returnarea unei valori de rezerva (fallback) de acelasi tip T pentru ca fluxul sa poata continua normal.\\n\\n2. handle(BiFunction<T, Throwable, R>):\\n   - Se executa INTOTDEAUNA, indiferent daca executia a reusit sau a aruncat eroare.\\n   - Primeste atat rezultatul cat si exceptia (dintre care exact una va fi null).\\n   - Permite atat transformarea rezultatului cat si recuperarea din erori, putand returna alt tip de date R.\\n\\n3. whenComplete(BiConsumer<T, Throwable>):\\n   - Actioneaza ca un bloc \"finally\".\\n   - Nu poate modifica rezultatul sau tipul; este folosit pentru efecte secundare (side-effects precum logging, metrici sau eliberare de resurse).",
    codeSnippet: `CompletableFuture.supplyAsync(() -> externalServiceCall())
    .handle((result, ex) -> {
        if (ex != null) {
            log.error("Eroare la apel extern", ex);
            return "VALOARE_DEFAULT_FALLBACK";
        }
        return result.toUpperCase();
    })
    .whenComplete((finalResult, ex) -> log.info("Finalizat cu: " + finalResult));`,
    interviewTrap: "In exceptionally(ex -> ...), parametrul ex este adesea o instanta de CompletionException. Pentru a obtine exceptia de baza din aplicatie, trebuie sa apelezi ex.getCause().",
    keyTakeaway: "exceptionally pentru fallback la eroare; handle pentru transformare cu tratare completa; whenComplete pentru logging tip finally."
  },
  {
    id: "java-68",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Exchanger si Phaser in java.util.concurrent",
    question: "Ce rol au clasele de sincronizare Exchanger si Phaser in scenarii avansate de procesare concurenta?",
    answer: "1. Exchanger<V>:\\n   - Permite ca exact DOUA thread-uri sa faca schimb atomic de obiecte la un punct de intalnire comun.\\n   - Cand un thread apeleaza exchange(bufferA), el se blocheaza pana cand al doilea thread apeleaza exchange(bufferB). In acel moment, JVM schimba referintele: primul fir primeste bufferB, iar al doilea primeste bufferA!\\n   - Ideal pentru modelul Producer-Consumer cu double-buffering (unul umple un buffer, altul il goleste, apoi fac schimb instantaneu fara alocare de memorie).\\n\\n2. Phaser (Evolutia lui CyclicBarrier si CountDownLatch):\\n   - Sincronizeaza executia thread-urilor pe FAZE succesive (faza 0, faza 1, faza 2...).\\n   - Inovatie majora fata de CyclicBarrier: Numarul de participanti este DINAMIC! Thread-urile se pot inregistra (register()) sau deregistra (arriveAndDeregister()) in timpul rularii.\\n   - Suporta actiuni automate la finalul fiecarei faze prin suprascrierea onAdvance().",
    codeSnippet: `// Exemplu Exchanger:
Exchanger<ByteBuffer> exchanger = new Exchanger<>();
// Thread Producer:
buffer = exchanger.exchange(fullBuffer); // Da bufferul plin, primeste un buffer gol!

// Exemplu Phaser:
Phaser phaser = new Phaser(1); // Inregistreaza thread-ul parinte
phaser.register();            // Inregistreaza dinamic un worker nou
phaser.arriveAndAwaitAdvance(); // Asteapta finalizarea fazei curente`,
    interviewTrap: "CyclicBarrier are un numar fix de partide specificat in constructor; daca numarul de participanti se schimba la runtime, Phaser este singura optiune corecta.",
    keyTakeaway: "Exchanger realizeaza schimb bidirectional atomic de date intre 2 fire; Phaser sincronizeaza generatii dinamice de thread-uri pe faze."
  },
  {
    id: "java-69",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Deadlock vs Livelock vs Starvation",
    question: "Care este diferenta comportamentala si vizuala intre un Deadlock, un Livelock si o situatie de Starvation?",
    answer: "1. Deadlock (Blocare Permanenta):\\n   - Doua sau mai multe thread-uri sunt blocate pentru totdeauna, fiecare asteptand o resursa detinuta de celalalt (imbratisarea mortala).\\n   - Utilizare CPU: Scade la 0% pentru firele implicate (stare BLOCKED sau WAITING).\\n\\n2. Livelock (Miscare fara progres):\\n   - Thread-urile NU sunt blocate fizic; ele isi schimba continuu starea interna ca raspuns reciproc la actiunile celuilalt, dar niciunul nu face niciun progres util.\\n   - Analogie: Doi oameni politicosi pe un hol ingust care fac simultan pasul in aceeasi directie pentru a se evita, blocandu-se la infinit.\\n   - Utilizare CPU: URIASA (100% CPU spinning) desi aplicatia nu progreseaza deloc!\\n\\n3. Starvation (Infometare):\\n   - Un thread este complet sanatos si gata de executie, dar nu primeste NICIODATA acces la CPU sau resursa dorita deoarece alte thread-uri cu prioritate mai mare ii iau mereu fata.\\n   - Solutie: Folosirea de lock-uri cu echitate (Fair Locks: new ReentrantLock(true)).",
    codeSnippet: `// Exemplu Livelock: firele cedeaza continuu lock-ul reciproc fara sa termine:
while (resource.isOwnedByOther()) {
    releaseMyLock();
    sleep(1); // Daca sleep-ul este identic, reincearca simultan!
    tryAcquireLock();
}`,
    interviewTrap: "Livelock-ul este mult mai greu de detectat decat Deadlock-ul de uneltele clasice (jstack/ThreadMXBean), deoarece firele par active si consuma CPU.",
    keyTakeaway: "Deadlock = fire blocate dormind la 0% CPU; Livelock = fire hiperactive blocand sistemul la 100% CPU; Starvation = fir ignorat de prioritati."
  },
  {
    id: "java-70",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Cum detectezi un Deadlock in Productie: jstack si ThreadMXBean",
    question: "Cum identifici rapid un Deadlock intr-o aplicatie Java aflata in productie folosind linia de comanda sau programatic din cod?",
    answer: "1. Metoda din Linia de Comanda (jstack / jcmd):\\n   - Pas 1: Gaseste PID-ul procesului cu jps sau ps -ef | grep java.\\n   - Pas 2: Ruleaza: jcmd <PID> Thread.print sau jstack -l <PID>.\\n   - JVM ruleaza automat un algoritm de detectare a ciclurilor de lock-uri si va afisa la sfarsitul raportului sectiunea explicita:\\n     \"Found 1 deadlock.\" urmata de identificatorii thread-urilor si liniile exacte de cod unde se asteapta reciproc!\\n\\n2. Metoda Programatica (Monitorizare & Alerte automate):\\n   - Java ofera MBean-ul ThreadMXBean din java.lang.management:\\n   - Apeleaza: long[] deadlockedThreads = ManagementFactory.getThreadMXBean().findDeadlockedThreads();\\n   - Daca array-ul nu este null, aplicatia poate declansa automat o alerta in PagerDuty sau un restart controlat.",
    codeSnippet: `// Detectie automata programatica din cod:
ThreadMXBean threadBean = ManagementFactory.getThreadMXBean();
long[] threadIds = threadBean.findDeadlockedThreads();
if (threadIds != null) {
    ThreadInfo[] infos = threadBean.getThreadInfo(threadIds);
    for (ThreadInfo info : infos) {
        log.error("Deadlock detectat pe firul: " + info.getThreadName() 
                  + " blocat pe lock-ul: " + info.getLockName());
    }
}`,
    interviewTrap: "findDeadlockedThreads() detecteaza atat monitoare synchronized cat si ReentrantLocks (OwnableSyncs), in timp ce vechea metoda findMonitorDeadlockedThreads() vedea doar synchronized.",
    keyTakeaway: "jstack si ThreadMXBean identifica instant ciclurile de Deadlock aratand liniile de cod si lock-urile concurente."
  },
  {
    id: "java-71",
    category: "JAVA",
    difficulty: "USOR",
    title: "Ce face metoda Thread.yield() si de ce este o simpla sugestie?",
    question: "Ce efect are apelul Thread.yield() si de ce sistemele de productie nu trebuie sa se bazeze pe el pentru sincronizare?",
    answer: "1. Ce face Thread.yield():\\n   - Semnalizeaza planificatorului de fire (OS Thread Scheduler) ca firul curent este dispus sa renunte voluntar la cuanta sa ramasa de timp CPU, permitand altor fire de aceeasi prioritate sa ruleze.\\n\\n2. De ce este o SIMPLA SUGESTIE (Hint):\\n   - Specificatia JVM nu ofera nicio garantie ca scheduler-ul va tine cont de acest apel!\\n   - Sistemul de operare poate ignora complet apelul si poate reprograma imediat acelasi fir sa ruleze.\\n   - Comportamentul variaza radical de la o platforma la alta (pe Linux/Solaris se comporta diferit fata de Windows sau macOS).\\n\\n3. Concluzie de interviu:\\n   - yield() este conceput aproape exclusiv pentru optimizari de profiling sau teste concurente speciale. Nu folosi NICIODATA yield() pentru controlul fluxului de date in aplicatii de afaceri.",
    codeSnippet: `// Utilizare corecta: doar in spin-locks speciale sau teste:
while (!ready) {
    Thread.yield(); // Ofera altor fire o sansa sa seteze ready = true
}`,
    interviewTrap: "Thread.yield() NU trece firul in starea BLOCKED sau WAITING! Firul ramane in starea RUNNABLE si poate fi reales de CPU in urmatoarea milisecunda.",
    keyTakeaway: "Thread.yield() este o sugestie neobligatorie catre scheduler-ul OS si nu ofera nicio garantie de pauza sau sincronizare."
  },
  {
    id: "java-72",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce Thread.stop() este interzis si cum folosim Thread.interrupt()",
    question: "De ce metoda Thread.stop() a fost declarata Deprecated si care este mecanismul cooperativ corect de oprire prin interrupt()?",
    answer: "1. De ce Thread.stop() este DEPRECIATED si periculos:\\n   - Oprea firul instantaneu \"la rece\", indiferent de instructiunea curenta.\\n   - Elibera automat toate lock-urile intrinsic (monitoarele) detinute de fir.\\n   - Daca firul se afla la jumatatea actualizarii unui cont bancar (a scazut din Cont A dar nu a adaugat in Cont B), datele ramaneau intr-o stare corupta permanenta!\\n\\n2. Modelul Cooperativ prin Thread.interrupt():\\n   - Un fir nu poate fi oprit fortat din exterior; el este rugat politicos sa se opreasca setandu-i-se un fanion (flag) de intrerupere.\\n   - Daca firul este blocat intr-o metoda blocanta (sleep, wait, join), metoda va arunca imediat o exceptie InterruptedException.\\n   - Daca firul ruleaza o bucla de calcul intens, el trebuie sa verifice periodic: Thread.currentThread().isInterrupted() si sa iasa curat din bucla.",
    codeSnippet: `public void run() {
    while (!Thread.currentThread().isInterrupted()) {
        try {
            doWork();
            Thread.sleep(1000);
        } catch (InterruptedException e) {
            // Regula critica: sleep() curata flag-ul de intrerupere!
            // Trebuie sa re-intrerupem firul pentru ca apelantii superiori sa stie:
            Thread.currentThread().interrupt();
            break; // Iesire curata
        }
    }
    cleanUpResources(); // Eliberare sigura
}`,
    interviewTrap: "Daca prinzi InterruptedException si lasi blocul catch gol fara a apela Thread.currentThread().interrupt() sau a arunca eroarea mai departe, \"inghiti\" intreruperea si firul nu se va mai opri niciodata.",
    keyTakeaway: "Oprirea firelor in Java este cooperativa; trateaza InterruptedException si re-declanseaza flag-ul prin Thread.currentThread().interrupt()."
  },
  {
    id: "java-73",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce wait() si notify() sunt in clasa Object si nu in Thread?",
    question: "De ce metodele fundamentale de asteptare wait(), notify() si notifyAll() sunt declarate in clasa Object si nu in Thread?",
    answer: "Aceasta este o intrebare clasica de interviu Java, iar explicatia tine de designul orientat pe obiect si monitoare:\\n\\n1. Lock-urile apartin OBIECTELOR, nu firelor:\\n   - In Java, fiecare obiect de pe Heap are un monitor intrinsic (un lock si o coada de asteptare asociata - Wait Set).\\n   - Cand un fir apeleaza wait(), el nu se suspenda pe el insusi in mod abstract, ci \"elibereaza lock-ul obiectului specific pe care a sincronizat si intra in Wait Set-ul acelui obiect\".\\n\\n2. Decuplare si Flexibilitate:\\n   - Daca wait() era pe clasa Thread, cum ar fi putut un fir sa stie pe care resursa partajata (cont bancar, coada de mesaje) asteapta?\\n   - Plasarea pe Object permite oricarui obiect Java sa actioneze ca o conditie de sincronizare intre multiple fire independente.",
    codeSnippet: `// Sincronizare pe obiectul partajat:
synchronized (queue) {
    while (queue.isEmpty()) {
        queue.wait(); // Elibereaza lock-ul pe 'queue' si asteapta
    }
    return queue.poll();
}`,
    interviewTrap: "Daca apelezi wait() sau notify() pe un obiect fara sa te afli intr-un bloc synchronized pe ACELASI obiect, JVM va arunca la runtime: IllegalMonitorStateException.",
    keyTakeaway: "wait() si notify() opereaza pe monitorul si coada de asteptare a obiectului respectiv, de aceea sunt definite in Object."
  },
  {
    id: "java-74",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Spurious Wakeups si De ce wait() se apeleaza intotdeauna in bucla while",
    question: "Ce este un Spurious Wakeup (Trezire falsa) si de ce este o eroare grava sa apelezi wait() intr-o instructiune if in loc de while?",
    answer: "1. Ce este un Spurious Wakeup:\\n   - La nivel de kernel si sistem de operare (POSIX threads), un fir aflat in asteptare se poate trezi din motive interne de performanta sau semnale hardware chiar daca NIMENI nu a apelat notify() sau conditia nu a fost indeplinita!\\n\\n2. Ce se intampla daca folosesti IF:\\n   - Daca firul foloseste if (conditionNotMet) wait();:\\n   - Cand firul se trezeste (fie dintr-o trezire falsa, fie pentru ca alt fir trezit inaintea lui a consumat deja resursa din coada), firul iese din if si continua executia crezand ca datele sunt gata, provocand un crash (ex: NoSuchElementException pe coada goala)!\\n\\n3. Solutia OBLIGATORIE: bucla WHILE:\\n   - In bucla while (conditionNotMet) wait();:\\n   - Cand firul se trezeste, conditia este re-evaluata garantat. Daca resursa nu este disponibila, firul se intoarce imediat in starea de somn prin wait().",
    codeSnippet: `// CORECT: bucla while re-verifica conditia la trezire
synchronized (lock) {
    while (!ready) {
        lock.wait(); // Sigur impotriva Spurious Wakeups si race conditions!
    }
    processData();
}

// GRESIT: bloc if vulnerabil
// if (!ready) lock.wait(); processData(); // CRASH daca trezirea e falsa!`,
    interviewTrap: "Chiar si in lipsa trezirilor false, daca folosesti notifyAll(), 10 fire se vor trezi simultan, dar doar primul gaseste elementul; celelalte 9 trebuie sa gaseasca conditia din while si sa adoarma la loc.",
    keyTakeaway: "Verifica intotdeauna conditia de asteptare intr-o bucla while pentru a fi imun la Spurious Wakeups si competitie concurenta."
  },
  {
    id: "java-75",
    category: "JAVA",
    difficulty: "USOR",
    title: "Ce este un Daemon Thread si ce se intampla la terminarea aplicatiei?",
    question: "Ce este un Daemon Thread in Java, cum se configureaza si ce se intampla cu el cand toate firele non-daemon si-au incheiat executia?",
    answer: "1. Ce este un Daemon Thread:\\n   - Un fir de executie de fundal (serviciu suport) care nu impiedica JVM-ul sa se opreasca.\\n   - Exemple clasice din JVM: Garbage Collector-ul, finalizer threads, firele interne de semnale.\\n\\n2. Comportamentul la Terminarea JVM:\\n   - JVM isi continua executia atata timp cat exista CEL PUTIN UN fir non-daemon (User Thread, cum e firul main) in viata.\\n   - In momentul in care ultimul fir non-daemon s-a incheiat, JVM-ul se opreste IMEDIAT, omorand instantaneu toate firele Daemon ramase active!\\n\\n3. Consecinte Critice:\\n   - Blocurile finally dintr-un thread daemon NU se mai executa la oprirea JVM!\\n   - Nu folosi niciodata daemon threads pentru operatii I/O critice (scriere in baze de date sau tranzactii pe disc) deoarece datele vor ramane incomplete la shutdown.",
    codeSnippet: `Thread daemonThread = new Thread(() -> {
    while (true) {
        System.out.println("Monitoring in background...");
        Thread.sleep(1000);
    }
});

daemonThread.setDaemon(true); // OBLIGATORIU inainte de start()!
daemonThread.start();`,
    interviewTrap: "Apelul setDaemon(true) trebuie facut strict INAINTE de apelarea metodei start(). Daca apelezi setDaemon pe un fir deja pornit, JVM va arunca IllegalThreadStateException.",
    keyTakeaway: "Daemon threads sunt pentru servicii secundare de fundal; JVM se opreste imediat ce toate firele non-daemon au terminat."
  },
  {
    id: "java-76",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Structura Generationala a Heap-ului: Eden, Survivor si Tenured",
    question: "Cum este impartit Heap-ul in generatii in JVM si de ce ipoteza Weak Generational Hypothesis dicteaza aceasta arhitectura?",
    answer: "1. Weak Generational Hypothesis (Ipoteza Generationala Slaba):\\n   - Statistic, peste 90-95% din obiectele create intr-o aplicatie Java mor la foarte scurt timp dupa instantiere (variabile locale de metoda, stream-uri, DTO-uri temporare).\\n   - Daca un obiect supravietuieste mai multor cicluri de colectare, cel mai probabil va trai pentru mult timp (cache, servicii singleton, configuratii).\\n\\n2. Compartimentarea Heap-ului:\\n   - Young Generation (Generatia Tanara):\\n     - Eden Space: Unde se aloca initial aproape toate obiectele noi.\\n     - Doua Survivor Spaces (S0 si S1 / From si To): Zone tranzitorii egale ca marime. La fiecare Minor GC, obiectele vii din Eden si S0 sunt copiate compact in S1, iar S0 este golit complet.\\n   - Old Generation (Tenured - Generatia Veche):\\n     - Daca un obiect supravietuieste unui numar de cicluri de colectare (prag numit Tenuring Threshold, de regula 15), este promovat in Old Generation.\\n     - Gazduieste obiecte longevive si este curatat mult mai rar (Major / Full GC).",
    codeSnippet: `// Monitorizare generatii cu jstat din terminal:
// jstat -gcutil <PID> 1000
// Afiseaza S0, S1, E (Eden), O (Old), M (Metaspace) la fiecare secunda.`,
    interviewTrap: "Daca Eden-ul este dimensionat prea mic, obiectele de scurta durata sunt promovate prematur in Old Generation (Premature Promotion), provocand Full GC-uri dese si pauze lungi.",
    keyTakeaway: "Heap-ul este separat in Young (Eden, S0, S1) si Old Generation deoarece marea majoritate a obiectelor mor rapid."
  },
  {
    id: "java-77",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Ce este TLAB (Thread-Local Allocation Buffer) in JVM?",
    question: "Cum asigura TLAB alocarea obiectelor in Heap la viteza comparabila cu alocarea pe stiva fara conflicte de sincronizare?",
    answer: "1. Problema Alocarii Concurente pe Heap:\\n   - Heap-ul este partajat intre toate thread-urile. Fara un mecanism dedicat, fiecare new Object() ar necesita sincronizare globala (lock sau CAS atomic pe pointerul de memorie din Eden), creand un blocaj urias in aplicatii cu zeci de fire.\\n\\n2. Solutia: TLAB (Thread-Local Allocation Buffer):\\n   - La pornire, JVM aloca fiecarui thread o bucatica exclusiva de memorie din spatiul Eden (ex: 256 KB sau 1 MB).\\n   - Cand firul executa new MyObject(), el aloca obiectul direct in propriul sau TLAB prin simpla incrementare a unui pointer local (Bump-the-Pointer).\\n   - Aceasta operatie dureaza doar 2-3 instructiuni CPU si se executa cu ZERO sincronizare si zero lock-uri!\\n\\n3. Ce se intampla cand TLAB se umple:\\n   - Firul cere un nou bloc TLAB din Eden (operatie cu sincronizare rapida), sau daca obiectul este urias (Humongous), il aloca direct pe Heap-ul general.",
    codeSnippet: `// Activare/verificare TLAB (activat implicit in JVM):
// -XX:+UseTLAB
// -XX:TLABSize=512k`,
    interviewTrap: "TLAB este doar un mecanism de ALOCARE. Obiectul creat in TLAB ramane fizic pe Heap si este accesibil de alte thread-uri daca referinta este partajata.",
    keyTakeaway: "TLAB aloca obiecte in Eden prin bump-the-pointer fara nicio sincronizare intre fire, facand instantierea extrem de rapida."
  },
  {
    id: "java-78",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Escape Analysis si Scalar Replacement: Alocarea pe Stiva",
    question: "Cum permite Escape Analysis compilatorului JIT sa elimine alocarea pe Heap si sa descompuna obiectele pe Stiva (Scalar Replacement)?",
    answer: "1. Escape Analysis (Analiza de Scapare):\\n   - In timpul compilarii C2 JIT, masina virtuala analizeaza daca referinta unui obiect nou creat scapa din metoda curenta (ex: este returnata, transmisa ca parametru altui thread, sau salvata intr-un camp static).\\n   - Daca referinta NU scapa (NoEscape): Obiectul este utilizat strict local in interiorul metodei si devine inaccesibil la finalul executiei acesteia.\\n\\n2. Optimizari Majore aplicate pe obiecte care nu scapa:\\n   - Scalar Replacement: In loc sa creeze obiectul pe Heap cu header de obiect (12-16 bytes), JVM descompune obiectul in campurile sale scalare primitive (int, long) si le stocheaza direct in registrele CPU sau pe STIVA metodei!\\n   - Lock Elision: Daca pe un obiect local exista un bloc synchronized, lock-ul este eliminat complet deoarece niciun alt fir nu poate ajunge la el.\\n   - Rezultat: Zero presiune pe Garbage Collector; memoria se elibereaza instantaneu la intoarcerea din metoda prin scoaterea cadrului de stiva (Stack Frame pop).",
    codeSnippet: `public void processCoordinates() {
    // Obiectul Point nu scapa din metoda:
    Point p = new Point(10, 20); 
    int sum = p.x + p.y;
    // JIT optimizeaza prin Scalar Replacement:
    // int p_x = 10; int p_y = 20; int sum = p_x + p_y;
    // Zero obiecte alocate pe Heap!
}`,
    interviewTrap: "Escape Analysis functioneaza doar dupa ce codul devine \"fierbinte\" (Hotspot) si este compilat de C2 JIT (dupa mii de executii). La inceput, in faza de interpretare, obiectul se aloca pe Heap.",
    keyTakeaway: "Escape Analysis transforma obiectele locale care nu scapa din metoda in variabile scalare pe stiva, eliminand alocarea pe Heap."
  },
  {
    id: "java-79",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Metaspace vs PermGen (Java 8): Tuning si OOM",
    question: "De ce a fost eliminat PermGen in Java 8 si cum functioneaza Metaspace in memoria nativa a sistemului?",
    answer: "1. Problemele vechiului PermGen (Permanent Generation in Java 7 si anterior):\\n   - PermGen facea parte din spatiul de Heap configurat cu dimensiune fixa (-XX:MaxPermSize=256m).\\n   - Stoca metadatele claselor, metodele, String Constant Pool-ul si clasele statice.\\n   - In aplicatii cu multe biblioteci (Spring, Hibernate, cglib, Tomcat), generarea dinamica de bytecode umplea rapid PermGen-ul, generand faimoasa eroare java.lang.OutOfMemoryError: PermGen space.\\n\\n2. Ce aduce Metaspace in Java 8+:\\n   - Metadatele claselor au fost mutate in Memoria NATIVA a sistemului de operare (Off-Heap).\\n   - Implicit, Metaspace se extinde dinamic pana la limita memoriei fizice a serverului.\\n   - String Pool-ul a fost mutat in Heap-ul obisnuit, beneficiind de Garbage Collection normal.\\n\\n3. Bune Practici de Tuning in Productie:\\n   - Seteaza intotdeauna o limita maxima: -XX:MaxMetaspaceSize=512m pentru a preveni situatia in care un memory leak de ClassLoaders consuma toata memoria RAM a masinii gazda!",
    codeSnippet: `// Parametri recomandati Metaspace:
// -XX:MetaspaceSize=128m
// -XX:MaxMetaspaceSize=512m`,
    interviewTrap: "Daca nu setezi -XX:MaxMetaspaceSize intr-un container Docker, Metaspace poate creste necontrolat pana cand Linux OOM Killer omoara brusc intregul container.",
    keyTakeaway: "Metaspace foloseste memoria nativa a sistemului pentru metadatele claselor, eliminand limitarile rigide ale fostului PermGen."
  },
  {
    id: "java-80",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Card Table si Remembered Sets (RSet) in Garbage Collector",
    question: "Cum evita Garbage Collector-ul scanarea intregii generatii vechi (Old Gen) in timpul unui Minor GC folosind Card Table si Remembered Sets?",
    answer: "1. Problema Referintelor Inter-Generatii:\\n   - La un Minor GC, colectorul vrea sa curete doar Young Generation.\\n   - Dar ce se intampla daca un obiect din Old Generation detine o referinta catre un obiect din Young Generation? Fara un mecanism special, GC ar trebui sa scaneze TOATA memoria Old Gen pentru a verifica daca obiectul din Young e viu, distrugand viteza de colectare!\\n\\n2. Solutia: Card Table si Write Barriers:\\n   - JVM imparte Old Generation intr-un array de blocuri de memorie de 512 octeti numite \"Cards\".\\n   - JVM mentine un Card Table (un octet per card).\\n   - Cand codul scrie o referinta noua (objOld.child = objYoung), compilatorul JIT injecteaza un \"Write Barrier\" (un mic fragment de cod) care marcheaza cardul respectiv din Card Table ca fiind \"murdar\" (Dirty Card).\\n\\n3. Eficienta:\\n   - La Minor GC, colectorul scaneaza doar Card-urile marcate ca Dirty (o fractiune minuscula din Old Gen), ignorand restul de 99% din Old Generation!",
    codeSnippet: `// Concept Write Barrier injectat automat de JIT la fiecare atribuire de referinta:
void post_write_barrier(oop* field, oop new_val) {
    size_t card_index = ((size_t)field) >> 9; // impartire la 512
    byte_map_base[card_index] = DIRTY_BYTE;
}`,
    interviewTrap: "In G1 GC, fiecare regiune are propriul sau Remembered Set (RSet) bazat pe Card Table, asigurand ca regiunile pot fi colectate complet independent.",
    keyTakeaway: "Card Table si Write Barriers inregistreaza referintele din Old catre Young, permitand curatarea Young Gen fara scanarea Old Gen."
  },
  {
    id: "java-81",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "G1 GC Internals: Regiuni, SATB si Humongous Objects",
    question: "Cum organizeaza G1 GC memoria in regiuni, cum previne pierderea referintelor prin SATB si ce este un Humongous Object?",
    answer: "1. Structura bazata pe Regiuni:\\n   - In loc sa aiba spatii contigue fixe (Young/Old), G1 imparte intregul Heap in 2048 de regiuni de dimensiuni egale (de la 1 MB la 32 MB).\\n   - Fiecare regiune poate actiona dinamic ca Eden, Survivor sau Old.\\n   - Colecteaza cu prioritate regiunile cu cel mai mare volum de gunoi (Garbage-First) pentru a respecta tinta de pauza specificata (-XX:MaxGCPauseMillis=200).\\n\\n2. Algoritmul SATB (Snapshot-At-The-Beginning):\\n   - Permite marcarea concurenta a obiectelor in timp ce aplicatia continua sa ruleze.\\n   - Realizeaza un instantaneu logic al grafului de obiecte la inceputul fazei.\\n   - Daca un fir muta o referinta in timpul marcarii, un Write Barrier captureaza referinta veche si o marcheaza oricum, prevenind stergerea accidentala a obiectelor vii.\\n\\n3. Ce este un Humongous Object:\\n   - Orice obiect a carui marime depaseste 50% din dimensiunea unei regiuni (ex: un array de bytes de 2 MB cand regiunea e de 2 MB).\\n   - Se aloca intr-o secventa contigua de regiuni speciale Humongous direct in Old Gen, provocand fragmentare daca sunt create des.",
    codeSnippet: `// Configurare G1 GC:
// -XX:+UseG1GC
// -XX:MaxGCPauseMillis=200
// -XX:G1HeapRegionSize=16m`,
    interviewTrap: "Alocarea frecventa de Humongous Objects (ex: citirea fisierelor mari complet in memorie in loc de streaming) declanseaza colectari premature si degradeaza performanta G1.",
    keyTakeaway: "G1 imparte memoria in regiuni mici si colecteaza zonele cu cel mai mult gunoi respectand un buget strict de timp de pauza."
  },
  {
    id: "java-82",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "ZGC (Z Garbage Collector): Colored Pointers si Load Barriers",
    question: "Cum reuseste ZGC sa mentina pauze de Garbage Collection sub 1 milisecunda chiar si pe Heap-uri de zeci de Terabytes?",
    answer: "ZGC este un colector de gunoi de latenta ultra-redusa (Scalable Low Latency Garbage Collector) care realizeaza aproape TOATE fazele (marcare, relocare, compactare) in mod concurent cu firele aplicatiei:\\n\\n1. Colored Pointers (Pointeri Colorati):\\n   - Pe arhitecturi de 64-bit, un pointer de referinta foloseste doar 44 sau 48 de biti pentru adresa fizica.\\n   - ZGC foloseste bitii superiori ramasi (4 biti de metadate) direct in pointer:\\n     - Marked0 / Marked1: Pentru urmarirea starii de viata a obiectului.\\n     - Remapped: Arata daca obiectul a fost mutat intr-o alta locatie de memorie compactata.\\n\\n2. Load Barriers (Bariere de Incarcare):\\n   - Cand aplicatia citeste o referinta dintr-un camp (obj.field), compilatorul JIT injecteaza o verificare de doar 1-2 instructiuni pe bitul Remapped.\\n   - Daca obiectul a fost mutat la compactare dar pointerul nu a fost inca actualizat, Load Barrier-ul corecteaza instantaneu adresa (Self-Healing) si scrie noua adresa inapoi in camp!\\n   - Niciun fir nu este oprit pentru compactare.",
    codeSnippet: `// Activare ZGC (Generational ZGC disponibil nativ in Java 21):
// -XX:+UseZGC -XX:+ZGenerational
// Ofera pauze medii sub 0.5 milisecunde pe Heap-uri de la 16 MB la 16 TB!`,
    interviewTrap: "ZGC are un consum usor mai mare de CPU (+2-3%) din cauza Load Barriers comparativ cu Parallel GC, dar elimina complet inghetarile de sistem (STW pauses).",
    keyTakeaway: "ZGC foloseste bitii din pointeri si Load Barriers pentru a reloca si compacta memoria concurent fara a opri aplicatia."
  },
  {
    id: "java-83",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Shenandoah GC vs ZGC",
    question: "Cum realizeaza Shenandoah GC compactarea concurenta si prin ce difera abordarea sa fata de ZGC?",
    answer: "Shenandoah este un alt colector de latenta ultra-redusa dezvoltat initial de Red Hat si inclus in OpenJDK:\\n\\n1. Cum compacteaza Shenandoah concurent:\\n   - Asemenea lui ZGC, muta obiectele dintr-o regiune in alta in timp ce aplicatia ruleaza activ.\\n   - Utilizeaza un Forwarding Pointer (in versiunile noi integrat direct in Mark Word-ul header-ului obiectului).\\n   - Cand un obiect este copiat intr-o noua regiune de memorie, vechiul obiect retine un pointer catre noua sa copie.\\n\\n2. Diferenta esentiala intre Shenandoah si ZGC:\\n   - ZGC intercepteaza referintele la citire prin Colored Pointers si Load Barriers.\\n   - Shenandoah utilizeaza Load-Reference Barriers dar se bazeaza pe modificari in header-ul obiectului, nu pe bitii speciali ai pointerului de 64-bit.\\n   - ZGC este integrat nativ in nucleul OpenJDK (Oracle) si a primit suport generational in Java 21; Shenandoah este sustinut puternic de Red Hat/AWS.",
    codeSnippet: `// Activare Shenandoah GC:
// -XX:+UseShenandoahGC
// -XX:ShenandoahGCMode=iu (sau generational in versiuni experimentale)`,
    interviewTrap: "Atat ZGC cat si Shenandoah sunt optimizate pentru latenta mica (pauze < 1ms), nu pentru throughput brut. Daca ai un job batch de noapte care proceseaza date masive fara clienti online, Parallel GC este mai rapid.",
    keyTakeaway: "Shenandoah compacteaza concurent prin Forwarding Pointers in obiect, oferind o alternativa non-STW robusta."
  },
  {
    id: "java-84",
    category: "JAVA",
    difficulty: "USOR",
    title: "Minor GC vs Major GC vs Full GC",
    question: "Care este diferenta dintre un Minor GC, un Major GC si un Full GC in comportamentul unei aplicatii Java?",
    answer: "1. Minor GC (Young GC):\\n   - Se declanseaza atunci cand spatiul Eden se umple cu obiecte noi.\\n   - Colecteaza EXCLUSIV generatia tanara (Eden, Survivor spaces).\\n   - Este foarte frecvent, dureaza extrem de putin (cateva milisecunde) si este in general insesizabil.\\n\\n2. Major GC:\\n   - Colecteaza Old Generation (Tenured space).\\n   - Dureaza semnificativ mai mult decat un Minor GC, deoarece Old Generation este mult mai mare si contine mai multe obiecte.\\n\\n3. Full GC:\\n   - Colecteaza INTREGUL HEAP (atat Young Generation cat si Old Generation) si adesea include si Metaspace-ul!\\n   - Opreste toate firele de executie ale aplicatiei (Stop-The-World) pe o durata ce poate varia de la sute de milisecunde la zeci de secunde!\\n   - Un Full GC frecvent in productie este un semnal clar de degradare grava a memoriei sau Memory Leak.",
    codeSnippet: `// Comanda de diagnoza loguri GC in Java 17+:
// -Xlog:gc*,gc+phases=debug:file=gc.log:time,uptime,pid:filecount=5,filesize=50m`,
    interviewTrap: "Apelul manual System.gc() forteaza un Full GC complet Stop-The-World. De aceea se recomanda parametrul -XX:+DisableExplicitGC in productie.",
    keyTakeaway: "Minor GC curata doar Young Gen; Major GC curata Old Gen; Full GC curata tot Heap-ul si Metaspace cauzand pauze lungi STW."
  },
  {
    id: "java-85",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "OutOfMemoryError: GC overhead limit exceeded",
    question: "Ce conditii specifice declanseaza eroarea \"OutOfMemoryError: GC overhead limit exceeded\" si cum o diferentiezi de o simpla lipsa de spatiu pe Heap?",
    answer: "Aceasta eroare este o masura de siguranta a masinii virtuale pentru a preveni situatia in care aplicatia \"ingheata\" ruland 100% din timp doar Garbage Collector-ul fara a progresa deloc:\\n\\nConditiile exacte de declansare a erorii:\\n1. JVM-ul a petrecut peste 98% din timpul total de executie ruland Garbage Collection;\\n2. Si in urma acestei colectari masive a reusit sa elibereze MAI PUTIN DE 2% din spatiul Heap-ului!\\n3. Aceasta conditie s-a repetat pe parcursul a 5 cicluri consecutive de colectare.\\n\\nCauza de baza:\\n- Heap-ul este aproape 100% plin cu obiecte care au referinte vii (nu pot fi colectate). Aplicatia este la limita sufocarii.\\n- In loc sa lase aplicatia sa mearga la 0.1% viteza consumand 100% CPU in bucle de GC, JVM arunca aceasta exceptie fatala pentru a permite repornirea procesului.",
    codeSnippet: `// Dezactivare temporara pentru debug (nerecomandat in prod):
// -XX:-UseGCOverheadLimit`,
    interviewTrap: "Simpla crestere a parametrului -Xmx poate doar amana aparitia erorii cu cateva ore daca aplicatia are un Memory Leak real (ex: o colectie statica care acumuleaza continuu obiecte).",
    keyTakeaway: "GC overhead limit exceeded apare cand GC consuma >98% din CPU si elibereaza <2% din Heap; semnaleaza un Heap sufocat de date vii."
  },
  {
    id: "java-86",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "OutOfMemoryError: Unable to create new native thread",
    question: "Ce cauzeaza eroarea \"OutOfMemoryError: Unable to create new native thread\" si ce setari de OS si JVM trebuie verificate?",
    answer: "Aceasta eroare NU este cauzata de umplerea Heap-ului, ci de incapacitatea sistemului de operare de a mai aloca un fir nativ de executie pentru procesul Java:\\n\\n3 Cauze Principale:\\n1. Limita de procese/thread-uri a utilizatorului Linux (ulimit):\\n   - Sistemul de operare are o limita maxima de thread-uri per utilizator (vizibila cu ulimit -u).\\n   - Daca limita este setata la 4096 si aplicatia incearca sa porneasca firul 4097, OS returneaza eroare.\\n\\n2. Dimensiunea Stivei de Thread (-Xss):\\n   - Fiecare thread Java primeste o stiva de memorie proprie nativa (implicit 1 MB per thread pe 64-bit).\\n   - 2.000 de fire consuma 2 GB doar pentru stive, in afara memoriei de Heap!\\n\\n3. Epuizarea memoriei RAM a sistemului sau a spatiului de memorie virtuala (swap/cgroups in Docker).\\n\\nSolutii:\\n- Cresterea limitelor in /etc/security/limits.conf (nproc).\\n- Folosirea unui ThreadPool cu numar limitat de fire sau migrarea la Virtual Threads in Java 21.",
    codeSnippet: `// Verificare limite in terminal Linux:
// ulimit -u           -> Numar maxim procese/fire
// cat /proc/sys/kernel/threads-max -> Limita globala sistem`,
    interviewTrap: "Daca cresti -Xmx (Heap-ul) crezand ca rezolvi acest OOM, de fapt inrautatesti situatia! Heap-ul mai mare lasa MAI PUTINA memorie RAM libera pentru alocarea stivelor thread-urilor native.",
    keyTakeaway: "Unable to create native thread semnaleaza depasirea limitelor OS (ulimit/nproc) sau lipsa de RAM nativ pentru stivele thread-urilor."
  },
  {
    id: "java-87",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Generarea si Analiza unui Heap Dump la Crash",
    question: "Cum configurezi JVM-ul sa salveze automat un Heap Dump la aparitia unui OutOfMemoryError si cum il analizezi folosind Eclipse MAT?",
    answer: "1. Configurarea Automata in Productie (OBLIGATORIE):\\n   - Adauga parametrii JVM in linia de comanda:\\n     -XX:+HeapDumpOnOutOfMemoryError\\n     -XX:HeapDumpPath=/var/log/dumps/app_heap_dump.hprof\\n   - JVM va scrie pe disc o copie fidela a intregii memorii Heap exact in momentul fatal al prabusirii, inainte de oprirea procesului.\\n\\n2. Generare Manuala la cerere (fara crash):\\n   - jcmd <PID> GC.heap_dump /tmp/dump.hprof\\n   - Sau folosind jmap: jmap -dump:live,format=b,file=dump.hprof <PID>\\n\\n3. Analiza cu Eclipse Memory Analyzer Tool (MAT):\\n   - Deschide fisierul .hprof in MAT.\\n   - Ruleaza raportul automat \"Leak Suspects\": identifica instantaneu clasa sau structura de date care retine 80-90% din memoria totala (Retained Heap).\\n   - Inspecteaza \"Dominator Tree\" si drumul de referinte \"Path to GC Roots\" excluzand referintele weak/soft pentru a vedea cine retine obiectul in viata.",
    codeSnippet: `// Argumente JVM de productie recomandate:
// -XX:+HeapDumpOnOutOfMemoryError 
// -XX:HeapDumpPath=/var/log/app_dump.hprof
// -XX:+ExitOnOutOfMemoryError (opreste containerul imediat pentru a fi recreat de K8s)`,
    interviewTrap: "Asigura-te ca partitia pe disc are suficient spatiu liber egal cu dimensiunea maxima a Heap-ului (-Xmx). Daca Heap-ul are 16 GB si discul are doar 5 GB liberi, scrierea dump-ului va esua.",
    keyTakeaway: "HeapDumpOnOutOfMemoryError salveaza starea memoriei la crash; Eclipse MAT identifica obiectele suspecte prin Dominator Tree."
  },
  {
    id: "java-88",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "JIT Compiler: C1 Compiler, C2 Compiler si Tiered Compilation",
    question: "Cum functioneaza Tiered Compilation in JVM si care este diferenta dintre compilatorul C1 (Client) si C2 (Server)?",
    answer: "JVM nu executa bytecode-ul doar prin interpretare lenta, ci foloseste un compilator Just-In-Time (JIT) pe niveluri (Tiered Compilation, activat implicit):\\n\\n1. Nivelul 0 (Interpreted Code):\\n   - Bytecode-ul este executat linie cu linie de catre interpretor. Pornire instantanee a aplicatiei, dar viteza de executie redusa.\\n\\n2. Nivelurile 1, 2, 3 (C1 Compiler / Client Compiler):\\n   - Compilator usor si rapid.\\n   - Compileaza metodele apelate frecvent in cod masina nativ rapid, cu optimizari de baza.\\n   - Nivelul 3 injecteaza contoare de profilare (Profiling counters) pentru a monitoriza tipurile de date si frecventa ramurilor din cod.\\n\\n3. Nivelul 4 (C2 Compiler / Server Compiler / Opto):\\n   - Compilator agresiv de inalta performanta.\\n   - Preia datele de profilare din C1 si aplica optimizari profunde: inlining masiv de metode, devirtualizare, loop unrolling, vectorizare SIMD.\\n   - Codul atinge viteze comparabile cu C++.",
    codeSnippet: `// Verificare faze JIT din linia de comanda:
// -XX:+PrintCompilation
// Afiseaza cand o metoda este compilata pe C1 (tiers 1-3) sau promovata pe C2 (tier 4).`,
    interviewTrap: "Daca o ipoteza optimista a compilatorului C2 este contrazisa ulterior la runtime (ex: apare o clasa polimorfica noua), JVM efectueaza o Deoptimizare (Deopt) si coboara codul inapoi la nivelul interpretat.",
    keyTakeaway: "Tiered Compilation ofera pornire rapida prin C1 si performanta maxima pe termen lung prin optimizarile agresive din C2."
  },
  {
    id: "java-89",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Tehnici de Optimizare JIT: Method Inlining si Loop Unrolling",
    question: "Ce este Method Inlining si Loop Unrolling in optimizarile JIT si cum fac codul modular la fel de rapid ca cel monolitic?",
    answer: "1. Method Inlining (Cea mai importanta optimizare JIT):\\n   - In loc sa faca un apel de metoda real (care implica plasarea parametrilor pe stiva, salt la instructiune CPU si crearea unui Stack Frame), JIT copiaza corpul metodei apelate direct in corpul metodei apelante!\\n   - Permite scrierea de metode mici, curate si reutilizabile in conformitate cu principiile Clean Code, cu ZERO penalizare de performanta la runtime.\\n   - Conditie: Metoda trebuie sa fie suficient de mica (implicit sub 35 bytes de bytecode pentru -XX:MaxInlineSize).\\n\\n2. Loop Unrolling (Derularea Buclelor):\\n   - La bucle for/while, la fiecare pas se face un salt conditional (Branch instruction) si o comparatie de contor.\\n   - JIT dubleaza sau cuadrupleaza corpul buclei (ex: executa 4 iteratii intr-un singur pas), reducand numarul de verificari de conditii si permitand instructiuni paralele pe registri CPU (Vectorizare SIMD).",
    codeSnippet: `// Inainte de Inlining:
public int getAge() { return this.age; }
public void check(Person p) { int a = p.getAge(); }

// Dupa JIT Method Inlining (executat direct in instructiuni masina):
public void check(Person p) { int a = p.age; } // Zero apel de functie!`,
    interviewTrap: "Metodele mari de peste 325 bytes de bytecode (-XX:MaxFreqInlineSize) nu vor fi NICIODATA inlinuite de JIT, indiferent cat de des sunt apelate. Pastreaza metodele mici!",
    keyTakeaway: "Method Inlining elimina costul salturilor de stiva pentru metode mici; Loop Unrolling reduce verificarile de conditii in bucle."
  },
  {
    id: "java-90",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Monomorphic vs Bimorphic vs Megamorphic Call-Sites in JIT",
    question: "Cum optimizeaza JIT apelurile polimorfice de interfata prin Inline Caching si de ce siturile Megamorphic sunt mai lente?",
    answer: "Cand apelezi o metoda pe o interfata sau clasa de baza (ex: animal.makeSound()), JVM trebuie in mod normal sa caute adresa metodei in VTable (Virtual Method Table):\\n\\n1. Monomorphic Call-Site (O singura clasa concreta):\\n   - Daca profilarea arata ca la acel punct de apel (call-site) s-a transmis INTOTDEAUNA aceeasi clasa concreta (ex: doar Dog):\\n   - JIT devirtualizeaza apelul si face INLINE direct la Dog.makeSound()! Rapiditate maxima identica cu o metoda statica.\\n\\n2. Bimorphic Call-Site (Exact doua clase concrete):\\n   - Daca apar doar doua implementari (ex: Dog si Cat):\\n   - JIT genereaza un simplu branch if (obj instanceof Dog) Dog.sound() else Cat.sound() si poate inlui ambele ramuri.\\n\\n3. Megamorphic Call-Site (Trei sau mai multe clase):\\n   - Daca prin acelasi punct de apel trec multe implementari diferite (ex: Dog, Cat, Cow, Bird, Horse):\\n   - JIT renunta la inlining si este fortat sa faca o cautare dinamica lenta in VTable la FIECARE apel de instructiune (invokevirtual).",
    codeSnippet: `// Monomorphic: la apel ajunge doar ServiceA -> JIT face INLINE direct
for (Task t : tasks) { t.execute(); } // Daca toate t sunt din clasa EmailTask -> ultra-rapid

// Megamorphic: la acelasi punct trec 10 clase diferite -> cautare lenta in VTable`,
    interviewTrap: "Design-ul cu interfete este excelent, dar daca ai o bucla critica de performanta parcurgand milioane de elemente, asigura-te ca nu treci printr-un call-site megamorphic.",
    keyTakeaway: "Monomorphic permite inlining direct; Megamorphic forteaza cautarea in tabele virtuale (VTable) la fiecare apel."
  },
  {
    id: "java-91",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "ClassLoader Delegation Model: Bootstrap, Platform si Application",
    question: "Cum functioneaza modelul ierarhic de delegare (Parent Delegation Model) al ClassLoader-elor in JVM?",
    answer: "Orice clasa Java este incarcata in memorie de un ClassLoader. Exista o ierarhie standard de 3 niveluri:\\n\\n1. Ierarhia Standard:\\n   - Bootstrap ClassLoader (scris in C/C++): Incarca clasele fundamentale de runtime din modulul java.base (ex: java.lang.Object, String, List).\\n   - Platform ClassLoader (in vechiul Java: Extension ClassLoader): Incarca clasele de platforma si extensii Java.\\n   - Application ClassLoader (System ClassLoader): Incarca clasele din classpath-ul aplicatiei tale (fisierele .class si dependintele din JAR-uri).\\n\\n2. Principiul de Delegare Parinte (Parent-First Delegation):\\n   - Cand un ClassLoader primeste cererea de a incarca o clasa (ex: \"com.ats.User\"):\\n   - Pas 1: Verifica daca clasa nu a fost deja incarcata in cache-ul sau.\\n   - Pas 2: NU incearca sa o incarce el insusi; DELEAGA cererea catre parintele sau ierarhic.\\n   - Pas 3: Doar daca parintele (si toti stramosii pana la Bootstrap) returneaza ClassNotFoundException, ClassLoader-ul copil incearca sa gaseasca si sa incarce fisierul de bytecode.",
    codeSnippet: `// Verificare ierarhie din cod:
ClassLoader appCl = Application.class.getClassLoader();
ClassLoader platCl = appCl.getParent();
ClassLoader bootCl = platCl.getParent(); // Returneaza null (deoarece Bootstrap e scris in C++)
System.out.println(appCl);  // jdk.internal.loader.ClassLoaders$AppClassLoader
System.out.println(platCl); // jdk.internal.loader.ClassLoaders$PlatformClassLoader
System.out.println(bootCl); // null`,
    interviewTrap: "Nu poti inlocui clasa java.lang.String cu o clasa proprie falsa creand un fisier String.java in proiect, deoarece parintele Bootstrap o va gasi intotdeauna primul pe cea oficiala (securitate fundamentala in Java).",
    keyTakeaway: "Modelul de delegare cere parintilor sa incarce clasele primii, asigurand securitatea si integritatea runtime-ului Java."
  },
  {
    id: "java-92",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Custom ClassLoaders si Ruperea Modelului de Delegare",
    question: "In ce scenarii este necesara crearea unui Custom ClassLoader si cum rupe un container web (Tomcat) modelul de delegare?",
    answer: "1. De ce cream Custom ClassLoaders:\\n   - Incarcarea de clase din surse non-standard: dintr-o baza de date, peste retea (HTTP/FTP), din fisiere criptate pe disc.\\n   - Hot-reloading si Plugin-uri: Permite descarcarea si reincarcarea de module fara a reporni intregul server JVM.\\n\\n2. Ruperea Modelului de Delegare (Child-First / WebApp-First):\\n   - In servere de aplicatii (Tomcat, Jetty), fiecare aplicatie web (.war) are propriul sau WebAppClassLoader.\\n   - Daca Aplicatia A foloseste Jackson 2.12 si Aplicatia B foloseste Jackson 2.15, delegarea parinte ar forta ambele aplicatii sa foloseasca versiunea globala din Tomcat!\\n   - Pentru a asigura izolarea aplicatiilor, WebAppClassLoader suprascrie metoda loadClass(): incearca sa incarce clasele MAI INTAI din WEB-INF/classes si WEB-INF/lib, si doar daca nu le gaseste apeleaza parintele!\\n   - Exceptie absoluta: Clasele standard Java (java.*) sunt delegate INTOTDEAUNA catre Bootstrap pentru securitate.",
    codeSnippet: `public class CustomNetworkClassLoader extends ClassLoader {
    @Override
    protected Class<?> findClass(String name) throws ClassNotFoundException {
        byte[] b = loadByteCodeFromNetwork(name); // Descarca octeti de pe server
        return defineClass(name, b, 0, b.length); // Transforma octetii in clasa JVM
    }
}`,
    interviewTrap: "Doua obiecte create din acelasi bytecode .class sunt considerate clase complet INCOMPATIBILE de catre JVM daca au fost incarcate de instante diferite de ClassLoader (arunca ClassCastException la cast).",
    keyTakeaway: "Tomcat rupe modelul de delegare (Child-First) pentru a izola versiunile bibliotecilor intre aplicatii web diferite."
  },
  {
    id: "java-93",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "NoClassDefFoundError vs ClassNotFoundException",
    question: "Care este diferenta fundamentala dintre o exceptie ClassNotFoundException si o eroare fatala NoClassDefFoundError in Java?",
    answer: "1. ClassNotFoundException (Checked Exception):\\n   - Este o exceptie verificata care apare la incarcare DINAMICA explicita din cod (ex: Class.forName(\"com.mysql.cj.jdbc.Driver\"), ClassLoader.loadClass()).\\n   - Semnificatie: \"Am cautat la runtime un fisier .class cu numele respectiv pe classpath si nu l-am gasit\". Se rezolva adaugand dependinta in pom.xml.\\n\\n2. NoClassDefFoundError (Fatal Error):\\n   - Este o EROARE (subclasa a lui java.lang.Error), aparuta la compilarea cu succes a codului, dar la executie clasa nu mai este gasita sau nu poate fi initializata!\\n   - Doua cauze frecvente:\\n     - Clasa era prezenta la compile-time, dar lipseste din JAR-ul de runtime.\\n     - Initializarea statica a esuat! Daca o clasa a aruncat o exceptie intr-un static initializer block (static { ... }), JVM marcheaza clasa ca defecta. La orice apel ulterior catre acea clasa, JVM nu mai incearca initializarea ci arunca direct NoClassDefFoundError!",
    codeSnippet: `// Exemplu cauzator de NoClassDefFoundError:
public class BrokenService {
    static {
        // Daca asta arunca RuntimeException la pornire (ex: fisier lipsa),
        // orice referinta ulterioara arunca NoClassDefFoundError!
        if (true) throw new RuntimeException("Eroare initializare statica");
    }
}`,
    interviewTrap: "Daca vezi NoClassDefFoundError in loguri, deruleaza intotdeauna logurile mai sus pentru a gasi adevarata eroare initiala: ExceptionInInitializerError.",
    keyTakeaway: "ClassNotFoundException este eroare la incarcare dinamica prin sir de caractere; NoClassDefFoundError apare cand o clasa existenta la compilare nu poate fi gasita sau initializata la runtime."
  },
  {
    id: "java-94",
    category: "JAVA",
    difficulty: "USOR",
    title: "String Deduplication in G1 GC si Compact Strings (Java 9)",
    question: "Cum reduc Compact Strings (Java 9) si String Deduplication (-XX:+UseStringDeduplication) consumul de memorie in aplicatii?",
    answer: "In aplicatiile de intreprindere, String-urile consuma frecvent intre 25% si 40% din intregul spatiu Heap:\\n\\n1. Compact Strings (Java 9 - activat nativ):\\n   - Inainte de Java 9, String stoca caracterele intr-un char[] (fiecare caracter ocupa 2 octeti / 16 biti conform UTF-16), chiar daca textul continea doar caractere ASCII obisnuite (1 octet).\\n   - In Java 9, reprezentarea interna a fost schimbata intr-un byte[] compact impreuna cu un flag coder (LATIN1 sau UTF16).\\n   - Daca textul contine doar caractere din alfabetul latin (ASCII), consuma doar 1 octet per caracter, reducand amprenta de memorie la jumatate (50%)!\\n\\n2. String Deduplication in G1 GC (-XX:+UseStringDeduplication):\\n   - Multe String-uri create la runtime (din JSON, baze de date) au continut identic (\"Bucuresti\", \"ACTIVE\"), dar sunt obiecte distincte pe Heap.\\n   - In timpul colectarii de fundal, G1 identifica instantele de String care au aceeasi secventa de caractere si le modifica campul intern value sa puncteze catre ACELASI byte[] partajat, eliberand duplicatele din memorie fara modificari de cod!",
    codeSnippet: `// Activare String Deduplication in containere cu G1:
// -XX:+UseG1GC -XX:+UseStringDeduplication`,
    interviewTrap: "Compact Strings este o optimizare transparenta a JDK-ului. Nu incerca sa convertesti manual sirurile in array-uri de bytes pentru optimizari, deoarece JVM face asta nativ mult mai eficient.",
    keyTakeaway: "Compact Strings injumatateste memoria pentru texte ASCII (byte[] in loc de char[]); String Deduplication partajeaza array-ul intern intre siruri cu continut identic."
  },
  {
    id: "java-95",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Tipuri de Referinte in Java: Strong, Soft, Weak si Phantom",
    question: "Care sunt cele 4 tipuri de referinte din java.lang.ref si cand este colectat de Garbage Collector obiectul referit?",
    answer: "1. Strong Reference (Implicita):\\n   - MyObject o = new MyObject();\\n   - Obiectul NU este colectat NICIODATA atata timp cat exista cel putin un lant de referinte tari pana la un GC Root, chiar daca memoria se epuizeaza complet (arunca OOM).\\n\\n2. SoftReference<T>:\\n   - Obiectul este curatat doar atunci cand JVM-ul are nevoie DISPERATA de memorie (inainte de a arunca OutOfMemoryError).\\n   - Folosita istoric pentru cache-uri sensibile la memorie.\\n\\n3. WeakReference<T>:\\n   - Obiectul este colectat la URMATORUL CICLU de Garbage Collection, daca nu mai exista nicio alta referinta tare catre el.\\n   - Folosita in WeakHashMap si ThreadLocal pentru a preveni memory leaks cand durata de viata a cheii este dictata de restul aplicatiei.\\n\\n4. PhantomReference<T>:\\n   - get() returneaza intotdeauna null.\\n   - Folosita impreuna cu un ReferenceQueue pentru a fi notificat exact cand un obiect a fost curatat din memorie (inlocuitor modern pentru finalize()).",
    codeSnippet: `// Creare referinta slaba (WeakReference):
String data = new String("temp_data");
WeakReference<String> weakRef = new WeakReference<>(data);

data = null; // Stergem referinta tare
// La primul GC: weakRef.get() va returna null!`,
    interviewTrap: "Nu folosi SoftReference pentru cache-uri mari de inalta performanta in productie; pe JVM-uri moderne tinde sa se curete brusc in bulk cauzand spike-uri de incarcare pe baze de date.",
    keyTakeaway: "Strong = nu se curata niciodata; Soft = se curata la OOM iminent; Weak = se curata la primul GC; Phantom = notificare post-mortem."
  },
  {
    id: "java-96",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "WeakReference vs SoftReference in Arhitectura de Cache",
    question: "De ce o mapa bazata pe SoftReference este superioara uneia bazate pe WeakReference pentru implementarea unui Cache in memorie?",
    answer: "Diferenta critica intre cele doua este momentul si agresivitatea colectarii:\\n\\n1. Daca folosesti WeakReference pentru un Cache:\\n   - Obiectul din cache este sters la cel mai apropiat Minor GC (adica o data la cateva secunde!), chiar daca serverul are 64 GB de memorie RAM complet libera!\\n   - Rata de \"Cache Miss\" va fi enorma, facand cache-ul complet inutil.\\n\\n2. Daca folosesti SoftReference pentru un Cache:\\n   - JVM garanteaza ca va pastra obiectele in memorie atata timp cat exista suficient spatiu liber pe Heap.\\n   - Colectarea obiectelor protejate prin SoftReference are loc doar daca spatiul de Heap devine critic.\\n   - Comportamentul poate fi fin-tunat prin parametrul JVM: -XX:SoftRefLRUPolicyMSPerMB (milisecunde de viata per MB liber pe Heap).\\n\\n3. Solutia Moderna in Productie:\\n   - In practica moderna nu se mai folosesc implementari manuale cu Soft/Weak; se folosesc biblioteci specializate precum Caffeine Cache sau Guava Cache, bazate pe algoritmi hibrizi de tip Window TinyLFU.",
    codeSnippet: `// Exemplu SoftReference cache:
Map<String, SoftReference<BitmapImage>> imageCache = new HashMap<>();

public BitmapImage getImage(String id) {
    SoftReference<BitmapImage> ref = imageCache.get(id);
    if (ref != null) {
        BitmapImage img = ref.get();
        if (img != null) return img; // Cache hit
    }
    BitmapImage loaded = loadFromDisk(id);
    imageCache.put(id, new SoftReference<>(loaded));
    return loaded;
}`,
    interviewTrap: "Daca creezi un SoftReference catre un obiect, dar obiectul retine la randul sau o referinta tare catre un alt nod din aplicatie, intregul graf de obiecte ramane blocat in memorie.",
    keyTakeaway: "WeakReference moare la primul GC; SoftReference supravietuieste pana cand memoria devine critica, fiind potrivita pentru cache-uri flexibile."
  },
  {
    id: "java-97",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce Cleaner (Java 9) a inlocuit complet Object.finalize()?",
    question: "De ce metoda Object.finalize() a fost declarata Deprecated for Removal si cum asigura java.lang.ref.Cleaner eliberarea resurselor native?",
    answer: "Problemele Catastrofale ale lui finalize():\\n1. Imprevizibilitate totala: JVM nu garanteaza cand sau daca metoda finalize() va fi apelata vreodata!\\n2. Degradare severa GC: Obiectele cu finalize() nu pot fi colectate imediat; necesita cel putin doua cicluri complete de GC si o coada interna lenta (FinalizerQueue).\\n3. Re-inviere periculoasa a obiectului (Object Resurrection): Un obiect murdar se putea salva atribuindu-se din nou unei variabile globale statice in interiorul lui finalize()!\\n4. Vulnerabilitati de securitate prin Finalizer Attacks.\\n\\nSolutia Moderna: java.lang.ref.Cleaner (Java 9)\\n- Cleaner ruleaza intr-un fir dedicat de fundal complet separat.\\n- Actiunea de curatare (Cleaning Action) este implementata ca un Runnable STATIC care NU are acces la referinta obiectului curatat (prevenind re-invierea!).\\n- Resursele native (descriptori de fisiere, pointeri C++) sunt eliberate curat cand obiectul devine phantom reachable.",
    codeSnippet: `public class NativeResource implements AutoCloseable {
    private static final Cleaner CLEANER = Cleaner.create();
    
    // Clasa statica separata - NU tine referinta catre clasa parinte!
    private static class State implements Runnable {
        private long nativeAddress;
        State(long addr) { this.nativeAddress = addr; }
        public void run() { freeNativeMemory(nativeAddress); }
    }

    private final Cleaner.Cleanable cleanable;
    public NativeResource() {
        this.cleanable = CLEANER.register(this, new State(allocate()));
    }
    public void close() { cleanable.clean(); }
}`,
    interviewTrap: "Daca actiunea de curatare dintr-un Cleaner este o clasa anonima interioara non-statica, ea retine o referinta ascunsa catre obiectul parinte, impiedicand pentru totdeauna curatarea acestuia (Memory Leak garantat!).",
    keyTakeaway: "Cleaner inlocuieste finalize() prin actiuni statice decuplate, eliminand riscul de re-inviere a obiectelor si blocajele GC."
  },
  {
    id: "java-98",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Tranzitia de la sun.misc.Unsafe la VarHandle si Foreign Memory API",
    question: "De ce a fost descurajata clasa sun.misc.Unsafe si cum ofera VarHandle (Java 9) si FFM API (Java 22) operatii atomice sigure?",
    answer: "1. Ce a fost sun.misc.Unsafe:\\n   - O poarta secreta interna a JDK-ului folosita masiv de biblioteci de inalta performanta (Netty, Disruptor, Kafka, Spring).\\n   - Permitea alocari de memorie directa in afara Heap-ului (off-heap malloc), acces la memorie prin pointeri directi si instructiuni CAS atomice.\\n   - Risc enorm: Un pointer gresit arunca crash instantaneu cu Segmentation Fault (core dump) omorand intregul proces JVM fara exceptie Java.\\n\\n2. Solutiile Moderne Oficiale:\\n   - VarHandle (Java 9 - JEP 193): Inlocuieste operatiile de memorie din Unsafe cu o interfata tipizata, sigura si verificata de compilator, oferind moduri de acces precise (getAcquire, setRelease, compareAndSet).\\n   - Foreign Function and Memory (FFM) API (Java 22 - JEP 454): Ofera acces complet la memoria nativa Off-Heap (Arena, MemorySegment) si apeluri directe catre biblioteci native C/C++ fara a mai scrie cod JNI!",
    codeSnippet: `// Utilizare VarHandle in loc de Unsafe:
public class Account {
    private volatile int balance;
    private static final VarHandle VH_BALANCE;

    static {
        try {
            VH_BALANCE = MethodHandles.lookup()
                .findVarHandle(Account.class, "balance", int.class);
        } catch (ReflectiveOperationException e) { throw new Error(e); }
    }

    public boolean updateBalance(int expected, int newValue) {
        return VH_BALANCE.compareAndSet(this, expected, newValue);
    }
}`,
    interviewTrap: "Incepand cu Java 21/22, apelurile catre metodele critice din sun.misc.Unsafe emit avertismente severe la pornire si vor fi eliminate complet in versiunile viitoare.",
    keyTakeaway: "VarHandle aduce operatii atomice si bariere de memorie sigure; FFM API inlocuieste Unsafe si JNI pentru lucrul cu memoria nativa."
  },
  {
    id: "java-99",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Profiling in Productie: Java Flight Recorder (JFR) si JMC",
    question: "Ce este Java Flight Recorder (JFR) si cum captureaza evenimente de performanta in productie cu un impact de sub 1% CPU?",
    answer: "1. Ce este Java Flight Recorder (JFR):\\n   - Un mecanism de inregistrare a evenimentelor de diagnosticare integrat direct in masina virtuala HotSpot JVM (initial comercial in Oracle JDK, open-source complet din Java 11).\\n   - Colecteaza continuu date despre: alocari de memorie pe fir, pauze de GC, thread locks contention, timpi de asteptare I/O pe fisiere si sockets, compilari JIT si consum de CPU.\\n\\n2. De ce are overhead neglijabil (< 1%):\\n   - Este scris direct in nucleul C++ al masinii virtuale; evenimentele sunt scrise in buffere circulare in memorie fara conversii lente in siruri de caractere.\\n   - Poate fi lasat PORNIT PERMANENT in productie (continuous recording).\\n\\n3. Analiza cu JDK Mission Control (JMC):\\n   - Fisierul rezultat .jfr este deschis in JMC sau IntelliJ Profiler.\\n   - Ofera grafice de Flame Graph, identifica exact linia de cod responsabila de alocari excesive de memorie sau thread-ul care blocheaza alte fire pe un lock.",
    codeSnippet: `// Pornire inregistrare JFR pe o aplicatie activa din consola:
// jcmd <PID> JFR.start name=ProfileProd settings=profile.jfc duration=60s filename=prod_profile.jfr
// jcmd <PID> JFR.stop name=ProfileProd`,
    interviewTrap: "Profilerele clasice prin instrumentare de bytecode (precum cele din versiuni vechi de unelte) incetinesc aplicatia cu 20-50% si altereaza masuratorile. JFR foloseste sampling intern si nu sufera de acest efect.",
    keyTakeaway: "JFR este profilerul de aur integrat in JVM capabil sa diagnosticheze probleme reale in productie cu sub 1% overhead."
  },
  {
    id: "java-100",
    category: "JAVA",
    difficulty: "USOR",
    title: "Parametri JVM Critici in Containere Docker: MaxRAMPercentage",
    question: "De ce o aplicatie Java 8 veche crapat din cauza OOM Killer in Docker si cum rezolva -XX:MaxRAMPercentage problema?",
    answer: "1. Problema Istorica cu Containerele (Java 8 inainte de update 191):\\n   - JVM nu stia ca ruleaza intr-un container Docker cu cgroups.\\n   - Citea memoria si numarul de core-uri direct de pe masina gazda (Host OS)!\\n   - Daca serverul avea 64 GB RAM iar containerul avea limita de 2 GB, JVM aloca un Heap de 16 GB (25% din gazda). Cand incerca sa foloseasca mai mult de 2 GB, Linux OOM Killer distrugea instantaneu containerul (Exit Code 137)!\\n\\n2. Solutia Moderna: Container Support\\n   - Activata nativ in toate versiunile moderne: -XX:+UseContainerSupport\\n   - Detecteaza corect limitele din Docker/Kubernetes (memory limits si CPU shares).\\n\\n3. De ce folosim -XX:MaxRAMPercentage in loc de -Xmx numeric fix:\\n   - Daca configurezi -Xmx4g si maresti limita pod-ului de Kubernetes la 8g, trebuie sa modifici si fisierul de configurare Java.\\n   - Folosind -XX:MaxRAMPercentage=75.0, JVM aloca automat 75% din memoria containerului pentru Heap, lasand 25% liber pentru Metaspace, thread stacks si OS.",
    codeSnippet: `# Comanda recomandata in Dockerfile:
ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:InitialRAMPercentage=75.0", \
  "-jar", "app.jar"]`,
    interviewTrap: "Nu seta MaxRAMPercentage=100.0! Memoria nativa a procesului, Metaspace-ul si stivele thread-urilor traiesc in afara Heap-ului; daca Heap-ul ia 100%, containerul va fi ucis imediat pentru depasire de memorie.",
    keyTakeaway: "UseContainerSupport si MaxRAMPercentage scaleaza dinamic Heap-ul in functie de limitele containerului Docker/Kubernetes."
  },
  {
    id: "java-101",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "De ce capacitatea unui HashMap este intotdeauna o putere a lui 2?",
    question: "De ce HashMap-ul isi forteaza intotdeauna capacitatea sa fie o putere a lui 2 (16, 32, 64...) si cum optimizeaza formula (n - 1) & hash calculul bucket-ului?",
    answer: "In mod normal, pentru a mapa un hash pe un array de lungime N se foloseste operatia modulo: index = hash % N.\\n\\n1. Problema cu operatia Modulo (%):\\n   - La nivel de procesor (CPU), impartirea si modulo sunt operatii matematice extrem de lente, necesitand 20-40 de cicluri de ceas per calcul.\\n\\n2. Trucul Bitwise din HashMap ((n - 1) & hash):\\n   - Daca N este o putere a lui 2 (ex: N = 16 = 00010000 in binar), atunci N - 1 devine o masca formata exclusiv din biti de 1 (15 = 00001111 in binar).\\n   - Proprietate matematica: Daca N este putere a lui 2, atunci hash % N este EXACT ECHIVALENT cu operatia pe biti: hash & (N - 1)!\\n   - Operatia bitwise AND (&) se executa intr-un SINGUR ciclu de ceas CPU (instantaneu), oferind o viteza uriasa la fiecare get() si put().\\n\\n3. Ce se intampla daca ceri initialCapacity = 20:\\n   - Metoda interna tableSizeFor() rotunjeste automat in sus la cea mai apropiata putere a lui 2 (20 devine 32).",
    codeSnippet: `// In sursa Java HashMap:
static int indexFor(int hash, int length) {
    return hash & (length - 1); // Echivalent ultra-rapid pentru hash % length
}`,
    interviewTrap: "Daca N nu ar fi putere a lui 2 (ex: N=15), N-1 ar fi 14 (1110 binar), iar ultimul bit ar fi 0. Astfel, toate bucket-urile cu indici impari nu ar primi niciodata elemente, irosind 50% din spatiul array-ului!",
    keyTakeaway: "Capacitatea putere a lui 2 permite inlocuirea operatiei lente modulo (%) cu operatia pe biti ultra-rapida (&)."
  },
  {
    id: "java-102",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Functia de Perturbare a Hash-ului in HashMap (Hash Spread)",
    question: "De ce HashMap nu foloseste direct key.hashCode() si de ce aplica formula (h = key.hashCode()) ^ (h >>> 16)?",
    answer: "Aceasta operatie se numeste \"Perturbation Function\" sau \"Hash Spreading\":\\n\\n1. Problema cu hashCode() direct:\\n   - Cand capacitatea tabelei este mica (ex: N = 16), masca (N - 1) ia in considerare doar ultimii 4 biti inferiori ai hash-ului (15 = 1111).\\n   - Daca cheile au hashCodes care difera doar in bitii superiori de 16 biti (ex: numere mari float sau adrese de memorie), dar au ultimii 4 biti identici, toate cheile vor nimeri in ACELASI bucket (coliziune 100%)!\\n\\n2. Cum rezolva formula (h ^ (h >>> 16)):\\n   - h >>> 16 deplaseaza bitii superiori (high-order bits) cu 16 pozitii spre dreapta.\\n   - Operatorul XOR (^) combina bitii superiori cu bitii inferiori.\\n   - Efectul: Informatia din toti cei 32 de biti ai hash-ului original este \"amestecata\" si propagata in bitii inferiori, reducand dramatic coliziunile in tabele mici fara cost computational semnificativ.",
    codeSnippet: `// Metoda hash() din HashMap.java:
static final int hash(Object key) {
    int h;
    return (key == null) ? 0 : (h = key.hashCode()) ^ (h >>> 16);
}`,
    interviewTrap: "Daca intervievatorul intreaba cum se calculeaza hash-ul pentru o cheie null in HashMap, raspunsul este: nu apeleaza hashCode(), ci returneaza direct 0 (cheia null sta mereu in bucket-ul 0).",
    keyTakeaway: "Functia de perturbare coboara bitii superiori peste cei inferiori prin XOR, dispersand uniform cheile in bucket-uri."
  },
  {
    id: "java-103",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Treeification in HashMap: De la LinkedList la Red-Black Tree",
    question: "Cand se transforma un bucket din HashMap dintr-o lista inlantuita intr-un arbore Rosu-Negru (Java 8) si cand se face de-treeify?",
    answer: "Inainte de Java 8, coliziunile din acelasi bucket formau o lista simplu inlantuita (LinkedList). Daca un atacator genera intentionat mii de chei cu acelasi hash (Hash Collision DoS Attack), cautarea get() se degrada de la O(1) la O(N).\\n\\nRegulile din Java 8+:\\n1. Treeification (Transformare in Arbore):\\n   - Daca numarul de noduri dintr-un singur bucket atinge pragul TREEIFY_THRESHOLD = 8;\\n   - SI capacitatea totala a tabelei (table.length) este de cel putin MIN_TREEIFY_CAPACITY = 64;\\n   - Atunci lista este convertita intr-un Red-Black Tree (TreeNode), reducand complexitatea de la O(N) la O(log N)!\\n   - Daca table.length < 64, nu face treeify, ci pur si simplu dubleaza capacitatea tabelei (resize/rehash).\\n\\n2. Untreeify (Revenire la Lista):\\n   - Daca in urma stergerilor sau a operatiei de resize, numarul de noduri din arbore scade la UNTREEIFY_THRESHOLD = 6, nodurile sunt convertite inapoi intr-o lista simpla (deoarece pentru <6 elemente lista e mai rapida decat mentinerea echilibrului arborelui).",
    codeSnippet: `// Praguri critice in HashMap.java:
static final int TREEIFY_THRESHOLD = 8;
static final int UNTREEIFY_THRESHOLD = 6;
static final int MIN_TREEIFY_CAPACITY = 64;`,
    interviewTrap: "Diferenta dintre pragul de 8 (treeify) si 6 (untreeify) previne fenomenul de \"thrashing\" (conversie continua repetata intre lista si arbore daca se adauga si se sterge succesiv un element).",
    keyTakeaway: "Un bucket devine Red-Black Tree la 8 elemente si revine la lista la 6 elemente, garantand performanta O(log N) la coliziuni masive."
  },
  {
    id: "java-104",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Bucla Infinita din HashMap in Java 7 la Rehashing Concurent",
    question: "De ce HashMap-ul standard nu trebuie folosit NICIODATA concurent si ce bug faimos de 100% CPU (Circular Linked List) aparea in Java 7?",
    answer: "1. Ce este HashMap Race Condition:\\n   - HashMap nu este thread-safe. Daca doua fire apeleaza put() simultan, pot suprascrie date sau pot declansa simultan resize().\\n\\n2. Bug-ul de Bucla Infinita din Java 7:\\n   - In Java 7, la redimensionare (resize), elementele dintr-un bucket erau inserate in noua tabela folosind strategia \"Head Insertion\" (inversand ordinea elementelor din lista).\\n   - Daca Thread 1 si Thread 2 fac resize simultan, o schimbare de context exact la mijlocul re-legarii pointerilor putea face ca nodul A sa puncteze catre nodul B, iar nodul B sa puncteze inapoi catre nodul A (bucla circulara: A -> B -> A)!\\n   - La urmatorul get() pe acel hash, metoda intra intr-o bucla while infinita parcurgand ciclul, blocand procesorul la 100% CPU!\\n\\n3. Ce s-a schimbat in Java 8:\\n   - Java 8 a trecut la \"Tail Insertion\" (pastreaza ordinea originala a nodurilor), eliminand formarea buclelor circulare. Cu toate acestea, HashMap ramane non-thread-safe (pierde date sau intra in inconsistente); foloseste intotdeauna ConcurrentHashMap!",
    codeSnippet: `// Solutia corecta pentru acces concurent:
Map<String, String> map = new ConcurrentHashMap<>();`,
    interviewTrap: "Multi candidati spun: \"In Java 8 HashMap este thread-safe impotriva buclelor infinite\". Desi bucla circulara specifica a fost eliminata, nodurile din Red-Black Tree pot deveni complet corupte sub concurenta, cauzand exceptii bizare sau bucle in arbore.",
    keyTakeaway: "HashMap devine corupt sub concurenta; in Java 7 genera cicluri circulare la 100% CPU; foloseste exclusiv ConcurrentHashMap."
  },
  {
    id: "java-105",
    category: "JAVA",
    difficulty: "USOR",
    title: "IdentityHashMap: Compararea prin == in loc de equals()",
    question: "Cum functioneaza IdentityHashMap si in ce cazuri speciale este folosit in framework-uri (ex: serializare, clonare)?",
    answer: "1. Diferenta Fundamentala fata de HashMap:\\n   - HashMap foloseste key.hashCode() si key.equals(otherKey) pentru compararea cheilor.\\n   - IdentityHashMap foloseste System.identityHashCode(key) si OPERATORUL == (egalitate de referinte in memorie)!\\n   - Doua chei sunt considerate egale doar daca k1 == k2 (aceeasi instanta exacta pe Heap).\\n\\n2. Structura Interna (Linear Probing):\\n   - Nu foloseste noduri sau bucket-uri de tip LinkedList/Tree.\\n   - Stocheaza cheile si valorile alternativ intr-un singur array mare: table[2*i] = key, table[2*i+1] = value, rezolvand coliziunile prin Linear Probing.\\n\\n3. Cazuri Reale de Utilizare:\\n   - Serializatoare (Jackson, Gson, Java Serialization) si framework-uri de Deep Copy: Pentru a construi un graf de obiecte si a detecta referinte circulare (verificand daca instanta fizica exacta a mai fost deja vizitata).",
    codeSnippet: `Map<String, String> map = new IdentityHashMap<>();
String a = new String("key");
String b = new String("key");

map.put(a, "val1");
map.put(b, "val2");

System.out.println(map.size()); // Afiseaza 2! (Doua obiecte diferite in Heap)
// In HashMap clasic ar fi afisat 1!`,
    interviewTrap: "IdentityHashMap incalca intentionat contractul general al interfetei Map (care cere utilizarea lui equals). Foloseste-o strict cand ai nevoie de egalitate fizica de instanta.",
    keyTakeaway: "IdentityHashMap compara cheile prin operatorul == si identityHashCode, ideala pentru detectarea referintelor circulare."
  },
  {
    id: "java-106",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "WeakHashMap: Autocuratare si Prevenirea Scurgerilor de Memorie",
    question: "Cum functioneaza WeakHashMap si de ce valorile asociate sunt sterse automat cand cheia nu mai este referita in alta parte?",
    answer: "1. Cum functioneaza intern:\\n   - In WeakHashMap, intrarile (Entry) extind java.lang.ref.WeakReference si retin CHEIA ca pe o referinta slaba (WeakReference pe cheie, dar referinta normala pe valoare).\\n   - Cand o cheie nu mai are nicio referinta tare (Strong Reference) in intregul program, la urmatorul ciclu de Garbage Collection cheia este marcata ca eligibila si colectata din memorie.\\n\\n2. Curatarea Automata a Valorilor (ReferenceQueue):\\n   - Garbage Collector-ul plaseaza intrarea corespunzatoare intr-un ReferenceQueue intern.\\n   - La fiecare operatie get(), put() sau size() pe mapa, WeakHashMap apeleaza intern metoda expungeStaleEntries(), care scoate intrarile din ReferenceQueue si elibereaza si valorile asociate!\\n\\n3. Cazuri de Utilizare:\\n   - Stocarea de metadate temporare despre obiecte (ex: proprietati asociate tranzitoriu unui obiect de domeniu pe durata procesarii).",
    codeSnippet: `Map<Order, OrderMetadata> map = new WeakHashMap<>();
Order order = new Order(101);
map.put(order, new OrderMetadata("pending"));

order = null; // Nu mai exista referinta tare la order
System.gc();  // Sugeram GC
// La urmatoarea apelare map.size(), intrarea este stearsa automat!`,
    interviewTrap: "Daca valoarea din WeakHashMap retine direct sau indirect o referinta tare catre propria sa cheie, cheia nu va fi colectata NICIODATA de GC, creand un Memory Leak masiv.",
    keyTakeaway: "WeakHashMap sterge automat intrarile cand cheia nu mai are referinte tari, ideala pentru asocieri tranzitorii de metadate."
  },
  {
    id: "java-107",
    category: "JAVA",
    difficulty: "USOR",
    title: "EnumMap si EnumSet: De ce sunt cele mai rapide colectii din Java?",
    question: "De ce EnumMap si EnumSet sunt mult mai rapide si consuma mult mai putina memorie decat HashMap si HashSet obisnuite?",
    answer: "Deoarece toate valorile unui Enum sunt cunoscute la compilare si au un numar ordinal fix (0, 1, 2...):\\n\\n1. EnumSet (Bit-Vector ultra-compact):\\n   - Nu aloca noduri sau obiecte!\\n   - Pentru Enum-uri cu pana la 64 de valori, foloseste clasa RegularEnumSet care stocheaza intregul set intr-un SINGUR camp primitiv: private long elements!\\n   - Adaugarea, stergerea si testarea existentei se realizeaza prin operatii bitwise pe procesor (AND, OR, NOT) in 1 ciclu de ceas CPU!\\n   - Pentru >64 valori, foloseste JumboEnumSet (un array de long-uri).\\n\\n2. EnumMap (Array indexat direct):\\n   - Nu calculeaza hash, nu are functii de dispersie si nu are coliziuni.\\n   - Stocheaza valorile direct intr-un array compact: Object[] vals, unde indexul este pur si simplu key.ordinal()!\\n   - Complexitate O(1) garantata si zero pointer chasing.",
    codeSnippet: `// EnumSet:
Set<DayOfWeek> weekend = EnumSet.of(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY);

// EnumMap:
Map<DayOfWeek, String> schedule = new EnumMap<>(DayOfWeek.class);
schedule.put(DayOfWeek.MONDAY, "Work"); // Scrie direct in array la indexul 0!`,
    interviewTrap: "Daca cheile tale sunt instante de Enum si folosesti HashMap sau HashSet in loc de EnumMap / EnumSet, irosesti memorie si ratezi optimizari hardware masive.",
    keyTakeaway: "EnumSet foloseste masti de biti pe un singur long; EnumMap foloseste array indexat pe ordinal, oferind viteza maxima in Java."
  },
  {
    id: "java-108",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "ConcurrentSkipListMap: Cum ofera o Mapa Sortata Concurenta fara Lock-uri?",
    question: "Ce structura de date sta la baza ConcurrentSkipListMap si cum asigura acces concurent sortat cu complexitate O(log N)?",
    answer: "ConcurrentHashMap nu este sortat; TreeMap este sortat (Red-Black Tree), dar NU este thread-safe. Daca pui sincronizare peste TreeMap, devine un bottleneck urias.\\n\\nSolutia: ConcurrentSkipListMap (bazat pe structura Skip List):\\n1. Ce este un Skip List:\\n   - O lista inlantuita ierarhica pe mai multe niveluri (multi-level linked list).\\n   - Nivelul de baza (Level 0) contine toate elementele sortate.\\n   - Nivelurile superioare contin \"expresii\" (skip-uri / punti peste elemente) care actioneaza ca un index asemanator cu un arbore de cautare binar.\\n\\n2. De ce este ideala pentru concurenta:\\n   - Spre deosebire de un arbore rosu-negru care necesita rebalansari globale complexe (rotatii care blocheaza jumatate de arbore), inserarea intr-un Skip List modifica doar cativa pointeri locali de nivel!\\n   - Foloseste operatii atomice CAS pe pointerii nodurilor, fiind complet Lock-Free pentru citiri si scrieri concurente rapide cu complexitate O(log N).",
    codeSnippet: `// Mapa sortata thread-safe:
ConcurrentNavigableMap<Integer, String> map = new ConcurrentSkipListMap<>();
map.put(10, "Zece");
map.put(5, "Cinci");
map.put(20, "Douazeci");

// Navigare sigura fara concurenta:
Integer nearestKey = map.ceilingKey(7); // 10`,
    interviewTrap: "ConcurrentSkipListMap consuma mai multa memorie decat un TreeMap obisnuit din cauza pointerilor de indexare pe multiple niveluri, dar este singura solutie scalabila pentru mape sortate concurente.",
    keyTakeaway: "ConcurrentSkipListMap ofera o mapa sortata concurenta lock-free bazata pe liste multi-strat cu performanta O(log N)."
  },
  {
    id: "java-109",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "BlockingQueue: ArrayBlockingQueue vs LinkedBlockingQueue vs SynchronousQueue",
    question: "Care sunt diferentele arhitecturale si de performanta intre ArrayBlockingQueue, LinkedBlockingQueue si SynchronousQueue?",
    answer: "Toate cele 3 clase implementeaza BlockingQueue pentru modelul Producer-Consumer cu metode blocante put() si take():\\n\\n1. ArrayBlockingQueue:\\n   - Bazata pe un array circular cu dimensiune STRICT FIXA specificata in constructor.\\n   - Foloseste un SINGUR lock (ReentrantLock) atat pentru operatiile de scriere (put) cat si pentru cele de citire (take).\\n   - Dezavantaj: Producatorii si consumatorii concureaza pe acelasi lock.\\n\\n2. LinkedBlockingQueue:\\n   - Bazata pe noduri inlantuite; poate fi delimitata (bounded) sau nelimitata (implicit Integer.MAX_VALUE).\\n   - Foloseste DOUA lock-uri complet separate: un takeLock pentru cititori si un putLock pentru producatori!\\n   - Producatorii si consumatorii pot rula simultan in paralel fara a se bloca reciproc (throughput superior).\\n\\n3. SynchronousQueue:\\n   - Coada cu capacitate EXACT ZERO!\\n   - Nu stocheaza niciun element; fiecare operatie put() se blocheaza pana cand un alt fir apeleaza take() pentru a prelua elementul \"mana in mana\" (Handoff pattern).\\n   - Folosita implicit in Executors.newCachedThreadPool().",
    codeSnippet: `BlockingQueue<String> queue = new LinkedBlockingQueue<>(1000);

// Thread Producer:
queue.put("task"); // Se blocheaza daca coada e plina

// Thread Consumer:
String task = queue.take(); // Se blocheaza daca coada e goala`,
    interviewTrap: "Daca folosesti LinkedBlockingQueue fara a specifica capacitatea maxima in constructor, ea devine nelimitata si poate cauza OutOfMemoryError in productie daca producatorii sunt mai rapizi decat consumatorii.",
    keyTakeaway: "LinkedBlockingQueue are 2 lock-uri separate pentru citire/scriere; ArrayBlockingQueue are 1 lock pe array fix; SynchronousQueue face handoff direct cu capacitate 0."
  },
  {
    id: "java-110",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "DelayQueue si Elementele care Expira (Delayed)",
    question: "Cum functioneaza DelayQueue si cum se utilizeaza pentru programarea task-urilor sau expirarea sesiunilor in memorie?",
    answer: "DelayQueue este o coada blocanta nelimitata bazata pe o coada de prioritati (PriorityQueue) in care elementele pot fi consumate DOAR DUPA ce a expirat timpul lor de intarziere (delay):\\n\\n1. Interfata java.util.concurrent.Delayed:\\n   - Elementele adaugate trebuie sa implementeze interfata Delayed, care extinde Comparable<Delayed>.\\n   - Necesita doua metode:\\n     - long getDelay(TimeUnit unit): Returneaza timpul ramas pana la expirare. Daca valoarea este <= 0, elementul este expirat si gata de consumat.\\n     - int compareTo(Delayed other): Sorteaza elementele in coada astfel incat cel mai apropiat element de expirare sa se afle mereu in capul cozii (head).\\n\\n2. Comportamentul metodei take():\\n   - Daca elementul din varf nu a expirat inca, apelul take() suspenda firul apelant exact pentru durata ramasa prin Condition.awaitNanos(delay), fara niciun consum de CPU (zero polling)!\\n   - Cazuri practice: Cache-uri cu TTL (Time-To-Live), retry logic cu exponential backoff, curatare automata de conexiuni idle.",
    codeSnippet: `public class ExpiringToken implements Delayed {
    private final String token;
    private final long expireTimeMillis;

    public ExpiringToken(String token, long delayMs) {
        this.token = token;
        this.expireTimeMillis = System.currentTimeMillis() + delayMs;
    }

    @Override
    public long getDelay(TimeUnit unit) {
        long diff = expireTimeMillis - System.currentTimeMillis();
        return unit.convert(diff, TimeUnit.MILLISECONDS);
    }

    @Override
    public int compareTo(Delayed o) {
        return Long.compare(this.expireTimeMillis, ((ExpiringToken) o).expireTimeMillis);
    }
}`,
    interviewTrap: "Daca getDelay() returneaza intotdeauna o valoare pozitiva din cauza unui calcul gresit, metoda take() se va bloca pentru totdeauna.",
    keyTakeaway: "DelayQueue tine elementele sortate dupa timpul de expirare si blocheaza consumatorii pana cand primul element devine eligibil."
  },
  {
    id: "java-111",
    category: "JAVA",
    difficulty: "USOR",
    title: "Comparable vs Comparator in Java",
    question: "Care este diferenta fundamentala dintre interfata java.lang.Comparable si java.util.Comparator?",
    answer: "1. Comparable<T> (Ordonare Naturala - Natural Ordering):\\n   - Definita in pachetul java.lang si implementata DIRECT in interiorul clasei de domeniu (ex: clasa Student implements Comparable<Student>).\\n   - Metoda unica: int compareTo(T o).\\n   - Ofera o singura strategie principala de sortare (ex: alfabetic dupa nume sau crescator dupa ID).\\n   - Modifica direct codul sursa al clasei.\\n\\n2. Comparator<T> (Ordonare Personalizata / Multipla):\\n   - Definita in java.util si implementata ca o clasa SEPARATA sau ca o expresie Lambda fara a modifica clasa de domeniu.\\n   - Metoda principala: int compare(T o1, T o2).\\n   - Permite definirea a zeci de criterii de sortare diferite (sortare dupa pret, dupa data crearii, dupa relevanta, descrescator).\\n   - Poate fi transmisa dinamic ca parametru la Collections.sort(list, comparator) sau Stream.sorted(comparator).",
    codeSnippet: `// 1. Comparable: ordonare naturala interna:
public class Candidate implements Comparable<Candidate> {
    private int score;
    public int compareTo(Candidate o) { return Integer.compare(this.score, o.score); }
}

// 2. Comparator: ordonari multiple externe:
Comparator<Candidate> byName = (c1, c2) -> c1.getName().compareTo(c2.getName());
candidates.sort(byName);`,
    interviewTrap: "Nu folosi scaderea simpla (return o1.score - o2.score;) pentru comparatie de numere intregi, deoarece in cazul numerelor negative mari sau a lui Integer.MIN_VALUE va aparea un Integer Overflow care inverseaza complet rezultatul!",
    keyTakeaway: "Comparable defineste ordinea naturala implicita a clasei; Comparator defineste strategii multiple de sortare externa."
  },
  {
    id: "java-112",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Compunerea Avansata de Comparatori in Java 8+",
    question: "Cum folosesti metodele statice si default din Comparator (comparing, thenComparing, nullsLast) pentru sortari complexe multi-nivel?",
    answer: "Incepand cu Java 8, interfata Comparator ofera un Fluent API declarativ extrem de puternic:\\n\\n1. Comparator.comparing(Function<T, U>):\\n   - Extrage cheia de comparatie folosind un Method Reference (ex: Comparator.comparing(Person::getLastName)).\\n\\n2. thenComparing(Function<T, U>):\\n   - Adauga un al doilea criteriu de departajare (secondary sort) daca primul criteriu returneaza egalitate (0).\\n   - Poti inlantui oricate criterii succesive.\\n\\n3. reversed():\\n   - Inverseaza complet ordinea comparatorului compus pana in acel punct.\\n\\n4. Comparator.nullsFirst() si Comparator.nullsLast():\\n   - Protejeaza impotriva exceptiilor NullPointerException plasand elementele null la inceputul sau la sfarsitul colectiei sortate.",
    codeSnippet: `// Sortare multi-nivel: Dupa Departament descrescator, apoi Nume crescator, cu null-uri la final:
Comparator<Employee> complexComparator = Comparator
    .comparing(Employee::getDepartment, Comparator.nullsLast(Comparator.reverseOrder()))
    .thenComparing(Employee::getLastName)
    .thenComparingInt(Employee::getAge);

employees.sort(complexComparator);`,
    interviewTrap: "Fii atent la ordinea apelarii lui reversed(): daca apelezi .reversed() la sfarsitul unui lant cu thenComparing, va inversa DOAR ultimul comparator secundar, nu intregul lant!",
    keyTakeaway: "Comparator.comparing().thenComparing() elimina sute de linii de cod boilerplate pentru sortari multi-criteriale."
  },
  {
    id: "java-113",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Collections.unmodifiableList vs List.copyOf vs List.of (Java 9+)",
    question: "Care sunt diferentele subtile de imutabilitate si comportament intre Collections.unmodifiableList(), List.of() si List.copyOf()?",
    answer: "1. Collections.unmodifiableList(list):\\n   - Este doar un \"View\" (o masca) de citire peste lista originala.\\n   - Daca apelezi add() pe masca, arunca UnsupportedOperationException.\\n   - DAR: Daca cineva modifica lista originala (originalList.add(\"nou\")), modificarea se REFLECTA IMEDIAT si in lista nemodificabila! Nu este cu adevarat imutabila.\\n\\n2. List.of(e1, e2, e3) (Java 9):\\n   - Creeaza o colectie complet noua si cu adevarat IMUTABILA.\\n   - Nu accepta elemente NULL (arunca imediat NullPointerException la initializare).\\n   - Amprenta de memorie este minuscula (foloseste clase interne optimizate precum List12, fara array-uri mari).\\n\\n3. List.copyOf(collection) (Java 10):\\n   - Face o copie defensiva imutabila.\\n   - Optimizare inteligenta: Daca colectia transmisa ca parametru este deja o colectie imutabila creata cu List.of(), copyOf NU mai face nicio copiere, ci returneaza direct aceeasi referinta!",
    codeSnippet: `List<String> original = new ArrayList<>(List.of("A", "B"));
List<String> unmodifiable = Collections.unmodifiableList(original);
original.add("C"); 
System.out.println(unmodifiable.size()); // 3! (S-a modificat prin spatele view-ului!)

List<String> immutable = List.copyOf(original);
original.add("D");
System.out.println(immutable.size()); // 3! (Complet izolata si imutabila)`,
    interviewTrap: "List.of() si Set.of() resping cu strictete elementele null. Daca colectia ta contine chiar si un singur null, apeleaza ArrayList sau gestioneaza-l inainte de List.of().",
    keyTakeaway: "Collections.unmodifiableList este un view modificabil prin spatele usii; List.of si List.copyOf sunt colectii 100% imutabile."
  },
  {
    id: "java-114",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce Arrays.asList() returneaza o lista cu dimensiune fixa?",
    question: "De ce apelul Arrays.asList() arunca UnsupportedOperationException la add() si cum influenteaza modificarile array-ul sursa?",
    answer: "1. Arrays.asList(array) este o clasa interna privata:\\n   - NU returneaza o instanta obisnuita de java.util.ArrayList, ci o clasa interna privata java.util.Arrays$ArrayList.\\n   - Aceasta clasa interna este doar o \"fereastra\" (wrapper) directa peste array-ul original transmis ca parametru.\\n\\n2. Dimensiune Fixa (Fixed-Size):\\n   - Deoarece lungimea unui array primitiv in Java nu poate fi marita sau micsorata niciodata dupa alocare, metodele add() si remove() nu sunt implementate si arunca direct: UnsupportedOperationException!\\n\\n3. Mutabilitate prin set():\\n   - Poti modifica elementele existente: list.set(0, \"modificat\"). Insa atentie: modificarea se scrie direct in array-ul sursa original!",
    codeSnippet: `String[] arr = {"A", "B"};
List<String> list = Arrays.asList(arr);

list.set(0, "Z");
System.out.println(arr[0]); // Afiseaza "Z"! Array-ul original a fost modificat!

// list.add("C"); // CRASH: UnsupportedOperationException!

// Cum creezi o lista complet modificabila si independenta:
List<String> modifiable = new ArrayList<>(Arrays.asList(arr));`,
    interviewTrap: "Daca transmiti un array de primitive int[] la Arrays.asList(new int[]{1, 2}), lista rezultata va avea marimea 1 si va contine array-ul int[] ca singur element (din cauza lipsei de boxing automat pe array-uri primitive)!",
    keyTakeaway: "Arrays.asList creeaza o lista cu dimensiune fixa atasata direct de array-ul sursa; foloseste new ArrayList<>(Arrays.asList(...)) pentru liste modificabile."
  },
  {
    id: "java-115",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Sequenced Collections in Java 21",
    question: "Ce problema istorica a rezolvat introducerea colectiilor secventiate (Sequenced Collections - JEP 431) in Java 21?",
    answer: "Inainte de Java 21, Collections Framework suferea de o lipsa bizara de consistenta in accesarea primului si ultimului element:\\n- La List apelai: list.get(0) si list.get(list.size() - 1).\\n- La Deque apelai: deque.getFirst() si deque.getLast().\\n- La SortedSet apelai: set.first() si set.last().\\n- La LinkedHashSet nu exista nicio cale directa fara a parcurge un iterator complet!\\n\\nCe aduce Java 21 (Sequenced Collections):\\n- O interfata unificata SequencedCollection<E> cu semantica definita de ordonare:\\n  - E getFirst(), E getLast()\\n  - void addFirst(E e), void addLast(E e)\\n  - E removeFirst(), E removeLast()\\n  - SequencedCollection<E> reversed(): Ofera un view inversat al colectiei in timp O(1) fara nicio copiere in memorie!\\n- Interfete corespunzatoare pentru seturi si mape: SequencedSet<E> si SequencedMap<K, V> (cu firstEntry(), lastEntry(), pollFirstEntry()).",
    codeSnippet: `// Functioneaza identic pe List, Deque, LinkedHashSet si TreeSet:
SequencedCollection<String> seq = new LinkedHashSet<>(List.of("unu", "doi", "trei"));

String first = seq.getFirst(); // "unu"
String last = seq.getLast();   // "trei"

// View inversat instantaneu:
for (String s : seq.reversed()) {
    System.out.println(s); // "trei", "doi", "unu"
}`,
    interviewTrap: "Sequenced Collections este disponibila incepand cu Java 21. Mentionarea acestei noutati intr-un interviu demonstreaza ca esti la curent cu cele mai recente caracteristici ale platformei.",
    keyTakeaway: "Sequenced Collections unifica accesul la primul/ultimul element si inversarea ordonata pe toate colectiile Java 21."
  },
  {
    id: "java-116",
    category: "JAVA",
    difficulty: "USOR",
    title: "Cum inversezi o colectie in Java 21 fara copiere de memorie?",
    question: "Cum inverseaza metoda reversed() din Java 21 o colectie in timp O(1) fara sa aloce memorie suplimentara?",
    answer: "1. Abordarea Traditionala Ineficienta (Inainte de Java 21):\\n   - Collections.reverse(list): Modifica lista pe loc prin mutari succesive, sau necesita alocarea unei liste noi si parcurgerea ei inversa, avand complexitate O(N) de timp si spatiu.\\n\\n2. Abordarea Moderna prin reversed() in Java 21:\\n   - Returneaza un \"Reverse View\" (o clasa de fatada / adaptor) peste colectia existenta.\\n   - Nu copiaza niciun element si nu aloca array-uri noi (timp O(1) si spatiu O(1)).\\n   - Toate apelurile getFirst() pe view apeleaza intern getLast() pe colectia de baza, iar addFirst() pe view apeleaza addLast() pe colectia parinte!\\n   - Modificarile efectuate pe view se reflecta imediat in colectia parinte si invers.",
    codeSnippet: `List<String> list = new ArrayList<>(List.of("A", "B", "C"));
SequencedCollection<String> revView = list.reversed();

revView.addFirst("D"); // Adauga "D" ca ultim element in lista originala!
System.out.println(list); // [A, B, C, D]`,
    interviewTrap: "Nu confunda reversed() cu o operatie de sortare descrescatoare. reversed() inverseaza strict ordinea de intalnire (encounter order), indiferent daca elementele sunt sortate sau nu.",
    keyTakeaway: "reversed() creeaza un view inversat instantaneu in timp O(1) cu reflectare bidirectionala a modificarilor."
  },
  {
    id: "java-117",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "BitSet in Java: Optimizare Extrema a Spatiului pe Biti",
    question: "Ce este clasa java.util.BitSet si cum permite stocarea a 1.000.000 de flag-uri booleene in doar ~122 KB de memorie?",
    answer: "1. Problema cu boolean[] si List<Boolean>:\\n   - In Java, un tip boolean primitiv dintr-un array boolean[] ocupa fizic 1 OCTET intreg (8 biti) conform specificatiei JVM, deoarece CPU-ul nu poate adresa individual biti izolati.\\n   - Un Boolean obiect (in List<Boolean>) ocupa ~24 de octeti per instanta (header de obiect + referinta)!\\n   - Pentru 1.000.000 de flag-uri booleene, o lista consuma 24 MB de Heap!\\n\\n2. Cum optimizeaza BitSet:\\n   - BitSet stocheaza bitii compact intr-un array de numere long primitive (long[] words, unde fiecare long are 64 de biti).\\n   - Fiecare flag boolean ocupa EXACT 1 SINGUR BIT in memorie!\\n   - 1.000.000 de biti / 8 = 125.000 octeti = ~122 Kilobytes!\\n\\n3. Operatii pe Biti Masive:\\n   - Suporta operatii logice la viteza hardware intre seturi intregi de date: and(), or(), xor(), andNot(), utile pentru filtre Bloom, indecsi bitmap si mascare de permisiuni.",
    codeSnippet: `BitSet bits = new BitSet();
bits.set(100);       // Pune bitul 100 pe true (1)
bits.set(500);       // Pune bitul 500 pe true (1)

boolean isSet = bits.get(100); // true
boolean notSet = bits.get(101); // false (default 0)

int totalActive = bits.cardinality(); // 2 biti activi`,
    interviewTrap: "BitSet nu este thread-safe. Daca mai multe thread-uri modifica biti din acelasi cuvant de 64-bit fara sincronizare, actualizarile se pot suprascrie reciproc.",
    keyTakeaway: "BitSet impacheteaza 64 de valori booleene intr-un singur long primitiv, reducand consumul de RAM cu pana la 99%."
  },
  {
    id: "java-118",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Algoritmul TimSort in Arrays.sort() si Collections.sort()",
    question: "Ce algoritm de sortare foloseste Java pentru sortarea obiectelor (TimSort) si de ce este superior algoritmilor QuickSort sau MergeSort simpli?",
    answer: "Pentru primitive (int[], double[]), Java foloseste Dual-Pivot Quicksort. Pentru colectii de OBIECTE, Java foloseste TimSort (creat de Tim Peters pentru Python si adaptat in Java 7):\\n\\nDe ce este TimSort atat de eficient pe date din lumea reala:\\n1. Hibrid MergeSort + InsertionSort:\\n   - Datele reale sunt arareori complet aleatorii; adesea contin secvente deja ordonate (runs) crescatoare sau descrescatoare.\\n   - TimSort identifica aceste secvente naturale ordonate (\"runs\").\\n   - Daca o secventa este prea scurta, o extinde folosind Binary Insertion Sort (extrem de rapid pentru sub-array-uri mici de pana la 32-64 elemente).\\n\\n2. Proprietati Remarcabile:\\n   - Stabilitate Garantata: Este un algoritm STABIL (pastreaza ordinea relativa a elementelor egale, esential pentru sortari succesive dupa coloane diferite).\\n   - Complexitate O(N) in cel mai bun caz (daca datele sunt deja sortate, face doar o singura trecere) si O(N log N) in cel mai rau caz, fara a suferi de degradarea la O(N^2) a QuickSort-ului!",
    codeSnippet: `// Sortare bazata pe TimSort:
List<Candidate> list = getCandidates();
list.sort(Comparator.comparing(Candidate::getScore)); // Ruleaza TimSort garantat stabil!`,
    interviewTrap: "Daca metoda compareTo() sau Comparator-ul tau incalca regulile de tranzitivitate (ex: daca A > B si B > C, dar codul returneaza eronat C > A), TimSort va arunca la runtime: Comparison method violates its general contract!",
    keyTakeaway: "TimSort combina MergeSort si InsertionSort, fiind un algoritm stabil adaptiv cu performanta O(N) pe date partial sortate."
  },
  {
    id: "java-119",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Ce este un Spliterator si ce rol au Characteristics Flags?",
    question: "Cum functioneaza interfata Spliterator (Java 8) si cum permite impartirea paralela a datelor in Parallel Streams?",
    answer: "Spliterator (Splitable Iterator) este motorul de baza din spatele Streams API (atat secvential cat si paralel):\\n\\n1. Doua Responsabilitati Majore:\\n   - Parcurgere (Traversal): metoda tryAdvance(Consumer<T> action) consuma elementele pe rand (similar cu hasNext() + next() combinat intr-o singura operatie eficienta).\\n   - Impartire (Partitioning): metoda trySplit() imparte sursa de date in doua: returneaza un NOU Spliterator care preia o jumatate din date, in timp ce Spliterator-ul curent pastreaza cealalta jumatate! Aceasta permite executia paralela lina pe ForkJoinPool.\\n\\n2. Characteristics Flags (Optimizari Interne):\\n   - Un Spliterator emite flag-uri intregi care informeaza Streams API despre structura datelor:\\n     - SIZED: Numarul de elemente este exact cunoscut (permite alocarea perfecta de memorie la toList()).\\n     - ORDERED: Elementele au o ordine stricta.\\n     - DISTINCT: Nu exista duplicate (Stream.distinct() devine o operatie gratuita O(1) fara HashSet suplimentar!).\\n     - SORTED: Elementele sunt deja sortate (Stream.sorted() este ignorat cu zero cost!).\\n     - IMMUTABLE sau CONCURRENT: Sursa este sigura la modificari concurente.",
    codeSnippet: `Spliterator<String> spliterator1 = list.spliterator();
// Impartire pentru rulare paralela:
Spliterator<String> spliterator2 = spliterator1.trySplit();
// spliterator1 si spliterator2 pot fi procesate acum pe thread-uri diferite!`,
    interviewTrap: "Daca creezi un Custom Spliterator si marchezi eronat flag-ul DISTINCT sau SORTED fara ca datele sa respecte aceasta regula, operatiile de Streams vor returna rezultate eronate in mod silentios.",
    keyTakeaway: "Spliterator permite impartirea datelor prin trySplit() si ofera metadate (flags) pentru optimizarea automata a fluxurilor Stream."
  },
  {
    id: "java-120",
    category: "JAVA",
    difficulty: "USOR",
    title: "Collections.emptyList() vs Collections.EMPTY_LIST vs new ArrayList<>()",
    question: "Care este diferenta de siguranta si performanta intre Collections.emptyList(), campul legacy EMPTY_LIST si instantierea new ArrayList<>() cand o metoda returneaza o colectie goala?",
    answer: "Cand o metoda nu gaseste niciun rezultat, bunele practici dicteaza returnarea unei colectii goale in loc de NULL (evitand NullPointerException la apelant):\\n\\n1. new ArrayList<>() (De Evitat daca nu e nevoie de mutabilitate):\\n   - Aloca un obiect nou pe Heap si un array intern de obiecte (consum inutil de memorie si presiune pe Garbage Collector daca metoda e apelata de milioane de ori pe secunda).\\n\\n2. Collections.EMPTY_LIST (Legacy din Java 1.2):\\n   - Este un camp static partajat (Singleton), dar este un Raw Type (fara Generics)!\\n   - Genereaza avertismente de compilare (Type Safety Warning) si risca erori la runtime.\\n\\n3. Collections.emptyList() (Solutia Ideala Recomandata):\\n   - Returneaza aceeasi instanta unica Singleton imutabila partajata global (zero alocare de memorie pe Heap!).\\n   - Este Generic Type-Safe prin inferenta automata a tipului: List<User> list = Collections.emptyList();\\n   - Este strict imutabila: apelul add() va arunca UnsupportedOperationException.",
    codeSnippet: `// Bune practici: returneaza colectie imutabila singleton partajata
public List<User> findUsersByCity(String city) {
    if (city == null) {
        return Collections.emptyList(); // ZERO alocari in memorie, type-safe!
    }
    return userRepository.findByCity(city);
}`,
    interviewTrap: "Nu returna niciodata NULL cand metoda ta trebuie sa returneze o lista sau un array! Returneaza intotdeauna o colectie goala imutabila (Collections.emptyList(), Set.of() sau Map.of()).",
    keyTakeaway: "Collections.emptyList() este type-safe, complet imutabila si refoloseste un singleton global cu zero consum de memorie."
  },
  {
    id: "java-121",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "De ce parcurgerea unei matrici pe randuri este de 10x mai rapida decat pe coloane?",
    question: "De ce parcurgerea unei matrici matrix[row][col] este de pana la 10-20 de ori mai rapida decat parcurgerea pe coloane matrix[col][row] in Java?",
    answer: "Aceasta intrebare testeaza intelegerea profunda a interactiunii dintre codul Java si arhitectura hardware a procesoarelor moderne (CPU Cache Locality):\\n\\n1. Dispunerea Memoriei (Row-Major Order si Spatial Locality):\\n   - In Java, un array bidimensional este de fapt un array de array-uri, unde elementele fiecarui rand [row] sunt alocate in blocuri contigue de memorie fizica.\\n   - Cand procesorul citeste elementul matrix[0][0], el nu aduce doar 4 octeti din RAM, ci incarca o intreaga linie de cache CPU (Cache Line de 64 octeti), aducand automat si matrix[0][1], matrix[0][2], matrix[0][3] in cel mai rapid cache L1!\\n   - La urmatorul pas al buclei pe randuri, datele sunt deja prezente in cache (Cache Hit la 1 nanosecunda).\\n\\n2. Ce se intampla la parcurgerea pe coloane (Column-Major):\\n   - La fiecare iteratie, codul sare la adrese de memorie complet diferite (la urmatorul array de rand).\\n   - Fiecare acces provoaca un Cache Miss (asteptare de 50-100 nanosecunde pentru citirea din RAM-ul principal lenta), provocand o prabusire masiva a vitezei de executie.",
    codeSnippet: `// 1. ULTRA-RAPID: Parcurgere pe randuri (Spatial Cache Locality):
for (int r = 0; r < rows; r++) {
    for (int c = 0; c < cols; c++) {
        sum += matrix[r][c]; // Cache Hit continuu!
    }
}

// 2. EXTREM DE LENT: Parcurgere pe coloane:
for (int c = 0; c < cols; c++) {
    for (int r = 0; r < rows; r++) {
        sum += matrix[r][c]; // Cache Miss la fiecare pas!
    }
}`,
    interviewTrap: "Desi ambele bucle au exact aceeasi complexitate algoritmica teoretica Big-O O(N*M), diferenta de timp real pe hardware modern depaseste 1000% din cauza cache-ului L1/L2.",
    keyTakeaway: "Localitatea spatiala a cache-ului CPU face parcurgerea contigua pe randuri de 10x mai rapida decat sariturile pe coloane."
  },
  {
    id: "java-122",
    category: "JAVA",
    difficulty: "USOR",
    title: "Cum eviti ConcurrentModificationException la stergerea in bucla?",
    question: "De ce o bucla for-each obisnuita arunca ConcurrentModificationException la stergerea unui element si care sunt cele 3 solutii corecte?",
    answer: "1. De ce crapa bucla for-each (Enhanced For-Loop):\\n   - Bucla for (String s : list) este transformata la compilare intr-un Iterator.\\n   - Colectia mentine un contor intern numit modCount (incrementat la fiecare add/remove direct pe colectie).\\n   - Iteratorul retine propriul sau expectedModCount.\\n   - Daca apelezi list.remove(s) direct pe lista in interiorul buclei, modCount se schimba, iar la urmatorul iterator.next(), iteratorul detecteaza modCount != expectedModCount si arunca instantaneu: ConcurrentModificationException!\\n\\n2. Cele 3 Solutii Corecte:\\n   - Solutia 1 (Traditionala): Folosirea explicita a metodei iterator.remove(), care actualizeaza sincronizat si expectedModCount.\\n   - Solutia 2 (Moderna in Java 8+): Metoda list.removeIf(predicate) (cea mai eleganta si rapida).\\n   - Solutia 3: Filtrarea prin Streams API colectand rezultatul intr-o lista noua.",
    codeSnippet: `List<String> names = new ArrayList<>(List.of("Alex", "Ion", "Maria"));

// Solutia 1: Iterator.remove()
Iterator<String> it = names.iterator();
while (it.hasNext()) {
    if (it.next().startsWith("I")) it.remove();
}

// Solutia 2: removeIf (Recomandata in Java 8+)
names.removeIf(name -> name.startsWith("I"));`,
    interviewTrap: "Daca folosesti o colectie concurenta precum CopyOnWriteArrayList, iteratorul ei nu va arunca ConcurrentModificationException, dar nu suporta iterator.remove() (arunca UnsupportedOperationException).",
    keyTakeaway: "Nu sterge direct din colectie in timpul unei bucle for-each; foloseste list.removeIf() sau iterator.remove()."
  },
  {
    id: "java-123",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Map.computeIfAbsent() vs Map.putIfAbsent()",
    question: "Care este diferenta critica de performanta si comportament intre Map.computeIfAbsent() si Map.putIfAbsent()?",
    answer: "Diferenta esentiala tine de evaluarea Eager (imediata) vs Lazy (la cerere) a valorii:\\n\\n1. Map.putIfAbsent(key, value):\\n   - Eager Evaluation (Evaluare Imediata): Valoarea trebuie calculata si instantiata INAINTE de apelarea metodei, indiferent daca cheia exista deja sau nu in mapa!\\n   - Daca valoarea implica un calcul costisitor (un query greu in baza de date, un apel REST extern sau o alocare mare de memorie), acel calcul se va executa degeaba chiar daca cheia era deja prezenta!\\n\\n2. Map.computeIfAbsent(key, mappingFunction):\\n   - Lazy Evaluation (Evaluare Lenesa): Functia Lambda mappingFunction se executa NUMAI SI NUMAI DACA cheia lipseste sau are valoarea null in mapa!\\n   - Daca cheia exista deja, functia lambda nu este apelata deloc, economisind timp CPU si apeluri I/O pretioase.",
    codeSnippet: `// 1. INEFICIENT: expensiveDbCall() se apeleaza MEREU la putIfAbsent:
map.putIfAbsent("key", expensiveDbCall()); 

// 2. OPTIM: Lambda se executa DOAR daca "key" chiar lipseste:
map.computeIfAbsent("key", k -> expensiveDbCall());`,
    interviewTrap: "In ConcurrentHashMap, computeIfAbsent() executa functia lambda atomic sub lock-ul bucket-ului respectiv. Daca functia lambda incearca la randul sau sa acceseze sau sa modifice aceeasi mapa, va produce un Deadlock garantat!",
    keyTakeaway: "computeIfAbsent este lazy si calculeaza valoarea doar cand cheia lipseste; putIfAbsent cere valoarea deja instantiata eager."
  },
  {
    id: "java-124",
    category: "JAVA",
    difficulty: "USOR",
    title: "Map.merge() in Java 8: Contorizare si Agregare Curata",
    question: "Cum simplifica metoda Map.merge() contorizarea frecventei sau concatenarea valorilor fata de verificarile clasice cu if (containsKey)?",
    answer: "Inainte de Java 8, contorizarea aparitiilor unui cuvant intr-o mapa necesita verificari redundante (contains -> get -> put):\\n\\nCum functioneaza Map.merge(key, value, remappingFunction):\\n1. Daca cheia NU exista in mapa (sau valoarea curenta este null):\\n   - Insereaza direct noua valoare specificata in mapa.\\n2. Daca cheia EXISTA deja:\\n   - Apeleaza functia BiFunction: (oldVal, newVal) -> combinedVal si asociaza rezultatul combinat cheii respective.\\n3. Daca functia remappingFunction returneaza null:\\n   - Intrarea este stearsa automat din mapa!\\n\\nRezultat: Transforma 6 linii de cod boilerplate pline de ramificatii if intr-o singura linie atomica si expresiva.",
    codeSnippet: `Map<String, Integer> wordCounts = new HashMap<>();
List<String> words = List.of("java", "spring", "java", "docker", "java");

// Contorizare eleganta cu Map.merge():
for (String word : words) {
    wordCounts.merge(word, 1, Integer::sum);
}
// Rezultat: {spring=1, docker=1, java=3}`,
    interviewTrap: "Daca functia transmisa la merge() returneaza null, intrarea este eliminata din mapa (remove), ceea ce poate fi surprinzator daca nu cunosti specificatia.",
    keyTakeaway: "Map.merge() combina inserarea initiala cu agregarea ulterioara a valorilor existente intr-o singura operatie fluenta."
  },
  {
    id: "java-125",
    category: "JAVA",
    difficulty: "USOR",
    title: "Set.of() si Respingerea Explicita a Duplicatelor",
    question: "De ce factory method-ul Set.of(\"A\", \"A\") arunca IllegalArgumentException in loc sa ignore duplicatul ca un HashSet obisnuit?",
    answer: "1. Comportamentul lui HashSet.add(\"A\"):\\n   - Cand adaugi un element existent intr-un HashSet, metoda add() returneaza pur si simplu false si ignora operatia in mod silentios.\\n\\n2. De ce Set.of() este Strict (Fail-Fast):\\n   - Set.of(...) este folosit pentru declararea de constante imutabile direct in codul sursa (ex: Set.of(\"PENDING\", \"APPROVED\", \"REJECTED\")).\\n   - Daca un dezvoltator scrie Set.of(\"ADMIN\", \"USER\", \"ADMIN\"), existenta duplicatului este aproape intotdeauna un BUG de logica, o greseala de copy-paste sau o neintelegere a setului de date!\\n   - Designerii limbajului Java (Brian Goetz et al.) au decis ca aruncarea imediata a unei exceptii IllegalArgumentException este mult mai sigura decat ignorarea tacuta a erorii de programare.",
    codeSnippet: `// Arunca IllegalArgumentException la compilare/runtime:
// Set<String> roles = Set.of("ADMIN", "USER", "ADMIN"); // CRASH: duplicate element: ADMIN!

// Daca datele vin dinamic dintr-o lista si pot avea duplicate legitime, foloseste:
Set<String> safeRoles = new HashSet<>(dynamicList);`,
    interviewTrap: "Acelasi comportament strict se aplica si la Map.of(\"k1\", 1, \"k1\", 2): arunca IllegalArgumentException daca gaseste chei duplicate la initializare.",
    keyTakeaway: "Set.of() este fail-fast si refuza duplicatele la initializare pentru a prinde bug-urile de programare din fasa."
  },
  {
    id: "java-126",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Ce se intampla sub capota la un Lambda: invokedynamic vs Clase Anonime",
    question: "Cum implementeaza JVM-ul expresiile Lambda si de ce NU foloseste generarea de clase anonime clasice (MyClass$1.class)?",
    answer: "1. De ce NU s-au folosit Clase Anonime clasice:\\n   - Fiecare clasa anonima genera un fisier fizic separat pe disc (ex: App$1.class) la compilare.\\n   - La rulare, fiecare clasa trebuia incarcata de ClassLoader, verificata si stocata in Metaspace, crescand timpul de startup si consumul de memorie.\\n   - Fiecare instantiere crea un obiect nou pe Heap (fara caching automat al instantelor stateless).\\n\\n2. Solutia Moderna: Instructiunea invokedynamic (JEP 92):\\n   - Compilatorul Java nu genereaza o clasa anonima, ci emite o singura instructiune bytecode invokedynamic catre un bootstrap method: LambdaMetafactory.metafactory().\\n   - La prima executie a expresiei lambda, JVM genereaza dinamic in memorie o clasa anonima compacta (hidden class) optimizata direct pentru acea functie.\\n   - Daca expresia lambda este \"non-capturing\" (nu captureaza variabile locale din exterior), instanta este salvata in cache ca un Singleton si refolosita la toate apelurile viitoare cu ZERO alocare de memorie pe Heap!",
    codeSnippet: `// Non-capturing lambda -> se aloca o singura data si se refoloseste:
Runnable r1 = () -> System.out.println("Hello");

// Capturing lambda -> retine variabila 'x', creeaza instanta noua la fiecare pas:
int x = 10;
Runnable r2 = () -> System.out.println(x);`,
    interviewTrap: "Daca un lambda captureaza o variabila locala din metoda, el devine \"capturing lambda\" si va crea un obiect nou la fiecare executie, crescand alocarile pe Heap.",
    keyTakeaway: "Expresiile Lambda folosesc invokedynamic si LambdaMetafactory pentru generare dinamica usoara in memorie si caching inteligent."
  },
  {
    id: "java-127",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce variabilele locale din Lambdas trebuie sa fie \"effectively final\"?",
    question: "De ce o expresie Lambda poate accesa doar variabile locale care sunt \"final\" sau \"effectively final\" in Java?",
    answer: "Aceasta restrictie tine de modelul de memorie al Java si de ciclul de viata al stivei (Stack) vs Heap:\\n\\n1. Cum captureaza Lambda variabilele locale (Variable Capture):\\n   - O variabila locala simpla (ex: int count = 0;) traieste exclusiv pe STIVA (Stack Frame) a metodei curente.\\n   - O expresie Lambda poate fi trimisa pe alt fir de executie sau salvata intr-un camp pentru a fi executata mai tarziu, mult dupa ce metoda originala s-a incheiat si cadrul sau de stiva a fost distrus!\\n   - Prin urmare, Lambda nu poate retine adresa de pe stiva; el face o COPIE a valorii variabilei pe Heap.\\n\\n2. De ce trebuie sa fie neschimbata (effectively final):\\n   - Daca Java ar permite modificarea variabilei in lambda sau in metoda (count++), ar aparea o iluzie ca cele doua parti modifica aceeasi variabila, cand in realitate ar exista o copie pe Heap si una pe Stiva!\\n   - Pentru a preveni desincronizarea si erorile concurente de memorie, Java impune ca variabila sa nu fie niciodata reatribuita dupa initializare.",
    codeSnippet: `int factor = 2; // effectively final (nu este reatribuita nicaieri)
List<Integer> list = List.of(1, 2, 3);
list.stream().map(n -> n * factor).forEach(System.out::println);

// factor = 3; // Daca de-comentezi asta, linia de mai sus crapa la compilare!`,
    interviewTrap: "Poti ocoli tehnic restrictia folosind un array de un singur element int[] wrapper = {0}; sau AtomicInteger, dar aceasta practica poate introduce race conditions ascunse in medii multi-threaded.",
    keyTakeaway: "Lambda primeste o copie a variabilei locale de pe stiva; pentru a evita inconsistentele, Java cere ca variabila sa fie effectively final."
  },
  {
    id: "java-128",
    category: "JAVA",
    difficulty: "USOR",
    title: "Cele 4 Tipuri de Method References in Java",
    question: "Care sunt cele 4 forme de Method References in Java (operatorul ::) si cum se mapeaza fiecare pe o expresie Lambda?",
    answer: "Method References sunt prescurtari compacte si lizibile pentru expresii Lambda care nu fac altceva decat sa redirectioneze parametrii catre o metoda existenta:\\n\\n1. Referinta la o metoda statica (ContainingClass::staticMethod):\\n   - Lambda: (s) -> Integer.parseInt(s)\\n   - Method Ref: Integer::parseInt\\n\\n2. Referinta la o metoda de instanta a unui obiect existent (containingObject::instanceMethod):\\n   - Lambda: (s) -> System.out.println(s)\\n   - Method Ref: System.out::println\\n\\n3. Referinta la o metoda de instanta a unui obiect de un tip arbitrar (ContainingType::methodOnFirstParam):\\n   - Primul parametru devine instanta (target-ul) pe care se apeleaza metoda, iar restul parametrilor devin argumente!\\n   - Lambda: (str) -> str.toUpperCase()\\n   - Method Ref: String::toUpperCase\\n   - Lambda cu 2 parametri: (str, prefix) -> str.startsWith(prefix) => String::startsWith\\n\\n4. Referinta la un Constructor (ClassName::new):\\n   - Lambda: () -> new ArrayList<>()\\n   - Method Ref: ArrayList::new",
    codeSnippet: `// 1. Static:
Function<String, Integer> f1 = Integer::parseInt;
// 2. Bound Instance:
Consumer<String> f2 = System.out::println;
// 3. Unbound Type:
Function<String, String> f3 = String::toLowerCase;
// 4. Constructor:
Supplier<List<String>> f4 = ArrayList::new;`,
    interviewTrap: "Fii atent la tipul 3 (Unbound Instance): String::compareTo primeste doi parametri (s1, s2) si apeleaza s1.compareTo(s2). Primul parametru din lambda devine intotdeauna receptorul apelului.",
    keyTakeaway: "Operatorul :: simplifica lambda-urile redirectand parametrii catre metode statice, metode de instanta sau constructori."
  },
  {
    id: "java-129",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "map() vs flatMap() in Streams API",
    question: "Care este diferenta conceptuala si functionala intre Stream.map() si Stream.flatMap() si cand este flatMap() obligatoriu?",
    answer: "1. Stream.map(Function<T, R>):\\n   - Relatie 1-la-1 (One-to-One Mapping).\\n   - Fiecare element de intrare T este transformat intr-un SINGUR element de iesire R.\\n   - Exemplu: dintr-un User extragi un String (username).\\n   - Daca functia de transformare returneaza o lista sau un alt Stream (ex: user.getOrders()), map() va produce un flux imbricat: Stream<List<Order>>!\\n\\n2. Stream.flatMap(Function<T, Stream<R>>):\\n   - Relatie 1-la-Multi (One-to-Many Mapping) cu Aplatizare (Flattening).\\n   - Fiecare element genereaza un flux de elemente, iar flatMap DESPACHETEAZA (aplatizeaza) toate aceste sub-fluxuri intr-un singur flux continuu unificat Stream<Order>!\\n   - Eliminarea containerelor imbricate: Transforma List<List<T>> intr-un singur List<T>.",
    codeSnippet: `List<Order> orders1 = List.of(new Order(1), new Order(2));
List<Order> orders2 = List.of(new Order(3));
List<List<Order>> nested = List.of(orders1, orders2);

// 1. map() -> pastreaza imbricarea:
List<List<Order>> mapped = nested.stream().map(l -> l).toList();

// 2. flatMap() -> aplatizeaza intr-o singura lista de 3 elemente:
List<Order> flat = nested.stream()
    .flatMap(Collection::stream)
    .toList(); // [Order(1), Order(2), Order(3)]`,
    interviewTrap: "Daca ai un Optional<User> si apelezi o metoda care returneaza un alt Optional<Address>, foloseste optional.flatMap(User::getAddress) pentru a evita tipul Optional<Optional<Address>>.",
    keyTakeaway: "map transforma 1-la-1; flatMap transforma 1-la-multi si aplatizeaza fluxurile imbricate intr-un singur flux liniar."
  },
  {
    id: "java-130",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Stream.reduce() vs Stream.collect(): Imutabil vs Mutabil",
    question: "De ce Stream.collect() este preferat in locul lui Stream.reduce() pentru acumularea elementelor in colectii (liste, seturi)?",
    answer: "Diferenta esentiala tine de eficienta alocarii de memorie si conceptul de \"Mutable Reduction\":\\n\\n1. Stream.reduce() (Reducere Imutabila):\\n   - Este conceput pentru operatii matematice imutabile pe valori primitive sau scalare (ex: suma, produs, minim, maxim, concatenare usoara).\\n   - La fiecare pas de reducere, functia returneaza o valoare NOUA.\\n   - Daca ai incerca sa acumulezi intr-o lista folosind reduce(), la FIECARE element din stream ar trebui sa aloci o lista noua, sa copiezi toate elementele anterioare si sa adaugi noul element (complexitate O(N^2) si mii de liste alocate in Heap)!\\n\\n2. Stream.collect() (Reducere Mutabila):\\n   - Este conceput specific pentru containere mutabile (ArrayList, HashSet, StringBuilder).\\n   - Mentine un container existent si apeleaza pe loc metoda de mutatie (ex: list.add(x)) fara nicio copiere suplimentara (complexitate O(N) si o singura alocare).\\n   - In rulari paralele, colecteaza bucati partiale pe fiecare fir si le imbina eficient prin combiner.",
    codeSnippet: `// 1. reduce() este ideal pentru primitive / valori unice:
int sum = numbers.stream().reduce(0, Integer::sum);

// 2. collect() este ideal pentru colectii mutabile:
List<String> list = names.stream()
    .filter(s -> s.length() > 3)
    .collect(Collectors.toList());`,
    interviewTrap: "Nu folosi reduce((acc, item) -> { acc.add(item); return acc; }), deoarece incalca specificatia functionala pura a lui reduce() si produce corupere de date in stream-uri paralele.",
    keyTakeaway: "reduce() este pentru agregari matematice imutabile; collect() este pentru acumulare eficienta in containere mutabile."
  },
  {
    id: "java-131",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Collectors.groupingBy() cu Downstream Collectors",
    question: "Cum realizezi grupari avansate multi-nivel in Java Streams folosind Collectors.groupingBy() si Downstream Collectors?",
    answer: "Collectors.groupingBy() este echivalentul clauzei GROUP BY din SQL aplicata peste obiecte in memorie:\\n\\n1. groupingBy(classifier) simplu:\\n   - Grupeaza dupa o cheie si plaseaza obiectele intr-o mapa de tip Map<K, List<T>>.\\n\\n2. groupingBy cu Downstream Collector (groupingBy(classifier, downstream)):\\n   - In loc sa pastreze pur si simplu lista de obiecte, aplica o a doua operatie de transformare sau agregare direct pe valorile din fiecare grup!\\n   - Exemple de Downstream Collectors:\\n     - Collectors.counting(): Calculeaza numarul de elemente din fiecare categorie (Map<Department, Long>).\\n     - Collectors.summingDouble(): Calculeaza suma unui camp (ex: total salarii per departament).\\n     - Collectors.mapping(): Extrage doar anumite proprietati (ex: Map<Department, List<String>> cu numele angajatilor).\\n     - Collectors.groupingBy() imbricat: Creeaza o grupare pe 2 nivele (Map<Country, Map<City, List<User>>>).",
    codeSnippet: `// Calcul total salarii per departament:
Map<Department, Double> salaryPerDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.summingDouble(Employee::getSalary)
    ));

// Extragere doar lista de email-uri per rol:
Map<Role, Set<String>> emailsPerRole = users.stream()
    .collect(Collectors.groupingBy(
        User::getRole,
        Collectors.mapping(User::getEmail, Collectors.toSet())
    ));`,
    interviewTrap: "Daca ai nevoie de o mapa sortata (TreeMap) ca rezultat al gruparii, transmite un MapFactory ca al doilea parametru: groupingBy(classifier, TreeMap::new, downstream).",
    keyTakeaway: "Downstream collectors permit agregari SQL puternice (count, sum, maxBy, map) direct in interiorul gruparilor groupingBy."
  },
  {
    id: "java-132",
    category: "JAVA",
    difficulty: "USOR",
    title: "Collectors.partitioningBy(): Impartirea in Doua Categorii Booleene",
    question: "Ce este Collectors.partitioningBy(), prin ce difera de groupingBy() si de ce este mai eficienta cand conditia este un Predicate?",
    answer: "1. Ce este partitioningBy(Predicate<T>):\\n   - Este un caz special si optimizat de grupare unde cheia este INTOTDEAUNA un boolean (true sau false).\\n   - Imparte intregul flux in exact doua categorii: cele care indeplinesc conditia si cele care nu o indeplinesc.\\n   - Returneaza garantat o mapa de tip Map<Boolean, List<T>> (sau Downstream type).\\n\\n2. De ce este superioara lui groupingBy in acest caz:\\n   - Este mult mai rapida deoarece mapa rezultata contine intotdeauna exact doua intrari pre-alocate: Boolean.TRUE si Boolean.FALSE.\\n   - Garanteaza ca ambele chei (true si false) vor exista in mapa chiar daca una din categorii nu are niciun element (returneaza o lista goala, niciodata null).\\n   - groupingBy ar omite complet cheia daca nu exista elemente corespunzatoare.",
    codeSnippet: `List<Candidate> candidates = getCandidates();

// Partitionare candidati Admis (scor >= 70) vs Respins:
Map<Boolean, List<Candidate>> passFail = candidates.stream()
    .collect(Collectors.partitioningBy(c -> c.getScore() >= 70));

List<Candidate> passed = passFail.get(true);
List<Candidate> failed = passFail.get(false);`,
    interviewTrap: "Daca folosesti groupingBy cu o functie care returneaza boolean, mapa poate sa nu contina cheia false daca toate elementele au fost true, obligandu-te la verificari suplimentare de null.",
    keyTakeaway: "partitioningBy este optimizata pentru clasificari booleene si garanteaza prezenta cheilor true si false in mapa rezultat."
  },
  {
    id: "java-133",
    category: "JAVA",
    difficulty: "USOR",
    title: "Collectors.toMap() si Rezolvarea Coliziunilor de Chei",
    question: "Ce exceptie arunca Collectors.toMap() la aparitia unor chei duplicate si cum se rezolva coliziunea folosind mergeFunction?",
    answer: "1. Problema cu varianta simpla Collectors.toMap(keyMapper, valueMapper):\\n   - Daca doua obiecte din stream produc aceeasi cheie, metoda NU suprascrie valoarea in mod silentios, ci arunca direct: java.lang.IllegalStateException: Duplicate key!\\n   - Aceasta este una dintre cele mai frecvente erori neasteptate in productie la procesarea datelor din fisiere sau DB.\\n\\n2. Solutia: Al treilea parametru Merge Function (BinaryOperator):\\n   - Specifici explicit cum sa fie tratata coliziunea intre valoarea existenta (oldVal) si valoarea nou sosita (newVal):\\n     - Pastreaza prima valoare: (existing, incoming) -> existing\\n     - Suprascrie cu noua valoare: (existing, incoming) -> incoming\\n     - Aduna valorile: Integer::sum\\n\\n3. Al patrulea parametru Map Factory:\\n   - Permite specificarea tipului de mapa dorit (ex: LinkedHashMap::new pentru pastrarea ordinii sau TreeMap::new pentru sortare).",
    codeSnippet: `List<User> users = List.of(new User("alex", 10), new User("alex", 25));

// Rezolvare coliziune: pastreaza scorul cel mai mare:
Map<String, Integer> userScores = users.stream()
    .collect(Collectors.toMap(
        User::getUsername,
        User::getScore,
        (oldScore, newScore) -> Math.max(oldScore, newScore), // Merge function!
        LinkedHashMap::new                                   // Map factory!
    ));`,
    interviewTrap: "Daca valueMapper returneaza null pentru vreun element din stream, toMap() arunca NullPointerException chiar daca nu exista duplicate (datorita utilizarii interne a lui Map.merge).",
    keyTakeaway: "Foloseste intotdeauna parametrul mergeFunction in Collectors.toMap() pentru a fi protejat de DuplicateKeyException."
  },
  {
    id: "java-134",
    category: "JAVA",
    difficulty: "USOR",
    title: "Operatiuni de Short-Circuiting in Streams API",
    question: "Ce sunt operatiunile de Short-Circuiting in Streams API si de ce permit procesarea eficienta a fluxurilor de dimensiuni infinite?",
    answer: "O operatie de Short-Circuiting (Scurtcircuitare) este o operatie terminala sau intermediara care NU are nevoie sa parcurga intregul stream pentru a produce rezultatul:\\n\\n1. Operatii Terminale de Short-Circuiting:\\n   - findFirst() si findAny(): Se opresc imediat ce primul element compatibil a fost gasit.\\n   - anyMatch(predicate): Se opreste imediat ce a gasit un element care returneaza true.\\n   - allMatch(predicate): Se opreste imediat ce a gasit primul element care returneaza false.\\n   - noneMatch(predicate): Se opreste imediat ce a gasit primul element care returneaza true.\\n\\n2. Operatii Intermediare de Short-Circuiting:\\n   - limit(n): Taie fluxul imediat ce au fost procesate primele n elemente.\\n   - takeWhile(predicate) (Java 9): Opreste stream-ul la primul element care nu mai respecta conditia.\\n\\n3. Aplicabilitate pe Stream-uri Infinite:\\n   - Datorita executiei Lazy, poti genera un stream infinit de numere (Stream.iterate(1, n -> n + 1)), iar aplicarea limit(10) va evalua strict primele 10 numere fara a bloca memoria.",
    codeSnippet: `// findFirst se opreste dupa primul element gasit (nu parcurge 1.000.000 de elemente!):
Optional<String> match = hugeList.stream()
    .filter(s -> s.startsWith("XYZ"))
    .findFirst();`,
    interviewTrap: "Operatia findAny() este mult mai rapida decat findFirst() pe stream-uri paralele (parallelStream), deoarece firele concurente nu trebuie sa sincronizeze ordinea originala din colectie.",
    keyTakeaway: "Short-circuiting opreste procesarea la indeplinirea conditiei, facand posibila lucrul cu date mari sau infinite."
  },
  {
    id: "java-135",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Stream.peek(): De ce este strict pentru Debugging?",
    question: "De ce documentatia oficiala Java avertizeaza ca Stream.peek() nu trebuie folosit pentru logica de afaceri si cand poate fi ignorat de JVM?",
    answer: "Stream.peek(Consumer<T>) este conceput strict pentru a permite \"aruncarea unei priviri\" (inspectare / debugging) asupra elementelor pe masura ce traverseaza pipeline-ul:\\n\\n1. De ce NU trebuie folosit pentru modificarea starii (Side-Effects):\\n   - Streams sunt proiectate conform principiilor de programare functionala pura (fara efecte secundare).\\n   - Daca folosesti peek() pentru a altera obiecte sau pentru a salva date intr-o baza de date externa, comportamentul devine impredictibil pe parallelStream.\\n\\n2. Optimizarea Compiler-ului (JIT Stream Fusion):\\n   - Incepand cu Java 9+, daca operatia terminala poate calcula rezultatul fara a evalua elementele (ex: count() pe o colectie a carei marime este deja cunoscuta din Spliterator.SIZED):\\n   - JVM-ul ELIMINA COMPLET operatiile intermediare din pipeline! Apelul peek() NU VA FI EXECUTAT DELOC!\\n   - Daca aveai logica de afaceri in peek(), ea nu se va rula niciodata.",
    codeSnippet: `// GRESIT: peek() poate sa NU se execute deloc in Java 9+!
long total = Stream.of("a", "b", "c")
    .peek(s -> logToDatabase(s)) // Poate fi optimizat si sarit complet de JVM!
    .count();

// CORECT: foloseste forEach terminal daca vrei actiuni explicite:
Stream.of("a", "b", "c").forEach(this::logToDatabase);`,
    interviewTrap: "Intrebare tipica de interviu: \"Va afisa codul de mai sus ceva in consola?\". Daca stream-ul este sized si operatia este count(), raspunsul corect este: nu, in Java 9+ peek() este sarit complet.",
    keyTakeaway: "Stream.peek() este strict pentru diagnostic; JVM il poate optimiza si ignora complet daca operatia terminala nu necesita parcurgerea."
  },
  {
    id: "java-136",
    category: "JAVA",
    difficulty: "USOR",
    title: "Stream-uri Infinite in Java: Stream.iterate() si Stream.generate()",
    question: "Cum creezi fluxuri infinite de date folosind Stream.iterate() si Stream.generate() si cum eviti buclele infinite?",
    answer: "Java permite crearea de secvente infinite evaluate lenes (Lazy Evaluation):\\n\\n1. Stream.generate(Supplier<T>):\\n   - Produce un stream infinit unde fiecare element este generat independent de un Supplier (stateless).\\n   - Exemple: generare de numere aleatorii, UUID-uri, timestamp-uri.\\n\\n2. Stream.iterate(seed, UnaryOperator<T>):\\n   - Produce un stream infinit unde fiecare element nou este calculat pe baza elementului anterior (f(f(seed))).\\n   - Exemplu clasic: sirul numerelor pare, sirul lui Fibonacci.\\n   - In Java 9, iterate a primit si o varianta cu 3 parametri: Stream.iterate(seed, hasNextPredicate, nextOperator), care actioneaza exact ca o bucla for traditionala si se opreste singur!\\n\\n3. Evitarea Buclelor Infinite:\\n   - Orice stream infinit creat fara predicat TREBUIE limitat printr-o operatie de short-circuiting precum .limit(n) inainte de operatia terminala.",
    codeSnippet: `// 1. Generare 10 numere pare:
List<Integer> evens = Stream.iterate(0, n -> n + 2)
    .limit(10)
    .toList();

// 2. Varianta cu predicat de oprire (Java 9):
List<Integer> bounded = Stream.iterate(0, n -> n < 20, n -> n + 2).toList();

// 3. Generare UUID-uri infinite:
Stream<UUID> uuids = Stream.generate(UUID::randomUUID);`,
    interviewTrap: "Daca incerci sa aplici sorted() sau toList() direct pe un stream infinit fara a folosi limit(), programul va intra intr-o bucla infinita si va crapa cu OutOfMemoryError.",
    keyTakeaway: "Stream.generate pentru elemente independente; Stream.iterate pentru secvente recursive; limiteaza intotdeauna cu limit()."
  },
  {
    id: "java-137",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Stream-uri Primitive: IntStream, LongStream si DoubleStream",
    question: "De ce este recomandata utilizarea lui IntStream in loc de Stream<Integer> pentru calcule numerice intensive?",
    answer: "Stream<Integer> foloseste tipul de referinta Integer (obiect), in timp ce IntStream lucreaza direct pe tipul primitiv int pe 32 de biti:\\n\\n1. Costul de Boxing si Unboxing:\\n   - Intr-un Stream<Integer> cu 10.000.000 de numere, fiecare operatie matematica necesita despachetarea obiectului Integer (unboxing), efectuarea calculului si impachetarea rezultatului intr-un nou obiect Integer pe Heap (boxing).\\n   - Consuma cantitati uriase de memorie si produce garbage masiv pentru GC.\\n\\n2. IntStream (Zero Overhead pe Heap):\\n   - Toate operatiile au loc direct pe stiva si in registrele CPU (instructiuni native ultra-rapide SIMD).\\n   - Este de pana la 5-10 ori mai rapid decat Stream<Integer>.\\n\\n3. Metode Utile Dedicate:\\n   - IntStream ofera metode de agregare directe absente pe Stream generic: .sum(), .average(), .min(), .max(), .summaryStatistics().\\n   - Generare de intervale: IntStream.range(0, 100) si IntStream.rangeClosed(1, 100).",
    codeSnippet: `// Ineficient (boxing/unboxing pe 1 milion de obiecte):
// Stream<Integer> s = ...;

// Eficient: conversie la IntStream nativ:
int totalAge = employees.stream()
    .mapToInt(Employee::getAge) // Devine IntStream!
    .sum();                     // Operatie atomica directa`,
    interviewTrap: "Daca ai nevoie sa convertesti un IntStream inapoi intr-un Stream<Integer> de obiecte (ex: pentru toList()), foloseste metoda .boxed().",
    keyTakeaway: "IntStream elimina costul de boxing/unboxing, oferind calcule numerice de 10x mai rapide si metode directe precum sum() si average()."
  },
  {
    id: "java-138",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Cum construiesti un Custom Collector in Java?",
    question: "Care sunt cele 5 componente definite in interfata Collector<T, A, R> si cum implementezi un colector personalizat?",
    answer: "Interfata java.util.stream.Collector<T, A, R> defineste modul in care elementele de tip T sunt acumulate intr-un container intermediar A si transformate in rezultatul final R:\\n\\nCele 5 Metode Obligatorii ale interfetei:\\n1. supplier(): Retine o functie Supplier<A> care creeaza un container nou gol de acumulare (ex: () -> new StringBuilder()).\\n2. accumulator(): Retine un BiConsumer<A, T> care adauga un element T in containerul de acumulare A (ex: (sb, str) -> sb.append(str)).\\n3. combiner(): Retine un BinaryOperator<A> care imbina doua containere partiale de acumulare rezultate din rulari paralele pe thread-uri diferite (ex: (sb1, sb2) -> sb1.append(sb2)).\\n4. finisher(): Retine o Function<A, R> care transforma containerul intermediar in rezultatul final (ex: StringBuilder::toString, sau Function.identity() daca A == R).\\n5. characteristics(): Returneaza un Set de flag-uri (CONCURRENT, UNORDERED, IDENTITY_FINISH) pentru optimizari interne.",
    codeSnippet: `// Custom Collector simplificat folosind Collector.of():
Collector<String, StringBuilder, String> customJoining = Collector.of(
    StringBuilder::new,                    // 1. Supplier
    (sb, s) -> sb.append(s).append(", "), // 2. Accumulator
    StringBuilder::append,                 // 3. Combiner
    sb -> sb.toString(),                   // 4. Finisher
    Collector.Characteristics.IDENTITY_FINISH // 5. Characteristics
);`,
    interviewTrap: "Daca marchezi IDENTITY_FINISH, metoda finisher() nu va fi apelata niciodata de JVM, iar containerul A este convertit fortat prin cast la R. Asigura-te ca A este compatibil cu R daca folosesti acest flag.",
    keyTakeaway: "Un Custom Collector este definit prin: supplier (creare), accumulator (adaugare), combiner (unire paralela) si finisher (rezultat final)."
  },
  {
    id: "java-139",
    category: "JAVA",
    difficulty: "USOR",
    title: "Optional.orElse() vs Optional.orElseGet()",
    question: "Care este diferenta critica de comportament si performanta intre orElse() si orElseGet() in clasa Optional?",
    answer: "Diferenta esentiala este identica cu cea dintre evaluarea Eager si Lazy:\\n\\n1. orElse(T other):\\n   - Eager Evaluation (Evaluare Imediata): Valoarea din orElse(...) este calculata si instantiata INTOTDEAUNA, chiar daca Optional-ul contine deja o valoare valida!\\n   - Daca parametrul este un apel de metoda (ex: orElse(createDefaultUser())), acea metoda va fi apelata la FIECARE executie, irosind timp CPU, conexiuni DB sau generand duplicate in baza de date!\\n\\n2. orElseGet(Supplier<T> supplier):\\n   - Lazy Evaluation (Evaluare Lenesa): Functia Supplier se executa NUMAI SI NUMAI DACA Optional-ul este gol (empty)!\\n   - Daca valoarea este prezenta, functia lambda nu este apelata deloc.\\n\\n3. Regula de Interviu:\\n   - Foloseste orElse() doar pentru constante deja existente in memorie (ex: orElse(\"UNKNOWN\") sau orElse(0)).\\n   - Foloseste orElseGet() pentru orice implica apel de metoda, alocare de obiect nou sau operatie I/O.",
    codeSnippet: `Optional<User> opt = Optional.of(currentUser);

// GRESIT: apelul catre DB se executa MEREU, chiar daca currentUser exista!
User u1 = opt.orElse(userRepository.fetchDefaultUser());

// CORECT: apelul catre DB se executa DOAR daca opt este gol:
User u2 = opt.orElseGet(() -> userRepository.fetchDefaultUser());`,
    interviewTrap: "Un bug frecvent de junior in Spring Boot este: opt.orElse(userRepository.save(new User())). Chiar daca userul exista, codul salveaza un user nou in baza de date la fiecare apel!",
    keyTakeaway: "orElse evalueaza mereu valoarea; orElseGet primeste un Supplier si se executa doar daca Optional-ul este gol."
  },
  {
    id: "java-140",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Optional.flatMap(): Rezolvarea Imbricarilor de Optionale",
    question: "Cum elimina Optional.flatMap() problema obiectelor imbricate de tip Optional<Optional<T>> la navigarea prin proprietati optionale?",
    answer: "Cand modelezi obiecte de domeniu unde anumite relatii sunt optionale (ex: un User poate avea sau nu un Address, iar un Address poate avea sau nu un ZipCode):\\n\\n1. Problema cu Optional.map():\\n   - Daca user.getAddress() returneaza Optional<Address>:\\n   - Apelul optUser.map(User::getAddress) va produce un tip de cosmar imbricat: Optional<Optional<Address>>!\\n   - Pentru a ajunge la date, ar trebui sa faci multiple verificari si apeluri .get().get().\\n\\n2. Solutia: Optional.flatMap():\\n   - Daca functia de mapare returneaza deja un Optional, flatMap DESPACHETEAZA automat valoarea interioara, returnand un simplu Optional<Address> unificat.\\n   - Permite inlantuiri sigure si lizibile prin graful de obiecte fara niciun if (null) sau NullPointerException.",
    codeSnippet: `public record Address(Optional<String> street) {}
public record User(Optional<Address> address) {}

Optional<User> userOpt = Optional.of(user);

// Navigare sigura prin flatMap:
Optional<String> street = userOpt
    .flatMap(User::address)   // Transforma din Optional<User> in Optional<Address>
    .flatMap(Address::street); // Transforma in Optional<String>`,
    interviewTrap: "Daca functia ta returneaza o valoare simpla T (nu un Optional), foloseste map(). Daca functia returneaza Optional<T>, foloseste flatMap().",
    keyTakeaway: "Optional.flatMap() aplatizeaza containerele imbricate Optional<Optional<T>> intr-un singur Optional simplu."
  },
  {
    id: "java-141",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce Optional nu este Serializable si nu se foloseste in Entitati JPA?",
    question: "De ce clasa Optional nu implementeaza java.io.Serializable si de ce este o eroare grava sa o folosesti ca tip de camp intr-o entitate JPA/Hibernate?",
    answer: "1. Intentia de Design a lui Optional (Brian Goetz):\\n   - Optional a fost creat strict ca un tip de RETURNARE din metode pentru a semnaliza clar apelantului ca rezultatul poate lipsi.\\n   - Nu a fost conceput niciodata sa fie folosit ca variabila membru (camp) intr-o clasa sau ca parametru de intrare intr-o metoda.\\n\\n2. De ce NU implementeaza Serializable:\\n   - Designerii Java au decis intentionat sa nu faca Optional serializabil pentru a descuraja folosirea lui in structuri persistente.\\n   - Daca il folosesti ca tip de camp intr-o clasa de date care este serializata peste retea (RMI, sesiune HTTP, cache Redis), aplicatia va arunca: java.io.NotSerializableException: java.util.Optional!\\n\\n3. Incompatibilitatea cu JPA / Hibernate:\\n   - Hibernate se bazeaza pe Reflection si Proxy-uri de bytecode pentru a injecta valori direct in campuri.\\n   - O coloana nullable din baza de date trebuie mapata pe tipul obiect normal (ex: private String middleName;), iar metoda getter poate returna Optional: public Optional<String> getMiddleName() { return Optional.ofNullable(middleName); }.",
    codeSnippet: `// GRESIT: Nu folosi Optional ca si camp in JPA Entity:
// @Entity class User { private Optional<String> middleName; } // CRASH!

// CORECT: Camp normal pe entitate, getter returneaza Optional:
@Entity
public class User {
    private String middleName; // JPA functioneaza nativ
    
    public Optional<String> getMiddleName() {
        return Optional.ofNullable(middleName); // Sigur pentru apelanti!
    }
}`,
    interviewTrap: "Folosirea lui Optional ca parametru in metode (ex: doSomething(Optional<User> user)) este un anti-pattern; forteaza apelantul sa impacheteze datele si poate primi el insusi valoarea null.",
    keyTakeaway: "Optional este strict pentru tipul de retur al metodelor; nu este Serializable si nu se foloseste ca si camp in clase sau entitati JPA."
  },
  {
    id: "java-142",
    category: "JAVA",
    difficulty: "USOR",
    title: "Optional.ifPresentOrElse() si Optional.or() in Java 9",
    question: "Ce imbunatatiri majore au adus metodele ifPresentOrElse() si or() clasei Optional incepand cu Java 9?",
    answer: "In Java 8, cand un Optional era gol, trebuia sa apelezi isPresent() intr-un if-else traditional, anuland stilul functional:\\n\\n1. Optional.ifPresentOrElse(Consumer, Runnable) (Java 9):\\n   - Ofera un flux complet functional If-Else:\\n     - Daca valoarea este prezenta: executa Consumer-ul cu valoarea respectiva.\\n     - Daca Optional-ul este gol: executa Runnable-ul de fallback!\\n   - Elimina complet blocurile if (opt.isPresent()) ... else ...\\n\\n2. Optional.or(Supplier<Optional<T>>) (Java 9):\\n   - Permite crearea de lanturi de fallback intre multiple surse de Optionale.\\n   - Daca primul Optional are valoare, il returneaza; daca este gol, evalueaza Supplier-ul si returneaza al doilea Optional.\\n   - Ideal pentru cautari ierarhice (ex: cauta in L1 Cache -> daca e gol cauta in Redis -> daca e gol cauta in DB).",
    codeSnippet: `// 1. ifPresentOrElse:
userOpt.ifPresentOrElse(
    user -> sendWelcomeEmail(user),
    () -> log.warn("Utilizatorul nu a fost gasit!")
);

// 2. or() - Lant de Fallback intre surse Optionale:
Optional<Product> product = findInLocalCache(id)
    .or(() -> findInRedis(id))
    .or(() -> findInDatabase(id));`,
    interviewTrap: "Nu confunda or() (care returneaza un alt Optional) cu orElse() / orElseGet() (care despacheteaza valoarea si returneaza tipul T).",
    keyTakeaway: "ifPresentOrElse ofera tratare completa functional if-else; or() permite compunerea de fallback intre multiple surse Optionale."
  },
  {
    id: "java-143",
    category: "JAVA",
    difficulty: "USOR",
    title: "Compunerea de Predicate: and(), or() si negate()",
    question: "Cum folosesti metodele default din interfata Predicate (and, or, negate) pentru a construi filtre de business dinamice si reutilizabile?",
    answer: "Interfata functional java.util.function.Predicate<T> evalueaza o conditie si returneaza boolean. In loc sa scrii conditii monolitice uriase, poti compune conditii atomice:\\n\\n1. Predicate.and(other):\\n   - Echivalentul logic al operatorului && (AND).\\n   - Scurtcircuiteaza: daca primul predicat este false, al doilea nu se mai evalueaza.\\n\\n2. Predicate.or(other):\\n   - Echivalentul logic al operatorului || (OR).\\n   - Scurtcircuiteaza: daca primul predicat este true, al doilea nu se mai evalueaza.\\n\\n3. Predicate.negate():\\n   - Echivalentul logic al operatorului ! (NOT).\\n\\n4. Predicate.not(Predicate<T>) (Java 11):\\n   - Metoda statica excelenta pentru inversarea unui method reference (ex: Predicate.not(String::isBlank)).",
    codeSnippet: `Predicate<Candidate> isAdult = c -> c.getAge() >= 18;
Predicate<Candidate> hasDegree = Candidate::hasUniversityDegree;
Predicate<Candidate> knowsJava = c -> c.getSkills().contains("Java");

// Compunere dinamica eleganta:
Predicate<Candidate> eligible = isAdult
    .and(hasDegree)
    .and(knowsJava.or(Candidate::hasExtensiveExperience));

List<Candidate> qualified = candidates.stream().filter(eligible).toList();`,
    interviewTrap: "Inainte de Java 11, pentru a nega un method reference trebuia sa scrii: filter(s -> !s.isBlank()). In Java 11+ poti folosi metoda curata: filter(Predicate.not(String::isBlank)).",
    keyTakeaway: "Predicate.and(), or() si not() permit compunerea modulara a regulilor complexe de filtrare din componente atomice."
  },
  {
    id: "java-144",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Function.andThen() vs Function.compose() in Java",
    question: "Care este diferenta in ordinea de executie intre Function.andThen() si Function.compose()?",
    answer: "Ambele metode compun doua functii matematice f si g intr-una singura, dar ordinea de executie este inversa:\\n\\n1. f.andThen(g):\\n   - Executie \"de la stanga la dreapta\": executa MAI INTAI f, iar rezultatul lui f este transmis ca input catre g.\\n   - Corespunde formulei matematice: g(f(x)).\\n\\n2. f.compose(g):\\n   - Executie \"de la dreapta la stanga\": executa MAI INTAI functia g transmisa ca parametru, iar rezultatul lui g este transmis ca input catre f.\\n   - Corespunde formulei matematice clasice de compunere a functiilor: f(g(x)).\\n\\n3. Recomandare practica:\\n   - andThen() este de regula mult mai intuitiva pentru citirea codului (urmeaza ordinea fireasca a evenimentelor: fa asta, SI APOI fa cealalta).",
    codeSnippet: `Function<Integer, Integer> multiplyBy2 = x -> x * 2;
Function<Integer, Integer> add3 = x -> x + 3;

// 1. andThen: (5 * 2) = 10 -> (10 + 3) = 13
int r1 = multiplyBy2.andThen(add3).apply(5); // 13

// 2. compose: (5 + 3) = 8 -> (8 * 2) = 16
int r2 = multiplyBy2.compose(add3).apply(5); // 16`,
    interviewTrap: "Fii foarte atent la tipurile de date de iesire si intrare: in f.andThen(g), tipul de return al lui f trebuie sa fie compatibil cu tipul de input al lui g.",
    keyTakeaway: "f.andThen(g) executa f si apoi g (g(f(x))); f.compose(g) executa g si apoi f (f(g(x)))."
  },
  {
    id: "java-145",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Ce este Currying Function in Java?",
    question: "Ce este tehnica de Currying in programarea functionala si cum se implementeaza in Java folosind interfata Function?",
    answer: "1. Ce este Currying (numit dupa matematicianul Haskell Curry):\\n   - O tehnica prin care o functie care primeste mai multi parametri (ex: f(x, y, z)) este transformata intr-o secventa de functii de UN SINGUR parametru: f(x)(y)(z).\\n   - Fiecare apel consuma primul parametru si returneaza o noua functie care asteapta urmatorul parametru.\\n\\n2. De ce este utila in Java:\\n   - Permite \"Evaluare Partiala\" (Partial Application): Poti fixa unii parametri de configurare la pornirea aplicatiei si poti transmite functia pre-configurata altor module.\\n   - Java nu are suport de sintaxa speciala pentru Currying, dar se implementeaza elegant prin functii de ordin superior (Higher-Order Functions): Function<A, Function<B, C>>.",
    codeSnippet: `// Functie Curried: calculeaza taxa pe baza cotei de TVA si a sumei:
Function<Double, Function<Double, Double>> taxCalculator = 
    rate -> amount -> amount * (1 + rate);

// Aplicare partiala: fixam cota de TVA pentru Romania (19%):
Function<Double, Double> roTax = taxCalculator.apply(0.19);

// Utilizare ulterioara in aplicatie:
double totalProduct = roTax.apply(100.0); // 119.0
double totalService = roTax.apply(250.0); // 297.5`,
    interviewTrap: "Nu abuza de Currying in codul obisnuit de afaceri; poate face stack trace-urile de erori greu de citit din cauza generarii de zeci de instante anonime de Function.",
    keyTakeaway: "Currying descompune o functie cu multi parametri intr-un lant de functii unare, permitand evaluarea partiala a parametrilor."
  },
  {
    id: "java-146",
    category: "JAVA",
    difficulty: "USOR",
    title: "Stream.takeWhile() si dropWhile() in Java 9",
    question: "Cum functioneaza metodele takeWhile() si dropWhile() introduse in Java 9 si de ce sunt mult mai eficiente decat filter() pe colectii sortate?",
    answer: "1. De ce filter() este ineficient pe colectii sortate:\\n   - Daca ai o lista sortata de 1.000.000 de numere si vrei doar numerele < 50:\\n   - filter(n -> n < 50) va verifica TOATE cele 1.000.000 de elemente pana la capat, chiar daca dupa al 50-lea element stie sigur ca restul de 999.950 sunt mai mari!\\n\\n2. Stream.takeWhile(Predicate<T>):\\n   - Preia elemente atata timp cat predicatul este TRUE.\\n   - In momentul in care intalneste PRIMUL element care returneaza false, operatia scurtcircuiteaza si OPRESTE IMEDIAT stream-ul! Pe date sortate are complexitate O(K) in loc de O(N).\\n\\n3. Stream.dropWhile(Predicate<T>):\\n   - Ignora (arunca) elementele atata timp cat predicatul este true.\\n   - La primul element care returneaza false, inceteaza ignorarea si returneaza acel element impreuna cu TOATE elementele ramase din stream.",
    codeSnippet: `List<Integer> sortedNumbers = List.of(2, 4, 6, 8, 10, 1, 3);

// takeWhile: se opreste la 10 (primele 5 elemente)
List<Integer> taken = sortedNumbers.stream()
    .takeWhile(n -> n < 10)
    .toList(); // [2, 4, 6, 8]

// dropWhile: ignora pana la 10, apoi ia restul:
List<Integer> dropped = sortedNumbers.stream()
    .dropWhile(n -> n < 10)
    .toList(); // [10, 1, 3]`,
    interviewTrap: "Daca stream-ul este neordonat (unordered), takeWhile() poate returna un subset nepredictibil de elemente. Foloseste-l intotdeauna pe stream-uri cu ordine bine definita.",
    keyTakeaway: "takeWhile opreste stream-ul la primul element care incalca conditia; dropWhile sare peste primele elemente pana la prima incalcare."
  },
  {
    id: "java-147",
    category: "JAVA",
    difficulty: "USOR",
    title: "Stream.toList() (Java 16) vs Stream.collect(Collectors.toList())",
    question: "Care este diferenta de imutabilitate si performanta intre noua metoda Stream.toList() din Java 16 si clasicul Collectors.toList()?",
    answer: "1. Stream.collect(Collectors.toList()):\\n   - Specificatia Java NU garanteaza tipul sau mutabilitatea listei returnate, desi in practica majoritatea implementarilor HotSpot returneaza un java.util.ArrayList modificabil.\\n   - Daca apelezi list.add(\"x\"), operatia va reusi, ceea ce poate duce la mutatii accidentale nedorite.\\n\\n2. Stream.toList() (Java 16+ - JEP 395):\\n   - Metoda directa adaugata direct pe interfata Stream (fara a mai importa Collectors).\\n   - Returneaza o lista complet IMUTABILA (unmodifiable list).\\n   - Orice apel add() sau set() pe lista rezultata arunca imediat UnsupportedOperationException!\\n   - Este mai rapida si consuma mai putina memorie deoarece JVM-ul foloseste o structura interna compacta de dimensiune fixa bazata direct pe numarul de elemente din stream.",
    codeSnippet: `// 1. Clasic (Java 8) - lista modificabila:
List<String> list1 = stream.collect(Collectors.toList());
list1.add("nou"); // Functioneaza!

// 2. Modern (Java 16+) - lista imutabila:
List<String> list2 = stream.toList();
// list2.add("nou"); // CRASH: UnsupportedOperationException!`,
    interviewTrap: "Daca ai nevoie neaparat de o lista modificabila la care vrei sa mai adaugi elemente ulterior in cod, Stream.toList() nu este potrivita; trebuie sa folosesti collect(Collectors.toCollection(ArrayList::new)).",
    keyTakeaway: "Stream.toList() din Java 16 este mai compacta, mai performanta si returneaza o lista strict imutabila."
  },
  {
    id: "java-148",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce nu poti reutiliza un Stream consumat?",
    question: "Ce se intampla daca apelezi doua operatii terminale pe aceeasi instanta de Stream si cum este modelat ciclul de viata al unui Stream?",
    answer: "1. Comportamentul la Reutilizare:\\n   - Un Stream in Java reprezinta o \"conducta de date de unica folosinta\" (one-time pipeline).\\n   - In momentul in care o operatie terminala (forEach, toList, count, reduce) a fost executata, stream-ul este marcat ca fiind CONSUMAT (closed/consumed).\\n   - Daca incerci sa apelezi o alta operatie intermediara sau terminala pe aceeasi instanta de stream, JVM va arunca intotdeauna: java.lang.IllegalStateException: stream has already been operated upon or closed!\\n\\n2. Ratiunea de Arhitectura:\\n   - Stream-urile nu stocheaza elemente in memorie; ele trag date din sursa (pull-based pipeline). Odata ce datele au traversat conducta, starea interna este invalidata pentru a permite colectarea resurselor de catre GC.\\n\\n3. Cum rezolvi daca ai nevoie de reutilizare:\\n   - Creeaza un Supplier<Stream<T>>: supplier.get() va instantia un stream proaspat de fiecare data cand este apelat.",
    codeSnippet: `Stream<String> stream = Stream.of("A", "B", "C");
stream.forEach(System.out::println); // Operatie terminala 1: SUCCESS
// stream.forEach(System.out::println); // CRASH: IllegalStateException!

// Solutie prin Supplier:
Supplier<Stream<String>> streamSupplier = () -> Stream.of("A", "B", "C");
streamSupplier.get().forEach(System.out::println); // OK
streamSupplier.get().filter(s -> !s.isEmpty()).count(); // OK (stream nou)`,
    interviewTrap: "Nu stoca stream-uri in variabile membru de clasa sau campuri singleton; genereaza-le local la cerere si consuma-le imediat.",
    keyTakeaway: "Un Stream poate fi consumat o singura data; apelurile multiple arunca IllegalStateException; foloseste Supplier pentru recreare."
  },
  {
    id: "java-149",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Tratarea Checked Exceptions in Expresii Lambda si Streams",
    question: "De ce interfetele functionale standard (Function, Consumer) nu permit aruncarea de Checked Exceptions si cum se rezolva aceasta problema?",
    answer: "1. Problema de Compilare:\\n   - Semnaturile metodelor din java.util.function (ex: R apply(T t)) NU declara nicio clauza throws Exception.\\n   - Daca in interiorul unui lambda apelezi o metoda care arunca o exceptie verificata (ex: IOException, SQLException, ClassNotFoundException), compilatorul refuza sa compileze codul: \"Unhandled exception type IOException\".\\n\\n2. Cele 3 Abordari de Rezolvare:\\n   - Abordarea 1 (Naiva): Prinderea cu try-catch in interiorul corpului lambda-ului si re-aruncarea sub forma de RuntimeException (ex: throw new UncheckedIOException(e)).\\n   - Abordarea 2 (Wrapper Functional): Crearea unei interfete functionale custom @FunctionalInterface ThrowingFunction<T, R, E extends Exception> si a unei functii utilitare unchecked() care converteste automat exceptia.\\n   - Abordarea 3 (Sneaky Throws - Lombok @SneakyThrows): Pacalirea compilatorului la nivel de bytecode pentru a arunca checked exceptions ca unchecked fara conversie de tip.",
    codeSnippet: `// Wrapper utilitar elegant:
@FunctionalInterface
public interface ThrowingFunction<T, R> {
    R apply(T t) throws Exception;

    static <T, R> Function<T, R> unchecked(ThrowingFunction<T, R> f) {
        return t -> {
            try { return f.apply(t); }
            catch (Exception e) { throw new RuntimeException(e); }
        };
    }
}

// Utilizare curata in Stream:
List<String> contents = filePaths.stream()
    .map(ThrowingFunction.unchecked(Files::readString))
    .toList();`,
    interviewTrap: "Daca folosesti Sneaky Throws, apelantul nu va sti ca metoda poate arunca IOException si nu va avea un bloc catch pregatit, ceea ce poate cauza crash-uri neasteptate.",
    keyTakeaway: "Interfetele functionale standard nu suporta checked exceptions; rezolva prin wrappere unchecked sau re-aruncare ca RuntimeException."
  },
  {
    id: "java-150",
    category: "JAVA",
    difficulty: "USOR",
    title: "Date & Time API (JSR-310): Instant vs LocalDateTime vs ZonedDateTime",
    question: "Care sunt diferentele intre Instant, LocalDateTime si ZonedDateTime si de ce clasele vechi Date si Calendar sunt descurajate?",
    answer: "Problemele vechiului java.util.Date:\\n- Era MUTABIL (un apel date.setTime() modifica obiectul partajat, provocand bug-uri de concurenta masive).\\n- Lunile incepeau de la 0 (0 = Ianuarie), generand erori frecvente.\\n- Nu avea concepte clare de TimeZone.\\n\\nArhitectura Moderna java.time (JSR-310, Java 8) - Toate clasele sunt STRICT IMUTABILE si THREAD-SAFE:\\n1. Instant (Timp Masina):\\n   - Reprezinta un punct precis pe linia universala a timpului UTC (secunde si nanosecunde de la Unix Epoch 1970-01-01T00:00:00Z).\\n   - Folosit pentru timestamp-uri in baze de date, evenimente Kafka si loguri de sistem.\\n2. LocalDateTime (Timp Uman fara Fus Orar):\\n   - Reprezinta data si ora din calendar (ex: 2026-10-02 14:30), dar NU STIE in ce tara sau fus orar se afla! \"14:30 in Bucuresti\" este un moment fizic complet diferit de \"14:30 in New York\".\\n   - Nu se foloseste pentru programari globale!\\n3. ZonedDateTime (Timp Uman Complet cu Fus Orar):\\n   - Include LocalDateTime + ZoneId (ex: Europe/Bucharest) + ZoneOffset (+03:00).\\n   - Trateaza automat trecerea la ora de vara/iarna (Daylight Saving Time).",
    codeSnippet: `// 1. Timp UTC masina:
Instant nowUtc = Instant.now();

// 2. Data si ora curenta cu fus orar specific:
ZonedDateTime tokyoTime = ZonedDateTime.now(ZoneId.of("Asia/Tokyo"));

// 3. Conversie sigura intre fusuri orare:
ZonedDateTime roTime = tokyoTime.withZoneSameInstant(ZoneId.of("Europe/Bucharest"));`,
    interviewTrap: "Nu salva niciodata LocalDateTime in baze de date globale daca ai utilizatori pe mai multe continente; salveaza intotdeauna Instant sau timpi in UTC.",
    keyTakeaway: "Instant este timpul universal UTC pentru masini; LocalDateTime nu are fus orar; ZonedDateTime contine reguli complete de fus si ora de vara."
  },
  {
    id: "java-151",
    category: "JAVA",
    difficulty: "USOR",
    title: "Polimorfism la Compile-Time vs Polimorfism la Runtime",
    question: "Care este diferenta dintre polimorfismul static (la compilare) si cel dinamic (la executie) in Java?",
    answer: "1. Polimorfism la Compile-Time (Static Polymorphism / Early Binding):\\n   - Realizat prin Method Overloading (Supraincarcarea metodelor).\\n   - Metode cu acelasi nume in aceeasi clasa, dar cu parametri diferiti ca numar, tip sau ordine.\\n   - Compilatorul decide EXACT care metoda va fi apelata la compilare, bazandu-se pe tipul static al referintei (instructiunea bytecode invokestatic sau invokevirtual legata din timp).\\n\\n2. Polimorfism la Runtime (Dynamic Polymorphism / Late Binding):\\n   - Realizat prin Method Overriding (Suprascrierea metodelor).\\n   - O subclasa ofera o implementare specifica pentru o metoda definita in parinte, pastrand exact aceeasi semnatura.\\n   - Decizia despre ce metoda se executa este luata la RUNTIME de JVM pe baza tipului real al obiectului instantiat pe Heap, inspectand Virtual Method Table (VTable).",
    codeSnippet: `// 1. Overloading (Compile-time):
class Calculator {
    int add(int a, int b) { return a + b; }
    double add(double a, double b) { return a + b; }
}

// 2. Overriding (Runtime):
Animal a = new Dog(); // Tip static Animal, obiect real Dog
a.sound(); // La runtime JVM apeleaza Dog.sound()!`,
    interviewTrap: "Daca o metoda este privata, final sau statica, ea NU poate fi suprascrisa (overridden) la runtime, deoarece compilatorul aplica early binding (legare timpurie).",
    keyTakeaway: "Overloading este rezolvat la compilare prin parametri; Overriding este rezolvat la executie pe baza obiectului real de pe Heap."
  },
  {
    id: "java-152",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Covariant Return Types in Java",
    question: "Ce sunt Covariant Return Types (introduse in Java 5) si cum elimina nevoia de cast-uri explicite la suprascrierea metodelor?",
    answer: "Inainte de Java 5, cand o subclasa suprascria o metoda din parinte, trebuia sa returneze EXACT acelasi tip de date declarat in parinte.\\n\\nCe sunt Covariant Return Types (Tipuri de Retur Covariante):\\n- Permite unei metode suprascrise intr-o subclasa sa declare ca tip de retur un SUBTIP (o clasa derivata) al tipului returnat de metoda din superclasa.\\n- Respecta principiul Liskov Substitution Principle (LSP): daca un client asteapta un Animal, primirea unui Dog este 100% valida.\\n- Beneficiu practic urias: Elimina cast-urile manuale urate si periculoase la apelant.",
    codeSnippet: `class Producer {
    public Object produce() { return new Object(); }
}

class StringProducer extends Producer {
    @Override
    public String produce() { // Returneaza String (subtip al lui Object) - Covariant!
        return "Hello World";
    }
}

// La apelant:
StringProducer p = new StringProducer();
String result = p.produce(); // Zero cast manual (nu mai trebuie (String) p.produce())!`,
    interviewTrap: "Covarianta se aplica DOAR tipului de retur al metodei, NU si parametrilor de intrare! Daca modifici tipul unui parametru intr-o subclasa, metoda devine un Overload, nu un Override.",
    keyTakeaway: "Covariant Return Types permit subclasei sa returneze un tip mai specific decat parintele, eliminand cast-urile redundante."
  },
  {
    id: "java-153",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce constructorul nu poate fi static, final sau abstract?",
    question: "De ce un constructor nu poate fi marcat cu modificatorii static, final sau abstract in Java?",
    answer: "Constructorul are un rol unic in limbaj: initializarea unei noi instante fizice de obiect pe Heap:\\n\\n1. De ce nu poate fi STATIC:\\n   - static inseamna ca membrul apartine clasei ca intreg si nu unei instante specifice.\\n   - Un constructor este apelat strict pentru a da nastere unei instante NOI si are acces la cuvantul cheie \"this\". Daca ar fi static, \"this\" nu ar avea sens.\\n\\n2. De ce nu poate fi FINAL:\\n   - final pe o metoda impiedica suprascrierea (overriding) ei in subclase.\\n   - Constructorii NU se mostenesc NICIODATA in Java (fiecare clasa isi defineste proprii constructori), deci conceptul de a preveni suprascrierea unui constructor este redundant si ilogic.\\n\\n3. De ce nu poate fi ABSTRACT:\\n   - abstract inseamna o metoda fara corp de implementare, destinata sa fie implementata in viitor de o subclasa.\\n   - Daca un constructor ar fi abstract, nu ar exista niciun cod pentru a initializa campurile obiectului curent!",
    codeSnippet: `// ILEGALE - nu compileaza:
// public static MyClass() {}   // ERROR: modifier static not allowed here
// public final MyClass() {}    // ERROR: modifier final not allowed here
// public abstract MyClass() {} // ERROR: modifier abstract not allowed here`,
    interviewTrap: "Constructorul poate apela alt constructor prin this(...) sau super(...), dar acest apel trebuie sa fie strict pe prima linie executabila a constructorului.",
    keyTakeaway: "Constructorul este dedicat initializarii unei instante noi pe Heap; nu are mostenire (non-final), nu e global (non-static) si cere corp (non-abstract)."
  },
  {
    id: "java-154",
    category: "JAVA",
    difficulty: "USOR",
    title: "Initializator Static vs Initializator de Instanta",
    question: "Cand se executa un bloc de initializare static (static { }) fata de un bloc de initializare de instanta ({ }) in Java?",
    answer: "1. Static Initialization Block (static { ... }):\\n   - Se executa o SINGURA DATA in intregul ciclu de viata al aplicatiei, in momentul in care clasa este incarcata si initializata de ClassLoader in Metaspace.\\n   - Se executa inainte de crearea oricarei instante de obiect si inainte de apelarea oricarei metode statice.\\n   - Folosit pentru initializarea configuratiilor globale, tabelelor constante sau incarcarea bibliotecilor native (System.loadLibrary).\\n\\n2. Instance Initialization Block ({ ... }):\\n   - Se executa la FIECARE apel al operatorului new (la fiecare instantiere a unui obiect nou pe Heap).\\n   - Se executa DUPA apelul super() al constructorului parinte, dar INAINTE de corpul constructorului curent!\\n   - Folosit rar, util pentru partajarea logicii comune intre mai multi constructori supraincarcati.",
    codeSnippet: `public class Example {
    static {
        System.out.println("1. Static Block (O singura data la Class Loading)");
    }

    {
        System.out.println("2. Instance Block (La fiecare new, inainte de constructor)");
    }

    public Example() {
        System.out.println("3. Constructor");
    }
}`,
    interviewTrap: "Daca un bloc static arunca o exceptie neverificata la runtime (RuntimeException), JVM va arunca ExceptionInInitializerError si clasa devine inutilizabila (orice apel viitor arunca NoClassDefFoundError).",
    keyTakeaway: "Blocul static ruleaza o singura data la incarcarea clasei; blocul de instanta ruleaza la fiecare nou obiect inaintea constructorului."
  },
  {
    id: "java-155",
    category: "JAVA",
    difficulty: "USOR",
    title: "Cuvantul cheie transient in Java Serialization",
    question: "Ce rol are cuvantul cheie transient in Java si ce valoare primesc campurile transient dupa deserializare?",
    answer: "1. Ce face cuvantul cheie transient:\\n   - Marcheaza un camp dintr-o clasa Serializable ca fiind EXCLUS de la procesul de serializare automata.\\n   - La salvarea obiectului intr-un flux de octeti (ObjectOutputStream) pe disc sau peste retea, campul marcat cu transient este complet ignorat.\\n\\n2. Cand se foloseste:\\n   - Campuri sensibile de securitate (parole in text clar, tokeni JWT, chei de criptare).\\n   - Resurse legate de starea procesului local care nu au sens dupa restaurare (pointeri nativi, socket-uri de retea, fisiere deschise, Thread-uri).\\n   - Campuri derivate sau de cache care pot fi recalculate usor la cerere.\\n\\n3. Ce valoare are dupa Deserializare:\\n   - Campul primeste VALOAREA IMPLICITA (default) a tipului sau de date: null pentru obiecte, 0 pentru intregi, false pentru boolean!",
    codeSnippet: `public class UserSession implements Serializable {
    private String username;
    private transient String passwordHash; // NU va fi salvat in stream!
    private transient Connection dbConn;    // Conexiunea locala nu se poate serializa
}`,
    interviewTrap: "Campurile statice (static) NU sunt serializate nici ele, dar nu din cauza lui transient, ci pentru ca apartin clasei si nu starii obiectului individual.",
    keyTakeaway: "transient exclude campurile sensibile de la serializare; la deserializare acestea revin la valoarea implicita (null/0/false)."
  },
  {
    id: "java-156",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Externalizable vs Serializable in Java",
    question: "Care este diferenta dintre interfata java.io.Serializable si java.io.Externalizable si ce cerinta stricta de constructor are Externalizable?",
    answer: "1. Serializable (Marker Interface):\\n   - Este o interfata vida (fara metode).\\n   - Foloseste mecanismul standard al JVM-ului bazat pe Reflection pentru a inspecta si serializa automat toate campurile non-transient.\\n   - Usor de folosit, dar lenta si consuma mai mult spatiu (include multe metadate despre clase si campuri).\\n\\n2. Externalizable (Control Manual Total):\\n   - Extinde Serializable si contine 2 metode obligatorii:\\n     - void writeExternal(ObjectOutput out) throws IOException;\\n     - void readExternal(ObjectInput in) throws IOException, ClassNotFoundException;\\n   - Programatorul preia controlul complet: scrie si citeste manual exact campurile dorite, in ordinea dorita.\\n   - Este de pana la 3-5 ori mai rapida si produce fluxuri binare mult mai compacte.\\n\\n3. Cerinta Stricta de Constructor:\\n   - O clasa Externalizable TREBUIE sa aiba un Constructor PUBLIC FARA PARAMETRI (public no-arg constructor)!\\n   - La deserializare, JVM instantiaza obiectul apeland acest constructor public no-arg si abia apoi apeleaza readExternal(). Fara el, arunca InvalidClassException!",
    codeSnippet: `public class Account implements Externalizable {
    private String id;
    private int balance;

    public Account() {} // OBLIGATORIU public no-arg constructor!

    @Override
    public void writeExternal(ObjectOutput out) throws IOException {
        out.writeUTF(id);
        out.writeInt(balance);
    }

    @Override
    public void readExternal(ObjectInput in) throws IOException {
        this.id = in.readUTF();
        this.balance = in.readInt();
    }
}`,
    interviewTrap: "Daca constructorul fara parametri este protected sau package-private, codul va compila fara probleme, dar va crapa catastrofal la runtime la prima deserializare cu InvalidClassException: no valid constructor.",
    keyTakeaway: "Externalizable ofera control manual prin writeExternal/readExternal si cere obligatoriu un constructor public fara parametri."
  },
  {
    id: "java-157",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Vulnerabilitati de Securitate prin Java Deserialization (RCE)",
    question: "De ce Java Deserialization este considerata una dintre cele mai periculoase vulnerabilitati si cum poate duce la Remote Code Execution (RCE)?",
    answer: "1. Cum functioneaza un Atac de Deserializare:\\n   - Metoda ObjectInputStream.readObject() citeste un flux binar primit dintr-o sursa nesigura (peste retea, dintr-un cookie sau dintr-un parametru HTTP).\\n   - In timpul deserializarii, JVM instantiaza automat obiecte si incepe sa apeleze metode speciale precum readObject(), readResolve(), sau metode de apelare a hash-ului (hashCode(), equals()) daca obiectul era cheie intr-un HashMap.\\n\\n2. Ce sunt Gadget Chains (Lanturi de Gadget-uri):\\n   - Un atacator construieste un payload format din clase legitime aflate deja pe classpath-ul aplicatiei (ex: biblioteci populare precum Apache Commons Collections, Spring, Groovy).\\n   - Prin legarea inteligenta a apelurilor intre aceste clase (Gadget Chain), executia automata a lui readObject() declanseaza in cascada un apel catre Runtime.getRuntime().exec() sau invocari dinamice de cod (Remote Code Execution - RCE)!\\n\\n3. Aparare in Productie:\\n   - Folosirea filtrelor de deserializare (Serialization Filters - JEP 290): ObjectInputFilter pentru a aproba strict o lista alba de clase permise.\\n   - Evitarea serializarii native Java; folosirea de formate textuale structurate (JSON, Protocol Buffers).",
    codeSnippet: `// Configurare filtru lista alba (Whitelist) cu ObjectInputFilter (Java 9+):
ObjectInputFilter filter = ObjectInputFilter.Config.createFilter(
    "com.ats.model.*;java.base/*;!*" // Permite doar pachetele proprii si java.base, refuza restul!
);
objectInputStream.setObjectInputFilter(filter);`,
    interviewTrap: "Joshua Bloch a afirmat in Effective Java: \"Cea mai buna cale de a te apara impotriva vulnerabilitatilor de serializare este sa nu deserializezi niciodata date nesigure\".",
    keyTakeaway: "Deserializarea nativa de date nesigure permite atacuri RCE prin Gadget Chains; protejeaza intotdeauna cu ObjectInputFilter sau JSON."
  },
  {
    id: "java-158",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce Joshua Bloch recomanda Copy Constructor in loc de clone()?",
    question: "Care sunt defectele structurale ale interfetei Cloneable si de ce este Copy Constructor-ul sau o Factory Method alternativa superioara?",
    answer: "Mecanismul java.lang.Cloneable si Object.clone() este considerat pe scara larga un accident de design in Java:\\n\\n1. Defectele Metodei clone():\\n   - Cloneable este o interfata marker, dar metoda clone() este declarata PROTECTED in Object (nu poti apela obj.clone() direct fara sa suprascrii metoda si sa o faci publica)!\\n   - Nu apeleaza niciun constructor! Creeaza obiectul prin copiere oarba de memorie la nivel de JVM, ocolind validarile din constructori si campurile final.\\n   - clone() realizeaza doar Shallow Copy; campurile mutabile referite sunt partajate periculos intre ambele instante.\\n   - Arunca CloneNotSupportedException daca ai uitat sa implementezi Cloneable.\\n\\n2. Alternativa Recomandata: Copy Constructor sau Static Factory Method\\n   - Nu arunca exceptii checked.\\n   - Este explicit, flexibil si apeleaza constructorul normal.\\n   - Suporta polimorfism de interfata (Conversion Constructor): poti transmite o interfata ca parametru (ex: new HashSet<>(otherCollection)).",
    codeSnippet: `public class Candidate {
    private String name;
    private List<String> skills;

    // Copy Constructor recomandat (Deep Copy):
    public Candidate(Candidate other) {
        this.name = other.name;
        this.skills = new ArrayList<>(other.skills); // Copie defensiva a colectiei!
    }

    // Sau Static Factory Method:
    public static Candidate newInstance(Candidate other) {
        return new Candidate(other);
    }
}`,
    interviewTrap: "Daca suprascrii clone() pe o clasa care contine campuri declarate final, nu le poti modifica in clone() pentru a face Deep Copy, deoarece campurile final pot fi atribuite exclusiv in constructor!",
    keyTakeaway: "clone() este un mecanism defectuos fara constructori; foloseste intotdeauna Copy Constructor pentru clonare sigura si lizibila."
  },
  {
    id: "java-159",
    category: "JAVA",
    difficulty: "USOR",
    title: "Nivelurile de Accesibilitate in Java: private, default, protected, public",
    question: "Care este matricea exacta de vizibilitate pentru cei 4 modificatori de acces (private, package-private, protected, public) in Java?",
    answer: "Matricea de vizibilitate controleaza incapsularea in limbajul Java:\\n\\n1. private:\\n   - Vizibil DOAR in interiorul aceleiasi clase.\\n\\n2. Default (Package-Private - fara modificator):\\n   - Vizibil in aceeasi clasa SI in toate clasele din ACELASI PACHET.\\n   - NU este vizibil in afara pachetului, chiar daca o clasa este subclasa!\\n\\n3. protected:\\n   - Vizibil in aceeasi clasa, in toate clasele din ACELASI PACHET,\\n   - SI in toate SUBCLASELE (indiferent de pachetul in care se afla subclasa)!\\n   - Atentie: o subclasa din alt pachet poate accesa membrul protected doar prin intermediul mostenirii (prin \"this\" sau \"super\"), nu pe o instanta a parintelui creata din exterior.\\n\\n4. public:\\n   - Vizibil de pretutindeni (din orice pachet si orice modul care are acces).",
    codeSnippet: `// Tabel Sintetic:
// Modificator    | Aceeasi Clasa | Acelasi Pachet | Subclasa Alt Pachet | Toata Lumea
// private        |     DA        |       NU       |          NU         |     NU
// default        |     DA        |       DA       |          NU         |     NU
// protected      |     DA        |       DA       |          DA         |     NU
// public         |     DA        |       DA       |          DA         |     DA`,
    interviewTrap: "Daca o clasa din pachetul B mosteneste o clasa din pachetul A cu un camp protected x, ea poate accesa this.x, dar NU poate accesa parentInstance.x creat cu new Parent().",
    keyTakeaway: "protected ofera acces in acelasi pachet plus tuturor subclaselor derivate prin mostenire."
  },
  {
    id: "java-160",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Metode Default in Interfete si Rezolvarea Diamond Problem",
    question: "De ce au fost introduse metodele default in Java 8 si cum se rezolva coliziunea daca o clasa implementeaza doua interfete cu aceeasi metoda default?",
    answer: "1. De ce au fost create metodele Default (Defender Methods):\\n   - Pentru Backward Compatibility (compatibilitate retroactiva): Permite adaugarea de metode noi in interfete existente (cum a fost adaugata metoda stream() sau forEach() pe interfata Collection din 1998) fara a strica milioanele de clase existente din lume care implementau interfata respectiva!\\n\\n2. Coliziunea Diamond Problem (Ambiguitatea Mostenirii Multiple):\\n   - Daca o clasa implementeaza InterfaceA si InterfaceB, si ambele contin aceeasi semnatura de metoda default (ex: default void log()):\\n   - Compilatorul Java refuza compilarea cu eroarea: \"class inherits unrelated defaults for log() from types InterfaceA and InterfaceB\".\\n\\n3. Cum se Rezolva Coliziunea:\\n   - Clasa este OBLIGATA sa suprascrie (override) metoda conflictuala si sa decida implementarea:\\n     - Fie scrie propria logica de la zero;\\n     - Fie deleaga explicit catre una dintre interfete folosind sintaxa: InterfaceA.super.log();.",
    codeSnippet: `interface InterfaceA {
    default void log() { System.out.println("Log A"); }
}
interface InterfaceB {
    default void log() { System.out.println("Log B"); }
}

class Service implements InterfaceA, InterfaceB {
    @Override
    public void log() {
        // Rezolvare explicita a conflictului:
        InterfaceA.super.log(); // Alege implementarea din A
    }
}`,
    interviewTrap: "Daca o superclasa parinte contine o metoda concreta cu aceeasi semnatura ca o metoda default dintr-o interfata, \"Clasa bate intotdeauna Interfata\" (Class Wins Rule) fara niciun conflict!",
    keyTakeaway: "Metodele default asigura evolutia interfetelor; conflictele intre doua interfete se rezolva obligatoriu prin suprascriere cu Interface.super.method()."
  },
  {
    id: "java-161",
    category: "JAVA",
    difficulty: "USOR",
    title: "Clasa Anonima vs Expresie Lambda: Diferente la nivel de this",
    question: "Care este diferenta dintre cuvantul cheie this intr-o clasa anonima interna si intr-o expresie Lambda?",
    answer: "Diferenta esentiala tine de crearea unui nou domeniu de vizibilitate (Scope):\\n\\n1. In Clasa Anonima (Anonymous Inner Class):\\n   - Clasa anonima creeaza o CLASA COMPLETA separata.\\n   - Cuvantul cheie \"this\" din interiorul clasei anonime face referire la INSTANTA CLASEI ANONIME INSESI, nu la clasa exterioara!\\n   - Pentru a accesa instanta exterioara, trebuie sa scrii: OuterClass.this.\\n\\n2. In Expresie Lambda (Lexical Scoping):\\n   - O expresie Lambda NU defineste un domeniu nou de vizibilitate pentru \"this\".\\n   - Domeniul este strict LEXICAL: cuvantul cheie \"this\" din interiorul unui lambda face referire EXACT la instanta clasei exterioare in care este scris lambda-ul!\\n   - Nu poti \"umbra\" (shadow) variabile din clasa exterioara declarand parametri cu acelasi nume in lambda.",
    codeSnippet: `public class ScopeDemo {
    public void test() {
        // 1. Clasa Anonima:
        Runnable r1 = new Runnable() {
            public void run() {
                System.out.println(this); // Afiseaza ScopeDemo$1 (clasa anonima)
            }
        };

        // 2. Lambda:
        Runnable r2 = () -> {
            System.out.println(this); // Afiseaza ScopeDemo (instanta exterioara!)
        };
    }
}`,
    interviewTrap: "Daca ai nevoie sa apelezi o metoda proprie a unei clase abstracte care implementeaza o interfata, Lambda nu poate fi folosit; ai nevoie de o clasa anonima.",
    keyTakeaway: "this intr-o clasa anonima se refera la instanta anonima; this intr-un lambda se refera la instanta clasei exterioare (lexical scope)."
  },
  {
    id: "java-162",
    category: "JAVA",
    difficulty: "USOR",
    title: "Type Inference cu var in Java 10: Unde este permis si unde este interzis?",
    question: "Unde poate fi folosit cuvantul cheie var (Local-Variable Type Inference) si unde este strict interzis in Java?",
    answer: "Introdus in Java 10 (JEP 286) pentru a reduce redundanta tipurilor lungi fara a compromite Static Typing-ul (tipul este inferat la compilare, nu la runtime ca in JS/Python):\\n\\nUnde ESTE Permis var:\\n1. Variabile locale declarate si initializate in interiorul metodelor: var list = new ArrayList<String>();\\n2. Variabile de control in bucle for-each: for (var item : items)\\n3. Resurse in blocuri try-with-resources: try (var stream = Files.newInputStream(path))\\n4. Parametri de expresii Lambda in Java 11 (pentru a aplica adnotari): (var a, @Nullable var b) -> a + b\\n\\nUnde este STRICT INTERZIS var:\\n- Campuri membru de clasa (instanta sau statice).\\n- Parametri de metoda sau tipuri de retur din metode.\\n- Variabile locale fara initializare imediata (ex: var x; // EROARE).\\n- Initializate cu null (ex: var x = null; // EROARE).\\n- Cu expresii lambda fara cast (ex: var f = x -> x + 1; // EROARE).",
    codeSnippet: `// Permis:
var users = new HashMap<String, List<Order>>(); // Tip inferat: HashMap<String, List<Order>>

// Ilegal:
// public var calculate(var input) {} // ERROR: var not allowed on method parameters/return`,
    interviewTrap: "var NU este un cuvant cheie rezervat (keyword), ci un \"reserved type name\". Asta inseamna ca poti avea variabile sau metode cu numele var (ex: int var = 5; este cod perfect legal!).",
    keyTakeaway: "var infera tipul static la compilare si este permis exclusiv pe variabile locale initializate imediat."
  },
  {
    id: "java-163",
    category: "JAVA",
    difficulty: "USOR",
    title: "Switch Expressions (Java 14): Sageata -> si cuvantul cheie yield",
    question: "Ce avantaje aduc Switch Expressions fata de traditionalul Switch Statement si cum se foloseste yield?",
    answer: "Switch Expressions (standardizate in Java 14 - JEP 361) transforma switch dintr-o simpla instructiune de control intr-o EXPRESIE care produce o valoare de retur:\\n\\n1. Sintaxa cu Sageata (Arrow Syntax ->):\\n   - Elimina complet riscul de Fall-Through (nu mai este nevoie sa pui break dupa fiecare case)!\\n   - Doar expresia din dreapta sagetii se executa.\\n   - Permite valori multiple pe aceeasi linie: case MONDAY, FRIDAY, SUNDAY -> ...\\n\\n2. Cuvantul cheie yield:\\n   - Se foloseste atunci cand o ramura case necesita un bloc cu acolade multi-linie ({ ... }).\\n   - yield returneaza valoarea din blocul case catre asignarea generala (similar cu un return dedicat switch-ului).\\n\\n3. Exhaustivitate Obligatorie (Exhaustiveness):\\n   - Cand este folosit ca expresie, switch-ul TREBUIE sa acopere toate cazurile posibile (prin acoperirea tuturor valorilor de Enum sau prin definirea obligatorie a clauzei default).",
    codeSnippet: `int numLetters = switch (day) {
    case MONDAY, FRIDAY, SUNDAY -> 6;
    case TUESDAY -> 7;
    case THURSDAY, SATURDAY -> 8;
    case WEDNESDAY -> {
        System.out.println("Ziua de mijloc a saptamanii");
        yield 9; // Returneaza 9 din blocul multi-linie!
    }
};`,
    interviewTrap: "Daca folosesti switch traditional cu doua puncte (case MONDAY:), lipsa unui break continua executia in urmatorul case (Fall-Through), in timp ce sintaxa cu sageata (->) exclude complet acest comportament.",
    keyTakeaway: "Switch expressions returneaza valori, folosesc -> fara break si yield pentru blocuri multi-linie, garantand exhaustivitatea."
  },
  {
    id: "java-164",
    category: "JAVA",
    difficulty: "USOR",
    title: "Text Blocks in Java 15: Ghilimele triple si Gestionarea Spatiilor",
    question: "Cum functioneaza Text Blocks (ghilimele triple \"\"\" \"\"\") in Java 15 si cum determina compilatorul indentarea incidentala?",
    answer: "Text Blocks (JEP 378, Java 15) permit scrierea de siruri de caractere multi-linie (JSON, SQL, HTML, XML) fara concatenari inestetice cu + si fara escape-uri obositoare pentru ghilimele (\\\\\"):\\n\\n1. Reguli Sintactice Stricte:\\n   - Un Text Block incepe cu trei ghilimele (\"\"\") urmate OBLIGATORIU de o linie noua (newline)! Nu poti pune text pe aceeasi linie cu primele trei ghilimele.\\n\\n2. Strip Indentation (Indentare Incidentala vs Esentiala):\\n   - Compilatorul Java scaneaza toate liniile din bloc pentru a gasi spatiul alb comun cel mai din stanga (inclusiv pozitia ghilimelelor de inchidere).\\n   - Acel spatiu alb comun (indentarea de cod Java) este eliminat automat (stripped)!\\n   - Daca vrei ca intregul bloc sa fie indentat in string-ul final, plasezi ghilimelele de inchidere \"\"\" mai la stanga decat textul.\\n\\n3. Caractere de Control Noi:\\n   - \\\\ la final de linie: Impiedica adaugarea caracterului newline (uneste liniile logic).\\n   - \\\\s: Forteaza pastrarea spatiilor albe de la sfarsitul liniei.",
    codeSnippet: `// Query SQL lizibil fara concatenari:
String query = """
    SELECT id, email, status
    FROM candidates
    WHERE active = true
    ORDER BY created_at DESC;
    """;`,
    interviewTrap: "Daca plasezi text imediat dupa primele ghilimele triple (\"\"\"SELECT...), compilatorul va arunca eroare de sintaxa: \"illegal text block open delimiter sequence, missing newline\".",
    keyTakeaway: "Text Blocks permit siruri multi-linie curate eliminand automat indentarea incidentala comuna din cod."
  },
  {
    id: "java-165",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Record Compact Constructor vs Canonical Constructor in Java Records",
    question: "Ce este un Compact Constructor intr-un Java Record si cum asigura validarea imutabila a campurilor fara boilerplate?",
    answer: "Java Records (Java 16) sunt clase imutabile transparente pentru transport de date (Data Carriers) care genereaza automat constructori, getteri, equals, hashCode si toString:\\n\\n1. Canonical Constructor (Constructorul Canonic):\\n   - Constructorul complet generat automat de compilator a carui lista de parametri este identica cu componentele recordului: public CandidateRecord(String name, int score) { ... }.\\n\\n2. Compact Constructor (Inovatia Cheie):\\n   - Un constructor specific recordurilor care NU DECLARA parametri si paranteze rotunde: public CandidateRecord { ... }!\\n   - Are acces direct la parametrii transmisi inainte ca acestia sa fie atribuiti campurilor private final.\\n   - Permite validari defensive si normalizari (ex: Objects.requireNonNull, toLowerCase).\\n   - La sfarsitul blocului compact, JVM atribuie automat parametrii (eventual modificati) catre campurile campurilor interne.",
    codeSnippet: `public record CandidateRecord(String name, int score) {
    // Compact Constructor: zero parametri declarati, doar validari:
    public CandidateRecord {
        Objects.requireNonNull(name, "Numele nu poate fi null");
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("Scor invalid: " + score);
        }
        name = name.trim(); // Normalizare directa inainte de atribuire!
    }
}`,
    interviewTrap: "In interiorul unui Compact Constructor nu ai voie sa faci atribuiri explicite catre this.name = ...; compilatorul se ocupa automat de atribuire la sfarsitul blocului!",
    keyTakeaway: "Compact Constructor permite validarea si normalizarea campurilor dintr-un Record fara repetarea atribuirilor this.field = field."
  },
  {
    id: "java-166",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Algebraic Data Types (ADT) cu Sealed Interfaces si Record Patterns in Java 21",
    question: "Cum permit Sealed Interfaces combinate cu Records si Record Patterns (Java 21) modelarea de Algebraic Data Types tipice limbajelor functionale?",
    answer: "In limbaje functionale precum Haskell sau Scala, Algebraic Data Types (Sum Types si Product Types) sunt fundamentale. Java 21 aduce acest suport complet:\\n\\n1. Product Types (Tipuri Produs):\\n   - Modelate prin Java Records (ex: record Point(int x, int y) - produsul a doua intregi).\\n\\n2. Sum Types (Tipuri Suma / Disjoint Unions):\\n   - Modelate prin Sealed Interfaces: interfata restrictioneaza strict cine o poate implementa (permits).\\n   - Compilatorul stie la compilare TOATE variantele posibile existente in lume!\\n\\n3. Exhaustive Pattern Matching fara clauza default:\\n   - La evaluarea unui sealed type intr-un switch expression cu Record Patterns, compilatorul verifica daca toate cazurile permise sunt tratate.\\n   - Nu mai este nevoie de clauza default! Daca in viitor cineva adauga un nou tip in permits, compilatorul va arunca eroare in toate switch-urile din aplicatie, fortand tratarea noului caz.",
    codeSnippet: `// Sealed Interface (Sum Type):
public sealed interface PaymentMethod permits CardPayment, PixPayment, CryptoPayment {}

public record CardPayment(String cardNumber, double amount) implements PaymentMethod {}
public record PixPayment(String pixKey, double amount) implements PaymentMethod {}
public record CryptoPayment(String walletAddress, double amount) implements PaymentMethod {}

// Pattern Matching exhaustiv in Java 21:
String describe(PaymentMethod pm) {
    return switch (pm) {
        case CardPayment(var num, var amt) -> "Card: " + num + " -> $" + amt;
        case PixPayment(var key, var amt)  -> "Pix: " + key + " -> $" + amt;
        case CryptoPayment(var w, var amt) -> "Crypto: " + w + " -> $" + amt;
        // Zero default! Compilatorul garanteaza acoperirea totala!
    };
}`,
    interviewTrap: "Daca adaugi o subclasa noua intr-o Sealed Hierarchy, compilatorul iti va arata imediat toate locurile din aplicatie unde lipseste logica pentru ea, eliminand bug-urile subtile de business la runtime.",
    keyTakeaway: "Sealed interfaces si Records creeaza Algebraic Data Types sigure si exhaustive verificate 100% de compilator in switch."
  },
  {
    id: "java-167",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Bill Pugh Singleton (Initialization-on-demand Holder)",
    question: "De ce idiomul Bill Pugh Singleton este considerat cea mai eleganta implementare de Singleton in Java si cum asigura thread-safety fara synchronized?",
    answer: "Multe abordari de Singleton au dezavantaje: Eager Singleton aloca memoria la pornire chiar daca nu e folosit; Double-Checked Locking este complex si predispus la erori JMM.\\n\\nSolutia lui Bill Pugh: Clasa Statica Interioara (Holder Pattern):\\n1. Cum functioneaza:\\n   - Clasa principala contine o clasa statica privata interioara (ex: SingletonHolder) care detine instanta: private static final MySingleton INSTANCE = new MySingleton();.\\n\\n2. De ce este Lazy (Lenes):\\n   - Cand clasa MySingleton este incarcata de ClassLoader, clasa interioara SingletonHolder NU ESTE INCARCATA in memorie!\\n   - SingletonHolder este incarcata strict la PRIMUL APEL al metodei getInstance(), realizand initializare lazy perfecta.\\n\\n3. De ce este Thread-Safe fara sincronizare:\\n   - Specificatia limbajului Java (JLS 12.4.2) garanteaza ca faza de initializare a unei clase este sincronizata nativ si atomic de catre JVM.\\n   - Niciun alt fir nu poate vedea instanta partial creata, eliminand orice nevoie de bloc synchronized sau volatile!",
    codeSnippet: `public class BillPughSingleton {
    private BillPughSingleton() {} // Constructor privat

    // Clasa statica se incarca DOAR cand este referita in getInstance():
    private static class InstanceHolder {
        private static final BillPughSingleton INSTANCE = new BillPughSingleton();
    }

    public static BillPughSingleton getInstance() {
        return InstanceHolder.INSTANCE; // Thread-safe garantat de JVM!
    }
}`,
    interviewTrap: "Chiar si Bill Pugh Singleton poate fi spart prin Java Reflection (setAccessible(true)) sau prin deserializare daca nu suprascrii metoda readResolve(). Singurul singleton 100% imun la reflection este Enum Singleton.",
    keyTakeaway: "Bill Pugh Singleton foloseste mecanismul de incarcare a claselor JVM pentru a asigura initializare lazy si thread-safety fara niciun lock."
  },
  {
    id: "java-168",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Double-Checked Locking pe Singleton: De ce volatile este obligatoriu?",
    question: "De ce cuvantul cheie volatile este absolut obligatoriu pe instanta intr-o implementare de tip Double-Checked Locking (DCL)?",
    answer: "Double-Checked Locking verifica daca instanta este null inainte si dupa intrarea intr-un bloc synchronized pentru a evita sincronizarea la fiecare apel:\\n\\nDe ce fara volatile este CATASTROFAL (Instruction Reordering):\\nInstructiunea Java new Singleton() NU este atomica; procesorul o descompune in 3 pasi:\\n1. Aloca spatiu de memorie in Heap pentru obiect;\\n2. Apeleaza constructorul pentru a initializa campurile obiectului;\\n3. Atribuie adresa de memorie a noului obiect catre variabila instanta.\\n\\nPericolul Reordonarii JIT/CPU:\\n- Compilatorul sau procesorul pot reordona pasii in secventa: Pas 1 -> Pas 3 -> Pas 2 (atribuie referinta INAINTE de executia constructorului)!\\n- Daca Thread 1 este la pasul 3 iar Thread 2 apeleaza getInstance(), Thread 2 gaseste instanta != null la prima verificare, sare peste lock si returneaza instanta PARTIAL INITIALIZATA (campurile sunt inca null sau 0), cauzand crash-uri masive in aplicatie!\\n\\nSolutia volatile:\\n- Introduce bariere de memorie (Memory Barriers) care interzic strict reordonarea pasului 2 si 3, garantand ca constructorul se termina inainte ca referinta sa devina vizibila altor fire.",
    codeSnippet: `public class DclSingleton {
    // volatile este OBLIGATORIU pentru a preveni Instruction Reordering!
    private static volatile DclSingleton instance;

    private DclSingleton() {}

    public static DclSingleton getInstance() {
        if (instance == null) { // Verificare 1 (fara lock pentru viteza)
            synchronized (DclSingleton.class) {
                if (instance == null) { // Verificare 2 (sub lock)
                    instance = new DclSingleton();
                }
            }
        }
        return instance;
    }
}`,
    interviewTrap: "Daca intervievatorul te intreaba: \"Functioneaza DCL corect in Java fara volatile?\", raspunsul este categoric NU (inainte de Java 5 era defectuos chiar si cu volatile din cauza vechiului JMM).",
    keyTakeaway: "volatile pe DCL impiedica reordonarea instructiunilor CPU, asigurand ca niciun thread nu vede un obiect incomplet initializat."
  },
  {
    id: "java-169",
    category: "JAVA",
    difficulty: "USOR",
    title: "Builder Pattern cu Fluent API",
    question: "Cand si de ce folosim Builder Pattern (Effective Java Item 2) in locul constructorilor telescopici sau a setterilor clasici?",
    answer: "1. Problema Constructorilor Telescopici (Telescoping Constructors):\\n   - O clasa cu multi parametri (5-10 campuri, multe optionale) necesita zeci de constructori supraincarcati: MyClass(a), MyClass(a, b), MyClass(a, b, c)...\\n   - Cod greu de citit si predispus la inversari accidentale de parametri de acelasi tip (ex: transmiterea email-ului in locul numelui fara nicio eroare la compilare).\\n\\n2. Problema JavaBeans Pattern (getters/setters):\\n   - Obiectul ramane intr-o stare inconsistenta (partial initializata) pe durata apelurilor succesive de set().\\n   - Clasa devine complet mutabila, distrugand siguranta concurenta (Thread-Safety).\\n\\n3. Avantajele Builder Pattern:\\n   - Mentine imutabilitatea: Obiectul final are doar campuri private final si nu are setteri.\\n   - Fluent API: Fiecare metoda de setare pe builder returneaza this, permitand inlantuiri declarative lizibile.\\n   - Validare atomica: Metoda build() verifica toate constrangerile de validitate inainte de a returna instanta.",
    codeSnippet: `public class HttpRequest {
    private final String url;
    private final String method;
    private final int timeout;

    private HttpRequest(Builder b) {
        this.url = b.url;
        this.method = b.method;
        this.timeout = b.timeout;
    }

    public static class Builder {
        private String url;
        private String method = "GET"; // Valoare implicita
        private int timeout = 5000;

        public Builder url(String url) { this.url = url; return this; }
        public Builder method(String method) { this.method = method; return this; }
        public Builder timeout(int t) { this.timeout = t; return this; }

        public HttpRequest build() {
            if (url == null) throw new IllegalStateException("URL obligatoriu");
            return new HttpRequest(this);
        }
    }
}`,
    interviewTrap: "Daca ai clase derivate cu mostenire, Builder-ul clasic devine complicat. Se foloseste tehnica \"Recursive Type Bounds\" (Generic Builder cu <T extends Builder<T>>) pentru a pastra polimorfismul.",
    keyTakeaway: "Builder Pattern construieste obiecte complexe imutabile pas cu pas, eliminand constructorii telescopici si inconsistentele setterilor."
  },
  {
    id: "java-170",
    category: "JAVA",
    difficulty: "USOR",
    title: "Strategy Pattern in Java Modern folosind Lambdas",
    question: "Cum a transformat aparitia expresiilor Lambda implementarea clasica a sablonului Strategy in Java?",
    answer: "1. Strategy Pattern Clasic (Inainte de Java 8):\\n   - Necesita o interfata separata (ex: PaymentStrategy) si crearea de clase concrete separate pentru fiecare strategie (CreditCardStrategy.java, PayPalStrategy.java, CryptoStrategy.java).\\n   - Mult boilerplate si fisiere de clasa mici inutile.\\n\\n2. Strategy Pattern Modern in Java 8+:\\n   - Orice strategie care are o singura metoda abstracta devine o Interfata Functionala (@FunctionalInterface)!\\n   - Poti transmite strategii diferite direct ca expresii Lambda sau Method References fara a mai crea nicio clasa suplimentara.\\n   - Strategiile pot fi stocate intr-o mapa (Map<PaymentType, Consumer<PaymentRequest>>) sau compuse dinamic la runtime.",
    codeSnippet: `// 1. Interfata functionala pentru strategie:
@FunctionalInterface
public interface DiscountStrategy {
    double applyDiscount(double price);
}

// 2. Transmitere directa prin Lambda:
DiscountStrategy blackFriday = price -> price * 0.50;
DiscountStrategy vipCustomer = price -> price * 0.80;

public double checkout(double amount, DiscountStrategy strategy) {
    return strategy.applyDiscount(amount);
}`,
    interviewTrap: "Daca strategiile contin stare interna complexa sau dependinte injectate de Spring, clasele dedicate raman potrivite; daca strategia este un calcul pur (stateless), foloseste intotdeauna Lambdas.",
    keyTakeaway: "Strategy Pattern este simplificat masiv in Java modern prin tratarea strategiilor ca functii lambda de ordin superior."
  },
  {
    id: "java-171",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Decorator Pattern in Arhitectura Claselor java.io",
    question: "Cum utilizeaza pachetul java.io sablonul Decorator in clase precum BufferedInputStream si GZIPInputStream?",
    answer: "Pachetul java.io este exemplul canonic din JDK pentru Decorator Pattern (adaugarea dinamica de functionalitati fara mostenire rigida):\\n\\n1. Componenta de Baza:\\n   - Clasa abstracta InputStream defineste contractul minim de citire a octetilor (read()).\\n   - Implementari concrete de baza: FileInputStream (citeste din fisier), ByteArrayInputStream (citeste din memorie), SocketInputStream (din retea).\\n\\n2. Decoratorul Abstract (FilterInputStream):\\n   - Extinde InputStream si detine o referinta (compunere) catre un alt InputStream: protected volatile InputStream in;.\\n\\n3. Decoratori Concreti:\\n   - BufferedInputStream: Adauga capacitatea de buffering in memorie pentru a evita apelurile I/O repetate pe disc.\\n   - GZIPInputStream: Adauga decompresie gzip la zbor pe fluxul de date.\\n   - DataInputStream: Adauga metode pentru citirea tipurilor primitive (readInt(), readDouble()).\\n\\n4. Puterea Compunerii:\\n   - Poti impacheta oricati decoratori unul in altul: new DataInputStream(new BufferedInputStream(new GZIPInputStream(new FileInputStream(\"data.gz\"))))!",
    codeSnippet: `// Compunere dinamica de decoratori I/O:
InputStream rawFile = new FileInputStream("report.txt.gz");
InputStream decompress = new GZIPInputStream(rawFile);
InputStream buffered = new BufferedInputStream(decompress);
DataInputStream in = new DataInputStream(buffered);

int recordId = in.readInt();`,
    interviewTrap: "Daca apelezi close() pe cel mai exterior decorator din lant (in.close()), acesta apeleaza automat in cascada close() pe toate stream-urile interioare decorate, eliberand descriptorul de fisier fizic.",
    keyTakeaway: "java.io foloseste Decorator Pattern pentru a adauga functionalitati (buffering, decompresie, parsing) peste fluxuri de date de baza."
  },
  {
    id: "java-172",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Observer Pattern si Java 9 Flow API (Reactive Streams)",
    question: "De ce vechea clasa java.util.Observer a fost declarata Deprecated si cum functioneaza java.util.concurrent.Flow (Reactive Streams)?",
    answer: "1. Defectele lui java.util.Observable (Java 1.0):\\n   - Observable era o CLASA, nu o interfata! Deoarece Java nu suporta mostenire multipla de clase, o clasa care trebuia sa mosteneasca altceva nu putea deveni Observable.\\n   - Nu era thread-safe in mod fiabil si nu suporta serializare curata.\\n   - Nu avea concept de Backpressure (daca observabilul emitea 1 milion de evenimente pe secunda, coplesea si bloca observatorii).\\n\\n2. Solutia Moderna: java.util.concurrent.Flow (Java 9 - Reactive Streams):\\n   - Standardizeaza 4 interfete fundamentale:\\n     - Flow.Publisher<T>: Emite fluxuri de date.\\n     - Flow.Subscriber<T>: Consuma datele si reactioneaza la onNext(), onError(), onComplete().\\n     - Flow.Subscription: Legatura dintre publisher si subscriber; include metoda cruciala subscription.request(n) prin care consumatorul cere EXACT n elemente (Backpressure nativ)!\\n     - Flow.Processor<T, R>: Actioneaza atat ca subscriber cat si ca publisher (filtrare/transformare).",
    codeSnippet: `// Implementare de baza cu SubmissionPublisher:
SubmissionPublisher<String> publisher = new SubmissionPublisher<>();

Flow.Subscriber<String> subscriber = new Flow.Subscriber<>() {
    private Flow.Subscription subscription;
    public void onSubscribe(Flow.Subscription s) { this.subscription = s; s.request(1); }
    public void onNext(String item) { System.out.println(item); subscription.request(1); }
    public void onError(Throwable t) {}
    public void onComplete() {}
};

publisher.subscribe(subscriber);
publisher.submit("Mesaj reactiv");`,
    interviewTrap: "Daca in onSubscribe() uiti sa apelezi subscription.request(n), consumatorul nu va primi NICIODATA niciun eveniment, deoarece modelul reactiv este bazat pe cerere (pull-based backpressure).",
    keyTakeaway: "Flow API inlocuieste vechiul Observer cu un contract reactiv standardizat cu control nativ al contrapresiunii (Backpressure)."
  },
  {
    id: "java-173",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Java Dynamic Proxy (Proxy.newProxyInstance)",
    question: "Cum functioneaza mecanismul de Dynamic Proxy nativ din Java (java.lang.reflect.Proxy) si care este limitarea sa structurala majora?",
    answer: "Dynamic Proxy permite generarea dinamica a unei clase proxy direct in memorie la runtime pentru a intercepta apelurile de metode:\\n\\n1. Cum se creeaza (Proxy.newProxyInstance):\\n   - Primeste 3 parametri: ClassLoader-ul, un array de interfete (Class<?>[] interfaces) si un InvocationHandler.\\n   - Cand o metoda este apelata pe instanta de proxy, apelul este redirectionat automat catre metoda unica: public Object invoke(Object proxy, Method method, Object[] args) din InvocationHandler.\\n   - Acolo poti adauga comportamente transversale (Cross-Cutting Concerns): logging, masurarea duratei de executie, securitate, tranzactii DB, inainte si dupa apelarea metodei reale pe obiectul tinta (target).\\n\\n2. Limitarea Structurala Majora:\\n   - JDK Dynamic Proxy functioneaza EXCLUSIV PE INTERFETE!\\n   - Nu poate genera un proxy peste o clasa concreta care nu implementeaza nicio interfata. Pentru clase concrete este nevoie de generatoare de bytecode la nivel de clasa precum CGLIB sau ByteBuddy.",
    codeSnippet: `InvocationHandler handler = (proxy, method, args) -> {
    System.out.println("Inainte de executia: " + method.getName());
    Object result = method.invoke(targetService, args);
    System.out.println("Dupa executia: " + method.getName());
    return result;
};

UserService proxy = (UserService) Proxy.newProxyInstance(
    UserService.class.getClassLoader(),
    new Class<?>[]{UserService.class},
    handler
);`,
    interviewTrap: "Metodele interne apelate din interiorul aceleiasi clase (Self-Invocation) ocolesc complet proxy-ul! Acesta este motivul pentru care adnotarea @Transactional din Spring esueaza cand o metoda apeleaza alta metoda din aceeasi clasa.",
    keyTakeaway: "JDK Dynamic Proxy intercepteaza apelurile pe baza de interfete si InvocationHandler; Self-Invocation ocoleste intotdeauna proxy-ul."
  },
  {
    id: "java-174",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "CGLIB si ByteBuddy vs JDK Dynamic Proxy",
    question: "Cum functioneaza bibliotecile CGLIB si ByteBuddy pentru a crea proxy-uri pe clase concrete si de ce clasele final nu pot fi proxate?",
    answer: "Cand o clasa nu implementeaza nicio interfata (sau cand Spring Boot activeaza proxyTargetClass=true implicit din versiunea 2.x):\\n\\n1. Cum functioneaza CGLIB / ByteBuddy (Subclassing Proxy):\\n   - In loc sa implementeze interfete, generatorul de bytecode creaza la runtime o SUBCLASA NOUA care extinde clasa concreta tinta (ex: UserService$$EnhancerBySpringCGLIB extends UserService).\\n   - Suprascrie (overrides) toate metodele non-private si injecteaza codul de interceptare prin MethodInterceptor.\\n\\n2. De ce metodele sau clasele FINAL nu pot fi proxate:\\n   - Daca clasa este declarata \"public final class TargetService\", ea NU POATE FI EXTINSA (mostenirea este interzisa de JVM)! Generarea de proxy va arunca eroare fatala.\\n   - Daca o metoda individuala este \"final\", ea nu poate fi suprascrisa, iar apelurile catre ea vor executa codul original ocolind complet aspectele de securitate sau tranzactie!",
    codeSnippet: `// In Spring Boot:
// spring.aop.proxy-target-class=true (implicit in Spring Boot 2/3 - foloseste CGLIB/ByteBuddy)
// Daca marchezi clasa cu 'final', pornirea aplicatiei crapa:
// @Service public final class UserService {} // ERROR: Cannot subclass final class!`,
    interviewTrap: "Constructorul clasei tinta este apelat de doua ori in cazul CGLIB (o data la crearea instantei reale si o data la crearea subclasei proxy), motiv pentru care constructorul nu trebuie sa contina operatii I/O grele.",
    keyTakeaway: "ByteBuddy/CGLIB creeaza proxy-uri prin mostenirea clasei tinta; clasele si metodele final nu pot fi proxate prin aceasta metoda."
  },
  {
    id: "java-175",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce trebuie evitata metoda System.gc() in Aplicatii?",
    question: "De ce apelarea explicita a metodei System.gc() este considerata un anti-pattern grav si ce flag JVM o dezactiveaza in productie?",
    answer: "1. De ce este periculoasa apelarea System.gc():\\n   - Cand apelezi System.gc() (sau Runtime.getRuntime().gc()), JVM incearca sa forteze un FULL GARBAGE COLLECTION complet.\\n   - Un Full GC opreste toate firele aplicatiei (Stop-The-World pause), inghetand complet procesarea cererilor utilizatorilor pe o durata ce poate depasi zeci de secunde pe Heap-uri mari!\\n   - Strica planificarea inteligenta si efortul colectorilor moderni (G1, ZGC), care sunt optimizati sa curete incremental memoria fara pauze mari.\\n\\n2. Este doar o sugestie (dar respectata de HotSpot):\\n   - Specificatia JVM spune ca System.gc() este o sugestie, dar in configuratia standard HotSpot JVM o trateaza intotdeauna cu maxima prioritate, declansand STW imediat.\\n\\n3. Protectia in Productie (OBLIGATORIE):\\n   - Adauga intotdeauna parametrul JVM: -XX:+DisableExplicitGC.\\n   - Acest flag transforma orice apel System.gc() (chiar si din dependinte externe de la terti precum biblioteci vechi RMI) intr-o instructiune complet ignorata (No-Op).",
    codeSnippet: `// Argument JVM obligatoriu pentru servere de productie:
// java -XX:+DisableExplicitGC -jar app.jar`,
    interviewTrap: "Daca folosesti DirectByteBuffers (memorie off-heap in Netty), Netty apela istoric System.gc() cand memoria off-heap se umplea pentru a declansa Phantom Cleaners. Cu -XX:+DisableExplicitGC activat, se recomanda asigurarea limitelor prin -XX:MaxDirectMemorySize.",
    keyTakeaway: "System.gc() declanseaza Full GC si pauze lungi STW; blocheaza apelurile explicite in productie folosind -XX:+DisableExplicitGC."
  },
  {
    id: "java-176",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "De ce nu poti face new T() sau new T[10] in Java Generics?",
    question: "De ce instantierea directa new T() sau new T[10] este strict interzisa de compilator in Java si cum se rezolva aceasta problema?",
    answer: "Aceasta limitare este consecinta directa a mecanismului de Type Erasure (Stergerea Tipurilor):\\n\\n1. Cauza Tehnica:\\n   - La compilare, parametrul de tip generic T este sters si inlocuit cu Object (sau cu prima sa limita, bounded type).\\n   - La runtime, in bytecode, tipul T NU MAI EXISTA! JVM-ul habar nu are ce reprezinta T (este String? este Integer? este Candidate?).\\n   - Prin urmare, instructiunea new T() ar trebui sa stie ce constructor sa apeleze si cata memorie sa aloce pe Heap, informatie care lipseste cu desavarsire la runtime!\\n\\n2. Cele Doua Solutii Canonice:\\n   - Solutia 1 (Reflection cu Class<T>): Transmiterea explicita a obiectului de clasa Class<T> clazz si apelarea clazz.getDeclaredConstructor().newInstance().\\n   - Solutia 2 (Functional Supplier): Transmiterea unui Supplier<T> factory in constructor sau metoda: supplier.get().",
    codeSnippet: `public class GenericFactory<T> {
    // 1. Prin Supplier (Modern, curat, fara reflection):
    public T create(Supplier<T> supplier) {
        return supplier.get();
    }

    // 2. Prin Class<T> token (Reflection):
    public T create(Class<T> clazz) throws Exception {
        return clazz.getDeclaredConstructor().newInstance();
    }
}`,
    interviewTrap: "La crearea de array-uri generice, poti face cast (T[]) new Object[size]; dar acest cod genereaza un warning Unchecked Cast si poate provoca ArrayStoreException daca array-ul este expus in afara clasei.",
    keyTakeaway: "new T() nu compileaza din cauza Type Erasure; se rezolva prin transmiterea unui Class<T> token sau a unui Supplier<T>."
  },
  {
    id: "java-177",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Invarianta Generics vs Covarianta Array-urilor in Java",
    question: "De ce Array-urile sunt covariante in Java dar Colectiile Generice sunt invariante si de ce List<String> nu mosteneste List<Object>?",
    answer: "1. Array-urile sunt Covariante (Design din Java 1.0):\\n   - Daca String este subtip al lui Object, atunci String[] este considerat automat un subtip al lui Object[].\\n   - Poti scrie: Object[] arr = new String[5];\\n   - Problema grava: Array-ul stie tipul sau real la runtime (Reified Type). Daca incerci sa scrii arr[0] = Integer.valueOf(42);, codul compileaza fara eroare, dar crapa la executie cu: java.lang.ArrayStoreException!\\n\\n2. Generics sunt Invariante (Design sigur din Java 5):\\n   - List<String> NU ESTE un subtip al lui List<Object>, chiar daca String extinde Object!\\n   - De ce a fost proiectat asa: Daca Java ar fi permis List<Object> list = new ArrayList<String>();, atunci ai fi putut apela list.add(42);. La urmatoarea citire din lista originala de string-uri ar fi crapat aplicatia!\\n   - Prin impunerea invariantei, compilatorul garanteaza 100% Type Safety la compilare (Compile-time Safety), eliminand erorile la runtime.",
    codeSnippet: `// Array (Covariant - riscant la runtime):
Object[] arr = new String[2];
// arr[0] = 100; // CRASH la runtime: ArrayStoreException!

// Generics (Invariant - protejat la compilare):
// List<Object> list = new ArrayList<String>(); // ERROR de compilare! Type mismatch!`,
    interviewTrap: "Daca ai nevoie sa accepti o lista de orice tip derivat din Object intr-o metoda de citire, foloseste Wildcard-ul delimitat: List<? extends Object> (sau List<?>).",
    keyTakeaway: "Array-urile sunt covariante si pot arunca ArrayStoreException la runtime; Generics sunt invariante pentru a garanta siguranta tipurilor la compilare."
  },
  {
    id: "java-178",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Heap Pollution si adnotarea @SafeVarargs",
    question: "Ce este fenomenul de Heap Pollution in Java si cand este obligatorie adnotarea @SafeVarargs pe metode cu varargs generici?",
    answer: "1. Ce este Heap Pollution (Poluarea Heap-ului):\\n   - Apare atunci cand o variabila de un tip generic parametrizat (ex: List<String>) ajunge sa retina o referinta catre un obiect care nu este de acel tip (ex: o lista care contine de fapt Integeri).\\n   - Cand incerci sa citesti un element din lista, compilatorul injecteaza un cast ascuns (String) list.get(0), care va arunca subit: ClassCastException intr-un loc din cod complet neasteptat!\\n\\n2. De ce Varargs Generici produc Heap Pollution:\\n   - In Java, varargs (T... args) este implementat sub capota ca un simplu array T[].\\n   - Deoarece array-urile sunt reificate iar genericele sunt sterse (Type Erasure), combinarea lor forteaza compilatorul sa creeze un Object[] array ascuns, poluand Heap-ul si generand avertismentul \"Possible heap pollution from parameterized vararg type\".\\n\\n3. Ce face adnotarea @SafeVarargs:\\n   - Asigura compilatorul ca metoda este SIGURA: corpul metodei doar citeste elementele din array-ul varargs si NU modifica array-ul si nu expune referinta array-ului in exterior.\\n   - Suprima avertismentul; poate fi aplicata doar pe metode statice, finale sau constructori.",
    codeSnippet: `@SafeVarargs // Declaram ca nu modificam si nu expunem array-ul varargs
public static <T> List<T> asListSafe(T... elements) {
    List<T> list = new ArrayList<>();
    for (T el : elements) { // Doar citire sigura!
        list.add(el);
    }
    return list;
}`,
    interviewTrap: "Daca o metoda marcheaza @SafeVarargs dar face arr[0] = (T) new Object(), este o minciuna adresata compilatorului si va produce ClassCastException la apelant.",
    keyTakeaway: "Heap Pollution apare cand un tip generic retine alt tip din cauza stergerii; @SafeVarargs garanteaza ca o metoda cu varargs generic nu polueaza array-ul."
  },
  {
    id: "java-179",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "List<?> vs List<Object> vs Raw Type List",
    question: "Care este diferenta critica de siguranta si functionalitate intre un Wildcard nelegat List<?>, o lista de obiecte List<Object> si un Raw Type List?",
    answer: "1. Raw Type List (Invechit din Java 1.4):\\n   - Nu foloseste Generics deloc.\\n   - Poti adauga ORICE obiect in ea (list.add(\"test\"), list.add(10)).\\n   - Dezactiveaza complet verificarile de tip ale compilatorului, necesitand cast-uri manuale si riscand ClassCastException la runtime. De evitat categoric!\\n\\n2. List<Object>:\\n   - Este o lista tipizata generic care accepta strict obiecte de tip Object.\\n   - Datorita invariantei, NU poti atribui un List<String> unei variabile de tip List<Object> (arunca eroare de compilare).\\n   - Poti adauga orice obiect in ea prin apelul list.add(obj).\\n\\n3. List<?> (Unbounded Wildcard - \"Lista de un tip necunoscut\"):\\n   - Este supertipul universal pentru ORICE lista generica (poti atribui un List<String>, List<Integer> sau List<Candidate>).\\n   - ESTE READ-ONLY pentru scrieri: NU poti adauga NICIUN obiect in ea (in afara de valoarea null)! Daca incerci list.add(\"abc\"), compilatorul refuza, deoarece nu stie care este tipul real din spatele wildcard-ului.",
    codeSnippet: `// 1. List<?> accepta orice lista ca parametru de citire:
public void printSize(List<?> list) {
    System.out.println(list.size()); // Citire permisa
    // list.add("test"); // CRASH la compilare! Nu poti adauga in List<?>
}

// 2. List<Object> accepta doar liste create explicit ca List<Object>:
List<String> strings = new ArrayList<>();
// List<Object> objs = strings; // ERROR! Invarianta nu permite!
List<?> wildcard = strings;     // OK!`,
    interviewTrap: "Poti citi din List<?>, iar elementele citite au intotdeauna tipul static Object. Singurul lucru pe care il poti adauga vreodata intr-un List<?> este literalul null.",
    keyTakeaway: "List<?> este pentru citire polimorfica universala (read-only); List<Object> este invariant si accepta orice la scriere; Raw List este nesigur."
  },
  {
    id: "java-180",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Multiple Bounded Type Parameters: <T extends Number & Comparable<T>>",
    question: "Cum declari limite multiple pentru un parametru generic (Multiple Bounds) si de ce regula ordonarii impune clasa inaintea interfetelor?",
    answer: "In Java Generics, poti restrictiona un tip generic T sa indeplineasca mai multe contracte simultan folosind operatorul ampersand (&):\\n\\nSintaxa: <T extends ClassBound & InterfaceBound1 & InterfaceBound2>\\n\\nRegula Stricta de Ordonare:\\n1. Daca una dintre limite este o CLASA concreta sau abstracta (nu o interfata), acea clasa TREBUIE sa fie plasata OBLIGATORIU pe PRIMA POZITIE din lista de limite!\\n2. Dupa clasa pot urma oricate interfete separate prin &.\\n3. De ce impune compilatorul aceasta regula:\\n   - Java nu suporta mostenire multipla de clase; o clasa poate extinde cel mult un singur parinte direct.\\n   - Daca prima pozitie nu era rezervata pentru clasa, compilatorul ar fi trebuit sa rezolve ambiguitati masive de generare a bytecode-ului (la Type Erasure, clasa este inlocuita cu primul tip din lista de bounds!).",
    codeSnippet: `// CORECT: Clasa Number pe prima pozitie, urmata de interfata Comparable:
public <T extends Number & Comparable<T>> T findMax(T a, T b) {
    return a.compareTo(b) > 0 ? a : b;
}

// GRESIT - eroare de compilare:
// public <T extends Comparable<T> & Number> ... // ERROR: interface expected here!`,
    interviewTrap: "Nu poti declara doua clase in lista de multiple bounds (ex: <T extends Number & String>), deoarece nicio clasa Java nu poate mosteni doua superclase simultan.",
    keyTakeaway: "Multiple bounds foloseste & pentru a combina o clasa si interfete; clasa trebuie sa fie obligatoriu pe prima pozitie."
  },
  {
    id: "java-181",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce este periculos sa prinzi catch (Throwable t) sau catch (Error e)?",
    question: "De ce prinderea lui Throwable sau Error este considerata o practica periculoasa in codul de aplicatie?",
    answer: "Ierarhia de exceptii are la baza java.lang.Throwable, care se imparte in doua ramuri majore:\\n1. java.lang.Exception (si RuntimeException): Erori de logica sau conditii anormale de aplicatie din care sistemul se poate recupera (ex: fisier negasit, validare esuata, timeout).\\n2. java.lang.Error: Probleme catastrofale la nivelul masinii virtuale JVM sau a resurselor de sistem hardware (ex: OutOfMemoryError, StackOverflowError, InternalError, UnknownError).\\n\\nDe ce nu trebuie prinse Error sau Throwable:\\n- Un Error semnaleaza ca mediul de executie este compromis grav si ireversibil (memoria este corupta, stiva s-a terminat, sau thread-ul a fost oprit fortat).\\n- Daca prinzi catch (Throwable t) si continui executia, lasi aplicatia sa ruleze intr-o stare zombie nepredictibila, putand corupe baze de date sau bloca definitiv alte module!\\n- Singurul loc unde se accepta catch (Throwable) este in framework-uri de nivel foarte inalt (ex: Tomcat/Netty event loop) strict pentru a loga eroarea fatala inainte de restart.",
    codeSnippet: `// GRESIT: prinde si inghite erori fatale de JVM:
try {
    processBatch();
} catch (Throwable t) { // Poate prinde OutOfMemoryError si sa continue!
    log.error("Ceva a mers prost");
}

// CORECT: prinde strict exceptiile din care te poti recupera:
try {
    processBatch();
} catch (Exception e) {
    log.error("Eroare de procesare", e);
}`,
    interviewTrap: "Daca prinzi InterruptedException si nu o repui pe fir, ai inghitit semnalul de oprire; daca prinzi VirtualMachineError, impiedici sistemul sa se opreasca curat.",
    keyTakeaway: "Prinde doar Exception; lasa Error si Throwable sa se propage pentru a permite JVM-ului sau orchestratorului sa gestioneze situatiile fatale."
  },
  {
    id: "java-182",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Exception Masking (Swallowing) in blocul finally",
    question: "Ce este fenomenul de Exception Masking cand atat blocul try cat si blocul finally arunca exceptii si cum il rezolva try-with-resources?",
    answer: "1. Ce este Exception Masking (Mascarea Exceptiilor) in try-finally clasic:\\n   - Daca blocul try arunca o exceptie critica de business (ex: PaymentFailedException);\\n   - Iar in blocul finally (unde inchizi resursele manual) metoda close() arunca o alta exceptie (ex: SocketException);\\n   - Comportamentul JVM este dramatic: exceptia din finally O MASCHEAZA (o inghite si o suprascrie complet) pe cea din try!\\n   - Apelantul va vedea DOAR SocketException din finally, iar cauza originala a esecului de plata se pierde pentru totdeauna din log-uri!\\n\\n2. Solutia Moderna: try-with-resources si Suppressed Exceptions:\\n   - In try-with-resources, exceptia din interiorul blocului try este intotdeauna EXCEPTIA PRINCIPALA (Primara).\\n   - Daca si apelul automat close() arunca o eroare, acea eroare secundara este atasata ca \"Suppressed Exception\" (adaugata prin e.addSuppressed()) la exceptia principala!\\n   - Ambele stack trace-uri raman vizibile complet in log-uri.",
    codeSnippet: `try (CustomResource res = new CustomResource()) {
    throw new BusinessException("Tranzactie esuata!"); // Exceptia Primara
} // La iesire res.close() arunca CloseException!

// In log-uri apare:
// BusinessException: Tranzactie esuata!
//     Suppressed: CloseException: Eroare la inchidere!`,
    interviewTrap: "Daca pui o instructiune return sau throw in interiorul unui bloc finally traditional, acea instructiune va anula orice exceptie aruncata anterior in blocul try.",
    keyTakeaway: "try-with-resources pastreaza exceptia originala ca principala si ataseaza erorile de inchidere ca Suppressed Exceptions."
  },
  {
    id: "java-183",
    category: "JAVA",
    difficulty: "USOR",
    title: "AutoCloseable vs Closeable in Java",
    question: "Care este diferenta dintre interfata java.lang.AutoCloseable si java.io.Closeable?",
    answer: "1. java.io.Closeable (Introdusa in Java 5):\\n   - Este interfata traditionala din pachetul java.io.\\n   - Semnatura metodei: void close() throws IOException;\\n   - Specificatia impune IDEMPOTENTA: Apelarea metodei close() a doua oara pe o resursa deja inchisa nu trebuie sa aiba niciun efect si nu trebuie sa arunce eroare.\\n\\n2. java.lang.AutoCloseable (Introdusa in Java 7 pentru try-with-resources):\\n   - Este interfata parinte pe care o extinde Closeable (Closeable extends AutoCloseable).\\n   - Semnatura metodei: void close() throws Exception; (poate arunca orice tip de exceptie, nu doar IOException!).\\n   - Specificatia NU impune obligativitatea idempotentei (desi este puternic recomandata).\\n   - Permite utilizarea oricaror resurse (conexiuni DB, lock-uri, client-i de retea) in blocuri try-with-resources.",
    codeSnippet: `// Custom resource moderna:
public class TransactionScope implements AutoCloseable {
    @Override
    public void close() throws SQLException { // Semnatura specifica, nu generala Exception!
        rollbackIfNotCommitted();
    }
}`,
    interviewTrap: "Cand implementezi AutoCloseable pe o clasa proprie, este recomandat sa restrangi clauza throws la exceptia specifica (ex: throws SQLException sau chiar fara throws), in loc sa declari throws Exception in mod generic.",
    keyTakeaway: "Closeable arunca strict IOException si cere idempotenta; AutoCloseable este parintele general care poate arunca orice Exception."
  },
  {
    id: "java-184",
    category: "JAVA",
    difficulty: "USOR",
    title: "Ordinea Blocurilor Catch: De la Derivat la Parinte",
    question: "De ce ordinea blocurilor catch trebuie sa fie intotdeauna de la subclasa spre superclasa si ce restrictie are Multi-Catch?",
    answer: "1. Regula Ierarhiei in Blocuri Catch Multiple:\\n   - Compilatorul Java verifica blocurile catch secvential, de sus in jos, exact in ordinea scrisa.\\n   - Daca pui o superclasa mai generala (ex: catch (Exception e)) inaintea unei subclase specifice (ex: catch (IOException e)):\\n   - Blocul superior va intercepta absolut toate exceptiile, facand blocul inferior cu IOException complet INACCESIBIL (Unreachable Code)!\\n   - Compilatorul va refuza sa compileze codul cu eroarea: \"exception has already been caught\".\\n\\n2. Regula in Multi-Catch (Java 7 - catch (A | B e)):\\n   - Poti prinde mai multe exceptii pe o singura linie folosind bara verticala (|).\\n   - Restrictie stricta: Tipurile de exceptii listate in multi-catch NU AU VOIE sa aiba relatie de mostenire directa (nu poti scrie catch (IOException | FileNotFoundException e) deoarece FileNotFoundException este deja o subclasa a lui IOException)!\\n   - In multi-catch, variabila e este implicit FINAL.",
    codeSnippet: `// 1. Ordinea corecta: de la specific la general:
try {
    process();
} catch (FileNotFoundException e) {
    // Specific
} catch (IOException e) {
    // Mai general
} catch (Exception e) {
    // Cel mai general
}

// 2. Multi-catch valid (fara relatie de mostenire directa):
try {
    run();
} catch (SQLException | IOException e) {
    log.error("Eroare de IO sau DB", e);
}`,
    interviewTrap: "In multi-catch (catch (SQLException | IOException e)), parametrul \"e\" este final; nu poti face reatribuire (e = new IOException() este interzis).",
    keyTakeaway: "Catch-urile se ordoneaza de la subclasa la superclasa; in multi-catch exceptiile nu trebuie sa se mosteneasca reciproc."
  },
  {
    id: "java-185",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Exceptii Custom Ultra-Rapide fara StackTrace",
    question: "De ce crearea si aruncarea de exceptii in Java este costisitoare si cum optimizezi o exceptie de control prin writableStackTrace=false?",
    answer: "1. De unde vine costul urias al unei exceptii in Java:\\n   - Aruncarea si prinderea unei exceptii nu este costisitoare in sine; pasul de 100 de ori mai lent este GENERAREA STACK TRACE-ULUI in momentul instantierii obiectului Throwable (apelul metodei native Throwable.fillInStackTrace())!\\n   - JVM trebuie sa suspende firul si sa parcurga toata stiva de apeluri (stack frames), inspectand metodele si numerele de linie.\\n\\n2. Solutia pentru Exceptii Frecvente de Control (Flow Control):\\n   - Daca folosesti o exceptie doar pentru a semnala o conditie frecventa de business (ex: RecordNotFoundException sau TokenExpiredException) si nu ai nevoie de stack trace pentru debugging:\\n   - Foloseste constructorul protejat cu 4 parametri introdus in Java 7, setand writableStackTrace = false!\\n   - Instantierea devine instantanee (la fel de rapida ca crearea unui simplu obiect POJO), eliminand orice degradare de performanta sub sarcina mare.",
    codeSnippet: `public class FastBusinessException extends RuntimeException {
    public FastBusinessException(String message) {
        // message, cause, enableSuppression, writableStackTrace
        super(message, null, false, false); // ZERO generare de StackTrace!
    }

    // Sau poti suprascrie direct metoda:
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this; // Nu face nimic, zero overhead CPU!
    }
}`,
    interviewTrap: "Daca setezi writableStackTrace=false, logarea e.printStackTrace() va afisa doar mesajul exceptiei, fara nicio linie de cod sau clasa apelanta. Foloseste-l strict pe erori de flux de date asteptate.",
    keyTakeaway: "Dezactivarea StackTrace-ului (writableStackTrace=false) face exceptiile de 100x mai rapide, ideale pentru validari masive."
  },
  {
    id: "java-186",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Zero-Copy in Java NIO: FileChannel.transferTo()",
    question: "Ce este mecanismul de Zero-Copy in Java NIO si cum transfera FileChannel.transferTo() date fara comutari de context in User Space?",
    answer: "1. Cum functioneaza transferul traditional I/O (4 Buffer Copies + 4 Context Switches):\\n   - Daca vrei sa trimiti un fisier de pe disc pe un socket de retea:\\n     - 1. DMA (Direct Memory Access) copiaza fisierul de pe disc in Kernel Read Buffer.\\n     - 2. CPU copiaza datele din Kernel Space in User Space Buffer (aplicatia Java).\\n     - 3. CPU copiaza datele din User Space inapoi in Kernel Socket Buffer.\\n     - 4. DMA copiaza din Socket Buffer pe placa de retea (NIC Buffer).\\n   - Presupune 4 schimbari de context intre User Mode si Kernel Mode si 4 copieri de memorie!\\n\\n2. Ce aduce Zero-Copy (FileChannel.transferTo):\\n   - Utilizeaza apelul de sistem nativ de kernel Linux: sendfile().\\n   - Datele sunt citite direct de placa de retea din buffer-ul de kernel al discului prin descriptori DMA!\\n   - Datele NU MAI TREC NICIODATA prin memoria procesului Java (User Space).\\n   - Rezultat: Zero cicluri CPU irosite pe copiere de octeti si throughput masiv (folosit de Kafka, Netty, Tomcat).",
    codeSnippet: `FileChannel fileChannel = new FileInputStream("large_video.mp4").getChannel();
SocketChannel socketChannel = SocketChannel.open(new InetSocketAddress("remotehost", 8080));

// ZERO-COPY nativ prin kernel:
long transferred = fileChannel.transferTo(0, fileChannel.size(), socketChannel);`,
    interviewTrap: "Apache Kafka este atat de rapid tocmai datorita folosirii lui FileChannel.transferTo() si a operatiilor secventiale pe disc prin OS PageCache.",
    keyTakeaway: "FileChannel.transferTo utilizeaza apelul nativ sendfile(), transferand datele direct intre buffere de kernel fara a atinge memoria aplicatiei."
  },
  {
    id: "java-187",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Direct ByteBuffer vs Heap ByteBuffer in Java NIO",
    question: "Care este diferenta dintre un ByteBuffer alocat pe Heap si un Direct ByteBuffer (Off-Heap) si cum sunt eliberate resursele native?",
    answer: "1. Heap ByteBuffer (ByteBuffer.allocate(size)):\\n   - Memoria este alocata pe Heap-ul Java normal.\\n   - Rapid de creat si curatat automat de Garbage Collector.\\n   - Dezavantaj la operatii I/O: Cand scrii un Heap Buffer pe un socket de retea, JVM-ul este obligat sa creeze temporar un buffer nativ intern, sa copieze datele din Heap in memoria nativa si abia apoi sa apeleze kernel-ul (deoarece GC poate muta obiectele din Heap in memorie la compactare in timp ce I/O-ul ruleaza!).\\n\\n2. Direct ByteBuffer (ByteBuffer.allocateDirect(size)):\\n   - Aloca memoria in memoria NATIVA a sistemului de operare (Off-Heap, folosind malloc C++).\\n   - Paginile de memorie sunt blocate fizic (Pinned Memory), permitand kernel-ului si DMA sa scrie/citeasca direct din ele cu zero copiere intermediara.\\n   - Ideal pentru buffere de I/O de lunga durata in servere de inalta performanta (Netty).\\n\\n3. Cum se elibereaza memoria Off-Heap:\\n   - DirectByteBuffer retine un obiect special java.lang.ref.Cleaner.\\n   - Cand obiectul Java devine inaccesibil pe Heap, Cleaner-ul apeleaza functia nativa de eliberare a memoriei C++ (free).",
    codeSnippet: `// 1. Heap Buffer:
ByteBuffer heapBuf = ByteBuffer.allocate(1024);

// 2. Direct Off-Heap Buffer:
ByteBuffer directBuf = ByteBuffer.allocateDirect(1024); // Ideal pentru I/O intensiv`,
    interviewTrap: "Alocarea si de-alocarea de Direct ByteBuffers este mult mai lenta decat pe Heap. Nu aloca Direct Buffers la fiecare cerere; foloseste un Pool de buffere reutilizabile (Buffer Pool precum ByteBufAllocator din Netty).",
    keyTakeaway: "Direct ByteBuffer traieste in memoria nativa si permite I/O direct fara copiere intermediara prin Heap."
  },
  {
    id: "java-188",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Cum functioneaza Selector in Java NIO (I/O Multiplexing)?",
    question: "Cum permite clasa Selector multiplexarea a mii de conexiuni de retea pe un singur thread folosind mecanismele epoll din Linux?",
    answer: "1. Limitarea Modelului Vechi I/O (One-Thread-per-Connection):\\n   - ServerSocket clasic aloca un thread dedicat de sistem de operare pentru fiecare conexiune client (ex: 10.000 clienti = 10.000 thread-uri).\\n   - Marea majoritate a firelor stateau blocate dormind asteptand date, consumand gigabytes de memorie RAM pentru stive si provocand Context Switching masiv.\\n\\n2. Arhitectura NIO Selector (I/O Multiplexing):\\n   - Canalele de retea (SocketChannel) sunt configurate in mod non-blocant: channel.configureBlocking(false).\\n   - Multiple canale sunt inregistrate pe un singur obiect comun Selector, specificand evenimentele de interes (SelectionKey.OP_READ, OP_WRITE, OP_ACCEPT).\\n   - La nivel de kernel OS, Selector foloseste apeluri de sistem native ultra-scalabile: epoll pe Linux, kqueue pe macOS, IOCP pe Windows.\\n   - Un singur thread apeleaza selector.select(): firul doarme pana cand CEL PUTIN UN canal are date disponibile pentru citire sau o conexiune noua. La trezire, parcurge doar canalele gata si le proceseaza rapid.",
    codeSnippet: `Selector selector = Selector.open();
ServerSocketChannel serverChannel = ServerSocketChannel.open();
serverChannel.configureBlocking(false);
serverChannel.register(selector, SelectionKey.OP_ACCEPT);

while (true) {
    selector.select(); // Se blocheaza pana cand apare un eveniment pe oricare canal
    Set<SelectionKey> selectedKeys = selector.selectedKeys();
    Iterator<SelectionKey> it = selectedKeys.iterator();
    while (it.hasNext()) {
        SelectionKey key = it.next();
        if (key.isAcceptable()) { /* Accepta client nou */ }
        if (key.isReadable()) { /* Citeste date fara blocare */ }
        it.remove(); // OBLIGATORIU: scoate cheia procesata!
    }
}`,
    interviewTrap: "Daca uiti sa apelezi it.remove() pe cheia selectata, ea ramane in selectedKeys set, iar la urmatoarea iteratie Selector-ul va procesa din nou acelasi canal, intrand intr-o bucla infinita de 100% CPU.",
    keyTakeaway: "Selector utilizeaza epoll pentru a monitoriza mii de canale non-blocante pe un singur fir de executie."
  },
  {
    id: "java-189",
    category: "JAVA",
    difficulty: "USOR",
    title: "Files.lines() vs Files.readAllLines(): Prevenirea OOM pe fisiere mari",
    question: "De ce Files.readAllLines() este periculos pentru fisiere mari si cum asigura Files.lines() procesarea streaming?",
    answer: "1. Pericolul din Files.readAllLines(Path):\\n   - Citeste INTREGUL continut al fisierului si incarca toate liniile deodata sub forma unei liste List<String> in memoria Heap.\\n   - Daca fisierul are 5 GB iar Heap-ul are 4 GB, aplicatia va crapa instantaneu cu OutOfMemoryError: Java heap space.\\n\\n2. Solutia: Files.lines(Path) (Streaming Lenes):\\n   - Returneaza un Stream<String> evaluat lenes (Lazy Evaluation).\\n   - Liniile sunt citite pe masura ce sunt consumate, pastrand in memorie doar linia curenta la un moment dat.\\n   - Poti procesa un fisier de 100 de Gigabytes folosind doar cativa Megabytes de memorie RAM!\\n\\n3. Regula Obligatorie de Utilizare:\\n   - Stream-ul returnat de Files.lines() detine o referinta catre un descriptor de fisier de sistem deschis.\\n   - TREBUIE utilizat INTOTDEAUNA intr-un bloc try-with-resources pentru a garanta inchiderea fisierului la terminare sau in caz de eroare!",
    codeSnippet: `Path logFile = Paths.get("/var/log/app.log");

// Sigur impotriva OOM chiar si pe fisiere gigantice:
try (Stream<String> lines = Files.lines(logFile)) {
    long errorCount = lines
        .filter(line -> line.contains("ERROR"))
        .count();
    System.out.println("Total erori: " + errorCount);
}`,
    interviewTrap: "Daca folosesti Files.lines() fara try-with-resources, descriptorul de fisier ramane deschis, ceea ce pe Linux va duce rapid la eroarea: Too many open files.",
    keyTakeaway: "Files.readAllLines incarca totul in memorie provocand OOM; Files.lines proceseaza fisierul linie cu linie prin stream."
  },
  {
    id: "java-190",
    category: "JAVA",
    difficulty: "USOR",
    title: "Path vs File: De ce API-ul modern java.nio.file.Path a inlocuit java.io.File?",
    question: "Ce limitari majore ale vechii clase java.io.File au dus la crearea interfetei java.nio.file.Path si a clasei utilitare Files?",
    answer: "Vechea clasa java.io.File (Java 1.0) avea defecte structurale majore:\\n1. Trateaza erorile prin returnarea valorii booleene false in loc de exceptii clare (ex: file.delete() returna false daca esua, fara sa spuna de ce: lipsa de permisiuni? fisier blocat? cale gresita?).\\n2. Metoda file.length() returna 0L daca fisierul nu exista, creand ambiguitati.\\n3. Performanta catastrofala pe directoare mari: file.listFiles() incarca toate fisierele intr-un array in memorie, blocand procesul pe directoare cu 500.000 de fisiere.\\n4. Nu suporta atribute avansate de fisiere (simlink-uri, atribute POSIX, permisiuni ACL, monitorizare de modificari).\\n\\nCe aduce java.nio.file.Path si Files (Java 7 - NIO.2):\\n- Arunca exceptii explicite (NoSuchFileException, AccessDeniedException).\\n- Suport complet pentru sisteme de fisiere virtuale (ZipFileSystem, MemoryFileSystem).\\n- Metode de inalta performanta bazate pe Streams: Files.walk(), Files.find(), Files.list().\\n- Monitorizare in timp real a modificarilor din directoare prin WatchService.",
    codeSnippet: `Path path = Paths.get("data/report.pdf");

// Verificare existenta si stergere cu exceptie clara la eroare:
try {
    Files.delete(path);
} catch (NoSuchFileException e) {
    System.out.println("Fisierul nu exista!");
} catch (AccessDeniedException e) {
    System.out.println("Lipsa permisiuni!");
}`,
    interviewTrap: "Clasa File are metoda toPath(), iar Path are metoda toFile(), facand trecerea intre cele doua API-uri foarte usoara in proiecte legacy.",
    keyTakeaway: "Path si Files ofera tratare explicita a erorilor prin exceptii, suport pentru simlink-uri si parcurgere eficienta prin stream-uri."
  },
  {
    id: "java-191",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Ce este un Memory Mapped File (MappedByteBuffer) in Java?",
    question: "Cum functioneaza maparea fisierelor direct in memoria virtuala a procesului folosind FileChannel.map() si la ce performanta se ajunge?",
    answer: "1. Ce este un Memory Mapped File (mmap):\\n   - Un mecanism avansat de kernel prin care o portiune dintr-un fisier de pe disc este mapata direct in spatiul de adrese de memorie virtuala al procesului Java.\\n   - La apelul fileChannel.map(MapMode.READ_WRITE, position, size), JVM returneaza un MappedByteBuffer.\\n\\n2. De ce atinge viteza extrema (comparabila cu memoria RAM):\\n   - Aplicatia citeste si scrie date folosind simple operatii de memorie (get/put pe buffer), FARA a mai apela metode de I/O de citire/scriere (read() / write())!\\n   - Sistemul de operare se ocupa in mod transparent prin mecanismul de Page Faults de incarcarea blocurilor din disc in RAM si de sincronizarea asincrona a modificarilor inapoi pe disc (Dirty Pages flush).\\n   - Utilizat in baze de date de inalta performanta si cozi de mesagerie ultra-rapide (Chronicle Queue, LMDB, Kafka).",
    codeSnippet: `try (FileChannel channel = FileChannel.open(path, StandardOpenOption.READ, StandardOpenOption.WRITE)) {
    // Mapam primii 10 MB ai fisierului direct in memorie:
    MappedByteBuffer buffer = channel.map(FileChannel.MapMode.READ_WRITE, 0, 10 * 1024 * 1024);

    buffer.put(0, (byte) 65); // Modificare directa a primului octet din fisier!
    buffer.force();          // Forteaza scrierea imediata din OS cache pe disc
}`,
    interviewTrap: "Un MappedByteBuffer nu poate fi de-mapat manual in mod trivial; fisierul poate ramane blocat pe Windows pana cand colectorul de gunoi curata instanta de ByteBuffer.",
    keyTakeaway: "MappedByteBuffer mapeaza fisierul direct in memoria virtuala prin mmap, permitand acces la viteza nativa a memoriei RAM."
  },
  {
    id: "java-192",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "FileChannel.tryLock(): Prevenirea Rularii Concurente a Aplicatiei",
    question: "Cum utilizezi FileLock si FileChannel.tryLock() pentru a preveni pornirea a doua instante ale aceleiasi aplicatii Java pe acelasi server?",
    answer: "Cand vrei sa te asiguri ca un proces batch sau o aplicatie Java ruleaza ca o instanta unica (Single Instance Application):\\n\\n1. Cum functioneaza FileLock:\\n   - Foloseste mecanismul de blocare a fisierelor la nivel de kernel al sistemului de operare (OS File Locking).\\n   - Doua tipuri de lock-uri: Shared Lock (pentru citire) si Exclusive Lock (pentru scriere unica).\\n\\n2. Metoda tryLock() (Non-Blocanta):\\n   - Metoda fileChannel.tryLock() incearca sa obtina un lock exclusiv pe un fisier de blocare (lockfile.lck).\\n   - Daca obtine lock-ul (returneaza un obiect FileLock non-null): Aplicatia este prima instanta si poate rula in siguranta.\\n   - Daca returneaza null (sau arunca OverlappingFileLockException): O alta instanta a aplicatiei ruleaza deja pe acel server! Aplicatia noua se opreste imediat cu un mesaj clar.",
    codeSnippet: `File file = new File(System.getProperty("user.home"), ".app.lock");
FileChannel channel = new RandomAccessFile(file, "rw").getChannel();
FileLock lock = channel.tryLock();

if (lock == null) {
    System.err.println("O instanta a aplicatiei ruleaza deja! Iesire.");
    System.exit(1);
}
// Aplicatia ruleaza normal... Lock-ul se elibereaza automat la terminarea procesului!`,
    interviewTrap: "FileLock este eliberat automat de sistemul de operare daca procesul Java este oprit sau crapa brusc, ceea ce il face mult mai sigur decat simpla verificare if (file.exists()).",
    keyTakeaway: "FileChannel.tryLock() foloseste mecanismele de blocare de fisiere ale sistemului de operare pentru a garanta instante unice."
  },
  {
    id: "java-193",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Reflection si restrictiile Strong Encapsulation in Java Module System (Java 9+)",
    question: "De ce field.setAccessible(true) arunca InaccessibleObjectException incepand cu Java 9 si ce directiva este necesara in module-info.java?",
    answer: "1. Ce facea setAccessible(true) istoric:\\n   - Permitea oricarui cod Java sa rupa incapsularea (Breaking Encapsulation): sa citeasca sau sa modifice campuri private dintr-o alta clasa fara nicio restrictie.\\n   - Framework-uri precum Spring si Hibernate se bazau masiv pe acest mecanism pentru dependency injection si mapare ORM.\\n\\n2. Ce a adus Java 9 (Strong Encapsulation in JPMS - JEP 261):\\n   - Pachetele din interiorul unui modul sunt strict protejate. Chiar daca un camp este accesat prin Reflection, daca pachetul nu a acordat permisiune explicita, JVM blocheaza accesul si arunca: java.lang.reflect.InaccessibleObjectException!\\n\\n3. Directiva opens in module-info.java:\\n   - Pentru a permite unui framework extern (ex: Spring, Jackson) sa acceseze campuri private prin reflection, modulul trebuie sa declare explicit:\\n     - opens com.ats.model to spring.core, com.fasterxml.jackson.databind;\\n     - Sau open module my.module { ... } pentru a deschide intregul modul la reflection.",
    codeSnippet: `// In module-info.java:
module ats.job.tracker {
    requires spring.boot;
    requires spring.web;

    // Deschide pachetul de entitati pentru acces prin Reflection de catre Hibernate:
    opens com.ats.model to org.hibernate.orm.core;
}`,
    interviewTrap: "Poti ocoli temporar restrictiile din linia de comanda pentru biblioteci legacy folosind parametrul: --add-opens java.base/java.lang=ALL-UNNAMED.",
    keyTakeaway: "Java 9 impune incapsulare puternica; reflection pe campuri private necesita directiva explicita opens in module-info.java."
  },
  {
    id: "java-194",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Java Module System (JPMS): module-info.java, exports vs opens",
    question: "Care este diferenta dintre directiva exports si opens in fisierul module-info.java din sistemul de module Java?",
    answer: "Sistemul de Module (Project Jigsaw / Java 9) a introdus fisierul descriptor module-info.java situat la radacina surselor:\\n\\n1. Directiva exports packageName;:\\n   - Face toate clasele publice (public) din acel pachet accesibile celorlalte module atat la COMPILARE cat si la RUNTIME.\\n   - Clasele din pachetele care NU sunt exportate devin complet INVIZIBILE pentru alte module (chiar daca sunt declarate public in cod!).\\n   - Nu permite accesul la membri privati prin Reflection.\\n\\n2. Directiva opens packageName;:\\n   - Acorda acces exclusiv la RUNTIME prin intermediul Reflection API (Deep Reflection).\\n   - Permite framework-urilor (Spring, Jackson, Hibernate) sa inspecteze si sa populeze campuri private, dar pachetul NU este disponibil pentru compilare normala.\\n\\n3. Directiva requires moduleName;:\\n   - Declara o dependenta obligatorie catre un alt modul la compilare si executie.",
    codeSnippet: `module com.ats.service {
    requires java.sql;              // Dependinta la modulul SQL
    exports com.ats.service.api;    // API public expus altora la compilare
    opens com.ats.service.dto to com.fasterxml.jackson.databind; // Doar reflection pentru JSON
}`,
    interviewTrap: "Un modul nu poate deschide pachete care au fost declarate intr-un modul open module (deoarece un modul \"open\" deschide deja absolut toate pachetele sale la reflection).",
    keyTakeaway: "exports expune clase publice la compilare; opens acorda acces la membri privati la runtime prin Reflection."
  },
  {
    id: "java-195",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "String.intern() si Riscurile de Degradare a Performantei",
    question: "Ce face metoda String.intern() si de ce utilizarea sa necontrolata pe siruri arbitrare poate crea probleme de performanta in JVM?",
    answer: "1. Ce face String.intern():\\n   - Cauta sirul de caractere in String Constant Pool-ul global al masinii virtuale.\\n   - Daca exista deja, returneaza referinta partajata din Pool.\\n   - Daca nu exista, adauga sirul curent in Pool si returneaza referinta.\\n   - Permite compararea sirurilor prin operatorul == in loc de .equals().\\n\\n2. Riscuri si Probleme de Performanta in Productie:\\n   - String Pool-ul este implementat intern in C++ ca un HashMap nativ cu dimensiune fixa de bucket-uri (-XX:StringTableSize, implicit ~65.536 pe 64-bit).\\n   - Daca apelezi intern() pe milioane de siruri unice (ex: ID-uri unice, timestamp-uri, adrese email):\\n     - Tabela interna de hash se umple masiv de coliziuni extreme;\\n     - Fiecare apel intern() viitor va parcurge liste lungi de coliziuni, ducand la degradarea dramatica a timpului de raspuns (CPU spike la 100%)!\\n   - In plus, sirurile internate traiesc mult timp pe Heap, crescand presiunea pe GC.",
    codeSnippet: `String dynamic1 = new String("ACTIVE");
String dynamic2 = new String("ACTIVE");

System.out.println(dynamic1 == dynamic2); // FALSE

// Dupa intern():
String interned1 = dynamic1.intern();
String interned2 = dynamic2.intern();
System.out.println(interned1 == interned2); // TRUE (aceeasi referinta din Pool)`,
    interviewTrap: "Nu folosi niciodata String.intern() pentru a face cache pe date de intrare necontrolate de la utilizatori (User Input), deoarece expune aplicatia la atacuri de tip Denial of Service prin epuizarea tabelei de hash.",
    keyTakeaway: "String.intern() pune sirul in String Pool; abuzul pe siruri unice creste dramatic coliziunile in tabela interna StringTable."
  },
  {
    id: "java-196",
    category: "JAVA",
    difficulty: "USOR",
    title: "Cele 5 Reguli Fundamentale pentru a Construi un Obiect Imutabil",
    question: "Care sunt cele 5 reguli stabilite in Effective Java (Item 17) pentru a construi o clasa 100% imutabila in Java?",
    answer: "Un obiect imutabil este un obiect a carui stare interna nu poate fi modificata niciodata dupa instantiere. Cele 5 reguli de aur sunt:\\n\\n1. Nu oferi nicio metoda mutatoare (zero metode de tip set...()).\\n2. Asigura-te ca clasa NU POATE FI EXTINSA (mostenita):\\n   - Marcare ca \"final\" (public final class), sau prin folosirea de constructori privati combinati cu Static Factory Methods.\\n3. Declara TOATE campurile ca \"final\" (public final type):\\n   - Garanteaza initializarea sigura peste fire concurente conform JMM (Java Memory Model) fara sincronizare.\\n4. Declara TOATE campurile ca \"private\":\\n   - Impiedica accesul direct si alterarea campurilor din exterior.\\n5. Asigura acces exclusiv la orice componenta mutabila (Defensive Copying):\\n   - Daca clasa contine campuri care refera obiecte mutabile (Date, List, Map), realizeaza copii defensive atat in constructor cat si la returnarea din getteri!",
    codeSnippet: `public final class ImmutableUser {
    private final String username;
    private final List<String> roles; // Obiect mutabil interior

    public ImmutableUser(String username, List<String> roles) {
        this.username = username;
        // Regula 5: Copie defensiva la intrare:
        this.roles = List.copyOf(roles);
    }

    public String getUsername() { return username; }
    // Regula 5: Returnare copie sau colectie imutabila la iesire:
    public List<String> getRoles() { return roles; } // Deja imutabila prin List.copyOf
}`,
    interviewTrap: "Daca clasa ta este declarata final si toate campurile sunt private final, dar retii o referinta catre un Date sau un ArrayList fara a face copie defensiva, clasa ta NU este imutabila!",
    keyTakeaway: "Imutabilitatea cere: fara setteri, clasa final, campuri private final si copiere defensiva pe toate campurile mutabile."
  },
  {
    id: "java-197",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Defensive Copying (Copiere Defensiva) in Constructori si Getteri",
    question: "De ce este necesara copierea defensiva atat in constructor cat si in getteri si cum poate fi spart un obiect aparent imutabil fara ea?",
    answer: "Copierea defensiva protejeaza un obiect imutabil de modificarile exterioare realizate prin referinte partajate:\\n\\n1. Vulnerabilitatea in Constructor (Fara Defensive Copy):\\n   - Daca constructorul face simplu: this.items = items;\\n   - Apelantul pastreaza referinta originala: list.add(\"Element rau\") DUPA ce a creat obiectul! Modificarea se reflecta imediat in interiorul obiectului tau \"imutabil\"!\\n\\n2. Vulnerabilitatea in Getter (Fara Defensive Copy):\\n   - Daca getter-ul returneaza direct referinta interna: return this.items;\\n   - Orice client care apeleaza obj.getItems().clear() va distruge starea interna a obiectului din exterior!\\n\\n3. Regula de Aur a Ordinii Copierii in Constructori:\\n   - Realizeaza copierea defensiva INAINTE de a valida parametrii (pentru a evita atacurile concurente Time-Of-Check to Time-Of-Use / TOCTOU).",
    codeSnippet: `public final class Order {
    private final List<Item> items;

    public Order(List<Item> items) {
        // 1. Copie defensiva in constructor INAINTE de validare:
        this.items = new ArrayList<>(items);
        if (this.items.isEmpty()) throw new IllegalArgumentException("Lista goala");
    }

    public List<Item> getItems() {
        // 2. Copie defensiva sau wrapper nemodificabil la retur:
        return Collections.unmodifiableList(items);
    }
}`,
    interviewTrap: "Nu folosi clone() pentru a face copiere defensiva a parametrilor din constructor daca tipul de parametru poate fi extins de terte parti, deoarece o subclasa malitioasa poate suprascrie clone() si poate pastra o referinta secreta.",
    keyTakeaway: "Copierea defensiva atat la intrare (constructor) cat si la iesire (getter) izoleaza complet starea interna a clasei."
  },
  {
    id: "java-198",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Prevenirea Atacurilor de tip Timing Attack cu MessageDigest.isEqual()",
    question: "Ce este un Timing Attack la compararea parolelor sau tokenilor si cum il elimina MessageDigest.isEqual() prin comparare in timp constant?",
    answer: "1. Ce este un Timing Attack (Atac pe baza Timpului de Raspuns):\\n   - Metoda standard String.equals(other) sau Arrays.equals() compara caracterele unul cate unul incepand de la stanga la dreapta.\\n   - In momentul in care intalneste PRIMUL caracter diferit, metoda scurtcircuiteaza si returneaza false IMEDIAT!\\n   - Un atacator poate trimite milioane de cereri si poate masura timpul de raspuns la nivel de nanosecunde: daca cererea a durat cu 20 nanosecunde mai mult, stie sigur ca primele 3 caractere au fost corecte! Poate ghici parole si semnaturi HMAC caracter cu caracter.\\n\\n2. Solutia: Comparare in Timp Constant (Constant-Time Comparison):\\n   - Metoda MessageDigest.isEqual(byte[] digesta, byte[] digestb):\\n   - Parcurge INTREGUL array de octeti pana la capat folosind operatia bitwise OR pe diferente: result |= (a[i] ^ b[i]).\\n   - Timpul de executie este STRICT IDENTIC indiferent daca primul caracter este gresit sau daca toate caracterele se potrivesc, facand imposibila scurgerea de informatii prin analiza de latenta!",
    codeSnippet: `// GRESIT (vulnerabil la Timing Attack pe semnaturi secrete/parole):
if (expectedToken.equals(userToken)) { ... }

// CORECT (sigur impotriva atacurilor de timp):
byte[] expected = expectedSignature.getBytes(StandardCharsets.UTF_8);
byte[] actual = incomingSignature.getBytes(StandardCharsets.UTF_8);

if (MessageDigest.isEqual(expected, actual)) {
    // Autentificare autorizata
}`,
    interviewTrap: "Timing attacks se pot desfasura chiar si peste internet prin masuratori statistice avansate. Orice comparatie de semnaturi webhook, chei API sau tokeni de resetare parola trebuie facuta obligatoriu in timp constant.",
    keyTakeaway: "MessageDigest.isEqual() compara octetii in timp constant fara scurtcircuitare, eliminand riscul atacurilor de tip Timing Attack."
  },
  {
    id: "java-199",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "SecureRandom vs java.util.Random: De ce Random nu este sigur?",
    question: "De ce clasa standard java.util.Random este complet nesigura in aplicatii de securitate si cum genereaza SecureRandom numere criptografice?",
    answer: "1. De ce java.util.Random este Nesigur (Predictibil):\\n   - Foloseste un algoritm Linear Congruential Generator (LCG) simplu cu o stare interna de doar 48 de biti.\\n   - Daca un atacator observa doar 2 valori succesive generate de Random, el poate deduce matematic valoarea exacta a semintei (seed) si poate prezice cu certitudine de 100% toate numerele si tokenii viitori care vor fi generati vreodata!\\n   - In plus, foloseste un AtomicLong intern pe seed, devenind lent sub concurenta.\\n\\n2. SecureRandom (Criptografic Sigur - CSPRNG):\\n   - Foloseste surse de entropie hardware din sistemul de operare (/dev/urandom sau /dev/random pe Linux, CryptoAPI pe Windows).\\n   - Respecta standardele FIPS 140-2; starea interna este complet imprevizibila si non-reversibila.\\n   - Obligatoriu pentru: generare de tokeni de autentificare, parole temporare, coduri OTP 2FA, chei de sesiune, sare (salt) pentru hashing de parole (BCrypt/Argon2).",
    codeSnippet: `// INACCEPTABIL in securitate:
// Random rand = new Random(); int token = rand.nextInt();

// SIGUR din punct de vedere criptografic:
SecureRandom secureRandom = new SecureRandom();
byte[] salt = new byte[16];
secureRandom.nextBytes(salt); // Entropie hardware reala!`,
    interviewTrap: "Pe Linux vechi, apelul SecureRandom.getInstanceStrong() se putea bloca nedefinit daca folosea /dev/random si sistemul nu avea suficienta entropie de tastatura/mouse. In mod normal, new SecureRandom() foloseste surse non-blocante sigure.",
    keyTakeaway: "java.util.Random este predictibil matematic; foloseste exclusiv SecureRandom pentru orice tine de securitate, tokeni sau chei."
  },
  {
    id: "java-200",
    category: "JAVA",
    difficulty: "USOR",
    title: "ThreadLocalRandom: Eliminarea Contention-ului pe Generare de Numere",
    question: "De ce ThreadLocalRandom depaseste masiv java.util.Random in aplicatii multi-threaded concurente?",
    answer: "1. Problema de Performanta cu java.util.Random in Fire Multiple:\\n   - O instanta de java.util.Random partajata intre 10 thread-uri foloseste o variabila atomica interna: private final AtomicLong seed;.\\n   - La fiecare apel nextInt(), toate cele 10 thread-uri incearca sa actualizeze atomul de seed folosind o bucla CAS (Compare-And-Swap).\\n   - Cand concurenta creste, 9 din 10 operatii CAS esueaza continuu si fac retry, generand un blocaj urias pe magistrala CPU.\\n\\n2. Solutia: ThreadLocalRandom (Java 7):\\n   - Mentine semintele (seed-urile) separat direct pe campuri interne din clasa java.lang.Thread curenta.\\n   - Fiecare thread isi actualizeaza propria samanta locala fara niciun AtomicLong, fara lock-uri si cu ZERO sincronizare!\\n   - Ofera generare de numere pseudo-aleatorii aproape la viteza unei simple instructiuni de calcul scalar.",
    codeSnippet: `// Folosire directa in thread-uri concurente:
int randomNum = ThreadLocalRandom.current().nextInt(1, 101); // Numar intre 1 si 100`,
    interviewTrap: "Nu salva niciodata instanta returnata de ThreadLocalRandom.current() intr-o variabila statica partajata! Apeleaza intotdeauna ThreadLocalRandom.current() la cerere pe firul respectiv.",
    keyTakeaway: "ThreadLocalRandom aloca seminte independente per-thread, eliminand complet contention-ul atomic din Random-ul clasic."
  },
  {
    id: "java-201",
    category: "JAVA",
    difficulty: "USOR",
    title: "Statement vs PreparedStatement vs CallableStatement in JDBC",
    question: "Care sunt diferentele de arhitectura si securitate intre Statement, PreparedStatement si CallableStatement si de ce PreparedStatement previne SQL Injection?",
    answer: "1. Statement:\\n   - Folosit pentru executarea de interogari SQL statice simple.\\n   - Trimite textul SQL catre baza de date ca un simplu sir de caractere. La FIECARE executie, motorul DB trebuie sa parseze, sa compileze si sa optimizeze planul de executie de la zero.\\n   - Vulnerabilitate critica: Daca concatenezi variabile de la utilizator (\"SELECT * FROM u WHERE id = \" + input), este 100% vulnerabil la atacuri de tip SQL Injection!\\n\\n2. PreparedStatement (Standardul Absolut):\\n   - Precompileaza interogarea SQL parametrizata (cu semne de intrebare ? placeholders) o singura data in baza de date.\\n   - Reutilizeaza planul de executie compilat pentru rulari repetate (viteza mult mai mare).\\n   - Prevenire SQL Injection: Parametrii transmisi prin setString() sau setInt() sunt trimisi complet separat de codul SQL; baza de date ii trateaza strict ca date literale pasive, facand imposibila injectarea de comenzi SQL malitioase!\\n\\n3. CallableStatement:\\n   - Extinde PreparedStatement; este dedicat apelarii de Proceduri Stocate (Stored Procedures) si Functii din baza de date, suportand parametri de intrare (IN) si parametri de iesire (OUT).",
    codeSnippet: `// PreparedStatement imun la SQL Injection:
String sql = "SELECT * FROM candidates WHERE email = ? AND status = ?";
try (PreparedStatement pstmt = conn.prepareStatement(sql)) {
    pstmt.setString(1, userEmail); // Chiar daca userEmail contine "' OR '1'='1", e tratat ca text!
    pstmt.setString(2, "ACTIVE");
    ResultSet rs = pstmt.executeQuery();
}`,
    interviewTrap: "Daca folosesti PreparedStatement dar concatenezi parametrii manual in loc sa folosesti ? (ex: conn.prepareStatement(\"SELECT * FROM u WHERE id = \" + id)), esti in continuare 100% vulnerabil la SQL Injection!",
    keyTakeaway: "PreparedStatement precompileaza planul SQL si separa datele de instructiuni prin parametri (?), facand aplicatia imuna la SQL Injection."
  },
  {
    id: "java-202",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Connection Pooling in JDBC (HikariCP) si Parametri Critici",
    question: "De ce este deschiderea unei conexiuni JDBC traditionale extrem de lenta si cum optimizeaza HikariCP gestionarea conexiunilor?",
    answer: "1. Costul Deschiderii unei Conexiuni JDBC Clasice (DriverManager):\\n   - O conexiune fizica implica: rezolutie DNS, 3-way handshake TCP/IP, negociere TLS/SSL, autentificare pe serverul DB, alocare de memorie pe serverul PostgreSQL.\\n   - Dureaza intre 50 si 200 milisecunde per request! Daca creezi si inchizi conexiuni manual la fiecare apel HTTP, serverul va suferi o degradare masiva de performanta.\\n\\n2. Ce este un Connection Pool (HikariCP - default in Spring Boot):\\n   - Mentine un \"bazin\" de conexiuni fizice gata deschise si active in fundal.\\n   - Cand aplicatia apeleaza dataSource.getConnection(), HikariCP ii imprumuta instantaneu o conexiune existenta in doar cativa microsecunde!\\n   - Cand apelezi connection.close(), conexiunea NU se inchide fizic; ea este doar curatata (resetata starea de tranzactie) si returnata inapoi in bazin.\\n\\n3. Parametri Critici de Configurare in Productie:\\n   - maximumPoolSize: Numarul maxim de conexiuni fizice active (regula de aur PostgreSQL: core_count * 2 + disk_spindle_count; de regula 10-20 de conexiuni sunt suficiente chiar si pentru mii de cereri/sec!).\\n   - connectionTimeout: Timpul maxim de asteptare pentru o conexiune libera inainte de a arunca exceptie (ex: 30.000 ms).\\n   - maxLifetime: Durata maxima de viata a unei conexiuni inainte de a fi reciclata pentru a preveni memory leaks pe serverul de DB.",
    codeSnippet: `HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/ats_db");
config.setUsername("ats_user");
config.setPassword("secret");
config.setMaximumPoolSize(10);           // Bounded pool
config.setConnectionTimeout(30000);      // 30s timeout
HikariDataSource dataSource = new HikariDataSource(config);`,
    interviewTrap: "Multi dezvoltatori cred ca marirea pool-ului la 200 de conexiuni creste viteza. In realitate, un pool supradimensionat provoaca \"Connection Thrashing\" si satura procesorul serverului de baza de date cu schimbari de context.",
    keyTakeaway: "HikariCP reutilizeaza conexiuni pre-deschise reducand latenta de la 100ms la microsecunde; pastreaza pool-ul mic si eficient."
  },
  {
    id: "java-203",
    category: "JAVA",
    difficulty: "MEDIU",
    title: "Top 4 Cauze Comune de Memory Leaks in Aplicatii Java de Productie",
    question: "Cum poate aparea un Memory Leak intr-un limbaj cu Garbage Collector automat si care sunt cele mai frecvente 4 cauze in productie?",
    answer: "Un Memory Leak in Java nu inseamna memorie pierduta fizic de OS, ci obiecte care NU MAI SUNT UTILE aplicatiei, dar raman agatate printr-un lant de referinte tari (Strong References) pana la un GC Root, impiedicand Garbage Collector-ul sa le elibereze:\\n\\nCele mai Frecvente 4 Cauze in Productie:\\n1. Colectii Statice fara Curatare (Static Collections):\\n   - Campurile declared static (ex: public static Map<String, User> cache = new HashMap<>()) traiesc pe toata durata de viata a aplicatiei. Daca adaugi elemente si nu ai o politica de evacuare (LRU sau TTL), mapa creste la infinit pana la OOM.\\n2. ThreadLocal ne-curatat in Thread Pools (Tomcat/Executors):\\n   - Thread-urile dintr-un pool sunt refolosite permanent. Daca pui date in ThreadLocal si nu apelezi remove() intr-un bloc finally, datele raman stocate pe firul de executie la infinit.\\n3. Listeners si Callbacks ne-deregistrati:\\n   - Daca inregistrezi un listener intr-un serviciu singleton cu viata lunga, dar uiti sa il dezabonezi cand componenta moare, singletonul retine intreaga componenta in viata.\\n4. Resurse Neinchise (Unclosed Streams, DB Connections):\\n   - Conexiuni JDBC, socket-uri sau fisiere uitate deschise.",
    codeSnippet: `// 1. Memory leak tipic cu ThreadLocal:
public void processRequest() {
    try {
        USER_CONTEXT.set(new UserContext("admin"));
        doBusinessLogic();
    } finally {
        USER_CONTEXT.remove(); // OBLIGATORIU! Fara asta, datele raman pe firul reutilizat!
    }
}`,
    interviewTrap: "Folosirea unei chei mutabile intr-un HashSet sau HashMap: daca adaugi un obiect si apoi ii modifici un camp folosit la hashCode, nu mai poti gasi niciodata obiectul pentru a-l sterge (remove() esueaza silentios), lasandu-l blocat in memorie.",
    keyTakeaway: "Memory Leaks in Java apar prin referinte tari uitate (colectii statice, ThreadLocal necuratat, listeners); se rezolva prin igiena riguroasa a ciclului de viata."
  },
  {
    id: "java-204",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce Thread.sleep() pastreaza lock-urile in timp ce Object.wait() le elibereaza?",
    question: "Care este diferenta critica de comportament asupra lock-urilor (monitoarelor) intre Thread.sleep() si Object.wait()?",
    answer: "Aceasta este o intrebare clasica de interviu:\\n\\n1. Thread.sleep(milliseconds):\\n   - Este o metoda statica a clasei Thread.\\n   - Pune firul curent de executie la somn pentru o durata determinata de timp.\\n   - NU ELIBEREAZA NICIUN LOCK! Daca firul se afla intr-un bloc synchronized, el continua sa tina lock-ul strans in timp ce doarme. Niciun alt fir nu poate accesa resursa respectiva pe toata durata somnului, putand cauza blocaje masive in aplicatie!\\n\\n2. Object.wait():\\n   - Este o metoda de instanta a clasei Object.\\n   - Este conceputa pentru comunicare si coordonare intre fire.\\n   - ELIBEREAZA IMEDIAT monitorul (lock-ul) obiectului pe care a fost apelata! Firul este trecut in Wait Set-ul obiectului si renunta la control, permitand altor fire sa intre in blocul sincronizat si sa modifice starea sau sa apeleze notify().",
    codeSnippet: `// 1. sleep: Tine lock-ul ocupat in timp ce doarme (Blocant pentru altii):
synchronized (lock) {
    Thread.sleep(5000); // Toti ceilalti asteapta 5 secunde!
}

// 2. wait: Elibereaza lock-ul si permite altora sa progreseze:
synchronized (lock) {
    lock.wait(); // Elibereaza lock-ul pe 'lock' si doarme pana la notify()
}`,
    interviewTrap: "Daca apelezi sleep() in interiorul unei tranzactii sau a unei metode synchronized de inalta frecventa, vei crea instantaneu un blocaj artificial de performanta pentru toti ceilalti utilizatori.",
    keyTakeaway: "sleep() doarme tinand lock-urile ocupate; wait() elibereaza lock-ul obiectului pentru a permite altor fire sa execute."
  },
  {
    id: "java-205",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce apelul Thread.run() NU porneste un thread nou?",
    question: "Ce se intampla daca apelezi thread.run() in loc de thread.start() si de ce este o greseala frecventa a incepatorilor?",
    answer: "1. Ce face thread.start():\\n   - Apeleaza o metoda nativa JVM (private native void start0()) care cere sistemului de operare alocarea unui fir nou de executie nativ si a unei stive dedicate.\\n   - Noul fir este planificat independent si va executa corpul metodei run() in paralel cu firul apelant.\\n\\n2. Ce face thread.run():\\n   - Este o simpla metoda Java obisnuita declarata in interfata Runnable.\\n   - Daca apelezi direct thread.run(), NU se creeaza niciun fir nou! Metoda se va executa sincron si secvential exact pe firul curent apelant (ex: firul main)!\\n   - Firul principal va fi blocat asteptand terminarea metodei run(), anuland complet orice idee de paralelism.",
    codeSnippet: `Thread t = new Thread(() -> {
    System.out.println("Ruleaza pe: " + Thread.currentThread().getName());
});

// 1. Apel gresit (ruleaza pe firul curent main):
t.run(); // Afiseaza: "Ruleaza pe: main"

// 2. Apel corect (creeaza un fir nou in paralel):
t.start(); // Afiseaza: "Ruleaza pe: Thread-0"`,
    interviewTrap: "Daca apelezi start() de doua ori pe aceeasi instanta de Thread (ex: t.start(); t.start();), JVM va arunca intotdeauna la runtime: IllegalThreadStateException (un fir nu poate fi restartat dupa pornire).",
    keyTakeaway: "start() aloca un fir nou nativ de OS si ruleaza asincron; run() este o metoda normala care se executa sincron pe firul curent."
  },
  {
    id: "java-206",
    category: "JAVA",
    difficulty: "USOR",
    title: "De ce este recomandat EnumSet in loc de Bitwise Flags (int)?",
    question: "De ce ghidurile de bune practici (Effective Java) recomanda EnumSet in locul mastilor de biti pe intregi (Bit Field Pattern)?",
    answer: "1. Modelul Vechi de Masti pe Biti (Bit Fields - stil C):\\n   - public static final int STYLE_BOLD = 1 << 0; (1)\\n   - public static final int STYLE_ITALIC = 1 << 1; (2)\\n   - public static final int STYLE_UNDERLINE = 1 << 2; (4)\\n   - Combinare prin: applyStyles(STYLE_BOLD | STYLE_ITALIC);\\n   - Defecte majore: Nu exista Type Safety (poti transmite orice numar arbitrar int precum 999 fara nicio eroare la compilare); depanarea in log-uri este oribila (afiseaza doar un numar intreg bizar \"3\" in loc de nume lizibile); nu poti itera usor peste optiuni.\\n\\n2. Solutia Moderna: EnumSet\\n   - Definesti un Enum curat: public enum Style { BOLD, ITALIC, UNDERLINE }\\n   - Creezi setul: EnumSet.of(Style.BOLD, Style.ITALIC);\\n   - Este 100% Type-Safe la compilare.\\n   - Performanta este IDENTICA cu operatiile pe biti primitive, deoarece intern EnumSet foloseste exact aceleasi masti de biti pe un camp long (bit vector)!",
    codeSnippet: `public enum Permission { READ, WRITE, EXECUTE }

// Type-Safe, lizibil si la fel de rapid ca masca de biti pe procesor:
Set<Permission> perms = EnumSet.of(Permission.READ, Permission.WRITE);

if (perms.contains(Permission.WRITE)) {
    System.out.println("Are drept de scriere");
}`,
    interviewTrap: "EnumSet este la fel de rapid ca int bitmask, dar ofera siguranta compilatorului, lizibilitate totala in JSON/log-uri si metode declarative (allOf, noneOf, complementOf).",
    keyTakeaway: "EnumSet combina siguranta si lizibilitatea Enum-urilor cu viteza operatiilor pe biti, eliminand complet mastile int invechite."
  },
  {
    id: "java-207",
    category: "JAVA",
    difficulty: "USOR",
    title: "Objects.requireNonNull() si Validari Defensive",
    question: "Cum folosesti utilitarele din java.util.Objects (requireNonNull, requireNonNullElse) pentru a scrie cod defensiv curat?",
    answer: "Clasa utilitara java.util.Objects (Java 7/9) elimina codul boilerplate plin de if (x == null) throw new...:\\n\\n1. Objects.requireNonNull(T obj, String message):\\n   - Verifica daca parametrul este null. Daca este null, arunca imediat un NullPointerException clar cu mesajul specificat.\\n   - Daca nu este null, RETURNEAZA valoarea verificata! Permite utilizarea fluenta direct in atribuirea campurilor in constructori intr-o singura linie.\\n\\n2. Objects.requireNonNullElse(T obj, T defaultObj) (Java 9):\\n   - Returneaza primul parametru daca nu este null, sau valoarea default specificata daca primul este null (fara a aloca obiecte Optional suplimentare).\\n\\n3. Objects.equals(a, b):\\n   - Compara doua obiecte fiind complet imun la NullPointerException (daca ambele sunt null returneaza true, daca doar unul e null returneaza false fara crash).",
    codeSnippet: `public class CandidateService {
    private final CandidateRepository repo;
    private final String defaultRole;

    public CandidateService(CandidateRepository repo, String defaultRole) {
        // Validare si atribuire atomica pe o singura linie:
        this.repo = Objects.requireNonNull(repo, "Repository nu poate fi null");
        this.defaultRole = Objects.requireNonNullElse(defaultRole, "CANDIDATE");
    }
}`,
    interviewTrap: "Daca nu faci validare defensiva cu requireNonNull in constructor, obiectul tau va fi creat pe Heap cu un camp null ascuns, iar NullPointerException-ul va sari mult mai tarziu intr-o alta metoda greu de depanat.",
    keyTakeaway: "Objects.requireNonNull valideaza si returneaza valoarea intr-o singura linie, asigurand fail-fast la instantiere."
  },
  {
    id: "java-208",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "AtomicReferenceFieldUpdater: De ce il folosesc Framework-urile de Top?",
    question: "De ce biblioteci de inalta performanta precum Netty si Spring folosesc AtomicReferenceFieldUpdater in loc de mii de instante AtomicReference?",
    answer: "1. Problema de Memorie cu AtomicReference:\\n   - Daca ai o structura de date (ex: un nod de graf, o conexiune de retea, sau un buffer Netty) instantiata de 10.000.000 de ori:\\n   - Daca fiecare nod contine un private final AtomicReference<Node> next = new AtomicReference<>();:\\n   - Vei aloca 10.000.000 de instante suplimentare de AtomicReference pe Heap! Fiecare AtomicReference are propriul sau header de obiect (16 octeti) si referinta (8 octeti), irosind sute de Megabytes de RAM doar pe wrappere!\\n\\n2. Solutia: AtomicReferenceFieldUpdater (sau AtomicIntegerFieldUpdater):\\n   - Se declara o SINGURA instanta STATICA de updater pe intreaga clasa: private static final AtomicReferenceFieldUpdater<Node, Node> UPDATER;.\\n   - Campul din interiorul nodului ramane o simpla variabila volatila normala: private volatile Node next;!\\n   - Updaterul executa instructiuni CAS atomice direct pe campul volatil prin Reflection de inalta performanta, cu ZERO obiecte alocate suplimentar pe instanta!",
    codeSnippet: `public class Node {
    private volatile Node next; // Camp volatil obisnuit (zero obiect wrapper!)

    // O singura instanta statica pentru toata aplicatia:
    private static final AtomicReferenceFieldUpdater<Node, Node> NEXT_UPDATER =
        AtomicReferenceFieldUpdater.newUpdater(Node.class, Node.class, "next");

    public boolean casNext(Node expected, Node newNext) {
        return NEXT_UPDATER.compareAndSet(this, expected, newNext);
    }
}`,
    interviewTrap: "Campul tinta trebuie sa fie obligatoriu declarat volatile si non-static, altfel newUpdater() va arunca IllegalArgumentException: Must be volatile type.",
    keyTakeaway: "AtomicFieldUpdater aplica operatii CAS direct pe campuri volatile existente fara a aloca obiecte wrapper, economisind memorie masiva."
  },
  {
    id: "java-209",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Foreign Function & Memory (FFM) API in Java 22 (JEP 454)",
    question: "Cum inlocuieste Foreign Function and Memory (FFM) API vechiul mecanism JNI (Java Native Interface) si accesul direct la memoria Off-Heap?",
    answer: "1. Cosmarul Istoric al JNI (Java Native Interface):\\n   - Necesita scrierea manuala de cod C/C++, compilarea de biblioteci native (.so/.dll) pentru fiecare platforma, generarea de headere cu javah.\\n   - Daca un apel nativ greseste un pointer, intregul proces JVM crapa cu Segmentation Fault (Core Dump).\\n\\n2. Ce aduce FFM API (Standardizat complet in Java 22):\\n   - Permite programelor Java sa apeleze functii native din biblioteci C (ex: glibc, OpenSSL, OpenGL) DIRECT DIN JAVA fara nicio linie de cod C intermediar!\\n   - Permite gestionarea sigura a memoriei native in afara Heap-ului (Off-Heap) prin Arena si MemorySegment:\\n     - Arena.ofConfined(): Memorie legata de un singur fir, eliberata garantat si deterministic la inchidere.\\n     - Arena.ofShared(): Memorie partajabila concurent intre multiple fire.\\n   - Siguranta: JVM valideaza limitele spatiale si temporale ale memoriei native, eliminand Use-After-Free si buffer overflows.",
    codeSnippet: `// Apel direct al functiei strlen din biblioteca standard C (Java 22):
Linker linker = Linker.nativeLinker();
SymbolLookup stdlib = linker.defaultLookup();
MemorySegment strlenAddr = stdlib.find("strlen").orElseThrow();

MethodHandle strlen = linker.downcallHandle(strlenAddr, 
    FunctionDescriptor.of(ValueLayout.JAVA_LONG, ValueLayout.ADDRESS));

try (Arena arena = Arena.ofConfined()) {
    MemorySegment cString = arena.allocateFrom("Hello from Java 22!");
    long len = (long) strlen.invoke(cString);
    System.out.println("Lungime string C: " + len); // 19
}`,
    interviewTrap: "FFM API este oficial standardizat in Java 22 (JEP 454). A revolutionat ecosistemul Java permitand integrarea instantanee a modelelor AI (LLaMA C++, TensorRT) direct in Java.",
    keyTakeaway: "FFM API inlocuieste JNI si Unsafe, permitand apeluri native C si alocari sigure off-heap direct din cod Java pur."
  },
  {
    id: "java-210",
    category: "JAVA",
    difficulty: "DIFICIL",
    title: "Pregatirea pentru Interviul Tehnic Java Senior: Cele 5 Semnale Majore",
    question: "Care sunt cele 5 semnale calitative pe care un intervievator tehnic de nivel Senior / Staff le urmareste in rezolvarea unei probleme de cod in Java?",
    answer: "La un interviu de nivel Senior sau Lead, intervievatorii nu testeaza doar daca codul compileaza, ci urmaresc 5 semnale de maturitate inginereasca:\\n\\n1. Intelegerea Implicatiilor de Memorie si GC:\\n   - Candidatul nu se gandeste doar la algoritm, ci constientizeaza amprenta de memorie pe Heap (ex: evita crearea inutila de milioane de obiecte temporare, alege tipuri primitive sau colectii optime, previne memory leaks pe thread pools).\\n2. Siguranta Concurentei si a Firelor (Thread-Safety):\\n   - Abordeaza proactiv concurenta: stie cand sa foloseasca imutabilitatea in loc de sincronizare greoaie, intelege JMM (Happens-Before, volatile, atomics) si cand se preteaza Virtual Threads.\\n3. Stapanirea Colectiilor si a Complexitatii Big-O:\\n   - Alege structura de date ideala nu doar teoretic, ci si practic (intelege de ce ArrayList bate LinkedList pe hardware modern datorita CPU cache-ului, intelege functionarea HashMap-ului).\\n4. Clean Code si Idiomuri Moderne de Limbaj:\\n   - Scrie cod expresiv folosind facilitati moderne (Java 17/21 Records, Sealed Classes, Pattern Matching, Streams corecte, Optional elegant).\\n5. Tratarea Robusta a Erorilor si a Resurselor:\\n   - Nu lasa blocuri catch goale, foloseste try-with-resources garantat pe orice resursa I/O, nu ignora intreruperile si foloseste fail-fast defensive coding.",
    codeSnippet: `// Semnatura codului de nivel Senior:
// - Imutabilitate prin Records si unmodifiable collections
// - Validare defensiva rapida prin Objects.requireNonNull
// - Stream-uri declarative curate si concise
public record UserSummary(String username, int orderCount) {
    public UserSummary {
        Objects.requireNonNull(username, "Username obligatoriu");
        if (orderCount < 0) throw new IllegalArgumentException("Contor negativ");
    }
}`,
    interviewTrap: "Cea mai mare greseala la interviurile de senior este tacerea sau saritul direct in scrierea de cod fara clarificarea cerintelor nefunctionale (volum de date, concurenta, cerinte de latenta).",
    keyTakeaway: "Un Java Senior exceleaza prin: constientizarea memoriei, design thread-safe prin imutabilitate, colectii optime si cod modern curat."
  }
];
