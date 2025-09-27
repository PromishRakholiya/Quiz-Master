# Online Quiz System 

A fullstack, role-based online quiz system with timed attempts, automatic scoring, leaderboards, and history tracking.

## Features

- Admin: Create, edit, delete quizzes and questions. View leaderboard and analytics.
- Student: Browse quizzes, take timed quizzes, view results and history, see leaderboards.
- Role-based access control and JWT authentication.
- Timers with auto-submit on expiry.
- Leaderboards per quiz; per-user attempt history.
- Optional randomization of questions and options.
- Secure API with Helmet, rate limiting, and validation.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: React (Vite), React Router, Context API, Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB running locally or a MongoDB Atlas URI

### 1) Backend Setup

1. Copy `.env.example` to `.env` in `backend/` and update values if needed.
2. Install dependencies and run the server:

```bash
# From project root
npm --prefix backend install
npm --prefix backend run dev
```

Backend runs at http://localhost:5000

### 2) Frontend Setup

1. Install dependencies and start dev server:

```bash
# From project root
npm --prefix frontend install
npm --prefix frontend run dev
```

Frontend runs at http://localhost:5173

### Environment Variables (backend/.env)

See `backend/.env.example` for all variables.

- `PORT=5000`
- `MONGODB_URI=mongodb://localhost:27017/quiz-system`
- `JWT_SECRET=change_me`
- `JWT_REFRESH_SECRET=change_me_refresh`
- `JWT_EXPIRES_IN=7d`
- `JWT_REFRESH_EXPIRES_IN=30d`
- `FRONTEND_URL=http://localhost:5173`
- `NODE_ENV=development`

### API Overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/quizzes` (auth required)
- `POST /api/quizzes` (admin)
- `POST /api/questions/:quizId` (admin)
- `POST /api/attempts/start/:quizId` (student)
- `POST /api/attempts/submit/:attemptId` (student)
- `GET /api/attempts/leaderboard/:quizId` (auth)

Full routes in `backend/routes/`.

## Development Notes

- Models in `backend/models/` define `User`, `Quiz`, `Question`, `Attempt`.
- Controllers in `backend/controllers/` encapsulate business logic.
- Middlewares enforce auth and roles.
- Utilities like `scoreCalculator` handle scoring and analytics.

## Scripts

- Backend: `npm run dev` uses nodemon.
- Frontend: `npm run dev` starts Vite.

## Team detail

-Team Leader: Daksh Prajapati
-Team Member: Promish Rakholiya & Krish Patel
