import { test, expect } from '@playwright/test';

async function loginAsStudent(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.locator('#student-code').fill('u22224908');
  await page.locator('#student-password').fill('123456');
  await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
  await expect(page.locator('nav button').first()).toBeVisible({ timeout: 10000 });
}

test.describe('Flujos End-to-End de Usuario (Login, Perfil, Notificaciones, Tutor IA)', () => {
  test('Login: errores de validación en código, dominio, contraseña e inicio de sesión válido', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Inicio de Sesión Institucional')).toBeVisible();

    // 1. Código vacío
    await page.locator('#student-code').fill('');
    await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
    await expect(page.locator('[role="alert"]')).toContainText('Por favor, ingresa tu código o correo institucional UTP.');
    await expect(page.locator('#student-code')).toHaveAttribute('aria-invalid', 'true');

    // 2. Dominio inválido y autocompletar @utp.edu.pe
    await page.locator('#student-code').fill('u22224908@gmail.com');
    await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
    await expect(page.locator('[role="alert"]')).toContainText('El correo debe terminar en @utp.edu.pe');
    await page.locator('button:has-text("Completar con @utp.edu.pe")').click();
    await expect(page.locator('#student-code')).toHaveValue('u22224908@utp.edu.pe');

    // 3. Contraseña corta / incorrecta
    await page.locator('#student-password').fill('123');
    await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
    await expect(page.locator('[role="alert"]')).toContainText('La contraseña debe tener al menos 6 caracteres.');
    await expect(page.locator('#student-password')).toHaveAttribute('aria-invalid', 'true');

    await page.locator('#student-password').fill('999999');
    await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
    await expect(page.locator('[role="alert"]')).toContainText('Contraseña incorrecta');

    // 4. Inicio de sesión válido
    await page.locator('#student-code').fill('u22224908');
    await page.locator('#student-password').fill('123456');
    await page.locator('button[type="submit"]:has-text("Iniciar sesión")').click();
    await expect(page.locator('header p')).toContainText('u22224908', { timeout: 10000 });
  });

  test('Flujo completo: Perfil -> Editar Perfil + Personas + QR + Firestore -> Cerrar sesión -> Recuperación -> Login', async ({ page }) => {
    await loginAsStudent(page);

    // Ir a Perfil
    await page.locator('nav button').nth(3).click();
    await expect(page.locator('text=Carné Universitario Digital')).toBeVisible();
    await expect(page.locator('text=Sincronización Cloud Firestore')).toBeVisible();

    // Editar Perfil: validación de campos vacíos y guardado válido
    await page.locator('button:has-text("Editar perfil")').click();
    await expect(page.locator('#edit-profile-modal-title')).toBeVisible();
    await page.locator('#edit-profile-name').fill('');
    await page.locator('button[type="submit"]:has-text("Guardar cambios")').click();
    await expect(page.locator('[role="alert"]')).toContainText('Todos los campos son obligatorios');

    await page.locator('#edit-profile-name').fill('Rubén Vivas Actualizado');
    await page.locator('#edit-profile-campus').fill('Lima Norte');
    await page.locator('button[type="submit"]:has-text("Guardar cambios")').click();
    await expect(page.locator('[role="status"]')).toContainText('Perfil actualizado correctamente');
    await expect(page.locator('h2:has-text("Rubén Vivas Actualizado")')).toBeVisible();

    // Cambiar a User Persona Lucía Paredes
    await page.locator('button:has-text("Lucía Paredes Valdivia")').click();
    await expect(page.locator('header p')).toContainText('u22251092');

    // Abrir modal QR y verificar enlace ?carnet=
    await page.locator('button:has-text("Ver QR")').click();
    await expect(page.locator('text=Código QR de Acceso Institucional')).toBeVisible();
    await expect(page.locator('a:has-text("Abrir enlace del carné")')).toHaveAttribute(
      'href',
      'https://utp-anuncios.netlify.app/?carnet=U22251092'
    );
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
    await loginAsStudent(page);
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
    await loginAsStudent(page);
    await page.locator('button[aria-label="Abrir asistente Tutor IA de Anuncios"]').click();
    await expect(page.locator('#tutor-ia-title')).toBeVisible();

    await page.locator('button:has-text("¿Dónde es mi clase de IHM hoy?")').click();
    await expect(page.locator('button:has-text("Abrir aviso: Aula A-408")')).toBeVisible({ timeout: 6000 });
  });
});
