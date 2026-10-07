# 🚕 Zippr — Book Any Ride, Your Way

A premium, multi-role ride-hailing platform built with React 18 + Vite (frontend) and FastAPI + PostgreSQL (backend).

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  React 18 + Vite · Redux Toolkit · React Router v6          │
│  Tailwind CSS · Framer Motion · Leaflet Maps                 │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST + WebSocket
┌────────────────────────▼────────────────────────────────────┐
│                    FastAPI Backend                            │
│  /api/v1/*  ·  /ws/rides/{id}  ·  RBAC via JWT deps         │
│  Pydantic v2 · SQLAlchemy 2.0 async · Alembic migrations     │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
┌────────────▼──────────┐  ┌─────────▼───────────────────────┐
│     PostgreSQL 16      │  │          Redis 7                 │
│  All persistent data   │  │  Rate-limit, caching, sessions   │
└───────────────────────┘  └─────────────────────────────────┘
```

### Roles
| Role    | Access                                      |
|---------|---------------------------------------------|
| `user`  | Rider dashboard — book, track, pay, history |
| `driver`| Partner dashboard — accept, drive, earn     |
| `admin` | Full platform ops, analytics, CMS           |

---

## Quick Start — Docker (Recommended)

### Prerequisites
- Docker Desktop ≥ 4.x
- Node.js 18+ (only needed for local frontend dev without Docker)
- Python 3.11.x (recommended for local backend dev without Docker; Python 3.13 may hit build issues on Windows)
- Windows users: keep the project in a short ASCII path such as C:\zippr-platform to avoid Unicode/encoding issues during package builds

### Steps

```bash
# 1. Clone
git clone <repo-url> && cd zippr

# 2. Configure environment
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your secrets

# 3. Start all services
docker compose up --build

# 4. Seed demo data (first run only)
docker compose exec backend python -m app.db.seed

# 5. Access
# Frontend:  http://localhost:5173
# API Docs:  http://localhost:8000/docs
# ReDoc:     http://localhost:8000/redoc
```

---

## Quick Start — Manual (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv .venv
# Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# Linux/Mac:
source .venv/bin/activate

# Windows note:
# Use Python 3.11.x if possible. Python 3.13 can trigger pydantic-core build issues
# when the repo lives under a non-ASCII path such as OneDrive folders with Thai characters.
# Prefer a short ASCII path such as C:\zippr-platform\backend.
# In PowerShell, run these before installing packages:
$env:PYTHONUTF8 = "1"
$env:PYTHONIOENCODING = "utf-8"
$env:PYTHONLEGACYWINDOWSSTDIO = "1"

# Install dependencies
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env — set DATABASE_URL to your local postgres

# Run migrations
python -m alembic upgrade head

# Seed demo data
python -m app.db.seed

# Start dev server
python -m uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit VITE_API_URL if backend isn't on localhost:8000

# Start dev server
npm run dev
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Description                              | Default               |
|--------------------|------------------------------------------|-----------------------|
| `DATABASE_URL`     | Async PostgreSQL URL                     | *required*            |
| `SECRET_KEY`       | JWT signing secret (min 32 chars)        | *required*            |
| `ALGORITHM`        | JWT algorithm                            | `HS256`               |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token TTL              | `30`                  |
| `REFRESH_TOKEN_EXPIRE_DAYS`   | Refresh token TTL             | `7`                   |
| `CORS_ORIGINS`     | Comma-separated allowed frontend origins | `http://localhost:5173` |
| `REDIS_URL`        | Redis connection URL                     | `redis://localhost:6379/0` |
| `ENVIRONMENT`      | `development` or `production`            | `development`         |

### Frontend (`frontend/.env`)

| Variable            | Description                         | Default                   |
|---------------------|-------------------------------------|---------------------------|
| `VITE_API_URL`      | Backend base URL                    | `http://localhost:8000`   |
| `VITE_WS_URL`       | WebSocket base URL                  | `ws://localhost:8000`     |
| `VITE_MAPBOX_TOKEN` | Mapbox GL token (optional)          | *(Leaflet used if empty)* |

---

## Demo Credentials (after seeding)

| Role   | Email                    | Password    |
|--------|--------------------------|-------------|
| Admin  | admin@zippr.app          | Admin@123   |
| Rider  | priya@example.com        | Rider@123   |
| Rider  | rahul@example.com        | Rider@123   |
| Partner| arjun.partner@zippr.app  | Driver@123  |
| Partner| sunita.partner@zippr.app | Driver@123  |

---

## Project Structure

```
zippr/
├── frontend/               # React 18 + Vite
│   └── src/
│       ├── api/            # Axios instance + endpoint modules
│       ├── app/            # Redux store
│       ├── components/     # common/, layout/, domain/
│       ├── features/       # Redux slices (auth, ride, wallet, ...)
│       ├── hooks/          # Custom React hooks
│       ├── layouts/        # PublicLayout, UserDashboardLayout, ...
│       ├── pages/          # public/, user/, driver/, admin/
│       ├── routes/         # Route config, ProtectedRoute, RoleRoute
│       ├── styles/         # index.css (Tailwind + design tokens)
│       └── utils/          # cn(), formatters
├── backend/                # FastAPI
│   └── app/
│       ├── api/v1/         # Route handlers
│       ├── core/           # Config, security, deps, logging
│       ├── db/             # Session, base, seed script
│       ├── models/         # SQLAlchemy ORM models
│       ├── schemas/        # Pydantic v2 schemas
│       ├── services/       # Business logic (fare calc, ledger, ...)
│       └── ws/             # WebSocket connection manager
├── alembic/                # DB migrations
├── docker-compose.yml
└── README.md
```

---

## Running Tests

```bash
# Backend
cd backend
pytest tests/ -v

# Frontend
cd frontend
npm run test
```

---

## Build for Production

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

## Deploying to Render

This repository includes a ready-to-deploy [`render.yaml`](render.yaml) Blueprint configuration that sets up the PostgreSQL database, FastAPI backend web service, and Vite frontend static site automatically.

### Option 1: 1-Click Render Blueprint (Recommended)

1. Push your repository to **GitHub** or **GitLab**.
2. Log into the [Render Dashboard](https://dashboard.render.com).
3. Click **New +** and select **Blueprint**.
4. Connect your repository and select the branch (`main`).
5. Render will automatically detect `render.yaml` and provision:
   - **`zippr-db`**: PostgreSQL 16 database.
   - **`zippr-backend`**: FastAPI web service (runs migrations and seeds initial accounts automatically).
   - **`zippr-frontend`**: React 18 static site with SPA URL rewrites.
6. Click **Apply**. Render will build and deploy all services!

### Option 2: Manual Deployment on Render

#### 1. PostgreSQL Database
- Create a new **PostgreSQL** database on Render named `zippr-db`.
- Copy the **Internal Database URL** (e.g., `postgres://...`).

#### 2. Backend Web Service
- Create a new **Web Service** connecting your repository.
- **Root Directory**: `backend`
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `alembic upgrade head && python -m app.db.seed && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Health Check Path**: `/health`
- **Environment Variables**:
  - `DATABASE_URL`: Your PostgreSQL connection string.
  - `SECRET_KEY`: A 32+ character random string.
  - `ENVIRONMENT`: `production`
  - `CORS_ORIGINS`: `*` (or your frontend URL)

#### 3. Frontend Static Site
- Create a new **Static Site** on Render.
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Environment Variables**:
  - `VITE_API_URL`: Your backend URL (e.g. `https://zippr-backend.onrender.com`)
  - `VITE_WS_URL`: Your backend WebSocket URL (e.g. `wss://zippr-backend.onrender.com`)
- **Redirects / Rewrites**:
  - Add a rewrite rule: Source `/*` -> Destination `/index.html` -> Action `Rewrite`.

---

## License

MIT — see LICENSE file.

