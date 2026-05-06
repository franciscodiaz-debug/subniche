import { expect, test } from "@playwright/test";

test("profile shows identity, collections, sale trade, and activity tabs", async ({
  page,
}) => {
  await page.goto("/profile");

  await expect(page.getByRole("heading", { name: "Kyle K" })).toBeVisible();
  await expect(page.getByText("@subnichefounder")).toBeVisible();
  await expect(page.getByText("Verified:")).toBeVisible();
  await expect(page.getByRole("tab", { name: "Collections" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByText("Studio Workhorses")).toBeVisible();
  await expect(page.getByText("Dream Guitars")).toBeVisible();

  await page.getByRole("tab", { name: "For Sale/Trade" }).click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeVisible();
  await expect(
    page.getByText("Gibson Les Paul Standard '50s").first(),
  ).toBeVisible();

  await page.getByRole("tab", { name: "Looking For" }).click();
  await expect(page.getByText("1 trade interests")).toBeVisible();
  await expect(page.getByText("6 wishlist items")).toBeVisible();
  await expect(page.getByText("Vintage Fender combos")).toBeVisible();
  await page.getByRole("button", { name: /Vintage Fender combos/ }).click();
  await expect(page.getByText("Category: Amplifiers")).toBeVisible();

  await page.getByRole("tab", { name: "Activity" }).click();
  await expect(
    page.getByText("Listed Fender American Pro II Stratocaster for sale"),
  ).toBeVisible();
  await expect(page.getByText("Completed trade with @vintagegearnyc")).toBeVisible();
});

test("collections page shows image-led collection cards and item tab", async ({
  page,
}) => {
  await page.goto("/my-stuff");

  await expect(page.getByRole("heading", { name: "My Stuff" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Items" })).toHaveAttribute(
    "aria-selected",
    "true",
  );

  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeVisible();
  await expect(page.getByText("Mesa Boogie Dual Rectifier").first()).toBeVisible();

  await page.getByRole("button", { name: "All Items" }).click();
  await expect(page.getByRole("menuitem", { name: "Wishlist" })).toBeVisible();
  await page.getByRole("menuitem", { name: "All Items" }).click();

  await page.getByLabel("Search items").fill("mesa");
  await expect(page.getByText("Mesa Boogie Dual Rectifier").first()).toBeVisible();
  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeHidden();
  await expect(page.getByText("1 item shown")).toBeVisible();
  await page.getByLabel("Search items").fill("");

  await page.getByRole("button", { name: "Newest" }).click();
  await page.getByRole("menuitem", { name: "Title" }).click();
  await expect(page.getByRole("button", { name: "Title" })).toBeVisible();

  await page.getByRole("button", { name: "For Sale" }).click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster").first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Studio Workhorses" }).first().click();
  await page.getByRole("menuitem", { name: "Remove from collection" }).click();
  await expect(page.getByRole("button", { name: "Uncategorized" })).toBeVisible();

  await page.getByRole("button", { name: "List view" }).click();
  await expect(page.getByRole("button", { name: "Grid view" })).toBeVisible();

  await page.getByRole("button", { name: "Item actions" }).first().click();
  await expect(page.getByRole("menuitem", { name: "Edit item" })).toBeVisible();

  await page.getByRole("tab", { name: "Collections" }).click();
  await expect(page.getByText("Studio Workhorses")).toBeVisible();
  await expect(page.getByText("$64,500")).toBeVisible();

  await page.getByLabel("Search your collections").fill("dream");
  await expect(page.getByText("Dream Guitars")).toBeVisible();
  await expect(page.getByText("Studio Workhorses")).toBeHidden();
  await page.getByLabel("Search your collections").fill("");

  await page.getByRole("button", { name: "List view" }).click();
  await expect(
    page.getByRole("link", { name: /Dream Guitars.*Link Only/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Grid view" }).click();

  await page.getByRole("button", { name: "New collection" }).click();
  await page.getByLabel("Name").fill("Studio Experiments");
  await page.getByLabel("Description").fill("Draft collection for comparison testing.");
  await page.getByRole("button", { name: "Create collection" }).click();
  await expect(page.getByText("Studio Experiments")).toBeVisible();
});

test("my stuff item actions update card state with feedback", async ({
  page,
}) => {
  await page.goto("/my-stuff");

  const originalCard = page.getByTestId("my-stuff-card-listing-strat-pro-ii");
  await expect(originalCard).toBeVisible();

  await page.getByRole("button", { name: "Grid density" }).click();
  await page.getByRole("menuitem", { name: /6x Full Nerd/ }).click();
  await expect(page.getByRole("button", { name: "Grid density" })).toHaveAttribute(
    "title",
    "6x Full Nerd",
  );

  await originalCard.hover();
  await originalCard.getByRole("button", { name: "Item actions" }).click();
  await page.getByRole("menuitem", { name: "Edit item" }).click();
  await expect(page.getByRole("heading", { name: "Edit item" })).toBeVisible();
  await page.getByLabel("Item price").fill("$1,699");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByText("Saved changes to Fender American Pro II Stratocaster."),
  ).toBeVisible();
  await expect(originalCard.getByText("$1,699")).toBeVisible();

  await originalCard.hover();
  await originalCard.getByRole("button", { name: "Item actions" }).click();
  await page.getByRole("menuitem", { name: "Mark sold" }).click();
  await expect(
    page.getByText("Marked Fender American Pro II Stratocaster as sold."),
  ).toBeVisible();

  await page.getByRole("button", { name: "For Sale" }).click();
  await expect(originalCard).toHaveCount(0);
  await page.getByRole("button", { name: "For Sale: Only" }).click();
  await expect(originalCard).toBeVisible();

  await originalCard.hover();
  await originalCard.getByRole("button", { name: "Item actions" }).click();
  await page.getByRole("menuitem", { name: "Duplicate item" }).click();
  await expect(
    page.getByText("Fender American Pro II Stratocaster (Copy)"),
  ).toBeVisible();

  await originalCard.hover();
  await originalCard.getByRole("button", { name: "Item actions" }).click();
  await page.getByRole("menuitem", { name: "Archive" }).click();
  await expect(
    page.getByText("Archived Fender American Pro II Stratocaster."),
  ).toBeVisible();
  await expect(originalCard).toHaveCount(0);

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(originalCard).toBeVisible();
  await expect(
    page.getByText("Restored Fender American Pro II Stratocaster."),
  ).toBeVisible();
});

test("mobile my stuff keeps item actions reachable without hover", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/my-stuff");

  const card = page.getByTestId("my-stuff-card-listing-strat-pro-ii");
  await expect(card).toBeVisible();
  const actionButton = card.getByRole("button", { name: "Item actions" });
  await expect(actionButton).toBeVisible();
  await expect(actionButton).toHaveCSS("opacity", "1");

  await actionButton.click();
  await expect(page.getByRole("menuitem", { name: "Edit item" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Edit item" }).click();
  await expect(page.getByRole("heading", { name: "Edit item" })).toBeVisible();
  await page.getByRole("button", { name: "Close edit item" }).click();

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);
});
