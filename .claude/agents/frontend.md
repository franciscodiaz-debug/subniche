# Frontend AI Collaboration Guidelines

> **🚨 IMPORTANT FOR AI SYSTEMS:** This document MUST be read and consulted FIRST for all frontend development tasks. 
> This is the single source of truth for frontend standards, patterns, and component usage.
> 
> **If requirements don't align with this guide:**
> - ❌ DO NOT attempt workarounds or deviate from the standards
> - ✅ MUST ask the user to EITHER clarify the requirement OR update this document
> - ✅ Flag the mismatch and request confirmation before proceeding
> 
> Version: 1.2 | Last Updated: May 6, 2026

---

## 📋 Quick Reference

**Framework:** Next.js 15.5.15 (React 19)  
**Styling:** Tailwind CSS 4 + CSS Custom Properties  
**Type System:** TypeScript 5.9  
**Package Manager:** pnpm  
**Node Version:** 18-22  
**Testing:** Vitest (unit) + Playwright (e2e)  
**Theme:** Dark-only (SubNiche is a dark-first product — no light mode toggle)  

---

## 🤖 AI Guidelines & Conflict Resolution

### Before Every Task
1. **Read this document** — Understand all standards, patterns, and requirements
2. **Identify applicable sections** — Find patterns relevant to the requested feature
3. **Check for conflicts** — Does the request align with these guidelines?

### When Conflicts Arise
**Scenario: Request doesn't match guidelines**

Example conflicts:
- "Use inline styles instead of Tailwind"
- "Skip TypeScript types on this component"
- "We don't need accessibility attributes here"
- "Install a different UI library instead of using shadcn components"

**Required Action:**
```
❌ WRONG: Proceed with the non-compliant approach
✅ RIGHT: Stop and ask the user:

"This request appears to conflict with the Frontend AI Guidelines:
- Guideline: [specific guideline]
- Request: [specific request]

Please choose one:
1. Clarify the requirement (provide exception details)
2. Update frontend.md to reflect the new standard
3. Confirm override (accept the deviation)"
```

### Exception Handling
If a justified exception is needed:
- User must explicitly confirm the override
- Document why the standard doesn't apply
- Add a note in the component explaining the exception
- Consider proposing an update to this document

---

## 🎨 Design System & Styling

### Color Variables (CSS Custom Properties)

Colors are defined in `globals.css` using OKLCH color space for accessibility and consistency.

**Theme: Dark-Only**

SubNiche is a dark-first product. `:root` defines the dark palette directly — there is no light mode. The `.dark` class mirrors `:root` so `next-themes` works consistently, but no light theme exists or should be added without explicit product owner approval.

**Design tokens (OKLCH color space):**
- `--background`: Dark navy `oklch(0.13 0.02 250)`
- `--foreground`: Near-white `oklch(0.97 0.01 250)`
- `--card`: Slightly lighter navy `oklch(0.18 0.02 250)`
- `--primary`: Gold/amber `oklch(0.75 0.15 85)` — main accent
- `--secondary` / `--muted`: Mid-navy tones for surfaces and inactive UI
- `--destructive`: Red for errors/delete actions
- `--brand-gold` / `--brand-navy`: Brand palette tokens
- `--border` / `--input` / `--ring`: Structural and focus tokens

**Usage rule:** Always use semantic tokens (`text-foreground`, `bg-card`, `border-border`) — never hardcode colors.

### Tailwind CSS Usage

**Configuration:**
- Tailwind 4 with PostCSS integration
- Custom theme colors mapped from CSS variables
- Border radius: `0.625rem` (10px)

**Classname Patterns:**
```tsx
// Use array.join() for cleaner conditional classes
className={[
  "base classes",
  "transition-colors focus-visible:outline-none",
  condition ? "conditional-class" : "fallback-class",
].join(" ")}
```

**Common Utilities:**
- `flex`, `grid`, `flex-col`, `items-center`, `justify-center`
- `gap-*` (gap-2, gap-3, gap-4, etc.)
- `px-*`, `py-*` for padding
- `text-sm`, `text-lg`, `text-foreground`
- `rounded-md` for border radius
- `transition-colors` for smooth color changes
- `hover:`, `focus-visible:`, `disabled:` modifiers

**Animation:**
- `tw-animate-css` for CSS-based entrance/exit effects (`animate-in`, `fade-in`, `zoom-in-95`, etc.)
- `framer-motion` for complex layout animations, drag interactions, and shared-element transitions
- Use `tw-animate-css` first; reach for `framer-motion` only when CSS transitions are insufficient

---

## 📦 Component Architecture

