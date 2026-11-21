import React, { useState } from 'react';
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
} from '@phosphor-icons/react';

interface ProfileScreenProps {
  onOpenAccessibility: () => void;
  onNavigateToFavorites: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenAccessibility,
  onNavigateToFavorites,
}) => {
  const { currentUser, logout, switchProfile } = useAuth();
  const { favorites } = useNotices();
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const user = currentUser || OFFICIAL_PROFILES[0]!;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(user.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="p-4 space-y-4 pb-20 select-none animate-fade-in">
      {/* Tarjeta de Carné Digital Universitario UTP (Figma Frame 406:16) */}
      <div className="bg-gradient-to-br from-utp-red to-utp-redDark text-white rounded-3xl p-5 shadow-xl relative overflow-hidden border border-red-400/30">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        {/* Cabecera del carné */}
        <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="font-black text-xs tracking-widest bg-white text-utp-red px-2 py-0.5 rounded-md shadow-sm">
              UTP
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

        {/* Pie del carné: Sede y Botón QR */}
        <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-red-100 text-[11px]">
            <MapPin size={13} weight="fill" />
            <span>{user.campus}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-[11px] font-bold rounded-xl transition-all border border-white/30 active:scale-95"
            title="Mostrar código QR de acceso"
          >
            <QrCode size={15} weight="bold" />
            <span>Ver QR</span>
          </button>
        </div>
      </div>

      {/* Selector de User Personas Evaluadas (AP2 / AP3) */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
            <Users size={18} weight="fill" className="text-utp-red" />
            <span>Perfiles de Evaluación (Fichas AP2/AP3)</span>
          </div>
          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
            4 Personas
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

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto">
              <div className="w-40 h-40 bg-white border-2 border-slate-800 rounded-xl flex items-center justify-center p-2">
                {/* QR Representativo Accesible */}
                <div className="grid grid-cols-5 gap-1.5 w-full h-full p-2 bg-slate-900 rounded">
                  <div className="bg-white rounded-sm col-span-2 row-span-2" />
                  <div className="bg-slate-900" />
                  <div className="bg-white rounded-sm col-span-2 row-span-2" />
                  <div className="bg-white rounded-sm col-span-2" />
                  <div className="bg-white rounded-sm" />
                  <div className="bg-white rounded-sm col-span-2" />
                  <div className="bg-white rounded-sm col-span-2 row-span-2" />
                  <div className="bg-white rounded-sm" />
                  <div className="bg-white rounded-sm col-span-2 row-span-2" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">
              ID: {user.code.toUpperCase()} • Válido para ingreso a campus
            </p>

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
    </div>
  );
};

export default ProfileScreen;
