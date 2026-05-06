import { test, expect } from "@playwright/test"
import { LoginPage } from "../pages/login.page"

const VALID_EMAIL = process.env.E2E_TEST_EMAIL ?? "e2e@subniche.test"
const VALID_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "Test1234!"

test.describe("Login page", () => {
  let loginPage: LoginPage

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
  })

  // ─── Layout ────────────────────────────────────────────────────────────────

  test("renders the login form", async () => {
    await expect(loginPage.emailInput).toBeVisible()
    await expect(loginPage.passwordInput).toBeVisible()
    await expect(loginPage.submitButton).toBeVisible()
    await expect(loginPage.submitButton).toBeEnabled()
  })

  test("renders back link and sign up link", async () => {
    await expect(loginPage.backLink).toBeVisible()
    await expect(loginPage.signUpLink).toBeVisible()
  })

  test("renders Google sign-in button", async () => {
    await expect(loginPage.googleButton).toBeVisible()
  })

  test("password is hidden by default", async () => {
    await loginPage.expectPasswordHidden()
  })

  // ─── Password toggle ────────────────────────────────────────────────────────

  test("toggles password visibility", async () => {
    await loginPage.fillPassword("mysecret")
    await loginPage.expectPasswordHidden()
    await loginPage.showPasswordButton.click()
    await loginPage.expectPasswordVisible()
    await loginPage.page.getByRole("button", { name: /hide password/i }).click()
    await loginPage.expectPasswordHidden()
  })

  // ─── Field-level validation (on blur) ──────────────────────────────────────

  test("shows email required error on blur when empty", async () => {
    await loginPage.emailInput.focus()
    await loginPage.blurEmail()
    await loginPage.expectEmailError("Email is required")
  })

  test("shows invalid email error on blur with bad format", async () => {
    await loginPage.fillEmail("notanemail")
    await loginPage.blurEmail()
    await loginPage.expectEmailError("Please enter a valid email address")
  })

  test("shows password required error on blur when empty", async () => {
    await loginPage.passwordInput.focus()
    await loginPage.blurPassword()
    await loginPage.expectPasswordError("Password is required")
  })

  test("clears email error when user types a valid email", async () => {
    await loginPage.fillEmail("bad")
    await loginPage.blurEmail()
    await loginPage.expectEmailError("Please enter a valid email address")
    await loginPage.fillEmail("good@email.com")
    await expect(loginPage.emailError).not.toBeVisible()
  })

  test("clears password error when user types", async () => {
    await loginPage.passwordInput.focus()
    await loginPage.blurPassword()
    await loginPage.expectPasswordError("Password is required")
    await loginPage.fillPassword("anything")
    await expect(loginPage.passwordError).not.toBeVisible()
  })

  // ─── Submit-time validation ─────────────────────────────────────────────────

  test("shows both field errors when form is submitted empty", async () => {
    await loginPage.submit()
    await loginPage.expectEmailError("Email is required")
    await loginPage.expectPasswordError("Password is required")
  })

  test("does not submit when email is invalid", async () => {
    await loginPage.login("bademail", VALID_PASSWORD)
    await loginPage.expectEmailError("Please enter a valid email address")
    // still on login page
    await expect(loginPage.page).toHaveURL(/\/login/)
  })

  // ─── API error handling ─────────────────────────────────────────────────────

  test("shows error on wrong credentials", async () => {
    await loginPage.login(VALID_EMAIL, "wrongpassword")
    await loginPage.expectFormError("Invalid email or password")
  })

  test("shows error on unknown email", async () => {
    await loginPage.login("nobody@subniche.test", "SomePass1!")
    await loginPage.expectFormError("Invalid email or password")
  })

  // ─── Success flow ───────────────────────────────────────────────────────────

  test("redirects to home after successful login", async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD)
    await loginPage.expectRedirectTo("/")
  })

  test("stores auth token in localStorage after login", async ({ page }) => {
    loginPage = new LoginPage(page)
    await loginPage.goto()
    await loginPage.login(VALID_EMAIL, VALID_PASSWORD)
    await page.waitForURL("/")

    const token = await page.evaluate(() => localStorage.getItem("auth_token"))
    expect(token).toBeTruthy()
    expect(typeof token).toBe("string")
  })

  // ─── Navigation ─────────────────────────────────────────────────────────────

  test("back link navigates to home", async ({ page }) => {
    await loginPage.backLink.click()
    await expect(page).toHaveURL("/")
  })

  test("sign up link navigates to register", async ({ page }) => {
    await loginPage.signUpLink.click()
    await expect(page).toHaveURL("/register")
  })

  // ─── Accessibility ──────────────────────────────────────────────────────────

  test("email input has aria-invalid=true when error is shown", async () => {
    await loginPage.submit()
    await expect(loginPage.emailInput).toHaveAttribute("aria-invalid", "true")
  })

  test("email input has aria-invalid=false initially", async () => {
    await expect(loginPage.emailInput).toHaveAttribute("aria-invalid", "false")
  })

  test("error messages use role=alert", async () => {
    await loginPage.submit()
    const alerts = loginPage.page.locator('[role="alert"]')
    await expect(alerts.first()).toBeVisible()
  })

  test("form is keyboard navigable", async ({ page }) => {
    await loginPage.emailInput.focus()
    await page.keyboard.press("Tab")
    await expect(loginPage.passwordInput).toBeFocused()
  })
})
