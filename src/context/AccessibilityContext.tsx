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
    // Si el usuario desactivó destellos o el SO tiene reducción de movimiento, abortar
    if (!preferences.strobeAlertEnabled || isReducedMotionPreferred() || isReducedMotion) {
      return;
    }

    if (strobeTimerRef.current) {
      clearTimeout(strobeTimerRef.current);
    }

    setIsStrobeActive(true);
    strobeTimerRef.current = setTimeout(() => {
      setIsStrobeActive(false);
      strobeTimerRef.current = null;
    }, durationMs);
  }, [preferences.strobeAlertEnabled, isReducedMotion]);

  // Orquestador de alertas sensoriales multimodales adaptativas
  const triggerSensoryAlert = useCallback((type: 'urgent' | 'academic' | 'subtle' = 'urgent') => {
    if (preferences.hapticFeedbackEnabled) {
      triggerMultimodalAlert(type);
    }
    if (preferences.strobeAlertEnabled && !isReducedMotion && type === 'urgent') {
      triggerStrobePulse(3000);
    }
  }, [preferences.hapticFeedbackEnabled, preferences.strobeAlertEnabled, isReducedMotion, triggerStrobePulse]);

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
      {/* 
        Aviso perimetral estroboscópico seguro (<= 2.0 Hz)
        Se implementa como un anillo perimetral fijo (inset-0) con pointer-events-none 
        para abarcar toda la vista sin interferir con la navegación ni bloquear clics.
      */}
      {isStrobeActive && !isReducedMotion && (
        <div 
          className="fixed inset-0 pointer-events-none z-50 animate-strobe-safe border-4 border-utp-red/80 rounded-none shadow-[inset_0_0_24px_rgba(181,14,48,0.7)]" 
          aria-live="assertive"
          role="status"
          aria-label="Alerta perimetral de emergencia activa"
        />
      )}

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
