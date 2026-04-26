import { expect, test } from "@playwright/test";

test("home page shows authenticated feed sections", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Where musicians trade, sell, and collect/ }),
  ).toBeVisible();
  await expect(page.getByText("Action Required")).toBeVisible();
  await expect(page.getByText("Most Recent Trade Matches")).toBeVisible();
  await expect(page.getByText("From Saved Searches")).toBeVisible();
  await expect(
    page.getByText("From Collections and People You Follow"),
  ).toBeVisible();
  await expect(page.getByText("Most Recent From Your Communities")).toBeVisible();
  await expect(page.getByText("You are all caught up")).toBeVisible();
  await expect(page.getByText("Trending Listings")).toBeVisible();
  await expect(page.getByText("Just Listed")).toBeVisible();
});
