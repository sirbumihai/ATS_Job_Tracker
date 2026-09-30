// Comprehensive Guide & Question Bank for Non-Technical (HR & Screening) Interviews
// Aligned with Romanian & International Tech Recruitment Standards
// STRICT ZERO DIACRITICS POLICY

export const HR_INTERVIEW_DATA = {
  title: 'Ghid Complet: Cum Treci Interviul HR & Screening (Non-Tehnic)',
  subtitle: 'Prima runda de 20-30 de minute cu recruiterul: depasirea filtrelor comportamentale, prezentarea personala si negocierea',

  // 1. TYPICAL 30-MIN CALL STRUCTURE
  interviewPhases: [
    {
      time: '0 - 3 min',
      title: 'Small Talk & Setarea Tonului',
      focus: 'Recruiterul stabileste o atmosfera relaxata si verifica daca ai conditii bune de apel (sunet, conexiune).',
      proTip: 'Zambeste, fii entuziasmat si raspunde scurt si pozitiv. O atitudine deschisa din prima secunda reduce anxietatea ambelor parti.'
    },
    {
      time: '3 - 8 min',
      title: 'Pitch-ul Personal: "Tell Me About Yourself"',
      focus: 'Prezentarea ta profesionala concentrata in 60-90 de secunde: de la pasiune la proiectele pe care le construiesti.',
      proTip: 'Nu citi CV-ul cronologic de la liceu! Aplica formula Trecut -> Prezent -> Viitor concentrata pe tech.'
    },
    {
      time: '8 - 18 min',
      title: 'Intrebari Comportamentale & Motivatie (STAR)',
      focus: 'Cum colaborezi, cum reactionezi la blocaje, de ce vrei sa lucrezi in aceasta echipa si ce te motiveaza.',
      proTip: 'Foloseste metoda STAR (Situatie, Sarcina, Actiune, Rezultat). Evita raspunsurile teoretice; da exemple concrete din proiecte reale.'
    },
    {
      time: '18 - 23 min',
      title: 'Verificarea Limbii Engleze (The English Check)',
      focus: 'Recruiterul comuta discutia in engleza pentru a evalua fluenta, vocabularul de baza si usurinta in exprimare.',
      proTip: 'Nu te speria de mici greseli gramaticale! Se puncteaza comunicarea cursiva si capacitatea de a sustine o conversatie profesionala.'
    },
    {
      time: '23 - 27 min',
      title: 'Logistica, Disponibilitate & Asteptari Salariale',
      focus: 'Cand poti incepe (preaviz / disponibilitate imediata), regimul de lucru (remote vs hibrid) si incadrarea salariala.',
      proTip: 'Pentru salariu, ofera un interval flexibil bazat pe piata si subliniaza ca oportunitatea de invatare este prioritatea ta numarul 1.'
    },
    {
      time: '27 - 30 min',
      title: 'Intrebarile Tale pentru Recruiter',
      focus: 'Oportunitatea ta de a evalua echipa si de a arata ca ai facut un research real inainte de apel.',
      proTip: 'Pune cel putin 2 intrebari inteligente despre procesul de onboarding, structura echipei sau ce defineste succesul in primele 3 luni.'
    }
  ],

  // 2. THE 90-SECOND PERSONAL PITCH FORMULA
  pitchFormula: {
    title: 'Formula de Aur: Pitch-ul Personal in 90 de Secunde',
    subtitle: 'Raspunsul perfect la intrebarea "Povesteste-mi pe scurt despre tine"',
    steps: [
      {
        step: '1. Cine esti in prezent (30 sec)',
        description: 'Sunt un programator pasionat de backend si arhitecturi web, specializat pe Java 21, Spring Boot si baze de date relationale.'
      },
      {
        step: '2. Ce ai construit / Cum ai invatat (40 sec)',
        description: 'In ultimul an am construit aplicatii complete de la zero, inclusiv un sistem modular de procesare si urmarire a joburilor cu Docker, REST API si persistenta PostgreSQL, testat automat.'
      },
      {
        step: '3. De ce esti aici / Ce cauti in viitor (20 sec)',
        description: 'Imi doresc sa fac parte dintr-o echipa solida unde sa aplic bunele practici de cod curat, sa invat de la ingineri seniori si sa aduc valoare imediata pe proiectele companiei voastre.'
      }
    ],
    sampleScript: 'Sunt un dezvoltator junior pasionat de zona de backend si arhitectura software, lucrand intens in Java 21 si Spring Boot. In ultimul an m-am concentrat pe construirea unor proiecte practice reale, nu simple tutoriale — cel mai recent fiind o platforma modulara containerizata cu Docker si PostgreSQL, unde am implementat caching Redis si teste automate JUnit. Urmaresc de ceva timp proiectele companiei voastre si am aplicat pentru ca echipa voastra pune accent pe calitate tehnica si dezvoltare continua, exact mediul in care pot aduce entuziasm, curiozitate si executie rapida.'
  },

  // 3. THE STAR METHOD
  starMethod: {
    title: 'Metoda STAR: Cum Structurati Orice Poveste Comportamentala',
    description: 'Recruiterii IT folosesc intrebari bazate pe competente pentru a prezice performanta viitoare pe baza comportamentului din trecut.',
    components: [
      {
        letter: 'S',
        name: 'Situation (Situatia)',
        explanation: 'Stabileste contextul pe scurt (proiect de facultate, proiect personal, hackathon sau echipa anterioara).'
      },
      {
        letter: 'T',
        name: 'Task (Sarcina)',
        explanation: 'Care a fost provocarea sau obiectivul clar pe care trebuia sa il rezolvi.'
      },
      {
        letter: 'A',
        name: 'Action (Actiunea TA)',
        explanation: 'Fii specific! Nu spune "am facut noi", spune exact ce cercetare, arhitectura, cod sau comunicare ai initiat tu.'
      },
      {
        letter: 'R',
        name: 'Result (Rezultatul)',
        explanation: 'Finalul povestii: ce s-a livrat, ce cifre sau imbunatatiri au aparut si, cel mai important, ce ai invatat din experienta.'
      }
    ],
    example: {
      question: 'Povesteste-mi despre un moment cand ai intampinat un blocaj tehnic major si cum l-ai depasit.',
      answer: 'SITUATIE: In timp ce dezvoltam modulul de cautare pentru un tracker de joburi, interogarile pe baza de date devenisera foarte lente odata ce am depasit cateva mii de inregistrari. SARCINA: Trebuia sa reduc timpul de raspuns sub 200ms fara sa rescriu intreaga structura a aplicatiei. ACTIUNE: Am analizat planul de executie (EXPLAIN ANALYZE in PostgreSQL), am identificat lipsa unor indecsi compusi si am configurat o tabela indexata B-Tree pe campurile de filtrare frecvente, adaugand si un layer de caching Redis pe cele mai populare cautari. REZULTAT: Timpul mediu de raspuns a scazut cu 75%, de la 850ms la sub 120ms, iar din aceasta experienta am invatat importanta intelegerii profunde a bazelor de date inainte de optimizari premature in cod.'
    }
  },

  // 4. TOP 10 HR SCREENING QUESTIONS & ANSWERS
  topQuestions: [
    {
      q: 'De ce ai aplicat la compania noastra si ce stii despre noi?',
      category: 'Motivatie & Research',
      intent: 'Verifica daca aplici in masa cu "1-click apply" sau daca ai facut un minim de cercetare despre produsele, clientii si cultura lor.',
      goodAnswer: 'Am vazut ca dezvoltati solutii enterprise scalabile si ca folositi tehnologii moderne. M-a atras in mod deosebit accentul pe care il puneti pe mentorat pentru juniori si proiectele voastre din domeniul fintech/cloud. Consider ca directia voastra tehnologica se potriveste excelent cu directia in care ma dezvolt.',
      redFlag: '"Am aplicat la multe anunturi pe LinkedIn si ati fost printre cei care au raspuns" sau "Am auzit ca salariile sunt mari aici".'
    },
    {
      q: 'Nu ai experienta profesionala anterioara in IT. De ce te-am alege pe tine in locul altor candidati?',
      category: 'Diferentiere & Competenta',
      intent: 'Evalueaza increderea in sine, maturitatea si cat de bine iti poti argumenta abilitatile dincolo de diploma.',
      goodAnswer: 'Chiar daca nu am un istoric intr-o companie de corporatie, compensez prin proiecte practice reale pe care le-am scris singur de la zero, cod testat automat, documentat pe GitHub si containerizat cu Docker. Am o curba de invatare foarte rapida, disciplina zilnica si sunt gata sa aduc energie si productivitate din prima saptamana.',
      redFlag: '"Nu stiu, sper sa imi dati o sansa sa vad daca ma descurc" sau "Toti cer experienta, cum pot avea experienta daca nu ma angajeaza nimeni?".'
    },
    {
      q: 'Cum gestionezi o situatie de neintelegere sau opinie diferita cu un coleg de echipa?',
      category: 'Lucru in Echipa & Soft Skills',
      intent: 'Verifica daca ai inteligenta emotionala, daca poti asculta opinii diferite sau daca iei criticile personal.',
      goodAnswer: 'Inainte de orice, separ argumentele tehnice de persoana colegului. Ascult punctul lui de vedere, analizam impreuna avantajele si dezavantajele pe baza cerintelor proiectului (performanta, mentenabilitate, timp de livrare) si incercam sa gasim o solutie bazata pe date concrete, nu pe orgolii.',
      redFlag: '"De obicei am dreptate pentru ca verific inainte" sau "Daca nu e de acord, ii spun managerului sa decida".'
    },
    {
      q: 'Povesteste-mi despre o greseala tehnica sau un esec dintr-un proiect si cum ai reactionat.',
      category: 'Asumare & Rezilienta',
      intent: 'Nimeni nu e perfect. HR-ul vrea sa vada daca iti asumi responsabilitatea sau daca dai vina pe colegi, cerinte sau tehnologie.',
      goodAnswer: 'La un proiect personal am sters din greseala date dintr-o tabela locala pentru ca nu aveam un script clar de seed si backup. Mi-am asumat greseala imediat, am refacut structura si am implementat un script automat de migrare (Flyway) si containerizare izolata pentru a ma asigura ca incidentul nu se poate repeta.',
      redFlag: '"Nu prea am facut greseli pentru ca sunt foarte atent" sau "Echipa mea nu mi-a explicat cerintele corect".'
    },
    {
      q: 'Care sunt punctele tale forte si o arie unde simti ca trebuie sa te mai imbunatatesti?',
      category: 'Autoevaluare & Onestitate',
      intent: 'Testeaza cat de realist esti cu tine insuti. Evita cliseele false de genul "sunt prea perfectionist".',
      goodAnswer: 'Punctul meu forte este perseverenta in rezolvarea problemelor tehnice complexe si capacitatea de a citi documentatii tehnice oficiale rapid. O arie unde lucrez activ este optimizarea solutiilor de cloud si Kubernetes — inteleg Docker foarte bine, dar in prezent parcurg laboratoare practice pentru a intelege scalarea automata a clusterelor.',
      redFlag: '"Punctul slab este ca muncesc prea mult si uit sa dorm" sau "Nu am puncte slabe pe limbajul acesta".'
    },
    {
      q: 'Cum reactionezi cand primesti un feedback critic sau negativ la un Code Review?',
      category: 'Cultura de Feedback',
      intent: 'Testeaza capacitatea de a fi antrenat (coachability). Un junior refractar la feedback este un cosmar pentru seniori.',
      goodAnswer: 'Pentru mine, un Code Review riguros este cea mai rapida cale de invatare. Nu iau observatiile ca pe o critica personala; privesc comentariile colegilor ca pe o investitie in calitatea produsului si multumesc mereu pentru sugestiile care ma ajuta sa scriu cod mai curat.',
      redFlag: '"Depinde daca seniorul are dreptate sau daca exagereaza cu detalii nesemnificative".'
    },
    {
      q: 'Ce asteptari salariale ai pentru aceasta pozitie de debut?',
      category: 'Negociere & Pragmatism',
      intent: 'Verifica daca ai asteptari realiste raportate la piata din Romania si daca esti flexibil in functie de pachetul complet.',
      goodAnswer: 'Conform studiilor de piata pentru roluri junior/entry-level din Romania, ma orientez catre un interval cuprins intre 4.500 si 6.500 RON net, insa pentru mine cel mai important factor este echipa, oportunitatea de mentorat si ritmul de crestere profesionala. Sunt deschis la discutii in functie de intreg pachetul de beneficii.',
      redFlag: '"Vreau minim 9.000 RON altfel nu merita sa ma trezesc" sau "Nu conteaza deloc, lucrez si pe gratis".'
    },
    {
      q: 'Unde te vezi peste 2-3 ani din punct de vedere profesional?',
      category: 'Viziune pe Termen Lung',
      intent: 'Verifica daca esti stabil, daca planuiesti sa pleci dupa 3 luni sau daca ai o traiectorie clara de crestere tehnica.',
      goodAnswer: 'Peste 2-3 ani imi doresc sa fiu un dezvoltator autonom pe care echipa se poate baza complet pentru module complexe, cu o intelegere profunda a intregului flux de la arhitectura la deployment si poate mentorand la randul meu noi colegi la inceput de drum.',
      redFlag: '"Vreau sa fiu director / project manager cat mai repede" sau "Nu stiu, nu imi fac planuri".'
    }
  ],

  // 5. ENGLISH FLUENCY CHECK STRATEGY
  englishCheck: {
    title: 'Faza "English Check": Cum Treci cu Succes Conversatia in Engleza',
    description: 'In peste 85% din apelurile de HR din Romania, recruiterul va comuta brusc pe engleza timp de 5-10 minute pentru a verifica daca poti colabora cu echipe internationale.',
    triggerPhrase: '"Can we switch to English for a moment to chat about your hobbies or projects?"',
    goldenRules: [
      {
        title: 'Tranzitie Calm & Sigura',
        tip: 'Raspunde imediat cu entuziasm: "Sure, absolutely! I am very comfortable with that."'
      },
      {
        title: 'Vorbeste Rar si Clar',
        tip: 'Cand esti emotionat, ai tendinta sa vorbesti prea repede. Respira adanc si pastreaza un ritm asezat.'
      },
      {
        title: 'Foloseste Expresii Tehnice Naturale',
        tip: 'Spune "I was responsible for implementing the authentication logic" in loc de constructii greoaie traduse mot-a-mot din romana.'
      },
      {
        title: 'Daca te blochezi, recadreaza simplu',
        tip: 'Spune: "Let me rephrase that..." sau "What I mean is..." fara sa intri in panica.'
      }
    ]
  },

  // 6. SMART REVERSE QUESTIONS TO ASK THE HR
  reverseQuestions: [
    {
      q: 'Cum arata procesul de onboarding si mentorat pentru un nou coleg junior in primele 30-60 de zile?',
      why: 'Arata ca te intereseaza adaptarea eficienta si ca vrei sa stii daca exista seniori alocati sa te ghideze.'
    },
    {
      q: 'Ce calitati sau comportamente definesc persoanele care au cel mai mare succes in echipa voastra?',
      why: 'Iti ofera informatii pretioase despre valorile reale ale companiei (viteza, atentie la detalii, initiativa etc.).'
    },
    {
      q: 'Care sunt urmatorii pasi in procesul de selectie si cand as putea primi un feedback?',
      why: 'Arata profesionalism si iti permite sa stii cand sa trimiti un follow-up politicos.'
    },
    {
      q: 'Cum gestioneaza echipa voastra echilibrul intre livrarea de features noi si rezolvarea de technical debt?',
      why: 'Semnalizeaza ca intelegi realitatile industriei si ca iti pasa de calitatea pe termen lung a codului.'
    }
  ],

  // 7. CURATED FREE RESOURCES FOR BEHAVIORAL INTERVIEWS
  freeHrResources: [
    {
      title: 'Harvard Career Services - Behavioral Interview Guide',
      platform: 'Harvard University',
      url: 'https://careerservices.fas.harvard.edu/resources/behavioral-interviewing/',
      type: 'GHID UNIVERSITAR OFICIAL',
      description: 'Ghidul complet elaborat de Universitatea Harvard pentru stapanirea metodei STAR si structurarea povestilor profesionale.'
    },
    {
      title: 'Tech Interview Handbook - Behavioral Round Guide',
      platform: 'TechInterviewHandbook',
      url: 'https://www.techinterviewhandbook.org/behavioral-interview/',
      type: 'GHID SPECIALIZAT TECH',
      description: 'Cum abordezi intrebarile non-tehnice si de cultura organisationala specifice companiilor software din intreaga lume.'
    },
    {
      title: 'The Muse - 50 Most Common Interview Questions & Answers',
      platform: 'The Muse',
      url: 'https://www.themuse.com/advice/interview-questions-and-answers',
      type: 'BANCA DE INTREBARI HR',
      description: 'Analize detaliate si exemple de raspunsuri recomandate pentru cele mai frecvente intrebari adresate de recruiteri.'
    },
    {
      title: 'Jeff Su (YouTube) - How to Answer "Tell Me About Yourself"',
      platform: 'YouTube (Jeff Su)',
      url: 'https://www.youtube.com/watch?v=0k57_e-bUuI',
      type: 'TUTORIAL VIDEO PRACTIC',
      description: 'Videoclip scurt si extrem de apreciat care explica pas cu pas formula ideala pentru prezentarea personala la interviuri.'
    }
  ]
};
