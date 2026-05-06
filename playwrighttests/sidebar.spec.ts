import { expect, test } from "@playwright/test";

test("desktop sidebar places profile under inbox and reserves bottom niche switcher", async ({
  page,
}) => {
  await page.goto("/my-stuff");

  const primaryNav = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  const inboxLink = primaryNav.getByRole("link", { name: "Inbox" });
  const profileLink = primaryNav.getByRole("link", { name: /Profile/ });
  const componentLabLink = page.getByRole("link", { name: "Component Lab" });
  const nicheSwitcher = page.getByRole("button", {
    name: "Current niche: Music Gear",
  });

  await expect(inboxLink).toBeVisible();
  await expect(profileLink).toBeVisible();
  await expect(componentLabLink).toBeVisible();
  await expect(nicheSwitcher).toBeVisible();

  const inboxBox = await inboxLink.boundingBox();
  const profileBox = await profileLink.boundingBox();
  const componentLabBox = await componentLabLink.boundingBox();
  const nicheBox = await nicheSwitcher.boundingBox();

  expect(inboxBox).not.toBeNull();
  expect(profileBox).not.toBeNull();
  expect(componentLabBox).not.toBeNull();
  expect(nicheBox).not.toBeNull();
  expect(profileBox!.y).toBeGreaterThan(inboxBox!.y);
  expect(profileBox!.y).toBeLessThan(componentLabBox!.y);
  expect(nicheBox!.y).toBeGreaterThan(componentLabBox!.y);
});
