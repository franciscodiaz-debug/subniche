---
name: backend
description: Backend AI Collaboration Guidelines for the SubNiche project
tools: Read, Glob, Grep
model: sonnet
---

# Backend AI Collaboration Guidelines

> **🚨 IMPORTANT FOR AI SYSTEMS:** This document MUST be read and consulted FIRST for all backend development tasks.
> This is the single source of truth for backend architecture, patterns, and conventions.
>
> **If requirements don't align with this guide:**
> - ❌ DO NOT attempt workarounds or deviate from the patterns
> - ✅ MUST ask the user to EITHER clarify the requirement OR update this document
> - ✅ Flag the mismatch and request confirmation before proceeding
>
> **🔴 MANDATORY: Every backend change MUST pass a code review before being considered done.**
> After finishing any backend task, read `.claude/agents/review.md` and run a full review of your own diff.
> Do NOT report the task as complete until the review passes with no critical issues.
>
> Version: 1.0 | Last Updated: April 27, 2026

---

## 📋 Quick Reference

**Framework:** Next.js 15 (App Router — Route Handlers only, no Pages API)
**ORM:** Prisma v6
**Database:** PostgreSQL via Supabase
**Auth:** Supabase Auth (sessions) + custom JWT (API tokens)
**Validation:** Zod v4
**Testing:** Vitest

---

## 🤖 AI Guidelines & Conflict Resolution

### Before Every Task
1. **Read this document** — understand all layers and patterns
2. **Identify applicable layers** — which files need to change for this feature
3. **Check for conflicts** — does the request align with these guidelines?

### When Conflicts Arise

Example conflicts:
- "Put validation logic in the service"
- "Query the database from the route handler"
- "Use `@prisma/client` import instead of `.prisma/client`"
- "Add business logic to the repository"
- "Write raw SQL instead of using Prisma"

**Required Action:**
```
❌ WRONG: Proceed with the non-compliant approach
✅ RIGHT: Stop and ask the user:

"This request appears to conflict with the Backend AI Guidelines:
- Guideline: [specific rule]
- Request: [specific request]

Please choose one:
1. Clarify the requirement (provide exception details)
2. Update backend.md to reflect the new standard
3. Confirm override (accept the deviation)"
```

---

## 🗂️ Architecture — Request Lifecycle

```
HTTP Request
  └── app/api/[resource]/route.ts          (thin adapter — no logic)
        └── controller.getAll/getOne/create/update/delete()
              └── @Validate decorator      (Zod parse → 422 on failure → req.validated)
                    └── BaseController.handleResponse()  (try/catch → ApiResponse)
                          └── service.getAll/getById/create/update/delete()
                                └── mapper.toPublic(entity)   (entity → public DTO)
                                      └── repository.findAll/findById/create/update/delete()
                                            └── prisma.[model].*()
```

**Rule:** Each layer has ONE job. Never skip layers or mix responsibilities.

---

## 🔐 Admin CRUD Pattern

Admin endpoints live under separate directories and follow stricter conventions.

### Directory layout

```
server/
├── controllers/admin/          # Admin HTTP handlers — extend AdminBaseController
├── services/admin/             # Admin service instances (may differ from public)
app/api/admin/[resource]/       # Admin route handlers
lib/swagger/admin-spec.ts       # Admin-only OpenAPI spec
app/docs/admin/page.tsx         # Admin Swagger UI at /docs/admin
```

### Auth guard — controller, not route

Auth lives in `AdminBaseController.handleAdminResponse()` via `requireAdmin()`. Routes are still thin adapters with zero auth logic.

```ts
// ✅ CORRECT — auth is enforced by the controller base class
export async function GET(req: NextRequest) {
  return adminCategoryController.getAll(req)
}

// ❌ WRONG — never add requireAdmin() to the route handler
export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth
  return adminCategoryController.getAll(req)
}
```

### AdminBaseController

All admin controllers extend `AdminBaseController`. The constructor takes `service`, `createSchema`, and `updateSchema`. Every method — `getAll`, `getOne`, `create`, `update`, `delete` — is automatically guarded by `requireAdmin`.

