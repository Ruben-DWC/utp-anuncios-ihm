import type { Handler } from '@netlify/functions';

interface CompactNotice {
  id: string;
  titulo: string;
  categoria: string;
  urgente: boolean;
  aula?: string;
  pabellon?: string;
  lsp_disponible?: boolean;
  cc_disponible?: boolean;
}

interface HistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface AgentAction {
  type: 'filter' | 'highlight' | 'save' | 'info';
  payload: string | null;
}

const VALID_CATEGORIES = new Set(['todos', 'academico', 'matricula', 'becas', 'eventos', 'pagos']);

// Rate limiter en memoria por IP (máx 15 peticiones por minuto, Sección 8.2 del diseño)
const RATE_LIMIT_MAX = 15;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateLimitStore = new Map<string, number[]>();

function isRateLimited(clientIp: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimitStore.get(clientIp) || []).filter(
    (ts) => now - ts < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(clientIp, timestamps);
    return true;
  }
  timestamps.push(now);
  rateLimitStore.set(clientIp, timestamps);
  return false;
}

function sanitizeAction(action: unknown, notices: CompactNotice[]): AgentAction {
  if (!action || typeof action !== 'object') {
    return { type: 'info', payload: null };
  }
  const raw = action as { type?: unknown; payload?: unknown };
  const payload = raw.payload != null ? String(raw.payload).trim() : null;

  if (raw.type === 'filter' && payload && VALID_CATEGORIES.has(payload)) {
    return { type: 'filter', payload };
  }
  if ((raw.type === 'highlight' || raw.type === 'save') && payload) {
    if (notices.some((n) => n.id === payload || n.aula === payload)) {
      return { type: raw.type, payload };
    }
  }
  return { type: 'info', payload: null };
}

export const handler: Handler = async (event) => {
  const startTime = Date.now();

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  const clientIp =
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown';

  if (isRateLimited(clientIp)) {
    return {
      statusCode: 429,
      headers,
      body: JSON.stringify({
        error: 'Límite de consultas alcanzado (15 req/min). Activando contingencia local.',
        fallback: true,
      }),
    };
  }

  let query = '';
  let active_notices: CompactNotice[] = [];
  let history: HistoryTurn[] = [];
  let userName = 'Estudiante';

  try {
    const parsedBody = JSON.parse(event.body || '{}');
    query = String(parsedBody.query || '').trim().slice(0, 300);
    userName = String(parsedBody.userName || 'Estudiante').trim().slice(0, 60);
    const rawNotices = Array.isArray(parsedBody.active_notices) ? parsedBody.active_notices : [];
    const rawHistory = Array.isArray(parsedBody.history) ? parsedBody.history : [];

    history = rawHistory
      .slice(-6)
      .filter((h: any) => h && (h.role === 'user' || h.role === 'model') && typeof h.text === 'string')
      .map((h: any) => ({
        role: h.role,
        text: h.text.slice(0, 300),
      }));

    active_notices = rawNotices.slice(0, 15).map((n: any) => ({
      id: String(n.id || ''),
      titulo: String(n.titulo || '').substring(0, 80),
      categoria: String(n.categoria || 'todos'),
      urgente: Boolean(n.urgente),
      aula: n.aula ? String(n.aula).substring(0, 20) : undefined,
      pabellon: n.pabellon ? String(n.pabellon).substring(0, 30) : undefined,
      lsp_disponible: Boolean(n.lsp_disponible),
      cc_disponible: Boolean(n.cc_disponible),
    }));

    let serializedNotices = JSON.stringify(active_notices);
    if (serializedNotices.length > 4600) {
      active_notices = active_notices.slice(0, 8);
      serializedNotices = JSON.stringify(active_notices);
    }

    if (!query) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'El parámetro query es requerido.' }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const localResponse = generateLocalResponse(query, active_notices);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...localResponse,
          fallback: true,
          latency_ms: Date.now() - startTime,
        }),
      };
    }

    const systemPrompt = `Eres "Tutor Anuncios IA", asistente académico de la Universidad Tecnológica del Perú (UTP) atendiendo a ${userName}.
Índice de avisos vigentes (solo usa estos datos reales, nunca inventes fechas ni aulas):
${serializedNotices}

REGLAS OBLIGATORIAS:
1. Responde en español peruano formal e inclusivo, máximo 3 frases breves.
2. Si involucra traslado/aula, indica aula, pabellón y si tiene intérprete LSP/CC.
3. Si preguntan algo ajeno a la UTP o avisos, redirige amablemente al portal académico.
4. Responde EXCLUSIVAMENTE en JSON válido con:
   - "text": Respuesta al estudiante.
   - "emotion": "neutral" | "feliz" | "celebrando" | "disculpa".
   - "toolsUsed": lista corta de herramientas lógicas aplicadas (ej. ["buscar_avisos"]).
   - "action": { "type": "filter" | "highlight" | "save" | "info", "payload": id de aviso, categoría válida ("todos","academico","matricula","becas","eventos","pagos"), o null }.`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const contents = [
      ...history.map((turn) => ({
        role: turn.role,
        parts: [{ text: turn.text }],
      })),
      {
        role: 'user',
        parts: [{ text: `Consulta: "${query}"` }],
      },
    ];

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 260,
          responseSchema: {
            type: 'OBJECT',
            properties: {
              text: { type: 'STRING' },
              emotion: { type: 'STRING', enum: ['neutral', 'feliz', 'celebrando', 'disculpa'] },
              toolsUsed: { type: 'ARRAY', items: { type: 'STRING' } },
              action: {
                type: 'OBJECT',
                properties: {
                  type: { type: 'STRING', enum: ['filter', 'highlight', 'save', 'info'] },
                  payload: { type: 'STRING' },
                },
                required: ['type', 'payload'],
              },
            },
            required: ['text', 'action'],
          },
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!geminiRes.ok) {
      const fallbackData = generateLocalResponse(query, active_notices);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...fallbackData,
          fallback: true,
          latency_ms: Date.now() - startTime,
        }),
      };
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      const fallbackData = generateLocalResponse(query, active_notices);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          ...fallbackData,
          fallback: true,
          latency_ms: Date.now() - startTime,
        }),
      };
    }

    const sanitized = rawText.replace(/^```json\s*|\s*```$/gi, '').trim();
    const parsed = JSON.parse(sanitized);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: String(parsed.text || 'Consulta procesada.'),
        emotion: parsed.emotion || 'feliz',
        toolsUsed: Array.isArray(parsed.toolsUsed) ? parsed.toolsUsed : ['gemini_rag'],
        action: sanitizeAction(parsed.action, active_notices),
        fallback: false,
        latency_ms: Date.now() - startTime,
      }),
    };
  } catch {
    const fallbackData = generateLocalResponse(query, active_notices);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ...fallbackData,
        fallback: true,
        latency_ms: Date.now() - startTime,
      }),
    };
  }
};

