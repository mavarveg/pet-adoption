Run the API unit test suite.

Execute: `npm run test --workspace=apps/api`

Tests live in `apps/api/src/**/__tests__/*.spec.ts` and mock repository ports directly — no NestJS TestingModule, no database required.

To run with coverage: `npm run test:cov --workspace=apps/api`
