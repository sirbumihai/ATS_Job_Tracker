// Deck Masiv: React 18/19, Virtual DOM, Hooks, Next.js & Frontend Performance
// Preluat din: sudheerj/reactjs-interview-questions, React Official Docs, DopplerHQ
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
  }
];