```ts
@ApiTag("Admin / Categories", { secured: true })  // { secured: true } shows the lock in Swagger
class AdminCategoryController extends AdminBaseController<Category, CreateCategoryInput, UpdateCategoryInput, CategoryAdminPublic> {
  constructor() {
    super(categoryAdminService, createCategorySchema, updateCategorySchema)
  }
  // override methods with @ApiOperation decorators
}
export const adminCategoryController = new AdminCategoryController()
```

### Admin services — `server/services/admin/`

When the admin needs a different serialization (e.g. strip `bitpos`) or different behavior, create a dedicated service file under `server/services/admin/`:

```ts
// server/services/admin/category.admin.service.ts
class CategoryAdminService extends BaseService<Category, CreateCategoryInput, UpdateCategoryInput, CategoryAdminPublic> {
  constructor() {
    super(categoryRepository, "Category", CategoryAdminMapper)
  }
}
export const categoryAdminService = new CategoryAdminService()
```

### What goes in `admin/` subfolders vs. same file

| Artifact | Rule | Reason |
|----------|------|--------|
| `controllers/admin/` | Separate file | Distinct class + behavior |
| `services/admin/` | Separate file | Distinct instance + mapper |
| `app/api/admin/` | Separate route | Different URL namespace |
| Mappers (`category.mapper.ts`) | **Same file** | Both views transform the same model |
| Validators (`category.validator.ts`) | **Same file** | Admin schemas are derived from public ones |
| Models (`category.model.ts`) | **Same file** | Admin types are `Omit`/`Pick` of the same entity |

### Admin-specific types and schemas

Add admin types directly to the existing model file — no separate file:

```ts
// server/models/category.model.ts
export type CategoryAdminPublic = Omit<PrismaCategory, "bitpos">
```

Add admin Zod schemas to the existing validator file — derive from the public schema:

```ts
// server/validators/category.validator.ts
export const adminCreateCategorySchema = createCategorySchema.omit({ slug: true }).extend({
  slug: z.string().min(1).max(255).optional(),
})
export type AdminCreateCategoryInput = z.infer<typeof adminCreateCategorySchema>
```

### slug — always optional for admin create

Admin create schemas always make `slug` optional. If not provided, the controller derives it from `title` via `slugify()`:

```ts
@Validate(adminCreateCategorySchema)
override async create(req: NextRequest): Promise<NextResponse> {
  return this.handleAdminResponse(req, () => {
    const validated = (req as ValidatedRequest<AdminCreateCategoryInput>).validated
    return this.service.create({ ...validated, slug: validated.slug ?? slugify(validated.title) })
  })
}
```

### `bitpos` — never expose in any API response

The `bitpos` field (BigInt) must never appear in any API response — public or admin.

- Use `CategoryAdminPublic = Omit<PrismaCategory, "bitpos">` and a `CategoryAdminMapper` that strips it.
- `BigInt` is not JSON-serializable; always omit it at the mapper layer before it reaches `handleResponse`.

### Admin Swagger spec

Admin controllers are registered in `lib/swagger/admin-spec.ts` (not `spec.ts`). The spec is served at `/api/docs/admin` and the UI at `/docs/admin`.

```ts
// lib/swagger/admin-spec.ts
import "@/server/controllers/admin/category.controller"
import "@/server/validators/category.validator"
```

---

## 📁 Directory Structure

```
server/
├── controllers/        # HTTP handlers — delegate to services only
├── services/           # Business logic — orchestrate repos + mappers
├── repositories/       # Data access — wrap Prisma, nothing else
├── models/             # Types, domain classes, public DTO schemas
├── validators/         # Zod schemas + registerSchema() for OpenAPI
├── mappers/            # Entity → public DTO transformation
├── decorators/         # @ApiTag, @ApiOperation, registerSchema()
├── middleware/         # @Validate, requireAuth()
├── errors/             # BaseError, NotFoundError, ValidationError, ConflictError
└── utils/              # response helpers, jwt, logger, string/number utils

app/api/                # Route handlers (thin adapters only)
lib/
├── prisma.ts           # Prisma singleton — always import from here
└── supabase/
    ├── client.ts       # Browser Supabase client
    └── server.ts       # Server Supabase client (cookies)
```

