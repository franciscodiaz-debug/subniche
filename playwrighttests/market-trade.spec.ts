import { expect, test } from "@playwright/test";

test("market page matches the compact v0 marketplace workflow", async ({
  page,
}) => {
  await page.goto("/market");

  const marketplaceMode = page.getByLabel("Marketplace mode");

  await expect(page.getByRole("heading", { name: "Market" })).toBeVisible();
  await expect(
    marketplaceMode.getByRole("link", { name: "For Sale" }),
  ).toBeVisible();
  await expect(
    marketplaceMode.getByRole("link", { name: "Trade" }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Item" })).toBeVisible();
  await expect(page.getByText(/\d+ listings/)).toBeVisible();

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByLabel("Category").selectOption("electric-guitars");
  await page.getByRole("button", { name: "Close sheet" }).click();

  await expect(page.getByText("Electric Guitars")).toBeVisible();
  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeVisible();
});

test("trade page supports v0-style trade target browsing", async ({ page }) => {
  await page.goto("/trade");

  const marketplaceMode = page.getByLabel("Marketplace mode");

  await expect(page.getByRole("heading", { name: "Market" })).toBeVisible();
  await expect(
    marketplaceMode.getByRole("link", { name: "Trade" }),
  ).toHaveClass(/border-accent/);
  await expect(page.getByLabel("Trade target")).toBeVisible();
  await expect(
    page.locator("span").filter({ hasText: /^\d+ matches$/ }).first(),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "For Trade" })).toBeVisible();

  await page
    .getByLabel("Trade target")
    .selectOption("trade-inbound-interest-1");

  await expect(
    page.locator("h3").filter({ hasText: "Fender American Pro II Stratocaster" }),
  ).toBeVisible();
  await expect(
    page.locator("h3").filter({ hasText: "PRS Custom 24 10-Top" }),
  ).toBeVisible();
});
