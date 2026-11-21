import React from 'react';
import { Notice } from '@/types';
import { 
  Clock, 
  MapPin, 
  BookmarkSimple, 
  Wheelchair, 
  VideoCamera,
  Warning 
} from '@phosphor-icons/react';

export interface NoticeCardProps {
  notice: Notice;
  isFavorite: boolean;
  onSelect: (notice: Notice) => void;
  onToggleFavorite: (noticeId: string) => void;
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
 * NoticeCard Component (Figma Frame 551:310)
 * Tarjeta interactiva de aviso con badges accesibles (LSP, CC, Urgente),
 * botón de favoritos accesible y soporte de navegación por teclado.
 */
export const NoticeCard: React.FC<NoticeCardProps> = ({
  notice,
  isFavorite,
  onSelect,
  onToggleFavorite,
}) => {
  const catStyle = CATEGORY_STYLES[notice.categoria] || DEFAULT_CATEGORY_STYLE;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(notice);
    }
  };

  return (
    <article
      tabIndex={0}
      role="button"
      aria-label={`Aviso: ${notice.titulo}. Categoría ${notice.categoria}. ${notice.urgente ? 'Urgente.' : ''}`}
      onClick={() => onSelect(notice)}
      onKeyDown={handleKeyDown}
      className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-utp-red/50 transition-all cursor-pointer relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red text-left select-none"
    >
      {/* Barra superior de la tarjeta: Categoría y Hora */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${catStyle.badgeClass}`}
        >
          {catStyle.label}
        </span>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <Clock size={14} className="text-slate-400" aria-hidden="true" />
          <span>{notice.fecha}{notice.hora ? ` • ${notice.hora}` : ''}</span>
        </div>
      </div>

      {/* Título del anuncio */}
      <h2 className="font-bold text-sm sm:text-[15px] text-slate-900 mb-1.5 leading-snug group-hover:text-utp-red transition-colors line-clamp-2">
        {notice.titulo}
      </h2>

      {/* Resumen / Descripción truncada */}
      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
        {notice.descripcion}
      </p>

      {/* Información de ubicación (aula y pabellón si aplica) */}
      {(notice.aula || notice.pabellon) && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mb-3 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
          <MapPin size={14} className="text-utp-red flex-shrink-0" weight="fill" aria-hidden="true" />
          <span className="truncate">
            {notice.aula ? `Aula ${notice.aula}` : ''}
            {notice.aula && notice.pabellon ? ' • ' : ''}
            {notice.pabellon ? notice.pabellon : ''}
          </span>
        </div>
      )}

      {/* Barra inferior: Badges de accesibilidad y botón de favoritos */}
      <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
        <div className="flex items-center flex-wrap gap-1.5">
          {/* Badge LSP */}
          {notice.lsp_disponible && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200/80 rounded-md text-[10px] font-bold"
              title="Intérprete de Lengua de Señas Peruana asignado"
              aria-label="Intérprete de Lengua de Señas Peruana disponible"
            >
              <Wheelchair size={12} weight="bold" aria-hidden="true" />
              <span>LSP</span>
            </span>
          )}

          {/* Badge CC */}
          {notice.cc_disponible && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-md text-[10px] font-bold"
              title="Subtítulos y transcripción en tiempo real"
              aria-label="Subtítulos y Closed Captioning disponibles"
            >
              <VideoCamera size={12} weight="bold" aria-hidden="true" />
              <span>CC</span>
            </span>
          )}

          {/* Badge Urgente */}
          {notice.urgente && (
            <span
              className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-utp-red border border-red-200 rounded-md text-[10px] font-black tracking-wide"
              title="Aviso prioritario institucional"
            >
              <Warning size={12} weight="bold" aria-hidden="true" />
              <span>URGENTE</span>
            </span>
          )}
        </div>

        {/* Botón de Guardar en Favoritos (área táctil >= 44x44px) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(notice.id);
          }}
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-utp-red ${
            isFavorite
              ? 'text-utp-red bg-red-50 hover:bg-red-100'
              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100 active:scale-95'
          }`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          aria-label={isFavorite ? `Quitar aviso "${notice.titulo}" de favoritos` : `Guardar aviso "${notice.titulo}" en favoritos`}
        >
          <BookmarkSimple
            size={20}
            weight={isFavorite ? 'fill' : 'regular'}
            className={isFavorite ? 'text-utp-red' : 'text-slate-400'}
          />
        </button>
      </div>
    </article>
  );
};

export default NoticeCard;
