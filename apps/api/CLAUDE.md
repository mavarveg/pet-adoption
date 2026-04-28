# CLAUDE.md — AI Workflow Documentation

This file documents how Claude Code was used during the development of this project.
It is included as a deliverable per the Cobra Studio assessment instructions.

---

## Tool

**Claude Code** (Anthropic CLI) — `claude-sonnet-4-6` model, running inside the VS Code extension.

---

## How the AI was used

### 1. Architecture Planning (human decision)

Before writing any code, the architecture was designed and reviewed in conversation:

- Chose **Hexagonal (Ports & Adapters)** over standard NestJS layering to make domain logic testable without a database and to make the IoC boundaries explicit.
- Decided against path aliases (`@shared/*`) because they require `tsconfig-paths` at runtime — unnecessary complexity for an assessment.
- Decided to use `synchronize: true` (dev-only) to skip migrations, keeping local setup to a single command.
- Identified the **approve flow** as the most critical business operation requiring an atomic transaction.

### 2. Code Generation

Claude Code generated all source files in this order:

1. NestJS scaffold (`nest new`) + TypeScript strict config
2. Shared layer: `DatabaseModule`, `GlobalExceptionFilter`, `JwtAuthGuard`, `RolesGuard`, `@CurrentUser` decorator, `@Roles` decorator
3. Auth module: `UserEntity`, `UserRepositoryPort`, `RegisterUseCase`, `LoginUseCase`, `UserModel`, `SequelizeUserRepository`, `JwtStrategy`, `AuthController`, `AuthModule`
4. Pets module: `PetEntity`, `PetRepositoryPort`, use cases (list/get/create/update), `PetModel`, `SequelizePetRepository`, `PetsController`, `PetsModule`
5. Applications module: `AdoptionApplicationEntity`, `ApplicationRepositoryPort`, `SubmitApplicationUseCase`, `ReviewApplicationUseCase`, `GetMyApplicationsUseCase`, `AdoptionApplicationModel`, `SequelizeApplicationRepository`, `ApplicationsController`, `ApplicationsModule`
6. React frontend: `AuthContext`, `BrowsePetsPage`, `PetDetailPage`, `MyApplicationsPage`, `StaffDashboardPage`, `api.ts` client
7. Seed script, Jest unit tests, README, this file

### 3. Review and Corrections During Generation

The human caught and corrected:

- A `require()` inline in the applications controller → replaced with a top-level import.
- `baseUrl` deprecation warning in `tsconfig.json` → removed `baseUrl` and path aliases entirely.
- The `rejectAllPendingForPet` logic was reviewed to confirm the `WHERE status = pending` clause already excludes the just-approved application because `updateStatus(Approved)` runs first in the transaction.

### 4. Senior Code Review Pass

After initial generation, a full review identified and fixed the following issues:

**Security**
- `RegisterDto` exposed a `role` field — any caller could self-register as `staff`. Removed; role is hardcoded to `Role.User` in the use case. Staff accounts are created only via the seed script.

**Hexagonal boundary violations**
- `ReviewApplicationUseCase` directly injected `Sequelize` via `@InjectConnection()` — an ORM dependency inside the application layer. Fixed by introducing `TransactionManagerPort` / `TransactionContext` in `shared/ports/` and implementing it with `SequelizeTransactionManager` in `shared/adapters/`. The use case now depends only on the port interface.
- `UserEntity` (domain) imported `Role` from `shared/decorators/roles.decorator.ts`, a NestJS file. Moved the `Role` enum to `shared/domain/role.enum.ts` (zero framework imports); the decorator re-exports it for use in guards and controllers.

**Transaction bug**
- `petRepository.update()` (mark pet as adopted) was called outside the `sequelize.transaction()` block. A partial failure would leave the application approved but the pet still showing as available. All three operations now run inside `transactionManager.execute()`, with `TransactionContext` threaded through `PetRepositoryPort.update()` and both `ApplicationRepositoryPort` mutation methods.

**Dead code**
- `rejectAllPendingForPet` carried an `excludeId` parameter that was immediately `void`-ed. The `WHERE status = pending` clause excludes the approved application because `updateStatus(Approved)` runs first. Parameter removed from port, adapter, and all call sites.
- `ReviewApplicationDto` was bound with `@Body()` in the approve/reject handlers but the result was discarded (`_dto`). Since the action is encoded in the URL path, no request body is needed. DTO removed from both handlers.

**Data integrity**
- `AdoptionApplicationModel` had a comment claiming a composite unique index `(user_id, pet_id)` was enforced at the DB level. No `@Table({ indexes })` was present. Added the index so concurrent duplicate-application race conditions are caught by the database, not just application code.

**Input validation**
- `:id` path parameters in `PetsController` and `ApplicationsController` had no format validation. Added `ParseUUIDPipe` so malformed IDs return a `400 Bad Request` before reaching the use case or database.

### 5. API Enrichment

The list endpoints originally returned raw `petId` UUIDs in application responses, which is not useful in any UI. A new `ApplicationSummaryEntity` was introduced in the domain layer, and `findAll()` / `findByUserId()` in `SequelizeApplicationRepository` now include a join with `PetModel` to populate `petName` and `petSpecies`. The corresponding frontend cards were redesigned to show the pet's name and species instead of truncated UUIDs.

### 6. Tests

Unit tests were written by Claude Code for:
- `SubmitApplicationUseCase` — all guard clauses (pet not found, not available, duplicate application, existing pending application)
- `RegisterUseCase` — duplicate email conflict, happy path

Tests mock the repository ports directly — no NestJS `TestingModule` overhead, no database.

---

## What Claude did NOT decide

- **Which scenario to build** — Option E (Pet Adoption Board) chosen by the developer.
- **Architecture pattern** — Hexagonal was the developer's explicit requirement.
- **Stack choices** — NestJS + Sequelize + PostgreSQL specified by the assessment.
- **Business rules** — Read directly from the assignment PDF.
- **No migrations** — `synchronize: true` for dev was a deliberate call; the tradeoff was weighed and accepted.

---

## Prompting strategy

- Architecture analysis was done in a single long prompt before any code was written.
- Implementation was broken into sequential steps (shared → auth → pets → applications → frontend), each confirmed before the next started.
- The review pass was driven by explicit file reads and targeted edits rather than full file regeneration, keeping diffs reviewable.
- Corrections were made by pointing Claude Code to the specific problematic line rather than re-generating entire files.

---

## Files generated with AI assistance

All `.ts` source files under `src/` and all `.tsx` source files under the frontend `src/` were generated by Claude Code.  
All decisions (architecture, stack, naming, corrections) were made by the developer.
