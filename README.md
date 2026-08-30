# TaskFlow

A task management app — React frontend, Express backend, **PostgreSQL** database.

This project was reorganized from its original single-repo layout (`client/` + `server/`)
into a clean `frontend/` / `backend/` split, and the database was migrated from
**MongoDB (Mongoose)** to **PostgreSQL**, so the whole stack can be Dockerized and
deployed to a single AWS EC2 instance.

```
taskflow/
├── frontend/            # React + Vite app (was client/) — unchanged
├── backend/              # Express API (was server/) — now uses PostgreSQL
│   └── src/db/schema.sql # Postgres schema (replaces the Mongoose models)
├── docker-compose.yml    # postgres + backend + frontend, one command deploy
└── .env.example          # variables consumed by docker-compose.yml
```

## What changed from the original project

- **Database:** MongoDB/Mongoose → PostgreSQL, accessed with the `pg` driver.
  - `users`, `categories`, and `todos` collections became SQL tables (see
    `backend/src/db/schema.sql`), with the same fields, validation rules,
    indexes, and the `isOverdue` virtual (now computed in `todo.models.js`).
  - Mongo `ObjectId`s became Postgres `UUID`s generated with `gen_random_uuid()`.
  - Mongoose model files were replaced with plain SQL query modules
    (`backend/src/models/*.js`) exposing the same functions the controllers
    already used, so **routes, middleware, and the API's request/response
    shapes are unchanged** — the frontend needed no code changes.
- **Layout:** `client/` → `frontend/`, `server/` → `backend/`, both now sit at
  the project root next to a `docker-compose.yml`.
- **Docker:** added a `Dockerfile` for each service plus `docker-compose.yml`
  so the whole stack (Postgres + API + static frontend behind nginx) starts
  with one command — see below.

## Run locally with Docker (recommended)

1. Copy the root env template and adjust secrets:
   ```bash
   cp .env.example .env
   ```
2. Build and start everything:
   ```bash
   docker compose up -d --build
   ```
   This starts:
   - `postgres` — PostgreSQL 16, with a persisted volume
   - `backend` — waits for Postgres, applies `schema.sql`, then starts the API on `:8000`
   - `frontend` — Vite build served by nginx on `:80`, which proxies `/api/*` to the backend
3. Open `http://localhost` in your browser.

## Run locally without Docker

**Backend**
```bash
cd backend
cp .env.example .env   # point PG* vars at a local Postgres, set JWT_SECRET
npm install
npm run migrate        # applies src/db/schema.sql
npm run dev
```

**Frontend**
```bash
cd frontend
cp .env.example .env   # VITE_API_URL=http://localhost:8000/api
npm install
npm run dev
```

## Deploying to an AWS EC2 instance

1. Provision an EC2 instance (Ubuntu is easiest) and install Docker + the
   Docker Compose plugin. Open inbound port `80` (and `22` for SSH) in its
   security group.
2. Copy this project to the instance (`git clone` or `scp`).
3. In the project root:
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   - Set a strong `PGPASSWORD` and `JWT_SECRET`.
   - Set `CLIENT_URL` / `CORS_ORIGIN` to `http://<your-ec2-public-ip>` (or your domain).
4. Start the stack:
   ```bash
   docker compose up -d --build
   ```
5. Visit `http://<your-ec2-public-ip>` — the frontend is served on port 80 and
   proxies API calls to the backend container internally, so only port 80
   needs to be exposed publicly.
6. Data persists in the `postgres_data` Docker volume across restarts/redeploys.

## Original stack

Kept from the original build: React 19, Vite, Tailwind, Radix UI, React Router,
Express 5, JWT auth, bcrypt password hashing. Only the database layer changed.
