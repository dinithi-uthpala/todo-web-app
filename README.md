# Todo Web Application

A full-stack Todo application with a Laravel backend API and a Next.js frontend. The app supports user registration, login, authenticated Todo management, and task filtering.

---

## Project Overview

This repository contains two separate applications:

- `backend/` — Laravel API server using Sanctum for authentication
- `frontend/` — Next.js user interface with TypeScript and Tailwind CSS

The frontend communicates with the backend through JSON API calls using a Bearer token stored in `localStorage`.

---

## Features

- User registration
- User login
- Authentication with Sanctum token
- Create Todo
- View Todos
- Edit Todo
- Delete Todo
- Mark Todo as completed
- Mark Todo as pending
- Search Todos by title or description
- Filter Todos by status
- Dashboard statistics for total/completed/pending tasks
- Responsive UI with Tailwind CSS

---

## Technology Stack

- **Frontend**
  - Next.js `16.3.0`
  - React `19.2.8`
  - TypeScript
  - Tailwind CSS `4`
- **Backend**
  - Laravel `13.x`
  - PHP `^8.3`
  - Laravel Sanctum
- **Database**
  - Laravel `.env.example` defaults to `sqlite`
- **Authentication**
  - API token authentication via Laravel Sanctum
  - Frontend stores token in `localStorage`
- **Styling / UI**
  - Tailwind CSS
  - Custom component styles in `frontend/src/app/globals.css`
- **Development tools**
  - `npm`
  - `composer`
  - `artisan`
  - `vite`

---

## Project Structure

### Root

- `backend/`
- `frontend/`

### Backend

- `backend/app/Http/Controllers/Api/`
  - `AuthController.php`
  - `TodoController.php`
- `backend/app/Models/`
  - `User.php`
  - `Todo.php`
- `backend/routes/api.php`
- `backend/database/migrations/`
  - `2026_08_08_130000_create_todos_table.php`
  - user, cache, jobs migrations
- `backend/database/factories/`
  - `TodoFactory.php`
- `backend/tests/Feature/`
  - `AuthApiTest.php`
  - `TodoApiTest.php`

### Frontend

- `frontend/src/app/`
  - `page.tsx`
  - `login/page.tsx`
  - `register/page.tsx`
  - `dashboard/page.tsx`
  - `globals.css`
- `frontend/src/lib/`
  - `api.ts`
  - `auth.ts`
- `frontend/src/types/`
  - `todo.ts`
- `frontend/package.json`
- `frontend/tsconfig.json`

---

## API Endpoints

| Method | Endpoint | Purpose | Auth required |
| --- | --- | --- | --- |
| POST | `/api/register` | Register new user | No |
| POST | `/api/login` | Login and receive token | No |
| POST | `/api/logout` | Revoke current token | Yes |
| GET | `/api/user` | Fetch authenticated user | Yes |
| GET | `/api/todos` | List user's Todos | Yes |
| POST | `/api/todos` | Create new Todo | Yes |
| GET | `/api/todos/{todo}` | Get a single Todo | Yes |
| PUT | `/api/todos/{todo}` | Update a Todo | Yes |
| DELETE | `/api/todos/{todo}` | Delete a Todo | Yes |
| PATCH | `/api/todos/{todo}/complete` | Mark Todo completed | Yes |
| PATCH | `/api/todos/{todo}/pending` | Mark Todo pending | Yes |

### Notes
- `GET /api/todos` accepts query parameters:
  - `search` — text search on title or description
  - `status` — `completed` or `pending`

---

## Authentication

- Backend uses Laravel Sanctum.
- Registration and login return a plain text token.
- Frontend stores the token under `todo_app_auth_token` in `localStorage`.
- Dashboard requests include `Authorization: Bearer <token>`.
- Protected API routes are grouped under `auth:sanctum`.

---

## Database

### Key tables

- `users`
  - `id`, `name`, `email`, `password`, `remember_token`, timestamps
- `todos`
  - `id`
  - `user_id` (foreign key, cascade delete)
  - `title`
  - `description`
  - `completed`
  - timestamps

### Relationships

- `User` has many `Todo`
- `Todo` belongs to `User`

---

## Installation and Setup

### Prerequisites

- PHP `^8.3`
- Composer
- Node.js / npm
- SQLite, MySQL, or another supported database
- Git

### Clone repository

```bash
git clone <https://github.com/dinithi-uthpala/todo-web-app.git>
cd todo-web-app
