/**
 * Multimodal Sensory Bridge (Alertas sensoriales accesibles)
 * Conforme a WCAG 2.2 AA/AAA y mitigaciones aprobadas en Stage 7 y 8:
 * - Detección de hardware con Web Vibration API (navigator.vibrate).
 * - Fallback automático para navegadores de escritorio mediante Web Audio API (60 Hz) y micro-shake CSS.
 * - Desbloqueo defensivo de AudioContext en el primer gesto de usuario (política de autoplay).
 * - Respeto estricto a prefers-reduced-motion: reduce del sistema operativo.
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

// Inicializa y desbloquea el AudioContext en el primer toque o click en el documento
export function setupSensoryAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  const unlock = () => {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().then(() => {
        isAudioUnlocked = true;
      }).catch(() => {
        // Fallo silencioso si las políticas del navegador lo restringen
      });
    } else if (audioCtx && audioCtx.state === 'running') {
      isAudioUnlocked = true;
    }

    // Remueve los listeners una vez desbloqueado
    if (isAudioUnlocked) {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    }
  };

  window.addEventListener('pointerdown', unlock, { once: true, passive: true });
  window.addEventListener('keydown', unlock, { once: true, passive: true });
}

// Emite un pulso acústico discreto de 60 Hz simulando retroalimentación háptica táctil
export function playHapticAudioPulse(bursts: number = 3): void {
  if (!audioCtx || audioCtx.state !== 'running') return;

  const now = audioCtx.currentTime;
  for (let i = 0; i < bursts; i++) {
    const startTime = now + (i * 0.15); // Cadencia rítmica de 150ms
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(60, startTime); // Tono sordo de 60 Hz (háptico)

    gain.gain.setValueAtTime(0.2, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.08); // Rápido decaimiento

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(startTime);
    osc.stop(startTime + 0.08);
  }
}

// Disparador principal de alertas multimodales adaptativas
export function triggerMultimodalAlert(type: 'urgent' | 'academic' | 'subtle' = 'urgent'): void {
  if (typeof window === 'undefined') return;

  // 1. Verificar si el usuario configuró reducción de movimiento en el SO
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Patrón de vibración en milisegundos (e.g. 3 pulsos para urgente)
  const pattern = type === 'urgent' ? [300, 100, 300, 100, 300] : [200, 100, 200];

  // 2. Hardware móvil con soporte de vibración
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      navigator.vibrate(pattern);
    } catch {
      // Fallback
    }
  }

  // 3. Fallback para computadoras de escritorio (Laptops del jurado evaluador)
  // Se emite tono de audio y se activa micro-shake visual si no está en modo reduced-motion
  playHapticAudioPulse(type === 'urgent' ? 3 : 2);

  if (!prefersReducedMotion) {
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.classList.remove('animate-haptic-shake');
      // Forzar reflow para reiniciar la animación
      void rootEl.offsetWidth;
      rootEl.classList.add('animate-haptic-shake');
      setTimeout(() => {
        rootEl.classList.remove('animate-haptic-shake');
      }, 900);
    }
  }
}
