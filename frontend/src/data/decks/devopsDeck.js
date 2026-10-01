// Deck Masiv: DevOps, Docker, Kubernetes, Linux, CI/CD & Automation
// Preluat din: bregman-arie/devops-exercises, NotHarshhaa/DevOps-Interview-Questions, DopplerHQ
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
  },
  {
    id: 'devops-05',
    category: 'DEVOPS',
    difficulty: 'DIFICIL',
    title: 'Arhitectura Kubernetes: Control Plane vs Worker Nodes',
    question: 'Care sunt componentele de baza ale Control Plane-ului Kubernetes (Master) si ale unui Worker Node si cum interactioneaza ele?',
    answer: '1. Control Plane (Creierul Clusterului):\n- kube-apiserver: Punctul central de intrare (REST API). Toate comenzile kubectl si componentele interne comunica EXCLUSIV prin el.\n- etcd: Baza de date distribuita de tip cheie-valoare (Key-Value Store) care stocheaza intreaga stare si configuratie a clusterului.\n- kube-scheduler: Decide pe care worker node fizic va fi programat fiecare nou Pod creat, in functie de resursele CPU/RAM libere.\n- kube-controller-manager: Bucle de control care monitorizeaza starea clusterului (NodeController, ReplicaSetController) si initiaza reparatii.\n\n2. Worker Node (Unde ruleaza aplicatiile tale):\n- kubelet: Agentul care ruleaza pe fiecare masina; primeste specificatiile Pod-ului de la API Server si instruieste motorul de containere sa porneasca containerele.\n- kube-proxy: Gestioneaza regulile de retea (iptables / IPVS) pentru rutarea traficului catre Pod-urile corecte din spatele unui Service.\n- Container Runtime: Motorul care executa fizic imaginile (containerd, CRI-O).',
    codeSnippet: `// Comanda de inspectare a starii componentelor:
kubectl get componentstatuses
kubectl get nodes -o wide`,
    interviewTrap: 'Kubelet este singura componenta de pe worker node care comunica direct cu Control Plane; containerele de aplicatie nu au acces la etcd.',
    keyTakeaway: 'Control Plane ia deciziile globale de orchestratie, iar kubelet si kube-proxy pe worker nodes le executa fidel.'
  },
  {
    id: 'devops-06',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Docker Layer Caching si Optimizarea Dockerfile',
    question: 'Cum folosesti Docker Layer Caching pentru a reduce timpul de build de la 5 minute la cateva secunde si ce rol are fisierul .dockerignore?',
    answer: 'Fiecare comanda din Dockerfile (RUN, COPY, ADD) creeaza un strat (layer) de sistem de fisiere "read-only" care este stocat in cache.\n\nOptimizare Critica a Ordinii de Copiere:\nDocker invalideaza cache-ul unui strat daca fisierele copiate s-au schimbat. Daca copiezi tot codul (COPY . .) inainte de a descarca dependintele, fiecare modificare a unui singur caracter va invalida cache-ul si va re-descarca 500 MB de librarii din nou!\n\nRegula de Aur:\n1. Copiaza MAI INTAI doar fisierul de dependinte (pom.xml sau package.json).\n2. Ruleaza descarcarea dependintelor (RUN mvn dependency:go-offline sau RUN npm install).\n3. Abia la final copiaza codul sursa (COPY src/ ./src).\n\nRolul .dockerignore: Previne copierea accidentala a folderelor gigantice locale (node_modules, target/, .git) in contextul de build, reducand dimensiunea transferata catre daemonul Docker.',
    codeSnippet: `# Dockerfile Optimizat pentru Cache:
COPY pom.xml .
RUN mvn dependency:go-offline # Cached atata timp cat pom.xml e neschimbat!

COPY src ./src # Daca schimbi codul, doar acest pas se re-ruleaza!
RUN mvn package -DskipTests`,
    interviewTrap: 'Combinarea mai multor comenzi intr-un singur RUN cu && (ex: RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*) reduce numarul de straturi si previne cresterea imaginii finale.',
    keyTakeaway: 'Plaseaza pasii rar modificati la inceputul Dockerfile-ului pentru a profita la maxim de Docker Layer Caching.'
  },
  {
    id: 'devops-07',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes ConfigMaps vs Secrets: Montare si Securitate',
    question: 'Care este diferenta dintre ConfigMaps si Secrets in Kubernetes si de ce Secrets simple codificate Base64 nu sunt securizate?',
    answer: '1. ConfigMaps: Stocheaza date de configurare non-sensibile in clar (URL-uri de baze de date, porturi, fisiere de proprietati).\n2. Secrets: Stocheaza date confidentiale (parole, chei API, certificate TLS).\n\nMitul Securitatii Base64 in K8s Secrets:\nIn mod implicit, un Secret Kubernetes este DOAR codificat in Base64 (echo -n "parola" | base64). Base64 NU ESTE CRIPTARE! Oricine are acces de citire in cluster poate decodifica parola instantaneu cu base64 -d.\n\nSecurizare Reala in Productie:\n1. Activarea "Encryption at Rest" in etcd pentru a cripta secretele stocate pe disc cu chei KMS (AES-CBC sau KMS Provider).\n2. External Secrets Operator: Sincronizeaza dinamic secretele din seifuri externe enterprise dedicate precum HashiCorp Vault, AWS Secrets Manager sau Azure Key Vault.\n\nModuri de Montare: Ca variabile de mediu (env) sau ca fisiere pe disc in volume montate.',
    codeSnippet: `apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
stringData:
  # stringData converteste automat in base64 fara comenzi manuale:
  DB_PASSWORD: "SuperSecretPassword123"`,
    interviewTrap: 'Daca montezi un Secret ca variabila de mediu, daca modifici Secretul in cluster, aplicatia NU primeste noua valoare decat dupa restartul pod-ului; secretele montate ca volume se actualizeaza automat pe disc!',
    keyTakeaway: 'Base64 este doar o codificare, nu o protectie; securizeaza secretele prin criptare etcd si HashiCorp Vault.'
  },
  {
    id: 'devops-08',
    category: 'DEVOPS',
    difficulty: 'DIFICIL',
    title: 'Kubernetes Resource Requests vs Limits si OOMKilled',
    question: 'Ce inseamna requests si limits pentru CPU si Memory si de ce apar erori OOMKilled (Exit Code 137)?',
    answer: '1. Requests (Ce are nevoie pod-ul garantat):\n- Cantitatea minima garantata de resurse rezervata pentru Pod.\n- Kube-scheduler foloseste DOAR valoarea de requests pentru a decide pe ce nod programeaza pod-ul. Daca un nod nu are suficient RAM liber pentru request, pod-ul ramane in Pending.\n\n2. Limits (Pragul maxim peste care nu poate trece):\n- CPU Limits: CPU este o resursa "compresibila". Daca pod-ul atinge limita de CPU, Kubernetes NU omoara procesul, ci ii aplica "CPU Throttling" (incetineste executia prin limitarea cotelor de timp CFS Linux).\n- Memory Limits: Memoria este o resursa "incompresibila". Daca aplicatia Java aloca memorie peste memory limit, nucleul Linux (OOM Killer) intervine imediat si OMORA procesul violent cu SIGKILL (Exit Code 137 - OOMKilled)!',
    codeSnippet: `resources:
  requests:
    memory: "512Mi"
    cpu: "250m" # 0.25 nuclee CPU
  limits:
    memory: "1Gi"   # Depasirea cauzeaza OOMKilled instantaneu!
    cpu: "1000m"  # Depasirea cauzeaza Throttling (nu restart)`,
    interviewTrap: 'In Java, daca nu setezi corect flag-urile JVM (-XX:MaxRAMPercentage=75.0), JVM-ul poate incerca sa foloseasca memoria intregului server fizic in loc de limita containerului, ducand direct la OOMKilled.',
    keyTakeaway: 'Requests garanteaza alocarea la programare; depasirea limitelor de memorie duce la OOMKilled (137), iar de CPU la throttling.'
  },
  {
    id: 'devops-09',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Horizontal Pod Autoscaler (HPA) in Kubernetes',
    question: 'Cum functioneaza Horizontal Pod Autoscaler (HPA) si cum scaleaza aplicatia pe baza de CPU, memorie sau metrici custom din Prometheus?',
    answer: 'HPA ajusteaza automat numarul de replici ale unui Deployment sau StatefulSet pe baza incarcarii curente de trafic.\n\nCum functioneaza:\n1. Controllerul HPA interogheaza periodic (la fiecare 15 secunde) API-ul Metrics Server sau Prometheus Adapter.\n2. Formula de Calcul:\nRepliche Dorite = Math.ceil(Repliche Curente * (Metric Curent / Metric Tinta))\nExemplu: Daca ai 2 pod-uri cu CPU mediu de 80%, iar tinta configurata este de 50%, HPA va scala la: 2 * (80/50) = 4 pod-uri!\n3. Scalare pe Custom Metrics: HPA poate scala pe baza ratei de cereri HTTP per secunda (RPS) sau a numarului de mesaje ramase in coada Kafka (Consumer Lag) prin intermediul KEDA (Kubernetes Event-driven Autoscaling).',
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
    interviewTrap: 'Pentru ca HPA sa poata functiona, Pod-urile TREBUIE sa aiba obligatoriu configurate resource requests in specificatia Deployment-ului; altfel HPA nu poate calcula procentul!',
    keyTakeaway: 'HPA adapteaza dinamic numarul de replici pentru a mentine incarcarea CPU sau numarul de mesaje in limite optime.'
  },
  {
    id: 'devops-10',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes Ingress vs Ingress Controller',
    question: 'Care este diferenta dintre un Ingress si un Ingress Controller si cum gestionezi certificatele HTTPS cu cert-manager?',
    answer: '1. Ingress (Resursa):\n- Este un simplu obiect declarativ de configurare Kubernetes (un manifest YAML) care descrie regulile de rutare HTTP/HTTPS (ex: daca vine pe domain.com/jobs -> trimite la service-ul jobs).\n- In sine, manifestul Ingress nu face absolut nimic daca nu exista un controller activ in cluster!\n\n2. Ingress Controller (Implementarea):\n- Este o aplicatie reala (de obicei Nginx, Traefik, HAProxy sau AWS ALB) care ruleaza in cluster si citeste continuu resursele Ingress din API Server.\n- Configureaza dinamic serverul proxy pentru a ruta traficul real din internet catre pod-urile aplicatiei.\n\n3. cert-manager cu Let\'s Encrypt:\nUn controller aditional care automatizeaza eliberarea si reinnoirea certificatelor SSL/TLS gratuite prin protocolul ACME challenge, injectand cheile direct intr-un Secret K8s.',
    codeSnippet: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: app-ingress
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
spec:
  tls:
    - hosts: ["jobs.ats.com"]
      secretName: ats-tls-secret
  rules:
    - host: jobs.ats.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: frontend-service
                port:
                  number: 80`,
    interviewTrap: 'Crearea unui manifest Ingress fara instalarea prealabila a unui Ingress Controller in cluster va lasa campul ADDRESS din Ingress gol pentru totdeauna.',
    keyTakeaway: 'Ingress defineste regulile de rutare, Ingress Controller executa proxy-ul, iar cert-manager automatizeaza HTTPS-ul.'
  },
  {
    id: 'devops-11',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes Storage: PV vs PVC vs StorageClass',
    question: 'Cum functioneaza stocarea persistenta in Kubernetes si care este rolul StorageClass in alocarea dinamica de volume?',
    answer: 'Deoarece containerele dintr-un Pod sunt efemere (toate datele se pierd la restart), bazele de date necesita volume persistente externe.\n\nTriada de Stocare K8s:\n1. PersistentVolume (PV): Resursa reala de stocare fizica din cloud (un disc AWS EBS, Google Persistent Disk sau server NFS) cu o anumita capacitate (ex: 50Gi) creata de administrator.\n2. PersistentVolumeClaim (PVC): O "cerere" de stocare facuta de un dezvoltator pentru pod-ul sau ("am nevoie de 20Gi cu acces ReadWriteOnce"). K8s cauta un PV compatibil si le leaga impreuna (Binding).\n3. StorageClass (Alocare Dinamica):\nElimina necesitatea crearii manuale de PV-uri de catre administratori! Cand un Pod cere un PVC asociat unei clase StorageClass, Kubernetes apeleaza automat API-ul cloud-ului (AWS/GCP), creeaza discul fizic instantaneu si il ataseaza pod-ului la cerere (Dynamic Provisioning).',
    codeSnippet: `apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: postgres-pvc
spec:
  accessModes:
    - ReadWriteOnce
  storageClassName: gp3 # AWS EBS gp3 StorageClass
  resources:
    requests:
      storage: 20Gi`,
    interviewTrap: 'Modul de acces ReadWriteOnce (RWO) inseamna ca volumul poate fi montat de un singur NOD fizic odata; doua pod-uri aflate pe noduri diferite nu pot partaja un disc EBS!',
    keyTakeaway: 'StorageClass automatizeaza crearea de volume fizice in cloud la cererea exprimata prin PersistentVolumeClaim.'
  },
  {
    id: 'devops-12',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Permisiuni Linux: chmod, chown, Sticky Bit si Umask',
    question: 'Ce reprezinta cifrele din comanda chmod 755 si cum calculeaza sistemul permisiunile implicite ale unui fisier nou folosind umask?',
    answer: 'In Linux, permisiunile sunt impartite in 3 categorii: Utilizator proprietar (User), Grup (Group) si Ceilalti (Others).\nFiecare categorie are 3 biti:\n- Read (r) = 4\n- Write (w) = 2\n- Execute (x) = 1\n\nchmod 755 inseamna:\n- User: 4+2+1 = 7 (rwx - citire, scriere, executie)\n- Group: 4+0+1 = 5 (r-x - citire si executie)\n- Others: 4+0+1 = 5 (r-x - citire si executie)\n\nRolul Umask (User Mask):\nDefineste permisiunile care sunt INTERZISE in mod implicit la crearea de fisiere noi.\nPermisiunea maxima pentru fisiere este 666 (rw-rw-rw-). Daca umask este 022, permisiunea implicita va fi 666 - 022 = 644 (rw-r--r--).',
    codeSnippet: `# Schimbare proprietar si grup:
chown -R appuser:appgroup /app

# Permisiuni sigure pentru cheie SSH privata:
chmod 600 ~/.ssh/id_ed25519`,
    interviewTrap: 'Daca setezi permisiuni prea lejere pe o cheie SSH (ex: chmod 777), clientul SSH va refuza conexiunea cu mesajul "Permissions are too open"!',
    keyTakeaway: 'chmod 755 pentru directoare si binare; chmod 644 pentru fisiere text; chmod 600 pentru chei private.'
  },
  {
    id: 'devops-13',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Gestionarea Proceselor in Linux: Zombie vs Orphan Processes',
    question: 'Care este diferenta dintre un proces Zombie si un proces Orfan in Linux si cum se curata fiecare din memorie?',
    answer: '1. Proces Orfan (Orphan Process):\n- Un proces al carui proces parinte a murit sau s-a inchis inainte ca procesul copil sa se fi terminat.\n- Gestionare automata: Nucleul Linux re-asigneaza automat procesul orfan catre procesul radacina init (PID 1 sau systemd). Init devine noul sau parinte si il asteapta curat la finalizare. Nu reprezinta un pericol.\n\n2. Proces Zombie (Defunct Process):\n- Un proces care s-a terminat complet si si-a eliberat toata memoria RAM, dar procesul parinte NU a apelat apelul de sistem wait() pentru a-i citi codul de iesire (exit status)!\n- In tabela de procese ramane o intrare moarta marcata cu statusul "Z" (defunct).\n- Cum se curata: Nu poti omori un proces zombie cu kill -9 (pentru ca este deja mort!). Singura metoda este sa trimiti semnalul SIGCHLD parintelui sau sa omori procesul PARINTE neglijent; odata parintele ucis, zombie-ul este adoptat de PID 1 si curatat instantaneu.',
    codeSnippet: `# Identificare procese zombie in Linux:
ps aux | awk '{ print $8 " " $2 }' | grep -E '^Z'
# Sau:
top (inspecteaza linia "0 zombie")`,
    interviewTrap: 'Un numar mare de procese zombie nu consuma memorie RAM, dar epuizeaza numarul maxim de identificatori de procese (PID exhaustion), blocand crearea de procese noi pe server.',
    keyTakeaway: 'Procesele orfane sunt adoptate de PID 1; procesele zombie sunt curatate prin semnalarea sau oprirea parintelui.'
  },
  {
    id: 'devops-14',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Comenzi Esentiale de Retea in Linux: ss, curl, dig, tcpdump',
    question: 'Ce comenzi folosesti pentru a investiga porturile deschise, rezolutia DNS si traficul de retea pe un server Linux de productie?',
    answer: 'Uneltele indispensabile pentru depanare de retea in Linux:\n1. ss (Socket Statistics - inlocuitorul modern pentru netstat):\nss -tulpn arata toate porturile TCP/UDP care asculta conexiuni, impreuna cu procesul si PID-ul exact care le detine.\n2. curl -v -k https://api.site.com: Inspecteaza handshake-ul TLS/SSL, headerele HTTP si timpul de raspuns.\n3. dig sau nslookup: Testeaza rezolutia numelor de domenii prin DNS si arata inregistrarile A, CNAME sau MX.\n4. tcpdump -i eth0 port 8080 -w dump.pcap: Captureaza pachetele brute de retea care trec printr-o interfata pentru analiza detaliata in Wireshark.\n5. traceroute: Identifica fiecare ruter intermediar (hop) pana la destinatie pentru a depista unde pica pachetele.',
    codeSnippet: `# Vizualizeaza ce asculta pe portul 8080:
ss -tulpn | grep 8080

# Masoara timpul exact de raspuns DNS si connect cu curl:
curl -w "DNS: %{time_namelookup}s | Connect: %{time_connect}s | Total: %{time_total}s\\n" -o /dev/null -s https://google.com`,
    interviewTrap: 'netstat este deprecated in distributiile moderne de Linux (Ubuntu 22+, RHEL 9); invata comanda ss pentru raspunsuri rapide la interviuri.',
    keyTakeaway: 'ss pentru socket-uri si porturi locale; curl si dig pentru investigarea serviciilor externe si DNS.'
  },
  {
    id: 'devops-15',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'GitHub Actions CI/CD: Pipeline Declarativ si Secrete',
    question: 'Cum structurezi un workflow complet de CI/CD in GitHub Actions cu testare, build de imagine Docker si deploy securizat?',
    answer: 'Fisierul .github/workflows/deploy.yml descrie pasii de automatizare:\n1. Triggers (on:): Declansat la push pe main sau la deschiderea unui Pull Request.\n2. Jobs Paralele sau Secventiale: Jobul de build ruleaza doar daca jobul de test a trecut cu succes (needs: [test]).\n3. Caching: Caching automat pentru dependintele Maven/Node.js pentru a evita descarcarea lor repetata.\n4. GitHub Secrets: Variabilele sensibile (DOCKER_TOKEN, KUBECONFIG) sunt injectate securizat prin ${{ secrets.MY_SECRET }}.\n5. Build & Push: Foloseste actiunile oficiale docker/build-push-action cu buildx pentru imagini multi-platform (linux/amd64, linux/arm64).',
    codeSnippet: `name: CI/CD Pipeline
on:
  push:
    branches: [ main ]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: 'temurin', java-version: '21', cache: 'maven' }
      - run: mvn clean test

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with:
          username: \${{ secrets.DOCKER_USER }}
          password: \${{ secrets.DOCKER_PAT }}
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ats/backend:\${{ github.sha }}`,
    interviewTrap: 'Nu tipari niciodata secretele in console cu comenzi de echo in pasii de script; GitHub incearca sa le mascheze, dar pot fi expuse prin erori de log.',
    keyTakeaway: 'GitHub Actions ofera un pipeline integrat nativ, modular si declansabil pe evenimente de repository.'
  },
  {
    id: 'devops-16',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'GitOps cu ArgoCD: Reconcilierea Declarativa a Starii',
    question: 'Ce este metodologia GitOps si cum functioneaza bucla de reconciliere din ArgoCD?',
    answer: 'GitOps este o practica in care un repository Git reprezinta "Singura Sursa de Adevar" (Single Source of Truth) pentru intreaga stare dorita a infrastructurii si aplicatiilor Kubernetes.\n\nCum functioneaza ArgoCD (Pull Model vs Push Model):\n1. Push Model Clasic (CI/CD traditional):\nServerul Jenkins/GitHub Actions are acces direct de administrator (kubeconfig) si impinge comenzi kubectl apply direct in cluster (risc de securitate daca CI-ul este compromis).\n2. GitOps Pull Model (ArgoCD):\n- ArgoCD ruleaza ca un operator direct in interiorul clusterului de Kubernetes.\n- Nu este nevoie sa expui portul API Server sau sa dai chei de cluster catre CI-ul extern!\n- ArgoCD monitorizeaza continuu repository-ul Git. Daca detecteaza o diferenta intre ce scrie in Git (starea dorita) si ce ruleaza in cluster (starea curenta) -> Out of Sync.\n- ArgoCD sincronizeaza automat starea (Self-Healing). Daca un inginer modifica manual un pod cu kubectl, ArgoCD detecteaza abaterea si restaureaza instant configuratia din Git!',
    codeSnippet: `// Comportament GitOps:
// 1. Modifici replica count in Git: replicas = 5 -> Commit & Push
// 2. ArgoCD detecteaza commit-ul in 30 de secunde
// 3. Scaleaza automat clusterul la 5 replici (Sync OK)`,
    interviewTrap: 'Daca cineva face modificari manuale directe in cluster (Hotfix) fara a face commit in Git, ArgoCD va suprascrie modificarea la urmatorul ciclu de reconciliere.',
    keyTakeaway: 'GitOps transforma Git-ul in sursa suprema de audit si automatizeaza sincronizarea prin operatorul ArgoCD.'
  },
  {
    id: 'devops-17',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Helm Charts: Structura si Versionare in Kubernetes',
    question: 'Ce este un Helm Chart si cum permite parametrizarea manifestelor Kubernetes pentru medii diferite (Dev, Staging, Prod)?',
    answer: 'Helm este managerul oficial de pachete pentru Kubernetes (un fel de "apt" sau "npm" pentru K8s):\nIn loc sa mentii zeci de fisiere YAML duplicat pentru fiecare mediu, un Helm Chart foloseste sabloane (Go Templates) parametrizabile.\n\nStructura unui Helm Chart:\n- Chart.yaml: Metadatele pachetului (nume, versiune de chart, versiune de aplicatie appVersion).\n- values.yaml: Valorile implicite ale variabilelor (numar replici, imagine, limite CPU).\n- values-dev.yaml / values-prod.yaml: Fisiere specifice care suprascriu valorile per mediu.\n- templates/: Fisierele YAML sablonate (deployment.yaml, service.yaml) unde valorile sunt injectate dinamic: {{ .Values.image.tag }}.\n\nRollback Instant: helm rollback my-release 1 anuleaza deploy-ul gresit si revine la versiunea anterioara intr-o secunda!',
    codeSnippet: `# Comanda de deploy cu Helm per mediu:
helm upgrade --install ats-backend ./helm-chart \\
    -f ./helm-chart/values-prod.yaml \\
    --set image.tag="v2.1.0" \\
    --namespace production`,
    interviewTrap: 'Distinge intre version (versiunea pachetului Helm Chart) si appVersion (versiunea aplicatiei tale reale Java/Node); sunt doua campuri complet diferite in Chart.yaml.',
    keyTakeaway: 'Helm elimina duplicarea manifestelor YAML prin sablonare si ofera release management cu comanda de rollback nativ.'
  },
  {
    id: 'devops-18',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Retele Docker: Bridge vs Host vs None',
    question: 'Care sunt tipurile de retea din Docker si cum comunica doua containere pe aceeasi retea custom bridge folosind numele lor?',
    answer: 'Moduri de Retea Docker:\n1. Bridge (Implicit):\n- Creeaza o interfata de retea virtuala (docker0) pe masina gazda.\n- Fiecare container primeste o adresa IP privata interna izolata (ex: 172.17.0.2).\n- Comunicare prin DNS Intern: Daca creezi o retea personalizata (docker network create app-net), containerele pot comunica intre ele folosind DIRECT NUMELE containerului (ex: postgres:5432) datorita serverului DNS intern Docker!\n\n2. Host (Performanta Maxima de Retea):\n- Containerul partajeaza direct stiva de retea a masinii fizice gazda (fara izolare de porturi).\n- Un serviciu care asculta pe 8080 in container asculta direct pe 8080 pe masina fizica.\n\n3. None: Containerul este complet deconectat de la orice retea (izolare totala pentru sarcini de calcul securizat).',
    codeSnippet: `# Creare retea dedicata si legare containere prin nume:
docker network create ats-network
docker run -d --name postgres_db --network ats-network postgres:16
docker run -d --name backend_api --network ats-network -e DB_HOST=postgres_db ats-backend`,
    interviewTrap: 'Pe reteaua implicita "default bridge", rezolutia automata a numelor intre containere este DEZACTIVATA; trebuie intotdeauna sa creezi o retea definita de utilizator (custom bridge) pentru a folosi numele de containere ca hostnames!',
    keyTakeaway: 'Foloseste intotdeauna retele custom bridge pentru ca containerele sa se poata gasi automat prin nume prin DNS-ul Docker integrat.'
  },
  {
    id: 'devops-19',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Securitatea Containerelor: Rularea ca Non-Root User',
    question: 'De ce este periculos sa rulezi procesul principal din Docker ca user-ul implicit root si cum configurezi un utilizator dedicat?',
    answer: 'Pericolul Utilizatorului Root in Containere:\nIn mod implicit, procesul din interiorul containerului ruleaza ca UID 0 (root). Daca aplicatia ta are o vulnerabilitate de securitate (Remote Code Execution) sau un defect in kernel-ul Docker ("Container Breakout"), atacatorul dobandeste privilegii de administrator root direct pe masina fizica gazda a serverului!\n\nBune Practici de Securitate:\n1. Crearea unui utilizator neprivilegiat in Dockerfile (ex: UID 1001).\n2. Setarea directivei USER 1001 inainte de ENTRYPOINT.\n3. In Kubernetes: aplicarea de SecurityContext cu runAsNonRoot: true si readOnlyRootFilesystem: true.',
    codeSnippet: `# In Dockerfile:
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
WORKDIR /app
COPY --chown=appuser:appgroup app.jar .
USER appuser # Rulare sigura fara privilegii de root
ENTRYPOINT ["java", "-jar", "app.jar"]`,
    interviewTrap: 'Daca schimbi utilizatorul pe appuser dar ai fisiere detinute de root pe care aplicatia trebuie sa scrie (ex: folder de loguri), aplicatia va pica cu Permission Denied; foloseste chown inainte de trecerea la non-root.',
    keyTakeaway: 'Rularea containerelor ca utilizator non-root este cerinta de baza pentru conformitate de securitate enterprise si Kubernetes Pod Security Standards.'
  },
  {
    id: 'devops-20',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes Workloads: StatefulSet vs DaemonSet vs Job',
    question: 'Cand folosesti un StatefulSet, un DaemonSet sau un Job in locul unui Deployment standard in Kubernetes?',
    answer: '1. StatefulSet (pentru Baze de Date si Sisteme cu Stare):\n- Fiecare Pod primeste un nume stabil si predictibil care nu se schimba la restart: db-0, db-1, db-2.\n- Ordine stricta de pornire si oprire secventiala.\n- Fiecare pod are propriul sau volum dedicat (PersistentVolumeClaimTemplate). Ideal pentru: PostgreSQL, Kafka, Elasticsearch, Redis Cluster.\n\n2. DaemonSet (Un Pod pe Fiecare Nod Fizic):\n- Asigura ca ruleaza EXACT O INSTANTA a pod-ului pe fiecare masina (Worker Node) din cluster.\n- Cand adaugi un nod nou in cluster, DaemonSet-ul programeaza automat un pod pe el.\n- Ideal pentru: Agenti de logare (Fluentd, Promtail) si monitorizare de sistem (Node Exporter, Datadog Agent).\n\n3. Job & CronJob (Sarcini de Calcul Finite):\n- Un Job ruleaza pana la finalizarea cu succes (Exit Code 0), dupa care se opreste (nu reporneste ca un Deployment).\n- CronJob: Ruleaza un Job la un interval de timp conform unei expresii cron (ex: backup de DB la miezul noptii).',
    codeSnippet: `# Exemplu CronJob pentru backup zilnic de baza de date:
apiVersion: batch/v1
kind: CronJob
metadata:
  name: daily-db-backup
spec:
  schedule: "0 2 * * *" # In fiecare noapte la ora 02:00
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: postgres:16-alpine
              command: ["pg_dump", "-U", "postgres", "-f", "/backup/db.sql"]
          restartPolicy: OnFailure`,
    interviewTrap: 'Nu folosi niciodata un Deployment standard pentru baze de date cu replicare; pierderea identitatii stabile a pod-urilor la restart va corupe clusterul de date.',
    keyTakeaway: 'Deployment pentru aplicatii stateless; StatefulSet pentru baze de date; DaemonSet pentru agenti de infrastructura; Job pentru scripturi finite.'
  },
  {
    id: 'devops-21',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'High Availability cu Pod Anti-Affinity in Kubernetes',
    question: 'Cum garantezi ca replicile aplicatiei tale nu sunt plasate pe acelasi nod fizic sau in aceeasi zona de disponibilitate (AZ)?',
    answer: 'Problema Fara Affinity:\nDaca ai 3 replici ale aplicatiei tale, kube-scheduler le poate plasa pe toate 3 pe acelasi server fizic (Node 1) pentru ca acolo este memorie libera. Daca Node 1 are o pana de curent hardware, toata aplicatia ta este OFFLINE desi aveai 3 replici!\n\nSolutie: Pod Anti-Affinity\nInstruieste scheduler-ul sa NU programeze un nou pod pe un nod sau zona care contine deja un pod cu aceeasi eticheta (label).\n1. requiredDuringSchedulingIgnoredDuringExecution (Hard Rule): Daca nu exista alt nod disponibil, pod-ul ramane in Pending (izolare stricta garantata).\n2. preferredDuringSchedulingIgnoredDuringExecution (Soft Rule): Incearca sa le raspandeasca, dar daca nu are unde, le pune pe acelasi nod mai degraba decat sa nu porneasca.',
    codeSnippet: `affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
      - weight: 100
        podAffinityTerm:
          labelSelector:
            matchExpressions:
              - key: app
                operator: In
                values: ["backend"]
          topologyKey: "topology.kubernetes.io/zone" # Raspandire pe Zone Cloud diferite!`,
    interviewTrap: 'Daca folosesti reguli stricte (required) si setezi 5 replici pe un cluster cu doar 3 noduri, 2 pod-uri vor ramane blocate in starea Pending pe termen nelimitat.',
    keyTakeaway: 'Pod Anti-Affinity raspandeste replicile pe noduri si zone de disponibilitate diferite pentru a rezista caderilor fizice de hardware.'
  },
  {
    id: 'devops-22',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes Taints si Tolerations: Rezervarea Nodurilor',
    question: 'Ce sunt Taints si Tolerations si cum rezervi noduri dedicate exclusive (ex: noduri scumpe cu placi video GPU) pentru sarcini de AI?',
    answer: 'Metafora Clasica: O "patura" (Taint) alunga pod-urile, iar o "toleranta" (Toleration) permite unui pod sa stea pe acel nod.\n1. Taint pe Nod:\nUn nod primeste o eticheta de respingere (ex: dedicated=gpu:NoSchedule). Niciun pod obisnuit nu poate fi programat pe acest nod!\n2. Toleration pe Pod:\nDoar pod-urile care declara explicit aceeasi toleranta in manifestul lor pot fi acceptate pe acel nod special.\n\nEfecte de Taint:\n- NoSchedule: Pod-urile fara toleranta nu pot fi programate pe nod.\n- PreferNoSchedule: Incearca sa evite nodul, dar il accepta daca nu sunt alte optiuni.\n- NoExecute: Daca adaugi acest taint, pod-urile care ruleaza deja pe nod si nu au toleranta sunt date afara (evacuate) imediat!',
    codeSnippet: `# 1. Comanda pe nod:
kubectl taint nodes node-gpu-1 dedicated=gpu:NoSchedule

# 2. In manifestul Pod-ului de AI/ML:
tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"`,
    interviewTrap: 'Tolerations permit unui pod sa fie plasat pe un nod tainted, dar NU garanteaza ca va ajunge doar acolo; pentru a forta pod-ul sa ajunga exclusiv pe acel nod, combina Tolerations cu NodeSelector!',
    keyTakeaway: 'Taints resping pod-urile de pe noduri speciale; Tolerations permit pod-urilor autorizate sa fie gazduite pe ele.'
  },
  {
    id: 'devops-23',
    category: 'DEVOPS',
    difficulty: 'DIFICIL',
    title: 'NetworkPolicies in Kubernetes: Securitate Zero-Trust',
    question: 'Cum functioneaza NetworkPolicies si cum implementezi o politica de "Default Deny" pentru a izola traficul intre namespace-uri?',
    answer: 'In mod implicit, reteaua Kubernetes este complet plata si deschisa: ORICE pod poate comunica direct prin retea cu ORICE alt pod din cluster, chiar si peste namespace-uri diferite! Daca un pod de frontend este compromis, atacatorul poate trimite interogari direct pe portul intern al bazei de date.\n\nNetworkPolicies (Firewall la Nivel de Pod):\nPermit definirea de reguli de filtrare a traficului la nivelul straturilor IP si Port (L3/L4):\n1. Ingress (Trafic care intra in pod): Permite trafic doar de la pod-urile cu eticheta role: backend pe portul 5432.\n2. Egress (Trafic care iese din pod): Permite comunicare doar catre serverul DNS intern si adrese IP autorizate.\n3. Default Deny All: Practica standard de securitate este crearea unei politici care blocheaza TOT traficul de intrare intr-un namespace, deschizand punctual doar conexiunile strict necesare.',
    codeSnippet: `apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: postgres-network-policy
spec:
  podSelector:
    matchLabels:
      app: postgres
  policyTypes:
    - Ingress
  ingress:
    - from:
        - podSelector:
            matchLabels:
              app: backend-api # Permite doar apeluri de la backend!
      ports:
        - protocol: TCP
          port: 5432`,
    interviewTrap: 'Pentru ca NetworkPolicies sa functioneze, clusterul trebuie sa aiba instalat un CNI plugin (Container Network Interface) care suporta politici de retea (precum Calico sau Cilium); CNI-ul de baza Flannel ignora politicile de retea!',
    keyTakeaway: 'NetworkPolicies blocheaza miscarea laterala a atacatorilor in cluster prin aplicarea principiului de Zero-Trust la nivel de retea.'
  },
  {
    id: 'devops-24',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'De ce este interzis tagul :latest in imaginile Docker de productie?',
    question: 'De ce folosirea tagului image: my-app:latest este un anti-pattern periculos in productie si cum gestionezi corect versionarea?',
    answer: 'Problemele Catastrofale ale Tagului :latest:\n1. Lipsa de Imutabilitate: Tagul latest este mutabil. Poti avea 3 pod-uri ruland versiuni de cod complet diferite sub aceeasi denumire latest!\n2. Rollback Imposibil: Daca un deploy introduce un bug critic, nu poti face rollback rapid cu kubectl rollback, deoarece nu stii care a fost tagul anterior exact.\n3. Politica ImagePullPolicy: In mod implicit, daca imaginea exista deja pe nodul K8s, Docker nu va descarca noul build la restart, ruland cod vechi.\n\nBune Practici de Versionare in CI/CD:\n- Foloseste SHA-ul scurt de commit din Git ca tag de imagine: my-app:a3b19f2\n- Foloseste Semantic Versioning la release-uri oficiale: my-app:v1.4.2\n- Asigura trasabilitate 100%: privind tagul imaginii din Kubernetes stii instantaneu exact ce linie de cod Git ruleaza in acel container.',
    codeSnippet: `# CORECT in Kubernetes manifest:
spec:
  containers:
    - name: backend
      image: ats-registry.com/backend:git-9f8a12c
      imagePullPolicy: IfNotPresent`,
    interviewTrap: 'Nu presupune ca "latest" inseamna "cea mai noua versiune"; latest este doar o eticheta text implicita care este aplicata atunci cand nu specifici niciun tag la build.',
    keyTakeaway: 'Foloseste intotdeauna identificatori imutabili (Git commit SHA) pentru imagini de productie pentru predictibilitate si trasabilitate totala.'
  },
  {
    id: 'devops-25',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'De ce se dezactiveaza memoria Swap pe nodurile Kubernetes?',
    question: 'De ce cerinta obligatorie la instalarea unui cluster Kubernetes a fost istoric dezactivarea memoriei Swap (swapoff -a)?',
    answer: 'Motivul Principal: Predictibilitatea Scheduler-ului Kubernetes\nKube-scheduler aloca pod-urile pe noduri bazandu-se pe presupunerea stricta ca resursele de memorie RAM ale fiecarui nod sunt 100% garantate si rapide in hardware fizic.\n\nDaca Swap-ul ar fi activ:\n1. Cand un nod ramane fara RAM, sistemul de operare Linux incepe sa mute pagini de memorie pe discul lent (Swapping).\n2. Viteza de acces la memorie scade de mii de ori (de la nanosecunde la milisecunde), facand aplicatiile extrem de lente si impredictibile.\n3. Kubernetes prefera sa ucida ordonat un pod cu OOMKilled sau sa il mute pe alt nod sanatos (Fail-Fast) decat sa lase intregul nod fizic sa intre in colaps de performanta din cauza swapping-ului de disc.',
    codeSnippet: `# Comanda de dezactivare swap in Linux inainte de initializare K8s:
sudo swapoff -a
# Si comentarea liniei de swap din /etc/fstab pentru a persista la reboot`,
    interviewTrap: 'Incepand cu Kubernetes 1.28+, exista suport experimental pentru Swap cu limite stricte (NodeSwap), dar in vasta majoritate a clusterelor de productie ramane dezactivat.',
    keyTakeaway: 'Dezactivarea memoriei Swap asigura predictibilitate determinista si alocare fidela a resurselor de RAM in Kubernetes.'
  },
  {
    id: 'devops-26',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Crearea unui Serviciu Linux cu Systemd',
    question: 'Cum configurezi un serviciu de sistem in Linux (/etc/systemd/system/app.service) care sa reporneasca automat aplicatia in caz de crash?',
    answer: 'Systemd este sistemul standard de initializare si administrare de procese (PID 1) in distributiile moderne de Linux.\n\nPentru a crea un serviciu:\n1. Creezi fisierul /etc/systemd/system/ats-backend.service.\n2. Configurezi utilizatorul non-root sub care ruleaza (User=atsuser).\n3. Setezi comanda exacta de pornire (ExecStart).\n4. Setezi politica de auto-restart: Restart=always si RestartSec=5s.\n5. Activezi si pornesti serviciul: systemctl daemon-reload && systemctl enable --now ats-backend.',
    codeSnippet: `[Unit]
Description=ATS Backend Spring Boot Application
After=network.target postgresql.service

[Service]
Type=simple
User=atsuser
ExecStart=/usr/bin/java -jar /opt/ats/backend.jar
Restart=always
RestartSec=5s
Environment=SPRING_PROFILES_ACTIVE=prod

[Install]
WantedBy=multi-user.target`,
    interviewTrap: 'Nu uita sa rulezi comanda sudo systemctl daemon-reload dupa fiecare modificare a fisierului .service, altfel Systemd va continua sa foloseasca configuratia veche din memorie!',
    keyTakeaway: 'Systemd ofera autorestart, pornire automata la boot si management centralizat de procese in Linux.'
  },
  {
    id: 'devops-27',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Monitorizare cu Prometheus: Arhitectura Pull vs Push',
    question: 'Cum colecteaza Prometheus metricile de la aplicatii si de ce foloseste un model de tip Pull in loc de Push?',
    answer: 'Prometheus este standardul de monitorizare in cloud-native:\n1. Modelul Pull-Based (Prometheus Trage Datele):\n- Aplicatia ta expune un simplu endpoint HTTP care returneaza text in format deschis (ex: /actuator/prometheus pe portul 8080).\n- Serverul Prometheus viziteaza periodic aplicatia (Scraping la fiecare 15 secunde) si descarca metricile.\n\nDe ce este modelul Pull superior pentru monitorizare:\n- Control Total pe Server: Prometheus controleaza ritmul de scraping; daca aplicatia este sub trafic masiv, Prometheus nu este coplesit de avalanse de mesaje.\n- Detectare Nativa a Caderilor: Daca Prometheus incearca sa faca scrape pe un pod si primeste Connection Refused, Prometheus STIE INSTANTANEU ca pod-ul a murit!\n(Intr-un model de tip Push, daca un serviciu moare, el pur si simplu inceteaza sa mai trimita date, fiind greu de deosebit de o lipsa normala de activitate).\n\n2. Cand se foloseste Push: Pentru joburi foarte scurte (batch jobs care dureaza 3 secunde), se foloseste un intermediar numit Prometheus Pushgateway.',
    codeSnippet: `# Configurare job de scraping in prometheus.yml:
scrape_configs:
  - job_name: 'ats-backend'
    metrics_path: '/actuator/prometheus'
    scrape_interval: 15s
    static_configs:
      - targets: ['backend-service:8080']`,
    interviewTrap: 'Nu trimite date de mare cardinalitate (ex: ID-ul unic al fiecarui utilizator sau adresa de email) ca labels in Prometheus; aceasta provoaca explozie de memorie RAM in baza de date Prometheus (Time Series Cardinality Explosion).',
    keyTakeaway: 'Modelul Pull ofera control al ratei de colectare si detectare automata a starii de disponibilitate a serviciilor.'
  },
  {
    id: 'devops-28',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Logging Centralizat: Elasticsearch (ELK) vs Grafana Loki',
    question: 'Care este diferenta fundamentala de stocare si cost intre Elasticsearch si Grafana Loki pentru colectarea logurilor?',
    answer: '1. Elasticsearch (Abordarea Clasica Full-Text Indexing):\n- Construieste un index inversat complet pe FIECARE cuvant din interiorul fiecarui mesaj de log.\n- Cautare extrem de rapida pe text liber.\n- Cost Urias de Resurse: Indecsii de loguri pot ocupa mai mult spatiu pe disc si in memoria RAM decat logurile brute in sine! Necesita clustere masive si costisitoare de servere.\n\n2. Grafana Loki ("Prometheus, dar pentru Loguri"):\n- Loki NU indexeaza continutul text al mesajelor de log!\n- Loki indexeaza DOAR metadatele si etichetele (Labels: app="backend", namespace="prod", level="ERROR").\n- Logurile brute sunt comprimate puternic in bucati (chunks) si stocate pe stocare ieftina de obiecte (AWS S3 sau MinIO).\n- Costuri de pana la 5-10 ori mai mici decat Elasticsearch, integrare fluida nativa cu dashboard-urile Grafana.',
    codeSnippet: `// Interogare LogQL in Grafana Loki:
{app="ats-backend", env="prod"} |= "NullPointerException"`,
    interviewTrap: 'Cautarea de text pe intervale mari de timp (ex: 30 de zile) in Loki este mai lenta decat in Elasticsearch deoarece scaneaza bucatile comprimate la cerere, dar raportul cost/eficienta este imbatabil.',
    keyTakeaway: 'Grafana Loki reduce drastic costurile de infrastructura prin indexarea exclusiva a etichetelor si stocarea datelor in cloud object storage.'
  },
  {
    id: 'devops-29',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'DevSecOps: Scanare Automata de Vulnerabilitati (SAST vs SCA vs DAST)',
    question: 'Ce rol au analizele SAST, SCA si DAST in securizarea pipeline-ului de CI/CD?',
    answer: 'DevSecOps integreaza securitatea direct in ciclul continuu de dezvoltare (Shift-Left Security):\n1. SCA (Software Composition Analysis - ex: Trivy, Snyk, Dependabot):\n- Scaneaza bibliotecile si dependintele open-source externe (JAR-uri, npm packages, imagini de baza Docker).\n- Verifica dependintele impotriva bazelor oficiale de vulnerabilitati cunoscute (CVE - Common Vulnerabilities and Exposures).\n\n2. SAST (Static Application Security Testing - ex: SonarQube, Semgrep):\n- Analizeaza codul sursa direct in repaus fara a rula aplicatia (White-Box).\n- Descrie defecte de codare: vulnerabilitati la SQL Injection, criptografie slaba, date sensibile expuse in log-uri.\n\n3. DAST (Dynamic Application Security Testing - ex: OWASP ZAP):\n- Testeaza aplicatia pornita in mediul de rulare din exterior (Black-Box) simuland atacuri reale de hacker (XSS, injectari de comenzi, configurari gresite de headers).',
    codeSnippet: `# Pas de scanare imagine Docker cu Trivy in GitHub Actions:
- name: Scanare Vulnerabilitati Imagine Docker
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'ats/backend:\${{ github.sha }}'
    exit-code: '1' # Blocheaza build-ul daca exista vulnerabilitati CRITICE!
    severity: 'CRITICAL,HIGH'`,
    interviewTrap: 'Scanarea de dependinte (SCA) descopera 90% din vulnerabilitatile de productie; majoritatea atacurilor exploateaza librarii terte invechite din proiect si nu codul scris de echipa.',
    keyTakeaway: 'Automatizarea scanarii SAST si SCA in pipeline-ul de CI/CD previne livrarea de vulnerabilitati si secrete in productie.'
  },
  {
    id: 'devops-30',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes RBAC: Roluri si Permisiuni de Acces',
    question: 'Cum controlezi accesul la resursele din cluster folosind Role, ClusterRole, RoleBinding si ServiceAccount?',
    answer: 'RBAC (Role-Based Access Control) reglementeaza cine si ce actiuni poate efectua in cluster:\n1. ServiceAccount: O identitate destinata proceselor si aplicatiilor care ruleaza in interiorul pod-urilor (ex: un pod care trebuie sa citeasca alte pod-uri prin API-ul K8s).\n2. Role (La nivel de Namespace):\nDefineste o lista de permisiuni (reguli) limitate strict la un singur namespace (ex: dreptul de a citi si crea Pod-uri in namespace-ul dev).\n3. ClusterRole (La nivel de Cluster Global):\nDefineste permisiuni globale pe intreg clusterul (ex: dreptul de a citi noduri fizice sau PersistentVolumes, care nu apartin unui namespace).\n4. RoleBinding / ClusterRoleBinding: "Legatura" care atribuie un Role sau ClusterRole unui utilizator sau ServiceAccount.',
    codeSnippet: `apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  namespace: default
  name: pod-reader
rules:
  - apiGroups: [""] # Core API
    resources: ["pods", "pods/log"]
    verbs: ["get", "list", "watch"] # Doar citire, fara drept de stergere!`,
    interviewTrap: 'Acordarea rolului cluster-admin oricarui ServiceAccount este o vulnerabilitate masiva de securitate; respecta intotdeauna Principiul Privilegiilor Minime (Least Privilege).',
    keyTakeaway: 'RBAC izoleaza permisiunile prin reguli explicite si asociaza accesul la nivel de namespace sau cluster.'
  },
  {
    id: 'devops-31',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Redirectionari I/O si Piping in Shell Linux: > vs >> vs 2>&1',
    question: 'Care este diferenta dintre descriptorii de fisiere stdin, stdout si stderr si ce face sintaxa comanda > log.txt 2>&1?',
    answer: 'In Linux, fiecare proces deschide 3 descriptori standard de I/O:\n- 0: Standard Input (stdin)\n- 1: Standard Output (stdout - iesirea normala)\n- 2: Standard Error (stderr - mesajele de eroare)\n\nSemnificatia Operatorilor de Redirectionare:\n- >: Redirectioneaza stdout intr-un fisier, SUPRASCRIIND continutul vechi.\n- >>: Redirectioneaza stdout la FINALUL fisierului (Append mode).\n- 2>&1: Redirectioneaza descriptorul 2 (stderr) catre descriptorul 1 (stdout).\n\nComanda completa: comanda > log.txt 2>&1\nTrimite ATAT mesajele normale cat si TOATE mesajele de eroare in acelasi fisier comun log.txt, fara a mai afisa nimic in terminal.',
    codeSnippet: `# Trimitere stdout si stderr in fundal:
nohup java -jar app.jar > /var/log/app.log 2>&1 &

# Aruncarea intregii iesiri (ignora complet mesajele):
comanda > /dev/null 2>&1`,
    interviewTrap: 'Ordinea conteaza: comanda 2>&1 > log.txt NU functioneaza corect deoarece stderr este redirectionat catre vechea destinatie stdout inainte ca stdout sa fie trimis in fisier!',
    keyTakeaway: 'Sintaxa > fisier 2>&1 asigura capturarea integrala atat a iesirii standard cat si a erorilor intr-un singur fisier de log.'
  },
  {
    id: 'devops-32',
    category: 'DEVOPS',
    difficulty: 'DIFICIL',
    title: 'Kubernetes CrashLoopBackOff: Diagnosticare si Rezolvare',
    question: 'Ce inseamna cand un Pod intra in starea CrashLoopBackOff si care sunt cei 3 pasi standard de depanare?',
    answer: 'Ce este CrashLoopBackOff:\nUn Pod a pornit, a picat (a iesit cu un cod de eroare diferit de 0), a fost restartat de Kubernetes, a picat din nou si tot asa. Pentru a proteja nodul fizic de o bucla infinita rapida de restarturi, Kubernetes aplica o intarziere exponentiala (Back-Off delay: 10s, 20s, 40s... pana la 5 minute) inainte de urmatoarea incercare.\n\nPasi de Diagnosticare Rapida:\n1. Inspecteaza Starea si Evenimentele: kubectl describe pod <nume-pod>\nArata Exit Code-ul (ex: 137 = OOMKilled, 1 = exceptie Java la startup) si ultimul eveniment.\n2. Citeste Logurile Anterioare: kubectl logs <nume-pod> --previous\nFlag-ul --previous este critic! El iti arata logurile containerului din instanta care a picat imediat inainte de restart (unde este tiparit stack trace-ul exceptiei)!\n3. Verifica Conexiunile: Daca aplicatia cauta un secret lipsa sau baza de date este inaccesibila la startup (Spring Boot fail-fast).',
    codeSnippet: `# Comenzi de investigare rapida:
kubectl describe pod backend-68df89b-x9z
kubectl logs backend-68df89b-x9z --previous --tail=100`,
    interviewTrap: 'Daca rulezi doar kubectl logs pe un pod care tocmai s-a restartat, s-ar putea sa vezi loguri goale; adaugarea --previous este solutia pentru a vedea cauza reala a caderii.',
    keyTakeaway: 'kubectl describe arata evenimentele de sistem, iar kubectl logs --previous expune cauza exacta a prabusirii aplicatiei.'
  },
  {
    id: 'devops-33',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Docker Volumes vs Bind Mounts in Dezvoltare si Productie',
    question: 'Care este diferenta dintre un Docker Named Volume si un Bind Mount si cand folosesti fiecare solutie?',
    answer: '1. Bind Mounts (-v /host/path:/container/path):\n- Mapeaza direct un director specific de pe masina gazda in interiorul containerului.\n- Utilizare Ideala in Dezvoltare: Mapezi directorul local de cod sursa in containerul de frontend (ex: vite sau next.js). Cand salvezi un fisier pe masina ta, containerul vede schimbarea instant si declanseaza Hot Reload fara rebuild!\n- Dezavantaj: Dependent de structura de fisiere a sistemului gazda si performanta mai slaba pe Docker Desktop macOS/Windows.\n\n2. Named Volumes (-v my_data:/var/lib/postgresql/data):\n- Sunt gestionate complet si exclusiv de daemonul Docker intr-un spatiu izolat (/var/lib/docker/volumes/).\n- Utilizare Ideala in Productie: Baze de date persistente. Izolate de utilizatorii gazdei, performanta maxima de disc pe Linux, usor de salvat prin backup-uri automate (docker volume create).',
    codeSnippet: `# Bind Mount in dezvoltare (live reload):
docker run -v $(pwd)/src:/app/src my-dev-app

# Named Volume in productie (persistenta sigura de baza de date):
docker run -v postgres_data:/var/lib/postgresql/data postgres:16`,
    interviewTrap: 'Daca folosesti Bind Mount pe un folder gol de pe host catre un folder din container care continea deja fisiere la build, folderul gol din host va acoperi si ascunde fisierele din container!',
    keyTakeaway: 'Bind Mounts sunt perfecte pentru live reloading in dev; Named Volumes sunt standardul pentru persistenta de date in productie.'
  },
  {
    id: 'devops-34',
    category: 'DEVOPS',
    difficulty: 'USOR',
    title: 'Linux Disk Troubleshooting: df vs du si Epuizarea Inode-urilor',
    question: 'De ce poti primi eroarea "No space left on device" desi comanda df -h arata ca mai ai 50 GB liberi pe disc?',
    answer: 'Explicatia: Epuizarea Inode-urilor (Inode Exhaustion)\nIn sistemele de fisiere Linux (ext4, xfs), fiecare fisier sau director nou creat consuma un "Inode" (o structura de metadate care contine permisiunile si adresa blocurilor).\nNumarul total de Inode-uri este fixat la formatarea discului!\n\nCe se intampla:\nDaca o aplicatie creeaza milioane de fisiere minuscule (de cativa octeti fiecare, cum ar fi milioane de fisiere de sesiune PHP, cache-uri sau loguri goale), numarul de INODE-URI SE TERMINA inainte de a epuiza spatiul fizic in gigabytes de pe disc!\n\nInvestigare si Rezolvare:\n- Verificare Inode-uri: df -i (daca IUse% este 100%, ai epuizat inode-urile!).\n- Gasirea directorului vinovat: for d in /*; do echo -n "$d: "; find "$d" -xdev | wc -l; done',
    codeSnippet: `# Verificare spatiu in Gigabytes:
df -h

# Verificare epuizare Inode-uri:
df -i

# Identificare directoare grele pe disc:
du -sh /* 2>/dev/null | sort -hr | head -n 10`,
    interviewTrap: 'Un alt scenariu clasic: daca stergi un fisier mare de log cu comanda rm log.txt in timp ce o aplicatie inca scrie in el, spatiul nu este eliberat pe disc pana cand procesul nu este oprit (fisierul este tinut deschis de un file descriptor activ vizibil in lsof | grep deleted).',
    keyTakeaway: 'df -h verifica dimensiunea in bytes; df -i verifica epuizarea numarului maxim de fisiere si directoare permise.'
  },
  {
    id: 'devops-35',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Distroless Images pentru Securitate Maxima in Containere',
    question: 'Ce sunt imaginile Google Distroless si de ce eliminarea shell-ului (bash/sh) si a managerilor de pachete creste securitatea in productie?',
    answer: 'Imaginile Docker Distroless (create de Google) contin EXCLUSIV aplicatia ta si dependintele ei de runtime (de exemplu: doar Java Runtime si librariile de baza glibc).\n\nCe NU contine o imagine Distroless:\n- Nu contine niciun shell (nici bash, nici sh).\n- Nu contine niciun utilitar Linux (fara curl, wget, apt, yum, cat, ls).\n- Nu contine manageri de pachete.\n\nBeneficiul Suprem de Securitate:\nDaca un atacator reuseste sa exploateze o vulnerabilitate in codul tau (ex: o injectare de comenzi de tip Remote Code Execution), atacul este neutralizat complet deoarece NU EXISTA NICIUN SHELL pe care atacatorul sa il poata invoca pentru a rula comenzi si nu exista curl sau wget pentru a descarca malware!',
    codeSnippet: `FROM gcr.io/distroless/java21-debian12
COPY target/app.jar /app.jar
CMD ["/app.jar"] # Fara shell, apel direct al binarului!`,
    interviewTrap: 'Deoarece imaginile Distroless nu au shell, nu poti rula kubectl exec -it mypod -- sh pentru a depana; depanarea se face folosind K8s Ephemeral Containers (kubectl debug).',
    keyTakeaway: 'Distroless minimizeaza suprafata de atac prin eliminarea completa a utilitarelor de sistem din containerele de productie.'
  },
  {
    id: 'devops-36',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Pod Disruption Budgets (PDB) in Kubernetes',
    question: 'Ce este un Pod Disruption Budget (PDB) si cum previne caderile de aplicatie in timpul actualizarilor de noduri de catre echipa de infrastructura?',
    answer: 'Cand administratorii de infrastructura efectueaza mentenanta pe un nod fizic (actualizare de kernel de Linux, upgrade de versiune Kubernetes) cu comanda kubectl drain node-1, Kubernetes evacueaza toate pod-urile de pe acel nod.\n\nRiscul Fara PDB:\nDaca ai un Deployment cu 2 pod-uri si ambele se nimeresc pe acelasi nod evacuat, aplicatia ta va deveni indisponibila timp de cateva minute!\n\nSolutie: PodDisruptionBudget (PDB)\nUn PDB defineste numarul minim de replici care TREBUIE sa ramana active in mod obligatoriu in orice moment pe durata evacuarilor voluntare.\n- minAvailable: 1 (sau minAvailable: "50%").\nKubernetes refuza sa evacueze un pod pana cand noua replica programata pe alt nod nu devine sanatoasa (Readiness Probe verde), garantand disponibilitate continua 100%!',
    codeSnippet: `apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: backend-pdb
spec:
  minAvailable: 1 # Cel putin 1 pod ramane mereu activ!
  selector:
    matchLabels:
      app: backend`,
    interviewTrap: 'PDB protejeaza aplicatia doar de perturbari voluntare (drain, scale down); daca un server fizic arde brusc hardware (involuntary disruption), PDB nu poate preveni caderea fizica.',
    keyTakeaway: 'Pod Disruption Budgets garanteaza prezenta minima a replicilor active in timpul operatiunilor de mentenanta de infrastructura.'
  },
  {
    id: 'devops-37',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Linux Load Average Explicat: CPU Bound vs I/O Bound',
    question: 'Ce semnifica cele 3 numere din comanda uptime (Load Average) si cum interpretezi o valoare mai mare decat numarul de nuclee CPU?',
    answer: 'Cele 3 valori din uptime reprezinta media numarului de procese aflate in starea "Runnable" (care folosesc sau cer CPU) sau in starea "Uninterruptible Sleep" (D state - blocate in asteptare de I/O de disc sau retea), calculate pe ultimele 1, 5 si 15 minute.\n\nInterpretare Raportata la Nuclee (CPU Cores):\n- Pe un server cu 4 nuclee CPU, un Load Average de 4.0 inseamna o incarcare exacta de 100% (capacitate perfecta).\n- Daca Load Average este 8.0 pe un server cu 4 nuclee, inseamna ca exista in permanenta o coada de 4 procese care asteapta sa fie procesate (serverul este supraincarcat cu 100% peste capacitate).\n\nCum deosebesti CPU Bound de I/O Bound:\n- Rulezi comanda top.\n- Daca procentul %us (User CPU) este 90%, serverul este CPU-bound (aplicatie care ruleaza calcule grele).\n- Daca %us este 10%, dar parametrul %wa (I/O Wait) este 80%, CPU-ul este liber, dar procesele sunt blocate asteptand raspunsul unui disc lent sau saturat!',
    codeSnippet: `# Comanda de verificare:
uptime
# output: 14:10:00 up 45 days, 4 cores, load average: 6.50, 4.20, 2.10
# Tendinta: Incarcarea a crescut brusc in ultimul minut (6.5 > 4.2 > 2.1) pe un sistem de 4 cores!`,
    interviewTrap: 'Un Load Average ridicat nu inseamna automat ca CPU-ul este saturat; un disc blocat care tine zeci de procese in asteptare I/O (D state) va creste Load Average-ul la 50 chiar si cu 5% utilizare de CPU!',
    keyTakeaway: 'Compara Load Average-ul cu numarul total de nuclee CPU si verifica parametrul %wa din top pentru a detecta blocajele de disc.'
  },
  {
    id: 'devops-38',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes Ephemeral Containers (kubectl debug)',
    question: 'Cum depanezi un container din productie care ruleaza pe o imagine Distroless fara shell folosind kubectl debug?',
    answer: 'Inainte de Kubernetes 1.25, depanarea unei imagini fara shell (Distroless/Scratch) era aproape imposibila.\n\nSolutie: Containere Efemere (Ephemeral Containers cu kubectl debug)\n1. Comanda kubectl debug ataseaza un container NOU temporar in interiorul aceluiasi Pod care ruleaza deja!\n2. Containerul temporar foloseste o imagine completa de diagnostic (ex: alpine sau busybox) echipata cu sh, curl, tcpdump si htop.\n3. Partajeaza acelasi spatiu de nume de procese (Process Namespace) si aceeasi retea (localhost) cu aplicatia ta originala, permitandu-ti sa inspectezi fisierele si memoria procesului Java fara a modifica imaginea de productie.',
    codeSnippet: `# Pornire sesiune interactiva de depanare pe un pod existent:
kubectl debug -it backend-pod-xyz \\
    --image=nicolaka/netshoot \\
    --target=backend-container`,
    interviewTrap: 'Containerele efemere nu pot fi modificate sau restartate dupa ce au fost create; ele sunt destinate strict sesiunilor temporare de investigatie live.',
    keyTakeaway: 'kubectl debug permite depanarea containerelor securizate Distroless fara a compromite securitatea imaginii principale.'
  },
  {
    id: 'devops-39',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Blue-Green Deployments Nativ in Kubernetes prin Selectori de Service',
    question: 'Cum executi un Blue-Green Deployment pur in Kubernetes fara unelte externe, manipuland doar campul selector dintr-un Service?',
    answer: 'Arhitectura Blue-Green nativa in K8s:\n1. Mentine doua Deployments independente simultan:\n   - backend-blue: ruleaza versiunea v1 (cu eticheta version: v1).\n   - backend-green: ruleaza versiunea v2 (cu eticheta version: v2).\n2. Service-ul public este configurat initial cu: selector: { app: backend, version: v1 } (tot traficul merge pe Blue).\n3. Echipa testeaza mediul Green pe un serviciu intern privat.\n4. Comutarea Instantanee:\nCu o singura comanda kubectl patch service backend-svc, modifici selectorul in: selector: { app: backend, version: v2 }.\nIn aceeasi secunda, kube-proxy redirectioneaza 100% din traficul utilizatorilor catre pod-urile Green!\n5. Daca apar erori, revii inapoi pe Blue intr-o secunda; daca totul e bine, stergi deployment-ul Blue.',
    codeSnippet: `# Comutare instantanee a traficului catre versiunea v2:
kubectl patch service backend-service -p '{"spec":{"selector":{"version":"v2"}}}'`,
    interviewTrap: 'Asigura-te ca pod-urile Green sunt complet initializate si au trecut probele de Readiness inainte de a comuta selectorul de Service!',
    keyTakeaway: 'Manipularea selectorului de etichete al unui Service ofera o solutie simpla si robusta de Blue-Green deployment cu tranzitie instantanee.'
  },
  {
    id: 'devops-40',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Optimizarea Cache-ului in CI/CD GitHub Actions',
    question: 'Cum configurezi actiunea actions/cache pentru a evita re-descarcarea dependintelor la fiecare rulare de pipeline?',
    answer: 'Fara mecanism de cache, fiecare rulare a pipeline-ului de GitHub Actions descarca sute de megabytes de dependinte (repository-ul Maven ~/.m2 sau folderul node_modules), irosind minute intregi si banda de retea.\n\nConfigurare Cheie actions/cache:\n1. path: Calea catre folderul local unde managerul de pachete stocheaza dependintele.\n2. key: O cheie unica generata folosind hash-ul fisierului de dependinte (hashFiles(\'**/pom.xml\')). Atata timp cat pom.xml nu este modificat, hash-ul ramane identic si cache-ul este restaurat instantaneu!\n3. restore-keys: Chei de rezerva in cazul in care hash-ul exact nu este gasit.',
    codeSnippet: `- name: Cache Dependinte Maven
  uses: actions/cache@v4
  with:
    path: ~/.m2/repository
    key: \${{ runner.os }}-maven-\${{ hashFiles('**/pom.xml') }}
    restore-keys: |
      \${{ runner.os }}-maven-`,
    interviewTrap: 'Daca folosesti actions/setup-java cu parametrul cache: "maven", GitHub Actions configureaza acest mecanism automat fara a mai fi nevoie sa scrii manual pasul actions/cache.',
    keyTakeaway: 'Caching-ul dependintelor prin hashFiles() reduce timpul de rulare al pipeline-ului de CI/CD cu peste 70%.'
  },
  {
    id: 'devops-41',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Securitatea Autentificarii SSH cu Chei Criptografice',
    question: 'Cum functioneaza autentificarea SSH bazata pe perechi de chei asimetrice si de ce algoritmul Ed25519 este superior clasicului RSA?',
    answer: 'Autentificarea Asimetrica SSH:\n1. Clientul detine o cheie privata (id_ed25519) pastrata secret si securizata cu parola pe laptopul sau.\n2. Serverul are cheia publica copiata in fisierul ~/.ssh/authorized_keys.\n3. La conectare, serverul trimite un mesaj provocare (challenge) criptat cu cheia publica. Clientul il decripteaza folosind cheia privata si il semneaza.\n4. Parola utilizatorului nu este transmisa NICIODATA prin retea!\n\nDe ce Ed25519 este superior RSA:\n- Bazat pe curbe eliptice (Curve25519).\n- Lungime mica a cheii (doar 256 de biti) cu o forta criptografica echivalenta cu o cheie RSA gigantica de 3072 de biti.\n- Viteza de calcul mult mai rapida si imunitate nativa la atacuri de tip side-channel (timing attacks).',
    codeSnippet: `# Generare cheie moderna securizata Ed25519:
ssh-keygen -t ed25519 -C "mihai@atsjobtracker.com"

# Copiere securizata pe server:
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@server.com`,
    interviewTrap: 'Dezactiveaza intotdeauna autentificarea prin parola in /etc/ssh/sshd_config (PasswordAuthentication no) dupa configurarea cheilor pentru a bloca definitiv atacurile de forta bruta.',
    keyTakeaway: 'Cheile asimetrice Ed25519 ofera securitate maxima si viteza superioara fata de cheile traditionale RSA.'
  },
  {
    id: 'devops-42',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'OpenTelemetry (OTel) Collector: Arhitectura Unificata de Observabilitate',
    question: 'Ce rol are un OpenTelemetry Collector si cum decupleaza codul aplicatiei de furnizorii de monitorizare (Datadog, Jaeger, Grafana)?',
    answer: 'Fara OpenTelemetry:\nFiecare aplicatie trebuie sa includa SDK-uri specifice de la furnizori diferiti (SDK Datadog, SDK New Relic, SDK Sentry). Daca decizi sa schimbi furnizorul de monitorizare, trebuie sa modifici si sa recompilezi codul in toate cele 50 de microservicii!\n\nCu OpenTelemetry (Standardul CNCF):\n1. Aplicatia ta emite telemetrie unificata standardizata (Traces, Metrics, Logs) folosind API-ul neutru OpenTelemetry.\n2. Toate datele sunt trimise local catre un OpenTelemetry Collector (un proces proxy independent).\n3. OTel Collector filtreaza, agrega, elimina date sensibile si exporta datele simultan catre orice backend dorit (Jaeger pentru tracing, Prometheus pentru metrici, Loki pentru loguri) doar prin configurare YAML, fara nicio schimbare de cod!',
    codeSnippet: `# otel-collector-config.yaml:
receivers:
  otlp:
    protocols: { grpc: {}, http: {} }
exporters:
  prometheus:
    endpoint: "0.0.0.0:8889"
  otlp/tempo:
    endpoint: "tempo:4317"
service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [otlp/tempo]`,
    interviewTrap: 'OpenTelemetry defineste standardul de instrumentare si colectare; el nu ofera un spatiu de stocare propriu pe termen lung, ci deleaga catre instrumente specializate (Jaeger, Tempo, Prometheus).',
    keyTakeaway: 'OpenTelemetry Collector elimina blocarea intr-un singur furnizor (vendor lock-in) prin unificarea colectarii de traces, metrici si logs.'
  },
  {
    id: 'devops-43',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Kubernetes Init Containers: Executie Pregatitoare Secventiala',
    question: 'Ce sunt Init Containers intr-un Pod Kubernetes si cum le folosesti pentru a astepta ca baza de date sa fie disponibila inainte de pornirea aplicatiei?',
    answer: 'Un Pod poate defini unul sau mai multe containere speciale numite Init Containers:\n1. Executie Secventiala: Init containerele ruleaza si TREBUIE sa se finalizeze cu succes (Exit Code 0) UNUL DUPA ALTUL, inainte ca vreunul dintre containerele principale de aplicatie sa porneasca!\n2. Daca un Init Container pica, Kubernetes il restarteaza conform politicii restartPolicy a Pod-ului.\n\nCazuri Clasice de Utilizare:\n- Asteptarea disponibilitatii unei dependinte externe (ex: un script scurt care face polling pe portul PostgreSQL pana cand baza raspunde).\n- Rularea de scripturi de initializare a schemei de fisiere sau descarcarea de certificate securizate intr-un volum comun (emptyDir).',
    codeSnippet: `spec:
  initContainers:
    - name: wait-for-postgres
      image: busybox:1.36
      command: ['sh', '-c', 'until nc -z -w 2 postgres-service 5432; do echo "Astept DB..."; sleep 2; done;']
  containers:
    - name: backend-app
      image: ats/backend:v1`,
    interviewTrap: 'Init containerele partajeaza limitele de resurse cu pod-ul; asigura-te ca nu aloci cereri masive care ar impiedica programarea pod-ului pe nod.',
    keyTakeaway: 'Init Containers garanteaza indeplinirea preconditiilor de sistem inainte de lansarea aplicatiei principale.'
  },
  {
    id: 'devops-44',
    category: 'DEVOPS',
    difficulty: 'MEDIU',
    title: 'Infrastructure as Code (IaC): Declarativ vs Imperativ',
    question: 'Care este diferenta fundamentala dintre abordarea declarativa (Terraform) si abordarea imperativa (Ansible / Bash scripts) in gestionarea infrastructurii?',
    answer: '1. Abordarea Imperativa ("CUM sa faci" - ex: Bash Scripts):\n- Defineste pasii secventiali de executie: "Creeaza un VM, apoi instaleaza Docker, apoi deschide portul 80".\n- Problema: Daca rulezi scriptul a doua oara, poate crea un al doilea VM sau arunca eroare ("VM already exists") decat daca scrii zeci de verificari if manuale.\n\n2. Abordarea Declarativa ("CE doresti sa existe" - ex: Terraform, Kubernetes YAML):\n- Defineste starea finala dorita: "Vreau sa existe exact 3 masini virtuale cu specificatia X".\n- Motorul IaC calculeaza diferenta (Drift) intre starea curenta si starea dorita si aplica doar pasii minimi necesari pentru a ajunge la starea descrisa.\n- Idempotenta Nativa: Rularea aceleiasi configuratii de 10 ori produce exact acelasi rezultat!',
    codeSnippet: `// Declarativ in Terraform (Idempotent):
resource "aws_instance" "app_server" {
  count         = 3
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t3.micro"
}`,
    interviewTrap: 'Ansible poate fi scris atat imperativ cat si declarativ in functie de modulele folosite; Terraform este strict declarativ prin excelenta.',
    keyTakeaway: 'Abordarea declarativa garanteaza idempotenta si elimina erorile umane de configurare secventiala.'
  },
  {
    id: 'devops-45',
    category: 'DEVOPS',
    difficulty: 'DIFICIL',
    title: 'Kubernetes Operator Pattern si Custom Resource Definitions (CRDs)',
    question: 'Cum extinde Operator Pattern functionalitatea de baza din Kubernetes pentru automatizarea operatiunilor umane complexe?',
    answer: 'Kubernetes stie nativ sa reporneasca un container simplu care pica, dar NU stie sa faca operatii avansate de baze de date (ex: promovarea unei replici PostgreSQL la rang de Master, backup automat la miezul noptii sau rebalansarea de noduri Kafka).\n\nCe este un Operator (Operator Pattern):\nCombina o resursa personalizata (CRD - Custom Resource Definition) cu un Controller software dedicat care captureaza expertiza unui inginer de operatiuni uman:\n1. CRD (Schema): Defineste un tip nou de resursa declarativa in Kubernetes (ex: apiVersion: postgres-operator.com/v1, kind: PostgresCluster).\n2. Operator Controller (Bucla de Control):\nAsculta continuu evenimentele din cluster si implementeaza logica avansata de domeniu: backup automat, failover de noduri, comutare de replici si restaurare in caz de dezastru fara interventie umana!',
    codeSnippet: `# Resursa definita de un Operator de PostgreSQL:
apiVersion: "acid.zalan.do/v1"
kind: postgresql
metadata:
  name: acid-minimal-cluster
spec:
  teamId: "ats"
  volume:
    size: 50Gi
  numberOfInstances: 3
  users:
    ats_user: [superuser, createdb]`,
    interviewTrap: 'Crearea unui Operator custom este recomandata doar cand ai nevoie de operatiuni dinamice cu stare complexa; pentru aplicatii simple stateless un Deployment cu Helm este mai mult decat suficient.',
    keyTakeaway: 'Operator Pattern automatizeaza procedurile complexe de mentenanta si operatiuni prin bucle de control inteligente dedicate.'
  }
];
