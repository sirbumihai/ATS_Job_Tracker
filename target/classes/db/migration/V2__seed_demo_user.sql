-- =============================================================================
-- V2__seed_demo_user.sql
-- Description: Seed a default Demo User for easy REST API testing
-- =============================================================================

INSERT INTO users (id, email, password_hash, full_name)
VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'alex.test@gmail.com',
    '$2a$10$abcdefghijklmnopqrstuv',
    'Alexandru Sîrbu'
) ON CONFLICT (email) DO NOTHING;
