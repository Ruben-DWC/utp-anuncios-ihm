import { OperationalStateCode } from '../types';

export interface StateItemData {
  code: OperationalStateCode;
  group: 'vacio' | 'carga' | 'error' | 'seguridad' | 'exito';
  name: string;
  badge: string;
  screen: string;
  caseOfUse: string;
  visualSignal: string;
  title: string;
  description: string;
  primaryAction: {
    label: string;
    actionKey: string;
  };
  secondaryAction?: {
    label: string;
    actionKey: string;
  };
  extra?: {
    tips?: string[];
    contextTag?: string;
    cachedInfo?: string;
    saeContact?: string;
    fieldErrors?: Array<{ field: string; value: string; error: string }>;
    alternativeNotices?: Array<{ id: string; titulo: string; categoria: string; fecha: string }>;
    pendingActionNote?: string;
    constanciaCode?: string;
    recordatorioInfo?: string;
  };
  wcagCompliance: string;
}

export const CATALOG_STATES: Record<OperationalStateCode, StateItemData> = {
  'E-01': {
    code: 'E-01',
    group: 'vacio',
    name: 'Vacío Inicial',
    badge: 'E-01 • Vacío Inicial (Obligatorio)',
    screen: 'Mis favoritos (Pestaña Favoritos)',
    caseOfUse: 'El estudiante accede por primera vez a «Mis favoritos» y tiene 0 anuncios guardados.',
    visualSignal: 'Ícono de marcador institucional con signo «+» en contenedor suave.',
    title: 'Aún no tienes anuncios favoritos',
    description: 'Guarda aquí los comunicados importantes de matrícula, becas o cambios de aula tocando el ícono de marcador en cualquier aviso para tenerlos siempre a mano.',
    primaryAction: {
      label: 'Explorar anuncios vigentes',
      actionKey: 'explore_notices'
    },
    secondaryAction: {
      label: 'Ir a Categorías académicas →',
      actionKey: 'go_categories'
    },
    wcagCompliance: 'WCAG 2.2 AA/AAA: Contraste de texto > 4.5:1, botón con área táctil >= 48px y navegación permanente accesible.'
  },
  'E-02': {
    code: 'E-02',
    group: 'vacio',
    name: 'Vacío por Búsqueda',
    badge: 'E-02 • Vacío por búsqueda',
    screen: 'Resultados de búsqueda (Flujo de Filtros)',
    caseOfUse: 'El estudiante busca «beca movilidad 2027» con los filtros «Becas» y «Últimos 7 días» sin obtener coincidencias.',
    visualSignal: 'Ícono de lupa con guion y chips de filtros activos visibles.',
    title: 'No encontramos anuncios',
    description: 'No hay comunicados que coincidan con "beca movilidad 2027" bajo los filtros seleccionados.',
    primaryAction: {
      label: 'Limpiar búsqueda y filtros',
      actionKey: 'clear_search'
    },
    secondaryAction: {
      label: 'Ver todos los anuncios vigentes',
      actionKey: 'view_all'
    },
    extra: {
      tips: [
        'Revisar la ortografía de los términos ingresados',
        'Usar términos más generales (ej: "beca" en lugar de código completo)',
        'Remover el filtro de fecha de los últimos 7 días'
      ]
    },
    wcagCompliance: 'WCAG 2.2: aria-live="polite" informando 0 resultados sin reload destructivo de pantalla.'
  },
  'E-03': {
    code: 'E-03',
    group: 'vacio',
    name: 'Vacío por Historial',
    badge: 'E-03 • Vacío por historial',
    screen: 'Notificaciones (Historial de alertas)',
    caseOfUse: 'Estudiante cachimbo de primer ciclo con cuenta recién activada que aún no registra alertas leídas ni avisos pasados.',
    visualSignal: 'Ícono de campana con insignia institucional y tarjeta de bienvenida a su sede.',
    title: 'Sin actividad previa en tu historial',
    description: 'Como eres nuevo en UTP Anuncios, aún no registras alertas leídas ni recordatorios pasados. Recibirás avisos clave según tu carrera y sede asignada.',
    primaryAction: {
      label: 'Configurar mis preferencias de alertas',
      actionKey: 'open_preferences'
    },
    secondaryAction: {
      label: 'Explorar comunicados de bienvenida',
      actionKey: 'explore_welcome'
    },
    extra: {
      contextTag: 'Sede Lima Centro • Ingeniería de Sistemas e Informática'
    },
    wcagCompliance: 'WCAG 2.2: Orientación al usuario sin jerga técnica y reducción del golfo de ejecución.'
  },
  'E-04': {
    code: 'E-04',
    group: 'carga',
    name: 'Carga con Esqueleto (Skeleton)',
    badge: 'E-04 • Carga con Skeleton (Obligatorio)',
    screen: 'Categoría Académico (Listado por categoría)',
    caseOfUse: 'El estudiante entra a la categoría Académico mientras se sincronizan los horarios y comunicados del ciclo en curso.',
    visualSignal: 'Skeleton UI animado del buscador, selector de ciclo y 3 tarjetas estructurales.',
    title: 'Actualizando comunicados académicos del ciclo...',
    description: 'Sincronizando horarios, matrículas y aulas asignadas directamente con el servidor UTP.',
    primaryAction: {
      label: 'Cancelar y ver anuncios guardados sin conexión',
      actionKey: 'view_offline'
    },
    wcagCompliance: 'WCAG 2.2: aria-busy="true" con anticipación de estructura espacial, evitando saltos de layout (CLS).'
  },
  'E-05': {
    code: 'E-05',
    group: 'error',
    name: 'Error de Conexión (Offline)',
    badge: 'E-05 • Error de Conexión (Obligatorio)',
    screen: 'Detalle del anuncio',
    caseOfUse: 'El estudiante pierde la señal Wi-Fi o datos móviles al intentar abrir «Matrícula del próximo ciclo» y su guía PDF.',
    visualSignal: 'Ícono de Wi-Fi tachado en contenedor de alerta con indicador de caché.',
    title: 'Sin conexión a internet',
    description: 'Tu dispositivo perdió el acceso a la red Wi-Fi o datos móviles y no pudimos sincronizar el anuncio completo. Conservamos tu resumen seguro en el dispositivo.',
    primaryAction: {
      label: '↻ Reintentar cargar el anuncio',
      actionKey: 'retry_notice'
    },
    secondaryAction: {
      label: 'Ver mis favoritos disponibles sin conexión',
      actionKey: 'view_offline_favorites'
    },
    extra: {
      cachedInfo: 'Resumen guardado en caché local (Última sync: Hoy 10:30 AM)'
    },
    wcagCompliance: 'WCAG 1.4.1 y 3.3.1: No depende únicamente del color; mensaje claro con opción de recuperación inmediata.'
  },
  'E-06': {
    code: 'E-06',
    group: 'error',
    name: 'Error del Sistema (500)',
    badge: 'E-06 • Error del Sistema (Obligatorio)',
    screen: 'Todos los anuncios (Feed principal)',
    caseOfUse: 'Caída temporal o saturación del servidor central de comunicados UTP durante fechas pico de matrícula.',
    visualSignal: 'Ícono de servidor con insignia de advertencia en círculo #FEF2F2.',
    title: 'El servicio no responde ahora',
    description: 'Te pedimos disculpas. Estamos presentando un inconveniente temporal en los servidores de la plataforma. Tus datos y favoritos están a salvo.',
    primaryAction: {
      label: '↻ Reintentar cargar anuncios',
      actionKey: 'retry_feed'
    },
    secondaryAction: {
      label: 'Contactar a Soporte SAE UTP',
      actionKey: 'contact_sae'
    },
    extra: {
      saeContact: 'Atención SAE UTP: sae@utp.edu.pe | WhatsApp SAE: (+51) 922 249 080'
    },
    wcagCompliance: 'WCAG 3.3.3: Explicación transparente sin exponer excepciones internas ni números 500/503.'
  },
  'E-07': {
    code: 'E-07',
    group: 'error',
    name: 'Error de Validación (Login)',
    badge: 'E-07 • Error de validación (Formulario)',
    screen: 'Iniciar sesión (Autenticación UTP)',
    caseOfUse: 'El estudiante ingresa un correo externo (@gmail.com en lugar de @utp.edu.pe) y una contraseña de 4 dígitos.',
    visualSignal: 'Borde #B50E30 e ícono de alerta dentro de cada campo con mensaje explícito al costado.',
    title: 'Verifica los datos ingresados',
    description: 'Para acceder al portal debes usar tus credenciales de correo institucional activo de la UTP.',
    primaryAction: {
      label: 'Iniciar sesión institucional',
      actionKey: 'submit_login'
    },
    secondaryAction: {
      label: '¿Olvidaste tu contraseña?',
      actionKey: 'forgot_password'
    },
    extra: {
      fieldErrors: [
        {
          field: 'Correo institucional',
          value: 'u22224908@gmail.com',
          error: '✕ El correo debe terminar en @utp.edu.pe (Ej: u22224908@utp.edu.pe)'
        },
        {
          field: 'Contraseña de estudiante',
          value: '••••',
          error: '✕ Mínimo 8 caracteres requeridos'
        }
      ]
    },
    wcagCompliance: 'WCAG 3.3.1 y 3.3.2: Error asociado por id de accesibilidad y foco programático al corregir.'
  },
  'E-08': {
    code: 'E-08',
    group: 'error',
    name: 'Contenido No Disponible',
    badge: 'E-08 • Contenido no disponible',
    screen: 'Detalle del anuncio',
    caseOfUse: 'El estudiante abre desde un enlace antiguo el comunicado «Taller de Verano 2026-0» cuya convocatoria ya concluyó.',
    visualSignal: 'Ícono de archivo cerrado con sello «CONVOCATORIA CERRADA» y tarjetas de alternativas vigentes.',
    title: 'Este anuncio ya no está disponible',
    description: 'El comunicado "Taller de Verano 2026-0" fue retirado porque su plazo de inscripción ha finalizado. Te mostramos alternativas vigentes de tu interés:',
    primaryAction: {
      label: 'Avisarme cuando abra una nueva convocatoria',
      actionKey: 'subscribe_alert'
    },
    secondaryAction: {
      label: 'Explorar todos los anuncios vigentes',
      actionKey: 'view_all'
    },
    extra: {
      alternativeNotices: [
        {
          id: 'alt-1',
          titulo: 'Convocatoria Beca Continuidad 2026-1',
          categoria: 'becas',
          fecha: '20 Nov 2026'
        },
        {
          id: 'alt-2',
          titulo: 'Inscripción a Talleres de Habilidades Blandas 2026-1',
          categoria: 'eventos',
          fecha: '19 Nov 2026'
        }
      ]
    },
    wcagCompliance: 'WCAG 2.2: Prevención de callejones sin salida (Dead Ends) mediante recomendaciones inmediatas.'
  },
  'E-09': {
    code: 'E-09',
    group: 'seguridad',
    name: 'Sin Permisos / Sesión Expirada',
    badge: 'E-09 • Sin permisos / Sesión expirada',
    screen: 'Seguridad de la cuenta / Detalle',
    caseOfUse: 'El estudiante intenta descargar la guía oficial de matrícula tras un periodo prolongado de inactividad con la sesión vencida.',
    visualSignal: 'Ícono institucional de candado de seguridad en círculo de alerta.',
    title: 'Tu sesión institucional expiró',
    description: 'Por tu seguridad y la protección de tus datos académicos, cerramos la sesión tras varios días de inactividad.',
    primaryAction: {
      label: 'Iniciar sesión con mi cuenta UTP',
      actionKey: 'relogin'
    },
    secondaryAction: {
      label: 'Volver a avisos públicos de portada',
      actionKey: 'go_home'
    },
    extra: {
      pendingActionNote: 'Conservamos tu solicitud: La descarga del archivo "Cronograma_Matricula_2026_1.pdf" iniciará automáticamente una vez autenticado.'
    },
    wcagCompliance: 'WCAG 2.2.5 Re-authenticating: Preserva el estado transaccional para continuar sin reiniciar el flujo.'
  },
  'E-10': {
    code: 'E-10',
    group: 'exito',
    name: 'Éxito / Confirmación',
    badge: 'E-10 • Éxito / Constancia (Confirmación)',
    screen: 'Detalle del anuncio',
    caseOfUse: 'El estudiante confirma la lectura del anuncio de matrícula y lo guarda en sus favoritos y recordatorios.',
    visualSignal: 'Check verde (#15803D) en banner Toast superior y tarjeta central con código de constancia.',
    title: '¡Anuncio guardado y lectura confirmada!',
    description: 'Tu confirmación oficial fue registrada con éxito en el sistema universitario.',
    primaryAction: {
      label: 'Ir a Mis Favoritos (1 guardado)',
      actionKey: 'go_favorites'
    },
    secondaryAction: {
      label: 'Explorar más anuncios de Académico',
      actionKey: 'go_academic'
    },
    extra: {
      constanciaCode: '#UTP-2026-42920',
      recordatorioInfo: 'Recordatorio programado: Notificación push y correo UTP 24 horas antes del inicio del proceso.'
    },
    wcagCompliance: 'WCAG 4.1.3 Status Messages: Confirmación no invasiva, accesible a tecnologías de asistencia.'
  }
};
