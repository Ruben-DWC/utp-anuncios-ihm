import React from 'react';

export interface AppShellProps {
  children: React.ReactNode;
  header?: React.ReactNode;
  filterBar?: React.ReactNode;
  bottomNav?: React.ReactNode;
  floatingAction?: React.ReactNode;
  sidebar?: React.ReactNode;
  modals?: React.ReactNode;
  className?: string;
}

/**
 * AppShell Component
 * Contenedor maestro con diseño adaptativo mobile-first (320px a 430px) centrado en desktop.
 * En resoluciones de escritorio (lg: >=1024px), ubica la barra de evaluación docente al lado
 * del marco móvil institucional de UTP Anuncios.
 */
export const AppShell: React.FC<AppShellProps> = ({
  children,
  header,
  filterBar,
  bottomNav,
  floatingAction,
  sidebar,
  modals,
  className = '',
}) => {
  return (
    <div className="h-screen sm:min-h-screen bg-slate-100 flex flex-col items-center justify-center sm:py-6 px-0 sm:px-4 overflow-hidden sm:overflow-auto relative">
      {/* Fondo geométrico poligonal SVG institucional UTP (oculto en modo Alto Contraste AAA) */}
      <svg
        aria-hidden="true"
        className="high-contrast-hide pointer-events-none fixed inset-0 w-full h-full object-cover z-0"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="utp-poly-base" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F8FAFC" />
            <stop offset="55%" stopColor="#F1F5F9" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
        </defs>
        <rect width="1440" height="900" fill="url(#utp-poly-base)" />
        {/* Facetas poligonales superiores en carmesí UTP intenso y pizarra */}
        <polygon points="0,0 420,0 240,260 0,180" fill="#B50E30" fillOpacity="0.26" />
        <polygon points="420,0 780,0 520,210 240,260" fill="#B50E30" fillOpacity="0.11" />
        <polygon points="780,0 1160,0 940,190 520,210" fill="#CBD5E1" fillOpacity="0.42" />
        <polygon points="1160,0 1440,0 1440,280 940,190" fill="#B50E30" fillOpacity="0.22" />
        {/* Malla poligonal intermedia */}
        <polygon points="0,180 240,260 160,540 0,480" fill="#B50E30" fillOpacity="0.14" />
        <polygon points="240,260 520,210 460,520 160,540" fill="#FFFFFF" fillOpacity="0.45" />
        <polygon points="940,190 1440,280 1220,560 880,460" fill="#CBD5E1" fillOpacity="0.30" />
        {/* Facetas inferiores */}
        <polygon points="0,480 160,540 340,900 0,900" fill="#B50E30" fillOpacity="0.19" />
        <polygon points="160,540 460,520 680,900 340,900" fill="#E2E8F0" fillOpacity="0.45" />
        <polygon points="880,460 1220,560 1040,900 680,900" fill="#B50E30" fillOpacity="0.12" />
        <polygon points="1220,560 1440,280 1440,900 1040,900" fill="#B50E30" fillOpacity="0.28" />
        {/* Trazos vectoriales en carmesí UTP y pizarra */}
        <g stroke="#B50E30" strokeOpacity="0.22" strokeWidth="1.25" fill="none">
          <polyline points="0,180 240,260 520,210 940,190 1440,280" />
          <polyline points="240,260 160,540 460,520 880,460 1220,560" />
          <line x1="420" y1="0" x2="240" y2="260" />
          <line x1="1160" y1="0" x2="940" y2="190" />
          <line x1="160" y1="540" x2="340" y2="900" />
          <line x1="1220" y1="560" x2="1040" y2="900" />
        </g>
      </svg>

      {/* Contenedor adaptativo: móvil centrado en desktop con barra de evaluación lateral */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 items-center lg:items-start justify-center h-full sm:h-auto relative z-10">
        {/* Panel lateral (Evaluador docente AP3 / PF) */}
        {sidebar && (
          <aside className="w-full lg:w-72 xl:w-80 order-2 lg:order-1 px-4 sm:px-0">
            {sidebar}
          </aside>
        )}

        {/* Marco principal del dispositivo móvil UTP Anuncios (320px a 430px) */}
        <main
          id="app-main-frame"
          className={`app-shell-container w-full max-w-md bg-white h-full sm:h-[844px] sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border border-slate-200 order-1 lg:order-2 ${className}`}
        >
          {/* Header institucional sticky */}
          {header}

          {/* Barra de búsqueda y categorías opcional */}
          {filterBar}

          {/* Área de scroll principal de contenidos */}
          <div className="flex-1 overflow-y-auto relative scroll-smooth focus:outline-none">
            {children}
          </div>

          {/* Botón de acción flotante (Tutor IA) */}
          {floatingAction}

          {/* Barra de navegación inferior fija */}
          {bottomNav}

          {/* Modales, Drawers y Overlays */}
          {modals}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
