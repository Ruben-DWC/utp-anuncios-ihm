import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '@/context/AccessibilityContext';
import { 
  Eye, 
  X, 
  TextT, 
  Sun, 
  Lightning, 
  SpeakerHigh, 
  WarningCircle, 
  CheckCircle,
  Sparkle,
  ArrowsCounterClockwise,
  Ear
} from '@phosphor-icons/react';

export interface AccessibilityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AccessibilityPanel Component (WCAG 2.2 Niveles AA / AAA)
 * Panel modal modular de configuración sensorial inclusiva:
 * - Trampa de foco accesible (Focus Trap) y retorno de foco al cerrar (WCAG 2.1.2 y 2.4.3).
 * - Cierre por tecla Escape y click en overlay.
 * - Dimensiones táctiles mínimas >= 44x44px (WCAG 2.5.8 / 2.5.5).
 * - Respeto estricto a prefers-reduced-motion: reduce y límite fotosensible <= 2.0 Hz (WCAG 2.3.1 / 2.3.3).
 */
export const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
  const {
    preferences,
    setFontScale,
    toggleHighContrast,
    toggleStrobe,
    toggleHaptics,
    toggleScreenReaderOptimized,
    resetPreferences,
    triggerSensoryAlert,
    triggerStrobePulse,
    isReducedMotion,
  } = useAccessibility();

  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Gestión de foco accesible (Focus Trap y foco previo)
  useEffect(() => {
    if (!isOpen) return;

    // Guardar elemento activo previo para restaurar el foco al cerrar
    if (document.activeElement instanceof HTMLElement) {
      previousActiveElementRef.current = document.activeElement;
    }

    // Enfoque inicial accesible
    const focusTimer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      // Trampa de foco (Tab / Shift+Tab)
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const focusable = Array.from(focusableElements).filter(
          (el) => !el.hasAttribute('disabled') && el.offsetParent !== null
        );

        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (firstElement && lastElement) {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      // Restaurar foco al botón que abrió el modal
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4 transition-opacity animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="a11y-panel-title"
      aria-describedby="a11y-panel-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        ref={panelRef}
        className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto focus:outline-none accessible-card"
        tabIndex={-1}
      >
        {/* Cabecera del panel modal */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2.5 text-utp-red font-bold text-base">
            <div className="p-2 bg-red-50 rounded-xl text-utp-red" aria-hidden="true">
              <Eye size={22} weight="bold" />
            </div>
            <div>
              <h2 id="a11y-panel-title" className="leading-tight text-slate-900 font-bold">
                Accesibilidad Sensorial Inclusiva
              </h2>
              <span className="text-[11px] text-slate-500 font-medium">
                Conforme a WCAG 2.2 Niveles AA / AAA (POUR)
              </span>
            </div>
          </div>
          <button 
            ref={closeButtonRef}
            onClick={onClose} 
            className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:ring-2 focus:ring-utp-red"
            aria-label="Cerrar panel de accesibilidad"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        <p id="a11y-panel-desc" className="sr-only">
          Panel de configuración con escala de fuentes hasta 150%, modo alto contraste AAA superior a 7:1, destello perimetral seguro de 2.0 Hz y fallback háptico acústico de 60 Hz.
        </p>

        {/* Notificación de Reducción de Movimiento activa en el SO (WCAG 2.3.3) */}
        {isReducedMotion && (
          <div 
            className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
            role="status"
          >
            <WarningCircle size={20} className="text-amber-600 mt-0.5 shrink-0" weight="fill" />
            <div className="text-xs text-amber-900">
              <strong className="font-bold block">Reducción de movimiento activa en tu sistema</strong>
              Por tu seguridad vestibular y fotosensible (WCAG 2.3.3), los destellos perimetrales y las sacudidas visuales han sido desactivados automáticamente.
            </div>
          </div>
        )}

        {/* 1. Control de Escala Tipográfica Fluida (100% a 150%) */}
        <section className="mb-5 bg-slate-50 p-4 rounded-2xl border border-slate-200" aria-labelledby="heading-font-scale">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2 text-slate-800 font-bold text-xs" id="heading-font-scale">
              <TextT size={18} weight="bold" className="text-utp-red" />
              <span>Escala tipográfica proporcional</span>
            </div>
            <span className="px-2 py-0.5 bg-utp-red/10 text-utp-red rounded-lg font-bold text-xs">
              {Math.round(preferences.fontScale * 100)}%
            </span>
          </div>

          <p className="text-[11px] text-slate-500 mb-3">
            Escala todo el texto y espaciados rem proporcionalmente sin truncar información (WCAG 1.4.4).
          </p>

          <input
            type="range"
            min="1.0"
            max="1.5"
            step="0.05"
            value={preferences.fontScale}
            onChange={(e) => setFontScale(parseFloat(e.target.value))}
            className="w-full accent-utp-red h-2 bg-slate-200 rounded-lg cursor-pointer mb-3"
            aria-label="Escala de tamaño de texto del 100% al 150%"
            aria-valuemin={100}
            aria-valuemax={150}
            aria-valuenow={Math.round(preferences.fontScale * 100)}
            aria-valuetext={`${Math.round(preferences.fontScale * 100)} por ciento`}
          />

          {/* Presets rápidos con área táctil accesible */}
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setFontScale(1.0)}
              className={`min-h-[44px] py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                preferences.fontScale === 1.0 
                  ? 'bg-utp-red text-white border-utp-red shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              100% Estándar
            </button>
            <button
              type="button"
              onClick={() => setFontScale(1.25)}
              className={`min-h-[44px] py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                preferences.fontScale === 1.25 
                  ? 'bg-utp-red text-white border-utp-red shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              125% Mediano
            </button>
            <button
              type="button"
              onClick={() => setFontScale(1.5)}
              className={`min-h-[44px] py-1.5 px-2 text-xs font-semibold rounded-xl border transition-all ${
                preferences.fontScale === 1.5 
                  ? 'bg-utp-red text-white border-utp-red shadow-sm' 
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
            >
              150% Grande AAA
            </button>
          </div>
        </section>

        {/* 2. Interruptores de Accesibilidad Sensorial */}
        <section className="space-y-3 mb-5" aria-label="Interruptores de interacción sensorial">
          {/* Modo Alto Contraste AAA */}
          <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors min-h-[52px]">
            <div className="flex items-start gap-3 pr-2">
              <Sun size={20} weight="bold" className="text-amber-500 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">Modo Alto Contraste (AAA)</span>
                <span className="text-[11px] text-slate-500">
                  Fondo negro puro con ratio de luminancia contrastada superior a 7:1 (WCAG 1.4.6).
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={preferences.highContrast}
              onChange={toggleHighContrast}
              aria-checked={preferences.highContrast}
              className="w-5 h-5 accent-utp-red shrink-0 cursor-pointer min-w-[20px] min-h-[20px]"
            />
          </label>

          {/* Destellos visuales seguros */}
          <label className={`flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200 transition-colors min-h-[52px] ${
            isReducedMotion ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-100 cursor-pointer'
          }`}>
            <div className="flex items-start gap-3 pr-2">
              <Lightning size={20} weight="bold" className="text-utp-red mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Destello perimetral seguro (&le; 2.0 Hz)
                  </span>
                  <span className="text-[10px] bg-red-100 text-utp-red px-1.5 py-0.2 rounded font-mono font-bold">
                    WCAG 2.3.1
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Acotado estrictamente por debajo del umbral fotosensible (máx. 2 pulsos/seg).
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={preferences.strobeAlertEnabled && !isReducedMotion}
              onChange={toggleStrobe}
              disabled={isReducedMotion}
              aria-checked={preferences.strobeAlertEnabled && !isReducedMotion}
              className="w-5 h-5 accent-utp-red shrink-0 cursor-pointer min-w-[20px] min-h-[20px]"
            />
          </label>

          {/* Alertas hápticas y acústicas */}
          <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors min-h-[52px]">
            <div className="flex items-start gap-3 pr-2">
              <SpeakerHigh size={20} weight="bold" className="text-blue-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Alertas sensoriales hápticas y acústicas
                </span>
                <span className="text-[11px] text-slate-500">
                  Vibración en smartphones y tono táctil Web Audio 60 Hz en laptops del jurado.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={preferences.hapticFeedbackEnabled}
              onChange={toggleHaptics}
              aria-checked={preferences.hapticFeedbackEnabled}
              className="w-5 h-5 accent-utp-red shrink-0 cursor-pointer min-w-[20px] min-h-[20px]"
            />
          </label>

          {/* Optimización de lector de pantalla */}
          <label className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 cursor-pointer transition-colors min-h-[52px]">
            <div className="flex items-start gap-3 pr-2">
              <Ear size={20} weight="bold" className="text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-800 block">
                  Modo Lector de Pantalla optimizado
                </span>
                <span className="text-[11px] text-slate-500">
                  Prioriza descripciones verbales ampliadas y reduce ornamentos decorativos.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              role="switch"
              checked={preferences.screenReaderOptimized}
              onChange={toggleScreenReaderOptimized}
              aria-checked={preferences.screenReaderOptimized}
              className="w-5 h-5 accent-utp-red shrink-0 cursor-pointer min-w-[20px] min-h-[20px]"
            />
          </label>
        </section>

        {/* 3. Pruebas interactivas de demostración para el jurado */}
        <section className="space-y-2 mb-5" aria-label="Demostración interactiva de accesibilidad">
          <button
            type="button"
            onClick={() => triggerSensoryAlert('urgent')}
            className="w-full min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-300 transition-colors focus:ring-2 focus:ring-utp-red"
          >
            <Sparkle size={18} weight="bold" className="text-utp-red" />
            <span>Probar alerta multimodal sensorial completa (60 Hz + vibración)</span>
          </button>

          {!isReducedMotion && (
            <button
              type="button"
              onClick={() => triggerStrobePulse(2000)}
              className="w-full min-h-[44px] py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-slate-200 transition-colors"
            >
              <Lightning size={16} weight="bold" className="text-utp-red" />
              <span>Probar destello perimetral seguro de 2.0 Hz (2 segundos)</span>
            </button>
          )}
        </section>

        {/* 4. Botones de Acción (Restablecer y Guardar) */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={resetPreferences}
            className="min-h-[44px] px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
            title="Restablecer valores predeterminados"
          >
            <ArrowsCounterClockwise size={16} />
            <span>Valores por defecto</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] py-3 bg-utp-red hover:bg-utp-redDark text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 focus:ring-2 focus:ring-offset-2 focus:ring-utp-red"
          >
            <CheckCircle size={18} weight="bold" />
            <span>Guardar y volver</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessibilityPanel;