### Component Types

#### 1. **UI Components** (`components/ui/`)
- Generated via `npx shadcn@latest add` — owned by this project, living in `components/ui/`. Treat as source code, not a library
- Pre-styled with Tailwind, customizable via props
- Accept props for customization (variant, size, disabled)
- Use TypeScript interfaces extending HTML elements
- Example: `Button` with variants (primary, ghost) and sizes (sm, md, lg)

#### 2. **Feature Components** (`components/{feature}/`)
- Domain-specific components (auth, landing, etc.)
- May use multiple UI components
- Can manage local state and side effects
- Example: `SignUpScreen` handles auth form flow

#### 3. **Layout Components** (`app/layout.tsx`)
- Page structure and providers
- Theme provider setup
- Global context/provider wrappers

### Component Patterns

**Use Client Components (`"use client"`):**
- Interactive features (forms, buttons, modals)
- State management (useState, useCallback)
- Event handlers
- Browser APIs

**Server Components (Default):**
- Data fetching from databases
- Use server-only secrets safely
- Reduce JavaScript bundle

**Props Pattern:**
```tsx
type ComponentProps = React.ComponentProps<typeof BaseElement> & {
  // Custom props
  variant?: "primary" | "ghost"
  size?: "sm" | "md" | "lg"
}

const Component = React.forwardRef<HTMLElementType, ComponentProps>(
  ({ variant = "primary", className = "", ...props }, ref) => {
    return (
      <element
        ref={ref}
        className={[
          "base-classes",
          variantClasses[variant],
          className,
        ].join(" ")}
        {...props}
      />
    )
  }
)
```

---

## 📁 Project Structure

```
components/
├── ui/                    # Shadcn-generated base components — treat as source, not a library
├── app-shell/             # Header, sidebar, nav, profile chip, search bar
├── admin/                 # Admin dashboard components (route-group isolated)
├── collection/            # Collection views and cards
├── create-item/           # Item creation flow
├── home/                  # Home feed sections
├── inbox/                 # Messaging UI
├── listing-detail/        # Listing detail view (owner + viewer variants)
├── logged-out/            # Unauthenticated-state components
├── market/                # Market browse, filters, search
├── my-stuff/              # User's own listings/items
├── onboarding/            # Onboarding tooltip and welcome flow
├── profile/               # Public profile components
├── shared/                # Cross-feature shared components
├── trade/                 # Trade flow components
├── welcome/               # Welcome screen
├── subniche-logo.tsx      # Brand asset
└── theme-provider.tsx     # next-themes wrapper

app/
├── (admin)/               # Route group — admin pages with isolated layout
├── (app)/                 # Route group — authenticated app shell
├── actions/               # Server Actions
├── api/                   # API route handlers (backend — hands off)
├── globals.css            # Global styles + design tokens
├── layout.tsx             # Root layout + providers
└── page.tsx               # Home / landing

lib/
├── supabase/              # Supabase clients (client.ts, server.ts)
├── prisma.ts              # Prisma singleton
└── utils.ts               # cn() and shared helpers

hooks/                     # Custom React hooks (use-grid-density, use-mobile, etc.)
```

---

## 🔤 TypeScript Standards

**Strict Mode:** Enabled (`"strict": true`)

**Type Definitions:**
```tsx
// ✅ DO: Explicit interfaces for props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost"
  size?: "sm" | "md" | "lg"
}

// ✅ DO: Use 'Record' for variant/size mappings
const variantClasses: Record<ButtonVariant, string> = {
  primary: "...",
  ghost: "...",
}

// ❌ AVOID: 'any' type
// ❌ AVOID: Omitting prop types in React components
```

**Path Aliases:**
```tsx
// Use @ prefix for imports
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
// Maps to project root (tsconfig.json: "@/*": ["./*"])
```

**React Types:**
```tsx
type ComponentProps<T = React.ElementType> = React.ComponentProps<T>
type FormEvent = React.FormEvent<HTMLFormElement>
type ChangeEvent = React.ChangeEvent<HTMLInputElement>
```

---

## 🧩 Common Libraries

### Next.js Features
- **Dynamic Imports:** `import dynamic from "next/dynamic"`
- **Image Optimization:** `import Image from "next/image"`
- **Link Navigation:** `import Link from "next/link"`
- **Router:** `import { useRouter } from "next/navigation"` (client-side)

