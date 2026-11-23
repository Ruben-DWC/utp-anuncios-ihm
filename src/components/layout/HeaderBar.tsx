import React from 'react';
import { Eye, BellRinging, ShieldCheck } from '@phosphor-icons/react';

export interface HeaderBarProps {
  onOpenAccessibility: () => void;
  onTriggerAlert: () => void;
  onToggleEvaluator?: () => void;
  isEvaluatorActive?: boolean;
  userName?: string;
  studentCode?: string;
  isStrobeActive?: boolean;
  unreadCount?: number;
}

/**
 * HeaderBar Component (Figma Frame 551:12)
 * Barra institucional UTP con accesibilidad y activación de alertas sensoriales.
 * Color institucional UTP: #B50E30 (bg-utp-red).
 * Diseño adaptativo mobile-first optimizado para pantallas de 320px a 430px.
 */
export const HeaderBar: React.FC<HeaderBarProps> = ({
  onOpenAccessibility,
  onTriggerAlert,
  onToggleEvaluator,
  isEvaluatorActive = false,
  userName = 'Ruben Walter',
  studentCode = 'u22224908',
  isStrobeActive = false,
  unreadCount = 0,
}) => {
  return (
    <header
      role="banner"
      className="sticky top-0 z-20 bg-utp-red text-white px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between shadow-md transition-all select-none shrink-0"
    >
      {/* Identidad Institucional UTP */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <div
          className="h-9 sm:h-10 px-2 rounded-xl bg-white/95 backdrop-blur-sm border border-white/40 flex items-center justify-center shadow-sm shrink-0"
          aria-hidden="true"
        >
          <img
            src="/assets/utp-logo-new-BPM18T9V.png"
            alt="UTP"
            className="h-6 sm:h-7 w-auto object-contain"
          />
        </div>
        <div>
          <h1 className="font-bold text-sm sm:text-base leading-tight tracking-tight text-white">
            UTP Anuncios
          </h1>
          <p className="text-[11px] sm:text-xs text-red-100 font-medium">
            {userName} • <span className="font-mono text-[10px] sm:text-[11px]">{studentCode}</span>
          </p>
        </div>
      </div>

      {/* Controles de Accesibilidad, Jurado AP3 y Alerta Multimodal */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {onToggleEvaluator && (
          <button
            type="button"
            onClick={onToggleEvaluator}
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              isEvaluatorActive
                ? 'bg-white text-utp-red shadow-md font-bold'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
            title="Panel de Jurado: 10 Estados AP3"
            aria-label="Alternar panel evaluador de estados AP3"
          >
            <ShieldCheck size={20} weight={isEvaluatorActive ? 'fill' : 'bold'} />
          </button>
        )}

        <button
          type="button"
          onClick={onOpenAccessibility}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          title="Abrir ajustes de accesibilidad inclusiva"
          aria-label="Abrir panel de accesibilidad sensorial"
        >
          <Eye size={20} weight="bold" className="text-white" />
        </button>

        <button
          type="button"
          onClick={onTriggerAlert}
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/30 transition-colors relative flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
            isStrobeActive ? 'ring-2 ring-yellow-400 bg-white/30' : ''
          }`}
          title="Abrir bandeja de notificaciones y preferencias"
          aria-label={`Abrir centro de notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
        >
          <BellRinging size={20} weight="bold" className="text-white" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-yellow-400 text-slate-900 text-[10px] font-black rounded-full flex items-center justify-center shadow-sm ring-2 ring-utp-red"
              aria-hidden="true"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default HeaderBar;
