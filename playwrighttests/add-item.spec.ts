import { expect, type Page, test } from "@playwright/test";
import path from "node:path";

async function dismissAddItemTour(page: Page) {
  const tour = page.getByRole("dialog", { name: "Add item tour" });

  if (await tour.isVisible().catch(() => false)) {
    await tour.getByRole("button", { name: "Skip tour" }).click();
  }
}

test("create-listing tour spotlights status, profile, and AI assist", async ({
  page,
}) => {
  await page.goto("/create-listing");

  const tour = page.getByRole("dialog", { name: "Add item tour" });
  await expect(tour.getByRole("heading", { name: "Item Status" })).toBeVisible();
  await tour.getByRole("button", { name: "Next" }).click();
  await expect(tour.getByRole("heading", { name: "Your Profile" })).toBeVisible();
  await tour.getByRole("button", { name: "Next" }).click();
  await expect(tour.getByRole("heading", { name: "AI Assist" })).toBeVisible();
  await expect(tour.getByText("Title + Subtitle")).toBeVisible();
  await expect(tour.getByText("At least one photo", { exact: true })).toBeVisible();
  await tour.getByRole("button", { name: "Get started" }).click();
  await expect(tour).toBeHidden();
  await page.reload();
  await expect(tour).toBeHidden();
});

test("create-listing route opens the same media upload flow", async ({ page }) => {
  await page.goto("/create-listing");
  await dismissAddItemTour(page);

  await expect(page.getByRole("heading", { name: "Add Item" })).toBeVisible();
  await page.getByRole("button", { name: "Save Draft" }).click();
  await expect(page.getByText("Draft saved")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Photos" })).toBeVisible();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add Photos" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    path.join(
      process.cwd(),
      "public/mock/listings/fender-stratocaster-sunburst.jpg",
    ),
  );
  await expect(
    page.getByRole("img", {
      name: /Selected photo: fender-stratocaster-sunburst\.jpg/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add more photos" })).toBeVisible();
});

test("add-item primary action validates required fields and shows completion", async ({
  page,
}) => {
  await page.goto("/add-item");
  await dismissAddItemTour(page);

  await page.getByRole("button", { name: "Add Item", exact: true }).click();
  const missingAlert = page
    .getByRole("alert")
    .filter({ hasText: "A few details are still needed" });
  await expect(
    page.getByText("A few details are still needed"),
  ).toBeVisible();
  await expect(missingAlert.getByText("Title", { exact: true })).toBeVisible();
  await expect(missingAlert.getByText("At least one photo")).toBeVisible();

  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Private Bench Test Guitar");
  await page
    .getByRole("textbox", { name: "Subtitle" })
    .fill("Draft inventory item");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add Photos" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    path.join(
      process.cwd(),
      "public/mock/listings/fender-stratocaster-sunburst.jpg",
    ),
  );

  await page.getByRole("button", { name: "Add Item", exact: true }).click();
  await expect(page.getByText("Private item added")).toBeVisible();
  await expect(page.getByText("View in My Stuff")).toBeVisible();
});

test("wishlist primary action shows wishlist completion state", async ({
  page,
}) => {
  await page.goto("/add-item");
  await dismissAddItemTour(page);

  await page.getByRole("button", { name: "Wishlist", exact: true }).click();
  await page.getByRole("button", { name: "Enter Manually" }).click();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Wanted Jazzmaster");
  await page
    .getByRole("textbox", { name: "Subtitle" })
    .fill("Looking for a clean player");
  await page.getByLabel("Target price").fill("2200");
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add Photos" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    path.join(
      process.cwd(),
      "public/mock/listings/fender-stratocaster-sunburst.jpg",
    ),
  );

  await page
    .getByRole("button", { name: "Add to Wishlist", exact: true })
    .click();
  await expect(page.getByText("Wishlist item added")).toBeVisible();
  await expect(
    page.getByText("This wanted item is now visible from your public wishlist."),
  ).toBeVisible();
});

