import { test } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DepartureControlPage } from "../pages/DepartureControlPage";

test("Login y Selección de Vuelo", async ({ page }) => {
  const loginPage = new LoginPage(page);
  const departurePage = new DepartureControlPage(page);

  // 1. Inicio de Sesión
  await loginPage.goto();
  await loginPage.login("edwin.mejia.pro", "Qa.12345");

  // 2. Validación con Polling Helper
  const fueExitoso = await loginPage.checkStartScreen();
  if (!fueExitoso) {
    console.warn("La pantalla inicial tardó en responder. Continuando...");
  }

  // 3. Configuración de Estación y Máquina
  await loginPage.configureMachine("432", "6429");
  await page.pause(); // Pausa para inspección si la necesitas

  // 4. Módulo Departure Control y Selección de Vuelo
  await departurePage.goto();
  await departurePage.filterAndSelectFlight("DEMO_FLIGHTS", "tomorrow", "5005");
  await departurePage.verifyFlightSelected("IN5005");
});