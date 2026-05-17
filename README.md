# News Article Manager

A full-stack CRUD application for managing news articles, built as a take-home assignment for Handshakes.ai.

The application consists of a React + TypeScript frontend and an Express + SQLite backend, allowing users to create, view, edit, search, and delete news articles with pagination support.

---

## Features

### Core Features
- Create new articles via a validated form
- View all articles in a paginated list
- Update existing articles (pre-filled form)
- Form validation with React Hook Form + Zod (required fields, length constraints, future-date prevention)
- Two-page navigation via React Router
- Persistent storage in a SQLite database

### Bonus Features
- Refresh button to reload articles
- Delete articles with confirmation dialog
- Pagination (5 articles per page)
- Live search (debounced, filters by title or publisher, backend-driven SQL LIKE query)
- Success / error feedback for all user actions
- Loading states during async operations

---

## Tech Stack

### Frontend (`client/`)
- Vite + React 18 + TypeScript
- React Router v6 — page routing
- Axios — HTTP client
- React Bootstrap + Bootstrap 5 — UI components and styling
- React Hook Form + Zod — form state management and validation

### Backend (`server/`)
- Express — web framework
- TypeScript
- sql.js — SQLite implementation (pure JavaScript, no native build tools required)
- CORS middleware

---

## Project Structure
news-article-assignment/
├── client/                       # React frontend
│   ├── src/
│   │   ├── components/           # Reusable UI components
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── Navbar.tsx
│   │   │   └── PaginationControls.tsx
│   │   ├── pages/                # Top-level page components
│   │   │   ├── ArticleFormPage.tsx
│   │   │   └── ArticleListPage.tsx
│   │   ├── schemas/              # Zod validation schemas
│   │   │   └── articleSchema.ts
│   │   ├── services/             # API service layer (Axios)
│   │   │   └── articleService.ts
│   │   ├── types/                # Shared TypeScript types
│   │   │   └── article.ts
│   │   ├── App.tsx               # Root component with routes
│   │   └── main.tsx              # Entry point
│   └── vite.config.ts            # Vite config with /api proxy
├── server/                       # Express backend
│   ├── src/
│   │   ├── db/
│   │   │   └── database.ts       # SQLite setup and seeding
│   │   ├── routes/
│   │   │   └── articles.ts       # CRUD endpoints
│   │   ├── types/
│   │   │   └── article.ts        # Shared types
│   │   └── index.ts              # Express server entry
│   └── tsconfig.json
├── .gitignore
└── README.md

---

## Getting Started

### Prerequisites

- Node.js v18 or higher (tested on v20.17.0) — https://nodejs.org/
- npm (comes bundled with Node.js)
- Git — https://git-scm.com/

No additional database installation is required. The sql.js library runs in pure JavaScript and stores data in a local file (`server/articles.db`).

### Installation

1. Clone the repository

```bash
   git clone https://github.com/jyyong34/news-article-assignment.git
   cd news-article-assignment
```

2. Install backend dependencies

```bash
   cd server
   npm install
```

3. Install frontend dependencies

```bash
   cd ../client
   npm install
```

### Running the Application

You will need two terminals open: one for the backend, one for the frontend.

#### Terminal 1 — Start the backend

```bash
cd server
npm run dev
```

The backend will start on http://localhost:3001. On first run, it auto-creates the SQLite database and seeds 5 sample articles.

You should see:
Seeded 5 sample articles into the database
Server running on http://localhost:3001
API available at http://localhost:3001/api/articles

#### Terminal 2 — Start the frontend

```bash
cd client
npm run dev
```

The frontend will start on http://localhost:5173.

Open http://localhost:5173 in your browser to use the app.

---

## API Reference

All endpoints are prefixed with `/api/articles`. The frontend uses Vite's proxy to forward requests, so `/api/*` calls automatically reach `http://localhost:3001`.

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/api/articles` | List articles (paginated, searchable) | `page`, `limit`, `search` |
| GET | `/api/articles/:id` | Get a single article | — |
| POST | `/api/articles` | Create a new article | — |
| PUT | `/api/articles/:id` | Update an existing article | — |
| DELETE | `/api/articles/:id` | Delete an article | — |
| GET | `/api/health` | Health check | — |

### Example: Fetch with search and pagination
GET http://localhost:3001/api/articles?page=1&limit=5&search=noodles

### Article schema (POST/PUT body)

```json
{
  "title": "Article title",
  "summary": "Article summary text",
  "date": "2026-05-15",
  "publisher": "Saigon Times"
}
```

---

## Form Validation Rules

All rules are enforced both client-side (Zod) and server-side (Express):

| Field | Rules |
|-------|-------|
| Title | Required, 3–200 characters |
| Summary | Required, 10–2000 characters |
| Date | Required, valid date, not in the future |
| Publisher | Required, max 100 characters |

---

## Pages

### Page 1 — Create / Update Articles (`/create` and `/edit/:id`)
- Form with title, summary, date, and publisher fields
- Real-time inline validation messages
- On successful create: form clears for next entry
- On successful update: navigates back to the list page
- Back to List link for navigation

### Page 2 — Articles List (`/`)
- Paginated card layout (5 per page)
- Live search by title or publisher (debounced, 400ms)
- Refresh button
- Edit and Delete buttons on each article
- New Article link to the form

---

## Notes

- The SQLite database file (`server/articles.db`) is gitignored. It is regenerated on first server start with seed data.
- Both client-side and server-side validation are implemented as defense-in-depth.
- Search is implemented as a backend SQL LIKE query for proper integration with pagination.
- The frontend uses Vite's dev proxy (`/api` to `http://localhost:3001`) so there are no CORS issues in development.

---

## Author

jyyong34 — submitted as part of the Handshakes.ai front-end developer take-home assignment.

## License

This project was created for evaluation purposes only.