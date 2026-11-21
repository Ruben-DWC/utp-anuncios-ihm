import { test, expect } from '@playwright/test';

test.describe('Catálogo de los 10 Estados Operativos de Rubén Vivas (AP3)', () => {
  test.beforeEach(async ({ page }) => {
    // Ingresar activando la barra del evaluador docente
    await page.goto('/?evaluator=true');
  });

  test('El panel de evaluación docente debe ser visible y permitir alternar el Estado E-01 (Vacío inicial)', async ({ page }) => {
    const e01Button = page.locator('button:has-text("E-01")').first();
    await expect(e01Button).toBeVisible();
    await e01Button.click();

    // Comprobar mensaje de catálogo E-01
    await expect(page.locator('text=Aún no tienes anuncios favoritos').first()).toBeVisible();
    await expect(page.locator('button:has-text("Explorar anuncios vigentes")').first()).toBeVisible();
  });

  test('El Estado E-04 (Carga con esqueleto) debe contar con el atributo aria-busy="true"', async ({ page }) => {
    const e04Button = page.locator('button:has-text("E-04")').first();
    await e04Button.click();

    const skeletonContainer = page.locator('[aria-busy="true"]').first();
    await expect(skeletonContainer).toBeVisible();
  });

  test('El Estado E-05 (Error de conexión) debe ofrecer botón de reintento funcional', async ({ page }) => {
    const e05Button = page.locator('button:has-text("E-05")').first();
    await e05Button.click();

    const retryButton = page.locator('button:has-text("Reintentar cargar el anuncio")').first();
    await expect(retryButton).toBeVisible();
  });

  test('El Estado E-10 (Éxito y confirmación) debe exhibir la constancia oficial', async ({ page }) => {
    const e10Button = page.locator('button:has-text("E-10")').first();
    await e10Button.click();

    await expect(page.locator('text=¡Anuncio guardado y lectura confirmada!').first()).toBeVisible();
    await expect(page.locator('text=#UTP-2026-42920').first()).toBeVisible();
  });
});
