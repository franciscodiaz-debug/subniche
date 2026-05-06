import { expect, test } from "@playwright/test";

test("community detail page links threads, members, and listings", async ({ page }) => {
  await page.goto("/communities/vintage-amp-circle");

  await expect(
    page.getByRole("heading", { name: "Vintage Amp Circle" }),
  ).toBeVisible();
  await expect(page.getByText("Community threads")).toBeVisible();
  await expect(page.getByText("Community marketplace")).toBeVisible();
  await expect(page.getByRole("link", { name: "See all" })).toBeVisible();

  await page.getByRole("button", { name: "Share" }).click();
  await expect(page.getByRole("button", { name: "Link copied" })).toBeVisible();

  await page.getByRole("button", { name: /Join community|Request to join/ }).click();
  await expect(page.getByRole("button", { name: "Joined" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByRole("link", { name: /What makes a serviced Deluxe/ }).click();
  await expect(
    page.getByRole("heading", {
      name: "What makes a serviced Deluxe Reverb worth the premium?",
    }),
  ).toBeVisible();

  await page.goto("/communities/vintage-amp-circle/members");
  await expect(
    page.getByRole("heading", { name: "Vintage Amp Circle members" }),
  ).toBeVisible();
  await expect(page.getByText("Kyle K")).toBeVisible();
});
