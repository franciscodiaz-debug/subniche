import { expect, test } from "@playwright/test";

test("favorites page shows followed feed and saved surfaces", async ({ page }) => {
  await page.goto("/favorites");

  await expect(page.getByRole("heading", { name: "Following" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Updates" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Matches \"PRS under $4k\"")).toBeVisible();
  await page.getByRole("button", { name: "All Activity" }).click();
  await page.getByRole("menuitem", { name: "Price Drops" }).click();
  await expect(page.getByText("2 updates")).toBeVisible();

  await page.getByRole("tab", { name: "Items" }).click();
  await expect(page.getByText("Fender American Pro II Stratocaster")).toBeVisible();
  await page.getByRole("button", { name: "Date Added: Newest" }).click();
  await page.getByRole("menuitem", { name: "Price: High to Low" }).click();
  await expect(page.getByRole("button", { name: "Price: High to Low" })).toBeVisible();

  await page.getByRole("tab", { name: "Collections" }).click();
  await expect(page.getByText("Studio Workhorses")).toBeVisible();
  await page.getByRole("button", { name: "Unfollow collection" }).first().click();
  await expect(
    page.locator('button[aria-label="Follow collection"][aria-pressed="false"]'),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Users" }).click();
  await expect(page.getByText("Mara Voss")).toBeVisible();

  await page.getByRole("tab", { name: "Searches" }).click();
  await expect(page.getByText("\"vintage Fender amp\"")).toBeVisible();
  await page.getByRole("button", { name: "Search settings" }).first().click();
  await page.getByRole("menuitem", { name: "Pause alerts" }).click();
  await expect(page.getByText("Alerts paused").first()).toBeVisible();
});
