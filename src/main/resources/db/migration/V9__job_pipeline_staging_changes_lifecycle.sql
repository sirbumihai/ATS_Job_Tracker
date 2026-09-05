-- Migration V9: Job Pipeline with Staging, Change Audit Log, Exact Posted Date & Expiration Lifecycle

-- 1. Extend cached_live_jobs
ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS external_id VARCHAR(255);
ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS content_hash VARCHAR(64);
ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS posted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS first_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE cached_live_jobs ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'ACTIVE';

-- Populate posted_at for existing records from posted_days_ago
UPDATE cached_live_jobs 
SET posted_at = CURRENT_TIMESTAMP - (posted_days_ago || ' days')::INTERVAL 
WHERE posted_at IS NULL;

-- Populate first_seen_at and last_seen_at for existing records
UPDATE cached_live_jobs 
SET first_seen_at = created_at 
WHERE first_seen_at IS NULL;

UPDATE cached_live_jobs 
SET last_seen_at = updated_at 
WHERE last_seen_at IS NULL;

-- Indices on cached_live_jobs
CREATE INDEX IF NOT EXISTS idx_cached_jobs_status ON cached_live_jobs(status);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_posted_at ON cached_live_jobs(posted_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_last_seen ON cached_live_jobs(last_seen_at DESC);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_content_hash ON cached_live_jobs(content_hash);

-- 2. Staging Table for Raw Decoupled Ingestion
CREATE TABLE IF NOT EXISTS jobs_staging (
    id BIGSERIAL PRIMARY KEY,
    external_id VARCHAR(255),
    source_platform VARCHAR(100) NOT NULL,
    direct_apply_url TEXT NOT NULL,
    raw_payload TEXT,
    crawled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    processed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_jobs_staging_pending ON jobs_staging(processed, crawled_at);

-- 3. Audit / Change History Log Table
CREATE TABLE IF NOT EXISTS job_changes (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(255) NOT NULL REFERENCES cached_live_jobs(id) ON DELETE CASCADE,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    old_hash VARCHAR(64),
    new_hash VARCHAR(64),
    change_type VARCHAR(50) NOT NULL,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_job_changes_job_id ON job_changes(job_id, changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_changes_changed_at ON job_changes(changed_at DESC);
