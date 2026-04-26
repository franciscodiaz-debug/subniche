import { expect, test } from "@playwright/test";

test("collection detail page shows collection context and items", async ({ page }) => {
  await page.goto("/collections/collection-studio-workhorses");

  await expect(
    page.getByRole("heading", { name: "Studio Workhorses" }),
  ).toBeVisible();
  await expect(page.getByText("Collection snapshot")).toBeVisible();
  await expect(page.getByText("Collection notes")).toBeVisible();
  await expect(page.getByText("Collection items")).toBeVisible();
  await expect(
    page.getByText("Fender American Pro II Stratocaster"),
  ).toBeVisible();
});
