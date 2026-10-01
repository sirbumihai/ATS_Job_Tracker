// Deck Masiv: Cloud Computing, AWS Architecture, Serverless & Terraform
// Preluat din: AWS Certified Solutions Architect Guides, HashiCorp Terraform Docs, DopplerHQ
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const CLOUD_DECK = [
  {
    id: 'cloud-01',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'Ce este un VPC si cum organizezi Subnet-urile Publice vs Private in AWS?',
    question: 'Ce este un Virtual Private Cloud (VPC) in AWS si de ce o baza de date sau un backend nu trebuie puse NICIODATA intr-un Subnet Public?',
    answer: 'Un VPC (Virtual Private Cloud) este o retea virtuala complet izolata si dedicata contului tau in infrastructura cloud.\n\nOrganizarea Subnet-urilor (Arhitectura pe 3 Nivele):\n1. Public Subnet:\n   - Are o tabela de rutare asociata direct cu un Internet Gateway (IGW).\n   - Resursele primesc adrese IP publice accesibile din Internet.\n   - Aici se plaseaza DOAR Load Balancer-ul (ALB) si eventual un Bastion Host (SSH Jump Server).\n\n2. Private Subnet:\n   - NU are ruta directa catre Internet Gateway; traficul outbound iese doar printr-un NAT Gateway controlat.\n   - Nu are IP-uri publice. Aici se plaseaza serverele de aplicatii backend (Spring Boot/Node.js) si nodurile de Kubernetes.\n\n3. Isolated Database Subnet:\n   - Nu are nici macar acces catre NAT Gateway; comunica doar intern in VPC cu backend-ul.\n   - Aici se plaseaza instantele de baze de date (RDS PostgreSQL, Aurora, Redis). Aceasta izolare previne orice atac direct din exterior pe portul 5432!',
    codeSnippet: `// Arhitectura VPC:
// Internet -> Internet Gateway -> Public Subnet (ALB)
//                                     |
//                               Private Subnet (Spring Boot Backend)
//                                     |
//                             Database Subnet (PostgreSQL RDS)`,
    interviewTrap: 'Daca plasezi baza de date in subnet public chiar si cu parola complexa, este scanata continuu de boti de brute-force si risca sa fie compromisa. Plaseaz-o mereu in subnet privat.',
    keyTakeaway: 'ALB in subnet public; backend si baze de date exclusiv in subneturi private protejate de Security Groups.'
  },
  {
    id: 'cloud-02',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Security Groups vs Network Access Control Lists (NACLs) in AWS',
    question: 'Care este diferenta dintre un Security Group (Stateful) si un Network ACL (Stateless) in securitatea cloud?',
    answer: '1. Security Groups (Nivel de Instanta / Stateful):\n   - Actioneaza ca un firewall virtual atasat direct unei placi de retea (ENI) a instantei (EC2, RDS, ECS).\n   - Sunt STATEFUL: Daca permiti traficul de intrare pe portul 443 (Inbound), traficul de raspuns este permis automat inapoi pe outbound, indiferent de regulile de iesire!\n   - Suporta doar reguli de PERMISIUNE (Allow Rules), tot restul fiind blocat implicit.\n\n2. Network ACLs (Nivel de Subnet / Stateless):\n   - Actioneaza ca un firewall la granita intregului Subnet.\n   - Sunt STATELESS: Fiecare pachet de intrare si iesire este verificat separat conform unei liste numerotate de reguli.\n   - Suporta atat reguli de ALLOW cat si reguli explicite de DENY (ideale pentru a bloca o adresa IP sau o clasa specifica de atacatori).',
    codeSnippet: `// Security Group Stateful:
// Inbound: Permite TCP 8080 de la Security Group-ul Load Balancer-ului
// Outbound: Raspunsul se intoarce automat fara configurare separata!`,
    interviewTrap: 'Daca configurezi o regula inbound intr-un NACL, trebuie sa configurezi explicit si porturile efemere (1024-65535) pe outbound pentru ca raspunsul sa poata parasi subnetul!',
    keyTakeaway: 'Security Groups sunt principala linie de aparare stateful la nivel de server; NACLs blocheaza adrese IP la granita subnetului.'
  },
  {
    id: 'cloud-03',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Ce este Infrastructure as Code (IaC) si de ce folosim Terraform?',
    question: 'Ce avantaje aduce Terraform (IaC) fata de crearea manuala a resurselor in consola AWS/Azure si ce este Terraform State File?',
    answer: 'Infrastructure as Code (IaC) inseamna definirea intregii infrastructuri (servere, baze de date, retele, permisiuni) in fisiere declarative de cod versionate cu Git.\n\nAvantaje Terraform:\n1. Repetabilitate & Audit: Poti recrea un mediu intreg identic (dev, staging, prod) in 5 minute, eliminand configuratiile manuale gresite.\n2. Cloud-Agnostic: Un singur limbaj declarativ (HCL - HashiCorp Configuration Language) pentru AWS, Azure, GCP, Cloudflare.\n3. Plan inainte de Apply: Comanda terraform plan arata exact ce resurse vor fi create, modificate sau distruse inainte de executie.\n\nTerraform State (terraform.tfstate):\nEste "sursa de adevar" care mapeaza codul tau cu resursele reale din cloud. In echipe se stocheaza securizat intr-un backend la distanta (ex: AWS S3 cu criptare si DynamoDB pentru state locking, prevenind rulari concurente simultane).',
    codeSnippet: `# Exemplu resursa declarativa Terraform:
resource "aws_s3_bucket" "cv_storage" {
  bucket = "jobflow-candidate-resumes-prod"

  tags = {
    Environment = "Production"
    ManagedBy   = "Terraform"
  }
}`,
    interviewTrap: 'Nu comite NICIODATA fisierul terraform.tfstate in repozitoriul Git public! Poate contine chei secrete, parole de baze de date si configuratii private in text clar.',
    keyTakeaway: 'IaC asigura consistenta infrastructurii; stocheaza state-ul in S3 cu DynamoDB locking pentru colaborare sigura.'
  },
  {
    id: 'cloud-04',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS IAM: Users, Groups, Roles si Instance Profiles',
    question: 'De ce serverele EC2 sau functiile Lambda nu trebuie sa foloseasca niciodata chei statice (Access Keys) si cum functioneaza IAM Roles?',
    answer: 'Pericolul Cheilor Statice (AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY):\nCheile statice sunt usor de comis accidental in GitHub, nu expira automat si reprezinta cauza principala a breselor de securitate in cloud.\n\nSolutie: IAM Roles & Instance Profiles\n1. Un IAM Role nu are credentiale permanente.\n2. Atasezi un Role unei instante EC2 sau functii Lambda.\n3. Serviciul intern AWS Metadata Service (IMDSv2) genereaza automat credentiale temporare cu expirare scurta (1 ora) si le roteste continuu in fundal.\n4. SDK-ul AWS (Java/Node) detecteaza automat aceste credentiale fara a fi nevoie sa configurezi vreo cheie secreta in cod!',
    codeSnippet: `// In codul Spring Boot / Java SDK - zero chei configurate in cod:
// SDK-ul ia automat credentialele din IAM Role Instance Profile:
S3Client s3 = S3Client.builder()
    .region(Region.EU_CENTRAL_1)
    .build();`,
    interviewTrap: 'Nu atasa politici cu drepturi de Administrator (AdministratorAccess) la un IAM Role de aplicatie; foloseste intotdeauna principiul privilegiilor minime (Least Privilege).',
    keyTakeaway: 'Foloseste IAM Roles pentru resurse de calcul pentru a elimina complet cheile statice de acces din cod si fisiere de configurare.'
  },
  {
    id: 'cloud-05',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Terraform Remote State si State Locking cu DynamoDB',
    question: 'Cum configurezi un backend la distanta in Terraform folosind S3 si DynamoDB si de ce este obligatoriu State Locking?',
    answer: 'Problema State-ului Local:\nDaca doi ingineri ruleaza terraform apply simultan de pe calculatoare diferite fara coordonare, amandoi vor citi si suprascrie fisierul de stare in acelasi timp, provocand coruperea ireversibila a starii si distrugerea de resurse!\n\nConfigurarea Backend-ului la Distanta (Remote State):\n1. AWS S3 Bucket: Stocheaza fisierul terraform.tfstate criptat cu KMS si cu versionare activa (Versioning) pentru a permite recuperarea in caz de corupere accidentala.\n2. AWS DynamoDB Table: Asigura mecanismul de State Locking. Cand un inginer ruleaza terraform plan sau apply, Terraform scrie o cheie atomica de lock in tabela DynamoDB. Daca altcineva incearca sa ruleze comanda in acelasi timp, primeste imediat mesajul "Error: Error acquiring the state lock" si executia este blocata pana la finalizarea primului proces.',
    codeSnippet: `# In main.tf / versions.tf:
terraform {
  backend "s3" {
    bucket         = "ats-terraform-state-prod"
    key            = "infrastructure/prod/terraform.tfstate"
    region         = "eu-central-1"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}`,
    interviewTrap: 'Daca o rulare de Terraform este intrerupta violent (SIGKILL), lock-ul poate ramane blocat in DynamoDB; acesta se elibereaza manual cu comanda: terraform force-unlock <LOCK_ID>.',
    keyTakeaway: 'S3 cu versionare ofera stocare sigura a starii, iar DynamoDB previne conflictele concurente prin locking atomic.'
  },
  {
    id: 'cloud-06',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'Clase de Stocare AWS S3 si Optimizarea Costurilor cu Lifecycle Rules',
    question: 'Care sunt clasele de stocare S3 (Standard, Intelligent-Tiering, Glacier) si cum configurezi o regula de Lifecycle pentru economisire?',
    answer: 'Niveluri de Stocare S3:\n1. S3 Standard: Disponibilitate maxima, acces instantaneu de mare viteza. Cel mai scump pe gigabyte (recomandat pentru CV-uri active, imagini de profil).\n2. S3 Intelligent-Tiering: Muta automat obiectele intre acces frecvent si infrecvent pe baza tiparelor reale de acces, fara taxe de recuperare (ideal cand nu stii cat de des vor fi accesate fisierele).\n3. S3 Standard-IA (Infrequent Access): Cost mic de stocare pe gigabyte, dar exista o mica taxa per cerere de descarcare. Recomandat pentru date arhivate lunar.\n4. S3 Glacier Flexible / Deep Archive: Cost minuscul (sub 1$ per TB/luna). Recuperarea fisierului dureaza de la cateva minute pana la 12 ore. Ideal pentru copii de siguranta anuale si cerinte legale de pastrare a arhivelor.',
    codeSnippet: `# Regula de Lifecycle in Terraform:
resource "aws_s3_bucket_lifecycle_configuration" "cv_lifecycle" {
  bucket = aws_s3_bucket.cv_storage.id

  rule {
    id     = "archive-old-cvs"
    status = "Enabled"

    transition {
      days          = 90
      storage_class = "STANDARD_IA" # Dupa 90 zile -> Standard-IA
    }

    transition {
      days          = 365
      storage_class = "GLACIER"     # Dupa 1 an -> Glacier
    }
  }
}`,
    interviewTrap: 'Nu muta fisiere minuscule sub 128 KB in Glacier sau Standard-IA; S3 aplica o taxa minima de 128 KB per obiect, facand stocarea fisierelor mici mai scumpa decat pe S3 Standard!',
    keyTakeaway: 'Lifecycle Rules automatizeaza tranzitia datelor catre clase mai ieftine, reducand costurile de stocare cu pana la 80%.'
  },
  {
    id: 'cloud-07',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Serverless Computing cu AWS Lambda: Cold Starts si Optimizare',
    question: 'Ce este un Cold Start in AWS Lambda, de ce este mai pronuntat pentru aplicatii Java si cum il reduci cu SnapStart?',
    answer: 'Ce este un Cold Start:\nCand o functie Lambda este apelata dupa o perioada de inactivitate, AWS trebuie sa aloce un microVM Firecracker nou, sa initializeze containerul de runtime si sa incarce codul aplicatiei in memorie inainte de a executa cererea (adaugand o latenta de 100ms - 3 secunde).\n\nDe ce Java are Cold Starts mari:\nJVM-ul clasic trebuie sa porneasca procesul Java, sa incarce sute de clase din JAR-uri si sa initializeze framework-ul (Spring Boot), putand atinge un Cold Start de 6-10 secunde!\n\nOptimizari de Productie:\n1. AWS Lambda SnapStart (Nativ pentru Java 11/17/21): La publicarea versiunii, AWS porneste functia o data, face un SNAPSHOT complet al memoriei JVM initializate si il stocheaza criptat pe disc. La un apel rece, AWS incarca snapshot-ul direct in memorie in sub 200 milisecunde!\n2. Provisioned Concurrency: Mentine un numar fix de instante Lambda calde si gata de executie continua (cu un mic cost fix).\n3. Compilare Nativa GraalVM: Transforma codul Java intr-un binar nativ executabil cu pornire instantanee in sub 50ms.',
    codeSnippet: `# Activare SnapStart in Terraform:
resource "aws_lambda_function" "job_processor" {
  function_name = "ats-job-processor"
  runtime       = "java21"
  handler       = "com.ats.LambdaHandler::handleRequest"
  snap_start {
    apply_on = "PublishedVersions" # SnapStart activ!
  }
}`,
    interviewTrap: 'La folosirea SnapStart, variabilele statice cu generare de numere aleatorii sau chei unice la startup trebuie resetate prin callback-ul CRaC (Coordinated Restore at Checkpoint) pentru a nu partaja aceeasi valoare pe toate instantele restaurate!',
    keyTakeaway: 'SnapStart si GraalVM reduc timpul de pornire al functiilor serverless Java la valori comparabile cu Go sau Node.js.'
  },
  {
    id: 'cloud-08',
    category: 'CLOUD',
    difficulty: 'DIFICIL',
    title: 'Amazon RDS vs Amazon Aurora: Arhitectura de Stocare',
    question: 'Ce diferentiaza Amazon Aurora de un PostgreSQL RDS standard si cum asigura replicarea pe 6 copii in 3 Zone de Disponibilitate?',
    answer: '1. Standard RDS PostgreSQL:\n- Foloseste un server EC2 cu disc atasat prin retea (AWS EBS).\n- Replicarea catre Read Replicas se face clasic prin streaming WAL peste retea.\n- Daca discul EBS este saturat de I/O, intreaga baza de date incetineste.\n\n2. Amazon Aurora (Cloud-Native Architecture):\n- Separa complet Procesarea (Compute) de Stocare (Storage Layer distribuit proprietar).\n- Aurora scrie DOAR logul de modificari (redo log) direct intr-o flota distribuita de mii de discuri SSD.\n- Scrie automat 6 copii ale datelor pe 3 Zone de Disponibilitate (2 copii per AZ), necesitand un cvorum de 4 din 6 pentru scriere si 3 din 6 pentru citire.\n- Replicile de citire (pana la 15 Read Replicas) citesc direct din acelasi strat comun de stocare, reducand Replication Lag-ul la sub 10 milisecunde!\n- Throughput de scriere de pana la 3-5 ori mai mare decat PostgreSQL standard.',
    codeSnippet: `# Terraform Aurora PostgreSQL Cluster:
resource "aws_rds_cluster" "aurora_db" {
  cluster_identifier = "ats-aurora-cluster"
  engine             = "aurora-postgresql"
  engine_version     = "16.1"
  database_name      = "ats_db"
  master_username    = "ats_admin"
  master_password    = var.db_password
}`,
    interviewTrap: 'Aurora este considerabil mai scumpa pe ora decat un mic RDS t4g.micro; pentru aplicatii mici de test RDS simplu este mai ieftin, dar pentru scalabilitate enterprise Aurora este imbatabila.',
    keyTakeaway: 'Amazon Aurora decupleaza stocarea de procesare, oferind replicare pe 3 zone si performanta de 5x peste RDS clasic.'
  },
  {
    id: 'cloud-09',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Modele de Pret EC2: On-Demand vs Reserved vs Spot Instances',
    question: 'Cum alegi intre instantele EC2 On-Demand, Savings Plans si Spot Instances pentru a reduce costurile cu pana la 70%?',
    answer: 'Modele de Cost EC2 in Cloud:\n1. On-Demand (Pret Intreg, Flexibilitate Maxima):\n- Platesti pe secunda/ora, poti porni si opri instanta oricand.\n- Cel mai scump model. Recomandat: aplicatii imprevizibile, teste de scurta durata.\n\n2. Savings Plans / Reserved Instances (Angajament pe 1 sau 3 ani):\n- Iti asumi un angajament de utilizare constanta (ex: 20$/ora timp de 1 an).\n- Ofera reduceri masive de pret intre 30% si 60% fata de On-Demand!\n- Recomandat: Baze de date de productie (RDS), clustere Kubernetes de baza care ruleaza 24/7.\n\n3. Spot Instances (Capacitate Excedenta Neutilizata):\n- AWS vinde serverele fizice libere ramase nefolosite cu reduceri uriase de pana la 70-90%!\n- Clauza Critica: Daca un client On-Demand cere serverul, AWS iti trimite o notificare de oprire cu doar 2 minute in avans si opreste instanta Spot!\n- Utilizare Ideala: Noduri de procesare in loturi (batch jobs), procesare video, noduri de worker stateless in Kubernetes (Karpenter).',
    codeSnippet: `// Mix de Flota in Kubernetes (EKS / Karpenter):
// 20% Noduri On-Demand / Savings Plan (pentru stabilitate de baza)
// 80% Noduri Spot Instances (pentru scalare masiva ieftina cu 70% discount)`,
    interviewTrap: 'Nu rula niciodata baze de date cu un singur nod pe Spot Instances; instanta poate fi terminata de AWS oricand la un varf de cerere globala in acea regiune.',
    keyTakeaway: 'Combina Savings Plans pentru sarcina de baza stabila cu Spot Instances pentru scalare elastica ieftina.'
  },
  {
    id: 'cloud-10',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS CloudFront si Origin Access Control (OAC)',
    question: 'Cum securizezi un bucket S3 astfel incat fisierele sa poata fi accesate EXCLUSIV prin CloudFront si niciodata direct prin link de S3?',
    answer: 'Problema Expunerii Directe a Bucket-ului S3:\nDaca lasi un bucket S3 deschis public pentru ca utilizatorii sa descarce avatare sau imagini, utilizatorii pot ocoli CDN-ul CloudFront, cauzand costuri mai mari de transfer de date si pierderea beneficiilor de Web Application Firewall (WAF) si caching.\n\nSolutie Moderna: Origin Access Control (OAC):\n1. S3 Block Public Access este activat 100% pe bucket (bucketul este complet privat).\n2. Se creeaza o resursa CloudFront OAC care semneaza criptografic (AWS SigV4) cererile trimise de CloudFront catre S3.\n3. Se adauga o Bucket Policy pe S3 care permite comanda s3:GetObject DOAR daca cererea provine de la identitatea distributiei tale specifice CloudFront!\n4. Orice incercare de accesare directa a link-ului s3.amazonaws.com este respinsa cu HTTP 403 Forbidden.',
    codeSnippet: `# S3 Bucket Policy restrictionata strict la CloudFront OAC:
{
  "Version": "2012-10-17",
  "Statement": {
    "Effect": "Allow",
    "Principal": { "Service": "cloudfront.amazonaws.com" },
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::ats-assets-bucket/*",
    "Condition": {
      "StringEquals": {
        "AWS:SourceArn": "arn:aws:cloudfront::123456789012:distribution/EDFDVBD632BHXR"
      }
    }
  }
}`,
    interviewTrap: 'Vechiul Origin Access Identity (OAI) este deprecated; foloseste intotdeauna noul Origin Access Control (OAC) care suporta toate regiunile si criptare KMS.',
    keyTakeaway: 'OAC garanteaza ca tot traficul catre fisierele S3 trece obligatoriu prin reteaua securizata si optimizata CloudFront.'
  },
  {
    id: 'cloud-11',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Route 53: Politici Avansate de Rutare DNS',
    question: 'Care sunt principalele politici de rutare in Route 53 (Latency, Failover, Geolocation) si cand le folosesti?',
    answer: 'Amazon Route 53 este serviciul de DNS gestionat de inalta disponibilitate:\n1. Simple Routing: Mapeaza un nume de domeniu pe o singura resursa sau returneaza o lista statica de IP-uri.\n2. Latency-Based Routing: Directioneaza utilizatorul catre regiunea AWS care ofera cea mai mica latenta de retea pentru locatia sa (ex: un user din Londra este trimis la eu-west-2, unul din New York la us-east-1).\n3. Failover Routing (Active-Passive Disaster Recovery):\nAsociat cu un Route 53 Health Check. Daca regiunea Primara pica, Route 53 ruteaza automat tot traficul catre regiunea Secundara de rezerva (sau catre o pagina statica de mentenanta pe S3).\n4. Geolocation Routing: Ruteaza traficul pe baza locatiei geografice exacte a utilizatorului (tara, continent) - ideal pentru conformitate legala GDPR (redirectionare automata a utilizatorilor din UE catre servere din UE) sau limba specifica.\n5. Weighted Routing: Imparte traficul procentual (ex: 90% pe v1, 10% pe v2 pentru teste canary).',
    codeSnippet: `# Record Route 53 Failover in Terraform:
resource "aws_route53_record" "primary" {
  zone_id = aws_route53_zone.main.zone_id
  name    = "api.ats.com"
  type    = "A"
  failover_routing_policy { type = "PRIMARY" }
  health_check_id = aws_route53_health_check.primary_check.id
  alias { ... }
}`,
    interviewTrap: 'Route 53 Geolocation ruteaza dupa tara utilizatorului; Geoproximity ruteaza dupa proximitatea geografica a resurselor cu posibilitate de bias ajustabil.',
    keyTakeaway: 'Route 53 ofera rutare inteligenta la nivel global si automatizeaza failover-ul in caz de dezastru prin health checks active.'
  },
  {
    id: 'cloud-12',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS SQS vs SNS si Modelul Fan-Out',
    question: 'Care este diferenta dintre Amazon SNS (Push) si Amazon SQS (Pull) si cum functioneaza arhitectura Fan-Out?',
    answer: '1. Amazon SNS (Simple Notification Service - Pub/Sub / Push Model):\n- Un emitent publica un mesaj intr-un SNS Topic.\n- SNS "impinge" (push) mesajul instantaneu catre toti abonatii inregistrati (multiple endpoint-uri HTTP, functii Lambda, SMS, email sau cozi SQS).\n- SNS nu pastreaza mesajele; daca niciun abonat nu asculta, mesajul este pierdut.\n\n2. Amazon SQS (Simple Queue Service - Coada de Mesaje / Pull Model):\n- Mesajele sunt stocate durabil pe disc intr-o coada pana cand un consumator le citeste (polling) si le sterge.\n\nArhitectura Fan-Out (SNS + Multiple Cozi SQS):\nUn emitent publica un eveniment "CandidateApplied" o singura data intr-un topic SNS.\nSNS multiplica mesajul si il trimite catre 3 cozi SQS independente:\n- Coada 1: Serviciul de Notificari Email\n- Coada 2: Serviciul de Evaluare CV cu AI\n- Coada 3: Serviciul de Audit si Conformitate\nFiecare serviciu isi consuma propria coada la propriul ritm, fara blocaje!',
    codeSnippet: `// Arhitectura Fan-Out:
// [Publisher] -> [SNS Topic: CandidateApplied]
//                     |--> [SQS Queue 1] -> [Email Worker]
//                     |--> [SQS Queue 2] -> [AI Worker]
//                     |--> [SQS Queue 3] -> [Analytics Worker]`,
    interviewTrap: 'Daca trimiti un mesaj dintr-o aplicatie catre o coada SQS standard, mesajele pot ajunge intr-o ordine usor diferita; daca ordinea stricta este obligatorie, foloseste o coada SQS FIFO (.fifo)!',
    keyTakeaway: 'Modelul Fan-Out combina broadcast-ul instant al SNS-ului cu persistenta si decuplarea cozilor SQS.'
  },
  {
    id: 'cloud-13',
    category: 'CLOUD',
    difficulty: 'DIFICIL',
    title: 'SQS Visibility Timeout si Dead Letter Queue (DLQ)',
    question: 'Ce este Visibility Timeout intr-o coada SQS si ce se intampla cand un mesaj ajunge in Dead Letter Queue?',
    answer: '1. Visibility Timeout in SQS:\nCand un worker consumator citeste un mesaj din coada (ReceiveMessage), mesajul NU este sters automat din SQS!\nIn schimb, SQS il marcheaza ca "invizibil" pentru toate celelalte workere concurente pe durata Visibility Timeout-ului configurat (implicit 30 de secunde).\n- Cazul Fericit: Workerul proceseaza mesajul cu succes si apeleaza explicit DeleteMessage. Mesajul este sters definitiv.\n- Cazul de Eseu: Workerul crapa sau arunca exceptie inainte de a sterge mesajul. Dupa expirarea celor 30 de secunde, mesajul redevine automat "VIZIBIL" in coada si este preluat de un alt worker sanatos!\n\n2. Dead Letter Queue (DLQ):\nDaca un mesaj contine date corupte (Poison Pill) si esueaza de fiecare data cand este preluat, acesta ar intra intr-o bucla infinita de esec.\nConfigurand o politica Redrive Policy (ex: maxReceiveCount = 3), dupa ce mesajul a esuat de 3 ori, SQS il muta automat intr-o coada separata de Dead Letter Queue (DLQ) pentru analiza manuala si alerte catre echipa.',
    codeSnippet: `# Configurare Redrive Policy pentru DLQ in Terraform:
resource "aws_sqs_queue" "job_dlq" {
  name = "job-processing-dlq"
}

resource "aws_sqs_queue" "job_queue" {
  name = "job-processing-queue"
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.job_dlq.arn
    maxReceiveCount     = 3 # Dupa 3 esecuri -> trimis in DLQ
  })
}`,
    interviewTrap: 'Daca procesarea unui mesaj dureaza 45 de secunde si Visibility Timeout este de doar 30 de secunde, alt worker va prelua acelasi mesaj inainte ca primul sa termine, cauzand procesare dubla! Mareste Visibility Timeout sau foloseste changeMessageVisibility dinamic.',
    keyTakeaway: 'Visibility Timeout asigura recuperarea la caderi de workere, iar DLQ izoleaza mesajele irecuperabile.'
  },
  {
    id: 'cloud-14',
    category: 'CLOUD',
    difficulty: 'DIFICIL',
    title: 'Amazon DynamoDB: Partition Key vs Sort Key si Indecsi GSI',
    question: 'Cum alegi o cheie primara compusa in DynamoDB si care este diferenta dintre un Global Secondary Index (GSI) si un Local Secondary Index (LSI)?',
    answer: 'DynamoDB este o baza de date NoSQL complet gestionata cu scalabilitate orizontala automata:\n1. Partition Key (PK / HASH):\nValoarea este trecuta printr-o functie de hash interna pentru a determina pe care partitie fizica de server este stocat randul. Trebuie sa aiba cardinalitate mare pentru a evita "Hot Partitions".\n2. Sort Key (SK / RANGE):\nStocheaza elementele din cadrul aceleiasi partitii ordonate fizic, permitand interogari de tip interval (<, >, BETWEEN, begins_with).\n\nIndecsi Secundari:\n1. LSI (Local Secondary Index):\n- Are aceeasi Partition Key ca tabela, dar o Sort Key diferita.\n- Poate fi creat EXCLUSIV la crearea tabelei (nu poate fi adaugat ulterior!).\n2. GSI (Global Secondary Index):\n- Poate avea o Partition Key COMPLET DIFERITA si o Sort Key complet diferita!\n- Poate fi creat sau sters oricand, chiar si pe tabele populate de productie cu miliarde de inregistrari.\n- Are propriile sale unitati independente de capacitate alocata (RCU/WCU).',
    codeSnippet: `// Model de Date Single-Table Design in DynamoDB:
// PK: "USER#123" | SK: "PROFILE" (Date utilizator)
// PK: "USER#123" | SK: "JOB#992"  (Aplicatie la job)
// GSI1-PK: "JOB#992" | GSI1-SK: "2026-03-01" (Interogheaza candidatii unui job)`,
    interviewTrap: 'Scrierile intr-un GSI sunt asincrone; un query pe un GSI ofera doar Eventual Consistency (nu suporta Strongly Consistent Reads).',
    keyTakeaway: 'Partition Key dicteaza distribuirea pe servere; GSI permite interogari flexibile pe atribute secundare.'
  },
  {
    id: 'cloud-15',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS ECS Fargate vs EKS: Cum Alegi Platforma de Containere',
    question: 'Cand alegi AWS ECS cu Fargate si cand este justificata trecerea la Kubernetes gestionat (AWS EKS)?',
    answer: '1. AWS ECS cu Fargate (Serverless Container Orchestration):\n- Simplu, nativ AWS, integrat perfect cu IAM, ALB si CloudWatch.\n- Cu Fargate (Serverless), nu administrezi nicio masina virtuala EC2! Pur si simplu ii spui "ruleaza containerul cu 1 CPU si 2GB RAM", iar AWS se ocupa de patching de securitate, scaling si operatiuni.\n- Curba de invatare foarte mica. Alegerea ideala pentru echipe mici si mijlocii care vor sa ruleze microservicii Docker fara batai de cap operationale.\n\n2. AWS EKS (Elastic Kubernetes Service):\n- Platforma standard Kubernetes open-source completa.\n- Ofera portabilitate totala (acelasi manifest K8s ruleaza pe AWS, Azure sau On-Premises) si acces la intregul ecosistem CNCF (Helm, ArgoCD, Istio, Prometheus).\n- Complexitate ridicata de configurare, necesita echipa dedicata de DevOps/SRE si vine cu o taxa fixa minima de ~75$/luna per cluster doar pentru control plane.',
    codeSnippet: `// Ghid de Decizie:
// Ai nevoie de portabilitate multi-cloud sau unelte specifice K8s? -> EKS
// Vrei sa rulezi containere rapid, ieftin si simplu pe AWS? -> ECS Fargate`,
    interviewTrap: 'Multe companii aleg EKS doar pentru ca este "la moda", irosind luni intregi pe configurare de retea si permisiuni cand ECS Fargate le-ar fi rezolvat cerintele intr-o saptamana.',
    keyTakeaway: 'ECS Fargate ofera simplitate serverless fara management de servere; EKS ofera portabilitate open-source si flexibilitate maxima.'
  },
  {
    id: 'cloud-16',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'AWS CloudWatch vs CloudTrail: Monitorizare vs Audit',
    question: 'Care este diferenta esentiala intre Amazon CloudWatch si AWS CloudTrail?',
    answer: 'Regula Simpla de Retinut: CloudWatch priveste la CE FACE APLICATIA; CloudTrail priveste la CINE A FACUT CE IN CONTUL AWS.\n\n1. Amazon CloudWatch (Monitorizare si Performanta):\n- Colecteaza metrici de performanta (utilizare CPU, numar cereri HTTP pe Load Balancer, spatiu liber pe disc).\n- Colecteaza logurile de aplicatie (CloudWatch Logs) emise de containere sau functii Lambda.\n- Declanseaza alerte (CloudWatch Alarms) cand un prag este depasit (ex: CPU > 80% trimite SMS prin SNS).\n\n2. AWS CloudTrail (Audit de Securitate si Guvernanta):\n- Inregistreaza fiecare apel de API efectuat in contul tau AWS!\n- Daca cineva sterge o baza de date sau creeaza un utilizator nou, CloudTrail inregistreaza exact: CINE a facut actiunea (utilizatorul IAM / adresa IP), CAND (timestamp precis) si CE comanda a rulat (DeleteDBInstance).',
    codeSnippet: `// CloudWatch = "Serverul are 90% CPU load si 5 erori in app.log"
// CloudTrail = "Inginerul Andrei a rulat StopInstances de la IP-ul 82.77.x.x la ora 14:02"`,
    interviewTrap: 'CloudTrail vine activat gratuit pe ultimele 90 de zile; pentru arhivare de audit pe termen lung de conformitate (ani de zile), trebuie sa creezi un "Trail" care salveaza evenimentele intr-un bucket S3 securizat.',
    keyTakeaway: 'CloudWatch monitorizeaza performanta aplicatiei; CloudTrail asigura auditul de securitate al tuturor actiunilor din cont.'
  },
  {
    id: 'cloud-17',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS KMS si Conceptul de Envelope Encryption',
    question: 'Ce este Envelope Encryption in AWS Key Management Service (KMS) si de ce nu folosim cheia principala pentru a cripta fisiere mari?',
    answer: 'AWS KMS (Key Management Service) gestioneaza cheile de criptare in module hardware de securitate (HSM - FIPS 140-2).\n\nDe ce nu criptam direct fisiere mari cu KMS:\nKMS suporta criptarea directa a unor date de maxim 4 KB per apel de API, iar trimiterea a gigabytes de date prin apeluri de retea catre KMS ar fi extrem de lenta si costisitoare!\n\nCum functioneaza Envelope Encryption (Criptarea in Plic):\n1. Cheia Principala (KMS Key / KMS Master Key): Nu paraseste niciodata modulul hardware securizat HSM.\n2. Generare Cheie de Date (DEK - Data Encryption Key):\nAplicatia apeleaza comanda kms:GenerateDataKey. KMS returneaza doua chei: o cheie DEK in clar (plaintext) si o copie a aceleiasi chei DEK criptata cu Master Key.\n3. Criptare Locala Rapida: Aplicatia cripteaza fisierul gigant local in memoria sa folosind cheia DEK in clar (algoritm AES-256 ultra-rapid).\n4. Stergerea Cheii DEK din Memorie: Imediat dupa criptare, aplicatia sterge cheia in clar din RAM si ataseaza cheia DEK criptata direct langa fisierul criptat (ca un plic exterior).\n5. La decriptare, trimiti doar plicul mic (cheia DEK criptata) la KMS pentru decriptare!',
    codeSnippet: `// Pasii Envelope Encryption:
// 1. GenerateDataKey() -> [DEK Plaintext] + [DEK Encrypted]
// 2. Encrypt(LargeFile, DEK Plaintext)
// 3. Delete DEK Plaintext from RAM
// 4. Save: [EncryptedFile] + [DEK Encrypted]`,
    interviewTrap: 'Envelope Encryption permite criptarea rapida a terabytes de date fara limitari de retea, combinand securitatea HSM cu viteza procesarii locale.',
    keyTakeaway: 'KMS protejeaza cheia principala, in timp ce cheile de date derivate (DEK) cripteaza fisierele mari local.'
  },
  {
    id: 'cloud-18',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'AWS Secrets Manager vs Systems Manager (SSM) Parameter Store',
    question: 'Cand alegi SSM Parameter Store si cand merita sa platesti pentru AWS Secrets Manager?',
    answer: '1. SSM Parameter Store:\n- Gratuit (in nivelul standard) sau cost extrem de mic per parametru.\n- Suporta tipuri String, StringList si SecureString (criptat gratuit cu cheie KMS).\n- Ideal pentru: variabile de configurare, URL-uri, flag-uri de mediu si token-uri simple care nu se schimba des.\n- Nu are rotire automata nativa integrata.\n\n2. AWS Secrets Manager:\n- Cost fix de ~0.40$ per secret pe luna plus o mica taxa per apel.\n- Functie Cheie Speciala: Suport Nativ pentru Rotire Automata de Parole (Automatic Secret Rotation):\nSe integreaza nativ cu Amazon RDS (PostgreSQL, MySQL). La fiecare 30 de zile, o functie Lambda schimba automat parola in baza de date si actualizeaza secretul in Secrets Manager FARA DOWNTIME pentru aplicatie!',
    codeSnippet: `# Citire parametru din SSM in Spring Boot (folosind spring-cloud-starter-aws):
spring:
  config:
    import: "aws-parameterstore:/config/ats-backend/"`,
    interviewTrap: 'Daca ai nevoie doar sa stochezi un secret care nu necesita rotire automata lunara, foloseste SSM Parameter Store SecureString pentru a economisi costurile lunare din Secrets Manager.',
    keyTakeaway: 'SSM Parameter Store pentru configurari generale si secrete statice; Secrets Manager pentru rotire automata de parole de baze de date.'
  },
  {
    id: 'cloud-19',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'VPC Peering vs AWS Transit Gateway',
    question: 'De ce conexiunile VPC Peering devin greu de intretinut in companii mari si cum simplifica AWS Transit Gateway arhitectura de retea?',
    answer: 'Problema VPC Peering ("Mesh Hell"):\n1. Non-Tranzitivitate: Daca VPC A este legat de VPC B, si VPC B este legat de VPC C, VPC A NU POATE vorbi cu VPC C prin tranzitul lui B!\n2. La 10 retele VPC diferite (pentru microservicii, securitate, baze de date), ai nevoie de: N * (N - 1) / 2 = 45 de conexiuni de peering individuale si sute de rute de intretinut manual!\n\nSolutie: AWS Transit Gateway (Modelul Hub-and-Spoke):\n- Actioneaza ca un ruter de retea central in cloud.\n- Fiecare VPC se conecteaza printr-o singura legatura la Transit Gateway (Hub).\n- Retelele VPC pot comunica instantaneu intre ele prin intermediul gateway-ului central, permitand adaugarea de noi medii in mod modular si integrarea simpla cu conexiunile On-Premises (VPN / Direct Connect).',
    codeSnippet: `// VPC Peering: 10 VPC-uri = 45 conexiuni complexe "panza de paianjen"
// Transit Gateway: 10 VPC-uri = 10 conexiuni catre un ruter central`,
    interviewTrap: 'Transit Gateway are un cost orar fix per atasament plus taxa pe gigabyte transferat; pentru doua VPC-uri simple, un VPC Peering direct gratuit este mai economic.',
    keyTakeaway: 'Transit Gateway transforma o retea fragmentata intr-o arhitectura centralizata Hub-and-Spoke scalabila la zeci de conturi.'
  },
  {
    id: 'cloud-20',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS WAF (Web Application Firewall): Protectie Anti-Atacuri',
    question: 'Ce tipuri de atacuri opreste AWS WAF si cum configurezi o regula de Rate-Limiting la nivel de IP?',
    answer: 'AWS WAF este un firewall de nivel aplicatie (Layer 7) care se ataseaza pe Application Load Balancer (ALB), CloudFront sau API Gateway:\n\nProtectii Asigurate:\n1. Prevenirea atacurilor OWASP Top 10: SQL Injection (SQLi), Cross-Site Scripting (XSS), Log4j RCE exploits (reguli gestionate automat de AWS - Managed Rulesets).\n2. Rate-Based Rules (Anti-DDoS la nivel de aplicatie):\nPoti defini o regula care blocheaza automat orice adresa IP care trimite mai mult de 500 de cereri intr-un interval de 5 minute, protejand backend-ul de atacuri de forta bruta sau scraperi agresivi.\n3. Blocare Geografica: Interzice accesul cererilor provenite din tari specifice.',
    codeSnippet: `# Regula Rate-Based in Terraform pentru AWS WAFv2:
resource "aws_wafv2_web_acl" "main_waf" {
  name  = "ats-web-waf"
  scope = "REGIONAL"

  rule {
    name     = "RateLimitPerIP"
    priority = 1
    action { block {} }

    statement {
      rate_based_statement {
        limit              = 500 # Max 500 cereri / 5 min
        aggregate_key_type = "IP"
      }
    }
    visibility_config { ... }
  }
}`,
    interviewTrap: 'Daca plasezi WAF pe Load Balancer-ul intern in spatele CloudFront, IP-ul vazut va fi al CloudFront-ului decat daca configurezi corect verificarea antetului X-Forwarded-For.',
    keyTakeaway: 'AWS WAF filtreaza traficul HTTP malitios si blocheaza tentativele de abuz si SQL Injection inainte ca cererea sa ajunga la codul Java.'
  },
  {
    id: 'cloud-21',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Comenzi Avansate de Stare in Terraform: import, state rm si mv',
    question: 'Cum aduci o resursa creata manual in consola AWS sub controlul Terraform folosind comanda terraform import?',
    answer: 'Deseori o resursa critica (ex: un bucket S3 sau o baza de date) este creata manual din consola inainte de a adopta Terraform.\n\nCum o aduci in codul Terraform fara a o recrea sau sterge:\n1. Scrii definitia resursei goale in fisierul .tf: resource "aws_s3_bucket" "existing" { bucket = "nume-real-bucket" }.\n2. Rulezi comanda de import: terraform import aws_s3_bucket.existing nume-real-bucket.\n3. Terraform citeste metadatele reale din cloud si le scrie in fisierul local terraform.tfstate!\n4. Rulezi terraform plan pentru a alinia proprietatile din cod cu starea reala pana cand planul arata: "No changes. Your infrastructure matches the configuration."\n\nAlte Comenzi de Stare:\n- terraform state rm: Scoate o resursa din starea Terraform fara a o sterge din cloud-ul real (util cand vrei sa nu mai fie gestionata de IaC).\n- terraform state mv: Redenumeste o resursa in cod fara ca Terraform sa incerce sa o distruga si sa o recreeze.',
    codeSnippet: `# Importul unui bucket existent in codul Terraform:
terraform import aws_s3_bucket.resumes ats-candidate-resumes-2026`,
    interviewTrap: 'Incepand cu Terraform 1.5+, poti folosi blocul declarativ import { to = aws_s3_bucket.x, id = "nume" } direct in codul .tf fara a rula comenzi manuale din CLI.',
    keyTakeaway: 'terraform import leaga resursele existente din cloud de definitiile declarative de cod fara pierdere de date.'
  },
  {
    id: 'cloud-22',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'FinOps: Practici de Optimizare a Facturii de Cloud',
    question: 'Ce este practica de FinOps si care sunt primele 4 actiuni pe care le iei pentru a reduce o factura umflata de AWS?',
    answer: 'FinOps (Financial Operations) este practica culturala de a aduce responsabilitatea financiara a costurilor de cloud in mainile echipelor de dezvoltare si operatiuni.\n\nTop 4 Actiuni Imediate de Reducere a Costurilor:\n1. Identificarea si Stergerea Resurselor Neutilizate (Zombie Resources):\n- Volume de disc EBS neatasate niciunui server (Available EBS volumes).\n- Adrese Elastic IP neasociate care genereaza taxe pe ora.\n- Snapshot-uri vechi uitate de ani de zile.\n2. Corectarea Supradimensionarii (Right-Sizing):\nVerificarea metricilor CloudWatch: daca o instanta EC2 sau RDS ruleaza constant la sub 10% CPU, se retrogradeaza la o clasa mai mica (ex: de la m5.xlarge la t4g.medium).\n3. Trecerea la Procesoare ARM Graviton: Trecerea instantanee de la instante x86 (m5) la instante ARM AWS Graviton (m7g) aduce o economie de 20% la pret si 20% spor de performanta!\n4. Aplicarea de Savings Plans si reguli de S3 Lifecycle.',
    codeSnippet: `# AWS Cost Allocation Tags esentiale:
tags = {
  Project     = "ATS_Tracker"
  Environment = "Staging"
  Owner       = "Mihai"
  CostCenter  = "HR_Tech"
}`,
    interviewTrap: 'Niciodata nu poti optimiza ce nu poti masura: fara aplicarea de Tag-uri obligatorii pe resurse (Cost Allocation Tags), este imposibil sa stii ce microserviciu consuma banii.',
    keyTakeaway: 'FinOps asigura eficienta financiara prin eliminarea risipei, right-sizing si adoptarea arhitecturilor ARM Graviton.'
  },
  {
    id: 'cloud-23',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'Modelul Responsabilitatii Partajate (Shared Responsibility Model)',
    question: 'Care este impartirea responsabilitatilor intre furnizorul cloud (AWS) si client pentru un serviciu IaaS (EC2) vs PaaS (RDS) vs SaaS?',
    answer: 'Principiul Oficial: AWS este responsabil pentru Securitatea CLOUD-ULUI (Security OF the Cloud), iar Clientul este responsabil pentru Securitatea IN CLOUD (Security IN the Cloud).\n\n1. Infrastructura ca Serviciu (IaaS - ex: EC2):\n- AWS raspunde de: centre de date fizice, hardware, cabluri de retea, virtualizare (Hypervisor).\n- Clientul raspunde de: sistemul de operare de pe server (patching Linux/Windows), antivirus, firewall (Security Groups), date, cod si configuratii de retea.\n\n2. Platforma ca Serviciu (PaaS - ex: RDS PostgreSQL, Lambda):\n- AWS raspunde in plus si de: sistemul de operare al bazei de date, actualizari de securitate ale motorului Postgres, runtime-ul Java.\n- Clientul raspunde de: datele stocate, parolele de utilizatori, configuratiile de conexiune si regulile de firewall de retea.\n\n3. Software ca Serviciu (SaaS):\n- Furnizorul gestioneaza aproape totul; clientul raspunde doar de credentialele sale de login si de datele introduse.',
    codeSnippet: `// Tabel IaaS vs PaaS:
// EC2 (IaaS): Tu faci "sudo apt-get update" si instalezi patch-uri de Linux kernel!
// RDS (PaaS): AWS face patch-urile de OS automat in ferestrele de mentenanta!`,
    interviewTrap: 'Multi candidati cred gresit ca daca sunt in cloud, AWS le face backup automat la servere si le protejeaza codul de SQL Injection; ambele sunt 100% responsabilitatea clientului!',
    keyTakeaway: 'Furnizorul asigura fundatia fizica si infrastructura; clientul isi protejeaza intotdeauna propriile date si aplicatii.'
  },
  {
    id: 'cloud-24',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Step Functions: Orchestarea Fluxurilor Serverless',
    question: 'Ce este o masina de stari in AWS Step Functions si cum inlocuieste lanturile complexe de apeluri Lambda in cascada?',
    answer: 'Problema Inlantuiri Lambdas (Lambda Spaghetti Anti-Pattern):\nDaca Lambda A apeleaza sincron Lambda B, care apeleaza Lambda C: Lambda A sta blocata in asteptare si platesti pentru timpul ei de inactivitate! Daca Lambda C pica, este extrem de greu sa faci rollback sau reincercari automate.\n\nAWS Step Functions (Serverless State Machine):\n1. Defineste vizual un flux complet de lucru (Workflows) in limbajul Amazon States Language (JSON/YAML):\n   - Pasi secventiali\n   - Ramuri paralele (Parallel State)\n   - Decizii conditionale (Choice State)\n   - Bucle si asteptari de timp (Wait State).\n2. Gestionare Automata a Erorilor: Configureaza politici native de Retry cu backoff exponential si Catch blocks pentru erori specifice.\n3. Implementarea Saga Pattern: Permite definirea de actiuni compensatorii automate in caz de esec la jumatatea fluxului fara nicio linie de cod de infrastructura!',
    codeSnippet: `{
  "StartAt": "ValideazaCV",
  "States": {
    "ValideazaCV": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:valideaza",
      "Next": "TrimiteLaProcesareAI"
    },
    "TrimiteLaProcesareAI": {
      "Type": "Task",
      "Resource": "arn:aws:lambda:...:procesareAi",
      "End": true
    }
  }
}`,
    interviewTrap: 'Step Functions este extrem de robust, dar fiecare tranzitie de stare are un mic cost de apel; pentru micro-operatiuni de milioane de ori pe secunda, Express Workflows este optiunea mai ieftina decat Standard Workflows.',
    keyTakeaway: 'Step Functions aduce vizibilitate grafica, rezilienta la erori si management al tranzactiilor compensatorii peste arhitecturile serverless.'
  },
  {
    id: 'cloud-25',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Amazon Athena si AWS Glue: Serverless Data Analytics',
    question: 'Cum rulezi interogari SQL direct peste fisiere JSON sau Parquet stocate in S3 folosind Amazon Athena fara a rula un server de baza de date?',
    answer: 'Amazon Athena este un motor de interogare distribuit interactiv serverless bazat pe open-source-ul Trino/Presto:\n1. Fara Baza de Date Traditionala: Datele raman nemodificate in bucket-ul tau S3 sub forma de fisiere brute (CSV, JSON, Apache Parquet sau ORC).\n2. AWS Glue Data Catalog: Actioneaza ca un catalog central de metadate (schema). Un Glue Crawler scaneaza fisierele din S3 si deduce automat schema tabelelor si tipurile de coloane.\n3. Interogare SQL Standard: Deschizi consola Athena si scrii comenzi SQL standard: SELECT * FROM ats_logs WHERE status = \'FAILED\' LIMIT 10.\n4. Model de Cost: Platesti exclusiv pentru cantitatea de date SCANATE de pe disc (5$ per 1 TB scanat). Daca convertesti fisierele in format columnar comprimat Parquet, scanarea scade cu 90%, costand cativa centi!',
    codeSnippet: `-- Interogare SQL pur peste fisiere din S3 in Amazon Athena:
SELECT 
    candidate_id, 
    COUNT(*) as total_applications
FROM ats_analytics_database.job_events_parquet
WHERE event_date >= '2026-01-01'
GROUP BY candidate_id;`,
    interviewTrap: 'Daca interoghezi fisiere mari CSV necomprimate, Athena va scana tot fisierul de la cap la coada si va costa mai mult; converteste intotdeauna datele in format columnar Parquet cu partitionare dupa data.',
    keyTakeaway: 'Athena si Glue ofera capabilitati analitice de Big Data direct peste datele din S3 fara a intretine baze de date costisitoare.'
  },
  {
    id: 'cloud-26',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Organizations si Service Control Policies (SCPs)',
    question: 'Ce sunt Service Control Policies (SCPs) si cum impun bariere de securitate (Guardrails) deasupra tuturor conturilor dintr-o organizatie?',
    answer: 'In companii moderne, mediile sunt separate pe conturi AWS complet diferite (Cont de Dev, Cont de Staging, Cont de Audit, Cont de Productie) unite sub AWS Organizations.\n\nService Control Policies (SCPs):\nSunt politici de securitate la cel mai inalt nivel administrativ al organizatiei:\n- Ofera "Guardrails" obligatorii care NU POT fi ocolite de niciun utilizator din conturile copil, NICI MACAR DE CATRE ROOT-UL acelui cont!\n\nExemple Clasice de Reguli SCP in Productie:\n1. Restrictie Geografica: Interzice crearea oricarei resurse in afara regiunii aprobate eu-central-1 (pentru a preveni costuri sau incalcari GDPR).\n2. Protectia Jurnalelor: Blocheaza comanda de oprire sau stergere a log-urilor CloudTrail si a regulilor GuardDuty.\n3. Interzicerea Instantelor Scumpe: Blocheaza pornirea de servere EC2 gigantice neautorizate in mediile de dezvoltare.',
    codeSnippet: `# SCP care blocheaza orice regiune in afara de Frankfurt (eu-central-1):
{
  "Version": "2012-10-17",
  "Effect": "Deny",
  "NotAction": [ "iam:*", "organizations:*", "route53:*" ],
  "Resource": "*",
  "Condition": {
    "StringNotEquals": {
      "aws:RequestedRegion": ["eu-central-1"]
    }
  }
}`,
    interviewTrap: 'SCPs pot doar sa interzica (Deny) permisiuni; ele nu acorda drepturi direct (utilizatorii au nevoie in continuare de politici IAM normale in interiorul contului lor).',
    keyTakeaway: 'SCPs asigura guvernanta centralizata a securitatii si previn configuratiile gresite in arhitecturi multi-cont.'
  },
  {
    id: 'cloud-27',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Terraform count vs for_each: Prevenirea Distrugerilor Accidentale',
    question: 'De ce este periculos sa folosesti count pentru liste de resurse in Terraform si de ce for_each este solutia recomandata?',
    answer: 'Problema cu count (Index Numeric 0, 1, 2):\nDaca creezi resurse cu count = length(var.subnets) peste o lista ["subnet-a", "subnet-b", "subnet-c"]:\nTerraform le asociaza intern ca subnet[0], subnet[1], subnet[2].\nDaca cineva STERGE primul element ("subnet-a") din lista, noul element de pe indexul 0 devine "subnet-b"!\nLa urmatorul terraform apply, Terraform va incerca sa distruga si sa recreeze TOATE resursele pentru ca indicii numerici s-au decalat cu o pozitie!\n\nSolutie: for_each (Asociere dupa Cheie Unica de String):\nfor_each mapeaza resursele dupa un Set sau Dictionar cu chei explicite: subnet["subnet-a"], subnet["subnet-b"].\nDaca stergi "subnet-a", Terraform stie sa stearga EXCLUSIV acea resursa, lasand restul de resurse complet neatinse!',
    codeSnippet: `# GRESIT si FRAGIL (count):
# resource "aws_subnet" "list" { count = length(var.cidrs) }

# CORECT si SIGUR (for_each):
resource "aws_subnet" "safe" {
  for_each   = toset(["10.0.1.0/24", "10.0.2.0/24"])
  cidr_block = each.value
}`,
    interviewTrap: 'for_each necesita valori cunoscute la faza de plan (nu poti folosi un output generat dinamic in timpul aplicarii decat daca este derivat din chei statice).',
    keyTakeaway: 'Foloseste for_each pentru a asigura stabilitatea resurselor si a evita recrearea in cascada a infrastructurii la modificari de liste.'
  },
  {
    id: 'cloud-28',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Terraform Lifecycle: create_before_destroy si prevent_destroy',
    question: 'Cum previi stergerea accidentala a unei baze de date de productie in Terraform si cum asiguri zero downtime la inlocuirea unui certificat TLS?',
    answer: 'Blocul lifecycle dintr-o resursa Terraform controleaza modul in care Terraform gestioneaza schimbarile:\n\n1. prevent_destroy = true (Protectie Anti-Dezastru):\nDaca un inginer modifica codul intr-un mod care ar forta stergerea bazei de date (ex: modificarea numelui bazei), comanda terraform apply va esua imediat cu eroare, refuzand sa distruga resursa protejata!\n\n2. create_before_destroy = true (Zero Downtime):\nIn mod normal, daca o resursa trebuie inlocuita, Terraform o sterge pe cea veche si apoi o creeaza pe cea noua (cauzand cateva minute de downtime!). Cu acest flag, Terraform creeaza MAI INTAI noua resursa (ex: noul certificat SSL), o leaga, si abia dupa ce este activa o sterge pe cea veche.\n\n3. ignore_changes: Instruieste Terraform sa ignore modificarile facute in mod dinamic din exterior pe anumite atribute (ex: tag-uri adaugate automat de AWS sau numarul curent de replici scalat de un HPA extern).',
    codeSnippet: `resource "aws_db_instance" "production_db" {
  allocated_storage = 100
  engine            = "postgres"

  lifecycle {
    prevent_destroy = true # Blocheaza orice stergere accidentala!
  }
}`,
    interviewTrap: 'Daca ai prevent_destroy activat si chiar vrei sa stergi resursa in mod legitim, trebuie sa comentezi manual blocul lifecycle inainte de apply.',
    keyTakeaway: 'Meta-argumentele de lifecycle protejeaza datele critice de distrugeri accidentale si asigura tranzitii fara downtime.'
  },
  {
    id: 'cloud-29',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'AWS Systems Manager Session Manager in Loc de Bastion Host SSH',
    question: 'Cum te conectezi securizat la un server privat din AWS fara a avea portul SSH 22 deschis si fara chei .pem folosind SSM Session Manager?',
    answer: 'Problema Bastion Host-ului Traditional:\nNecesita un server expus public pe internet, portul 22 deschis, mentinerea de chei private SSH (.pem) si riscuri continue de scanare si atacuri de forta bruta.\n\nRevolutia AWS Systems Manager (SSM) Session Manager:\n1. Zero Porturi Deschise: Serverul din subnetul privat NU ARE NICIUN PORT DESCHIS in Security Group (nici macar portul 22!). Nu are IP public.\n2. Comunicare Outbound Sigura: Un agent (SSM Agent instalat pe instanta) deschide o conexiune criptata de iesire (outbound HTTPS pe portul 443) catre endpoint-ul securizat AWS SSM.\n3. Autentificare prin IAM: Inginerul se autentifica prin consola AWS sau AWS CLI (aws ssm start-session --target i-12345). Accesul este controlat prin permisiuni IAM si autentificare multi-factor (MFA).\n4. Audit Integrat: Fiecare comanda tastata in terminal este inregistrata integral in CloudWatch Logs si S3 pentru audit.',
    codeSnippet: `# Conectare sigura din terminal fara chei SSH:
aws ssm start-session --target i-0a8b7c6d5e4f3210`,
    interviewTrap: 'Pentru ca SSM sa functioneze, instanta EC2 trebuie sa aiba atasat un IAM Role cu politica AmazonSSMManagedInstanceCore si acces outbound la internet sau un VPC Endpoint pentru SSM.',
    keyTakeaway: 'Session Manager elimina cheile SSH si porturile publice deschise, aducand acces securizat gestionat prin IAM.'
  },
  {
    id: 'cloud-30',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Amazon EventBridge: Decuplare Event-Driven in Cloud',
    question: 'Ce este Amazon EventBridge si cum simplifica arhitectura bazata pe evenimente comparativ cu apelurile directe de API?',
    answer: 'Amazon EventBridge este un magistral serverless de evenimente (Serverless Event Bus) care ruteaza date in timp real intre aplicatiile tale, servicii native AWS si aplicatii SaaS partenere (Stripe, Datadog, Zendesk):\n\nCaracteristici Cheie:\n1. Content-Based Filtering: Ruteaza evenimentele pe baza continutului payload-ului JSON! Un consumer poate primi evenimente DOAR daca status === "ACCEPTED" si salary > 50000, eliminand necesitatea ca aplicatia consumatoare sa filtreze mesaje irelevante.\n2. Decuplare Totala: Emitentul arunca un eveniment in EventBridge fara sa stie cine il va consuma (Lambda, SQS, Step Functions sau un endpoint HTTP extern prin API Destinations).\n3. Schema Registry: Detecteaza si valideaza automat structura JSON a evenimentelor.',
    codeSnippet: `# Regula EventBridge care filtreaza cereri de angajare urgente:
{
  "source": ["ats.jobs"],
  "detail-type": ["JobApplicationSubmitted"],
  "detail": {
    "priority": ["HIGH"],
    "department": ["Engineering"]
  }
}`,
    interviewTrap: 'EventBridge are o latenta medie de ~20-50ms; daca ai nevoie de procesare de mare viteza la microsecunde, Kafka (MSK) sau Kinesis sunt solutiile mai potrivite.',
    keyTakeaway: 'EventBridge simplifica rutarea inteligenta a evenimentelor in cloud prin filtrare declarativa pe continutul JSON.'
  },
  {
    id: 'cloud-31',
    category: 'CLOUD',
    difficulty: 'DIFICIL',
    title: 'AWS Global Accelerator vs CloudFront: Diferente Cheie',
    question: 'Care este diferenta dintre AWS Global Accelerator si CloudFront si cand alegi Global Accelerator pentru protocoale non-HTTP?',
    answer: '1. Amazon CloudFront (Content Delivery Network - Layer 7):\n- Conceput special pentru CACHING de continut HTTP/HTTPS (fisiere statice, video, HTML, API-uri).\n- Termina conexiunea TLS la Edge si memoreaza fisierele in cache-ul local.\n\n2. AWS Global Accelerator (Optimizare de Retea - Layer 4 TCP/UDP):\n- NU FACE CACHING de continut!\n- Ofera doua adrese IP Anycast statice globale care ruteaza traficul direct catre cel mai apropiat punct de prezenta (PoP) al retelei private din fibra optica a AWS.\n- Traficul utilizatorului intra pe reteaua privata ultra-rapida a AWS chiar din orasul sau, evitand aglomeratia si pierderile de pachete de pe internetul public!\n- Suporta orice protocol TCP/UDP (jocuri video multiplayer, VoIP, streaming WebRTC, conexiuni IoT, socket-uri) si ofera failover instantaneu de adrese IP intre regiuni in sub 30 de secunde.',
    codeSnippet: `// CloudFront: Pentru caching HTTP/HTTPS (Web sites, Imagini, REST APIs)
// Global Accelerator: Pentru conexiuni TCP/UDP continue rapide si IP-uri Anycast fixe`,
    interviewTrap: 'Daca ai nevoie de caching de imagini, Global Accelerator nu te ajuta deloc deoarece nu stocheaza nimic in cache; el optimizeaza exclusiv viteza rutelor de retea.',
    keyTakeaway: 'CloudFront este pentru caching web HTTP; Global Accelerator accelereaza traficul TCP/UDP direct pe reteaua privata de fibra AWS.'
  },
  {
    id: 'cloud-32',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Disaster Recovery in Cloud: Multi-AZ vs Multi-Region',
    question: 'Care este diferenta de cost, complexitate si latenta intre o arhitectura Multi-AZ si o arhitectura Multi-Region?',
    answer: '1. Multi-AZ (High Availability in Aceeasi Regiune):\n- Instantele ruleaza in centre de date fizice diferite (Zone de Disponibilitate, ex: Frankfurt AZ-1a si AZ-1b) situate la cativa kilometri distanta.\n- Replicare Sincrona: Latenta de retea este infima (< 2ms).\n- Protejeaza impotriva: Caderii unui intreg centru de date (inundatie, pana masiva de curent).\n- Cost si complexitate reduse: Standardul de aur pentru 99% din aplicatii.\n\n2. Multi-Region (Disaster Recovery Global peste Continente):\n- Aplicatia ruleaza pe regiuni geografice complet separate (ex: Frankfurt eu-central-1 si Virginia us-east-1).\n- Replicare Asincrona: Din cauza vitezei luminii pe distante de mii de kilometri, replicarea sincrona este imposibila (latenta de 80-120ms).\n- Protejeaza impotriva: Unui dezastru catastrofal la nivelul unei intregi tari sau caderii globale a serviciilor AWS dintr-o regiune intreaga.\n- Costuri uriase de infrastructura dublata si complexitate masiva de sincronizare a bazelor de date.',
    codeSnippet: `// Nivele de protectie:
// Multi-AZ = Inalta Disponibilitate (High Availability, 99.99%)
// Multi-Region = Recuperare dupa Dezastru (Disaster Recovery & Business Continuity)`,
    interviewTrap: 'Multi-Region aduce provocarea transferului de date intre regiuni (Data Transfer Out fees) si rezolvarea conflictelor de scriere; nu o adopta decat daca cerintele de afaceri o impun categoric.',
    keyTakeaway: 'Multi-AZ asigura rezilienta la caderi de datacenter local cu latenta minima; Multi-Region asigura supravietuirea globala a afacerii.'
  },
  {
    id: 'cloud-33',
    category: 'CLOUD',
    difficulty: 'USOR',
    title: 'AWS Well-Architected Framework: Cele 6 Coloane Fundamentale',
    question: 'Care sunt cele 6 coloane (Pillars) ale AWS Well-Architected Framework si ce principii ghideaza fiecare?',
    answer: 'AWS Well-Architected Framework ofera principiile arhitecturale oficiale pentru crearea de sisteme sigure si eficiente in cloud:\n1. Operational Excellence: Rularea si monitorizarea sistemelor pentru a livra valoare de business, automatizarea proceselor de lansare si invatarea din fiecare incident (post-mortems).\n2. Security: Protectia datelor, sistemelor si activelor prin aplicarea privilegiilor minime, criptare in repaus si tranzit si audit continuu.\n3. Reliability: Capacitatea sistemului de a-si reveni automat din caderi (Self-Healing), testarea procedurilor de recuperare si scalare orizontala.\n4. Performance Efficiency: Utilizarea eficienta a resurselor de calcul, selectarea tipului optim de instanta (ARM vs x86) si arhitecturi serverless/event-driven.\n5. Cost Optimization: Eliminarea risipei de bani, intelegerea cheltuielilor prin tagging si utilizarea de modele rezervate/spot.\n6. Sustainability: Minimizarea impactului asupra mediului prin reducerea consumului inutil de energie si calcul.',
    codeSnippet: `// Cele 6 Coloane:
// 1. Operational Excellence | 2. Security | 3. Reliability
// 4. Performance Efficiency | 5. Cost Optimization | 6. Sustainability`,
    interviewTrap: 'Coloana "Sustainability" este cea mai recent adaugata (2021); mentionarea ei la interviuri arata cunostinte la zi ale standardelor cloud.',
    keyTakeaway: 'Cele 6 coloane Well-Architected asigura o viziune holistica si echilibrata asupra oricarei solutii tehnice de cloud.'
  },
  {
    id: 'cloud-34',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Strategii de Migrare in Cloud: Cele 7 R-uri (The 7 Rs of Migration)',
    question: 'Care sunt strategiile clasice de migrare in cloud (Rehost, Replatform, Refactor etc.) si cum alegi intre ele?',
    answer: 'Strategiile canonice AWS pentru migrarea aplicatiilor din datacenter (On-Premises) in cloud:\n1. Rehost ("Lift and Shift"):\nMuta masinile virtuale asa cum sunt, fara nicio modificare de cod sau arhitectura (folosind AWS Application Migration Service). Cel mai rapid mod de migrare, dar nu profita de avantajele native cloud.\n2. Replatform ("Lift, Tinker and Shift"):\nFace mici optimizari de platforma fara modificari majore de cod (ex: migrarea de la o baza de date PostgreSQL instalata manual pe un VM la Amazon RDS administrat).\n3. Refactor / Re-architect:\nRescrierea completa a aplicatiei intr-o arhitectura cloud-native (microservicii, containere pe EKS sau functii Serverless Lambda). Cel mai mare efort, dar cea mai mare scalabilitate si reducere de costuri pe termen lung.\n4. Repurchase ("Drop and Shop"): Trecerea la un produs SaaS existent (ex: migrarea unui CRM intern catre Salesforce).\n5. Retain: Pastrarea anumitor aplicatii on-premises din motive de reglementare stricta.\n6. Retire: Inchiderea aplicatiilor vechi inutile.\n7. Relocate: Mutarea de masini virtuale VMware direct pe VMware Cloud on AWS.',
    codeSnippet: `// Traseu tipic in organizatii mari:
// Faza 1: Rehost (pentru a elibera rapid datacenterul fizic)
// Faza 2: Replatform (trecere la baze de date gestionate)
// Faza 3: Refactor (modernizare in microservicii si serverless)`,
    interviewTrap: 'Incercarea de a face Refactor direct pe un monolit gigant in timpul unei migrari grabite esueaza frecvent; o migrare Rehost urmata de Refactor iterativ este mult mai sigura.',
    keyTakeaway: 'Cele 7 R-uri permit adaptarea abordarii de migrare in functie de constrangerile de timp, cost si valoare de business.'
  },
  {
    id: 'cloud-35',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS SQS FIFO: Deduplicare si Message Group ID',
    question: 'Cum garanteaza cozile SQS FIFO ordinea stricta a mesajelor si procesarea Exactly-Once fara duplicate?',
    answer: 'O coada SQS FIFO (First-In, First-Out, cu extensia obligatorie .fifo):\n1. Garantie de Ordine Stricta: Mesajele sunt livrate exact in ordinea in care au fost trimise.\n2. Deduplicare Automata (Exactly-Once Delivery):\n- Fiecare mesaj include un MessageDeduplicationId (sau hash pe continutul mesajului).\n- Daca acelasi mesaj este trimis de mai multe ori in decurs de 5 minute, SQS accepta mesajul dar il stocheaza o singura data, eliminand duplicatele la nivel de retea!\n3. MessageGroupId (Procesare Paralela Ordonata):\n- Mesajele care au acelasi MessageGroupId sunt procesate strict secvential in ordine.\n- Insa mesaje cu MessageGroupId diferit pot fi procesate simultan in paralel de workere diferite! Astfel poti avea ordonare perfecta per candidat (MessageGroupId = candidateId), dar paralelizare pe mii de candidati simultani!',
    codeSnippet: `// Trimitere mesaj in SQS FIFO:
SendMessageRequest sendMsg = SendMessageRequest.builder()
    .queueUrl("https://sqs.eu-central-1.amazonaws.com/123/jobs.fifo")
    .messageBody("{\"action\": \"UPDATE_STATUS\"}")
    .messageGroupId("candidate-42") # Garanteaza ordinea pentru acest candidat!
    .messageDeduplicationId(UUID.randomUUID().toString())
    .build();`,
    interviewTrap: 'Cozile FIFO au o limita de throughput standard de 300 mesaje/secunda (sau 3000 cu batching); daca ai nevoie de sute de mii de mesaje pe secunda si ordinea stricta nu conteaza, foloseste cozi SQS Standard.',
    keyTakeaway: 'SQS FIFO asigura ordinea stricta si deduplicarea mesajelor, iar MessageGroupId permite paralelizarea inteligenta per entitate.'
  },
  {
    id: 'cloud-36',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Terraform Drift Detection si Sincronizarea Starii',
    question: 'Ce este "Configuration Drift" in Terraform si cum readuci infrastructura la starea declarata din cod?',
    answer: 'Ce este Drift-ul:\nO situatie in care starea reala a resurselor din cloud nu mai coincide cu ce este descris in codul Terraform (de exemplu, un inginer a intrat noaptea in consola AWS si a marit manual dimensiunea unui server sau a deschis un port in Security Group).\n\nDetectare si Reparare:\n1. Detectie: Comanda terraform plan contacteaza API-ul cloud-ului, compara resursele reale cu fisierul .tfstate si iti afiseaza exact diferentele nesincronizate!\n2. Remediere Automata (Reconciliere):\nRularea comenzii terraform apply va anula modificarile manuale din consola si va readuce serverul la starea declarata in codul versionat Git!\n3. Automatizare in CI/CD: Se programeaza un cron job zilnic in GitHub Actions care ruleaza terraform plan -detailed-exitcode; daca gaseste drift, alerteaza echipa pe Slack.',
    codeSnippet: `# Comanda de verificare a drift-ului fara a aplica modificari:
terraform plan -refresh-only`,
    interviewTrap: 'Daca modificarea manuala din consola este buna si vrei sa o pastrezi, trebuie sa actualizezi codul .tf corespunzator inainte de apply, altfel Terraform o va suprascrie inapoi la valoarea veche!',
    keyTakeaway: 'Terraform plan detecteaza drift-ul de configuratie si asigura ca realitatea din cloud respecta strict codul din Git.'
  },
  {
    id: 'cloud-37',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Karpenter: Autoscaling Modern de Noduri in Kubernetes',
    question: 'De ce a inlocuit Karpenter traditionalul Cluster Autoscaler in gestionarea nodurilor Kubernetes pe AWS EKS?',
    answer: 'Limitari ale Vechiului Cluster Autoscaler (CA):\n1. Functioneaza rigid prin intermediul AWS Auto Scaling Groups (ASG). Daca ai nevoie de tipuri diferite de instante (CPU mare, GPU, memorie mare), trebuie sa configurezi si sa intretii zeci de grupuri ASG diferite.\n2. Viteza lenta: Poate dura 3-5 minute pana cand o noua masina virtuala EC2 este pornita si integrata in cluster.\n\nAvantajele Karpenter (Creat de AWS & CNCF):\n1. Group-less Autoscaling: Nu foloseste Auto Scaling Groups deloc! Comunica direct cu flota EC2 din AWS.\n2. Selectie Inteligenta: Priveste specificatiile exacte ale pod-ului aflat in Pending si comanda direct instanta EC2 optima si cea mai ieftina disponibila in acea secunda (inclusiv Spot).\n3. Pornire Fulger: Adauga noduri noi in cluster in sub 30-45 de secunde!\n4. Consolidare Automata: Cand traficul scade, Karpenter muta activ pod-urile pe mai putine noduri si opreste masinile nefolosite pentru a reduce factura la minim.',
    codeSnippet: `# Karpenter NodePool manifest:
apiVersion: karpenter.sh/v1beta1
kind: NodePool
metadata:
  name: default
spec:
  template:
    spec:
      requirements:
        - key: "karpenter.sh/capacity-type"
          operator: In
          values: ["spot", "on-demand"]
        - key: "kubernetes.io/arch"
          operator: In
          values: ["arm64", "amd64"]
  disruption:
    consolidationPolicy: WhenUnderutilized`,
    interviewTrap: 'Karpenter functioneaza direct pe nivelul EKS; el asigura o reducere masiva a costurilor prin consolidarea proactiva a nodurilor subutilizate.',
    keyTakeaway: 'Karpenter ofera autoscaling ultra-rapid si optimizare de costuri pentru nodurile Kubernetes fara complexitatea grupurilor ASG.'
  },
  {
    id: 'cloud-38',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Criptare in Tranzit (TLS) si in Repaus (At-Rest) in Cloud',
    question: 'Care sunt tehnicile standard de criptare a datelor in tranzit si a datelor in repaus pentru conformitate enterprise?',
    answer: '1. Criptare in Tranzit (In-Transit / In-Flight):\n- Protejeaza datele care calatoresc prin retea impotriva interceptarilor (Man-in-the-Middle).\n- Implementare:\n  - Conexiuni HTTPS pe portul 443 cu certificate TLS 1.3 gestionate automat de AWS Certificate Manager (ACM).\n  - Conexiuni JDBC securizate catre baza de date (sslmode=require).\n  - mTLS (Mutual TLS) intre microservicii prin Service Mesh.\n\n2. Criptare in Repaus (At-Rest):\n- Protejeaza datele stocate fizic pe discurile din datacenter impotriva sustragerii fizice a mediilor de stocare.\n- Implementare:\n  - Criptare transparenta pe discuri AWS EBS folosind chei KMS (AES-256).\n  - Criptare pe bucket-uri S3 (Server-Side Encryption SSE-KMS sau SSE-S3).\n  - Criptare transparenta de baza de date (TDE) pe instantele RDS PostgreSQL.',
    codeSnippet: `# Fortare conexiune SSL/TLS catre PostgreSQL in application.yml:
spring:
  datasource:
    url: jdbc:postgresql://db.ats.internal:5432/ats_db?sslmode=require`,
    interviewTrap: 'Criptarea in repaus protejeaza datele de furtul fizic al discului; odata ce aplicatia se autentifica in DB, datele sunt decriptate transparent, deci aplicatia are nevoie in continuare de controale stricte de acces.',
    keyTakeaway: 'Criptarea TLS in tranzit si AES-256 cu KMS in repaus sunt cerintele obligatorii pentru conformitate ISO 27001 si SOC 2.'
  },
  {
    id: 'cloud-39',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS App Runner: Containere Fara Administrare de Infrastructura',
    question: 'Ce este AWS App Runner si de ce este cea mai rapida cale de a duce un container Spring Boot sau Node.js in productie pe AWS?',
    answer: 'Pentru echipe care nu doresc complexitatea de retea a unui VPC, a unui Load Balancer si a unui cluster Kubernetes:\n\nCe ofera AWS App Runner:\n1. Zero Infrastructura: Tu oferi doar imaginea ta Docker din ECR (sau legi repository-ul Git).\n2. Totul Inclus Automat: App Runner configureaza automat:\n   - Load Balancer de nivel inalt\n   - Certificat SSL/TLS cu domeniu custom\n   - Auto-scaling automat pe baza numarului de conexiuni concurente\n   - Health checks si rolling deployments la fiecare nou push de imagine.\n3. Model Simplu de Cost: Platesti doar pentru memoria RAM mentinuta la cald si pentru CPU-ul consumat activ in timpul procesarii cererilor.',
    codeSnippet: `# Resursa Terraform pentru App Runner:
resource "aws_apprunner_service" "backend" {
  service_name = "ats-backend"
  source_configuration {
    image_repository {
      image_identifier      = "123456789.dkr.ecr.eu-central-1.amazonaws.com/ats-backend:v1"
      image_repository_type = "ECR"
    }
  }
}`,
    interviewTrap: 'App Runner este ideal pentru API-uri web si microservicii stateless; daca ai nevoie de retele private complexe cu zeci de subnet-uri specifice, ECS Fargate ofera un control de retea mai granular.',
    keyTakeaway: 'AWS App Runner ofera simplitatea PaaS (similar cu Heroku sau Render) direct pe infrastructura scalabila enterprise a AWS.'
  },
  {
    id: 'cloud-40',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS S3 Bucket Policies vs IAM Policies: Cum se Evalueaza Permisiunile',
    question: 'Cum decide AWS daca o cerere catre un bucket S3 este autorizata atunci cand exista atat o IAM Policy catre utilizator, cat si o S3 Bucket Policy?',
    answer: 'Logica de Evaluare a Politicilor in AWS (Least Privilege):\n1. Implicit Deny (Refuz Implicit): Toate cererile sunt respinse in mod implicit.\n2. Verificare Explicit Deny: Daca EXISTA MACAR UN SINGUR "DENY" in oricare dintre politici (IAM Policy, Bucket Policy, SCP sau Boundary), cererea este RESPINSA DEFINITIV! Un Deny explicit bate intotdeauna orice Allow.\n3. Pentru ca o cerere sa fie permisa:\nTrebuie sa existe cel putin un "ALLOW" explicit si niciun "DENY".\n\nDiferenta de Atasare:\n- IAM Policy: Este atasata la Identitate (Utilizator, Grup, Role): "Ce are voie sa faca Andrei".\n- S3 Bucket Policy: Este o Resource-Based Policy atasata direct la Resursa (la Bucket): "Cine are voie sa intre in acest bucket si de unde".',
    codeSnippet: `// Regula Suprema de Aur a Securitatii AWS:
// Explicit Deny > Explicit Allow > Default Deny`,
    interviewTrap: 'Chiar daca un utilizator are AdministratorAccess in IAM, daca pe bucket-ul S3 este configurata o Bucket Policy cu un bloc explicit "Deny", utilizatorul va fi blocat!',
    keyTakeaway: 'Un Explicit Deny anuleaza orice permisiune anterioara in ierarhia de evaluare a politicilor AWS.'
  },
  {
    id: 'cloud-41',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'Amazon Managed Streaming for Apache Kafka (AWS MSK)',
    question: 'Ce beneficii aduce un cluster gestionat Amazon MSK comparativ cu instalarea manuala de Apache Kafka pe instante EC2?',
    answer: 'Instalarea si operarea manuala a unui cluster Kafka este una dintre cele mai dificile sarcini de infrastructura (management de discuri, brokeri, Zookeeper/KRaft, patch-uri de securitate, rebalansare de partitii).\n\nCe face Amazon MSK in mod automat:\n1. Managed Infrastructure: Creeaza si administreaza brokerii Kafka pe 2 sau 3 Zone de Disponibilitate diferite.\n2. Inlocuire Automata de Noduri (Self-Healing): Daca un broker Kafka moare hardware, MSK il inlocuieste automat cu un nod nou, atasandu-i acelasi disc de date EBS cu zero pierderi de mesaje!\n3. Securitate Nativa: Criptare automata in tranzit (TLS) si in repaus (KMS), autentificare securizata prin IAM (fara parole text in configuratii).\n4. Integrare Serverless (MSK Serverless): Scaleaza automat capacitatea de streaming pe baza traficului fara a gestiona deloc noduri.',
    codeSnippet: `// Conectare Spring Boot la Amazon MSK cu autentificare IAM sigura:
spring.kafka.properties.security.protocol=SASL_SSL
spring.kafka.properties.sasl.mechanism=AWS_MSK_IAM
spring.kafka.properties.sasl.jaas.config=software.amazon.msk.auth.iam.IAMLoginModule required;`,
    interviewTrap: 'Amazon MSK gestioneaza brokerii de Kafka, dar dimensionarea partitiilor pe topicuri si configurarea consumatorilor raman in continuare in responsabilitatea arhitectului de aplicatie.',
    keyTakeaway: 'Amazon MSK elimina complexitatea mentenantei hardware a clusterului Kafka, oferind inalta disponibilitate pe multiple zone.'
  },
  {
    id: 'cloud-42',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Backup: Politici Centralizate de Protectie a Datelor',
    question: 'Cum automatizezi si centralizezi crearea si copierea de copii de siguranta intre regiuni folosind AWS Backup?',
    answer: 'In trecut, fiecare serviciu AWS avea propriul mecanism disparat de backup (RDS snapshots, EBS snapshots, DynamoDB on-demand backups, EFS backup scripts).\n\nAWS Backup ofera o consola unica centralizata:\n1. Backup Plans: Reguli bazate pe politici (ex: "ruleaza backup in fiecare noapte la ora 01:00, pastreaza datele timp de 30 de zile").\n2. Asignare Automata prin Taguri: Adaugi eticheta BackupPlan = "Daily" pe orice resursa (un disc EBS, o baza de date RDS, un cluster EFS), iar AWS Backup o include automat in planul de backup!\n3. Cross-Region & Cross-Account Copy: Copiaza automat copiile de siguranta intr-o regiune geografica secundara sau intr-un cont AWS de arhivare izolat (protectie esentiala impotriva atacurilor de tip Ransomware care sterg contul principal).',
    codeSnippet: `# Resursa Terraform AWS Backup Plan:
resource "aws_backup_plan" "daily_plan" {
  name = "daily-production-backup"

  rule {
    rule_name         = "daily-midnight"
    target_vault_name = "production-vault"
    schedule          = "cron(0 1 * * ? *)"

    lifecycle {
      delete_after = 30 # Stergere automata dupa 30 de zile
    }
  }
}`,
    interviewTrap: 'Daca nu protejezi seiful de backup cu AWS Backup Vault Lock (modul imutabil WORM - Write Once, Read Many), un atacator care obtine drepturi de admin ar putea sterge atat baza de date cat si backup-urile!',
    keyTakeaway: 'AWS Backup centralizeaza strategiile de salvare a datelor si asigura protectie impotriva dezastrelor prin copiere cross-region.'
  },
  {
    id: 'cloud-43',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Cost Explorer si Bugete Automate cu Alerte',
    question: 'Cum configurezi un buget AWS (AWS Budgets) cu alerte automate pe Slack/Email pentru a preveni facturi surpriza de mii de dolari?',
    answer: 'Una dintre cele mai mari spaime ale dezvoltatorilor cloud este o factura neasteptata generata de un loop infinit sau o resursa uitata pornita.\n\nProtectia prin AWS Budgets:\n1. Definirea Bugetului: Setezi un buget lunar fix (ex: 200$/luna pentru contul de dezvoltare).\n2. Alerte Proactive Reale si Forecasted:\n   - Alerta pe Cost Real: Primesti alerta cand costul atinge 80% din buget (160$).\n   - Alerta pe Cost Prognozat (Forecasted): Primesti alerta daca algoritmii AWS calculeaza ca la ritmul curent de consum vei depasi bugetul pana la sfarsitul lunii!\n3. Actiuni Automate: Un buget poate declansa o politica IAM sau o functie Lambda care opreste automat masinile virtuale sau reduce capacitatile de calcul in caz de urgenta financiara.',
    codeSnippet: `# Configurare AWS Budget in Terraform:
resource "aws_budgets_budget" "monthly_limit" {
  name         = "monthly-cost-budget"
  budget_type  = "COST"
  limit_amount = "250"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"

  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = ["team-alerts@ats.com"]
  }
}`,
    interviewTrap: 'Alertele de cost prognozat (Forecasted) sunt mult mai utile decat cele pe cost real; ele te alerteaza din a treia zi a lunii ca o resursa consuma prea mult, in loc sa afli in ultima saptamana!',
    keyTakeaway: 'AWS Budgets cu alerte forecast previne facturile neasteptate si protejeaza bugetul proiectului.'
  },
  {
    id: 'cloud-44',
    category: 'CLOUD',
    difficulty: 'DIFICIL',
    title: 'Terraform Dynamic Blocks: Cand si Cum le Folosesti',
    question: 'Ce sunt blocurile dinamice (dynamic blocks) in Terraform si cum le folosesti pentru a evita repetarea blocurilor imbricate?',
    answer: 'In Terraform, anumite resurse au blocuri imbricate repetitive (precum blocurile ingress/egress dintr-un Security Group sau regulile de rutare dintr-un Ingress).\n\nCe face un Dynamic Block:\nPermite iterarea peste o lista sau o harta de configurari (folosind for_each) pentru a genera dinamic blocurile imbricate in interiorul unei singure definitii de resursa, eliminand duplicarea codului!',
    codeSnippet: `variable "service_ports" {
  default = [8080, 8081, 9090]
}

resource "aws_security_group" "dynamic_sg" {
  name = "app-security-group"

  dynamic "ingress" {
    for_each = var.service_ports
    content {
      from_port   = ingress.value
      to_port     = ingress.value
      protocol    = "tcp"
      cidr_blocks = ["10.0.0.0/16"]
    }
  }
}`,
    interviewTrap: 'Nu folosi dynamic blocks in mod excesiv pentru orice parametru; codul poate deveni greu de citit si depanat; foloseste-le doar cand numarul blocurilor imbricate este cu adevarat variabil.',
    keyTakeaway: 'Dynamic blocks genereaza blocuri imbricate repetitive dintr-o lista de date, pastrand codul Terraform curat si usor de intretinut.'
  },
  {
    id: 'cloud-45',
    category: 'CLOUD',
    difficulty: 'MEDIU',
    title: 'AWS Lambda Concurrency: Reserved vs Provisioned Concurrency',
    question: 'Care este diferenta dintre Reserved Concurrency si Provisioned Concurrency in scalarea functiilor AWS Lambda?',
    answer: 'Fiecare cont AWS are o limita implicita de 1.000 de executii concurente de functii Lambda partajata intre toate functiile din acea regiune.\n\n1. Unreserved Concurrency (Partajata):\nToate functiile concureaza pentru aceleasi 1.000 de sloturi. Daca o functie secundara de procesare imagini consuma toate cele 1.000 de executii, functia ta critica de plati va primi erori de Throttling (HTTP 429)!\n\n2. Reserved Concurrency (Garantare si Plafonare):\n- Garanteaza un numar fix de sloturi concurente exclusiv pentru functia ta (ex: 200).\n- Nicio alta functie nu poate atinge aceste 200 de sloturi.\n- Actioneaza si ca o LIMITA maxima: functia nu poate depasi niciodata 200 de executii simultane (util pentru a nu coplesi o baza de date din spate cu prea multe conexiuni!).\n\n3. Provisioned Concurrency (Instante Pre-Incalzite):\n- Initializeaza si mentine un numar configurat de instante Lambda gata de executie in memorie continua, eliminand complet orice Cold Start!',
    codeSnippet: `# Reserved Concurrency pentru protectia bazei de date in Terraform:
resource "aws_lambda_function" "db_writer" {
  function_name                  = "ats-db-writer"
  reserved_concurrent_executions = 50 # Maxim 50 conexiuni concurente catre DB!
}`,
    interviewTrap: 'Daca setezi Reserved Concurrency pe 0, opresti complet executia functiei (comutator instantaneu de oprire de urgenta in caz de atac sau bug).',
    keyTakeaway: 'Reserved Concurrency plafoneaza si garanteaza capacitatea; Provisioned Concurrency elimina cold start-ul.'
  }
];
