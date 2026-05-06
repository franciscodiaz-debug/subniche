import { expect, type Page, test } from "@playwright/test";

const runReference = process.env.RUN_PROTOTYPE_REFERENCE === "1";
const createListingReferenceUrl =
  "https://v0-rebuild-k45azn1hm-darwoft-subniche.vercel.app/create-listing";

test.skip(!runReference, "Prototype reference tests require authenticated/unprotected v0 preview URLs.");

async function dismissTourIfPresent(page: Page) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const dialog = page.locator('[role="dialog"]');
    if (!(await dialog.count())) {
      return;
    }
    await page.getByRole("button", { name: "Skip tour" }).first().click({ force: true, timeout: 1000 }).catch(async () => {
      await page.keyboard.press("Escape");
    });
    await dialog.first().waitFor({ state: "detached", timeout: 1500 }).catch(() => undefined);
  }
  await page.locator('[role="dialog"]').evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
}

async function openCreateListingReference(page: Page) {
  await page.goto(createListingReferenceUrl);
  await dismissTourIfPresent(page);
  await expect(page.getByRole("heading", { name: "Add Item" })).toBeVisible();
}

test.describe("v0 prototype references", () => {
  test("home variants expose feed, logged-out, and onboarding reference states", async ({ page }) => {
    await page.goto("https://v0-rebuild-g0oaplonk-darwoft-subniche.vercel.app/");
    await expect(page.getByRole("heading", { name: "Where musicians trade, sell, and collect." })).toBeVisible();
    await expect(page.getByText("Action Required")).toBeVisible();
    await expect(page.getByText("Most Recent Trade Matches")).toBeVisible();

    await page.goto("https://v0-rebuild-oewmlc1s5-darwoft-subniche.vercel.app/");
    await expect(page.getByRole("link", { name: "Join free" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Why SN / MusicGear?" })).toBeVisible();

    await page.goto("https://v0-rebuild-hphf7dpyj-darwoft-subniche.vercel.app/");
    await expect(page.getByRole("heading", { name: /Welcome to/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /List 3 items 1\/3/ })).toBeVisible();
    await page.getByRole("button", { name: "Preview: List 3 items", exact: true }).click();
    await expect(page.getByRole("button", { name: "Preview: List 3 items", exact: true })).toBeVisible();
  });

  test("add item exposes additive statuses and conditional fields", async ({ page }) => {
    await openCreateListingReference(page);

    await page.getByRole("button", { name: "For Sale" }).click();
    await expect(page.getByText("Payment")).toBeVisible();
    await expect(page.getByText("Logistics")).toBeVisible();
    await expect(page.getByText("Return Policy")).toBeVisible();
    await expect(page.getByText("Publish To")).toBeVisible();

    await page.getByRole("button", { name: "For Sale" }).click();
    await page.getByRole("button", { name: "For Trade" }).click();
    await expect(page.getByText(/you'll set interests in the next step/)).toBeVisible();
    await expect(page.getByText("Payment")).toBeVisible();
    await expect(page.getByText("Logistics")).toBeVisible();
    await expect(page.getByText("Return Policy")).toBeVisible();
    await expect(page.getByText("Publish To")).toBeVisible();

    await page.getByRole("button", { name: "For Sale" }).click();
    await page.getByRole("button", { name: "In Collection" }).click();
    await expect(page.getByText("Add to Collection")).toBeVisible();
    await expect(page.getByText("Receipt / Proof of Purchase")).toBeVisible();

    await page.getByRole("button", { name: "Specifications" }).click();
    await page.getByPlaceholder("Enter item title").fill("1965 Fender Jaguar");
    await expect(page.getByPlaceholder("Enter item title")).toHaveValue("1965 Fender Jaguar");

    await openCreateListingReference(page);
    await page.getByRole("button", { name: "Wishlist" }).click();
    await expect(page.getByRole("button", { name: "Add to Wishlist" })).toBeVisible();
    await expect(page.getByText("Add via URL")).toBeVisible();
    await expect(page.getByText("Enter Manually")).toBeVisible();

    await page.getByRole("button", { name: "Add via URL" }).click();
    await expect(page.getByText("Paste a link to your wishlist item")).toBeVisible();
    await expect(page.getByRole("button", { name: "Process" })).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();

    await page.getByRole("button", { name: "Enter Manually" }).click();
    await expect(page.getByText("Wishlist Details")).toBeVisible();
    await expect(page.getByText("Source URL")).toBeVisible();
    await expect(page.getByText("Target Price")).toBeVisible();
    await expect(page.getByText("Visibility")).toBeVisible();
    await expect(page.getByText("Back to top to add to wishlist")).toBeVisible();
  });

  test("market filters and trade selector expose the observed reference states", async ({ page }) => {
    await page.goto("https://v0-rebuild-987hxcadp-darwoft-subniche.vercel.app/");

    await expect(page.getByRole("heading", { name: "Market" })).toBeVisible();
    await dismissTourIfPresent(page);
    await page.getByRole("button", { name: "Filters", exact: true }).click();
    await dismissTourIfPresent(page);
    await page.getByRole("button", { name: "Electric Guitars 1,248" }).click();
    await dismissTourIfPresent(page);

    await expect(page.getByRole("button", { name: "Electric Guitars", exact: true })).toBeVisible();
    await expect(page.getByText("Solid Body")).toBeVisible();
    await expect(page.getByText("Brands")).toBeVisible();

    await page.getByRole("tab", { name: "Trade" }).click();
    await expect(page).toHaveURL(/\/trade/);
    await page.getByRole("button", { name: "All items" }).click();

    await expect(page.getByRole("button", { name: /Fender American Pro II.*5 matches.*1 perfect/ })).toBeVisible();
  });

  test("listing detail exposes offer modal, gallery, groups, and watch state", async ({ page }) => {
    await page.goto("https://v0-rebuild-l86r4kq92-darwoft-subniche.vercel.app/listings/tele-butterscotch-2022");

    await expect(page.getByRole("heading", { name: "Fender American Vintage II 1951 Telecaster" })).toBeVisible();
    await page.getByRole("button", { name: "Make Offer" }).click();
    await expect(page.getByRole("heading", { name: "Make an Offer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Offer" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();

    await page.getByRole("button", { name: "Next photo" }).click();
    await expect(page.getByRole("button", { name: "View photo 2" })).toHaveAttribute("aria-pressed", "true");

    await page.getByRole("button", { name: /Posted in 2 groups/ }).click();
    await expect(page.getByText("Vintage Fender Club").first()).toBeVisible();
    await expect(page.getByText("NYC Guitar Swap").first()).toBeVisible();

    await page.getByRole("button", { name: "Watch listing" }).click();
    await expect(page.getByRole("button", { name: "Stop watching listing" })).toBeVisible();
  });

  test("inbox offer thread opens counter modal without submitting", async ({ page }) => {
    await page.goto("https://v0-rebuild-tbcoy6gim-darwoft-subniche.vercel.app/inbox");

    await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();
    await page.getByRole("button", { name: /1965 Fender Stratocaster/ }).click();
    await expect(page).toHaveURL(/id=conv-1/);
    await expect(page.getByText("They offer:")).toBeVisible();
    await expect(page.getByText("For your:")).toBeVisible();

    await page.getByRole("button", { name: "Counter" }).click();
    await expect(page.getByRole("heading", { name: "Counter Offer" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Send Counter" })).toBeVisible();
    await page.getByRole("button", { name: "Cancel" }).click();
  });

  test("profile and my stuff expose owner profile and inventory-management states", async ({ page }) => {
    await page.goto("https://v0-rebuild-bt43es47h-darwoft-subniche.vercel.app/profile");
    await expect(page.getByRole("heading", { name: "guitar_collector" })).toBeVisible();
    await page.getByRole("button", { name: "For Sale/Trade" }).click();
    await expect(page.getByText("1962 Fender Stratocaster")).toBeVisible();
    await page.getByRole("button", { name: "Looking For" }).click();
    await expect(page.getByRole("button", { name: "Vintage British Tube Amps" })).toBeVisible();
    await page.getByRole("button", { name: "Activity" }).click();
    await expect(page.getByText("Listed 1962 Fender Stratocaster for sale")).toBeVisible();

    await page.goto("https://v0-rebuild-kecmxlvum-darwoft-subniche.vercel.app/my-stuff");
    await expect(page.getByRole("heading", { name: "My Stuff" })).toBeVisible();
    await page.getByRole("button", { name: "All Items" }).click();
    await expect(page.getByText("My Guitars").first()).toBeVisible();
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "For Sale" }).click();
    await expect(page.getByText("For Sale", { exact: true })).toBeVisible();
    await page.getByRole("tab", { name: "Collections" }).click();
    await expect(page.getByText("Dream Guitars")).toBeVisible();
  });
});
