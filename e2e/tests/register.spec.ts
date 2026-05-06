import { test, expect } from "@playwright/test"
import { RegisterPage, CompleteSetupPage } from "../pages/register.page"

const MOCK_EMAIL = "test@example.com"
const MOCK_TOKEN = "valid-token-abc"
const MOCK_CODE = "TEST01"
const VALID_PASSWORD = "ValidPass1!"

// ─── Sign-up form (/register) ─────────────────────────────────────────────────

test.describe("Register — sign-up form", () => {
  let registerPage: RegisterPage

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page)
    await registerPage.goto()
  })

  // ─── Layout ──────────────────────────────────────────────────────────────────

  test("renders form elements", async () => {
    await expect(registerPage.emailInput).toBeVisible()
    await expect(registerPage.submitButton).toBeVisible()
    await expect(registerPage.googleButton).toBeVisible()
  })

  test("renders back link and sign-in link", async () => {
    await expect(registerPage.backLink).toBeVisible()
    await expect(registerPage.signInLink).toBeVisible()
  })

  // ─── Navigation ──────────────────────────────────────────────────────────────

  test("back link navigates to home", async ({ page }) => {
    await registerPage.backLink.click()
    await expect(page).toHaveURL("/")
  })

  test("sign-in link navigates to login", async ({ page }) => {
    await registerPage.signInLink.click()
    await expect(page).toHaveURL("/login")
  })

  // ─── Field validation ────────────────────────────────────────────────────────

  test("shows email required error on blur when empty", async () => {
    await registerPage.emailInput.focus()
    await registerPage.blurEmail()
    await registerPage.expectEmailError("Email is required")
  })

  test("shows invalid email error on blur with bad format", async () => {
    await registerPage.fillEmail("notanemail")
    await registerPage.blurEmail()
    await registerPage.expectEmailError("Please enter a valid email address")
  })

  test("shows email error when form is submitted empty", async () => {
    await registerPage.submit()
    await registerPage.expectEmailError("Email is required")
  })

  test("clears email error when user types a valid email", async () => {
    await registerPage.fillEmail("bad")
    await registerPage.blurEmail()
    await registerPage.expectEmailError("Please enter a valid email address")
    await registerPage.fillEmail("good@email.com")
    await expect(registerPage.emailError).not.toBeVisible()
  })

  // ─── API interactions ────────────────────────────────────────────────────────

  test("shows check-email step after successful initiate (202)", async ({ page }) => {
    await page.route("**/api/auth/register/initiate", route =>
      route.fulfill({ status: 202, json: { data: { message: "Verification email sent" }, error: null } })
    )
    await registerPage.initiate(MOCK_EMAIL)
    await registerPage.expectCheckEmailStep(MOCK_EMAIL)
  })

  test("shows check-email step when email is already registered (409)", async ({ page }) => {
    await page.route("**/api/auth/register/initiate", route =>
      route.fulfill({ status: 409, json: { data: null, error: "Email already registered" } })
    )
    await registerPage.initiate(MOCK_EMAIL)
    await registerPage.expectCheckEmailStep(MOCK_EMAIL)
  })

  // ─── Check-email step ────────────────────────────────────────────────────────

  test("use-different-email button returns to the form", async ({ page }) => {
    await page.route("**/api/auth/register/initiate", route =>
      route.fulfill({ status: 202, json: { data: { message: "Sent" }, error: null } })
    )
    await registerPage.initiate(MOCK_EMAIL)
    await registerPage.expectCheckEmailStep(MOCK_EMAIL)
    await registerPage.useDifferentEmailButton.click()
    await expect(registerPage.submitButton).toBeVisible()
  })

  // ─── Accessibility ────────────────────────────────────────────────────────────

  test("email input has aria-invalid=true when error is shown", async () => {
    await registerPage.submit()
    await expect(registerPage.emailInput).toHaveAttribute("aria-invalid", "true")
  })

  test("email input has aria-invalid=false initially", async () => {
    await expect(registerPage.emailInput).toHaveAttribute("aria-invalid", "false")
  })

  test("error messages use role=alert", async () => {
    await registerPage.submit()
    const alert = registerPage.page.locator('[role="alert"]')
    await expect(alert.first()).toBeVisible()
  })
})

// ─── Complete setup (/register/complete) ─────────────────────────────────────

