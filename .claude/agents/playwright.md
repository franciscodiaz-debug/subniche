# Playwright E2E Testing Guidelines

> **🚨 IMPORTANT FOR AI SYSTEMS:** This document MUST be read in full before writing any E2E test, fixture, or Playwright config.
> This is the single source of truth for test architecture, patterns, and automation coverage.
>
> Version: 1.0 | Last Updated: April 27, 2026

---

## 📋 Quick Reference

**Test runner:** Playwright (`@playwright/test`)
**Language:** TypeScript
**Test directory:** `e2e/`
**Config file:** `playwright.config.ts` (project root)
**Run E2E tests:** `npm run test:e2e`
**Run single test:** `npx playwright test e2e/tests/login.spec.ts`
**Debug mode:** `npx playwright test --debug`
**UI mode:** `npx playwright test --ui`

---

## 🛠️ Installation (one-time setup)

```bash
npm install -D @playwright/test
npx playwright install chromium firefox webkit
```

Add to `package.json` scripts:
```json
"test:e2e": "playwright test",
"test:e2e:ui": "playwright test --ui",
"test:e2e:debug": "playwright test --debug",
"test:e2e:report": "playwright show-report"
```

---

## 📁 Directory Structure

```
e2e/
├── fixtures/
│   ├── auth.fixture.ts          # Auth state factory (login bypass, seed user)
│   └── index.ts                 # Re-exports all fixtures
├── pages/
│   ├── landing.page.ts          # Page Object: home / landing
│   ├── login.page.ts            # Page Object: /login
│   ├── register.page.ts         # Page Object: /register
│   ├── complete-setup.page.ts   # Page Object: /register/complete
│   ├── niche-select.page.ts     # Page Object: /register/niche
│   ├── niche-home.page.ts       # Page Object: /niche/[slug]
│   ├── create-listing.page.ts   # Page Object: /niche/[slug]/create
│   └── listing.page.ts          # Page Object: /niche/[slug]/listing/[id]
├── tests/
│   ├── landing.spec.ts          # Public landing page
│   ├── login.spec.ts            # Login flow + validation
│   ├── register.spec.ts         # Registration flow
│   ├── auth-guard.spec.ts       # Protected route redirects
│   ├── niche.spec.ts            # Niche home page
│   ├── create-listing.spec.ts   # Create listing form
│   └── listing.spec.ts          # View listing detail
├── helpers/
│   ├── api.ts                   # Direct API calls for test setup
│   └── db.ts                    # Database seeding helpers (Prisma direct)
└── global-setup.ts              # Runs once before all tests (seed DB, create users)
```

---

## ⚙️ Playwright Config

`playwright.config.ts` (project root):

```ts
import { defineConfig, devices } from "@playwright/test"

export default defineConfig({
  testDir: "./e2e/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],
  globalSetup: "./e2e/global-setup.ts",

  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
  },

  projects: [
    // Setup project — logs in and saves auth state
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    // Tests that need authentication
    {
      name: "authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/user.json",
      },
      dependencies: ["setup"],
    },
    // Tests that are public (no auth)
    {
      name: "public",
      use: { ...devices["Desktop Chrome"] },
    },
    // Cross-browser smoke tests (CI only)
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
      testMatch: /.*smoke.*/,
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      testMatch: /.*smoke.*/,
    },
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```

---

## 🔐 Auth Fixture — Bypassing Email Verification

Email magic links cannot be intercepted in E2E tests. Use the API directly to create and authenticate a test user.

### `e2e/helpers/api.ts`

```ts
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000"

export async function loginViaApi(email: string, password: string) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      identity: {
        provider: "password",
        identify_name: "email",
        identify_value: email,
        password,
      },
    }),
  })
  const { data, error } = await res.json()
  if (!res.ok) throw new Error(`Login failed: ${error}`)
  return data.token as string
}
```

### `e2e/fixtures/auth.fixture.ts`

```ts
import { test as base, Page } from "@playwright/test"
import { loginViaApi } from "../helpers/api"

const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? "e2e@subniche.test",
  password: process.env.E2E_TEST_PASSWORD ?? "Test1234!",
}

async function injectAuthToken(page: Page, token: string) {
  await page.addInitScript((t) => {
    localStorage.setItem("auth_token", t)
  }, token)
}

// Fixture: provides an already-authenticated page
export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    const token = await loginViaApi(TEST_USER.email, TEST_USER.password)
    await injectAuthToken(page, token)
    await use(page)
  },
})

export { expect } from "@playwright/test"
export { TEST_USER }
```

### Auth setup project — `e2e/auth.setup.ts`

Logs in once and saves browser storage state for reuse across the authenticated project:

```ts
import { test as setup, expect } from "@playwright/test"
import { loginViaApi } from "./helpers/api"

const authFile = "e2e/.auth/user.json"

setup("authenticate", async ({ page }) => {
  const token = await loginViaApi(
    process.env.E2E_TEST_EMAIL ?? "e2e@subniche.test",
    process.env.E2E_TEST_PASSWORD ?? "Test1234!"
  )

  await page.goto("/")
  await page.evaluate((t) => localStorage.setItem("auth_token", t), token)
  await page.context().storageState({ path: authFile })
})
```

