export type CategoryId = 'todos' | 'academico' | 'matricula' | 'becas' | 'eventos' | 'pagos';

export interface UserProfile {
  id: string;
  name: string;
  code: string;
  email: string;
  campus: string;
  career: string;
  cycle: string;
  tag?: string;
}

export interface Category {
  id: CategoryId;
  nombre: string;
  icono: string;
  orden: number;
}

export type OperationalStateCode = 
  | 'E-01' // Vacío inicial (Mis favoritos)
  | 'E-02' // Vacío por búsqueda (0 resultados)
  | 'E-03' // Vacío por historial (Bienvenida sin alertas previas)
  | 'E-04' // Carga con esqueleto (Skeleton UI con aria-busy)
  | 'E-05' // Error de conexión (Offline con caché y reintento)
  | 'E-06' // Error del sistema (Fallo 500 con contacto a SAE UTP)
  | 'E-07' // Error de validación (Login @utp.edu.pe y clave)
  | 'E-08' // Contenido no disponible (Convocatoria cerrada)
  | 'E-09' // Sin permisos (Sesión expirada con retención)
  | 'E-10';// Éxito / Confirmación (Aviso guardado con constancia)

export interface Notice {
  id: string;
  titulo: string;
  categoria: CategoryId;
  descripcion: string;
  fecha: string;
  hora?: string;
  urgente: boolean;
  aula?: string;
  pabellon?: string;
  lsp_disponible: boolean;      // Lengua de Señas Peruana
  cc_disponible: boolean;       // Closed Captioning / Subtítulos
  estado: 'vigente' | 'cerrado';
  leido?: boolean;
}

export interface StateCatalogItem {
  codigo: OperationalStateCode;
  nombre: string;
  pantallaAsociada: string;
  casoDeUso: string;
  tituloMensaje: string;
  descripcionMensaje: string;
  accionPrimariaTexto: string;
  accionSecundariaTexto?: string;
  tipoIcono: 'bookmark' | 'search' | 'bell' | 'skeleton' | 'wifi-slash' | 'server-slash' | 'shield-slash' | 'archive' | 'lock' | 'check-circle';
}

export interface AccessibilityPreferences {
  fontScale: number;            // 1.0 a 1.5
  highContrast: boolean;
  strobeAlertEnabled: boolean;  // Destello visual (<= 2.0 Hz)
  hapticFeedbackEnabled: boolean;// Vibración o micro-sacudida + audio 60Hz
  screenReaderOptimized: boolean;
}

export interface AgentAction {
  type: 'filter' | 'highlight' | 'save' | 'info';
  payload: string | null;
}

export interface AgentRequest {
  query: string;
  userName?: string;
  history?: Array<{ role: 'user' | 'model'; text: string }>;
  active_notices: Array<{
    id: string;
    titulo: string;
    categoria: string;
    urgente: boolean;
    aula?: string;
    pabellon?: string;
    lsp_disponible?: boolean;
    cc_disponible?: boolean;
  }>;
}

export interface AgentResponse {
  text: string;
  action?: AgentAction;
  emotion?: 'neutral' | 'feliz' | 'celebrando' | 'disculpa';
  toolsUsed?: string[];
  fallback?: boolean;
  fallbackReason?: string;
  latency_ms?: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  action?: AgentAction;
  matchedNotice?: Notice;
}
