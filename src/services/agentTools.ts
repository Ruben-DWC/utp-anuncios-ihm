import { Notice, CategoryId, AgentAction } from '@/types';

const VALID_CATEGORIES: CategoryId[] = ['todos', 'academico', 'matricula', 'becas', 'eventos', 'pagos'];

export interface AgentToolResult {
  text: string;
  action: AgentAction;
  toolsUsed: string[];
  emotion: 'neutral' | 'feliz' | 'celebrando' | 'disculpa';
}

const UTP_FAQ_TOPICS: Array<{ keywords: string[]; answer: string; category?: CategoryId }> = [
  {
    keywords: ['sae', 'mesa de ayuda', 'contacto', 'soporte', 'atencion', 'atención'],
    answer:
      'El Servicio de Atención al Estudiante (SAE UTP) atiende consultas de trámites y claves en sae@utp.edu.pe o mediante el Portal del Estudiante.',
  },
  {
    keywords: ['horario', 'hora', 'atencion presencial', 'pabellon', 'ascensor'],
    answer:
      'Los pabellones académicos cuentan con ascensores operativos y señalética accesible; puedes verificar el aula exacta en cada comunicado vigente.',
  },
  {
    keywords: ['clave', 'contraseña', 'recuperar', 'olvid'],
    answer:
      'Si olvidaste tu clave institucional (@utp.edu.pe), puedes usar la opción "¿Olvidaste tu clave?" en la pantalla de inicio de sesión o escribir a sae@utp.edu.pe.',
  },
];

/**
 * Valida y normaliza una directiva de UI devuelta por el LLM o el motor local.
 */
export function sanitizeAgentAction(action: unknown, notices: Notice[]): AgentAction {
  if (!action || typeof action !== 'object') {
    return { type: 'info', payload: null };
  }
  const raw = action as { type?: unknown; payload?: unknown };
  const payloadStr = raw.payload != null ? String(raw.payload).trim() : null;

  if (raw.type === 'filter' && payloadStr && VALID_CATEGORIES.includes(payloadStr as CategoryId)) {
    return { type: 'filter', payload: payloadStr };
  }
  if ((raw.type === 'highlight' || raw.type === 'save') && payloadStr) {
    const exists = notices.some((n) => n.id === payloadStr || n.aula === payloadStr);
    if (exists) {
      return { type: raw.type, payload: payloadStr };
    }
  }
  return { type: 'info', payload: null };
}

/**
 * Motor local de herramientas de solo lectura sobre los avisos reales en memoria/Firestore.
 * Evita respuestas hardcodeadas y sirve tanto como modo demo local como contingencia offline.
 */
