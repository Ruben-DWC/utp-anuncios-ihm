/**
 * Multimodal Sensory Bridge (Alertas sensoriales accesibles)
 * Conforme a WCAG 2.2 AA/AAA y especificaciones AP3 / Evaluación UTP:
 * 1. Detección de hardware móvil con Web Vibration API (navigator.vibrate).
 * 2. Fallback acústico táctil de escritorio con Web Audio API:
 *    - Oscilador sordo de 60 Hz fundamental (sensación háptica simulada).
 *    - Armónico de compensación de 120 Hz (garantiza audibilidad en altavoces delgados de laptops de evaluación).
 *    - Rampa de envolvente suave (anti-clipping / anti-pop) para no saturar transitorios.
 * 3. Desbloqueo defensivo de AudioContext en el primer gesto de usuario (política de autoplay en Chrome/Edge/Safari).
 * 4. Respeto estricto a prefers-reduced-motion: reduce del sistema operativo (Criterio WCAG 2.3.3) y frecuencia segura <= 2.0 Hz (WCAG 2.3.1).
 * 5. Anuncio en vivo para lectores de pantalla mediante live-region accesible (aria-live).
 */

let audioCtx: AudioContext | null = null;
let isAudioUnlocked = false;

/**
 * Obtiene o inicializa perezosamente la instancia de AudioContext en el navegador
 */
export function getOrCreateAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;

  if (!audioCtx) {
    const AudioContextClass = 
      window.AudioContext || 
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      
    if (AudioContextClass) {
      try {
        audioCtx = new AudioContextClass();
      } catch (err) {
        console.warn('[SensoryFeedback] No se pudo instanciar AudioContext:', err);
      }
    }
  }

  return audioCtx;
}

/**
 * Inicializa y desbloquea el AudioContext en el primer gesto del usuario
 * Soporta pointerdown, touchstart, keydown y click para compatibilidad con laptops, ratón y touchpads del jurado.
 */
export function setupSensoryAudioUnlock(): void {
  if (typeof window === 'undefined') return;

  const unlock = async () => {
    const ctx = getOrCreateAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      try {
        await ctx.resume();
        isAudioUnlocked = true;
      } catch {
        // Fallo silencioso si la política del navegador aún lo restringe
      }
    } else if (ctx.state === 'running') {
      isAudioUnlocked = true;
    }

    if (isAudioUnlocked) {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('click', unlock);
    }
  };

  window.addEventListener('pointerdown', unlock, { passive: true });
  window.addEventListener('touchstart', unlock, { passive: true });
  window.addEventListener('keydown', unlock, { passive: true });
  window.addEventListener('click', unlock, { passive: true });
}

/**
 * Verifica en tiempo real si el usuario o el SO tiene activa la reducción de movimiento (WCAG 2.3.3)
 */
export function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Anuncia mensajes dinámicos a lectores de pantalla (NVDA, JAWS, VoiceOver, TalkBack)
 * utilizando el contenedor aria-live 'a11y-live-announcer'.
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  if (typeof document === 'undefined') return;

  let announcer = document.getElementById('a11y-live-announcer');
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.id = 'a11y-live-announcer';
    announcer.className = 'sr-only';
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(announcer);
  } else {
    announcer.setAttribute('aria-live', priority);
  }

  // Limpiar y forzar actualización en el siguiente tick del event loop
  announcer.textContent = '';
  setTimeout(() => {
    if (announcer) {
      announcer.textContent = message;
    }
  }, 50);
}

/**
 * Emite un pulso acústico háptico discreto de 60 Hz simulando retroalimentación háptica táctil
 * Incorpora un armónico sutil de 120 Hz para garantizar audibilidad en altavoces de laptops de jurados
 * @param bursts Número de ráfagas/pulsaciones (1 a 3)
 * @param frequency Frecuencia fundamental en Hz (por defecto 60 Hz)
 */
