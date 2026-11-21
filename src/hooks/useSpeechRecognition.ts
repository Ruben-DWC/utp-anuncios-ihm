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
  onError?: (error: string) => void;
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
    };

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
      let currentTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (item && item[0]) {
          currentTranscript += item[0].transcript;
        }
      }

      setTranscript(currentTranscript);
      if (onResult && currentTranscript.trim()) {
        onResult(currentTranscript.trim());
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
      let errorMsg = 'Error en el reconocimiento de voz';
      if (event.error === 'not-allowed') {
        errorMsg = 'Permiso de micrófono denegado.';
      } else if (event.error === 'no-speech') {
        errorMsg = 'No se detectó audio.';
      } else if (event.error === 'network') {
        errorMsg = 'Error de red en el servicio de voz.';
      }
      setError(errorMsg);
      setIsListening(false);
      if (onError) onError(errorMsg);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      try {
        recognition.abort();
      } catch {
        // Ignorar si ya estaba finalizado
      }
    };
  }, [isSupported, lang, continuous, interimResults, onResult, onError]);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('El reconocimiento de voz no está soportado en este navegador.');
      return;
    }

    if (recognitionRef.current) {
      try {
        setError(null);
        recognitionRef.current.start();
      } catch (err: any) {
        // Si ya estaba en ejecución, detener y reiniciar
        try {
          recognitionRef.current.stop();
          setTimeout(() => recognitionRef.current?.start(), 150);
        } catch {
          // Fallo no crítico
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