export function runLocalAgentTools(query: string, notices: Notice[]): AgentToolResult {
  const q = query.toLowerCase().trim();
  const activeNotices = notices.filter((n) => n.estado !== 'cerrado');

  // Tool 1: Guardar en favoritos
  if (q.includes('guardar') || q.includes('favorito') || q.includes('recordar')) {
    const target = activeNotices.find((n) => n.urgente) || activeNotices[0];
    if (target) {
      return {
        text: `He guardado "${target.titulo}" en tus Favoritos para que puedas consultarlo incluso sin conexión.`,
        action: { type: 'save', payload: target.id },
        toolsUsed: ['guardar_favorito'],
        emotion: 'celebrando',
      };
    }
  }

  // Tool 2: Filtrar accesibilidad (LSP / CC)
  if (q.includes('seña') || q.includes('lsp') || q.includes('subt') || q.includes('cc') || q.includes('accesib')) {
    const lspNotices = activeNotices.filter((n) => n.lsp_disponible || n.cc_disponible);
    if (lspNotices.length > 0) {
      const titles = lspNotices.slice(0, 2).map((n) => `"${n.titulo}"`).join(' y ');
      return {
        text: `Encontré ${lspNotices.length} avisos vigentes con soporte de Lengua de Señas (LSP) o subtítulos (CC), incluyendo ${titles}.`,
        action: { type: 'highlight', payload: lspNotices[0]!.id },
        toolsUsed: ['filtrar_accesibles'],
        emotion: 'feliz',
      };
    }
  }

  // Tool 3: Buscar por aula, curso o urgencia
  if (q.includes('aula') || q.includes('ihm') || q.includes('cambio') || q.includes('urgente') || q.includes('donde') || q.includes('dónde')) {
    const matched =
      activeNotices.find(
        (n) =>
          n.titulo.toLowerCase().includes('ihm') ||
          n.titulo.toLowerCase().includes('aula') ||
          Boolean(n.aula && q.includes(n.aula.toLowerCase()))
      ) || activeNotices.find((n) => n.urgente);

    if (matched) {
      const loc = [matched.aula ? `Aula ${matched.aula}` : '', matched.pabellon || '']
        .filter(Boolean)
        .join(' • ');
      const lspNote = matched.lsp_disponible ? ' Cuenta con intérprete LSP.' : '';
      return {
        text: `${matched.titulo}${loc ? ` (${loc})` : ''}: ${matched.descripcion.slice(0, 120)}${matched.descripcion.length > 120 ? '...' : ''}${lspNote}`,
        action: { type: 'highlight', payload: matched.id },
        toolsUsed: ['buscar_avisos'],
        emotion: 'feliz',
      };
    }
  }

  // Tool 4: Filtrar por categoría temática
  const categoryKeywords: Array<{ id: CategoryId; terms: string[] }> = [
    { id: 'becas', terms: ['beca', 'convocatoria', 'excelencia', 'credito', 'crédito'] },
    { id: 'matricula', terms: ['matricula', 'matrícula', 'turno', 'inscrip'] },
    { id: 'pagos', terms: ['pago', 'cuota', 'vence', 'pension', 'pensión', 'boleta'] },
    { id: 'eventos', terms: ['evento', 'simulacro', 'taller', 'feria', 'conferencia'] },
    { id: 'academico', terms: ['academico', 'académico', 'clase', 'examen', 'silabo', 'sílabo'] },
  ];

  for (const cat of categoryKeywords) {
    if (cat.terms.some((t) => q.includes(t))) {
      const catNotices = activeNotices.filter((n) => n.categoria === cat.id);
      if (catNotices.length > 0) {
        return {
          text: `Hay ${catNotices.length} aviso(s) en ${cat.id}: "${catNotices[0]!.titulo}" (${catNotices[0]!.fecha}). Aplico el filtro para que los revises.`,
          action: { type: 'filter', payload: cat.id },
          toolsUsed: ['filtrar_por_categoria'],
          emotion: 'feliz',
        };
      }
    }
  }

  // Tool 5: Búsqueda libre por palabras clave sobre títulos y descripciones
  const words = q.split(/\s+/).filter((w) => w.length >= 4);
  if (words.length > 0) {
    const found = activeNotices.find((n) =>
      words.some(
        (w) =>
          n.titulo.toLowerCase().includes(w) ||
          n.descripcion.toLowerCase().includes(w) ||
          (n.pabellon && n.pabellon.toLowerCase().includes(w))
      )
    );
    if (found) {
      return {
        text: `Encontré este aviso relacionado: "${found.titulo}" (${found.fecha}). Pulsa para ver el detalle completo.`,
        action: { type: 'highlight', payload: found.id },
        toolsUsed: ['buscar_avisos'],
        emotion: 'feliz',
      };
    }
  }

  // Tool 6: FAQ institucional UTP
  const faqMatch = UTP_FAQ_TOPICS.find((item) => item.keywords.some((k) => q.includes(k)));
  if (faqMatch) {
    return {
      text: faqMatch.answer,
      action: { type: 'info', payload: null },
      toolsUsed: ['faq_utp'],
      emotion: 'neutral',
    };
  }

  return {
    text: `Tengo ${activeNotices.length} comunicados vigentes indexados. Puedes preguntarme por cambios de aula, avisos con intérprete LSP, becas, matrícula o pagos.`,
    action: { type: 'info', payload: null },
    toolsUsed: ['resumen_avisos'],
    emotion: 'neutral',
  };
}
