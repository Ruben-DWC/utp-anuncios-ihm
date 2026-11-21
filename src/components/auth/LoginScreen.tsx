import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeSlash,
  WarningCircle,
  ShieldCheck,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';

interface LoginScreenProps {
  onSuccess?: () => void;
  onContinueAsGuest?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onContinueAsGuest,
}) => {
  const { login, guestAccess } = useAuth();
  const [code, setCode] = useState('u22224908');
  const [password, setPassword] = useState('••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(code, password);
      setIsLoading(false);

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        setErrorMessage(result.error || 'Credenciales institucionales incorrectas.');
      }
    }, 450);
  };

  const handleQuickLeadAccess = () => {
    setCode('u22224908');
    const result = login('u22224908');
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleGuest = () => {
    guestAccess();
    if (onContinueAsGuest) onContinueAsGuest();
    else if (onSuccess) onSuccess();
  };

  return (
    <div className="w-full h-full bg-slate-50 flex flex-col justify-between overflow-y-auto p-6 select-none animate-fade-in">
      {/* Zona Superior: Identidad Institucional UTP */}
      <div className="flex flex-col items-center pt-4 sm:pt-6">
        <div className="w-16 h-16 rounded-2xl bg-utp-red text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-utp-red/20 mb-4 tracking-wider ring-4 ring-red-100">
          UTP
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center">
          UTP Anuncios
        </h1>
        <p className="text-xs text-slate-500 text-center mt-1 max-w-xs leading-relaxed">
          Portal Oficial de Comunicados Académicos, Aulas y Accesibilidad Universal
        </p>
      </div>

      {/* Formulario de Login Fiel al Wireframe 02 y Vercel Previo */}
      <div className="w-full max-w-sm mx-auto my-6 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <ShieldCheck size={20} weight="fill" className="text-utp-red" />
          <h2 className="text-sm font-bold text-slate-800">
            Inicio de Sesión Institucional
          </h2>
        </div>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 animate-shake"
          >
            <WarningCircle size={18} weight="fill" className="text-utp-red shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-snug">
              <strong>Estado E-07: Error de validación</strong>
              <p className="mt-0.5 text-[11px]">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="student-code"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Código o Correo Institucional UTP
            </label>
            <div className="relative">
              <User
                size={18}
                className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="student-code"
                type="text"
                autoComplete="username"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="u22224908 o @utp.edu.pe"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-utp-red focus:border-transparent transition-all"
                required
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 pl-1">
              Ejemplo: u22224908 (Rubén Walter)
            </p>
          </div>

          <div>
            <label
              htmlFor="student-password"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Contraseña
            </label>
            <div className="relative">
              <Lock
                size={18}
                className="absolute left-3.5 top-3 text-slate-400 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="student-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-utp-red focus:border-transparent transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="w-8 h-8 absolute right-1.5 top-1.5 text-slate-400 hover:text-slate-600 rounded-lg flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-utp-red"
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-utp-red rounded border-slate-300 focus:ring-utp-red"
              />
              <span>Recordar sesión</span>
            </label>
            <button
              type="button"
              onClick={() =>
                setErrorMessage(
                  'Para restablecer tu contraseña institucional, comunícate con la mesa de ayuda SAE UTP (sae@utp.edu.pe).'
                )
              }
              className="text-utp-red hover:underline font-medium text-[11px]"
            >
              ¿Olvidaste tu clave?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-utp-red hover:bg-utp-redDark text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Iniciar sesión</span>
                <ArrowRight size={16} weight="bold" />
              </>
            )}
          </button>
        </form>

        {/* Acceso Rápido para el Jurado Académico */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider text-center">
            Evaluación Académica AP3 & PF
          </p>
          <button
            type="button"
            onClick={handleQuickLeadAccess}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-utp-red border border-red-200 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            <Sparkle size={16} weight="fill" />
            <span>Ingresar como Rubén Walter (u22224908)</span>
          </button>

          <button
            type="button"
            onClick={handleGuest}
            className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-medium text-center hover:underline"
          >
            Continuar como invitado (Ver avisos públicos)
          </button>
        </div>
      </div>

      {/* Pie de página con créditos institucionales de autoría */}
      <footer className="text-center pb-2 text-[11px] text-slate-400">
        <p>Interacción Hombre-Máquina • Universidad Tecnológica del Perú</p>
        <p className="font-semibold text-slate-500 mt-0.5">
          Ruben Walter Vivas Jimenez • u22224908@utp.edu.pe
        </p>
      </footer>
    </div>
  );
};

export default LoginScreen;
