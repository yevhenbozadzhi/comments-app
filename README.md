# Comments App

Single-page application for posting comments with CAPTCHA, file attachments, nested replies (one level), sorting, pagination, live updates via WebSocket, and optional JWT authentication.

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Express.js (JavaScript) |
| ORM | Prisma |
| Database | PostgreSQL |
| Frontend | Next.js (React, TypeScript) |
| Real-time | Socket.io |
| Auth (Junior) | JWT (register / login) |

## Features

- Guest comments: username, email, homepage (optional), text, CAPTCHA
- Registered users: post without re-entering username/email (JWT)
- Allowed HTML in text: `<a>`, `<code>`, `<i>`, `<strong>` (sanitized on server)
- Root comments table with sort by **User**, **Email**, **Date** (↑↓)
- Pagination: 25 comments per page, newest first (LIFO) by default
- Replies to root comments (one nesting level)
- Image upload (JPG/PNG/GIF, resized to 320×240) and `.txt` files (max 100 KB)
- Lightbox2 for images, download link for text files
- AJAX preview before submit
- Tag toolbar for HTML tags
- WebSocket: new root comments appear without full page reload
- Rate limiting and security headers (Helmet)

## Project structure

```
comments-app/
├── backend/          # Express API, Prisma, uploads
├── frontend/         # Next.js UI
├── docs/             # PLAN, database schema SQL
├── docker-compose.yml
├── README.md
└── .env.example
```

## Requirements

- Node.js 20+ (local development)
- PostgreSQL 14+ (local development)
- **Docker + Docker Compose** (required for submission — see [Docker](#docker))

## Docker

Packaged with PostgreSQL, API, and UI. From the project root:

```bash
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:3001 |
| PostgreSQL | localhost:5432 (`comments` / `comments` / `comments_app`) |

Stop:

```bash
docker compose down
```

Uploaded files are stored in the Docker volume `uploads`.

### Production (VPS)

See **[docs/DEPLOY.md](docs/DEPLOY.md)** for full steps.

```bash
cp .env.deploy.example .env.deploy
# edit YOUR_SERVER_IP and secrets
docker compose -f docker-compose.prod.yml --env-file .env.deploy up --build -d
```

Add to README after deploy: `Live demo: http://YOUR_SERVER_IP:3000`

## Quick start (without Docker)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd comments-app

cd backend && npm install
cd ../frontend && npm install
```

### 2. Database

Create a PostgreSQL database, then configure `DATABASE_URL` in `backend/.env` (see [Environment variables](#environment-variables)).

```bash
cd backend
npx prisma db push
# or: npm run prisma:migrate
```

### 3. Environment files

Copy examples and fill in real values:

```bash
cp .env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 4. Run backend

```bash
cd backend
npm run dev
```

API: `http://localhost:3001`

### 5. Run frontend

```bash
cd frontend
npm run dev
```

App: `http://localhost:3000`

## Environment variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | API port (default `3001`) |
| `JWT_ACCESS_SECRET` | Secret for access tokens |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend URL, e.g. `http://localhost:3001` |

See `backend/.env.example` and `frontend/.env.example` for templates.

## API endpoints

Base path: `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/captcha` | New CAPTCHA (sessionId + SVG) |
| GET | `/comments?page&sortBy&sortOrder` | Root comments + pagination |
| GET | `/comments/:id/replies` | Replies for a comment |
| POST | `/comments` | Create comment (guest or `Authorization: Bearer`) |
| POST | `/comments/:id/reply` | Reply to root comment |
| POST | `/comments/preview` | Preview HTML without saving |
| POST | `/comments/:id/attachments` | Upload file (multipart) |
| DELETE | `/comments/:id` | Delete comment |
| POST | `/register` | Register user (+ CAPTCHA) |
| POST | `/login` | Login (+ CAPTCHA) |
| GET | `/me` | Current user (JWT required) |

Static uploads: `GET /uploads/images/...`, `GET /uploads/text/...`

## Database schema

SQL reference: [`docs/db-schema.sql`](docs/db-schema.sql)  
Prisma source of truth: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

## Scripts

**Backend**

- `npm run dev` — development with nodemon
- `npm start` — production
- `npm run prisma:migrate` — Prisma migrations
- `npm run prisma:studio` — Prisma Studio GUI

**Frontend**

- `npm run dev` — Next.js dev server
- `npm run build` — production build
- `npm start` — run production build

## Git workflow (recommended)

- `main` — stable
- `dev` — integration
- `feature/*` — small feature branches

## License

ISC
