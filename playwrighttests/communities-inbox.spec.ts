import { expect, test } from "@playwright/test";

test("communities page shows tabs, owned communities, and discovery", async ({
  page,
}) => {
  await page.goto("/communities");

  await expect(
    page.getByRole("heading", { name: "Communities", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "My Communities" })).toBeVisible();
  await expect(page.getByText("Vintage Amp Circle").first()).toBeVisible();
  await expect(page.getByText("Recent Community Listings")).toBeVisible();

  await page.getByRole("button", { name: "Discover" }).click();
  await expect(page.getByText("Semi-Hollow Club")).toBeVisible();

  await page.getByRole("button", { name: "Directory" }).click();
  await page.getByLabel("Search communities").fill("acoustic");
  await expect(page.getByText("Acoustic Corner")).toBeVisible();
});

test("inbox page shows threads, conversation, offer, and member context", async ({
  page,
}) => {
  await page.goto("/inbox");

  await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "PRS Custom 24 for your Strat?" }),
  ).toBeVisible();
  await expect(page.getByText("Trade offer")).toBeVisible();
  await expect(page.getByText("Member context")).toBeVisible();

  await page.getByRole("button", { name: /Tone Archive/ }).click();
  await expect(
    page.getByRole("heading", { name: "Twin Reverb trade fit" }),
  ).toBeVisible();
  await expect(page.getByText("Serviced Twin Reverb")).toBeVisible();
});
