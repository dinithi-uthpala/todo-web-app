# Todo Web App

A full-stack Todo application with a Laravel backend API and a Next.js + Tailwind CSS frontend.

## Overview

This repository contains two separate applications:

- `backend/` — Laravel application providing authentication and Todo API endpoints
- `frontend/` — Next.js application providing the user interface, authentication flow, and Todo dashboard

The frontend communicates with the backend API via `NEXT_PUBLIC_API_URL`.

---

## Repo Structure

- `backend/`
  - `app/` — Laravel application code
  - `config/` — Laravel config files
  - `database/` — migrations, seeders, factories
  - `public/` — public entrypoint
  - `resources/` — frontend views/assets for Laravel
  - `routes/` — application routes
  - `vendor/` — Composer dependencies
- `frontend/`
  - `src/` — Next.js app source
  - `public/` — static assets and illustrations
  - `package.json` — frontend dependencies and scripts
  - `tsconfig.json` — TypeScript settings
  - `globals.css` — shared Tailwind styles

---

## Features

- User registration and login
- Authenticated Todo dashboard
- Create, update, delete tasks
- Task completion toggle
- Search and filter Todos
- Responsive UI with Tailwind CSS
- Local illustrations and modern theme

---

## Frontend

### Technologies

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4

### Important files

- `frontend/src/app/page.tsx` — homepage
- `frontend/src/app/login/page.tsx` — login page
- `frontend/src/app/register/page.tsx` — registration page
- `frontend/src/app/dashboard/page.tsx` — dashboard page
- `frontend/src/app/globals.css` — shared theme styling
- `frontend/src/lib/api.ts` — API URL helper
- `frontend/src/lib/auth.ts` — token storage helpers

### Setup

1. Open `frontend/`
2. Install dependencies:
   ```bash
   npm install
