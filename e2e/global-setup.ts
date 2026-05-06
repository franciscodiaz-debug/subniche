import { chromium } from "@playwright/test"

async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()

  try {
    await page.goto(process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000", {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    })
  } finally {
    await browser.close()
  }
}

export default globalSetup
