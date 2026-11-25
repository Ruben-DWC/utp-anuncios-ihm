import { useState, useEffect, useRef, useCallback } from 'react';

// Tipado para la Web Speech API en navegadores estándar y WebKit
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    length: number;
    item(index: number): {
      isFinal: boolean;
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
    [index: number]: {
      isFinal: boolean;
      length: number;
      item(index: number): {
        transcript: string;
        confidence: number;
      };
      [index: number]: {
        transcript: string;
        confidence: number;
      };
    };
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface IWindowWithSpeech extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export interface UseSpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (transcript: string) => void;
  onError?: (error: string, code?: string) => void;
}

export interface UseSpeechRecognitionReturn {
  transcript: string;
  isListening: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;
}

/**
 * Hook de Reconocimiento de Voz Inclusivo (Web Speech API)
 * Optimizado para consultas orales al Tutor IA en español peruano (es-PE).
 * Provee fallback transparente cuando el navegador o dispositivo no soporta la API.
 */
export const useSpeechRecognition = (
  options: UseSpeechRecognitionOptions = {}
): UseSpeechRecognitionReturn => {
  const {
    lang = 'es-PE',
    continuous = false,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const onResultRef = useRef(onResult);
  const onErrorRef = useRef(onError);
  const lastTranscriptRef = useRef<string>('');
  const hasDeliveredFinalRef = useRef<boolean>(false);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const isSupported = typeof window !== 'undefined' && Boolean(
    (window as IWindowWithSpeech).SpeechRecognition ||
    (window as IWindowWithSpeech).webkitSpeechRecognition
  );

  // Inicializar la instancia de SpeechRecognition
  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition =
      (window as IWindowWithSpeech).SpeechRecognition ||
      (window as IWindowWithSpeech).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      setTranscript('');
      lastTranscriptRef.current = '';
      hasDeliveredFinalRef.current = false;
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let finalTranscript = '';
      let interimTranscript = '';
      let hasNewFinal = false;

      for (let i = 0; i < event.results.length; i++) {
        const item = event.results[i];
        if (item && item[0]) {
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
            if (i >= event.resultIndex) {
              hasNewFinal = true;
            }
          } else {
            interimTranscript += item[0].transcript;
          }
        }
      }

      const displayTranscript = (finalTranscript + interimTranscript).trim();
      setTranscript(displayTranscript);
      lastTranscriptRef.current = displayTranscript;

      const finalTrimmed = finalTranscript.trim();
      if (hasNewFinal && finalTrimmed) {
        hasDeliveredFinalRef.current = true;
        onResultRef.current?.(finalTrimmed);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      let errorMsg = 'Error en el reconocimiento de voz. Usa los comandos rápidos.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        errorMsg = 'Permiso de micrófono denegado. Actívalo o usa los comandos rápidos.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No se detectó voz en el micrófono. Intenta de nuevo o usa un comando rápido.';
      } else if (event.error === 'audio-capture') {
        errorMsg = 'No se detectó ningún micrófono disponible en el dispositivo.';
      } else if (event.error === 'network') {
        errorMsg = 'El dictado en vivo requiere Google Chrome/Edge; usa los comandos rápidos:';
      }
      setError(errorMsg);
      setIsListening(false);
      onErrorRef.current?.(errorMsg, event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
      const pending = lastTranscriptRef.current.trim();
      if (!hasDeliveredFinalRef.current && pending) {
        hasDeliveredFinalRef.current = true;
        onResultRef.current?.(pending);
      }
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignorar si ya estaba finalizado
      }
    };
  }, [isSupported, lang, continuous, interimResults]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      const msg = 'El reconocimiento de voz no está soportado en este navegador.';
      setError(msg);
      onErrorRef.current?.(msg, 'not-supported');
      return;
    }

    if (recognitionRef.current) {
      try {
        setError(null);
        setTranscript('');
        lastTranscriptRef.current = '';
        hasDeliveredFinalRef.current = false;
        recognitionRef.current.start();
      } catch {
        // Si ya estaba en ejecución, detener y reiniciar
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch {
          const msg = 'No se pudo iniciar el micrófono. Usa los comandos rápidos.';
          setError(msg);
          onErrorRef.current?.(msg, 'audio-capture');
        }
      }
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // Ignorar si no estaba activo
      }
    }
  }, []);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};
