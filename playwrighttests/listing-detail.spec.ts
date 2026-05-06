import { expect, test } from "@playwright/test";

test("listing detail shows v0-style product detail sections", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1100 });
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
  const galleryBox = await page
    .locator("aside")
    .getByTestId("listing-image-gallery")
    .boundingBox();
  expect(galleryBox).not.toBeNull();
  expect(galleryBox!.width).toBeGreaterThan(680);
  await expect(page.getByRole("button", { name: "Report listing" })).toBeVisible();
  await expect(page.getByText("Seller").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Message" }).first()).toHaveAttribute(
    "href",
    "/inbox",
  );
  await expect(page.getByRole("heading", { name: "Description" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Trade interests" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Similar gear" })).toBeVisible();

  await page.getByRole("button", { name: "Make Offer" }).click();
  await expect(page.getByRole("dialog", { name: "Make an Offer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send Offer" })).toBeDisabled();
  await page.getByLabel("Offer amount").fill("1700");
  await expect(page.getByRole("button", { name: "Send Offer" })).toBeEnabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Make an Offer" }),
  ).toBeHidden();

  await page.getByRole("button", { name: "Next photo" }).click();
  await expect(page.getByRole("button", { name: "View photo 2" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("button", { name: /Posted in/ }).click();
  await expect(page.getByText("Vintage Amp Circle").first()).toBeVisible();

  await page.getByRole("button", { name: /Watch listing/ }).click();
  await expect(
    page.getByRole("button", { name: /Stop watching listing/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Share listing" }).click();
  await expect(page.getByRole("button", { name: "Listing link copied" })).toBeVisible();
  await expect(page.getByText("Link copied.")).toBeVisible();
});

test("mobile listing detail keeps offer and message actions reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/listings/listing-strat-pro-ii");

  const actionBar = page.getByTestId("mobile-listing-action-bar");
  await expect(actionBar).toBeVisible();
  await expect(actionBar.getByRole("button", { name: "Offer" })).toBeVisible();
  await expect(actionBar.getByRole("link", { name: "Message" })).toHaveAttribute(
    "href",
    "/inbox",
  );

  const mobileNav = page.getByRole("navigation", { name: "Mobile navigation" });
  const mobileGallery = page
    .locator("main")
    .getByTestId("listing-image-gallery")
    .filter({ visible: true });
  const actionBarBox = await actionBar.boundingBox();
  const mobileNavBox = await mobileNav.boundingBox();
  const mobileGalleryBox = await mobileGallery.boundingBox();
  expect(actionBarBox).not.toBeNull();
  expect(mobileNavBox).not.toBeNull();
  expect(mobileGalleryBox).not.toBeNull();
  expect(mobileGalleryBox!.y).toBeLessThan(actionBarBox!.y);
  expect(actionBarBox!.y + actionBarBox!.height).toBeLessThanOrEqual(
    mobileNavBox!.y + 1,
  );

  await actionBar.getByRole("button", { name: "Offer" }).click();
  await expect(page.getByRole("dialog", { name: "Make an Offer" })).toBeVisible();
  await page.getByLabel("Offer amount").fill("1650");
  await expect(page.getByRole("button", { name: "Send Offer" })).toBeEnabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Make an Offer" }),
  ).toBeHidden();
});
