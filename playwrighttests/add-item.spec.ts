import { expect, test } from "@playwright/test";

test("add-item flow supports additive owned statuses and separate wanted mode", async ({
  page,
}) => {
  await page.goto("/add-item");

  await expect(
    page.getByRole("heading", {
      name: "List it, trade it, or add it to your collection.",
    }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /In Collection/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );

  await page.getByLabel("Title").fill("Test American Pro II Strat");
  await page.getByLabel("Brand").fill("Fender");
  await page.getByLabel("Model").fill("American Pro II");
  await page.getByLabel("Year").fill("2022");

  await page.getByRole("button", { name: /For Sale/ }).click();
  await page.getByLabel("Asking price").fill("1749");

  await page.getByRole("button", { name: /For Trade/ }).click();
  await page
    .getByLabel("Specific wants / notes")
    .fill("Boutique delays or clean semi-hollows.");

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
  await expect(page.getByText("Sale: $1749")).toBeVisible();
  await expect(
    page.locator("p").filter({
      hasText: "Boutique delays or clean semi-hollows.",
    }),
  ).toBeVisible();

  await page.getByLabel("Vintage Amp Circle").check();
  await expect(
    page.getByText("Contexts: Public Market, Vintage Amp Circle, Pedal Builders Guild"),
  ).toBeVisible();

  await page.getByRole("button", { name: /Wanted/ }).click();
  await expect(page.getByRole("button", { name: /Wanted/ })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
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

  await page.getByLabel("Target price").fill("2200");
  await expect(page.getByText("Wanted: Any clean example, target $2200")).toBeVisible();

  await page.getByRole("button", { name: "Save item" }).click();
  await expect(page.getByRole("dialog", { name: "Demo only" })).toBeVisible();
  await expect(page.getByText("Nothing was persisted.")).toBeVisible();
});
