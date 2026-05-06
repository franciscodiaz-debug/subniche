import { expect, test } from "@playwright/test";

test("home page shows authenticated feed sections", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: /Where musicians trade, sell, and collect/ }),
  ).toBeHidden();
  await expect(page.getByText(/Welcome back,/)).toBeHidden();
  await expect(page.getByText("Action Required")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Welcome to sn/MusicGear" }),
  ).toBeVisible();
  await expect(page.getByTestId("home-onboarding-sticky")).toBeHidden();
  const tradePreviewButton = page.getByRole("button", {
    name: "Preview Set 3 trade interests video (0:14)",
  });
  await expect(tradePreviewButton).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Preview: Set 3 trade interests" }),
  ).toHaveCount(0);
  await tradePreviewButton.click();
  await expect(page.getByTestId("home-onboarding-video-preview")).toBeVisible();
  await expect(
    page.getByText(
      "Tell SubNiche what you are chasing so we can surface matching gear automatically.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Open List 3 items" })).toHaveAttribute(
    "href",
    "/add-item",
  );
  await expect(
    page.getByRole("link", { name: "Open Set 3 trade interests" }),
  ).toHaveAttribute("href", "/trade");
  await expect(page.getByRole("link", { name: "Open Complete profile" })).toHaveAttribute(
    "href",
    "/profile",
  );

  const taskList = page.getByTestId("home-onboarding-task-list");
  const dismissButton = page.getByTestId("home-onboarding-dismiss");
  const taskListBox = await taskList.boundingBox();
  const dismissBox = await dismissButton.boundingBox();
  expect(taskListBox).not.toBeNull();
  expect(dismissBox).not.toBeNull();
  expect(taskListBox!.width).toBeLessThanOrEqual(770);
  expect(
    Math.abs(dismissBox!.x + dismissBox!.width - (taskListBox!.x + taskListBox!.width - 16)),
  ).toBeLessThan(4);

  const dismissColor = await dismissButton.evaluate(
    (element) => getComputedStyle(element).color,
  );
  await dismissButton.hover();
  await expect
    .poll(() => dismissButton.evaluate((element) => getComputedStyle(element).color))
    .not.toBe(dismissColor);

  await page.evaluate(() => window.scrollTo(0, 1600));
  await expect(page.getByTestId("home-onboarding-sticky")).toBeVisible();
  await expect(
    page.getByTestId("home-onboarding-sticky").getByRole("link", {
      name: "Add your first item",
    }),
  ).toHaveAttribute("href", "/add-item");
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(
    page.getByRole("link", { name: /Julian offered a Twin Reverb/ }),
  ).toHaveAttribute("href", "/inbox?id=thread-tone-mesa");
  await expect(page.getByText("Most Recent Trade Matches")).toBeVisible();
  await expect(page.getByText("From Saved Searches")).toBeVisible();
  await expect(page.getByText("From Items You Follow")).toBeVisible();
  await expect(
    page.getByText("From Collections and People You Follow"),
  ).toBeVisible();
  await expect(page.getByText("Most Recent From Your Communities")).toBeVisible();
  await expect(page.getByText("You are all caught up")).toBeVisible();
  await expect(page.getByText("Trending Listings")).toBeVisible();
  await expect(page.getByText("Just Listed")).toBeVisible();
  await page.getByRole("button", { name: "I'll do this later" }).click();
  await expect(page.getByText("Introduce yourself to the community")).toBeHidden();
});
