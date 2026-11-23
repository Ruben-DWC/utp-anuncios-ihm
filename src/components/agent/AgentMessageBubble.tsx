import React, { useState } from 'react';
import {
  Sparkle,
  User,
  Lightning,
  WifiSlash,
  Funnel,
  ArrowSquareOut,
  BookmarkSimple,
  Info,
  SpeakerHigh,
  StopCircle,
  Wrench,
} from '@phosphor-icons/react';
import { Notice, CategoryId, AgentAction } from '@/types';

export interface ChatMessageItem {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  action?: AgentAction;
  fallback?: boolean;
  latency_ms?: number;
  offlineNoticeTag?: string;
  toolsUsed?: string[];
  emotion?: 'neutral' | 'feliz' | 'celebrando' | 'disculpa';
}

export interface AgentMessageBubbleProps {
  message: ChatMessageItem;
  notices?: Notice[];
  onSelectCategory?: (category: CategoryId) => void;
  onSelectNotice?: (notice: Notice) => void;
  onSaveNotice?: (noticeId: string) => void;
  onCloseDrawer?: () => void;
}

export const AgentMessageBubble: React.FC<AgentMessageBubbleProps> = ({
  message,
  notices = [],
  onSelectCategory,
  onSelectNotice,
  onSaveNotice,
  onCloseDrawer,
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const isUser = message.sender === 'user';

  const handleToggleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.text);
    utterance.lang = 'es-PE';
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  if (isUser) {
    return (
      <div className="flex flex-col items-end animate-fade-in" role="article" aria-label="Tu consulta">
        <div className="flex items-end gap-2 max-w-[85%]">
          <div className="bg-utp-red text-white p-3.5 rounded-2xl rounded-br-none text-xs leading-relaxed shadow-xs">
            <p className="whitespace-pre-line font-normal">{message.text}</p>
            <div className="mt-1.5 flex items-center justify-end text-[10px] text-red-100">
              <span>{message.timestamp}</span>
            </div>
          </div>
          <div
            className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mb-1"
            aria-hidden="true"
          >
            <User size={13} weight="bold" />
          </div>
        </div>
      </div>
    );
  }

  const isOffline = message.fallback;
  const matchedNotice = message.action?.payload
    ? notices.find((n) => n.id === message.action?.payload || n.aula === message.action?.payload)
    : undefined;

  return (
    <div
      className="flex flex-col items-start animate-fade-in"
      role="article"
      aria-label="Respuesta del Tutor IA"
    >
      <div className="flex items-start gap-2 max-w-[90%] sm:max-w-[85%]">
        <div
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
            message.emotion === 'disculpa'
              ? 'bg-slate-600 text-white'
              : isOffline
                ? 'bg-amber-500 text-white'
                : 'bg-utp-red text-white'
          }`}
          aria-hidden="true"
        >
          {isOffline ? <WifiSlash size={14} weight="bold" /> : <Sparkle size={14} weight="fill" />}
        </div>

        <div className="flex-1 bg-white border border-slate-200 p-3.5 rounded-2xl rounded-bl-none text-xs leading-relaxed shadow-xs">
          <div className="flex items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1">
              Tutor Anuncios IA
            </span>

            <div className="flex items-center gap-1.5">
              {typeof window !== 'undefined' && 'speechSynthesis' in window && (
                <button
                  type="button"
                  onClick={handleToggleSpeak}
                  className={`p-1 rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-utp-red ${
                    isSpeaking
                      ? 'bg-red-50 text-utp-red'
                      : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                  title={isSpeaking ? 'Detener lectura en voz alta' : 'Escuchar respuesta (TTS)'}
                  aria-label={isSpeaking ? 'Detener lectura en voz alta' : 'Escuchar respuesta en voz alta'}
                >
                  {isSpeaking ? <StopCircle size={14} weight="fill" /> : <SpeakerHigh size={14} weight="bold" />}
                </button>
              )}

              {isOffline ? (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                  title="Respuesta generada por el motor local de herramientas sobre avisos vigentes"
                >
                  <WifiSlash size={10} weight="bold" className="text-amber-600" />
                  <span>Motor Local</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  title="Respuesta procesada por Gemini 2.0 Flash"
                >
                  <Lightning size={10} weight="fill" className="text-emerald-600" />
                  <span>Gemini IA {message.latency_ms ? `${message.latency_ms}ms` : ''}</span>
                </span>
              )}
            </div>
          </div>

          <p className="text-slate-700 whitespace-pre-line">{message.text}</p>

          {/* Herramientas ejecutadas */}
          {message.toolsUsed && message.toolsUsed.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-1">
              {message.toolsUsed.map((toolName) => (
                <span
                  key={toolName}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[9px] font-mono"
                >
                  <Wrench size={9} />
                  {toolName}
                </span>
              ))}
            </div>
          )}

          {/* Directivas de acción */}
          {message.action && message.action.type !== 'info' && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-2">
              {message.action.type === 'filter' && message.action.payload && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(message.action!.payload as CategoryId);
                    if (onCloseDrawer) onCloseDrawer();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-utp-red border border-red-200 rounded-xl text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
                >
                  <Funnel size={13} weight="bold" />
                  <span>Filtrar: {String(message.action.payload).toUpperCase()}</span>
                </button>
              )}

              {message.action.type === 'highlight' && matchedNotice && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectNotice) onSelectNotice(matchedNotice);
                    if (onCloseDrawer) onCloseDrawer();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <ArrowSquareOut size={13} weight="bold" />
                  <span>Abrir aviso: {matchedNotice.aula ? `Aula ${matchedNotice.aula}` : matchedNotice.id}</span>
                </button>
              )}

              {message.action.type === 'save' && message.action.payload && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSaveNotice) onSaveNotice(message.action!.payload);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                >
                  <BookmarkSimple size={13} weight="fill" />
                  <span>Guardado en Favoritos</span>
                </button>
              )}
            </div>
          )}

          {message.offlineNoticeTag && (
            <div className="mt-2 text-[10px] text-amber-700 flex items-center gap-1">
              <Info size={12} weight="fill" />
              <span>{message.offlineNoticeTag}</span>
            </div>
          )}

          <div className="mt-1.5 flex items-center justify-end text-[10px] text-slate-400">
            <span>{message.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentMessageBubble;
