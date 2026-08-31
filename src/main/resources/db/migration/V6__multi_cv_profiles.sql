-- Migration to support multiple CV profiles per user and linking applications directly to CV profiles

-- 1. Drop unique constraint on user_id in cv_profile
ALTER TABLE cv_profile DROP CONSTRAINT IF EXISTS uk_cv_profile_user;

-- 2. Add title and is_primary columns to cv_profile
ALTER TABLE cv_profile ADD COLUMN IF NOT EXISTS title VARCHAR(255) DEFAULT 'CV Principal';
ALTER TABLE cv_profile ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- 3. Set existing cv_profile records as primary
UPDATE cv_profile SET title = 'CV Principal', is_primary = TRUE WHERE title IS NULL OR title = '';

-- 4. Add index on user_id and updated_at for fast retrieval
CREATE INDEX IF NOT EXISTS idx_cv_profile_user_updated ON cv_profile (user_id, updated_at DESC);

-- 5. Add cv_profile_id foreign key column to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cv_profile_id UUID REFERENCES cv_profile(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_applications_cv_profile_id ON applications(cv_profile_id);
