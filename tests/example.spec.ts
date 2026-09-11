/*import { test, expect } from "@playwright/test";

test.describe("Test suite", async () => {
  test("has title", async ({ page }) => {
    await test.step("User go to URL", async () => {
      await page.goto("https://playwright.dev/");
    });

    await test.step("User see the name of te page", async () => {
      await expect(page).toHaveTitle(/Playwright/);
    });
  });

  /*test("get started link", async ({ page }) => {
    await page.goto("https://playwright.dev/");

    // Click the get started link.
    await page.getByRole("link", { name: "Get started" }).click();

    // Expects page to have a heading with the name of Installation.
    await expect(
      page.getByRole("heading", { name: "Installation" }),
    ).toBeVisible();
  });
});*/
