import { expect, test } from "@playwright/test";

test("favorites page shows followed feed and saved surfaces", async ({ page }) => {
  await page.goto("/favorites");

  await expect(page.getByRole("heading", { name: "Favorites" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Feed" })).toBeVisible();
  await expect(page.getByText("Saved search pulse")).toBeVisible();

  await page.getByRole("tab", { name: "Items" }).click();
  await expect(page.getByText("Fender American Pro II Stratocaster")).toBeVisible();

  await page.getByRole("tab", { name: "Collections" }).click();
  await expect(page.getByText("Studio Workhorses")).toBeVisible();

  await page.getByRole("tab", { name: "Users" }).click();
  await expect(page.getByText("Mara Voss")).toBeVisible();

  await page.getByRole("tab", { name: "Searches" }).click();
  await expect(page.getByText("vintage Fender amp")).toBeVisible();
});
