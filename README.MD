# SubNiche

> The marketplace for niche collectors.

## Project status

Pipeline milestone complete. The CI/CD pipeline, branch strategy, and deployment infrastructure are fully configured. The landing page is a placeholder pending designer delivery.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Realtime | Supabase Realtime |
| Deployment | Vercel |
| CI | GitHub Actions |

---

## Environments

| Environment | Branch | URL | DB Schema |
|---|---|---|---|
| Production | `production` | `subniche.com` | `production` |
| QA | `qa` | `qa.subniche.com` | `qa` |
| Development | `develop` | `dev.subniche.com` | `dev` |
| Feature / Preview | `feat/*` `fix/*` | Auto Vercel preview URL | `preview` |

All environments share a single Supabase instance. Isolation is enforced at the PostgreSQL schema level — each environment writes to its own schema inside the same database. The `public` schema is reserved for Supabase internals (auth, storage) and is never touched by the app.

---

## Branch strategy

```
feat/*  →  develop  →  qa  →  production
```

- `feat/*` — one branch per feature. CI must pass before opening a PR.
- `develop` — integration branch. Team tests here. Never push directly.
- `qa` — client review branch. Stable, always deployable.
- `production` — production only. Receives merges from `qa` exclusively.
- `v0/*` — client V0 prototype input. Never merges directly. Used as visual reference only.

All three main branches are protected. No direct pushes. CI must pass. PR required.

---

## Getting started locally

### Prerequisites

- Node.js 22+
- Docker Desktop (for local Supabase)
- Supabase CLI

```bash
# Install Supabase CLI (macOS)
brew install supabase/tap/supabase

# Install Supabase CLI (npm)
npm install -g supabase
```

### Setup

```bash
# Clone the repo
git clone https://github.com/SubNiche/subniche.git
cd subniche

# Install dependencies
npm install --legacy-peer-deps

# Copy env template
cp .env.example .env.local
# Fill in your local Supabase values (see below)

# Start local Supabase
supabase start
# This prints your local URL and anon key — copy them into .env.local

# Start the dev server
npm run dev
```

App runs at `http://localhost:3000`.
Local Supabase Studio runs at `http://localhost:54323`.
API REST runs at `http://localhost:54321`.
Base de datos PostgreSQL runs at `http://localhost:54322`.

### Environment variables

Copy the template and fill in your values:

```bash
cp .env.example .env.local
```

`.env.local` uses `dotenv-expand` variable substitution — set the parts, the URLs are composed automatically:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key-from-supabase-start
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# Database — composed from parts
DB_HOST=127.0.0.1          # local Supabase: 127.0.0.1 | cloud: aws-x-region.pooler.supabase.com
DB_USER=postgres            # local: postgres | cloud: postgres.your-project-ref
DB_PASSWORD=postgres        # your database password
DB_SCHEMA=dev               # target schema: dev | qa | production | preview

# These are auto-composed from the vars above — do not set manually
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:6543/postgres?pgbouncer=true&schema=${DB_SCHEMA}
DIRECT_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:5432/postgres?schema=${DB_SCHEMA}
```

> To switch schemas locally, only change `DB_SCHEMA`. Everything else stays the same.

---

## Available scripts

```bash
npm run dev      # Start dev server with Turbopack
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Testing

```bash
npm run test              # Run unit tests (Vitest)
npm run test:watch        # Run unit tests in watch mode
```