### UI Components
- **shadcn/ui** — components are generated via CLI into `components/ui/` and owned by this project
  ```tsx
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  ```
  - Add new components: `npx shadcn@latest add <name>` (config lives in `components.json`)
  - Import from `@/components/ui/<name>` — `shadcn` is not an npm package, never import from it
  - Runtime deps already installed: `clsx`, `tailwind-merge`, `class-variance-authority`
  - To extend: wrap the generated component, don't edit the generated file directly

### Icons
- **lucide-react:** Primary icon library
  ```tsx
  import { ArrowRight, Check, X } from "lucide-react"
  // Always pass aria-hidden when icon is decorative
  <ArrowRight className="h-4 w-4" aria-hidden="true" />
  ```
  - Use `className="h-4 w-4"` for sizing
  - Pass `aria-label` or pair with a visually-hidden label when the icon is the only affordance

### Theme Management
- **next-themes:** Handles `.dark` class on `<html>` — present for consistency, but SubNiche is dark-only
  ```tsx
  import { ThemeProvider } from "next-themes"
  // Root layout: forcedTheme="dark" or defaultTheme="dark"
  ```

### Forms
- **react-hook-form** + **@hookform/resolvers** + **zod**: Standard form stack
  ```tsx
  import { useForm } from "react-hook-form"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { z } from "zod"

  const schema = z.object({ email: z.email() })
  type FormData = z.infer<typeof schema>

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })
  ```

### Database & Auth
- **Prisma + @prisma/client:** ORM for database operations
- **@supabase/supabase-js:** Supabase client library
- **@supabase/ssr:** Server-side auth utilities

### UI Animation
- **tw-animate-css:** CSS entrance/exit animations (`animate-in`, `fade-in`, `zoom-in-95`)
- **framer-motion:** Complex layout animations and drag interactions (reach for this second)

### Testing
- **Vitest + @testing-library/react:** Unit and component tests
  ```bash
  pnpm test           # Run once
  pnpm test:watch     # Watch mode
  ```
- **Playwright:** End-to-end tests
  ```bash
  pnpm test:e2e       # Run all e2e tests
  pnpm test:e2e:ui    # Playwright UI mode
  ```

---

## 🎯 Code Standards

### Naming Conventions

**Files:**
- Components: `kebab-case.tsx` (e.g., `sign-up-screen.tsx`)
- Pages: `kebab-case.tsx` (e.g., `sign-up.tsx`)
- Utilities: `kebab-case.ts` (e.g., `validate-email.ts`)
- Styles: `kebab-case.css` (e.g., `globals.css`)

**Variables & Functions:**
- camelCase for variables, functions
- PascalCase for classes, components, types
- UPPER_SNAKE_CASE for constants

**Constants:**
```tsx
const EMAIL_MAX_LENGTH = 254
const VALIDATION_ERRORS = {
  REQUIRED: "Field is required",
  INVALID: "Invalid value",
}
```

### Component Exports

```tsx
// ✅ DO: Named export for components
export function MyComponent() { }

// ✅ DO: Use React.forwardRef for ref forwarding
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(...)

// ✅ DO: Export types alongside components
export interface MyComponentProps { }
export function MyComponent(props: MyComponentProps) { }

// ✅ DO: Use components/ui/ as base
import { Button as BaseButton } from "@/components/ui/button"
export const MyButton = React.forwardRef<HTMLButtonElement, ButtonProps>(...);
```

### Forms & Validation

**Email Validation Pattern:**
```typescript
function validateEmail(value: string): string | null {
  const trimmedValue = value.trim()
  
  if (!trimmedValue) {
    return "Email is required"
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue)) {
    return "Please enter a valid email address"
  }
  
  return null // Valid
}
```

**Form State Management:**
```tsx
const [email, setEmail] = useState("")
const [emailError, setEmailError] = useState<string | null>(null)
const [isLoading, setIsLoading] = useState(false)

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  const value = event.target.value
  setEmail(value)
  // Clear error on change if previously validated
}

const handleBlur = () => {
  setEmailError(validateEmail(email))
}
```

### Accessibility

**ARIA Attributes:**
```tsx
// Use aria-invalid for validation state
aria-invalid={error ? "true" : "false"}

// Use aria-describedby for help text
aria-describedby={error ? "field-error" : "field-help"}

// Use role="alert" for error messages
<p id="field-error" role="alert" className="text-destructive">
  {error}
</p>
```

**Semantic HTML:**
- Use `<button>` for clickable actions
- Use `<form>` for form submission
- Use `<label htmlFor="id">` for form inputs
- Use `<input type="email">` for email fields

### Accessibility Testing Checklist
- ✅ Keyboard navigation (Tab, Enter, Escape)
- ✅ Screen reader support (aria labels, semantic HTML)
- ✅ Color contrast (WCAG AA minimum)
- ✅ Focus indicators visible
- ✅ No auto-focusing on load (unless login/modal)

