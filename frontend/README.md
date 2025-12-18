# Frontend (React + Vite)

This lightweight Vite React app demonstrates the separated front end for "轻写". It connects to the FastAPI backend via REST.

## Usage

```bash
cd frontend
npm install
npm run dev
```

Point `VITE_API_URL` in a `.env` file to your running backend instance if it is not on `http://localhost:8000`.

Pages included:
- `/` landing page introducing the migration
- `/login` register/login via JWT
- `/dashboard` create & view novels for the authenticated user
