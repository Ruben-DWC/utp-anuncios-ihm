import React, { useState } from 'react';
import { OperationalStateCode } from '@/types';
import {
  BookmarkSimple,
  MagnifyingGlass,
  Bell,
  Sparkle,
  ArrowsClockwise,
  WifiSlash,
  WarningCircle,
  WarningOctagon,
  LockKey,
  ShieldCheck,
  CheckCircle,
  Archive,
  EnvelopeSimple,
  Phone,
  FilePdf,
  X,
  CaretRight,
  UserCheck,
  House,
  SquaresFour
} from '@phosphor-icons/react';

export interface CatalogStateViewProps {
  stateCode: OperationalStateCode;
  onExit: () => void;
  onNavigate?: (tab: 'inicio' | 'anuncios' | 'favoritos' | 'perfil' | 'categorias' | 'buscar') => void;
  onOpenNotice?: (noticeId: string) => void;
  onConfigureAlerts?: () => void;
}

export const AP3_STATE_METADATA: Record<OperationalStateCode, {
  code: OperationalStateCode;
  nombre: string;
  tipo: 'Vacío' | 'Carga' | 'Error' | 'Seguridad' | 'Confirmación';
  pantalla: string;
  casoDeUso: string;
  componente1: string; // Identificador / Señal visual
  componente2: string; // Mensaje contextualizado
  componente3: string; // Botón de acción
  componente4: string; // Permanencia de navegación
}> = {
  'E-01': {
    code: 'E-01',
    nombre: 'Vacío Inicial',
    tipo: 'Vacío',
    pantalla: 'Mis favoritos',
    casoDeUso: 'El estudiante ingresa por primera vez a su sección de favoritos y tiene 0 anuncios guardados.',
    componente1: 'Ícono vectorial de marcador con signo «+» en círculo #FEF2F2 y badge institucional.',
    componente2: 'Explica qué comunicados aparecerán ahí (matrícula, becas, cambios de aula) y cómo guardarlos.',
    componente3: 'Primario: «Explorar anuncios vigentes» • Secundario: «Ir a Categorías académicas →».',
    componente4: 'Cabecera «Mis favoritos» + Barra inferior permanente con pestaña Favoritos activa (WCAG 2.2 AAA).'
  },
  'E-02': {
    code: 'E-02',
    nombre: 'Vacío por Búsqueda',
    tipo: 'Vacío',
    pantalla: 'Resultados de búsqueda',
    casoDeUso: 'El estudiante busca «beca movilidad 2027» con los filtros «Becas» y «Últimos 7 días» y obtiene 0 resultados.',
    componente1: 'Ícono de lupa en contenedor suave con chips de filtros activos visibles.',
    componente2: 'Lectura clara de 0 coincidencias + 3 sugerencias prácticas para reorientar la búsqueda.',
    componente3: 'Primario: «Limpiar búsqueda y filtros» • Secundario: «Ver todos los anuncios vigentes».',
    componente4: 'Buscador editable en la parte superior + Barra inferior permanente sin perder contexto.'
  },
  'E-03': {
    code: 'E-03',
    nombre: 'Vacío por Historial',
    tipo: 'Vacío',
    pantalla: 'Notificaciones e Historial',
    casoDeUso: 'Estudiante cachimbo de primer ciclo con cuenta recién activada que aún no registra alertas leídas.',
    componente1: 'Ícono de campana con estrella institucional de bienvenida en #FEF2F2.',
    componente2: 'Bienvenida contextualizada a la UTP y explicación clara de cómo se llenará el historial.',
    componente3: 'Primario: «Configurar mis preferencias de alertas» • Secundario: «Explorar comunicados de bienvenida».',
    componente4: 'Cabecera «Notificaciones» con acceso directo a ajustes y barra inferior permanente.'
  },
  'E-04': {
    code: 'E-04',
    nombre: 'Carga con Esqueleto (Skeleton)',
    tipo: 'Carga',
    pantalla: 'Categoría Académico',
    casoDeUso: 'El estudiante ingresa a Académico mientras se sincronizan los horarios, matrículas y aulas asignadas.',
    componente1: 'Esqueleto de contenido realista (Skeleton UI: buscador, chips y 3 tarjetas completas) con aria-busy.',
    componente2: 'Texto contextualizado: «Actualizando comunicados académicos del ciclo 2026-1… Sincronizando horarios».',
    componente3: 'Acción accesible de salida: «Cancelar y ver anuncios guardados sin conexión».',
    componente4: 'Cabecera «Académico» con flecha volver (←) + Barra inferior activa permanente.'
  },
  'E-05': {
    code: 'E-05',
    nombre: 'Error de Conexión (Offline)',
    tipo: 'Error',
    pantalla: 'Detalle del anuncio / Conectividad',
    casoDeUso: 'Corte de Wi-Fi o datos móviles al intentar abrir el aviso de matrícula y descargar la guía PDF.',
    componente1: 'Ícono vectorial de antena Wi-Fi tachada en contenedor de alerta #FEF2F2 (WCAG 1.4.1).',
    componente2: 'Explicación en lenguaje claro sin códigos técnicos con confirmación de que la caché está disponible.',
    componente3: 'Primario: «↻ Reintentar cargar el anuncio» • Secundario: «Ver mis favoritos sin conexión».',
    componente4: 'Cabecera «Detalle del anuncio» con retroceso (←), resumen en caché local y barra inferior.'
  },
  'E-06': {
    code: 'E-06',
    nombre: 'Error del Sistema (Fallo 500)',
    tipo: 'Error',
    pantalla: 'Todos los anuncios',
    casoDeUso: 'Caída o saturación temporal del servidor central de comunicados UTP en fechas pico de matrícula.',
    componente1: 'Ícono de servidor con insignia de alerta en círculo suave #FEF2F2.',
    componente2: 'Disculpas en lenguaje comprensible (sin 500/503), confirmando que los datos locales están a salvo.',
    componente3: 'Primario: «↻ Reintentar cargar anuncios» • Secundario: «Contactar a Soporte SAE UTP».',
    componente4: 'Cabecera «Todos los anuncios», canal directo a SAE (sae@utp.edu.pe) y barra de navegación.'
  },
  'E-07': {
    code: 'E-07',
    nombre: 'Error de Validación',
    tipo: 'Error',
    pantalla: 'Iniciar sesión institucional',
    casoDeUso: 'El estudiante ingresa correo externo (@gmail.com en vez de @utp.edu.pe) y clave menor a 8 caracteres.',
    componente1: 'Borde institucional #B50E30, fondo rosado de alerta e ícono «!» dentro de cada campo afectado.',
    componente2: 'Mensajes en texto visible junto a cada campo provocador con ejemplos válidos y foco accesible.',
    componente3: 'Primario: «Iniciar sesión» • Asistencia: «Autocompletar @utp.edu.pe» • «Recuperar acceso».',
    componente4: 'Banner resumen de accesibilidad superior, opción de cancelar y retorno al inicio.'
  },
  'E-08': {
    code: 'E-08',
    nombre: 'Contenido No Disponible',
    tipo: 'Error',
    pantalla: 'Detalle del anuncio',
    casoDeUso: 'El estudiante abre desde un enlace antiguo el aviso «Taller de Verano 2026-0» cuya convocatoria ya cerró.',
    componente1: 'Ícono de documento archivado con etiqueta destacada «CONVOCATORIA CERRADA».',
    componente2: 'Informa la fecha exacta de cierre y ofrece alternativas de convocatorias vigentes equivalentes.',
    componente3: 'Primario: «Avisarme cuando abra una nueva convocatoria» • Secundario: «Explorar anuncios vigentes».',
    componente4: 'Cabecera «Detalle del anuncio» (←), 2 tarjetas alternativas sugeridas y barra inferior.'
  },
  'E-09': {
    code: 'E-09',
    nombre: 'Sin Permisos (Sesión Expirada)',
    tipo: 'Seguridad',
    pantalla: 'Seguridad / Descarga de documento',
    casoDeUso: 'El estudiante intenta descargar un cronograma oficial tras un periodo de inactividad en la app.',
    componente1: 'Ícono de candado institucional de seguridad con badge de protección de datos.',
    componente2: 'Explica que la sesión caducó por inactividad y garantiza que se retomará la descarga tras autenticarse.',
    componente3: 'Primario: «Iniciar sesión con mi cuenta UTP» • Secundario: «Volver a avisos públicos de portada».',
    componente4: 'Tarjeta informativa con la acción retenida (archivo pendiente) y permanencia de navegación.'
  },
  'E-10': {
    code: 'E-10',
    nombre: 'Éxito / Confirmación Oficial',
    tipo: 'Confirmación',
    pantalla: 'Detalle del anuncio / Constancia',
    casoDeUso: 'El estudiante confirma la lectura del aviso de matrícula y lo guarda en favoritos con registro formal.',
    componente1: 'Ícono de check verde institucional (#15803D) con contenedor suave y toast superior animado.',
    componente2: 'Mensaje de éxito con recordatorio pedagógico automático 24 horas antes.',
    componente3: 'Primario: «Ir a Mis Favoritos (1 guardado)» • Secundario: «Explorar más anuncios de Académico».',
    componente4: 'Cabecera institucional, comprobante digital #UTP-2026-42920 y barra inferior permanente.'
  }
};

