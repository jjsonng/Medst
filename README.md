## MEDST – Personal Health Records Platform

MEDST is a full‑stack web app that helps people **store and manage their own health records**, reduce paper trails, and get clearer, data‑driven insights into their health. It’s designed for patients and families who want everything in one place, with simple tools for trends, understanding results, and an AI helper on top.

---

> **Status:** This project is an in‑progress prototype and is still under active development.

---

## Project structure

- `backend/` – FastAPI API for authentication, record upload/ingestion, basic analytics, clinic search, and sending record‑request emails.
- `frontend/` – Next.js app for login/signup, uploading and viewing records, finding clinics and requesting reports, and using the assistant UI.

Run the **backend and frontend in separate terminals**.

---

## Tech stack

- **Backend**: FastAPI, PostgreSQL, SQLAlchemy, Argon2 password hashing, JWT auth, PDF/DOCX/image ingestion.
- **Frontend**: Next.js, React, Tailwind CSS, shadcn/ui, Recharts.

---

## How to run locally

### Backend (API)

From the project root:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

- API docs: `http://localhost:8000/docs`

### Frontend (web app)

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

- Web app: `http://localhost:3000`
- Frontend talks to the backend at `http://localhost:8000` (auth, records, analytics, assistant).

Make sure the **backend is running first**.

---

## Credits

- **Backend**: Dinh Nguyen  
- **Frontend**: Tanvi Mudhiganti