---

## 📝 Code Patterns & Examples

### UI Component Usage

**Importing from `components/ui/`:**
```tsx
// Always import from @/components/ui/ — these are project-owned components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
```

**Extending a UI Component:**
```tsx
import { Button } from "@/components/ui/button"

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  isLoading?: boolean
}

export function CustomButton({ isLoading, children, disabled, ...props }: CustomButtonProps) {
  return (
    <Button disabled={disabled || isLoading} {...props}>
      {isLoading ? <SpinnerIcon /> : children}
    </Button>
  )
}
```

**Composing UI Components:**
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function UserForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input placeholder="Name" />
        <Input placeholder="Email" type="email" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  )
}
```

### Icon Components

Use `lucide-react` as the primary icon source:

```tsx
import { ArrowLeft, Check, Loader2 } from "lucide-react"

// Decorative — paired with visible text
<ArrowLeft className="h-4 w-4" aria-hidden="true" />

// Standalone — needs accessible label
<button aria-label="Go back">
  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
</button>
```

Custom SVG icons are acceptable only when `lucide-react` doesn't have the shape needed:

```tsx
function SubNicheLogoIcon() {
  return (
    <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path d="..." stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
```

### Loading/Spinner Pattern

```tsx
function SpinnerIcon({ className = "h-4 w-4 mr-2" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`${className} animate-spin`} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

// In button
<Button disabled={isLoading}>
  {isLoading ? <SpinnerIcon /> : <CheckIcon />}
  {isLoading ? "Loading..." : "Submit"}
</Button>
```

### Multi-Step Form Pattern

```tsx
type FormStep = "form" | "confirmation"
const [step, setStep] = useState<FormStep>("form")

// Conditional rendering with animations
{step === "form" ? (
  <form onSubmit={handleSubmit} noValidate>
    {/* Form content */}
  </form>
) : (
  <section className="animate-in fade-in zoom-in-95 duration-300">
    {/* Confirmation content */}
  </section>
)}
```

### API Response Envelope

All backend responses use the shape `{ data: T | null, error: string | null }`. Always destructure accordingly:

```tsx
const res = await fetch("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
})
const { data, error } = await res.json()

if (!res.ok) {
  setError(error ?? "Something went wrong")
  return
}
// data is the typed payload here
```

### Auth Token Storage

JWT is stored in `localStorage` under the key `"auth_token"`:
```tsx
localStorage.setItem("auth_token", data.token)   // after login / register complete
localStorage.getItem("auth_token")                // to read it
localStorage.removeItem("auth_token")             // on logout
```

### Async Operations Pattern

```tsx
const handleAsyncAction = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  setError(null)
  setIsLoading(true)

  try {
    const res = await fetch("/api/endpoint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    const { data, error } = await res.json()

    if (!res.ok) {
      setError(error ?? "Request failed")
      return
    }

    // Handle success using data
    setStep("next-step")
  } catch (err) {
    setError(err instanceof Error ? err.message : "Unknown error")
  } finally {
    setIsLoading(false)
  }
}
```

---

## 🚀 Development Workflow

### Scripts
```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Build for production
pnpm start            # Start production server
pnpm lint             # Run ESLint
pnpm test             # Run Vitest once
pnpm test:watch       # Run Vitest in watch mode
pnpm test:e2e         # Run Playwright e2e tests
pnpm test:e2e:ui      # Playwright UI mode
```

### File Changes Workflow

1. **Create New Component:**
   ```bash
   # Create file in components/{feature}/ComponentName.tsx
   touch components/ui/new-component.tsx
   ```

2. **Edit Component:**
   - Use TypeScript first
   - Add prop types (extends React element types)
   - Forward refs when needed
   - Use Tailwind classnames with array pattern

3. **Style Component:**
   - Use semantic tokens (`text-foreground`, `bg-card`, `border-border`)
   - Use Tailwind utilities (not custom CSS unless necessary)
   - Dark-only: no need to add `.dark:` variants for base theming

4. **Test Integration:**
   ```bash
   pnpm test:watch
   # Edit component → test updates automatically
   ```

### ESLint Configuration

- Enforces Next.js best practices
- Enforces React component standards
- Run before committing: `npm run lint`

---

## 🔍 Common Patterns & Gotchas

### Use Client vs Server Components

**Client Component ("use client"):**
```tsx
"use client"
import { useState } from "react"

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>
}
```

**Server Component (Default):**
```tsx
// No "use client" directive
import { db } from "@/lib/prisma"

export async function DataDisplay() {
  const data = await db.query()
  return <div>{data}</div>
}
```

**Mixing:** Wrap server data in client components carefully:
```tsx
// Page (Server)
import { DataDisplay } from "@/components/data-display"
export default async function Page() {
  return <DataDisplay />
}

// Client wrapper - receives data as props
"use client"
export function DataDisplay({ data }) {
  return <div>{data}</div>
}
```

### CSS Classes Best Practices

**DO:**
```tsx
className={[
  "base-classes",
  "hover:text-brand transition-colors",
  isActive ? "font-bold" : "font-normal",
  className, // Allow parent override
].join(" ")}
```

**DON'T:**
```tsx
// ❌ String concatenation doesn't allow dynamic purging
className={`text-${size}`}

// ❌ Missing destructuring for ref
export function Button({ ...props }) { }

// ❌ Not using component prop typing
export function Button(props: any) { }
```

### Event Handling

```tsx
// ✅ Prevent default & stop propagation
const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault()
  // ...
}

