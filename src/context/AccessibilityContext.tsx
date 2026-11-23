import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { AccessibilityPreferences } from '@/types';
import { 
  triggerMultimodalAlert, 
  setupSensoryAudioUnlock, 
  isReducedMotionPreferred,
  announceToScreenReader
} from '@/services/sensoryFeedback';

export interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  setFontScale: (scale: number) => void;
  toggleHighContrast: () => void;
  toggleStrobe: () => void;
  toggleHaptics: () => void;
  toggleScreenReaderOptimized: () => void;
  resetPreferences: () => void;
  triggerSensoryAlert: (type?: 'urgent' | 'academic' | 'subtle') => void;
  isStrobeActive: boolean;
  triggerStrobePulse: (durationMs?: number) => void;
  isReducedMotion: boolean;
}

const DEFAULT_PREFERENCES: AccessibilityPreferences = {
  fontScale: 1.0,
  highContrast: false,
  strobeAlertEnabled: true,
  hapticFeedbackEnabled: true,
  screenReaderOptimized: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [preferences, setPreferences] = useState<AccessibilityPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('utp_a11y_prefs');
      if (saved) {
        try {
          return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
        } catch {
          // Fallo silencioso si hay corrupción de datos
        }
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [isStrobeActive, setIsStrobeActive] = useState(false);
  const [sensoryAlertBanner, setSensoryAlertBanner] = useState<string | null>(null);
  const [isReducedMotion, setIsReducedMotion] = useState<boolean>(() => isReducedMotionPreferred());
  const strobeTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar desbloqueo de AudioContext para el fallback de laptops de evaluación
  useEffect(() => {
    setupSensoryAudioUnlock();
  }, []);

  // Monitorizar cambios en prefers-reduced-motion a nivel del Sistema Operativo en tiempo real
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const reduced = e.matches;
      setIsReducedMotion(reduced);
      if (reduced) {
        // Cancelar inmediatamente cualquier destello activo por seguridad fotosensible y vestibular (WCAG 2.3.1 / 2.3.3)
        setIsStrobeActive(false);
        if (strobeTimerRef.current) {
          clearTimeout(strobeTimerRef.current);
          strobeTimerRef.current = null;
        }
        announceToScreenReader('Reducción de movimiento detectada activa en el sistema. Destellos visuales desactivados.', 'polite');
      }
    };

    setIsReducedMotion(mediaQuery.matches);
    try {
      mediaQuery.addEventListener('change', handleMotionChange);
      return () => mediaQuery.removeEventListener('change', handleMotionChange);
    } catch {
      // Compatibilidad con navegadores antiguos
      mediaQuery.addListener(handleMotionChange);
      return () => mediaQuery.removeListener(handleMotionChange);
    }
  }, []);

  // Persistir preferencias y aplicar variables CSS globales y escala de raíz (Root REM)
  useEffect(() => {
    try {
      localStorage.setItem('utp_a11y_prefs', JSON.stringify(preferences));
    } catch {
      // Ignorar si localStorage está restringido
    }

    // 1. Aplicar escala tipográfica fluida (100% a 150%) sin deformar el layout
    const clampedScale = Math.min(Math.max(preferences.fontScale, 1.0), 1.5);
    document.documentElement.style.setProperty('--font-scale', clampedScale.toString());
    document.documentElement.style.fontSize = `${clampedScale * 100}%`;

    // 2. Aplicar modo Alto Contraste (AAA - ratio > 7:1)
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
      document.documentElement.setAttribute('data-contrast', 'high-aaa');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
      document.documentElement.removeAttribute('data-contrast');
    }

    // 3. Optimización para lectores de pantalla
    if (preferences.screenReaderOptimized) {
      document.documentElement.setAttribute('data-sr-optimized', 'true');
    } else {
      document.documentElement.removeAttribute('data-sr-optimized');
    }
  }, [preferences]);

  // Modificador de escala tipográfica con acotación matemática estricta [1.0, 1.5]
  const setFontScale = useCallback((scale: number) => {
    const clamped = Math.min(Math.max(Number(scale.toFixed(2)), 1.0), 1.5);
    setPreferences((prev) => ({ ...prev, fontScale: clamped }));
    announceToScreenReader(`Tamaño de fuente ajustado a ${Math.round(clamped * 100)} por ciento`);
  }, []);

  const toggleHighContrast = useCallback(() => {
    setPreferences((prev) => {
      const next = !prev.highContrast;
      announceToScreenReader(next ? 'Modo Alto Contraste AAA activado' : 'Modo Alto Contraste desactivado');
      return { ...prev, highContrast: next };
    });
  }, []);

  const toggleStrobe = useCallback(() => {
    setPreferences((prev) => {
      const next = !prev.strobeAlertEnabled;
      announceToScreenReader(next ? 'Destellos visuales seguros activados' : 'Destellos visuales desactivados');
      return { ...prev, strobeAlertEnabled: next };
    });
  }, []);

  const toggleHaptics = useCallback(() => {
    setPreferences((prev) => {
      const next = !prev.hapticFeedbackEnabled;
      announceToScreenReader(next ? 'Alertas hápticas y acústicas de 60 Hz activadas' : 'Alertas hápticas y acústicas desactivadas');
      return { ...prev, hapticFeedbackEnabled: next };
    });
  }, []);

  const toggleScreenReaderOptimized = useCallback(() => {
    setPreferences((prev) => {
      const next = !prev.screenReaderOptimized;
      announceToScreenReader(next ? 'Optimización de lector de pantalla activada' : 'Optimización de lector de pantalla desactivada');
      return { ...prev, screenReaderOptimized: next };
    });
  }, []);

  const resetPreferences = useCallback(() => {
    setPreferences(DEFAULT_PREFERENCES);
    announceToScreenReader('Preferencias de accesibilidad restablecidas a valores estándar de fábrica');
  }, []);

  // Disparo de destello perimetral seguro acotado estrictamente a <= 2.0 Hz (WCAG 2.3.1)
  const triggerStrobePulse = useCallback((durationMs: number = 3000) => {
    if (!preferences.strobeAlertEnabled) {
      return;
    }

    if (strobeTimerRef.current) {
      clearTimeout(strobeTimerRef.current);
    }

    const reduced = isReducedMotionPreferred() || isReducedMotion;
    setIsStrobeActive(true);
    setSensoryAlertBanner(
      reduced
        ? 'Alerta Visual Segura Activa (borde estático por reducción de movimiento)'
        : 'Alerta Multimodal Activa: Destello ≤ 2.0 Hz + Pulso 60 Hz / Háptica'
    );
    strobeTimerRef.current = setTimeout(() => {
      setIsStrobeActive(false);
      setSensoryAlertBanner(null);
      strobeTimerRef.current = null;
    }, durationMs);
  }, [preferences.strobeAlertEnabled, isReducedMotion]);

  // Orquestador de alertas sensoriales multimodales adaptativas
  const triggerSensoryAlert = useCallback((type: 'urgent' | 'academic' | 'subtle' = 'urgent') => {
    if (preferences.hapticFeedbackEnabled) {
      triggerMultimodalAlert(type);
    }
    if (preferences.strobeAlertEnabled && type === 'urgent') {
      triggerStrobePulse(3000);
    } else if (!preferences.strobeAlertEnabled && preferences.hapticFeedbackEnabled) {
      setSensoryAlertBanner('Alerta Háptica / Acústica (60 Hz) activada');
      setTimeout(() => setSensoryAlertBanner(null), 2500);
    }
  }, [preferences.hapticFeedbackEnabled, preferences.strobeAlertEnabled, triggerStrobePulse]);

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        setFontScale,
        toggleHighContrast,
        toggleStrobe,
        toggleHaptics,
        toggleScreenReaderOptimized,
        resetPreferences,
        triggerSensoryAlert,
        isStrobeActive,
        triggerStrobePulse,
        isReducedMotion,
      }}
    >
      {/* Anuncio audible y textual accesible para lectores de pantalla */}
      <div 
        id="a11y-live-announcer" 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
      />

      <div className="min-h-screen w-full transition-colors duration-200">
        {children}
      </div>

      {/* 
        Aviso perimetral estroboscópico seguro (<= 2.0 Hz) en z-[60] después de {children}
        para que sea visible incluso sobre modales/drawers (z-40 / z-50).
        Si prefers-reduced-motion está activo, muestra borde estático de alto contraste.
      */}
      {isStrobeActive && (
        <div
          className={`fixed inset-0 pointer-events-none z-[60] border-[8px] border-utp-red rounded-none shadow-[inset_0_0_32px_rgba(181,14,48,0.85)] ${
            isReducedMotion ? '' : 'animate-strobe-safe'
          }`}
          aria-hidden="true"
        />
      )}

      {sensoryAlertBanner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] px-4 py-2.5 bg-utp-red text-white text-xs font-bold rounded-2xl shadow-2xl border-2 border-white flex items-center gap-2 pointer-events-none animate-fade-in whitespace-nowrap"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping" aria-hidden="true" />
          <span>{sensoryAlertBanner}</span>
        </div>
      )}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility debe ser utilizado dentro de un AccessibilityProvider');
  }
  return context;
};
