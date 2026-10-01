// Deck Masiv: Spring Boot 3, Spring Data JPA, Hibernate & Microservices
// Preluat din: Baeldung, in28minutes/spring-interview-guide, DopplerHQ
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const SPRING_DECK = [
  {
    id: 'spring-01',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'De ce @Transactional apelat intern NU functioneaza?',
    question: 'Daca o metoda publica fara adnotari dintr-o clasa apeleaza o metoda @Transactional din aceeasi clasa, se deschide o tranzactie? De ce?',
    answer: 'NU, tranzactia NU se deschide! Spring gestioneaza tranzactiile prin Proxy Pattern (CGLIB sau JDK Dynamic Proxies). Cand un bean extern apeleaza metoda, apelul trece prin Proxy, care intercepteaza apelul, deschide tranzactia pe EntityManager si apoi deleaga executia.\n\nCand apelezi metoda interna direct din aceeasi clasa (this.method()), apelul ocoleste complet proxy-ul Spring, executandu-se pe instanta directa (raw instance). Ca urmare, interceptorul de tranzactie nu este niciodata invocat.',
    codeSnippet: `@Service
public class OrderService {
    public void processOrder() {
        saveOrder(); // ATENTIE: this.saveOrder() ocoleste proxy-ul!
    }

    @Transactional
    public void saveOrder() {
        orderRepo.save(new Order());
    }
}
// SOLUTIE: Muta metoda in alt serviciu dedicat sau foloseste TransactionTemplate.`,
    interviewTrap: 'Daca raspunzi ca Spring intercepteaza apelurile private sau interne "magic", pici testul de arhitectura AOP.',
    keyTakeaway: 'Spring AOP functioneaza doar prin apeluri care trec prin Proxy-ul exterior al bean-ului.'
  },
  {
    id: 'spring-02',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Cum rezolvi problema N+1 Query in JPA / Hibernate?',
    question: 'Ce este problema N+1 in ORM si care sunt cele 3 solutii canonice pentru a o preveni in Spring Data JPA?',
    answer: 'Problema N+1 apare cand interoghezi o lista de N entitati parinte (1 query) si, la accesarea unei relatii Lazy (ex: getApplications()), Hibernate executa cate un query suplimentar pentru fiecare copil in parte (N query-uri separate). Rezultat: 1 + N interogari in baza de date.\n\nSolutii:\n1. JOIN FETCH in JPQL: Incarca parintele si copiii intr-un singur query cu SQL JOIN.\n2. @EntityGraph: Adnotare declarativa pe metoda de repository care instruieste JPA sa faca fetch join.\n3. @BatchSize(size = 25): Incarca copiii in batch-uri folosind clauza WHERE parent_id IN (?, ?, ...), reducand de la N la N/25 query-uri.',
    codeSnippet: `// 1. JPQL JOIN FETCH:
@Query("SELECT j FROM JobPosting j LEFT JOIN FETCH j.applications WHERE j.status = 'ACTIVE'")
List<JobPosting> findAllWithApplications();

// 2. @EntityGraph:
@EntityGraph(attributePaths = {"applications", "company"})
List<JobPosting> findByStatus(String status);`,
    interviewTrap: 'Setarea relatiei pe FetchType.EAGER NU rezolva problema N+1! Duce la executarea imediata a celor N interogari.',
    keyTakeaway: 'Foloseste mereu FetchType.LAZY ca default, si incarca relatiile necesare punctual prin JOIN FETCH sau @EntityGraph.'
  },
  {
    id: 'spring-03',
    category: 'SPRING',
    difficulty: 'USOR',
    title: 'Ciclul de viata al unui Bean Spring (Bean Lifecycle)',
    question: 'Care sunt etapele principale prin care trece un Bean in ApplicationContext de la instantiere pana la distrugere?',
    answer: 'Etapele cheie ale Bean Lifecycle sunt:\n1. Instantiere: Crearea obiectului prin constructor.\n2. Populare proprietati: Dependency Injection (@Autowired).\n3. Aware Interfaces: Setarea BeanNameAware, ApplicationContextAware.\n4. BeanPostProcessor (Pre-Initialization): postProcessBeforeInitialization.\n5. Initializare: Apelarea @PostConstruct sau InitializingBean.afterPropertiesSet.\n6. BeanPostProcessor (Post-Initialization): Crearea PROXY-ului AOP (pentru @Transactional, @Async).\n7. Bean GATA de utilizare.\n8. Distrugere: Cand contextul se opreste, apelarea @PreDestroy.',
    codeSnippet: `@Component
public class PaymentGateway {
    @PostConstruct
    public void init() {
        System.out.println("Gateway initializat cu chei API");
    }

    @PreDestroy
    public void cleanup() {
        System.out.println("Conexiuni socket inchise curat");
    }
}`,
    interviewTrap: 'Nu incerca sa accesezi dependinte injectate prin @Autowired in constructor daca folosesti field injection! Foloseste constructor injection.',
    keyTakeaway: 'Foloseste intotdeauna Constructor Injection pentru imutabilitate si testabilitate usoara.'
  },
  {
    id: 'spring-04',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Ce exceptii declanseaza Rollback automat in @Transactional?',
    question: 'Daca o metoda adnotata cu @Transactional arunca o exceptie de tip Checked (de ex: Exception sau IOException), se face rollback automat? Cum modifici acest comportament?',
    answer: 'NU se face rollback automat! In mod implicit (by default), Spring Transaction Manager face rollback DOAR pentru exceptii necontrolate (Unchecked Exceptions: RuntimeException si Error).\n\nExceptiile Checked sunt considerate situatii recuperabile, iar tranzactia va fi comisa (COMMIT) chiar daca exceptia a fost aruncata.\n\nPentru a forta rollback pe orice exceptie, trebuie sa specifici: @Transactional(rollbackFor = Exception.class).',
    codeSnippet: `// Checked Exception NU face rollback by default:
@Transactional(rollbackFor = {Exception.class, IOException.class})
public void processFileSafe() throws Exception {
    repo.save(entity);
    throw new IOException("Eroare disc"); // Face ROLLBACK!
}`,
    interviewTrap: 'Daca prinzi exceptia cu try-catch si NU o rearunci, Spring considera ca ai gestionat-o si face COMMIT!',
    keyTakeaway: 'Specificati intotdeauna rollbackFor = Exception.class pe operatiuni financiare sau critice.'
  },
  {
    id: 'spring-05',
    category: 'SPRING',
    difficulty: 'USOR',
    title: 'Constructor Injection vs Field Injection (@Autowired)',
    question: 'De ce echipa Spring recomanda oficial Constructor Injection si descurajeaza Field Injection (@Autowired direct pe campuri)?',
    answer: 'Constructor Injection ofera:\n1. Imutabilitate: Poti declara dependintele ca fiind "final", garantand ca nu vor fi modificate.\n2. Testabilitate Unitara: Poti instantia clasa cu "new Service(mockRepo)" in teste JUnit fara a porni Spring Context.\n3. Detectarea dependentelor circulare la pornire: Daca A cere B si B cere A, aplicatia refuza sa porneasca instant (fail-fast).\n4. Siguranta impotriva NullPointerException: Obiectul nu poate fi creat partial initializat.',
    codeSnippet: `@Service
public class UserService {
    private final UserRepository repo;

    public UserService(UserRepository repo) {
        this.repo = Objects.requireNonNull(repo);
    }
}`,
    interviewTrap: 'Cu Lombok, poti folosi @RequiredArgsConstructor pe clasa, iar Lombok genereaza constructorul pentru toate campurile final.',
    keyTakeaway: 'Dependintele finale injectate prin constructor creeaza aplicatii sigure, imutabile si usor de testat.'
  },
  {
    id: 'spring-06',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Stari ale unei entitati JPA (Entity Lifecycle)',
    question: 'Care sunt cele 4 stari prin care poate trece o entitate in JPA (Hibernate) si ce semnifica starea Detached?',
    answer: 'Cele 4 stari fundamentale:\n1. Transient (New): Obiect creat cu "new", neasociat cu baza de date sau EntityManager.\n2. Managed (Persistent): Asociata cu sesiunea EntityManager curenta, are ID. Modificarile sunt salvate automat prin Dirty Checking.\n3. Detached: Are ID salvat in DB, dar sesiunea EntityManager a fost inchisa sau deconectata. Modificarile nu se salveaza automat.\n4. Removed: Programata pentru stergere (DELETE) din DB la comiterea tranzactiei.',
    codeSnippet: `JobPosting job = new JobPosting("Java Dev"); // TRANSIENT
em.persist(job); // MANAGED (Dirty Checking activ)
job.setTitle("Senior Java Dev"); // Va genera automat UPDATE!
em.detach(job); // DETACHED`,
    interviewTrap: 'entityManager.merge(detachedEntity) returneaza o instanta NOUA managed; instanta veche pe care ai apelat merge ramane tot detached!',
    keyTakeaway: 'Dirty Checking functioneaza doar pentru entitatile aflate in starea Managed in interiorul unei tranzactii active.'
  },
  {
    id: 'spring-07',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'LazyInitializationException: Cauza si Prevenire',
    question: 'Ce cauzeaza celebra eroare org.hibernate.LazyInitializationException si cum se rezolva corect fara sa folosesti enable_lazy_load_no_trans?',
    answer: 'Apare cand accesezi o relatie marcata cu FetchType.LAZY (ex: job.getApplications()) in afara unei tranzactii active, DUPA ce Hibernate Session a fost deja inchisa.\n\nRezolvare corecta:\n1. Incarcare prin JOIN FETCH sau @EntityGraph in Repository la nivel de query.\n2. Folosirea de proiectii DTO (record sau interfata DTO).\n3. Mentinerea tranzactiei la nivel de Service (@Transactional(readOnly = true)).\n\nNu activa niciodata hibernate.enable_lazy_load_no_trans=true in productie (anti-pattern cu epuizare de conexiuni).',
    codeSnippet: `public interface JobDtoProjection {
    Long getId();
    String getTitle();
    int getApplicantCount();
}

@Query("SELECT j.id as id, j.title as title, count(a) as applicantCount " +
       "FROM JobPosting j LEFT JOIN j.applications a GROUP BY j.id, j.title")
List<JobDtoProjection> findAllSummary();`,
    interviewTrap: 'Daca serializezi o entitate cu relatii Lazy direct in JSON prin Jackson in controller, serializerul apeleaza getterele si arunca LazyInitializationException.',
    keyTakeaway: 'Transforma entitatile in DTO-uri in Service layer cat timp tranzactia este deschisa.'
  },
  {
    id: 'spring-08',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Propagation.REQUIRED vs REQUIRES_NEW in @Transactional',
    question: 'Care este diferenta dintre valorile de propagare ale tranzactiilor: Propagation.REQUIRED (default) si Propagation.REQUIRES_NEW?',
    answer: '1. Propagation.REQUIRED (Implicit): Se alatura tranzactiei existente daca exista una; altfel creeaza una noua. Daca metoda copil pica, toata tranzactia face rollback.\n2. Propagation.REQUIRES_NEW: Suspenda tranzactia curenta si deschide o tranzactie COMPLET NOUA, independenta, cu conexiune separata la DB. Comite sau face rollback independent de tranzactia parinte (ideala pentru audit logging).',
    codeSnippet: `@Service
public class AuditService {
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logSecurityAttempt(String user, boolean success) {
        auditRepo.save(new SecurityLog(user, success, Instant.now()));
    }
}`,
    interviewTrap: 'REQUIRES_NEW consuma doua conexiuni simultane din Hikari Connection Pool. Daca pool-ul este mic, poate genera Connection Pool Deadlock sub trafic mare!',
    keyTakeaway: 'REQUIRED pentru business logic; REQUIRES_NEW pentru audit logs independente.'
  },
  {
    id: 'spring-09',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Optimistic Locking (@Version) vs Pessimistic Locking',
    question: 'Ce este Optimistic Locking, cum se implementeaza cu adnotarea @Version si cand alegi Pessimistic Locking?',
    answer: '1. Optimistic Locking: Adauga o coloana @Version. La UPDATE, Hibernate verifica WHERE id = ? AND version = ?. Daca alt proces a modificat randul intre timp, arunca OptimisticLockException. Fara lock-uri pe DB, throughput maxim.\n2. Pessimistic Locking: Blocheaza randul in SQL prin clauza SELECT ... FOR UPDATE (PESSIMISTIC_WRITE). Niciun alt thread nu poate modifica randul pana la COMMIT.',
    codeSnippet: `@Entity
public class JobApplication {
    @Id private UUID id;
    @Version private Long version;
}

@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT b FROM BankAccount b WHERE b.id = :id")
Optional<BankAccount> findByIdForUpdate(@Param("id") Long id);`,
    interviewTrap: 'La Optimistic Locking, aplicatia trebuie sa prinda OptimisticLockException si sa foloseasca reincercare automata (Spring Retry).',
    keyTakeaway: 'Optimistic Locking pentru aplicatii web de citire; Pessimistic Locking pentru sisteme financiare si stocuri unice.'
  },
  {
    id: 'spring-10',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza Security Filter Chain in Spring Security 6',
    question: 'Care este fluxul unui request printr-un SecurityFilterChain in Spring Boot 3 si cum validezi un JWT pe fiecare apel?',
    answer: 'Request-ul HTTP trece prin lantul de filtre (FilterChain):\n1. Filtrul JwtAuthenticationFilter (OncePerRequestFilter) extrage header-ul Authorization: Bearer <token>.\n2. Valideaza semnatura si expirarea token-ului.\n3. Creeaza UsernamePasswordAuthenticationToken cu user-ul si rolurile sale.\n4. Seteaza obiectul in SecurityContextHolder.getContext().setAuthentication(auth).\n5. Lasa request-ul sa mearga mai departe in lant catre Controller.',
    codeSnippet: `@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String authHeader = req.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtService.isTokenValid(token)) {
                var auth = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }
        chain.doFilter(req, res);
    }
}`,
    interviewTrap: 'In Spring Boot 3+, configurarea securitatii se face exclusiv prin definirea unui bean SecurityFilterChain; WebSecurityConfigurerAdapter a fost eliminat!',
    keyTakeaway: 'SecurityContextHolder stocheaza autentificarea pe baza de ThreadLocal pe durata request-ului curent.'
  },
  {
    id: 'spring-11',
    category: 'SPRING',
    difficulty: 'USOR',
    title: '@Controller vs @RestController in Spring Boot',
    question: 'Care este diferenta dintre adnotarea @Controller si @RestController si cum functioneaza serializarea JSON?',
    answer: '1. @Controller: Adnotarea traditionala Spring MVC pentru aplicatii cu view HTML (Thymeleaf, JSP). Returneaza un template name String.\n2. @RestController: Adnotare compusa (@Controller + @ResponseBody). Metodele sale returneaza direct date (DTO-uri) serializate automat in JSON de catre Jackson.',
    codeSnippet: `@RestController
@RequestMapping("/api/v1/jobs")
public class JobController {
    @GetMapping("/{id}")
    public JobDto getJob(@PathVariable UUID id) {
        return jobService.getJob(id); // Serializat automat in JSON 200 OK
    }
}`,
    interviewTrap: 'Daca pui @Controller si returnezi JobDto fara @ResponseBody, Spring va incerca sa gaseasca un template HTML si va returna 404 sau 500.',
    keyTakeaway: '@RestController este adnotarea standard pentru servicii REST in Spring Boot.'
  },
  {
    id: 'spring-12',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Gestionarea Globala a Erorilor cu @ControllerAdvice & ProblemDetails',
    question: 'Cum implementezi tratarea centralizata a exceptiilor in Spring Boot 3 folosind standardul ProblemDetails (RFC 7807)?',
    answer: 'Folosim un interceptor global @RestControllerAdvice:\n1. @ExceptionHandler(CustomException.class) prinde exceptiile aruncate din orice controller.\n2. In Spring Boot 3+, clasa ProblemDetail (RFC 7807) genereaza un raspuns JSON standardizat international cu titlu, status, detalii si timestamps.',
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
    interviewTrap: 'Nu trimite stack trace-ul complet al exceptiei catre client in productie! Este o vulnerabilitate de securitate.',
    keyTakeaway: '@RestControllerAdvice asigura raspunsuri de eroare curate, standardizate si consistente pe tot API-ul.'
  }
];
