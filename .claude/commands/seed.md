Run the database seed script to insert sample users and pets.

Execute: `cd apps/api && npm run seed`

The seed is idempotent — it creates the schema (ENUMs + tables) if they don't exist and uses ON CONFLICT DO NOTHING for rows, so re-running is safe.

Seed credentials:
- Staff: staff@petadopt.io / staffpass123
- User:  alice@example.com / userpass123
- User:  bob@example.com   / userpass123