Add `e2e/.auth/` to `.gitignore`.

---

## 📄 Page Object Model

Every page gets its own class. Test files use page objects — never raw Playwright locators in test files.

### Pattern

```ts
import { Page, Locator, expect } from "@playwright/test"

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel("Email")
    this.passwordInput = page.getByLabel("Password")
    this.submitButton = page.getByRole("button", { name: /sign in/i })
    this.errorMessage = page.getByRole("alert")
  }

  async goto() {
    await this.page.goto("/login")
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
    await this.submitButton.click()
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toBeVisible()
    await expect(this.errorMessage).toContainText(message)
  }

  async expectRedirectTo(url: string) {
    await this.page.waitForURL(url)
  }
}
```

### Selector priority (use in this order)

1. `getByRole` — semantic HTML roles: `getByRole("button", { name: "Submit" })`
2. `getByLabel` — form fields: `getByLabel("Email")`
3. `getByText` — visible text: `getByText("Sign in")`
4. `getByTestId` — explicit test IDs: `getByTestId("submit-btn")` (add `data-testid` to components when needed)
5. `locator("css")` — last resort, avoid when semantic selectors exist

> ❌ Never use `locator(".some-class")` or `locator("#some-id")` — these break on refactors

---

## 🧪 Test Patterns

### Public test file (no auth)

```ts
import { test, expect } from "@playwright/test"
import { LoginPage } from "../pages/login.page"

test.describe("Login page", () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  test("shows login form", async () => {
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeEnabled()
  })

  test("shows error on invalid credentials", async () => {
    await loginPage.login("wrong@email.com", "wrongpassword")
    await loginPage.expectError("Invalid credentials")
  })

  test("shows validation error on empty submit", async () => {
    await loginPage.submitButton.click()
    await loginPage.expectError("Email is required")
  })
})
```

### Authenticated test file

```ts
import { test, expect } from "../fixtures"   // imports authed fixture
import { NicheHomePage } from "../pages/niche-home.page"

test.describe("Niche home", () => {
  test("shows niche content when authenticated", async ({ authedPage }) => {
    const niche = new NicheHomePage(authedPage)
    await niche.goto("gaming")
    await expect(niche.heading).toBeVisible()
  })
})
```

### API route testing (within Playwright)

Use Playwright's `request` fixture for API-level tests without UI:

```ts
test("POST /api/auth/login returns token", async ({ request }) => {
  const res = await request.post("/api/auth/login", {
    data: {
      identity: {
        provider: "password",
        identify_name: "email",
        identify_value: "e2e@subniche.test",
        password: "Test1234!",
      },
    },
  })
  expect(res.ok()).toBeTruthy()
  const { data, error } = await res.json()
  expect(error).toBeNull()
  expect(data.token).toBeDefined()
})
```

---

## ✅ What to Test — Full Coverage Map

### Public flows

| Test | File | Priority |
|------|------|----------|
| Landing page renders with navbar + hero | `landing.spec.ts` | High |
| Landing page has "Sign in" and "Register" links | `landing.spec.ts` | High |
| Login form renders | `login.spec.ts` | High |
| Login succeeds with valid credentials → redirect | `login.spec.ts` | High |
| Login fails with wrong password → error message | `login.spec.ts` | High |
| Login fails with empty email → validation message | `login.spec.ts` | High |
| Login fails with invalid email format → validation message | `login.spec.ts` | High |
| Register form renders | `register.spec.ts` | High |
| Register shows confirmation after email submit | `register.spec.ts` | High |
| Register shows error on already-used email | `register.spec.ts` | Medium |
| Register shows validation error on empty submit | `register.spec.ts` | High |
| 404 page renders for unknown routes | `landing.spec.ts` | Medium |

### Auth guard flows

| Test | File | Priority |
|------|------|----------|
| Protected route redirects unauthenticated user | `auth-guard.spec.ts` | High |
| After login, user can access protected routes | `auth-guard.spec.ts` | High |
| Auth token stored in localStorage after login | `auth-guard.spec.ts` | Medium |

### Protected flows (requires auth fixture)

| Test | File | Priority |
|------|------|----------|
| Niche home page loads for valid slug | `niche.spec.ts` | High |
| Niche sidebar is visible on desktop | `niche.spec.ts` | Medium |
| Niche sidebar is hidden on mobile | `niche.spec.ts` | Medium |
| Create listing form renders | `create-listing.spec.ts` | High |
| Create listing validates required fields | `create-listing.spec.ts` | High |
| Create listing submits successfully | `create-listing.spec.ts` | High |
| Listing detail page renders | `listing.spec.ts` | High |
| Listing detail shows seller info | `listing.spec.ts` | Medium |

### API routes (Playwright request fixture)

