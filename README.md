# UTP Anuncios — Portal Académico Inclusivo (MVP Final)

**Curso:** Interacción Hombre-Máquina (IHM) — Universidad Tecnológica del Perú (UTP)  
**Autor:** Ruben Walter Vivas Jiménez (`u22224908@utp.edu.pe`)  
**Diseño Base Figma:** [UTP-ANUNCIOS (`rGPcAfzPGVdXMrQvom1SzV`)](https://www.figma.com/design/rGPcAfzPGVdXMrQvom1SzV/UTP-ANUNCIOS?node-id=1-2&p=f&m=draw)

---

## 1. Descripción General y Modalidades (`PF 2026.pdf`)

**UTP Anuncios** es una Progressive Web App (PWA) mobile-first diseñada para comunicar avisos urgentes, traslados de aula, convocatorias y trámites universitarios bajo estándares **WCAG 2.2 AA/AAA**:

* **Interfaces Móviles y Responsivas:** Contenedor adaptativo (`320px–430px`) centrado en escritorio con **Panel de Evaluación AP3 & PF** (`?evaluator=true`).
* **Accesibilidad Sensorial Multimodal:**
  * Destello perimetral seguro $\le 2.0\text{ Hz}$ (cumple WCAG 2.3.1 y respeta `prefers-reduced-motion`).
  * Vibración háptica (`navigator.vibrate`) en móviles con fallback automático en escritorio a micro-sacudida visual + pulso Web Audio de `60 Hz` / `120 Hz`.
  * Escala tipográfica (`100%–150%`), modo Alto Contraste AAA (`> 7:1`) e indicadores de Lengua de Señas Peruana (`LSP`) y Subtítulos (`CC`).
* **Interfaces por Voz (VUI) + Agente IA ("Tutor Anuncios IA"):**
  * Dictado de voz (`Web Speech API es-PE`) + lectura en voz alta (`TTS speechSynthesis`).
  * Función serverless (`/.netlify/functions/agent`) conectada a **Google Gemini 2.0 Flash** con historial corto, mitigación contra Prompt Injection, Rate Limiting (`15 req/min`), y motor local de herramientas (`src/services/agentTools.ts`) para resiliencia offline (`< 4 s`).

---

## 2. Arquitectura y Mapeo Figma

| Módulo / Archivo | Frame Figma | Responsabilidad |
| :--- | :--- | :--- |
| `src/components/auth/LoginScreen.tsx` | `02 · Inicio de sesión`, `03 · Recuperación` | Acceso institucional `@utp.edu.pe`, modal de recuperación de clave y acceso rápido para jurado. |
| `src/components/layout/HeaderBar.tsx` | `551:12` | Identidad UTP oficial, botón Evaluador AP3, panel de accesibilidad y campana de notificaciones. |
| `src/components/layout/BottomNavBar.tsx` | `551:53`, `406:45` | 4 pestañas permanentes: **Inicio**, **Anuncios**, **Favoritos**, **Perfil**. |
| `src/components/notices/*` | `551:310`, `08–14` | Tarjetas de avisos, detalle modal, búsqueda libre y filtros por categoría + formato (`LSP`/`CC`/`Urgentes`). |
| `src/components/notifications/NotificationsDrawer.tsx` | `17 · Bandeja`, `18 · Preferencias` | Centro de notificaciones con lectura, preferencias y prueba sensorial. |
| `src/components/profile/ProfileScreen.tsx` | `19 · Perfil del estudiante` | Carné digital con QR, conmutador de 4 User Personas (AP2/AP3) y estado de sincronización Cloud Firestore. |
| `src/components/states/CatalogStateView.tsx` | `551:2` (`E-01`–`E-10`) | Catálogo completo de los 10 estados operativos diseñados en AP3. |

---

## 3. Requisitos, Instalación y Comandos

### Variables de Entorno (`.env`)
Copia `.env.example` a `.env` y completa tus credenciales:
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
GEMINI_API_KEY=...
ALLOWED_ORIGIN=https://tu-sitio.netlify.app
```

### Ejecución Local
```bash
npm install
npm run dev          # Vite en http://localhost:5174
npm run dev:netlify  # Vite + Netlify Functions locales (requiere netlify-cli)
npm run build        # Compilación TypeScript + bundle Vite en dist/
npm test             # Suite completa Playwright (Desktop, Pixel 7, iPhone 14) + axe-core WCAG 2.2
```

### Firebase Firestore & Seed
* Reglas de seguridad incluidas en [`firestore.rules`](firestore.rules) y configuración en [`firebase.json`](firebase.json).
* Para poblar `/anuncios` y `/categorias`: `node scripts/seedFirestore.mjs`.

---

## 4. Evaluación Docente Rápida (`?evaluator=true`)

* **URL de Evaluación:** `/?evaluator=true` (o pulsando el ícono de escudo en la barra superior).
* Permite alternar al instante entre los **10 Estados Operativos (`E-01` a `E-10`)** o invocar directamente `/?evaluator=true&state=E-04`.
