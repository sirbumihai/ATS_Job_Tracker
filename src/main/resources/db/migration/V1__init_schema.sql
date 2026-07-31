-- =============================================================================
-- V1__init_schema.sql
-- Description: Initial Database Schema for AI-Powered Job Tracker & ATS Matcher
-- System: PostgreSQL 16+ with pgvector extension
-- =============================================================================

-- 1. Enable Required PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Create Custom Enum Types for Enforcing Valid States
CREATE TYPE application_status AS ENUM (
    'SAVED', 
    'APPLIED', 
    'INTERVIEWING', 
    'OFFER_RECEIVED', 
    'REJECTED', 
    'WITHDRAWN'
);

-- 3. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Resumes Table
CREATE TABLE resumes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(512) NOT NULL,
    raw_text TEXT NOT NULL,
    parsed_skills JSONB DEFAULT '[]'::jsonb,
    -- Vector embedding (384 dimensions for all-MiniLM-L6-v2 model)
    text_embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Job Postings Table
CREATE TABLE job_postings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_url VARCHAR(512),
    raw_description TEXT NOT NULL,
    extracted_requirements JSONB DEFAULT '{}'::jsonb,
    -- Vector embedding of the job description
    description_embedding vector(384),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Applications Table (Joins User, Job, and Resume)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES resumes(id) ON DELETE SET NULL,
    status application_status NOT NULL DEFAULT 'SAVED',
    -- Match score between 0.00 and 100.00 calculated via vector similarity + LLM rules
    semantic_match_score NUMERIC(5, 2),
    notes TEXT,
    applied_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_job_application UNIQUE (user_id, job_id)
);

-- 7. AI Gap Analyses Table
CREATE TABLE ai_gap_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL UNIQUE REFERENCES applications(id) ON DELETE CASCADE,
    missing_skills JSONB DEFAULT '[]'::jsonb,
    matching_skills JSONB DEFAULT '[]'::jsonb,
    action_plan_markdown TEXT NOT NULL,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- =============================================================================

-- Foreign Key B-Tree Indexes
CREATE INDEX idx_resumes_user_id ON resumes(user_id);
CREATE INDEX idx_job_postings_user_id ON job_postings(user_id);
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_job_id ON applications(job_id);

-- Vector HNSW Indexes (Hierarchical Navigable Small World) for Fast Cosine Distance Search
CREATE INDEX idx_resumes_vector_hnsw ON resumes USING hnsw (text_embedding vector_cosine_ops);
CREATE INDEX idx_job_postings_vector_hnsw ON job_postings USING hnsw (description_embedding vector_cosine_ops);
