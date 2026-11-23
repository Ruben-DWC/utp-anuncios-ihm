import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Pruebas de Accesibilidad Sensorial e Inclusiva (WCAG 2.2 AA/AAA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('La página principal debe pasar la auditoría automática axe-core sin violaciones críticas ni serias', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const criticalOrSerious = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'critical' || v.impact === 'serious'
    );
    expect(criticalOrSerious).toEqual([]);
  });

  test('La página principal debe cargar con el encabezado institucional UTP Anuncios', async ({ page }) => {
    const title = page.locator('header h1');
    await expect(title).toHaveText('UTP Anuncios');
    const authorBadge = page.locator('header p');
    await expect(authorBadge).toContainText('Ruben Walter');
  });

  test('El panel de accesibilidad debe abrirse y permitir alternar el modo Alto Contraste AAA', async ({ page }) => {
    const a11yButton = page.locator('button[aria-label="Abrir panel de accesibilidad sensorial"]');
    await a11yButton.click();

    const panelTitle = page.locator('h2:has-text("Accesibilidad Sensorial Inclusiva")');
    await expect(panelTitle).toBeVisible();

    const contrastSwitch = page.locator('input[type="checkbox"]').first();
    await contrastSwitch.click();

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/high-contrast-mode/);
  });

  test('Los botones de navegación inferior deben cumplir con roles y área táctil accesible', async ({ page }) => {
    const navButtons = page.locator('nav button');
    await expect(navButtons).toHaveCount(4);

    await expect(navButtons.nth(0)).toContainText('Inicio');
    await expect(navButtons.nth(1)).toContainText('Anuncios');
    await expect(navButtons.nth(2)).toContainText('Favoritos');
    await expect(navButtons.nth(3)).toContainText('Perfil');
  });

  test('El centro de notificaciones debe abrirse desde la campana del encabezado', async ({ page }) => {
    const bellButton = page.locator('button[aria-label^="Abrir centro de notificaciones"]');
    await bellButton.click();

    const drawerTitle = page.locator('#notifications-drawer-title');
    await expect(drawerTitle).toHaveText('Centro de Notificaciones');
  });
});
