import { CategoryId } from '@/types';
import { TabId } from '@/components/layout';

export type VoiceAction =
  | { type: 'navigate'; tab: TabId; label: string }
  | { type: 'open_tutor'; label: string }
  | { type: 'open_a11y'; label: string }
  | { type: 'open_notifications'; label: string }
  | { type: 'filter_category'; category: CategoryId; label: string }
  | { type: 'filter_a11y'; filter: 'all' | 'lsp' | 'cc' | 'urgent'; label: string }
  | { type: 'toggle_contrast'; enable: boolean; label: string }
  | { type: 'read_aloud'; label: string }
  | { type: 'stop_reading'; label: string }
  | { type: 'search'; query: string; label: string };

/**
 * Normaliza texto eliminando tildes y signos para reconocer comandos de voz en español.
 */
function normalizeSpeech(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Interpreta una transcripción de voz en español (Modalidad 3: Interfaces por voz)
 * y la convierte en una acción ejecutable dentro de UTP Anuncios.
 */
export function parseVoiceCommand(rawTranscript: string): VoiceAction {
  const text = normalizeSpeech(rawTranscript);

  // Lectura en voz alta (TTS)
  if (/(detener|parar|stop|silencio|callar)/.test(text)) {
    return { type: 'stop_reading', label: 'Lectura por voz detenida' };
  }
  if (/(leer|escuchar|reproducir).*(aviso|anuncio|comunicado|todo)/.test(text) || text === 'leer') {
    return { type: 'read_aloud', label: 'Leyendo avisos en voz alta' };
  }

  // Alto contraste AAA
  if (/(desactivar|apagar|quitar).*(contraste)/.test(text)) {
    return { type: 'toggle_contrast', enable: false, label: 'Alto contraste desactivado' };
  }
  if (/(activar|encender|modo).*(contraste)/.test(text)) {
    return { type: 'toggle_contrast', enable: true, label: 'Alto contraste AAA activado' };
  }

  // Modales y paneles principales
  if (/(tutor|asistente|chat|gemini|\bia\b)/.test(text)) {
    return { type: 'open_tutor', label: 'Abriendo Tutor IA' };
  }
  if (/(accesibilidad|ajustes visuales|destello)/.test(text)) {
    return { type: 'open_a11y', label: 'Abriendo Accesibilidad Sensorial' };
  }
  if (/(notificacion|alerta|campana)/.test(text)) {
    return { type: 'open_notifications', label: 'Abriendo Notificaciones' };
  }

  // Navegación entre pestañas
  if (/(perfil|carne|qr|cuenta)/.test(text)) {
    return { type: 'navigate', tab: 'perfil', label: 'Navegando a Mi Perfil' };
  }
  if (/(favorito|guardado)/.test(text)) {
    return { type: 'navigate', tab: 'favoritos', label: 'Navegando a Favoritos' };
  }
  if (/(inicio|home|principal)/.test(text)) {
    return { type: 'navigate', tab: 'inicio', label: 'Navegando a Inicio' };
  }

  // Filtros por categoría
  if (/\bbeca/.test(text)) {
    return { type: 'filter_category', category: 'becas', label: 'Filtrando: Becas' };
  }
  if (/\bmatricula/.test(text)) {
    return { type: 'filter_category', category: 'matricula', label: 'Filtrando: Matrícula' };
  }
  if (/\bpago/.test(text)) {
    return { type: 'filter_category', category: 'pagos', label: 'Filtrando: Pagos' };
  }
  if (/\bevento/.test(text)) {
    return { type: 'filter_category', category: 'eventos', label: 'Filtrando: Eventos' };
  }
  if (/\bacademico/.test(text)) {
    return { type: 'filter_category', category: 'academico', label: 'Filtrando: Académico' };
  }
  if (/(todos los avisos|mostrar todos|limpiar filtro)/.test(text)) {
    return { type: 'filter_category', category: 'todos', label: 'Mostrando todos los avisos' };
  }

  // Filtros de accesibilidad / urgencia
  if (/urgente/.test(text)) {
    return { type: 'filter_a11y', filter: 'urgent', label: 'Filtrando: Solo urgentes' };
  }
  if (/(senas|\blsp\b)/.test(text)) {
    return { type: 'filter_a11y', filter: 'lsp', label: 'Filtrando: Con Lengua de Señas (LSP)' };
  }
  if (/(subtitulo|\bcc\b)/.test(text)) {
    return { type: 'filter_a11y', filter: 'cc', label: 'Filtrando: Con Subtítulos' };
  }

  // Búsqueda por voz
  const cleanQuery = rawTranscript.replace(/^(buscar|busca|encuentra)\s+/i, '').trim();
  return {
    type: 'search',
    query: cleanQuery,
    label: `Buscando por voz: "${cleanQuery}"`,
  };
}

/**
 * Reproduce texto mediante Web Speech Synthesis API en español peruano (es-PE).
 */
export function speakText(text: string, onEnd?: () => void): boolean {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return false;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-PE';
  utterance.rate = 1.0;
  if (onEnd) {
    utterance.onend = onEnd;
    utterance.onerror = onEnd;
  }
  window.speechSynthesis.speak(utterance);
  return true;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