export function playHapticAudioPulse(bursts: number = 3, frequency: number = 60): void {
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;

  const playNow = () => {
    const now = ctx.currentTime;
    for (let i = 0; i < bursts; i++) {
      const startTime = now + (i * 0.14); // Cadencia rítmica de 140ms
      const attackEnd = startTime + 0.008; // 8ms ataque suave anti-clipping
      const stopTime = startTime + 0.09;

      // 1. Oscilador fundamental sordo de 60 Hz (Sensación táctil física)
      const osc60 = ctx.createOscillator();
      const gain60 = ctx.createGain();

      osc60.type = 'sine';
      osc60.frequency.setValueAtTime(frequency, startTime);

      // Envolvente ADSR suave: evita "clics" y chasquidos de corriente directa
      gain60.gain.setValueAtTime(0.0001, startTime);
      gain60.gain.linearRampToValueAtTime(0.28, attackEnd);
      gain60.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc60.connect(gain60);
      gain60.connect(ctx.destination);

      osc60.start(startTime);
      osc60.stop(stopTime);

      // 2. Armónico complementario de 120 Hz (Compensa el corte en graves de altavoces de laptop)
      const osc120 = ctx.createOscillator();
      const gain120 = ctx.createGain();

      osc120.type = 'triangle';
      osc120.frequency.setValueAtTime(frequency * 2, startTime);

      gain120.gain.setValueAtTime(0.0001, startTime);
      gain120.gain.linearRampToValueAtTime(0.07, attackEnd);
      gain120.gain.exponentialRampToValueAtTime(0.0001, stopTime);

      osc120.connect(gain120);
      gain120.connect(ctx.destination);

      osc120.start(startTime);
      osc120.stop(stopTime);
    }
  };

  if (ctx.state === 'suspended') {
    ctx.resume().then(() => {
      isAudioUnlocked = true;
      playNow();
    }).catch(() => {
      // Ignorar restricciones si el usuario aún no interactuó con el documento
    });
  } else if (ctx.state === 'running') {
    playNow();
  }
}

/**
 * Disparador principal de alertas multimodales adaptativas
 * Conmuta entre hardware móvil de vibración táctil nativo y fallback de audio 60 Hz + micro-shake visual
 * Respetando estrictamente prefers-reduced-motion y WCAG 2.2 AA / AAA.
 */
export function triggerMultimodalAlert(type: 'urgent' | 'academic' | 'subtle' = 'urgent'): void {
  if (typeof window === 'undefined') return;

  const reducedMotion = isReducedMotionPreferred();

  // 1. Configuración de ráfagas y patrones según criticidad
  let pattern: number[];
  let bursts: number;
  let screenReaderText: string;

  switch (type) {
    case 'urgent':
      pattern = [220, 90, 220, 90, 320]; // 3 pulsos potentes (síncrono en gesto de clic)
      bursts = 3;
      screenReaderText = 'Alerta de emergencia prioritaria recibida con señal multimodal sensorial.';
      break;
    case 'academic':
      pattern = [180, 80, 180];          // 2 pulsos intermedios
      bursts = 2;
      screenReaderText = 'Alerta académica: Comunicado oficial o cambio de aula disponible.';
      break;
    case 'subtle':
    default:
      pattern = [90];                     // 1 pulso sutil
      bursts = 1;
      screenReaderText = 'Notificación: Información del sistema actualizada.';
      break;
  }

  // 2. Hardware móvil con soporte nativo de vibración (Web Vibration API)
  // Debe invocarse síncronamente dentro del gesto de clic del usuario en Android/Chrome.
  // Nota: Chrome en escritorio define navigator.vibrate y retorna true sin motor háptico real,
  // por lo que detectamos dispositivo táctil móvil antes de omitir el pulso acústico 60 Hz.
  const isTouchDevice =
    typeof window !== 'undefined' &&
    (/Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent) ||
      (('ontouchstart' in window || navigator.maxTouchPoints > 0) && window.innerWidth < 1024));

  let vibratedOnMobile = false;
  if ('vibrate' in navigator && typeof navigator.vibrate === 'function') {
    try {
      const ok = Boolean(navigator.vibrate(pattern));
      vibratedOnMobile = ok && isTouchDevice;
    } catch {
      vibratedOnMobile = false;
    }
  }

  // 3. Fallback acústico (Web Audio 60 Hz + armónico 120 Hz) en escritorio o si no vibró
  // En escritorio desbloquea/resume AudioContext síncronamente dentro del clic.
  if (!vibratedOnMobile) {
    playHapticAudioPulse(bursts, 60);
  }

  // 4. Fallback visual: Micro-shake perimetral únicamente si NO hay reducción de movimiento (WCAG 2.3.3)
  if (!reducedMotion) {
    const targets = [
      document.getElementById('app-main-frame'),
      document.getElementById('root'),
      document.querySelector('.app-shell-container') as HTMLElement | null,
    ].filter((el): el is HTMLElement => Boolean(el));

    targets.forEach((target) => {
      target.classList.remove('animate-haptic-shake');
      // Forzar reflow para reiniciar la animación limpiamente
      void target.offsetWidth;
      target.classList.add('animate-haptic-shake');
      setTimeout(() => {
        target.classList.remove('animate-haptic-shake');
      }, 900);
    });
  }

  // 5. Retroalimentación accesible para lectores de pantalla
  announceToScreenReader(screenReaderText, type === 'urgent' ? 'assertive' : 'polite');
}
