-- =============================================================================
-- V3__associate_all_jobs_to_sarbu.sql
-- Description: Associate all demo applications and jobs to sarbu.mihai@gmail.com
-- =============================================================================

UPDATE job_postings 
SET user_id = '23fe8bdd-08f4-413d-9985-f99c21040b59'
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

UPDATE applications 
SET user_id = '23fe8bdd-08f4-413d-9985-f99c21040b59'
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

UPDATE resumes 
SET user_id = '23fe8bdd-08f4-413d-9985-f99c21040b59'
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
