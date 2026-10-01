// Deck Masiv: Testare Automata, JUnit 5, Mockito, Testcontainers & QA Automation
// Preluat din: JUnit 5 Official User Guide, Mockito Docs, Testcontainers Best Practices, Martin Fowler
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const TESTING_DECK = [
  {
    id: 'test-01',
    category: 'TESTING',
    difficulty: 'USOR',
    title: '@Mock vs @InjectMocks vs @Spy in Mockito',
    question: 'Care este diferenta exacta intre adnotarile @Mock, @InjectMocks si @Spy in testele unitare cu Mockito?',
    answer: '1. @Mock: Creeaza un mock complet (obiect fals) al dependintei. Toate metodele sale returneaza valori default (null, 0, false, empty collection) daca nu sunt stub-uite explicit cu when().thenReturn().\n\n2. @InjectMocks: Creeaza instanta REALA a clasei pe care doresti sa o testezi (Class Under Test) si injecteaza automat in ea campurile adnotate cu @Mock sau @Spy.\n\n3. @Spy: Creeaza un "wrapper" peste o instanta reala a obiectului. Daca o metoda nu este stub-uita, se apeleaza implementarea REALA a metodei.',
    codeSnippet: `@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {
    @Mock private JobRepository jobRepository;
    @Mock private NotificationService notificationService;
    @InjectMocks private ApplicationService applicationService;

    @Test
    void testApplyToJob() {
        when(jobRepository.findById(any())).thenReturn(Optional.of(new JobPosting()));
        applicationService.apply(UUID.randomUUID(), "cv.pdf");
        verify(notificationService, times(1)).sendConfirmationEmail(any());
    }
}`,
    interviewTrap: 'Daca folosesti @Spy pe o metoda care are efecte secundare si o stub-uiesti cu when(spy.doWork()).thenReturn(), metoda reala SE EXECUTA o data inainte de stub! Foloseste doReturn().when(spy).doWork() pentru spioni!',
    keyTakeaway: '@InjectMocks este pentru clasa testata. @Mock este pentru dependintele externe.'
  },
  {
    id: 'test-02',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'De ce folosim Testcontainers in locul bazei de date H2?',
    question: 'De ce tot mai multe companii renunta la baza de date in-memory H2 pentru testele de integrare in favoarea Testcontainers?',
    answer: 'Baza de date H2 are dialect diferit fata de motoarele de productie (PostgreSQL, MySQL):\n1. Incompatibilitati SQL: Functii specifice Postgres (JSONB, vector embeddings cu pgvector, proceduri stocate, indecsi partiali sau GIN) NU ruleaza pe H2 sau au sintaxa complet diferita.\n2. Comportament tranzactional: H2 gestioneaza lock-urile si nivelele de izolare diferit (poti avea teste verzi pe H2 care pica in productie).\n\nTestcontainers porneste un container Docker real cu PostgreSQL 16 la rularea suitei de teste, oferind un mediu 100% fidel productiei, cu izolare perfecta si stergere automata dupa teste.',
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
    interviewTrap: 'Folosind optiunea withReuse(true) sau singleton containers per test suite, pornirea containerului dureaza sub 1-2 secunde, eliminand problema vitezei.',
    keyTakeaway: 'Testcontainers elimina sindromul "Functioneaza pe masina mea, dar a picat pe Postgres in productie".'
  },
  {
    id: 'test-03',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: '@SpringBootTest vs @WebMvcTest vs @DataJpaTest',
    question: 'Care este diferenta de viteza si de context intre testele de slice (@WebMvcTest, @DataJpaTest) si un test integrat complet @SpringBootTest?',
    answer: '1. @SpringBootTest (Test de Integrare Complet): Incarca intregul ApplicationContext Spring (controllere, servicii, repository-uri, securitate). Cel mai lent, dar testeaza fluxul complet end-to-end.\n2. @WebMvcTest (Test de Controller Slice): Incarca DOAR stratul web (Controllere, ExceptionHandlers, Jackson). Serviciile TREBUIE mock-uite cu @MockBean. Extrem de rapid, testeaza coduri HTTP si validari @Valid.\n3. @DataJpaTest (Test de Repository Slice): Incarca doar stratul JPA (EntityManager, Spring Data Repositories) cu rollback automat la finalul fiecarui test.',
    codeSnippet: `@WebMvcTest(JobController.class)
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
    interviewTrap: 'Folosirea exclusiva de @SpringBootTest pentru orice test simplu duce la o suita lenta. Foloseste teste unitare pure cu Mockito pentru servicii si slice tests pentru controllere.',
    keyTakeaway: 'Alege tipul potrivit de test: Mockito pur pentru business logic (milisecunde), slice tests pentru controllere si @SpringBootTest doar pentru flow-uri critice.'
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
        verify(jobRepository).save(jobCaptor.capture());
        JobPosting savedJob = jobCaptor.getValue();
        assertEquals("Java Developer", savedJob.getTitle());
        assertEquals("ACTIVE", savedJob.getStatus());
    }
}`,
    interviewTrap: 'Nu folosi ArgumentCaptor pe asertiuni simple de string-uri sau primitive unde poti folosi direct eq("valoare"). Foloseste-l doar pe obiecte complexe create intern.',
    keyTakeaway: 'ArgumentCaptor iti permite sa verifici valorile din obiectele create intern in metoda testata.'
  },
  {
    id: 'test-05',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Piramida Testarii (Test Pyramid) si Ciclul TDD (Red-Green-Refactor)',
    question: 'Ce reprezinta Piramida Testarii si care sunt cei 3 pasi obligatorii din metodologia Test-Driven Development (TDD)?',
    answer: 'Piramida Testarii (Martin Fowler):\n1. Baza (70%): Unit Tests (rapide, izolate, ruleaza in milisecunde, acopera clase si metode individuale).\n2. Mijloc (20%): Integration Tests (testeaza interactiunea intre componente, API cu DB reala prin Testcontainers).\n3. Varf (10%): End-to-End / UI Tests (Cypress, Playwright, Selenium - lente, fragile dar testeaza fluxul utilizatorului cap-coada).\n\nCiclul TDD (Red -> Green -> Refactor):\n- RED: Scrie mai intai un test unitar care pica (pentru ca functionalitatea nu exista inca).\n- GREEN: Scrie cantitatea minima de cod de productie necesara pentru a face testul sa treaca cu succes.\n- REFACTOR: Curata si optimizeaza codul pastrand testele verzi.',
    codeSnippet: `// 1. RED: Scrie testul intai
@Test void shouldCalculateBonus() {
    assertEquals(500, salaryService.calculateBonus(5000));
}
// 2. GREEN: Scrie minimul de cod: int calculateBonus(int s) { return s * 0.1; }
// 3. REFACTOR: Extrage constante, imbunatateste lizibilitatea.`,
    interviewTrap: 'O "Piramida Inversata" (Ice Cream Cone Anti-pattern) are putine teste unitare si sute de teste E2E lente; orice modificare mica strica testele si incetineste deploy-ul.',
    keyTakeaway: 'Unit tests la baza pentru viteza si acoperire; integration tests la mijloc; cateva teste E2E pe fluxurile critice.'
  },
  {
    id: 'test-06',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Teste Parametrizate in JUnit 5 (@ParameterizedTest)',
    question: 'Cum folosesti @ParameterizedTest impreuna cu @ValueSource, @CsvSource si @MethodSource pentru a elimina duplicarea codului de test?',
    answer: 'In JUnit 5, @ParameterizedTest permite rularea aceluiasi test de mai multe ori cu seturi diferite de date de intrare:\n1. @ValueSource: Pentru liste simple de primitive sau String-uri.\n2. @CsvSource: Pentru randuri de date tabulare continand mai multe argumente separate prin virgula (valoare de intrare si rezultat asteptat).\n3. @MethodSource: Pentru structuri de date complexe (Stream<Arguments>) generate de o metoda statica de suport.',
    codeSnippet: `@ParameterizedTest
@CsvSource({
    "test@example.com, true",
    "invalid-email, false",
    "user@domain.co.uk, true",
    "'', false"
})
void testEmailValidation(String email, boolean expectedResult) {
    boolean isValid = emailValidator.isValid(email);
    assertEquals(expectedResult, isValid);
}`,
    interviewTrap: 'Metoda furnizoare pentru @MethodSource TREBUIE sa fie obligatoriu statica (static Stream<Arguments> provideData()), altfel JUnit 5 arunca exceptie la runtime.',
    keyTakeaway: '@ParameterizedTest ofera o acoperire bogata de cazuri si valori limita (boundary testing) fara redundanta in cod.'
  },
  {
    id: 'test-07',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'doReturn() vs when() in Mockito: De ce apar erori pe @Spy',
    question: 'De ce sintaxa when(mock.method()).thenReturn() pica atunci cand este folosita pe obiecte @Spy sau pe metode de tip void?',
    answer: '1. De ce pica pe @Spy:\nLa when(spy.calculate()), metoda calculate() se apeleaza REAL in momentul evaluarii argumentului din paranteza! Daca metoda reala arunca o exceptie cand obiectul nu este initializat sau face o scriere in DB, testul va pica inainte de a aplica stub-ul.\nSolutie: doReturn(valoare).when(spy).calculate() NU apeleaza metoda reala inainte de stub.\n\n2. Metode void: Deoarece o metoda void nu returneaza nimic, nu poti scrie when(mock.delete())... (eroare de compilare). Trebuie folosit obligatoriu: doNothing().when(mock).delete() sau doThrow(new RuntimeException()).when(mock).delete().',
    codeSnippet: `// Corect pentru @Spy:
doReturn(42).when(spyService).expensiveRealMethod();

// Corect pentru metode void:
doThrow(new DatabaseException("DB Down")).when(repo).deleteById(any());`,
    interviewTrap: 'Folosirea when(spy.method()) pe o metoda care trimite un email sau sterge un fisier va trimite email-ul real in timpul rularii testului!',
    keyTakeaway: 'Foloseste intotdeauna sintaxa doReturn().when() pentru obiecte @Spy si doThrow()/doNothing() pentru metode void.'
  },
  {
    id: 'test-08',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Testarea Exceptiilor cu assertThrows() in JUnit 5',
    question: 'Cum asiguri ca o metoda arunca exceptia asteptata si cum inspectezi mesajul de eroare din interiorul exceptiei?',
    answer: 'In JUnit 5, se foloseste assertThrows(ExpectedException.class, Executable):\n1. In JUnit 4 se folosea @Test(expected = Exception.class), dar acela nu permitea verificarea mesajului de eroare si putea masca o exceptie aruncata accidental dintr-o alta linie a testului.\n2. assertThrows() returneaza instanta exceptiei capturate. Aceasta iti permite sa faci asertiuni detaliate pe mesajul de eroare (getMessage()) sau pe campurile interne custom ale exceptiei.',
    codeSnippet: `@Test
void shouldThrowWhenJobNotFound() {
    UUID nonExistentId = UUID.randomUUID();
    
    ResourceNotFoundException exception = assertThrows(
        ResourceNotFoundException.class,
        () -> jobService.getJobById(nonExistentId)
    );

    assertTrue(exception.getMessage().contains("Nu a fost gasit"));
    assertEquals(nonExistentId, exception.getResourceId());
}`,
    interviewTrap: 'Nu pune apeluri pregatitoare in interiorul lambda-ului din assertThrows; pune DOAR metoda exacta care trebuie sa arunce exceptia!',
    keyTakeaway: 'assertThrows izoleaza precis linia generatoare de exceptie si expune obiectul pentru verificari de stare.'
  },
  {
    id: 'test-09',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Rollback Automat si TestEntityManager in @DataJpaTest',
    question: 'De ce testele adnotate cu @DataJpaTest fac rollback automat la final si de ce ai nevoie de TestEntityManager.flush()?',
    answer: '1. Rollback Automat:\nFiecare metoda de test din @DataJpaTest este infasurata automat intr-o tranzactie (@Transactional). La finalul executiei testului, Spring face ROLLBACK automat pentru a lasa baza de date curata pentru urmatoarele teste.\n\n2. De ce ai nevoie de flush():\nHibernate amana scrierile pe disc (Write-Behind). Daca apelezi repository.save(entity), entitatea ramane in First Level Cache. Daca ai o constrangere SQL de tip NOT NULL sau UNIQUE la nivel de DB, exceptia nu va fi aruncata decat la FLUSH! Folosind testEntityManager.flush(), fortezi sincronizarea imediata cu baza de date pentru a valida constrangerile SQL reale.',
    codeSnippet: `@DataJpaTest
class JobRepositoryTest {
    @Autowired private TestEntityManager entityManager;
    @Autowired private JobRepository jobRepository;

    @Test
    void shouldPersistAndFindJob() {
        JobPosting job = new JobPosting("Java Dev", "ACTIVE");
        entityManager.persistAndFlush(job); // Salveaza si forteaza SQL INSERT

        Optional<JobPosting> found = jobRepository.findById(job.getId());
        assertTrue(found.isPresent());
    }
}`,
    interviewTrap: 'Daca testezi tranzactii programatice sau evenimente asincrone care depind de COMMIT real, rollback-ul automat din @DataJpaTest poate ascunde erori de productie.',
    keyTakeaway: 'TestEntityManager.persistAndFlush() este esential pentru a forta rularea constrangerilor reale de SQL in testele JPA.'
  },
  {
    id: 'test-10',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: '@MockBean vs @SpyBean in Testele Spring Boot',
    question: 'Ce fac adnotarile @MockBean si @SpyBean si de ce utilizarea lor excesiva incetineste executia suitei de teste?',
    answer: '1. Ce fac:\n- @MockBean: Inlocuieste un Bean existent din ApplicationContext Spring cu un mock Mockito.\n- @SpyBean: Inveleste bean-ul existent din context intr-un spion Mockito, pastrand logica reala a metodelor care nu sunt stub-uite.\n\n2. De ce incetinesc suita de teste (Context Caching Invalidation):\nSpring reutilizeaza acelasi ApplicationContext in memorie intre clasele de test daca au configurari identice (Context Caching). Insa de fiecare data cand o clasa de test adauga un @MockBean diferit, configuratia contextului se modifica! Spring este fortat sa distruga contextul vechi si sa porneasca un ApplicationContext COMPLET NOU (ceea ce adauga 3-5 secunde de pornire per clasa de test).',
    codeSnippet: `@WebMvcTest(JobController.class)
class JobControllerTest {
    @MockBean private JobService jobService; // Mock integrat in contextul Spring
}`,
    interviewTrap: 'Daca pui combinatii diferite de @MockBean in 50 de clase de test, suita ta de teste va porni Spring de 50 de ori, durand 5 minute in loc de 15 secunde!',
    keyTakeaway: 'Foloseste teste unitare pure cu Mockito (@Mock) oriunde este posibil; rezerva @MockBean doar pentru slice tests web.'
  },
  {
    id: 'test-11',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Task-urilor Asincrone cu Awaitility',
    question: 'De ce un apel Thread.sleep(2000) este un anti-pattern in teste si cum folosesti Awaitility pentru a testa cod asincron?',
    answer: 'De ce Thread.sleep() este periculos:\n1. Daca procesul asincron dureaza 50ms, un sleep de 2000ms iroseste inutil 1950ms. Rulat in sute de teste, adauga minute intregi in CI/CD pipeline.\n2. Daca serverul CI/CD este incarcat si procesul dureaza 2100ms, testul va pica in mod fals (Flaky Test)!\n\nSolutie: Biblioteca Awaitility\nAwaitility face polling periodic (ex: la fiecare 100ms) si continua executia IMEDIAT ce conditia dorita devine adevarata, esuand doar daca se atinge un timeout maxim.',
    codeSnippet: `// Folosire Awaitility:
jobService.triggerAsyncJobProcessing(jobId);

await()
    .atMost(Duration.ofSeconds(5))
    .pollInterval(Duration.ofMillis(100))
    .untilAsserted(() -> {
        JobPosting job = jobRepository.findById(jobId).orElseThrow();
        assertEquals("COMPLETED", job.getStatus());
    });`,
    interviewTrap: 'Testele cu Thread.sleep() sunt cauza principala a instabilitatii (flakiness) in pipeline-urile de integrare continua.',
    keyTakeaway: 'Awaitility ofera asertiuni asincrone deterministe si rapide prin polling inteligent.'
  },
  {
    id: 'test-12',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Integrarilor HTTP Externe cu WireMock',
    question: 'Cum folosesti WireMock pentru a testa apelurile HTTP catre servicii externe (ex: Stripe, GitHub API) fara a apela internetul real?',
    answer: 'WireMock este un server HTTP fals (mock server) care ruleaza local in timpul testelor:\n1. Simuleaza raspunsuri HTTP reale (coduri 200, 404, 500, JSON payloads, headere si intarzieri de retea).\n2. Testeaza modul in care aplicatia ta gestioneaza erorile externe, timeout-urile de retea si mecanismele de retry/circuit breaker.\n3. Ofera determinism absolut: testele ruleaza rapid, offline si nu depind de chei API reale sau limite de rata (rate limits) ale serviciilor terte.',
    codeSnippet: `@SpringBootTest
@AutoConfigureWireMock(port = 0) // Port aleatoriu liber
class StripeClientTest {
    @Autowired private PaymentGatewayClient paymentClient;

    @Test
    void shouldHandleStripeSuccess() {
        stubFor(post(urlEqualTo("/v1/charges"))
            .willReturn(aResponse()
                .withStatus(200)
                .withHeader("Content-Type", "application/json")
                .withBody("{\"id\": \"ch_123\", \"status\": \"succeeded\"}")));

        PaymentReceipt receipt = paymentClient.charge(new ChargeRequest(100));
        assertEquals("ch_123", receipt.getId());
    }
}`,
    interviewTrap: 'Nu lasa testele automate sa apeleze URL-uri de productie sau staging reale; daca reteaua pica sau API-ul tert se schimba, testele tale vor pica necontrolat.',
    keyTakeaway: 'WireMock izoleaza complet testele de dependintele externe de retea prin simularea precisa a raspunsurilor HTTP.'
  },
  {
    id: 'test-13',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Testarea Mesageriei Kafka: Testcontainers vs @EmbeddedKafka',
    question: 'Care sunt avantajele utilizarii Testcontainers Kafka fata de @EmbeddedKafka in testele de integrare Spring Boot?',
    answer: '1. @EmbeddedKafka:\n- Ruleaza un broker Kafka in-memory in interiorul aceluiasi proces JVM.\n- Avantaj: Pornire rapida, nu necesita Docker.\n- Dezavantaj: Consuma multa memorie JVM; comportamentul retelei si versiunea exacta a brokerului pot diferi usor de clusterul real de productie.\n\n2. Testcontainers Kafka:\n- Porneste o imagine oficiala Docker de Apache Kafka (sau Confluent/Redpanda) in mod real.\n- Avantaje:\n  - 100% fidel productiei (aceeasi versiune exacta de Kafka, compatibilitate de protocol si setari de securitate SASL/SSL).\n  - Permite testarea situatiilor critice: caderea brokerului la mijlocul procesarii, rebalansarea de partitii si comportamentul Dead Letter Topic (DLT).',
    codeSnippet: `@Testcontainers
class KafkaIntegrationTest {
    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }
}`,
    interviewTrap: 'Daca folosesti containere Kafka separate per clasa de test, timpul suitei va exploda; partajeaza un singur container Kafka Singleton intre toate clasele de test de integrare.',
    keyTakeaway: 'Testcontainers Kafka ofera fidelitate totala pentru validarea fluxurilor de producer si consumer la nivel de productie.'
  },
  {
    id: 'test-14',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Consumer-Driven Contract Testing cu Pact / Spring Cloud Contract',
    question: 'Ce este Contract Testing intre microservicii si cum inlocuieste testele E2E fragile si lente?',
    answer: 'Problema in Arhitecturi de Microservicii:\nDaca Serviciul B (Provider) modifica numele unui camp in JSON din user_name in username, Serviciul A (Consumer) va crapa la prima rulare in productie. Testarea E2E a tuturor serviciilor impreuna este lenta, fragila si greu de orchestrat.\n\nContract Testing (ex: Pact):\n1. Consumer-Driven: Serviciul A scrie un "Contract" care defineste exact ce campuri JSON asteapta de la Serviciul B.\n2. Contractul este publicat intr-un repository comun (Pact Broker).\n3. In pipeline-ul CI/CD al Serviciului B (Provider), se ruleaza automat teste de verificare a contractului impotriva stub-urilor. Daca B schimba schema si rupe contractul lui A, build-ul lui B pica IMEDIAT inainte de deploy!',
    codeSnippet: `// Contract Pact definit de Consumer:
PactDslJsonBody body = new PactDslJsonBody()
    .uuid("id")
    .stringType("title")
    .integerType("salary");`,
    interviewTrap: 'Contract testing nu verifica logica complexa de business din spate, ci garanteaza strict compatibilitatea structurii si semanticii API-ului (schema agreement).',
    keyTakeaway: 'Contract Testing asigura ca microserviciile raman compatibile fara a fi nevoie sa rulezi intregul ecosistem simultan in teste E2E.'
  },
  {
    id: 'test-15',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Mutation Testing cu PITest: Calitatea Reala a Testelor',
    question: 'De ce o acoperire de cod (Code Coverage) de 100% poate fi complet inselatoare si cum masoara Mutation Testing eficienta asertiunilor?',
    answer: 'Iluzia Code Coverage-ului Clasic:\nPoti obtine 100% Line Coverage printr-un test care apeleaza toate metodele din aplicatie dar NU are nicio asertiune (zero assertEquals)! Testul executa codul, raportul arata 100% verde, dar testul nu prinde absolut niciun bug!\n\nCum functioneaza Mutation Testing (ex: PITest in Java):\n1. PITest modifica intentionat codul bytecode compilat ("injecteaza mutanti"): schimba > in <=, inlocuieste + cu -, sterge apeluri de metode sau returneaza null.\n2. Ruleaza suita ta de teste impotriva fiecarui mutant in parte.\n3. Daca testele TALE PICA, mutantul este KILLED (testul este puternic si si-a facut treaba!).\n4. Daca testele trec cu succes desi codul a fost alterat, mutantul a SUPRAVIETUIT (SURVIVED), semnaland ca testul tau nu verifica corect logica acelei linii!',
    codeSnippet: `// Raport PITest:
// Mutant: Replaced integer addition with subtraction in calculateTax()
// Result: SURVIVED -> Alerta: Nu ai asertiune care sa testeze calculul taxei!`,
    interviewTrap: 'Mutation testing este costisitor ca timp de CPU deoarece re-ruleaza suita de sute de ori; se recomanda rularea doar pe codul modificat in Pull Requests (PR Mutation Testing).',
    keyTakeaway: 'Mutation Testing testeaza calitatea testelor tale prin verificarea capacitatii lor reale de a detecta modificari de cod gresite.'
  },
  {
    id: 'test-16',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Line Coverage vs Branch Coverage vs Path Coverage',
    question: 'Care este diferenta dintre Line Coverage, Branch Coverage si Path Coverage si de ce Branch Coverage este mult mai important?',
    answer: '1. Line Coverage (Statement Coverage):\n- Masoara procentul de linii de cod care au fost executate cel putin o data in teste.\n- Slabiciune: Daca ai un if (conditie), testul poate trece pe ramura true, bifand linia de cod, dar ignorand complet cazul in care conditia este false.\n\n2. Branch Coverage (Decision Coverage):\n- Masoara daca fiecare decizie booleana din cod (fiecare if, else, switch, ternar) a fost evaluata atat ca TRUE, cat si ca FALSE.\n- Mult mai robust: Forteaza testarea atat a cazului fericit (happy path), cat si a cazurilor de eroare sau ramurilor secundare.\n\n3. Path Coverage:\n- Masoara toate combinatiile posibile de ramuri dintr-o metoda. La 5 if-uri consecutive, exista 2^5 = 32 de cai posibile. Deseori imposibil de acoperit 100% din cauza exploziei combinatorii.',
    codeSnippet: `public int calculateDiscount(int age, boolean isVip) {
    if (age > 65 || isVip) { // Branch coverage cere:
        return 20;           // 1. age > 65
    }                        // 2. isVip == true
    return 0;                // 3. ambele false
}`,
    interviewTrap: 'Obiectivul de 100% coverage pe tot codul este o tinta falsa care duce la teste fragile scrise de mantuiala pe gettere si settere; 80% branch coverage pe business logic este tinta optima in industrie.',
    keyTakeaway: 'Prioritizeaza Branch Coverage peste Line Coverage pentru a garanta testarea tuturor deciziilor logice din cod.'
  },
  {
    id: 'test-17',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Executia Paralela a Testelor in JUnit 5 si Shared Mutable State',
    question: 'Cum activezi executia paralela a testelor in JUnit 5 si care este cel mai mare risc asociat?',
    answer: 'Activare in junit-platform.properties:\njunit.jupiter.execution.parallel.enabled = true\njunit.jupiter.execution.parallel.mode.default = concurrent\n\nBeneficiu: Testele unitare independente ruleaza pe toate nucleele CPU disponibile, reducand timpul de executie de la 60 secunde la 10 secunde.\n\nRiscul Critic: Shared Mutable State (Stare Partajata Modificabila)\nDaca doua teste paralele modifica aceeasi resursa comuna (o variabila static in clasa, baza de date fara izolare sau variabile de sistem System.setProperty), testele vor interfera aleatoriu, provocand esecuri impredictibile!\n\nSolutie: Adnotarea @ResourceLock(value = "resource_name") instruieste JUnit 5 sa ruleze testele care ating acea resursa in mod exclusiv (izolat secvential).',
    codeSnippet: `@Test
@ResourceLock("system.properties")
void testWithSystemProperty() {
    System.setProperty("app.env", "test");
    // Executie sigura fara interferente din alte thread-uri
}`,
    interviewTrap: 'Nu activa executia paralela peste teste de integrare care impart aceeasi baza de date fara a folosi containere separate sau scheme izolate dinamic.',
    keyTakeaway: 'Executia paralela aduce viteza maxima daca testele sunt complet imutabile si izolate de orice stare globala.'
  },
  {
    id: 'test-18',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Ciclul de Viata al Testelor: @BeforeEach vs @BeforeAll in JUnit 5',
    question: 'Care este diferenta dintre @BeforeEach si @BeforeAll si de ce metodele @BeforeAll trebuie sa fie statice in mod implicit?',
    answer: '1. @BeforeEach:\n- Se executa INAINTE DE FIECARE metoda individuala de test din clasa.\n- Folosit pentru initializarea starii proaspete (curatare mock-uri, reinitializare obiecte) pentru a asigura izolarea totala a fiecarui test.\n\n2. @BeforeAll:\n- Se executa O SINGURA DATA inainte de inceperea suitei de teste din acea clasa.\n- Folosit pentru operatiuni costisitoare ca timp (pornire Testcontainers, conexiuni DB mari).\n- De ce trebuie sa fie static: JUnit 5 creeaza o instanta NOUA a clasei de test pentru fiecare metoda de test (Lifecycle.PER_METHOD). Deoarece instanta nu exista inca la pornirea clasei, metoda @BeforeAll trebuie sa fie statica la nivel de clasa!\n(Exceptie: Daca adaugi @TestInstance(Lifecycle.PER_CLASS), metoda @BeforeAll poate fi non-statica).',
    codeSnippet: `@BeforeAll
static void initExpensiveResources() {
    postgresContainer.start();
}

@BeforeEach
void setUp() {
    testCandidate = new Candidate("Mihai", "Dev");
}`,
    interviewTrap: 'Daca plasezi date modificabile in @BeforeAll si Testul 1 modifica obiectul, Testul 2 va citi datele alterate si va pica (incalcarea izolarii testelor).',
    keyTakeaway: 'Foloseste @BeforeEach pentru date specifice testului si @BeforeAll exclusiv pentru resurse grele partajate imutabile.'
  },
  {
    id: 'test-19',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Securitatii in Spring Boot cu @WithMockUser',
    question: 'Cum testezi autorizarea pe endpoint-uri securizate (@PreAuthorize) fara a genera token-uri JWT reale la fiecare test?',
    answer: 'Pachetul spring-security-test ofera adnotari dedicate pentru injectarea unui context de securitate fals in SecurityContextHolder:\n1. @WithMockUser(username = "admin", roles = {"ADMIN"}): Simuleaza un utilizator deja autentificat cu rolurile specificate, permitand testarea rapida a metodelor protejate de securitate.\n2. @WithAnonymousUser: Simuleaza o cerere neautentificata (util pentru a valida ca endpoint-ul returneaza HTTP 401 Unauthorized).\n3. SecurityMockMvcRequestPostProcessors.jwt(): Permite mock-uirea token-urilor JWT cu claims si scope-uri custom in apelurile MockMvc.',
    codeSnippet: `@Test
@WithMockUser(username = "recruiter@ats.com", roles = {"RECRUITER"})
void recruiterCanViewCandidates() throws Exception {
    mockMvc.perform(get("/api/v1/candidates"))
           .andExpect(status().isOk());
}

@Test
@WithAnonymousUser
void unauthenticatedUserReceives401() throws Exception {
    mockMvc.perform(get("/api/v1/candidates"))
           .andExpect(status().isUnauthorized());
}`,
    interviewTrap: 'Atentie la diferenta dintre roles si authorities: roles = {"ADMIN"} devine automat autoritatea "ROLE_ADMIN" cu prefixul ROLE_ adaugat de Spring!',
    keyTakeaway: '@WithMockUser permite testarea exhaustiva a matricei de securitate fara overhead de autentificare reala.'
  },
  {
    id: 'test-20',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'AssertJ Fluent Assertions vs JUnit assertEquals',
    question: 'De ce este preferata biblioteca AssertJ (assertThat) in locul metodelor standard JUnit assertEquals?',
    answer: '1. Lizibilitate Fluenta: Sintaxa seamana cu o propozitie in limba engleza: assertThat(actual).isEqualTo(expected) in loc de assertEquals(expected, actual) unde parametrii sunt des inversati accidental.\n2. Asertiuni Puternice pe Colectii: Poti verifica extragerea de proprietati, filtrare, elemente continute si dimensiuni intr-un singur lant lizibil.\n3. Mesaje de Eroare Exceptionale: La esec, AssertJ afiseaza exact diferentele de campuri, caracterele diferite si valorile asteptate intr-un format vizual curat.',
    codeSnippet: `// In loc de JUnit clasic:
// assertEquals(3, list.size());
// assertEquals("Senior", list.get(0).getLevel());

// Cu AssertJ:
assertThat(candidates)
    .hasSize(3)
    .extracting(Candidate::getLevel)
    .containsExactly("Senior", "Mid", "Junior");`,
    interviewTrap: 'Inversarea parametrilor in assertEquals(actual, expected) nu arunca eroare de compilare, dar face ca mesajul de eroare la esec sa fie pe dos si derutant.',
    keyTakeaway: 'AssertJ imbunatateste considerabil expresivitatea si lizibilitatea suitei de teste.'
  },
  {
    id: 'test-21',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Flaky Tests (Teste Intermitente): Cauze si Solutii',
    question: 'Ce este un "Flaky Test" si care sunt cele mai frecvente 4 cauze care fac ca un test sa treaca sau sa pice aleatoriu?',
    answer: 'Un Flaky Test este un test care prezinta un comportament nedeterminist: uneori trece, alteori pica pe EXACT ACELASI cod sursa fara nicio modificare!\n\nCauze Comune:\n1. Operatiuni Asincrone & Timeouts: Folosirea de Thread.sleep() sau timeout-uri prea stranse care pica cand serverul CI este supraincarcat.\n2. Ordinea de Executie a Testelor: Testul B depinde de o inregistrare lasata in DB de Testul A. Cand JUnit ruleaza testele in ordine aleatorie, Testul B pica!\n3. Dependente de Timp si Timezone: Hardcodarea unei date specifice sau apeluri Instant.now() fara ceas mock-uit (java.time.Clock).\n4. Colectii Nesortate: Asertiuni de ordine pe seturi (HashSet) sau query-uri SQL fara clauza ORDER BY explicita.',
    codeSnippet: `// Solutie pentru timp determinist: Injecteaza Clock in servicii!
@Bean
public Clock clock() {
    return Clock.systemUTC();
}

// In test folosesti Clock fix:
Clock fixedClock = Clock.fixed(Instant.parse("2026-03-01T10:00:00Z"), ZoneOffset.UTC);`,
    interviewTrap: 'Adaugarea de reincercari automate (Retry on failure) doar mascheaza problema unui flaky test; cauza de fond (curatare stare, asincronism) trebuie reparata la radacina.',
    keyTakeaway: 'Elimina starea partajata, foloseste Clock mock-uit si ordonare explicita pentru teste 100% deterministe.'
  },
  {
    id: 'test-22',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Test Data Builders si Object Mother Pattern',
    question: 'Cum folosesti Test Data Builder Pattern pentru a crea obiecte complexe de test fara constructori uriasi?',
    answer: 'In aplicatii enterprise, entitatile au zeci de campuri (nume, email, status, adresa, roluri). Crearea lor cu new Candidate("a", "b", "c", null, null, 1, 2) in fiecare test creeaza teste ilizibile si fragile la orice adaugare de camp nou.\n\nTest Data Builder Pattern:\n1. Un builder dedicat pentru teste ofera valori implicite rezonabile (sensible defaults) pentru toate campurile obligatorii.\n2. Testul suprascrie EXCLUSIV campurile care sunt direct relevante pentru scenariul testat.\n3. Face testele concise, expressive si imune la modificari ale constructorului.',
    codeSnippet: `public class JobPostingBuilder {
    private String title = "Java Developer";
    private int salary = 5000;
    private String status = "ACTIVE";

    public static JobPostingBuilder aJob() { return new JobPostingBuilder(); }
    public JobPostingBuilder withSalary(int s) { this.salary = s; return this; }
    public JobPostingBuilder withStatus(String st) { this.status = st; return this; }
    public JobPosting build() { return new JobPosting(title, salary, status); }
}

// In test: Clar si concis:
JobPosting highSalaryJob = aJob().withSalary(12000).build();`,
    interviewTrap: 'Daca adaugi un camp obligatoriu in entitate fara Builder, va trebui sa modifici manual 200 de teste existente; cu Builder modifici doar clasa de builder o singura data!',
    keyTakeaway: 'Test Data Builders izoleaza testele de schimbarile structurale ale entitatilor si scot in evidenta intentia testului.'
  },
  {
    id: 'test-23',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: '@Nested Tests in JUnit 5 pentru Structura BDD',
    question: 'Cum utilizezi adnotarea @Nested din JUnit 5 pentru a organiza cazurile de testare dupa principiile BDD (Given-When-Then)?',
    answer: 'Adnotarea @Nested permite gruparea claselor interne de test intr-o ierarhie vizuala logica:\n1. Fiecare clasa @Nested reprezinta un context de business specific (ex: GivenUserIsAdmin, WhenApplyingToClosedJob).\n2. Permite configurari dedicate @BeforeEach per grup de scenarii.\n3. In rapoartele IDE si CI/CD, rezultatele apar grupate ca o poveste de business clara si usor de parcurs.',
    codeSnippet: `class JobApplicationTest {
    @Nested
    @DisplayName("Cand jobul este ACTIV")
    class WhenJobIsActive {
        @Test
        @DisplayName("Ar trebui sa accepte aplicatia cu succes")
        void shouldAcceptApplication() { ... }
    }

    @Nested
    @DisplayName("Cand jobul este INCHIS")
    class WhenJobIsClosed {
        @Test
        @DisplayName("Ar trebui sa arunce JobClosedException")
        void shouldRejectApplication() { ... }
    }
}`,
    interviewTrap: 'Clasele @Nested nu pot avea metode statice @BeforeAll decat daca adaugi @TestInstance(Lifecycle.PER_CLASS) pe ele.',
    keyTakeaway: '@Nested aduce claritate ierarhica BDD si documenteaza comportamentul sistemului direct in structura testelor.'
  },
  {
    id: 'test-24',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'RestAssured vs MockMvc: Testare HTTP Reala vs Emulare',
    question: 'Care este diferenta dintre RestAssured si MockMvc si cand folosesti fiecare instrument?',
    answer: '1. MockMvc:\n- Face parte din Spring Test. Emuleaza apelurile HTTP direct in memoria containerului Servlet (DispatcherServlet) fara a deschide un socket de retea real.\n- Foarte rapid, acces la ApplicationContext, ideal pentru teste de controllere (@WebMvcTest).\n- Nu testeaza configuratiile reale ale serverului web (Tomcat, porturi, SSL, filtre HTTP de nivel jos).\n\n2. RestAssured:\n- Un client HTTP real care trimite cereri reale prin retea catre portul aplicatiei pornite (ex: @SpringBootTest(webEnvironment = RANDOM_PORT)).\n- Sintaxa eleganta BDD: given().when().then().\n- Testeaza intregul stack real de la TCP/IP, server Tomcat, filtre de securitate pana la baza de date.',
    codeSnippet: `// RestAssured pe port real:
given()
    .header("Authorization", "Bearer " + token)
    .contentType(ContentType.JSON)
.when()
    .get("/api/v1/jobs/42")
.then()
    .statusCode(200)
    .body("title", equalTo("Senior Architect"));`,
    interviewTrap: 'RestAssured este considerabil mai lent decat MockMvc deoarece deschide conexiuni TCP reale pe retea; foloseste-l pe un numar restrans de flow-uri E2E de integrare.',
    keyTakeaway: 'MockMvc pentru verificari rapide de controller; RestAssured pentru teste de integrare end-to-end reale peste serverul pornit.'
  },
  {
    id: 'test-25',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Test Double Types: Dummy vs Fake vs Stub vs Spy vs Mock',
    question: 'Care sunt cele 5 tipuri fundamentale de "Test Doubles" definite de Gerard Meszaros si cand il folosesti pe fiecare?',
    answer: 'Termenul general este Test Double (nu toate sunt "mock-uri"!):\n1. Dummy: Un obiect transmis doar pentru a umple o lista de parametri (ex: un logger sau un obiect gol), dar care nu este niciodata utilizat in logica testului.\n2. Fake: O implementare functionala simplificata dar nepotrivita pentru productie (ex: o baza de date in-memory bazata pe un simplu HashMap).\n3. Stub: Un obiect care returneaza raspunsuri fixe predeterminate la apeluri de metode (when(x).thenReturn(y)).\n4. Spy: Un wrapper peste o clasa reala care monitorizeaza apelurile efectuate (inregistreaza cate apeluri s-au facut) pastrand implementarea de baza.\n5. Mock: Un obiect fals programat cu asteptari stricte privind apelurile pe care trebuie sa le primeasca (verifica comportamentul prin verify()).',
    codeSnippet: `// Fake implementation exemplu:
public class FakeJobRepository implements JobRepository {
    private final Map<UUID, JobPosting> db = new HashMap<>();
    public JobPosting save(JobPosting j) { db.put(j.getId(), j); return j; }
}`,
    interviewTrap: 'Multi candidati numesc orice obiect fals "mock"; claritatea diferentierii intre Fake (are logica de baza) si Mock (doar verifica invocari) demonstreaza cunostinte senior.',
    keyTakeaway: 'Cunoasterea celor 5 tipuri de Test Doubles permite alegerea celei mai simple si rapide solutii de izolare a testului.'
  },
  {
    id: 'test-26',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Smoke Testing vs Sanity Testing vs Regression Testing',
    question: 'Care sunt diferentele de scop si faza intre Smoke Testing, Sanity Testing si Regression Testing in ciclul de QA?',
    answer: '1. Smoke Testing ("Build Verification Test"):\n- Ruleaza IMEDIAT dupa un build/deploy nou.\n- Verifica doar functionalitatile critice de baza: "Porneste aplicatia? Raspunde homepage-ul? Se poate face login?".\n- Daca Smoke Test pica, build-ul este respins instant fara a mai pierde timp cu alte teste.\n\n2. Sanity Testing:\n- Ruleaza dupa ce s-a livrat un bug-fix specific.\n- Verifica DOAR modulul reparat si functionalitatile adiacente pentru a valida ca bug-ul a disparut.\n\n3. Regression Testing:\n- O suita cuprinzatoare (adesea sute sau mii de teste) care ruleaza pentru a garanta ca modificarile sau functionalitatile NOI nu au stricat functionalitatile VECHI existente.',
    codeSnippet: `// Pipeline CI/CD:
// 1. Compile & Unit Tests -> 2. Deploy pe Staging -> 3. Smoke Test (5 min) -> 4. Full Regression Test Suite (30 min)`,
    interviewTrap: 'Confundarea Smoke (larg si superficial pe tot sistemul) cu Sanity (ingust si profund pe un bug fix) este o greseala frecventa la interviuri.',
    keyTakeaway: 'Smoke testeaza stabilitatea generala a noului build; Regression garanteaza ca trecutul nu a fost spart de prezent.'
  },
  {
    id: 'test-27',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Cache-ului (@Cacheable) in Spring Boot',
    question: 'Cum scrii un test de integrare pentru a valida ca adnotarea @Cacheable chiar functioneaza si nu reapeleaza baza de date?',
    answer: 'Pentru a testa caching-ul:\n1. Incarci contextul cu cache activat (@SpringBootTest cu @EnableCaching).\n2. Apelezi metoda serviciului prima oara: verifici ca repository-ul mock-uit este apelat (verify(repo, times(1)).findById(id)).\n3. Apelezi metoda a DOUA oara cu acelasi parametru: verifici ca repository-ul NU MAI ESTE APELAT deloc (numarul total de invocari ramane tot 1)!\n4. Rezultatul returnat trebuie sa fie identic, demonstrand ca a fost servit direct din cache.',
    codeSnippet: `@SpringBootTest
class CacheIntegrationTest {
    @MockBean private JobRepository jobRepository;
    @Autowired private JobService jobService;

    @Test
    void shouldHitCacheOnSecondCall() {
        UUID id = UUID.randomUUID();
        when(jobRepository.findById(id)).thenReturn(Optional.of(new JobPosting("Dev")));

        jobService.getJobById(id); // Primul apel: populeaza cache-ul
        jobService.getJobById(id); // Al doilea apel: vine din cache

        verify(jobRepository, times(1)).findById(id); // Repository apelat o singura data!
    }
}`,
    interviewTrap: 'Daca testezi metoda cu un test unitar pur folosind Mockito (fara Spring Context pornit), adnotarile @Cacheable sunt complet ignorate deoarece AOP proxy-ul nu exista!',
    keyTakeaway: 'Testarea de cache necesita pornirea contextului Spring pentru ca proxy-ul interceptor sa poata fi activat.'
  },
  {
    id: 'test-28',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Verificarea Invocatiilor in Mockito: times(), never(), InOrder',
    question: 'Cum verifici in Mockito ca o metoda NU a fost apelata niciodata si cum validezi ordinea stricta a apelurilor?',
    answer: '1. Verificare ca o metoda NU a fost apelata:\nverify(notificationService, never()).sendEmail(any());\nSau verifici ca mock-ul nu a primit absolut nicio interactiune: verifyNoInteractions(paymentService);\n\n2. Verificare Ordine Stricta (InOrder):\nCand secventa exacta a actiunilor este critica de business (de exemplu: trebuie mai intai sa blochezi cardul si abia apoi sa transferi banii):\nFolosesti InOrder inOrder = inOrder(accountService, transferService);\ninOrder.verify(accountService).lock();\ninOrder.verify(transferService).transfer();',
    codeSnippet: `InOrder inOrder = inOrder(paymentGateway, auditLogger);
orderService.process(order);

inOrder.verify(paymentGateway).charge(any());
inOrder.verify(auditLogger).logSuccess(any());`,
    interviewTrap: 'Folosirea excesiva a verifyNoMoreInteractions() peste tot face testele extrem de rigide; orice apel inofensiv de logging va strica testele.',
    keyTakeaway: 'InOrder garanteaza ca interactiunile se produc in secventa logica corecta de securitate si business.'
  },
  {
    id: 'test-29',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Mocking-ul Metodelor Statice in Mockito (mockStatic)',
    question: 'Cum poti face mock pe o metoda statica in Mockito 3.4+ si de ce trebuie folosita constructia try-with-resources?',
    answer: 'Incepand cu Mockito 3.4+, pachetul mockito-inline permite mock-uirea metodelor statice fara PowerMock:\nSe foloseste MockedStatic<T> mock = mockStatic(TargetClass.class).\n\nDe ce este OBLIGATORIU try-with-resources:\nMock-ul static este inregistrat la nivel de ThreadLocal in JVM. Daca nu il inchizi imediat la finalul testului prin try-with-resources (sau close()), metoda statica ramane mock-uita pentru TOATE celelalte teste din proiect, provocand coruperea globala a suitei de teste!',
    codeSnippet: `@Test
void shouldMockStaticUuid() {
    UUID fixedUuid = UUID.fromString("00000000-0000-0000-0000-000000000001");
    
    try (MockedStatic<UUID> mockedUuid = mockStatic(UUID.class)) {
        mockedUuid.when(UUID::randomUUID).thenReturn(fixedUuid);
        
        UUID result = UUID.randomUUID();
        assertEquals(fixedUuid, result);
    } // mock-ul static este inchis si deregisterat automat aici!
}`,
    interviewTrap: 'Nevoia de a mock-ui metode statice este adesea un semn de cod slab proiectat (bad smell); este mai bine sa injectezi dependinte sau o interfata Clock decat sa mock-uiesti System.currentTimeMillis().',
    keyTakeaway: 'try-with-resources este obligatoriu la mockStatic pentru a elibera starea din ThreadLocal.'
  },
  {
    id: 'test-30',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Migrarilor de Baza de Date cu Flyway in Teste',
    question: 'Cum validezi in CI/CD ca scripturile de migrare Flyway (V1, V2) ruleaza curat pe o baza goala folosind Testcontainers?',
    answer: 'O problema grava in echipe este introducerea unui script Flyway cu sintaxa gresita care pica la deploy-ul in productie.\n\nStrategia de Testare a Migrarilor:\n1. Se porneste un container Testcontainers PostgreSQL gol (fara scheme create de Hibernate).\n2. Se dezactiveaza generarea automata a schemei din JPA: spring.jpa.hibernate.ddl-auto=validate (sau none).\n3. Se configureaza Flyway sa ruleze automat: spring.flyway.enabled=true.\n4. Testul pur si simplu porneste contextul: daca toate migrarile Flyway ruleaza cu succes de la V1 pana la ultima versiune, testul este verde. Daca un script are erori de sintaxa sau conflicte de tipuri, testul pica imediat in CI!',
    codeSnippet: `@SpringBootTest
@Testcontainers
class FlywayMigrationIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Test
    void flywayMigrationsShouldApplyCleanly() {
        // Pornirea cu succes a contextului demonstreaza ca toate scripturile V... au rulat fara eroare!
        assertTrue(postgres.isRunning());
    }
}`,
    interviewTrap: 'Daca lasi ddl-auto=update in teste, Hibernate va crea tabelele inaintea Flyway-ului, mascand complet bug-urile din scripturile de migrare SQL!',
    keyTakeaway: 'Valideaza migrarile Flyway pe un container curat cu ddl-auto=validate pentru a garanta siguranta deploy-ului.'
  },
  {
    id: 'test-31',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Black-Box vs White-Box vs Grey-Box Testing',
    question: 'Care sunt diferentele cheie intre testarea de tip Cutie Neagra (Black-Box), Cutie Alba (White-Box) si Cutie Gri (Grey-Box)?',
    answer: '1. Black-Box Testing (Cutie Neagra):\n- Testerul NU are acces si nu cunoaste codul sursa sau structura interna a aplicatiei.\n- Testarea se bazeaza strict pe cerintele functionale: date de intrare (input) -> verificarea raspunsului (output).\n- Exemple: Teste E2E de UI, teste de acceptanta de catre utilizator (UAT).\n\n2. White-Box Testing (Cutie Alba):\n- Testerul (sau programatorul) are acces total la codul sursa, arhitectura si logica interna.\n- Testele urmaresc structura codului, ramurile if/else si tratarea exceptiilor.\n- Exemple: Teste unitare cu JUnit si Mockito, analize de branch coverage.\n\n3. Grey-Box Testing (Cutie Gri):\n- Testerul are o cunoastere partiala a structurii interne (de exemplu cunoaste schema bazei de date sau contractul API JSON), dar testeaza sistemul prin interfata externa.',
    codeSnippet: `// White-Box: Cunoaste interiorul (mock-uieste clase interne)
// Black-Box: Apeleaza doar endpoint-ul HTTP public si verifica codul HTTP`,
    interviewTrap: 'Testele unitare sunt prin definitie White-Box testing, in timp ce testele de securitate penetration testing incep de regula ca Black-Box.',
    keyTakeaway: 'Black-Box valideaza comportamentul din perspectiva utilizatorului; White-Box asigura calitatea interna a implementarii.'
  },
  {
    id: 'test-32',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Testarea Concurentei si Race Conditions cu CountDownLatch',
    question: 'Cum scrii un test unitar determinist care simuleaza 50 de thread-uri lovind o metoda exact in aceeasi milisecunda?',
    answer: 'Pentru a testa o conditie de concurenta (Race Condition sau Debit Dublu), pornirea thread-urilor cu new Thread().start() este ineficienta deoarece unele pornesc mai devreme decat altele.\n\nSolutie: CountDownLatch ca poarta de start sincronizata:\n1. Creezi un CountDownLatch(1) numit startGate si un CountDownLatch(50) numit doneGate.\n2. Fiecare dintre cele 50 de thread-uri porneste si apeleaza startGate.await(), asteptand la linia de start.\n3. Firul principal apeleaza startGate.countDown(), eliberand TOATE cele 50 de thread-uri EXACT in aceeasi milisecunda!\n4. doneGate.await() asteapta ca toate thread-urile sa termine, dupa care verifici asertiunile de consistenta pe stoc sau balanta.',
    codeSnippet: `int threads = 50;
CountDownLatch readyGate = new CountDownLatch(threads);
CountDownLatch startGate = new CountDownLatch(1);
CountDownLatch doneGate = new CountDownLatch(threads);
ExecutorService executor = Executors.newFixedThreadPool(threads);

for (int i = 0; i < threads; i++) {
    executor.submit(() -> {
        readyGate.countDown();
        startGate.await(); // Toate asteapta aici sincronizate
        accountService.withdraw(100);
        doneGate.countDown();
        return null;
    });
}
readyGate.await(); // Asteapta alinierea tuturor firelor
startGate.countDown(); // TRAGE SEMNALUL DE START!
doneGate.await(); // Asteapta finalizarea`,
    interviewTrap: 'Fara CountDownLatch, testele de concurenta trec adesea pe masina locala rapida dar pica in mod aleatoriu in containere CI/CD cu mai putine nuclee.',
    keyTakeaway: 'CountDownLatch ofera sincronizare perfecta pentru testarea situatiilor de cursa concurenta (Race Conditions).'
  },
  {
    id: 'test-33',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Shift-Left Testing vs Shift-Right Testing',
    question: 'Ce inseamna conceptele de "Shift-Left" si "Shift-Right" in practicile moderne de inginerie software si QA?',
    answer: '1. Shift-Left Testing (Testare Timpurie):\n- Muta efortul de testare cat mai la stanga pe axa timpului a ciclului de dezvoltare (faza de design si scriere de cod).\n- Include: TDD, revizuiri de cod, scanare statica de securitate (SAST), contract testing si rularea testelor unitare inainte de commit.\n- Principiul de baza: Cu cat descoperi un bug mai devreme (la nivel de scriere de cod), cu atat costul de reparare este mai mic (de pana la 100 de ori mai ieftin decat in productie!).\n\n2. Shift-Right Testing (Testare in Productie):\n- Extinde testarea si monitorizarea in mediul de productie dupa lansare.\n- Include: Canary Releases, Feature Flags, Chaos Engineering (Chaos Monkey), monitorizarea erorilor in timp real si Synthetic Monitoring.',
    codeSnippet: `// Axul Timpului:
// [Design -> Cod -> Build -> Test] (Shift-Left) <---> [Deploy -> Productie -> Monitorizare] (Shift-Right)`,
    interviewTrap: 'Shift-Right nu inseamna "nu mai testam inainte de lansare si lasam userii sa testeze"; inseamna observabilitate si mitigare controlata a riscurilor reale de productie.',
    keyTakeaway: 'Shift-Left previne defectele prin testare timpurie; Shift-Right asigura rezilienta in conditii reale de exploatare.'
  },
  {
    id: 'test-34',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Chaos Engineering si Principiile Rezilientei in QA',
    question: 'Ce este Chaos Engineering si cum demonstrezi ca aplicatia ta este rezilienta la caderi de servere sau latente de retea?',
    answer: 'Chaos Engineering (popularizat de Netflix cu Simian Army / Chaos Monkey):\nEste disciplina experimentarii controlate pe un sistem software pentru a-i construi increderea ca poate rezista conditiilor turbulente neprevazute din productie.\n\nPrincipii:\n1. Defineste "Steady State": Comportamentul normal masurabil al sistemului (ex: 99.9% din cereri raspund sub 200ms cu HTTP 200).\n2. Formuleaza o Ipoteza: "Daca un nod PostgreSQL Master pica, sistemul va promova replica in 10s fara ca utilizatorii sa vada erori 500".\n3. Introdu Evenimente din Lumea Reala: Opreste aleatoriu pod-uri, adauga latenta artificiala pe retea (Toxiproxy), simuleaza discuri pline sau pierderi de pachete de retea.\n4. Verifica Ipoteza: Daca sistemul a continuat sa serveasca utilizatorii (prin fallback-uri si circuit breakers), ipoteza este confirmata!',
    codeSnippet: `// Experiment Chaos:
// 1. steadyState: http_success_rate > 99%
// 2. injectChaos: kill -9 pod-order-service-3
// 3. assert: http_success_rate ramane > 99% datorita Kubernetes autoscaling & failover`,
    interviewTrap: 'Nu rula experimente de haos in productie pana cand sistemul nu a trecut cu succes testele in medii de staging.',
    keyTakeaway: 'Chaos Engineering descopera vulnerabilitatile ascunse ale sistemului inainte ca ele sa provoace o pana reala de noapte in productie.'
  },
  {
    id: 'test-35',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testcontainers Reuse Mode pentru Viteza Instantanee in Dezvoltare',
    question: 'Cum configurezi Testcontainers sa reutilizeze acelasi container intre rulari succesive de teste pentru a economisi timp?',
    answer: 'In mod normal, Testcontainers porneste un container Docker la inceputul testelor si il distruge complet la finalul executiei (prin containerul intern Ryuk). Aceasta asigura curatenie, dar poate adauga 5-10 secunde la fiecare apasare de tasta a dezvoltatorului.\n\nSolutie: Modul Reutilizabil (Reuse Mode):\n1. In ~/.testcontainers.properties adaugi: testcontainers.reuse.enable=true\n2. In codul Java adaugi: .withReuse(true) pe instanta containerului.\n3. Cand rulezi testele a doua oara, Testcontainers verifica hash-ul configuratiei; daca containerul exista deja si e sanatos, se leaga instantaneu la el in cateva milisecunde fara re-descarcare sau re-pornire!',
    codeSnippet: `@Container
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
    .withReuse(true); // Pastreaza containerul viu intre rulari locale!`,
    interviewTrap: 'Modul reuse trebuie folosit doar local pe masina de dezvoltare; in pipeline-ul CI/CD din GitHub Actions containerele trebuie distruse curat pentru izolare.',
    keyTakeaway: 'Testcontainers reuse mode reduce timpul de pornire al bazei de date de test la zero milisecunde in bucla locala de dezvoltare.'
  },
  {
    id: 'test-36',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Testarea Validarii DTO izolata cu Validator nativ',
    question: 'Cum testezi adnotarile Bean Validation (@NotNull, @Size, @Email) pe un DTO fara a porni Spring Context sau MockMvc?',
    answer: 'Pornirea unui test @WebMvcTest doar pentru a verifica ca un camp @NotBlank returneaza eroare este mult prea lent.\n\nSolutie: Folosirea interfetei Validator din Jakarta Validation:\nPoti instantia validatorul direct in memorie prin Validation.buildDefaultValidatorFactory().getValidator().\nTestul ruleaza in mai putin de 5 milisecunde si valideaza direct setul de incalcari de constrangeri (Set<ConstraintViolation<MyDto>>).',
    codeSnippet: `class JobDtoValidationTest {
    private final Validator validator = 
        Validation.buildDefaultValidatorFactory().getValidator();

    @Test
    void shouldFailWhenTitleIsBlank() {
        JobDto dto = new JobDto("", 5000); // Titlu gol invalid
        Set<ConstraintViolation<JobDto>> violations = validator.validate(dto);

        assertThat(violations).hasSize(1);
        assertThat(violations.iterator().next().getPropertyPath().toString())
            .isEqualTo("title");
    }
}`,
    interviewTrap: 'Testele de validare DTO nu au nevoie de Spring; testarea lor unitara pura este de 100 de ori mai rapida.',
    keyTakeaway: 'Valideaza DTO-urile direct cu Jakarta Validator pentru viteza maxima si acoperire completa a constrangerilor.'
  },
  {
    id: 'test-37',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Simularea Problemelor de Retea cu Toxiproxy in Teste',
    question: 'Cum folosesti Toxiproxy impreuna cu Testcontainers pentru a testa comportamentul aplicatiei cand baza de date devine lenta sau conexiunea pica?',
    answer: 'Toxiproxy este un proxy TCP dezvoltat de Shopify special conceput pentru a simula conditii de retea instabile:\n1. Interpui Toxiproxy intre aplicatia ta si containerul PostgreSQL.\n2. In timpul testului, poti injecta dinamic "toxics" prin cod Java:\n   - Adauga o latenta de 3.000 ms pentru a testa timeout-ul din HikariCP.\n   - Limiteaza banda la 10 KB/s.\n   - Opreste complet traficul (Peer Close) pentru a valida reconectarea automata.\n3. Dupa asertiune, elimini toxina, restabilind comunicarea normala.',
    codeSnippet: `// Adaugare latenta artificiala pe conexiunea Postgres in test:
ToxiproxyContainer.ContainerProxy proxy = toxiproxy.getProxy(postgres, 5432);
proxy.toxics().latency("latency-toxic", ToxicDirection.DOWNSTREAM, 4000);

// Acum conexiunea va dura 4 secunde, testand comportamentul de timeout:
assertThrows(QueryTimeoutException.class, () -> repo.findSlowQuery());`,
    interviewTrap: 'Testarea aplicatiilor doar pe conexiuni localhost perfecte creeaza o iluzie falsa de stabilitate; retelele de cloud au jitter si pachete pierdute.',
    keyTakeaway: 'Toxiproxy permite testarea determinista a rezilientei la latente si caderi de retea direct in suita de teste automate.'
  },
  {
    id: 'test-38',
    category: 'TESTING',
    difficulty: 'DIFICIL',
    title: 'Property-Based Testing cu jqwik in Java',
    question: 'Ce este Property-Based Testing si cum descopera cazuri limita (edge cases) pe care dezvoltatorul nu le-a gandit niciodata?',
    answer: 'Testarea Clasica (Example-Based Testing):\nDezvoltatorul alege manual 3-4 exemple: input 5 -> output 10, input 0 -> output 0. Slabiciune: este limitata de imaginatia dezvoltatorului!\n\nProperty-Based Testing (ex: jqwik in JUnit 5):\n1. In loc de exemple individuale, definesti o "Proprietate" invariabila matematica care trebuie sa fie mereu adevarata (ex: "Pentru orice lista, inversarea ei de doua ori produce aceeasi lista originala", sau "Niciun salariu net nu poate fi mai mare decat salariul brut").\n2. Cadrul de test genereaza automat MII de combinatii aleatorii de date (numere negative uriase, valori nule, string-uri Unicode speciale, array-uri goale).\n3. Daca o valoare pica proprietatea, jqwik face "Shrinking": simplifica automat input-ul pana la cel mai mic exemplu reproductibil care provoaca eroarea!',
    codeSnippet: `@Property
boolean reverseTwiceIsOriginal(@ForAll List<String> original) {
    List<String> reversedTwice = reverse(reverse(original));
    return original.equals(reversedTwice);
}`,
    interviewTrap: 'Property-Based Testing nu inlocuieste testele unitare obisnuite, dar este exceptional pentru validarea algoritmilor de calcul financiar, hashing si parsare de date.',
    keyTakeaway: 'Property-Based Testing descopera automat edge case-uri nebanuite prin generarea masiva de date si shrinking inteligent.'
  },
  {
    id: 'test-39',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Playwright vs Cypress vs Selenium pentru Testare E2E',
    question: 'De ce a castigat Playwright teren masiv in fata Cypress si Selenium in automatizarea testelor End-to-End?',
    answer: '1. Selenium (Clasic):\n- Protocol HTTP greoi bazat pe WebDriver, lent si recunoscut pentru teste "flaky" care necesitau comenzi manuale Thread.sleep() sau asteptari explicite de elemente.\n\n2. Cypress:\n- Ruleaza direct in interiorul browserului. Usor de folosit, dar limitat la un singur tab de browser, suport slab pentru iframe-uri si viteza redusa la teste paralele mari.\n\n3. Playwright (Standardul Modern Microsoft):\n- Comunica direct prin WebSocket cu protocolul nativ Chrome DevTools Protocol (CDP).\n- Auto-Waiting: Asteapta automat ca butoanele sa fie vizibile, active si stabile inainte de click, eliminand 99% din testele flaky!\n- Suport nativ complet pentru: multi-tab, ferestre multiple, comutare de contexte de autentificare paralele ultra-rapide si inregistrare video/trace vizual al fiecarui pas.',
    codeSnippet: `// Test Playwright modern in TypeScript:
test('candidat poate aplica la job', async ({ page }) => {
    await page.goto('/jobs/42');
    await page.click('button:has-text("Aplica Acum")'); // Auto-waiting inclus!
    await expect(page.locator('.toast-success')).toBeVisible();
});`,
    interviewTrap: 'Testele E2E sunt cele mai scumpe de intretinut din toata piramida; nu acoperi toata logica de business in E2E, pastreaza doar fluxurile critice ale utilizatorului.',
    keyTakeaway: 'Playwright este liderul modern al testarii E2E datorita mecanismului de Auto-Waiting si comunicarii native prin DevTools.'
  },
  {
    id: 'test-40',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Asertiuni pe Colectii si Soft Assertions cu AssertJ',
    question: 'Ce sunt "Soft Assertions" si de ce sunt utile cand vrei sa validezi multiple campuri ale unui raspuns mare?',
    answer: 'Problema Asertiunilor Standard (Hard Assertions):\nDaca ai 5 comenzi assertEquals consecutive si prima pica, executia testului se opreste IMEDIAT! Nu afli niciodata daca celelalte 4 campuri erau corecte sau aveau si ele erori.\n\nSolutie: Soft Assertions in AssertJ\nSoft Assertions evalueaza TOATE asertiunile din bloc, chiar daca unele pica. La final, metoda assertAll() colecteaza toate esecurile si le raporteaza impreuna intr-un singur raport curat!',
    codeSnippet: `SoftAssertions softly = new SoftAssertions();

softly.assertThat(job.getTitle()).isEqualTo("Java Senior");
softly.assertThat(job.getSalary()).isEqualTo(8000);
softly.assertThat(job.getStatus()).isEqualTo("ACTIVE");

softly.assertAll(); // Daca title si salary pica, ambele sunt raportate impreuna!`,
    interviewTrap: 'Daca uiti sa apelezi softly.assertAll() la finalul testului, testul va fi marcat ca VERDE chiar daca toate asertiunile au picat!',
    keyTakeaway: 'Soft Assertions colecteaza toate diferentele dintr-un obiect intr-o singura rulare fara oprirea prematura a testului.'
  },
  {
    id: 'test-41',
    category: 'TESTING',
    difficulty: 'USOR',
    title: 'Adnotarea @DisplayName si Generarea Raportului de Teste',
    question: 'Cum imbunatateste adnotarea @DisplayName si generatorul DisplayNameGenerator documentarea vie a testelor?',
    answer: 'Numele metodelor Java sunt restrictive (camelCase fara spatii, caractere limitate: testCalculateBonusWhenSalaryIsOver5000()).\n\nAdnotarea @DisplayName:\nPermite scrierea unui text liber, clar, in limbaj natural (chiar si cu simboluri), care este afisat in interfata de CI/CD si IDE.\n\nDisplayNameGenerator.ReplaceUnderscores:\nPermite scrierea metodelor cu caractere underscore (ex: cand_salariul_este_mare_se_aplica_bonus()), pe care JUnit le converteste automat in propozitii cu spatii in raport, facand testele o documentatie vie a functionalitatilor de business.',
    codeSnippet: `@Test
@DisplayName("Verifica ca un candidat respins primeste email automat in maxim 24h")
void testCandidateRejectionFlow() {
    // Cod test
}`,
    interviewTrap: 'Testele prost denumite necesita citirea codului pentru a intelege de ce au picat; un @DisplayName expresiv comunica defectiunea instantaneu echipei.',
    keyTakeaway: 'Adnotarea @DisplayName transforma codul tehnic de test intr-o specificatie functionala usor de citit de oricine.'
  },
  {
    id: 'test-42',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Securitatii CSRF si a Header-ului in MockMvc',
    question: 'Cum testezi protectia CSRF in teste de controller folosind SecurityMockMvcRequestPostProcessors.csrf()?',
    answer: 'Daca aplicatia ta are protectia CSRF activata in Spring Security, orice cerere HTTP de modificare de stare (POST, PUT, DELETE) trimisa prin MockMvc va fi respinsa automat cu HTTP 403 Forbidden daca nu contine un token CSRF valid.\n\nIn testele MockMvc:\nSe foloseste functia ajutatoare SecurityMockMvcRequestPostProcessors.csrf() atasata la cerere cu metoda with(csrf()). Aceasta injecteaza automat un token CSRF corect in parametrii cererii, permitand testarea logicii controllerului.',
    codeSnippet: `mockMvc.perform(post("/api/v1/jobs")
        .with(csrf()) // Fara csrf(), cererea ar returna 403 Forbidden!
        .contentType(MediaType.APPLICATION_JSON)
        .content(objectMapper.writeValueAsString(newJobDto)))
    .andExpect(status().isCreated());`,
    interviewTrap: 'Daca testul tau POST returneaza 403 Forbidden in loc de 201 Created si securitatea pare in regula, verifica daca ai adaugat .with(csrf()) in cererea MockMvc.',
    keyTakeaway: 'Post-procesorul .with(csrf()) este esential pentru validarea cererilor POST/PUT in aplicatii Spring Security cu CSRF activ.'
  },
  {
    id: 'test-43',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Database Cleaner Strategies in Teste de Integrare',
    question: 'Cum mentii baza de date curata intre teste cand rollback-ul tranzactional nu poate fi folosit?',
    answer: 'In testele end-to-end reale (unde serverul ruleaza pe un port separat) sau in teste care implica thread-uri multiple, rollback-ul tranzactional automat nu poate fi folosit (fiecare thread are tranzactia sa separata).\n\nStrategii de Curatare a Bazei de Date:\n1. Re-crearea Schemei la fiecare clasa (prea lent, dureaza secunde).\n2. Stergere Tabelara cu TRUNCATE in @AfterEach:\nSe executa un script SQL rapid care face TRUNCATE TABLE pe toate tabelele de date (pastrand schema intacta).\nIn PostgreSQL: TRUNCATE TABLE job_postings, candidates, applications RESTART IDENTITY CASCADE;\n3. Biblioteca DatabaseRider (DBUnit modern): Goleste automat tabelele si re-populeaza datele din fisiere YAML/JSON inainte de fiecare test.',
    codeSnippet: `@AfterEach
void cleanDatabase() {
    jdbcTemplate.execute("TRUNCATE TABLE job_postings CASCADE;");
}`,
    interviewTrap: 'Folosirea comenzii DELETE FROM table este mult mai lenta decat TRUNCATE TABLE deoarece DELETE genereaza loguri WAL si declanseaza verificari de constrangeri pe fiecare rand in parte.',
    keyTakeaway: 'TRUNCATE TABLE cu CASCADE este cea mai rapida metoda de a readuce o baza de date de test la starea curata initiala.'
  },
  {
    id: 'test-44',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Testarea Rezilientei cu Circuit Breaker in Mock Environment',
    question: 'Cum testezi ca Resilience4j Circuit Breaker chiar trece in starea OPEN dupa pragul de erori configurat?',
    answer: 'Pentru a testa un Circuit Breaker:\n1. Injectezi CircuitBreakerRegistry in clasa de test.\n2. Obtii instanta circuit breaker-ului dupa nume.\n3. Configurezi o dependinta mock-uita sa arunce exceptii (when(...).thenThrow(new RuntimeException())).\n4. Apelezi metoda de mai multe ori consecutiv pentru a atinge dimensiunea ferestrei glisante (ex: 5 apeluri esuate).\n5. Asertiune directa pe starea circuitului: assertThat(circuitBreaker.getState()).isEqualTo(CircuitBreaker.State.OPEN)!\n6. Apelezi metoda inca o data si verifici ca metoda mock-uita NU MAI ESTE APELATA deloc (apelul este blocat direct de circuit).',
    codeSnippet: `@Test
void shouldTransitionToOpenStateOnFailures() {
    CircuitBreaker cb = registry.circuitBreaker("paymentService");
    when(externalClient.pay(any())).thenThrow(new RemoteServiceException());

    for (int i = 0; i < 5; i++) {
        try { paymentService.processPayment(req); } catch (Exception ignored) {}
    }

    assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
}`,
    interviewTrap: 'Daca nu resetezi starea Circuit Breaker-ului in @AfterEach cu cb.reset(), urmatoarele teste din clasa vor gasi circuitul deja OPEN si vor pica neasteptat!',
    keyTakeaway: 'CircuitBreakerRegistry permite inspectarea si testarea determinista a starii masinii de tranzitie a Circuit Breaker-ului.'
  },
  {
    id: 'test-45',
    category: 'TESTING',
    difficulty: 'MEDIU',
    title: 'Backward Compatibility Testing pentru API Contracts',
    question: 'Cum garantezi in CI/CD ca o modificare adusa unui model DTO nu va rupe compatibilitatea retroactiva cu clientii vechi?',
    answer: 'Ruperea compatibilitatii retroactive (Breaking Change) poate opri aplicatiile mobile sau microserviciile partenere care inca folosesc versiunea veche a contractului.\n\nStrategii de Testare a Compatibilitatii:\n1. Teste de Serializare/Deserializare Jackson:\nSe stocheaza in directorul de resurse de test fisiere JSON reprezentand raspunsurile reale din versiunile vechi ale aplicatiei.\nTestul citeste JSON-ul vechi si incearca sa il deserializeze in noul DTO Java. Daca deserializarea reuseste fara erori si campurile noi au valori default rezonabile, compatibilitatea este pastrata!\n2. Verificarea Schemelor OpenAPI / JSON Schema Diff:\nUn pas de CI (precum openapi-diff) compara fisierul swagger.json generat de noul branch cu cel de pe ramura main. Daca detecteaza stergerea unui camp sau adaugarea unui camp nou obligatoriu, build-ul este marcat ca esuat.',
    codeSnippet: `@Test
void shouldDeserializeLegacyJsonPayload() throws Exception {
    String legacyJson = Files.readString(Path.of("src/test/resources/legacy_v1_job.json"));
    JobDto modernDto = objectMapper.readValue(legacyJson, JobDto.class);

    assertThat(modernDto.getTitle()).isEqualTo("Dev");
    assertThat(modernDto.getSalary()).isEqualTo(0); // Valoare default pentru camp adaugat ulterior
}`,
    interviewTrap: 'Schimbarea tipului unui camp din Long in String sau invers este o ruptura grava de compatibilitate; testele de compatibilitate pe JSON vechi descopera aceste probleme instant.',
    keyTakeaway: 'Testarea deserializarii payload-urilor vechi garanteaza ca clientii existenti vor continua sa functioneze fara intreruperi.'
  }
];