---

## 🗄️ Database Access — Supabase vs Prisma

This project uses **both** Supabase and Prisma for different responsibilities. Understanding the split is CRITICAL.

### Prisma — data access (use this for all CRUD)

Prisma is the ORM for all data operations. Use it for queries, mutations, and relations.

```ts
// Always import the singleton
import { prisma } from "@/lib/prisma"

// Import generated types from .prisma/client, NOT @prisma/client
import type { User, Niche } from ".prisma/client"
```

> ❌ Never `new PrismaClient()` — always use the singleton from `lib/prisma.ts`
> ❌ Never import from `@prisma/client` for entity types — use `.prisma/client`

### Supabase — authentication only

Supabase is used **exclusively** for session management and auth. It is NOT used for data queries.

**Browser client** (`lib/supabase/client.ts`) — for client-side session access:
```ts
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Server client** (`lib/supabase/server.ts`) — for server-side auth (cookies):
```ts
import { createClient } from "@/lib/supabase/server"
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
```

> ✅ Use Supabase for: session validation, OAuth, reading `auth.users`
> ❌ Never use Supabase to query application data — that is Prisma's job

### Auth middleware — `requireAuth(req)`

For protected endpoints, use `requireAuth` from `server/middleware/auth.middleware.ts`:

```ts
import { requireAuth } from "@/server/middleware/auth.middleware"

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth   // 401 early return
  const { userId } = auth
  return controller.getForUser(userId)
}
```

> Checks Bearer token (API clients) OR session cookie (browser). Verifies JWT. Returns `{ userId }` or `NextResponse(401)`.

---

## 🔌 Layer Patterns

### Route Handler (`app/api/[resource]/route.ts`)

Thin adapter only. Two to four lines max. No logic, no imports other than the controller.

```ts
import { NextRequest } from "next/server"
import { exampleController } from "@/server/controllers/example.controller"

export async function GET() {
  return exampleController.getAll()
}
export async function POST(req: NextRequest) {
  return exampleController.create(req)
}
```

Dynamic route with params (`app/api/[resource]/[id]/route.ts`):
```ts
type Params = { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return exampleController.getOne(id)
}
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  return exampleController.update(req, id)
}
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  return exampleController.delete(id)
}
```

---

### Controller (`server/controllers/`)

Full CRUD — extend `BaseController`:

```ts
import { BaseController } from "./base.controller"
import { Example, CreateExampleInput, UpdateExampleInput } from "@/server/models/example.model"
import { createExampleSchema, updateExampleSchema } from "@/server/validators/example.validator"
import { exampleService } from "@/server/services/example.service"
import { ApiTag, ApiOperation, dataResponse, jsonBody, ref } from "@/server/decorators/api.decorators"

@ApiTag("Example")
class ExampleController extends BaseController<Example, CreateExampleInput, UpdateExampleInput> {
  constructor() {
    super(exampleService, createExampleSchema, updateExampleSchema)
  }

  @ApiOperation({ method: "get", path: "/example", summary: "List all examples",
    responses: { 200: dataResponse("Example list", ref("Example")) } })
  override getAll() { return super.getAll() }

  @ApiOperation({ method: "post", path: "/example", summary: "Create example",
    requestBody: jsonBody(ref("CreateExampleBody")),
    responses: { 201: dataResponse("Created", ref("Example")), 422: { description: "Validation error" } } })
  override create(req: NextRequest) { return super.create(req) }
}