test.describe("Register — complete setup", () => {
  test("shows token error when no token is provided", async ({ page }) => {
    const setupPage = new CompleteSetupPage(page)
    await setupPage.goto("")
    await setupPage.expectTokenError("Invalid verification link")
  })

  test("shows token error when verify API returns an error", async ({ page }) => {
    await page.route("**/api/auth/register/verify**", route =>
      route.fulfill({ status: 404, json: { data: null, error: "Invalid or expired verification token" } })
    )
    const setupPage = new CompleteSetupPage(page)
    await setupPage.goto(MOCK_TOKEN)
    await setupPage.expectTokenError("invalid or has expired")
  })

  test("renders form with pre-filled email and code after valid token", async ({ page }) => {
    await page.route("**/api/auth/register/verify**", route =>
      route.fulfill({ status: 200, json: { data: { email: MOCK_EMAIL, code: MOCK_CODE }, error: null } })
    )
    const setupPage = new CompleteSetupPage(page)
    await setupPage.goto(MOCK_TOKEN)
    await setupPage.waitForForm()
    await expect(setupPage.emailInput).toHaveValue(MOCK_EMAIL)
    await expect(setupPage.userCodeInput).toHaveValue(MOCK_CODE)
  })

  // ─── Form validation ──────────────────────────────────────────────────────────

  test.describe("form validation", () => {
    test.beforeEach(async ({ page }) => {
      await page.route("**/api/auth/register/verify**", route =>
        route.fulfill({ status: 200, json: { data: { email: MOCK_EMAIL, code: MOCK_CODE }, error: null } })
      )
    })

    test("shows UserID required error on blur when cleared", async ({ page }) => {
      const setupPage = new CompleteSetupPage(page)
      await setupPage.goto(MOCK_TOKEN)
      await setupPage.waitForForm()
      await setupPage.fillUserCode("")
      await setupPage.blurUserCode()
      await setupPage.expectUserCodeError("UserID is required")
    })

    test("shows UserID format error with invalid characters", async ({ page }) => {
      const setupPage = new CompleteSetupPage(page)
      await setupPage.goto(MOCK_TOKEN)
      await setupPage.waitForForm()
      await setupPage.fillUserCode("invalid!")
      await setupPage.blurUserCode()
      await setupPage.expectUserCodeError("Letters, numbers, and underscores only")
    })

    test("shows password required error on blur when empty", async ({ page }) => {
      const setupPage = new CompleteSetupPage(page)
      await setupPage.goto(MOCK_TOKEN)
      await setupPage.waitForForm()
      await setupPage.passwordInput.focus()
      await setupPage.blurPassword()
      await setupPage.expectPasswordError("Password is required")
    })

    test("shows password too short error", async ({ page }) => {
      const setupPage = new CompleteSetupPage(page)
      await setupPage.goto(MOCK_TOKEN)
      await setupPage.waitForForm()
      await setupPage.fillPassword("short")
      await setupPage.blurPassword()
      await setupPage.expectPasswordError("at least 8 characters")
    })

    test("password visibility toggles on show/hide button", async ({ page }) => {
      const setupPage = new CompleteSetupPage(page)
      await setupPage.goto(MOCK_TOKEN)
      await setupPage.waitForForm()
      await setupPage.fillPassword("mysecret")
      await setupPage.expectPasswordHidden()
      await setupPage.showPasswordButton.click()
      await setupPage.expectPasswordVisible()
      await page.getByRole("button", { name: /hide password/i }).click()
      await setupPage.expectPasswordHidden()
    })

    test("UserID input auto-converts to uppercase", async ({ page }) => {
      const setupPage = new CompleteSetupPage(page)
      await setupPage.goto(MOCK_TOKEN)
      await setupPage.waitForForm()
      await setupPage.fillUserCode("lowercase")
      await expect(setupPage.userCodeInput).toHaveValue("LOWERCASE")
    })
  })

  // ─── API interactions ─────────────────────────────────────────────────────────

  test("shows conflict error when account already exists", async ({ page }) => {
    await page.route("**/api/auth/register/verify**", route =>
      route.fulfill({ status: 200, json: { data: { email: MOCK_EMAIL, code: MOCK_CODE }, error: null } })
    )
    await page.route("**/api/auth/register/complete", route =>
      route.fulfill({ status: 409, json: { data: null, error: "Email already registered" } })
    )
    const setupPage = new CompleteSetupPage(page)
    await setupPage.goto(MOCK_TOKEN)
    await setupPage.waitForForm()
    await setupPage.complete(MOCK_CODE, VALID_PASSWORD)
    await setupPage.expectFormError("already exists")
  })

  test("redirects to /register/niche on successful completion", async ({ page }) => {
    await page.route("**/api/auth/register/verify**", route =>
      route.fulfill({ status: 200, json: { data: { email: MOCK_EMAIL, code: MOCK_CODE }, error: null } })
    )
    await page.route("**/api/auth/register/complete", route =>
      route.fulfill({ status: 201, json: { data: { token: "jwt-token-xyz", email: MOCK_EMAIL }, error: null } })
    )
    const setupPage = new CompleteSetupPage(page)
    await setupPage.goto(MOCK_TOKEN)
    await setupPage.waitForForm()
    await setupPage.complete(MOCK_CODE, VALID_PASSWORD)
    await page.waitForURL(/\/register\/niche/)
    await expect(page).toHaveURL(/\/register\/niche/)
  })

  test("stores auth token in localStorage after successful completion", async ({ page }) => {
    await page.route("**/api/auth/register/verify**", route =>
      route.fulfill({ status: 200, json: { data: { email: MOCK_EMAIL, code: MOCK_CODE }, error: null } })
    )
    await page.route("**/api/auth/register/complete", route =>
      route.fulfill({ status: 201, json: { data: { token: "jwt-token-xyz", email: MOCK_EMAIL }, error: null } })
    )
    const setupPage = new CompleteSetupPage(page)
    await setupPage.goto(MOCK_TOKEN)
    await setupPage.waitForForm()
    await setupPage.complete(MOCK_CODE, VALID_PASSWORD)
    await page.waitForURL(/\/register\/niche/)
    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    expect(token).toBe("jwt-token-xyz")
  })
})
