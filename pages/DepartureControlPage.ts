import { Page, Locator, expect } from "@playwright/test";

export class DepartureControlPage {
  readonly page: Page;
  readonly statusSelect: Locator;
  readonly rangeDateSelect: Locator;
  readonly flightNumInput: Locator;
  readonly showFlightButton: Locator;
  readonly selectedFlightCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.statusSelect = page.locator("#select_flight_status");
    this.rangeDateSelect = page.locator("#custom_range_date");
    this.flightNumInput = page.locator("#filght_num_filter");
    this.showFlightButton = page.locator("#show_flight_button");
    this.selectedFlightCard = page.locator("#dc_left_flight_selected_IN5005");
  }

  async goto() {
    await this.page.goto("https://aws-qa.inkcloud.io/departure_control.php");
  }

  async filterAndSelectFlight(status: string, dateRange: string, flightNumber: string) {
    await this.statusSelect.selectOption(status);
    await this.rangeDateSelect.selectOption(dateRange);
    await this.flightNumInput.fill(flightNumber);
    await this.page.waitForTimeout(5000);
    await this.showFlightButton.click();
    await this.page.waitForTimeout(1000);
  }

  async verifyFlightSelected(expectedFlightText: string) {
    await expect(this.selectedFlightCard).toContainText(expectedFlightText);
  }
}