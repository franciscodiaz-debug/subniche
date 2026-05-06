import { test as base, type Page } from "@playwright/test"
import { loginViaApi } from "../helpers/api"

const TEST_USER = {
  email: process.env.E2E_TEST_EMAIL ?? "e2e@subniche.test",
  password: process.env.E2E_TEST_PASSWORD ?? "Test1234!",
}

async function injectAuthToken(page: Page, token: string) {
  await page.addInitScript((t: string) => {
    localStorage.setItem("auth_token", t)
  }, token)
}

export const test = base.extend<{ authedPage: Page }>({
  authedPage: async ({ page }, use) => {
    const token = await loginViaApi(TEST_USER.email, TEST_USER.password)
    await injectAuthToken(page, token)
    await use(page)
  },
})

export { expect } from "@playwright/test"
export { TEST_USER }
