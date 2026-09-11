import { Page, expect, Locator } from '@playwright/test';

/**
 * Consulta la visibilidad de un locator cada cierto intervalo de tiempo.
 * Si no aparece dentro del timeout especificado, captura el error y retorna false.
 * 
 * @param locator - El elemento de Playwright a evaluar (ej: page.locator('...'))
 * @param maxTimeoutMs - Tiempo máximo de espera en milisegundos (Por defecto: 15000ms = 15s)
 * @param pollIntervalMs - Frecuencia de consulta en milisegundos (Por defecto: 1000ms = 1s)
 */
export async function waitForElementWithPolling(
  locator: Locator,
  maxTimeoutMs = 15000,
  pollIntervalMs = 1000
): Promise<boolean> {
  try {
    await expect.poll(
      async () => await locator.isVisible(),
      {
        timeout: maxTimeoutMs,
        intervals: [pollIntervalMs]
      }
    ).toBe(true);

    return true; // El elemento apareció dentro del tiempo
  } catch (error) {
    console.warn(`[POLLING] El elemento no fue visible tras ${maxTimeoutMs / 1000} segundos.`);
    return false; // Se agotó el tiempo de espera
  }
}