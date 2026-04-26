import { expect, test } from "@playwright/test";

test("profile shows identity, collections, sale trade, and activity tabs", async ({
  page,
}) => {
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "Kyle K" })).toBeVisible();
  await expect(page.getByText("@subnichefounder")).toBeVisible();
  await expect(page.getByText("Trust context")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Collections" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Studio Workhorses")).toBeVisible();
  await expect(page.getByText("Dream Guitars")).toBeVisible();

  await page.getByRole("tab", { name: "For Sale / Trade" }).click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeVisible();
  await expect(page.getByText("Mesa Boogie Dual Rectifier").first()).toBeVisible();

  await page.getByRole("tab", { name: "Looking For" }).click();
  await expect(page.getByText("Vintage Fender combos")).toBeVisible();

  await page.getByRole("tab", { name: "Activity" }).click();
  await expect(page.getByText("Trade criteria updated")).toBeVisible();
});

test("collections page shows image-led collection cards and item tab", async ({
  page,
}) => {
  await page.goto("/collections");

  await expect(page.getByRole("heading", { name: "Collections" })).toBeVisible();
  await expect(page.getByText("Studio Workhorses")).toBeVisible();
  await expect(page.getByText("$64,500")).toBeVisible();

  await page.getByRole("tab", { name: "Items" }).click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeVisible();
  await expect(page.getByText("Mesa Boogie Dual Rectifier").first()).toBeVisible();
});
