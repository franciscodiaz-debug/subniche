import { expect, test } from "@playwright/test";

test("seller defaults settings page shows editable default sections", async ({ page }) => {
  await page.goto("/settings/seller-defaults");

  await expect(
    page.getByRole("heading", { name: "Seller defaults" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Payment methods" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Logistics" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Return policy" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Listing form preview" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save defaults" }).click();
  await expect(page.getByRole("dialog", { name: "Defaults saved" })).toBeVisible();
  await page.getByRole("button", { name: "Close dialog" }).click();

  await page.getByRole("button", { name: "Reset changes" }).click();
  await expect(page.getByRole("dialog", { name: "Reset changes" })).toBeVisible();
});
