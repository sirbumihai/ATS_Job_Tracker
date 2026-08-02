-- =============================================================================
-- V4__interview_knowledge.sql
-- Description: Create interview_knowledge table for RAG Vector Memory
-- =============================================================================

CREATE TABLE IF NOT EXISTS interview_knowledge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    topic VARCHAR(255) NOT NULL,
    question_text TEXT NOT NULL,
    ideal_answer_text TEXT NOT NULL,
    embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index vector pentru căutări ultra-rapide Cosine Similarity HNSW
CREATE INDEX IF NOT EXISTS idx_interview_knowledge_vector ON interview_knowledge USING hnsw (embedding vector_cosine_ops);
