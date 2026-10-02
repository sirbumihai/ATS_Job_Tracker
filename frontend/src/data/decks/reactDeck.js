// Deck Masiv: React 18/19, Virtual DOM, Hooks, Next.js & Frontend Performance (Junior & Mid-Level)
// Preluat din: sudheerj/reactjs-interview-questions, React Official Docs, Frontend Interview Handbook
// 100 de carduri realiste de interviu (JSX, Virtual DOM, Hooks, Context, Router v6, TanStack Query, Redux/Zustand, TS)
// FARA intrebari de Senior / Arhitect (Zero Custom Fiber reconcilers, Zero AST Compiler Plugins)
// Dificultati: USOR si MEDIU (Zero DIFICIL)
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const REACT_DECK = [
  {
    id: "react-01",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Cum functioneaza Virtual DOM si algoritmul de Reconciliation?",
    question: "Ce este Virtual DOM in React, cum functioneaza algoritmul Diffing / Reconciliation si de ce accesul direct la Real DOM este lent in browsere?",
    answer: "Real DOM este un arbore complex de noduri gestionat de browser. Orice modificare directa declanseaza etape costisitoare de \"Reflow\" (recalcularea geometriei elementelor) si \"Repaint\" (redesenarea pixelilor pe ecran).\n\nVirtual DOM este o reprezentare usoara (obiect JavaScript simplu) a arborelui DOM pastrata in memoria aplicatiei.\n\nFluxul Reconciliation:\n1. La fiecare schimbare de stare (setState), React creeaza un nou arbore Virtual DOM.\n2. Compara noul arbore cu cel anterior folosind un algoritm euristic de \"Diffing\" cu complexitate O(N).\n3. Calculeaza diferenta minima (batch de mutatii).\n4. Aplica doar aceste mutatii minime pe Real DOM intr-o singura operatie de sincronizare (Commit Phase).",
    codeSnippet: `// Obiect Virtual DOM simplificat in memorie:
const vdomNode = {
  type: 'button',
  props: {
    className: 'btn-primary',
    onClick: () => handleApply(),
    children: 'Aplica Acum'
  }
};`,
    interviewTrap: "Daca schimbi tipul tag-ului radacina (de exemplu de la <div> la <section>), React distruge complet intregul subarbore vechi si il reconstruieste de la zero, pierzand starea interna a tuturor copiilor!",
    keyTakeaway: "Virtual DOM grupeaza si minimizeaza modificarile pe Real DOM pentru a evita reflow-urile si repaint-urile costisitoare ale browserului."
  },
  {
    id: "react-02",
    category: "REACT",
    difficulty: "USOR",
    title: "De ce este cheia \"key\" obligatorie in liste si de ce indexul este o alegere proasta?",
    question: "De ce cere React o proprietate unica \"key\" atunci cand randezi o lista de elemente si de ce folosirea indexului din map((item, index)) este un anti-pattern?",
    answer: "React foloseste proprietatea \"key\" pentru a identifica unic elementele dintr-o lista in timpul procesului de Reconciliation (Diffing), determinand exact care element a fost adaugat, sters sau reordonat.\n\nDe ce indexul este periculos:\nDaca folosesti indexul numeric (0, 1, 2) si inserezi un element la inceputul listei sau stergi un rand intermediar:\n- Toti indicii elementelor urmatoare se decaleaza (elementul de pe index 0 devine index 1).\n- React crede eronat ca toate elementele s-au modificat si le re-randeaza pe toate.\n- Daca elementele contin input-uri cu stare necontrolata (un camp text sau checkbox bifat), starea ramane asociata cu vechiul index, ducand la bug-uri vizuale grave unde textul introdus sare pe alt rand!",
    codeSnippet: `// GRESIT (duce la bug-uri de stare la reordonare/stergere):
{jobs.map((job, index) => <JobCard key={index} job={job} />)}

// CORECT (Foloseste un identificator stabil si unic din baza de date):
{jobs.map(job => <JobCard key={job.id} job={job} />)}`,
    interviewTrap: "Singurul scenariu acceptabil pentru cheie bazata pe index este cand lista este complet statica (nu este niciodata filtrata, sortata, adaugata sau stearsa).",
    keyTakeaway: "Foloseste intotdeauna un ID unic si stabil (ex: UUID sau database ID) ca proprietate key in liste."
  },
  {
    id: "react-03",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useMemo vs useCallback: Cand aduc un castig real de performanta?",
    question: "Care este diferenta dintre hook-urile useMemo si useCallback? Cand este contraindicat sa le folosesti din cauza overhead-ului de memorie?",
    answer: "1. useMemo: Memoreaza REZULTATUL calculat al unei functii costisitoare. Ruleaza functia doar cand una din dependinte s-a schimbat.\n2. useCallback: Memoreaza REFERINTA functiei in sine intre re-randari. Previne crearea unei noi instante a functiei la fiecare render.\n\nCand aduc castig real:\n- Cand trimiti functia ca prop catre o componenta copil optimizata cu React.memo (astfel incat copilul sa nu se re-randeze inutil).\n- Cand functia sau obiectul memorat este trecut in array-ul de dependinte al unui useEffect.\n\nCand NU le folosim: Pentru operatiuni simple (adunari, filtrari pe liste mici). Fiecare hook are un cost intern de alocare de memorie si verificare de dependinte; folosirea lor excesiva face aplicatia mai lenta!",
    codeSnippet: `// 1. useMemo: retine rezultatul filtrarii costisitoare
const filteredJobs = useMemo(() => {
  return expensiveFilterAlgorithm(jobs, filterCriteria);
}, [jobs, filterCriteria]);

// 2. useCallback: retine referinta functiei handler pentru un copil memorat
const handleSelectJob = useCallback((jobId) => {
  setSelectedId(jobId);
}, []); // Fara dependinte, referinta este stabila pentru toata viata componentei`,
    interviewTrap: "Daca pui useCallback pe o functie trimisa unui element nativ HTML (ex: <button onClick={fn}>), este inutil! Butoanele HTML native nu beneficiaza de stabilitatea referintei functiei.",
    keyTakeaway: "useMemo retine o valoare calculata, useCallback retine o functie; foloseste-le doar cand previi re-randarea unor componente optimizate cu React.memo."
  },
  {
    id: "react-04",
    category: "REACT",
    difficulty: "USOR",
    title: "useState: Functional Updates vs Valoare Directa",
    question: "Care este diferenta dintre setCount(count + 1) si setCount(prev => prev + 1)? De ce prima varianta poate duce la pierderi de actualizari?",
    answer: "In React, operatia de actualizare a starii prin setter-ul de la useState este asincrona si poate fi grupata in loturi (batched).\n\n1. setCount(count + 1): Foloseste valoarea din closure-ul randarii curente. Daca apelezi setCount(count + 1) de 3 ori consecutiv in acelasi handler, valoarea lui count ramane neschimbata in acel context, deci toate cele 3 apeluri vor calcula aceeasi valoare (ex: 0 + 1 = 1) in loc de 3!\n\n2. setCount(prev => prev + 1): Foloseste un \"functional update\". React garanteaza ca parametrul \"prev\" este cea mai recenta valoare a starii din coada de actualizari, permitand executia corecta a operatiilor multiple consecutive.",
    codeSnippet: `// GRESIT: count creste doar cu 1 desi s-au facut 3 apeluri
function incrementWrong() {
  setCount(count + 1);
  setCount(count + 1);
  setCount(count + 1);
}

// CORECT: count creste garantat cu 3
function incrementCorrect() {
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
  setCount(prev => prev + 1);
}`,
    interviewTrap: "Foloseste intotdeauna forma functionala (prev => ...) atunci cand noua stare depinde de starea anterioara, mai ales in timere (setInterval) sau callback-uri asincrone.",
    keyTakeaway: "Functional updates garanteaza accesul la cea mai recenta stare si evita capcanele valorilor invechite (stale state) din closure."
  },
  {
    id: "react-05",
    category: "REACT",
    difficulty: "USOR",
    title: "useEffect: Comportamentul celor trei tipuri de Dependency Array",
    question: "Cum se comporta un useEffect cand: (1) nu are array de dependinte, (2) are un array gol [], si (3) are dependinte specifice [a, b]?",
    answer: "Comportamentul useEffect depinde critic de al doilea argument:\n\n1. Fara al doilea argument (useEffect(fn)):\nEfectul ruleaza la fiecare randare a componentei (dupa mount si dupa fiecare re-render cauzat de props sau state).\n\n2. Cu array gol (useEffect(fn, [])):\nEfectul ruleaza o singura data, dupa prima randare (echivalent conceptual cu componentDidMount din clase).\n\n3. Cu array de dependinte (useEffect(fn, [a, b])):\nEfectul ruleaza dupa mount si apoi doar cand cel putin una din dependinte s-a schimbat prin comparatie stricta (Object.is).",
    codeSnippet: `// 1. Ruleaza la fiecare render:
useEffect(() => {
  console.log('Componenta s-a randat');
});

// 2. Ruleaza o singura data la mount:
useEffect(() => {
  console.log('Componenta a fost montata');
}, []);

// 3. Ruleaza cand query se schimba:
useEffect(() => {
  fetchSearchResults(query);
}, [query]);`,
    interviewTrap: "Daca modifici o stare in interiorul unui useEffect fara array de dependinte, vei crea o bucla infinita de randari (render -> effect -> setState -> render -> effect...).",
    keyTakeaway: "Array-ul gol ruleaza o data la mount, dependintele filtreaza rularile la modificari reale, iar lipsa array-ului ruleaza la absolut fiecare render."
  },
  {
    id: "react-06",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Functia de Cleanup in useEffect: Cand si de ce se apeleaza?",
    question: "Ce este functia returnata din useEffect (Cleanup function)? Cand o apeleaza React si pentru ce tipuri de resurse este obligatorie?",
    answer: "Functia returnata din callback-ul useEffect este o functie de curatare (cleanup).\n\nCand se executa:\n1. Inainte ca efectul sa fie re-executat cu noile dependinte (pentru a curata starea lasata de rularea precedenta).\n2. Cand componenta este demontata (unmounted) din ecran.\n\nCand este obligatorie:\n- Anularea abonamentelor la evenimente (window.removeEventListener).\n- Oprirea timerelor (clearInterval, clearTimeout).\n- Deconectarea socket-urilor WebSockets sau observatorilor (IntersectionObserver).\n- Anularea cererilor HTTP in zbor (AbortController.abort()) pentru a preveni memory leaks si race conditions.",
    codeSnippet: `useEffect(() => {
  const handleResize = () => setWindowWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);

  // Functie de cleanup obligatorie
  return () => {
    window.removeEventListener('resize', handleResize);
  };
}, []); // Se ataseaza la mount si se sterge la unmount`,
    interviewTrap: "In React 18 in modul de dezvoltare (<React.StrictMode>), efectele ruleaza de doua ori la mount (mount -> cleanup -> mount) pentru a ajuta dezvoltatorii sa descopere cleanup-uri lipsa!",
    keyTakeaway: "Orice resursa externa creata intr-un useEffect (listener, interval, socket) trebuie eliberata in functia de return a efectului."
  },
  {
    id: "react-07",
    category: "REACT",
    difficulty: "USOR",
    title: "useRef vs useState: Diferente si scenarii de utilizare",
    question: "Care este diferenta principala intre useRef si useState? Cand alegem useRef pentru a pastra o valoare?",
    answer: "Diferenta esentiala consta in declansarea re-randarii:\n\n1. useState:\n- Modificarea starii prin setter declanseaza o noua randare a componentei.\n- Folosit pentru date care afecteaza direct ceea ce vede utilizatorul pe ecran (UI).\n\n2. useRef:\n- Returneaza un obiect mutabil { current: initialValue } a carui proprietate .current poate fi modificata direct.\n- Modificarea lui ref.current NU declanseaza nicio re-randare.\n- Valoarea persista intre randari pe toata durata de viata a componentei.\n\nScenarii ideale pentru useRef:\n- Retinerea ID-urilor de timere (setInterval / setTimeout) pentru a le putea opri.\n- Retinerea valorii anterioare a unei proprietati (previous value tracking).\n- Flag-uri de executie (ex: hasLoaded, isMounted).\n- Referinte directe la elemente din DOM.",
    codeSnippet: `function Timer() {
  const [seconds, setSeconds] = useState(0);
  const timerIdRef = useRef(null); // Nu declanseaza re-render la scriere

  const startTimer = () => {
    if (timerIdRef.current !== null) return;
    timerIdRef.current = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerIdRef.current);
    timerIdRef.current = null;
  };
  // ...
}`,
    interviewTrap: "Nu scrie si nu citi din ref.current in timpul randarii (in corpul functiei inainte de return). Mutatiile pe ref trebuie facute in useEffect sau in event handlers.",
    keyTakeaway: "Foloseste useState cand vrei ca modificarea sa actualizeze interfata; foloseste useRef cand vrei sa stochezi o variabila interna fara a declansa un nou render."
  },
  {
    id: "react-08",
    category: "REACT",
    difficulty: "USOR",
    title: "useRef pentru accesul direct la elementele DOM",
    question: "Cum folosesti useRef pentru a interactiona direct cu un element HTML din DOM (ex: focus pe un input sau scroll)?",
    answer: "Desi React incurajeaza abordarea declarativa, exista situatii legitime unde avem nevoie de acces imperativ la nodul DOM real:\n1. Setarea focusului pe un camp input (la deschiderea unei ferestre modale sau dupa submit).\n2. Masurarea dimensiunilor si pozitiei unui element (getBoundingClientRect).\n3. Scroll programatic (element.scrollIntoView()).\n4. Integrarea unor biblioteci terte non-React (play/pause pe video HTML5, harti Leaflet, grafice Chart.js D3).\n\nPasii de utilizare:\n1. Creezi referinta: const inputRef = useRef(null);\n2. O atasezi elementului JSX: <input ref={inputRef} />;\n3. Dupa montare (in useEffect sau handler), nodul DOM este disponibil la inputRef.current.",
    codeSnippet: `function SearchInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    // Pune focus pe input imediat ce componenta apare pe ecran
    inputRef.current?.focus();
  }, []);

  return <input ref={inputRef} type="text" placeholder="Cauta joburi..." />;
}`,
    interviewTrap: "La prima randare, inputRef.current este null! Nu incerca sa apelezi metode pe el in corpul principal al functiei, ci doar in useEffect sau dupa un eveniment.",
    keyTakeaway: "useRef iti ofera acces direct la nodul DOM real fara a folosi document.getElementById sau document.querySelector."
  },
  {
    id: "react-09",
    category: "REACT",
    difficulty: "USOR",
    title: "Componente Controlate vs Necontrolate in formulare",
    question: "Care este diferenta dintre un Controlled Component si un Uncontrolled Component in formularele React?",
    answer: "1. Controlled Component (Controlat):\n- Starea formularului este gestionata exclusiv de React prin useState.\n- Elementul HTML primeste valoarea din state prin prop-ul \"value\" si o actualizeaza la fiecare tasta prin \"onChange\".\n- React este singura \"sursa a adevarului\" (Single Source of Truth).\n- Permite validare instantanee, formatare text in timp real si dezactivarea dinamica a butonului de submit.\n\n2. Uncontrolled Component (Necontrolat):\n- Starea campului este pastrata direct in DOM de catre browser.\n- Valoarea este citita doar la nevoie (ex: la submit-ul formularului) folosind un \"ref\".\n- Poate primi o valoare initiala prin \"defaultValue\" in loc de \"value\".\n- Mai putin cod si re-randari mai putine pentru formulare simple sau fisiere (<input type=\"file\" /> este mereu necontrolat).",
    codeSnippet: `// 1. CONTROLLED (React controleaza fiecare caracter)
function ControlledInput() {
  const [val, setVal] = useState('');
  return <input value={val} onChange={e => setVal(e.target.value)} />;
}

// 2. UNCONTROLLED (DOM retine starea, React citeste la submit)
function UncontrolledInput() {
  const inputRef = useRef(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Valoare introdusa:', inputRef.current.value);
  };
  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="Initial" />
      <button type="submit">Trimite</button>
    </form>
  );
}`,
    interviewTrap: "Daca pasezi value={undefined} sau o variabila nedefinita initial si ulterior ii dai un string, React va arunca un avertisment in consola: \"component is changing an uncontrolled input to be controlled\".",
    keyTakeaway: "Componentele controlate folosesc value + onChange sincronizate in state; cele necontrolate folosesc defaultValue + ref pentru a citi starea din DOM la cerere."
  },
  {
    id: "react-10",
    category: "REACT",
    difficulty: "USOR",
    title: "Props vs State: Diferente fundamentale si fluxul unidirectional",
    question: "Care sunt diferentele principale intre Props si State in React si ce inseamna Unidirectional Data Flow?",
    answer: "1. Props (Proprietati):\n- Sunt date transmise de o componenta parinte catre o componenta copil (asemanatoare parametrilor unei functii).\n- Sunt strict READ-ONLY (imutabile) din perspectiva copilului. Un copil nu trebuie niciodata sa isi modifice propriile props!\n\n2. State (Stare):\n- Sunt date interne gestionate si detinute de componenta in sine (asemanatoare variabilelor locale dintr-o functie).\n- Sunt mutabile (prin functia de setState corespunzatoare) si persista intre randari.\n- Modificarea starii determina re-randarea componentei si a copiilor sai.\n\nUnidirectional Data Flow (Flux unidirectional):\nIn React, datele curg intotdeauna de sus in jos (de la parinti catre copii) prin intermediul props. Copiii pot comunica modificari catre parinte doar prin apelarea unor functii callback transmise tot ca props.",
    codeSnippet: `function Parent() {
  const [activeTab, setActiveTab] = useState('ALL'); // State intern parinte

  return (
    // activeTab si onSelect curg de sus in jos ca props
    <NavigationTabs currentTab={activeTab} onSelectTab={setActiveTab} />
  );
}

function NavigationTabs({ currentTab, onSelectTab }) {
  // currentTab este citit, nu poate fi modificat direct de NavigationTabs
  return <button onClick={() => onSelectTab('SAVED')}>{currentTab}</button>;
}`,
    interviewTrap: "Nu copia niciodata o proprietate din props direct in state fara un motiv intemeiat (ex: const [user, setUser] = useState(props.user)), altfel starea locala nu se va actualiza cand props.user se schimba in parinte!",
    keyTakeaway: "Props vin de la parinte si sunt read-only; State-ul este detinut intern si cand se schimba, declanseaza re-render."
  },
  {
    id: "react-11",
    category: "REACT",
    difficulty: "USOR",
    title: "De ce este starea imutabila in React si cum actualizam corect array-uri si obiecte?",
    question: "De ce este interzisa mutarea directa a starii in React (ex: state.push(item) sau state.name = \"Nou\") si cum se actualizeaza corect obiectele si listele?",
    answer: "In React, starea trebuie tratata ca fiind strict IMUTABILA.\n\nDe ce:\n1. Algoritmul de Reconciliation compara starea anterioara cu cea noua prin comparatie superficiala de referinta (Object.is / shallow comparison).\n2. Daca modifici direct proprietatile unui obiect existent (state.name = \"Ion\"), referinta din memorie ramane aceeasi. React crede ca nimic nu s-a schimbat si NU declanseaza re-randarea interfetei!\n3. Imutabilitatea permite functii de \"undo/redo\", diagnosticare in Time-Travel Debugging si optimizeaza React.memo.\n\nActualizare corecta:\nCreeaza intotdeauna o COPIE noua a obiectului sau array-ului folosind spread operator (...), map, filter sau concat.",
    codeSnippet: `// GRESIT (modifica array-ul original, UI nu se actualizeaza!):
todos.push(newTodo);
setTodos(todos);

// CORECT (creeaza o referinta noua):
setTodos([...todos, newTodo]);

// CORECT pentru obiecte:
setUser(prev => ({
  ...prev,
  role: 'ADMIN' // suprascrie doar proprietatea dorita
}));

// CORECT pentru stergere element:
setTodos(todos.filter(t => t.id !== idToRemove));`,
    interviewTrap: "Spread operator (...) face shallow copy (copie la primul nivel). Pentru obiecte adanc imbricate (deep nested), proprietatile interioare isi pastreaza referintele vechi daca nu sunt copiate explicit.",
    keyTakeaway: "Nu modifica niciodata starea direct in memorie; creeaza intotdeauna un obiect sau array nou prin spread operator sau metode imutabile (filter, map)."
  },
  {
    id: "react-12",
    category: "REACT",
    difficulty: "USOR",
    title: "Lifting State Up: Cand si cum ridicam starea in parinte?",
    question: "Ce inseamna \"Lifting State Up\" in React si in ce scenarii practice este necesar?",
    answer: "\"Lifting State Up\" (Ridicarea starii) este un pattern fundamental in React prin care starea este mutata din doua sau mai multe componente copil in cel mai apropiat stramos comun al lor.\n\nCand este necesar:\nAtunci cand doua componente surori au nevoie sa fie sincronizate si sa partajeze aceleasi date, sau cand o actiune dintr-un copil trebuie sa modifice afisarea din celalalt copil.\n\nCum functioneaza:\n1. Identifici parintele comun cel mai apropiat.\n2. Declari starea (useState) in acel parinte.\n3. Trimiti valoarea starii catre copilul care are nevoie sa o afiseze ca prop.\n4. Trimiti o functie de actualizare (setter/callback) catre copilul care declanseaza modificarea.",
    codeSnippet: `function JobSearchDashboard() {
  // Starea a fost ridicata in parintele comun
  const [filterQuery, setFilterQuery] = useState('');

  return (
    <>
      <SearchBar query={filterQuery} onQueryChange={setFilterQuery} />
      <JobList query={filterQuery} />
    </>
  );
}`,
    interviewTrap: "Nu ridica starea mai sus decat este strict necesar. Daca o ridici la nivelul cel mai de sus (ex: App root), o modificare marunta va re-randa intregul arbore de componente.",
    keyTakeaway: "Ridicarea starii in cel mai apropiat parinte comun asigura o singura sursa a adevarului pentru componentele dependente intre ele."
  },
  {
    id: "react-13",
    category: "REACT",
    difficulty: "USOR",
    title: "Ce este \"Props Drilling\" si cum se poate evita?",
    question: "Ce este fenomenul de \"Props Drilling\", de ce este considerat problematic si care sunt solutiile pentru a-l evita?",
    answer: "Props Drilling reprezinta situatia in care esti nevoit sa transmiti date prin proprietati (props) prin multiple niveluri intermediare de componente copil care nu au nevoie de acele date si doar le paseaza mai departe.\n\nDe ce este o problema:\n- Face codul greu de intretinut si fragil la refactorizari.\n- Daca se schimba numele sau formatul unui prop, trebuie modificate zeci de fisiere intermediare.\n- Polueaza interfata componentelor intermediare cu date irelevante pentru ele.\n\nSolutii pentru a-l evita:\n1. Component Composition (Inversiunea componentelor): Pasezi direct copiii ca JSX prin props.children sau slot-uri, astfel componentele intermediare nici macar nu trebuie sa stie de date.\n2. React Context API: Permite injectarea valorilor direct la nivelul descendentilor interesati.\n3. Biblioteci de State Management: Zustand, Redux Toolkit, Jotai.",
    codeSnippet: `// Solutia 1: Component Composition (fara Context sau Redux)
function App() {
  const user = { name: 'Mihai' };
  return (
    <Layout>
      {/* Profilul este creat direct aici si injectat prin children */}
      <UserProfile user={user} />
    </Layout>
  );
}

function Layout({ children }) {
  return <div className="layout">{children}</div>; // Nu stie si nu paseaza "user"
}`,
    interviewTrap: "Nu sari direct la solutii complexe precum Redux sau Context doar pentru 1-2 niveluri de props. Compozitia prin \"children\" este adesea cea mai simpla si performanta solutie.",
    keyTakeaway: "Props drilling inseamna pasarea de props prin noduri intermediare neutre; se rezolva prin compozitie de componente sau Context API."
  },
  {
    id: "react-14",
    category: "REACT",
    difficulty: "USOR",
    title: "Randare Conditionala: Operatorul Ternar vs Operatorul && si capcana cu 0",
    question: "Cum se face randarea conditionala in React si care este capcana clasica la utilizarea operatorului logic && cu lungimea unui array (items.length && <List />)?",
    answer: "Modalitati comune de randare conditionala:\n1. If/else clasic inainte de return.\n2. Operatorul ternar: condition ? <ComponentA /> : <ComponentB />.\n3. Operatorul logic && (Short-circuit): condition && <Component />.\n\nCapcana clasica cu &&:\nIn JavaScript, expresia \"0 && <List />\" nu se evalueaza la false, ci se opreste si returneaza numarul 0!\nReact randeaza numerele direct pe ecran. Prin urmare, daca scrii:\n{jobs.length && <JobList />}\nIar jobs este gol (length = 0), utilizatorul va vedea cifra \"0\" imprimata urat in interfata web in loc de un spatiu gol!",
    codeSnippet: `// GRESIT: Daca lista e goala, randeaza cifra "0" pe ecran!
{jobs.length && <JobList items={jobs} />}

// CORECT Varianta 1 (conversie la boolean pur):
{jobs.length > 0 && <JobList items={jobs} />}

// CORECT Varianta 2 (conversie cu dubla negatie):
{!!jobs.length && <JobList items={jobs} />}

// CORECT Varianta 3 (operator ternar):
{jobs.length > 0 ? <JobList items={jobs} /> : <EmptyState />}`,
    interviewTrap: "Aceeasi capcana apare cu string-ul gol (\"\" && <Text />) sau cu variabile nedefinite. Asigura-te intotdeauna ca partea stanga a operatorului && este un boolean strict (true sau false).",
    keyTakeaway: "Foloseste intotdeauna comparatii explicite (length > 0) cand folosesti operatorul && pentru a evita randarea cifrei 0."
  },
  {
    id: "react-15",
    category: "REACT",
    difficulty: "USOR",
    title: "React.Fragment: De ce este util si cand avem nevoie de sintaxa lunga?",
    question: "De ce folosim React.Fragment (<>...</>) in loc de un tag <div> si in ce scenariu este obligatorie sintaxa explicita <React.Fragment>?",
    answer: "In React, o componenta trebuie sa returneze intotdeauna un singur element radacina (single root element).\n\nDe ce folosim Fragment in loc de <div>:\n1. Nu polueaza arborele DOM real cu div-uri redundante (div soup).\n2. Previne distrugerea layout-urilor CSS precum CSS Grid sau Flexbox, unde copiii directi trebuie sa fie elementele din lista, nu un wrapper div intermediar.\n3. Salveaza memorie si imbunatateste viteza de randare in browser.\n\nCand este obligatorie sintaxa explicita <React.Fragment>:\nSintaxa scurta (<>...</>) NU suporta atribute! Daca randezi o lista si ai nevoie sa atasezi proprietatea \"key\", esti obligat sa folosesti tag-ul explicit <React.Fragment key={item.id}>.",
    codeSnippet: `// 1. Sintaxa scurta (cand nu este nevoie de key):
function Header() {
  return (
    <>
      <h1>Titlu</h1>
      <p>Descriere</p>
    </>
  );
}

// 2. Sintaxa explicita (obligatorie cand mapam o lista si avem nevoie de key):
function TermList({ terms }) {
  return (
    <dl>
      {terms.map(t => (
        <React.Fragment key={t.id}>
          <dt>{t.term}</dt>
          <dd>{t.definition}</dd>
        </React.Fragment>
      ))}
    </dl>
  );
}`,
    interviewTrap: "Sintaxa scurta nu suporta niciun fel de proprietate (nici key, nici className, nici id). Singura proprietate acceptata de <React.Fragment> este \"key\".",
    keyTakeaway: "Fragment grupeaza elemente multiple fara a introduce noduri suplimentare in DOM; foloseste sintaxa explicita cand ai nevoie de cheia \"key\"."
  },
  {
    id: "react-16",
    category: "REACT",
    difficulty: "USOR",
    title: "Componente Functionale vs Componente Bazate pe Clase",
    question: "Care sunt diferentele principale intre componentele functionale si cele pe clase si de ce industria a trecut masiv la functii si hook-uri?",
    answer: "1. Componente pe Clase (Legacy):\n- Extind React.Component si necesita o metoda render().\n- Folosesc \"this\" pentru a accesa props si state (cauza frecventa de bug-uri legate de binding).\n- Logica de lifecycle era fragmentata: codul de setup si cleanup era impartit fortat intre componentDidMount, componentDidUpdate si componentWillUnmount.\n\n2. Componente Functionale (Standardul Modern):\n- Sunt simple functii JavaScript care primesc props ca argument si returneaza JSX.\n- Folosesc Hook-uri (useState, useEffect) pentru a gestiona starea si efectele secundare.\n\nDe ce au castigat functiile:\n- Reutilizare mult mai facila a logicii prin Custom Hooks (fara HOC-uri complicate sau Render Props).\n- Nu exista confuzia cuvantului cheie \"this\".\n- Cod mai scurt, mai usor de testat si minificat de catre build tools.",
    codeSnippet: `// Clasa (complicat cu "this" si lifecycle fragmentat):
class CounterClass extends React.Component {
  state = { count: 0 };
  render() {
    return <button onClick={() => this.setState({ count: this.state.count + 1 })}>{this.state.count}</button>;
  }
}

// Functie moderna cu Hooks (concis si clar):
function CounterFunction() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}`,
    interviewTrap: "Singurul scenariu ramas unde clasele sunt inca necesare in React este implementarea unui Error Boundary nativ (metoda componentDidCatch), desi in productie se foloseste biblioteca populara \"react-error-boundary\".",
    keyTakeaway: "Componentele functionale cu Hook-uri sunt standardul modern: elimina problemele cu \"this\" si permit compunerea eleganta a logicii de business."
  },
  {
    id: "react-17",
    category: "REACT",
    difficulty: "USOR",
    title: "Regulile Hook-urilor in React (Rules of Hooks)",
    question: "Care sunt cele doua reguli stricte ale Hook-urilor in React si de ce exista ele?",
    answer: "Cele doua reguli fundamentale:\n1. Apeleaza Hook-urile doar la cel mai inalt nivel (Top-Level):\nNu apela niciodata hook-uri in interiorul buclelor (for, while), instructiunilor conditionale (if, switch) sau functiilor imbricate.\n\n2. Apeleaza Hook-urile doar din componente functionale React sau din Custom Hooks:\nNu le apela din functii JavaScript obisnuite.\n\nDe ce exista aceste reguli:\nIn interiorul sau, React pastreaza starea fiecarui hook intr-o lista inlantuita simpla (array ordonat) asociata componentei. React nu stie ce hook a fost apelat dupa nume, ci strict dupa ORDINEA IN CARE AU FOST APELATE la fiecare render!\nDaca un hook este pus intr-un \"if\" si este sarit la o randare, indexul tuturor hook-urilor urmatoare se decaleaza, returnand starea gresita si distrugand complet aplicatia.",
    codeSnippet: `// GRESIT (incalca regula 1 - duce la erori interne de ordine):
if (isLoggedIn) {
  useEffect(() => { ... }, []);
}

// CORECT (hook-ul e la top level, conditia e in interiorul sau):
useEffect(() => {
  if (!isLoggedIn) return;
  // Logica dorita...
}, [isLoggedIn]);`,
    interviewTrap: "Pluginul oficial de linter eslint-plugin-react-hooks detecteaza automat incalcarea acestor reguli in timpul scrierii codului si este inclus implicit in majoritatea proiectelor moderne.",
    keyTakeaway: "Hook-urile trebuie apelate neconditional si in aceeasi ordine la fiecare randare pentru ca React se bazeaza pe ordinea apelurilor pentru a asocia starea."
  },
  {
    id: "react-18",
    category: "REACT",
    difficulty: "MEDIU",
    title: "React.memo: Cand previne re-randarea si cand devine inutil?",
    question: "Ce face functia React.memo, cum decide daca re-randeaza o componenta si care este capcana trimiterii de obiecte sau functii inline?",
    answer: "React.memo este o componenta de ordin superior (Higher-Order Component) care memoreaza rezultatul randat al unei componente.\n\nCum functioneaza:\n- In mod implicit in React, daca o componenta parinte se re-randeaza, toti copiii sai se re-randeaza automat, chiar daca props-urile lor nu s-au schimbat!\n- React.memo infasoara componenta copil si realizeaza o comparatie superficiala (shallow comparison prin Object.is) a props-urilor primite intre randarea anterioara si cea curenta. Daca props-urile sunt identice, copilul nu este re-randat.\n\nCapcana functiilor si obiectelor inline:\nDaca parintele trimite o functie inline (<Child onClick={() => doSomething()} />) sau un obiect literal (<Child style={{ color: \"red\" }} />), JavaScript creeaza o noua referinta in memorie la fiecare render al parintelui.\nComparatia superficiala va gasi referinte diferite si React.memo devine complet inutil!",
    codeSnippet: `// Componenta copil memorata
const ExpensiveList = React.memo(function ExpensiveList({ items, onItemClick }) {
  console.log('Randare lista costisitoare...');
  return <ul>{items.map(i => <li key={i.id} onClick={() => onItemClick(i)}>{i.name}</li>)}</ul>;
});

// In parinte:
// items trebuie memorat cu useMemo, iar onItemClick cu useCallback!
const handleItemClick = useCallback((item) => {
  console.log(item);
}, []);`,
    interviewTrap: "Nu infasura toate componentele in React.memo in mod automat. Comparatia superficiala de props adauga un mic cost de CPU la fiecare render. Foloseste-l doar pentru componente mari cu randare lenta.",
    keyTakeaway: "React.memo previne re-randarea cand props-urile nu s-au schimbat; pentru a functiona, functiile si obiectele transmise trebuie stabilizate cu useCallback si useMemo."
  },
  {
    id: "react-19",
    category: "REACT",
    difficulty: "USOR",
    title: "Context API: Mecanismul createContext, Provider si useContext",
    question: "Cum functioneaza React Context API si care sunt cei trei pasi obligatorii pentru a partaja date global in arborele de componente?",
    answer: "Context API este mecanismul nativ React conceput pentru a transmite date catre orice componenta din arbore fara a recurge la \"props drilling\".\n\nCei trei pasi:\n1. Crearea Contextului: Folosesti createContext(defaultValue) pentru a defini forma datelor.\n2. Furnizarea Datelor (Provider): Infasori arborele sau subarborele dorit intr-un <MyContext.Provider value={...}>.\n3. Consumarea Datelor: In orice componenta copil aflata in interiorul Provider-ului, apelezi hook-ul const data = useContext(MyContext).",
    codeSnippet: `// 1. Creare
const ThemeContext = createContext('light');

// 2. Provider in parinte
export function App() {
  const [theme, setTheme] = useState('dark');
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      <Header />
    </ThemeContext.Provider>
  );
}

// 3. Consumare in copil adanc imbricat
function ThemeToggle() {
  const { theme, setTheme } = useContext(ThemeContext);
  return (
    <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
      Tema curenta: {theme}
    </button>
  );
}`,
    interviewTrap: "Daca apelezi useContext in afara oricarui Provider corespunzator, hook-ul va returna valoarea default stabilita la createContext.",
    keyTakeaway: "Context API partajeaza date globale (utilizator autentificat, tema vizuala, limba aplicatiei) evitand pasarea manuala a proprietatilor prin generatii intermediare."
  },
  {
    id: "react-20",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Capcana de Performanta la Context API si solutii de optimizare",
    question: "De ce poate deveni React Context o problema grava de performanta in aplicatii mari si cum eviti re-randarile inutile ale consumatorilor?",
    answer: "Problema fundamentala:\nCand proprietatea \"value\" a unui Context.Provider se schimba (pe baza comparatiei Object.is), TOATE componentele care apeleaza useContext(MyContext) se re-randeaza automat si obligatoriu, ignorand complet orice protectie oferita de React.memo!\n\nExemplu de capcana:\nDaca pui intr-un singur context atat datele utilizatorului cat si un counter care se schimba la fiecare secunda, toate componentele care au nevoie doar de numele utilizatorului se vor re-randa la fiecare secunda!\n\nSolutii de optimizare:\n1. Split Context: Imparte contextul mare in contexte mici si specifice (ex: AuthUserContext separat de UserSettingsContext).\n2. Separarea Starii de Actiuni: Creeaza un context pentru date (StateContext) si un context separat pentru functiile de dispatch (DispatchContext, care nu se schimba niciodata).\n3. Memorarea valorii transmise: Foloseste useMemo pentru obiectul value={{ ... }} ca sa nu creezi o referinta noua la fiecare render al parintelui.",
    codeSnippet: `// Separare inteligenta a contextului:
const AuthStateContext = createContext(null);
const AuthActionsContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  
  // Actiunile sunt stabile si nu declanseaza re-randari ale consumatorilor
  const actions = useMemo(() => ({
    login: (userData) => setUser(userData),
    logout: () => setUser(null)
  }), []);

  return (
    <AuthActionsContext.Provider value={actions}>
      <AuthStateContext.Provider value={user}>
        {children}
      </AuthStateContext.Provider>
    </AuthActionsContext.Provider>
  );
}`,
    interviewTrap: "Transmiterea unui obiect literal inline in Provider fara useMemo (ex: value={{ user, logout }}) creeaza o referinta noua la fiecare randare a parintelui, fortand re-randarea tuturor consumatorilor chiar daca valorile interne sunt identice.",
    keyTakeaway: "Imparte contextele pe responsabilitati si memoreaza obiectul value cu useMemo pentru a evita re-randarile in cascada."
  },
  {
    id: "react-21",
    category: "REACT",
    difficulty: "USOR",
    title: "Event Handling in React: SyntheticEvent si e.preventDefault()",
    question: "Ce este SyntheticEvent in React, de ce nu foloseste direct evenimentele native de browser si cum prevenim comportamentul default?",
    answer: "In React, toate evenimentele (onClick, onChange, onSubmit) primesc un obiect numit SyntheticEvent.\n\nCe este:\nEste un wrapper cross-browser peste evenimentul nativ al browserului (Event). Are exact aceeasi interfata standard (e.target, e.preventDefault(), e.stopPropagation()), dar asigura un comportament 100% identic pe toate browserele (Chrome, Safari, Firefox, Edge).\n\nEvent Delegation:\nReact nu ataseaza event listeners pe fiecare element HTML in parte din DOM (lucru care ar consuma multa memorie pentru liste mari). In schimb, ataseaza un singur listener global pe nodul radacina al aplicatiei (root container) si distribuie inteligent evenimentele prin delegare.\n\nPrevenirea comportamentului default:\nIn React, nu poti returna false pentru a opri submit-ul sau navigarea (spre deosebire de vechiul HTML). Trebuie sa apelezi explicit e.preventDefault().",
    codeSnippet: `function LoginForm() {
  const handleSubmit = (e) => {
    // Opreste reincarcarea completa a paginii produsa de formularul HTML
    e.preventDefault();
    console.log('Trimite datele prin fetch fara refresh...');
  };

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">Autentificare</button>
    </form>
  );
}`,
    interviewTrap: "Daca ai nevoie neaparat de obiectul nativ al browserului, il poti accesa prin e.nativeEvent, insa in 99% din aplicatiile practice SyntheticEvent este suficient.",
    keyTakeaway: "SyntheticEvent normalizeaza comportamentul evenimentelor intre toate browserele si optimizeaza memoria prin delegare pe radacina aplicatiei."
  },
  {
    id: "react-22",
    category: "REACT",
    difficulty: "USOR",
    title: "Initializare Lazy in useState: Cum evitam calculele costisitoare la fiecare render?",
    question: "Ce este Lazy Initial State in useState si cand ar trebui sa transmitem o functie callback in loc de o valoare directa ca stare initiala?",
    answer: "Cand apelezi useState(expensiveComputation()), functia respectiva este apelata si evaluata la FIECARE randare a componentei, chiar daca React foloseste rezultatul doar la prima randare (mount) si il ignora la re-randarile urmatoare!\n\nSolutia: Lazy Initial State\nDaca transmiti o functie anonima ca argument: useState(() => expensiveComputation()), React va apela acea functie strict la prima randare a componentei. La randarile urmatoare, functia nu mai este executata deloc.\n\nCand se foloseste:\n- Citirea si parsarea datelor din localStorage (JSON.parse(localStorage.getItem(...))).\n- Calcule matematice complexe sau transformari de array-uri mari.\n- Instantierea unor obiecte costisitoare.",
    codeSnippet: `// INEFICIENT: Citeste si parseaza localStorage la fiecare re-render al componentei!
const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

// OPTIM (Lazy Initialization): Ruleaza o singura data la mount!
const [user, setUser] = useState(() => {
  const saved = localStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
});`,
    interviewTrap: "Diferenta de sintaxa este minuscula: useState(fn()) apeleaza functia instant la fiecare render, in timp ce useState(fn) sau useState(() => fn()) o lasa pe seama React-ului doar pentru mount.",
    keyTakeaway: "Transmite o functie in useState pentru initializari costisitoare precum citirea din localStorage ca sa nu blochezi randarile ulterioare."
  },
  {
    id: "react-23",
    category: "REACT",
    difficulty: "USOR",
    title: "De ce nu poate fi functia din useEffect direct \"async\"?",
    question: "De ce este interzis sa scrii useEffect(async () => { ... }) si cum se structureaza corect un apel asincron in interiorul unui effect?",
    answer: "Functia primita ca prim argument in useEffect trebuie sa returneze fie o functie de cleanup (un callback), fie undefined.\n\nIn JavaScript, orice functie declarata cu cuvantul cheie \"async\" returneaza implicit o promisiune (Promise). Daca ai declara functia din useEffect ca async, aceasta ar returna un Promise in loc de o functie de cleanup.\nReact s-ar astepta sa apeleze functia returnata la demontare, dar incercarea de a apela un Promise ca o functie ar arunca o eroare de executie in consola.\n\nCum se structureaza corect:\nDeclari o functie asincrona interna in interiorul efectului si o apelezi imediat, sau folosesti promisiuni clasice (.then/.catch).",
    codeSnippet: `// GRESIT (Eroare React: Effect callbacks are synchronous to prevent race conditions):
// useEffect(async () => { const res = await fetch(...); }, []);

// CORECT (Functie async definita intern si apelata):
useEffect(() => {
  let isMounted = true;

  async function loadData() {
    try {
      const response = await fetch('/api/jobs');
      const data = await response.json();
      if (isMounted) setJobs(data);
    } catch (err) {
      if (isMounted) setError(err.message);
    }
  }

  loadData();

  return () => {
    isMounted = false; // Curatare pentru a preveni setarea starii pe componenta demontata
  };
}, []);`,
    interviewTrap: "Nu uita sa gestionezi blocurile try/catch cand folosesti functii async in useEffect, altfel erorile de retea raman neprinse si blocheaza aplicatia.",
    keyTakeaway: "useEffect asteapta fie o functie de cleanup, fie undefined; pentru apeluri async, defineste o functie asincrona in interiorul efectului si apeleaz-o."
  },
  {
    id: "react-24",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Race Conditions la Data Fetching in useEffect si AbortController",
    question: "Ce este o \"Race Condition\" atunci cand incarci date cu useEffect pe baza unui prop/state si cum rezolvi problema folosind AbortController?",
    answer: "Ce este Race Condition:\nImagineaza-ti ca utilizatorul schimba rapid tab-ul de la \"Junior\" la \"Senior\".\n1. Efectul trimite Request A pentru \"Junior\".\n2. Imediat, trimite Request B pentru \"Senior\".\n3. Daca reteaua are fluctuatii, Request B poate raspunde rapid in 100ms, iar Request A raspunde mai tarziu in 500ms.\n4. Ultimul raspuns care soseste este A (\"Junior\"), suprascriind datele din B! Desi utilizatorul a selectat \"Senior\", pe ecran apar rezultatele pentru \"Junior\".\n\nSolutia moderna: AbortController\nLa fiecare re-executie a efectului (sau la unmount), functia de cleanup apeleaza controller.abort(), anuland cererea HTTP anterioara inainte de a trimite noul request.",
    codeSnippet: `useEffect(() => {
  const controller = new AbortController();

  async function fetchJobDetails() {
    try {
      const res = await fetch(\`/api/jobs/\${jobId}\`, { signal: controller.signal });
      const data = await res.json();
      setDetails(data);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message); // Ignoram erorile generate intentionat de abort()
      }
    }
  }

  fetchJobDetails();

  return () => {
    controller.abort(); // Anuleaza cererea veche daca jobId s-a schimbat
  };
}, [jobId]);`,
    interviewTrap: "Cand o cerere este anulata cu AbortController, fetch arunca o eroare cu numele \"AbortError\". Asigura-te ca filtrezi aceasta eroare si nu o afisezi utilizatorului ca o eroare reala.",
    keyTakeaway: "Foloseste AbortController in functia de cleanup a useEffect pentru a anula cererile expirate si a garanta ca UI-ul afiseaza doar rezultatul ultimei cereri trimise."
  },
  {
    id: "react-25",
    category: "REACT",
    difficulty: "USOR",
    title: "Custom Hooks: Ce sunt si de ce trebuie sa inceapa cu prefixul \"use\"?",
    question: "Ce este un Custom Hook in React, ce avantaje aduce si de ce este obligatoriu ca numele sau sa inceapa cu prefixul \"use\"?",
    answer: "Un Custom Hook este o simpla functie JavaScript care apeleaza la randul sau alte Hook-uri React (useState, useEffect, etc.) pentru a extrage si reutiliza logica de stare (stateful logic) intre componente diferite.\n\nCe permit:\n- Reutilizarea logicii fara a dubla codul si fara a crea ierarhii greoaie de componente.\n- Izolarea logicii de business de partea de randare vizuala (UI).\n- Testare unitara simpla a logicii.\n\nDe ce prefixul \"use\" este obligatoriu:\n1. Este o conventie de denumire recunoscuta de compilator si de pluginul oficial eslint-plugin-react-hooks.\n2. Linterul verifica automat daca functia respecta regulile Hook-urilor (nu este apelata conditionat etc.). Daca nu ar incepe cu \"use\", linterul nu ar sti ca functia contine hook-uri si nu ar putea preveni bug-urile.",
    codeSnippet: `// Custom hook reutilizabil
function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}`,
    interviewTrap: "Custom Hook-urile partajeaza LOGICA de stare, NU starea in sine! Doua componente care apeleaza useOnlineStatus() vor primi instante independente de stare.",
    keyTakeaway: "Custom Hook-urile extrag logica reutilizabila cu hook-uri interne; prefixul \"use\" este obligatoriu pentru ca instrumentele de analiza statica sa valideze regulile React."
  },
  {
    id: "react-26",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Implementarea unui Custom Hook practic: useLocalStorage",
    question: "Cum construiesti un Custom Hook useLocalStorage care citeste/scrie in localStorage si pastreaza starea sincronizata in React?",
    answer: "Un hook utilitar ideal pentru persistenta setarilor utilizatorului (ex: tema, filtre, token).\n\nCerinte cheie:\n1. Initializare lazy din localStorage cu fallback la o valoare initiala.\n2. Gestionarea erorilor (try/catch in caz ca browserul are cookies/storage blocate).\n3. Serializare si deserializare automata JSON.\n4. Suport pentru functional updates (prev => ...).",
    codeSnippet: `function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      // Permite transmiterea unei functii ca in useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}`,
    interviewTrap: "Daca rulezi aplicatia cu Server-Side Rendering (Next.js), \"window\" nu este definit pe server! Verifica typeof window !== \"undefined\" inainte de a accesa localStorage.",
    keyTakeaway: "useLocalStorage combina useState cu persistenta in browser, oferind aceeasi interfata [val, setVal] ca useState standard."
  },
  {
    id: "react-27",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Implementarea unui Custom Hook practic: useDebounce",
    question: "Ce problema rezolva un hook useDebounce la tastarea intr-un camp de cautare si cum se implementeaza?",
    answer: "Problema:\nCand utilizatorul tasteaza intr-un search input, evenimentul onChange se declanseaza la fiecare tasta. Daca trimiti o cerere HTTP la server la fiecare litera (\"j\", \"ja\", \"jav\", \"java\"), bombardezi backend-ul cu apeluri inutile si poti bloca browserul.\n\nSolutia useDebounce:\nAmana actualizarea valorii finale pana cand utilizatorul se opreste din tastat pentru o durata prestabilita de timp (ex: 300ms sau 500ms).\nLa fiecare tasta noua, timerul precedent este anulat (cleanup in useEffect) si este pornit un nou timer.",
    codeSnippet: `function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Porneste un timer pentru actualizarea valorii
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Daca utilizatorul tasteaza din nou inainte de expirarea delay-ului,
    // cleanup-ul anuleaza timerul anterior!
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Utilizare in componenta:
// const debouncedQuery = useDebounce(searchTerm, 400);
// useEffect(() => { fetchApi(debouncedQuery); }, [debouncedQuery]);`,
    interviewTrap: "Nu confunda Debounce (asteapta o pauza de liniste) cu Throttle (executa cel mult o data la un interval fix de timp, ideal pentru onScroll).",
    keyTakeaway: "useDebounce previne bombardarea serverului cu cereri la fiecare tasta prin resetarea timerului la fiecare modificare a valorii de intrare."
  },
  {
    id: "react-28",
    category: "REACT",
    difficulty: "USOR",
    title: "Implementarea unui Custom Hook practic: useWindowSize",
    question: "Cum construiesti un Custom Hook useWindowSize pentru a adapta interfata la dimensiunile ferestrei de browser?",
    answer: "Un hook esential pentru randare conditionala receptiva la nivel de JavaScript (ex: afisarea unui meniu mobil sub 768px cand CSS media queries nu sunt suficiente).\n\nFunctionalitate:\n1. Stocheaza latimea si inaltimea ferestrei in stare.\n2. Ataseaza un listener pe window \"resize\" la montare.\n3. Returneaza cleanup pentru a sterge listenerul la demontare.",
    codeSnippet: `function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}`,
    interviewTrap: "Evenimentul de resize se poate declansa de zeci de ori pe secunda cand utilizatorul redimensioneaza fereastra. Pentru aplicatii critice, handlerul poate fi optimizat cu un throttle.",
    keyTakeaway: "useWindowSize pastreaza dimensiunile curente ale ecranului sincronizate cu starea React printr-un listener curatat corespunzator."
  },
  {
    id: "react-29",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Implementarea unui Custom Hook practic: useOnClickOutside",
    question: "Cum implementezi un Custom Hook useOnClickOutside pentru a inchide automat o fereastra modala sau un meniu dropdown cand utilizatorul da click in exterior?",
    answer: "Mecanism:\n1. Primeste un \"ref\" catre elementul container (meniul sau modala) si o functie \"handler\" care va fi apelata (ex: onClose).\n2. Asculta evenimentul \"mousedown\" sau \"touchstart\" pe intregul document.\n3. Verifica daca nodul pe care s-a dat click (event.target) se afla in interiorul containerului folosind metoda DOM ref.current.contains(event.target).\n4. Daca click-ul a avut loc in afara, apeleaza functia handler.",
    codeSnippet: `function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Nu face nimic daca s-a dat click pe container sau pe copiii sai
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}`,
    interviewTrap: "Daca functia \"handler\" este o functie anonima inline in componenta parinte si nu este memorata cu useCallback, useEffect-ul se va re-executa la fiecare render al parintelui, adaugand si stergand listeners continuu!",
    keyTakeaway: "Metoda DOM element.contains(event.target) verifica daca un click a avut loc in interiorul sau in exteriorul elementului referentiat."
  },
  {
    id: "react-30",
    category: "REACT",
    difficulty: "USOR",
    title: "useId in React 18: Generarea ID-urilor unice si accesibile",
    question: "Ce este hook-ul useId introdus in React 18 si de ce Math.random() sau un simplu counter sunt gresite pentru generarea de ID-uri HTML?",
    answer: "Hook-ul useId genereaza identificatori unici si stabili pentru elemente HTML (in special pentru legarea tag-ului <label htmlFor={id}> de <input id={id}>).\n\nDe ce Math.random() este un anti-pattern:\nIn aplicatiile cu Server-Side Rendering (SSR), codul se executa intai pe server si apoi pe client:\n- Math.random() genereaza un ID pe server (ex: \"id-0.428\") si altul diferit in browser la hidratare (ex: \"id-0.891\").\n- Aceasta discrepanta produce o eroare grava de hidratare: \"Hydration Mismatch\"!\n\nuseId rezolva problema:\nGenereaza un string stabil garantat identic atat pe server, cat si pe client la hidratare, bazat pe pozitia componentei in arborele React.",
    codeSnippet: `function AccessiblePasswordField() {
  const passwordId = useId();
  const hintId = useId();

  return (
    <div>
      <label htmlFor={passwordId}>Parola:</label>
      <input
        id={passwordId}
        type="password"
        aria-describedby={hintId}
      />
      <p id={hintId}>Parola trebuie sa contina minim 8 caractere.</p>
    </div>
  );
}`,
    interviewTrap: "Nu folosi niciodata useId pentru a genera chei (key) in liste mapate! Proprietatea key dintr-o lista trebuie generata din datele elementului (ex: item.id), nu dintr-un hook.",
    keyTakeaway: "useId genereaza ID-uri accesibile si sigure pentru SSR, prevenind erorile de hidratare intre server si browser."
  },
  {
    id: "react-31",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Error Boundaries: Cum izolam erorile de randare din UI?",
    question: "Ce este un Error Boundary in React, ce tipuri de erori poate si NU poate prinde si de ce este esential in productie?",
    answer: "Un Error Boundary este o componenta React speciala care prinde erorile JavaScript aruncate oriunde in subarborele sau de copii, afisand o interfata vizuala de rezerva (Fallback UI) in loc sa lase ecranul complet alb (White Screen of Death).\n\nCe PRINDE:\n- Erori aparute in timpul randarii JSX.\n- Erori in metodele de ciclu de viata si constructorii copiilor.\n\nCe NU PRINDE (limitari importante):\n1. Erori din Event Handlers (ex: o eroare in onClick nu e prinsa; foloseste try/catch acolo).\n2. Cod asincron (setTimeout, fetch, requestAnimationFrame).\n3. Erori aruncate in timpul Server-Side Rendering.\n4. Erori aruncate chiar in interiorul Error Boundary-ului insusi.\n\nImplementare:\nNecesita o clasa cu static getDerivedStateFromError() si componentDidCatch(), sau biblioteca standard de industrie \"react-error-boundary\".",
    codeSnippet: `// Folosind biblioteca standard: npm install react-error-boundary
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert" className="p-4 bg-red-50 border border-red-200">
      <p>A intervenit o problema la incarcarea cardului:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Incearca din nou</button>
    </div>
  );
}

// Utilizare in arbore:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <ComplexJobAnalyticsWidget />
</ErrorBoundary>`,
    interviewTrap: "Daca o componenta arunca o eroare neprinsa in timpul randarii, React demonteaza intregul arbore de componente din pagina! Foloseste Error Boundaries granulare in jurul modulelor independente.",
    keyTakeaway: "Error Boundaries previn prabusirea intregii aplicatii la o eroare locala de randare, pastrand restul paginii complet functional."
  },
  {
    id: "react-32",
    category: "REACT",
    difficulty: "USOR",
    title: "Code Splitting cu React.lazy si Suspense",
    question: "Cum functioneaza React.lazy si <Suspense> pentru a reduce dimensiunea pachetului initial (bundle size) al aplicatiei?",
    answer: "In mod implicit, un bundler (Vite sau Webpack) impacheteaza tot codul aplicatiei intr-un singur fisier mare JavaScript. Utilizatorul descarca tot codul, inclusiv paginile pe care s-ar putea sa nu intre niciodata (ex: pagina de Admin).\n\nReact.lazy permite importul dinamic al componentelor doar in momentul in care acestea urmeaza sa fie randate pe ecran.\n\nSuspense actioneaza ca un mecanism de asteptare: cat timp codul fisierului se descarca prin retea, Suspense afiseaza un indicator de incarcare (fallback prop, ex: un Spinner sau Skeleton).",
    codeSnippet: `import React, { Suspense, lazy } from 'react';

// Componenta este descarcata doar cand utilizatorul navigheaza spre ea
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route 
        path="/admin" 
        element={
          <Suspense fallback={<div>Se incarca panoul de administrare...</div>}>
            <AdminDashboard />
          </Suspense>
        } 
      />
    </Routes>
  );
}`,
    interviewTrap: "React.lazy functioneaza doar cu module care au export default (export default Component). Daca folosesti named exports, trebuie sa adaptezi importul.",
    keyTakeaway: "React.lazy impreuna cu Suspense impart bundle-ul in bucati mici (chunks) descarcate la cerere, accelerand semnificativ viteza de incarcare initiala."
  },
  {
    id: "react-33",
    category: "REACT",
    difficulty: "USOR",
    title: "Portals in React: createPortal pentru Modale si Tooltips",
    question: "Ce este un Portal (ReactDOM.createPortal) si de ce este esential pentru ferestre modale, tooltips si meniuri contextuale?",
    answer: "In mod standard, JSX randeaza elementele ca noduri copii directe in parintele lor din DOM.\n\nProblema:\nDaca vrei sa afisezi o fereastra modala dintr-o componenta copil adanca, iar un parinte din arbore are stiluri CSS precum overflow: hidden, z-index: 10 sau transform: scale(0.9), modala ta poate fi decupata, ascunsa sau pozitionata complet gresit pe ecran!\n\nSolutia: ReactDOM.createPortal(children, domNode)\nPermite randarea fizica a elementului HTML intr-un alt nod din DOM (de obicei direct in document.body sau intr-un <div id=\"modal-root\">), pastrand in acelasi timp toate proprietatile native React (event bubbling, context).\nEvenimentele declansate in interiorul modalei vor propaga (bubble up) in arborele virtual React catre parintele sau logic, chiar daca in DOM real modala este complet in alta parte!",
    codeSnippet: `import { createPortal } from 'react-dom';

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body // Se randeaza direct la radacina paginii HTML
  );
}`,
    interviewTrap: "Nu uita ca desi nodul fizic este mutat in document.body, contextul React si propagarea evenimentelor sintetice raman conectate la pozitia logica din arborele React.",
    keyTakeaway: "createPortal randeaza elementul in alt loc din DOM (scapand de restrictiile CSS de overflow/z-index ale parintilor), pastrand propagarea normala a evenimentelor in React."
  },
  {
    id: "react-34",
    category: "REACT",
    difficulty: "USOR",
    title: "Props.children si Pattern-ul de Compozitie",
    question: "Ce reprezinta proprietatea props.children si de ce este pattern-ul de compozitie preferat mostenirii clasice in React?",
    answer: "props.children reprezinta continutul JSX plasat intre tag-ul de deschidere si cel de inchidere al unei componente (<Card><p>Continut</p></Card>).\n\nAvantajele compozitiei (Composition over Inheritance):\n1. Flexibilitate maxima: Componenta container nu trebuie sa stie ce se afla in interiorul ei (text, butoane, formulare, imagini).\n2. Evitarea \"Props Drilling\": Parintele poate transmite direct componente copil gata configurate cu starea necesara.\n3. React a fost proiectat pe principiul compozitiei; nu se foloseste niciodata mostenirea clasica (extends) intre componente pentru a reutiliza UI.",
    codeSnippet: `// Componenta generica de stilizare de tip Card
function Card({ title, footer, children }) {
  return (
    <div className="rounded-lg shadow p-4 border bg-white">
      {title && <h2 className="font-bold border-b pb-2">{title}</h2>}
      <div className="py-2">{children}</div>
      {footer && <div className="border-t pt-2 text-sm">{footer}</div>}
    </div>
  );
}

// Utilizare eleganta prin compozitie:
<Card title="Job Senior Java" footer={<button>Aplica</button>}>
  <p>Companie: TechCorp</p>
  <p>Locatie: Remote</p>
</Card>`,
    interviewTrap: "Daca o componenta nu are copii, props.children este undefined. Daca are un singur copil, este un obiect; daca are mai multi, este un array. Pentru manipulare sigura a copiilor, foloseste utilitarul React.Children.",
    keyTakeaway: "props.children transforma componentele in containere flexibile si reutilizabile, formand baza design system-urilor moderne."
  },
  {
    id: "react-35",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Automatic Batching in React 18: Cum grupeaza React actualizarile?",
    question: "Ce este \"Automatic Batching\" in React 18 si cum difera fata de comportamentul din React 17 la apeluri asincrone?",
    answer: "Batching reprezinta procesul prin care React grupeaza mai multe actualizari de stare (setState) intr-o singura re-randare a componentei pentru a maximiza performanta.\n\nIn React 17:\nBatching-ul functiona DOAR in interiorul event handler-elor native React (ex: onClick). Daca aveai mai multe actualizari de stare intr-un Promise (.then), setTimeout sau fetch callback, React randa componenta dupa fiecare setState in parte (2 actualizari = 2 randari separate)!\n\nIn React 18 (Automatic Batching):\nToate actualizarile de stare sunt grupate automat intr-un singur render, indiferent unde sunt apelate: in promises, timere setTimeout, fetch callbacks sau event handlers native.",
    codeSnippet: `// In React 18, ambele actualizari produc UN SINGUR render, chiar si in setTimeout!
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // React 18 randeaza o singura data la finalul functiei
}, 1000);

// Daca ai nevoie neaparat de un render sincron intermediar (rar intalnit):
import { flushSync } from 'react-dom';
flushSync(() => {
  setCount(c => c + 1);
}); // UI se actualizeaza imediat aici`,
    interviewTrap: "Daca ai cod vechi care se baza pe faptul ca starea era randata instant dupa primul setState dintr-un callback async, trecerea la React 18 poate schimba temporizarea.",
    keyTakeaway: "React 18 grupeaza automat toate actualizarile de stare intr-un singur render, inclusiv in operatii asincrone (promises, timere)."
  },
  {
    id: "react-36",
    category: "REACT",
    difficulty: "USOR",
    title: "React.StrictMode: De ce ruleaza efectele si functiile de doua ori in Development?",
    question: "De ce ruleaza corpul componentelor si functiile din useEffect de doua ori in modul de dezvoltare si ce probleme te ajuta sa identifici?",
    answer: "Cand aplicatia este infasurata in <React.StrictMode>, React ruleaza intentionat anumite functii si efecte de doua ori exclusiv in modul de dezvoltare (development mode):\n- Randarea componentelor functionale (render -> render).\n- Efectele din useEffect (mount -> unmount cleanup -> mount din nou).\n\nDe ce face acest lucru:\n1. Descoperirea efectelor secundare impure in corpul functiilor (componentele React trebuie sa fie pure functions).\n2. Descoperirea lipsei functiilor de cleanup in useEffect: daca uiti sa stergi un event listener sau sa anulezi un timer, a doua executie va produce un comportament duplicat evident in consola.\n3. Pregatirea codului pentru viitoarele optimizari concurente (unde React poate demonta si recrea parti din UI pentru a pastra starea).\n\nIn productie (production build), aceasta dubla executie este complet eliminata!",
    codeSnippet: `// In index.jsx:
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Daca vezi doua console.log-uri la pornire:
useEffect(() => {
  console.log('Montat'); // Va aparea de 2 ori in dev console, dar 1 singura data in prod!
}, []);`,
    interviewTrap: "Nu incerca sa dezactivezi StrictMode doar ca sa scapi de un console.log duplicat! Dublarea este un ajutor pretios pentru a identifica bug-uri de memory leak si stare reziduala.",
    keyTakeaway: "StrictMode forteaza executia dubla in dev pentru a scoate la iveala side effects necuratate si dependinte impure; nu afecteaza deloc mediul de productie."
  },
  {
    id: "react-37",
    category: "REACT",
    difficulty: "MEDIU",
    title: "dangerouslySetInnerHTML: Riscuri de securitate XSS si igienizare",
    question: "Ce face proprietatea dangerouslySetInnerHTML, de ce are un nume atat de lung si alarmant si cum te protejezi de atacurile XSS?",
    answer: "dangerouslySetInnerHTML este echivalentul din React pentru proprietatea nativa element.innerHTML din JavaScript.\nPermite injectarea unui string HTML brut direct in interiorul unui element JSX.\n\nDe ce are acest nume alarmant:\nNumele a fost ales intentionat lung si incomod de catre echipa React pentru a aminti dezvoltatorului ca injectarea de HTML nefiltrat este cea mai usoara poarta de intrare pentru atacurile XSS (Cross-Site Scripting). Daca un atacator introduce un script intr-un comentariu (<script>fur_token()</script>), acesta se va executa in browserul victimei!\n\nCum te protejezi:\nNu folosi niciodata date primite de la utilizatori direct in dangerouslySetInnerHTML fara sa le treci printr-o biblioteca de igienizare (sanitization) precum DOMPurify.",
    codeSnippet: `import DOMPurify from 'dompurify';

function SafeHtmlViewer({ rawHtmlContent }) {
  // Igienizeaza continutul eliminand orice script sau tag periculos
  const cleanHtml = DOMPurify.sanitize(rawHtmlContent);

  return (
    <div dangerouslySetInnerHTML={{ __html: cleanHtml }} />
  );
}`,
    interviewTrap: "In mod implicit, React previne XSS prin faptul ca face escape automat la orice string afisat intre acolade ({userData.name}). XSS este posibil doar cand ocolesti aceasta protectie cu dangerouslySetInnerHTML.",
    keyTakeaway: "dangerouslySetInnerHTML injecteaza HTML brut; filtreaza intotdeauna continutul cu DOMPurify pentru a preveni atacurile de tip Cross-Site Scripting."
  },
  {
    id: "react-38",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useReducer vs useState: Cand alegem un reducer?",
    question: "Care este diferenta dintre useReducer si useState si in ce situatii practice este useReducer alegerea superioara?",
    answer: "useState si useReducer rezolva aceeasi problema (gestionarea starii locale), dar cu nivele diferite de structurare:\n\nCand folosim useState:\n- Stari primitive simple (numere, string-uri, booleans) sau obiecte mici.\n- Cand actualizarile sunt independente si simple (ex: setIsOpen(true)).\n\nCand folosim useReducer:\n1. Stare complexa cu multiple campuri corelate (ex: un formular multi-step cu 15 campuri si validari).\n2. Cand starea urmatoare depinde de mai multe valori anterioare prin reguli de business stricte.\n3. Cand vrei sa separi complet logica de modificare a starii (functia pura reducer) de componenta vizuala.\n4. Optimizare de performanta: functia \"dispatch\" are o referinta stabila garantata pe toata viata componentei, ceea ce inseamna ca o poti transmite prin props copiilor fara riscul de a declansa re-randari.",
    codeSnippet: `const initialState = { count: 0, step: 1 };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + state.step };
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <div>
      <p>Total: {state.count}</p>
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>+</button>
      <button onClick={() => dispatch({ type: 'SET_STEP', payload: 5 })}>Pas 5</button>
    </div>
  );
}`,
    interviewTrap: "Functia reducer trebuie sa fie strict o FUNCTIE PURA: fara side effects, fara Math.random(), fara apeluri API sau mutatii directe in obiectul state.",
    keyTakeaway: "useReducer este ideal pentru stari complexe cu tranzactii multiple si permite decuplarea logicii de business de interfata vizuala."
  },
  {
    id: "react-39",
    category: "REACT",
    difficulty: "USOR",
    title: "Anatomia unui Reducer: State, Action, Type si Payload",
    question: "Ce este un Reducer in React / Redux si care este rolul obiectului Action (type si payload)?",
    answer: "Un Reducer este o functie pura cu semnatura: (state, action) => newState.\n\nPrincipii cheie:\n1. Nu modifica niciodata starea existenta (returneaza intotdeauna un obiect/array nou).\n2. Pentru aceiasi parametri de intrare, returneaza intotdeauna acelasi rezultat (fara side effects).\n\nObiectul Action:\nDescrie \"ceea ce s-a intamplat\" in aplicatie si are de regula doua proprietati:\n- type (string): Identificatorul intentiei de business (ex: \"JOB_ADDED\", \"FILTER_CHANGED\").\n- payload (optional, orice tip de date): Datele aditionale necesare pentru a produce noua stare (ex: obiectul job nou creat).",
    codeSnippet: `function cartReducer(state, action) {
  switch (action.type) {
    case 'ITEM_ADDED':
      return {
        ...state,
        items: [...state.items, action.payload]
      };
    case 'ITEM_REMOVED':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload.id)
      };
    default:
      return state; // Daca actiunea nu e recunoscuta, returnam starea neschimbata
  }
}`,
    interviewTrap: "Nu uita sa incluzi intotdeauna ramura \"default: return state;\" in switch-ul reducerului, altfel o actiune neasteptata va returna undefined si va distruge starea aplicatiei.",
    keyTakeaway: "Reducerul este o functie pura ce primeste starea curenta si o actiune (type + payload) si calculeaza urmatoarea stare a aplicatiei."
  },
  {
    id: "react-40",
    category: "REACT",
    difficulty: "USOR",
    title: "De ce trebuie ca o componenta React sa fie o Functie Pura?",
    question: "Ce inseamna ca o componenta React trebuie sa fie o \"Pure Function\" si ce tipuri de actiuni sunt interzise in corpul functiei de randare?",
    answer: "O functie pura in informatica are doua caracteristici:\n1. Aceeasi intrare produce intotdeauna aceeasi iesire (Same Input -> Same Output).\n2. Nu produce efecte secundare (No Side Effects) in afara scopului sau.\n\nIn React, corpul functiei unei componente este dedicat exclusiv calcularii si returnarii JSX-ului!\n\nActiuni STRICT INTERZISE in corpul functiei de randare:\n- Modificarea variabilelor declarate in afara componentei.\n- Modificarea proprietatilor primite prin props sau a obiectelor din state.\n- Efectuarea de apeluri de retea (fetch/axios).\n- Pornirea de timere (setTimeout, setInterval).\n- Manipularea directa a nodurilor DOM (document.title = ...).\n\nToate aceste operatii cu efect secundar trebuie plasate fie in interiorul unui useEffect, fie intr-un event handler (ex: onClick).",
    codeSnippet: `// GRESIT (Impura! Modifica o variabila externa, rezultatul variaza la fiecare render):
let guestCount = 0;
function Cup() {
  guestCount = guestCount + 1; // SIDE EFFECT ILEGAL IN RENDER!
  return <h2>Ceasca pentru oaspetele #{guestCount}</h2>;
}

// CORECT (Pura! Depinde doar de intrare):
function Cup({ guestNumber }) {
  return <h2>Ceasca pentru oaspetele #{guestNumber}</h2>;
}`,
    interviewTrap: "Daca o componenta este impura, optimizarile avansate din React (precum concurrent rendering, Suspense sau memorarea) vor genera bug-uri imprevizibile si date corupte.",
    keyTakeaway: "Componentele React trebuie sa fie pure in timpul randarii; efectele secundare apartin exclusiv in useEffect sau in event handlers."
  },
  {
    id: "react-41",
    category: "REACT",
    difficulty: "USOR",
    title: "Randarea valorilor false, null, undefined si a string-ului gol",
    question: "Ce afiseaza React pe ecran cand o componenta returneaza null, undefined, false, true sau string-ul gol \"\"?",
    answer: "Regulile de randare ale React pentru valori speciale:\n\n1. false, null, undefined, true:\nReact le ignora complet si NU randeaza nimic pe ecran (nod DOM inexistent).\n- Returnarea lui \"null\" dintr-o componenta este modalitatea standard de a ascunde complet acea componenta din DOM (ex: return null).\n- Expresiile precum {false && <Component />} nu afiseaza nimic.\n\n2. Cifra 0 (zero):\nSe randeaza vizibil pe ecran ca textul \"0\"!\n\n3. String-ul gol \"\":\nSe randeaza ca text gol (nu apare nimic vizual, dar nodul text exista).\n\n4. NaN:\nSe randeaza vizibil pe ecran ca textul \"NaN\"!",
    codeSnippet: `function NotificationBadge({ count, isVisible }) {
  if (!isVisible) {
    return null; // Componenta este complet absenta din DOM
  }

  return (
    <div>
      {/* Boolean-ul true/false nu se vede */}
      <span>{false}</span> 
      {/* 0 se vede pe ecran! */}
      <span>{count}</span> 
    </div>
  );
}`,
    interviewTrap: "Daca o componenta returneaza \"undefined\" in loc de \"null\" in mod explicit, versiunile mai vechi de React aruncau o eroare (\"Nothing was returned from render\"). Foloseste intotdeauna return null cand nu vrei sa randezi nimic.",
    keyTakeaway: "null, false si undefined sunt ignorate de React si nu lasa urme in DOM; numerele (inclusiv 0) se randeaza intotdeauna ca text vizibil."
  },
  {
    id: "react-42",
    category: "REACT",
    difficulty: "USOR",
    title: "Optiuni de Stilizare in React: CSS Modules vs Tailwind CSS",
    question: "Care sunt principalele metode de stilizare intr-o aplicatie React si care sunt avantajele CSS Modules si Tailwind CSS?",
    answer: "1. CSS Modules (fisier.module.css):\n- CSS traditional, dar clasele sunt \"scoped\" local la nivel de componenta.\n- La compilare, clasa .button devine .button_a7x9f, eliminand complet riscul de coliziune de nume intre fisiere diferite.\n- Ideal pentru proiecte care prefera separarea clara intre structura JSX si stilurile CSS pure.\n\n2. Tailwind CSS (Utility-First CSS):\n- Foloseste clase utilitare predefinite aplicate direct in prop-ul className (ex: flex, p-4, bg-blue-500, rounded-lg).\n- Nu mai este nevoie sa inventezi nume de clase si nu mai comuti intre fisiere de stil si fisiere de cod.\n- Pachetul final de CSS este minuscul deoarece clasele nefolosite sunt eliminate (PurgeCSS).\n\n3. CSS-in-JS (Styled Components / Emotion):\n- Stiluri scrise in fisiere JS prin tagged template literals.\n- Flexibil pentru stiluri dinamice bazate pe props, dar adauga un mic overhead de runtime in browser.",
    codeSnippet: `// 1. CSS Modules:
import styles from './Button.module.css';
function Button({ label }) {
  return <button className={styles.primaryBtn}>{label}</button>;
}

// 2. Tailwind CSS:
function TailwindButton({ label }) {
  return (
    <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
      {label}
    </button>
  );
}`,
    interviewTrap: "In React folosim proprietatea \"className\" in loc de \"class\" deoarece \"class\" este un cuvant cheie rezervat in limbajul JavaScript.",
    keyTakeaway: "CSS Modules previne coliziunile claselor prin hash-uri unice, iar Tailwind CSS accelereaza dezvoltarea prin clase utilitare uniforme."
  },
  {
    id: "react-43",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Optimizarea Input-urilor Rapide: Debounce vs Throttling",
    question: "Cum difera tehnicile de Debounce si Throttle si cand se foloseste fiecare pentru a preveni degradarea performantei in UI?",
    answer: "Ambele sunt tehnici de limitare a ratei de executie (Rate Limiting) pentru evenimente care se declanseaza foarte frecvent in browser:\n\n1. Debounce (Amanare pana la liniste):\n- Strange o serie de apeluri rapide si amana executia functiei pana cand trece o perioada specifica de inactivitate.\n- Daca un nou eveniment soseste inainte de expirarea timpului, numaratoarea se reseteaza de la zero.\n- Scenariu ideal: Search inputs, auto-save la formulare, validare asincrona de username.\n\n2. Throttle (Reglare la interval fix):\n- Garanteaza ca functia se executa cel mult o singura data la fiecare X milisecunde, ignorand apelurile intermediare.\n- Nu asteapta ca utilizatorul sa se opreasca din actiune.\n- Scenariu ideal: Evenimente continue de scroll (infinite scrolling), redimensionare de fereastra (resize), mousemove peste canvas.",
    codeSnippet: `// Concept Throttle simplificat:
function throttle(func, limit) {
  let inThrottle = false;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}`,
    interviewTrap: "Daca folosesti debounce intr-un onChange de input controlat si pui debounce direct pe setter-ul de state (setInputValue), utilizatorul va simti un lag suparator la tastare! Pastreaza input-ul sincron in stare locala si aplica debounce doar pe apelul API extern.",
    keyTakeaway: "Debounce asteapta o pauza de liniste inainte de a actiona (ideal la typing); Throttle executa actiunea la intervale constante regulate (ideal la scroll)."
  },
  {
    id: "react-44",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Forwarding Refs cu React.forwardRef",
    question: "Ce este React.forwardRef, ce problema rezolva si cand este necesar sa transmiti un ref catre o componenta copil?",
    answer: "In mod normal in React, proprietatea \"ref\" nu este transmisa ca un prop obisnuit unei componente copil. Daca pui ref pe o componenta functionala custom (<MyInput ref={myRef} />), React arunca o eroare deoarece functiile nu au instante DOM proprii.\n\nSolutia: React.forwardRef\nEste o functie care permite unei componente sa intercepteze ref-ul primit de la un parinte si sa il paseze mai departe (forward) catre un element HTML nativ din interiorul sau.\n\nCand este necesar:\n- In biblioteci de componente refolosibile (design systems): butoane, campuri input, dropdowns.\n- Cand o componenta parinte trebuie sa puna focus, sa masoare dimensiunea sau sa faca scroll pe un nod DOM aflat in interiorul unei componente reutilizabile copil.",
    codeSnippet: `// Copil: foloseste forwardRef pentru a expune nodul <input> parintelui
const CustomInput = React.forwardRef(function CustomInput(props, ref) {
  return (
    <div className="input-wrapper">
      <input ref={ref} {...props} className="border p-2 rounded" />
    </div>
  );
});

// Parinte: poate pune focus direct pe input-ul din interiorul lui CustomInput
function ParentForm() {
  const inputRef = useRef(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div>
      <CustomInput ref={inputRef} placeholder="Tasteaza aici..." />
      <button onClick={focusInput}>Focus</button>
    </div>
  );
}`,
    interviewTrap: "In viitorul React 19, \"ref\" va fi disponibil direct ca o proprietate normala in props, facand React.forwardRef treptat redundant, insa ramane un concept fundamental in intrebarile de interviu pentru React 18 si codebases existente.",
    keyTakeaway: "React.forwardRef permite componentelor custom sa transmita o referinta DOM primita de la parinte catre un element nativ din subarborele lor."
  },
  {
    id: "react-45",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useImperativeHandle: Limitarea si expunerea metodelor din ref",
    question: "Ce face hook-ul useImperativeHandle si cum te ajuta sa ascunzi detaliile interne ale nodului DOM de componenta parinte?",
    answer: "In mod normal, cand folosesti forwardRef, componenta parinte primeste acces complet si neingradit la intregul nod DOM nativ al copilului (putand modifica clase, stiluri, sterge noduri etc.). Acest lucru incalca principiul de incapsulare.\n\nuseImperativeHandle rezolva aceasta problema:\nPermite componentei copil sa personalizeze exact ce metode si proprietati expune catre parinte prin ref, oferind o interfata controlata si curata (ex: expune doar metoda focus() si reset(), fara a da acces la nodul DOM real).",
    codeSnippet: `const CustomModal = React.forwardRef((props, ref) => {
  const [isOpen, setIsOpen] = useState(false);

  // Expunem doar o interfata restransa catre parinte
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false)
  }));

  if (!isOpen) return null;
  return <div className="modal">Continut Modal <button onClick={() => setIsOpen(false)}>Inchide</button></div>;
});

// In parinte:
// modalRef.current.open(); // Apeleaza doar metoda expusa controlat
// modalRef.current nu contine intregul nod DOM!`,
    interviewTrap: "Foloseste useImperativeHandle cat mai rar posibil. In 95% din cazuri, comportamentul unei componente in React ar trebui controlat declarativ prin props (ex: <Modal isOpen={isOpen} />).",
    keyTakeaway: "useImperativeHandle personalizeaza valoarea expusa prin ref, incapsuland nodul DOM si expunand doar comenzi specifice."
  },
  {
    id: "react-46",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useLayoutEffect vs useEffect: Cand masuram DOM-ul?",
    question: "Care este diferenta de temporizare intre useLayoutEffect si useEffect si cand este useLayoutEffect obligatoriu pentru a preveni \"flickering-ul\"?",
    answer: "Diferenta critica este momentul de executie in raport cu desenarea pe ecran a browserului (Screen Paint):\n\n1. useEffect (Standard - Asincron):\n- Se executa DUPA ce browserul a calculat layout-ul si a desenat pixelii pe ecran (After Paint).\n- Nu blocheaza interfata vizuala a utilizatorului.\n- Ideal pentru 99% din efecte: data fetching, abonamente, timere.\n\n2. useLayoutEffect (Sincron):\n- Se executa SINCRON imediat dupa ce React a aplicat mutatiile in DOM, dar INAINTE ca browserul sa picteze pixelii pe ecran (Before Paint).\n- Blocheaza temporar desenarea vizuala pana cand callback-ul se termina.\n\nCand este obligatoriu:\nCand trebuie sa masori proprietati fizice ale DOM-ului (ex: getBoundingClientRect(), inaltimea unui tooltip, pozitia unui popover) si sa aplici imediat o noua pozitionare. Daca ai folosi useEffect, utilizatorul ar vedea elementul sarind de pe o pozitie pe alta pentru o fractiune de secunda (flickering vizual).",
    codeSnippet: `function Tooltip({ targetRect }) {
  const tooltipRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  useLayoutEffect(() => {
    // Masoara dimensiunea reala a tooltip-ului inainte ca browserul sa picteze ecranul!
    const rect = tooltipRef.current.getBoundingClientRect();
    setCoords({
      top: targetRect.top - rect.height - 8,
      left: targetRect.left + (targetRect.width - rect.width) / 2
    });
  }, [targetRect]);

  return <div ref={tooltipRef} style={{ top: coords.top, left: coords.left, position: 'absolute' }}>Tooltip</div>;
}`,
    interviewTrap: "useLayoutEffect este sincron si blocheaza browserul. Daca pui operatii grele sau data fetching in useLayoutEffect, pagina va \"ingheta\" sesizabil la fiecare randare.",
    keyTakeaway: "useLayoutEffect ruleaza sincron inainte de desenarea pixelilor pe ecran; foloseste-l strict pentru masuratori si calibrari de pozitie in DOM pentru a evita flickering-ul."
  },
  {
    id: "react-47",
    category: "REACT",
    difficulty: "USOR",
    title: "Default Props in Componente Functionale",
    question: "Cum se definesc valorile implicite pentru props in componente functionale moderne si de ce defaultProps este considerat invechit?",
    answer: "In trecut, React folosea proprietatea statica Component.defaultProps pentru a defini valori implicite.\n\nAbordarea Moderna (Standard ES6):\nFolosirea directa a parametrilor impliciti din JavaScript (Destructuring Default Values) direct in semnatura functiei.\n\nDe ce este preferata varianta moderna:\n1. Este JavaScript standard nativ (nu necesita logica sau proprietati speciale React).\n2. Ofera suport excelent pentru TypeScript fara tipizari aditionale complexe.\n3. Suportul pentru defaultProps pe componente functionale este depreciat oficial de echipa React in versiunile recente.",
    codeSnippet: `// MODERNA & RECOMANDATA (Default parameters ES6):
function Badge({ variant = 'primary', count = 0, isPill = false }) {
  return (
    <span className={\`badge badge-\${variant} \${isPill ? 'pill' : ''}\`}>
      {count}
    </span>
  );
}

// INVECHITA (Nu se mai recomanda pe componente functionale):
// Badge.defaultProps = { variant: 'primary', count: 0 };`,
    interviewTrap: "Atentie la valorile null! Valorile implicite din JavaScript se activeaza doar cand prop-ul este undefined. Daca parintele trimite explicit count={null}, valoarea nu va fi inlocuita cu 0.",
    keyTakeaway: "Foloseste intotdeauna default destructuring parameters din ES6 in semnatura componentei pentru a defini valori implicite pentru props."
  },
  {
    id: "react-48",
    category: "REACT",
    difficulty: "USOR",
    title: "Callback Props: Cum transmitem date de la copil la parinte?",
    question: "Daca in React datele curg doar de sus in jos (de la parinte la copil), cum poate o componenta copil sa trimita date inapoi catre parinte?",
    answer: "Copilul trimite date catre parinte prin intermediul \"Callback Props\" (functii transmise ca proprietati de la parinte catre copil).\n\nFluxul de lucru:\n1. Parintele defineste o functie care primeste date ca argumente (ex: handleFilterChange(newFilter)).\n2. Parintele transmite referinta acestei functii catre copil ca un prop (ex: <FilterPanel onFilterChange={handleFilterChange} />).\n3. Componenta copil apeleaza aceasta functie la momentul dorit (ex: cand utilizatorul selecteaza o optiune) si ii paseaza datele dorite ca parametri.\n4. Parintele primeste datele in interiorul functiei sale si isi poate actualiza starea locala.",
    codeSnippet: `// Parinte
function JobTracker() {
  const [selectedCity, setSelectedCity] = useState('All');

  return (
    <div>
      <CityFilter onCitySelect={(city) => setSelectedCity(city)} />
      <p>Oras selectat: {selectedCity}</p>
    </div>
  );
}

// Copil
function CityFilter({ onCitySelect }) {
  return (
    <select onChange={(e) => onCitySelect(e.target.value)}>
      <option value="Bucuresti">Bucuresti</option>
      <option value="Cluj">Cluj</option>
      <option value="Remote">Remote</option>
    </select>
  );
}`,
    interviewTrap: "Nu apela functia callback direct in JSX in timpul randarii (<button onClick={onCitySelect(\"Cluj\")}>), deoarece se va executa instant la render! Foloseste o functie anonima (<button onClick={() => onCitySelect(\"Cluj\")}>).",
    keyTakeaway: "Datele urca de la copil la parinte prin apelarea functiilor callback transmise de parinte prin props."
  },
  {
    id: "react-49",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useSyncExternalStore in React 18: Conectarea la store-uri externe",
    question: "Ce este useSyncExternalStore introdus in React 18 si ce problema rezolva in bibliotecile de state management?",
    answer: "useSyncExternalStore este un hook conceput pentru autorii de biblioteci (precum Redux, Zustand) pentru a citi si a se abona la surse externe de date din afara React intr-un mod compatibil cu \"Concurrent Rendering\".\n\nCe problema rezolva (Tearing):\nIn React 18, randarea concurenta poate fi intrerupta si reluata. Daca o sursa externa de date se modifica in mijlocul procesului de randare, o parte din componente ar putea citi valoarea veche, iar alta parte valoarea noua, ducand la \"tearing\" (inconsecventa vizuala in ecran).\nuseSyncExternalStore garanteaza citiri strict sincrone si consistente ale store-ului extern.",
    codeSnippet: `import { useSyncExternalStore } from 'react';

// Exemplu: abonare sigura la statusul retelei din browser
function subscribe(callback) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

function useNetwork() {
  return useSyncExternalStore(subscribe, getSnapshot);
}`,
    interviewTrap: "getSnapshot trebuie sa returneze o valoare imutabila sau o referinta stabila (primitive sau obiect memorat). Daca returnezi un obiect nou la fiecare apel de getSnapshot, React va intra intr-o bucla infinita de re-randari!",
    keyTakeaway: "useSyncExternalStore previne fenomenul de \"tearing\" in modul concurent prin sincronizarea atomica a componentelor cu store-uri non-React."
  },
  {
    id: "react-50",
    category: "REACT",
    difficulty: "USOR",
    title: "Bucla Infinita de Render: De ce nu apelam setState direct in corpul functiei?",
    question: "De ce apelarea functiei setState direct in corpul principal al unei componente duce la eroarea \"Too many re-renders\" si cum o eviti?",
    answer: "Mecanismul buclei infinite:\n1. React incepe sa randeze componenta.\n2. In corpul functiei, intalneste setCount(1).\n3. setCount semnaleaza catre React ca starea s-a schimbat si ca este necesar un nou render.\n4. React declanseaza imediat un nou render.\n5. In noul render, intalneste din nou setCount(1).\n6. Pasii se repeta la nesfarsit intr-o fractiune de secunda pana cand React detecteaza bucla si opreste executia cu eroarea: \"Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.\"\n\nUnde trebuie apelat setState:\n- In event handlers (onClick, onChange, onSubmit) declansate de interactiunea utilizatorului.\n- In interiorul unui useEffect cu un array de dependinte calibrat corespunzator.",
    codeSnippet: `// GRESIT (Bucla infinita imediata!):
function BadComponent() {
  const [data, setData] = useState(null);
  setData({ loaded: true }); // NU apela setState direct in corpul functiei!
  return <div>Date</div>;
}

// CORECT (Apelat controlat dupa mount intr-un efect):
function GoodComponent() {
  const [data, setData] = useState(null);
  useEffect(() => {
    setData({ loaded: true });
  }, []); // Ruleaza o singura data la montare
  return <div>{data?.loaded ? 'Incarcat' : 'In asteptare'}</div>;
}`,
    interviewTrap: "O variatie frecventa a acestei capcane este scrierea onClick={handleClick()} cu paranteze rotunde in loc de onClick={handleClick} sau onClick={() => handleClick()}. Parantezele apeleaza functia instant in timpul randarii!",
    keyTakeaway: "Nu apela niciodata setState direct in timpul randarii; apeleaza-l doar in event handlers sau in useEffect."
  },
  {
    id: "react-51",
    category: "REACT",
    difficulty: "USOR",
    title: "React Router v6: BrowserRouter, Routes si Route",
    question: "Care este rolul componentelor BrowserRouter, Routes si Route in React Router v6 si cum structurezi navigarea intr-o aplicatie SPA?",
    answer: "React Router permite navigarea intre diferite vederi intr-o aplicatie Single Page Application (SPA) fara reincarcarea paginii HTML de catre browser.\n\nComponente fundamentale in v6:\n1. BrowserRouter: Infasoara intreaga aplicatie si sincronizeaza interfata cu URL-ul curent din browser folosind History API din HTML5.\n2. Routes: Inlocuitorul vechiului <Switch>. Analizeaza toate rutele copil si o alege pe cea mai buna prin algoritmul de \"Best Match Scoring\" (nu mai e nevoie de prop-ul \"exact\").\n3. Route: Asociaza o cale URL (path) cu o componenta vizuala (prop-ul element={<Component />}).",
    codeSnippet: `import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetails />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}`,
    interviewTrap: "In React Router v6, proprietatea pentru randarea componentei este obligatoriu element={<MyComponent />}, si NU component={MyComponent} cum era in versiunea v5!",
    keyTakeaway: "BrowserRouter activeaza rutarea bazata pe istoricul browserului, iar Routes selecteaza automat componenta asociata rutei curente."
  },
  {
    id: "react-52",
    category: "REACT",
    difficulty: "USOR",
    title: "React Router: Link vs tag-ul nativ <a>",
    question: "De ce folosim componenta <Link> sau <NavLink> din React Router in loc de tag-ul nativ HTML <a href=\"...\">?",
    answer: "1. Tag-ul nativ <a href=\"/jobs\">:\n- Cand utilizatorul da click, browserul face un \"Full Page Refresh\".\n- Solicita din nou de la server fisierul HTML, re-descarca scripturile JS, re-aplica stilurile CSS si pierde toata starea curenta din memorie (Redux, Context, useState)!\n\n2. Componenta <Link to=\"/jobs\"> din React Router:\n- Intercepteaza evenimentul de click prin e.preventDefault().\n- Schimba URL-ul in bara de adrese folosind window.history.pushState.\n- Re-randeaza doar componentele necesare din Virtual DOM fara niciun refresh de pagina si pastreaza intacta toata starea aplicatiei din memorie.\n\nBonus: <NavLink> adauga automat o clasa \"active\" pe link-ul corespunzator paginii curente, util pentru meniuri.",
    codeSnippet: `import { Link, NavLink } from 'react-router-dom';

// 1. Link simplu
<Link to="/profile">Profilul Meu</Link>

// 2. NavLink cu stil dinamic pentru pagina activa
<NavLink 
  to="/jobs" 
  className={({ isActive }) => isActive ? 'text-blue-600 font-bold' : 'text-gray-600'}
>
  Lista Joburi
</NavLink>`,
    interviewTrap: "Daca ai nevoie sa faci un link catre un site extern (ex: google.com sau github.com), foloseste tag-ul nativ <a> cu target=\"_blank\" rel=\"noopener noreferrer\", nu <Link>!",
    keyTakeaway: "Componenta Link pastreaza aplicatia ca un SPA veritabil, comutand rutele instant fara reincarcarea paginii si fara pierderea starii din memorie."
  },
  {
    id: "react-53",
    category: "REACT",
    difficulty: "USOR",
    title: "useNavigate: Navigare Programatica in React Router",
    question: "Cum folosesti hook-ul useNavigate pentru a redirectiona utilizatorul programatic (ex: dupa autentificare sau dupa salvarea unui formular)?",
    answer: "useNavigate este hook-ul modern din React Router v6 care inlocuieste vechiul obiect useHistory.\n\nReturneaza o functie de navigare pe care o poti apela in orice handler sau efect:\n1. Navigare simpla catre o ruta: navigate(\"/dashboard\").\n2. Navigare cu inlocuire de istoric (replace): navigate(\"/login\", { replace: true }) - util dupa autentificare sau stergere de cont, astfel incat butonul de Back din browser sa nu intoarca utilizatorul la o pagina invalida.\n3. Navigare relativa in istoric: navigate(-1) pentru pagina anterioara (Back) sau navigate(1) pentru Forward.\n4. Transmitere de stare ascunsa: navigate(\"/success\", { state: { orderId: 123 } }).",
    codeSnippet: `import { useNavigate } from 'react-router-dom';

function JobApplicationForm() {
  const navigate = useNavigate();

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const success = await submitApplication();
    if (success) {
      // Redirectioneaza programatic catre pagina de confirmare
      navigate('/jobs/success', { replace: true });
    }
  };

  return <form onSubmit={handleFormSubmit}><button type="submit">Aplica</button></form>;
}`,
    interviewTrap: "Nu folosi window.location.href = \"/dashboard\" intr-o aplicatie React Router, deoarece va declansa o reincarcare completa a paginii din browser!",
    keyTakeaway: "useNavigate permite redirectionarea utilizatorului din cod JavaScript dupa finalizarea actiunilor asincrone fara refresh de browser."
  },
  {
    id: "react-54",
    category: "REACT",
    difficulty: "USOR",
    title: "useParams: Preluarea Parametrilor Dinamici din URL",
    question: "Cum citesti parametrii dinamici dintr-o ruta de tipul /jobs/:id folosind hook-ul useParams?",
    answer: "Cand definesti o ruta cu segmente dinamice (prefixate cu doua puncte :paramName), React Router captureaza acele valori din adresa URL curenta.\n\nHook-ul useParams returneaza un obiect cheie-valoare in care cheile sunt numele parametrilor declarati in ruta, iar valorile sunt string-urile preluate din URL.\n\nExemplu:\nPentru ruta <Route path=\"/jobs/:jobId\" element={<JobDetails />} /> si accesarea URL-ului /jobs/42, hook-ul useParams() va returna { jobId: \"42\" }.",
    codeSnippet: `import { useParams } from 'react-router-dom';

function JobDetails() {
  const { jobId } = useParams(); // Extrage direct valoarea din URL

  useEffect(() => {
    // jobId vine intotdeauna ca string! Converteste la numar daca e cazul
    fetchJobById(Number(jobId));
  }, [jobId]);

  return <div>Detalii pentru jobul #{jobId}</div>;
}`,
    interviewTrap: "Parametrii returnati de useParams sunt INTOTDEAUNA de tip string! Daca faci comparatii stricte (jobId === 42) in loc de (Number(jobId) === 42), comparatia va fi falsa.",
    keyTakeaway: "useParams extrage usor segmentele variabile din URL-ul paginii, oferind valorile sub forma de string-uri."
  },
  {
    id: "react-55",
    category: "REACT",
    difficulty: "USOR",
    title: "useSearchParams: Gestionarea Query Parameters (?filter=...&page=...)",
    question: "Cum gestionezi parametrii de cautare (Query Strings) in React Router v6 folosind hook-ul useSearchParams?",
    answer: "useSearchParams functioneaza asemanator cu hook-ul useState, dar stocheaza si sincronizeaza datele direct in query string-ul din bara de adrese a browserului (ex: /jobs?search=react&remote=true).\n\nReturneaza o pereche [searchParams, setSearchParams]:\n1. searchParams: O instanta a obiectului standard web URLSearchParams. Poti citi valori folosind searchParams.get(\"key\").\n2. setSearchParams: O functie pentru actualizarea query string-ului: setSearchParams({ search: \"java\", page: \"2\" }).\n\nAvantaj major:\nFiltrele si paginatia raman in URL, ceea ce inseamna ca utilizatorul poate da share la link sau refresh si va gasi exact aceleasi rezultate filtrate!",
    codeSnippet: `import { useSearchParams } from 'react-router-dom';

function JobFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentCategory = searchParams.get('category') || 'ALL';

  const handleCategorySelect = (category) => {
    setSearchParams({ category, page: '1' });
  };

  return (
    <div>
      <p>Categorie activa: {currentCategory}</p>
      <button onClick={() => handleCategorySelect('FRONTEND')}>Frontend</button>
      <button onClick={() => handleCategorySelect('BACKEND')}>Backend</button>
    </div>
  );
}`,
    interviewTrap: "searchParams.get() returneaza null daca parametrul nu exista in URL. Ofera intotdeauna o valoare de rezerva (fallback) folosind operatorul || sau ??.",
    keyTakeaway: "useSearchParams pastreaza filtrele si starea de cautare direct in URL, facand paginile usor de partajat prin link."
  },
  {
    id: "react-56",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Protected Routes Pattern in React Router",
    question: "Cum implementezi un mecanism de \"Protected Routes\" pentru a restrictiona accesul utilizatorilor neautentificati la anumite pagini?",
    answer: "Protected Route este o componenta wrapper care verifica starea de autentificare a utilizatorului inainte de a randa componenta dorita.\n\nFluxul standard:\n1. Citeste starea de autentificare (dintr-un AuthContext sau store global).\n2. Daca utilizatorul este autentificat: randeaza componenta protejata (prin <Outlet /> sau props.children).\n3. Daca utilizatorul NU este autentificat: il redirectioneaza catre pagina de login folosind componenta <Navigate to=\"/login\" replace state={{ from: location }} />.\n4. Proprietatea \"state\" memoreaza pagina de unde a venit utilizatorul pentru a-l redirectiona inapoi acolo dupa login reusit.",
    codeSnippet: `import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Verificare sesiune...</div>;
  }

  if (!user) {
    // Salveaza ruta curenta in state pentru redirect inapoi dupa login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />; // Randeaza rutele copil protejate
}

// In configuratia rutelor:
// <Route element={<ProtectedRoute />}>
//   <Route path="/dashboard" element={<Dashboard />} />
//   <Route path="/settings" element={<Settings />} />
// </Route>`,
    interviewTrap: "Nu uita sa gestionezi starea initiala de incarcare (isLoading)! Daca userul este initial null pana cand raspunde cererea de verificare token de la backend, aplicatia ar putea face redirect gresit la login pentru o secunda.",
    keyTakeaway: "Protected Routes impiedica accesul la pagini private prin verificarea starii de auth si redirectionarea cu <Navigate to=\"/login\" />."
  },
  {
    id: "react-57",
    category: "REACT",
    difficulty: "USOR",
    title: "Nested Routes si componenta <Outlet> in React Router",
    question: "Ce sunt Nested Routes si ce rol are componenta <Outlet /> in crearea de layout-uri partajate (Shared Layouts)?",
    answer: "Nested Routes (Rute imbricate) permit definirea unor rute in interiorul altor rute pentru a reflecta structuri vizuale ierarhice (ex: un Dashboard cu Sidebar fix si o zona centrala variabila).\n\nComponenta <Outlet />:\nEste un \"placeholder\" (locas) plasat in componenta parinte de layout. React Router stie sa randeze in interiorul lui <Outlet /> exact componenta corespunzatoare sub-rutei copil active.\n\nBeneficiu:\nLayout-ul parinte (meniul, bara de navigare, footer-ul) ramane montat si nu se re-randeaza la navigarea intre sub-pagini, pastrandu-si starea si scroll-ul intacte.",
    codeSnippet: `import { Routes, Route, Outlet, Link } from 'react-router-dom';

function DashboardLayout() {
  return (
    <div className="flex">
      <aside className="w-64 bg-gray-100 p-4">
        <Link to="/dashboard/stats">Statistici</Link>
        <Link to="/dashboard/profile">Profil</Link>
      </aside>
      <main className="flex-1 p-6">
        {/* Componenta copil activa va aparea exact aici */}
        <Outlet />
      </main>
    </div>
  );
}

// Configurare rute:
// <Route path="/dashboard" element={<DashboardLayout />}>
//   <Route index element={<DashboardHome />} />
//   <Route path="stats" element={<StatsView />} />
//   <Route path="profile" element={<ProfileView />} />
// </Route>`,
    interviewTrap: "Daca uiti sa plasezi <Outlet /> in componenta de layout, rutele copil nu vor aparea niciodata pe ecran, chiar daca URL-ul din browser se schimba corect!",
    keyTakeaway: "<Outlet /> actioneaza ca o fereastra in interiorul layout-ului parinte prin care se randeaza continutul sub-rutelor active."
  },
  {
    id: "react-58",
    category: "REACT",
    difficulty: "MEDIU",
    title: "TanStack Query (React Query): De ce inlocuieste data fetching-ul manual cu useEffect?",
    question: "De ce este considerata folosirea lui useEffect pentru data fetching un anti-pattern in aplicatii moderne si ce avantaje aduce TanStack Query?",
    answer: "Problemele data fetching-ului manual cu useEffect:\n1. Boilerplate masiv: Trebuie sa creezi manual 3 stari pentru fiecare request: data, isLoading, isError.\n2. Lipsa cache-ului: Daca navighezi pe alta pagina si revii, datele sunt descarcate din nou de la zero.\n3. Race conditions si requests duplicat la tastare rapida sau comutari de tab-uri.\n4. Fara sincronizare in background la re-focalizarea ferestrei.\n\nCe aduce TanStack Query (Server State Management):\n- Caching automat si inteligent.\n- Eliminarea cererilor duplicat (Request Deduplication).\n- Refetch automat cand utilizatorul revine in tab-ul aplicatiei (refetchOnWindowFocus).\n- Stari gata furnizate: isLoading, isError, data, error.\n- Paginare, Infinite Scrolling si Optimistic Updates out-of-the-box.",
    codeSnippet: `import { useQuery } from '@tanstack/react-query';

function JobList() {
  // O singura linie inlocuieste zeci de linii de useEffect, useState si try/catch!
  const { data: jobs, isLoading, isError, error } = useQuery({
    queryKey: ['jobs'],
    queryFn: async () => {
      const res = await fetch('/api/jobs');
      if (!res.ok) throw new Error('Eroare la incarcarea joburilor');
      return res.json();
    }
  });

  if (isLoading) return <div>Se incarca joburile...</div>;
  if (isError) return <div>Eroare: {error.message}</div>;

  return <ul>{jobs.map(j => <li key={j.id}>{j.title}</li>)}</ul>;
}`,
    interviewTrap: "React Query gestioneaza Server State (date de pe backend). Nu il folosi pentru starea pur client-side a interfetei (ex: daca un modal este deschis sau inchis).",
    keyTakeaway: "TanStack Query elimina codul repetitiv de fetch din useEffect, adaugand caching automat, deduplicare si re-sincronizare in fundal."
  },
  {
    id: "react-59",
    category: "REACT",
    difficulty: "MEDIU",
    title: "TanStack Query: Rolul queryKey si invalidarea cache-ului",
    question: "Ce este un queryKey in TanStack Query si cum folosesti queryClient.invalidateQueries pentru a improspata datele dupa o modificare?",
    answer: "1. queryKey (Cheia de interogare):\n- Este un array care identifica unic interogarea in memoria cache (ex: [\"jobs\"], [\"jobs\", jobId], [\"jobs\", { status: \"ACTIVE\" }]).\n- Cand oricare element din queryKey se schimba (ex: se schimba jobId sau filtrul), React Query re-executa automat queryFn si aduce noile date!\n\n2. Invalidarea Cache-ului (invalidateQueries):\nDupa ce un utilizator adauga, modifica sau sterge o resursa (printr-o mutatie), datele din cache-ul frontend-ului devin invechite (stale).\nApeland queryClient.invalidateQueries({ queryKey: [\"jobs\"] }), semnalizezi bibliotecii ca datele respective nu mai sunt valabile. TanStack Query va re-descarca automat noile date in fundal si va actualiza interfata fara reload!",
    codeSnippet: `import { useQueryClient } from '@tanstack/react-query';

function DeleteJobButton({ jobId }) {
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    await fetch(\`/api/jobs/\${jobId}\`, { method: 'DELETE' });

    // Marcheaza cache-ul 'jobs' ca expirat si declanseaza re-fetch automat
    queryClient.invalidateQueries({ queryKey: ['jobs'] });
  };

  return <button onClick={handleDelete}>Sterge Job</button>;
}`,
    interviewTrap: "Asigura-te ca toate variabilele de care depinde functia ta de fetch (filtre, sortari, id-uri) sunt incluse in array-ul queryKey, altfel interogarea nu se va re-executa cand acele valori se schimba.",
    keyTakeaway: "queryKey actioneaza ca identificator de cache si array de dependinte; invalidateQueries declanseaza re-fetch-ul automat al datelor proaspete dupa mutatii."
  },
  {
    id: "react-60",
    category: "REACT",
    difficulty: "MEDIU",
    title: "TanStack Query: useMutation pentru operatii POST / PUT / DELETE",
    question: "Cum functioneaza hook-ul useMutation in TanStack Query si de ce nu folosim useQuery pentru crearea sau stergerea resurselor?",
    answer: "Diferenta esentiala:\n- useQuery: Este destinat cererilor declarative de CITIRE (GET). Ruleaza automat la montarea componentei.\n- useMutation: Este destinat operatiilor de MODIFICARE (POST, PUT, DELETE, PATCH). NU ruleaza automat la montare, ci doar cand apelezi manual functia mutation.mutate(data).\n\nFacilitati oferite de useMutation:\n- Expune stari reactive: isPending (sau isLoading in v4), isSuccess, isError, error.\n- Callback-uri de ciclu de viata: onSuccess, onError, onSettled.\n- Integrare perfecta cu invalidarea de cache.",
    codeSnippet: `import { useMutation, useQueryClient } from '@tanstack/react-query';

function CreateJobModal({ onClose }) {
  const queryClient = useQueryClient();

  const addJobMutation = useMutation({
    mutationFn: async (newJobData) => {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJobData)
      });
      return res.json();
    },
    onSuccess: () => {
      // Dupa salvare cu succes, re-improspateaza lista de joburi si inchide modala
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      onClose();
    },
    onError: (err) => {
      alert('Eroare la salvare: ' + err.message);
    }
  });

  return (
    <button 
      onClick={() => addJobMutation.mutate({ title: 'Junior Dev', salary: 4000 })}
      disabled={addJobMutation.isPending}
    >
      {addJobMutation.isPending ? 'Se salveaza...' : 'Creeaza Job'}
    </button>
  );
}`,
    interviewTrap: "Daca ai nevoie sa astepti rezultatul ca o promisiune (Promise) pentru a face un try/catch local, foloseste mutation.mutateAsync(data) in loc de mutate(data).",
    keyTakeaway: "useMutation este dedicat crearii si modificarii de date; apeleaza functia mutate la interactiunea utilizatorului si invalideaza interogarile dependente pe onSuccess."
  },
  {
    id: "react-61",
    category: "REACT",
    difficulty: "MEDIU",
    title: "TanStack Query: staleTime vs gcTime (fostul cacheTime)",
    question: "Care este diferenta esentiala dintre configuratiile staleTime si gcTime in TanStack Query?",
    answer: "Aceasta este una dintre cele mai frecvente intrebari de interviu despre React Query:\n\n1. staleTime (Timpul cat datele sunt considerate \"proaspete\"):\n- Cat timp o inregistrare din cache este considerata valida si fresh.\n- In mod implicit, staleTime este 0 (adica datele sunt considerate imediat \"stale\" si vor fi re-verificate in background la urmatoarea montare).\n- Daca setezi staleTime: 1000 * 60 * 5 (5 minute), componenta va folosi datele din memorie fara a face niciun apel de retea timp de 5 minute!\n\n2. gcTime / cacheTime (Garbage Collection Time):\n- Cat timp datele inactive (nefolosite de nicio componenta activa de pe ecran) sunt pastrate in memoria RAM inainte de a fi sterse definitiv.\n- In mod implicit este de 5 minute. Daca o componenta se demonteaza si utilizatorul revine inainte de expirarea gcTime, datele apar instant din cache in timp ce se face re-fetch.",
    codeSnippet: `// Exemplu de configurare echilibrata:
const { data } = useQuery({
  queryKey: ['staticReferenceData'],
  queryFn: fetchCategories,
  staleTime: 1000 * 60 * 10, // 10 minute datele sunt proaspete (nu face re-fetch)
  gcTime: 1000 * 60 * 30    // 30 minute datele raman in memorie chiar daca nu sunt afisate
});`,
    interviewTrap: "Daca setezi staleTime mai mare decat gcTime, gcTime va curata datele din memorie inainte ca staleTime sa expire, facand staleTime partial inutil!",
    keyTakeaway: "staleTime controleaza cat timp datele nu necesita re-fetch; gcTime controleaza cat timp datele inactive raman in memorie inainte de a fi eliberate prin garbage collection."
  },
  {
    id: "react-62",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Optimistic Updates: Cum actualizezi UI-ul inainte de raspunsul serverului?",
    question: "Ce este un Optimistic Update si cum il implementezi pentru a oferi utilizatorului o experienta instantanee (ex: buton de Like sau Todo toggle)?",
    answer: "Optimistic Update inseamna actualizarea vizuala a interfetei IMEDIAT ce utilizatorul face o actiune, sub premisa optimista ca serverul va aproba cererea.\n\nEtapele implementarii:\n1. onMutate: Se opresc interogarile in zbor (cancelQueries) pentru a evita suprascrierea. Se salveaza o copie (snapshot) a starii anterioare. Se actualizeaza manual cache-ul cu noua valoare dorita.\n2. onError: Daca cererea de retea esueaza (ex: server offline), se face \"Rollback\" restaurand snapshot-ul salvat si se afiseaza o eroare.\n3. onSettled: La final (indiferent daca a reusit sau a esuat), se apeleaza invalidateQueries pentru a sincroniza 100% starea reala cu baza de date.",
    codeSnippet: `const toggleTodoMutation = useMutation({
  mutationFn: updateTodoOnServer,
  onMutate: async (updatedTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previousTodos = queryClient.getQueryData(['todos']);

    // Actualizam instant cache-ul local (UI se schimba in 0ms)
    queryClient.setQueryData(['todos'], old => 
      old.map(t => t.id === updatedTodo.id ? { ...t, done: !t.done } : t)
    );

    return { previousTodos }; // Returnam snapshot pentru rollback
  },
  onError: (err, newTodo, context) => {
    // In caz de eroare, restauram datele vechi
    queryClient.setQueryData(['todos'], context.previousTodos);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  }
});`,
    interviewTrap: "Daca uiti sa implementezi logica de rollback in onError, utilizatorul va vedea pe ecran o actiune ca fiind finalizata desi pe server operatia a esuat!",
    keyTakeaway: "Optimistic Updates schimba UI-ul instant in 0ms, oferind rollback automat in cazul in care serverul returneaza o eroare."
  },
  {
    id: "react-63",
    category: "REACT",
    difficulty: "USOR",
    title: "Redux Toolkit (RTK): Store, Slice, Reducers si Actions",
    question: "Care sunt conceptele de baza din Redux Toolkit (RTK) si ce problema a rezolvat functia createSlice fata de vechiul Redux clasic?",
    answer: "In trecut, Redux clasic era celebru pentru cantitatea enorma de boilerplate: trebuia sa creezi manual fisiere separate de action types, action creators si functii switch-case imutabile.\n\nRedux Toolkit (Standardul Oficial Modern):\n1. configureStore: Configureaza store-ul central cu setari implicite optime (Redux DevTools si middleware-ul Redux Thunk activate automat).\n2. createSlice: Unifica actiunile si reducerul intr-un singur loc! Genereaza automat action creators pe baza numelui metodelor definite.\n3. Integrarea Immer: In interiorul reducer-ilor din createSlice, poti scrie cod aparent mutativ (ex: state.count += 1 sau state.todos.push(item)), iar biblioteca Immer il converteste in mod transparent intr-o copie 100% imutabila!",
    codeSnippet: `import { createSlice, configureStore } from '@reduxjs/toolkit';

const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1; // Permis datorita Immer inclus in RTK!
    },
    addAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

export const { increment, addAmount } = counterSlice.actions;
export const store = configureStore({
  reducer: { counter: counterSlice.reducer }
});`,
    interviewTrap: "Codul \"mutativ\" (state.val = 1) functioneaza DOAR in interiorul functiei createSlice din Redux Toolkit datorita lui Immer. Nu scrie niciodata cod de acest fel in useState sau React clasic!",
    keyTakeaway: "Redux Toolkit simplifica masiv Redux prin createSlice, generand automat actiunile si permitand mutatii sigure prin intermediul bibliotecii Immer."
  },
  {
    id: "react-64",
    category: "REACT",
    difficulty: "USOR",
    title: "useSelector si useDispatch in Redux",
    question: "Cum folosesti hook-urile useSelector si useDispatch pentru a conecta componentele la Redux Store?",
    answer: "1. useSelector:\n- Extrage date specifice din arborele global de stare Redux: const count = useSelector((state) => state.counter.value).\n- Compara valoarea returnata anterior cu cea noua prin comparatie stricta (===).\n- Componenta se re-randeaza DOAR daca valoarea selectata s-a schimbat, ignorand modificarile altor proprietati din store!\n\n2. useDispatch:\n- Returneaza functia dispatch din store-ul Redux: const dispatch = useDispatch().\n- Folosit pentru a trimite actiuni catre reducere: dispatch(increment()) sau dispatch(addAmount(10)).\n- Referinta functiei dispatch este stabila garantat si nu se schimba niciodata.",
    codeSnippet: `import { useSelector, useDispatch } from 'react-redux';
import { increment, addAmount } from './counterSlice';

function CounterWidget() {
  const count = useSelector((state) => state.counter.value);
  const dispatch = useDispatch();

  return (
    <div>
      <span>Valoare curenta: {count}</span>
      <button onClick={() => dispatch(increment())}>+1</button>
      <button onClick={() => dispatch(addAmount(5))}>+5</button>
    </div>
  );
}`,
    interviewTrap: "Daca returnezi un obiect nou dintr-un selector fara a folosi un comparator (ex: useSelector(state => ({ a: state.a, b: state.b }))), componenta se va re-randa la absolut orice actiune din intregul store! Selecteaza campurile individual sau foloseste shallowEqual.",
    keyTakeaway: "useSelector citeste datele relevante din store si declanseaza re-render doar la modificari reale; useDispatch trimite actiuni pentru a actualiza starea."
  },
  {
    id: "react-65",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Comparatie State Management: Context API vs Redux Toolkit vs Zustand",
    question: "Cum alegi intre Context API, Redux Toolkit si Zustand pentru gestionarea starii intr-o aplicatie React?",
    answer: "Ghid practic de selectie la interviu:\n\n1. React Context API:\n- Nativ (fara dependinte npm).\n- Ideal pentru date globale cu frecventa MICA de modificare: autentificare curenta, tema dark/light, limba selectata (i18n).\n- Contraindicat pentru date care se actualizeaza rapid (re-randeaza toti consumatorii).\n\n2. Zustand:\n- Biblioteca moderna, extrem de usoara (~1kB) si fara boilerplate.\n- Nu necesita niciun <Provider> la radacina aplicatiei; starea poate fi citita si din afara componentelor React.\n- Are mecanism excelent de selectare fina a proprietatilor pentru a preveni re-randarile.\n- Alegerea numarul 1 in majoritatea proiectelor moderne noi!\n\n3. Redux Toolkit (RTK):\n- Solutia standard enterprise pentru aplicatii uriase cu zeci de dezvoltatori.\n- Ecosistem matur de middleware, persistenta, si cel mai puternic debugger (Redux DevTools cu time-travel).",
    codeSnippet: `// Sumar de alegere rapida:
// Tema/Auth simplu           -> Context API
// Proiect nou / aplicatie medie -> Zustand
// Enterprise / Fintech complex  -> Redux Toolkit + RTK Query`,
    interviewTrap: "Nu folosi Redux Toolkit doar pentru a salva 2 variabile globale. Overhead-ul arhitectural trebuie justificat de complexitatea aplicatiei.",
    keyTakeaway: "Context este pentru setari globale rar schimbate, Zustand ofera viteza maxima si simplitate, iar Redux Toolkit exceleaza in sisteme enterprise mari."
  },
  {
    id: "react-66",
    category: "REACT",
    difficulty: "USOR",
    title: "Zustand: Crearea unui Store Global Minimalist",
    question: "Cum creezi si consumi un store global folosind biblioteca Zustand si de ce este atat de apreciata fata de solutiile clasice?",
    answer: "Zustand foloseste un model bazat pe hook-uri simple si functia create.\n\nDe ce este apreciat:\n1. Zero Boilerplate: Nu ai nevoie de reducers, actions, action types sau Provider wrappers.\n2. Subscriptii atomice: O componenta se aboneaza doar la bucatica exacta de stare de care are nevoie (prin functia selector).\n3. Poate fi utilizat si citit chiar si in functii JavaScript simple non-React (store.getState()).",
    codeSnippet: `import { create } from 'zustand';

// 1. Creare store
export const useJobStore = create((set) => ({
  appliedCount: 0,
  savedJobs: [],
  applyJob: (job) => set((state) => ({
    appliedCount: state.appliedCount + 1,
    savedJobs: [...state.savedJobs, job]
  })),
  clearSaved: () => set({ savedJobs: [] })
}));

// 2. Consumare in componenta:
function JobCounter() {
  // Se aboneaza strict la 'appliedCount'
  const appliedCount = useJobStore((state) => state.appliedCount);
  const applyJob = useJobStore((state) => state.applyJob);

  return <button onClick={() => applyJob({ id: 1 })}>Aplicat ({appliedCount})</button>;
}`,
    interviewTrap: "Daca apelezi const store = useJobStore() fara a trece o functie selector, componenta ta se va re-randa la orice modificare din intregul store!",
    keyTakeaway: "Zustand ofera state management global fara Provider si cu boilerplate minim, optimizand re-randarile prin selectoare precise."
  },
  {
    id: "react-67",
    category: "REACT",
    difficulty: "USOR",
    title: "TypeScript in React: Tipizarea Props-urilor cu interface",
    question: "Cum declari si tipizezi proprietatile (props) unei componente React folosind TypeScript si de ce este importanta tipizarea?",
    answer: "Tipizarea proprietatilor asigura verificarea statica a codului in timpul dezvoltarii, oferind autocompletion in IDE si prevenind erorile runtime produse de transmiterea de date invalide sau lipsa unor props obligatorii.\n\nReguli de declarare:\n1. Se defineste o interfata (interface Props) sau type alias.\n2. Proprietatile optionale sunt marcate cu semnul intrebarii (ex: subtitle?: string).\n3. Functiile callback se tipizeaza specificand parametrii si tipul returnat (ex: onSelect: (id: string) => void).\n4. Se face destructuring direct in semnatura functiei cu asocierea tipului.",
    codeSnippet: `interface JobCardProps {
  id: string;
  title: string;
  salary?: number; // Optional
  tags: string[];
  onApply: (jobId: string) => void;
}

export function JobCard({ id, title, salary = 0, tags, onApply }: JobCardProps) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {salary > 0 && <p>Salariu: \${salary}</p>}
      <button onClick={() => onApply(id)}>Aplica</button>
    </div>
  );
}`,
    interviewTrap: "Nu folosi tipul \"any\" pentru props! Folosirea lui \"any\" anuleaza complet toate beneficiile oferite de TypeScript.",
    keyTakeaway: "Defineste o interfata TypeScript clara pentru props pentru a obtine validare la compilare si autocompletion in editor."
  },
  {
    id: "react-68",
    category: "REACT",
    difficulty: "USOR",
    title: "TypeScript in React: Tipizarea Evenimentelor DOM",
    question: "Cum tipizezi corect evenimentele DOM din React (onChange, onClick, onSubmit) in TypeScript?",
    answer: "React ofera tipuri generice speciale pentru fiecare eveniment sintetic, parametrizate cu tipul elementului HTML pe care este atasat listenerul:\n\n1. Input Change: React.ChangeEvent<HTMLInputElement>\n2. Textarea Change: React.ChangeEvent<HTMLTextAreaElement>\n3. Form Submit: React.FormEvent<HTMLFormElement> sau React.FormEvent\n4. Button Click: React.MouseEvent<HTMLButtonElement>\n5. Keyboard: React.KeyboardEvent<HTMLInputElement>",
    codeSnippet: `function SearchBox() {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Text introdus:', e.target.value);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Formular trimis');
  };

  return (
    <form onSubmit={handleFormSubmit}>
      <input type="text" onChange={handleInputChange} />
      <button type="submit">Cauta</button>
    </form>
  );
}`,
    interviewTrap: "Daca definesti functia inline in JSX (<input onChange={(e) => ...} />), TypeScript deduce automat tipul corect al lui \"e\" fara sa fie nevoie sa il scrii manual! Tipizarea explicita este necesara doar cand declari functia handler separat.",
    keyTakeaway: "Foloseste tipurile sintetice generice precum React.ChangeEvent<HTMLInputElement> pentru a avea autocompletion complet pe proprietatile evenimentului."
  },
  {
    id: "react-69",
    category: "REACT",
    difficulty: "USOR",
    title: "TypeScript in React: Tipizarea hook-ului useState cu Generice",
    question: "Cand poate deduce TypeScript automat tipul starii dintr-un useState si cand este obligatoriu sa folosim un parametru generic (useState<T>)?",
    answer: "1. Inferenta automata (Tip dedus):\nCand starea initiala este o valoare primitiva simpla (numar, boolean, string), TypeScript deduce automat tipul corect:\n- const [count, setCount] = useState(0); // count este dedus ca number\n- const [isOpen, setIsOpen] = useState(false); // dedus ca boolean\n\n2. Specificare explicita cu Generice (useState<Type>):\nEste obligatorie in doua situatii cheie:\n- Cand starea poate fi initial nula sau nedefinita pana la incarcarea datelor de la backend: useState<User | null>(null).\n- Cand starea este un array initial gol: useState<Job[]>([]) - fara generic, TypeScript ar deduce tipul ca never[] si nu te-ar lasa sa adaugi niciun element in lista!",
    codeSnippet: `interface UserProfile {
  id: string;
  name: string;
  email: string;
}

// 1. Initial null, ulterior obiect User:
const [user, setUser] = useState<UserProfile | null>(null);

// 2. Initial array gol de obiecte:
const [jobs, setJobs] = useState<Job[]>([]);`,
    interviewTrap: "Daca scrii const [data, setData] = useState([]); fara generic, TypeScript deduce tipul ca never[], iar la primul setData([...data, item]) va arunca o eroare de compilare.",
    keyTakeaway: "Foloseste genericele useState<Type | null>(null) si useState<Type[]>([]) pentru stari complexe sau initial goale."
  },
  {
    id: "react-70",
    category: "REACT",
    difficulty: "USOR",
    title: "TypeScript in React: Tipizarea corecta a hook-ului useRef",
    question: "Cum se tipizeaza corect hook-ul useRef pentru referinte catre elemente DOM vs referinte pentru valori mutabile?",
    answer: "In TypeScript exista doua modalitati fundamentale de a folosi useRef:\n\n1. Referinta catre un element DOM:\nTrebuie sa specifici tipul interfetei HTML exacte ca parametru generic si valoarea initiala null: useRef<HTMLInputElement>(null).\nTypeScript va crea un ref cu proprietatea .current \"read-only\" pentru React, permitandu-ti apeluri sigure precum inputRef.current?.focus().\n\n2. Referinta pentru o valoare mutabila (instanta / timer / flag):\nTrebuie sa specifici tipul valorii stocate: useRef<number | null>(null).\nTypeScript iti va permite sa suprascrii proprietatea .current oricand (ex: timerRef.current = 123).",
    codeSnippet: `// 1. DOM Ref (atasat la un <input>):
const inputRef = useRef<HTMLInputElement>(null);

const handleFocus = () => {
  inputRef.current?.focus(); // Operatie sigura cu optional chaining
};

// 2. Mutable Value Ref (pentru retinerea unui timer):
const timerIdRef = useRef<number | null>(null);
timerIdRef.current = window.setInterval(() => {}, 1000);`,
    interviewTrap: "Daca uiti sa pui \"null\" ca valoare initiala la un DOM ref (ex: useRef<HTMLInputElement>()), TypeScript se va plange ca proprietatea current nu este compatibila cu prop-ul \"ref\" al elementului JSX.",
    keyTakeaway: "Pentru elemente din pagina foloseste useRef<HTMLXElement>(null); pentru variabile mutabile foloseste useRef<Tip>(valoareInitiala)."
  },
  {
    id: "react-71",
    category: "REACT",
    difficulty: "USOR",
    title: "React.FC vs Functii Standard cu Props Tipizate",
    question: "De ce este considerata folosirea lui React.FC (FunctionComponent) o practica mai putin recomandata in comparatie cu declararea directa a functiilor?",
    answer: "In versiunile timpurii de TypeScript cu React, multi dezvoltatori foloseau const MyComp: React.FC<Props> = ...\n\nDe ce comunitatea si echipele moderne prefera functiile standard function MyComp({ ... }: Props):\n1. In React 17 si versiunile anterioare, React.FC includea implicit prop-ul \"children\" in orice componenta, chiar daca acea componenta nu trebuia sa accepte copii!\n2. Sintaxa cu React.FC nu functioneaza natural cu componente generice (generics <T>).\n3. Functiile JavaScript clasice (function declarations) ofera o sintaxa mai curata, mai familiara si mesaje de eroare mult mai usor de citit in compilatorul TypeScript.",
    codeSnippet: `// RECOMANDATA (Functie standard cu props tipizate):
interface ButtonProps {
  label: string;
  onClick: () => void;
}

export function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// MAI PUTIN PREFERATA (React.FC):
// export const Button: React.FC<ButtonProps> = ({ label, onClick }) => { ... };`,
    interviewTrap: "Desi React 18 a eliminat prop-ul implicit \"children\" din tipul React.FC, folosirea declaratiilor functionale standard ramane recomandarea de aur in majoritatea ghidurilor de stil moderne.",
    keyTakeaway: "Declara componentele ca functii standard cu props tipizate (function Comp(props: Props)); este mai curat si ofera compatibilitate perfecta cu componentele generice."
  },
  {
    id: "react-72",
    category: "REACT",
    difficulty: "USOR",
    title: "TypeScript: Tipizarea proprietatii children (ReactNode vs ReactElement)",
    question: "Care este diferenta intre React.ReactNode si React.ReactElement la tipizarea prop-ului children?",
    answer: "1. React.ReactNode (Cel mai flexibil si comun):\n- Reprezinta orice poate fi randat legal in interiorul JSX.\n- Include: elemente JSX, string-uri de text, numere, array-uri de noduri, fragmente, booleans sau null/undefined.\n- Este alegerea standard si recomandata in 99% din situatii pentru props.children!\n\n2. React.ReactElement:\n- Reprezinta STRICT un nod JSX creat (obiect de tipul { type, props, key }).\n- NU accepta primitive simple precum text brut (\"salut\") sau numere (123).\n- Folosit doar cand o componenta parinte impune ca un prop sa fie strict un singur element JSX valid.",
    codeSnippet: `import { ReactNode } from 'react';

interface ContainerProps {
  title: string;
  // Permite text, numere, alte componente sau fragmente
  children: ReactNode; 
}

export function Container({ title, children }: ContainerProps) {
  return (
    <div>
      <h2>{title}</h2>
      <div>{children}</div>
    </div>
  );
}`,
    interviewTrap: "Daca folosesti ReactElement pentru children si un utilizator paseaza simplu textul <Container>Titlu</Container>, TypeScript va arunca o eroare! Foloseste intotdeauna ReactNode pentru proprietatea children.",
    keyTakeaway: "ReactNode este tipul universal recomandat pentru children deoarece acopera atat componente JSX, cat si primitive precum text si numere."
  },
  {
    id: "react-73",
    category: "REACT",
    difficulty: "USOR",
    title: "React Testing Library (RTL): Filozofia de testare",
    question: "Care este filozofia de baza din React Testing Library si de ce este superioara testarii detaliilor interne de implementare (precum vechiul Enzyme)?",
    answer: "Principiul fondator RTL formulat de Kent C. Dodds:\n\"The more your tests resemble the way your software is used, the more confidence they can give you.\" (Cu cat testele tale seamana mai mult cu modul in care aplicatia este utilizata de un om real, cu atat mai multa incredere iti ofera).\n\nDe ce am abandonat Enzyme (testarea implementarii):\nEnzyme testa detalii interne: daca starea \"count\" este 1, daca o metoda interna a fost apelata sau daca o componenta copil specifica exista in arbore. Daca refactorizai componenta de la clase la functii cu hooks, testele crapau desi aplicatia functiona perfect pentru utilizator!\n\nCum testeaza RTL:\nRTL interactioneaza cu ecranul exact ca un utilizator uman: gaseste un buton dupa textul de pe el (getByRole(\"button\", { name: /aplica/i })), simuleaza click-ul si verifica daca mesajul de succes a aparut vizibil pe ecran.",
    codeSnippet: `import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Counter } from './Counter';

test('incrementeaza numarul la click pe buton', async () => {
  const user = userEvent.setup();
  render(<Counter />);

  // Cautam butonul asa cum il vede un om sau un screen reader
  const button = screen.getByRole('button', { name: /mareste/i });
  await user.click(button);

  // Verificam rezultatul vizual final
  expect(screen.getByText(/total: 1/i)).toBeInTheDocument();
});`,
    interviewTrap: "Nu testa starea interna (useState) a unei componente! Testeaza ce vede si ce experimenteaza utilizatorul pe ecran in urma unei actiuni.",
    keyTakeaway: "React Testing Library incurajeaza testarea comportamentului din perspectiva utilizatorului final, facand testele rezistente la refactorizari de cod."
  },
  {
    id: "react-74",
    category: "REACT",
    difficulty: "USOR",
    title: "React Testing Library: Ierarhia Interogarilor (getByRole vs getByTestId)",
    question: "Care este ordinea de prioritate recomandata pentru interogari in React Testing Library si cand este permis data-testid?",
    answer: "Ierarhia oficiala de recomandare RTL:\n\n1. Interogari accesibile tuturor (Prioritate maxima):\n- getByRole: Cauta elemente dupa rolul lor accesibil ARIA (button, heading, textbox, checkbox) si nume: screen.getByRole(\"button\", { name: /trimite/i }).\n- getByLabelText: Excelent pentru campurile de formular legate de etichete (<label>).\n- getByPlaceholderText: Pentru input-uri cand label-ul lipseste.\n- getByText: Pentru elemente non-interactive (paragrafe, span-uri).\n\n2. Interogari semantice:\n- getByAltText (pentru imagini), getByTitle.\n\n3. Data-TestId (Ultima solutie / Last Resort):\n- screen.getByTestId(\"custom-element\"): Se foloseste DOAR cand textul este foarte dinamic sau cand elementul nu are niciun rol accesibil sau text stabil.",
    codeSnippet: `// 1. RECOMANDAT (cel mai apropiat de un utilizator real):
const submitBtn = screen.getByRole('button', { name: /salveaza profilul/i });

// 2. EVITA daca e posibil (detaliu intern invizibil utilizatorului):
const submitBtnBad = screen.getByTestId('submit-btn');`,
    interviewTrap: "Folosirea exclusiva de getByTestId ignora complet testarea accesibilitatii aplicatiei! getByRole garanteaza ca elementul tau este accesibil si pentru utilizatorii cu tehnologii asistive (screen readers).",
    keyTakeaway: "Foloseste mereu getByRole ca prima optiune; rezerva data-testid doar pentru cazuri exceptionale cand nu exista text sau roluri semantice accesibile."
  },
  {
    id: "react-75",
    category: "REACT",
    difficulty: "USOR",
    title: "RTL: userEvent vs fireEvent",
    question: "Care este diferenta dintre userEvent si fireEvent in testele React si de ce este userEvent alegerea recomandata?",
    answer: "1. fireEvent:\n- Tranzactioneaza un simplu eveniment DOM sintetic direct (ex: fireEvent.click(button) declanseaza doar evenimentul click).\n- Nu simuleaza comportamentul real al utilizatorului (de exemplu la tastare intr-un input nu declanseaza pe rand keyDown, keyPress, change si keyUp, si nici nu muta focusul pe element!).\n\n2. @testing-library/user-event:\n- O biblioteca construita peste RTL care reproduce fidel lantul complet de interactiuni pe care un om le genereaza in browser.\n- La un click, userEvent muta cursorul, apasa mouse-ul, da focus pe element, ridica mouse-ul si emite click.\n- Toate metodele sale sunt asincrone (returneaza Promise) si trebuie apelate cu \"await\".",
    codeSnippet: `import userEvent from '@testing-library/user-event';

test('completeaza si trimite formularul', async () => {
  const user = userEvent.setup(); // Initializare recomandata inainte de actiuni
  render(<LoginForm />);

  const emailInput = screen.getByRole('textbox', { name: /email/i });
  // Simuleaza tastarea fiecarei litere cu toate evenimentele aferente
  await user.type(emailInput, 'candidat@test.com');

  const submitButton = screen.getByRole('button', { name: /login/i });
  await user.click(submitButton);
});`,
    interviewTrap: "Nu uita cuvantul cheie \"await\" inainte de apelurile userEvent (await user.click(btn)), altfel testul se va termina inainte ca actiunea simulata sa fie procesata!",
    keyTakeaway: "userEvent simuleaza interactiunile umane reale cu toata suita lor de evenimente din browser; este mult mai fidel decat fireEvent."
  },
  {
    id: "react-76",
    category: "REACT",
    difficulty: "MEDIU",
    title: "RTL: Testarea componentelor asincrone cu findBy si waitFor",
    question: "Cum testezi elemente care apar pe ecran dupa un apel asincron folosind findBy si utilitarul waitFor?",
    answer: "RTL ofera trei prefixe pentru fiecare interogare:\n1. getBy...: Cauta elementul sincron. Daca nu il gaseste imediat, arunca eroare si opreste testul.\n2. queryBy...: Cauta sincron. Daca nu il gaseste, returneaza null (ideal pentru a verifica absenta unui element: expect(screen.queryByText(/eroare/i)).not.toBeInTheDocument()).\n3. findBy...: Este ASINCRON. Cauta elementul in mod repetat timp de un timeout configurabil (implicit 1000ms) si returneaza o promisiune (Promise). Folosit pentru elemente care apar dupa fetch sau tranzactii asincrone!\n\nUtilitarul waitFor:\nRuleaza un callback in mod repetat pana cand asertiunile din interiorul sau au succes sau pana la expirarea timeout-ului.",
    codeSnippet: `test('afiseaza lista de joburi dupa incarcarea din API', async () => {
  render(<JobDirectory />);

  // 1. Verificam ca loader-ul este initial prezent
  expect(screen.getByText(/se incarca/i)).toBeInTheDocument();

  // 2. findBy asteapta pana cand jobul apare in interfata
  const jobTitle = await screen.findByText(/Fullstack Java Developer/i);
  expect(jobTitle).toBeInTheDocument();

  // 3. waitFor pentru a verifica disparitia loader-ului
  await waitFor(() => {
    expect(screen.queryByText(/se incarca/i)).not.toBeInTheDocument();
  });
});`,
    interviewTrap: "Nu pune operatii de interactiune (precum user.click) in interiorul callback-ului din waitFor! waitFor trebuie sa contina strict verificari si asertiuni (expect).",
    keyTakeaway: "Foloseste getBy pentru elemente sincrone, queryBy pentru a verifica absenta din ecran, si findBy cu await pentru date asincrone."
  },
  {
    id: "react-77",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Mock Service Worker (MSW): Standardul modern pentru mocking API",
    question: "De ce este Mock Service Worker (MSW) considerat solutia ideala pentru interceptarea cererilor HTTP in teste si dezvoltare?",
    answer: "Problema abordarilor clasice:\nCand faci mock direct pe global.fetch sau pe functiile axios (ex: jest.spyOn(axios, \"get\")), testele tale sunt cuplate la biblioteca specifica de retea folosita si pot masca erori legate de headere, serializare sau status coduri.\n\nCe face MSW (Mock Service Worker):\n- Intercepteaza cererile la nivelul retelei de transport (Network Layer) folosind Service Workers in browser sau modulul \"node:http\" in testele Node.js / Vitest.\n- Codul aplicatiei trimite apeluri HTTP absolut reale (cu fetch sau axios) catre adrese reale.\n- MSW intercepteaza traficul si livreaza raspunsuri mockate identice cu cele ale backend-ului real.\n- Aceiasi mock handlers pot fi partajati atat in testele unitare (Vitest/Jest), cat si in timpul dezvoltarii locale in browser!",
    codeSnippet: `// Handlers MSW:
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

export const handlers = [
  http.get('/api/jobs', () => {
    return HttpResponse.json([
      { id: '1', title: 'React Developer' }
    ]);
  })
];

export const server = setupServer(...handlers);

// In setupTests.js:
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());`,
    interviewTrap: "Asigura-te ca apelezi server.resetHandlers() in afterEach(), altfel un mock personalizat setat intr-un test poate \"polua\" urmatoarele teste din suita.",
    keyTakeaway: "MSW intercepteaza cererile direct la nivel de retea, oferind cel mai realist mediu de testare fara a modifica codul sursa al apelurilor fetch."
  },
  {
    id: "react-78",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useTransition in React 18: Gestionarea actualizarilor non-urgente",
    question: "Ce este hook-ul useTransition introdus in React 18 si cum pastreaza interfata fluida la operatii grele de randare?",
    answer: "In React, toate actualizarile de stare erau tratate anterior ca avand aceeasi urgenta maxima.\n\nProblema:\nDaca utilizatorul tasteaza intr-un input, iar la fiecare litera aplicatia filtreaza si randeaza o lista uriasa de 5.000 de elemente, tastatura va parea \"inghetata\" si sacadata pentru ca browserul aloca tot procesorul randarii listei.\n\nSolutia useTransition:\nImparte actualizarile in doua categorii:\n1. Actualizari urgente: Tastarea utilizatorului, click-urile (trebuie sa apara instant pe ecran).\n2. Actualizari non-urgente (Transitions): Filtrarea si re-randarea listei grele.\n\nCand infasori o actualizare de stare in startTransition(() => { setFilter(val); }), React acorda prioritate tastarii si poate intrerupe randarea listei daca utilizatorul apasa o noua tasta!",
    codeSnippet: `import { useState, useTransition } from 'react';

function SearchJobs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredQuery, setFilteredQuery] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleChange = (e) => {
    // 1. Urgent: input-ul se actualizeaza instant
    setSearchTerm(e.target.value);

    // 2. Non-urgent: randarea listei grele poate fi intrerupta daca utilizatorul continua sa tasteze
    startTransition(() => {
      setFilteredQuery(e.target.value);
    });
  };

  return (
    <div>
      <input value={searchTerm} onChange={handleChange} />
      {isPending && <span>Se actualizeaza rezultatele...</span>}
      <HeavyJobList query={filteredQuery} />
    </div>
  );
}`,
    interviewTrap: "startTransition poate fi folosit doar pentru operatii sincrone de setare a starii. Nu pune functii asincrone (setTimeout sau fetch) in interiorul callback-ului sau.",
    keyTakeaway: "useTransition pastreaza aplicatia receptiva la input-ul utilizatorului prin retrogradarea actualizarilor grele de interfata la o prioritate non-urgenta."
  },
  {
    id: "react-79",
    category: "REACT",
    difficulty: "MEDIU",
    title: "useDeferredValue in React 18: Amanarea valorilor la typing",
    question: "Ce face hook-ul useDeferredValue si prin ce se deosebeste fata de useTransition?",
    answer: "useDeferredValue rezolva o problema similara cu useTransition, dar se aplica direct pe o VALOARE (de obicei primita ca prop), nu pe o functie de actualizare de stare.\n\nCum functioneaza:\nPrimeste o valoare si returneaza o copie a acelei valori care se actualizeaza cu o usoara intarziere (deferred).\nLa inceput, React randeaza ecranul cu valoarea veche pentru a pastra browserul rapid, iar in fundal randeaza subarborele cu noua valoare amanata.\n\nDiferenta cheie:\n- useTransition: Se foloseste cand TU controlezi setter-ul de state (ai acces la setState).\n- useDeferredValue: Se foloseste cand primesti valoarea din afara ca prop sau dintr-un custom hook si nu ai acces direct la functia care a declansat modificarea.",
    codeSnippet: `import { useDeferredValue, useMemo } from 'react';

function HeavyResults({ searchTerm }) {
  // Creeaza o versiune cu prioritate redusa a termenului de cautare
  const deferredSearch = useDeferredValue(searchTerm);

  const isStale = searchTerm !== deferredSearch;

  const results = useMemo(() => {
    return runExpensiveFilter(deferredSearch);
  }, [deferredSearch]);

  return (
    <div style={{ opacity: isStale ? 0.6 : 1 }}>
      {results.map(r => <div key={r.id}>{r.title}</div>)}
    </div>
  );
}`,
    interviewTrap: "useDeferredValue nu inlocuieste debounce-ul pentru cereri HTTP externe de retea! Se foloseste strict pentru a optimiza re-randarea elementelor React din client.",
    keyTakeaway: "useDeferredValue amana propagarea unei valori noi catre componentele copil grele pana cand sarcinile urgente din browser sunt finalizate."
  },
  {
    id: "react-80",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Arhitecturi de Randare Web: CSR vs SSR vs SSG",
    question: "Care sunt diferentele cheie intre Client-Side Rendering (CSR), Server-Side Rendering (SSR) si Static Site Generation (SSG)?",
    answer: "1. Client-Side Rendering (CSR - aplicatie clasica Vite/CRA):\n- Serverul livreaza un fisier HTML aproape gol (<div id=\"root\"></div>) si un pachet mare JS.\n- Browserul descarca JS-ul, il executa si genereaza intreg ecranul.\n- Dezavantaje: Timp initial de incarcare lent (First Contentful Paint scazut) si indexare SEO mai dificila.\n\n2. Server-Side Rendering (SSR - Next.js dynamic):\n- La fiecare cerere HTTP a unui utilizator, serverul Node.js ruleaza componentele React, aduce datele din DB si trimite inapoi HTML complet populat.\n- Avantaje: SEO perfect si afisare rapida a textului.\n- Dezavantaj: Incarcare mai mare pe server (fiecare request consuma CPU).\n\n3. Static Site Generation (SSG - Next.js static / Astro):\n- Paginile HTML sunt generate o singura data, in timpul procesului de BUILD.\n- Fisierele statice sunt stocate pe CDN si livrate instantaneu utilizatorilor in cativa milisecunde.\n- Ideal pentru bloguri, documentatii tehnice si pagini de prezentare care nu se schimba la fiecare secunda.",
    codeSnippet: `// Comparatie rapida pe metrici:
// CSR: HTML gol -> Descarca JS -> Render pe telefon/laptop
// SSR: Request -> Server face HTML pe loc -> Browser afiseaza -> Hydration
// SSG: Build time face HTML -> Servit instant din CDN -> Hydration`,
    interviewTrap: "Nu alege automat SSR doar crezand ca e mai modern. Pentru aplicatii interne tip Dashboard sau ATS cu autentificare obligatorie, CSR este de regula mult mai ieftin si mai simplu de intretinut.",
    keyTakeaway: "CSR randeaza totul in browser, SSR genereaza HTML la fiecare cerere pe server pentru SEO, iar SSG pre-construieste pagini statice ultra-rapide la build."
  },
  {
    id: "react-81",
    category: "REACT",
    difficulty: "MEDIU",
    title: "React Server Components (RSC) vs Client Components",
    question: "Ce sunt React Server Components (RSC) si cand este necesara directiva \"use client\"?",
    answer: "React Server Components reprezinta noua paradigma din React (popularizata de Next.js App Router):\n\n1. Server Components (Implicit):\n- Ruleaza EXCLUSIV pe server. Codul lor nu este inclus niciodata in bundle-ul JavaScript trimis catre browser (Zero Bundle Size)!\n- Pot accesa direct baza de date, sistemul de fisiere sau chei secrete API fara a expune datele in frontend.\n- Nu pot folosi hook-uri de interactiune (useState, useEffect) si nici event listeners (onClick).\n\n2. Client Components (marcate cu directiva \"use client\" in prima linie a fisierului):\n- Sunt componentele traditionale React care se randeaza pe server la prima incarcare si apoi se hidrateaza in browser.\n- Au acces complet la starea locala (useState), efecte (useEffect), evenimente de la mouse/tastatura si API-uri de browser (localStorage).",
    codeSnippet: `// 1. Server Component (Ruleaza doar pe server, acces direct la DB):
import db from '@/lib/db';

export default async function JobFeedPage() {
  const jobs = await db.jobs.findMany(); // Query direct fara API intermediar!
  return (
    <div>
      <h1>Joburi Disponibile</h1>
      <JobFilterClient /> {/* Componenta client imbricata */}
      <ul>{jobs.map(j => <li key={j.id}>{j.title}</li>)}</ul>
    </div>
  );
}

// 2. Client Component (fisier separat marcat cu 'use client'):
// 'use client';
// export function JobFilterClient() { const [query, setQuery] = useState(''); ... }`,
    interviewTrap: "Directiva \"use client\" nu inseamna ca componenta se executa doar in browser! Ea randeaza totusi initial pe server in timpul SSR, asa ca nu accesa \"window\" la cel mai inalt nivel.",
    keyTakeaway: "Server Components ruleaza doar pe server cu 0kB impact pe bundle; marchezi cu \"use client\" doar componentele care au nevoie de interactiune, state sau hooks."
  },
  {
    id: "react-82",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Ce este Hydration si cum rezolvi erorile de \"Hydration Mismatch\"?",
    question: "Ce inseamna procesul de \"Hydration\" in aplicatiile cu SSR si care sunt cele mai frecvente cauze ale erorilor de \"Hydration Mismatch\"?",
    answer: "In Server-Side Rendering (SSR), serverul trimite catre browser un schelet HTML static complet pentru ca utilizatorul sa vada continutul instant.\n\nCe este Hydration (Hidratarea):\nEste procesul prin care React ruleaza codul in browser si \"ataseaza\" event listeners (onClick, onChange) si starea interna peste nodurile HTML existente deja pe ecran, transformand paginile statice intr-o aplicatie interactiva.\n\nCe este Hydration Mismatch:\nApare atunci cand arborele HTML generat pe server difera de primul arbore HTML generat pe client!\n\nCauze frecvente:\n1. Utilizarea de timestamp-uri curente: new Date().toLocaleTimeString() (pe server e o ora, pana ajunge in browser s-a schimbat secunda).\n2. Accesarea variabilelor specifice browserului in timpul randarii: typeof window !== \"undefined\" sau localStorage.\n3. HTML invalid conform standardelor web: plasarea unui tag <p> in interiorul altui <p>, sau un tag <div> in interiorul unui <table> fara <tbody>.",
    codeSnippet: `// GRESIT (Produce Hydration Mismatch!):
function BadHeader() {
  return <div>Utilizator: {window.localStorage.getItem('user')}</div>;
}

// CORECT (Citeste starea dupa montarea pe client):
function GoodHeader() {
  const [user, setUser] = useState('');

  useEffect(() => {
    // useEffect ruleaza doar in browser dupa hidratare
    setUser(localStorage.getItem('user') || 'Anonim');
  }, []);

  return <div>Utilizator: {user}</div>;
}`,
    interviewTrap: "In cazuri rare si izolate unde continutul variaza inevitabil (ex: timezone-ul clientului), poti suprima avertismentul folosind atributul suppressHydrationWarning={true}.",
    keyTakeaway: "Hidratarea ataseaza logica interactiva peste HTML-ul pre-randat; asigura-te ca primul render din browser produce exact acelasi HTML ca serverul."
  },
  {
    id: "react-83",
    category: "REACT",
    difficulty: "MEDIU",
    title: "React Hook Form (RHF): Performanta superioara fara re-randari la tastare",
    question: "De ce este React Hook Form considerata solutia standard pentru formulare in aplicatii moderne de productie fata de useState clasic?",
    answer: "Problema formularelor traditionale cu useState:\nFiecare tasta apasata de utilizator intr-un camp input controlat declanseaza o actualizare de stare si, implicit, o re-randare a intregului formular!\nDintr-un formular cu 20 de campuri, tastarea a 50 de caractere va produce 50 de re-randari complete ale tuturor celor 20 de componente de pe ecran, provocand lag vizual pe dispozitive mobile.\n\nAvantajele React Hook Form (RHF):\n1. Uncontrolled by default: Utilizeaza input-uri necontrolate prin intermediul referintelor (refs), ceea ce inseamna ZERO re-randari la tastare!\n2. Pachet minuscul si integrare simpla prin functia register: <input {...register(\"email\")} />.\n3. Suport nativ pentru validare declarativa si scheme de validare (Zod, Yup).\n4. Colectare usoara a valorilor curate la submit (handleSubmit(onSubmit)).",
    codeSnippet: `import { useForm } from 'react-hook-form';

function QuickLoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = (data) => {
    console.log('Date valide:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email', { required: 'Email-ul este obligatoriu' })} />
      {errors.email && <span className="text-red-500">{errors.email.message}</span>}

      <button type="submit">Autentificare</button>
    </form>
  );
}`,
    interviewTrap: "Daca ai totusi nevoie sa asculti in timp real valoarea unui camp pentru a afisa ceva dinamic pe ecran, poti folosi metoda watch(\"fieldName\") din RHF, insa foloseste-o cu precautie.",
    keyTakeaway: "React Hook Form izoleaza actualizarile de stare la nivelul campului individual prin refs, oferind performanta maxima fara re-randarea formularului."
  },
  {
    id: "react-84",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Validarea Formularelor cu React Hook Form si Schema Zod",
    question: "Cum integrezi o schema de validare Zod cu React Hook Form folosind zodResolver?",
    answer: "Separarea validarii de interfata vizuala este o buna practica esentiala.\n\nZod este o biblioteca de declarare si validare a schemelor de date TypeScript-first.\n\nCum functioneaza integrarea:\n1. Definiesti schema de validare cu Zod (reguli de lungime, format email, parole care coincid).\n2. Extragi tipul TypeScript automat din schema: type FormData = z.infer<typeof formSchema>.\n3. Conectezi schema la useForm folosind resolver-ul oficial zodResolver(formSchema).\n4. React Hook Form va valida automat toate campurile conform regulilor Zod inainte de apelarea functiei onSubmit!",
    codeSnippet: `import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Format email invalid'),
  password: z.string().min(8, 'Parola trebuie sa aiba minim 8 caractere')
});

type RegisterFormData = z.infer<typeof registerSchema>;

function RegisterForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = (data: RegisterFormData) => {
    console.log('Date validate cu succes:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} placeholder="Email" />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">Inregistrare</button>
    </form>
  );
}`,
    interviewTrap: "Marele avantaj al utilizarii Zod este ca aceeasi schema de validare poate fi partajata atat pe frontend cat si pe backend (in Node.js/Express/NestJS), garantand reguli de validare identice.",
    keyTakeaway: "Combinatia React Hook Form + Zod ofera formulare performante cu validare tipizata TypeScript si gestionare curata a mesajelor de eroare."
  },
  {
    id: "react-85",
    category: "REACT",
    difficulty: "USOR",
    title: "Prevenirea Memory Leaks la demontarea componentelor in timpul unui Fetch",
    question: "Ce avertisment aparea in trecut cand apelai setState pe o componenta demontata si cum te asiguri ca nu ai scurgeri de memorie la fetch?",
    answer: "In versiunile mai vechi de React, daca lansai o cerere HTTP asincrona si utilizatorul naviga rapid pe alta pagina inainte ca raspunsul sa soseasca, incercarea de a apela setState pe o componenta deja demontata afisa avertismentul:\n\"Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak.\"\n\nDesi in React 18 acest avertisment a fost eliminat (React ignora pur si simplu setState-ul pe componente demontate), operatia asincrona continua sa ruleze in fundal si consuma memorie si banda de retea inutil!\n\nCum se rezolva corect:\nFolosirea unui AbortController pentru a anula efectiv cererea HTTP la nivel de browser cand componenta se demonteaza.",
    codeSnippet: `useEffect(() => {
  const abortController = new AbortController();

  fetch('/api/profile', { signal: abortController.signal })
    .then(res => res.json())
    .then(data => setProfile(data))
    .catch(err => {
      if (err.name !== 'AbortError') {
        console.error(err);
      }
    });

  // Cand utilizatorul paraseste pagina, cererea de retea este oprita imediat
  return () => {
    abortController.abort();
  };
}, []);`,
    interviewTrap: "Folosirea bibliotecilor specializate precum TanStack Query rezolva aceasta problema automat, anuland cererile si gestionand garbage collection-ul fara cod manual de cleanup.",
    keyTakeaway: "Foloseste AbortController in functia de return din useEffect pentru a opri cererile HTTP cand utilizatorul paraseste pagina."
  },
  {
    id: "react-86",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Virtualizarea Listelor Mari (Windowing): De ce randezi doar 10 randuri din 10.000?",
    question: "Ce este tehnica de \"Windowing\" (Virtualizare de liste) si de ce incercarea de a randa 10.000 de elemente simultan blocheaza browserul?",
    answer: "Problema randarii clasice:\nDaca ai un array cu 10.000 de joburi sau tranzactii si faci jobs.map(...), browserul este obligat sa creeze zeci de mii de noduri DOM reale, sa calculeze stiluri si layout pentru fiecare in parte. Memoria explodeaza, iar scroll-ul devine extrem de sacadat.\n\nSolutia: List Virtualization (ex: @tanstack/react-virtual, react-window):\n- Pe ecranul vizibil al utilizatorului incap de regula doar 10-15 randuri la un moment dat (Viewport).\n- Biblioteca de virtualizare randeaza in DOM DOAR acele 10-15 randuri vizibile, plus 2-3 randuri deasupra si dedesubt (overscan buffer).\n- Pe masura ce utilizatorul face scroll, elementele care ies din ecran sunt reciclate sau distruse, iar cele noi sunt inserate dinamic, pastrand inaltimea totala simulata a containerului.\n- Performanta ramane constanta la 60 FPS, indiferent daca ai 100 de randuri sau 1.000.000 de randuri!",
    codeSnippet: `// Concept TanStack Virtual simplificat:
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualJobList({ allJobs }) {
  const parentRef = useRef(null);

  const virtualizer = useVirtualizer({
    count: allJobs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60 // inaltime aproximativa per rand in px
  });

  return (
    <div ref={parentRef} className="h-96 overflow-auto">
      <div style={{ height: \`\${virtualizer.getTotalSize()}px\`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div 
            key={virtualRow.index}
            style={{ position: 'absolute', top: 0, transform: \`translateY(\${virtualRow.start}px)\` }}
          >
            {allJobs[virtualRow.index].title}
          </div>
        ))}
      </div>
    </div>
  );
}`,
    interviewTrap: "Nu virtualiza liste scurte (sub 100 de elemente). Complexitatea si calculele matematice de pozitionare adaugate de biblioteca aduc beneficii reale doar la liste mari.",
    keyTakeaway: "Virtualizarea randeaza in DOM strict elementele vizibile in fereastra curenta, permitand parcurgerea lina a zeci de mii de randuri."
  },
  {
    id: "react-87",
    category: "REACT",
    difficulty: "USOR",
    title: "Prevenirea \"Prop Drilling\" prin Inversiune de Componente (Slots)",
    question: "Cum poti elimina fenomenul de \"Prop Drilling\" prin compozitie pura (Component Inversion), fara sa instalezi Context sau Redux?",
    answer: "In loc sa transmiti date prin 4 niveluri de parinti intermediari pentru ca o componenta copil adanca sa le poata consuma, randezi copilul direct la nivelul superior unde datele sunt deja disponibile si il pasezi mai departe ca un nod JSX (sau ca props.children)!\n\nDe ce functioneaza:\nComponentele intermediare nu mai trebuie sa declare sau sa cunoasca proprietatile specifice ale copilului; ele actioneaza ca simple \"slot-uri\" de afisare (asemanator slot-urilor din Web Components sau Vue).",
    codeSnippet: `// INAINTE (Prop Drilling enervant):
// <Page user={user} /> -> <Header user={user} /> -> <Navbar user={user} /> -> <Avatar user={user} />

// DUPA (Component Composition / Slots):
function Page() {
  const user = { name: 'Mihai', avatarUrl: '/pic.png' };

  return (
    <Header 
      // Avatarul este creat chiar aici unde 'user' exista deja!
      profileSlot={<Avatar url={user.avatarUrl} />} 
    />
  );
}

// Header si Navbar nu au nicio idee ce contine profileSlot:
function Header({ profileSlot }) {
  return <header><Navbar profileSlot={profileSlot} /></header>;
}
function Navbar({ profileSlot }) {
  return <nav><Logo />{profileSlot}</nav>;
}`,
    interviewTrap: "Multi candidati la interviu cred ca singura solutie pentru Prop Drilling este Context API sau Redux. Mentionarea compozitiei prin slots demonstreaza o intelegere profunda a modului de gandire React.",
    keyTakeaway: "Compozitia prin slot-uri JSX permite plasarea componentelor direct la nivelul unde datele sunt disponibile, eliberand componentele intermediare de povara proprietatilor redundante."
  },
  {
    id: "react-88",
    category: "REACT",
    difficulty: "USOR",
    title: "Vite vs Webpack: De ce Vite este semnificativ mai rapid in dezvoltare?",
    question: "De ce a inlocuit Vite batranul Create React App (Webpack) ca instrument standard de dezvoltare si cum foloseste ESM nativ?",
    answer: "1. Modelul clasic Webpack (Create React App):\n- Inainte de a porni serverul de dev, Webpack trebuie sa parcurga, sa compileze si sa impacheteze (bundle) TOATE fisierele din intregul proiect intr-un fisier urias in memorie.\n- Pe masura ce aplicatia creste la sute de fisiere, pornirea serverului dura zeci de secunde, iar Hot Module Replacement (HMR) devenea extrem de lent.\n\n2. Modelul modern Vite:\n- In dezvoltare (Development), Vite NU mai face bundling! Se bazeaza pe Native ES Modules (ESM) suportate nativ de toate browserele moderne.\n- Serverul porneste instantaneu (in cativa milisecunde).\n- Cand browserul solicita o pagina, Vite serveste doar fisierul cerut si dependintele sale directe, transpiland fisierele ultra-rapid folosind \"esbuild\" (scris in limbajul Go, de 50 de ori mai rapid decat compilarile JS).\n- Pentru productie (Production), Vite foloseste Rollup pentru a optimiza si minifica bundle-ul final.",
    codeSnippet: `// Vite transforma in dev cererile direct in module HTTP native:
// <script type="module" src="/src/main.jsx"></script>
// Browserul cere GET /src/App.jsx doar cand are nevoie de el!`,
    interviewTrap: "Retine ca Vite foloseste esbuild strict pentru transpilare rapida in dev, dar se bazeaza pe Rollup pentru build-ul final de productie pentru a asigura un tree-shaking avansat.",
    keyTakeaway: "Vite porneste instant folosind module ES native in browser si esbuild in dev, transformand la cerere doar fisierele efectiv accesate."
  },
  {
    id: "react-89",
    category: "REACT",
    difficulty: "USOR",
    title: "Echivalenta Lifecycle: useEffect vs componentDidMount, Update si Unmount",
    question: "Cum se mapeaza metodele traditionale de ciclu de viata din componente pe clase pe hook-ul modern useEffect?",
    answer: "1. componentDidMount (Executat o data la montare):\nEchivalent: useEffect(() => { ... }, []);\n(Array gol de dependinte - ruleaza o singura data dupa prima randare).\n\n2. componentDidUpdate (Executat la actualizarea starii sau props-urilor):\nEchivalent: useEffect(() => { ... }, [propA, stateB]);\n(Ruleaza cand oricare din dependintele listate se modifica).\n\n3. componentWillUnmount (Executat la demontarea componentei din DOM):\nEchivalent: Functia de return a efectului:\nuseEffect(() => {\n  return () => { console.log(\"Unmounted\"); };\n}, []);",
    codeSnippet: `// Un singur useEffect poate combina Mount, Update si Unmount elegant!
useEffect(() => {
  // 1. componentDidMount & componentDidUpdate:
  console.log('S-a montat sau s-a schimbat userId:', userId);

  // 2. componentWillUnmount:
  return () => {
    console.log('Se curata inainte de urmatoarea schimbare sau unmount');
  };
}, [userId]);`,
    interviewTrap: "Desi conceptual exista aceste paralele, filozofia useEffect este \"Sincronizarea cu starea externa\", si nu doar o simpla copiere mecanica a metodelor din clase.",
    keyTakeaway: "useEffect unifica ciclurile de mount, update si unmount intr-un singur model declarativ bazat pe array-ul de dependinte si functia de curatare returnata."
  },
  {
    id: "react-90",
    category: "REACT",
    difficulty: "USOR",
    title: "De ce nu trebuie stocate valorile derivate in stare?",
    question: "De ce este considerata pastrarea valorilor derivate (Derived State) in useState un anti-pattern si cum se calculeaza corect?",
    answer: "Ce este Derived State:\nO valoare care poate fi calculata direct pe baza proprietatilor existente din props sau din alta stare (ex: fullName calculat din firstName si lastName, sau totalCart calculat din lista de produse).\n\nDe ce este periculos sa o pui in useState:\n1. Duplicarea starii: Daca stochezi atat firstName, cat si fullName in stare, risti ca la actualizarea lui firstName sa uiti sa actualizezi si fullName, rezultand date desincronizate.\n2. Re-randari inutile: Necesita adesea useEffect-uri redundante doar pentru a sincroniza cele doua stari (ex: useEffect(() => setFullName(...), [firstName, lastName])).\n\nSolutia corecta:\nCalculeaza valoarea direct in corpul functiei de randare (in render pass). Daca calculul este foarte costisitor, memoreaza-l cu useMemo.",
    codeSnippet: `// GRESIT (Antipattern de duplicare stare cu useEffect):
const [firstName, setFirstName] = useState('Mihai');
const [lastName, setLastName] = useState('Sirbu');
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(firstName + ' ' + lastName); // Inutil si genereaza un render in plus!
}, [firstName, lastName]);

// CORECT (Calculat direct la randare):
const [firstName, setFirstName] = useState('Mihai');
const [lastName, setLastName] = useState('Sirbu');
const fullName = firstName + ' ' + lastName; // 0 linii de effect, 0 riscuri de desincronizare!`,
    interviewTrap: "Regula de aur in React: Daca o variabila poate fi calculata din props sau din state-ul curent, NU o pune intr-un nou useState!",
    keyTakeaway: "Calculeaza valorile derivate direct in timpul randarii; evita duplicarea starii si sincronizarile manuale cu useEffect."
  },
  {
    id: "react-91",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Higher-Order Component (HOC) vs Custom Hooks",
    question: "Ce este un Higher-Order Component (HOC) si de ce Custom Hook-urile au devenit solutia preferata de reutilizare a logicii?",
    answer: "1. Higher-Order Component (HOC):\n- O functie pura care primeste o componenta ca argument si returneaza o componenta imbogatita (const EnhancedComp = withAuth(MyComp)).\n- Populara in era componentelor pe clase (ex: withRouter, connect din vechiul Redux).\n- Probleme HOC: \"Wrapper Hell\" (ierarhii adanci de componente vizibile in React DevTools), coliziuni de nume de props (doua HOC-uri care injecteaza acelasi prop \"data\") si lizibilitate redusa a tipurilor in TypeScript.\n\n2. Custom Hooks:\n- Ofera aceeasi reutilizare a logicii de stare fara a adauga niciun nod suplimentar in arborele de componente.\n- Nu schimba semnatura sau interfata componentei si permit transferul transparent al valorilor dintr-un hook in altul.",
    codeSnippet: `// Vechiul stil cu HOC (complicat si adauga wrapper in arbore):
// export default withRouter(withTheme(withAuth(ProfilePage)));

// Stilul modern cu Custom Hooks (clar, liniar si compozabil):
function ProfilePage() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  return <div style={{ background: theme.bg }}>Salut, {user.name}</div>;
}`,
    interviewTrap: "Singurul scenariu unde HOC-urile mai au sens astazi este interceptarea sau conditionarea randarii unei componente intregi la nivel inalt (ex: withErrorBoundary sau logging de randare).",
    keyTakeaway: "Custom Hook-urile au inlocuit HOC-urile pentru reutilizarea logicii deoarece elimina \"wrapper hell-ul\" si ofera tipizare TypeScript perfecta."
  },
  {
    id: "react-92",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Pattern-ul \"Render Props\" si inlocuirea sa cu Hooks",
    question: "Ce este pattern-ul \"Render Props\" si cum a fost simplificat prin aparitia Hook-urilor?",
    answer: "Render Props este o tehnica de reutilizare a logicii in care o componenta primeste o functie ca proprietate (deseori numita \"render\" sau chiar transmisa ca \"children\") si o apeleaza pentru a decide ce sa randeze pe ecran, furnizandu-i date ca parametri.\n\nExemplu clasic de Render Prop:\n<MouseTracker render={({ x, y }) => <p>Pozitie: {x}, {y}</p>} />\n\nDe ce a fost inlocuit de Hooks:\nImbricarea mai multor componente cu render props ducea la \"Callback Hell\" in interiorul JSX-ului (3 niveluri de paranteze si functii anonime imbricate).\nCu hook-uri, acelasi scenariu se scrie intr-o singura linie: const { x, y } = useMousePosition();.",
    codeSnippet: `// 1. Stilul vechi cu Render Props (imbricare dificila in JSX):
<DataProvider render={(data) => (
  <ThemeConsumer>
    {({ theme }) => <div style={{ color: theme.text }}>{data.title}</div>}
  </ThemeConsumer>
)} />

// 2. Stilul modern cu Hooks (liniar si curat):
function View() {
  const data = useData();
  const theme = useTheme();
  return <div style={{ color: theme.text }}>{data.title}</div>;
}`,
    interviewTrap: "Desi hook-urile au inlocuit marea majoritate a Render Props-urilor, tehnica ramane valida cand o componenta trebuie sa permita personalizarea dinamica a fiecarui rand dintr-o lista virtualizata.",
    keyTakeaway: "Render Props paseaza o functie de randare ca proprietate; hook-urile ofera aceeasi reutilizare fara a aglomera structura JSX."
  },
  {
    id: "react-93",
    category: "REACT",
    difficulty: "USOR",
    title: "Arhitectura Curata de Proiect: Feature-Based vs Layer-Based Folder Structure",
    question: "Care este diferenta intre o structura de foldere bazata pe straturi (Layer-Based) si una bazata pe functionalitati (Feature-Based) si care este recomandata pentru scalare?",
    answer: "1. Layer-Based (Structura clasica simpla):\n- Organizeaza fisierele dupa tipul lor tehnic: /components, /hooks, /services, /pages.\n- Problema la scalare: Cand lucrezi la o functionalitate (ex: modulul JobApplication), trebuie sa sari continuu intre 4 foldere complet diferite aflate la mare distanta in arborele de fisiere.\n\n2. Feature-Based / Screaming Architecture (Recomandata pentru echipe si proiecte medii/mari):\n- Grupeaza tot ce tine de o functionalitate intr-un singur folder autonom: /features/jobs (contine componentele specifice, hook-urile specifice, serviciile API si testele pentru joburi).\n- Beneficii: Izolare excelenta, refactorizare usoara (stergerea unui feature inseamna stergerea unui singur folder), onboarding rapid pentru dezvoltatori noi.",
    codeSnippet: `// Structura Feature-Based recomandata:
// src/
//   ├── components/      // Componente globale reutilizabile (Button, Modal, Input)
//   ├── hooks/           // Hook-uri globale (useLocalStorage, useDebounce)
//   ├── features/        // Module independente de business
//   │    ├── auth/
//   │    │    ├── components/
//   │    │    ├── hooks/
//   │    │    └── api/
//   │    └── jobs/
//   │         ├── JobList.jsx
//   │         ├── useJobs.js
//   │         └── jobsApi.js
//   └── pages/           // Rutele principale care asambleaza feature-urile`,
    interviewTrap: "Evita crearea de foldere de feature prea granulare pentru pagini banale cu 5 linii de cod. Pastreaza echilibrul: componente comune in /components si domenii complexe in /features.",
    keyTakeaway: "Organizarea pe functionalitati (Feature-Based) tine codul legat impreuna si simplifica mentenanta aplicatiei pe termen lung."
  },
  {
    id: "react-94",
    category: "REACT",
    difficulty: "USOR",
    title: "Variabile de Mediu in Vite: Prefixul VITE_* si Securitatea pe Client",
    question: "Cum se definesc si se acceseaza variabilele de mediu intr-un proiect Vite si de ce este periculos sa pui chei private de API in fisierele .env din frontend?",
    answer: "In proiectele construite cu Vite:\n1. Declarare: Se creeaza fisiere precum .env, .env.development sau .env.production.\n2. Prefix obligatoriu: Toate variabilele destinate frontend-ului TREBUIE sa inceapa cu prefixul VITE_ (ex: VITE_API_URL=https://api.exemplu.com). Orice variabila fara acest prefix este ignorata intentionat de Vite pentru siguranta.\n3. Accesare in cod: Se foloseste obiectul standard: import.meta.env.VITE_API_URL.\n\nCapcana fatala de securitate:\nTot codul din frontend este compilat si trimis in browserul utilizatorului! Chiar daca o variabila este intr-un fisier .env, ea este injectata ca text clar in bundle-ul JavaScript descarcat de browser.\nNU pune niciodata chei private de plati (Stripe Secret Key), parole de baze de date sau token-uri private in fisierele de frontend!",
    codeSnippet: `// In .env:
VITE_BACKEND_URL=http://localhost:8080/api
# SECRET_KEY=12345 (GRESIT! Nu pune chei secrete pe client!)

// In codul React:
const apiUrl = import.meta.env.VITE_BACKEND_URL;
fetch(\`\${apiUrl}/jobs\`);`,
    interviewTrap: "Diferenta fata de Create React App: Vite foloseste import.meta.env.VITE_* in loc de vechiul process.env.REACT_APP_*.",
    keyTakeaway: "Variabilele de mediu in Vite necesita prefixul VITE_*; nu stoca niciodata secrete de backend in frontend deoarece sunt vizibile in codul clientului."
  },
  {
    id: "react-95",
    category: "REACT",
    difficulty: "MEDIU",
    title: "React DevTools Profiler: Diagnosticarea Re-randarilor Lente",
    question: "Cum folosesti tab-ul Profiler din extensia React DevTools pentru a depana si optimiza componentele lente?",
    answer: "React DevTools include un instrument dedicat numit Profiler pentru masurarea exacta a performantei de randare.\n\nCum se foloseste:\n1. Deschizi DevTools in browser si mergi pe tab-ul Profiler.\n2. Bifezi setarea \"Record why each component rendered while profiling\" din optiuni.\n3. Apesi pe butonul de inregistrare (Record), interactionezi cu aplicatia (ex: tastezi sau deschizi o lista) si opresti inregistrarea.\n4. Analizezi graficul:\n- Flamegraph: Arata durata de randare a fiecarui nod (barele galbene/portocalii indica componente lente, cele verzi/gri sunt rapide).\n- Ranked Chart: Sorteaza componentele in ordinea descrescatoare a timpului consumat de procesor.\n- La click pe orice bara, Profiler-ul iti spune exact DE CE s-a re-randat acea componenta (ex: \"props changed: onClick, items\").",
    codeSnippet: `// Sfat practic: Poti marca componente pentru masurare programatica:
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log(\`Componenta \${id} in faza \${phase} a durat \${actualDuration}ms\`);
}

<Profiler id="JobList" onRender={onRenderCallback}>
  <JobList />
</Profiler>`,
    interviewTrap: "Fa intotdeauna masuratorile finale de profilare pe un Production Build local (npm run build && npm run preview), deoarece in Development modul React este mult mai lent din cauza verificarilor aditionale.",
    keyTakeaway: "Profiler-ul din React DevTools identifica cu precizie componentele care incetinesc interfata si motivele exacte pentru care acestea se re-randeaza."
  },
  {
    id: "react-96",
    category: "REACT",
    difficulty: "USOR",
    title: "De ce recrearea obiectelor si functiilor in parinte rupe React.memo?",
    question: "De ce o componenta copil optimizata cu React.memo continua sa se re-randeze daca parintele ii transmite style={{ margin: 10 }} sau o functie arrow anonima?",
    answer: "Mecanismul de comparatie:\nReact.memo face o comparatie superficiala (shallow equality) a proprietatilor folosind Object.is.\n\nIn JavaScript, tipurile referentiale (obiectele, array-urile si functiile) sunt comparate dupa ADRESA DE MEMORIE, nu dupa continutul lor!\n- {} === {} se evalueaza la false!\n- (() => {}) === (() => {}) se evalueaza la false!\n\nLa fiecare render al componentei parinte, JavaScript re-evalueaza corpul functiei si creeaza instante noi in memorie pentru stiluri inline ({ margin: 10 }) si functii anonime (onClick={() => doSomething()}).\nReact.memo compara vechea referinta cu noua referinta, constata ca adresele de memorie difera si este fortat sa re-randeze copilul!",
    codeSnippet: `// GRESIT (React.memo este complet anulat de noile referinte create la fiecare render):
function Parent() {
  return <MemoChild config={{ theme: 'dark' }} onClick={() => save()} />;
}

// CORECT (Referinte stabile garantate):
const CONFIG = { theme: 'dark' }; // Definit in afara functiei parinte daca e constant

function ParentOptimized() {
  const handleClick = useCallback(() => {
    save();
  }, []);

  return <MemoChild config={CONFIG} onClick={handleClick} />;
}`,
    interviewTrap: "Daca o valoare constanta nu depinde de starea sau props-urile componentei, mut-o complet in afara functiei componentei! Astfel are o singura adresa de memorie stabila fara niciun overhead de useMemo.",
    keyTakeaway: "Obiectele si functiile inline creeaza adrese noi de memorie la fiecare randare; foloseste useCallback, useMemo sau constante externe pentru a pastra protectia React.memo."
  },
  {
    id: "react-97",
    category: "REACT",
    difficulty: "USOR",
    title: "Accesibilitate (a11y) in React: ARIA, Focus si Elemente Semantice",
    question: "Cum asiguri accesibilitatea (a11y) a unei aplicatii React pentru utilizatorii cu deficiente sau screen readers?",
    answer: "Reguli de aur pentru accesibilitate in React:\n1. Foloseste HTML Semantic nativ: Foloseste <button> in loc de <div onClick={...}>. Butonul nativ ofera automat accesibilitate la tastatura (tasta Enter / Space) si anunt corect pe screen reader.\n2. Atribute ARIA camelCase: In React, toate atributele standard aria-* si role se folosesc normal: aria-label=\"Inchide\", aria-expanded={isOpen}.\n3. Legarea etichetelor de formulare: Foloseste <label htmlFor=\"email\">Email</label> asociat cu <input id=\"email\" />.\n4. Focus Management: La deschiderea unei ferestre modale, muta automat focusul pe primul element din modala folosind ref.current.focus(), iar la inchidere readu focusul pe butonul care a deschis-o.",
    codeSnippet: `// Buton accesibil cu iconita vizuala:
function IconButton({ icon, label, onClick }) {
  return (
    <button 
      type="button" 
      onClick={onClick} 
      aria-label={label} // Descrie actiunea pentru utilizatorii de screen reader
      className="p-2 rounded hover:bg-gray-100"
    >
      {icon}
    </button>
  );
}`,
    interviewTrap: "Daca pui onClick pe un <div>, un utilizator care navigheaza exclusiv cu tastatura nu va putea niciodata ajunge pe acel element prin tasta Tab! Foloseste intotdeauna elementul semantic <button>.",
    keyTakeaway: "Prioritizeaza tag-urile semantice native HTML, eticheteaza campurile si gestioneaza corect focusul pentru a crea aplicatii incluzive si accesibile."
  },
  {
    id: "react-98",
    category: "REACT",
    difficulty: "MEDIU",
    title: "Pattern-ul Compound Components: Cum construiesti componente flexibile?",
    question: "Ce este pattern-ul Compound Components in React si cum permite crearea unor componente declarative asemanatoare cu <select> si <option>?",
    answer: "Compound Components reprezinta un pattern arhitectural in care un set de componente colaboreaza pentru a crea o functionalitate comuna, partajand starea interna in mod transparent prin Context.\n\nModelul mental HTML nativ:\nGandeste-te la tag-ul <select> si <option>. Nu scrii <select options={[\"A\", \"B\"]} />, ci compui elementele liber:\n<select>\n  <option value=\"1\">Unu</option>\n  <option value=\"2\">Doi</option>\n</select>\n\nCum se implementeaza in React:\n1. Parintele (<Tabs>) defineste un Context intern pentru starea activa.\n2. Copiii (<Tabs.List>, <Tabs.Tab>, <Tabs.Panel>) consuma acest context si isi sincronizeaza comportamentul.\n3. Ofera utilizatorului libertate totala de layout si personalizare vizuala.",
    codeSnippet: `const TabsContext = createContext();

function Tabs({ children, defaultValue }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs-container">{children}</div>
    </TabsContext.Provider>
  );
}

function Tab({ value, children }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button 
      onClick={() => setActiveTab(value)}
      className={isActive ? 'font-bold border-b-2 border-blue-600' : 'text-gray-500'}
    >
      {children}
    </button>
  );
}

function Panel({ value, children }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className="p-4">{children}</div>;
}

// Utilizare compozabila extrem de eleganta:
// <Tabs defaultValue="tab1">
//   <Tab value="tab1">Descriere</Tab>
//   <Tab value="tab2">Cerinte</Tab>
//   <Panel value="tab1">Continut 1</Panel>
//   <Panel value="tab2">Continut 2</Panel>
// </Tabs>`,
    interviewTrap: "Daca folosesti Compound Components, copiii trebuie sa se afle in interiorul parintelui furnizor pentru a avea acces la Context.",
    keyTakeaway: "Compound Components partajeaza starea interna printr-un Context ascuns, oferind o interfata declarativa si flexibila pentru design systems."
  },
  {
    id: "react-99",
    category: "REACT",
    difficulty: "USOR",
    title: "Implementarea Modului Intunecat (Dark Mode) cu Context si Tailwind CSS",
    question: "Cum implementezi suport complet pentru Dark Mode intr-o aplicatie React cu Tailwind CSS si memorare in localStorage?",
    answer: "In Tailwind CSS, Dark Mode se configureaza cel mai curat prin strategia bazata pe clase (\"class strategy\"), adaugand sau stergand clasa \"dark\" de pe nodul radacina document.documentElement (tag-ul <html>).\n\nPasi de implementare cu React:\n1. Creezi un ThemeContext care pastreaza starea temei (\"light\" sau \"dark\").\n2. La initializare, verifici intai localStorage, iar daca nu exista, verifici preferinta sistemului de operare: window.matchMedia(\"(prefers-color-scheme: dark)\").matches.\n3. Intr-un useEffect, sincronizezi clasa \"dark\" pe document.documentElement si salvezi selectia in localStorage.\n4. In componente, aplici stilurile usor folosind prefixul: className=\"bg-white text-gray-900 dark:bg-gray-900 dark:text-white\".",
    codeSnippet: `export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}`,
    interviewTrap: "Daca folosesti Server-Side Rendering (Next.js), poti avea o secunda de ecran alb (flash of white) inainte ca tema intunecata sa fie citita din localStorage. Se rezolva cu un script inline minuscul in <head>.",
    keyTakeaway: "Dark Mode se realizeaza prin comutarea clasei \"dark\" pe tag-ul html si persistenta alegerii in localStorage prin ThemeContext."
  },
  {
    id: "react-100",
    category: "REACT",
    difficulty: "USOR",
    title: "Checklist de Interviu React Junior/Mid: Top 5 Reguli de Aur",
    question: "Care sunt cele mai importante 5 reguli practice si greseli de evitat pe care orice candidat Junior/Mid trebuie sa le stapaneasca la un interviu tehnic React?",
    answer: "Sinteza de baza pentru un interviu tehnic reusit in React:\n\n1. Imutabilitatea Starii: Nu muta niciodata starea direct (fara state.push() sau state.name = ...). Foloseste intotdeauna spread operator (...) si functional updates (prev => ...).\n\n2. Chei Unice in Liste: Foloseste mereu ID-uri unice si stabile pentru proprietatea \"key\", niciodata indexul array-ului cand lista poate fi modificata.\n\n3. Curatarea Efectelor (Cleanup): Opreste intotdeauna timerele, sterge listenerii de evenimente si anuleaza cererile fetch in functia de return din useEffect.\n\n4. Fara Calcule Premature: Nu stoca valori derivate in stare (fullName calculat direct in render, nu in useState). Foloseste useMemo si useCallback doar cand optimizezi componente copil memorate cu React.memo, nu pentru adunari simple.\n\n5. Declarativ in loc de Imperativ: Gandeste in fluxuri de date (Data-Driven UI). Nu incerca sa manipulezi manual nodurile din DOM cu document.querySelector; lasa React sa actualizeze interfata pe baza starii.",
    codeSnippet: `// Rezumat sintetic mental la interviu:
// 1. Data curge de sus in jos (Props)
// 2. Modificarile urca in sus (Callbacks)
// 3. Starea dicteaza interfata (UI = f(State))
// 4. Componentele sunt functii pure
// 5. Side-effects stau exclusiv in useEffect`,
    interviewTrap: "Cea mai mare greseala la interviu este sa incerci sa explici concepte avansate dar sa te impiedici de intrebari de baza precum diferenta dintre props si state sau de ce nu este functia din useEffect async.",
    keyTakeaway: "Stapanirea solida a imutabilitatii, ciclului de viata, cheilor din liste si a gandirii declarative garanteaza succesul la interviul de React Junior/Mid."
  }
];
