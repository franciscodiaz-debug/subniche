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

  await page.getByRole("button", { name: "Create Community" }).click();
  await expect(page.getByRole("dialog", { name: "Create Community" })).toBeVisible();
  await expect(page.getByText("No community was created.")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Create Community" })).toBeHidden();

  await page.getByRole("button", { name: "Create Community" }).click();
  await expect(page.getByRole("dialog", { name: "Create Community" })).toBeVisible();
  await page.getByTestId("dialog-backdrop").click({ position: { x: 6, y: 6 } });
  await expect(page.getByRole("dialog", { name: "Create Community" })).toBeHidden();

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
  await expect(page.getByText("Select a conversation")).toBeVisible();

  await page.getByRole("button", { name: /Fender American Pro II Stratocaster/ }).click();
  await expect(page).toHaveURL(/\/inbox\?id=thread-mara-strat/);
  await expect(
    page.getByRole("heading", { name: "PRS Custom 24 for your Strat?" }),
  ).toBeVisible();
  await expect(page.getByText("Trade offer")).toBeVisible();
  await expect(page.getByText("Member context")).toBeVisible();
  await expect(page.getByRole("button", { name: "Send reply" })).toBeDisabled();
  const replyBox = page.getByRole("textbox", { name: "Reply" });
  await replyBox.fill("Could you send one more photo of the neck pocket?");
  await expect(page.getByRole("button", { name: "Send reply" })).toBeEnabled();
  await page.getByRole("button", { name: "Send reply" }).click();
  await expect(
    page.getByText("Could you send one more photo of the neck pocket?"),
  ).toBeVisible();
  await expect(replyBox).toHaveValue("");
  await page.getByRole("button", { name: "Counter" }).click();
  const counterDialog = page.getByRole("dialog", { name: "Counter Offer" });
  await expect(counterDialog).toBeVisible();
  await expect(counterDialog.getByText("Their offer")).toBeVisible();
  await expect(counterDialog.getByText("Your items")).toBeVisible();
  await counterDialog.getByRole("button", { name: /Their offer/ }).click();
  await expect(counterDialog.getByRole("spinbutton")).toHaveValue("250");
  await expect(
    counterDialog.getByRole("button", { name: "Send Counter" }),
  ).toBeDisabled();
  await counterDialog.getByRole("button", { name: /Their offer/ }).click();
  await counterDialog.getByRole("button", { name: "Add a message..." }).click();
  await counterDialog.getByPlaceholder("Add a message...").fill("Could you include the original strap?");
  await counterDialog.getByRole("button", { name: "Done editing counter message" }).click();
  await expect(counterDialog.getByText("Could you include the original strap?")).toBeVisible();
  await expect(
    counterDialog.getByRole("button", { name: "Send Counter" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(counterDialog).toBeHidden();

  await page.getByRole("button", { name: /Tone Archive/ }).click();
  await expect(page).toHaveURL(/\/inbox\?id=thread-tone-mesa/);
  await expect(
    page.getByRole("heading", { name: "Twin Reverb trade fit" }),
  ).toBeVisible();
  await expect(page.getByText("Fender '65 Twin Reverb Reissue")).toBeVisible();
  await expect(page.getByText("Serviced Twin Reverb")).toBeVisible();
});

test("inbox offer actions update offer state and timeline", async ({ page }) => {
  await page.goto("/inbox");

  await page.getByRole("button", { name: /Tone Archive/ }).click();
  await expect(page).toHaveURL(/\/inbox\?id=thread-tone-mesa/);
  await expect(page.getByText("pending").first()).toBeVisible();

  await page.getByRole("button", { name: "Counter" }).click();
  const counterDialog = page.getByRole("dialog", { name: "Counter Offer" });
  await counterDialog.getByRole("button", { name: "Add a message..." }).click();
  await counterDialog
    .getByPlaceholder("Add a message...")
    .fill("Could we make it an even trade if I include fresh tubes?");
  await counterDialog
    .getByRole("button", { name: "Done editing counter message" })
    .click();
  await counterDialog.getByRole("button", { name: "Send Counter" }).click();

  await expect(counterDialog).toBeHidden();
  await expect(page.getByText("countered").first()).toBeVisible();
  await expect(
    page.getByText(
      "You sent a counter offer: Could we make it an even trade if I include fresh tubes?",
    ),
  ).toBeVisible();

  await page.getByRole("button", { name: "Accept" }).click();
  await expect(page.getByText("accepted").first()).toBeVisible();
  await expect(
    page.getByText(
      "You accepted the offer. Coordinate next steps, pickup, shipping, and payment details in this thread.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept" })).toHaveCount(0);
});

test("inbox decline resolves an active offer without closing the thread", async ({
  page,
}) => {
  await page.goto("/inbox?id=thread-tone-mesa");

  await expect(
    page.getByRole("heading", { name: "Twin Reverb trade fit" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Decline" }).click();
  await expect(page.getByText("declined").first()).toBeVisible();
  await expect(
    page.getByText("You declined the offer.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Reply" })).toBeVisible();
});

test("mobile inbox keeps offer actions and thread navigation reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/inbox?id=thread-tone-mesa");

  await expect(
    page.getByRole("heading", { name: "Twin Reverb trade fit" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Accept" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Counter" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Decline" })).toBeVisible();

  const layout = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(layout.scrollWidth).toBeLessThanOrEqual(layout.innerWidth + 1);

  await page.getByRole("button", { name: "Counter" }).click();
  await expect(page.getByRole("dialog", { name: "Counter Offer" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Send Counter" })).toBeVisible();
  await page.getByRole("button", { name: "Close counter offer" }).click();

  await page.getByRole("button", { name: "Back to conversations" }).click();
  await expect(page).toHaveURL(/\/inbox$/);
  await expect(page.getByRole("heading", { name: "Inbox" })).toBeVisible();
});
