import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json; charset=utf-8',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { query, active_notices } = JSON.parse(event.body || '{}');

    if (!query || typeof query !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Parámetro query es requerido' }) };
    }

    const apiKey = process.env.GEMINI_API_KEY;

    // Si no hay API key en variables de entorno, responder con flag de fallback para activar el motor local
    if (!apiKey) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          text: 'Atención: Modo local activado. ' + generateLocalResponse(query, active_notices || []),
          fallback: true,
        }),
      };
    }

    // Preparar el prompt estructurado para Google Gemini 2.0 Flash
    const systemPrompt = `Eres "Tutor Anuncios IA", un asistente académico inclusivo de la Universidad Tecnológica del Perú (UTP).
Tu objetivo es responder de manera concisa y empática a los estudiantes sobre comunicados, cambios de aula, horarios, avisos con Lengua de Señas Peruana (LSP) y convocatorias.
Debes basarte estrictamente en la lista de avisos vigentes proporcionada a continuación:
${JSON.stringify(active_notices || [], null, 2)}

Reglas obligatorias:
1. Responde en español formal pero cercano, en un máximo de 3 frases.
2. Si la consulta se relaciona con un cambio de aula o traslado, menciona explícitamente el pabellón, aula e información de accesibilidad (como intérprete LSP).
3. Devuelve tu respuesta EXCLUSIVAMENTE en formato JSON con la siguiente estructura:
{
  "text": "Tu respuesta directa al estudiante",
  "action": {
    "type": "filter" | "highlight" | "info",
    "payload": "academico" | "becas" | "matricula" | "eventos" | "pagos" | null
  }
}`;

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const geminiRes = await fetch(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              { text: systemPrompt },
              { text: `Consulta del estudiante: "${query.substring(0, 300)}"` },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      }),
    });

    if (!geminiRes.ok) {
      // Si la API externa da error, utilizar el motor de contingencia local
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          text: generateLocalResponse(query, active_notices || []),
          fallback: true,
        }),
      };
    }

    const geminiData = await geminiRes.json();
    const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          text: generateLocalResponse(query, active_notices || []),
          fallback: true,
        }),
      };
    }

    // Sanitizar y parsear JSON
    const sanitized = rawText.replace(/^```json\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(sanitized);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        text: 'He revisado tu consulta. Por favor revisa la categoría Académico para ver los últimos cambios de aula y alertas de examen.',
        fallback: true,
      }),
    };
  }
};

function generateLocalResponse(query: string, notices: any[]): string {
  const q = query.toLowerCase();
  if (q.includes('aula') || q.includes('ihm') || q.includes('cambio')) {
    return 'Tu clase de Interacción Hombre-Máquina de hoy fue trasladada al Aula A-408 (Pabellón A, 4to piso) con soporte de intérprete de señas LSP.';
  }
  if (q.includes('beca')) {
    return 'La Convocatoria Beca Excelencia Académica 2026-1 está abierta para alumnos de tercio superior hasta el 30 de noviembre.';
  }
  if (q.includes('seña') || q.includes('lsp')) {
    return 'Los comunicados con intérprete de Lengua de Señas Peruana (LSP) disponibles son el cambio de aula en A-408 y el simulacro de evacuación adaptado.';
  }
  return `No encontré un comunicado específico para "${query}". Revisa los avisos vigentes en las categorías de Inicio.`;
}
