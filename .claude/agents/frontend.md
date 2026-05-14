# Frontend AI Collaboration Guidelines

> **FOR AI SYSTEMS:** Read this document FIRST for every frontend task. This is the single source of truth for patterns, conventions, and constraints.
>
> Version: 2.0 | Last Updated: 2026-05-14

---

## ⚠️ TypeScript & Linter Policy — Read Before Writing Code

**The existing codebase has pre-existing TS and linter issues.** `next.config.mjs` has `typescript.ignoreBuildErrors: true`, which suppresses them at build time.

**YOUR OBLIGATION for NEW code:**
- Every new file or addition you write MUST be TypeScript-valid with no errors
- Every new file or addition MUST comply with ESLint (eslint-config-next core-web-vitals rules)
- Avoid `any`, unused imports, and undefined variables in anything you write
- Do NOT attempt to fix existing files that are not part of your task — touching them may break behavior or cause conflicts
- If fixing a bug requires modifying an existing file with pre-existing errors, fix only the specific logic you were asked to change; leave surrounding issues untouched

Linter is configured via `eslint.config.mjs` (flat config, Next.js core-web-vitals). It CAN be run with `pnpm lint`, but many existing files will fail. Do not run it expecting clean output — only ensure your new additions are clean.

---

## Quick Reference

| Item | Value |
|------|-------|
| Framework | Next.js 16.2.0 (React 19) |
| Styling | Tailwind CSS 4 + CSS Custom Properties (OKLCH) |
| Type System | TypeScript 5.7.3 (strict: true) |
| Package Manager | **pnpm** (never use npm or yarn) |
| Icon Library | lucide-react |
| Forms | react-hook-form + zod |
| Animations | framer-motion + tw-animate-css |
| Toasts | sonner |
| UI Primitives | shadcn/ui → components/ui/ (Radix UI based) |

---

## Project Structure (actual)

```
components/
├── ui/                      # shadcn/ui components — do not edit directly, wrap instead
├── auth/                    # Authentication screens
├── admin/                   # Admin dashboard UI
├── app-shell/               # Top-level chrome (nav, header, mobile menu)
├── create-item/             # Listing creation workflow
├── listing-detail/          # Item detail view
├── market/                  # Market/explore screens
├── profile/                 # User profile components
├── my-stuff/                # User inventory
├── home/                    # Home feed
├── collection/              # Collection management
├── inbox/                   # Messaging / inbox
├── trade/                   # Trade/exchange feature
├── shared/                  # Shared utilities (dev-info-drawer, market-tabs, etc.)
├── onboarding/              # Onboarding flow
├── niche/                   # Niche selection
├── logged-out/              # Unauthenticated state
├── item-card.tsx            # Root-level shared card components
├── listing-card.tsx
├── collection-card.tsx
├── feed-sections.tsx
├── trade-interest-card.tsx
├── stats-cards.tsx
├── hero-section.tsx
└── theme-provider.tsx

app/
├── layout.tsx               # Root layout + providers
├── page.tsx                 # Home page
├── globals.css              # Global styles + theme vars
├── (admin)/                 # Admin route group
├── api/                     # API routes (backend — do not touch)
├── actions/                 # Server actions (auth.ts)
├── login/, signup/          # Auth pages
├── create-listing/
├── market/, profile/
├── my-stuff/, inbox/
├── trade/, favorites/
├── collection/, communities/
├── settings/, welcome/
└── forgot-password/

lib/
├── utils.ts                 # cn() helper (clsx + tailwind-merge)
├── types.ts                 # Core shared interfaces (Listing, Collection, etc.)
├── types/                   # Subdirectory for typed enums (item-status.ts, etc.)
├── auth.ts                  # Auth helpers
├── current-user.ts          # Current user context
├── market-data.ts           # Market data helpers
├── profile-page-types.ts    # Profile-specific types
├── inbox-types.ts           # Inbox-specific types
├── draft-listing-storage.ts # Draft persistence
├── saved-trade-interests-context.tsx
├── admin/                   # Admin mock data (mock-*.ts files)
└── admin-settings-context.tsx

hooks/
├── use-mobile.ts
├── use-toast.ts
├── use-grid-density.ts
└── use-nav-collapse-request.ts
```

