import type { Handler } from '@netlify/functions';

interface CompactNotice {
  id: string;
  titulo: string;
  categoria: string;
  urgente: boolean;
  aula?: string;
  pabellon?: string;
  lsp_disponible?: boolean;
}

interface AgentAction {
  type: 'filter' | 'highlight' | 'save' | 'info';
  payload: string | null;
}

interface AgentStructuredResponse {
  text: string;
  action: AgentAction;
  fallback?: boolean;
  latency_ms?: number;
}

export const handler: Handler = async (event) => {
  const startTime = Date.now();

  // Encabezados CORS y respuesta JSON
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

  let query = '';
  let active_notices: CompactNotice[] = [];

  try {
    const parsedBody = JSON.parse(event.body || '{}');
    query = (parsedBody.query || '').trim();
    const rawNotices = Array.isArray(parsedBody.active_notices) ? parsedBody.active_notices : [];

    // RESTRICCIÓN DE CARGA ÚTIL: Acotado a máx 15 avisos e índice compacto < 5 KB
    active_notices = rawNotices.slice(0, 15).map((n: any) => ({
      id: String(n.id || ''),
      titulo: String(n.titulo || '').substring(0, 80),
      categoria: String(n.categoria || 'todos'),
      urgente: Boolean(n.urgente),
      aula: n.aula ? String(n.aula).substring(0, 20) : undefined,
      pabellon: n.pabellon ? String(n.pabellon).substring(0, 30) : undefined,
      lsp_disponible: Boolean(n.lsp_disponible),
    }));

    // Asegurar que el string JSON de avisos no supere los 4.5 KB defensivamente
    let serializedNotices = JSON.stringify(active_notices);
    if (serializedNotices.length > 4600) {
      active_notices = active_notices.slice(0, 8);
      serializedNotices = JSON.stringify(active_notices);
    }

    if (!query) {
      return { 
        statusCode: 400, 
        headers, 
        body: JSON.stringify({ error: 'El parámetro query es requerido.' }) 
      };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API key en el entorno, activar respuesta inmediata del motor local (<5ms)
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

    // System Prompt optimizado para máxima brevedad y directivas estructuradas
    const systemPrompt = `Eres "Tutor Anuncios IA", asistente académico de la Universidad Tecnológica del Perú (UTP).
Responde a consultas de estudiantes sobre cambios de aula, horarios, avisos con Lengua de Señas Peruana (LSP), becas y pagos.
Índice de avisos vigentes:
${serializedNotices}

REGLAS OBLIGATORIAS:
1. Máximo 2 a 3 frases empáticas y directas en español formal institucional.
2. Si la consulta involucra un cambio de aula o traslado, especifica aula, pabellón e intérprete LSP.
3. Responde EXCLUSIVAMENTE con el objeto JSON según el esquema:
   - "text": Respuesta directa al estudiante.
   - "action": Objeto con "type" ("filter" | "highlight" | "save" | "info") y "payload" (id de aviso, nombre de categoría "academico"|"becas"|"matricula"|"eventos"|"pagos"|"todos", o null).`;

    // Conexión REST directa a Gemini 2.0 Flash optimizada para latencia < 1.5s
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5s timeout defensivo edge

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: `Consulta: "${query.substring(0, 250)}"` }],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
          maxOutputTokens: 220,
          responseSchema: {
            type: 'OBJECT',
            properties: {
              text: { type: 'STRING' },
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
      // Fallback local ante degradación del proveedor externo
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

    // Sanitizar y verificar JSON
    const sanitized = rawText.replace(/^```json\s*|\s*```$/gi, '').trim();
    const parsed: AgentStructuredResponse = JSON.parse(sanitized);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: parsed.text || 'Consulta procesada.',
        action: parsed.action || { type: 'info', payload: null },
        fallback: false,
        latency_ms: Date.now() - startTime,
      }),
    };
  } catch (_err) {
    // Resiliencia local ante cualquier excepción de red o parsing
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

/**
 * Motor semántico de contingencia local de alta velocidad (<1ms)
 * Garantiza respuestas estructuradas con directivas de UI incluso sin conexión
 */
function generateLocalResponse(query: string, notices: CompactNotice[]): { text: string; action: AgentAction } {
  const q = query.toLowerCase().trim();

  // Caso 1: Consulta de cambio de aula / curso IHM
  if (q.includes('aula') || q.includes('ihm') || q.includes('cambio') || q.includes('donde') || q.includes('dónde')) {
    const notice = notices.find((n) => n.aula || n.titulo.toLowerCase().includes('aula') || n.titulo.toLowerCase().includes('ihm'));
    const aulaStr = notice?.aula || 'A-408';
    const noticeId = notice?.id || 'A-408';
    return {
      text: `Tu clase de Interacción Hombre-Máquina de hoy fue trasladada al Aula ${aulaStr} (Pabellón A, 4to piso) con soporte de intérprete de señas LSP.`,
      action: {
        type: 'highlight',
        payload: noticeId,
      },
    };
  }

  // Caso 2: Lengua de señas peruana (LSP) / Accesibilidad
  if (q.includes('seña') || q.includes('lsp') || q.includes('accesib') || q.includes('discapacidad')) {
    return {
      text: 'Los comunicados con intérprete de Lengua de Señas Peruana (LSP) activos corresponden al cambio de aula en A-408 y el simulacro adaptado.',
      action: {
        type: 'filter',
        payload: 'todos',
      },
    };
  }

  // Caso 3: Becas y convocatorias
  if (q.includes('beca') || q.includes('convocatoria') || q.includes('excelencia') || q.includes('credito')) {
    return {
      text: 'La Convocatoria Beca Excelencia Académica 2026-1 está abierta para alumnos de tercio superior hasta el 30 de noviembre.',
      action: {
        type: 'filter',
        payload: 'becas',
      },
    };
  }

  // Caso 4: Matrícula y turnos
  if (q.includes('matricula') || q.includes('matrícula') || q.includes('turno') || q.includes('inscrip')) {
    return {
      text: 'El cronograma de matrícula 2026-1 por promedio ponderado ha sido publicado. Revisa tu turno asignado en el portal.',
      action: {
        type: 'filter',
        payload: 'matricula',
      },
    };
  }

  // Caso 5: Pagos, cuotas o pensiones
  if (q.includes('pago') || q.includes('cuota') || q.includes('pension') || q.includes('pensión') || q.includes('banco')) {
    return {
      text: 'El vencimiento de la Cuota 4 del ciclo sin recargos es el 25 de noviembre mediante banca por internet o presencial.',
      action: {
        type: 'filter',
        payload: 'pagos',
      },
    };
  }

  // Caso 6: Guardar / Favoritos
  if (q.includes('guardar') || q.includes('favorito') || q.includes('recordar')) {
    return {
      text: 'He registrado la directiva para guardar el aviso prioritario en tu panel de favoritos con constancia oficial.',
      action: {
        type: 'save',
        payload: notices[0]?.id || 'A-408',
      },
    };
  }

  // Caso por defecto
  return {
    text: `He revisado los avisos vigentes para "${query.substring(0, 40)}". Puedes explorar las categorías en el menú superior o consultar por aulas y becas.`,
    action: {
      type: 'info',
      payload: null,
    },
  };
}
