# PetAdoption — Monorepo

Full-stack pet adoption board. NestJS REST API + React/Vite frontend, PostgreSQL.

## Workspaces

| App | Path | Port |
|-----|------|------|
| API | `apps/api` | 3000 |
| Web | `apps/web` | 5173 |

## Key commands

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start API + web concurrently |
| `npm run test` | Run API unit tests |
| `npm run build` | Build both workspaces |
| `/seed` | Seed the database (schema + sample data) |
| `/test` | Run tests |
| `/check` | Typecheck + lint + tests (pre-commit) |

## First-time setup

```bash
npm install
cp apps/api/.env.example apps/api/.env   # set DB_PASSWORD + JWT_SECRET
psql -U postgres -c "CREATE DATABASE pet_adoption;"
cd apps/api && npm run seed
npm run dev
```

## Architecture (API)

Hexagonal (Ports & Adapters) — see `apps/api/CLAUDE.md` for the full breakdown.

```
src/modules/<module>/
├── domain/
│   ├── entities/        # plain classes, no framework imports
│   └── ports/           # interfaces (in/out)
├── application/
│   └── use-cases/       # business logic, depends only on ports
└── infrastructure/
    ├── models/          # Sequelize models
    ├── adapters/in/     # controllers
    └── adapters/out/    # repository implementations
```

Key rules:
- Use cases inject ports, never concrete adapters.
- Domain entities have zero NestJS/Sequelize imports.
- Transactions flow through `TransactionManagerPort` / `TransactionContext`.

## Database

PostgreSQL. `synchronize: true` (dev only) — Sequelize auto-creates tables on app start.  
The seed script also creates the schema independently (safe to run before starting the app).

Env file: `apps/api/.env` (copy from `.env.example`)
