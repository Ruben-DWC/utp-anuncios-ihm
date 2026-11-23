import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function expectNoSeriousAxeViolations(page: import('@playwright/test').Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  const serious = results.violations.filter(
    (v) => v.impact === 'critical' || v.impact === 'serious'
  );
  expect(serious).toEqual([]);
}

test.describe('Pruebas de Accesibilidad Sensorial e Inclusiva (WCAG 2.2 AA/AAA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('La página principal debe pasar axe-core WCAG 2.2 AA sin violaciones críticas ni serias', async ({ page }) => {
    await expectNoSeriousAxeViolations(page);
  });

  test('El panel de accesibilidad y el modo Alto Contraste AAA deben pasar axe-core', async ({ page }) => {
    await page.locator('button[aria-label="Abrir panel de accesibilidad sensorial"]').click();
    await expect(page.locator('h2:has-text("Accesibilidad Sensorial Inclusiva")')).toBeVisible();
    await expectNoSeriousAxeViolations(page);

    await page.locator('input[type="checkbox"]').first().click();
    await expect(page.locator('html')).toHaveClass(/high-contrast-mode/);
    await expectNoSeriousAxeViolations(page);

    await page.keyboard.press('Escape');
  });

  test('El Tutor IA y el Centro de Notificaciones deben pasar axe-core y cerrar con Escape', async ({ page }) => {
    await page.locator('button[aria-label="Abrir asistente Tutor IA de Anuncios"]').click();
    await expect(page.locator('#tutor-ia-title')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#tutor-ia-title')).not.toBeVisible();

    await page.locator('button[aria-label^="Abrir centro de notificaciones"]').click();
    await expect(page.locator('#notifications-drawer-title')).toBeVisible();
    await expectNoSeriousAxeViolations(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#notifications-drawer-title')).not.toBeVisible();
  });

  test('Los botones de navegación inferior deben cumplir con los 4 tabs de Figma', async ({ page }) => {
    const navButtons = page.locator('nav button');
    await expect(navButtons).toHaveCount(4);
    await expect(navButtons.nth(0)).toContainText('Inicio');
    await expect(navButtons.nth(1)).toContainText('Anuncios');
    await expect(navButtons.nth(2)).toContainText('Favoritos');
    await expect(navButtons.nth(3)).toContainText('Perfil');
  });
});
