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
    <div className="h-screen sm:min-h-screen bg-gradient-to-br from-slate-100 via-rose-50/40 to-slate-200 flex flex-col items-center justify-center sm:py-6 px-0 sm:px-4 overflow-hidden sm:overflow-auto relative">
      {/* Resplandor sutil universitario institucional rojo y blanco para desktop */}
      <div className="hidden sm:block absolute -top-40 -left-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

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
          className={`w-full max-w-md bg-white h-full sm:h-[844px] sm:max-h-[92vh] sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col relative border-0 sm:border border-slate-200 order-1 lg:order-2 ${className}`}
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