| Test | File | Priority |
|------|------|----------|
| `GET /api/status` returns 200 | `api.spec.ts` | High |
| `POST /api/auth/login` with valid creds returns token | `api.spec.ts` | High |
| `POST /api/auth/login` with bad creds returns 401 | `api.spec.ts` | High |
| `GET /api/niche` returns niche list | `api.spec.ts` | High |
| `GET /api/niche/[slug]` returns niche data | `api.spec.ts` | Medium |
| Protected API returns 401 without token | `api.spec.ts` | High |

### Form validation (cross-cutting)

Each form should have tests for:
- Empty submit shows required field errors
- Invalid format (email, password length) shows specific error
- Valid submit proceeds without errors
- Error messages have `role="alert"` (accessibility)
- Submit button disabled during loading

### Accessibility

| Test | File | Priority |
|------|------|----------|
| Login form is keyboard-navigable (Tab order) | `login.spec.ts` | High |
| Error messages announced via `role="alert"` | `login.spec.ts` | High |
| Interactive elements have accessible names | `landing.spec.ts` | Medium |

---

## 🌐 Global Setup — `e2e/global-setup.ts`

Runs once before all tests to seed the test database:

```ts
import { chromium } from "@playwright/test"
import { loginViaApi } from "./helpers/api"

async function globalSetup() {
  // Verify the dev server is reachable
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000")
  await browser.close()

  // Optionally seed DB here via Prisma (import prisma from lib/prisma)
  // or call a dedicated seed endpoint in test env
}

export default globalSetup
```

For database seeding, prefer a dedicated `POST /api/test/seed` endpoint (gated to `NODE_ENV=test`) over importing Prisma directly — this keeps E2E setup from coupling to ORM internals.

---

## 🔑 Environment Variables for E2E

Add to `.env.test.local` (never commit):

```bash
# E2E test user (must exist in database before tests run)
E2E_TEST_EMAIL=e2e@subniche.test
E2E_TEST_PASSWORD=Test1234!

# Override base URL for E2E (defaults to localhost:3000)
PLAYWRIGHT_BASE_URL=http://localhost:3000

# Point to test database if available
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres_test
```

---

## 🚦 CI/CD — `.github/workflows/e2e.yml`

```yaml
name: E2E Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci
      - run: npx playwright install --with-deps chromium

      - name: Start app and run E2E tests
        run: npm run test:e2e
        env:
          CI: true
          E2E_TEST_EMAIL: ${{ secrets.E2E_TEST_EMAIL }}
          E2E_TEST_PASSWORD: ${{ secrets.E2E_TEST_PASSWORD }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
          DATABASE_URL: ${{ secrets.DATABASE_URL }}

      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7
```

---

## 📐 Rules & Conventions

### Naming

- Test files: `{feature}.spec.ts` (e.g., `login.spec.ts`)
- Setup files: `{name}.setup.ts` (e.g., `auth.setup.ts`)
- Page objects: `{page-name}.page.ts` (e.g., `login.page.ts`)
- Fixture files: `{name}.fixture.ts`

### Test isolation

- Each test MUST be independent — no shared mutable state between tests
- Use `test.beforeEach` to navigate to the page fresh
- Use `test.afterEach` or `test.afterAll` to clean up seeded data
- Never rely on test execution order

### Waiting strategy

```ts
// ✅ Wait for UI state
await expect(page.getByRole("alert")).toBeVisible()

// ✅ Wait for navigation
await page.waitForURL("/dashboard")

// ✅ Wait for network
await page.waitForResponse("/api/auth/login")

// ❌ Never use arbitrary sleeps
await page.waitForTimeout(2000)  // DO NOT DO THIS
```

### Test data

- Use `E2E_TEST_EMAIL` / `E2E_TEST_PASSWORD` from env — never hardcode credentials
- Dynamic data (listing titles, etc.) use unique suffixes: `Test listing ${Date.now()}`
- Clean up created data in `afterEach` or use isolated DB per run

### Adding `data-testid` attributes

When a semantic selector cannot uniquely identify an element, add `data-testid` to the component:

```tsx
// In the component (frontend)
<button data-testid="submit-login" type="submit">Sign in</button>

// In the test
page.getByTestId("submit-login")
```

Use sparingly — prefer semantic selectors when possible.

---

## ✅ Pre-Implementation Checklist for AI

**BEFORE writing any E2E test:**

- [ ] I have read the entire playwright.md document
- [ ] I am using Page Objects — no raw locators in test files
- [ ] I am using semantic selectors (`getByRole`, `getByLabel`, `getByText`) first
- [ ] I import the auth fixture for tests that require authentication
- [ ] Each test is independent (no shared state with other tests)
- [ ] I am NOT using `waitForTimeout` — only waiting on UI/network state
- [ ] Test user credentials come from env vars, not hardcoded
- [ ] New test files are placed in `e2e/tests/`
- [ ] Page object files are placed in `e2e/pages/`

**If you cannot check ALL boxes above, DO NOT PROCEED.**
