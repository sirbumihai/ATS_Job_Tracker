// Deck Masiv: Testare Automata, JUnit 5, Mockito, Testcontainers & QA Automation
// Preluat din: JUnit 5 Official User Guide, Mockito Docs, Testcontainers Best Practices
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
  }
];
