// ============================================================================
// SPRING BOOT INTERVIEW FLASHCARD DECK - JUNIOR & MID LEVEL (150 Realistic Questions)
// ============================================================================
// Focus: Junior & Mid developer interview preparation (Zero Senior/Staff traps)
// Strictly ZERO diacritics for clean encoding and maximum compatibility.
//
// Categories covered:
// 1. Core Spring, IoC, Beans & ApplicationContext (01-26)
// 2. Spring Boot Basics, Starters & Auto-Configuration (27-50)
// 3. Spring MVC, REST APIs, Validation & Exception Handling (51-80)
// 4. Testing in Spring Boot: MockMvc, Sliced Tests & Testcontainers (81-100)
// 5. Spring Data JPA, Hibernate, Relational Mappings & Dirty Checking (101-125)
// 6. Transactions (@Transactional), Isolation & Propagation (126-130)
// 7. Spring Security, JWT, BCrypt & Method Security (131-140)
// 8. Spring Boot Actuator, Observability & Logging (141-144)
// 9. Modern HTTP Clients, Microservices Basics & Spring Boot 3 (145-150)
// ============================================================================

export const SPRING_DECK = [
  {
    id: "spring-01",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "De ce @Transactional apelat intern (self-invocation) NU functioneaza?",
    question: "Daca o metoda publica fara adnotari dintr-o clasa apeleaza o metoda @Transactional din aceeasi clasa, se deschide o tranzactie? De ce?",
    answer: "1. Raspuns direct: NU, tranzactia NU se deschide!\\n\\n2. Cauza fundamentala (Spring AOP Proxy):\\n   - Spring gestioneaza tranzactiile prin Proxy Pattern (CGLIB sau JDK Dynamic Proxies).\\n   - Cand un bean exterior apeleaza o metoda @Transactional, apelul trece prin Proxy-ul Spring. Proxy-ul intercepteaza apelul, deschide tranzactia pe EntityManager/DataSource, si abia apoi deleaga executia catre instanta reala.\\n   - Cand o metoda apeleaza o alta metoda din aceeasi clasa (self-invocation: this.metodaB()), apelul se executa direct pe instanta interna (\"this\"), ocolind complet Proxy-ul exterior! Interceptorul de tranzactie nu este invocat niciodata.\\n\\n3. Solutii recomandate:\\n   - Muta metoda @Transactional intr-un alt serviciu (Service separat) si injecteaza-l.\\n   - Foloseste tranzactii programatice cu TransactionTemplate.\\n   - Auto-injectarea proxy-ului (cu @Lazy), desi este considerata o carpeala.",
    codeSnippet: `@Service
public class OrderService {
    public void processOrder() {
        // GRESIT: this.saveOrder() ocoleste proxy-ul!
        saveOrder(); 
    }

    @Transactional
    public void saveOrder() {
        orderRepo.save(new Order());
    }
}`,
    interviewTrap: "Daca raspunzi ca Spring intercepteaza apelurile private sau interne \"magic\", arati ca nu intelegi functionarea Spring AOP bazata pe proxy.",
    keyTakeaway: "Spring AOP intercepteaza apelurile doar cand vin din afara bean-ului prin Proxy; apelurile interne (this) ocolesc tranzactiile."
  },
  {
    id: "spring-02",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Cum rezolvi problema N+1 Query in JPA / Hibernate?",
    question: "Ce este problema N+1 in JPA/Hibernate si care sunt solutiile principale pentru a o preveni in Spring Data JPA?",
    answer: "1. Ce este problema N+1:\\n   - Apare cand interoghezi o lista de N entitati parinte (1 query) si, la accesarea unei relatii Lazy (ex: getOrders()), Hibernate executa cate un query suplimentar pentru fiecare parinte in parte (N query-uri separate).\\n   - Rezultat: 1 + N interogari in baza de date, distrugand performanta aplicatiei.\\n\\n2. Solutiile principale in Spring Data JPA:\\n   - Solutia 1: JOIN FETCH in JPQL -> Fortuieste SQL JOIN-ul intr-un singur query complet.\\n   - Solutia 2: Adnotarea @EntityGraph pe metoda din Repository -> Specifici ce atribute relationale sa fie incarcate Eager intr-o singura interogare cu JOIN.\\n   - Solutia 3: @BatchSize(size = 25) pe relatie -> Incarca datele copiilor in calupuri folosind clauza WHERE parent_id IN (?, ?, ...), reducand de la N la N/25 query-uri.",
    codeSnippet: `// 1. Solutia cu JPQL JOIN FETCH:
@Query("SELECT u FROM User u LEFT JOIN FETCH u.orders WHERE u.status = 'ACTIVE'")
List<User> findAllWithOrders();

// 2. Solutia cu @EntityGraph:
@EntityGraph(attributePaths = {"orders", "department"})
List<User> findByStatus(String status);`,
    interviewTrap: "Setarea relatiei pe FetchType.EAGER NU rezolva problema N+1! Duce la executarea imediata a celor N interogari chiar daca nu ai nevoie de copii.",
    keyTakeaway: "N+1 executa 1 interogare pentru parinte si N pentru copii; se rezolva elegant prin JOIN FETCH in JPQL sau @EntityGraph."
  },
  {
    id: "spring-03",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ciclul de viata al unui Bean Spring (Bean Lifecycle)",
    question: "Care sunt etapele principale prin care trece un Bean in ApplicationContext de la instantiere pana la distrugere?",
    answer: "Etapele esentiale din Bean Lifecycle sunt:\\n1. Instantiere: Crearea instantei obiectului prin constructor.\\n2. Populare proprietati: Injectarea dependintelor (@Autowired, setteri).\\n3. Aware Interfaces: Setarea BeanNameAware, BeanFactoryAware, ApplicationContextAware daca sunt implementate.\\n4. BeanPostProcessor (Pre-Initialization): Apelul postProcessBeforeInitialization().\\n5. Initializare: Apelul metodei adnotate cu @PostConstruct sau InitializingBean.afterPropertiesSet().\\n6. BeanPostProcessor (Post-Initialization): Apelul postProcessAfterInitialization() -> AICI Spring creeaza Proxy-ul AOP pentru @Transactional sau @Async!\\n7. Bean GATA de utilizare: Serveste cererile din aplicatie.\\n8. Distrugere: La oprirea contextului, se apeleaza metoda adnotata cu @PreDestroy sau DisposableBean.destroy().",
    codeSnippet: `@Component
public class PaymentGateway {
    @PostConstruct
    public void init() {
        System.out.println("1. Gateway initializat cu chei API");
    }

    public void processPayment() {
        System.out.println("2. Serviciu in uz");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("3. Conexiuni inchise curat la oprire");
    }
}`,
    interviewTrap: "Proxy-ul AOP (pentru tranzactii sau securitate) este creat in faza BeanPostProcessor Post-Initialization, mult dupa rularea constructorului Java!",
    keyTakeaway: "Etapele de baza sunt: Constructor -> Injectie Dependinte -> @PostConstruct -> AOP Proxy -> Bean Utilizabil -> @PreDestroy."
  },
  {
    id: "spring-04",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Ce exceptii declanseaza Rollback automat in @Transactional?",
    question: "Care este comportamentul implicit de rollback al adnotarii @Transactional si cum fortezi rollback-ul pentru Checked Exceptions?",
    answer: "1. Comportamentul implicit in Spring:\\n   - @Transactional face ROLLBACK AUTOMAT DOAR pentru exceptii NE-VERIFICATE (Unchecked Exceptions): RuntimeException si Error (inclusiv NullPointerException, IllegalArgumentException etc.).\\n   - Daca metoda arunca o EXCEPTIE VERIFICATA (Checked Exception: IOException, SQLException, Exception custom care extinde Exception), Spring NU face rollback! Tranzactia va fi comisa (COMMIT) in baza de date, lasand date incomplete!\\n\\n2. Cum fortezi rollback-ul pentru Checked Exceptions:\\n   - Specifici parametrul rollbackFor:\\n     @Transactional(rollbackFor = Exception.class)\\n   - Sau pe o exceptie specifica: @Transactional(rollbackFor = {PaymentFailedException.class, IOException.class}).\\n\\n3. Regula de buna practica:\\n   - In majoritatea serviciilor de business se recomanda declararea @Transactional(rollbackFor = Exception.class) pentru a preveni commit-uri accidentale la orice tip de eroare.",
    codeSnippet: `// GRESIT: Daca se arunca IOException, tranzactia face COMMIT!
@Transactional
public void processFile() throws IOException {
    repo.save(new Record());
    throw new IOException("Eroare disc"); // NU face rollback default!
}

// CORECT: Face rollback la orice exceptie
@Transactional(rollbackFor = Exception.class)
public void safeProcess() throws IOException {
    repo.save(new Record());
    throw new IOException("Eroare disc"); // Face ROLLBACK garantat!
}`,
    interviewTrap: "Foarte multi candidati cred ca @Transactional face rollback la orice exceptie. Aceasta este o capcana clasica: face rollback doar la RuntimeException si Error!",
    keyTakeaway: "@Transactional face rollback implicit doar pe RuntimeException si Error; pentru Checked Exceptions adauga rollbackFor = Exception.class."
  },
  {
    id: "spring-05",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Constructor Injection vs Field Injection (@Autowired)",
    question: "De ce este Constructor Injection recomandat oficial in Spring si de ce Field Injection este considerat un anti-pattern?",
    answer: "1. De ce Field Injection (@Autowired pe camp privat) este un Anti-Pattern:\\n   - Sparge incapsularea: nu poti instantia clasa intr-un test unitar simplu (cu new) fara a folosi Reflection sau framework-uri greoaie de Spring.\\n   - Permite ascunderea dependentelor prea mult: clasa poate ajunge sa aiba 10-15 dependinte injectate fara sa observi (violand Single Responsibility Principle).\\n   - Variabilele nu pot fi facute final (pierzi imutabilitatea).\\n   - Risc mare de NullPointerException daca cineva creeaza instanta manual.\\n\\n2. Avantajele Constructor Injection:\\n   - Imutabilitate: Campurile pot fi declarate private final.\\n   - Testabilitate excelenta: Poti injecta dependinte mock direct prin new MyService(mockRepo) in JUnit fara nicio magie de Spring.\\n   - Fail-Fast: Daca o dependinta lipseste la pornire, aplicatia crapa imediat la instantiere.\\n   - Incepand cu Spring 4.3, daca o clasa are un singur constructor, adnotarea @Autowired este OPTIONALA!",
    codeSnippet: `// GRESIT (Field Injection anti-pattern):
@Service
public class BadService {
    @Autowired
    private UserRepository userRepo; // Nu poate fi final!
}

// CORECT (Constructor Injection curat):
@Service
public class GoodService {
    private final UserRepository userRepo; // Imutabil!

    // @Autowired este optional daca exista un singur constructor!
    public GoodService(UserRepository userRepo) {
        this.userRepo = userRepo;
    }
}`,
    interviewTrap: "Daca folosesti biblioteca Lombok, poti folosi adnotarea @RequiredArgsConstructor pe clasa, care genereaza automat constructorul cu toti membrii private final.",
    keyTakeaway: "Constructor injection asigura imutabilitate (campuri final), testabilitate usoara in JUnit si detectia rapida a dependentelor lipsa."
  },
  {
    id: "spring-06",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Cele 4 Stari ale unei entitati JPA (Entity Lifecycle)",
    question: "Care sunt cele 4 stari prin care poate trece o entitate JPA si ce inseamna fiecare?",
    answer: "In JPA/Hibernate, o entitate poate fi in una dintre urmatoarele 4 stari:\\n\\n1. Transient (Noua):\\n   - Obiectul a fost instantiat cu new (ex: User u = new User()).\\n   - Nu are ID in baza de date si nu este asociat cu niciun Persistence Context (EntityManager).\\n\\n2. Managed / Persistent:\\n   - Entitatea are ID si este urmarita activ de catre EntityManager (obtinuta prin find(), query sau dupa em.persist(u)).\\n   - Orice modificare a campurilor obiectului este detectata automat de Hibernate (Dirty Checking) si salvata in DB la sfarsitul tranzactiei fara a apela save()!\\n\\n3. Detached (Detasata):\\n   - Entitatea a fost Managed, are ID in DB, dar sesiunea sau tranzactia EntityManager s-a inchis (sau dupa em.detach(u) / em.clear()).\\n   - Modificarile nu mai sunt urmarite automat de Hibernate. Poate fi reatasata cu em.merge(u).\\n\\n4. Removed (Stearsa):\\n   - Entitatea a fost marcata pentru stergere prin em.remove(u) si va fi stearsa din baza de date la flush/commit.",
    codeSnippet: `User u = new User("Ana"); // 1. TRANSIENT

entityManager.persist(u); // 2. MANAGED (urmarit de Hibernate)
u.setName("Ana Maria"); // Dirty checking: va rula UPDATE automat la commit!

entityManager.detach(u); // 3. DETACHED (nu mai este urmarit)
u.setName("Alt Nume");  // Nicio modificare nu ajunge in DB!

User managedUser = entityManager.merge(u); // Reatasat ca MANAGED!
entityManager.remove(managedUser);         // 4. REMOVED`,
    interviewTrap: "Daca apelezi u.setName(\"Nou\") pe o entitate Detached, modificarea NU se va salva in baza de date decat daca apelezi explicit repository.save(u) sau em.merge(u).",
    keyTakeaway: "Cele 4 stari JPA sunt: Transient (fara ID), Managed (urmarit activ in sesiune), Detached (sesiune inchisa) si Removed (marcat pentru stergere)."
  },
  {
    id: "spring-07",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "LazyInitializationException: Cauza si Prevenire",
    question: "Ce cauzeaza LazyInitializationException in Spring Data JPA / Hibernate si cum se remediaza?",
    answer: "1. Cauza exacta:\\n   - O relatie marcata cu FetchType.LAZY este reprezentata initial de Hibernate printr-un obiect Proxy gol (ne-incarcat din baza de date).\\n   - Cand incerci sa accesezi o colectie sau un obiect din acel proxy (ex: user.getRoles().size()) in afara unei tranzactii active (EntityManager Session este deja inchis, de obicei in Controller sau in stratul de serializare JSON), Hibernate incearca sa deschida o conexiune noua la DB.\\n   - Gasind sesiunea inchisa, arunca: LazyInitializationException: \"could not initialize proxy - no Session\".\\n\\n2. Cum se remediaza corect:\\n   - Incarca datele necesare in interiorul tranzactiei din Service folosind JOIN FETCH in JPQL sau @EntityGraph in Repository.\\n   - Foloseste DTO-uri: mapeaza entitatea la un DTO in interiorul metodei @Transactional din Service inainte de a returna datele in Controller.\\n\\n3. Ce solutie NU se recomanda in productie:\\n   - spring.jpa.open-in-view=true (OSIV) mentine conexiunea la baza de date deschisa pana la trimiterea raspunsului HTTP, putand epuiza conexiunile din pool.",
    codeSnippet: `// INCORECT (In Controller, fara sesiune deschisa):
// User user = userService.getUser(1L);
// int count = user.getOrders().size(); // LazyInitializationException!

// CORECT (Incarcare explicita cu JOIN FETCH in Repository):
@Query("SELECT u FROM User u JOIN FETCH u.orders WHERE u.id = :id")
Optional<User> findByIdWithOrders(@Param("id") Long id);`,
    interviewTrap: "Nu rezolva problema schimband relatia pe FetchType.EAGER! EAGER va incarca datele intotdeauna, cauzand probleme grave de performanta si N+1 queries.",
    keyTakeaway: "LazyInitializationException apare la accesarea relatiilor LAZY cand sesiunea Hibernate s-a inchis; rezolvarea consta in JOIN FETCH sau mapare la DTO in Service."
  },
  {
    id: "spring-08",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Propagation.REQUIRED vs Propagation.REQUIRES_NEW",
    question: "Care este diferenta dintre Propagation.REQUIRED si Propagation.REQUIRES_NEW in @Transactional?",
    answer: "Propagarea defineste cum reactioneaza o metoda tranzactionala cand este apelata in contextul unei tranzactii existente:\\n\\n1. Propagation.REQUIRED (Implicit / Default):\\n   - Daca exista deja o tranzactie activa, metoda se alatura acesteia si ruleaza in ACEEASI tranzactie fizica.\\n   - Daca NU exista nicio tranzactie, creeaza una noua.\\n   - Daca metoda copil arunca o exceptie, toata tranzactia (inclusiv parintele) va fi marcata ca rollback-only!\\n\\n2. Propagation.REQUIRES_NEW:\\n   - Creeaza INTOTDEAUNA o tranzactie noua, independenta!\\n   - Daca exista o tranzactie curenta deschisa, aceasta este SUSPENDATA temporar pana cand tranzactia noua se finalizeaza (commit sau rollback).\\n   - Utilizare clasica: Loguri de audit sau notificari de eroare care trebuie salvate in DB chiar daca tranzactia principala esueaza si face rollback!",
    codeSnippet: `@Service
public class AuditService {
    // Ruleaza in propria tranzactie separata, garantand salvarea logului
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logAttempt(String action) {
        auditRepo.save(new AuditLog(action));
    }
}`,
    interviewTrap: "Daca folosesti REQUIRES_NEW si nu prinzi exceptia in parinte, exceptia va urca in parinte si va duce la rollback-ul ambelor tranzactii.",
    keyTakeaway: "REQUIRED se alatura tranzactiei curente sau creeaza una; REQUIRES_NEW suspenda tranzactia curenta si deschide o tranzactie fizica noua separata."
  },
  {
    id: "spring-09",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Optimistic Locking (@Version) vs Pessimistic Locking",
    question: "Cum difera blocarea optimista de blocarea pesimista in JPA si cand se foloseste fiecare?",
    answer: "1. Optimistic Locking (Blocare Optimista):\\n   - Presupune ca conflictele de scriere sunt RARE.\\n   - Nu blocheaza randul in baza de date! Permite mai multor utilizatori sa citeasca simultan.\\n   - Se implementeaza prin adaugarea unui camp de versiune adnotat cu @Version (int sau long) in entitate.\\n   - La update, Hibernate verifica daca versiunea din DB coincide cu versiunea citita (WHERE id = ? AND version = ?). Daca altcineva a salvat intre timp, versiunea nu mai corespunde si se arunca OptimisticLockException.\\n\\n2. Pessimistic Locking (Blocare Pesimista):\\n   - Presupune ca conflictele sunt FRECVENTE sau critice (ex: rezervare locuri avion, sold bancar limitat).\\n   - Pune un lock fizic la nivel de baza de date folosind clauza SQL SELECT ... FOR UPDATE (LockModeType.PESSIMISTIC_WRITE).\\n   - Celelalte tranzactii sunt obligate sa astepte pana cand tranzactia curenta face commit sau rollback.",
    codeSnippet: `// 1. Optimistic Locking:
@Entity
public class Product {
    @Id private Long id;
    private int stock;

    @Version
    private Long version; // Incrementat automat la fiecare UPDATE!
}

// 2. Pessimistic Locking:
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}`,
    interviewTrap: "Pessimistic locking poate reduce sever throughput-ul aplicatiei si poate genera deadlock-uri daca tranzactiile dureaza mult timp.",
    keyTakeaway: "Optimistic Lock foloseste @Version fara lock pe DB (rapid); Pessimistic Lock foloseste SELECT FOR UPDATE blocand randul in DB."
  },
  {
    id: "spring-10",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Cum functioneaza SecurityFilterChain in Spring Security 6",
    question: "Ce este SecurityFilterChain in Spring Security 6 si cum se configureaza autorizarea cererilor fara WebSecurityConfigurerAdapter?",
    answer: "1. Ce este SecurityFilterChain:\\n   - O colectie ordonata de filtre Servlet Spring Security prin care trece fiecare cerere HTTP inainte de a ajunge la Controller-ul tau.\\n   - Filtrele standard includ: CorsFilter, CsrfFilter, UsernamePasswordAuthenticationFilter, BearerTokenAuthenticationFilter, AuthorizationFilter.\\n\\n2. Configurarea moderna in Spring Security 6 / Spring Boot 3:\\n   - Vechea clasa WebSecurityConfigurerAdapter a fost complet eliminata!\\n   - Se defineste un @Bean de tip SecurityFilterChain care configureaza regulile prin stilul functional fluent (Customizer.withDefaults()).\\n   - Definitiile specifice se fac cu authorizeHttpRequests(auth -> auth.requestMatchers(\"/api/public/**\").permitAll().anyRequest().authenticated()).",
    codeSnippet: `@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .csrf(csrf -> csrf.disable()) // Dezactivat pentru REST APIs stateless
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/public/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .build();
    }
}`,
    interviewTrap: "In Spring Security 6, nu se mai foloseste antMatchers(), ci requestMatchers()! AntMatchers a fost eliminat.",
    keyTakeaway: "Spring Security 6 foloseste un @Bean SecurityFilterChain cu requestMatchers() si configurare lambda fluenta, eliminand adapterele vechi."
  },
  {
    id: "spring-11",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@Controller vs @RestController in Spring Boot",
    question: "Care este diferenta dintre adnotarea @Controller si adnotarea @RestController?",
    answer: "1. @Controller:\\n   - Adnotare traditionala de Spring MVC folosita pentru aplicatii web clasice care randeaza pagini HTML pe server (Server-Side Rendering cu Thymeleaf, JSP).\\n   - Valoarea returnata de o metoda este interpretata ca un NUME DE VIEW (ex: return \"index\"; cauta index.html).\\n   - Daca doresti sa returnezi date JSON dintr-un @Controller, trebuie sa adaugi explicit adnotarea @ResponseBody pe fiecare metoda in parte.\\n\\n2. @RestController (introdus in Spring 4.0):\\n   - O adnotare compusa (meta-annotation): este exact combinatia dintre @Controller si @ResponseBody pe toata clasa!\\n   - Toate metodele din clasa returneaza direct date (obiecte Java serializate automat in format JSON sau XML), NU pagini HTML.\\n   - Este adnotarea standard pentru construirea de RESTful Web Services.",
    codeSnippet: `// 1. @Controller clasic:
@Controller
public class WebPageController {
    @GetMapping("/home")
    public String home() {
        return "home"; // Cauta sablonul HTML home.html
    }
}

// 2. @RestController:
@RestController
@RequestMapping("/api/users")
public class UserRestController {
    @GetMapping
    public List<UserDto> getUsers() {
        return List.of(new UserDto("Ana")); // Serializat direct in JSON!
    }
}`,
    interviewTrap: "Daca returnezi un obiect dintr-un @Controller fara @ResponseBody, Spring va cauta o pagina HTML cu numele clasei si va arunca Circular view path sau 404!",
    keyTakeaway: "@RestController este un @Controller adnotat implicit cu @ResponseBody, serializand obiectele returnate direct in JSON."
  },
  {
    id: "spring-12",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Gestionarea Globala a Erorilor cu @ControllerAdvice & ProblemDetails",
    question: "Cum se implementeaza un mecanism centralizat de tratare a exceptiilor in Spring Boot folosind @RestControllerAdvice?",
    answer: "1. Ce este @RestControllerAdvice:\\n   - O adnotare specializata (compusa din @ControllerAdvice + @ResponseBody) care intercepteaza exceptiile aruncate de ORICE Controller din aplicatie.\\n   - Centralizeaza raspunsurile de eroare, prevenind duplicarea de blocuri try-catch in fiecare endpoint.\\n\\n2. Metoda @ExceptionHandler:\\n   - Specifica ce tip de exceptie este capturata de metoda (ex: @ExceptionHandler(ResourceNotFoundException.class)).\\n\\n3. ProblemDetail (RFC 7807 in Spring Boot 3):\\n   - Standardul modern RFC 7807 adoptat nativ in Spring Boot 3 pentru payload-uri uniforme de eroare: contine campuri standardizate ca status, title, detail, instance si timestamp.",
    codeSnippet: `@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleNotFound(ResourceNotFoundException ex) {
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
            HttpStatus.NOT_FOUND, ex.getMessage()
        );
        problem.setTitle("Resursa Negasita");
        problem.setProperty("timestamp", Instant.now());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }
}`,
    interviewTrap: "Daca ai nevoie sa capturezi erorile de validare (@Valid), intercepteaza MethodArgumentNotValidException pentru a extrage campurile invalide.",
    keyTakeaway: "@RestControllerAdvice ofera un punct unic global pentru maparea exceptiilor Java in raspunsuri HTTP consistente (ProblemDetail RFC 7807)."
  },
  {
    id: "spring-13",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Bean Scopes in Spring: Singleton vs Prototype",
    question: "Care sunt cele doua mari scopuri de Bean-uri in Spring Core si ce se intampla cand injectezi un Prototype intr-un Singleton?",
    answer: "1. Singleton (Implicit / Default):\\n   - Exista o SINGURA instanta a acelui Bean per container Spring (ApplicationContext).\\n   - Este creat la startup-ul aplicatiei (Eager) si partajat de toate thread-urile.\\n\\n2. Prototype:\\n   - O instanta NOUA este creata de FIECARE DATA cand bean-ul este solicitat din context (getBean()) sau injectat.\\n   - Spring nu gestioneaza ciclul complet de viata al unui Prototype (nu apeleaza @PreDestroy!).\\n\\n3. Capcana injectarii unui Prototype intr-un Singleton:\\n   - Daca injectezi un bean Prototype intr-un bean Singleton, Singleton-ul este creat o singura data la pornire! Dependinta Prototype va fi injectata o singura data si NU va mai fi recreata la apelurile viitoare ale Singleton-ului!\\n   - Solutie: Folosirea ObjectProvider<PrototypeBean> sau adnotarea @Lookup.",
    codeSnippet: `@Component
@Scope("prototype")
public class TokenGenerator {
    private final String id = UUID.randomUUID().toString();
    public String getId() { return id; }
}

@Service
public class OrderService {
    // Injectam ObjectProvider pentru a obtine instante noi la runtime:
    private final ObjectProvider<TokenGenerator> tokenProvider;

    public OrderService(ObjectProvider<TokenGenerator> provider) {
        this.tokenProvider = provider;
    }

    public void process() {
        TokenGenerator token = tokenProvider.getObject(); // Instanta NOUA de fiecare data!
    }
}`,
    interviewTrap: "Daca pui @Autowired PrototypeBean p; intr-un Singleton, vei avea aceeasi instanta mereu. Foloseste ObjectProvider<T> sau @Lookup.",
    keyTakeaway: "Singleton are o singura instanta per context (default); Prototype creeaza o instanta noua la fiecare cerere."
  },
  {
    id: "spring-14",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Dependente Circulare (Circular Dependencies) in Spring Boot",
    question: "Ce este o dependenta circulara si de ce Spring Boot 2.6+ le interzice in mod implicit?",
    answer: "1. Ce este o dependenta circulara:\\n   - Apare cand Bean A depinde de Bean B prin constructor/injectie, iar Bean B depinde inapoi de Bean A (A -> B -> A), creand un cerc vicios de instantiere.\\n\\n2. De ce le interzice Spring Boot 2.6+:\\n   - Semnal clar de PROIECTARE GRESITA (Bad Architecture): clasele sunt strans cuplate si au prea multe responsabilitati (violeaza Single Responsibility Principle).\\n   - Poate provoca deadlock-uri sau erori BeanCurrentlyInCreationException la startup.\\n\\n3. Cum se rezolva corect:\\n   - Refactoring (Recomandat): Extrage logica partajata intr-un al treilea serviciu (Bean C) de care depind atat A cat si B.\\n   - Folosirea de Event-uri Spring (ApplicationEventPublisher) pentru decuplare.\\n   - Folosirea temporara a adnotarii @Lazy pe constructor, desi este un workaround de evitat.",
    codeSnippet: `// GRESIT: Dependente circulare
// ServiceA cere ServiceB, ServiceB cere ServiceA -> CRASH la pornire!

// REFACTORING CORECT:
// Creat ServiceC (Shared Logic):
@Service
public class SharedService { public void commonLogic() {} }

@Service
public class ServiceA {
    public ServiceA(SharedService shared) {}
}

@Service
public class ServiceB {
    public ServiceB(SharedService shared) {}
}`,
    interviewTrap: "Activarea proprietatii spring.main.allow-circular-references=true este strict un bandaj temporar pentru legacy, nu o rezolvare de arhitectura!",
    keyTakeaway: "Dependentele circulare indica un design defectuos; solutia corecta este extragerea logicii comune intr-un serviciu separat."
  },
  {
    id: "spring-15",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Cum functioneaza Auto-Configuration in Spring Boot?",
    question: "Ce este Auto-Configuration in Spring Boot si cum functioneaza adnotarile conditionale din spate?",
    answer: "1. Ce este Auto-Configuration:\\n   - Mecanismul prin care Spring Boot configureaza automat bean-urile de infrastructura pe baza dependintelor gasite in classpath (JAR-urile din pom.xml/build.gradle).\\n   - Exemplu: Daca adaugi spring-boot-starter-data-jpa si driverul postgresql, Spring Boot configureaza automat un DataSource, un EntityManagerFactory si un TransactionManager fara sa scrii XML sau clase de configurare manuale!\\n\\n2. Cum functioneaza sub capota (Adnotari Conditionale):\\n   - Foloseste clase speciale de autoconfigurare evaluate la startup.\\n   - Adnotarile cheie @Conditional:\\n     - @ConditionalOnClass: se activeaza doar daca o clasa anume exista in classpath (ex: DataSource.class).\\n     - @ConditionalOnMissingBean: se activeaza doar daca utilizatorul NU a declarat deja un bean propriu de acel tip (iti permite sa suprascrii usor orice configurare default!).\\n     - @ConditionalOnProperty: se activeaza doar daca o proprietate din application.properties are o anumita valoare.\\n\\n3. Unde sunt declarate:\\n   - In Spring Boot 3, in fisierul META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.",
    codeSnippet: `@AutoConfiguration
@ConditionalOnClass(DataSource.class)
public class DataSourceAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean // Daca tu nu ai definit un DataSource, Spring creeaza unul automat!
    public DataSource dataSource() {
        return new HikariDataSource();
    }
}`,
    interviewTrap: "Daca declari propriul tau @Bean DataSource in aplicatie, bean-ul default de autoconfigurare este dezactivat automat gratie lui @ConditionalOnMissingBean.",
    keyTakeaway: "Auto-configuration analizeaza classpath-ul si creeaza bean-uri implicite doar daca tu nu le-ai definit deja (@ConditionalOnMissingBean)."
  },
  {
    id: "spring-16",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este Inversion of Control (IoC) si Dependency Injection (DI)?",
    question: "Ce inseamna principiul Inversion of Control (IoC) si cum realizeaza Dependency Injection (DI) acest principiu?",
    answer: "1. Inversion of Control (IoC):\\n   - Este un principiu general de design software in care controlul fluxului de executie si al ciclului de viata al obiectelor (creare, configurare, distrugere) este INVERSAT: este preluat de un Framework / Container in loc sa fie gestionat manual de codul tau de business.\\n   - Principiul Hollywood: \"Don't call us, we'll call you\".\\n\\n2. Dependency Injection (DI):\\n   - Este modalitatea concreta (mecanismul) prin care Spring implementeaza IoC.\\n   - In loc ca o clasa sa isi creeze singura dependintele cu operatorul new (ex: private UserRepository repo = new PostgresUserRepository()), dependintele sunt \"injectate\" din exterior de catre Containerul IoC (de obicei prin constructor).\\n\\n3. Beneficii:\\n   - Decuplare totala, testabilitate usoara cu mock-uri si modularitate crescuta.",
    codeSnippet: `// FARA DI (Cuplare rigida):
public class OrderService {
    private PaymentService payment = new StripePaymentService(); // Cuplat strict!
}

// CU DI (IoC / Dependency Injection):
@Service
public class OrderService {
    private final PaymentService payment; // Depinde de interfata

    // Containerul Spring injecteaza implementarea potrivita:
    public OrderService(PaymentService payment) {
        this.payment = payment;
    }
}`,
    interviewTrap: "IoC este conceptul abstract (inversarea controlului catre container); Dependency Injection este tehnica de implementare.",
    keyTakeaway: "IoC transfera controlul crearii obiectelor catre Spring Container; DI furnizeaza dependintele din exterior."
  },
  {
    id: "spring-17",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@Component vs @Service vs @Repository vs @Controller",
    question: "Care sunt diferentele dintre stereotipurile @Component, @Service, @Repository si @Controller in Spring?",
    answer: "Toate 4 sunt adnotari stereotip care inregistreaza clasa ca un Spring Bean in ApplicationContext prin component scanning, dar au scopuri semantice diferite:\\n\\n1. @Component:\\n   - Stereotipul generic de baza. Folosit pentru utilitare, componente tehnice generale sau clase care nu se incadreaza in cele 3 straturi clasice.\\n\\n2. @Service:\\n   - Specializare a lui @Component pentru STRATUL DE BUSINESS (Service Layer).\\n   - Indica faptul ca acea clasa contine logica de afaceri, tranzactii si calcule specifice domeniului.\\n\\n3. @Repository:\\n   - Specializare a lui @Component pentru STRATUL DE ACCES LA DATE (DAO / Persistence Layer).\\n   - BENEFICIU TEHNIC SPECIAL: Activeaza automat traducerea exceptiilor native JDBC/Hibernate/SQL intr-o ierarhie uniforma de exceptii Spring de tip DataAccessException!\\n\\n4. @Controller / @RestController:\\n   - Specializare pentru STRATUL DE PREZENTARE (Web / REST API). Gestioneaza cererile HTTP si raspunsurile.",
    codeSnippet: `@Repository // Activeaza DataAccessException translation
public class CustomUserDao {}

@Service // Semantica de business logic
public class UserService {}

@RestController // Web REST endpoints
public class UserController {}

@Component // Componenta generica
public class EmailHelper {}`,
    interviewTrap: "@Repository nu este doar o eticheta estetica: activeaza PersistenceExceptionTranslationPostProcessor pentru translarea exceptiilor SQL native in DataAccessException.",
    keyTakeaway: "@Component este baza generica; @Service este pentru business logic, @Repository adauga translarea exceptiilor de baza de date, @Controller gestioneaza HTTP."
  },
  {
    id: "spring-18",
    category: 'SPRING',
    difficulty: "USOR",
    title: "BeanFactory vs ApplicationContext",
    question: "Care este diferenta dintre interfetele BeanFactory si ApplicationContext in Spring?",
    answer: "Ambele sunt containere IoC care gestioneaza Bean-uri, dar ApplicationContext este o extensie mult mai puternica:\\n\\n1. BeanFactory (Containerul de baza / Minimal):\\n   - Ofera suportul de baza pentru Dependency Injection.\\n   - Incarca Bean-urile in mod LAZY (doar cand apelezi explicit getBean()).\\n   - Consum infim de memorie, folosit in dispozitive extrem de limitate hardware (IoT vechi).\\n\\n2. ApplicationContext (Containerul Avansat Enterprise):\\n   - Extinde interfata BeanFactory si adauga functionalitati enterprise esentiale:\\n     - Incarca bean-urile Singleton in mod EAGER la startup (detecteaza erorile imediat la pornire!).\\n     - Suport pentru Spring AOP (@Transactional, securitate).\\n     - Publicare de Evenimente (ApplicationEventPublisher).\\n     - Internationalizare de mesaje (MessageSource / i18n).\\n     - Integrare usoara cu medii Web (WebApplicationContext).\\n\\n3. Recomandare: In Spring Boot se foloseste intotdeauna ApplicationContext.",
    codeSnippet: `// BeanFactory este parintele de baza:
// public interface ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory, MessageSource, ApplicationEventPublisher, ResourcePatternResolver

ApplicationContext context = SpringApplication.run(MyApp.class, args);
MyService service = context.getBean(MyService.class);`,
    interviewTrap: "BeanFactory initializeaza bean-urile lazy la getBean(), pe cand ApplicationContext initializeaza toate bean-urile singleton dintr-o data la startup.",
    keyTakeaway: "ApplicationContext extinde BeanFactory si adauga instantiere eager la pornire, AOP, evenimente si internationalizare."
  },
  {
    id: "spring-19",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce face adnotarea @SpringBootApplication?",
    question: "Din ce adnotari este compusa adnotarea @SpringBootApplication si ce rol are fiecare?",
    answer: "Adnotarea @SpringBootApplication este o meta-adnotare care combina 3 adnotari fundamentale:\\n\\n1. @Configuration:\\n   - Marcheaza clasa ca o sursa de definitii de Bean-uri (poti defini metode adnotate cu @Bean in interiorul ei).\\n\\n2. @EnableAutoConfiguration:\\n   - Activeaza mecanismul inteligent de autoconfigurare al Spring Boot pe baza bibliotecilor din classpath.\\n\\n3. @ComponentScan:\\n   - Activeaza scanarea automata a claselor adnotate cu @Component, @Service, @Repository, @RestController.\\n   - CRITIC: Scaneaza DOAR pachetul in care se afla clasa principala si TOATE SUB-PACHETELE sale!\\n\\n4. Contine si @SpringBootConfiguration (un alias pentru @Configuration).",
    codeSnippet: `// @SpringBootApplication este echivalent cu:
@Configuration
@EnableAutoConfiguration
@ComponentScan
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}`,
    interviewTrap: "Daca plasezi un Controller sau Service intr-un pachet paralel sau superior clasei cu @SpringBootApplication, Spring NU il va gasi decat daca specifici explicit scanBasePackages.",
    keyTakeaway: "@SpringBootApplication combina @Configuration, @EnableAutoConfiguration si @ComponentScan pe pachetul curent si sub-pachetele sale."
  },
  {
    id: "spring-20",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Citirea proprietatilor: @Value vs @ConfigurationProperties",
    question: "Care este diferenta dintre @Value si @ConfigurationProperties pentru incarcarea configuratiilor?",
    answer: "1. Adnotarea @Value:\\n   - Injecteaza o singura valoare individuala pe un camp (ex: @Value(\"${app.jwt.secret}\")).\\n   - Suporta SpEL (Spring Expression Language).\\n   - Nu suporta validare automata a campurilor si devine greoaie cand ai zeci de proprietati relationate.\\n\\n2. Adnotarea @ConfigurationProperties (Recomandata pentru grupuri de proprietati):\\n   - Mapeaza o intreaga ierarhie de proprietati (cu un prefix comun, ex: \"app.mail\") pe o clasa Java tip POJO sau Java Record.\\n   - Type-safe: converteste automat tipurile (int, boolean, Duration, List).\\n   - Suporta validare declarativa cu Jakarta Validation (@Valid, @NotNull, @Min).\\n   - Suporta \"Relaxed Binding\" (app.my-prop, app.myProp, APP_MYPROP sunt echivalente!).",
    codeSnippet: `// 1. Cu @Value (simplu, pentru valori unice):
@Value("\${app.timeout:5000}")
private int timeout;

// 2. Cu @ConfigurationProperties (type-safe si elegant):
@ConfigurationProperties(prefix = "app.mail")
@Validated
public record MailProperties(
    @NotBlank String host,
    @Min(1) int port,
    Duration timeout
) {}`,
    interviewTrap: "@ConfigurationProperties suporta relaxed binding (kebab-case in YAML este mapat la camelCase in Java), pe cand @Value cere potrivirea exacta a numelui.",
    keyTakeaway: "@Value este pentru valori unice; @ConfigurationProperties este recomandat pentru grupuri type-safe si validate de proprietati."
  },
  {
    id: "spring-21",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Spring Profiles: Ce sunt si cum se folosesc",
    question: "Ce sunt Spring Profiles si cum configurezi comportamente diferite pentru dev, test si prod?",
    answer: "1. Ce sunt Spring Profiles:\\n   - Un mecanism de separare a configuratiei si a bean-urilor pe medii de rulare diferite (ex: local, development, staging, production).\\n\\n2. Fisiere dedicate de configurare:\\n   - Spring incarca automat application-{profile}.properties sau application-{profile}.yml.\\n   - Exemplu: application-dev.yml (cu baza H2) si application-prod.yml (cu Postgres pe AWS).\\n\\n3. Adnotarea @Profile pe Bean-uri:\\n   - Permite instantierea unui Bean DOAR daca profilul respectiv este activ:\\n     @Profile(\"dev\") -> se instantiaza MockPaymentService.\\n     @Profile(\"prod\") -> se instantiaza RealStripePaymentService.\\n\\n4. Cum se activeaza:\\n   - In application.yml: spring.profiles.active=dev\\n   - Din comanda CLI: java -jar app.jar --spring.profiles.active=prod\\n   - Din variabile de mediu: SPRING_PROFILES_ACTIVE=prod.",
    codeSnippet: `@Service
@Profile("dev")
public class DevEmailService implements EmailService {
    public void send(String msg) { System.out.println("Doar log: " + msg); }
}

@Service
@Profile("prod")
public class SmtpEmailService implements EmailService {
    public void send(String msg) { /* trimite prin server real */ }
}`,
    interviewTrap: "Daca folosesti @Profile(\"!prod\"), bean-ul va fi activ in toate mediile CU EXCEPTIA profilului \"prod\".",
    keyTakeaway: "Spring Profiles permit adaptarea proprietatilor si activarea conditionata a bean-urilor (@Profile) in functie de mediul de rulare."
  },
  {
    id: "spring-22",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@Bean vs @Component in Spring",
    question: "Cand folosim adnotarea @Bean si cand folosim @Component?",
    answer: "1. @Component:\\n   - Se plaseaza la nivel de CLASA pe codul sursa pe care IL DETII tu in proiect.\\n   - Spring detecteaza clasa automat prin @ComponentScan si se ocupa de instantiere.\\n   - Se foloseste pentru serviciile, componentele si controllerele proprii ale aplicatiei.\\n\\n2. @Bean:\\n   - Se plaseaza la nivel de METODA in interiorul unei clase adnotate cu @Configuration.\\n   - Metoda returneaza o instanta a obiectului.\\n   - SE FOLOSESTE PENTRU BIBLIOTECI EXTERNE (3rd party libraries) unde nu ai acces la codul sursa pentru a adauga adnotarea @Component (ex: ObjectMapper din Jackson, RestClient, PasswordEncoder din Spring Security, AmazonS3Client).\\n   - Iti ofera control deplin manual asupra modului de instantiere si configurare al obiectului.",
    codeSnippet: `@Configuration
public class AppConfig {

    // Folosim @Bean pentru ca nu putem adauga @Component pe clasa din biblioteca externa:
    @Bean
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
        return mapper;
    }
}`,
    interviewTrap: "Daca adaugi o metoda @Bean intr-o clasa obisnuita fara @Configuration, apelurile intre metode nu vor mai fi interceptate prin proxy CGLIB.",
    keyTakeaway: "@Component se pune pe clasele proprii gasite prin scanare; @Bean se pune pe metode de configurare pentru instante din biblioteci externe."
  },
  {
    id: "spring-23",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Rezolvarea ambiguitatii: @Primary vs @Qualifier",
    question: "Ce se intampla cand mai multe Bean-uri implementeaza aceeasi interfata si cum rezolvi conflictul cu @Primary si @Qualifier?",
    answer: "1. Problema (NoUniqueBeanDefinitionException):\\n   - Daca interfata PaymentService are 2 implementari (@Service PaypalPayment si @Service CardPayment) si o clasa cere prin constructor un PaymentService, Spring nu stie pe care sa il aleaga si arunca eroare la pornire!\\n\\n2. Solutia 1: @Primary\\n   - Se pune pe una dintre implementari.\\n   - Semnaleaza ca acel Bean este ALEGEREA IMPLICITA (default) daca nu se specifica altfel.\\n\\n3. Solutia 2: @Qualifier(\"numeBean\")\\n   - Se specifica la punctul de injectie.\\n   - Are prioritate mai mare decat @Primary si solicita explicit bean-ul cu acel nume particular.",
    codeSnippet: `public interface NotificationService { void send(String msg); }

@Service
@Primary // Alegerea implicita
public class EmailService implements NotificationService { ... }

@Service("smsService")
public class SmsService implements NotificationService { ... }

@Service
public class AlertManager {
    // Folosim @Qualifier pentru a alege explicit SMS in loc de Email:
    public AlertManager(@Qualifier("smsService") NotificationService service) {
        this.service = service;
    }
}`,
    interviewTrap: "Daca exista atat @Primary cat si @Qualifier la punctul de injectie, @Qualifier CASTIGA intotdeauna!",
    keyTakeaway: "@Primary stabileste bean-ul implicit; @Qualifier alege punctual un bean dupa nume, avand prioritate absoluta."
  },
  {
    id: "spring-24",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarile @PostConstruct si @PreDestroy",
    question: "Ce rol au adnotarile @PostConstruct si @PreDestroy si de ce nu se pun operatiile de initializare direct in constructor?",
    answer: "1. @PostConstruct:\\n   - Se pune pe o metoda fara parametri dintr-un Bean.\\n   - Se executa o SINGURA DATA, imediat dupa ce constructorul s-a incheiat SI TOATE dependintele au fost complet injectate!\\n   - De ce nu in constructor: In constructor, campurile injectate (@Autowired) pot fi inca ne-initializate (null), iar parametrii de configurare pot sa nu fie inca setati.\\n\\n2. @PreDestroy:\\n   - Se executa chiar inainte ca Bean-ul sa fie distrus de catre container la oprirea aplicatiei.\\n   - Se foloseste pentru curatare de resurse: inchidere conexiuni socket, eliberare buffere, inchidere fisiere deschise.",
    codeSnippet: `@Service
public class CacheWarmupService {
    private final ProductRepository productRepo;

    public CacheWarmupService(ProductRepository productRepo) {
        this.productRepo = productRepo;
        // Nu rula interogari grele direct in constructor!
    }

    @PostConstruct
    public void warmup() {
        // Sigur: productRepo este garantat injectat si gata de lucru!
        System.out.println("Incarcam produsele in cache...");
    }
}`,
    interviewTrap: "Metodele marcate cu @PostConstruct sau @PreDestroy nu pot avea parametri si trebuie sa aiba tip de retur void.",
    keyTakeaway: "@PostConstruct se apeleaza dupa injectarea completa a dependentelor; @PreDestroy elibereaza resursele la oprirea containerului."
  },
  {
    id: "spring-25",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Lazy Initialization in Spring: Adnotarea @Lazy",
    question: "Ce face adnotarea @Lazy pe un Bean si care sunt avantajele si dezavantajele sale?",
    answer: "1. Comportamentul implicit al Spring:\\n   - Toate bean-urile Singleton sunt instantiate EAGER la pornirea aplicatiei.\\n\\n2. Ce face @Lazy:\\n   - Amana instantierea Bean-ului pana in momentul in care este efectiv solicitat/apelat pentru prima data in timpul rularii.\\n   - La punctul de injectie creeaza un mic Proxy dinamic care va instantia bean-ul real doar la primul apel de metoda.\\n\\n3. Avantaj:\\n   - Reduce timpul de pornire al aplicatiei (startup time) si consumul initial de memorie.\\n\\n4. Dezavantaj (IMPORTANT la interviu!):\\n   - Erorile de configurare, dependinte lipsa sau erori de SQL nu mai sunt descoperite la startup, ci vor crapa in fata utilizatorului la runtime cand cineva apeleaza acel endpoint!",
    codeSnippet: `@Service
@Lazy // Se instantiaza doar cand este apelat prima data
public class HeavyReportGenerator {
    public HeavyReportGenerator() {
        System.out.println("HeavyReportGenerator instantiat!");
    }
}`,
    interviewTrap: "In productie, instantierea Eager este de preferat pentru ca respecta principiul Fail-Fast: stii sigur ca aplicatia porneste sanatoasa inainte de a primi trafic de utilizatori.",
    keyTakeaway: "@Lazy amana instantierea bean-ului pana la prima utilizare; grabeste pornirea dar intarzie detectia erorilor la runtime."
  },
  {
    id: "spring-26",
    category: 'SPRING',
    difficulty: "USOR",
    title: "De ce Field Injection este considerat Anti-pattern?",
    question: "Care sunt cele 4 motive clare pentru care dezvoltatorii Spring trebuie sa evite injectarea pe camp (@Autowired private Service s)?",
    answer: "Cele 4 motive principale sunt:\\n1. Imposibilitatea Imutabilitatii: Campurile nu pot fi marcate cu modificatorul final.\\n2. Testare unitara greoaie: Intr-un test JUnit simplu, nu poti seta dependinta fara Spring context sau fara reflection hack-uri (ReflectionTestUtils).\\n3. Incalcarea SRP (Single Responsibility Principle): Este foarte usor sa injectezi 10 campuri fara sa simti disconfort; daca folosesti constructor, un constructor cu 10 parametri iti semnaleaza imediat ca clasa face prea multe!\\n4. Risc de NullPointerException: Daca creezi clasa cu new in afara contextului, campurile sunt null fara niciun avertisment la compilare.",
    codeSnippet: `// GRESIT:
@Component
public class BadExample {
    @Autowired private DepA a;
    @Autowired private DepB b;
}

// CORECT:
@Component
public class GoodExample {
    private final DepA a;
    private final DepB b;

    public GoodExample(DepA a, DepB b) {
        this.a = a;
        this.b = b;
    }
}`,
    interviewTrap: "Daca intervievatorul te intreaba: \"Care este cel mai bun mod de injectie in Spring?\", raspunsul este intotdeauna: Constructor Injection.",
    keyTakeaway: "Field Injection impiedica campurile final, complica testarea unitara si ascunde clasele supraincarcate cu prea multe dependinte."
  },
  {
    id: "spring-27",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Serverul Web Incorporat (Embedded Tomcat) in Spring Boot",
    question: "Ce este un Embedded Server in Spring Boot si cum difera rularea unei aplicatii moderne fata de traditionalele fisiere WAR?",
    answer: "1. Modelul clasic Java EE / Tomcat extern:\\n   - Trebuia sa instalezi manual un server Tomcat/JBoss pe sistemul de operare.\\n   - Aplicatia era impachetata ca o arhiva .WAR si copiata in directorul webapps/ al serverului extern.\\n\\n2. Modelul Spring Boot Embedded (Fat JAR):\\n   - Serverul web (Apache Tomcat este default) este inclus ca o simpla biblioteca JAR in interiorul aplicatiei tale (in dependenta spring-boot-starter-web)!\\n   - Clasa principala cu metoda public static void main() porneste direct JVM-ul, iar Spring Boot initializeaza Tomcat programatic din interiorul aplicatiei.\\n   - Aplicatia se ruleaza simplu cu comanda: java -jar my-app.jar.\\n\\n3. Alternative:\\n   - Poti schimba Tomcat foarte usor cu Jetty sau Undertow prin excluderea dependintei de tomcat.",
    codeSnippet: `<!-- In pom.xml: spring-boot-starter-web aduce automat Embedded Tomcat -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>`,
    interviewTrap: "Un \"Fat JAR\" (sau Uber JAR) contine atat codul tau compilat, cat si toate dependintele si serverul Tomcat incorporat.",
    keyTakeaway: "Spring Boot include Tomcat ca biblioteca interna intr-un Fat JAR executabil prin java -jar, eliminand deployment-ul clasic de fisiere WAR."
  },
  {
    id: "spring-28",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Cum schimbi portul si context path-ul in Spring Boot",
    question: "Cum configurezi portul HTTP al aplicatiei si un prefix global (context path) pentru toate endpoint-urile?",
    answer: "In fisierul de configurare application.properties sau application.yml:\\n\\n1. Schimbarea portului HTTP (implicit este 8080):\\n   - server.port=8081 (sau 0 pentru un port aleator liber in teste!).\\n\\n2. Setarea Context Path-ului (prefix global pe toate URL-urile):\\n   - server.servlet.context-path=/api/v1\\n   - Cu aceasta setare, un endpoint @GetMapping(\"/users\") devine accesibil la adresa: http://localhost:8081/api/v1/users.\\n\\n3. Suprascriere din linia de comanda:\\n   - java -jar app.jar --server.port=9000.",
    codeSnippet: `# In application.yml:
server:
  port: 8085
  servlet:
    context-path: /api

# Port dinamic pentru teste:
# server.port: 0`,
    interviewTrap: "Daca setezi server.port=0 in teste, poti injecta portul real alocat folosind @LocalServerPort private int port;.",
    keyTakeaway: "server.port modifica portul HTTP, iar server.servlet.context-path adauga un prefix global pe toate endpoint-urile aplicatiei."
  },
  {
    id: "spring-29",
    category: 'SPRING',
    difficulty: "USOR",
    title: "application.properties vs application.yml in Spring Boot",
    question: "Care sunt avantajele formatului YAML (.yml) fata de .properties in configurarea Spring Boot?",
    answer: "1. application.properties:\\n   - Format clasic cheie-valoare plat: app.datasource.url=...\\n   - Numele prefixelor trebuie repetate pe fiecare linie.\\n\\n2. application.yml (YAML - YAML Ain't Markup Language):\\n   - Structura ierarhica eleganta bazata pe indentare (spatii, nu tab-uri!).\\n   - Elimina repetarea prefixelor comune (mult mai lizibil pentru fisiere mari de configurare).\\n   - Suporta liste native, mapari si valori complexe mult mai usor de citit.\\n\\n3. Atentie la reguli YAML:\\n   - Indentarea este stricta (2 spatii); folosirea de caractere TAB genereaza erori de parsare la pornirea aplicatiei.",
    codeSnippet: `# Format YAML (ierarhic si curat):
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/mydb
    username: postgres
  jpa:
    hibernate:
      ddl-auto: validate`,
    interviewTrap: "Daca ai atat application.properties cat si application.yml in acelasi proiect, ambele se incarca, dar application.properties are prioritate si suprascrie valorile din YAML!",
    keyTakeaway: "YAML ofera o structura ierarhica lizibila si elimina repetarea prefixelor, fiind formatul standard preferat in aplicatii moderne."
  },
  {
    id: "spring-30",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este un Spring Boot Starter?",
    question: "Ce este un Spring Boot Starter si cum simplifica managementul dependintelor in Maven sau Gradle?",
    answer: "1. Ce este un Starter:\\n   - Un descriptor de dependinte agregat (un set curatoriat de dependinte gata testate sa fie compatibile intre ele).\\n   - Denumirea standard oficiala: spring-boot-starter-* (ex: spring-boot-starter-web, starter-data-jpa, starter-security, starter-test).\\n\\n2. Ce problema rezolva:\\n   - Inainte de Spring Boot, trebuia sa cauti si sa adaugi manual 10-15 dependinte diferite (spring-core, spring-web, spring-webmvc, jackson-databind, tomcat-embed, hibernate-core) si sa te asiguri ca versiunile lor nu intra in conflict (Dependency Hell!).\\n   - Cu un Starter, adaugi o singura linie in pom.xml, iar Spring Boot aduce automat toate bibliotecile necesare cu versiuni compatibile garantate.",
    codeSnippet: `<!-- O singura dependinta aduce Tomcat, Jackson, Spring MVC, Validari etc. -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>`,
    interviewTrap: "Starters-urile create de comunitate (third-party) au conventia de nume inversa: myproject-spring-boot-starter, in timp ce cele oficiale incep cu spring-boot-starter-.",
    keyTakeaway: "Spring Boot Starter agrega toate dependintele compatibile necesare unui modul intr-o singura dependinta simpla."
  },
  {
    id: "spring-31",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Rolul lui spring-boot-starter-parent in pom.xml",
    question: "Ce rol are parintele spring-boot-starter-parent in fisierul pom.xml al unui proiect Maven?",
    answer: "1. Ce ofera spring-boot-starter-parent:\\n   - Managementul Versiunilor (Dependency Management): Poti adauga dependinte populare (Jackson, Hibernate, Lombok, MySQL driver) FARA sa mai specifici eticheta <version>! Versiunile optime si compatibile sunt mostenite automat din parinte.\\n   - Plugin-uri gata configurate: Configureaza automat plugin-ul spring-boot-maven-plugin pentru a crea Fat JAR-uri executabile.\\n   - Setari implicite de compilare Java: Sursa UTF-8, versiune tinta de bytecode Java (17/21).\\n   - Filtrare de resurse: Configureaza procesarea variabilelor din application.properties.",
    codeSnippet: `<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.2.0</version>
</parent>

<dependencies>
    <!-- Fara <version>! Este gestionat automat de parent: -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
    </dependency>
</dependencies>`,
    interviewTrap: "Daca proiectul tau trebuie sa mosteneasca alt parent Maven, poti importa dependintele Spring Boot folosind <scope>import</scope> in <dependencyManagement>.",
    keyTakeaway: "spring-boot-starter-parent gestioneaza centralizat versiunile dependintelor si configureaza plugin-urile de build si compilare."
  },
  {
    id: "spring-32",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Rularea aplicatiei Spring Boot din linia de comanda",
    question: "Care sunt principalele moduri de a rula o aplicatie Spring Boot din terminal?",
    answer: "1. In faza de dezvoltare (folosind Maven/Gradle wrapper):\\n   - ./mvnw spring-boot:run (pe Linux/Mac) sau .\\mvnw.cmd spring-boot:run (pe Windows).\\n   - Nu necesita impachetarea prealabila a unui JAR fizic pe disc; recompileaza si porneste rapid.\\n\\n2. In mediul de productie (folosind Fat JAR-ul compilat):\\n   - Pasul 1: Construirea JAR-ului cu teste sarite: ./mvnw clean package -DskipTests.\\n   - Pasul 2: Rularea nativa pe masina virtuala: java -jar target/my-app-1.0.0.jar.\\n\\n3. Pasarea de parametri la rulare:\\n   - java -jar app.jar --server.port=9090 --spring.profiles.active=prod.",
    codeSnippet: `# Compilare:
./mvnw clean package

# Executie productie:
java -jar target/app.jar --spring.profiles.active=prod`,
    interviewTrap: "Nu folosi mvn spring-boot:run in containere de productie; construieste un JAR si ruleaza-l cu comanda standard java -jar.",
    keyTakeaway: "In dezvoltare rulezi cu ./mvnw spring-boot:run; in productie impachetezi si rulezi JAR-ul cu java -jar app.jar."
  },
  {
    id: "spring-33",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este Spring Boot DevTools si cand ajuta?",
    question: "Ce functionalitati ofera modulul spring-boot-devtools in faza de dezvoltare?",
    answer: "1. Automatic Restart (Repornire rapida):\\n   - DevTools foloseste doua ClassLoadere: unul pentru clasele de baza (care nu se schimba) si unul pentru codul tau.\\n   - Cand modifici o clasa Java si compilezi (Ctrl+F9 / Save), DevTools reincarca doar codul tau, repornind aplicatia in sub 1 secunda (mult mai rapid decat o repornire completa cold startup).\\n\\n2. LiveReload:\\n   - Trimite un trigger catre browser pentru a reincarca automat pagina web cand se modifica fisiere statice sau sabloane HTML.\\n\\n3. Dezactivarea Cache-urilor de sabloane:\\n   - Dezactiveaza automat cache-ul pentru Thymeleaf sau FreeMarker pentru a vedea modificarile HTML imediat.\\n\\n4. Comportament in Productie:\\n   - Este dezactivat automat cand aplicatia este impachetata cu java -jar.",
    codeSnippet: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
    <scope>runtime</scope>
    <optional>true</optional>
</dependency>`,
    interviewTrap: "DevTools este exclus automat din Fat JAR-ul final daca dependinta are eticheta <optional>true</optional>.",
    keyTakeaway: "DevTools ofera auto-restart rapid si LiveReload in timpul dezvoltarii, fiind dezactivat automat in productie."
  },
  {
    id: "spring-34",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Adnotarea @ConditionalOnProperty in Spring Boot",
    question: "Cum functioneaza adnotarea @ConditionalOnProperty si cand este utila?",
    answer: "1. Rolul adnotarii:\\n   - Permite instantierea conditionata a unui Bean sau a unei clase @Configuration in functie de prezenta si valoarea unei proprietati din application.properties / application.yml.\\n\\n2. Parametri principali:\\n   - name / value: numele proprietatii verificate (ex: \"features.sms-notifications.enabled\").\\n   - havingValue: valoarea asteptata pentru activare (ex: \"true\").\\n   - matchIfMissing: daca este setat pe true, bean-ul va fi creat chiar daca proprietatea lipseste complet din fisierul de configurare.\\n\\n3. Utilizare tipica:\\n   - Feature Toggles (activarea sau dezactivarea de module fara a modifica codul sursa, doar din fisierul de configurare).",
    codeSnippet: `@Service
@ConditionalOnProperty(
    prefix = "app.payment",
    name = "stripe.enabled",
    havingValue = "true",
    matchIfMissing = false
)
public class StripePaymentService implements PaymentService {
    // Se instantiaza DOAR daca app.payment.stripe.enabled=true
}`,
    interviewTrap: "Daca matchIfMissing=false si omiti proprietatea din config, bean-ul nu va fi creat, iar clasele care il cer prin injectie vor arunca NoSuchBeanDefinitionException daca nu sunt @Nullable.",
    keyTakeaway: "@ConditionalOnProperty activeaza bean-uri pe baza flag-urilor din configurare, fiind ideal pentru Feature Toggling."
  },
  {
    id: "spring-35",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "@Configuration cu proxyBeanMethods = true vs false",
    question: "Ce inseamna proxyBeanMethods intr-o clasa @Configuration si care este diferenta dintre modul \"Full\" si modul \"Lite\"?",
    answer: "1. Modul \"Full\" (Implicit / proxyBeanMethods = true):\\n   - Spring creeaza un CGLIB Proxy peste clasa de configurare.\\n   - Daca o metoda @Bean apeleaza o alta metoda @Bean din aceeasi clasa (inter-bean call: dataSource()), apelul este interceptat de proxy.\\n   - Proxy-ul verifica daca instanta exista deja in ApplicationContext si returneaza instanta Singleton existenta in loc sa o creeze a doua oara!\\n\\n2. Modul \"Lite\" (proxyBeanMethods = false):\\n   - Nu se mai genereaza proxy CGLIB.\\n   - Pornirea aplicatiei este mai rapida si consuma mai putina memorie.\\n   - Daca o metoda @Bean apeleaza alta metoda @Bean direct, se va crea un obiect NOU de fiecare data, spargand principiul de Singleton!\\n\\n3. Cand se foloseste false:\\n   - In Spring Boot modern, cand metodele @Bean nu se apeleaza intre ele, ci isi primesc dependintele ca parametri in semnatura metodei.",
    codeSnippet: `@Configuration(proxyBeanMethods = false) // Modul Lite (rapid)
public class ModernConfig {

    @Bean
    public Engine engine() { return new Engine(); }

    @Bean // Recomandat: primeste dependinta ca parametru, nu prin apel intern!
    public Car car(Engine engine) {
        return new Car(engine);
    }
}`,
    interviewTrap: "In modul Lite (proxyBeanMethods=false), scrierea return new Car(engine()); va apela metoda Java simpla si va crea un al doilea obiect Engine diferit de cel gestionat de Spring.",
    keyTakeaway: "proxyBeanMethods=true foloseste proxy CGLIB pentru a garanta instante singleton la apeluri directe intre metode @Bean; false este mai usor dar cere injectie prin parametri."
  },
  {
    id: "spring-36",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Injectarea tuturor Bean-urilor unei interfete intr-o Lista",
    question: "Cum injectezi automat toate implementarile unei interfete intr-un singur serviciu?",
    answer: "1. Comportamentul inteligent al Spring DI:\\n   - Daca mai multe bean-uri implementeaza aceeasi interfata si declari ca dependinta o colectie (ex: List<PaymentHandler> sau Map<String, PaymentHandler>):\\n   - Spring va colecta automat TOATE bean-urile gasite din context care implementeaza acea interfata si le va injecta in lista!\\n\\n2. Map<String, Interface>:\\n   - Cheia din Map este numele Bean-ului (ex: \"paypalHandler\"), iar valoarea este instanta bean-ului.\\n\\n3. Utilizare clasica (Pattern Strategy curat):\\n   - Elimina switch-urile greoaie: poti alege dinamic handler-ul potrivit la runtime.",
    codeSnippet: `public interface ExportService { void export(); String getType(); }

@Service
public class ExportManager {
    // Spring injecteaza automat toate bean-urile ExportService:
    private final List<ExportService> exporters;

    public ExportManager(List<ExportService> exporters) {
        this.exporters = exporters;
    }

    public void exportAll() {
        exporters.forEach(ExportService::export);
    }
}`,
    interviewTrap: "Poti controla ordinea elementelor din lista adaugand adnotarea @Order pe fiecare clasa de implementare in parte.",
    keyTakeaway: "Spring poate injecta automat o List<T> sau Map<String, T> cu toate implementarile unei interfete din context."
  },
  {
    id: "spring-37",
    category: 'SPRING',
    difficulty: "USOR",
    title: "CommandLineRunner si ApplicationRunner",
    question: "Ce rol au interfetele CommandLineRunner si ApplicationRunner si cand se executa metoda lor run()?",
    answer: "1. Rolul principal:\\n   - Sunt interfete folosite pentru a executa cod o singura data, IMEDIAT DUPA ce SpringApplication a pornit complet si ApplicationContext este 100% initializat.\\n   - Se folosesc frecvent pentru popularea initiala a bazei de date (seed data), verificari de conectivitate sau warmup de cache.\\n\\n2. Diferenta dintre ele:\\n   - CommandLineRunner: metoda run(String... args) primeste argumentele din linia de comanda ca un array simplu de String-uri (varargs).\\n   - ApplicationRunner: metoda run(ApplicationArguments args) primeste un wrapper avansat care stie sa parseze optiuni cu cheie si valoare (ex: --env=dev).",
    codeSnippet: `@Component
public class DatabaseSeeder implements CommandLineRunner {
    private final UserRepository userRepo;

    public DatabaseSeeder(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        if (userRepo.count() == 0) {
            userRepo.save(new User("admin", "admin@test.com"));
            System.out.println("Baza de date populata cu utilizator default!");
        }
    }
}`,
    interviewTrap: "Daca ai mai multi runneri in aplicatie, le poti stabili ordinea de executie adaugand adnotarea @Order(1), @Order(2) pe fiecare clasa.",
    keyTakeaway: "CommandLineRunner si ApplicationRunner ruleaza cod de initializare dupa ce contextul Spring s-a pornit complet."
  },
  {
    id: "spring-38",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Component Scanning si Capcana Pachetului Radacina",
    question: "Cum functioneaza @ComponentScan si de ce clasele din afara pachetului clasei principale nu sunt detectate?",
    answer: "1. Regula implicita de scanare a @ComponentScan:\\n   - Daca nu specifici niciun pachet explicit, @ComponentScan incepe scanarea din PACHETUL in care este declarata clasa curenta (adica clasa adnotata cu @SpringBootApplication) si scaneaza recursiv TOATE sub-pachetele din interiorul acestuia.\\n\\n2. Capcana claselor din afara:\\n   - Daca clasa principala este in com.example.app, iar tu creezi un controller in com.example.other sau com.service:\\n   - Spring Boot NU il va scana si NU va crea un bean pentru el! Vei primi 404 Not Found sau NoSuchBeanDefinitionException.\\n\\n3. Solutia corecta:\\n   - Plaseaza clasa principala in pachetul radacina al proiectului (ex: com.mycompany.app).\\n   - Daca este neaparat nevoie, specifica explicit scanBasePackages = {\"com.mycompany.app\", \"com.external\"}.",
    codeSnippet: `// Structura recomandata:
// com.example.myproject
//    ├── Application.java (adnotat cu @SpringBootApplication) -> scaneaza tot ce e mai jos!
//    ├── controller
//    ├── service
//    └── repository`,
    interviewTrap: "Nu pune niciodata clasa @SpringBootApplication in pachetul default (fara package declaration), deoarece Spring va incerca sa scaneze intregul JAR si classpath, ducand la startup lent si erori.",
    keyTakeaway: "Spring scaneaza doar pachetul clasei @SpringBootApplication si sub-pachetele sale; clasele paralele sunt ignorate fara scanBasePackages."
  },
  {
    id: "spring-39",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Validarea proprietatilor cu @ConfigurationProperties si @Validated",
    question: "Cum adaugam validari stricte pe proprietatile de configurare din application.yml?",
    answer: "1. De ce este important:\\n   - Daca cineva uita sa seteze o cheie secreta sau un port in application.yml, vrei ca aplicatia sa CRAPE IMEDIAT la startup (Fail-Fast), in loc sa porneasca si sa crape dupa ore bune in productie la primul apel de plata!\\n\\n2. Cum se implementeaza:\\n   - Se adauga adnotarea @Validated peste clasa adnotata cu @ConfigurationProperties.\\n   - Se folosesc adnotarile standard Jakarta Validation: @NotNull, @NotBlank, @Min, @Max, @Email pe campuri sau pe componentele Record-ului.\\n   - La pornire, daca o proprietate nu respecta conditia, Spring Boot refuza sa porneasca si afiseaza un mesaj clar de eroare in consola.",
    codeSnippet: `@ConfigurationProperties(prefix = "payment.gateway")
@Validated
public class PaymentGatewayProperties {

    @NotBlank(message = "Cheia API nu poate fi goala!")
    private String apiKey;

    @Min(value = 1000, message = "Timeout-ul minim este 1000ms")
    private int timeoutMs;

    // Getteri si setteri...
}`,
    interviewTrap: "Daca uiti adnotarea @Validated, adnotarile @NotBlank sau @Min vor fi complet ignorate pe clasa de configurare!",
    keyTakeaway: "Combinarea @ConfigurationProperties cu @Validated asigura validarea proprietatilor la startup conform principiului Fail-Fast."
  },
  {
    id: "spring-40",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ierarhia de prioritati la incarcarea proprietatilor in Spring Boot",
    question: "Daca o proprietate este definita atat in application.yml, cat si ca variabila de mediu si argument CLI, care castiga?",
    answer: "Spring Boot are o ordine riguroasa de prioritati (din peste 15 surse), unde proprietatile din sursele de nivel mai inalt le suprascriu pe cele de nivel mai jos:\\n\\nOrdinea celor mai utilizate surse (de la CEA MAI MARE prioritate la cea mai mica):\\n1. Argumente din linia de comanda (Command line arguments: --server.port=9090) -> CASTIGA INTOTDEAUNA!\\n2. Proprietati de sistem Java (System.getProperties(): -Dserver.port=9090).\\n3. Variabile de mediu ale sistemului de operare (OS Environment Variables: SERVER_PORT=9090).\\n4. Fisiere specifice de profil din afara JAR-ului (config/application-prod.properties).\\n5. Fisiere specifice de profil din interiorul JAR-ului (application-prod.properties in classpath).\\n6. Fisiere de configurare generale (application.yml in classpath) -> CEA MAI MICA prioritate!",
    codeSnippet: `# 1. In application.yml:
server.port: 8080

# 2. In Docker / OS Environment:
# export SERVER_PORT=8082  (Suprascrie 8080!)

# 3. La rulare:
# java -jar app.jar --server.port=9090  (Suprascrie tot, castiga 9090!)`,
    interviewTrap: "Variabilele de mediu din OS folosesc litere mari si underscore (SERVER_PORT) si mapeaza automat pe proprietati Spring camelCase sau dot-separated gratie Relaxed Binding.",
    keyTakeaway: "Argumentele CLI au cea mai mare prioritate, urmate de variabilele de mediu OS, iar fisierele application.yml din classpath au cea mai mica prioritate."
  },
  {
    id: "spring-41",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Interfata Environment din Spring Boot",
    question: "Ce este interfata Environment si cum citesti proprietati si profile active in mod programatic?",
    answer: "1. Ce este Environment:\\n   - O interfata de abstractizare a mediului de rulare gestionata de ApplicationContext.\\n   - Combina cele doua aspecte cheie ale configuratiei: Profilele active si Sursele de proprietati (PropertySources).\\n\\n2. Utilizare practica:\\n   - Poti injecta Environment direct in orice clasa prin constructor.\\n   - Permite citirea dinamica a unei proprietati: env.getProperty(\"app.secret\") sau env.getProperty(\"app.port\", Integer.class, 8080).\\n   - Permite verificarea profilelor: env.getActiveProfiles(), env.matchesProfiles(\"dev | test\").",
    codeSnippet: `@Service
public class EnvironmentHelper {
    private final Environment env;

    public EnvironmentHelper(Environment env) {
        this.env = env;
    }

    public void printInfo() {
        String port = env.getProperty("server.port", "8080");
        String[] profiles = env.getActiveProfiles();
        System.out.println("Rulam pe portul " + port + " cu profilele: " + Arrays.toString(profiles));
    }
}`,
    interviewTrap: "Desi poti citi proprietati cu env.getProperty(), in cod de business se prefera @Value sau @ConfigurationProperties pentru lizibilitate si type safety.",
    keyTakeaway: "Interfata Environment ofera acces programatic la proprietatile aplicatiei si la lista profilelor active."
  },
  {
    id: "spring-42",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Ce este ApplicationContextAware si cand se foloseste?",
    question: "Ce rol are interfata ApplicationContextAware si care este riscul cuplarii cu Spring API?",
    answer: "1. Ce face ApplicationContextAware:\\n   - Face parte din familia de interfete \"Aware\" din Spring.\\n   - Daca un bean implementeaza aceasta interfata, Spring ii apeleaza automat metoda setApplicationContext(ApplicationContext context) in faza de initializare, transmitandu-i o referinta directa catre containerul IoC.\\n\\n2. Cand se foloseste:\\n   - In utilitare avansate de infrastructura, framework-uri interne sau cand ai nevoie sa obtii dinamic bean-uri dupa nume la runtime: context.getBean(\"myBean\").\\n\\n3. Riscul cuplarii (Anti-Pattern in cod de business):\\n   - Cupleaza strans clasa ta de API-ul intern Spring, distrugand decuplarea oferita de Dependency Injection.\\n   - In loc de Inversion of Control, treci la pattern-ul Service Locator, care este mai greu de testat si mentinut.",
    codeSnippet: `@Component
public class SpringContextHolder implements ApplicationContextAware {
    private static ApplicationContext context;

    @Override
    public void setApplicationContext(ApplicationContext ctx) {
        context = ctx; // Salvare referinta statica
    }

    public static <T> T getBean(Class<T> clazz) {
        return context.getBean(clazz);
    }
}`,
    interviewTrap: "Foloseste interfetele Aware doar pentru cod de infrastructura; nu le folosi in serviciile de business unde injectia clasica prin constructor este solutia corecta.",
    keyTakeaway: "ApplicationContextAware ofera acces direct la containerul IoC, dar cupleaza codul de Spring si trebuie folosit cu retinere."
  },
  {
    id: "spring-43",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Web Scopes in Spring: Request, Session si Application",
    question: "Care sunt Web Scopes disponibile intr-o aplicatie Spring Web si ce durata de viata au?",
    answer: "Pe langa Singleton si Prototype din Spring Core, intr-o aplicatie web sunt disponibile 3 scopuri suplimentare:\\n\\n1. Request Scope (@RequestScope / @Scope(\"request\")):\\n   - O instanta NOUA a bean-ului este creata pentru fiecare cerere HTTP individuala.\\n   - Este distrusa automat cand cererea HTTP se incheie.\\n   - Utilizare: Stocarea datelor specifice cererii curente (ex: tracing id, IP client, timer de request).\\n\\n2. Session Scope (@SessionScope / @Scope(\"session\")):\\n   - O instanta este creata per sesiune HTTP (HttpSession) de utilizator.\\n   - Traieste atata timp cat sesiunea utilizatorului este activa (sau pana la timeout).\\n   - Utilizare clasica: Cosul de cumparaturi intr-un magazin online traditional.\\n\\n3. Application Scope (@ApplicationScope):\\n   - O instanta per ServletContext (similar cu Singleton, dar legat de ServletContext).",
    codeSnippet: `@Component
@RequestScope // Creat la fiecare HTTP Request!
public class RequestContext {
    private String requestId = UUID.randomUUID().toString();
    public String getRequestId() { return requestId; }
}`,
    interviewTrap: "Daca injectezi un bean RequestScope intr-un Singleton fara proxyMode = ScopedProxyMode.TARGET_CLASS, vei primi eroare la startup pentru ca nu exista un HTTP request activ la pornire!",
    keyTakeaway: "RequestScope traieste pe durata unei cereri HTTP; SessionScope traieste pe durata sesiunii HTTP a utilizatorului."
  },
  {
    id: "spring-44",
    category: 'SPRING',
    difficulty: "USOR",
    title: "De ce NU poti injecta dependinte in variabile statice cu @Autowired?",
    question: "Ce se intampla daca pui @Autowired pe o variabila static si cum se rezolva daca ai nevoie de un utilitar static?",
    answer: "1. De ce nu functioneaza:\\n   - Variabilele statice (static) apartin CLASEI, nu instantei particulare a obiectului.\\n   - Spring gestioneaza dependintele pe INSTANTE de obiecte (Beans) create pe Heap la runtime.\\n   - Daca scrii @Autowired private static MyRepo repo;, campul repo va ramane NULL, iar la apelare vei primi NullPointerException!\\n\\n2. Cum se rezolva daca ai neaparata nevoie:\\n   - Injectie prin setter non-static:\\n     @Autowired public void setRepo(MyRepo repo) { StaticClass.repo = repo; }\\n\\n3. Regula de Clean Code:\\n   - Utilizarea dependintelor statice in servicii este un anti-pattern. Transforma clasa de utilitare intr-un Spring Bean (@Component) si injecteaz-o normal prin constructor.",
    codeSnippet: `// GRESIT: repo va fi NULL!
@Component
public class BadStaticUtil {
    @Autowired
    private static UserRepository repo; // Ramane NULL!
}

// SOLUTIE RECOMANDATA: Fa utilitarul un Spring Bean normal!
@Component
public class CleanUtil {
    private final UserRepository repo;
    public CleanUtil(UserRepository repo) { this.repo = repo; }
}`,
    interviewTrap: "La interviu explica de ce metodele statice care depind de baze de date sunt greu de mock-uit si testat unitar in JUnit.",
    keyTakeaway: "Spring nu injecteaza campuri statice; fa clasele de utilitate componente Spring si injecteaza-le prin constructor."
  },
  {
    id: "spring-45",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Ce este ObjectProvider<T> in Spring?",
    question: "Ce avantaje ofera interfata ObjectProvider<T> introdusa in Spring 4.3 pentru injectia de dependinte?",
    answer: "1. Ce este ObjectProvider<T>:\\n   - O extensie a interfetei standard javax.inject.Provider, creata special pentru rezolvarea flexibila a dependentelor.\\n\\n2. Avantaje si functionalitati:\\n   - Dependinte Optionale fara NullPointerException: getIfAvailable() returneaza bean-ul sau null/default daca nu exista in context, fara sa arunce eroare la startup.\\n   - Rezolvarea dependentelor Prototype: apelul provider.getObject() instantiaza un bean prototype nou la fiecare cerere.\\n   - Iterare peste multiple bean-uri: permite parcurgerea printr-un Stream cu provider.stream().\\n   - Decuplare pentru prevenirea dependentelor circulare.",
    codeSnippet: `@Service
public class NotificationSender {
    private final ObjectProvider<SmsGateway> smsGatewayProvider;

    public NotificationSender(ObjectProvider<SmsGateway> provider) {
        this.smsGatewayProvider = provider;
    }

    public void notifyUser() {
        // Daca exista SmsGateway in context, il folosim:
        SmsGateway gateway = smsGatewayProvider.getIfAvailable();
        if (gateway != null) {
            gateway.send();
        }
    }
}`,
    interviewTrap: "ObjectProvider inlocuieste vechiul Optional<T> la injectie si previne blocarea startup-ului cand un bean este optional.",
    keyTakeaway: "ObjectProvider<T> gestioneaza sigur dependinte optionale (getIfAvailable) si instante prototype noi (getObject)."
  },
  {
    id: "spring-46",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Cum creezi un Custom Starter in Spring Boot?",
    question: "Care sunt cele doua module componente ale unui Custom Spring Boot Starter si cum se structureaza?",
    answer: "Conform conventiei oficiale Spring Boot, crearea unui Starter reutilizabil se imparte in doua module:\\n\\n1. Modulul de Auto-Configuration (ex: myfeature-spring-boot-autoconfigure):\\n   - Contine codul clasei @AutoConfiguration, adnotarile conditionale (@ConditionalOnClass, @ConditionalOnMissingBean), clasa @ConfigurationProperties si logica efectiva de instantiere a bean-urilor.\\n   - Inregistreaza clasa in META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports.\\n\\n2. Modulul Starter (ex: myfeature-spring-boot-starter):\\n   - Este un modul gol (\"empty jar\") fara cod sursa Java!\\n   - Contine doar fisierul pom.xml care adauga ca dependinte: modulul de autoconfigure si toate bibliotecile externe necesare.\\n   - Utilizatorii finali vor adauga in proiectul lor doar aceasta dependinta starter.",
    codeSnippet: `<!-- Structura unui Custom Starter pom.xml -->
<dependencies>
    <dependency>
        <groupId>com.mycompany</groupId>
        <artifactId>myfeature-spring-boot-autoconfigure</artifactId>
        <version>1.0.0</version>
    </dependency>
</dependencies>`,
    interviewTrap: "Numele starterelor custom nu trebuie sa inceapa cu spring-boot-starter (acesta este rezervat de echipa Spring); foloseste formatul name-spring-boot-starter.",
    keyTakeaway: "Un starter custom separa modulul de autoconfiguration (codul si proprietatile) de modulul starter (agregatorul de dependinte din pom.xml)."
  },
  {
    id: "spring-47",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Excluderea unei autoconfigurari specifice in Spring Boot",
    question: "Cum dezactivezi o clasa de autoconfigurare automata daca nu doresti comportamentul ei implicit?",
    answer: "Exista doua moduri standard de a exclude o clasa de autoconfigurare:\\n\\n1. Direct din cod pe adnotarea @SpringBootApplication:\\n   - @SpringBootApplication(exclude = {DataSourceAutoConfiguration.class, SecurityAutoConfiguration.class})\\n   - Utilizare clasica: Daca ai dependenta de JPA/Security in pom dar nu doresti sa porneasca baza sau securitatea temporar.\\n\\n2. Din fisierul de configurare application.yml (fara re-compilare de cod):\\n   - spring.autoconfigure.exclude: org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration.",
    codeSnippet: `// 1. In cod Java:
@SpringBootApplication(exclude = {DataSourceAutoConfiguration.class})
public class NoDbApplication {
    public static void main(String[] args) {
        SpringApplication.run(NoDbApplication.class, args);
    }
}

# 2. Sau in application.yml:
# spring:
#   autoconfigure:
#     exclude: org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration`,
    interviewTrap: "Excluderea autoconfigurarii nu sterge dependinta din classpath, ci doar impiedica rularea clasei specifice de autoconfigurare la startup.",
    keyTakeaway: "Poti exclude autoconfigurari specifice prin parametrul exclude din @SpringBootApplication sau prin proprietatea spring.autoconfigure.exclude."
  },
  {
    id: "spring-48",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Incarcarea fisierelor din classpath (ResourceLoader si Resource)",
    question: "Cum citesti un fisier din directorul src/main/resources in Spring Boot?",
    answer: "In Spring exista doua metode simple si elegante pentru a citi resurse din classpath:\\n\\n1. Folosind adnotarea @Value cu prefixul \"classpath:\":\\n   - @Value(\"classpath:data/template.json\") private Resource templateResource;\\n   - Clasa org.springframework.core.io.Resource ofera metode ca getInputStream() sau getContentAsString(StandardCharsets.UTF_8).\\n\\n2. Folosind interfata ResourceLoader:\\n   - resourceLoader.getResource(\"classpath:data/template.json\").\\n\\n3. De ce este corect sa folosesti Resource.getInputStream():\\n   - Daca folosesti new File(\"src/...\"), codul va crapa cand aplicatia este impachetata intr-un JAR pe un server, deoarece fisierele din interiorul unui JAR nu sunt fisiere fizice de pe disc!",
    codeSnippet: `@Service
public class TemplateReader {
    @Value("classpath:templates/email.html")
    private Resource emailTemplate;

    public String loadTemplate() throws IOException {
        // Functioneaza garantat si cand aplicatia ruleaza dintr-un JAR:
        return emailTemplate.getContentAsString(StandardCharsets.UTF_8);
    }
}`,
    interviewTrap: "Nu folosi niciodata new File() pentru fisiere din resources! Cand aplicatia ruleaza ca JAR, se va arunca FileNotFoundException. Foloseste intotdeauna Resource sau ClassPathResource.",
    keyTakeaway: "Fisierele din resources se citesc folosind abstractizarea Resource si getInputStream(), garantand functionarea in interiorul unui JAR executabil."
  },
  {
    id: "spring-49",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarea @Import in Spring",
    question: "Ce rol are adnotarea @Import si cum permite combinarea claselor de configurare?",
    answer: "1. Ce face @Import:\\n   - Permite incarcarea explicita a uneia sau mai multor clase @Configuration sau simple componente in ApplicationContext, chiar daca acestea se afla in afara zonei de @ComponentScan!\\n\\n2. Cazuri de utilizare frecvente:\\n   - Organizarea configuratiilor: clasa principala de config poate importa configuratii modulare: @Import({SecurityConfig.class, DatabaseConfig.class}).\\n   - In teste de integrare: cand folosesti @WebMvcTest sau un test feliat si ai nevoie de o componenta specifica de securitate sau utilitar care nu a fost incarcata automat, o importi manual cu @Import(MySecurityHelper.class).\\n   - Importul de clase Selector (ImportSelector, ImportBeanDefinitionRegistrar) pentru biblioteci avansate.",
    codeSnippet: `@Configuration
@Import({DataSourceConfig.class, SwaggerConfig.class})
public class MainAppConfig {
    // Agreaza configuratiile modulare
}`,
    interviewTrap: "In testele feliate (@WebMvcTest), @Import este salvarea ta cand Controller-ul depinde de un filtru sau configurare care nu a fost incarcata automat in slice.",
    keyTakeaway: "@Import include explicit clase de configurare sau bean-uri in contextul Spring, fiind foarte util in modularizare si teste."
  },
  {
    id: "spring-50",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Graceful Shutdown in Spring Boot",
    question: "Ce este Graceful Shutdown in Spring Boot si cum previne intreruperea brusca a cererilor in desfasurare?",
    answer: "1. Ce este Graceful Shutdown:\\n   - Cand aplicatia primeste un semnal de oprire de la sistemul de operare sau Kubernetes (SIGTERM), comportamentul default era oprirea imediata, ducand la conexiuni HTTP rupte si tranzactii incomplete (502 Bad Gateway).\\n   - Graceful Shutdown configureaza serverul Embedded (Tomcat/Jetty):\\n     1. Opreste IMEDIAT acceptarea de cereri noi (returneaza 503 Service Unavailable noilor veniti).\\n     2. Permite cererilor aflate DEJA in executie sa se finalizeze intr-o perioada limita de gratie (grace period, ex: 30 de secunde).\\n     3. Cand toate cererile active s-au incheiat, opreste containerul si elibereaza resursele curat.\\n\\n2. Cum se activeaza in application.yml:\\n   - server.shutdown=graceful\\n   - spring.lifecycle.timeout-per-shutdown-phase=30s.",
    codeSnippet: `# Activare Graceful Shutdown:
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s`,
    interviewTrap: "Daca o cerere ramane blocata (ex: timeout pe apel extern), dupa expirarea perioadei de gratie (30s) serverul se va opri fortat pentru a nu ramane blocat.",
    keyTakeaway: "Graceful shutdown blocheaza cererile noi si finalizeaza cererile in curs inainte de oprirea serverului, esential pentru deployments fara downtime in Kubernetes."
  },
  {
    id: "spring-51",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Cum functioneaza DispatcherServlet in Spring MVC",
    question: "Ce este DispatcherServlet in Spring MVC si cum implementeaza Front Controller Pattern?",
    answer: "1. Ce este DispatcherServlet:\\n   - Este inima arhitecturii Spring MVC. Un Servlet central care primeste TOATE cererile HTTP destinate aplicatiei (mapat de regula pe \"/\" in web container).\\n   - Implementeaza sablonul de proiectare Front Controller Pattern (un singur punct de intrare pentru toate request-urile).\\n\\n2. Fluxul unei cereri prin DispatcherServlet:\\n   1. Primeste cererea HTTP de la client (browser/Postman).\\n   2. Consulta HandlerMapping pentru a identifica ce Controller si metoda corespund URL-ului si metodei HTTP cerute.\\n   3. Apeleaza HandlerAdapter pentru a invoca metoda Controller-ului.\\n   4. Controller-ul apeleaza logica de business din Service si returneaza datele (sau un nume de view).\\n   5. Daca este @RestController, HttpMessageConverter (Jackson) serializeaza direct obiectul in JSON si il trimite in HTTP Response Body.\\n   6. Daca apar exceptii pe parcurs, HandlerExceptionResolver (@ControllerAdvice) le intercepteaza si formateaza un raspuns de eroare.",
    codeSnippet: `// Fluxul simplificat:
// Client HTTP Request
//        ↓
// DispatcherServlet (Front Controller)
//        ↓
// HandlerMapping (Gaseste Controller-ul)
//        ↓
// Controller (@RestController) -> Service -> Repository
//        ↓
// HttpMessageConverter (Jackson converteste in JSON)
//        ↓
// Client HTTP Response (JSON + Status Code)`,
    interviewTrap: "Daca intervievatorul intreaba cum ajunge o cerere de la Tomcat la metoda ta @GetMapping, explica rolul lui DispatcherServlet si HandlerMapping.",
    keyTakeaway: "DispatcherServlet este Front Controller-ul Spring MVC care receptioneaza toate cererile si le ruteaza catre controllere prin HandlerMapping."
  },
  {
    id: "spring-52",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarile de mapare HTTP: @GetMapping, @PostMapping etc.",
    question: "Care sunt adnotarile scurtatura pentru metodele HTTP in Spring MVC si care este corespondenta lor cu operatiile CRUD?",
    answer: "Incepand cu Spring 4.3, au fost introduse adnotari compuse care inlocuiesc vechea sintaxa @RequestMapping(method = RequestMethod.GET):\\n\\n1. @GetMapping: Citire de resurse (READ / SELECT). Nu trebuie sa modifice starea pe server (idempotent si safe).\\n2. @PostMapping: Creare de resurse noi (CREATE / INSERT). Nu este idempotent (apeluri multiple pot crea duplicate).\\n3. @PutMapping: Actualizare completa a unei resurse existente sau inlocuire (UPDATE complet). Este idempotent (acelasi apel repetat produce aceeasi stare).\\n4. @PatchMapping: Actualizare partiala a catorva campuri ale unei resurse existente (UPDATE partial).\\n5. @DeleteMapping: Stergerea unei resurse (DELETE). Este idempotent.",
    codeSnippet: `@RestController
@RequestMapping("/api/products")
public class ProductController {

    @GetMapping("/{id}")
    public ProductDto getById(@PathVariable Long id) { ... }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductDto create(@RequestBody @Valid ProductCreateDto dto) { ... }

    @PutMapping("/{id}")
    public ProductDto updateFull(@PathVariable Long id, @RequestBody ProductDto dto) { ... }

    @PatchMapping("/{id}")
    public ProductDto updatePartial(@PathVariable Long id, @RequestBody Map<String, Object> updates) { ... }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) { ... }
}`,
    interviewTrap: "Folosirea @GetMapping pentru a sterge sau modifica date (ex: /delete-user?id=5) este o violare grava a standardului HTTP si creeaza vulnerabilitati de securitate (CSRF).",
    keyTakeaway: "@GetMapping (Read), @PostMapping (Create), @PutMapping (Update complet), @PatchMapping (Update partial) si @DeleteMapping (Delete)."
  },
  {
    id: "spring-53",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@PathVariable vs @RequestParam in Spring MVC",
    question: "Care este diferenta dintre @PathVariable si @RequestParam si cum arata URL-ul pentru fiecare?",
    answer: "1. @PathVariable (Path Parameter):\\n   - Extrage o valoare integrata direct in calea URI-ului: /api/users/{id}\\n   - URL exemplu: http://localhost:8080/api/users/42\\n   - Se foloseste pentru identificarea unica a unei resurse specifice (identificator de resursa).\\n\\n2. @RequestParam (Query Parameter):\\n   - Extrage valori din sirul de query dupa semnul intrebarii (?key=value&k2=v2): /api/users?status=ACTIVE&page=1\\n   - URL exemplu: http://localhost:8080/api/users?role=ADMIN&sort=name\\n   - Se foloseste pentru filtrare, sortare, paginare sau parametri optionali.\\n   - Suporta parametri optionali (required = false) si valori default (defaultValue = \"0\").",
    codeSnippet: `@RestController
@RequestMapping("/api/orders")
public class OrderController {

    // URL: /api/orders/105 -> id este 105
    @GetMapping("/{id}")
    public OrderDto getOrder(@PathVariable Long id) {
        return orderService.findById(id);
    }

    // URL: /api/orders?status=PENDING&page=0
    @GetMapping
    public List<OrderDto> filterOrders(
        @RequestParam(required = false, defaultValue = "ALL") String status,
        @RequestParam(defaultValue = "0") int page
    ) {
        return orderService.findOrders(status, page);
    }
}`,
    interviewTrap: "In mod implicit, atat @PathVariable cat si @RequestParam sunt obligatorii (required = true). Daca lipsesc din cerere, Spring va returna automat 400 Bad Request.",
    keyTakeaway: "@PathVariable extrage identificatorul direct din calea URL-ului; @RequestParam extrage parametrii de filtrare/paginare din query string (?key=val)."
  },
  {
    id: "spring-54",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@RequestBody si HttpMessageConverter",
    question: "Ce rol are adnotarea @RequestBody si cum converteste Spring un payload JSON intr-un obiect Java?",
    answer: "1. Rolul adnotarii @RequestBody:\\n   - Indica lui Spring ca parametrul metodei trebuie extras si deserializat din corpul cererii HTTP (HTTP Request Body).\\n   - Se foloseste tipic la metode @PostMapping, @PutMapping si @PatchMapping pentru primirea datelor de intrare.\\n\\n2. Cum functioneaza conversia in spate (HttpMessageConverter):\\n   - DispatcherServlet apeleaza lista sa de HttpMessageConverter-e inregistrate.\\n   - Pentru Content-Type: application/json, Spring selecteaza MappingJackson2HttpMessageConverter.\\n   - Acesta foloseste biblioteca Jackson (ObjectMapper) pentru a mapa cheile din JSON pe campurile obiectului Java DTO prin constructori, getteri/setteri sau reflexie.",
    codeSnippet: `@PostMapping("/api/users")
public ResponseEntity<UserDto> createUser(
    // Extrage JSON-ul din request body si il transforma in CreateUserRequest:
    @RequestBody @Valid CreateUserRequest request
) {
    UserDto created = userService.create(request);
    return ResponseEntity.status(HttpStatus.CREATED).body(created);
}`,
    interviewTrap: "Daca clientul trimite un JSON cu proprietati necunoscute, Jackson poate arunca UnrecognizedPropertyException daca nu este configurat FAIL_ON_UNKNOWN_PROPERTIES = false.",
    keyTakeaway: "@RequestBody leaga corpul cererii HTTP de un obiect Java folosind Jackson (MappingJackson2HttpMessageConverter)."
  },
  {
    id: "spring-55",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Citirea headerelor HTTP cu @RequestHeader",
    question: "Cum citesti headerele HTTP dintr-o cerere (ex: Authorization, X-Correlation-ID) folosind @RequestHeader?",
    answer: "1. Utilizarea adnotarii @RequestHeader:\\n   - Se pune pe un parametru de metoda din Controller pentru a injecta valoarea unui header HTTP specific.\\n   - Exemplu: @RequestHeader(\"Authorization\") String authHeader.\\n   - Poti specifica required = false si defaultValue daca headerul este optional.\\n\\n2. Citirea tuturor headerelor simultan:\\n   - Poti injecta un obiect HttpHeaders sau Map<String, String> adnotat cu @RequestHeader pentru a avea acces la toate headerele cererii.",
    codeSnippet: `@GetMapping("/api/profile")
public UserProfile getProfile(
    @RequestHeader("Authorization") String token,
    @RequestHeader(value = "X-Correlation-ID", required = false, defaultValue = "N/A") String correlationId
) {
    log.info("Procesam cererea cu Correlation ID: {}", correlationId);
    return profileService.getByToken(token);
}`,
    interviewTrap: "Numele headerelor HTTP sunt case-insensitive conform standardului RFC, dar este o buna practica sa folosesti denumirile consacrate (ex: \"Authorization\", \"User-Agent\").",
    keyTakeaway: "@RequestHeader extrage simplu valorile headerelor HTTP trimise de client, cu suport pentru valori default si optionalitate."
  },
  {
    id: "spring-56",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Clasa ResponseEntity in Spring Web",
    question: "Ce este ResponseEntity<T> si de ce este considerat standardul pentru raspunsurile dintr-un REST Controller?",
    answer: "1. Ce este ResponseEntity:\\n   - O clasa wrapper generica din org.springframework.http care reprezinta intregul HTTP Response: status code, headere si corpul raspunsului (body).\\n\\n2. De ce este preferat fata de returnarea unui obiect simplu:\\n   - Permite controlul total si explicit asupra Codului de Status HTTP (200 OK, 201 Created, 204 No Content, 404 Not Found etc.).\\n   - Permite adaugarea de Headere HTTP custom (ex: Location pentru resurse noi create, Cache-Control, Custom-Trace-Id).\\n   - Fluent Builder API elegant: ResponseEntity.ok(body), ResponseEntity.status(HttpStatus.CREATED).body(body), ResponseEntity.noContent().build().",
    codeSnippet: `@PostMapping
public ResponseEntity<UserDto> createUser(@RequestBody CreateUserDto dto) {
    UserDto created = userService.create(dto);

    URI location = ServletUriComponentsBuilder.fromCurrentRequest()
        .path("/{id}")
        .buildAndExpand(created.id())
        .toUri();

    // 201 Created cu headerul Location si body:
    return ResponseEntity.created(location).body(created);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
    userService.delete(id);
    // 204 No Content fara body:
    return ResponseEntity.noContent().build();
}`,
    interviewTrap: "Daca returnezi direct un obiect simplu (ex: public User getUser()), Spring va trimite implicit codul 200 OK chiar daca entitatea era goala, in loc de un cod adecvat.",
    keyTakeaway: "ResponseEntity ofera control complet asupra intregului raspuns HTTP: cod de status, headere si body."
  },
  {
    id: "spring-57",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Validare de baza: @NotNull vs @NotEmpty vs @NotBlank",
    question: "Care este diferenta dintre @NotNull, @NotEmpty si @NotBlank in Jakarta Validation?",
    answer: "Aceasta este una dintre cele mai intalnite intrebari de interviu la nivel Junior!\\n\\n1. @NotNull:\\n   - Valoarea NU poate fi null.\\n   - Permite insa siruri goale (\"\") sau siruri compuse doar din spatii albe (\"   \").\\n   - Se foloseste pe numere (Integer, Long), obiecte, Boolean sau Enum-uri.\\n\\n2. @NotEmpty:\\n   - Valoarea NU poate fi null SI lungimea/dimensiunea trebuie sa fie mai mare de 0 (size > 0).\\n   - Permite insa siruri formate exclusiv din spatii albe (\"   \")!\\n   - Se foloseste pe String-uri sau Colectii (List, Set, Map).\\n\\n3. @NotBlank (Cel mai strict pentru String-uri):\\n   - Valoarea NU poate fi null, NU poate fi goala (\"\") SI NU poate fi compusa doar din spatii albe (dupa apelul trim(), length > 0).\\n   - Se foloseste EXCLUSIV pe tipuri CharSequence / String (text de la utilizator: nume, email, adresa).",
    codeSnippet: `public record RegisterRequest(
    // Obligatoriu text real (fara spatii albe):
    @NotBlank(message = "Numele este obligatoriu!")
    String name,

    // Obligatoriu lista cu minim 1 element:
    @NotEmpty(message = "Trebuie selectat cel putin un rol!")
    List<String> roles,

    // Obligatoriu numar ne-nul:
    @NotNull(message = "Varsta este obligatorie!")
    Integer age
) {}`,
    interviewTrap: "Daca pui @NotBlank pe un camp Integer sau List, compilatorul va arunca eroare de runtime/validare deoarece @NotBlank se aplica DOAR pe tipuri String/CharSequence!",
    keyTakeaway: "@NotNull interzice doar null; @NotEmpty interzice null si siruri goale; @NotBlank interzice si sirurile continand doar spatii albe."
  },
  {
    id: "spring-58",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Validari numerice si de format: @Min, @Max, @Size, @Email",
    question: "Ce adnotari standard de validare se folosesc pentru numere, lungimi de siruri/colectii si adrese de email?",
    answer: "In pachetul standard jakarta.validation.constraints:\\n\\n1. @Min(value) si @Max(value):\\n   - Valideaza ca un camp numeric (int, long, BigDecimal) este mai mare sau egal cu minimul, respectiv mai mic sau egal cu maximul specificat.\\n\\n2. @Positive, @PositiveOrZero, @Negative:\\n   - Valideaza semnul valorilor numerice.\\n\\n3. @Size(min, max):\\n   - Valideaza LUNGIMEA unui String sau NUMARUL DE ELEMENTE dintr-o colectie sau array (ex: @Size(min = 2, max = 50)).\\n\\n4. @Email:\\n   - Valideaza ca textul respecta formatul general al unei adrese de email valide (cu @ si domeniu).\\n\\n5. @Pattern(regexp = \"...\"):\\n   - Valideaza textul pe baza unei expresii regulate regex (ex: numere de telefon, parole cu caractere speciale).",
    codeSnippet: `public record UserDto(
    @Size(min = 3, max = 30, message = "Username intre 3 si 30 de caractere")
    String username,

    @Email(message = "Email invalid")
    String email,

    @Min(value = 18, message = "Trebuie sa ai minim 18 ani")
    @Max(value = 120, message = "Varsta invalida")
    int age,

    @Pattern(regexp = "^\\\\+?[0-9]{10,15}$", message = "Format de telefon invalid")
    String phoneNumber
) {}`,
    interviewTrap: "Nu confunda @Min/@Max cu @Size! @Min/@Max verifica valoarea numerica, in timp ce @Size verifica lungimea sirului sau dimensiunea colectiei.",
    keyTakeaway: "@Min/@Max valideaza valori numerice; @Size valideaza lungimi de text sau colectii; @Email si @Pattern valideaza formate de siruri."
  },
  {
    id: "spring-59",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce exceptie se arunca la esuarea validarii @Valid pe @RequestBody?",
    question: "Ce exceptie arunca Spring Boot cand un obiect adnotat cu @Valid / @RequestBody nu respecta constrangerile si cum o interceptam?",
    answer: "1. Exceptia aruncata:\\n   - Cand un client trimite un JSON invalid catre o metoda avand @Valid @RequestBody MyDto dto, Spring arunca:\\n     MethodArgumentNotValidException.\\n   - Aceasta este o exceptie specifica care contine obiectul BindingResult cu lista tuturor erorilor de validare pe fiecare camp.\\n\\n2. Cum se intercepteaza:\\n   - Intr-o clasa adnotata cu @RestControllerAdvice, creezi o metoda adnotata cu @ExceptionHandler(MethodArgumentNotValidException.class).\\n   - Extragi erorile din ex.getBindingResult().getFieldErrors() si returnezi un raspuns 400 Bad Request cu o mapa de camp -> mesaj de eroare.",
    codeSnippet: `@RestControllerAdvice
public class ValidationExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            errors.put(fieldError.getField(), fieldError.getDefaultMessage());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }
}`,
    interviewTrap: "Daca validarea se face pe parametri de URL (@PathVariable sau @RequestParam intr-un Controller adnotat cu @Validated), exceptia aruncata este ConstraintViolationException, NU MethodArgumentNotValidException!",
    keyTakeaway: "@Valid pe @RequestBody arunca MethodArgumentNotValidException la erori de date; se trateaza centralizat in @RestControllerAdvice."
  },
  {
    id: "spring-60",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Crearea unui Custom Validator in Spring Boot",
    question: "Cum creezi o adnotare de validare personalizata (ex: @ValidIban sau @PasswordMatches) folosind Jakarta Validation?",
    answer: "Crearea unui Custom ConstraintValidator necesita doi pasi standard:\\n\\n1. Pasul 1: Definirea adnotarii proprii:\\n   - Se defineste cu @interface.\\n   - Se adnoteaza cu @Constraint(validatedBy = MyValidator.class).\\n   - Trebuie sa contina obligatoriu cele 3 atribute standard: message(), groups() si payload().\\n\\n2. Pasul 2: Implementarea interfetei ConstraintValidator<Annotation, TargetType>:\\n   - Se implementeaza metoda boolean isValid(TargetType value, ConstraintValidatorContext context).\\n   - Clasa de validator este un Spring Bean gestionat de container! Poti injecta dependinte (servicii, repository-uri) prin constructor in interiorul ei!",
    codeSnippet: `// 1. Adnotarea:
@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = UniqueEmailValidator.class)
public @interface UniqueEmail {
    String message() default "Email-ul este deja folosit!";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

// 2. Validatorul (cu injectie de dependinte din Spring!):
@Component
public class UniqueEmailValidator implements ConstraintValidator<UniqueEmail, String> {
    private final UserRepository userRepo;

    public UniqueEmailValidator(UserRepository userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public boolean isValid(String email, ConstraintValidatorContext context) {
        if (email == null) return true; // validarea de null se lasa lui @NotNull
        return !userRepo.existsByEmail(email);
    }
}`,
    interviewTrap: "In metoda isValid, daca valoarea este null, returneaza de regula true! Lasa adnotarea @NotNull sa verifice nulitatea, pentru a separa responsabilitatile.",
    keyTakeaway: "Un validator custom combina o adnotare @Constraint cu o clasa care implementeaza ConstraintValidator, putand injecta bean-uri Spring."
  },
  {
    id: "spring-61",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Formatarea mesajelor de validare intr-un REST API",
    question: "De ce este important sa returnezi o structura JSON clara si uniforma pentru erorile de validare catre frontend?",
    answer: "1. De ce este esential:\\n   - Daca lasi Spring sa trimita raspunsul default de eroare (care contine stack trace lung sau format brut), frontend-ul (React/Vue/Angular/Mobile) nu poate mapa usor erorile pe campurile din formulare.\\n   - Creste riscul de securitate daca sunt expuse detalii interne de SQL sau clase Java.\\n\\n2. Structura standard recomandata:\\n   - Un status HTTP 400 Bad Request.\\n   - Un timestamp UTC.\\n   - Un camp general \"message\" (ex: \"Validation failed\").\\n   - O lista sau un dictionar \"errors\": { \"email\": \"Format invalid\", \"age\": \"Trebuie minim 18 ani\" }.\\n   - Permite interfetei de utilizator sa evidentieze direct campul cu chenar rosu si mesajul corespunzator.",
    codeSnippet: `// Structura DTO de eroare:
public record ValidationErrorResponse(
    int status,
    String message,
    Instant timestamp,
    Map<String, String> fieldErrors
) {}`,
    interviewTrap: "Nu trimite niciodata mesaje generice precum \"Eroare la salvare\" cand pica validarea; frontend-ul are nevoie exact de numele campului si motivul respingerii.",
    keyTakeaway: "O structura consistenta de eroare cu cheie -> mesaj permite frontend-ului sa afiseze erorile direct sub input-urile utilizatorului."
  },
  {
    id: "spring-62",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Standardul ProblemDetail (RFC 7807) in Spring Boot 3",
    question: "Ce este ProblemDetail introdus in Spring Boot 3 / Spring 6 si ce campuri standardizate contine conform RFC 7807?",
    answer: "1. Ce este RFC 7807 (Problem Details for HTTP APIs):\\n   - Un standard international IETF care defineste un format JSON uniform si universal pentru raportarea erorilor in API-uri REST (Content-Type: application/problem+json).\\n\\n2. Clasa ProblemDetail din Spring Boot 3:\\n   - Inainte de Spring Boot 3, fiecare echipa inventa propria clasa CustomErrorResponse.\\n   - Spring 6 a introdus clasa org.springframework.http.ProblemDetail ca standard integrat nativ.\\n\\n3. Campurile standardizate din ProblemDetail:\\n   - status: codul de status HTTP numeric (ex: 404).\\n   - title: un sumar scurt si lizibil al erorii (ex: \"Not Found\").\\n   - detail: explicatia umana specifica acestei aparitii a erorii (ex: \"User cu ID 99 nu exista\").\\n   - instance: un URI care identifica resursa unde a aparut eroarea (ex: \"/api/users/99\").\\n   - type: un URI catre documentatia erorii.\\n   - properties: permite adaugarea de campuri ad-hoc (ex: timestamp, errorCode).",
    codeSnippet: `@ExceptionHandler(UserNotFoundException.class)
public ProblemDetail handleUserNotFound(UserNotFoundException ex) {
    ProblemDetail problem = ProblemDetail.forStatusAndDetail(
        HttpStatus.NOT_FOUND, ex.getMessage()
    );
    problem.setTitle("Utilizator Inexistent");
    problem.setProperty("errorCode", "ERR_USER_001");
    problem.setProperty("timestamp", Instant.now());
    return problem;
}`,
    interviewTrap: "Poti activa suportul ProblemDetail global in Spring Boot 3 adaugand in application.properties: spring.mvc.problemdetails.enabled=true.",
    keyTakeaway: "ProblemDetail este implementarea oficiala a standardului RFC 7807 in Spring Boot 3, unificand payload-ul JSON de eroare."
  },
  {
    id: "spring-63",
    category: 'SPRING',
    difficulty: "USOR",
    title: "DTO Pattern: De ce NU expunem entitatile JPA in REST Controllers?",
    question: "Care sunt cele 4 motive critice pentru care entitatile JPA (@Entity) nu trebuie returnate niciodata direct din endpoint-uri REST?",
    answer: "Aceasta este o intrebare fundamentala de arhitectura la orice interviu Java Backend!\\n\\n1. Securitate (Over-Posting / Mass Assignment):\\n   - Daca primesti entitatea direct in @RequestBody, un atacator poate trimite campuri precum role: \"ADMIN\" sau balance: 999999, suprascriind proprietati critice nesecurizate!\\n   - La iesire, entitatea poate expune date sensibile (password_hash, SSN, token-uri secrete).\\n\\n2. LazyInitializationException si Bucle Infinite:\\n   - Serializatorul Jackson va incerca sa parcurga toate relatiile @OneToMany. Daca sunt Lazy, va arunca LazyInitializationException.\\n   - Daca relatia este bidirectionala (User are Orders, Order are User), Jackson va intra intr-o bucla infinita de serializare, cauzand StackOverflowError!\\n\\n3. Cuplare rigida a bazei de date cu API-ul:\\n   - Daca schimbi numele unei coloane in DB sau separi o tabela, rupi contractul API cu toti clientii externi! DTO-ul decupleaza schema interna de contractul extern.\\n\\n4. Optimizare de retea:\\n   - DTO-ul trimite doar datele strict necesare ecranului curent.",
    codeSnippet: `// GRESIT (Expunere directa a entitatii):
@GetMapping("/{id}")
public UserEntity getUser(@PathVariable Long id) { ... } // PERICULOS!

// CORECT (Folosirea unui DTO sau Record):
@GetMapping("/{id}")
public UserResponseDto getUser(@PathVariable Long id) {
    return userService.getUserDto(id);
}`,
    interviewTrap: "Adnotarea @JsonIgnore pe entitate este doar un plasture temporar; abordarea profesionala este separarea stricta prin DTO-uri sau Java Records.",
    keyTakeaway: "Entitatile JPA modeleaza baza de date; DTO-urile modeleaza contractul API, prevenind scurgeri de date, bucle infinite si LazyInitializationException."
  },
  {
    id: "spring-64",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Jackson: Personalizarea campurilor JSON cu @JsonProperty",
    question: "Cum schimbi numele unei proprietati in formatul JSON generat de Jackson folosind @JsonProperty?",
    answer: "1. Ce face @JsonProperty(\"nume_dorit\"):\\n   - Se plaseaza pe un camp sau pe getter/setter/componenta de Record.\\n   - Mapeaza proprietatea Java cu numele specificat in payload-ul JSON atat la serializare (Java -> JSON), cat si la deserializare (JSON -> Java).\\n\\n2. Utilizare frecventa:\\n   - Cand Java foloseste conventia camelCase (ex: firstName), dar API-ul exterior sau clientul pretinde snake_case (ex: \"first_name\") sau litere mari.\\n\\n3. Parametrul access:\\n   - @JsonProperty(access = JsonProperty.Access.WRITE_ONLY): util pentru campul de parola (accepta parola la inregistrare, dar nu o returneaza niciodata in JSON-ul de raspuns!).\\n   - READ_ONLY: se trimite in raspuns, dar este ignorat la primire.",
    codeSnippet: `public record RegisterUserDto(
    @JsonProperty("full_name")
    String fullName,

    @JsonProperty("email_address")
    String email,

    // WRITE_ONLY: Se primeste la POST, dar NU se trimite niciodata la GET!
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    String password
) {}`,
    interviewTrap: "Daca intregul proiect foloseste snake_case, poti configura proprietatea globala spring.jackson.property-naming-strategy=SNAKE_CASE in application.yml in loc sa pui @JsonProperty pe fiecare camp.",
    keyTakeaway: "@JsonProperty redenumeste campurile in JSON si permite setarea de proprietati WRITE_ONLY pentru date confidentiale (parole)."
  },
  {
    id: "spring-65",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Jackson: Excluderea campurilor cu @JsonIgnore",
    question: "Ce rol are adnotarea @JsonIgnore si cand se foloseste @JsonIgnoreProperties?",
    answer: "1. @JsonIgnore:\\n   - Se plaseaza pe un camp individual pentru a-l exclude complet atat de la serializare cat si de la deserializare.\\n   - Jackson va ignora total acel camp (nu va aparea in JSON-ul de iesire si nu va fi setat din JSON-ul de intrare).\\n   - Utilizare: excluderea datelor interne, campurilor de calcul temporar.\\n\\n2. @JsonIgnoreProperties pe clasa:\\n   - Se plaseaza la nivelul clasei.\\n   - Permite excluderea mai multor campuri printr-o lista: @JsonIgnoreProperties({\"tempToken\", \"internalId\"}).\\n   - Parametru extrem de util: @JsonIgnoreProperties(ignoreUnknown = true) -> impiedica Jackson sa arunce erori daca clientul trimite proprietati aditionale necunoscute.",
    codeSnippet: `@JsonIgnoreProperties(ignoreUnknown = true)
public class AccountDto {
    private String accountNumber;

    @JsonIgnore // Nu va aparea niciodata in raspunsul JSON!
    private String internalAuditNotes;
}`,
    interviewTrap: "Nu confunda @JsonIgnore cu cuvantul cheie transient din Java! Transient se aplica la serializarea nativa Java (Serializable), in timp ce @JsonIgnore se aplica la serializarea Jackson JSON.",
    keyTakeaway: "@JsonIgnore exclude proprietati individuale din JSON; ignoreUnknown=true previne erorile la proprietati JSON neasteptate."
  },
  {
    id: "spring-66",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Jackson: Formatarea datelor calendaristice cu @JsonFormat",
    question: "Cum controlezi formatul de afisare al datelor din java.time (LocalDate, LocalDateTime) in JSON cu @JsonFormat?",
    answer: "1. Problema implicita:\\n   - Fara configurare, Jackson poate serializa datele din LocalDateTime fie ca un array numeric de numere: [2026, 10, 2, 14, 30, 0], fie in format ISO-8601 brut.\\n\\n2. Solutia cu @JsonFormat:\\n   - Adnotarea @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = \"dd/MM/yyyy HH:mm:ss\", timezone = \"UTC\") pe campul temporal.\\n   - Forteaza serializarea ca un String formatat exact conform sablonului cerut de specificatiile de design ale aplicatiei.",
    codeSnippet: `public record OrderSummaryDto(
    Long orderId,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    LocalDateTime createdAt,

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy")
    LocalDate deliveryDate
) {}`,
    interviewTrap: "Daca ai pachetul java.time, asigura-te ca modulul jackson-datatype-jsr310 exista in classpath (este adus automat de spring-boot-starter-web).",
    keyTakeaway: "@JsonFormat(pattern = \"...\") formateaza campurile de data si ora intr-un format text predictibil si lizibil in JSON."
  },
  {
    id: "spring-67",
    category: 'SPRING',
    difficulty: "USOR",
    title: "CORS in Spring Boot: Ce este si cum se configureaza",
    question: "Ce este CORS (Cross-Origin Resource Sharing) si cum il configurezi in Spring Boot cu @CrossOrigin si WebMvcConfigurer?",
    answer: "1. Ce este CORS:\\n   - Un mecanism de securitate implementat de toate browserele web (Same-Origin Policy) care blocheaza o aplicatie frontend (ex: React ruland pe http://localhost:3000) sa faca cereri HTTP asincrone (fetch/axios) catre un backend aflat pe o alta origine (ex: http://localhost:8080 - alt port, protocol sau domeniu).\\n   - Daca backend-ul nu trimite headerul Access-Control-Allow-Origin, browserul blocheaza raspunsul cu eroare CORS!\\n\\n2. Solutia 1: Punctuala cu @CrossOrigin:\\n   - Se pune direct pe un Controller sau pe o metoda:\\n     @CrossOrigin(origins = \"http://localhost:3000\")\\n\\n3. Solutia 2: Globala prin WebMvcConfigurer (Recomandata):\\n   - Se defineste o clasa de configurare care suprascrie addCorsMappings().",
    codeSnippet: `@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
            .allowedOrigins("http://localhost:3000", "https://myfrontend.com")
            .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}`,
    interviewTrap: "Daca folosesti Spring Security, configurarea CORS din WebMvcConfigurer s-ar putea sa nu fie suficienta, deoarece Spring Security intercepteaza cererile preflight OPTIONS inainte de MVC! Trebuie configurat http.cors(Customizer.withDefaults()) si un CorsConfigurationSource bean.",
    keyTakeaway: "CORS permite aplicatiilor frontend de pe alt port sau domeniu sa acceseze backend-ul; se configureaza global prin WebMvcConfigurer."
  },
  {
    id: "spring-68",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Filtre Servlet (Filter) vs Interceptoare Spring (HandlerInterceptor)",
    question: "Care este diferenta dintre un Filter Java EE si un HandlerInterceptor Spring si cand se foloseste fiecare?",
    answer: "1. Servlet Filter (javax.servlet.Filter / jakarta.servlet.Filter):\\n   - Apartine specificatiei standard de Servlet (ruleaza in Tomcat la nivelul containerului de Servlet).\\n   - Cererea trece prin Filtre INAINTE ca aceasta sa ajunga la DispatcherServlet!\\n   - Nu stie despre controllerele Spring sau metodele apelate.\\n   - Utilizare clasica: Securitate de nivel jos (Spring Security), CorsFilter, compresie gzip, logare de IP-uri, extragere token JWT din header.\\n\\n2. HandlerInterceptor (Spring MVC):\\n   - Apartine strict de Spring MVC (ruleaza DUPA DispatcherServlet).\\n   - Are acces la obiectul Controller si la metoda specifica care urmeaza sa fie executata (Object handler)!\\n   - Are 3 metode cheie: preHandle() (inainte de controller), postHandle() (dupa controller, inainte de view), afterCompletion() (dupa finalizarea intregii cereri).\\n   - Utilizare: Verificari specifice de permisiuni de business, masurarea timpului de executie al unei metode particulare de controller, adaugare atribute in model.",
    codeSnippet: `@Component
public class ExecutionTimeInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        req.setAttribute("startTime", System.currentTimeMillis());
        return true; // Continua fluxul
    }

    @Override
    public void afterCompletion(HttpServletRequest req, HttpServletResponse res, Object handler, Exception ex) {
        long startTime = (Long) req.getAttribute("startTime");
        long duration = System.currentTimeMillis() - startTime;
        System.out.println("Timp executie: " + duration + " ms");
    }
}`,
    interviewTrap: "Daca ai nevoie sa modifici corpul cererii sau sa opresti cererea inainte de a ajunge in Spring MVC, trebuie sa folosesti un Filter, nu un Interceptor.",
    keyTakeaway: "Filtrele ruleaza la nivel de Servlet container inainte de DispatcherServlet; Interceptoarele ruleaza in interiorul Spring MVC cu acces la Controller."
  },
  {
    id: "spring-69",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Upload de fisiere cu MultipartFile in Spring Boot",
    question: "Cum implementezi un endpoint de upload de fisiere (imagini, documente) folosind MultipartFile?",
    answer: "1. MultipartFile:\\n   - O interfata din org.springframework.web.multipart care reprezinta un fisier incarcat printr-o cerere HTTP multipart/form-data.\\n   - Ofera metode esentiale: getOriginalFilename(), getContentType(), getSize(), getBytes(), getInputStream(), transferTo(Path destination).\\n\\n2. Configurarea limitelor de marime in application.yml:\\n   - Implicit, Spring Boot limiteaza fisierele la 1MB (max-file-size) si cererea la 10MB (max-request-size).\\n   - Daca un fisier depaseste limita, se arunca MaxUploadSizeExceededException.",
    codeSnippet: `@PostMapping(value = "/api/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
public ResponseEntity<String> uploadFile(
    @RequestParam("file") MultipartFile file
) throws IOException {
    if (file.isEmpty()) {
        return ResponseEntity.badRequest().body("Fisierul este gol!");
    }

    String filename = StringUtils.cleanPath(file.getOriginalFilename());
    Path targetPath = Path.of("uploads").resolve(filename);
    file.transferTo(targetPath); // Salveaza fisierul pe disc

    return ResponseEntity.ok("Fisier salvat: " + filename);
}

# In application.yml:
# spring:
#   servlet:
#     multipart:
#       max-file-size: 10MB
#       max-request-size: 15MB`,
    interviewTrap: "Numele fisierului primit (getOriginalFilename()) trebuie curatat de atacuri de tip Directory Traversal (\"../../etc/passwd\") inainte de salvare!",
    keyTakeaway: "MultipartFile gestioneaza upload-ul prin multipart/form-data; configureaza limitele de marime in application.yml."
  },
  {
    id: "spring-70",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Download de fisiere dintr-un endpoint Spring REST",
    question: "Cum returnezi un fisier pentru descarcare (download) dintr-un REST Controller cu headerele HTTP corecte?",
    answer: "1. Ce resurse se returneaza:\\n   - Se returneaza un ResponseEntity<Resource> (folosind ByteArrayResource sau InputStreamResource / FileSystemResource).\\n\\n2. Headerele HTTP obligatorii pentru descarcare:\\n   - Content-Type: tipul MIME al fisierului (ex: application/pdf, image/png, application/octet-stream).\\n   - Content-Disposition: indica browserului daca sa descarce fisierul ca atasament sau sa il deschida inline:\\n     - attachment; filename=\"raport.pdf\" -> deschide fereastra de salvare \"Save As\".\\n     - inline -> browserul incearca sa il afiseze direct in tab.\\n   - Content-Length: dimensiunea fisierului in bytes (pentru afisarea barei de progres la descarcare).",
    codeSnippet: `@GetMapping("/api/download/{filename}")
public ResponseEntity<Resource> downloadFile(@PathVariable String filename) throws IOException {
    Path filePath = Path.of("files").resolve(filename);
    Resource resource = new UrlResource(filePath.toUri());

    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_OCTET_STREAM)
        .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\\"" + resource.getFilename() + "\\"")
        .body(resource);
}`,
    interviewTrap: "Daca folosesti ByteArrayResource pentru fisiere gigant (sute de MB), risti OutOfMemoryError. Pentru fisiere mari, foloseste InputStreamResource sau StreamingResponseBody.",
    keyTakeaway: "Download-ul returneaza ResponseEntity<Resource> cu headerul Content-Disposition: attachment; filename=\"...\" si Content-Type corespunzator."
  },
  {
    id: "spring-71",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Content Negotiation: consumes si produces in @RequestMapping",
    question: "Ce rol au atributele \"consumes\" si \"produces\" in @RequestMapping si cum functioneaza Content Negotiation?",
    answer: "1. Ce este Content Negotiation:\\n   - Mecanismul prin care clientul si serverul negociaza formatul datelor transmise prin intermediul headerelor HTTP Content-Type si Accept.\\n\\n2. Atributul \"consumes\":\\n   - Restrictioneaza cererile acceptate pe baza headerului Content-Type trimis de client (ce format de date trimite clientul catre server).\\n   - Exemplu: consumes = MediaType.APPLICATION_JSON_VALUE.\\n   - Daca clientul trimite alt format, Spring returneaza 415 Unsupported Media Type.\\n\\n3. Atributul \"produces\":\\n   - Specifica formatul de raspuns generat de server pe baza headerului Accept trimis de client (ce format asteapta clientul inapoi).\\n   - Exemplu: produces = MediaType.APPLICATION_JSON_VALUE.\\n   - Daca serverul nu poate produce formatul cerut in Accept, returneaza 406 Not Acceptable.",
    codeSnippet: `@PostMapping(
    value = "/api/reports",
    consumes = MediaType.APPLICATION_JSON_VALUE, // Cere Content-Type: application/json
    produces = MediaType.APPLICATION_PDF_VALUE   // Returneaza PDF (Content-Type: application/pdf)
)
public ResponseEntity<byte[]> generateReport(@RequestBody ReportRequest req) {
    byte[] pdfBytes = reportService.createPdf(req);
    return ResponseEntity.ok(pdfBytes);
}`,
    interviewTrap: "Daca clientul primeste 415 Unsupported Media Type, inseamna ca headerul Content-Type din cerere nu se potriveste cu parametrul consumes al metodei.",
    keyTakeaway: "consumes valideaza headerul Content-Type al cererii; produces stabileste headerul Accept al raspunsului generat."
  },
  {
    id: "spring-72",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este HATEOAS in Spring Boot?",
    question: "Ce inseamna HATEOAS si cum adauga modulul spring-boot-starter-hateoas link-uri de navigare in REST APIs?",
    answer: "1. Ce inseamna HATEOAS:\\n   - Hypermedia As The Engine Of Application State (nivelul 3 in modelul de maturitate Richardson pentru API-uri REST pure).\\n   - Principiul prin care un client care consuma un API REST primeste nu doar date brute, ci si LINK-URI hipermedia care ii spun ce actiuni viitoare poate intreprinde in acel context.\\n\\n2. Exemplu din viata reala:\\n   - Cand ceri detalii despre o comanda (/orders/10), raspunsul contine link-uri catre: cum sa platesti comanda (/orders/10/pay), cum sa o anulezi (/orders/10/cancel), sau cum sa vezi clientul (/customers/5).\\n\\n3. In Spring Boot:\\n   - Modulul spring-boot-starter-hateoas ofera clasa EntityModel<T> si utilitarul WebMvcLinkBuilder.linkTo().",
    codeSnippet: `@GetMapping("/api/orders/{id}")
public EntityModel<OrderDto> getOrder(@PathVariable Long id) {
    OrderDto order = orderService.findById(id);

    return EntityModel.of(order,
        linkTo(methodOn(OrderController.class).getOrder(id)).withSelfRel(),
        linkTo(methodOn(OrderController.class).cancelOrder(id)).withRel("cancel")
    );
}`,
    interviewTrap: "Desi HATEOAS este teoretic ideal pentru REST pur, in practica majoritatii companiilor enterprise este adesea omis in favoarea simplitatii JSON standard.",
    keyTakeaway: "HATEOAS imbogateste raspunsurile JSON cu link-uri hipermedia navigabile reprezentand actiunile posibile ale clientului."
  },
  {
    id: "spring-73",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Documentarea API-ului cu OpenAPI / Swagger in Spring Boot",
    question: "Cum documentezi automat un API Spring Boot folosind biblioteca springdoc-openapi si adnotarile Swagger?",
    answer: "1. Biblioteca moderna pentru Spring Boot 3:\\n   - Se foloseste dependenta springdoc-openapi-starter-webmvc-ui (vechiul Springfox Swagger este abandonat si nefunctional in Spring Boot 3!).\\n   - Genereaza automat specificatia OpenAPI 3 in format JSON la adresa /v3/api-docs si o interfata grafica interactiva la /swagger-ui.html.\\n\\n2. Adnotarile cheie de documentare:\\n   - @Tag(name = \"Users\", description = \"Operatiuni de gestiune a utilizatorilor\"): grupeaza controllerele.\\n   - @Operation(summary = \"...\", description = \"...\"): descrie scopul fiecarui endpoint.\\n   - @ApiResponse(responseCode = \"200\", description = \"Gasit cu succes\"): documenteaza codurile de raspuns posibile.\\n   - @Parameter: documenteaza parametrii din URL.",
    codeSnippet: `@RestController
@RequestMapping("/api/users")
@Tag(name = "Utilizatori", description = "API pentru managementul conturilor")
public class UserController {

    @Operation(summary = "Gaseste utilizator dupa ID", description = "Returneaza detaliile complete de profil")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Utilizator gasit"),
        @ApiResponse(responseCode = "404", description = "Utilizatorul nu exista")
    })
    @GetMapping("/{id}")
    public UserDto getUser(@PathVariable Long id) { ... }
}`,
    interviewTrap: "Nu folosi dependenta veche springfox-swagger2 in Spring Boot 3! Foloseste exclusiv springdoc-openapi-starter-webmvc-ui.",
    keyTakeaway: "springdoc-openapi genereaza automat interfata Swagger UI (/swagger-ui.html) si documentatia OpenAPI 3 pe baza adnotarilor din controllere."
  },
  {
    id: "spring-74",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarea @ResponseStatus in Spring Boot",
    question: "Ce face adnotarea @ResponseStatus si cand este utila pe metode si pe clase de exceptii?",
    answer: "1. Pe metode de Controller:\\n   - Suprascrie codul de status HTTP implicit (care este 200 OK) cu codul specificat cand metoda se executa cu succes.\\n   - Exemplu: @PostMapping adnotat cu @ResponseStatus(HttpStatus.CREATED) va returna automat 201 Created cand metoda returneaza obiectul, fara a mai fi nevoie sa scrii ResponseEntity.status(201)...\\n\\n2. Pe clase de Exceptii Custom:\\n   - Poti adnota direct o clasa de exceptie custom (ex: @ResponseStatus(HttpStatus.NOT_FOUND) public class UserNotFoundException extends RuntimeException {}).\\n   - Cand aceasta exceptie este aruncata dintr-un serviciu si nu este prinsa manual, Spring va returna automat un raspuns HTTP 404 Not Found catre client!",
    codeSnippet: `// 1. Pe metoda de creare:
@PostMapping
@ResponseStatus(HttpStatus.CREATED) // Returneaza 201 Created
public UserDto create(@RequestBody UserDto dto) {
    return userService.save(dto);
}

// 2. Pe clasa de exceptie proprie:
@ResponseStatus(value = HttpStatus.NOT_FOUND, reason = "Resursa nu a fost gasita")
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String msg) { super(msg); }
}`,
    interviewTrap: "Daca metoda returneaza ResponseEntity, codul de status din ResponseEntity are prioritate si va suprascrie orice @ResponseStatus pus pe metoda.",
    keyTakeaway: "@ResponseStatus seteaza codul HTTP returnat la succesul metodei sau cand o clasa de exceptie custom este aruncata."
  },
  {
    id: "spring-75",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Tratarea locala a exceptiilor cu @ExceptionHandler in Controller",
    question: "Cum folosesti adnotarea @ExceptionHandler in interiorul unui singur Controller si ce scop are comparativ cu @ControllerAdvice?",
    answer: "1. @ExceptionHandler la nivel local (in Controller):\\n   - Este o metoda definita DIRECT in interiorul unei clase de @RestController.\\n   - Intercepteaza exceptiile aruncate EXCLUSIV de metodele din ACEL CONTROLLER particular.\\n   - Nu afecteaza si nu intercepteaza exceptiile din alte controllere ale aplicatiei.\\n\\n2. Cand se prefera local vs global (@ControllerAdvice):\\n   - Local: Cand ai o eroare particulara care are sens si trebuie tratata intr-un mod complet specific doar pentru acel endpoint sau ecran.\\n   - Global (@RestControllerAdvice): Se prefera in 95% din cazuri pentru consistenta aplicatiei (erori 404, 400 de validare, 403 securitate, 500 interne).",
    codeSnippet: `@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @PostMapping
    public void pay() { ... }

    // Intercepteaza CardDeclinedException doar pentru acest controller:
    @ExceptionHandler(CardDeclinedException.class)
    public ResponseEntity<String> handleCardDeclined(CardDeclinedException ex) {
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(ex.getMessage());
    }
}`,
    interviewTrap: "Daca o exceptie este tratata atat local in Controller cat si global in @ControllerAdvice, metoda LOCAL din Controller are prioritate si va fi executata prima!",
    keyTakeaway: "@ExceptionHandler local captureaza erori strict dintr-un singur controller, avand prioritate peste @ControllerAdvice global."
  },
  {
    id: "spring-76",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Diferenta dintre PUT si PATCH in REST APIs",
    question: "Care este diferenta de conventie si comportament intre metoda HTTP PUT si metoda HTTP PATCH?",
    answer: "1. PUT (Inlocuire Completa - Full Replacement):\\n   - Clientul trimite INTREGUL obiect cu toate proprietatile sale.\\n   - Conform standardului, daca un camp existent este omis din payload-ul PUT, serverul ar trebui sa il seteze pe null sau pe valoarea sa default!\\n   - Este IDEMPOTENT: trimiterea aceluiasi payload PUT de 10 ori succesiv va lasa resursa in exact aceeasi stare finala.\\n\\n2. PATCH (Actualizare Partiala - Partial Update):\\n   - Clientul trimite DOAR campurile pe care doreste sa le modifice (ex: doar noul email: { \"email\": \"nou@test.com\" }).\\n   - Campurile omise raman complet neatinse in baza de date.\\n   - Poate fi non-idempotent (desi de obicei este implementat idempotent in aplicatii web).",
    codeSnippet: `// PUT: Suprascriere completa a intregului profil
@PutMapping("/{id}")
public UserDto fullUpdate(@PathVariable Long id, @RequestBody @Valid UserDto dto) {
    return userService.replaceUser(id, dto);
}

// PATCH: Modificare partiala (ex: doar statusul)
@PatchMapping("/{id}/status")
public UserDto patchStatus(@PathVariable Long id, @RequestBody UpdateStatusDto dto) {
    return userService.changeStatus(id, dto.status());
}`,
    interviewTrap: "Daca folosesti PUT pentru a actualiza doar un singur camp dintr-o entitate de 20 de campuri fara sa validezi restul, risti sa stergi celelalte 19 campuri setandu-le pe null.",
    keyTakeaway: "PUT inlocuieste resursa in totalitate (idempotent); PATCH modifica punctual doar campurile transmise in cerere."
  },
  {
    id: "spring-77",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Idempotenta in Metodele HTTP",
    question: "Ce inseamna ca o metoda HTTP este Idempotenta si care dintre metodele standard (GET, POST, PUT, DELETE) sunt idempotente?",
    answer: "1. Definitia Idempotentei:\\n   - O metoda HTTP este idempotenta daca executarea ei repetata de mai multe ori consecutiv cu aceiasi parametri produce EXACT ACELASI EFECT secundar pe starea serverului ca o singura executie (f(f(x)) == f(x)).\\n\\n2. Clasificarea metodelor HTTP:\\n   - GET: IDEMPOTENT si SAFE (doar citeste date, starea serverului nu se schimba).\\n   - PUT: IDEMPOTENT (daca inlocuiesti resursa X cu starea Y de 10 ori, starea finala a lui X ramane tot Y).\\n   - DELETE: IDEMPOTENT (stergerea resursei ID 5 prima oara o sterge; apelurile ulterioare returneaza eventual 404, dar starea serverului este aceeasi: resursa nu mai exista!).\\n   - POST: NON-IDEMPOTENT! Daca trimiti o cerere POST de creare comanda de 3 ori, serverul va crea 3 comenzi diferite si va taxa cardul de 3 ori!",
    codeSnippet: `// GET: Idempotent
// PUT: Idempotent
// DELETE: Idempotent
// POST: NON-Idempotent (necesita chei de idempotenta in plati!)`,
    interviewTrap: "Multi candidati cred gresit ca DELETE nu este idempotent pentru ca al doilea apel returneaza 404 in loc de 200. Idempotenta se refera la starea resurselor pe server, nu la codul HTTP!",
    keyTakeaway: "GET, PUT si DELETE sunt metode idempotente; POST este non-idempotent deoarece apelurile repetate creeaza resurse noi multiple."
  },
  {
    id: "spring-78",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Validarea parametrilor URL cu @Validated pe Controller",
    question: "Cum validam parametrii simpli primiti prin @PathVariable sau @RequestParam (ex: @Min(1) Long id)?",
    answer: "1. De ce simplul @Valid pe parametru nu functioneaza:\\n   - Pe obiecte complexe din corpul cererii (@RequestBody), adnotarea @Valid functioneaza automat.\\n   - Insa pe tipuri primitive sau simple din URL (ex: @PathVariable @Min(1) Long id), simpla prezenta a lui @Min nu declanseaza validarea in mod implicit in Spring!\\n\\n2. Solutia:\\n   - Se adauga adnotarea @Validated la NIVELUL CLASEI Controller-ului!\\n   - Aceasta instruieste Spring sa creeze un proxy AOP peste Controller care va valida automat parametrii metodelor inainte de apel.\\n   - Daca validarea pica (ex: id = 0), se va arunca ConstraintViolationException.",
    codeSnippet: `@RestController
@RequestMapping("/api/products")
@Validated // OBLIGATORIU pe clasa pentru a activa validarea pe parametri URL!
public class ProductController {

    @GetMapping("/{id}")
    public ProductDto getById(
        @PathVariable @Min(value = 1, message = "ID-ul trebuie sa fie pozitiv!") Long id
    ) {
        return productService.getById(id);
    }
}`,
    interviewTrap: "Daca uiti sa pui @Validated pe clasa Controller-ului, adnotarile @Min, @Max sau @Pattern de pe @PathVariable si @RequestParam vor fi complet ignorate!",
    keyTakeaway: "Pentru a valida parametri din URL (@PathVariable, @RequestParam), adauga obligatoriu @Validated pe clasa Controller-ului."
  },
  {
    id: "spring-79",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Serializarea si deserializarea Enum-urilor in Spring Boot",
    question: "Cum controlezi daca un Enum este mapat ca String sau ca valoare custom in JSON in Spring Boot?",
    answer: "1. Comportamentul implicit al Jackson:\\n   - La serializare (Java -> JSON), Jackson apeleaza enum.name() si returneaza numele exact ca String (ex: \"ACTIVE\").\\n   - La deserializare (JSON -> Java), Jackson cauta constanta care se potriveste exact ca nume.\\n\\n2. Cum folosesti o valoare custom:\\n   - Adnotarea @JsonValue pe o metoda sau camp din Enum indica lui Jackson ce valoare sa serializeze in JSON (ex: un cod numeric sau o descriere).\\n   - Adnotarea @JsonCreator pe o metoda statica de tip fabrica (Factory Method) ii spune lui Jackson cum sa construiasca Enum-ul dintr-o valoare primita in JSON, permitand si parsare case-insensitive.",
    codeSnippet: `public enum Status {
    ACTIVE("act"),
    INACTIVE("inact");

    private final String code;
    Status(String c) { this.code = c; }

    @JsonValue // Va aparea in JSON ca "act" in loc de "ACTIVE"
    public String getCode() { return code; }

    @JsonCreator // Parseaza din String-ul JSON inapoi in Enum
    public static Status fromCode(String value) {
        for (Status s : values()) {
            if (s.code.equalsIgnoreCase(value) || s.name().equalsIgnoreCase(value)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Status necunoscut: " + value);
    }
}`,
    interviewTrap: "In baza de date cu JPA, foloseste intotdeauna @Enumerated(EnumType.STRING) pe campul de tip Enum, altfel JPA va salva ordinea numerica ordinala a constantei!",
    keyTakeaway: "@JsonValue defineste valoarea serializata a Enum-ului in JSON; @JsonCreator controleaza deserializarea flexibila din JSON."
  },
  {
    id: "spring-80",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Parametri de paginare cu Pageable in Spring MVC",
    question: "Cum folosim interfata Pageable si adnotarea @PageableDefault pentru a primi parametri de paginare intr-un Controller?",
    answer: "1. Ce este Pageable:\\n   - O interfata din Spring Data care incapsuleaza informatiile despre pagina ceruta: numarul paginii (page, indexat de la 0), numarul de elemente per pagina (size) si criteriul de sortare (sort).\\n\\n2. Injectarea automata in Controller:\\n   - Daca declari Pageable pageable ca parametru in metoda unui Controller, Spring MVC extrage automat parametrii din query string: ?page=0&size=20&sort=createdAt,desc!\\n\\n3. Adnotarea @PageableDefault:\\n   - Permite definirea valorilor implicite in cazul in care clientul nu trimite parametrii de query (ex: @PageableDefault(page = 0, size = 15, sort = \"id\", direction = Sort.Direction.DESC)).",
    codeSnippet: `@GetMapping("/api/articles")
public Page<ArticleDto> getArticles(
    @PageableDefault(size = 10, sort = "publishDate", direction = Sort.Direction.DESC) Pageable pageable
) {
    // Trimitem Pageable direct catre Repository:
    return articleService.findAll(pageable);
}`,
    interviewTrap: "In Spring Data, indexul paginii porneste de la 0, nu de la 1! Prima pagina este page=0.",
    keyTakeaway: "Spring MVC populeaza automat parametrul Pageable din query string; @PageableDefault stabileste valorile default de pagina si sortare."
  },
  {
    id: "spring-81",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este @SpringBootTest si cand se foloseste?",
    question: "Ce face adnotarea @SpringBootTest si de ce trebuie evitata in testele unitare pure?",
    answer: "1. Ce face @SpringBootTest:\\n   - Incarca INTREGUL ApplicationContext al aplicatiei Spring Boot (porneste autoconfigurarile, descopera toate bean-urile, initializeaza conexiunile de baze de date).\\n   - Cauta clasa principala adnotata cu @SpringBootApplication si recreeaza mediul complet de productie in memorie.\\n\\n2. Cand se foloseste:\\n   - In TESTE DE INTEGRARE (Integration Tests) si teste end-to-end, cand vrei sa validezi ca toate straturile (Controller -> Service -> Repository -> Database) colaboreaza corect impreuna.\\n\\n3. De ce este strict interzisa in Teste Unitare pure:\\n   - Este foarte LENTA! Pornirea contextului complet poate dura intre 3 si 15 secunde per clasa de test.\\n   - Testele unitare trebuie sa ruleze in milisecunde folosind JUnit 5 si Mockito simplu, fara a ridica containerul Spring.",
    codeSnippet: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class FullAppIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testFullFlow() {
        ResponseEntity<String> response = restTemplate.getForEntity("/api/health", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}`,
    interviewTrap: "Daca pui @SpringBootTest pe 100 de clase de teste unitare, suita ta de teste din CI/CD va dura 30 de minute in loc de 10 secunde!",
    keyTakeaway: "@SpringBootTest porneste contextul complet pentru teste de integrare end-to-end; nu il folosi pentru simple teste unitare de logica."
  },
  {
    id: "spring-82",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Sliced Tests (Teste Feliate) in Spring Boot",
    question: "Ce sunt Sliced Tests (teste pe felii de arhitectura) in Spring Boot si de ce sunt superioare lui @SpringBootTest?",
    answer: "1. Ce este un Sliced Test:\\n   - In loc sa incarce toate cele 500 de bean-uri din intreaga aplicatie, Spring Boot porneste un context MINIMAL care contine DOAR bean-urile specifice unui anumit strat tehnologic testat!\\n\\n2. Exemple de teste feliate celebre:\\n   - @WebMvcTest: Incarca DOAR stratul web (Controllere, @ControllerAdvice, filtre, Jackson). Ignora complet @Service si @Repository (care trebuie mock-uite cu @MockBean). Rulare in ~500ms!\\n   - @DataJpaTest: Incarca DOAR entitatile JPA, Repository-urile Spring Data si configureaza o baza de date in-memory (H2). Ignora controllerele si serviciile.\\n   - @JsonTest: Testeaza doar serializarea/deserializarea Jackson.\\n\\n3. Beneficii:\\n   - Viteza uriasa de executie combinata cu testarea reala a integrarii stratului respectiv.",
    codeSnippet: `// Test feliat doar pentru stratul Web:
@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private UserService userService; // Mock-uim stratul de business!
}`,
    interviewTrap: "In @WebMvcTest, daca Controller-ul tau depinde de un UserService si uiti sa adaugi @MockBean UserService, testul va crapa la startup din lipsa bean-ului.",
    keyTakeaway: "Sliced Tests (@WebMvcTest, @DataJpaTest) incarca doar componentele unui singur strat, fiind de 10 ori mai rapide decat @SpringBootTest."
  },
  {
    id: "spring-83",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@WebMvcTest si MockMvc",
    question: "Cum testam un Controller Spring MVC izolat folosind @WebMvcTest si obiectul MockMvc?",
    answer: "1. @WebMvcTest(TargetController.class):\\n   - Configureaza infrastructura Spring MVC si instantiaza doar Controller-ul tinta specificat intre paranteze.\\n   - Dependintele de business (Service-uri) se declara cu adnotarea @MockBean.\\n\\n2. Ce este MockMvc:\\n   - Un utilitar principal din Spring Test care permite simularea de cereri HTTP complete (GET, POST etc.) fara a porni un server Tomcat real pe retea!\\n   - Trimite cererea direct catre DispatcherServlet si permite validarea statusului HTTP, headerelor si corpului JSON folosind JsonPath.",
    codeSnippet: `@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProductService productService;

    @Test
    void shouldReturnProduct() throws Exception {
        Mockito.when(productService.getById(1L))
            .thenReturn(new ProductDto(1L, "Laptop", 3500.0));

        mockMvc.perform(get("/api/products/1")
                .accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("Laptop"))
            .andExpect(jsonPath("$.price").value(3500.0));
    }
}`,
    interviewTrap: "MockMvc nu trimite cereri reale pe retea (fara port de retea deschis), ceea ce face testele extrem de rapide si stabile.",
    keyTakeaway: "@WebMvcTest testeaza controllerele izolat prin simulari MockMvc, combinat cu @MockBean pentru servicii."
  },
  {
    id: "spring-84",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Asertiuni cu jsonPath(...) in MockMvc",
    question: "Cum folosim sintaxa JsonPath pentru a valida structura si valorile unui payload JSON in testele Spring MVC?",
    answer: "1. Ce este JsonPath (simbolul $):\\n   - O sintaxa standard de navigare si interogare a arborilor JSON (similar cu XPath pentru XML).\\n   - Simbolul \"$\" reprezinta radacina documentului JSON (root element).\\n\\n2. Expresii comune in andExpect(jsonPath(...)):\\n   - $.id: verifica proprietatea \"id\" a obiectului radacina.\\n   - $.items[0].name: verifica numele primului element din lista \"items\".\\n   - $.items.length(): verifica numarul de elemente dintr-o lista.\\n   - $.status: verifica valoarea unui camp text.\\n   - Permite asertiuni puternice: .value(\"Laptop\"), .exists(), .doesNotExist(), .isArray().",
    codeSnippet: `mockMvc.perform(get("/api/orders"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$").isArray()) // Radacina este array
    .andExpect(jsonPath("$.length()").value(2)) // Are 2 comenzi
    .andExpect(jsonPath("$[0].id").value(101))
    .andExpect(jsonPath("$[0].total").isNumber());`,
    interviewTrap: "Daca ai nevoie sa verifici ca un camp lipseste (ex: parola nu este trimisa in JSON), foloseste andExpect(jsonPath(\"$.password\").doesNotExist()).",
    keyTakeaway: "jsonPath(\"$.camp\") permite verificarea directa si eleganta a structurii si datelor din JSON-ul de raspuns in MockMvc."
  },
  {
    id: "spring-85",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "@MockBean vs @Mock din Mockito",
    question: "Care este diferenta dintre adnotarea @Mock din Mockito si adnotarea @MockBean din Spring Boot Test?",
    answer: "Aceasta diferenta este intrebata constant la interviurile de Backend!\\n\\n1. @Mock (Mockito pur):\\n   - Creeaza o instanta falsa (mock) a clasei folosind biblioteca Mockito.\\n   - NU are nicio legatura cu Spring sau cu ApplicationContext!\\n   - Se foloseste in teste unitare rapide JUnit 5 impreuna cu @ExtendWith(MockitoExtension.class).\\n   - Dependintele mock-uite se injecteaza in clasa testata folosind @InjectMocks.\\n\\n2. @MockBean (Spring Boot Test - redenumit @MockitoBean in Spring Boot 3.4+):\\n   - Creeaza un mock Mockito SI IL INREGISTREAZA in ApplicationContext-ul Spring!\\n   - Daca un bean real exista deja in context (ex: UserService), @MockBean il INLOCUIESTE in contextul Spring cu instanta de mock.\\n   - Se foloseste in teste de integrare sau teste feliate (@WebMvcTest, @SpringBootTest) unde alte componente Spring cer acel bean prin injectie.",
    codeSnippet: `// 1. Test Unitar pur (fara Spring):
@ExtendWith(MockitoExtension.class)
class OrderServiceUnitTest {
    @Mock private PaymentGateway gateway; // Mockito simplu
    @InjectMocks private OrderService orderService;
}

// 2. Test Spring Slice (@WebMvcTest):
@WebMvcTest(OrderController.class)
class OrderControllerSliceTest {
    @MockBean private OrderService orderService; // Inregistrat in ApplicationContext Spring!
}`,
    interviewTrap: "Daca folosesti @MockBean intr-un test unitar pur, irosesti resurse pentru ca fortezi Spring sa incerce sa creeze un context. Foloseste @Mock simplu.",
    keyTakeaway: "@Mock este pentru teste unitare Mockito izolate; @MockBean inlocuieste un bean real direct in ApplicationContext-ul Spring."
  },
  {
    id: "spring-86",
    category: 'SPRING',
    difficulty: "USOR",
    title: "@DataJpaTest in Spring Boot",
    question: "Ce componente configureaza adnotarea @DataJpaTest si de ce este ideala pentru testarea Repository-urilor?",
    answer: "1. Ce configureaza @DataJpaTest:\\n   - Este o adnotare de test feliat (sliced test) dedicata stratului de acces la date.\\n   - Scaneaza si configureaza DOAR clasele adnotate cu @Entity si interfetele Spring Data JPA (Repository-urile).\\n   - Configureaza automat o baza de date in-memory (cum ar fi H2, Derby sau HSQLDB) daca exista in test classpath.\\n   - Ofera un bean utilitar TestEntityManager pentru manipulari directe de entitati inainte de interogare.\\n\\n2. Comportament tranzactional automat:\\n   - Fiecare metoda de test adnotata cu @Test este OBLIGATORIU TRANZACTIONALA si face ROLLBACK AUTOMAT la finalul testului! Datele inserate in testul A nu vor polua niciodata testul B.",
    codeSnippet: `@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    void shouldFindUserByEmail() {
        // Arrange:
        entityManager.persist(new User("Ion", "ion@test.com"));

        // Act:
        Optional<User> found = userRepository.findByEmail("ion@test.com");

        // Assert:
        assertThat(found).isPresent();
        assertThat(found.get().getName()).isEqualTo("Ion");
    } // Rollback automat la final!
}`,
    interviewTrap: "Daca vrei sa testezi pe o baza de date reala (ex: PostgreSQL prin Testcontainers) in loc de H2 in-memory, trebuie sa adaugi: @AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE).",
    keyTakeaway: "@DataJpaTest testeaza doar entitatile si repository-urile pe o baza in-memory si face rollback automat la finalul fiecarui test."
  },
  {
    id: "spring-87",
    category: 'SPRING',
    difficulty: "USOR",
    title: "TestRestTemplate vs WebTestClient in teste",
    question: "Cum folosim TestRestTemplate pentru a trimite cereri HTTP reale in testele de integrare @SpringBootTest?",
    answer: "1. Ce este TestRestTemplate:\\n   - O extensie a clasicului RestTemplate configurata special pentru teste de integrare end-to-end.\\n   - Se foloseste impreuna cu @SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT).\\n   - Este tolerant la erori: NU arunca exceptii pe coduri de status 4xx sau 5xx, ci returneaza frumos un ResponseEntity cu statusul si corpul de eroare, permitand asertiuni simple.\\n\\n2. WebTestClient:\\n   - Initial dezvoltat pentru WebFlux, dar disponibil si pentru MVC incepand cu Spring 5.\\n   - Ofera un Fluent API modern bazat pe chaining (asemanator cu MockMvc, dar pe apeluri de retea reale).",
    codeSnippet: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AuthIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void shouldLoginSuccessfully() {
        LoginRequest request = new LoginRequest("user", "password");
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
            "/api/auth/login", request, AuthResponse.class
        );

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().token()).isNotBlank();
    }
}`,
    interviewTrap: "TestRestTemplate trimite pachete reale prin socket pe portul local ales aleator (RANDOM_PORT), testand intregul stack inclusiv Tomcat si filtrele de securitate.",
    keyTakeaway: "TestRestTemplate trimite cereri HTTP reale pe retea in teste de integrare fara a arunca exceptii pe erori 4xx/5xx."
  },
  {
    id: "spring-88",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Profilul de test: @ActiveProfiles(\"test\")",
    question: "Cum incarcam un fisier de configurare dedicat testelor (application-test.yml) folosind @ActiveProfiles?",
    answer: "1. De ce folosim profil de test:\\n   - In mediul local sau de productie folosesti baze de date externe (PostgreSQL), servere de mail reale si chei de API de plata.\\n   - In teste vrei sa folosesti o baza H2 rapida sau mock-uri pentru servicii externe, conexiuni locale si logare pe nivel DEBUG.\\n\\n2. Cum functioneaza @ActiveProfiles(\"test\"):\\n   - Se pune peste clasa de test JUnit.\\n   - Activeaza profilul \"test\", fortand Spring Boot sa incarce fisierul src/test/resources/application-test.properties (sau application-test.yml).\\n   - Proprietatile din fisierul de test le vor suprascrie pe cele din fisierul principal application.yml.",
    codeSnippet: `@SpringBootTest
@ActiveProfiles("test") // Activeaza application-test.yml
class PaymentServiceTest {
    // Rulam cu proprietatile izolate de testare
}`,
    interviewTrap: "Daca plasezi un fisier numit application.properties direct in src/test/resources, el va inlocui complet fisierul de productie, nu doar il va suprascrie partial.",
    keyTakeaway: "@ActiveProfiles(\"test\") activeaza application-test.yml, permitand configurari izolate de baze de date si servicii mock pentru teste."
  },
  {
    id: "spring-89",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Testarea unui Serviciu cu JUnit 5 si Mockito simplu",
    question: "Cum scriem un test unitar pur si ultra-rapid pentru o clasa de @Service fara a incarca contextul Spring?",
    answer: "1. Structura unui test unitar pur:\\n   - Se adnoteaza clasa de test cu @ExtendWith(MockitoExtension.class) din JUnit 5.\\n   - Dependintele serviciului (Repository-uri, alte servicii) se marcheaza cu @Mock.\\n   - Serviciul testat se marcheaza cu @InjectMocks (Mockito va crea instanta serviciului si ii va injecta automat mock-urile prin constructor!).\\n   - Nu se foloseste nicio adnotare de Spring (@Autowired, @SpringBootTest)!\\n\\n2. Rularea testului (Pattern-ul AAA - Arrange, Act, Assert):\\n   - Arrange: Mockito.when(mockRepo.findById(1L)).thenReturn(Optional.of(user)).\\n   - Act: userDto = userService.getById(1L).\\n   - Assert: assertThat(userDto.name()).isEqualTo(\"Ion\").\\n   - Executia dureaza 5 milisecunde!",
    codeSnippet: `@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void shouldReturnUserWhenExists() {
        // Arrange:
        User mockUser = new User(1L, "Mihai");
        Mockito.when(userRepository.findById(1L)).thenReturn(Optional.of(mockUser));

        // Act:
        UserDto result = userService.getUserById(1L);

        // Assert:
        assertThat(result.name()).isEqualTo("Mihai");
    }
}`,
    interviewTrap: "Testele unitare cu MockitoExtension nu au nevoie de context Spring. Daca adaugi @SpringBootTest, irosesti timp de compilare si executie inutil.",
    keyTakeaway: "@ExtendWith(MockitoExtension.class) impreuna cu @Mock si @InjectMocks ofera teste unitare pure care ruleaza in milisecunde."
  },
  {
    id: "spring-90",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Verificarea apelurilor mock cu Mockito.verify() si ArgumentCaptor",
    question: "Cum verificam ca o metoda a unui mock a fost apelata cu parametrii corecti folosind Mockito.verify() si ArgumentCaptor?",
    answer: "1. Mockito.verify(mock, times):\\n   - Valideaza ca o metoda a unui obiect mock a fost apelata exact de un numar specificat de ori (ex: verify(repo, times(1)).save(any())).\\n   - verify(repo, never()).deleteById(any()): util pentru a verifica ca nu s-a sters nimic daca validarea a esuat!\\n\\n2. ArgumentCaptor<T>:\\n   - Permite \"capturarea\" parametrului real transmis catre mock in timpul executiei pentru a-i inspecta valorile interne (campuri generate automat, parole criptate, timestamp-uri).",
    codeSnippet: `@Test
void shouldSaveUserWithHashedPassword() {
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

    userService.register(new RegisterDto("ana", "rawPassword"));

    // Verificam ca save s-a apelat o singura data si capturam obiectul salvat:
    Mockito.verify(userRepository, Mockito.times(1)).save(userCaptor.capture());

    User savedUser = userCaptor.getValue();
    assertThat(savedUser.getUsername()).isEqualTo("ana");
    assertThat(savedUser.getPassword()).startsWith("$2a$"); // Parola a fost criptata cu BCrypt!
}`,
    interviewTrap: "Foloseste verifyNoInteractions(mock) pentru a valida ca o dependinta nu a fost apelata deloc in cazul in care s-a aruncat o exceptie de validare timpurie.",
    keyTakeaway: "Mockito.verify() verifica numarul de apeluri pe un mock; ArgumentCaptor captureaza si inspecteaza obiectele transmise ca argument."
  },
  {
    id: "spring-91",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Rollback automat in testele cu @DataJpaTest",
    question: "De ce testele adnotate cu @DataJpaTest fac rollback automat la final si cum poti forta commit-ul daca e nevoie?",
    answer: "1. De ce fac rollback automat:\\n   - Prin design, testele de baze de date trebuie sa fie complet INDEPENDENTE si REPETABILE.\\n   - Daca testul 1 ar insera un utilizator cu email \"test@test.com\" si ar face commit, cand ruleaza testul 2, inserarea aceluiasi utilizator ar pica din cauza constrangerii de UNIQUE pe email!\\n   - @DataJpaTest include implicit meta-adnotarea @Transactional, care la finalul fiecarei metode de test declanseaza un ROLLBACK automat al tranzactiei, lasand baza perfect curata.\\n\\n2. Cum fortezi commit-ul daca este neaparat nevoie:\\n   - Adaugi adnotarea @Rollback(false) sau @Commit pe metoda de test.",
    codeSnippet: `@DataJpaTest
class ProductRepoTest {

    @Test
    // Implicit @Rollback(true) -> Baza ramane curata dupa executie!
    void testSave() {
        productRepo.save(new Product("Laptop"));
    }

    @Test
    @Rollback(false) // Forteaza salvarea (nerecomandat de regula in teste)
    void testCommitExplicit() { ... }
}`,
    interviewTrap: "Daca apelezi repository.save() intr-un test si nu apelezi entityManager.flush(), s-ar putea ca SQL-ul de INSERT sa nu fie trimis pe fir daca tranzactia face rollback inainte de flush.",
    keyTakeaway: "@DataJpaTest face rollback automat dupa fiecare metoda de test pentru a asigura izolarea completa a testelor si prevenirea poluarii datelor."
  },
  {
    id: "spring-92",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Adnotarea @DirtiesContext in teste",
    question: "Ce face adnotarea @DirtiesContext si de ce folosirea ei excesiva incetineste dramatic suita de teste?",
    answer: "1. Ce face @DirtiesContext:\\n   - Semnaleaza Spring Test Framework ca testul curent a \"murdarit\" sau modificat starea interna a ApplicationContext-ului (ex: a modificat un bean singleton partajat sau a oprit un server intern).\\n   - Forteaza Spring sa DISTRUGA si sa INCHIDA contextul curent din cache si sa creeze un nou ApplicationContext de la zero pentru urmatorul test!\\n\\n2. De ce incetineste testele (Test Context Caching):\\n   - In mod normal, Spring reutilizeaza acelasi ApplicationContext intre zeci de clase de test daca au aceeasi configuratie (Context Caching), ceea ce face testele rapide.\\n   - Daca pui @DirtiesContext peste tot, Spring va recrea contextul de la zero la fiecare metoda, adaugand cate 5-10 secunde per test!",
    codeSnippet: `@SpringBootTest
class DirtyTest {

    @Test
    @DirtiesContext // Distruge contextul dupa executia acestei metode
    void testModifyingGlobalState() {
        // Modifica un bean singleton static
    }
}`,
    interviewTrap: "Evita folosirea @DirtiesContext prin scrierea de cod de test curat care restaureaza starea in metodele @AfterEach in loc de a distruge contextul Spring.",
    keyTakeaway: "@DirtiesContext forteaza recrearea completa a ApplicationContext-ului; rezolva stari poluate dar incetineste sever viteza testelor."
  },
  {
    id: "spring-93",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Testcontainers in Spring Boot",
    question: "Ce este Testcontainers si cum elimina necesitatea de a folosi baze in-memory H2 in testele de integrare?",
    answer: "1. Problema cu H2 in-memory in teste:\\n   - H2 nu este PostgreSQL sau MySQL! Multe functii native (JSONB, indecsi GIN, extensii pgvector, proceduri stocate, clauze specifice) nu sunt suportate sau functioneaza diferit in H2.\\n   - Testul trece pe H2 in CI, dar aplicatia crapa in productie pe PostgreSQL!\\n\\n2. Ce este Testcontainers:\\n   - O biblioteca Java care porneste containere Docker reale si usoare (ex: PostgreSQL, Redis, Kafka, RabbitMQ) la rularea testelor JUnit.\\n   - Incepand cu Spring Boot 3.1, exista suport nativ de clasa intai prin adnotarea @ServiceConnection: Spring Boot configureaza automat conexiunea DataSource direct din containerul Docker pornit, fara sa mai configurezi proprietati manuale de JDBC!",
    codeSnippet: `@SpringBootTest
@Testcontainers
class RealPostgresIntegrationTest {

    @Container
    @ServiceConnection // Configureaza automat DataSource catre acest Postgres din Docker!
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private UserRepository userRepository;

    @Test
    void testWithRealPostgreSQL() {
        // Ruleaza pe un PostgreSQL 16 real in Docker!
        userRepository.save(new User("Andrei"));
        assertThat(userRepository.count()).isEqualTo(1);
    }
}`,
    interviewTrap: "Testcontainers necesita instalarea si rularea motorului Docker pe masina de dezvoltare sau pe agentul de CI/CD.",
    keyTakeaway: "Testcontainers ruleaza instante reale de baze de date in containere Docker; @ServiceConnection configureaza automat conexiunea Spring Boot."
  },
  {
    id: "spring-94",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Testarea validarilor in Controller cu MockMvc",
    question: "Cum verificam intr-un test @WebMvcTest ca trimiterea unui JSON invalid returneaza HTTP 400 Bad Request?",
    answer: "1. Cum se structureaza testul:\\n   - Se construieste un payload JSON care violeaza intentionat adnotarile @NotBlank sau @Min din DTO (ex: campul name este gol: \"\").\\n   - Se trimite cererea POST prin mockMvc.perform().\\n   - Se valideaza ca statusul este status().isBadRequest() (400).\\n   - Se foloseste jsonPath pentru a verifica ca mesajul de eroare specific campului respectiv se afla in corpul raspunsului.",
    codeSnippet: `@Test
void shouldReturn400WhenNameIsBlank() throws Exception {
    String invalidJson = """
        {
            "name": "",
            "email": "invalid-email",
            "age": 15
        }
        """;

    mockMvc.perform(post("/api/users")
            .contentType(MediaType.APPLICATION_JSON)
            .content(invalidJson))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.name").exists())
        .andExpect(jsonPath("$.email").exists());
}`,
    interviewTrap: "Asigura-te ca in semnatura metodei din Controller ai pus adnotarea @Valid in fata lui @RequestBody, altfel validarea nu se va declansa si testul va pica!",
    keyTakeaway: "Testarea validarilor trimite JSON invalid si verifica primirea codului HTTP 400 Bad Request si a detaliilor pe campuri."
  },
  {
    id: "spring-95",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Testarea endpoint-urilor securizate cu @WithMockUser",
    question: "Cum testam endpoint-uri protejate de Spring Security fara a implementa un flux real de login folosind @WithMockUser?",
    answer: "1. Ce este @WithMockUser:\\n   - O adnotare din modulul spring-security-test.\\n   - Populeaza automat SecurityContextHolder cu un utilizator autentificat mock (de tip UsernamePasswordAuthenticationToken) inainte de executia fiecarui test.\\n   - Permite specificarea utilizatorului, parolei si rolurilor: @WithMockUser(username = \"admin\", roles = {\"ADMIN\", \"USER\"}).\\n\\n2. Verificarea securitatii in teste:\\n   - Fara utilizator autentificat -> mockMvc verifica status().isUnauthorized() (401).\\n   - Cu utilizator fara rol suficient -> mockMvc verifica status().isForbidden() (403).\\n   - Cu rol corect -> mockMvc verifica status().isOk() (200).",
    codeSnippet: `@WebMvcTest(AdminController.class)
class AdminControllerSecurityTest {

    @Autowired private MockMvc mockMvc;

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void shouldAllowAdminAccess() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
            .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void shouldDenyNormalUserAccess() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
            .andExpect(status().isForbidden()); // 403 Forbidden!
    }
}`,
    interviewTrap: "In @WithMockUser(roles = \"ADMIN\"), Spring Security adauga automat prefixul \"ROLE_\", creand autoritatea \"ROLE_ADMIN\". Daca folosesti authorities = \"ADMIN\", prefixul nu se adauga.",
    keyTakeaway: "@WithMockUser simuleaza un utilizator autentificat cu roluri specifice pentru a testa autorizarea endpoint-urilor securizate."
  },
  {
    id: "spring-96",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Testarea metodelor asincrone si a scheduler-elor (@Scheduled)",
    question: "Cum testezi o metoda asincrona (@Async) sau un task programat (@Scheduled) in Spring?",
    answer: "1. Problema cu testarea codului asincron:\\n   - Daca o metoda ruleaza pe un alt thread si testul JUnit termina executia pe thread-ul principal, asertiunile pot fi evaluate inainte ca metoda asincrona sa se fi executat (test instabil / flaky test)!\\n\\n2. Solutii recomandate:\\n   - Solutia 1 (Testare Unitara a logicii): Apelezi metoda din serviciu direct, ca pe o metoda Java simpla, fara a porni Spring @EnableAsync. Logica de business se testeaza sincron.\\n   - Solutia 2 (Biblioteca Awaitility): Biblioteca standard pentru testarea codului asincron. Ofera comenzi de asteptare: await().atMost(5, SECONDS).untilAsserted(() -> assertThat(...)).",
    codeSnippet: `@SpringBootTest
class ScheduledReportTest {

    @SpyBean
    private ReportScheduler scheduler;

    @Test
    void shouldTriggerScheduledTask() {
        // Asteapta pana la 3 secunde ca metoda sa fi fost apelata de scheduler:
        org.awaitility.Awaitility.await()
            .atMost(Duration.ofSeconds(3))
            .untilAsserted(() -> Mockito.verify(scheduler, Mockito.atLeastOnce()).generateReport());
    }
}`,
    interviewTrap: "Nu folosi Thread.sleep(2000) in teste pentru a astepta codul asincron! Thread.sleep incetineste testele si duce la teste instabile; foloseste Awaitility.",
    keyTakeaway: "Testarea sarcinilor asincrone si programate foloseste biblioteca Awaitility pentru asteptare inteligenta si asertiuni stabile."
  },
  {
    id: "spring-97",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Injectarea de proprietati temporare cu @TestPropertySource",
    question: "Cum suprascrii punctual o singura proprietate de configurare doar pentru o anumita clasa de test folosind @TestPropertySource?",
    answer: "1. Ce este @TestPropertySource:\\n   - O adnotare plasata pe o clasa de test Spring Boot care are o prioritate superioara fisierelor application.properties si application.yml existente.\\n\\n2. Moduri de utilizare:\\n   - Inline: @TestPropertySource(properties = {\"app.feature.flag=true\", \"server.port=9999\"}).\\n   - Prin fisier extern de proprietati: @TestPropertySource(locations = \"classpath:custom-test.properties\").\\n\\n3. Utilizare clasica:\\n   - Activarea sau dezactivarea temporara a unui modul de test (ex: dezactivarea cache-ului, simularea unui timeout mic) fara a modifica fisierul comun de configurare.",
    codeSnippet: `@SpringBootTest
@TestPropertySource(properties = {
    "app.payment.mock-enabled=true",
    "app.retry.max-attempts=1"
})
class PaymentRetryTest {
    // Rulam cu mock-enabled=true si max-attempts=1
}`,
    interviewTrap: "Proprietatile definite in @TestPropertySource au prioritate mai mare decat orice fisier application-test.properties din classpath.",
    keyTakeaway: "@TestPropertySource suprascrie rapid proprietati inline pentru un test specific, fara a altera fisierele de configurare comune."
  },
  {
    id: "spring-98",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Evenimente de aplicatie: ApplicationEventPublisher si @EventListener",
    question: "Cum implementam mecanismul de Evenimente interne in Spring Boot folosind ApplicationEventPublisher si @EventListener?",
    answer: "1. Ce este mecanismul de Evenimente in Spring:\\n   - O implementare a sablonului Observer Pattern in cadrul aceluiasi ApplicationContext, permitand decuplarea completa intre cel care produce o actiune (Publisher) si cel care reactioneaza la ea (Listener).\\n\\n2. Componente:\\n   - Clasa de Eveniment: Poate fi un simplu Java Record sau clasa POJO (ex: public record UserRegisteredEvent(String email) {}).\\n   - Publicatorul: Injecteaza interfata ApplicationEventPublisher si apeleaza publisher.publishEvent(new UserRegisteredEvent(email)).\\n   - Ascultatorul (Listener): O simpla metoda adnotata cu @EventListener (ex: @EventListener public void onUserRegistered(UserRegisteredEvent e) { ... }).\\n\\n3. Executie Sincrona vs Asincrona:\\n   - In mod implicit, executia este STRICT SINCRONA (in acelasi thread si in aceeasi tranzactie!).\\n   - Daca vrei executie asincrona in fundal, adaugi adnotarea @Async peste @EventListener.",
    codeSnippet: `// 1. Evenimentul (Record curat):
public record OrderPlacedEvent(Long orderId, String customerEmail) {}

// 2. Publicatorul (Service de comanda decuplat de email!):
@Service
public class OrderService {
    private final ApplicationEventPublisher eventPublisher;
    public OrderService(ApplicationEventPublisher p) { this.eventPublisher = p; }

    @Transactional
    public void placeOrder() {
        // ... salvare comanda ...
        eventPublisher.publishEvent(new OrderPlacedEvent(101L, "client@test.com"));
    }
}

// 3. Ascultatorul (Trimite notificarea):
@Component
public class NotificationListener {
    @EventListener
    public void handleOrderPlaced(OrderPlacedEvent event) {
        System.out.println("Trimitem email de confirmare pentru comanda: " + event.orderId());
    }
}`,
    interviewTrap: "Daca ai tranzactii cu baza de date, foloseste @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) pentru a asigura ca notificarea pleaca DOAR daca tranzactia a facut commit cu succes!",
    keyTakeaway: "ApplicationEventPublisher publica evenimente, iar @EventListener reactioneaza la ele, decupland complet serviciile in interiorul aplicatiei."
  },
  {
    id: "spring-99",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Utilizarea AssertJ pentru asertiuni clare in teste",
    question: "De ce biblioteca AssertJ (metoda assertThat) este preferata fata de asertiunile clasice din JUnit (assertEquals)?",
    answer: "1. Fluent API si Lizibilitate:\\n   - JUnit clasic: assertEquals(expected, actual) -> Usor de inversat argumentele din greseala!\\n   - AssertJ: assertThat(actual).isEqualTo(expected) -> Citire naturala de la stanga la dreapta, exact ca o propozitie in limba engleza.\\n\\n2. Autocomplete puternic in IDE:\\n   - Cand tastezi assertThat(myList)., IDE-ul iti sugereaza automat zeci de asertiuni relevante pentru colectii: .hasSize(3), .contains(\"A\"), .isNotEmpty(), .doesNotContainNull().\\n\\n3. Mesaje exceptionale de eroare la esec:\\n   - AssertJ afiseaza exact diferentele dintre obiecte, colectii sau campuri cand un test pica, facand depanarea instantanee.",
    codeSnippet: `// Cu AssertJ:
assertThat(user.getName())
    .isNotNull()
    .startsWith("A")
    .isEqualToIgnoringCase("ana");

assertThat(userList)
    .hasSize(2)
    .extracting(User::getRole)
    .containsExactly("USER", "ADMIN");`,
    interviewTrap: "AssertJ vine inclus automat in dependenta spring-boot-starter-test, deci nu este nevoie sa adaugi nicio dependinta suplimentara in proiect.",
    keyTakeaway: "AssertJ ofera un Fluent API intuitiv, auto-complete bogat in IDE si mesaje detaliate de eroare, inlocuind asertiunile clasice JUnit."
  },
  {
    id: "spring-100",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Piramida de Testare intr-o aplicatie Spring Boot",
    question: "Cum arata Piramida de Testare recomandata pentru o aplicatie Spring Boot si care este ponderea straturilor de teste?",
    answer: "Piramida de testare (Test Pyramid) structureaza testele pe 3 niveluri in functie de viteza, cost si acoperire:\\n\\n1. Baza piramidei (70% - Teste Unitare pure):\\n   - JUnit 5 + Mockito simplu pe servicii si clase de utilitate.\\n   - Fara context Spring (@SpringBootTest evitat!).\\n   - Ruleaza in cateva milisecunde si acopera toata logica de business si cazurile limita.\\n\\n2. Mijlocul piramidei (20% - Teste de Integrare Sliced):\\n   - @WebMvcTest pentru controllere si validari HTTP.\\n   - @DataJpaTest pentru repository-uri si interogari complexe.\\n   - Ruleaza in cateva sute de milisecunde si valideaza integrarea dintre componente apropiate.\\n\\n3. Varful piramidei (10% - Teste End-to-End / Sistem):\\n   - @SpringBootTest cu Testcontainers pe baze de date reale.\\n   - Valideaza fluxul complet al catorva scenarii critice de utilizator (ex: fluxul de login si plata).\\n   - Ruleaza mai lent (secunde), dar ofera incredere maxima inainte de lansare.",
    codeSnippet: `// Piramida de Testare Spring Boot:
//          /\\
//         /  \\  10% End-to-End (@SpringBootTest + Testcontainers)
//        /---- 
//       /      \\ 20% Sliced Tests (@WebMvcTest, @DataJpaTest)
//      /--------\\
//     /          \\ 70% Teste Unitare Pure (JUnit 5 + Mockito)`,
    interviewTrap: "Anti-pattern-ul \"Ice Cream Cone\" (cornet de inghetata) apare cand o echipa scrie aproape doar teste greoaie de integrare si ignora testele unitare rapide, ducand la build-uri lente si fragile.",
    keyTakeaway: "Baza solida a aplicatiei consta in teste unitare pure rapide (70%), sustinute de teste feliate (20%) si cateva teste end-to-end critice (10%)."
  },
  {
    id: "spring-101",
    category: 'SPRING',
    difficulty: "USOR",
    title: "CrudRepository vs JpaRepository vs PagingAndSortingRepository",
    question: "Care este ierarhia de interfete din Spring Data JPA si care sunt diferentele dintre CrudRepository, PagingAndSortingRepository si JpaRepository?",
    answer: "Ierarhia de mostenire din Spring Data este:\\nRepository<T, ID> (Interfata marker)\\n   ↓\\nCrudRepository<T, ID>\\n   ↓\\nPagingAndSortingRepository<T, ID>\\n   ↓\\nJpaRepository<T, ID>\\n\\n1. CrudRepository:\\n   - Ofera metodele de baza pentru operatiuni CRUD: save(), findById(), existsById(), findAll(), count(), deleteById(), delete().\\n\\n2. PagingAndSortingRepository:\\n   - Extinde (sau completeaza) CrudRepository si adauga suport pentru paginare si sortare: findAll(Sort sort) si findAll(Pageable pageable).\\n\\n3. JpaRepository (Cea mai folosita in practica):\\n   - Extinde PagingAndSortingRepository si adauga metode specifice JPA:\\n     - Operatiuni batch / flush: flush(), saveAndFlush(), deleteInBatch().\\n     - Metode care returneaza direct List in loc de Iterable (findAll() returneaza List<T>).\\n     - Suport pentru getReferenceById() (Proxy lazy).\\n\\n4. Recomandare:\\n   - Foloseste JpaRepository pentru flexibilitate maxima in aplicatii Spring Boot standard.",
    codeSnippet: `public interface UserRepository extends JpaRepository<User, Long> {
    // Mosteneste automat metode CRUD, paginare, sortare si flush!
}`,
    interviewTrap: "Daca ai nevoie sa limitezi metodele expuse catre clienti (ex: vrei doar citiri fara delete), poti extinde direct Repository<T, ID> si sa declari punctual doar metodele dorite.",
    keyTakeaway: "JpaRepository extinde PagingAndSortingRepository si CrudRepository, oferind functionalitati complete CRUD, paginare si operatiuni batch/flush."
  },
  {
    id: "spring-102",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Generarea automata a interogarilor din numele metodelor (Query Creation)",
    question: "Cum deduce Spring Data JPA interogari SQL pe baza denumirii metodei din Repository si ce cuvinte cheie suporta?",
    answer: "1. Mecanismul de parsare (Query Creation from Method Names):\\n   - Spring Data JPA analizeaza prefixul (findBy, getBy, readBy, countBy, existsBy) si imparte restul denumirii metodei pe baza proprietatilor entitatii.\\n   - Compilatorul si Spring Data construiesc automat interogarea JPQL si SQL la pornirea aplicatiei fara sa scrii nicio linie de SQL manual!\\n\\n2. Cuvinte cheie suportate:\\n   - Operatori logici: And, Or (ex: findByEmailAndStatus).\\n   - Comparatii: Between, LessThan, GreaterThan, LessThanEqual, IsNull, NotNull.\\n   - String-uri: Like, StartingWith, EndingWith, Containing, IgnoreCase.\\n   - Colectii: In, NotIn (ex: findByRoleIn(List<String> roles)).\\n   - Boolean: True, False.\\n   - Ordonare si limitare: OrderByAgeDesc, findFirstBy, findTop3By.",
    codeSnippet: `public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    // Genereaza automat: WHERE email = ? AND active = true
    Optional<Employee> findByEmailAndActiveTrue(String email);

    // Genereaza automat: WHERE salary >= ? ORDER BY hire_date DESC
    List<Employee> findBySalaryGreaterThanEqualOrderByHireDateDesc(Double minSalary);

    // Genereaza: SELECT count(*) > 0 ...
    boolean existsByUsername(String username);
}`,
    interviewTrap: "Daca gresesti numele unui camp in denumirea metodei (ex: findByEmmail in loc de findByEmail), Spring Boot va arunca PropertyReferenceException la startup si va opri aplicatia.",
    keyTakeaway: "Spring Data JPA genereaza interogari automate din numele metodelor (findBy, And, Or, Containing, OrderBy), validate la startup."
  },
  {
    id: "spring-103",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarea @Query: JPQL vs Native SQL",
    question: "Care este diferenta dintre interogarile JPQL si interogarile Native SQL in adnotarea @Query din Spring Data JPA?",
    answer: "1. JPQL (Java Persistence Query Language - Implicit / default):\\n   - Lucreaza cu CLASELE si CAMPURILE din Java, NU cu tabelele si coloanele din baza de date!\\n   - Sintaxa: \"SELECT u FROM User u WHERE u.email = :email\" (User este clasa entitatii, email este campul Java).\\n   - Independent de baza de date (Database Agnostic): Hibernate traduce automat JPQL in dialectul specific bazei tale (PostgreSQL, MySQL, Oracle).\\n   - Suporta navigare orientata pe obiecte prin relatii (u.department.name).\\n\\n2. Native SQL (nativeQuery = true):\\n   - Este SQL pur trimis direct catre motorul bazei de date particulare.\\n   - Sintaxa: \"SELECT * FROM app_users WHERE user_email = :email\" (tabele si coloane fizice din DB).\\n   - Dependent de baza de date (daca folosesti functii specifice PostgreSQL, interogarea va pica pe MySQL).\\n   - Se foloseste DOAR cand ai nevoie de functii specifice DB, indecsi GIN, window functions complexe sau optimizari de performanta unde JPQL nu este suficient.",
    codeSnippet: `// 1. JPQL (Recomandat - pe clase si campuri Java):
@Query("SELECT u FROM User u WHERE u.status = :status AND u.age >= :minAge")
List<User> findActiveAdults(@Param("status") String status, @Param("minAge") int minAge);

// 2. Native SQL (pe tabele si coloane fizice):
@Query(value = "SELECT * FROM users u WHERE u.email ILIKE :domain%", nativeQuery = true)
List<User> findUsersByDomainNative(@Param("domain") String domain);`,
    interviewTrap: "In JPQL, scrierea \"SELECT * FROM User\" va arunca eroare de sintaxa! In JPQL trebuie sa definesti un alias: \"SELECT u FROM User u\".",
    keyTakeaway: "JPQL interogheaza entitati si campuri Java independente de baza de date; Native SQL (nativeQuery = true) ruleaza SQL brut specific bazei de date."
  },
  {
    id: "spring-104",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarile de baza ale unei entitati JPA: @Entity, @Table, @Id",
    question: "Ce rol au adnotarile @Entity, @Table, @Id si @GeneratedValue si care este diferenta dintre strategiile IDENTITY si SEQUENCE?",
    answer: "1. @Entity:\\n   - Marcheaza clasa ca o entitate JPA gestionata de Hibernate si mapata pe o tabela din baza de date.\\n   - Clasa TREBUIE sa aiba obligatoriu un constructor fara parametri (no-args constructor: public sau protected).\\n\\n2. @Table(name = \"tabela_db\"):\\n   - Specifica numele tabelei din baza de date. Daca este omisa, JPA va folosi numele clasei.\\n\\n3. @Id si @GeneratedValue(strategy = GenerationType...):\\n   - @Id marcheaza cheia primara (Primary Key) a entitatii.\\n   - GenerationType.IDENTITY: Baza de date genereaza cheia prin coloana auto-increment (SERIAL / AUTO_INCREMENT). Dezavantaj major: Hibernate trebuie sa faca INSERT imediat pentru a afla ID-ul generat, dezactivand JDBC batch insertions!\\n   - GenerationType.SEQUENCE (Recomandat in PostgreSQL / Oracle): Foloseste un obiect Sequence din baza de date. Hibernate poate aloca calupuri de ID-uri in avans (allocationSize = 50), pastrand activa optimizarea de batching la scriere.",
    codeSnippet: `@Entity
@Table(name = "customers")
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "cust_seq")
    @SequenceGenerator(name = "cust_seq", sequenceName = "customers_seq", allocationSize = 50)
    private Long id;

    // Constructor fara parametri cerut de JPA:
    protected Customer() {}

    public Customer(String name) { this.name = name; }
}`,
    interviewTrap: "Daca folosesti GenerationType.IDENTITY, operatiunea de JDBC Batching (salvarea a 100 de obiecte intr-un singur apel de retea) este dezactivata complet de Hibernate!",
    keyTakeaway: "@Entity marcheaza entitatea; SEQUENCE este preferat fata de IDENTITY deoarece permite batch insert-uri eficiente in baze relationale moderne."
  },
  {
    id: "spring-105",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Adnotarile @Column, @Enumerated si @Transient in JPA",
    question: "Ce fac adnotarile @Column, @Enumerated(EnumType.STRING) si @Transient pe un camp dintr-o entitate?",
    answer: "1. @Column:\\n   - Configureaza maparea coloanei din baza de date: name = \"user_name\", nullable = false, unique = true, length = 100.\\n\\n2. @Enumerated(EnumType.STRING):\\n   - CRITIC: Daca nu specifici parametrul, JPA foloseste implicit EnumType.ORDINAL, care salveaza indexul numeric al enum-ului (0, 1, 2) in baza de date. Daca schimbi ordinea din cod, datele din DB devin complet corupte!\\n   - EnumType.STRING salveaza numele text al constantei (ex: \"PENDING\", \"ACTIVE\"), fiind complet sigur la refactoring.\\n\\n3. @Transient:\\n   - Semnaleaza lui JPA/Hibernate ca acel camp NU este o coloana din baza de date si NU trebuie salvat sau citit din DB.\\n   - Se foloseste pentru campuri derivate sau calculate in memorie (ex: varsta calculata din data nasterii).",
    codeSnippet: `@Entity
public class Order {
    @Id private Long id;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    // Salveaza "NEW", "PROCESSING" ca text:
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Transient // Nu exista coloana corespunzatoare in DB!
    public boolean isExpired() {
        return calculateIfExpired();
    }
}`,
    interviewTrap: "Nu folosi niciodata EnumType.ORDINAL in aplicatii profesionale; foloseste intotdeauna EnumType.STRING.",
    keyTakeaway: "@Column configureaza coloana; @Enumerated(EnumType.STRING) salveaza textul sigur al enum-ului; @Transient exclude campul de la persistenta."
  },
  {
    id: "spring-106",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Relatia @ManyToOne si @OneToMany in JPA",
    question: "Cum se configureaza o relatie One-to-Many / Many-to-One bidirectionala si care este Owning Side (partea proprietara)?",
    answer: "1. Ce este Owning Side (Partea Proprietara):\\n   - Este partea care DETINE coloana de cheie straina (Foreign Key) fizica in tabela din baza de date.\\n   - In relatia Parinte-Copil (Departament -> Angajati), tabela angajatilor contine coloana department_id.\\n   - Prin urmare, partea @ManyToOne (Angajatul) este INTOTDEAUNA Owning Side! Doar modificarile aduse partii @ManyToOne sunt salvate de Hibernate in baza de date.\\n\\n2. Partea Inversa (Inverse Side - @OneToMany):\\n   - Nu contine cheia straina; este doar o vizualizare bidirectionala.\\n   - TREBUIE sa contina atributul mappedBy = \"department\" (unde \"department\" este numele campului din clasa copil Angajat).\\n\\n3. Metode Helper de sincronizare:\\n   - In entitatea parinte se creeaza metode helper (addEmployee, removeEmployee) pentru a mentine sincronizate ambele capete in memoria Java.",
    codeSnippet: `@Entity
public class Department {
    @Id private Long id;

    // Partea inversa (mappedBy pointeaza catre campul din Employee):
    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Employee> employees = new ArrayList<>();

    public void addEmployee(Employee emp) {
        employees.add(emp);
        emp.setDepartment(this); // Sincronizare pe Owning Side!
    }
}

@Entity
public class Employee {
    @Id private Long id;

    // Owning Side (detine cheia straina 'department_id' in DB):
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;
}`,
    interviewTrap: "Daca adaugi copilul in lista parintelui (department.getEmployees().add(emp)) fara sa setezi emp.setDepartment(department), Hibernate NU va salva cheia straina in DB!",
    keyTakeaway: "@ManyToOne este intotdeauna Owning Side (detine foreign key-ul); @OneToMany foloseste mappedBy si necesita metode helper de sincronizare."
  },
  {
    id: "spring-107",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Rolul atributului mappedBy in JPA",
    question: "Ce se intampla daca omiti atributul mappedBy intr-o relatie @OneToMany in JPA?",
    answer: "1. Ce face mappedBy:\\n   - Ii spune lui Hibernate: \"Aceasta relatie este bidirectionala, iar tabela fizica de legatura si cheia straina sunt deja gestionate de campul specificat din cealalta entitate\".\\n\\n2. Ce se intampla daca OMITI mappedBy (Capcana majora!):\\n   - Hibernate va presupune ca ai definit o relatie Unidirectionala One-to-Many.\\n   - Pentru relatiile unidirectionale fara mappedBy, Hibernate creeaza AUTOMAT o a 3-a tabela de legatura (Join Table) in baza de date (ex: department_employees), exact ca la Many-to-Many!\\n   - Fiecare adaugare sau stergere va rula interogari inutile in tabela intermediara, degradand grav performanta si complicand schema.",
    codeSnippet: `// GRESIT (fara mappedBy):
// @OneToMany
// private List<Employee> employees; 
// -> Hibernate genereaza automat o a 3-a tabela inutila: department_employees!

// CORECT (cu mappedBy):
@OneToMany(mappedBy = "department")
private List<Employee> employees;
// -> Nu se creeaza nicio tabela suplimentara; foloseste department_id din tabela employees!`,
    interviewTrap: "mappedBy nu poate fi pus NICIODATA pe adnotarea @ManyToOne! Se plaseaza doar pe partea inversa (@OneToMany, @OneToOne invers, @ManyToMany invers).",
    keyTakeaway: "mappedBy semnaleaza partea inversa a relatiei; lipsa lui pe @OneToMany forteaza crearea unei tabele intermediare inutile."
  },
  {
    id: "spring-108",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Tipuri de Cascadare (CascadeType) in JPA",
    question: "Ce fac tipurile de cascadare (CascadeType) si de ce CascadeType.REMOVE trebuie folosit cu mare precautie?",
    answer: "1. Ce este Cascadarea (Cascading):\\n   - Permite propagarea automata a operatiunilor efectuate pe entitatea parinte catre entitatile sale copil asociate.\\n\\n2. Tipurile principale de CascadeType:\\n   - CascadeType.PERSIST: Salvarea parintelui propaga em.persist() pe toti copiii noi din lista.\\n   - CascadeType.MERGE: Reatasarea parintelui propaga em.merge() pe copii.\\n   - CascadeType.REMOVE: Stergerea parintelui va declansa automat stergerea tuturor copiilor asociati din DB!\\n   - CascadeType.ALL: Combina toate operatiunile (PERSIST, MERGE, REMOVE, REFRESH, DETACH).\\n\\n3. De ce CascadeType.REMOVE este periculos:\\n   - Daca este pus din greseala pe o relatie gresita (sau pe @ManyToOne), stergerea unui copil poate sterge parintele sau invers!\\n   - Hibernate va sterge copiii unul cate unul (N interogari DELETE) in loc de un singur DELETE batch pe foreign key in baza de date.",
    codeSnippet: `@Entity
public class Invoice {
    @Id private Long id;

    // Perfect pentru relatii agregate puternice (Factura -> Linii Factura):
    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InvoiceItem> items = new ArrayList<>();
}`,
    interviewTrap: "Nu pune niciodata CascadeType.REMOVE sau ALL pe o relatie @ManyToOne! Daca stergi un Angajat, vei sterge intregul Departament cu toti ceilalti colegi din el!",
    keyTakeaway: "Cascade propaga operatiunile de la parinte la copii; CascadeType.ALL este potrivit pentru relatii parinte-copil stranse (Factura -> Linii)."
  },
  {
    id: "spring-109",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Ce face orphanRemoval = true in JPA?",
    question: "Care este diferenta dintre orphanRemoval = true si CascadeType.REMOVE in JPA?",
    answer: "1. CascadeType.REMOVE:\\n   - Se activeaza DOAR atunci cand stergi entitatea PARINTE (ex: em.remove(invoice)).\\n   - Toti copiii asociati sunt stersi din baza de date odata cu parintele.\\n   - Daca doar elimini un copil din lista parintelui (invoice.getItems().remove(0)) fara sa stergi factura, copilul NU va fi sters din baza de date! Ramane un \"orfan\" in DB.\\n\\n2. orphanRemoval = true:\\n   - Face tot ce face CascadeType.REMOVE cand parintele este sters, DAR IN PLUS:\\n   - Daca elimini un copil din colectia parintelui (items.remove(item)) sau stergi lista (items.clear()), Hibernate va emite automat o comanda SQL DELETE pentru acel copil orfan la commit/flush!\\n   - Asigura ca un copil nu poate exista in baza de date fara a fi legat de un parinte.",
    codeSnippet: `@OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
private List<Comment> comments = new ArrayList<>();

// Cu orphanRemoval = true:
post.getComments().remove(0); // Hibernate va emite SQL DELETE FROM comments WHERE id = ... !`,
    interviewTrap: "orphanRemoval = true este specific relatiilor parinte-copil unde copilul are sens de existenta exclusiv in interiorul parintelui sau.",
    keyTakeaway: "CascadeType.REMOVE sterge copiii doar cand parintele este sters; orphanRemoval=true sterge copiii si daca sunt deconectati din colectia parintelui."
  },
  {
    id: "spring-110",
    category: 'SPRING',
    difficulty: "USOR",
    title: "FetchType.LAZY vs FetchType.EAGER in JPA",
    question: "Care este diferenta dintre FetchType.LAZY si FetchType.EAGER si care sunt valorile implicite pentru fiecare relatie?",
    answer: "1. FetchType.EAGER (Incarcare Imediata):\\n   - Datele entitatii asociate sunt incarcate automat din baza de date IMEDIAT, in acelasi timp cu parintele (prin JOIN sau interogari secundare).\\n   - Este considerat un ANTI-PATTERN periculos daca este folosit pe colectii (duce la problema N+1 si incarcarea intregii baze de date in memorie!).\\n\\n2. FetchType.LAZY (Incarcare la Cerere):\\n   - Datele asociate NU sunt incarcate din baza de date initial; Hibernate pune un PROXY gol in loc.\\n   - Interogarea SQL este executata doar in momentul in care apelezi efectiv o metoda pe acel obiect (ex: user.getOrders().size()).\\n\\n3. Valorile Implicite (Defaults in standardul JPA - Important la interviu!):\\n   - Relatiile terminate in \"ToOne\" (@ManyToOne, @OneToOne): sunt EAGER in mod implicit! TREBUIE setate manual pe LAZY: (fetch = FetchType.LAZY).\\n   - Relatiile terminate in \"ToMany\" (@OneToMany, @ManyToMany): sunt LAZY in mod implicit.",
    codeSnippet: `@Entity
public class Order {
    // ATENTIE: @ManyToOne este implicit EAGER! Seteaza-l mereu LAZY:
    @ManyToOne(fetch = FetchType.LAZY)
    private Customer customer;

    // @OneToMany este implicit LAZY (bun):
    @OneToMany(mappedBy = "order")
    private List<OrderItem> items;
}`,
    interviewTrap: "Nu uita ca @ManyToOne este EAGER default! Multi juniori pica la interviu crezand ca toate relatiile sunt LAZY in mod implicit.",
    keyTakeaway: "Relatiile \"ToOne\" sunt implicit EAGER (si trebuie trecute pe LAZY); relatiile \"ToMany\" sunt implicit LAZY."
  },
  {
    id: "spring-111",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Primul nivel de Cache (First-Level Cache / Persistence Context) in Hibernate",
    question: "Ce este First-Level Cache in Hibernate, cand este activ si cum optimizeaza apelurile repetate findById()?",
    answer: "1. Ce este First-Level Cache (L1 Cache):\\n   - Este cache-ul intern asociat obligatoriu fiecarui Persistence Context (EntityManager / Sesiune Hibernate).\\n   - Este ACTIV AUTOMAT intotdeauna (nu poate fi dezactivat).\\n   - Scopul sau este de a asigura ca pentru aceeasi cheie primara (ID) in cadrul aceleiasi tranzactii exista o SINGURA instanta de obiect Java pe Heap (Repeatable Read la nivel de entitati).\\n\\n2. Cum optimizeaza interogarile:\\n   - Daca apelezi userRepo.findById(1L) de 3 ori in interiorul aceleiasi metode @Transactional:\\n   - Hibernate va rula interogarea SQL SELECT pe baza de date o SINGURA DATA la primul apel.\\n   - Urmatoarele doua apeluri findById(1L) vor returna instantaneu referinta din memoria RAM din First-Level Cache, FARA a mai trimite niciun pachet pe retea catre baza de date!",
    codeSnippet: `@Transactional
public void processUser() {
    User u1 = userRepo.findById(1L).get(); // Emite SQL SELECT in DB!
    User u2 = userRepo.findById(1L).get(); // ZERO SQL! Returnat direct din L1 Cache.

    System.out.println(u1 == u2); // true! Este EXACT aceeasi referinta de obiect!
}`,
    interviewTrap: "First-Level Cache traieste doar pe durata tranzactiei/sesiunii curente. Cand metoda @Transactional se termina, L1 cache-ul este distrus.",
    keyTakeaway: "First-Level Cache este legat de EntityManager si returneaza instantele deja citite fara a mai rula interogari SQL in aceeasi tranzactie."
  },
  {
    id: "spring-112",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Hibernate Dirty Checking: De ce nu trebuie sa apelezi save()",
    question: "Ce este mecanismul de Dirty Checking in Hibernate si de ce apelul repository.save() este redundant intr-o metoda @Transactional?",
    answer: "1. Cum functioneaza Dirty Checking:\\n   - Cand o entitate este incarcata din baza de date intr-un context tranzactional (stare MANAGED), Hibernate stocheaza un snapshot (o copie fidela a starii initiale) in First-Level Cache.\\n   - La sfarsitul tranzactiei (inainte de commit), Hibernate ruleaza faza de FLUSH: compara starea curenta a campurilor obiectului cu snapshot-ul initial.\\n   - Daca detecteaza ca oricare camp a fost modificat (este \"murdar\" / dirty), genereaza si executa AUTOMAT interogarea SQL UPDATE corespunzatoare in baza de date!\\n\\n2. De ce apelul repository.save(entity) este redundant:\\n   - Daca entitatea este deja Managed, apelul save() nu aduce niciun beneficiu, deoarece Hibernate oricum va face update-ul automat gratie Dirty Checking.\\n   - Apelul save() este util doar pentru entitati noi (Transient) sau entitati detasate (Detached).",
    codeSnippet: `@Transactional
public void updateUserEmail(Long id, String newEmail) {
    User user = userRepo.findById(id).orElseThrow();
    user.setEmail(newEmail); // Modificam starea obiectului Managed

    // userRepo.save(user); // REDUNDANT si INUTIL!
    // Hibernate va genera automat SQL UPDATE la commit-ul tranzactiei!
}`,
    interviewTrap: "Daca metoda NU este adnotata cu @Transactional, entitatea devine Detached dupa findById, iar Dirty Checking NU va rula automat fara save()!",
    keyTakeaway: "Dirty Checking compara starea entitatilor Managed la commit si emite automat SQL UPDATE pentru orice camp modificat, facand save() redundant."
  },
  {
    id: "spring-113",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Paginarea in Spring Data JPA: Page vs Slice",
    question: "Care este diferenta critica de performanta dintre Page<T> si Slice<T> cand paginam tabele uriase?",
    answer: "1. Page<T> (Paginare Clasica cu total de pagini):\\n   - Returneaza elementele paginii curente PLUS metadate complete: numarul total de pagini (getTotalPages()) si numarul total de randuri (getTotalElements()).\\n   - COSTUL DE PERFORMANTA: Pentru a afla totalul, Spring Data JPA este obligat sa execute o a DOUA interogare grea: SELECT COUNT(*) FROM table WHERE ...!\\n   - Pe tabele cu milioane de inregistrari, interogarea COUNT(*) devine extrem de lenta si blocheaza baza de date.\\n\\n2. Slice<T> (Paginare Tip \"Infinite Scroll\" / Next Page Only):\\n   - Stie DOAR daca mai exista o pagina urmatoare (hasNext()), dar NU stie si nu calculeaza numarul total de inregistrari.\\n   - Cum functioneaza inteligent: Daca ceri o pagina de 20 de elemente, Spring Data cere din DB 21 de elemente (limit 21). Daca DB returneaza 21, inseamna ca hasNext() = true!\\n   - ELIMINA COMPLET interogarea scumpa SELECT COUNT(*)! Extrem de rapid pentru aplicatii mobile si feed-uri infinite.",
    codeSnippet: `public interface ProductRepository extends JpaRepository<Product, Long> {
    // 1. Executa SELECT + SELECT COUNT(*) (mai lent pe date masive):
    Page<Product> findByCategory(String cat, Pageable pageable);

    // 2. Executa doar SELECT cu limit + 1 (ultra-rapid, fara COUNT!):
    Slice<Product> findByStatus(String status, Pageable pageable);
}`,
    interviewTrap: "Daca ai un feed social sau scroll infinit pe mobil unde nu afisezi butoanele numerice \"1, 2, 3... 100\", foloseste Slice in loc de Page pentru a evita COUNT(*).",
    keyTakeaway: "Page executa un COUNT(*) costisitor pentru totalul de elemente; Slice solicita un element in plus pentru hasNext(), eliminand COUNT(*)."
  },
  {
    id: "spring-114",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Sortarea dinamica cu clasa Sort in Spring Data JPA",
    question: "Cum sortam dinamic rezultatele unui query in Spring Data JPA folosind clasa Sort?",
    answer: "1. Clasa Sort din Spring Data:\\n   - Permite transmiterea directiilor si campurilor de sortare dinamice la apelarea metodelor de Repository.\\n   - Se poate folosi ca parametru direct in metoda: List<User> findAll(Sort sort) sau ca parte a unui obiect Pageable.\\n\\n2. Combinarea mai multor criterii de sortare:\\n   - Sort.by(\"lastName\").ascending().and(Sort.by(\"age\").descending()).\\n   - Sintaxa sigura si fluenta fara injectie SQL.",
    codeSnippet: `// 1. Sortare simpla descrescatoare:
List<User> users1 = userRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

// 2. Sortare compusa:
Sort sort = Sort.by("department").ascending()
                .and(Sort.by("salary").descending());
List<User> users2 = userRepo.findAll(sort);`,
    interviewTrap: "Numele campului transmis catre Sort.by(\"camp\") trebuie sa fie numele campului din clasa Java (camelCase), NU numele coloanei din SQL!",
    keyTakeaway: "Clasa Sort permite ordonarea dinamica a rezultatelor dupa unul sau mai multe campuri prin directiile ASC si DESC."
  },
  {
    id: "spring-115",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Adnotarea @Modifying si clearAutomatically in Spring Data JPA",
    question: "De ce este obligatorie adnotarea @Modifying pe interogari @Query de UPDATE sau DELETE si ce rol are clearAutomatically?",
    answer: "1. Rolul adnotarii @Modifying:\\n   - In mod implicit, adnotarea @Query presupune ca interogarea este un SELECT.\\n   - Daca scrii o interogare DML de UPDATE sau DELETE, Spring Data JPA cere obligatoriu @Modifying. Fara ea, va arunca InvalidDataAccessApiUsageException la runtime!\\n   - Metoda trebuie sa returneze void sau int (numarul de randuri afectate).\\n\\n2. Problema de sincronizare si rolul lui clearAutomatically = true:\\n   - Cand rulezi un UPDATE direct in DB prin @Query, Hibernate trimite comanda SQL direct pe conexiune, ocolind First-Level Cache-ul din memorie!\\n   - Daca aveai deja entitati incarcate in memorie inainte de acel update, starea lor din RAM va fi DESINCRONIZATA de noua stare din DB.\\n   - clearAutomatically = true goleste automat First-Level Cache-ul (em.clear()) imediat dupa executia comenzii, fortand re-citirea datelor proaspete la urmatoarele interogari.",
    codeSnippet: `public interface UserRepository extends JpaRepository<User, Long> {

    @Modifying(clearAutomatically = true) // Goleste cache-ul L1 dupa executie!
    @Transactional
    @Query("UPDATE User u SET u.status = 'INACTIVE' WHERE u.lastLoginDate < :cutoff")
    int deactivateInactiveUsers(@Param("cutoff") LocalDate cutoff);
}`,
    interviewTrap: "Daca omiti clearAutomatically = true si continui sa folosesti entitatile in aceeasi tranzactie, vei lucra cu date invechite (stale data).",
    keyTakeaway: "@Modifying este obligatorie pentru comenzi @Query de UPDATE/DELETE; clearAutomatically=true previne datele desincronizate in First-Level Cache."
  },
  {
    id: "spring-116",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Spring Data JPA Projections: Interfete vs Records",
    question: "Cum folosim Projections in Spring Data JPA pentru a selecta doar cateva coloane din baza de date in loc de intreaga entitate?",
    answer: "1. De ce sa folosim Projections:\\n   - Daca tabela ta are 30 de coloane si un ecran din aplicatie are nevoie doar de id si name, incarcarea intregii entitati iroseste memorie RAM si transfer de retea.\\n\\n2. Interface-based Projections (Proiectii bazate pe Interfete):\\n   - Definiti o interfata Java cu getteri corespunzatori numelor campurilor (ex: getId(), getName()).\\n   - Spring Data genereaza un Proxy dinamic si selecteaza in SQL DOAR acele coloane specifice!\\n\\n3. DTO / Record Projections (Clase / Java Records):\\n   - Folosesti un Java Record cu un constructor canonic: public record UserSummaryDto(Long id, String name) {}.\\n   - In JPQL folosesti sintaxa \"SELECT new com.example.UserSummaryDto(u.id, u.name) FROM User u\".\\n   - Extrem de performant si tipizat strict.",
    codeSnippet: `// 1. Proiectie bazata pe Interfata:
public interface UserSummaryView {
    Long getId();
    String getUsername();
}

// 2. Proiectie bazata pe Record:
public record UserRecordDto(Long id, String username) {}

public interface UserRepository extends JpaRepository<User, Long> {
    // Interfata:
    List<UserSummaryView> findByRole(String role);

    // Record cu constructor expression:
    @Query("SELECT new com.example.dto.UserRecordDto(u.id, u.username) FROM User u WHERE u.role = :role")
    List<UserRecordDto> findRecordByRole(@Param("role") String role);
}`,
    interviewTrap: "Interface projections pot fi Closed (rapide, selecteaza doar coloanele cerute) sau Open (folosesc @Value cu SpEL, dar incarca toata entitatea in spate).",
    keyTakeaway: "Projections selecteaza doar coloanele necesare din baza de date prin interfete sau Records, economisind memorie si timp CPU."
  },
  {
    id: "spring-117",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Operatiile de baza ale clasei EntityManager",
    question: "Ce fac metodele persist(), merge(), find(), remove() si flush() din interfata EntityManager?",
    answer: "EntityManager este interfata centrala JPA pentru interactiunea cu Persistence Context:\\n\\n1. persist(entity): Face o entitate Transient sa devina MANAGED. Va genera SQL INSERT la flush/commit.\\n2. merge(entity): Copiaza starea unei entitati Detached intr-o instanta Managed returnata. Daca nu exista in DB, va genera INSERT, altfel UPDATE.\\n3. find(Class, id): Cauta entitatea dupa cheia primara. Daca este deja in L1 Cache, o returneaza din RAM, altfel executa SQL SELECT.\\n4. remove(entity): Marcheaza o entitate Managed pentru stergere. Va genera SQL DELETE la flush/commit.\\n5. flush(): Sincronizeaza IMEDIAT toate modificarile din memorie cu baza de date (trimite SQL INSERT/UPDATE/DELETE pe fir), dar NU face commit tranzactiei!",
    codeSnippet: `@PersistenceContext
private EntityManager em;

public void demo() {
    User u = new User("Ana");
    em.persist(u); // Managed

    em.flush(); // Trimite SQL pe baza de date acum!

    em.detach(u); // Devine Detached
    u.setName("Maria");

    User managed = em.merge(u); // Reatasat ca Managed cu noua stare!
}`,
    interviewTrap: "Metoda merge(u) returneaza o NOUA instanta managed! Instanta originala \"u\" transmisa ca parametru ramane in continuare detasata.",
    keyTakeaway: "persist adauga in sesiune, merge reataseaza entitati detasate, find cauta, remove sterge, iar flush sincronizeaza modificarile cu baza de date."
  },
  {
    id: "spring-118",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "entityManager.find() vs getReference() (Proxy Lazy)",
    question: "Care este diferenta dintre entityManager.find() si entityManager.getReference() (sau getReferenceById in Spring Data)?",
    answer: "1. entityManager.find(Class, id):\\n   - Cauta entitatea si, daca nu este in cache, executa IMEDIAT un query SQL SELECT pe baza de date.\\n   - Daca randul nu exista in DB, returneaza null.\\n\\n2. entityManager.getReference(Class, id) (echivalentul getReferenceById() din Spring Data JPA):\\n   - NU EXECUTA NICIUN SQL SELECT la apelare!\\n   - Returneaza un PROXY gol (o instanta surogat) care are doar campul ID populat.\\n   - SQL SELECT va fi executat doar in momentul in care incerci sa accesezi oricare alt camp non-ID (ex: proxy.getName()).\\n\\n3. Cand este util getReference (Optimizare de performanta majora!):\\n   - Cand vrei sa asociezi o entitate copil de un parinte existent (ex: order.setCustomer(customerRef)).\\n   - Nu ai nevoie sa incarci toate datele clientului din DB doar pentru a-i pune ID-ul ca Foreign Key in tabela de comenzi!",
    codeSnippet: `// Optimizare: Asociere parinte fara query SELECT inutil!
Customer customerRef = customerRepo.getReferenceById(customerId); // ZERO SQL SELECT!

Order order = new Order();
order.setCustomer(customerRef); // Seteaza direct customer_id
orderRepo.save(order); // Un singur SQL INSERT Order!`,
    interviewTrap: "Daca apelezi getReferenceById() si entitatea nu exista in DB, in momentul in care incerci sa-i accesezi un camp vei primi EntityNotFoundException!",
    keyTakeaway: "find() executa SQL SELECT imediat; getReferenceById() returneaza un proxy lazy fara SQL, ideal pentru setarea de foreign keys."
  },
  {
    id: "spring-119",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Auditing automat al entitatilor: @CreatedDate, @LastModifiedDate",
    question: "Cum activezi si configurezi auditarea automata a datelor de creare si modificare cu Spring Data JPA Auditing?",
    answer: "1. Ce rezolva Auditing-ul automat:\\n   - Elimina necesitatea de a seta manual created_at si updated_at in fiecare metoda de salvare.\\n   - Spring Data JPA populeaza automat data crearii, data ultimei modificari si utilizatorul care a facut actiunea.\\n\\n2. Pasi de activare:\\n   - Pasul 1: Adauga adnotarea @EnableJpaAuditing pe clasa principala sau de configurare.\\n   - Pasul 2: Adauga adnotarea @EntityListeners(AuditingEntityListener.class) pe entitate (sau pe o clasa de baza @MappedSuperclass).\\n   - Pasul 3: Adnoteaza campurile cu @CreatedDate, @LastModifiedDate, @CreatedBy, @LastModifiedBy.",
    codeSnippet: `// 1. Activare in config:
@Configuration
@EnableJpaAuditing
public class JpaConfig {}

// 2. Clasa de baza pentru toate entitatile:
@MappedSuperclass
@EntityListeners(AuditingEntityListener.class)
public abstract class BaseAuditableEntity {

    @CreatedDate
    @Column(updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}`,
    interviewTrap: "Campul @CreatedDate trebuie marcat cu @Column(updatable = false) pentru a preveni suprascrierea lui la operatiuni ulterioare de UPDATE.",
    keyTakeaway: "@EnableJpaAuditing impreuna cu AuditingEntityListener completeaza automat timestamp-urile @CreatedDate si @LastModifiedDate la salvare."
  },
  {
    id: "spring-120",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Interogari Dinamice cu Spring Data JPA Specification",
    question: "Ce este interfata Specification si cum permite construirea de filtre dinamice complexe cu CriteriaBuilder?",
    answer: "1. Ce problema rezolva:\\n   - Cand ai un formular de filtrare cu 10 campuri optionale (nume, status, pretMin, pretMax, categorie etc.), combinatiile posibile sunt uriase (nu poti scrie 100 de metode findBy...).\\n\\n2. Ce este Specification<T>:\\n   - O interfata din Spring Data bazata pe JPA Criteria API.\\n   - Are metoda Predicate toPredicate(Root<T> root, CriteriaQuery<?> query, CriteriaBuilder cb).\\n   - Permite compunerea de filtre dinamice prin operatori logici: spec1.and(spec2).or(spec3).\\n\\n3. Repository-ul tinta:\\n   - Trebuie sa extinda interfata JpaSpecificationExecutor<T>.",
    codeSnippet: `public class ProductSpecs {
    public static Specification<Product> hasCategory(String cat) {
        return (root, query, cb) -> cat == null ? null : cb.equal(root.get("category"), cat);
    }

    public static Specification<Product> priceBetween(Double min, Double max) {
        return (root, query, cb) -> {
            if (min == null && max == null) return null;
            return cb.between(root.get("price"), min, max);
        };
    }
}

// Utilizare eleganta:
Specification<Product> spec = Specification.where(ProductSpecs.hasCategory("IT"))
                                          .and(ProductSpecs.priceBetween(100.0, 500.0));
List<Product> products = productRepo.findAll(spec);`,
    interviewTrap: "Daca o conditie returneaza null in Predicate, Spring Data o ignora automat din clauza WHERE, facand compunerea parametrilor optionali foarte naturala.",
    keyTakeaway: "Specification permite crearea de filtre dinamice flexibile si sigure la runtime folosind JPA CriteriaBuilder."
  },
  {
    id: "spring-121",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Soft Delete in Spring Data JPA",
    question: "Ce este pattern-ul Soft Delete si cum se implementeaza in Hibernate 6 cu @SQLDelete si @SQLRestriction?",
    answer: "1. Ce este Soft Delete:\\n   - O tehnica prin care inregistrarile din baza de date NU sunt sterse fizic la executia unui DELETE (pentru audit, conformitate legala sau recuperare accidentala).\\n   - Se foloseste o coloana de flag: deleted = true (sau deleted_at TIMESTAMP).\\n\\n2. Implementarea moderna in Hibernate 6 / Spring Boot 3:\\n   - @SQLDelete(sql = \"UPDATE products SET deleted = true WHERE id = ?\"): suprascrie comanda de DELETE generata de Hibernate cu o comanda de UPDATE.\\n   - @SQLRestriction(\"deleted = false\"): adauga automat clauza WHERE deleted = false la TOATE interogarile de citire (SELECT) pe acea entitate (inlocuieste vechiul @Where din Hibernate 5).",
    codeSnippet: `@Entity
@Table(name = "products")
@SQLDelete(sql = "UPDATE products SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false") // Hibernate 6: filtreaza automat inregistrarile sterse la orice SELECT!
public class Product {
    @Id private Long id;
    private String name;

    private boolean deleted = false;
}`,
    interviewTrap: "In Hibernate 6 (Spring Boot 3), adnotarea @Where a fost depreciata in favoarea adnotarii @SQLRestriction.",
    keyTakeaway: "Soft delete pastreaza datele in DB; in Spring Boot 3 se implementeaza prin @SQLDelete si @SQLRestriction."
  },
  {
    id: "spring-122",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Proprietatile de conexiune DataSource in Spring Boot",
    question: "Care sunt cele 4 proprietati standard esentiale pentru configurarea conexiunii la baza de date?",
    answer: "In application.yml sau application.properties:\\n\\n1. spring.datasource.url: URL-ul JDBC al bazei de date (ex: jdbc:postgresql://localhost:5432/mydb sau jdbc:mysql://localhost:3306/mydb).\\n2. spring.datasource.username: Numele de utilizator al bazei de date (ex: postgres).\\n3. spring.datasource.password: Parola utilizatorului.\\n4. spring.datasource.driver-class-name: Numele complet al clasei de driver JDBC (ex: org.postgresql.Driver). In Spring Boot modern este optionala, deoarece Spring o deduce automat din URL-ul JDBC!",
    codeSnippet: `# In application.yml:
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/ats_db
    username: ats_user
    password: my_secret_password
    driver-class-name: org.postgresql.Driver`,
    interviewTrap: "Daca pui dependenta de PostgreSQL in pom.xml dar nu configurezi URL-ul si parola, Spring Boot va incerca sa caute o baza in-memory (H2) si va arunca eroare daca nu o gaseste.",
    keyTakeaway: "Cele 4 proprietati de baza sunt url, username, password si driver-class-name."
  },
  {
    id: "spring-123",
    category: 'SPRING',
    difficulty: "USOR",
    title: "spring.jpa.hibernate.ddl-auto: Optiuni si Riscuri",
    question: "Ce fac optiunile validate, update, create, create-drop si none pentru ddl-auto si care este riscul major?",
    answer: "Proprietatea controleaza modul in care Hibernate interactioneaza cu schema bazei de date la startup:\\n\\n1. none: Nu face nimic (default in baze externe de productie).\\n2. validate: Valideaza doar daca tabelele si coloanele din DB corespund cu entitatile Java. Daca exista diferente, aplicatia refuza sa porneasca! (Sigura pentru productie).\\n3. update: Modifica schema bazei de date pentru a reflecta entitatile (adauga tabele sau coloane noi). ATENTIE: NU sterge niciodata coloane vechi nefolosite!\\n4. create: Sterge tabelele existente la pornire si le creeaza de la zero (PIERDERE DE DATE!).\\n5. create-drop: Creeaza schema la pornire si o STERGE COMPLET la oprirea aplicatiei (ideal pentru teste cu H2 in-memory).",
    codeSnippet: `# Configurare recomandata pentru dezvoltare/teste:
# spring.jpa.hibernate.ddl-auto: update

# Configurare obligatorie pentru PRODUCTIE:
spring:
  jpa:
    hibernate:
      ddl-auto: validate # sau none`,
    interviewTrap: "Daca setezi din greseala ddl-auto: create in mediul de productie, la primul restart al aplicatiei TOATE DATELE CLIENTILOR VOR FI STERSE IREVERSIBIL!",
    keyTakeaway: "validate doar verifica schema; create/create-drop sterg datele; in productie se foloseste exclusiv validate sau none impreuna cu unelte de migrare."
  },
  {
    id: "spring-124",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "De ce ddl-auto=update este interzis in productie si migrarile Flyway",
    question: "De ce ddl-auto=update este interzis in mediul enterprise si de ce se folosesc instrumente precum Flyway sau Liquibase?",
    answer: "1. De ce ddl-auto=update este periculos in productie:\\n   - Nu sterge coloane sau indecsi vechi (schema devine incarcata cu coloane abandonate).\\n   - Nu stie sa migreze date existente (daca redenumesti \"name\" in \"first_name\" si \"last_name\", creaza coloane noi goale si datele vechi raman blocate in coloana veche).\\n   - Lipsa controlului de versiune (Version Control): Nu ai un istoric al schimbarilor de schema si nu poti face rollback controlat.\\n\\n2. Solutia: Instrumente de Database Migration (Flyway / Liquibase):\\n   - Trateaza schema bazei de date exact ca pe codul sursa (Versioned SQL scripts: V1__init.sql, V2__add_index.sql).\\n   - La startup, Flyway verifica tabela de audit flyway_schema_history si executa secvential doar scripturile SQL noi, garantand consistenta absoluta intre dev, test si prod.",
    codeSnippet: `<!-- Dependinta Flyway in pom.xml: -->
<dependency>
    <groupId>org.flywaydb</groupId>
    <artifactId>flyway-core</artifactId>
</dependency>
<!-- Scripturi plasate in: src/main/resources/db/migration/V1__init.sql -->`,
    interviewTrap: "Odata ce un script V1__init.sql a fost executat pe un server, continutul sau nu mai poate fi modificat! Orice schimbare noua necesita un script nou V2__...sql.",
    keyTakeaway: "Flyway ofera migrare versionata si determinista a bazei de date, inlocuind impredictibilul ddl-auto=update in productie."
  },
  {
    id: "spring-125",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Connection Pooling cu HikariCP in Spring Boot",
    question: "De ce este HikariCP pool-ul implicit in Spring Boot si cum configuram maximum-pool-size?",
    answer: "1. De ce HikariCP este lider de industrie:\\n   - Este considerat cel mai rapid, usor si stabil Connection Pool din intreg ecosistemul Java (optimizari de bytecode la nivel de microsecunde).\\n   - Vine inclus ca default in Spring Boot din versiunea 2.0.\\n\\n2. Proprietati cheie de configurare:\\n   - spring.datasource.hikari.maximum-pool-size: numarul maxim de conexiuni fizice concomitente (default 10).\\n   - spring.datasource.hikari.minimum-idle: numarul minim de conexiuni mentinute deschise in repaus.\\n   - spring.datasource.hikari.connection-timeout: cat timp asteapta un thread sa primeasca o conexiune libera inainte de a arunca SQLTransientConnectionException (default 30.000ms / 30s).\\n   - spring.datasource.hikari.idle-timeout si max-lifetime.",
    codeSnippet: `spring:
  datasource:
    hikari:
      maximum-pool-size: 15
      minimum-idle: 5
      connection-timeout: 20000 # 20 secunde
      max-lifetime: 1800000     # 30 minute`,
    interviewTrap: "O eroare frecventa a incepatorilor este setarea unui pool urias (ex: 500 conexiuni). In realitate, procesoarele si discurile DB ruleaza optim cu pool-uri mici (10-30 conexiuni), formula recomandata fiind: (CPU_cores * 2) + disk_count.",
    keyTakeaway: "HikariCP mentine conexiuni rapide pre-deschise; maximum-pool-size limiteaza conexiunile pentru a proteja serverul de baze de date."
  },
  {
    id: "spring-126",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Tranzactii declarative cu @Transactional si Proxy AOP",
    question: "Cum functioneaza tranzactiile declarative @Transactional sub capota folosind Spring AOP?",
    answer: "1. Mecanismul intern (TransactionInterceptor pe Proxy):\\n   - Cand marchezi o metoda sau o clasa cu @Transactional, Spring nu modifica codul tau direct, ci creeaza un PROXY (CGLIB) peste bean-ul respectiv.\\n\\n2. Pasii parcursi la fiecare apel de metoda:\\n   1. Proxy-ul intercepteaza apelul.\\n   2. TransactionManager deschide o conexiune la baza de date si seteaza auto-commit pe false (connection.setAutoCommit(false)).\\n   3. Proxy-ul invoca metoda ta de business pe obiectul real.\\n   4. Daca metoda se termina cu succes: Proxy-ul apeleaza connection.commit().\\n   5. Daca metoda arunca o exceptie RuntimeException: Proxy-ul apeleaza connection.rollback() si inchide conexiunea.",
    codeSnippet: `@Service
public class BankService {

    // Proxy-ul gestioneaza automat begin(), commit() si rollback()!
    @Transactional
    public void transfer(Long fromId, Long toId, BigDecimal amount) {
        accountRepo.withdraw(fromId, amount);
        accountRepo.deposit(toId, amount);
    }
}`,
    interviewTrap: "Daca metoda adnotata cu @Transactional este marcata private, Spring AOP NU o va intercepta, iar tranzactia nu va porni! @Transactional se pune doar pe metode publice.",
    keyTakeaway: "@Transactional foloseste Spring AOP pentru a deschide, confirma (commit) sau anula (rollback) automat tranzactia in jurul metodei."
  },
  {
    id: "spring-127",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Atributul readOnly = true in @Transactional",
    question: "Ce optimizari aduce setarea @Transactional(readOnly = true) pe metodele de interogare (SELECT)?",
    answer: "1. Optimizare majora in Hibernate (Dezactivarea Dirty Checking):\\n   - Cand readOnly = true este activat, Hibernate seteaza FlushMode pe MANUAL si NU mai creeaza snapshot-uri in memorie pentru obiectele citite!\\n   - Economiseste pana la 50% din memoria Heap si timp CPU la interogari masive, deoarece Hibernate stie sigur ca nu trebuie sa verifice modificari (dirty checking) la iesirea din metoda.\\n\\n2. Optimizare la nivel de baza de date si conexiune JDBC:\\n   - Driverul JDBC poate trimite comanda SET TRANSACTION READ ONLY catre baza de date.\\n   - Permite rutarea automata a interogarilor catre replici read-only in arhitecturi cu baza de date Master-Replica!",
    codeSnippet: `@Service
@Transactional(readOnly = true) // Toate metodele de citire sunt optimizate implicit!
public class UserService {

    public UserDto findById(Long id) { ... }
    public List<UserDto> findAll() { ... }

    @Transactional // Suprascriem punctual pe metodele de scriere!
    public UserDto create(CreateUserDto dto) { ... }
}`,
    interviewTrap: "Este o buna practica enterprise sa adnotezi intreaga clasa de Service cu @Transactional(readOnly = true) la nivel de clasa si sa adaugi @Transactional simplu doar pe metodele care scriu.",
    keyTakeaway: "readOnly = true dezactiveaza dirty checking in Hibernate si permite rutarea interogarilor catre replici read-only."
  },
  {
    id: "spring-128",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "rollbackFor = Exception.class: Cand este obligatoriu?",
    question: "De ce este esential sa adaugi rollbackFor = Exception.class cand metoda ta interactioneaza cu checked exceptions?",
    answer: "1. Regula standard a Spring Framework:\\n   - In mod implicit, Spring face rollback DOAR daca exceptia aruncata este o RuntimeException sau o subclasa a acesteia.\\n   - Daca metoda ta declara si arunca o Exceptie Verificata (Checked Exception: IOException, ParseException, Exception custom), tranzactia NU VA FACE ROLLBACK! Toate operatiunile executate pana la acea linie vor fi salvate (commit) in baza de date, lasand sistemul intr-o stare corupta si incompleta!\\n\\n2. Solutia standard:\\n   - @Transactional(rollbackFor = Exception.class) forteaza rollback la ORICE exceptie, atat checked cat si unchecked.",
    codeSnippet: `// GRESIT: Daca fisierul pica, banii raman retrasi in DB!
@Transactional
public void payAndGenerateInvoice() throws IOException {
    accountRepo.withdraw(amount);
    fileService.writePdf(); // Daca arunca IOException, face COMMIT la retragere!
}

// CORECT:
@Transactional(rollbackFor = Exception.class)
public void safePayAndGenerateInvoice() throws IOException {
    accountRepo.withdraw(amount);
    fileService.writePdf(); // Face ROLLBACK corect la IOException!
}`,
    interviewTrap: "Daca prinzi exceptia intr-un try-catch in interiorul metodei si nu o re-arunci, Spring nu va sti niciodata ca a aparut o eroare si va face COMMIT.",
    keyTakeaway: "rollbackFor = Exception.class garanteaza ca rollback-ul se declanseaza si pentru Checked Exceptions, prevenind coruperea datelor."
  },
  {
    id: "spring-129",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Niveluri de Izolare a Tranzactiilor (Transaction Isolation Levels)",
    question: "Ce fenomene anormale de concurenta (Dirty Read, Non-Repeatable Read, Phantom Read) previn cele 4 niveluri de izolare?",
    answer: "Nivelul de izolare defineste cat de mult este protejata o tranzactie de modificarile facute simultan de alte tranzactii concurente:\\n\\n1. READ_UNCOMMITTED (Cel mai slab):\\n   - Permite \"Dirty Read\" (o tranzactie poate citi date modificate de alta tranzactie care inca nu a facut commit si poate face rollback ulterior!).\\n\\n2. READ_COMMITTED (Implicit in PostgreSQL, Oracle, SQL Server):\\n   - Previne Dirty Reads. Poti citi doar date confirmate (committed).\\n   - Permite insa \"Non-Repeatable Read\" (daca citesti acelasi rand de doua ori in aceeasi tranzactie, valorile pot fi diferite daca altcineva a facut UPDATE intre timp).\\n\\n3. REPEATABLE_READ (Implicit in MySQL InnoDB):\\n   - Previne Dirty Read si Non-Repeatable Read (garanteaza ca recitirea aceluiasi rand returneaza aceleasi valori).\\n   - Poate permite \"Phantom Read\" (aparitia de randuri noi adaugate de alte tranzactii la re-executarea unei interogari cu WHERE).",
    codeSnippet: `@Transactional(isolation = Isolation.REPEATABLE_READ)
public void generateFinancialReport() {
    // Citiri garantat consistente in timpul generarii raportului
}`,
    interviewTrap: "SERIALIZABLE este cel mai strict nivel (executa tranzactiile ca si cum ar fi secventiale), dar reduce dramatic performanta si throughput-ul prin blocari masive.",
    keyTakeaway: "Nivelurile de izolare (Read Committed, Repeatable Read, Serializable) balanseaza viteza de executie cu protectia impotriva anomaliilor concurente."
  },
  {
    id: "spring-130",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Tranzactii programatice cu TransactionTemplate",
    question: "Cand este recomandat sa folosim TransactionTemplate in loc de adnotarea @Transactional?",
    answer: "1. Limitarile adnotarii declarative @Transactional:\\n   - Cuprinde INTREAGA metoda in tranzactie. Daca metoda face operatiuni I/O lente (apel HTTP extern catre Stripe, trimitere email, parsare fisier mare), conexiunea la baza de date este tinuta blocata inutil pe toata durata apelului de retea, epuizand pool-ul HikariCP!\\n   - Nu functioneaza la apeluri interne din aceeasi clasa (self-invocation).\\n\\n2. Ce aduce TransactionTemplate:\\n   - Control granular si programatic: Deschide tranzactia DOAR pentru cele 3 linii de cod care ating baza de date, eliberand conexiunea imediat inainte de apelurile externe de retea!\\n   - Metoda execute(status -> { ... }) gestioneaza automat commit si rollback in caz de exceptie.",
    codeSnippet: `@Service
public class OrderService {
    private final TransactionTemplate transactionTemplate;
    private final PaymentClient paymentClient;

    public OrderService(TransactionTemplate tt, PaymentClient pc) {
        this.transactionTemplate = tt;
        this.paymentClient = pc;
    }

    public void checkout(OrderDto dto) {
        // 1. Apel extern lent FARA conexiune DB blocata:
        PaymentResult res = paymentClient.chargeCard(dto.card());

        // 2. Tranzactie deschisa strict pentru salvarea in DB:
        transactionTemplate.execute(status -> {
            orderRepo.save(new Order(res));
            return null;
        });
    }
}`,
    interviewTrap: "Nu tine conexiuni de baza de date deschise in timp ce astepti raspunsuri de la servicii web externe; foloseste TransactionTemplate pentru a izola scrierile.",
    keyTakeaway: "TransactionTemplate ofera control fin la nivel de bloc de cod, evitand blocarea conexiunilor DB in timpul operatiilor lente de retea."
  },
  {
    id: "spring-131",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Spring Security: Autentificare vs Autorizare",
    question: "Care este diferenta fundamentala dintre Autentificare (Authentication) si Autorizare (Authorization)?",
    answer: "1. Autentificare (Authentication - \"Cine esti?\"):\\n   - Procesul de verificare a identitatii unui utilizator (validarea credentialelor: username + parola, token JWT, certificat SSL, cod OTP).\\n   - Raspunde la intrebarea: \"Este acest utilizator cel care pretinde ca este?\".\\n   - Daca esueaza, serverul returneaza HTTP 401 Unauthorized.\\n\\n2. Autorizare (Authorization - \"Ce ai voie sa faci?\"):\\n   - Procesul de verificare a permisiunilor si rolurilor unui utilizator deja autentificat pentru accesarea unei anumite resurse sau executarea unei metode.\\n   - Raspunde la intrebarea: \"Are utilizatorul X dreptul de a sterge acest cont?\".\\n   - Daca esueaza, serverul returneaza HTTP 403 Forbidden.\\n\\n3. Regula de ordine:\\n   - Autentificarea are loc INTOTDEAUNA inainte de Autorizare.",
    codeSnippet: `// 401 Unauthorized: Nu esti autentificat (lipseste token-ul sau parola e gresita)
// 403 Forbidden: Esti autentificat (esti user normal), dar nu ai rolul de ADMIN cerut!`,
    interviewTrap: "Codul HTTP 401 se numeste \"Unauthorized\", dar conform definitiei tehnice standard reprezinta de fapt lipsa AUTENTIFICARII (Unauthenticated).",
    keyTakeaway: "Autentificarea verifica identitatea (401 Unauthorized); Autorizarea verifica permisiunile si rolurile (403 Forbidden)."
  },
  {
    id: "spring-132",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este SecurityContextHolder si cum extragi utilizatorul curent?",
    question: "Cum stocheaza Spring Security datele utilizatorului conectat si cum le accesezi dintr-un serviciu?",
    answer: "1. Ce este SecurityContextHolder:\\n   - Punctul central in care Spring Security stocheaza detaliile despre utilizatorul curent autentificat.\\n   - Foloseste sub capota o strategie ThreadLocal (ThreadLocalSecurityContextHolderStrategy), ceea ce inseamna ca datele de securitate sunt legate de firul de executie curent care proceseaza cererea HTTP.\\n\\n2. Ierarhia de obiecte:\\n   - SecurityContextHolder -> detine SecurityContext -> detine Authentication -> detine Principal (utilizatorul), Credentials si Authorities (rolurile).\\n\\n3. Cum se extrage in cod:\\n   - Authentication auth = SecurityContextHolder.getContext().getAuthentication();\\n   - String username = auth.getName();.",
    codeSnippet: `@Service
public class ProfileService {

    public String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new AccessDeniedException("Utilizator neautentificat");
        }
        return auth.getName();
    }
}`,
    interviewTrap: "Daca metoda ta ruleaza pe un alt thread asincron (@Async), SecurityContext nu va fi propagat automat decat daca configurezi SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL).",
    keyTakeaway: "SecurityContextHolder pastreaza datele de autentificare pe thread-ul curent prin ThreadLocal."
  },
  {
    id: "spring-133",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Interfata UserDetailsService si UserDetails",
    question: "Ce rol are interfata UserDetailsService si ce returneaza metoda loadUserByUsername?",
    answer: "1. UserDetailsService:\\n   - O interfata de baza din Spring Security folosita pentru regasirea informatiilor de identitate ale unui utilizator dintr-o sursa de date (baza de date, LDAP, API extern).\\n   - Are o singura metoda: UserDetails loadUserByUsername(String username) throws UsernameNotFoundException.\\n\\n2. Interfata UserDetails:\\n   - Reprezinta profilul de securitate al utilizatorului inteles de Spring Security.\\n   - Metode obligatorii: getUsername(), getPassword(), getAuthorities() (roluri/permisiuni), isAccountNonExpired(), isAccountNonLocked(), isEnabled().",
    codeSnippet: `@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepo;
    public CustomUserDetailsService(UserRepository repo) { this.userRepo = repo; }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepo.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("User negasit: " + email));

        return org.springframework.security.core.userdetails.User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .roles(user.getRole()) // ex: "USER" -> devine "ROLE_USER"
            .build();
    }
}`,
    interviewTrap: "UserDetailsService doar CITESTE datele de utilizator pentru comparatie; verificarea efectiva a parolei transmise se face automat de catre DaoAuthenticationProvider.",
    keyTakeaway: "UserDetailsService extrage profilul UserDetails (username, parola criptata, roluri) din baza de date pentru validare."
  },
  {
    id: "spring-134",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Criptarea parolelor cu BCryptPasswordEncoder",
    question: "De ce este strict interzisa stocarea parolelor in text clar si de ce folosim BCrypt in Spring Security?",
    answer: "1. De ce NU salvam parole in text clar sau hash-uri simple (MD5/SHA-256):\\n   - Daca baza de date este expusa, parolele in clar compromit imediat conturile.\\n   - Algoritmii vechi precum MD5 sau SHA-256 sunt extrem de rapizi: atacatorii pot sparge miliarde de combinatii pe secunda folosind placi grafice (GPU) si tabele curcubeu (Rainbow Tables)!\\n\\n2. Ce face BCrypt (BCryptPasswordEncoder):\\n   - Este o functie lenta de hashing conceputa special pentru parole (Slow Hashing Function).\\n   - Adauga automat o \"sare\" criptografica aleatorie (Salt) de 16 bytes la fiecare parola: doua parole identice \"password123\" vor genera hash-uri complet diferite in baza de date!\\n   - Include un factor de cost reglabil (work factor / strength, default 10): poti mari numarul de iteratii pe masura ce procesoarele devin mai rapide.",
    codeSnippet: `@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Standard de industrie
    }
}

// Utilizare:
String hash = passwordEncoder.encode("secretPassword");
// Verificare la login:
boolean matches = passwordEncoder.matches("secretPassword", hash); // true`,
    interviewTrap: "Nu apela niciodata encode() manual la login! Se foloseste metoda matches(rawPassword, encodedPassword) care stie sa extraga salt-ul din hash-ul stocat.",
    keyTakeaway: "BCryptPasswordEncoder adauga automat salt aleatoriu si este rezistent la atacuri brute-force si rainbow tables."
  },
  {
    id: "spring-135",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Configurarea moderna a SecurityFilterChain in Spring Security 6",
    question: "Cum arata configuratia standard completa a unui SecurityFilterChain in Spring Boot 3?",
    answer: "Configuratia moderna foloseste un @Bean de tip SecurityFilterChain in care regulile sunt specificate prin expresii lambda concise:\\n\\n1. Dezactivarea protectiei CSRF pentru API-uri REST stateless: csrf.disable().\\n2. Sesiune Stateless: sessionCreationPolicy(SessionCreationPolicy.STATELESS).\\n3. Reguli de autorizare cu requestMatchers():\\n   - permitAll() pe rute publice (login, register, swagger, actuator/health).\\n   - hasRole(\"ADMIN\") sau hasAuthority(\"...\") pe rute restrictionate.\\n   - anyRequest().authenticated() pe toate celelalte endpoint-uri.\\n4. Adaugarea filtrului JWT inainte de filtrul de login standard: addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class).",
    codeSnippet: `@Configuration
@EnableWebSecurity
public class WebSecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, JwtAuthFilter jwtFilter) throws Exception {
        return http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
            .build();
    }
}`,
    interviewTrap: "In Spring Security 6, metodele clasice .authorizeRequests() si .antMatchers() sunt complet eliminate; foloseste exclusiv .authorizeHttpRequests() si .requestMatchers().",
    keyTakeaway: "SecurityFilterChain foloseste stilul functional lambda cu requestMatchers(), sesiune stateless si filtre JWT custom."
  },
  {
    id: "spring-136",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "Autentificare Stateless cu JWT si OncePerRequestFilter",
    question: "Cum implementam validarea unui token JWT la fiecare cerere HTTP folosind OncePerRequestFilter?",
    answer: "1. Ce este OncePerRequestFilter:\\n   - O clasa abstracta de baza oferita de Spring care garanteaza ca metoda doFilterInternal() este executata EXACT O SINGURA DATA per cerere HTTP (prevenind apelurile multiple la forward sau dispatch intern).\\n\\n2. Ce face filtrul JWT:\\n   1. Extrage headerul \"Authorization\" din HttpServletRequest.\\n   2. Verifica daca incepe cu prefixul \"Bearer \".\\n   3. Extrage si valideaza semnatura token-ului JWT cu cheia secreta.\\n   4. Extrage username-ul si rolurile din payload-ul token-ului.\\n   5. Construieste un UsernamePasswordAuthenticationToken si il plaseaza in SecurityContextHolder.getContext().setAuthentication(auth).\\n   6. Invoca filterChain.doFilter(request, response) pentru a lasa cererea sa mearga mai departe catre Controller.",
    codeSnippet: `@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isTokenValid(token)) {
                String username = jwtService.extractUsername(token);
                var authorities = jwtService.extractAuthorities(token);

                var authToken = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}`,
    interviewTrap: "Daca token-ul este expirat sau invalid, nu bloca intotdeauna fluxul manual in filtru; lasa filtrul sa continue fara sa seteze autentificarea in SecurityContext, iar AuthorizationFilter din Spring va returna automat 401 Unauthorized.",
    keyTakeaway: "OncePerRequestFilter valideaza token-ul JWT o singura data per request si populeaza SecurityContextHolder cu utilizatorul autentificat."
  },
  {
    id: "spring-137",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Securitate la nivel de metoda cu @PreAuthorize si SpEL",
    question: "Cum activam si utilizam adnotarea @PreAuthorize pentru a securiza metodele de Service in functie de roluri?",
    answer: "1. Activarea securitatii pe metode:\\n   - Se adauga adnotarea @EnableMethodSecurity pe o clasa de configurare (in Spring Security 6 inlocuieste vechiul @EnableGlobalMethodSecurity).\\n\\n2. Adnotarea @PreAuthorize:\\n   - Permite validarea permisiunilor INAINTE ca metoda sa fie executata folosind Spring Expression Language (SpEL).\\n   - Exemple de expresii SpEL:\\n     - @PreAuthorize(\"hasRole('ADMIN')\")\\n     - @PreAuthorize(\"hasAnyRole('ADMIN', 'MANAGER')\")\\n     - @PreAuthorize(\"hasAuthority('SCOPE_write')\")\\n     - Verificare dinamica a proprietarului resursei: @PreAuthorize(\"#username == authentication.name\").",
    codeSnippet: `@Configuration
@EnableMethodSecurity // Activare suport securitate pe metode
public class MethodSecurityConfig {}

@Service
public class OrderService {

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteOrder(Long id) { ... }

    // Utilizatorul poate accesa doar propriile sale comenzi:
    @PreAuthorize("#userId == authentication.name or hasRole('ADMIN')")
    public OrderDto getOrder(String userId, Long orderId) { ... }
}`,
    interviewTrap: "Daca folosesti hasRole('ADMIN'), Spring Security cauta autoritatea 'ROLE_ADMIN'. Daca folosesti hasAuthority('ADMIN'), cauta exact string-ul 'ADMIN' fara prefix.",
    keyTakeaway: "@EnableMethodSecurity activeaza @PreAuthorize, permitand expresii SpEL pentru controlul accesului direct pe metodele de business."
  },
  {
    id: "spring-138",
    category: 'SPRING',
    difficulty: "USOR",
    title: "De ce dezactivam protectia CSRF in REST APIs stateless?",
    question: "Ce este un atac CSRF (Cross-Site Request Forgery) si de ce csrf().disable() este sigur pentru API-uri REST cu JWT?",
    answer: "1. Ce este un atac CSRF:\\n   - Un atac in care un site web malitios convinge browserul unui utilizator sa trimita o cerere HTTP neautorizata catre o aplicatie terta unde utilizatorul este deja autentificat pe baza de Cookie de sesiune (JSESSIONID trimis automat de browser).\\n\\n2. De ce API-urile REST cu JWT sunt IMUNE la CSRF:\\n   - Autentificarea cu token JWT NU se bazeaza pe Cookie-uri automate de sesiune gestionate de browser!\\n   - Token-ul JWT este trimis explicit de aplicatia frontend (React/Mobile) in headerul: Authorization: Bearer <token>.\\n   - Browserele web NU adauga automat headere de Authorization la cereri cross-origin facute de pe alte site-uri!\\n   - Prin urmare, protectia CSRF din Spring este redundanta si poate fi dezactivata in siguranta cu csrf.disable().",
    codeSnippet: `// Dezactivare sigura pentru arhitecturi Stateless JWT:
http.csrf(csrf -> csrf.disable());`,
    interviewTrap: "Daca stochezi token-ul JWT intr-un Cookie de tip HttpOnly trimis automat de browser, protectia CSRF devine din nou necesara (sau trebuie folosit atributul SameSite=Strict)!",
    keyTakeaway: "CSRF se bazeaza pe trimiterea automata a cookie-urilor de browser; API-urile REST cu JWT in headerul Authorization nu sunt vulnerabile la CSRF."
  },
  {
    id: "spring-139",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Roluri (Roles) vs Permisiuni (Authorities) in Spring Security",
    question: "Care este diferenta dintre un Role si o Authority (GrantedAuthority) in Spring Security?",
    answer: "1. In Spring Security, ambele sunt reprezentate de interfata GrantedAuthority, dar difera prin conventia de denumire:\\n\\n2. Rol (Role):\\n   - Reprezinta un grup grosier de permisiuni (ex: \"ADMIN\", \"USER\", \"MODERATOR\").\\n   - Conventie interna: In Spring Security, rolurile AU OBLIGATORIU PREFIXUL \"ROLE_\" (ex: ROLE_ADMIN, ROLE_USER)!\\n   - Metoda hasRole(\"ADMIN\") cauta automat autoritatea cu prefixul \"ROLE_ADMIN\".\\n\\n3. Autoritate / Permisiune (Authority / Privilege):\\n   - Reprezinta o permisiune fina, atomica (ex: \"user:read\", \"order:delete\", \"reports:export\").\\n   - NU are prefix obligatoriu.\\n   - Se verifica cu hasAuthority(\"order:delete\").\\n\\n4. Arhitectura recomandata (RBAC - Role-Based Access Control):\\n   - Un Utilizator are Roluri; fiecare Rol are o lista de Permisiuni fine asociate.",
    codeSnippet: `// GrantedAuthority cu prefix -> Rol:
new SimpleGrantedAuthority("ROLE_ADMIN"); // Verificat cu hasRole("ADMIN")

// GrantedAuthority fara prefix -> Permisiune:
new SimpleGrantedAuthority("order:write"); // Verificat cu hasAuthority("order:write")`,
    interviewTrap: "Daca scrii hasRole(\"ROLE_ADMIN\"), Spring Security va cauta de fapt \"ROLE_ROLE_ADMIN\" si va refuza accesul! In hasRole nu se trece prefixul ROLE_.",
    keyTakeaway: "hasRole(\"ADMIN\") cauta automat prefixul \"ROLE_ADMIN\"; hasAuthority(\"perm\") verifica exact numele autoritatii fara prefix."
  },
  {
    id: "spring-140",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "AuthenticationEntryPoint (401) vs AccessDeniedHandler (403)",
    question: "Cum personalizam raspunsurile de eroare de securitate folosind AuthenticationEntryPoint si AccessDeniedHandler?",
    answer: "In Spring Security, erorile de securitate apar inainte de Controller, deci nu pot fi prinse de un simplu @RestControllerAdvice standard! Se personalizeaza prin doua interfete dedicate:\\n\\n1. AuthenticationEntryPoint:\\n   - Se activeaza cand un utilizator NE-AUTENTIFICAT incearca sa acceseze o resursa protejata.\\n   - Returneaza codul HTTP 401 Unauthorized si un corp JSON explicativ.\\n\\n2. AccessDeniedHandler:\\n   - Se activeaza cand un utilizator ESTE AUTENTIFICAT, dar NU ARE ROLUL SAU PERMISIUNEA necesara (esec de autorizare).\\n   - Returneaza codul HTTP 403 Forbidden si un corp JSON explicativ.\\n\\n3. Inregistrare:\\n   - http.exceptionHandling(e -> e.authenticationEntryPoint(...).accessDeniedHandler(...)).",
    codeSnippet: `@Component
public class CustomAuthEntryPoint implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest req, HttpServletResponse res, AuthenticationException ex) throws IOException {
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
        res.setContentType("application/json");
        res.getWriter().write("{\\"error\\": \\"Autentificare necesara\\"}");
    }
}

@Component
public class CustomAccessDeniedHandler implements AccessDeniedHandler {
    @Override
    public void handle(HttpServletRequest req, HttpServletResponse res, AccessDeniedException ex) throws IOException {
        res.setStatus(HttpServletResponse.SC_FORBIDDEN); // 403
        res.setContentType("application/json");
        res.getWriter().write("{\\"error\\": \\"Acces interzis: permisiuni insuficiente\\"}");
    }
}`,
    interviewTrap: "Daca nu personalizezi aceste doua clase, Spring Security va returna fie o pagina HTML implicita de login, fie un text gol pe 401/403.",
    keyTakeaway: "AuthenticationEntryPoint gestioneaza 401 Unauthorized (lipsa login); AccessDeniedHandler gestioneaza 403 Forbidden (lipsa rol)."
  },
  {
    id: "spring-141",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce este Spring Boot Actuator si ce endpoint-uri ofera?",
    question: "Ce rol are dependenta spring-boot-starter-actuator si care sunt cele mai utilizate endpoint-uri de monitorizare?",
    answer: "1. Ce este Spring Boot Actuator:\\n   - Un modul oficial care adauga capabilitati \"production-ready\" aplicatiei: monitorizare, colectare de metrici, verificare de sanatate (Health Checks) si inspectie interna de configuratie.\\n\\n2. Endpoint-uri standard celebre (prefixate cu /actuator):\\n   - /actuator/health: Afiseaza starea de sanatate (UP/DOWN) a aplicatiei si a dependentelor (baza de date, Redis, disc). Folosit de Kubernetes pentru Liveness si Readiness Probes!\\n   - /actuator/info: Afiseaza informatii despre versiunea aplicatiei, autor, build git.\\n   - /actuator/metrics: Expune metrici de performanta (consum memorie JVM Heap, fire de executie CPU, numar de cereri HTTP).\\n   - /actuator/env: Expune variabilele de mediu si proprietatile incarcate.\\n   - /actuator/loggers: Permite schimbarea nivelului de log (ex: de la INFO la DEBUG) la runtime fara restart!",
    codeSnippet: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>`,
    interviewTrap: "In mod implicit, DOAR endpoint-ul /health este expus public prin web. Toate celelalte endpoint-uri sunt ascunse din motive de securitate.",
    keyTakeaway: "Spring Boot Actuator ofera endpoint-uri pentru monitorizarea starii (/health), metricilor (/metrics) si inspectiei interne in mediul de productie."
  },
  {
    id: "spring-142",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Securizarea endpoint-urilor Spring Boot Actuator",
    question: "Cum controlezi ce endpoint-uri Actuator sunt expuse pe web si cum le securizezi impotriva accesului neautorizat?",
    answer: "1. Configurarea expunerii in application.yml:\\n   - management.endpoints.web.exposure.include: specifica lista explicita de endpoint-uri expuse (ex: health, info).\\n   - NICIODATA nu pune include: \"*\" in productie, deoarece expune parole, conexiuni la DB si heap dump-uri sensibile hackerilor!\\n\\n2. Securizarea prin Spring Security:\\n   - Endpoint-urile /actuator/** (cu exceptia /actuator/health) trebuie protejate obligatoriu cu hasRole(\"ADMIN\") in SecurityFilterChain.\\n\\n3. Separarea portului de management:\\n   - management.server.port=8081: muta Actuator-ul pe un port intern separat, inaccesibil din exterior prin firewall/load balancer.",
    codeSnippet: `# In application.yml:
management:
  server:
    port: 9001 # Port separat de management, blocat de firewall exterior
  endpoints:
    web:
      exposure:
        include: health, info, metrics # Strict ce este necesar!
  endpoint:
    health:
      show-details: when-authorized # Detalii complete doar pentru useri logati`,
    interviewTrap: "Daca expui /actuator/env sau /actuator/heapdump pe internet fara autentificare, aplicatia ta este considerata vulnerabila critic (OWASP Security Risk).",
    keyTakeaway: "Expune strict endpoint-urile necesare (health, info), foloseste un port separat de management si securizeaza accesul cu rol de ADMIN."
  },
  {
    id: "spring-143",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Crearea unui Custom HealthIndicator in Spring Boot",
    question: "Cum implementezi o verificare de sanatate proprie (Health Check) prin interfata HealthIndicator?",
    answer: "1. Ce este HealthIndicator:\\n   - O interfata din Actuator care permite adaugarea de verificari personalizate in endpoint-ul /actuator/health.\\n   - Returneaza un obiect Health care poate fi UP (sanatos) sau DOWN (defect), impreuna cu detalii descriptive.\\n   - Daca oricare indicator din aplicatie returneaza DOWN, intregul status global al aplicatiei devine 503 DOWN, semnaland lui Kubernetes sa reporneasca containerul!\\n\\n2. Cum se implementeaza:\\n   - Creezi o componenta @Component care implementeaza HealthIndicator si suprascrie metoda health().",
    codeSnippet: `@Component
public class ExternalApiHealthIndicator implements HealthIndicator {

    @Override
    public Health health() {
        boolean isApiReachable = checkExternalService();

        if (isApiReachable) {
            return Health.up()
                .withDetail("externalService", "Disponibil")
                .withDetail("responseTimeMs", 45)
                .build();
        }

        return Health.down()
            .withDetail("externalService", "Inaccesibil sau timeout!")
            .build();
    }

    private boolean checkExternalService() { return true; }
}`,
    interviewTrap: "Verificarea din HealthIndicator trebuie sa fie foarte rapida (cu timeout scurt de 1-2 secunde), altfel monitorizarea externa va considera serverul blocat.",
    keyTakeaway: "Implementarea interfetei HealthIndicator adauga verificari personalizate in endpoint-ul /actuator/health, esentiale pentru Kubernetes probes."
  },
  {
    id: "spring-144",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Logging in Spring Boot: SLF4J si Logback",
    question: "De ce folosim SLF4J cu @Slf4j in loc de System.out.println si cum setam nivelurile de logare in application.yml?",
    answer: "1. De ce System.out.println este strict interzis in productie:\\n   - Este sincron si blocant: fiecare apel blocheaza firul de executie si scrie greoi pe consola standard a sistemului de operare.\\n   - Nu contine timestamp, nume de thread, nivel de severitate sau clasa de provenienta.\\n   - Nu poate fi redirectat, filtrat pe nivele sau rotit in fisiere.\\n\\n2. Ce este SLF4J (Simple Logging Facade for Java):\\n   - O interfata abstracta de logare (fatada). Implementarea concreta implicita in Spring Boot este Logback.\\n   - Adnotarea Lombok @Slf4j genereaza automat un logger static final: private static final Logger log = LoggerFactory.getLogger(MyClass.class);\\n\\n3. Nivelurile de logare (in ordine crescatoare):\\n   - TRACE -> DEBUG -> INFO (default) -> WARN -> ERROR.\\n\\n4. Parametrizare eficienta:\\n   - log.info(\"User {} a cumparat produsul {}\", userId, prodId); -> foloseste paranteze {} pentru a evita concatenarea costisitoare de siruri daca logul este dezactivat!",
    codeSnippet: `@Slf4j // Genereaza automat 'log'
@Service
public class OrderService {
    public void process(Long id) {
        log.debug("Incepem procesarea comenzii: {}", id);
        try {
            // ...
            log.info("Comanda {} finalizata cu succes", id);
        } catch (Exception e) {
            log.error("Eroare la procesarea comenzii {}: {}", id, e.getMessage(), e);
        }
    }
}

# In application.yml:
logging:
  level:
    root: INFO
    com.mycompany.app: DEBUG
    org.hibernate.SQL: DEBUG`,
    interviewTrap: "Foloseste intotdeauna sintaxa cu acolade {} (log.debug(\"Data: {}\", data)) in loc de concatenare cu \"+\", pentru a preveni crearea inutila de obiecte String pe Heap.",
    keyTakeaway: "SLF4J cu Logback ofera logging non-blocant, nivele configurabile (DEBUG/INFO/ERROR) si parametrizare eficienta cu acolade {}."
  },
  {
    id: "spring-145",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Noul RestClient din Spring Boot 3.2+ vs RestTemplate",
    question: "Ce este noul RestClient introdus in Spring Boot 3.2 si de ce este succesorul modern al lui RestTemplate?",
    answer: "1. Problema cu RestTemplate:\\n   - A fost clientul HTTP sincron istoric al Spring din Java 5.\\n   - Are peste 30 de metode supraincarcate greoaie (getForObject, exchange, execute) si un design vechi procedural.\\n   - Spring a anuntat oficial ca RestTemplate este in mod de intretinere (maintenance mode) si nu va mai primi noi functionalitati.\\n\\n2. Ce aduce RestClient (Spring Boot 3.2 / Spring 6.1):\\n   - Este clientul HTTP sincron modern, fluent si elegant.\\n   - Ofera aceeasi sintaxa functionala fluenta ca WebClient, dar ruleaza direct pe stack-ul clasic blocant Spring MVC, fara a necesita dependinta grea de WebFlux/Project Reactor!\\n   - Suporta mapare automata de DTO-uri, headere, parametri de cale si gestionare eleganta a erorilor cu onStatus().",
    codeSnippet: `// Creare si utilizare RestClient (Spring Boot 3.2+):
RestClient restClient = RestClient.create("https://api.external.com");

UserDto user = restClient.get()
    .uri("/users/{id}", 42)
    .header("Authorization", "Bearer token123")
    .accept(MediaType.APPLICATION_JSON)
    .retrieve()
    .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
        throw new MyCustomException("Utilizator negasit la partener!");
    })
    .body(UserDto.class);`,
    interviewTrap: "Daca ai aplicatie Spring MVC traditionala in Spring Boot 3.2+, foloseste RestClient! Nu instala tot modulul WebFlux doar pentru a beneficia de sintaxa fluenta a lui WebClient.",
    keyTakeaway: "RestClient este clientul HTTP sincron modern din Spring Boot 3.2+, oferind un Fluent API elegant fara dependenta de WebFlux."
  },
  {
    id: "spring-146",
    category: 'SPRING',
    difficulty: "MEDIU",
    title: "WebClient din Spring WebFlux: Cand se foloseste?",
    question: "Ce este WebClient si cand este recomandat fata de un client sincron clasic?",
    answer: "1. Ce este WebClient:\\n   - Clientul HTTP reactiv si non-blocant introdus in Spring 5 ca parte a modulului Spring WebFlux (bazat pe Project Reactor si Netty).\\n   - Metodele sale returneaza fluxuri reactive: Mono<T> (0 sau 1 element) sau Flux<T> (0 pana la N elemente).\\n\\n2. Cand este recomandat:\\n   - Cand construiesti o aplicatie complet reactiva (Spring WebFlux).\\n   - Cand apelezi servicii externe care raspund lent sau cu volum urias de date (streaming SSE / chunked responses): thread-ul apelant NU ramane blocat asteptand raspunsul pe retea, ci este eliberat imediat pentru a servi alte cereri!\\n\\n3. Cand NU este recomandat:\\n   - Dintr-o aplicatie clasica Spring MVC blocanta, apelarea webClient.get()...block() anuleaza tot avantajul reactiv si adauga complexitate inutila; foloseste RestClient in loc.",
    codeSnippet: `WebClient webClient = WebClient.create("https://api.github.com");

// Apel asincron reactiv non-blocant:
Mono<RepoDto> repoMono = webClient.get()
    .uri("/repos/spring-projects/spring-boot")
    .retrieve()
    .bodyToMono(RepoDto.class);

// Procesare reactiva fara blocarea thread-ului:
repoMono.subscribe(repo -> System.out.println("Stars: " + repo.stars()));`,
    interviewTrap: "Apelul .block() pe un Mono sau Flux forteaza executia sincrona si este strict contraindicat pe thread-urile interne de Netty deoarece poate bloca tot Event Loop-ul.",
    keyTakeaway: "WebClient este clientul reactiv non-blocant ideal pentru arhitecturi reactive si streaming de volum mare de date."
  },
  {
    id: "spring-147",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Arhitectura Monolit vs Microservicii pe scurt",
    question: "Care sunt diferentele principale dintre o aplicatie Monolitica si o arhitectura de Microservicii?",
    answer: "1. Arhitectura Monolit (Monolith):\\n   - Toate componentele de business (autentificare, produse, comenzi, plati, facturare) sunt impachetate si ruleaza ca un SINGUR proces si o singura aplicatie JAR/WAR pe o baza de date comuna.\\n   - Avantaje: Simplitate la dezvoltare, depanare si deploy local; latenta zero intre module (apeluri de functii in memorie); tranzactii ACID native.\\n   - Dezavantaje: Daca un modul pica (ex: OutOfMemoryError la generarea unui PDF), cade toata aplicatia; scalarea se face pe tot monolit-ul; baza de cod devine uriasa.\\n\\n2. Arhitectura de Microservicii:\\n   - Aplicatia este sparta in servicii independente mici, autonome, fiecare avand propriul sau depozit de cod si PROPRIA SA BAZA DE DATE (Database-per-service pattern).\\n   - Comunica prin retea (REST HTTP sau mesagerie asincrona Kafka/RabbitMQ).\\n   - Avantaje: Scalare independenta a modulelor incarcate; echipe autonome; rezistenta la defecte izolate.\\n   - Dezavantaje (Cost urias de complexitate): Latenta de retea, tranzactii distribuite greoaie, deploy complex (Kubernetes, Docker), depanare anevoioasa pe zeci de servicii.",
    codeSnippet: `// Monolit: OrderService apeleaza direct paymentService.pay() in memorie
// Microservicii: OrderService trimite HTTP POST https://payment-service/pay sau mesaj Kafka`,
    interviewTrap: "La interviu nu recomanda automat Microserviciile pentru orice proiect mic! Monolitul este adesea mult mai eficient si ieftin pentru aplicatii mici si echipe sub 10 programatori.",
    keyTakeaway: "Monolitul este o aplicatie unica simpla si rapida; Microserviciile ofera scalare si echipe independente dar aduc complexitate ridicata de retea."
  },
  {
    id: "spring-148",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Service Discovery (Eureka) si API Gateway in Microservicii",
    question: "Ce rol au un Service Discovery (Netflix Eureka) si un API Gateway (Spring Cloud Gateway) intr-un sistem de microservicii?",
    answer: "1. Service Discovery (ex: Netflix Eureka / Consul):\\n   - Este \"agenda telefonica\" a microserviciilor.\\n   - Intr-un cluster dinamic (Docker/Kubernetes), instantele de servicii pornesc si se opresc primind adrese IP aleatorii.\\n   - Fiecare microserviciu se inregistreaza la startup la Eureka trimitand numele sau (ex: \"ORDER-SERVICE\") si adresa IP/portul curent.\\n   - Cand Service-ul A vrea sa vorbeasca cu B, intreaba Eureka: \"Unde este ORDER-SERVICE?\", iar Eureka ii returneaza lista de IP-uri active pentru load balancing.\\n\\n2. API Gateway (Spring Cloud Gateway):\\n   - Este singurul punct de intrare public pentru toti clientii externi (Mobile App, Web React, Parteneri).\\n   - Ruteaza cererile catre microserviciul intern potrivit, mascand topologia interna a retelei.\\n   - Centralizeaza autentificarea (validarea token-ului JWT o singura data la intrare!), rate limiting-ul, logging-ul si politicile CORS.",
    codeSnippet: `// Clientul apeleaza doar Gateway: https://api.mycompany.com/api/orders
// API Gateway valideaza token-ul JWT si ruteaza intern catre: http://10.0.1.45:8082 (Order Service)`,
    interviewTrap: "In Kubernetes nativ, mecanismul intern de Service si CoreDNS inlocuieste adesea necesitatea unui server dedicat Netflix Eureka.",
    keyTakeaway: "Service Discovery mentine registrul dinamic de IP-uri ale serviciilor; API Gateway este poarta unica de intrare pentru securitate si rutare."
  },
  {
    id: "spring-149",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Ce aduce Spring Boot 3 fata de Spring Boot 2?",
    question: "Care sunt cele mai mari 3 schimbari si cerinte introduse odata cu lansarea Spring Boot 3?",
    answer: "Lansat la sfarsitul anului 2022, Spring Boot 3 marcheaza o evolutie majora a framework-ului:\\n\\n1. Cerinta minima de Java 17:\\n   - Spring Boot 3 NU mai ruleaza pe Java 8 sau Java 11! Cere obligatoriu Java 17 sau Java 21 (aducand suport nativ pentru Records, Text Blocks, Pattern Matching, Sealed Classes).\\n\\n2. Migrarea de la Java EE la Jakarta EE 10 (Pachetul jakarta.*):\\n   - Din cauza litigiului dintre Oracle si Eclipse Foundation, toate pachetele care incepeau cu javax.* au fost redenumite obligatoriu in jakarta.*!\\n   - Exemplu: javax.persistence.* devine jakarta.persistence.*, javax.servlet.* devine jakarta.servlet.*, javax.validation.* devine jakarta.validation.*!\\n\\n3. Suport nativ pentru GraalVM Native Images:\\n   - Permite compilarea AOT (Ahead-Of-Time) a aplicatiei intr-un binar executabil nativ de sistem de operare, oferind pornire in 50 milisecunde si consum de 40MB RAM (fara JVM complet!).\\n\\n4. Observabilitate Nativa: Suport nativ pentru Micrometer Tracing si ProblemDetail (RFC 7807).",
    codeSnippet: `// In Spring Boot 2 (Legacy):
// import javax.persistence.Entity;
// import javax.validation.constraints.NotNull;

// In Spring Boot 3 (Modern):
import jakarta.persistence.Entity;
import jakarta.validation.constraints.NotNull;`,
    interviewTrap: "Daca aduci o biblioteca veche care foloseste javax.servlet.* intr-un proiect de Spring Boot 3, vei primi erori de ClassNotFoundException la startup!",
    keyTakeaway: "Spring Boot 3 impune Java 17+, inlocuieste javax.* cu jakarta.* si aduce suport pentru GraalVM Native Image si ProblemDetails RFC 7807."
  },
  {
    id: "spring-150",
    category: 'SPRING',
    difficulty: "USOR",
    title: "Top 5 Bune Practici Spring Boot pentru un Interviu Tehnic",
    question: "Care sunt cele mai importante 5 bune practici de arhitectura si cod pe care un candidat Junior/Mid trebuie sa le mentioneze la un interviu Spring Boot?",
    answer: "1. Folosirea exclusiva a Constructor Injection:\\n   - Asigura imutabilitate (campuri private final) si testabilitate simpla fara Spring in JUnit 5; evita Field Injection (@Autowired pe camp).\\n\\n2. Nu expune niciodata entitatile JPA in controllere:\\n   - Foloseste intotdeauna DTO-uri sau Java Records pentru a decupla baza de date de contractul API si pentru a preveni atacurile de tip mass-assignment si buclele de serializare.\\n\\n3. Centralizarea erorilor cu @RestControllerAdvice:\\n   - Fara try-catch duplicat in fiecare controller; returneaza raspunsuri de eroare uniforme (ProblemDetail RFC 7807).\\n\\n4. Configurarea relatiilor JPA pe FetchType.LAZY ca standard:\\n   - Previne incarcarea intregii baze de date in memorie si rezolva punctiform N+1 prin JOIN FETCH sau @EntityGraph in Repository.\\n\\n5. Externalizarea securizata a configuratiilor:\\n   - Nu lasa parole in clar in cod; foloseste variabile de mediu sau profile Spring (@ConfigurationProperties si @Profile) si limiteaza endpoint-urile Actuator.",
    codeSnippet: `// Profilul unui dezvoltator profesionist Junior/Mid:
// 1. Constructor Injection cu campuri final
// 2. Returnare de DTO Records, nu Entitati JPA
// 3. Validare cu @Valid si tratare globala in @RestControllerAdvice
// 4. @Transactional doar pe metodele care scriu si LAZY pe relatii
// 5. Teste unitare pure rapide cu Mockito fara context Spring`,
    interviewTrap: "Daca la interviu demonstrezi ca intelegi DE CE facem aceste alegeri de arhitectura (securitate, memorie, performanta si testabilitate), treci garantat in fata candidatilor care doar memoreaza adnotari.",
    keyTakeaway: "Practicile esentiale sunt: Constructor Injection, DTO-uri in loc de entitati, LAZY pe relatii JPA, @RestControllerAdvice global si securizarea configuratiilor."
  }
];
