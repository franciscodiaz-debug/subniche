import { expect, test } from "@playwright/test";

test("home cards expose their secondary affordances on hover", async ({ page }) => {
  await page.goto("/");

  const actionCard = page.getByRole("link", {
    name: /Julian offered a Twin Reverb/,
  });
  const actionAffordance = actionCard
    .locator("div")
    .filter({ hasText: "Go to offer" })
    .last();

  await expect(actionAffordance).toHaveCSS("opacity", "0");
  await actionCard.hover();
  await expect(actionAffordance).toHaveCSS("opacity", "1");
});

test("onboarding preview controls and sticky CTA keep v0 affordances", async ({
  page,
}) => {
  await page.goto("/");

  const previewButton = page.getByRole("button", {
    name: "Preview Set 3 trade interests video (0:14)",
  });
  const previewBorderBefore = await previewButton.evaluate(
    (element) => window.getComputedStyle(element).borderColor,
  );
  await previewButton.hover();
  await expect
    .poll(() =>
      previewButton.evaluate(
        (element) => window.getComputedStyle(element).borderColor,
      ),
    )
    .not.toBe(previewBorderBefore);
  await previewButton.click();
  await expect(page.getByTestId("home-onboarding-video-preview")).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 1600));
  const stickyCta = page
    .getByTestId("home-onboarding-sticky")
    .getByRole("link", { name: "Add your first item" });
  await expect(stickyCta).toBeVisible();
  await expect(stickyCta).toHaveClass(/bg-primary/);
  await expect(stickyCta).toHaveCSS("color", "rgb(7, 17, 31)");
});

test("listing cards reveal save action and emphasize title on hover", async ({
  page,
}) => {
  await page.goto("/market");

  const listingCard = page
    .getByTestId("listing-card")
    .filter({ hasText: "Gibson Les Paul Standard '50s" });
  const saveButton = listingCard.getByRole("button", { name: "Save listing" });
  const title = listingCard.getByRole("heading", {
    name: "Gibson Les Paul Standard '50s",
  });
  const titleColorBeforeHover = await title.evaluate(
    (element) => window.getComputedStyle(element).color,
  );

  await expect(saveButton).toHaveCSS("opacity", "0");
  await listingCard.hover();
  await expect(saveButton).toHaveCSS("opacity", "1");
  await expect
    .poll(() => title.evaluate((element) => window.getComputedStyle(element).color))
    .not.toBe(titleColorBeforeHover);
});

test("market controls keep compact tab scale and close menus predictably", async ({
  page,
}) => {
  await page.goto("/market");

  const marketplaceMode = page.getByLabel("Marketplace mode");
  const forSaleTab = marketplaceMode.getByRole("link", { name: "For Sale" });
  await expect(forSaleTab).toHaveCSS("font-size", "16px");

  const tradeTab = marketplaceMode.getByRole("link", { name: "Trade" });
  const tradeBorderColor = await tradeTab.evaluate(
    (element) => window.getComputedStyle(element).borderBottomColor,
  );
  await tradeTab.hover();
  await expect
    .poll(() =>
      tradeTab.evaluate(
        (element) => window.getComputedStyle(element).borderBottomColor,
      ),
    )
    .not.toBe(tradeBorderColor);

  await page.getByRole("button", { name: "Grid density" }).click();
  await expect(page.getByRole("menuitem", { name: "6x Full Nerd" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menuitem", { name: "6x Full Nerd" })).toBeHidden();

  await page.getByRole("button", { name: "Grid density" }).click();
  await expect(page.getByRole("menuitem", { name: "6x Full Nerd" })).toBeVisible();
  await page.getByRole("heading", { name: "Market" }).click();
  await expect(page.getByRole("menuitem", { name: "6x Full Nerd" })).toBeHidden();
});