function generateLocalResponse(
  query: string,
  notices: CompactNotice[]
): { text: string; action: AgentAction; toolsUsed: string[]; emotion: string } {
  const q = query.toLowerCase().trim();

  if (q.includes('guardar') || q.includes('favorito')) {
    const target = notices.find((n) => n.urgente) || notices[0];
    if (target) {
      return {
        text: `He guardado "${target.titulo}" en tus Favoritos para acceso rápido sin conexión.`,
        action: { type: 'save', payload: target.id },
        toolsUsed: ['guardar_favorito'],
        emotion: 'celebrando',
      };
    }
  }

  if (q.includes('seña') || q.includes('lsp') || q.includes('subt') || q.includes('accesib')) {
    const lsp = notices.filter((n) => n.lsp_disponible || n.cc_disponible);
    if (lsp.length > 0) {
      return {
        text: `Hay ${lsp.length} aviso(s) con intérprete LSP o subtítulos (CC), destacando "${lsp[0]!.titulo}".`,
        action: { type: 'highlight', payload: lsp[0]!.id },
        toolsUsed: ['filtrar_accesibles'],
        emotion: 'feliz',
      };
    }
  }

  if (q.includes('aula') || q.includes('ihm') || q.includes('cambio') || q.includes('donde') || q.includes('dónde')) {
    const notice = notices.find((n) => n.aula || n.titulo.toLowerCase().includes('ihm')) || notices[0];
    if (notice) {
      return {
        text: `${notice.titulo}${notice.aula ? ` en Aula ${notice.aula}` : ''}${notice.pabellon ? ` (${notice.pabellon})` : ''}.${notice.lsp_disponible ? ' Incluye intérprete LSP.' : ''}`,
        action: { type: 'highlight', payload: notice.id },
        toolsUsed: ['buscar_avisos'],
        emotion: 'feliz',
      };
    }
  }

  const catMap: Array<{ id: string; terms: string[] }> = [
    { id: 'becas', terms: ['beca', 'convocatoria', 'excelencia'] },
    { id: 'matricula', terms: ['matricula', 'matrícula', 'turno'] },
    { id: 'pagos', terms: ['pago', 'cuota', 'pension', 'pensión'] },
    { id: 'eventos', terms: ['evento', 'simulacro', 'taller'] },
  ];

  for (const c of catMap) {
    if (c.terms.some((t) => q.includes(t))) {
      const match = notices.find((n) => n.categoria === c.id);
      if (match) {
        return {
          text: `En ${c.id} destaca: "${match.titulo}". Aplico el filtro correspondiente en tu pantalla.`,
          action: { type: 'filter', payload: c.id },
          toolsUsed: ['filtrar_por_categoria'],
          emotion: 'feliz',
        };
      }
    }
  }

  return {
    text: `Revisé ${notices.length} avisos vigentes para "${query.substring(0, 40)}". Puedes consultar por aulas, becas, matrícula, pagos o avisos LSP.`,
    action: { type: 'info', payload: null },
    toolsUsed: ['resumen_avisos'],
    emotion: 'neutral',
  };
}
