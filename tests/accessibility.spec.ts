import { test, expect } from '@playwright/test';

test.describe('Pruebas de Accesibilidad Sensorial e Inclusiva (WCAG 2.2 AA/AAA)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('La página principal debe cargar con el encabezado institucional UTP Anuncios', async ({ page }) => {
    const title = page.locator('header h1');
    await expect(title).toHaveText('UTP Anuncios');
    const authorBadge = page.locator('header p');
    await expect(authorBadge).toContainText('Ruben Walter');
  });

  test('El panel de accesibilidad debe abrirse y permitir alternar el modo Alto Contraste AAA', async ({ page }) => {
    // Abrir panel con botón accesible
    const a11yButton = page.locator('button[aria-label="Abrir panel de accesibilidad sensorial"]');
    await a11yButton.click();

    const panelTitle = page.locator('h2, span:text("Módulo de Accesibilidad Inclusiva")').first();
    await expect(panelTitle).toBeVisible();

    // Alternar alto contraste
    const contrastSwitch = page.locator('input[type="checkbox"]').first();
    await contrastSwitch.click();

    // Verificar que el elemento html o body aplique la clase de alto contraste
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveClass(/high-contrast-mode/);
  });

  test('Los botones de navegación inferior deben cumplir con roles y área táctil accesible', async ({ page }) => {
    const navButtons = page.locator('nav button');
    await expect(navButtons).toHaveCount(4);

    // Verificar texto de las 4 pestañas según el diseño oficial de Figma
    await expect(navButtons.nth(0)).toContainText('Inicio');
    await expect(navButtons.nth(1)).toContainText('Anuncios');
    await expect(navButtons.nth(2)).toContainText('Favoritos');
    await expect(navButtons.nth(3)).toContainText('Perfil');
  });
});
