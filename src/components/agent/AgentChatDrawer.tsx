import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkle,
  X,
  PaperPlaneTilt,
  Microphone,
  MicrophoneSlash,
  Lightning,
  CheckCircle,
  WifiSlash,
  Trash,
} from '@phosphor-icons/react';
import { Notice, CategoryId, AgentAction } from '@/types';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import { useAuth } from '@/context/AuthContext';
import { runLocalAgentTools, sanitizeAgentAction } from '@/services/agentTools';
import { AgentMessageBubble, ChatMessageItem } from './AgentMessageBubble';

export interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  onSelectCategory?: (category: CategoryId) => void;
  onSelectNotice?: (notice: Notice) => void;
  onSaveNotice?: (noticeId: string) => void;
}

type AgentConnectionMode = 'online' | 'local';

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  notices,
  onSelectCategory,
  onSelectNotice,
  onSaveNotice,
}) => {
  const { currentUser } = useAuth();
  const firstName = currentUser?.name?.split(' ')[0] || 'Estudiante';

  const [chatInput, setChatInput] = useState('');
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [agentMode, setAgentMode] = useState<AgentConnectionMode>(() =>
    typeof navigator !== 'undefined' && !navigator.onLine ? 'local' : 'online'
  );
  const [agentStatusNotice, setAgentStatusNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const createWelcomeMessage = (): ChatMessageItem => ({
    id: 'welcome-01',
    sender: 'agent',
    text: `¡Hola, ${firstName}! Soy tu Tutor IA de anuncios. Puedes preguntarme sobre cambios de aula, avisos con Lengua de Señas Peruana (LSP), becas, matrícula o pagos.`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    toolsUsed: ['contexto_usuario'],
    emotion: 'feliz',
  });

  const [chatMessages, setChatMessages] = useState<ChatMessageItem[]>([createWelcomeMessage()]);

  const {
    isListening,
    isSupported: isSpeechSupported,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    lang: 'es-PE',
    onResult: (spokenText) => {
      setChatInput(spokenText);
    },
  });

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        scrollToBottom();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAgentLoading]);

  const handleClose = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    onClose();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const dispatchAgentResponse = (
    text: string,
    rawAction: AgentAction,
    isFallback: boolean,
    latencyMs?: number,
    offlineTag?: string,
    toolsUsed?: string[],
    emotion?: ChatMessageItem['emotion']
  ) => {
    const safeAction = sanitizeAgentAction(rawAction, notices);
    setAgentMode(isFallback ? 'local' : 'online');

    const agentMessage: ChatMessageItem = {
      id: `agent-${Date.now()}`,
      sender: 'agent',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: safeAction,
      fallback: isFallback,
      latency_ms: latencyMs,
      offlineNoticeTag: offlineTag,
      toolsUsed,
      emotion,
    };

    setChatMessages((prev) => [...prev, agentMessage]);

    if (safeAction.type === 'save' && safeAction.payload && onSaveNotice) {
      onSaveNotice(String(safeAction.payload));
      setAgentStatusNotice('Aviso guardado en Favoritos automáticamente.');
      setTimeout(() => setAgentStatusNotice(null), 4000);
    } else if (safeAction.type === 'filter' && safeAction.payload && onSelectCategory) {
      onSelectCategory(safeAction.payload as CategoryId);
      setAgentStatusNotice(`Feed filtrado en categoría: ${String(safeAction.payload).toUpperCase()}`);
      setTimeout(() => setAgentStatusNotice(null), 4000);
    } else if (safeAction.type === 'highlight' && safeAction.payload) {
      const targetNotice = notices.find(
        (n) => n.id === safeAction.payload || n.aula === safeAction.payload
      );
      if (targetNotice && onSelectNotice) {
        setAgentStatusNotice(`Aviso localizado: ${targetNotice.titulo}`);
        setTimeout(() => setAgentStatusNotice(null), 4000);
      }
    }
  };

  const handleResetChat = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setChatMessages([createWelcomeMessage()]);
    setAgentStatusNotice(null);
  };

  const handleSendMessage = async (e?: React.FormEvent, presetQuery?: string) => {
    if (e) e.preventDefault();
    const query = (presetQuery ?? chatInput).trim();
    if (!query || isAgentLoading) return;

    const userMessage: ChatMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const recentHistory = chatMessages.slice(-6).map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('model' as const),
      text: m.text.slice(0, 250),
    }));

    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsAgentLoading(true);
    setAgentStatusNotice(null);

    const startTime = performance.now();

    const compactNotices = notices.slice(0, 15).map((n) => ({
      id: n.id,
      titulo: n.titulo,
      categoria: n.categoria,
      urgente: n.urgente,
      aula: n.aula,
      pabellon: n.pabellon,
      lsp_disponible: n.lsp_disponible,
      cc_disponible: n.cc_disponible,
    }));

    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setTimeout(() => {
        const localRes = runLocalAgentTools(query, notices);
        const latency = Math.round(performance.now() - startTime);
        dispatchAgentResponse(
          localRes.text,
          localRes.action,
          true,
          latency,
          'Sin conexión a internet: usando motor local de herramientas.',
          localRes.toolsUsed,
          localRes.emotion
        );
        setIsAgentLoading(false);
      }, 200);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch('/.netlify/functions/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          query,
          userName: currentUser?.name || 'Estudiante',
          active_notices: compactNotices,
          history: recentHistory,
        }),
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const latency = Math.round(performance.now() - startTime);

      const fallbackMessages: Record<string, string> = {
        missing_api_key: 'Modo local activo (sin clave GEMINI_API_KEY en entorno).',
        rate_limit: 'Límite de 15 req/min alcanzado; usando motor local de herramientas.',
        timeout: 'Latencia externa superior a 2.8s; contingencia local activada.',
        upstream_error: 'Servicio externo temporalmente degradado; contingencia local activada.',
      };

      dispatchAgentResponse(
        data.text || 'Consulta procesada.',
        data.action || { type: 'info', payload: null },
        Boolean(data.fallback),
        data.latency_ms || latency,
        data.fallback
          ? fallbackMessages[data.fallbackReason] || 'Motor local de contingencia activado.'
          : undefined,
        Array.isArray(data.toolsUsed) ? data.toolsUsed : ['gemini_2_flash'],
        data.emotion || 'feliz'
      );
    } catch {
      clearTimeout(timeoutId);
      const localRes = runLocalAgentTools(query, notices);
      const latency = Math.round(performance.now() - startTime);
      dispatchAgentResponse(
        localRes.text,
        localRes.action,
        true,
        latency,
        'Contingencia local activada (entorno sin función serverless o timeout >4s).',
        localRes.toolsUsed,
        localRes.emotion
      );
    } finally {
      setIsAgentLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tutor-ia-title"
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
    >
      <div className="bg-slate-50 w-full max-w-md h-[88dvh] sm:h-[640px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Cabecera del Tutor IA con estado real de conexión */}
        <header className="p-4 bg-utp-red text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkle size={22} weight="fill" className="text-yellow-300" />
            </div>
            <div>
              <h2 id="tutor-ia-title" className="font-bold text-sm tracking-tight leading-tight">
                Tutor Anuncios IA
              </h2>
              <p className="text-[11px] text-red-100 flex items-center gap-1.5 mt-0.5">
                {isListening ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-yellow-300 animate-ping" />
                    <span>Escuchando voz (es-PE)...</span>
                  </>
                ) : isAgentLoading ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span>Consultando herramientas...</span>
                  </>
                ) : agentMode === 'local' ? (
                  <>
                    <WifiSlash size={12} weight="bold" className="text-amber-300" />
                    <span>Motor Local (Tools • Offline)</span>
                  </>
                ) : (
                  <>
                    <Lightning size={12} weight="fill" className="text-emerald-300" />
                    <span>Gemini 2.0 Flash • En línea</span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleResetChat}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Reiniciar conversación"
              aria-label="Reiniciar conversación"
            >
              <Trash size={17} weight="bold" />
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Cerrar Tutor IA (Esc)"
              aria-label="Cerrar Tutor IA"
            >
              <X size={20} weight="bold" />
            </button>
          </div>
        </header>

        {agentStatusNotice && (
          <div
            role="status"
            aria-live="polite"
            className="px-4 py-2 bg-emerald-600 text-white text-xs font-medium flex items-center gap-2 shadow-xs animate-fade-in shrink-0"
          >
            <CheckCircle size={15} weight="fill" />
            <span>{agentStatusNotice}</span>
          </div>
        )}

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
          aria-live="polite"
          aria-relevant="additions"
        >
          {chatMessages.map((msg) => (
            <AgentMessageBubble
              key={msg.id}
              message={msg}
              notices={notices}
              onSelectCategory={onSelectCategory}
              onSelectNotice={onSelectNotice}
              onSaveNotice={onSaveNotice}
              onCloseDrawer={onClose}
            />
          ))}

          {isAgentLoading && (
            <div className="flex items-start gap-2 max-w-[85%] animate-fade-in">
              <div className="w-7 h-7 rounded-xl bg-utp-red text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Sparkle size={14} weight="fill" className="animate-spin" />
              </div>
              <div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-none shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="px-4 py-2.5 bg-white border-t border-slate-200 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            '¿Dónde es mi clase de IHM hoy?',
            'Avisos con intérprete LSP',
            '¿Cuándo vence el pago?',
            'Guardar este aviso en favoritos',
          ].map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              disabled={isAgentLoading}
              onClick={() => handleSendMessage(undefined, suggestion)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-utp-red border border-slate-200 hover:border-red-200 rounded-full text-[11px] font-medium text-slate-700 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => handleSendMessage(e)}
          className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0"
        >
          {isSpeechSupported && (
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              title={isListening ? 'Detener dictado de voz' : 'Consultar por voz (es-PE)'}
              aria-label={isListening ? 'Detener micrófono' : 'Activar dictado por voz'}
            >
              {isListening ? <MicrophoneSlash size={20} weight="fill" /> : <Microphone size={20} weight="bold" />}
            </button>
          )}

          <input
            ref={inputRef}
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder={isListening ? 'Escuchando tu consulta...' : 'Pregunta sobre aulas, becas o LSP...'}
            aria-label="Escribe tu consulta para el Tutor IA"
            disabled={isAgentLoading}
            maxLength={300}
            className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl border border-transparent text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-utp-red focus:outline-none transition-all disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={!chatInput.trim() || isAgentLoading}
            className="w-10 h-10 bg-utp-red hover:bg-utp-redDark disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-all shadow-xs active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
            title="Enviar consulta"
            aria-label="Enviar consulta"
          >
            <PaperPlaneTilt size={18} weight="fill" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AgentChatDrawer;
