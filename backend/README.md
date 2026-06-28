# MediVision AI — FastAPI Backend

REST API for authentication, nurse patient intake, doctor diagnosis, and admin user verification. Uses Supabase PostgreSQL for storage.

## Setup

### 1. Create database tables

In the [Supabase SQL Editor](https://supabase.com/dashboard), run:

```
backend/supabase/migrations/001_initial_schema.sql
```

### 2. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your Supabase `DATABASE_URL` and a strong `SECRET_KEY`.

### 3. Install and run

```bash
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 4. Bootstrap first admin

Register the first admin via SQL (auto-verified):

```sql
-- Password: admin123 (change after first login)
INSERT INTO users (email, full_name, password_hash, role, status)
VALUES (
  'admin@example.com',
  'System Admin',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.G2oQKqKqKqKqKq',
  'admin',
  'verified'
);
```

Or register via `POST /api/auth/register` with role `admin` when no admin exists yet, then verify in Supabase:

```sql
UPDATE users SET status = 'verified' WHERE email = 'admin@example.com';
```

Generate a bcrypt hash locally:

```bash
python scripts/seed_admin.py
```

## API Overview

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | Public | Create account (status: pending) |
| POST | `/api/auth/login` | Public | Login (verified users only) |
| POST | `/api/auth/logout` | Auth | Revoke JWT |
| GET | `/api/auth/me` | Auth | Current user |
| POST | `/api/patients` | Nurse | Add patient |
| GET | `/api/patients` | Nurse/Doctor/Admin | List patients |
| PATCH | `/api/patients/{id}` | Nurse | Update patient |
| POST | `/api/patients/{id}/assign-doctor` | Nurse | Assign doctor |
| POST | `/api/diagnoses/run-ai/{patient_id}` | Doctor | Run liver AI diagnosis |
| GET | `/api/diagnoses` | Doctor/Nurse/Admin | List diagnoses |
| PATCH | `/api/diagnoses/{id}` | Doctor | Add notes, mark reviewed |
| GET | `/api/admin/users` | Admin | List users |
| GET | `/api/admin/users/pending` | Admin | Pending approvals |
| PATCH | `/api/admin/users/{id}/verify` | Admin | Approve user |
| PATCH | `/api/admin/users/{id}/reject` | Admin | Reject user |
| DELETE | `/api/admin/users/{id}` | Admin | Remove user |
| GET | `/api/admin/doctors` | Nurse/Admin | List verified doctors |

All protected routes use `Authorization: Bearer <token>`.

## Scope notes

- **Liver only** — colon cancer detection was removed from the data model (`cancer_type` is constrained to `liver`).
- **AI diagnosis** — currently returns mock confidence (75–98%) until an ML model is integrated.
- **First admin** — only the first admin can self-register; additional admins are created by an existing admin.
