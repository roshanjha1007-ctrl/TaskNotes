# TaskNotes

TaskNotes is a lightweight personal productivity app for managing tasks, notes, and daily workflow in one place.

This project was originally made for fun and for personal use. Feel free to explore it, customize it, and adapt it to your own workflow.

## Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express, TypeScript
- Database ORM: Prisma
- Auth and database: Supabase Auth, Supabase Postgres

## Features

- Email/password authentication with Supabase
- Private user-scoped tasks and notes
- Owner-only `For Roshan` tab, verified from the backend
- Create, edit, complete, and delete tasks
- Inline notes on tasks
- Search, filters, and feed-based task flow
- Light and dark mode

## API

- `GET /auth/me`
- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/:id/notes`
- `DELETE /tasks/:id/notes/:noteId`

## Local Setup

```bash
npm run setup
npm run dev
```

Or run each app separately:

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Supabase

Set these env vars before running the app:

- `DATABASE_URL`
- `DIRECT_URL`
- `SUPABASE_URL`
- `OWNER_EMAIL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Build

```bash
npm run build
```
