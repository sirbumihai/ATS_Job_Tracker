// Deck Masiv: Machine Learning, AI, Deep Learning, PyTorch, LLMs & Vector Search
// Preluat din: alirezadir/AIMLInterviews, amit-shekhar/AI-Engineering-Interview
// STRICT ZERO DIACRITICE IN TOATE TEXTELE

export const ML_AI_DECK = [
  {
    id: 'ml-01',
    category: 'ML_AI',
    difficulty: 'USOR',
    title: 'Overfitting vs Underfitting: Cauze si Tehnici de Remediere',
    question: 'Ce este Overfitting-ul si Underfitting-ul in Machine Learning si care sunt cele mai eficiente 4 tehnici pentru a combate Overfitting-ul?',
    answer: '1. Overfitting (Suprainvatare / High Variance):\n   - Modelul invata "pe de rost" datele de antrenament, inclusiv zgomotul (noise-ul), dar generalizeaza foarte slab pe date noi de testare (eroare mica pe train, eroare mare pe test).\n2. Underfitting (Subinvatare / High Bias):\n   - Modelul este prea simplu si nu reuseste sa capteze relatiile de baza din date (eroare mare atat pe train cat si pe test).\n\n4 Tehnici de combatere a Overfitting-ului:\n- Regularizare (L1 Lasso / L2 Ridge, Weight Decay in PyTorch): Penalizeaza ponderile prea mari din retea.\n- Dropout: Dezactiveaza aleatoriu un procent de neuroni (ex: 20-50%) in timpul fiecarei treceri de antrenament, fortand reteaua sa invete reprezentari redundante robuste.\n- Early Stopping: Opreste antrenarea cand pierderea pe setul de validare incepe sa creasca.\n- Data Augmentation / Cresterea volumului de date: Generarea de variatii artificiale (rotiri, crop-uri, sinonime).',
    codeSnippet: `import torch.nn as nn

class Classifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1 = nn.Linear(512, 128)
        self.dropout = nn.Dropout(p=0.3) # 30% dropout pentru regularizare
        self.fc2 = nn.Linear(128, 2)
        
    def forward(self, x):
        return self.fc2(self.dropout(torch.relu(self.fc1(x))))`,
    interviewTrap: 'Nu evalua niciodata modelul cu Dropout activat la inferenta! Apeleaza intotdeauna model.eval() inainte de validare pentru a opri Dropout-ul si a scala ponderile corespunzator.',
    keyTakeaway: 'Overfitting = varianta mare (model complex pe date putine); se rezolva cu Dropout, regularizare L2 si date suplimentare.'
  },
  {
    id: 'ml-02',
    category: 'ML_AI',
    difficulty: 'MEDIU',
    title: 'Ce este RAG (Retrieval-Augmented Generation) si cum difera de Fine-Tuning?',
    question: 'Explica arhitectura unui sistem RAG (Retrieval-Augmented Generation) si cand alegi RAG in loc de Fine-Tuning pentru un LLM?',
    answer: 'RAG combina un sistem de cautare semantica (Retriever) cu un model generativ de limbaj (LLM Generator):\n1. Fluxul RAG:\n   - Documentele interne (ex: mii de CV-uri sau documentatie tehnica) sunt impartite in bucati (chunks).\n   - Fiecare bucata este convertita intr-un vector numeric de embedding-uri.\n   - La intrebarea utilizatorului, intrebarea este convertita in vector si se cauta cele mai apropiate K documente relevante prin Cosine Similarity in baza de date vectoriala (PostgreSQL pgvector, Pinecone).\n   - Documentele gasite sunt injectate ca si "Context" in prompt-ul trimis catre LLM (Groq LLaMA 3, OpenAI).\n\nCand alegi RAG vs Fine-Tuning:\n- RAG: Cand datele se schimba frecvent (actualizari zilnice), cand vrei referinte exacte cu sursa citata (Zero Halucinatii) si costuri minime de computatie.\n- Fine-Tuning: Cand vrei sa inveti modelul un STIL specific, o sintaxa de cod noua sau un vocabular medical foarte restrans, dar nu pentru a-i introduce fapte sau cunostinte noi in timp real.',
    codeSnippet: `// Exemplu query de cautare semantica in PostgreSQL cu pgvector:
SELECT id, raw_description, 
       1 - (description_embedding <=> '[0.012, -0.045, ...]') AS similarity_score
FROM job_postings
ORDER BY description_embedding <=> '[0.012, -0.045, ...]'
LIMIT 5;`,
    interviewTrap: 'Fine-Tuning-ul unui LLM NU garanteaza ca modelul nu va mai halucina pe date noi! RAG este solutia ideala pentru informatii precise si actualizate continuu.',
    keyTakeaway: 'RAG = cauta fapte in baza de date si da-i-le modelului in prompt; Fine-Tuning = schimba modul si tonul in care modelul raspunde.'
  },
  {
    id: 'ml-03',
    category: 'ML_AI',
    difficulty: 'MEDIU',
    title: 'Mecanismul de Atentie (Self-Attention) si Arhitectura Transformer',
    question: 'Cum functioneaza mecanismul de Self-Attention din arhitectura Transformer (Vaswani et al.) si ce reprezinta matricile Query (Q), Key (K) si Value (V)?',
    answer: 'Arhitectura Transformer a inlocuit retelele recurente (RNN/LSTM) prin capacitatea de a procesa toate cuvintele dintr-o propozitie simultan (paralelizare pe GPU) si de a capta dependinte la distanta lunga.\n\nFormularea Self-Attention: Attention(Q, K, V) = softmax((Q * K^T) / sqrt(d_k)) * V\n\nCe reprezinta Q, K, V (Analogie cu un motor de cautare):\n1. Query (Q): Ce cauta cuvantul curent (ex: "banca" cauta daca propozitia e despre bani sau despre parc).\n2. Key (K): Eticheta / descrierea fiecarui cuvant din propozitie.\n3. Q * K^T: Calculeaza un scor de similaritate (cat de mult trebuie sa fie atent cuvantul curent la celelalte cuvinte).\n4. Softmax: Normalizeaza scorurile intr-o distributie de probabilitate intre 0 si 1.\n5. Value (V): Informatia semantica reala a fiecarui cuvant, ponderata cu scorurile de atentie calculate.',
    codeSnippet: `// Formula scalata de produs scalar (Scaled Dot-Product Attention):
// Attention(Q, K, V) = softmax(Q * K.T / sqrt(d_k)) * V
// Factorul sqrt(d_k) previne ca produsul scalar sa devina prea mare,
// ceea ce ar duce gradientii din softmax la valori extrem de mici (Vanishing Gradients).`,
    interviewTrap: 'Complexitatea Self-Attention standard este O(N^2) in raport cu lungimea secventei N (context window), motiv pentru care ferestrele mari de context consuma cantitati uriase de VRAM pe GPU.',
    keyTakeaway: 'Self-Attention permite fiecarui cuvant dintr-o propozitie sa priveasca si sa extraga context din toate celelalte cuvinte simultan.'
  },
  {
    id: 'ml-04',
    category: 'ML_AI',
    difficulty: 'MEDIU',
    title: 'Ce este pgvector si cum functioneaza indexul HNSW in PostgreSQL?',
    question: 'Cum permite extensia pgvector stocarea si cautarea vectoriala in PostgreSQL si care este diferenta dintre un index IVFFlat si un index HNSW?',
    answer: 'pgvector este o extensie open-source pentru PostgreSQL care adauga tipul de date vector(N) si operatori pentru distanta Euclidiana (<->), distanta Cosine (<=>) si produs scalar (<#>).\n\nTipuri de indecsi vectoriali aproximativi (ANN - Approximate Nearest Neighbor):\n1. IVFFlat (Inverted File Flat):\n   - Imparte spatiul vectorial in clustere (liste Voronoi). La cautare, inspecteaza doar cele mai apropiate clustere.\n   - Rapid de construit si consuma putina memorie, dar acuratetea scade daca baza de date se modifica frecvent fara re-indexare.\n2. HNSW (Hierarchical Navigable Small World):\n   - Construieste un graf ierarhic multi-strat de noduri (asemanator cu un skip list aplicat pe grafuri).\n   - Ofera performanta de cautare superioara (viteza maxima O(log N) cu acuratete de peste 99%) chiar si pe baze mari de date cu mii de inserari zilnice, cu costul unui consum mai mare de RAM si timp mai lung de construire a indexului.',
    codeSnippet: `-- Creare tabela cu vector embeddings (384 dimensiuni):
CREATE TABLE job_embeddings (
    id UUID PRIMARY KEY,
    embedding vector(384)
);

-- Creare index de inalta performanta HNSW:
CREATE INDEX idx_job_embeddings_hnsw 
ON job_embeddings USING hnsw (embedding vector_cosine_ops);`,
    interviewTrap: 'Daca nu creezi un index HNSW sau IVFFlat pe coloana de vectori, orice interogare ORDER BY embedding <=> ... va face o scanare secventiala completa (Exact KNN O(N)), care devine foarte lenta la peste 10.000 de vectori!',
    keyTakeaway: 'HNSW este indexul de aur in pgvector pentru cautare semantica si RAG in timp real direct in PostgreSQL.'
  }
];
