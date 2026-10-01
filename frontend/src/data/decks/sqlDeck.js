// Deck Masiv: SQL, PostgreSQL, Indecsi, ACID & Optimizare Query-uri
// Preluat din: PostgreSQL Official Docs, High-Performance SQL Guides, DopplerHQ, mrbardia72/db-interview
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const SQL_DECK = [
  {
    id: 'sql-01',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Cum functioneaza un Index B-Tree si cand NU il folosim?',
    question: 'Ce structura are un index B-Tree in PostgreSQL/MySQL, care este complexitatea de cautare si in ce situatii adaugarea unui index incetineste aplicatia?',
    answer: 'Un index B-Tree pastreaza cheile sortate intr-un arbore echilibrat. Fiecare nod contine chei si pointeri, iar nodurile frunza contin adresele fizice ale randurilor (TID).\n\nComplexitate: O(log N) pentru cautare, inserare si stergere.\n\nCand NU se recomanda index:\n1. Tabele mici (<1.000 randuri): Seq Scan este mai rapid decat citirea nodurilor indexului.\n2. Coloane cu cardinalitate mica: Un boolean cu 50% true si 50% false; indexul nu ajuta.\n3. Tabele masive Write-Heavy: La fiecare INSERT/UPDATE/DELETE, toti indecsii asociati trebuie recalculati si scrisi pe disc.',
    codeSnippet: `CREATE INDEX idx_jobs_status_created 
ON job_postings (status, created_at DESC);

EXPLAIN ANALYZE 
SELECT * FROM job_postings 
WHERE status = 'ACTIVE' 
ORDER BY created_at DESC LIMIT 20;`,
    interviewTrap: 'Un index compus pe (colA, colB) poate fi folosit pentru cautari pe colA sau (colA, colB), dar NU pe colB singur (Leftmost Prefix Rule)!',
    keyTakeaway: 'Indecsii accelereaza dramatic SELECT-urile dar penalizeaza operatiunile de INSERT/UPDATE.'
  },
  {
    id: 'sql-02',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Nivele de Izolare a Tranzactiilor (ACID Isolation Levels)',
    question: 'Numeste cele 4 nivele standard de izolare a tranzactiilor SQL si anomaliile pe care le previn (Dirty Read, Non-Repeatable Read, Phantom Read).',
    answer: 'Cele 4 nivele de izolare sunt:\n1. Read Uncommitted: Permite Dirty Reads (citirea de date modificate de alta tranzactie inca necomisa).\n2. Read Committed (Default in Postgres): Previne Dirty Reads. Permite Non-Repeatable Reads (recitirea randului aduce valori noi daca altcineva a dat COMMIT).\n3. Repeatable Read: Previne Dirty Reads si Non-Repeatable Reads prin snapshot MVCC consistent. In Postgres previne si Phantom Reads standard.\n4. Serializable: Izolare perfecta, previne toate anomaliile prin serializare stricta (conflictele duc la avortare cu rollback).',
    codeSnippet: `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT balance FROM accounts WHERE user_id = 42;
-- Chiar daca alt proces modifica contul si da COMMIT,
-- a doua citire va vedea exact aceeasi valoare din snapshot-ul initial!
SELECT balance FROM accounts WHERE user_id = 42;
COMMIT;`,
    interviewTrap: 'In PostgreSQL, nivelul Repeatable Read previne inclusiv Phantom Read-urile clasice datorita arhitecturii MVCC bazata pe snapshot-uri.',
    keyTakeaway: 'Cu cat nivelul de izolare e mai inalt, cu atat creste siguranta datelor, dar scade throughput-ul de concurenta.'
  },
  {
    id: 'sql-03',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Leftmost Prefix Rule pentru Indecsi Compusi (Composite Indexes)',
    question: 'Daca ai un index compus creat pe trei coloane: CREATE INDEX idx_users ON users (country, city, age); care interogari vor folosi indexul?\n1. WHERE country = \'RO\'\n2. WHERE city = \'Bucuresti\'\n3. WHERE country = \'RO\' AND age = 25',
    answer: 'Regula Leftmost Prefix spune ca un index compus pe (A, B, C) poate fi folosit doar daca clauza WHERE contine un prefix continuu incepand de la prima coloana din stanga (A):\n1. WHERE country = \'RO\': Foloseste indexul.\n2. WHERE city = \'Bucuresti\': NU foloseste indexul (va face Sequential Scan, lipseste prima coloana A!).\n3. WHERE country = \'RO\' AND age = 25: Foloseste indexul doar pentru country (A); age nu foloseste arborele deoarece lipseste B.',
    codeSnippet: `-- Ordinea corecta a coloanelor in index:
CREATE INDEX idx_jobs_location_role ON job_postings (location, role);`,
    interviewTrap: 'Daca pui conditie de inegalitate (<, >, BETWEEN) pe o coloana din mijloc, coloanele din dreapta ei din index nu mai pot fi folosite pentru cautare!',
    keyTakeaway: 'Plaseaza coloanele folosite in egalitati (=) in stanga indexului, si cele de range/sortare la final.'
  },
  {
    id: 'sql-04',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'De ce OFFSET este lent la Paginare si ce este Keyset Pagination?',
    question: 'De ce interogarea: SELECT * FROM jobs ORDER BY id LIMIT 20 OFFSET 500000 devine extrem de lenta in PostgreSQL/MySQL si cum se rezolva prin Keyset Pagination (Seek Method)?',
    answer: 'La OFFSET 500000 LIMIT 20, baza de date trebuie sa citeasca, sorteze si parcurga toate cele 500.000 de randuri anterioare pentru a le ignora, si abia apoi sa returneze cele 20 de randuri. Cu cat pagina e mai adanca, cu atat e mai lent O(N).\n\nSolutie: Keyset Pagination (Seek Method):\nFolosim ultima cheie vazuta: WHERE id > last_seen_id ORDER BY id ASC LIMIT 20. Baza de date sare direct prin indexul B-Tree in O(log N) la pozitia dorita!',
    codeSnippet: `-- Keyset Pagination (Instant O(1)):
SELECT * FROM job_postings 
WHERE id > 100000 
ORDER BY id ASC LIMIT 20;`,
    interviewTrap: 'Keyset Pagination nu permite saltul direct la o pagina arbitrara (ex: pagina 45), dar este perfecta pentru infinite scroll si butoane Next/Previous.',
    keyTakeaway: 'Pentru fluxuri mari de date si infinite scroll, foloseste intotdeauna Keyset Pagination.'
  },
  {
    id: 'sql-05',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'EXPLAIN ANALYZE in PostgreSQL: Tipuri de Scan-uri',
    question: 'Ce afiseaza comanda EXPLAIN ANALYZE si care este diferenta dintre Sequential Scan, Index Scan, Index Only Scan si Bitmap Scan?',
    answer: 'EXPLAIN arata planul estimat. EXPLAIN ANALYZE executa efectiv query-ul si raporteaza timpul real de executie si numarul de randuri parcurse.\n\nTipuri de scanare:\n1. Sequential Scan (Seq Scan): Citeste toate blocurile de pe disc rand cu rand.\n2. Index Scan: Parcurge arborele B-Tree pentru a gasi pointerii TID si citeste datele din tabela.\n3. Index Only Scan (Cel mai rapid): Toate coloanele cerute se afla direct in index; nu atinge deloc tabela de pe disc.\n4. Bitmap Index Scan: Construieste o harta de biti in memorie si citeste blocurile ordonate fizic de pe disc cand sunt combinati mai multi indecsi.',
    codeSnippet: `EXPLAIN (ANALYZE, BUFFERS)
SELECT title, company_name FROM job_postings 
WHERE status = 'ACTIVE' AND created_at > '2026-01-01';`,
    interviewTrap: 'Daca query-ul returneaza peste 15-20% din tabela, Postgres alege intentionat Seq Scan in loc de Index Scan, deoarece citirea secventiala este mai rapida decat sariturile aleatorii pe disc.',
    keyTakeaway: 'Pentru performanta maxima, adauga clauza INCLUDE in Postgres pentru a obtine Index Only Scan.'
  },
  {
    id: 'sql-06',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'HikariCP Connection Pool Tuning si formula numarului optim de conexiuni',
    question: 'De ce un connection pool urias (ex: 200 de conexiuni) incetineste aplicatia si care este formula optima recomandata de PostgreSQL pentru HikariCP?',
    answer: 'Fiecare conexiune deschisa consuma memorie pe serverul de baze de date, iar context switching-ul intre sute de conexiuni concurente blocheaza CPU-ul si discul prin I/O contention.\n\nFormula oficiala PostgreSQL & HikariCP:\nconnections = ((cpu_cores * 2) + effective_spindle_count)\n\nPe un server cu 4 nuclee CPU si disc SSD, un pool de doar 10-15 conexiuni poate sustine mii de request-uri/secunda cu latenta minima, pastrand baza de date rapida si fluida.',
    codeSnippet: `# Configurare Hikari in application.properties:
spring.datasource.hikari.maximum-pool-size=15
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.leak-detection-threshold=10000`,
    interviewTrap: 'Daca pool-ul este prea mare, sub trafic masiv serverul de Postgres intra in "thrashing" si refuza conexiuni noi.',
    keyTakeaway: 'Mai putine conexiuni bine gestionate aduc throughput mai mare decat sute de conexiuni blocate in coada.'
  },
  {
    id: 'sql-07',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'MVCC in PostgreSQL: Cum functioneaza xmin, xmax si Dead Tuples',
    question: 'Ce este MVCC (Multi-Version Concurrency Control) in PostgreSQL si de ce un UPDATE creeaza de fapt un nou rand pe disc?',
    answer: 'In PostgreSQL, "readers never block writers, and writers never block readers".\nAcest lucru este realizat prin MVCC:\n1. Fiecare rand (tuple) contine campuri de sistem ascunse: xmin (ID-ul tranzactiei care a inserat randul) si xmax (ID-ul tranzactiei care l-a sters sau actualizat).\n2. Cand executi UPDATE, PostgreSQL NU suprascrie randul vechi pe disc! El marcheaza xmax pe randul vechi cu ID-ul tranzactiei curente si INSEREAZA un rand complet NOU cu un nou xmin.\n3. Randul vechi devine "Dead Tuple" odata ce nicio tranzactie activa nu mai are nevoie de el in propriul snapshot.',
    codeSnippet: `-- Vizualizarea campurilor interne MVCC:
SELECT xmin, xmax, id, title 
FROM job_postings 
LIMIT 5;`,
    interviewTrap: 'Daca ai mii de operatii de UPDATE frecvente, tabela creste masiv in dimensiune pe disc (Table Bloat) daca procesul VACUUM nu curata dead tuples la timp.',
    keyTakeaway: 'In PostgreSQL, UPDATE este intern o combinatie de DELETE (marcare xmax) si INSERT (tuple nou).'
  },
  {
    id: 'sql-08',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Rolul procesului VACUUM si autovacuum tuning in PostgreSQL',
    question: 'Ce rol are comanda VACUUM in PostgreSQL, care este diferenta fata de VACUUM FULL si de ce autovacuum este critic?',
    answer: '1. Standard VACUUM (sau autovacuum):\n- Scaneaza tabelele si marcheaza spatiul ocupat de "dead tuples" ca fiind reutilizabil pentru noi operatii INSERT/UPDATE.\n- NU blocheaza citirile sau scrierile (ruleaza in paralel).\n- NU returneaza de regula spatiul inapoi sistemului de operare (discul ramane la fel ca marime, dar paginile interne au spatiu liber).\n2. VACUUM FULL:\n- Rescrie fizic intreaga tabela intr-un fisier nou de disc, compactand datele si returnand spatiul catre OS.\n- Pune un lock EXCLUSIV pe tabela (ACCESS EXCLUSIVE), blocand complet aplicatia pana la finalizare!\n- Trebuie evitat in productie in timpul orelor de varf.',
    codeSnippet: `-- Verificare dead tuples in postgres:
SELECT relname, n_dead_tup, n_live_tup, last_autovacuum 
FROM pg_stat_user_tables 
ORDER BY n_dead_tup DESC;`,
    interviewTrap: 'Dezactivarea autovacuum-ului in productie este o greseala catastrofala care duce la table bloat extrem si degradare fatala a performantei.',
    keyTakeaway: 'Autovacuum-ul activat si calibrat corect previne bloat-ul si mentine statisticile optimizatorului la zi.'
  },
  {
    id: 'sql-09',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'CREATE INDEX CONCURRENTLY in Productie',
    question: 'De ce comanda clasica CREATE INDEX blocheaza aplicatia si de ce trebuie sa folosesti mereu CREATE INDEX CONCURRENTLY in productie?',
    answer: 'Comanda standard CREATE INDEX pune un lock de tip SHARE pe tabela:\n- Permite comenzi SELECT, dar BLOCHEAZA orice scriere (INSERT, UPDATE, DELETE).\n- Pe tabele cu zeci de milioane de randuri, crearea indexului poate dura minute sau zeci de minute, timp in care aplicatia va arunca Connection Timeout sau HTTP 500 la salvarea datelor!\n\nSolutie: CREATE INDEX CONCURRENTLY\n- Scaneaza tabela in doi pasi, fara a bloca scrierile concurente.\n- Dureaza de 2-3 ori mai mult timp total, dar aplicatia continua sa functioneze 100% normal.',
    codeSnippet: `-- In scriptul de migrare sau consola de productie:
CREATE INDEX CONCURRENTLY idx_applications_candidate_id 
ON job_applications (candidate_id);`,
    interviewTrap: 'CREATE INDEX CONCURRENTLY nu poate fi executat in interiorul unui bloc de tranzactie clasic (BEGIN ... COMMIT); in Flyway trebuie setat non-transactional.',
    keyTakeaway: 'In medii de productie live cu trafic continuu, foloseste intotdeauna CREATE INDEX CONCURRENTLY.'
  },
  {
    id: 'sql-10',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Covering Index si clauza INCLUDE in PostgreSQL',
    question: 'Ce este un Covering Index, cum folosesti clauza INCLUDE si cum obtii un Index Only Scan de inalta performanta?',
    answer: 'Un Covering Index este un index care contine toate coloanele necesare pentru o interogare, eliminand necesitatea ca baza de date sa citeasca tabela principala de pe disc (Index Only Scan).\n\nClauza INCLUDE in PostgreSQL:\nCREATE INDEX idx_user_covering ON users (email) INCLUDE (first_name, last_name);\n- Coloana email este stocata in arborele B-Tree pentru cautare si ordonare rapida.\n- Coloanele first_name si last_name sunt atasate doar la nivelul nodurilor frunza ca payload, fara a ingreuna structura de cautare a arborelui B-Tree.\n- Ofera viteza maxima de citire fara sa consume memoria unui index compus masiv.',
    codeSnippet: `CREATE INDEX idx_jobs_search 
ON job_postings (status) 
INCLUDE (title, company_name, salary);

-- Acest query va face INDEX ONLY SCAN (timp de raspuns instant):
SELECT title, company_name, salary 
FROM job_postings 
WHERE status = 'ACTIVE';`,
    interviewTrap: 'Nu adauga toate coloanele posibile in clauza INCLUDE, deoarece creste dimensiunea indexului pe disc si scade eficienta buffer cache-ului.',
    keyTakeaway: 'Clauza INCLUDE permite Index Only Scan fara a polua arborele B-Tree de cautare.'
  },
  {
    id: 'sql-11',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Partial Indexes (Indecsi Partiali cu clauza WHERE)',
    question: 'Ce este un Partial Index in PostgreSQL si cum reduce dimensiunea pe disc si accelereaza interogarile frecvente?',
    answer: 'Un Partial Index este un index construit doar peste un subset de randuri dintr-o tabela, definit printr-o clauza WHERE.\n\nAvantaje:\n1. Dimensiune minima pe disc: Daca doar 2% din joburi sunt "FEATURED" sau "PENDING_REVIEW", indexul va contine doar acele 2% inregistrari in loc de 100%.\n2. Inserari rapide: Inserarile de randuri care nu respecta conditia WHERE din index nu updateaza indexul deloc!\n3. Buffer Cache eficient: Indexul mic incape integral in RAM (Shared Buffers).',
    codeSnippet: `-- Creeaza index doar pentru aplicatiile active:
CREATE INDEX idx_active_jobs 
ON job_postings (created_at DESC) 
WHERE status = 'ACTIVE';

-- Va folosi indexul doar daca query-ul include aceeasi conditie:
SELECT * FROM job_postings 
WHERE status = 'ACTIVE' 
ORDER BY created_at DESC LIMIT 10;`,
    interviewTrap: 'Daca query-ul tau nu contine in clauza WHERE exact conditia sau un subset logic al clauzei partiale din index, PostgreSQL nu va folosi indexul partial!',
    keyTakeaway: 'Foloseste Partial Indexes pentru tabele mari unde interoghezi frecvent un status specific minoritar.'
  },
  {
    id: 'sql-12',
    category: 'SQL',
    difficulty: 'USOR',
    title: 'Expression / Functional Indexes in SQL',
    question: 'De ce interogarea WHERE LOWER(email) = \'test@example.com\' nu foloseste indexul B-Tree pe email si cum se rezolva?',
    answer: 'Un index B-Tree creat pe coloana email contine valorile brute exacte (ex: "Test@Example.com").\nCand aplici o functie peste coloana in clauza WHERE (ex: LOWER(email)), baza de date nu poate folosi arborele sortat pe valoarea bruta si este fortata sa faca Sequential Scan pe toata tabela!\n\nSolutie: Expression Index (Index pe Functie)\nCreezi un index direct pe rezultatul expresiei: CREATE INDEX idx_users_lower_email ON users (LOWER(email)). Postgres va indexa valorile deja transformate cu litere mici.',
    codeSnippet: `-- 1. Creare index pe expresie:
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

-- 2. Interogare care utilizeaza indexul instant:
SELECT * FROM users 
WHERE LOWER(email) = 'mihai@atsjobtracker.com';`,
    interviewTrap: 'Daca creezi index pe LOWER(email), o cautare simpla WHERE email = \'test@example.com\' NU va folosi acest index daca nu contine functia LOWER.',
    keyTakeaway: 'Creeaza Expression Indexes cand ai cautari case-insensitive sau calcule deterministe frecvente.'
  },
  {
    id: 'sql-13',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Indecsi GIN (Generalized Inverted Index) pentru JSONB',
    question: 'Cum functioneaza un index GIN in PostgreSQL si cum permite cautari O(1) in structuri JSONB complexe?',
    answer: 'Un index B-Tree poate cauta doar valori scalare comparabile (<, =, >). Nu poate cauta in mod eficient chei si valori imbricate intr-un document JSONB.\n\nIndexul GIN (Generalized Inverted Index):\n- Este un index inversat (similar cu structura unui motor de cautare precum Elasticsearch).\n- Extrage fiecare cheie si valoare din documentul JSONB si le indexeaza individual.\n- Suporta operatorul de continere JSONB @> (contains) si cautari de existenta a cheilor (?), permitand identificarea instantanee a randurilor care contin o structura JSON specifica fara scanare de tabela.',
    codeSnippet: `-- Creare index GIN pe coloana JSONB:
CREATE INDEX idx_jobs_skills_gin 
ON job_postings USING GIN (metadata jsonb_path_ops);

-- Interogare ultra-rapida cu operatorul de continere @>:
SELECT * FROM job_postings 
WHERE metadata @> '{"skills": ["Java", "Docker"], "level": "Senior"}';`,
    interviewTrap: 'Indecsii GIN au un cost mai mare la scriere (INSERT/UPDATE) decat un B-Tree simplu, deoarece fiecare document JSON este desfacut in zeci de intrari de index.',
    keyTakeaway: 'Foloseste indecsi GIN pe coloane JSONB pentru a obtine performanta de baza NoSQL direct in PostgreSQL relational.'
  },
  {
    id: 'sql-14',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Indecsi BRIN (Block Range Index) pentru Time-Series',
    question: 'Ce este un index BRIN, cum reuseste sa ocupe cu 99% mai putin spatiu decat un B-Tree si cand este recomandat?',
    answer: 'BRIN (Block Range Index) stocheaza doar valorile minima si maxima (min/max) pentru grupuri de blocuri de pe disc (de exemplu, pentru fiecare interval de 128 de pagini).\n\nCaracteristici:\n1. Dimensiune minuscula: Un index B-Tree pe 100 de milioane de randuri poate ocupa 3 GB, in timp ce un index BRIN ocupa sub 100 KB!\n2. Functionare: Cand cauti o data (WHERE created_at BETWEEN ...), BRIN sare peste toate intervalele de blocuri a caror plaja min/max nu contine data cautata.\n3. Conditie OBLIGATORIE: Datele din tabela fizica trebuie sa fie corelate fizic cu ordinea de inserare (append-only time-series, loguri, evenimente unde created_at creste continuu).',
    codeSnippet: `-- Index BRIN ultra-compact pentru log-uri masive:
CREATE INDEX idx_logs_created_brin 
ON application_logs USING BRIN (created_at);`,
    interviewTrap: 'Daca datele din tabela sunt amestecate aleatoriu fizic pe disc (random updates/inserts), indexul BRIN devine complet inutil si va scana toata tabela.',
    keyTakeaway: 'BRIN este indexul ideal pentru tabele gigantice de audit si date senzoriale/time-series ordonate natural.'
  },
  {
    id: 'sql-15',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'SELECT ... FOR UPDATE SKIP LOCKED: Cozi de Mesaje in PostgreSQL',
    question: 'Cum construiesti un sistem de procesare a cozilor de mesaje (Job Queue) extrem de concurent direct in PostgreSQL folosind SKIP LOCKED?',
    answer: 'Problema concurentei pe cozi in DB:\nDaca 10 worker-e concurente citesc SELECT * FROM jobs WHERE status = \'PENDING\' LIMIT 1 FOR UPDATE, primul worker obtine lock-ul pe rand, iar celelalte 9 workere raman BLOCATE in asteptare pe acelasi rand (lock contention)!\n\nSolutie: SKIP LOCKED\nClauza SKIP LOCKED instruieste PostgreSQL sa ignore orice rand care este deja blocat de o alta tranzactie activa si sa returneze urmatorul rand disponibil neblocat.\nRezultat: Fiecare worker preia instantaneu un job diferit, cu concurenta paralela perfecta si zero blocaje intre firele de executie.',
    codeSnippet: `-- Preluare sigura si atomica a urmatorului job de catre un worker:
BEGIN;
SELECT id, payload 
FROM job_queue 
WHERE status = 'PENDING' 
ORDER BY priority DESC, id ASC 
LIMIT 1 
FOR UPDATE SKIP LOCKED;

-- Worker-ul proceseaza jobul, apoi actualizeaza statusul si face COMMIT:
UPDATE job_queue SET status = 'COMPLETED' WHERE id = :jobId;
COMMIT;`,
    interviewTrap: 'Nu folosi niciodata un simplu SELECT urmat de UPDATE fara FOR UPDATE SKIP LOCKED, altfel mai multe workere vor procesa acelasi task in paralel (Race Condition).',
    keyTakeaway: 'FOR UPDATE SKIP LOCKED transforma PostgreSQL intr-un broker robust de cozi de mesaje fara a avea nevoie de RabbitMQ pentru volume moderate.'
  },
  {
    id: 'sql-16',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Window Functions: ROW_NUMBER(), RANK(), DENSE_RANK()',
    question: 'Care este diferenta exacta dintre functiile analitice ROW_NUMBER(), RANK() si DENSE_RANK() in SQL la valori egale (ties)?',
    answer: 'Cand datele contin valori egale la sortare (de exemplu, salariul 5000 pe pozitiile 2 si 3):\n1. ROW_NUMBER(): Atribuie intotdeauna numere consecutive unice (1, 2, 3, 4). Nu genereaza egalitati niciodata.\n2. RANK(): Atribuie acelasi numar valorilor egale, dar SARE peste pozitiile urmatoare: (1, 2, 2, 4). Observam ca pozitia 3 lipseste!\n3. DENSE_RANK(): Atribuie acelasi numar valorilor egale, dar NU sare peste nicio pozitie: (1, 2, 2, 3). Numerele raman compacte si continue.',
    codeSnippet: `SELECT 
    candidate_name, 
    salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num,
    RANK() OVER (ORDER BY salary DESC) as rnk,
    DENSE_RANK() OVER (ORDER BY salary DESC) as dense_rnk
FROM candidate_salaries;`,
    interviewTrap: 'Daca ti se cere "gaseste al doilea cel mai mare salariu distinct", folosirea ROW_NUMBER() poate returna salariul maxim daca exista duplicat pe primul loc! Foloseste DENSE_RANK().',
    keyTakeaway: 'Foloseste DENSE_RANK() pentru clasificari de top unde valorile duplicate nu trebuie sa creeze goluri in clasament.'
  },
  {
    id: 'sql-17',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Window Functions: LEAD() si LAG() pentru Comparatii Temporale',
    question: 'Cum folosesti functiile de fereastra LAG() si LEAD() pentru a calcula diferenta de timp sau crestere intre evenimente consecutive?',
    answer: '1. LAG(column, offset): Acceseaza valoarea unui rand ANTERIOR din cadrul aceleiasi ferestre (partition/sortare) fara a fi nevoie de un auto-join (SELF JOIN) lent.\n2. LEAD(column, offset): Acceseaza valoarea unui rand URMATOR din fereastra.\n\nSunt ideale pentru calcularea timpului scurs intre aplicatiile unui candidat, detectarea schimbarilor de status si compararea vanzarilor lunare cu luna anterioara.',
    codeSnippet: `SELECT 
    application_id,
    applied_date,
    status,
    LAG(status) OVER (PARTITION BY candidate_id ORDER BY applied_date) as prev_status,
    applied_date - LAG(applied_date) OVER (PARTITION BY candidate_id ORDER BY applied_date) as days_since_last_app
FROM job_applications;`,
    interviewTrap: 'Pentru primul rand dintr-o partitie, LAG() returneaza NULL; poti pasa un al treilea argument ca valoare default (ex: LAG(status, 1, \'NONE\')).',
    keyTakeaway: 'LAG si LEAD elimina JOIN-urile reflexive costisitoare si simplifica drastic analizele de serii temporale.'
  },
  {
    id: 'sql-18',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'CTE (Common Table Expressions) si Clauza MATERIALIZED',
    question: 'Ce este un CTE (WITH clause) in SQL si cum influenteaza clauza MATERIALIZED planul de executie in PostgreSQL 12+?',
    answer: 'Un CTE (Common Table Expression) este un set de rezultate temporar denumit, definit cu clauza WITH, utilizat pentru a sparge interogari mari in module logice lizibile.\n\nOptimizare in PostgreSQL 12+:\n- Inainte de Postgres 12, toate CTE-urile erau "materializate" (evaluate si stocate separat in memorie), actionand ca o bariera de optimizare (optimization fence).\n- In Postgres 12+, CTE-urile sunt "inlined" (asimilate in query-ul principal) daca sunt citite o singura data, permitand optimizatorului sa impinga clauze WHERE si indecsi in interiorul lor.\n- Daca doresti fortarea calculului unic al unui CTE costisitor apelat de mai multe ori, adaugi explicit: WITH cte AS MATERIALIZED (...).',
    codeSnippet: `WITH ActiveHighSalaryJobs AS MATERIALIZED (
    SELECT id, title, salary 
    FROM job_postings 
    WHERE status = 'ACTIVE' AND salary > 100000
)
SELECT * FROM ActiveHighSalaryJobs WHERE title LIKE '%Architect%';`,
    interviewTrap: 'Daca ai un CTE foarte lent citit o singura data, Postgres il va include in plan automat; nu folosi MATERIALIZED decat daca stii ca optimizatorul a ales un plan suboptimal.',
    keyTakeaway: 'CTE-urile aduc claritate codului SQL si pot fi controlate explicit cu MATERIALIZED sau NOT MATERIALIZED in PostgreSQL modern.'
  },
  {
    id: 'sql-19',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'CTE Recursiv (WITH RECURSIVE) pentru Structuri Ierarhice',
    question: 'Cum interoghezi o structura arborescenta (ex: organigrama sau ierarhie de categorii parinte-copil) folosind WITH RECURSIVE?',
    answer: 'Structura unui CTE recursiv este compusa din 3 parti:\n1. Non-recursive term (Anchor): Interogarea initiala de baza (ex: gasirea nodului radacina, parinte_id IS NULL).\n2. Operatorul UNION ALL: Uneste rezultatele ancorate cu urmatorul pas.\n3. Recursive term: O interogare care face JOIN intre tabela principala si propriul CTE recursiv, ruland iterativ pana cand niciun rand nou nu mai este generat.\n\nEste solutia standard SQL pentru parcurgerea grafurilor, organigramelor de angajati si categoriilor multinivel.',
    codeSnippet: `WITH RECURSIVE OrgHierarchy AS (
    -- 1. Anchor: Managerul general (fara parinte)
    SELECT id, name, manager_id, 1 as level
    FROM employees 
    WHERE manager_id IS NULL

    UNION ALL

    -- 2. Recursive Member: Subalternii directi
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    INNER JOIN OrgHierarchy o ON e.manager_id = o.id
)
SELECT * FROM OrgHierarchy ORDER BY level, name;`,
    interviewTrap: 'Daca datele contin cicluri (A este seful lui B si B este seful lui A), recursivitatea intra in bucla infinita! In Postgres poti folosi clauza CYCLE pentru a preveni buclele.',
    keyTakeaway: 'WITH RECURSIVE este mecanismul elegant si puternic pentru parcurgerea structurilor de date arborescente in SQL.'
  },
  {
    id: 'sql-20',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Algoritmi de JOIN: Nested Loop vs Hash Join vs Merge Join',
    question: 'Care sunt cei 3 algoritmi fundamentali de JOIN din motoarele relationale si in ce conditii alege optimizatorul pe fiecare?',
    answer: 'PostgreSQL si alte RDBMS aleg automat unul din acesti trei algoritmi in baza statisticilor din tabela:\n1. Nested Loop Join: Pentru fiecare rand din prima tabela, parcurge tabela a doua (de preferat folosind un index). Optim pentru tabele mici sau cand prima tabela filtreaza datele la putine randuri iar a doua tabela are index eficient pe cheia de join.\n2. Hash Join: Construieste o tabela hash in memorie (work_mem) cu cheile din tabela mai mica, apoi scaneaza a doua tabela si cauta cheia in hash O(1). Optim pentru tabele mari neordonate fara indecsi.\n3. Merge Join: Ambele tabele sunt sortate dupa cheia de join, apoi parcurse in paralel ca intr-un merge-sort O(N+M). Optim pentru tabele foarte mari deja sortate sau care au indecsi B-Tree pe cheile de join.',
    codeSnippet: `-- Vizualizarea tipului de join ales de planner:
EXPLAIN 
SELECT u.name, a.status 
FROM users u 
INNER JOIN applications a ON u.id = a.user_id;`,
    interviewTrap: 'Daca dimensiunea work_mem este prea mica, Hash Join-ul trebuie sa faca operatiuni de "hash spill to disk", incetinind drastic interogarea.',
    keyTakeaway: 'Nested Loop pentru operatii punctuale indexate; Hash Join si Merge Join pentru procesari masive de date.'
  },
  {
    id: 'sql-21',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Deadlocks in SQL: Mecanism de Detectie si Prevenire',
    question: 'Cum apare un Deadlock intre doua tranzactii concurente in SQL si care este regula de aur de programare pentru a-l preveni?',
    answer: 'Mecanismul Deadlock:\n- Tranzactia 1 obtine un lock pe Randul A si incearca sa obtina lock pe Randul B.\n- Simultan, Tranzactia 2 a obtinut un lock pe Randul B si incearca sa obtina lock pe Randul A.\n- Fiecare tranzactie asteapta resursa blocata de cealalta. Niciuna nu poate inainta.\n\nDetectie in Postgres: Parametrul deadlock_timeout (default: 1 secunda). Dupa expirare, PostgreSQL inspecteaza graful de dependinte, detecteaza ciclul si avorteaza una dintre tranzactii aruncand DeadlockDetectedException (SQLSTATE 40P01).\n\nRegula de Aur de Prevenire: Ordoneaza intotdeauna accesul la resurse! Daca toate operatiunile blocheaza tabelele si randurile in EXACT ACEEASI ORDINE (de exemplu ordonate crescator dupa ID), aparitia unui ciclu este matematic imposibila.',
    codeSnippet: `-- Corect: Sortare dupa ID inainte de blocare:
List<Long> idsToLock = Arrays.asList(idA, idB);
Collections.sort(idsToLock); // Intotdeauna sortat!

// SELECT * FROM accounts WHERE id IN (:idsToLock) ORDER BY id FOR UPDATE;`,
    interviewTrap: 'Adaugarea unui simplu sleep() sau marirea timeout-ului nu rezolva un deadlock; doar ordonarea stricta a lock-urilor si reincercarea automata (retry) sunt solutii valide.',
    keyTakeaway: 'Ordonarea consistenta a cererilor de lock elimina complet posibilitatea aparitiei de deadlocks.'
  },
  {
    id: 'sql-22',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Partitionarea Tabelelor in PostgreSQL (Table Partitioning)',
    question: 'Ce este Declarative Partitioning in PostgreSQL, care sunt tipurile (Range, List, Hash) si ce este Partition Pruning?',
    answer: 'Partitionarea imparte o tabela gigantica in tabele fizice mai mici (partitii), pastrand o singura interfata logica pentru aplicatie.\n\nTipuri:\n1. Range Partitioning: Pe intervale de valori (ex: created_at per luna sau an). Ideal pentru time-series si audit logs.\n2. List Partitioning: Pe liste discrete de valori (ex: country IN (\'RO\', \'MD\')).\n3. Hash Partitioning: Distribuie randurile uniform pe N partitii folosind hash-ul unei chei.\n\nPartition Pruning (Beneficiul Suprem):\nCand executi SELECT * FROM logs WHERE created_at >= \'2026-03-01\', PostgreSQL consulta metadatele si exclude complet de la scanare toate celelalte partitii din alti ani/luni, interogand doar partitia exacta relevanta!',
    codeSnippet: `-- Tabela master partitionata dupa data:
CREATE TABLE job_events (
    id UUID,
    event_time TIMESTAMP NOT NULL,
    payload JSONB
) PARTITION BY RANGE (event_time);

-- Partitie specifica pentru luna Martie 2026:
CREATE TABLE job_events_2026_03 PARTITION OF job_events
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');`,
    interviewTrap: 'Daca ai o cheie primara PRIMARY KEY pe tabela master, coloana de partitionare TREBUIE sa faca parte obligatoriu din cheia primara compusa!',
    keyTakeaway: 'Partitionarea permite Partition Pruning si stergerea instantanee a datelor vechi prin simplul DROP TABLE pe o partitie veche.'
  },
  {
    id: 'sql-23',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'WAL (Write-Ahead Logging) si Checkpoints in PostgreSQL',
    question: 'Cum garanteaza WAL durabilitatea (litera D din ACID) si ce se intampla in timpul unui Checkpoint in PostgreSQL?',
    answer: 'Inainte ca orice modificare de date sa fie scrisa in fisierele de date ale tabelei (.dbf pe disc), PostgreSQL scrie modificarea secvential intr-un jurnal append-only numit WAL (Write-Ahead Log).\n\nDe ce este rapid: Scrierea secventiala in WAL este de zeci de ori mai rapida decat scrierile aleatorii (random I/O) in paginile tabelelor.\n\nCe este un Checkpoint:\n1. Paginile modificate din memorie (Shared Buffers) sunt "murdare" (dirty buffers).\n2. La intervale regulate (checkpoint_timeout, de ex: 5-15 minute), procesul Checkpointer scrie toate aceste pagini murdare din RAM direct in fisierele de date de pe disc (fsync).\n3. Dupa finalizarea Checkpoint-ului, segmentele vechi de WAL pot fi reciclate sau arhivate.\n\nRecuperare la Crash: Daca serverul se opreste brusc din pana de curent, PostgreSQL citeste WAL-ul incepand de la ultimul Checkpoint si aplica schimbarile (REDO), revenind la o stare 100% consistenta.',
    codeSnippet: `-- Monitorizare activitate checkpoint:
SELECT checkpoints_timed, checkpoints_req, checkpoint_write_time, checkpoint_sync_time 
FROM pg_stat_bgwriter;`,
    interviewTrap: 'Daca max_wal_size este prea mic, Checkpoints se declanseaza prea des (checkpoints_req), provocand varfuri masive de scriere pe disc (I/O spikes).',
    keyTakeaway: 'WAL asigura ca nicio tranzactie comisa nu este pierduta, permitand scrieri asincrone eficiente pe disc prin Checkpoints.'
  },
  {
    id: 'sql-24',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Replicare Streaming: Sincrona vs Asincrona si Replication Lag',
    question: 'Care este diferenta dintre replicarea sincrona si asincrona in PostgreSQL si cum gestionezi problema "Replication Lag"?',
    answer: '1. Replicare Asincrona (Default in Cloud/AWS RDS):\n- Masterul comite tranzactia (COMMIT) imediat ce a scris-o in propriul WAL, fara sa astepte replica.\n- Avantaj: Throughput maxim, latenta zero de asteptare pe master.\n- Risc: Replication Lag (replica poate fi cu cateva milisecunde sau secunde in urma). Daca masterul arde complet, datele ne-transmise se pierd (RPO > 0).\n\n2. Replicare Sincrona (synchronous_commit = on):\n- Masterul asteapta confirmarea de la cel putin o replica inainte de a intoarce succesul catre client.\n- Avantaj: Zero pierdere de date (RPO = 0).\n- Dezavantaj: Latenta fiecarei scrieri creste cu timpul de round-trip de retea (RTT) catre replica.\n\nProblema Read-Your-Own-Writes:\nDaca un utilizator salveaza o aplicatie pe Master si imediat este redirectionat pe un Read Replica sa o vizualizeze, poate vedea ecran gol daca replica are 200ms lag. Solutie: citirea profilului utilizatorului curent se directioneaza catre Master pentru 5 secunde dupa o scriere.',
    codeSnippet: `-- Verificare stare replicare si lag:
SELECT client_addr, state, sync_state, 
       pg_wal_lsn_diff(pg_current_wal_lsn(), write_lsn) as lag_bytes
FROM pg_stat_replication;`,
    interviewTrap: 'Trimiterea tuturor citirilor pe read replicas fara a lua in calcul lag-ul cauzeaza bug-uri bizare unde datele par "disparute" temporar dupa salvare.',
    keyTakeaway: 'Foloseste replicare asincrona pentru scalare orizontala de citiri, dar routeaza citirile critice imediat dupa scriere catre nodul Master.'
  },
  {
    id: 'sql-25',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'PgBouncer: Moduri de Pooling (Session vs Transaction)',
    question: 'De ce este necesar un connection pooler extern precum PgBouncer si care este diferenta critica dintre Session Pooling si Transaction Pooling?',
    answer: 'Fiecare conexiune fizica la PostgreSQL genereaza un proces separat de sistem de operare (fork) care consuma in jur de 5-10 MB de memorie RAM. La peste 200-300 de conexiuni, PostgreSQL devine instabil.\nPgBouncer actioneaza ca un proxy extrem de usor care poate mentine 10.000 de conexiuni de la aplicatii si le multiplexeaza pe doar 20 de conexiuni reale catre baza de date.\n\nModuri de Pooling:\n1. Session Pooling (Implicit):\nO conexiune din pool este alocata aplicatiei cand se conecteaza si este eliberata doar cand aplicatia se deconecteaza complet.\n2. Transaction Pooling (Cel mai eficient in Microservices):\nO conexiune la DB este alocata clientului DOAR pe durata unei singure tranzactii (BEGIN ... COMMIT). Imediat ce tranzactia se termina, conexiunea este redata instantaneu altui request!\nLimitare Transaction Pooling: Nu poti folosi Prepared Statements la nivel de sesiune, variabile de sesiune (SET ...) sau tabele temporare fara configurari specifice.',
    codeSnippet: `# Configurare pgbouncer.ini:
pool_mode = transaction
max_client_conn = 5000
default_pool_size = 25`,
    interviewTrap: 'In modul Transaction Pooling, adnotarea SET search_path sau variabilele ThreadLocal de sesiune se pierd intre tranzactii consecutive.',
    keyTakeaway: 'PgBouncer in modul Transaction Pooling permite miilor de containere sa ruleze pe doar 20 de conexiuni fizice la DB.'
  },
  {
    id: 'sql-26',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'UPSERT in PostgreSQL: INSERT ... ON CONFLICT DO UPDATE',
    question: 'Cum implementezi o operatiune atomica de UPSERT in PostgreSQL si cum accesezi valorile propuse folosind pseudotabela EXCLUDED?',
    answer: 'Un UPSERT (Update or Insert) realizeaza atomic inserarea unui rand, iar in cazul in care exista deja un conflict pe o cheie primara sau un index unic, efectueaza un UPDATE pe randul existent.\n\nPseudotabela EXCLUDED:\nIn cadrul clauzei DO UPDATE, cuvantul cheie EXCLUDED reprezinta valorile care ar fi fost inserate prin comanda INSERT curenta. Astfel poti scrie formule de actualizare incrementala fara a mai face un SELECT prealabil.',
    codeSnippet: `INSERT INTO job_postings (external_id, views_count, last_seen)
VALUES ('JOB-9921', 1, NOW())
ON CONFLICT (external_id) 
DO UPDATE SET 
    views_count = job_postings.views_count + 1,
    last_seen = EXCLUDED.last_seen;`,
    interviewTrap: 'Clauza ON CONFLICT necesita obligatoriu existenta unui constraint UNIQUE sau a unui UNIQUE INDEX pe coloana sau coloanele din paranteza!',
    keyTakeaway: 'ON CONFLICT transforma operatiunile costisitoare de verificare prealabila (SELECT -> daca exista UPDATE, altfel INSERT) intr-un singur query atomic sigur impotriva concurentei.'
  },
  {
    id: 'sql-27',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'JSONB vs JSON in PostgreSQL: Diferente Structurale',
    question: 'Care este diferenta fundamentala de stocare si performanta dintre tipurile de date JSON si JSONB in PostgreSQL?',
    answer: '1. Tipul JSON (Text Bruta):\n- Stocheaza datele exact asa cum au fost trimise, ca un String brut de caractere.\n- Pastreaza spatiile albe, formatarea si cheile duplicate.\n- Inserare foarte rapida (nu parseaza).\n- Cautare si interogare extrem de LENTA: la fiecare interogare, intregul text trebuie reparsat de la zero in memorie.\n- NU suporta indexare GIN eficienta.\n\n2. Tipul JSONB (Binary Decomposed):\n- Stocheaza datele intr-un format binar descompus si structurat.\n- Elimina spatiile albe si cheile duplicate, sortand cheile intern.\n- Inserarea este usor mai lenta din cauza parsarii initiale.\n- Cautare si parsare ULTRA-RAPIDA.\n- Suporta indecsi GIN avansati, cautari de chei si operatori de continere.',
    codeSnippet: `-- Creeaza intotdeauna JSONB pentru date dinamice:
ALTER TABLE job_applications ADD COLUMN parsed_resume JSONB;`,
    interviewTrap: 'Daca folosesti tipul JSON simplu in loc de JSONB, interogarile pe campuri interne vor deveni un cosmar de performanta deoarece nu poti crea indecsi pe ele.',
    keyTakeaway: 'Foloseste intotdeauna tipul JSONB pentru orice date semi-structurate in PostgreSQL.'
  },
  {
    id: 'sql-28',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Operatori JSONB Cheie in PostgreSQL: -> vs ->>',
    question: 'Care este diferenta dintre operatorul -> si operatorul ->> la interogarea campurilor JSONB?',
    answer: '1. Operatorul -> (Returneaza JSONB Object):\n- Extrage un camp dintr-un obiect JSON sau un element dintr-un array, returnand rezultatul tot ca tip de date JSONB.\n- Poate fi inlantuita pentru navigare adanca: data->\'address\'->\'city\'.\n\n2. Operatorul ->> (Returneaza Text SQL):\n- Extrage valoarea finala sub forma de String SQL standard (text).\n- Este utilizat la finalul lantului pentru a compara valoarea cu un literal SQL sau pentru a o afisa clientului.',
    codeSnippet: `-- Extragere text si filtrare:
SELECT 
    data->'company'->>'name' as company_name,
    (data->'compensation'->>'base')::numeric as salary
FROM job_postings
WHERE data->'company'->>'name' = 'Google';`,
    interviewTrap: 'Daca folosesti -> in loc de ->> in clauza WHERE (ex: WHERE data->\'name\' = \'Google\'), comparatia va esua deoarece compari tipul JSONB "Google" (cu ghilimele incluse) cu literalul SQL \'Google\'!',
    keyTakeaway: 'Foloseste -> pentru navigare intermediara si ->> pentru extragerea valorii finale de tip text.'
  },
  {
    id: 'sql-29',
    category: 'SQL',
    difficulty: 'USOR',
    title: 'UNION vs UNION ALL: Impactul Asupra Performantei',
    question: 'De ce este UNION ALL semnificativ mai rapid decat UNION si cand trebuie sa eviti UNION?',
    answer: '1. UNION ALL:\n- Combina pur si simplu rezultatele a doua sau mai multe interogari si le returneaza direct.\n- Nu verifica si nu elimina duplicatele.\n- Complexitate: O(N) liniara, consum minim de memorie si CPU.\n\n2. UNION (fara ALL):\n- Combina rezultatele SI executa un pas suplimentar costisitor de deduplicare (Sort Unique sau Hash Aggregate) peste toate randurile combinate pentru a sterge duplicatele!\n- Daca setul de date are 1 milion de randuri, UNION va forta o sortare masiva in memorie sau pe disc, cauzand degradare grava de performanta.',
    codeSnippet: `-- Rapid O(N) cand stii ca datele sunt disjuncte:
SELECT id, title FROM active_jobs
UNION ALL
SELECT id, title FROM archived_jobs;`,
    interviewTrap: 'Multi dezvoltatori folosesc UNION din obisnuinta chiar si cand tabelele sunt complet disjuncte (nu au cum sa aiba randuri comune), irosind resurse de sortare inutile.',
    keyTakeaway: 'Foloseste intotdeauna UNION ALL ca optiune implicita, rezervand UNION doar cand ai nevoie explicita de eliminarea duplicatelor.'
  },
  {
    id: 'sql-30',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Logica Ternara si Clauza IS DISTINCT FROM in SQL',
    question: 'Cum functioneaza logica trivalenta in SQL cu valorile NULL si de ce comparatia col != \'ACTIVE\' nu returneaza randurile cu NULL?',
    answer: 'In SQL, o conditie poate fi: TRUE, FALSE sau UNKNOWN (NULL).\nOrice operatie de comparatie obisnuita cu NULL (=, !=, <, >) returneaza UNKNOWN, iar clauza WHERE accepta exclusiv randurile evaluate la TRUE!\n\nProblema:\nDaca o coloana status are valoarea NULL, conditia WHERE status != \'REJECTED\' evalueaza NULL != \'REJECTED\' ca UNKNOWN, iar randul este ignorat!\n\nSolutie: Operatorul IS DISTINCT FROM\nClauza: WHERE status IS DISTINCT FROM \'REJECTED\'\nTrateaza NULL ca pe o valoare distincta cunoscuta. Daca status este NULL, expresia este evaluata ca TRUE, incluzand randul in rezultat asa cum se asteapta intuitiv dezvoltatorul.',
    codeSnippet: `-- Returneaza si inregistrarile unde status este NULL:
SELECT * FROM job_applications 
WHERE status IS DISTINCT FROM 'REJECTED';`,
    interviewTrap: 'Expresia WHERE column = NULL este o greseala clasica de incepator; sintaxa corecta este intotdeauna WHERE column IS NULL.',
    keyTakeaway: 'Foloseste IS DISTINCT FROM pentru comparatii NULL-safe sigure si predictibile in PostgreSQL.'
  },
  {
    id: 'sql-31',
    category: 'SQL',
    difficulty: 'USOR',
    title: 'Functiile COALESCE si NULLIF in SQL',
    question: 'Ce fac functiile COALESCE() si NULLIF() si cum previi impartirea la zero (Division by Zero) in rapoarte SQL?',
    answer: '1. COALESCE(arg1, arg2, ..., argN):\nReturneaza primul argument non-NULL din lista sa. Daca toate sunt NULL, returneaza NULL. Se foloseste pentru valori de rezerva (fallback).\n\n2. NULLIF(arg1, arg2):\nCompara doua valori: daca arg1 == arg2, returneaza NULL; altfel returneaza arg1.\n\nPrevenirea Impartirii la Zero:\nDaca imparti numarul de aplicatii la numarul de vizualizari, iar vizualizarile sunt 0, query-ul pica cu division by zero. Folosind NULLIF(views, 0), daca views este 0, devine NULL. Orice impartire la NULL returneaza NULL in loc sa arunce eroare, iar combinat cu COALESCE poti intoarce 0.0!',
    codeSnippet: `-- Formula sigura impotriva impartirii la zero:
SELECT 
    job_id,
    COALESCE(applications * 100.0 / NULLIF(views, 0), 0.0) as conversion_rate
FROM job_statistics;`,
    interviewTrap: 'Daca uiti sa folosesti NULLIF la rapoarte cu rate procentuale, primul job cu zero vizualizari va opri intregul raport de productie cu eroare fatala!',
    keyTakeaway: 'Combinatia COALESCE si NULLIF este solutia eleganta pentru tratarea sigura a calculelor cu zero si valori lipsa.'
  },
  {
    id: 'sql-32',
    category: 'SQL',
    difficulty: 'USOR',
    title: 'WHERE vs HAVING si Ordinea Logica de Executie SQL',
    question: 'Care este diferenta dintre clauzele WHERE si HAVING si care este ordinea cronologica logica a fazelor de executie ale unui SELECT?',
    answer: '1. Diferenta Cheie:\n- WHERE: Filtreaza randurile individuale INAINTE de gruparea lor (GROUP BY). Nu poate contine functii de agregare (SUM, COUNT, AVG).\n- HAVING: Filtreaza grupurile rezultate DUPA ce agregarea a fost calculata.\n\nOrdinea Logica de Executie (diferita de ordinea de scriere!):\n1. FROM / JOIN (Identificarea tabelelor sursa)\n2. WHERE (Filtrarea randurilor de baza)\n3. GROUP BY (Gruparea in agregate)\n4. HAVING (Filtrarea grupurilor)\n5. SELECT (Calcularea coloanelor si aliasurilor)\n6. DISTINCT (Eliminarea duplicatelor)\n7. ORDER BY (Sortarea finala)\n8. LIMIT / OFFSET (Taierea rezultatului)',
    codeSnippet: `SELECT department, COUNT(*) as total_apps
FROM applications
WHERE status = 'ACTIVE'      -- 1. Filtrare inainte de agregare
GROUP BY department          -- 2. Grupare
HAVING COUNT(*) >= 10        -- 3. Filtrare dupa agregare
ORDER BY total_apps DESC;    -- 4. Sortare`,
    interviewTrap: 'Nu poti folosi aliasul unei coloane definit in SELECT in interiorul clauzei WHERE, deoarece WHERE se executa cu mult inainte de faza SELECT!',
    keyTakeaway: 'Filtreaza cat mai multe randuri in WHERE inainte de GROUP BY pentru a usura memoria alocata agregarii.'
  },
  {
    id: 'sql-33',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Forme Normale (1NF, 2NF, 3NF, BCNF) in Proiectarea Bazelor de Date',
    question: 'Explica regulile celor 3 Forme Normale (1NF, 2NF, 3NF) intr-un mod practic si usor de retinut.',
    answer: 'Normalizarea elimina anomaliile de inserare, actualizare si stergere:\n1. 1NF (Prima Forma Normala):\n- Toate campurile contin valori atomice (indivizibile). Fara liste separate prin virgula in aceeasi celula (ex: "Java, Docker, SQL" este interzis in 1NF; se sparge intr-o tabela separata de abilitati).\n- Fiecare rand are o cheie primara unica.\n2. 2NF (A Doua Forma Normala):\n- Este in 1NF si toate campurile non-cheie depind functional de INTREAGA cheie primara (nu doar de o parte din ea in cazul cheilor compuse). Fara dependinte partiale.\n3. 3NF (A Treia Forma Normala):\n- Este in 2NF si nu contine dependinte tranzitive (niciun camp non-cheie nu depinde de alt camp non-cheie). Daca ai id_oras -> nume_oras si id_tara -> nume_tara, detaliile despre tara trebuie mutate in tabela de tari.',
    codeSnippet: `-- Incalcare 1NF (Anti-pattern):
-- id: 1, name: 'Mihai', skills: 'Java,Spring,Postgres'

-- Corect 1NF si 3NF:
CREATE TABLE candidate_skills (
    candidate_id UUID REFERENCES candidates(id),
    skill_id INT REFERENCES skills(id),
    PRIMARY KEY (candidate_id, skill_id)
);`,
    interviewTrap: 'Fraza clasica a lui Bill Kent pentru 3NF: "Fiecare atribut non-cheie trebuie sa depinda de cheie, de toata cheia si de nimic altceva decat cheia (so help me Codd)".',
    keyTakeaway: 'Forma 3NF elimina redundanta si protejeaza integritatea datelor in sistemele relationale tranzactionale.'
  },
  {
    id: 'sql-34',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Denormalizare Calculata: Cand si de ce se Incalca 3NF',
    question: 'In ce situatii este justificat din punct de vedere tehnic sa denormalizezi o baza de date in productie?',
    answer: 'Desi 3NF este ideala pentru consistenta datelor, interogarile pe tabele 100% normalizate necesita zeci de operatiuni JOIN costisitoare care distrug performanta sub trafic mare de citire.\n\nCand se Denormalizeaza:\n1. Sisteme Read-Heavy de Mare Viteza: Salvarea unui camp agregat precum total_applications direct in tabela jobs, pentru a evita un SELECT COUNT(*) la fiecare afisare a paginii de listare.\n2. Baze de Date Analitice (OLAP / Data Warehousing): Unde datele sunt grupate in tabele late (wide tables) pentru rapoarte de BI.\n3. Snapshot-uri Istorice: Copierea pretului sau adresei de livrare a clientului direct in tabela orders (pretul produsului se poate schimba in timp, comanda istorica trebuie sa ramana imutabila).',
    codeSnippet: `-- Camp denormalizat pentru acces ultra-rapid:
ALTER TABLE job_postings ADD COLUMN applicant_count INT DEFAULT 0;

-- Mentinut fie prin Trigger, fie prin aplicatie (Redis / DB update atomic)`,
    interviewTrap: 'Daca denormalizezi, iti asumi riscul de inconsistenta a datelor daca aplicatia esueaza sa actualizeze ambele tabele in mod atomic.',
    keyTakeaway: 'Denormalizeaza selectiv doar pentru a rezolva blocaje clare de performanta de citire identificate prin masuratori de profilare.'
  },
  {
    id: 'sql-35',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Adaugarea Sigura a unei Coloane NOT NULL cu DEFAULT in Productie',
    question: 'De ce adaugarea unei coloane cu valoare implicita bloca intreaga tabela in versiuni vechi de PostgreSQL si cum functioneaza in Postgres 11+?',
    answer: 'Comportament Istoric (Postgres <= 10):\nComanda ALTER TABLE users ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true rescria fizic fiecare rand de pe disc pentru a adauga valoarea true. Pe o tabela de 50 de milioane de randuri, lock-ul EXCLUSIV bloca aplicatia minute intregi!\n\nOptimizarea Masiva din PostgreSQL 11+:\nIncepand cu Postgres 11, daca valoarea DEFAULT este o valoare constanta (non-volatila), PostgreSQL actualizeaza DOAR catalogul de metadate de sistem (pg_attribute) in cateva milisecunde! Baza de date nu atinge deloc randurile fizice de pe disc. Randurile vechi citesc valoarea default direct din catalog pana cand sunt rescrise natural de noi update-uri.',
    codeSnippet: `-- Instantaneu in Postgres 11+ (fara table rewrite):
ALTER TABLE job_postings 
ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;`,
    interviewTrap: 'Daca valoarea default este o functie volatila (ex: DEFAULT clock_timestamp()), optimizarea NU se aplica si Postgres va rescrie toata tabela pe disc!',
    keyTakeaway: 'Adaugarea coloanelor NOT NULL cu default constant este o operatie instantanee O(1) in PostgreSQL modern.'
  },
  {
    id: 'sql-36',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Full-Text Search in PostgreSQL: tsvector si tsquery',
    question: 'Cum configurezi un motor de cautare textuala avansata in PostgreSQL folosind tsvector, tsquery si un index GIN?',
    answer: 'PostgreSQL ofera un motor de cautare Full-Text Search integrat de inalta performanta fara a necesita un cluster Elasticsearch extern:\n1. tsvector: Un tip de date care stocheaza un set de cuvinte sortate si reduse la forma radacina (stemming, ex: "programming" si "programs" devin "program"), impreuna cu pozitia lor in text.\n2. tsquery: O expresie de cautare cu operatori booleeni: & (AND), | (OR), ! (NOT), <-> (urmat de).\n3. Index GIN pe tsvector: Cautarea se realizeaza instant prin arbore inversat.',
    codeSnippet: `-- 1. Coloana generata automat cu tsvector:
ALTER TABLE job_postings 
ADD COLUMN search_vector tsvector 
GENERATED ALWAYS AS (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))) STORED;

-- 2. Index GIN:
CREATE INDEX idx_jobs_search_gin ON job_postings USING GIN (search_vector);

-- 3. Interogare de cautare textuala:
SELECT id, title, ts_rank(search_vector, to_tsquery('english', 'Java & Spring')) as rank
FROM job_postings
WHERE search_vector @@ to_tsquery('english', 'Java & Spring')
ORDER BY rank DESC;`,
    interviewTrap: 'Nu folosi LIKE \'%termen%\' pentru cautari mari de text; LIKE face intotdeauna Full Table Scan si nu suporta stemming lingvistic!',
    keyTakeaway: 'Full-Text Search nativ in Postgres ofera stemming, ranking si cautari booleene rapide cu suport de indexare GIN.'
  },
  {
    id: 'sql-37',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Constrangeri EXCLUDE in PostgreSQL (Prevenirea Suprapunerilor)',
    question: 'Cum previi suprapunerea de intervale temporale (de exemplu rezervari de sali sau interviuri) direct la nivel de baza de date cu EXCLUDE?',
    answer: 'Un simplu UNIQUE constraint poate asigura unicitatea unei valori exacte, dar NU poate valida ca doua intervale de timp [start_time, end_time] nu se suprapun!\n\nSolutie: EXCLUDE USING GIST cu tipul tstzrange:\nConstrangerea EXCLUDE instruieste PostgreSQL sa respinga orice rand nou al carui interval de timp se suprapune cu un rand existent pentru aceeasi resursa (folosind operatorul de suprapunere &&).',
    codeSnippet: `-- Activare extensie necesara:
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE interview_slots (
    id UUID PRIMARY KEY,
    interviewer_id UUID NOT NULL,
    slot_time TSTZRANGE NOT NULL,
    -- Impiedica programarea a doua interviuri in acelasi interval pentru acelasi intervievator:
    EXCLUDE USING GIST (
        interviewer_id WITH =,
        slot_time WITH &&
    )
);`,
    interviewTrap: 'Daca incerci sa validezi suprapunerile doar din codul Java backend printr-un query SELECT urmat de INSERT, aplicatia va genera suprapuneri sub apeluri concurente (Race Condition).',
    keyTakeaway: 'Constrangerile EXCLUDE rezolva elegant si garantat matematic problema suprapunerilor concurente la nivelul bazei de date.'
  },
  {
    id: 'sql-38',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Two-Phase Commit (2PC) in Baze de Date Relationate',
    question: 'Ce este protocolul Two-Phase Commit (2PC) in baze de date distribuite si care sunt cele doua faze ale sale?',
    answer: 'Two-Phase Commit (2PC) este un protocol de consens atomic distribuit care asigura ca o tranzactie distribuita care implica multiple noduri sau baze de date se comite pe TOATE nodurile sau pe NICIUNUL.\n\nCele Doua Faze:\n1. Faza 1: Prepare Phase (Votare)\n- Coordonatorul tranzactiei trimite un mesaj PREPARE tuturor nodurilor participante.\n- Fiecare participant scrie modificarile in WAL si verifica daca poate garanta comiterea. Daca da, raspunde cu VOTE YES; daca nu, raspunde cu VOTE NO.\n2. Faza 2: Commit / Abort Phase (Decizie)\n- Daca TOATE nodurile au votat YES, coordonatorul trimite comanda COMMIT.\n- Daca cel putin un nod a votat NO (sau nu a raspuns la timeout), coordonatorul trimite comanda ROLLBACK catre toate nodurile.',
    codeSnippet: `-- Comenzi native 2PC in PostgreSQL:
PREPARE TRANSACTION 'tx_ats_job_123';
-- Daca totul e ok pe toate sistemele partenere:
COMMIT PREPARED 'tx_ats_job_123';
-- In caz de eroare la un partener:
ROLLBACK PREPARED 'tx_ats_job_123';`,
    interviewTrap: '2PC este un protocol sincron blocant: daca nodul coordonator pica dupa faza de Prepare, nodurile participante raman cu lock-urile blocate pe resurse, reducand drastic disponibilitatea sistemului.',
    keyTakeaway: '2PC ofera consistenta atomica stricta, dar adauga latenta mare si blocaje de disponibilitate in sisteme distribuite.'
  },
  {
    id: 'sql-39',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Stored Procedures vs Functions in PostgreSQL',
    question: 'Care este diferenta critica dintre o Functie (FUNCTION) si o Procedura Stocata (PROCEDURE) in PostgreSQL?',
    answer: 'Incepand cu PostgreSQL 11, s-a introdus distinctia clara intre functii si proceduri:\n1. PostgreSQL FUNCTION:\n- Se apeleaza cu SELECT my_func().\n- Se executa intotdeauna in interiorul contextului tranzactional existent al apelantului.\n- NU poate efectua comenzi de control al tranzactiei (nu poti executa comenzi COMMIT sau ROLLBACK in interiorul unei functii!).\n2. PostgreSQL PROCEDURE:\n- Se apeleaza cu comanda CALL my_proc().\n- Suporta management autonom al tranzactiilor: poti rula operatiuni lungi in bucla si poti apela COMMIT sau ROLLBACK direct in interiorul procedurii pentru a elibera lock-urile in batch-uri!',
    codeSnippet: `CREATE OR REPLACE PROCEDURE archive_old_jobs(cutoff_date DATE)
LANGUAGE plpgsql AS $$
BEGIN
    DELETE FROM job_postings WHERE created_at < cutoff_date;
    COMMIT; -- Permis doar in PROCEDURI, interzis in FUNCTII!
END;
$$;

-- Apel:
CALL archive_old_jobs('2025-01-01');`,
    interviewTrap: 'Daca incerci sa pui un COMMIT; intr-o functie PostgreSQL clasica (CREATE FUNCTION), vei primi eroarea: cannot commit while a subtransaction is active.',
    keyTakeaway: 'Foloseste PROCEDURE cand ai nevoie de procesari masive in loturi cu comitere intermediara a tranzactiilor.'
  },
  {
    id: 'sql-40',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Star Schema vs Snowflake Schema in Data Warehousing',
    question: 'Care este diferenta structurala dintre Star Schema si Snowflake Schema in modelarea bazelor de date pentru analiza (OLAP)?',
    answer: 'Ambele sunt modele dimensionale folosite in Data Warehouses:\n1. Star Schema (Schema Stea):\n- O tabela centrala de Fapte (Fact Table - masuratori numerice, vanzari, aplicari) inconjurata direct de tabele de Dimensiuni (Dimension Tables).\n- Tabelele de dimensiuni sunt complet DENORMALIZATE.\n- Avantaj: Interogarile analitice sunt extrem de simple si rapide, necesitand putine JOIN-uri.\n2. Snowflake Schema (Schema Fulg de Nea):\n- O varianta a Star Schema unde tabelele de dimensiuni sunt NORMALIZATE suplimentar (de exemplu: Dimensiunea Locatie se sparge in Oras -> Judet -> Tara).\n- Reduce redundanta de date, dar creste numarul de JOIN-uri necesare si incetineste interogarile de raportare.',
    codeSnippet: `-- Fact Table in Star Schema:
CREATE TABLE fact_job_applications (
    application_id UUID PRIMARY KEY,
    date_key INT REFERENCES dim_date(date_key),
    job_key INT REFERENCES dim_job(job_key),
    candidate_key INT REFERENCES dim_candidate(candidate_key),
    days_to_hire INT,
    salary_offered NUMERIC
);`,
    interviewTrap: 'In sistemele moderne de BI si analytics, Star Schema este aproape intotdeauna preferata in fata Snowflake Schema datorita vitezei de interogare pe coloane.',
    keyTakeaway: 'Star Schema prioritizeaza performanta prin denormalizare, in timp ce Snowflake normalizeaza dimensiunile.'
  },
  {
    id: 'sql-41',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Optimistic Concurrency Control vs Pessimistic Locking la nivel SQL',
    question: 'Cum se traduce diferenta dintre blocarea optimista si pesimista in comenzi SQL concrete?',
    answer: '1. Pessimistic Locking (SELECT ... FOR UPDATE):\n- Aplicatia blocheaza fizic randul in baza de date inainte de a citi si modifica datele.\n- SQL: SELECT balance FROM accounts WHERE id = 1 FOR UPDATE;\n- Nicio alta tranzactie nu poate citi cu lock sau modifica acest rand pana cand tranzactia initiala da COMMIT sau ROLLBACK.\n- Recomandat: la concurenta mare de scriere pe aceeasi resursa (rezervari de bilete pe locuri unice).\n\n2. Optimistic Concurrency Control (OCC):\n- Nu pune niciun lock fizic pe rand la citire (throughput maxim).\n- Include o coloana version sau updated_at.\n- La salvare, verifica: UPDATE accounts SET balance = :newBalance, version = version + 1 WHERE id = :id AND version = :oldVersion;\n- Daca numarul de randuri afectate este 0, inseamna ca altcineva a modificat randul intre timp, iar aplicatia arunca exceptie si reincearca.',
    codeSnippet: `-- Verificare Optimistic Locking in SQL pur:
UPDATE bank_accounts 
SET balance = balance - 100, version = version + 1 
WHERE id = 42 AND version = 5;
-- Daca rows affected == 0 -> Conflict concurent!`,
    interviewTrap: 'Daca folosesti Pessimistic Locking pentru operatiuni lungi care asteapta confirmari de la utilizator sau API-uri externe, vei bloca baza de date.',
    keyTakeaway: 'Optimistic Locking este ideal pentru scalabilitate pe citiri, iar Pessimistic Locking este necesar pentru stocuri finite concurente.'
  },
  {
    id: 'sql-42',
    category: 'SQL',
    difficulty: 'DIFICIL',
    title: 'Transaction ID Wraparound in PostgreSQL',
    question: 'Ce este pericolul catastrofal de "Transaction ID Wraparound" in PostgreSQL si cum il previne procesul Freeze?',
    answer: 'In PostgreSQL, identificatorii de tranzactie (txid) sunt numere intregi pe 32 de biti, ceea ce inseamna un maxim de ~4.2 miliarde de tranzactii.\n\nProblema Wraparound:\nDatorita aritmeticii circulare modulo 2^32, dupa 2 miliarde de tranzactii, tranzactiile vechi din trecut ar putea parea ca fac parte din VIITOR! Daca s-ar intampla acest lucru, datele vechi ar deveni invizibile (disparute complet din baza de date)!\n\nCum este prevenit (Freezing):\n1. PostgreSQL marcheaza tranzactiile foarte vechi ca "Frozen" (inghetate) setand un bit special in antetul randului (HEAP_XMIN_FROZEN).\n2. Un rand inghetat este considerat mai vechi decat orice tranzactie posibila din viitor.\n3. Daca autovacuum-ul nu reuseste sa inghete tabelele la timp si se apropie pragul critic de 2 miliarde, PostgreSQL intra automat in mod de siguranta READ-ONLY si refuza orice scriere pana la rularea unui VACUUM FREEZE complet!',
    codeSnippet: `-- Monitorizare distanta pana la wraparound:
SELECT datname, age(datfrozenxid) as xid_age 
FROM pg_database 
ORDER BY age(datfrozenxid) DESC;`,
    interviewTrap: 'Daca dezactivezi autovacuum-ul, serverul va atinge dupa cateva luni limita de tranzactii si se va opri fortat in productie.',
    keyTakeaway: 'Autovacuum freeze este mecanismul intern vital care mentine baza de date PostgreSQL functionala dincolo de limita de 2^32 tranzactii.'
  },
  {
    id: 'sql-43',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Unlogged Tables in PostgreSQL: Cand si Cum le Folosesti',
    question: 'Ce sunt "Unlogged Tables" in PostgreSQL, de ce sunt de cateva ori mai rapide si ce risc major prezinta?',
    answer: 'O tabela creata cu clauza UNLOGGED (CREATE UNLOGGED TABLE ...):\n- NU scrie nicio modificare in jurnalul WAL (Write-Ahead Log).\n- Viteza de Inserare si Actualizare este uriasa (de pana la 5-10 ori mai rapida decat o tabela normala) deoarece nu are overhead de disc WAL.\n\nRiscul Major:\nTabelele Unlogged NU sunt sigure impotriva caderilor de server (crash-safe)!\nDaca serverul PostgreSQL pica sau este restartat brusc, PostgreSQL goleste automat (TRUNCATE) toate datele din tabelele unlogged la pornire pentru a garanta integritatea sistemului!\n\nCazuri Ideale de Utilizare: Tabele temporare de cache intern, sesiuni de utilizator volatile sau tabele intermediare de staging pentru procese ETL de import.',
    codeSnippet: `CREATE UNLOGGED TABLE temp_import_staging (
    raw_id VARCHAR(100),
    imported_payload JSONB
);`,
    interviewTrap: 'Nu stoca niciodata date de business importante in tabele unlogged, deoarece vor fi sterse instantaneu la primul restart neasteptat al bazei de date.',
    keyTakeaway: 'Unlogged Tables ofera viteza extrema pentru date efemere si cache prin eliminarea scrierilor in WAL.'
  },
  {
    id: 'sql-44',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'De ce COUNT(*) este Lent in PostgreSQL fata de alte motoare',
    question: 'De ce un simplu SELECT COUNT(*) pe o tabela mare este mult mai lent in PostgreSQL decat in MySQL MyISAM?',
    answer: 'In MySQL MyISAM, tabela stoca direct un contor atomic fix in antetul fisierului, returnand numarul instantaneu.\n\nDe ce PostgreSQL nu poate face asta:\nIn PostgreSQL, datorita arhitecturii MVCC (Multi-Version Concurrency Control), fiecare tranzactie activa vede un snapshot diferit al bazei de date! Un rand poate fi vizibil pentru Tranzactia 1, dar sters sau inca necomis pentru Tranzactia 2.\nPrin urmare, PostgreSQL nu are cum sa aiba un singur contor global magic. El este obligat sa scaneze fiecare rand sau sa parcurga un index (Index Only Scan) pentru a verifica bitii de vizibilitate din Visibility Map si a numara exact randurile vizibile tranzactiei curente.\n\nSolutie pentru estimari instantanee in UI: Interogarea catalogului pg_class.',
    codeSnippet: `-- Estimare instant O(1) a numarului de randuri dintr-o tabela masiva:
SELECT reltuples::bigint AS estimated_count 
FROM pg_class 
WHERE relname = 'job_postings';`,
    interviewTrap: 'Nu rula SELECT COUNT(*) pe tabele cu zeci de milioane de randuri pe endpoint-uri publice de API; foloseste estimari sau contoare calculate in fundal.',
    keyTakeaway: 'In PostgreSQL, COUNT(*) trebuie sa verifice vizibilitatea MVCC a fiecarui rand, motiv pentru care nu exista un contor global instant.'
  },
  {
    id: 'sql-45',
    category: 'SQL',
    difficulty: 'MEDIU',
    title: 'Connection Exhaustion si rezolvarea Max Connections Reached',
    question: 'Ce cauzeaza eroarea FATAL: remaining connection slots are reserved for non-replication superuser connections si cum se rezolva?',
    answer: 'Aceasta eroare apare cand numarul de conexiuni deschise de aplicatiile client a atins limita setata de parametrul max_connections in postgresql.conf.\n\nCauze Comune:\n1. Lipsa unui Connection Pool in aplicatie (fiecare request web deschide new Connection).\n2. Connection Leaks: Metode Java care deschid conexiuni si nu le inchid in blocuri try-with-resources.\n3. Scalare necoordonata de microservicii: Daca ai 20 de pod-uri Spring Boot, iar fiecare are setat Hikari maximum-pool-size = 50, ai deja 1.000 de conexiuni posibile catre o baza setata la max_connections = 200!\n\nRezolvare:\n1. Redu maximum-pool-size in fiecare aplicatie la 5-10 conexiuni.\n2. Adauga un connection pooler intermediar centralizat (PgBouncer in modul transaction).\n3. Monitorizeaza conexiunile active din tabela pg_stat_activity.',
    codeSnippet: `-- Investigare conexiuni curente si query-uri blocate:
SELECT pid, usename, client_addr, state, query_start, query 
FROM pg_stat_activity 
WHERE state != 'idle' 
ORDER BY query_start ASC;`,
    interviewTrap: 'Cresterea nesabuita a parametrului max_connections la 2000 pe un server fara RAM masiv va aduce baza de date in colaps de memorie (OOM Killer de Linux).',
    keyTakeaway: 'Foloseste PgBouncer si dimensioneaza corect pool-urile de aplicatie pentru a preveni epuizarea conexiunilor la baza de date.'
  }
];
