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

interface CategoryStyleConfig {
  label: string;
  badgeClass: string;
}

const CATEGORY_STYLES: Record<string, CategoryStyleConfig> = {
  academico: { label: 'Académico', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  matricula: { label: 'Matrícula', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  becas: { label: 'Becas', badgeClass: 'bg-amber-50 text-amber-800 border-amber-200' },
  eventos: { label: 'Eventos', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  pagos: { label: 'Pagos', badgeClass: 'bg-rose-50 text-rose-800 border-rose-200' },
  todos: { label: 'General', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' },
};

const DEFAULT_CATEGORY_STYLE: CategoryStyleConfig = {
  label: 'General',
  badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
};

/**
 * NoticeDetailModal Component
 * Modal interactivo accesible para la lectura detallada de comunicados oficiales UTP.
 * Presenta especificaciones de accesibilidad (LSP, CC), localización física
 * y botón para confirmar constancia oficial de lectura.
 */
export const NoticeDetailModal: React.FC<NoticeDetailModalProps> = ({
  notice,
  isOpen,
  isFavorite,
  onClose,
  onToggleFavorite,
  onConfirmRead,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !notice) return null;

  const catStyle = CATEGORY_STYLES[notice.categoria] || DEFAULT_CATEGORY_STYLE;

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
      className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex flex-col justify-end transition-opacity duration-300"
    >
      {/* Backdrop click to dismiss */}
      <div
        className="flex-1 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card Drawer */}
      <div className="bg-white rounded-t-3xl p-5 sm:p-6 max-h-[88%] overflow-y-auto shadow-2xl border-t border-slate-200 transition-transform duration-300">
        {/* Barra superior de categoría y botón cerrar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${catStyle.badgeClass}`}
            >
              {catStyle.label}
            </span>
            {notice.urgente && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-red-100 text-utp-red border border-red-200 rounded-full text-[11px] font-black">
                <Warning size={14} weight="bold" />
                <span>URGENTE</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
            title="Cerrar ventana de detalle"
            aria-label="Cerrar detalle del aviso"
          >
            <X size={20} weight="bold" />
          </button>
        </div>

        {/* Título del anuncio */}
        <h2
          id="modal-notice-title"
          className="text-base sm:text-lg font-bold text-slate-900 mb-2 leading-snug"
        >
          {notice.titulo}
        </h2>

        {/* Metadatos: Horario y Lugar */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4 pb-3 border-b border-slate-100">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock size={16} className="text-slate-400" />
            <span>{notice.fecha}{notice.hora ? ` • ${notice.hora}` : ''}</span>
          </span>

          {(notice.aula || notice.pabellon) && (
            <span className="flex items-center gap-1.5 font-medium text-utp-red">
              <MapPin size={16} weight="fill" />
              <span>
                {notice.aula ? `Aula ${notice.aula}` : ''}
                {notice.aula && notice.pabellon ? ' — ' : ''}
                {notice.pabellon ? notice.pabellon : ''}
              </span>
            </span>
          )}
        </div>

        {/* Cuerpo del anuncio */}
        <div className="text-xs sm:text-sm text-slate-700 leading-relaxed mb-6 whitespace-pre-line space-y-2">
          {notice.descripcion}
        </div>

        {/* Módulo de validación de soporte accesible */}
        <div className="bg-slate-50 p-4 rounded-2xl mb-6 border border-slate-200/80">
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold text-xs">
            <ShieldCheck size={18} className="text-utp-red" weight="fill" />
            <span>Soportes de Accesibilidad Inclusiva Validados:</span>
          </div>

          <ul className="text-[11px] sm:text-xs text-slate-600 space-y-2">
            {notice.lsp_disponible ? (
              <li className="flex items-center gap-2 text-blue-900 font-medium">
                <Wheelchair size={16} className="text-blue-600" weight="bold" />
                <span>Intérprete de Lengua de Señas Peruana (LSP) asignado para este aviso.</span>
              </li>
            ) : (
              <li className="flex items-center gap-2 text-slate-500">
                <span className="w-4 text-center">•</span>
                <span>Transcripción textual completa disponible.</span>
              </li>
            )}

            {notice.cc_disponible ? (
              <li className="flex items-center gap-2 text-purple-900 font-medium">
                <VideoCamera size={16} className="text-purple-600" weight="bold" />
                <span>Subtítulos sincronizados y Closed Captioning activo.</span>
              </li>
            ) : null}

            <li className="flex items-center gap-2 text-emerald-800">
              <CheckCircle size={16} className="text-emerald-600" weight="fill" />
              <span>Destello visual seguro verificado (&le; 2.0 Hz) y micro-alerta acústica (60 Hz).</span>
            </li>
          </ul>
        </div>

        {/* Botones de acción inferior */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleFavorite(notice.id)}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
              isFavorite
                ? 'bg-red-50 text-utp-red border border-red-200'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95'
            }`}
            title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          >
            <BookmarkSimple
              size={22}
              weight={isFavorite ? 'fill' : 'regular'}
              className={isFavorite ? 'text-utp-red' : 'text-slate-600'}
            />
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 bg-utp-red hover:bg-utp-redDark text-white text-xs sm:text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-98 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red"
          >
            <CheckCircle size={18} weight="bold" />
            <span>Confirmar lectura y registrar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailModal;