export const CatalogStateView: React.FC<CatalogStateViewProps> = ({
  stateCode,
  onExit,
  onNavigate,
  onOpenNotice,
  onConfigureAlerts
}) => {
  const meta = AP3_STATE_METADATA[stateCode];

  // Estados interactivos locales para probar cada pantalla dentro del estado
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [alertSubscribed, setAlertSubscribed] = useState(false);
  const [loginEmail, setLoginEmail] = useState('u22224908@gmail.com');
  const [loginPass, setLoginPass] = useState('1234');
  const [emailFixed, setEmailFixed] = useState(false);
  const [passFixed, setPassFixed] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimeout(() => {
      setIsRetrying(false);
      setRetryCount((prev) => prev + 1);
    }, 900);
  };

  const handleAutoCompleteUTP = () => {
    setLoginEmail('u22224908@utp.edu.pe');
    setEmailFixed(true);
  };

  const handleFixPassword = () => {
    setLoginPass('Utp2026!Seguro');
    setPassFixed(true);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative animate-fade-in" data-state-code={stateCode}>
      
      {/* CABECERA DE EVALUACIÓN ACADÉMICA AP3 (Ficha técnica del estado) */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-utp-red text-white font-black rounded text-[10px] tracking-wide">
            {meta.code}
          </span>
          <span className="font-bold text-slate-100">{meta.nombre}</span>
          <span className="hidden sm:inline text-slate-400 text-[11px]">• {meta.pantalla}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Ver los 4 componentes de AP3 evaluados"
          >
            {showTechnicalDetails ? 'Ocultar Criterios AP3' : 'Ver Criterios AP3'}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
            title="Cerrar estado y volver al feed normal"
            aria-label="Cerrar vista de estado operativo"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>

      {/* DRAWER DESPLEGABLE CON LOS 4 COMPONENTES DE AP3 */}
      {showTechnicalDetails && (
        <div className="bg-amber-50 border-b border-amber-200 p-3 text-[11px] text-amber-950 space-y-1.5 shadow-inner">
          <p className="font-bold text-amber-900 flex items-center gap-1.5">
            <ShieldCheck size={14} weight="fill" className="text-utp-red" />
            Matriz de Evaluación AP3 (Diseño por Rubén Vivas):
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div className="bg-white/80 p-2 rounded border border-amber-200">
              <span className="font-bold text-utp-red">1. Señal Visual / Identificador:</span>
              <p className="text-slate-700 mt-0.5">{meta.componente1}</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-amber-200">
              <span className="font-bold text-utp-red">2. Mensaje Contextualizado:</span>
              <p className="text-slate-700 mt-0.5">{meta.componente2}</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-amber-200">
              <span className="font-bold text-utp-red">3. Botón de Acción de Salida:</span>
              <p className="text-slate-700 mt-0.5">{meta.componente3}</p>
            </div>
            <div className="bg-white/80 p-2 rounded border border-amber-200">
              <span className="font-bold text-utp-red">4. Permanencia y Accesibilidad:</span>
              <p className="text-slate-700 mt-0.5">{meta.componente4}</p>
            </div>
          </div>
        </div>
      )}

      {/* CONTENIDO ESPECÍFICO SEGÚN EL ESTADO OPERATIVO (E-01 A E-10) */}
      <div className="flex-1 overflow-y-auto">

        {/* ========================================================
            E-01: VACÍO INICIAL (Mis Favoritos)
           ======================================================== */}
        {stateCode === 'E-01' && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Componente 1: Señal Visual */}
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100 shadow-sm">
              <BookmarkSimple size={42} weight="duotone" className="text-utp-red" />
            </div>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-lg font-bold text-slate-900 mb-2">
              Aún no tienes anuncios favoritos
            </h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-6">
              Guarda aquí los comunicados importantes sobre tu matrícula, convocatorias de becas o cambios de aula pulsando el ícono de marcador <BookmarkSimple size={14} className="inline text-utp-red mx-0.5" weight="fill" /> en cualquier aviso.
            </p>

            {/* Guía visual rápida */}
            <div className="w-full max-w-xs bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm mb-6 text-left">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-1">
                ¿Qué comunicados puedes guardar?
              </span>
              <ul className="text-xs text-slate-600 space-y-1.5">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-utp-red" />
                  Fechas clave de matrícula y pagos
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-utp-red" />
                  Cambios urgentes de aula y pabellón
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-utp-red" />
                  Avisos con intérprete de señas (LSP)
                </li>
              </ul>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-xs space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('inicio');
                }}
                className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Explorar anuncios vigentes</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('categorias');
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
              >
                <span>Ir a Categorías académicas</span>
                <CaretRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-02: VACÍO POR BÚSQUEDA (0 resultados)
           ======================================================== */}
        {stateCode === 'E-02' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Contexto de la búsqueda realizada */}
            <div className="w-full max-w-sm mb-4 bg-white p-3 rounded-xl border border-slate-200 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1">
                Búsqueda aplicada (0 coincidencias):
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                <MagnifyingGlass size={14} className="text-slate-400" />
                <span>«beca movilidad 2027»</span>
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="px-2 py-0.5 bg-red-50 text-utp-red rounded text-[10px] font-bold flex items-center gap-1">
                  Categoría: Becas <X size={10} />
                </span>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold flex items-center gap-1">
                  Últimos 7 días <X size={10} />
                </span>
              </div>
            </div>

            {/* Componente 1: Señal Visual */}
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400 border border-slate-200">
              <MagnifyingGlass size={32} weight="duotone" />
            </div>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              No encontramos anuncios coincidentes
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mb-4 leading-relaxed">
              No hay comunicados publicados bajo «beca movilidad 2027» con los filtros activos.
            </p>

            {/* Sugerencias prácticas */}
            <div className="w-full max-w-sm bg-white p-3.5 rounded-xl border border-slate-200 text-left text-xs mb-5">
              <span className="font-bold text-slate-800 block mb-2">Recomendaciones:</span>
              <ol className="list-decimal list-inside space-y-1 text-slate-600 text-[11px] leading-relaxed">
                <li>Revisa que las palabras estén bien escritas.</li>
                <li>Usa términos más generales como <strong className="text-slate-800">«beca»</strong> o <strong className="text-slate-800">«movilidad»</strong>.</li>
                <li>Prueba quitando el filtro de «Últimos 7 días».</li>
              </ol>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-sm space-y-2">
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('inicio');
                }}
                className="w-full py-2.5 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-colors"
              >
                Limpiar búsqueda y filtros
              </button>
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('categorias');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Ver todos los anuncios vigentes
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-03: VACÍO POR HISTORIAL (Bienvenida sin alertas previas)
           ======================================================== */}
        {stateCode === 'E-03' && (
          <div className="p-6 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Componente 1: Señal Visual */}
            <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mb-4 border border-red-100 relative">
              <Bell size={40} weight="duotone" className="text-utp-red" />
              <div className="absolute top-1 right-1 w-6 h-6 rounded-full bg-utp-red text-white flex items-center justify-center">
                <Sparkle size={14} weight="fill" />
              </div>
            </div>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              Sin actividad previa en tu historial
            </h2>
            <p className="text-xs text-slate-500 max-w-xs leading-relaxed mb-6">
              ¡Te damos la bienvenida a UTP Anuncios! Como eres nuevo en la plataforma, aún no registras alertas leídas o recordatorios pasados. Aquí se recopilarán tus avisos prioritarios y confirmaciones.
            </p>

            {/* Tarjeta de bienvenida cachimbo */}
            <div className="w-full max-w-xs bg-white p-4 rounded-xl border border-slate-200 text-left mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2 text-utp-red font-bold text-xs">
                <UserCheck size={18} weight="bold" />
                <span>Perfil: Estudiante Cachimbo 2026-1</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Activa tus preferencias de avisos sensoriales (destellos visuales seguros y vibración) para recibir novedades sobre tu matrícula y cambio de aula.
              </p>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-xs space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onConfigureAlerts?.();
                }}
                className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <Sparkle size={16} weight="fill" />
                <span>Configurar mis preferencias de alertas</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('inicio');
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Explorar comunicados de bienvenida
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-04: CARGA CON ESQUELETO (Skeleton UI con aria-busy)
           ======================================================== */}
        {stateCode === 'E-04' && (
          <div className="p-4 space-y-4" aria-busy="true" aria-live="polite">
            {/* Banner de accesibilidad contextual */}
            <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <ArrowsClockwise size={18} className="animate-spin text-blue-600" />
                <span className="font-semibold">
                  Actualizando comunicados académicos del ciclo 2026-1…
                </span>
              </div>
              <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-2 py-0.5 rounded">
                aria-busy="true"
              </span>
            </div>

            {/* Buscador esqueleto */}
            <div className="h-10 bg-slate-200 rounded-xl animate-pulse w-full" />

            {/* Chips de filtro esqueleto */}
            <div className="flex gap-2 overflow-hidden">
              <div className="h-7 w-20 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-7 w-28 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-7 w-24 bg-slate-200 rounded-full animate-pulse" />
              <div className="h-7 w-20 bg-slate-200 rounded-full animate-pulse" />
            </div>

            {/* 3 Tarjetas de contenido esqueleto de alta fidelidad */}
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3 shadow-sm animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-slate-200 rounded-full" />
                  <div className="h-3 w-16 bg-slate-200 rounded" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 w-3/4 bg-slate-300 rounded" />
                  <div className="h-3 w-full bg-slate-200 rounded" />
                  <div className="h-3 w-2/3 bg-slate-200 rounded" />
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div className="flex gap-2">
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                    <div className="h-4 w-12 bg-slate-200 rounded" />
                  </div>
                  <div className="h-6 w-6 bg-slate-200 rounded-lg" />
                </div>
              </div>
            ))}

            {/* Componente 3: Botón de acción para salir de la espera */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onExit}
                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors text-center"
              >
                Cancelar y ver anuncios guardados sin conexión
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-05: ERROR DE CONEXIÓN (Offline con caché y reintento)
           ======================================================== */}
        {stateCode === 'E-05' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Componente 1: Señal Visual (WCAG 1.4.1 ícono + texto) */}
            <div className="w-20 h-20 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4 text-utp-red">
              <WifiSlash size={42} weight="bold" />
            </div>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              Sin conexión a internet
            </h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-5">
              Tu dispositivo perdió el acceso a la red Wi-Fi o datos móviles y no pudimos cargar el comunicado completo. Hemos conservado la última versión en tu caché local.
            </p>

            {/* Vista previa de tarjeta en caché */}
            <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-slate-200 text-left mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold text-[10px] rounded">
                  DISPONIBLE EN CACHÉ LOCAL
                </span>
                <span className="text-[10px] text-slate-400">Sincronizado: Hoy 08:30 AM</span>
              </div>
              <h4 className="font-bold text-xs text-slate-800 mb-1">
                Cronograma de Matrícula 2026-1 (Resumen guardado)
              </h4>
              <p className="text-[11px] text-slate-600 line-clamp-2">
                Inicio regular de matrícula por turnos académicos desde el 25 de febrero. El PDF completo requiere conexión activa.
              </p>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-sm space-y-2.5">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-all flex items-center justify-center gap-2"
              >
                <ArrowsClockwise size={16} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? 'Comprobando conexión...' : '↻ Reintentar cargar el anuncio'}</span>
              </button>
              {retryCount > 0 && (
                <p className="text-[11px] text-slate-500 animate-fade-in">
                  Intento #{retryCount}: Aún sin señal de red detectada.
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('favoritos');
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Ver mis favoritos disponibles sin conexión
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-06: ERROR DEL SISTEMA (Fallo 500 con contacto a SAE UTP)
           ======================================================== */}
        {stateCode === 'E-06' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Componente 1: Señal Visual */}
            <div className="w-20 h-20 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-4 text-utp-red">
              <WarningOctagon size={44} weight="duotone" />
            </div>

            {/* Componente 2: Mensaje Contextualizado (Sin códigos 500) */}
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              El servicio no responde en este momento
            </h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-5">
              Te pedimos sinceras disculpas. Estamos presentando un inconveniente temporal en los servidores de la plataforma de anuncios UTP durante este pico de matrícula. Tus avisos guardados están seguros.
            </p>

            {/* Tarjeta de soporte institucional SAE */}
            <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-slate-200 text-left mb-6 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Canales de Atención Oficial UTP
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <EnvelopeSimple size={16} className="text-utp-red" />
                  <span>Soporte al Estudiante: <strong className="text-slate-900">sae@utp.edu.pe</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone size={16} className="text-utp-red" />
                  <span>Central Telefónica: <strong className="text-slate-900">(01) 315-9600</strong></span>
                </div>
              </div>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-sm space-y-2.5">
              <button
                type="button"
                onClick={handleRetry}
                disabled={isRetrying}
                className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <ArrowsClockwise size={16} className={isRetrying ? 'animate-spin' : ''} />
                <span>{isRetrying ? 'Reconectando con el servidor...' : '↻ Reintentar cargar anuncios'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  window.open('mailto:sae@utp.edu.pe?subject=Consulta%20Plataforma%20UTP%20Anuncios', '_blank');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <EnvelopeSimple size={16} />
                <span>Contactar a Soporte SAE UTP</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-07: ERROR DE VALIDACIÓN (Login @utp.edu.pe y clave)
           ======================================================== */}
        {stateCode === 'E-07' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px]">
            {/* Banner resumen superior accesible */}
            <div className="w-full max-w-sm mb-4 bg-red-50 border border-red-200 text-utp-red p-3 rounded-xl text-xs flex items-center gap-2">
              <WarningCircle size={20} weight="fill" className="shrink-0" />
              <span>Hay 2 errores en tus datos de acceso. Corrige los campos marcados abajo.</span>
            </div>

            <div className="w-full max-w-sm bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Iniciar sesión institucional
              </h2>

              {/* Campo 1: Correo con error */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Correo Institucional</span>
                  {emailFixed ? (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle size={12} weight="bold" /> Corregido
                    </span>
                  ) : (
                    <span className="text-[10px] text-utp-red font-bold">Dominio no válido</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      emailFixed
                        ? 'border-green-500 bg-green-50/30'
                        : 'border-utp-red bg-red-50/40 text-slate-900 font-medium'
                    }`}
                    aria-invalid={!emailFixed}
                    aria-describedby="email-error-msg"
                  />
                  {!emailFixed && (
                    <WarningCircle size={16} weight="fill" className="absolute right-3 top-2.5 text-utp-red" />
                  )}
                </div>
                {!emailFixed ? (
                  <div id="email-error-msg" className="space-y-1">
                    <p className="text-[11px] text-utp-red font-semibold leading-tight">
                      ✕ El correo debe pertenecer al dominio @utp.edu.pe (Ej: u22224908@utp.edu.pe).
                    </p>
                    <button
                      type="button"
                      onClick={handleAutoCompleteUTP}
                      className="text-[10px] text-blue-700 font-bold hover:underline block"
                    >
                      → Autocompletar con «@utp.edu.pe»
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-green-700">✓ Formato institucional correcto.</p>
                )}
              </div>

              {/* Campo 2: Contraseña con error */}
              <div className="space-y-1 text-left">
                <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>Contraseña institucional</span>
                  {passFixed ? (
                    <span className="text-[10px] text-green-700 font-bold flex items-center gap-1">
                      <CheckCircle size={12} weight="bold" /> Válida
                    </span>
                  ) : (
                    <span className="text-[10px] text-utp-red font-bold">Mínimo 8 caracteres</span>
                  )}
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className={`w-full px-3 py-2 text-xs rounded-xl border focus:outline-none ${
                      passFixed
                        ? 'border-green-500 bg-green-50/30'
                        : 'border-utp-red bg-red-50/40 text-slate-900'
                    }`}
                    aria-invalid={!passFixed}
                    aria-describedby="pass-error-msg"
                  />
                  {!passFixed && (
                    <WarningCircle size={16} weight="fill" className="absolute right-3 top-2.5 text-utp-red" />
                  )}
                </div>
                {!passFixed ? (
                  <div id="pass-error-msg" className="space-y-1">
                    <p className="text-[11px] text-utp-red font-semibold leading-tight">
                      ✕ La contraseña debe tener al menos 8 caracteres (actualmente tiene 4).
                    </p>
                    <button
                      type="button"
                      onClick={handleFixPassword}
                      className="text-[10px] text-blue-700 font-bold hover:underline block"
                    >
                      → Simular ingreso de contraseña válida
                    </button>
                  </div>
                ) : (
                  <p className="text-[11px] text-green-700">✓ Longitud de seguridad adecuada.</p>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    if (emailFixed && passFixed) {
                      onExit();
                    } else {
                      handleAutoCompleteUTP();
                      handleFixPassword();
                    }
                  }}
                  className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-colors"
                >
                  {emailFixed && passFixed ? 'Ingresar a UTP Anuncios' : 'Corregir automáticamente y validar'}
                </button>
                <button
                  type="button"
                  onClick={onExit}
                  className="w-full py-2 text-xs text-slate-500 hover:text-slate-800 transition-colors"
                >
                  ¿Olvidaste tu contraseña? Recuperar acceso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            E-08: CONTENIDO NO DISPONIBLE (Convocatoria cerrada)
           ======================================================== */}
        {stateCode === 'E-08' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Componente 1: Señal Visual */}
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-3 text-slate-500">
              <Archive size={34} weight="duotone" />
            </div>

            <span className="px-3 py-1 bg-red-100 text-utp-red font-black text-[11px] rounded-full mb-3 uppercase tracking-wider">
              CONVOCATORIA CERRADA
            </span>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-base font-bold text-slate-900 mb-1.5">
              Este anuncio ya no está disponible
            </h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-5">
              El comunicado «Taller de Verano 2026-0 - Becas de Innovación» fue archivado porque el periodo de postulación concluyó el 15 de febrero de 2026.
            </p>

            {/* Alternativas vigentes sugeridas */}
            <div className="w-full max-w-sm bg-white p-3.5 rounded-xl border border-slate-200 text-left mb-5 shadow-sm">
              <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
                Convocatorias equivalentes vigentes:
              </span>
              <div className="space-y-2">
                <div
                  onClick={() => {
                    onExit();
                    onOpenNotice?.('B-101');
                  }}
                  className="p-2 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-utp-red cursor-pointer transition-colors"
                >
                  <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-bold rounded">
                    BECAS
                  </span>
                  <p className="font-bold text-xs text-slate-900 mt-1">Beca Excelencia Académica 2026-1</p>
                  <p className="text-[10px] text-slate-500">Postulación abierta hasta el 30 de noviembre</p>
                </div>
                <div
                  onClick={() => {
                    onExit();
                    onOpenNotice?.('I-201');
                  }}
                  className="p-2 bg-slate-50 hover:bg-red-50 rounded-lg border border-slate-200 hover:border-utp-red cursor-pointer transition-colors"
                >
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 text-[9px] font-bold rounded">
                    INTERCAMBIO
                  </span>
                  <p className="font-bold text-xs text-slate-900 mt-1">Movilidad Estudiantil Internacional 2026-2</p>
                  <p className="text-[10px] text-slate-500">Charlas informativas presenciales</p>
                </div>
              </div>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-sm space-y-2">
              <button
                type="button"
                onClick={() => setAlertSubscribed(true)}
                className={`w-full py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  alertSubscribed
                    ? 'bg-green-700 text-white'
                    : 'bg-utp-red hover:bg-utp-redDark text-white shadow'
                }`}
              >
                {alertSubscribed ? (
                  <>
                    <CheckCircle size={16} weight="bold" />
                    <span>¡Te avisaremos en la próxima fecha!</span>
                  </>
                ) : (
                  <span>Avisarme cuando abra una nueva convocatoria</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('inicio');
                }}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                Explorar anuncios vigentes
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-09: SIN PERMISOS (Sesión expirada con retención)
           ======================================================== */}
        {stateCode === 'E-09' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Componente 1: Señal Visual */}
            <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-slate-300 flex items-center justify-center mb-4 text-slate-700">
              <LockKey size={40} weight="duotone" />
            </div>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              Tu sesión institucional expiró
            </h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-5">
              Por tu seguridad y la confidencialidad de tus datos académicos, cerramos la sesión tras detectar inactividad. Hemos guardado tu tarea para retomarla apenas te autentiques.
            </p>

            {/* Tarea retenida */}
            <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-slate-200 text-left mb-6 shadow-sm">
              <div className="flex items-center gap-2 mb-1.5 text-utp-red font-bold text-xs">
                <FilePdf size={18} weight="fill" />
                <span>Acción pendiente retenida</span>
              </div>
              <p className="text-xs font-semibold text-slate-800">
                Descarga de «Guia_Matricula_Ciclo_2026.pdf»
              </p>
              <p className="text-[10px] text-slate-500 mt-1">
                Se completará automáticamente tras iniciar sesión con tu cuenta UTP.
              </p>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-sm space-y-2.5">
              <button
                type="button"
                onClick={onExit}
                className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <ShieldCheck size={18} weight="bold" />
                <span>Iniciar sesión con mi cuenta UTP</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('inicio');
                }}
                className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
              >
                Volver a avisos públicos de portada
              </button>
            </div>
          </div>
        )}

        {/* ========================================================
            E-10: ÉXITO / CONFIRMACIÓN (#UTP-2026-42920)
           ======================================================== */}
        {stateCode === 'E-10' && (
          <div className="p-5 flex flex-col items-center justify-center min-h-[440px] text-center">
            {/* Banner Toast superior animado */}
            <div className="w-full max-w-sm mb-4 bg-emerald-50 border border-emerald-200 text-emerald-900 p-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm animate-bounce">
              <CheckCircle size={16} weight="fill" className="text-emerald-600" />
              <span>Constancia de lectura guardada correctamente</span>
            </div>

            {/* Componente 1: Señal Visual */}
            <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center mb-4 text-emerald-600 shadow-sm">
              <CheckCircle size={48} weight="fill" />
            </div>

            {/* Componente 2: Mensaje Contextualizado */}
            <h2 className="text-lg font-bold text-slate-900 mb-1.5">
              ¡Anuncio guardado y lectura confirmada!
            </h2>
            <p className="text-xs text-slate-600 max-w-xs leading-relaxed mb-5">
              Tu constancia ha sido registrada con éxito en el sistema institucional UTP. Te enviaremos un recordatorio 24 horas antes del inicio.
            </p>

            {/* Constancia digital oficial */}
            <div className="w-full max-w-sm bg-white p-4 rounded-xl border border-slate-200 text-left mb-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CONSTANCIA DIGITAL OFICIAL
                </span>
                <span className="font-mono font-bold text-xs text-utp-red">
                  #UTP-2026-42920
                </span>
              </div>
              <div className="space-y-1 text-xs text-slate-700">
                <p><span className="text-slate-400">Estudiante:</span> Ruben Walter (u22224908)</p>
                <p><span className="text-slate-400">Comunicado:</span> Cronograma de Matrícula 2026-1</p>
                <p className="text-[10px] text-emerald-700 font-semibold pt-1">
                  ✓ Firma criptográfica institucional UTP verificada
                </p>
              </div>
            </div>

            {/* Componente 3: Botones de Acción */}
            <div className="w-full max-w-sm space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('favoritos');
                }}
                className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white text-xs font-bold rounded-xl shadow transition-colors flex items-center justify-center gap-2"
              >
                <BookmarkSimple size={16} weight="fill" />
                <span>Ir a Mis Favoritos (1 guardado)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExit();
                  onNavigate?.('categorias');
                }}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Explorar más anuncios de Académico
              </button>
            </div>
          </div>
        )}

      </div>

      {/* COMPONENTE 4: PERMANENCIA DE NAVEGACIÓN
          Barra inferior institucional permanente para que el usuario nunca quede atrapado */}
      <nav className="sticky bottom-0 z-10 bg-white border-t border-slate-200 px-6 py-2.5 flex items-center justify-between shadow-md">
        <button
          type="button"
          onClick={() => {
            onExit();
            onNavigate?.('inicio');
          }}
          className="flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-utp-red transition-colors"
          title="Volver a Inicio"
        >
          <House size={20} weight={stateCode === 'E-03' ? 'fill' : 'regular'} />
          <span>Inicio</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onExit();
            onNavigate?.('categorias');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            stateCode === 'E-04' ? 'text-utp-red' : 'text-slate-500 hover:text-utp-red'
          }`}
          title="Ver Categorías"
        >
          <SquaresFour size={20} weight={stateCode === 'E-04' ? 'fill' : 'regular'} />
          <span>Categorías</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onExit();
            onNavigate?.('buscar');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            stateCode === 'E-02' ? 'text-utp-red' : 'text-slate-500 hover:text-utp-red'
          }`}
          title="Buscar"
        >
          <MagnifyingGlass size={20} weight={stateCode === 'E-02' ? 'bold' : 'regular'} />
          <span>Buscar</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onExit();
            onNavigate?.('favoritos');
          }}
          className={`flex flex-col items-center gap-1 text-[11px] font-semibold transition-colors ${
            stateCode === 'E-01' || stateCode === 'E-10' ? 'text-utp-red' : 'text-slate-500 hover:text-utp-red'
          }`}
          title="Mis Favoritos"
        >
          <BookmarkSimple size={20} weight={stateCode === 'E-01' || stateCode === 'E-10' ? 'fill' : 'regular'} />
          <span>Favoritos</span>
        </button>
      </nav>

    </div>
  );
};
