import { type Page, type Locator, expect } from "@playwright/test"

export class LoginPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly showPasswordButton: Locator
  readonly emailError: Locator
  readonly passwordError: Locator
  readonly formError: Locator
  readonly backLink: Locator
  readonly signUpLink: Locator
  readonly googleButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel("Email")
    this.passwordInput = page.getByLabel("Password")
    this.submitButton = page.getByRole("button", { name: /^sign in$/i })
    this.showPasswordButton = page.getByRole("button", { name: /show password/i })
    // Field-level errors are scoped to their describedby ids
    this.emailError = page.locator("#login-email-error")
    this.passwordError = page.locator("#login-password-error")
    // Form-level error: the alert that is NOT scoped to a field
    this.formError = page.locator('[role="alert"]').filter({ hasNot: page.locator("#login-email-error, #login-password-error") })
    this.backLink = page.getByRole("link", { name: /back/i })
    this.signUpLink = page.getByRole("link", { name: /sign up/i })
    this.googleButton = page.getByRole("button", { name: /continue with google/i })
  }

  async goto() {
    await this.page.goto("/login")
  }

  async fillEmail(value: string) {
    await this.emailInput.fill(value)
  }

  async fillPassword(value: string) {
    await this.passwordInput.fill(value)
  }

  async submit() {
    await this.submitButton.click()
  }

  async login(email: string, password: string) {
    await this.fillEmail(email)
    await this.fillPassword(password)
    await this.submit()
  }

  async blurEmail() {
    await this.emailInput.blur()
  }

  async blurPassword() {
    await this.passwordInput.blur()
  }

  async expectEmailError(message: string) {
    await expect(this.emailError).toBeVisible()
    await expect(this.emailError).toContainText(message)
  }

  async expectPasswordError(message: string) {
    await expect(this.passwordError).toBeVisible()
    await expect(this.passwordError).toContainText(message)
  }

  async expectFormError(message: string) {
    const alert = this.page.locator('[role="alert"]').filter({ hasText: message })
    await expect(alert).toBeVisible()
  }

  async expectRedirectTo(urlPattern: string | RegExp) {
    await this.page.waitForURL(urlPattern)
  }

  async expectPasswordVisible() {
    await expect(this.passwordInput).toHaveAttribute("type", "text")
  }

  async expectPasswordHidden() {
    await expect(this.passwordInput).toHaveAttribute("type", "password")
  }
}
