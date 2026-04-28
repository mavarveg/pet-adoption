# Pet Adoption API

REST API for a pet adoption board — **Cobra Studio Backend Technical Assessment (Option E)**.

Built with **NestJS · TypeScript strict · PostgreSQL · Sequelize v6 · Hexagonal Architecture**.

---

## Local Setup

### Prerequisites

- Node.js ≥ 20
- PostgreSQL ≥ 14
- npm ≥ 10

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd apps/api
npm install

# 2. Copy and configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD and a strong JWT_SECRET

# 3. Create the database (Sequelize creates tables, not the database itself)
psql -U postgres -c "CREATE DATABASE pet_adoption;"

# 4. Start the API (auto-syncs DB schema on first run)
npm run start:dev

# 5. Seed the database
npm run seed

# 6. Explore the API
# http://localhost:3000/api/docs
```

---

## Environment Variables

| Variable         | Description                  | Default        |
|------------------|------------------------------|----------------|
| `DB_HOST`        | PostgreSQL host               | `localhost`    |
| `DB_PORT`        | PostgreSQL port               | `5432`         |
| `DB_USERNAME`    | PostgreSQL user               | `postgres`     |
| `DB_PASSWORD`    | PostgreSQL password           | `postgres`     |
| `DB_NAME`        | Database name                 | `pet_adoption` |
| `JWT_SECRET`     | Secret for JWT signing        | *(required)*   |
| `JWT_EXPIRATION` | Token TTL (e.g. `7d`, `1h`) | `7d`           |
| `PORT`           | HTTP port                     | `3000`         |
| `WEB_ORIGIN`     | Allowed CORS origin           | `http://localhost:5173` |

---

## Seed Credentials

After running `npm run seed`:

| Role  | Email             | Password     |
|-------|-------------------|--------------|
| Staff | staff@petadopt.io | staffpass123 |
| User  | alice@example.com | userpass123  |
| User  | bob@example.com   | userpass123  |

---

## Data Model

```
┌──────────────────────┐          ┌────────────────────────────────┐
│         User         │          │              Pet               │
├──────────────────────┤          ├────────────────────────────────┤
│ id          UUID PK  │          │ id          UUID PK            │
│ name        VARCHAR  │          │ name        VARCHAR            │
│ email       VARCHAR  │◀─┐    ┌─▶│ species     VARCHAR  [idx]     │
│             UNIQUE   │  │    │  │ breed       VARCHAR            │
│ password    VARCHAR  │  │    │  │ age         INTEGER            │
│ role        ENUM     │  │    │  │ description TEXT               │
│             user     │  │    │  │ imageUrl    VARCHAR            │
│             staff    │  │    │  │ status      ENUM     [idx]     │
└──────────────────────┘  │    │  │             available          │
                           │    │  │             pending            │
                           │    │  │             adopted           │
                           │    │  └────────────────────────────────┘
                           │    │
              ┌────────────┴────┴──────────────────┐
              │        AdoptionApplication          │
              ├─────────────────────────────────────┤
              │ id       UUID PK                    │
              │ userId   UUID FK → User             │
              │ petId    UUID FK → Pet              │
              │ status   ENUM     [idx]             │
              │          pending                    │
              │          approved                   │
              │          rejected                   │
              │ message  TEXT                       │
              │                                     │
              │ UNIQUE (userId, petId)              │
              └─────────────────────────────────────┘
```

**Relationships**
- One `User` → many `AdoptionApplication`
- One `Pet` → many `AdoptionApplication`
- One user can only have one application per pet (DB-level unique constraint)

---

## API Endpoints

Full interactive documentation available at `/api/docs` (Swagger UI).

### Auth

| Method | Path             | Access | Description         |
|--------|------------------|--------|---------------------|
| POST   | `/auth/register` | Public | Register a new user |
| POST   | `/auth/login`    | Public | Login, receive JWT  |

### Pets

| Method | Path        | Access | Description                                   |
|--------|-------------|--------|-----------------------------------------------|
| GET    | `/pets`     | Public | List pets (paginated, filterable by species)  |
| GET    | `/pets/:id` | Public | Get pet detail                                |
| POST   | `/pets`     | Staff  | Add a new pet listing                         |
| PATCH  | `/pets/:id` | Staff  | Update a pet listing (name, status, etc.)     |

### Applications

