-- Migration V11: Feedback Submissions and Community Roadmap Ideas

CREATE TABLE IF NOT EXISTS feedback_submissions (
    id UUID PRIMARY KEY,
    author_name VARCHAR(150),
    author_email VARCHAR(255),
    category VARCHAR(50) NOT NULL,
    rating INT,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    share_in_community BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_ideas (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    author_name VARCHAR(150),
    author_email VARCHAR(255),
    votes_count INT NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'IN_ANALIZA',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS community_idea_votes (
    id UUID PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES community_ideas(id) ON DELETE CASCADE,
    voter_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_idea_voter UNIQUE (idea_id, voter_token)
);

CREATE INDEX IF NOT EXISTS idx_community_ideas_votes ON community_ideas(votes_count DESC);
CREATE INDEX IF NOT EXISTS idx_community_idea_votes_idea ON community_idea_votes(idea_id);
CREATE INDEX IF NOT EXISTS idx_community_idea_votes_voter ON community_idea_votes(voter_token);

-- Seed initial curated community ideas
INSERT INTO community_ideas (id, title, description, category, author_name, votes_count, status, created_at)
VALUES 
    (gen_random_uuid(), 'Simulator de interviu vocal AI cu feedback in timp real', 'Posibilitatea de a raspunde vocal la intrebarile tehnice si HR, cu analiza pe ritm, claritate si terminologie.', 'Pregatire Interviu', 'Comunitate', 142, 'IN_PLANIFICARE', NOW()),
    (gen_random_uuid(), 'Filtru avansat pentru salarii min/max raportate in Romania si Remote EU', 'Estimari salariale bazate pe piata reala IT si nivel de senioritate (Junior, Mid, Senior) la salvarea jobului.', 'Piata IT', 'Comunitate', 98, 'IN_DEZVOLTARE', NOW()),
    (gen_random_uuid(), 'Export CV in format JSON Resume standardizat', 'Compatibilitate directa cu platformele internationale si posibilitatea de backup JSON complet al CV-ului.', 'ATS & Optimizare CV', 'Comunitate', 84, 'CERCETARE', NOW()),
    (gen_random_uuid(), 'Banca extinsa de scenarii System Design pentru arhitecturi microservicii', 'Diagrame interactive si intrebari de scalabilitate (caching, partitionare, mesagerie asincrona Kafka).', 'Pregatire Interviu', 'Comunitate', 76, 'IN_PLANIFICARE', NOW())
ON CONFLICT DO NOTHING;
