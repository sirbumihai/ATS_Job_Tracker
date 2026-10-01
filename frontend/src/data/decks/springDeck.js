// Deck Masiv: Spring Boot 3, Spring Data JPA, Hibernate & Microservices
// Preluat din: Baeldung, in28minutes/spring-interview-guide, DopplerHQ, sudheerj
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
  },
  {
    id: 'spring-13',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Bean Scopes si Injectarea unui Prototype intr-un Singleton',
    question: 'Ce se intampla cand un Bean Singleton are ca dependinta injectata un Bean Prototype? Cum fortezi crearea unei instante noi la fiecare apel?',
    answer: 'Daca injectezi direct un Bean Prototype (@Scope("prototype")) intr-un Bean Singleton (@Scope("singleton")), instanta prototype este creata O SINGURA DATA, in momentul cand singleton-ul este instantiat si injectat. Toate apelurile ulterioare vor folosi aceeasi instanta veche, distrugand complet scopul de Prototype!\n\nSolutii corecte:\n1. Adnotarea @Lookup: Spring genereaza un proxy CGLIB care suprascrie metoda abstracta si cere o instanta noua din ApplicationContext la fiecare apel.\n2. ObjectProvider<T>: Injectezi ObjectProvider<MyPrototypeBean> si apelezi provider.getObject().\n3. ApplicationContext.getBean(Class): Look-up manual (mai putin recomandat din cauza cuplarii directe cu contextul).',
    codeSnippet: `@Component
@Scope("prototype")
public class TokenGenerator {
    private final String id = UUID.randomUUID().toString();
    public String getId() { return id; }
}

@Service
public class SecurityService {
    // Solutia 1: @Lookup creeaza dinamic o instanta noua la fiecare executie
    @Lookup
    public TokenGenerator getNewTokenGenerator() {
        return null; // Spring suprascrie implementarea prin CGLIB
    }

    // Solutia 2: ObjectProvider
    @Autowired
    private ObjectProvider<TokenGenerator> tokenProvider;

    public String generateToken() {
        return tokenProvider.getObject().getId();
    }
}`,
    interviewTrap: 'Injectarea directa @Autowired private PrototypeBean bean creeaza o iluzie periculoasa: bean-ul ramane blocat pe prima sa instanta.',
    keyTakeaway: 'Foloseste @Lookup sau ObjectProvider<T> pentru a consuma bean-uri Prototype dintr-un Singleton.'
  },
  {
    id: 'spring-14',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Dependente Circulare (Circular Dependencies) in Spring Boot',
    question: 'De ce a interzis Spring Boot 2.6+ dependentele circulare in mod implicit si care sunt cele 3 moduri de a le rezolva?',
    answer: 'Dependentele circulare apar cand Bean A are nevoie de Bean B, iar Bean B are nevoie de Bean A. Din Spring Boot 2.6, proprietatea spring.main.allow-circular-references este false by default, cauzand BeanCurrentlyInCreationException la pornire.\n\nEchipa Spring a luat aceasta decizie deoarece dependentele circulare semnaleaza o incalcare grava a principiului Single Responsibility (SRP) si induc cuplare stransa (tight coupling).\n\nSolutii:\n1. Refactorizare (Recomandat): Extrage logica comuna intr-un al treilea Bean C, dependent de ambele.\n2. Decuplare prin Evenimente: Bean A emite un ApplicationEvent, iar Bean B il asculta cu @EventListener.\n3. Adnotarea @Lazy: Injectezi @Lazy pe unul dintre constructori. Spring va injecta un proxy temporar care intarzie instantierea reala pana la prima invocare a metodei.',
    codeSnippet: `@Service
public class OrderService {
    private final PaymentService paymentService;

    // Solutie temporara cu @Lazy pe constructor:
    public OrderService(@Lazy PaymentService paymentService) {
        this.paymentService = paymentService;
    }
}`,
    interviewTrap: 'Activarea flag-ului allow-circular-references=true in application.yml este un anti-pattern de productie si va fi respinsa la interviurile de Senior/Lead.',
    keyTakeaway: 'Refactorizarea si extragerea logicii comune este singura solutie arhitecturala curata pentru dependente circulare.'
  },
  {
    id: 'spring-15',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza Auto-Configuration in Spring Boot 3?',
    question: 'Care este mecanismul intern prin care Spring Boot configureaza automat componentele si ce s-a schimbat in Spring Boot 3?',
    answer: 'La pornire, adnotarea @SpringBootApplication include @EnableAutoConfiguration.\n1. Spring citeste fisierele speciale de autoconfigurare din dependintele JAR.\n2. In Spring Boot 3+, clasele de autoconfigurare sunt listate in: META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports (in loc de vechiul spring.factories din Boot 2).\n3. Fiecare clasa de autoconfigurare este evaluata prin conditii (@ConditionalOnClass, @ConditionalOnMissingBean, @ConditionalOnProperty). Daca toate conditiile sunt indeplinite, bean-urile sunt inregistrate in ApplicationContext.',
    codeSnippet: `@AutoConfiguration
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
@ConditionalOnProperty(prefix = "spring.datasource", name = "url")
public class DataSourceAutoConfiguration {
    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create().build();
    }
}`,
    interviewTrap: 'Daca declari tu manual un bean DataSource in aplicatie, conditia @ConditionalOnMissingBean devine falsa, iar Spring Boot renunta automat la configurarea default!',
    keyTakeaway: 'Auto-configuration este conditional si non-invaziv: orice bean custom scris de tine are prioritate peste configurarea automata.'
  },
  {
    id: 'spring-16',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Open EntityManager in View (OSIV Anti-Pattern)',
    question: 'Ce este Open Session in View (OSIV / spring.jpa.open-in-view) si de ce este considerat un risc major de performanta si scalabilitate in productie?',
    answer: 'OSIV este o caracteristica istorica activata implicit in Spring Boot (spring.jpa.open-in-view=true). Ea tine deschisa sesiunea Hibernate / EntityManager pe toata durata request-ului HTTP, inclusiv in Controller si la serializarea JSON Jackson.\n\nRiscuri Majore in Productie:\n1. Epuizarea Conexiunilor HikariCP: O conexiune fizica la baza de date este tinuta blocata in timp ce serverul proceseaza logica HTTP, asteapta apeluri REST externe sau transmite date lente catre client.\n2. N+1 Queries Mascate: Permite interogari Lazy direct din getters apelati in mod inconstient in timpul serializarii JSON.\n\nBest Practice:\nDezactiveaza OSIV intotdeauna in productie (spring.jpa.open-in-view: false) si asigura-te ca incarci datele complet in Service layer folosind DTO-uri si JOIN FETCH.',
    codeSnippet: `# In application.yml - OBLIGATORIU IN PRODUCTIE:
spring:
  jpa:
    open-in-view: false`,
    interviewTrap: 'Daca dezactivezi OSIV, s-ar putea sa primesti LazyInitializationException daca entitatile tale cu relatii lazy ajungeau direct in Controller. Solutia este DTO projection, nu reactivarea OSIV!',
    keyTakeaway: 'Dezactiveaza spring.jpa.open-in-view=false pentru a elibera conexiunile la DB imediat dupa finalizarea Service layer-ului.'
  },
  {
    id: 'spring-17',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: '@Modifying si clearAutomatically in Spring Data JPA',
    question: 'Cand trebuie sa folosesti @Modifying pe o metoda @Query si ce efect critic are proprietatea clearAutomatically = true?',
    answer: 'Adnotarea @Modifying este obligatorie pentru orice interogare JPQL sau Native SQL de tip UPDATE sau DELETE (altfel JPA presupune ca este SELECT si arunca InvalidDataAccessApiUsageException).\n\nEfectul clearAutomatically = true:\nHibernate pastreaza entitatile citite anterior in First Level Cache (Persistence Context). Cand executi un UPDATE direct prin query SQL, baza de date se actualizeaza, dar obiectele din cache raman nemodificate (date invechite - stale state).\n\nSetand @Modifying(clearAutomatically = true), Spring Data apeleaza automat entityManager.clear() dupa query, golind cache-ul si fortand reincarcarea starii actualizate din DB la urmatorul findById.',
    codeSnippet: `@Modifying(clearAutomatically = true, flushAutomatically = true)
@Query("UPDATE JobApplication a SET a.status = :status WHERE a.id = :id")
int updateApplicationStatus(@Param("id") UUID id, @Param("status") String status);`,
    interviewTrap: 'Fara clearAutomatically=true, daca citesti entitatea inainte de update si apoi o accesezi dupa update in aceeasi tranzactie, vei citi valoarea VECHE din cache-ul L1!',
    keyTakeaway: 'Foloseste intotdeauna clearAutomatically = true pe operatiuni de bulk update sau operatii native DML.'
  },
  {
    id: 'spring-18',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Page<T> vs Slice<T> vs List<T> in Spring Data JPA',
    question: 'De ce este Page<T> ineficient pe tabele cu milioane de inregistrari si cand ar trebui sa folosesti Slice<T> sau Keysed Pagination?',
    answer: 'Diferente fundamentale:\n1. Page<T>: Executa DOUA interogari: una pentru datele din pagina curenta (SELECT ... LIMIT ? OFFSET ?) si una pentru numarul total de inregistrari (SELECT COUNT(*)). Pe tabele mari, COUNT(*) forteaza o scanare completa a tabelei (seq scan) si devine un bottleneck masiv.\n2. Slice<T>: Nu executa niciun COUNT(*)! Executa un singur query cerand limit + 1 inregistrari. Daca primeste limit + 1 elemente, stie ca exista pagina urmatoare (hasNext() == true). Ideal pentru aplicatii mobile sau scroll infinit.\n3. Keysed Pagination (Seek Method): Foloseste clauza WHERE id > :lastSeenId ORDER BY id ASC LIMIT 20 in loc de OFFSET, mentinand index scan instantaneu indiferent de numarul paginii.',
    codeSnippet: `// 1. Slice - Fara COUNT query suplimentar:
Slice<JobPosting> findByLocation(String location, Pageable pageable);

// 2. Keyset (Seek) Pagination - Viteza O(1) constanta:
@Query("SELECT j FROM JobPosting j WHERE j.id > :lastId ORDER BY j.id ASC LIMIT :limit")
List<JobPosting> findNextPage(@Param("lastId") Long lastId, @Param("limit") int limit);`,
    interviewTrap: 'Paginarea bazata pe OFFSET (ex: OFFSET 500000 LIMIT 20) este extrem de lenta deoarece DB-ul trebuie sa scaneze si sa arunce 500.000 de randuri inainte de a returna 20!',
    keyTakeaway: 'Foloseste Slice<T> sau Keyset Pagination pentru tabele masive si performanta garantata la scara mare.'
  },
  {
    id: 'spring-19',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Niveluri de Izolare a Tranzactiilor (Transaction Isolation Levels)',
    question: 'Care sunt cele 4 niveluri de izolare a tranzactiilor in SQL / Spring si ce anomalii concurente previne fiecare?',
    answer: 'Nivelurile de izolare definesc cat de izolata este o tranzactie fata de modificarile concurente:\n1. READ_UNCOMMITTED: Cel mai slab nivel. Permite Dirty Read (citesti date modificate de o tranzactie necomisa care poate face rollback).\n2. READ_COMMITTED (Default in PostgreSQL, Oracle): Previne Dirty Read. Permite Non-Repeatable Read (citesti un rand de doua ori si are valori diferite deoarece alta tranzactie a facut COMMIT intre timp).\n3. REPEATABLE_READ (Default in MySQL InnoDB): Previne Dirty Read si Non-Repeatable Read. Poate permite Phantom Read in unele motoare (apar randuri noi la un query de tip range).\n4. SERIALIZABLE: Izolare totala, echivalenta cu executia secventiala. Previne toate anomaliile, dar cauzeaza lock contention si performanta redusa.',
    codeSnippet: `@Transactional(isolation = Isolation.READ_COMMITTED)
public void transferMoney(UUID fromId, UUID toId, BigDecimal amount) {
    // Standard isolation recomandat pe majoritatea RDBMS
}`,
    interviewTrap: 'Daca cresti nivelul la SERIALIZABLE, multe tranzactii concurente vor primi erori de serializare (SerializationFailureException) si necesita reincercare automata.',
    keyTakeaway: 'READ_COMMITTED combinat cu Optimistic Locking (@Version) este combinatia standard de aur pentru sisteme de inalta performanta.'
  },
  {
    id: 'spring-20',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Tranzactii Programatice cu TransactionTemplate',
    question: 'Cand si de ce ai alege TransactionTemplate in locul adnotarii declarative @Transactional?',
    answer: 'Adnotarea @Transactional are doua dezavantaje majore in aplicatii enterprise de inalta scalabilitate:\n1. Nu functioneaza la auto-apeluri interne din aceeasi clasa (limitarea Spring Proxy AOP).\n2. Tine conexiunea la baza de date blocata pe toata durata metodei. Daca metoda face operatiuni I/O lente (apeluri catre Stripe API, trimitere email, hashing de fisiere), conexiunea din pool este irosita inutil.\n\nTransactionTemplate permite delimitarea precisa a tranzactiei doar in jurul operatiei exacte pe baza de date, eliberand conexiunea imediat ce salvarea a reusit.',
    codeSnippet: `@Service
public class OrderService {
    private final TransactionTemplate transactionTemplate;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepo;

    public void processOrder(OrderRequest req) {
        // 1. Apel extern lent NON-TRANZACTIONAL (fara blocare DB pool):
        PaymentReceipt receipt = paymentClient.charge(req.cardToken(), req.amount());

        // 2. Tranzactie DB atomica scurta (cativa milisecunde):
        transactionTemplate.execute(status -> {
            Order order = new Order(req, receipt.getId());
            return orderRepo.save(order);
        });
    }
}`,
    interviewTrap: 'Nu plasa niciodata apeluri HTTP externe sau I/O lent in interiorul unei metode @Transactional; vei epuiza rapid pool-ul HikariCP sub trafic moderat!',
    keyTakeaway: 'Foloseste TransactionTemplate pentru a pastra tranzactiile DB cat mai scurte posibil si pentru a evita limitarea proxy-urilor AOP.'
  },
  {
    id: 'spring-21',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Spring Events si @TransactionalEventListener',
    question: 'Cum folosesti Spring Events pentru decuplare si de ce @TransactionalEventListener(AFTER_COMMIT) este vital la trimiterea de notificari?',
    answer: 'Mecanismul de Evenimente permite decuplarea componentelor:\n- ApplicationEventPublisher.publishEvent(new CandidateAppliedEvent(id))\n- Consumatorul asculta cu @EventListener.\n\nProblema Critica:\nDaca folosesti @EventListener obisnuit, codul listener-ului (de exemplu: trimitere email sau notificare Kafka) se executa IMEDIAT, inainte ca tranzactia DB a emitentului sa faca COMMIT. Daca salvarea in DB pica cu eroare (Rollback), utilizatorul a primit deja email-ul fals de confirmare!\n\nSolutie: @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)\nSe declanseaza DOAR dupa ce tranzactia DB a fost comisa cu succes.',
    codeSnippet: `@Service
public class ApplicationService {
    private final ApplicationEventPublisher publisher;

    @Transactional
    public void submitApplication(JobApplication app) {
        repo.save(app);
        publisher.publishEvent(new ApplicationSubmittedEvent(app.getId()));
    }
}

@Component
public class NotificationHandler {
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onApplicationSubmitted(ApplicationSubmittedEvent event) {
        emailService.sendConfirmationEmail(event.applicationId());
    }
}`,
    interviewTrap: 'Intr-un listener AFTER_COMMIT, nu poti salva nimic in DB fara a deschide o tranzactie noua cu @Transactional(propagation = Propagation.REQUIRES_NEW), deoarece tranzactia originala este deja comisa si readonly.',
    keyTakeaway: 'Foloseste @TransactionalEventListener(AFTER_COMMIT) pentru notificari, mesagerie externa si operatii nereversibile.'
  },
  {
    id: 'spring-22',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Tuning si Monitorizare HikariCP Connection Pool',
    question: 'Care sunt cei mai importanti parametri de tuning in HikariCP si care este formula recomandata pentru dimensiunea pool-ului de conexiuni?',
    answer: 'HikariCP este connection pool-ul implicit si cel mai rapid din Spring Boot.\n\nParametri Cheie:\n1. maximum-pool-size: Numarul maxim de conexiuni deschise catre DB (default: 10).\n2. minimum-idle: Numarul de conexiuni idle mentinute (recomandat egal cu max-size pentru stabilitate).\n3. connection-timeout: Timpul maxim (in ms) pe care un thread il asteapta pentru a primi o conexiune inainte de a arunca SQLException (recomandat: 20000 - 30000ms).\n4. leak-detection-threshold: Pragul dupa care Hikari logheaza un avertisment daca o conexiune nu este inchisa (recomandat: 2000ms pentru detectarea scurgerilor de conexiuni).\n\nFormula Oficiala Hikari:\npool_size = (core_cpu * 2) + effective_spindle_count\nPentru un server Postgres cu 8 nuclee CPU si disc SSD (spindle = 1), un pool de 17-20 de conexiuni per instanta ofera performanta maxima fara contention pe CPU.',
    codeSnippet: `spring:
  datasource:
    hikari:
      maximum-pool-size: 15
      minimum-idle: 15
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000
      leak-detection-threshold: 2000`,
    interviewTrap: 'Multi candidati cred gresit ca "mai multe conexiuni = aplicatie mai rapida" si pun 200 conexiuni. Acest lucru ucide baza de date din cauza context-switching-ului la nivel de OS pe DB.',
    keyTakeaway: 'O dimensiune redusa a connection pool-ului reduce latenta globala si previne sufocarea bazei de date.'
  },
  {
    id: 'spring-23',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Soft Delete in Hibernate 6 cu @SQLDelete si @SQLRestriction',
    question: 'Cum implementezi Soft Delete in Spring Boot 3 / Hibernate 6 si ce a inlocuit vechea adnotare @Where?',
    answer: 'Soft Delete inseamna marcarea unei inregistrari ca fiind stearsa (deleted = true) fara a sterge fizic randul din tabela.\n\nIn Hibernate 6 (Spring Boot 3+):\n1. @SQLDelete: Suprascrie comanda nativa SQL generata cand repository.delete(entity) este apelat.\n2. @SQLRestriction: Inlocuieste adnotarea deprecated @Where. Aplica automat un predicat SQL WHERE pe toate interogarile automate (findAll, findById etc.), excluzand inregistrarile sterse.',
    codeSnippet: `@Entity
@Table(name = "job_postings")
@SQLDelete(sql = "UPDATE job_postings SET deleted = true WHERE id = ?")
@SQLRestriction("deleted = false")
public class JobPosting {
    @Id
    private UUID id;
    private String title;
    private boolean deleted = Boolean.FALSE;
}`,
    interviewTrap: 'Native queries (@Query(value = "SELECT * FROM ...", nativeQuery = true)) NU respecta adnotarea @SQLRestriction! Trebuie sa filtrezi deleted = false manual in native queries.',
    keyTakeaway: 'Foloseste @SQLDelete si @SQLRestriction pentru o implementare curata si automata de soft delete in Hibernate 6.'
  },
  {
    id: 'spring-24',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Spring Cache, Redis si Prevenirea Cache Stampede',
    question: 'Cum functioneaza abstractizarea Spring Cache cu Redis si cum previi fenomenul de Cache Stampede (Dog-Piling)?',
    answer: 'Spring ofera abstractizarea @EnableCaching:\n- @Cacheable: Cauta valoarea in cache (Redis/Caffeine). Daca nu exista, executa metoda si pune rezultatul in cache.\n- @CacheEvict: Sterge intrarile din cache la modificari de date.\n- @CachePut: Actualizeaza datele in cache la fiecare executie.\n\nFenomenul Cache Stampede (Dog-Piling):\nCand o cheie foarte populara expira (TTL expirat) sau este invalidata, sute de cereri concurente gasesc cache miss in aceeasi milisecunda si trimit simultan acelasi query scump catre DB, cauzand spikes uriase de CPU si blocarea bazei de date.\n\nSolutie: Parametrul sync = true in @Cacheable.\nInstruieste cache provider-ul sa sincronizeze thread-urile local: un singur thread incarca din DB si populeaza cache-ul, iar restul thread-urilor asteapta rezultatul din cache.',
    codeSnippet: `@Service
public class JobCatalogService {
    // sync = true blocheaza celelalte thread-uri pana cand prima cerere populeaza cache-ul:
    @Cacheable(value = "popular_jobs", key = "#category", sync = true)
    public List<JobDto> getPopularJobs(String category) {
        return jobRepository.findTop50ByCategoryOrderByViewsDesc(category);
    }

    @CacheEvict(value = "popular_jobs", allEntries = true)
    public void clearCache() {
        // Curatare cache dupa import masiv
    }
}`,
    interviewTrap: 'Daca folosesti sync = true, retine ca nu functioneaza impreuna cu conditia unless din @Cacheable.',
    keyTakeaway: 'Seteaza sync = true pe date fierbinti pentru a proteja baza de date impotriva caderilor in cascada prin Cache Stampede.'
  },
  {
    id: 'spring-25',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: '@Async si Riscurile ThreadPool-ului Implicit',
    question: 'De ce este periculos sa folosesti @Async fara a configura un ThreadPoolTaskExecutor dedicat in Spring Boot?',
    answer: 'Implicit, daca adaugi @EnableAsync si nu declari un Bean de tip TaskExecutor, Spring foloseste SimpleAsyncTaskExecutor.\n\nRiscul Critic:\nSimpleAsyncTaskExecutor NU este un pool de thread-uri! El creeaza un NOU thread fizic de sistem de operare la fiecare invocare a metodei @Async. Sub un burst de 5.000 de cereri, va crea 5.000 de thread-uri de OS, epuizand memoria si provocand: java.lang.OutOfMemoryError: unable to create new native thread!\n\nBest Practice:\nConfigureaza intotdeauna un ThreadPoolTaskExecutor cu corePoolSize, maxPoolSize, queueCapacity si RejectedExecutionHandler clar (ex: CallerRunsPolicy).',
    codeSnippet: `@Configuration
@EnableAsync
public class AsyncConfig {
    @Bean(name = "customTaskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("AtsAsync-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}

@Service
public class ReportService {
    @Async("customTaskExecutor")
    public CompletableFuture<String> generatePdf() {
        return CompletableFuture.completedFuture("Gata");
    }
}`,
    interviewTrap: 'Contextul de securitate (SecurityContextHolder) este ThreadLocal si NU se propaga automat in thread-ul nou din @Async daca nu folosesti DelegatingSecurityContextAsyncTaskExecutor.',
    keyTakeaway: 'Defineste intotdeauna un ThreadPoolTaskExecutor cu limite de coada pentru a preveni colapsul memoriei JVM sub trafic mare.'
  },
  {
    id: 'spring-26',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Securizarea Endpoint-urilor Spring Boot Actuator',
    question: 'Ce riscuri de securitate prezinta Spring Boot Actuator si cum securizezi endpoint-urile in medii de cloud / Kubernetes?',
    answer: 'Spring Boot Actuator expune informatii critice despre aplicatie (/health, /metrics, /env, /heapdump, /beans, /prometheus).\n\nRiscuri:\nDaca endpoint-urile /actuator/env sau /actuator/heapdump sunt expuse pe internet fara autentificare, atacatorii pot extrage secrete, chei API de productie si parole de DB direct din memorie.\n\nBune Practici in Productie:\n1. Expune public DOAR /health:\nmanagement.endpoints.web.exposure.include=health,info,prometheus\n2. Separa portul de management de portul de business:\nmanagement.server.port=8081\nIn cloud/K8s, portul 8081 nu este mapat pe Ingress extern, fiind accesibil doar intern de scraperul Prometheus.\n3. Configureaza Liveness si Readiness Probes dedicate:\nmanagement.endpoint.health.probes.enabled=true.',
    codeSnippet: `management:
  server:
    port: 8081 # Port intern privat izolat
  endpoints:
    web:
      exposure:
        include: health, info, prometheus
  endpoint:
    health:
      probes:
        enabled: true
      show-details: when-authorized`,
    interviewTrap: 'Nu seta niciodata management.endpoints.web.exposure.include=* in aplicatii conectate la internet!',
    keyTakeaway: 'Izoleaza Actuator pe un port privat intern si expune doar probele de health si metricile Prometheus.'
  },
  {
    id: 'spring-27',
    category: 'SPRING',
    difficulty: 'USOR',
    title: 'BeanFactory vs ApplicationContext',
    question: 'Care sunt diferentele cheie dintre interfata BeanFactory si ApplicationContext in ecosistemul Spring?',
    answer: '1. BeanFactory:\n- Este interfata de baza a containerului IoC Spring.\n- Foloseste instantiere Lazy (intarziata): instantiaza un bean doar cand este apelat explicit getBean().\n- Consuma putina memorie, fiind util pentru dispozitive cu resurse extrem de limitate.\n\n2. ApplicationContext:\n- Este o interfata avansata care extinde BeanFactory.\n- Foloseste instantiere Eager la pornire pentru Singletons: creeaza toate bean-urile la pornirea aplicatiei, descoperind erorile de configurare instant (fail-fast).\n- Ofera functionalitati enterprise: Internationalizare (MessageSource), publicare de evenimente (ApplicationEventPublisher), integrare AOP transparenta, suport nativ pentru WebApplicationContext.',
    codeSnippet: `// BeanFactory (de baza, instantiere lazy):
BeanFactory factory = new DefaultListableBeanFactory();

// ApplicationContext (enterprise standard in Spring Boot):
ApplicationContext context = new AnnotationConfigApplicationContext(AppConfig.class);`,
    interviewTrap: 'ApplicationContext este standardul de facto; in Spring Boot lucrezi practic exclusiv cu implementari ale ApplicationContext.',
    keyTakeaway: 'ApplicationContext ofera instantiere Eager fail-fast si capabilitati enterprise complete peste simplul BeanFactory.'
  },
  {
    id: 'spring-28',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Spring Data Specifications pentru Cautari Dinamice',
    question: 'Cum folosesti JpaSpecificationExecutor si Specification<T> pentru a construi interogari dinamice complexe fara SQL Injection?',
    answer: 'Cand un ecran de cautare are multiple filtre optionale (titlu, status, data minima, salariu minim), scrierea de metode findBy... devine imposibila (combinatii infinite).\n\nSpring Data Specifications:\n1. Repository-ul extinde JpaSpecificationExecutor<T>.\n2. Fiecare filtru este o metoda care returneaza o instanta Specification<T>, folosind CriteriaBuilder din JPA.\n3. Filtrele se compun dinamic prin Specification.where().and() doar daca parametrul din request nu este null.\n4. Genereaza SQL corect si sigur, fara riscuri de SQL injection si cu typesafety total la compilare.',
    codeSnippet: `public class JobSpecifications {
    public static Specification<JobPosting> hasTitle(String title) {
        return (root, query, cb) -> 
            title == null ? null : cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%");
    }

    public static Specification<JobPosting> hasMinSalary(Integer minSalary) {
        return (root, query, cb) -> 
            minSalary == null ? null : cb.greaterThanOrEqualTo(root.get("salary"), minSalary);
    }
}

// In Service layer:
Specification<JobPosting> spec = Specification.where(JobSpecifications.hasTitle(title))
    .and(JobSpecifications.hasMinSalary(minSalary));
Page<JobPosting> results = jobRepo.findAll(spec, pageable);`,
    interviewTrap: 'Concatenarea de String-uri JPQL manuale in EntityManager este vulnerabila la SQL Injection si greu de testat. Specifications rezolva ambele probleme.',
    keyTakeaway: 'JpaSpecificationExecutor ofera o modalitate dinamica, tipizata si sigura de a compune interogari complexe.'
  },
  {
    id: 'spring-29',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: '@Configuration cu proxyBeanMethods = true vs false',
    question: 'Ce rol are proprietatea proxyBeanMethods din adnotarea @Configuration si ce inseamna Lite Mode in Spring?',
    answer: '1. proxyBeanMethods = true (Implicit in @Configuration):\nSpring creeaza o subclasa CGLIB proxy in jurul clasei de configurare. Daca o metoda adnotata cu @Bean apeleaza o alta metoda @Bean din aceeasi clasa (ex: dataSource()), proxy-ul intercepteaza apelul si returneaza instanta existenta din cache-ul de singleton-uri, garantand ca nu se creeaza instante duplicate.\n\n2. proxyBeanMethods = false (Modul "Lite"):\nSpring NU mai genereaza proxy CGLIB. Clasele sunt tratate ca simple instante Java. Fiecare apel intern direct la o metoda @Bean va rula codul metodei si va crea un obiect NOU in memorie! Modul Lite porneste mai rapid si foloseste mai putina memorie, fiind esential pentru Spring Native si compilare AOT (Ahead-of-Time).',
    codeSnippet: `@Configuration(proxyBeanMethods = false) // Lite mode: performanta de pornire sporita
public class AppSecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityService securityService(PasswordEncoder passwordEncoder) {
        // Injecteaza parametrul in loc sa apelezi passwordEncoder() direct!
        return new SecurityService(passwordEncoder);
    }
}`,
    interviewTrap: 'Daca ai proxyBeanMethods = false si apelezi direct metoda this.passwordEncoder() in interiorul altui @Bean, vei obtine doua instante complet diferite in loc de un singur singleton!',
    keyTakeaway: 'Foloseste proxyBeanMethods = false cand injectezi dependintele ca parametri in metodele @Bean pentru o pornire mai rapida.'
  },
  {
    id: 'spring-30',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Stateless Session si Dezactivarea CSRF in REST APIs',
    question: 'De ce se dezactiveaza CSRF (Cross-Site Request Forgery) in Spring Security atunci cand construiesti un REST API stateless bazat pe JWT?',
    answer: 'Atacurile CSRF functioneaza DOAR atunci cand browser-ul trimite automat credentialele de autentificare impreuna cu cererea (de exemplu: Cookie-uri de sesiune JSESSIONID).\n\nIn arhitecturile REST Stateless:\n1. Serverul nu mentine sesiuni HTTP pe disc sau in memorie (SessionCreationPolicy.STATELESS).\n2. Clientul trimite token-ul JWT in mod explicit in header-ul: Authorization: Bearer <token>.\n3. Browserul unui utilizator pacalit sa dea click pe un link malitios de pe un site tert NU va atasa niciodata header-ul Authorization automat (fara cookie de sesiune).\n\nPrin urmare, protectia CSRF devine inutila pentru API-uri pure bazate pe token-uri si este dezactivata in mod legitim.',
    codeSnippet: `@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(AbstractHttpConfigurer::disable) // Sigur pentru REST stateless JWT
        .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .anyRequest().authenticated()
        )
        .build();
}`,
    interviewTrap: 'Daca API-ul tau foloseste JWT stocat intr-un cookie HttpOnly trimis automat de browser, protectia CSRF este din nou OBLIGATORIE!',
    keyTakeaway: 'Dezactiveaza CSRF doar daca clientii transmit token-ul in headere custom (Authorization: Bearer) si nu prin cookie-uri automate.'
  },
  {
    id: 'spring-31',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Validare Declarativa si Custom ConstraintValidator in Spring',
    question: 'Cum creezi o adnotare custom de validare (ex: @ValidCnp sau @ValidIban) folosind Jakarta Bean Validation in Spring Boot?',
    answer: 'Pentru a crea o validare personalizata:\n1. Creezi adnotarea custom adnotata cu @Constraint(validatedBy = CnpValidator.class).\n2. Implementezi interfata ConstraintValidator<ValidCnp, String> cu metoda isValid().\n3. Aplici adnotarea pe campul dorit din DTO si adaugi @Valid pe @RequestBody in Controller.\n4. La eroare, Spring arunca MethodArgumentNotValidException, pe care o prinzi in @RestControllerAdvice.',
    codeSnippet: `@Target({ElementType.FIELD})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = CnpValidator.class)
public @interface ValidCnp {
    String message() default "Format CNP invalid";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}

public class CnpValidator implements ConstraintValidator<ValidCnp, String> {
    @Override
    public boolean isValid(String cnp, ConstraintValidatorContext context) {
        if (cnp == null) return false;
        return cnp.matches("^[1-8]\\\\d{12}$"); // Verificare format de baza
    }
}`,
    interviewTrap: 'Daca uiti sa adaugi @Valid sau @Validated in fata parametrului @RequestBody din Controller, validarea din DTO nu se va executa deloc!',
    keyTakeaway: 'ConstraintValidator permite reguli de validare complexe si reutilizabile, perfect integrate cu pipeline-ul Spring MVC.'
  },
  {
    id: 'spring-32',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Spring Cloud Gateway vs Nginx Reverse Proxy',
    question: 'Care sunt avantajele specifice ale utilizarii Spring Cloud Gateway fata de un server Nginx traditional?',
    answer: '1. Spring Cloud Gateway:\n- Construit pe Project Reactor si Netty (arhitectura non-blocanta asincrona).\n- Integrare nativa si fluida cu ecosistemul Spring: filtre scrise in Java, acces la ApplicationContext si Spring Security.\n- Filtrare dinamica: poti valida token-uri JWT, consulta Redis pentru Rate Limiting per utilizator, si manipula headere prin cod Java usor de testat unitar.\n\n2. Nginx:\n- Scris in C pur, ofera throughput brut extrem si latenta minima pentru rutare statica si terminare TLS/SSL.\n- Configurarea logicii complexe de autorizare sau business necesita scripturi Lua sau module terte.\n\nIn productie moderna: Se plaseaza adesea Nginx/Cloudflare la intrare (TLS termination) si Spring Cloud Gateway in spate pentru rutare inteligenta si securitate de microservicii.',
    codeSnippet: `@Bean
public RouteLocator customRoutes(RouteLocatorBuilder builder) {
    return builder.routes()
        .route("job-service", r -> r.path("/api/jobs/**")
            .filters(f -> f.stripPrefix(1)
                           .addRequestHeader("X-Gateway-Trace", UUID.randomUUID().toString()))
            .uri("lb://job-service"))
        .build();
}`,
    interviewTrap: 'Spring Cloud Gateway nu ruleaza pe Tomcat clasic; daca adaugi dependinta spring-boot-starter-web blocanta in acelasi proiect cu Gateway, aplicatia va refuza sa porneasca!',
    keyTakeaway: 'Spring Cloud Gateway este alegerea ideala pentru logica dinamica de microservicii scrisa direct in Java.'
  },
  {
    id: 'spring-33',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Service Discovery: Eureka vs Kubernetes Service DNS',
    question: 'De ce a scazut popularitatea Netflix Eureka in favoarea Kubernetes Service DNS in arhitecturile moderne de microservicii?',
    answer: '1. Modelul Netflix Eureka:\n- Client-Side Discovery: Fiecare instanta de microserviciu trebuie sa aiba client Eureka inclus in cod, trimite periodic heartbeat-uri la serverul Eureka si descarca local tot registrul de servicii.\n- Adauga dependinte suplimentare in codul Java si un cluster separat de servere Eureka de intretinut.\n\n2. Modelul Kubernetes DNS:\n- Platform-Level / Server-Side Discovery: Kubernetes ofera nativ servicii DNS interne (ex: http://job-service:8080).\n- Microserviciul nu stie si nu-i pasa de discovery; face un simplu apel HTTP catre un hostname, iar kube-proxy / CoreDNS rezolva IP-ul pod-ului si distribuie traficul.\n- Functioneaza agnostica la limbaj (Java, Go, Python, Node.js).',
    codeSnippet: `// In Kubernetes, apelul este un simplu URL DNS intern standard:
@Bean
public RestClient jobServiceClient() {
    return RestClient.builder()
        .baseUrl("http://job-service.production.svc.cluster.local:8080")
        .build();
}`,
    interviewTrap: 'Cand migrezi de pe Eureka pe Kubernetes, poti elimina complet dependintele spring-cloud-starter-netflix-eureka-client din pom.xml.',
    keyTakeaway: 'Kubernetes gestioneaza Service Discovery nativ la nivel de infrastructura, facand solutiile client-side precum Eureka redundante.'
  },
  {
    id: 'spring-34',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Resilience4j Circuit Breaker: Stari si Tranzitie',
    question: 'Cum functioneaza masina de stari a unui Circuit Breaker in Resilience4j si cum previne caderile in cascada (Cascading Failures)?',
    answer: 'Circuit Breaker-ul are 3 stari principale:\n1. CLOSED (Normal): Toate cererile trec catre serviciul extern dependent. Resilience4j masoara rata de esec intr-o fereastra glisanta (sliding window, ex: ultimele 100 de apeluri).\n2. OPEN (Blocat): Daca procentul de erori depaseste pragul configurat (ex: 50%), circuitul trece in OPEN. Toate cererile ulterioare sunt REPINSE IMEDIAT fara a mai apela serviciul extern, invocand metoda de fallback. Aceasta ofera timp serviciului cazut sa isi revina si protejeaza resursele apelantului.\n3. HALF-OPEN (Testare): Dupa o perioada de asteptare (ex: 15s), circuitul permite unui numar mic de cereri de proba (ex: 10) sa treaca. Daca au succes, revine in CLOSED; daca pica, revine in OPEN.',
    codeSnippet: `@Service
public class ExternalPaymentClient {
    @CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
    public PaymentResponse pay(PaymentRequest req) {
        return restClient.post().uri("/pay").body(req).retrieve().body(PaymentResponse.class);
    }

    // Metoda de fallback trebuie sa aiba aceeasi semnatura + parametrul Throwable:
    public PaymentResponse paymentFallback(PaymentRequest req, Throwable t) {
        log.warn("Serviciul de plata indisponibil, folosesc fallback: {}", t.getMessage());
        return new PaymentResponse("PENDING_RETRY", req.transactionId());
    }
}`,
    interviewTrap: 'Metoda fallbackMethod TREBUIE sa fie declarata in aceeasi clasa, sa aiba exact aceeasi semnatura de parametri ca metoda originala, plus un parametru suplimentar de tip Throwable la final!',
    keyTakeaway: 'Circuit Breaker-ul previne blocarea firelor de executie ale aplicatiei tale atunci cand un serviciu downstream este cazut.'
  },
  {
    id: 'spring-35',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Distributed Tracing in Spring Boot 3 cu Micrometer Tracing',
    question: 'Ce sunt TraceId si SpanId si cum functioneaza propagarea de context W3C prin microservicii?',
    answer: 'Distributed Tracing permite urmarirea unei cereri care traverseaza multiple microservicii:\n1. TraceId: Un identificator unic global generat la intrarea cererii in sistem (ex: API Gateway) si transmis prin toate microserviciile. Toate actiunile dintr-un flux au acelasi TraceId.\n2. SpanId: Identificator unic pentru fiecare pas individual (un apel HTTP, un query DB, un mesaj Kafka).\n\nPropagare:\nIn Spring Boot 3, Micrometer Tracing foloseste standardul W3C TraceContext prin header-ul HTTP traceparent (ex: traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01). Micrometer injecteaza automat traceId si spanId in MDC (Mapped Diagnostic Context), astfel incat fiecare linie de log contine aceste id-uri pentru corelare rapida in Grafana Loki sau Kibana.',
    codeSnippet: `# In application.yml:
management:
  tracing:
    sampling:
      probability: 1.0 # 100% trace sampling in test, 0.1 in productie
logging:
  pattern:
    level: "%5p [\${spring.application.name:},%X{traceId:-},%X{spanId:-}]"`,
    interviewTrap: 'In Spring Boot 2 se folosea Spring Cloud Sleuth, dar in Spring Boot 3 Sleuth a fost complet inlocuit cu Micrometer Tracing.',
    keyTakeaway: 'Micrometer Tracing asigura vizibilitate totala end-to-end pe fluxurile distribuite si injecteaza traceId in toate log-urile.'
  },
  {
    id: 'spring-36',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Saga Pattern: Choreography vs Orchestration',
    question: 'Cum garantezi consistenta datelor in tranzactii distribuite peste microservicii folosind Saga Pattern?',
    answer: 'Tranzactiile traditionale 2PC (Two-Phase Commit) nu scaleaza in microservicii. Saga Pattern sparge tranzactia globala intr-o serie de tranzactii locale:\nFiecare pas isi actualizeaza propria baza de date. Daca un pas esueaza, Saga executa Tranzactii Compensatorii (Compensating Transactions) in ordine inversa pentru a anula modificarile anterioare.\n\nModele de Implementare:\n1. Choreography (Coregrafie):\nFiecare microserviciu emite un eveniment in Kafka cand termina pasul sau, iar urmatorul serviciu reactioneaza. Nu exista coordonator central. Avantaj: Decuplare totala. Dezavantaj: Greu de urmarit si depanat cand sunt multi pasi.\n2. Orchestration (Orchestrare):\nUn serviciu dedicat (Saga Orchestrator) trimite comenzi fiecarui participant si asteapta raspunsuri. Daca un participant semnaleaza eroare, Orchestratorul trimite explicit comenzi de rollback compensatoriu catre serviciile anterioare.',
    codeSnippet: `// Flux Saga Orchestrator:
// 1. OrderService creeaza comanda in starea PENDING
// 2. Trimite comanda: ReserveStockCommand -> InventoryService
// 3. Trimite comanda: ProcessPaymentCommand -> PaymentService
// 4. Daca Payment pica -> Orchestratorul trimite ReleaseStockCommand catre InventoryService (Compensare)`,
    interviewTrap: 'Tranzactiile compensatorii nu pot garanta rollback fizic clasic; de exemplu, un email trimis nu poate fi "sters", ci se trimite un email de rectificare.',
    keyTakeaway: 'Foloseste Saga Orchestration pentru fluxuri complexe de business unde transparenta si auditul starii sunt critice.'
  },
  {
    id: 'spring-37',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Transactional Outbox Pattern si CDC cu Debezium',
    question: 'Cum rezolva Transactional Outbox Pattern problema de "Dual-Write" intre baza de date si Kafka?',
    answer: 'Problema Dual-Write:\nDaca salvezi datele in PostgreSQL si apoi trimiti un mesaj in Kafka din aceeasi metoda Java, aplicatia poate pica exact intre cele doua operatii. Daca pica dupa salvarea DB dar inainte de Kafka, mesajul se pierde! Daca inversezi ordinea si DB pica, ai trimis un mesaj fantoma.\n\nSolutia Transactional Outbox:\n1. Salvezi entitatea de business si mesajul destinat brokerului (intr-un tabel outbox) in ACEEASI tranzactie locala SQL atomica din baza de date.\n2. Tranzactia garanteaza ca daca datele se salveaza, si mesajul din outbox este salvat garantat.\n3. Un proces extern de CDC (Change Data Capture) precum Debezium citeste WAL-ul (Write-Ahead Log) bazei de date PostgreSQL si publica evenimentul in Kafka cu garantie At-Least-Once, fara a incetini aplicatia.',
    codeSnippet: `@Transactional
public void createOrder(OrderRequest req) {
    Order order = orderRepo.save(new Order(req));

    // Salvare in aceeasi tranzactie DB locala:
    OutboxEvent event = new OutboxEvent(
        "OrderCreated",
        order.getId().toString(),
        objectMapper.writeValueAsString(order)
    );
    outboxRepo.save(event);
}`,
    interviewTrap: 'Trimiterea mesajului Kafka dintr-o metoda @Transactional obisnuita NU este atomica; Kafka nu participa in tranzactiile RDBMS!',
    keyTakeaway: 'Transactional Outbox este singurul mod 100% sigur de a sincroniza modificarile din baza de date cu mesageria asincrona.'
  },
  {
    id: 'spring-38',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Implementarea Idempotentei in API-uri REST cu Redis',
    question: 'Cum implementezi un mecanism de Idempotenta pentru operatiuni POST de plata folosind un Idempotency Key si Redis?',
    answer: 'O cerere este Idempotenta daca apelarea ei de mai multe ori produce acelasi efect ca un singur apel.\n\nImplementare cu Redis:\n1. Clientul genereaza un UUID unic si il trimite in header-ul: Idempotency-Key: <uuid>.\n2. Un filtru sau interceptor Spring intercepteaza cererea si executa comanda atomica Redis: SET lock:idempotency:{key} "PROCESSING" NX EX 120 (Set if Not Exists cu TTL de 2 minute).\n3. Daca cheia exista deja:\n   - Daca valoarea este "PROCESSING", returneaza HTTP 409 Conflict sau HTTP 425 Too Early (cererea se proceseaza deja in paralel).\n   - Daca valoarea este raspunsul salvat complet, returneaza direct raspunsul memorat din Redis cu HTTP 200 OK fara a mai taxa clientul!\n4. Daca operatia a reusit, salveaza corpul raspunsului JSON in Redis pe aceeasi cheie.',
    codeSnippet: `@Component
public class IdempotencyFilter extends OncePerRequestFilter {
    @Autowired private StringRedisTemplate redis;

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        String key = req.getHeader("Idempotency-Key");
        if (key != null) {
            Boolean acquired = redis.opsForValue().setIfAbsent("idem:" + key, "PROCESSING", Duration.ofMinutes(2));
            if (Boolean.FALSE.equals(acquired)) {
                res.setStatus(HttpServletResponse.SC_CONFLICT);
                res.getWriter().write("{\"error\": \"Cerere duplicata in curs de procesare\"}");
                return;
            }
        }
        chain.doFilter(req, res);
    }
}`,
    interviewTrap: 'Nu uita sa setezi mereu un TTL (expirare) pe cheia Redis; altfel, in caz de crash inainte de finalizare, cheia va ramane blocata pentru totdeauna.',
    keyTakeaway: 'Idempotency Keys previn platile dublate si crearea de comenzi duplicate in caz de retele instabile sau dublu-click.'
  },
  {
    id: 'spring-39',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Spring Kafka: Reincercari Non-Blocante si Dead Letter Topic (DLT)',
    question: 'Cum gestionezi erorile la consumul de mesaje in Spring Kafka fara a bloca partitia si cum functioneaza @RetryableTopic?',
    answer: 'Problema la Reincercare Clasica in Kafka:\nDaca un consumator pica pe un mesaj si foloseste sleep() sau retry blocant, offset-ul partitiei nu avanseaza, iar TOATE celelalte mesaje din acea partitie raman blocate in spate!\n\nSolutie: @RetryableTopic (Reincercari Non-Blocante):\n1. Spring Kafka creeaza automat topicuri intermediare de reincercare (ex: orders-retry-1000, orders-retry-2000) si un topic final de mesaje esuate: orders-dlt (Dead Letter Topic).\n2. Daca procesarea esueaza, mesajul este publicat imediat in topicul de retry corespunzator, iar offset-ul din topicul principal avanseaza instantaneu, permitand procesarea mesajelor urmatoare.\n3. Cand toate reincercarile sunt epuizate, mesajul ajunge in DLT, unde poate fi inspectat sau reprocesat manual.',
    codeSnippet: `@Service
public class OrderEventConsumer {
    @RetryableTopic(
        attempts = "3",
        backoff = @Backoff(delay = 1000, multiplier = 2.0),
        dltStrategy = DltStrategy.FAIL_ON_ERROR
    )
    @KafkaListener(topics = "orders", groupId = "order-consumers")
    public void consumeOrder(OrderEvent event) {
        orderProcessor.process(event);
    }

    @DltHandler
    public void handleDlt(OrderEvent event, @Header(KafkaHeaders.EXCEPTION_MESSAGE) String error) {
        log.error("Mesajul {} a esuat definitiv si a ajuns in DLT: {}", event.id(), error);
    }
}`,
    interviewTrap: 'Daca arunci o exceptie nerecuperabila (ex: payload JSON corupt), configureaza exclude = {DeserializationException.class} pentru a trimite mesajul direct in DLT fara reincercari inutile.',
    keyTakeaway: '@RetryableTopic asigura rezilienta mesajelor fara a incetini sau bloca procesarea partitiei principale.'
  },
  {
    id: 'spring-40',
    category: 'SPRING',
    difficulty: 'USOR',
    title: 'RestClient vs WebClient vs RestTemplate in Spring Boot 3.2+',
    question: 'Care este diferenta dintre RestClient, WebClient si RestTemplate si care este clientul HTTP recomandat in prezent?',
    answer: '1. RestTemplate: Clientul clasic sincron blocant introdus in Spring 3. In prezent este in Maintenance Mode (nu mai primeste capabilitati noi).\n2. WebClient: Clientul reactiv non-blocant din Spring WebFlux bazat pe Project Reactor (Mono/Flux). Excelent pentru streaming si fluxuri complet reactive, dar adauga complexitate inutila daca aplicatia foloseste thread-uri clasice sau Virtual Threads.\n3. RestClient (Standardul Nou din Spring Boot 3.2+):\n- Este un client sincron fluent si modern care ofera aceeasi interfata fluida eleganta ca WebClient, dar ruleaza direct pe infrastructura simpla blocanta.\n- Se combina ideal cu Virtual Threads din Java 21.',
    codeSnippet: `// RestClient in Spring Boot 3.2+:
RestClient restClient = RestClient.builder()
    .baseUrl("https://api.github.com")
    .defaultHeader("Accept", "application/json")
    .build();

List<RepoDto> repos = restClient.get()
    .uri("/users/{user}/repos", "google")
    .retrieve()
    .body(new ParameterizedTypeReference<List<RepoDto>>() {});`,
    interviewTrap: 'Nu folosi WebClient intr-o aplicatie pur servlet decat daca ai nevoie de capabilitati specifice reactive; RestClient este alegerea moderna oficiala.',
    keyTakeaway: 'Foloseste RestClient in Spring Boot 3.2+ pentru apeluri HTTP sincrone curate si lizibile.'
  },
  {
    id: 'spring-41',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: '@Scheduled in Cluster si Lock-uri Distribuite cu ShedLock',
    question: 'De ce @Scheduled este problematic cand rulezi mai multe instante ale aplicatiei si cum previne ShedLock executia paralela?',
    answer: 'Problema in Productie Multi-Instanta:\nCand scalezi aplicatia orizontal la 3 sau mai multe replici in Kubernetes, fiecare instanta contine propriul sau scheduler Spring. O metoda adnotata cu @Scheduled(cron = "0 0 * * * *") se va executa de 3 ori simultan in exact aceeasi secunda, ducand la dublarea rapoartelor sau incarcari concurente de date!\n\nSolutie: ShedLock\nShedLock adauga un lock distribuit folosind o tabela simpla dintr-o baza de date partajata (PostgreSQL) sau Redis.\n1. Cand vine timpul executiei, fiecare instanta incearca sa obtina lock-ul (INSERT / UPDATE in tabela shedlock).\n2. O singura instanta reuseste sa castige lock-ul si executa codul.\n3. Celelalte instante gasesc lock-ul activ si renunta pasiv la executie.',
    codeSnippet: `@Service
public class CleanupTasks {
    // lockAtMostFor: elibereaza automat lock-ul daca nodul moare in timpul executiei
    // lockAtLeastFor: previne ca alt nod sa ruleze job-ul daca ceasurile nodurilor au mici decalaje
    @Scheduled(cron = "0 0 2 * * ?")
    @SchedulerLock(name = "archiveOldJobsTask", lockAtMostFor = "15m", lockAtLeastFor = "5m")
    public void archiveOldJobs() {
        jobArchiveService.archiveOlderThan(30);
    }
}`,
    interviewTrap: 'Daca setezi lockAtMostFor prea mic si executia dureaza mai mult, alt nod poate prelua executia inainte ca primul sa fi terminat!',
    keyTakeaway: 'Foloseste intotdeauna ShedLock pe orice metoda @Scheduled intr-un mediu scalat orizontal.'
  },
  {
    id: 'spring-42',
    category: 'SPRING',
    difficulty: 'USOR',
    title: 'Spring Profiles si Ierarhia de Incarcare a Proprietatilor',
    question: 'Care este ordinea de prioritate a proprietatilor de configurare in Spring Boot si cum activezi profilurile?',
    answer: 'Proprietatile din Spring Boot pot proveni din multiple surse, ordonate strict de la cea mai mare prioritate la cea mai mica:\n1. Argumente Command Line (ex: --server.port=9090)\n2. Variabile de Mediu ale Sistemului de Operare (ex: SERVER_PORT=9090)\n3. Fisiere specifice de profil din exteriorul JAR-ului (config/application-prod.yml)\n4. Fisiere specifice de profil din interiorul JAR-ului (application-prod.yml)\n5. Fisierul de baza din interiorul JAR-ului (application.yml)\n\nActivare Profiluri:\n- Variabila de mediu: SPRING_PROFILES_ACTIVE=prod\n- Argument JVM: -Dspring.profiles.active=prod.',
    codeSnippet: `@Profile("prod")
@Configuration
public class ProductionCloudConfig {
    @Bean
    public S3Client s3Client() {
        return S3Client.create();
    }
}`,
    interviewTrap: 'Variabilele de mediu ale sistemului de operare suprascriu intotdeauna valorile scrise in fisierele application.yml din interiorul JAR-ului.',
    keyTakeaway: 'Configuratiile specifice de mediu se injecteaza prin variabile de mediu pentru a respecta metodologia Twelve-Factor App.'
  },
  {
    id: 'spring-43',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Hibernate Dirty Checking: Mecanism Intern si Cost de Memorie',
    question: 'Cum detecteaza Hibernate modificarile unei entitati fara apel explicit de save() si ce impact are asupra performantei?',
    answer: 'Mecanismul de Dirty Checking:\n1. Cand o entitate este incarcata din DB de catre EntityManager, Hibernate stocheaza o copie integrala a starii initiale ("Loaded State Snapshot") in Persistence Context (First Level Cache).\n2. Pe durata tranzactiei, daca modifici un camp (ex: user.setEmail("nou@test.com")), nu este nevoie sa apelezi repo.save().\n3. La momentul flush() (inainte de COMMIT sau inainte de un query nou), Hibernate parcurge toate entitatile managed si compara camp cu camp starea curenta cu snapshot-ul initial.\n4. Daca gaseste diferente, construieste si executa comanda SQL UPDATE.\n\nCost de Performanta:\nFiecare entitate incarcata consuma dublul memoriei (obiectul + snapshot-ul) si adauga timp de CPU la faza de comparatie.',
    codeSnippet: `@Service
public class UserService {
    @Transactional
    public void updateUserStatus(UUID id, Status status) {
        User user = userRepo.findById(id).orElseThrow();
        user.setStatus(status); // Se salveaza automat la commit prin Dirty Checking!
        // userRepo.save(user); // Redundant si nenecesar!
    }
}`,
    interviewTrap: 'Pentru operatii mari de citire (rapoarte), foloseste intotdeauna @Transactional(readOnly = true) pentru ca Hibernate sa dezactiveze generarea de snapshots si Dirty Checking-ul.',
    keyTakeaway: 'Dirty Checking salveaza modificarile automat, dar foloseste @Transactional(readOnly = true) pentru citiri pentru a elibera memoria.'
  },
  {
    id: 'spring-44',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Spring Data JPA Projections: Interfete vs Records',
    question: 'Care sunt avantajele utilizarii Record DTO Projections fata de incarcarea entitatilor complete in Spring Data JPA?',
    answer: 'Cand ai nevoie doar de 3 coloane dintr-o tabela cu 30 de coloane, incarcarea entitatii complete @Entity este o risipa masiva de resurse.\n\nAvantajele Record Projections (constructor expression):\n1. Query SQL Optimizat: Hibernate genereaza SELECT id, title, salary FROM ... cerand exclusiv coloanele necesare.\n2. Fara First Level Cache: Obiectele Record nu sunt atasate la Persistence Context, nu participa la Dirty Checking si elibereaza memoria imediat.\n3. Imutabilitate: Clasa Java Record este imutabila prin definitie si thread-safe.\n4. Zero probleme de tip LazyInitializationException sau N+1 Queries.',
    codeSnippet: `// Record DTO:
public record JobSummaryDto(UUID id, String title, Integer salary) {}

// In Repository folosind Constructor Expression JPQL:
public interface JobRepository extends JpaRepository<JobPosting, UUID> {
    @Query("SELECT new com.ats.dto.JobSummaryDto(j.id, j.title, j.salary) FROM JobPosting j WHERE j.active = true")
    List<JobSummaryDto> findAllActiveSummaries();
}`,
    interviewTrap: 'Daca folosesti Interface Projection in loc de Record, Spring foloseste dynamic proxies care pot avea un mic overhead de reflexie la liste foarte mari.',
    keyTakeaway: 'Foloseste Record DTO Projections cu constructor expression pentru toate operatiunile de citire si cautare.'
  },
  {
    id: 'spring-45',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Securitate la Nivel de Metoda: @PreAuthorize si SpEL',
    question: 'Cum folosesti @PreAuthorize cu expresii SpEL pentru a asigura ca un utilizator isi poate modifica exclusiv propriile date?',
    answer: 'Spring Security ofera autorizare declarativa la nivel de metoda prin adnotarea @PreAuthorize si SpEL (Spring Expression Language).\n\nCapabilitati SpEL:\n1. Verificare de roluri standard: @PreAuthorize("hasRole(\'ADMIN\')")\n2. Verificare de context de business bazata pe argumentele metodei: poti accesa argumentele folosind sintaxa #numeParametru.\n3. Comparare cu utilizatorul logat: authentication.principal sau authentication.name.\n\nPentru a activa aceste adnotari, configureaza @EnableMethodSecurity pe o clasa de configurare.',
    codeSnippet: `@Configuration
@EnableMethodSecurity // Activeaza @PreAuthorize si @PostAuthorize
public class MethodSecurityConfig {}

@Service
public class ProfileService {
    // Doar utilizatorul insusi sau un administrator are acces:
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public void updateBio(UUID userId, String newBio) {
        userRepo.updateBio(userId, newBio);
    }
}`,
    interviewTrap: 'Daca apelezi o metoda @PreAuthorize intern din aceeasi clasa (self-invocation), securitatea este ocolita complet din cauza limitarilor de proxy AOP!',
    keyTakeaway: '@PreAuthorize combinat cu SpEL ofera securitate granulara la nivel de resursa si parametru de business.'
  },
  {
    id: 'spring-46',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Migrari de Schema de Date cu Flyway: Bune Practici',
    question: 'Cum functioneaza Flyway pentru versionarea bazei de date si ce cauzeaza eroarea de Checksum Mismatch in productie?',
    answer: 'Flyway gestioneaza schimbarile de schema SQL incrementale:\n1. Fisierele sunt denumite dupa conventia: V{Versiune}__{Descriere}.sql (ex: V1__create_users.sql).\n2. Flyway mentine o tabela de istoric flyway_schema_history unde salveaza versiunea, data rularii si un CHECKSUM (hash SHA-256) al continutului fisierului SQL.\n\nEroarea Checksum Mismatch:\nDaca modifici chiar si un singur caracter sau spatiu dintr-un fisier de migrare V... care a rulat deja intr-un mediu (ex: pe dev sau staging), Flyway calculeaza noul hash, detecteaza ca nu coincide cu cel din flyway_schema_history si REFUZA sa porneasca aplicatia!\n\nRegula de Aur:\nNu modifica niciodata un fisier de migrare existent dupa ce a fost impins in Git! Creeaza intotdeauna o versiune NOUA (ex: V2__add_index.sql).',
    codeSnippet: `-- V1__init_jobs.sql
CREATE TABLE job_postings (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- V2__add_status_and_index.sql (Migrare NOUA, nu modifica V1!)
ALTER TABLE job_postings ADD COLUMN status VARCHAR(50) DEFAULT 'OPEN';
CREATE INDEX idx_jobs_status ON job_postings(status);`,
    interviewTrap: 'Nu folosi comanda flyway:repair decat pentru a corecta un esec accidental local; in productie, migrarile trebuie sa fie strict imutabile.',
    keyTakeaway: 'Scripturile de migrare Flyway sunt imutabile: orice schimbare sau corectie necesita o versiune incrementala noua.'
  },
  {
    id: 'spring-47',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Rate Limiting cu Algoritmul Token Bucket si Bucket4j',
    question: 'Cum protejezi un API Spring Boot impotriva atacurilor de tip DoS folosind algoritmul Token Bucket?',
    answer: 'Algoritmul Token Bucket:\n1. O "galeata" (bucket) are o capacitate maxima de token-uri (ex: 20).\n2. Token-urile sunt reincarcate continuu la o rata fixa (ex: 10 token-uri pe secunda).\n3. Fiecare cerere HTTP a unui client consuma 1 token.\n4. Daca galeata are token-uri, cererea este acceptata.\n5. Daca galeata este goala, cererea este respinsa instantaneu cu HTTP 429 Too Many Requests si header-ul Retry-After indicand secundele pana la reumplere.\n\nImplementare in Spring:\nSe foloseste biblioteca Bucket4j integrata intr-un HandlerInterceptor sau OncePerRequestFilter, identificand clientul dupa adresa IP sau dupa cheia API.',
    codeSnippet: `@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private Bucket createNewBucket() {
        Bandwidth limit = Bandwidth.classic(20, Refill.greedy(10, Duration.ofSeconds(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) {
        String clientIp = req.getRemoteAddr();
        Bucket bucket = buckets.computeIfAbsent(clientIp, k -> createNewBucket());
        if (bucket.tryConsume(1)) {
            return true;
        } else {
            res.setStatus(429);
            res.setHeader("Retry-After", "1");
            return false;
        }
    }
}`,
    interviewTrap: 'O mapa ConcurrentHashMap stocheaza starea doar in memoria instantei curente; pentru aplicatii multi-nod ai nevoie de Bucket4j cu suport Redis.',
    keyTakeaway: 'Token Bucket permite mici burst-uri de trafic legitim, dar blocheaza ferm abuzurile si atacurile DoS.'
  },
  {
    id: 'spring-48',
    category: 'SPRING',
    difficulty: 'MEDIU',
    title: 'Custom Jackson Serialization si @JsonComponent',
    question: 'Cum configurezi serializarea si deserializarea personalizata a formatelor de date folosind adnotarea @JsonComponent?',
    answer: 'Cand lucrezi cu formate speciale de date (ex: sume monetare rotunjite strict, numere mascate de carduri bancare sau conversii speciale pentru Instant/Date):\n\nAdnotarea @JsonComponent:\nIn Spring Boot, @JsonComponent este o adnotare specializata care inregistreaza automat o clasa ce contine JsonObjectSerializer si JsonObjectDeserializer in ObjectMapper-ul Jackson gestionat de Spring, fara a fi nevoie de configurari manuale de SimpleModule.\n\nOfera decuplare totala si asigura ca serializarea se aplica uniform pe toate endpoint-urile REST ale aplicatiei.',
    codeSnippet: `@JsonComponent
public class MoneyJsonComponent {
    public static class Serializer extends JsonObjectSerializer<BigDecimal> {
        @Override
        protected void serializeObject(BigDecimal value, JsonGenerator jgen, SerializerProvider provider)
                throws IOException {
            // Rotunjire la 2 zecimale si formatare standard
            jgen.writeString(value.setScale(2, RoundingMode.HALF_UP).toPlainString() + " RON");
        }
    }
}`,
    interviewTrap: 'Daca creezi un ObjectMapper nou manual folosind new ObjectMapper() in cod, acesta NU va contine componentele @JsonComponent inregistrate de Spring!',
    keyTakeaway: '@JsonComponent simplifica inregistrarea serializatoarelor Jackson personalizate in ApplicationContext.'
  },
  {
    id: 'spring-49',
    category: 'SPRING',
    difficulty: 'USOR',
    title: 'Graceful Shutdown in Spring Boot si Kubernetes',
    question: 'Cum configurezi Graceful Shutdown in Spring Boot si ce rol are in prevenirea erorilor HTTP 502/504 la deploy?',
    answer: 'La oprirea unui pod in Kubernetes (rolling update sau scaling down), Kubernetes trimite semnalul SIGTERM catre aplicatie.\n\nFara Graceful Shutdown:\nTomcat opreste procesul instantaneu. Toate cererile HTTP active ale utilizatorilor sunt intrerupte violent la jumatate, generand erori HTTP 502 Bad Gateway sau conexiuni TCP resetate.\n\nCu Graceful Shutdown (Spring Boot):\n1. La primirea SIGTERM, serverul web inceteaza imediat sa mai accepte conexiuni noi.\n2. Permite cererilor in-flight (aflate deja in curs de procesare) sa se finalizeze cu succes.\n3. Asteapta pana la atingerea limitei maxime configurate (timeout-per-shutdown-phase), dupa care inchide aplicatia curat.',
    codeSnippet: `# In application.yml:
server:
  shutdown: graceful

spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s # Timp acordat cererilor active sa finalizeze`,
    interviewTrap: 'Daca ai task-uri de background asincrone @Async, asigura-te ca setezi executor.setWaitForTasksToCompleteOnShutdown(true) pe ThreadPool.',
    keyTakeaway: 'Graceful Shutdown este obligatoriu pentru rolling updates fara downtime (Zero-Downtime Deployments).'
  },
  {
    id: 'spring-50',
    category: 'SPRING',
    difficulty: 'DIFICIL',
    title: 'Virtual Threads in Spring Boot 3.2+ si Java 21',
    question: 'Cum activezi Virtual Threads in Spring Boot 3.2+, cum functioneaza sub capota si cum influenteaza nevoia de Spring WebFlux?',
    answer: 'Activare simpla:\nIn application.yml: spring.threads.virtual.enabled: true (necesita Java 21+).\n\nCum functioneaza sub capota:\n1. Serverul Tomcat aloca un Virtual Thread (Carrier thread dinamic) pentru fiecare request HTTP primit.\n2. Cand metoda efectueaza o operatiune I/O blocanta (query catre PostgreSQL prin JDBC, apel HTTP prin RestClient), Virtual Thread-ul este "unmounted" de pe thread-ul fizic de sistem de operare, permitand acelui thread de OS sa preia alte mii de cereri.\n3. Cand raspunsul de la DB/retea soseste, Virtual Thread-ul este reluat instantaneu.\n\nImpactul asupra Spring WebFlux:\nVirtual Threads ofera un throughput urias similar cu programarea reactiva (WebFlux), dar pastrand modelul clasic procedural simplu de cod sincron (imperativ), usor de debugat si compatibil cu JDBC si Spring Data JPA traditional!',
    codeSnippet: `# Activare Virtual Threads in Spring Boot 3.2+:
spring:
  threads:
    virtual:
      enabled: true

# In cod, Controllerul ramane cod standard simplu si curat:
@GetMapping("/{id}")
public JobDto getJob(@PathVariable UUID id) {
    // Apel JDBC blocant standard, dar rulat pe un Virtual Thread ultra-usor:
    return jobService.getJobById(id);
}`,
    interviewTrap: 'Atentie la "Thread Pinning": daca blochezi un Virtual Thread in interiorul unui bloc synchronized sau apel nativ C, acesta blocheaza thread-ul fizic purtator (carrier thread). Foloseste ReentrantLock in loc de synchronized in codul Java 21.',
    keyTakeaway: 'Virtual Threads ofera scalabilitatea extrema a WebFlux-ului fara complexitatea mentenantei codului reactiv.'
  }
];
