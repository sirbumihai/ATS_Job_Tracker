// Deck Masiv: Cloud Computing, AWS Architecture, Serverless & Terraform
// Preluat din: AWS Certified Solutions Architect Guides, HashiCorp Terraform Docs
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
  }
];
