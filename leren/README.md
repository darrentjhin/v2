# Leren — AI Live Tutor

A full-stack AI tutoring platform with voice, screen capture, practice mode, and a teacher dashboard.

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind CSS |
| Backend | Node + Express + TypeScript |
| Database | Prisma ORM (SQLite dev / Postgres-ready) |
| AI | OpenAI (Whisper transcription + GPT-4o responses) |
| Auth | JWT (30-day tokens, bcryptjs hashing) |
| Billing | Stripe Checkout + Webhooks |
| Deploy | Docker + docker-compose |

## Project structure

```
leren/
├── apps/
│   ├── web/          # Vite React TS frontend
│   └── api/          # Express TS backend
│       ├── prisma/   # Prisma schema + migrations
│       └── src/
│           ├── ai/       # OpenAI provider
│           ├── lib/      # Prisma client, JWT, logger
│           ├── middleware/
│           └── routes/   # auth, profile, settings, tutor, saved, practice, progress, assignments, teacher, billing
└── packages/
    └── shared/       # Shared TS types
```

## Quick start

### Prerequisites

- Node 20+
- pnpm (`npm install -g pnpm --prefix ~/.npm-global`)

### 1. Install

```bash
cd leren
pnpm install
```

### 2. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
# Fill in OPENAI_API_KEY, JWT_SECRET, Stripe keys
```

### 3. Run database migration

```bash
cd apps/api
npx prisma migrate dev
```

### 4. Start development

```bash
# From repo root
pnpm dev
# → API:  http://localhost:4000
# → Web:  http://localhost:5173
```

## Environment variables (apps/api/.env)

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | SQLite path (`file:./dev.db`) or Postgres URL |
| `JWT_SECRET` | ✅ | Secret for signing JWTs |
| `OPENAI_API_KEY` | ✅ | OpenAI API key for transcription + GPT-4o |
| `PORT` | — | API port (default: 4000) |
| `CLIENT_URL` | — | Frontend URL for CORS (default: http://localhost:5173) |
| `STRIPE_SECRET_KEY` | Optional | Stripe secret (billing feature) |
| `STRIPE_WEBHOOK_SECRET` | Optional | Stripe webhook signing secret |
| `STRIPE_PRO_PRICE_ID` | Optional | Stripe Price ID for Pro plan |

## API routes

### Auth
- `POST /api/auth/register` — `{email, password}`
- `POST /api/auth/login` — `{email, password}` → `{token}`
- `GET  /api/auth/me` — current user + profile + settings

### Live Tutor
- `POST /api/tutor/session` — create session
- `GET  /api/tutor/sessions` — list sessions
- `POST /api/tutor/session/:id/turn` — upload audio + screenshot (multipart)
- `GET  /api/tutor/session/:id/poll?since=ISO` — poll for new turns

### Practice
- `POST /api/practice/generate` — `{subject, difficulty, count}` → AI-generated problem set
- `POST /api/practice/attempt` — `{problemId, answer}` → AI-graded result

### Progress
- `GET /api/progress` — accuracy, streak, timeseries, weak topics

### Assignments
- `POST /api/assignments/upload` — upload image/PDF
- `POST /api/assignments/:id/analyze` — AI extracts summary + questions

### Teacher
- `POST /api/teacher/classrooms`
- `POST /api/teacher/classrooms/:id/enroll`
- `GET  /api/teacher/classrooms/:id/analytics`

### Billing
- `POST /api/billing/create-checkout-session`
- `POST /api/billing/webhook`

## Deploy with Docker

```bash
cp apps/api/.env.example .env
# Set JWT_SECRET, OPENAI_API_KEY, STRIPE keys

docker-compose up --build
# → Web: http://localhost:80
# → API: http://localhost:4000
```

## Milestone notes

### Milestone 1 — Foundation
Monorepo with pnpm workspaces, Vite React TS frontend, Express TS backend, Tailwind CSS dark theme.

### Milestone 2 — Auth + DB
Prisma schema with all models (User, Profile, Settings, TutorSession, TutorTurn, SavedExplanation, PracticeSet, PracticeProblem, Attempt, Assignment, Classroom, Enrollment, ClassAssignment). JWT auth, bcryptjs hashing.

### Milestone 3 — Live Tutor
Mic + screen capture via browser APIs. Real-time VAD (RMS threshold). Auto-reply when you stop speaking. Session/turn storage. Polling for AI responses.

### Milestone 4 — AI Integration
OpenAI Whisper for transcription. GPT-4o for tutor replies with optional screenshot context. Bilingual mode support. Practice problem generation. Assignment parsing.

### Milestone 5 — Full Feature Set
Saved explanations, practice mode with AI grading, progress analytics (accuracy/streak/weak topics), assignment upload + parse, teacher dashboard with classroom management.

### Milestone 6 — Billing + Security
Stripe Checkout + webhooks for Pro plan. Helmet, rate limiting, CORS allowlist, structured error format, Pino logging with request IDs.

### Milestone 7 — Deployment
Docker multi-stage builds for both apps. Nginx reverse proxy for the frontend. docker-compose for full-stack deployment.
