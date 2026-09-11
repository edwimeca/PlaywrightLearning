import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://blazedemo.com/');
  await page.locator('select[name="fromPort"]').selectOption('Boston');
  await page.locator('select[name="toPort"]').selectOption('Berlin');
  await page.locator('input[type= "submit"]').click();
  await page.locator('//tr[2]/td[1]/input').click();
  await page.locator('input[id= "inputName"]').fill('Edwin Mejia');
  await page.locator('input[id= "address"]').fill('123 street');
  await page.locator('input[id= "city"]').fill('COl');
  await page.locator('input[id= "state"]').fill('Rda');
  await page.locator('input[id= "zipCode"]').fill('1569');
  await page.locator('#cardType').selectOption('amex');
  await page.locator('input[id= "creditCardNumber"]').fill('85858596');
  await page.locator('input[id= "nameOnCard"]').fill('Edwin Mejia');
  await page.locator('input[type= "submit"]').click();  
  await expect(page.locator('//div[2]/div/h1')).toContainText("Thank you ");
});