import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useAuth, OFFICIAL_PROFILES } from '@/context/AuthContext';
import { useNotices } from '@/context/NoticesContext';
import {
  User,
  GraduationCap,
  IdentificationCard,
  MapPin,
  BookmarkSimple,
  SlidersHorizontal,
  SignOut,
  QrCode,
  CheckCircle,
  Copy,
  Users,
  Database,
  ArrowsClockwise,
  PencilSimple,
  X,
  ArrowSquareOut,
} from '@phosphor-icons/react';

interface ProfileScreenProps {
  onOpenAccessibility: () => void;
  onNavigateToFavorites: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenAccessibility,
  onNavigateToFavorites,
}) => {
  const { currentUser, logout, switchProfile, updateProfile } = useAuth();
  const {
    favorites,
    notices,
    dataSource,
    firebaseProjectId,
    isFirebaseConfigured,
    lastSyncedAt,
    isLoadingNotices,
    refreshNotices,
  } = useNotices();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editCareer, setEditCareer] = useState('');
  const [editCampus, setEditCampus] = useState('');
  const [editCycle, setEditCycle] = useState('');
  const [editError, setEditError] = useState('');
  const [profileSavedBanner, setProfileSavedBanner] = useState(false);

  const user = currentUser || OFFICIAL_PROFILES[0]!;
  const qrUrl = `https://utp-anuncios.netlify.app/carnet/${user.code.toUpperCase()}`;
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(qrUrl, {
      width: 240,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {
        if (active) setQrDataUrl('');
      });
    return () => {
      active = false;
    };
  }, [qrUrl]);

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(user.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const openEditModal = () => {
    setEditName(user.name);
    setEditCareer(user.career);
    setEditCampus(user.campus);
    setEditCycle(user.cycle);
    setEditError('');
    setShowEditModal(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const name = editName.trim();
    const career = editCareer.trim();
    const campus = editCampus.trim();
    const cycle = editCycle.trim();

    if (!name || !career || !campus || !cycle) {
      setEditError('Todos los campos son obligatorios. Completa nombre, carrera, sede y ciclo.');
      return;
    }

    updateProfile({ name, career, campus, cycle });
    setEditError('');
    setShowEditModal(false);
    setProfileSavedBanner(true);
    setTimeout(() => setProfileSavedBanner(false), 4000);
  };

  return (
    <div className="p-4 space-y-4 pb-20 select-none animate-fade-in">
      {/* Tarjeta de Carné Digital Universitario UTP (Figma Frame 406:16) */}
      <div className="bg-gradient-to-br from-utp-red to-utp-redDark text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-red-400/30">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        {/* Cabecera del carné */}
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-white/95 px-2 py-0.5 rounded-md shadow-sm inline-flex items-center">
              <img
                src="/assets/utp-logo-new-BPM18T9V.png"
                alt="UTP"
                className="h-4 w-auto object-contain"
              />
            </span>
            <span className="text-[11px] font-semibold text-red-100 tracking-wider uppercase">
              Carné Universitario Digital
            </span>
          </div>
          <span className="text-[10px] font-mono bg-black/20 px-2 py-0.5 rounded-full text-red-100">
            {user.cycle}
          </span>
        </div>

        {/* Datos principales del estudiante */}
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center shrink-0 shadow-inner">
            <User size={36} weight="fill" className="text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="font-black text-base sm:text-lg leading-tight truncate text-white">
              {user.name}
            </h2>
            
            <div className="flex items-center gap-2 mt-1">
              <span className="font-mono text-xs font-bold text-red-100 bg-white/10 px-2 py-0.5 rounded-md">
                {user.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="text-white/80 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
                title="Copiar código de estudiante"
                aria-label="Copiar código"
              >
                {copiedCode ? (
                  <CheckCircle size={14} weight="fill" className="text-emerald-300" />
                ) : (
                  <Copy size={14} />
                )}
              </button>
            </div>

            <p className="text-xs text-red-100/90 mt-1.5 flex items-center gap-1">
              <GraduationCap size={14} weight="fill" className="shrink-0" />
              <span className="truncate">{user.career}</span>
            </p>
          </div>
        </div>

        {/* Pie del carné: Sede, Editar perfil y Botón QR */}
        <div className="mt-4 pt-3 border-t border-white/15 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 text-red-100 text-[11px]">
            <MapPin size={13} weight="fill" />
            <span>{user.campus}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openEditModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white text-[11px] font-bold rounded-xl transition-all border border-white/30 active:scale-95"
              aria-label="Editar perfil"
              title="Editar datos del perfil"
            >
              <PencilSimple size={14} weight="bold" />
              <span>Editar perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setShowQrModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[11px] font-bold rounded-xl transition-all border border-white/30 active:scale-95"
              title="Mostrar código QR de acceso"
            >
              <QrCode size={15} weight="bold" />
              <span>Ver QR</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmación de actualización de perfil */}
      {profileSavedBanner && (
        <div
          role="status"
          aria-live="polite"
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-4 py-3 text-xs font-semibold flex items-center gap-2 shadow-sm animate-fade-in"
        >
          <CheckCircle size={18} weight="fill" className="text-emerald-600 shrink-0" />
          <span>Perfil actualizado correctamente. Los cambios ya se reflejan en tu carné digital.</span>
        </div>
      )}

      {/* Selector de User Personas Evaluadas (AP2 / AP3) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Users size={18} weight="fill" className="text-utp-red" />
            <span>Perfiles de Evaluación (Fichas AP2/AP3)</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            {OFFICIAL_PROFILES.length} Perfiles
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
          Permite conmutar entre los perfiles de prueba documentados en las pruebas de usabilidad con usuarios:
        </p>

        <div className="grid grid-cols-1 gap-2">
          {OFFICIAL_PROFILES.map((profile) => {
            const isSelected = user.id === profile.id;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => switchProfile(profile.id)}
                className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-red-50/70 border-utp-red text-slate-900 shadow-sm ring-1 ring-utp-red'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <p className="text-xs font-bold leading-tight truncate">
                    {profile.name}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {profile.code} • {profile.tag}
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle size={18} weight="fill" className="text-utp-red shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Resumen de Avisos y Actividad Académica */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onNavigateToFavorites}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-utp-red/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <BookmarkSimple size={20} weight="fill" className="text-utp-red" />
            <span className="text-xs font-black text-slate-800 bg-red-50 px-2 py-0.5 rounded-full">
              {favorites.length}
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 group-hover:text-utp-red transition-colors">
            Mis Favoritos
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Avisos guardados offline
          </p>
        </button>

        <button
          type="button"
          onClick={onOpenAccessibility}
          className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-utp-red/40 text-left transition-all group"
        >
          <div className="flex items-center justify-between mb-1">
            <SlidersHorizontal size={20} weight="bold" className="text-slate-600" />
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              WCAG 2.2
            </span>
          </div>
          <p className="text-xs font-bold text-slate-800 group-hover:text-utp-red transition-colors">
            Accesibilidad
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Alto contraste y alertas
          </p>
        </button>
      </div>

      {/* Datos Institucionales UTP */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
          <IdentificationCard size={18} className="text-slate-500" />
          <span>Información Institucional</span>
        </h3>

        <div className="divide-y divide-slate-100 text-[11px]">
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-500">Correo UTP:</span>
            <span className="font-medium text-slate-800 font-mono">{user.email}</span>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-500">Modalidad:</span>
            <span className="font-medium text-slate-800">Pregrado Regular</span>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-500">Estado de matrícula:</span>
            <span className="font-bold text-emerald-700">Matriculado 2026-I</span>
          </div>
        </div>
      </div>

      {/* Estado de Sincronización Firebase / Firestore */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-2.5 text-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Database size={18} weight="fill" className={dataSource === 'firestore' ? 'text-emerald-600' : 'text-amber-500'} />
            <span>Sincronización Cloud Firestore</span>
          </h3>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              dataSource === 'firestore'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            {dataSource === 'firestore' ? 'En vivo' : 'Caché Local'}
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-[11px]">
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-500">Proyecto Firebase:</span>
            <span className="font-mono font-medium text-slate-800">{firebaseProjectId}</span>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-500">Credenciales `.env`:</span>
            <span className="font-medium text-slate-800">
              {isFirebaseConfigured ? 'Configuradas' : 'Modo Demo / Contingencia'}
            </span>
          </div>
          <div className="py-1.5 flex justify-between">
            <span className="text-slate-500">Avisos indexados:</span>
            <span className="font-bold text-slate-800">
              {notices.length} documentos ({lastSyncedAt || '--:--'})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refreshNotices()}
          disabled={isLoadingNotices}
          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all disabled:opacity-60"
        >
          <ArrowsClockwise size={14} weight="bold" className={isLoadingNotices ? 'animate-spin' : ''} />
          <span>{isLoadingNotices ? 'Sincronizando Firestore...' : 'Re-sincronizar comunicados'}</span>
        </button>
      </div>

      {/* Botón de Cerrar Sesión */}
      <button
        type="button"
        onClick={logout}
        className="w-full py-3 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-utp-red border border-slate-200 hover:border-red-200 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <SignOut size={16} weight="bold" />
        <span>Cerrar sesión institucional</span>
      </button>

      {/* Modal interactivo de QR de Carné */}
      {showQrModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowQrModal(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-xs w-full text-center shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 bg-red-100 text-utp-red rounded-full flex items-center justify-center mx-auto">
              <QrCode size={28} weight="bold" />
            </div>

            <h3 className="font-bold text-sm text-slate-900">
              Código QR de Acceso Institucional
            </h3>

            <div
              className="p-2 bg-white border border-slate-200 rounded-2xl inline-flex items-center justify-center mx-auto shadow-sm"
              aria-label={`Código QR institucional verificable para ${user.name} (${user.code.toUpperCase()})`}
            >
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`Código QR hacia ${qrUrl}`}
                  width={220}
                  height={220}
                  className="w-[220px] h-[220px] rounded-xl block"
                />
              ) : (
                <div className="w-[220px] h-[220px] flex items-center justify-center text-xs text-slate-500">
                  Generando QR...
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              ID: {user.code.toUpperCase()} • Válido para ingreso a campus
            </p>

            <div className="flex items-center justify-center gap-4">
              <a
                href={qrUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-utp-red hover:text-utp-redDark underline underline-offset-2 py-1"
              >
                <span>Abrir enlace</span>
                <ArrowSquareOut size={14} weight="bold" />
              </a>
              {qrDataUrl && (
                <a
                  href={qrDataUrl}
                  download={`QR-UTP-${user.code.toUpperCase()}.png`}
                  className="inline-flex items-center justify-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 underline underline-offset-2 py-1"
                >
                  <span>Descargar PNG</span>
                </a>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 bg-utp-red hover:bg-utp-redDark text-white font-bold text-xs rounded-xl shadow transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Modal accesible para Editar Perfil */}
      {showEditModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-profile-modal-title"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowEditModal(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setShowEditModal(false);
          }}
        >
          <div
            className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-red-100 text-utp-red rounded-xl flex items-center justify-center">
                  <PencilSimple size={18} weight="bold" />
                </div>
                <div>
                  <h3 id="edit-profile-modal-title" className="font-bold text-sm text-slate-900">
                    Editar perfil académico
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">{user.code}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                aria-label="Cerrar modal de edición"
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3" noValidate>
              {editError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-xs font-medium rounded-xl px-3 py-2"
                >
                  {editError}
                </div>
              )}

              <div>
                <label htmlFor="edit-profile-name" className="block text-xs font-bold text-slate-700 mb-1">
                  Nombre completo
                </label>
                <input
                  id="edit-profile-name"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-utp-red focus:bg-white"
                  placeholder="Ej. Rubén Walter Vivas"
                  required
                />
              </div>

              <div>
                <label htmlFor="edit-profile-career" className="block text-xs font-bold text-slate-700 mb-1">
                  Carrera
                </label>
                <input
                  id="edit-profile-career"
                  type="text"
                  value={editCareer}
                  onChange={(e) => setEditCareer(e.target.value)}
                  className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-utp-red focus:bg-white"
                  placeholder="Ej. Ingeniería de Sistemas e Informática"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label htmlFor="edit-profile-campus" className="block text-xs font-bold text-slate-700 mb-1">
                    Sede / Campus
                  </label>
                  <input
                    id="edit-profile-campus"
                    type="text"
                    value={editCampus}
                    onChange={(e) => setEditCampus(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-utp-red focus:bg-white"
                    placeholder="Ej. Lima Centro"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="edit-profile-cycle" className="block text-xs font-bold text-slate-700 mb-1">
                    Ciclo
                  </label>
                  <input
                    id="edit-profile-cycle"
                    type="text"
                    value={editCycle}
                    onChange={(e) => setEditCycle(e.target.value)}
                    className="w-full px-3 py-2 text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-utp-red focus:bg-white"
                    placeholder="Ej. 8° Ciclo"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-utp-red hover:bg-utp-redDark text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileScreen;
