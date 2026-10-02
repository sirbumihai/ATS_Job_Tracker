// Deck Masiv: Testare Automata, JUnit 5, Mockito, Testcontainers & QA Automation (Junior & Mid-Level)
// Preluat din: JUnit 5 Official User Guide, Mockito Docs, Testcontainers Best Practices, Martin Fowler & Top QA Guides
// 100 de carduri realiste de interviu (Unit testing, Mockito, Spring Test Slices, Testcontainers, TDD, Piramida Testarii)
// FARA intrebari de Senior / Arhitect (Zero Custom Bytecode Transformers, Zero Kernel Fault Injection)
// Dificultati: USOR si MEDIU (Zero DIFICIL)
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const TESTING_DECK = [
  {
    id: "test-01",
    category: "TESTING",
    difficulty: "USOR",
    title: "@Mock vs @InjectMocks vs @Spy in Mockito",
    question: "Care este diferenta exacta intre adnotarile @Mock, @InjectMocks si @Spy in testele unitare cu Mockito?",
    answer: "1. @Mock:\n   - Creeaza un obiect fals (mock) al unei dependinte.\n   - Toate metodele sale returneaza valori implicite (null, 0, false, colectii goale) daca nu sunt stub-uite explicit cu `when().thenReturn()`.\n\n2. @InjectMocks:\n   - Creeaza instanta REALA a clasei pe care doresti sa o testezi (Class Under Test).\n   - Injecteaza automat in ea toate campurile adnotate cu `@Mock` sau `@Spy` din test (prin constructor sau reflectie).\n\n3. @Spy:\n   - Creeaza un \"ambalaj\" (wrapper) peste un obiect REAL.\n   - Daca o metoda nu este stub-uita, se apeleaza codul REAL al metodei.",
    codeSnippet: `@ExtendWith(MockitoExtension.class)
class JobServiceTest {
    @Mock private JobRepository jobRepo;
    @Mock private EmailService emailService;
    @InjectMocks private JobService jobService; // Clasa testata

    @Test
    void testAplica() {
        when(jobRepo.findById(1L)).thenReturn(Optional.of(new Job()));
        jobService.aplica(1L, "cv.pdf");
        verify(emailService, times(1)).trimiteConfirmare(any());
    }
}`,
    interviewTrap: "@InjectMocks se pune DOAR pe clasa pe care o testezi direct! Daca pui @Mock pe clasa testata, toate metodele ei vor fi mockuite si nu testezi nimic real.",
    keyTakeaway: "@InjectMocks este pentru clasa testata; @Mock este pentru dependintele externe simulate; @Spy pastreaza comportamentul real al metodei daca nu e modificata."
  },
  {
    id: "test-02",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "doReturn().when() vs when().thenReturn() in Mockito",
    question: "Cand este OBLIGATORIU sa folosim `doReturn().when()` in loc de `when().thenReturn()`?",
    answer: "In 90% din cazuri, `when(mock.metoda()).thenReturn(valoare)` este preferat pentru ca este mai lizibil si verificat la compilare.\n\nSituatii cand este OBLIGATORIU `doReturn().when()`:\n1. Cand stub-uiesti un SPY (@Spy):\n   - Daca scrii `when(spy.metodaReala()).thenReturn(...)`, metoda reala SE EXECUTA o data chiar inainte ca stub-ul sa fie configurat! Daca metoda reala arunca exceptie sau sterge date din baza, testul pica.\n   - `doReturn(valoare).when(spy).metodaReala()` NU apeleaza metoda reala.\n2. Cand metoda returneaza `void` (pentru exceptii folosesti `doThrow().when(mock).metodaVoid()`).\n3. La mock-uirea metodelor suprascrise in lant.",
    codeSnippet: `// Pe un @Spy, when().thenReturn() apeleaza metoda reala din greseala:
@Spy List<String> listSpy = new ArrayList<>();

// GRESIT pe Spy (arunca IndexOutOfBoundsException):
// when(listSpy.get(0)).thenReturn("Test");

// CORECT pe Spy:
doReturn("Test").when(listSpy).get(0);`,
    interviewTrap: "Daca folosesti `when(mock.metodaVoid())`, codul nici macar nu compileaza, deoarece `when()` primeste ca argument o valoare returnata! Metodele void se stub-uiesc intotdeauna cu familia `do...().when()`.",
    keyTakeaway: "Foloseste `doReturn().when()` pe spioni (@Spy) pentru a nu executa codul real inainte de stub si `doThrow()` pentru metode void."
  },
  {
    id: "test-03",
    category: "TESTING",
    difficulty: "USOR",
    title: "Metoda verify() in Mockito: Verificarea Interactiunilor",
    question: "Cum verifici ca o metoda a fost apelata cu parametri specifici si ce fac `times(1)`, `never()` si `atLeastOnce()`?",
    answer: "Metoda `verify()` valideaza ca metoda unui mock a fost apelata in timpul executiei testului:\n\n1. `verify(mock, times(1)).trimiteEmail(\"test@exemplu.ro\")`:\n   - Verifica apelarea EXACT o singura data cu argumentul specificat (comportamentul implicit daca omiti `times`).\n\n2. `verify(mock, never()).anuleazaComanda(any())`:\n   - Verifica ca metoda NU a fost apelata niciodata (critic pentru validari unde cererea invalida nu trebuie sa atinga baza sau banca).\n\n3. `verify(mock, atLeastOnce()).inregistreazaLog(anyString())`:\n   - Verifica ca metoda a fost apelata cel putin o data (1, 2 sau mai multe ori).\n\n4. `verifyNoInteractions(mock)`:\n   - Garanteaza ca nicio metoda de pe acel mock nu a fost atinsa in tot testul.",
    codeSnippet: `@Test
void candPlataEsueaza_nuTrebuieSaExpediezeProdusul() {
    when(bancaService.debiteaza(any())).thenReturn(false);
    
    comandaService.plaseazaComanda(comandaNoua);
    
    // Verificam ca livrarea NU a fost initiata niciodata:
    verify(depozitService, never()).expediaza(any());
}`,
    interviewTrap: "Multi candidati uita sa foloseasca `verify()` si cred ca simplul `when().thenReturn()` testeaza codul. `when()` doar pregateste mock-ul; `verify()` este cel care asigura ca interactiunea a avut loc in realitate.",
    keyTakeaway: "`verify()` valideaza comportamentul si interactiunile cu dependintele externe: `times(n)`, `never()`, `atLeastOnce()` si `verifyNoInteractions()`."
  },
  {
    id: "test-04",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "ArgumentCaptor in Mockito: Inspectarea Parametrilor",
    question: "Ce este un `ArgumentCaptor` in Mockito si cand este indispensabil in testele unitare?",
    answer: "`ArgumentCaptor` permite \"capturarea\" valorii exacte a unui argument transmis unei metode a unui mock, pentru a-i inspecta ulterior proprietatile interne:\n\nCand este indispensabil:\n- Cand obiectul trimis metodei este INSTANTIAT IN INTERIORUL metodei testate (nu vine de la intrarea testului).\n- Cand vrei sa verifici campuri generate automat in interior: un timestamp `creat_la`, un status `PENDING`, un hash de parola sau un token criptografic.\n\nCum functioneaza:\n1. Se creeaza captorul: `ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class)`.\n2. Se foloseste la verificare: `verify(userRepo).save(captor.capture())`.\n3. Se inspecteaza valoarea: `User savedUser = captor.getValue();` si se ruleaza asertiuni pe el.",
    codeSnippet: `@Test
void candCreeazaUtilizator_trebuieSaCriptezeParolaSiSaPunaRolDefault() {
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
    
    userService.inregistreaza("ion@test.ro", "ParolaSecreta123");
    
    verify(userRepo).save(userCaptor.capture());
    User userSalvat = userCaptor.getValue();
    
    assertThat(userSalvat.getEmail()).isEqualTo("ion@test.ro");
    assertThat(userSalvat.getPassword()).isNotEqualTo("ParolaSecreta123"); // Criptata!
    assertThat(userSalvat.getRol()).isEqualTo(Rol.USER);
}`,
    interviewTrap: "Daca metoda mockuita este apelata de mai multe ori in bucla, foloseste `captor.getAllValues()` in loc de `captor.getValue()` (care returneaza doar ultima valoare capturata).",
    keyTakeaway: "`ArgumentCaptor` extrage obiectele create si transmise intern dependintelor, permitand asertiuni detaliate pe campurile lor ascunse."
  },
  {
    id: "test-05",
    category: "TESTING",
    difficulty: "USOR",
    title: "ArgumentMatchers in Mockito: Regula Combinarii",
    question: "Care este regula stricta de aur cand combini ArgumentMatchers (ex: `any()`) cu valori exacte intr-un apel Mockito?",
    answer: "REGULA DE AUR Mockito:\n\"Daca folosesti un ArgumentMatcher (`any()`, `eq()`, `isNull()`) pentru UN argument al unei metode, TREBUIE sa folosesti matcheri pentru TOATE argumentele acelei metode!\"\n\nCe se intampla daca incalci regula:\n- Mockito va arunca la runtime `InvalidUseOfMatchersException`.\n\nCum se rezolva:\n- Daca un parametru este generic (ex: orice ID) si altul este o valoare exacta (ex: \"VIP\"), valoarea exacta TREBUIE infasurata in `eq(\"VIP\")`!",
    codeSnippet: `// GRESIT (Arunca InvalidUseOfMatchersException):
// when(serviciu.transfera(anyLong(), "EUR", 100.0)).thenReturn(true);

// CORECT (Toate argumentele folosesc matcheri, valorile fixe au eq()):
when(serviciu.transfera(anyLong(), eq("EUR"), eq(100.0))).thenReturn(true);

// La fel si la verify():
verify(serviciu).transfera(eq(42L), anyString(), anyDouble());`,
    interviewTrap: "Aceasta este una dintre cele mai frecvente erori de incepator in Mockito. `any(String.class)` nu este o valoare, este un matcher; odata ce l-ai folosit, nu mai poti pune `\"text\"` direct alaturi de el fara `eq(\"text\")`.",
    keyTakeaway: "Daca folosesti un matcher pentru un parametru, impacheteaza obligatoriu toti parametrii ficsi ramasi in `eq(...)`."
  },
  {
    id: "test-06",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Exceptiilor in JUnit 5: assertThrows",
    question: "Cum se testeaza aruncarea unei exceptii in JUnit 5 si cum inspectezi mesajul de eroare?",
    answer: "In JUnit 5, testarea exceptiilor se face elegant si functional prin `assertThrows()`:\n\n1. Sintaxa:\n   `assertThrows(ClasaExceptiei.class, () -> cod_care_arunca_exceptia);`\n\n2. Inspectarea mesajului sau a proprietatilor interne:\n   - `assertThrows` returneaza instanta exceptiei capturate!\n   - Poti salva exceptia intr-o variabila si rula asertiuni pe `getMessage()` sau codul intern de eroare.\n\n3. De ce este superior vechiului `@Test(expected = ...)` din JUnit 4:\n   - In JUnit 4, daca prima linie a testului arunca exceptia din intamplare in loc sa o arunce linia testata, testul trecea eronat!\n   - `assertThrows` testeaza strict linia sau blocul lambda specificat.",
    codeSnippet: `@Test
void candSoldulEsteInsuficient_trebuieSaArunceFonduriInsuficienteException() {
    Cont cont = new Cont(100.0);
    
    FonduriInsuficienteException ex = assertThrows(
        FonduriInsuficienteException.class,
        () -> cont.retrage(500.0)
    );
    
    assertEquals("Sold insuficient: disponibil 100.0, cerut 500.0", ex.getMessage());
}`,
    interviewTrap: "Daca folosesti `assertDoesNotThrow()`, asigura-te ca este cu adevarat necesar. In JUnit 5, orice test care arunca o exceptie neprinsa este oricum marcat automat ca FAILED.",
    keyTakeaway: "`assertThrows` captureaza functional exceptia aruncata si permite verificarea mesajului si a starii acesteia."
  },
  {
    id: "test-07",
    category: "TESTING",
    difficulty: "USOR",
    title: "Ciclul de Viata al Testelor in JUnit 5: Adnotari Cheie",
    question: "Care este ordinea de executie a adnotarilor @BeforeAll, @BeforeEach, @Test, @AfterEach si @AfterAll?",
    answer: "Ordinea standard de executie per clasa de test in JUnit 5:\n\n1. `@BeforeAll`: Executat O SINGURA DATA inainte de toate testele din clasa (trebuie sa fie metoda `static` in mod implicit).\n   - Utilizare: Pornire baza de date Testcontainers sau server extern comun.\n\n2. `@BeforeEach`: Executat INAINTE DE FIECARE metoda `@Test`.\n   - Utilizare: Reinitializare obiecte, curatare colectii, pregatire stare proaspata.\n\n3. `@Test`: Metoda reala de test.\n\n4. `@AfterEach`: Executat DUPA FIECARE metoda `@Test`.\n   - Utilizare: Curatare fisiere temporare sau stergere date din cache.\n\n5. `@AfterAll`: Executat O SINGURA DATA la finalul tuturor testelor (metoda `static`).\n   - Utilizare: Inchidere conexiuni, oprire containere.",
    codeSnippet: `class LifecycleDemoTest {
    @BeforeAll static void initClasa() { /* o data la inceput */ }
    @BeforeEach void pregatesteTest()  { /* inainte de fiecare test */ }
    
    @Test void test1() { /* Test 1 */ }
    @Test void test2() { /* Test 2 */ }
    
    @AfterEach void curataTest()       { /* dupa fiecare test */ }
    @AfterAll static void distruge()   { /* o data la final */ }
}`,
    interviewTrap: "In JUnit 5, o noua instanta a clasei de test este creata pentru FIECARE metoda `@Test` (izolare perfecta a starii)! Daca vrei o singura instanta per clasa, adaugi `@TestInstance(Lifecycle.PER_CLASS)`.",
    keyTakeaway: "BeforeAll/AfterAll ruleaza o singura data per clasa (static); BeforeEach/AfterEach ruleaza inaintea si dupa fiecare test in parte."
  },
  {
    id: "test-08",
    category: "TESTING",
    difficulty: "USOR",
    title: "Teste Parametrizate in JUnit 5: @ParameterizedTest",
    question: "Cum eviti duplicarea codului de test cand vrei sa testezi aceeasi metoda cu 10 seturi diferite de date?",
    answer: "Testele Parametrizate (`@ParameterizedTest`) permit executarea aceluiasi corp de test de mai multe ori, injectand valori diferite la fiecare rulare:\n\nSurse de date comune:\n1. `@ValueSource`: Pentru liste simple de tipuri primitive sau siruri (`strings = {\"\", \"   \", \"abc\"}`).\n2. `@CsvSource`: Pentru seturi de argumente multiple pe rand (intrare si iesire asteptata).\n3. `@MethodSource`: Pentru fluxuri complexe de obiecte generate de o metoda statica ajutatoare (`Stream<Arguments>`).\n4. `@EnumSource`: Pentru a trece prin toate valorile unui `Enum`.",
    codeSnippet: `// Exemplu CsvSource (intrare, asteptat):
@ParameterizedTest(name = "Palindrom: {0} -> asteptat {1}")
@CsvSource({
    "radar, true",
    "capac, true",
    "java, false",
    "aerian, false"
})
void testEstePalindrom(String cuvant, boolean asteptat) {
    assertEquals(asteptat, StringUtils.estePalindrom(cuvant));
}`,
    interviewTrap: "Nu uita sa inlocuiesti adnotarea `@Test` cu `@ParameterizedTest`! Daca le pui pe amandoua pe aceeasi metoda, JUnit va incerca sa execute testul si fara parametri si va arunca eroare.",
    keyTakeaway: "`@ParameterizedTest` combinat cu `@CsvSource` sau `@MethodSource` testeaza zeci de cazuri limita fara a duplica linii de cod."
  },
  {
    id: "test-09",
    category: "TESTING",
    difficulty: "USOR",
    title: "Organizarea Testelor in JUnit 5: @DisplayName si @Nested",
    question: "Cum folosesti `@DisplayName` si `@Nested` pentru a transforma o clasa de test intr-o documentatie vie (stil BDD)?",
    answer: "1. `@DisplayName`:\n   - Inlocuieste numele tehnice de metode (ex: `testFindUserById_whenUserExists_returnsUser()`) cu descrieri clare in limbaj natural.\n   - Raportul de test devine lizibil pentru oricine (inclusiv Product Owners si QA).\n\n2. `@Nested`:\n   - Permite crearea de clase interne (inner classes) pentru gruparea logica a testelor pe scenarii sau stari (ex: \"cand utilizatorul este logat\", \"cand cosul este gol\").\n   - Fiecare clasa `@Nested` poate avea propriul sau `@BeforeEach` dedicat, mostenind si contextul parintelui!\n   - Structura genereaza un arbore ierarhic frumos in rapoartele din IntelliJ/CI-CD.",
    codeSnippet: `@DisplayName("Gestiune Cos de Cumparaturi")
class CosTest {
    @Nested
    @DisplayName("Cand cosul este gol")
    class CosGol {
        @Test
        @DisplayName("totalul de plata trebuie sa fie 0 RON")
        void totalZero() { ... }
    }
    
    @Nested
    @DisplayName("Cand are produse adaugate")
    class CosCuProduse {
        @BeforeEach void adaugaProdus() { ... }
        @Test
        @DisplayName("trebuie sa aplice reducerea de 10%")
        void aplicaDiscount() { ... }
    }
}`,
    interviewTrap: "Clasele adnotate cu `@Nested` NU pot fi statice (`non-static inner classes`) in configuratia implicita JUnit 5.",
    keyTakeaway: "`@DisplayName` ofera descrieri umane testelor, iar `@Nested` structureaza scenariile ierarhic pe stari de context."
  },
  {
    id: "test-10",
    category: "TESTING",
    difficulty: "USOR",
    title: "Prevenirea Testelor Blocate: @Timeout si @Disabled",
    question: "Cum dezactivezi temporar un test si cum previi ca un test lent sau blocat intr-o bucla sa opreasca tot pipeline-ul CI/CD?",
    answer: "1. `@Disabled(\"motiv\")` (Inlocuitorul lui `@Ignore` din JUnit 4):\n   - Dezactiveaza temporar executia unui test sau a unei clase intregi.\n   - Bune practici: OBLIGATORIU se specifica motivul si un link catre un tichet Jira (`@Disabled(\"Bug deschis pe Jira #1042\")`).\n\n2. `@Timeout` (Prevenirea blocajelor):\n   - Seteaza o limita maxima de timp pentru executia unui test (ex: `@Timeout(value = 2, unit = TimeUnit.SECONDS)`).\n   - Daca testul ramane blocat intr-o bucla infinita sau un deadlock de retea, JUnit 5 il intrerupe fortat si il marcheaza ca ESUAT.\n   - Poate fi configurat si global in `junit-platform.properties` pentru toate testele din proiect.",
    codeSnippet: `@Test
@Timeout(value = 500, unit = TimeUnit.MILLISECONDS)
void testAlgoritmSortareRapid() {
    // Daca algoritmul intra in bucla infinita, testul pica dupa 0.5s!
    algoritm.executa();
}

@Test
@Disabled("Dezactivat temporar pana la release-ul API-ului partener v2")
void testIntegrarePartener() { ... }`,
    interviewTrap: "Nu lasa teste cu `@Disabled` uitate cu lunile in proiect! Testele dezactivate sunt datorii tehnice care ascund adesea cod stricat.",
    keyTakeaway: "`@Timeout` opreste testele blocate dupa o limita de timp, iar `@Disabled` opreste testele temporar documentand motivul."
  },
  {
    id: "test-11",
    category: "TESTING",
    difficulty: "USOR",
    title: "Soft Assertions cu assertAll in JUnit 5",
    question: "Ce problema rezolva `assertAll()` in comparatie cu asertiunile obisnuite scrise una dupa alta?",
    answer: "1. Problema asertiunilor secventiale obisnuite:\n   - Daca scrii 5 asertiuni `assertEquals()` consecutive intr-un test, iar prima asertiune esueaza:\n   - Executia metodei de test se opreste IMEDIAT cu `AssertionError`!\n   - Celelalte 4 asertiuni nu se mai executa deloc, lasandu-te in intuneric cu privire la starea celorlalte proprietati ale obiectului.\n\n2. Solutia: `assertAll()` (Soft Assertions):\n   - Primeste o lista de expresii lambda si le executa pe TOATE, indiferent de esecuri intermediare.\n   - La final, aduna toate erorile si afiseaza un raport complet cu TOATE asertiunile picate intr-un singur ecran!",
    codeSnippet: `@Test
void candCreeazaAngajat_toateProprietatileTrebuieSaFieCorecte() {
    Angajat angajat = angajatService.creeaza("Ion", "Popescu", 5000.0);
    
    assertAll("Validare date angajat",
        () -> assertEquals("Ion", angajat.getPrenume()),
        () -> assertEquals("Popescu", angajat.getNume()),
        () -> assertEquals(5000.0, angajat.getSalariu()),
        () -> assertTrue(angajat.isActiv())
    );
}`,
    interviewTrap: "Fara `assertAll()`, programatorul repara prima eroare, re-ruleaza testul, pica a doua eroare, repara, re-ruleaza... irosind zeci de minute de cicluri de build!",
    keyTakeaway: "`assertAll()` executa toate asertiunile dintr-un grup chiar daca unele pica, raportand simultan toate discrepantele gasite."
  },
  {
    id: "test-12",
    category: "TESTING",
    difficulty: "USOR",
    title: "AssertJ vs Asertiuni Standard JUnit: De Ce Este Preferat AssertJ",
    question: "De ce este biblioteca AssertJ preferata in majoritatea proiectelor moderne Spring Boot in locul metodelor standard `assertEquals`?",
    answer: "AssertJ ofera un API fluent (Fluent Assertions) bazat pe `assertThat()`:\n\nAvantaje majore:\n1. Ordine Intuitiva si Predictibila:\n   - In JUnit standard este usor sa inversezi ordinea parametrilor: `assertEquals(expected, actual)`.\n   - In AssertJ este intotdeauna `assertThat(actual).isEqualTo(expected)`.\n2. Autocompletare inteligenta in IDE:\n   - Cand tastezi `assertThat(lista).`, IDE-ul iti sugereaza automat metode specifice pentru colectii: `hasSize()`, `contains()`, `doesNotContain()`, `isEmpty()`.\n   - Pe siruri de caractere: `startsWith()`, `containsIgnoringCase()`, `matches(regex)`.\n3. Mesaje de eroare incredibil de clare:\n   - Cand pica o comparatie de colectii sau obiecte, AssertJ deseneaza exact diferentele dintre elemente.",
    codeSnippet: `// JUnit Standard (Greoi):
assertEquals(3, lista.size());
assertTrue(lista.contains("Java"));

// AssertJ (Fluid, elegant si usor de citit):
assertThat(lista)
    .hasSize(3)
    .contains("Java", "Spring")
    .doesNotContain("PHP");`,
    interviewTrap: "AssertJ vine inclus automat in `spring-boot-starter-test`! Nu trebuie adaugata nicio dependinta suplimentara in pom.xml.",
    keyTakeaway: "AssertJ ofera asertiuni fluente, usor de compus, cu autocompletare perfecta in IDE si mesaje detaliate de eroare."
  },
  {
    id: "test-13",
    category: "TESTING",
    difficulty: "USOR",
    title: "Piramida Testarii (Test Pyramid) a lui Martin Fowler",
    question: "Ce este Piramida Testarii si de ce majoritatea testelor dintr-un proiect trebuie sa fie teste unitare?",
    answer: "Piramida Testarii imparte testele pe 3 niveluri proportionale:\n\n1. Baza: Teste Unitare (Unit Tests - ~70% din total):\n   - Testeaza functii si clase individuale in izolare totala (folosind mock-uri pentru dependinte).\n   - Caracteristici: Se executa in cateva milisecunde, sunt ieftine de scris si mentinut, ruleaza mii pe secunda.\n\n2. Mijloc: Teste de Integrare (Integration Tests - ~20% din total):\n   - Testeaza interactiunea dintre 2 sau mai multe componente reale (ex: Spring Controller cu Baza de Date PostgreSQL via Testcontainers).\n   - Mai lente (cateva secunde), dar valideaza interogarile SQL si configuratiile reale.\n\n3. Varf: Teste End-to-End (E2E / UI Tests - ~10% din total):\n   - Testeaza fluxul complet al utilizatorului prin browser (Playwright, Selenium, Cypress).\n   - Foarte lente, costisitoare si fragile la mici schimbari de interfata (flaky).\n\nAntipattern-ul \"Inghetata la cornet\" (Ice Cream Cone Anti-pattern):\n- Proiecte care au putine teste unitare si bazeaza calitatea pe sute de teste E2E manuale sau automate lente.",
    codeSnippet: `      /\\     <- Teste E2E (10% - Lente, scumpe, fragile)
     /  \\    
    /----\\   <- Teste de Integrare (20% - Testcontainers, Spring slices)
   /      \\  
  /--------\\ <- Teste Unitare (70% - JUnit 5 + Mockito, mii in 2 secunde)`,
    interviewTrap: "Daca incerci sa testezi toate cazurile de eroare posibile (validari de campuri nule, regex-uri) doar prin teste E2E sau `@SpringBootTest`, pipeline-ul de CI/CD va dura 45 de minute in loc de 2 minute.",
    keyTakeaway: "Piramida Testarii recomanda o baza solida de teste unitare rapide (70%), un strat de integrare (20%) si putine teste E2E la varf (10%)."
  },
  {
    id: "test-14",
    category: "TESTING",
    difficulty: "USOR",
    title: "Teste Unitare vs Teste de Integrare: Diferente Cheie",
    question: "Care sunt diferentele fundamentale intre un test unitar si un test de integrare in Java/Spring?",
    answer: "Diferente fundamentale:\n\n1. Test Unitar (Unit Test):\n   - Domeniu de aplicare: O singura clasa sau metoda izolata.\n   - Dependinte: Toate dependintele externe (baze de date, API-uri REST, alte servicii) sunt complet simulate prin MOCK-URI (Mockito).\n   - Context Spring: NU porneste ApplicationContext-ul Spring! Ruleaza ca un simplu test Java pur pe JVM in milisecunde.\n   - Scop: Valideaza logica de afaceri interna a metodei.\n\n2. Test de Integrare (Integration Test):\n   - Domeniu de aplicare: Colaborarea dintre multiple componente.\n   - Dependinte: Foloseste componente reale (o baza de date reala in Docker via Testcontainers, filesystem, context Spring).\n   - Context Spring: Porneste Spring Boot (complet cu `@SpringBootTest` sau partial cu slices `@DataJpaTest`).\n   - Scop: Valideaza maparile ORM, interogarile SQL, tranzactiile si comunicarea de retea.",
    codeSnippet: `// Test Unitar (Fara Spring, pur Mockito -> 5ms):
@ExtendWith(MockitoExtension.class)
class CalculatorServiceTest { ... }

// Test de Integrare (Porneste Spring & Docker Postgres -> 3000ms):
@SpringBootTest
@Testcontainers
class ComandaIntegrationTest { ... }`,
    interviewTrap: "Daca adaugi `@SpringBootTest` intr-un test care doar aduna doua numere sau apeleaza un mock, acel test nu este unitar! Ai adaugat un overhead de 5 secunde de pornire a contextului fara niciun motiv.",
    keyTakeaway: "Testul unitar ruleaza izolat fara context Spring in milisecunde; testul de integrare porneste componente reale pentru a valida conlucrarea lor."
  },
  {
    id: "test-15",
    category: "TESTING",
    difficulty: "USOR",
    title: "Principiile F.I.R.S.T. in Testarea Unitara",
    question: "Ce reprezinta acronimul F.I.R.S.T. pentru scrierea testelor unitare de calitate?",
    answer: "Criteriile clasice formulate de Robert C. Martin (Uncle Bob):\n\n1. F - Fast (Rapide):\n   - Testele unitare trebuie sa ruleze in milisecunde. Daca suita dureaza minute, dezvoltatorii nu o vor mai rula inainte de fiecare commit.\n\n2. I - Independent (Independente / Izolate):\n   - Niciun test nu trebuie sa depinda de rezultatul altui test! Testele trebuie sa poata fi rulate in orice ordine sau individual fara sa pice.\n\n3. R - Repeatable (Repetabile):\n   - Testul trebuie sa dea acelasi rezultat pe orice mediu: pe laptopul tau, pe masina colegului sau in pipeline-ul Linux de CI/CD, fara acces la internet sau resurse fluctuante.\n\n4. S - Self-Validating (Auto-validante):\n   - Testul are un rezultat binar clar: PASS sau FAIL (verde sau rosu). Nu trebuie sa citesti manual fisiere de log pentru a sti daca a mers!\n\n5. T - Timely (Opportune / La timp):\n   - Testele se scriu in acelasi timp cu codul de productie sau chiar inaintea lui (TDD), nu la 6 luni dupa release.",
    codeSnippet: `// Exemplu incalcare a principiului "Independent":
// Test 1: insereaza utilizatorul "Ion" in DB.
// Test 2: presupune ca "Ion" exista deja in DB!
// Daca Test 2 ruleaza primul, pica imediat.`,
    interviewTrap: "Independenta este cel mai des incalcata cand testele partajeaza variabile statice sau date dintr-o baza comuna nescuratata intre executii.",
    keyTakeaway: "F.I.R.S.T.: Testele trebuie sa fie Rapide, Independente, Repetabile, Auto-validante si scrise la Timp."
  },
  {
    id: "test-16",
    category: "TESTING",
    difficulty: "USOR",
    title: "Modelul AAA (Arrange, Act, Assert) si Given-When-Then",
    question: "Cum se structureaza corpul unui test unitar curat folosind modelul AAA sau Given-When-Then?",
    answer: "Modelul standard de lizibilitate imparte orice metoda de test in 3 sectiuni distincte:\n\n1. Arrange (sau Given):\n   - Pregatirea contextului: instantierea obiectelor, configurarea mock-urilor cu valori returnate, crearea parametrilor de intrare.\n\n2. Act (sau When):\n   - Executia metodei testate (de regula o singura linie de cod care apeleaza comportamentul dorit).\n\n3. Assert (sau Then):\n   - Verificarea rezultatelor: validarea valorii returnate (AssertJ/JUnit) si inspectarea interactiunilor cu mock-urile (`verify`).",
    codeSnippet: `@Test
void candAplicaDiscount_trebuieSaScadaPretulCuZeceLaSuta() {
    // 1. Arrange (Given)
    Produs produs = new Produs("Laptop", 1000.0);
    DiscountPolicy policy = new StandardDiscountPolicy(10);
    
    // 2. Act (When)
    double pretFinal = policy.calculeaza(produs);
    
    // 3. Assert (Then)
    assertThat(pretFinal).isEqualTo(900.0);
}`,
    interviewTrap: "Nu amesteca pasii intre ei! Daca faci asertiuni, apoi mai apelezi o metoda, apoi iar faci asertiuni, testul devine greu de citit si de inteles cand pica.",
    keyTakeaway: "Structureaza orice test in 3 faze clare: Arrange (pregateste datele), Act (executa metoda) si Assert (verifica rezultatul)."
  },
  {
    id: "test-17",
    category: "TESTING",
    difficulty: "USOR",
    title: "Test-Driven Development (TDD): Ciclul Red-Green-Refactor",
    question: "Ce este Test-Driven Development (TDD) si care sunt cei 3 pasi ai ciclului Red-Green-Refactor?",
    answer: "TDD este o tehnica de proiectare software in care testele automate sunt scrise INAINTE de codul de productie:\n\nCiclul Red - Green - Refactor:\n1. RED (Scrie un test care pica):\n   - Scrii un mic test unitar pentru functionalitatea pe care vrei sa o adaugi.\n   - Testul nici macar nu compileaza sau esueaza la rulare (starea ROSIE), demonstrand ca functionalitatea lipseste.\n\n2. GREEN (Fa testul sa treaca):\n   - Scrii minimul absolut de cod de productie necesar pentru a face testul sa devina VERDE.\n   - Nu te preocupi de eleganta sau arhitectura in aceasta milisecunda; scopul este succesul testului.\n\n3. REFACTOR (Curata si optimizeaza):\n   - Acum ca ai o plasa de siguranta (testul este verde), cureti codul: elimini duplicarile, aplici principii SOLID, redenumesti variabile.\n   - Daca gresesti ceva la refactorizare, testul devine rosu imediat!\n\nBeneficiu cheie:\n- Cod mult mai modular, decuplat si testabil din constructie.",
    codeSnippet: `Pas 1 (RED):      assertFalse(parolaValidator.esteValida("123")); // Nici nu exista clasa!
Pas 2 (GREEN):    public boolean esteValida(String p) { return p.length() >= 8; }
Pas 3 (REFACTOR): Extrage regex-ul intr-o constanta Pattern pre-compilata.`,
    interviewTrap: "TDD nu inseamna \"scriu tot codul si la final scriu teste\". Asta este traditional testing. TDD este scrierea testului ca specificatie inainte de implementare.",
    keyTakeaway: "TDD ghideaza dezvoltarea prin pasi mici: scrie un test care pica (Red), scrie codul minimal sa treaca (Green), apoi curata structura (Refactor)."
  },
  {
    id: "test-18",
    category: "TESTING",
    difficulty: "USOR",
    title: "De Ce NU Testam Metode Private Direct?",
    question: "Cum se testeaza metodele private intr-o clasa si de ce este gresit sa folosim reflectia pentru a le invoca?",
    answer: "Raspunsul standard de nivel Mid/Senior la interviu:\n\"Metodele private NU trebuie testate direct niciodata!\"\n\nDe ce:\n1. Metodele private sunt detalii de implementare ascunse (encapsulation). Utilizatorul clasei tale vede doar interfata publica.\n2. Cum se testeaza corect: O metoda privata este testata INDIRECT prin intermediul metodelor PUBLICE care o apeleaza!\n   - Daca acoperi toate cazurile de test ale metodelor publice, metoda privata este automat acoperita si testata.\n3. De ce este gresita reflectia (`ReflectionTestUtils`):\n   - Daca testezi metode private pe baza de nume via reflectie, codul de test devine fragil: daca redenumesti metoda privata in cadrul unui refactoring simplu, toate testele se vor rupe, desi comportamentul public nu s-a schimbat!\n4. Daca o metoda privata este atat de mare si complexa incat simti nevoia sa o testezi separat:\n   - Acesta este un \"Code Smell\" (clasa are prea multe responsabilitati)! Metoda privata trebuie extrasa intr-o clasa noua separata de sine statatoare, unde va deveni metoda publica si va putea fi testata curat.",
    codeSnippet: `// GRESIT (Reflectie fragila):
Method m = UserService.class.getDeclaredMethod("valideazaCNP", String.class);
m.setAccessible(true);

// CORECT:
// Testezi metoda publica inregistreazaUtilizator() pasandu-i un CNP invalid!`,
    interviewTrap: "Daca intervievatorul intreaba \"Cum testezi o metoda privata?\", raspunsul corect nu este `setAccessible(true)` sau `PowerMock`. Raspunsul corect este explicarea motivului pentru care testarea se face prin metodele publice.",
    keyTakeaway: "Testeaza comportamentul public, nu implementarea interna privata; metodele private complexe se extrag in clase noi cu metode publice."
  },
  {
    id: "test-19",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Metodelor Statice: Mockito mockStatic",
    question: "Cum se pot mock-ui metodele statice incepand cu Mockito 3.4+ si de ce trebuie folosite intr-un bloc try-with-resources?",
    answer: "In trecut, mock-uirea metodelor statice necesita instrumente greoaie precum PowerMock. De la Mockito 3.4+, suportul este nativ prin `mockStatic()`:\n\n1. De ce este obligatoriu `try-with-resources`:\n   - O metoda statica (ex: `LocalDate.now()` sau `UUID.randomUUID()`) este partajata la nivelul intregului ClassLoader al JVM-ului!\n   - Daca mock-uiesti o metoda statica si uiti sa o inchizi la finalul testului, mock-ul va ramane activ si va corupe TOATE celelalte teste care ruleaza ulterior in proiect!\n   - `MockedStatic` implementeaza `AutoCloseable`, garantand ca mock-ul static este distrus automat cand se iese din blocul try.",
    codeSnippet: `@Test
void candGenereazaToken_trebuieSaFoloseascaDataFixata() {
    LocalDate dataFixa = LocalDate.of(2026, 10, 2);
    
    try (MockedStatic<LocalDate> mockedTime = mockStatic(LocalDate.class)) {
        mockedTime.when(LocalDate::now).thenReturn(dataFixa);
        
        Token token = tokenService.genereaza();
        assertThat(token.getDataCreare()).isEqualTo(dataFixa);
    }
    // Aici LocalDate.now() revine automat la ceasul real al sistemului!
}`,
    interviewTrap: "Nu abuza de `mockStatic`! In loc sa mock-uiesti `LocalDateTime.now()`, este mult mai curat din punct de vedere arhitectural sa injectezi un bean `java.time.Clock` in clasa ta de serviciu.",
    keyTakeaway: "`mockStatic()` se inchide intotdeauna intr-un bloc `try-with-resources` pentru a nu contamina restul suitei de teste cu starea statica mockuita."
  },
  {
    id: "test-20",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Metodelor void in Mockito",
    question: "Cum configurezi un mock sa arunce o exceptie cand este apelata o metoda care nu returneaza nimic (void)?",
    answer: "Deoarece metodele `void` nu returneaza nimic, nu poti scrie `when(mock.metodaVoid()).thenThrow(...)` (eroare de compilare).\n\nSintaxa corecta pentru metode void:\n1. Aruncare de exceptie:\n   `doThrow(new RuntimeException(\"Eroare disc\")).when(fisierService).salveaza(any());`\n\n2. Executie silentioasa fara eroare (comportamentul implicit, dar explicitat):\n   `doNothing().when(emailService).trimiteEmail(any());`\n\n3. Executare de cod custom la apel (callbacks):\n   `doAnswer(invocation -> { ... return null; }).when(mock).metodaVoid();`",
    codeSnippet: `@Test
void candStergereaEsueaza_trebuieSaArunceServiceException() {
    // Configurarea exceptiei pe metoda void stergeFisier():
    doThrow(new IOException("Disc indisponibil"))
        .when(storageService).stergeFisier("raport.pdf");
        
    assertThrows(ServiceException.class, () -> raportManager.elimina("raport.pdf"));
}`,
    interviewTrap: "Daca incerci `when(serviciu.metodaVoid())`, vei primi eroarea `'void' type not allowed here`. Tine minte: metodele void incep intotdeauna cu `do...().when()`.",
    keyTakeaway: "Metodele void se configureaza prin familia `doThrow()`, `doNothing()`, `doAnswer()` urmate de `.when(mock).metoda()`. "
  },
  {
    id: "test-21",
    category: "TESTING",
    difficulty: "USOR",
    title: "@ExtendWith(MockitoExtension.class) vs openMocks()",
    question: "Ce rol are adnotarea `@ExtendWith(MockitoExtension.class)` si ce se intampla daca o uiti?",
    answer: "1. Rolul adnotarii:\n   - Este extensia oficiala JUnit 5 pentru Mockito.\n   - Ea scaneaza automat clasa de test, instantiaza campurile marcate cu `@Mock` si `@Spy`, si le injecteaza in campul marcat cu `@InjectMocks`.\n   - La finalul fiecarui test, valideaza utilizarea corecta a stub-urilor (detecteaza mock-uri nefolosite sau greseli de configurare).\n\n2. Ce se intampla daca o uiti:\n   - Toate campurile `@Mock` si `@InjectMocks` vor ramane egale cu `null`!\n   - La prima rulare a testului, vei primi instant `NullPointerException` la apelul metodei.\n\n3. Alternativa legacy (JUnit 4):\n   - Inainte se apela manual `AutoCloseable mocks = MockitoAnnotations.openMocks(this);` in `@BeforeEach`. Cu `@ExtendWith` aceasta munca manuala este eliminata.",
    codeSnippet: `@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {
    @Mock private BankClient bankClient; // Nu va mai fi null!
    @InjectMocks private PaymentService paymentService;
    
    @Test void testPlata() { ... }
}`,
    interviewTrap: "Daca folosesti `@SpringBootTest`, nu mai ai nevoie de `@ExtendWith(MockitoExtension.class)` deoarece Spring Boot include deja extensia Spring (`SpringExtension`).",
    keyTakeaway: "`@ExtendWith(MockitoExtension.class)` activeaza procesarea adnotarilor `@Mock` si `@InjectMocks` in testele unitare pure JUnit 5."
  },
  {
    id: "test-22",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Verificarea Ordinii de Apel cu InOrder in Mockito",
    question: "Cum verifici ca doua sau mai multe metode ale unor mock-uri diferite au fost apelate intr-o ordine stricta secventiala?",
    answer: "In mod implicit, `verify(mock).metoda()` verifica doar daca metoda a fost apelata, indiferent daca a fost prima, a doua sau ultima.\n\nCand conteaza ordinea:\n- Intr-o tranzactie: trebuie mai intai sa verifici stocul (`valideazaStoc()`), apoi sa debitezi cardul (`debiteaza()`), si abia la final sa confirmi comanda (`confirma()`). Daca ordinea ar fi inversata, aplicatia ar avea un bug grav!\n\nCum se foloseste `inOrder()`:\n1. Se creeaza un obiect `InOrder` caruia i se paseaza mock-urile implicate:\n   `InOrder inOrder = inOrder(stocService, bancaService, comandaRepo);`\n2. Se apeleaza verificarile in ordinea stricta dorita:\n   `inOrder.verify(stocService).blocheaza();`\n   `inOrder.verify(bancaService).debiteaza();`\n   `inOrder.verify(comandaRepo).save();`",
    codeSnippet: `@Test
void fluxulDePlataTrebuieSaUrmezeOrdineaStricta() {
    comandaService.proceseaza(comanda);
    
    InOrder inOrder = inOrder(stocService, plataService);
    inOrder.verify(stocService).rezervaStoc(any());
    inOrder.verify(plataService).efectueazaPlata(any());
}`,
    interviewTrap: "Daca o metoda este apelata intre cei doi pasi dar nu o incluzi in `inOrder.verify()`, Mockito va trece testul cu succes daca nu folosesti si `inOrder.verifyNoMoreInteractions()`.",
    keyTakeaway: "Obiectul `InOrder` garanteaza ca operatiunile critice sunt executate intr-o secventa temporala corecta."
  },
  {
    id: "test-23",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Clasificarea Test Doubles: Dummy vs Stub vs Fake vs Mock vs Spy",
    question: "Care sunt cele 5 tipuri de \"duble de testare\" (Test Doubles) definite de Gerard Meszaros?",
    answer: "Multi programatori numesc orice obiect fals \"Mock\". Exista 5 tipuri distincte:\n\n1. Dummy:\n   - Obiecte trimise doar pentru a umple liste de parametri obligatorii (ex: pasezi `new User()` sau null doar pentru ca metoda cere un parametru, dar nu este folosit niciodata in test).\n\n2. Stub:\n   - Ofera raspunsuri pre-stabilite fixe la apeluri (ex: cand se apeleaza `getPret()`, returneaza mereu 100.0). Nu verifica interactiuni.\n\n3. Spy:\n   - Un spion care inregistreaza informatii despre cum a fost apelat (cate apeluri s-au facut, cu ce parametri), pastrand implementarea reala.\n\n4. Mock:\n   - Un obiect pre-programat cu asteptari pe care le verifica (verificare de comportament prin `verify`).\n\n5. Fake:\n   - O implementare complet functionala, dar usoara si nepotrivita pentru productie (ex: o baza de date in-memory simulata printr-un `HashMap` in loc de PostgreSQL real).",
    codeSnippet: `// Dummy: new ObiectInutil()
// Stub:  when(repo.find(1)).thenReturn(userConstruita)
// Mock:  verify(emailSender).trimite(any())
// Spy:   spy(realList)
// Fake:  class InMemoryUserRepository implements UserRepository { Map map = ... }`,
    interviewTrap: "La interviuri, candidatii spun ca \"Mock si Stub sunt acelasi lucru\". Diferenta cheie: Stub-ul asigura doar date de intrare (State verification); Mock-ul verifica apelurile si comportamentul (Behavior verification).",
    keyTakeaway: "Dummy umple parametri, Stub returneaza date fixe, Spy inregistreaza apeluri reale, Mock verifica comportamentul, iar Fake este o implementare simplificata."
  },
  {
    id: "test-24",
    category: "TESTING",
    difficulty: "USOR",
    title: "@SpringBootTest: Incarcarea Contextului Complet",
    question: "Ce face adnotarea `@SpringBootTest`, cand este recomandata si care este costul ei de performanta?",
    answer: "1. Ce face:\n   - Cauta clasa principala adnotata cu `@SpringBootApplication` si porneste intregul `ApplicationContext` Spring, creand toate bean-urile, injectiile de dependinte si configuratiile reale.\n   - Daca este configurat cu `webEnvironment = WebEnvironment.RANDOM_PORT`, porneste si un server web real (Tomcat) pe un port aleator.\n\n2. Cand se foloseste:\n   - Pentru teste complete de integrare (End-to-End la nivel de backend), cand vrei sa testezi ca toate componentele se leaga si pornesc impreuna corect.\n\n3. Costul de performanta:\n   - Pornirea intregului context poate dura intre 3 si 15 secunde per clasa de test!\n   - Daca ai 100 de clase cu `@SpringBootTest` fara reutilizare de context, suita de teste va dura zeci de minute.\n   - Recomandare: Foloseste Test Slices (`@WebMvcTest`, `@DataJpaTest`) ori de cate ori este posibil.",
    codeSnippet: `@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class AplicatieCompletaIntegrationTest {
    @Autowired private TestRestTemplate restTemplate;
    
    @Test
    void testSanatateAplicatie() {
        ResponseEntity<String> response = restTemplate.getForEntity("/actuator/health", String.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}`,
    interviewTrap: "Daca fiecare clasa `@SpringBootTest` foloseste configuratii diferite (profiluri diferite, `@MockBean` diferit pe servicii diferite), Spring este obligat sa creeze un nou ApplicationContext de la zero pentru fiecare, incetinind masiv suita de teste!",
    keyTakeaway: "`@SpringBootTest` incarca intregul context Spring pentru teste integratoare reale; este puternic dar scump ca timp de executie."
  },
  {
    id: "test-25",
    category: "TESTING",
    difficulty: "USOR",
    title: "@WebMvcTest: Slice Test Rapid pentru Controller",
    question: "Ce componente incarca `@WebMvcTest` si de ce ruleaza mult mai rapid decat `@SpringBootTest`?",
    answer: "`@WebMvcTest` este un \"Slice Test\" dedicat exclusiv stratului web de prezentare (Controllers):\n\n1. Ce incarca in memorie:\n   - DOAR componentele legate de MVC: clasa Controller specificata, `@ControllerAdvice`, filtre HTTP, convertoare Jackson JSON si configurari Spring Security.\n   - NU incarca: `@Service`, `@Repository`, baze de date sau componente de infrastructura!\n\n2. Cum gestionam serviciile dependente:\n   - Serviciile de business apelate de controller trebuie declarate ca `@MockBean` (sau `@MockitoBean` in Spring Boot 3.4+).\n\n3. De ce este rapid:\n   - Porneste in sub o secunda (in loc de 10 secunde), deoarece 80% din aplicatie este ignorata.\n   - Ofera automat o instanta de `MockMvc` gata configurata pentru a trimite cereri HTTP simulate.",
    codeSnippet: `@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private UserService userService; // Simulam stratul de service

    @Test
    void candCerUserExistent_trebuieSaIntoarca200() throws Exception {
        when(userService.findById(1L)).thenReturn(new UserDto("Ana"));
        
        mockMvc.perform(get("/api/users/1"))
               .andExpect(status().isOk())
               .andExpect(jsonPath("$.nume").value("Ana"));
    }
}`,
    interviewTrap: "Daca uiti sa pui `@MockBean` pe un serviciu injectat in controller, contextul `@WebMvcTest` va esua la pornire cu `NoSuchBeanDefinitionException`.",
    keyTakeaway: "`@WebMvcTest` testeaza rapid doar rutarea HTTP, validarile si serializarea JSON din controllere, simuland serviciile prin `@MockBean`."
  },
  {
    id: "test-26",
    category: "TESTING",
    difficulty: "USOR",
    title: "MockMvc: Testarea Endpoint-urilor REST Fara Server Web Real",
    question: "Cum functioneaza `MockMvc` si cum permite testarea API-urilor REST fara a deschide un socket de retea real?",
    answer: "1. Cum functioneaza `MockMvc`:\n   - Simuleaza apelurile HTTP direct in interiorul containerului Servlet Spring (DispatcherServlet), FARA a porni un server web fizic (Tomcat) si fara a ocupa un port TCP de retea.\n   - Cererea HTTP este construita ca un obiect Java (`MockHttpServletRequest`) si trimisa direct catre `DispatcherServlet`.\n\n2. Ce valideaza cu precizie:\n   - Codurile de stare HTTP (200, 201, 400, 404, 500).\n   - Antetele HTTP (Content-Type, Location, ETag).\n   - Rutele si maparile URL (`@GetMapping`, `@PostMapping`).\n   - Validarile Jakarta Validation (`@Valid` pe DTO-uri).\n   - Continutul corpului de raspuns (JSON sau Text) prin `jsonPath()`.",
    codeSnippet: `@Autowired private MockMvc mockMvc;

@Test
void testCreareJob() throws Exception {
    mockMvc.perform(post("/api/jobs")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\\"title\\":\\"Java Dev\\",\\"salary\\":5000}"))
        .andExpect(status().isCreated()) // HTTP 201
        .andExpect(header().exists("Location"))
        .andExpect(jsonPath("$.title").value("Java Dev"));
}`,
    interviewTrap: "Desi `MockMvc` testeaza excelent logica Spring MVC, el nu testeaza comportamentul real al unui server de retea (cum ar fi negocierea HTTP/2 sau timeout-urile reale de socket TCP).",
    keyTakeaway: "`MockMvc` testeaza intregul pipeline Spring MVC rapid in memorie, fara costul pornirii unui server web pe un port de retea."
  },
  {
    id: "test-27",
    category: "TESTING",
    difficulty: "USOR",
    title: "Validarea JSON cu MockMvc ResultMatchers jsonPath()",
    question: "Cum se utilizeaza sintaxa JSONPath in testele MockMvc pentru a verifica array-uri si campuri imbricate?",
    answer: "JSONPath este echivalentul lui XPath pentru documente JSON, integrat direct in MockMvc:\n\nSintaxa fundamentala:\n- `$` : Radacina documentului JSON.\n- `$.nume` : Accesarea campului `nume` de la radacina.\n- `$.adresa.oras` : Accesarea campului imbricat `oras` din obiectul `adresa`.\n- `$.articole.length()` : Verificarea dimensiunii unui array JSON.\n- `$.articole[0].titlu` : Primul element din lista de articole.\n- `$.articole[*].id` : Colectarea tuturor ID-urilor din lista.",
    codeSnippet: `mockMvc.perform(get("/api/comenzi/42"))
    .andExpect(status().isOk())
    .andExpect(jsonPath("$.id").value(42))
    .andExpect(jsonPath("$.client.email").value("ana@test.ro"))
    .andExpect(jsonPath("$.produse", hasSize(2)))
    .andExpect(jsonPath("$.produse[0].pret").value(150.0))
    .andExpect(jsonPath("$.status").value("EXPEDIATA"));`,
    interviewTrap: "Daca verifici numere zecimale (ex: 150.0), ai grija la tipuri! JSON nu distinge intre float si double; foloseste matcheri flexibili sau compara valori numerice compatibile.",
    keyTakeaway: "`jsonPath(\"$.camp\")` inspecteaza precis proprietatile, array-urile si obiectele imbricate din corpul raspunsului JSON."
  },
  {
    id: "test-28",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "@MockBean vs @Mock in Spring Boot",
    question: "Care este diferenta esentiala intre `@Mock` din Mockito pur si `@MockBean` din Spring Boot?",
    answer: "Diferenta critica legata de contextul Spring:\n\n1. `@Mock` (Mockito pur):\n   - Creeaza un obiect mock izolat in memorie.\n   - NU are nicio legatura cu Spring Framework si ApplicationContext-ul sau.\n   - Se foloseste in teste unitare pure cu `@ExtendWith(MockitoExtension.class)`.\n\n2. `@MockBean` (Spring Boot Test / nou `@MockitoBean` in Spring Boot 3.4+):\n   - Creeaza un mock Mockito SI IL INREGISTREAZA in ApplicationContext-ul Spring!\n   - Daca exista deja un bean real de acel tip in context, `@MockBean` il INLOCUIESTE complet pe toata durata testului.\n   - Toate celelalte bean-uri reale din aplicatie care aveau nevoie de acea dependinta vor primi mock-ul automat.\n   - Se foloseste in teste de integrare sau teste de slice (`@WebMvcTest`, `@SpringBootTest`).",
    codeSnippet: `// Test Unitar pur (0 Spring): folosesti @Mock
@ExtendWith(MockitoExtension.class)
class ServiceTest {
    @Mock private Repo repo;
}

// Test WebMvcTest (cu Spring Context): folosesti @MockBean
@WebMvcTest(OrderController.class)
class ControllerTest {
    @MockBean private OrderService orderService; // Inlocuieste bean-ul din context!
}`,
    interviewTrap: "Fiecare combinatie diferita de `@MockBean` forteaza Spring sa creeze un nou ApplicationContext (murdareste cache-ul de contexte), incetinind rularea suitei de teste daca este abuzat.",
    keyTakeaway: "`@Mock` este pentru teste unitare fara Spring; `@MockBean` inlocuieste un bean real direct in containerul IoC Spring."
  },
  {
    id: "test-29",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "@SpyBean in Spring Boot",
    question: "Ce este `@SpyBean` in Spring Boot Test si cand este util?",
    answer: "`@SpyBean` (similar cu `@Spy`) infasoara un bean REAL existent din ApplicationContext-ul Spring intr-un spion Mockito:\n\nCaracteristici:\n- Bean-ul real este pastrat si metodele sale reale se executa in continuare in mod normal.\n- Iti permite sa:\n  1. Spionezi si verifici interactiunile: `verify(auditService, times(1)).inregistreazaLog(any())`.\n  2. Suprascrii selectiv doar o singura metoda dintr-un bean complex, lasand restul de 10 metode sa ruleze codul lor real.\n\nCaz de utilizare tipic:\n- Intr-un test de integrare, vrei ca toata comanda sa se execute real in baza de date, dar vrei doar sa verifici ca `notificareService.trimitePush()` a fost apelata cu parametrii corecti fara a trimite notificarea fizica.",
    codeSnippet: `@SpringBootTest
class ComandaIntegrationTest {
    @Autowired private ComandaService comandaService;
    @SpyBean private NotificareService notificareService; // Bean real spionat

    @Test
    void candPlaseazaComanda_trebuieSaLoghezeSiSaNotifice() {
        comandaService.plaseazaComanda(new ComandaDto());
        
        // Metoda reala a rulat, dar putem verifica interactiunea:
        verify(notificareService).trimiteEmailConfirmare(any());
    }
}`,
    interviewTrap: "Daca suprascrii o metoda pe un `@SpyBean`, foloseste `doReturn().when(spyBean).metoda()`! Daca folosesti `when()`, metoda reala se va executa o data in timpul configurarii testului.",
    keyTakeaway: "`@SpyBean` pastreaza bean-ul real in contextul Spring dar permite monitorizarea interactiunilor si modificarea punctuala a comportamentului."
  },
  {
    id: "test-30",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "@DataJpaTest: Slice Test pentru Stratul de Persistenta",
    question: "Ce face adnotarea `@DataJpaTest` si cum asigura izolarea datelor intre teste prin rollback automat?",
    answer: "`@DataJpaTest` este un slice test focalizat strict pe stratul de JPA si Hibernate:\n\n1. Ce configureaza:\n   - Scaneaza doar entitatile adnotate cu `@Entity` si interfetele de `@Repository` Spring Data JPA.\n   - Configureaza automat o baza de date in-memory sau Testcontainers.\n   - Injecteaza un utilitar puternic `TestEntityManager` pentru pregatirea datelor brute.\n\n2. Rollback Automat dupa FIECARE test:\n   - In mod implicit, `@DataJpaTest` marcheaza fiecare metoda `@Test` ca `@Transactional`.\n   - La sfarsitul fiecarui test, Spring executa AUTOMAT un `ROLLBACK` al tranzactiei!\n   - Nicio data inserata de Testul 1 nu ramane in baza pentru Testul 2, asigurand o izolare perfecta si repetabilitate.",
    codeSnippet: `@DataJpaTest
class UtilizatorRepositoryTest {
    @Autowired private UtilizatorRepository repo;
    @Autowired private TestEntityManager entityManager;

    @Test
    void testFindByEmail() {
        entityManager.persist(new Utilizator("dan@test.ro", "Dan"));
        entityManager.flush();
        
        Optional<Utilizator> gasit = repo.findByEmail("dan@test.ro");
        assertThat(gasit).isPresent();
    } // Aici Spring da automat ROLLBACK!
}`,
    interviewTrap: "Deoarece ruleaza cu rollback automat, Hibernate poate amana scrierea pe disc (nu da `flush`). Daca testezi constrangeri de baza (ex: unique constraint), apeleaza manual `entityManager.flush()` pentru a forta executia SQL-ului!",
    keyTakeaway: "`@DataJpaTest` testeaza doar entitatile si repository-urile JPA, curatand automat baza de date prin rollback la finalul fiecarui test."
  },
  {
    id: "test-31",
    category: "TESTING",
    difficulty: "USOR",
    title: "@JsonTest: Testarea Serializarii si Deserializarii Jackson",
    question: "Ce testeaza adnotarea `@JsonTest` si cum previi bug-urile legate de formate de date si campuri lipsa?",
    answer: "`@JsonTest` testeaza exclusiv serializarea (Obiect Java -> JSON) si deserializarea (JSON -> Obiect Java) folosind Jackson:\n\nCe verifica:\n1. Adnotarile Jackson: `@JsonProperty(\"nume_complet\")`, `@JsonIgnore`, `@JsonInclude(Include.NON_NULL)`.\n2. Serializarea tipurilor de date moderne: `LocalDateTime` formatat corect conform standardului ISO-8601 (`\"2026-10-02T14:30:00\"`).\n3. Deserializarea pe baza de constructori si Records (`java.lang.Record`).\n\nUtilitar dedicat:\n- Ofera `JacksonTester<T>` care permite asertiuni fluente atat pe sirul JSON rezultat, cat si pe obiectul reconstituit.",
    codeSnippet: `@JsonTest
class UtilizatorDtoJsonTest {
    @Autowired private JacksonTester<UtilizatorDto> json;

    @Test
    void testSerializare() throws IOException {
        UtilizatorDto dto = new UtilizatorDto("Mihai", "parolaSecreta");
        
        // Parola are @JsonIgnore, nu trebuie sa apara in JSON:
        assertThat(json.write(dto)).hasJsonPathStringValue("@.nume", "Mihai");
        assertThat(json.write(dto)).doesNotHaveJsonPath("parola");
    }
}`,
    interviewTrap: "Multe bug-uri de securitate apar cand o parola sau un CNP este serializat accidental intr-un raspuns REST. `@JsonTest` previne aceste brese inainte de deploy.",
    keyTakeaway: "`@JsonTest` testeaza rapid maparile JSON si adnotarile Jackson fara a porni controllere sau servere web."
  },
  {
    id: "test-32",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "@RestClientTest: Testarea Clientilor HTTP Externi",
    question: "Cum testezi o clasa de serviciu care apeleaza un API extern (cu RestTemplate sau RestClient) fara a face apeluri reale prin internet?",
    answer: "`@RestClientTest` este slice test-ul dedicat testarii clientilor REST interni:\n\nCum functioneaza:\n- Configureaza automat clasa de serviciu specificata si un server simulat in memorie: `MockRestServiceServer`.\n- Cand serviciul tau executa un apel HTTP (ex: catre Stripe sau Google Maps), apelul este interceptat inainte de a parasi JVM-ul!\n- Tu pre-programezi serverul de mock sa verifice URL-ul cerut si sa returneze un raspuns JSON simulat (sau o eroare `500 Internal Server Error`).\n\nBeneficii:\n- Testeaza complet logica de parsare, headerele de autorizare si tratarea erorilor HTTP fara sa depinzi de conexiunea la internet sau de serverul partener.",
    codeSnippet: `@RestClientTest(BnrExchangeClient.class)
class BnrExchangeClientTest {
    @Autowired private BnrExchangeClient client;
    @Autowired private MockRestServiceServer server;

    @Test
    void testGetCursValutar() {
        server.expect(requestTo("https://api.bnr.ro/curs/EUR"))
              .andRespond(withSuccess("{\\"rate\\": 4.97}", MediaType.APPLICATION_JSON));
              
        BigDecimal curs = client.getCurs("EUR");
        assertThat(curs).isEqualByComparingTo("4.97");
    }
}`,
    interviewTrap: "Daca nu folosesti `@RestClientTest` si apelezi un API extern direct in teste, testele tale vor pica ori de cate ori cade conexiunea la internet sau serverul partener intra in mentenanta!",
    keyTakeaway: "`@RestClientTest` si `MockRestServiceServer` intercepteaza apelurile HTTP ale aplicatiei tale, testand parsarea si erorile in siguranta locala."
  },
  {
    id: "test-33",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "De Ce Testcontainers a Inlocuit H2 in Industria Moderna",
    question: "Care sunt cele 3 dezavantaje majore ale bazei de date H2 in-memory care fac Testcontainers alegerea superioara?",
    answer: "Timp de multi ani, H2 a fost solutia clasica de testare in Spring Boot datorita vitezei. Astazi companiile trec masiv la Testcontainers:\n\n1. Dialect SQL si Functii Incompatibile:\n   - H2 nu este PostgreSQL! Daca folosesti functionalitati native moderne in Postgres: coloane `JSONB`, vector embeddings (`pgvector`), indecsi partiali sau operatori specifici (`ON CONFLICT DO UPDATE`), H2 va arunca erori de sintaxa.\n\n2. Comportamente Tranzactionale si Lock-uri Diferite:\n   - H2 gestioneaza concurenta si nivelele de izolare diferit fata de motoarele de productie. Un query concurent care functioneaza pe H2 poate genera Deadlocks in PostgreSQL in productie.\n\n3. Migrari Flyway / Liquibase:\n   - Scripturile de migrare de productie nu ruleaza identic pe H2, obligand echipele sa mentina doua dialecte diferite de SQL.\n\nSolutia Testcontainers:\n- Porneste un container Docker real cu versiunea EXACTA de PostgreSQL din productie (ex: `postgres:16-alpine`), eliminand complet discrepantele!",
    codeSnippet: `// Container Docker real pornit la teste:
static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");`,
    interviewTrap: "Sindromul clasic: \"Testele au fost verzi pe H2 pe masina de build, dar aplicatia a dat eroare 500 in productie pe PostgreSQL!\". Testcontainers elimina 100% aceasta capcana.",
    keyTakeaway: "H2 are dialect si comportament diferit; Testcontainers ofera fidelitate 100% cu productia folosind containere Docker reale."
  },
  {
    id: "test-34",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testcontainers cu @DynamicPropertySource in Spring Boot",
    question: "Cum configurezi dinamic url-ul, userul si parola bazei de date din containerul Testcontainers catre Spring Boot?",
    answer: "La pornirea unui container Docker Testcontainers, portul bazei de date (ex: 5432) este mapat pe un port aleator liber de pe masina gazda (ex: 49152) pentru a evita conflictele de porturi.\n\nCum stie Spring Boot pe ce port a pornit containerul:\n- Se foloseste metoda statica adnotata cu `@DynamicPropertySource`!\n- Aceasta adauga dinamic proprietatile de conectare la DataSource inainte ca Spring sa initializeze conexiunea JDBC.\n\nFluxul complet:\n1. Adnotarile `@Testcontainers` si `@Container` pe clasa de test.\n2. Containerul porneste.\n3. `@DynamicPropertySource` injecteaza `postgres.getJdbcUrl()`, `getUsername()` si `getPassword()` direct in proprietatile `spring.datasource.*`.",
    codeSnippet: `@SpringBootTest
@Testcontainers
class ComandaIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }
    
    @Test void testFluxComanda() { ... }
}`,
    interviewTrap: "Daca declari containerul ca instanta non-statica (fara `static`), Testcontainers va opri si reporni containerul pentru FIECARE clasa de test in parte, facand suita de teste extrem de lenta! Campul `static` partajeaza containerul.",
    keyTakeaway: "`@DynamicPropertySource` mapeaza dinamic portul si URL-ul generat de containerul Docker in configuratiile Spring Datasource."
  },
  {
    id: "test-35",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Optimizarea Vitezei Testcontainers: Singleton Container Pattern",
    question: "Cum eviti repornirea containerului Docker la fiecare clasa de test folosind Singleton Container Pattern?",
    answer: "Daca ai 20 de clase de test de integrare, iar fiecare clasa porneste propriul sau container Docker de PostgreSQL, suita va dura minute bune doar asteptand initializarea Docker.\n\nSolutia: Singleton Container Pattern (O singura instanta partajata):\n1. Se creeaza o clasa abstracta de baza (ex: `AbstractIntegrationTest`).\n2. Containerul PostgreSQL este pornit o singura data intr-un bloc `static` manual: `postgres.start()`.\n3. Toate clasele de test extind `AbstractIntegrationTest`.\n4. Containerul porneste o singura data la inceputul suitei si ramane activ pana cand toata suita JVM este finalizata, fiind oprit automat de demonul Ryuk al Testcontainers!\n5. Timp castigat: Zeci de secunde sau minute intregi.",
    codeSnippet: `public abstract class AbstractIntegrationTest {
    static final PostgreSQLContainer<?> postgres;
    
    static {
        postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withReuse(true); // Permite refolosirea rapida
        postgres.start();
    }
    
    @DynamicPropertySource
    static void setDatasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
    }
}`,
    interviewTrap: "Daca toate testele folosesc aceeasi baza de date din singleton container, trebuie sa te asiguri ca testele nu lasa date reziduale murdare care sa afecteze alte teste (foloseste curatare de tabele intre teste sau rollback).",
    keyTakeaway: "Singleton Container porneste Docker-ul o singura data pentru toata suita de teste, reducand dramatic timpul total de executie in CI/CD."
  },
  {
    id: "test-36",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Securitatii: @WithMockUser in Spring Security",
    question: "Cum testezi un endpoint securizat fara a trece prin fluxul complet de autentificare si login cu parole?",
    answer: "`@WithMockUser` este adnotarea standard oferita de `spring-security-test`:\n\nCe face:\n- Populeaza automat `SecurityContextHolder`-ul din Spring cu un `Authentication` simulat continand username-ul si rolurile dorite.\n- Iti permite sa testezi direct comportamentul metodelor securizate ca si cum utilizatorul ar fi deja autentificat.\n\nParametri configurabili:\n- `username`: Numele utilizatorului simulat (implicit \"user\").\n- `roles`: Rolurile utilizatorului (ex: `roles = {\"ADMIN\", \"MANAGER\"}`) - Spring adauga automat prefixul `ROLE_`.\n- `authorities`: Daca vrei permisiuni specifice fara prefixul ROLE (ex: `authorities = {\"OP_STERGERE\"}`).\n\nAlternativa pentru utilizatori neautentificati:\n- `@WithAnonymousUser`: Simuleaza un vizitator anonim (util pentru a verifica ca primeste `HTTP 401 Unauthorized`).",
    codeSnippet: `@Test
@WithMockUser(username = "admin_ion", roles = {"ADMIN"})
void candEsteAdmin_trebuieSaPermitaStergereaJobului() throws Exception {
    mockMvc.perform(delete("/api/jobs/1"))
           .andExpect(status().isNoContent()); // 204
}

@Test
@WithMockUser(roles = {"USER"})
void candEsteUserSimplu_trebuieSaIntoarca403Forbidden() throws Exception {
    mockMvc.perform(delete("/api/jobs/1"))
           .andExpect(status().isForbidden()); // 403
}`,
    interviewTrap: "Daca folosesti `roles = {\"ROLE_ADMIN\"}`, Spring Security va genera `ROLE_ROLE_ADMIN`! Cand folosesti parametrul `roles`, nu pune prefixul `ROLE_`. Foloseste `authorities` daca vrei numele exact.",
    keyTakeaway: "`@WithMockUser` simuleaza un utilizator gata logat cu roluri specifice direct in SecurityContext, facilitand testarea securitatii."
  },
  {
    id: "test-37",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Metodelor Securizate cu @PreAuthorize",
    question: "Cum testezi ca adnotarea `@PreAuthorize(\"hasRole(\\'ADMIN\\')\")` de pe un serviciu Spring blocheaza utilizatorii neautorizati?",
    answer: "Pentru a testa securitatea la nivel de metoda (`Method Security`):\n\n1. Activarea securitatii in test:\n   - Testul trebuie sa ruleze intr-un context Spring (`@SpringBootTest` sau un context cu `@EnableMethodSecurity`).\n\n2. Verificarea respingerii:\n   - Cand un utilizator fara rolul necesar apeleaza metoda, Spring Security intercepteaza apelul prin proxy AOP si arunca `AccessDeniedException`!\n   - Se valideaza folosind `assertThrows(AccessDeniedException.class, () -> serviciu.metoda())`.\n\n3. Verificarea permisiunii:\n   - Cand testul este rulat cu `@WithMockUser(roles = \"ADMIN\")`, metoda se executa cu succes.",
    codeSnippet: `@SpringBootTest
class AdminServiceSecurityTest {
    @Autowired private AdminService adminService;

    @Test
    @WithMockUser(roles = "USER")
    void utilizatorObisnuit_trebuieSaPrimeascaAccessDenied() {
        assertThrows(AccessDeniedException.class, () -> {
            adminService.repornesteServerul();
        });
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void admin_trebuieSaAibaAcces() {
        assertDoesNotThrow(() -> adminService.repornesteServerul());
    }
}`,
    interviewTrap: "Daca testezi metoda pe o instanta creata manual cu `new AdminService()`, `@PreAuthorize` nu va fi verificat niciodata! Securitatea pe metode functioneaza exclusiv prin proxy-uri Spring pe bean-uri injectate din context.",
    keyTakeaway: "Securitatea pe metode (`@PreAuthorize`) arunca `AccessDeniedException` cand rolul lipseste; testarea se face pe bean-ul Spring injectat cu `@WithMockUser`."
  },
  {
    id: "test-38",
    category: "TESTING",
    difficulty: "USOR",
    title: "Tratarea CSRF in Testele MockMvc",
    question: "De ce cererile POST din MockMvc returneaza 403 Forbidden chiar daca esti logat ca ADMIN si cum rezolvi cu `csrf()`?",
    answer: "1. De ce primesti 403 Forbidden pe POST/PUT/DELETE:\n   - Spring Security are protectia CSRF (Cross-Site Request Forgery) activata implicit pentru toate cererile de modificare a starii.\n   - Chiar daca pui `@WithMockUser(roles = \"ADMIN\")`, daca cererea `POST` nu contine un token CSRF valid in antet sau formular, filtrul de securitate o respinge imediat cu `HTTP 403 Forbidden`!\n\n2. Cum se rezolva:\n   - Se foloseste functia ajutatoare `csrf()` din `SecurityMockMvcRequestPostProcessors`:\n   - `mockMvc.perform(post(\"/api/login\").with(csrf()))`.\n   - Aceasta injecteaza automat un token CSRF valid in cerere, permitand testului sa treaca de filtru.",
    codeSnippet: `import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

@Test
@WithMockUser(roles = "ADMIN")
void testCreareCuCsrf() throws Exception {
    mockMvc.perform(post("/api/admin/utilizatori")
            .with(csrf()) // Fara csrf(), primesti 403 Forbidden instant!
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\\"nume\\":\\"Mihai\\"}"))
        .andExpect(status().isCreated());
}`,
    interviewTrap: "Daca construiesti un API pur stateless pentru aplicatii mobile sau SPA securizat cu JWT, CSRF este adesea dezactivat in configuratia Spring Security (`http.csrf(AbstractHttpConfigurer::disable)`). Insa in aplicatii web cu sesiuni cookie, `csrf()` in teste este obligatoriu.",
    keyTakeaway: "Cererile POST/PUT/DELETE protejate de Spring Security necesita `.with(csrf())` in MockMvc pentru a nu fi blocate cu 403 Forbidden."
  },
  {
    id: "test-39",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Capcana @Transactional in Testele de Integrare",
    question: "De ce punerea adnotarii `@Transactional` pe clasa de test poate ascunde bug-uri grave de `LazyInitializationException`?",
    answer: "Mecanismul `@Transactional` in teste:\n- Pune un rollback automat la finalul fiecarui test pentru a lasa baza curata.\n\nCapcana grava ascunsa (\"False Positives\"):\n1. In aplicatia reala, tranzactia se deschide si se inchide in stratul `@Service`.\n2. Cand Controller-ul primeste entitatea in productie si incearca sa acceseze o relatie `@OneToMany(fetch = FetchType.LAZY)`, tranzactia este deja inchisa, rezultand celebrul `LazyInitializationException`!\n3. INSA, daca ai pus `@Transactional` pe metoda de TEST:\n   - Tranzactia ramane deschisa pe TOATA DURATA TESTULUI (inclusiv in asertiuni)!\n   - Testul va reusi sa citeasca colectia Lazy fara nicio eroare (test verde), dar codul va pica garantat in productie in mainile utilizatorilor!",
    codeSnippet: `// CAPCANA: Testul trece, dar productia pica!
@SpringBootTest
@Transactional // Tine Hibernate Session deschisa in asertiuni!
class JobTest {
    @Test
    void testIncarcareAplicanti() {
        Job job = jobService.getJob(1L); // Service a terminat
        // In test merge pentru ca tranzactia de test e inca activa:
        assertThat(job.getAplicanti().size()).isGreaterThan(0);
    }
}`,
    interviewTrap: "Nu pune `@Transactional` orbeste pe toate testele de integrare! Daca vrei sa testezi comportamentul real al tranzactiilor si al fetch-urilor lazy, lasa tranzactia sa se termine in service si testeaza rezultatul afara din tranzactie.",
    keyTakeaway: "`@Transactional` pe teste mentine sesiunea Hibernate deschisa artificial, mascand bug-urile reale de tip `LazyInitializationException`."
  },
  {
    id: "test-40",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Validarii DTO-urilor (@Valid) in MockMvc",
    question: "Cum testezi ca adnotarile de validare (`@NotBlank`, `@Size`, `@Min`) resping cererile invalide cu HTTP 400 Bad Request?",
    answer: "Validarea DTO-urilor la intrarea in Controller se testeaza cel mai curat prin `@WebMvcTest` si `MockMvc`:\n\nCe verificam:\n1. Trimiterea unui JSON invalid (ex: email gresit, camp obligatoriu null, varsta negativa).\n2. Verificarea codului `HTTP 400 Bad Request`.\n3. Verificarea corpului de raspuns (daca ai un `@ControllerAdvice` global, verifici mesajul de eroare specific).\n4. Verificarea ca Serviciul de afaceri NU a fost apelat niciodata: `verify(service, never()).salveaza(any())`!",
    codeSnippet: `@Test
void candEmailulEsteInvalid_trebuieSaIntoarca400SiSaNuApelezeServiciul() throws Exception {
    String jsonInvalid = "{\\"nume\\":\\"Dan\\", \\"email\\":\\"email_incorect_fara_arond\\"}";
    
    mockMvc.perform(post("/api/utilizatori")
            .contentType(MediaType.APPLICATION_JSON)
            .content(jsonInvalid))
        .andExpect(status().isBadRequest())
        .andExpect(jsonPath("$.errors.email").exists());
        
    // Confirmam ca datele invalide au fost oprite la poarta:
    verify(userService, never()).inregistreaza(any());
}`,
    interviewTrap: "Asigura-te ca in Controller ai pus `@Valid` inaintea parametrului `@RequestBody Dto dto`! Fara adnotarea `@Valid`, adnotarile din interiorul DTO-ului sunt complet ignorate de Spring.",
    keyTakeaway: "Testarea validarii confirma ca cererile malformate primesc HTTP 400 si ca logica de business din spate nu este invocata inutil."
  },
  {
    id: "test-41",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Codului Asincron cu Awaitility",
    question: "De ce `Thread.sleep()` este un anti-pattern in testarea metodelor asincrone (@Async / Cozi) si cum se foloseste Awaitility?",
    answer: "1. De ce este `Thread.sleep(5000)` periculos si gresit:\n   - Daca procesul asincron dureaza 50ms, tu irosesti 4950ms asteptand degeaba, facand suita de teste extrem de lenta.\n   - Daca pe serverul aglomerat de CI/CD procesul dureaza 5100ms, testul va pica aleatoriu (Flaky Test)!\n\n2. Solutia: Biblioteca Awaitility (Polling Asincron Inteligent):\n   - Awaitility verifica conditia in bucla la intervale mici (ex: la fiecare 50ms).\n   - In secunda exacta in care conditia devine adevarata, testul continua IMEDIAT!\n   - Permite setarea unui timeout maxim de siguranta (ex: `atMost(5, SECONDS)`).",
    codeSnippet: `// Folosire Awaitility curata:
comandaService.plaseazaComandaAsincron(comanda);

// Asteapta pana cand statusul devine "PROCESAT", dar maxim 3 secunde:
await()
    .atMost(3, TimeUnit.SECONDS)
    .pollInterval(100, TimeUnit.MILLISECONDS)
    .untilAsserted(() -> {
        Comanda c = comandaRepo.findById(comanda.getId()).orElseThrow();
        assertThat(c.getStatus()).isEqualTo(Status.PROCESAT);
    });`,
    interviewTrap: "Daca folosesti `until()` cu boolean simplu, in caz de timeout vei primi un mesaj generic \"condition was not satisfied\". Daca folosesti `untilAsserted(() -> assertThat(...))`, Awaitility iti va afisa exact ce asertiune a esuat!",
    keyTakeaway: "Awaitility verifica conditiile asincrone prin polling rapid pana la o limita de timeout, eliminand asteptarile oarbe si testele instabile."
  },
  {
    id: "test-42",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Tratarii Globale a Exceptiilor (@ControllerAdvice)",
    question: "Cum testezi ca un `@ControllerAdvice` mapeaza o exceptie specifica pe codul HTTP corect (ex: 404 sau 409)?",
    answer: "Tratarea globala a erorilor este o piesa critica de infrastructura care trebuie acoperita complet de teste:\n\nCum se testeaza cu `MockMvc`:\n1. Folosesti `@WebMvcTest(NumeController.class)`.\n2. Configurezi mock-ul de service sa arunce exceptia dorita:\n   `when(userService.findById(99L)).thenThrow(new ResursaNegasitaException(\"User negasit\"));`\n3. Trimi cererea HTTP si verifici ca `@ControllerAdvice` a interceptat-o si a transformat-o in:\n   - Codul HTTP asteptat (ex: `404 Not Found` sau `409 Conflict`).\n   - Formatul standardizat de eroare (ex: ProblemDetails RFC 7807: campurile `title`, `status`, `detail`).",
    codeSnippet: `@Test
void candUserulNuExista_trebuieSaIntoarca404CuProblemDetails() throws Exception {
    when(userService.findById(99L))
        .thenThrow(new EntityNotFoundException("Utilizatorul 99 nu exista"));
        
    mockMvc.perform(get("/api/users/99"))
        .andExpect(status().isNotFound()) // HTTP 404
        .andExpect(jsonPath("$.title").value("Resursa Negasita"))
        .andExpect(jsonPath("$.detail").value("Utilizatorul 99 nu exista"));
}`,
    interviewTrap: "Daca testul intoarce 500 in loc de 404, `@ControllerAdvice`-ul tau nu gestioneaza acea clasa exacta de exceptie (sau `@ExceptionHandler` nu include clasa corecta).",
    keyTakeaway: "Testarea `@ControllerAdvice` asigura ca exceptiile interne de business sunt transformate in raspunsuri HTTP corecte si prietenoase pentru client."
  },
  {
    id: "test-43",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Paginarii si Sortarii in MockMvc",
    question: "Cum testezi parametrii de paginare (`page`, `size`, `sort`) pe un endpoint REST Spring Boot?",
    answer: "Spring Data permite injectarea automata a unui `Pageable` in metoda de Controller (`Pageable pageable`).\n\nCum se testeaza in MockMvc:\n1. Se trimit parametrii ca query params: `?page=0&size=10&sort=salariu,desc`.\n2. Se captureaza argumentul `Pageable` transmis serviciului folosind `ArgumentCaptor<Pageable>`.\n3. Se valideaza proprietatile obiectului capturat:\n   - Numarul paginii: `pageable.getPageNumber()`.\n   - Marimea paginii: `pageable.getPageSize()`.\n   - Directia de sortare: `pageable.getSort().getOrderFor(\"salariu\").getDirection()`.",
    codeSnippet: `@Test
void candCerePaginaSortata_trebuieSaPasezeParametriiCorecti() throws Exception {
    ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
    
    mockMvc.perform(get("/api/angajati?page=2&size=20&sort=salariu,desc"))
           .andExpect(status().isOk());
           
    verify(angajatService).gasesteToti(captor.capture());
    Pageable p = captor.getValue();
    assertThat(p.getPageNumber()).isEqualTo(2);
    assertThat(p.getPageSize()).isEqualTo(20);
    assertThat(p.getSort().getOrderFor("salariu").isDescending()).isTrue();
}`,
    interviewTrap: "Paginarea in Spring Data incepe implicit de la pagina 0, nu de la 1! `page=0` este prima pagina.",
    keyTakeaway: "Valideaza parametrii de paginare si sortare verificand obiectul `Pageable` capturat la apelul serviciului."
  },
  {
    id: "test-44",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Repository-urilor JPA: Interogari Custom @Query",
    question: "De ce este obligatoriu sa scriem teste de integrare pentru metodele adnotate cu `@Query` in Spring Data JPA?",
    answer: "Metodele generate automat de Spring Data pe baza numelui (ex: `findByEmail`) sunt verificate la compilare si au generare de incredere.\n\nDe ce interogarile `@Query` necesita teste obligatorii:\n1. Erori de sintaxa ascunse in JPQL / HQL: O greseala de scriere intr-o interogare text (`SELECT u FORM User u`) nu este prinsa la compilarea Java! Ea va pica doar la rulare cand metoda este invocata.\n2. Interogari SQL Native (`nativeQuery = true`): Acestea ocolesc complet validarea Hibernate si pot esua din cauza dialectului bazei de date.\n3. N+1 Problem si JOIN Fetch: Un test cu `@DataJpaTest` poate inspecta numarul exact de interogari SQL executate pentru a valida ca `JOIN FETCH` chiar functioneaza.",
    codeSnippet: `@DataJpaTest
class ComandaRepositoryTest {
    @Autowired private ComandaRepository comandaRepo;
    @Autowired private TestEntityManager em;

    @Test
    void gasesteComenziActivePesteSumaMinima() {
        em.persist(new Comanda(Status.ACTIV, 500.0));
        em.persist(new Comanda(Status.ANULAT, 800.0));
        em.flush();
        
        List<Comanda> rezultate = comandaRepo.gasesteComenziActive(200.0);
        assertThat(rezultate).hasSize(1);
        assertThat(rezultate.get(0).getSuma()).isEqualTo(500.0);
    }
}`,
    interviewTrap: "Daca nu testezi interogarile native pe o baza de date reala (Testcontainers), un query scris pentru PostgreSQL s-ar putea sa foloseasca functii incompatibile care sa pice doar pe serverul de productie.",
    keyTakeaway: "Interogarile `@Query` si native SQL contin cod neverificat de compilator; testarea lor cu `@DataJpaTest` previne erori de sintaxa si logica la rulare."
  },
  {
    id: "test-45",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Upload-ului de Fisiere cu MockMultipartFile",
    question: "Cum testezi un controller REST care accepta fisiere Multipart (ex: upload CV sau avatar) folosind MockMvc?",
    answer: "MockMvc ofera clasa specializata `MockMultipartFile` si metoda `multipart()`:\n\nCum se structureaza testul:\n1. Se creeaza fisierul simulat in memorie: `new MockMultipartFile(numeParametru, numeFisierOriginal, contentType, bytes)`.\n2. Se apeleaza cererea folosind `mockMvc.perform(multipart(\"/api/upload\").file(fisier))`.\n3. Se pot trimite si parametri simpli in aceeasi cerere: `.param(\"descriere\", \"CV 2026\")`.\n4. Se verifica codul de raspuns si apelarea serviciului de stocare.",
    codeSnippet: `@Test
void candIncarcaFisierPdfValid_trebuieSaIntoarca200() throws Exception {
    MockMultipartFile cvFile = new MockMultipartFile(
        "file", 
        "cv_mihai.pdf", 
        MediaType.APPLICATION_PDF_VALUE, 
        "Continut binar PDF simulat".getBytes()
    );

    mockMvc.perform(multipart("/api/candidati/1/cv")
            .file(cvFile)
            .param("versiune", "1.0"))
        .andExpect(status().isOk());
        
    verify(storageService).salveaza(eq("cv_mihai.pdf"), any());
}`,
    interviewTrap: "Primul argument din constructorul `MockMultipartFile(\"file\", ...)` TREBUIE sa se potriveasca EXACT cu numele parametrului din controller (`@RequestParam(\"file\") MultipartFile file`)! Daca difera, vei primi 400 Bad Request.",
    keyTakeaway: "`MockMultipartFile` simuleaza fisiere reale in memorie, testand incarcarea de documente prin apelul `mockMvc.perform(multipart(...))`."
  },
  {
    id: "test-46",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Emitarii de Loguri cu Logback ListAppender",
    question: "Cum testezi automat ca o metoda a emis un log specific de nivel WARN sau ERROR?",
    answer: "Uneori cerintele de audit sau securitate impun ca o anumita actiune (ex: 3 incercari de login esuate) sa emita un log de nivel WARN:\n\nCum se captureaza logurile in test (Logback):\n1. Se obtine logger-ul clasei testate prin `LoggerFactory.getLogger(Clasa.class)`.\n2. Se instantiaza un `ListAppender<ILoggingEvent>` si se ataseaza la logger.\n3. Se executa metoda testata.\n4. Se inspecteaza lista `listAppender.list`:\n   - Se verifica daca exista un mesaj care contine textul dorit.\n   - Se verifica nivelul de log (`Level.WARN`).",
    codeSnippet: `@Test
void candAutentificareaEsueaza_trebuieSaEmitaLogWarn() {
    Logger logger = (Logger) LoggerFactory.getLogger(AuthService.class);
    ListAppender<ILoggingEvent> appender = new ListAppender<>();
    appender.start();
    logger.addAppender(appender);
    
    authService.login("user_gresit", "parola");
    
    assertThat(appender.list)
        .extracting(ILoggingEvent::getLevel, ILoggingEvent::getFormattedMessage)
        .contains(tuple(Level.WARN, "Incercare esuata de login pentru: user_gresit"));
}`,
    interviewTrap: "La finalul testului, asigura-te ca detasezi appenderul (`logger.detachAppender(appender)`), altfel vei avea o scurgere de memorie in suita de teste.",
    keyTakeaway: "`ListAppender` din Logback colecteaza evenimentele de logging in memorie, permitand asertiuni exacte pe mesaje si nivele de eroare."
  },
  {
    id: "test-47",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Reducerilor de Pret si a Calculelor cu Asertiuni Zecimale",
    question: "De ce este periculos sa compari numere cu virgula (`double` / `BigDecimal`) prin `assertEquals` fara delta?",
    answer: "1. Pericolul comparatiilor pe numere reale (`double` / `float`):\n   - Datorita reprezentarii binare IEEE 754, `0.1 + 0.2` devine `0.30000000000000004`.\n   - Daca scrii `assertEquals(0.3, rezultat)`, testul va pica!\n   - In JUnit 5, se foloseste OBLIGATORIU parametrul `delta` (toleranta de eroare): `assertEquals(0.3, rezultat, 0.0001)`.\n\n2. Compararea obiectelor `BigDecimal` in AssertJ:\n   - `BigDecimal.equals()` compara atat valoarea cat si SCALA (numarul de zecimale). `new BigDecimal(\"2.0\")` NU este egal cu `new BigDecimal(\"2.00\")` conform `.equals()`!\n   - In teste financiare se foloseste INTOTDEAUNA: `assertThat(suma).isEqualByComparingTo(\"2.00\")` (care foloseste `compareTo()` si ignora scala).",
    codeSnippet: `// Pentru double:
assertEquals(10.55, pretCalculat, 0.001);

// Pentru BigDecimal (Corect financiar):
assertThat(soldBancar).isEqualByComparingTo(new BigDecimal("1500.00"));`,
    interviewTrap: "Folosirea lui `isEqualTo()` pe BigDecimal este o capcana clasica la interviuri. Daca baza intoarce `10.00` si tu compari cu `10.0`, testul pica desi matematic sunt identice! Foloseste `isEqualByComparingTo()`.",
    keyTakeaway: "Pentru `double` foloseste toleranta delta; pentru `BigDecimal` foloseste `isEqualByComparingTo()` pentru a ignora scala zecimalelor."
  },
  {
    id: "test-48",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Constrangerilor Unice la Nivel de Baza de Date",
    question: "Cum testezi ca inserarea a doi utilizatori cu acelasi email este respinsa ferm de baza de date cu DataIntegrityViolationException?",
    answer: "Acest test valideaza ca constrangerea `UNIQUE(email)` definita in PostgreSQL sau JPA este activa si functionala:\n\nCum se structureaza testul cu `@DataJpaTest`:\n1. Se insereaza si se salveaza primul utilizator: `repo.saveAndFlush(new User(\"ana@test.ro\"))`.\n2. Se incearca inserarea celui de-al doilea utilizator cu ACELASI email: `repo.saveAndFlush(new User(\"ana@test.ro\"))`.\n3. Se foloseste `assertThrows(DataIntegrityViolationException.class, () -> repo.saveAndFlush(...))`.\n4. De ce `saveAndFlush()`: Pentru ca Hibernate amana scrierea in mod obisnuit! Fara `flush()`, insert-ul nu atinge baza de date pana la finalul tranzactiei si exceptia nu este aruncata in blocul de test.",
    codeSnippet: `@Test
void candEmailulEsteDuplicat_trebuieSaArunceDataIntegrityViolationException() {
    userRepo.saveAndFlush(new User("dan@test.ro", "Dan"));
    
    assertThrows(DataIntegrityViolationException.class, () -> {
        userRepo.saveAndFlush(new User("dan@test.ro", "Alt Dan"));
    });
}`,
    interviewTrap: "Daca folosesti doar `save()`, testul va trece linia fara nicio eroare si va esua la sfarsitul metodei cand Spring incearca commit-ul tranzactiei. Foloseste intotdeauna `saveAndFlush()` cand testezi constrangeri SQL.",
    keyTakeaway: "`saveAndFlush()` forteaza executia SQL-ului pe loc, permitand testarea constrangerilor de unicitate din baza de date."
  },
  {
    id: "test-49",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Antetelor HTTP de Caching: ETag si 304 Not Modified",
    question: "Cum testezi revalidarea conditionata a resurselor cu ETag in MockMvc?",
    answer: "Fluxul de testare al unui endpoint REST care suporta ETag:\n\n1. Pasul 1 (Prima cerere):\n   - Trimiti `GET /api/articole/1`.\n   - Verifici ca raspunsul este `200 OK` si extragi valoarea antetului `ETag` generat (ex: `String etag = result.getResponse().getHeader(\"ETag\")`).\n\n2. Pasul 2 (A doua cerere conditionata):\n   - Trimiti aceeasi cerere `GET /api/articole/1`, adaugand antetul `If-None-Match: etag`.\n   - Verifici ca serverul raspunde cu `HTTP 304 Not Modified`.\n   - Verifici ca lungimea corpului de raspuns este 0 (nu s-au transmis date inutile pe retea).",
    codeSnippet: `@Test
void testEtagCaching() throws Exception {
    // 1. Prima cerere
    MvcResult firstResult = mockMvc.perform(get("/api/produse/42"))
            .andExpect(status().isOk())
            .andExpect(header().exists("ETag"))
            .andReturn();
            
    String etag = firstResult.getResponse().getHeader("ETag");
    
    // 2. Cerere conditionata cu If-None-Match
    mockMvc.perform(get("/api/produse/42").header("If-None-Match", etag))
            .andExpect(status().isNotModified()); // HTTP 304!
}`,
    interviewTrap: "Pentru a suporta ETag automat in Spring Boot, trebuie inregistrat filtrul `ShallowEtagHeaderFilter` in configuratia aplicatiei.",
    keyTakeaway: "Valideaza existenta ETag-ului la prima cerere si raspunsul 304 Not Modified la trimiterea valorii in antetul If-None-Match."
  },
  {
    id: "test-50",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Caching-ului cu Redis in Testcontainers",
    question: "Cum testezi ca metoda unui serviciu adnotata cu `@Cacheable` chiar citeste din Redis si nu apeleaza baza de date a doua oara?",
    answer: "Pentru a valida functionalitatea reala a cache-ului:\n\nArhitectura testului de integrare:\n1. Pornesti un container real de Redis via Testcontainers: `GenericContainer<?> redis = new GenericContainer<>(\"redis:7-alpine\").withExposedPorts(6379)`.\n2. Conectezi Spring Boot la portul dinamic prin `@DynamicPropertySource`.\n3. Testul:\n   - Pas 1: Apelezi `service.getProdus(1L)`. Verifici ca baza de date / repository-ul a fost apelat o data.\n   - Pas 2: Apelezi IMEDIAT a doua oara `service.getProdus(1L)` cu acelasi parametru.\n   - Pas 3: Verifici cu `verify(repo, times(1)).findById(1L)` ca repository-ul NU a fost apelat a doua oara!\n   - Acest lucru demonstreaza 100% ca rezultatul a fost servit direct din memoria Redis.",
    codeSnippet: `@Test
void testCacheableEvitaInterogareaBazeiDeDate() {
    // Prima citire: merge la DB
    produsService.getProdus(42L);
    verify(produsRepo, times(1)).findById(42L);
    
    // A doua citire: servita din Redis Cache!
    produsService.getProdus(42L);
    verify(produsRepo, times(1)).findById(42L); // Numarul de apeluri a ramas 1!
}`,
    interviewTrap: "Daca apelezi metoda `@Cacheable` din interiorul aceleiasi clase de serviciu (self-invocation), adnotarea de cache nu va functiona deloc din cauza modului in care functioneaza proxy-urile AOP in Spring!",
    keyTakeaway: "Valideaza functionarea `@Cacheable` demonstrand ca al doilea apel cu aceiasi parametri nu mai acceseaza repository-ul de date."
  },
  {
    id: "test-51",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Cozilor de Mesaje cu Testcontainers (Kafka & RabbitMQ)",
    question: "Cum testezi fluxul complet de producere si consumare a unui mesaj Kafka folosind Testcontainers?",
    answer: "In trecut, testarea Kafka folosea `EmbeddedKafka`, care rula in acelasi JVM si nu reproducea fidel comportamentul de retea si partitiile.\n\nAbordarea moderna cu Testcontainers:\n1. Se porneste `KafkaContainer` oficial bazat pe imagine Docker reala: `new KafkaContainer(DockerImageName.parse(\"confluentinc/cp-kafka:7.5.0\"))`.\n2. `@DynamicPropertySource` injecteaza `kafka.getBootstrapServers()` in `spring.kafka.bootstrap-servers`.\n3. Testul:\n   - Pas 1: Trimiti un mesaj prin `KafkaTemplate.send(\"comenzi_topic\", event)`.\n   - Pas 2: Folosesti `Awaitility` pentru a astepta ca metoda `@KafkaListener` a consumatorului sa proceseze mesajul si sa actualizeze baza de date sau starea dorita.\n   - Pas 3: Validezi ca datele finale sunt corecte in baza de date.",
    codeSnippet: `@SpringBootTest
@Testcontainers
class KafkaConsumerIntegrationTest {
    @Container
    static KafkaContainer kafka = new KafkaContainer(DockerImageName.parse("confluentinc/cp-kafka:7.5.0"));

    @DynamicPropertySource
    static void overrideProps(DynamicPropertyRegistry registry) {
        registry.add("spring.kafka.bootstrap-servers", kafka::getBootstrapServers);
    }

    @Test
    void candTrimiteEveniment_consumatorulTrebuieSaActualizezeStarea() {
        kafkaTemplate.send("orders", new OrderCreatedEvent(42L));
        
        await().atMost(5, SECONDS).untilAsserted(() -> {
            assertThat(orderRepo.findById(42L)).isPresent();
        });
    }
}`,
    interviewTrap: "Ascultatorii Kafka (@KafkaListener) ruleaza pe thread-uri de fundal separate! De aceea nu poti verifica rezultatul cu un `assertThat` imediat in urmatoarea linie; folosirea lui `Awaitility` este obligatorie.",
    keyTakeaway: "Testcontainers `KafkaContainer` testeaza producerea si consumarea reala a mesajelor pe un cluster real Docker cu asertiuni asincrone Awaitility."
  },
  {
    id: "test-52",
    category: "TESTING",
    difficulty: "USOR",
    title: "WireMock: Simularea Serviciilor HTTP Externe",
    question: "Ce este WireMock, de ce este superior mock-urilor simple Mockito si cum simuleaza erori HTTP reale (503, 504)?",
    answer: "1. Ce este WireMock:\n   - Un server HTTP real, usor si configurabil, care porneste local pe un port de test.\n   - In loc sa mock-uiesti codul Java din clasa ta de client HTTP prin Mockito, aplicatia ta trimite cereri HTTP REALE catre serverul local WireMock!\n\n2. De ce este superior Mockito pentru apeluri REST:\n   - Mockito doar simuleaza metoda Java; nu testeaza serializarea JSON, headerele HTTP reale, conexiunea TCP sau timeout-urile.\n   - WireMock testeaza tot protocolul HTTP: poti simula raspunsuri JSON, antete de eroare, coduri `HTTP 503 Service Unavailable`, sau chiar poti simula intreruperea conexiunii la jumatatea transmisiei!\n\n3. Utilizare clasica:\n   - Simularea portilor de plata (Stripe, PayPal) sau a serviciilor meteo / curierat.",
    codeSnippet: `// Configurare raspuns simulat in WireMock:
stubFor(get(urlEqualTo("/api/valuta/EUR"))
    .willReturn(aResponse()
        .withStatus(200)
        .withHeader("Content-Type", "application/json")
        .withBody("{\\"rata\\": 4.97}")));

// Sau simulare cadere serviciu partener (HTTP 503):
stubFor(post(urlEqualTo("/api/plata"))
    .willReturn(aResponse().withStatus(503)));`,
    interviewTrap: "Daca folosesti Mockito pentru a mock-ui `RestTemplate`, nu vei sti niciodata daca aplicatia ta compune corect URL-ul sau antetul de Authorization. WireMock testeaza intregul pachet HTTP real.",
    keyTakeaway: "WireMock porneste un server HTTP local care simuleaza raspunsurile si erorile serviciilor externe fara conexiune la internet."
  },
  {
    id: "test-53",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Rezilientei cu WireMock: Timeout si Latenta Simulata",
    question: "Cum testezi ca timeout-ul aplicatiei tale (ex: 2 secunde) si mecanismul de retry functioneaza cand un API extern are lag?",
    answer: "Testarea erorilor de timeout este esentiala pentru prevenirea blocarii thread-urilor in productie:\n\nCum se configureaza in WireMock:\n1. Se foloseste optiunea `.withFixedDelay(milisecunde)` pe raspunsul WireMock.\n   - Exemplu: Daca timeout-ul tau configurat pe `RestClient` este de 1.000ms, configurezi WireMock sa raspunda cu o intarziere de 2.500ms: `.withFixedDelay(2500)`.\n2. Ce verificam:\n   - Verificam ca aplicatia arunca `ResourceAccessException` / `SocketTimeoutException` dupa 1.000ms si nu ramane blocata 2.5 secunde.\n   - Daca avem Circuit Breaker sau Retry configurat, verificam ca s-au facut exact cele 3 incercari si s-a apelat metoda de fallback.",
    codeSnippet: `@Test
void candServerulPartenerIntarzie_trebuieSaArunceTimeoutException() {
    // Simulam un server partener extrem de lent (3000ms delay):
    stubFor(get(urlEqualTo("/api/stoc/42"))
        .willReturn(aResponse()
            .withStatus(200)
            .withFixedDelay(3000))); // 3 secunde intarziere
            
    // Clientul are timeout configurat la 1000ms:
    assertThrows(ResourceAccessException.class, () -> client.verificaStoc(42L));
}`,
    interviewTrap: "Daca nu testezi comportamentul la timeout, un singur serviciu extern partener care raspunde in 60 de secunde iti va bloca toate conexiunile Tomcat, doborand tot magazinul.",
    keyTakeaway: "WireMock `.withFixedDelay()` simuleaza lag-ul de retea, permitand validarea ferma a timeout-urilor si a mecanismelor de circuit breaker."
  },
  {
    id: "test-54",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Contract Testing cu Pact / Spring Cloud Contract",
    question: "Ce problema rezolva Contract Testing in arhitecturile de microservicii si cum previne erorile de integrare?",
    answer: "1. Problema integrarii microserviciilor:\n   - Serviciul A (Consumator) apeleaza Serviciul B (Producator).\n   - Daca echipa B redenumeste un camp din JSON (`userName` -> `user_name`), dar uita sa anunte echipa A:\n     - Testele unitare ale lui A sunt verzi (folosesc mock-uri vechi).\n     - Testele unitare ale lui B sunt verzi (folosesc noua schema).\n     - Dar la deploy in productie, aplicatia se rupe instant!\n\n2. Ce este Contract Testing:\n   - Consumatorul si Producatorul semneaza un \"Contract\" formal (un fisier JSON/YAML care defineste exact cererile si raspunsurile asteptate).\n   - Consumatorul genereaza un mock pe baza contractului.\n   - Producatorul este OBLIGAT sa ruleze o suita de teste automate care verifica ca API-ul sau respecta 100% toate contractele semnate cu consumatorii sai inainte de a putea face deploy!",
    codeSnippet: `// Contract simplu in Pact / Spring Cloud Contract:
request:
  method: GET
  url: /users/42
response:
  status: 200
  body:
    id: 42
    email: "ion@test.ro" # Daca producatorul schimba in "mail", testul de contract pica!`,
    interviewTrap: "Testele End-to-End pe tot clusterul de microservicii sunt extrem de lente si fragile. Contract Testing ofera siguranta testelor E2E la viteza testelor unitare.",
    keyTakeaway: "Contract Testing asigura ca producatorul si consumatorul respecta aceeasi schema de date, prevenind breaking changes la release-uri independente."
  },
  {
    id: "test-55",
    category: "TESTING",
    difficulty: "USOR",
    title: "End-to-End (E2E) Testing: Rol si Limite",
    question: "Ce testeaza un test End-to-End (E2E) si de ce este plasat in varful Piramidei Testarii?",
    answer: "1. Ce este un test E2E:\n   - Un test automat care simuleaza un utilizator uman real cap-coada: deschide browserul, tasteaza username-ul si parola, apasa pe \"Login\", adauga un produs in cos, plateste cu cardul si verifica factura pe ecran.\n\n2. De ce sunt indispensabile:\n   - Valideaza ca toate sistemele (Frontend React, Backend Java, Baza de Date, Gateway, Retea) lucreaza armonios impreuna in mediul real.\n\n3. De ce sunt plasate in VARFUL piramidei (maxim 10% din teste):\n   - Sunt foarte LENTE: Un singur test E2E de checkout poate dura 20-30 de secunde (in timp ce un test unitar dureaza 2 milisecunde).\n   - Sunt FRAGILE (\"Flaky\"): Un selector CSS schimbat, o intarziere de animatie sau un banner de cookie-uri poate face testul sa pice desi codul este corect.\n   - Cost ridicat de mentenanta.",
    codeSnippet: `// Exemplu test E2E Playwright:
await page.goto("http://localhost:3000/login");
await page.fill("#email", "mihai@test.ro");
await page.fill("#password", "ParolaSecreta");
await page.click("button[type=submit]");
await expect(page.locator(".dashboard-header")).toContainText("Bine ai venit");`,
    interviewTrap: "Daca o echipa incearca sa testeze toate combinatiile de validari (15 teste pentru formatul de email) exclusiv prin E2E, rularea testelor va dura ore intregi! Validarile de campuri se testeaza la baza piramidei prin teste unitare.",
    keyTakeaway: "Testele E2E valideaza fluxurile critice de afaceri prin browser; sunt valoroase dar lente si fragile, necesitand utilizare selectiva la varful piramidei."
  },
  {
    id: "test-56",
    category: "TESTING",
    difficulty: "USOR",
    title: "Playwright vs Selenium in E2E Testing",
    question: "De ce Playwright a devenit alegerea preferata in industrie in detrimentul Selenium-ului clasic?",
    answer: "Selenium a fost pionierul automatizarii web, dar Playwright (dezvoltat de Microsoft) rezolva marile sale dureri:\n\n1. Auto-Waiting Nativ (Elimina Flaky Tests):\n   - In Selenium trebuia sa pui explicit `WebDriverWait` pe fiecare element, altfel testul pica daca butonul nu era inca randat.\n   - Playwright asteapta AUTOMAT ca elementul sa fie vizibil, stabil si clickabil inainte de a executa actiunea!\n\n2. Arhitectura Moderna pe WebSockets:\n   - Selenium foloseste protocolul JSON Wire / WebDriver HTTP (o cerere HTTP noua pentru fiecare comanda `click`, `type`).\n   - Playwright comunica direct cu procesul browserului printr-o singura conexiune WebSocket persistenta (mult mai rapid!).\n\n3. Suport multi-context si multi-tab nativ in paralel:\n   - Poti deschide 2 contexte izolate de browser in milisecunde (ideal pentru a testa un chat intre 2 utilizatori simultan).\n\n4. Video Recording, Screenshots si Trace Viewer gata integrate.",
    codeSnippet: `# Rulare Playwright in linie de comanda cu debug vizual:
npx playwright test --ui
# Generare automata de cod prin inregistrarea click-urilor utilizatorului:
npx playwright codegen http://localhost:3000`,
    interviewTrap: "Playwright suporta toate marile browsere (Chromium, Firefox, WebKit/Safari) din aceeasi comanda fara a fi nevoie de instalari manuale de drivere (`chromedriver`).",
    keyTakeaway: "Playwright elimina testele instabile prin auto-waiting nativ, este considerabil mai rapid decat Selenium si include Trace Viewer integrat."
  },
  {
    id: "test-57",
    category: "TESTING",
    difficulty: "USOR",
    title: "Page Object Model (POM) in Testarea E2E",
    question: "Ce este tiparul Page Object Model (POM) si cum reduce costul de mentenanta al testelor de interfata?",
    answer: "Page Object Model este cel mai important Design Pattern in testarea automata E2E:\n\n1. Problema fara POM:\n   - Daca scrii selectorul CSS `input[name=\"user_email\"]` in 50 de teste diferite, iar designerul frontend schimba id-ul sau clasa butonului:\n   - Toate cele 50 de teste pica si trebuie sa modifici 50 de fisiere manual!\n\n2. Solutia Page Object Model:\n   - Fiecare pagina web are o clasa Java/JS corespondenta (ex: `LoginPage`).\n   - Clasa contine:\n     - Toti selectorii paginii grupati intr-un singur loc.\n     - Metode care reprezinta actiunile utilizatorului: `login(email, pass)`, `clickForgotPass()`.\n   - Testele apeleaza doar metodele din Page Object, fara sa stie ce selectori CSS se afla in spate.\n   - Daca un buton se schimba, modifici selectorul INTR-UN SINGUR LOC in clasa paginii!",
    codeSnippet: `// Clasa Page Object:
public class LoginPage {
    private final Page page;
    private final Locator emailInput = page.locator("#email");
    private final Locator submitBtn = page.locator("button[type=submit]");
    
    public void autentifica(String email, String parola) {
        emailInput.fill(email);
        page.locator("#password").fill(parola);
        submitBtn.click();
    }
}

// Testul curat si lizibil:
@Test
void testLoginReusit() {
    loginPage.autentifica("ion@test.ro", "secret");
    assertThat(dashboardPage.isVizibil()).isTrue();
}`,
    interviewTrap: "Nu pune asertiuni (`assertThat`) in interiorul metodelor din Page Object! Page Object-ul trebuie sa faca doar actiuni si sa returneze date; asertiunile se pun intotdeauna in metodele de `@Test`.",
    keyTakeaway: "POM incapsuleaza selectorii si actiunile paginii intr-o clasa dedicata, facand testele rezistente la modificari de design in interfata."
  },
  {
    id: "test-58",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Flaky Tests: Ce Sunt, Cauze Frecvente si Combatere",
    question: "Ce este un \"Flaky Test\" (test instabil) si care sunt principalele 3 cauze care il provoaca?",
    answer: "1. Ce este un Flaky Test:\n   - Un test care uneori trece (VERDE) si alteori pica (ROSU) rulat pe EXACT ACELASI COD, fara nicio modificare sursa!\n   - Distruge increderea echipei in testare (dezvoltatorii incep sa ignore build-urile picate spunand \"e doar un test flaky, da-i re-run\").\n\n2. Cauze frecvente si solutii:\n   a) Pauze oarbe cu `Thread.sleep()`:\n      - Daca pe laptopul tau dureaza 100ms si ai pus sleep(300ms), testul trece. Pe serverul aglomerat de CI/CD dureaza 400ms si testul pica!\n      - Solutie: Inlocuire cu polling dinamic (`Awaitility` sau auto-wait in Playwright).\n   b) Date partajate si ordine de executie:\n      - Testul B presupune ca baza de date contine randul inserat de Testul A. Daca JUnit ruleaza Testul B primul, testul pica!\n      - Solutie: Fiecare test trebuie sa fie 100% independent si sa-si creeze propriile date.\n   c) Dependente de ceasul sistemului sau fus orar:\n      - Teste care pica doar la sfarsit de luna sau la trecerea la ora de vara.\n      - Solutie: Injectarea unui `Clock` fixat in teste.",
    codeSnippet: `// Cauza #1 de Flaky Test (NICIODATA ASA):
Thread.sleep(2000); // Speram ca s-a terminat...

// Solutia Robusta:
await().atMost(5, SECONDS).until(() -> jobRepo.isCompleted(jobId));`,
    interviewTrap: "Solutia gresita pe care o aplica unele echipe este \"Retry automat de 3 ori la teste picate in CI\". Aceasta practica doar ascunde mizeria sub pres; testul flaky trebuie investigat si reparat la radacina.",
    keyTakeaway: "Testele flaky pica aleatoriu din cauza sleep-urilor fixe, a datelor partajate sau a dependentei de ceas; se repara prin asteptari dinamice si izolare totala."
  },
  {
    id: "test-59",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Izolarea Datelor: Curatare DB vs @DirtiesContext",
    question: "De ce este adnotarea `@DirtiesContext` extrem de lenta si cum se curata eficient baza de date intre teste?",
    answer: "1. Ce face `@DirtiesContext`:\n   - Semnaleaza catre Spring ca testul a \"murdarit\" contextul aplicatiei.\n   - Efect: Spring DISTRUGE intregul `ApplicationContext` la sfarsitul testului si porneste unul NOU de la zero pentru urmatorul test!\n   - Daca ai 20 de teste cu `@DirtiesContext`, suita va porni Spring Boot de 20 de ori, adaugand minute intregi de asteptare inutila!\n\n2. Solutia rapida de curatare a Bazei de Date:\n   - Pastreaza acelasi ApplicationContext partajat in memorie pe toata durata suitei.\n   - Curata doar tabelele din baza de date intre teste folosind:\n     - `@BeforeEach` cu `repository.deleteAll()` (simplu).\n     - Un script rapid de `TRUNCATE TABLE ... CASCADE` executat pe tabelele modificate.",
    codeSnippet: `// LENT (Porneste Spring din nou la fiecare test - 5 secunde per test):
@DirtiesContext(classMode = ClassMode.AFTER_EACH_TEST_METHOD)

// RAPID (Sterge datele in 10 milisecunde, contextul ramane cald):
@BeforeEach
void curataBaza() {
    comandaRepo.deleteAll();
    userRepo.deleteAll();
}`,
    interviewTrap: "Daca folosesti `deleteAll()`, ai grija la ordinea tabelelor din cauza constrangerilor Foreign Key! Trebuie sa stergi mai intai tabelele copil (comenzi) si abia apoi tabelele parinte (utilizatori).",
    keyTakeaway: "Evita `@DirtiesContext` deoarece reporneste tot containerul Spring; curata doar datele din tabele intre teste pentru viteza maxima."
  },
  {
    id: "test-60",
    category: "TESTING",
    difficulty: "USOR",
    title: "Object Mother Pattern si Test Data Builders",
    question: "Cum simplifica Test Data Builders crearea de obiecte complexe cu 20 de campuri in teste?",
    answer: "1. Problema constructorilor lungi in teste:\n   - `new Utilizator(\"Ion\", \"Popescu\", \"ion@test.ro\", \"parola\", 25, \"Bucuresti\", \"Str X\", true, Rol.USER, ...)`.\n   - Daca adaugi un camp nou in entitate, 100 de teste existente nu mai compileaza!\n   - In plus, 80% din campuri sunt irelevante pentru testul curent (tie iti trebuia doar emailul).\n\n2. Solutia: Test Data Builder Pattern:\n   - Clasa ajutatoare care ofera valori implicite sigure pentru toate campurile obligatorii si metode fluente de suprascriere doar pentru ce conteaza in test.",
    codeSnippet: `// Utilizare Test Builder elegant:
Utilizator user = UtilizatorTestBuilder.unUtilizator()
    .cuEmail("specific@test.ro")
    .cuRol(Rol.ADMIN)
    .build();
    
// Daca entitatea primeste 5 campuri noi maine, doar clasa Builder se modifica;
// toate cele 100 de teste raman intacte!`,
    interviewTrap: "Lombok `@Builder` este util, dar un Test Data Builder custom este superior deoarece pre-populeaza automat campurile obligatorii (cum ar fi un UUID unic generat), scutindu-te de specificarea lor manuala in fiecare test.",
    keyTakeaway: "Test Data Builders pre-completeaza campurile implicite si permit suprascrierea fluenta doar a proprietatilor relevante pentru testul curent."
  },
  {
    id: "test-61",
    category: "TESTING",
    difficulty: "USOR",
    title: "Generarea de Date Aleatorii Realiste cu JavaFaker / Bogus",
    question: "Ce beneficii aduce utilizarea bibliotecilor precum JavaFaker sau DataFaker in scrierea testelor?",
    answer: "In loc sa folosesti date plictisitoare si nerealiste precum `\"test\"`, `\"asdf\"`, `\"1234\"`:\n\nBeneficiile generarii dinamice de date cu Faker:\n1. Date Realiste:\n   - Genereaza nume reale, adrese valide, numere de telefon corect formatate, IBAN-uri conforme si emailuri valide conform RFC.\n2. Descoperirea Bug-urilor Ascunse:\n   - Faker poate genera nume cu caractere speciale, apostrofuri (ex: \"O'Connor\") sau lungimi variabile, descoperind bug-uri de SQL injection, parsare sau limitare de campuri care nu ar fi fost prinse cu `\"Ion\"`.\n3. Date Unice Garantate:\n   - Previne erorile de unicitate pe email prin generarea de valori unice la fiecare executie.",
    codeSnippet: `Faker faker = new Faker();

String nume = faker.name().fullName(); // ex: "Mihai Ionescu"
String email = faker.internet().emailAddress();
String iban = faker.finance().iban();
String adresa = faker.address().fullAddress();

Utilizator user = new Utilizator(nume, email, iban);`,
    interviewTrap: "Daca folosesti date aleatorii in teste, asigura-te ca asertiunea nu depinde de o valoare fixa! De exemplu, nu verifica `assertEquals(\"Mihai\", user.getNume())` daca numele a fost generat aleator.",
    keyTakeaway: "Faker genereaza date realiste si variabile, testand rezistenta aplicatiei la cazuri reale din productie."
  },
  {
    id: "test-62",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Mockito Strictness: STRICT_STUBS si UnnecessaryStubbingException",
    question: "De ce arunca Mockito exceptia `UnnecessaryStubbingException` in JUnit 5 si cum ajuta la mentinerea testelor curate?",
    answer: "Incepand cu extensia JUnit 5 (`@ExtendWith(MockitoExtension.class)`), Mockito foloseste modul implicit `Strictness.STRICT_STUBS`:\n\nCe inseamna:\n- Daca configurezi un mock cu `when(mock.metoda()).thenReturn(...)`, dar metoda testata NU APELEAZA NICIODATA acea metoda in timpul executiei testului:\n- Mockito considera acel stub ca fiind \"inutil\" (Dead Code) si ARUNCA O EXCEPTIE la sfarsitul testului, marcandu-l ca ESUAT!\n\nDe ce este o facilitate excelenta:\n1. Previne testele invechite si confuze: Elimina stub-urile lasate in urma dupa refactoring-uri care nu mai au legatura cu realitatea.\n2. Detecteaza greseli logice: Daca te asteptai ca metoda sa fie apelata si ea nu a fost, ai descoperit un bug in logica de executie a testului.",
    codeSnippet: `@Test
void testCuStubInutil() {
    // Daca metoda testata nu apeleaza niciodata findById, Mockito arunca:
    // UnnecessaryStubbingException: Unnecessary stubbings detected in test class!
    when(userRepo.findById(1L)).thenReturn(Optional.of(new User()));
    
    service.calculeazaDoarCevaStatic(); // findById nu e apelat!
}`,
    interviewTrap: "Daca ai un `@BeforeEach` comun care configureaza stub-uri folosite doar de unele teste, poti relaxa strictetea folosind `lenient().when(...)` sau adaugand `@MockitoSettings(strictness = Strictness.LENIENT)`.",
    keyTakeaway: "`STRICT_STUBS` previne acumularea de cod mort in teste aruncand eroare daca un stub configurat nu este invocat niciodata."
  },
  {
    id: "test-63",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "De Ce RETURNS_DEEP_STUBS Este Considerat un Anti-Pattern",
    question: "Ce face optiunea `mock(Clasa.class, RETURNS_DEEP_STUBS)` in Mockito si de ce incalca Legea lui Demeter?",
    answer: "1. Ce face `RETURNS_DEEP_STUBS`:\n   - Permite mock-uirea apelurilor in lant (method chaining) fara a crea manual mock-uri intermediare:\n   - `when(order.getUser().getAddress().getCity()).thenReturn(\"Bucuresti\");`.\n   - Mockito creeaza automat mock-uri ascunse pentru `getUser()` si `getAddress()`.\n\n2. De ce este un Anti-Pattern serios:\n   - Incalca direct \"Legea lui Demeter\" (Principiul Minimei Cunoasteri / \"Vorbeste doar cu prietenii tai directi\"):\n     - Clasa testata stie prea multe despre structura interna a altor obiecte (navigheaza prin 4 niveluri de obiecte).\n   - Creeaza teste extrem de cuplate si fragile la orice mica schimbare structurala.\n   - Daca ai nevoie de `RETURNS_DEEP_STUBS`, este un semnal clar ca arhitectura codului de productie are nevoie de refactorizare (clasa `Order` ar trebui sa aiba direct o metoda `getCity()` sau sa primeasca direct orasul).",
    codeSnippet: `// ANTIPATTERN (Miros de cod):
Order order = mock(Order.class, RETURNS_DEEP_STUBS);
when(order.getCustomer().getProfile().getEmail()).thenReturn("test@test.ro");

// REFACTORIZARE CORECTA in codul de productie:
// customer.getEmail() - interogare directa!`,
    interviewTrap: "La interviu, mentionarea faptului ca deep stubs indica o incalcare a Legii lui Demeter demonstreaza ca judeci testele din perspectiva designului curat, nu doar a scrierii de asertiuni.",
    keyTakeaway: "`RETURNS_DEEP_STUBS` mascheaza un design prost cu lanturi lungi de get-uri; rezolva problema prin refactorizarea codului de productie."
  },
  {
    id: "test-64",
    category: "TESTING",
    difficulty: "USOR",
    title: "verifyNoMoreInteractions() vs verifyNoInteractions()",
    question: "Care este diferenta intre `verifyNoInteractions()` si `verifyNoMoreInteractions()` in Mockito?",
    answer: "Doua instrumente pentru controlul riguros al dependintelor:\n\n1. `verifyNoInteractions(mock1, mock2)`:\n   - Verifica ca NU a existat NICIO interactiune cu mock-urile respective in tot testul (nicio metoda nu a fost apelata).\n   - Echivalentul lui `verify(mock, never()).oriceMetoda()`.\n\n2. `verifyNoMoreInteractions(mock)`:\n   - Se foloseste DUPA ce ai verificat deja anumite metode specifice.\n   - Garanteaza ca NU au mai existat ALTE apeluri suplimentare neasteptate pe acel mock in afara celor verificate explicit mai sus!",
    codeSnippet: `@Test
void testPlataFaraAlteApeluri() {
    plataService.proceseaza(comanda);
    
    // Verificam apelul asteptat:
    verify(bancaClient).debiteaza(100.0);
    
    // Confirmam ca bancaClient NU a mai fost apelat pentru nimic altceva:
    verifyNoMoreInteractions(bancaClient);
    
    // Confirmam ca serviciul de audit nu a fost atins deloc:
    verifyNoInteractions(auditService);
}`,
    interviewTrap: "Nu abuza de `verifyNoMoreInteractions()` pe toate testele! Folosirea excesiva face testele rigide si greu de intretinut daca adaugi un log sau o metrica secundara.",
    keyTakeaway: "`verifyNoInteractions` asigura ca mock-ul a fost neatins; `verifyNoMoreInteractions` asigura ca nu au existat alte apeluri in afara celor verificate."
  },
  {
    id: "test-65",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Claselor Imutabile (Record in Java 17/21)",
    question: "Cum se testeaza un Java `Record` si ce garantii ofera compilatorul automat?",
    answer: "Java Records (`public record UserDto(String nume, int varsta) {}`) sunt clase imutabile transparente de date:\n\nCe garanteaza compilatorul automat (si NU are rost sa testezi manual):\n- Implementarea corecta a metodelor `equals()` si `hashCode()` pe baza tuturor campurilor.\n- Implementarea metodei `toString()`.\n- Crearea getterelor (`nume()`, `varsta()`).\n\nCe TREBUIE sa testezi la un Record:\n1. Validarile din Constructorul Compact (Compact Constructor):\n   - Daca ai pus reguli de afaceri in constructor (ex: varsta >= 18, email nenul), testezi ca arunca `IllegalArgumentException` la date invalide.\n2. Metodele suplimentare de calcul adaugate manual in Record.\n3. Serializarea/deserializarea JSON cu Jackson.",
    codeSnippet: `public record UtilizatorDto(String email, int varsta) {
    // Constructor compact cu validare:
    public UtilizatorDto {
        if (varsta < 18) throw new IllegalArgumentException("Doar adulti!");
        Objects.requireNonNull(email);
    }
}

// Testul se concentreaza pe validari:
@Test
void candVarstaSub18_trebuieSaArunceIllegalArgumentException() {
    assertThrows(IllegalArgumentException.class, () -> new UtilizatorDto("test@test.ro", 16));
}`,
    interviewTrap: "Nu scrie teste unitare doar ca sa verifici ca `userDto.nume()` intoarce valoarea pasata in constructor! Asta testeaza compilatorul Java, nu logica ta de afaceri.",
    keyTakeaway: "La Java Records nu testezi gettere, equals sau toString; testezi doar validarile din constructorul compact si metodele adaugate de tine."
  },
  {
    id: "test-66",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Codului Dependent de Timp: java.time.Clock",
    question: "Cum testezi o metoda care verifica daca o promotie sau o factura a expirat astazi, fara ca testul sa pice maine?",
    answer: "1. De ce este `LocalDateTime.now()` un dezastru in teste:\n   - `now()` citeste ceasul fizic al sistemului de operare. Daca testezi ca \"un abonament expira dupa 30 de zile\", testul tau va deveni dependent de data calendaristica la care este rulat (pica la sfarsit de an sau la trecerea la ora de vara).\n\n2. Solutia Curata: Injectarea unui `java.time.Clock`:\n   - In codul de productie: Clasa primeste un bean de `Clock` si apeleaza `LocalDate.now(clock)`.\n   - In Spring Boot de productie: Se inregistreaza `@Bean public Clock clock() { return Clock.systemDefaultZone(); }`.\n   - In testul unitar: Se injecteaza un ceas inghetat la o data si ora exacta: `Clock.fixed(instant, zone)`!\n   - Testul va rula cu EXACT aceeasi data si secunda indiferent daca este executat azi, peste 5 ani sau in anul 2040!",
    codeSnippet: `// Clasa de productie:
public boolean esteExpirat(Factura f) {
    return f.getDataScadenta().isBefore(LocalDate.now(clock));
}

// In test: Ceas inghetat la 2026-10-02:
Instant instantFix = Instant.parse("2026-10-02T10:00:00Z");
Clock fixedClock = Clock.fixed(instantFix, ZoneId.of("UTC"));
FacturaService service = new FacturaService(fixedClock);

// Testul este 100% determinist si stabil pe vecie!`,
    interviewTrap: "Daca folosesti `Thread.sleep()` sau `mockStatic(LocalDate.class)`, complici inutil codul. Injectarea interfetei standard `Clock` este bune practici recomandata oficial de echipa Java.",
    keyTakeaway: "Injecteaza `java.time.Clock` in servicii pentru a putea ingheta timpul in teste folosind `Clock.fixed()`, garantand teste complet deterministe."
  },
  {
    id: "test-67",
    category: "TESTING",
    difficulty: "USOR",
    title: "Code Coverage: Line Coverage vs Branch Coverage (JaCoCo)",
    question: "Care este diferenta intre Line Coverage si Branch Coverage si de ce Line Coverage poate fi inselator?",
    answer: "Metrice raportate de instrumente precum JaCoCo in pipeline-ul CI/CD:\n\n1. Line Coverage (Acoperire pe Linii):\n   - Masoara procentul de linii de cod care au fost executate cel putin o data in timpul suitei de teste.\n   - De ce este inselatoare: O linie de cod poate contine conditii logice multiple (`if (a && b)`). Daca testul tau trece pe acea linie doar cu `a=true` si `b=true`, linia e marcata ca 100% acoperita, desi combinatiile `false` nu au fost testate deloc!\n\n2. Branch Coverage (Acoperire pe Ramuri de Decizie - Superioara):\n   - Masoara daca FIECARE ramura decizionala (`true` si `false` dintr-un `if`, fiecare `case` dintr-un `switch`) a fost explorata.\n   - Ofera o masura mult mai reala a calitatii testarii decat simpla parcurgere a liniilor.",
    codeSnippet: `// O singura linie cu 2 ramuri:
if (esteAdmin && arePermisiune) { executa(); }

// Line Coverage: 100% daca un singur test trece pe aici cu (true, true).
// Branch Coverage: doar 50%! (Ramurile false nu au fost explorate).`,
    interviewTrap: "Un test fara nicio asertiune (`assert`) poate atinge 100% Line Coverage daca doar apeleaza metoda! Code Coverage masoara doar ce cod a fost atins, nu daca testele chiar verifica rezultatele.",
    keyTakeaway: "Branch Coverage este superioara deoarece verifica ambele rezultate ale instructiunilor conditionale (true si false)."
  },
  {
    id: "test-68",
    category: "TESTING",
    difficulty: "USOR",
    title: "De Ce 100% Code Coverage Este o Iluzie Periculoasa",
    question: "De ce o acoperire a codului de 100% nu garanteaza lipsa de bug-uri si care este procentul recomandat in industrie?",
    answer: "1. De ce 100% Coverage este o tinta falsa (Goodhart's Law):\n   - \"Cand o masuratoare devine o tinta, inceteaza sa mai fie o masuratoare buna\".\n   - Dezvoltatorii fortati sa atinga 100% vor scrie teste superficiale pentru clase triviale (gettere, settere, DTO-uri, configuratii), fara asertiuni reale, doar pentru a bifa procentul.\n   - 100% acoperire nu testeaza: cazurile limita neprevazute, valorile `null`, caderile de retea, datele masive concurente sau integrarea dintre componente.\n\n2. Procentul sanatos in industrie:\n   - 75% - 85% pe logica critica de business (servicii, validari, algoritmi de calcul).\n   - Nu se testeaza: clase de configurare simpla, entitati POJO/DTO fara logica, clase generate automat (MapStruct, jOOQ).",
    codeSnippet: `// Metoda cu 100% Line Coverage dar cu bug fatal la runtime:
public int imparte(int a, int b) {
    return a / b; // Testat cu imparte(10, 2) -> Linie verde 100%!
    // Dar nimeni nu a testat imparte(10, 0) -> Crash ArithmeticException!
}`,
    interviewTrap: "La interviu, daca te lauzi ca vizezi intotdeauna 100% coverage, risti sa pari un teoretician naiv. Un raspuns pragmatic subliniaza testarea temeinica a logicii de business critice si a cazurilor limita.",
    keyTakeaway: "Acoperirea de 100% ofera un fals sentiment de siguranta; tinteste 80% concentrat pe logica de afaceri si cazuri limita reale."
  },
  {
    id: "test-69",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Mutation Testing (PIT / Pitest): Cine Testeaza Testele?",
    question: "Ce este Mutation Testing (Testarea prin Mutatii) si cum demonstreaza calitatea reala a asertiunilor dintr-o suita de teste?",
    answer: "Mutation Testing testeaza eficienta testelor tale introducand deliberat bug-uri mici (\"Mutanti\") in codul de productie compilat (bytecode):\n\nCum functioneaza (ex: framework-ul PITest):\n1. PITest modifica automat o instructiune in cod:\n   - Schimba `if (a > b)` in `if (a >= b)` sau `if (a < b)`.\n   - Schimba `return total + tva` in `return total - tva`.\n   - Inlocuieste un apel de metoda cu `null`.\n2. Ruleaza suita existenta de teste peste codul modificat:\n   - Daca un test ESUAZA: Mutantul este UCIS (\"Mutant Killed\" - SUCCES, testul tau a prins bug-ul!).\n   - Daca testele trec in continuare cu VERDE: Mutantul a SUPRAVIETUIT (\"Mutant Survived\" - ESEC, testele tale au asertiuni slabe si nu au observat bug-ul!).\n\nScorul de Mutatie (Mutation Score):\n- Procentul de mutanti omorati (masura suprema a calitatii asertiunilor).",
    codeSnippet: `# Rulare Mutation Testing in Maven:
mvn org.pitest:pitest-maven:mutationCoverage
# Raport HTML generat: arata exact liniile unde mutantii au supravietuit!`,
    interviewTrap: "Daca ai 100% Line Coverage dar 20% Mutation Score, inseamna ca ai teste care executa codul dar nu au asertiuni reale (`assert`) care sa verifice valorile!",
    keyTakeaway: "Mutation Testing introduce bug-uri automate in cod pentru a verifica daca testele tale sunt suficient de vigilente sa le detecteze."
  },
  {
    id: "test-70",
    category: "TESTING",
    difficulty: "USOR",
    title: "Smoke Testing vs Sanity Testing vs Regression Testing",
    question: "Care este diferenta de scop si moment de executie intre Smoke Testing, Sanity Testing si Regression Testing?",
    answer: "Trei etape distincte in ciclul de viata QA:\n\n1. Smoke Testing (\"Testul de fum\"):\n   - Origine: Din electronica (daca bagi aparatul in priza si nu iese fum, mergi mai departe).\n   - O suita foarte rapida de teste fundamentale (5-10 minute) rulata IMEDIAT dupa un build sau deploy nou pe un mediu.\n   - Scop: Verifica daca aplicatia porneste, daca baza de date raspunde si daca utilizatorul se poate loga. Daca pica, build-ul este respins instant!\n\n2. Sanity Testing:\n   - O verificare rapida si concentrata strict pe o functionalitate NOU adaugata sau pe un bug-fix specific.\n   - Scop: Valideaza ca problema respectiva a fost remediata inainte de teste mai adanci.\n\n3. Regression Testing (Testarea de Regresie):\n   - O suita completa si detaliata care verifica TOATE functionalitatile aplicatiei.\n   - Scop: Garanteaza ca modificarile noi de cod nu au stricat accidental lucruri vechi care functionau deja!",
    codeSnippet: `Build Nou -> [ Smoke Test (5 min) ] -> Pica? -> Respinge build-ul!
                      |
              [ Sanity Test pe Bug-ul #42 ]
                      |
              [ Regression Test Suite Completa ] -> Gata de Productie!`,
    interviewTrap: "Smoke testing testeaza superficial toata aplicatia (broad and shallow). Sanity testing testeaza in adancime o functionalitate specifica (narrow and deep).",
    keyTakeaway: "Smoke testeaza daca sistemul porneste si e stabil; Sanity verifica un fix punctual; Regression verifica ca nimic vechi nu s-a stricat."
  },
  {
    id: "test-71",
    category: "TESTING",
    difficulty: "USOR",
    title: "Tehnici de Proiectare a Testelor: Boundary Value Analysis (BVA)",
    question: "Cum folosesti Boundary Value Analysis (BVA) si Equivalence Partitioning pentru a alege datele de test cele mai valoroase?",
    answer: "Pentru a nu scrie la intamplare 100 de teste:\n\n1. Partitii de Echivalenta (Equivalence Partitioning):\n   - Imparte datele de intrare in clase valide si invalide unde comportamentul sistemului este identic.\n   - Exemplu: Varsta valida pentru carnet de sofer: 18 - 70 de ani.\n     - Clasa Invalida Sub: `< 18` (ex: 15)\n     - Clasa Valida: `18 .. 70` (ex: 35)\n     - Clasa Invalida Peste: `> 70` (ex: 85)\n   - Alegi un singur reprezentant din fiecare clasa.\n\n2. Analiza Valorilor Limita (Boundary Value Analysis - BVA):\n   - Marea majoritate a bug-urilor din software se afla EXACT LA MARGINEA CONDITIILOR (erori clasice de tip \"Off-By-One\", `>` in loc de `>=`)!\n   - Se testeaza obligatoriu valorile de la granita:\n     - La limita inferioara 18: testezi `17` (invalid), `18` (valid), `19` (valid).\n     - La limita superioara 70: testezi `69` (valid), `70` (valid), `71` (invalid).",
    codeSnippet: `// Date de intrare testate conform BVA pentru intervalul [18, 70]:
// Valori testate: 17 (pica), 18 (trece), 70 (trece), 71 (pica).
@ParameterizedTest
@CsvSource({
    "17, false",
    "18, true",
    "70, true",
    "71, false"
})
void testValidareVarsta(int varsta, boolean valid) { ... }`,
    interviewTrap: "Daca testezi doar valori din mijlocul multimii (ex: 25, 30, 40), nu vei descoperi niciodata bug-ul in care programatorul a scris `varsta > 18` in loc de `varsta >= 18`!",
    keyTakeaway: "Cele mai multe bug-uri apar la limite; foloseste BVA pentru a testa exact granitele inferioare si superioare ale conditiilor."
  },
  {
    id: "test-72",
    category: "TESTING",
    difficulty: "USOR",
    title: "Black Box vs White Box vs Grey Box Testing",
    question: "Care este diferenta intre testarea Black Box, White Box si Grey Box?",
    answer: "Diferenta consta in gradul de cunoastere al structurii interne a codului:\n\n1. Black Box Testing (Cutie Neagra):\n   - Testerul NU are acces la codul sursa si nu stie cum este implementata aplicatia.\n   - Testarea se face strict din perspectiva utilizatorului final: se trimit date de intrare si se verifica rezultatul de iesire conform specificatiilor.\n   - Exemple: Teste E2E, teste manuale de QA, teste de acceptanta.\n\n2. White Box Testing (Cutie Alba / Clear Box):\n   - Testerul (de regula dezvoltatorul) are acces complet la codul sursa si arhitectura interna.\n   - Testarea valideaza structuri de date interne, fluxuri de decizie, bucle si exceptii.\n   - Exemple: Teste unitare cu Mockito, teste de acoperire a ramurilor (Branch Coverage).\n\n3. Grey Box Testing (Cutie Gri):\n   - O combinatie: Testerul are acces partial la arhitectura (ex: stie schema bazei de date si endpoint-urile de API, dar nu codul Java fin).\n   - Exemple: Teste de securitate pe API, teste de integrare.",
    codeSnippet: `Black Box: Utilizator apasa pe buton -> Vede "Succes" pe ecran.
White Box:  Verificare ca metoda \`userService.hashPassword()\` a fost apelata cu SHA-256.
Grey Box:   Apelare direct prin Postman la \`/api/plati\` si verificare ca in Postgres s-a creat un rand.`,
    interviewTrap: "Testele unitare sunt White Box; testele de performanta sau de acceptanta a utilizatorului (UAT) sunt Black Box.",
    keyTakeaway: "Black Box testeaza fara cunoasterea codului; White Box testeaza structura interna a codului; Grey Box combina ambele abordari."
  },
  {
    id: "test-73",
    category: "TESTING",
    difficulty: "USOR",
    title: "Teste de Performanta: Load Testing vs Stress Testing vs Soak Testing",
    question: "Care sunt diferentele cheie intre Load Testing, Stress Testing si Soak (Endurance) Testing?",
    answer: "Trei tipuri de teste de performanta rulate cu instrumente precum k6, JMeter sau Gatling:\n\n1. Load Testing (Testare de Incarcare Normala):\n   - Simuleaza volumul de utilizatori concurenti asteptat in mod normal in productie (ex: 2.000 de cereri/secunda timp de 30 de minute).\n   - Scop: Verifica daca timpii de raspuns (latenta P95/P99) se incadreaza in standardele de performanta (sub 200ms).\n\n2. Stress Testing (Testare la Punctul de Rupere):\n   - Creste traficul continuu PESTE limita maxima admisa (ex: 2.000 -> 5.000 -> 10.000 -> 25.000 req/sec) pana cand sistemul se prabuseste!\n   - Scop: Afla capacitatea maxima de rupere si daca sistemul isi revine singur dupa ce sarcina extrema inceteaza (Graceful Recovery).\n\n3. Soak Testing (Endurance Testing - Testare de Anduranta):\n   - Ruleaza o incarcare moderata pe o DURATA LUNGA de timp (ex: 12-24 de ore continuu).\n   - Scop: Descoperirea scurgerilor lente de memorie (Memory Leaks in JVM), acumularea de conexiuni neinchise pe baza de date sau umplerea spatiului pe disc.",
    codeSnippet: `// Exemplu test de performanta k6 (Load Test simplu):
export const options = {
  vus: 100, // 100 utilizatori virtuali concurenti
  duration: '5m',
};
export default function () {
  http.get('http://localhost:8080/api/produse');
}`,
    interviewTrap: "Daca rulezi un test doar 2 minute, nu vei prinde niciodata un Memory Leak de JVM! Doar Soak Testing-ul de cateva ore releva cresterea lenta si continua a memoriei heap.",
    keyTakeaway: "Load Testing verifica traficul normal de zi cu zi; Stress Testing cauta punctul de rupere; Soak Testing descopera scurgeri lente de memorie in timp."
  },
  {
    id: "test-74",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Chaos Engineering: Principiul Chaos Monkey",
    question: "Ce este Chaos Engineering si cum asigura rezilienta sistemelor distribuite in productie?",
    answer: "1. Ce este Chaos Engineering (popularizat de Netflix):\n   - Disciplina experimentarii controlate asupra unui sistem distribuit pentru a castiga incredere in capacitatea sa de a rezista la conditii turbulente si neasteptate.\n\n2. Cum functioneaza celebrul \"Chaos Monkey\":\n   - Un proces automat care ruleaza continuu in mediul de test sau chiar in PRODUCTIE si \"impusca\" (opreste fortat) la intamplare instante de servere, pod-uri Kubernetes sau conexiuni de retea!\n\n3. De ce se practica o asemenea abordare extrema:\n   - Pentru ca intr-un cluster cu 500 de microservicii, serverele oricum pica fizic in fiecare saptamana.\n   - Daca arhitectura este cu adevarat rezilienta (are Load Balancing, Circuit Breakers, Auto-Scaling si Replicas), utilizatorii finali nu trebuie sa simta absolut nimic cand un server este ucis!\n   - Transforma caderile accidentale in evenimente obisnuite non-urgente.",
    codeSnippet: `Chaos Monkey: "Ucid containerul Payments-Instance-3"
Rezultat Sanatos:
1. Load Balancer detecteaza lipsa heartbeat-ului in 2 secunde.
2. Traficul este directionat pe Payments-Instance-1 si 2.
3. Kubernetes porneste automat un container de inlocuire.
4. Utilizatorii au 0 erori raportate!`,
    interviewTrap: "Nu incepe cu haosul direct in productie daca nu ai mai intai observabilitate solida (metrici, alerte) si teste automate de baza. Chaos Engineering este pasul final al maturitatii arhitecturale.",
    keyTakeaway: "Chaos Engineering injecteaza defectiuni controlate pentru a demonstra practic ca sistemul rezista automat la caderi de infrastructura."
  },
  {
    id: "test-75",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Tranzitiilor de Stare ale unui Circuit Breaker",
    question: "Cum testezi automat ca un Circuit Breaker trece corect din starea CLOSED in starea OPEN dupa un prag de erori?",
    answer: "Testarea configuratiei de rezilienta cu Resilience4j in Spring Boot:\n\nCum se structureaza testul:\n1. Se injecteaza `CircuitBreakerRegistry` si se obtine instanta circuitului.\n2. Se configureaza un mock extern sa arunce exceptii (`doThrow()`).\n3. Intr-o bucla `for`, se apeleaza serviciul de atatea ori cat este dimensiunea ferestrei glisante (ex: 5 apeluri esuate).\n4. Se verifica starea circuitului: `assertThat(circuitBreaker.getState()).isEqualTo(State.OPEN)`!\n5. Se trimite un al 6-lea apel si se verifica ca metoda externa NU mai este apelata deloc (`verify(externalService, times(5)).call()`), ci se returneaza direct raspunsul fallback.",
    codeSnippet: `@Test
void candRataDeEroriDepasestePragul_circuitulTrebuieSaTreciInStareaOpen() {
    when(clientBancar.debiteaza(any())).thenThrow(new RestClientException("503"));
    
    // Apelam de 5 ori pentru a atinge pragul de eroare:
    for (int i = 0; i < 5; i++) {
        plataService.executaPlata(100.0);
    }
    
    CircuitBreaker cb = cbRegistry.circuitBreaker("bancaService");
    assertThat(cb.getState()).isEqualTo(CircuitBreaker.State.OPEN);
    
    // Al 6-lea apel: Circuit Breaker-ul respinge cererea FARA a mai apela clientul bancar:
    plataService.executaPlata(100.0);
    verify(clientBancar, times(5)).debiteaza(any()); // A ramas 5, nu 6!
}`,
    interviewTrap: "Asigura-te ca in proprietatile de test ale lui Resilience4j ai setat o dimensiune mica a ferestrei (`minimumNumberOfCalls: 5`). Daca lasi configuratia de productie cu 100 de apeluri, testul tau va trebui sa faca 100 de cereri pentru a declansa circuitul.",
    keyTakeaway: "Testarea Circuit Breaker-ului valideaza trecerea in starea OPEN dupa numarul configurat de esecuri si oprirea apelurilor catre dependinta cazuta."
  },
  {
    id: "test-76",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Mecanismelor de Retry (@Retryable)",
    question: "Cum testezi ca o metoda adnotata cu `@Retryable` incearca de exact 3 ori inainte de a renunta?",
    answer: "Cand folosesti Spring Retry sau Resilience4j Retry pe un apel instabil de retea:\n\nCum se testeaza comportamentul:\n1. Configurezi mock-ul sa arunce o exceptie re-incercabila (ex: `HttpServerErrorException` sau `IOException`).\n2. Apelezi metoda din serviciul testat (serviciul trebuie sa fie injectat din contextul Spring pentru ca adnotarea `@Retryable` sa fie activata via proxy AOP).\n3. Verifici cu `verify(mock, times(3)).metoda()` ca mock-ul a fost apelat de fix 3 ori!\n4. Verifici ca la final a fost aruncata exceptia asteptata sau s-a apelat metoda `@Recover` de salvare.",
    codeSnippet: `@SpringBootTest
class CursValutarServiceRetryTest {
    @Autowired private CursValutarService service;
    @MockBean private BnrClient bnrClient;

    @Test
    void candClientulPica_trebuieSaReincerceDeTreiOri() {
        when(bnrClient.getCurs()).thenThrow(new ResourceAccessException("Timeout"));
        
        assertThrows(ServiceUnavailableException.class, () -> service.obtineCurs());
        
        // Verificam ca s-au facut exact cele 3 incercari:
        verify(bnrClient, times(3)).getCurs();
    }
}`,
    interviewTrap: "Daca testezi serviciul instantiindu-l cu `new CursValutarService()`, `@Retryable` nu va functiona deloc! Orice mecanism bazat pe adnotari AOP in Spring necesita un test integrat in care serviciul este injectat ca bean de context.",
    keyTakeaway: "Valideaza mecanismul de retry demonstrand ca dependinta externa a fost invocata de numarul exact de ori configurat (`times(3)`) inainte de esec."
  },
  {
    id: "test-77",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Rate Limiting-ului in Spring Boot",
    question: "Cum testezi ca filtrul sau interceptorul de Rate Limiting returneaza HTTP 429 Too Many Requests la depasirea limitei?",
    answer: "Daca endpoint-ul permite maxim 10 cereri pe minut per utilizator sau per IP:\n\nCum se structureaza testul MockMvc:\n1. Intr-o bucla `for`, trimiti 10 cereri consecutive de la acelasi IP (adaugand headerul `X-Forwarded-For: 198.51.100.1` sau prin context de autentificare).\n2. Verifici ca primele 10 cereri returneaza `HTTP 200 OK`.\n3. Trimiti a 11-a cerere de la acelasi IP.\n4. Verifici ca a 11-a cerere primeste `HTTP 429 Too Many Requests`!\n5. Verifici prezenta antetului `Retry-After` in raspuns.",
    codeSnippet: `@Test
void candDepasesteLimitaDe10Cereri_trebuieSaPrimeasca429() throws Exception {
    String ip = "192.168.1.50";
    
    // Primele 10 cereri trec cu succes:
    for (int i = 0; i < 10; i++) {
        mockMvc.perform(get("/api/produse").header("X-Forwarded-For", ip))
               .andExpect(status().isOk());
    }
    
    // A 11-a cerere este blocata de Rate Limiter:
    mockMvc.perform(get("/api/produse").header("X-Forwarded-For", ip))
           .andExpect(status().isTooManyRequests()) // HTTP 429
           .andExpect(header().exists("Retry-After"));
}`,
    interviewTrap: "Daca testul partajeaza o instanta reala de Redis fara curatare intre teste, al doilea test de rate limiting va pica din prima secunda pentru ca cheia IP-ului are deja contoarele pline!",
    keyTakeaway: "Testarea rate limiting-ului valideaza ca dupa N cereri de succes (`200 OK`), cererea N+1 este respinsa ferm cu `429 Too Many Requests`."
  },
  {
    id: "test-78",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Idempotentei pe Endpoint-uri de Plati",
    question: "Cum testezi automat ca trimiterea de doua ori a aceleiasi cereri de plata cu aceeasi Idempotency-Key debiteaza contul o singura data?",
    answer: "Fluxul de testare al mecanismului de Idempotenta:\n\n1. Pregatire:\n   - Se genereaza o cheie de idempotenta unica: `String idempKey = UUID.randomUUID().toString()`.\n   - Se configureaza mock-ul bancar sa returneze succes.\n\n2. Pasul 1 (Prima cerere):\n   - Trimiti `POST /api/plati` cu headerul `Idempotency-Key: idempKey`.\n   - Verifici ca raspunsul este `200 OK` (sau `201 Created`).\n\n3. Pasul 2 (A doua cerere identica - reincercare de retea):\n   - Trimiti EXACT aceeasi cerere `POST` cu ACEEASI cheie `Idempotency-Key`.\n   - Verifici ca raspunsul este identic cu primul.\n\n4. Asertiunea Suprema:\n   - Verifici cu `verify(bancaClient, times(1)).charge(...)` ca banca a fost apelata STRICT O SINGURA DATA!\n   - Acest lucru demonstreaza ca al doilea apel a fost servit din cache-ul de idempotenta fara debitare dubla.",
    codeSnippet: `@Test
void cerereaCuAceeasiCheieDeIdempotenta_nuTrebuieSaDebitezeDublu() throws Exception {
    String idempKey = UUID.randomUUID().toString();
    String body = "{\\"suma\\": 100.0}";
    
    // Cererea 1:
    mockMvc.perform(post("/api/plati")
            .header("Idempotency-Key", idempKey)
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isOk());
        
    // Cererea 2 (Retry identic):
    mockMvc.perform(post("/api/plati")
            .header("Idempotency-Key", idempKey)
            .contentType(MediaType.APPLICATION_JSON)
            .content(body))
        .andExpect(status().isOk());
        
    // Verificare cheie: Banca a fost debitata o singura data!
    verify(paymentGateway, times(1)).debiteazaCont(any());
}`,
    interviewTrap: "Daca uiti sa verifici `times(1)` pe gateway-ul de plata, testul tau poate fi verde (ambele requesturi au dat 200), dar utilizatorul a fost taxat de doua ori in spate!",
    keyTakeaway: "Valideaza idempotenta demonstrand ca trimiterea repetata a aceleiasi `Idempotency-Key` apeleaza dependinta de debitare o singura data."
  },
  {
    id: "test-79",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Filtrelor HTTP (OncePerRequestFilter)",
    question: "Cum testezi unitar un filtru personalizat de securitate sau logging care extinde `OncePerRequestFilter`?",
    answer: "Un filtru HTTP poate fi testat fie ca test unitar pur, fie integrat prin `MockMvc`:\n\n1. Testare Unitara Rapida (fara Spring):\n   - Se instantiaza filtrul direct cu `new CustomHeaderFilter()`.\n   - Se instantiaza `MockHttpServletRequest`, `MockHttpServletResponse` si un `MockFilterChain` simulate oferite de `spring-test`.\n   - Se apeleaza metoda `doFilterInternal(request, response, filterChain)`.\n   - Se verifica daca filtrul a setat antetul dorit in response sau a blocat cererea.\n   - Se verifica ca `filterChain.doFilter(...)` a fost invocat pentru a lasa cererea sa mearga mai departe catre controllere.",
    codeSnippet: `@Test
void filtruTrebuieSaAdaugeHeaderDeSecuritate() throws ServletException, IOException {
    CustomSecurityFilter filter = new CustomSecurityFilter();
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    MockFilterChain chain = new MockFilterChain();
    
    filter.doFilter(request, response, chain);
    
    assertThat(response.getHeader("X-Content-Type-Options")).isEqualTo("nosniff");
}`,
    interviewTrap: "Nu uita sa verifici ca lantul de filtre (`filterChain`) este continuat! Daca filtrul uita sa apeleze `chain.doFilter()`, cererea se va opri acolo si niciun controller nu va mai fi atins vreodata.",
    keyTakeaway: "Filtrele HTTP se testeaza usor unitar folosind `MockHttpServletRequest`, `MockHttpServletResponse` si `MockFilterChain` din pachetul `spring-test`."
  },
  {
    id: "test-80",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Migrarilor de Baza de Date cu Flyway in Testcontainers",
    question: "Cum testezi ca scripturile SQL de migrare Flyway (V1, V2, V3) se executa curat de la zero fara erori de sintaxa?",
    answer: "Scripturile de migrare Flyway/Liquibase sunt adesea sursa principala de caderi de pipeline la deploy:\n\nCum se testeaza automat:\n1. Se porneste un container curat de PostgreSQL prin Testcontainers (complet gol, fara tabele).\n2. Se configureaza Flyway sa ruleze automat la pornirea contextului de test (`spring.flyway.enabled=true`).\n3. Testul pur si simplu porneste contextul Spring Boot si verifica ca bean-ul `Flyway` s-a executat cu succes.\n4. Se verifica tabela `flyway_schema_history` pentru a valida ca toate migrarile au statusul `SUCCESS`.\n5. Acest test garanteaza ca nicio virgula lipsa, nume de coloana rezervat sau cheie straina gresita nu va bloca deploy-ul pe productie.",
    codeSnippet: `@SpringBootTest
@Testcontainers
class FlywayMigrationIntegrationTest {
    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired private Flyway flyway;

    @Test
    void toateMigrarileTrebuieSaRulezeFaraEroare() {
        MigrationInfoService info = flyway.info();
        assertThat(info.applied().length).isGreaterThan(0);
        assertThat(info.pending().length).isEqualTo(0); // Nicio migrare restanta
    }
}`,
    interviewTrap: "Daca rulezi testele doar cu `ddl-auto=create-drop`, nu testezi niciodata migrarile Flyway! Dezactiveaza `ddl-auto` (`spring.jpa.hibernate.ddl-auto=validate`) si lasa exclusiv Flyway sa creeze schema in teste.",
    keyTakeaway: "Testarea Flyway pe o instanta curata de Testcontainers asigura ca toate scripturile SQL de migrare ruleaza impecabil inainte de productie."
  },
  {
    id: "test-81",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Tranzactiilor Concurente si a Lock-urilor",
    question: "Cum testezi ca mecanismul de Optimistic Locking (`@Version`) arunca `OptimisticLockingFailureException` cand doua thread-uri modifica acelasi rand simultan?",
    answer: "Testarea concurentei necesita pornirea deliberata a doua tranzactii paralele pe thread-uri diferite:\n\nCum se structureaza testul:\n1. Se pregateste o entitate cu `@Version private Long version;` salvata in baza de date (cu ID = 1).\n2. Thread-ul 1 citeste entitatea (vede versiunea 0).\n3. Thread-ul 2 citeste si el aceeasi entitate (vede tot versiunea 0).\n4. Thread-ul 1 modifica un camp si salveaza cu succes (`version` devine 1 in baza de date).\n5. Thread-ul 2 incearca sa salveze modificarea sa folosind versiunea veche (0).\n6. Se valideaza ca salvarea Thread-ului 2 arunca ferm `OptimisticLockingFailureException`!",
    codeSnippet: `@Test
void candAparModificariConcurente_trebuieSaArunceOptimisticLockingException() {
    Produs p1 = produsRepo.findById(1L).orElseThrow();
    Produs p2 = produsRepo.findById(1L).orElseThrow();
    
    p1.setNume("Nume Modificat T1");
    produsRepo.saveAndFlush(p1); // Versiunea devine 1
    
    p2.setNume("Nume Conflict T2");
    assertThrows(OptimisticLockingFailureException.class, () -> {
        produsRepo.saveAndFlush(p2); // Trimite versiunea 0 -> Conflict!
    });
}`,
    interviewTrap: "Daca nu folosesti `saveAndFlush()`, Hibernate amana comanda UPDATE si exceptia de blocare optimista nu se va declansa in interiorul blocului `assertThrows`.",
    keyTakeaway: "Testarea concurentei simuleaza doua citiri paralele urmate de scrieri consecutive, validand detectia conflictelor prin Optimistic Locking."
  },
  {
    id: "test-82",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Validarii Custom Jakarta Validation",
    question: "Cum testezi un validator personalizat (clasa care implementeaza `ConstraintValidator<Adnotare, Tip>`)?",
    answer: "Un validator personalizat (ex: `@CNPValid` sau `@ParolaComplexa`) poate fi testat atat unitar pur (in milisecunde), cat si integrat cu validatorul Spring:\n\nTestare Unitara Pura (Cea mai simpla si rapida):\n1. Se instantiaza clasa validatorului: `CNPValidator validator = new CNPValidator();`.\n2. Se apeleaza direct metoda `isValid(valoare, context)` pasandu-i un mock pentru `ConstraintValidatorContext`.\n3. Se verifica rezultatul boolean (true pentru valori valide, false pentru valori invalide).",
    codeSnippet: `class CnpValidatorTest {
    private final CnpValidator validator = new CnpValidator();
    @Mock private ConstraintValidatorContext context;

    @Test
    void cnpCorect_trebuieSaIntoarcaTrue() {
        assertTrue(validator.isValid("1980512123456", context));
    }

    @Test
    void cnpCuLungimeGresita_trebuieSaIntoarcaFalse() {
        assertFalse(validator.isValid("12345", context));
    }
}`,
    interviewTrap: "Daca validatorul tau custom injecteaza un repository Spring (`@Autowired private UserRepository repo` pentru a verifica unicitatea), atunci testul are nevoie fie de Mockito pe acel repository, fie de un context Spring.",
    keyTakeaway: "Clasele `ConstraintValidator` se testeaza cel mai usor ca teste unitare pure apeland direct metoda `isValid()`, fara overhead de Spring."
  },
  {
    id: "test-83",
    category: "TESTING",
    difficulty: "USOR",
    title: "Executia Paralela a Testelor in JUnit 5",
    question: "Cum activezi executia paralela a testelor in JUnit 5 pentru a reduce durata build-ului la jumatate?",
    answer: "In mod implicit, JUnit 5 ruleaza testele secvential (unul dupa altul pe un singur thread).\n\nCum activezi executia paralela:\n1. Adaugi fisierul `src/test/resources/junit-platform.properties`.\n2. Adaugi configuratiile:\n   `junit.jupiter.execution.parallel.enabled = true`\n   `junit.jupiter.execution.parallel.mode.default = concurrent`\n   `junit.jupiter.execution.parallel.mode.classes.default = concurrent`\n\nRegula de aur pentru ca testele paralele sa nu pice:\n- Testele TREBUIE sa fie 100% independente! Daca doua teste paralele scriu in aceeasi tabela de baza de date comuna sau modifica variabile statice, vor aparea erori ciudate.\n- Daca un test specific are resurse partajate, il izolezi cu `@ResourceLock(\"nume_resursa\")` sau `@Execution(ExecutionMode.SAME_THREAD)`.",
    codeSnippet: `# junit-platform.properties:
junit.jupiter.execution.parallel.enabled = true
junit.jupiter.execution.parallel.mode.default = concurrent
junit.jupiter.execution.parallel.config.strategy = dynamic`,
    interviewTrap: "Executia paralela este fantastica pentru teste unitare Mockito (care nu impartasesc nimic). Insa pentru teste de integrare cu baze de date partajate, executia paralela necesita atentie sporita la izolarea datelor.",
    keyTakeaway: "Executia paralela in JUnit 5 accelereaza dramatic suita de teste utilizand toate nucleele CPU disponibile pe teste complet izolate."
  },
  {
    id: "test-84",
    category: "TESTING",
    difficulty: "USOR",
    title: "Rularea Testelor in Pipeline-ul CI/CD (GitHub Actions)",
    question: "Cum se configureaza o etapa de testare automata intr-un pipeline CI/CD si cum se opreste deploy-ul daca un test pica?",
    answer: "In orice pipeline sanatos de CI/CD (GitHub Actions, GitLab CI, Jenkins):\n\nFluxul standard:\n1. La fiecare `git push` sau `Pull Request`, pipeline-ul porneste un mediu izolat (runner Linux).\n2. Instaleaza JDK-ul necesar (ex: Java 21 Temurin) si demonul Docker (pentru Testcontainers).\n3. Executa comanda de testare: `./mvnw clean test` sau `./gradlew test`.\n4. Daca TOATE testele sunt verzi (exit code 0):\n   - Se genereaza raportul de acoperire JaCoCo si build-ul trece la faza de impachetare si deploy.\n5. Daca CHIAR SI UN SINGUR TEST PICA (exit code != 0):\n   - Pipeline-ul se opreste IMEDIAT cu status FAILED (Rosu)!\n   - Faza de deploy este anulata, iar programatorul primeste notificare pe Slack/Email, garantand ca niciun cod stricat nu ajunge pe serverul de productie.",
    codeSnippet: `# Exemplu GitHub Actions (.github/workflows/test.yml):
name: Java CI Test Suite
on: [push, pull_request]
jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'
      - name: Rulare Teste
        run: ./mvnw clean test`,
    interviewTrap: "Daca pui optiunea `-DskipTests` sau `-Dmaven.test.failure.ignore=true` in scriptul de CI/CD, pipeline-ul va ignora testele picate si va face deploy la cod stricat! Testele trebuie sa opreasca ferm build-ul in caz de esec.",
    keyTakeaway: "Pipeline-ul CI/CD ruleaza automat suita de teste la fiecare Pull Request, blocand deploy-ul la primul esec intalnit."
  },
  {
    id: "test-85",
    category: "TESTING",
    difficulty: "USOR",
    title: "Top 5 Greseli Clasice la Scrierea Testelor Automate",
    question: "Care sunt cele mai frecvente 5 greseli care fac suitele de teste inutile sau greu de intretinut?",
    answer: "Top 5 greseli clasice de evitat:\n\n1. \"Testarea Mock-ului in loc de Logica Reala\":\n   - Scrii un stub `when(repo.get()).thenReturn(x)` si apoi verifici `assertEquals(x, repo.get())`. Nu ai testat nicio linie din clasa ta de serviciu, ai testat doar ca Mockito functioneaza!\n\n2. Teste fara asertiuni (\"Assertion Roulette\"):\n   - Testul apeleaza o metoda, nu are niciun `assert` sau `verify`, si trece doar pentru ca nu a aruncat o exceptie. Nu verifica daca rezultatul este corect.\n\n3. Dependente intre teste (Ordinea conteaza):\n   - Testul 2 se bazeaza pe datele create de Testul 1. Daca rulezi doar Testul 2 individual, el pica.\n\n4. Pauze oarbe cu `Thread.sleep()`:\n   - Incetineste inutil suita de teste si provoaca teste instabile (flaky) pe serverele de CI/CD.\n\n5. Testarea detaliilor interne private in loc de comportament:\n   - Testele care se leaga de reflectie sau campuri private se rup la cel mai mic refactoring, descurajand imbunatatirea codului.",
    codeSnippet: `// GRESIT (Testeaza mock-ul, zero logica de business testata):
when(calculatorMock.aduna(2, 3)).thenReturn(5);
assertEquals(5, calculatorMock.aduna(2, 3));

// CORECT:
// Injectezi calculatorMock in ServiciulContabil si testezi serviciul!`,
    interviewTrap: "Daca stapanesti aceste 5 capcane si le explici la interviu, demonstrezi o maturitate tehnica excelenta in cultura de calitate software.",
    keyTakeaway: "Scrie teste independente, testeaza comportamentul public, foloseste asertiuni clare si evita dependentele de timp oarbe sau testarea propriilor mock-uri."
  },
  {
    id: "test-86",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea MapStruct / ModelMapper Convertoarelor",
    question: "Cum se testeaza un mapper de obiecte (ex: MapStruct) si ce erori frecvente sunt prevenite?",
    answer: "MapStruct genereaza cod Java curat la compilare pentru a copia date intre Entity si DTO:\n\nCe trebuie testat unitar la un Mapper:\n1. Copierea corecta a campurilor cu nume diferite: `@Mapping(source = \"numeComplet\", target = \"fullName\")`.\n2. Tratarea valorilor `null`: Daca entitatea de intrare este `null`, mapper-ul trebuie sa returneze `null` (nu `NullPointerException`).\n3. Maparea colectiilor goale: Verificarea ca o lista de entitati goala devine o lista goala in DTO, nu `null`.\n4. Conversiile de tipuri (ex: transformarea unui `Enum` in `String` sau formatarea unei date `LocalDate`).",
    codeSnippet: `class UserMapperTest {
    private final UserMapper mapper = Mappers.getMapper(UserMapper.class);

    @Test
    void candMapeazaEntitateInDto_campurileTrebuieSaFieCorecte() {
        User user = new User(1L, "Dan", "dan@test.ro", Rol.ADMIN);
        
        UserDto dto = mapper.toDto(user);
        
        assertThat(dto.id()).isEqualTo(1L);
        assertThat(dto.email()).isEqualTo("dan@test.ro");
        assertThat(dto.rol()).isEqualTo("ADMIN");
    }
}`,
    interviewTrap: "Nu mock-ui mapper-ul in propriul sau test! Mapper-ul este o clasa simpla si rapida de transformare care se testeaza unitar pe instanta sa reala.",
    keyTakeaway: "Testarea mapper-elor valideaza transformarile speciale de campuri, tipuri de date si comportamentul pe valori nule."
  },
  {
    id: "test-87",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Interceptoarelor Spring (HandlerInterceptor)",
    question: "Cum testezi un HandlerInterceptor personalizat (ex: masurarea timpului de executie a cererilor)?",
    answer: "Un `HandlerInterceptor` Spring intercepteaza cererile inainte si dupa ce ajung in Controller (`preHandle`, `postHandle`, `afterCompletion`):\n\nCum se testeaza unitar:\n1. Se instantiaza interceptorul: `ExecutionTimeInterceptor interceptor = new ExecutionTimeInterceptor();`.\n2. Se instantiaza `MockHttpServletRequest` si `MockHttpServletResponse`.\n3. Se apeleaza `preHandle(request, response, handler)` si se verifica ca returneaza `true` (permitand continuarea cererii).\n4. Se apeleaza `afterCompletion(...)` si se verifica daca s-a inregistrat metrica sau logul de timp calculat.",
    codeSnippet: `@Test
void preHandle_trebuieSaSalvezeTimestampInitial() throws Exception {
    ExecutionTimeInterceptor interceptor = new ExecutionTimeInterceptor();
    MockHttpServletRequest request = new MockHttpServletRequest();
    MockHttpServletResponse response = new MockHttpServletResponse();
    
    boolean continua = interceptor.preHandle(request, response, new Object());
    
    assertThat(continua).isTrue();
    assertThat(request.getAttribute("startTime")).isNotNull();
}`,
    interviewTrap: "Daca `preHandle` returneaza `false`, Spring opreste executia cererii si nu mai apeleaza controllerul! Testeaza intotdeauna scenariul de `false` cand vrei sa blochezi cereri neautorizate.",
    keyTakeaway: "`HandlerInterceptor` se testeaza unitar apeland direct `preHandle` si `postHandle` cu obiecte simulate MockHttpServletRequest/Response."
  },
  {
    id: "test-88",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea GraphQL cu GraphQlTester in Spring Boot",
    question: "Cum testezi interogarile si mutatiile GraphQL in Spring Boot fara client web extern?",
    answer: "Spring for GraphQL ofera instrumentul specializat `GraphQlTester` (si `@GraphQlTest`):\n\nCe permite:\n1. Trimiterea de documente de interogare GraphQL (Queries) sau mutatii (Mutations).\n2. Validarea structurii JSON returnate prin asertiuni fluente.\n3. Verificarea absentei erorilor in campul `errors`.\n4. Extragerea de entitati direct in obiecte Java folosind `.toEntity(Clasa.class)`.",
    codeSnippet: `@GraphQlTest(JobGraphQlController.class)
class JobGraphQlTest {
    @Autowired private GraphQlTester graphQlTester;
    @MockBean private JobService jobService;

    @Test
    void testQueryJobById() {
        when(jobService.getById(1L)).thenReturn(new JobDto("Java Dev"));
        
        String document = "query { jobById(id: 1) { title } }";
        
        graphQlTester.document(document)
            .execute()
            .path("jobById.title").entity(String.class).isEqualTo("Java Dev");
    }
}`,
    interviewTrap: "GraphQL returneaza intotdeauna HTTP 200, chiar si cand exista erori de executie (erorile sunt in array-ul `errors`). `GraphQlTester` verifica automat ca nu exista erori de schema.",
    keyTakeaway: "`GraphQlTester` testeaza interogarile si mutatiile GraphQL in memorie, verificand structura path-ului si absenta erorilor."
  },
  {
    id: "test-89",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Interfetelor Functionale si a Stream-urilor Java",
    question: "Cum testezi operatiunile complexe de transformare pe colectii (Streams: filter, map, flatMap, reduce)?",
    answer: "Stream-urile Java sunt functii pure de transformare a datelor, perfect adaptate pentru testare unitara rapida:\n\nStrategii de testare pe Stream-uri:\n1. Testeaza colectia goala (`emptyList()`): Asigura-te ca returneaza lista goala sau `Optional.empty()` fara sa arunce exceptii.\n2. Testeaza elemente care nu trec de `filter`: Garanteaza ca elementele irelevante sunt filtrate.\n3. Testeaza ordonarea (`sorted`): Verifica cu AssertJ `containsExactly(\"A\", \"B\", \"C\")` (care impune ordinea exacta).\n4. Testeaza deduplicarea (`distinct`).\n5. Testeaza reducerea (`reduce` / `collect` agregate).",
    codeSnippet: `@Test
void testFiltrareSiSortareSalariiMari() {
    List<Angajat> angajati = List.of(
        new Angajat("Ion", 3000),
        new Angajat("Ana", 7000),
        new Angajat("Dan", 6000)
    );
    
    List<String> topNume = service.extrageTopNumeCuSalariuPeste5000(angajati);
    
    // containsExactly verifica si continutul si ORDINEA exacta:
    assertThat(topNume).containsExactly("Ana", "Dan");
}`,
    interviewTrap: "`contains()` din AssertJ verifica prezenta elementelor in orice ordine! Daca ordinea de sortare este o cerinta de business, foloseste intotdeauna `containsExactly()`.",
    keyTakeaway: "Testarea Stream-urilor se bazeaza pe cazuri limita (colectie goala, elemente filtrate) si asertiuni stricte de ordine cu `containsExactly()`."
  },
  {
    id: "test-90",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Task-urilor Programate (@Scheduled)",
    question: "Cum testezi o metoda adnotata cu `@Scheduled(cron = \"0 0 2 * * ?\")` fara sa astepti ora 2 noaptea?",
    answer: "Nu asteptam niciodata trecerea reala a timpului din expresia CRON in teste!\n\nCele doua moduri de testare:\n1. Testarea Logicii de Business (Unit Test):\n   - Metoda adnotata cu `@Scheduled` este o simpla metoda Java publica/pachet!\n   - O apelezi direct in test ca pe orice alta metoda: `serviciuCuratare.stergeSesiuniExpirate()`.\n   - Validezi ca logica din interior functioneaza corect.\n\n2. Testarea Expresiei CRON (Validare Expresie):\n   - Daca vrei sa verifici ca expresia CRON este valida matematic si se declanseaza la momentul dorit:\n   - Folosesti clasa Spring `CronExpression` si testezi cand este urmatoarea data de executie programata.",
    codeSnippet: `// 1. Testare logica directa:
@Test
void testJobCuratare() {
    schedulerService.executaCuratareZilnica();
    verify(sesiuneRepo).stergeExpirateInainteDe(any());
}

// 2. Testare expresie cron:
@Test
void expresiaCronTrebuieSaRulezeLaMiezulNoptii() {
    CronExpression cron = CronExpression.parse("0 0 0 * * ?");
    LocalDateTime acum = LocalDateTime.of(2026, 10, 2, 14, 0);
    LocalDateTime urmatoarea = cron.next(acum);
    
    assertThat(urmatoarea).isEqualTo(LocalDateTime.of(2026, 10, 3, 0, 0));
}`,
    interviewTrap: "Nu lasa scheduler-ul sa ruleze in fundal in timpul altor teste de integrare! Poate modifica datele din baza in timp ce alt test ruleaza. Il poti dezactiva in teste cu `spring.task.scheduling.enabled=false`.",
    keyTakeaway: "Apeleaza metoda `@Scheduled` direct pentru a-i testa logica si foloseste `CronExpression` pentru a valida calendarul de rulare."
  },
  {
    id: "test-91",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Scurgerilor de Resurse (Memory Leak / Stream Closing)",
    question: "Cum testezi ca o metoda inchide corect fisierele si stream-urile I/O pentru a preveni blocarea descriptoriilor de fisier?",
    answer: "Resursele care implementeaza `AutoCloseable` (conexiuni, fisiere, socket-uri) trebuie sa apeleze `close()` chiar si in caz de exceptie:\n\nCum se testeaza cu Mockito:\n1. Se creeaza un mock pentru resursa: `InputStream is = mock(InputStream.class)`.\n2. Se injecteaza mock-ul in clasa testata.\n3. Se simuleaza o citire cu exceptie sau o citire normala.\n4. Se verifica: `verify(is, times(1)).close()`!\n5. Acest test garanteaza ca dezvoltatorul a folosit `try-with-resources`.",
    codeSnippet: `@Test
void chiarDacaParsareaEsueaza_streamulTrebuieSaFieInchis() throws IOException {
    InputStream mockStream = mock(InputStream.class);
    when(mockStream.read(any())).thenThrow(new IOException("Eroare disc"));
    
    assertThrows(CustomException.class, () -> parser.parseaza(mockStream));
    
    // Confirmam ca close() a fost apelat garantat:
    verify(mockStream).close();
}`,
    interviewTrap: "Daca metoda foloseste `try-finally` vechi in loc de `try-with-resources`, o exceptie aruncata in blocul finally poate masca exceptia originala.",
    keyTakeaway: "Verifica cu `verify(resource).close()` ca resursele I/O sunt eliberate intotdeauna, indiferent daca executia reuseste sau esueaza cu exceptie."
  },
  {
    id: "test-92",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Autentificarii cu Token JWT in MockMvc",
    question: "Cum testezi un endpoint REST securizat cu JWT folosind MockMvc si antetul Authorization Bearer?",
    answer: "Cand testezi un API protejat prin Bearer Token:\n\nDoua abordari comune in MockMvc:\n1. Trimiterea Antetului Real:\n   - Se genereaza un token de test semnat cu cheia secreta de test folosind un utilitar (ex: `jwtTestUtils.creeazaToken(\"user@test.ro\", List.of(\"ROLE_USER\"))`).\n   - Se trimite in cerere: `.header(\"Authorization\", \"Bearer \" + token)`.\n   - Valideaza atat filtrul JWT cat si securitatea Spring.\n\n2. Folosirea suportului Spring Security Test OAuth2:\n   - `.with(jwt().authorities(new SimpleGrantedAuthority(\"ROLE_USER\")))`.\n   - Injecteaza direct un token JWT valid in contextul de securitate fara generare manuala de siruri criptografice.",
    codeSnippet: `// Abordare nativa eleganta cu spring-security-test:
@Test
void candTokenulEsteValid_trebuieSaPermitaAccesul() throws Exception {
    mockMvc.perform(get("/api/profil")
            .with(jwt().jwt(builder -> builder.subject("dan_user"))))
        .andExpect(status().isOk());
}

@Test
void candLipsesteTokenul_trebuieSaIntoarca401() throws Exception {
    mockMvc.perform(get("/api/profil"))
        .andExpect(status().isUnauthorized()); // HTTP 401
}`,
    interviewTrap: "Daca tokenul este expirat (`exp` in trecut), filtrul JWT va arunca exceptie sau va refuza cererea. Asigura-te ca token-urile simulate au expirarea in viitor.",
    keyTakeaway: "Poti testa endpoint-urile securizate fie pasand antetul `Authorization: Bearer <token>`, fie folosind utilitarul `.with(jwt())` din Spring Security Test."
  },
  {
    id: "test-93",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea WebSocket-urilor in Spring Boot",
    question: "Cum testezi trimiterea si primirea de mesaje printr-o conexiune WebSocket / STOMP in testele de integrare?",
    answer: "Testarea comunicarii in timp real prin WebSockets:\n\nArhitectura testului:\n1. Pornesti `@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)`.\n2. Creezi un client real WebSocket: `StandardWebSocketClient` combinat cu `WebSocketStompClient`.\n3. Te conectezi la portul dinamic: `stompClient.connectAsync(\"ws://localhost:\" + port + \"/ws\", ...)`.\n4. Clientul de test se aboneaza la un topic (ex: `/topic/mesaje`).\n5. Se trimite un mesaj catre `/app/chat` si se foloseste un `CompletableFuture<MesajDto>` pentru a astepta si valida mesajul receptionat pe topic.",
    codeSnippet: `@Test
void testTrimitereMesajWebSocket() throws Exception {
    WebSocketStompClient stompClient = new WebSocketStompClient(new StandardWebSocketClient());
    stompClient.setMessageConverter(new MappingJackson2MessageConverter());
    
    StompSession session = stompClient.connectAsync("ws://localhost:" + port + "/chat-ws", new StompSessionHandlerAdapter() {}).get(1, SECONDS);
    
    CompletableFuture<MesajDto> completableFuture = new CompletableFuture<>();
    session.subscribe("/topic/chat", new TestFrameHandler(completableFuture));
    
    session.send("/app/trimite", new MesajDto("Salut!"));
    
    MesajDto primit = completableFuture.get(3, SECONDS);
    assertThat(primit.getText()).isEqualTo("Salut!");
}`,
    interviewTrap: "MockMvc NU suporta testarea conexiunilor WebSocket full-duplex! Testarea WebSocket necesita obligatoriu un server web real pornit pe un port aleator (`RANDOM_PORT`).",
    keyTakeaway: "Testarea WebSocket se realizeaza cu `@SpringBootTest(RANDOM_PORT)` si `WebSocketStompClient`, validand receptia mesajelor asincrone."
  },
  {
    id: "test-94",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Testarea Clientilor gRPC cu Canale in Memorie",
    question: "Cum testezi un client gRPC fara a porni un server de retea TCP extern?",
    answer: "gRPC ofera un utilitar nativ extraordinar pentru teste: `InProcessServerBuilder` si `InProcessChannelBuilder`:\n\nCum functioneaza:\n- In loc sa comunice prin socket-uri de retea TCP peste porturi reale, clientul si serverul gRPC comunica printr-o coada interna in memoria aceluiasi proces JVM (In-Process Transport)!\n- Beneficii:\n  1. Viteza fulgeratoare (fara handshake de retea sau alocare de porturi).\n  2. Fara coliziuni de porturi in mediul de CI/CD.\n  3. Testeaza 100% din logica de serializare Protobuf, interceptoarele gRPC si tratarea codurilor de status (ex: `Status.NOT_FOUND`).",
    codeSnippet: `String serverName = InProcessServerBuilder.generateName();

// Pornire server in-memory:
Server server = InProcessServerBuilder.forName(serverName)
    .directExecutor()
    .addService(new UserServiceGrpcImpl())
    .build().start();

// Conectare client la canalul in-memory:
ManagedChannel channel = InProcessChannelBuilder.forName(serverName)
    .directExecutor().build();
    
UserServiceBlockingStub stub = UserServiceGrpc.newBlockingStub(channel);
UserResponse resp = stub.getUser(UserRequest.newBuilder().setId(1).build());
assertThat(resp.getName()).isEqualTo("Ion");`,
    interviewTrap: "Nu uita sa opresti canalul si serverul (`channel.shutdownNow()`, `server.shutdownNow()`) la finalul testului pentru a elibera resursele.",
    keyTakeaway: "Canalele `InProcess` din gRPC permit testarea clientilor si serviciilor Protobuf direct in memoria JVM-ului la viteza maxima."
  },
  {
    id: "test-95",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Evenimentelor Interne de Aplicatie (Spring ApplicationEvent)",
    question: "Cum testezi ca o metoda a publicat un eveniment `ApplicationEvent` si ca ascultatorul (`@EventListener`) l-a primit?",
    answer: "In Spring Boot, publicarea de evenimente decuplate (`ApplicationEventPublisher.publishEvent()`) este un tipar comun:\n\nDoua moduri de testare:\n\n1. In Test Unitar (cu Mockito):\n   - Pui `@Mock private ApplicationEventPublisher publisher;` pe dependinta clasei.\n   - Apelezi metoda si verifici: `verify(publisher).publishEvent(any(ComandaPlasataEvent.class));`.\n\n2. In Test de Integrare (cu `@RecordApplicationEvents` - introdus in Spring Boot 2.7 / Spring 5.3+):\n   - Adaugi `@RecordApplicationEvents` pe clasa de test.\n   - Injectezi `@Autowired private ApplicationEvents events;`.\n   - Poti verifica asertiuni pe toate evenimentele emise in timpul testului: `assertThat(events.stream(ComandaPlasataEvent.class)).hasSize(1);`!",
    codeSnippet: `@SpringBootTest
@RecordApplicationEvents
class ComandaServiceEventsTest {
    @Autowired private ComandaService service;
    @Autowired private ApplicationEvents events; // Inregistreaza automat toate evenimentele!

    @Test
    void candComandaEsteFinalizata_trebuieSaPubliceEveniment() {
        service.finalizeazaComanda(101L);
        
        // Validare instantanee a evenimentelor emise:
        long count = events.stream(ComandaFinalizataEvent.class)
            .filter(e -> e.getComandaId().equals(101L))
            .count();
            
        assertThat(count).isEqualTo(1);
    }
}`,
    interviewTrap: "`@RecordApplicationEvents` este o bijuterie moderna in Spring; elimina complet nevoia de a mock-ui manual `ApplicationEventPublisher`.",
    keyTakeaway: "`@RecordApplicationEvents` si obiectul `ApplicationEvents` captureaza evenimentele publicate in testele de integrare pentru asertiuni curate."
  },
  {
    id: "test-96",
    category: "TESTING",
    difficulty: "MEDIU",
    title: "Mocking-ul Metodelor cu Callback in Mockito: doAnswer",
    question: "Cum folosesti `doAnswer()` in Mockito cand vrei sa executi o logica dinamica sau sa modifici argumentul primit?",
    answer: "Cand `thenReturn()` nu este suficient (deoarece vrei ca mock-ul sa returneze ceva calculat dinamic pe baza argumentului primit):\n\nCazuri cand folosesti `doAnswer()`:\n1. Cand simulezi un `repository.save(entitate)`: Vrei ca mock-ul sa ia entitatea primita, sa-i seteze un ID generat (ex: `entitate.setId(42L)`), si sa returneze aceeasi entitate inapoi!\n2. Cand metoda mockuita primeste un Callback sau un `Consumer<T>` ca parametru si vrei sa invoci callback-ul in interiorul testului.",
    codeSnippet: `@Test
void candSalveaza_trebuieSaSetezeIdSiSaReturnezeEntitatea() {
    when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
        User userPrimit = invocation.getArgument(0); // Primul argument
        userPrimit.setId(99L); // Simulam generarea ID-ului in DB
        return userPrimit;
    });
    
    User rezultat = userService.creeaza("Ion");
    assertThat(rezultat.getId()).isEqualTo(99L);
}`,
    interviewTrap: "Nu abuza de `thenAnswer()` scriind zeci de linii de logica in interiorul sau! Daca mock-ul tau are nevoie de algoritmi complicati, probabil ai nevoie de un `Fake` dedicat, nu de un Mock.",
    keyTakeaway: "`thenAnswer()` si `doAnswer()` ofera acces la argumentele de apel ale metodei, permitand calculul dinamic al valorii returnate."
  },
  {
    id: "test-97",
    category: "TESTING",
    difficulty: "USOR",
    title: "Testarea Codurilor HTTP 204 No Content vs 404 Not Found",
    question: "Cum testezi o operatiune de stergere `DELETE /api/items/{id}` pentru ambele cazuri: cand item-ul exista si cand nu exista?",
    answer: "Comportamentul standard RESTful pentru operatiunea de stergere:\n\n1. Cazul 1: Resursa exista si este stearsa cu succes:\n   - Serviciul apeleaza `repo.deleteById(id)`.\n   - Controllerul raspunde cu `HTTP 204 No Content` (fara corp de raspuns).\n   - Testul verifica: `.andExpect(status().isNoContent())`.\n\n2. Cazul 2: Resursa NU exista in baza de date:\n   - Serviciul arunca `EntityNotFoundException`.\n   - Controllerul (via `@ControllerAdvice`) raspunde cu `HTTP 404 Not Found`.\n   - Testul verifica: `.andExpect(status().isNotFound())`.",
    codeSnippet: `@Test
void candProdusulExista_stergereaIntoarce204() throws Exception {
    doNothing().when(produsService).sterge(1L);
    
    mockMvc.perform(delete("/api/produse/1"))
           .andExpect(status().isNoContent()); // 204
}

@Test
void candProdusulNuExista_stergereaIntoarce404() throws Exception {
    doThrow(new EntityNotFoundException("Produs negasit")).when(produsService).sterge(99L);
    
    mockMvc.perform(delete("/api/produse/99"))
           .andExpect(status().isNotFound()); // 404
}`,
    interviewTrap: "In unele API-uri, stergerea unui ID inexistent este tratata ca idempotenta si returneaza tot 204. La interviu, precizeaza ambele optiuni: aruncare 404 (informativ) vs 204 (idempotenta pura).",
    keyTakeaway: "Testarea operatiilor de DELETE valideaza atat succesul cu 204 No Content cat si tratarea ID-urilor inexistente cu 404 Not Found."
  },
  {
    id: "test-98",
    category: "TESTING",
    difficulty: "USOR",
    title: "Verificarea Headers si Content-Type in MockMvc",
    question: "Cum testezi ca un endpoint REST returneaza antetul corect de `Content-Type: application/json` si un antet custom?",
    answer: "Validarea antetelor HTTP in MockMvc folosind `header()`:\n\nCe poti verifica:\n1. `header().string(nume, valoare)`: Valideaza valoarea exacta a unui antet.\n2. `header().exists(nume)`: Valideaza doar ca antetul este prezent (ex: `Location` dupa un `201 Created`).\n3. `content().contentType(MediaType.APPLICATION_JSON)`: Valideaza ca raspunsul este un JSON conform.",
    codeSnippet: `@Test
void candCreeazaResursa_trebuieSaReturnezeLocationSiContentTypeJson() throws Exception {
    mockMvc.perform(post("/api/articole")
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\\"titlu\\":\\"Test\\"}"))
        .andExpect(status().isCreated())
        .andExpect(content().contentType(MediaType.APPLICATION_JSON))
        .andExpect(header().string("Location", "http://localhost/api/articole/42"))
        .andExpect(header().exists("X-Request-Id"));
}`,
    interviewTrap: "Daca folosesti `contentTypeCompatibleWith(MediaType.APPLICATION_JSON)`, testul va trece chiar daca serverul adauga charset (`application/json;charset=UTF-8`).",
    keyTakeaway: "`header().string()` si `content().contentType()` asigura ca specificatiile de protocol HTTP ale API-ului sunt respectate cu strictete."
  },
  {
    id: "test-99",
    category: "TESTING",
    difficulty: "USOR",
    title: "Checklist de Interviu: Cum Explici Strategia Ta de Testare",
    question: "Care este structura ideala de raspuns cand esti intrebat la un interviu tehnic: \"Cum abordezi testarea intr-un proiect nou?\"",
    answer: "Structura ideala in 4 puncte (demonstreaza gandire de inginer matur):\n\n1. Fundatia pe Teste Unitare Rapide (Piramida Testarii):\n   - \"Incep prin a acoperi logica pura de business cu teste unitare folosind JUnit 5 si Mockito. Ma asigur ca ruleaza in milisecunde si ca respecta principiul F.I.R.S.T.\"\n\n2. Validarea Integrarii cu Tehnologii Reale:\n   - \"Pentru stratul de persistenta si repository-uri, folosesc `@DataJpaTest` si Testcontainers cu imaginea reala de PostgreSQL din productie, evitand capcanele lui H2.\"\n\n3. Testarea API-ului la Nivel Web:\n   - \"Folosesc `@WebMvcTest` si MockMvc pentru a valida rutarea, autorizarea cu Spring Security, validarile `@Valid` si raspunsurile ProblemDetails.\"\n\n4. Automatizarea in Pipeline-ul CI/CD:\n   - \"Integram testele in GitHub Actions la fiecare Pull Request cu praguri de calitate (JaCoCo branch coverage si mutation testing cu Pitest), blocand orice build cu teste picate.\"",
    codeSnippet: `// Reteta succesului prezentata la interviu:
// 1. Unit Tests (JUnit 5 + Mockito + AssertJ)
// 2. Integration Tests (Spring Boot + Testcontainers PostgreSQL)
// 3. Web Slice Tests (MockMvc + Spring Security Test)
// 4. CI/CD Gate (GitHub Actions)`,
    interviewTrap: "Nu raspunde niciodata simplu: \"Scriu teste cand am timp\". Testarea trebuie prezentata ca o parte integranta a procesului de dezvoltare, nu ca o activitate secundara optionala.",
    keyTakeaway: "Prezinta testarea structurat: teste unitare rapide la baza, Testcontainers pentru baze reale, MockMvc pentru API-uri si poarta de calitate in CI/CD."
  },
  {
    id: "test-100",
    category: "TESTING",
    difficulty: "USOR",
    title: "Top 5 Capcane la Interviul de Testare pentru Junior / Mid",
    question: "Care sunt cele mai frecvente 5 intrebari capcana despre testare la interviurile de Java / Spring Boot?",
    answer: "Top 5 capcane clasice de interviu:\n\n1. `@Mock` vs `@MockBean`:\n   - Capcana: Candidatii spun ca sunt acelasi lucru. Corect: `@Mock` e Mockito pur (fara Spring); `@MockBean` inlocuieste un bean in ApplicationContext-ul Spring.\n\n2. De ce pica `when(spy.metoda()).thenReturn()`:\n   - Capcana: Executa metoda reala din greseala! Pe spioni se foloseste obligatoriu `doReturn().when(spy)`.\n\n3. De ce `@Transactional` pe teste ascunde bug-uri:\n   - Capcana: Tine sesiunea deschisa si ascunde `LazyInitializationException`.\n\n4. H2 vs Testcontainers:\n   - Capcana: Sa spui ca H2 e perfect pentru orice test. Corect: H2 are dialect diferit de PostgreSQL si ascunde bug-uri de sintaxa.\n\n5. 100% Code Coverage:\n   - Capcana: Sa spui ca 100% inseamna zero bug-uri. Corect: Acoperirea pe linii nu garanteaza ca asertiunile sunt corecte sau ca toate ramurile de decizie au fost testate.",
    codeSnippet: `// Cele 5 reguli de aur de retinut:
// 1. @Mock = unitar, @MockBean = Spring context
// 2. doReturn() pentru @Spy
// 3. Atentie la @Transactional in teste de integrare
// 4. Testcontainers bate H2
// 5. Calitatea asertiunilor bate procentul de coverage`,
    interviewTrap: "Daca stapanesti aceste 5 diferente subtile si le argumentezi cu incredere, treci garantat de orice runda tehnica de testare pentru pozitii de Junior si Mid!",
    keyTakeaway: "Retine distinctiile: Mock vs MockBean, doReturn pe spioni, capcana tranzactiilor pe teste, superioritatea Testcontainers si limitele acoperirii de cod."
  }
];
