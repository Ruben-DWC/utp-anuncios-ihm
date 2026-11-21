import React, { useEffect } from 'react';
import { Notice } from '@/types';
import {
  X,
  Clock,
  MapPin,
  BookmarkSimple,
  CheckCircle,
  Wheelchair,
  VideoCamera,
  Warning,
  ShieldCheck,
} from '@phosphor-icons/react';

export interface NoticeDetailModalProps {
  notice: Notice | null;
  isOpen: boolean;
  isFavorite: boolean;
  onClose: () => void;
  onToggleFavorite: (noticeId: string) => void;
  onConfirmRead?: (notice: Notice) => void;
}

/**
 * NoticeDetailModal Component
 * Modal interactivo de detalle de aviso institucional (Figma Frame 551:310 Detalle)
 * Cumple con accesibilidad dialog (WCAG 2.2), foco, tecla Escape y confirmación de lectura E-10.
 */
export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  isOpen,
  isFavorite,
  onClose,
  onToggleFavorite,
  onConfirmRead,
}) => {
  // Manejo de tecla Escape para cerrar
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !notice) return null;

  const handleConfirm = () => {
    if (onConfirmRead) {
      onConfirmRead(notice);
    } else {
      onToggleFavorite(notice.id);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-notice-title"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end sm:justify-center items-center p-0 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto shadow-2xl relative border border-slate-200 text-left select-none sm:select-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrastre móvil */}
        <div className="w-12 h-1 bg-slate-300 rounded-full mx-auto mb-4 sm:hidden" aria-hidden="true" />

        {/* Header con Categoría, Urgente y Botón Cerrar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-red-100 text-utp-red font-bold text-xs rounded-full uppercase tracking-wider">
              {notice.categoria}
            </span>
            {notice.urgente && (
              <span className="flex items-center gap-1 px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-black">
                <Warning size={12} weight="bold" />
                URGENTE
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-500 hover:text-slate-800 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
            title="Cerrar detalle"
            aria-label="Cerrar ventana de detalle"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        {/* Título institucional */}
        <h2 id="modal-notice-title" className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug">
          {notice.titulo}
        </h2>

        {/* Metadatos: Horario y Lugar */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100 font-medium">
          <span className="flex items-center gap-1.5">
            <Clock size={15} className="text-slate-400" />
            {notice.fecha} {notice.hora ? `• ${notice.hora}` : ''}
          </span>
          {(notice.aula || notice.pabellon) && (
            <span className="flex items-center gap-1.5 text-utp-red font-semibold">
              <MapPin size={15} weight="fill" />
              {notice.aula ? `Aula ${notice.aula}` : ''}
              {notice.aula && notice.pabellon ? ' - ' : ''}
              {notice.pabellon ? notice.pabellon : ''}
            </span>
          )}
        </div>

        {/* Cuerpo del comunicado */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-5 whitespace-pre-line">
          {notice.descripcion}
        </div>

        {/* Módulo de Accesibilidad Inclusiva Validada */}
        <div className="bg-slate-50 p-4 rounded-2xl mb-5 border border-slate-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 mb-2">
            <ShieldCheck size={16} weight="fill" className="text-utp-red" />
            <span>Soporte de Accesibilidad Inclusiva:</span>
          </div>
          <ul className="text-xs text-slate-600 space-y-2">
            {notice.lsp_disponible ? (
              <li className="flex items-start gap-2">
                <Wheelchair size={15} weight="bold" className="text-blue-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Lengua de Señas Peruana (LSP):</strong> Intérprete asignado en vivo y primera fila preferencial.
                </span>
              </li>
            ) : null}
            {notice.cc_disponible ? (
              <li className="flex items-start gap-2">
                <VideoCamera size={15} weight="bold" className="text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Subtítulos / Transcripción (CC):</strong> Proyección frontal de texto accesible en pantalla.
                </span>
              </li>
            ) : null}
            <li className="flex items-start gap-2">
              <CheckCircle size={15} weight="bold" className="text-emerald-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Alerta Sensorial:</strong> Frecuencia perimetral estroboscópica segura (&le; 2.0 Hz) y respuesta háptica.
              </span>
            </li>
          </ul>
        </div>

        {/* Botones de acción principales */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-utp-red hover:bg-utp-redDark active:scale-[0.98] text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
          >
            <CheckCircle size={18} weight="bold" />
            <span>Confirmar lectura y guardar</span>
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(notice.id)}
            className={`py-3 px-4 rounded-xl border font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
              isFavorite
                ? 'border-utp-red bg-red-50 text-utp-red'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <BookmarkSimple size={18} weight={isFavorite ? 'fill' : 'regular'} />
            <span>{isFavorite ? 'Guardado' : 'Favorito'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailModal;
