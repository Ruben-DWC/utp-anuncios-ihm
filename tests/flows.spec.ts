import { test, expect } from '@playwright/test';

test.describe('Flujos End-to-End de Usuario (Login, Perfil, Notificaciones, Tutor IA)', () => {
  test('Flujo completo: Perfil -> Personas + QR + Firestore -> Cerrar sesión -> Recuperación -> Login', async ({ page }) => {
    await page.goto('/');

    // Ir a Perfil
    await page.locator('nav button').nth(3).click();
    await expect(page.locator('text=Carné Universitario Digital')).toBeVisible();
    await expect(page.locator('text=Sincronización Cloud Firestore')).toBeVisible();

    // Cambiar a User Persona Lucía Paredes
    await page.locator('button:has-text("Lucía Paredes Valdivia")').click();
    await expect(page.locator('header p')).toContainText('u22251092');

    // Abrir modal QR
    await page.locator('button:has-text("Ver QR")').click();
    await expect(page.locator('text=Código QR de Acceso Institucional')).toBeVisible();
    await page.getByRole('button', { name: 'Cerrar', exact: true }).click();

    // Cerrar sesión y verificar LoginScreen + Recuperación de clave
    await page.locator('button:has-text("Cerrar sesión institucional")').click();
    await expect(page.locator('text=Inicio de Sesión Institucional')).toBeVisible();

    await page.locator('button:has-text("¿Olvidaste tu clave?")').click();
    await expect(page.locator('#recovery-title')).toBeVisible();
    await page.locator('button:has-text("Enviar enlace de recuperación")').click();
    await expect(page.locator('text=¡Enlace de restablecimiento enviado!')).toBeVisible();
    await page.locator('button:has-text("Volver al inicio de sesión")').click();

    // Acceso rápido para jurado
    await page.locator('button:has-text("Ingresar como Rubén Walter")').click();
    await expect(page.locator('header p')).toContainText('u22224908');
  });

  test('Centro de Notificaciones: abrir bandeja, cambiar a preferencias y marcar leídas', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label^="Abrir centro de notificaciones"]').click();
    await expect(page.locator('#notifications-drawer-title')).toBeVisible();

    await page.locator('button[role="tab"]:has-text("Preferencias")').click();
    await expect(page.locator('text=Canales de Alerta Institucional')).toBeVisible();

    await page.locator('button[role="tab"]:has-text("Bandeja")').click();
    const markBtn = page.locator('button:has-text("Marcar leídas")');
    if (await markBtn.isVisible()) {
      await markBtn.click();
      await expect(page.locator('text=Todo al día')).toBeVisible();
    }
  });

  test('Tutor IA: enviar consulta rápida con herramientas locales y recibir acción estructurada', async ({ page }) => {
    await page.goto('/');
    await page.locator('button[aria-label="Abrir asistente Tutor IA de Anuncios"]').click();
    await expect(page.locator('#tutor-ia-title')).toBeVisible();

    await page.locator('button:has-text("¿Dónde es mi clase de IHM hoy?")').click();
    await expect(page.locator('button:has-text("Abrir aviso: Aula A-408")')).toBeVisible({ timeout: 6000 });
  });
});
