// Comprehensive Learning & Interview Preparation Resources for Tech Job Tracks
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
    marketDemand: 'Peste 35% din toate anunturile IT de Junior / Mid din Romania',

    freeLearnResources: [
      {
        title: 'Roadmap.sh Backend Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/backend',
        type: 'ROADMAP VIZUAL',
        description: 'Ghidul vizual interactiv numarul 1 in lume pentru toate ramurile de backend: de la retele si HTTP la baze de date si microservicii.',
        isTopPick: true
      },
      {
        title: 'University of Helsinki - Java Programming I & II',
        platform: 'Mooc.fi (Univ. Helsinki)',
        url: 'https://java-programming.mooc.fi/',
        type: 'CURS COMPLET',
        description: 'Cel mai bun curs universitar gratuit de Java din lume, cu exercitii practice si verificator automat in IDE.',
        isTopPick: true
      },
      {
        title: 'Baeldung - Ghiduri & Tutoriale Spring Boot',
        platform: 'Baeldung.com',
        url: 'https://www.baeldung.com/spring-boot',
        type: 'DOCUMENTATIE & GHIDURI',
        description: 'Enciclopedia de referinta pentru Java si Spring, explicata clar cu exemple practice de cod gata de rulat.',
        isTopPick: true
      },
      {
        title: 'Microsoft Learn - C# and .NET Core',
        platform: 'Microsoft Learn',
        url: 'https://learn.microsoft.com/en-us/dotnet/',
        type: 'CURS OFICIAL INTERACTIV',
        description: 'Parcurs complet gratuit oferit de Microsoft pentru invatat C#, ASP.NET Core, Entity Framework si aplicatii web.',
        isTopPick: false
      },
      {
        title: 'FastAPI Official Interactive Tutorial',
        platform: 'FastAPI Docs',
        url: 'https://fastapi.tiangolo.com/tutorial/',
        type: 'TUTORIAL PRACTIC',
        description: 'Ghid interactiv exceptional pentru construirea de REST API-uri moderne si rapide in Python cu validari Pydantic.',
        isTopPick: false
      },
      {
        title: 'PostgreSQL Tutorial & Exercises',
        platform: 'PostgreSQL Tutorial',
        url: 'https://www.postgresqltutorial.com/',
        type: 'GHID SQL & BAZE DE DATE',
        description: 'Curs complet gratuit SQL: modelare tabele, indecsi B-Tree, JOIN-uri complexe, tranzactii ACID si optimizare query-uri.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'Baeldung - Top Java & Spring Interview Questions & Answers',
        platform: 'Baeldung',
        url: 'https://www.baeldung.com/java-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Peste 200 de intrebari reale de interviu explicate pas cu pas: Core Java, OOP, Collections, Multithreading, Spring Boot, JPA/Hibernate si tranzactii.',
        isTopPick: true
      },
      {
        title: 'GitHub: DopplerHQ/awesome-interview-questions (Java & Backend)',
        platform: 'GitHub (58k+ stars)',
        url: 'https://github.com/DopplerHQ/awesome-interview-questions#java',
        type: 'REPO GITHUB DEDICAT',
        description: 'Colectie gigantica de intrebari si raspunsuri de interviu structurate pe limbaje (Java, C#, Python, Go), baze de date si arhitecturi web.',
        isTopPick: true
      },
      {
        title: 'NeetCode.io (Coding & Algoritmi pe Pattern-uri)',
        platform: 'NeetCode.io',
        url: 'https://neetcode.io/practice',
        type: 'ALGORITMI & LIVE CODING',
        description: 'Structura ideala de probleme LeetCode clasificate pe pattern-uri (Arrays, Two Pointers, Trees, BFS/DFS) cu solutii video pas cu pas.',
        isTopPick: true
      },
      {
        title: 'GitHub: donnemartin/system-design-primer',
        platform: 'GitHub (280k+ stars)',
        url: 'https://github.com/donnemartin/system-design-primer',
        type: 'SYSTEM DESIGN & ARHITECTURA',
        description: 'Repozitoriu open-source #1 pentru intelegerea intrebarilor de System Design: caching Redis, scalare baze de date, cozi Kafka/RabbitMQ si load balancers.',
        isTopPick: true
      },
      {
        title: 'InterviewBit - C# / .NET Interview Questions',
        platform: 'InterviewBit',
        url: 'https://www.interviewbit.com/c-sharp-interview-questions/',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Intrebari si raspunsuri frecvente pentru dezvoltatori .NET: CLR, Garbage Collection, async/await, LINQ, dependency injection si middleware.',
        isTopPick: false
      },
      {
        title: 'Pramp - Free Peer-to-Peer Mock Interviews',
        platform: 'Pramp',
        url: 'https://www.pramp.com/',
        type: 'MOCK INTERVIEWS GRATUITE',
        description: 'Simuleaza interviul tehnic live cu alti programatori in timp real, primind feedback direct pe comunicare si cod.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'FRONTEND',
    title: 'Frontend Development',
    shortTitle: 'Frontend',
    badge: 'Interfete Moderne & UX',
    iconKey: 'Layout',
    tagLine: 'Aplicatii web reactive, React, TypeScript, Next.js, performanta vizuala si experiente de utilizator impecabile.',
    marketDemand: 'Peste 25% din ofertele de web development pe piata locala',

    freeLearnResources: [
      {
        title: 'React.dev - Documentatia Oficiala Interactiva',
        platform: 'React Docs',
        url: 'https://react.dev/learn',
        type: 'DOCUMENTATIE & TUTORIAL',
        description: 'Cel mai bun ghid modern pentru React: Hooks, state management, componente functionale si bune practici cu exemple in browser.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Frontend Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/frontend',
        type: 'ROADMAP VIZUAL',
        description: 'Harta vizuala completa: de la fundamente HTML/CSS/JavaScript la framework-uri moderne, state management si optimizari Core Web Vitals.',
        isTopPick: true
      },
      {
        title: 'FullStackOpen - React, Redux & TypeScript',
        platform: 'Mooc.fi (Univ. Helsinki)',
        url: 'https://fullstackopen.com/en/',
        type: 'CURS UNIVERSITAR',
        description: 'Curs de renume international gratuit cu certificare, acoperind React, custom hooks, TypeScript si testare frontend.',
        isTopPick: true
      },
      {
        title: 'The Odin Project - Full Stack JavaScript',
        platform: 'The Odin Project',
        url: 'https://www.theodinproject.com/',
        type: 'CURS BAZAT PE PROIECTE',
        description: 'Curriculum gratuit complet ghidat, centrat pe crearea de proiecte reale de portofoliu cu JavaScript si React.',
        isTopPick: false
      },
      {
        title: 'Total TypeScript Beginner Tutorials',
        platform: 'Total TypeScript',
        url: 'https://www.totaltypescript.com/tutorials',
        type: 'CURS TYPESCRIPT',
        description: 'Ghiduri interactive create de Matt Pocock pentru intelegerea tipurilor stricte, genericelor si interactiunii cu React.',
        isTopPick: false
      },
      {
        title: 'MDN Web Docs - Web Technologies',
        platform: 'Mozilla Developer Network',
        url: 'https://developer.mozilla.org/',
        type: 'ENCICLOPEDIE OFICIALA',
        description: 'Standardul de aur mondial pentru documentarea tuturor API-urilor din browser, DOM, CSS Grid, Flexbox si JavaScript modern.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: sudheerj/reactjs-interview-questions (500+ Q&A)',
        platform: 'GitHub (42k+ stars)',
        url: 'https://github.com/sudheerj/reactjs-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Peste 500 de intrebari reale de interviu cu raspunsuri detaliate: React Hooks, Virtual DOM, Reconciliation, Fiber, Context si optimizari de randare.',
        isTopPick: true
      },
      {
        title: 'GitHub: yangshun/front-end-interview-handbook',
        platform: 'GitHub (41k+ stars)',
        url: 'https://github.com/yangshun/front-end-interview-handbook',
        type: 'GHID COMPLET INTERVIU',
        description: 'Creat de un inginer ex-Meta: intrebari si raspunsuri pe JavaScript ES6+, CSS, HTML, quizz-uri de interviu si intrebari de arhitectura frontend.',
        isTopPick: true
      },
      {
        title: 'GreatFrontEnd - Frontend Interview Questions & Quizzes',
        platform: 'GreatFrontEnd',
        url: 'https://www.greatfrontend.com/questions',
        type: 'LIVE CODING & QUIZZ-URI',
        description: 'Platforma specializata 100% in interviuri de frontend: exercitii de implementat componente (Accordion, Tabs, Autocomplete) si intrebari teoretice.',
        isTopPick: true
      },
      {
        title: 'BFE.dev (BigFrontend) - Coding Challenges',
        platform: 'BFE.dev',
        url: 'https://bigfrontend.dev/',
        type: 'PROBLEME LIVE CODING JS',
        description: 'Implementeaza functii fundamentale cerute des la interviu: debounce, throttle, Promise.all, deep clone, Event Emitter si custom hooks.',
        isTopPick: false
      },
      {
        title: 'JavaScript.info - Concepte Avansate & Teste',
        platform: 'JavaScript.info',
        url: 'https://javascript.info/',
        type: 'TEORIE & CAPCANE TEHNICE',
        description: 'Explicatii concise si exercitii despre Event Loop, Microtasks, Hoisting, Prototypes, Closures si contextul this.',
        isTopPick: false
      },
      {
        title: 'FreeCodeCamp - Coding Interview Prep',
        platform: 'FreeCodeCamp',
        url: 'https://www.freecodecamp.org/learn/coding-interview-prep/',
        type: 'ALGORITMI IN JAVASCRIPT',
        description: 'Sute de exercitii de algoritmi si structuri de date rezolvate direct in browser pentru trecerea probelor de selectie.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'FULLSTACK',
    title: 'Full-Stack Development',
    shortTitle: 'Full-Stack',
    badge: 'Polivalenta & End-to-End',
    iconKey: 'Layers',
    tagLine: 'Conectarea fluida intre interfete utilizator moderne si sisteme de backend robuste cu baze de date relationale.',
    marketDemand: 'Peste 30% din start-up-uri si agentii tech prefera candidati Full-Stack',

    freeLearnResources: [
      {
        title: 'FullStackOpen (Universitatea din Helsinki)',
        platform: 'Mooc.fi (Univ. Helsinki)',
        url: 'https://fullstackopen.com/en/',
        type: 'CURS COMPLET CERTIFICAT',
        description: 'Cel mai complet curs universitar gratuit de web development din lume: React, Node, Express, MongoDB, PostgreSQL, GraphQL si CI/CD.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Full Stack Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/full-stack',
        type: 'ROADMAP VIZUAL',
        description: 'Ghid interactiv complet al integrarii client-server, protocoale HTTP/WebSockets, autentificare si baze de date.',
        isTopPick: true
      },
      {
        title: 'The Odin Project - Full Stack Curriculum',
        platform: 'The Odin Project',
        url: 'https://www.theodinproject.com/',
        type: 'CURS BAZAT PE PROIECTE',
        description: 'Curriculum orientat spre proiecte practice de la zero, invatand construirea integrala a unor aplicatii tip SaaS.',
        isTopPick: true
      },
      {
        title: 'Harvard CS50’s Web Programming with Python and JavaScript',
        platform: 'Harvard University (edX / YouTube)',
        url: 'https://cs50.harvard.edu/web/',
        type: 'CURS UNIVERSITAR',
        description: 'Curs gratuit universitar Harvard care acopera designul de aplicatii web, baze de date, Django si JavaScript.',
        isTopPick: false
      },
      {
        title: 'Prisma ORM & PostgreSQL Guides',
        platform: 'Prisma Docs',
        url: 'https://www.prisma.io/docs/getting-started',
        type: 'TUTORIAL BAZE DE DATE',
        description: 'Ghiduri moderne pentru modelarea bazelor de date, migrari automate si interogari sigure tipizate.',
        isTopPick: false
      },
      {
        title: 'FreeCodeCamp - Full Stack Certification',
        platform: 'FreeCodeCamp',
        url: 'https://www.freecodecamp.org/learn',
        type: 'PLATFORMA INTERACTIVA',
        description: 'Peste 300 de ore de exercitii practice si proiecte complete pentru front-end si back-end cu API-uri REST.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'Tech Interview Handbook (by Yangshun Tay)',
        platform: 'TechInterviewHandbook',
        url: 'https://www.techinterviewhandbook.org/',
        type: 'GHID STRATEGIC INTERVIU',
        description: 'Ghid exhaustiv creat de ingineri seniori: pregatire de algoritmi, intrebari comportamentale (metoda STAR), arhitectura si negocierea ofertelor.',
        isTopPick: true
      },
      {
        title: 'GitHub: MaximAbramchuck/awesome-interview-questions',
        platform: 'GitHub (62k+ stars)',
        url: 'https://github.com/MaximAbramchuck/awesome-interview-questions',
        type: 'BANCA GIGANTICA INTREBARI',
        description: 'Index masiv de intrebari tehnice pe categorii: frontend, backend, REST, SQL, NoSQL, protocoale HTTP, securitate web si deployment.',
        isTopPick: true
      },
      {
        title: 'LeetCode Top Interview 150',
        platform: 'LeetCode',
        url: 'https://leetcode.com/studyplan/top-interview-150/',
        type: 'ALGORITMI & LIVE CODING',
        description: 'Cele 150 de probleme clasice cerute constant la testele tehnice de live coding de catre companiile IT.',
        isTopPick: true
      },
      {
        title: 'GitHub: donnemartin/system-design-primer',
        platform: 'GitHub (280k+ stars)',
        url: 'https://github.com/donnemartin/system-design-primer',
        type: 'SYSTEM DESIGN & ARHITECTURA',
        description: 'Pregatire solida pentru intrebari de arhitectura end-to-end: fluxuri client-server, caching, baze de date distribuite si consistenta datelor.',
        isTopPick: true
      },
      {
        title: 'InterviewBit - Full Stack Interview Questions',
        platform: 'InterviewBit',
        url: 'https://www.interviewbit.com/full-stack-developer-interview-questions/',
        type: 'BANCA INTREBARI REALE',
        description: 'Intrebari si teste practice acoperind securitatea JWT, CORS, relatii SQL, ORM, rendering SSR vs CSR si middleware.',
        isTopPick: false
      },
      {
        title: 'Pramp - Free Mock Interviews for Developers',
        platform: 'Pramp',
        url: 'https://www.pramp.com/',
        type: 'MOCK INTERVIEWS GRATUITE',
        description: 'Sesiuni live 1-la-1 pentru exersat intrebari tehnice de programare si system design in conditii reale de interviu.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'QA_AUTOMATION',
    title: 'QA Automation Engineering',
    shortTitle: 'QA Automation',
    badge: 'Calitate Software & CI/CD',
    iconKey: 'Bug',
    tagLine: 'Testare automata End-to-End, API testing, framework-uri de testare (Playwright, Selenium) si integrare continua.',
    marketDemand: 'Peste 20% crestere pe cererea de automatizare fata de testarea manuala',

    freeLearnResources: [
      {
        title: 'Test Automation University (Applitools)',
        platform: 'Test Automation U',
        url: 'https://testautomationu.applitools.com/',
        type: 'CURSURI COMPLETE CERTIFICATE',
        description: 'Peste 60 de cursuri 100% gratuite predate de experti mondiali: Playwright, Selenium, Cypress, Appium, API testing si CI/CD.',
        isTopPick: true
      },
      {
        title: 'Playwright Official Documentation & Guides',
        platform: 'Playwright Docs',
        url: 'https://playwright.dev/docs/intro',
        type: 'DOCUMENTATIE & EXEMPLE',
        description: 'Ghidul oficial pentru cel mai rapid si modern framework de testare E2E (suporta TypeScript, Python, Java si C#).',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh QA Engineer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/qa',
        type: 'ROADMAP VIZUAL',
        description: 'Ghidul vizual complet pentru tranzitia de la testare manuala la crearea de framework-uri automate robuste.',
        isTopPick: true
      },
      {
        title: 'Guru99 - Software Testing Fundamentals',
        platform: 'Guru99',
        url: 'https://www.guru99.com/software-testing.html',
        type: 'CURS TEORIE & METODOLOGII',
        description: 'Tutoriale exhaustive despre concepte ISTQB, cicluri de testare, testare de integrare, teste de regresie si defect tracking.',
        isTopPick: false
      },
      {
        title: 'Postman Learning Center - API Testing',
        platform: 'Postman Docs',
        url: 'https://learning.postman.com/',
        type: 'TESTARE API & SCRIPTS',
        description: 'Cursuri gratuite si certificari pentru crearea de colectii de teste automate de API cu asertiuni JavaScript si Newman.',
        isTopPick: false
      },
      {
        title: 'Ministry of Testing Community Resources',
        platform: 'Ministry of Testing',
        url: 'https://www.ministryoftesting.com/',
        type: 'COMUNITATE & ARTICOLE',
        description: 'Cea mai mare comunitate globala de testare software cu articole practice si bune practici pentru inginerii QA.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'SoftwareTestingHelp - 100+ QA Automation Interview Questions',
        platform: 'Software Testing Help',
        url: 'https://www.softwaretestinghelp.com/automation-testing-interview-questions/',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Intrebari si raspunsuri exhaustive despre Page Object Model, framework-uri Data-Driven, gestionarea selectorilor XPath/CSS si teste flaky.',
        isTopPick: true
      },
      {
        title: 'GitHub: atinfo/awesome-test-automation',
        platform: 'GitHub',
        url: 'https://github.com/atinfo/awesome-test-automation',
        type: 'REPO RESURSE INTERVIU',
        description: 'Colectie impresionanta de framework-uri, unelte, cheat sheets si intrebari tipice pentru testarea web, mobile si API.',
        isTopPick: true
      },
      {
        title: 'Automation Panda (Andy Knight) - Testing Architecture',
        platform: 'Automation Panda',
        url: 'https://automationpanda.com/',
        type: 'GHID ARHITECTURA TESTARE',
        description: 'Articole si raspunsuri de inalta calitate la dileme de interviu: piramida testarii, BDD cu Cucumber, test reporting si paralelizare.',
        isTopPick: true
      },
      {
        title: 'Guru99 ISTQB Sample Exam & Interview Questions',
        platform: 'Guru99',
        url: 'https://www.guru99.com/istqb-sample-questions.html',
        type: 'GRILE & TEORIE ISTQB',
        description: 'Banci de intrebari tipice de verificare a terminologiei: tehnici de cutie neagra, boundary value analysis si partitionare pe clase de echivalenta.',
        isTopPick: false
      },
      {
        title: 'GitHub: christian-bromann/awesome-selenium',
        platform: 'GitHub',
        url: 'https://github.com/christian-bromann/awesome-selenium',
        type: 'CHEAT SHEETS & TRUCURI',
        description: 'Solutii concrete la provocarile clasice de interviu: explicit vs implicit waits, manipulare de ferestre si tabs, iframes si headless execution.',
        isTopPick: false
      },
      {
        title: 'Rest-Assured API Testing Guides & Questions',
        platform: 'REST-Assured',
        url: 'https://rest-assured.io/',
        type: 'TESTARE API BACKEND',
        description: 'Ghiduri practice despre cum sa validezi raspunsuri JSON, autentificare OAuth/Basic si contracte API in suite automate.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'DEVOPS_CLOUD',
    title: 'DevOps & Cloud Engineering',
    shortTitle: 'DevOps & Cloud',
    badge: 'Infrastructura & Automatizare',
    iconKey: 'Cloud',
    tagLine: 'Containerizare Docker, orchestrare Kubernetes, Infrastructure as Code (Terraform), CI/CD si servicii cloud AWS/Azure.',
    marketDemand: 'Printre cele mai cautate si bine platite roluri tehnice din Romania',

    freeLearnResources: [
      {
        title: 'Roadmap.sh DevOps Engineer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/devops',
        type: 'ROADMAP VIZUAL',
        description: 'Ghidul vizual interactiv numarul 1 in lume: Linux, retelistica, containere, Kubernetes, Terraform, CI/CD si monitorizare.',
        isTopPick: true
      },
      {
        title: 'DevOps Directive - 105 Days of DevOps',
        platform: 'DevOps Directive',
        url: 'https://devopsdirective.com/',
        type: 'CURS PRACTIC COMPLET',
        description: 'Curs complet open-source cu tutoriale practice si proiecte reale de la zero pentru viitorii ingineri DevOps.',
        isTopPick: true
      },
      {
        title: 'Linux Journey - Comenzi & Administrare Linux',
        platform: 'Linux Journey',
        url: 'https://linuxjourney.com/',
        type: 'TUTORIAL LINUX INTERACTIV',
        description: 'Cel mai prietenos mod de a invata linia de comanda Linux, permisiuni de fisiere, procese, SSH si retelistica.',
        isTopPick: true
      },
      {
        title: 'Docker Official Get Started Guides',
        platform: 'Docker Docs',
        url: 'https://docs.docker.com/get-started/',
        type: 'DOCUMENTATIE & LABS',
        description: 'Ghidul oficial pentru construirea de imagini Docker eficiente, utilizarea docker-compose si configurarea retelelor.',
        isTopPick: false
      },
      {
        title: 'Kubernetes The Hard Way (Kelsey Hightower)',
        platform: 'GitHub',
        url: 'https://github.com/kelseyhightower/kubernetes-the-hard-way',
        type: 'LABORATOR DE ADANCIME',
        description: 'Tutorialul legendar open-source pentru a intelege cum functioneaza intern fiecare componenta Kubernetes fara instalatoare automate.',
        isTopPick: false
      },
      {
        title: 'AWS Skill Builder (Cursuri Cloud Gratuite)',
        platform: 'AWS Skill Builder',
        url: 'https://explore.skillbuilder.aws/',
        type: 'CURSURI OFICIALE CLOUD',
        description: 'Sute de cursuri digitale gratuite oferite direct de Amazon Web Services pentru intelegerea EC2, S3, IAM si VPC.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: BrendaSt/devops-interview-questions (300+ Q&A)',
        platform: 'GitHub',
        url: 'https://github.com/BrendaSt/devops-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Peste 300 de intrebari si raspunsuri structurate pe Docker, Kubernetes, Linux, Git, Jenkins, Terraform, AWS si CI/CD.',
        isTopPick: true
      },
      {
        title: 'GitHub: MichaelCade/90DaysOfDevOps',
        platform: 'GitHub (26k+ stars)',
        url: 'https://github.com/MichaelCade/90DaysOfDevOps',
        type: 'GHID COMPLET & SCENARII',
        description: 'Repozitoriu urias care documenteaza 90 de zile de teorie, comenzi esentiale, scenarii practice si intrebari de interviu.',
        isTopPick: true
      },
      {
        title: 'GitHub: pedramamineh/DevOps-Interview-Questions',
        platform: 'GitHub',
        url: 'https://github.com/pedramamineh/DevOps-Interview-Questions',
        type: 'DEPENARE & SCENARII PRACTICE',
        description: 'Scenarii reale de interviu: de ce un pod Kubernetes este in CrashLoopBackOff, depanare DNS/retea si optimizare Dockerfiles.',
        isTopPick: true
      },
      {
        title: 'KodeKloud Free Quizzes & Labs',
        platform: 'KodeKloud',
        url: 'https://kodekloud.com/',
        type: 'QUIZZ-URI & TESTE LINUX/K8S',
        description: 'Quizz-uri interactive si teste rapide pentru verificarea comenzilor de Docker, Kubernetes si configurari YAML inainte de interviu.',
        isTopPick: false
      },
      {
        title: 'Sanfoundry - 1000 Linux Questions & Answers',
        platform: 'Sanfoundry',
        url: 'https://www.sanfoundry.com/1000-linux-questions-answers/',
        type: 'GRILE LINUX & RETELE',
        description: 'Baza masiva de intrebari grila si raspunsuri detaliate despre kernel, systemd, permisiuni, swap memory si comenzi bash.',
        isTopPick: false
      },
      {
        title: 'Cloud DevOps Learning Resources & Cert Prep',
        platform: 'GitHub',
        url: 'https://github.com/cloudcommunity/Cloud-DevOps-Learning-Resources',
        type: 'GHIDURI CERTIFICARI',
        description: 'Banci de intrebari si materiale de pregatire pentru certificarile cerute de angajatori: AWS Solutions Architect si CKA.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'AI_DATA_SCIENCE',
    title: 'AI, Machine Learning & Data Science',
    shortTitle: 'AI & Data Science',
    badge: 'Modele Inteligente & LLMs',
    iconKey: 'Sparkles',
    tagLine: 'Python, PyTorch, modele predictive, procesare de limbaj natural (NLP), LLMs, RAG si analiza statistica a datelor.',
    marketDemand: 'Domeniul cu cea mai exploziva crestere pe proiecte de inovatie si RAG',

    freeLearnResources: [
      {
        title: 'Fast.ai - Practical Deep Learning for Coders',
        platform: 'Fast.ai',
        url: 'https://course.fast.ai/',
        type: 'CURS DEEP LEARNING PRACTIC',
        description: 'Cel mai apreciat curs gratuit din lume pentru deep learning pragmatic: modele de computer vision, NLP si PyTorch.',
        isTopPick: true
      },
      {
        title: 'Kaggle Learn - Micro-cursuri Gratuite cu Practica',
        platform: 'Kaggle',
        url: 'https://www.kaggle.com/learn',
        type: 'CURSURI INTERACTIVE',
        description: 'Module practice scurte direct in Jupyter Notebook: Python, Pandas, Machine Learning, Feature Engineering si Data Viz.',
        isTopPick: true
      },
      {
        title: 'DeepLearning.AI Short Courses (Andrew Ng)',
        platform: 'DeepLearning.AI',
        url: 'https://www.deeplearning.ai/short-courses/',
        type: 'CURSURI GENERATIVE AI',
        description: 'Cursuri scurte si la obiect despre LLMs, Prompt Engineering, LangChain, sisteme RAG si vector databases.',
        isTopPick: true
      },
      {
        title: 'Hugging Face NLP & Transformers Course',
        platform: 'Hugging Face',
        url: 'https://huggingface.co/learn/nlp-course',
        type: 'CURS OFICIAL NLP',
        description: 'Ghid practic hands-on pentru utilizarea modelelor open-source Transformers, tokenizatoare, fine-tuning si deployment.',
        isTopPick: false
      },
      {
        title: 'Stanford CS229: Machine Learning Course',
        platform: 'Stanford University (YouTube)',
        url: 'https://cs229.stanford.edu/',
        type: 'CURS UNIVERSITAR TEORETIC',
        description: 'Prelegerile fundamentale de Machine Learning de la Universitatea Stanford: regresie, clasificare, SVM si teorie de invatare.',
        isTopPick: false
      },
      {
        title: 'Roadmap.sh AI and Data Scientist',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/ai-data-scientist',
        type: 'ROADMAP VIZUAL',
        description: 'Ghid interactiv al pasilor necesari de la matematica (algebra liniara, statistici) la modele generative avansate.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: alexeygrigorev/data-science-interview-questions',
        platform: 'GitHub',
        url: 'https://github.com/alexeygrigorev/data-science-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Peste 200 de intrebari reale de interviu cu raspunsuri: Machine Learning clasic, Deep Learning, SQL, statistici si programare Python.',
        isTopPick: true
      },
      {
        title: 'Chip Huyen - Machine Learning Interviews Book',
        platform: 'HuyenChip.com',
        url: 'https://huyenchip.com/ml-interviews-book/',
        type: 'CARTE DESCHISA INTERVIURI',
        description: 'Ghid de referinta scris de o experta din Silicon Valley: etapele interviului, intrebari de system design ML si greseli frecvente.',
        isTopPick: true
      },
      {
        title: 'GitHub: khangich/machine-learning-interview (300+ Q&A)',
        platform: 'GitHub (13k+ stars)',
        url: 'https://github.com/khangich/machine-learning-interview',
        type: 'COMPENDIU MATEMATICA & ML',
        description: 'Peste 300 de intrebari tehnice cu demonstratii matematice si raspunsuri detaliate despre loss functions, overfitting si optimizatori.',
        isTopPick: true
      },
      {
        title: 'StrataScratch - Probleme Reale de Interviu SQL & Python',
        platform: 'StrataScratch',
        url: 'https://www.stratascratch.com/',
        type: 'CODING PENTRU DATE',
        description: 'Exercitii reale de SQL si Python (Pandas) selectate direct din interviurile tehnice de la companii mari de tehnologie.',
        isTopPick: false
      },
      {
        title: 'GitHub: shervinea/mit-data-science-cheatsheets',
        platform: 'GitHub',
        url: 'https://github.com/shervinea/mit-15-003-data-science-cheatsheets',
        type: 'CHEAT SHEETS RECAPITULARE',
        description: 'Sinteze vizuale create la MIT pentru recapitulare rapida: Supervised Learning, Unsupervised, Deep Learning si probabilitati.',
        isTopPick: false
      },
      {
        title: 'Towards Data Science - ML Interview Series',
        platform: 'Towards Data Science',
        url: 'https://towardsdatascience.com/',
        type: 'STUDII DE CAZ & INTREBARI',
        description: 'Articole aprofundate despre metrici de evaluare (Precision, Recall, ROC-AUC), bias-variance tradeoff si intrebari de arhitectura RAG.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'DATA_ENGINEERING',
    title: 'Data Engineering',
    shortTitle: 'Data Engineering',
    badge: 'Pipeline-uri & Big Data',
    iconKey: 'Database',
    tagLine: 'Arhitectura conductelor de date (ETL/ELT), procesare distribuita cu Spark, Data Warehouses (Snowflake, BigQuery) si orchestrari Airflow.',
    marketDemand: 'Cerere mare in companiile enterprise pentru organizarea datelor analitice',

    freeLearnResources: [
      {
        title: 'Data Engineering Zoomcamp (DataTalks.Club)',
        platform: 'DataTalks.Club (GitHub)',
        url: 'https://github.com/DataTalksClub/data-engineering-zoomcamp',
        type: 'CURS COMPLET OPEN-SOURCE',
        description: 'Cel mai popular curs gratuit de Data Engineering din lume: Docker, Postgres, GCP/BigQuery, dbt, Spark, Kafka si Airflow.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Data Engineer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/data-engineering',
        type: 'ROADMAP VIZUAL',
        description: 'Traseul vizual complet pentru intelegerea stocarii distribuite, data lakes, streaming si modelare dimensionala.',
        isTopPick: true
      },
      {
        title: 'SQLZoo - Exercitii Interactive SQL',
        platform: 'SQLZoo',
        url: 'https://sqlzoo.net/',
        type: 'PRACTICA SQL INTERACTIVA',
        description: 'Invata interactiv SQL avansat: functii analitice (Window Functions), CTEs, agregari complexe si interogari recursive.',
        isTopPick: true
      },
      {
        title: 'Apache Spark Official Quick Start & Guides',
        platform: 'Apache Spark Docs',
        url: 'https://spark.apache.org/docs/latest/quick-start.html',
        type: 'DOCUMENTATIE OFICIALA',
        description: 'Ghidul oficial pentru procesarea distribuita a datelor cu DataFrames, Spark SQL si optimizari Catalyst.',
        isTopPick: false
      },
      {
        title: 'dbt Learn (Free On-Demand Courses)',
        platform: 'dbt Labs',
        url: 'https://courses.getdbt.com/',
        type: 'CURSURI DATA MODELING',
        description: 'Cursuri oficiale gratuite pentru transformarea datelor in data warehouse si crearea de modele analitice documentate.',
        isTopPick: false
      },
      {
        title: 'Google Cloud BigQuery Free Sandbox',
        platform: 'Google Cloud',
        url: 'https://cloud.google.com/bigquery/docs/sandbox',
        type: 'LABORATOR CLOUD PRACTIC',
        description: 'Mediu sandbox gratuit in Google Cloud pentru a exersa interogari analitice pe tabele gigantice fara card de credit.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: DataTalksClub/data-engineering-interview-questions',
        platform: 'GitHub',
        url: 'https://github.com/DataTalksClub/data-engineering-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Intrebari si raspunsuri frecvente despre pipeline-uri ETL, partitionare date, Kafka, orchestration (Airflow) si data warehousing.',
        isTopPick: true
      },
      {
        title: 'The Data Engineering Cookbook (Andreas Kretz)',
        platform: 'GitHub (17k+ stars)',
        url: 'https://github.com/andkret/Cookbook',
        type: 'GHID & INTREBARI PRACTICE',
        description: 'Cartea de referinta gratuita a inginerilor de date cu sfaturi pentru interviuri si proiectarea arhitecturilor de date.',
        isTopPick: true
      },
      {
        title: 'GitHub: josephmachado/data_engineering_interview_questions',
        platform: 'GitHub',
        url: 'https://github.com/josephmachado/data_engineering_interview_questions',
        type: 'DESIGN DE PIPELINE',
        description: 'Intrebari aprofundate despre batch vs streaming, idempotenta, deduplicare de date si monitorizarea joburilor.',
        isTopPick: true
      },
      {
        title: 'LeetCode Database Problem Set (Medium/Hard SQL)',
        platform: 'LeetCode',
        url: 'https://leetcode.com/problemset/database/',
        type: 'LIVE CODING SQL AVANSAT',
        description: 'Probleme clasice de SQL cerute la interviuri tehnice: Window Functions (ROW_NUMBER, DENSE_RANK), self-joins si pivotari.',
        isTopPick: false
      },
      {
        title: 'Start Data Engineering - Ghiduri de Interviu',
        platform: 'StartDataEngineering',
        url: 'https://www.startdataengineering.com/',
        type: 'SCENARII ARHITECTURA DATE',
        description: 'Articole detaliate despre cum sa abordezi interviurile de proiectare a unui pipeline de date si scheme dimensionale (Star Schema).',
        isTopPick: false
      },
      {
        title: 'Mode Analytics SQL Tutorial & Case Studies',
        platform: 'Mode Analytics',
        url: 'https://mode.com/sql-tutorial/',
        type: 'STUDII DE CAZ SQL',
        description: 'Ghiduri practice pentru analiza datelor la scara si optimizarea performantei query-urilor analitice.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'CYBERSECURITY',
    title: 'Cybersecurity & Pentesting',
    shortTitle: 'Cybersecurity',
    badge: 'Securitate & Hacking Etic',
    iconKey: 'ShieldCheck',
    tagLine: 'Securitate web si OWASP Top 10, retelistica, testare de penetrare, operatiuni SOC, analiza de vulnerabilitati si incident response.',
    marketDemand: 'Cerere critica de specialisti in securitate datorita normelor NIS2 si GDPR',

    freeLearnResources: [
      {
        title: 'PortSwigger Web Security Academy',
        platform: 'PortSwigger',
        url: 'https://portswigger.net/web-security',
        type: 'LABORATOARE PRACTICE WEB',
        description: 'Platforma gratuita #1 in lume pentru invatat securitate web: laboratoare practice pentru SQL Injection, XSS, CSRF, SSRF si Burp Suite.',
        isTopPick: true
      },
      {
        title: 'TryHackMe (Free Rooms & Fundamentals)',
        platform: 'TryHackMe',
        url: 'https://tryhackme.com/',
        type: 'LABORATOARE INTERACTIVE',
        description: 'Camere practice ghidate pentru invatarea hackingului etic, protocoalelor de retea si comenzilor Linux pentru incepatori.',
        isTopPick: true
      },
      {
        title: 'OverTheWire Wargames (Bandit)',
        platform: 'OverTheWire',
        url: 'https://overthewire.org/wargames/',
        type: 'JOCURI PRACTICE LINUX & EXPLOIT',
        description: 'Jocuri captivante in terminal pentru stapanirea liniei de comanda Linux, permisiunilor de fisiere si securitatii de baza.',
        isTopPick: true
      },
      {
        title: 'Roadmap.sh Cyber Security',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/cyber-security',
        type: 'ROADMAP VIZUAL',
        description: 'Ghid interactiv complet al traseului de la fundamente de retele la directiile Red Team (ofensiv) sau Blue Team (defensiv).',
        isTopPick: false
      },
      {
        title: 'Cybrary Free Courses (CompTIA Security+ & SOC)',
        platform: 'Cybrary',
        url: 'https://www.cybrary.it/',
        type: 'CURSURI VIDEO CERTIFICARI',
        description: 'Cursuri fundamentale pentru certificari de securitate si notiuni cheie pentru analisti de securitate SOC.',
        isTopPick: false
      },
      {
        title: 'OWASP Top 10 Official Documentation',
        platform: 'OWASP Project',
        url: 'https://owasp.org/www-project-top-ten/',
        type: 'STANDARD VULNERABILITATI',
        description: 'Clasificarea oficiala a celor mai critice 10 riscuri de securitate pentru aplicatii web cu metode de prevenire si remediere.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: fabionoth/cybersecurity-interview-questions (200+ Q&A)',
        platform: 'GitHub',
        url: 'https://github.com/fabionoth/cybersecurity-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Peste 200 de intrebari tehnice cu raspunsuri: OWASP Top 10, modelul OSI, protocoale TLS, criptografie simetrica vs asimetrica si analize de log-uri.',
        isTopPick: true
      },
      {
        title: 'GitHub: DanielMiessler/SecLists',
        platform: 'GitHub (55k+ stars)',
        url: 'https://github.com/danielmiessler/SecLists',
        type: 'RESURSE & CHEAT SHEETS',
        description: 'Colectia de referinta a profesionistilor de securitate pentru fuzzing, payload-uri, teste de vulnerabilitati si audit.',
        isTopPick: true
      },
      {
        title: 'HackTheBox Academy & Free Challenges',
        platform: 'HackTheBox',
        url: 'https://www.hackthebox.com/',
        type: 'LABS EXPLOATARE & CTF',
        description: 'Laboratoare practice pentru simularea scenariilor reale din testele tehnice de recrutare pentru pentesting si securitate defensiva.',
        isTopPick: true
      },
      {
        title: 'StationX - Top Cyber Security Interview Questions',
        platform: 'StationX',
        url: 'https://www.stationx.net/cyber-security-interview-questions/',
        type: 'INTREBARI REALE COMPANII',
        description: 'Intrebari standard puse de recruiteri si team lead-uri pentru pozitii de Junior SOC Analyst, Pentester si Security Engineer.',
        isTopPick: false
      },
      {
        title: 'GitHub: gr3at/CyberSecurity-Interview-Questions (SOC & Blue Team)',
        platform: 'GitHub',
        url: 'https://github.com/gr3at/CyberSecurity-Interview-Questions',
        type: 'INTREBARI SOC & DEFENSIV',
        description: 'Intrebari tehnice axate pe instrumente SIEM, ciclul de viata al raspunsului la incidente (Incident Response) si analiza alertelor.',
        isTopPick: false
      },
      {
        title: 'SANS Cyber Aces Online Tutorials',
        platform: 'SANS Institute',
        url: 'https://www.sans.org/cyberaces/',
        type: 'FUNDAMENTE TEHNICE',
        description: 'Materiale de studiu de la cel mai prestigios institut de securitate cibernetica din lume: sisteme de operare, retele si securitate.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'EMBEDDED_SYSTEMS',
    title: 'Embedded Systems & IoT',
    shortTitle: 'Embedded Systems',
    badge: 'Hardware & Sisteme Reale',
    iconKey: 'Cpu',
    tagLine: 'Programare C/C++, microcontrollere (ARM Cortex, STM32, ESP32), sisteme de operare in timp real (FreeRTOS) si protocoale hardware.',
    marketDemand: 'Prezenta solida a companiilor de automotive, IoT si industrie electronica in Romania',

    freeLearnResources: [
      {
        title: 'LearnCpp.com - Tutorial Complet C++',
        platform: 'LearnCpp.com',
        url: 'https://www.learncpp.com/',
        type: 'GHID COMPLET C++',
        description: 'Cel mai apreciat tutorial gratuit de C++ din lume: de la pointeri si gestiunea memoriei la standardele moderne C++17/C++20.',
        isTopPick: true
      },
      {
        title: 'Quantum Leaps Modern Embedded Programming Course',
        platform: 'Quantum Leaps (YouTube)',
        url: 'https://www.state-machine.com/quickstart',
        type: 'CURS VIDEO PRACTIC',
        description: 'Cursul legendar creat de Miro Samek pentru programare embedded pe ARM Cortex-M: registre, stiva si state machines.',
        isTopPick: true
      },
      {
        title: 'FreeRTOS Official Documentation & Free Book',
        platform: 'FreeRTOS.org',
        url: 'https://www.freertos.org/Documentation/RTOS_book.html',
        type: 'CARTE & DOCUMENTATIE OFICIALA',
        description: 'Cartea oficiala gratuita pentru invatat sisteme de operare in timp real: taskuri, cozi de mesaje, semafoare si mutexuri.',
        isTopPick: true
      },
      {
        title: 'Wokwi Arduino & ESP32 Browser Simulator',
        platform: 'Wokwi.com',
        url: 'https://wokwi.com/',
        type: 'SIMULATOR HARDWARE VIRTUAL',
        description: 'Scrie si ruleaza cod C/C++ pe microcontrollere simulate direct in browser cu senzori si afisaje, fara sa cumperi placute fizice.',
        isTopPick: false
      },
      {
        title: 'Fastbit Embedded Brain Academy (Free Lessons)',
        platform: 'Fastbit (YouTube)',
        url: 'https://www.youtube.com/@FastbitEmbeddedBrainAcademy',
        type: 'TUTORIALE DRIVERE & HARDWARE',
        description: 'Lectii practice de inalta calitate despre scrierea de drivere periferice pe bare-metal: GPIO, UART, SPI si I2C.',
        isTopPick: false
      },
      {
        title: 'Roadmap.sh C++ Developer',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/cpp',
        type: 'ROADMAP VIZUAL',
        description: 'Ghid vizual pas cu pas pentru limbajul C++: compilatoare, optimizari de memorie si programare de sistem.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: payne911/PieInTheSky (Embedded Interview Prep)',
        platform: 'GitHub',
        url: 'https://github.com/payne911/PieInTheSky',
        type: 'GHID INTERVIU EMBEDDED',
        description: 'Ghid detaliat de pregatire pentru interviuri: limbajul C aplicat in embedded, pointeri la functii, structuri de date, intreruperi si protocoale.',
        isTopPick: true
      },
      {
        title: 'Embedded Artistry - Embedded C Interview Questions',
        platform: 'Embedded Artistry',
        url: 'https://embeddedartistry.com/blog/2017/04/10/embedded-c-interview-questions/',
        type: 'BANCA INTREBARI PRACTICE',
        description: 'Intrebari clasice de test: utilizarea cuvantului cheie volatile, memory mapped I/O, bit-masking si manipularea registrilor.',
        isTopPick: true
      },
      {
        title: 'GitHub: caleb-s/embedded-interview-questions',
        platform: 'GitHub',
        url: 'https://github.com/caleb-s/embedded-interview-questions',
        type: 'INTREBARI HARDWARE & RTOS',
        description: 'Baza de intrebari despre prioritati de intreruperi (ISR), mutex vs semafor in RTOS, protocoale UART/SPI/I2C/CAN si ceasuri de sistem.',
        isTopPick: true
      },
      {
        title: 'GeeksforGeeks - Embedded C Interview Questions',
        platform: 'GeeksforGeeks',
        url: 'https://www.geeksforgeeks.org/embedded-c-interview-questions/',
        type: 'TEORIE & CAPCANE C',
        description: 'Intrebari frecvente si explicatii despre alinierea structurilor (padding), endianness si memory leaks pe microcontrollere.',
        isTopPick: false
      },
      {
        title: 'LeetCode Bit Manipulation Problem Tag',
        platform: 'LeetCode',
        url: 'https://leetcode.com/tag/bit-manipulation/',
        type: 'LIVE CODING OPERATII PE BITI',
        description: 'Probleme specifice de manipulare pe biti si operatii la nivel de registru date des la probele de coding pentru automotive.',
        isTopPick: false
      },
      {
        title: 'Interrupt by Memfault - Embedded Debugging Guides',
        platform: 'Memfault Interrupt',
        url: 'https://interrupt.memfault.com/',
        type: 'ARTICOLE DE ADANCIME',
        description: 'Analize excelente despre depanarea de firmware, tratarea exceptiilor HardFault si optimizarea consumului de memorie.',
        isTopPick: false
      }
    ]
  },

  {
    id: 'MOBILE_DEV',
    title: 'Mobile Development (iOS & Android)',
    shortTitle: 'Mobile Dev',
    badge: 'Aplicatii Native & Multiplatforma',
    iconKey: 'Smartphone',
    tagLine: 'Dezvoltare aplicatii mobile cu Flutter, React Native, Kotlin sau Swift, arhitecturi mobile si optimizare performanta pe dispozitiv.',
    marketDemand: 'Cerere continua de aplicatii mobile pentru fintech, livrari si e-commerce',

    freeLearnResources: [
      {
        title: 'Flutter Official Documentation & Codelabs',
        platform: 'Google Flutter',
        url: 'https://docs.flutter.dev/get-started/codelab',
        type: 'TUTORIALE OFICIALE GOOGLE',
        description: 'Tutoriale interactive pas cu pas de la Google pentru dezvoltarea de aplicatii multiplatforma cu Dart si Flutter.',
        isTopPick: true
      },
      {
        title: 'Android Developers Official Courses (Kotlin Basics)',
        platform: 'Google Android Developers',
        url: 'https://developer.android.com/courses',
        type: 'CURSURI OFICIALE CERTIFICATE',
        description: 'Cursuri oficiale gratuite oferite de Google cu exercitii practice in Android Studio folosind Jetpack Compose si Kotlin.',
        isTopPick: true
      },
      {
        title: '100 Days of SwiftUI (Paul Hudson)',
        platform: 'Hacking with Swift',
        url: 'https://www.hackingwithswift.com/100/swiftui',
        type: 'CURS COMPLET IOS',
        description: 'Cel mai bun curs gratuit pentru dezvoltare pe iOS: 100 de zile de lectii clare, proiecte practice si teste cu Swift si SwiftUI.',
        isTopPick: true
      },
      {
        title: 'React Native Official Getting Started Guides',
        platform: 'React Native Docs',
        url: 'https://reactnative.dev/docs/getting-started',
        type: 'DOCUMENTATIE & EXEMPLE',
        description: 'Ghidul oficial pentru construirea de aplicatii native folosind React si JavaScript/TypeScript.',
        isTopPick: false
      },
      {
        title: 'Roadmap.sh Flutter & Android Development',
        platform: 'Roadmap.sh',
        url: 'https://roadmap.sh/flutter',
        type: 'ROADMAP VIZUAL',
        description: 'Harti vizuale interactive pentru arhitectura aplicatiilor mobile, state management si stocare locala.',
        isTopPick: false
      },
      {
        title: 'Ray Wenderlich (Kodeco) Free Tutorials',
        platform: 'Kodeco.com',
        url: 'https://www.kodeco.com/',
        type: 'TUTORIALE MOBILE PRACTICE',
        description: 'Tutoriale excelente pentru dezvoltatori de iOS si Android: layout-uri reactive, retele si persistenta datelor.',
        isTopPick: false
      }
    ],

    interviewPrepResources: [
      {
        title: 'GitHub: MindorksOpenSource/android-interview-questions (250+ Q&A)',
        platform: 'GitHub (13k+ stars)',
        url: 'https://github.com/MindorksOpenSource/android-interview-questions',
        type: 'BANCA INTREBARI & RASPUNSURI',
        description: 'Peste 250 de intrebari si raspunsuri despre ciclul de viata Activity/Fragment, Kotlin Coroutines, Jetpack Compose, MVVM si Dagger/Hilt.',
        isTopPick: true
      },
      {
        title: 'GitHub: whattheflutter/flutter-interview-questions',
        platform: 'GitHub',
        url: 'https://github.com/whattheflutter/flutter-interview-questions',
        type: 'INTREBARI FLUTTER & DART',
        description: 'Intrebari aprofundate despre Flutter: StatefulWidget vs StatelessWidget, State Management (Bloc/Riverpod), Isolates si optimizari la 60 FPS.',
        isTopPick: true
      },
      {
        title: 'GitHub: iOS-Interview-Questions/iOS-Interview-Questions',
        platform: 'GitHub',
        url: 'https://github.com/iOS-Interview-Questions/iOS-Interview-Questions',
        type: 'INTREBARI SWIFT & IOS',
        description: 'Peste 150 de intrebari despre Swift (ARC, Retain Cycles, Protocols, Concurrency) si arhitecturi (MVC, MVVM, VIPER).',
        isTopPick: true
      },
      {
        title: 'InterviewBit - Mobile App Developer Interview Questions',
        platform: 'InterviewBit',
        url: 'https://www.interviewbit.com/mobile-developer-interview-questions/',
        type: 'TESTE TEHNICE PRACTICE',
        description: 'Intrebari de arhitectura despre stocare offline (Room/SQLite), consum de baterie, background services si push notifications.',
        isTopPick: false
      },
      {
        title: 'Kodeco (Ray Wenderlich) Mobile Interview Preparation Guides',
        platform: 'Kodeco',
        url: 'https://www.kodeco.com/',
        type: 'GHIDURI TAKE-HOME PROJECT',
        description: 'Sfaturi practice despre cum sa structurezi proiectul tehnic (take-home assignment) dat de companii pentru roluri de mobile dev.',
        isTopPick: false
      },
      {
        title: 'LeetCode Mobile Top Interview Patterns',
        platform: 'LeetCode',
        url: 'https://leetcode.com/explore/',
        type: 'LIVE CODING & ALGORITMI',
        description: 'Probleme clasice de algoritmi si structuri de date pentru trecerea probei de selectie la companii mari.',
        isTopPick: false
      }
    ]
  }
];
