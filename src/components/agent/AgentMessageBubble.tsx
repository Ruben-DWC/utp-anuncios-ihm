import React from 'react';
import { 
  Sparkle, 
  User, 
  Lightning, 
  WifiSlash, 
  Funnel, 
  ArrowSquareOut, 
  BookmarkSimple,
  Info
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
}

export interface AgentMessageBubbleProps {
  message: ChatMessageItem;
  notices?: Notice[];
  onSelectCategory?: (category: CategoryId) => void;
  onSelectNotice?: (notice: Notice) => void;
  onSaveNotice?: (noticeId: string) => void;
  onCloseDrawer?: () => void;
}

/**
 * Burbuja de mensaje individual para el Tutor IA (Agente UTP)
 * Soporta renderizado adaptativo accesible, etiquetas de resiliencia offline/local
 * y botones interactivos de directivas de UI (filtrado, destacados y guardado).
 */
export const AgentMessageBubble: React.FC<AgentMessageBubbleProps> = ({
  message,
  notices = [],
  onSelectCategory,
  onSelectNotice,
  onSaveNotice,
  onCloseDrawer,
}) => {
  const isUser = message.sender === 'user';

  if (isUser) {
    return (
      <div 
        className="flex flex-col items-end animate-fade-in"
        role="article"
        aria-label="Tu consulta"
      >
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

  // Mensaje del Asistente IA (Tutor Anuncios IA)
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
        {/* Avatar del Tutor IA */}
        <div 
          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
            isOffline ? 'bg-amber-500 text-white' : 'bg-utp-red text-white'
          }`}
          aria-hidden="true"
        >
          {isOffline ? (
            <WifiSlash size={14} weight="bold" />
          ) : (
            <Sparkle size={14} weight="fill" />
          )}
        </div>

        {/* Contenedor del globo */}
        <div className="flex-1 bg-white border border-slate-200 p-3.5 rounded-2xl rounded-bl-none text-xs leading-relaxed shadow-xs">
          {/* Cabecera del mensaje del tutor */}
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100">
            <span className="font-bold text-[11px] text-slate-800 flex items-center gap-1">
              Tutor Anuncios IA
            </span>

            {/* Etiqueta informativa de contingencia / latencia */}
            {isOffline ? (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200"
                title="Respuesta generada por el motor de contingencia semántico local ante desconexión o timeout >4s"
              >
                <WifiSlash size={10} weight="bold" className="text-amber-600" />
                <span>Modo Local Offline</span>
              </span>
            ) : (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                title="Respuesta procesada en la nube mediante Gemini 2.0 Flash"
              >
                <Lightning size={10} weight="fill" className="text-amber-500" />
                <span>Gemini 2.0 Flash</span>
                {message.latency_ms ? ` (${message.latency_ms}ms)` : ''}
              </span>
            )}
          </div>

          {/* Texto de la respuesta */}
          <p className="text-slate-800 whitespace-pre-line font-normal">{message.text}</p>

          {/* Aviso informativo adicional si operó en modo offline */}
          {isOffline && (
            <div className="mt-2 p-2 bg-amber-50/70 rounded-lg border border-amber-200/60 text-[10px] text-amber-900 flex items-start gap-1.5">
              <Info size={13} weight="fill" className="text-amber-700 shrink-0 mt-0.5" />
              <span>
                <strong>Resiliencia local activa:</strong> Tu consulta fue resuelta por el motor semántico institucional integrado en la app (&lt;4s).
              </span>
            </div>
          )}

          {/* Directivas visuales interactivas de UI */}
          {message.action && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
              {message.action.type === 'filter' && message.action.payload && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSelectCategory) onSelectCategory(message.action?.payload as CategoryId);
                    onCloseDrawer?.();
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 text-utp-red text-[11px] font-bold hover:bg-red-100 active:scale-95 transition-all border border-red-200"
                  aria-label={`Filtrar categoría ${message.action.payload}`}
                >
                  <Funnel size={12} weight="bold" />
                  <span>Filtrar por: {message.action.payload}</span>
                  <ArrowSquareOut size={12} weight="bold" />
                </button>
              )}

              {message.action.type === 'highlight' && message.action.payload && (
                <button
                  type="button"
                  onClick={() => {
                    if (matchedNotice && onSelectNotice) {
                      onSelectNotice(matchedNotice);
                      onCloseDrawer?.();
                    } else if (onSelectCategory) {
                      onSelectCategory('academico');
                      onCloseDrawer?.();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 active:scale-95 transition-all border border-blue-200"
                  aria-label={`Abrir comunicado ${matchedNotice?.titulo || message.action.payload}`}
                >
                  <ArrowSquareOut size={12} weight="bold" />
                  <span>
                    {matchedNotice ? `Ver aviso: ${matchedNotice.titulo.substring(0, 32)}...` : `Abrir aviso #${message.action.payload}`}
                  </span>
                </button>
              )}

              {message.action.type === 'save' && message.action.payload && (
                <button
                  type="button"
                  onClick={() => {
                    if (onSaveNotice) onSaveNotice(message.action?.payload);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200"
                  aria-label="Confirmar aviso guardado en favoritos"
                >
                  <BookmarkSimple size={12} weight="fill" />
                  <span>Guardado en Mis Favoritos</span>
                </button>
              )}
            </div>
          )}

          {/* Timestamp al pie */}
          <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span>{message.timestamp}</span>
            {message.offlineNoticeTag && (
              <span className="text-[9px] text-amber-700 font-medium">
                {message.offlineNoticeTag}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
