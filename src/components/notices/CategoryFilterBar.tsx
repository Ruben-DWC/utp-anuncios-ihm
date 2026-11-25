import React, { useState } from 'react';
import { CategoryId } from '@/types';
import { MOCK_CATEGORIES } from '@/data/mockNotices';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import {
  MagnifyingGlass,
  X,
  SquaresFour,
  GraduationCap,
  CalendarCheck,
  CurrencyCircleDollar,
  Sparkle,
  CreditCard,
  Microphone,
  MicrophoneSlash,
} from '@phosphor-icons/react';

export interface CategoryFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: CategoryId;
  onSelectCategory: (category: CategoryId) => void;
  accessibilityFilter?: 'all' | 'lsp' | 'cc' | 'urgent';
  onSelectAccessibilityFilter?: (filter: 'all' | 'lsp' | 'cc' | 'urgent') => void;
  totalResults?: number;
  onVoiceCommand?: (transcript: string) => void;
  voiceFeedback?: string | null;
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
  accessibilityFilter = 'all',
  onSelectAccessibilityFilter,
  totalResults,
  onVoiceCommand,
  voiceFeedback,
}) => {
  const [showVoiceChips, setShowVoiceChips] = useState(false);

  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'es-PE',
    onResult: (spokenText) => {
      if (onVoiceCommand) {
        onVoiceCommand(spokenText);
      } else {
        onSearchChange(spokenText);
      }
    },
  });

  const handleMicToggle = () => {
    if (!isSpeechSupported) {
      setShowVoiceChips((prev) => !prev);
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <section
      role="search"
      aria-label="Filtrado y búsqueda de avisos"
      className="p-3.5 sm:p-4 bg-slate-50/95 border-b border-slate-200 shrink-0"
    >
      {/* Campo de búsqueda con icono, limpiar y comando por voz (Modalidad 3) */}
      <div className="relative mb-3 flex items-center gap-2">
        <div className="relative flex-1">
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
            placeholder={isListening ? 'Escuchando comando de voz...' : 'Buscar avisos, aulas, becas...'}
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

        <button
          type="button"
          onClick={handleMicToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            setShowVoiceChips((prev) => !prev);
          }}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
            isListening
              ? 'bg-utp-red text-white border-utp-red animate-pulse shadow-md'
              : 'bg-white text-slate-700 border-slate-300 hover:bg-red-50 hover:text-utp-red hover:border-red-200 shadow-sm'
          }`}
          title={
            isSpeechSupported
              ? isListening
                ? 'Detener comando de voz'
                : 'Ejecutar comando de voz (ej. "Mostrar becas", "Abrir tutor", "Leer avisos")'
              : 'Ver comandos de voz rápidos'
          }
          aria-label={isListening ? 'Detener reconocimiento de voz' : 'Activar comandos de voz'}
          aria-pressed={isListening}
        >
          {isListening ? <MicrophoneSlash size={18} weight="bold" /> : <Microphone size={18} weight="bold" />}
        </button>
      </div>

      {(voiceFeedback || showVoiceChips) && (
        <div
          role="status"
          aria-live="polite"
          className="mb-2.5 px-2.5 py-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-utp-red flex flex-col gap-1.5"
        >
          {voiceFeedback && <span className="font-bold">{voiceFeedback}</span>}
          {showVoiceChips && onVoiceCommand && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-slate-600 font-semibold">Comandos de voz:</span>
              {['Mostrar becas', 'Solo urgentes', 'Leer avisos', 'Abrir tutor', 'Ir a perfil'].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => {
                    onVoiceCommand(cmd);
                    setShowVoiceChips(false);
                  }}
                  className="px-2 py-0.5 rounded-full bg-white border border-red-200 text-utp-red font-semibold hover:bg-utp-red hover:text-white transition-colors"
                >
                  “{cmd}”
                </button>
              ))}
            </div>
          )}
        </div>
      )}

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

      {/* Filtros rápidos de accesibilidad y prioridad (Figma Frames 13-14) */}
      {onSelectAccessibilityFilter && (
        <div className="mt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          {[
            { id: 'all' as const, label: 'Todos los formatos' },
            { id: 'lsp' as const, label: 'Con LSP' },
            { id: 'cc' as const, label: 'Subtítulos CC' },
            { id: 'urgent' as const, label: 'Solo Urgentes' },
          ].map((f) => {
            const active = accessibilityFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectAccessibilityFilter(f.id)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Indicador de resultados cuando hay búsqueda o filtro activo */}
      {(searchQuery || selectedCategory !== 'todos' || accessibilityFilter !== 'all') &&
        typeof totalResults === 'number' && (
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between px-1">
            <span>
              {totalResults === 1 ? '1 aviso encontrado' : `${totalResults} avisos encontrados`}
            </span>
            <button
              type="button"
              onClick={() => {
                onSearchChange('');
                onSelectCategory('todos');
                if (onSelectAccessibilityFilter) onSelectAccessibilityFilter('all');
              }}
              className="text-utp-red hover:underline font-medium text-[11px] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-utp-red rounded"
            >
              Restablecer filtros
            </button>
          </div>
        )}
    </section>
  );
};

export default CategoryFilterBar;
