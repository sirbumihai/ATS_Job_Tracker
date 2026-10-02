// Deck Masiv: DevOps, Docker, Kubernetes, Linux, CI/CD & Automation (Junior & Mid-Level)
// Preluat din: bregman-arie/devops-exercises, NotHarshhaa/DevOps-Interview-Questions, Docker/K8s Official Docs
// 100 de carduri realiste de interviu (Linux, Git, Docker, Docker Compose, CI/CD, GitHub Actions, K8s Core, Observabilitate)
// FARA intrebari de Senior / Arhitect (Zero eBPF custom kernel filters, Zero raw etcd consensus internals)
// Dificultati: USOR si MEDIU (Zero DIFICIL)
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const DEVOPS_DECK = [
  {
    id: "devops-01",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Ce este un Docker Multi-Stage Build si de ce este esential in productie?",
    question: "Ce este un Multi-Stage Dockerfile si cum ajuta la reducerea dimensiunii imaginilor si la cresterea securitatii in containere?",
    answer: "Un Multi-Stage Build foloseste mai multe instructiuni FROM intr-un singur Dockerfile, fiecare etapa reprezentand un mediu temporar izolat.\n\nDe ce este esential:\n1. Dimensiune minima: In primul stage (Build Stage) folosim o imagine completa cu compilatoare (Maven, JDK, Node.js, gcc) pentru a construi aplicatia. In stadiul final de productie (Runtime Stage), copiem DOAR artefactul compilat (app.jar sau dist/) intr-o imagine ultra-usoara (JRE Alpine sau Nginx Alpine).\n2. Securitate sporita: Imaginea finala din productie nu contine codul sursa complet, nici manageri de pachete (npm, maven, git), reducand suprafata de atac la vulnerabilitati CVE.\n3. Exemplu practic: Imaginea scade de la 800MB (JDK complet) la doar 80-120MB (JRE Alpine).",
    codeSnippet: `# Stage 1: Build cu Maven complet
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Runtime ultra-usor JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    interviewTrap: "Daca pui COPY . . inainte de COPY pom.xml si dependency install, Docker va invalida cache-ul la fiecare modificare minora de cod si va descarca toate dependintele din nou!",
    keyTakeaway: "Multi-stage builds separa uneltele de compilare de mediul de rulare, reducand marimea imaginii cu pana la 90% si eliminand pachetele inutile din productie."
  },
  {
    id: "devops-02",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Container Docker vs Masina Virtuala (VM): Diferente Fundamentale",
    question: "Care este diferenta arhitecturala dintre un container Docker si o Masina Virtuala clasica (VM)?",
    answer: "Diferenta esentiala consta in partajarea nucleului sistemului de operare (OS Kernel):\n\n1. Masina Virtuala (VM):\n- Fiecare VM contine un sistem de operare complet propriu (Guest OS) de cativa gigabytes.\n- Ruleaza peste un Hypervisor (Type 1 sau Type 2, ex: ESXi, KVM, VirtualBox) care emuleaza hardware-ul fizic (CPU virtual, RAM virtual, placi de retea).\n- Pornire lenta (minute) si consum masiv de resurse.\n\n2. Container Docker:\n- NU are un sistem de operare propriu; partajeaza direct Kernel-ul gazdei (Host OS Kernel).\n- Este doar un proces izolat pe masina gazda, restrictionat prin facilitati native de Linux: Namespaces (pentru izolarea proceselor, retelei, sistemului de fisiere) si cgroups (pentru limitarea consumului de CPU si memorie RAM).\n- Pornire aproape instantanee (milisecunde) si consum minim de resurse.",
    codeSnippet: `// Comparatie rapida la interviu:
// Masina Virtuala (VM): App -> Bins/Libs -> Guest OS -> Hypervisor -> Hardware
// Container Docker:     App -> Bins/Libs -> Docker Engine -> Host OS Kernel -> Hardware`,
    interviewTrap: "Containerele Docker NU sunt masini virtuale miniaturale! Ele sunt simple procese izolate care folosesc acelasi kernel Linux ca restul sistemului gazda.",
    keyTakeaway: "VM-urile emuleaza hardware-ul si ruleaza un Guest OS complet; containerele partajeaza kernel-ul gazdei si se bazeaza pe Linux Namespaces si cgroups."
  },
  {
    id: "devops-03",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Dockerfile: CMD vs ENTRYPOINT",
    question: "Care este diferenta dintre instructiunile CMD si ENTRYPOINT intr-un Dockerfile si cum pot fi combinate?",
    answer: "Ambele definesc comanda care se executa atunci cand un container este pornit dintr-o imagine:\n\n1. ENTRYPOINT:\n- Defineste comanda fixa, imuabila a containerului (executabilul principal care transforma containerul intr-un utilitar dedicat).\n- Greu de suprascris din exterior (necesita flag-ul explicit --entrypoint).\n\n2. CMD:\n- Ofera argumentele implicite (default parameters) pentru ENTRYPOINT sau o comanda alternativa usor de suprascris la runtime prin simpla trecere a unor argumente in docker run.\n\nCombinatia ideala (Exec Form):\nFolosirea ENTRYPOINT pentru binarul principal si CMD pentru parametrii impliciti ce pot fi usor personalizati de utilizator.",
    codeSnippet: `# Exemplu combinat recomandat:
ENTRYPOINT ["java", "-jar", "app.jar"]
CMD ["--server.port=8080"]

# Daca rulezi simplu:
# docker run my-app
# -> se executa: java -jar app.jar --server.port=8080

# Daca suprascrii portul la lansare:
# docker run my-app --server.port=9090
# -> se executa: java -jar app.jar --server.port=9090`,
    interviewTrap: "Foloseste intotdeauna forma \"Exec form\" cu array de string-uri JSON ([\"bin\", \"arg\"]) in loc de \"Shell form\" (bin arg). Shell form ruleaza procesul intr-un subshell /bin/sh -c, impiedicand transmiterea semnalelor SIGTERM si oprirea gratioasa (graceful shutdown).",
    keyTakeaway: "ENTRYPOINT stabileste executabilul de baza al containerului, iar CMD furnizeaza argumentele default ce pot fi suprascrise direct la rulare."
  },
  {
    id: "devops-04",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Dockerfile: COPY vs ADD",
    question: "Care este diferenta dintre instructiunile COPY si ADD intr-un Dockerfile si de ce este COPY considerat \"best practice\"?",
    answer: "Ambele instructiuni copiaza fisiere sau directoare de pe masina gazda in sistemul de fisiere al imaginii Docker.\n\n1. COPY (Recomandat in 95% din cazuri):\n- Copiaza fisiere sau directoare locale in container.\n- Este transparenta, previzibila si face strict o operatie simpla de copiere.\n\n2. ADD (Functii avansate automate):\n- Poate descarca fisiere direct de la URL-uri externe (ADD https://... /tmp/).\n- Are capabilitatea de auto-extractie: daca fisierul sursa este o arhiva tar recunoscuta (.tar, .tar.gz, .tgz, .bz2), ADD il dezarhiveaza automat in directorul destinatie.\n\nDe ce COPY este best practice:\nDezarhivarea automata sau descarcarea neasteptata din ADD poate introduce fisiere neintentionate in imagine sau poate strica cache-ul de layere. Daca ai nevoie de fisiere de pe net, este mult mai curat sa folosesti curl sau wget intr-un pas RUN.",
    codeSnippet: `# CORECT si curat in 99% din situatii:
COPY package.json ./

# Singurul caz legitim pentru ADD (dezarhivare automata a unui pachet local):
ADD app-bundle.tar.gz /opt/app/`,
    interviewTrap: "ADD nu dezarhiveaza automat arhive descarcate de la un URL (doar arhive locale din build context).",
    keyTakeaway: "Foloseste intotdeauna COPY pentru fisiere si foldere locale; pastreaza ADD strict pentru cazurile unde vrei dezarhivarea automata a unei arhive locale."
  },
  {
    id: "devops-05",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Docker Image Layer Caching: De ce conteaza ordinea instructiunilor?",
    question: "Cum functioneaza sistemul de straturi (Layers) si cache-ul in Docker build si cum organizezi un Dockerfile pentru timpi minimi de compilare?",
    answer: "Fiecare instructiune din Dockerfile (FROM, RUN, COPY, ADD) creeaza un strat (layer) de sistem de fisiere \"read-only\".\n\nCum functioneaza Layer Caching:\n1. Cand rulezi docker build, Docker parcurge instructiunile de sus in jos.\n2. Daca o instructiune si fisierele sale nu s-au schimbat fata de build-ul anterior, Docker foloseste stratul salvat in cache (\"Using cache\").\n3. Daca un strat se schimba (ex: ai modificat o linie de cod Java/JS), acel strat si TOATE STRATURILE URMATOARE isi pierd cache-ul si trebuie reconstruite de la zero!\n\nRegula de aur de optimizare:\nPlaseaza pasii care se schimba RAR (instalare pachete OS, dependinte pom.xml / package.json) la INCEPUTUL Dockerfile-ului, iar pasii care se schimba DES (codul sursa al aplicatiei) la FINAL.",
    codeSnippet: `# GRESIT (Codul strica cache-ul dependintelor la fiecare tasta salvata):
COPY . .
RUN npm install # Se executa de la zero la fiecare modificare de cod!

# CORECT (Optimizat pentru viteza maxima):
COPY package.json package-lock.json ./
RUN npm install # Foloseste CACHE daca nu ai adaugat librarii noi!
COPY . .        # Doar codul sursa se re-copiaza rapid`,
    interviewTrap: "Gruparea comenzilor conexe cu && intr-un singur RUN (ex: apt-get update && apt-get install -y pachet && rm -rf /var/lib/apt/lists/*) reduce numarul de layere si dimensiunea finala a imaginii.",
    keyTakeaway: "Ordoneaza instructiunile de la cele mai stabile la cele mai frecvent modificate pentru a beneficia de Docker cache si a reduce timpul de build de la minute la secunde."
  },
  {
    id: "devops-06",
    category: "DEVOPS",
    difficulty: "USOR",
    title: ".dockerignore: Rolul si fisierele esentiale excluse",
    question: "Ce este fisierul .dockerignore, ce problema rezolva si ce fisiere trebuie sa contina obligatoriu?",
    answer: "Fisierul .dockerignore functioneaza identic cu .gitignore si stabileste ce fisiere si directoare locale NU trebuie trimise catre Docker Daemon in timpul etapei de \"Sending build context\".\n\nDe ce este critic:\n1. Viteza de build: Previne transferul a zeci de mii de fisiere inutile (cum ar fi folderul urias node_modules sau target/) catre daemonul Docker.\n2. Securitate: Previne includerea accidentala in imagine a secretelor locale (fisiere .env, certificate private .pem, istoric .git).\n3. Stabilitatea cache-ului: Previne invalidarea cache-ului Docker de catre fisiere locale nerelevante (logs, fisiere temporare IDE).",
    codeSnippet: `# Exemplu .dockerignore recomandat:
node_modules
target
dist
.git
.github
.env
.env.*
*.log
.DS_Store
.idea
.vscode`,
    interviewTrap: "Daca nu pui node_modules in .dockerignore si ai un RUN npm install in container, Docker va copia mai intai modulele de pe masina ta (compilate pe OS-ul tau local), suprascriindu-le pe cele din container si ducand la erori de incompatibilitate binara!",
    keyTakeaway: ".dockerignore exclude fisierele mari si sensibile din contextul de build, reducand dimensiunea imaginii si securizand aplicatia."
  },
  {
    id: "devops-07",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Securitate Containere: De ce nu rulam ca utilizator \"root\"?",
    question: "De ce este considerata o vulnerabilitate grava rularea proceselor din containere ca \"root\" si cum configurezi un utilizator non-root in Dockerfile?",
    answer: "In mod implicit, procesul din interiorul unui container Docker ruleaza cu UID 0 (root).\n\nRiscul de securitate (Container Escape):\nDaca aplicatia ta are o bresa de securitate (ex: Remote Code Execution prin Log4j sau upload nesecurizat) si un atacator preia controlul containerului:\n- Daca procesul ruleaza ca root in container si exista o vulnerabilitate in kernel sau o montare gresita de volum, atacatorul poate evada pe masina gazda (Host) cu privilegii depline de administrator!\n- Un proces non-root limiteaza drastic pagubele pe care le poate produce un atacator.\n\nSolutia:\nCrearea si activarea unui utilizator si grup dedicat cu privilegii restranse prin directiva USER.",
    codeSnippet: `FROM eclipse-temurin:21-jre-alpine

# Cream un grup si un utilizator non-root dedicat
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app
COPY --chown=appuser:appgroup target/app.jar app.jar

# Comutam pe utilizatorul fara drepturi de root
USER appuser

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    interviewTrap: "Nu uita sa schimbi proprietarul fisierelor cu flag-ul --chown=user:group la COPY, altfel fisierele copiate vor apartine utilizatorului root si s-ar putea ca aplicatia non-root sa nu aiba drepturi de citire sau executie.",
    keyTakeaway: "Rularea containerelor sub un utilizator non-root respecta principiul privilegiilor minime si protejeaza sistemul gazda in cazul unei brese de securitate."
  },
  {
    id: "devops-08",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Reteaua in Docker: Drivere de Retea (bridge, host, none)",
    question: "Care sunt principalele drivere de retea din Docker si cand se foloseste fiecare?",
    answer: "Docker ofera mai multe moduri de izolare a stivei de retea:\n\n1. bridge (Implicit):\n- Creeaza o punte virtuala de retea privata (docker0). Fiecare container primeste o adresa IP interna privata (ex: 172.17.0.X).\n- Containerele aflate pe aceeasi retea bridge custom pot comunica intre ele direct dupa NUMELE containerului (DNS intern automat!).\n- Pentru a fi accesibil din exterior, necesita mapare de porturi (-p 8080:8080).\n\n2. host:\n- Elimina izolarea de retea; containerul partajeaza direct stiva de retea a masinii gazda.\n- Performanta maxima de throughput (fara overhead de Network Address Translation - NAT).\n- Portul 8080 din container este direct portul 8080 al gazdei (nu mai functioneaza maparea -p).\n\n3. none:\n- Dezactiveaza complet interfata de retea a containerului (doar interfata loopback localhost).\n- Ideal pentru sarcini de securitate maxima sau procesari de date izolate de internet.\n\n4. overlay:\n- Permite comunicarea intre containere aflate pe masini gazda fizice diferite (Docker Swarm / Kubernetes).",
    codeSnippet: `# Creare retea bridge dedicata:
docker network create my-network

# Pornire backend si DB pe aceeasi retea:
docker run -d --name postgres-db --network my-network postgres:alpine
# Backend-ul se poate conecta la DB folosind host-ul "postgres-db":
docker run -d --name backend-api --network my-network -p 8080:8080 my-backend`,
    interviewTrap: "Pe reteaua \"default bridge\", rezolutia DNS dupa numele containerului este DEZACTIVATA! Pentru a beneficia de comunicare automata dupa nume, creeaza intotdeauna o retea custom (user-defined bridge) sau foloseste Docker Compose.",
    keyTakeaway: "Reteaua bridge izoleaza traficul si ofera rezolutie DNS dupa nume intre containere; reteaua host ofera performanta maxima fara NAT."
  },
  {
    id: "devops-09",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Persistenta Datelor: Docker Volumes vs Bind Mounts",
    question: "Care este diferenta dintre un Docker Volume si un Bind Mount si ce alegem pentru o baza de date in productie?",
    answer: "In mod implicit, sistemul de fisiere al unui container este efemer: cand containerul este sters, toate datele modificate din el se pierd!\n\n1. Docker Volumes (Recomandat pentru Productie):\n- Directoare gestionate exclusiv de Docker Engine pe masina gazda (de regula in /var/lib/docker/volumes/).\n- Nu depind de structura de foldere a sistemului de operare gazda.\n- Performanta ridicata, backup usor si pot fi partajate in siguranta intre mai multe containere.\n- Alegerea numarul 1 pentru baze de date (PostgreSQL, MySQL, Redis) in productie!\n\n2. Bind Mounts:\n- Leaga un fisier sau folder arbitrar de pe masina gazda (ex: /home/user/project/src) la o cale din container.\n- Ideal in DEZVOLTARE (Development) pentru Hot Reloading: modifici un fisier in IDE pe laptopul tau si se reflecta instant in container fara rebuild.",
    codeSnippet: `# 1. Docker Volume (Productie - DB):
docker volume create pg_data
docker run -d -v pg_data:/var/lib/postgresql/data postgres:alpine

# 2. Bind Mount (Dezvoltare - Live Code Sync):
docker run -d -v $(pwd)/src:/app/src node:alpine`,
    interviewTrap: "Daca montezi un folder gol de pe gazda peste un director existent din container folosind Bind Mount, continutul din container va fi mascat si va parea \"sters\"! Docker Volumes, in schimb, populeaza volumul nou creat cu fisierele existente din container la prima montare.",
    keyTakeaway: "Docker Volumes sunt gestionate nativ de Docker si reprezinta solutia sigura pentru date persistente in productie; Bind Mounts sunt ideale pentru hot-reload in dev."
  },
  {
    id: "devops-10",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Docker Compose: Rolul fisierului si fluxul de lucru esential",
    question: "Ce este Docker Compose si care sunt comenzile esentiale pentru pornirea, oprirea si inspectarea unei aplicatii multi-container?",
    answer: "Docker Compose este un instrument pentru definirea si rularea aplicatiilor multi-container folosind un simplu fisier declarativ YAML (docker-compose.yml).\n\nCe rezolva:\nIn loc sa rulezi manual comenzi lungi de \"docker run\" cu zeci de flag-uri (-p, -v, --network, -e) pentru fiecare container in parte (backend, frontend, postgres, redis), declari toata arhitectura intr-un singur fisier.\n\nComenzi esentiale:\n1. docker compose up -d: Construieste, creeaza reteaua, volumele si porneste toate serviciile in fundal (detached mode).\n2. docker compose down: Opreste si sterge containerele si retelele create.\n3. docker compose down -v: Opreste tot si sterge inclusiv volumele de date!\n4. docker compose logs -f [service]: Urmareste logurile in timp real.\n5. docker compose ps: Afiseaza statusul serviciilor din compozitie.",
    codeSnippet: `services:
  database:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: appdb
      POSTGRES_PASSWORD: secret
    volumes:
      - db_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://database:5432/appdb

volumes:
  db_data:`,
    interviewTrap: "In noile versiuni Docker (Docker CLI v2), sintaxa oficiala este \"docker compose\" (cu spatiu), nu vechiul utilitar Python separat \"docker-compose\" (cu cratima).",
    keyTakeaway: "Docker Compose automatizeaza pornirea si interconectarea mai multor servicii conexe printr-un singur fisier configurabil."
  },
  {
    id: "devops-11",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Docker: \"ports\" vs \"expose\"",
    question: "Care este diferenta intre directiva \"ports\" si directiva \"expose\" in Docker Compose sau Dockerfile?",
    answer: "1. ports (-p 8080:8080 sau -p 5432:5432):\n- Publica portul pe masina gazda (Host Port Forwarding).\n- Deschide portul catre lumea exterioara: oricine are acces la IP-ul masinii gazda poate comunica cu acel port.\n- Exemplu: ports: [\"3000:80\"] face ca aplicatia web sa fie accesibila la http://localhost:3000.\n\n2. expose:\n- Face portul accesibil DOAR pentru alte containere aflate pe aceeasi retea Docker interna, dar NU il deschide catre masina gazda!\n- Actioneaza ca o documentatie si o deschidere strict interna.\n- Excelent pentru baze de date sau microservicii interne care nu au voie sa fie expuse pe internetul public.",
    codeSnippet: `services:
  api:
    build: .
    ports:
      - "8080:8080" # Accesibil din browser la localhost:8080

  postgres:
    image: postgres:alpine
    expose:
      - "5432" # Doar "api" se poate conecta; nimeni din exteriorul Docker nu poate accesa baza!`,
    interviewTrap: "Publicarea bazei de date cu ports: [\"5432:5432\"] pe un server de productie expune portul direct la atacurile botnet-urilor din internet. Foloseste expose pentru servicii interne!",
    keyTakeaway: "ports mapeaza traficul spre exterior pe masina gazda; expose permite comunicarea exclusiv interna intre containerele din aceeasi retea."
  },
  {
    id: "devops-12",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Docker Compose: depends_on si conditia condition: service_healthy",
    question: "De ce simplul depends_on: [db] nu garanteaza ca baza de date este gata sa primeasca conexiuni si cum rezolvi problema cu Healthchecks?",
    answer: "Problema clasica la startup:\nIn mod implicit, directiva depends_on: [db] instruieste Docker Compose doar sa PORNEASCA containerul de baza de date inaintea backend-ului.\nInsa containerul de PostgreSQL sau MySQL are nevoie de cateva secunde pentru a initializa fisierele, a aloca memoria si a porni serverul SQL. Backend-ul (Spring Boot / Node) porneste imediat, incearca sa se conecteze la DB, primeste \"Connection Refused\" si se prabuseste!\n\nSolutia moderna:\nDefinirea unui \"healthcheck\" pe serviciul de baza de date si configurarea lui depends_on cu parametrul condition: service_healthy.",
    codeSnippet: `services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: pass
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    depends_on:
      db:
        condition: service_healthy # Asteapta pana cand DB raspunde real la interogari!`,
    interviewTrap: "Fara condition: service_healthy, directiva depends_on verifica doar starea de proces (daca procesul containerului ruleaza), nu disponibilitatea aplicatiei.",
    keyTakeaway: "depends_on cu condition: service_healthy impiedica pornirea prematura a backend-ului inainte ca dependintele sa fie complet initializate si gata de conexiuni."
  },
  {
    id: "devops-13",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Comenzi Esentiale Docker CLI: inspectie, loguri si depanare",
    question: "Care sunt cele mai frecvente comenzi Docker folosite in activitatea zilnica pentru inspectie, loguri si conectare interactiva in container?",
    answer: "Suita de baza pentru orice dezvoltator:\n\n1. docker ps: Listeaza containerele active (foloseste docker ps -a pentru a vedea si containerele oprite sau picate).\n2. docker logs -f --tail 100 <container>: Urmareste ultimele 100 de linii de loguri in timp real.\n3. docker exec -it <container> sh: Deschide un terminal interactiv (shell) in interiorul containerului activ (sau bash daca e disponibil) pentru depanare directa.\n4. docker inspect <container>: Afiseaza toate detaliile tehnice in format JSON (adrese IP, variabile de mediu, volume montate).\n5. docker stats: Monitorizeaza in timp real consumul de CPU, memorie RAM si trafic de retea pentru toate containerele.",
    codeSnippet: `# 1. Intra in containerul backend pentru a verifica variabilele de mediu:
docker exec -it ats_backend_api sh

# 2. Vezi logurile din container in timp real:
docker logs -f ats_backend_api

# 3. Afla adresa IP interna a containerului:
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' ats_postgres_db`,
    interviewTrap: "Daca o imagine ultra-usoara de tip Alpine nu are instalat /bin/bash, comanda docker exec -it <id> bash va returna eroare: \"OCI runtime exec failed: exec: bash: not found\". Foloseste \"sh\" in loc de \"bash\".",
    keyTakeaway: "docker logs, docker exec si docker inspect formeaza triada esentiala pentru diagnosticarea si depanarea containerelor in executie."
  },
  {
    id: "devops-14",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Curatarea Resurselor Docker: docker system prune",
    question: "Cum eliberezi spatiul pe disc consumat de Docker si ce face comanda docker system prune -a?",
    answer: "In timp, Docker acumuleaza pe disc sute de gigabytes de imagini vechi, containere oprite, retele abandonate si build cache.\n\nComanda de curatare:\n1. docker system prune: Sterge toate containerele oprite, retelele nefolosite si imaginile orfane (dangling images - marcate cu <none>:<none>).\n2. docker system prune -a (All): Sterge in plus TOATE imaginile care nu sunt folosite de cel putin un container activ pe sistem.\n3. docker system prune --volumes: Sterge suplimentar si volumele anonime neasociate niciunui container.",
    codeSnippet: `# Verifica spatiul consumat de Docker:
docker system df

# Curata tot ce nu este folosit activ (atentie: re-descarca imaginile la urmatorul build):
docker system prune -a --volumes -f`,
    interviewTrap: "Ai mare grija cu flag-ul --volumes! Daca rulezi prune cu --volumes, risti sa stergi volume anonime care contin date persistente importante daca containerele asociate erau temporar oprite!",
    keyTakeaway: "docker system prune elibereaza rapid spatiul pe disc prin eliminarea containerelor oprite si a imaginilor orfane neutilizate."
  },
  {
    id: "devops-15",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "docker stop vs docker kill: Semnalele SIGTERM si SIGKILL",
    question: "Care este diferenta dintre docker stop si docker kill si de ce conteaza pentru integritatea datelor din baza de date?",
    answer: "Diferenta consta in semnalul Linux trimis procesului din container:\n\n1. docker stop (Oprire Gratioasa / Graceful):\n- Trimite mai intai semnalul SIGTERM (Signal 15) procesului principal.\n- Ofera aplicatiei o fereastra de timp (implicit 10 secunde) pentru a se inchide curat: finalizarea cererilor HTTP in curs, salvarea tranzactiilor in baza de date, inchiderea pool-urilor de conexiuni si flush de loguri pe disc.\n- Doar daca aplicatia nu se opreste dupa expirarea celor 10 secunde, Docker trimite fortat SIGKILL.\n\n2. docker kill (Oprire Fortata / Brutala):\n- Trimite direct semnalul SIGKILL (Signal 9).\n- Procesul este ucis instant de kernel fara nicio sansa de a salva starea sau a rula proceduri de cleanup, putand lasa fisiere corupte sau conexiuni agatate.",
    codeSnippet: `# Oprire normala cu timp de asteptare extins la 30 secunde:
docker stop -t 30 my-backend-container

# Oprire fortata de urgenta (nu se recomanda pe DB):
docker kill my-backend-container`,
    interviewTrap: "Daca aplicatia ta Java/Node nu captureaza semnalul SIGTERM sau daca este pornita intr-un shell script care nu propaga semnalele catre procesul copil, docker stop va astepta inutil 10 secunde la fiecare oprire inainte de a da SIGKILL.",
    keyTakeaway: "docker stop trimite SIGTERM permitand salvarea datelor si inchiderea conexiunilor; docker kill opreste brutal procesul cu SIGKILL si poate duce la date corupte."
  },
  {
    id: "devops-16",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Permisiuni de Fisiere (chmod, notatie octala 755 vs 644)",
    question: "Cum functioneaza sistemul de permisiuni in Linux (rwx), ce reprezinta notatia octala 755 si 644 si cum se foloseste chmod?",
    answer: "In Linux, fiecare fisier are permisiuni impartite pe 3 categorii de utilizatori: User (proprietar), Group (grup), Others (toti ceilalti).\n\nValorile binare/octale:\n- r (Read) = 4\n- w (Write) = 2\n- x (Execute) = 1\nSuma acestora da cifra octala (de la 0 la 7):\n- 7 (4+2+1) = rwx (citire, scriere, executie)\n- 6 (4+2) = rw- (citire si scriere)\n- 5 (4+1) = r-x (citire si executie)\n- 4 = r-- (doar citire)\n\nPermisiuni standard in DevOps:\n- 755 (rwxr-xr-x): Proprietarul are drepturi depline (7), restul pot doar citi si executa (5). Standard pentru scripturi executabile (.sh) si directoare.\n- 644 (rw-r--r--): Proprietarul poate citi si scrie (6), restul pot doar citi (4). Standard pentru fisiere de configurare si cod sursa.",
    codeSnippet: `# Fa un script executabil:
chmod +x deploy.sh
# sau explicit in notatie numerica:
chmod 755 deploy.sh

# Securizeaza o cheie SSH privata (doar proprietarul are voie sa citeasca/scrie):
chmod 600 id_rsa`,
    interviewTrap: "Nu aplica niciodata chmod 777 in productie ca solutie rapida pentru erori de tip \"Permission denied\"! 777 da drepturi depline oricui sa citeasca, modifice si execute fisierul, reprezentand o bresa majora de securitate.",
    keyTakeaway: "Permisiunile Linux combina bitii de read (4), write (2) si execute (1) pentru User, Group si Others; foloseste 755 pentru scripturi si 644 pentru fisiere de date."
  },
  {
    id: "devops-17",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Proprietate si Grupuri cu comanda chown",
    question: "Ce face comanda chown in Linux si cum schimbi proprietarul si grupul unui intreg director in mod recursiv?",
    answer: "Comanda chown (Change Owner) modifica utilizatorul si/sau grupul caruia ii apartine un fisier sau director.\n\nSintaxa standard:\nchown [utilizator]:[grup] cale_fisier\n\nOptiunea recursiva (-R):\nModifica drepturile de proprietate pentru directorul respectiv si pentru absolut toate fisierele si subfolderele continute in interiorul sau.",
    codeSnippet: `# Schimba proprietarul la utilizatorul 'deploy' si grupul 'docker':
sudo chown deploy:docker /var/www/app

# Aplica recursiv pe tot directorul aplicatiei:
sudo chown -R appuser:appgroup /opt/app`,
    interviewTrap: "Ai grija cand rulezi chown -R cu sudo pe foldere de sistem; o eroare de tastare (precum chown -R user:user / var) poate distruge permisiunile intregului sistem de operare.",
    keyTakeaway: "chown user:group schimba posesorul fisierelor; flag-ul -R aplica modificarea recursiv in intregul arbore de directoare."
  },
  {
    id: "devops-18",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Semnale de Proces (kill -15 SIGTERM vs kill -9 SIGKILL)",
    question: "Care este diferenta fundamentala intre comenzile kill <pid> (sau kill -15) si kill -9 <pid> in Linux?",
    answer: "In Linux, comanda \"kill\" nu omoara direct procesul, ci ii trimite un semnal (Signal):\n\n1. kill <pid> sau kill -15 <pid> (SIGTERM - Termination Signal):\n- Este semnalul politicos de oprire standard.\n- Procesul primeste semnalul si poate executa handlere de curatare (salvare fisiere, eliberare memorie, deconectare socket-uri).\n- Procesul poate decide sa ignore semnalul daca este blocat.\n\n2. kill -9 <pid> (SIGKILL - Kill Signal):\n- Semnalul este procesat DIRECT de nucleul Linux (Kernel), ignorand complet aplicatia.\n- Procesul nu poate intercepta, bloca sau curata nimic; este sters instant din tabela de procese a sistemului de operare.\n- Folosit doar ca ultima solutie cand un proces este blocat complet (zombie sau frozen).",
    codeSnippet: `# Incearca intotdeauna intai oprirea curata:
kill 1234
# sau:
kill -SIGTERM 1234

# Daca procesul refuza sa se opreasca dupa cateva secunde:
kill -9 1234`,
    interviewTrap: "Daca omori o baza de date cu kill -9 in timpul unei tranzactii masive, la urmatoarea pornire va fi necesara o faza lunga de Crash Recovery pentru a aduce fisierele de pe disc intr-o stare consistenta.",
    keyTakeaway: "Foloseste intotdeauna kill (SIGTERM) mai intai pentru oprire gratioasa; apeleaza la kill -9 (SIGKILL) doar cand procesul nu mai raspunde deloc."
  },
  {
    id: "devops-19",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Monitorizarea Proceselor cu ps aux, top si htop",
    question: "Cum identifici procesele care consuma excesiv CPU sau memorie RAM pe un server Linux folosind ps, top sau htop?",
    answer: "Instrumente standard de monitorizare procese:\n\n1. top:\n- Monitor de procese interactiv integrat in toate distributiile Linux.\n- Afiseaza Load Average (pe 1, 5 si 15 minute), consumul global de CPU/RAM si lista proceselor sortate dupa activitate.\n- Comenzi interactive utile: tasta \"M\" sorteaza dupa consum de memorie, tasta \"P\" sorteaza dupa CPU, tasta \"k\" permite oprirea unui proces prin introducerea PID-ului.\n\n2. htop:\n- Versiune moderna si colorata a lui top, cu suport pentru scroll cu mouse-ul si vizualizare grafica a fiecarui nucleu CPU in parte.\n\n3. ps aux:\n- Face o fotografie statica (snapshot) a tuturor proceselor active din sistem.\n- Poate fi filtrat si sortat cu usurinta prin conducte Unix (pipes): ps aux | grep java sau sortat dupa memorie.",
    codeSnippet: `# Afiseaza top 5 procese care consuma cea mai multa memorie RAM:
ps aux --sort=-%mem | head -n 6

# Gaseste PID-ul unui proces Java specific:
pgrep -f "spring-boot"
# sau:
ps aux | grep java`,
    interviewTrap: "Ce inseamna Load Average pe un server cu 4 nuclee (cores)? Daca Load Average este 4.0, procesorul este utilizat la 100% capacitate; daca depaseste 4.0 (ex: 8.0), procesele stau la coada si asteapta CPU.",
    keyTakeaway: "top si htop ofera monitorizare dinamica in timp real, iar ps aux ofera un instantaneu complet usor de filtrat prin comenzi pipe."
  },
  {
    id: "devops-20",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Urmarirea Logurilor in Timp Real cu tail -f si less +F",
    question: "Cum vizualizezi si urmaresti in timp real liniile noi adaugate intr-un fisier de log folosind tail si less?",
    answer: "1. tail -f /cale/catre/app.log:\n- Urmareste fisierul pe masura ce este scris (Follow mode).\n- Fiecare linie noua aparuta in fisier este afisata instant pe ecran.\n- Pentru a incepe cu ultimele 200 de linii existente: tail -n 200 -f app.log.\n- tail -F (cu F mare): Urmareste fisierul chiar daca acesta este rotit (Log Rotation) si recreat!\n\n2. less +F app.log:\n- Deschide fisierul in modul follow (ca tail -f), dar permite comutarea oricand in modul de navigare si cautare istorica prin apasarea combinatiei Ctrl+C, apoi cautare rapida cu \"/eroare\" si revenire in modul follow cu tasta Shift+F.",
    codeSnippet: `# Urmareste logul de productie filtrand doar erorile:
tail -f /var/log/application.log | grep --line-buffered "ERROR"`,
    interviewTrap: "Daca folosesti tail -f impreuna cu grep fara flag-ul --line-buffered, bufferul standard Linux poate amana afisarea pe ecran a liniilor pana cand se acumuleaza 4KB de date, dand senzatia falsa ca aplicatia nu mai scrie loguri.",
    keyTakeaway: "tail -f urmareste scrierea live a logurilor pe ecran, iar tail -F gestioneaza si fisierele recreate prin rotatie automata."
  },
  {
    id: "devops-21",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Cautarea Eficienta de Text cu grep",
    question: "Cum cauti rapid un text sau o eroare specifica in toate fisierele dintr-un director folosind utilitarul grep?",
    answer: "grep (Global Regular Expression Print) este cel mai puternic instrument de linie de comanda pentru cautarea de tipare de text.\n\nFlag-uri esentiale:\n- -r sau -R (Recursive): Cauta in directorul curent si in toate subdirectoarele.\n- -i (Ignore Case): Cauta insensibil la majuscule/minuscule (gaseste si \"Error\", si \"error\").\n- -n (Line Number): Afiseaza numarul liniei unde s-a gasit potrivirea.\n- -v (Invert Match): Afiseaza toate liniile care NU contin tiparul cautat.\n- -C 3 (Context): Afiseaza 3 linii inainte si 3 linii dupa linia gasita (extrem de util pentru a vedea Stack Trace-ul unei erori!).",
    codeSnippet: `# Cauta recursiv "NullPointerException" in toate fisierele de log cu context de 3 linii:
grep -rn -C 3 "NullPointerException" /var/log/app/

# Numara de cate ori a aparut statusul 500:
grep -c "HTTP/1.1 500" access.log`,
    interviewTrap: "Pentru cautarea unui string literal simplu fara expresii regulate (mai rapid), foloseste flag-ul -F (grep -F \"text.fix[0]\").",
    keyTakeaway: "grep -rn \"pattern\" gaseste instant aparitiile unui text in intregul proiect, afisand fisierele si numerele de linie corespunzatoare."
  },
  {
    id: "devops-22",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Gasirea Fisierelor cu utilitarul find",
    question: "Cum folosesti utilitarul find pentru a gasi fisiere dupa nume, marime sau data ultimei modificari?",
    answer: "find parcurge arborele de directoare si filtreaza fisierele pe baza metadatelor din sistemul de fisiere.\n\nSintaxe comune:\n1. Dupa nume: find /cale -name \"*.log\" (sau -iname pentru case-insensitive).\n2. Dupa marime: find /var/log -size +100M (gaseste fisiere mai mari de 100 de Megabytes).\n3. Dupa tip: find . -type f (doar fisiere) sau -type d (doar directoare).\n4. Dupa data modificarii: find /tmp -mtime +7 (fisiere modificate cu mai mult de 7 zile in urma).\n5. Cu actiune automata: -exec comanda {} \\; (executa o actiune pe fiecare fisier gasit).",
    codeSnippet: `# Gaseste si sterge toate fisierele .log mai vechi de 30 de zile:
find /var/log/app -name "*.log" -mtime +30 -exec rm {} \\;

# Gaseste cele mai mari fisiere de pe disc:
find / -xdev -type f -size +500M`,
    interviewTrap: "Pune intotdeauna masca de nume intre ghilimele (find . -name \"*.java\"), altfel shell-ul va expanda el insusi masca in directorul curent inainte de a apela find, ducand la erori de sintaxa.",
    keyTakeaway: "find cauta fisiere in adancime pe baza numelui, dimensiunii sau datei, putand executa automat comenzi pe rezultatele gasite."
  },
  {
    id: "devops-23",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Diagnostic de Retea cu curl, ping si ss/netstat",
    question: "Cum verifici daca un port este deschis si daca un serviciu raspunde la apeluri HTTP folosind utilitare Linux?",
    answer: "Utilitare esentiale de diagnoza de retea:\n\n1. curl -I http://localhost:8080/actuator/health:\n- Trimite o cerere HTTP HEAD si afiseaza doar headerele de raspuns (status code 200 OK, Content-Type) fara corpul paginii.\n- Ideal pentru a verifica rapid daca aplicatia web a pornit.\n\n2. ss -tulpn (Inlocuitorul modern pentru netstat):\n- Listeaza toate porturile TCP/UDP aflate in stare de ascultare (LISTEN), impreuna cu procesul si PID-ul care detine portul.\n- Flag-uri: -t (TCP), -u (UDP), -l (Listening), -p (Proces), -n (Numeric, nu converteste portul in nume de serviciu).\n\n3. ping <host>:\n- Verifica conectivitatea de baza la nivel de pachete ICMP (atentie: multe servere cloud precum AWS blocheaza intentionat ping/ICMP din motive de securitate, chiar daca portul 80/443 este deschis!).\n\n4. nc -zv <host> <port> (Netcat) sau telnet <host> <port>:\n- Testeaza daca un port TCP specific este deschis si accepta conexiuni.",
    codeSnippet: `# Verifica ce proces asculta pe portul 8080:
sudo ss -tulpn | grep :8080

# Testeaza rapid conexiunea TCP catre baza de date:
nc -zv postgres-host 5432`,
    interviewTrap: "Daca ping esueaza catre un server cloud, nu presupune ca serverul este cazut! Verifica intotdeauna portul specific cu curl sau netcat.",
    keyTakeaway: "ss -tulpn arata ce procese asculta pe porturile locale, iar curl -I verifica raspunsul HTTP real al aplicatiei."
  },
  {
    id: "devops-24",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Rezolutie DNS cu nslookup si dig",
    question: "Cum diagnostichezi problemele de rezolutie DNS in Linux folosind comenzile dig sau nslookup si unde este configurat serverul DNS?",
    answer: "Fisierul /etc/resolv.conf stabileste ce servere DNS (nameservers) interogheaza sistemul de operare pentru a traduce un nume de domeniu (ex: api.google.com) intr-o adresa IP numerica.\n\nComenzi de diagnoza:\n1. nslookup domeniu.com:\n- Comanda simpla si rapida care afiseaza serverul DNS interogat si adresa IP returnata.\n\n2. dig domeniu.com (Domain Information Groper):\n- Instrumentul profesional preferat de inginerii DevOps.\n- Afiseaza informatii detaliate: sectiunea ANSWER cu adresele IP, timpul de raspuns (Query time), valoarea TTL (Time-To-Live) a inregistrarii si tipul acesteia (A, CNAME, MX).\n- Pentru un raspuns ultra-concis: dig +short domeniu.com.",
    codeSnippet: `# Interogare rapida a adresei IP:
dig +short github.com

# Interogheaza un server DNS specific (ex: Google DNS 8.8.8.8):
dig @8.8.8.8 api.extern.com`,
    interviewTrap: "In Kubernetes, problemele de rezolutie DNS interna intre servicii sunt adesea cauzate de o configuratie gresita a serviciului CoreDNS sau de cautari redundante in search domains din /etc/resolv.conf.",
    keyTakeaway: "dig si nslookup verifica daca serverul DNS traduce corect domeniile in adrese IP si ofera detalii despre timpii de raspuns si TTL."
  },
  {
    id: "devops-25",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Redirectionari de I/O (>, >>, 2>&1, Pipes | si /dev/null)",
    question: "Ce inseamna descriptorii standard de fisiere (stdin, stdout, stderr) si ce face operatorul 2>&1 in redirectionarea iesirilor?",
    answer: "In Linux, fiecare proces deschide 3 fluxuri standard (File Descriptors):\n- 0: stdin (Standard Input)\n- 1: stdout (Standard Output - mesaje normale)\n- 2: stderr (Standard Error - mesaje de eroare)\n\nOperatori de redirectionare:\n1. >: Suprascrie fisierul destinatie cu stdout (ex: comanda > log.txt).\n2. >>: Adauga la sfarsitul fisierului (append) fara a sterge continutul vechi.\n3. 2>: Redirectioneaza doar erorile (stderr) intr-un fisier separat.\n4. 2>&1: Redirectioneaza fluxul 2 (stderr) in acelasi loc unde merge fluxul 1 (stdout).\n5. /dev/null: \"Gaura neagra\" a sistemului Linux; orice trimiti acolo este distrus imediat fara a ocupa spatiu.",
    codeSnippet: `# Ruleaza un script si salveaza atat outputul normal, cat si erorile in acelasi fisier:
./deploy.sh > app.log 2>&1 &

# Ignora complet erorile suparatoare la cautare (arunca stderr la cos):
find / -name "secret.txt" 2> /dev/null`,
    interviewTrap: "Ordinea conteaza! Scrie intotdeauna > output.log 2>&1 si NU 2>&1 > output.log. A doua varianta va trimite erorile spre vechea destinatie a lui stdout (consola) inainte ca acesta sa fie redirectionat in fisier!",
    keyTakeaway: "2>&1 unifica mesajele de eroare cu mesajele standard intr-un singur canal sau fisier de log."
  },
  {
    id: "devops-26",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Variabile de Mediu si comanda export",
    question: "Cum creezi o variabila de mediu in Linux, cum o faci accesibila proceselor copil si cum o faci permanenta la restart?",
    answer: "1. Variabila locala de shell:\n- VAR=\"valoare\"\n- Este vizibila DOAR in sesiunea curenta de terminal si NU este transmisa scripturilor sau proceselor pornite ulterior din acel shell.\n\n2. Variabila de mediu exportata:\n- export VAR=\"valoare\"\n- Devine o variabila de mediu oficiala; orice proces copil sau script pornit din acest shell mosteneste variabila.\n\n3. Persistenta la restart:\nVariabilele setate in terminal se pierd cand inchizi sesiunea. Pentru a le pastra permanent:\n- Pentru un utilizator specific: se adauga linia export VAR=\"valoare\" in fisierul ~/.bashrc sau ~/.bash_profile.\n- Global pentru toti utilizatorii sistemului: se adauga in /etc/environment.",
    codeSnippet: `# Exporta variabila pentru sesiune:
export SPRING_PROFILES_ACTIVE=production

# Verifica valoarea:
echo $SPRING_PROFILES_ACTIVE

# Afiseaza toate variabilele de mediu active din sistem:
env
# sau:
printenv`,
    interviewTrap: "Daca pui spatii in jurul semnului egal (VAR = \"test\"), Linux va incerca sa execute comanda \"VAR\" si va returna eroare: \"command not found\". Nu pune niciodata spatii inainte sau dupa semnul egal!",
    keyTakeaway: "Comanda export transforma o variabila locala intr-o variabila de mediu transmisa automat tuturor proceselor copil."
  },
  {
    id: "devops-27",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Gestionarea Serviciilor de Sistem cu systemctl",
    question: "Ce este systemd si care sunt comenzile esentiale systemctl pentru administrarea serviciilor pe un server Linux?",
    answer: "systemd este sistemul standard de initializare (init system) si manager de servicii pentru marea majoritate a distributiilor Linux moderne (Ubuntu, Debian, RedHat, CentOS).\n\nComenzi esentiale systemctl:\n1. sudo systemctl start <service>: Porneste serviciul.\n2. sudo systemctl stop <service>: Opreste serviciul.\n3. sudo systemctl restart <service>: Reporneste serviciul (util dupa modificari de configuratie).\n4. sudo systemctl status <service>: Afiseaza starea curenta (active/running, failed), PID-ul si ultimele linii de log.\n5. sudo systemctl enable <service>: Configureaza serviciul sa porneasca AUTOMAT la boot-area masinii gazda.\n6. sudo systemctl disable <service>: Opreste pornirea automata la boot.",
    codeSnippet: `# Verifica starea serverului Docker:
sudo systemctl status docker

# Activeaza si porneste Nginx la boot:
sudo systemctl enable --now nginx`,
    interviewTrap: "Diferenta intre \"start\" si \"enable\": start porneste serviciul doar pentru sesiunea curenta (nu va porni dupa restart), in timp ce enable creeaza link-urile simbolice pentru pornirea la boot a sistemului.",
    keyTakeaway: "systemctl controleaza starea serviciilor pe Linux; foloseste \"status\" pentru diagnostic si \"enable\" pentru pornire automata la boot."
  },
  {
    id: "devops-28",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Vizualizarea Jurnalelor cu journalctl",
    question: "Cum folosesti comanda journalctl pentru a citi si filtra logurile generate de un serviciu systemd?",
    answer: "journalctl este utilitarul dedicat pentru interogarea jurnalelor gestionate de systemd-journald.\n\nComenzi uzuale de diagnostic:\n1. journalctl -u <service_name>: Afiseaza toate logurile generate strict de serviciul respectiv (ex: -u nginx).\n2. journalctl -u <service_name> -f: Urmareste logurile serviciului in timp real (Follow mode, similar cu tail -f).\n3. journalctl -u <service_name> -n 100: Afiseaza ultimele 100 de linii.\n4. journalctl -u <service_name> --since \"1 hour ago\": Filtreaza evenimentele din ultima ora.\n5. journalctl -p err: Afiseaza doar mesajele cu prioritate de eroare (Priority Error) din intregul sistem.",
    codeSnippet: `# Urmareste logurile backend-ului din ultima jumatate de ora:
journalctl -u ats-backend -f --since "30 min ago"`,
    interviewTrap: "Daca nu ai privilegii de administrator (sudo), journalctl iti va afisa doar logurile utilizatorului tau curent si nu cele ale serviciilor de sistem.",
    keyTakeaway: "journalctl centralizeaza logurile tuturor serviciilor de sistem, permitand filtrare rapida pe nume de serviciu (-u), timp (--since) si prioritate (-p)."
  },
  {
    id: "devops-29",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Autentificare Sigura prin Chei SSH (ssh-keygen, authorized_keys)",
    question: "Cum functioneaza autentificarea pe baza de chei SSH asimetrice si cum adaugi o cheie publica pe un server remote?",
    answer: "Autentificarea cu chei SSH elimina nevoia introducerii parolelor si se bazeaza pe criptografie asimetrica:\n\n1. Generarea perechii de chei pe masina locala:\n- Se ruleaza ssh-keygen -t ed25519 (sau rsa -b 4096).\n- Se genereaza doua fisiere in ~/.ssh/:\n  * id_ed25519 (Cheia PRIVATA - nu se partajeaza NICIODATA, ramane strict pe masina ta!).\n  * id_ed25519.pub (Cheia PUBLICA - poate fi trimisa oricui).\n\n2. Autorizarea pe serverul remote:\n- Cheia publica trebuie adaugata in fisierul ~/.ssh/authorized_keys al utilizatorului de pe serverul remote.\n- Comanda rapida automata: ssh-copy-id user@server-ip.\n\n3. Securitate:\nPermisiunile directorului ~/.ssh trebuie sa fie strict 700, iar cele ale fisierului authorized_keys 600.",
    codeSnippet: `# 1. Genereaza perechea moderna Ed25519:
ssh-keygen -t ed25519 -C "admin@ats-tracker.com"

# 2. Copiaza cheia publica pe serverul de cloud:
ssh-copy-id -i ~/.ssh/id_ed25519.pub ubuntu@192.168.1.100

# 3. Conectare fara parola:
ssh ubuntu@192.168.1.100`,
    interviewTrap: "Daca permisiunile fisierului cheii private locale id_ed25519 sunt prea permisive (ex: 644 sau 777), clientul SSH va refuza conexiunea cu eroarea de securitate \"WARNING: UNPROTECTED PRIVATE KEY FILE!\". Aplica chmod 600 ~/.ssh/id_ed25519.",
    keyTakeaway: "Cheia privata ramane secreta pe laptopul tau; cheia publica se depune in authorized_keys pe server pentru acces securizat fara parola."
  },
  {
    id: "devops-30",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Planificarea Sarcinilor Recurente cu cron (crontab)",
    question: "Care este sintaxa celor 5 campuri dintr-un fisier crontab si cum programezi un backup zilnic la miezul noptii?",
    answer: "Demonul cron din Linux executa comenzi programate la intervale regulate definite in tabelul crontab (crontab -e).\n\nSintaxa celor 5 campuri de timp:\n*  *  *  *  *\n|  |  |  |  |\n|  |  |  |  +-- Ziua din saptamana (0-7, unde 0 si 7 reprezinta Duminica)\n|  |  |  +----- Luna (1-12)\n|  |  +-------- Ziua din luna (1-31)\n|  +----------- Ora (0-23)\n+-------------- Minutul (0-59)\n\nExemple uzuale:\n- 0 0 * * * : In fiecare noapte exact la 00:00 (miezul noptii).\n- */15 * * * * : Din 15 in 15 minute.\n- 0 9 * * 1-5 : De luni pana vineri la ora 09:00 dimineata.",
    codeSnippet: `# Deschide editorul de cron:
crontab -e

# Adauga sarcina de backup nocturn la ora 02:00 cu redirectionare de log:
0 2 * * * /opt/scripts/backup-db.sh >> /var/log/backup.log 2>&1`,
    interviewTrap: "Mediul de executie din cron ruleaza cu un PATH minimal (/usr/bin:/bin). Daca apelezi un executabil precum \"docker\" sau \"node\" fara calea sa absoluta (/usr/local/bin/docker), scriptul va esua in cron desi merge manual in terminal!",
    keyTakeaway: "crontab defineste comenzi automate pe 5 axe temporale (minut, ora, zi, luna, zi din saptamana); specifica intotdeauna cai absolute catre executabile."
  },
  {
    id: "devops-31",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Git: merge vs rebase",
    question: "Care este diferenta dintre git merge si git rebase si cand este contraindicat sa folosesti rebase?",
    answer: "Ambele comenzi integreaza modificarile dintr-un branch in altul, dar structureaza istoricul complet diferit:\n\n1. git merge:\n- Creeaza un nou commit de fuziune (\"Merge commit\") cu doi parinti.\n- Pastreaza istoricul exact asa cum s-a intamplat in timp (istoric non-liniar, vizibil ca o ramificatie).\n- Sigur pentru branch-uri partajate public.\n\n2. git rebase:\n- Muta baza branch-ului tau pe varful branch-ului tinta, \"re-scriind\" commit-urile tale unul cate unul ca si cum ai fi inceput sa lucrezi abia acum.\n- Creeaza un istoric perfect curat si liniar (fara merge commits redundante).\n\nRegula de aur a Rebase-ului (Golden Rule of Rebase):\nNU da niciodata rebase pe un branch public sau partajat cu alti colegi (precum main sau develop)! Rebase rescrie hash-urile de commit (SHA), ceea ce va crea divergente majore si dureri de cap pentru oricine a clonat acel branch.",
    codeSnippet: `# Pe branch-ul tau de feature (pentru a fi la zi cu main liniar):
git checkout feature/login
git rebase main

# Dupa rezolvarea eventualelor conflicte:
git rebase --continue`,
    interviewTrap: "Dupa un rebase local pe un branch deja urcat pe GitHub, un simplu \"git push\" va fi respins. Este necesar \"git push --force-with-lease\", dar asigura-te ca doar tu lucrezi pe acel branch!",
    keyTakeaway: "Merge pastreaza cronologia exacta prin merge commits; Rebase creeaza un istoric liniar prin rescrierea commit-urilor, dar este interzis pe branch-uri partajate."
  },
  {
    id: "devops-32",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: Rezolvarea Conflictelor de Merge",
    question: "Cum apar conflictele de merge in Git, cum arata marcajele de conflict (conflict markers) si care sunt pasii de rezolvare?",
    answer: "Un conflict apare atunci cand doi dezvoltatori modifica aceleasi linii de cod dintr-un fisier pe branch-uri diferite, iar Git nu poate decide automat care versiune este cea corecta.\n\nMarcajele Git in fisierul in conflict:\n<<<<<<< HEAD\n// Codul existent pe branch-ul pe care te afli curent\n=======\n// Codul care vine din branch-ul pe care incerci sa il imbini\n>>>>>>> feature-branch\n\nPasi de rezolvare:\n1. Deschizi fisierul in editor (sau folosesti merge tool-ul din IDE).\n2. Discuti cu colegul si alegi codul corect (sau le combini), stergand manual toate marcajele (<<<<<<<, =======, >>>>>>>).\n3. Salvezi fisierul.\n4. Marchez conflictul ca rezolvat prin git add <fisier>.\n5. Finalizezi procesul prin git commit (sau git rebase --continue).",
    codeSnippet: `# Statusul arata fisierele cu probleme:
git status # (both modified: src/App.jsx)

# Dupa editarea manuala si stergerea marcajelor:
git add src/App.jsx
git commit -m "fix: resolve merge conflict in App.jsx"`,
    interviewTrap: "Daca ai facut o greseala in timpul rezolvarii conflictelor si vrei sa anulezi totul si sa revii la starea de dinaintea inceperii operatiunii, apeleaza: git merge --abort (sau git rebase --abort).",
    keyTakeaway: "Conflictele se rezolva prin stergerea marcajelor speciale si alegerea codului dorit, urmata de git add si finalizarea commit-ului."
  },
  {
    id: "devops-33",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: git switch si git restore vs vechiul git checkout",
    question: "De ce a introdus Git comenzile specializate git switch si git restore pentru a inlocui traditionalul git checkout?",
    answer: "In trecut, comanda git checkout era responsabila pentru doua actiuni complet diferite:\n1. Comutarea branch-urilor: git checkout feature.\n2. Aruncarea modificarilor din fisiere: git checkout -- fisier.txt.\nAceasta supraincarcare crea frecvent confuzii si riscuri mari de pierdere accidentala a codului nelivrat!\n\nNoile comenzi introduse in Git 2.23:\n1. git switch: Dedicata exclusiv branch-urilor:\n- git switch main : trece pe branch-ul main.\n- git switch -c feature/nou : creeaza si comuta pe noul branch (-c = create).\n\n2. git restore: Dedicata restaurarii fisierelor:\n- git restore fisier.js : anuleaza modificarile nesalvate din working directory.\n- git restore --staged fisier.js : scoate fisierul din zona de staging (unstage) pastrandu-i modificarile.",
    codeSnippet: `# Creeaza si comuta pe branch nou:
git switch -c feature/payment-gateway

# Scoate un fisier adaugat din greseala la commit:
git restore --staged secrets.env

# Anuleaza toate schimbarile locale din folder:
git restore .`,
    interviewTrap: "Desi git checkout este inca functional pentru retrocompatibilitate, folosirea comenzilor switch si restore este recomandata oficial in toate echipele moderne.",
    keyTakeaway: "git switch comuta sigur intre branch-uri, iar git restore manipuleaza starea fisierelor fara riscul de a incurca actiunile."
  },
  {
    id: "devops-34",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: Salvarea Temporara a Lucrului cu git stash",
    question: "Ce este git stash, cand il folosesti si cum recuperezi modificarile puse deoparte?",
    answer: "git stash ia modificarile nesalvate din directorul de lucru (atat staged cat si unstaged) si le salveaza pe o stiva temporara curata, readucand codul la starea ultimului commit curat (HEAD).\n\nScenariu clasic:\nLucrezi la o functionalitate si ai fisiere neterminate. Apare un bug critic in productie si trebuie sa treci imediat pe branch-ul main pentru un hotfix. Nu vrei sa creezi un commit murdar (\"wip\").\n\nComenzi uzuale:\n1. git stash: Salveaza starea curenta si curata spatiul de lucru.\n2. git stash save \"mesaj descriptiv\": Salveaza cu un mesaj clar.\n3. git stash -u (Untracked): Salveaza si fisierele noi create care nu au fost inca adaugate cu git add.\n4. git stash pop: Aplica ultimul stash salvat si il sterge din stiva.\n5. git stash apply: Aplica modificarile dar pastreaza stash-ul in lista.\n6. git stash list: Afiseaza toate elementele din stiva.",
    codeSnippet: `# 1. Pune deoparte codul neterminat:
git stash -u

# 2. Rezolva hotfix-ul pe main...
git switch main
# ... deploy hotfix

# 3. Revino pe branch-ul tau si readu codul deoparte:
git switch feature/login
git stash pop`,
    interviewTrap: "Daca ai fisiere complet noi care nu au fost niciodata urmarite de Git (untracked files), un simplu git stash le va ignora! Foloseste intotdeauna git stash -u (--include-untracked).",
    keyTakeaway: "git stash elibereaza instant spatiul de lucru pentru schimbarea rapida a contextului, permitand restaurarea ulterioara cu git stash pop."
  },
  {
    id: "devops-35",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Git: git reset (--soft vs --mixed vs --hard)",
    question: "Care este diferenta critica intre optiunile --soft, --mixed si --hard ale comenzii git reset?",
    answer: "git reset muta pointerul HEAD si al branch-ului curent catre un commit anterior. Diferenta consta in modul in care trateaza cele 3 zone: Commit History, Staging Area (Index) si Working Directory:\n\n1. git reset --soft HEAD~1:\n- Muta pointerul cu un commit in urma.\n- Toate modificarile din commit-ul anulat raman in STAGING AREA (verzi la git status).\n- Ideal daca vrei sa rescrii mesajul commit-ului sau sa comasezi (squash) ultimele commit-uri.\n\n2. git reset --mixed HEAD~1 (Implicit):\n- Muta pointerul inapoi si curata Staging Area.\n- Modificarile raman salvate in WORKING DIRECTORY (rosii la git status).\n\n3. git reset --hard HEAD~1 (Distructiv!):\n- Muta pointerul inapoi, curata Staging Area SI STERGE DEFINITIV toate modificarile din fisierele de pe disc!\n- Codul revine exact la starea din acel commit, pierzand orice modificare nesalvata.",
    codeSnippet: `# Comasare a ultimelor 3 commit-uri intr-unul singur curat:
git reset --soft HEAD~3
git commit -m "feat: complete registration flow"

# Anulare completa a ultimului commit si a codului scris:
git reset --hard HEAD~1`,
    interviewTrap: "git reset --hard este ireversibil daca modificarile nu au fost comise anterior. Nu il rula niciodata daca ai fisiere importante nesalvate in editor!",
    keyTakeaway: "reset --soft pastreaza codul in staging, --mixed il lasa in directorul de lucru, iar --hard sterge definitiv toate modificarile."
  },
  {
    id: "devops-36",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: git revert vs git reset pe branch-uri partajate",
    question: "De ce este recomandat git revert in loc de git reset atunci cand vrei sa anulezi un commit aflat deja pe branch-ul main din GitHub?",
    answer: "1. git reset HEAD~1 pe branch-uri partajate:\n- Rescrie istoricul stergand commit-ul din arbore.\n- Colegii care trag schimbarile cu git pull vor intampina erori majore de sincronizare (\"divergent branches\") pentru ca istoricul lor local nu mai coincide cu cel de pe server.\n\n2. git revert <commit-id> (Solutia sigura in productie):\n- NU sterge commit-ul vechi din istoric!\n- In schimb, creeaza un NOU COMMIT care contine modificarea exact inversa (daca commit-ul vechi adauga o linie, revert o sterge; daca stergea un fisier, revert il re-creeaza).\n- Istoricul ramane continuu si aditiv, putand fi trimis prin git push normal fara a deranja munca niciunui coleg de echipa.",
    codeSnippet: `# Anuleaza commit-ul cu bug fara a rescrie istoricul:
git revert a1b2c3d -m "revert: rollback buggy payment integration"
git push origin main`,
    interviewTrap: "Daca ai nevoie sa anulezi un merge commit cu git revert, Git va cere optiunea -m 1 pentru a sti care dintre cele doua ramuri parinte trebuie pastrata ca linie principala.",
    keyTakeaway: "git revert anuleaza schimbarile prin adaugarea unui nou commit invers, fiind modalitatea sigura de rollback pe branch-uri colaborative."
  },
  {
    id: "devops-37",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: git cherry-pick pentru aplicarea selectiva a commit-urilor",
    question: "Ce face comanda git cherry-pick si in ce scenarii este utila?",
    answer: "git cherry-pick <commit-hash> preia modificarile introduse de un commit specific de pe un alt branch si le aplica (re-creaza) pe branch-ul curent sub forma unui nou commit.\n\nScenarii comune:\n1. Un coleg a rezolvat un bug critic pe un branch experimental care nu este inca gata de merge complet; poti prelua doar commit-ul cu fix-ul direct pe branch-ul tau sau pe main.\n2. Ai comis accidental un patch pe un branch gresit (ex: pe master in loc de feature); poti comuta pe branch-ul corect si sa aduci commit-ul cu cherry-pick.",
    codeSnippet: `# Comuta pe branch-ul de release si aduce doar commit-ul specific:
git switch release/v1.2
git cherry-pick 7f4a9b2`,
    interviewTrap: "Folosirea excesiva a cherry-pick-ului creeaza commit-uri duplicate cu SHA-uri diferite pentru acelasi cod, facand fuziunile (merge) ulterioare intre acele branch-uri mult mai predispuse la conflicte.",
    keyTakeaway: "git cherry-pick copiaza un commit izolat de pe un branch pe altul fara a imbina intreaga istorie a branch-ului sursa."
  },
  {
    id: "devops-38",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: git fetch vs git pull",
    question: "Care este diferenta dintre git fetch si git pull si de ce inspectia cu fetch este mai sigura?",
    answer: "1. git fetch:\n- Descarca toate commit-urile, branch-urile si tag-urile noi din depozitul remote (GitHub) pe masina ta locala.\n- NU modifica si nu atinge absolut deloc fisierele din directorul tau de lucru curent!\n- Actualizeaza referintele remote (ex: origin/main). Poti inspecta schimbarile in liniste cu git log origin/main sau git diff origin/main inainte de a decide daca le imbini.\n\n2. git pull:\n- Este o comanda combinata: executa git fetch urmat imediat de git merge (sau git rebase daca este configurat pull.rebase).\n- Modifica direct fisierele de lucru locale si poate declansa instant conflicte de merge daca aveai modificari locale comise.",
    codeSnippet: `# Modul sigur de lucru:
git fetch origin
git log HEAD..origin/main --oneline # Vezi ce commit-uri noi au sosit
git merge origin/main               # Aplica doar cand esti gata`,
    interviewTrap: "Daca configurezi git config --global pull.rebase true, comanda git pull va face rebase in loc de merge, pastrand istoricul tau local liniar peste schimbarile de pe remote.",
    keyTakeaway: "git fetch doar descarca datele noi fara a atinge directorul de lucru; git pull descarca si fuzioneaza automat modificarile."
  },
  {
    id: "devops-39",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: Tag-uri Semantice (Lightweight vs Annotated)",
    question: "Cum se creeaza tag-urile in Git si care este diferenta dintre un tag Lightweight si un tag Annotated?",
    answer: "Tag-urile sunt utilizate pentru a marca puncte specifice importante din istoricul proiectului (de regula versiuni de lansare / releases, ex: v1.0.0, v2.1.4).\n\n1. Lightweight Tag:\n- Este doar un simplu pointer fix (ca un branch care nu se mai misca) catre un commit hash.\n- Nu contine autor, data sau mesaj explicativ: git tag v1.0.0.\n\n2. Annotated Tag (Recomandat pentru release-uri oficiale):\n- Este stocat ca un obiect complet in baza de date Git, cu semnatura autorului, email, data exacta si mesaj explicativ: git tag -a v1.0.0 -m \"Release 1.0.0 Productie\".\n- Poate fi semnat criptografic cu cheie GPG (-s) pentru autenticitate.\n\nPentru a urca tag-urile pe GitHub:\ngit push origin v1.0.0 sau git push origin --tags.",
    codeSnippet: `# Creare tag adnotat oficial:
git tag -a v1.0.0 -m "Versiune stabila productie Q3"

# Urcare pe serverul remote:
git push origin v1.0.0`,
    interviewTrap: "Un simplu git push origin main NU trimite automat tag-urile locale pe GitHub! Trebuie sa pasezi explicit numele tag-ului sau optiunea --tags.",
    keyTakeaway: "Annotated tags stocheaza metadate complete despre versiune (autor, data, mesaj) si sunt standardul pentru release-uri software in Git."
  },
  {
    id: "devops-40",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: .gitignore si eliminarea fisierelor deja comise",
    question: "De ce adaugarea unui fisier in .gitignore nu functioneaza daca fisierul a fost deja comis in trecut si cum se repara?",
    answer: "Mecanismul intern Git:\nFisierul .gitignore opreste Git din a urmari DOAR fisierele netrack-uite (untracked files).\nDaca un fisier a fost adaugat cu git add si comis candva in trecut (ex: un fisier .env sau folderul target/), Git il are deja inregistrat in \"Index\" (Staging Tree) si va continua sa urmareasca orice modificare viitoare adusa acelui fisier, ignorand complet regula din .gitignore!\n\nCum se repara:\nTrebuie sa stergi fisierul din Index-ul Git fara a-l sterge fizic de pe hard disk, folosind comanda git rm --cached.",
    codeSnippet: `# 1. Scoate fisierul din urmarirea Git (pastrandu-l pe disc):
git rm --cached .env

# Sau pentru un intreg folder:
git rm -r --cached target/

# 2. Comite stergerea din repository:
git commit -m "chore: remove tracked env file and respect gitignore"`,
    interviewTrap: "Daca ai urcat din greseala parole sau chei API pe GitHub, simplul git rm --cached nu le sterge din istoricul de commit-uri din trecut! Repository-ul inca pastreaza secretul in commit-urile vechi daca nu folosesti BFG Repo-Cleaner sau git-filter-repo.",
    keyTakeaway: "Fisierele deja urmarite de Git ignora .gitignore; ruleaza git rm --cached pentru a le elimina din index pastrand fisierele locale."
  },
  {
    id: "devops-41",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "CI/CD: Integrare Continua vs Livrare Continua vs Desfasurare Continua",
    question: "Care sunt diferentele cheie dintre Continuous Integration (CI), Continuous Delivery (CD) si Continuous Deployment (CD)?",
    answer: "Trei trepte de maturitate in automatizarea livrarii de software:\n\n1. Continuous Integration (CI):\n- Dezvoltatorii comit cod frecvent pe branch-ul comun.\n- Fiecare commit declanseaza automat un pipeline care compileaza codul, ruleaza suita de teste unitare/integrare si scaneaza calitatea (lintere, SonarQube).\n- Scop: Descoperirea rapida a bug-urilor de integrare.\n\n2. Continuous Delivery (CD):\n- Extinde CI-ul prin pregatirea si crearea automata a pachetelor de release (imagini Docker, pachete jar) gata de deploy in orice moment.\n- Deploy-ul pe mediul de productie necesita o APROBARE UMANA MANUALA (un buton de \"Approve\").\n\n3. Continuous Deployment (CD Avansat):\n- Orice modificare care trece de pipeline-ul automat de teste este lansata AUTOMAT in PRODUCTIE fara nicio interventie umana!",
    codeSnippet: `// Diferenta vizuala de flux:
// CI:                   Build -> Test -> Feedback
// Continuous Delivery:   Build -> Test -> Staging -> [Manual Approval Button] -> Productie
// Continuous Deployment: Build -> Test -> Staging -> Auto Deploy -> Productie`,
    interviewTrap: "Multe companii folosesc termenul CD insemnand \"Continuous Delivery\" (cu aprobare manuala pentru productie), nu \"Continuous Deployment\". Clarifica intotdeauna distinctia la interviu.",
    keyTakeaway: "CI testeaza codul automat; Continuous Delivery pregateste livrarea dar asteapta aprobare umana; Continuous Deployment duce codul validat direct in productie fara bariere manuale."
  },
  {
    id: "devops-42",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Etapele Fundamentale ale unui Pipeline de CI Standard",
    question: "Care sunt etapele tipice (Stages) parcurse de un pipeline de CI la deschiderea unui Pull Request?",
    answer: "Un pipeline de integrare continua bine structurat parcurge urmatoarele etape ordonate dupa durata de executie:\n\n1. Checkout: Descarca codul sursa al branch-ului.\n2. Lint & Format Check: Verifica stilul codului si erorile de sintaxa (ESLint, Checkstyle, Prettier) in cateva secunde.\n3. Build & Compile: Compileaza codul si verifica daca dependintele se descarca curat.\n4. Unit & Integration Tests: Ruleaza testele automate (JUnit, Mockito, Vitest) si genereaza rapoarte de acoperire (JaCoCo).\n5. Security & SAST Scanning: Scaneaza dependintele dupa vulnerabilitati cunoscute CVE (Trivy, OWASP Dependency-Check, Snyk).\n6. Artifact Packaging: Construieste imaginea Docker sau binarul final daca toate testele au trecut cu succes.\n7. Notification: Trimite statusul (verde/rosu) pe GitHub PR si Slack.",
    codeSnippet: `// Exemplu logic de pipeline:
// Checkout -> Lint (10s) -> Unit Tests (1m) -> Security Scan (2m) -> Docker Build (1m) -> Package Publish`,
    interviewTrap: "Fail Fast Principle: Pune intotdeauna verificarile rapide (lint, teste unitare) inaintea construirii de imagini Docker sau a testelor end-to-end lente, pentru a oferi dezvoltatorului feedback in mai putin de un minut daca ceva e gresit.",
    keyTakeaway: "Un pipeline de CI eficient respecta principiul fail-fast, testand sintaxa si logica unitara inainte de ambalarea artefactelor."
  },
  {
    id: "devops-43",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Repozitorii de Artefacte: Rolul Nexus, Artifactory si GHCR",
    question: "Ce este un depozit de artefacte (Artifact Registry) si de ce nu pastram fisierele binare (.jar, imagini Docker) direct in Git?",
    answer: "Git este optimizat pentru fisiere text si urmarirea diferentelor de linii de cod. Fisierele binare mari (app.jar, zip, imagini Docker de sute de megabytes) umfla dimensiunea bazei de date Git la fiecare commit, facand clonarea extrem de lenta.\n\nRolul unui Artifact Registry (ex: GitHub Container Registry - GHCR, Sonatype Nexus, JFrog Artifactory, AWS ECR, Docker Hub):\n1. Stocarea versiunilor imutabile ale aplicatiei gata de productie (Single Source of Truth pentru binaries).\n2. Viteza mare de descarcare prin retele optimizate pentru deploy.\n3. Scanare automata de vulnerabilitati de securitate in dependinte.\n4. Politici de retentie (stergerea automata a build-urilor vechi de peste 30 de zile).",
    codeSnippet: `# Exemplu tag si push de imagine pe GitHub Container Registry:
docker tag my-app:latest ghcr.io/sirbumihai/ats-backend:v1.0.0
docker push ghcr.io/sirbumihai/ats-backend:v1.0.0`,
    interviewTrap: "O imagine sau un binar publicat cu un anumit tag de versiune (ex: :v1.0.0) ar trebui sa fie STRICT IMUTABIL. Nu suprascrie niciodata acelasi tag de versiune cu alt continut.",
    keyTakeaway: "Depozitele de artefacte stocheaza binarul gata compilat si imaginile Docker, protejand depozitul Git de fisiere masive."
  },
  {
    id: "devops-44",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Gestionarea Secretelor in CI/CD: GitHub Secrets",
    question: "Cum injectezi chei private, parole si token-uri API intr-un pipeline CI/CD fara a le expune in codul sursa?",
    answer: "Regula de aur in DevOps:\nNICIUN SECRET (parola DB, token Docker Hub, cheie AWS) NU SE SALVEAZA IN REPOZITORIUL GIT!\n\nCum functioneaza GitHub Actions Secrets:\n1. Se adauga in setarile depozitului: Settings -> Secrets and variables -> Actions -> New repository secret (ex: DOCKER_PASSWORD).\n2. Secretele sunt criptate de GitHub in repaus si la tranzit.\n3. In fisierul de workflow YAML, secretul este referentiat ca variabila de mediu: ${{ secrets.DOCKER_PASSWORD }}.\n4. GitHub mascheaza automat valoarea secretului in consola de loguri cu caractere asterisc (***) pentru a preveni scurgerea accidentala prin comenzi echo.",
    codeSnippet: `# In .github/workflows/deploy.yml:
steps:
  - name: Login to Docker Hub
    uses: docker/login-action@v3
    with:
      username: \${{ secrets.DOCKER_USERNAME }}
      password: \${{ secrets.DOCKER_PASSWORD }}`,
    interviewTrap: "Chiar daca GitHub mascheaza secretele afisate direct, o comanda care converteste secretul in Base64 sau il afiseaza caracter cu caracter poate ocoli masca. Nu scrie scripturi care afiseaza variabilele de mediu in loguri!",
    keyTakeaway: "GitHub Secrets pastreaza datele confidentiale criptate si le injecteaza securizat la runtime ca variabile de mediu in runner."
  },
  {
    id: "devops-45",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "GitHub Actions: Structura de baza a unui fisier Workflow YAML",
    question: "Care este structura ierarhica a unui fisier de workflow in GitHub Actions (name, on, jobs, runs-on, steps, uses)?",
    answer: "Un workflow este configurat intr-un fisier YAML plasat obligatoriu in directorul .github/workflows/.\n\nIerarhia fundamentala:\n1. name: Numele workflow-ului afisat in interfata GitHub Actions.\n2. on: Evenimentul care declanseaza executia (push, pull_request, schedule cron).\n3. jobs: Suita de sarcini executate. In mod implicit, job-urile ruleaza in PARALEL (poti folosi needs: [build] pentru executie secventiala).\n4. runs-on: Mediul/sistemul de operare al masinii virtuale furnizate de GitHub (ex: ubuntu-latest, windows-latest).\n5. steps: Lista ordonata de comenzi si actiuni dintr-un job.\n6. uses vs run:\n- uses: Apeleaza o actiune comunitara predefinita gata construita (ex: actions/checkout@v4).\n- run: Executa comenzi de shell normale pe masina virtuala (ex: npm install, mvn test).",
    codeSnippet: `name: Java CI Pipeline

on:
  push:
    branches: [ "main" ]
  pull_request:
    branches: [ "main" ]

jobs:
  build-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up JDK 21
        uses: actions/setup-java@v4
        with:
          java-version: '21'
          distribution: 'temurin'

      - name: Build with Maven
        run: mvn clean verify`,
    interviewTrap: "Fisierul de workflow trebuie plasat obligatoriu in folderul .github/workflows/ (cu \"s\" la final) si sa aiba extensia .yml sau .yaml, altfel GitHub il ignora complet.",
    keyTakeaway: "GitHub Actions organizeaza automatizarea prin evenimente (on), job-uri paralele sau dependente (jobs) si pasi secventiali de executie (steps)."
  },
  {
    id: "devops-46",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "GitHub Actions: Filtrarea Declansatorilor (Branches, Paths, Tags)",
    question: "Cum configurezi un workflow sa ruleze doar cand se modifica fisiere dintr-un folder specific (paths) sau doar pe anumite branch-uri?",
    answer: "Pentru a economisi minute de executie si a nu rula pipeline-uri inutile, GitHub Actions permite filtrarea avansata a evenimentului \"on\":\n\n1. branches: Ruleaza doar cand se face push/PR pe branch-urile specificate (ex: branches: [ main, release/* ]).\n2. paths / paths-ignore: Ruleaza DOAR daca s-au modificat fisiere din acele directoare.\nExemplu clasic intr-un monorepo: Pipeline-ul de backend trebuie sa ruleze doar daca s-au schimbat fisiere in backend/**, iar daca un utilizator a modificat doar README.md sau fisiere din frontend/, pipeline-ul este sarit complet!\n3. tags: Ruleaza doar la publicarea unui tag de versiune (ex: tags: [ \"v*\" ]).",
    codeSnippet: `on:
  push:
    branches:
      - main
    paths:
      - 'backend/**'       # Ruleaza doar daca s-a schimbat cod in backend
      - '!backend/*.md'    # Exclude modificarile de documentatie din backend`,
    interviewTrap: "Daca folosesti atat paths cat si branches, AMBELE conditii trebuie indeplinite pentru ca workflow-ul sa porneasca.",
    keyTakeaway: "Filtrele pe branch-uri si directoare (paths) previn rularile inutile de pipeline si economisesc resursele de calcul CI/CD."
  },
  {
    id: "devops-47",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "GitHub Actions: Caching-ul Dependintelor pentru Build-uri Rapide",
    question: "Cum folosesti actiunile de caching in GitHub Actions pentru a nu re-descarca pachetele npm sau dependintele Maven la fiecare rulare?",
    answer: "Problema:\nFiecare job din GitHub Actions porneste intr-o masina virtuala proaspata si curata (Ephemeral VM). Fara cache, pasul npm install sau mvn compile va descarca de la zero sute de MB de librarii de pe internet la fiecare commit, facand pipeline-ul lent.\n\nSolutia moderna:\n1. Folosirea suportului integrat de cache din actiunile oficiale: actions/setup-node (cache: \"npm\") sau actions/setup-java (cache: \"maven\").\n2. GitHub calculeaza un hash pe fisierul de lock (package-lock.json sau pom.xml). Daca fisierul nu s-a schimbat, restaureaza instant folderul de dependinte salvat anterior.\n3. Reduce timpul de build cu 50-80%!",
    codeSnippet: `- name: Set up Node.js with Cache
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm' # Activeaza automat caching-ul pentru ~/.npm

- name: Install dependencies
  run: npm ci # Mult mai rapid si strict decat npm install in CI`,
    interviewTrap: "Foloseste intotdeauna npm ci (Clean Install) in CI in loc de npm install! npm ci sterge node_modules si instaleaza strict versiunile exacte din package-lock.json.",
    keyTakeaway: "Configurarea optiunii cache in setup-node si setup-java restaureaza dependintele din memorie si accelereaza masiv pipeline-ul."
  },
  {
    id: "devops-48",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "GitHub Actions: Matrix Builds",
    question: "Ce este un Matrix Build in GitHub Actions si cum te ajuta sa testezi aplicatia pe mai multe versiuni de runtime sau sisteme de operare in paralel?",
    answer: "Un Matrix Build permite definirea unei matrici de configuratii. GitHub Actions va genera automat si va rula in paralel cate un job separat pentru fiecare combinatie posibila din matrice.\n\nScenarii comune:\n1. Testarea unei biblioteci pe versiuni multiple de Java (Java 17, 21) si Node.js (18, 20, 22).\n2. Testare multi-platforma: verificarea compatibilitatii codului pe ubuntu-latest, windows-latest si macos-latest.\n3. Economie masiva de timp: toate combinatiile ruleaza simultan in paralel, nu secvential.",
    codeSnippet: `jobs:
  test-matrix:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        java-version: ['17', '21']
        node-version: ['18', '20']
    steps:
      - uses: actions/checkout@v4
      - name: Setup Java
        uses: actions/setup-java@v4
        with:
          java-version: \${{ matrix.java-version }}
          distribution: 'temurin'
      # Se vor rula 4 joburi paralele distincte!`,
    interviewTrap: "Atentie la limitele de rulare simultana (concurrency limits) din contul de GitHub; o matrice prea mare (ex: 3 OS x 4 versiuni Java x 3 baze de date = 36 joburi) poate bloca coada de asteptare.",
    keyTakeaway: "Matrix builds testeaza automat aplicatia pe combinatii multiple de versiuni si sisteme de operare in mod concurent."
  },
  {
    id: "devops-49",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "GitHub Actions: Environments si Approval Gates pentru Productie",
    question: "Cum configurezi un pas de aprobare manuala (Manual Approval Gate) inainte de lansarea codului in mediul de productie folosind GitHub Environments?",
    answer: "In scenariile de Continuous Delivery, codul ajunge automat pe mediul de Test / Staging, dar deploy-ul in Productie trebuie sa aiba o bariera de validare umana (Quality Assurance sau Tech Lead sign-off).\n\nConfigurare cu GitHub Environments:\n1. Creezi un mediu numit \"production\" in Settings -> Environments.\n2. Configurezi \"Required reviewers\": specifici persoanele sau echipele care au dreptul sa aprobe deploy-ul.\n3. In fisierul YAML asociezi jobul de deploy cu acel mediu: environment: production.\n4. Cand pipeline-ul ajunge la acel job, executia se PAUZEAZA automat. Persoanele desemnate primesc o notificare si trebuie sa apese pe butonul \"Review deployments -> Approve and deploy\".",
    codeSnippet: `jobs:
  deploy-prod:
    needs: [test-and-build]
    runs-on: ubuntu-latest
    environment:
      name: production # Activeaza regulile de protectie si aprobare manuala
      url: https://ats-tracker.com
    steps:
      - name: Deploy to Cloud
        run: ./deploy-to-k8s.sh`,
    interviewTrap: "Daca mediul contine secrete specifice (Environment Secrets, ex: cheia de AWS din productie), acestea devin accesibile jobului DOAR DUPA ce aprobarea manuala a fost acordata!",
    keyTakeaway: "GitHub Environments ofera protectie pentru ramurile de productie prin cerinte de aprobare manuala si secrete dedicate izolate."
  },
  {
    id: "devops-50",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "SemVer (Semantic Versioning): Formatul MAJOR.MINOR.PATCH",
    question: "Ce reprezinta formatul de versionare SemVer (MAJOR.MINOR.PATCH) si cand se incrementeaza fiecare numar?",
    answer: "Semantic Versioning (SemVer) este standardul universal de versionare a pachetelor software si a release-urilor (ex: 2.4.1):\n\n1. MAJOR (prima cifra - 2.x.x):\n- Se incrementeaza cand introduci modificari incompatibile cu versiunile anterioare (BREAKING CHANGES).\n- Utilizatorii care fac upgrade trebuie sa isi modifice propriul cod pentru ca vechile metode sau API-uri nu mai functioneaza.\n\n2. MINOR (a doua cifra - x.4.x):\n- Se incrementeaza cand adaugi functionalitati noi (features) care pastreaza compatibilitatea deplina cu versiunile anterioare (Backward-Compatible).\n\n3. PATCH (a treia cifra - x.x.1):\n- Se incrementeaza cand rezolvi bug-uri (bug fixes) fara a adauga functionalitati noi si pastrand compatibilitatea.\n\nVersiuni pre-release: pot fi urmate de o liniuta (ex: 1.0.0-alpha.1, 1.0.0-rc.2).",
    codeSnippet: `// Exemple de tranzitie SemVer:
// 1.0.0 -> Lansare initiala stabila
// 1.0.1 -> Reparare bug minor la validare email (PATCH)
// 1.1.0 -> Adaugare modul nou de statistici PDF (MINOR)
// 2.0.0 -> Stergere rute vechi din API / Schimbare structura DB (MAJOR)`,
    interviewTrap: "Orice versiune sub 1.0.0 (ex: 0.1.0) este considerata de SemVer ca fiind in dezvoltare initiala si instabila; orice modificare poate fi breaking change.",
    keyTakeaway: "MAJOR semnaleaza breaking changes, MINOR aduce noi functionalitati compatibile, iar PATCH rezolva bug-uri."
  },
  {
    id: "devops-51",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Ce este si ce probleme rezolva orchestrarea de containere?",
    question: "Ce este Kubernetes (K8s) si de ce simplul Docker nu este suficient pentru a rula aplicatii la scara in productie?",
    answer: "Docker este excelent pentru a rula un container pe un singur server. Insa intr-un sistem de productie real cu sute de microservicii distribuite pe zeci de servere fizice/cloud apar provocari complexe:\n- Daca un container sau un intreg server pica in mijlocul noptii, cine il reporneste automat pe alt server disponibil?\n- Cum faci scalare automata (de la 2 la 20 de instante) cand traficul explodeaza de Black Friday?\n- Cum actualizezi aplicatia la o versiune noua fara nicio secunda de downtime?\n- Cum imparti traficul intre mai multe instante ale aceluiasi serviciu?\n\nKubernetes (K8s) este o platforma open-source de orchestrare a containerelor care automatizeaza desfasurarea, scalarea, autoregenerarea (Self-Healing) si gestionarea retelei pentru aplicatii containerizate pe clustere intregi de masini.",
    codeSnippet: `// Rolurile cheie Kubernetes:
// 1. Service Discovery & Load Balancing
// 2. Storage Orchestration (volume dinamice cloud)
// 3. Automated Rollouts & Rollbacks
// 4. Automatic Bin Packing (optimizare resurse CPU/RAM)
// 5. Self-Healing (restart automat al containerelor picate)`,
    interviewTrap: "Kubernetes nu inlocuieste Docker! Kubernetes foloseste containere (construite adesea cu Docker) si le orchestreaza pe mai multe noduri prin interfata standard CRI (Container Runtime Interface, cum ar fi containerd sau CRI-O).",
    keyTakeaway: "Kubernetes gestioneaza clustere de masini, asigurand self-healing, scalare automata si zero-downtime deployments pentru containere."
  },
  {
    id: "devops-52",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Arhitectura de baza (Control Plane vs Worker Nodes)",
    question: "Care sunt componentele principale din Control Plane si de pe Worker Nodes in arhitectura unui cluster Kubernetes?",
    answer: "Un cluster Kubernetes este format din doua tipuri de noduri:\n\n1. Control Plane (Creierul clusterului):\n- kube-apiserver: Punctul central de intrare (REST API) pentru toate comenzile; valideaza si proceseaza cererile.\n- etcd: Baza de date cheie-valoare distribuita si consistenta; pastreaza intreaga stare a clusterului.\n- kube-scheduler: Decide pe care Worker Node fizic trebuie plasat fiecare Pod nou creat, in functie de resursele CPU/RAM disponibile.\n- kube-controller-manager: Ruleaza procesele de control in bucla continua (ex: Node Controller, Deployment Controller) pentru a mentine starea dorita.\n\n2. Worker Nodes (Unde ruleaza aplicatiile):\n- kubelet: Agentul care comunica cu API Server-ul si se asigura ca containerele descrise in PodSpecs ruleaza sanatoase.\n- kube-proxy: Gestioneaza regulile de retea si rutare (iptables/IPVS) pentru servicii pe fiecare nod.\n- Container Runtime: Motorul care descarca imaginile si ruleaza containerele (containerd, CRI-O).",
    codeSnippet: `// Diagrama simplificata:
// [ kubectl ] -> [ kube-apiserver ] <-> [ etcd ]
//                        ^
//        +---------------+---------------+
//        v                               v
// [ Worker Node 1 ]             [ Worker Node 2 ]
// - kubelet                     - kubelet
// - kube-proxy                  - kube-proxy
// - containerd (Pods)           - containerd (Pods)`,
    interviewTrap: "Niciun Pod de aplicatie obisnuita nu ar trebui sa ruleze pe nodurile de Control Plane (acestea au de regula Taints pentru a fi rezervate strict serviciilor interne de management ale clusterului).",
    keyTakeaway: "Control Plane gestioneaza deciziile globale ale clusterului prin apiserver si etcd, iar Worker Nodes executa sarcinile prin kubelet si container runtime."
  },
  {
    id: "devops-53",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Pod-ul (Cea mai mica unitate de executie)",
    question: "Ce este un Pod in Kubernetes si de ce K8s nu ruleaza containerele direct in mod individual?",
    answer: "Un Pod este cea mai mica si simpla unitate de calcul pe care o poti crea si gestiona in Kubernetes.\n\nCaracteristici esentiale:\n1. Un Pod infasoara unul sau mai multe containere strans legate, resurse de stocare partajate si optiuni de configurare.\n2. Toate containerele din acelasi Pod partajeaza acelasi Network Namespace: au aceeasi adresa IP de retea si pot comunica intre ele ultrarapid prin localhost:port!\n3. Partajeaza volumele de stocare montate in Pod.\n4. Pod-urile sunt EFEMERE (de unica folosinta): cand un Pod moare sau nodul se prabuseste, Pod-ul nu este reinviat pe alt nod, ci Kubernetes creeaza un Pod complet NOU, cu un nou IP.\n\nRegula de aur:\nIn 90% din cazuri, un Pod contine un singur container (aplicatia principala). Modelele multi-container sunt folosite doar pentru pattern-uri auxiliare (Sidecar).",
    codeSnippet: `apiVersion: v1
kind: Pod
metadata:
  name: backend-pod
  labels:
    app: backend
spec:
  containers:
    - name: api
      image: ats-backend:v1.0.0
      ports:
        - containerPort: 8080`,
    interviewTrap: "Nu crea Pod-uri direct in productie prin manifesturi de tip \"kind: Pod\"! Daca un Pod creat direct pica, nimeni nu il va recrea. Foloseste intotdeauna un controller precum \"Deployment\".",
    keyTakeaway: "Pod-ul este unitatea atomica din K8s ce gazduieste containere conexe care partajeaza aceeasi adresa IP (localhost) si volume de stocare."
  },
  {
    id: "devops-54",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Pattern-ul Pod Sidecar",
    question: "Ce este un Sidecar Container intr-un Pod de Kubernetes si in ce scenarii practice este recomandat?",
    answer: "Pattern-ul Sidecar reprezinta adaugarea unui al doilea container auxiliar in interiorul aceluiasi Pod pentru a ajuta containerul principal al aplicatiei, extinzandu-i functionalitatea fara a-i modifica codul sursa.\n\nDe ce functioneaza:\nAmbele containere din Pod partajeaza aceeasi bucla localhost si pot partaja volume de fisiere locale.\n\nScenarii practice de utilizare:\n1. Logging & Metrics: Containerul principal scrie logurile intr-un fisier local partajat, iar containerul sidecar (ex: Fluentd sau Promtail) citeste fisierul si trimite logurile catre un server central (Loki / Elasticsearch).\n2. Proxy de retea & Securitate (Service Mesh): Un proxy sidecar (precum Envoy in Istio) intercepteaza tot traficul de intrare/iesire pentru a asigura criptare mutuala mTLS si rutare.\n3. Sincronizare de configuratii: Un sidecar descarca periodic certificate SSL sau configuratii reinnoite dintr-un depozit securizat.",
    codeSnippet: `apiVersion: v1
kind: Pod
metadata:
  name: app-with-sidecar
spec:
  volumes:
    - name: shared-logs
      emptyDir: {}
  containers:
    # 1. Containerul Principal
    - name: main-app
      image: my-app:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app

    # 2. Containerul Auxiliar Sidecar
    - name: log-collector
      image: fluent/fluent-bit:latest
      volumeMounts:
        - name: shared-logs
          mountPath: /var/log/app`,
    interviewTrap: "Containerele din acelasi Pod nu pot folosi acelasi port de retea! Daca ambele incearca sa asculte pe portul 8080 pe localhost, va aparea o coliziune de port.",
    keyTakeaway: "Sidecar-ul este un container secundar plasat in acelasi Pod pentru a gestiona sarcini auxiliare (logging, proxy, sincronizare) fara a incarca aplicatia principala."
  },
  {
    id: "devops-55",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Deployment vs ReplicaSet",
    question: "Care este rolul unui Deployment in raport cu un ReplicaSet in Kubernetes?",
    answer: "Relatia ierarhica:\nDeployment -> gestioneaza -> ReplicaSet -> gestioneaza -> Pods.\n\n1. ReplicaSet:\n- Are o singura responsabilitate simpla: se asigura ca un numar exact specificat de Pod-uri identice (replicas) ruleaza sanatoase in orice moment.\n- Daca un pod pica, ReplicaSet creeaza altul; daca sunt prea multe, sterge din ele.\n\n2. Deployment (Nivelul superior de abstractizare):\n- Gestioneaza actualizarea declarativa a aplicatiei (Rolling Updates) si Rollback-ul automat.\n- Cand actualizezi imaginea Docker dintr-un Deployment de la v1 la v2, Deployment-ul creeaza un NOU ReplicaSet pentru v2 si scaleaza treptat noul ReplicaSet in sus, in timp ce scaleaza vechiul ReplicaSet pentru v1 in jos, asigurand tranzitia fara downtime!",
    codeSnippet: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 3 # Mentine garantat 3 pod-uri active
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: api
          image: ats-backend:v1.2.0`,
    interviewTrap: "In activitatea zilnica nu creezi niciodata obiecte de tip ReplicaSet manual! Lucrezi exclusiv cu Deployment-ul, iar acesta gestioneaza automat crearea si comutarea ReplicaSet-urilor in fundal.",
    keyTakeaway: "Deployment-ul ofera management declarativ al versiunilor si actualizari fara downtime, coordonand crearea si stergerea ReplicaSet-urilor."
  },
  {
    id: "devops-56",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Strategii de Deployment (RollingUpdate vs Recreate)",
    question: "Cum difera strategiile de deployment RollingUpdate si Recreate in Kubernetes si ce reprezinta parametrii maxSurge si maxUnavailable?",
    answer: "Strategii de actualizare definite in spec.strategy:\n\n1. RollingUpdate (Implicita - Zero Downtime):\n- Inlocuieste treptat pod-urile vechi cu pod-uri noi, garantand ca aplicatia ramane disponibila continuu pentru utilizatori.\n- maxSurge: Numarul sau procentul maxim de pod-uri create peste numarul tinta de replici in timpul actualizarii (ex: la replicas: 4 si maxSurge: 25%, pot rula maxim 5 pod-uri simultan).\n- maxUnavailable: Numarul maxim de pod-uri vechi care pot fi oprite in timpul procesului de update (ex: maxUnavailable: 0 garanteaza ca nu se pierde nicio instanta inainte ca cea noua sa fie gata).\n\n2. Recreate (Cu Downtime):\n- Opreste si sterge TOATE pod-urile vechi existente inainte de a porni pod-urile din noua versiune.\n- Creeaza o perioada scurta de indisponibilitate a serviciului (downtime).\n- Folosita DOAR cand doua versiuni diferite ale aplicatiei nu pot rula simultan (ex: modificari incompatibile in schema bazei de date).",
    codeSnippet: `spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # Permite maxim 1 pod suplimentar in timpul update-ului
      maxUnavailable: 0  # Niciun pod nu este oprit pana cand noul pod nu este sanatos!`,
    interviewTrap: "Pentru ca RollingUpdate sa functioneze cu adevarat fara downtime, aplicatia ta trebuie sa aiba configurat un Readiness Probe! Fara probe, K8s va trimite trafic catre noul pod imediat ce containerul porneste, inainte ca Java/Spring Boot sa fie gata.",
    keyTakeaway: "RollingUpdate inlocuieste pod-urile treptat fara downtime controlat prin maxSurge si maxUnavailable, pe cand Recreate le opreste pe toate inainte de lansare."
  },
  {
    id: "devops-57",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Service Type ClusterIP",
    question: "Ce este un Kubernetes Service de tip ClusterIP si cand este folosit?",
    answer: "ClusterIP este tipul IMPLICIT (default) de Service in Kubernetes.\n\nCe face:\n1. Aloca o adresa IP virtuala stabila si interna clusterului (accesibila DOAR din interiorul clusterului K8s).\n2. Ofera un nume DNS intern stabil (ex: postgres-service).\n3. Distribuie traficul (Load Balancing) catre toate Pod-urile sanatoase identificate de selectorul de etichete (selector: app: postgres).\n\nCand se foloseste:\nPentru toate serviciile interne care NU trebuie sa fie expuse direct pe internetul public: baze de date, servere Redis, microservicii interne de procesare asincrona sau plati.",
    codeSnippet: `apiVersion: v1
kind: Service
metadata:
  name: postgres-service
spec:
  type: ClusterIP # Tipul implicit (poate fi omis)
  selector:
    app: postgres
  ports:
    - port: 5432
      targetPort: 5432`,
    interviewTrap: "Daca incerci sa accesezi IP-ul unui ClusterIP din browserul de pe laptopul tau de acasa, conexiunea va esua! ClusterIP functioneaza strict in interiorul retelei clusterului.",
    keyTakeaway: "ClusterIP creeaza o adresa IP si un nume DNS privat intern clusterului pentru comunicarea sigura intre microservicii."
  },
  {
    id: "devops-58",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Service Type NodePort",
    question: "Cum functioneaza un Service de tip NodePort si in ce interval de porturi este restrictionat?",
    answer: "NodePort extinde functionalitatea ClusterIP prin expunerea serviciului pe un port static dedicat pe FIECARE Worker Node fizic din cluster.\n\nIntervalul standard de porturi:\nEste restrictionat implicit in intervalul 30000 - 32767.\n\nCum functioneaza fluxul:\nDaca deschizi portul 31234 pe un serviciu NodePort, poti accesa aplicatia trimitand o cerere catre <IP-ul-Oricarui-Nod>:31234. Nodul respectiv (prin kube-proxy) va redirectiona automat cererea catre un Pod sanatos din cluster.\n\nCand se foloseste:\n- In medii locale de test (Minikube, Kind, k3s).\n- Cand ai deja un Load Balancer extern hardware propriu in datacenter care directioneaza traficul spre porturile nodurilor.",
    codeSnippet: `apiVersion: v1
kind: Service
metadata:
  name: web-nodeport
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
    - port: 80         # Portul intern al serviciului
      targetPort: 80   # Portul din container
      nodePort: 30080  # Portul deschis pe fiecare masina fizica din cluster`,
    interviewTrap: "Daca un nod fizic isi schimba adresa IP sau pica, clientul care se conecta la acel IP va pierde conexiunea. De aceea NodePort este rar folosit direct in productie pe internet.",
    keyTakeaway: "NodePort deschide un port static intre 30000-32767 pe fiecare nod al clusterului pentru acces extern direct."
  },
  {
    id: "devops-59",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Service Type LoadBalancer",
    question: "Ce se intampla cand creezi un Service de tip LoadBalancer intr-un cluster Kubernetes gazduit in Cloud (AWS / GCP / Azure)?",
    answer: "Service-ul de tip LoadBalancer este standardul pentru a expune direct un serviciu pe internet intr-un mediu de Cloud Gestionat (Managed Kubernetes: AWS EKS, GCP GKE, Azure AKS).\n\nCe face automat furnizorul de Cloud:\n1. Cand aplici manifestul cu type: LoadBalancer, controller-ul cloud al clusterului detecteaza resursa.\n2. Provisioneaza automat un Load Balancer extern real din infrastructura cloud (ex: AWS Network Load Balancer / Classic ELB sau GCP Cloud Load Balancing).\n3. Ii asociaza o adresa IP publica externa sau un nume DNS public.\n4. Configureaza automat rutele catre nodurile clusterului pe un NodePort intern.\n5. Ofera adresa IP publica in campul status.loadBalancer.ingress.",
    codeSnippet: `apiVersion: v1
kind: Service
metadata:
  name: public-api-service
spec:
  type: LoadBalancer
  selector:
    app: api-gateway
  ports:
    - port: 80
      targetPort: 8080`,
    interviewTrap: "Fiecare Service de tip LoadBalancer creeaza un echipament Load Balancer dedicat in contul tau de Cloud, iar furnizorii de cloud te taxeaza lunar pentru fiecare Load Balancer creat! Pentru a ruta 20 de servicii diferite printr-un singur IP/echipament, se foloseste un Ingress Controller.",
    keyTakeaway: "type: LoadBalancer comanda automat crearea unui Load Balancer extern cu IP public in cloud-ul furnizorului."
  },
  {
    id: "devops-60",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Service DNS Discovery (Formatul numelui DNS)",
    question: "Cum descopera si apeleaza un Pod un alt serviciu din cluster prin DNS si care este formatul complet al numelui (FQDN)?",
    answer: "In Kubernetes, serviciul intern CoreDNS rezolva automat numele fiecarui Service intr-o adresa IP stabila.\n\nFormatul complet FQDN (Fully Qualified Domain Name):\n<service-name>.<namespace>.svc.cluster.local\n\nNivele de rezolutie:\n1. In acelasi Namespace: Un Pod poate apela serviciul direct dupa numele sau scurt: http://postgres-service:5432.\n2. Dintr-un alt Namespace: Trebuie specificat namespace-ul: http://postgres-service.database:5432.\n3. Numele complet FQDN: http://postgres-service.database.svc.cluster.local:5432 functioneaza garantat de oriunde din intregul cluster.",
    codeSnippet: `# In configuratia Spring Boot application.yml:
spring:
  datasource:
    # Rezolutie DNS interna automata prin K8s CoreDNS:
    url: jdbc:postgresql://postgres-service.database.svc.cluster.local:5432/appdb`,
    interviewTrap: "Pod-urile au adrese IP dinamice care se schimba la fiecare restart! Nu te conecta NICIODATA la adresa IP a unui Pod individual; conecteaza-te intotdeauna la numele DNS al Service-ului asociat.",
    keyTakeaway: "CoreDNS traduce automat numele serviciilor in IP-uri stabile, permitand comunicarea eleganta prin adrese logice de tip service.namespace."
  },
  {
    id: "devops-61",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Ingress si Ingress Controller",
    question: "Ce este un Ingress in Kubernetes, cum difera fata de un Service si cum ruteaza traficul HTTP bazat pe cale (path) si domeniu (host)?",
    answer: "Diferenta esentiala:\n- Service: Lucreaza la Layer 4 (TCP/UDP); expune porturi brute.\n- Ingress: Este o resursa Layer 7 (HTTP/HTTPS) care defineste reguli avansate de rutare a traficului din exterior catre serviciile interne ale clusterului.\n\nComponente necesare:\n1. Ingress Resource: Fisierul manifest YAML in care declari regulile: \"Daca cererea vine pe api.site.com trimite la api-service; daca vine pe /auth trimite la auth-service\".\n2. Ingress Controller: Programul care implementeaza fizic regulile (cel mai popular fiind Ingress-Nginx, Traefik sau AWS ALB Ingress Controller). Fara un controller instalat in cluster, declaratia Ingress nu face nimic!\n\nAvantaje majore:\n- Un singur IP extern public si un singur Load Balancer Cloud pentru zeci de microservicii.\n- Gestionarea facila a certificatelor SSL/TLS (integrare cu Let's Encrypt prin cert-manager).",
    codeSnippet: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
spec:
  rules:
    - host: ats-tracker.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service:
                name: backend-service
                port:
                  number: 8080
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80`,
    interviewTrap: "Ingress este doar o fisa de reguli (declaratie). Trebuie sa ai un Ingress Controller pornit in cluster care sa asculte acele reguli si sa configureze serverul proxy!",
    keyTakeaway: "Ingress ofera rutare HTTP inteligenta bazata pe domeniu si cale URL, unificand accesul catre servicii multiple printr-un singur punct de intrare."
  },
  {
    id: "devops-62",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: ConfigMaps pentru separarea configuratiilor",
    question: "Ce este un ConfigMap in Kubernetes si prin ce metode poate fi injectat intr-un Pod?",
    answer: "Un ConfigMap stocheaza date de configurare non-confidentiale sub forma de perechi cheie-valoare, respectand principiul 12-Factor App de separare a codului de configuratii.\n\nModalitati de injectare in Pod:\n1. Ca variabile de mediu individuale (valueFrom.configMapKeyRef).\n2. Incarcarea tuturor cheilor ca variabile de mediu simultan (envFrom.configMapRef).\n3. Montat ca volum de fisiere (Volume Mount): Fiecare cheie din ConfigMap devine un fisier pe disc, iar valoarea devine continutul fisierului (ideal pentru fisiere de configurare mari precum application.yml sau nginx.conf).",
    codeSnippet: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  APP_ENV: "production"
  MAX_PAGE_SIZE: "50"

# In Pod:
# spec.containers[0].envFrom:
#   - configMapRef:
#       name: app-config`,
    interviewTrap: "Daca modifici un ConfigMap montat ca variabile de mediu, variabilele din containerele aflate deja in executie NU se actualizeaza! Pod-urile trebuie restartate (rollout restart) pentru a citi noile valori.",
    keyTakeaway: "ConfigMaps pastreaza configuratiile non-secrete separate de imaginile de containere, putand fi injectate ca variabile de mediu sau fisiere montate."
  },
  {
    id: "devops-63",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Secrets si limitarile de securitate ale codificarii Base64",
    question: "Ce este un Kubernetes Secret, cum difera fata de un ConfigMap si de ce codificarea Base64 NU inseamna criptare?",
    answer: "Kubernetes Secrets sunt destinate pastrarii informatiilor sensibile: parole de baze de date, token-uri API, chei SSH sau certificate TLS.\n\nIluzia securitatii Base64:\nIn mod implicit, datele dintr-un Secret din manifestul YAML sunt doar codificate in BASE64 (ex: \"admin123\" devine \"YWRtaW4xMjM=\").\nBase64 NU ESTE CRIPTARE! Oricine are acces la manifest sau comanda kubectl get secret poate decodifica textul in clar instantaneu folosind simplu comanda echo <text> | base64 -d.\n\nCum se securizeaza corect in productie:\n1. Activarea \"Encryption at Rest\" in etcd cu chei de criptare KMS (AWS KMS, HashiCorp Vault).\n2. Restrictii stricte de acces prin RBAC (Role-Based Access Control).\n3. Utilizarea unor solutii externe dedicate: HashiCorp Vault sau Sealed Secrets.",
    codeSnippet: `# Creare rapida a unui secret direct din CLI fara a lasa urme in fisiere:
kubectl create secret generic db-credentials \\
  --from-literal=username=postgres \\
  --from-literal=password=SuperSecretPassword123`,
    interviewTrap: "Nu comite niciodata fisiere secret.yaml cu valori Base64 in depozitul Git! Base64 este usor de inversat de orice atacator.",
    keyTakeaway: "Secrets izoleaza datele confidentiale; retine ca Base64 este doar o codificare si necesita criptare reala in etcd pentru securitate autentica."
  },
  {
    id: "devops-64",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Resource Requests vs Limits (CPU si Memorie)",
    question: "Care este diferenta dintre requests si limits pentru CPU si memorie intr-un Pod si ce se intampla cand o aplicatie depaseste aceste valori?",
    answer: "Configurarea resurselor asigura stabilitatea clusterului si utilizarea eficienta a hardware-ului:\n\n1. requests (Minim garantat / Rezervat):\n- Cantitatea minima de CPU si memorie de care containerul are nevoie garantat pentru a rula.\n- kube-scheduler foloseste strict valoarea din \"requests\" pentru a decide pe ce nod fizic incape Pod-ul. Daca niciun nod nu are suficiente resurse libere pentru request, Pod-ul ramane in starea Pending!\n\n2. limits (Plafon maxim admisibil):\n- Cantitatea maxima absoluta pe care containerul o poate consuma vreodata.\n\nCe se intampla la depasirea limitei:\n- CPU: CPU este o resursa compresibila. Daca aplicatia atinge limita de CPU, procesul NU este oprit, ci este \"incetinit\" (CPU Throttling).\n- Memorie (RAM): Memoria este o resursa necompresibila! Daca containerul depaseste memoria din \"limits\", kernelul Linux il UCIDE IMEDIAT prin OOMKilled (Exit Code 137).",
    codeSnippet: `resources:
  requests:
    memory: "256Mi" # 256 Megabytes rezervati
    cpu: "250m"     # 0.25 nuclee CPU (250 millicores)
  limits:
    memory: "512Mi" # Daca depaseste 512Mi -> OOMKilled!
    cpu: "500m"     # Plafon la 0.5 nuclee CPU (throttling)`,
    interviewTrap: "Daca setezi limits fara requests, Kubernetes seteaza automat requests egal cu limits. Daca nu setezi deloc limits, un Pod cu memory leak poate consuma toata memoria nodului, destabilizand toate celelalte aplicatii!",
    keyTakeaway: "requests dicteaza plasarea pod-ului de catre scheduler; depasirea limitei de CPU produce throttling, iar depasirea limitei de memorie declanseaza OOMKilled."
  },
  {
    id: "devops-65",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: OOMKilled (Exit Code 137) si Depanarea Memoriei",
    question: "Ce inseamna cand un Pod este terminat cu statusul OOMKilled si Exit Code 137 si cum remediezi problema?",
    answer: "Ce inseamna:\nOOMKilled inseamna \"Out Of Memory Killed\". Exit Code 137 este compus din codul standard Linux 128 + Semnalul 9 (SIGKILL) = 137.\nIndica faptul ca procesul din container a incercat sa aloce mai multa memorie RAM decat limita stabilita in spec.resources.limits.memory sau ca nodul fizic a ramas complet fara memorie libera.\n\nPasi de investigatie si remediere:\n1. Verifici cu kubectl describe pod <name> si cauti evenimentul \"OOMKilled: true, Exit Code: 137\".\n2. Analizezi profilul aplicatiei: este vorba despre o scurgere de memorie (Memory Leak in cod) sau pur si simplu limita alocata este prea mica pentru cerintele aplicatiei?\n3. In aplicatii Java/Spring: ajustezi optiunile JVM (-XX:MaxRAMPercentage=75.0) astfel incat JVM Heap-ul sa nu depaseasca limita containerului.\n4. Mareste limita de memorie in manifestul YAML.",
    codeSnippet: `# Comanda de identificare a cauzei terminarii:
kubectl describe pod backend-6b8f7d-4xz | grep -A 3 "Last State"
# Iesire tipica:
# Last State: Terminated
#   Reason: OOMKilled
#   Exit Code: 137`,
    interviewTrap: "In aplicatiile Java vechi (Java 8 inainte de update-uri), JVM nu stia ca ruleaza intr-un container si citea memoria intregii masini gazda (ex: 64GB) in loc de limita containerului (512MB), alocand un heap urias si declansand OOMKilled instant!",
    keyTakeaway: "Exit code 137 / OOMKilled arata ca procesul a depasit limita fizica de memorie RAM permisa si a fost oprit fortat de kernel."
  },
  {
    id: "devops-66",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Liveness Probe vs Readiness Probe",
    question: "Care este diferenta critica dintre Liveness Probe si Readiness Probe si de ce lipsa lui Readiness Probe cauzeaza downtime la deploy?",
    answer: "Mecanismele de verificare a sanatatii (Health Checks) din K8s:\n\n1. Liveness Probe (Sunt viu?):\n- Verifica daca aplicatia ruleaza sanatoasa sau este blocata complet (Deadlock, bucla infinita).\n- Daca Liveness Probe esueaza de un numar stabilit de ori (failureThreshold), Kubernetes REPORNESTE (omoara si recreaza) containerul!\n\n2. Readiness Probe (Sunt gata sa primesc clienti?):\n- Verifica daca aplicatia a terminat initializarea si este gata sa primeasca cereri HTTP (a stabilit conexiunea cu baza de date, a incarcat datele in cache).\n- Daca Readiness Probe esueaza, Kubernetes NU reporneste containerul! In schimb, SCOATE POD-UL DIN SERVICE (nu ii mai trimite trafic de la clienti).\n\nDe ce este critica distinctia:\nLa lansarea unui nou pod Spring Boot, aplicatia are nevoie de 20 de secunde sa porneasca. Fara Readiness Probe, K8s trimite cereri reale catre pod in prima secunda, rezultand mii de erori HTTP 502/503 pentru utilizatori!",
    codeSnippet: `readinessProbe:
  httpGet:
    path: /actuator/health/readiness
    port: 8080
  initialDelaySeconds: 15
  periodSeconds: 5

livenessProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  initialDelaySeconds: 30
  periodSeconds: 10`,
    interviewTrap: "Nu pune verificari ale bazei de date sau ale serviciilor externe in Liveness Probe! Daca baza de date pica temporar, Liveness Probe-ul va esua si va reporni continuu toate pod-urile backend-ului, agravand problema printr-o furtuna de reporniri.",
    keyTakeaway: "Liveness Probe reporneste containerul cand este blocat; Readiness Probe controleaza daca pod-ul primeste trafic de la Service."
  },
  {
    id: "devops-67",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Startup Probe pentru Aplicatii cu Pornire Lenta",
    question: "Ce este un Startup Probe si cum rezolva problema aplicatiilor mari (cum ar fi Spring Boot legacy) care au nevoie de minute pentru a porni?",
    answer: "Problema la aplicatiile grele:\nDaca o aplicatie complexa are nevoie de 60-90 de secunde pentru a porni la rece (migrari Liquibase, warmup de cache), configurarea unui Liveness Probe simplu creeaza o dilema: fie maresti initialDelaySeconds foarte mult (riscand ca erorile reale de runtime sa fie detectate greu), fie Liveness Probe-ul se activeaza prea devreme si omoara containerul inainte ca acesta sa apuce sa porneasca!\n\nSolutia: Startup Probe\n- Se activeaza PRIMUL la pornirea containerului.\n- Dezactiveaza temporar Liveness si Readiness Probes pana cand Startup Probe-ul raporteaza SUCCES pentru prima data.\n- Dupa ce Startup Probe trece, este oprit definitiv si predau stafeta catre Liveness si Readiness probes.",
    codeSnippet: `startupProbe:
  httpGet:
    path: /actuator/health/liveness
    port: 8080
  failureThreshold: 30 # Incearca de 30 de ori
  periodSeconds: 5      # 30 * 5s = ofera pana la 150 secunde pentru pornire!`,
    interviewTrap: "Startup Probe este special gandit pentru porniri lente; nu il folosi pe post de inlocuitor pentru optimizarea efectiva a timpului de startup din cod.",
    keyTakeaway: "Startup Probe protejeaza aplicatiile cu initializare indelungata, suspendand celelalte probe pana la finalizarea cu succes a startup-ului."
  },
  {
    id: "devops-68",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Namespaces (Izolarea Logica a Resurselor)",
    question: "Ce este un Namespace in Kubernetes si cum te ajuta sa separi mediile (dev, staging, prod) pe acelasi cluster?",
    answer: "Un Namespace reprezinta un cluster virtual in interiorul aceluiasi cluster fizic Kubernetes, oferind izolare logica pentru resurse.\n\nBeneficii principale:\n1. Separarea mediilor: Poti gazdui mediile \"development\", \"staging\" si \"testing\" in acelasi cluster fara ca resursele sa se incurce intre ele.\n2. Evitarea coliziunilor de nume: Poti avea un serviciu numit \"backend-service\" atat in namespace-ul dev, cat si in staging.\n3. Alocare de cote de resurse (Resource Quotas): Poti limita consumul maxim de memorie si CPU per namespace (ex: mediul de dev nu poate depasi 16GB RAM in total).\n4. Securitate (RBAC): Dezvoltatorii pot primi drepturi depline de editare in namespace-ul dev, dar drepturi strict read-only in production.",
    codeSnippet: `# Creare namespace nou:
kubectl create namespace development

# Listeaza pod-urile dintr-un namespace specific:
kubectl get pods -n development

# Comuta contextul implicit pe un anumit namespace:
kubectl config set-context --current --namespace=development`,
    interviewTrap: "Anumite resurse din Kubernetes sunt globale la nivel de cluster (Cluster-Scoped) si NU apartin niciunui namespace! Exemple: Nodes, PersistentVolumes, StorageClasses, Namespaces.",
    keyTakeaway: "Namespaces impart clusterul in medii logice izolate, permitand politici de securitate si cote de resurse distincte."
  },
  {
    id: "devops-69",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Comenzi Esentiale kubectl pentru Administrare si Diagnoza",
    question: "Care sunt cele mai utilizate comenzi kubectl in activitatea zilnica de DevOps pentru inspectie si depanare?",
    answer: "Comenzile esentiale pentru orice inginer:\n\n1. kubectl get pods,svc,deploy -A: Listeaza toate pod-urile, serviciile si deployment-urile din toate namespace-urile (-A).\n2. kubectl describe pod <pod-name>: CEA MAI UTILA COMANDA DE DIAGNOZA! Afiseaza starea detaliata si sectiunea finala \"Events\" unde vezi clar de ce a picat pod-ul (lipsa memorie, eroare de imagine, probe esuat).\n3. kubectl logs -f <pod-name> [-c container]: Urmareste logurile aplicatiei din pod.\n4. kubectl exec -it <pod-name> -- sh: Deschide un terminal interactiv in interiorul pod-ului.\n5. kubectl apply -f manifest.yaml: Aplica modificari declarative pe cluster.\n6. kubectl rollout restart deployment <name>: Reporneste toate pod-urile unui deployment treptat.",
    codeSnippet: `# Descarca logurile din containerul anterior inainte de prabusire:
kubectl logs <pod-name> --previous

# Port forwarding local pentru a testa un serviciu din K8s direct pe laptop:
kubectl port-forward svc/postgres-service 5432:5432`,
    interviewTrap: "Daca un Pod are multiple containere (ex: app + sidecar), comanda kubectl logs va cere explicit sa specifici numele containerului cu flag-ul -c container-name.",
    keyTakeaway: "kubectl describe si kubectl logs --previous sunt primele unelte pe care le apelezi pentru a diagnostica un pod nefunctional."
  },
  {
    id: "devops-70",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: CrashLoopBackOff vs ImagePullBackOff",
    question: "Care sunt cele mai frecvente cauze pentru starile CrashLoopBackOff si ImagePullBackOff si cum le investighezi?",
    answer: "1. ImagePullBackOff / ErrImagePull:\n- Cauza: Kubernetes nu reuseste sa descarce imaginea de container specificata.\n- Motive comune: Nume gresit de imagine sau tag inexistent (typo), depozit privat fara credentiale de acces configurate (imagePullSecrets lipsa), sau limitare de rate-limit pe Docker Hub.\n- Diagnoza: kubectl describe pod <name> va arata mesajul exact de eroare din registry.\n\n2. CrashLoopBackOff:\n- Cauza: Containerul a fost descarcat si pornit cu succes, dar procesul din interiorul sau SE PRABUSESTE IMEDIAT dupa lansare (exit cu cod diferit de 0). Kubernetes incearca sa il reporneasca, dar aplicatia pica din nou, crescand exponential timpul de asteptare intre incercari (Back-off).\n- Motive comune: Lipsa unei variabile de mediu obligatorii, eroare de conexiune la baza de date la startup, fisier de configurare invalid sau comanda de startup gresita.\n- Diagnoza: Ruleaza kubectl logs <pod-name> sau kubectl logs <pod-name> --previous pentru a vedea eroarea aruncata de aplicatie.",
    codeSnippet: `# 1. Diagnostic rapid ImagePull:
kubectl describe pod broken-pod | grep -i "Failed to pull"

# 2. Diagnostic CrashLoop:
kubectl logs broken-pod --previous`,
    interviewTrap: "Intr-un CrashLoopBackOff, containerul este oprit, asa ca o comanda kubectl exec -it in el va esua! Informatiile vitale se afla strict in kubectl logs --previous si describe.",
    keyTakeaway: "ImagePullBackOff indica o problema la descarcarea imaginii Docker; CrashLoopBackOff indica o eroare interna in cod la initializarea aplicatiei."
  },
  {
    id: "devops-71",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Horizontal Pod Autoscaler (HPA)",
    question: "Ce este Horizontal Pod Autoscaler (HPA) in Kubernetes si ce conditie obligatorie trebuie indeplinita in manifestul Pod-ului pentru a functiona?",
    answer: "Horizontal Pod Autoscaler (HPA) ajusteaza automat numarul de replici ale unui Deployment (scalare pe orizontala) in functie de incarcarea resurselor (utilizare CPU, memorie sau metrici custom).\n\nCum functioneaza:\n1. HPA interogheaza periodic Metrics Server din cluster.\n2. Daca utilizarea medie a procesorului depaseste pragul configurat (ex: 70%), HPA scaleaza numarul de pod-uri in sus (Scale Out) pana la valoarea maxReplicas.\n3. Cand traficul scade, scaleaza treptat in jos (Scale In) pana la minReplicas.\n\nCONDITIA CRITICA OBLIGATORIE:\nPentru ca HPA sa poata calcula procentul de utilizare a resurselor, TOATE containerele din Pod TREBUIE sa aiba definit explicit campul \"resources.requests\" (in special requests.cpu)! Fara requests, HPA nu poate calcula procentul si nu va scala niciodata!",
    codeSnippet: `apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend-deployment
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70`,
    interviewTrap: "Daca clusterul nu are instalat utilitarul \"metrics-server\", comanda kubectl top nodes/pods si HPA vor returna eroare: \"Metrics API not available\".",
    keyTakeaway: "HPA adauga sau elimina pod-uri automat in functie de incarcare; functionarea sa depinde strict de declararea valorilor de resources.requests in Pod."
  },
  {
    id: "devops-72",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Tipuri de Workloads (DaemonSet vs StatefulSet vs Job)",
    question: "Cand alegem un DaemonSet, un StatefulSet sau un Job in loc de un Deployment obisnuit?",
    answer: "Kubernetes ofera controlere specializate pentru diferite tipuri de aplicatii:\n\n1. Deployment: Pentru aplicatii STATELESS (fara stare proprie, unde orice pod poate fi inlocuit oricand de altul, ex: web APIs, frontend).\n\n2. DaemonSet:\n- Garanteaza ca exact O COPIE a Pod-ului ruleaza pe FIECARE Worker Node din cluster (daca adaugi un nod nou, pod-ul porneste automat si pe el).\n- Cazuri de utilizare: Colectare de loguri (Fluentd/Promtail), monitorizare nod (Node Exporter) sau proxy de retea.\n\n3. StatefulSet:\n- Pentru aplicatii STATEFUL (care au stare si necesita identitate de retea unica si persistenta de disc garantata, ex: baze de date PostgreSQL, Kafka, Elasticsearch).\n- Pod-urile primesc nume ordonate si stabile (db-0, db-1) si au volume de stocare dedicate (PersistentVolumeClaim Templates).\n\n4. Job & CronJob:\n- Pentru sarcini de tip \"Run to completion\" (ruleaza o data pana cand procesul se termina cu succes si se opresc).\n- CronJob: Rulare periodica programata pe baza de orar cron (ex: backup zilnic, generare de rapoarte la miezul noptii).",
    codeSnippet: `// Ghid de decizie rapida:
// Web API / Frontend           -> Deployment
// Log collector pe fiecare nod  -> DaemonSet
// Baza de date / Kafka          -> StatefulSet
// Script de backup la ora 02:00 -> CronJob`,
    interviewTrap: "Nu rula baze de date complexe intr-un Deployment standard! Folosirea unui Deployment cu multiple replici peste acelasi volum de stocare poate duce la coruperea grava a datelor.",
    keyTakeaway: "Alege Deployment pentru stateless APIs, DaemonSet pentru unelte pe fiecare nod, StatefulSet pentru baze de date cu stare si CronJob pentru sarcini planificate."
  },
  {
    id: "devops-73",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Kubernetes: Rollback unui Deployment Esuat",
    question: "Cum inspectezi istoricul lansarilor si cum faci rollback instantaneu la versiunea anterioara folosind kubectl rollout?",
    answer: "Daca o versiune noua livrata in productie arunca erori sau nu trece de verificari, Kubernetes permite revenirea instanta la versiunea anterioara functionala.\n\nComenzi esentiale de rollout:\n1. kubectl rollout status deployment/backend: Urmareste progresul lansarii curente.\n2. kubectl rollout history deployment/backend: Afiseaza lista de revizii anterioare salvate.\n3. kubectl rollout undo deployment/backend: Face ROLLBACK imediat la versiunea imediat precedenta (revizia N-1)!\n4. kubectl rollout undo deployment/backend --to-revision=2: Revine la o revizie istorica specifica.",
    codeSnippet: `# 1. Vezi istoricul reviziilor:
kubectl rollout history deployment/ats-backend

# 2. Anuleaza ultimul deploy si revino la versiunea stabila anterioara:
kubectl rollout undo deployment/ats-backend`,
    interviewTrap: "Pentru a avea mesaje clare in istoricul de rollout, obisnuieste-te sa adaugi adnotarea kubernetes.io/change-cause pe deployment sau sa rulezi kubectl cu flag-ul --record.",
    keyTakeaway: "kubectl rollout undo asigura revenirea instanta la versiunea functionala anterioara in caz de incidente in productie."
  },
  {
    id: "devops-74",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Kubernetes: Graceful Shutdown si terminationGracePeriodSeconds",
    question: "Ce etape parcurge Kubernetes la oprirea unui Pod si ce rol are terminationGracePeriodSeconds?",
    answer: "Etapele de oprire gratioasa a unui Pod:\n1. Pod-ul este marcat ca \"Terminating\" si este SCOS IMEDIAT din lista de Endpoints a Service-ului (nu mai primeste cereri noi).\n2. Daca este configurat, se executa carligul preStop (preStop hook).\n3. Kubelet trimite semnalul SIGTERM (Signal 15) containerului, informand aplicatia ca trebuie sa se opreasca.\n4. Aplicatia trebuie sa isi finalizeze cererile in curs, sa comita tranzactiile si sa inchida conexiunile deschise.\n5. Daca aplicatia nu s-a oprit dupa expirarea perioadei terminationGracePeriodSeconds (implicit 30 de secunde), Kubelet trimite brutal semnalul SIGKILL (Signal 9), fortand oprirea imediata.",
    codeSnippet: `spec:
  terminationGracePeriodSeconds: 60 # Ofera aplicatiei pana la 60 secunde pentru a termina tranzactiile lungi
  containers:
    - name: backend
      image: ats-backend:latest`,
    interviewTrap: "Daca o cerere HTTP dureaza 45 de secunde, iar terminationGracePeriodSeconds este lasat la valoarea implicita de 30 de secunde, clientul va primi o eroare de conexiune intrerupta (Broken Pipe) cand Pod-ul este omorat la secunda 30.",
    keyTakeaway: "terminationGracePeriodSeconds defineste timpul alocat aplicatiei pentru oprire gratioasa (SIGTERM) inainte de uciderea fortata prin SIGKILL."
  },
  {
    id: "devops-75",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Observabilitate: Cei 3 Piloni (Logs, Metrics, Traces)",
    question: "Care sunt \"Cei 3 Piloni ai Observabilitatii\" in sistemele moderne si ce rol specific are fiecare?",
    answer: "Pentru a intelege starea interna a unui sistem distribuit complex ne bazam pe trei tipuri de date complementare:\n\n1. Logs (Jurnale de evenimente):\n- Mesaje text cu timestamp despre evenimente specifice (\"Userul X a sters jobul Y\", \"NullPointerException in linia 42\").\n- Extrem de bogate in detalii, ideale pentru analiza cauzei radacina (Root Cause Analysis).\n\n2. Metrics (Metrice agregate):\n- Valori numerice masurate de-a lungul timpului (Time-Series Data), cum ar fi utilizarea CPU, memoria RAM, numarul de cereri pe secunda (RPS), rata de erori 5xx sau timpii de raspuns p99.\n- Ofera o vedere de ansamblu si stau la baza sistemelor de alarmare (Alerting) si a graficelor de performanta.\n\n3. Traces (Urmarire distribuita):\n- Urmaresc parcursul unei cereri utilizator de la intrarea prin API Gateway si prin toate microserviciile, bazele de date si cozile intermediare prin care trece.\n- Arata exact care microserviciu din lant cauzeaza latenta sau erori.",
    codeSnippet: `// Ce raspunde fiecare pilon:
// Metrics:  "CEVA este stricat ACUM!" (CPU e la 99%, rata de erori a crescut la 15%)
// Traces:   "UNDE este problema?" (Serviciul de Plati raspunde in 4 secunde)
// Logs:     "DE CE s-a intamplat?" (NullPointerException in PaymentGateway.java:45)`,
    interviewTrap: "Observabilitatea nu inseamna doar sa ai multe loguri. O aplicatie care scrie terabytes de loguri nestructurate dar nu are alerte bazate pe metrici este foarte greu de depanat in incidente majore.",
    keyTakeaway: "Metricile semnaleaza existenta unei probleme, Tracing-ul localizeaza serviciul vinovat, iar Logurile explica motivul tehnic exact."
  },
  {
    id: "devops-76",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Centralized Logging: ELK Stack vs Grafana Loki",
    question: "De ce este obligatorie centralizarea logurilor in containere si cum se compara ELK Stack cu Grafana Loki?",
    answer: "Problema in Cloud/K8s:\nContainerele sunt efemere; cand un Pod moare sau este inlocuit, toate logurile stocate local dispar odata cu el. In plus, este imposibil sa faci SSH pe 50 de noduri pentru a cauta o eroare.\n\n1. ELK Stack (Elasticsearch, Logstash, Kibana):\n- Elasticsearch indexeaza intregul continut al fiecarui mesaj de log (Full-Text Search).\n- Extrem de puternic pentru cautari complexe de text, dar consuma cantitati masive de memorie RAM si spatiu pe disc pentru mentinerea indecsilor.\n\n2. Grafana Loki (Abordarea moderna inspirata de Prometheus):\n- NU indexeaza textul logului! Indexeaza doar etichetele (Labels: app, namespace, environment), la fel ca Prometheus.\n- Consuma cu 80% mai putine resurse decat Elasticsearch.\n- Se integreaza perfect in tablourile de bord Grafana existente, folosind limbajul de interogare LogQL.",
    codeSnippet: `# Interogare simpla in LogQL (Grafana Loki):
{app="ats-backend", namespace="production"} |= "ERROR"`,
    interviewTrap: "Daca aplici prea multe etichete dinamice unice in Loki (High Cardinality, cum ar fi userId sau IP ca label), Loki isi pierde avantajul de performanta si va consuma multa memorie.",
    keyTakeaway: "Centralizarea logurilor pastreaza istoricul dupa disparitia containerelor; Elasticsearch ofera cautare full-text avansata, iar Loki ofera consum minim de resurse."
  },
  {
    id: "devops-77",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Prometheus: Arhitectura bazata pe Pull (Scraping)",
    question: "Cum colecteaza Prometheus metricile si de ce foloseste un model de tip Pull in loc de Push?",
    answer: "Prometheus este standardul de monitorizare in ecosistemul cloud native (CNCF).\n\nModelul Pull (Scraping):\n- In loc ca fiecare aplicatie sa trimita metrice catre server (Push), serverul Prometheus interogheaza periodic (Scrape) endpoint-ul HTTP expus de aplicatie (de regula la /metrics sau /actuator/prometheus in Spring Boot).\n\nDe ce este preferat modelul Pull:\n1. Protectie impotriva supraincarcarii: Daca traficul pe aplicatie creste de 100 de ori, aplicatia nu va sufoca serverul de monitorizare cu pachete, deoarece Prometheus colecteaza datele la un ritm fix controlat (ex: din 15 in 15 secunde).\n2. Detectarea disponibilitatii: Daca Prometheus nu reuseste sa interogheze endpoint-ul unei aplicatii, stie instantaneu ca acea instanta este cazuta (down).\n\nExceptia pentru Push: Joburile scurte de procesare batch (care se termina in 2 secunde inainte ca Prometheus sa apuce sa le interogheze) folosesc Prometheus Pushgateway.",
    codeSnippet: `# Configurare simpla prometheus.yml:
scrape_configs:
  - job_name: 'spring-backend'
    scrape_interval: 15s
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['backend-service:8080']`,
    interviewTrap: "Nu expune endpoint-ul /actuator/prometheus direct pe internetul public fara autentificare, deoarece poate divulga detalii interne despre arhitectura si consumul sistemului.",
    keyTakeaway: "Prometheus foloseste modelul Pull interogand periodic endpoint-urile /metrics ale aplicatiilor, evitand suprasolicitarea sistemului de monitorizare."
  },
  {
    id: "devops-78",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Prometheus: Tipuri Fundamentale de Metrici",
    question: "Care sunt cele 4 tipuri de metrici din Prometheus (Counter, Gauge, Histogram, Summary) si cand se foloseste fiecare?",
    answer: "1. Counter (Contor cumulativ):\n- O valoare numerica ce poate DOAR SA CREASCA (sau sa se reseteze la zero la restartarea aplicatiei).\n- Cazuri de utilizare: Numarul total de cereri HTTP (http_requests_total), numarul de erori, numarul de login-uri.\n- Se analizeaza folosind functia PromQL rate() pentru a calcula viteza pe secunda.\n\n2. Gauge (Indicator variabil):\n- O valoare numerica ce poate creste sau scadea liber in timp.\n- Cazuri de utilizare: Utilizarea curenta a memoriei RAM, temperatura CPU, numarul de conexiuni active in baza de date, dimensiunea unei cozi de mesaje.\n\n3. Histogram:\n- Evalueaza distributia datelor prin esantionare in intervale prestabilite (buckets).\n- Cazuri de utilizare: Latenta cererilor HTTP sau dimensiunea raspunsurilor.\n- Permite calculul agregat precis al percentilelor (p90, p95, p99) pe mai multe instante prin functia histogram_quantile().\n\n4. Summary:\n- Calculeaza percentilul direct pe partea de client a aplicatiei (mai greu de agregat pe mai multe servere).",
    codeSnippet: `# PromQL pentru a afla cererile pe secunda dintr-un Counter:
rate(http_requests_total[5m])

# PromQL pentru a afla latenta la percentilul 95 dintr-o Histograma:
histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))`,
    interviewTrap: "Nu folosi un Gauge pentru a numara cereri HTTP si nu folosi un Counter pentru nivelul memoriei! Respectarea semanticii tipurilor este cruciala pentru corectitudinea functiilor de agregare PromQL.",
    keyTakeaway: "Counter masoara evenimente cumulative ce cresc mereu, Gauge masoara valori curente fluctuante, iar Histogram masoara durate si latente pe intervale."
  },
  {
    id: "devops-79",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Grafana: Tablouri de Bord (Dashboards) si Panouri de Vizualizare",
    question: "Ce este Grafana si cum este folosita impreuna cu Prometheus pentru monitorizarea aplicatiilor?",
    answer: "Grafana este platforma open-source de referinta pentru vizualizarea si analiza datelor metrice.\n\nCum functioneaza fluxul:\n1. Conectare Data Source: Grafana se conecteaza la surse de date precum Prometheus, Loki, CloudWatch sau PostgreSQL.\n2. Creare Dashboards: Creezi panouri vizuale compuse din grafice de tip Time-Series, Gauge-uri circulare, tabele si harti termice (Heatmaps).\n3. Interogare: Fiecare panou executa o interogare in limbajul sursei (ex: PromQL pentru Prometheus).\n4. Partajare si Alerte: Panourile pot fi partajate usor intre echipe sau exportate ca fisiere JSON reutilizabile.",
    codeSnippet: `// Arhitectura standard de observabilitate:
// Aplicatie (Micrometer) -> expune /actuator/prometheus
//               ^
//               | (Pull la 15s)
//        [ Prometheus ] -> pastreaza datele time-series
//               ^
//               | (Query PromQL)
//         [ Grafana ]   -> deseneaza graficele pentru echipa`,
    interviewTrap: "Grafana nu stocheaza ea insasi datele metrice! Grafana este doar o interfata de vizualizare (UI/Dashboard); daca baza de date Prometheus pica, Grafana nu va avea ce sa afiseze.",
    keyTakeaway: "Grafana transforma datele numerice din Prometheus in grafice si tablouri de bord intuitive pentru monitorizarea sanatatii sistemelor."
  },
  {
    id: "devops-80",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Alerting Best Practices: Cum eviti fenomenul de \"Alert Fatigue\"?",
    question: "Ce este \"Alert Fatigue\" (oboseala alertelor) si ce reguli de aur trebuie respectate la configurarea alertelor in productie?",
    answer: "Alert Fatigue apare atunci cand inginerii sunt bombardati continuu cu zeci de alerte nesemnificative, false-pozitive sau non-actionabile. In timp, echipa incepe sa ignore notificarile sau sa le puna pe \"Mute\", ceea ce duce inevitabil la ratarea unui incident critic real!\n\nReguli de aur pentru alerte sanatoase:\n1. Alerteaza pe Simptome (User-Facing Impact), nu pe Cauze interne:\n- GRESIT: Alerta daca CPU > 85% (daca utilizatorii nu sufera si latenta e mica, nu e o urgenta nocturna!).\n- CORECT: Alerta daca rata de erori HTTP 5xx > 2% sau daca latenta p95 > 2 secunde timp de 5 minute.\n2. Alertele trebuie sa fie STRICT ACTIONABILE: Daca pentru o alerta primita nu exista o actiune clara si imediata pe care inginerul o poate face, acea alerta nu trebuie sa sune telefonul la miezul noptii.\n3. Include Runbook Links: Fiecare alerta trebuie sa contina un link direct catre documentatia de rezolvare a incidentului (Runbook).\n4. Foloseste clauza \"for\": Nu declansa alerta la un spike de 1 secunda; configureaza for: 5m pentru a evita alertele provocate de fluctuatii temporare.",
    codeSnippet: `# Alerta Prometheus bine configurata:
- alert: HighHttpErrorRate
  expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100 > 5
  for: 5m # Trebuie sa persiste 5 minute pentru a nu fi un zgomot trecator
  labels:
    severity: critical
  annotations:
    summary: "Rata ridicata de erori 5xx pe serviciul backend"
    runbook_url: "https://wiki.intern/runbooks/high-error-rate"`,
    interviewTrap: "Daca trimiti toate alertele pe acelasi canal general de chat, canalul va fi rapid ignorat. Separa alertele informative (Slack) de cele critice care trezesc inginerul de garda (PagerDuty / Opsgenie).",
    keyTakeaway: "Alertele trebuie sa fie actionabile si bazate pe impactul resimtit de utilizator, avand timpi de persistenta calibrati pentru a elimina zgomotul fals-pozitiv."
  },
  {
    id: "devops-81",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Distributed Tracing: Trace ID si Span ID in Microservicii",
    question: "Cum functioneaza Distributed Tracing (Jaeger / Zipkin) si cum ajuta Trace ID-ul la depanarea unei cereri lente?",
    answer: "Intr-o arhitectura de microservicii, o singura actiune a unui utilizator poate declansa apeluri in cascada prin 10 servicii diferite (API Gateway -> Auth -> Order Service -> Payment Service -> Database).\n\nConcepte cheie:\n1. Trace ID: Un identificator unic global generat la intrarea cererii in sistem (la Gateway) si propagat prin headere HTTP (W3C TraceContext) in toate apelurile interne din retea.\n2. Span ID: Reprezinta o unitate individuala de lucru dintr-un serviciu specific (ex: executia unui query SQL sau un apel REST catre o terta parte).\n3. Vizualizare in Jaeger/Zipkin: Poti introduce Trace ID-ul si vezi o \"cascada\" grafica (Timeline Waterfall) cu durata exacta consumata de fiecare microserviciu in parte!",
    codeSnippet: `// Format standard W3C Header transmis prin retea:
// traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
//                 |----------------------------------| |--------------|
//                             Trace ID                     Span ID`,
    interviewTrap: "Daca ai microservicii asincrone care comunica prin Kafka sau RabbitMQ, asigura-te ca propagi Trace ID-ul si prin headerele mesajului din coada, altfel trasabilitatea se rupe la procesarea asincrona.",
    keyTakeaway: "Distributed Tracing coreleaza cererile prin Trace ID si Span ID, evidentiind exact unde se pierde timpul intr-o retea complexa de microservicii."
  },
  {
    id: "devops-82",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Infrastructure as Code (IaC): Declarativ vs Imperativ",
    question: "Ce este Infrastructure as Code (IaC) si care este diferenta dintre o abordare Declarativa si una Imperativa?",
    answer: "Infrastructure as Code (IaC) inseamna gestionarea si provisionarea infrastructurii IT (servere, baze de date, retele, reguli de firewall) prin intermediul fisierelor de cod si configuratie versionate in Git, in loc de click-uri manuale in console cloud.\n\n1. Abordarea Imperativa (Procedurala - \"CUM\"):* \n- Descrii pas cu pas comenzile necesare pentru a crea resursa.\n- Exemple: Scripturi Bash, AWS CLI commands (aws ec2 run-instances...).\n- Daca rulezi scriptul a doua oara, s-ar putea sa creeze inca o masina virtuala duplicat sau sa arunce eroare.\n\n2. Abordarea Declarativa (\"CE\" - Standardul Modern):\n- Descrii DOAR starea finala dorita a infrastructurii (\"Vreau un cluster K8s cu 3 noduri si un VPC\").\n- Instrumentul (ex: Terraform, Kubernetes manifests) analizeaza starea existenta si face el insusi schimbarile necesare pentru a ajunge la starea dorita.\n- Idempotenta garantata: daca starea este deja atinsa, rularea ulterioara nu modifica nimic.",
    codeSnippet: `# Declarativ (Terraform - descrie starea dorita):
resource "aws_s3_bucket" "cv_storage" {
  bucket = "ats-job-tracker-resumes"
}`,
    interviewTrap: "Abordarea declarativa este considerata de aur in DevOps deoarece permite detectarea \"drift-ului\" (situatia cand cineva a facut modificari manuale in consola cloud care nu corespund codului din Git).",
    keyTakeaway: "IaC gestioneaza serverele ca pe cod; abordarea declarativa descrie starea dorita si asigura operatii idempotente sigure."
  },
  {
    id: "devops-83",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Terraform: Conceptele de Baza (init, plan, apply, destroy)",
    question: "Care sunt pasii fundamentali in ciclul de viata al unei configuratii Terraform?",
    answer: "Terraform (creat de HashiCorp) este cel mai popular instrument open-source declarativ de IaC multi-cloud.\n\nComenzile de baza:\n1. terraform init:\n- Pasul obligatoriu de initializare. Descarca plugin-urile de provider necesare (AWS, Azure, Docker, K8s) si configureaza backend-ul de stare.\n2. terraform plan:\n- Modul \"Dry-Run\". Compara starea descrisa in codul .tf cu infrastructura reala din cloud si afiseaza un rezumat clar al modificarilor ce urmeaza a fi facute (+ create, ~ modify, - destroy).\n3. terraform apply:\n- Executa modificarile efective in cloud dupa confirmarea utilizatorului.\n4. terraform destroy:\n- Sterge toate resursele create gestionate de acea configuratie (util pentru medii temporare de test).",
    codeSnippet: `# Fluxul standard de lucru in terminal:
terraform init
terraform plan -out=tfplan
terraform apply tfplan`,
    interviewTrap: "Nu rula niciodata terraform apply -auto-approve direct in mediul de productie fara a citi cu atentie iesirea comenzii terraform plan! Risti sa stergi baze de date daca o modificare schimba un parametru care forteaza re-crearea resursei.",
    keyTakeaway: "terraform init pregateste plugin-urile, plan simuleaza modificarile in avans, iar apply materializeaza resursele in cloud."
  },
  {
    id: "devops-84",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Terraform: Importanta State File-ului si Remote Backend cu Lock",
    question: "Ce este fisierul terraform.tfstate si de ce este obligatoriu sa folosesti un Remote Backend (S3 + DynamoDB) intr-o echipa?",
    answer: "Fisierul terraform.tfstate este \"inima\" Terraform-ului: pastreaza maparea exacta dintre resursele descrise in fisierele de cod si ID-urile resurselor reale create in Cloud.\n\nDe ce stocarea locala este interzisa in echipa:\n1. Conflicte de stare: Daca doi colegi ruleaza terraform apply simultan de pe laptopuri diferite, starea se corupe si pot crea resurse duplicate sau suprascrie munca celuilalt.\n2. Securitate: State file-ul poate contine parole si secrete in clar! Daca il comiti in Git, expui secretele.\n\nSolutia standard: Remote Backend cu State Locking (ex: AWS S3 + DynamoDB):\n- Stocheaza fisierul criptat intr-un bucket S3 centralizat.\n- Foloseste un tabel DynamoDB pentru \"State Locking\": cand un inginer sau pipeline ruleaza apply, Terraform blocheaza starea (Lock), impiedicand orice alta executie simultana pana la finalizare.",
    codeSnippet: `terraform {
  backend "s3" {
    bucket         = "company-tf-state"
    key            = "prod/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "terraform-locks" # Activeaza blocarea concurenta!
  }
}`,
    interviewTrap: "Daca o executie de Terraform este intrerupta brutal (ex: picare de curent), lock-ul din DynamoDB poate ramane blocat. Deblocarea se face manual cu comanda: terraform force-unlock <lock-id>.",
    keyTakeaway: "Remote Backend-ul centralizeaza fisierul de stare in cloud, iar State Locking previne aplicarea simultana a modificarilor de catre mai multi colegi."
  },
  {
    id: "devops-85",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Ansible: Arhitectura Agentless peste SSH si Idempotenta",
    question: "Ce este Ansible, ce inseamna ca este \"Agentless\" si cum asigura idempotenta configuratiilor?",
    answer: "Ansible este un instrument open-source de automatizare si management al configuratiilor (Configuration Management).\n\nCe inseamna Agentless:\n- Spre deosebire de alte instrumente (Chef, Puppet) care necesita instalarea si mentenanta unui software agent dedicat pe fiecare server administrat, Ansible NU are nevoie de niciun agent!\n- Se conecteaza direct prin conexiuni SSH standard catre serverele tinta (definite intr-un fisier \"inventory\") si ruleaza module Python.\n\nPlaybooks si Idempotenta:\n- Configuratiile sunt descrise declarativ in fisiere YAML numite \"Playbooks\".\n- Idempotenta: Daca rulezi un playbook de 10 ori la rand, Ansible verifica starea sistemului; daca pachetul Nginx este deja instalat si configurat corect, nu va face nicio modificare (raporteaza \"ok=1, changed=0\").",
    codeSnippet: `---
- name: Configureaza serverul web Nginx
  hosts: webservers
  become: yes
  tasks:
    - name: Instaleaza pachetul nginx
      apt:
        name: nginx
        state: present # Idempotent: instaleaza doar daca lipseste

    - name: Porneste serviciul
      service:
        name: nginx
        state: started`,
    interviewTrap: "Daca folosesti modulul generic \"shell\" sau \"command\" in Ansible (ex: shell: echo \"ceva\" >> fisier.txt), pierzi garantia de idempotenta deoarece comanda se va executa orbeste la fiecare rulare. Foloseste modulele dedicate (lineinfile, copy, template).",
    keyTakeaway: "Ansible administreaza serverele fara agenti suplimentari prin simplu SSH, garantand idempotenta sarcinilor descrise in playbooks YAML."
  },
  {
    id: "devops-86",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "GitOps: Ce este si cum functioneaza ArgoCD?",
    question: "Ce reprezinta paradigma GitOps si de ce este superioara rularii comenzilor kubectl din pipeline-ul de CI?",
    answer: "GitOps este un model operational pentru aplicatii cloud native in care:\n1. Git este SINGURA SURSA A ADEVARULUI (Single Source of Truth) pentru intreaga stare dorita a sistemului.\n2. Toate fisierele manifest K8s sunt stocate intr-un repository Git.\n\nDe ce abordarea clasica (CI Push) este fragila:\nIn modelul vechi, runner-ul de GitHub Actions avea drepturi depline de admin si rula comenzi kubectl apply pe cluster. Acest lucru necesita partajarea credentialelor de cluster in CI si crea o vulnerabilitate majora.\n\nModelul GitOps Pull cu ArgoCD:\n- Un operator usor (ArgoCD) ruleaza IN INTERIORUL clusterului de Kubernetes.\n- Compara continuu starea din Git cu starea reala din cluster.\n- Cand un dezvoltator face merge la o schimbare de imagine in Git, ArgoCD detecteaza automat diferenta (\"Out of Sync\") si sincronizeaza automat clusterul (\"Sync\"), readucandu-l la starea dorita.",
    codeSnippet: `// Fluxul GitOps:
// Developer -> Git Commit (image: v2.0) -> Git Repository
//                                               ^
//                                               | (Detecteaza modificarea)
// Cluster K8s: [ ArgoCD Operator ] ------------+
//                    |
//                    v (Aplica schimbarile intern)
//             [ Pods v2.0 ]`,
    interviewTrap: "Daca cineva face o modificare manuala urgenta pe cluster cu kubectl edit, ArgoCD va detecta abaterea (Configuration Drift) si o va suprascrie automat cu ceea ce este scris in Git!",
    keyTakeaway: "GitOps foloseste Git ca sursa unica de configuratie, iar operatori precum ArgoCD sincronizeaza automat clusterul din interior."
  },
  {
    id: "devops-87",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Strategii de Deploy: Blue-Green Deployment",
    question: "Cum functioneaza strategia de Blue-Green Deployment si ce avantaje aduce pentru disponibilitate si rollback rapid?",
    answer: "Concept:\nPastrarea a doua medii de productie identice din punct de vedere hardware/arhitectural, numite \"Blue\" si \"Green\":\n\n1. Blue (Activ): Ruleaza versiunea curenta a aplicatiei (v1) si primeste 100% din traficul utilizatorilor prin Load Balancer.\n2. Green (Inactiv / Staging): Pe acest mediu se instaleaza si se testeaza in liniste noua versiune (v2).\n3. Cutover (Comutare instanta): Dupa ce toate testele de smoke pe Green trec cu succes, Load Balancer-ul sau Ingress-ul este configurat sa comute instantaneu tot traficul catre Green!\n4. Rollback in caz de dezastru: Daca apare o eroare neasteptata dupa comutare, rollback-ul se face intr-o secunda prin simpla revenire a Load Balancer-ului pe mediul Blue.",
    codeSnippet: `// Diagrama comutare Blue-Green:
//                 [ Load Balancer ]
//                        |
//       +----------------+----------------+
//       | (Trafic curent)                 | (Trafic nou dupa test)
//       v                                 v
// [ Mediu BLUE (v1) ]             [ Mediu GREEN (v2) ]`,
    interviewTrap: "Marea provocare la Blue-Green sunt bazele de date! Baza de date trebuie sa suporte ambele versiuni de cod simultan (strategia Expand & Contract), altfel comutarea rapida inapoi pe Blue va esua daca Green a modificat deja tabelele.",
    keyTakeaway: "Blue-Green permite testarea completa pe un mediu identic paralel si rollback instant prin comutarea rutarii la nivel de Load Balancer."
  },
  {
    id: "devops-88",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Strategii de Deploy: Canary Deployment",
    question: "Ce este un Canary Deployment si cum reduce riscul la lansarea de versiuni majore?",
    answer: "Originea numelui vine din practica minerilor care duceau un canar in mina pentru a detecta gazele toxice inainte ca oamenii sa fie afectati.\n\nCum functioneaza:\n1. Noua versiune a aplicatiei este lansata pe un numar foarte mic de instante (ex: 1 Pod din 10, reprezentand 10% din capacitate).\n2. Load Balancer-ul sau Service Mesh-ul trimite doar 5%-10% din traficul real de la utilizatori catre versiunea Canary, in timp ce restul de 90% continua sa foloseasca versiunea stabila.\n3. Se monitorizeaza automat metricile critice (rata de erori HTTP, latenta, consumul de memorie).\n4. Daca indicatorii sunt stabili, procentul este crescut treptat (25% -> 50% -> 100%).\n5. Daca rata de erori creste, traficul este retras instant de pe canary fara ca majoritatea utilizatorilor sa observe vreo problema.",
    codeSnippet: `# Concept rutare canary in Ingress-Nginx:
metadata:
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "10" # Trimite 10% din trafic spre canary`,
    interviewTrap: "Daca ai nevoie ca utilizatorii care nimeresc pe versiunea canary sa ramana pe ea pe toata durata sesiunii (Sticky Session), trebuie configurat un cookie specific de canary.",
    keyTakeaway: "Canary Deployment directioneaza un procent mic de trafic real spre noua versiune pentru a valida comportamentul cu risc minim in productie."
  },
  {
    id: "devops-89",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Strategii de Deploy: Rolling Deployment",
    question: "Ce este un Rolling Deployment si de ce este strategia cea mai economica din punct de vedere al resurselor hardware?",
    answer: "Rolling Deployment este strategia standard utilizata implicit in Kubernetes si multe alte platforme de orchestrare.\n\nCum functioneaza:\n- Instantele vechi ale aplicatiei sunt inlocuite TREPTAT, una cate una (sau in loturi mici de 25%), cu noile instante.\n- Exemplu cu 4 instante: Opreste Pod 1 -> Porneste Noul Pod 1 -> Asteapta sa fie sanatos -> Opreste Pod 2 -> Porneste Noul Pod 2...\n\nDe ce este economica:\nSpre deosebire de Blue-Green (care necesita dublarea completa a intregii infrastructuri si a costurilor hardware pentru a avea doua medii paralele), Rolling Deployment necesita doar 1-2 masini sau pod-uri suplimentare temporare in timpul procesului de actualizare.",
    codeSnippet: `// Tranzitia Rolling cu 3 replici:
// Pas 0: [v1] [v1] [v1]
// Pas 1: [v1] [v1] [v2] (un v1 inlocuit cu v2)
// Pas 2: [v1] [v2] [v2]
// Pas 3: [v2] [v2] [v2] (update complet finalizat fara downtime)`,
    interviewTrap: "In timpul unui Rolling Deployment, ambele versiuni (veche si noua) ruleaza SIMULTAN si impart traficul timp de cateva minute! Asigura-te ca backend-ul tau poate coexista cu versiuni diferite.",
    keyTakeaway: "Rolling Deployment actualizeaza aplicatia incremental cu consum minim de resurse suplimentare si fara intreruperea serviciului."
  },
  {
    id: "devops-90",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Nginx ca Reverse Proxy si Load Balancer (proxy_pass si upstream)",
    question: "Cum configurezi un server Nginx sa actioneze ca Reverse Proxy si sa distribuie traficul intre mai multe instante de backend?",
    answer: "Nginx este un server web de performanta ridicata utilizat frecvent ca Reverse Proxy (primeste cererile din internet si le transmite securizat catre microserviciile interne).\n\nDirective fundamentale:\n1. upstream: Defineste un grup (pool) de servere de backend catre care se va distribui traficul.\n2. proxy_pass: Redirectioneaza cererea HTTP catre blocul upstream definit.\n3. proxy_set_header: Propaga headerele originale ale clientului (cum ar fi adresa IP reala a utilizatorului si schema https) catre backend.",
    codeSnippet: `http {
  # Definirea grupului de backend-uri cu algoritm Round Robin:
  upstream backend_cluster {
    server 192.168.1.10:8080;
    server 192.168.1.11:8080;
  }

  server {
    listen 80;
    server_name api.ats-tracker.com;

    location / {
      proxy_pass http://backend_cluster;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
  }
}`,
    interviewTrap: "Daca nu adaugi headerul X-Forwarded-For in configuratia Nginx, aplicatia ta Java/Node va vedea intotdeauna ca toate cererile vin de la adresa IP a Nginx-ului (127.0.0.1), facand imposibila auditarea securitatii pe IP.",
    keyTakeaway: "Nginx foloseste upstream si proxy_pass pentru a ascunde backend-urile interne si a balansa traficul intre mai multe servere."
  },
  {
    id: "devops-91",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "SSL/TLS Termination: Ce inseamna si de ce se face la nivel de Load Balancer?",
    question: "Ce este \"SSL/TLS Termination\" (sau Offloading) si de ce este recomandat sa se faca pe Load Balancer / Nginx in loc de fiecare container individual?",
    answer: "SSL/TLS Termination reprezinta procesul prin care conexiunea securizata HTTPS (criptata prin certificat SSL) este decriptata la nivelul punctului de intrare in infrastructura (Load Balancer, Ingress sau Nginx), iar traficul intern catre microservicii se desfasoara prin HTTP simplu.\n\nBeneficii majore:\n1. Economie de CPU pe aplicatie: Criptarea si decriptarea handshake-ului TLS este costisitoare computational. Prin descarcarea acestei sarcini pe Load Balancer, aplicatiile tale backend au mai mult procesor disponibil pentru logica de business.\n2. Management centralizat al certificatelor: Ai un singur loc unde reinnoiesti certificatul SSL (ex: wildcard *.domeniu.com pe Load Balancer) in loc sa configurezi keystore-uri Java pe 50 de microservicii!\n3. Inspectie usoara a traficului intern si filtrare WAF (Web Application Firewall).",
    codeSnippet: `// Fluxul de date:
// Utilizator (Internet) ===[ HTTPS / Criptat ]===> [ Nginx / Load Balancer ]
//                                                            |
//                                                (Decriptare SSL)
//                                                            v
// Container Spring Boot <-----[ HTTP Intern ]----------------+`,
    interviewTrap: "In industriile strict reglementate (Fintech, PCI-DSS, Sanatate), poate fi ceruta criptarea \"End-to-End\" (mTLS chiar si in reteaua interna), dar pentru majoritatea aplicatiilor SSL Termination este standardul de aur.",
    keyTakeaway: "SSL Termination decripteaza traficul HTTPS la intrarea in retea, simplificand reinnoirea certificatelor si eliberand procesorul containerelor."
  },
  {
    id: "devops-92",
    category: "DEVOPS",
    difficulty: "MEDIU",
    title: "Scanarea Vulnerabilitatilor in Imagini Docker (Trivy, Docker Scout)",
    question: "De ce este obligatorie scanarea automata a imaginilor de containere in pipeline-ul CI/CD si cum folosesti Trivy?",
    answer: "Imaginile de containere contin adesea sute de pachete de sistem de operare si biblioteci open-source care pot avea vulnerabilitati de securitate cunoscute (CVE - Common Vulnerabilities and Exposures).\n\nUtilitarul Trivy (creat de Aqua Security):\n- Este un scanner open-source usor si rapid de integrat in orice pipeline CI/CD (GitHub Actions, GitLab CI).\n- Scaneaza atat pachetele OS din imagine (Alpine, Debian), cat si dependintele de limbaj (npm, Maven, pip).\n- Poate fi configurat sa OPREASCA PIPELINE-UL cu cod de eroare (exit-code 1) daca gaseste vulnerabilitati critice (CRITICAL / HIGH), prevenind trimiterea unei imagini vulnerabile in productie!",
    codeSnippet: `# Rulare Trivy local sau in CI:
trivy image --severity HIGH,CRITICAL --exit-code 1 my-app:latest`,
    interviewTrap: "Folosirea etichetelor de baza \"latest\" (ex: FROM node:latest) aduce riscul ca un build automat sa descarce o versiune noua a sistemului de operare care contine vulnerabilitati neprevazute. Foloseste tag-uri specifice si imagini minimale (Alpine, Distroless).",
    keyTakeaway: "Trivy scaneaza automat imaginile Docker dupa vulnerabilitati CVE, blocand deploy-ul daca detecteaza riscuri de securitate critice."
  },
  {
    id: "devops-93",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Prevenirea Scurgerilor de Secrete: GitLeaks si Pre-commit Hooks",
    question: "Cum previi comiterea accidentala a cheilor secrete sau parolelor in Git folosind unelte automate?",
    answer: "Odata ce o cheie secreta de productie (AWS Key, GitHub Token) a fost comisa si trimisa pe un depozit public sau privat, ea trebuie considerata COMPROMISA si revocata imediat, chiar daca stergi commit-ul ulterior.\n\nMasuri proactive de preventie:\n1. Unelte de scanare statica (GitLeaks / TruffleHog):\n- Scaneaza depozitul Git folosind tipare regex si entropie pentru a detecta automat token-uri Stripe, chei RSA, parole in fisiere .env.\n2. Pre-commit Hooks:\n- Scripturi care ruleaza pe laptopul dezvoltatorului INAINTE ca un commit sa fie creat.\n- Daca GitLeaks detecteaza un secret in staging area, blocheaza instant comanda git commit cu un mesaj clar de avertisment.",
    codeSnippet: `# Scanare rapida a intregului repository cu Gitleaks:
gitleaks detect --source . -v`,
    interviewTrap: "Nu te baza exclusiv pe pre-commit hooks de pe masina locala a dezvoltatorilor, deoarece acestea pot fi usor ocolite cu git commit --no-verify. Adauga intotdeauna un pas obligatoriu de scanare de secrete si in pipeline-ul central de CI din GitHub Actions!",
    keyTakeaway: "Uneltele precum GitLeaks blocheaza la timp introducerea accidentala a parolelor si token-urilor in istoricul de Git."
  },
  {
    id: "devops-94",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Principiul \"Immutable Infrastructure\": De ce nu facem SSH in Productie?",
    question: "Ce este principiul \"Immutable Infrastructure\" (Infrastructura Imutabila) si de ce modificarea manuala a fisierelor pe servere este un anti-pattern?",
    answer: "In trecut (\"Mutable Infrastructure\"), administratorii faceau SSH pe servere de productie pentru a edita fisiere de configurare, a actualiza pachete manual sau a aplica patch-uri rapide (hotfixes).\n\nDe ce este dezastruos (Configuration Drift):\n- Niciun coleg nu stie ce modificari s-au facut manual direct pe server.\n- Daca serverul pica sau trebuie clonat, este imposibil de recreat starea identica.\n- Discrepante mari intre mediul de Staging si Productie.\n\nPrincipiul Immutable Infrastructure (Infrastructura Imutabila):\n- Dupa ce o masina sau un container a fost creat, el NU SE MAI MODIFICA NICIODATA!\n- Daca trebuie schimbata o linie de cod sau o configuratie: modifici codul in Git, construiesti o imagine noua de container sau masina virtuala (AMI), o testezi in CI si inlocuiesti complet instanta veche cu cea noua.",
    codeSnippet: `// Model mental: "Pets vs Cattle" (Animale de companie vs Cireada)
// Vechi (Pets):   Serverele au nume unice, sunt ingrijite manual cand se strica.
// Modern (Cattle): Serverele sunt identice, numerotate; daca unul se strica, il distrugem si cream altul instant.`,
    interviewTrap: "Daca ai nevoie sa investighezi o problema urgenta in container in productie, poti inspecta logurile sau folosi ephemeral debug containers, dar nu salva modificari permanente direct pe nod.",
    keyTakeaway: "Infrastructura imutabila interzice mutatiile manuale pe servere; orice schimbare se face prin recrearea instantelor din cod versionat in Git."
  },
  {
    id: "devops-95",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Docker: Instructiunea HEALTHCHECK in Dockerfile",
    question: "Cum configurezi instructiunea HEALTHCHECK intr-un Dockerfile si ce avantaje aduce fata de un container fara healthcheck?",
    answer: "In mod standard, Docker considera ca un container este sanatos atata timp cat procesul principal (PID 1) ruleaza.\nInsa o aplicatie Java sau Node poate intra intr-un Deadlock sau o bucla infinita in care procesul ruleaza, dar nu mai raspunde la nicio cerere HTTP din retea!\n\nInstructiunea HEALTHCHECK:\nPermite specificarea unei comenzi pe care Docker Daemon o executa periodic in interiorul containerului pentru a verifica sanatatea reala a aplicatiei.\nStatusul containerului devine vizibil in docker ps ca (healthy) sau (unhealthy).",
    codeSnippet: `FROM eclipse-temurin:21-jre-alpine

WORKDIR /app
COPY target/app.jar app.jar

# Verifica din 30 in 30 de secunde daca endpoint-ul de health raspunde cu 200 OK:
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \\
  CMD wget --quiet --tries=1 --spider http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]`,
    interviewTrap: "Parametrul --start-period este crucial! Ofera aplicatiei o fereastra de timp (ex: 40 secunde) la pornire in care esecurile de health check sunt ignorate, pentru a nu marca aplicatia ca \"unhealthy\" inainte de finalizarea initializarii.",
    keyTakeaway: "HEALTHCHECK testeaza periodic starea reala de functionare a aplicatiei si marcheaza containerele blocate ca unhealthy in Docker."
  },
  {
    id: "devops-96",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Git: Gestionarea Fisierelor Mari cu Git LFS (Large File Storage)",
    question: "De ce fisierele mari (video, modele AI, baze de date SQLite) incetinesc Git-ul si cum rezolva Git LFS aceasta problema?",
    answer: "Problema:\nGit stocheaza fiecare versiune a fiecarui fisier in istoricul sau intern. Daca adaugi un fisier video de 500MB si il modifici de 3 ori, repository-ul Git va creste cu 1.5GB, iar toti colegii tai vor fi nevoiti sa descarce acesti gigabytes la fiecare git clone!\n\nSolutia: Git LFS (Large File Storage)\n- Inlocuieste fisierul masiv real din commit-ul Git cu un simplu fisier pointer text de cativa bytes (care contine doar un hash SHA-256 si dimensiunea fisierului).\n- Continutul binar real este stocat pe un server dedicat de stocare (ex: GitHub LFS, S3).\n- Cand faci checkout pe un branch, Git LFS descarca la cerere strict versiunea necesara acelui commit.",
    codeSnippet: `# 1. Instaleaza extensia:
git lfs install

# 2. Configureaza urmarirea fisierelor mari:
git lfs track "*.psd"
git lfs track "*.weights"

# 3. Comite fisierul de configurare:
git add .gitattributes
git commit -m "chore: configure git lfs for large models"`,
    interviewTrap: "Daca adaugi fisiere mari inainte de a rula git lfs track, acele fisiere raman stocate in istoricul standard de Git. Trebuie curatate cu unelte de rescriere a istoricului.",
    keyTakeaway: "Git LFS pastreaza repozitoriile usoare si rapide prin inlocuirea fisierelor mari cu pointeri usori catre un server de stocare dedicat."
  },
  {
    id: "devops-97",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Verificarea Spatiului pe Disc cu df si du",
    question: "Cum identifici rapid ce partitie este plina si ce directoare consuma cel mai mult spatiu pe un server Linux folosind df si du?",
    answer: "Cele doua comenzi complementare pentru diagnosticarea discului:\n\n1. df -h (Disk Free - Human Readable):\n- Afiseaza starea generala a tuturor partitiilor de disc montate in sistem, capacitatea totala, spatiul utilizat si spatiul liber in GB/MB.\n- Daca o partitie arata \"Use% 100%\", serverul nu mai poate scrie loguri sau porni containere noi!\n\n2. du -sh * (Disk Usage - Summary Human Readable):\n- Calculeaza spatiul exact ocupat de fisierele si folderele din directorul curent.\n- Sorteaza rezultatele descrescator pentru a gasi \"vinovatul\": du -sh * | sort -hr | head -n 10.",
    codeSnippet: `# 1. Vezi ce partitie este plina:
df -h

# 2. Gaseste top 5 cele mai mari foldere din /var/log:
cd /var/log
du -sh * | sort -hr | head -n 5`,
    interviewTrap: "Capcana fisierelor sterse dar inca deschise: Daca stergi un fisier mare de log cu rm in timp ce aplicatia inca scrie in el, spatiul pe disc NU se va elibera (df va arata tot 100%), deoarece descriptorul de fisier este inca tinut deschis de proces! Verifica cu lsof | grep deleted.",
    keyTakeaway: "df -h ofera imaginea de ansamblu a partitiilor, iar du -sh gaseste folderele specifice care consuma excesiv spatiu pe disc."
  },
  {
    id: "devops-98",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Linux: Analiza Memoriei RAM cu comanda free -h",
    question: "Cum interpretezi iesirea comenzii free -h si de ce memoria din campul \"buff/cache\" nu inseamna ca serverul este lipsit de memorie?",
    answer: "Iesirea comenzii free -h afiseaza starea memoriei fizice RAM si a spatiului Swap:\n- total: Memoria totala instalata pe server.\n- used: Memoria consumata activ de aplicatii si procese.\n- free: Memoria complet nefolosita.\n- buff/cache: Memorie folosita de nucleul Linux pentru a pastra in cache fisiere citite recent de pe disc pentru a accelera operatiile de I/O.\n- available: MEMORIA REALA DISPONIBILA pentru a porni aplicatii noi!\n\nDe ce Linux foloseste aproape tot RAM-ul:\n\"Free memory is wasted memory\" (Memoria libera este memorie irosita). Linux foloseste automat memoria RAM libera pentru buff/cache. Daca o aplicatie cere brusc memorie noua, kernelul elibereaza instant memoria din cache fara niciun impact negativ!",
    codeSnippet: `# Afiseaza memoria in format lizibil:
free -h

# Iesire tipica:
#               total        used        free      shared  buff/cache   available
# Mem:           15Gi       4.2Gi       1.1Gi       120Mi        10Gi        11Gi
# In exemplul de mai sus, serverul are 11 GB de memorie REALA disponibila, chiar daca "free" e doar 1.1GB!`,
    interviewTrap: "Priveste intotdeauna coloana \"available\", NU coloana \"free\"! Daca \"available\" este aproape de zero si \"swap used\" creste vertiginos, atunci serverul este in criza reala de memorie.",
    keyTakeaway: "Coloana \"available\" din comanda free -h indica memoria reala disponibila pentru aplicatii, iar buff/cache reprezinta cache eliberabil instantaneu de kernel."
  },
  {
    id: "devops-99",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Rollback Plan si Disaster Recovery in Pipeline-urile de CI/CD",
    question: "De ce este obligatoriu ca fiecare lansare in productie sa aiba un plan de Rollback automat si cum se implementeaza?",
    answer: "Regula de aur a fiabilitatii (Site Reliability Engineering - SRE):\n\"Oricat de bine ar fi testat codul in Staging, in Productie ceva va esua la un moment dat.\"\n\nPrincipii pentru un Rollback de succes:\n1. Automatizare: Rollback-ul nu trebuie sa depinda de comenzi manuale tastate in panica la miezul noptii; trebuie sa fie o simpla apasare de buton sau o comanda rollback automata declansata de esecul healthcheck-urilor.\n2. Viteza de executie: Revenirea la versiunea anterioara trebuie sa dureze sub 1-2 minute (prin re-directionare de trafic spre imaginea veche salvata in Artifact Registry).\n3. Compatibilitatea bazei de date: Orice migrare de schema SQL trebuie sa fie non-breaking (adaugare de coloane nullable, nu stergerea coloanelor folosite de codul vechi), altfel un rollback de cod va crapa din cauza bazei de date.",
    codeSnippet: `// Pas de Rollback automat in pipeline:
post:
  failure:
    - name: Trigger Automatic Rollback
      run: kubectl rollout undo deployment/ats-backend`,
    interviewTrap: "Daca echipa ta sterge imaginile vechi de Docker imediat dupa lansarea celor noi, nu vei avea la ce versiune stabila sa faci rollback in caz de incident critic! Pastreaza intotdeauna minim ultimele 3-5 versiuni.",
    keyTakeaway: "Fiecare deploy trebuie insotit de un plan de rollback automat rapid si compatibilitate backwards cu baza de date."
  },
  {
    id: "devops-100",
    category: "DEVOPS",
    difficulty: "USOR",
    title: "Checklist de Interviu DevOps Junior/Mid: Top 5 Reguli de Aur",
    question: "Care sunt cele mai importante 5 concepte si principii pe care orice candidat Junior/Mid trebuie sa le stapaneasca la un interviu tehnic de DevOps?",
    answer: "Sinteza celor mai importante principii DevOps:\n\n1. Imutabilitatea si Principiul \"Cattle, not Pets\": Nu face niciodata modificari manuale pe serverele de productie. Orice schimbare trece prin Git si se materializeaza prin containere sau imagini noi.\n\n2. Securitatea Secretelor si a Privilegiilor: Nu comite niciodata parole in Git; foloseste manageri de secrete. In Docker, nu rula niciodata containerele ca \"root\" (foloseste directiva USER non-root).\n\n3. Optimizarea Containerelor: Foloseste Multi-Stage builds pentru imagini compacte (Alpine) si ordoneaza instructiunile din Dockerfile astfel incat sa maximizezi Layer Caching-ul.\n\n4. Automatizare si Fail-Fast in CI/CD: Pipeline-ul trebuie sa ruleze pasii rapizi (lint, teste unitare) la inceput; livreaza artefacte versionate semaptic (SemVer) catre depozite imutabile.\n\n5. Diagnoza bazata pe Observabilitate: Intelege diferenta dintre Liveness Probe (repornire la freeze) si Readiness Probe (oprire trafic), si stapaneste comenzile de inspectie de baza: kubectl describe, docker logs, tail -f si grep.",
    codeSnippet: `// Harta mentala esentiala la interviu:
// 1. Linux & Git: Baza oricarui sistem (chmod, semnale, rebase vs merge)
// 2. Docker: Multi-stage, caching, non-root, volumes
// 3. CI/CD: Pipeline stages, GitHub Actions, secrets management
// 4. Kubernetes: Pods, Deployments, Services, Liveness/Readiness, Ingress
// 5. Observabilitate: Metrics (Prometheus), Logs (Loki/ELK), Traces (Jaeger)`,
    interviewTrap: "La interviu, recrutorii apreciaza candidatii care inteleg conceptele fundamentale de retea si permisiuni Linux mult mai mult decat pe cei care stiu doar comenzi K8s pe de rost fara sa inteleaga ce se intampla sub capota.",
    keyTakeaway: "Stapanirea temeinica a containerizarii eficiente, a pipeline-urilor de CI/CD, a ciclului de viata K8s si a diagnosticului Linux asigura succesul la interviul de DevOps."
  }
];
