# Cobra Studio — Pet Adoption Board

Full-stack application for a **pet adoption board** built as the Cobra Studio Backend Technical Assessment (Option E).

Users can browse available pets, submit adoption applications, and track their status. Staff members manage the pet catalog and review applications through a dedicated dashboard.

```
apps/
├── api/   NestJS REST API        → http://localhost:3000
└── web/   React + Vite frontend  → http://localhost:5173
```

---

## Quick Start

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14 running on `localhost:5432`
- npm ≥ 10

### Setup

```bash
# 1. Install all workspace dependencies
npm install

# 2. Configure the API environment
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — set DB_PASSWORD and a strong JWT_SECRET

# 3. Create the database (Sequelize creates tables, not the database itself)
psql -U postgres -c "CREATE DATABASE pet_adoption;"

# 4. Start both apps concurrently (auto-syncs DB schema on first run)
npm run dev

# 5. Seed the database (first time only)
cd apps/api && npm run seed
```

| App      | URL                            |
|----------|--------------------------------|
| Frontend | http://localhost:5173          |
| REST API | http://localhost:3000          |
| Swagger  | http://localhost:3000/api/docs |

---

## Seed Credentials

| Role  | Email             | Password     |
|-------|-------------------|--------------|
| Staff | staff@petadopt.io | staffpass123 |
| User  | alice@example.com | userpass123  |
| User  | bob@example.com   | userpass123  |

---

## Frontend Routes

| Route              | Access | Description                                    |
|--------------------|--------|------------------------------------------------|
| `/`                | Public | Browse pets — paginated, filterable by species |
| `/pets/:id`        | Public | Pet detail + adoption application form         |
| `/login`           | Public | Login with email and password                  |
| `/register`        | Public | Create a user account                          |
| `/my-applications` | User   | Track submitted applications and their status  |
| `/staff`           | Staff  | Manage pet listings + approve / reject apps    |

---

## Stack

| Layer    | Technology                                                    |
|----------|---------------------------------------------------------------|
| API      | NestJS 11 · TypeScript strict · Sequelize v6 · PostgreSQL 16 |
| Frontend | React 18 · Vite · TypeScript strict · Tailwind CSS            |
| Auth     | JWT Bearer tokens — `@nestjs/jwt` + Passport                 |
| Monorepo | npm workspaces · concurrently                                 |

See [apps/api/README.md](apps/api/README.md) for full API documentation, data model, and architecture details.
