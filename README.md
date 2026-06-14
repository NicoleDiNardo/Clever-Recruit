# Clever Recruit

A full-stack recruitment platform built with React, Mantine, Express, and PostgreSQL.

## Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Mantine v7 (UI components)
- Tabler Icons
- React Router v6
- TanStack Query

**Backend:**
- Node.js + Express 5
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL running locally
- npm

### Setup

1. Install dependencies:
```bash
npm install
```

2. Configure the database - edit `server/.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/clever_recruit?schema=public"
JWT_SECRET="your-secret-key"
PORT=3001
```

3. Run database migrations:
```bash
cd server
npx prisma migrate dev --name init
```

4. Seed the database:
```bash
npm run db:seed
```

5. Start development servers:
```bash
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

### Demo Login

- Email: `jenny@cleverrecruit.com`
- Password: `password123`

## Project Structure

```
├── client/              # React frontend
│   ├── src/
│   │   ├── api/         # API client functions
│   │   ├── components/  # Shared components (AppLayout, Sidebar)
│   │   ├── data/        # Mock data for development
│   │   ├── pages/       # Page components
│   │   │   ├── Dashboard/
│   │   │   ├── Candidates/
│   │   │   ├── Jobs/
│   │   │   ├── Companies/
│   │   │   └── Team/
│   │   ├── styles/      # Global styles
│   │   ├── theme/       # Mantine theme configuration
│   │   └── types/       # TypeScript interfaces
│   └── package.json
├── server/              # Express backend
│   ├── prisma/          # Database schema
│   ├── src/
│   │   ├── lib/         # Prisma client
│   │   ├── middleware/  # Auth, error handling
│   │   ├── routes/      # API endpoints
│   │   └── seed.ts      # Database seeder
│   └── package.json
└── package.json         # Root workspace
```

## Features

- **Dashboard** - KPI cards, recruitment pipeline visualization, recent activity feed
- **Candidates** - Sortable/filterable data table, detail panel with notes & tasks, create form
- **Jobs** - Job listings management with company associations
- **Companies** - Company directory with open positions tracking
- **Team** - Team member cards with workload and performance stats
- **Responsive** - Mobile-first design with collapsible sidebar navigation
