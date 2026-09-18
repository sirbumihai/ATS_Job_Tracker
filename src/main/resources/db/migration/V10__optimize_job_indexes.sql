-- Migration V10: Optimize Job Discovery Performance with Composite Indexes

-- 1. Composite index for expiration checks (used by findActiveJobsNotSeenSince)
CREATE INDEX IF NOT EXISTS idx_cached_jobs_status_last_seen ON cached_live_jobs(status, last_seen_at);

-- 2. Composite index for active listings sorted by recency
CREATE INDEX IF NOT EXISTS idx_cached_jobs_status_posted ON cached_live_jobs(status, posted_at DESC NULLS LAST, created_at DESC);

-- 3. Indexes for multi-criteria filters
CREATE INDEX IF NOT EXISTS idx_cached_jobs_platform ON cached_live_jobs(source_platform);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_level ON cached_live_jobs(experience_level);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_work_model ON cached_live_jobs(work_model);
CREATE INDEX IF NOT EXISTS idx_cached_jobs_newly_discovered ON cached_live_jobs(newly_discovered);
