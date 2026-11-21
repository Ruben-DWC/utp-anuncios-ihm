import React from 'react';
import { OperationalStateCode } from '@/types';
import { AP3_STATE_METADATA } from './CatalogStateView';
import {
  ShieldCheck,
  CheckCircle,
  CaretRight,
  CaretLeft,
  ArrowsClockwise,
  Info,
  X
} from '@phosphor-icons/react';

interface EvaluatorPanelProps {
  activeState: OperationalStateCode | null;
  onSelectState: (state: OperationalStateCode | null) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

const STATE_CODES: OperationalStateCode[] = [
  'E-01',
  'E-02',
  'E-03',
  'E-04',
  'E-05',
  'E-06',
  'E-07',
  'E-08',
  'E-09',
  'E-10'
];

export const EvaluatorPanel: React.FC<EvaluatorPanelProps> = ({
  activeState,
  onSelectState,
  isOpen,
  onToggleOpen
}) => {
  const currentIndex = activeState ? STATE_CODES.indexOf(activeState) : -1;

  const handlePrev = () => {
    if (currentIndex <= 0) {
      onSelectState(STATE_CODES[STATE_CODES.length - 1] ?? null);
    } else {
      onSelectState(STATE_CODES[currentIndex - 1] ?? null);
    }
  };

  const handleNext = () => {
    if (currentIndex === -1 || currentIndex >= STATE_CODES.length - 1) {
      onSelectState(STATE_CODES[0] ?? null);
    } else {
      onSelectState(STATE_CODES[currentIndex + 1] ?? null);
    }
  };

  return (
    <aside
      className={`w-full lg:w-80 bg-white rounded-3xl p-5 shadow-lg border border-slate-200 transition-all ${
        isOpen ? 'block' : 'hidden lg:block'
      }`}
      aria-label="Panel de evaluación de estados operativos AP3"
    >
      {/* Cabecera del Panel de Jurado */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div className="flex items-center gap-2 text-utp-red font-bold text-sm">
          <ShieldCheck size={22} weight="fill" />
          <span>EVALUADOR AP3 & PF</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] bg-red-100 text-utp-red font-bold px-2 py-0.5 rounded-full">
            10/10 Estados
          </span>
          <button
            type="button"
            onClick={onToggleOpen}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            title="Cerrar panel en móvil"
          >
            <X size={16} weight="bold" />
          </button>
        </div>
      </div>

      <p className="text-xs text-slate-500 mb-3 leading-relaxed">
        Catálogo de 10 Estados Diseñados por <strong>Ruben Walter Vivas (u22224908)</strong> con los 4 componentes estructurales de interacción:
      </p>

      {/* Controles de avance rápido (Carrusel de presentación para jurado) */}
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-xl mb-3 border border-slate-200 text-xs">
        <button
          type="button"
          onClick={handlePrev}
          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          title="Estado anterior"
        >
          <CaretLeft size={16} weight="bold" />
        </button>
        <span className="font-bold text-slate-700 text-[11px]">
          {activeState ? `Mostrando: ${activeState}` : 'Flujo normal activo'}
        </span>
        <button
          type="button"
          onClick={handleNext}
          className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
          title="Siguiente estado"
        >
          <CaretRight size={16} weight="bold" />
        </button>
      </div>

      {/* Lista de Estados interactivos */}
      <div className="space-y-1.5 max-h-[460px] overflow-y-auto pr-1">
        {STATE_CODES.map((code) => {
          const item = AP3_STATE_METADATA[code];
          const isSelected = activeState === code;

          return (
            <button
              key={code}
              type="button"
              onClick={() => onSelectState(isSelected ? null : code)}
              className={`w-full p-2.5 rounded-xl text-left transition-all border flex flex-col gap-1 ${
                isSelected
                  ? 'bg-utp-red text-white border-utp-red shadow-sm'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-mono text-[10px] font-black px-1.5 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {item.code}
                  </span>
                  <span className="font-bold text-xs">{item.nombre}</span>
                </div>
                {isSelected ? (
                  <CheckCircle size={14} weight="bold" />
                ) : (
                  <span className="text-[10px] text-slate-400">{item.tipo}</span>
                )}
              </div>
              <p
                className={`text-[11px] line-clamp-1 ${
                  isSelected ? 'text-red-100' : 'text-slate-500'
                }`}
              >
                {item.pantalla}
              </p>
            </button>
          );
        })}
      </div>

      {/* Botón para restablecer */}
      {activeState && (
        <button
          type="button"
          onClick={() => onSelectState(null)}
          className="mt-4 w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowsClockwise size={14} />
          <span>Restablecer a navegación normal</span>
        </button>
      )}

      {/* Nota técnica de accesibilidad */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex items-center gap-1.5">
        <Info size={14} className="text-utp-red shrink-0" />
        <span>Cumple estándar WCAG 2.2 y los 4 componentes por pantalla.</span>
      </div>
    </aside>
  );
};
