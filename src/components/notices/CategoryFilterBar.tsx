import React from 'react';
import { CategoryId } from '@/types';
import { MOCK_CATEGORIES } from '@/data/mockNotices';
import {
  MagnifyingGlass,
  X,
  SquaresFour,
  GraduationCap,
  CalendarCheck,
  CurrencyCircleDollar,
  Sparkle,
  CreditCard,
} from '@phosphor-icons/react';

export interface CategoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  totalResults?: number;
}

const CATEGORY_ICONS: Record<CategoryId, React.ComponentType<{
  size?: number | string;
  weight?: 'regular' | 'bold' | 'fill';
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
}>> = {
  todos: SquaresFour,
  academico: GraduationCap,
  matricula: CalendarCheck,
  becas: CurrencyCircleDollar,
  eventos: Sparkle,
  pagos: CreditCard,
};

/**
 * CategoryFilterBar Component
 * Buscador con botón de borrado inmediato y barra de chips horizontales deslizables
 * con iconos Phosphor y estado visual institucional UTP.
 * Optimizado para pantallas móviles (320px a 430px).
 */
export const CategoryFilterBar: React.FC<CategoryFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  totalResults,
}) => {
  return (
    <section
      role="search"
      aria-label="Filtrado y búsqueda de avisos"
      className="p-3.5 sm:p-4 bg-slate-50/95 border-b border-slate-200 shrink-0"
    >
      {/* Campo de búsqueda con icono y botón de limpiar */}
      <div className="relative mb-3">
        <label htmlFor="notice-search-input" className="sr-only">
          Buscar anuncios institucionales
        </label>
        <MagnifyingGlass
          size={18}
          className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          id="notice-search-input"
          type="text"
          placeholder="Buscar avisos, aulas, becas..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-utp-red focus:border-transparent transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="w-7 h-7 absolute right-2.5 top-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
            title="Borrar búsqueda"
            aria-label="Borrar texto de búsqueda"
          >
            <X size={16} weight="bold" />
          </button>
        )}
      </div>

      {/* Lista deslizable horizontal de categorías sin barra gris nativa */}
      <div
        className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar scrollbar-none scroll-smooth select-none"
        role="tablist"
        aria-label="Categorías de anuncios"
      >
        {MOCK_CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const IconComp = CATEGORY_ICONS[cat.id] || SquaresFour;

          return (
            <button
              key={cat.id}
              role="tab"
              aria-selected={isSelected}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
                isSelected
                  ? 'bg-utp-red text-white shadow-sm ring-1 ring-utp-red hover:bg-utp-redDark'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 active:scale-95'
              }`}
            >
              <IconComp
                size={16}
                weight={isSelected ? 'fill' : 'regular'}
                className={isSelected ? 'text-white' : 'text-slate-500'}
                aria-hidden="true"
              />
              <span>{cat.nombre}</span>
            </button>
          );
        })}
      </div>

      {/* Indicador de resultados cuando hay búsqueda o filtro activo */}
      {(searchQuery || selectedCategory !== 'todos') && typeof totalResults === 'number' && (
        <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
          <span>
            {totalResults === 1 ? '1 aviso encontrado' : `${totalResults} avisos encontrados`}
          </span>
          {(searchQuery || selectedCategory !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('todos');
              }}
              className="text-utp-red hover:underline font-medium text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-utp-red rounded"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      )}
    </section>
  );
};

export default CategoryFilterBar;
