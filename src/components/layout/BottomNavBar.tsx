import React from 'react';
import { House, SquaresFour, BookmarkSimple, UserCircle } from '@phosphor-icons/react';

export type TabId = 'inicio' | 'anuncios' | 'favoritos' | 'perfil';

export interface BottomNavBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  favoritesCount?: number;
}

interface NavItemConfig {
  id: TabId;
  label: string;
  icon: React.ComponentType<{
    size?: number | string;
    weight?: 'regular' | 'bold' | 'fill' | 'duotone' | 'thin' | 'light';
    className?: string;
  }>;
}

const NAV_ITEMS: NavItemConfig[] = [
  { id: 'inicio', label: 'Inicio', icon: House },
  { id: 'anuncios', label: 'Anuncios', icon: SquaresFour },
  { id: 'favoritos', label: 'Favoritos', icon: BookmarkSimple },
  { id: 'perfil', label: 'Perfil', icon: UserCircle },
];

/**
 * BottomNavBar Component (Figma Frame 551:53)
 * Barra inferior fija móvil con soporte de estados visuales Phosphor,
 * contador de favoritos y áreas táctiles de 48px (cumple WCAG 2.2 AAA).
 */
export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onTabChange,
  favoritesCount = 0,
}) => {
  return (
    <nav
      role="navigation"
      aria-label="Navegación principal"
      className="sticky bottom-0 z-20 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 sm:px-6 py-2 pb-2.5 sm:pb-3 flex items-center justify-around shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none shrink-0"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = activeTab === item.id;
        const IconComponent = item.icon;
        const weight = isActive ? 'fill' : 'regular';

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onTabChange(item.id)}
            aria-current={isActive ? 'page' : undefined}
            aria-label={`${item.label}${item.id === 'favoritos' && favoritesCount > 0 ? `, ${favoritesCount} guardados` : ''}`}
            className={`min-w-[54px] min-h-[48px] px-2 py-1 flex flex-col items-center justify-center gap-1 rounded-xl transition-all relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
              isActive
                ? 'text-utp-red font-bold'
                : 'text-slate-500 hover:text-slate-700 active:scale-95 font-medium'
            }`}
          >
            <div className="relative">
              <IconComponent
                size={22}
                weight={weight}
                className={`transition-transform duration-200 ${isActive ? 'scale-110 text-utp-red' : 'text-slate-500'}`}
              />

              {/* Badge de contador para Favoritos */}
              {item.id === 'favoritos' && favoritesCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-3 min-w-[18px] h-[18px] px-1 bg-utp-red text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-sm ring-2 ring-white"
                  aria-hidden="true"
                >
                  {favoritesCount > 99 ? '99+' : favoritesCount}
                </span>
              )}
            </div>

            <span className={`text-[11px] leading-none ${isActive ? 'font-bold text-utp-red' : 'text-slate-600'}`}>
              {item.label}
            </span>

            {/* Indicador inferior de pestaña activa */}
            {isActive && (
              <span
                className="absolute bottom-0.5 w-5 h-0.5 bg-utp-red rounded-full"
                aria-hidden="true"
              />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNavBar;
