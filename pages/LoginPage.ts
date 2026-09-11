import { Page, Locator, expect } from "@playwright/test";
import { waitForElementWithPolling } from "../Helpers/waitElement";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly startScreenHeader: Locator;
  readonly stationSelect: Locator;
  readonly machineSelect: Locator;
  readonly submitButton: Locator;
  readonly backofficeLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator('input[id="username"]');
    this.passwordInput = page.locator('input[id="password"]');
    this.loginButton = page.locator("#btnLogin");
    this.startScreenHeader = page.locator("#divFormHeader").getByText("Start Screen");
    this.stationSelect = page.locator("#station_key");
    this.machineSelect = page.locator("#machine_key");
    this.submitButton = page.locator('input[type="submit"]');
    this.backofficeLink = page.getByRole("link", { name: "PEI/BACKOFFICE" });
  }

  async goto() {
    await this.page.goto("https://aws-qa.inkcloud.io/login_auth.php?set_dcta=1");
  }

  async login(username: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  async checkStartScreen() {
    return await waitForElementWithPolling(this.startScreenHeader, 15000, 1000);
  }

  async configureMachine(station: string, machine: string) {
    await this.stationSelect.selectOption(station);
    await this.machineSelect.selectOption(machine);
    await this.submitButton.click();
    await this.page.waitForTimeout(5000);
    await expect(this.backofficeLink).toBeVisible();
  }
}