| Method | Path                        | Access | Description                                              |
|--------|-----------------------------|--------|----------------------------------------------------------|
| POST   | `/applications`             | User   | Submit adoption application for a pet                    |
| GET    | `/applications/me`          | User   | View my applications (includes pet name and species)     |
| GET    | `/applications`             | Staff  | List all applications (includes pet name and species)    |
| PATCH  | `/applications/:id/approve` | Staff  | Approve an application (atomic: adopts pet, rejects others) |
| PATCH  | `/applications/:id/reject`  | Staff  | Reject an application                                    |

---

## Business Logic

- A pet may only have **one active (pending) application** at a time.
- A user **cannot apply for the same pet twice** — enforced at both application and database level.
- Only a pet with status `available` can receive applications.
- **Approving** an application triggers an atomic transaction:
  1. Application status → `approved`
  2. Pet status → `adopted`
  3. All other pending applications for the same pet → `rejected`
- A pet cannot be reviewed (approve/reject) if it has already been reviewed.

---

## Architecture — Hexagonal (Ports & Adapters)

Each NestJS module is divided into three isolated layers:

```
src/modules/<name>/
├── domain/
│   ├── entities/        ← Pure TypeScript classes — no framework imports
│   └── ports/out/       ← Repository interfaces (e.g. PetRepositoryPort)
├── application/
│   └── use-cases/       ← Business logic orchestration — depends only on ports
└── infrastructure/
    ├── adapters/in/     ← NestJS controllers (HTTP entry points)
    ├── adapters/out/    ← Sequelize repository implementations
    ├── models/          ← Sequelize ORM model definitions
    └── dtos/            ← Request validation (class-validator)
```

Cross-cutting infrastructure concerns live in `src/shared/`:

```
src/shared/
├── domain/              ← Shared enums (Role)
├── ports/               ← TransactionManagerPort
├── adapters/            ← SequelizeTransactionManager
├── guards/              ← JwtAuthGuard, RolesGuard
├── decorators/          ← @CurrentUser, @Roles
└── filters/             ← GlobalExceptionFilter
```

Business rules live exclusively in the domain and application layers — fully testable in pure TypeScript without a database or HTTP server.

---

## Notable Design Decisions

**Hexagonal architecture**  
Use cases depend on port interfaces (`PetRepositoryPort`, `ApplicationRepositoryPort`), never on Sequelize classes. Swapping the database adapter requires changing only the infrastructure layer.

**`TransactionManagerPort`**  
The approve flow requires an atomic transaction across three operations. Rather than injecting `Sequelize` directly into the use case (which would leak ORM concerns into the application layer), `TransactionManagerPort` exposes an opaque `TransactionContext`. `SequelizeTransactionManager` in `shared/adapters/` holds the only reference to the Sequelize connection.

**`ApplicationSummaryEntity`**  
The list endpoints (`GET /applications`, `GET /applications/me`) return `petName` and `petSpecies` alongside application data. This is modelled as a distinct `ApplicationSummaryEntity` rather than mutating the base `AdoptionApplicationEntity`, keeping the single-query join concern contained in the repository adapter.

**Symbol-based injection tokens**  
`USER_REPOSITORY`, `PET_REPOSITORY`, `APPLICATION_REPOSITORY`, `TRANSACTION_MANAGER` are Symbols, making IoC bindings explicit and avoiding collisions from magic strings.

**`Role` enum in `shared/domain/`**  
The `Role` enum lives in `shared/domain/role.enum.ts` — a file with zero framework imports. `roles.decorator.ts` re-exports it. This keeps `UserEntity` (domain layer) free from any NestJS dependency.

**DB-level unique constraint on `(userId, petId)`**  
`@Table({ indexes: [{ unique: true, fields: ['user_id', 'pet_id'] }] })` ensures duplicate applications are rejected by the database even under concurrent requests, not just by application code.

**`ParseUUIDPipe` on all `:id` params**  
Malformed UUID path parameters return a `400 Bad Request` before reaching the use case or database.

**`synchronize: true` in development**  
Eliminates migration scripts for local setup. Schema is derived directly from Sequelize model definitions. Disabled in production (`NODE_ENV=production`).

**Global `ValidationPipe`**  
`whitelist: true` strips unknown properties; `transform: true` auto-coerces types (e.g. `?page=2` as string → number).

**`GlobalExceptionFilter`**  
Every error response shares the same shape: `{ statusCode, timestamp, path, message }`.

---

## Running Tests

```bash
# Unit tests (no DB or HTTP required)
npm test

# With coverage report
npm run test:cov
```

Tests cover `SubmitApplicationUseCase` (all guard clauses: pet not found, not available, duplicate application, existing pending application) and `RegisterUseCase` (duplicate email, happy path). All mocks target port interfaces — no `TestingModule`, no database.
