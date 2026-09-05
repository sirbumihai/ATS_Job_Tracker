-- Migration V8: Widen column types for cached_live_jobs to prevent truncation errors on long IDs/titles

ALTER TABLE cached_live_jobs ALTER COLUMN id TYPE VARCHAR(255);
ALTER TABLE cached_live_jobs ALTER COLUMN job_title TYPE VARCHAR(500);
ALTER TABLE cached_live_jobs ALTER COLUMN company_name TYPE VARCHAR(500);
ALTER TABLE cached_live_jobs ALTER COLUMN company_logo_url TYPE TEXT;
ALTER TABLE cached_live_jobs ALTER COLUMN location TYPE VARCHAR(500);
ALTER TABLE cached_live_jobs ALTER COLUMN work_model TYPE VARCHAR(100);
ALTER TABLE cached_live_jobs ALTER COLUMN experience_level TYPE VARCHAR(100);
ALTER TABLE cached_live_jobs ALTER COLUMN source_platform TYPE VARCHAR(100);
ALTER TABLE cached_live_jobs ALTER COLUMN salary_range TYPE VARCHAR(255);
ALTER TABLE cached_live_jobs ALTER COLUMN posted_date_ago TYPE VARCHAR(255);
ALTER TABLE cached_live_jobs ALTER COLUMN competitiveness TYPE VARCHAR(100);
ALTER TABLE cached_live_jobs ALTER COLUMN competitiveness_label TYPE VARCHAR(255);
ALTER TABLE cached_live_jobs ALTER COLUMN applicant_count_text TYPE VARCHAR(255);
