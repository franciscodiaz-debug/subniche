# Stack & Architecture

## Tech Stack
- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **ORM:** Prisma v6 — Database: PostgreSQL via Supabase
- **Validation:** Zod v4
- **Styling:** Tailwind CSS 4

## Backend Architecture
Layered: `Route Handlers → Controllers → Services → Repositories → Prisma`

- Mapper pattern for entity-to-DTO serialization
- Swagger/OpenAPI auto-generated via decorators
- Full convention spec: `.claude/agents/backend.md`

## Frontend Architecture
- Full convention spec: `.claude/agents/frontend.md`

## Testing
- Runner: Vitest v4 — `npm test`
- Coverage: `npx vitest run --coverage` (v8 provider, scope: `server/**`)
- Unit: ✅ | Integration: ❌ | E2E: ❌
- **Strict TDD Mode: ENABLED** — write tests before implementation
- Linter: ESLint 9 — `npm run lint`
- Type check: `npx tsc --noEmit`
