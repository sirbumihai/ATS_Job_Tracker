-- Migration V7: Create cached_live_jobs table for persistent live job storage & differential crawling

CREATE TABLE IF NOT EXISTS cached_live_jobs (
    id VARCHAR(64) PRIMARY KEY,
    job_title VARCHAR(255) NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    company_logo_url VARCHAR(1024),
    location VARCHAR(255),
    work_model VARCHAR(50),
    experience_level VARCHAR(50),
    source_platform VARCHAR(50) NOT NULL,
    direct_apply_url TEXT NOT NULL UNIQUE,
    raw_description TEXT,
    salary_range VARCHAR(150),
    skills_required TEXT,
    posted_date_ago VARCHAR(100),
    ats_match_score DOUBLE PRECISION DEFAULT 0.0,
    competitiveness VARCHAR(50),
    competitiveness_label VARCHAR(150),
    applicant_count_text VARCHAR(150),
    posted_days_ago INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cached_jobs_platform ON cached_live_jobs(source_platform);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_level ON cached_live_jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_posted_days ON cached_live_jobs(posted_days_ago);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_created_at ON cached_live_jobs(created_at DESC);
