import { expect, test } from "@playwright/test";

test("legacy collection route redirects to the canonical collections route", async ({
  page,
}) => {
  await page.goto("/collection/collection-studio-workhorses");

  await expect(page).toHaveURL(/\/collections\/collection-studio-workhorses$/);
  await expect(
    page.getByRole("heading", { name: "Studio Workhorses" }),
  ).toBeVisible();
});

test("collection detail page shows collection context and items", async ({ page }) => {
  await page.goto("/collections/collection-studio-workhorses");

  await expect(
    page.getByRole("heading", { name: "Studio Workhorses" }),
  ).toBeVisible();
  await expect(page.getByText("My Collections")).toBeVisible();
  await expect(page.locator('main a[href="/add-item"]').last()).toBeVisible();
  await page.getByRole("button", { name: "Share collection" }).click();
  await expect(
    page.getByRole("button", { name: "Collection link copied" }),
  ).toBeVisible();
  await expect(page.getByText("collection items")).toBeVisible();
  await expect(page.getByText("Collection notes")).toBeVisible();
  await expect(
    page.getByText("Fender American Pro II Stratocaster"),
  ).toBeVisible();
  const firstCollectionCard = page.getByTestId("collection-item-card").first();
  await expect(firstCollectionCard).toBeVisible();
  const firstCollectionCardBox = await firstCollectionCard.boundingBox();
  expect(firstCollectionCardBox).not.toBeNull();
  expect(firstCollectionCardBox!.width).toBeLessThan(290);

  await page
    .getByRole("button", { name: /collection items/ })
    .click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster"),
  ).toBeHidden();
  await page
    .getByRole("button", { name: /collection items/ })
    .click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster"),
  ).toBeVisible();

  await page.getByRole("button", { name: /wishlist items/ }).click();
  await expect(page.getByText("Rickenbacker 360 Fireglo")).toBeVisible();

  await page.getByRole("button", { name: "Collection notes" }).click();
  await expect(
    page.getByText("Working pieces that are already proven"),
  ).toBeHidden();
});

test("mobile collection detail keeps cards compact and sections tappable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/collections/collection-studio-workhorses");

  await expect(
    page.getByRole("heading", { name: "Studio Workhorses" }),
  ).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    )
    .toBe(true);

  const firstCollectionCard = page.getByTestId("collection-item-card").first();
  await expect(firstCollectionCard).toBeVisible();
  const firstCollectionCardBox = await firstCollectionCard.boundingBox();

  expect(firstCollectionCardBox).not.toBeNull();
  expect(firstCollectionCardBox!.width).toBeLessThan(220);

  await page.getByRole("button", { name: /collection items/ }).click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster"),
  ).toBeHidden();
  await page.getByRole("button", { name: /collection items/ }).click();
  await expect(firstCollectionCard).toBeVisible();

  await page.getByRole("button", { name: /wishlist items/ }).click();
  await expect(page.getByText("Rickenbacker 360 Fireglo")).toBeVisible();
});
