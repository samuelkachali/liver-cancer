-- Seed first verified admin (password: admin123 — change after first login)
-- Run AFTER 001_initial_schema.sql
-- Generate a fresh hash: python backend/scripts/seed_admin.py

INSERT INTO users (email, full_name, password_hash, role, status)
VALUES (
  'admin@example.com',
  'System Admin',
  '$2b$12$PLACEHOLDER_RUN_seed_admin.py',
  'admin',
  'verified'
)
ON CONFLICT (email) DO NOTHING;