export const exampleController = new ExampleController()
```

Read-only — extend `ApiBaseController`:

```ts
@ApiTag("Status")
class StatusController extends ApiBaseController {
  @ApiOperation({ method: "get", path: "/status", summary: "List statuses",
    responses: { 200: dataResponse("Status list", ref("Status")) } })
  getAll() {
    return this.handleResponse(() => statusService.getAll())
  }
}
export const statusController = new StatusController()
```

---

### Service (`server/services/`)

Without mapper (entity returned as-is):
```ts
import { BaseService } from "./base.service"
import { Example, CreateExampleInput, UpdateExampleInput } from "@/server/models/example.model"
import { exampleRepository } from "@/server/repositories/example.repository"

class ExampleService extends BaseService<Example, CreateExampleInput, UpdateExampleInput> {
  constructor() {
    super(exampleRepository, "Example")
  }
}
export const exampleService = new ExampleService()
```

With mapper (entity transformed before returning):
```ts
class NicheService extends BaseService<Niche, CreateNicheInput, UpdateNicheInput, NichePublic> {
  constructor() {
    super(nicheRepository, "Niche", NicheMapper)
  }

  // Custom method — access raw Prisma via repo.getModel()
  async getBySlug(slug: string): Promise<NichePublic> {
    const niche = await nicheRepository.getModel().findFirst({ where: { slug } })
    if (!niche) throw new NotFoundError("Niche not found")
    return this.serialize(niche)
  }
}
```

---

### Repository (`server/repositories/`)

Standard CRUD:
```ts
import { BaseRepository } from "./base.repository"
import { prisma } from "@/lib/prisma"
import type { Example } from ".prisma/client"
import type { CreateExampleInput, UpdateExampleInput } from "@/server/models/example.model"

class ExampleRepository extends BaseRepository<Example, CreateExampleInput, UpdateExampleInput> {
  constructor() {
    super(prisma.example)         // default: sort by created_at DESC
    // super(prisma.niche, "order", "asc")  // custom sort
  }
}
export const exampleRepository = new ExampleRepository()
```

With relations — use `UserWithRelations` pattern:
```ts
// model defines the extended type
export type UserWithRelations = PrismaUser & { location: PrismaLocation | null }

// repository overrides methods to include relations
const withLocation = { include: { location: true } } as const

class UserRepository extends BaseRepository<UserWithRelations, CreateUserInput, UpdateUserInput> {
  constructor() { super(prisma.user as any) }
  override findAll()           { return prisma.user.findMany(withLocation) }
  override findById(id: string){ return prisma.user.findUnique({ where: { id }, ...withLocation }) }
  override create(data)        { return prisma.user.create({ data: data as any, ...withLocation }) }
  override update(id, data)    { return prisma.user.update({ where: { id }, data: data as any, ...withLocation }) }
}
```

Custom SQL (use only when Prisma API cannot express the query):
```ts
findSubtree(categoryId: string) {
  return prisma.$queryRaw<Category[]>(Prisma.sql`
    WITH RECURSIVE subtree AS (
      SELECT * FROM "Category" WHERE id = ${categoryId}
      UNION ALL
      SELECT c.* FROM "Category" c JOIN subtree s ON c.parent_id = s.id
    )
    SELECT * FROM subtree
  `)
}
```

---

### Validator (`server/validators/`)

Always three schemas per resource, then `registerSchema()` for each:

```ts
import { z } from "zod"
import { registerSchema } from "@/server/decorators/api.decorators"

// 1. Create — full field rules
export const createExampleSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  description: z.string().max(1000).nullable().optional(),
})

// 2. Update — all fields optional
export const updateExampleSchema = createExampleSchema.partial()

// 3. Full entity — extend create with system fields
export const exampleSchema = createExampleSchema.extend({
  id: z.uuid(),
  created_at: z.iso.datetime(),
  updated_at: z.iso.datetime(),
})

// Register all three for OpenAPI
registerSchema("Example", exampleSchema)
registerSchema("CreateExampleBody", createExampleSchema)
registerSchema("UpdateExampleBody", updateExampleSchema)

