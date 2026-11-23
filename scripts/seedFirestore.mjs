/**
 * Script de población inicial (Seed) para Cloud Firestore (/anuncios y /categorias).
 * Uso:
 *   1. Configurar GOOGLE_APPLICATION_CREDENTIALS=/ruta/serviceAccountKey.json (o usar Firebase Admin).
 *   2. Ejecutar: node scripts/seedFirestore.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SEED_CATEGORIES = [
  { id: 'todos', nombre: 'Todos', icono: 'SquaresFour', orden: 0 },
  { id: 'academico', nombre: 'Académico', icono: 'GraduationCap', orden: 1 },
  { id: 'matricula', nombre: 'Matrícula', icono: 'CalendarCheck', orden: 2 },
  { id: 'becas', nombre: 'Becas', icono: 'CurrencyCircleDollar', orden: 3 },
  { id: 'eventos', nombre: 'Eventos', icono: 'Sparkle', orden: 4 },
  { id: 'pagos', nombre: 'Pagos', icono: 'CreditCard', orden: 5 },
];

const SEED_NOTICES = [
  {
    id: 'A-408',
    titulo: 'Cambio de aula urgente: Interacción Hombre-Máquina',
    categoria: 'academico',
    descripcion: 'La sesión de hoy (17:30 - 20:45 h) se traslada de Pabellón A a Aula A-408 (4to piso, ascensor disponible). Contará con intérprete de Lengua de Señas Peruana (LSP) y subtitulado en tiempo real.',
    fecha: 'Hoy',
    hora: '17:30 h',
    urgente: true,
    aula: 'A-408',
    pabellon: 'Pabellón A',
    lsp_disponible: true,
    cc_disponible: true,
    estado: 'vigente',
  },
  {
    id: 'EVAC-2026',
    titulo: 'Simulacro de Evacuación con Balizas Luminosas LED',
    categoria: 'eventos',
    descripcion: 'Hoy a las 18:30 h se activarán las balizas estroboscópicas seguras y paneles de guía visual en Pabellones A y B. Protocolo adaptado para estudiantes con discapacidad auditiva.',
    fecha: 'Hoy',
    hora: '18:30 h',
    urgente: true,
    aula: '',
    pabellon: 'Campus Central',
    lsp_disponible: true,
    cc_disponible: true,
    estado: 'vigente',
  },
  {
    id: 'BECA-2026',
    titulo: 'Convocatoria Beca Excelencia Académica 2026-1',
    categoria: 'becas',
    descripcion: 'Postulación abierta para estudiantes de tercio superior. Presenta tu expediente digital en el portal hasta el 30 de noviembre.',
    fecha: 'Ayer',
    hora: '10:00 h',
    urgente: false,
    lsp_disponible: false,
    cc_disponible: true,
    estado: 'vigente',
  },
  {
    id: 'MATR-2026',
    titulo: 'Cronograma de Matrícula 2026-1 por Orden de Mérito',
    categoria: 'matricula',
    descripcion: 'Consulta tu turno asignado según tu promedio ponderado acumulado. Soporte prioritario disponible mediante SAE UTP.',
    fecha: '18 Nov',
    hora: '09:00 h',
    urgente: false,
    lsp_disponible: true,
    cc_disponible: true,
    estado: 'vigente',
  },
  {
    id: 'PAGO-2026',
    titulo: 'Vencimiento de Cuota 4 del Ciclo Académico',
    categoria: 'pagos',
    descripcion: 'Evita recargos realizando el pago antes del 25 de noviembre mediante banca móvil o agencias autorizadas.',
    fecha: '15 Nov',
    hora: '08:00 h',
    urgente: false,
    lsp_disponible: false,
    cc_disponible: false,
    estado: 'vigente',
  },
];

async function run() {
  try {
    const admin = await import('firebase-admin');
    if (!admin.apps?.length) {
      admin.initializeApp();
    }
    const db = admin.firestore();
    const batch = db.batch();

    for (const cat of SEED_CATEGORIES) {
      batch.set(db.collection('categorias').doc(cat.id), cat);
    }
    for (const notice of SEED_NOTICES) {
      batch.set(db.collection('anuncios').doc(notice.id), notice);
    }

    await batch.commit();
    console.log(`Seed completado: ${SEED_CATEGORIES.length} categorías y ${SEED_NOTICES.length} avisos.`);
  } catch (err) {
    const outPath = path.join(__dirname, 'firestore-seed-export.json');
    fs.writeFileSync(outPath, JSON.stringify({ categorias: SEED_CATEGORIES, anuncios: SEED_NOTICES }, null, 2));
    console.warn('firebase-admin no configurado; se exportó el JSON de carga en:', outPath);
    console.warn('Detalle:', err.message);
  }
}

run();
