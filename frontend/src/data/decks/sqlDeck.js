// Deck Masiv: SQL, PostgreSQL, MySQL & Concepte de Interviu (Junior & Mid-Level)
// Preluat din: PostgreSQL Official Documentation, ANSI SQL Standards, High-Performance SQL & Top Interview Repos
// 100 de carduri realiste de interviu (DDL/DML/DCL/TCL, Joins, Window Functions, B-Tree, ACID, Constrangeri)
// FARA intrebari de Senior / Arhitect (Zero 2PC, Zero WAL internals)
// Dificultati: USOR si MEDIU (Zero DIFICIL)
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const SQL_DECK = [
  {
    id: "sql-01",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Cum functioneaza un Index B-Tree si cand NU il folosim?",
    question: "Ce structura are un index B-Tree in PostgreSQL/MySQL, care este complexitatea de cautare si in ce situatii adaugarea unui index incetineste aplicatia?",
    answer: "1. Structura si Functionare:\\n   - B-Tree (Balanced Tree) este tipul de index implicit in aproape toate bazele de date relationale.\\n   - Mentine cheile sortate intr-un arbore echilibrat pe mai multe niveluri (Root -> Intermediate Nodes -> Leaf Nodes).\\n   - Nodurile frunza contin valorile cheilor si pointeri catre locatia fizica exacta a randului pe disc (TID / Tuple ID in PostgreSQL sau cheia primara in MySQL InnoDB).\\n   - Complexitate de timp: O(log N) pentru cautare, inserare si stergere.\\n\\n2. Cand NU se recomanda adaugarea unui index:\\n   - Tabele mici (sub cateva mii de randuri): Sequential Scan este mai rapid decat parcurgerea indexului si citirea paginilor de disc.\\n   - Coloane cu cardinalitate foarte scazuta (ex: coloana de gen M/F, coloana de boolean true/false): indexul nu este selectiv.\\n   - Tabele cu scrieri foarte masive (Write-Heavy): Fiecare comanda INSERT, UPDATE sau DELETE este penalizata, deoarece toti indecsii tabelei trebuie recalculati si scrisi pe disc!",
    codeSnippet: `-- Creare index B-Tree (implicit):
CREATE INDEX idx_users_email ON users (email);

-- Verificare utilizare index:
EXPLAIN ANALYZE 
SELECT * FROM users WHERE email = 'ana@test.com';`,
    interviewTrap: "Un index grabeste masiv operatiile SELECT, dar incetineste operatiile INSERT, UPDATE si DELETE si ocupa spatiu suplimentar pe disc.",
    keyTakeaway: "Indexul B-Tree ofera cautari in O(log N); nu se pune pe tabele mici, coloane cu cardinalitate scazuta sau tabele cu scrieri continue."
  },
  {
    id: "sql-02",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Cele 4 Nivele de Izolare a Tranzactiilor (ACID)",
    question: "Care sunt cele 4 nivele standard de izolare a tranzactiilor in SQL si ce anomalii de concurenta previn?",
    answer: "Nivelul de izolare defineste gradul de protectie al unei tranzactii impotriva modificarilor concomitente facute de alte tranzactii:\\n\\n1. Read Uncommitted (Cel mai permisiv):\\n   - Permite Dirty Reads (citirea de date modificate de o alta tranzactie care inca nu a facut COMMIT si poate face ROLLBACK).\\n\\n2. Read Committed (Implicit in PostgreSQL, Oracle, SQL Server):\\n   - Previne Dirty Reads. Permite insa Non-Repeatable Reads (daca recitesti acelasi rand in aceeasi tranzactie, valorile pot fi diferite daca altcineva a facut COMMIT intre timp).\\n\\n3. Repeatable Read (Implicit in MySQL InnoDB):\\n   - Previne Dirty Reads si Non-Repeatable Reads (recitirea randului returneaza garantat aceeasi valoare din snapshot-ul initial).\\n   - Poate permite Phantom Reads (aparitia de randuri noi adaugate de alte tranzactii la re-executarea unei interogari cu WHERE).\\n\\n4. Serializable (Cel mai strict):\\n   - Previne toate anomaliile prin executie strict serializabila. Cel mai lent.",
    codeSnippet: `BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;

SELECT balance FROM accounts WHERE user_id = 42;
-- Chiar daca alta tranzactie modifica soldul si da COMMIT,
-- a doua citire va vedea exact aceeasi valoare din snapshot-ul initial:
SELECT balance FROM accounts WHERE user_id = 42;

COMMIT;`,
    interviewTrap: "In PostgreSQL, nivelul Repeatable Read previne inclusiv Phantom Read-urile clasice gratie arhitecturii MVCC bazata pe snapshot-uri.",
    keyTakeaway: "Nivelele de izolare sunt Read Uncommitted, Read Committed (default Postgres), Repeatable Read si Serializable."
  },
  {
    id: "sql-03",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Leftmost Prefix Rule pentru Indecsi Compusi",
    question: "Daca ai un index compus pe (country, city, age), care dintre clauzele WHERE vor folosi indexul si de ce?",
    answer: "1. Regula \"Leftmost Prefix\" (Prefixul din Stanga):\\n   - Un index compus creat pe coloanele (A, B, C) poate fi folosit de catre motorul bazei de date DOAR daca clauza WHERE contine o succesiune continua de coloane incepand OBLIGATORIU de la prima coloana din stanga (A)!\\n\\n2. Analiza cazurilor:\\n   - WHERE country = 'RO' -> FOLOSESTE indexul (contine prima coloana A).\\n   - WHERE country = 'RO' AND city = 'Cluj' -> FOLOSESTE indexul pe ambele coloane (A si B).\\n   - WHERE city = 'Cluj' -> NU FOLOSESTE indexul! (Lipseste coloana A, va face Sequential Scan complet pe toata tabela!).\\n   - WHERE country = 'RO' AND age = 25 -> Foloseste indexul doar pentru country (A); age nu foloseste arborele deoarece lipseste coloana intermediara B.",
    codeSnippet: `-- Creare index compus:
CREATE INDEX idx_users_geo ON users (country, city, age);

-- Eficient (foloseste index):
SELECT * FROM users WHERE country = 'RO' AND city = 'Bucuresti';

-- Ineficient (NU poate folosi indexul, lipseste 'country'):
SELECT * FROM users WHERE city = 'Bucuresti';`,
    interviewTrap: "Daca plasezi o conditie de inegalitate (<, >, BETWEEN) pe o coloana din index (ex: country = 'RO' AND city > 'C'), coloanele din dreapta ei (age) nu mai pot fi folosite pentru cautare in arbore!",
    keyTakeaway: "Indecsii compusi cer ca interogarea sa includa coloanele incepand de la cea mai din stanga (Leftmost Prefix); ordinea coloanelor in index este critica."
  },
  {
    id: "sql-04",
    category: "SQL",
    difficulty: "MEDIU",
    title: "De ce OFFSET este lent la paginare si Keyset Pagination",
    question: "De ce interogarea \"SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 500000\" este foarte lenta si cum se rezolva prin Keyset Pagination?",
    answer: "1. Problema cu OFFSET pe tabele mari (O(N)):\\n   - La OFFSET 500.000 LIMIT 20, baza de date NU sare direct la randul 500.000!\\n   - Motorul bazei de date este obligat sa citeasca si sa parcurga fizic TOATE cele 500.000 de randuri anterioare pentru a le arunca la gunoi, si abia apoi sa returneze cele 20 de randuri cerute.\\n   - Cu cat pagina este mai adanca (deep pagination), cu atat timpul de executie creste liniar, putand dura secunde bune.\\n\\n2. Solutia: Keyset Pagination (Seek Method - O(log N)):\\n   - In loc de OFFSET, clientul trimite ID-ul (sau timestamp-ul) ultimului element vazut pe pagina anterioara (last_seen_id).\\n   - Interogarea devine: WHERE id > :last_seen_id ORDER BY id ASC LIMIT 20.\\n   - Baza de date foloseste direct indexul B-Tree pentru a sari instantaneu la acea cheie in timp O(log N), indiferent ca esti la pagina 1 sau la pagina 100.000!",
    codeSnippet: `-- Ineficient pe volume mari (scaneaza si arunca 500.000 de randuri):
SELECT * FROM orders ORDER BY id LIMIT 20 OFFSET 500000;

-- Keyset Pagination (Instantaneu O(log N) prin index):
SELECT * FROM orders 
WHERE id > 500000 
ORDER BY id ASC 
LIMIT 20;`,
    interviewTrap: "Keyset Pagination este perfecta pentru feed-uri mobile si scroll infinit (Next Page), dar nu permite saltul direct la un numar arbitrar de pagina (ex: \"Sari direct la pagina 45\").",
    keyTakeaway: "OFFSET parcurge si ignora toate randurile anterioare O(N); Keyset Pagination (WHERE id > last_id) sare direct prin index in O(log N)."
  },
  {
    id: "sql-05",
    category: "SQL",
    difficulty: "USOR",
    title: "DDL vs DML vs DCL vs TCL in SQL",
    question: "Care sunt cele 4 mari sub-categorii de comenzi SQL si ce instructiuni contine fiecare?",
    answer: "Comenzile SQL sunt clasificate in 4 mari categorii dupa rolul lor:\\n\\n1. DDL (Data Definition Language - Definirea Structurii):\\n   - Gestioneaza schema bazei de date (tabele, indecsi, constrangeri, view-uri).\\n   - Comenzi: CREATE, ALTER, DROP, TRUNCATE, RENAME.\\n\\n2. DML (Data Manipulation Language - Manipularea Datelor):\\n   - Lucreaza cu datele efective (randurile) din interiorul tabelelor.\\n   - Comenzi: SELECT, INSERT, UPDATE, DELETE.\\n\\n3. DCL (Data Control Language - Controlul Accesului):\\n   - Gestioneaza drepturile si permisiunile utilizatorilor.\\n   - Comenzi: GRANT (acorda drepturi), REVOKE (retrage drepturi).\\n\\n4. TCL (Transaction Control Language - Controlul Tranzactiilor):\\n   - Gestioneaza tranzactiile si consistenta schimbarilor.\\n   - Comenzi: COMMIT (salveaza definitiv), ROLLBACK (anuleaza schimbarile), SAVEPOINT (punct intermediar de salvare).",
    codeSnippet: `-- DDL: Modifica structura tabelei
ALTER TABLE users ADD COLUMN phone VARCHAR(20);

-- DML: Modifica datele
UPDATE users SET phone = '0712345678' WHERE id = 1;

-- TCL: Confirma tranzactia
COMMIT;`,
    interviewTrap: "TRUNCATE este o comanda DDL (nu DML!), deoarece de-aloca paginile de date direct la nivel de schema fizica, fiind mult mai rapida decat DELETE.",
    keyTakeaway: "DDL defineste schema (CREATE/DROP), DML manipuleaza datele (INSERT/UPDATE), DCL gestioneaza permisiunile (GRANT) si TCL controleaza tranzactiile (COMMIT/ROLLBACK)."
  },
  {
    id: "sql-06",
    category: "SQL",
    difficulty: "USOR",
    title: "TRUNCATE vs DELETE vs DROP in SQL",
    question: "Care sunt diferentele majore dintre TRUNCATE, DELETE si DROP privind viteza, rollback-ul si stergerea structurii?",
    answer: "Aceasta este o intrebare clasica si eliminatorie de interviu!\\n\\n1. DELETE (Comanda DML):\\n   - Sterge randurile unul cate unul pe baza clauzei WHERE (ex: DELETE FROM users WHERE id = 5).\\n   - Daca omiti WHERE, sterge toate randurile, dar scrie fiecare stergere in jurnalul de tranzactii (WAL / Redo Log).\\n   - Poate face ROLLBACK intr-o tranzactie.\\n   - Declanseaza Trigger-e de DELETE (ON DELETE triggers).\\n   - NU reseteaza contoarele de auto-increment / sequence!\\n\\n2. TRUNCATE (Comanda DDL):\\n   - Goleste INTREAGA tabela ultra-rapid prin de-alocarea directa a paginilor de memorie de pe disc (nu sterge rand cu rand).\\n   - Reseteaza contoarele de auto-increment.\\n   - NU declanseaza trigger-e de tip ON DELETE row-level.\\n   - In PostgreSQL poate face ROLLBACK daca este intr-o tranzactie (in MySQL nu poate!).\\n\\n3. DROP (Comanda DDL):\\n   - Sterge atat toate datele CAT SI STRUCTURA TABELEI din schema bazei de date! Tabela inceteaza sa mai existe.",
    codeSnippet: `-- 1. DELETE: Lent pe milioane de randuri, suporta WHERE:
DELETE FROM logs WHERE created_at < '2024-01-01';

-- 2. TRUNCATE: Ultra-rapid, goleste toata tabela si reseteaza id-urile:
TRUNCATE TABLE logs RESTART IDENTITY;

-- 3. DROP: Sterge tabela complet din schema:
DROP TABLE logs;`,
    interviewTrap: "In PostgreSQL, comanda TRUNCATE este tranzactionala (poti da ROLLBACK intr-un bloc BEGIN...ROLLBACK), pe cand in MySQL, Oracle si SQL Server TRUNCATE face commit automat!",
    keyTakeaway: "DELETE sterge randuri cu WHERE si declanseaza triggers; TRUNCATE goleste rapid toata tabela prin de-alocare de pagini; DROP sterge tabela complet din dictionar."
  },
  {
    id: "sql-07",
    category: "SQL",
    difficulty: "USOR",
    title: "Clauza WHERE vs Clauza HAVING in SQL",
    question: "Care este diferenta fundamentala dintre WHERE si HAVING si de ce nu poti folosi functii agregate in WHERE?",
    answer: "1. Clauza WHERE (Filtrare la nivel de RAND individual):\\n   - Se executa INAINTE de gruparea datelor (pre-aggregation filter).\\n   - Evalueaza conditiile pe fiecare rand individual din tabele.\\n   - NU poate contine functii agregate (ex: WHERE COUNT(*) > 5 este ILEGAL!), deoarece la momentul executiei lui WHERE, grupurile inca nu au fost formate!\\n\\n2. Clauza HAVING (Filtrare la nivel de GRUP agregat):\\n   - Se executa DUPA gruparea datelor prin GROUP BY (post-aggregation filter).\\n   - Filtreaza grupurile rezultate pe baza functiilor agregate (ex: HAVING COUNT(*) >= 3, HAVING AVG(salary) > 5000).\\n\\n3. Regula de performanta:\\n   - Tot ce poate fi filtrat la nivel de rand individual trebuie pus in WHERE (reduce din timp volumul de date inainte de gruparea costisitoare).",
    codeSnippet: `-- Filtram angajatii activi in WHERE, si departamentele mari in HAVING:
SELECT department_id, COUNT(*) as total_employees, AVG(salary) as avg_salary
FROM employees
WHERE active = true                  -- 1. Filtrare randuri inainte de grupare!
GROUP BY department_id
HAVING COUNT(*) >= 5                 -- 2. Filtrare grupuri dupa agregare!
   AND AVG(salary) > 4000;`,
    interviewTrap: "Scrierea \"WHERE AVG(salary) > 2000\" genereaza eroare imediata de compilare SQL: \"aggregate functions are not allowed in WHERE\".",
    keyTakeaway: "WHERE filtreaza randurile individuale inainte de agregare; HAVING filtreaza grupurile rezultate dupa GROUP BY folosind functii agregate."
  },
  {
    id: "sql-08",
    category: "SQL",
    difficulty: "USOR",
    title: "Ordinea Logica de Executie a unei comenzi SQL",
    question: "In ce ordine executa motorul bazei de date clauzele dintr-o interogare SQL si de ce alias-urile din SELECT nu merg in WHERE?",
    answer: "Desi scrii interogarea incepand cu \"SELECT\", motorul SQL o executa intr-o ordine logica complet diferita:\\n\\nOrdinea exacta de executie:\\n1. FROM & JOIN: Identifica tabelele sursa si executa alaturarile de tabele (produsul de date).\\n2. WHERE: Filtreaza randurile individuale care nu respecta conditiile.\\n3. GROUP BY: Grupeaza randurile ramase pe baza coloanelor specificate.\\n4. HAVING: Filtreaza grupurile agregate formate.\\n5. SELECT: Calculeaza expresiile si coloanele finale returnate.\\n6. DISTINCT: Elimina duplicatele din setul selectat.\\n7. ORDER BY: Sorteaza randurile finale.\\n8. LIMIT / OFFSET: Trunchiaza numarul de randuri returnate catre client.\\n\\nDe ce nu merg alias-urile din SELECT in WHERE:\\n- Pentru ca clauza WHERE se executa la pasul 2, mult INAINTE ca clauza SELECT (pasul 5) sa fi creat alias-ul respectiv!",
    codeSnippet: `-- De ce pica: WHERE total_price > 1000
-- Corect:
SELECT product_id, (price * quantity) AS total_price -- Pasul 5: calcul alias
FROM order_items                                      -- Pasul 1
WHERE (price * quantity) > 1000                       -- Pasul 2: alias-ul inca nu exista!
ORDER BY total_price DESC;                            -- Pasul 7: alias-ul este valid aici!`,
    interviewTrap: "Alias-urile definite in SELECT POT fi folosite in ORDER BY (deoarece ORDER BY ruleaza dupa SELECT), dar NU pot fi folosite in WHERE sau GROUP BY!",
    keyTakeaway: "Ordinea logica este: FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> DISTINCT -> ORDER BY -> LIMIT."
  },
  {
    id: "sql-09",
    category: "SQL",
    difficulty: "USOR",
    title: "Tratarea valorilor NULL in SQL (Three-Valued Logic)",
    question: "De ce interogarea \"WHERE col = NULL\" nu returneaza niciodata date si cum functioneaza logica trivalenta in SQL?",
    answer: "1. Ce reprezinta NULL in SQL:\\n   - NULL nu inseamna 0, nu inseamna sir gol (\"\"), ci inseamna \"NECUNOSCUT\" / \"LIPSA DE INFORMATIE\" (Unknown / Missing Value).\\n\\n2. Logica Trivalenta (Three-Valued Logic: TRUE, FALSE, UNKNOWN):\\n   - Orice operatie de comparatie directa cu NULL (col = NULL, col != NULL, NULL = NULL) returneaza UNKNOWN, niciodata TRUE!\\n   - Clauza WHERE pastreaza doar randurile pentru care conditia este strict TRUE (elimina randurile cu FALSE si UNKNOWN).\\n   - De aceea, \"WHERE col = NULL\" returneaza mereu 0 randuri, chiar daca tabela contine randuri cu NULL!\\n\\n3. Sintaxa CORECTA:\\n   - Se folosesc operatorii speciali IS NULL si IS NOT NULL.",
    codeSnippet: `-- GRESIT: Nu va returna NICIODATA nimic!
SELECT * FROM users WHERE phone = NULL; 

-- CORECT:
SELECT * FROM users WHERE phone IS NULL;
SELECT * FROM users WHERE phone IS NOT NULL;`,
    interviewTrap: "Expresia \"NULL = NULL\" este evaluata la UNKNOWN (fals in WHERE), nu la TRUE! Doua valori necunoscute nu pot fi considerate egale.",
    keyTakeaway: "In SQL comparatia cu NULL folosind = sau != returneaza UNKNOWN; se folosesc exclusiv operatorii IS NULL si IS NOT NULL."
  },
  {
    id: "sql-10",
    category: "SQL",
    difficulty: "USOR",
    title: "Functiile COALESCE() si NULLIF() in SQL",
    question: "Cum functioneaza functiile COALESCE() si NULLIF() si cand le folosim pentru a gestiona valorile NULL?",
    answer: "1. Functia COALESCE(val1, val2, val3, ...):\\n   - Returneaza PRIMA VALOARE NON-NULL din lista de argumente transmisa.\\n   - Daca toate argumentele sunt null, returneaza null.\\n   - Utilizare clasica: Furnizarea unei valori default cand o coloana este null (ex: COALESCE(phone, 'Fara telefon')).\\n\\n2. Functia NULLIF(a, b):\\n   - Compara doua valori: Daca a == b, returneaza NULL! Daca a != b, returneaza valoarea lui a.\\n   - Utilizare salvatoare (Prevenirea impartirii la zero - Division by Zero):\\n     - Expresia \"amount / NULLIF(total, 0)\" va transforma numitorul 0 in NULL, facand ca rezultatul impartirii sa devina NULL in loc sa crape intreaga interogare cu division by zero error!",
    codeSnippet: `-- 1. COALESCE pentru valori default:
SELECT name, COALESCE(phone, mobile, 'Indisponibil') AS contact_phone
FROM users;

-- 2. NULLIF pentru prevenirea Division by Zero:
SELECT total_sales / NULLIF(total_orders, 0) AS avg_sale
FROM sales_summary;`,
    interviewTrap: "Toate argumentele transmise catre COALESCE() trebuie sa aiba tipuri de date compatibile (nu poti pune un numar si un string decat daca faci cast).",
    keyTakeaway: "COALESCE returneaza prima valoare non-null (valori default); NULLIF returneaza null daca argumentele sunt egale (evita division by zero)."
  },
  {
    id: "sql-11",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Capcana operatorului NOT IN cu valori NULL",
    question: "De ce interogarea \"WHERE id NOT IN (SELECT parent_id FROM ...)\" returneaza 0 randuri daca subquery-ul contine un singur NULL?",
    answer: "Aceasta este una dintre cele mai periculoase capcane de SQL din interviuri!\\n\\n1. Cum evalueaza SQL operatorul NOT IN:\\n   - Expresia \"x NOT IN (1, 2, NULL)\" este tradusa intern ca: (x != 1) AND (x != 2) AND (x != NULL).\\n   - Am vazut ca orice comparatie cu NULL returneaza UNKNOWN: x != NULL -> UNKNOWN.\\n   - Conform logicii booleene: TRUE AND TRUE AND UNKNOWN -> UNKNOWN!\\n   - Rezultat: Intreaga conditie devine UNKNOWN pentru TOATE randurile din tabela, iar baza de date returneaza un set complet GOL (0 randuri), desi existau date valide!\\n\\n2. Solutia 1: Filtrarea de NULL in subquery (WHERE parent_id IS NOT NULL).\\n3. Solutia 2 (Recomandata): Folosirea operatorului NOT EXISTS (care este complet imun la valorile NULL).",
    codeSnippet: `-- GRESIT si PERICULOS (Returneaza 0 randuri daca exista vreun manager_id null):
SELECT * FROM employees 
WHERE id NOT IN (SELECT manager_id FROM employees);

-- CORECT cu NOT EXISTS (Sigur si rapid):
SELECT e.* FROM employees e
WHERE NOT EXISTS (
    SELECT 1 FROM employees m WHERE m.manager_id = e.id
);`,
    interviewTrap: "Daca intervievatorul te intreaba: \"Ce returneaza SELECT * FROM users WHERE id NOT IN (1, NULL)?\", raspunsul corect este: 0 randuri (intotdeauna multimea vida)!",
    keyTakeaway: "NOT IN cu un singur element NULL returneaza mereu multimea vida; foloseste intotdeauna NOT EXISTS pentru siguranta."
  },
  {
    id: "sql-12",
    category: "SQL",
    difficulty: "USOR",
    title: "Instructiunea CASE WHEN in SQL",
    question: "Cum folosim instructiunea CASE WHEN ... THEN ... ELSE ... END pentru logica conditionala in interogari SQL?",
    answer: "1. Ce este CASE WHEN:\\n   - Mecanismul nativ SQL pentru implementarea logicii if-else in cadrul clauzelor SELECT, WHERE, ORDER BY sau UPDATE.\\n\\n2. Cele doua forme de sintaxa:\\n   - Searched CASE (cea mai flexibila, cu conditii booleene):\\n     CASE WHEN score >= 90 THEN 'A' WHEN score >= 80 THEN 'B' ELSE 'C' END\\n   - Simple CASE (verificare directa de egalitate pe o valoare):\\n     CASE status WHEN 1 THEN 'Nou' WHEN 2 THEN 'In procesare' ELSE 'Finalizat' END\\n\\n3. Regula importanta:\\n   - Daca nicio conditie nu este adevarata si clauza ELSE lipseste, expresia returneaza NULL.",
    codeSnippet: `SELECT id, name, salary,
    CASE 
        WHEN salary >= 10000 THEN 'SENIOR'
        WHEN salary >= 5000 THEN 'MID'
        ELSE 'JUNIOR'
    END AS experience_level
FROM employees;

-- Utilizare in agregari conditionate (Pivot simplu):
SELECT 
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) AS completed_orders,
    COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) AS cancelled_orders
FROM orders;`,
    interviewTrap: "Nu uita cuvantul cheie END la finalul instructiunii CASE, altfel primesti syntax error.",
    keyTakeaway: "CASE WHEN aduce logica if-else in SQL, fiind ideal pentru categorisiri si agregari conditionate."
  },
  {
    id: "sql-13",
    category: "SQL",
    difficulty: "USOR",
    title: "COUNT(*) vs COUNT(coloana) vs COUNT(1)",
    question: "Care este diferenta dintre COUNT(*), COUNT(coloana) si COUNT(1) in SQL si cand rezultatele difera?",
    answer: "1. COUNT(*):\\n   - Numara TOATE randurile din tabela sau din grup, indiferent daca coloanele contin sau nu valori NULL.\\n   - Numara randul chiar daca toate campurile sale ar fi null.\\n\\n2. COUNT(coloana):\\n   - Numara DOAR randurile in care acea coloana particulara are o valoare NON-NULL!\\n   - Daca din 100 de randuri, coloana \"phone\" este null pentru 20 de randuri, COUNT(phone) va returna 80, in timp ce COUNT(*) va returna 100!\\n\\n3. COUNT(1):\\n   - Evalueaza expresia literala \"1\" pentru fiecare rand si numara rezultatele.\\n   - In toate motoarele moderne (PostgreSQL, MySQL, Oracle, SQL Server), COUNT(1) si COUNT(*) sunt optimizate EXACT IDENTIC sub capota si au EXACT aceeasi performanta!\\n\\n4. Recomandare:\\n   - Foloseste COUNT(*) conform standardului ANSI SQL pentru numararea randurilor.",
    codeSnippet: `-- Tabela cu 3 randuri: [id: 1, phone: '071'], [id: 2, phone: null], [id: 3, phone: null]

SELECT COUNT(*) FROM users;      -- Returneaza 3!
SELECT COUNT(1) FROM users;      -- Returneaza 3!
SELECT COUNT(phone) FROM users;  -- Returneaza 1! (ignora cele 2 null-uri)`,
    interviewTrap: "Mitul ca COUNT(1) ar fi mai rapid decat COUNT(*) este fals in bazele de date moderne; optimizatorul genereaza acelasi plan de executie.",
    keyTakeaway: "COUNT(*) si COUNT(1) numara toate randurile; COUNT(coloana) numara doar randurile unde coloana este non-null."
  },
  {
    id: "sql-14",
    category: "SQL",
    difficulty: "USOR",
    title: "SELECT DISTINCT vs GROUP BY in SQL",
    question: "Care este diferenta dintre SELECT DISTINCT si GROUP BY si cand trebuie preferat fiecare?",
    answer: "1. SELECT DISTINCT:\\n   - Se aplica pe INTREGUL rand de rezultate specificat in SELECT dupa ce acestea au fost generate.\\n   - Elimina duplicatele complete din setul final de rezultate prin sortare sau hash table.\\n   - Nu permite aplicarea de functii agregate (SUM, AVG) pe sub-grupuri.\\n\\n2. GROUP BY:\\n   - Grupeaza randurile pe baza coloanelor specificate pentru a putea calcula functii agregate (COUNT, SUM, MAX, MIN) pe fiecare grup in parte.\\n   - Daca nu folosesti functii agregate (ex: SELECT col FROM table GROUP BY col), comportamentul este similar cu DISTINCT, dar sintaxa este mai putin naturala.\\n\\n3. Recomandare:\\n   - Foloseste DISTINCT cand vrei doar valori unice dintr-o lista; foloseste GROUP BY cand vrei sa calculezi metrici si agregari.",
    codeSnippet: `-- 1. DISTINCT: doar lista de tari unice
SELECT DISTINCT country FROM customers;

-- 2. GROUP BY: calcul metrici per tara
SELECT country, COUNT(*) as total_customers, AVG(age) as avg_age
FROM customers
GROUP BY country;`,
    interviewTrap: "SELECT DISTINCT colA, colB elimina duplicatele combinative (colA + colB), NU doar duplicatele lui colA!",
    keyTakeaway: "DISTINCT elimina duplicatele din rezultatul final; GROUP BY imparte datele in grupuri pentru calcule agregate."
  },
  {
    id: "sql-15",
    category: "SQL",
    difficulty: "USOR",
    title: "Operatorii LIKE vs ILIKE si Wildcards (% si _)",
    question: "Ce fac caracterele wildcard % si _ in SQL si cum difera operatorul LIKE de ILIKE in PostgreSQL?",
    answer: "1. Caracterele Wildcard (Metacaractere):\\n   - % (Procent): Se potriveste cu ZERO, UNUL sau ORICATE caractere (ex: 'A%' inseamna incepe cu litera A).\\n   - _ (Underscore): Se potriveste cu EXACT UN SINGUR caracter oarecare (ex: 'B_t' se potriveste cu \"Bat\", \"Bit\", \"Bet\", dar nu cu \"Boat\").\\n\\n2. LIKE vs ILIKE:\\n   - LIKE: Este CASE-SENSITIVE conform standardului SQL ('ana' != 'Ana').\\n   - ILIKE: Este o extensie specifica PostgreSQL pentru cautare CASE-INSENSITIVE (ignora diferenta dintre litere mari si mici: 'ana' ILIKE 'ANA' este TRUE!).\\n   - In MySQL, colatiile implicite sunt de regula case-insensitive, deci LIKE se comporta adesea ca ILIKE.",
    codeSnippet: `-- Cautare case-insensitive in PostgreSQL:
SELECT * FROM users WHERE email ILIKE '%@gmail.com';

-- Cautare cod din 3 caractere incepand cu 'R':
SELECT * FROM products WHERE code LIKE 'R__';`,
    interviewTrap: "Daca ai nevoie sa cauti chiar caracterul fizic \"%\" sau \"_\" in text, trebuie sa il escapezi: LIKE '10\\%' ESCAPE '\\'.",
    keyTakeaway: "% potriveste oricate caractere; _ potriveste exact un caracter; ILIKE in PostgreSQL realizeaza cautari case-insensitive."
  },
  {
    id: "sql-16",
    category: "SQL",
    difficulty: "USOR",
    title: "Operatorul BETWEEN in SQL",
    question: "Este operatorul BETWEEN inclusiv sau exclusiv la capetele intervalului in SQL?",
    answer: "1. Regula standard:\\n   - Operatorul BETWEEN este STRICT INCLUSIV la AMBELE capete ale intervalului!\\n   - Expresia \"WHERE age BETWEEN 18 AND 65\" este echivalentul logic exact pentru: (age >= 18 AND age <= 65).\\n\\n2. Capcana cu Tipuri de Date TIMESTAMP:\\n   - Daca filtrezi o data de tip timestamp: \"WHERE created_at BETWEEN '2026-10-01' AND '2026-10-02'\":\\n   - Sirul '2026-10-02' este convertit implicit la miezul noptii: '2026-10-02 00:00:00'!\\n   - Tranzactiile create pe 2 octombrie la ora 14:00 vor fi EXCLUSE!\\n   - Pentru date cu ore, foloseste intotdeauna: WHERE created_at >= '2026-10-01' AND created_at < '2026-10-03'.",
    codeSnippet: `-- Corect pe numere si date pure (DATE):
SELECT * FROM employees WHERE salary BETWEEN 3000 AND 5000;

-- Atentie pe TIMESTAMP (recomandat comparatii explicite):
SELECT * FROM orders 
WHERE order_date >= '2026-10-01 00:00:00' 
  AND order_date <  '2026-10-03 00:00:00';`,
    interviewTrap: "Valoarea minima trebuie sa fie prima si cea maxima a doua: BETWEEN 50 AND 10 va returna mereu multimea vida!",
    keyTakeaway: "BETWEEN include ambele capete ale intervalului (>= si <=); pentru timestamp-uri se prefera comparatii semi-deschise."
  },
  {
    id: "sql-17",
    category: "SQL",
    difficulty: "USOR",
    title: "INNER JOIN in SQL",
    question: "Cum functioneaza un INNER JOIN si ce se intampla cu randurile care nu au pereche in cealalta tabela?",
    answer: "1. Ce este INNER JOIN:\\n   - Cel mai comun tip de alaturare intre tabele.\\n   - Returneaza DOAR randurile care au o potrivire (match) in AMBELE tabele pe baza conditiei specificate in clauza ON (intersectia multimilor).\\n\\n2. Ce se intampla cu randurile fara pereche:\\n   - Daca un utilizator nu are nicio comanda plasata, utilizatorul este ELIMINAT din rezultate.\\n   - Daca o comanda nu are un utilizator valid asociat (sau user_id este null), comanda este ELIMINATA din rezultate.",
    codeSnippet: `SELECT u.name, o.order_number, o.total_amount
FROM users u
INNER JOIN orders o ON u.id = o.user_id;`,
    interviewTrap: "Daca cuvantul INNER este omis si scrii simplu \"JOIN\", SQL executa automat un INNER JOIN (INNER este optiunea default).",
    keyTakeaway: "INNER JOIN returneaza doar randurile cu corespondenta in ambele tabele; randurile fara pereche sunt eliminate."
  },
  {
    id: "sql-18",
    category: "SQL",
    difficulty: "USOR",
    title: "LEFT (OUTER) JOIN in SQL",
    question: "Cum functioneaza un LEFT JOIN si ce valori apar pentru coloanele din dreapta cand nu exista potrivire?",
    answer: "1. Ce este LEFT JOIN:\\n   - Pastreaza TOATE randurile din tabela din STANGA (tabela declarata prima dupa FROM), indiferent daca au sau nu pereche in tabela din dreapta.\\n\\n2. Ce valori apar cand nu exista pereche:\\n   - Pentru randurile din stanga care NU au nicio corespondenta in tabela din dreapta, toate coloanele tabelei din dreapta vor fi completate cu NULL!\\n\\n3. Utilizare clasica:\\n   - Afisarea tuturor clientilor si a comenzilor lor, inclusiv a clientilor noi care nu au nicio comanda plasata.",
    codeSnippet: `SELECT u.id, u.name, o.order_number
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;
-- Utilizatorii fara comenzi vor aparea cu order_number = NULL`,
    interviewTrap: "Daca dupa un LEFT JOIN pui o conditie in WHERE pe tabela din dreapta (ex: WHERE o.status = 'PAID'), transformi accidental LEFT JOIN-ul intr-un INNER JOIN, deoarece conditia WHERE va elimina randurile cu NULL!",
    keyTakeaway: "LEFT JOIN pastreaza toate randurile din stanga si populeaza cu NULL coloanele din dreapta cand nu exista potriviri."
  },
  {
    id: "sql-19",
    category: "SQL",
    difficulty: "USOR",
    title: "RIGHT (OUTER) JOIN vs LEFT JOIN",
    question: "Care este diferenta dintre RIGHT JOIN si LEFT JOIN si de ce RIGHT JOIN este foarte rar folosit in practica?",
    answer: "1. Ce este RIGHT JOIN:\\n   - Este imaginea in oglinda a lui LEFT JOIN: pastreaza TOATE randurile din tabela din DREAPTA (tabela declarata dupa JOIN), populand cu NULL coloanele din stanga cand nu exista potriviri.\\n\\n2. De ce se evita RIGHT JOIN in practica:\\n   - Oamenii citesc codul de la stanga la dreapta. O interogare cu LEFT JOIN este mult mai naturala si mai intuitiva de urmarit mintal decat inversarea atentiei pe tabela din dreapta.\\n   - Orice RIGHT JOIN poate fi rescris instantaneu ca un LEFT JOIN prin simpla inversare a ordinii celor doua tabele (A RIGHT JOIN B este 100% identic cu B LEFT JOIN A).",
    codeSnippet: `-- RIGHT JOIN (mai putin lizibil):
SELECT u.name, o.id 
FROM orders o 
RIGHT JOIN users u ON o.user_id = u.id;

-- ECHIVALENTUL RECOMANDAT (cu LEFT JOIN):
SELECT u.name, o.id 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id;`,
    interviewTrap: "In echipe profesionale exista adesea reguli de stil care interzic complet RIGHT JOIN in favoarea lui LEFT JOIN pentru consistenta codului.",
    keyTakeaway: "RIGHT JOIN pastreaza toate randurile din dreapta; se prefera rescrierea lui ca LEFT JOIN pentru lizibilitate."
  },
  {
    id: "sql-20",
    category: "SQL",
    difficulty: "USOR",
    title: "FULL (OUTER) JOIN in SQL",
    question: "Ce returneaza un FULL OUTER JOIN si cand este util?",
    answer: "1. Ce este FULL OUTER JOIN:\\n   - Combina comportamentul lui LEFT JOIN cu cel al lui RIGHT JOIN.\\n   - Returneaza TOATE randurile din AMBELE tabele:\\n     - Randurile care au pereche sunt afisate unite pe aceeasi linie.\\n     - Randurile din stanga fara pereche au NULL pe coloanele din dreapta.\\n     - Randurile din dreapta fara pereche au NULL pe coloanele din stanga.\\n\\n2. Cand este util:\\n   - Reconciliere financiara si comparatie intre doua sisteme (ex: Tranzactii din aplicatie vs Tranzactii din extrasul bancar) pentru a identifica diferentele de ambele parti.",
    codeSnippet: `SELECT 
    COALESCE(app.id, bank.id) AS transaction_id,
    app.amount AS app_amount,
    bank.amount AS bank_amount
FROM app_transactions app
FULL OUTER JOIN bank_statements bank ON app.id = bank.id
WHERE app.id IS NULL OR bank.id IS NULL; -- Gaseste neconcordantele!`,
    interviewTrap: "Baza de date MySQL nu are suport nativ pentru comanda FULL JOIN! In MySQL trebuie simulat prin UNION intre un LEFT JOIN si un RIGHT JOIN.",
    keyTakeaway: "FULL OUTER JOIN returneaza toate randurile din ambele tabele, completand cu NULL partile care nu au corespondenta."
  },
  {
    id: "sql-21",
    category: "SQL",
    difficulty: "USOR",
    title: "CROSS JOIN (Produsul Cartezian) in SQL",
    question: "Ce este un CROSS JOIN si de ce poate fi extrem de periculos daca este apelat din greseala?",
    answer: "1. Ce este CROSS JOIN:\\n   - Produce Produsul Cartezian (Cartesian Product) intre doua tabele: fiecare rand din prima tabela este combinat cu FIECARE rand din a doua tabela.\\n   - Numarul total de randuri rezultate este inmultirea dimensiunilor: N x M (daca tabela A are 1.000 randuri si tabela B are 1.000 randuri, rezultatul va avea 1.000.000 randuri!).\\n   - Nu foloseste clauza ON.\\n\\n2. De ce este periculos:\\n   - Daca alaturi doua tabele de 100.000 de randuri din greseala prin omiterea clauzei ON dintr-un join vechi (\"FROM tableA, tableB\"), vei genera 10 miliarde de randuri, blocand complet memoria si procesorul serverului!",
    codeSnippet: `-- Exemplu util: Generarea tuturor combinatiilor marimi x culori:
SELECT s.size_name, c.color_name
FROM sizes s
CROSS JOIN colors c;`,
    interviewTrap: "Daca scrii stilul vechi \"FROM users, orders\" si uiti sa pui \"WHERE users.id = orders.user_id\", baza de date va executa un CROSS JOIN masiv neintentionat.",
    keyTakeaway: "CROSS JOIN genereaza produsul cartezian (N x M); foloseste-l doar intentionat pentru combinatii complete de atribute."
  },
  {
    id: "sql-22",
    category: "SQL",
    difficulty: "USOR",
    title: "SELF JOIN in SQL",
    question: "Ce este un SELF JOIN si cum se rezolva problema ierarhiilor (ex: Angajat -> Manager)?",
    answer: "1. Ce este un SELF JOIN:\\n   - O alaturare a unei tabele cu EA INSASI.\\n   - Din punct de vedere tehnic, foloseste un simplu INNER JOIN sau LEFT JOIN, dar tabela este inclusa de doua ori in interogare sub ALIAS-URI diferite (ex: e pentru angajat, m pentru manager).\\n\\n2. Scenariul clasic Angajat - Manager:\\n   - Tabela \"employees\" contine coloanele: id, name, manager_id (unde manager_id este tot un id din tabela employees).\\n   - Folosim LEFT JOIN pentru a nu-l exclude pe Directorul General (CEO-ul care nu are niciun manager si are manager_id = null).",
    codeSnippet: `SELECT 
    emp.name AS angajat,
    COALESCE(mgr.name, 'CEO (Fara manager)') AS manager
FROM employees emp
LEFT JOIN employees mgr ON emp.manager_id = mgr.id;`,
    interviewTrap: "Alias-urile diferite sunt OBLIGATORII la un SELF JOIN! Daca nu specifici alias-uri (FROM employees JOIN employees), baza de date va arunca eroare de ambiguitate de tabela.",
    keyTakeaway: "SELF JOIN alatura aceeasi tabela cu ea insasi folosind alias-uri diferite, fiind ideal pentru ierarhii si structuri parinte-copil."
  },
  {
    id: "sql-23",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Conditia in ON vs Conditia in WHERE la un LEFT JOIN",
    question: "Care este diferenta critica dintre plasarea unei conditii in clauza ON fata de clauza WHERE la un LEFT JOIN?",
    answer: "Aceasta este o intrebare clasica de interviu pentru nivel Mid!\\n\\n1. Conditia pusa in clauza ON (Face parte din definirea legaturii):\\n   - Filtreaza randurile tabelei din dreapta INAINTE de alaturare!\\n   - Tabela din stanga pastreaza in continuare TOATE randurile sale! Daca un rand din dreapta nu respecta conditia din ON, randul din stanga va aparea totusi in rezultat avand coloanele din dreapta ca NULL.\\n\\n2. Conditia pusa in clauza WHERE (Filtreaza rezultatul DUPA alaturare):\\n   - Filtreaza randurile DUPA ce alaturarea a fost deja realizata.\\n   - Daca pui \"WHERE o.status = 'PAID'\", randurile din stanga care aveau NULL pe comanda vor fi ELIMINATE din rezultatul final! Ai transformat practic LEFT JOIN-ul intr-un INNER JOIN.",
    codeSnippet: `-- Varianta 1 (Conditie in ON): Pastreaza TOTI utilizatorii!
SELECT u.name, o.id, o.status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'PAID';

-- Varianta 2 (Conditie in WHERE): Utilizatorii fara comenzi sunt ELIMINATI!
SELECT u.name, o.id, o.status
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.status = 'PAID'; -- Actioneaza ca un INNER JOIN!`,
    interviewTrap: "Daca vrei sa pastrezi toate randurile din stanga, conditiile suplimentare pe tabela din dreapta se pun obligatoriu in clauza ON, nu in WHERE!",
    keyTakeaway: "In LEFT JOIN, conditiile din ON afecteaza doar tabela din dreapta pastrand stanga intacta; conditiile din WHERE filtreaza setul final ca un INNER JOIN."
  },
  {
    id: "sql-24",
    category: "SQL",
    difficulty: "USOR",
    title: "Gasirea inregistrarilor orfane cu LEFT JOIN si IS NULL",
    question: "Cum gasim utilizatorii care nu au plasat nicio comanda folosind LEFT JOIN (Anti-Join)?",
    answer: "1. Mecanismul Anti-Join:\\n   - Se face un LEFT JOIN intre tabela parinte (users) si tabela copil (orders).\\n   - Pentru utilizatorii care nu au nicio comanda in tabela orders, cheia primara a comenzii va fi NULL.\\n   - Adaugand in clauza WHERE: \"WHERE o.id IS NULL\", pastram exact acele randuri orfane care nu au nicio legatura!",
    codeSnippet: `SELECT u.id, u.name, u.email
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.id IS NULL; -- Selecteaza doar userii fara comenzi!`,
    interviewTrap: "Verifica intotdeauna o coloana din dreapta care este garantat NOT NULL (cum ar fi cheia primara o.id). Daca verifici o coloana oarecare care permite null-uri in DB, poti primi rezultate false.",
    keyTakeaway: "LEFT JOIN combinat cu WHERE right_table.id IS NULL este un pattern rapid pentru gasirea inregistrarilor fara legaturi (Anti-Join)."
  },
  {
    id: "sql-25",
    category: "SQL",
    difficulty: "USOR",
    title: "Natural Join si riscurile sale in productie",
    question: "Ce este un NATURAL JOIN si de ce este considerat un mare risc sa il folosesti in aplicatii enterprise?",
    answer: "1. Ce este NATURAL JOIN:\\n   - O forma implicita de JOIN care alatura doua tabele pe baza TUTUROR coloanelor care au EXACT ACELASI NUME in ambele tabele, fara a mai fi nevoie sa specifici clauza ON.\\n\\n2. De ce este o practica FOARTE PERICULOASA in productie:\\n   - Fragil la modificari de schema: Daca maine un coleg adauga o coloana numita \"status\" sau \"created_at\" in ambele tabele, NATURAL JOIN va include automat acea coloana noua in conditia de join (ON a.id = b.id AND a.status = b.status)!\\n   - Interogarea va returna brusc date complet gresite sau 0 randuri, fara a arunca nicio eroare de sintaxa!",
    codeSnippet: `-- GRESIT si Fragil:
SELECT * FROM users NATURAL JOIN orders;

-- CORECT si Explicit:
SELECT * FROM users u 
INNER JOIN orders o ON u.id = o.user_id;`,
    interviewTrap: "Codul SQL de productie trebuie sa fie explicit. Evita NATURAL JOIN si specifica intotdeauna clauza ON cu coloanele dorite.",
    keyTakeaway: "NATURAL JOIN alatura automat pe toate coloanele cu nume comun; orice modificare de schema poate rupe interogarea pe neasteptate."
  },
  {
    id: "sql-26",
    category: "SQL",
    difficulty: "USOR",
    title: "Subqueries: Scalar, Row si Table Subquery",
    question: "Care sunt cele 3 tipuri de subquery-uri in SQL in functie de datele pe care le returneaza?",
    answer: "1. Scalar Subquery (Returneaza o singura valoare atomica):\\n   - Returneaza exact un singur rand si o singura coloana (1x1).\\n   - Poate fi folosit aproape oriunde este permisa o valoare literala (in SELECT, WHERE, HAVING).\\n   - Exemplu: WHERE salary > (SELECT AVG(salary) FROM employees).\\n\\n2. Row Subquery (Returneaza un singur rand cu mai multe coloane):\\n   - Returneaza un rand de forma (val1, val2).\\n   - Folosit in comparatii de tupluri: WHERE (country, city) = (SELECT country, city FROM offices WHERE id = 1).\\n\\n3. Table Subquery (Returneaza o tabela completa):\\n   - Returneaza multiple randuri si coloane.\\n   - Folosit in clauza FROM (Derived Table / Inline View) sau cu operatorii IN, ANY, ALL, EXISTS.",
    codeSnippet: `-- 1. Scalar subquery in SELECT:
SELECT name, salary, 
       (SELECT AVG(salary) FROM employees) AS comp_avg
FROM employees;

-- 2. Table subquery in FROM (necesita alias obligatoriu!):
SELECT dept_id, avg_sal
FROM (
    SELECT department_id as dept_id, AVG(salary) as avg_sal
    FROM employees GROUP BY department_id
) AS dept_summary;`,
    interviewTrap: "Daca un scalar subquery returneaza din greseala mai mult de un rand la runtime, baza de date va arunca eroarea: \"subquery must return only one column / more than one row returned\".",
    keyTakeaway: "Subquery-urile pot fi scalare (1 valoare), de rand (1 tuplu) sau de tabel (set intreg folosit in FROM sau IN)."
  },
  {
    id: "sql-27",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Subquery Corelat vs Subquery Ne-corelat",
    question: "Care este diferenta dintre un Subquery Corelat (Correlated) si unul Ne-corelat si care are performanta mai buna?",
    answer: "1. Subquery Ne-corelat (Uncorrelated Subquery):\\n   - Este complet independent de interogarea parinte (exterioara).\\n   - Baza de date il executa o SINGURA DATA la inceput, stocheaza rezultatul in memorie si apoi il foloseste pentru intreaga interogare parinte.\\n   - Este foarte rapid.\\n\\n2. Subquery Corelat (Correlated Subquery):\\n   - Depinde direct de valorile randului curent din interogarea parinte (face referire la un alias din exterior: e.department_id).\\n   - Baza de date este obligata (in absenta optimizarilor) sa re-execute subquery-ul PENTRU FIECARE RAND INDIVIDUAL din interogarea parinte (bucla N x M)!\\n   - Poate fi mult mai lent pe tabele mari daca nu exista indecsi adecvati.",
    codeSnippet: `-- 1. Ne-corelat (se executa o singura data):
SELECT * FROM employees 
WHERE salary > (SELECT AVG(salary) FROM employees);

-- 2. Corelat (se re-evalueaza pentru fiecare angajat 'e'):
SELECT * FROM employees e
WHERE salary > (
    SELECT AVG(sub.salary) 
    FROM employees sub 
    WHERE sub.department_id = e.department_id -- Referinta la exterior!
);`,
    interviewTrap: "Multe subquery-uri corelate pot fi rescrise mult mai performant folosind Window Functions sau JOIN-uri.",
    keyTakeaway: "Subquery-ul ne-corelat se evalueaza o singura data; cel corelat depinde de randul exterior si se poate re-executa pentru fiecare rand in parte."
  },
  {
    id: "sql-28",
    category: "SQL",
    difficulty: "USOR",
    title: "Operatorul EXISTS vs operatorul IN cu subquery-uri",
    question: "De ce este recomandat operatorul EXISTS in locul lui IN cand verificam existenta inregistrarilor?",
    answer: "1. Cum functioneaza EXISTS:\\n   - Functioneaza pe principiul Short-Circuit Evaluation: de indata ce gaseste PRIMUL rand potrivit in subquery, se opreste instantaneu si returneaza TRUE!\\n   - Nu citeste restul tabelei.\\n   - Conventie: se scrie SELECT 1 (ex: WHERE EXISTS (SELECT 1 FROM ...)).\\n   - Este 100% sigur in prezenta valorilor NULL.\\n\\n2. De ce IN poate fi mai lent:\\n   - Operatorul IN incarca intregul set de valori returnat de subquery in memorie inainte de a face verificarea.\\n   - Daca subquery-ul contine NULL-uri, NOT IN produce erori logice grave (returneaza multimea vida).",
    codeSnippet: `-- Recomandat si performant (Short-circuiting):
SELECT * FROM departments d
WHERE EXISTS (
    SELECT 1 FROM employees e 
    WHERE e.department_id = d.id AND e.salary > 10000
);`,
    interviewTrap: "In SELECT-ul din interiorul lui EXISTS poti pune SELECT 1, SELECT *, SELECT null; baza de date ignora complet ce coloane pui acolo, verificand doar daca exista macar un rand.",
    keyTakeaway: "EXISTS foloseste short-circuiting si se opreste la primul rand gasit, fiind rapid si imun la capcanele de NULL ale lui IN."
  },
  {
    id: "sql-29",
    category: "SQL",
    difficulty: "USOR",
    title: "Ce este un CTE (Common Table Expression / Clauza WITH)?",
    question: "Ce este un CTE in SQL, care este sintaxa sa si ce avantaje de lizibilitate are fata de subquery-urile imbricate?",
    answer: "1. Ce este un CTE (Common Table Expression):\\n   - Un set de rezultate temporar, numit si definit la inceputul unei interogari folosind clauza WITH.\\n   - Exista DOAR pe durata executiei acelei singure interogari SQL (nu este salvat pe disc).\\n\\n2. Avantaje cheie:\\n   - Lizibilitate superioara (Clean Code): Elimina \"spaghetele\" de subquery-uri imbricate pe 4 niveluri in clauza FROM.\\n   - Reutilizare in aceeasi interogare: Poti face referire la acelasi CTE de mai multe ori in aceeasi comanda SELECT fara a repeta codul SQL.\\n   - Modularitate: Poti defini mai multe CTE-uri separate prin virgula (WITH cte1 AS (...), cte2 AS (...)).",
    codeSnippet: `WITH HighEarningDepartments AS (
    SELECT department_id, AVG(salary) as avg_sal
    FROM employees
    GROUP BY department_id
    HAVING AVG(salary) > 8000
),
EmployeeCount AS (
    SELECT department_id, COUNT(*) as total_emps
    FROM employees
    GROUP BY department_id
)
SELECT d.name, h.avg_sal, c.total_emps
FROM departments d
JOIN HighEarningDepartments h ON d.id = h.department_id
JOIN EmployeeCount c ON d.id = c.department_id;`,
    interviewTrap: "In PostgreSQL 12+, CTE-urile sunt \"inlined\" automat de optimizator daca nu sunt recursive, avand aceeasi performanta ca subquery-urile.",
    keyTakeaway: "CTE-urile (clauza WITH) creeaza tabele temporare numite in memorie, transformand interogari complexe in etape clare si modulare."
  },
  {
    id: "sql-30",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Recursive CTE: Parcurgerea structurilor ierarhice (Arbori)",
    question: "Cum folosim un Recursive CTE (WITH RECURSIVE) pentru a parcurge o ierarhie parinte-copil (ex: categorii sau organigrama)?",
    answer: "1. Structura unui Recursive CTE:\\n   - Are doua parti unite obligatoriu prin UNION ALL:\\n     1. Anchor Member (Interogarea Ancora): Selecteaza nodul sau nodurile de plecare (radacina ierarhiei, ex: manager_id IS NULL sau id = 1).\\n     2. Recursive Member (Interogarea Recursiva): Se alatura cu rezultatul anterior al CTE-ului (cte) pentru a gasi copiii directi ai nodurilor curente.\\n   - Baza de date repeta pasul recursiv pana cand nu mai gaseste niciun rand nou (conditie de oprire implicita).\\n\\n2. Utilizare:\\n   - Arbore de categorii e-commerce, organigrame de angajati, retele de prieteni (Bill of Materials).",
    codeSnippet: `WITH RECURSIVE OrgChart AS (
    -- 1. Anchor member: gasim CEO-ul (fara manager)
    SELECT id, name, manager_id, 1 as level
    FROM employees
    WHERE manager_id IS NULL

    UNION ALL

    -- 2. Recursive member: gasim subalternii fiecarui nivel
    SELECT e.id, e.name, e.manager_id, o.level + 1
    FROM employees e
    INNER JOIN OrgChart o ON e.manager_id = o.id
)
SELECT * FROM OrgChart ORDER BY level, name;`,
    interviewTrap: "Daca ai un ciclu in date (A este managerul lui B, iar B este managerul lui A), un Recursive CTE va intra intr-o bucla infinita! In Postgres 14+ poti folosi clauza CYCLE pentru protectie.",
    keyTakeaway: "WITH RECURSIVE imbina o interogare ancora cu una recursiva prin UNION ALL pentru a parcurge ierarhii parinte-copil la orice adancime."
  },
  {
    id: "sql-31",
    category: "SQL",
    difficulty: "USOR",
    title: "UNION vs UNION ALL in SQL",
    question: "Care este diferenta dintre UNION si UNION ALL si de ce UNION ALL este mult mai rapid?",
    answer: "1. UNION ALL (Concatenare Pura):\\n   - Combina pur si simplu rezultatele a doua interogari una sub alta.\\n   - PASTREAZA toate duplicatele.\\n   - Este ULTRA-RAPID, deoarece baza de date nu trebuie sa inspecteze datele sau sa faca sortari.\\n\\n2. UNION (Combinare cu Eliminare de Duplicate):\\n   - Combina rezultatele si ELIMINA automat toate randurile duplicate.\\n   - COST DE PERFORMANTA: Pentru a elimina duplicatele, baza de date este obligata sa sorteze intregul set de date combinat sau sa construiasca o tabela mare de Hash in memorie/pe disc!\\n\\n3. Regula de Aur:\\n   - Foloseste intotdeauna UNION ALL, cu exceptia cazului in care ai nevoie explicita de eliminarea duplicatelor.",
    codeSnippet: `-- 1. UNION ALL: Rapid, pastreaza duplicatele
SELECT email FROM customers
UNION ALL
SELECT email FROM suppliers;

-- 2. UNION: Lent pe date mari (ruleaza sortare interna pentru duplicate)
SELECT city FROM customers
UNION
SELECT city FROM suppliers;`,
    interviewTrap: "Ambele interogari din UNION trebuie sa aiba exact acelasi numar de coloane si tipuri de date compatibile in aceeasi ordine.",
    keyTakeaway: "UNION ALL doar concateneaza rezultatele si este foarte rapid; UNION elimina duplicatele printr-o sortare costisitoare."
  },
  {
    id: "sql-32",
    category: "SQL",
    difficulty: "USOR",
    title: "Operatorii de multimi INTERSECT si EXCEPT / MINUS",
    question: "Ce fac operatorii INTERSECT si EXCEPT (sau MINUS) in SQL si cum manipuleaza multimile de date?",
    answer: "1. INTERSECT (Intersectia a doua multimi):\\n   - Returneaza doar randurile care EXISTA IN AMBELE interogari.\\n   - Elimina duplicatele.\\n   - Exemplu: Clientii care sunt in acelasi timp si furnizori ai companiei.\\n\\n2. EXCEPT (in PostgreSQL/SQLite) sau MINUS (in Oracle):\\n   - Returneaza randurile din prima interogare care NU EXISTA in a doua interogare (diferenta de multimi: A - B).\\n   - Exemplu: Produse care au fost comandate anul trecut, dar nu au fost comandate deloc anul acesta.",
    codeSnippet: `-- 1. INTERSECT: Email-uri comune
SELECT email FROM clients
INTERSECT
SELECT email FROM newsletter_subscribers;

-- 2. EXCEPT (A minus B): Clienti care nu s-au abonat la newsletter
SELECT email FROM clients
EXCEPT
SELECT email FROM newsletter_subscribers;`,
    interviewTrap: "Ordinea conteaza la EXCEPT: A EXCEPT B returneaza elementele din A care nu sunt in B; B EXCEPT A returneaza elementele din B care nu sunt in A.",
    keyTakeaway: "INTERSECT returneaza randurile comune ambelor interogari; EXCEPT returneaza randurile din prima multime care lipsesc din a doua."
  },
  {
    id: "sql-33",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Ce sunt Functiile Fereastra (Window Functions) in SQL?",
    question: "Ce este o Window Function in SQL si care este diferenta fundamentala fata de un GROUP BY?",
    answer: "1. Problema cu GROUP BY:\\n   - GROUP BY \"prabuseste\" (collapse) toate randurile individuale ale unui grup intr-un singur rand rezumat. Dupa GROUP BY, pierzi accesul la datele individuale ale fiecarui rand!\\n\\n2. Ce este o Window Function (Clauza OVER):\\n   - Executa calcule agregate sau de pozitie peste o \"fereastra\" de randuri asociate randului curent, DAR PASTREAZA FIECARE RAND INDIVIDUAL INTACT in rezultatul final!\\n   - Numarul de randuri din rezultat NU se reduce niciodata!\\n   - Poti afisa simultan salariul fiecarui angajat alaturi de salariul mediu al departamentului sau pe aceeasi linie!",
    codeSnippet: `-- Cu Window Function: pastram toti angajatii si afisam media departamentului!
SELECT 
    name, 
    department_id, 
    salary,
    AVG(salary) OVER (PARTITION BY department_id) as dept_avg_salary,
    salary - AVG(salary) OVER (PARTITION BY department_id) as diff_from_avg
FROM employees;`,
    interviewTrap: "Window functions se pot folosi DOAR in clauza SELECT sau ORDER BY; NU se pot pune direct in clauza WHERE!",
    keyTakeaway: "GROUP BY comprima randurile intr-un singur rand per grup; Window Functions calculeaza valori agregate pastrand fiecare rand individual."
  },
  {
    id: "sql-34",
    category: "SQL",
    difficulty: "MEDIU",
    title: "ROW_NUMBER() vs RANK() vs DENSE_RANK()",
    question: "Care este diferenta dintre ROW_NUMBER(), RANK() si DENSE_RANK() cand doua randuri au valori egale?",
    answer: "Aceasta este una dintre cele mai frecvente intrebari practice de interviu SQL!\\n\\nPresupunem 4 salarii sortate descrescator: [1000, 800, 800, 500]. Cum le numeroteaza fiecare:\\n\\n1. ROW_NUMBER():\\n   - Numerotare secventiala stricta si unica (fara egalitati): 1, 2, 3, 4.\\n   - Daca doua valori sunt egale, le atribuie numere arbitrare consecutive.\\n\\n2. RANK():\\n   - Atribuie acelasi rang valorilor egale, dar SARE peste numerele urmatoare (lasa goluri/gaps): 1, 2, 2, 4! (A sarit peste rangul 3).\\n\\n3. DENSE_RANK():\\n   - Atribuie acelasi rang valorilor egale, dar NU SARE peste niciun numar (fara goluri/dense): 1, 2, 2, 3!\\n   - Este functia standard ideala cand vrei \"al doilea cel mai mare salariu\", deoarece rangul 2 reprezinta cu certitudine a doua valoare distincta!",
    codeSnippet: `SELECT name, salary,
    ROW_NUMBER() OVER (ORDER BY salary DESC) as row_num,  -- 1, 2, 3, 4
    RANK()       OVER (ORDER BY salary DESC) as rnk,      -- 1, 2, 2, 4
    DENSE_RANK() OVER (ORDER BY salary DESC) as dense_rnk -- 1, 2, 2, 3
FROM employees;`,
    interviewTrap: "Daca folosesti RANK() pentru a gasi al 2-lea salariu si exista doi oameni pe locul 1 cu acelasi salariu, urmatorul va primi rangul 3, iar rangul 2 nu va exista deloc!",
    keyTakeaway: "ROW_NUMBER da numere unice (1,2,3,4); RANK lasa goluri la egalitati (1,2,2,4); DENSE_RANK nu lasa goluri (1,2,2,3)."
  },
  {
    id: "sql-35",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Cum gasesti al N-lea cel mai mare salariu (Nth Highest Salary)",
    question: "Cum scrii o interogare SQL robusta pentru a gasi al doilea (sau al N-lea) cel mai mare salariu dintr-o tabela?",
    answer: "Exista doua moduri standard de a rezolva aceasta problema clasica de interviu:\\n\\n1. Metoda moderna cu DENSE_RANK() si CTE (Cea mai curata si extensibila):\\n   - Calculam DENSE_RANK() descrescator pe baza salariului intr-un CTE.\\n   - In interogarea principala filtram: WHERE rnk = N (ex: rnk = 2).\\n   - DENSE_RANK garanteaza ca duplicatul primului salariu nu strica pozitia celui de-al doilea!\\n\\n2. Metoda cu DISTINCT si LIMIT / OFFSET (simpla dar mai putin flexibila pe grupuri):\\n   - SELECT DISTINCT salary FROM employees ORDER BY salary DESC LIMIT 1 OFFSET (N - 1).",
    codeSnippet: `-- Solutia eleganta cu CTE si DENSE_RANK():
WITH RankedSalaries AS (
    SELECT name, salary,
           DENSE_RANK() OVER (ORDER BY salary DESC) as rnk
    FROM employees
)
SELECT salary 
FROM RankedSalaries 
WHERE rnk = 2; -- Schimba cu N pentru al N-lea salariu!`,
    interviewTrap: "Daca folosesti ORDER BY salary DESC LIMIT 1 OFFSET 1 FARA DISTINCT, si exista 2 angajati cu salariul maxim de 10.000, interogarea iti va returna tot 10.000!",
    keyTakeaway: "Folosirea DENSE_RANK() intr-un CTE este solutia standard si robusta pentru determinarea celui de-al N-lea rang dintr-un set de date."
  },
  {
    id: "sql-36",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Functiile LEAD() si LAG() in SQL",
    question: "Ce fac functiile LEAD() si LAG() si cum compari valoarea randului curent cu randul anterior fara a face Self Join?",
    answer: "1. Ce fac LEAD() si LAG():\\n   - Sunt functii fereastra analitice care permit accesarea datelor dintr-un alt rand la o distanta fizica specificata fata de randul curent, FARA a face un self-join costisitor!\\n\\n2. LAG(coloana, offset, defaultVal):\\n   - \"Priveste in urma\" (Looking back): extrage valoarea de pe randul anterior (offset = 1 default).\\n   - Utilizare clasica: Calculul cresterii procentuale a vanzarilor de la o luna la alta (Month-over-Month growth).\\n\\n3. LEAD(coloana, offset, defaultVal):\\n   - \"Priveste inainte\" (Looking forward): extrage valoarea de pe randul urmator.",
    codeSnippet: `SELECT 
    month, 
    revenue,
    LAG(revenue, 1, 0) OVER (ORDER BY month) as prev_month_revenue,
    revenue - LAG(revenue, 1, 0) OVER (ORDER BY month) as monthly_diff
FROM monthly_sales;`,
    interviewTrap: "Pentru primul rand, LAG() va returna NULL daca nu specifici al 3-lea argument de valoare implicita (ex: LAG(val, 1, 0)).",
    keyTakeaway: "LAG citeste valori de pe randurile anterioare; LEAD citeste de pe randurile urmatoare, ideale pentru comparatii temporale."
  },
  {
    id: "sql-37",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Calculul totalului cumulativ (Running Total)",
    question: "Cum calculezi un total cumulativ (Running Total / Cumulative Sum) folosind SUM() si clasa OVER()?",
    answer: "1. Ce este un Running Total:\\n   - Un total care aduna succesiv valorile randurilor precedente la valoarea randului curent pe masura ce avansezi in timp (ex: soldul zilnic al unui cont bancar).\\n\\n2. Sintaxa cu Window Function:\\n   - SUM(amount) OVER (ORDER BY transaction_date ASC)\\n   - Clauza ORDER BY din interiorul lui OVER schimba comportamentul implicit al lui SUM: in loc sa adune toata tabela, aduna de la inceputul ferestrei pana la randul curent (ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)!\\n   - Poti reseta totalul cumulativ per client adaugand PARTITION BY user_id.",
    codeSnippet: `SELECT 
    transaction_date,
    amount,
    SUM(amount) OVER (
        PARTITION BY account_id 
        ORDER BY transaction_date ASC
    ) as running_balance
FROM bank_transactions;`,
    interviewTrap: "Daca omiti ORDER BY din OVER (adica scrii SUM(amount) OVER ()), vei primi suma totala a intregii tabele repetata pe fiecare rand, nu totalul cumulativ!",
    keyTakeaway: "SUM(col) OVER (ORDER BY date) calculeaza automat totalul cumulativ rand cu rand."
  },
  {
    id: "sql-38",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Functiile FIRST_VALUE() si LAST_VALUE()",
    question: "Ce fac functiile FIRST_VALUE() si LAST_VALUE() si care este capcana implicita a ferestrei de calcul la LAST_VALUE?",
    answer: "1. FIRST_VALUE(col) OVER (...):\\n   - Returneaza prima valoare din cadrul ferestrei definite conform clauzei ORDER BY (ex: cel mai mic pret sau prima comanda a clientului).\\n\\n2. Capcana majora la LAST_VALUE() (Intrebare cheie de interviu!):\\n   - Cand adaugi ORDER BY in clauza OVER, specificatia implicita a ferestrei devine: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW!\\n   - Din aceasta cauza, LAST_VALUE() va returna valoarea RANDULUI CURENT, nu valoarea ultimului rand din intregul grup!\\n   - Cum se repara: Trebuie sa specifici explicit cadrul complet de fereastra: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.",
    codeSnippet: `-- Corect pentru gasirea ultimei valori din grup:
SELECT employee_id, department_id, salary,
    LAST_VALUE(salary) OVER (
        PARTITION BY department_id
        ORDER BY salary ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING -- CRITIC!
    ) as max_dept_salary
FROM employees;`,
    interviewTrap: "Daca folosesti LAST_VALUE fara \"ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING\", functia se opreste la randul curent si nu returneaza adevarata ultima valoare.",
    keyTakeaway: "LAST_VALUE() necesita specificarea explicita a cadrului UNBOUNDED FOLLOWING pentru a vedea cu adevarat ultimul element din partitie."
  },
  {
    id: "sql-39",
    category: "SQL",
    difficulty: "USOR",
    title: "PARTITION BY vs ORDER BY in clauza OVER()",
    question: "Ce rol are PARTITION BY si ce rol are ORDER BY in interiorul clauzei OVER a unei Window Function?",
    answer: "Clauza OVER() defineste cadrul de actiune (\"fereastra\") a functiei analitice:\\n\\n1. PARTITION BY coloana:\\n   - Imparte datele in grupuri/sub-ferestre logice independente (similar cu GROUP BY, dar fara sa reduca randurile).\\n   - Calculele se reseteaza la 0 cand se trece la o noua partitie (ex: numerotarea incepe din nou de la 1 pentru fiecare departament).\\n   - Daca este omis, toata tabela este tratata ca o singura partitie gigant.\\n\\n2. ORDER BY coloana:\\n   - Stabileste ordinea logica in care randurile sunt procesate in interiorul partitiei.\\n   - Este obligatoriu pentru functii de pozitie (ROW_NUMBER, RANK, LEAD, LAG) si determina directia totalurilor cumulative.",
    codeSnippet: `-- Numerotam produsele de la 1 la N in interiorul fiecarei categorii separat:
SELECT 
    category_id, 
    name, 
    price,
    ROW_NUMBER() OVER (
        PARTITION BY category_id 
        ORDER BY price DESC
    ) as rank_in_category
FROM products;`,
    interviewTrap: "ORDER BY din interiorul lui OVER(...) afecteaza doar calculul ferestrei; nu garanteaza ordinea finala a randurilor din SELECT (pentru asta trebuie sa pui un ORDER BY si la finalul comenzii).",
    keyTakeaway: "PARTITION BY imparte setul de date in ferestre independente; ORDER BY ordoneaza randurile in interiorul fiecarei ferestre."
  },
  {
    id: "sql-40",
    category: "SQL",
    difficulty: "USOR",
    title: "De ce SELECT * este un Anti-pattern in codul de productie?",
    question: "Care sunt cele 4 motive tehnice pentru care comanda \"SELECT *\" trebuie evitata in aplicatiile enterprise?",
    answer: "1. I/O si Retea Irosite:\\n   - Transfera coloane mari (TEXT, BLOB, JSONB, bytea) de care aplicatia nu are nevoie, saturand latimea de banda a retelei si incarcand memoria RAM.\\n\\n2. Distruge optimizarea \"Index-Only Scan\":\\n   - Daca ai un index pe (name, email) si ceri doar SELECT name, email, baza de date citeste datele direct din index (in RAM). Daca pui SELECT *, este fortata sa citeasca tabela fizica de pe disc (Heap Fetch / Table Access By Index RowID)!\\n\\n3. Fragilitate la modificari de schema (Breaking API Contract):\\n   - Daca cineva adauga o coloana noua in DB, aplicatia poate primi date neasteptate sau maparile JDBC pe indici de coloana crapa.\\n\\n4. Securitate: Poti scurge campuri confidentiale (parole, CNP) in loguri sau catre frontend.",
    codeSnippet: `-- GRESIT in cod de backend:
SELECT * FROM users WHERE id = 1;

-- CORECT: Doar coloanele strict necesare:
SELECT id, username, email FROM users WHERE id = 1;`,
    interviewTrap: "Singurul loc unde SELECT * este acceptabil este in clauza subquery-ului EXISTS (SELECT 1 vs SELECT *), deoarece optimizatorul ignora coloanele acolo.",
    keyTakeaway: "SELECT * consuma memorie si I/O inutil, anuleaza Index-Only Scans si risca sa expuna date confidentiale."
  },
  {
    id: "sql-41",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Clustered Index vs Non-Clustered Index",
    question: "Cum difera fizic pe disc un Clustered Index de un Non-Clustered Index si cate Clustered Indexes pot exista per tabela?",
    answer: "1. Clustered Index (Index Grupat):\\n   - Defineste ordinea FIZICA efectiva in care randurile sunt stocate pe paginile de disc!\\n   - Nodurile frunza ale indexului contin RANDUL INTREG DE DATE, nu doar un pointer.\\n   - Poate exista UN SINGUR Clustered Index per tabela (deoarece datele fizice pot fi sortate pe disc intr-o singura ordine!).\\n   - In MySQL InnoDB, Cheia Primara (Primary Key) este intotdeauna Clustered Index.\\n\\n2. Non-Clustered Index (Index Secundar):\\n   - Este o structura separata salvata intr-un alt fisier pe disc.\\n   - Nodurile frunza contin valoarea cheii indexate si un POINTER catre locatia randului fizic (TID in Postgres sau Cheia Primara in MySQL).\\n   - Poti avea oricati indecsi non-clustered pe o tabela.",
    codeSnippet: `-- In PostgreSQL, tabelele sunt stocate ca Heap (nesortate fizic).
-- Poti reorganiza fizic o tabela dupa un index folosind comanda CLUSTER (dar nu se mentine automat la noi inserari):
CLUSTER users USING idx_users_created_at;`,
    interviewTrap: "O tabela poate avea o singura ordine fizica de sortare a datelor pe disc, de aceea nu poate exista mai mult de un Clustered Index per tabela.",
    keyTakeaway: "Clustered Index determina ordinea fizica a randurilor pe disc (maxim 1 per tabela); Non-Clustered este o structura separata cu pointeri."
  },
  {
    id: "sql-42",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Partial Index (Filtered Index) in PostgreSQL",
    question: "Ce este un Partial Index si cum economiseste spatiu si creste viteza fata de un index clasic?",
    answer: "1. Ce este un Partial Index:\\n   - Un index care contine intrari DOAR pentru randurile care respecta o clauza WHERE specificata la crearea sa (ex: CREATE INDEX ... WHERE active = true).\\n\\n2. Avantaje masive de performanta:\\n   - Dimensiune minuscula pe disc: Daca din 10.000.000 de comenzi, doar 5.000 sunt \"PENDING\", un index partial pe status = 'PENDING' va avea cativa KB in loc de sute de MB!\\n   - Inserarile pe celelalte statusuri nu sunt penalizate (indexul nu este atins la salvarea comenzilor normale).\\n   - Ramane permanent in cache-ul RAM al bazei de date.",
    codeSnippet: `-- Index creat doar pentru comenzile active neprocesate:
CREATE INDEX idx_orders_unprocessed 
ON orders (created_at) 
WHERE status = 'PENDING';

-- Aceasta interogare va folosi indexul partial:
SELECT * FROM orders 
WHERE status = 'PENDING' 
ORDER BY created_at ASC;`,
    interviewTrap: "Daca interogarea ta din aplicatie nu include exact conditia din clauza WHERE a indexului partial (sau o conditie compatibila), motorul nu va folosi indexul partial!",
    keyTakeaway: "Indexul partial indexeaza doar un subset de date filtrat cu WHERE, economisind spatiu pe disc si accelerand SELECT-urile specifice."
  },
  {
    id: "sql-43",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Expression Index (Functional Index) in SQL",
    question: "Cum cream un Expression Index si ce problema rezolva cand cautam dupa functii ca LOWER(email)?",
    answer: "1. Problema:\\n   - Daca ai un index normal pe coloana email: CREATE INDEX idx ON users (email);\\n   - Cand un client cauta case-insensitive: WHERE LOWER(email) = 'test@test.com', motorul bazei de date NU POATE folosi indexul clasic si face Sequential Scan pe toata tabela! Deoarece indexul contine valorile brute, nu valorile cu litere mici.\\n\\n2. Solutia: Expression Index (Index pe Expresie):\\n   - Baza de date calculeaza si stocheaza direct rezultatul functiei in nodurile arborelui B-Tree!\\n   - Sintaxa: CREATE INDEX idx_users_lower_email ON users (LOWER(email));\\n   - Orice interogare care foloseste WHERE LOWER(email) = ... va folosi instantaneu indexul.",
    codeSnippet: `-- Creare index functional pe expresie:
CREATE INDEX idx_users_lower_email ON users (LOWER(email));

-- Aceasta interogare foloseste Index Scan direct:
SELECT * FROM users WHERE LOWER(email) = 'ion@exemplu.ro';`,
    interviewTrap: "Expresia din clauza WHERE trebuie sa fie scrisa EXACT la fel ca expresia definita in index pentru a fi detectata de optimizator.",
    keyTakeaway: "Expression Index stocheaza rezultatul pre-calculat al unei functii in arborele de index, permitand cautari rapide pe LOWER() sau calcule."
  },
  {
    id: "sql-44",
    category: "SQL",
    difficulty: "MEDIU",
    title: "De ce functiile pe coloane dezactiveaza indexul B-Tree",
    question: "De ce interogari precum \"WHERE YEAR(created_at) = 2026\" sau \"WHERE salary * 12 > 50000\" anuleaza utilizarea indexului?",
    answer: "1. Cauza tehnica:\\n   - Indexul B-Tree pastreaza valorile coloanei nemodificate, ordonate intr-un arbore binar/echilibrat.\\n   - Cand aplici o functie pe coloana (ex: YEAR(created_at) sau UPPER(name)), baza de date nu stie ce valoare rezulta din functie pentru fiecare nod fara sa o calculeze pentru fiecare rand in parte!\\n   - Motorul este fortat sa abandoneze indexul si sa faca Full Table Scan (Sequential Scan).\\n\\n2. Cum se rescrie corect:\\n   - Pastreaza COLOANA CURATA pe o parte a operatorului si muta calculul pe partea cu valoarea constanta (Sargable Queries - Search Argument Able)!",
    codeSnippet: `-- INEFICIENT (Nu foloseste indexul pe created_at):
SELECT * FROM orders WHERE EXTRACT(YEAR FROM created_at) = 2026;

-- CORECT si SARGABLE (Foloseste indexul B-Tree direct pe interval):
SELECT * FROM orders 
WHERE created_at >= '2026-01-01' AND created_at < '2027-01-01';

-- INEFICIENT: WHERE salary * 12 > 60000
-- CORECT:     WHERE salary > 60000 / 12`,
    interviewTrap: "Termenul \"SARGable\" (Search Argument Able) este un cuvant cheie iubit de intervievatori. Arata ca stii sa scrii conditii care permit utilizarea indexului.",
    keyTakeaway: "Functiile aplicate pe coloane in WHERE dezactiveaza indecsii; rescrie interogarile sargable pastrand coloana izolata fara functii."
  },
  {
    id: "sql-45",
    category: "SQL",
    difficulty: "USOR",
    title: "De ce LIKE '%abc' nu poate folosi index B-Tree, dar LIKE 'abc%' poate?",
    question: "De ce o cautare dupa sufix (LIKE '%text') face Full Table Scan, in timp ce o cautare dupa prefix (LIKE 'text%') foloseste indexul?",
    answer: "1. Analogia cu Dictionarul (Carte de Telefon):\\n   - Gandeste-te la un index B-Tree ca la o carte de telefon fizica, unde toate numele sunt ordonate alfabetic de la A la Z.\\n   - Daca cineva iti cere: \"Gaseste-mi toate persoanele al caror nume incepe cu 'Pop' (LIKE 'Pop%')\", poti sari instantaneu la litera P si citi toate numele in cateva secunde (Index Range Scan).\\n   - Daca cineva iti cere: \"Gaseste-mi toate persoanele al caror nume se termina cu 'escu' (LIKE '%escu')\", ordinea alfabetica a dictionarului nu te ajuta deloc! Esti obligat sa citesti toata cartea de la prima pana la ultima pagina (Full Table Scan).\\n\\n2. Solutii pentru cautari pe sufix sau wildcard la mijloc:\\n   - Index pe sir inversat: REVERSE(col) pentru sufixe.\\n   - Indecsi Trigram (pg_trgm cu GIN/GiST in PostgreSQL) pentru LIKE '%text%'.",
    codeSnippet: `-- Foloseste Index Range Scan (rapid):
SELECT * FROM users WHERE last_name LIKE 'Pop%';

-- Face Full Table Scan (lent, nu poate naviga in B-Tree):
SELECT * FROM users WHERE last_name LIKE '%escu';`,
    interviewTrap: "Pentru cautari arbitrare de text cu wildcard la ambele capete (LIKE '%java%'), un index B-Tree este complet inutil; ai nevoie de un index GIN cu extensia pg_trgm in PostgreSQL.",
    keyTakeaway: "LIKE 'prefix%' foloseste indexul B-Tree exact ca un dictionar ordonat; wildcard-ul la inceput (%sufix) anuleaza indexul B-Tree."
  },
  {
    id: "sql-46",
    category: "SQL",
    difficulty: "MEDIU",
    title: "EXPLAIN vs EXPLAIN ANALYZE in PostgreSQL",
    question: "Care este diferenta cruciala dintre EXPLAIN si EXPLAIN ANALYZE cand inspectam o interogare?",
    answer: "1. EXPLAIN simplu:\\n   - Afiseaza doar PLANUL ESTIMAT de executie generat de optimizatorul bazei de date (Query Planner), pe baza statisticilor colectate.\\n   - Baza de date NU EXECUTA efectiv interogarea!\\n   - Costurile si numarul de randuri (cost=... rows=...) sunt doar aproximari teoretice.\\n\\n2. EXPLAIN ANALYZE:\\n   - Baza de date EXECUTA EFECTIV interogarea pe disc!\\n   - Afiseaza atat estimarile teoretice, cat si TIMPUL REAL DE EXECUTIE (actual time=... rows=... loops=...).\\n   - Permite identificarea discrepantelor uriase intre ce a crezut optimizatorul si ce s-a intamplat in realitate (semn ca statisticile sunt invechite).\\n\\n3. AVERTISMENT CRITIC DE SECURITATE:\\n   - Daca rulezi EXPLAIN ANALYZE pe o comanda DELETE sau UPDATE, comanda SE VA EXECUTA REAL in baza de date si iti va sterge/modifica datele!",
    codeSnippet: `-- Sigur de rulat in productie (doar estimari, nu executa):
EXPLAIN SELECT * FROM orders WHERE total > 1000;

-- Executa real (afiseaza timpii reali in milisecunde):
EXPLAIN ANALYZE SELECT * FROM orders WHERE total > 1000;

-- ATENTIE: Ruleaza intr-o tranzactie cu ROLLBACK daca folosesti pe DELETE/UPDATE!
BEGIN;
EXPLAIN ANALYZE DELETE FROM logs WHERE created_at < '2020-01-01';
ROLLBACK;`,
    interviewTrap: "Nu rula niciodata EXPLAIN ANALYZE pe o comanda de scriere (DELETE/UPDATE) in productie fara sa o pui intr-un bloc de tranzactie cu ROLLBACK!",
    keyTakeaway: "EXPLAIN arata planul estimat fara rulare; EXPLAIN ANALYZE executa fizic interogarea si raporteaza timpii reali de rulare."
  },
  {
    id: "sql-47",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Ce este un Index Only Scan in PostgreSQL?",
    question: "Ce este un Index Only Scan si de ce este cel mai rapid mod de executie a unei interogari?",
    answer: "1. Ce este Index Only Scan:\\n   - O optimizare majora in care TOATE coloanele cerute in clauzele SELECT, WHERE si ORDER BY exista deja in interiorul indexului!\\n   - Baza de date NU mai trebuie sa atinga deloc tabela fizica de pe disc (Heap Table / Table Fetch)! Citeste rezultatul direct din memoria RAM a indexului.\\n\\n2. Rolul lui Visibility Map in PostgreSQL:\\n   - In Postgres (datorita MVCC), nodurile de index nu contin informatii de vizibilitate a tranzactiilor.\\n   - Postgres consulta un mic bitfield numit Visibility Map (VM). Daca pagina este marcata \"all-visible\", stie ca nu s-au facut modificari necomise si nu mai acceseaza deloc paginile fizice ale tabelei!\\n\\n3. Cum il obtinem:\\n   - Prin crearea de Covering Indexes (adaugarea de coloane suplimentare in index cu clauza INCLUDE: CREATE INDEX idx ON t (a) INCLUDE (b)).",
    codeSnippet: `-- Covering Index:
CREATE INDEX idx_users_covering ON users (status) INCLUDE (email, name);

-- Aceasta interogare va rula ca INDEX ONLY SCAN (zero acces pe tabela de pe disc!):
SELECT email, name FROM users WHERE status = 'ACTIVE';`,
    interviewTrap: "Daca adaugi o singura coloana in SELECT care nu este in index (sau SELECT *), Index Only Scan este anulat si devine un Index Scan obisnuit cu salturi pe disc.",
    keyTakeaway: "Index Only Scan citeste datele exclusiv din index fara a atinge tabela fizica de pe disc, oferind viteza maxima posibila."
  },
  {
    id: "sql-48",
    category: "SQL",
    difficulty: "USOR",
    title: "Primary Key vs Unique Constraint in SQL",
    question: "Care sunt cele 3 diferente principale dintre o Cheie Primara (Primary Key) si o Constrangere Unica (Unique Constraint)?",
    answer: "1. Numarul maxim per tabela:\\n   - O tabela poate avea O SINGURA Cheie Primara (Primary Key).\\n   - O tabela poate avea ORICATE constrangeri UNIQUE (Unique Constraints) pe diferite coloane sau combinatii de coloane.\\n\\n2. Tratarea valorilor NULL:\\n   - Coloana marcata ca PRIMARY KEY este automat NOT NULL (interzice categoric valorile null).\\n   - Coloanele marcate cu UNIQUE PERMIT valori NULL (in majoritatea bazelor de date poti avea oricate randuri cu NULL, deoarece conform standardului SQL NULL != NULL!).\\n\\n3. Rolul conceptual:\\n   - Primary Key este identificatorul unic oficial de existenta al randului (folosit ca ancora de catre Foreign Keys).\\n   - Unique Constraint garanteaza ca nu exista duplicate pe campuri de business (ex: email, cnp, iban).",
    codeSnippet: `CREATE TABLE users (
    -- O singura cheie primara per tabela (nu permite null):
    id BIGSERIAL PRIMARY KEY,

    -- Constrangeri unice multiple permise:
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) UNIQUE -- Permite multiple randuri cu NULL daca telefonul e optional!
);`,
    interviewTrap: "In PostgreSQL poti avea oricate randuri cu NULL intr-o coloana cu constrangere UNIQUE. Daca vrei ca null-urile sa fie tratate ca duplicate, in PostgreSQL 15+ folosesti: UNIQUE NULLS NOT DISTINCT.",
    keyTakeaway: "O tabela are o singura Primary Key (fara NULL); dar poate avea multiple constrangeri UNIQUE (care permit NULL-uri)."
  },
  {
    id: "sql-49",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Chei Naturale vs Chei Supleante (BIGSERIAL vs UUID)",
    question: "Care sunt avantajele si dezavantajele folosirii unui BIGINT secvential vs UUID ca cheie primara?",
    answer: "1. Cheie Supleanta BIGSERIAL / BIGINT (Numeric Auto-Increment):\\n   - Avantaje: Ocupa putin spatiu (8 bytes pe disc); inserarile sunt strict secventiale, pastrand indexul B-Tree compact (fara fragmentare de pagini); este extrem de rapid la alaturari (JOIN pe numere intregi).\\n   - Dezavantaje: Expune volumul de business (daca comanda ta are ID 105, stii ca s-au facut 105 comenzi); vulnerabil la atacuri de enumerare (/orders/106); greu de generat distribuit in sisteme paralele.\\n\\n2. Cheie UUID (Universally Unique Identifier - 128 biti / 16 bytes):\\n   - Avantaje: Poate fi generat direct de aplicatie sau frontend inainte de inserare; ideal pentru sisteme distribuite si microservicii; imposibil de ghicit de atacatori.\\n   - Dezavantaje majore ale UUID v4 clasic (complet aleatoriu): Ocupa dublu spatiu (16 bytes); genereaza fragmentare masiva a arborelui B-Tree (page splits) la inserare, ducand la degradare de performanta la volume mari!\\n\\n3. Solutia moderna: UUID v7 (ordoneaza dupa timestamp la inceput + caractere aleatorii la final).",
    codeSnippet: `-- 1. Numeric secvential:
id BIGSERIAL PRIMARY KEY

-- 2. UUID in PostgreSQL:
id UUID PRIMARY KEY DEFAULT gen_random_uuid()`,
    interviewTrap: "In REST API-uri publice este o buna practica sa folosesti ID-uri numerice BIGINT intern pentru JOIN-uri rapide si sa expui un UUID public (slug) catre clienti.",
    keyTakeaway: "BIGINT este compact si rapid dar predictibil; UUID este ideal pentru sisteme distribuite dar produce fragmentare de index daca este complet aleatoriu."
  },
  {
    id: "sql-50",
    category: "SQL",
    difficulty: "USOR",
    title: "Integritate Referentiala si actiuni ON DELETE",
    question: "Ce fac clauzele ON DELETE CASCADE, SET NULL si RESTRICT pe o constrangere de Foreign Key?",
    answer: "Clauza ON DELETE defineste cum reactioneaza baza de date atunci cand cineva incearca sa stearga randul parinte din tabela referita:\\n\\n1. ON DELETE RESTRICT (sau NO ACTION - Default):\\n   - Interzice stergerea parintelui!\\n   - Daca parintele are macar un singur copil in tabela asociata, baza de date blocheaza comanda si arunca ForeignKeyViolationException.\\n\\n2. ON DELETE CASCADE:\\n   - Daca stergi randul parinte, baza de date va STERGE AUTOMAT si IMEDIAT toate randurile copil asociate din tabela secundara!\\n   - Utilizare: cand copilul nu are sens fara parinte (ex: stergerea unei Facturi sterge automat LiniileFacturii).\\n\\n3. ON DELETE SET NULL:\\n   - La stergerea parintelui, cheia straina din copiii asociati este setata automat pe NULL.\\n   - Copiii raman in viata ca inregistrari orfane (coloana foreign key trebuie sa permita valori null).",
    codeSnippet: `CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE, -- Sterge liniile daca se sterge comanda
    product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT -- Nu permite stergerea produsului daca e in comenzi!
);`,
    interviewTrap: "Ai mare grija cu ON DELETE CASCADE pe relatii extinse: stergerea unui singur cont de utilizator poate sterge in cascada mii de comenzi, facturi si plati din sistem!",
    keyTakeaway: "RESTRICT blocheaza stergerea parintelui daca are copii; CASCADE sterge copiii automat; SET NULL le seteaza referinta pe null."
  },
  {
    id: "sql-51",
    category: "SQL",
    difficulty: "USOR",
    title: "Prima Forma Normala (1NF) - Concepte si Reguli",
    question: "Ce presupune Prima Forma Normala (1NF) intr-o baza de date relationala si cum se rezolva incalcarea ei?",
    answer: "O tabela este in Prima Forma Normala (1NF) daca respecta 3 reguli fundamentale:\n1. Fiecare coloana contine doar valori ATOMICE (indivizibile) - nu siruri separate prin virgule (ex: taguri \"java,sql,spring\" in acelasi camp).\n2. Nu exista coloane sau grupuri de coloane repetitive (ex: telefon1, telefon2, telefon3).\n3. Fiecare inregistrare este identificabila unic printr-o Cheie Primara (Primary Key).\n\nRezolvare:\n- Datele multivaloare (ex: telefoane sau taguri) se extrag intr-o tabela separata copil legata prin Foreign Key de tabela parinte.",
    codeSnippet: `-- GRESIT (Incalca 1NF - valori non-atomice):
-- user_id | nume  | telefoane
-- 1       | Mihai | 0712345678, 0799887766

-- CORECT (Conform 1NF):
CREATE TABLE user_telefoane (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES utilizatori(id),
    numar VARCHAR(20) NOT NULL
);`,
    interviewTrap: "Candidatii cred adesea ca 1NF inseamna doar existenta unei chei primare. Lipsa atomicitatii (stocarea de liste/CSV-uri intr-un varchar) este cea mai frecventa incalcare de 1NF in productie!",
    keyTakeaway: "1NF = Valori atomice in fiecare celula, fara liste serializate in campuri text si fara coloane tel1, tel2, tel3."
  },
  {
    id: "sql-52",
    category: "SQL",
    difficulty: "MEDIU",
    title: "A Doua Forma Normala (2NF) - Dependente Partiale",
    question: "Ce este A Doua Forma Normala (2NF) si cand poate aparea incalcarea acesteia?",
    answer: "O tabela este in 2NF daca:\n1. Este deja in Prima Forma Normala (1NF).\n2. TOATE atributele non-cheie depind functional in totalitate de intreaga Cheie Primara (nu exista dependente partiale).\n\nCand apare incalcarea 2NF:\n- Se intampla DOAR in tabelele care au o Cheie Primara COMPUSA (formata din 2 sau mai multe coloane).\n- Daca o coloana depinde doar de O PARTE a cheii compuse, tabela incalca 2NF.\n\nExemplu:\nIn tabela comanda_articole(comanda_id, articol_id, cantitate, denumire_articol), cheia este (comanda_id, articol_id). Cantitatea depinde de ambele, dar denumire_articol depinde doar de articol_id!\nRezolvare: denumire_articol se muta in tabela articole(articol_id, denumire).",
    codeSnippet: `-- Incalca 2NF (denumire depinde doar de articol_id):
-- comanda_articole(comanda_id, articol_id, cantitate, denumire_articol)

-- Solutie 2NF:
-- comanda_articole(comanda_id, articol_id, cantitate) - PK (comanda_id, articol_id)
-- articole(articol_id, denumire, pret) - PK articol_id`,
    interviewTrap: "Daca o tabela are o Cheie Primara simpla (o singura coloana, ex: id int), ea este automat in 2NF daca este in 1NF! Nu poti avea dependenta partiala daca nu ai cheie compusa.",
    keyTakeaway: "2NF elimina dependentele partiale de o cheie primara compusa. Fiecare atribut non-cheie trebuie sa depinda de TOATA cheia primara."
  },
  {
    id: "sql-53",
    category: "SQL",
    difficulty: "MEDIU",
    title: "A Treia Forma Normala (3NF) - Dependente Tranzitive",
    question: "Ce este A Treia Forma Normala (3NF) si cum se identifica dependentele tranzitive?",
    answer: "O tabela este in 3NF daca:\n1. Este deja in A Doua Forma Normala (2NF).\n2. NU contine dependente tranzitive (atributele non-cheie trebuie sa depinda direct si exclusiv de Cheia Primara, nu de alte atribute non-cheie).\n\nFormula clasica:\n\"Fiecare coloana trebuie sa depinda de Cheie, de toata Cheia si de nimic altceva decat Cheia (so help me Codd)\".\n\nExemplu incalcare 3NF:\nTabela angajati(id, nume, departament_id, nume_departament, etaj_departament).\n- id este PK.\n- id determina departament_id, iar departament_id determina nume_departament si etaj_departament (id -> departament_id -> etaj).\n- Daca schimbam etajul departamentului, trebuie sa actualizam sute de angajati, cauzand anomalii de UPDATE!\nRezolvare: Extragerea tabelei departamente(id, nume, etaj).",
    codeSnippet: `-- Solutie 3NF curata:
CREATE TABLE departamente (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    etaj INT
);

CREATE TABLE angajati (
    id SERIAL PRIMARY KEY,
    nume VARCHAR(100) NOT NULL,
    departament_id INT REFERENCES departamente(id)
);`,
    interviewTrap: "Multi candidati confunda 2NF cu 3NF. Tine minte: 2NF rezolva dependentele partiale de cheia compusa. 3NF rezolva dependentele dintre atribute non-cheie (A -> B -> C).",
    keyTakeaway: "3NF elimina dependentele tranzitive (atribute non-cheie care depind de alte atribute non-cheie). Previne anomaliile de inserare, actualizare si stergere."
  },
  {
    id: "sql-54",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Denormalizarea Bazelor de Date - De Ce si Cand se Foloseste",
    question: "Ce este denormalizarea, de ce este utilizata in practica si care sunt riscurile ei?",
    answer: "Denormalizarea este procesul deliberat de adaugare de date redundante intr-o baza de date normalizata pentru a imbunatati performanta operatiilor de CITIRE.\n\nDe ce se recurge la ea:\n1. Reducerea JOIN-urilor costisitoare: Daca o tabela de comenzi necesita permanent numele clientului si adresa, adaugarea campului client_nume direct in comenzi evita un JOIN la fiecare select.\n2. Pre-calcularea agregatelor: Salvarea total_comanda sau numar_articole direct in comenzi, in loc de a rula SUM/COUNT la fiecare incarcare.\n3. Aplicatii read-heavy (Data Warehousing, E-commerce dashboard).\n\nRiscuri / Dezavantaje:\n- Redundanta de date si spatiu suplimentar pe disc.\n- Anomalii de sincronizare: daca un client isi schimba numele, trebuie actualizat in multiple tabele sau apar inconsistente.\n- Operatiile de WRITE (INSERT/UPDATE/DELETE) devin mai lente si mai complexe.",
    codeSnippet: `-- Tabela comenzi normalizata (3NF) - necesita calcul la fiecare SELECT:
-- SELECT c.id, SUM(ca.cantitate * ca.pret_unitar) FROM comenzi c JOIN ...

-- Tabela denormalizata (camp pre-calculat direct in comanda):
ALTER TABLE comenzi ADD COLUMN total_plata NUMERIC(12, 2);
-- total_plata este actualizat prin trigger sau serviciul backend la plasare.`,
    interviewTrap: "La interviu, unii spun ca normalizarea este \"buna\" si denormalizarea \"rea\". Raspunsul de nivel Mid este echilibrat: normalizam pentru consistenta si scrieri rapide (OLTP), denormalizam calculat pentru viteza de citire si rapoarte (OLAP / Read Caching).",
    keyTakeaway: "Denormalizarea sacrifica viteza de scriere si spatiul de stocare pentru a obtine citiri mult mai rapide prin eliminarea join-urilor costisitoare."
  },
  {
    id: "sql-55",
    category: "SQL",
    difficulty: "USOR",
    title: "ACID: Atomicitate si Durabilitate",
    question: "Ce inseamna Atomicitatea si Durabilitatea din proprietatile ACID ale unei baze de date relationale?",
    answer: "1. Atomicitate (A din ACID):\n- Principiul \"Totul sau Nimic\" (All or Nothing).\n- Daca o tranzactie contine 5 instructiuni SQL si a 4-a esueaza, primele 3 sunt anulate complet (ROLLBACK).\n- Nicio tranzactie nu lasa baza de date intr-o stare partial modificata.\n\n2. Durabilitate (D din ACID):\n- Odata ce o tranzactie a primit confirmarea de COMMIT, datele modificate sunt garantat persistate pe disc si NU se pierd nici macar in caz de pana de curent, crash al serverului sau repornire fortata.\n- Este implementata prin Write-Ahead Logging (WAL) in PostgreSQL / Redo Log in MySQL.",
    codeSnippet: `BEGIN TRANSACTION;

-- Pas 1: Scadem 500 RON din contul sursa
UPDATE conturi SET sold = sold - 500 WHERE iban = 'RO_SURSA';

-- Pas 2: Adaugam 500 RON in contul destinatie
UPDATE conturi SET sold = sold + 500 WHERE iban = 'RO_DESTINATIE';

-- Daca orice operatiune esueaza, ATOMICITATEA asigura ca nu se pierde niciun ban:
-- In caz de succes:
COMMIT;
-- In caz de eroare:
-- ROLLBACK;`,
    interviewTrap: "Intrebare capcana: \"Daca serverul cade la 2 milisecunde dupa COMMIT, datele se pot pierde?\" Nu, daca Durabilitatea este garantata prin fsync pe WAL (Write-Ahead Log) inainte de confirmarea commit-ului.",
    keyTakeaway: "Atomicitatea garanteaza ca tranzactiile sunt indivizibile (totul sau nimic), iar Durabilitatea garanteaza ca un COMMIT nu este pierdut la crash."
  },
  {
    id: "sql-56",
    category: "SQL",
    difficulty: "USOR",
    title: "ACID: Consistenta si Izolare",
    question: "Ce reprezinta Consistenta si Izolarea din proprietatile ACID?",
    answer: "1. Consistenta (C din ACID):\n- Baza de date trece dintr-o stare valida in alta stare valida.\n- Toate constrangerile (Primary Key, Foreign Key, CHECK, NOT NULL, Triggers) trebuie sa fie respectate la sfarsitul oricarei tranzactii.\n- Daca o operatie ar incalca o constrangere (ex: sold negativ cu CHECK sold >= 0), tranzactia este respinsa.\n\n2. Izolare (I din ACID):\n- Tranzactiile concurente (care ruleaza simultan pe conexiuni diferite) nu se influenteaza negativ una pe cealalta.\n- Rezultatul final al executiei concurente trebuie sa fie identic cu cel al unei executii secventiale (in functie de Isolation Level setat: Read Committed, Repeatable Read, Serializable).",
    codeSnippet: `-- Consistenta garantata de constrangeri:
ALTER TABLE conturi ADD CONSTRAINT chk_sold_pozitiv CHECK (sold >= 0);

-- Izolare: specificarea nivelului dorit intr-o tranzactie
BEGIN TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SELECT sold FROM conturi WHERE id = 10;
-- Nicio alta tranzactie concurenta nu poate altera rezultatul citit in aceasta sesiune!
COMMIT;`,
    interviewTrap: "Multi confunda Consistenta din ACID cu Consistenta din teorema CAP! In ACID, consistenta se refera la respectarea regulilor de integritate relationale. In CAP, consistenta inseamna ca toate nodurile dintr-un cluster vad exact aceeasi data in acelasi moment.",
    keyTakeaway: "Consistenta = respectarea tuturor constrangerilor si regulilor de afaceri. Izolarea = operatiunile concurente nu isi corup reciproc datele."
  },
  {
    id: "sql-57",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Anomalii de Tranzactie: Dirty Read vs Non-Repeatable Read",
    question: "Care este diferenta intre o citire murdara (Dirty Read) si o citire nerepetabila (Non-repeatable Read)?",
    answer: "1. Dirty Read (Citire Murdara):\n- Tranzactia A citeste date modificate de Tranzactia B, dar Tranzactia B NU a dat inca COMMIT (date neconfirmate).\n- Daca Tranzactia B face ROLLBACK, Tranzactia A a lucrat cu \"date fantoma\" care nu au existat oficial niciodata!\n- Posibil doar la nivelul Read Uncommitted (nivel nesuportat / evitat in Postgres).\n\n2. Non-Repeatable Read (Citire Nerepetabila):\n- Tranzactia A citeste un rand cu o anumita valoare (ex: pret = 100).\n- Tranzactia B modifica acel rand (pret = 150) si da COMMIT.\n- Tranzactia A citeste din nou acelasi rand in cadrul ACELEIASI tranzactii si gaseste noua valoare (150).\n- Este permisa la nivelul Read Committed (default in Postgres & MySQL), dar este prevenita la Repeatable Read.",
    codeSnippet: `-- Dirty Read (Exemplu scenariu periculos):
-- Sesiunea 1: UPDATE produse SET pret = 50 WHERE id = 1; (fara commit)
-- Sesiunea 2: SELECT pret FROM produse WHERE id = 1; -- vede 50!
-- Sesiunea 1: ROLLBACK; -- pretul a ramas 100, dar sesiunea 2 a emis factura pe 50!`,
    interviewTrap: "PostgreSQL NU permite Dirty Read nici macar daca setezi READ UNCOMMITTED! Trateaza Read Uncommitted intern ca Read Committed.",
    keyTakeaway: "Dirty Read = citirea datelor inainte de COMMIT. Non-Repeatable Read = citirea unor valori diferite ale aceluiasi rand in aceeasi tranzactie din cauza commit-ului altuia."
  },
  {
    id: "sql-58",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Phantom Read si Nivelul SERIALIZABLE",
    question: "Ce este un Phantom Read si cum asigura nivelul de izolare SERIALIZABLE executia sigura a tranzactiilor?",
    answer: "1. Ce este Phantom Read (Citire Fantoma):\n- Tranzactia A executa un query cu o conditie de interval (ex: WHERE pret BETWEEN 10 AND 50) si gaseste 5 randuri.\n- Tranzactia B insereaza un RAND NOU cu pret = 30 si da COMMIT.\n- Tranzactia A ruleaza EXACT acelasi query si descopera 6 randuri (a aparut un rand nou \"fantoma\").\n- Spre deosebire de Non-Repeatable Read (unde se modifica un rand existent), la Phantom Read apar sau dispar randuri intregi intr-un interval.\n\n2. Nivelul SERIALIZABLE:\n- Cel mai strict nivel de izolare din standardul SQL.\n- Garanteaza ca rezultatul executiei concurente a tranzactiilor este 100% identic cu o executie pur secventiala (una dupa alta).\n- Daca motorul detecteaza o anomalie de serializare (SSI - Serializable Snapshot Isolation in Postgres), arunca o eroare de serializare (SQLSTATE 40001), obligand clientul sa reincerce (retry) tranzactia.",
    codeSnippet: `-- Rulare in mod complet izolat:
BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE;

SELECT COUNT(*) FROM inscrieri WHERE curs_id = 5;
-- Daca alta tranzactie concurenta a adaugat un student la cursul 5 in acest timp,
-- Postgres va genera eroare la COMMIT daca exista conflict:
-- ERROR: could not serialize access due to read/write dependencies among transactions

COMMIT;`,
    interviewTrap: "Nivelul SERIALIZABLE nu inseamna ca tranzactiile se blocheaza reciproc pana termina! Motoarele moderne (ca Postgres) folosesc optimizari bazate pe grafuri de dependenta (SSI) si abortare optimista cu retry.",
    keyTakeaway: "Phantom Read reprezinta aparitia unor randuri noi intr-un interval citit anterior. Nivelul SERIALIZABLE elimina complet toate anomaliile, necesitand logica de retry in aplicatie."
  },
  {
    id: "sql-59",
    category: "SQL",
    difficulty: "MEDIU",
    title: "MVCC (Multi-Version Concurrency Control) in PostgreSQL",
    question: "Ce este MVCC (Multi-Version Concurrency Control) si care este principalul sau beneficiu?",
    answer: "MVCC este mecanismul intern prin care bazele de date moderne (PostgreSQL, MySQL InnoDB, Oracle) gestioneaza tranzactiile concurente fara a bloca tabela.\n\nPrincipiul fundamental MVCC:\n\"Cititorii nu blocheaza niciodata scriitorii, iar scriitorii nu blocheaza niciodata cititorii!\"\n(Readers do not block writers, and writers do not block readers).\n\nCum functioneaza in PostgreSQL:\n1. Cand se face un UPDATE, motorul NU suprascrie randul pe disc, ci creeaza o NOUA VERSIUNE (tuple) a randului.\n2. Fiecare rand contine metadate de sistem ascunse: xmin (ID-ul tranzactiei care l-a creat) si xmax (ID-ul tranzactiei care l-a sters/inlocuit).\n3. O interogare SELECT vede un \"snapshot\" (instantaneu) al bazei de date corespunzator momentului cand a inceput tranzactia/instructiunea, ignorand modificarile neconfirmate sau mai noi.",
    codeSnippet: `-- Coloanele interne de sistem MVCC pot fi inspectate in Postgres:
SELECT xmin, xmax, id, nume, email FROM utilizatori LIMIT 5;

-- xmin: ID-ul tranzactiei care a inserat randul
-- xmax: 0 daca este activ, sau ID-ul tranzactiei care l-a marcat sters/actualizat`,
    interviewTrap: "Deoarece UPDATE creeaza randuri noi si DELETE doar marcheaza xmax, versiunile vechi devin \"dead tuples\" (tupluri moarte). Fara comanda VACUUM (sau autovacuum), baza de date ar suferi de table bloat (crestere in volum inutila).",
    keyTakeaway: "MVCC permite citiri si scrieri simultane de mare performanta prin mentinerea mai multor versiuni ale fiecarui rand in functie de ID-ul tranzactiei (xmin, xmax)."
  },
  {
    id: "sql-60",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Pessimistic Locking: SELECT ... FOR UPDATE",
    question: "Ce face instructiunea SELECT ... FOR UPDATE si cand este obligatoriu sa o folosim?",
    answer: "SELECT ... FOR UPDATE este mecanismul standard de blocare pesimista (Pessimistic Locking) la nivel de rand (Row-level Lock).\n\nCe face:\n- Blocheaza randurile selectate impotriva altor operatii de UPDATE, DELETE sau alt SELECT FOR UPDATE din alte tranzactii, pana cand tranzactia curenta da COMMIT sau ROLLBACK.\n- Alte tranzactii care incearca sa modifice aceleasi randuri vor fi puse in asteptare (suspendate).\n\nCand se foloseste:\n- Rezervari de bilete sau locuri in avion (pentru a evita ca 2 utilizatori sa cumpere acelasi loc in aceeasi milisecunda).\n- Tranzactii financiare (verificarea si debitarea soldului in siguranta, prevenind race conditions).\n- Incrementari de stocuri sau generatoare de secvente de comanda.",
    codeSnippet: `BEGIN;
-- Blocheaza exclusiv produsul cu id = 42 pe durata intregii tranzactii:
SELECT id, stoc 
FROM produse 
WHERE id = 42 
FOR UPDATE;

-- Verificam in Java / backend: if (stoc >= cantitate_ceruta) ...
UPDATE produse 
SET stoc = stoc - 1 
WHERE id = 42;

COMMIT; -- Doar aici blocajul pe randul 42 este eliberat!`,
    interviewTrap: "Daca uiti sa pui conditia WHERE exacta sau daca nu exista index pe acea coloana, baza de date poate bloca un numar imens de randuri sau intreaga tabela, paralizand aplicatia!",
    keyTakeaway: "SELECT FOR UPDATE asigura blocare exclusiva la nivel de rand, garantand ca nicio alta sesiune nu poate modifica sau rezerva acele date pana la COMMIT."
  },
  {
    id: "sql-61",
    category: "SQL",
    difficulty: "MEDIU",
    title: "SELECT FOR UPDATE: NOWAIT vs SKIP LOCKED",
    question: "Care este diferenta dintre optiunile NOWAIT si SKIP LOCKED in clauza FOR UPDATE?",
    answer: "In mod implicit, SELECT ... FOR UPDATE asteapta indefinit eliberarea randurilor daca sunt deja blocate de alta conexiune.\n\n1. NOWAIT:\n- Daca oricare dintre randurile cerute este deja blocat de o alta tranzactie, interogarea esueaza IMEDIAT cu o eroare (nu asteapta nici macar o milisecunda).\n- Utilizare: cand doresti sa intorci instant utilizatorului \"Resursa este ocupata, incercati din nou!\".\n\n2. SKIP LOCKED:\n- Daca unele randuri sunt deja blocate de alte tranzactii concurente, Postgres/MySQL pur si simplu LE SARE si le returneaza doar pe cele libere!\n- Utilizare celebra: Cozi de mesaje concurente (Job Queue in Postgres). Fiecare worker ia urmatorul job liber fara niciun blocaj sau deadlock intre procese!",
    codeSnippet: `-- Modelul perfect de Message Queue in SQL fara RabbitMQ:
BEGIN;

SELECT id, payload
FROM coada_taskuri
WHERE status = 'PENDING'
ORDER BY creat_la ASC
LIMIT 1
FOR UPDATE SKIP LOCKED; -- Daca alt worker proceseaza taskul 1, tu primesti taskul 2 direct!

UPDATE coada_taskuri SET status = 'PROCESSING' WHERE id = ...;
COMMIT;`,
    interviewTrap: "SKIP LOCKED nu este destinat generarii de rapoarte sau facturi, deoarece omiterea randurilor blocate ar genera calcule incomplete. Este facut exclusiv pentru arhitecturi de cozi de sarcini concurente.",
    keyTakeaway: "NOWAIT arunca eroare imediata daca resursa e blocata; SKIP LOCKED ignora randurile ocupate si le alege pe primele libere, ideal pentru cozi de background jobs."
  },
  {
    id: "sql-62",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Deadlock in Baze de Date - Detectie si Prevenire",
    question: "Ce este un Deadlock (interblocare) in SQL, cum il gestioneaza motorul de baza de date si cum il previi?",
    answer: "1. Ce este un Deadlock:\n- O situatie in care doua sau mai multe tranzactii se blocheaza reciproc intr-o dependenta circulara:\n  - Tranzactia 1 detine lacat pe Randul A si asteapta dupa Randul B.\n  - Tranzactia 2 detine lacat pe Randul B si asteapta dupa Randul A.\n  - Niciuna nu poate inainta fara cealalta.\n\n2. Cum il rezolva baza de date:\n- Motorul ruleaza un mecanism intern de detectie de cicluri (Deadlock Detector).\n- Cand depaseste un timeout (ex: deadlock_timeout = 1s in Postgres), motorul alege o tranzactie ca \"victima\", o anuleaza fortat prin ROLLBACK si arunca eroare (SQLSTATE 40P01).\n\n3. Cum il previi ca programator:\n- ACCESAREA RESURSELOR IN EXACT ACEEASI ORDINE intotdeauna (ex: daca actualizezi mai multe randuri, sorteaza ID-urile crescator inainte de a da update/lock).\n- Tranzactii cat mai scurte (nu include apeluri HTTP sau procesari grele in interiorul unui bloc tranzactional).",
    codeSnippet: `-- REGULA DE AUR pentru a evita deadlock-ul cand blochezi mai multe ID-uri:
-- In Java / backend: Collections.sort(idsList); 
-- Apoi in SQL:
SELECT * FROM produse WHERE id IN (10, 25, 40) ORDER BY id FOR UPDATE;`,
    interviewTrap: "Un mit comun este ca deadlock-ul este un bug al bazei de date. In 99% din cazuri este o problema de proiectare a aplicatiei care blocheaza resursele in ordine diferita pe thread-uri concurente.",
    keyTakeaway: "Deadlock-ul este un ciclu de blocaje reciproce. Se previne prin sortarea riguroasa a resurselor blocate in aceeasi ordine in toate tranzactiile aplicatiei."
  },
  {
    id: "sql-63",
    category: "SQL",
    difficulty: "USOR",
    title: "Views (Vederi) - Ce Sunt si Avantaje",
    question: "Ce este un View (vedere standard) in SQL si ce beneficii aduce?",
    answer: "Un View este o tabela virtuala definita pe baza unei interogari SELECT salvate in baza de date.\n\nCaracteristici cheie:\n1. NU stocheaza date fizice pe disc: Cand faci SELECT * FROM v_nume_view, motorul executa interogarea SQL din spate in timp real.\n2. Simplificarea interogarilor complexe: Ascunde JOIN-uri lungi de 6 tabele, functii de agregare sau logica complicata in spatele unui nume simplu.\n3. Securitate si Permisiuni: Poti oferi unui utilizator drepturi de citire doar pe un View care ascunde coloanele sensibile (ex: salariu, parola, CNP), fara a-i da acces la tabela principala.\n4. Abstractizare: Daca schema tabelelor de baza se schimba usor, View-ul poate pastra aceeasi structura pentru compatibilitate inversa.",
    codeSnippet: `CREATE VIEW v_angajati_activi AS
SELECT 
    id, 
    nume, 
    email, 
    departament_id
FROM angajati
WHERE este_activ = TRUE;

-- Utilizare simpla ca o tabela obisnuita:
SELECT * FROM v_angajati_activi WHERE departament_id = 3;`,
    interviewTrap: "Pentru ca un View standard ruleaza query-ul in spate la fiecare apelare, el nu aduce nicio imbunatatire de performanta! Daca query-ul din View e lent, citirea din View va fi la fel de lenta.",
    keyTakeaway: "Un View este o interogare virtuala salvata; ofera simplificare logica si securitate, dar nu stocheaza date fizic si nu accelereaza citirea."
  },
  {
    id: "sql-64",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Materialized Views vs Views Standard",
    question: "Care este diferenta principala dintre un View standard si un Materialized View?",
    answer: "Diferenta esentiala consta in PERSISTENTA datelor pe disc si PERFORMANTA:\n\n1. View Standard:\n- Este doar o interogare virtuala.\n- Datele NU sunt stocate fizic; query-ul se executa de fiecare data cand este interogata vederea.\n- Datele sunt intotdeauna 100% in timp real.\n\n2. Materialized View:\n- Executa interogarea si SALVEAZA FIZIC REZULTATUL pe disc ca pe o tabela reala.\n- Poate fi INDEXAT cu B-Tree, facand citirile din rapoarte gigantice instantanee (milisecunde in loc de minute).\n- Datele NU sunt in timp real; devin invechite pana cand se executa comanda de reimprospatare: REFRESH MATERIALIZED VIEW.",
    codeSnippet: `-- Creare Materialized View pentru statistici agregate grele:
CREATE MATERIALIZED VIEW mv_raport_vanzari_lunare AS
SELECT 
    DATE_TRUNC('month', data_vanzare) AS luna,
    magazin_id,
    SUM(total) AS vanzari_totale
FROM vanzari
GROUP BY 1, 2;

-- Creare index pe rezultatul materializat:
CREATE INDEX idx_mv_luna ON mv_raport_vanzari_lunare(luna);

-- Reimprospatare date in background fara a bloca cititorii:
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_raport_vanzari_lunare;`,
    interviewTrap: "Pentru a folosi clauza CONCURRENTLY la reimprospatare in PostgreSQL, este obligatoriu ca Materialized View-ul sa aiba cel putin un UNIQUE INDEX definit pe el!",
    keyTakeaway: "View standard = calculat la fiecare rulare (date fresh, performanta interogarii de baza). Materialized View = salvat pe disc si indexabil (viteza maxima, necesita refresh periodic)."
  },
  {
    id: "sql-65",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Tabele Temporare (TEMPORARY TABLE)",
    question: "Ce este o Tabela Temporara (TEMP TABLE), cand se utilizeaza si care este durata sa de viata?",
    answer: "O Tabela Temporara este o tabela creata special pentru calcule intermediare sau stocare tranzitorie.\n\nCaracteristici:\n1. Durata de viata: Exista doar pe durata sesiunii (conexiunii curente la baza de date) sau a tranzactiei (in functie de clauza ON COMMIT).\n2. Izolare completa: Este vizibila DOAR conexiunii care a creat-o. Doua sesiuni concurente pot crea tabele temporare cu exact acelasi nume fara niciun conflict.\n3. Curatare automata: La inchiderea conexiunii clientului, tabela temporara si toate datele din ea sunt sterse automat de motorul de baza de date.\n\nCand se utilizeaza:\n- Procese ETL sau importuri masive de date unde fisierele CSV brute sunt validate si transformate intermediar inainte de inserarea in tabelele finale de productie.",
    codeSnippet: `-- Creare tabela temporara pe durata sesiunii:
CREATE TEMPORARY TABLE temp_calcul_bonusuri (
    angajat_id INT,
    scor NUMERIC,
    bonus NUMERIC
);

-- Sau cu stergere automata la sfarsitul tranzactiei:
CREATE TEMP TABLE temp_date_raw (
    valoare TEXT
) ON COMMIT DROP;`,
    interviewTrap: "Daca folosesti un Connection Pool (ex: HikariCP) in Java si conexiunile nu se inchid, ci se recicleaza, tabelele temporare create fara `ON COMMIT DROP` pot ramane active si pot consuma memorie sau cauza coliziuni neasteptate!",
    keyTakeaway: "Tabelele temporare stocheaza date de tranzit vizibile doar conexiunii curente si sunt sterse automat la finalul sesiunii sau al tranzactiei."
  },
  {
    id: "sql-66",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Triggers (Declansatori) - Utilizare si Riscuri",
    question: "Ce este un Trigger in SQL, cand se foloseste si care sunt principalele capcane legate de utilizarea lui?",
    answer: "Un Trigger este o procedura stocata care se executa automat in baza de date ca reactie la un eveniment specific DML (INSERT, UPDATE, DELETE) sau DDL pe o tabela.\n\nMomente de executie:\n- BEFORE: inainte de aplicarea modificarii (ideal pentru validari sau transformari automate ale valorii NEW).\n- AFTER: dupa ce datele au fost modificate (ideal pentru tabele de audit sau jurnalizare).\n\nRiscuri si de ce sunt descurajate in aplicatiile moderne:\n1. Logica ascunsa (\"Hidden Magic\"): Developerii vad ca un INSERT a modificat 3 tabele diferite fara sa inteleaga de unde din codul Java/Spring a venit modificarea.\n2. Penalizare grava de performanta: Triggerele pe operatii masive (bulk insert de 50.000 de randuri) ruleaza for each row, facand scrierile extrem de lente.\n3. Risc de cascada si bucle infinite: Triggerul de pe Tabela A face update pe B, care are trigger ce face update pe A.",
    codeSnippet: `-- Exemplu Trigger de Audit in PostgreSQL:
CREATE OR REPLACE FUNCTION audit_pret_modificat()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.pret != NEW.pret THEN
        INSERT INTO istoric_preturi(produs_id, pret_vechi, pret_nou, modificat_la)
        VALUES (OLD.id, OLD.pret, NEW.pret, NOW());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_audit_pret
AFTER UPDATE ON produse
FOR EACH ROW
EXECUTE FUNCTION audit_pret_modificat();`,
    interviewTrap: "Variabilele speciale OLD si NEW: La INSERT ai doar NEW (OLD e null). La DELETE ai doar OLD (NEW e null). La UPDATE ai atat OLD cat si NEW.",
    keyTakeaway: "Triggerele executa cod automat la scrieri; sunt utile pentru audit si integritate stricta, dar pot ascunde logica de afaceri si degrada sever performanta."
  },
  {
    id: "sql-67",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Stored Procedures vs User Defined Functions (UDF)",
    question: "Care este diferenta principala dintre o Procedura Stocata (Stored Procedure) si o Functie (UDF) in SQL?",
    answer: "Principalele diferente:\n\n1. Tranzactionalitate:\n- Stored Procedure (comanda CALL): Poate porni, comite (COMMIT) sau anula (ROLLBACK) tranzactii in interiorul corpului sau.\n- Function (UDF): NU poate controla tranzactii (nu poate da COMMIT sau ROLLBACK in interior); ruleaza intotdeauna in contextul tranzactiei apelante.\n\n2. Modul de apelare:\n- Procedurile se apeleaza prin instructiunea `CALL nume_procedura(parametri)`.\n- Functiile pot fi apelate direct in interiorul instructiunilor SQL (ex: `SELECT calculeaza_tva(pret) FROM produse`).\n\n3. Valoare returnata:\n- O functie TREBUIE sa returneze o valoare sau un set de date (TABLE).\n- O procedura stocata nu este obligata sa returneze nimic (poate efectua doar operatii DML/TCL).",
    codeSnippet: `-- Functie (apelata inline in SELECT):
CREATE FUNCTION adauga_tva(pret NUMERIC) RETURNS NUMERIC AS $$
BEGIN
    RETURN pret * 1.19;
END;
$$ LANGUAGE plpgsql;
-- Utilizare: SELECT titlu, adauga_tva(pret) FROM carti;

-- Procedura (gestioneaza tranzactii independente):
CREATE PROCEDURE transfer_bancar(sursa INT, dest INT, suma NUMERIC) AS $$
BEGIN
    UPDATE conturi SET sold = sold - suma WHERE id = sursa;
    UPDATE conturi SET sold = sold + suma WHERE id = dest;
    COMMIT;
END;
$$ LANGUAGE plpgsql;
-- Utilizare: CALL transfer_bancar(1, 2, 500);`,
    interviewTrap: "In versiunile vechi de PostgreSQL (inainte de v11), existau doar functii! Procedurile cu comanda CALL si suport complet pentru tranzactii au fost introduse in PostgreSQL 11.",
    keyTakeaway: "Functiile sunt folosite inline in SELECT-uri si returneaza o valoare fara a controla tranzactii; Procedurile se apeleaza prin CALL si pot efectua COMMIT / ROLLBACK."
  },
  {
    id: "sql-68",
    category: "SQL",
    difficulty: "USOR",
    title: "Tipuri Numerice: INT vs BIGINT vs NUMERIC/DECIMAL",
    question: "De ce nu trebuie folosite NICIODATA tipurile FLOAT sau DOUBLE pentru sume de bani si ce tip SQL este corect?",
    answer: "1. De ce NU FLOAT / DOUBLE (Floating-point inexact):\n- Sunt tipuri aproximative bazate pe standardul binar IEEE 754.\n- Nu pot reprezenta exact fractiile zecimale simple (ex: 0.1 sau 0.05). In calcule apar erori cumulative ciudate (ex: 0.1 + 0.2 = 0.30000000000000004).\n- In contabilitate sau procesari de plati, o diferenta de un cent este o incalcare grava legala!\n\n2. Ce se foloseste pentru bani:\n- NUMERIC(precision, scale) sau DECIMAL(p, s) - sunt tipuri EXACTE cu virgula fixa.\n- precision = numarul total de cifre permise.\n- scale = numarul de zecimale dupa virgula.\n- Alternativa la fel de populara: BIGINT reprezentand direct valoarea in bani/centi (ex: 15.99 RON salvat ca 1599 bani).",
    codeSnippet: `-- CORECT pentru preturi si solduri bancare:
CREATE TABLE cont_bancar (
    id BIGSERIAL PRIMARY KEY,
    titular VARCHAR(100) NOT NULL,
    sold NUMERIC(15, 2) NOT NULL DEFAULT 0.00 -- 15 cifre in total, 2 zecimale exacte
);

-- GRESIT: FLOAT sau REAL conduc la erori de rotunjire in sume si facturi!`,
    interviewTrap: "Multi candidati juniori aleg `INT` pentru preturi si pierd zecimalele, sau `FLOAT` si creeaza bug-uri contabile. Pentru campuri financiare raspunsul standard este NUMERIC / DECIMAL.",
    keyTakeaway: "FLOAT/DOUBLE sunt aproximative si duc la erori de rotunjire; campurile monetare trebuie declarate NUMERIC(p, s) sau BIGINT in centi."
  },
  {
    id: "sql-69",
    category: "SQL",
    difficulty: "USOR",
    title: "Tipuri de Text: CHAR vs VARCHAR vs TEXT",
    question: "Care este diferenta de stocare si performanta intre CHAR(n), VARCHAR(n) si TEXT?",
    answer: "1. CHAR(n) (Fixed length):\n- Aloca lungime FIXA de `n` caractere.\n- Daca inserezi un sir de 3 caractere intr-un CHAR(10), motorul completeaza restul de 7 pozitii cu SPATII (trailing spaces)!\n- Utilizare corecta: coduri cu lungime strict fixa (ex: cod tara ISO \"RO\", \"US\", cod moneda \"RON\", \"EUR\", hash SHA256 fix de 64 chars).\n\n2. VARCHAR(n) (Variable length):\n- Stocheaza lungime variabila, pana la maxim `n` caractere, plus 1-2 octeti de lungime.\n- Nu adauga spatii suplimentare la final.\n\n3. TEXT (Unlimited variable length):\n- Lungime variabila nelimitata (pana la 1GB in Postgres).\n- In PostgreSQL, VARCHAR(n), VARCHAR fara limita si TEXT folosesc EXACT acelasi mecanism intern de stocare (nu exista nicio diferenta de performanta!). Limita `n` este doar o verificare de integritate.",
    codeSnippet: `-- Cod valuta fix (CHAR):
cod_valuta CHAR(3) -- 'RON', 'EUR'

-- Nume cu validare de lungime (VARCHAR):
nume VARCHAR(100)

-- Continut articol sau descriere lunga (TEXT):
descriere TEXT`,
    interviewTrap: "In MySQL sau Oracle vechi, VARCHAR si TEXT aveau diferente de performanta la memorii temporare pe disc. In PostgreSQL modern, VARCHAR(255) si TEXT au fix aceeasi performanta!",
    keyTakeaway: "CHAR(n) este fix cu padding de spatii (pentru coduri fixe); VARCHAR(n) si TEXT sunt de lungime variabila, stocand exact numarul de caractere inserat."
  },
  {
    id: "sql-70",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Timp si Fus Orar: TIMESTAMP vs TIMESTAMPTZ in PostgreSQL",
    question: "Care este diferenta critica intre TIMESTAMP si TIMESTAMPTZ in PostgreSQL si de ce este TIMESTAMPTZ alegerea recomandata?",
    answer: "1. TIMESTAMP (fara fus orar):\n- Stocheaza doar data si ora \"oarba\", fara nicio informatie de fus orar (ex: \"2026-10-02 14:30:00\").\n- Daca un utilizator din New York si unul din Bucuresti citesc valoarea, ambii vad \"14:30\", desi la momentul real in New York era alta ora!\n\n2. TIMESTAMPTZ (TIMESTAMP WITH TIME ZONE):\n- In PostgreSQL, TIMESTAMPTZ converteste timpul primit la UTC si stocheaza data intern MEREU in UTC (8 octeti)!\n- Cand este citita data, Postgres o converteste automat la fusul orar al conexiunii clientului (timezone setat in sesiune).\n- Elimina complet bug-urile legate de trecerea la ora de vara/iarna (DST) si utilizatori din fuse orare diferite.",
    codeSnippet: `-- Exemplu comportament TIMESTAMPTZ:
SET TIMEZONE TO 'Europe/Bucharest';
SELECT NOW(); -- ex: 2026-10-02 23:00:00+03

SET TIMEZONE TO 'UTC';
SELECT NOW(); -- ex: 2026-10-02 20:00:00+00 -- acelasi moment in timp universal!`,
    interviewTrap: "Multi cred ca TIMESTAMPTZ stocheaza textul cu fusul orar in coloana. Fals! Postgres stocheaza totul ca numar in UTC, iar \"cu fus orar\" inseamna doar ca afisarea si parsarea tin cont de timezone.",
    keyTakeaway: "Foloseste intotdeauna TIMESTAMPTZ in PostgreSQL pentru evenimente din lumea reala (comenzi, loguri, programari) pentru a evita bug-urile de fus orar."
  },
  {
    id: "sql-71",
    category: "SQL",
    difficulty: "USOR",
    title: "Functii de Timp: INTERVAL, EXTRACT si DATE_TRUNC",
    question: "Cum manipulezi si cum agregi date calendaristice in SQL folosind INTERVAL, EXTRACT si DATE_TRUNC?",
    answer: "Trei instrumente esentiale in interogarile cotidiene:\n\n1. INTERVAL:\n- Permite adunarea sau scaderea usoara a perioadelor de timp din date calendaristice (ex: `data_creare + INTERVAL '7 days'`).\n\n2. EXTRACT (sau DATE_PART):\n- Extrage o componenta numerica specifica dintr-o data: anul, luna, ziua saptamanii (DOW), ora, minutul.\n\n3. DATE_TRUNC:\n- \"Trunchiaza\" o data la o precizie specificata (an, luna, zi), resetand componentele mai mici la inceputul perioadei.\n- Este standardul de aur pentru agregarea vanzarilor pe zi, saptamana sau luna (GROUP BY pe data trunchiata).",
    codeSnippet: `-- 1. Aflare utilizatori activi in ultimele 30 de zile:
SELECT id, email 
FROM utilizatori 
WHERE ultimul_login >= NOW() - INTERVAL '30 days';

-- 2. Raport lunar de vanzari cu DATE_TRUNC:
SELECT 
    DATE_TRUNC('month', creat_la) AS prima_zi_din_luna,
    COUNT(*) AS total_comenzi,
    SUM(valoare) AS incasari
FROM comenzi
GROUP BY DATE_TRUNC('month', creat_la)
ORDER BY prima_zi_din_luna DESC;`,
    interviewTrap: "Daca folosesti `EXTRACT(month FROM data)` pentru a grupa vanzarile din mai multi ani, luna Ianuarie 2025 si Ianuarie 2026 se vor aduna impreuna! Foloseste `DATE_TRUNC('month', data)` pentru a pastra si anul.",
    keyTakeaway: "INTERVAL adauga/scade perioade; EXTRACT scoate bucati numerice; DATE_TRUNC rotunjeste data la inceputul unitatii dorite, perfect pentru rapoarte GROUP BY."
  },
  {
    id: "sql-72",
    category: "SQL",
    difficulty: "MEDIU",
    title: "JSON vs JSONB in PostgreSQL",
    question: "Care este diferenta intre tipul JSON si tipul JSONB in PostgreSQL si de ce este preferat JSONB?",
    answer: "PostgreSQL ofera doua tipuri pentru date semi-structurate:\n\n1. JSON (Text exact):\n- Stocheaza documentul JSON ca text brut exact cum a fost trimis, inclusiv spatii albe si chei duplicate.\n- Inserarea este foarte rapida (nu parseaza/reorganizeaza).\n- Citirea si interogarea sunt LENTE (trebuie reparsat la fiecare query).\n- NU suporta indexare eficienta.\n\n2. JSONB (Binary format) - ALEGEREA STANDARD:\n- Parseaza si descompune JSON-ul intr-un format binar optimizat.\n- Elimina spatiile albe inutile si cheile duplicate.\n- Inserarea are un cost infim de parsare, dar CITIREA si FILTRAREA sunt extrem de rapide.\n- Permite INDEXARE GIN avansata pe proprietati si chei!",
    codeSnippet: `-- Creare tabela cu coloana JSONB:
CREATE TABLE setari_utilizator (
    user_id INT PRIMARY KEY,
    preferinte JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Inserare JSON valid:
INSERT INTO setari_utilizator VALUES (1, '{"tema": "dark", "notificari": true, "limba": "ro"}');`,
    interviewTrap: "Nu folosi `JSON` crezand ca e mai usor! Daca vrei sa filtrezi sau sa pui indecsi pe proprietati din interiorul documentului, `JSONB` este obligatoriu.",
    keyTakeaway: "JSON stocheaza text brut; JSONB stocheaza format binar descompus, fiind mult mai rapid la interogari si permitand indecsi GIN."
  },
  {
    id: "sql-73",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Operatori JSONB: -> vs ->> vs @>",
    question: "Cum se folosesc operatorii `->`, `->>` si `@>` pentru a interoga date din coloane JSONB?",
    answer: "Cei 3 operatori fundamentali pentru JSONB in PostgreSQL:\n\n1. Operatorul `->` (Returneaza JSON):\n- Extrage valoarea unui camp sau element dintr-un array si o returneaza ca obiect JSON / JSONB.\n- Rezultatul pastreaza ghilimelele JSON daca e sir.\n\n2. Operatorul `->>` (Returneaza TEXT):\n- Extrage valoarea unui camp si o converteste direct la sir simplu de tip TEXT.\n- Ghilimelele sunt eliminate; este operatorul corect pentru comparatii si clauze WHERE!\n\n3. Operatorul `@>` (Contine / Contains):\n- Verifica daca structura JSONB din stanga contine documentul JSON din dreapta.\n- Este operatorul cel mai performant deoarece poate folosi un index GIN direct!",
    codeSnippet: `-- 1. Operatorul ->> pentru a compara ca TEXT:
SELECT * FROM setari_utilizator 
WHERE preferinte->>'tema' = 'dark';

-- 2. Operatorul @> (JSONB contains JSONB) - compatibil cu index GIN:
SELECT * FROM setari_utilizator 
WHERE preferinte @> '{"notificari": true}'::jsonb;`,
    interviewTrap: "Daca folosesti `preferinte->'tema' = 'dark'`, query-ul va esua sau nu va gasi nimic, deoarece `->` returneaza `\"dark\"` (cu ghilimele JSON), in timp ce `->>` returneaza `dark` ca text SQL curat.",
    keyTakeaway: "`->` scoate elementul ca JSON; `->>` il scoate ca TEXT; `@>` verifica incluziunea structurii si permite utilizarea indecsilor GIN."
  },
  {
    id: "sql-74",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Indexul GIN (Generalized Inverted Index)",
    question: "Ce este un index GIN in PostgreSQL si in ce situatii este utilizat?",
    answer: "Un index GIN (Generalized Inverted Index) este o structura de index inversat, optimizata pentru coloane care contin \"valori compuse\" cu elemente multiple.\n\nCum functioneaza:\n- In loc sa mapeze un rand intreg la o singura intrare de index (ca B-Tree), GIN descompune valoarea in elemente individuale (chei JSONB, cuvinte din Full-Text Search, elemente de Array) si mapeaza fiecare element individual catre lista randurilor care il contin.\n\nCazuri de utilizare:\n1. Coloane JSONB: cautari rapide dupa chei si valori cu operatorul `@>`.\n2. Cautare Full-Text (FTS): pe coloane de tip `tsvector` pentru cautari de cuvinte in articole/documente.\n3. Coloane de tip Array (ex: `tags TEXT[]`) cu operatorul `&&` (overlap) sau `@>` (contine).",
    codeSnippet: `-- Indexare GIN pe coloana JSONB:
CREATE INDEX idx_preferinte_gin ON setari_utilizator USING gin (preferinte);

-- Acest query va folosi Bitmap Index Scan pe idx_preferinte_gin instant:
SELECT * FROM setari_utilizator 
WHERE preferinte @> '{"tema": "dark"}';`,
    interviewTrap: "Indexul GIN este mai scump la scriere (INSERT/UPDATE) decat un B-Tree, deoarece fiecare rand nou adauga multiple intrari in indexul inversat. Foloseste-l doar pe tabele citite frecvent.",
    keyTakeaway: "GIN este un index inversat perfect pentru coloane JSONB, array-uri si cautari Full-Text unde cauti elemente in interiorul unui camp compus."
  },
  {
    id: "sql-75",
    category: "SQL",
    difficulty: "USOR",
    title: "Functii Uzuale de Manipulare a Sirurilor",
    question: "Care sunt principalele functii SQL pentru manipularea sirurilor de caractere si cum se concateneaza valori cu NULL?",
    answer: "Functii frecvente la interviuri:\n1. CONCAT(str1, str2, ...) si CONCAT_WS(separator, str1, str2, ...):\n- Spre deosebire de operatorul standard `||` (unde orice concatenare cu NULL devine NULL!), functia CONCAT ignora valorile NULL!\n- CONCAT_WS adauga automat separatorul dorit doar intre valorile non-null.\n2. UPPER(s) si LOWER(s): conversie majuscule/minuscule pentru comparatii case-insensitive.\n3. TRIM(s), LTRIM, RTRIM: eliminarea spatiilor albe de la capete.\n4. SUBSTRING(s FROM start FOR length): extragerea unei portiuni din sir (indexat de la 1 in SQL!).\n5. REPLACE(s, de_inlocuit, inlocuitor): inlocuirea aparitiilor unui subsir.",
    codeSnippet: `-- Capcana operatorului || vs CONCAT:
SELECT 'Ion' || NULL;        -- Rezultat: NULL!
SELECT CONCAT('Ion', NULL);  -- Rezultat: 'Ion'

-- Concatenare nume complet curata cu separator:
SELECT CONCAT_WS(' ', prenume, al_doilea_prenume, nume) AS nume_complet 
FROM clienti;`,
    interviewTrap: "Indexarea caracterelor in SQL incepe de la 1, NU de la 0 ca in Java sau C#! `SUBSTRING('ABCD', 1, 2)` returneaza `'AB'`.",
    keyTakeaway: "CONCAT si CONCAT_WS sunt sigure cu valorile NULL, spre deosebire de operatorul `||` care devine NULL daca oricare operand este NULL."
  },
  {
    id: "sql-76",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Agregare de Siruri: STRING_AGG si ARRAY_AGG",
    question: "Cum imbini valorile mai multor randuri intr-un singur sir sau intr-un array la nivel de grup?",
    answer: "Cand folosim GROUP BY si dorim sa adunam toate valorile text ale unui grup intr-un singur rezultat:\n\n1. STRING_AGG(coloana, delimitator [ORDER BY ...]) (in PostgreSQL / GROUP_CONCAT in MySQL):\n- Concateneaza toate valorile non-null ale grupului intr-un singur text separat prin delimitatorul ales (ex: virgula).\n- Permite ordonarea elementelor chiar in interiorul agregarii.\n\n2. ARRAY_AGG(coloana [ORDER BY ...]):\n- Colecteaza valorile randurilor intr-un tablou nativ SQL (Array).\n- Excelent cand dorim sa serializam rezultatele catre aplicatia backend (ex: o lista de roluri pentru fiecare utilizator).",
    codeSnippet: `-- Afisare fiecarui client cu lista cursurilor absolvite ordonate alfabetic:
SELECT 
    u.nume,
    STRING_AGG(c.titlu, ', ' ORDER BY c.titlu) AS cursuri_absolvite,
    ARRAY_AGG(c.id) AS cursuri_ids
FROM utilizatori u
JOIN inscrieri i ON u.id = i.user_id
JOIN cursuri c ON i.curs_id = c.id
GROUP BY u.id, u.nume;`,
    interviewTrap: "Daca ai duplicari din cauza join-urilor multiple, poti pune DISTINCT in interiorul functiei de agregare: `STRING_AGG(DISTINCT tag, ', ')`.",
    keyTakeaway: "STRING_AGG transforma randurile unui grup intr-un sir delimitat de virgule, iar ARRAY_AGG le impacheteaza intr-un tablou SQL."
  },
  {
    id: "sql-77",
    category: "SQL",
    difficulty: "USOR",
    title: "COALESCE in Generarea Rapoartelor Financiare",
    question: "De ce este functia COALESCE critica la generarea rapoartelor cu LEFT JOIN si sume agregate?",
    answer: "Cand facem un LEFT JOIN intre o tabela parinte (ex: clienti) si o tabela copil (ex: comenzi) pentru a afisa volumul de vanzari al fiecarui client:\n- Daca un client NU are comenzi plasate, valorile din tabela comenzi sunt NULL.\n- Functia de agregare `SUM(c.valoare)` va returna NULL pentru acel client (nu 0!).\n- Orice calcul matematic ulterior aplicat pe NULL (ex: comision sau total cu TVA) va rezulta in NULL, stricand raportul!\n\nSolutie:\n- `COALESCE(SUM(c.valoare), 0)` converteste orice rezultat NULL in valoarea 0.",
    codeSnippet: `SELECT 
    cli.id,
    cli.nume,
    COALESCE(COUNT(com.id), 0) AS numar_comenzi,
    COALESCE(SUM(com.total), 0.00) AS total_cheltuit
FROM clienti cli
LEFT JOIN comenzi com ON cli.id = com.client_id
GROUP BY cli.id, cli.nume;`,
    interviewTrap: "Daca pui COALESCE inainte de SUM, adica `SUM(COALESCE(com.total, 0))`, si clientul nu are niciun rand, rezultatul SUM pe zero randuri este in continuare NULL! COALESCE trebuie aplicat pe REZULTATUL functiei de agregare: `COALESCE(SUM(total), 0)`.",
    keyTakeaway: "Aplica intotdeauna `COALESCE(SUM(...), 0)` pe rezultatele join-urilor de tip LEFT JOIN pentru a nu afisa celule goale sau erori de calcul in rapoarte."
  },
  {
    id: "sql-78",
    category: "SQL",
    difficulty: "MEDIU",
    title: "UPSERT: INSERT ... ON CONFLICT",
    question: "Ce este o operatie de UPSERT si cum se implementeaza nativ in PostgreSQL si MySQL?",
    answer: "UPSERT este o fuziune intre UPDATE si INSERT:\n\"Daca randul nu exista, insereaza-l. Daca exista deja (pe baza unei constrangeri unice/PK), actualizeaza-l!\"\n\nImplementare in PostgreSQL (standard modern):\n- `INSERT INTO ... ON CONFLICT (coloana_unica) DO UPDATE SET ...`\n- Pentru a prelua valorile noi propuse la inserare, se foloseste pseudo-tabela `EXCLUDED`.\n- Daca vrem sa ignoram duplicatele fara eroare: `ON CONFLICT DO NOTHING`.\n\nImplementare in MySQL:\n- `INSERT INTO ... ON DUPLICATE KEY UPDATE col = VALUES(col)`.\n\nBeneficiu:\n- Evita race condition-ul clasic dintre un SELECT prealabil si un INSERT ulterior pe thread-uri concurente.",
    codeSnippet: `-- PostgreSQL UPSERT atom:
INSERT INTO statistici_zilnice (ziua, vizite)
VALUES ('2026-10-02', 1)
ON CONFLICT (ziua)
DO UPDATE SET vizite = statistici_zilnice.vizite + EXCLUDED.vizite;

-- Daca exista deja randul pentru azi, incrementeaza vizitele cu valoarea noua propusa!`,
    interviewTrap: "Pentru ca `ON CONFLICT (coloana)` sa functioneze, pe acea coloana TREBUIE sa existe deja o constrangere UNIQUE sau PRIMARY KEY in schema tabelei!",
    keyTakeaway: "UPSERT rezolva atomic race condition-ul de inserare vs actualizare folosind clauza standard `ON CONFLICT (cheie) DO UPDATE`."
  },
  {
    id: "sql-79",
    category: "SQL",
    difficulty: "USOR",
    title: "Clauza RETURNING in PostgreSQL",
    question: "Ce face clauza RETURNING si cum elimina nevoia de a rula un al doilea SELECT dupa o scriere?",
    answer: "Clauza `RETURNING` (nativa in PostgreSQL) permite returnarea imediata a valorilor generate sau modificate in cadrul aceleiasi operatii DML (INSERT, UPDATE sau DELETE).\n\nAvantaje:\n1. La INSERT: Poti returna instant ID-ul auto-incrementat (SERIAL / IDENTITY) sau campurile generate implicit (ex: created_at DEFAULT NOW()).\n2. La UPDATE: Poti intoarce starea finala a randurilor modificate direct catre aplicatie fara un al doilea SELECT.\n3. La DELETE: Poti returna randurile care tocmai au fost sterse (util pentru arhivare sau istoric).\n4. Economiseste un intreg Round-Trip de retea (Network latency) intre aplicatia Java si baza de date.",
    codeSnippet: `-- Inserare si recuperare instant a ID-ului generat:
INSERT INTO comenzi (client_id, total)
VALUES (101, 249.99)
RETURNING id, data_creare;

-- Actualizare sold si returnare valoare noua intr-o singura comanda:
UPDATE conturi 
SET sold = sold - 50 
WHERE id = 1 
RETURNING sold;`,
    interviewTrap: "In MySQL nu exista clauza RETURNING pe INSERT clasic (trebuie folosit `LAST_INSERT_ID()`). RETURNING este una dintre cele mai iubite facilitati din PostgreSQL.",
    keyTakeaway: "Clauza RETURNING intoarce datele inserate/actualizate/sterse direct din operatia DML, economisind un query separat de SELECT."
  },
  {
    id: "sql-80",
    category: "SQL",
    difficulty: "MEDIU",
    title: "SAVEPOINT si Rollback Partial",
    question: "Ce este un SAVEPOINT intr-o tranzactie SQL si cum permite tratarea erorilor fara a anula toata tranzactia?",
    answer: "Un SAVEPOINT este un marcator (\"checkpoint\") intermediar creat in interiorul unei tranzactii active.\n\nCum functioneaza:\n- Intr-o tranzactie lunga cu 10 pasi, poti defini un `SAVEPOINT sp1;` inainte de pasul 8.\n- Daca pasul 8 esueaza, poti executa `ROLLBACK TO SAVEPOINT sp1;`.\n- Efect: Doar modificarile de la pasul 8 sunt anulate, dar primii 7 pasi raman valizi si tranzactia poate continua catre COMMIT!\n\nDe ce este important in PostgreSQL:\n- Daca o instructiune SQL arunca o eroare intr-o tranzactie Postgres, toata tranzactia intra in starea \"ABORTED\". Nicio alta comanda nu mai este acceptata decat ROLLBACK total, CU EXCEPTIA cazului in care ai setat un SAVEPOINT inainte de comanda cu eroare!",
    codeSnippet: `BEGIN;
INSERT INTO comenzi (id, total) VALUES (1, 100); -- Pas 1: reusit

SAVEPOINT inainte_de_notificare;

-- Incercam un pas optional care s-ar putea sa esueze:
INSERT INTO notificari (id, mesaj) VALUES (1, 'Comanda plasata');

-- Daca a esuat pasul 2:
ROLLBACK TO SAVEPOINT inainte_de_notificare;

-- Pasul 1 ramane intact si putem da COMMIT:
COMMIT;`,
    interviewTrap: "Savepoint-urile consuma resurse pe server daca sunt imbricate excesiv. Elibereaza-le cu `RELEASE SAVEPOINT nume;` cand nu mai sunt necesare.",
    keyTakeaway: "SAVEPOINT permite anularea selectiva a unei portiuni dintr-o tranzactie in caz de eroare, fara a pierde munca operatiunilor anterioare reusite."
  },
  {
    id: "sql-81",
    category: "SQL",
    difficulty: "USOR",
    title: "Constrangerea CHECK (Validare la Nivel de Schema)",
    question: "Ce este o constrangere CHECK si de ce validarile trebuie puse si in baza de date, nu doar in codul Java/Spring?",
    answer: "Constrangerea CHECK este o regula de integritate definita la nivelul tabelei care valideaza ca valorile inserate sau actualizate pe o coloana respecta o expresie booleana.\n\nDe ce este vitala in baza de date (chiar daca avem validari in Java):\n1. \"Defense in Depth\": Codul din aplicatie poate avea bug-uri sau poate fi ocolit de un script de migrare, un job manual sau un coleg care ruleaza un update direct din DBeaver/pgAdmin.\n2. Constrangerea din DB este garantul suprem ca niciodata nu vor exista date invalide pe disc (ex: varsta negativa, pret zero, procentaj > 100%).\n\nRegula booleana a CHECK:\n- Accepta randul daca expresia este TRUE sau UNKNOWN (NULL).\n- Respinge randul doar daca expresia este strict FALSE.",
    codeSnippet: `CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    titlu VARCHAR(100) NOT NULL,
    pret NUMERIC(10, 2) NOT NULL,
    reducere_procent INT DEFAULT 0,
    CONSTRAINT chk_pret_pozitiv CHECK (pret > 0),
    CONSTRAINT chk_reducere_valida CHECK (reducere_procent BETWEEN 0 AND 100)
);`,
    interviewTrap: "Daca o valoare dintr-o expresie CHECK este NULL, rezultatul este UNKNOWN, iar constrangerea CHECK o lasa sa treaca! De aceea, adauga intotdeauna NOT NULL daca campul este obligatoriu.",
    keyTakeaway: "Constrangerea CHECK asigura validarea matematica si logica a datelor direct la nivelul motorului relational, prevenind coruperea datelor."
  },
  {
    id: "sql-82",
    category: "SQL",
    difficulty: "USOR",
    title: "Capcana Fatala: UPDATE si DELETE Fara WHERE",
    question: "Ce se intampla daca rulezi UPDATE sau DELETE fara clauza WHERE si ce mecanisme de protectie exista?",
    answer: "Consecinta:\n- In SQL standard, comanda `UPDATE tabela SET coloana = valoare;` sau `DELETE FROM tabela;` FARA clauza WHERE se va aplica pe TOATE randurile din tabela!\n- Este unul dintre cele mai intalnite si dezastruoase accidente umane din productie.\n\nProtectii si bune practici:\n1. Regula TRANZACTIEI OBLIGATORII in clientul SQL:\n   - Ruleaza intotdeauna `BEGIN;` inainte.\n   - Verifica numarul de randuri afectate raportat de server (ex: \"Updated 1 row\" vs \"Updated 1500000 rows\").\n   - Daca e gresit, da instant `ROLLBACK;`.\n2. MySQL Safe Updates (`SET sql_safe_updates = 1;`):\n   - Refuza executarea de UPDATE sau DELETE daca query-ul nu include o clauza WHERE bazata pe o cheie primara sau indexata.\n3. Soft Delete:\n   - Folosirea unei coloane `is_deleted BOOLEAN` in loc de stergere fizica permanenta.",
    codeSnippet: `-- Procedura corecta de siguranta la mentenanta manuala:
BEGIN;
UPDATE utilizatori SET status = 'INACTIV' WHERE id = 452;
-- Verificam: daca serverul raporteaza 1 rand afectat:
COMMIT;
-- Daca scrie 50.000 de randuri afectate:
-- ROLLBACK;`,
    interviewTrap: "O intrebare frecventa de junior: \"Cum anulez un UPDATE dat fara tranzactie pe productie daca nu am backup?\" Raspuns realist: Nu poti din comanda SQL; trebuie restaurat un snapshot Point-In-Time-Recovery (PITR) din WAL sau backup!",
    keyTakeaway: "Fara WHERE, operatiile DML afecteaza intreaga tabela; foloseste intotdeauna tranzactii explicite (BEGIN/ROLLBACK) cand testezi sau rulezi modificari manuale."
  },
  {
    id: "sql-83",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Statistici si Planificatorul de Interogari: Comanda ANALYZE",
    question: "Ce rol au statisticile din baza de date si de ce este necesara comanda ANALYZE?",
    answer: "Cum alege baza de date cel mai rapid plan de executie:\n- Planificatorul bazat pe costuri (Cost-Based Optimizer - CBO) nu ghiceste la intamplare.\n- El consulta tabelele interne de statistici (ex: `pg_statistic` in Postgres) care retin: numarul estimat de randuri, distributia valorilor pe coloane (histograme), numarul de valori distincte (cardinalitate) si procentul de valori NULL.\n\nCe face comanda ANALYZE:\n- Scaneaza esantioane din tabele si actualizeaza aceste statistici interne.\n\nCand apar probleme:\n- Daca o tabela a primit un import masiv de 5 milioane de randuri si statisticile nu au fost reimprospatate, planificatorul crede ca tabela are 100 de randuri si alege un Nested Loop sau Seq Scan, facand un query simplu sa ruleze in zeci de secunde in loc de milisecunde!",
    codeSnippet: `-- Reimprospatare statistici pentru optimizator in PostgreSQL:
ANALYZE nume_tabela;

-- Sau verificare plan inainte si dupa:
EXPLAIN ANALYZE SELECT * FROM comenzi WHERE status = 'EXPEDIAT';`,
    interviewTrap: "Comanda `ANALYZE` nu modifica si nu blocheaza datele din tabele (spre deosebire de VACUUM FULL). Ea aduna doar metrici statistice pentru optimizator.",
    keyTakeaway: "ANALYZE reimprospateaza statisticile si histogramele de distributie a datelor, ajutand optimizatorul sa aleaga planul corect de executie."
  },
  {
    id: "sql-84",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Cand este Sequential Scan Mai Rapid Decat Index Scan?",
    question: "De ce alege motorul de baza de date un Sequential Scan chiar daca exista un index pe coloana filtrata?",
    answer: "Exista doua motive majore pentru care planificatorul prefera un Sequential Scan (parcurgere secventiala a intregii tabele):\n\n1. Selectivitate scazuta (Interogarea returneaza o mare parte din tabela):\n- Daca un query returneaza peste 20-30% din totalul randurilor unei tabele, un Index Scan devine MULT MAI LENT decat Seq Scan!\n- Motiv: Index Scan necesita citirea blocurilor din index, urmata de citiri aleatorii (random I/O) pe paginile tabelei pentru fiecare rand. Seq Scan citeste discul continuu si secvential (sequential I/O cu readahead la nivel de OS/SSD).\n\n2. Tabele foarte mici:\n- Daca tabela are cateva zeci sau sute de randuri (incape intr-o singura pagina de disc de 8KB), parcurgerea directa a tabelei necesita 1 singura citire, pe cand indexul ar necesita 2 sau 3 citiri.",
    codeSnippet: `-- Exemplu coloana cu doar 2 valori posibile (Sex sau Activ: 50% TRUE, 50% FALSE):
-- Chiar daca pui index pe "activ", urmatorul query va face SEQ SCAN:
SELECT * FROM utilizatori WHERE activ = TRUE;
-- Optimizatorul stie ca jumatate din tabela e TRUE si evita accesul dublu index + heap!`,
    interviewTrap: "Multi juniori sunt convinsi ca \"daca exista index, baza de date TREBUIE sa-l foloseasca\". Fals! Optimizatorul alege mereu calea cu cel mai mic COST estimat de operatii I/O.",
    keyTakeaway: "Daca rezultatul contine o proportie mare din tabela sau tabela este mica, citirea secventiala este mult mai rapida decat salturile aleatorii generate de un Index Scan."
  },
  {
    id: "sql-85",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Ordinea Coloanelor intr-un Index Compus (B-Tree)",
    question: "Cum se alege ordinea corecta a coloanelor la crearea unui Index Compus (Multi-column Index)?",
    answer: "Regula de aur pentru ordonarea coloanelor intr-un index compus `CREATE INDEX idx ON t (colA, colB, colC)`:\n\n1. \"Equality First\":\n- Plaseaza primele coloanele care apar cel mai frecvent in clauza WHERE cu operator de egalitate exacta (`colA = valoare`).\n\n2. \"Range Later\":\n- Plaseaza coloanele filtrate prin intervale (`>`, `<`, `BETWEEN`, `LIKE \\'prefix%\\'`) dupa coloanele de egalitate.\n- Odata ce optimizatorul intalneste o conditie de interval pe prima coloana din index, nu mai poate folosi eficient ramurile urmatoare ale arborelui B-Tree pentru a doua coloana!\n\n3. \"High Cardinality First\" (pentru egalitati):\n- Daca ambele coloane sunt de egalitate, coloana cu mai multe valori distincte (cardinalitate mai mare) este de regula plasata prima pentru a reduce spatiul de cautare cel mai rapid.",
    codeSnippet: `-- Query frecvent:
-- SELECT * FROM comenzi WHERE status = 'FINALIZAT' AND data_plasare >= '2026-01-01';

-- INDEX CORECT (Egalitate prima, intervalul dupa):
CREATE INDEX idx_comenzi_status_data ON comenzi (status, data_plasare);

-- INDEX SUBOPTIM (inversat): indexul filtreaza pe data, dar nu mai poate exploata optim status-ul!`,
    interviewTrap: "Daca pui coloana de interval prima `(data_plasare, status)`, indexul va gasi toate datele dupa 2026, dar pentru status va trebui sa scaneze fiecare nod din acel interval!",
    keyTakeaway: "Intr-un index compus, pune coloanele cu egalitate (`=`) primele si coloanele cu intervale (`>`, `<`, `BETWEEN`) la final."
  },
  {
    id: "sql-86",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Concepte MVCC: Dead Tuples si Comanda VACUUM in PostgreSQL",
    question: "Ce sunt \"Dead Tuples\" in PostgreSQL, de ce apar si ce rol are procesul de VACUUM?",
    answer: "1. De ce apar Dead Tuples (Tupluri Moarte):\n- Datorita arhitecturii MVCC, cand executi `UPDATE`, vechiul rand nu este sters fizic, ci este marcat ca expirat (xmax setat cu ID-ul tranzactiei), iar un nou rand este adaugat la sfarsitul tabelei.\n- Cand executi `DELETE`, randul este doar marcat ca sters.\n- Aceste versiuni vechi devin \"dead tuples\" in momentul in care nicio tranzactie activa nu mai are nevoie sa le vada.\n\n2. Ce face comanda VACUUM:\n- Identifica si elibereaza spatiul ocupat de dead tuples, marcandu-l ca \"reutilizabil\" pentru viitoarele INSERT-uri din aceeasi tabela.\n- Reimprospateaza Visibility Map (esential pentru Index-Only Scans).\n\n3. De ce este vital autovacuum:\n- Fara autovacuum, tabelele ar suferi de o crestere exploziva pe disc (\"table bloat\"), iar scanarile ar citi milioane de randuri moarte, incetinind masiv baza de date.",
    codeSnippet: `-- Rulare manuala de vacuum simplu (nu blocheaza cititorii sau scriitorii):
VACUUM utilizatori;

-- Rulare combinata de eliberare spatiu + actualizare statistici:
VACUUM ANALYZE utilizatori;

-- ATENTIE: VACUUM FULL rescrie tabela si recupereaza spatiul catre OS, dar ia lacat exclusiv!`,
    interviewTrap: "`VACUUM` simplu NU returneaza spatiul pe disc inapoi catre sistemul de operare! El doar marcheaza paginile interne ca reutilizabile pentru PostgreSQL.",
    keyTakeaway: "Dead tuples sunt versiuni vechi de randuri lasate in urma de UPDATE/DELETE; VACUUM curata aceste tupluri si previne umflarea inutila a tabelelor (bloat)."
  },
  {
    id: "sql-87",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Paginare Keyset (Seek Method) vs Paginare OFFSET",
    question: "De ce devine `LIMIT 50 OFFSET 1000000` extrem de lent si cum rezolva Paginarea Keyset aceasta problema?",
    answer: "1. De ce este lent OFFSET la pagini mari (O(N)):\n- Cand executi `LIMIT 50 OFFSET 1000000`, motorul de baza de date NU sare direct la pozitia 1.000.000.\n- El trebuie sa parcurga si sa citeasca in memorie toate cele 1.000.000 de randuri anterioare, sa le arunce la gunoi, si abia apoi sa le returneze pe urmatoarele 50!\n- Pe tabele mari, la pagina 10.000, interogarea poate dura zeci de secunde.\n\n2. Ce este Paginarea Keyset (Seek Method / Cursor Paging - O(1)):\n- In loc sa sari peste un numar de randuri, retii ultimul ID (sau valoarea cheii) de pe pagina precedenta.\n- Urmatoarea pagina filtreaza direct cu `WHERE id > :ultimul_id ORDER BY id ASC LIMIT 50`.\n- Optimizatorul coboara instant in arborele B-Tree la acea valoare in O(log N) sau O(1) si citeste fix cele 50 de randuri necesare!",
    codeSnippet: `-- LENT la numere mari (O(N)):
SELECT * FROM comenzi ORDER BY id LIMIT 50 OFFSET 500000;

-- RAPID SI SCALABIL (O(1) cu index pe id):
-- Aplicatia trimite la urmatorul request parametrul last_seen_id = 500000:
SELECT * FROM comenzi 
WHERE id > 500000 
ORDER BY id ASC 
LIMIT 50;`,
    interviewTrap: "Paginarea Keyset este ideala pentru \"Infinite Scroll\" sau iterari masive de API-uri, dar nu permite saritul direct la o pagina arbitrara (ex: \"sari direct la pagina 345\") fara a sti cheia intermediara.",
    keyTakeaway: "OFFSET parcurge si arunca inutil N randuri; Paginarea Keyset foloseste `WHERE id > last_seen_id` si B-Tree pentru performanta constanta O(1) indiferent de adancime."
  },
  {
    id: "sql-88",
    category: "SQL",
    difficulty: "USOR",
    title: "Optiuni ON DELETE: CASCADE vs SET NULL vs RESTRICT",
    question: "Care este diferenta intre CASCADE, SET NULL si RESTRICT la stergerea unei inregistrari parinte intr-o relatie Foreign Key?",
    answer: "Comportamente la comanda DELETE pe tabela parinte:\n\n1. ON DELETE CASCADE:\n- Cand un parinte este sters (ex: utilizator), baza de date sterge AUTOMAT toate inregistrarile copil asociate (ex: toate profilele, token-urile sau setarile sale).\n- Atentie: poate duce la stergeri masive in lant accidentale!\n\n2. ON DELETE SET NULL:\n- Cand parintele este sters, coloana Foreign Key din randurile copil este setata automat pe NULL.\n- Copiii devin inregistrari \"orfane\" dar raman salvate (coloana FK trebuie sa permita NULL).\n\n3. ON DELETE RESTRICT (sau NO ACTION):\n- Comportamentul implicit de protectie.\n- Daca incerci sa stergi parintele si exista chiar si un singur copil asociat, baza de date BLOCEAZA operatia si arunca o eroare de violare a integritatii referentiale!",
    codeSnippet: `CREATE TABLE comenzi (
    id SERIAL PRIMARY KEY,
    client_id INT REFERENCES clienti(id) ON DELETE RESTRICT 
    -- Refuza stergerea unui client daca acesta are comenzi istorice!
);

CREATE TABLE token_sesiune (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES utilizatori(id) ON DELETE CASCADE
    -- Daca utilizatorul se sterge, sesiunile lui se sterg automat!
);`,
    interviewTrap: "Diferenta intre RESTRICT si NO ACTION: in PostgreSQL, NO ACTION permite verificarea integritatii la finalul tranzactiei daca constrangerea este DEFERRABLE, in timp ce RESTRICT verifica instant.",
    keyTakeaway: "CASCADE propaga stergerea copiilor; SET NULL pastreaza copiii dar le seteaza parintele null; RESTRICT respinge ferm stergerea daca exista dependente."
  },
  {
    id: "sql-89",
    category: "SQL",
    difficulty: "USOR",
    title: "Constrangere UNIQUE vs Indecsi Unici si Tratarea NULL",
    question: "Cum trateaza constrangerea UNIQUE valorile multiple de NULL in SQL standard si PostgreSQL?",
    answer: "Comportamentul standard SQL pentru constrangerile UNIQUE si NULL:\n\n1. In SQL Standard si PostgreSQL:\n- Conform logicii relationale, `NULL nu este egal cu alt NULL` (NULL = NULL este UNKNOWN).\n- Din acest motiv, o coloana cu constrangere UNIQUE poate contine ORICATE randuri cu valoarea NULL!\n- Nu se considera duplicat inserarea a 10 randuri cu valoarea NULL pe o coloana UNIQUE.\n\n2. Noutate PostgreSQL 15+:\n- A fost introdusa clauza `UNIQUE NULLS NOT DISTINCT`.\n- Daca este specificata, PostgreSQL va trata valorile NULL ca fiind egale intre ele, refuzand al doilea rand cu NULL!",
    codeSnippet: `-- Comportament clasic (permite o infinitate de NULL-uri):
CREATE TABLE utilizatori (
    id SERIAL PRIMARY KEY,
    cnp VARCHAR(13) UNIQUE -- Poti avea 100 de utilizatori straini cu cnp = NULL
);

-- Comportament strict (Postgres 15+):
CREATE TABLE coduri_speciale (
    id SERIAL PRIMARY KEY,
    cod VARCHAR(50) UNIQUE NULLS NOT DISTINCT -- Permite maxim UN SINGUR NULL!
);`,
    interviewTrap: "In baza de date Microsoft SQL Server (veche), o coloana UNIQUE accepta doar un singur NULL in mod implicit, incalcand standardul ANSI SQL! La interviuri pe PostgreSQL/MySQL este esential sa stii ca NULL-urile multiple sunt permise implicit.",
    keyTakeaway: "Implicit, constrangerea UNIQUE permite valori multiple de NULL deoarece `NULL != NULL`. Daca vrei unicitate stricta fara NULL-uri, adauga NOT NULL."
  },
  {
    id: "sql-90",
    category: "SQL",
    difficulty: "USOR",
    title: "LIMIT vs Standardul ANSI FETCH FIRST n ROWS ONLY",
    question: "Care este diferenta intre clauza LIMIT si standardul ANSI SQL `FETCH FIRST n ROWS ONLY`?",
    answer: "1. Clauza LIMIT:\n- A fost popularizata de MySQL si PostgreSQL.\n- Este extrem de scurta si comoda (`LIMIT 10 OFFSET 20`).\n- Dezavantaj: NU face parte din standardul oficial ANSI SQL vechi (Oracle si SQL Server nu au suportat mult timp cuvantul cheie LIMIT).\n\n2. Clauza FETCH FIRST n ROWS ONLY:\n- A fost introdusa oficial in standardul ANSI SQL:2008.\n- Este suportata in prezent de toate marile motoare de baze de date (PostgreSQL, Oracle 12c+, SQL Server 2012+, DB2).\n- Ofera functionalitati avansate, cum ar fi `WITH TIES` (include si randurile care au aceeasi valoare la ORDER BY ca ultimul element selectat).",
    codeSnippet: `-- Varianta PostgreSQL / MySQL (comoda):
SELECT * FROM produse ORDER BY pret DESC LIMIT 5;

-- Varianta standard ANSI SQL:2008 (portabila):
SELECT * FROM produse 
ORDER BY pret DESC 
OFFSET 0 ROWS 
FETCH FIRST 5 ROWS ONLY;

-- Exemplu WITH TIES (daca locul 5 si locul 6 au acelasi pret, le returneaza pe ambele):
SELECT * FROM angajati 
ORDER BY salariu DESC 
FETCH FIRST 5 ROWS WITH TIES;`,
    interviewTrap: "La interviuri, daca intreaba de portabilitate maxima intre baze de date (Oracle, DB2, Postgres), mentioneaza clauza standard `OFFSET ... FETCH FIRST n ROWS ONLY`.",
    keyTakeaway: "LIMIT este sintaxa populara Postgres/MySQL; `FETCH FIRST n ROWS ONLY` este standardul oficial ANSI SQL si suporta optiunea puternica `WITH TIES`."
  },
  {
    id: "sql-91",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Clauza FILTER in Functii de Agregare",
    question: "Ce este clauza FILTER (WHERE ...) aplicata functiilor de agregare si de ce este superioara constructiei CASE WHEN?",
    answer: "In SQL standard si PostgreSQL, clauza `FILTER (WHERE conditie)` permite aplicarea unei filtrari specifice direct pe o functie de agregare (SUM, COUNT, AVG), fara a filtra randurile intregii interogari.\n\nDe ce este superioara vechii abordari `SUM(CASE WHEN ... THEN 1 END)`:\n1. Lizibilitate mult mai curata si declarativa: Intentia este evidenta imediat.\n2. Standard SQL:2003 oficial.\n3. Eficienta si optimizare mai buna in planificatorul de executie.\n4. Permite calcularea mai multor metrici conditionate complet diferite intr-un singur query cu o singura parcurgere a tabelei.",
    codeSnippet: `-- Varianta eleganta moderna cu FILTER:
SELECT 
    departament_id,
    COUNT(*) AS total_angajati,
    COUNT(*) FILTER (WHERE activ = TRUE) AS angajati_activi,
    COUNT(*) FILTER (WHERE activ = FALSE) AS angajati_inactivi,
    SUM(salariu) FILTER (WHERE gen = 'F') AS salarii_femei,
    SUM(salariu) FILTER (WHERE gen = 'M') AS salarii_barbati
FROM angajati
GROUP BY departament_id;`,
    interviewTrap: "In MySQL (pana in v8.0), clauza FILTER nu este suportata, fiind necesara in continuare utilizarea `SUM(CASE WHEN ...)`. In PostgreSQL este un standard iubit.",
    keyTakeaway: "Clauza `FILTER (WHERE ...)` simplifica agregarile conditionate multiple intr-o singura instructiune SELECT fara case-uri imbricate greoaie."
  },
  {
    id: "sql-92",
    category: "SQL",
    difficulty: "USOR",
    title: "SQL Injection (SQLi) si PreparedStatement",
    question: "Cum functioneaza o vulnerabilitate de SQL Injection si de ce PreparedStatement previne complet acest atac?",
    answer: "1. Cum functioneaza SQL Injection:\n- Apare atunci cand datele introduse de un utilizator sunt concatenate direct ca text in comanda SQL fara validare sau parametrizare.\n- Un atacator introduce secvente de control SQL (ex: `' OR '1'='1' --`), schimband logica arborelui de parsare a interogarii.\n\n2. Cum previne PreparedStatement / Interogarile Parametrizate atacul:\n- Baza de date compileaza si stabileste Planul de Executie al comenzii SQL INAINTE de a primi valorile parametrilor.\n- Cand parametrii sunt trimisi ulterior prin protocolul bazei de date, ei sunt tratati STRICT CA DATE LITERALE (valori), si niciodata ca instructiuni sau cuvinte cheie SQL executabile!\n- Chiar daca parametrul contine `' OR 1=1 --`, baza de date doar cauta un utilizator al carui nume contine fizic acel text.",
    codeSnippet: `// VULNERABIL la SQL Injection (Concatenare siruri):
String sql = "SELECT * FROM users WHERE user = '" + inputUser + "' AND pass = '" + inputPass + "'";

// SIGUR (PreparedStatement cu bind parameters):
String sql = "SELECT * FROM users WHERE user = ? AND pass = ?";
PreparedStatement stmt = conn.prepareStatement(sql);
stmt.setString(1, inputUser);
stmt.setString(2, inputPass);`,
    interviewTrap: "Sanitizarea manuala a caracterelor (inlocuirea ghilimelelor cu regex) NU este suficienta si poate fi ocolita! Singura protectie 100% sigura impotriva SQLi sunt interogarile parametrizate (Prepared Statements / ORM parameter binding).",
    keyTakeaway: "PreparedStatement separa faza de compilare a codului SQL de trimiterea datelor; parametrii nu pot deveni niciodata instructiuni executabile."
  },
  {
    id: "sql-93",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Logica Trivalenta (Three-Valued Logic): TRUE, FALSE, UNKNOWN",
    question: "Ce este logica trivalenta in SQL si cum influenteaza evaluarile logice cu UNKNOWN?",
    answer: "In SQL exista 3 valori de adevar posibile:\n1. TRUE\n2. FALSE\n3. UNKNOWN (rezultatul oricarei comparatii care implica NULL, ex: `NULL = 5` sau `NULL = NULL`).\n\nTabela de adevar esentiala cu UNKNOWN:\n- `AND`:\n  - TRUE AND UNKNOWN = UNKNOWN\n  - FALSE AND UNKNOWN = FALSE (deoarece false anuleaza tot)\n  - UNKNOWN AND UNKNOWN = UNKNOWN\n- `OR`:\n  - TRUE OR UNKNOWN = TRUE (true este suficient)\n  - FALSE OR UNKNOWN = UNKNOWN\n- `NOT`:\n  - NOT UNKNOWN = UNKNOWN (inversul lui necunoscut este tot necunoscut!)\n\nImpact in clauza WHERE:\n- Clauza WHERE pastreaza randurile DOAR daca conditia se evalueaza la strict TRUE.\n- Daca rezultatul este UNKNOWN sau FALSE, randul este respins!",
    codeSnippet: `-- Daca tabela are un rand cu salariu = NULL:
SELECT * FROM angajati WHERE salariu < 5000;
-- Conditia este UNKNOWN, randul NU apare!

SELECT * FROM angajati WHERE NOT (salariu < 5000);
-- NOT UNKNOWN este tot UNKNOWN, deci randul NU apare nici aici!
-- Salariatul cu salariu NULL dispare din ambele rapoarte opuse!`,
    interviewTrap: "Daca neghezi o conditie cu NOT sperand ca vei prinde restul multimii, nu vei prinde niciodata randurile cu NULL! Trebuie sa adaugi explicit `OR col IS NULL`.",
    keyTakeaway: "Orice operatie cu NULL returneaza UNKNOWN. In clauza WHERE trec doar randurile strict TRUE; atat FALSE cat si UNKNOWN sunt eliminate."
  },
  {
    id: "sql-94",
    category: "SQL",
    difficulty: "USOR",
    title: "COUNT(*) vs COUNT(DISTINCT coloana)",
    question: "Care este diferenta de functionare si de performanta intre `COUNT(*)` si `COUNT(DISTINCT coloana)`?",
    answer: "1. Modul de functionare:\n- `COUNT(*)` numara toate randurile returnate de query, indiferent daca coloanele contin sau nu NULL.\n- `COUNT(DISTINCT coloana)` numara valorile UNICE din acea coloana, ignorand complet valorile NULL (NULL nu este numarat nici macar o data!).\n\n2. Impact de performanta:\n- `COUNT(*)` parcurge tabela sau indexul si numara pointerii de randuri.\n- `COUNT(DISTINCT coloana)` este MULT MAI COSTISITOR: motorul trebuie sa aduca valorile in memorie, sa le sorteze sau sa foloseasca o tabela Hash interna (HashAggregate) pentru a elimina duplicatele inainte de numarare.",
    codeSnippet: `-- Tabela comenzi: 5 randuri, client_id: [1, 1, 2, NULL, 2]
SELECT COUNT(*) FROM comenzi;            -- Rezultat: 5
SELECT COUNT(client_id) FROM comenzi;    -- Rezultat: 4 (ignora NULL)
SELECT COUNT(DISTINCT client_id) FROM comenzi; -- Rezultat: 2 (doar clientii 1 si 2)`,
    interviewTrap: "Daca intrebi \"Cati clienti unici avem in comenzi?\", `COUNT(DISTINCT client_id)` nu numara comenzile facute de vizitatori anonimi (cu client_id = NULL). Daca doresti sa numeri si anonimul ca o categorie, trebuie tratat cu COALESCE.",
    keyTakeaway: "COUNT(*) numara toate randurile; COUNT(DISTINCT col) ignora NULL-urile si elimina duplicatele, fiind considerabil mai scump ca timp si memorie."
  },
  {
    id: "sql-95",
    category: "SQL",
    difficulty: "USOR",
    title: "Identificarea Inregistrarilor Duplicate in SQL",
    question: "Cum gasesti toate inregistrarile duplicate dintr-o tabela pe baza unei coloane sau a unui grup de coloane?",
    answer: "Modelul clasic de interviu pentru gasirea duplicatelor:\n\n1. Folosirea clauzei `GROUP BY` pe coloanele dupa care se verifica duplicarea (ex: email sau cnp).\n2. Folosirea clauzei `HAVING COUNT(*) > 1` pentru a filtra exclusiv grupurile care apar de cel putin doua ori.\n\nDaca se cere returnarea tuturor randurilor complete duplicate (inclusiv ID-urile lor):\n- Se foloseste o functie fereastra: `COUNT(*) OVER (PARTITION BY email)` sau un INNER JOIN cu query-ul grupat.",
    codeSnippet: `-- 1. Aflare email-uri duplicate si numarul de aparitii:
SELECT email, COUNT(*) AS numar_aparitii
FROM utilizatori
GROUP BY email
HAVING COUNT(*) > 1;

-- 2. Selectare randuri complete duplicate cu Window Function:
WITH duplicate_cte AS (
    SELECT 
        id, nume, email,
        COUNT(*) OVER (PARTITION BY email) AS cnt
    FROM utilizatori
)
SELECT id, nume, email FROM duplicate_cte WHERE cnt > 1;`,
    interviewTrap: "Nu folosi `WHERE COUNT(*) > 1`! WHERE filtreaza inainte de grupare si va da eroare de sintaxa. Conditia de numar pe grupuri se pune obligatoriu in HAVING.",
    keyTakeaway: "Duplicatele se identifica prin `GROUP BY coloana HAVING COUNT(*) > 1`, iar randurile complete se extrag usor folosind functii fereastra sau CTE-uri."
  },
  {
    id: "sql-96",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Table Partitioning: Range, List si Hash Partitioning",
    question: "Ce este partitionarea tabelelor (Table Partitioning) si care sunt cele 3 tipuri de baza?",
    answer: "Partitionarea este impartirea unei tabele gigantice (zeci de milioane de randuri) in tabele fizice mai mici numite partitii, pastrand o singura interfata logica pentru aplicatie.\n\nTipuri principale:\n1. Range Partitioning (pe intervale):\n- Randurile sunt alocate in functie de un interval continuu de valori.\n- Exemplu clasic: loguri sau vanzari partitionate pe luni sau ani (`FOR VALUES FROM ('2026-01-01') TO ('2026-02-01')`).\n\n2. List Partitioning (pe liste de valori discrete):\n- Partitii alocate explicit pentru valori fixe (ex: partitionare pe cod tara: Partitia RO, Partitia DE, Partitia FR).\n\n3. Hash Partitioning (pe baza de algoritm hash):\n- Calculeaza un hash pe o cheie (ex: user_id) si imparte uniform datele in `N` partitii pentru distributie egala de I/O.",
    codeSnippet: `-- Creare tabela parinte partitionata pe intervale de data (PostgreSQL):
CREATE TABLE loguri (
    id BIGSERIAL,
    data_log TIMESTAMPTZ NOT NULL,
    mesaj TEXT
) PARTITION BY RANGE (data_log);

-- Creare partitie fizica pentru Ianuarie 2026:
CREATE TABLE loguri_2026_01 PARTITION OF loguri
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');`,
    interviewTrap: "O tabela partitionata nu imbunatateste automat orice interogare! Daca query-ul nu include cheia de partitionare in WHERE, motorul va trebui sa scaneze TOATE partitiile, fiind mai lent decat o tabela simpla.",
    keyTakeaway: "Partitionarea imparte fizic tabelele mari in sub-tabele pe baza de Range (intervale), List (valori specifice) sau Hash (distributie uniforma)."
  },
  {
    id: "sql-97",
    category: "SQL",
    difficulty: "MEDIU",
    title: "Partition Pruning - Optimizarea pe Tabele Partitionate",
    question: "Ce este \"Partition Pruning\" si de ce este cheia performantei pe tabele partitionate?",
    answer: "Partition Pruning (curatarea / eliminarea partitiilor) este tehnica de optimizare prin care planificatorul de interogari exclude complet de la scanare partitiile care nu contin date relevante pentru interogare.\n\nCum functioneaza:\n- Daca tabela `loguri` are 60 de partitii lunare (pentru 5 ani) si rulezi un SELECT cu conditia `WHERE data_log >= '2026-01-01' AND data_log < '2026-02-01'`:\n- Optimizatorul examineaza constrangerile partitiilor si decide sa citeasca EXCLUSIV partitia `loguri_2026_01`.\n- Celelalte 59 de partitii sunt complet ignorate (nu se face I/O pe ele).\n\nBeneficiu imens la mentenanta:\n- Stergerea datelor mai vechi de 5 ani nu necesita un `DELETE` lent de ore intregi, ci un simplu `DROP TABLE loguri_2021_01;`, care se executa instant (milisecunde) fara generare de WAL bloat!",
    codeSnippet: `-- Query care beneficiaza de Partition Pruning:
EXPLAIN SELECT * FROM loguri 
WHERE data_log = '2026-01-15 10:00:00';
-- In planul de executie va aparea doar scan pe tabela loguri_2026_01!`,
    interviewTrap: "Daca aplici o functie pe cheia de partitionare in WHERE (ex: `WHERE EXTRACT(year FROM data_log) = 2026`), optimizatorul s-ar putea sa nu reuseasca Partition Pruning la faza de planificare statica!",
    keyTakeaway: "Partition Pruning evita scanarea partitiilor nerelevante la citire si permite stergerea instantanee a datelor vechi prin `DROP PARTITION`."
  },
  {
    id: "sql-98",
    category: "SQL",
    difficulty: "USOR",
    title: "Backup si Restore: pg_dump vs Backup Fizic",
    question: "Care este diferenta dintre un backup logic (pg_dump) si un backup fizic al bazei de date?",
    answer: "1. Backup Logic (ex: `pg_dump` in PostgreSQL / `mysqldump` in MySQL):\n- Exporta schema si datele sub forma de instructiuni SQL text (`CREATE TABLE`, `INSERT INTO` sau `COPY`) sau format binar comprimat (Custom Format).\n- Avantaje: Extrem de flexibil (poti restaura pe o versiune mai noua de Postgres sau pe un alt sistem de operare), poti alege sa restaurezi o singura tabela sau o singura schema.\n- Dezavantaj: Restaurarea este lenta pe baze masive (trebuie sa re-execute toate inserturile si sa reconstruiasca de la zero toti indecsii!).\n\n2. Backup Fizic (Raw / Binary Backup, ex: `pg_basebackup`):\n- Copiaza direct blocurile binare de date si fisierele WAL de pe disc la nivel de sistem de fisiere.\n- Avantaje: Restaurare fulgeratoare (doar se copiaza fisierele inapoi) si suport complet pentru Point-In-Time-Recovery (PITR).\n- Dezavantaj: Trebuie restaurata toata instanta de PostgreSQL identica.",
    codeSnippet: `# Backup logic comprimat in format custom (-Fc):
pg_dump -U postgres -Fc -d magazin_db -f magazin_backup.dump

# Restaurare paralela pe 4 thread-uri cu pg_restore:
pg_restore -U postgres -d magazin_db -j 4 magazin_backup.dump`,
    interviewTrap: "`pg_dump` NU blocheaza cititorii si nici scriitorii in timpul executiei! Foloseste o tranzactie Snapshot interna pentru a genera un backup perfect consistent fara downtime.",
    keyTakeaway: "Backup-ul logic (pg_dump) este portabil si flexibil pe tabele specifice; Backup-ul fizic (pg_basebackup) este mult mai rapid la baze gigantice si permite PITR."
  },
  {
    id: "sql-99",
    category: "SQL",
    difficulty: "USOR",
    title: "Baza de Date Relationala (SQL) vs Document NoSQL (MongoDB)",
    question: "Cand alegem o baza de date Relationala (SQL) si cand este justificata o baza NoSQL Document?",
    answer: "Criterii obiective de alegere la interviu:\n\n1. Cand alegem SQL Relational (PostgreSQL, MySQL):\n- Datele au relatii clare si complexe (1-to-N, N-to-N) intre entitati (clienti, comenzi, produse, facturi).\n- Tranzactionalitate stricta ACID obligatorie (sisteme financiare, bancare, e-commerce).\n- Schema datelor este bine definita si se cere integritate referentiala ferma (Foreign Keys, Constrangeri CHECK).\n- Capacitati analitice complexe (JOIN-uri complexe, Window Functions, CTE-uri).\n\n2. Cand alegem NoSQL Document (MongoDB):\n- Documente de sine statatoare, nestructurate sau polimorfice (continut de cataloage cu mii de atribute diferite per produs).\n- Date care sunt citite si scrise mereu ca un tot unitar (fara a necesita join-uri cu alte colectii).\n- Nevoie de scalare orizontala rapida prin sharding automat nativ de la zeci de noduri in sus.",
    codeSnippet: `-- In Postgres modern, poti avea "ce e mai bun din ambele lumi":
-- Baza relationala solida cu ACID + coloane JSONB flexibile pentru proprietati dinamice!
CREATE TABLE produse (
    id SERIAL PRIMARY KEY,
    pret NUMERIC(10, 2) NOT NULL,
    atribute_dinamice JSONB -- stocheaza atribute NoSQL nested fara a renunta la ACID!
);`,
    interviewTrap: "Un mit comun este \"NoSQL e mai rapid decat SQL\". Un PostgreSQL bine indexat pe servere dedicate este adesea considerabil mai rapid decat MongoDB pentru operatiuni obisnuite de scriere/citire!",
    keyTakeaway: "Alege SQL cand ai relatii intre entitati si ai nevoie de integritate ACID; alege NoSQL cand ai documente ierarhice izolate cu scheme fluid variabile."
  },
  {
    id: "sql-100",
    category: "SQL",
    difficulty: "USOR",
    title: "Top 5 Capcane SQL la Interviuri pentru Junior / Mid",
    question: "Care sunt cele mai frecvente 5 capcane SQL intalnite la interviurile tehnice de Junior si Mid?",
    answer: "Top 5 capcane clasice de interviu:\n\n1. Comparatia cu NULL:\n- Capcana: `col = NULL` nu gaseste nimic! Corect este `col IS NULL`.\n\n2. Subquery NOT IN cu valori NULL:\n- Daca lista contine chiar si un singur NULL, `WHERE id NOT IN (SELECT ...)` returneaza ZERO randuri! Foloseste `NOT EXISTS`.\n\n3. Clauza WHERE pe tabela din dreapta la un LEFT JOIN:\n- Daca pui `WHERE b.status = \\'ACTIV\\'`, transformi fara sa vrei LEFT JOIN-ul intr-un INNER JOIN! Conditia trebuie pusa in clauza `ON` a join-ului.\n\n4. COUNT(*) vs COUNT(coloana):\n- `COUNT(*)` numara toate randurile; `COUNT(col)` ignora valorile NULL, putand da rezultate diferite.\n\n5. GROUP BY si coloanele selectate:\n- Orice coloana prezenta in SELECT care nu este infasurata intr-o functie de agregare (SUM, MAX) TREBUIE sa fie prezenta obligatoriu in clauza GROUP BY.",
    codeSnippet: `-- Exemplu capcana #3 (LEFT JOIN stricat de WHERE):
-- GRESIT (comporta ca INNER JOIN):
SELECT * FROM clienti c LEFT JOIN comenzi o ON c.id = o.client_id WHERE o.total > 100;

-- CORECT (Pastreaza toti clientii):
SELECT * FROM clienti c LEFT JOIN comenzi o ON c.id = o.client_id AND o.total > 100;`,
    interviewTrap: "Daca stapanesti aceste 5 scenarii si le explici proactiv intervievatorului inainte sa te corecteze el, faci instant o impresie excelenta de nivel Mid!",
    keyTakeaway: "Retine: IS NULL, NOT EXISTS peste NOT IN, ON vs WHERE la Outer Joins, comportamentul COUNT pe NULL si regula stricta GROUP BY."
  }
];
