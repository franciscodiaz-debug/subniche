import { chromium } from "playwright"
import { mkdir } from "node:fs/promises"
import path from "node:path"

const BRANCH = "fixes-auth"
const OUT_DIR = path.resolve("reports/assets", BRANCH)

// Each capture: { path, name, captureBefore }
// captureBefore=false for screens that don't exist in main.
const CAPTURES = [
  { url: "/login", name: "login", captureBefore: true },
  { url: "/signup", name: "signup", captureBefore: true },
  { url: "/signup?niche=music-gear", name: "signup-with-niche", captureBefore: false },
  { url: "/n/music-gear", name: "n-music-gear", captureBefore: true },
  { url: "/find-niche", name: "find-niche", captureBefore: false },
  { url: "/verify", name: "verify-no-token", captureBefore: false },
]

const VIEWPORTS = [
  { device: "desktop", width: 1440, height: 900 },
  { device: "mobile", width: 390, height: 844 },
]

async function captureOne(browser, baseUrl, capture, viewport, suffix) {
  const ctx = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 2,
  })
  const page = await ctx.newPage()
  const fullUrl = `${baseUrl}${capture.url}`
  try {
    await page.goto(fullUrl, { waitUntil: "networkidle", timeout: 30000 })
    // Tiny delay for any post-mount animation to settle
    await page.waitForTimeout(400)
    const file = path.join(
      OUT_DIR,
      `${capture.name}-${viewport.device}-${suffix}.png`,
    )
    await page.screenshot({ path: file, fullPage: true })
    console.log(`  ✓ ${capture.url} [${viewport.device}/${suffix}] → ${file}`)
  } catch (err) {
    console.error(`  ✗ ${capture.url} [${viewport.device}/${suffix}]: ${err.message}`)
  } finally {
    await ctx.close()
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch()
  try {
    for (const capture of CAPTURES) {
      console.log(`\nCapturando ${capture.url}...`)
      for (const viewport of VIEWPORTS) {
        // After (current branch / 3000)
        await captureOne(browser, "http://localhost:3000", capture, viewport, "after")
        // Before (main / 3001) — only when the screen exists in main
        if (capture.captureBefore) {
          await captureOne(browser, "http://localhost:3001", capture, viewport, "before")
        }
      }
    }
  } finally {
    await browser.close()
  }
  console.log("\nDone.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
