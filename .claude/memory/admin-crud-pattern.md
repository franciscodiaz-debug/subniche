# Admin CRUD Architecture Conventions

topic_key: architecture/admin-crud-pattern

## What
Established the admin CRUD pattern for SubNiche: separate controllers and services under `admin/` subfolders, with auth enforced at the controller layer via `AdminBaseController`.

## Decisions

### Directory split — what goes in `admin/` vs same file
- `server/controllers/admin/` — separate file (distinct class + behavior)
- `server/services/admin/` — separate file (distinct instance, may use different mapper)
- `app/api/admin/` — separate route (different URL namespace)
- Mappers (`category.mapper.ts`) — **same file** as public mapper (both views of the same model)
- Validators (`category.validator.ts`) — **same file** (admin schemas derived from public ones)
- Models (`category.model.ts`) — **same file** (admin types are Omit/Pick of the same entity)

### Auth guard — always in AdminBaseController, never in the route
`AdminBaseController.handleAdminResponse()` calls `requireAdmin()`. Routes stay as thin adapters with zero auth logic.

### Admin services
When admin needs different serialization, create `server/services/admin/entity.admin.service.ts` extending `BaseService` with the admin mapper.

### Admin-specific types and schemas
- Add `CategoryAdminPublic = Omit<PrismaCategory, "bitpos">` directly to `category.model.ts`
- Add `adminCreateCategorySchema` directly to `category.validator.ts`, derived from the public schema via `.omit({ slug: true }).extend({ slug: z.string().optional() })`

### slug — always optional in admin create
Admin create schemas make slug optional. The controller override fills it in via `slugify(title)` if not provided.

### bitpos — never expose in any API response
`bitpos` is a `BigInt` field (not JSON-serializable) and must be stripped at the mapper layer. Use `CategoryAdminPublic = Omit<PrismaCategory, "bitpos">` with a `CategoryAdminMapper` that destructures and omits it.

### Swagger
- Public controllers → `lib/swagger/spec.ts`
- Admin controllers → `lib/swagger/admin-spec.ts`
- Admin Swagger UI → `/docs/admin`
- Use `@ApiTag("Admin / X", { secured: true })` to show the lock icon on all endpoints in the group

## Why
Keeps auth concern centralized (can't accidentally forget it on a new admin endpoint), separates admin concerns without fragmenting related code across too many files, and avoids BigInt JSON serialization errors.

## Where
- `server/controllers/admin/` — AdminBaseController, category and niche admin controllers
- `server/services/admin/` — categoryAdminService, nicheAdminService
- `server/models/category.model.ts` — CategoryAdminPublic type
- `server/mappers/category.mapper.ts` — CategoryAdminMapper
- `server/validators/category.validator.ts` — adminCreateCategorySchema
- `lib/swagger/admin-spec.ts` — admin OpenAPI spec
- `.claude/agents/backend.md` — documented under "Admin CRUD Pattern" section
