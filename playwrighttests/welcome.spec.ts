import { expect, test } from "@playwright/test";

test("welcome page presents the logged-out marketplace story", async ({ page }) => {
  await page.goto("/welcome");

  await expect(
    page.getByRole("heading", {
      name: /Where musicians trade, sell, and collect/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /Join free/ })).toBeVisible();
  await expect(page.getByText("Why SN / MusicGear?")).toBeVisible();
  await expect(page.getByText("Trending Listings")).toBeVisible();
  await expect(page.getByText("Just Listed")).toBeVisible();
  await expect(page.getByText("Featured Collections")).toBeVisible();
  await expect(page.getByText("Featured Users")).toBeVisible();
  await expect(page.getByText("Staff Picks")).toBeVisible();
});
