Full pre-commit validation: typecheck both workspaces, lint the API, then run tests.

Run these in order and report any failures:

1. `cd apps/api && npx tsc --noEmit`
2. `cd apps/web && npx tsc --noEmit`
3. `npm run lint --workspace=apps/api`
4. `npm run test --workspace=apps/api`

Stop and report if any step fails. All four must pass before committing.
