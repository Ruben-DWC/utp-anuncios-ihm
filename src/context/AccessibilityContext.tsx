import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccessibilityPreferences } from '@/types';
import { triggerMultimodalAlert, setupSensoryAudioUnlock } from '@/services/sensoryFeedback';

interface AccessibilityContextType {
  preferences: AccessibilityPreferences;
  setFontScale: (scale: number) => void;
  toggleHighContrast: () => void;
  toggleStrobe: () => void;
  toggleHaptics: () => void;
  triggerSensoryAlert: (type?: 'urgent' | 'academic' | 'subtle') => void;
  isStrobeActive: boolean;
  triggerStrobePulse: (durationMs?: number) => void;
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
          return JSON.parse(saved);
        } catch {
          // Ignorar fallo de parseo
        }
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const [isStrobeActive, setIsStrobeActive] = useState(false);

  // Inicializar desbloqueo de AudioContext para el fallback de escritorio
  useEffect(() => {
    setupSensoryAudioUnlock();
  }, []);

  // Persistir cambios y aplicar variables CSS globales
  useEffect(() => {
    localStorage.setItem('utp_a11y_prefs', JSON.stringify(preferences));

    // Aplicar escala de fuente
    document.documentElement.style.setProperty('--font-scale', preferences.fontScale.toString());

    // Aplicar clase de alto contraste
    if (preferences.highContrast) {
      document.documentElement.classList.add('high-contrast-mode');
    } else {
      document.documentElement.classList.remove('high-contrast-mode');
    }
  }, [preferences]);

  const setFontScale = (scale: number) => {
    const clamped = Math.min(Math.max(scale, 1.0), 1.5);
    setPreferences((prev) => ({ ...prev, fontScale: clamped }));
  };

  const toggleHighContrast = () => {
    setPreferences((prev) => ({ ...prev, highContrast: !prev.highContrast }));
  };

  const toggleStrobe = () => {
    setPreferences((prev) => ({ ...prev, strobeAlertEnabled: !prev.strobeAlertEnabled }));
  };

  const toggleHaptics = () => {
    setPreferences((prev) => ({ ...prev, hapticFeedbackEnabled: !prev.hapticFeedbackEnabled }));
  };

  const triggerStrobePulse = (durationMs: number = 3000) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!preferences.strobeAlertEnabled || prefersReducedMotion) return;

    setIsStrobeActive(true);
    setTimeout(() => {
      setIsStrobeActive(false);
    }, durationMs);
  };

  const triggerSensoryAlert = (type: 'urgent' | 'academic' | 'subtle' = 'urgent') => {
    if (preferences.hapticFeedbackEnabled) {
      triggerMultimodalAlert(type);
    }
    if (preferences.strobeAlertEnabled && type === 'urgent') {
      triggerStrobePulse(3000);
    }
  };

  return (
    <AccessibilityContext.Provider
      value={{
        preferences,
        setFontScale,
        toggleHighContrast,
        toggleStrobe,
        toggleHaptics,
        triggerSensoryAlert,
        isStrobeActive,
        triggerStrobePulse,
      }}
    >
      {/* Contenedor perimetral con animación estroboscópica segura (2.0 Hz) */}
      <div className={`min-h-screen w-full transition-colors duration-200 ${isStrobeActive ? 'animate-strobe-safe' : ''}`}>
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
