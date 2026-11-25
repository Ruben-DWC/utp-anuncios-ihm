import { test, expect } from '@playwright/test';

test('Capturar pantallas oficiales de Login y Perfil', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Iniciar sesión primero (la app abre por defecto en Login)
  await page.locator('#student-code').fill('u22224908');
  await page.locator('#student-password').fill('123456');
  await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
  await expect(page.locator('nav button').first()).toBeVisible({ timeout: 10000 });

  // Capturar Inicio
  await page.screenshot({ path: 'screenshot_inicio.png' });

  // Ir a pestaña Perfil (4to botón del nav)
  const profileTab = page.locator('nav button').nth(3);
  await profileTab.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_perfil.png' });

  // Click en Cerrar sesión para ver la pantalla de Login institucional
  const logoutButton = page.locator('button:has-text("Cerrar sesión")');
  await logoutButton.click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'screenshot_login.png' });
});