export type CreateExampleBody = z.infer<typeof createExampleSchema>
export type UpdateExampleBody = z.infer<typeof updateExampleSchema>
```

> ⚠️ **Zod v4:** use `z.uuid()` and `z.iso.datetime()` at the top level — NOT `z.string().uuid()` or `z.string().datetime()` (deprecated in v4).

---

### Model (`server/models/`)

Define entity class, public DTO schema (Zod), and input types:

```ts
import { z } from "zod"
import type { Example as PrismaExample } from ".prisma/client"

// Public DTO — Zod schema is the source of truth
export const examplePublicSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
})
export type ExamplePublic = z.infer<typeof examplePublicSchema>

// Domain class — no serialization logic
export class Example implements PrismaExample {
  id!: string
  title!: string
  description!: string | null
  created_at!: Date
  updated_at!: Date
}

// Input types
export type CreateExampleInput = { title: string; description?: string | null }
export type UpdateExampleInput = Partial<CreateExampleInput>
```

> Public DTO schema belongs in `models/` (inner layer). Validators are outer layer and import from models — never the reverse.

---

### Mapper (`server/mappers/`)

Plain object implementing `EntityMapper<TEntity, TResponse>`:

```ts
import type { EntityMapper } from "@/server/services/base.service"
import type { Example } from ".prisma/client"
import type { ExamplePublic } from "@/server/models/example.model"

export const ExampleMapper: EntityMapper<Example, ExamplePublic> = {
  toPublic({ id, title, description }: Example): ExamplePublic {
    return { id, title, description }
  },
}
```

Compose mappers for related entities:
```ts
import { LocationMapper } from "./location.mapper"

export const UserMapper: EntityMapper<UserWithRelations, UserPublic> = {
  toPublic(entity): UserPublic {
    return {
      id: entity.id,
      email: entity.email,
      location: entity.location ? LocationMapper.toPublic(entity.location) : null,
    }
  },
}
```

> Rule: mappers may import other mappers. Services import mappers. Models, validators, and repositories never import mappers.

---

## ❌ Error Handling

Throw domain errors from services. `handleResponse()` maps them to HTTP status codes automatically.

```ts
import { NotFoundError, ValidationError, ConflictError } from "@/server/errors/client.error"

// 404
throw new NotFoundError("Example not found")

// 409
throw new ConflictError("Email already in use")

// 422
throw new ValidationError("Password too short")
```

| Error class | Default status |
|-------------|---------------|
| `NotFoundError` | 404 |
| `ValidationError` | 422 |
| `ConflictError` | 409 |
| Unknown error | 500 |

> Do NOT use `response.ts` helpers (`ok`, `fail`, etc.) directly in controllers or services — those are for middleware only. Controllers use `handleResponse()`.

---

## 📤 Response Shape

All responses use the envelope:

```ts
type ApiResponse<T> = { data: T | null; error: string | null }
```

- Success: `{ data: {...}, error: null }` — 200 or 201
- Failure: `{ data: null, error: "message" }` — 4xx or 500

This is handled automatically by `BaseController.handleResponse()`. Never construct the envelope manually in a controller or service.

---

## 🔐 OpenAPI / Swagger Registration

Every new controller and validator MUST be registered in `lib/swagger/spec.ts`:

```ts
// Add to the import block at the top of lib/swagger/spec.ts
import "@/server/controllers/example.controller"
import "@/server/validators/example.validator"
```

Without these imports, the decorators never run and the endpoint won't appear in the API docs.

---

## 📝 Logging

Use the project logger — never `console.log` in production code:

```ts
import { getLogger } from "@/server/utils/logger"
const logger = getLogger()

