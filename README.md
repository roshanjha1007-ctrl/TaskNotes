# TaskNotes

A production-grade hybrid Task + Notes app built with React, TypeScript, Express, Prisma, and Supabase.

---

## Architecture

```
tasknotes/
├── backend/          # Node.js + Express + TypeScript + Prisma
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       ├── controllers/task.controller.ts
│       ├── lib/prisma.ts
│       ├── middleware/
│       │   ├── errorHandler.ts
│       │   └── validate.ts
│       ├── routes/task.routes.ts
│       ├── types/index.ts
│       └── index.ts
└── frontend/         # React + TypeScript + Vite
    └── src/
        ├── api/
        │   ├── client.ts
        │   └── tasks.ts
        ├── components/
        │   ├── Header.tsx
        │   ├── FilterBar.tsx
        │   ├── TaskList.tsx
        │   ├── TaskCard.tsx
        │   ├── CreateTaskModal.tsx
        │   └── TaskModal.tsx
        ├── hooks/useTasks.ts
        ├── types/index.ts
        ├── App.tsx
        └── main.tsx
```

---

## REST API

| Method | Endpoint               | Description          |
|--------|------------------------|----------------------|
| GET    | /auth/me               | Get current user     |
| POST   | /tasks                 | Create a task        |
| GET    | /tasks?status=pending  | List tasks (filterable) |
| GET    | /tasks/:id             | Get task by ID       |
| PUT    | /tasks/:id             | Update task          |
| DELETE | /tasks/:id             | Delete task          |
| POST   | /tasks/:id/notes       | Add note to task     |
| DELETE | /tasks/:id/notes/:noteId | Remove note        |

---

## Supabase Setup

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Once created, navigate to **Project Settings → Database**.
3. Copy the direct connection string (port `5432`) for `DATABASE_URL`.
4. Copy the same direct connection string or a dedicated direct URL for `DIRECT_URL` (used by Prisma migrations).
5. Navigate to **Project Settings → API** and copy:
   - `Project URL` for `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon public` key for `VITE_SUPABASE_ANON_KEY`
6. This app talks to your hosted Supabase Postgres database through Prisma. It does not require a local Supabase project or `supabase start`.

Update `backend/prisma/schema.prisma` to use `directUrl` for migrations:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Local Development Setup

### Quick Start From The Parent Folder

```bash
# From the repo root
npm run setup
npm run dev
```

This installs backend and frontend dependencies, generates the Prisma client, runs the initial migration against your hosted Supabase database, and then starts both apps.
Before the frontend auth flow will work, replace `VITE_SUPABASE_ANON_KEY` in `frontend/.env` with your real Supabase anon key.

### 1. Backend

```bash
cd backend

# Install dependencies
npm install

# Copy and fill in env
cp .env.example .env
# Edit .env — add your hosted Supabase DATABASE_URL, DIRECT_URL, and SUPABASE_URL

# Generate Prisma client
npm run prisma:generate

# Run migrations (creates tables in your hosted Supabase database)
npm run prisma:migrate

# Start dev server (hot reload)
npm run dev
# → API running on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy env
cp .env.example .env
# Set VITE_SUPABASE_ANON_KEY from Supabase Project Settings → API
# VITE_API_BASE_URL=http://localhost:4000 is usually fine locally

# Start dev server
npm run dev
# → App running on http://localhost:5173
```

---

## Production Build

```bash
# Backend
cd backend && npm run build
node dist/index.js

# Frontend
cd frontend && npm run build
# Serve dist/ with any static file host (Vercel, Netlify, etc.)
```

---

## Features

- ✅ Supabase email/password authentication
- ✅ User-owned private tasks
- ✅ Protected backend task routes with JWT verification
- ✅ Search and pagination
- ✅ Request IDs and rate limiting
- ✅ Create, edit, delete tasks
- ✅ Attach multiple notes to each task
- ✅ Mark tasks complete / pending with one click
- ✅ Filter by All / Pending / Completed
- ✅ Inline task editing in detail modal
- ✅ Skeleton loading states
- ✅ Full TypeScript throughout
- ✅ Prisma ORM with cascade deletes
- ✅ Input validation with structured error responses
- ✅ Dark theme with Syne + DM Mono typography
