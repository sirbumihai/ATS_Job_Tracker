// Comprehensive Roadmap & Interview Preparation Data for all Tech Job Tracks
// Aligned with real Romanian & European IT market requirements (2026)
// STRICT ZERO DIACRITICS POLICY

export const JOB_TRACKS = [
  {
    id: 'BACKEND',
    title: 'Backend Development',
    shortTitle: 'Backend',
    badge: 'Cerere #1 in Romania',
    iconKey: 'Server',
    tagLine: 'Arhitectura scalabila, microservicii, logica de business, baze de date relationale si API-uri de mare performanta.',
    salaryJunior: '4.500 - 7.500 RON net',
    salaryMid: '8.500 - 15.000 RON net',
    marketDemand: 'Peste 35% din toate anunturile IT de Junior / Mid din Romania',

    // PILLAR 1: CUM AJUNGI LA INTERVIU (CV & ATS)
    reachInterview: {
      mustHaveSkills: [
        { name: 'Java (17/21) sau C# (.NET 8) sau Python', level: 'CRITIC', desc: 'Sintaxa moderna, colectii, POO riguros si multithreading.' },
        { name: 'Spring Boot 3 sau ASP.NET Core sau FastAPI', level: 'CRITIC', desc: 'Dependency Injection, REST Controllers, ORM (JPA/Hibernate sau EF Core).' },
        { name: 'Baze de Date Relationale & SQL (PostgreSQL)', level: 'CRITIC', desc: 'Indecsi B-Tree, JOIN-uri complexe, tranzactii ACID si normalizare 3NF.' },
        { name: 'Docker & Docker Compose', level: 'ESENTIAL', desc: 'Containerizare multi-stage, retele interne, variabile de mediu.' },
        { name: 'Git & GitHub Workflows', level: 'ESENTIAL', desc: 'Branching feature-based, pull requests, conventional commits.' },
        { name: 'Unit & Integration Testing (JUnit 5, Mockito)', level: 'ESENTIAL', desc: 'Testare automata pentru servicii si repository-uri mockuite.' },
        { name: 'Caching & Cozi (Redis, RabbitMQ / Kafka)', level: 'AVANTAJ', desc: 'Diferentiator major fata de restul aplicantilor juniori.' }
      ],
      recommendedProject: {
        title: 'Platforma de Procesare si Rezervari cu Microservicii / API Modular',
        description: 'Construieste un backend modular (ex: sistem de plati/rezervari, tracker de joburi cu web crawler sau platforma e-commerce) cu autentificare securizata JWT, rate limiting, persistenta PostgreSQL si containerizare Docker.',
        keyFeatures: [
          'Autentificare & Autorizare RBAC pe baza de JWT si refresh tokens',
          'Documentare interactiva completa cu Swagger / OpenAPI v3',
          'Optimizare interogari SQL cu indecsi si eliminarea problemei N+1 query',
          'Suita de teste automate (JUnit 5 + Mockito + Testcontainers) cu minim 80% coverage',
          'Fisier docker-compose.yml pentru pornirea integrala a bazei de date si aplicatiei'
        ],
        githubAdvice: 'Include un README detaliat cu arhitectura aplicatiei (diagrama Mermaid), instructiuni de pornire intr-o singura comanda (docker compose up) si exemple de request/response cURL.'
      },
      googleXyzBullet: 'Dezvoltat si implementat un sistem backend modular in Java 21 si Spring Boot 3 cu persistenta PostgreSQL, integrat Redis pentru caching si redus timpul de raspuns al API-urilor cu 42% sub o sarcina de 800 req/sec.',
      cvScreenTips: [
        'Nu trece doar "Java" sau "C#" pe CV. Scrie versiunea exacta ("Java 21", "C# .NET 8") si framework-ul asociat ("Spring Boot 3.3").',
        'Pune link-ul direct catre repozitoriul GitHub in primele 3 randuri din CV. Recruiterii tehnici se uita la claritatea commit-urilor.',
        'Evita proiectele de tip "ToDo List" sau teme de laborator facultate. Un singur proiect amplu de tip SaaS sau microserviciu cantareste de 10x mai mult.'
      ],
      commonMistakes: [
        'Lipsa testelor unitare in proiectele de pe GitHub (da impresia de cod neterminat).',
        'Hardcodarea credentialelor (parole baze de date) in cod in loc de variabile de mediu / .env.',
        'Lipsa explicatiilor privind modelarea bazei de date (tabele, relatii Many-to-One, indecsi).'
      ]
    },

    // PILLAR 2: CUM IEI INTERVIUL TEHNIC
    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Easy pana la Medium (Top 50 clasice)',
        patterns: ['Arrays & HashMaps (Two Sum, Group Anagrams)', 'Two Pointers & Sliding Window', 'Linked Lists & Fast/Slow Pointer', 'Trees & BFS/DFS Traversal', 'Binary Search'],
        tips: 'La live coding, comunica permanent! Explica abordarea brute-force inainte de optimizare, scrie cod curat cu nume descriptive si analizeaza complexitatea Time O(...) si Space O(...).'
      },
      topQuestions: [
        {
          q: 'Care este diferenta dintre Heap si Stack in gestionarea memoriei?',
          a: 'Stack-ul aloca memorie pentru apeluri de metode si variabile primitive locale (executie rapida LIFO, curatare automata la iesirea din scope). Heap-ul este spatiul comun unde traiesc obiectele instantiate, fiind administrat de Garbage Collector.',
          category: 'Fundamente Limbaj'
        },
        {
          q: 'Cum functioneaza intern un HashMap in Java si cum se gestioneaza coliziunile?',
          a: 'HashMap foloseste un array intern de bucket-uri calculand indexul prin hash(key). La coliziune (doi chei cu acelasi bucket index), elementele sunt legate intr-o lista inlantuita. Incepand cu Java 8, daca un bucket depaseste 8 noduri (TREEIFY_THRESHOLD), lista devine arbore rosu-negru O(log n).',
          category: 'Colectii & Structuri de Date'
        },
        {
          q: 'Ce sunt proprietatile ACID si ce este problema N+1 in JPA/Hibernate?',
          a: 'ACID garanteaza Atomicitate, Consistenta, Izolare si Durabilitate a tranzactiilor. Problema N+1 apare cand un query incarca N parinti si apoi genereaza N query-uri secundare pentru copiii din relatia lazy; se rezolva cu JOIN FETCH in JPQL sau @EntityGraph.',
          category: 'Baze de Date & ORM'
        },
        {
          q: 'Cum functioneaza Dependency Injection si care sunt scopurile (scopes) de bean-uri in Spring?',
          a: 'Dependency Injection implementeaza Inversion of Control: containerul Spring Instantiaza si injecteaza dependintele la runtime. Bean-urile sunt prin default Singleton (o instanta per container), dar pot fi si Prototype (instanta noua per cerere), Request, Session sau Application.',
          category: 'Framework Internals'
        }
      ],
      trickyQuestions: [
        {
          q: 'Ce se intampla cand o metoda marcata cu @Transactional apeleaza o alta metoda @Transactional(propagation = REQUIRES_NEW) din aceeasi clasa?',
          a: 'Noua tranzactie NU va fi creata! Deoarece apelul este intern (self-invocation via this), el nu trece prin proxy-ul generat de Spring AOP, deci adnotarea celei de-a doua metode este ignorata complet.',
          why: 'Testeaza daca intelegi mecanismul din spatele Spring AOP Proxies sau doar pui adnotari mecanic.'
        },
        {
          q: 'Care este diferenta dintre equals() si hashCode() si de ce trebuie mereu suprascrie impreuna?',
          a: 'Daca doua obiecte sunt egale conform equals(), ele TREBUIE sa aiba acelasi hashCode(). Altfel, in colectii bazate pe hash (HashSet, HashMap), obiectele egale vor ajunge in bucket-uri diferite si nu vor mai putea fi regasite.',
          why: 'Una dintre cele mai frecvente intrebari de departajare la interviurile de Java / C#.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unui URL Shortener (ex: bit.ly) sau Rate Limiter',
        keyPoints: [
          'Generare hash scurt (Base62 pe ID secvential sau hashing MD5/SHA256)',
          'Schema SQL: id (bigint), original_url, short_code, created_at, expires_at',
          'Cache Redis pe short_code pentru redirect instant cu latenta sub 5ms',
          'Status HTTP corect: 301 (Moved Permanently) vs 302 (Found - permite contorizare click-uri)'
        ]
      }
    },

    // PILLAR 3: DE UNDE SI CUM INVETI GRATIS
    freeResources: [
      {
        title: 'Roadmap.sh Backend Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/backend',
        type: 'ROADMAP',
        description: 'Ghidul vizual interactiv numarul 1 in lume pentru toate ramurile de backend.',
        isTopPick: true
      },
      {
        title: 'University of Helsinki - Java Programming I & II',
        platform: 'Mooc.fi (Univ. Helsinki)',
        url: 'https://java-programming.mooc.fi/',
        type: 'COURSE',
        description: 'Cel mai bun curs gratuit de Java din lume, cu exercitii practice si verificator automat in IDE.',
        isTopPick: true
      },
      {
        title: 'Baeldung - Ghiduri & Tutoriale Spring Boot',
        platform: 'Baeldung.com',
        url: 'https://www.baeldung.com/spring-boot',
        type: 'DOCS',
        description: 'Enciclopedia de referinta pentru Java si Spring, explicata clar cu exemple de cod gata de rulat.',
        isTopPick: true
      },
      {
        title: 'NeetCode 150 & Blind 75 (Coding Interviuri)',
        platform: 'NeetCode.io',
        url: 'https://neetcode.io/practice',
        type: 'PRACTICE',
        description: 'Structura ideala de probleme LeetCode clasificate pe pattern-uri, cu explicatii video pas cu pas.',
        isTopPick: true
      },
      {
        title: 'System Design Primer (Open Source GitHub)',
        platform: 'GitHub - Donne Martin',
        url: 'https://github.com/donnemartin/system-design-primer',
        type: 'BOOK',
        description: 'Ghid complet cu diagrame despre baze de date, caching, microservicii si scalabilitate.',
        isTopPick: false
      },
      {
        title: 'Spring Academy - Cursuri Oficiale Gratuite',
        platform: 'VMware Spring Academy',
        url: 'https://spring.academy/courses',
        type: 'COURSE',
        description: 'Cursuri oficiale pentru Spring Framework si Spring Boot pentru incepatori si avansati.',
        isTopPick: false
      }
    ],

    // PILLAR 4: CURRICULUM ETAPIZAT
    stages: [
      { stageNumber: 1, title: 'Fundamente Limbaj & Structuri de Date', duration: '4-6 Saptamani', milestones: ['Sintaxa moderna (Java 17/21 / C# 12)', 'OOP avansat, interfete si clase abstracte', 'Colectii: List, Map, Set si algoritmi de baza'] },
      { stageNumber: 2, title: 'Baze de Date & SQL Riguros', duration: '3-4 Saptamani', milestones: ['Modelare relationala si normalizare', 'Interogari complexe, subselecturi si indecsi', 'Conectare JDBC si mapare ORM (Hibernate / JPA)'] },
      { stageNumber: 3, title: 'Framework Backend & API REST', duration: '4-6 Saptamani', milestones: ['Arhitectura Controller-Service-Repository', 'Validari DTO si tratare globala a exceptiilor', 'Securitate cu JWT si roluri de utilizator'] },
      { stageNumber: 4, title: 'Testare, Docker & Pregatire Interviuri', duration: '3-4 Saptamani', milestones: ['Suita de teste JUnit si Mockito', 'Containerizare aplicatie si baza de date cu Docker Compose', 'Rezolvare zilnica a 2 probleme NeetCode / LeetCode'] }
    ]
  },

  {
    id: 'FRONTEND',
    title: 'Frontend Development',
    shortTitle: 'Frontend',
    badge: 'Interfete Moderne & UX',
    iconKey: 'Layout',
    tagLine: 'Aplicatii web reactive, React, TypeScript, Next.js, performanta vizuala si experiente de utilizator impecabile.',
    salaryJunior: '4.200 - 7.000 RON net',
    salaryMid: '8.000 - 14.500 RON net',
    marketDemand: 'Peste 25% din ofertele de web development pe piata locala',

    reachInterview: {
      mustHaveSkills: [
        { name: 'JavaScript Modern (ES6+) & TypeScript', level: 'CRITIC', desc: 'Async/await, Promises, closures, destructuring si typing strict.' },
        { name: 'React (Hooks, Context, State)', level: 'CRITIC', desc: 'useState, useEffect, useMemo, custom hooks si optimizare re-render.' },
        { name: 'HTML5 Semantic & CSS3 / Tailwind CSS', level: 'CRITIC', desc: 'Flexbox, CSS Grid, responsive design mobil si accesibilitate web.' },
        { name: 'Consum API & Management State Server', level: 'ESENTIAL', desc: 'Fetch / Axios, TanStack Query (React Query) sau RTK Query.' },
        { name: 'Git & Bundlers (Vite, Webpack)', level: 'ESENTIAL', desc: 'Configurari de build, variabile de mediu, optimizare asset-uri.' },
        { name: 'Next.js (App Router, SSR, SSG)', level: 'AVANTAJ', desc: 'Rendare pe server si SEO optimizat (foarte cerut in 2026).' }
      ],
      recommendedProject: {
        title: 'Aplicatie Dashboard Interactiva cu Filtrare Avansata si Cache Optimistic',
        description: 'Construieste un panou de control complex (ex: Analytics Dashboard, aplicatie de productivitate Kanban sau magazin online) cu TypeScript, Tailwind CSS, gestionare a starii de retea si Dark Mode.',
        keyFeatures: [
          'Cod scris 100% in TypeScript strict, fara erori de any',
          'Actualizari optimiste de UI (schimbarea apare instant inainte de raspunsul serverului)',
          'Filtrare client-side multi-criteriala, paginare si sortare fluida',
          'Responsive complet adaptat la ecran mobil, tableta si desktop',
          'Lighthouse Score de minim 90+ pe performanta, accesibilitate si SEO'
        ],
        githubAdvice: 'Publica aplicatia live pe Vercel, Netlify sau Cloudflare Pages si pune link-ul direct in header-ul repozitoriului GitHub.'
      },
      googleXyzBullet: 'Construit o interfata web reactiva in React 18 si TypeScript cu Tailwind CSS, implementat actualizari optimiste de stare si redus timpul de incarcare cu 38%, obtinand scor Lighthouse 96/100.',
      cvScreenTips: [
        'Nu trimite aplicatii fara un link functional catre demo-ul live al proiectelor tale.',
        'Demonstreaza ca stii TypeScript; proiectele scrise exclusiv in JS nativ sunt adesea depasite de cele cu TypeScript strict.',
        'Evita librariile greoaie de UI cand poti construi componente curate si accesibile cu Tailwind.'
      ],
      commonMistakes: [
        'Interfete care se rup pe ecranele de telefon mobil.',
        'Ignorarea starilor de Loading si Error cand se preiau date de la server.',
        'Dependinte masive in `useEffect` care creeaza bucle infinite de randare.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'JavaScript DOM & Data Manipulations',
        patterns: ['Implementare Array methods (map, filter, reduce)', 'Debounce & Throttle functions', 'Deep Clone de obiecte cu cicluri', 'Promise.all & async execution', 'Flattening de nested arrays'],
        tips: 'Fii pregatit sa scrii functii de utilitate JavaScript nativ de la zero fara a folosi Lodash sau alte librarii.'
      },
      topQuestions: [
        {
          q: 'Cum functioneaza Virtual DOM si algoritmul de Reconciliation in React?',
          a: 'React pastreaza o copie usoara in memorie a DOM-ului real. Cand starea se schimba, se genereaza un nou Virtual DOM, iar algoritmul "diffing" compara versiunile (pe baza cheilor si tipurilor de elemente), aplicand doar mutatiile minime necesare pe DOM-ul real din browser.',
          category: 'React Core'
        },
        {
          q: 'Cand ar trebui folosite useMemo si useCallback si care sunt riscurile folosirii excesive?',
          a: 'useMemo memoreaza rezultatul unui calcul costisitor, iar useCallback memoreaza referinta unei functii pentru a preveni re-randarea componentelor copil memoizate (React.memo). Folosirea excesiva adauga overhead de memorie si verificari la fiecare render, fiind contraproductiva pe operatiuni simple.',
          category: 'React Hooks'
        },
        {
          q: 'Care este diferenta dintre Server-Side Rendering (SSR) si Client-Side Rendering (CSR)?',
          a: 'La CSR, browserul descarca un HTML gol si un bundle JS masiv care randeaza interfata la client (initial load mai lent, SEO slab). La SSR (ex: Next.js), serverul genereaza HTML-ul complet populat cu date pentru fiecare cerere (incarcare rapida, SEO excelent), hidratat apoi cu JS.',
          category: 'Arhitectura Web'
        },
        {
          q: 'Ce este Event Bubbling si Event Delegation in JavaScript?',
          a: 'Event Bubbling este propagarea evenimentului de la elementul tinta in sus prin arborele DOM catre parinti. Event Delegation este tehnica de a atasa un singur event listener pe un container parinte comun pentru a gestiona evenimentele multiplelor elemente copil (reduce consumul de memorie).',
          category: 'JavaScript Internals'
        }
      ],
      trickyQuestions: [
        {
          q: 'De ce codul console.log(a) afiseaza undefined in loc de ReferenceError cand variabila este declarata cu var a = 5 mai jos?',
          a: 'Datorita mecanismului de Hoisting: declaratia "var a" este mutata la inceputul scope-ului la faza de compilare si initializata cu undefined. Cu "let" si "const", variabila intra in Temporal Dead Zone (TDZ) si arunca ReferenceError.',
          why: 'Verifica intelegerea mecanismului de executie a motorului V8 JavaScript.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unui flux de Infinite Scroll sau Virtualized List',
        keyPoints: [
          'Intersection Observer API pentru detectarea atingerii capatului de pagina',
          'Virtual DOM windowing (randarea pe ecran doar a celor 20 de elemente vizibile)',
          'Debounce la scroll si stocarea pozitiei in sesiune',
          'Tratare stare de retea offline si retry la esec de request'
        ]
      }
    },

    freeResources: [
      {
        title: 'Roadmap.sh Frontend Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/frontend',
        type: 'ROADMAP',
        description: 'Cel mai popular traseu vizual de invatare pentru programatori frontend.',
        isTopPick: true
      },
      {
        title: 'Documentatia Oficiala React (react.dev)',
        platform: 'React.dev',
        url: 'https://react.dev/learn',
        type: 'DOCS',
        description: 'Documentatia moderna rescrisa de echipa React cu explicatii vizuale si sandbox-uri interactive.',
        isTopPick: true
      },
      {
        title: 'The Odin Project - Full Stack JavaScript',
        platform: 'The Odin Project',
        url: 'https://www.theodinproject.com/paths/full-stack-javascript',
        type: 'COURSE',
        description: 'Curriculum open-source gratuit axat pe invatare prin proiecte reale facute in terminal si pe GitHub.',
        isTopPick: true
      },
      {
        title: 'TypeScript Handbook Oficial',
        platform: 'TypeScriptlang.org',
        url: 'https://www.typescriptlang.org/docs/handbook/intro.html',
        type: 'DOCS',
        description: 'Manualul de baza complet pentru intelegerea tipurilor, genericelor si configurarii tsconfig.',
        isTopPick: false
      },
      {
        title: 'GreatFrontEnd - Interviuri Practice Frontend',
        platform: 'GreatFrontEnd.com',
        url: 'https://www.greatfrontend.com/',
        type: 'PRACTICE',
        description: 'Probleme reale de codare specifice pentru interviuri de UI si intrebari de JavaScript.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Fundamente Web: HTML, CSS & JS Modern', duration: '4 Saptamani', milestones: ['HTML5 semantic si flexbox/grid responsive', 'ES6+: destructuring, promises, async/await', 'Manipulare DOM si event listeners'] },
      { stageNumber: 2, title: 'TypeScript & Fundamente React', duration: '4-5 Saptamani', milestones: ['Sintaxa TypeScript si typing pe props/events', 'Componente functionale si Hooks de baza', 'Tailwind CSS pentru styling atomic modern'] },
      { stageNumber: 3, title: 'Management Stare & Conexiune API', duration: '3-4 Saptamani', milestones: ['TanStack Query pentru cache server-state', 'Rute dinamice si componente de paginare', 'Tratare avansata a erorilor de retea'] },
      { stageNumber: 4, title: 'Next.js, Optimizare & Portofoliu Live', duration: '3-4 Saptamani', milestones: ['Next.js App Router si SSR', 'Deploy cu domeniu personal pe Vercel', 'Optimizare Lighthouse si audit de accesibilitate'] }
    ]
  },

  {
    id: 'FULLSTACK',
    title: 'Full-Stack Development',
    shortTitle: 'Full-Stack',
    badge: 'Versatilitate Maxima',
    iconKey: 'Layers',
    tagLine: 'Conectarea completa a aplicatiei de la interfata UI, prin API-uri REST/GraphQL securizate, pana la baza de date si deploy pe server.',
    salaryJunior: '4.800 - 8.000 RON net',
    salaryMid: '9.000 - 16.000 RON net',
    marketDemand: 'Foarte apreciat in companii de produs, startup-uri si agentii de software',

    reachInterview: {
      mustHaveSkills: [
        { name: 'Frontend React / Next.js cu TypeScript', level: 'CRITIC', desc: 'Componente reutilizabile, stare asincrona si design responsive.' },
        { name: 'Backend Java Spring Boot sau Node.js / Express', level: 'CRITIC', desc: 'Creare de endpoint-uri REST securizate si logica de business.' },
        { name: 'Baza de Date Relationala (PostgreSQL / MySQL)', level: 'CRITIC', desc: 'Design de scheme, indecsi si migratii de baze de date.' },
        { name: 'Autentificare End-to-End (JWT, Cookies, OAuth2)', level: 'ESENTIAL', desc: 'Flux complet de login, refresh token si protectie CSRF.' },
        { name: 'Docker Compose & Deploy in Cloud', level: 'ESENTIAL', desc: 'Configurare mediu complet de dezvoltare si rulare in productie.' }
      ],
      recommendedProject: {
        title: 'Aplicatie SaaS Completa End-to-End cu Plati / Notificari in Timp Real',
        description: 'Construieste o aplicatie completa (ex: un ATS Job Tracker cu scraping automat, aplicatie de gestionat task-uri de echipa sau sistem de rezervari) cu frontend React, backend Spring Boot sau Node, baza de date PostgreSQL si containere Docker.',
        keyFeatures: [
          'Arhitectura separata Client-Server comunicand prin REST API securizat',
          'Autentificare completa (Register, Login, Role-based Access, Password Reset)',
          'Sistem de notificari sau actualizari live (WebSockets / SSE)',
          'Pipeline automatizat de CI/CD pe GitHub Actions care testeaza ambele parti'
        ],
        githubAdvice: 'Pregateste o demonstratie video de 90 de secunde (Loom / GIF) direct in README-ul GitHub care arata fluxul aplicatiei.'
      },
      googleXyzBullet: 'Construit si lansat o aplicatie full-stack end-to-end (React + Spring Boot 3 + PostgreSQL + Docker), implementand autentificare securizata JWT si reducand timpul de onboarding al utilizatorilor cu 50%.',
      cvScreenTips: [
        'Nu te prezenta ca "Full-Stack" daca ai doar un frontend simplu si un backend de 2 fisiere. Arata consistenta in ambele parti.',
        'Evidentiaza ca intelegi cum se leaga serviciile: configurarea CORS, variabilele de mediu si gestionarea erorilor de retea.'
      ],
      commonMistakes: [
        'Erori de CORS neintelese sau configurari hardcodate cu `localhost:8080` in frontend-ul de productie.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Full-stack problem solving & API integration',
        patterns: ['CRUD flow implementation', 'Pagination & filtering algorithms', 'Data transformation between Backend DTO and Frontend ViewModels'],
        tips: 'La interviul tehnic Full-Stack, accentul se pune pe cum comunici intre straturi si cum structurezi contractul de date dintre backend si frontend.'
      },
      topQuestions: [
        {
          q: 'Cum rezolvi corect erorile de tip CORS (Cross-Origin Resource Sharing)?',
          a: 'CORS este un mecanism de securitate din browser. Se configureaza din backend specificand antetele Allowed Origins, Allowed Methods si Allowed Headers, permitand browserului sa accepte request-urile provenite de pe alt domeniu/port decat cel al API-ului.',
          category: 'Securitate & Retele'
        },
        {
          q: 'Cum gestionezi stocarea sigura a token-urilor JWT pe frontend?',
          a: 'Cea mai sigura metoda este stocarea Access Token-ului in memorie (starea aplicatiei) si a Refresh Token-ului intr-un cookie securizat de tip httpOnly, SameSite=Strict si Secure, prevenind atacurile de tip XSS (Cross-Site Scripting).',
          category: 'Autentificare & Securitate'
        }
      ],
      trickyQuestions: [
        {
          q: 'Ce este un idempotence key si de ce este esential in tranzactiile financiare sau comenzi?',
          a: 'O cheie unica trimisa de frontend la un request POST. Daca conexiunea pica sau utilizatorul apasa dublu pe buton, backend-ul verifica cheia in baza de date / cache si refuza sa proceseze comanda de doua ori, returnand rezultatul primei operatiuni.',
          why: 'Arata gandire de inginer care intelege realitatea defectiunilor de retea in productie.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unei platforme de colaborare cu actualizari in timp real',
        keyPoints: [
          'WebSockets pentru comunicare bidirectionala cu latenta redusa',
          'Redis Pub/Sub pentru scalarea nodurilor de WebSocket pe server',
          'Baza de date PostgreSQL pentru persistenta mesajelor si istoricului'
        ]
      }
    },

    freeResources: [
      {
        title: 'Full Stack Open (University of Helsinki)',
        platform: 'FullStackOpen.com',
        url: 'https://fullstackopen.com/en/',
        type: 'COURSE',
        description: 'Standardul de aur la nivel mondial pentru Full-Stack (React, Node, Express, TypeScript, GraphQL, CI/CD, Docker).',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Full-Stack Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/full-stack',
        type: 'ROADMAP',
        description: 'Harta vizuala completa a abilitatilor de frontend, backend si DevOps combinate.',
        isTopPick: true
      },
      {
        title: 'Harvard CS50’s Web Programming with Python and JavaScript',
        platform: 'edX / Harvard Online',
        url: 'https://cs50.harvard.edu/web/',
        type: 'COURSE',
        description: 'Curs de renume mondial oferit gratuit de Universitatea Harvard pentru dezvoltare web completa.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Frontend React & TypeScript', duration: '4 Saptamani', milestones: ['Stapanire React Hooks si TypeScript', 'Tailwind CSS pentru UI responsive', 'Gestiune stare cu TanStack Query'] },
      { stageNumber: 2, title: 'Backend REST API & Baze de Date', duration: '4 Saptamani', milestones: ['Construire API in Spring Boot / Node', 'Modelare schema PostgreSQL si migratii', 'Autentificare JWT securizata'] },
      { stageNumber: 3, title: 'Integrare Completa & Docker', duration: '3 Saptamani', milestones: ['Conectare frontend-backend fara erori CORS', 'Configurare Docker Compose pentru intregul stack', 'Testare automata end-to-end'] },
      { stageNumber: 4, title: 'CI/CD & Deploy in Productie', duration: '3 Saptamani', milestones: ['GitHub Actions pipeline pentru test & build', 'Deploy aplicatie pe server cloud', 'Pregatire intrebari de arhitectura pentru interviuri'] }
    ]
  },

  {
    id: 'QA_AUTOMATION',
    title: 'QA & Test Automation',
    shortTitle: 'QA Automation',
    badge: 'Calitate & Testare Automata',
    iconKey: 'Bug',
    tagLine: 'Testare automata end-to-end, framework-uri Selenium si Playwright, testare de API-uri si asigurarea fiabilitatii software-ului.',
    salaryJunior: '4.000 - 6.500 RON net',
    salaryMid: '7.500 - 13.500 RON net',
    marketDemand: 'Peste 18% din ofertele de joburi IT in banci, telecom si companii de produs',

    reachInterview: {
      mustHaveSkills: [
        { name: 'Fundamente QA Manual & Metodologii de Testare', level: 'CRITIC', desc: 'Scriere Test Cases, bug reporting (Jira), boundary value analysis, echivalenta claselor.' },
        { name: 'Un Limbaj de Programare (Java sau Python sau TS)', level: 'CRITIC', desc: 'POO, structuri de date, manipulare fisiere si librarii de test.' },
        { name: 'Framework de Automatizare Web (Playwright sau Selenium)', level: 'CRITIC', desc: 'Page Object Model (POM), selectoare CSS/XPath robuste, wait-uri explicite.' },
        { name: 'Testare Automata de API (Postman / REST-Assured)', level: 'ESENTIAL', desc: 'Validare coduri HTTP, scheme JSON, antete si payload-uri dinamice.' },
        { name: 'CI/CD Integration (GitHub Actions)', level: 'ESENTIAL', desc: 'Rulare automata a testelor la fiecare pull request si generare rapoarte.' }
      ],
      recommendedProject: {
        title: 'Framework de Testare Automata End-to-End cu Rapoarte Allure',
        description: 'Dezvolta un framework modular de automatizare pe GitHub care testeaza o aplicatie web reala (login, adaugare in cos, checkout, cautare) si o suita de API-uri REST, rulat automat prin GitHub Actions.',
        keyFeatures: [
          'Design bazat pe Page Object Model (POM) cu cod curat si reutilizabil',
          'Suita paralela de teste Web (Playwright sau Selenium) si teste API (REST-Assured)',
          'Generare automata de rapoarte vizuale detaliate cu capturi de ecran (Allure Report)',
          'Executie automata in container Docker si pe GitHub Actions la fiecare push'
        ],
        githubAdvice: 'Include in repozitoriu un link catre raportul interactiv Allure gazduit pe GitHub Pages.'
      },
      googleXyzBullet: 'Construit un framework complet de testare automata (Java + Playwright + REST-Assured) cu Page Object Model, automatizand 65 de scenarii critice de regresie si reducand timpul de testare manuala cu 70%.',
      cvScreenTips: [
        'Nu lista doar unelte ("Selenium, Postman"). Specifica exact ce stii sa faci cu ele ("Construit framework Page Object Model", "Automatizat teste de regresie").',
        'Demonstreaza ca intelegi atat testarea manuala (gandire critica de tester), cat si automatizarea (abilitati de codare).'
      ],
      commonMistakes: [
        'Folosirea Thread.sleep() in loc de Explicit Waits (arata lipsa de profesionalism).',
        'Selectoare fragile legate de text sau indecsi absoluti care se rup la prima modificare de UI.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Easy (Manipulare de String-uri si colectii)',
        patterns: ['Verificare palindrom / anagrame', 'Numarare frecvente caractere', 'Parsare si validare de JSON / dictionare'],
        tips: 'Gandeste-te la cazurile limita (edge cases: string gol, null, valori negative) inainte de a scrie codul!'
      },
      topQuestions: [
        {
          q: 'Care este diferenta dintre Implicit Wait, Explicit Wait si Fluent Wait?',
          a: 'Implicit Wait defineste un timp global de asteptare pentru toate elementele din sesiune. Explicit Wait asteapta indeplinirea unei conditii specifice pe un element (ex: sa fie clickable), evitand blocajele. Fluent Wait permite definirea frecventei de polling si ignorarea anumitor exceptii (ex: NoSuchElementException).',
          category: 'Testare Automata'
        },
        {
          q: 'Ce este Page Object Model (POM) si de ce este considerat standardul in industrie?',
          a: 'POM este un design pattern care separa reprezentarea paginilor web (selectoare si actiuni specifice) de logica propriu-zisa a testelor. Creste lizibilitatea, reduce duplicarea codului si face mentenanta mult mai usoara cand UI-ul se schimba.',
          category: 'Arhitectura Framework'
        }
      ],
      trickyQuestions: [
        {
          q: 'Cum rezolvi si previi problema testelor "flaky" (care uneori trec, alteori pica fara motiv)?',
          a: 'Identifici cauzele radacina: probleme de sincronizare (inlocuiesti sleep-urile cu wait-uri dinamice pe starea DOM-ului), dependente de date comune intre teste (fiecare test trebuie sa fie complet izolat si sa isi creeze propriile date) sau probleme de stabilitate a mediului de retea.',
          why: 'Recruiterii vor sa vada daca poti mentine o suita mare de teste in productie.'
        }
      ],
      systemDesignMini: {
        topic: 'Strategia de testare a unei aplicatii de plati online',
        keyPoints: [
          'Piramida testarii: 70% Unit Tests, 20% Integration/API Tests, 10% E2E UI Tests',
          'Mock-uirea gateway-ului de plata pentru a evita tranzactii reale in medii de test',
          'Testare de securitate si injectii SQL pe campurile de plata'
        ]
      }
    },

    freeResources: [
      {
        title: 'Test Automation University (Applitools)',
        platform: 'TestAutomationU.com',
        url: 'https://testautomationu.applitools.com/',
        type: 'COURSE',
        description: 'Cea mai mare platforma 100% gratuita din lume pentru QA, cu cursuri pe Selenium, Playwright, Cypress si API testing.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh QA Engineer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/qa',
        type: 'ROADMAP',
        description: 'Traseul vizual complet pentru evolutia de la Manual QA la Test Automation Engineer.',
        isTopPick: true
      },
      {
        title: 'Playwright Documentatie Oficiala & Codelabs',
        platform: 'Playwright.dev',
        url: 'https://playwright.dev/docs/intro',
        type: 'DOCS',
        description: 'Ghidul oficial pentru cel mai modern si rapid framework de testare end-to-end din prezent.',
        isTopPick: true
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Fundamente QA Manual & Metodologii', duration: '3 Saptamani', milestones: ['Ciclul de viata al testarii (STLC)', 'Scriere de Test Cases si Bug Reports', 'Tehnici de black-box testing'] },
      { stageNumber: 2, title: 'Programare de Baza & Testare API', duration: '4 Saptamani', milestones: ['Stapanire Java / Python pentru QA', 'Testare manuala si automata in Postman', 'Automatizare API cu REST-Assured'] },
      { stageNumber: 3, title: 'Automatizare Web cu Playwright / Selenium', duration: '4-5 Saptamani', milestones: ['Implementare Page Object Model', 'Gestionare wait-uri si date dinamice', 'Generare rapoarte Allure'] },
      { stageNumber: 4, title: 'Integrare CI/CD & Interviuri Tehnice', duration: '3 Saptamani', milestones: ['Rulare teste pe GitHub Actions', 'Containerizare suita de teste in Docker', 'Rezolvare intrebari capcana de interviu'] }
    ]
  },

  {
    id: 'DEVOPS_CLOUD',
    title: 'DevOps, Cloud & SRE',
    shortTitle: 'DevOps',
    badge: 'Infrastructura & Automatizare',
    iconKey: 'Cloud',
    tagLine: 'Infrastructura automata prin cod (IaC), containere, clustere Kubernetes, pipeline-uri CI/CD si disponibilitate de sistem 99.99%.',
    salaryJunior: '4.800 - 8.000 RON net',
    salaryMid: '9.500 - 16.500 RON net',
    marketDemand: 'Cerere uriasa pe piata corporate si enterprise din Romania',

    reachInterview: {
      mustHaveSkills: [
        { name: 'Linux Avansat & Bash Scripting', level: 'CRITIC', desc: 'Comenzi terminal, permisiuni, procese, SSH, depanare retea.' },
        { name: 'Docker & Docker Compose', level: 'CRITIC', desc: 'Imagini optimizate multi-stage, volume, networking, securitate containere.' },
        { name: 'CI/CD Pipelines (GitHub Actions / GitLab CI)', level: 'CRITIC', desc: 'Automatizare testare, build si deployment la push.' },
        { name: 'Fundamente Cloud (AWS sau Azure sau GCP)', level: 'ESENTIAL', desc: 'Compute (EC2/VM), Storage (S3/Blob), Retele (VPC, Subnets) si IAM.' },
        { name: 'Infrastructure as Code (Terraform)', level: 'ESENTIAL', desc: 'Provizionare automata si declarativa a resurselor de cloud.' },
        { name: 'Kubernetes (K8s)', level: 'AVANTAJ', desc: 'Pods, Deployments, Services, Ingress si Helm charts.' }
      ],
      recommendedProject: {
        title: 'Pipeline Complet GitOps & Infrastructura Automata in Cloud',
        description: 'Construieste un proiect complet de infrastructura pe GitHub: foloseste Terraform pentru a proviziona resurse pe AWS (Free Tier), configureaza un cluster Kubernetes (sau Minikube) si un pipeline GitHub Actions cu monitoring integrat (Prometheus + Grafana).',
        keyFeatures: [
          'Scripturi Terraform modulare pentru provizionarea unui mediu cloud complet',
          'Pipeline GitHub Actions care construieste si publica automat imagini Docker pe Docker Hub / GHCR',
          'Manifeste Kubernetes (Deployment, Service, ConfigMap, Ingress) cu rolling updates',
          'Dashboard de monitorizare Prometheus si Grafana care colecteaza metrici de CPU/memorie'
        ],
        githubAdvice: 'Include o diagrama de infrastructura realizata in Draw.io / Mermaid si demonstreaza comanda de `terraform apply` fara erori.'
      },
      googleXyzBullet: 'Automatizat infrastructura cloud folosind Terraform si GitHub Actions pe AWS, configurat cluster Kubernetes cu zero-downtime rolling updates si redus timpul de deployment de la 40 de minute la sub 3 minute.',
      cvScreenTips: [
        'Mentine accentul pe automatizare si eliminarea muncii manuale (Toil reduction).',
        'Multe companii cauta juniori care au si fundamente de dezvoltare (Python/Go/Bash scripting).'
      ],
      commonMistakes: [
        'Utilizarea comenzilor manuale in loc de configurari declarate in cod (IaC).',
        'Stocarea cheilor de acces AWS direct in cod pe repozitorii publice.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Scripting Bash / Python & System Troubleshooting',
        patterns: ['Parsare loguri si extragere IP-uri cu awk/sed/grep', 'Scripturi de verificare sanatate servere (Healthcheck ping)', 'Automatizare backup-uri si rotatie de fisiere'],
        tips: 'Fii gata sa explici live cum depanezi un server Linux care are 100% CPU sau disk plin.'
      },
      topQuestions: [
        {
          q: 'Cum optimizezi dimensiunea unei imagini Docker si ce inseamna Multi-Stage Build?',
          a: 'Multi-stage build separa mediul de compilare de imaginea finala de runtime. Intr-un prim stadiu (ex: Maven/Node) se compileaza aplicatia, iar in al doilea stadiu se copiaza doar artefactul compilat (jar-ul sau dist-ul) peste o imagine minimala (ex: Alpine Linux sau Distroless), reducand dimensiunea de la 800MB la 80MB si eliminand vulnerabilitatile.',
          category: 'Containere'
        },
        {
          q: 'Care este diferenta dintre un Deployment, un StatefulSet si un DaemonSet in Kubernetes?',
          a: 'Deployment-ul este destinat aplicatiilor stateless care pot fi replicate aleator. StatefulSet ofera identitate stabila de retea si stocare persistenta pentru baze de date. DaemonSet asigura rularea a exact unei copii a Pod-ului pe fiecare nod din cluster (ideal pentru log collectors sau monitorizare).',
          category: 'Orchestrare K8s'
        }
      ],
      trickyQuestions: [
        {
          q: 'Un container se restarteaza continuu cu eroarea CrashLoopBackOff. Ce comenzi de diagnostic rulezi pentru a gasi problema?',
          a: 'Rulez `kubectl describe pod <pod_name>` pentru a vedea evenimentele (OOMKilled, probe de liveness esuate) si `kubectl logs <pod_name> --previous` pentru a vedea stack trace-ul dinainte de oprire.',
          why: 'Cea mai intalnita problema din viata reala a unui inginer DevOps.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unei strategii de deployment cu Zero Downtime (Blue-Green / Canary)',
        keyPoints: [
          'Canary: directionarea a 5% din trafic catre noua versiune, monitorizarea ratei de erori si treptata promovare la 100%',
          'Blue-Green: doua medii identice; comutarea routerului/load balancerului pe noul mediu dintr-o singura operatiune'
        ]
      }
    },

    freeResources: [
      {
        title: 'Roadmap.sh DevOps Engineer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/devops',
        type: 'ROADMAP',
        description: 'Traseul vizual esential pentru toata tehnologia DevOps si SRE moderna.',
        isTopPick: true
      },
      {
        title: 'Linux Journey - Curs Interactiv Gratuit',
        platform: 'LinuxJourney.com',
        url: 'https://linuxjourney.com/',
        type: 'COURSE',
        description: 'Ghidul perfect pas cu pas pentru a invata comenzi de Linux, permisiuni, procese si retele.',
        isTopPick: true
      },
      {
        title: 'OverTheWire: Bandit (Gamified Linux Security)',
        platform: 'OverTheWire.org',
        url: 'https://overthewire.org/wargames/bandit/',
        type: 'PRACTICE',
        description: 'Joc practic in terminalul Linux care te invata sa folosesti comenzile shell pentru a gasi parole ascunse.',
        isTopPick: true
      },
      {
        title: 'KodeKloud - Cursuri Gratuite de Docker & Kubernetes',
        platform: 'KodeKloud.com',
        url: 'https://kodekloud.com/free-courses/',
        type: 'COURSE',
        description: 'Laboratoare practice gratuite direct in browser pentru Docker, K8s si DevOps.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Linux, Shell & Retele', duration: '4 Saptamani', milestones: ['Comenzi Linux esentiale si bash scripting', 'Retele: DNS, IP, Subnets, Porturi, SSH', 'Gestionare utilizatori si permisiuni'] },
      { stageNumber: 2, title: 'Containere & Docker Compose', duration: '3-4 Saptamani', milestones: ['Scriere de Dockerfile-uri multi-stage', 'Networking si volume persistente in Docker', 'Docker Compose pentru aplicatii multi-container'] },
      { stageNumber: 3, title: 'CI/CD & Cloud Infrastructure (AWS)', duration: '4 Saptamani', milestones: ['GitHub Actions workflows complete', 'Provizionare resurse cloud cu Terraform', 'Gestionare secrete securizate'] },
      { stageNumber: 4, title: 'Kubernetes & Monitorizare', duration: '4 Saptamani', milestones: ['Instalare si comenzi kubectl de baza', 'Deploy aplicatie in Minikube / K3s', 'Configurare alerte cu Prometheus & Grafana'] }
    ]
  },

  {
    id: 'AI_DATA_SCIENCE',
    title: 'AI & Machine Learning',
    shortTitle: 'AI & Data Science',
    badge: 'Inteligenta Artificiala & RAG',
    iconKey: 'Sparkles',
    tagLine: 'Modele predictive, Machine Learning, Deep Learning, ecosistemul LLM, RAG (Retrieval-Augmented Generation) si baze de date vectoriale.',
    salaryJunior: '5.000 - 8.500 RON net',
    salaryMid: '10.000 - 18.000 RON net',
    marketDemand: 'Cea mai rapida crestere procentuala in 2026',

    reachInterview: {
      mustHaveSkills: [
        { name: 'Python Avansat pentru Date (NumPy, Pandas)', level: 'CRITIC', desc: 'Curatare, filtrare, transformare si agregare pe seturi de date masive.' },
        { name: 'Machine Learning Clasic (Scikit-Learn)', level: 'CRITIC', desc: 'Regresie liniara/logistica, Decision Trees, Random Forest, Cross-validation.' },
        { name: 'Ecosistem Generative AI & LLM (RAG, pgvector)', level: 'CRITIC', desc: 'Vector embeddings, similarity search cu cosine distance, LangChain.' },
        { name: 'SQL & Baze de Date Vectoriale', level: 'ESENTIAL', desc: 'Interogari analitice si persistenta vectoriala (pgvector, Pinecone, Chroma).' },
        { name: 'Deep Learning (PyTorch sau TensorFlow)', level: 'ESENTIAL', desc: 'Retele neurale, optimizatori (Adam), overfitting si regularizare.' }
      ],
      recommendedProject: {
        title: 'Sistem RAG (Retrieval-Augmented Generation) End-to-End cu Embeddings si API',
        description: 'Construieste o aplicatie care ingestioneaza documente PDF complexe (ex: rapoarte financiare sau documentatie tehnica), calculeaza vector embeddings, le stocheaza in PostgreSQL cu pgvector si raspunde la intrebari cu citate exacte.',
        keyFeatures: [
          'Pipeline complet de chunking si vectorizare a documentelor',
          'Cautare semantica hibrida (vectorial + keyword search) cu pgvector',
          'Interfata interactiva (Streamlit sau React) si backend expus prin FastAPI',
          'Metrice de evaluare a raspunsurilor (relevanta, fidelitate fara halucinatii)'
        ],
        githubAdvice: 'Adauga exemple clare de prompt-uri de test si un notebook Jupyter care demonstreaza acuratetea cautarii vectoriale.'
      },
      googleXyzBullet: 'Construit un sistem RAG in Python si FastAPI integrat cu pgvector, procesand peste 5.000 de pagini de documentatie tehnica si reducand timpul de raspuns al asistentului AI la sub 1.2 secunde cu acuratete de 94%.',
      cvScreenTips: [
        'Nu trece "AI Enthusiast". Treci realizari concrete: "Dezvoltat pipeline RAG", "Antrenat model clasificator cu F1-Score 0.89".',
        'Include link catre profilul Kaggle sau repozitorii de cod deschise cu notebook-uri bine documentate.'
      ],
      commonMistakes: [
        'Utilizarea unui simplu apel la OpenAI API fara a construi logica de preprocesare, vectorizare sau evaluare.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Data structures & NumPy/Pandas live coding',
        patterns: ['Vectorizare operatiuni fara bucle for in NumPy', 'Manipulari de DataFrame-uri cu Pandas (groupby, merge, pivot)', 'Algoritmi de clasificare implementati de la zero'],
        tips: 'Fii gata sa explici matematica din spatele functiilor de pierdere (Loss functions) si cum functioneaza Gradient Descent.'
      },
      topQuestions: [
        {
          q: 'Care este diferenta dintre Precision, Recall si F1-Score si cand folosesti Recall?',
          a: 'Precision este proportia predictiilor pozitive corecte din totalul predictiilor pozitive. Recall este proportia cazurilor reale pozitive identificate corect. F1-Score este media armonica dintre ele. Folosim Recall atunci cand costul unui fals negativ este urias (ex: diagnostic medical sau detectie de fraude).',
          category: 'Metrici ML'
        },
        {
          q: 'Cum functioneaza o cautare prin vector embeddings si ce este Cosine Similarity?',
          a: 'Un model de embedding transforma un text intr-un vector numeric dens in spatiul n-dimensional care capteaza sensul semantic. Cosine Similarity masoara cosinusul unghiului dintre doi vectori (produsul scalar impartit la produsul normelor lor), indicand cat de apropiate sunt conceptele, indiferent de lungimea textului.',
          category: 'NLP & Vector Search'
        }
      ],
      trickyQuestions: [
        {
          q: 'Ce este "Overfitting" si care sunt cele 3 metode principale de a-l combate in Deep Learning?',
          a: 'Overfitting apare cand modelul memoreaza zgomotul din datele de antrenare si nu generalizeaza pe date noi. Se combate prin: 1) Regularizare (L1/L2 sau Dropout), 2) Data Augmentation si colectare de date noi, 3) Early Stopping in timpul antrenarii.',
          why: 'Verifica intelegerea intuitiva a antrenarii modelelor in productie.'
        }
      ],
      systemDesignMini: {
        topic: 'Arhitectura unui sistem de cautare semantica pentru joburi sau produse',
        keyPoints: [
          'Pipeline asincron de calculare embeddings pentru date noi',
          'Indexare HNSW (Hierarchical Navigable Small World) sau IVFFlat in pgvector',
          'Caching pe raspunsurile la intrebari frecvente pentru reducerea costurilor de API'
        ]
      }
    },

    freeResources: [
      {
        title: 'Fast.ai - Practical Deep Learning for Coders',
        platform: 'Fast.ai',
        url: 'https://course.fast.ai/',
        type: 'COURSE',
        description: 'Probabil cel mai bun curs gratuit din lume pentru a invata Deep Learning hands-on de la primele linii de cod.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh AI & Data Scientist',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/ai-data-scientist',
        type: 'ROADMAP',
        description: 'Harta vizuala completa pentru matematica, algoritmi, ML si Generative AI.',
        isTopPick: true
      },
      {
        title: 'Kaggle Learn - Micro-cursuri Practice Interactive',
        platform: 'Kaggle.com',
        url: 'https://www.kaggle.com/learn',
        type: 'PRACTICE',
        description: 'Lectii interactive de cate 3 ore in Jupyter Notebooks despre Python, Pandas, Machine Learning si Deep Learning.',
        isTopPick: true
      },
      {
        title: 'DeepLearning.AI - Short Courses Gratuite',
        platform: 'DeepLearning.AI',
        url: 'https://www.deeplearning.ai/short-courses/',
        type: 'COURSE',
        description: 'Cursuri scurte si la obiect create de Andrew Ng despre LangChain, RAG si agenti autonomi.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Python, NumPy & Manipulare Date', duration: '4 Saptamani', milestones: ['Python avansat si programare orientata pe obiecte', 'Manipulari avansate de date cu Pandas si NumPy', 'SQL pentru baze de date analitice'] },
      { stageNumber: 2, title: 'Machine Learning Clasic & Scikit-Learn', duration: '4 Saptamani', milestones: ['Algoritmi de clasificare si regresie', 'Curatare si pregatire date pe seturi reale', 'Evaluare metrice (ROC-AUC, F1-Score)'] },
      { stageNumber: 3, title: 'Deep Learning & Ecosistemul LLM', duration: '5 Saptamani', milestones: ['Fundamente PyTorch si retele neurale', 'Vector embeddings si baze de date pgvector', 'Construire aplicatie RAG cu LangChain'] },
      { stageNumber: 4, title: 'Deployment Model & Proiecte Portofoliu', duration: '3 Saptamani', milestones: ['Expunere model prin API FastAPI', 'Deploy pe Cloud / HuggingFace Spaces', 'Pregatire interviuri tehnice si explicatii matematice'] }
    ]
  },

  {
    id: 'CYBERSECURITY',
    title: 'Cybersecurity & SecOps',
    shortTitle: 'Cybersecurity',
    badge: 'Securitate & Aparare',
    iconKey: 'ShieldCheck',
    tagLine: 'Securitate aplicativa (OWASP Top 10), analiza vulnerabilitatilor, securitate de retele, operatiuni SOC si aparare cibernetica.',
    salaryJunior: '4.500 - 7.500 RON net',
    salaryMid: '8.500 - 15.000 RON net',
    marketDemand: 'In continua crestere datorita noilor reglementari europene (NIS2, DORA)',

    reachInterview: {
      mustHaveSkills: [
        { name: 'Fundamente Retele & Protocoale (TCP/IP, DNS, TLS)', level: 'CRITIC', desc: 'Functionare pachete, handshakes, porturi, firewalls, Wireshark.' },
        { name: 'OWASP Top 10 Vulnerabilitati Web', level: 'CRITIC', desc: 'SQL Injection, XSS, CSRF, Broken Access Control, SSRF.' },
        { name: 'Linux Security & Scripting (Bash / Python)', level: 'CRITIC', desc: 'Audit fisiere de log, permisiuni, automatizare scanari de retea.' },
        { name: 'Unelte de Audit (Burp Suite, Nmap, Wireshark)', level: 'ESENTIAL', desc: 'Scanare porturi, interceptare trafic HTTP, inspectare certificate.' },
        { name: 'Concepte SOC & SIEM (Splunk, Elastic)', level: 'AVANTAJ', desc: 'Analiza alertelor de securitate si raspuns la incidente.' }
      ],
      recommendedProject: {
        title: 'Laborator Virtual de Securitate si Raport de Audit de Vulnerabilitati',
        description: 'Configureaza un mediu izolat de laborator (VirtualBox / Docker) si scrie un raport tehnic profesionist de securitate (Penetration Testing Report) descoperind si documentand mitigarea a 5 vulnerabilitati OWASP dintr-o aplicatie web de test.',
        keyFeatures: [
          'Documentare pas cu pas a vectorului de atac si a dovezilor (Proof of Concept)',
          'Recomandari concrete de cod pentru dezvoltatori (sanitizare input, parameterized queries)',
          'Script Python de automatizare a scanarii endpoint-urilor pentru configurari gresite'
        ],
        githubAdvice: 'Repozitoriul trebuie sa arate ca un raport oficial de securitate pe care l-ar prezenta un consultant catre client.'
      },
      googleXyzBullet: 'Identificat si documentat peste 12 vulnerabilitati critice de securitate (SQLi, XSS) intr-un mediu controlat de laborator, formuland recomandari de remediere conform standardului OWASP Top 10.',
      cvScreenTips: [
        'Adauga certificate recunoscute sau participari la competitii CTF (Capture The Flag) si camere TryHackMe / HackTheBox.',
        'Demonstreaza etica impecabila si intelegerea legislatiei privind testarea autorizata.'
      ],
      commonMistakes: [
        'Prezentarea folosirii uneltelor automate fara a putea explica manual cum functioneaza atacul la nivel de protocol.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Python / Bash scripting pentru parsare retea',
        patterns: ['Parsare loguri Nginx/Apache pentru identificare atacuri brute-force', 'Script de verificare certificate SSL care expira'],
        tips: 'Fii gata sa desenezi pe tabla un handshake complet TLS 1.3 si un flow OAuth2.'
      },
      topQuestions: [
        {
          q: 'Cum functioneaza un atac de tip SQL Injection si cum il previi complet in cod?',
          a: 'SQL Injection apare cand datele nefiltrate ale utilizatorului sunt concatenate direct intr-o comanda SQL, modificand structura logica a interogarii. Se previne 100% prin utilizarea de Prepared Statements (Interogari Parametrizate) sau un ORM modern, unde parametrii sunt trimisi separat si tratati strict ca date literale, nu comenzi executabile.',
          category: 'Securitate Web'
        },
        {
          q: 'Care este diferenta dintre Criptarea Simetrica si cea Asimetrica?',
          a: 'Criptarea simetrica (ex: AES) foloseste aceeasi cheie secreta atat pentru criptare cat si pentru decriptare (foarte rapida, ideala pentru volume mari de date). Criptarea asimetrica (ex: RSA, ECC) foloseste o pereche de chei: o cheie publica pentru criptare si o cheie privata pentru decriptare (folosita la handshake-ul TLS si semnaturi digitale).',
          category: 'Criptografie'
        }
      ],
      trickyQuestions: [
        {
          q: 'Ce este un atac de tip SSRF (Server-Side Request Forgery) si de ce este deosebit de periculos in mediile de cloud (AWS)?',
          a: 'SSRF permite atacatorului sa forteze aplicatia web sa execute request-uri HTTP interne in numele serverului. In AWS, atacatorul poate interoga serviciul de metadate (169.254.169.254) si poate fura token-urile temporare de acces IAM atasate instantei EC2.',
          why: 'Intrebare foarte des intalnita la interviurile de securitate cloud.'
        }
      ],
      systemDesignMini: {
        topic: 'Arhitectura de securitate Zero-Trust pentru acces intern',
        keyPoints: [
          'Principiul "Never trust, always verify" pentru fiecare request',
          'Autentificare multi-factor (MFA) si autorizare bazata pe contextul dispozitivului',
          'Micro-segmentare de retea si criptare interna end-to-end mTLS'
        ]
      }
    },

    freeResources: [
      {
        title: 'PortSwigger Web Security Academy (Gratuit)',
        platform: 'PortSwigger.net',
        url: 'https://portswigger.net/web-security',
        type: 'PRACTICE',
        description: 'Standardul mondial suprem si 100% gratuit creat de dezvoltatorii Burp Suite, cu laboratoare interactive pe fiecare tip de atac.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Cybersecurity',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/cyber-security',
        type: 'ROADMAP',
        description: 'Ghidul vizual complet pentru cariera de securitate cibernetica.',
        isTopPick: true
      },
      {
        title: 'TryHackMe - Camere Gratuite de Invatare',
        platform: 'TryHackMe.com',
        url: 'https://tryhackme.com/',
        type: 'PRACTICE',
        description: 'Laboratoare gamificate practice direct in browser pe retele, Linux si securitate defensiva.',
        isTopPick: true
      },
      {
        title: 'Ghidul Oficial OWASP Top 10',
        platform: 'OWASP.org',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'DOCS',
        description: 'Documentatia oficiala cu cele mai critice 10 riscuri de securitate si bunele practici de aparare.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Retele, Protocoale & Linux', duration: '4 Saptamani', milestones: ['Modelul OSI si suita TCP/IP', 'Analiza pachetelor cu Wireshark', 'Comenzi si securitate de baza in Linux'] },
      { stageNumber: 2, title: 'Vulnerabilitati Web & OWASP Top 10', duration: '5 Saptamani', milestones: ['Laboratoare practice PortSwigger Academy', 'Folosirea Burp Suite pentru interceptare', 'Intelegere profunda SQLi, XSS, CSRF'] },
      { stageNumber: 3, title: 'Criptografie & Securitate Aplicativa', duration: '3 Saptamani', milestones: ['Certificate SSL/TLS si PKI', 'Autentificare OAuth2 / SAML / JWT', 'Scanare statica de cod (SAST) in CI/CD'] },
      { stageNumber: 4, title: 'Operatiuni SOC & Pregatire CTF', duration: '4 Saptamani', milestones: ['Analiza logurilor de securitate SIEM', 'Participare la competitii de tip CTF', 'Redactare raport de audit tehnic pentru portofoliu'] }
    ]
  },

  {
    id: 'DATA_ENGINEERING',
    title: 'Data Engineering & Big Data',
    shortTitle: 'Data Engineering',
    badge: 'Date Masive & Pipeline-uri',
    iconKey: 'Database',
    tagLine: 'Pipeline-uri masive de date (ETL/ELT), data warehouses (Snowflake, BigQuery), streaming de date in timp real si modelare dimensionala.',
    salaryJunior: '4.800 - 8.000 RON net',
    salaryMid: '9.000 - 16.000 RON net',
    marketDemand: 'Cerere mare in fintech, telecom, retail si companii multinationale',

    reachInterview: {
      mustHaveSkills: [
        { name: 'SQL Avansat (Window Functions, CTEs, Agregari)', level: 'CRITIC', desc: 'Scriere de interogari analitice complexe, partitionare si optimizare query plans.' },
        { name: 'Python pentru Inginerie de Date', level: 'CRITIC', desc: 'Procesare fisiere Parquet, interactiune cu API-uri, OOP si testare automata.' },
        { name: 'Data Warehousing & Modelare Dimensionala', level: 'ESENTIAL', desc: 'Star Schema, Snowflake Schema, tabele de Fapte si Dimensiuni (Kimball).' },
        { name: 'Procesare de Date Distribuita (Apache Spark / PySpark)', level: 'ESENTIAL', desc: 'Transformari de date pe clustere, RDDs, DataFrames si optimizari.' },
        { name: 'Orchestrare Pipeline-uri (Apache Airflow)', level: 'ESENTIAL', desc: 'Definire DAG-uri in cod Python, monitorizare si programare automata.' }
      ],
      recommendedProject: {
        title: 'Pipeline Automatizat de Date End-to-End cu Airflow, PostgreSQL si dbt',
        description: 'Construieste un pipeline complet de date: extrage date publice printr-un API, stocheaza datele raw in PostgreSQL / S3, orchestreaza transformarile zilnice cu Apache Airflow si creeaza tabele analitice optimizate folosind dbt.',
        keyFeatures: [
          'DAG-uri Airflow modulare cu tratare automata a erorilor si retry logic',
          'Transformare modulara de date cu teste automate de integritate (dbt test)',
          'Stocare in format columnar Parquet pentru reducerea spatiului si viteza la query',
          'Dashboard final conectat (ex: Metabase sau Streamlit) pentru vizualizare'
        ],
        githubAdvice: 'Include o schema clara a arhitecturii pipeline-ului (ETL flow) in README si instructiuni clare de rulare cu Docker Compose.'
      },
      googleXyzBullet: 'Proiectat si orchestrat un pipeline automatizat de date ELT in Python si Apache Airflow, procesand zilnic peste 100.000 de inregistrari si reducand timpul de generare a rapoartelor cu 60%.',
      cvScreenTips: [
        'Evidentiaza stapanirea SQL-ului avansat; peste 70% din interviurile de Data Engineering incep cu o runda dura de SQL.',
        'Mentine accentul pe integritatea datelor si testarea automata a pipeline-urilor.'
      ],
      commonMistakes: [
        'Utilizarea Pandas pentru seturi masive de date in loc de tehnologii distribuite (Spark) sau procesare nativa SQL in baza de date.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'SQL Complex (LeetCode Hard SQL) & Python Data Parsing',
        patterns: ['Window functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD)', 'Common Table Expressions (WITH queries)', 'Auto-join-uri si agregari pe ferestre de timp'],
        tips: 'La interviul de SQL, explica mereu ordinea de executie a unei clauze: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY.'
      },
      topQuestions: [
        {
          q: 'Care este diferenta dintre o arhitectura ETL si o arhitectura ELT?',
          a: 'In ETL (Extract, Transform, Load), datele sunt transformate pe un server intermediar inainte de a fi incarcate in baza de date. In ELT (Extract, Load, Transform), datele raw sunt incarcate direct in Data Warehouse (ex: Snowflake, BigQuery) si transformate acolo la viteze masive folosind puterea de calcul a warehouse-ului (frecvent prin dbt).',
          category: 'Arhitectura Date'
        },
        {
          q: 'Ce este o Star Schema si care este diferenta dintre un tabel de Fact si unul de Dimension?',
          a: 'Star Schema este o tehnica de modelare dimensionala unde un tabel central de Fact contine masuratori numerice si chei straine catre tabele de Dimension (ex: Timp, Client, Locatie) care contin atribute descriptive. Permite interogari analitice extrem de rapide si usor de inteles.',
          category: 'Data Modeling'
        }
      ],
      trickyQuestions: [
        {
          q: 'Cum rezolvi problema "Data Skew" intr-un job distribuit Apache Spark?',
          a: 'Data Skew apare cand o anumita cheie are un volum disproportionat de date, blocand un singur executor pe 99%. Se rezolva prin "salting" (adaugarea unui numar aleatoriu la cheie pentru a distribui partitiile uniform) sau prin folosirea Adaptive Query Execution (AQE).',
          why: 'Intrebare cheie pentru testarea experientei reale cu Apache Spark.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unui pipeline de colectare a evenimentelor de clickstream in timp real',
        keyPoints: [
          'Ingestie rapida prin Apache Kafka cu partitionare pe user_id',
          'Procesare de streaming (Spark Streaming sau Flink)',
          'Stocare cold pe S3 si stocare hot in baza de date analitica'
        ]
      }
    },

    freeResources: [
      {
        title: 'Data Engineering Zoomcamp (DataTalksClub)',
        platform: 'GitHub / YouTube',
        url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp',
        type: 'COURSE',
        description: 'Cel mai complet bootcamp open-source gratuit de Data Engineering din lume (Docker, Terraform, GCP, Airflow, dbt, Spark, Kafka).',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Data Engineer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/data-engineer',
        type: 'ROADMAP',
        description: 'Harta vizuala completa pentru tehnologiile de date, warehousing si streaming.',
        isTopPick: true
      },
      {
        title: 'Mode Analytics - Ghid Complet de SQL Avansat',
        platform: 'Mode.com',
        url: 'https://mode.com/sql-tutorial/',
        type: 'DOCS',
        description: 'Cel mai bine structurat tutorial gratuit pentru Window Functions si analize complexe de SQL.',
        isTopPick: true
      }
    ],

    stages: [
      { stageNumber: 1, title: 'SQL Avansat & Python', duration: '4 Saptamani', milestones: ['Window functions si interogari recursive', 'Python OOP si manipulare fisiere Parquet', 'Design de baze de date analitice'] },
      { stageNumber: 2, title: 'Modelare Date & Data Warehousing', duration: '3 Saptamani', milestones: ['Star Schema si modelare dimensionala Kimball', 'Configurare si interogari in Cloud Data Warehouse', 'Transformare de date cu dbt'] },
      { stageNumber: 3, title: 'Orchestrare cu Apache Airflow', duration: '4 Saptamani', milestones: ['Creare de DAG-uri robuste in Airflow', 'Gestionare dependinte si alerte automate', 'Containerizare pipeline in Docker Compose'] },
      { stageNumber: 4, title: 'Procesare Distribuita (Spark) & Portofoliu', duration: '4 Saptamani', milestones: ['Scriere de transformari in PySpark', 'Optimizare partitii si memorie', 'Finalizare proiect complet pe GitHub'] }
    ]
  },

  {
    id: 'EMBEDDED_SYSTEMS',
    title: 'Embedded Systems & C/C++',
    shortTitle: 'Embedded',
    badge: 'Hardware & Sisteme Reale',
    iconKey: 'Cpu',
    tagLine: 'Programare low-level in C si C++, microcontrollere (STM32, ESP32, AVR), sisteme de operare in timp real (RTOS) si protocoale de comunicatie.',
    salaryJunior: '4.500 - 7.500 RON net',
    salaryMid: '8.500 - 15.000 RON net',
    marketDemand: 'Cerere consistenta in industria Automotive (Continental, Bosch, Vitesco) si IoT din Romania',

    reachInterview: {
      mustHaveSkills: [
        { name: 'C / C++ Modern (C++17/20) la Nivel Low-Level', level: 'CRITIC', desc: 'Pointeri, aritmetica de pointeri, alocare memorie, operatii pe biti (bitmasking).' },
        { name: 'Protocoale Hardware de Comunicatie', level: 'CRITIC', desc: 'UART, SPI, I2C, CAN Bus (esential in automotive).' },
        { name: 'Microcontrollere & Arhitectura ARM Cortex', level: 'ESENTIAL', desc: 'Configurare GPIO, timere, intreruperi (ISR), ADC/DAC, DMA.' },
        { name: 'Sisteme de Operare in Timp Real (FreeRTOS)', level: 'ESENTIAL', desc: 'Task-uri concurente, mutexuri, semafoare, cozi de mesaje in timp real.' }
      ],
      recommendedProject: {
        title: 'Statie IoT / Controller Embedded pe STM32 sau ESP32 cu FreeRTOS',
        description: 'Construieste un proiect firmware complet pe un microcontroller real sau simulator (QEMU/Wokwi): citire de senzori pe magistrala I2C/SPI, procesare date pe task-uri FreeRTOS si transmisie de date prin CAN Bus sau Wi-Fi.',
        keyFeatures: [
          'Cod C scris conform standardelor MISRA-C pentru siguranta',
          'Arhitectura multithreaded cu FreeRTOS fara blocaje sau race conditions',
          'Gestionare eficienta a consumului redus de energie (Low-power sleep modes)'
        ],
        githubAdvice: 'Include o schema electronica (KiCad / Fritzing) si o filmare demonstrativa cu placa fizica functionand.'
      },
      googleXyzBullet: 'Dezvoltat firmware modular in C si FreeRTOS pentru microcontroller STM32, implementand comunicatie pe magistrala SPI cu citire la 100Hz si optimizand consumul de memorie RAM sub 32KB.',
      cvScreenTips: [
        'Mentioneaza echipamentele de laborator pe care le stapanesti (Osciloscop, Analizor Logic, Multimetru).',
        'Specificatiile de hardware (ex: "STM32F4 Cortex-M4, ESP32") atrag imediat atentia companiilor de profil.'
      ],
      commonMistakes: [
        'Utilizarea functiei malloc() in sisteme embedded critice (produce fragmentare de memorie in timp).'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Manipulare biti si operatii low-level in C',
        patterns: ['Setare / stergere / inversare bit specific', 'Verificare Little Endian vs Big Endian', 'Implementare Circular Buffer (Ring Buffer)'],
        tips: 'Fii gata sa scrii un Ring Buffer fara alocare dinamica direct pe tabla sau in editor simplu.'
      },
      topQuestions: [
        {
          q: 'Ce inseamna cuvantul cheie "volatile" in C si cand este absolut obligatoriu?',
          a: 'Cuvantul cheie "volatile" indica compilatorului ca valoarea variabilei se poate schimba in orice moment in afara fluxului normal al programului (ex: de catre un registru hardware memory-mapped sau o rutina de intrerupere ISR). Previne compilatorul sa optimizeze variabila prin retinerea ei exclusiva intr-un registru CPU.',
          category: 'Limbaj C Low-Level'
        },
        {
          q: 'Ce este un Deadlock si cum il previi intr-un sistem cu FreeRTOS?',
          a: 'Deadlock-ul apare cand doua task-uri asteapta fiecare resursa blocata de celalalt. Se previne prin alocarea resurselor mereu in aceeasi ordine stricta, folosirea de timeout-uri pe mutexuri (nu blocare infinita) si evitarea blocarii indelungate a resurselor in sectiuni critice.',
          category: 'RTOS & Concurenta'
        }
      ],
      trickyQuestions: [
        {
          q: 'Ce este "Priority Inversion" si cum se rezolva prin "Priority Inheritance"?',
          a: 'Apare cand un task de prioritate mica blocheaza o resursa necesara unui task de prioritate mare, dar un task mediu ruleaza si intarzie ambele task-uri. Priority Inheritance rezolva problema marind temporar prioritatea task-ului mic la nivelul task-ului mare pana cand elibereaza resursa.',
          why: 'Intrebare celebra din istoria misiunii Mars Pathfinder si test de aur pentru ingineri embedded.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unui driver de comunicatie I2C non-blocant',
        keyPoints: [
          'Utilizarea mecanismului DMA (Direct Memory Access) pentru transfer fara ocuparea procesorului',
          'Tratarea erorilor de timeout pe magistrala si reset de bus la blocaj'
        ]
      }
    },

    freeResources: [
      {
        title: 'Learn C++ (learncpp.com)',
        platform: 'LearnCpp.com',
        url: 'https://www.learncpp.com/',
        type: 'DOCS',
        description: 'Cel mai bun ghid gratuit si actualizat din lume pentru invatarea limbajului C++ de la zero la avansat.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh C++ Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/cpp',
        type: 'ROADMAP',
        description: 'Harta vizuala a competentelor moderne de programare C++ si sisteme.',
        isTopPick: true
      },
      {
        title: 'CS50 Introduction to Computer Science (Harvard)',
        platform: 'edX / Harvard Online',
        url: 'https://cs50.harvard.edu/x/',
        type: 'COURSE',
        description: 'Cel mai faimos curs de fundamente de computer science si programare in C cu memorie manuala.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Limbajul C Riguros & Pointeri', duration: '4 Saptamani', milestones: ['Aritmetica de pointeri si alocare memorie', 'Operatii pe biti si structuri compacte de date', 'Compilare cu GCC si Makefiles'] },
      { stageNumber: 2, title: 'Microcontrollere & Hardware Peripherals', duration: '4 Saptamani', milestones: ['Configurare GPIO si timere hardware', 'Comunicatie pe protocoale UART, SPI, I2C', 'Tratare intreruperi si mecanismul NVIC'] },
      { stageNumber: 3, title: 'Sisteme RTOS (FreeRTOS)', duration: '4 Saptamani', milestones: ['Creare de task-uri si planificare prioritara', 'Sincronizare cu semafoare si cozi', 'Depanare buguri de concurenta'] },
      { stageNumber: 4, title: 'Proiect Practic & Pregatire Interviuri', duration: '3 Saptamani', milestones: ['Finalizare firmware pe placa fizica sau simulator', 'Documentare cod conform standardelor', 'Rezolvare intrebari capcana despre volatile si memorie'] }
    ]
  },

  {
    id: 'MOBILE',
    title: 'Mobile Development (Flutter, iOS, Android)',
    shortTitle: 'Mobile',
    badge: 'Aplicatii Mobile & UI',
    iconKey: 'Smartphone',
    tagLine: 'Aplicatii mobile native si cross-platform cu Flutter, React Native, Swift (iOS) sau Kotlin (Android), publicare in App Store si Google Play.',
    salaryJunior: '4.200 - 7.000 RON net',
    salaryMid: '8.000 - 14.500 RON net',
    marketDemand: 'Oportunitati excelente in companii de fintech, livrari si startup-uri de consum',

    reachInterview: {
      mustHaveSkills: [
        { name: 'Framework Mobil (Flutter / Dart sau React Native sau Kotlin)', level: 'CRITIC', desc: 'Componente/Widget-uri, state management si responsive design mobil.' },
        { name: 'Consum de REST APIs & Caching Local', level: 'CRITIC', desc: 'Stocare locala securizata (Hive, SQLite, SharedPreferences) si offline support.' },
        { name: 'Management de Stare (Bloc, Riverpod, Redux)', level: 'ESENTIAL', desc: 'Separarea logicii de business de interfata vizuala a ecranelor.' },
        { name: 'Permisiuni & Servicii Native', level: 'ESENTIAL', desc: 'Camere, GPS/Geolocatie, Notificari Push (Firebase Cloud Messaging).' }
      ],
      recommendedProject: {
        title: 'Aplicatie Mobila Completa cu Functionare Offline si Notificari Push',
        description: 'Construieste o aplicatie mobila functionala (ex: aplicatie de urmarit finante personale, fitness tracker sau client de stiri) cu suport offline complet, sincronizare automata cand revine conexiunea si design adaptat pentru iOS si Android.',
        keyFeatures: [
          'Arhitectura curata (Clean Architecture) cu BLoC sau Riverpod',
          'Mod offline-first: datele se salveaza local si se sincronizeaza cand exista internet',
          'Animatii fluide la 60fps si mod Dark / Light conform preferintei sistemului'
        ],
        githubAdvice: 'Adauga capturi de ecran ale aplicatiei pe iOS si Android si un fisier APK descarcabil direct din GitHub Releases.'
      },
      googleXyzBullet: 'Dezvoltat si lansat o aplicatie mobila cross-platform in Flutter si Dart, implementand mod offline-first cu SQLite si reducand consumul de date mobile cu 35%.',
      cvScreenTips: [
        'Include link direct catre aplicatia publicata in Google Play / App Store sau fisierul APK de test.',
        'Mentine codul bine structurat pe module clare (Domain, Data, Presentation).'
      ],
      commonMistakes: [
        'Blocarea firului principal de executie (UI Thread) cu operatiuni grele de retea sau parsare JSON.'
      ]
    },

    passInterview: {
      codingFocus: {
        leetcodeLevel: 'Dart / Kotlin / JS data transformations',
        patterns: ['Parsare si serializare sigura de JSON', 'Gestiune fluxuri asincrone (Streams, Coroutines, Futures)'],
        tips: 'Fii gata sa explici ciclul de viata al unui ecran (Activity / ViewController / State).'
      },
      topQuestions: [
        {
          q: 'Cum functioneaza ciclul de viata al unui StatefulWidget in Flutter?',
          a: 'Ciclul parcurge etapele: createState() -> initState() (initializari unice) -> didChangeDependencies() -> build() (randare UI la fiecare schimbare de stare) -> dispose() (eliberare controllere si listeneri pentru a preveni memory leaks).',
          category: 'Flutter Lifecycle'
        }
      ],
      trickyQuestions: [
        {
          q: 'Ce este un Memory Leak pe mobil si cum poate fi provocat de un Listener sau Timer neinchis?',
          a: 'Apare cand un obiect care nu mai este necesar pe ecran ramane referentiat in memorie de catre un listener global sau un Timer activ, impiedicand Garbage Collector-ul sa elibereze memoria. In timp, aplicatia consuma din ce in ce mai mult RAM pana cand sistemul de operare o opreste fortat (OOM crash).',
          why: 'Verifica grija candidatului pentru stabilitatea aplicatiei in buzunarul utilizatorului.'
        }
      ],
      systemDesignMini: {
        topic: 'Designul unei strategii de sincronizare offline-first',
        keyPoints: [
          'Salvarea imediata a actiunii utilizatorului in baza de date locala',
          'Coada interna de sincronizare asincrona cu mecanism de retry la erori de retea',
          'Rezolvarea conflictelor pe baza de timestamp sau Last-Write-Wins'
        ]
      }
    },

    freeResources: [
      {
        title: 'Roadmap.sh Flutter Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/flutter',
        type: 'ROADMAP',
        description: 'Ghidul vizual complet pentru dezvoltare de aplicatii mobile cross-platform cu Flutter.',
        isTopPick: true
      },
      {
        title: 'Android Developers - Cursuri Oficiale Gratuite',
        platform: 'Developer.android.com',
        url: 'https://developer.android.com/courses',
        type: 'COURSE',
        description: 'Cursurile oficiale de la Google pentru invatarea dezvoltarii native de Android cu limbajul modern Kotlin.',
        isTopPick: true
      },
      {
        title: 'Flutter Codelabs Oficiale',
        platform: 'Docs.flutter.dev',
        url: 'https://docs.flutter.dev/codelabs',
        type: 'DOCS',
        description: 'Tutoriale pas cu pas in browser pentru construirea primelor aplicatii Flutter profesionale.',
        isTopPick: false
      }
    ],

    stages: [
      { stageNumber: 1, title: 'Limbajul de Baza & Fundamente UI', duration: '4 Saptamani', milestones: ['Stapanire Dart sau Kotlin', 'Componente vizuale de baza si styling', 'Navigare intre ecrane'] },
      { stageNumber: 2, title: 'Management de Stare & Consum API', duration: '4 Saptamani', milestones: ['Arhitectura cu BLoC sau Riverpod', 'Interogari HTTP si parsare sigura de JSON', 'Stocare locala cu baza de date'] },
      { stageNumber: 3, title: 'Functii Native & Offline Support', duration: '3 Saptamani', milestones: ['Integrare servicii de geolocatie si camera', 'Configurare notificari push Firebase', 'Optimizare fluenta a animatiilor'] },
      { stageNumber: 4, title: 'Publicare & Pregatire Interviuri', duration: '3 Saptamani', milestones: ['Generare APK si pachete de release', 'Deploy aplicatie in magazin sau pe GitHub', 'Rezolvare intrebari despre ciclul de viata si memorie'] }
    ]
  }
];
