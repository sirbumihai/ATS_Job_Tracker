// Deck Masiv: DevOps, Docker, Kubernetes, Linux, CI/CD & Automation
// Preluat din: bregman-arie/devops-exercises, NotHarshhaa/DevOps-Interview-Questions
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const DEVOPS_DECK = [
  {
    id: 'devops-01',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Ce este un Docker Multi-Stage Build si de ce este esential in productie?',
    question: 'Ce este un Multi-Stage Dockerfile si cum ajuta la reducerea dimensiunii imaginilor si la cresterea securitatii in containere?',
    answer: 'Un Multi-Stage Build foloseste mai multe instructiuni FROM intr-un singur Dockerfile, fiecare etapa reprezentand un mediu temporar izolat.\n\nDe ce este esential:\n1. Dimensiune minima: In primul stage (Build Stage) folosim o imagine completa cu compilatoare (Maven, JDK, Node.js, gcc) pentru a construi aplicatia. In stadiul final de productie (Runtime Stage), copiem DOAR artefactul compilat (app.jar sau dist/) intr-o imagine ultra-usoara (JRE Alpine sau Nginx Alpine).\n2. Securitate sporita: Imaginea finala din productie nu contine codul sursa complet, nici manageri de pachete (npm, maven, git), reducand suprafata de atac la vulnerabilitati CVE.\n3. Exemplu: Imaginea scade de la 800MB (JDK complet) la doar 80MB (JRE Alpine).',
    codeSnippet: `# Stage 1: Build cu Maven complet
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Productie ultra-usoara JRE
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    interviewTrap: 'Daca pui COPY . . inainte de COPY pom.xml si dependency install, Docker va invalida cache-ul la fiecare modificare minora de cod si va descarca toate dependintele din nou!',
    keyTakeaway: 'Multi-stage builds separa uneltele de compilare de mediul de rulare, reducand marimea imaginii cu pana la 90%.'
  },
  {
    id: 'devops-02',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes: Pod vs Deployment vs Service',
    question: 'Care este relatia dintre un Pod, un Deployment si un Service in arhitectura Kubernetes (K8s)?',
    answer: '1. Pod:\n   - Este cea mai mica unitate de executie din Kubernetes. Gazduieste unul sau mai multe containere strans legate care partajeaza aceeasi retea (IP localhost) si volume de stocare.\n   - Pod-urile sunt efemere: cand un pod pica, el moare si nu este reinviat; se creeaza un pod nou cu alt IP.\n\n2. Deployment:\n   - Gestioneaza ciclul de viata declarativ al Pod-urilor prin intermediul unui ReplicaSet.\n   - Asigura autoscaling, autorestart in caz de eroare (Self-Healing) si strategii de actualizare fara downtime (Rolling Updates, Rollbacks).\n\n3. Service:\n   - Ofera o adresa IP stabila si un nume DNS fix pentru un set de Pod-uri identice selectate prin etichete (labels).\n   - Actioneaza ca un Load Balancer intern intre pod-urile din spatele sau (ClusterIP, NodePort, LoadBalancer).',
    codeSnippet: `# Service directioneaza traficul catre Pod-urile cu label app=backend:
apiVersion: v1
kind: Service
metadata:
  name: backend-service
spec:
  selector:
    app: backend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080`,
    interviewTrap: 'Nu trimite niciodata trafic direct catre IP-ul unui Pod, deoarece la fiecare restart IP-ul se schimba! Foloseste mereu numele Service-ului.',
    keyTakeaway: 'Deployment gestioneaza instantele si scalarea; Service ofera punctul de intrare stabil si load balancing-ul.'
  },
  {
    id: 'devops-03',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Semnale Linux: SIGTERM vs SIGKILL si Graceful Shutdown',
    question: 'Care este diferenta dintre semnalele Linux SIGTERM (15) si SIGKILL (9) si de ce este critic ca o aplicatie Spring Boot in Docker sa suporte Graceful Shutdown?',
    answer: '1. SIGTERM (Signal 15 - Polite Termination):\n   - Este trimis de Docker/Kubernetes cand opresti un container (docker stop sau K8s scale down).\n   - Aplicatia POATE intercepta acest semnal. Spring Boot initiaza procedura de Graceful Shutdown: opreste primirea de cereri HTTP noi, lasa tranzactiile si cererile active in curs sa se termine curat, inchide conexiunile la baza de date si iese ordonat.\n\n2. SIGKILL (Signal 9 - Forced Kill):\n   - Este trimis direct de nucleul sistemului de operare (Kernel) si NU POATE fi interceptat sau ignorat de aplicatie.\n   - Procesul este ucis instantaneu in milisecunda respectiva, lasand tranzactiile DB deschise si fisierele neterminate corupte.\n\nIn Kubernetes, la oprirea unui Pod se trimite mai intai SIGTERM; daca procesul nu iese in intervalul terminationGracePeriodSeconds (implicit 30s), se trimite SIGKILL forat.',
    codeSnippet: `# Activare Graceful Shutdown in Spring Boot:
server.shutdown=graceful
spring.lifecycle.timeout-per-shutdown-phase=20s`,
    interviewTrap: 'Daca in Dockerfile folosesti ENTRYPOINT ["sh", "-c", "java -jar app.jar"], semnalul SIGTERM este trimis catre shell-ul sh, care adesea NU il transmite mai departe procesului Java, cauzand blocarea pana la SIGKILL forat! Foloseste sintaxa exec fara sh: ENTRYPOINT ["java", "-jar", "app.jar"].',
    keyTakeaway: 'Foloseste intotdeauna Graceful Shutdown pentru a preveni pierderea tranzactiilor in curs la redeploy.'
  },
  {
    id: 'devops-04',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Ce este Rolling Update vs Blue-Green vs Canary Deployment?',
    question: 'Compara cele 3 strategii majore de lansare in productie: Rolling Update, Blue-Green Deployment si Canary Deployment.',
    answer: '1. Rolling Update (Strategia implicita K8s):\n   - Inlocuieste treptat instantele vechi cu instante noi, una cate una sau in batch-uri de 25%.\n   - Nu necesita infrastructura dubla.\n   - Dezavantaj: Pe durata deploy-ului, versiunea veche si cea noua ruleaza simultan.\n\n2. Blue-Green Deployment (Zero Downtime & Instant Rollback):\n   - Mentine doua medii de productie identice: Blue (versiunea curenta activa) si Green (versiunea noua testata).\n   - Dupa testarea completa a mediului Green, routerul/load balancerul comuta 100% din trafic instant pe Green.\n   - Rollback-ul este instantaneu prin comutarea inapoi pe Blue. Necesita cost dublu de infrastructura temporara.\n\n3. Canary Deployment (Testare pe utilizatori reali):\n   - Directioneaza un procent mic de trafic real (ex: 2-5%) catre noua versiune ("canarul").\n   - Daca metricile de eroare si latenta raman bune, procentul creste treptat (25% -> 50% -> 100%). Previne impactul negativ la nivelul intregii baze de utilizatori.',
    codeSnippet: `# Ingress Canary in Kubernetes (5% trafic pe versiunea noua):
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-canary
  annotations:
    nginx.ingress.kubernetes.io/canary: "true"
    nginx.ingress.kubernetes.io/canary-weight: "5"`,
    interviewTrap: 'La Blue-Green si Canary, schema bazei de date trebuie sa fie compatibila cu AMBELE versiuni de cod simultan (Backward Compatible DB Migrations)!',
    keyTakeaway: 'Rolling pentru uz general; Blue-Green pentru tranzitii critice cu rollback instant; Canary pentru validare cu risc minim pe trafic real.'
  }
];
