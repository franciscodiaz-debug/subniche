import { type Page, type Locator, expect } from "@playwright/test"

export class RegisterPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly submitButton: Locator
  readonly emailError: Locator
  readonly formError: Locator
  readonly backLink: Locator
  readonly signInLink: Locator
  readonly googleButton: Locator
  readonly checkEmailHeading: Locator
  readonly useDifferentEmailButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.getByLabel("Email")
    this.submitButton = page.getByRole("button", { name: /^send link$/i })
    this.emailError = page.locator("#signup-email-error")
    this.formError = page.locator('[role="alert"]').filter({ hasNot: page.locator("#signup-email-error") })
    this.backLink = page.getByRole("link", { name: /back/i })
    this.signInLink = page.getByRole("link", { name: /log in/i })
    this.googleButton = page.getByRole("button", { name: /continue with google/i })
    this.checkEmailHeading = page.getByRole("heading", { name: /check your email/i })
    this.useDifferentEmailButton = page.getByRole("button", { name: /use a different email/i })
  }

  async goto() {
    await this.page.goto("/register")
  }

  async fillEmail(value: string) {
    await this.emailInput.fill(value)
  }

  async blurEmail() {
    await this.emailInput.blur()
  }

  async submit() {
    await this.submitButton.click()
  }

  async initiate(email: string) {
    await this.fillEmail(email)
    await this.submit()
  }

  async expectEmailError(message: string) {
    await expect(this.emailError).toBeVisible()
    await expect(this.emailError).toContainText(message)
  }

  async expectCheckEmailStep(email: string) {
    await expect(this.checkEmailHeading).toBeVisible()
    await expect(this.page.getByText(email)).toBeVisible()
  }
}

export class CompleteSetupPage {
  readonly page: Page
  readonly emailInput: Locator
  readonly userCodeInput: Locator
  readonly passwordInput: Locator
  readonly submitButton: Locator
  readonly userCodeError: Locator
  readonly passwordError: Locator
  readonly showPasswordButton: Locator

  constructor(page: Page) {
    this.page = page
    this.emailInput = page.locator("#setup-email")
    this.userCodeInput = page.locator("#setup-user-code")
    this.passwordInput = page.locator("#setup-password")
    this.submitButton = page.getByRole("button", { name: /^continue$/i })
    this.userCodeError = page.locator("#setup-user-code-error")
    this.passwordError = page.locator("#setup-password-error")
    this.showPasswordButton = page.getByRole("button", { name: /show password/i })
  }

  async goto(token: string) {
    await this.page.goto(`/register/complete?token=${encodeURIComponent(token)}`)
  }

  async waitForForm() {
    await this.submitButton.waitFor({ state: "visible" })
  }

  async fillUserCode(value: string) {
    await this.userCodeInput.fill(value)
  }

  async fillPassword(value: string) {
    await this.passwordInput.fill(value)
  }

  async blurUserCode() {
    await this.userCodeInput.blur()
  }

  async blurPassword() {
    await this.passwordInput.blur()
  }

  async submit() {
    await this.submitButton.click()
  }

  async complete(userCode: string, password: string) {
    await this.fillUserCode(userCode)
    await this.fillPassword(password)
    await this.submit()
  }

  async expectUserCodeError(message: string) {
    await expect(this.userCodeError).toBeVisible()
    await expect(this.userCodeError).toContainText(message)
  }

  async expectPasswordError(message: string) {
    await expect(this.passwordError).toBeVisible()
    await expect(this.passwordError).toContainText(message)
  }

  async expectTokenError(message: string) {
    const alert = this.page.locator('[role="alert"]').filter({ hasText: message })
    await expect(alert).toBeVisible()
  }

  async expectFormError(message: string) {
    const alert = this.page.locator('[role="alert"]').filter({ hasText: message })
    await expect(alert).toBeVisible()
  }

  async expectPasswordVisible() {
    await expect(this.passwordInput).toHaveAttribute("type", "text")
  }

  async expectPasswordHidden() {
    await expect(this.passwordInput).toHaveAttribute("type", "password")
  }
}