test("add-item flow supports additive owned statuses and separate wishlist mode", async ({
  page,
}) => {
  await page.goto("/add-item");
  await dismissAddItemTour(page);

  await expect(
    page.getByRole("heading", {
      name: "Add Item",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /In Collection/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByText("Category")).toBeVisible();
  await expect(page.getByRole("button", { name: "Guitars" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Drums" })).toBeVisible();
  await page.getByRole("button", { name: "Guitars" }).click();
  await expect(page.getByRole("button", { name: "Guitars" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Drums" })).toBeHidden();
  await expect(page.getByRole("button", { name: "Electric" })).toBeVisible();
  await page.getByRole("button", { name: "Electric" }).click();
  await expect(page.getByRole("button", { name: "Electric" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Acoustic" })).toBeHidden();
  await page.getByRole("button", { name: "Electric" }).click();
  await expect(page.getByRole("button", { name: "Guitars" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Guitars" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Electric" })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByRole("button", { name: "Acoustic" })).toBeVisible();
  await page.getByRole("button", { name: "Guitars" }).click();
  await expect(page.getByRole("button", { name: "Drums" })).toBeVisible();
  await page.getByRole("button", { name: "Audio Equipment" }).click();
  await expect(page.getByRole("button", { name: "Microphones" })).toBeVisible();
  await page.getByRole("button", { name: "Microphones" }).click();
  await expect(
    page.getByRole("button", { name: "Microphones" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "Pedals" })).toBeHidden();
  await page.getByRole("button", { name: "Microphones" }).click();
  await expect(
    page.getByRole("button", { name: "Audio Equipment" }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("button", { name: "Microphones" }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(page.getByRole("button", { name: "Pedals" })).toBeVisible();
  await page.getByRole("button", { name: "Microphones" }).click();
  await page.getByRole("button", { name: "Audio Equipment" }).click();
  await expect(page.getByRole("button", { name: "Accessories" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Photos" })).toBeVisible();
  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Add Photos" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(
    path.join(
      process.cwd(),
      "public/mock/listings/fender-stratocaster-sunburst.jpg",
    ),
  );
  await expect(
    page.getByRole("img", {
      name: /Selected photo: fender-stratocaster-sunburst\.jpg/,
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /View photo 1/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: "Add more photos" })).toBeVisible();
  await expect(page.getByLabel("Description")).toBeVisible();
  await expect(page.getByText("Your Profile")).toBeVisible();
  await expect(page.getByText("75%")).toBeVisible();
  await expect(page.getByRole("button", { name: "Specifications" })).toBeVisible();

  await page.getByRole("textbox", { name: "Title", exact: true }).fill("Test American Pro II Strat");
  await page.getByRole("textbox", { name: "Subtitle" }).fill("Sunburst, 2022, near mint");
  await page.getByLabel("Description").fill("A test item with the same field structure as the reference flow.");
  await expect(page.getByLabel("Asking price")).toBeHidden();

  await page.getByRole("button", { name: /For Sale/ }).click();
  await expect(page.getByText("For Sale fields added")).toBeVisible();
  await expect(page.getByLabel("Asking price")).toBeVisible();
  await page.getByLabel("Asking price").fill("1749");
  await expect(page.getByText("For Sale fields added")).toBeHidden({
    timeout: 4000,
  });
  await expect(page.getByText("Payment")).toBeVisible();
  await expect(page.getByText("Logistics")).toBeVisible();
  await expect(page.getByLabel("Return Policy")).toBeVisible();
  await expect(page.getByText("General Niche")).toBeVisible();
  await expect(page.getByLabel("Condition", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Condition notes")).toBeVisible();
  await page.getByLabel("Condition", { exact: true }).selectOption("Excellent");
  await page
    .getByLabel("Condition notes")
    .fill("Light buckle rash on the back, original case included.");
  const descriptionBox = await page.getByLabel("Description").boundingBox();
  const conditionBox = await page
    .getByLabel("Condition", { exact: true })
    .boundingBox();
  expect(descriptionBox).not.toBeNull();
  expect(conditionBox).not.toBeNull();
  expect(conditionBox!.y).toBeGreaterThan(descriptionBox!.y);

  await page.getByRole("button", { name: /For Sale/ }).click();
  await expect(page.getByLabel("Asking price")).toBeHidden();
  await page.getByRole("button", { name: /For Trade/ }).click();
  await expect(page.getByLabel("Asking price")).toBeHidden();
  await expect(
    page
      .getByText("For Trade fields added - you'll set interests in the next step")
      .first(),
  ).toBeVisible();
  await expect(page.getByText("Payment")).toBeVisible();
  await expect(page.getByText("Logistics")).toBeVisible();
  await expect(page.getByLabel("Return Policy")).toBeVisible();
  await expect(page.getByText("General Niche")).toBeVisible();
  await expect(page.getByLabel("Condition notes")).toBeVisible();

  await page.getByRole("button", { name: /For Sale/ }).click();
  await expect(page.getByLabel("Asking price")).toBeVisible();
  await page.getByRole("button", { name: /In Collection/ }).click();
  await expect(page.getByText("Collection fields added")).toBeVisible();
  await expect(page.getByLabel("Add to Collection *")).toBeVisible();
  await expect(page.getByLabel("Item Notes")).toBeVisible();
  await expect(page.getByLabel("Date Acquired")).toBeVisible();
  await expect(page.getByLabel("Acquisition Price")).toBeVisible();
  await expect(page.getByText("Receipt / Proof of Purchase")).toBeVisible();

  await page.getByRole("button", { name: "Specifications" }).click();
  await page.getByLabel("Brand").fill("Fender");
  await page.getByLabel("Model").fill("American Pro II");
  await page.getByLabel("Year").fill("2022");

  await expect(page.getByRole("button", { name: /For Sale/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(page.getByRole("button", { name: /For Trade/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("button", { name: /In Collection/ }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: /For Sale/ }).click();
  await page.getByRole("button", { name: /For Trade/ }).click();
  await page.getByRole("button", { name: "Wishlist", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Wishlist", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: /For Sale/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(page.getByRole("button", { name: /For Trade/ })).toHaveAttribute(
    "aria-pressed",
    "false",
  );
  await expect(
    page.getByRole("button", { name: /In Collection/ }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Add to Wishlist", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Add via URL" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Enter Manually" }),
  ).toBeVisible();
  await expect(page.getByText("Category")).toBeHidden();

  await page.getByRole("button", { name: "Add via URL" }).click();
  await expect(
    page.getByRole("heading", { name: "Paste a link to your wishlist item" }),
  ).toBeVisible();
  await expect(page.getByLabel("Source URL")).toBeVisible();
  await expect(page.getByRole("button", { name: "Process" })).toBeVisible();
  await page.getByRole("button", { name: "Back" }).click();

  await page.getByRole("button", { name: "Enter Manually" }).click();
  await expect(page.getByText("Category")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Wishlist Details" }),
  ).toBeVisible();
  await expect(page.getByLabel("Source URL")).toBeVisible();
  await page.getByLabel("Target price").fill("2200");
  await expect(page.getByText("Visibility")).toBeVisible();
  await expect(page.getByRole("button", { name: "Public" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(
    page.getByRole("link", { name: /Back to top to add to wishlist/ }),
  ).toBeVisible();
});
