import { test, expect } from '@playwright/test';

const STATE_CODES = ['E-01', 'E-02', 'E-03', 'E-04', 'E-05', 'E-06', 'E-07', 'E-08', 'E-09', 'E-10'];

test.describe('Catálogo completo de los 10 Estados Operativos AP3 (E-01 a E-10)', () => {
  for (const code of STATE_CODES) {
    test(`El Estado ${code} debe renderizarse vía ?state=${code}`, async ({ page }) => {
      await page.goto(`/?evaluator=true&state=${code}`);
      await expect(page.locator(`main >> text=${code}`).first()).toBeVisible();
    });
  }

  test('El Estado E-04 (Carga con esqueleto) debe contar con aria-busy="true"', async ({ page }) => {
    await page.goto('/?evaluator=true&state=E-04');
    const busyRegion = page.locator('[aria-busy="true"]');
    await expect(busyRegion).toBeVisible();
  });
});
