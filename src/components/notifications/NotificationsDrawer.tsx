import React, { useState, useEffect } from 'react';
import {
  BellRinging,
  X,
  CheckCircle,
  SlidersHorizontal,
  BellSlash,
  Warning,
  ArrowRight,
  Vibrate,
} from '@phosphor-icons/react';
import { Notice } from '@/types';

export interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notices: Notice[];
  readIds: string[];
  onSelectNotice: (notice: Notice) => void;
  onMarkAllAsRead: () => void;
  onTriggerSensoryTest: () => void;
}

/**
 * Bandeja y Preferencias de Notificaciones (Figma Frames 17 y 18)
 * Accesible desde la campana del HeaderBar. Integra estado E-03 (historial vacío),
 * lectura de alertas institucionales y conmutadores de preferencias.
 */
export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notices,
  readIds,
  onSelectNotice,
  onMarkAllAsRead,
  onTriggerSensoryTest,
}) => {
  const [activeView, setActiveView] = useState<'inbox' | 'preferences'>('inbox');
  const [prefs, setPrefs] = useState({
    urgentPush: true,
    emailDigest: true,
    visualOnlyMode: false,
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notices.filter((n) => !readIds.includes(n.id)).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="notifications-drawer-title"
      className="fixed inset-0 z-40 bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-50 w-full max-w-md h-[82dvh] sm:h-[600px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <header className="p-4 bg-utp-red text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <BellRinging size={20} weight="fill" />
            </div>
            <div>
              <h2 id="notifications-drawer-title" className="font-bold text-sm leading-tight">
                Centro de Notificaciones
              </h2>
              <p className="text-[11px] text-red-100">
                {unreadCount > 0 ? `${unreadCount} alerta(s) sin leer` : 'Todo al día'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            aria-label="Cerrar notificaciones"
          >
            <X size={20} weight="bold" />
          </button>
        </header>

        {/* Tabs internos: Bandeja (Frame 17) vs Preferencias (Frame 18) */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center justify-between gap-2 shrink-0">
          <div className="flex gap-1.5" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'inbox'}
              onClick={() => setActiveView('inbox')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                activeView === 'inbox'
                  ? 'bg-utp-red text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bandeja ({notices.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeView === 'preferences'}
              onClick={() => setActiveView('preferences')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors ${
                activeView === 'preferences'
                  ? 'bg-utp-red text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <SlidersHorizontal size={14} weight="bold" />
              <span>Preferencias</span>
            </button>
          </div>

          {activeView === 'inbox' && unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="text-[11px] font-bold text-utp-red hover:underline"
            >
              Marcar leídas
            </button>
          )}
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {activeView === 'inbox' ? (
            notices.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-500">
                  <BellSlash size={28} weight="duotone" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Sin notificaciones previas</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Cuando haya alertas urgentes o cambios de aula aparecerán en esta bandeja.
                </p>
              </div>
            ) : (
              <>
                {notices.map((notice) => {
                  const isRead = readIds.includes(notice.id);
                  return (
                    <button
                      key={notice.id}
                      type="button"
                      onClick={() => {
                        onSelectNotice(notice);
                        onClose();
                      }}
                      className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                        isRead
                          ? 'bg-white border-slate-200 opacity-80 hover:opacity-100'
                          : 'bg-red-50/40 border-red-200 shadow-xs hover:border-utp-red'
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                          notice.urgente
                            ? 'bg-red-100 text-utp-red'
                            : isRead
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {notice.urgente ? (
                          <Warning size={16} weight="bold" />
                        ) : (
                          <CheckCircle size={16} weight={isRead ? 'regular' : 'fill'} />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {notice.categoria} • {notice.fecha}
                          </span>
                          {!isRead && (
                            <span className="w-2 h-2 rounded-full bg-utp-red shrink-0" aria-label="No leído" />
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-900 mt-0.5 line-clamp-1">
                          {notice.titulo}
                        </p>
                        <p className="text-[11px] text-slate-600 line-clamp-2 mt-0.5">
                          {notice.descripcion}
                        </p>
                      </div>

                      <ArrowRight size={14} className="text-slate-400 shrink-0 mt-2" />
                    </button>
                  );
                })}
              </>
            )
          ) : (
            <div className="space-y-3">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">Canales de Alerta Institucional</h3>

                <label className="flex items-center justify-between gap-3 cursor-pointer py-1">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Alertas urgentes y aulas</p>
                    <p className="text-[11px] text-slate-500">Notificaciones inmediatas ante traslados</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.urgentPush}
                    onChange={(e) => setPrefs((p) => ({ ...p, urgentPush: e.target.checked }))}
                    className="w-4 h-4 accent-utp-red"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 cursor-pointer py-1 border-t border-slate-100 pt-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Resumen a correo @utp.edu.pe</p>
                    <p className="text-[11px] text-slate-500">Copia diaria de becas y matrícula</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.emailDigest}
                    onChange={(e) => setPrefs((p) => ({ ...p, emailDigest: e.target.checked }))}
                    className="w-4 h-4 accent-utp-red"
                  />
                </label>

                <label className="flex items-center justify-between gap-3 cursor-pointer py-1 border-t border-slate-100 pt-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">Priorizar alerta visual/háptica</p>
                    <p className="text-[11px] text-slate-500">Ideal para discapacidad auditiva</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={prefs.visualOnlyMode}
                    onChange={(e) => setPrefs((p) => ({ ...p, visualOnlyMode: e.target.checked }))}
                    className="w-4 h-4 accent-utp-red"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer: Prueba rápida de alerta sensorial multimodal */}
        <footer className="p-3.5 bg-white border-t border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onTriggerSensoryTest}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Vibrate size={16} weight="bold" className="text-yellow-300" />
            <span>Probar Alerta Sensorial Multimodal (2 Hz + 60 Hz)</span>
          </button>
        </footer>
      </div>
    </div>
  );
};

export default NotificationsDrawer;