const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  event.preventDefault() // If needed
  // ...
}

// ✅ Use proper typing for event handlers
type ClickHandler = React.MouseEventHandler<HTMLButtonElement>
type FormHandler = React.FormEventHandler<HTMLFormElement>
```

---

## 🎓 Learning Resources

### Project-Specific
- Review `components/auth/sign-up-screen.tsx` for form patterns
- Check `components/ui/button.tsx` for reusable component structure
- Study `app/globals.css` for color/theme system

### External Documentation
- **Next.js:** https://nextjs.org/docs
- **React 19:** https://react.dev
- **Tailwind CSS 4:** https://tailwindcss.com/docs
- **Zod Validation:** https://zod.dev
- **TypeScript:** https://www.typescriptlang.org/docs

---

## 🚫 Backend Files — Hands Off

Claude MUST NOT modify any file in these paths:
- `server/` — controllers, validators, services, decorators
- `app/api/` — Next.js API route handlers
- `lib/swagger/` — OpenAPI spec
- `prisma/` — database schema and migrations
- `lib/prisma.ts`, `lib/supabase/` — data clients

**If a frontend task requires a backend change**, do NOT edit those files. Instead output this block and continue with whatever frontend work is possible:

```
📋 BACKEND CHANGE NEEDED
Requested by: frontend task — [brief description]

File to change: [exact file path]
What's needed: [describe the change — new endpoint, new field in response, etc.]
Why: [explain what the frontend needs and why the current backend doesn't support it]
```

---

## ✅ Submission Checklist

Before submitting code for review:

- [ ] Uses `components/ui/` components as default (or custom wrapper)
- [ ] Component uses TypeScript with explicit types
- [ ] Accessibility attributes included (aria-*, role, labels)
- [ ] Tailwind classes used (no random inline styles)
- [ ] Responsive design considered (md:, lg: breakpoints)
- [ ] Uses semantic color tokens (no hardcoded colors — dark-only by design)
- [ ] Error states handled
- [ ] Loading states included
- [ ] Props properly typed
- [ ] No `console.log` in production code
- [ ] ESLint passing (`npm run lint`)
- [ ] Tests passing (`npm run test`)

---

## 📋 API Spec Compliance

> **🚨 FOR AI SYSTEMS:** When creating or modifying any controller, validator, or API route, you **MUST read `lib/swagger/spec.ts` and `server/decorators/api.decorators.ts` first.** Those files are the single source of truth for how routes and schemas are registered. Match every pattern you find there exactly — do not invent your own approach.

The project auto-generates an OpenAPI 3.0 spec. Every new controller and validator must be wired into it following the same pattern as existing files. Read the spec before writing any new API code.

---


## �📞 Questions?

When working with AI:
1. Reference this document's patterns
2. Ask for clarification on style/component approach
3. Request examples from existing components
4. Validate patterns against this document before implementation

---

## 🔍 PRE-IMPLEMENTATION CHECKLIST FOR AI

**BEFORE you write any code:**

- [ ] I have read the entire frontend.md document
- [ ] I have identified all applicable patterns for this task
- [ ] I checked for conflicts between the request and these guidelines
- [ ] If conflicts exist, I have asked the user to clarify or update this document
- [ ] I have received explicit confirmation to proceed (or a justified exception)
- [ ] The implementation approach aligns with this document
- [ ] I am ready to explain how this code follows these guidelines

**If you cannot check ALL boxes above, DO NOT PROCEED with implementation.**

---

**Remember:** Consistency > Perfection. Follow existing patterns in the codebase.