**Types live in `lib/` — there is no `types/` root folder.** Add new types to the closest logical file (lib/types.ts for shared domain types, or a feature-specific lib/*.types.ts file).

---

## Component Architecture

### Component Hierarchy

1. **`components/ui/`** — shadcn/ui components (Radix UI + CVA). Own source code, not a library.
   - Never edit directly. Always wrap.
   - Add new: `npx shadcn@latest add <name>` or `pnpm dlx shadcn@latest add <name>`

2. **Feature components** (`components/{feature}/`) — domain-specific, can have local state and effects

3. **Root-level cards** (collection-card.tsx, item-card.tsx, etc.) — shared across features

### "use client" vs Server Components

**Use `"use client"` when:**
- Component has `useState`, `useEffect`, `useCallback`, `useRef`
- Has event handlers (onClick, onSubmit, onChange)
- Uses browser APIs
- Uses context (useContext)
- Uses hooks from lucide-react, framer-motion, sonner, react-hook-form

**Server Component (default, no directive):**
- Pure data display without interactivity
- Data fetched from server actions or async props
- No hooks, no events

**The codebase is client-heavy** — most components use `"use client"`. Prefer client components when in doubt rather than creating complex server/client boundaries.

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `trade-interest-card.tsx` |
| Components | PascalCase | `TradeInterestCard` |
| Functions/vars | camelCase | `handleSubmit` |
| Constants | UPPER_SNAKE_CASE | `MAX_ITEMS` |
| Types/interfaces | PascalCase | `ListingCardProps` |

### Exports

```tsx
// Named exports — always
export function MyComponent() {}

// Types alongside components
export interface MyComponentProps {}
export function MyComponent(props: MyComponentProps) {}

// Default export only for Next.js pages
export default function Page() {}
```

---

## Styling

### The `cn()` Utility — Always Use It

```tsx
import { cn } from "@/lib/utils"

// Conditional classes
className={cn(
  "base-classes",
  isActive && "active-class",
  variant === "ghost" && "ghost-classes",
  className  // allow parent override
)}
```

Never use `array.join(" ")`. Never use string template literals for dynamic Tailwind classes.

### Tailwind CSS 4

- Config: PostCSS-based (no `tailwind.config.ts`)
- Custom theme tokens in `app/globals.css` under `@theme`
- Colors in OKLCH color space

**Common utilities:**
```
flex grid flex-col items-center justify-between
gap-2 gap-3 gap-4
px-4 py-2 p-4
text-sm text-base text-foreground text-muted-foreground
rounded-md rounded-lg
border border-border
bg-card bg-background
transition-colors hover:bg-muted
```

**Breakpoints:** `sm:` `md:` `lg:` (mobile-first)

### CSS Variables (Design Tokens)

Light and dark mode handled automatically via CSS custom properties. Use semantic tokens:

```
bg-background     text-foreground
bg-card           text-card-foreground
bg-primary        text-primary-foreground
bg-muted          text-muted-foreground
bg-destructive    text-destructive-foreground
border-border
ring-ring
```

Dark mode: `next-themes` package. The `ThemeProvider` wraps the app in `app/layout.tsx`.

### Animations

```tsx
// framer-motion (preferred for complex transitions)
import { motion, AnimatePresence } from "framer-motion"

<motion.div
  initial={{ opacity: 0, y: 8 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
/>

// tw-animate-css (for simple enter/exit)
className="animate-in fade-in zoom-in-95 duration-300"
```

---

## Icons

Use **lucide-react** — never create custom SVG icon components unless an icon doesn't exist in lucide:

```tsx
import { ChevronRight, Heart, Plus, Search } from "lucide-react"

// Standard usage
<ChevronRight className="h-4 w-4" />

// With color
<Heart className="h-5 w-5 text-destructive" />

// Decorative (no screen reader label needed — lucide handles aria-hidden)
<Search className="h-4 w-4 text-muted-foreground" />
```

Custom SVG (only when icon doesn't exist in lucide):
```tsx
function CustomIcon({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={cn("h-4 w-4", className)} viewBox="0 0 20 20" fill="none">
      <path d="..." stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
```

---

## Forms

Use **react-hook-form + zod** for all forms. Do NOT manage form state manually with useState.

```tsx
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
})

type FormData = z.infer<typeof schema>

export function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    // data is type-safe
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        {errors.email && (
          <p id="email-error" role="alert" className="text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Loading..." : "Submit"}
      </Button>
    </form>
  )
}
```

**Simple local state** (non-form interactions) still uses useState — react-hook-form is for forms only.

---

## UI Components

### shadcn/ui Components

Always import from `@/components/ui/` — never from `shadcn` directly (it's not an npm package):

```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
```

### Extending shadcn Components

Wrap — never edit the original:

```tsx
import { Button, type ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean
}

export function LoadingButton({ isLoading, children, disabled, className, ...props }: LoadingButtonProps) {
  return (
    <Button disabled={disabled || isLoading} className={cn(className)} {...props}>
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </Button>
  )
}
```

### Toasts

Use `sonner` — never build custom toast UI:

```tsx
import { toast } from "sonner"

toast.success("Item saved")
toast.error("Something went wrong")
toast("Message without icon")
```

---

## TypeScript

**Strict mode is on.** Every piece of code you write must be valid under `strict: true`.

### Patterns

```tsx
// Props: extend HTML element attributes
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outlined"
  isActive?: boolean
}

// Variant mappings
const variantClasses: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "bg-card",
  outlined: "border border-border",
}

// Event types — always explicit
const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {}
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {}
const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {}

// Async — always handle errors
const handleAsync = async () => {
  try {
    const res = await fetch("/api/endpoint", { method: "POST" })
    const json = await res.json() as { data: unknown; error: string | null }
    // ...
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    toast.error(message)
  }
}
```

### Forbidden Patterns

```tsx
// ❌ NEVER
const x: any = something
function Component(props: any) {}
// @ts-ignore
// @ts-expect-error (unless absolutely necessary with a comment explaining why)

// ❌ Unused imports or variables (ESLint will flag these)
import { Foo } from "somewhere" // if Foo is never used

// ✅ Instead
const _unused = value  // only if truly needed to suppress destructure warning
```

### Path Aliases

Always use `@/` prefix:
```tsx
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Listing } from "@/lib/types"
```

### Types Location

- Shared domain types → `lib/types.ts` (Listing, Collection, etc.)
- Feature-specific types → `lib/{feature}-types.ts` (e.g., `lib/inbox-types.ts`)
- Enum-like types → `lib/types/` subdirectory
- Component-local types → define inline in the component file

---

## API Calls

All backend responses use the envelope `{ data: T | null, error: string | null }`:

```tsx
const handleSubmit = async (data: FormData) => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    const json = await res.json() as { data: { token: string } | null; error: string | null }

    if (!res.ok) {
      toast.error(json.error ?? "Something went wrong")
      return
    }

    // Handle success
    localStorage.setItem("auth_token", json.data!.token)
  } catch {
    toast.error("Network error")
  }
}
```

Auth token stored in `localStorage` under key `"auth_token"`.

---

## Accessibility (Required)

Every interactive element must be keyboard-accessible and screen-reader-friendly:

```tsx
// Inputs: label association + aria-invalid + aria-describedby
<Label htmlFor="email">Email</Label>
<Input
  id="email"
  aria-invalid={!!error}
  aria-describedby={error ? "email-error" : undefined}
/>
{error && <p id="email-error" role="alert">{error}</p>}

// Buttons: descriptive labels (not just icons)
<Button aria-label="Remove item">
  <Trash2 className="h-4 w-4" />
</Button>

// Dialogs: DialogTitle required (can be visually hidden with sr-only)
<DialogTitle className="sr-only">Confirm deletion</DialogTitle>
```

Checklist for every new interactive component:
- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] aria-label or visible label on icon-only buttons
- [ ] aria-invalid + role="alert" on form errors
- [ ] Focus ring visible (Tailwind focus-visible:ring-*)

---

## Loading States

```tsx
import { Loader2 } from "lucide-react"

// Button loading
<Button disabled={isLoading}>
  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isLoading ? "Saving..." : "Save"}
</Button>

// Full-screen or section loading
<div className="flex items-center justify-center p-8">
  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
</div>
```

---

## Scripts

```bash
pnpm dev          # Dev server
pnpm build        # Production build
pnpm start        # Production server
pnpm lint         # ESLint (will flag existing issues — not a pass/fail gate)
```

Note: **No test runner is configured** (`npm run test` / `pnpm test` will fail — there are no test scripts in package.json). Do not add test files unless asked.

---

## Backend Files — Hands Off

Do NOT modify:
- `server/` — controllers, validators, services
- `app/api/` — Next.js API route handlers
- `lib/swagger/` — OpenAPI spec
- `prisma/` — schema and migrations
- `lib/prisma.ts`, `lib/supabase/` — data clients

If a frontend task requires a backend change, output this block and do what frontend work is possible:

```
📋 BACKEND CHANGE NEEDED
Requested by: [brief description of the frontend task]
File to change: [exact file path]
What's needed: [describe the change]
Why: [what the frontend needs and why the current backend doesn't support it]
```

---

## Pre-Implementation Checklist

Before writing any code:

- [ ] Read this document (or the relevant sections for the task)
- [ ] Identified which feature directory the new component belongs in
- [ ] Confirmed no pre-existing component already does this
- [ ] Planned TypeScript types (no `any`)
- [ ] Confirmed the implementation uses `cn()`, lucide-react, and shadcn/ui components where applicable
- [ ] Will not touch existing files beyond the minimum required by the task
- [ ] New code will be clean of TS errors and ESLint warnings
