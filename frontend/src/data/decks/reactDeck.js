// Deck Masiv: React 18/19, Virtual DOM, Hooks, Next.js & Frontend Performance
// Preluat din: sudheerj/reactjs-interview-questions, React Official Docs, DopplerHQ, Next.js Guides
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const REACT_DECK = [
  {
    id: 'react-01',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza Virtual DOM si algoritmul de Reconciliation?',
    question: 'Ce este Virtual DOM in React, cum functioneaza algoritmul Diffing / Reconciliation si de ce accesul direct la Real DOM este lent in browsere?',
    answer: 'Real DOM este un arbore complex de noduri gestionat de browser. Orice modificare directa declanseaza etape costisitoare de "Reflow" (recalcularea geometriei elementelor) si "Repaint" (redesenarea pixelilor pe ecran).\n\nVirtual DOM este o reprezentare usoara (Lightweight JavaScript Object) a arborelui DOM pastrata in memoria JavaScript.\n\nFluxul Reconciliation (React Fiber):\n1. La fiecare schimbare de stare (setState), React creeaza un nou arbore Virtual DOM.\n2. Compara noul arbore cu cel anterior folosind un algoritm euristic de "Diffing" cu complexitate O(N).\n3. Calculeaza diferenta minima (batch de mutatii).\n4. Aplica doar aceste mutatii minime pe Real DOM intr-o singura operatie de sincronizare (Commit Phase).',
    codeSnippet: `// Obiect Virtual DOM simplificat in memorie:
const vdomNode = {
    type: 'button',
    props: {
        className: 'btn-primary',
        onClick: () => applyJob(),
        children: 'Aplica Acum'
    }
};`,
    interviewTrap: 'Daca schimbi tipul elementului (de exemplu de la <div> la <span>), React distruge complet intregul subarbore vechi si il reconstruieste de la zero, chiar daca copiii sunt identici!',
    keyTakeaway: 'Virtual DOM grupeaza si minimizeaza modificarile pe Real DOM pentru a evita reflow-urile costisitoare ale browserului.'
  },
  {
    id: 'react-02',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'De ce este cheia "key" obligatorie in liste si de ce indexul este o alegere proasta?',
    question: 'De ce cere React o proprietate unica "key" atunci cand randezi o lista de elemente si de ce folosirea indexului din map((item, index)) duce la bug-uri?',
    answer: 'React foloseste "key" pentru a identifica unic elementele dintr-o lista in timpul procesului de Reconciliation (Diffing), stiind care element a fost adaugat, sters sau reordonat.\n\nDe ce indexul este un Anti-Pattern:\nDaca folosesti indexul numeric (0, 1, 2) si inserezi un element nou la inceputul listei sau stergi un rand:\n- Toti indicii elementelor urmatoare se schimba (elementul de pe index 0 devine index 1).\n- React crede eronat ca toate elementele s-au modificat si le re-randeaza pe toate.\n- Daca elementele contin input-uri cu stare interna (ex: un camp text sau checkbox bifat), starea ramane asociata cu vechiul index, ducand la bug-uri vizuale unde textul introdus sare pe alt rand!',
    codeSnippet: `// GRESIT (duce la bug-uri de stare la reordonare/stergere):
{jobs.map((job, index) => <JobCard key={index} job={job} />)}

// CORECT (Foloseste un identificator stabil si unic din baza de date):
{jobs.map(job => <JobCard key={job.id} job={job} />)}`,
    interviewTrap: 'Singurul scenariu acceptabil pentru cheie bazata pe index este cand lista este complet statica (nu este niciodata filtrata, sortata, adaugata sau stearsa).',
    keyTakeaway: 'Foloseste intotdeauna un ID unic si stabil (ex: UUID sau database ID) ca proprietate key.'
  },
  {
    id: 'react-03',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'useMemo vs useCallback: Cand aduc un castig real de performanta?',
    question: 'Care este diferenta dintre hook-urile useMemo si useCallback? Cand este contraindicat sa le folosesti din cauza overhead-ului de memorie?',
    answer: '1. useMemo: Memoreaza REZULTATUL calculat al unei functii costisitoare. Ruleaza functia doar cand una din dependinte s-a schimbat.\n2. useCallback: Memoreaza REFERINTA functiei in sine intre re-randari. Previne crearea unei noi instante a functiei la fiecare render.\n\nCand aduc castig real:\n- Cand trimiti functia ca prop catre o componenta copil optimizata cu React.memo (astfel incat copilul sa nu se re-randeze inutil).\n- Cand functia/obiectul este trecut in array-ul de dependinte al unui useEffect.\n\nCand NU le folosim: Pentru operatiuni simple (adunari, filtrari de 10 elemente). Fiecare hook are un cost intern de alocare de memorie si verificare de dependinte; folosirea lor excesiva face aplicatia mai lenta!',
    codeSnippet: `// 1. useMemo: retine rezultatul filtrarii costisitoare
const filteredJobs = useMemo(() => {
    return expensiveFilterAlgorithm(jobs, filterCriteria);
}, [jobs, filterCriteria]);

// 2. useCallback: retine aceeasi referinta de functie pentru copil memoizat
const handleSelect = useCallback((jobId) => {
    selectJob(jobId);
}, [selectJob]);`,
    interviewTrap: 'useCallback(fn, deps) este echivalentul exact al lui useMemo(() => fn, deps).',
    keyTakeaway: 'Foloseste React.memo + useCallback impreuna; folosirea lui useCallback pe o functie trimisa unei componente nememoizate este inutila.'
  },
  {
    id: 'react-04',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Ciclul de viata al lui useEffect si Curatarea (Cleanup Function)',
    question: 'Cand se executa functia de cleanup returnata de un useEffect si de ce este obligatorie pentru Event Listeners, WebSockets sau Timere?',
    answer: 'Functia de cleanup returnata din useEffect se executa in doua momente:\n1. Inainte ca componenta sa fie demontata (Unmount) de pe ecran.\n2. Inainte de RULAREA URMATOAREI executii a aceluiasi efect (daca dependintele s-au schimbat).\n\nDe ce este obligatorie:\nDaca adaugi un window.addEventListener("resize", handler) sau deschizi o conexiune WebSocket fara cleanup:\n- La fiecare re-randare se adauga un nou listener duplicat.\n- Dupa demontarea componentei, listenerul vechi continua sa ruleze in memorie, incercand sa actualizeze starea unei componente inexistente (Memory Leak si erori in consola).',
    codeSnippet: `useEffect(() => {
    const handleScroll = () => console.log(window.scrollY);
    window.addEventListener('scroll', handleScroll);

    // FUNCTIA DE CLEANUP (OBLIGATORIE):
    return () => {
        window.removeEventListener('scroll', handleScroll);
    };
}, []); // [] = ruleaza o data la mount, cleanup la unmount`,
    interviewTrap: 'In React 18 in modul dezvoltare (React.StrictMode), React monteaza si demonteaza intentionat fiecare componenta de doua ori pentru a te ajuta sa depistezi lipsa cleanup-ului!',
    keyTakeaway: 'Pentru orice abonament, timer (setInterval) sau socket: returneaza o functie de cleanup din useEffect.'
  },
  {
    id: 'react-05',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Server-Side Rendering (SSR) vs Static Site Generation (SSG) in Next.js',
    question: 'Care este diferenta fundamentala dintre SSR (Server-Side Rendering) si SSG (Static Site Generation) in Next.js si cand folosesti fiecare strategie?',
    answer: '1. SSG (Static Site Generation):\n   - Paginile HTML sunt generate O SINGURA DATA la BUILD TIME (in timpul comenzii next build).\n   - Fisierele statice HTML/CSS sunt distribuite instant prin CDN-uri globale (Cloudflare, AWS CloudFront).\n   - Latenta este aproape zero (sub 20ms). Ideal pentru: bloguri, pagini de prezentare, documentatie, articole unde continutul nu se schimba la fiecare secunda.\n\n2. SSR (Server-Side Rendering):\n   - Pagina HTML este generata dinamic pe server la FIECARE REQUEST al utilizatorului (request-time).\n   - Serverul apeleaza baza de date sau API-ul, randeaza HTML-ul proaspat si il trimite catre browser.\n   - Ideal pentru: aplicatii cu date personalizate in timp real per utilizator (dashboard financiar, contul de aplicatii ATS, feed privat).',
    codeSnippet: `// Next.js App Router (React Server Components):
// Implicit este Server Component (SSR / Static Cache)
export default async function JobDetailPage({ params }) {
    // Apel efectuat pe server inainte de trimiterea HTML-ului:
    const job = await fetch('https://api.site.com/jobs/' + params.id, {
        cache: 'no-store' // Fortat SSR la fiecare request
    }).then(res => res.json());

    return <h1>{job.title}</h1>;
}`,
    interviewTrap: 'In Next.js App Router, toate componentele sunt implicit Server Components (RSC) si nu pot folosi hooks precum useState sau onClick decat daca adaugi directiva "use client" in varful fisierului!',
    keyTakeaway: 'SSG = generat la build time cu CDN caching; SSR = generat la fiecare cerere pentru date dinamice in timp real.'
  },
  {
    id: 'react-06',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'React 18 Concurrency: useTransition vs useDeferredValue',
    question: 'Cum folosesti useTransition si useDeferredValue pentru a pastra interfata rapida si receptiva in timpul filtrarilor grele?',
    answer: 'Inainte de React 18, toate actualizarile de stare erau urgente si blocante. Daca filtrai o lista mare de 10.000 de elemente in timp ce utilizatorul tasta, interfata ingheta!\n\nReact 18 Concurrency:\n1. useTransition: Permite marcarea unei actualizari de stare ca fiind "non-urgenta" (tranzitie). Tastarea in input ramane prioritara si fluida la 60fps, in timp ce randarea listei grele este procesata in fundal si poate fi intrerupta daca userul mai apasa o tasta! Ofera flag-ul isPending.\n2. useDeferredValue: Amana actualizarea unei valori primite ca prop/stare pana cand randarile urgente sunt finalizate.',
    codeSnippet: `const [isPending, startTransition] = useTransition();
const [query, setQuery] = useState('');
const [results, setResults] = useState([]);

function handleSearch(e) {
    setQuery(e.target.value); // Urgent: inputul se actualizeaza instant

    startTransition(() => {
        // Non-urgent: se calculeaza in fundal fara a bloca tastatura:
        setResults(filterHeavyData(e.target.value));
    });
}`,
    interviewTrap: 'startTransition nu poate fi folosit pentru actualizari de text ale inputului in sine (controlled input value); se foloseste doar pentru efectul secundar greu (lista de rezultate).',
    keyTakeaway: 'useTransition prioritizeaza interactiunile utilizatorului prin transformarea randarilor grele in task-uri de fundal intreruptibile.'
  },
  {
    id: 'react-07',
    category: 'REACT',
    difficulty: 'DIFICIL',
    title: 'React 19 Actions: useActionState si useOptimistic',
    question: 'Care sunt noile hook-uri introduse in React 19 pentru formulare si cum simplifica useOptimistic actualizarile instantanee de UI?',
    answer: 'React 19 introduce "Actions" native pentru simplificarea formularelor:\n1. useActionState (inlocuieste useFormState):\nGestioneaza automat starea formularului, valoarea returnata de actiunea asincrona si flag-ul isPending fara a mai scrie manual blocuri try/catch/finally cu setIsLoading.\n2. useOptimistic:\nPermite afisarea IMEDIATA in interfata a rezultatului asteptat (ex: adaugarea unui comentariu nou in lista), in timp ce cererea asincrona catre server este inca in desfasurare pe retea. Daca cererea esueaza, React face rollback automat la starea anterioara fara efort suplimentar!',
    codeSnippet: `// React 19 useOptimistic:
const [optimisticJobs, addOptimisticJob] = useOptimistic(
    jobs,
    (state, newJob) => [...state, { ...newJob, pending: true }]
);

async function handleAction(formData) {
    const job = { title: formData.get('title') };
    addOptimisticJob(job); // Afisat instant in UI!
    await api.createJob(job); // Apel real de retea
}`,
    interviewTrap: 'Nu folosi useOptimistic daca nu ai un mecanism clar de afisare a starii tranzitorii (pending indicator sau posibilitate de reincercare).',
    keyTakeaway: 'React 19 Actions transforma manipularea asincrona a formularelor si actualizarile optimiste intr-un standard declarativ nativ.'
  },
  {
    id: 'react-08',
    category: 'REACT',
    difficulty: 'DIFICIL',
    title: 'React Server Components (RSC) vs Client Components',
    question: 'Ce sunt React Server Components (RSC), de ce nu trimit niciun octet de JavaScript in bundle si cand adaugi directiva "use client"?',
    answer: '1. React Server Components (RSC):\n- Ruleaza EXCLUSIV pe server si NU sunt incluse niciodata in pachetul JavaScript (bundle) descarcat de browser.\n- Pot accesa direct baza de date (SELECT * FROM jobs), fisiere locale sau chei secrete de API fara a le expune pe client.\n- Trimit catre browser un format special de arbore JSON serializat (RSC payload) care este transformat direct in HTML.\n- Nu pot folosi: useState, useEffect, onClick sau API-uri de browser (window, localStorage).\n\n2. Client Components ("use client"):\n- Componente traditionale React care ruleaza pe client si suporta interactivitate (evenimente mouse, stare locala, hooks).\n- Directiva "use client" marcheaza granita de unde codul trebuie impachetat si trimis catre browser.',
    codeSnippet: `// Server Component (implicit in Next.js App Router):
import db from '@/lib/db';

export default async function JobList() {
    // Acces direct la PostgreSQL fara API route intermediar:
    const jobs = await db.query('SELECT * FROM job_postings');
    return <div>{jobs.map(j => <p key={j.id}>{j.title}</p>)}</div>;
}`,
    interviewTrap: 'Adaugarea "use client" nu inseamna ca componenta ruleaza DOAR pe client; ea se randeaza initial si pe server la SSR, deci tot nu poti accesa window la prima evaluare!',
    keyTakeaway: 'RSC reduc drastic dimensiunea bundle-ului JS al clientului si elimina necesitatea construirii de endpoint-uri REST intermediare pentru citiri.'
  },
  {
    id: 'react-09',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'React Context API vs Zustand / Redux Toolkit',
    question: 'De ce folosirea React Context pentru date care se schimba des este un risc de performanta si cum rezolva Zustand aceasta problema?',
    answer: 'Problema cu React Context:\nCand valoarea furnizata de un ContextProvider se schimba, TOATE componentele care folosesc hook-ul useContext(MyContext) se re-randeaza fortat, chiar daca folosesc doar o proprietate neinsemnata care NU s-a modificat! Context nu ofera selectoare fine native.\n\nDe ce Zustand este superior:\n1. State Management bazat pe Selectoare: Componenta se re-randeaza DOAR daca valoarea exacta extrasa de selector s-a schimbat: const user = useStore(s => s.user).\n2. Boilerplate minim: Nu necesita invelirea aplicatiei intr-un arbore nesfarsit de Provideri (<UserProvider><ThemeProvider>...).\n3. Acces in afara componentelor: Poti citi si modifica starea Zustand direct din functii utilitare simple sau interceptori Axios.',
    codeSnippet: `// Zustand Store simplu si rapid:
import { create } from 'zustand';

export const useJobStore = create((set) => ({
    favorites: [],
    addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
}));

// In componenta (se re-randeaza doar daca favorites se modifica):
const favorites = useJobStore((state) => state.favorites);`,
    interviewTrap: 'React Context a fost creat pentru date care se schimba rar (tema luminoasa/intunecata, limba curenta, user autentificat); nu este potrivit pentru formulare dinamice sau date de streaming.',
    keyTakeaway: 'Zustand previne re-randarile inutile prin selectoare atomice si elimina complet ierarhiile rigide de Context Providers.'
  },
  {
    id: 'react-10',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'useRef vs useState: Cand evitam re-randarea',
    question: 'Care sunt cele doua mari utilizari ale hook-ului useRef si prin ce difera radical fata de useState?',
    answer: '1. Diferenta Fundamentala:\n- useState: Actualizarea starii (setVal) declanseaza RE-RANDAREA componentei.\n- useRef: Modificarea proprietatii ref.current pastreaza noua valoare pe toata durata vietii componentei FARA a declansa nicio re-randare!\n\n2. Cele Doua Cazuri Clasice de Utilizare pentru useRef:\n- Stocarea de variabile mutabile interne care nu afecteaza direct randarea vizuala: timere (timerId = setInterval), flag-uri de monitorizare (isMounted, previousProps).\n- Acces Direct la Noduri Real DOM: focus pe un input (inputRef.current.focus()), scroll automat, masuratori de inaltime sau integrare cu librarii non-React (Canvas, Chart.js).',
    codeSnippet: `const countRef = useRef(0);
const inputRef = useRef(null);

function handleClick() {
    countRef.current += 1; // Nu declanseaza re-randare!
    inputRef.current.focus(); // Acces direct pe nodul DOM
}`,
    interviewTrap: 'Nu scrie si nu citi ref.current in timpul fazei de randare (in corpul functiei inainte de return); mutatiile de ref trebuie facute exclusiv in useEffect sau event handlers!',
    keyTakeaway: 'useRef pastreaza date mutabile intre randari fara a provoca cicluri de re-randare si ofera legatura cu nodurile DOM.'
  },
  {
    id: 'react-11',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Stale Closures in React si Functional State Updates',
    question: 'Ce este fenomenul de "Stale Closure" in React si cum rezolva forma functionala setState(prev => prev + 1) erorile de numarare?',
    answer: 'Un Stale Closure apare cand o functie sau un callback (ex: in setTimeout, setInterval sau useEffect) "inchide" (captures) o variabila de stare dintr-o randare anterioara invechita.\n\nExemplu de Bug:\nDaca state este 0 si apelezi setCount(count + 1) de 3 ori consecutiv in acelasi handler: toate 3 apelurile citesc count = 0, deci rezultatul final va fi 1 in loc de 3!\n\nSolutie: Functional State Updates\nFolosind setCount(prevCount => prevCount + 1), React ii paseaza functiei tale starea garantat cea mai recenta din coada interna de actualizari, rezolvand instantaneu orice problema de sincronizare.',
    codeSnippet: `// GRESIT in setInterval (ramane blocat la valoarea initiala):
// setInterval(() => setCount(count + 1), 1000);

// CORECT (Functional update citeste mereu valoarea proaspata):
useEffect(() => {
    const timer = setInterval(() => {
        setCount(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
}, []);`,
    interviewTrap: 'Omiterea dependintelor din array-ul useEffect pentru a "evita re-rularea" este cauza principala a bug-urilor de Stale Closure; foloseste functional updates in loc de ignorarea dependintelor.',
    keyTakeaway: 'Foloseste intotdeauna forma setState(prev => ...) cand noua stare depinde de starea anterioara.'
  },
  {
    id: 'react-12',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'Automatic Batching in React 18',
    question: 'Ce este Automatic Batching in React 18 si cum reduce numarul de re-randari fata de versiunile anterioare de React?',
    answer: 'Batching inseamna gruparea mai multor actualizari de stare intr-o singura re-randare pentru performanta optima.\n\nIn React 17 si mai vechi:\nReact facea batching DOAR in event handler-ele native React (ex: onClick). Daca actualizai starea in interiorul unui fetch(), setTimeout() sau Promise.then(), fiecare setState declansa o re-randare separata a browserului!\n\nIn React 18 (Automatic Batching peste tot):\nReact grupeaza automat TOATE actualizarile de stare, indiferent unde sunt apelate (in Promises, setTimeout, microtasks sau native events), intr-o singura re-randare curata.',
    codeSnippet: `// In React 18, acest Promise declanseaza o SINGURA re-randare finala:
fetch('/api/job').then(() => {
    setLoading(false); // Stare 1
    setData(jobData);  // Stare 2
    setStatus('READY'); // Stare 3
    // React 18 randeaza o singura data la final!
});`,
    interviewTrap: 'Daca ai nevoie rara de a forta o re-randare intermediara imediata, poti folosi ReactDOM.flushSync(() => setState()), dar acest lucru afecteaza performanta.',
    keyTakeaway: 'React 18 grupeaza automat toate actualizarile de stare pentru a elimina re-randarile intermediare inutile.'
  },
  {
    id: 'react-13',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Error Boundaries in React: Ce sunt si ce limite au',
    question: 'Ce este un Error Boundary in React, cum previne ecranul alb si ce erori NU pot fi prinse de el?',
    answer: 'Un Error Boundary este o componenta React speciala care prinde erorile JavaScript produse in arborele sau de componente copil, afisand o interfata vizuala de rezerva (Fallback UI) in loc sa lase aplicatia sa crape cu ecran complet alb.\n\nImplementare: Trebuie sa defineasca una din metodele clasice de ciclu de viata: static getDerivedStateFromError(error) sau componentDidCatch(error, info) (sau folosind biblioteca populara react-error-boundary).\n\nCe NU pot prinde Error Boundaries:\n1. Erori din Event Handlers (onClick etc.) - acestea trebuie prinse cu try/catch clasic.\n2. Cod Asincron (setTimeout, requestAnimationFrame).\n3. Erori din Server-Side Rendering (SSR).\n4. Erori aruncate in interiorul Error Boundary-ului insusi (ci doar in copiii sai).',
    codeSnippet: `import { ErrorBoundary } from 'react-error-boundary';

function FallbackComponent({ error, resetErrorBoundary }) {
    return (
        <div role="alert">
            <p>A aparut o eroare neasteptata: {error.message}</p>
            <button onClick={resetErrorBoundary}>Reincearca</button>
        </div>
    );
}

// Utilizare:
<ErrorBoundary FallbackComponent={FallbackComponent}>
    <JobDashboard />
</ErrorBoundary>`,
    interviewTrap: 'Erorile din functiile onClick nu sunt prinse de Error Boundary; pentru ele trebuie folosit try/catch in interiorul handler-ului.',
    keyTakeaway: 'Error Boundaries izoleaza defectiunile la nivel de modul, pastrand restul aplicatiei functionala pentru utilizator.'
  },
  {
    id: 'react-14',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Code Splitting cu React.lazy si Suspense',
    question: 'Cum folosesti React.lazy si Suspense pentru a micsora bundle-ul initial al aplicatiei si a accelera incarcarea?',
    answer: 'In aplicatiile mari SPA, intregul cod JavaScript este combinat intr-un singur fisier mare (bundle.js de cativa megabytes), facand prima incarcare a paginii extrem de lenta.\n\nCode Splitting cu React.lazy:\n1. Imparte codul in bucati mici (chunks) descarcate la cerere.\n2. React.lazy(() => import(\'./HeavyChart\')) instruieste bundler-ul (Vite/Webpack) sa creeze un chunk separat.\n3. Componenta Suspense inveleste componenta lazy si afiseaza un indicator de incarcare (fallback={<Spinner />}) cat timp fisierul JavaScript este descarcat prin retea.',
    codeSnippet: `import React, { Suspense, lazy } from 'react';

// Descarcat doar cand utilizatorul navigheaza pe aceasta pagina:
const AnalyticsDashboard = lazy(() => import('./AnalyticsDashboard'));

function App() {
    return (
        <Suspense fallback={<div className="loading">Se incarca datele...</div>}>
            <AnalyticsDashboard />
        </Suspense>
    );
}`,
    interviewTrap: 'React.lazy suporta doar exporturi implicite (default exports); daca un modul foloseste named export, trebuie sa il mapezi in apelul de import.',
    keyTakeaway: 'React.lazy + Suspense amana descarcarea modulelor grele pana in momentul in care utilizatorul are nevoie efectiva de ele.'
  },
  {
    id: 'react-15',
    category: 'REACT',
    difficulty: 'DIFICIL',
    title: 'Hydration Error in SSR / Next.js: Cauze si Remediere',
    question: 'Ce este o eroare de Hydration Mismatch in aplicatii cu Server-Side Rendering si care sunt cele mai frecvente 3 cauze?',
    answer: 'Ce este Hydration:\nProcesul prin care React ataseaza event listeners si starea interactiva la structura HTML statica deja randata pe server si trimisa in browser.\n\nEroarea Hydration Mismatch:\nApare cand arborele HTML generat de server este DIFERIT de arborele pe care React incearca sa il randeze la prima evaluare in browser!\n\nCauze Comune:\n1. Utilizarea de API-uri specifice browserului inainte de mount: typeof window !== "undefined", localStorage, sau navigator.userAgent.\n2. Timp si Date Dinamice: new Date().toLocaleTimeString() va genera secunde diferite pe serverul de deploy fata de browserul utilizatorului.\n3. Structura HTML Invalida: Plasarea unui element block <div> in interiorul unui paragraf <p> (browserul corecteaza automat DOM-ul, stricand structura asteptata de React).',
    codeSnippet: `// Solutie sigura pentru date specifice clientului:
const [mounted, setMounted] = useState(false);

useEffect(() => {
    setMounted(true); // Se executa doar in browser dupa hidratare!
}, []);

if (!mounted) return <SkeletonLoader />;
return <div>User: {localStorage.getItem('username')}</div>;`,
    interviewTrap: 'Adaugarea suppressHydrationWarning pe un element poate ascunde avertismentul, dar nu repara problema de fond; foloseste un pattern mounted cu useEffect.',
    keyTakeaway: 'Asigura-te ca primul render pe client produce exact acelasi HTML ca cel generat pe server pentru a evita erorile de hidratare.'
  },
  {
    id: 'react-16',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Incremental Static Regeneration (ISR) in Next.js',
    question: 'Ce este ISR (Incremental Static Regeneration) in Next.js si cum combina avantajele SSG cu date actualizate la zi?',
    answer: 'ISR permite actualizarea paginilor statice in fundal, fara a fi nevoie sa reconstruiesti intreaga aplicatie de la zero (fara rebuild complet).\n\nCum functioneaza (revalidate: N secunde):\n1. La build time, pagina este generata static si servita instant din CDN (viteza SSG sub 20ms).\n2. Cand un utilizator acceseaza pagina dupa expirarea intervalului (ex: dupa 60 de secunde), CDN-ul ii serveste inca versiunea veche din cache (Stale).\n3. Simultan, Next.js genereaza in fundal o noua versiune statica proaspata a paginii.\n4. La urmatoarea cerere, toti utilizatorii vor primi pagina actualizata!',
    codeSnippet: `// In Next.js App Router:
export const revalidate = 60; // Revalideaza pagina la fiecare 60 de secunde

// Sau la nivel de fetch individual:
const res = await fetch('https://api.ats.com/jobs', {
    next: { revalidate: 60 }
});`,
    interviewTrap: 'ISR foloseste modelul "Stale-While-Revalidate": primul vizitator de dupa expirarea timpului primeste datele vechi, iar urmatorul vizitator le primeste pe cele noi.',
    keyTakeaway: 'ISR ofera viteza maxima de CDN pentru mii de pagini statice, pastrand datele proaspete la intervale regulate.'
  },
  {
    id: 'react-17',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'TypeScript in React: Type vs Interface si Typing de Props',
    question: 'Care este diferenta intre type si interface in TypeScript pentru aplicatii React si cum tastezi Props si Event Handlers?',
    answer: '1. interface vs type:\n- interface: Poate fi extinsa (extends) si suporta "Declaration Merging" (util pentru extinderea tipurilor din biblioteci externe). Recomandata pentru structuri de obiecte si Props de componente.\n- type: Mult mai flexibil: suporta Union Types (type Status = "ACTIVE" | "CLOSED"), Tuples, Mapped Types si tipuri primitive.\n\n2. Bune Practici de Typing in React:\n- Evita React.FC (nu aduce avantaje reale in TypeScript modern si complica children typing).\n- Foloseste functii simple cu interfete de Props.\n- Tasteaza corect evenimentele: React.ChangeEvent<HTMLInputElement> pentru input-uri si React.MouseEvent<HTMLButtonElement> pentru butoane.',
    codeSnippet: `interface JobCardProps {
    title: string;
    salary?: number; // Optional
    onApply: (jobId: string) => void;
}

export function JobCard({ title, salary = 0, onApply }: JobCardProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        console.log(e.target.value);
    };
    return <div>...</div>;
}`,
    interviewTrap: 'Nu folosi any pentru evenimente; TypeScript ofera tipuri precise precum React.FormEvent<HTMLFormElement> care previn erori de runtime.',
    keyTakeaway: 'Foloseste interface pentru componente Props si tasteaza precis evenimentele DOM cu tipurile native React.'
  },
  {
    id: 'react-18',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'TypeScript Utility Types Esentiale: Partial, Pick, Omit, Record',
    question: 'Cum utilizezi Partial, Pick, Omit si Record pentru a deriva tipuri noi fara duplicate de cod?',
    answer: 'Utility Types din TypeScript transforma tipurile existente:\n1. Partial<T>: Transforma toate campurile din T in campuri optionale (?) - perfect pentru DTO-uri de PATCH update.\n2. Required<T>: Transforma toate campurile in obligatorii.\n3. Pick<T, K>: Creeaza un tip nou alegand doar un subset specific de proprietati.\n4. Omit<T, K>: Creeaza un tip nou eliminand proprietatile specificate (ex: eliminarea id-ului la crearea unui obiect nou).\n5. Record<K, T>: Construieste un tip de dictionar/harta cu chei de tip K si valori de tip T.',
    codeSnippet: `interface Job {
    id: string;
    title: string;
    salary: number;
    description: string;
}

// 1. Omit id la creare:
type CreateJobDto = Omit<Job, 'id'>;

// 2. Partial pentru patch update:
type UpdateJobDto = Partial<CreateJobDto>;

// 3. Dictionar de joburi dupa ID:
type JobCache = Record<string, Job>;`,
    interviewTrap: 'Daca folosesti Omit si redenumesti ulterior o proprietate in interfata sursa, TypeScript nu te va avertiza decat daca folosesti chei strict tipizate.',
    keyTakeaway: 'Utility Types elimina duplicarea definitiilor de interfete si mentin consistenta modelului de date.'
  },
  {
    id: 'react-19',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'TanStack Query (React Query): Server State vs Client State',
    question: 'De ce este recomandat TanStack Query in locul useEffect-ului manual pentru preluarea datelor de pe server si cum functioneaza invalidarea?',
    answer: 'Problema cu useEffect pentru Fetching:\nNecesita zeci de linii repetitive de cod pentru: loading, error, abort controller, deduplicare, caching si refetching.\n\nTanStack Query (React Query):\n1. Separa Server State (date de pe server) de Client State (stare vizuala pura: modal deschis, tab selectat).\n2. Caching & Stale-While-Revalidate: Returneaza datele instant din cache-ul de memorie in timp ce face un fetch in fundal pentru a actualiza datele.\n3. Deduplicare Automata: Daca 3 componente cer acelasi query /jobs in aceeasi milisecunda, trimite o SINGURA cerere pe retea!\n4. Invalidare Declarativa: Dupa o mutatie (creare job), invalidezi cheia de query, iar React Query re-descarca automat lista de joburi.',
    codeSnippet: `// 1. Query cu caching automat:
const { data, isLoading } = useQuery({
    queryKey: ['jobs', filter],
    queryFn: () => fetchJobs(filter),
    staleTime: 1000 * 60 * 5 // Date considerate proaspete 5 minute
});

// 2. Mutatie cu invalidare automata a cache-ului:
const mutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
});`,
    interviewTrap: 'Setarea staleTime: 0 (default) face ca React Query sa refaca cererea la fiecare schimbare de fereastra; seteaza un staleTime rezonabil (ex: 1-5 minute) pentru date stabile.',
    keyTakeaway: 'TanStack Query gestioneaza automat starea de server, eliminand necesitatea useEffect-urilor manuale de preluare de date.'
  },
  {
    id: 'react-20',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'Controlled vs Uncontrolled Components in Formulare',
    question: 'Care este diferenta dintre o componenta controlata si una necontrolata si de ce formularele necontrolate sunt mai rapide?',
    answer: '1. Componenta Controlata (Controlled):\n- Valoarea input-ului este legata direct de o stare React: value={text} si onChange={(e) => setText(e.target.value)}.\n- React este "Single Source of Truth". Fiecare tasta apasata declanseaza o RE-RANDARE a componentei.\n- Utilizare: Cand ai nevoie de validare in timp real la fiecare caracter, formatare dinamica sau dezactivare dinamica a butonului.\n\n2. Componenta Necontrolata (Uncontrolled):\n- Valoarea input-ului este pastrata direct in memoria Real DOM a browserului.\n- Componenta React NU se re-randeaza la fiecare tasta tastata!\n- Valoarea se citeste la trimitere (submit) folosind useRef sau FormData.\n- Librarii precum React Hook Form folosesc abordarea necontrolata pentru a asigura performanta maxima la formulare mari cu zeci de campuri.',
    codeSnippet: `// Uncontrolled Form (Performanta maxima, zero re-randari):
function UncontrolledForm() {
    const inputRef = useRef(null);
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(inputRef.current.value);
    };
    return <form onSubmit={handleSubmit}><input ref={inputRef} /></form>;
}`,
    interviewTrap: 'Daca ai un formular cu 50 de campuri controlate prin useState separat, fiecare tasta tastata va re-randa intregul formular, cauzand lag vizibil!',
    keyTakeaway: 'Formularele controlate ofera control strict la fiecare tasta; formularele necontrolate aduc performanta maxima prin eliminarea re-randarilor.'
  },
  {
    id: 'react-21',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Core Web Vitals: LCP, INP si CLS in Aplicatii React',
    question: 'Ce masoara indicatorii Core Web Vitals (LCP, INP, CLS) si cum ii optimizezi intr-o aplicatie React / Next.js?',
    answer: 'Core Web Vitals sunt metricile oficiale Google pentru masurarea experientei utilizatorului:\n1. LCP (Largest Contentful Paint - Viteza de incarcare):\n- Masoara cat timp dureaza pana cand cel mai mare element vizibil (imagine mare, titlu H1) este desenat pe ecran. Tinta: < 2.5 secunde.\n- Optimizare: Folosire de Next.js Image cu atributul priority pe bannerul principal, Server-Side Rendering si CDN caching.\n\n2. INP (Interaction to Next Paint - Receptivitatea la click):\n- Inlocuieste vechiul FID. Masoara latenta raspunsului vizual dupa ce utilizatorul a dat click sau a tastat. Tinta: < 200 milisecunde.\n- Optimizare: Eliminarea sarcinilor lungi din thread-ul principal JS, folosirea useTransition si web workers.\n\n3. CLS (Cumulative Layout Shift - Stabilitatea vizuala):\n- Masoara cat de mult "sar" elementele pe ecran in timpul incarcarii (elemente care imping textul in jos pe masura ce se incarca imagini sau reclame). Tinta: < 0.1.\n- Optimizare: Rezervarea explicita a dimensiunilor (width si height) pe imagini si containere schelet (skeleton loaders).',
    codeSnippet: `// Prevenire CLS in Next.js:
<Image 
    src="/hero.webp" 
    alt="ATS Hero" 
    width={800} 
    height={400} 
    priority // Descarcare rapida pentru LCP excelent!
/>`,
    interviewTrap: 'Incarcarea de fonturi externe fara fallback de aceeasi marime cauzeaza sarituri mari de layout (FOUT/FOIT) si distruge scorul CLS.',
    keyTakeaway: 'LCP masoara incarcarea, INP masoara raspunsul la interactiune, iar CLS asigura stabilitatea vizuala fara deplasari bruste de elemente.'
  },
  {
    id: 'react-22',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Next.js Middleware la Nivel de Edge',
    question: 'Cum functioneaza Next.js Middleware si cum il folosesti pentru a redirectiona utilizatorii neautentificati inainte de randarea paginilor?',
    answer: 'Fisierul middleware.ts ruleaza la nivelul Edge (CDN / V8 worker ultra-usor) INAINTE ca cererea sa ajunga la server sau la pagina de React.\n\nAvantaje Majore:\n1. Viteza Extrema: Ruleaza in cativa milisecunde direct pe serverele locale Edge din apropierea utilizatorului.\n2. Securitate: Poate inspecta cookie-urile de autentificare sau header-ul Authorization; daca token-ul lipseste, face redirect instantaneu (NextResponse.redirect) catre /login fara a mai consuma resurse de server pentru randarea paginii protejate!\n3. Modificare de antete (headers), rescriere de URL-uri (rewrites) si geo-routing.',
    codeSnippet: `// middleware.ts in radacina proiectului:
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth_token');
    if (!token && request.nextUrl.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*']
};`,
    interviewTrap: 'Middleware-ul Edge foloseste un runtime limitat (Edge Runtime) si nu poate rula module Node.js native grele (precum fs sau crypto standard cu librarii C++).',
    keyTakeaway: 'Middleware-ul la nivel de Edge filtreaza cererile si asigura securitatea inainte ca aplicatia React sa fie atinsa.'
  },
  {
    id: 'react-23',
    category: 'REACT',
    difficulty: 'DIFICIL',
    title: 'Arhitectura React Fiber si Coordonarea Concurata',
    question: 'Ce a reprezentat rescrierea motorului React Fiber si cum a rezolvat problema "Stack Reconciler"-ului sincron din React 15?',
    answer: 'In React 15 si versiunile anterioare (Stack Reconciler):\nReconciliation-ul era un proces recursiv pur sincron. Daca arborele de componente era imens, procesul bloca firul principal de executie (Main Thread) al browserului timp de 100-200ms. In acest interval, utilizatorul nu putea tasta, face scroll sau da click (Frame Drops si inghetare de interfata).\n\nArhitectura React Fiber (React 16+):\n1. Fiber este o structura de date sub forma de lista inlantuita (Linked List) care reprezinta o unitate de lucru (Work Unit).\n2. Time Slicing & Prioritizare: Fiber sparge randarea in bucati mici de lucru. La fiecare 5 milisecunde, React verifica daca browserul are task-uri urgente (click, tastatura). Daca da, React PAUZEAZA randarea, lasa browserul sa raspunda utilizatorului, si apoi REIA randarea exact de unde a ramas!\n3. Faza de Randare (Render Phase) este acum complet asincrona si intreruptibila; doar faza de comitere pe Real DOM (Commit Phase) este sincrona si scurta.',
    codeSnippet: `// Structura unui nod Fiber simplificat:
type FiberNode = {
    type: any,
    stateNode: any, // Nodul Real DOM
    child: FiberNode | null,
    sibling: FiberNode | null,
    return: FiberNode | null, // Parintele
    alternate: FiberNode | null // Clona pentru Double Buffering
};`,
    interviewTrap: 'In faza Render, functiile de render ale componentelor pot fi apelate de mai multe ori daca un render este intrerupt si reluat; prin urmare, componentele trebuie sa fie functii pure fara efecte secundare in corpul lor!',
    keyTakeaway: 'React Fiber transforma randarea intr-un proces intreruptibil si prioritizabil, garantand o interfata fluida la 60 fps.'
  },
  {
    id: 'react-24',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Virtualizarea Listelor (Windowing) cu TanStack Virtual',
    question: 'Cum afisezi o lista de 50.000 de pozitii de joburi in browser fara ca pagina sa devina lenta sau sa consume sute de MB de RAM?',
    answer: 'Daca creezi 50.000 de noduri <div> reale in DOM, browserul se va bloca din cauza consumului urias de memorie si recalcularii continue a geometriei (Reflow/Repaint).\n\nSolutie: Virtualizarea Listelor (sau Windowing):\n1. Tehnica calculeaza pozitia de scroll a utilizatorului si randeaza in Real DOM DOAR elementele care sunt VIZIBILE in fereastra de afisare (viewport-ul curent, de exemplu fix 15-20 de elemente) plus cateva elemente de rezerva (overscan)!\n2. Un container parinte are o inaltime simulata egala cu toata lista (ex: 50.000 * 50px = 2.500.000px), pastrand bara de scroll functionala normal.\n3. Pe masura ce utilizatorul deruleaza, elementele vechi sunt demontate si inlocuite instantaneu cu cele noi, mentinand numarul de noduri din DOM constant la ~20!',
    codeSnippet: `import { useVirtualizer } from '@tanstack/react-virtual';

const rowVirtualizer = useVirtualizer({
    count: 50000,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // 60px per rand
});

// Se randeaza doar elementele din rowVirtualizer.getVirtualItems():
{rowVirtualizer.getVirtualItems().map(virtualRow => (
    <div key={virtualRow.index} style={{ height: virtualRow.size }}>
        Job #{virtualRow.index}
    </div>
))}`,
    interviewTrap: 'Paginarea traditionala este buna, dar daca specificatia de business cere scroll infinit pe mii de rezultate, virtualizarea este absolut obligatorie pentru a preveni colapsul memoriei.',
    keyTakeaway: 'Virtualizarea listelor mentine DOM-ul minuscul si viteza constanta la 60fps indiferent de marimea setului de date.'
  },
  {
    id: 'react-25',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'Prop Drilling si Component Composition ca Alternativa',
    question: 'Ce este "Prop Drilling" si cum poate fi eliminat prin Component Composition (pattern-ul children) fara a adauga un State Manager complex?',
    answer: 'Prop Drilling este anti-pattern-ul prin care transmiti un prop printr-un lant lung de componente intermediare (Parinte -> Copil -> Nepot -> Stranepot) care nu au nevoie de acel prop, doar pentru a-l livra la destinatie.\n\nSolutie fara Redux/Context: Component Composition (Pattern-ul children)\nIn loc ca Parintele sa trimita datele prin intermediari, Parintele randeaza direct componenta destinatie si o transmite ca prop children componentelor intermediare!\nComponentele intermediare nu mai stiu nimic despre date; ele functioneaza ca simple containere de layout.',
    codeSnippet: `// Cu Prop Drilling (Poluare de props):
// <Page user={user} /> -> <Sidebar user={user} /> -> <Profile user={user} />

// Cu Component Composition (Curat si decuplat):
<Page>
    <Sidebar>
        <Profile user={user} /> {/* User injectat direct la nivelul unde e cunoscut! */}
    </Sidebar>
</Page>`,
    interviewTrap: 'Nu sari direct sa adaugi Redux sau Context la prima problema de prop drilling; compozitia de componente rezolva adesea problema mult mai simplu si mai elegant.',
    keyTakeaway: 'Component Composition pastreaza componentele pure si decuplate prin utilizarea slot-urilor de tip children.'
  },
  {
    id: 'react-26',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'useLayoutEffect vs useEffect: Cand este Necesar?',
    question: 'Care este diferenta de sincronizare intre useEffect si useLayoutEffect si cum previne useLayoutEffect efectul de "flicker" vizual?',
    answer: '1. useEffect (Asincron, dupa Paint):\n- Ruleaza DUPA ce browserul a calculat layout-ul si a desenat pixelii pe ecran (Screen Paint).\n- Nu blocheaza randarea vizuala a paginii. Recomandat pentru 99% din operatiuni (fetch-uri, timere, logging).\n\n2. useLayoutEffect (Sincron, inainte de Paint):\n- Ruleaza SINCRON imediat dupa ce React a aplicat mutatiile pe DOM, dar INAINTE ca browserul sa deseneze pixelii pe ecran!\n- Browserul este blocat pana cand useLayoutEffect se termina.\n\nCand folosesti useLayoutEffect:\nCand trebuie sa masori dimensiunile reale ale unui nod DOM (getBoundingClientRect()) si sa ajustezi starea sau pozitia elementului in functie de masuratoare (de exemplu: pozitionarea unui Tooltip sau Dropdown). Daca ai folosi useEffect, utilizatorul ar vedea tooltip-ul aparand intr-un loc gresit si sarind apoi in pozitia corecta (vizual glitch/flicker)!',
    codeSnippet: `useLayoutEffect(() => {
    // Masoara DOM-ul inainte ca utilizatorul sa vada ecranul:
    const rect = ref.current.getBoundingClientRect();
    setTooltipPosition({ top: rect.bottom + 5, left: rect.left });
}, []);`,
    interviewTrap: 'useLayoutEffect genereaza avertismente pe server in aplicatii SSR/Next.js deoarece serverul nu are un arbore DOM de masurat.',
    keyTakeaway: 'useLayoutEffect este rezervat exclusiv pentru masuratori si ajustari sincrone de DOM care ar provoca flicker daca ar fi amanate.'
  },
  {
    id: 'react-27',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'useId in React 18: Identificatori Stabili pentru Accesibilitate',
    question: 'De ce Math.random() genereaza erori de hidratare la crearea de ID-uri de input si cum rezolva hook-ul useId aceasta problema?',
    answer: 'Problema la SSR:\nDaca generezi un ID cu "input-" + Math.random(), serverul va genera "input-0.42", iar browserul la hidratare va rula din nou Math.random() si va genera "input-0.89". Diferenta provoaca o eroare grava de Hydration Mismatch!\n\nSolutie: Hook-ul useId()\nuseId() genereaza un ID unic stabil si deterministic bazat pe pozitia exacta a componentei in arborele de componente React. Acelasi ID este garantat atat pe server, cat si pe client, facand legarea etichetelor <label htmlFor={id}> de <input id={id}> 100% sigura pentru accesibilitate (a11y).',
    codeSnippet: `function AccessibleInputField({ label }) {
    const id = useId();
    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <input id={id} type="text" />
        </div>
    );
}`,
    interviewTrap: 'Nu folosi useId() pentru a genera chei (key) in liste de elemente map(); cheile trebuie sa provina din datele unice ale fiecarui rand!',
    keyTakeaway: 'useId ofera identificatori unici compatibili cu SSR pentru atribute de accesibilitate fara riscuri de desincronizare.'
  },
  {
    id: 'react-28',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'AbortController pentru Anularea Cererilor HTTP in useEffect',
    question: 'Cum folosesti AbortController pentru a anula cererile de retea atunci cand componenta este demontata sau utilizatorul schimba tab-ul?',
    answer: 'Daca o cerere fetch() dureaza 2 secunde, iar utilizatorul paraseste pagina dupa 500ms, cererea continua sa ruleze in fundal. La finalizare, callback-ul va incerca sa actualizeze starea unei componente demontate, irosind memorie si provocand potentiale race conditions!\n\nSolutie: AbortController integrat in functia de cleanup:\n1. Creezi const controller = new AbortController().\n2. Transmiti parametrul signal: controller.signal in optiunile apelului fetch.\n3. In functia de cleanup a lui useEffect, apelezi controller.abort().\n4. Daca componenta se demonteaza, browserul taie instantaneu conexiunea HTTP!',
    codeSnippet: `useEffect(() => {
    const controller = new AbortController();

    fetch('/api/jobs?search=' + query, { signal: controller.signal })
        .then(res => res.json())
        .then(data => setJobs(data))
        .catch(err => {
            if (err.name !== 'AbortError') {
                setError(err); // Ignora erorile intentionate de abort
            }
        });

    return () => controller.abort(); // Anuleaza cererea la demontare sau noua tasta
}, [query]);`,
    interviewTrap: 'Cand cererea este anulata, fetch arunca o eroare de tip AbortError; asigura-te ca verifici err.name !== "AbortError" pentru a nu afisa un mesaj de eroare fals utilizatorului.',
    keyTakeaway: 'AbortController opreste scurgerile de memorie si suprascrierile de stare invechita prin anularea cererilor HTTP depasite.'
  },
  {
    id: 'react-29',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Next.js Server Actions: Executie Sigura pe Server',
    question: 'Ce sunt Server Actions in Next.js, cum sunt definite cu directiva "use server" si cum asiguri securitatea validarii datelor?',
    answer: 'Server Actions sunt functii asincrone care ruleaza direct pe serverul Next.js, dar pot fi apelate direct din componente client ca simple functii JavaScript sau prin atributul action al formularelor HTML!\n\nCaracteristici:\n- Elimina necesitatea scrierii manuale a rutelor de API (/api/create-job).\n- Suporta Progressive Enhancement: formularele functioneaza chiar daca JavaScript-ul este inca in curs de descarcare in browser!\n\nRegula Critica de Securitate:\nO Server Action este un ENDPOINT PUBLIC HTTP deschis in mod automat! Nu avea niciodata incredere oarba in parametrii primiti; valideaza intotdeauna sesiunea de autentificare si valideaza datele folosind o schema Zod inainte de a interactiona cu baza de date.',
    codeSnippet: `'use server';
import { z } from 'zod';
import { auth } from '@/lib/auth';

const JobSchema = z.object({ title: z.string().min(3) });

export async function createJobAction(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error('Neautorizat');

    const data = JobSchema.parse({ title: formData.get('title') });
    await db.job.create({ data });
}`,
    interviewTrap: 'Server Actions pot fi apelate de oricine prin cereri POST directe; intotdeauna verifica permisiunile utilizatorului la inceputul functiei action!',
    keyTakeaway: 'Server Actions simplifica comunicarea client-server pastrand logica de salvare pe server.'
  },
  {
    id: 'react-30',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'Debounce vs Throttle in Interfete React',
    question: 'Care este diferenta intre Debouncing si Throttling si cum implementezi un hook custom useDebounce pentru o bara de cautare?',
    answer: '1. Debounce (Amanare pana la pauza):\n- Asteapta ca utilizatorul sa se opreasca din tastat pentru o perioada de timp (ex: 300ms) inainte de a rula functia.\n- Daca utilizatorul tasteaza o noua tasta inainte de expirarea timpului, timerul se reseteaza.\n- Ideal pentru: Bare de cautare (autocomplete), salvare automata de ciorne.\n\n2. Throttle (Rata maxima fixa):\n- Garanteaza ca functia este executata cel mult o data la fiecare interval de timp (ex: o data la 200ms), indiferent de cate evenimente au loc.\n- Ideal pentru: Scroll events, redimensionare de fereastra (resize), miscarea mouse-ului.',
    codeSnippet: `// Custom Hook useDebounce:
function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => clearTimeout(handler); // Reseteaza timerul daca valoarea se schimba
    }, [value, delay]);

    return debouncedValue;
}`,
    interviewTrap: 'Daca apelezi o functie debounced inline direct in onChange={(e) => debounceFn(e.target.value)}, o functie noua se creeaza la fiecare render si debounce-ul nu va functiona niciodata! Foloseste useDebounce pe valoarea starii.',
    keyTakeaway: 'Debounce amana executia pana la oprirea evenimentelor; Throttle limiteaza frecventa de executie la o rata maxima constanta.'
  },
  {
    id: 'react-31',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Imutabilitate si Actualizari de Stare cu Spread Operator',
    question: 'De ce array.push() sau object.prop = "nou" nu declanseaza re-randarea in React si cum actualizezi corect starea imbricata?',
    answer: 'De ce mutatia directa esueaza:\nReact compara starea veche cu starea noua folosind egalitate de referinta superficiala: Object.is(oldState, newState).\nDaca modifici un array cu jobs.push(newJob), adresa de memorie a array-ului ramane aceeasi! React vede oldState === newState si decide ca nimic nu s-a schimbat, sarind peste re-randare!\n\nCum se pastreaza Imutabilitatea:\nSe creeaza intotdeauna un obiect sau array complet NOU in memorie folosind Spread Operator (...) sau librarii precum Immer.',
    codeSnippet: `// GRESIT (nu declanseaza re-randare):
// user.address.city = 'Cluj'; setUser(user);

// CORECT (Obiect nou la fiecare nivel modificat):
setUser(prev => ({
    ...prev,
    address: {
        ...prev.address,
        city: 'Cluj'
    }
}));

// Adaugare in array:
setJobs(prev => [...prev, newJob]);`,
    interviewTrap: 'Spread operatorul face o copie superficiala (Shallow Copy); campurile imbricate (nested objects) partajeaza aceeasi referinta daca nu le clonezi si pe ele explicit!',
    keyTakeaway: 'Creeaza intotdeauna instante noi de referinta pentru a informa React ca starea a fost modificata.'
  },
  {
    id: 'react-32',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Optimizarea Imaginilor in Next.js cu next/image',
    question: 'De ce componenta Image din Next.js este superioara tagului clasic img si cum reduce dimensiunea paginilor?',
    answer: 'Tagul HTML <img> descarca imaginea originala bruta, adesea supradimensionata si neoptimizata.\n\nCe face automat componenta <Image /> din Next.js:\n1. Conversie Automata de Format: Transforma imaginile JPEG/PNG in formate moderne de noua generatie mult mai usoare (WebP si AVIF) compatibile cu browserul vizitatorului.\n2. Dimensiuni Responsive (srcset): Redimensioneaza imaginea la marimea exacta a ecranului clientului (nu serveste o imagine de 4K unui utilizator de mobil!).\n3. Prevenirea CLS (Cumulative Layout Shift): Cere obligatoriu proprietatile width si height sau fill pentru a rezerva spatiul exact pe pagina inainte de descarcarea imaginii.\n4. Lazy Loading Nativ: Imaginile aflate sub linia de vizibilitate (below the fold) sunt descarcate doar cand utilizatorul deruleaza pana in apropierea lor.',
    codeSnippet: `import Image from 'next/image';

<Image
    src="/company-logo.png"
    alt="Logo Companie"
    width={200}
    height={50}
    placeholder="blur" // Efect vizual elegant blurat pana la incarcare
    blurDataURL="data:image/jpeg;base64,..."
/>`,
    interviewTrap: 'Daca folosesti o imagine externa dintr-un URL absolut (ex: de pe AWS S3), trebuie sa configurezi explicit domeniul in next.config.js sub remotePatterns!',
    keyTakeaway: 'next/image aduce optimizari automate de compresie, formate moderne si responsive sizing pentru un scor Web Vitals maxim.'
  },
  {
    id: 'react-33',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Tailwind CSS vs CSS Modules in Aplicatii Moderne',
    question: 'De ce a devenit Tailwind CSS solutia dominanta in aplicatiile React moderne si de ce a inlocuit CSS-in-JS (Styled-Components)?',
    answer: '1. Declinul CSS-in-JS (Styled Components / Emotion):\nLibrariile CSS-in-JS clasice calculeaza stilurile la runtime in JavaScript si injecteaza taguri <style> in DOM. Aceasta genereaza un overhead mare de performanta de calcul si este fundamental INCOMPATIBILA cu React Server Components (RSC) din Next.js!\n\n2. Succesul Tailwind CSS:\n- Zero Runtime Overhead: Este un compilator (PostCSS) care scaneaza codul la build time si genereaza un singur fisier CSS static minimalist continand doar clasele folosite.\n- Viteza de dezvoltare: Scrii stilurile direct in JSX fara a comuta intre fisiere sau a inventa nume de clase BEM.\n- Design System Unificat: Asigura consistenta de culori, spatiere si tipografie prin design tokens standardizate.',
    codeSnippet: `// Componenta cu Tailwind CSS:
export function Badge({ children }) {
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            {children}
        </span>
    );
}`,
    interviewTrap: 'Evita concatenarea dinamica de string-uri Tailwind de tip className={`bg-${color}-500`}, deoarece compilatorul Tailwind nu poate detecta clasele dinamice incomplete la build time!',
    keyTakeaway: 'Tailwind CSS elimina overhead-ul de runtime si ofera viteza maxima compatibila nativ cu React Server Components.'
  },
  {
    id: 'react-34',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'React.memo: Cand previne re-randarea si cand este inutil?',
    question: 'Cum functioneaza React.memo, ce comparatie face in mod implicit si cand NU protejeaza componenta de re-randare?',
    answer: 'React.memo este o componenta de ordin superior (Higher Order Component) care memoreaza rezultatul randat al unei componente:\n1. Functionare: Compara noile props cu vechile props folosind egalitate superficiala (shallow comparison - Object.is).\n2. Daca toate proprietatile primitive (string, number, boolean) sunt identice, React sare peste re-randarea componentei si refoloseste rezultatul anterior.\n\nCand NU protejeaza de re-randare:\nDaca componenta parinte trimite un obiect, un array sau o functie inline: <Child user={{name: "Ana"}} onClick={() => doSomething()} />.\nLa fiecare randare a parintelui, obiectul si functia au REFERINTE NOI in memorie! Comparatia shallow esueaza intotdeauna, facand React.memo complet inutil daca nu combini proprietatile cu useMemo si useCallback!',
    codeSnippet: `// Componenta copil memoizata:
const ExpensiveList = React.memo(function ExpensiveList({ items, onItemClick }) {
    return <ul>{items.map(i => <li key={i.id}>{i.name}</li>)}</ul>;
});`,
    interviewTrap: 'Infasurarea fiecarei componente din aplicatie in React.memo este un anti-pattern; comparatiile de props adauga un mic cost de CPU care poate depasi castigul pe componente simple.',
    keyTakeaway: 'React.memo este eficient doar pe componente mari cu randari costisitoare si props stabile sau memoizate.'
  },
  {
    id: 'react-35',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Custom Hooks in React: Bune Practici si Reguli Stricte',
    question: 'Ce este un Custom Hook in React, ce reguli trebuie sa respecte si cum partajeaza logica de stare fara a partaja starea in sine?',
    answer: 'Un Custom Hook este o simpla functie JavaScript al carei nume incepe cu "use" si care poate apela alte hook-uri React (useState, useEffect etc.).\n\nRegula Fundamentala a Starii:\nCustom Hooks partajeaza LOGICA cu stare, dar NU partajeaza starea in sine! Fiecare componenta care apeleaza useMyHook() primeste propria sa instanta complet izolata si independenta de stare.\n\nRegulile Hooks (Rules of Hooks):\n1. Apeleaza hook-urile doar la nivelul de top al functiei (nu in interiorul de if-uri, bucle for sau functii imbricate).\n2. Apeleaza hook-urile doar din functii componente React sau din alte custom hooks.',
    codeSnippet: `// Custom hook pentru monitorizarea starii de retea online/offline:
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
    interviewTrap: 'Daca o functie nu apeleaza niciun alt hook React inauntrul sau, nu ar trebui sa aiba prefixul "use"; este o simpla functie utilitara pura.',
    keyTakeaway: 'Custom Hooks permit reutilizarea curata a logicii de stare intre componente diferite pastrand starea complet izolata.'
  },
  {
    id: 'react-36',
    category: 'REACT',
    difficulty: 'DIFICIL',
    title: 'Profiling si Identificarea Re-randarilor cu React DevTools',
    question: 'Cum folosesti React Developer Tools Profiler pentru a depista re-randarile inutile si ce inseamna "Why did this render"?',
    answer: 'React Developer Tools Profiler inregistreaza fiecare ciclu de randare (Commit) al aplicatiei tale:\n1. Flamegraph Chart: Afiseaza componentele ca bare colorate. Cu cat bara e mai galbena/lunga, cu atat randarea componentei a durat mai mult timp.\n2. Ranked Chart: Ordoneaza componentele descrescator dupa timpul de executie pentru a vedea instantaneu cel mai lent modul.\n3. Optiunea "Record why each component rendered":\nCand este bifata in setari, facand click pe o componenta dupa inregistrare, profilatorul iti arata exact CAUZA re-randarii:\n- "Hook 2 changed" (o anumita stare locala s-a modificat)\n- "Props changed: onClick" (o functie a primit o referinta noua dintr-un parinte nememoizat)\n- "Parent component rendered" (componenta s-a re-randat simplu pentru ca s-a re-randat parintele ei).',
    codeSnippet: `// Sfaturi practice de profilare:
// 1. Profilati intotdeauna pe un build de PRODUCTIE local (npm run build && npm run start),
// deoarece modul de dezvoltare contine verificari interne suplimentare siStrict Mode care dubleaza timpii!`,
    interviewTrap: 'Profilarea in modul "Development" ofera timpi inselatori din cauza verificarii duplicate a efectelor din React.StrictMode.',
    keyTakeaway: 'Profiler-ul din React DevTools identifica cu precizie milimetrica blocajele de performanta si props-urile instabile care provoaca re-randari.'
  },
  {
    id: 'react-37',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Micro-Frontends cu Webpack Module Federation',
    question: 'Ce este arhitectura de Micro-Frontends si cum permite Module Federation partajarea componentelor intre aplicatii independente la runtime?',
    answer: 'Similar cu descompunerea unui backend monolitic in microservicii, Micro-Frontends imparte o aplicatie frontend mare pe domenii de business independente (ex: Echipa A detine Aplicatia de Job Search, Echipa B detine Dashboard-ul de Aplicari):\n\nModule Federation (Webpack 5):\n1. Permite unei aplicatii gazda (Host) sa incarce componente JavaScript dintr-o aplicatie la distanta (Remote) direct la RUNTIME prin retea, fara ca aplicatiile sa fie recompilate impreuna!\n2. Partajare de Dependinte (Shared Dependencies): Module Federation garanteaza ca daca atat Host-ul cat si Remote-ul folosesc React 18, browserul va descarca React o singura data in memorie!\n3. Echipele pot face deploy complet independent pe branch-uri si orare diferite.',
    codeSnippet: `// In webpack.config.js (Module Federation):
new ModuleFederationPlugin({
    name: 'ats_host',
    remotes: {
        jobSearchApp: 'jobSearch@https://jobs.ats.com/remoteEntry.js',
    },
    shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
});`,
    interviewTrap: 'Micro-frontends aduc o complexitate uriasa de routing, sincronizare de teme vizuale si depanare; sunt justificate doar in organizatii mari cu zeci de echipe frontend paralele.',
    keyTakeaway: 'Module Federation permite echipelor autonome sa livreze aplicatii independente asamblate fluid la runtime in browser.'
  },
  {
    id: 'react-38',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'TypeScript Generics in Custom Hooks',
    question: 'Cum scrii un Custom Hook generic (ex: useLocalStorage<T>) complet tipizat in TypeScript?',
    answer: 'Folosirea genericului <T> permite hook-ului sa functioneze cu orice tip de date (obiect, lista, numar sau string), pastrand typesafety total la apelare fara a folosi any.',
    codeSnippet: `function useLocalStorage<T>(key: string, initialValue: T): [T, (val: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = (val: T | ((prev: T) => T)) => {
        const valueToStore = val instanceof Function ? val(storedValue) : val;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
    };

    return [storedValue, setValue];
}`,
    interviewTrap: 'Daca folosesti any in loc de <T>, pierzi complet beneficiile de autocompletare si verificare de tipuri din TypeScript la utilizarea valorii returnate.',
    keyTakeaway: 'Genericele TypeScript ofera reutilizabilitate maxima si siguranta tipurilor pentru custom hooks polimorfice.'
  },
  {
    id: 'react-39',
    category: 'REACT',
    difficulty: 'USOR',
    title: 'Fragment in React (<>...</>): De ce nu folosim un <div> suplimentar',
    question: 'De ce este recomandat React Fragment in locul unui container <div> si cum influenteaza flexbox sau tabelele HTML?',
    answer: 'In React, o componenta trebuie sa returneze un singur nod radacina.\n\nDe ce sa NU adaugi un <div> inutil (DOM Wrapper Hell):\n1. Poluare de DOM: Fiecare <div> adauga memorie si noduri inutile in arborele browserului.\n2. Distruge Layout-ul CSS: Daca parintele are display: flex sau display: grid, copiii directi ai flex-ului sunt elementele de layout. Un <div> intermediar injectat rupe alinierea coloanelor!\n3. Tabele HTML Invalide: Nu poti pune un <div> in interiorul unui <tr> (doar <td> sau <th> sunt permise conform specificatiei HTML).\n\nSolutie: <React.Fragment> sau sintaxa scurta <>...</>\nGrupeaza copiii fara a adauga niciun nod fizic in Real DOM!',
    codeSnippet: `// Corect: Nu adauga niciun nod suplimentar in DOM:
function TableCells() {
    return (
        <>
            <td>Mihai</td>
            <td>Senior Java Developer</td>
        </>
    );
}`,
    interviewTrap: 'Sintaxa scurta <>...</> nu suporta transmiterea proprietatii key; daca ai nevoie de key intr-o bucla map(), trebuie sa folosesti sintaxa explicita: <React.Fragment key={item.id}>.',
    keyTakeaway: 'React Fragment grupeaza elemente adiacente fara a polua arborele DOM sau a interfera cu layout-urile CSS.'
  },
  {
    id: 'react-40',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Next.js App Router: Layouts, Templates si Navigare Nestata',
    question: 'Care este diferenta critica intre layout.tsx si template.tsx in Next.js App Router la navigarea intre pagini?',
    answer: '1. layout.tsx (Pastreaza starea si nu se re-randeaza):\n- Inveleste paginile si este partajat pe toate rutele din acel director.\n- La navigarea intre rute surori (ex: de la /dashboard/jobs la /dashboard/analytics), layout.tsx NU SE RE-RANDEAZA si NU se demonteaza!\n- Pastreaza intacta starea interna (ex: textul tastat intr-un input de cautare din sidebar sau scroll-ul).\n\n2. template.tsx (Se remonteaza la fiecare navigare):\n- Creeaza o instanta COMPLET NOUA pentru fiecare pagina vizitata.\n- La fiecare navigare, componentele din template se demonteaza si se remonteaza, resetand starea si declansand din nou hook-urile useEffect.\n- Utilizare: Animatii de intrare de pagina (page enter transitions) sau logare de afisari (pageview logging).',
    codeSnippet: `// app/dashboard/layout.tsx:
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex">
            <Sidebar /> {/* Ramane montat continuu, fara re-randare! */}
            <main className="flex-1">{children}</main>
        </div>
    );
}`,
    interviewTrap: 'Daca plasezi logica de animatie intrare-pagina intr-un layout.tsx, animatia va rula doar la prima accesare si nu se va declansa la navigarile ulterioare intre paginile copil.',
    keyTakeaway: 'layout.tsx optimizeaza performanta prin persistenta starii; template.tsx ofera o instantiere proaspata la fiecare ruta.'
  },
  {
    id: 'react-41',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Optimizarea Bundler-ului: Vite vs Webpack',
    question: 'De ce Vite este de 10-100 de ori mai rapid la pornire in modul de dezvoltare fata de Webpack clasic?',
    answer: '1. Webpack (Abordare Clasica bazata pe Bundling):\nInainte de a porni serverul local de dev, Webpack trebuie sa parcurga, sa rezolve si sa impacheteze (bundle) TOATE fisierele JavaScript din intreaga aplicatie intr-un singur fisier mare de memorie. Pe proiecte mari cu 5.000 de fisiere, pornirea dureaza 30-90 de secunde!\n\n2. Vite (Native ES Modules in Browser):\n- Porneste serverul INSTANTANEU (< 300 milisecunde)!\n- Vite nu face bundling in timpul dezvoltarii: lasa browserul sa ceara fiecare fisier individual la cerere prin suportul nativ de <script type="module">.\n- Pre-bundling de dependinte externe ultra-rapid compilat in limbajul Go nativ cu esbuild.\n- HMR (Hot Module Replacement) fulgerator: cand modifici un fisier, doar acel modul exact este trimis catre browser.',
    codeSnippet: `// Vite serveste direct fisierul exact cerut de browser la cerere:
// GET /src/components/JobCard.jsx -> compilat si returnat instant in milisecunde!`,
    interviewTrap: 'In modul de productie (vite build), Vite foloseste Rollup pentru a genera pachete optimizate clasice de fisiere statice pentru performanta maxima de livrare pe CDN.',
    keyTakeaway: 'Vite transforma experienta de dezvoltare prin utilizarea modulelor native din browser si a compilatorului esbuild scris in Go.'
  },
  {
    id: 'react-42',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Accesibilitate (a11y) in React: Bune Practici Esentiale',
    question: 'Cum asiguri accesibilitatea (a11y) pentru cititoarele de ecran in aplicatii interactive React?',
    answer: 'Bune Practici Critice de Accesibilitate:\n1. HTML Semantic inainte de ARIA: Foloseste tagul nativ <button> in loc de <div onClick={...}>; butoanele native au suport integrat pentru tastatura (Enter/Space) si anuntare vocala pentru cititoare de ecran.\n2. Atribute ARIA cand semantica lipseste:\n   - aria-label: Text descriptiv pentru butoane cu iconite simple (ex: <button aria-label="Inchide fereastra"><XIcon /></button>).\n   - aria-expanded: Indica starea deschisa/inchisa a unui meniu acordeon sau dropdown.\n3. Focus Management: La deschiderea unei ferestre modale, muta automat focusul pe primul element din modal cu ref.current.focus(), si blocheaza tasta Tab in interiorul modalului (Focus Trap).\n4. Contrast de Culori: Raport minim de contrast de 4.5:1 conform standardului WCAG AA.',
    codeSnippet: `// Buton accesibil cu cititor de ecran:
<button 
    aria-label="Aplica la pozitia de Java Developer"
    aria-busy={isLoading}
    disabled={isLoading}
    className="btn-primary"
>
    {isLoading ? <Spinner /> : 'Aplica'}
</button>`,
    interviewTrap: 'Nu pune niciodata tabIndex={0} pe elemente non-interactive fara a adauga si handlere de onKeyDown; altfel utilizatorii de tastatura ajung pe element dar nu il pot activa.',
    keyTakeaway: 'HTML-ul semantic nativ si gestionarea atenta a focusului garanteaza o aplicatie accesibila tuturor utilizatorilor.'
  },
  {
    id: 'react-43',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'React Portals (createPortal): Cand si de ce se folosesc',
    question: 'Ce este ReactDOM.createPortal si cum rezolva problemele de z-index si overflow: hidden la ferestre modale si tooltip-uri?',
    answer: 'Problema Ierarhiei DOM:\nDaca ai o componenta Modal sau Tooltip adanc imbricata intr-un parinte care are stilul CSS overflow: hidden sau z-index: 1, fereastra modala va fi taiata la margini sau ascunsa in spatele altor elemente de pe pagina!\n\nSolutie: ReactDOM.createPortal(children, domNode)\nPermite randarea structurii vizuale HTML a unei componente intr-un alt loc din Real DOM (de obicei direct in document.body), pastrand in acelasi timp toate proprietatile si transmiterea evenimentelor React (Event Bubbling) intacte in arborele logic React!\nEvenimentele de click din interiorul modalului continua sa se propage catre parintii logici din React.',
    codeSnippet: `import { createPortal } from 'react-dom';

function Modal({ isOpen, children }) {
    if (!isOpen) return null;

    // Se randeaza fizic direct in <body>:
    return createPortal(
        <div className="modal-backdrop">
            <div className="modal-content">{children}</div>
        </div>,
        document.body
    );
}`,
    interviewTrap: 'Desi modalul este randat fizic direct in document.body, un eveniment onClick din interiorul lui se propaga in sus prin arborele React catre parintele sau logic!',
    keyTakeaway: 'Portals permit randarea componentelor la nivelul radacinii paginii pentru a evita capcanele de layout si z-index din CSS.'
  },
  {
    id: 'react-44',
    category: 'REACT',
    difficulty: 'DIFICIL',
    title: 'Optimistic UI Updates cu TanStack Query si Rollback',
    question: 'Cum configurezi un Optimistic Update complet cu onMutate, onError si onSettled in TanStack Query?',
    answer: 'Un Optimistic Update actualizeaza interfata instantaneu inainte ca serverul sa confirme scrierea, oferind o senzatie de viteza uimitoare.\n\nEtapele Canonice in TanStack Query:\n1. onMutate: Anuleaza orice interogare in desfasurare pentru a nu suprascrie starea optimista. Salveaza un snapshot al starii vechi din cache (pentru rollback). Actualizeaza direct cache-ul cu noua valoare optimista.\n2. onError: Daca cererea de retea pica (500 Internal Error), extrage snapshot-ul salvat si restaureaza starea veche (Rollback complet)!\n3. onSettled: Revalideaza query-ul (invalidateQueries) indiferent de succes sau esec pentru a resincroniza starea cu baza de date oficiala.',
    codeSnippet: `const queryClient = useQueryClient();

const mutation = useMutation({
    mutationFn: toggleFavoriteJob,
    onMutate: async (jobId) => {
        await queryClient.cancelQueries({ queryKey: ['jobs'] });
        const previousJobs = queryClient.getQueryData(['jobs']);

        // Actualizare optimista in cache:
        queryClient.setQueryData(['jobs'], (old: any) => 
            old.map((j: any) => j.id === jobId ? { ...j, isFavorite: !j.isFavorite } : j)
        );

        return { previousJobs }; // Context returnat pentru rollback
    },
    onError: (err, newTodo, context) => {
        // Rollback daca cererea a picat!
        queryClient.setQueryData(['jobs'], context?.previousJobs);
    },
    onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ['jobs'] });
    }
});`,
    interviewTrap: 'Daca uiti sa anulezi query-urile active cu cancelQueries inainte de actualizarea optimista, un raspuns lent de retea vechi poate suprascrie starea optimista!',
    keyTakeaway: 'Salvarea snapshot-ului in onMutate si restaurarea lui in onError garanteaza o experienta vizuala instantanee si sigura.'
  },
  {
    id: 'react-45',
    category: 'REACT',
    difficulty: 'MEDIU',
    title: 'Dynamic Routing si Route Groups in Next.js App Router',
    question: 'Cum folosesti Dynamic Segments ([id]), Catch-all ([...slug]) si Route Groups ((auth)) in structura de directoare Next.js?',
    answer: 'In Next.js App Router, structura de foldere dicteaza rutele URL:\n1. Dynamic Segments ([id]): Mapeaza un parametru dinamic: app/jobs/[id]/page.tsx raspunde la /jobs/42. Parametrul este accesat prin params.id.\n2. Catch-all Segments ([...slug]): Mapeaza segmente multiple: app/docs/[...slug]/page.tsx raspunde la /docs/react/hooks/usestate.\n3. Optional Catch-all ([[...slug]]): Raspunde si la ruta radacina /docs fara segmente aditionale.\n4. Route Groups (paranteze rotunde: (marketing), (dashboard)):\nPermit organizarea logica a codului si impartirea pe layout-uri diferite FARA a afecta structura URL-ului public! De exemplu: app/(auth)/login/page.tsx este accesibil la /login (fara cuvantul auth in URL).',
    codeSnippet: `// Structura directoare Next.js:
// app/
//   (auth)/
//     login/page.tsx       --> /login
//     register/page.tsx    --> /register
//   (main)/
//     jobs/[id]/page.tsx   --> /jobs/123`,
    interviewTrap: 'Folderul (auth) cu paranteze rotunde nu apare in URL, in timp ce un folder fara paranteze auth/login va crea URL-ul /auth/login.',
    keyTakeaway: 'Route Groups permit aplicarea de layout-uri specifice pe grupuri de pagini fara a polua URL-urile publice.'
  }
];
