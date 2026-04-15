# TaskNotes

A production-grade hybrid Task + Notes app built with React, TypeScript, Express, Prisma, and Supabase.

---

## Architecture

```text
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

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /auth/me | Get current user |
| POST | /tasks | Create a task |
| GET | /tasks?status=pending | List tasks (filterable) |
| GET | /tasks/:id | Get task by ID |
| PUT | /tasks/:id | Update task |
| DELETE | /tasks/:id | Delete task |
| POST | /tasks/:id/notes | Add note to task |
| DELETE | /tasks/:id/notes/:noteId | Remove note |

---

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. In **Project Settings → Database**, copy:
   - the direct connection string for `DATABASE_URL`
   - the direct connection string or dedicated direct URL for `DIRECT_URL`
3. In **Project Settings → API**, copy:
   - `Project URL` for `SUPABASE_URL` and `VITE_SUPABASE_URL`
   - `anon public` key for `VITE_SUPABASE_ANON_KEY`
4. This app uses your hosted Supabase Postgres database through Prisma. It does not require `supabase start`.

Prisma datasource:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## Local Development

### Quick Start

```bash
npm run setup
npm run dev
```

Before the frontend auth flow will work, replace `VITE_SUPABASE_ANON_KEY` in `frontend/.env` with your real Supabase anon key.

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

---

## Production Build

```bash
npm run build
```

---

## Features

- Supabase email/password authentication
- User-owned private tasks
- Protected backend task routes with JWT verification
- Search and pagination
- Request IDs and rate limiting
- Create, edit, delete tasks
- Attach multiple notes to each task
- Mark tasks complete or pending