**E2E tests require `NODE_ENV=development`.** The shell default on this machine is `NODE_ENV=production`, which causes the dev server to crash (Turbopack panics; webpack can't find build artifacts). Always prefix:

```bash
NODE_ENV=development npm run test:e2e              # Run all E2E tests
NODE_ENV=development npm run test:e2e:ui           # Open Playwright UI
NODE_ENV=development npx playwright test e2e/tests/register.spec.ts --project=public
```

E2E tests also require environment variables for the authenticated flows:

```bash
E2E_TEST_EMAIL=your@email.com E2E_TEST_PASSWORD=yourpassword NODE_ENV=development npm run test:e2e
```

---

### Prisma

```bash
npx prisma migrate dev --name <migration-name>   # create and apply a new migration
npx prisma migrate deploy                         # apply pending migrations (CI/prod)
npx prisma generate                               # regenerate the TypeScript client
npx prisma studio                                 # open the DB GUI (uses DB_SCHEMA from .env.local)
```

### Supabase commands
```bash
supabase migration new <name>   # create a new SQL migration file
supabase db reset               # apply all migrations from scratch (local)
supabase db push --linked       # push migrations to the linked Supabase project
```

### Logging

Logging is handled by [LogLayer](https://loglayer.dev/).

```ts
import { getLogger } from "@/server/utils/logger"

const logger = getLogger()
logger.info("Hello, world!")
```

---

## Database schemas

All environments share one Supabase instance. Isolation is enforced via PostgreSQL schemas — the `DATABASE_URL` includes `?schema=<env>` which sets Prisma's `search_path`.

| Schema | Environment | Branch |
|---|---|---|
| `public` | Supabase internals only | — |
| `dev` | Development | `develop` |
| `qa` | QA / client review | `qa` |
| `production` | Production | `production` |
| `preview` | Feature branches | `feat/*` `fix/*` |

The schemas are created by the Supabase migration `20260420000000_create_app_schemas.sql`. Prisma migrations populate each schema independently — running `prisma migrate deploy` against a schema only affects that schema's tables.

---

## CI pipeline

Every push to `feat/*`, `fix/*`, `develop`, `qa`, and `production` runs:

1. **Type check** — `tsc --noEmit`
2. **Lint** — ESLint
3. **Build** — `next build` via Vercel CLI
4. **Database migration** — `prisma migrate deploy` targeting the branch's schema

### GitHub secrets

| Secret | Description | New? |
|---|---|---|
| `VERCEL_TOKEN` | Vercel CLI authentication | existing |
| `VERCEL_ORG_ID` | Vercel team/org ID | existing |
| `VERCEL_PROJECT_ID` | Production Vercel project ID | existing |
| `VERCEL_QA_PROJECT_ID` | QA Vercel project ID | existing |
| `VERCEL_DEV_PROJECT_ID` | Development Vercel project ID | existing |
| `SUPABASE_ACCESS_TOKEN` | Supabase CLI authentication | existing |
| `SUPABASE_DB_PASSWORD` | Supabase CLI DB password | existing |
| `DB_HOST` | Supabase pooler host (`aws-x-region.pooler.supabase.com`) | **new** |
| `DB_USER` | Supabase DB user (`postgres.your-project-ref`) | **new** |
| `DB_PASSWORD` | Supabase DB password | **new** |

`DB_SCHEMA` is resolved automatically from the branch name — no secret needed.

---

## Project structure

```
subniche/
├── app/
│   ├── api/
│   │   └── example/              ← /api/example (GET, POST)
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── route.ts      ← /api/example/:id (GET, PATCH, DELETE)
│   ├── layout.tsx          # Root layout, metadata, ThemeProvider
│   ├── page.tsx            # Landing page (placeholder — designer pending)
│   ├── not-found.tsx       # 404 page
│   ├── manifest.ts         # PWA manifest
│   └── globals.css         # Tailwind base styles
├── components/
│   ├── ui/                 # shadcn/ui primitives (do not edit directly)
│   └── theme-provider.tsx  # Dark/light mode provider
├── lib/
│   ├── utils.ts            # cn() helper
│   └── supabase/
│       ├── client.ts       # Browser Supabase client
│       └── server.ts       # Server Supabase client
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI
├── server/                 # Backend logic
│   ├── controllers/
│   │   └── example.controller.ts # Example controller
│   ├── services/
│   │   └── example.service.ts     # Example service
│   ├── repositories/
│   │   └── example.repository.ts  # Example repository
│   ├── models/
│   │   └── example.model.ts       # Example model
│   ├── validators/
│   │   └── example.validator.ts   # Example validator
│   ├── middleware/
│   │   └── auth.middleware.ts     # Auth middleware
│   └── utils/
│       └── response.ts            # Response helpers
├── types/
│   ├── api/
│   │   └── index.ts               # ApiResponse<T>, PaginatedResponse<T>
│   └── database/
│       └── index.ts               # Generated Supabase types
│
└── lib/supabase/                  # Supabase client
│   ├── client.ts
│   └── server.ts
└── .env.example            # Environment variable template
```


## Contributing

1. Create a branch from `develop`: `git checkout -b feat/your-feature`
2. Make your changes
3. Ensure CI passes locally: `npx tsc --noEmit && npm run lint && npm run build`
4. Push and open a PR to `develop`
5. Request review
6. After merge to `develop`, features are batched into a PR from `develop` → `qa` for client review
7. After client sign-off, `qa` → `production` deploys to production

---
