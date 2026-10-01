// Deck Masiv: SQL, PostgreSQL, Indecsi, ACID & Optimizare Query-uri
// Preluat din: PostgreSQL Official Docs, High-Performance SQL Guides, DopplerHQ
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
  }
];