logger.info("User created", { userId })
logger.error("Payment failed", { error, userId })
```

---

## 🏗️ Adding a New Resource — Checklist

Follow this order exactly — each layer depends on the previous one.

1. **`prisma/schema.prisma`** — add the `model`
2. **Run migration** — `npx prisma migrate dev --name add_example`
3. **`server/models/example.model.ts`** — `class Example`, `ExamplePublic` schema + `z.infer`, input types
4. **`server/validators/example.validator.ts`** — `createSchema`, `updateSchema`, `entitySchema` + `registerSchema()`
5. **`server/mappers/example.mapper.ts`** — `ExampleMapper` with `toPublic()` (skip if no field filtering)
6. **`server/repositories/example.repository.ts`** — `extends BaseRepository`, pass `prisma.example`
7. **`server/services/example.service.ts`** — `extends BaseService`, pass repo + name + mapper
8. **`server/controllers/example.controller.ts`** — `extends BaseController` + OpenAPI decorators
9. **`app/api/example/route.ts`** — GET + POST delegates
10. **`app/api/example/[id]/route.ts`** — GET + PATCH + DELETE delegates
11. **`lib/swagger/spec.ts`** — add controller + validator imports

---

## 🧪 Testing

- Runner: Vitest (`vitest.config.mts`)
- Test files: co-located — `server/controllers/example.controller.test.ts`
- **Mock the service instance**, not module functions

```ts
vi.mock("@/server/services/example.service", () => ({
  exampleService: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

it("GET /example returns 200 with data", async () => {
  vi.mocked(exampleService.getAll).mockResolvedValue([mockExample])
  const res = await exampleController.getAll()
  const body = await res.json()
  expect(res.status).toBe(200)
  expect(body.data).toHaveLength(1)
})
```

> `Date` fields: mock with `new Date(...)`, compare serialized JSON with `.toISOString()`.

---

## 🔑 Key Conventions Summary

| Rule | Detail |
|------|--------|
| Prisma import | `import { prisma } from "@/lib/prisma"` — never `new PrismaClient()` |
| Type import | From `.prisma/client`, not `@prisma/client` |
| Supabase role | Auth only — never for data queries |
| Zod v4 format validators | `z.uuid()`, `z.iso.datetime()` — top-level, not `.string()` chains |
| Schema derivation order | `create` → `update = create.partial()` → `entity = create.extend({id, ...})` |
| Public DTO source of truth | Zod schema in `models/` → `z.infer<>` type — never defined manually in parallel |
| Route handlers | Thin adapters only — 2-4 lines, no logic |
| Errors | Throw `NotFoundError`/`ConflictError`/`ValidationError` — never manually build 4xx responses |
| Singletons | Controllers, services, repositories are instantiated once at module load and exported |
| Serialization | In `mappers/` only — models, services, and repos have no serialization logic |
| Mapper composition | Mappers may call other mappers; services import mappers; models never import mappers |
| Logging | `getLogger()` from `@/server/utils/logger` — never `console.log` |
| OpenAPI registration | Public: import in `lib/swagger/spec.ts`. Admin: import in `lib/swagger/admin-spec.ts` |
| Admin auth guard | Always in `AdminBaseController` via `requireAdmin()` — never in the route handler |
| Admin subfolders | Controllers and services → `admin/` subfolder. Mappers, validators, model types → same file as public |
| `bitpos` | Never expose in any response. Strip via `CategoryAdminPublic = Omit<PrismaCategory, "bitpos">` + mapper |
| Admin slug | Optional in create; auto-derived from `title` via `slugify()` in the controller override if omitted |

---

## 🚫 Frontend Files — Hands Off

When working on backend tasks, do NOT modify:
- `components/` — UI components
- `app/` pages (except `app/api/`) — frontend pages and layouts
- `app/globals.css` — styling

---

## ✅ Pre-Implementation Checklist for AI

**BEFORE writing any code:**

- [ ] I have read the entire backend.md document
- [ ] I have identified which layers need to change for this task
- [ ] I checked that the request aligns with the layer responsibilities
- [ ] I know whether Supabase (auth) or Prisma (data) is needed
- [ ] I have confirmed the Zod v4 syntax (`z.uuid()`, `z.iso.datetime()`)
- [ ] I know the mapper is needed (if any fields must be hidden from the response)
- [ ] I have planned the new resource checklist (if adding a resource)
- [ ] I am ready to register the controller + validator in `lib/swagger/spec.ts`

**If you cannot check ALL boxes above, DO NOT PROCEED with implementation.**
