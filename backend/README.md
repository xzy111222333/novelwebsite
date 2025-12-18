# Backend (FastAPI)

This directory contains a FastAPI backend extracted from the original Next.js stack to enable a clean front-end/back-end separation.

## Quick start

1. Create `.env` in `backend/` (or use environment variables):

```env
DATABASE_URL=mysql+pymysql://root:123456@localhost:3306/aiwrite_db
SECRET_KEY=replace-me
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

For local testing without MySQL you can omit `DATABASE_URL` and the app will fall back to a SQLite database `app.db`.

2. Install dependencies and run the dev server:

```bash
pip install -r backend/requirements.txt
uvicorn app.main:app --reload --app-dir backend
```

3. API highlights

- `POST /auth/register` – create user
- `POST /auth/login` – exchange credentials for JWT (OAuth2 password flow)
- `GET /auth/me` – fetch current user profile
- `GET/POST/PUT/DELETE /novels` – basic CRUD scoped to the authenticated user

A simple `/health` endpoint is also available for readiness probes.
