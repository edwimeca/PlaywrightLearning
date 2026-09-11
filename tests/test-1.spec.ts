import { test, expect } from "@playwright/test";
import { waitForElementWithPolling } from "../Helpers/waitElement";

test("Login", async ({ page }) => {
  await page.goto("https://aws-qa.inkcloud.io/login_auth.php?set_dcta=1");
  await page.locator('input[id= "username"]').fill("edwin.mejia.pro");
  await page.locator('input[id= "password"]').fill("Qa.12345");
  await page.locator("//*[@id='btnLogin']").click();

  const startScreenLocator = page.locator('#divFormHeader').getByText('Start Screen');

  // 2. Llamas al helper pasando el locator, timeout de 15s e intervalo de 1s
  const fueExitoso = await waitForElementWithPolling(startScreenLocator, 15000, 1000);
  
   //Setting Machine
  await page.locator("#station_key").selectOption("432");
  await page.locator("#machine_key").selectOption("6429");
  await page.locator('input[type= "submit"]').click();
  await page.waitForTimeout(5000);
  await expect(page.getByRole("link", { name: "PEI/BACKOFFICE" })).toBeVisible();
  await page.pause();

  //Selecting flight
  await page.goto("https://aws-qa.inkcloud.io/departure_control.php");
  await page.locator('#select_flight_status').selectOption('DEMO_FLIGHTS');
  await page.locator('#custom_range_date').selectOption('tomorrow');
  await page.locator('#filght_num_filter').fill('5005');
  await page.waitForTimeout(5000);
  await page.locator('input[id= "show_flight_button"]').click();
  await page.waitForTimeout(1000);
  await expect(page.locator('#dc_left_flight_selected_IN5005')).toContainText("IN5005");

  //Opening Desk
  await page.locator('#onsite_check_in_open').check();
  await page.getByRole('img', { name: 'Reload' }).click();
  
  //Setting Times
  const hoy = new Date();
  const fechaFormateada = hoy.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  await page.locator('#cabin_doors_closed').fill('1000');  
  await page.locator('#off_block_date_ft').fill(fechaFormateada);
  await page.locator('#off_block_time').click();
  await page.locator('#off_block_time').fill('1000');  
  await page.locator('#actual_departure_date').fill(fechaFormateada);
  await page.locator('#actual_departure_time').fill('1000');
  
  //Dealyting the flight
  await page.locator('#estimated_departure_time').fill('0805');
  await page.getByRole('img', { name: 'Reload' }).click();


  //Opening Bording
  await page.locator('#dc_flight_operations_boarding_tab_terminal').click();
  await page.locator('#origin_terminal_key').selectOption('396');

  await page.locator('#dc_flight_operations_boarding_tab_ter_gate').click();
  await page.locator('#boarding_gate_key_id').selectOption('12793');
  await page.locator('#boarding_open').check();
  await page.waitForTimeout(1000);
  await page.getByRole('cell', { name: 'Boarding', exact: true }).click();
  await page.locator('#boarding_priority').selectOption('1'); 
});

/*test("Set Station and Machine", async ({ page }) => {
  await page.locator("#station_key").selectOption("432");
  await page.locator("#machine_key").selectOption("6429");
  await page.getByRole("button", { name: "Set Machine..." }).click();
  await expect(page.getByRole("link", { name: "PEI/BACKOFFICE" })).toBeVisible();
  await page.pause();
});*/
