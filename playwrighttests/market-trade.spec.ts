import { expect, type Locator, type Page, test } from "@playwright/test";

async function dismissMarketplaceTour(page: Page) {
  const tour = page.getByRole("dialog", { name: "Marketplace tour" });

  await tour.waitFor({ state: "visible", timeout: 1000 }).catch(() => {});

  if (await tour.isVisible().catch(() => false)) {
    await tour.getByRole("button", { name: "Skip tour" }).click();
  }
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    )
    .toBe(true);
}

async function dragPriceHandleToRatio(
  page: Page,
  handle: Locator,
  track: Locator,
  ratio: number,
) {
  const handleBox = await handle.boundingBox();
  const trackBox = await track.boundingBox();

  expect(handleBox).not.toBeNull();
  expect(trackBox).not.toBeNull();

  await page.mouse.move(
    handleBox!.x + handleBox!.width / 2,
    handleBox!.y + handleBox!.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    trackBox!.x + trackBox!.width * ratio,
    trackBox!.y + trackBox!.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
}

test("market page tour spotlights mode, filters, and grid controls", async ({
  page,
}) => {
  await page.goto("/market");

  const tour = page.getByRole("dialog", { name: "Marketplace tour" });
  await expect(
    tour.getByRole("heading", { name: "For Sale or Trade" }),
  ).toBeVisible();
  await tour.getByRole("button", { name: "Next" }).click();
  await expect(tour.getByRole("heading", { name: "Filters" })).toBeVisible();
  await tour.getByRole("button", { name: "Next" }).click();
  await expect(tour.getByRole("heading", { name: "Grid Controls" })).toBeVisible();
  await tour.getByRole("button", { name: "Get started" }).click();
  await expect(tour).toBeHidden();
  await page.reload();
  await expect(tour).toBeHidden();
});

test("market page matches the compact v0 marketplace workflow", async ({
  page,
}) => {
  await page.goto("/market");
  await dismissMarketplaceTour(page);

  const marketplaceMode = page.getByLabel("Marketplace mode");

  await expect(page.getByRole("heading", { name: "Market" })).toBeVisible();
  await expect(
    marketplaceMode.getByRole("link", { name: "For Sale" }),
  ).toBeVisible();
  await expect(
    marketplaceMode.getByRole("link", { name: "Trade" }),
  ).toBeVisible();
  await expect(page.getByText("12 listings")).toBeVisible();
  await expect(page.getByLabel("Sort listings")).toHaveValue("newest");

  await page.getByRole("button", { name: "Filters" }).click();
  const priceFilter = page.locator("aside").getByTestId(
    "price-histogram-control",
  );
  const priceTrack = priceFilter.getByTestId("price-range-track");

  await priceFilter.scrollIntoViewIfNeeded();
  await expect(priceFilter.getByLabel("Minimum price")).toBeVisible();
  await expect
    .poll(async () => {
      const box = await priceTrack.boundingBox();

      return Math.round(box?.x ?? -999);
    })
    .toBeGreaterThan(0);
  await expect(priceFilter.getByLabel("Lower price handle")).toHaveAttribute(
    "step",
    "1",
  );
  await expect(priceFilter.getByLabel("Lower price handle")).toHaveAttribute(
    "min",
    "0",
  );
  await expect(priceFilter.getByLabel("Upper price handle")).toHaveAttribute(
    "step",
    "1",
  );
  await expect(priceFilter.getByLabel("Upper price handle")).toHaveAttribute(
    "max",
    "5000",
  );
  await dragPriceHandleToRatio(
    page,
    priceFilter.getByTestId("lower-price-drag-handle"),
    priceTrack,
    0.1,
  );
  expect(Number(await priceFilter.getByLabel("Minimum price").inputValue())).toBeGreaterThan(0);
  await dragPriceHandleToRatio(
    page,
    priceFilter.getByTestId("upper-price-drag-handle"),
    priceTrack,
    0.3,
  );
  expect(Number(await priceFilter.getByLabel("Maximum price").inputValue())).toBeLessThan(5000);
  await priceFilter.getByLabel("Lower price handle").focus();
  await page.keyboard.press("ArrowRight");
  expect(Number(await priceFilter.getByLabel("Lower price handle").inputValue())).toBeGreaterThan(1);
  await priceFilter.getByLabel("Upper price handle").focus();
  await page.keyboard.press("ArrowLeft");
  expect(Number(await priceFilter.getByLabel("Upper price handle").inputValue())).toBeLessThan(5000);
  await priceFilter.getByLabel("Minimum price").fill("270");
  await priceFilter.getByLabel("Maximum price").fill("943");
  await page.getByRole("button", { name: "Close filters" }).click();
  await expect(
    page.getByRole("button", { name: "$270 - $943" }),
  ).toBeVisible();
  await expect(page.getByText("Strymon BigSky Reverb").first()).toBeVisible();
  await page.getByRole("button", { name: "$270 - $943" }).click();
  await expect(page.getByText("12 listings")).toBeVisible();

  await page.getByRole("button", { name: "Filters" }).click();
  await page.getByRole("button", { name: /Electric Guitars/ }).click();
  await expect(page.getByRole("button", { name: /Hollow Body/ })).toBeVisible();
  await expect(page.getByText("Brands")).toBeVisible();
  await expect(page.getByRole("checkbox", { name: /Fender/ })).toBeVisible();
  await page.getByRole("button", { name: "Hollow Body" }).click();
  await page.getByRole("checkbox", { name: /Martin/ }).check();
  await page.getByRole("button", { name: "Close filters" }).click();

  await expect(
    page.getByRole("button", { name: "Electric Guitars" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Hollow Body" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Martin" })).toBeVisible();
  await expect(
    page.getByText("Martin F-55 Hollow Body").first(),
  ).toBeVisible();

  await page.getByRole("button", { name: "Electric Guitars" }).click();
  await expect(page.getByText("12 listings")).toBeVisible();

  await page.getByRole("button", { name: "Grid density" }).click();
  await page.getByRole("menuitem", { name: "6x Full Nerd" }).click();
  await expect(page.getByTestId("marketplace-grid")).toHaveAttribute(
    "data-density",
    "dense",
  );
});

test("trade page supports v0-style trade target browsing", async ({ page }) => {
  await page.goto("/trade");

  const marketplaceMode = page.getByLabel("Marketplace mode");

  await expect(page.getByRole("heading", { name: "Market" })).toBeVisible();
  await expect(
    marketplaceMode.getByRole("link", { name: "Trade" }),
  ).toHaveClass(/border-accent/);
  await expect(page.getByRole("button", { name: "Trade target" })).toBeVisible();
  await expect(
    page.locator("span").filter({ hasText: /^\d+ matches$/ }).first(),
  ).toBeVisible();
  await expect(page.getByText("Trade match for your").first()).toBeVisible();

  await page.getByRole("button", { name: "Trade target" }).click();
  await expect(page.getByRole("option", { name: /Martin D-28/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("option", { name: /Martin D-28/ })).toBeHidden();
  await page.getByRole("button", { name: "Trade target" }).click();
  await expect(page.getByRole("option", { name: /Martin D-28/ })).toBeVisible();
  const fenderPreferences = page.getByLabel(
    "Trade preferences for Fender American Pro II Stratocaster",
  );
  await expect(fenderPreferences).toHaveCSS("opacity", "0");
  await page.getByRole("option", { name: /Fender American Pro II/ }).hover();
  await expect(fenderPreferences).toHaveCSS("opacity", "1");
  await page.getByRole("option", { name: /Fender American Pro II/ }).click();
  await expect(
    page.getByLabel("Trade preferences for Fender American Pro II Stratocaster"),
  ).toBeVisible();

  await expect(
    page.locator("h3").filter({ hasText: "Gibson Les Paul Standard '50s" }),
  ).toBeVisible();
  await expect(
    page.locator("h3").filter({ hasText: "PRS Custom 24 10-Top" }),
  ).toBeVisible();
  await expect(
    page.locator("h3").filter({ hasText: "Gretsch G6120T-55 Vintage Select" }),
  ).toBeVisible();
  await expect(page.getByText("Interested in your").first()).toBeVisible();
  await expect(page.getByText(/\d\.\d/).first()).toBeVisible();

  await page.getByRole("button", { name: "Grid density" }).click();
  await page.getByRole("menuitem", { name: "2x Photo" }).click();
  await expect(page.getByTestId("marketplace-grid")).toHaveAttribute(
    "data-density",
    "cozy",
  );
});

test("trade page hydrates cleanly with saved grid density", async ({ page }) => {
  const hydrationErrors: string[] = [];

  page.on("pageerror", (error) => {
    if (error.message.includes("Hydration failed")) {
      hydrationErrors.push(error.message);
    }
  });
  await page.addInitScript(() => {
    window.localStorage.setItem("subniche-grid-density", "dense");
  });
  await page.goto("/trade");
  await expect(page.getByTestId("marketplace-grid")).toHaveAttribute(
    "data-density",
    "dense",
  );
  await page.waitForTimeout(500);

  expect(hydrationErrors).toEqual([]);
});

test("mobile market filter sheet dismisses from keyboard and backdrop", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/market");
  await dismissMarketplaceTour(page);

  await expect(
    page.getByRole("button", { name: "Open navigation menu" }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Search gear, musicians...", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByPlaceholder("Search gear, musicians, communities...", {
      exact: true,
    }),
  ).toBeHidden();
  await expectNoHorizontalOverflow(page);
  await expect(
    page.getByRole("button", { name: "Save listing" }).first(),
  ).toHaveCSS("opacity", "1");

  await page.getByRole("button", { name: "Grid density" }).click();
  await page.getByRole("menuitem", { name: "6x Full Nerd" }).click();
  await expect(page.getByTestId("marketplace-grid")).toHaveAttribute(
    "data-density",
    "dense",
  );

  await page.getByRole("button", { name: "Filters" }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeHidden();

  await page.getByRole("button", { name: "Filters" }).click();
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeVisible();
  await page.getByTestId("sheet-backdrop").click({ position: { x: 384, y: 6 } });
  await expect(page.getByRole("dialog", { name: "Filters" })).toBeHidden();
});

test("mobile trade selector keeps target and density controls tap-reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/trade");

  await expect(page.getByRole("button", { name: "Trade target" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "Trade target" }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await expect(
    page.getByLabel("Trade preferences for Fender American Pro II Stratocaster"),
  ).toHaveCSS("opacity", "1");
  await page.getByRole("option", { name: /Martin D-28/ }).click();
  await expect(
    page.getByRole("button", { name: "Trade target" }),
  ).toContainText("Martin D-28");

  await page.getByRole("button", { name: "Grid density" }).click();
  await page.getByRole("menuitem", { name: "2x Photo" }).click();
  await expect(page.getByTestId("marketplace-grid")).toHaveAttribute(
    "data-density",
    "cozy",
  );
  await expectNoHorizontalOverflow(page);
});
