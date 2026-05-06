import { test as setup } from "@playwright/test"
import { loginViaApi } from "./helpers/api"
import * as fs from "fs"
import * as path from "path"

const authFile = "e2e/.auth/user.json"

setup("authenticate test user", async ({ page }) => {
  const email = process.env.E2E_TEST_EMAIL ?? "e2e@subniche.test"
  const password = process.env.E2E_TEST_PASSWORD ?? "Test1234!"

  const token = await loginViaApi(email, password)

  await page.goto("/")
  await page.evaluate((t: string) => localStorage.setItem("auth_token", t), token)

  const dir = path.dirname(authFile)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

  await page.context().storageState({ path: authFile })
})
