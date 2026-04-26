import { expect, test } from "@playwright/test";

test("listing detail shows v0-style product detail sections", async ({
  page,
}) => {
  await page.goto("/listings/listing-strat-pro-ii");

  await expect(
    page.getByRole("heading", { name: "Fender American Pro II Stratocaster" }),
  ).toBeVisible();
  await expect(page.locator("header").getByText("$1,749")).toBeVisible();
  await expect(
    page
      .locator('section[aria-label="Fender American Pro II Stratocaster images"]')
      .filter({ visible: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Listing intent" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Description" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trade interests" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Similar gear" })).toBeVisible();
});
