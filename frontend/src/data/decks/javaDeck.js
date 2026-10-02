// ============================================================================
// JAVA INTERVIEW FLASHCARD DECK - JUNIOR & MID LEVEL (210 Realistic Questions)
// ============================================================================
// Focus: Junior & Mid developer interview preparation (Zero Senior/Staff traps)
// Strictly ZERO diacritics for clean encoding and maximum compatibility.
//
// Categories covered:
// 1. Java Core & OOP (01-35)
// 2. Memory, JVM & Strings (36-50)
// 3. Collections & Data Structures (51-85)
// 4. Lambdas, Functional Interfaces & Streams API (86-114)
// 5. Optional & Java Date/Time API (115-130)
// 6. I/O, NIO.2 & Serialization (131-140)
// 7. Modern Java: Records, Sealed Classes, Switch Expressions (141-147)
// 8. Concurrency & Multithreading (148-176)
// 9. JDBC & Persistence (177-182)
// 10. Design Patterns & SOLID Principles (183-198)
// 11. Reflection, Annotations & Core Java Essentials (199-210)
// ============================================================================

export const JAVA_DECK = [
  {
    id: "java-01",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cei 4 Piloni ai Programarii Orientate pe Obiecte (OOP)",
    question: "Care sunt cei 4 piloni fundamentali ai OOP si cum se aplica fiecare in limbajul Java?",
    answer: "Cei 4 piloni fundamentali ai OOP sunt:\\n1. Incapsulare (Encapsulation):\\n   - Ascunderea starii interne a obiectului si restrictionarea accesului direct prin modificatori (private) si expunerea controlata prin metode getter si setter.\\n2. Mostenire (Inheritance):\\n   - Capacitatea unei clase copil de a prelua proprietatile si metodele unei clase parinte folosind cuvantul cheie extends, promovand reutilizarea codului.\\n3. Polimorfism (Polymorphism):\\n   - Capacitatea unui obiect de a lua mai multe forme. Exista polimorfism la compilare (Overloading - supraincarcare) si la executie (Overriding - suprascriere de metode).\\n4. Abstractizare (Abstraction):\\n   - Ascunderea detaliilor complexe de implementare si expunerea doar a interfetei esentiale catre utilizator (prin interfete si clase abstracte).",
    codeSnippet: `// 1. Incapsulare: campuri private cu getteri/setteri
public class Account {
    private double balance; // ascuns
    public double getBalance() { return balance; }
}

// 2. Mostenire:
public class SavingsAccount extends Account {}

// 3. Polimorfism:
Account acc = new SavingsAccount();

// 4. Abstractizare:
public interface PaymentService { void pay(double amount); }`,
    interviewTrap: "Multi candidati confunda Abstractizarea cu Incapsularea. Incapsularea ascunde datele/starea (data hiding), in timp ce Abstractizarea ascunde complexitatea implementarii (implementation hiding).",
    keyTakeaway: "OOP se bazeaza pe Incapsulare (protectie date), Mostenire (reutilizare), Polimorfism (forme multiple) si Abstractizare (interfata esentiala)."
  },
  {
    id: "java-02",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Clasa vs Obiect in Java",
    question: "Care este diferenta dintre o clasa si un obiect in Java si cum se aloca memoria?",
    answer: "1. Clasa (Tiparul / Blueprint):\\n   - Este o definitie logica, un sablon abstract care descrie starea (campuri) si comportamentul (metode) pe care le vor avea obiectele.\\n   - Nu ocupa memorie pe Heap pentru date de instanta; definitia de clasa este incarcata o singura data in Metaspace de catre ClassLoader.\\n\\n2. Obiectul (Instanta Reala):\\n   - Este o instanta concreta, fizica a unei clase creata la runtime folosind operatorul new (ex: new Car()).\\n   - Fiecare obiect are propria sa stare independenta stocata in memoria Heap a masinii virtuale (JVM).\\n   - Variabila care retine obiectul (ex: Car c) este o referinta stocata pe Stiva (Stack) care puncteaza catre adresa obiectului din Heap.",
    codeSnippet: `// Clasa (Tipar logic):
public class Car {
    String model;
}

// Obiecte (Instante fizice pe Heap):
Car car1 = new Car(); // Obiect 1 in Heap
Car car2 = new Car(); // Obiect 2 in Heap (stare separata)`,
    interviewTrap: "Daca declari Car c;, nu ai creat niciun obiect, ci doar o referinta nula (null) pe stiva. Obiectul fizic apare doar dupa executia operatorului new.",
    keyTakeaway: "Clasa este reteta definita in cod; obiectul este prajitura concreta alocata pe Heap la runtime cu new."
  },
  {
    id: "java-03",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este un Constructor si Constructorul Default",
    question: "Ce rol are un constructor in Java si cand genereaza compilatorul un constructor implicit (default constructor)?",
    answer: "1. Ce este un Constructor:\\n   - Un bloc special de cod apelat automat la crearea unei noi instante a unei clase folosind operatorul new.\\n   - Rolul sau principal este initializarea campurilor si a starii obiectului.\\n   - Are exact acelasi nume cu clasa si NU ARE niciun tip de retur (nici macar void!).\\n\\n2. Constructorul Default (Implicit):\\n   - Daca NU declari niciun constructor explicit in clasa, compilatorul Java adauga automat un constructor public fara parametri: public MyClass() { super(); }.\\n   - Acest constructor initializeaza campurile cu valorile lor implicite (0, null, false).\\n\\n3. Cand DISPARE Constructorul Default:\\n   - Daca declari chiar si un singur constructor cu parametri (ex: public MyClass(String name)), compilatorul NU mai genereaza constructorul default! Apelul new MyClass() va arunca eroare de compilare.",
    codeSnippet: `public class User {
    private String name;

    // Daca adaugi acest constructor cu parametri:
    public User(String name) {
        this.name = name;
    }
}

// In alt fisier:
// User u = new User(); // CRASH la compilare! Constructorul default nu mai exista!
User u = new User("Alex"); // Corect!`,
    interviewTrap: "Daca pui tip de retur pe un constructor (ex: public void User()), Java il trateaza ca pe o simpla metoda normala si NU ca pe un constructor!",
    keyTakeaway: "Constructorul initializeaza instanta; daca adaugi un constructor cu parametri, trebuie sa declari manual constructorul fara parametri daca ai nevoie de el."
  },
  {
    id: "java-04",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Constructor Chaining: this() si super()",
    question: "Ce este Constructor Chaining si ce reguli stricte impune Java pentru apelurile this() si super()?",
    answer: "Constructor Chaining reprezinta procesul prin care un constructor apeleaza un alt constructor din aceeasi clasa (folosind this(...)) sau din superclasa parinte (folosind super(...)):\\n\\nReguli Fundamentale Stricte:\\n1. Apelul this() sau super() TREBUIE sa fie strict pe PRIMA LINIE executabila a constructorului!\\n2. Nu poti avea ambele apeluri this() si super() in acelasi constructor (doar unul pe prima linie).\\n3. Nu poti crea apeluri circulare (Constructor 1 apeleaza this() catre Constructor 2, iar Constructor 2 apeleaza inapoi Constructor 1 - eroare de compilare: recursive constructor invocation).\\n4. Daca nu pui explicit super() sau this(), compilatorul Java insereaza automat super() fara parametri pe prima linie a oricarui constructor.",
    codeSnippet: `public class Employee {
    private String name;
    private int salary;

    public Employee(String name) {
        this(name, 3000); // Apeleaza celalalt constructor din aceeasi clasa (pe prima linie!)
    }

    public Employee(String name, int salary) {
        super(); // Apeleaza constructorul parintelui Object
        this.name = name;
        this.salary = salary;
    }
}`,
    interviewTrap: "Daca clasa parinte nu are constructor fara parametri, iar copilul nu apeleaza explicit super(argumente) pe prima linie, codul copilului nu va compila.",
    keyTakeaway: "this() apeleaza alt constructor din clasa; super() apeleaza constructorul parintelui; ambele trebuie sa stea obligatoriu pe prima linie."
  },
  {
    id: "java-05",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cuvantul cheie this in Java",
    question: "Ce reprezinta cuvantul cheie this in Java si care sunt cele 3 situatii frecvente in care este utilizat?",
    answer: "Cuvantul cheie this este o variabila de referinta implicita care puncteaza catre INSTANTA CURENTA a obiectului in care este executat codul:\\n\\nCele 3 Utilizari Principale:\\n1. Diferentierea campurilor de instanta de parametri (Shadowing):\\n   - Cand parametrul constructorului are acelasi nume cu campul clasei: this.name = name;.\\n2. Apelarea altui constructor din aceeasi clasa (Constructor Chaining):\\n   - this(param1, param2); pe prima linie a constructorului.\\n3. Transmiterea obiectului curent ca parametru sau returnarea lui (Method Chaining / Fluent API):\\n   - return this; in clase de tip Builder pentru a inlantui metode.",
    codeSnippet: `public class Person {
    private String name;

    public Person setName(String name) {
        this.name = name; // this.name este campul; name este parametrul
        return this;     // Returneaza instanta curenta pentru chaining
    }
}`,
    interviewTrap: "Cuvantul cheie this NU poate fi folosit niciodata intr-o metoda statica sau bloc static, deoarece metodele statice apartin clasei si nu au o instanta asociata.",
    keyTakeaway: "this se refera la instanta curenta a obiectului pe Heap si rezolva ambiguitatile de nume intre campuri si parametri."
  },
  {
    id: "java-06",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cuvantul cheie super in Java",
    question: "Ce face cuvantul cheie super in Java si cand este necesar sa il folosim?",
    answer: "Cuvantul cheie super este o referinta directa catre SUPERCLASA (clasa parinte) a obiectului curent:\\n\\nCele 3 Utilizari Principale:\\n1. Apelarea constructorului din clasa parinte:\\n   - super() sau super(arg1, arg2) pe prima linie a constructorului subclasei.\\n2. Apelarea unei metode din parinte care a fost suprascrisa (Overridden):\\n   - Daca subclasa a suprascris metoda display(), poti apela implementarea originala din parinte folosind super.display();.\\n3. Accesarea unui camp din parinte daca subclasa a declarat un camp cu acelasi nume (Field Shadowing):\\n   - super.message acceseaza campul din parinte, in timp ce this.message acceseaza campul copilului.",
    codeSnippet: `class Animal {
    void makeSound() { System.out.println("Sunet generic"); }
}

class Dog extends Animal {
    @Override
    void makeSound() {
        super.makeSound(); // Apeleaza codul din parinte
        System.out.println("Ham ham!"); // Adauga comportament propriu
    }
}`,
    interviewTrap: "Nu poti folosi super.super.method() pentru a sari peste parintele direct si a accesa un bunic; Java respecta incapsularea ierarhica directa.",
    keyTakeaway: "super permite invocarea metodelor si constructorilor din clasa parinte directa."
  },
  {
    id: "java-07",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Method Overloading vs Method Overriding",
    question: "Care este diferenta esentiala dintre Overloading (supraincarcare) si Overriding (suprascriere) in Java?",
    answer: "1. Method Overloading (Supraincarcare):\\n   - Are loc in ACEEASI clasa (sau mostenita fara schimbare de comportament).\\n   - Metodele au ACELASI nume, dar liste de parametri DIFERITE (numar, tip sau ordine diferita a parametrilor).\\n   - Tipul de retur POATE fi diferit, dar NU este suficient singur pentru a distinge metodele.\\n   - Este rezolvat la COMPILARE (Compile-time / Polimorfism static).\\n\\n2. Method Overriding (Suprascriere):\\n   - Are loc intre clase diferite aflate intr-o relatie de MOSTENIRE (Parinte -> Copil).\\n   - Metoda din copil are EXACT aceeasi semnatura (acelasi nume si exact aceiasi parametri) ca in parinte.\\n   - Ofera o implementare specifica pentru clasa copil.\\n   - Este rezolvat la RUNTIME (Polimorfism dinamic pe baza obiectului real din memorie).",
    codeSnippet: `// 1. Overloading (aceeasi clasa, parametri diferiti):
class Printer {
    void print(String s) { System.out.println(s); }
    void print(int i) { System.out.println(i); }
}

// 2. Overriding (subclasa rescrie comportamentul):
class Animal { void speak() { System.out.println("..."); } }
class Cat extends Animal {
    @Override
    void speak() { System.out.println("Miau"); }
}`,
    interviewTrap: "Daca schimbi doar tipul de return (ex: int add(int a) si double add(int a)), codul NU compileaza! Compilatorul nu poate deosebi apelurile dupa tipul de return.",
    keyTakeaway: "Overloading = aceeasi clasa, parametri diferiti (la compilare); Overriding = subclasa cu exact aceeasi semnatura (la runtime)."
  },
  {
    id: "java-08",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Adnotarea @Override: De ce este recomandata?",
    question: "Ce rol are adnotarea @Override si de ce este o buna practica sa o folosesti intotdeauna cand suprascrii o metoda?",
    answer: "1. Ce face @Override:\\n   - Este o adnotare de compilare (Compile-time check) care informeaza compilatorul Java ca metoda urmatoare este intentionata sa suprascrie o metoda dintr-o superclasa sau interfata.\\n\\n2. De ce este FOARTE RECOMANDATA:\\n   - Previne greselile de tastare (typo bugs): Daca scrii din greseala tostring() in loc de toString(), fara @Override compilatorul crede ca ai creat o metoda noua oarecare. Cu @Override, compilatorul va arunca eroare de compilare: \"method does not override or implement a method from a supertype\".\\n   - Detecteaza modificari in parinte: Daca cineva schimba parametrii metodei in superclasa, toate subclasele cu @Override vor semnala imediat eroarea la compilare.\\n   - Creste masiv lizibilitatea codului pentru colegii de echipa.",
    codeSnippet: `class Parent {
    public void execute(String command) {}
}

class Child extends Parent {
    @Override // Protejeaza impotriva erorilor de semnatura
    public void execute(String command) {
        System.out.println("Executing: " + command);
    }
}`,
    interviewTrap: "Adnotarea @Override este optionala la nivel sintactic (codul va functiona si fara ea daca semnatura se potriveste), dar omiterea ei este considerata un semn de neglijenta la interviuri.",
    keyTakeaway: "@Override forteaza compilatorul sa valideze ca metoda chiar suprascrie o metoda parinte, prevenind bug-uri tacute de tastare."
  },
  {
    id: "java-09",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Poti suprascrie o metoda statica sau privata in Java?",
    question: "Poti face Override pe o metoda statica sau privata in Java? Ce este fenomenul de Method Hiding?",
    answer: "1. Metode Private:\\n   - NU pot fi suprascrise! Metodele private sunt invizibile in afara clasei lor.\\n   - Daca declari o metoda cu acelasi nume intr-o subclasa, este o metoda noua complet independenta, fara nicio legatura de polimorfism.\\n\\n2. Metode Statice (Method Hiding):\\n   - NU pot fi suprascrise prin polimorfism dinamic!\\n   - Metodele statice sunt legate de CLASA (la compile-time pe baza tipului referintei), nu de instanta de pe Heap.\\n   - Daca o subclasa defineste o metoda statica cu aceeasi semnatura ca in parinte, are loc \"Method Hiding\" (metoda copilului o ascunde pe cea din parinte, dar nu o suprascrie polimorfic).",
    codeSnippet: `class Parent {
    public static void print() { System.out.println("Parent"); }
}
class Child extends Parent {
    public static void print() { System.out.println("Child"); } // Method Hiding
}

Parent p = new Child();
p.print(); // Afiseaza "Parent"! Decizia se ia pe baza tipului referintei (Parent)!`,
    interviewTrap: "Daca pui @Override pe o metoda statica din subclasa, codul NU compileaza! Compilatorul va spune explicit: \"static methods cannot be annotated with @Override\".",
    keyTakeaway: "Metodele statice si private nu se suprascriu polimorfic; metodele statice cu acelasi nume produc Method Hiding legat la compilare."
  },
  {
    id: "java-10",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Clasa Abstracta vs Interfata in Java",
    question: "Care sunt principalele diferente dintre o clasa abstracta si o interfata in Java modern?",
    answer: "1. Clasa Abstracta (Abstract Class):\\n   - Poate avea stare: poate contine campuri de instanta (variabile non-finale, mutabile).\\n   - Poate avea constructori (apelati prin super() de catre subclase).\\n   - Suporta mostenire simpla: o clasa poate extinde o SINGURA clasa abstracta.\\n   - Poate avea metode cu orice modificator de acces (private, protected, public).\\n\\n2. Interfata (Interface):\\n   - Defineste un contract de comportament pur.\\n   - Campurile sunt implicit public static final (doar constante!). Nu poate avea stare de instanta.\\n   - NU are constructori si nu poate fi instantiata.\\n   - O clasa poate implementa MULTIPLE interfete (implements InterfaceA, InterfaceB).\\n   - In Java 8+ poate avea metode cu implementare: metode default si metode static (iar in Java 9+ si metode private).",
    codeSnippet: `// Clasa abstracta: defineste stare comuna + comportament
public abstract class Vehicle {
    protected int speed; // Camp mutabil
    public Vehicle(int speed) { this.speed = speed; } // Constructor
    public abstract void drive();
}

// Interfata: defineste capabilitati
public interface Flyable {
    void fly(); // metoda abstracta
    default void glide() { System.out.println("Gliding..."); } // Java 8 default
}`,
    interviewTrap: "Daca relatia este de tip \"IS-A\" (Cainele ESTE UN Animal) si ai stare comuna, folosesti clasa abstracta. Daca relatia este \"CAN-DO\" (un avion POATE SA zboare - Flyable), folosesti interfata.",
    keyTakeaway: "Clasa abstracta are stare, campuri mutabile si constructori; interfata defineste un contract comportamental cu mostenire multipla."
  },
  {
    id: "java-11",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce Java nu suporta Mostenirea Multipla de Clase?",
    question: "De ce Java nu permite unei clase sa extinda mai multe clase parinte simultan si ce este Diamond Problem?",
    answer: "1. Problema Diamantului (The Diamond Problem):\\n   - Imagineaza-ti ca Clasa B si Clasa C extind ambele Clasa A si ambele suprascriu metoda start().\\n   - Daca Clasa D ar putea extinde simultan atat B cat si C (class D extends B, C), ce s-ar intampla la apelul d.start()?\\n   - JVM nu ar sti pe care implementare sa o execute: pe cea din B sau pe cea din C? Aceasta ambiguitate grava creeaza haos in limbaje precum C++.\\n\\n2. Decizia Creatorilor Java (James Gosling):\\n   - Pentru simplitate si robustete, Java interzice mostenirea multipla de clase.\\n   - In schimb, Java permite implementarea de MULTIPLE INTERFETE, deoarece interfetele traditionale nu aveau stare interna.\\n   - Chiar si cu metode default in Java 8, daca doua interfete au aceeasi metoda default, Java forteaza compilarea sa esueze pana cand clasa copil suprascrie explicit metoda conflictuala.",
    codeSnippet: `// Java NU permite:
// class D extends B, C {} // EROARE DE COMPILARE!

// Java permite mostenire multipla de INTERFETE:
class D implements InterfaceB, InterfaceC {
    @Override
    public void start() {
        InterfaceB.super.start(); // Rezolvare clara a alegerii!
    }
}`,
    interviewTrap: "Java suporta mostenire multipla de TIP / COMPORTAMENT (prin interfete), dar NU suporta mostenire multipla de STARE / IMPLEMENTARE (de clase).",
    keyTakeaway: "Mostenirea multipla de clase este interzisa pentru a elimina ambiguitatea Diamond Problem; se rezolva prin interfete multiple."
  },
  {
    id: "java-12",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este cuvantul cheie final pe Variabile, Metode si Clase?",
    question: "Ce efect are cuvantul cheie final atunci cand este aplicat pe o variabila, pe o metoda si pe o clasa in Java?",
    answer: "Cuvantul cheie final exprima conceptul de imutabilitate sau restrictionare:\\n\\n1. Pe o Variabila (final variable):\\n   - Valoarea variabilei NU mai poate fi schimbata odata initializata (devine o constanta).\\n   - Daca este o referinta catre un obiect, referinta nu poate fi reatribuita (nu poti face obj = other), DAR starea interna a obiectului poate fi modificata daca obiectul este mutabil!\\n\\n2. Pe o Metoda (final method):\\n   - Metoda NU mai poate fi suprascrisa (overridden) in nicio subclasa copil.\\n   - Folosit pentru securitate, pentru a garanta ca logica metodei nu este alterata.\\n\\n3. Pe o Clasa (final class):\\n   - Clasa NU mai poate fi extinsa / mostenita (nimeni nu poate face extends MyClass).\\n   - Exemple clasice din JDK: java.lang.String, Integer, Double, System.",
    codeSnippet: `// 1. Clasa finala (nu poate fi mostenita):
public final class ImmutableValue {}

// 2. Metoda finala (nu poate fi suprascrisa):
public class Base {
    public final void securityCheck() {}
}

// 3. Variabila finala:
final List<String> list = new ArrayList<>();
list.add("Java"); // Permis! Starea interna se modifica.
// list = new ArrayList<>(); // CRASH la compilare! Referinta e finala.`,
    interviewTrap: "final pe o lista (final List l) NU face lista imutabila! Poti face linistit list.add(), doar variabila l nu poate fi reatribuita.",
    keyTakeaway: "final blocheaza: reatribuirea variabilei, suprascrierea metodei si mostenirea clasei."
  },
  {
    id: "java-13",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este cuvantul cheie static in Java?",
    question: "Ce inseamna cuvantul cheie static aplicat pe o variabila sau metoda si unde este stocat in memorie?",
    answer: "Cuvantul cheie static leaga membrul respectiv direct de CLASA, si nu de o instanta individuala:\\n\\n1. Variabile Statice (Campuri de Clasa):\\n   - Exista o SINGURA copie a variabilei partajata intre toate obiectele instantiate din acea clasa.\\n   - Daca Obiectul 1 modifica variabila statica, Obiectul 2 va vedea imediat valoarea modificata.\\n   - Stocata in Metaspace/Heap asociata metadatelor clasei.\\n\\n2. Metode Statice:\\n   - Pot fi apelate direct folosind numele clasei (ex: Math.max(a, b), String.valueOf(10)), fara a instantia clasa cu new.\\n   - Nu au acces la \"this\" sau \"super\" si NU pot accesa direct campuri non-statice de instanta.\\n\\n3. Bloc Static (static { ... }):\\n   - Ruleaza o singura data la incarcarea clasei in memorie de catre ClassLoader.",
    codeSnippet: `public class Counter {
    public static int globalCount = 0; // Partajat de toate instantele!
    public int instanceCount = 0;      // Propriu fiecarei instante

    public static void increment() {
        globalCount++; // Permis
        // instanceCount++; // EROARE de compilare! Non-static field inside static method!
    }
}

Counter.increment(); // Apel direct pe clasa fara 'new'!`,
    interviewTrap: "O metoda statica nu poate apela o metoda non-statica direct fara sa creeze explicit un new MyClass(), deoarece metoda non-statica are nevoie de starea unui obiect.",
    keyTakeaway: "static apartine clasei ca intreg si este partajat de toate instantele; se apeleaza direct pe numele clasei fara new."
  },
  {
    id: "java-14",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ordinea de Initializare la Instantierea unei Clase",
    question: "In ce ordine se executa blocurile statice, campurile de instanta, constructorul parinte si constructorul copil la crearea unui obiect?",
    answer: "Ordinea exacta de executie in JVM este intotdeauna urmatoarea:\\n\\n1. Membrii Statici (o singura data la prima utilizare a clasei):\\n   - 1.1 Blocurile statice si campurile statice ale Parintelui (in ordinea scrierii in cod).\\n   - 1.2 Blocurile statice si campurile statice ale Copilului.\\n\\n2. Instantierea Obiectului (la fiecare new Child()):\\n   - 2.1 Blocurile de instanta si campurile de instanta ale Parintelui.\\n   - 2.2 Constructorul Parintelui (super()).\\n   - 2.3 Blocurile de instanta si campurile de instanta ale Copilului.\\n   - 2.4 Constructorul Copilului.",
    codeSnippet: `class Parent {
    static { System.out.println("1. Static Parent"); }
    { System.out.println("3. Instance Parent"); }
    Parent() { System.out.println("4. Constructor Parent"); }
}

class Child extends Parent {
    static { System.out.println("2. Static Child"); }
    { System.out.println("5. Instance Child"); }
    Child() { System.out.println("6. Constructor Child"); }
}

// Executie: new Child();
// Afiseaza exact: 1 -> 2 -> 3 -> 4 -> 5 -> 6`,
    interviewTrap: "Blocurile statice se executa o singura data in toata viata aplicatiei. La al doilea new Child(), pasii 1 si 2 NU se mai executa deloc!",
    keyTakeaway: "Ordinea este: Statici Parinte -> Statici Copil -> Instanta Parinte -> Constructor Parinte -> Instanta Copil -> Constructor Copil."
  },
  {
    id: "java-15",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Modificatorii de Acces: private, default, protected, public",
    question: "Care este diferenta de vizibilitate intre cei 4 modificatori de acces din Java si unde se poate accesa fiecare?",
    answer: "Cei 4 modificatori controleaza incapsularea si securitatea codului:\\n\\n1. private (Cel mai restrictiv):\\n   - Accesibil EXCLUSIV in interiorul aceleiasi clase.\\n\\n2. default (Package-Private - cand nu pui niciun modificator):\\n   - Accesibil in aceeasi clasa SI in toate clasele aflate in ACELASI PACHET.\\n   - Nu este vizibil in alte pachete, nici macar in subclase.\\n\\n3. protected:\\n   - Accesibil in aceeasi clasa, in acelasi pachet,\\n   - SI in toate subclasele copil din ALTE PACHETE (prin mostenire).\\n\\n4. public (Cel mai permisiv):\\n   - Accesibil de oriunde din intreaga aplicatie.",
    codeSnippet: `package com.ats.model;

public class Candidate {
    private String ssn;         // Doar in Candidate
    String packageNote;         // In com.ats.model
    protected String status;    // In com.ats.model + subclase din orice pachet
    public String name;         // De oriunde
}`,
    interviewTrap: "Daca o clasa din alt pachet mosteneste o clasa cu camp protected, ea il poate accesa prin mostenire (this.status), dar NU pe o instanta nou creata din exterior (new Parent().status e ilegal).",
    keyTakeaway: "private = doar clasa; default = acelasi pachet; protected = pachet + subclase externe; public = global."
  },
  {
    id: "java-16",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "De ce Java este STRICT Pass-by-Value si NU Pass-by-Reference?",
    question: "De ce Java este considerat strict Pass-by-Value chiar si atunci cand transmitem obiecte ca parametri in metode?",
    answer: "1. Ce inseamna Pass-by-Value:\\n   - Cand transmiti o variabila unei metode, Java face intotdeauna o COPIE A VALORII acelei variabile si o plaseaza pe stiva metodei apelate.\\n\\n2. Cazul Tip Primitive (int, boolean):\\n   - Se copiaza valoarea binara (ex: numarul 5). Modificarile din metoda nu afecteaza variabila originala.\\n\\n3. Cazul Obiecte (Referinte):\\n   - Variabila care tine un obiect este de fapt o ADRESA (o referinta) catre obiectul din Heap.\\n   - Java COPIAZA ACEASTA ADRESA!\\n   - De aceea poti modifica proprietatile interioare ale obiectului (p.setName(\"Nou\")) pentru ca ambele referinte arata catre acelasi obiect pe Heap;\\n   - DAR daca incerci sa reatribui referinta (p = new Person(\"Altul\")), modifici DOAR copia locala de referinta! Referinta originala a apelantului ramane neschimbata!",
    codeSnippet: `void modify(Person p) {
    p.setName("Mihai"); // Modifica obiectul comun pe Heap (VIZIBIL afara)
    p = new Person("Ion"); // Reatribuie copia locala de adresa (INVIZIBIL afara)
}

Person person = new Person("Alex");
modify(person);
System.out.println(person.getName()); // Afiseaza "Mihai", NICIODATA "Ion"!`,
    interviewTrap: "Multi candidati spun gresit: \"Primitivele se transmit prin valoare, iar obiectele se transmit prin referinta\". Raspunsul corect 100%: Toate se transmit prin valoare; in cazul obiectelor valoarea transmisa este copia referintei.",
    keyTakeaway: "Java este strict pass-by-value; la obiecte copiaza valoarea referintei de memorie."
  },
  {
    id: "java-17",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Clasa java.lang.Object si Metodele sale Principale",
    question: "Ce este clasa Object in Java si care sunt cele mai importante metode mostenite de toate clasele?",
    answer: "java.lang.Object este clasa radacina a intregii ierarhii de clase din Java. Daca o clasa nu extinde explicit alta clasa, compilatorul adauga automat extends Object.\\n\\nCele mai importante metode mostenite de orice clasa:\\n1. boolean equals(Object obj): Compara egalitatea logica a doua obiecte (implicit compara adresele cu ==).\\n2. int hashCode(): Returneaza o valoare hash intreaga asociata obiectului pentru tabele de dispersie.\\n3. String toString(): Returneaza reprezentarea text a obiectului (implicit NumeClasa@HexHashCode).\\n4. Class<?> getClass(): Returneaza metadatele clasei la runtime (pentru Reflection).\\n5. Object clone(): Creeaza o copie shallow a obiectului (daca implementeaza Cloneable).\\n6. wait(), notify(), notifyAll(): Metode de sincronizare si comunicare intre thread-uri.",
    codeSnippet: `Object obj = new Object();
System.out.println(obj.toString()); // ex: java.lang.Object@2f92e0f4
System.out.println(obj.hashCode()); // ex: 798154996
System.out.println(obj.getClass().getName()); // java.lang.Object`,
    interviewTrap: "Implementarea implicita a lui equals() din clasa Object face pur si simplu this == obj (compara adresele fizice din Heap). De aceea trebuie suprascrisa pentru egalitate logica de campuri.",
    keyTakeaway: "Object este parintele universal in Java si furnizeaza metode de baza: equals, hashCode, toString, getClass, wait, notify."
  },
  {
    id: "java-18",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Contractul equals() si hashCode() in Java",
    question: "Care este contractul dintre metodele equals() si hashCode() si ce problema grava apare in HashSet/HashMap daca nu le suprascrii impreuna?",
    answer: "Contractul dintre equals() si hashCode() stipuleaza doua reguli fundamentale:\\n1. Daca doua obiecte sunt egale conform equals(), ele TREBUIE sa returneze acelasi hashCode() garantat!\\n2. Daca doua obiecte au acelasi hashCode(), NU este obligatoriu sa fie egale (fenomenul de coliziune hash).\\n\\nCe problema grava apare daca suprascrii doar equals():\\n- Cand adaugi un obiect intr-un HashSet sau ca si cheie intr-un HashMap, JVM foloseste hashCode() pentru a alege bucket-ul din array.\\n- Daca nu ai suprascris hashCode(), se va folosi hashCode-ul din clasa Object (adresa de memorie a instantei).\\n- Doua obiecte identice ca si continut vor primi hash-uri complet diferite si vor fi puse in bucket-uri diferite!\\n- Rezultat: get(key) va returna NULL, iar HashSet-ul va accepta duplicate!",
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
        return Objects.hash(id, email); // OBLIGATORIU impreuna cu equals!
    }
}`,
    interviewTrap: "Campurile folosite in hashCode() trebuie sa fie imutabile. Daca adaugi un obiect intr-un HashSet si apoi ii modifici un camp folosit in hashCode, nu il mai poti gasi niciodata pentru a-l sterge!",
    keyTakeaway: "Daca suprascrii equals(), suprascrie intotdeauna si hashCode(), altfel structurile de tip HashSet si HashMap devin complet corupte."
  },
  {
    id: "java-19",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce este util sa suprascrii metoda toString()?",
    question: "Ce returneaza metoda toString() din clasa Object si de ce este o buna practica sa o suprascrii in clasele de model (POJO / DTO)?",
    answer: "1. Comportamentul Implicit din Object.toString():\\n   - Returneaza un sir de forma: getClass().getName() + \"@\" + Integer.toHexString(hashCode()).\\n   - Exemplu: com.ats.Candidate@7852e922.\\n   - Acest text este complet inutil la debugging si logare, deoarece nu iti arata ce date se afla in interiorul obiectului!\\n\\n2. De ce o Suprascriem:\\n   - Pentru a oferi o reprezentare text clara, lizibila si informativa a starii obiectului (ex: Candidate[id=101, name=Alex, email=alex@test.com]).\\n   - Este apelata automat cand afisezi obiectul cu System.out.println(obj), cand il concatenezi intr-un String (str + obj) sau cand il logezi cu log.info(\"User: {}\", obj).",
    codeSnippet: `public class User {
    private String username;
    private String role;

    @Override
    public String toString() {
        return "User{username='" + username + "', role='" + role + "'}";
    }
}`,
    interviewTrap: "Nu include campuri sensibile (precum parole in text clar, coduri PIN sau tokeni secrete de securitate) in metoda toString(), deoarece vor aparea accidental in logurile de productie!",
    keyTakeaway: "toString() ofera reprezentarea text a obiectului pentru logging si debugging; suprascrie-o intotdeauna dar exclude datele confidentiale."
  },
  {
    id: "java-20",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Operatorul instanceof si Pattern Matching in Java 16",
    question: "Ce face operatorul instanceof si cum simplifica Pattern Matching for instanceof (Java 16) verificarea si conversia de tip?",
    answer: "1. Ce face operatorul clasic instanceof:\\n   - Verifica la runtime daca un obiect este o instanta a unei anumite clase sau implementeaza o anumita interfata.\\n   - Returneaza true daca obiectul este compatibil, sau false daca nu este sau daca obiectul este null.\\n\\n2. Codul Vechi Incomod (Inainte de Java 16):\\n   - Dupa if (obj instanceof String), trebuia sa scrii o linie suplimentara de cast explicit: String s = (String) obj;.\\n   - Cod redundant si predispus la erori.\\n\\n3. Pattern Matching for instanceof (Java 16 - JEP 394):\\n   - Permite declararea unei variabile tinta direct in verificarea instanceof: if (obj instanceof String s).\\n   - Daca conditia este true, variabila \"s\" este deja creata si convertita automat la tipul String, gata de folosit imediat!",
    codeSnippet: `// 1. Modul clasic (invechit cu cast):
if (obj instanceof String) {
    String s = (String) obj;
    System.out.println(s.toUpperCase());
}

// 2. Modul modern Java 16+ (Pattern Matching):
if (obj instanceof String s) {
    System.out.println(s.toUpperCase()); // "s" este deja String!
}`,
    interviewTrap: "Daca verifici null instanceof MyClass, expresia returneaza intotdeauna false fara sa arunce NullPointerException.",
    keyTakeaway: "Pattern matching for instanceof combina verificarea de tip cu cast-ul automat intr-o singura instructiune eleganta."
  },
  {
    id: "java-21",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este o Interfata Marker (Marker Interface)?",
    question: "Ce este o Interfata Marker in Java, ce metode contine si da 3 exemple celebre din JDK?",
    answer: "1. Ce este o Interfata Marker (Tagging Interface):\\n   - Este o interfata care NU CONTINE NICIUN camp si NICIO metoda (complet goala).\\n   - Rolul sau este de a \"eticheta\" sau \"marca\" o clasa, semnalizand masinii virtuale JVM sau altor framework-uri ca obiectul poseda o anumita proprietate speciala.\\n\\n2. Cele 3 Exemple Canonice din JDK:\\n   - java.io.Serializable: Semnaleaza JVM-ului ca obiectul are voie sa fie convertit intr-un flux de octeti pentru salvare pe disc sau transfer peste retea.\\n   - java.lang.Cloneable: Semnaleaza metodei Object.clone() ca este permisa clonarea camp cu camp a obiectului (fara ea, clone() arunca CloneNotSupportedException).\\n   - java.util.RandomAccess: Semnaleaza ca o colectie (ex: ArrayList) suporta acces instantaneu O(1) la orice index, permitand algoritmilor sa aleaga bucle for clasice in loc de iteratori.",
    codeSnippet: `// Exemplu Marker Interface:
public class Candidate implements Serializable {
    private static final long serialVersionUID = 1L;
    private String name;
    // Nicio metoda obligatorie de implementat!
}`,
    interviewTrap: "In Java modern, rolul de marcare a fost preluat in mare parte de Adnotari (@Entity, @Deprecated), dar interfetele marker istorice raman fundamentale in JDK.",
    keyTakeaway: "O interfata marker este complet vida si serveste doar ca eticheta de metadate pentru JVM (Serializable, Cloneable, RandomAccess)."
  },
  {
    id: "java-22",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce String este Imutabil in Java?",
    question: "De ce este clasa String declarata final si imutabila in Java si ce beneficii aduce?",
    answer: "Un obiect String nu isi poate modifica continutul niciodata dupa creare. Motivele majore de design sunt:\\n\\n1. String Constant Pool (Economie de Memorie):\\n   - JVM poate partaja aceeasi instanta textuala intre mii de referinte fara riscul ca un thread sa modifice textul altuia.\\n2. Securitate (Security):\\n   - Parametrii de conexiune la retea, parolele, URL-urile si caile de fisiere sunt String-uri. Daca erau mutabile, un fir atacator putea altera calea dupa validarea de securitate.\\n3. Thread-Safety Garantat:\\n   - Obiectele imutabile sunt thread-safe prin definitie. Pot fi partajate liber intre fire fara niciun lock sau synchronized.\\n4. Caching HashCode:\\n   - Hash-ul unui String este calculat o singura data la prima apelare si retinut intr-un camp privat cache. Deoarece textul nu se schimba, hashCode-ul ramane identic, facand String-ul cheia perfecta pentru HashMap.",
    codeSnippet: `String s1 = "java";
s1.toUpperCase(); // Creeaza un obiect NOU in memorie, nu-l modifica pe s1!
System.out.println(s1); // Afiseaza tot "java"!

String s2 = s1.toUpperCase(); // Salveaza referinta catre noul String
System.out.println(s2); // "JAVA"`,
    interviewTrap: "Metodele din String precum replace(), toUpperCase(), trim() NU modifica string-ul existent; ele returneaza intotdeauna un obiect NOU pe care trebuie sa il capturezi.",
    keyTakeaway: "String este imutabil pentru economie de memorie (String Pool), securitate, thread-safety si performanta in HashMap."
  },
  {
    id: "java-23",
    category: 'JAVA',
    difficulty: "USOR",
    title: "String Constant Pool si new String(\"abc\")",
    question: "Ce este String Constant Pool (SCP) si ce se intampla in memorie la executia instructiunii String s = new String(\"test\")?",
    answer: "1. Ce este String Constant Pool:\\n   - O zona speciala de memorie situata in Heap unde masina virtuala stocheaza o singura copie a fiecarui literal de sir de caractere.\\n   - Daca scrii String s1 = \"test\"; si String s2 = \"test\";, ambele variabile primesc exact aceeasi referinta de memorie din Pool (s1 == s2 este true!).\\n\\n2. Ce se intampla la new String(\"test\"):\\n   - Se creeaza DOUA obiecte in memorie (daca literalul \"test\" nu era deja in Pool):\\n     - Obiectul 1: Literalul \"test\" este adaugat in String Constant Pool.\\n     - Obiectul 2: Operatorul new forteaza alocarea unui obiect NOU, separat, in spatiul general al Heap-ului!\\n   - Referinta s puncteaza catre obiectul din Heap, nu catre cel din Pool (de aceea s == \"test\" este false!).",
    codeSnippet: `String s1 = "job"; // Referinta din String Pool
String s2 = "job"; // Aceeasi referinta din Pool
System.out.println(s1 == s2); // TRUE!

String s3 = new String("job"); // Obiect nou in Heap!
System.out.println(s1 == s3); // FALSE!
System.out.println(s1.equals(s3)); // TRUE (continut identic)
System.out.println(s1 == s3.intern()); // TRUE (intern aduce referinta din Pool)`,
    interviewTrap: "Folosirea lui new String(\"text\") este aproape intotdeauna un anti-pattern care iroseste memorie. Foloseste intotdeauna literali directi: String s = \"text\";.",
    keyTakeaway: "String Constant Pool refoloseste sirurile identice; new String() creeaza un obiect duplicat inutil in Heap."
  },
  {
    id: "java-24",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Operatorul == vs metoda equals() in Java",
    question: "Care este diferenta dintre operatorul == si metoda equals() si de ce nu comparam niciodata obiecte cu ==?",
    answer: "1. Operatorul == (Egalitate de Referinta / Adresa):\\n   - Pentru tipuri primitive (int, double): Compara direct VALORILE numerice binare (ex: 5 == 5 este true).\\n   - Pentru obiecte (referinte): Compara ADRESELE DE MEMORIE! Verifica daca ambele variabile puncteaza catre exact aceeasi instanta fizica pe Heap.\\n   - Daca ai doua obiecte distincte cu exact aceleasi date, == va returna FALSE!\\n\\n2. Metoda .equals() (Egalitate Logica de Continut):\\n   - Este o metoda mostenita din clasa Object si suprascrisa de clase (String, Integer, Date, Candidate).\\n   - Compara CONTINUTUL real al obiectelor (camp cu camp).\\n   - \"test\".equals(new String(\"test\")) returneaza TRUE garantat.",
    codeSnippet: `String a = new String("salut");
String b = new String("salut");

System.out.println(a == b);      // FALSE! (Adrese diferite pe Heap)
System.out.println(a.equals(b));  // TRUE! (Acelasi text)`,
    interviewTrap: "Cand compari un String cu o constanta, scrie intotdeauna \"CONSTANT\".equals(variabila) in loc de variabila.equals(\"CONSTANT\") pentru a fi protejat 100% impotriva lui NullPointerException!",
    keyTakeaway: "== compara adresele de memorie ale obiectelor; equals() compara continutul logic al datelor."
  },
  {
    id: "java-25",
    category: 'JAVA',
    difficulty: "USOR",
    title: "String vs StringBuilder vs StringBuffer",
    question: "Care este diferenta dintre String, StringBuilder si StringBuffer si cand trebuie folosit fiecare?",
    answer: "1. String (Imutabil):\\n   - Orice modificare creeaza un obiect nou. Daca concatenezi siruri intr-o bucla mare (s += i), generezi mii de obiecte temporare si sufoci Garbage Collector-ul.\\n\\n2. StringBuilder (Mutabil, Non-Thread-Safe, Foarte Rapid):\\n   - Modifica textul pe loc intr-un buffer intern fara sa creeze obiecte noi.\\n   - NU este sincronizat (nu foloseste synchronized), fiind cu 50-80% mai rapid decat StringBuffer.\\n   - Este alegerea standard pentru constructia de siruri pe un singur fir (in metode locale).\\n\\n3. StringBuffer (Mutabil, Thread-Safe, Mai Lent):\\n   - Metodele sale (append, insert) sunt sincronizate cu synchronized.\\n   - Poate fi partajat in siguranta intre mai multe fire, dar are cost de sincronizare.",
    codeSnippet: `// INEFICIENT: Creeaza 10.000 obiecte String pe Heap:
String s = "";
for (int i = 0; i < 10000; i++) s += i;

// CORECT & EFICIENT: Un singur obiect mutabil:
StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) sb.append(i);
String result = sb.toString();`,
    interviewTrap: "In Java modern, o simpla concatenare String a = \"a\" + \"b\" + \"c\" pe o singura linie este optimizata automat de compilator prin invokedynamic/StringBuilder. Problema apare doar in bucle (loops).",
    keyTakeaway: "Foloseste String pentru date fixe; StringBuilder pentru concatenari in bucle pe un singur fir; StringBuffer doar la partajare multi-threaded."
  },
  {
    id: "java-26",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Metode Utile din Clasa String: trim vs strip, split, join",
    question: "Ce fac metodele strip() (Java 11), split() si join() din clasa String?",
    answer: "1. trim() vs strip() (Java 11):\\n   - trim(): Elimina spatiile albe de la capete, dar recunoaste doar caractere ASCII (cod <= U+0020).\\n   - strip(): Metoda moderna constienta de standardul Unicode (recunoaste toate spatiile albe Unicode precum spatiile speciale din alte limbi). Se recomanda strip() in Java modern.\\n   - Exista si stripLeading() (doar inceputul) si stripTrailing() (doar sfarsitul).\\n\\n2. String.split(regex):\\n   - Imparte sirul intr-un array de String[] pe baza unui separator.\\n   - Atentie: parametrul este o EXPRESIE REGULATA (Regex)! Pentru a imparti dupa punct trebuie sa pui escape: split(\"\\\\\\\\.\").\\n\\n3. String.join(delimiter, elements) (Java 8):\\n   - Uneste o colectie de siruri folosind un delimitator specificat (ex: String.join(\", \", list)).",
    codeSnippet: `String text = "   Java 21   ";
System.out.println(text.strip()); // "Java 21"

// Split cu regex:
String[] parts = "ion,alex,maria".split(",");

// Join:
String joined = String.join(" - ", "Frontend", "Backend", "QA"); // "Frontend - Backend - QA"`,
    interviewTrap: "Daca apelezi text.split(\".\") crezand ca imparti dupa punct, vei obtine un array gol, deoarece in regex punctul \".\" inseamna \"orice caracter\"! Scrie text.split(\"\\\\\\\\.\") sau Pattern.quote(\".\").",
    keyTakeaway: "strip() elimina spatiile Unicode; split() foloseste regex si cere escape pe caractere speciale; join() uneste siruri cu delimitator."
  },
  {
    id: "java-27",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cum verifici corect daca un String este gol: isEmpty vs isBlank",
    question: "Care este diferenta dintre metoda isEmpty() si isBlank() (Java 11) si de ce este importanta pentru validarea input-urilor?",
    answer: "1. String.isEmpty():\\n   - Returneaza true NUMAI SI NUMAI DACA lungimea sirului este exact zero: length() == 0.\\n   - Un sir format doar din spatii albe (\"   \") NU este considerat empty (isEmpty() returneaza false!).\\n\\n2. String.isBlank() (Introdus in Java 11):\\n   - Returneaza true daca sirul este complet gol (lungime 0) SAU daca contine EXCLUSIV spatii albe (whitespace characters)!\\n   - \"   \".isBlank() returneaza TRUE!\\n\\n3. Bune Practici in Aplicatii:\\n   - Pentru validarea campurilor introduse de utilizatori intr-un formular (nume, email, parola), se foloseste intotdeauna isBlank(), deoarece un utilizator care apasa doar space-uri nu a introdus o valoare reala.",
    codeSnippet: `String s1 = "";
String s2 = "   ";

System.out.println(s1.isEmpty()); // true
System.out.println(s2.isEmpty()); // FALSE! (are lungimea 3)

System.out.println(s1.isBlank()); // true
System.out.println(s2.isBlank()); // TRUE! (contine doar spatii)`,
    interviewTrap: "Daca variabila este null, atat isEmpty() cat si isBlank() vor arunca NullPointerException! Verifica intotdeauna if (str != null && !str.isBlank()) sau foloseste StringUtils.hasText(str) din Spring.",
    keyTakeaway: "isEmpty() cere lungime 0; isBlank() trateaza ca goale si sirurile formate exclusiv din spatii albe."
  },
  {
    id: "java-28",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Text Blocks in Java 15: Sintaxa cu ghilimele triple",
    question: "Ce sunt Text Blocks in Java 15 (ghilimele triple \"\"\" \"\"\") si cum rezolva scrierea de JSON si SQL multi-linie?",
    answer: "1. Problema Veche cu Sirurile Multi-linie:\\n   - Inainte de Java 15, un JSON sau un query SQL trebuia scris prin concatenari obositoare cu +, newline-uri explicite (\\\\n) si escape-uri urate la fiecare ghilimea (\\\\\"). Codul era greu de citit si modificat.\\n\\n2. Ce aduc Text Blocks (Java 15 - JEP 378):\\n   - Permite declararea de siruri de caractere pe mai multe linii folosind trei ghilimele (\"\"\").\\n   - Ghilimelele normale din interior (\"nume\") nu mai necesita escape!\\n   - Elimina automat spatiile de indentare comune de cod (Strip Indentation).\\n\\n3. Regula Sintactica Obligatorie:\\n   - Dupa primele trei ghilimele deschise (\"\"\") TREBUIE sa urmeze obligatoriu o linie noua (newline)! Nu poti pune text pe aceeasi linie.",
    codeSnippet: `// Query SQL lizibil si curat:
String sql = """
    SELECT id, name, email
    FROM users
    WHERE status = 'ACTIVE'
    ORDER BY created_at DESC;
    """;

// JSON curat fara escape:
String json = """
    {
        "role": "DEVELOPER",
        "level": "JUNIOR"
    }
    """;`,
    interviewTrap: "Daca scrii text pe aceeasi linie cu primele trei ghilimele (ex: \"\"\"SELECT...), codul nu va compila!",
    keyTakeaway: "Text Blocks (\"\"\") permit scrierea de JSON si SQL multi-linie fara escape-uri de ghilimele si fara concatenari manuale."
  },
  {
    id: "java-29",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cele 8 Tipuri Primitive in Java si Dimensiunile lor",
    question: "Care sunt cele 8 tipuri de date primitive din Java, ce categorie reprezinta si cati octeti (bytes) ocupa fiecare in memorie?",
    answer: "Java are 8 tipuri primitive stocate direct pe stiva sau inline in obiecte:\\n\\n1. Numere Intregi (Signed Integers):\\n   - byte: 1 byte (8 biti), interval [-128 la 127]\\n   - short: 2 bytes (16 biti), interval [-32.768 la 32.767]\\n   - int (Implicit): 4 bytes (32 biti), ~[-2 miliarde la +2 miliarde]\\n   - long: 8 bytes (64 biti), sufix L (ex: 100L)\\n\\n2. Numere cu Virgula Mobila (Floating Point):\\n   - float: 4 bytes (32 biti), precizie simpla, sufix f (ex: 3.14f)\\n   - double (Implicit): 8 bytes (64 biti), precizie dubla (ex: 3.14)\\n\\n3. Caracter:\\n   - char: 2 bytes (16 biti), stocheaza un caracter Unicode UTF-16 intre ghilimele simple (ex: 'A')\\n\\n4. Valoare Logica:\\n   - boolean: true sau false (teoretic 1 bit, fizic adesea alocat ca 1 byte).",
    codeSnippet: `byte b = 127;
int i = 1_000_000; // Underscore permis pentru lizibilitate
long l = 5_000_000_000L; // 'L' obligatoriu pentru numere mari
double d = 99.99;
char c = 'J';
boolean active = true;`,
    interviewTrap: "Daca scrii long x = 5000000000; fara litera \"L\" la sfarsit, compilatorul arunca eroare \"integer number too large\", deoarece trateaza numerele intregi ca fiind implicit de tip int (pana la 2 miliarde)!",
    keyTakeaway: "Cele 8 primitive sunt: byte(1B), short(2B), int(4B), long(8B), float(4B), double(8B), char(2B), boolean."
  },
  {
    id: "java-30",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Primitive vs Clase Wrapper in Java",
    question: "Care este diferenta dintre un tip primitiv si clasa sa Wrapper (ex: int vs Integer) si cand folosim fiecare?",
    answer: "Fiecarui tip primitiv ii corespunde o clasa Wrapper din pachetul java.lang (int -> Integer, double -> Double, boolean -> Boolean, char -> Character):\\n\\n1. Tip Primitiv (int):\\n   - Stocheaza direct valoarea binara bruta.\\n   - Traieste pe Stiva (Stack) ca variabila locala; alocare si acces ultra-rapide.\\n   - NU POATE FI NICIODATA NULL! Are valoare implicita (0 sau false).\\n   - Nu poate fi folosit in Colectii generice (nu poti scrie List<int>).\\n\\n2. Clasa Wrapper (Integer):\\n   - Este un OBIECT complet instantiat pe Heap care incapsuleaza valoarea primitiva.\\n   - POATE FI NULL (esential pentru baze de date unde coloanele pot fi NULL).\\n   - Poate fi folosit in Collections si Generics (List<Integer>, Map<String, Double>).\\n   - Ofera metode utilitare de conversie (Integer.parseInt(\"123\")).",
    codeSnippet: `int primitive = 10; // Nu poate fi null, zero overhead
Integer wrapper = 10; // Obiect in Heap, poate fi null

List<Integer> list = new ArrayList<>(); // Obligatoriu Wrapper in Colectii!
// List<int> invalidList; // CRASH la compilare! Primitive not allowed in generics`,
    interviewTrap: "Daca folosesti Wrapper in calcule matematice intensive, conversiile repetate (Boxing/Unboxing) consuma memorie si incetinesc procesorul. Foloseste primitive pentru calcule.",
    keyTakeaway: "Primitivele sunt rapide si nu pot fi null; Wrappers sunt obiecte pe Heap capabile sa fie null si folosite in Generics."
  },
  {
    id: "java-31",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Autoboxing, Unboxing si Capcana NullPointerException",
    question: "Ce este Autoboxing si Unboxing in Java si cum poate genera o linie banala de cod o exceptie NullPointerException?",
    answer: "1. Autoboxing (Conversie Automata Primitiv -> Wrapper):\\n   - Conversia automata pe care o face compilatorul Java cand atribuie un primitiv unei clase Wrapper.\\n   - int x = 5; Integer y = x; este transformat intern de compilator in: Integer y = Integer.valueOf(x);.\\n\\n2. Unboxing (Conversie Automata Wrapper -> Primitiv):\\n   - Conversia inversa de la clasa Wrapper la tipul primitiv.\\n   - Integer y = 10; int x = y; este transformat in: int x = y.intValue();.\\n\\n3. Capcana Fatala de NullPointerException (NPE):\\n   - Daca un obiect Wrapper are valoarea NULL iar codul tau incearca sa il foloseasca intr-o expresie primitiva (unboxing), JVM va apela intern .intValue() pe o referinta nula!\\n   - Rezultat: java.lang.NullPointerException instantaneu la runtime pe o linie de atribuire simpla!",
    codeSnippet: `Integer count = null; // Wrapper null (legitim)

// CRASH la runtime: NullPointerException!
// Compilatorul incearca: int total = count.intValue(); pe null!
int total = count; 

// Acelasi pericol in conditii if:
Boolean flag = null;
// if (flag) {} // CRASH: flag.booleanValue() arunca NPE!`,
    interviewTrap: "Aceasta este o intrebare clasica de interviu: \"Poate arunca o simpla atribuire int a = b un NullPointerException?\". Raspunsul: Da, daca b este un Integer wrapper cu valoarea null.",
    keyTakeaway: "Autoboxing converteste automat intre primitive si wrappers; unboxing pe o valoare null arunca NullPointerException."
  },
  {
    id: "java-32",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Integer Cache (-128 la 127) si Comparatia cu ==",
    question: "De ce codul Integer a = 100, b = 100; a == b afiseaza true, dar pentru 200 afiseaza false in Java?",
    answer: "Aceasta intrebare testeaza cunoasterea mecanismului intern de Caching din clasele Wrapper:\\n\\n1. Cum functioneaza Integer Cache:\\n   - Conform specificatiei Java, pentru a economisi memorie la Autoboxing, clasa Integer mentine un cache intern static de obiecte pre-instantiate pentru intervalul de la -128 la +127.\\n   - Cand scrii Integer a = 100;, compilatorul apeleaza Integer.valueOf(100).\\n   - Deoarece 100 se afla in intervalul [-128, 127], Integer.valueOf() returneaza aceeasi instanta partajata din cache pentru ambele variabile a si b.\\n   - Operatorul == compara adresele de memorie, iar ambele refera aceeasi adresa din cache => afiseaza TRUE!\\n\\n2. Ce se intampla la 200:\\n   - Numarul 200 depaseste limita de 127 a cache-ului.\\n   - Integer.valueOf(200) apeleaza intern new Integer(200) pentru a crea un obiect nou pe Heap de fiecare data!\\n   - a si b sunt doua obiecte diferite cu adrese diferite in memorie => a == b afiseaza FALSE!",
    codeSnippet: `Integer a = 100;
Integer b = 100;
System.out.println(a == b); // TRUE! (Vin din Integer Cache)

Integer x = 200;
Integer y = 200;
System.out.println(x == y); // FALSE! (Doua obiecte separate pe Heap)
System.out.println(x.equals(y)); // TRUE! (Continutul logic este egal)`,
    interviewTrap: "Nu compara NICIODATA obiecte Wrapper folosind operatorul ==! Foloseste intotdeauna metoda .equals() pentru a evita bug-uri care apar doar la numere > 127.",
    keyTakeaway: "Integer Cache refoloseste obiectele intre -128 si 127; compara intotdeauna Wrappers cu .equals() si niciodata cu ==."
  },
  {
    id: "java-33",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce folosim BigDecimal si nu double pentru Bani si Finante?",
    question: "De ce este o eroare grava sa folosesti float sau double pentru calcule financiare si cum rezolva BigDecimal problema?",
    answer: "1. De ce double si float sunt GRESITE pentru Bani:\\n   - Tipurile float si double sunt bazate pe standardul binar IEEE 754 cu virgula mobila.\\n   - Multe fractii zecimale simple precum 0.1 sau 0.01 NU POT fi reprezentate exact in sistem binar (baza 2), devenind fractii infinite periodice (la fel cum 1/3 este 0.33333... in baza 10).\\n   - Calculele acumuleaza erori de rotunjire (ex: 0.1 + 0.2 afiseaza 0.30000000000000004!), ducand la pierderi de bani sau bilanturi contabile eronate in productie.\\n\\n2. Solutia: java.math.BigDecimal\\n   - Reprezinta numere zecimale cu precizie arbitrara exacta, fara nicio eroare de rotunjire.\\n   - Permite specificarea explicita a modului de rotunjire (ex: RoundingMode.HALF_UP).",
    codeSnippet: `// GRESIT cu double:
double d1 = 0.1;
double d2 = 0.2;
System.out.println(d1 + d2); // 0.30000000000000004!

// CORECT cu BigDecimal (OBLIGATORIU constructor cu String!):
BigDecimal b1 = new BigDecimal("0.1");
BigDecimal b2 = new BigDecimal("0.2");
BigDecimal sum = b1.add(b2);
System.out.println(sum); // 0.3 exact!`,
    interviewTrap: "Nu folosi NICIODATA constructorul new BigDecimal(0.1) cu parametru double! Acesta va prelua valoarea deja inexacta a double-ului. Foloseste intotdeauna new BigDecimal(\"0.1\") cu String sau BigDecimal.valueOf(0.1).",
    keyTakeaway: "double acumuleaza erori de precizie binara; foloseste intotdeauna BigDecimal cu constructor String pentru aplicatii financiare."
  },
  {
    id: "java-34",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Type Casting: Widening vs Narrowing in Java",
    question: "Care este diferenta dintre Widening Casting (conversie implicita) si Narrowing Casting (conversie explicita) in Java?",
    answer: "1. Widening Casting (Implicit / Fara Pierdere de Date):\\n   - Conversia automata a unui tip mai mic de date intr-un tip mai mare ca dimensiune de octeti.\\n   - Nu necesita niciun operator de cast; compilatorul o face automat deoarece valoarea mai mica incape garantat in spatiul mai mare.\\n   - Ordine: byte -> short -> int -> long -> float -> double.\\n\\n2. Narrowing Casting (Explicit / Cu Risc de Pierdere de Date):\\n   - Conversia manuala a unui tip mai mare intr-un tip mai mic (ex: double in int, sau long in short).\\n   - Necesita CAST MANUAL cu paranteze rotunde: (int) myDouble.\\n   - Risc: Partile zecimale sunt trunchiate (taiate), iar daca numarul depaseste valoarea maxima a tipului mic, va aparea un Data Overflow care returneaza valori complet eronate.",
    codeSnippet: `// 1. Widening (automat):
int myInt = 9;
double myDouble = myInt; // Devine 9.0 automat

// 2. Narrowing (manual cu cast):
double pi = 3.99;
int truncated = (int) pi; // Devine 3 (partea zecimala e stearsa!)

int big = 130;
byte b = (byte) big; // Overflow! byte are maxim 127 -> devine -126!`,
    interviewTrap: "Narrowing cast de la double la int nu face rotunjire matematica (3.99 nu devine 4), ci trunchiaza direct partea fractionara, devenind 3.",
    keyTakeaway: "Widening este sigur si automat (mic -> mare); Narrowing cere cast manual si poate trunchia date sau produce overflow (mare -> mic)."
  },
  {
    id: "java-35",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Operatori Logici: && (Short-Circuit) vs & (Logical AND)",
    question: "Care este diferenta dintre operatorul && (Conditional AND) si & (Logical AND) si cum previne short-circuiting erorile?",
    answer: "1. Operatorul && (Short-Circuit / Scurtcircuitare):\\n   - Daca prima conditie din stanga este FALSE, Java NU MAI EVALUEAZA a doua conditie din dreapta deloc, deoarece rezultatul final este oricum garantat false!\\n   - Acelasi lucru pentru || (Conditional OR): daca prima conditie este TRUE, nu mai evalueaza a doua.\\n   - Vital pentru protectie: permite verificarea de null inainte de a apela o metoda (ex: if (user != null && user.isActive())).\\n\\n2. Operatorul & (Non-Short-Circuit / Bitwise AND):\\n   - Evalueaza INTOTDEAUNA ambele expresii (atat stanga cat si dreapta), chiar daca prima a fost deja false!\\n   - Daca scrii if (user != null & user.isActive()), iar user este null, codul va incerca oricum sa evalueze user.isActive() si va arunca NullPointerException!",
    codeSnippet: `String name = null;

// SIGUR cu && (scurtcircuiteaza la prima conditie falsa):
if (name != null && name.length() > 0) {
    System.out.println("Valid");
}

// CRASH cu & (evalueaza ambele parti!):
// if (name != null & name.length() > 0) // NullPointerException!`,
    interviewTrap: "Foloseste intotdeauna && si || pentru conditii logice booleene; pastreaza & si | strict pentru operatii pe biti numerici.",
    keyTakeaway: "&& scurtcircuiteaza si se opreste la primul false; & evalueaza obligatoriu ambele parti si poate provoca NullPointerException."
  },
  {
    id: "java-36",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Heap Memory vs Stack Memory in JVM",
    question: "Care este diferenta fundamentala dintre memoria Stack (Stiva) si memoria Heap intr-o aplicatie Java?",
    answer: "Memoria JVM este impartita in zone cu roluri complet diferite:\\n\\n1. Stack Memory (Stiva de Executie):\\n   - Fiecare thread are propria sa stiva privata (nu se partajeaza intre fire).\\n   - Stocheaza variabilele locale primitive (int, boolean) si adresele de referinta catre obiecte.\\n   - Stocheaza cadrele de apel ale metodelor (Stack Frames) in regim LIFO (Last-In-First-Out).\\n   - Alocare si eliberare instantanee; memoria se curata automat la intoarcerea din metoda.\\n   - Daca recursivitatea e prea adanca, arunca: java.lang.StackOverflowError.\\n\\n2. Heap Memory (Gramada de Obiecte):\\n   - O singura zona partajata global intre toate firele aplicatiei.\\n   - Stocheaza TOATE OBIECTELE reale instantiate cu new (instante de clase, String-uri, array-uri).\\n   - Curatata automat de Garbage Collector cand obiectele nu mai au referinte.\\n   - Daca se umple, arunca: java.lang.OutOfMemoryError: Java heap space.",
    codeSnippet: `void myMethod() {
    int x = 10;            // x traieste pe STIVA
    Person p = new Person(); // p (referinta) traieste pe STIVA,
                           // dar instanta reala new Person() traieste pe HEAP!
}`,
    interviewTrap: "Variabila din clasa (campul membru) traieste pe Heap ca parte a obiectului, chiar daca este un int primitiv. Doar variabilele locale declarate in interiorul metodelor traiesc pe Stiva.",
    keyTakeaway: "Stiva stocheaza variabile locale si referinte (privata per thread); Heap-ul stocheaza toate obiectele reale (partajat global si curatat de GC)."
  },
  {
    id: "java-37",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este Garbage Collector-ul in Java pe intelesul tuturor?",
    question: "Ce este Garbage Collector-ul (GC) in Java, cum functioneaza si cand devine un obiect eligibil pentru stergere?",
    answer: "1. Ce este Garbage Collector (GC):\\n   - Un proces automat de fundal al masinii virtuale Java (JVM) responsabil cu gestionarea automata a memoriei.\\n   - Spre deosebire de C/C++ unde programatorul trebuie sa elibereze manual memoria prin free() sau delete, in Java Garbage Collector-ul identifica si sterge automat obiectele care nu mai sunt utilizate, eliberand spatiul din Heap.\\n\\n2. Cand devine un Obiect Eligibil pentru GC:\\n   - Un obiect este eligibil pentru colectare cand devine \"Inaccesibil\" (Unreachable) - adica atunci cand NU MAI EXISTA NICIO REFERINTA activa (un lant de legaturi) de la firele de executie curente (GC Roots) catre acel obiect.\\n\\n3. Cum rupem referintele:\\n   - Setand referinta la null (obj = null;).\\n   - Reatribuind referinta (obj = new OtherObject();).\\n   - Iesind din scope-ul unei metode locale (variabila locala dispare de pe stiva).",
    codeSnippet: `Person p1 = new Person("Ion"); // Obiect 1 creat pe Heap
Person p2 = new Person("Ana"); // Obiect 2 creat pe Heap

p1 = p2; // Referinta p1 puncteaza acum catre "Ana"!
// Obiectul "Ion" nu mai are nicio referinta activa -> Devine eligibil pentru GC!`,
    interviewTrap: "Apelul System.gc() NU garanteaza ca Garbage Collector-ul va rula imediat; este doar o sugestie catre JVM pe care acesta o poate amana sau ignora.",
    keyTakeaway: "Garbage Collector elibereaza automat memoria Heap curatand obiectele care nu mai au nicio referinta activa."
  },
  {
    id: "java-38",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este un Memory Leak in Java si un Exemplu Simplu",
    question: "Daca Java are Garbage Collector, cum este posibil sa apara un Memory Leak si care este cel mai simplu exemplu?",
    answer: "1. Ce este un Memory Leak in Java:\\n   - Nu inseamna ca memoria fizica a disparut, ci ca aplicatia continua sa retina REFERINTE TARI (Strong References) catre obiecte de care NU MAI ARE NEVOIE in logica de business!\\n   - Deoarece referinta exista inca in cod, Garbage Collector-ul crede ca obiectul este important si REFUZA sa il stearga.\\n   - In timp, aceste obiecte uitate se acumuleaza in Heap pana cand aplicatia ramane fara memorie si crapa cu OutOfMemoryError.\\n\\n2. Cel mai Simplu Exemplu (Colectie Statica):\\n   - Daca adaugi continuu elemente intr-o lista statica (static List) sau intr-o mapa de cache fara a sterge niciodata intrarile vechi, lista va creste la infinit cat timp aplicatia e pornita!",
    codeSnippet: `public class MemoryLeakDemo {
    // Variabila STATICA traieste pe toata durata de viata a aplicatiei!
    private static final List<byte[]> cache = new ArrayList<>();

    public void processData() {
        cache.add(new byte[1024 * 1024]); // Adauga 1 MB la fiecare cerere HTTP!
        // Uitam sa curatam lista -> Memory Leak garantat!
    }
}`,
    interviewTrap: "GC Roots includ variabile statice si thread-uri active. Obiectele legate de o variabila statica nu vor fi sterse niciodata de GC pana la oprirea JVM.",
    keyTakeaway: "Memory Leak apare cand obiecte inutile raman legate prin referinte uitate (in special in colectii statice), impiedicand GC-ul sa le elibereze."
  },
  {
    id: "java-39",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Semnatura Metodei main in Java: De ce public static void main?",
    question: "De ce metoda principala de pornire in Java are semnatura exacta public static void main(String[] args)?",
    answer: "Fiecare cuvant din semnatura are o ratiune tehnica precisa pentru JVM:\\n\\n1. public:\\n   - Metoda trebuie sa poata fi apelata de JVM din exteriorul clasei si din afara pachetului la pornirea aplicatiei.\\n\\n2. static:\\n   - Permite JVM-ului sa apeleze metoda direct pe clasa (MainClass.main()) FARA a fi nevoie sa creeze o instanta a clasei cu new MainClass(). (Daca nu era statica, cum ar fi stiut JVM ce constructor sa apeleze?).\\n\\n3. void:\\n   - Metoda nu returneaza nicio valoare Java. Daca programul se termina cu un cod de eroare, se foloseste System.exit(int status).\\n\\n4. main:\\n   - Numele standard recunoscut de motorul de executie JVM ca punct fix de intrare in program.\\n\\n5. String[] args:\\n   - Un array de siruri de caractere care captureaza argumentele din linia de comanda transmise la pornire (ex: java App arg1 arg2).",
    codeSnippet: `public class Application {
    public static void main(String[] args) {
        System.out.println("Argumente transmise: " + args.length);
        if (args.length > 0) {
            System.out.println("Primul argument: " + args[0]);
        }
    }
}`,
    interviewTrap: "Daca schimbi semnatura (ex: scoti static sau pui tip de retur int), codul va compila fara eroare, dar la executie JVM va arunca: NoSuchMethodError: main method not found.",
    keyTakeaway: "public permite accesul JVM din exterior; static permite apelul fara instantiere new; void nu returneaza nimic; args preia argumentele din consola."
  },
  {
    id: "java-40",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce Java foloseste Suita de Bytecode si JVM (Platform Independence)?",
    question: "Ce inseamna principiul \"Write Once, Run Anywhere\" (WORA) si care este rolul Bytecode-ului si al JVM-ului?",
    answer: "1. Problema Limbajelor Compilate Nativ (C/C++):\\n   - Codul sursa este compilat direct in instructiuni masina specifice unui anumit procesor si sistem de operare (un binar compilat pe Windows x86 nu ruleaza pe Linux sau Mac ARM).\\n\\n2. Solutia Java (\"Write Once, Run Anywhere\"):\\n   - Compilatorul javac NU genereaza cod masina direct, ci un format intermediar universal de instructiuni numit BYTECODE (fisierele .class).\\n   - Bytecode-ul este identic pe orice calculator din lume!\\n\\n3. Rolul JVM (Java Virtual Machine):\\n   - JVM-ul este masina virtuala specifica fiecarei platforme (exista un JVM dedicat pentru Windows, altul pentru Linux, altul pentru Mac).\\n   - JVM citeste bytecode-ul universal si il traduce la runtime in instructiunile masina native ale procesorului gazda.",
    codeSnippet: `// Pasul 1: Cod Sursa (.java)
//         |
//         v (javac - Java Compiler)
// Pasul 2: Bytecode (.class universal)
//         |
//         +---> JVM Windows -> Cod Masina Windows x86
//         +---> JVM Linux   -> Cod Masina Linux ARM64
//         +---> JVM macOS   -> Cod Masina Apple Silicon`,
    interviewTrap: "Java este platform-independent (bytecode-ul ruleaza oriunde), dar JVM-ul insusi este PLATFORM-DEPENDENT (trebuie sa descarci JDK-ul specific sistemului tau de operare).",
    keyTakeaway: "Compilatorul creeaza Bytecode universal (.class); JVM-ul specific sistemului tau traduce bytecode-ul in cod masina nativ."
  },
  {
    id: "java-41",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ierarhia de Colectii in Java: List, Set, Queue si Map",
    question: "Care este ierarhia principala a interfetelor din Collections Framework si de ce Map NU extinde interfata Collection?",
    answer: "1. Ierarhia Radacina java.lang.Iterable -> java.util.Collection:\\n   - Toate colectiile care stocheaza elemente individuale implementeaza Collection:\\n     - List: Colectie ordonata, indexata, permite DUPLICATE (ArrayList, LinkedList).\\n     - Set: Colectie care NU permite DUPLICATE, defineste unicitate (HashSet, TreeSet).\\n     - Queue: Colectie ordonata pentru procesare in coada FIFO (PriorityQueue, ArrayDeque).\\n\\n2. De ce Map NU extinde Collection:\\n   - Interfata java.util.Map stocheaza PERECHI de cheie-valoare (Key-Value Pairs: Map<K, V>), in timp ce Collection stocheaza ELEMENTE INDIVIDUALE (E).\\n   - Metodele fundamentale din Collection (precum add(E), contains(Object)) sunt incompatibile conceptual cu operatiile pe perechi (put(K, V), containsKey(K), containsValue(V)).\\n   - Map ofera totusi \"views\" catre colectii: keySet(), values(), entrySet().",
    codeSnippet: `// Colectii de elemente unice:
Collection<String> list = new ArrayList<>();
Collection<String> set = new HashSet<>();

// Structura pe perechi:
Map<String, Integer> map = new HashMap<>();
map.put("Alex", 25);`,
    interviewTrap: "Intrebare capcana la interviu: \"Extinde Map interfata Collection?\". Raspunsul este categoric NU; Map este o ierarhie separata paralela.",
    keyTakeaway: "List, Set si Queue extind Collection (elemente individuale); Map este o ierarhie separata pentru perechi cheie-valoare."
  },
  {
    id: "java-42",
    category: 'JAVA',
    difficulty: "USOR",
    title: "List vs Set vs Map: Diferente Fundamentale",
    question: "Care sunt diferentele principale intre o Lista (List), un Set si o Mapa (Map) in utilizarea de zi cu zi?",
    answer: "1. List (Lista):\\n   - Ordonata: Elementele isi pastreaza ordinea in care au fost inserate (Encounter Order).\\n   - Acces prin Index: Poti accesa rapid orice element prin pozitia sa: list.get(0).\\n   - Duplicate: ACCEPTA duplicate (poti avea de 10 ori acelasi element).\\n   - Exemple: ArrayList, LinkedList.\\n\\n2. Set (Multime):\\n   - Unicitate: NU ACCEPTA DUPLICATE! Daca adaugi un element existent, este ignorat.\\n   - Fara Index: Nu exista metoda get(index); elementele sunt parcurse prin for-each sau iterator.\\n   - Exemple: HashSet (fara ordine garantata), TreeSet (sortat dupa valoare).\\n\\n3. Map (Dictionar / Tabela Hash):\\n   - Stocheaza perechi Cheie -> Valoare (Key-Value).\\n   - Cheile sunt UNICE (nu pot exista doua chei identice).\\n   - Valorile pot fi duplicate.\\n   - Exemple: HashMap, TreeMap.",
    codeSnippet: `List<String> list = new ArrayList<>();
list.add("Java"); list.add("Java"); // Dimensiune: 2

Set<String> set = new HashSet<>();
set.add("Java"); set.add("Java");   // Dimensiune: 1 (duplicat ignorat!)

Map<String, Integer> map = new HashMap<>();
map.put("Java", 17);
map.put("Java", 21); // Suprascrie valoarea veche cu 21!`,
    interviewTrap: "Daca adaugi o cheie duplicata intr-un Map (map.put(\"key\", val2)), cheia veche nu se duplica, ci noua valoare o suprascrie pe cea veche si returneaza valoarea veche.",
    keyTakeaway: "List pastreaza ordinea si accepta duplicate; Set garanteaza unicitate fara duplicate; Map leaga chei unice de valori."
  },
  {
    id: "java-43",
    category: 'JAVA',
    difficulty: "USOR",
    title: "ArrayList vs LinkedList: Cand alegi pe fiecare?",
    question: "Care este diferenta structurala dintre ArrayList si LinkedList si de ce ArrayList este aproape intotdeauna preferat in practica?",
    answer: "1. ArrayList (Bazat pe Array Dinamic redimensionabil):\\n   - Stocheaza elementele intr-un array contiguu in memorie.\\n   - Acces la index: O(1) instantaneu (citire rapida prin get(i)).\\n   - Cautare: O(N).\\n   - Inserare/Stergere la final: O(1) amortizat; la mijloc: O(N) (necesita mutarea elementelor urmatoare cu System.arraycopy).\\n   - Extrem de prietenos cu CPU Cache-ul (Localitate spatiala a memoriei).\\n\\n2. LinkedList (Bazat pe Lista Dublu Inlantuita de Noduri):\\n   - Fiecare element este impachetat intr-un nod separat (Node) care retine 3 referinte: valoarea, nodul anterior (prev) si nodul urmator (next).\\n   - Acces la index: O(N) lent (trebuie sa parcurga lista de la capat pana la pozitia dorita).\\n   - Inserare/Stergere la inceput/sfarsit: O(1) rapid.\\n   - Dezavantaj major: Consuma de 3-4 ori mai multa memorie decat ArrayList din cauza pointerilor de noduri si provoaca CPU Cache Miss continuu pe Heap.\\n\\n3. Concluzia din Industrie:\\n   - In 99% din proiectele de productie se foloseste exclusiv ArrayList.",
    codeSnippet: `// Alegerea standard in productie:
List<String> list = new ArrayList<>(); // Rapid, compact in memorie

// LinkedList este util doar daca implementezi Deque/Coada:
Deque<String> queue = new LinkedList<>();`,
    interviewTrap: "Multi candidati cred ca LinkedList este mai rapid la inserari la mijloc decat ArrayList. Fals: desi inserarea nodului este O(1), gasirea pozitiei de inserare necesita o parcurgere O(N) lenta!",
    keyTakeaway: "ArrayList este bazat pe array contiguu si este ultra-rapid datorita cache-ului CPU; LinkedList consuma memorie pe noduri si e rar util."
  },
  {
    id: "java-44",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Cum functioneaza redimensionarea automata a unui ArrayList?",
    question: "Ce se intampla intern intr-un ArrayList cand capacitatea sa este depasita si care este factorul de crestere?",
    answer: "1. Capacitatea Initiala (Default Capacity):\\n   - Cand creezi new ArrayList<>(), array-ul intern Object[] elementData este initial gol (capacitate 0).\\n   - La prima inserare (list.add(\"primul\")), array-ul este alocat cu o capacitate implicita de 10 elemente.\\n\\n2. Mecanismul de Redimensionare (Grow / Resize):\\n   - Cand adaugi al 11-lea element si array-ul este plin:\\n   - JVM calculeaza noua capacitate folosind formula de crestere cu 50%:\\n     nouaCapacitate = vecheaCapacitate + (vecheaCapacitate >> 1); (deplasare pe biti spre dreapta cu 1 inseamna impartire la 2).\\n   - De la 10 creste la 15, de la 15 la 22, de la 22 la 33 etc.\\n   - JVM aloca un array nou mai mare si copiaza toate elementele vechi in cel nou folosind operatia nativa rapida System.arraycopy().\\n\\n3. Optimizare de Bune Practici:\\n   - Daca stii dinainte ca lista va contine 1.000 de elemente, instantiaza: new ArrayList<>(1000) pentru a elimina cele 10-15 redimensionari si copieri intermediare inutile!",
    codeSnippet: `// Fara capacitate: face 10 redimensionari si copieri succesive:
List<Integer> list1 = new ArrayList<>();

// Cu capacitate initiala: O SINGURA alocare, zero copieri:
List<Integer> list2 = new ArrayList<>(10000);`,
    interviewTrap: "Metoda size() returneaza numarul de elemente adaugate efectiv in lista, in timp ce capacitatea interna a array-ului este mai mare si invizibila din exterior.",
    keyTakeaway: "ArrayList creste cu 50% (factor 1.5) la umplere alocand un nou array si copiind datele; pre-dimensioneaza-l daca stii marimea."
  },
  {
    id: "java-45",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Cum functioneaza HashSet intern in Java?",
    question: "Cum garanteaza HashSet unicitatea elementelor si ce structura de date foloseste in spate?",
    answer: "HashSet este o clasa de fatada extrem de inteligenta:\\n\\n1. Structura din Spate:\\n   - HashSet NU are o structura proprie de stocare pe biti; el este construit 100% PESTE UN HashMap INTERN!\\n   - private transient HashMap<E, Object> map;\\n\\n2. Cum se adauga elementele (Garantarea Unicitatii):\\n   - Cand apelezi set.add(\"element\"), HashSet insereaza valoarea ta ca si CHEIE in HashMap-ul intern: map.put(element, PRESENT);\\n   - Deoarece cheile dintr-un HashMap sunt garantat UNICE, daca adaugi acelasi element de doua ori, HashMap-ul suprascrie intrarea si returneaza false, fara a crea duplicate!\\n\\n3. Ce este obiectul PRESENT:\\n   - Un obiect static dummy de tip Object: private static final Object PRESENT = new Object();\\n   - Este folosit ca valoare pasiva comuna pentru toate cheile din HashMap pentru a economisi memorie.",
    codeSnippet: `// Sursa din HashSet.java:
public boolean add(E e) {
    return map.put(e, PRESENT) == null; // Daca returneaza null, a fost inserat cu succes!
}

public boolean contains(Object o) {
    return map.containsKey(o); // Cautare rapida in HashMap O(1)
}`,
    interviewTrap: "Daca adaugi un obiect custom intr-un HashSet, este OBLIGATORIU sa suprascrii equals() si hashCode() in clasa obiectului, altfel HashSet nu va putea detecta duplicatele!",
    keyTakeaway: "HashSet foloseste un HashMap intern stocand elementele tale ca si chei si un obiect dummy PRESENT ca si valoare."
  },
  {
    id: "java-46",
    category: 'JAVA',
    difficulty: "USOR",
    title: "HashSet vs TreeSet vs LinkedHashSet",
    question: "Care sunt diferentele de ordonare si performanta intre HashSet, LinkedHashSet si TreeSet?",
    answer: "Toate cele 3 clase implementeaza interfata Set (fara duplicate), dar au strategii diferite de organizare:\\n\\n1. HashSet (Cel mai rapid):\\n   - Bazat pe tabela de dispersie (HashMap).\\n   - Nu ofera NICIO GARANTIE de ordine! Ordinea parcurgerii se poate schimba oricand la adaugarea de elemente noi.\\n   - Performanta: Operatii add(), remove(), contains() in timp O(1) constant.\\n\\n2. LinkedHashSet (Pastreaza Ordinea de Inserare):\\n   - Extinde HashSet si mentine o lista dublu inlantuita peste toate nodurile.\\n   - Garanteaza parcurgerea elementelor exact in ORDINEA DE INSERARE (Insertion Order).\\n   - Performanta: Aproape la fel de rapid ca HashSet (timp O(1)), cu consum infim mai mare de memorie pe noduri.\\n\\n3. TreeSet (Sortat Natural sau prin Comparator):\\n   - Bazat pe un arbore rosu-negru (TreeMap / Red-Black Tree).\\n   - Mentine elementele STRICT SORTATE crescator conform ordinii naturale (Comparable) sau unui Comparator custom.\\n   - Performanta: Operatii in timp logaritmic O(log N). Elementele trebuie sa fie obligatoriu comparabile!",
    codeSnippet: `Set<String> hash = new HashSet<>(List.of("Z", "A", "M")); // Ordine aleatorie
Set<String> linked = new LinkedHashSet<>(List.of("Z", "A", "M")); // [Z, A, M] (cum au intrat)
Set<String> tree = new TreeSet<>(List.of("Z", "A", "M")); // [A, M, Z] (sortat alfabetic)`,
    interviewTrap: "Daca adaugi un obiect care nu implementeaza Comparable intr-un TreeSet fara a oferi un Comparator in constructor, codul va arunca la runtime: ClassCastException!",
    keyTakeaway: "HashSet e cel mai rapid O(1) fara ordine; LinkedHashSet pastreaza ordinea de inserare; TreeSet mentine elementele sortate O(log N)."
  },
  {
    id: "java-47",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Cum functioneaza HashMap intern pe intelesul tuturor?",
    question: "Explica pas cu pas ce se intampla cand apelam map.put(key, value) si map.get(key) intr-un HashMap?",
    answer: "HashMap stocheaza datele intr-un array de bucket-uri (Node<K, V>[] table):\\n\\nCe se intampla la map.put(key, value):\\n1. Calculeaza Hash-ul: Daca key == null, hash-ul este 0. Altfel, apeleaza key.hashCode() si trece rezultatul printr-o functie de perturbare bitwise.\\n2. Calculeaza Indexul de Bucket: index = hash & (table.length - 1) pentru a gasi pozitia din array.\\n3. Daca bucket-ul este gol: Creeaza un nod nou si il plaseaza direct in array (O(1)).\\n4. Daca bucket-ul este ocupat (Coliziune Hash):\\n   - Parcurge lista de noduri din acel bucket.\\n   - Daca gaseste o cheie cu acelasi hash SI cheie.equals(existingKey), SUPRASCRIE valoarea existenta cu noua valoare.\\n   - Daca nu gaseste nicio cheie egala, adauga noul nod la sfarsitul listei.\\n   - Daca lista dintr-un bucket depaseste 8 noduri iar tabela are >= 64 capacitate, lista se transforma in Red-Black Tree (O(log N)).\\n5. Daca numarul total de elemente depaseste threshold-ul (capacity * 0.75), tabela isi dubleaza capacitatea (Resize).\\n\\nCe se intampla la map.get(key):\\n- Calculeaza hash-ul si indexul bucket-ului, apoi parcurge nodurile comparand cu equals() pana gaseste cheia si returneaza valoarea.",
    codeSnippet: `// Schema mentala a unui bucket cu coliziune:
// table[3] -> [Node1: hash, key1, val1] -> [Node2: hash, key2, val2] -> null`,
    interviewTrap: "Daca uiti sa suprascrii equals() pe clasa cheii, get() va folosi comparatia de adrese din Object si nu va gasi niciodata valoarea inserata cu un alt obiect echivalent!",
    keyTakeaway: "HashMap calculeaza indexul prin hash(&); la coliziuni cauta cheia prin equals() in lista/arborele din bucket."
  },
  {
    id: "java-48",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Ce sunt Load Factor si Initial Capacity in HashMap?",
    question: "Ce reprezinta Initial Capacity si Load Factor in HashMap si cand se declanseaza operatia de Rehashing?",
    answer: "1. Initial Capacity (Capacitatea Initiala):\\n   - Numarul de bucket-uri (dimensiunea array-ului intern) alocat la crearea HashMap-ului.\\n   - Valoarea implicita este 16 (intotdeauna o putere a lui 2).\\n\\n2. Load Factor (Factorul de Incarcare):\\n   - O masura a gradului de umplere a tabelei inainte ca aceasta sa isi mareasca automat capacitatea.\\n   - Valoarea implicita este 0.75 (75%). Ofera un compromis optim intre consumul de spatiu si timpul de cautare.\\n\\n3. Pragul de Redimensionare (Threshold) si Rehashing:\\n   - Threshold = Capacity * Load Factor (ex: 16 * 0.75 = 12 elemente).\\n   - Cand adaugi al 13-lea element in mapa, se declanseaza automat operatia de Resize (Rehashing):\\n     - Se aloca un array nou DUBLU ca marime (de la 16 la 32 de bucket-uri);\\n     - Toate elementele existente sunt re-indexate si redistribuite in noul array.",
    codeSnippet: `// Constructor custom daca stii ca vei avea 100.000 elemente:
// Evita 15 operatii costisitoare de resize si rehash:
Map<String, User> map = new HashMap<>(135000, 0.75f);`,
    interviewTrap: "Un load factor mai mic (ex: 0.5) reduce coliziunile dar iroseste multa memorie. Un load factor prea mare (ex: 0.95) economiseste spatiu dar creste numarul de coliziuni si incetineste cautarile get(). Valoarea default 0.75 este ideala.",
    keyTakeaway: "Initial Capacity este 16, Load Factor este 0.75; la depasirea pragului (12 elemente) capacitatea se dubleaza prin Rehashing."
  },
  {
    id: "java-49",
    category: 'JAVA',
    difficulty: "USOR",
    title: "HashMap vs Hashtable in Java",
    question: "Care sunt diferentele principale intre HashMap si vechea clasa Hashtable si de ce Hashtable este considerata legacy?",
    answer: "1. Sincronizare si Thread-Safety:\\n   - Hashtable (Java 1.0): Este sincronizata pe toate metodele cu synchronized. Poate fi folosita intre fire, dar este extrem de lenta din cauza blocarii intregii mape la fiecare get/put.\\n   - HashMap (Java 1.2): NU este sincronizata (non-thread-safe), fiind mult mai rapida pentru aplicatii uzuale.\\n\\n2. Tratarea Valorilor NULL:\\n   - HashMap: Permite o singura cheie NULL (stocata mereu in bucket-ul 0) si permite oricate valori NULL.\\n   - Hashtable: NU PERMITE NICIODATA chei null sau valori null (arunca instantaneu NullPointerException).\\n\\n3. Concluzia Moderna:\\n   - Hashtable este o clasa istorica invechita (legacy). Daca ai nevoie de o mapa thread-safe in aplicatii moderne, foloseste INTOTDEAUNA ConcurrentHashMap, niciodata Hashtable!",
    codeSnippet: `// Permis in HashMap:
Map<String, String> map = new HashMap<>();
map.put(null, "valoare_pe_null"); // OK!
map.put("cheie", null);           // OK!

// Crapa in Hashtable:
// Hashtable<String, String> table = new Hashtable<>();
// table.put(null, "test"); // CRASH: NullPointerException!`,
    interviewTrap: "Hashtable este parte din vechiul JDK 1.0 impreuna cu Vector si Stack. Toate 3 sunt sincronizate grosier si inlocuite de colectii moderne.",
    keyTakeaway: "HashMap e rapid, non-sincronizat si accepta null; Hashtable este legacy, sincronizat greoi si refuza strict valorile null."
  },
  {
    id: "java-50",
    category: 'JAVA',
    difficulty: "USOR",
    title: "HashMap vs TreeMap vs LinkedHashMap",
    question: "Care sunt cazurile de utilizare si diferentele dintre HashMap, LinkedHashMap si TreeMap?",
    answer: "1. HashMap (Alegerea Implicita Generala):\\n   - Bazat pe tabela de dispersie (Hash Table).\\n   - Nu pastreaza nicio ordine a cheilor.\\n   - Performanta maxima: get() si put() in timp O(1) constant.\\n\\n2. LinkedHashMap (Pastreaza Ordinea):\\n   - Extinde HashMap si leaga nodurile printr-o lista dublu inlantuita.\\n   - Pastreaza ORDINEA DE INSERARE a cheilor (sau ordinea de acces pentru LRU Cache).\\n   - Performanta O(1) rapida, cu consum foarte mic de memorie suplimentar.\\n\\n3. TreeMap (Sortat dupa Chei):\\n   - Bazat pe un arbore rosu-negru (Red-Black Tree).\\n   - Cheile sunt mentinute STRICT SORTATE crescator conform ordinii naturale (Comparable) sau unui Comparator.\\n   - Ofera metode de navigare: firstKey(), lastKey(), subMap().\\n   - Performanta O(log N). Cheile nu pot fi null!",
    codeSnippet: `Map<String, Integer> map = new HashMap<>();
map.put("C", 3); map.put("A", 1); map.put("B", 2); // Ordine impredictibila

Map<String, Integer> linked = new LinkedHashMap<>();
linked.put("C", 3); linked.put("A", 1); linked.put("B", 2); // [C, A, B] (ordinea inserarii)

Map<String, Integer> tree = new TreeMap<>();
tree.put("C", 3); tree.put("A", 1); tree.put("B", 2); // [A, B, C] (sortat alfabetic)`,
    interviewTrap: "TreeMap arunca NullPointerException daca incerci sa pui o cheie null (cand foloseste ordinea naturala), in timp ce HashMap accepta cheia null fara probleme.",
    keyTakeaway: "HashMap este cel mai rapid fara ordine; LinkedHashMap pastreaza ordinea de inserare; TreeMap mentine cheile sortate O(log N)."
  },
  {
    id: "java-51",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Comparable vs Comparator in Java",
    question: "Care este diferenta dintre interfata Comparable si Comparator si cand o alegi pe fiecare pentru sortare?",
    answer: "1. java.lang.Comparable<T> (Ordonare Naturala Implicita):\\n   - Se implementeaza DIRECT in interiorul clasei de domeniu (ex: public class Student implements Comparable<Student>).\\n   - Contine o singura metoda: int compareTo(T other).\\n   - Defineste o singura ordine principala de sortare (ex: alfabetic dupa nume sau dupa ID).\\n\\n2. java.util.Comparator<T> (Ordonare Personalizata / Multipla):\\n   - Se defineste ca o clasa SEPARATA sau ca o expresie Lambda fara a modifica clasa originala.\\n   - Contine metoda: int compare(T o1, T o2).\\n   - Permite definirea a zeci de criterii de sortare diferite (sortare dupa varsta, dupa salariu, descrescator).\\n   - Poate fi transmisa ca parametru la Collections.sort(list, comparator) sau list.sort(comparator).",
    codeSnippet: `// 1. Comparable (in clasa):
public class Book implements Comparable<Book> {
    private int year;
    public int compareTo(Book b) { return Integer.compare(this.year, b.year); }
}

// 2. Comparator (extern / lambda):
Comparator<Book> byTitle = (b1, b2) -> b1.title.compareTo(b2.title);
books.sort(byTitle);`,
    interviewTrap: "Nu scrie return o1.id - o2.id; pentru compararea numerelor intregi, deoarece scaderile de numere mari negative pot produce Integer Underflow/Overflow! Foloseste intotdeauna Integer.compare(o1.id, o2.id).",
    keyTakeaway: "Comparable defineste ordinea naturala din interiorul clasei; Comparator defineste reguli multiple de sortare din exterior."
  },
  {
    id: "java-52",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Compunerea Rapida a Comparatorilor in Java 8+",
    question: "Cum folosesti Comparator.comparing() si thenComparing() pentru a sorta dupa mai multe campuri succesive?",
    answer: "Incepand cu Java 8, interfata Comparator ofera metode statice si default declarative care elimina tot codul boilerplate:\\n\\n1. Comparator.comparing(Function<T, U>):\\n   - Creeaza un comparator pe baza unei functii de extragere a cheii (Method Reference).\\n   - Exemplu: Comparator.comparing(User::getLastName).\\n\\n2. thenComparing(Function<T, U>):\\n   - Adauga un criteriu de departajare secundar daca primul criteriu returneaza egalitate (0).\\n   - Poti inlantui oricate criterii succesive dorite.\\n\\n3. reversed():\\n   - Inverseaza ordinea comparatorului.",
    codeSnippet: `// Sortare: mai intai dupa Departament, apoi dupa Nume, apoi dupa Varsta descrescator:
List<Employee> list = getEmployees();

list.sort(
    Comparator.comparing(Employee::getDepartment)
              .thenComparing(Employee::getName)
              .thenComparing(Employee::getAge, Comparator.reverseOrder())
);`,
    interviewTrap: "Daca un camp extras poate fi null, foloseste Comparator.nullsFirst(...) sau nullsLast(...) pentru a preveni NullPointerException la sortare.",
    keyTakeaway: "Comparator.comparing().thenComparing() realizeaza sortari complexe pe multiple campuri intr-o singura linie fluenta."
  },
  {
    id: "java-53",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este un Iterator si cum se foloseste?",
    question: "Ce este un Iterator in Java, care sunt cele 3 metode principale ale sale si cum se deosebeste de o bucla for obisnuita?",
    answer: "1. Ce este un Iterator:\\n   - Un obiect care implementeaza interfata java.util.Iterator si permite parcurgerea secventiala a oricarei colectii fara a expune structura interna a acesteia.\\n\\n2. Cele 3 Metode Principale:\\n   - boolean hasNext(): Verifica daca mai exista elemente urmatoare in colectie.\\n   - E next(): Returneaza urmatorul element din colectie si avanseaza cursorul.\\n   - void remove(): Sterge ultimul element returnat de next() din colectia de baza in mod sigur.\\n\\n3. De ce este Util:\\n   - Iteratorul este singura modalitate sigura de a sterge elemente dintr-o colectie traditionala in timpul parcurgerii fara a declansa ConcurrentModificationException.",
    codeSnippet: `List<String> names = new ArrayList<>(List.of("Alex", "Ion", "Maria"));
Iterator<String> it = names.iterator();

while (it.hasNext()) {
    String name = it.next();
    if (name.startsWith("I")) {
        it.remove(); // Stergere sigura din lista in timpul iterarii!
    }
}
System.out.println(names); // [Alex, Maria]`,
    interviewTrap: "Daca apelezi it.remove() inainte de a fi apelat cel putin o data it.next(), sau daca apelezi remove() de doua ori la rand, vei primi IllegalStateException.",
    keyTakeaway: "Iteratorul parcurge colectii prin hasNext()/next() si este singurul care permite remove() sigur in bucle clasice."
  },
  {
    id: "java-54",
    category: 'JAVA',
    difficulty: "USOR",
    title: "ConcurrentModificationException: Cauza si Solutii",
    question: "De ce apare ConcurrentModificationException intr-o bucla for-each si cum o previi corect in Java?",
    answer: "1. De ce apare Exceptia:\\n   - O bucla for-each (for (String s : list)) este tradusa de compilator intr-un Iterator intern.\\n   - Colectia mentine un contor de modificari structurale: modCount.\\n   - Iteratorul retine valoarea initiala: expectedModCount.\\n   - Daca apelezi list.remove(s) direct pe colectie in corpul buclei, modCount este incrementat de lista, dar iteratorul nu stie! La urmatorul pas, iteratorul detecteaza modCount != expectedModCount si arunca instantaneu: ConcurrentModificationException!\\n\\n2. Cele Doua Solutii Recomandate:\\n   - Solutia 1 (Moderna Java 8+): Foloseste metoda list.removeIf(predicate) (curata si rapida).\\n   - Solutia 2 (Clasica): Foloseste un Iterator explicit si apeleaza it.remove() (care actualizeaza si expectedModCount).",
    codeSnippet: `List<String> list = new ArrayList<>(List.of("A", "B", "C"));

// GRESIT: arunca ConcurrentModificationException:
// for (String s : list) { if (s.equals("B")) list.remove(s); }

// CORECT in Java 8+:
list.removeIf(s -> s.equals("B")); // [A, C]`,
    interviewTrap: "Numele \"ConcurrentModificationException\" este inselator: exceptia apare frecvent intr-un SINGUR thread cand modifici structura colectiei in timp ce o iterezi!",
    keyTakeaway: "Nu sterge direct din colectie in bucle for-each; foloseste list.removeIf() sau iterator.remove()."
  },
  {
    id: "java-55",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Fail-Fast vs Fail-Safe Iterators",
    question: "Care este diferenta dintre un iterator Fail-Fast si un iterator Fail-Safe in Java?",
    answer: "1. Fail-Fast Iterators (ArrayList, HashSet, HashMap):\\n   - Daca colectia de baza este modificata structural (add, remove) in timpul iterarii de catre orice alt cod (in afara de metoda proprie a iteratorului):\\n   - Iteratorul arunca IMEDIAT o exceptie ConcurrentModificationException si opreste executia!\\n   - Functioneaza pe baza contorului intern modCount. Prefera sa esueze rapid decat sa riste un comportament impredictibil.\\n\\n2. Fail-Safe / Weakly Consistent Iterators (CopyOnWriteArrayList, ConcurrentHashMap):\\n   - NU arunca niciodata ConcurrentModificationException!\\n   - Lucreaza fie pe o COPIE a colectiei realizata la momentul crearii iteratorului (CopyOnWriteArrayList), fie pe un snapshot intern tolerant la modificari.\\n   - Poti adauga si sterge elemente simultan din alte fire fara ca iteratorul sa crape.",
    codeSnippet: `// 1. Fail-Fast:
List<String> fastList = new ArrayList<>(List.of("1", "2"));
// fastList.iterator() va arunca eroare daca lista se modifica!

// 2. Fail-Safe:
List<String> safeList = new CopyOnWriteArrayList<>(List.of("1", "2"));
for (String s : safeList) {
    safeList.add("3"); // Sigur! Nu arunca nicio exceptie!
}`,
    interviewTrap: "Iteratorul din CopyOnWriteArrayList este imun la modificari, dar el nu va reflecta elementele adaugate dupa pornirea iterarii (vede doar snapshot-ul initial).",
    keyTakeaway: "Fail-Fast arunca imediat ConcurrentModificationException; Fail-Safe itereaza pe un snapshot sigur fara exceptii."
  },
  {
    id: "java-56",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Arrays.asList() vs List.of() vs new ArrayList<>()",
    question: "Care este diferenta intre o lista creata cu Arrays.asList(), una cu List.of() si una cu new ArrayList<>()?",
    answer: "1. new ArrayList<>() (Modificabila 100%):\\n   - O lista obisnuita in care poti adauga (add), sterge (remove) si modifica (set) oricand.\\n\\n2. Arrays.asList(array) (Dimensiune Fixa):\\n   - Este doar un wrapper peste array-ul original.\\n   - Dimensiunea este FIXA: list.add() si list.remove() arunca UnsupportedOperationException!\\n   - DAR elementele existente pot fi modificate cu list.set(0, \"nou\"), iar modificarea afecteaza si array-ul original!\\n   - Accepta valori null.\\n\\n3. List.of(...) (Java 9+ - Strict Imutabila):\\n   - Complet imutabila: nici add, nici remove, nici set nu sunt permise!\\n   - NU accepta valori NULL (arunca NullPointerException la initializare).\\n   - Consuma cea mai putina memorie.",
    codeSnippet: `// 1. Modificabila:
List<String> l1 = new ArrayList<>(List.of("A", "B"));
l1.add("C"); // OK!

// 2. Dimensiune fixa (suporta set, dar nu add):
List<String> l2 = Arrays.asList("A", "B");
l2.set(0, "Z"); // OK!
// l2.add("C"); // CRASH: UnsupportedOperationException!

// 3. Imutabila:
List<String> l3 = List.of("A", "B");
// l3.set(0, "Z"); // CRASH: UnsupportedOperationException!`,
    interviewTrap: "Daca ai nevoie sa adaugi elemente ulterior intr-o lista creata din elemente fixe, scrie: new ArrayList<>(List.of(\"A\", \"B\")).",
    keyTakeaway: "new ArrayList e modificabila; Arrays.asList are dimensiune fixa; List.of este strict imutabila si respinge null-urile."
  },
  {
    id: "java-57",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Queue in Java: offer/poll/peek vs add/remove/element",
    question: "Care este diferenta dintre cele doua seturi de metode din interfata Queue (cele care arunca exceptii vs cele care returneaza valori speciale)?",
    answer: "Interfata java.util.Queue ofera doua seturi paralele de metode pentru fiecare operatie de baza (Inserare, Stergere, Inspectare):\\n\\n1. Setul 1: Arunca Exceptii la esec:\\n   - Inserare: add(e) (arunca IllegalStateException daca o coada limitata este plina).\\n   - Stergere: remove() (arunca NoSuchElementException daca coada este goala).\\n   - Inspectare: element() (arunca NoSuchElementException daca coada este goala).\\n\\n2. Setul 2: Returneaza Valori Speciale (null sau false - Recomandat!):\\n   - Inserare: offer(e) (returneaza false daca coada este plina, fara crash).\\n   - Stergere: poll() (returneaza elementul din varf, sau null daca coada e goala).\\n   - Inspectare: peek() (priveste primul element fara a-l sterge, sau null daca e goala).",
    codeSnippet: `Queue<String> queue = new LinkedList<>();

// Modul sigur (recomandat):
queue.offer("Client 1");
String next = queue.poll(); // "Client 1"
String empty = queue.poll(); // null (fara nicio exceptie!)`,
    interviewTrap: "In aplicatii de productie se recomanda folosirea metodelor offer(), poll() si peek(), deoarece evitarea exceptiilor creste performanta si previne crash-urile neasteptate.",
    keyTakeaway: "add/remove/element arunca exceptii cand esueaza; offer/poll/peek returneaza false/null in siguranta."
  },
  {
    id: "java-58",
    category: 'JAVA',
    difficulty: "USOR",
    title: "PriorityQueue in Java: Ce este si cum functioneaza?",
    question: "Ce este un PriorityQueue in Java si cum difera ordinea de iesire a elementelor fata de o coada obisnuita FIFO?",
    answer: "1. Ce este PriorityQueue:\\n   - O coada bazata pe o structura de date de tip Min-Heap (arbore binar binar de prioritati stocat intr-un array).\\n   - Spre deosebire de o coada standard FIFO (First-In-First-Out) unde primul venit iese primul:\\n   - Intr-un PriorityQueue elementele sunt procesate in ordinea PRIORITATII lor!\\n\\n2. Cum se stabileste Prioritatea:\\n   - Implicit (Min-Heap): Elementul cu valoarea cea mai mica (conform compareTo) este situat intotdeauna in varful cozii (head) si iese primul la poll().\\n   - Prin Comparator: Poti inversa ordinea pentru a face un Max-Heap (cel mai mare numar iese primul).\\n\\n3. Complexitate Algoritmica:\\n   - Inserare (offer): O(log N).\\n   - Extragere minim (poll): O(log N).\\n   - Inspectare minim (peek): O(1) instantaneu.\\n   - Nu accepta elemente null!",
    codeSnippet: `// Min-Heap (implicit: iese cel mai mic numar primul):
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(50);
pq.offer(10);
pq.offer(30);

System.out.println(pq.poll()); // 10!
System.out.println(pq.poll()); // 30!
System.out.println(pq.poll()); // 50!`,
    interviewTrap: "Daca parcurgi un PriorityQueue cu o bucla for-each, elementele NU vor fi afisate sortate! Heap-ul garanteaza doar ca elementul din varf (peek/poll) este minimul absolut.",
    keyTakeaway: "PriorityQueue proceseaza elementele dupa prioritate (Min-Heap implicit) cu extragere O(log N), nu dupa ordinea sosirii."
  },
  {
    id: "java-59",
    category: 'JAVA',
    difficulty: "USOR",
    title: "ArrayDeque vs java.util.Stack: De ce Stack este Deprecated?",
    question: "De ce clasa java.util.Stack este considerata invechita si de ce se recomanda ArrayDeque pentru implementarea unei stive LIFO?",
    answer: "1. Defectele lui java.util.Stack (Java 1.0):\\n   - Extinde clasa Vector. Mosteneste toate metodele de indexare ale unui vector (poti adauga sau sterge la orice index, incalcand principiul strict LIFO al unei stive!).\\n   - Toate metodele sunt sincronizate grosier cu synchronized, provocand o penalizare inutila de performanta intr-un mediu cu un singur fir.\\n\\n2. De ce ArrayDeque este Superioara:\\n   - Implementeaza interfata Deque (Double Ended Queue) folosind un array circular redimensionabil.\\n   - Nu foloseste sincronizare, fiind de 2-4 ori mai rapida decat Stack.\\n   - Ofera metode curate de stiva: push(e) pentru adaugare in varf, pop() pentru extragere din varf si peek() pentru inspectare.\\n   - Nu aloca noduri in memorie ca un LinkedList.",
    codeSnippet: `// Recomandat pentru o Stiva (LIFO - Last In First Out):
Deque<String> stack = new ArrayDeque<>();
stack.push("Pagina 1");
stack.push("Pagina 2");

System.out.println(stack.pop()); // "Pagina 2" (ultimul adaugat iese primul!)
System.out.println(stack.peek()); // "Pagina 1"`,
    interviewTrap: "Chiar si documentatia oficiala Java din clasa Stack mentioneaza explicit: \"A more complete and consistent set of LIFO stack operations is provided by the Deque interface and its implementations (e.g. ArrayDeque)\".",
    keyTakeaway: "ArrayDeque este alternativa moderna, rapida si ne-sincronizata care inlocuieste vechea clasa Stack."
  },
  {
    id: "java-60",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ierarhia de Exceptii in Java: Throwable, Error, Exception",
    question: "Care este ierarhia de clase a erorilor si exceptiilor in Java si ce reprezinta fiecare ramura?",
    answer: "Toate erorile si situatiile exceptionale din Java au ca radacina comuna clasa java.lang.Throwable:\\n\\n1. java.lang.Error:\\n   - Probleme grave si catastrofale cauzate de mediu sau JVM (hardware, epuizare memorie, stiva plina).\\n   - Aplicatia NU trebuie sa incerce sa le prinda sau sa se recupereze din ele.\\n   - Exemple: OutOfMemoryError, StackOverflowError.\\n\\n2. java.lang.Exception:\\n   - Situatii anormale din logica aplicatiei din care un program se poate si trebuie sa se recupereze.\\n   - Se imparte in doua mari categorii:\\n     - Checked Exceptions: Subclase directe ale lui Exception (in afara de RuntimeException).\\n     - Unchecked Exceptions: Toate subclasele lui java.lang.RuntimeException.",
    codeSnippet: `//                Throwable
//               /         \\
//            Error       Exception
//                         /       \\
//           Checked Exceptions   RuntimeException (Unchecked)`,
    interviewTrap: "Daca prinzi catch (Throwable t), vei intercepta si erori fatale precum OutOfMemoryError. Prinde intotdeauna catch (Exception e) pentru recuperari normale.",
    keyTakeaway: "Throwable se imparte in Error (probleme fatale de JVM) si Exception (erori recuperabile de aplicatie)."
  },
  {
    id: "java-61",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Checked vs Unchecked Exceptions in Java",
    question: "Care este diferenta fundamentala dintre o Checked Exception si o Unchecked Exception (RuntimeException)?",
    answer: "1. Checked Exceptions (Verificate la Compilare):\\n   - Mostenesc clasa Exception, dar NU mostenesc RuntimeException.\\n   - Compilatorul TE FORTEAZA sa le gestionezi: fie le prinzi intr-un bloc try-catch, fie le declari in semnatura metodei folosind throws NumeExceptie.\\n   - Reprezinta conditii externe neprevazute dar anticipate, din care aplicatia se poate recupera (ex: un fisier temporar lipseste, o conexiune de retea a picat).\\n   - Exemple: IOException, SQLException, ClassNotFoundException.\\n\\n2. Unchecked Exceptions (Neverificate la Compilare):\\n   - Mostenesc clasa java.lang.RuntimeException.\\n   - Compilatorul NU te forteaza sa le prinzi sau sa le declari cu throws.\\n   - Reprezinta de regula bug-uri de programare, erori de logica sau utilizare gresita a API-urilor.\\n   - Exemple: NullPointerException, ArrayIndexOutOfBoundsException, IllegalArgumentException.",
    codeSnippet: `// 1. Checked: compilatorul cere try-catch sau throws:
public void readFile() throws IOException {
    FileReader file = new FileReader("c:\\\\test.txt");
}

// 2. Unchecked: nu cere declarare:
public void divide(int a, int b) {
    if (b == 0) throw new IllegalArgumentException("Impartitorul nu poate fi 0");
}`,
    interviewTrap: "Daca nu tratezi o checked exception, codul refuza sa compileze; daca apare o unchecked exception, codul compileaza dar crapa la runtime daca nu e gestionata.",
    keyTakeaway: "Checked sunt verificate de compilator (cer try-catch/throws); Unchecked mostenesc RuntimeException si semnaleaza bug-uri de logica."
  },
  {
    id: "java-62",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Blocul try-catch-finally: Se executa finally intotdeauna?",
    question: "Care este rolul blocului finally si in ce situatii extreme se poate intampla ca finally sa NU se execute?",
    answer: "1. Rolul Blocului finally:\\n   - Se plaseaza dupa try sau catch si este garantat sa se execute atat in caz de succes, cat si in cazul in care a fost aruncata o exceptie.\\n   - Folosit istoric pentru curatarea resurselor (inchiderea fisierelor, conexiunilor DB).\\n\\n2. In ce Situatii Extreme NU se executa finally:\\n   - 1. Daca in blocul try sau catch se apeleaza System.exit(0): JVM-ul este oprit instantaneu.\\n   - 2. Crash al masinii virtuale sau eroare fatala de sistem (ex: JVM Core Dump, OutOfMemoryError sever).\\n   - 3. Firul curent este un Daemon Thread, iar toate firele non-daemon s-au incheiat (JVM opreste daemon-ul pe loc).\\n   - 4. O bucla infinita (while(true)) sau un Deadlock permanent inainte de a ajunge la finally.",
    codeSnippet: `try {
    System.out.println("1. In Try");
    // System.exit(0); // Daca de-comentezi asta, finally nu mai ruleaza!
} finally {
    System.out.println("2. In Finally (Garantat)");
}`,
    interviewTrap: "Daca pui o instructiune return in try si un alt return in finally, valoarea returnata din finally o va suprascrie complet pe cea din try, ascunzand chiar si exceptiile aruncate!",
    keyTakeaway: "finally ruleaza intotdeauna indiferent de erori, cu exceptia apelului System.exit() sau a crash-ului JVM."
  },
  {
    id: "java-63",
    category: 'JAVA',
    difficulty: "USOR",
    title: "try-with-resources si Interfata AutoCloseable in Java 7",
    question: "Ce problema a rezolvat structura try-with-resources introdusa in Java 7 si cum functioneaza?",
    answer: "1. Problema Veche cu Inchiderea Resurselor (Inainte de Java 7):\\n   - Trebuia sa declari variabilele in afara blocului try, sa pui un bloc finally, sa verifici if (res != null) si sa prinzi o alta exceptie pe close()! Erau necesare 15-20 linii de cod urat pentru un simplu fisier.\\n\\n2. Ce aduce try-with-resources:\\n   - Orice resursa declarata intre parantezele rotunde ale lui try (Resource res = ...) este INCHISA AUTOMAT de catre JVM la iesirea din bloc, indiferent daca executia s-a terminat cu succes sau cu exceptie!\\n   - Elimina complet nevoia de bloc finally manual.\\n\\n3. Conditia Obligatorie:\\n   - Clasa resursei TREBUIE sa implementeze interfata java.lang.AutoCloseable (sau java.io.Closeable), care contine metoda void close().",
    codeSnippet: `// Inchidere automata garantata la final:
try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
    String line = br.readLine();
    System.out.println(line);
} catch (IOException e) {
    log.error("Eroare la citire", e);
} // br.close() a fost apelat automat aici!`,
    interviewTrap: "Daca declari mai multe resurse in try (try (R1 r1 = ...; R2 r2 = ...)), JVM le va inchide automat in ORDINE INVERSA fata de cum au fost declarate (mai intai r2, apoi r1).",
    keyTakeaway: "try-with-resources inchide automat orice resursa AutoCloseable, eliminand complet blocurile finally manuale redundante."
  },
  {
    id: "java-64",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cuvintele cheie throw vs throws in Java",
    question: "Care este diferenta dintre cuvantul cheie throw si cuvantul cheie throws in Java?",
    answer: "1. throw (Aruncare Efectiva):\\n   - Este o instructiune de executie plasata in interiorul corpului unei metode.\\n   - Este folosita pentru a ARUNCA EXPLICIT o instanta noua de exceptie: throw new IllegalArgumentException(\"Scor invalid\");.\\n   - Opreste imediat fluxul normal al metodei curente.\\n\\n2. throws (Declarare in Semnatura):\\n   - Este o clauza plasata in SEMNATURA unei metode (la finalul listei de parametri).\\n   - Avertizeaza compilatorul si apelantii ca aceasta metoda ar putea arunca una sau mai multe Checked Exceptions: public void read() throws IOException, SQLException.\\n   - Nu creeaza niciun obiect de exceptie, ci doar deleaga responsabilitatea tratarii catre codul apelant.",
    codeSnippet: `// 'throws' in semnatura (avertisment)
public void validateAge(int age) throws InvalidAgeException {
    if (age < 18) {
        // 'throw' in corp (actiunea efectiva)
        throw new InvalidAgeException("Varsta minima este 18");
    }
}`,
    interviewTrap: "throw este urmat intotdeauna de o INSTANTA de obiect (throw new ...); throws este urmat de NUMELE CLASEI de exceptie (throws IOException).",
    keyTakeaway: "throw arunca o instanta de exceptie in cod; throws declara posibilele exceptii checked in semnatura metodei."
  },
  {
    id: "java-65",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cum creezi o Exceptie Custom (Personalizata) in Java?",
    question: "Cum se creeaza o clasa de exceptie proprie si cand alegi sa extinzi Exception vs RuntimeException?",
    answer: "1. Crearea unei Exceptii Personalizate:\\n   - Creezi o clasa noua care extinde fie Exception (pentru Checked), fie RuntimeException (pentru Unchecked).\\n   - Oferi de regula 3 constructori standard: fara parametri, cu mesaj de eroare String si cu cauza radacina Throwable cause.\\n\\n2. Cand extinzi Exception (Checked Custom Exception):\\n   - Cand vrei sa FORTEZI apelantul sa gestioneze problema si te astepti ca aplicatia sa aiba un plan de recuperare (ex: InsufficientFundsException).\\n\\n3. Cand extinzi RuntimeException (Unchecked Custom Exception - Standardul Modern):\\n   - In 90% din aplicatiile moderne (Spring Boot, REST APIs), se prefera RuntimeException pentru ca nu polueaza semnaturile metodelor cu throws si poate fi interceptata global intr-un @ControllerAdvice (ex: ResourceNotFoundException).",
    codeSnippet: `public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String message, Throwable cause) {
        super(message, cause); // Retine cauza originala (Exception Chaining)
    }
}`,
    interviewTrap: "Transmite intotdeauna parametrul Throwable cause catre super(message, cause) daca impachetezi o exceptie existenta, altfel vei pierde stack trace-ul original al erorii.",
    keyTakeaway: "O exceptie custom extinde RuntimeException pentru simplitate si este aruncata cand o regula specifica de business a fost incalcata."
  },
  {
    id: "java-66",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Top 5 Exceptii Comune de Runtime si Cauzele lor",
    question: "Care sunt cele mai frecvente 5 exceptii de tip RuntimeException intalnite in Java si ce le provoaca?",
    answer: "1. NullPointerException (NPE):\\n   - Incercarea de a apela o metoda, de a accesa un camp sau de a indexa un array pe o referinta care are valoarea null.\\n2. ArrayIndexOutOfBoundsException / StringIndexOutOfBoundsException:\\n   - Accesarea unui index negativ sau mai mare sau egal cu lungimea array-ului (arr[arr.length]).\\n3. IllegalArgumentException:\\n   - O metoda a primit un argument invalid conform logicii sale (ex: varsta < 0).\\n4. NumberFormatException (subclasa a lui IllegalArgumentException):\\n   - Incercarea de a parsa un text invalid intr-un numar: Integer.parseInt(\"abc\").\\n5. ClassCastException:\\n   - Incercarea de a converti fortat (type casting) un obiect la o clasa care nu se afla in ierarhia sa de mostenire (ex: Object x = Integer.valueOf(5); String s = (String) x;).",
    codeSnippet: `// 1. NPE:
String s = null; s.length();

// 2. IndexOutOfBounds:
int[] arr = new int[3]; int val = arr[5];

// 3. NumberFormatException:
int num = Integer.parseInt("not_a_number");`,
    interviewTrap: "Pentru a preveni NumberFormatException, valideaza intotdeauna inputul cu regex sau prinde explicit exceptia inainte de parsare.",
    keyTakeaway: "NPE, IndexOutOfBounds, IllegalArgument, NumberFormat si ClassCast sunt cele mai comune erori cauzate de bug-uri de programare."
  },
  {
    id: "java-67",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Multi-Catch Block in Java 7",
    question: "Cum folosesti Multi-Catch block-ul introdus in Java 7 si ce restrictie de mostenire exista intre exceptiile prinse impreuna?",
    answer: "1. Ce este Multi-Catch (Java 7):\\n   - Permite prinderea a doua sau mai multe tipuri de exceptii diferite intr-un SINGUR bloc catch folosind caracterul pipe (|).\\n   - Elimina duplicarea de cod cand mai multe exceptii necesita aceeasi reactie (ex: logare si returnare cod de eroare).\\n\\n2. Restrictia Stricta de Mostenire:\\n   - Exceptiile listate in acelasi bloc catch NU AU VOIE sa fie intr-o relatie de mostenire parinte-copil!\\n   - Exemplu ilegal: catch (IOException | FileNotFoundException e) NU compileaza, deoarece FileNotFoundException este deja o subclasa a lui IOException (este redundanta)!\\n\\n3. Variabila \"e\" este Finala:\\n   - In multi-catch, parametrul e este considerat implicit final; nu poti reatribui o alta valoare variabilei e.",
    codeSnippet: `try {
    processDatabaseAndFile();
} catch (SQLException | IOException e) { // Curat, pe o singura linie!
    log.error("Eroare de procesare: " + e.getMessage(), e);
}`,
    interviewTrap: "Daca doua exceptii mostenesc una din alta, prinde doar parintele (ex: catch (IOException e)) sau separa-le in doua blocuri catch clasice.",
    keyTakeaway: "Multi-catch prinde mai multe exceptii cu | eliminand duplicarea; exceptiile nu trebuie sa fie legate prin mostenire directa."
  },
  {
    id: "java-68",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce este periculos sa lasi un bloc catch gol (Swallowed Exception)?",
    question: "De ce lasarea unui bloc catch gol (Empty Catch Block) este considerata una dintre cele mai grave greseli de programare?",
    answer: "1. Ce este o Swallowed Exception (Exceptie Inghitita):\\n   - Prinderea unei exceptii fara a face absolut nimic cu ea:\\n     try { ... } catch (Exception e) { /* nimic */ }\\n\\n2. Consecinte Catastrofale in Productie:\\n   - Programul continua sa ruleze orbeste ca si cum nimic nu s-ar fi intamplat, dar starea interna a datelor este deja corupta sau operatia a esuat pe jumatate!\\n   - Zero vizibilitate: Nimeni nu stie ca sistemul a esuat (nu exista log, nu exista alerta).\\n   - Cand aplicatia crapa 2 ore mai tarziu intr-o alta componenta, este imposibil de aflat care a fost cauza initiala.\\n\\n3. Bune Practici:\\n   - Cel putin logheaza eroarea cu stack trace: log.error(\"Eroare...\", e);\\n   - Sau re-arunca o exceptie specifica de runtime: throw new ServiceException(\"Esec\", e);.",
    codeSnippet: `// COD INTERZIS (Anti-pattern periculos):
try {
    updatePaymentStatus();
} catch (Exception e) {
    // NIMIC! Plata nu s-a inregistrat, dar nimeni nu stie!
}

// COD CORECT:
try {
    updatePaymentStatus();
} catch (Exception e) {
    log.error("Eroare la actualizarea platii", e);
    throw new PaymentFailedException("Esec procesare", e);
}`,
    interviewTrap: "Daca vezi intr-un code review un bloc catch gol sau un catch care doar scrie System.out.println(e.getMessage()), cere imediat corectarea cu logging complet.",
    keyTakeaway: "Un catch gol ascunde erorile si corupe starea sistemului; logheaza intotdeauna eroarea sau re-arunc-o mai departe."
  },
  {
    id: "java-69",
    category: 'JAVA',
    difficulty: "USOR",
    title: "OutOfMemoryError vs StackOverflowError",
    question: "Care este diferenta dintre OutOfMemoryError si StackOverflowError si cum se provoaca fiecare?",
    answer: "Ambele sunt erori de memorie din ramura java.lang.Error, dar se produc in zone de memorie complet diferite:\\n\\n1. StackOverflowError (Memoria Stiva - Stack):\\n   - Apare atunci cand stiva de apeluri a unui fir de executie depaseste dimensiunea maxima alocata (-Xss, de regula 1 MB).\\n   - Cauza universala clasica: O RECURSIE INFINITA (o metoda se apeleaza pe sine fara a atinge niciodata conditia de oprire base case), umpland stiva cu milioane de Stack Frames.\\n\\n2. OutOfMemoryError (Memoria Gramada - Heap):\\n   - Apare atunci cand spatiul de Heap se umple complet cu obiecte noi si Garbage Collector-ul nu mai poate elibera suficient spatiu pentru cererea curenta.\\n   - Cauze comune: Memory leaks (colectii care acumuleaza continuu obiecte), incarcarea fisierelor uriase deodata in memorie, alocarea unui array gigantic (new byte[Integer.MAX_VALUE]).",
    codeSnippet: `// 1. Provoaca StackOverflowError (Recursie infinita pe Stack):
void recursive() {
    recursive(); // Se apeleaza la infinit
}

// 2. Provoaca OutOfMemoryError (Heap plin):
List<Object> list = new ArrayList<>();
while (true) {
    list.add(new byte[1024 * 1024]); // Aloca continuu fara oprire
}`,
    interviewTrap: "StackOverflowError este aproape intotdeauna un bug de recursie in cod; OutOfMemoryError este de regula un memory leak sau un volum de date neprevazut pe Heap.",
    keyTakeaway: "StackOverflowError este cauzat de recursie infinita pe stiva; OutOfMemoryError este cauzat de epuizarea memoriei Heap."
  },
  {
    id: "java-70",
    category: 'JAVA',
    difficulty: "USOR",
    title: "NoClassDefFoundError vs ClassNotFoundException",
    question: "Care este diferenta dintre exceptia ClassNotFoundException si eroarea NoClassDefFoundError in Java?",
    answer: "1. ClassNotFoundException (Checked Exception):\\n   - Apare la incarcare DINAMICA explicita cand codul incearca sa incarce o clasa prin numele sau ca text (ex: Class.forName(\"com.mysql.jdbc.Driver\") sau ClassLoader.loadClass()).\\n   - Semnificatie: Fisierul .class nu a fost gasit pe classpath. Se rezolva adaugand dependinta JAR in pom.xml.\\n\\n2. NoClassDefFoundError (Fatal Error):\\n   - Apare atunci cand codul a compilat cu succes deoarece clasa era prezenta la compilare, dar la RUNTIME clasa nu mai poate fi gasita sau initializata!\\n   - Cauze frecvente:\\n     - Clasa lipseste din JAR-ul impachetat la runtime.\\n     - Initializarea statica a picat: Daca o clasa a aruncat o exceptie intr-un static { ... } block, JVM o marcheaza ca defecta. Orice apel viitor catre acea clasa arunca NoClassDefFoundError!",
    codeSnippet: `// 1. ClassNotFoundException:
try {
    Class.forName("com.inexistent.MyClass");
} catch (ClassNotFoundException e) {
    System.out.println("Clasa negasita la runtime");
}`,
    interviewTrap: "Daca vezi NoClassDefFoundError in loguri, cauta mai sus prima aparitie a lui ExceptionInInitializerError pentru a gasi blocul static care a provocat problema initiala.",
    keyTakeaway: "ClassNotFoundException apare la apeluri dinamice cu Class.forName; NoClassDefFoundError apare cand o clasa existenta la compilare lipseste la runtime."
  },
  {
    id: "java-71",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Generics in Java - Scop si Type Safety",
    question: "Ce sunt Generics in Java, de ce au fost introduse in Java 5 si cum asigura siguranta tipurilor (type safety)?",
    answer: "1. Ce sunt Generics:\\n   - Un mecanism introdus in Java 5 care permite parametrizarea tipurilor pentru clase, interfete si metode (ex: List<String> in loc de List simplu).\\n\\n2. Beneficii principale:\\n   - Siguranta la compilare (Compile-time Type Safety): Erorile de incompatibilitate de tip sunt detectate la compilare, nu la executie (evita ClassCastException).\\n   - Eliminarea cast-urilor explicite: Nu mai este necesar cast-ul manual (String) list.get(0).\\n   - Cod reutilizabil si generic: Aceeasi structura de date poate functiona cu orice tip de obiect.",
    codeSnippet: `// Inainte de Java 5 (fara Generics):
List list = new ArrayList();
list.add("Java");
list.add(100); // Permis, dar periculos!
String s = (String) list.get(1); // ClassCastException la runtime!

// Cu Generics (Java 5+):
List<String> names = new ArrayList<>();
names.add("Java");
// names.add(100); // Eroare de compilare directa!
String name = names.get(0); // Fara cast!`,
    interviewTrap: "Daca folosesti tipul brut (raw type, ex: List list), anulezi complet beneficiile oferite de Generics si deschizi calea erorilor ClassCastException la runtime.",
    keyTakeaway: "Generics ofera verificare a tipurilor la compilare si elimina cast-urile manuale."
  },
  {
    id: "java-72",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Generics Type Erasure",
    question: "Ce este Type Erasure in Java si ce consecinte practice are la runtime?",
    answer: "1. Ce este Type Erasure:\\n   - Este procesul prin care compilatorul Java inlatura (sterge) toate informatiile despre tipurile generice in timpul compilarii in bytecode.\\n   - A fost implementat pentru a asigura compatibilitatea inversa (backward compatibility) cu versiunile de Java anterioare aparitiei Generics (Java 1.4).\\n\\n2. Ce face compilatorul:\\n   - Inlocuieste toti parametrii de tip cu tipul lor bound (ex: T extends Number devine Number) sau cu Object daca sunt unbound (T devine Object).\\n   - Insereaza cast-uri sigure de bytecode acolo unde este accesata valoarea.\\n\\n3. Consecinte practice la runtime:\\n   - La runtime, List<String> si List<Integer> sunt exact aceeasi clasa: ArrayList.class.\\n   - Nu poti face new T(), new T[10] sau instanceof List<String> la runtime.",
    codeSnippet: `List<String> list1 = new ArrayList<>();
List<Integer> list2 = new ArrayList<>();

// La runtime clasele sunt identice din cauza Type Erasure:
System.out.println(list1.getClass() == list2.getClass()); // true!

// Ilegal la compilare:
// if (list1 instanceof List<String>) {} // Eroare: Cannot perform instanceof check against parameterized type`,
    interviewTrap: "Nu poti distinge intre List<String> si List<Integer> la runtime doar prin getClass(). Ambele au clasa java.util.ArrayList.",
    keyTakeaway: "Type Erasure sterge tipurile generice la compilare; la runtime JVM lucreaza cu Object sau bound-ul superior."
  },
  {
    id: "java-73",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Generics Wildcards si Principiul PECS",
    question: "Ce inseamna ? extends T vs ? super T in Java si ce reprezinta principiul PECS?",
    answer: "1. Principiul PECS (Producer Extends, Consumer Super):\\n   - Producer Extends (? extends T): Daca structura de date doar \"produce\" date (citesti din ea), folosesti extends (Covarianta).\\n   - Consumer Super (? super T): Daca structura de date \"consuma\" date (scrii/adaugi in ea), folosesti super (Contravarianta).\\n\\n2. ? extends T (Upper Bounded):\\n   - Poti citi elemente ca fiind de tip T (sigur).\\n   - NU poti adauga elemente in colectie (cu exceptia lui null), deoarece compilatorul nu stie tipul exact al instantei concrete.\\n\\n3. ? super T (Lower Bounded):\\n   - Poti adauga elemente de tip T sau subclase ale lui T.\\n   - La citire primesti doar Object.",
    codeSnippet: `// Producer Extends: doar citesti
void printNumbers(List<? extends Number> list) {
    for (Number n : list) {
        System.out.println(n.doubleValue());
    }
    // list.add(10); // EROARE de compilare! Nu poti adauga!
}

// Consumer Super: doar scrii/adaugi
void addIntegers(List<? super Integer> list) {
    list.add(10);  // OK!
    list.add(20);  // OK!
    // Number n = list.get(0); // EROARE! Returneaza doar Object
}`,
    interviewTrap: "Cea mai frecventa greseala la interviu: incercarea de a adauga un element intr-o lista List<? extends Number>. Este interzis de compilator!",
    keyTakeaway: "Foloseste extends cand vrei sa citesti (Producer), foloseste super cand vrei sa scrii (Consumer) - regula PECS."
  },
  {
    id: "java-74",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Raw Types: List vs List<Object> vs List<?>",
    question: "Care este diferenta dintre un raw type List, List<Object> si List<?> in Java?",
    answer: "1. Raw Type (List):\\n   - Lista nestricta, stil pre-Java 5. Permite adaugarea oricarui tip de obiect, dar anuleaza verificarea compilatorului.\\n   - Provoaca compiler warnings si risca ClassCastException.\\n\\n2. List<Object>:\\n   - Lista parametrizata explicit cu Object. O lista List<String> NU poate fi atribuita unei variabile List<Object> (Generics sunt invariante!).\\n   - Poti adauga orice obiect in ea.\\n\\n3. List<?> (Unbounded Wildcard):\\n   - O lista cu tip necunoscut. Poti atribui o lista de orice tip (List<String>, List<Integer>).\\n   - Este read-only: nu poti adauga nimic in ea (doar null).",
    codeSnippet: `List rawList = new ArrayList<String>();
rawList.add(123); // Compileaza, dar periculos la runtime!

List<String> strList = new ArrayList<>();
// List<Object> objList = strList; // EROARE de compilare! Generics nu sunt covariante!

List<?> wildList = strList; // OK!
// wildList.add("test"); // EROARE! Nu poti adauga in List<?>
Object item = wildList.get(0); // OK la citire`,
    interviewTrap: "Candidatii cred adesea ca List<String> mosteneste List<Object>. FALS! In Java, Generics sunt invariante: List<String> NU este un List<Object>.",
    keyTakeaway: "List<?> este sigur pentru citire generica; List<Object> accepta orice dar nu este parinte pentru List<T>; List (raw) trebuie evitat."
  },
  {
    id: "java-75",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "De ce nu putem crea array-uri generice (new T[])?",
    question: "De ce expresia new T[10] genereaza o eroare de compilare in Java si cum se rezolva aceasta problema?",
    answer: "1. Cauza fundamentala: Conflict intre Array-uri si Generics:\\n   - Array-urile sunt reificate (reified) la runtime: JVM trebuie sa cunoasca tipul exact al componentelor la runtime pentru a arunca ArrayStoreException daca pui un tip gresit.\\n   - Generics sunt non-reificate: tipul generic T este sters la compilare (Type Erasure) si devine Object in bytecode.\\n   - Daca new T[10] ar fi permis, JVM ar aloca new Object[10], ceea ce ar sparge siguranta tipurilor la runtime cand este castat la T[].\\n\\n2. Solutii comune:\\n   - Folosirea colectiilor: List<T> list = new ArrayList<>().\\n   - Cast cu suprimare de warning: (T[]) new Object[size].\\n   - Folosirea reflexiei cu tip explicit: (T[]) Array.newInstance(clazz, size).",
    codeSnippet: `// Incercare gresita:
public class MyStorage<T> {
    // private T[] items = new T[10]; // EROARE de compilare!

    // Solutia 1: Cast de Object array (utilizata si in ArrayList)
    @SuppressWarnings("unchecked")
    private T[] items = (T[]) new Object[10];

    // Solutia 2: Cu java.lang.reflect.Array
    @SuppressWarnings("unchecked")
    public T[] createArray(Class<T> clazz, int size) {
        return (T[]) java.lang.reflect.Array.newInstance(clazz, size);
    }
}`,
    interviewTrap: "Array-urile sunt covariante si reificate la runtime, in timp ce Generics sunt invariante si sterse la compilare (type erasure). Aceste doua concepte sunt incompatibile.",
    keyTakeaway: "new T[] nu functioneaza din cauza Type Erasure; se foloseste cast pe Object[] sau java.lang.reflect.Array.newInstance."
  },
  {
    id: "java-76",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Collections.unmodifiableList() vs List.copyOf() si List.of()",
    question: "Care este diferenta dintre Collections.unmodifiableList(list) si List.copyOf(list) / List.of()?",
    answer: "1. Collections.unmodifiableList(originalList):\\n   - Este un simplu \"view\" (wrapper) read-only peste lista originala.\\n   - Daca cineva modifica lista originala, aceste modificari SE VOR REFLECTA si in lista unmodifiable!\\n   - Arunca UnsupportedOperationException doar daca incerci sa apelezi add() sau remove() pe wrapper.\\n\\n2. List.copyOf(originalList) (Java 10+):\\n   - Creeaza o lista cu adevarat imutabila, facand o copie defensiva daca e necesar.\\n   - Modificarile aduse listei originale ulterioare NU afecteaza copia.\\n   - Nu accepta elemente null (arunca NullPointerException).\\n\\n3. List.of(e1, e2, ...) (Java 9+):\\n   - Creeaza direct o lista imutabila compacta.",
    codeSnippet: `List<String> original = new ArrayList<>();
original.add("A");

List<String> unmod = Collections.unmodifiableList(original);
List<String> copy = List.copyOf(original);

original.add("B"); // Modificam lista initiala

System.out.println(unmod); // [A, B] -> S-a modificat prin view!
System.out.println(copy);  // [A]    -> A ramas neschimbata!`,
    interviewTrap: "Collections.unmodifiableList() NU este complet imutabil, deoarece lista din spatele sau poate fi modificata de oricine detine o referinta catre ea.",
    keyTakeaway: "unmodifiableList este doar o vizualizare needitabila a listei originale; List.copyOf creeaza o copie complet independenta si imutabila."
  },
  {
    id: "java-77",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Collections.synchronizedList() vs CopyOnWriteArrayList",
    question: "Cum difera Collections.synchronizedList() de CopyOnWriteArrayList si cand este recomandat fiecare?",
    answer: "1. Collections.synchronizedList(list):\\n   - Pune un lock pe fiecare metoda (synchronized) pe un obiect comun (mutex).\\n   - Fiecare operatie de citire sau scriere blocheaza celelalte thread-uri.\\n   - La iteratie cu for-each / iterator, programatorul TREBUIE sa sincronizeze manual lista, altfel risca ConcurrentModificationException.\\n\\n2. CopyOnWriteArrayList:\\n   - Thread-safe fara blocarea cititorilor: operatiile de citire (get, iterate) sunt ultra-rapide si nu folosesc lock-uri.\\n   - La fiecare operatie de scriere (add, set, remove), se creeaza o copie NOUA completa a array-ului intern.\\n   - Iteratoarele nu arunca niciodata ConcurrentModificationException (au un snapshot al array-ului din momentul crearii).\\n\\n3. Cand se foloseste fiecare:\\n   - CopyOnWriteArrayList: ideal cand ai 99% citiri si foarte rare scrieri (ex: liste de listeners, cache mic).\\n   - synchronizedList: cand ai multe scrieri si citiri egale.",
    codeSnippet: `// 1. synchronizedList necesita bloc manual la iterare:
List<String> syncList = Collections.synchronizedList(new ArrayList<>());
synchronized (syncList) {
    for (String s : syncList) { /* sigur */ }
}

// 2. CopyOnWriteArrayList: citiri rapide fara lock
List<String> cowList = new CopyOnWriteArrayList<>();
cowList.add("Event1");
// Iterarea este thread-safe fara lock:
for (String s : cowList) { System.out.println(s); }`,
    interviewTrap: "Folosirea CopyOnWriteArrayList intr-un scenariu cu scrieri frecvente duce la degradare masiva a performantei si consum enorm de memorie din cauza copierii array-ului la fiecare add.",
    keyTakeaway: "CopyOnWriteArrayList este perfect pentru citiri frecvente si scrieri rare; synchronizedList sincronizeaza fiecare apel pe acelasi lock."
  },
  {
    id: "java-78",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "ConcurrentHashMap - Arhitectura si Avantaje",
    question: "Cum realizeaza ConcurrentHashMap accesul concurent eficient si de ce este superior Hashtable sau synchronizedMap?",
    answer: "1. De ce Hashtable si synchronizedMap sunt lente:\\n   - Blocheaza intreaga tabela la orice operatie (lock la nivel de map). Daca un thread citeste, niciun alt thread nu poate scrie sau citi simultan.\\n\\n2. Cum functioneaza ConcurrentHashMap (Java 8+):\\n   - Nu blocheaza intreaga harta!\\n   - Citirile (get()) sunt complet non-blocante (lock-free) gratie variabilelor marcate volatile (Node.val, Node.next).\\n   - Scrierile blocheaza doar nodul prim din bucket-ul respectiv (synchronized pe head node-ul din bucket) sau folosesc CAS (Compare-And-Swap) pentru inserarea primului nod intr-un bucket gol.\\n   - Permite mai multor thread-uri sa scrie simultan atata timp cat acceseaza bucket-uri diferite.\\n\\n3. Fara chei sau valori null:\\n   - Nu accepta niciodata null ca cheie sau valoare (pentru a evita ambiguitatea daca o cheie lipseste sau are valoarea null in mediu concurent).",
    codeSnippet: `ConcurrentMap<String, Integer> map = new ConcurrentHashMap<>();

// Operatii atomice compuse oferite de ConcurrentMap:
map.putIfAbsent("counter", 0);
map.computeIfPresent("counter", (k, v) -> v + 1);

// Thread-safe fara niciun lock pe toata tabela:
Integer val = map.get("counter");`,
    interviewTrap: "ConcurrentHashMap nu permite NULL nici ca cheie, nici ca valoare! Daca apelezi map.put(null, \"val\"), primesti NullPointerException instantaneu.",
    keyTakeaway: "ConcurrentHashMap blocheaza doar la nivel de bucket la scriere si are citiri lock-free, permitand concurenta masiva fara blocarea intregii harti."
  },
  {
    id: "java-79",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "EnumSet si EnumMap in Java",
    question: "De ce sunt EnumSet si EnumMap mult mai rapide decat HashSet si HashMap cand lucram cu enumerari?",
    answer: "1. EnumSet:\\n   - Reprezentare interna extrem de eficienta: foloseste un vector de biti (un singur long pe post de bitfield pentru pana la 64 de valori ale enum-ului).\\n   - Fiecare valoare a enum-ului corespunde unui singur bit (0 sau 1).\\n   - Operatiile de adaugare, stergere si testare de apartenenta (contains) se reduc la operatii pe biti la nivel de procesor (AND, OR, NOT), avand complexitate O(1) si consum infim de memorie.\\n\\n2. EnumMap:\\n   - Foloseste intern un simplu array de obiecte (Object[]), indexat direct dupa valoarea ordinal() a enum-ului.\\n   - Nu exista coliziuni de hash, nu se calculeaza hashCode() si nu exista bucket-uri sau liste inlantuite.\\n\\n3. Concluzie:\\n   - Intotdeauna foloseste EnumSet si EnumMap in loc de HashSet/HashMap cand cheile/elementele sunt constante ale unui Enum.",
    codeSnippet: `public enum Role { ADMIN, USER, MANAGER, GUEST }

// EnumSet:
Set<Role> roles = EnumSet.of(Role.ADMIN, Role.MANAGER);
if (roles.contains(Role.ADMIN)) { /* operatie rapida pe biti */ }

// EnumMap:
Map<Role, String> permissions = new EnumMap<>(Role.class);
permissions.put(Role.ADMIN, "Full Access");
permissions.put(Role.USER, "Read Only");`,
    interviewTrap: "EnumSet nu are constructor public. Se instantiaza obligatoriu prin metode statice de tip fabrica: EnumSet.of(), EnumSet.noneOf(), EnumSet.allOf().",
    keyTakeaway: "EnumSet utilizeaza bit vectori iar EnumMap foloseste array indexat dupa ordinal; ambele sunt semnificativ mai rapide decat HashSet/HashMap."
  },
  {
    id: "java-80",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce cheia unui HashMap trebuie sa fie Imutabila?",
    question: "Ce se intampla daca folosesti un obiect mutabil drept cheie intr-un HashMap si ii modifici starea dupa inserare?",
    answer: "1. Mecanismul inserarii:\\n   - La inserarea map.put(key, value), HashMap calculeaza key.hashCode() pentru a gasi bucket-ul corespunzator.\\n\\n2. Ce se intampla la mutatie:\\n   - Daca modifici campurile obiectului cheie, hashCode()-ul acestuia se modifica.\\n   - Cand incerci ulterior sa apelezi map.get(key), HashMap va calcula noul hash code si va cauta intr-un alt bucket!\\n   - Rezultat: get() va returna null, desi obiectul se afla in continuare in HashMap intr-un alt bucket! Valoarea devine \"pierduta\" in memorie (memory leak).\\n\\n3. Regula de aur:\\n   - Cheile din HashMap trebuie sa fie imutabile (ex: String, Integer, UUID, sau clase custom cu campuri final si fara setteri).",
    codeSnippet: `class MutableKey {
    int id;
    MutableKey(int id) { this.id = id; }
    public int hashCode() { return id; }
    public boolean equals(Object o) { return o instanceof MutableKey && this.id == ((MutableKey)o).id; }
}

Map<MutableKey, String> map = new HashMap<>();
MutableKey key = new MutableKey(1);
map.put(key, "Secret Data");

key.id = 2; // MODIFICAM STAREA CHEII!

System.out.println(map.get(key)); // NULL! Valoarea este pierduta in map!`,
    interviewTrap: "Daca modifici cheia dupa inserare, nu poti nici sa o regasesti cu get() si nici sa o stergi usor cu remove(). Datele raman blocate in memorie.",
    keyTakeaway: "Cheile dintr-un HashMap trebuie sa fie intotdeauna imutabile pentru ca hashCode() sa ramana constant pe toata durata vietii obiectului."
  },
  {
    id: "java-81",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Queue: add/remove/element vs offer/poll/peek",
    question: "Care este diferenta dintre cele doua seturi de metode din interfata java.util.Queue in Java?",
    answer: "Interfata Queue ofera doua seturi de metode pentru aceleasi operatii, care difera prin modul de tratare a situatiilor limita (coada plina sau coada goala):\\n\\n1. Setul care arunca EXCEPTII:\\n   - Inserare: add(e) -> arunca IllegalStateException daca o coada cu capacitate limitata este plina.\\n   - Extragere: remove() -> arunca NoSuchElementException daca coada este goala.\\n   - Inspectare: element() -> arunca NoSuchElementException daca coada este goala.\\n\\n2. Setul care returneaza VALORI SPECIALE (fara exceptii):\\n   - Inserare: offer(e) -> returneaza false daca nu s-a putut adauga.\\n   - Extragere: poll() -> returneaza null daca coada este goala.\\n   - Inspectare: peek() -> returneaza null daca coada este goala.\\n\\n3. Recomandare:\\n   - In aplicatii de productie se prefera oferta offer/poll/peek pentru a evita overhead-ul exceptiilor.",
    codeSnippet: `Queue<String> queue = new LinkedList<>();

// Varianta cu exceptii:
// queue.remove(); // Arunca NoSuchElementException!

// Varianta sigura:
String item = queue.poll(); // Returneaza null, nu crapa!
String top = queue.peek();  // Returneaza null

queue.offer("Task 1"); // Adauga cu succes (returneaza true)`,
    interviewTrap: "Daca o coada accepta elemente null (desi nerecomandat), poll() == null devine ambiguu (nu stii daca coada e goala sau contine null).",
    keyTakeaway: "add/remove/element arunca exceptii in caz de eroare; offer/poll/peek returneaza valori speciale (false/null)."
  },
  {
    id: "java-82",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Deque ca Stiva moderna vs vechiul java.util.Stack",
    question: "De ce este clasa java.util.Stack considerata invechita (legacy) si ce clasa/interfata se recomanda in schimb?",
    answer: "1. De ce Stack este invechit:\\n   - Mosteneste clasa Vector, ceea ce inseamna ca fiecare metoda din Stack este sincronizata (synchronized), cauzand overhead inutil de performanta in aplicatii single-thread.\\n   - Sparge principiul OOP prin mostenirea lui Vector: poti apela metode ca stack.add(index, elem) sau stack.remove(index), violand principiul LIFO (Last-In-First-Out).\\n\\n2. Ce se recomanda in schimb:\\n   - Interfata Deque (Double-Ended Queue) si implementarea ArrayDeque.\\n   - ArrayDeque ofera metodele standard LIFO: push(), pop(), peek().\\n   - Este nesincronizata, mult mai rapida decat Stack si bazata pe un array circular eficient.",
    codeSnippet: `// INCORECT (Legacy):
Stack<Integer> oldStack = new Stack<>();

// CORECT si Recomandat:
Deque<Integer> stack = new ArrayDeque<>();
stack.push(10);
stack.push(20);

int top = stack.pop();   // 20
int peek = stack.peek(); // 10`,
    interviewTrap: "Nu folosi niciodata java.util.Stack in cod modern sau la interviu. Arata intervievatorului ca stii ca ArrayDeque este inlocuitorul modern si performant.",
    keyTakeaway: "java.util.Stack mosteneste Vector si e lent sincronizat; ArrayDeque este implementarea moderna recomandata pentru LIFO stiva."
  },
  {
    id: "java-83",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "IdentityHashMap vs HashMap standard",
    question: "Cum difera IdentityHashMap de un HashMap standard si cand este util?",
    answer: "1. Diferenta fundamentala la comparare:\\n   - HashMap standard compara cheile folosind equals() si hashCode().\\n   - IdentityHashMap compara cheile exclusiv dupa identitatea de referinta (operatorul ==) si System.identityHashCode(k).\\n\\n2. Comportament:\\n   - Doua obiecte diferite cu exact acelasi continut (equals() == true) vor fi tratate ca doua intrari separate in IdentityHashMap.\\n\\n3. Cazuri de utilizare tipice:\\n   - Grafuri de obiecte si serializare (detectarea ciclurilor unde vrei sa stii daca ai vizitat exact aceeasi instanta de obiect).\\n   - Framework-uri interne (compilatoare, clonare profunda - deep clone).",
    codeSnippet: `Map<String, String> identityMap = new IdentityHashMap<>();

String s1 = new String("key");
String s2 = new String("key");

identityMap.put(s1, "Value 1");
identityMap.put(s2, "Value 2");

// Desi s1.equals(s2) este true, s1 != s2:
System.out.println(identityMap.size()); // 2!
System.out.println(identityMap.get(s1)); // Value 1
System.out.println(identityMap.get(s2)); // Value 2`,
    interviewTrap: "Daca folosesti literali String (care sunt internati in String Pool), s1 si s2 vor pointa la aceeasi referinta, deci IdentityHashMap va stoca doar o intrare.",
    keyTakeaway: "IdentityHashMap foloseste == in loc de equals() si System.identityHashCode() in loc de hashCode()."
  },
  {
    id: "java-84",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Arrays.binarySearch() si conditiile de utilizare",
    question: "Care este conditia obligatorie inainte de a apela Arrays.binarySearch() si ce returneaza daca elementul nu este gasit?",
    answer: "1. Conditie OBLIGATORIE:\\n   - Array-ul (sau lista in cazul Collections.binarySearch) TREBUIE sa fie sortat in ordine crescatoare inainte de cautare!\\n   - Daca array-ul nu este sortat, rezultatul este nedeterminat (nedefinit).\\n\\n2. Ce returneaza daca elementul este gasit:\\n   - Indexul elementului (>= 0).\\n\\n3. Ce returneaza daca elementul NU este gasit:\\n   - Un numar negativ: -(insertionPoint + 1).\\n   - Unde insertionPoint este indexul unde elementul ar trebui inserat pentru a mentine ordinea sortata.\\n   - Formula permite verificarea rapida: daca index < 0, elementul nu exista.",
    codeSnippet: `int[] arr = { 2, 5, 8, 12, 16, 23, 38 };

int index1 = Arrays.binarySearch(arr, 12);
System.out.println("Gasit la index: " + index1); // 3

int index2 = Arrays.binarySearch(arr, 10);
// 10 ar fi fost inserat la indexul 3. -(3 + 1) = -4
System.out.println("Negasit: " + index2); // -4`,
    interviewTrap: "Daca uiti sa sortezi array-ul cu Arrays.sort(arr) inainte de binarySearch(), poti primi -1 chiar daca elementul exista in array.",
    keyTakeaway: "binarySearch necesita un array sortat; returneaza indexul daca gaseste sau -(insertionPoint + 1) daca nu gaseste."
  },
  {
    id: "java-85",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Algoritmul TimSort in Java",
    question: "Ce algoritm de sortare foloseste Java in Arrays.sort(Object[]) si Collections.sort() si ce complexitate are?",
    answer: "1. Algoritmul TimSort:\\n   - Creat de Tim Peters pentru Python in 2002 si adoptat in Java din Java 7 pentru sortarea obiectelor.\\n   - Este un algoritm hibrid extrem de performant, combinand Insertion Sort si Merge Sort.\\n   - Cauta subsiruri gata ordonate (runs) din datele reale; daca sunt mici, foloseste binary insertion sort; apoi imbina subsirurile prin merge sort.\\n\\n2. Proprietati esentiale:\\n   - Este Stabil (Stable): nu modifica ordinea relativa a elementelor egale (crucial pentru sortari multiple in UI).\\n   - Complexitate de timp:\\n     - Cel mai bun caz (Best Case): O(n) cand array-ul este deja sortat!\\n     - Cazul mediu si cel mai rau caz: O(n log n).\\n   - Complexitate de spatiu: O(n).",
    codeSnippet: `List<User> users = getUsers();
// Foloseste TimSort: pastreaza ordinea elementelor cu aceeasi varsta (stabilitate)
users.sort(Comparator.comparingInt(User::getAge));`,
    interviewTrap: "Pentru primitive (ex: int[]), Arrays.sort() foloseste Dual-Pivot Quicksort (instabil dar rapid pe primitive), NU TimSort.",
    keyTakeaway: "TimSort sorteaza obiecte in O(n log n), cu cel mai bun caz O(n) pe date pre-sortate, si este garantat stabil."
  },
  {
    id: "java-86",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Expresii Lambda si Interfete Functionale",
    question: "Ce este o expresie Lambda in Java si ce cerinta trebuie sa indeplineasca o interfata pentru a fi folosita cu o lambda?",
    answer: "1. Ce este o Expresie Lambda:\\n   - O functie anonima (o bucata de cod compacta fara nume, clasa separata sau modificatori) care poate fi transmisa ca parametru sau stocata intr-o variabila.\\n   - Sintaxa de baza: (parametri) -> { corp; }.\\n\\n2. Relatia cu Interfetele Functionale:\\n   - O expresie lambda poate fi utilizata DOAR acolo unde tipul asteptat este o Interfata Functionala (SAM - Single Abstract Method).\\n   - O interfata functionala este o interfata care are EXACT o singura metoda abstracta (poate avea oricate metode default sau statice).\\n\\n3. Beneficii:\\n   - Reduce codul boilerplate al claselor interne anonime (Anonymous Inner Classes).\\n   - Permite stilul de programare functionala in Java.",
    codeSnippet: `// Varianta veche cu Clasa Anonima:
Runnable r1 = new Runnable() {
    @Override
    public void run() {
        System.out.println("Hello din Thread");
    }
};

// Varianta moderna cu Lambda:
Runnable r2 = () -> System.out.println("Hello din Thread");
new Thread(r2).start();`,
    interviewTrap: "Daca o interfata are 2 metode abstracte, NU este o interfata functionala si incercarea de a-i asocia o expresie lambda va genera eroare de compilare.",
    keyTakeaway: "Expresiile Lambda implementeaza interfete functionale (SAM - o singura metoda abstracta) in mod compact."
  },
  {
    id: "java-87",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Adnotarea @FunctionalInterface",
    question: "Ce rol are adnotarea @FunctionalInterface si este ea obligatorie pentru a folosi o expresie Lambda?",
    answer: "1. Rolul adnotarii @FunctionalInterface:\\n   - Este o verificare la compilare (informative / compiler check), similar cu @Override.\\n   - Forteaza compilatorul sa valideze ca interfata are EXACT o singura metoda abstracta.\\n   - Daca adaugi din greseala o a doua metoda abstracta, compilatorul arunca eroare imediat: \"Unexpected @FunctionalInterface annotation\".\\n   - Documenteaza intentia clara de design ca acea interfata este gandita pentru lambdas.\\n\\n2. Este obligatorie?\\n   - NU! Orice interfata cu o singura metoda abstracta este considerata functional interface conform specificatiei Java, chiar daca lipseste adnotarea.",
    codeSnippet: `@FunctionalInterface
public interface Calculator {
    int compute(int a, int b); // Exact o metoda abstracta!

    // Metode default si statice sunt permise:
    default void printInfo() { System.out.println("Calc"); }
    static int add(int x, int y) { return x + y; }

    // Daca adaugi: void reset(); -> EROARE de compilare!
}`,
    interviewTrap: "Metodele mostenite din java.lang.Object (cum ar fi boolean equals(Object o)) NU se numara ca metode abstracte ale interfetei.",
    keyTakeaway: "@FunctionalInterface nu este obligatorie tehnic, dar este o buna practica esentiala pentru prevenirea adaugarii de metode abstracte in viitor."
  },
  {
    id: "java-88",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cele 4 Interfete Functionale Standard de baza",
    question: "Care sunt cele 4 mari interfete functionale din java.util.function si ce semnaturi au metodele lor?",
    answer: "In pachetul java.util.function exista 4 interfete functionale fundamentale:\\n\\n1. Predicate<T>:\\n   - Metoda: boolean test(T t)\\n   - Primeste un argument de tip T si returneaza un boolean (folosita pentru filtrare si validare).\\n\\n2. Function<T, R>:\\n   - Metoda: R apply(T t)\\n   - Primeste un argument de tip T si returneaza un rezultat transformat de tip R (folosita pentru transformari si mapari).\\n\\n3. Consumer<T>:\\n   - Metoda: void accept(T t)\\n   - Primeste un argument de tip T si nu returneaza nimic (folosita pentru efecte secundare: print, salvare in db).\\n\\n4. Supplier<T>:\\n   - Metoda: T get()\\n   - Nu primeste parametri si produce/furnizeaza o valoare de tip T (factory, lazy loading).",
    codeSnippet: `// 1. Predicate: testeaza conditie
Predicate<String> isLong = s -> s.length() > 5;

// 2. Function: transforma T in R
Function<String, Integer> toLength = String::length;

// 3. Consumer: consuma fara retur
Consumer<String> printer = System.out::println;

// 4. Supplier: furnizeaza valoare
Supplier<Double> randomVal = () -> Math.random();`,
    interviewTrap: "Invata pe de rost cele 4 nume si semnaturile lor: test(), apply(), accept(), get(). Sunt intrebate frecvent la interviurile de Junior/Mid!",
    keyTakeaway: "Predicate (T -> boolean), Function (T -> R), Consumer (T -> void), Supplier (() -> T)."
  },
  {
    id: "java-89",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Interfete Functionale Primitive in Java",
    question: "De ce exista interfete precum IntPredicate, ToIntFunction sau LongConsumer si cand trebuie folosite?",
    answer: "1. Problema cu Generics si Primitive:\\n   - Interfetele generice precum Predicate<Integer> sau Function<String, Integer> lucreaza cu obiecte wrapper (Integer, Double).\\n   - Fiecare apel genereaza operatii de Autoboxing (conversie din int in Integer pe Heap) si Unboxing (conversie din Integer in int).\\n   - Pentru milioane de operatii, autoboxing-ul cauzeaza o degradare severa a performantei si presiune mare pe Garbage Collector.\\n\\n2. Solutia: Interfete specializate pentru primitive:\\n   - IntPredicate (metoda: boolean test(int value)) -> fara boxing!\\n   - ToIntFunction<T> (metoda: int applyAsInt(T value))\\n   - LongConsumer, DoubleSupplier etc.\\n\\n3. Cand se folosesc:\\n   - In procesari intensive de numere si in primitive streams (IntStream, LongStream, DoubleStream).",
    codeSnippet: `// Cu autoboxing (ineficient pentru procesari mari):
Predicate<Integer> p1 = num -> num > 0; // boxing int -> Integer

// Fara autoboxing (performanta maxima):
IntPredicate p2 = num -> num > 0; // lucreaza direct cu tipul primitiv int
boolean result = p2.test(42);`,
    interviewTrap: "Daca folosesti Function<Person, Integer> in loc de ToIntFunction<Person>, vei crea un obiect Integer pe Heap pentru fiecare element procesat.",
    keyTakeaway: "Interfetele functionale primitive elimina penalizarea de memorie si timp cauzata de autoboxing si unboxing."
  },
  {
    id: "java-90",
    category: 'JAVA',
    difficulty: "USOR",
    title: "BiFunction, BiConsumer si BiPredicate",
    question: "Ce reprezinta interfetele BiFunction, BiConsumer si BiPredicate si cum difera de cele simple?",
    answer: "Prefixul \"Bi\" indica faptul ca interfata primeste DOI parametri in loc de unul singur:\\n\\n1. BiPredicate<T, U>:\\n   - Metoda: boolean test(T t, U u)\\n   - Evalueaza o conditie primind doua valori de tipuri posibil diferite.\\n\\n2. BiFunction<T, U, R>:\\n   - Metoda: R apply(T t, U u)\\n   - Primeste doua valori (T si U) si returneaza un rezultat transformat de tip R.\\n\\n3. BiConsumer<T, U>:\\n   - Metoda: void accept(T t, U u)\\n   - Consuma doi parametri fara a returna nimic (foarte des folosita in Map.forEach((k, v) -> ...)).",
    codeSnippet: `// BiPredicate:
BiPredicate<String, Integer> isLongerThan = (str, len) -> str.length() > len;

// BiFunction:
BiFunction<Integer, Integer, String> sumToString = (a, b) -> "Suma: " + (a + b);

// BiConsumer: iterare peste Map
Map<String, Integer> ages = Map.of("Ana", 25, "Mihai", 30);
ages.forEach((name, age) -> System.out.println(name + " are " + age + " ani"));`,
    interviewTrap: "Nu exista o interfata \"BiSupplier\" in Java standard, deoarece o metoda nu poate returna simultan doua valori independente.",
    keyTakeaway: "Variantele \"Bi\" accepta doi parametri de intrare: BiPredicate (test), BiFunction (apply) si BiConsumer (accept)."
  },
  {
    id: "java-91",
    category: 'JAVA',
    difficulty: "USOR",
    title: "UnaryOperator si BinaryOperator",
    question: "Ce sunt UnaryOperator si BinaryOperator si cum relationeaza cu Function si BiFunction?",
    answer: "1. UnaryOperator<T>:\\n   - Este o extensie a lui Function<T, T>.\\n   - Reprezinta o operatie pe un singur operand, unde tipul de intrare si tipul de retur sunt IDENTICE (T apply(T t)).\\n   - Ex: transformarea unui String in litere mari.\\n\\n2. BinaryOperator<T>:\\n   - Este o extensie a lui BiFunction<T, T, T>.\\n   - Reprezinta o operatie pe doi operanzi de acelasi tip T, returnand un rezultat de acelasi tip T.\\n   - Ex: adunarea a doua numere sau gasirea maximului cu BinaryOperator.maxBy(comparator).\\n\\n3. De ce exista:\\n   - Simplifica semnatura atunci cand tipurile nu se schimba.",
    codeSnippet: `// UnaryOperator<String> in loc de Function<String, String>:
UnaryOperator<String> addExclamation = s -> s + "!";
System.out.println(addExclamation.apply("Java")); // Java!

// BinaryOperator<Integer> in loc de BiFunction<Integer, Integer, Integer>:
BinaryOperator<Integer> multiply = (a, b) -> a * b;
System.out.println(multiply.apply(4, 5)); // 20`,
    interviewTrap: "Foloseste UnaryOperator si BinaryOperator cand tipurile de intrare si retur sunt egale pentru a face codul mai clar si usor de citit.",
    keyTakeaway: "UnaryOperator extinde Function<T, T>; BinaryOperator extinde BiFunction<T, T, T>."
  },
  {
    id: "java-92",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Method References (::) in Java",
    question: "Ce sunt Method References (operatorul ::) in Java si care sunt cele 4 tipuri existente?",
    answer: "1. Ce sunt Method References:\\n   - O sintaxa compacta pentru a transmite direct o metoda existenta ca expresie lambda cand lambda nu face altceva decat sa redirectioneze apelul catre acea metoda.\\n\\n2. Cele 4 tipuri de referinte:\\n   - Referinta la metoda statica: ClassName::staticMethod (ex: Math::max echivalent cu (a, b) -> Math.max(a, b)).\\n   - Referinta la metoda de instanta pe un obiect particular: instance::method (ex: System.out::println echivalent cu x -> System.out.println(x)).\\n   - Referinta la metoda de instanta a unui obiect arbitrar de un tip dat: ClassName::instanceMethod (ex: String::toUpperCase echivalent cu s -> s.toUpperCase()).\\n   - Referinta la constructor: ClassName::new (ex: ArrayList::new echivalent cu () -> new ArrayList<>()).",
    codeSnippet: `List<String> names = List.of("ana", "bogdan");

// 1. Static:
Function<Double, Double> sqrt = Math::sqrt;

// 2. Instanta pe obiect particular:
names.forEach(System.out::println);

// 3. Instanta pe tip arbitrar:
List<String> upper = names.stream().map(String::toUpperCase).toList();

// 4. Constructor:
Supplier<List<String>> listSupplier = ArrayList::new;`,
    interviewTrap: "Sintaxa ClassName::instanceMethod este valida doar daca primul argument al expresiei lambda devine obiectul pe care se apeleaza metoda (target-ul apelului).",
    keyTakeaway: "Method References fac codul mai lizibil inlocuind lambdas redundante cu operatorul ::."
  },
  {
    id: "java-93",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Variabile \"Effectively Final\" in Lambdas",
    question: "De ce variabilele locale folosite intr-o expresie lambda trebuie sa fie final sau effectively final?",
    answer: "1. Regula:\\n   - O variabila locala definita in afara unei expresii lambda poate fi accesata in interiorul lambda-ului DOAR daca este marcata explicit final SAU nu i se mai schimba valoarea dupa initializare (effectively final).\\n\\n2. Cauza tehnica (Variable Capture & Stack Lifecycle):\\n   - Variabilele locale traiesc pe Stiva (Stack) a thread-ului care apeleaza metoda si sunt distruse la iesirea din metoda.\\n   - Expresia lambda poate rula asincron pe un alt thread mult timp dupa ce metoda a terminat executia!\\n   - Java copiaza valoarea variabilei locale in instanta lambda (capture by value).\\n   - Daca variabila ar putea fi modificata, ar aparea inconsistente intre stiva si copia din heap (si probleme grave de concurenta).\\n\\n3. Ce nu este restrictionat:\\n   - Campurile de instanta ale clasei pot fi modificate deoarece traiesc pe Heap.",
    codeSnippet: `int count = 10; // effectively final

Runnable r = () -> {
    System.out.println(count); // OK: count nu este modificat
};

int invalidCount = 5;
// invalidCount = 6; // Daca de-comentezi, linia de mai jos nu mai compileaza!
// Runnable r2 = () -> System.out.println(invalidCount); // EROARE!`,
    interviewTrap: "Daca ai nevoie sa modifici o valoare dintr-o lambda, foloseste o structura mutabila pe Heap, cum ar fi AtomicInteger sau un array de un element int[] arr = {0}.",
    keyTakeaway: "Variabilele locale capturate in lambdas sunt copiate dupa valoare si trebuie sa fie final sau effectively final."
  },
  {
    id: "java-94",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Stream API - Ce este un Stream?",
    question: "Ce este un Stream in Java 8+, cum difera de o Colectie si care sunt caracteristicile sale fundamentale?",
    answer: "1. Ce este un Stream:\\n   - O secventa de elemente care suporta operatii agregate de procesare (filtrare, transformare, reducere) in stil declarativ.\\n\\n2. Diferente majore fata de o Colectie:\\n   - Nu stocheaza date: Un Stream este un pipeline de procesare, nu o structura de stocare.\\n   - Functional: Nu modifica sursa de date (nu produce mutatii pe colectia originala).\\n   - Evaluare Lazy: Operatiile intermediare nu se executa pana cand nu este declansata o operatie terminala.\\n   - Consumabil o singura data: Un stream poate fi parcurs o singura data (similar cu un Iterator). Dupa operatia terminala, stream-ul este inchis.",
    codeSnippet: `List<String> list = List.of("Java", "Spring", "Docker");

// Colectia stocheaza date; Stream-ul doar le proceseaza declarativ:
List<String> result = list.stream()
    .filter(s -> s.startsWith("J"))
    .map(String::toUpperCase)
    .toList();

System.out.println(list);   // [Java, Spring, Docker] -> Neschimbat!
System.out.println(result); // [JAVA]`,
    interviewTrap: "Multi juniori cred ca list.stream().filter(...) modifica lista initiala. FALS! Streams nu muta sursa de date, ci produc rezultate noi.",
    keyTakeaway: "Un Stream este un canal de procesare a datelor, nu o colectie; este lazy, functional si de unica folosinta."
  },
  {
    id: "java-95",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Operatii Intermediare vs Operatii Terminale in Streams",
    question: "Care este diferenta dintre operatiile intermediare si cele terminale in Stream API si cum functioneaza Lazy Evaluation?",
    answer: "1. Operatii Intermediare (Intermediate Operations):\\n   - Returneaza intotdeauna un nou Stream (permit chaining / fluent API).\\n   - Sunt LAZY: nu se executa imediat! Doar construiesc pipeline-ul de instructiuni.\\n   - Exemple: filter(), map(), flatMap(), sorted(), distinct(), limit(), skip().\\n\\n2. Operatii Terminale (Terminal Operations):\\n   - Returneaza un rezultat final (colectie, numar, boolean, Optional) sau void.\\n   - Sunt EAGER: declanseaza parcurgerea si executia efectiva a tuturor operatiilor intermediare din pipeline.\\n   - Inchid stream-ul dupa executie.\\n   - Exemple: collect(), toList(), forEach(), reduce(), count(), anyMatch(), findFirst().",
    codeSnippet: `List<String> names = List.of("Ana", "Ion", "Maria");

// FARA operatie terminala: nimic nu se executa (niciun print la consola)!
names.stream().filter(n -> {
    System.out.println("Filtrare: " + n);
    return n.length() > 3;
});

// CU operatie terminala: pipeline-ul se declanseaza!
long count = names.stream()
    .filter(n -> {
        System.out.println("Procesare: " + n);
        return n.length() > 3;
    })
    .count(); // Operatia terminala declanseaza totul!`,
    interviewTrap: "Daca ai un stream doar cu operatii intermediare si fara nicio operatie terminala, codul nu va executa nicio instructiune si nu va da nicio eroare!",
    keyTakeaway: "Operatiile intermediare sunt lazy si returneaza un Stream; operatia terminala porneste executia si returneaza rezultatul final."
  },
  {
    id: "java-96",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Operatiile filter() si map() in Stream API",
    question: "Cum functioneaza operatiile intermediare filter() si map() si cand se foloseste fiecare?",
    answer: "1. filter(Predicate<T>):\\n   - Selecteaza elemente pe baza unei conditii booleene.\\n   - Pastreaza in stream doar elementele pentru care predicatul returneaza true.\\n   - Numarul de elemente din stream scade sau ramane egal; tipul elementelor ramane neschimbat (T -> T).\\n\\n2. map(Function<T, R>):\\n   - Transforma fiecare element intr-un alt element / valoare.\\n   - Numarul de elemente ramane strict acelasi (relatie 1 la 1).\\n   - Tipul elementului se poate schimba (ex: transforma User in String, sau String in Integer).",
    codeSnippet: `List<String> items = List.of("apple", "banana", "kiwi", "avocado");

List<Integer> lengths = items.stream()
    .filter(s -> s.startsWith("a")) // Pastreaza doar: "apple", "avocado"
    .map(String::length)            // Transforma in lungimi: 5, 7
    .toList();

System.out.println(lengths); // [5, 7]`,
    interviewTrap: "Nu folosi map() pentru a filtra elemente returnand null; foloseste intotdeauna filter() pentru eliminarea elementelor.",
    keyTakeaway: "filter() reduce numarul de elemente pastrand tipul; map() transforma fiecare element pastrand numarul de elemente (1:1)."
  },
  {
    id: "java-97",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "map() vs flatMap() in Stream API",
    question: "Care este diferenta dintre map() si flatMap() si cand este obligatoriu flatMap()?",
    answer: "1. map(Function<T, R>):\\n   - Transforma fiecare element intr-un singur rezultat de tip R (mapare 1 la 1).\\n   - Daca functia returneaza o colectie sau un stream, map() produce un Stream de colectii (ex: Stream<List<String>>).\\n\\n2. flatMap(Function<T, Stream<R>>):\\n   - Transforma fiecare element intr-un Stream de rezultate si apoi \"aplatizeaza\" (flattens) toate aceste stream-uri intr-un singur Stream continuu (mapare 1 la multe).\\n   - Transforma structuri imbricate (liste de liste, orase dintr-o lista de tari) intr-un stream plat.\\n\\n3. Cand este folosit:\\n   - Flattening de List<List<T>> -> List<T>.\\n   - Decomprimarea relatiilor One-to-Many.",
    codeSnippet: `List<List<String>> nested = List.of(
    List.of("A", "B"),
    List.of("C", "D")
);

// Cu map: produce Stream<List<String>> (structura ramane imbricata)
// nested.stream().map(List::stream)...

// Cu flatMap: produce Stream<String> (aplatizat intr-o singura lista)
List<String> flat = nested.stream()
    .flatMap(List::stream)
    .toList();

System.out.println(flat); // [A, B, C, D]`,
    interviewTrap: "Daca ai nevoie sa extragi toate comenzile tuturor clientilor dintr-o lista List<Customer>, foloseste flatMap(c -> c.getOrders().stream()). Daca folosesti map, obtii un Stream<List<Order>>.",
    keyTakeaway: "map() mapeaza 1:1; flatMap() mapeaza 1:N si aplatizeaza stream-urile imbricate intr-un singur stream liniar."
  },
  {
    id: "java-98",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Operatiile distinct, sorted, limit si skip",
    question: "Ce fac operatiile intermediare distinct(), sorted(), limit() si skip() si care dintre ele sunt stateful?",
    answer: "1. Operatii Stateful vs Stateless:\\n   - Stateless: Fiecare element este procesat independent de celelalte (ex: filter, map).\\n   - Stateful: Necesita cunoasterea starii anterioare sau stocarea elementelor in memorie.\\n\\n2. distinct():\\n   - Elimina duplicatele pe baza metodei equals() si hashCode(). (Stateful)\\n\\n3. sorted():\\n   - Sorteaza elementele in ordinea naturala (Comparable) sau folosind un Comparator explicit. Necesita acumularea tuturor elementelor inainte de a merge mai departe! (Stateful)\\n\\n4. limit(maxSize):\\n   - Trunchiaza stream-ul la primele maxSize elemente. (Short-circuiting)\\n\\n5. skip(n):\\n   - Sare peste primele n elemente din stream.",
    codeSnippet: `List<Integer> numbers = List.of(5, 2, 8, 2, 9, 5, 1, 3);

List<Integer> result = numbers.stream()
    .distinct()            // [5, 2, 8, 9, 1, 3]
    .sorted()              // [1, 2, 3, 5, 8, 9]
    .skip(2)               // Sare peste 1, 2 -> [3, 5, 8, 9]
    .limit(3)              // Primele 3 -> [3, 5, 8]
    .toList();

System.out.println(result); // [3, 5, 8]`,
    interviewTrap: "Pe stream-uri infinite (ex: Stream.generate()), apelul sorted() va bloca aplicatia cu OutOfMemoryError pentru ca incearca sa stocheze infinitatea de elemente in memorie.",
    keyTakeaway: "distinct() elimina duplicatele, sorted() ordoneaza, skip(n) sare peste n elemente, limit(k) opreste dupa k elemente."
  },
  {
    id: "java-99",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Operatia peek() in Streams: Corect vs Anti-pattern",
    question: "Care este scopul oficial al operatiei peek() si de ce este considerata un anti-pattern cand modifica starea?",
    answer: "1. Scopul oficial:\\n   - Operatie intermediara conceputa EXCLUSIV pentru debugging si logging (vizualizarea elementelor pe masura ce curg prin pipeline).\\n   - Primeste un Consumer<T> si returneaza acelasi stream.\\n\\n2. De ce modificarea starii prin peek() este un Anti-pattern:\\n   - Streams sunt optimizate de JVM; in anumite situatii (ex: stream.map(...).peek(...).count()), compilatorul poate optimiza complet si sari peste pasul peek() daca numarul de elemente poate fi dedus fara evaluare!\\n   - Modificarea starii obiectelor (side-effects) in peek() sparge principiul imutabilitatii si produce erori neasteptate pe stream-uri paralele.\\n\\n3. Regula:\\n   - Foloseste peek() doar pentru log.debug() / println(); daca vrei transformari de date, foloseste map().",
    codeSnippet: `// UTILIZARE CORECTA: doar logging/debugging
List<String> res = List.of("one", "two", "three").stream()
    .filter(s -> s.length() > 3)
    .peek(val -> System.out.println("Filtrat: " + val))
    .map(String::toUpperCase)
    .toList();

// ANTI-PATTERN: modificarea starii obiectelor in peek!
// list.stream().peek(user -> user.setStatus("ACTIVE")).toList(); // GRESIT!`,
    interviewTrap: "In Java 9+, expresia Stream.of(\"a\", \"b\").peek(System.out::println).count() poate sa NU printeze nimic! Deoarece count() stie deja dimensiunea stream-ului si sare peste executia pipeline-ului.",
    keyTakeaway: "peek() este strict pentru depanare/logging; nu te baza pe el pentru modificari de date sau logica de business."
  },
  {
    id: "java-100",
    category: 'JAVA',
    difficulty: "USOR",
    title: "forEach() vs forEachOrdered() in Streams",
    question: "Care este diferenta dintre forEach() si forEachOrdered(), in special pe Stream-uri paralele?",
    answer: "1. forEach(Consumer<T>):\\n   - Parcurge fiecare element din stream si aplica actiunea.\\n   - Pe un stream secvential simplu, parcurge in ordinea aparitiei.\\n   - Pe un Parallel Stream, forEach() NU garanteaza ordinea de procesare a elementelor; le proceseaza asincron in functie de cum termina thread-urile din pool (creste performanta renuntand la ordine).\\n\\n2. forEachOrdered(Consumer<T>):\\n   - Garanteaza ca elementele vor fi procesate STRICT in ordinea sursei originale (encounter order), chiar si pe stream-uri paralele.\\n   - Consecinta: pe parallel streams, forEachOrdered() anuleaza mare parte din avantajul de performanta al paralelizarii.",
    codeSnippet: `List<Integer> list = List.of(1, 2, 3, 4, 5);

// Pe stream paralel:
System.out.println("--- forEach (ordine nedeterminista): ---");
list.parallelStream().forEach(System.out::print); // ex: 3 5 1 2 4

System.out.println("\\n--- forEachOrdered (ordine garantata): ---");
list.parallelStream().forEachOrdered(System.out::print); // 1 2 3 4 5`,
    interviewTrap: "Daca folosesti forEachOrdered() pe un parallelStream(), thread-urile trebuie sa astepte sincronizarea ordinii, pierzand beneficiul vitezei paralele.",
    keyTakeaway: "forEach este rapid dar renunta la ordinea de intalnire pe stream-uri paralele; forEachOrdered mentine ordinea cu pretul performantei."
  },
  {
    id: "java-101",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "findFirst() vs findAny() in Streams",
    question: "Cum difera findFirst() de findAny() si cand ar trebui preferat findAny()?",
    answer: "1. findFirst():\\n   - Returneaza un Optional cu primul element din stream conform ordinii de intalnire (encounter order).\\n   - Este deterministic atat pe stream-uri secventiale cat si pe cele paralele.\\n   - Pe stream-uri paralele are cost ridicat de coordonare intre thread-uri pentru a garanta ca returneaza fix primul element din lista originala.\\n\\n2. findAny():\\n   - Returneaza un Optional cu ORICARE element din stream care indeplineste conditiile.\\n   - Pe stream-uri secventiale returneaza de obicei tot primul element.\\n   - Pe stream-uri paralele este mult mai performant: returneaza imediat primul rezultat gasit de oricare thread liber (non-deterministic).\\n\\n3. Recomandare:\\n   - Foloseste findAny() cand nu te intereseaza ordinea exacta pe stream-uri paralele.",
    codeSnippet: `List<String> names = List.of("Ion", "Ana", "Alex", "Andrei");

// Pe paralel stream:
Optional<String> any = names.parallelStream()
    .filter(s -> s.startsWith("A"))
    .findAny(); // Returneaza rapid oricare dintre "Ana", "Alex", "Andrei"

Optional<String> first = names.parallelStream()
    .filter(s -> s.startsWith("A"))
    .findFirst(); // Garanteaza returnarea lui "Ana"`,
    interviewTrap: "Pe stream-uri secventiale findFirst() si findAny() dau aproape mereu acelasi rezultat, dar diferenta devine critica pe stream-uri paralele.",
    keyTakeaway: "findFirst() garanteaza primul element (mai lent pe paralel); findAny() returneaza cel mai rapid element gasit de thread-uri."
  },
  {
    id: "java-102",
    category: 'JAVA',
    difficulty: "USOR",
    title: "anyMatch, allMatch, noneMatch si Short-Circuiting",
    question: "Ce fac metodele anyMatch(), allMatch() si noneMatch() si cum functioneaza evaluarea Short-Circuiting?",
    answer: "1. Ce este Short-Circuiting:\\n   - Un mecanism de optimizare prin care procesarea stream-ului se opreste imediat ce rezultatul final poate fi determinat cu certitudine, fara a mai parcurge restul elementelor.\\n\\n2. anyMatch(Predicate<T>):\\n   - Returneaza true daca CEL PUTIN UN element respecta conditia. Se opreste la primul element adevarat.\\n\\n3. allMatch(Predicate<T>):\\n   - Returneaza true daca TOATE elementele respecta conditia. Se opreste la primul element fals.\\n\\n4. noneMatch(Predicate<T>):\\n   - Returneaza true daca NICIUN element nu respecta conditia. Se opreste la primul element adevarat.\\n\\n5. Comportament pe Stream GOAL (Important!):\\n   - anyMatch pe stream gol returneaza false.\\n   - allMatch pe stream gol returneaza true (adevar vacuus)!\\n   - noneMatch pe stream gol returneaza true.",
    codeSnippet: `List<Integer> nums = List.of(2, 4, 6, 7, 8, 10);

// Se opreste la 7:
boolean hasOdd = nums.stream().anyMatch(n -> n % 2 != 0); // true (gasit la 7)

// Se opreste la 7:
boolean allEven = nums.stream().allMatch(n -> n % 2 == 0); // false (esuat la 7)

// Stream gol:
List<Integer> empty = List.of();
System.out.println(empty.stream().allMatch(n -> n > 100)); // true!`,
    interviewTrap: "Capcana clasica de interviu: Ce returneaza streamGol.allMatch(x -> x > 10)? Raspunsul este TRUE, conform logicii matematice a predicatelor (vacuous truth).",
    keyTakeaway: "anyMatch, allMatch si noneMatch folosesc short-circuiting si se opresc imediat ce verdictul este sigur."
  },
  {
    id: "java-103",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Operatia terminala reduce() in Streams",
    question: "Cum functioneaza operatia reduce() in Stream API si care sunt cele 3 variante ale sale?",
    answer: "1. Ce face reduce():\\n   - Combina succesiv toate elementele dintr-un stream intr-o singura valoare finala folosind o functie acumulatoare (BinaryOperator).\\n\\n2. Cele 3 variante de supraincarcare:\\n   - Varianta 1: Optional<T> reduce(BinaryOperator<T> accumulator)\\n     - Nu are valoare initiala. Daca stream-ul este gol, returneaza Optional.empty().\\n   - Varianta 2: T reduce(T identity, BinaryOperator<T> accumulator)\\n     - Are valoare de identitate (ex: 0 pentru suma, 1 pentru inmultire). Returneaza direct T.\\n   - Varianta 3: <U> U reduce(U identity, BiFunction<U, ? super T, U> accumulator, BinaryOperator<U> combiner)\\n     - Folosita pe stream-uri paralele cand tipul rezultatului difera de tipul elementelor.",
    codeSnippet: `List<Integer> numbers = List.of(1, 2, 3, 4, 5);

// Varianta 1: returneaza Optional
Optional<Integer> sumOpt = numbers.stream().reduce((a, b) -> a + b);

// Varianta 2: cu identity = 0 (suma):
int sum = numbers.stream().reduce(0, (a, b) -> a + b); // sau Integer::sum
System.out.println("Suma: " + sum); // 15

// Varianta cu inmultire (identity = 1):
int product = numbers.stream().reduce(1, (a, b) -> a * b); // 120`,
    interviewTrap: "Daca pui o valoare de identitate gresita (ex: identity = 10 la suma), rezultatul final va fi alterat (10 + suma numerelor). Valoarea identity trebuie sa respecte regula f(identity, x) == x.",
    keyTakeaway: "reduce() pliaza elementele stream-ului intr-un singur rezultat cumulativ pe baza unei operatii asociative."
  },
  {
    id: "java-104",
    category: 'JAVA',
    difficulty: "USOR",
    title: "count(), min() si max() pe Stream-uri",
    question: "Cum se utilizeaza operatiile terminale count(), min() si max() si ce tipuri returneaza?",
    answer: "1. count():\\n   - Returneaza numarul de elemente din stream sub forma unui long.\\n\\n2. min(Comparator<T>) si max(Comparator<T>):\\n   - Primeste obligatoriu un Comparator pentru a defini ordinea de comparare.\\n   - Returneaza un Optional<T>, deoarece stream-ul poate fi gol!\\n   - Optional previne aparitia NullPointerException.",
    codeSnippet: `List<String> list = List.of("elefant", "caine", "pisica", "leu");

// count():
long total = list.stream().filter(s -> s.length() > 3).count();

// min() dupa lungime:
Optional<String> shortest = list.stream()
    .min(Comparator.comparingInt(String::length));

// max() alfabetic:
Optional<String> lastAlphabetical = list.stream()
    .max(String::compareTo);

shortest.ifPresent(s -> System.out.println("Cel mai scurt: " + s)); // leu`,
    interviewTrap: "min() si max() nu compileaza fara un Comparator (cu exceptia Primitive Streams: IntStream.min() nu are nevoie de Comparator).",
    keyTakeaway: "count() returneaza long; min() si max() necesita un Comparator si returneaza Optional<T>."
  },
  {
    id: "java-105",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Collectors.toList() vs Stream.toList() (Java 16+)",
    question: "Care este diferenta dintre stream.collect(Collectors.toList()) si stream.toList() introdus in Java 16?",
    answer: "1. stream.collect(Collectors.toList()):\\n   - Returneaza o implementare de List (de regula un ArrayList standard).\\n   - Lista returnata este MUTABILA (poti apela .add() sau .remove() fara eroare).\\n   - Permite elemente null.\\n\\n2. stream.toList() (Java 16+):\\n   - Sintaxa mult mai concisa si directa.\\n   - Returneaza o lista complet IMUTABILA (unmodifiable list).\\n   - Daca apelezi add() sau remove() pe lista rezultata, arunca UnsupportedOperationException!\\n   - Consuma mai putina memorie.",
    codeSnippet: `List<String> names = List.of("A", "B");

// Java 8+: lista mutabila
List<String> mutableList = names.stream()
    .collect(Collectors.toList());
mutableList.add("C"); // Functioneaza!

// Java 16+: lista imutabila compacta
List<String> unmodList = names.stream().toList();
// unmodList.add("C"); // UnsupportedOperationException la runtime!`,
    interviewTrap: "stream.toList() produce o lista read-only; daca echipa ta are nevoie sa adauge elemente ulterior in lista rezultata, stream.toList() va cauza UnsupportedOperationException.",
    keyTakeaway: "Collectors.toList() creeaza o lista mutabila; Stream.toList() din Java 16 produce o lista imutabila compacta."
  },
  {
    id: "java-106",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Collectors.toSet() si Collectors.toCollection()",
    question: "Cand folosim Collectors.toSet() si cum putem alege o implementare specifica folosind Collectors.toCollection()?",
    answer: "1. Collectors.toSet():\\n   - Colecteaza elementele intr-un Set, eliminand automat duplicatele pe baza equals() si hashCode().\\n   - Nu ofera garantii privind ordinea sau implementarea concreta (de obicei returneaza un HashSet).\\n\\n2. Collectors.toCollection(Supplier):\\n   - Folosit atunci cand doresti o implementare concreta specifica (ex: TreeSet pentru ordine sortata, LinkedHashSet pentru ordinea de inserare, sau LinkedList).\\n   - Primeste un constructor reference (ex: TreeSet::new).",
    codeSnippet: `List<String> items = List.of("mere", "pere", "mere", "nuci");

// Set simplu (duplicate eliminate, ordine nedeterminata):
Set<String> set = items.stream()
    .collect(Collectors.toSet());

// TreeSet specific (sortat alfabetic):
Set<String> sortedSet = items.stream()
    .collect(Collectors.toCollection(TreeSet::new));

// LinkedList specific:
List<String> linked = items.stream()
    .collect(Collectors.toCollection(LinkedList::new));`,
    interviewTrap: "Daca ai nevoie ca Set-ul rezultat sa fie sortat, nu te baza pe Collectors.toSet(), ci foloseste Collectors.toCollection(TreeSet::new).",
    keyTakeaway: "toSet() colecteaza intr-un Set general; toCollection(Supplier) permite alegerea implementarii exacte (TreeSet, LinkedList etc.)."
  },
  {
    id: "java-107",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Collectors.toMap() si Gestionarea Cheilor Duplicate",
    question: "Ce exceptie arunca Collectors.toMap() la aparitia unei chei duplicate si cum se rezolva cu mergeFunction?",
    answer: "1. Problema cu varianta simpla toMap(keyMapper, valueMapper):\\n   - Daca doua elemente din stream genereaza aceeasi cheie, se arunca IllegalStateException: \"Duplicate key ...\".\\n\\n2. Solutia: Furnizarea functiei de rezolvare a conflictelor (mergeFunction):\\n   - Varianta cu 3 parametri: Collectors.toMap(keyMapper, valueMapper, mergeFunction).\\n   - mergeFunction este un BinaryOperator care decide ce valoare se pastreaza cand cheia este duplicata: valoarea existenta (oldVal), valoarea noua (newVal), sau o combinare a lor.\\n\\n3. Varianta cu 4 parametri:\\n   - Permite si specificarea implementarii de Map dorite (ex: TreeMap::new).",
    codeSnippet: `class Item {
    String category;
    int price;
    Item(String c, int p) { this.category = c; this.price = p; }
}

List<Item> items = List.of(
    new Item("ELECTRONICS", 100),
    new Item("BOOKS", 20),
    new Item("ELECTRONICS", 150) // Cheie duplicata!
);

// Cu mergeFunction: pastram pretul mai mare
Map<String, Integer> map = items.stream().collect(
    Collectors.toMap(
        item -> item.category,
        item -> item.price,
        (oldVal, newVal) -> Math.max(oldVal, newVal) // Rezolvare conflict!
    )
);
System.out.println(map); // {BOOKS=20, ELECTRONICS=150}`,
    interviewTrap: "Daca omiti al 3-lea argument (mergeFunction) si stream-ul primeste date din exterior cu chei duplicate, aplicatia va crapa cu IllegalStateException.",
    keyTakeaway: "Collectors.toMap arunca IllegalStateException la chei duplicate; parametrul mergeFunction rezolva coliziunea."
  },
  {
    id: "java-108",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Collectors.groupingBy() in Streams",
    question: "Cum functioneaza Collectors.groupingBy() si cum poti compune clasificatori cu downstream collectors?",
    answer: "1. groupingBy simplu (clasificare dupa cheie):\\n   - Imparte elementele dintr-un stream in grupuri pe baza unei functii de clasificare (Function<T, K>).\\n   - Returneaza un Map<K, List<T>>.\\n\\n2. groupingBy cu Downstream Collector:\\n   - Permite agregarea valorilor din fiecare grup intr-un mod personalizat in loc de simpla lista:\\n   - Numarare: groupingBy(classifier, counting()) -> Map<K, Long>\\n   - Suma: groupingBy(classifier, summingInt(mapper)) -> Map<K, Integer>\\n   - Colectare valori specifice: groupingBy(classifier, mapping(mapper, toList()))\\n\\n3. Corespunde clauzei GROUP BY din SQL.",
    codeSnippet: `class Employee {
    String dept;
    int salary;
    Employee(String d, int s) { this.dept = d; this.salary = s; }
    public String getDept() { return dept; }
}

List<Employee> emps = List.of(
    new Employee("IT", 5000),
    new Employee("HR", 3000),
    new Employee("IT", 6000)
);

// 1. Grupare simpla in Map<String, List<Employee>>:
Map<String, List<Employee>> byDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::getDept));

// 2. Grupare cu numarare: Map<String, Long>
Map<String, Long> countByDept = emps.stream()
    .collect(Collectors.groupingBy(Employee::getDept, Collectors.counting()));
System.out.println(countByDept); // {HR=1, IT=2}`,
    interviewTrap: "groupingBy(classifier) este echivalentul groupingBy(classifier, toList()). Daca vrei Set sau numar, trebuie specificat explicit downstream collector-ul.",
    keyTakeaway: "groupingBy clasifica elementele intr-un Map si suporta downstream collectors (counting, summing, mapping) pentru agregari avansate."
  },
  {
    id: "java-109",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Collectors.partitioningBy() in Streams",
    question: "Ce face Collectors.partitioningBy() si cum difera de groupingBy()?",
    answer: "1. Ce este partitioningBy:\\n   - Un caz particular de grupare unde functia de clasificare este un Predicate<T> boolean.\\n   - Imparte intotdeauna elementele in exact DOUA partitii: true si false.\\n   - Returneaza intotdeauna un Map<Boolean, List<T>> (sau Map<Boolean, D> cu downstream collector).\\n\\n2. Diferenta cheie fata de groupingBy:\\n   - groupingBy poate genera oricate chei in Map, in functie de valorile din obiecte.\\n   - partitioningBy are INTOTDEAUNA exact cele doua chei: Boolean.TRUE si Boolean.FALSE, chiar daca una dintre liste este goala.",
    codeSnippet: `List<Integer> numbers = List.of(1, 2, 3, 4, 5, 6);

// Partitionare in Pare (true) si Impare (false):
Map<Boolean, List<Integer>> partitioned = numbers.stream()
    .collect(Collectors.partitioningBy(n -> n % 2 == 0));

System.out.println("Pare: " + partitioned.get(true));   // [2, 4, 6]
System.out.println("Impare: " + partitioned.get(false)); // [1, 3, 5]`,
    interviewTrap: "partitioningBy garanteaza ca atat cheia true cat si false exista in Map. Daca nu exista elemente pare, partitioned.get(true) va returna o lista goala [], niciodata null.",
    keyTakeaway: "partitioningBy foloseste un Predicate si returneaza mereu un Map<Boolean, List<T>> cu cele doua partitii: true si false."
  },
  {
    id: "java-110",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Collectors.joining() pentru concatenare",
    question: "Cum folosim Collectors.joining() pentru a concatena siruri de caractere si ce parametri accepta?",
    answer: "1. Ce este Collectors.joining():\\n   - Un colector specializat pe Stream<CharSequence> / Stream<String> pentru concatenarea eficienta a textelor (folosind StringBuilder sub capota).\\n\\n2. Cele 3 variante de supraincarcare:\\n   - joining(): Concateneaza elementele direct fara niciun separator.\\n   - joining(delimiter): Concateneaza elementele cu un separator specificat intre ele (ex: \", \").\\n   - joining(delimiter, prefix, suffix): Concateneaza cu separator si adauga un prefix si sufix la intregul rezultat final (ex: \"[A, B, C]\").",
    codeSnippet: `List<String> names = List.of("Java", "Kotlin", "Scala");

String direct = names.stream().collect(Collectors.joining());
// "JavaKotlinScala"

String withComma = names.stream().collect(Collectors.joining(", "));
// "Java, Kotlin, Scala"

String formatted = names.stream().collect(Collectors.joining(", ", "[", "]"));
// "[Java, Kotlin, Scala]"`,
    interviewTrap: "joining() functioneaza doar pe stream-uri de tip String / CharSequence. Daca ai obiecte custom, trebuie sa aplici .map(Object::toString) inainte.",
    keyTakeaway: "Collectors.joining(delimiter, prefix, suffix) realizeaza concatenarea eleganta a sirurilor fara bucle for manuale."
  },
  {
    id: "java-111",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Colectori de statistica: summarizingInt, averagingDouble, summingInt",
    question: "Ce statistici ofera Collectors.summarizingInt() si cum se calculeaza mediile si sumele pe stream-uri?",
    answer: "1. summingInt(ToIntFunction) / summingDouble / summingLong:\\n   - Calculeaza direct suma valorilor returnate de functie.\\n\\n2. averagingInt(ToIntFunction) / averagingDouble:\\n   - Calculeaza media aritmetica (returneaza Double).\\n\\n3. summarizingInt(ToIntFunction):\\n   - Colecteaza intr-o singura parcurgere a stream-ului un set complet de statistici: numar (count), suma (sum), minim (min), medie (average) si maxim (max).\\n   - Returneaza un obiect IntSummaryStatistics.",
    codeSnippet: `List<String> words = List.of("ana", "are", "mere", "portocale");

IntSummaryStatistics stats = words.stream()
    .collect(Collectors.summarizingInt(String::length));

System.out.println("Numar elemente: " + stats.getCount()); // 4
System.out.println("Suma lungimi: " + stats.getSum());       // 19
System.out.println("Min: " + stats.getMin());                 // 3
System.out.println("Medie: " + stats.getAverage());           // 4.75
System.out.println("Max: " + stats.getMax());                 // 9`,
    interviewTrap: "summarizingInt calculeaza toate cele 5 valori intr-o singura trecere prin stream, evitand parcurgerea multipla.",
    keyTakeaway: "IntSummaryStatistics ofera count, sum, min, average si max dintr-o singura operatie colectoare."
  },
  {
    id: "java-112",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Primitive Streams: IntStream, LongStream, DoubleStream",
    question: "Ce sunt Primitive Streams in Java si cum difera IntStream.range() de IntStream.rangeClosed()?",
    answer: "1. Ce sunt Primitive Streams:\\n   - Specializari ale interfetei Stream pentru primitive: IntStream (int), LongStream (long), DoubleStream (double).\\n   - Evita complet overhead-ul de memorie si performanta al autoboxing-ului Integer/Double.\\n   - Ofera operatii matematice directe: sum(), average(), min(), max(), fara a necesita colectori sau Comparatori.\\n\\n2. range(start, end) vs rangeClosed(start, end):\\n   - range(a, b): interval semi-deschis [a, b) -> include a, dar EXCLUDE b.\\n   - rangeClosed(a, b): interval inchis [a, b] -> include atat a cat si b.",
    codeSnippet: `// range: 1 la 4 (exclude 5)
int sum1 = IntStream.range(1, 5).sum(); // 1 + 2 + 3 + 4 = 10

// rangeClosed: 1 la 5 (include 5)
int sum2 = IntStream.rangeClosed(1, 5).sum(); // 1 + 2 + 3 + 4 + 5 = 15

// Conversie de la Stream de obiecte la Primitive Stream:
List<String> list = List.of("a", "bb", "ccc");
int totalChars = list.stream().mapToInt(String::length).sum(); // 6`,
    interviewTrap: "Daca ai nevoie sa transformi un IntStream inapoi intr-un Stream<Integer>, trebuie sa apelezi metoda .boxed().",
    keyTakeaway: "Primitive streams (IntStream, LongStream, DoubleStream) elimina autoboxing-ul si ofera metode numerice directe ca sum() si average()."
  },
  {
    id: "java-113",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Parallel Streams: Cand ajuta si cand fac rau?",
    question: "Cum functioneaza parallelStream(), cand merita folosit si care sunt pericolele ascunse?",
    answer: "1. Cum functioneaza:\\n   - Imparte datele in chunk-uri si le proceseaza in paralel folosind ForkJoinPool.commonPool() comun al JVM-ului.\\n\\n2. Cand ajuta:\\n   - Seturi MASIVE de date (sute de mii / milioane de elemente).\\n   - Operatii CPU-intensive pe fiecare element, unde fiecare element este complet independent de celelalte.\\n   - Structuri de date usor de divizat (ArrayList, array primitiv; NU LinkedList!).\\n\\n3. Cand face rau (Pericole ascunse):\\n   - Overhead de coordonare: pentru colectii mici, stream-ul paralel este MULT MAI LENT decat cel secvential!\\n   - Thread Pool comun: daca rulezi operatii I/O blocante (apeluri HTTP/DB) in parallelStream(), blochezi tot ForkJoinPool.commonPool(), afectand intreaga aplicatie!\\n   - Race conditions: daca modifici o colectie nesincronizata din interiorul lambda-ului.",
    codeSnippet: `List<Integer> list = List.of(1, 2, 3, 4, 5);

// GRESIT: Race condition pe ArrayList nesincronizat!
List<Integer> unsafe = new ArrayList<>();
list.parallelStream().forEach(unsafe::add); // COMPORTAMENT NEDETERMINAT / Erori!

// CORECT: Folosirea colectorului thread-safe
List<Integer> safe = list.parallelStream().map(x -> x * 2).toList();`,
    interviewTrap: "Nu folosi NICIODATA parallelStream() pentru operatii I/O sau blocante, deoarece imparti ForkJoinPool.commonPool() cu toata masina virtuala.",
    keyTakeaway: "Parallel streams ajuta doar la volume uriase de calcul CPU pur; pe date mici sau I/O scad performanta si pot bloca pool-ul comun."
  },
  {
    id: "java-114",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Reutilizarea unui Stream in Java",
    question: "Ce se intampla daca incerci sa apelezi doua operatii terminale pe aceeasi instanta de Stream?",
    answer: "1. Regula:\\n   - Un Stream in Java poate fi consumat o SINGURA DATA.\\n   - Dupa ce o operatie terminala (ex: count, toList, forEach) a fost executata, stream-ul este considerat inchis si epuizat.\\n\\n2. Exceptia aruncata:\\n   - Daca incerci sa apelezi o a doua operatie intermediara sau terminala pe acelasi stream, Java arunca imediat IllegalStateException: \"stream has already been operated upon or closed\".\\n\\n3. Cum se rezolva daca ai nevoie de multiple parcurgeri:\\n   - Re-creeaza un stream nou din colectia sursa: list.stream().\\n   - Foloseste un Supplier<Stream<T>> care genereaza un stream proaspat la fiecare apel.",
    codeSnippet: `List<String> list = List.of("A", "B", "C");
Stream<String> stream = list.stream();

stream.forEach(System.out::println); // Operatia 1: OK!

// Incercare de reutilizare a aceluiasi stream:
// long count = stream.count(); // IllegalStateException: stream has already been operated upon or closed!

// Solutia corecta cu Supplier:
Supplier<Stream<String>> streamSupplier = () -> list.stream();
streamSupplier.get().forEach(System.out::println); // OK
long c = streamSupplier.get().count();             // OK`,
    interviewTrap: "Nu stoca stream-uri in variabile pe care sa le refolosesti. Creeaza intotdeauna stream-ul ad-hoc din colectie cand vrei sa il parcurgi.",
    keyTakeaway: "Un Stream este de unica folosinta; a doua operatie pe acelasi stream arunca IllegalStateException."
  },
  {
    id: "java-115",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Optional in Java: Scop si Design",
    question: "Ce este Optional<T> in Java 8+ si care a fost scopul principal pentru care a fost introdus de creatorii limbajului?",
    answer: "1. Ce este Optional<T>:\\n   - Un obiect container (wrapper) care poate contine fie o valoare non-null (present), fie nicio valoare (empty).\\n\\n2. Scopul de baza:\\n   - A fost conceput special ca TIP DE RETUR pentru metode de biblioteca si servicii unde o valoare poate lipsi in mod legitim (ex: findById, findFirst).\\n   - Obliga cel care apeleaza metoda (caller-ul) sa se gandeasca si sa trateze explicit cazul in care valoarea lipseste, eliminand erorile neasteptate de tip NullPointerException.\\n\\n3. Ce NU este gandit sa fie:\\n   - NU este o inlocuire generala pentru fiecare referinta posibila de null din cod.\\n   - NU este recomandat ca parametru in metode, nici ca tip de camp (field) in clase de domeniu.",
    codeSnippet: `// Design bun: tip de retur clar care semnaleaza posibilitatea lipsei valorii
public Optional<User> findUserById(Long id) {
    User user = database.find(id);
    return Optional.ofNullable(user);
}

// Caller-ul este fortat sa gestioneze absenta:
findUserById(10L).ifPresentOrElse(
    u -> System.out.println("Gasit: " + u.getName()),
    () -> System.out.println("Utilizatorul nu exista!")
);`,
    interviewTrap: "Optional nu este Serializable. Daca il folosesti ca tip de camp intr-o entitate Hibernate sau clasa DTO, pot aparea erori la serializare.",
    keyTakeaway: "Optional este un tip de retur gandit sa semnalizeze explicit absenta valorii si sa elimine riscul de NullPointerException."
  },
  {
    id: "java-116",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Crearea Optional: of() vs ofNullable() vs empty()",
    question: "Care este diferenta dintre Optional.of(), Optional.ofNullable() si Optional.empty()?",
    answer: "1. Optional.empty():\\n   - Creeaza o instanta de Optional goala (fara nicio valoare).\\n\\n2. Optional.of(value):\\n   - Creeaza un Optional care contine valoarea specificata.\\n   - CRITIC: Daca valoarea transmisa este null, arunca instantaneu NullPointerException!\\n   - Se foloseste DOAR cand esti 100% sigur ca valoarea nu este si nu poate fi null.\\n\\n3. Optional.ofNullable(value):\\n   - Daca valoarea este diferita de null, returneaza Optional.of(value).\\n   - Daca valoarea este null, returneaza Optional.empty() in mod sigur, fara exceptie!\\n   - Este metoda recomandata cand impachetezi un rezultat primit dintr-o sursa externa ce poate fi null.",
    codeSnippet: `String safe = "Hello";
String nullableVal = null;

Optional<String> opt1 = Optional.of(safe); // OK

// Optional<String> opt2 = Optional.of(nullableVal); // NullPointerException instant!

Optional<String> opt3 = Optional.ofNullable(nullableVal); // Sigur: returneaza Optional.empty()
Optional<String> opt4 = Optional.empty(); // Optional gol`,
    interviewTrap: "Cea mai frecventa greseala de incepator: folosirea Optional.of(posibilNull) in loc de Optional.ofNullable(posibilNull), ducand la crash prin NullPointerException.",
    keyTakeaway: "Optional.of arunca NPE daca valoarea e null; Optional.ofNullable returneaza Optional.empty() in mod sigur."
  },
  {
    id: "java-117",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Optional: orElse() vs orElseGet() (Lazy vs Eager)",
    question: "Care este diferenta critica de evaluare dintre orElse() si orElseGet() intr-un Optional?",
    answer: "Aceasta este una dintre cele mai frecvente intrebari de interviu Java!\\n\\n1. orElse(T other) - Evaluare EAGER (Imediata):\\n   - Expresia din interiorul lui orElse() este EVALUATA INTOTDEAUNA, chiar daca valoarea din Optional este PREZENTA!\\n   - Daca orElse apeleaza o metoda costisitoare (ex: orElse(createDefaultInDatabase())), acea metoda se va executa de fiecare data, irosind resurse si eventual creand date duplicat!\\n\\n2. orElseGet(Supplier<? extends T> other) - Evaluare LAZY (Leneasa):\\n   - Lambda Supplier-ul este apelat DOAR SI NUMAI DACA Optional-ul este GOL.\\n   - Daca Optional contine deja o valoare, lambda-ul nu este niciodata executat.\\n\\n3. Regula de Aur:\\n   - Foloseste orElse doar pentru constante deja existente in memorie (ex: orElse(\"UNKNOWN\")).\\n   - Foloseste orElseGet cand valoarea default implica calcule, alocari de obiecte noi (new Object()) sau apeluri de retea/DB.",
    codeSnippet: `String getExpensiveDefault() {
    System.out.println("--> Apel scump in DB executat!");
    return "Default";
}

Optional<String> opt = Optional.of("Exista deja");

// 1. orElse: getExpensiveDefault() SE EXECUTA desi opt contine "Exista deja"!
String res1 = opt.orElse(getExpensiveDefault()); // Printeaza apelul scump!

// 2. orElseGet: Supplier-ul NU se executa pentru ca opt este prezent!
String res2 = opt.orElseGet(() -> getExpensiveDefault()); // Eficient, nu printeaza nimic!`,
    interviewTrap: "Folosirea orElse(new HeavyObject()) intr-un endpoint apelat frecvent creaza instante inutile de HeavyObject la fiecare request, chiar daca Optional-ul era plin.",
    keyTakeaway: "orElse se evalueaza mereu (eager); orElseGet apeleaza Supplier-ul doar cand valoarea lipseste (lazy)."
  },
  {
    id: "java-118",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Optional.orElseThrow()",
    question: "Ce face metoda orElseThrow() si cum difera varianta fara parametri din Java 10+ de orElseThrow(Supplier)?",
    answer: "1. orElseThrow(Supplier<? extends X> exceptionSupplier):\\n   - Returneaza valoarea daca este prezenta.\\n   - Daca valoarea lipseste, arunca exceptia produsa de Supplier (ex: NotFoundException, IllegalArgumentException).\\n   - Este pattern-ul standard in aplicatii Spring REST API pentru a arunca 404 Not Found cand o entitate nu exista.\\n\\n2. orElseThrow() fara parametri (Java 10+):\\n   - Daca valoarea lipseste, arunca NoSuchElementException.\\n   - A fost introdusa in Java 10 ca o alternativa mai clara la get(), care era inselatoare.",
    codeSnippet: `// 1. Cu exceptie custom de business (recomandat in Spring):
User user = userRepository.findById(id)
    .orElseThrow(() -> new UserNotFoundException("User nu exista: " + id));

// 2. Varianta simpla Java 10+ (inlocuieste get()):
String val = Optional.of("test").orElseThrow();`,
    interviewTrap: "Evita metoda get() clasica, deoarece numele nu sugereaza ca arunca exceptie cand este gol. In Java 10+, orElseThrow() este varianta recomandata oficial.",
    keyTakeaway: "orElseThrow() extrage valoarea sau arunca o exceptie specifica atunci cand valoarea lipseste."
  },
  {
    id: "java-119",
    category: 'JAVA',
    difficulty: "USOR",
    title: "isPresent() vs ifPresent() vs ifPresentOrElse()",
    question: "Cum folosim isPresent(), ifPresent() si ifPresentOrElse() pe un Optional?",
    answer: "1. isPresent():\\n   - Returneaza un boolean: true daca valoarea este prezenta, false daca este empty.\\n   - Seamana cu verificarea clasica if (x != null).\\n\\n2. ifPresent(Consumer<T>):\\n   - Executa actiunea specificata (Consumer) DOAR daca valoarea este prezenta.\\n   - Daca valoarea lipseste, nu face nimic.\\n\\n3. ifPresentOrElse(Consumer<T> action, Runnable emptyAction) (Java 9+):\\n   - Ofera ramura completa \"if-else\": executa action daca valoarea este prezenta, sau emptyAction daca valoarea lipseste.",
    codeSnippet: `Optional<String> nameOpt = Optional.ofNullable(getName());

// 1. ifPresent:
nameOpt.ifPresent(name -> System.out.println("Salut " + name));

// 2. ifPresentOrElse (Java 9+):
nameOpt.ifPresentOrElse(
    name -> System.out.println("Salut " + name),
    () -> System.out.println("Nume anonim")
);`,
    interviewTrap: "Daca scrii: if (opt.isPresent()) { return opt.get(); } else { ... }, folosesti Optional in cel mai prost mod posibil, ca un simplu null check clasic. Foloseste orElse/map/ifPresent.",
    keyTakeaway: "ifPresent executa actiunea pe valoarea prezenta; ifPresentOrElse gestioneaza ambele ramuri (present vs empty)."
  },
  {
    id: "java-120",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Optional: map() vs flatMap()",
    question: "Care este diferenta dintre map() si flatMap() aplicate pe o instanta de Optional?",
    answer: "1. optional.map(Function<T, U>):\\n   - Transforma valoarea continuta aplicand functia si impacheteaza automat rezultatul intr-un nou Optional<U>.\\n   - Daca Optional-ul original este empty sau daca functia returneaza null, rezultatul este Optional.empty().\\n\\n2. optional.flatMap(Function<T, Optional<U>>):\\n   - Se foloseste atunci cand functia de transformare RETURNEAZA DEJA un Optional<U>.\\n   - Daca ai folosi map(), ai obtine un Optional imbricat: Optional<Optional<U>>.\\n   - flatMap() despacheteaza structura imbricata si returneaza direct un singur Optional<U>.",
    codeSnippet: `class Passport { String number; public String getNumber() { return number; } }
class Person {
    Passport passport;
    // Metoda returneaza deja un Optional!
    public Optional<Passport> getPassport() { return Optional.ofNullable(passport); }
}

Optional<Person> personOpt = Optional.of(new Person());

// Daca am folosi map: obtinem Optional<Optional<Passport>> (urat si greoi!)
// Optional<Optional<Passport>> bad = personOpt.map(Person::getPassport);

// Cu flatMap: structura este aplatizata la un singur Optional:
Optional<String> passNum = personOpt
    .flatMap(Person::getPassport)
    .map(Passport::getNumber);`,
    interviewTrap: "Daca functia pe care o apelezi returneaza un Optional, foloseste obligatoriu flatMap() pentru a preveni imbricarea Optional<Optional<T>>.",
    keyTakeaway: "map() impacheteaza automat rezultatul intr-un Optional; flatMap() este necesar cand functia returneaza deja un Optional."
  },
  {
    id: "java-121",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Optional.filter() in Java",
    question: "Cum functioneaza metoda filter() a clasei Optional si cand este utila?",
    answer: "1. Cum functioneaza:\\n   - Primeste un Predicate<? super T>.\\n   - Daca Optional-ul este gol (empty), returneaza direct Optional.empty().\\n   - Daca Optional-ul contine o valoare si predicatul returneaza true, pastreaza aceeasi valoare.\\n   - Daca predicatul returneaza false, \"arunca\" valoarea si returneaza Optional.empty().\\n\\n2. Utilizare:\\n   - Validari compacte in chain fluent (ex: verificarea daca un utilizator este activ sau adult).",
    codeSnippet: `Optional<User> userOpt = userRepository.findById(userId);

// Pastreaza userul doar daca are rol de ADMIN:
Optional<User> adminOnly = userOpt
    .filter(u -> "ADMIN".equals(u.getRole()));

adminOnly.ifPresent(admin -> System.out.println("Admin acces permis"));`,
    interviewTrap: "Nu este nevoie sa verifici manual isPresent() inainte de filter(); daca Optional-ul este empty, filter() returneaza pur si simplu empty fara erori.",
    keyTakeaway: "Optional.filter() pastreaza valoarea doar daca indeplineste conditia; altfel o transforma in Optional.empty()."
  },
  {
    id: "java-122",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Anti-pattern-uri comune cu Optional in Java",
    question: "Care sunt cele mai mari 3 greseli / anti-pattern-uri la folosirea Optional in aplicatii Java?",
    answer: "1. Optional ca parametru de metoda:\\n   - Anti-pattern: void doSomething(Optional<User> user)\\n   - De ce: Cel care apeleaza metoda poate transmite totusi null (doSomething(null)), ceea ce forteaza verificari suplimentare si face API-ul greoi. Se prefera supraincarcarea (overloading) metodelor.\\n\\n2. Optional ca field intr-o entitate JPA/Hibernate sau DTO:\\n   - De ce: Optional nu implementeaza Serializable, iar JPA nu a fost creat sa mapeze coloane pe instante Optional. Creste si consumul de memorie pe Heap.\\n\\n3. Folosirea Optional.get() fara verificare:\\n   - A apela direct opt.get() anuleaza tot scopul clasei si arunca NoSuchElementException la fel ca NullPointerException.\\n\\n4. Folosirea lui if (opt.isPresent()) opt.get() in loc de map, orElse sau ifPresent.",
    codeSnippet: `// 1. GRESIT (Optional ca parametru):
public void process(Optional<String> config) {} // Evita!

// 2. GRESIT (Optional ca field in clasa):
public class Customer {
    private Optional<String> phone; // Evita!
}

// 3. GRESIT (Pattern clasic redundant):
if (opt.isPresent()) {
    System.out.println(opt.get()); // Uracios!
}
// CORECT:
opt.ifPresent(System.out::println);`,
    interviewTrap: "La interviu, mentioneaza clar ca Brian Goetz (arhitectul limbajului Java) a specificat ca Optional a fost gandit doar ca return type, nu pentru campuri sau parametri.",
    keyTakeaway: "Nu folosi Optional ca field sau ca parametru de metoda, si nu apela niciodata get() orbeste fara verificare."
  },
  {
    id: "java-123",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce s-a introdus java.time (Java 8) in locul java.util.Date?",
    question: "Care au fost marile defecte ale vechilor clase java.util.Date si Calendar si cum le-a rezolvat pachetul java.time?",
    answer: "1. Defectele vechilor java.util.Date si Calendar:\\n   - Mutabilitate: Date era mutabil (date.setTime(...)), cauzand bug-uri grave de securitate si concurenta daca nu faceai copii defensive.\\n   - Thread-Safety: Nicio clasa nu era thread-safe (in special SimpleDateFormat cauza coruperi de date la acces concurent).\\n   - Design confuz si contra-intuitiv: Luna ianuarie era indexata cu 0 (0 = Ianuarie), iar anul pornea de la 1900 (anul 2024 era 124!).\\n   - Lipsa separatiei de concepte: Date reprezenta de fapt o data + ora UTC, dar toString() o afisa in fusul orar al sistemului.\\n\\n2. Cum rezolva java.time (JSR-310):\\n   - Imutabilitate: Toate clasele (LocalDate, LocalDateTime etc.) sunt strict imutabile si thread-safe.\\n   - Separatie clara: Data fara ora (LocalDate), Ora fara data (LocalTime), Data si Ora cu fus orar (ZonedDateTime), Timestamp UTC masina (Instant).\\n   - Indexare naturala: Luna 1 este Ianuarie.",
    codeSnippet: `// VECHI si PERICULOS:
Date oldDate = new Date();
oldDate.setMonth(0); // Mutabil, deprecated, Ianuarie = 0!

// NOU (java.time, Java 8+):
LocalDate today = LocalDate.now();
LocalDate nextWeek = today.plusWeeks(1); // Returneaza o instanta NOUA (imutabila)!`,
    interviewTrap: "SimpleDateFormat nu este thread-safe! Daca il declari static intr-un controller sau servlet, mai multe thread-uri simultane vor genera date corupte sau erori.",
    keyTakeaway: "java.time ofera clase imutabile, thread-safe si clar delimitate (LocalDate, LocalDateTime, Instant), inlocuind complet mutabilele Date si Calendar."
  },
  {
    id: "java-124",
    category: 'JAVA',
    difficulty: "USOR",
    title: "LocalDate, LocalTime si LocalDateTime",
    question: "Ce reprezinta clasele LocalDate, LocalTime si LocalDateTime si au ele fus orar?",
    answer: "1. LocalDate:\\n   - Reprezinta o data din calendar (an, luna, zi), cum ar fi \"2026-10-02\".\\n   - Utilizare tipica: data nasterii, sarbatori legale, termene limita.\\n\\n2. LocalTime:\\n   - Reprezinta o ora a zilei fara data (ora, minut, secunda, nanosecunda), cum ar fi \"14:30:00\".\\n   - Utilizare tipica: ora deschiderii unui magazin, alarme.\\n\\n3. LocalDateTime:\\n   - Combina data si ora (an, luna, zi, ora, minut, secunda), cum ar fi \"2026-10-02T14:30:00\".\\n\\n4. AU ELE FUS ORAR?\\n   - NU! Niciuna dintre aceste clase nu contine nicio informatie despre fusul orar (Time Zone) sau decalajul UTC (Offset).\\n   - \"2026-10-02T14:30\" inseamna ora 14:30 pe ceasul de pe perete, indiferent daca esti la Bucuresti, Londra sau Tokyo.",
    codeSnippet: `LocalDate date = LocalDate.of(2026, Month.OCTOBER, 2);
LocalTime time = LocalTime.of(15, 30);
LocalDateTime dateTime = LocalDateTime.of(date, time);

System.out.println(date);     // 2026-10-02
System.out.println(dateTime); // 2026-10-02T15:30`,
    interviewTrap: "Nu folosi LocalDateTime pentru timestamp-uri de server sau loguri globale, deoarece fara fus orar nu poti sti momentul exact in timp daca serverele sunt in regiuni diferite.",
    keyTakeaway: "LocalDate, LocalTime si LocalDateTime reprezinta date/ore pe ceasul local, complet independente de fusul orar."
  },
  {
    id: "java-125",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "ZonedDateTime vs OffsetDateTime",
    question: "Cum difera ZonedDateTime de OffsetDateTime si cand folosim fiecare?",
    answer: "1. OffsetDateTime:\\n   - Retine data, ora si doar diferenta fixa fata de UTC/GMT (ex: +02:00, -05:00, \"2026-10-02T14:30:00+02:00\").\\n   - Nu stie despre reguli geografice de trecere la ora de vara/iarna (Daylight Saving Time - DST).\\n   - Se foloseste in protocoale de comunicatie, baze de date (SQL TIMESTAMP WITH TIME ZONE) si mesaje JSON (ISO-8601).\\n\\n2. ZonedDateTime:\\n   - Retine data, ora, offset-ul UTC si o regiune geografica completa (ZoneId, ex: \"Europe/Bucharest\", \"America/New_York\").\\n   - Cunoaste toate regulile istorice si viitoare de Daylight Saving Time ale acelei regiuni.\\n   - Daca adaugi o zi sau o ora peste momentul schimbarii orei de vara, ZonedDateTime ajusteaza automat ora corecta conform regulilor zonei!",
    codeSnippet: `ZoneId bucZone = ZoneId.of("Europe/Bucharest");
ZonedDateTime zdt = ZonedDateTime.now(bucZone);
System.out.println(zdt); // 2026-10-02T22:30:00+03:00[Europe/Bucharest]

// OffsetDateTime (fara reguli DST de regiune):
OffsetDateTime odt = OffsetDateTime.now(ZoneOffset.ofHours(3));
System.out.println(odt); // 2026-10-02T22:30:00+03:00`,
    interviewTrap: "Un offset fix ca +03:00 nu tine cont de ora de vara; daca faci operatii de adaugare peste data trecerii la ora de iarna, doar ZonedDateTime stie sa scada automat o ora.",
    keyTakeaway: "OffsetDateTime stocheaza data cu un offset fix (ideal pentru DB si REST API); ZonedDateTime stocheaza zona geografica completa cu reguli DST."
  },
  {
    id: "java-126",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Clasa Instant in java.time",
    question: "Ce reprezinta clasa Instant in Java si cum difera de un LocalDateTime?",
    answer: "1. Ce este Instant:\\n   - Reprezinta un punct precis pe linia continua a timpului universal (UTC).\\n   - Este masurat ca numarul de secunde si nanosecunde trecute de la Unix Epoch (1 Ianuarie 1970 00:00:00 UTC).\\n   - Este \"timpul masinii\" (machine time).\\n\\n2. Diferenta fata de LocalDateTime:\\n   - Instant este global si identic in toata lumea in acelasi moment (in UTC).\\n   - LocalDateTime este o data/ora umana fara fus orar (depinde de contextul geografic).\\n\\n3. Utilizare ideala:\\n   - Timestamp-uri de loguri, evenimente de audit in baze de date, masurarea duratelor de executie intre doua momente.",
    codeSnippet: `Instant now = Instant.now();
System.out.println(now); // ex: 2026-10-02T19:30:00.123456Z (terminat cu Z = Zulu/UTC)

long epochSeconds = now.getEpochSecond();
long epochMillis = now.toEpochMilli();

// Masurare timp scurs:
Instant start = Instant.now();
// ... executie cod ...
Instant end = Instant.now();
Duration elapsed = Duration.between(start, end);`,
    interviewTrap: "Instant nu contine informatii de an, luna sau zi pe ceasul local uman; pentru a extrage ziua sau ora trebuie convertit la ZonedDateTime.",
    keyTakeaway: "Instant masoara momentul precis in UTC de la 1 Ianuarie 1970 si este ideal pentru loguri, audit si timestamp-uri de sistem."
  },
  {
    id: "java-127",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Duration vs Period in java.time",
    question: "Care este diferenta dintre Duration si Period in pachetul java.time?",
    answer: "1. Duration (Bazat pe TIMP / Secunde):\\n   - Masoara o cantitate de timp in ore, minute, secunde si nanosecunde.\\n   - Lucreaza cu clase bazate pe timp: Instant, LocalTime, LocalDateTime.\\n   - Exemplu: \"2 ore si 30 de secunde\".\\n\\n2. Period (Bazat pe CALENDAR / Date):\\n   - Masoara o cantitate de timp in ani, luni si zile.\\n   - Lucreaza exclusiv cu date de calendar: LocalDate.\\n   - Exemplu: \"1 an, 2 luni si 15 zile\".\\n   - Tine cont de diferentele de lungime ale lunilor (28, 30 sau 31 de zile) si anilor bisecti.",
    codeSnippet: `// 1. Duration: bazat pe secunde/ore
LocalTime t1 = LocalTime.of(10, 0);
LocalTime t2 = LocalTime.of(12, 30);
Duration duration = Duration.between(t1, t2);
System.out.println("Minute: " + duration.toMinutes()); // 150

// 2. Period: bazat pe ani/luni/zile
LocalDate d1 = LocalDate.of(2020, 1, 1);
LocalDate d2 = LocalDate.of(2026, 10, 2);
Period period = Period.between(d1, d2);
System.out.println("Ani: " + period.getYears() + ", Luni: " + period.getMonths());`,
    interviewTrap: "Daca incerci sa faci Period.between(t1, t2) pe ore sau Duration.between(d1, d2) pe LocalDate, vei primi UnsupportedTemporalTypeException!",
    keyTakeaway: "Duration masoara intervale de timp bazate pe secunde/ore; Period masoara intervale de calendar bazate pe ani/luni/zile."
  },
  {
    id: "java-128",
    category: 'JAVA',
    difficulty: "USOR",
    title: "DateTimeFormatter vs SimpleDateFormat",
    question: "De ce este DateTimeFormatter preferat fata de SimpleDateFormat si cum se utilizeaza?",
    answer: "1. Problema grava cu SimpleDateFormat:\\n   - SimpleDateFormat NU este thread-safe! Are stare interna mutabila (campul calendar).\\n   - Daca o instanta este partajata intre thread-uri, produce corupere de date si rezultate eronate.\\n   - Forta dezvoltatorii sa creeze o instanta noua la fiecare apel sau sa foloseasca ThreadLocal.\\n\\n2. De ce DateTimeFormatter este superior:\\n   - Este STRICT IMUTABIL si complet THREAD-SAFE.\\n   - Poate fi stocat intr-o constanta static final si reutilizat in siguranta de mii de thread-uri concurente.\\n   - Ofera formate predefinite standard (ISO_LOCAL_DATE_TIME etc.) si suport pentru pattern-uri custom (ofPattern).",
    codeSnippet: `// Sigur pentru partajare intre thread-uri:
public static final DateTimeFormatter FORMATTER = 
    DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

LocalDateTime now = LocalDateTime.now();

// Formatare (obiect -> String):
String text = now.format(FORMATTER);

// Parsing (String -> obiect):
LocalDateTime parsed = LocalDateTime.parse("02/10/2026 18:00", FORMATTER);`,
    interviewTrap: "In pattern, literele mici si mari conteaza: \"MM\" reprezinta luna, in timp ce \"mm\" reprezinta minutele! \"HH\" este format 24h, \"hh\" este format 12h (AM/PM).",
    keyTakeaway: "DateTimeFormatter este imutabil si thread-safe, putand fi declarat static final fara niciun risc de concurenta."
  },
  {
    id: "java-129",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Calculul diferentelor intre date cu ChronoUnit",
    question: "Cum calculam diferenta exacta in zile, ore sau luni intre doua date folosind ChronoUnit?",
    answer: "1. Ce este ChronoUnit:\\n   - Un enum din pachetul java.time.temporal care implementeaza unitati standard de timp: DAYS, HOURS, MINUTES, MONTHS, YEARS etc.\\n\\n2. Metoda between(temporal1, temporal2):\\n   - Calculeaza diferenta directa dintre doua obiecte temporale in unitatea ceruta.\\n   - Rezultatul este intotdeauna un numar intreg (long) si este pozitiv daca temporal2 este dupa temporal1, sau negativ daca temporal2 este inainte.\\n   - Este mult mai convenabil decat apelarea metodelor de conversie din Period sau Duration.",
    codeSnippet: `LocalDate start = LocalDate.of(2026, 1, 1);
LocalDate end = LocalDate.of(2026, 10, 2);

long daysBetween = ChronoUnit.DAYS.between(start, end);
long monthsBetween = ChronoUnit.MONTHS.between(start, end);

System.out.println("Zile: " + daysBetween);     // 274
System.out.println("Luni: " + monthsBetween); // 9`,
    interviewTrap: "Period.between(start, end).getDays() returneaza doar componenta de zile din perioada (zile ramase dupa calculul anilor si lunilor), NU numarul total de zile! Foloseste ChronoUnit.DAYS.between().",
    keyTakeaway: "ChronoUnit.DAYS.between() calculeaza direct si exact totalul de unitati dintre doua date temporale."
  },
  {
    id: "java-130",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Imutabilitatea operatiilor pe date in java.time",
    question: "De ce apelul date.plusDays(5) nu schimba valoarea variabilei date si ce greseala fac incepatorii?",
    answer: "1. Imutabilitate stricta:\\n   - Toate clasele din pachetul java.time (LocalDate, LocalTime, LocalDateTime, Instant etc.) sunt IMUTABILE.\\n   - Metodele de modificare (plusDays, minusMonths, withYear etc.) NU modifica instanta curenta!\\n   - Ele creeaza si returneaza o NOUA instanta cu valoarea modificata.\\n\\n2. Greseala frecventa a incepatorilor:\\n   - Apelarea metodei fara a salva rezultatul returnat: date.plusDays(5);\\n   - Variabila initiala date ramane complet neschimbata, iar noul obiect creat este abandonat si colectat de Garbage Collector.",
    codeSnippet: `LocalDate date = LocalDate.of(2026, 10, 2);

// GRESIT: rezultatul este ignorat!
date.plusDays(5);
System.out.println(date); // Tot 2026-10-02!

// CORECT: Salvarea noii instante returnate
LocalDate futureDate = date.plusDays(5);
System.out.println(futureDate); // 2026-10-07`,
    interviewTrap: "Daca cineva intreaba la interviu ce printeaza: LocalDate d = LocalDate.now(); d.plusDays(10); System.out.println(d); -> Printeaza data de azi, nu data din viitor!",
    keyTakeaway: "Clasele java.time sunt imutabile; metodele plus/minus/with returneaza intotdeauna o instanta noua care trebuie salvata."
  },
  {
    id: "java-131",
    category: 'JAVA',
    difficulty: "USOR",
    title: "java.io.File vs java.nio.file.Path si Files (NIO.2)",
    question: "De ce pachetul java.nio.file (NIO.2 introdus in Java 7) este superior vechii clase java.io.File?",
    answer: "1. Defectele vechii clase java.io.File:\\n   - Multe metode returnau doar un simplu boolean false in caz de eroare (ex: file.delete()), fara a sti cauza reala (fisier blocat, lipsa permisiuni, disc plin).\\n   - Nu suporta operatii avansate pe sistemul de fisiere: linkuri simbolice (symlinks), atribute de securitate POSIX.\\n   - Foarte lenta la listarea directoarelor uriase (file.listFiles() aloca un array gigant in memorie dintr-o data).\\n\\n2. Avantajele java.nio.file (Path si Files):\\n   - Exceptii clare: arunca NoSuchFileException, AccessDeniedException etc.\\n   - Operatii atomice de mutare si copiere de fisiere.\\n   - Suport complet pentru Streams (Files.lines, Files.walk, Files.list) cu procesare lazy fara consum urias de memorie.\\n   - Path este o interfata moderna, iar Files contine metode statice utilitare puternice.",
    codeSnippet: `// Stil vechi:
File oldFile = new File("data.txt");
boolean ok = oldFile.delete(); // Daca e false, nu stii de ce a esuat!

// Stil modern recomandat (NIO.2):
Path path = Path.of("data.txt"); // Sau Paths.get("data.txt")
try {
    Files.delete(path); // Arunca exceptie explicita daca lipseste sau nu ai drepturi
} catch (NoSuchFileException e) {
    System.out.println("Fisierul nu exista: " + e.getMessage());
}`,
    interviewTrap: "In cod modern foloseste interfata Path si clasa Files. Daca primesti un File legacy, converteste-l instant cu file.toPath().",
    keyTakeaway: "NIO.2 (Path si Files) ofera exceptii detaliate, performanta ridicata si metode lazy bazate pe Streams, depasind vechiul java.io.File."
  },
  {
    id: "java-132",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Citirea fisierelor in Java modern: Files.readString()",
    question: "Care este cel mai simplu si modern mod de a citi intregul continut al unui fisier text in Java 11+?",
    answer: "1. Metoda moderna in Java 11+:\\n   - Files.readString(Path path): citeste intregul continut al fisierului intr-un singur String, folosind UTF-8 in mod implicit.\\n   - Elimina zecile de linii de cod boilerplate cu BufferedReader, FileReader si bucle while.\\n\\n2. Alternativa pentru liste de linii:\\n   - Files.readAllLines(Path path): citeste toate liniile intr-o lista List<String>.\\n\\n3. Cand NU trebuie folosite:\\n   - Pentru fisiere foarte mari (sute de MB / GB), deoarece incarca intregul continut in memoria Heap dintr-o data, riscand OutOfMemoryError. Pentru fisiere mari se foloseste Files.lines() (stream) sau BufferedReader.",
    codeSnippet: `Path path = Path.of("config.json");

// Java 11+: o singura linie pentru intreg fisierul!
try {
    String content = Files.readString(path);
    System.out.println(content);
} catch (IOException e) {
    e.printStackTrace();
}

// Citire linii ca lista:
List<String> lines = Files.readAllLines(path);`,
    interviewTrap: "Files.readString() si Files.readAllLines() incarca tot fisierul in RAM. Pentru fisiere uriase (ex: log-uri de 2GB), foloseste Files.lines(path) care citeste linie cu linie ca un Stream lazy.",
    keyTakeaway: "Files.readString(path) citeste un fisier complet intr-un String intr-o singura linie in Java 11+, fiind ideal pentru fisiere mici si medii."
  },
  {
    id: "java-133",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Files.writeString() si Files.lines() (Stream de linii)",
    question: "Cum scriem un String intr-un fisier in Java 11+ si cum citim un fisier gigant fara consum mare de memorie cu Files.lines()?",
    answer: "1. Scriere rapida: Files.writeString(Path, CharSequence, OpenOption...):\\n   - Scrie direct un String intr-un fisier.\\n   - Suporta optiuni: StandardOpenOption.CREATE, APPEND, TRUNCATE_EXISTING.\\n\\n2. Citire eficienta a fisierelor mari: Files.lines(Path):\\n   - Returneaza un Stream<String> evaluat LAZY.\\n   - Citeste cate o linie pe rand pe masura ce stream-ul o cere, folosind un consum minim si constant de memorie Heap.\\n   - IMPORTANT: Files.lines() deschide un fisier nativ in sistemul de operare! Trebuie OBLIGATORIU inchis folosind un bloc try-with-resources, deoarece Stream implementeaza AutoCloseable!",
    codeSnippet: `Path logPath = Path.of("app.log");

// 1. Scriere rapida in Java 11:
Files.writeString(logPath, "Log entry\\n", StandardOpenOption.CREATE, StandardOpenOption.APPEND);

// 2. Citire lazy eficienta cu try-with-resources:
try (Stream<String> lines = Files.lines(logPath)) {
    lines.filter(line -> line.contains("ERROR"))
         .limit(5)
         .forEach(System.out::println);
} // Fisierul este inchis automat la final!`,
    interviewTrap: "Daca folosesti Files.lines(path) fara try-with-resources, descriptorul de fisier din sistemul de operare ramane deschis (leak de file descriptor), putand bloca stergerea sau deschiderea altor fisiere.",
    keyTakeaway: "Files.lines() proceseaza fisiere uriase linie cu linie ca Stream lazy; foloseste intotdeauna try-with-resources pentru a inchide fisierul."
  },
  {
    id: "java-134",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Byte Streams vs Character Streams in Java I/O",
    question: "Care este diferenta dintre Byte Streams (InputStream/OutputStream) si Character Streams (Reader/Writer)?",
    answer: "1. Byte Streams (InputStream / OutputStream):\\n   - Lucreaza direct cu octeti cruzi (raw bytes, 8 biti per unitate).\\n   - Se folosesc pentru date binare: imagini, fisiere audio/video, PDF-uri, pachete de retea.\\n   - Exemple: FileInputStream, FileOutputStream, ByteArrayInputStream.\\n\\n2. Character Streams (Reader / Writer):\\n   - Lucreaza cu caractere Unicode (16 biti per char in Java) si encodari de text (UTF-8, UTF-16, ISO-8859-1).\\n   - Se folosesc exclusiv pentru fisiere text.\\n   - Exemple: FileReader, FileWriter, BufferedReader, PrintWriter.\\n\\n3. Podul de legatura intre cele doua lumi:\\n   - InputStreamReader: citeste octeti si ii decodeaza in caractere pe baza unui charset.\\n   - OutputStreamWriter: primeste caractere si le encapzuleaza in octeti.",
    codeSnippet: `// Binar (Byte Stream):
try (InputStream in = new FileInputStream("image.png");
     OutputStream out = new FileOutputStream("copy.png")) {
    in.transferTo(out); // Copiere eficienta de bytes
}

// Text (Character Stream) cu encoding explicit:
try (Reader reader = new InputStreamReader(new FileInputStream("text.txt"), StandardCharsets.UTF_8)) {
    // Citeste caractere UTF-8
}`,
    interviewTrap: "Daca citesti un fisier text UTF-8 cu un Byte Stream direct fara sa tii cont ca un caracter poate ocupa 1 pana la 4 octeti, vei rupe diacriticele si caracterele speciale.",
    keyTakeaway: "InputStream/OutputStream proceseaza octeti (binar); Reader/Writer proceseaza caractere text cu suport pentru charset-uri (UTF-8)."
  },
  {
    id: "java-135",
    category: 'JAVA',
    difficulty: "USOR",
    title: "BufferedReader si BufferedWriter: De ce conteaza Buffer-ul?",
    question: "Ce rol are un BufferedReader sau BufferedWriter si de ce imbunatateste drastic performanta operatiilor I/O?",
    answer: "1. Problema operatiilor I/O simple (fara buffer):\\n   - Fiecare operatie read() pe un FileReader ne-bufferat trimite un apel de sistem (system call) catre sistemul de operare si disc pentru a citi cate un singur caracter.\\n   - Apelurile de sistem si accesele pe disc fizic sunt de mii de ori mai lente decat operatiile din memoria RAM.\\n\\n2. Rolul Buffer-ului:\\n   - BufferedReader citeste un bloc intreg de date (de obicei 8KB) dintr-un singur apel pe disc si il stocheaza intr-un array intern in RAM.\\n   - Urmatoarele cereri de citire (read() sau readLine()) se servesc instantaneu din memoria RAM.\\n   - Cand buffer-ul se goleste, se aduce automat urmatorul bloc de 8KB de pe disc.\\n\\n3. BufferedWriter:\\n   - Acumuleaza caracterele in memorie si scrie pe disc tot blocul deodata, sau la apelul metodei flush().",
    codeSnippet: `// Fara buffer: ineficient, mii de accese pe disc
// FileReader fr = new FileReader("large.txt");

// CU BUFFER (Decorat):
try (BufferedReader br = new BufferedReader(new FileReader("large.txt"))) {
    String line;
    while ((line = br.readLine()) != null) {
        // Proceseaza linia citita rapid din RAM
    }
}`,
    interviewTrap: "La BufferedWriter, daca uiti sa apelezi flush() sau sa inchizi stream-ul cu close() (sau try-with-resources), ultimele date din buffer s-ar putea sa nu se scrie niciodata pe disc!",
    keyTakeaway: "BufferedReader citeste blocuri mari de date in RAM (8KB), reducand drastic apelurile lente de sistem pe disc fizic."
  },
  {
    id: "java-136",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Scanner vs BufferedReader",
    question: "Care este diferenta dintre Scanner si BufferedReader pentru citirea datelor si cand il alegem pe fiecare?",
    answer: "1. Scanner (java.util.Scanner):\\n   - Un parser de nivel inalt: poate parsa direct tipuri primitive si siruri folosind regex-uri (ex: nextInt(), nextDouble(), nextLine()).\\n   - Buffer mic intern (1KB) si sincronizare interna usoara.\\n   - Semnificativ mai lent in procesarea fisierelor mari din cauza mecanismului complex de parsare prin expresii regulate.\\n\\n2. BufferedReader (java.io.BufferedReader):\\n   - Un simplu cititor rapid de caractere cu un buffer generos (8KB default).\\n   - Citeste doar siruri brute (readLine()) sau caractere unice (read()). Daca ai nevoie de intregi, trebuie sa faci manual Integer.parseInt().\\n   - Este thread-safe (metodele sunt sincronizate).\\n   - Mult mai rapid decat Scanner la citirea fisierelor mari.\\n\\n3. Concluzie:\\n   - Foloseste Scanner pentru citiri simple de la consola sau fisiere mici cu parsare de numere; foloseste BufferedReader pentru fisiere mari si performanta.",
    codeSnippet: `// 1. Scanner: convenabil pentru parsare de numere
Scanner scanner = new Scanner(System.in);
// int age = scanner.nextInt();

// 2. BufferedReader: ultra-rapid pentru text mult
BufferedReader reader = new BufferedReader(new InputStreamReader(System.in));
// String line = reader.readLine();
// int age = Integer.parseInt(line);`,
    interviewTrap: "Metoda scanner.nextInt() nu consuma caracterul de sfarsit de linie (\\n)! Daca apelezi ulterior scanner.nextLine(), vei citi un string gol.",
    keyTakeaway: "Scanner parseaza tipuri de date si regex-uri dar este mai lent; BufferedReader citeste text brut cu viteza maxima prin buffer mare."
  },
  {
    id: "java-137",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Interfata Serializable si serialVersionUID",
    question: "Ce inseamna ca o clasa este Serializable in Java si ce rol critic are campul serialVersionUID?",
    answer: "1. Ce este Serializarea:\\n   - Procesul de transformare a starii unui obiect Java intr-un flux de octeti (byte stream) pentru a fi salvat pe disc sau transmis prin retea (si invers: Deserializare).\\n   - Se realizeaza prin implementarea interfetei marker java.io.Serializable (nu contine nicio metoda).\\n\\n2. Rolul campului serialVersionUID:\\n   - Este un identificator numeric de versiune unic pentru clasa serializata: private static final long serialVersionUID = 1L;\\n   - La deserializare, masina virtuala (JVM) verifica daca serialVersionUID-ul din fluxul de octeti se potriveste exact cu serialVersionUID-ul clasei curente din cod.\\n   - Daca nu declari explicit acest camp, compilatorul Java calculeaza automat un hash complex pe baza structurii clasei (campuri, metode). Daca adaugi sau modifici un simplu camp in clasa, compilatorul va genera un alt ID, iar la deserializarea obiectelor vechi aplicatia va crapa cu InvalidClassException!",
    codeSnippet: `public class UserDto implements Serializable {
    // Declarare explicita obligatorie:
    private static final long serialVersionUID = 1L;

    private Long id;
    private String username;
    // ...
}`,
    interviewTrap: "Daca omiti serialVersionUID, orice mica modificare de cod (chiar si adaugarea unui comentariu sau schimbarea ordinii metodelor in unele compilatoare) poate face deserializarea obiectelor vechi imposibila.",
    keyTakeaway: "serialVersionUID asigura compatibilitatea de versiune la deserializare; lipsa lui explicita provoaca InvalidClassException dupa modificari de clasa."
  },
  {
    id: "java-138",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cuvantul cheie transient in Java",
    question: "Ce rol are modificatorul transient si ce valoare primeste un camp transient la deserializare?",
    answer: "1. Rolul modificatorului transient:\\n   - Se aplica campurilor unei clase care implementeaza Serializable.\\n   - Semnaleaza mecanismului de serializare al JVM-ului ca acel camp NU TREBUIE salvat in fluxul de octeti.\\n\\n2. Cand se foloseste:\\n   - Date sensibile de securitate (parole brute, chei secrete, date de card).\\n   - Campuri calculate sau derivate usor din alte date existente.\\n   - Resurse legate de mediul curent de rulare (referinte la conexiuni de baza de date, Thread-uri, Socket-uri, File descriptor-uri) care nu au sens sa fie serializate.\\n\\n3. Ce valoare primeste la Deserializare:\\n   - Primeste valoarea implicita (default) a tipului de date: null pentru obiecte, 0 pentru int/long/double, false pentru boolean.",
    codeSnippet: `public class UserSession implements Serializable {
    private static final long serialVersionUID = 1L;

    private String username;
    private transient String password; // NU va fi serializat!

    public UserSession(String username, String password) {
        this.username = username;
        this.password = password;
    }
}
// Dupa deserializare:
// session.getUsername() -> "admin"
// session.getPassword() -> null !`,
    interviewTrap: "Campurile marcate static nu sunt nici ele serializate, deoarece apartin clasei si nu instantei particulare a obiectului, fara sa fie nevoie de cuvantul transient.",
    keyTakeaway: "Campurile marcate transient sunt excluse de la serializare si devin null (sau valoarea default a tipului) la deserializare."
  },
  {
    id: "java-139",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Enum in Java: Caracteristici speciale",
    question: "Ce este un Enum in Java si de ce este considerat mult mai puternic decat enum-urile din limbajele C/C++?",
    answer: "1. In C/C++, un enum este un simplu alias peste un numar intreg.\\n2. In Java, un Enum este o CLASA COMPLETA:\\n   - Mosteneste automat clasa abstracta java.lang.Enum.\\n   - Fiecare constanta din Enum este o instanta unica, publica, statica si finala a acelei clase (Singleton per constanta).\\n   - Poate avea campuri de instanta, constructori (strict privati), metode de instanta si metode statice.\\n   - Poate implementa una sau mai multe interfete (dar NU poate mosteni alta clasa, deoarece mosteneste deja java.lang.Enum).\\n   - Este 100% sigur impotriva instantiatilor nepermise (nici macar prin Java Reflection nu poti crea o instanta noua de Enum!).",
    codeSnippet: `public enum OrderStatus {
    PENDING("In asteptare", 1),
    PROCESSING("In procesare", 2),
    DELIVERED("Livrat", 3);

    private final String description;
    private final int code;

    // Constructorul este implicit private:
    OrderStatus(String desc, int code) {
        this.description = desc;
        this.code = code;
    }

    public String getDescription() { return description; }
    public int getCode() { return code; }
}`,
    interviewTrap: "Constructorul unui Enum NU poate fi declarat public sau protected! Daca incerci sa scrii public OrderStatus(...), primesti eroare de compilare.",
    keyTakeaway: "Enum-urile in Java sunt clase complete cu campuri, metode si constructori privati; constantele sunt instante singleton thread-safe."
  },
  {
    id: "java-140",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Metodele Enum-urilor: values(), valueOf() si capcana ordinal()",
    question: "Ce fac metodele values(), valueOf(String) si name() si de ce este considerata o capcana metoda ordinal()?",
    answer: "1. values():\\n   - Metoda generata automat de compilator care returneaza un array cu toate constantele enum-ului in ordinea declararii lor.\\n\\n2. valueOf(String name):\\n   - Converteste un String in constanta corespunzatoare din enum. Arunca IllegalArgumentException daca nu exista nicio constanta cu acel nume exact.\\n\\n3. name():\\n   - Returneaza numele exact al constantei ca String (ex: \"PENDING\"). Se prefera fata de toString() pentru ca nu poate fi suprascrisa.\\n\\n4. Capcana metodei ordinal():\\n   - ordinal() returneaza pozitia numerica (indexul pornind de la 0) a constantei in declaratie.\\n   - DE CE E O MARE GRESEALA sa o folosesti in logica de business sau in baza de date: Daca un coleg schimba ordinea constantelor in cod sau adauga o constanta noua la inceput, toate valorile ordinal se schimba! Datele salvate in baza de date devin complet corupte!",
    codeSnippet: `public enum Priority { LOW, MEDIUM, HIGH }

// 1. values():
for (Priority p : Priority.values()) {
    System.out.println(p.name() + " la indexul " + p.ordinal());
}

// 2. valueOf():
Priority p = Priority.valueOf("HIGH"); // OK
// Priority err = Priority.valueOf("UNKNOWN"); // IllegalArgumentException!

// 3. CAPCANA:
// Daca salvezi p.ordinal() in DB (2 pentru HIGH) si maine cineva adauga URGENT inainte de HIGH,
// HIGH devine 3, iar datele din DB pointeaza acum la alta prioritate!`,
    interviewTrap: "Nu folosi niciodata ordinal() pentru salvarea in baza de date sau in reguli de business. In JPA/Hibernate, foloseste intotdeauna @Enumerated(EnumType.STRING).",
    keyTakeaway: "values() parcurge constantele, valueOf() parseaza din String; evita metoda ordinal() in logica de business pentru ca se schimba daca ordinea din cod este modificata."
  },
  {
    id: "java-141",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Records in Java 16+ - Ce sunt si cand se folosesc",
    question: "Ce este un Record in Java (introdus ca feature standard in Java 16) si ce problema rezolva?",
    answer: "1. Ce este un Record:\\n   - O clasa speciala imutabila de date (data carrier) gandita pentru a modela date pure fara cod boilerplate.\\n   - Se defineste cu cuvantul cheie record (ex: public record UserDto(Long id, String name) {}).\\n\\n2. Ce problema rezolva:\\n   - In Java clasic, crearea unui DTO sau POJO imutabil necesita zeci de linii repetitive: campuri private final, constructor, getteri, equals(), hashCode() si toString().\\n   - Record genereaza toate aceste componente automat la compilare intr-o singura linie de cod!\\n\\n3. Proprietati esentiale:\\n   - Toate campurile sunt automat private final.\\n   - Clasa Record este automat final (nu poate fi mostenita) si mosteneste clasa java.lang.Record.\\n   - Nu poate mosteni alte clase, dar poate implementa interfete.",
    codeSnippet: `// Inainte (zeci de linii de boilerplate cu equals/hashCode/getters):
// public final class Point { private final int x; private final int y; ... }

// Cu Record (Java 16+): o singura linie!
public record Point(int x, int y) {}

// Utilizare:
Point p = new Point(10, 20);
System.out.println(p.x()); // 10 (fara prefixul "get"!)
System.out.println(p);     // Point[x=10, y=20]`,
    interviewTrap: "Getteri-i generati de un Record NU au prefixul \"get\"! Nu apelezi p.getX(), ci direct p.x().",
    keyTakeaway: "Record este o clasa de date imutabila concisa care genereaza automat constructorul, getterii, equals, hashCode si toString."
  },
  {
    id: "java-142",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Componentele generate automat de un Java Record",
    question: "Ce metode si constructori genereaza compilatorul Java in mod automat pentru un Record?",
    answer: "Compilatorul Java genereaza automat urmatoarele componente pentru fiecare Record:\\n\\n1. Campuri private si finale pentru fiecare componenta din antet.\\n2. Constructor Canonic (Canonical Constructor): Un constructor public cu aceeasi semnatura si parametri ca lista de componente a record-ului.\\n3. Metode accesor (Getters): Cate o metoda publica pentru fiecare camp, purtand EXACT acelasi nume cu campul (ex: name(), age(), id()), fara prefixul \"get\".\\n4. equals(Object o): Compara toate campurile pentru egalitate valorica.\\n5. hashCode(): Calculeaza codul hash pe baza tuturor campurilor.\\n6. toString(): Returneaza o reprezentare text eleganta cu numele clasei si valorile campurilor (ex: UserDto[id=1, name=Ana]).",
    codeSnippet: `public record Customer(Long id, String email) {}

Customer c1 = new Customer(1L, "ana@test.com");
Customer c2 = new Customer(1L, "ana@test.com");

// 1. Getters fara prefix get:
System.out.println(c1.email()); // ana@test.com

// 2. equals si hashCode bazat pe valori:
System.out.println(c1.equals(c2)); // true!

// 3. toString:
System.out.println(c1); // Customer[id=1, email=ana@test.com]`,
    interviewTrap: "Nu poti adauga campuri de instanta suplimentare in interiorul acoladelor unui Record! Sunt permise doar campuri statice: public static final ...",
    keyTakeaway: "Record genereaza campuri finale, constructor canonic, getteri fara \"get\", equals, hashCode si toString."
  },
  {
    id: "java-143",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Compact Constructor intr-un Java Record",
    question: "Ce este un Compact Constructor intr-un Record si cum se foloseste pentru validare?",
    answer: "1. Ce este un Compact Constructor:\\n   - O sintaxa speciala oferita de Java pentru constructorul canonic al unui Record, fara lista de parametri in paranteze rotunde: public MyRecord { ... }.\\n   - Permite validarea sau normalizarea (curatarea) argumentelor INAINTE ca acestea sa fie atribuite campurilor finale.\\n\\n2. Cum functioneaza:\\n   - Nu este nevoie sa scrii this.x = x; this.y = y;! Compilatorul Java insereaza automat atribuirile campurilor la sfarsitul blocului compact.\\n   - Daca un argument este invalid, arunci exceptie (ex: IllegalArgumentException).\\n   - Poti si modifica parametrii inainte de atribuire (ex: name = name.trim()).",
    codeSnippet: `public record BankAccount(String iban, double balance) {
    // Compact Constructor (fara paranteze cu parametri!):
    public BankAccount {
        if (iban == null || iban.isBlank()) {
            throw new IllegalArgumentException("IBAN-ul nu poate fi gol!");
        }
        if (balance < 0) {
            throw new IllegalArgumentException("Balanta initiala nu poate fi negativa!");
        }
        // Normalizare automata:
        iban = iban.toUpperCase().trim();
        // this.iban = iban se apeleaza automat de compilator!
    }
}`,
    interviewTrap: "In interiorul unui compact constructor, scrierea explicita a lui this.iban = iban va produce o eroare de compilare! Modifici direct parametrul iban.",
    keyTakeaway: "Compact constructorul elimina asignarea manuala this.x = x si este locul perfect pentru validari si sanitizari de date in Record."
  },
  {
    id: "java-144",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Switch Expressions in Java 14+",
    question: "Care sunt imbunatatirile aduse de Switch Expressions (sintaxa -> si cuvantul cheie yield)?",
    answer: "1. Sintaxa tip sageata (->):\\n   - Elimina complet riscul de fall-through accidental! Nu mai este nevoie de cuvantul cheie break la finalul fiecarui case.\\n   - Doar codul din dreapta sagetii se executa.\\n   - Permite multiple constante per case separate prin virgula (ex: case \"A\", \"B\" ->).\\n\\n2. Poate returna o valoare:\\n   - Switch devine o expresie (Expression) ce poate fi atribuita direct unei variabile.\\n\\n3. Cuvantul cheie yield:\\n   - Daca o ramura case necesita un bloc cu acolade { ... }, valoarea de retur este transmisa folosind instructiunea yield (in loc de return).",
    codeSnippet: `DayOfWeek day = DayOfWeek.FRIDAY;

// Switch clasic era predispus la lipsa break-ului.
// Switch Expression modern returneaza valoare direct:
String typeOfDay = switch (day) {
    case MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY -> "Lucratoare";
    case SATURDAY, SUNDAY -> {
        System.out.println("Weekend placut!");
        yield "Weekend"; // yield returneaza valoarea din bloc
    }
};

System.out.println(typeOfDay); // Lucratoare`,
    interviewTrap: "Daca folosesti switch ca expresie (atribuit la o variabila), compilatorul cere ca toate cazurile posibile sa fie tratate exhaustiv (sau sa existe clauza default).",
    keyTakeaway: "Switch Expressions elimina break-ul prin operatorul ->, pot returna valori direct si folosesc yield in blocuri cu acolade."
  },
  {
    id: "java-145",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Pattern Matching for switch in Java",
    question: "Cum functioneaza Pattern Matching for switch (Java 21) si cum simplifica verificarea tipurilor?",
    answer: "1. Ce rezolva:\\n   - In Java clasic, switch accepta doar numere primitive, String si Enum-uri. Pentru obiecte, trebuia sa folosesti un lant urat de if (obj instanceof A) { A a = (A) obj; } else if ...\\n\\n2. Cu Pattern Matching for switch:\\n   - Poti face switch direct pe tipul unui Object!\\n   - Face cast automat in variabila declarata pe ramura respectiva.\\n   - Suporta clauze de garda (when clause) pentru a adauga conditii booleene suplimentare.\\n   - Trateaza explicit cazul de null (case null ->).",
    codeSnippet: `static String formatObject(Object obj) {
    return switch (obj) {
        case Integer i -> "Numar intreg: " + i;
        case String s when s.length() > 5 -> "String lung: " + s.toUpperCase();
        case String s -> "String scurt: " + s;
        case null -> "Obiect nul!";
        default -> "Tip necunoscut: " + obj.toString();
    };
}`,
    interviewTrap: "Ordinea clauzelor conteaza: daca pui case String s inainte de case String s when s.length() > 5, compilatorul va arunca eroare de unreachable code.",
    keyTakeaway: "Pattern Matching for switch testeaza tipul obiectului, extrage variabila castata si permite conditii suplimentare cu clauza when."
  },
  {
    id: "java-146",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Pattern Matching for instanceof (Java 16+)",
    question: "Cum simplifica Pattern Matching for instanceof verificarea si cast-ul tipurilor in Java?",
    answer: "1. Sintaxa clasica (boilerplate si risc de eroare):\\n   - Inainte trebuia intai sa testezi cu instanceof si apoi pe linia urmatoare sa faci cast manual explicit: if (obj instanceof String) { String s = (String) obj; ... }.\\n\\n2. Pattern Matching modern (Java 16+):\\n   - Declari variabila tinta direct in instructiunea instanceof: if (obj instanceof String s) { ... }.\\n   - Compilatorul face automat cast-ul; variabila s este disponibila direct in interiorul blocului if cu tipul String deja definit!\\n   - Variabila s poate fi folosita si in aceeasi conditie if dupa operatorul && (ex: if (obj instanceof String s && s.length() > 5)).",
    codeSnippet: `Object obj = "Hello Java";

// Stil vechi:
// if (obj instanceof String) {
//     String s = (String) obj; // cast redundant
//     System.out.println(s.toUpperCase());
// }

// Stil modern cu Pattern Matching:
if (obj instanceof String s && !s.isBlank()) {
    System.out.println(s.toUpperCase()); // s este de tip String garantat!
}`,
    interviewTrap: "Nu poti folosi operatorul || cu variabila pattern matching (ex: obj instanceof String s || s.length() > 0), deoarece daca primul test este false, s nu exista!",
    keyTakeaway: "Pattern matching for instanceof elimina cast-ul manual redundant, legand variabila direct in testul logic."
  },
  {
    id: "java-147",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Sealed Classes si Sealed Interfaces (Java 17+)",
    question: "Ce sunt Sealed Classes in Java, ce rol are clauza permits si ce modificatori pot avea subclasele?",
    answer: "1. Ce sunt Sealed Classes:\\n   - Clase sau interfete care restrictioneaza strict ce alte clase sau interfete le pot mosteni sau implementa.\\n   - Ofera control total autorului clasei asupra ierarhiei de mostenire.\\n\\n2. Clauza permits:\\n   - Specifica explicit lista exhaustiva a subclaselor autorizate: public sealed class Shape permits Circle, Square {}.\\n\\n3. Modificatorii obligatorii pentru subclase:\\n   - Fiecare subclasa specificata in permits TREBUIE sa declare exact unul dintre acesti 3 modificatori:\\n     1. final: Nu mai poate fi mostenita deloc.\\n     2. sealed: Continua ierarhia controlata, declarand propriile sale permisiuni.\\n     3. non-sealed: Se deschide din nou la mostenire libera de catre oricine.",
    codeSnippet: `public sealed interface PaymentMethod permits CardPayment, CashPayment {}

// Subclasa finala:
public final class CardPayment implements PaymentMethod {}

// Subclasa deschisa pentru alte extinderi:
public non-sealed class CashPayment implements PaymentMethod {}

// Ilegal:
// public class CryptoPayment implements PaymentMethod {} // Eroare: nu este in permits!`,
    interviewTrap: "Beneficiul urias apare in switch expressions: compilatorul stie toate subclasele posibile, eliminand necesitatea clauzei default!",
    keyTakeaway: "Sealed classes definesc un set inchis si exhaustiv de subclase permise, fiecare fiind final, sealed sau non-sealed."
  },
  {
    id: "java-148",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Thread vs Proces in Sistemul de Operare",
    question: "Care este diferenta fundamentala dintre un Proces si un Thread in contextul executiei programelor Java?",
    answer: "1. Proces (Process):\\n   - O instanta a unui program in executie, gestionata de sistemul de operare.\\n   - Fiecare proces are propriul sau spatiu izolat de memorie (adrese virtuale, registri, descriptori).\\n   - Doua procese nu pot accesa direct memoria celuilalt (comunicarea necesita mecanisme IPC greoaie: sockets, pipe-uri, shared memory).\\n   - Cand pornesti o aplicatie Java (java Main), OS aloca un proces JVM separat.\\n\\n2. Thread (Fir de executie):\\n   - Este cea mai mica unitate de executie din cadrul unui proces (adesea numit \"lightweight process\").\\n   - Toate thread-urile din acelasi proces PARTAJEAZA aceeasi memorie Heap (obiectele create), zona de cod si variabilele statice.\\n   - Fiecare thread are propria sa Stiva (Stack) privata pentru variabile locale si apeluri de functii.\\n   - Comutarea de context (context switch) intre thread-uri este mult mai rapida decat intre procese.",
    codeSnippet: `// Proces: Aplicatia JVM pornita in OS
// Thread-uri in interiorul procesului:
Thread t1 = new Thread(() -> System.out.println("Thread 1 pe acelasi Heap"));
Thread t2 = new Thread(() -> System.out.println("Thread 2 pe acelasi Heap"));

t1.start();
t2.start();`,
    interviewTrap: "Pentru ca thread-urile partajeaza aceeasi memorie Heap, accesul concurent nesincronizat la obiecte comune duce la Race Conditions.",
    keyTakeaway: "Un proces are spatiu de memorie propriu si izolat; thread-urile ruleaza in acelasi proces si partajeaza memoria Heap."
  },
  {
    id: "java-149",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Crearea unui Thread: extends Thread vs implements Runnable",
    question: "Care sunt cele doua moduri clasice de a crea un Thread in Java si de ce este preferata implementarea Runnable?",
    answer: "1. Cele doua moduri:\\n   - Varianta 1: Extinderea clasei Thread: class MyThread extends Thread { public void run() { ... } }\\n   - Varianta 2: Implementarea interfetei Runnable: class MyTask implements Runnable { public void run() { ... } } urmat de new Thread(myTask).start().\\n\\n2. De ce se prefera implements Runnable:\\n   - Java nu suporta mostenire multipla: daca extinzi clasa Thread, nu mai poti mosteni nicio alta clasa! Prin Runnable, clasa ta este libera sa extinda o alta clasa de business.\\n   - Separarea responsabilitatilor: Runnable reprezinta doar sarcina de lucru (Task-ul), in timp ce Thread este mecanismul de executie.\\n   - Reutilizare in Thread Pools: Obiectele Runnable pot fi trimise direct catre ExecutorService / ThreadPool-uri, in timp ce obiectele Thread nu sunt reutilizabile dupa ce s-au oprit.",
    codeSnippet: `// 1. Varianta mostenire (mai putin flexibila):
class WorkerThread extends Thread {
    @Override
    public void run() { System.out.println("Worker ruleaza"); }
}

// 2. Varianta recomandata (Runnable + Lambda):
Runnable task = () -> System.out.println("Task executat");
Thread thread = new Thread(task);
thread.start();`,
    interviewTrap: "Daca extinzi Thread, irosesti singura posibilitate de mostenire din Java si legi strans logica de business de ciclul de viata al firului.",
    keyTakeaway: "Implementarea interfetei Runnable este recomandata pentru ca permite mostenirea altei clase si decupleaza task-ul de executia pe thread."
  },
  {
    id: "java-150",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Diferenta dintre start() si run() in clasa Thread",
    question: "Ce se intampla daca apelezi metoda run() direct in loc de start() pe un obiect Thread?",
    answer: "Aceasta este o intrebare clasica de interviu pentru orice junior!\\n\\n1. Apelul thread.start():\\n   - Solicita sistemului de operare si JVM-ului crearea unui fir de executie NOU si separat.\\n   - Aloca o noua stiva (Call Stack) pentru noul thread.\\n   - Cand noul fir este planificat (scheduled), acesta va executa automat metoda run() pe propriul sau fir in paralel.\\n\\n2. Apelul thread.run() direct:\\n   - NU creeaza niciun thread nou!\\n   - Executa codul din metoda run() ca pe o simpla metoda Java obisnuita, pe firul CURENT (de regula firul main), in mod sincron si secvential.\\n   - Nicio paralelizare nu are loc.",
    codeSnippet: `Thread t = new Thread(() -> {
    System.out.println("Thread curent: " + Thread.currentThread().getName());
});

// GRESIT: Executa sincron pe firul 'main'!
t.run(); // Output: Thread curent: main

// CORECT: Creeaza un fir nou!
t.start(); // Output: Thread curent: Thread-0`,
    interviewTrap: "Daca apelezi start() de doua ori pe acelasi obiect Thread, se va arunca IllegalThreadStateException. Un thread terminat nu poate fi repornit.",
    keyTakeaway: "start() creeaza un fir de executie nou si porneste metoda run() pe el; run() direct este doar un simplu apel sincron de metoda pe firul curent."
  },
  {
    id: "java-151",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Ciclul de viata al unui Thread in Java (Stari)",
    question: "Care sunt cele 6 stari (states) ale unui fir de executie definite in Thread.State in Java?",
    answer: "Java defineste 6 stari in enum-ul Thread.State (accesibile prin thread.getState()):\\n\\n1. NEW: Thread-ul a fost instantiat (new Thread()), dar start() nu a fost inca apelat.\\n2. RUNNABLE: Thread-ul se executa in JVM sau asteapta planificarea pe procesor (CPU scheduler).\\n3. BLOCKED: Thread-ul este blocat asteptand sa achizitioneze un monitor lock (la intrarea intr-un bloc synchronized).\\n4. WAITING: Asteapta la nesfarsit ca un alt thread sa execute o actiune specifica (fara timeout: apel de Object.wait(), Thread.join() sau LockSupport.park()).\\n5. TIMED_WAITING: Asteapta o perioada specificata de timp (cu timeout: Thread.sleep(ms), Object.wait(ms), Thread.join(ms)).\\n6. TERMINATED: Executia metodei run() s-a finalizat (normal sau prin exceptie nearuncata).",
    codeSnippet: `Thread t = new Thread(() -> {
    try {
        Thread.sleep(1000); // Intra in TIMED_WAITING
    } catch (InterruptedException e) {}
});

System.out.println(t.getState()); // NEW
t.start();
System.out.println(t.getState()); // RUNNABLE sau TIMED_WAITING`,
    interviewTrap: "Starea RUNNABLE include atat thread-urile care consuma CPU in acest moment, cat si pe cele gata de executie (Ready) care asteapta o felie de procesor de la SO.",
    keyTakeaway: "Cele 6 stari sunt: NEW, RUNNABLE, BLOCKED (pe lock), WAITING (fara limita), TIMED_WAITING (cu timer) si TERMINATED."
  },
  {
    id: "java-152",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Thread.sleep() vs Object.wait()",
    question: "Care este diferenta cruciala dintre Thread.sleep() si Object.wait() privind eliberarea lock-urilor?",
    answer: "Aceasta diferenta este intrebata la 90% din interviurile tehnice Java!\\n\\n1. Thread.sleep(ms):\\n   - Este o metoda STATICA din clasa Thread.\\n   - NU ELIBEREAZA NICIUN LOCK! Daca thread-ul detine un lock (synchronized), il pastreaza pe toata durata somnului, blocand toate celelalte thread-uri care doresc acel lock.\\n   - Nu necesita bloc synchronized pentru a fi apelata.\\n\\n2. Object.wait():\\n   - Este o metoda de INSTANTA din clasa java.lang.Object.\\n   - ELIBEREAZA IMEDIAT lock-ul pe care il detine pe acel obiect, permitand altor thread-uri sa intre in sectiuni sincronizate pe acelasi obiect.\\n   - Poate fi apelata DOAR dintr-un context sincronizat (synchronized) pe acelasi obiect, altfel arunca IllegalMonitorStateException.",
    codeSnippet: `Object lock = new Object();

// 1. sleep pastreaza lock-ul:
synchronized (lock) {
    Thread.sleep(1000); // Nimeni altcineva nu poate accesa lock timp de 1 secunda!
}

// 2. wait elibereaza lock-ul:
synchronized (lock) {
    lock.wait(); // Elibereaza lock-ul si asteapta notify() de la alt thread!
}`,
    interviewTrap: "Daca apelezi lock.wait() in afara unui bloc synchronized (lock), primesti imediat IllegalMonitorStateException la runtime!",
    keyTakeaway: "sleep() pastreaza lock-ul dobandit; wait() elibereaza lock-ul si cere sa fie apelat dintr-un bloc synchronized."
  },
  {
    id: "java-153",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "De ce wait(), notify() si notifyAll() sunt in Object?",
    question: "De ce metodele wait(), notify() si notifyAll() sunt definite in java.lang.Object si nu in clasa Thread?",
    answer: "1. Motivul de baza (Monitor Lock per Obiect):\\n   - In Java, fiecare obiect are asociat un Lock intern si o Coada de Asteptare (Wait Set), numite impreuna Monitor.\\n   - Mecanismul de sincronizare asteapta pe o RESURSA (obiectul pe care se face sincronizarea), nu pe firul de executie in sine.\\n   - Cand un thread apeleaza lock.wait(), el elibereaza monitorul ACELUI obiect si intra in wait set-ul acelui obiect.\\n\\n2. Daca erau in clasa Thread:\\n   - Ar fi fost confuz pe ce resursa asteapta thread-ul si cum comunica mai multe thread-uri printr-un obiect partajat.\\n\\n3. notify() vs notifyAll():\\n   - notify() trezeste un SINGUR thread arbitrar din wait set.\\n   - notifyAll() trezeste TOATE thread-urile din wait set (recomandat pentru a preveni deadlock si starvation).",
    codeSnippet: `synchronized (sharedQueue) {
    while (sharedQueue.isEmpty()) {
        sharedQueue.wait(); // Asteapta pe resursa partajata!
    }
    String item = sharedQueue.poll();
    sharedQueue.notifyAll(); // Notifica toate thread-urile care asteapta pe sharedQueue
}`,
    interviewTrap: "Apelul wait() trebuie pus intotdeauna intr-o bucla while (nu if!), pentru a preveni trezirile false (spurious wakeups).",
    keyTakeaway: "wait si notify sunt in Object deoarece monitorul si lock-ul apartin fiecarui obiect Java individual, nu thread-ului."
  },
  {
    id: "java-154",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Cuvantul cheie synchronized in Java",
    question: "Pe ce lock se sincronizeaza o metoda de instanta, o metoda statica si un bloc synchronized(lock)?",
    answer: "Cuvantul cheie synchronized asigura excludere mutuala (un singur thread poate executa codul la un moment dat) si vizibilitate in memorie:\\n\\n1. Metoda de instanta sincronizata:\\n   - public synchronized void update() { ... }\\n   - Lock-ul dobandit este instanta curenta a obiectului: this.\\n\\n2. Metoda statica sincronizata:\\n   - public static synchronized void init() { ... }\\n   - Lock-ul dobandit este obiectul Class al clasei din Metaspace: MyClass.class.\\n   - Un thread pe o metoda statica NU blocheaza un alt thread pe o metoda de instanta non-statica a aceluiasi obiect!\\n\\n3. Bloc de cod sincronizat:\\n   - synchronized (lockObject) { ... }\\n   - Lock-ul este obiectul explicit specificat intre paranteze (recomandat: private final Object lock = new Object()).",
    codeSnippet: `public class Counter {
    private int count = 0;
    private final Object customLock = new Object();

    // Sincronizat pe 'this':
    public synchronized void increment() { count++; }

    // Sincronizat pe un lock dedicat (recomandat, ascunde lock-ul):
    public void add() {
        synchronized (customLock) {
            count++;
        }
    }

    // Sincronizat pe Counter.class:
    public static synchronized void globalReset() {}
}`,
    interviewTrap: "Daca sincronizezi o metoda pe this si cineva din exterior sincronizeaza din greseala pe instanta ta, poti provoca un deadlock accidental. Foloseste lock-uri private interne: private final Object lock = new Object().",
    keyTakeaway: "Metodele de instanta sincronizeaza pe this; metodele statice pe Class.class; blocurile synchronized pe obiectul specificat."
  },
  {
    id: "java-155",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este o Conditie de Cursa (Race Condition)?",
    question: "Ce este o conditie de cursa (Race Condition) si de ce operatia count++ nu este thread-safe?",
    answer: "1. Ce este o Conditie de Cursa:\\n   - O anomalie software care apare atunci cand doua sau mai multe thread-uri acceseaza simultan o resursa mutabila partajata, iar rezultatul final depinde de ordinea si sincronizarea imprevizibila a pasilor de executie pe CPU.\\n\\n2. De ce operatia count++ NU este atomica:\\n   - La nivel de bytecode Java si procesor, count++ este compusa din 3 instructiuni distincte:\\n     1. READ: Citeste valoarea curenta a lui count din memorie in registrul CPU.\\n     2. MODIFY: Incrementeaza valoarea in registru (val + 1).\\n     3. WRITE: Scrie noua valoare inapoi in memorie.\\n   - Daca Thread 1 citeste valoarea 5, iar Thread 2 citeste tot 5 inainte ca Thread 1 sa scrie, ambele vor scrie inapoi 6! In loc de 7, valoarea ramane 6 (actualizare pierduta - lost update).",
    codeSnippet: `public class UnsafeCounter {
    private int count = 0;

    // Nesigur! Poate pierde incrementari cand este apelat concurent:
    public void increment() {
        count++; // 3 operatii: read, modify, write!
    }

    // Sigur 1:
    public synchronized void safeIncrement() { count++; }

    // Sigur 2:
    // private AtomicInteger count = new AtomicInteger(0);
    // count.incrementAndGet();
}`,
    interviewTrap: "Chiar daca declari volatile int count;, count++ ramane in continuare nesigur la concurenta, deoarece volatile asigura doar vizibilitate, nu si atomicitate!",
    keyTakeaway: "Race condition apare la modificari concurente nesincronizate; count++ consta din 3 pasi neatomici (read-modify-write) si poate pierde date."
  },
  {
    id: "java-156",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Ce este Deadlock (Interblocare) si cum apare?",
    question: "Ce este un Deadlock in Java si care este un exemplu clasic cu doua thread-uri si doua lock-uri?",
    answer: "1. Ce este un Deadlock:\\n   - O situatie de blocare definitiva in care doua sau mai multe thread-uri sunt suspendate permanent, fiecare asteptand o resursa/lock detinuta de un alt thread din acelasi grup, creand o dependenta circulara.\\n\\n2. Scenariul clasic cu 2 lock-uri (A si B):\\n   - Thread 1 dobandeste Lock A si doreste sa obtina Lock B.\\n   - In acelasi timp, Thread 2 dobandeste Lock B si doreste sa obtina Lock A.\\n   - Thread 1 nu poate inainta pana nu primeste Lock B de la Thread 2.\\n   - Thread 2 nu poate inainta pana nu primeste Lock A de la Thread 1.\\n   - Ambele raman blocate pentru totdeauna!",
    codeSnippet: `Object lockA = new Object();
Object lockB = new Object();

// Thread 1:
new Thread(() -> {
    synchronized (lockA) {
        try { Thread.sleep(50); } catch (Exception e) {}
        synchronized (lockB) { /* Deadlock! */ }
    }
}).start();

// Thread 2:
new Thread(() -> {
    synchronized (lockB) {
        try { Thread.sleep(50); } catch (Exception e) {}
        synchronized (lockA) { /* Deadlock! */ }
    }
}).start();`,
    interviewTrap: "Deadlock-ul nu arunca nicio exceptie! Aplicatia pur si simplu ingheata (sau endpoint-ul ramane agatat la nesfarsit) fara mesaje de eroare in loguri.",
    keyTakeaway: "Deadlock-ul apare cand thread-urile achizitioneaza multiple lock-uri in ordini diferite, creand o dependenta ciclica permanenta."
  },
  {
    id: "java-157",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Detectarea si Prevenirea unui Deadlock in Java",
    question: "Cum previi aparitia unui Deadlock si cum il poti detecta intr-o aplicatie in productie?",
    answer: "1. Cum se PREVINE un Deadlock:\\n   - Ordonarea globala a Lock-urilor (Lock Ordering): Regula fundamentala! Toate thread-urile trebuie sa achizitioneze lock-urile in EXACT aceeasi ordine prestabilita (ex: intotdeauna lockA inainte de lockB, sau ordonare dupa ID numeric unic).\\n   - Folosirea ReentrantLock cu timeout: lock.tryLock(timeout, unit) in loc de bloc synchronized infinit. Daca nu poate obtine lock-ul in timp util, elibereaza tot si reincearca.\\n   - Evitarea imbricarii de lock-uri cand nu este strict necesar.\\n\\n2. Cum se DETECTEAZA in Productie:\\n   - Thread Dump: generat prin comanda jcmd <PID> Thread.print sau jstack <PID>.\\n   - Masina virtuala Java cauta automat cicluri si afiseaza la sfarsitul dump-ului: \"Found one Java-level deadlock: ...\".\\n   - JConsole / VisualVM: instrumente grafice cu tab dedicat de \"Detect Deadlock\".",
    codeSnippet: `// Solutia 1: Ordonare consistenta a lock-urilor:
void safeTransfer(Account from, Account to, double amount) {
    Account first = from.getId() < to.getId() ? from : to;
    Account second = from.getId() < to.getId() ? to : from;

    synchronized (first) {
        synchronized (second) {
            from.withdraw(amount);
            to.deposit(amount);
        }
    }
}`,
    interviewTrap: "Tranzactiile bancare clasice transfer(acc1, acc2) sunt cel mai des intalnit exemplu de deadlock cand utilizatorul A trimite bani lui B in acelasi timp in care B trimite lui A!",
    keyTakeaway: "Prevenirea deadlock-ului se bazeaza pe ordinea stricta de achizitie a lock-urilor si tryLock cu timeout; detectia se face prin Thread Dump (jstack)."
  },
  {
    id: "java-158",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Cuvantul cheie volatile in Java",
    question: "Ce garantii ofera cuvantul cheie volatile si ce inseamna \"vizibilitate in memorie\"?",
    answer: "1. Problema memoriei cache a procesoarelor (CPU Cache):\\n   - Fiecare nucleu de CPU are propriul cache L1/L2 ultra-rapid. Cand un thread citeste o variabila, valoarea poate fi stocata in cache-ul nucleului sau.\\n   - Daca un thread pe CPU 1 modifica valoarea, CPU 2 s-ar putea sa continue sa citeasca valoarea veche din cache-ul sau propriu zile intregi (lipsa de vizibilitate)!\\n\\n2. Garantiile oferite de volatile:\\n   - Vizibilitate imediata: Orice scriere intr-o variabila volatile este scrisa imediat in memoria principala (RAM), iar orice citire este citita direct din RAM, invalidand cache-urile CPU.\\n   - Prevenirea reordonarii (Happens-Before): Compilatorul si procesorul nu au voie sa reordoneze instructiunile de citire/scriere in jurul variabilei volatile.",
    codeSnippet: `public class WorkerTask implements Runnable {
    // Fara volatile, thread-ul worker ar putea rula la infinit
    // chiar daca main seteaza running = false!
    private volatile boolean running = true;

    public void stop() { running = false; }

    @Override
    public void run() {
        while (running) {
            // Executa munca...
        }
        System.out.println("Oprit curat!");
    }
}`,
    interviewTrap: "Daca uiti volatile pe un flag boolean partajat, bucla while(running) poate fi optimizata de compilatorul JIT in while(true), cauzand bucla infinita!",
    keyTakeaway: "volatile asigura ca toate thread-urile vad instantaneu cea mai recenta valoare a unei variabile in memoria RAM."
  },
  {
    id: "java-159",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce volatile NU garanteaza atomicitatea?",
    question: "De ce declararea unei variabile ca volatile int count nu face instructiunea count++ sigura pentru concurenta?",
    answer: "1. Diferenta dintre Vizibilitate si Atomicitate:\\n   - Vizibilitate (ce ofera volatile): Garanteaza doar ca valoarea citita este cea mai recenta din RAM.\\n   - Atomicitate (ce NU ofera volatile): Garanteaza ca un grup de operatii se executa ca un intreg indivizibil, fara intrerupere de la alte thread-uri.\\n\\n2. Ce se intampla la volatile int count; count++:\\n   - count++ ramane tot un proces in 3 pasi separati: 1. Read din RAM, 2. Add 1, 3. Write in RAM.\\n   - volatile garanteaza doar ca pasul 1 citeste valoarea curenta si pasul 3 scrie direct in RAM.\\n   - Insa intre pasul 1 si pasul 3, un alt thread poate citi, incrementa si scrie propria valoare! Scrierile se vor suprascrie reciproc.\\n\\n3. Concluzie:\\n   - volatile este adecvat DOAR cand scrierea nu depinde de valoarea citita anterior (ex: simple flag-uri booleene running = true/false).",
    codeSnippet: `// GRESIT: count++ pierde update-uri chiar si cu volatile!
private volatile int count = 0;
public void inc() { count++; } // Nesigur!

// CORECT: Foloseste AtomicInteger pentru atomicitate fara lock-uri
private AtomicInteger safeCount = new AtomicInteger(0);
public void safeInc() { safeCount.incrementAndGet(); }`,
    interviewTrap: "La interviu se testeaza daca candidatul confunda \"vizibilitatea\" cu \"thread-safety-ul complet\". Subliniaza ca volatile nu ofera atomicitate operatiilor compuse.",
    keyTakeaway: "volatile garanteaza vizibilitatea valorii, dar NU ofera atomicitate pentru operatii compuse de tip read-modify-write precum count++."
  },
  {
    id: "java-160",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "AtomicInteger si Principiul CAS (Compare-And-Swap)",
    question: "Cum realizeaza clasele atomice (AtomicInteger, AtomicBoolean) siguranta thread-urilor fara a folosi synchronized?",
    answer: "1. Clasele Atomice (java.util.concurrent.atomic):\\n   - AtomicInteger, AtomicLong, AtomicBoolean, AtomicReference.\\n   - Permit operatii thread-safe, atomice si extrem de performante fara a bloca thread-urile (lock-free programming).\\n\\n2. Principiul CAS (Compare-And-Swap):\\n   - Este o instructiune atomica sustinuta direct de hardware-ul procesoarelor moderne (la nivel de CPU, ex: instructiunea CMPXCHG pe x86).\\n   - Cum functioneaza:\\n     1. Citeste valoarea curenta (expectedValue).\\n     2. Calculeaza noua valoare (newValue).\\n     3. Trimite procesorului comanda: \"Daca valoarea din memorie este in continuare egala cu expectedValue, schimb-o cu newValue; daca s-a schimbat intre timp, nu face nimic si intoarce false\".\\n     4. Daca a esuat din cauza unui alt thread, se reincearca intr-o bucla rapida pana reuseste.\\n   - Nu suspenda thread-ul in starea BLOCKED, eliminand costul scump de context switch al sistemului de operare.",
    codeSnippet: `AtomicInteger counter = new AtomicInteger(0);

// Operatii atomice directe:
int val1 = counter.incrementAndGet(); // ++counter atomic
int val2 = counter.addAndGet(5);       // counter += 5 atomic

// CAS explicit manual:
boolean updated = counter.compareAndSet(6, 10);
System.out.println("S-a facut update: " + updated); // true (daca era 6, devine 10)`,
    interviewTrap: "Clasele atomice sunt mult mai rapide decat synchronized cand competitia este redusa sau medie, dar sub competitie extrema pot cauza incarcare CPU prin rotirea buclei CAS.",
    keyTakeaway: "Clasele atomice folosesc instructiunea hardware CAS (Compare-And-Swap) pentru actualizari lock-free fara blocarea thread-urilor."
  },
  {
    id: "java-161",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este un Thread Pool si de ce este esential?",
    question: "De ce este considerata o practica proasta crearea manuala de noi instante Thread (new Thread().start()) in aplicatii web?",
    answer: "1. Costul ridicat al crearii unui Thread in OS:\\n   - Un fir Java clasic corespunde unui fir nativ al sistemului de operare (1:1 mapping).\\n   - Crearea unui thread presupune: apeluri de sistem catre kernelul OS, alocarea a 1MB de memorie fixa pe stiva (Stack) per thread, initializare de registri.\\n   - Crearea si distrugerea continua de thread-uri consuma cantitati uriase de timp CPU si memorie.\\n\\n2. Risc de OutOfMemoryError:\\n   - Daca un server web primeste 10.000 cereri concurente si creeaza cate un thread manual pentru fiecare, serverul va consuma 10GB doar pe stive si va crapa rapid cu OutOfMemoryError: unable to create new native thread.\\n\\n3. Ce ofera un Thread Pool:\\n   - Refolosirea thread-urilor: Un numar controlat de thread-uri sunt create la inceput si mentinute in viata pentru a procesa o coada de task-uri.\\n   - Controlul resurselor: Limiteaza numarul maxim de sarcini simultane, protejand serverul de prabusire.",
    codeSnippet: `// GRESIT: Creare necontrolata de thread-uri
for (int i = 0; i < 10_000; i++) {
    new Thread(() -> doWork()).start(); // CRASH garantat in productie!
}

// CORECT: Folosirea unui Thread Pool limitat
ExecutorService pool = Executors.newFixedThreadPool(10);
for (int i = 0; i < 10_000; i++) {
    pool.submit(() -> doWork()); // Se executa controlat pe 10 thread-uri!
}
pool.shutdown();`,
    interviewTrap: "Spunand ca un Thread Pool doar \"porneste mai multe thread-uri\" este incomplet. Subliniaza refolosirea thread-urilor existente si limitarea consumului de memorie/CPU.",
    keyTakeaway: "Thread Pool refoloseste un numar controlat de thread-uri active, eliminand costul scump de creare si prevenind OutOfMemoryError."
  },
  {
    id: "java-162",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "ExecutorService si Fabrica Executors",
    question: "Cum cream un ExecutorService si care este diferenta dintre newFixedThreadPool si newCachedThreadPool?",
    answer: "1. Ce este ExecutorService:\\n   - Interfata standard din java.util.concurrent care gestioneaza un pool de thread-uri si executia asincrona a sarcinilor (Runnable / Callable).\\n\\n2. newFixedThreadPool(nThreads):\\n   - Creeaza un pool cu un numar FIX de thread-uri (ex: 10).\\n   - Daca toate cele 10 sunt ocupate, noile sarcini sunt stocate intr-o coada nelimitata (LinkedBlockingQueue).\\n   - Ideal pentru servere de productie cu incarcare predictibila.\\n\\n3. newCachedThreadPool():\\n   - Creeaza thread-uri noi la nevoie si refoloseste thread-urile eliberate in ultimele 60 de secunde.\\n   - Nu are limita superioara de thread-uri!\\n   - Riscant in productie: daca vine o avalansa de cereri, poate crea mii de thread-uri si prabusi masina.",
    codeSnippet: `// Pool cu 4 thread-uri fixe:
ExecutorService fixedPool = Executors.newFixedThreadPool(4);

fixedPool.submit(() -> {
    System.out.println("Executat de: " + Thread.currentThread().getName());
});

// Inchidere la final:
fixedPool.shutdown();`,
    interviewTrap: "newFixedThreadPool foloseste o coada nelimitata (Unbounded Queue). Daca task-urile vin mai repede decat pot fi procesate, coada va umple memoria Heap cauzand OutOfMemoryError. In aplicatii critice se configureaza direct un ThreadPoolExecutor cu coada de capacitate limitata.",
    keyTakeaway: "newFixedThreadPool mentine un numar fix de thread-uri; newCachedThreadPool creste dinamic fara limita."
  },
  {
    id: "java-163",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Callable vs Runnable in Java Concurrency",
    question: "Care sunt cele 3 mari diferente dintre interfata Callable<V> si interfata Runnable?",
    answer: "1. Returnarea unei valori:\\n   - Runnable are metoda public void run() -> nu poate returna niciun rezultat.\\n   - Callable<V> are metoda public V call() -> returneaza un rezultat de tip generic V catre apelant prin intermediul unui obiect Future<V>.\\n\\n2. Tratarea Exceptiilor:\\n   - Runnable.run() nu declara nicio checked exception (nu are throws). Orice exceptie verificata trebuie prinsa manual intr-un try-catch in interiorul metodei.\\n   - Callable.call() declara throws Exception -> poate arunca liber orice checked exception, care va fi impachetata si transmisa mai departe in ExecutionException la apelul future.get().\\n\\n3. Pachetul de provenienta:\\n   - Runnable exista din Java 1.0 in java.lang.\\n   - Callable a fost adaugat in Java 5 in java.util.concurrent special pentru ExecutorService.",
    codeSnippet: `// 1. Runnable: fara retur, fara checked exceptions
Runnable r = () -> System.out.println("Ruleaza");

// 2. Callable: returneaza String si poate arunca Exception
Callable<String> c = () -> {
    // Simulare calcul sau I/O
    return "Rezultat calculat";
};

ExecutorService executor = Executors.newSingleThreadExecutor();
Future<String> future = executor.submit(c);`,
    interviewTrap: "Daca ai nevoie sa afli rezultatul executiei sau daca task-ul a crapat cu o exceptie de I/O, nu poti folosi Runnable simplu fara hack-uri; foloseste intotdeauna Callable.",
    keyTakeaway: "Callable returneaza o valoare si poate arunca checked exceptions; Runnable returneaza void si nu poate arunca checked exceptions."
  },
  {
    id: "java-164",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Interfata Future in Java",
    question: "Ce reprezinta un obiect Future<T>, care sunt principalele sale metode si de ce get() este blocant?",
    answer: "1. Ce este Future<T>:\\n   - Reprezinta promisiunea sau rezultatul eventual al unei operatii asincrone care se executa pe un alt thread.\\n\\n2. Principalele metode:\\n   - get(): Returneaza rezultatul final. ATENTIE: Daca sarcina nu s-a incheiat inca, metoda get() BLOCHEAZA thread-ul apelant pana cand rezultatul este disponibil!\\n   - get(timeout, unit): Blocheaza maxim perioada specificata; daca expira, arunca TimeoutException.\\n   - isDone(): Returneaza true daca sarcina s-a terminat (cu succes, exceptie sau anulare).\\n   - cancel(mayInterrupt): Incearca sa anuleze executia sarcinii.\\n   - isCancelled(): Returneaza true daca sarcina a fost anulata.",
    codeSnippet: `ExecutorService executor = Executors.newSingleThreadExecutor();

Future<Integer> future = executor.submit(() -> {
    Thread.sleep(1000);
    return 42;
});

// Facem altceva in paralel...
System.out.println("Task trimis, asteptam rezultatul...");

try {
    // get() blocheaza pana cand cele 1000ms s-au scurs:
    Integer result = future.get(2, TimeUnit.SECONDS);
    System.out.println("Rezultat: " + result); // 42
} catch (TimeoutException | InterruptedException | ExecutionException e) {
    e.printStackTrace();
}
executor.shutdown();`,
    interviewTrap: "Daca apelezi future.get() imediat pe linia urmatoare dupa submit, anulezi tot avantajul asincronismului, deoarece thread-ul curent ramane blocat asteptand finalizarea.",
    keyTakeaway: "Future reprezinta rezultatul unui calcul asincron; metoda get() este blocanta pana la terminarea calculului."
  },
  {
    id: "java-165",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "CompletableFuture Basics in Java 8+",
    question: "De ce este CompletableFuture superior vechiului Future si cum inlantuim operatii cu thenApply()?",
    answer: "1. Limitarile vechiului Future:\\n   - Nu putea fi completat manual (nu puteai seta direct o valoare).\\n   - Singura modalitate de a obtine rezultatul era blocant prin get().\\n   - Nu puteai combina sau compune doua operatii asincrone fara blocare.\\n\\n2. Avantajele CompletableFuture:\\n   - Programare asincrona non-blocanta bazata pe callback-uri reactive (similar cu Promises in JavaScript).\\n   - supplyAsync(Supplier): Ruleaza o operatie asincrona pe ForkJoinPool.\\n   - thenApply(Function): Transforma rezultatul cand este gata (fara a bloca thread-ul apelant!).\\n   - thenAccept(Consumer): Consuma rezultatul final.\\n   - exceptionally(Function): Gestioneaza erorile intr-un mod elegant.",
    codeSnippet: `CompletableFuture.supplyAsync(() -> {
    // Simulare apel extern API:
    return "Date Utilizator";
}).thenApply(data -> {
    return data.toUpperCase(); // Se executa automat cand supplyAsync termina!
}).thenAccept(upperData -> {
    System.out.println("Primit: " + upperData); // DATE UTILIZATOR
}).exceptionally(ex -> {
    System.out.println("Eroare: " + ex.getMessage());
    return null;
});`,
    interviewTrap: "Daca aplicatia ta main se termina inainte ca thread-ul din pool sa termine CompletableFuture, executia se poate opri deoarece ForkJoinPool foloseste daemon threads.",
    keyTakeaway: "CompletableFuture permite pipeline-uri asincrone non-blocante prin metode precum supplyAsync, thenApply si thenAccept."
  },
  {
    id: "java-166",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Oprirea unui ExecutorService: shutdown() vs shutdownNow()",
    question: "Care este diferenta dintre shutdown() si shutdownNow() si ce rol are awaitTermination()?",
    answer: "1. executor.shutdown():\\n   - Oprire \"ordonata\" (graceful shutdown).\\n   - Nu mai accepta NICIUN task nou (submit() va arunca RejectedExecutionException).\\n   - Continua insa sa execute pana la capat toate task-urile aflate in desfasurare si cele aflate deja in coada.\\n\\n2. executor.shutdownNow():\\n   - Oprire \"brusca\" (immediate shutdown).\\n   - Incearca sa opreasca imediat task-urile active trimitand interrupt() (Thread.interrupt()) catre fiecare thread.\\n   - Scoate din coada task-urile care asteptau si le returneaza ca o lista List<Runnable>.\\n\\n3. awaitTermination(timeout, unit):\\n   - Blocheaza thread-ul curent pana cand toate task-urile si-au incheiat executia dupa shutdown sau pana cand expira timpul.",
    codeSnippet: `ExecutorService executor = Executors.newFixedThreadPool(2);
// ... trimitere de task-uri ...

executor.shutdown(); // Nu mai primeste task-uri noi
try {
    if (!executor.awaitTermination(5, TimeUnit.SECONDS)) {
        executor.shutdownNow(); // Forteaza oprirea daca a depasit 5 secunde
    }
} catch (InterruptedException e) {
    executor.shutdownNow();
}`,
    interviewTrap: "Daca uiti sa apelezi shutdown() pe un ExecutorService creat intr-o aplicatie de sine statatoare, aplicatia JVM nu se va opri niciodata, deoarece thread-urile non-daemon raman active.",
    keyTakeaway: "shutdown() finalizeaza sarcinile curente fara a primi altele noi; shutdownNow() intrerupe sarcinile active si goleste coada."
  },
  {
    id: "java-167",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Ce este ThreadLocal in Java si cand se foloseste?",
    question: "Ce este clasa ThreadLocal, cum functioneaza si care sunt cele mai frecvente cazuri de utilizare?",
    answer: "1. Ce este ThreadLocal:\\n   - O clasa care permite stocarea de date izolate per fir de executie.\\n   - Fiecare thread care apeleaza threadLocal.get() sau set() acceseaza propria sa copie independenta a variabilei, complet invizibila pentru celelalte thread-uri.\\n   - Nu necesita nicio sincronizare, lock-uri sau blocuri synchronized, deoarece nu exista partajare de date!\\n\\n2. Cazuri de utilizare comune in Framework-uri (Spring, Jakarta):\\n   - Stocarea contextului de securitate: SecurityContextHolder in Spring Security stocheaza utilizatorul autentificat curent pe thread-ul cererii HTTP.\\n   - Gestionarea tranzactiilor: Conexiunea curenta de baza de date (@Transactional) asociata tranzactiei pe thread-ul respectiv.\\n   - Obiecte non-thread-safe care sunt scumpe de creat (ex: instante vechi SimpleDateFormat reutilizate per thread).",
    codeSnippet: `public class UserContext {
    private static final ThreadLocal<String> CURRENT_USER = new ThreadLocal<>();

    public static void setUser(String username) { CURRENT_USER.set(username); }
    public static String getUser() { return CURRENT_USER.get(); }
    public static void clear() { CURRENT_USER.remove(); } // Curatare obligatorie!
}`,
    interviewTrap: "Daca nu stergi valoarea dintr-un ThreadLocal cu remove() la finalul procesarii unei cereri intr-un server web cu Thread Pool, provoci Memory Leaks si amestecarea datelor intre utilizatori!",
    keyTakeaway: "ThreadLocal ofera variabile izolate per thread, ideale pentru contexte de securitate si tranzactii pe cererea HTTP curenta."
  },
  {
    id: "java-168",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Capcana Memory Leak cu ThreadLocal in Thread Pools",
    question: "De ce lipsa apelului threadLocal.remove() intr-un mediu cu Thread Pool duce la scurgeri de memorie (Memory Leaks)?",
    answer: "1. Mecanismul intern al ThreadLocal:\\n   - Fiecare obiect Thread detine o harta interna numita threadLocals (de tip ThreadLocalMap).\\n   - Cheile din aceasta harta sunt referinte slabe (WeakReference) catre obiectul ThreadLocal, dar VALORILE sunt referinte tari (Strong References) catre obiectele tale de date!\\n\\n2. Ce se intampla intr-un Thread Pool (Tomcat, Jetty, Spring):\\n   - Thread-urile nu mor niciodata! Dupa finalizarea cererii HTTP a utilizatorului A, thread-ul este pus inapoi in pool pentru a servi urmatorul utilizator B.\\n   - Daca nu ai apelat threadLocal.remove(), obiectul din valoare ramane agatat in memorie pe durata intregii vieti a thread-ului (adica pana cand opresti serverul!), blocand eliberarea sa de catre Garbage Collector.\\n   - Mai mult, utilizatorul B ar putea citi datele confidentiale ale utilizatorului A!\\n\\n3. Regula absoluta:\\n   - Apelul threadLocal.remove() se plaseaza INTOTDEAUNA intr-un bloc finally!",
    codeSnippet: `try {
    UserContext.setUser("mihai");
    processRequest();
} finally {
    // CRUCIAL: Previne scurgerea de memorie si coruperea contextului!
    UserContext.clear(); // Apeleaza ThreadLocal.remove()
}`,
    interviewTrap: "Intotdeauna mentioneaza blocul try-finally si metoda .remove() cand vorbesti despre ThreadLocal la orice interviu tehnic.",
    keyTakeaway: "Thread-urile din pool sunt refolosite permanent; apelul threadLocal.remove() in bloc finally este obligatoriu pentru a preveni memory leaks."
  },
  {
    id: "java-169",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "ReentrantLock vs cuvantul cheie synchronized",
    question: "Care sunt avantajele clasei ReentrantLock fata de blocul synchronized standard?",
    answer: "1. Ce este ReentrantLock:\\n   - O implementare explicita a interfetei Lock din java.util.concurrent.locks, oferind aceleasi garantii de baza ca synchronized, dar cu capabilitati extinse.\\n\\n2. Avantaje cheie ale ReentrantLock:\\n   - tryLock(timeout): Permite incercarea de a obtine lock-ul fara a ramane blocat pentru totdeauna daca lock-ul este ocupat (previne deadlock).\\n   - lockInterruptibly(): Un thread blocat poate fi intrerupt din asteptare prin thread.interrupt().\\n   - Fairness (Echitate): Poti crea un Fair Lock (new ReentrantLock(true)) unde cel mai vechi thread care asteapta primeste lock-ul primul (evita starvation).\\n   - Conditii multiple: Permite crearea de multiple Condition pe acelasi lock (ex: notFull, notEmpty) in loc de un singur wait set.\\n\\n3. Dezavantaj:\\n   - Necesita deblocare manuala obligatorie intr-un bloc finally: lock.unlock().",
    codeSnippet: `Lock lock = new ReentrantLock();

lock.lock(); // Obtine lock-ul
try {
    // Sectiune critica protejata
} finally {
    lock.unlock(); // OBLIGATORIU in finally!
}

// Incercare non-blocanta cu timeout:
if (lock.tryLock(1, TimeUnit.SECONDS)) {
    try { /* proceseaza */ }
    finally { lock.unlock(); }
}`,
    interviewTrap: "Daca uiti sa apelezi lock.unlock() in blocul finally, lock-ul nu se va debloca niciodata la aparitia unei exceptii, cauzand blocarea intregii aplicatii.",
    keyTakeaway: "ReentrantLock ofera tryLock cu timeout, fairness si intrerupere, dar necesita eliberare manuala stricta in bloc finally."
  },
  {
    id: "java-170",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "CountDownLatch in Java Concurrency",
    question: "Ce este un CountDownLatch, cum functioneaza si cand se foloseste?",
    answer: "1. Ce este CountDownLatch:\\n   - Un utilitar de sincronizare care permite unuia sau mai multor thread-uri sa astepte pana cand un set de operatii executate pe alte thread-uri s-a finalizat.\\n\\n2. Cum functioneaza:\\n   - Se initializeaza cu un contor numeric: CountDownLatch latch = new CountDownLatch(N).\\n   - Fiecare thread lucrator care isi finalizeaza sarcina apeleaza latch.countDown(), ceea ce decrementeaza contorul cu 1.\\n   - Thread-ul coordonator apeleaza latch.await(), ramanand blocat pana cand contorul ajunge exact la 0.\\n\\n3. Proprietate importanta:\\n   - Este ONE-SHOT (de unica folosinta): Contorul nu poate fi resetat dupa ce a ajuns la 0. (Pentru resetare se foloseste CyclicBarrier).",
    codeSnippet: `int workers = 3;
CountDownLatch latch = new CountDownLatch(workers);

for (int i = 0; i < workers; i++) {
    new Thread(() -> {
        System.out.println("Worker a terminat treaba.");
        latch.countDown(); // Scade contorul
    }).start();
}

// Thread-ul principal asteapta ca toti cei 3 lucratori sa termine:
latch.await(); 
System.out.println("Toti lucratorii au terminat, pornim aplicatia!");`,
    interviewTrap: "Daca un thread worker crapa cu o exceptie inainte de a apela latch.countDown(), contorul nu va ajunge niciodata la 0 si latch.await() va ramane blocat pe vecie! Plaseaza countDown() in finally.",
    keyTakeaway: "CountDownLatch blocheaza executia pana cand un numar fix de evenimente au apelat countDown(); este de unica folosinta."
  },
  {
    id: "java-171",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "CyclicBarrier vs CountDownLatch",
    question: "Care este diferenta principala dintre CyclicBarrier si CountDownLatch?",
    answer: "1. CountDownLatch:\\n   - Se bazeaza pe numararea unor EVENIMENTE (apeluri countDown()).\\n   - Un thread asteapta ca N operatii sa se finalizeze.\\n   - Nu poate fi reutilizat: odata ce contorul ajunge la 0, obiectul este consumat definitiv.\\n\\n2. CyclicBarrier:\\n   - Se bazeaza pe sincronizarea unor THREAD-URI la un punct comun de intalnire (bariera).\\n   - Toate thread-urile apeleaza barrier.await() si asteapta pana cand TOATE thread-urile au ajuns la aceeasi bariera inainte ca oricare dintre ele sa poata continua.\\n   - Este REUTILIZABIL (ciclic): Odata ce toate thread-urile au ajuns la bariera, aceasta se reseteaza automat si poate fi folosita pentru urmatoarea runda/faza a algoritmului.",
    codeSnippet: `// 3 participanti la bariera:
CyclicBarrier barrier = new CyclicBarrier(3, () -> {
    System.out.println("--> Toti au ajuns! Faza curenta s-a incheiat.");
});

Runnable task = () -> {
    try {
        System.out.println("Pasul 1 facut, astept la bariera...");
        barrier.await(); // Blocheaza pana ajung toti 3!
        System.out.println("Pasul 2 pornit!");
    } catch (Exception e) {}
};`,
    interviewTrap: "CountDownLatch este ideal pentru a astepta finalizarea task-urilor paralele (ex: initializare servicii); CyclicBarrier este ideal pentru calcule pe iteratii unde thread-urile trebuie sa avanseze sincron runda de runda.",
    keyTakeaway: "CountDownLatch numara evenimente si este one-shot; CyclicBarrier opreste thread-urile la un punct comun si se reseteaza ciclic."
  },
  {
    id: "java-172",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "BlockingQueue si Pattern-ul Producer-Consumer",
    question: "Cum simplifica BlockingQueue implementarea modelului Producer-Consumer si cum functioneaza put() si take()?",
    answer: "1. Ce este BlockingQueue:\\n   - O coada thread-safe din java.util.concurrent care suporta operatii blocante de inserare si extragere.\\n   - Implementari uzuale: ArrayBlockingQueue (capacitate fixa), LinkedBlockingQueue.\\n\\n2. Metodele blocante esentiale:\\n   - put(E e): Adauga un element in coada. Daca coada este plina, thread-ul PRODUCER este blocat automat pana cand se elibereaza un loc!\\n   - take(): Extrage si sterge primul element. Daca coada este goala, thread-ul CONSUMER este blocat automat pana cand apare un element!\\n\\n3. De ce este ideala pentru Producer-Consumer:\\n   - Elimina complet necesitatea scrierii de cod manual cu synchronized, wait() si notifyAll(), prevenind toate bug-urile de sincronizare.",
    codeSnippet: `BlockingQueue<String> queue = new ArrayBlockingQueue<>(10);

// Producer:
new Thread(() -> {
    try {
        queue.put("Mesaj 1"); // Blocheaza daca e plina (10 elemente)
    } catch (InterruptedException e) {}
}).start();

// Consumer:
new Thread(() -> {
    try {
        String msg = queue.take(); // Blocheaza daca e goala
        System.out.println("Procesat: " + msg);
    } catch (InterruptedException e) {}
}).start();`,
    interviewTrap: "Nu folosi add() si remove() pe o coada blocanta la concurenta, deoarece acestea arunca exceptii in loc sa astepte; foloseste put() si take() pentru comportament blocant cooperant.",
    keyTakeaway: "BlockingQueue gestioneaza automat blocarea producatorilor (coada plina) si consumatorilor (coada goala) prin put() si take()."
  },
  {
    id: "java-173",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce metodele Thread.stop(), suspend() si resume() sunt Deprecated?",
    question: "De ce metodele stop(), suspend() si resume() din clasa Thread au fost marcate ca periculoase si depreciate?",
    answer: "1. Thread.stop():\\n   - Oprea instantaneu firul de executie in mijlocul oricarei instructiuni, aruncand un ThreadDeath error.\\n   - Elibera toate lock-urile monitor detinute de acel thread intr-un mod haotic! Daca obiectul era partial modificat (stare inconsistenta), celelalte thread-uri vedeau date corupte, provocand crash-uri masive imprevizibile.\\n\\n2. Thread.suspend() si resume():\\n   - suspend() ingheta thread-ul fara a elibera lock-urile pe care le detinea!\\n   - Daca thread-ul care urma sa apeleze resume() avea nevoie de oricare dintre acele lock-uri pentru a rula, rezulta un DEADLOCK instantaneu si irecuperabil.\\n\\n3. Concluzie:\\n   - Oprirea unui thread trebuie sa fie COOPERANTA, folosind mecanismul de intrerupere (interrupt).",
    codeSnippet: `// GRESIT si DEPRECATED (nu folosi niciodata!):
// thread.stop();
// thread.suspend();

// CORECT: Semnalizare cooperanta prin interrupt
thread.interrupt();`,
    interviewTrap: "Daca un intervievator te intreaba cum opresti un thread, nu spune niciodata ca apelezi thread.stop()! Spune ca folosesti cooperarea prin interrupt() sau un flag atomic/volatile.",
    keyTakeaway: "stop() lasa datele corupte prin eliberarea brusca a lock-urilor; suspend() provoaca deadlock-uri tinand lock-urile blocate."
  },
  {
    id: "java-174",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Oprirea corecta a unui Thread cu interrupt()",
    question: "Cum se opreste corect si cooperant un Thread in Java folosind interrupt() si isInterrupted()?",
    answer: "1. Mecanismul de intrerupere (Cooperative Cancellation):\\n   - In Java, un thread nu poate fi fortat din exterior sa se opreasca; i se poate doar transmite o cerere politicoasa de oprire setand flag-ul de intrerupere prin thread.interrupt().\\n\\n2. Cum reactioneaza thread-ul tinta:\\n   - Cazul 1: Thread-ul este blocat intr-o metoda care arunca InterruptedException (sleep(), wait(), join()):\\n     - Se trezeste imediat aruncand InterruptedException, iar flag-ul de intrerupere este resetat pe false.\\n     - In blocul catch (InterruptedException e) trebuie sa cureti resursele si sa opresti bucla sau sa restaurezi flag-ul cu Thread.currentThread().interrupt().\\n   - Cazul 2: Thread-ul ruleaza o bucla CPU-intensive:\\n     - Trebuie sa verifice periodic flag-ul: while (!Thread.currentThread().isInterrupted()) { ... }.",
    codeSnippet: `public class CleanWorker extends Thread {
    @Override
    public void run() {
        while (!Thread.currentThread().isInterrupted()) {
            try {
                // Operatie cu posibila blocare:
                Thread.sleep(100);
            } catch (InterruptedException e) {
                System.out.println("Primit semnal de oprire in timpul somnului!");
                break; // Iesim curat din bucla!
            }
        }
        System.out.println("Resurse eliberate, thread oprit.");
    }
}`,
    interviewTrap: "Daca prinzi InterruptedException si lasi blocul catch gol (swallowed exception), thread-ul nu se va opri niciodata! Trebuie sa apelezi break sau Thread.currentThread().interrupt().",
    keyTakeaway: "Oprirea unui thread se face cooperant verificand isInterrupted() si tratand corespunzator InterruptedException in bucla de executie."
  },
  {
    id: "java-175",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Daemon Thread vs User Thread in Java",
    question: "Ce este un Daemon Thread si ce se intampla cu el cand toate User Threads si-au incheiat executia?",
    answer: "1. User Thread (Thread Utilizator / Non-Daemon):\\n   - Toate thread-urile standard create de dezvoltator (inclusiv firul main) sunt User Threads in mod implicit.\\n   - Masina virtuala Java (JVM) NU se va opri cat timp exista macar un singur User Thread inca activ in executie!\\n\\n2. Daemon Thread (Thread Serviciu / Fundal):\\n   - Thread de prioritate joasa gandit pentru sarcini de suport in fundal (ex: Garbage Collector din JVM, thread-uri de curatare a cache-ului).\\n   - Comportament critic la oprire: Cand toate User Threads s-au terminat, JVM se opreste IMEDIAT, omorand instantaneu toate Daemon Threads fara ca blocurile lor finally sa mai fie executate!\\n\\n3. Cum se configureaza:\\n   - thread.setDaemon(true) - OBLIGATORIU inainte de apelul start()!",
    codeSnippet: `Thread daemon = new Thread(() -> {
    while (true) {
        System.out.println("Background cleanup...");
        try { Thread.sleep(500); } catch (InterruptedException e) {}
    }
});

// Setare ca daemon inainte de start:
daemon.setDaemon(true);
daemon.start();

// Daca firul 'main' se termina acum, JVM se opreste imediat
// chiar daca thread-ul daemon avea bucla infinita!`,
    interviewTrap: "Daca apelezi thread.setDaemon(true) DUPA thread.start(), vei primi IllegalThreadStateException la runtime!",
    keyTakeaway: "JVM ramane in viata cat timp exista cel putin un User Thread; Daemon Threads sunt oprite brusc cand toate User Threads se termina."
  },
  {
    id: "java-176",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Virtual Threads in Java 21 (Project Loom)",
    question: "Ce sunt Virtual Threads introduse in Java 21 si de ce revolutioneaza aplicatiile I/O intensive?",
    answer: "1. Problema Platform Threads (thread-urile traditionale Java):\\n   - Fiecare thread Java este mapat 1:1 pe un thread nativ al SO (cost scump de memorie ~1MB stiva, maxim cateva mii per masina).\\n   - Cand un thread face un apel blocant (I/O catre DB sau REST API), thread-ul de SO este tinut blocat fara sa faca nimic, irosind resurse masive.\\n\\n2. Ce aduc Virtual Threads (Java 21):\\n   - Thread-uri \"usoare\" (lightweight) gestionate direct de JVM, nu de sistemul de operare.\\n   - Cost infim de memorie (cativa KB) si creare aproape instantanee (poti crea milioane de Virtual Threads pe un singur laptop!).\\n   - Cand un Virtual Thread face un apel I/O blocant, JVM il suspenda automat (unmount) si aloca thread-ul fizic (Carrier Thread) altui Virtual Thread!\\n   - Cand datele sosesc, thread-ul este reluat fara a bloca thread-ul de sistem de operare.\\n\\n3. Utilizare ideala:\\n   - Arhitectura clasica thread-per-request pentru servicii web cu sute de mii de cereri I/O simultane.",
    codeSnippet: `// 1. Pornire directa a unui Virtual Thread in Java 21:
Thread.startVirtualThread(() -> {
    System.out.println("Ruleaza pe Virtual Thread!");
});

// 2. ExecutorService cu Virtual Threads (un thread nou per task!):
try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
    for (int i = 0; i < 100_000; i++) {
        executor.submit(() -> {
            Thread.sleep(1000); // Nu blocheaza niciun thread OS!
            return 42;
        });
    }
} // Se inchide automat la final`,
    interviewTrap: "Virtual Threads NU sporesc viteza sarcinilor intensive de calcul CPU pur (unde numarul de nuclee fizice este factorul limitator); ele sunt o revolutie exclusiv pentru aplicatii blocante I/O.",
    keyTakeaway: "Virtual Threads sunt thread-uri usoare gestionate de JVM (Java 21), permitand milioane de operatii I/O concurente fara a bloca thread-urile sistemului de operare."
  },
  {
    id: "java-177",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este JDBC si pasii de executie ai unei interogari",
    question: "Ce reprezinta JDBC in Java si care sunt pasii standard pentru a rula o interogare pe o baza de date relationala?",
    answer: "1. Ce este JDBC (Java Database Connectivity):\\n   - API-ul standard din pachetul java.sql care defineste modul in care o aplicatie Java comunica si executa comenzi pe baze de date relationale (PostgreSQL, MySQL, Oracle).\\n\\n2. Pasii standard de executie:\\n   - Pasul 1: Incarcarea driver-ului (automat prin SPI in versiuni moderne).\\n   - Pasul 2: Stabilirea conexiunii prin DriverManager.getConnection(url, user, pass) sau un DataSource.\\n   - Pasul 3: Crearea unui obiect Statement sau PreparedStatement.\\n   - Pasul 4: Executarea interogarii (executeQuery() pentru SELECT sau executeUpdate() pentru INSERT/UPDATE/DELETE).\\n   - Pasul 5: Procesarea rezultatelor din ResultSet (bucla while (rs.next())).\\n   - Pasul 6: Inchiderea resurselor in ordine inversa (try-with-resources pe ResultSet, Statement, Connection).",
    codeSnippet: `String url = "jdbc:postgresql://localhost:5432/mydb";
String sql = "SELECT id, name FROM users";

try (Connection conn = DriverManager.getConnection(url, "user", "pass");
     Statement stmt = conn.createStatement();
     ResultSet rs = stmt.executeQuery(sql)) {

    while (rs.next()) {
        long id = rs.getLong("id");
        String name = rs.getString("name");
        System.out.println(id + ": " + name);
    }
} catch (SQLException e) {
    e.printStackTrace();
}`,
    interviewTrap: "Daca nu inchizi conexiunile si statement-urile (recomandat prin try-with-resources), vei epuiza rapid numarul maxim de conexiuni permise de baza de date (connection leak).",
    keyTakeaway: "JDBC conecteaza Java la baze de date; pasii sunt Conexiune -> Statement -> Executie -> Procesare ResultSet -> Inchidere resurse."
  },
  {
    id: "java-178",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Statement vs PreparedStatement in JDBC",
    question: "De ce PreparedStatement este intotdeauna preferat in locul unui Statement obisnuit in JDBC?",
    answer: "Aceasta este o intrebare obligatorie la orice interviu Java Junior/Mid!\\n\\n1. Prevenirea atacurilor SQL Injection (Securitate):\\n   - Statement foloseste concatenare directa de siruri de caractere. Daca un atacator introduce ghilimele si comenzi SQL (ex: ' OR '1'='1), interogarea este alterata.\\n   - PreparedStatement foloseste parametri cu semnul intrebarii (?). Valorile parametrilor sunt transmise separat de textul SQL si tratate strict ca date literale, facand SQL Injection imposibil!\\n\\n2. Performanta ridicata prin Precompilare (Caching):\\n   - Baza de date compileaza planul de executie o singura data pentru structura interogarii cu ?.\\n   - Cand rulezi aceeasi interogare de mii de ori cu valori diferite ale parametrilor, baza de date refoloseste direct planul compilat, fiind mult mai rapida decat Statement (care recompileaza la fiecare interogare).\\n\\n3. Lizibilitate: Elimina ghilimelele si concatenarile complexe de String-uri.",
    codeSnippet: `// GRESIT: Vulnerabil la SQL Injection!
String sql1 = "SELECT * FROM users WHERE email = '" + userInput + "'";
Statement stmt = conn.createStatement();
ResultSet rs1 = stmt.executeQuery(sql1);

// CORECT si SIGUR: PreparedStatement
String sql2 = "SELECT * FROM users WHERE email = ?";
try (PreparedStatement pstmt = conn.prepareStatement(sql2)) {
    pstmt.setString(1, userInput); // Tratat strict ca valoare literala!
    ResultSet rs2 = pstmt.executeQuery();
}`,
    interviewTrap: "La interviu explica ambele motive: atat securitatea (prevenirea SQL Injection), cat si performanta (precompilarea planului de executie in baza de date).",
    keyTakeaway: "PreparedStatement previne 100% atacurile SQL Injection si creste performanta bazei de date prin precompilarea planului de executie."
  },
  {
    id: "java-179",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "CallableStatement in JDBC",
    question: "Ce este CallableStatement in JDBC si cand se foloseste?",
    answer: "1. Ce este CallableStatement:\\n   - O subinterfata a lui PreparedStatement folosita special pentru executarea procedurilor stocate (Stored Procedures) si functiilor stocate definite in baza de date.\\n\\n2. Sintaxa standard:\\n   - Foloseste sintaxa de escape standard JDBC: {call procedure_name(?, ?)}.\\n\\n3. Gestionarea parametrilor IN si OUT:\\n   - Parametri IN (de intrare): se seteaza cu metode clasice (ex: setInt, setString).\\n   - Parametri OUT (de iesire): trebuie inregistrati inainte de executie cu registerOutParameter(index, java.sql.Types) si extrasi dupa executie (ex: getDouble(index)).",
    codeSnippet: `String sql = "{call get_employee_bonus(?, ?)}";

try (CallableStatement cstmt = conn.prepareCall(sql)) {
    cstmt.setLong(1, 101L); // Parametru IN: employee_id

    // Inregistrare parametru OUT: bonus_amount (FLOAT / NUMERIC)
    cstmt.registerOutParameter(2, java.sql.Types.DECIMAL);

    cstmt.execute();

    BigDecimal bonus = cstmt.getBigDecimal(2); // Extragere valoare returnata
    System.out.println("Bonus: " + bonus);
}`,
    interviewTrap: "Daca uiti sa apelezi registerOutParameter() pe un parametru de iesire inainte de cstmt.execute(), vei primi SQLException.",
    keyTakeaway: "CallableStatement se utilizeaza pentru apelarea procedurilor stocate din baza de date si gestioneaza parametri IN si OUT."
  },
  {
    id: "java-180",
    category: 'JAVA',
    difficulty: "USOR",
    title: "ResultSet in JDBC: Navigare si Indici",
    question: "Cum se parcurge un ResultSet in JDBC si de ce indicii coloanelor incep de la 1 si nu de la 0?",
    answer: "1. Navigarea cu rs.next():\\n   - La deschidere, cursorul ResultSet-ului este pozitionat chiar INAINTE de primul rand (beforeFirst).\\n   - Metoda rs.next() muta cursorul pe urmatorul rand valid si returneaza true daca mai exista un rand, sau false cand s-au terminat datele.\\n   - De aceea se parcurge intotdeauna cu bucla while (rs.next()).\\n\\n2. De ce indicii coloanelor incep de la 1:\\n   - Standardul SQL (ANSI SQL) defineste coloanele incepand cu indexul 1, nu 0 ca in array-urile de programare din C sau Java.\\n   - Prin urmare, rs.getString(1) extrage prima coloana! Daca scrii rs.getString(0), JDBC arunca SQLException: Column Index out of range.\\n\\n3. Nume de coloana vs Index:\\n   - rs.getString(\"email\") este mai sigur la refactoring decat rs.getString(2).",
    codeSnippet: `try (ResultSet rs = pstmt.executeQuery()) {
    while (rs.next()) {
        // Indicii incep de la 1 in JDBC!
        long id = rs.getLong(1);
        String name = rs.getString(2);

        // Sau dupa numele coloanei (mai clar):
        String email = rs.getString("email");
    }
}`,
    interviewTrap: "Daca incerci sa citesti rs.getString(...) inainte de a apela macar o data rs.next(), vei primi SQLException: \"Before start of result set\".",
    keyTakeaway: "ResultSet necesita apelul next() pentru mutarea pe primul rand; indicii coloanelor incep de la 1, conform standardului SQL."
  },
  {
    id: "java-181",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Tranzactii manuale in JDBC (ACID)",
    question: "Cum gestionezi o tranzactie manuala in JDBC folosind setAutoCommit, commit si rollback?",
    answer: "1. Comportamentul implicit al JDBC:\\n   - In mod implicit, conexiunea are auto-commit activat (conn.getAutoCommit() == true).\\n   - Fiecare comanda SQL executata este comisa automat si imediat ca o tranzactie separata in baza de date.\\n\\n2. Cum creezi o Tranzactie compusa (Atomicitate):\\n   - Dezactivezi auto-commit: conn.setAutoCommit(false).\\n   - Executi comenzile SQL din cadrul tranzactiei (ex: scadere bani cont A, adaugare bani cont B).\\n   - Daca toate au reusit: apelezi conn.commit() pentru a salva modificarile definitiv.\\n   - Daca oricare comanda a aruncat o exceptie: apelezi conn.rollback() in blocul catch pentru a anula toate operatiile si a reveni la starea initiala.\\n   - In blocul finally restaurezi conn.setAutoCommit(true).",
    codeSnippet: `try (Connection conn = dataSource.getConnection()) {
    conn.setAutoCommit(false); // 1. Pornim tranzactia manuala

    try (PreparedStatement withdraw = conn.prepareStatement("UPDATE accounts SET bal = bal - 100 WHERE id = 1");
         PreparedStatement deposit  = conn.prepareStatement("UPDATE accounts SET bal = bal + 100 WHERE id = 2")) {

        withdraw.executeUpdate();
        deposit.executeUpdate();

        conn.commit(); // 2. Confirmam salvarea daca totul e OK
    } catch (SQLException e) {
        conn.rollback(); // 3. Anulam tot in caz de eroare!
        throw e;
    } finally {
        conn.setAutoCommit(true); // Restabilim starea
    }
}`,
    interviewTrap: "Daca uiti sa apelezi conn.rollback() in catch si conexiunea este returnata intr-un connection pool, tranzactia neterminata poate cauza lock-uri pe tabele si date inconsistente pentru urmatorii clienti.",
    keyTakeaway: "Tranzactiile manuale in JDBC folosesc setAutoCommit(false), urmat de commit() in caz de succes si rollback() in caz de eroare."
  },
  {
    id: "java-182",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Connection Pooling in Java (HikariCP)",
    question: "Ce este un Connection Pool (ex: HikariCP) si de ce este esential in aplicatiile backend enterprise?",
    answer: "1. De ce deschiderea de conexiuni noi la fiecare request este lenta:\\n   - Deschiderea unei conexiuni fizice TCP catre baza de date presupune: TCP 3-way handshake, autentificare SSL/TLS, validare username/parola si alocare de sesiune in serverul DB.\\n   - Aceasta operatie poate dura intre 50ms si 300ms per request, distrugand performanta aplicatiei.\\n\\n2. Ce face un Connection Pool:\\n   - La pornirea aplicatiei, creaza si mentine un set de conexiuni fizice gata deschise (ex: 10 conexiuni).\\n   - Cand o metoda cere o conexiune (dataSource.getConnection()), primeste instantaneu o conexiune gata deschisa din pool in doar cateva microsecunde.\\n   - Cand apelezi conn.close(), conexiunea NU se inchide fizic pe retea! Metoda close() a fost suprascrisa (wrapper) pentru a returna conexiunea inapoi in pool pentru a fi refolosita.\\n\\n3. HikariCP:\\n   - Cel mai rapid si mai utilizat connection pool in ecosistemul Java / Spring Boot modern.",
    codeSnippet: `// In Spring Boot, HikariCP este default-ul:
HikariConfig config = new HikariConfig();
config.setJdbcUrl("jdbc:postgresql://localhost:5432/mydb");
config.setUsername("user");
config.setPassword("secret");
config.setMaximumPoolSize(10); // Maxim 10 conexiuni active

HikariDataSource dataSource = new HikariDataSource(config);

try (Connection conn = dataSource.getConnection()) {
    // Luat instantaneu din pool!
    // conn.close() la final doar returneaza conexiunea in pool
}`,
    interviewTrap: "Apelul connection.close() pe o conexiune obtinuta dintr-un DataSource cu connection pool NU inchide conexiunea la baza de date, ci doar o returneaza ca disponibila in pool.",
    keyTakeaway: "HikariCP mentine conexiuni pre-deschise, evitand negocierea TCP costisitoare la fiecare cerere HTTP si returnand conexiunile la close()."
  },
  {
    id: "java-183",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Design Pattern: Singleton in Java",
    question: "Ce este Singleton si care sunt cele mai sigure si recomandate moduri de implementare thread-safe in Java?",
    answer: "1. Ce este Singleton:\\n   - Un sablon creational (GoF) care asigura ca o clasa are o SINGURA instanta in toata aplicatia si ofera un punct global de acces la ea.\\n   - Elementele de baza: constructor strict private, camp static pentru instanta, metoda publica statica getInstance().\\n\\n2. Implementarea 1: Initialization-on-Demand Holder (Recomandata):\\n   - Se bazeaza pe mecanismul de incarcare al claselor din JVM (Class specifications). Clasa interna statica Holder este incarcata DOAR la primul apel al getInstance(), fiind 100% thread-safe si lazy fara niciun cuvant cheie synchronized!\\n\\n3. Implementarea 2: Enum Singleton (Joshua Bloch - Effective Java):\\n   - public enum AppConfig { INSTANCE; }\\n   - Este cea mai sigura implementare impotriva atacurilor prin Java Reflection si serializare.",
    codeSnippet: `// Varianta moderna "Holder" (Thread-safe, Lazy, Zero Lock Overhead):
public class DatabaseManager {
    private DatabaseManager() {
        // Previne instantierea prin Reflection:
        if (Holder.INSTANCE != null) throw new IllegalStateException();
    }

    private static class Holder {
        private static final DatabaseManager INSTANCE = new DatabaseManager();
    }

    public static DatabaseManager getInstance() {
        return Holder.INSTANCE;
    }
}

// Varianta Enum (recomandata de Joshua Bloch):
public enum EasySingleton {
    INSTANCE;
    public void doWork() { /* operatii */ }
}`,
    interviewTrap: "Vechiul Double-Checked Locking (DCL) necesita obligatoriu ca variabila de instanta sa fie marcata volatile, altfel alte thread-uri pot vedea un obiect partial initializat din cauza reordonarii de instructiuni.",
    keyTakeaway: "Singleton asigura o instanta unica; cele mai bune implementari sunt Bill Pugh Holder Pattern si Enum Singleton."
  },
  {
    id: "java-184",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Factory Method",
    question: "Ce este Factory Method Pattern si de ce preferam sa delegam instantierea unei fabrici in loc de a apela new direct?",
    answer: "1. Ce este Factory Method:\\n   - Un sablon creational care defineste o interfata sau o metoda pentru crearea unui obiect, lasand subclasele sau fabrica sa decida ce clasa concreta sa instantieze.\\n\\n2. De ce este superior apelului direct new MyClass():\\n   - Decuplare (Loose Coupling): Clientul depinde doar de interfata abstracta (ex: Notification), nu de clasele concrete (EmailNotification, SmsNotification).\\n   - Extensibilitate (Open/Closed Principle): Daca adaugi un nou tip de notificare (ex: PushNotification), modifici doar fabrica, fara a atinge zecile de clase client care folosesc interfata.\\n   - Incapsularea complexitatii de creare: Permite ascunderea parametrilor greoi de configurare necesari la crearea obiectului.",
    codeSnippet: `public interface Notification { void send(String msg); }
public class EmailNotification implements Notification { public void send(String msg) { ... } }
public class SmsNotification implements Notification { public void send(String msg) { ... } }

// Fabrica:
public class NotificationFactory {
    public static Notification createNotification(String type) {
        return switch (type.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "SMS" -> new SmsNotification();
            default -> throw new IllegalArgumentException("Tip necunoscut: " + type);
        };
    }
}`,
    interviewTrap: "Daca creezi obiecte concrete cu new peste tot in codul de business, creezi o legatura rigida care face testarea unitara cu mock-uri foarte anevoioasa.",
    keyTakeaway: "Factory Method incapsuleaza logica de instantiere, decupland codul client de clasele concrete conform principiului Dependency Inversion."
  },
  {
    id: "java-185",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Builder",
    question: "Ce problema rezolva Builder Pattern si cum se implementeaza o clasa Builder cu Fluent API?",
    answer: "1. Ce problema rezolva (Constructor Telescopic Anti-Pattern):\\n   - Cand o clasa are multi parametri (ex: 8-10 campuri), dintre care majoritatea sunt optionali, esti fortat sa creezi zeci de constructori supraincarcati cu combinatii diferite de parametri sau sa transmiti liste lungi de null (ex: new User(\"Ion\", null, null, 25, null, true)).\\n   - Este greu de citit si usor sa inversezi ordinea argumentelor de acelasi tip (ex: doua String-uri: firstName, lastName).\\n\\n2. Ce aduce Builder:\\n   - Permite crearea pas cu pas a obiectelor complexe folosind un Fluent API (metode de chaining return this).\\n   - Permite mentinerea obiectului tinta ca fiind STRICT IMUTABIL (campuri private final si fara setteri!).\\n   - Biblioteca Lombok ofera adnotarea @Builder care genereaza tot acest cod automat.",
    codeSnippet: `public class UserProfile {
    private final String username; // obligatoriu
    private final String email;    // obligatoriu
    private final int age;         // optional
    private final String phone;    // optional

    private UserProfile(Builder b) {
        this.username = b.username;
        this.email = b.email;
        this.age = b.age;
        this.phone = b.phone;
    }

    public static class Builder {
        private final String username;
        private final String email;
        private int age;
        private String phone;

        public Builder(String username, String email) {
            this.username = username;
            this.email = email;
        }
        public Builder age(int age) { this.age = age; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public UserProfile build() { return new UserProfile(this); }
    }
}

// Utilizare eleganta si lizibila:
UserProfile user = new UserProfile.Builder("mihai", "m@test.com")
    .age(28)
    .phone("0712345678")
    .build();`,
    interviewTrap: "Builder este recomandat in special cand obiectul trebuie sa fie imutabil. Daca ai folosi un constructor default + setteri, obiectul ar ramane mutabil pe toata durata aplicatiei.",
    keyTakeaway: "Builder construieste obiecte complexe cu multi parametri optionali in mod fluent si lizibil, pastrand imutabilitatea obiectului final."
  },
  {
    id: "java-186",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Design Pattern: Prototype si Capcana Cloneable",
    question: "Ce este Prototype Pattern, ce face interfata Cloneable si de ce copy constructorul este mult mai recomandat?",
    answer: "1. Ce este Prototype Pattern:\\n   - Un sablon creational utilizat pentru a crea obiecte noi prin clonarea (copierea) unei instante existente gata configurate (prototip), in loc de recrearea de la zero cu operatii costisitoare.\\n\\n2. Capcana interfetei Cloneable si a metodei clone():\\n   - Cloneable este o interfata marker cu un design defectuos recunoscut oficial: metoda clone() este declarata in Object ca protected si arunca CloneNotSupportedException!\\n   - In mod implicit, super.clone() realizeaza doar un SHALLOW COPY (copie superficiala): copiaza doar referintele obiectelor continute, nu si obiectele din interior! Daca obiectul clonat modifica o lista interna, o va modifica si in original!\\n\\n3. Ce se recomanda in schimb (Joshua Bloch):\\n   - Copy Constructor: public User(User other) { ... }\\n   - Copy Factory: public static User newInstance(User other) { ... }\\n   - Simplu, sigur, fara exceptii verificate si permite realizarea unui Deep Copy explicit.",
    codeSnippet: `// Abordarea moderna recomandata: Copy Constructor
public class Address {
    private String city;
    public Address(Address other) { this.city = other.city; }
}

public class Customer {
    private String name;
    private Address address;

    // Copy Constructor curat (Deep Copy):
    public Customer(Customer other) {
        this.name = other.name;
        this.address = new Address(other.address); // copie noua profunda!
    }
}`,
    interviewTrap: "Evita utilizarea interfetei Cloneable in Java modern. In interviuri, argumenteaza ca Joshua Bloch (autorul cartii Effective Java) sfatuieste folosirea unui Copy Constructor.",
    keyTakeaway: "Prototype cloneaza instante existente; prefera intotdeauna Copy Constructor in loc de defectuoasa interfata Cloneable."
  },
  {
    id: "java-187",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Adapter",
    question: "Ce este Adapter Pattern si cum permite colaborarea intre doua interfete incompatibile?",
    answer: "1. Ce este Adapter Pattern:\\n   - Un sablon structural (GoF) care converteste interfata unei clase intr-o alta interfata pe care o asteapta clientul.\\n   - Permite claselor cu interfete incompatibile sa lucreze impreuna, exact ca un adaptor de priza de calatorie care conecteaza un stecher european la o priza americana.\\n\\n2. Cum se implementeaza (Object Adapter):\\n   - Creezi o clasa Adapter care implementeaza interfata tinta asteptata de client.\\n   - Adapter-ul primeste prin compozitie instanta clasei incompatibile (Adaptee) si traduce apelurile de metode catre metodele specifice ale acesteia.",
    codeSnippet: `// Interfata dorita de aplicatie:
public interface ModernPayment {
    void payInEur(double amount);
}

// Serviciu extern legacy incompatibil:
public class LegacyPayPalService {
    public void makePaymentUSD(double usdAmount) { /* plata */ }
}

// Adapter:
public class PayPalAdapter implements ModernPayment {
    private final LegacyPayPalService legacyService;

    public PayPalAdapter(LegacyPayPalService legacyService) {
        this.legacyService = legacyService;
    }

    @Override
    public void payInEur(double amount) {
        double usd = amount * 1.08; // conversie
        legacyService.makePaymentUSD(usd); // delegare catre legacy
    }
}`,
    interviewTrap: "Un exemplu clasic din biblioteca Java standard este Arrays.asList(array), care adapteaza un array nativ T[] la interfata List<T>.",
    keyTakeaway: "Adapter transpune o interfata incompatibila intr-o forma ceruta de client, folosind delegarea prin compozitie."
  },
  {
    id: "java-188",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Decorator",
    question: "Ce este Decorator Pattern si cum este el folosit in clasele din pachetul java.io (BufferedReader)?",
    answer: "1. Ce este Decorator Pattern:\\n   - Un sablon structural care permite adaugarea dinamica de noi responsabilitati si functionalitati unui obiect, fara a folosi mostenirea (extinderea clasei).\\n   - Respecta principiul Open/Closed (deschis pentru extensie, inchis pentru modificare).\\n\\n2. Cum se construieste:\\n   - Decoratorul implementeaza aceeasi interfata cu a obiectului decorat si contine o referinta catre acelasi tip de interfata (compozitie).\\n   - Adauga propriul comportament inainte sau dupa delegarea catre obiectul original.\\n\\n3. Exemplu celebru din Java SDK:\\n   - Pachetul java.io este construit in intregime pe Decorator:\\n     BufferedReader reader = new BufferedReader(new FileReader(\"file.txt\"));\\n     - FileReader citeste caractere.\\n     - BufferedReader decoreaza FileReader-ul cu un buffer de memorie in RAM, fara ca FileReader sa stie!",
    codeSnippet: `public interface Coffee { double getCost(); }
public class SimpleCoffee implements Coffee { public double getCost() { return 10.0; } }

// Decorator abstract:
public abstract class CoffeeDecorator implements Coffee {
    protected final Coffee decoratedCoffee;
    public CoffeeDecorator(Coffee c) { this.decoratedCoffee = c; }
    public double getCost() { return decoratedCoffee.getCost(); }
}

// Decorator concret:
public class MilkDecorator extends CoffeeDecorator {
    public MilkDecorator(Coffee c) { super(c); }
    @Override
    public double getCost() { return super.getCost() + 3.0; }
}

// Utilizare:
Coffee myCoffee = new MilkDecorator(new SimpleCoffee()); // Cost: 13.0`,
    interviewTrap: "Mostenirea clasica este statica la compilare; Decoratorul adauga comportamente flexibil la runtime prin combinare (invelire) de obiecte.",
    keyTakeaway: "Decorator adauga functionalitati dinamice prin compozitie si invelire (wrapping), utilizat masiv in java.io."
  },
  {
    id: "java-189",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Design Pattern: Proxy in Java",
    question: "Ce este Proxy Pattern si cum este folosit in framework-ul Spring pentru tranzactii (@Transactional) si Securitate?",
    answer: "1. Ce este Proxy Pattern:\\n   - Un sablon structural care ofera un obiect substitut (place-holder / intermediar) pentru un alt obiect pentru a controla si intercepta accesul la acesta.\\n\\n2. Tipuri comune de Proxy:\\n   - Virtual Proxy (Lazy Loading): amana crearea unui obiect costisitor pana la primul acces (utilizat masiv in Hibernate pentru entitati @ManyToOne lazy).\\n   - Protection Proxy: verifica permisiunile de securitate inainte de a permite accesul.\\n   - Remote Proxy: reprezinta un obiect aflat pe o alta masina in retea.\\n\\n3. Cum foloseste Spring Boot Dynamic Proxies:\\n   - Cand adaugi @Transactional sau @Secured pe o metoda de Service, Spring nu apeleaza direct obiectul tau, ci creeaza un Proxy (folosind CGLIB sau JDK Dynamic Proxy).\\n   - Proxy-ul intercepteaza apelul, deschide tranzactia (conn.setAutoCommit(false)), apeleaza metoda ta, si apoi face commit sau rollback inainte de a intoarce rezultatul!",
    codeSnippet: `// Cand declari:
@Service
public class OrderService {
    @Transactional
    public void createOrder() { /* logica de business */ }
}

// In spate, Spring ruleaza un Proxy similar cu:
public class OrderServiceProxy extends OrderService {
    @Override
    public void createOrder() {
        transactionManager.begin();
        try {
            super.createOrder(); // Apel la metoda ta reala
            transactionManager.commit();
        } catch (Exception e) {
            transactionManager.rollback();
            throw e;
        }
    }
}`,
    interviewTrap: "Daca o metoda din interiorul aceleiasi clase apeleaza o alta metoda adnotata cu @Transactional din aceeasi clasa (self-invocation: this.methodB()), Proxy-ul este ocolit si tranzactia NU va porni!",
    keyTakeaway: "Proxy controleaza si intercepteaza accesul la un obiect; sta la baza arhitecturii Spring AOP (@Transactional, @Cacheable, @Async)."
  },
  {
    id: "java-190",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Strategy",
    question: "Ce este Strategy Pattern si cum permite schimbarea algoritmilor la runtime?",
    answer: "1. Ce este Strategy Pattern:\\n   - Un sablon comportamental (Behavioral) care defineste o familie de algoritmi, incapsuleaza fiecare algoritm intr-o clasa separata si le face interschimbabile la runtime.\\n   - Permite algoritmului sa varieze independent de clientul care il utilizeaza.\\n\\n2. Cum elimina structurile urate de if-else / switch:\\n   - In loc sa ai un switch urias de 200 de linii pentru calculul metodelor de plata sau de livrare, creezi o interfata PaymentStrategy si implementari separate (CreditCardPayment, PayPalPayment, CryptoPayment).\\n   - Contextul primeste strategia dorita prin injectie de dependinte (Dependency Injection).\\n\\n3. Exemplu din Java standard: Comparator<T> este un Strategy Pattern clasic!",
    codeSnippet: `public interface PaymentStrategy { void pay(double amount); }
public class CardStrategy implements PaymentStrategy { public void pay(double amount) { ... } }
public class PayPalStrategy implements PaymentStrategy { public void pay(double amount) { ... } }

public class ShoppingCart {
    private PaymentStrategy strategy;

    public void setStrategy(PaymentStrategy s) { this.strategy = s; }
    public void checkout(double total) {
        strategy.pay(total); // Algoritmul variaza la runtime!
    }
}`,
    interviewTrap: "In Java 8+, expresiile Lambda si method references sunt de fapt implementari directe si concise de Strategy Pattern (ex: list.sort((a,b) -> a - b)).",
    keyTakeaway: "Strategy incapsuleaza algoritmi in clase interschimbabile, eliminand lanturile stufoase de if-else/switch."
  },
  {
    id: "java-191",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Observer",
    question: "Ce este Observer Pattern si cum functioneaza relatia Publish-Subscribe (Subiect - Observatori)?",
    answer: "1. Ce este Observer Pattern:\\n   - Un sablon comportamental care defineste o dependenta de tip \"one-to-many\" intre obiecte, astfel incat atunci cand un obiect (Subiectul / Subject / Publisher) isi schimba starea, toti dependentii sai (Observatorii / Observers / Subscribers) sunt notificati si actualizati automat.\\n\\n2. Componente:\\n   - Subject: mentine o lista de observatori si ofera metode de abonare: attach(Observer), detach(Observer) si notifyObservers().\\n   - Observer: interfata cu o metoda de notificare (ex: update(event)).\\n\\n3. Utilizari comune:\\n   - Event Listeners in UI (onClick, onChange).\\n   - Spring ApplicationEvent si @EventListener.\\n   - Arhitecturi asincrone si Reactive Streams.",
    codeSnippet: `public interface Observer { void update(String news); }

public class NewsAgency {
    private final List<Observer> observers = new ArrayList<>();

    public void subscribe(Observer obs) { observers.add(obs); }
    public void broadcast(String news) {
        for (Observer obs : observers) {
            obs.update(news); // Notifica toti abonatii
        }
    }
}`,
    interviewTrap: "Daca observatorii se aboneaza dar uita sa se dezaboneze cand nu mai sunt folositi, apar scurgeri de memorie cunoscute ca \"Lapsed Listener Problem\".",
    keyTakeaway: "Observer stabileste o relatie 1-la-multi de notificare automata a schimbarilor de stare catre abonati."
  },
  {
    id: "java-192",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Design Pattern: Template Method",
    question: "Ce este Template Method Pattern si cum utilizeaza mostenirea pentru a defini scheletul unui algoritm?",
    answer: "1. Ce este Template Method:\\n   - Un sablon comportamental care defineste scheletul (structura pasilor) unui algoritm intr-o metoda dintr-o clasa parinte abstracta, delegand implementarea pasilor individuali catre subclase.\\n   - Permite subclaselor sa redefineasca anumiti pasi ai algoritmului fara a altera structura generala a acestuia.\\n\\n2. Regula Hollywood (\"Don't call us, we'll call you\"):\\n   - Clasa parinte apeleaza metodele abstracte ale copilului la momentul potrivit in flux.\\n   - Metoda principala de template este adesea declarata final pentru a preveni suprascrierea structurii fluxului.",
    codeSnippet: `public abstract class DataProcessor {
    // Metoda Template principala (nu poate fi modificata!):
    public final void process() {
        readData();
        processData();
        writeData();
    }

    protected abstract void readData();
    protected abstract void processData();

    // Pas comun gata implementat:
    protected void writeData() {
        System.out.println("Salvare in baza de date standard.");
    }
}

public class ExcelProcessor extends DataProcessor {
    @Override protected void readData() { System.out.println("Citire Excel"); }
    @Override protected void processData() { System.out.println("Parsare coloane"); }
}`,
    interviewTrap: "Nu confunda Template Method (bazat pe mostenire) cu Strategy (bazat pe compozitie). Template Method schimba parti dintr-un algoritm la compilare, Strategy inlocuieste intregul algoritm la runtime.",
    keyTakeaway: "Template Method defineste scheletul neschimbat al unui algoritm intr-o metoda finala de baza, lasand detaliile pe seama subclaselor."
  },
  {
    id: "java-193",
    category: 'JAVA',
    difficulty: "USOR",
    title: "SOLID: Single Responsibility Principle (SRP)",
    question: "Ce reprezinta Single Responsibility Principle (SRP) si care este definitia lui Robert C. Martin?",
    answer: "1. Definitia SRP (Robert C. Martin - Uncle Bob):\\n   - \"O clasa ar trebui sa aiba o singura responsabilitate si un singur motiv de a fi schimbata\" (A class should have one, and only one, reason to change).\\n\\n2. Ce inseamna in practica:\\n   - O clasa nu trebuie sa fie un \"God Object\" care face de toate: sa contina logica de business, sa comunice cu baza de date, sa formateze raspunsul JSON si sa trimita email-uri!\\n   - Fiecare functionalitate trebuie separata in clase distincte: UserService (business), UserRepository (acces date), EmailService (notificari).\\n\\n3. Beneficii:\\n   - Clase mici, usor de inteles, testat unitar si intretinut pe termen lung.",
    codeSnippet: `// GRESIT (Violeaza SRP - prea multe motive de schimbare):
public class UserManager {
    public void saveUser(User u) { /* DB logic */ }
    public void sendEmail(User u) { /* SMTP logic */ }
    public void generateReportPdf(User u) { /* PDF logic */ }
}

// CORECT (SRP respectat):
public class UserRepository { public void save(User u) {} }
public class EmailService { public void sendWelcome(User u) {} }
public class UserReportService { public void generatePdf(User u) {} }`,
    interviewTrap: "O \"responsabilitate\" nu inseamna o singura metoda, ci un singur domeniu de expertiza sau actor/utilizator de business pentru care lucreaza clasa.",
    keyTakeaway: "SRP cere ca fiecare clasa sa aiba o singura responsabilitate bine delimitata si un singur motiv de modificare."
  },
  {
    id: "java-194",
    category: 'JAVA',
    difficulty: "USOR",
    title: "SOLID: Open/Closed Principle (OCP)",
    question: "Ce spune Open/Closed Principle (OCP) si cum se obtine in Java prin polimorfism?",
    answer: "1. Definitia OCP:\\n   - \"Entitatile software (clase, module, functii) ar trebui sa fie DESCHISE pentru EXTENSIE, dar INCHISE pentru MODIFICARE\" (Open for extension, closed for modification).\\n\\n2. Ce inseamna in practica:\\n   - Cand trebuie sa adaugi o functionalitate noua in aplicatie, ar trebui sa poti face asta prin ADOUGAREA DE COD NOU (clase noi, implementari noi de interfata), FARA A MODIFICA codul existent gata testat si functional.\\n\\n3. Cum se obtine in Java:\\n   - Prin intermediul interfetelor si al abstractizarii (polimorfism). In loc de lanturi if-else pe tipul obiectului, apelezi o metoda din interfata comuna.",
    codeSnippet: `// Incalcarea OCP: la fiecare discount nou trebuie sa modifici clasa existenta!
// if (type.equals("VIP")) return price * 0.8;

// Respectarea OCP:
public interface DiscountStrategy {
    double apply(double price);
}

public class VipDiscount implements DiscountStrategy {
    public double apply(double price) { return price * 0.8; }
}

// Functionalitate noua adaugata fara a modifica codul existent:
public class BlackFridayDiscount implements DiscountStrategy {
    public double apply(double price) { return price * 0.5; }
}`,
    interviewTrap: "Daca observi un bloc mare de if-else sau switch care testeaza tipul obiectului si necesita editare la fiecare nou feature, principiul OCP este violat.",
    keyTakeaway: "OCP cere ca extinderea comportamentului sa se faca prin clase si implementari noi, fara modificarea codului existent."
  },
  {
    id: "java-195",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "SOLID: Liskov Substitution Principle (LSP)",
    question: "Ce stipuleaza Liskov Substitution Principle (LSP) si de ce exemplul Clasa Dreptunghi vs Patrat este clasic?",
    answer: "1. Definitia LSP (Barbara Liskov):\\n   - \"Obiectele dintr-un program ar trebui sa poata fi inlocuite cu instante ale subclaselor lor fara a altera corectitudinea si functionarea programului\".\\n   - Cu alte cuvinte: o clasa copil trebuie sa respecte contractul clasei parinte si sa nu aiba comportamente neasteptate.\\n\\n2. Exemplul clasic Dreptunghi (Rectangle) vs Patrat (Square):\\n   - Matematic, un patrat este un dreptunghi. Insa in OOP, daca clasa Square extinde Rectangle si suprascrie setWidth(w) { this.width = w; this.height = w; }:\\n   - Daca un client primeste un Rectangle si apeleaza rect.setWidth(5); rect.setHeight(10);, se asteapta ca aria sa fie 50!\\n   - Daca obiectul real transmis este un Square, aria va fi 100! Comportamentul contractului a fost rupt, violand LSP!\\n\\n3. Regula:\\n   - Subclasele nu trebuie sa arunce exceptii neasteptate pe metodele mostenite si sa nu relaxeze/stranga preconditiile.",
    codeSnippet: `// Incalcare clasica de LSP:
public class Rectangle {
    protected int width, height;
    public void setWidth(int w) { this.width = w; }
    public void setHeight(int h) { this.height = h; }
    public int getArea() { return width * height; }
}

public class Square extends Rectangle {
    @Override
    public void setWidth(int w) { this.width = w; this.height = w; } // Rupe contractul!
}`,
    interviewTrap: "Nu mosteni o clasa doar pentru a refolosi cod daca relatia IS-A nu pastreaza comportamentul logic al contractului in toate contextele.",
    keyTakeaway: "LSP cere ca orice subclasa sa poata inlocui clasa parinte fara a strica logica sau contractul asteptat de client."
  },
  {
    id: "java-196",
    category: 'JAVA',
    difficulty: "USOR",
    title: "SOLID: Interface Segregation Principle (ISP)",
    question: "Ce presupune Interface Segregation Principle (ISP) si de ce sunt preferate interfetele mici si specifice?",
    answer: "1. Definitia ISP:\\n   - \"Niciun client nu ar trebui fortat sa depinda de metode pe care nu le utilizeaza\" (Clients should not be forced to depend upon interfaces that they do not use).\\n\\n2. Ce inseamna in practica:\\n   - Este mult mai bine sa ai mai multe interfete mici, specializate si cu rol clar (Single Role Interfaces) decat o singura interfata gigant (\"Fat Interface\").\\n   - Daca o interfata are 20 de metode si o clasa are nevoie doar de 2, acea clasa este fortata sa implementeze celelalte 18 metode cu corp gol sau aruncand UnsupportedOperationException!\\n\\n3. Exemplu din Java:\\n   - In loc de o interfata monolitica, Java standard are interfete fine: AutoCloseable, Readable, Appendable, Comparable.",
    codeSnippet: `// GRESIT: Interfata monolitica (violeaza ISP)
public interface Worker {
    void work();
    void eat(); // Un robot nu mananca!
}

// CORECT: Interfete segregate (respecta ISP)
public interface Workable { void work(); }
public interface Feedable { void eat(); }

public class HumanWorker implements Workable, Feedable {
    public void work() { /* lucreaza */ }
    public void eat() { /* mananca */ }
}

public class RobotWorker implements Workable {
    public void work() { /* lucreaza fara sa fie fortat sa implementeze eat()! */ }
}`,
    interviewTrap: "Daca o clasa implementeaza o metoda aruncand UnsupportedOperationException(\"Not implemented\"), acesta este cel mai clar semn de violare a principiului ISP.",
    keyTakeaway: "ISP recomanda interfete mici si specifice pe roluri in locul interfetelor mari si incarcate cu metode inutile."
  },
  {
    id: "java-197",
    category: 'JAVA',
    difficulty: "USOR",
    title: "SOLID: Dependency Inversion Principle (DIP)",
    question: "Ce este Dependency Inversion Principle (DIP) si cum relationeaza cu Dependency Injection in Spring?",
    answer: "1. Definitia DIP:\\n   - 1. Modulele de nivel inalt nu ar trebui sa depinda de modulele de nivel scazut. Ambele ar trebui sa depinda de abstractizari (interfete).\\n   - 2. Abstractizarile nu ar trebui sa depinda de detalii. Detaliile (implementarile concrete) ar trebui sa depinda de abstractizari.\\n\\n2. Relatia cu Dependency Injection (DI) in Spring:\\n   - DIP este un principiu conceptual de design software.\\n   - Dependency Injection (DI) si Inversion of Control (IoC) sunt mecanismele practice prin care aplici acest principiu!\\n   - In loc ca un UserService sa instantieze new PostgresUserRepository() direct (cuplare stransa), clasa UserService depinde doar de interfata UserRepository, iar Spring ii injecteaza implementarea la runtime (@Autowired / constructor injection).",
    codeSnippet: `// GRESIT (Modul de nivel inalt depinde direct de detaliu concret):
public class OrderService {
    private MySqlDatabase database = new MySqlDatabase(); // Cuplare rigida!
}

// CORECT (Ambele depind de interfata Database):
public interface Database { void save(Order o); }

public class OrderService {
    private final Database database; // Depinde de interfata

    // Injectat prin constructor (DIP respectat!):
    public OrderService(Database database) {
        this.database = database;
    }
}`,
    interviewTrap: "Nu confunda Dependency Inversion (principiul arhitectural) cu Dependency Injection (tehnica de a pasa dependintele prin constructor).",
    keyTakeaway: "DIP impune ca modulele de business sa depinda de interfete abstracte si nu de clase concrete specifice."
  },
  {
    id: "java-198",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Principiile DRY, KISS si YAGNI",
    question: "Ce inseamna acronimele DRY, KISS si YAGNI si de ce sunt principii fundamentale de Clean Code?",
    answer: "1. DRY (Don't Repeat Yourself):\\n   - Fiecare bucata de cunostinta sau logica de business trebuie sa aiba o reprezentare unica si neambigua in sistem.\\n   - Evita duplicarea de cod: extrage logica repetitiva in metode, utilitare sau clase reutilizabile. Daca apare un bug in logica duplicata, trebuie sa il repari in 10 locuri diferite!\\n\\n2. KISS (Keep It Simple, Stupid):\\n   - Cele mai bune sisteme sunt cele care raman cat mai simple posibile.\\n   - Evita solutiile ultra-complexe, ingineria exagerata (over-engineering) si sintaxa criptica doar pentru a parea inteligent. Codul este citit de 10 ori mai mult decat este scris!\\n\\n3. YAGNI (You Aren't Gonna Need It):\\n   - Nu implementa functionalitati, flexibilitati ipotetice sau campuri viitoare astazi, doar pe presupunerea ca \"s-ar putea sa avem nevoie de ele candva\".\\n   - Construieste doar ce este cerut acum.",
    codeSnippet: `// Incalcare YAGNI / KISS:
// Crearea a 5 layere de abstractizare si fabrici pentru o simpla salvare in memorie!

// Respectare KISS:
public String formatFullName(String first, String last) {
    return first + " " + last;
}`,
    interviewTrap: "Uneori aplicarea oarba a lui DRY poate duce la cuplare prematura intre module diferite (accidental duplication). Pastreaza echilibrul cu KISS.",
    keyTakeaway: "DRY elimina codul duplicat; KISS pastreaza solutiile simple; YAGNI previne adaugarea de complexitate inutila bazata pe presupuneri."
  },
  {
    id: "java-199",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Ce este Java Reflection API si cand este utilizat?",
    question: "Ce reprezinta mecanismul de Reflection in Java si de ce este atat de intens folosit de framework-uri ca Spring, Jackson sau JUnit?",
    answer: "1. Ce este Reflection (java.lang.reflect):\\n   - Capacitatea unui program Java de a inspecta, analiza si modifica la runtime structura interna a claselor, interfetelor, campurilor si metodelor, chiar si a celor private!\\n\\n2. Cum il folosesc marile framework-uri:\\n   - Spring Framework: scaneaza adnotarile (@Component, @Autowired, @Service) la runtime si instantiaza clasele prin reflexie (clazz.getDeclaredConstructor().newInstance()).\\n   - Jackson / Gson: serializeaza si deserializeaza obiecte in JSON citind direct campurile private ale claselor tale DTO fara setteri.\\n   - JUnit: descopera automat toate metodele marcate cu adnotarea @Test si le apeleaza la rularea testelor.\\n\\n3. Dezavantaje majore ale reflexiei:\\n   - Performanta mai lenta decat apelul direct de cod (ocoleste optimizarile JIT).\\n   - Sparge incapsularea (poate accesa campuri private cu setAccessible(true)).\\n   - Lipsa verificarii la compilare (erorile apar doar la runtime ca NoSuchMethodException).",
    codeSnippet: `// Inspectarea unei clase la runtime:
Class<?> clazz = Class.forName("com.example.User");

// Afiseaza toate metodele declarate:
for (Method m : clazz.getDeclaredMethods()) {
    System.out.println("Metoda: " + m.getName());
}

// Apelare dinamica a unui constructor:
Object instance = clazz.getDeclaredConstructor().newInstance();`,
    interviewTrap: "In Java modern (Java 9+ Modules), mecanismul de module (JPMS) blocheaza accesul reflexiv pe campuri private din alte module daca pachetul nu este declarat ca \"opens\".",
    keyTakeaway: "Reflection inspecteaza si apeleaza clase la runtime; sta la baza framework-urilor moderne (Spring, Jackson, JUnit), dar are cost de performanta."
  },
  {
    id: "java-200",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Inspectarea claselor cu Reflection: getMethods vs getDeclaredMethods",
    question: "Care este diferenta dintre getMethods() si getDeclaredMethods() in clasa java.lang.Class?",
    answer: "1. clazz.getMethods():\\n   - Returneaza TOATE metodele PUBLICE ale clasei, INCLUSIV metodele publice mostenite din clasele parinte si interfete (ex: toString(), equals(), hashCode() mostenite din Object).\\n   - Nu returneaza metode private sau protected.\\n\\n2. clazz.getDeclaredMethods():\\n   - Returneaza TOATE metodele declarate DIRECT in clasa curenta (indiferent daca sunt public, protected, package-private sau private!).\\n   - NU include metodele mostenite din clasele parinte.\\n\\n3. Aceeasi regula se aplica si pentru getFields() vs getDeclaredFields().\\n4. Pentru a invoca o metoda privata din exterior cu Reflection, trebuie apelat method.setAccessible(true).",
    codeSnippet: `class Parent { public void parentPublic() {} }
class Child extends Parent {
    public void childPublic() {}
    private void childPrivate() {}
}

Class<?> c = Child.class;

// getMethods(): childPublic, parentPublic, plus metodele din Object (doar publice!)
System.out.println(c.getMethods().length);

// getDeclaredMethods(): doar childPublic si childPrivate (toate vizibilitatile, doar Child!)
System.out.println(c.getDeclaredMethods().length); // 2`,
    interviewTrap: "Daca incerci sa gasesti un camp privat cu getField(\"secret\"), vei primi NoSuchFieldException! Campurile private se cauta exclusiv cu getDeclaredField(\"secret\").",
    keyTakeaway: "getMethods() gaseste doar metode publice inclusiv din parinti; getDeclaredMethods() gaseste toate metodele din clasa curenta, inclusiv private."
  },
  {
    id: "java-201",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "Adnotari Custom in Java: @Target si @Retention",
    question: "Cum definim o adnotare personalizata (custom annotation) si care este rolul metadnotarilor @Target si @Retention?",
    answer: "1. Cum se defineste:\\n   - Se foloseste sintaxa @interface (ex: public @interface Auditable {}).\\n   - Elementele adnotarii sunt metode fara parametri, ce pot avea valori implicite (default).\\n\\n2. Meta-adnotarea @Target:\\n   - Specifica UNDE poate fi aplicata adnotarea (Element-ul Java tinta):\\n   - ElementType.TYPE (pe clase/interfete), ElementType.METHOD (pe metode), ElementType.FIELD (pe campuri), ElementType.PARAMETER (pe parametri de metoda).\\n\\n3. Meta-adnotarea @Retention:\\n   - Specifica CAT TIMP este pastrata adnotarea in viata:\\n   - RetentionPolicy.SOURCE: doar in codul sursa (stearsa la compilare, ex: @Override, @SuppressWarnings).\\n   - RetentionPolicy.CLASS: pastrata in fisierul .class (bytecode), dar ignorata de JVM la runtime (default-ul!).\\n   - RetentionPolicy.RUNTIME: incarcata in memorie de JVM la runtime si accesibila prin Reflection!",
    codeSnippet: `@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME) // OBLIGATORIU pentru a fi citita la runtime!
public @interface TrackExecutionTime {
    String unit() default "MS"; // parametru optional cu valoare default
}

// Utilizare:
public class Service {
    @TrackExecutionTime(unit = "SEC")
    public void calculate() {}
}`,
    interviewTrap: "Daca uiti sa pui @Retention(RetentionPolicy.RUNTIME), adnotarea ta va avea implicit retentie CLASS si va fi INVIZIBILA la runtime prin Reflection (clazz.isAnnotationPresent() va returna false)!",
    keyTakeaway: "@Target stabileste unde se aplica adnotarea; @Retention(RetentionPolicy.RUNTIME) o face vizibila la runtime prin Reflection."
  },
  {
    id: "java-202",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce @Retention(RetentionPolicy.RUNTIME) este cruciala in Spring?",
    question: "De ce adnotarile din Spring precum @Service, @Autowired sau @Transactional folosesc obligatoriu RetentionPolicy.RUNTIME?",
    answer: "1. Cum functioneaza Spring Boot la startup:\\n   - Cand aplicatia porneste, Spring scaneaza fisierele bytecode (.class) din classpath si incarca clasele in memorie.\\n   - Foloseste mecanismul de Reflection pentru a intreba clasa: method.isAnnotationPresent(Transactional.class) sau clazz.isAnnotationPresent(Service.class).\\n\\n2. Ce s-ar intampla cu SOURCE sau CLASS:\\n   - SOURCE: compilatorul javac o arunca complet la salvarea bytecode-ului (Spring nu ar avea nicio sansa sa o vada).\\n   - CLASS: adnotarea exista in fisierul fizic .class de pe disc, dar cand ClassLoader-ul incarca clasa in masina virtuala (JVM), metadatele adnotarii NU sunt incarcate in memoria RAM!\\n\\n3. Concluzie:\\n   - RetentionPolicy.RUNTIME este singura politica care mentine adnotarea in memoria activa a JVM-ului, permitand framework-urilor sa o citeasca.",
    codeSnippet: `// Inspectie la runtime similara cu Spring:
Method method = MyService.class.getMethod("saveData");

if (method.isAnnotationPresent(Transactional.class)) {
    System.out.println("Pornim tranzactie pentru aceasta metoda!");
}`,
    interviewTrap: "Multi candidati cred ca default-ul pentru @Retention este RUNTIME. FALS! Daca nu specifici @Retention pe adnotarea ta, default-ul este RetentionPolicy.CLASS.",
    keyTakeaway: "RetentionPolicy.RUNTIME pastreaza adnotarile in memoria activa a JVM, permitand inspectia lor de catre Spring si Reflection."
  },
  {
    id: "java-203",
    category: 'JAVA',
    difficulty: "MEDIU",
    title: "ClassLoader in Java: Rol si Ierarhie",
    question: "Ce este un ClassLoader in Java si cum functioneaza modelul de delegare ierarhica (Delegation Hierarchy)?",
    answer: "1. Ce este un ClassLoader:\\n   - O componenta a Masinii Virtuale Java (JVM) responsabila de incarcarea fisierelor de bytecode (.class) de pe disc sau retea in memoria Metaspace a JVM-ului la runtime.\\n\\n2. Ierarhia standard a ClassLoader-elor:\\n   1. Bootstrap ClassLoader: Scris in C/C++, incarca clasele fundamentale de sistem Java (pachetul java.base, java.lang.*).\\n   2. Platform / Extension ClassLoader: Incarca extensiile standard si modulele platformei.\\n   3. Application (System) ClassLoader: Incarca clasele scrise de tine din classpath-ul aplicatiei si bibliotecile din pom.xml / build.gradle.\\n\\n3. Modelul de Delegare (Parent Delegation Model):\\n   - Cand un ClassLoader primeste cererea de a incarca o clasa, NU o incarca el direct!\\n   - Deleaga cererea mai intai parintelui sau. Daca parintele nu o gaseste, doar atunci incearca el sa o incarce.\\n   - Previne atacurile de securitate (nimeni nu poate inlocui java.lang.String cu o clasa malitioasa proprie).",
    codeSnippet: `ClassLoader appLoader = ClassLoaderExample.class.getClassLoader();
System.out.println("App Loader: " + appLoader);

ClassLoader platformLoader = appLoader.getParent();
System.out.println("Platform Loader: " + platformLoader);

ClassLoader bootstrapLoader = platformLoader.getParent();
System.out.println("Bootstrap Loader: " + bootstrapLoader); // Afiseaza null (implementat nativ in C++)`,
    interviewTrap: "Daca apelezi String.class.getClassLoader(), vei primi null! Nu este o eroare, ci semnalul ca a fost incarcat de Bootstrap ClassLoader nativ.",
    keyTakeaway: "ClassLoader incarca bytecode-ul in memorie delegand intai catre parinte (Bootstrap -> Platform -> Application) pentru securitate si consistenta."
  },
  {
    id: "java-204",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Shallow Copy vs Deep Copy in Java",
    question: "Care este diferenta dintre Shallow Copy (copie superficiala) si Deep Copy (copie profunda) in Java?",
    answer: "1. Shallow Copy (Copie Superficiala):\\n   - Creeaza o instanta noua a obiectului principal, dar copiaza valorile campurilor asa cum sunt.\\n   - Pentru primitive (int, double) copiaza valoarea.\\n   - Pentru campuri de tip OBIECT (ex: liste, adrese), copiaza doar REFERINTA de memorie!\\n   - Pericol: Atat originalul cat si copia pointeaza catre ACELASI obiect intern. Daca copia modifica un element din lista interna, se va modifica si in original!\\n\\n2. Deep Copy (Copie Profunda):\\n   - Creeaza o copie 100% independenta a intregului graf de obiecte.\\n   - Pentru fiecare obiect imbricat (nested), se creeaza o noua instanta separata pe Heap.\\n   - Orice modificare ulterioara facuta in copie NU afecteaza sub nicio forma obiectul original.",
    codeSnippet: `class Department { String name; Department(String n) { this.name = n; } }
class Employee {
    String empName;
    Department dept;

    // Shallow Copy:
    Employee shallowCopy() {
        Employee e = new Employee();
        e.empName = this.empName;
        e.dept = this.dept; // Aceeasi referinta de memorie partajata!
        return e;
    }

    // Deep Copy:
    Employee deepCopy() {
        Employee e = new Employee();
        e.empName = this.empName;
        e.dept = new Department(this.dept.name); // Obiect nou complet independent!
        return e;
    }
}`,
    interviewTrap: "new ArrayList<>(originalList) creeaza un shallow copy al listei. Daca lista contine obiecte mutabile, ambele liste vor pointa la aceleasi obiecte!",
    keyTakeaway: "Shallow copy copiaza referintele catre aceleasi obiecte interne; Deep copy cloneaza intregul arbore de obiecte in mod independent."
  },
  {
    id: "java-205",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Copii Defensive (Defensive Copying)",
    question: "Ce este o copie defensiva (Defensive Copy) si cum previne alterarea starii interne a unei clase imutabile?",
    answer: "1. Problema de securitate / mutatie ascunsa:\\n   - Daca creezi o clasa cu campuri final, dar unul dintre campuri este o colectie mutabila (ex: List<String>), iar constructorul tau salveaza direct referinta primita din exterior: this.list = list;\\n   - Clientul din exterior poate apela list.add(\"hacked\") DUPA crearea obiectului si sa-i altereze starea interna, desi clasa parea imutabila!\\n   - La fel, daca metoda getList() returneaza direct referinta interna: return this.list;, oricine poate chema getList().clear()!\\n\\n2. Solutia: Copia Defensiva:\\n   - In constructor: salveaza o copie noua (ex: this.list = new ArrayList<>(list) sau List.copyOf(list)).\\n   - In getter: returneaza o copie noua sau o vizualizare ne-modificabila (ex: Collections.unmodifiableList(this.list)).",
    codeSnippet: `public final class Order {
    private final List<String> items;

    public Order(List<String> items) {
        // Copie defensiva la intrare:
        this.items = new ArrayList<>(items);
    }

    public List<String> getItems() {
        // Copie defensiva sau unmodifiable la iesire:
        return Collections.unmodifiableList(items);
    }
}`,
    interviewTrap: "Chiar daca un camp este marcat private final List<String> items, el este final ca referinta, NU ca si continut! Elementele listei pot fi adaugate sau sterse daca nu faci copii defensive.",
    keyTakeaway: "Copiile defensive izoleaza starea interna a clasei copiind colectiile atat la primire in constructor cat si la returnare in getteri."
  },
  {
    id: "java-206",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Clasa utilitara java.util.Objects",
    question: "Ce metode utile ofera clasa java.util.Objects si cum simplifica validarile de null?",
    answer: "Clasa utilitara java.util.Objects (introdusa in Java 7) contine metode statice sigure impotriva NullPointerException:\\n\\n1. Objects.requireNonNull(obj, \"Mesaj\"):\\n   - Daca obj este null, arunca imediat NullPointerException cu mesajul furnizat.\\n   - Daca nu este null, returneaza obiectul (ideal pentru validarea parametrilor in constructori).\\n\\n2. Objects.equals(a, b):\\n   - Compara doua obiecte pentru egalitate in mod null-safe!\\n   - Daca ambele sunt null -> returneaza true. Daca unul este null -> false. Daca ambele sunt nenule -> a.equals(b).\\n\\n3. Objects.hash(a, b, c):\\n   - Genereaza cod hash combinat dintr-un numar variabil de campuri.\\n\\n4. Objects.isNull(obj) si Objects.nonNull(obj):\\n   - Predicate ideale pentru Stream API: .filter(Objects::nonNull).",
    codeSnippet: `public class Person {
    private final String name;

    public Person(String name) {
        // Validare eleganta de null:
        this.name = Objects.requireNonNull(name, "Numele nu poate fi null!");
    }

    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Person p)) return false;
        return Objects.equals(this.name, p.name); // Null-safe!
    }

    public int hashCode() {
        return Objects.hash(name);
    }
}`,
    interviewTrap: "Objects.equals(a, b) elimina necesitatea verificarii manuale if (a != null && a.equals(b)), prevenind erori comune de scriere.",
    keyTakeaway: "java.util.Objects ofera metode utilitare null-safe esentiale: requireNonNull, equals, hash si predicatele isNull/nonNull."
  },
  {
    id: "java-207",
    category: 'JAVA',
    difficulty: "USOR",
    title: "De ce NU folosim float sau double pentru bani?",
    question: "De ce este strict interzisa folosirea tipurilor float sau double pentru calcule financiare si ce folosim in schimb?",
    answer: "1. Cauza tehnica (Standardul IEEE 754):\\n   - Tipurile primitive float si double reprezinta numere in virgula mobila binara (baza 2), nu zecimala (baza 10).\\n   - Multe fractii zecimale simple precum 0.1, 0.2 sau 0.7 nu pot fi reprezentate exact in binar finit (exact cum 1/3 devine 0.33333... in zecimal).\\n   - Rezultatul operatiei 0.1 + 0.2 in Java NU este 0.3, ci 0.30000000000000004!\\n\\n2. Consecinte in aplicatii bancare / e-commerce:\\n   - Dupa mii de tranzactii sau calcul de TVA, diferentele de fractii de ban duc la pierderi masive financiare si balante contabile compromise.\\n\\n3. Solutia corecta in Java:\\n   - Folosirea clasei java.math.BigDecimal: ofera precizie arbitrara exacta in baza 10 si control deplin asupra modului de rotunjire (RoundingMode.HALF_UP).",
    codeSnippet: `// Problema uriasa cu double:
double val = 0.1 + 0.2;
System.out.println(val); // 0.30000000000000004 !

// Solutia CORECTA cu BigDecimal:
BigDecimal a = new BigDecimal("0.1");
BigDecimal b = new BigDecimal("0.2");
BigDecimal sum = a.add(b);
System.out.println(sum); // 0.3 (Exact!)`,
    interviewTrap: "La interviu, intervievatorii adora sa intrebe: \"Ce afiseaza System.out.println(0.1 + 0.2 == 0.3)?\". Raspunsul este FALSE!",
    keyTakeaway: "double si float au erori de precizie binara; pentru bani si calcule financiare se foloseste exclusiv BigDecimal."
  },
  {
    id: "java-208",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Crearea corecta a unui BigDecimal in Java",
    question: "Care este diferenta dintre new BigDecimal(\"0.1\") si new BigDecimal(0.1) si de ce varianta cu double este o capcana?",
    answer: "Aceasta este o intrebare clasica si eliminatorie de interviu!\\n\\n1. Constructorul cu double: new BigDecimal(0.1) -> CAPCANA MAJORA!\\n   - Literalul 0.1 este deja un double inexact in memorie inainte de a fi transmis constructorului.\\n   - In loc de 0.1, valoarea BigDecimal va fi exact: 0.1000000000000000055511151231257827021181583404541015625! Erorile de aproximare sunt preluate direct in BigDecimal.\\n\\n2. Variantele CORECTE:\\n   - Varianta 1 (Constructorul cu String): new BigDecimal(\"0.1\") -> Creeaza exact valoarea 0.1.\\n   - Varianta 2 (Metoda statica de fabrica): BigDecimal.valueOf(0.1) -> Converteste intern double-ul in String prin Double.toString(d) inainte de creare, fiind sigura si refolosind instante din cache pentru valori comune (0, 1, 10).",
    codeSnippet: `// GRESIT:
BigDecimal bad = new BigDecimal(0.1);
System.out.println(bad); 
// Output: 0.1000000000000000055511151231257827021181583404541015625

// CORECT (String):
BigDecimal good1 = new BigDecimal("0.1");
System.out.println(good1); // 0.1

// CORECT (valueOf):
BigDecimal good2 = BigDecimal.valueOf(0.1);
System.out.println(good2); // 0.1`,
    interviewTrap: "Nu folosi niciodata new BigDecimal(double)! Foloseste intotdeauna constructorul cu String new BigDecimal(\"...\") sau metoda statica BigDecimal.valueOf(...).",
    keyTakeaway: "new BigDecimal(0.1) preia eroarea de precizie a double-ului; foloseste new BigDecimal(\"0.1\") sau BigDecimal.valueOf(0.1)."
  },
  {
    id: "java-209",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Java Varargs (Variable Arguments)",
    question: "Ce este mecanismul Varargs (Type... args) in Java, cum functioneaza sub capota si care sunt cele doua reguli de utilizare?",
    answer: "1. Ce este Varargs (introdus in Java 5):\\n   - O sintaxa care permite unei metode sa accepte un numar variabil de argumente (zero, unul sau mai multe) de acelasi tip (ex: void printAll(String... names)).\\n\\n2. Cum functioneaza sub capota (Bytecode):\\n   - Compilatorul Java impacheteaza automat argumentele transmise intr-un simplu array nativ!\\n   - In interiorul corpului metodei, variabila names este tratata exact ca un array: String[].\\n\\n3. Cele doua reguli OBLIGATORII:\\n   - Regula 1: Parametrul varargs trebuie sa fie ULTIMUL parametru din lista de argumente a metodei.\\n   - Regula 2: O metoda poate avea CEL MULT UN SINGUR parametru varargs.",
    codeSnippet: `// CORECT: varargs este ultimul parametru
public void logMessage(String level, String... messages) {
    System.out.print("[" + level + "] ");
    for (String msg : messages) {
        System.out.print(msg + " ");
    }
    System.out.println();
}

// Apeluri valide:
logMessage("INFO");                          // 0 argumente varargs
logMessage("WARN", "Disk 90% plin");        // 1 argument
logMessage("ERROR", "Eroare DB", "Timeout"); // 2 argumente

// ILEGAL la compilare:
// void bad(String... msgs, int count) {} // Eroare: varargs nu este ultimul!
// void bad2(int... a, String... b) {}    // Eroare: mai mult de un varargs!`,
    interviewTrap: "Daca apelezi metoda fara niciun argument pentru varargs (ex: logMessage(\"INFO\")), parametrul devine un array gol (new String[0]), NU null! Insa transmiterea explicita a lui null (logMessage(\"INFO\", null)) seteaza array-ul ca null.",
    keyTakeaway: "Varargs (Type... args) compileaza ca un array nativ si trebuie sa fie obligatoriu ultimul si unicul parametru de acest fel din metoda."
  },
  {
    id: "java-210",
    category: 'JAVA',
    difficulty: "USOR",
    title: "Clean Code: Cele mai bune practici pentru un interviu tehnic",
    question: "Care sunt cele mai importante principii si bune practici de Clean Code pe care un dezvoltator Java Junior/Mid trebuie sa le demonstreze la un interviu tehnic?",
    answer: "La un interviu tehnic, calitatea codului cantareste adesea mai mult decat viteza:\\n\\n1. Denumiri sugestive si intuitive (Meaningful Names):\\n   - Fara variabile de o litera (x, a, t, flag). Foloseste nume explicite: userList, isExpired, calculateTotalSalary.\\n   - Numele claselor sunt substantive (OrderService), metodele sunt verbe (processPayment).\\n\\n2. Functii mici si cu un singur scop (Single Purpose):\\n   - O metoda ar trebui sa aiba ideal sub 15-20 de linii si sa faca un singur lucru bine (SRP).\\n   - Nivel redus de imbricare (nesting): evita if-uri imbricate pe 4 niveluri; foloseste Guard Clauses (return devreme: if (invalid) return;).\\n\\n3. Evitarea numerelor si string-urilor magice (Magic Numbers/Strings):\\n   - Nu scrie if (status == 3); extrage intr-o constanta static final int STATUS_ACTIVE = 3 sau un Enum!\\n\\n4. Tratarea adecvata a erorilor:\\n   - Nu lasa blocuri catch goale; logheaza exceptia sau arunca o exceptie specifica de domeniu.\\n   - Nu returna null din metode cand poti returna o colectie goala (Collections.emptyList()) sau un Optional.\\n\\n5. Testabilitate si Modularitate:\\n   - Cod usor de testat unitar, cu dependinte injectate prin constructor.",
    codeSnippet: `// GRESIT (Cod murdar):
public void proc(int d) {
    if (d > 0) {
        if (d == 1) { /* status 1 */ }
    }
}

// CORECT (Clean Code cu Guard Clauses si constante):
public static final int ACTIVE_STATUS = 1;

public void processUserStatus(int status) {
    if (status <= 0) {
        return; // Guard clause: returneaza devreme!
    }
    if (status == ACTIVE_STATUS) {
        activateAccount();
    }
}`,
    interviewTrap: "Daca la interviu scrii o metoda de 100 de linii plina de if-uri si numere magice care functioneaza, intervievatorul ar putea sa te respinga pentru ca acel cod va fi greu de mentinut in echipa.",
    keyTakeaway: "Clean Code inseamna: denumiri clare, metode scurte cu guard clauses, eliminarea numerelor magice, evitarea returnarii de null si tratarea corecta a erorilor."
  }
];
