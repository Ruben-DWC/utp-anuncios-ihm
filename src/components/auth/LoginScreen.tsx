import React, { useState, useMemo } from 'react';
import { useAuth, OFFICIAL_PROFILES, COMMON_PORTAL_PASSWORD } from '@/context/AuthContext';
import {
  User,
  Lock,
  Eye,
  EyeSlash,
  WarningCircle,
  ShieldCheck,
  ArrowRight,
  Sparkle,
  QrCode,
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

  const carnetParam = useMemo(() => {
    if (typeof window === 'undefined') return null;
    const fromQuery = new URLSearchParams(window.location.search).get('carnet')?.trim();
    const pathMatch = window.location.pathname.match(/^\/carnet\/([a-zA-Z0-9]+)/i);
    const raw = fromQuery || pathMatch?.[1];
    return raw && /^u/i.test(raw) ? raw.toUpperCase() : null;
  }, []);

  const [code, setCode] = useState(() => (carnetParam ? carnetParam.toLowerCase() : 'u22224908'));
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoverySent, setRecoverySent] = useState(false);

  const hasInvalidDomain = useMemo(() => {
    const trimmed = code.trim().toLowerCase();
    return trimmed.includes('@') && !trimmed.endsWith('@utp.edu.pe');
  }, [code]);

  const handleAutocompleteDomain = () => {
    const localPart = code.trim().split('@')[0];
    setCode(`${localPart}@utp.edu.pe`);
    setCodeError(null);
    setErrorMessage(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setCodeError(null);
    setPasswordError(null);

    const cleanCode = code.trim().toLowerCase();
    const cleanPassword = password.trim();
    let nextCodeError: string | null = null;
    let nextPasswordError: string | null = null;

    if (!cleanCode) {
      nextCodeError = 'Por favor, ingresa tu código o correo institucional UTP.';
    } else if (cleanCode.includes('@') && !cleanCode.endsWith('@utp.edu.pe')) {
      nextCodeError = 'El correo debe terminar en @utp.edu.pe (Ej: u22224908@utp.edu.pe)';
    } else {
      const normalized = cleanCode.endsWith('@utp.edu.pe')
        ? cleanCode.slice(0, -'@utp.edu.pe'.length)
        : cleanCode;
      const found = OFFICIAL_PROFILES.some(
        (p) =>
          p.code.toLowerCase() === normalized ||
          p.email.toLowerCase() === cleanCode ||
          p.id.toLowerCase() === normalized
      );
      if (!found) {
        nextCodeError = 'Código o usuario no encontrado en los perfiles oficiales UTP.';
      }
    }

    if (cleanPassword.length < 6) {
      nextPasswordError = 'La contraseña debe tener al menos 6 caracteres.';
    } else if (cleanPassword !== COMMON_PORTAL_PASSWORD) {
      nextPasswordError = `Contraseña incorrecta. Debe coincidir con la clave institucional (${COMMON_PORTAL_PASSWORD}).`;
    }

    if (nextCodeError || nextPasswordError) {
      setCodeError(nextCodeError);
      setPasswordError(nextPasswordError);
      setErrorMessage(nextCodeError || nextPasswordError);
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = login(code, password, rememberMe);
      setIsLoading(false);

      if (result.success) {
        if (onSuccess) onSuccess();
      } else {
        const msg = result.error || 'Credenciales institucionales incorrectas.';
        setErrorMessage(msg);
      }
    }, 450);
  };

  const handleQuickLeadAccess = () => {
    setCode('u22224908');
    const result = login('u22224908', undefined, rememberMe);
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
    <div className="w-full h-full bg-gradient-to-b from-white via-rose-50/50 to-slate-100 flex flex-col justify-between overflow-y-auto p-5 sm:p-6 select-none animate-fade-in relative">
      {/* Elementos decorativos de fondo: degradados sutiles institucionales rojo y blanco */}
      <div className="absolute top-0 -left-12 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-12 w-56 h-56 bg-utp-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-40 h-40 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Zona Superior: Identidad Institucional Oficial UTP */}
      <div className="flex flex-col items-center pt-2 sm:pt-4 relative z-10">
        <div className="p-3 bg-white/90 backdrop-blur-md rounded-2xl shadow-sm border border-red-100/80 mb-3 flex items-center justify-center">
          <img
            className="brand-mark h-14 sm:h-16 w-auto object-contain"
            alt="Universidad Tecnológica del Perú"
            src="/assets/utp-logo-new-BPM18T9V.png"
          />
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center">
          UTP Anuncios
        </h1>
        <p className="text-xs text-slate-500 text-center mt-1 max-w-xs leading-relaxed">
          Portal Oficial de Comunicados Académicos, Aulas y Accesibilidad Universal
        </p>
      </div>

      {/* Formulario de Login Fiel al Wireframe 02 y Vercel Previo */}
      <div className="w-full max-w-sm mx-auto my-4 sm:my-6 bg-white/95 backdrop-blur-md rounded-3xl p-6 shadow-xl shadow-red-950/5 border border-red-100/80 relative z-10">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
          <ShieldCheck size={20} weight="fill" className="text-utp-red" />
          <h2 className="text-sm font-bold text-slate-800">
            Inicio de Sesión Institucional
          </h2>
        </div>

        {carnetParam && (
          <div
            role="status"
            className="mb-4 p-3 bg-sky-50 border border-sky-200 rounded-xl flex items-start gap-2 text-xs text-sky-900"
          >
            <QrCode size={18} weight="fill" className="text-sky-600 shrink-0 mt-0.5" />
            <p className="font-medium leading-snug">
              Carné QR detectado: <strong>{carnetParam}</strong>. Inicia sesión para ver el perfil verificado.
            </p>
          </div>
        )}

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-[#B50E30] rounded-xl flex items-start gap-2 text-xs text-[#B50E30] animate-shake"
          >
            <WarningCircle size={18} weight="fill" className="text-[#B50E30] shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-snug">
              <strong>Estado E-07: Error de validación</strong>
              <p className="mt-0.5 text-[11px]">{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
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
                aria-invalid={Boolean(codeError)}
                aria-describedby={codeError ? 'student-code-error' : undefined}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (codeError) setCodeError(null);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="u22224908 o @utp.edu.pe"
                className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 rounded-xl border text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  codeError
                    ? 'border-[#B50E30] focus:ring-[#B50E30]'
                    : 'border-slate-300 focus:ring-utp-red focus:border-transparent'
                }`}
              />
            </div>
            {codeError && (
              <div className="mt-1.5 pl-1 space-y-1.5">
                <p id="student-code-error" className="text-[11px] font-semibold text-[#B50E30]">
                  {codeError}
                </p>
                {hasInvalidDomain && (
                  <button
                    type="button"
                    onClick={handleAutocompleteDomain}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#B50E30] border border-[#B50E30]/30 text-[11px] font-bold transition-colors"
                  >
                    Completar con @utp.edu.pe
                  </button>
                )}
              </div>
            )}
            {!codeError && hasInvalidDomain && (
              <div className="mt-1.5 pl-1 space-y-1">
                <p className="text-[11px] font-semibold text-[#B50E30]">
                  El correo debe terminar en @utp.edu.pe (Ej: u22224908@utp.edu.pe)
                </p>
                <button
                  type="button"
                  onClick={handleAutocompleteDomain}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 hover:bg-red-100 text-[#B50E30] border border-[#B50E30]/30 text-[11px] font-bold transition-colors"
                >
                  Completar con @utp.edu.pe
                </button>
              </div>
            )}
            <p className="text-[10px] text-slate-400 mt-1 pl-1">
              Grupo 05: u22224908, u22234050, u22223726, u22216957, u23258409, u23319724 • Clave: <strong className="text-slate-600">123456</strong>
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
                aria-invalid={Boolean(passwordError)}
                aria-describedby={passwordError ? 'student-password-error' : undefined}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                  if (errorMessage) setErrorMessage(null);
                }}
                placeholder="Ingresa tu contraseña"
                className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 rounded-xl border text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition-all ${
                  passwordError
                    ? 'border-[#B50E30] focus:ring-[#B50E30]'
                    : 'border-slate-300 focus:ring-utp-red focus:border-transparent'
                }`}
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
            {passwordError && (
              <p id="student-password-error" className="text-[11px] font-semibold text-[#B50E30] mt-1.5 pl-1">
                {passwordError}
              </p>
            )}
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
              onClick={() => {
                setRecoveryEmail(code.includes('@') ? code : `${code || 'u22224908'}@utp.edu.pe`);
                setRecoverySent(false);
                setIsRecoveryOpen(true);
              }}
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

      {/* Modal de Recuperación de Contraseña (Figma Frame 03) */}
      {isRecoveryOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="recovery-title"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsRecoveryOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-200 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="recovery-title" className="text-sm font-bold text-slate-900">
              Recuperación de Contraseña UTP
            </h3>
            {recoverySent ? (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-1">
                <p className="font-bold">¡Enlace de restablecimiento enviado!</p>
                <p>
                  Revisa la bandeja de <strong>{recoveryEmail}</strong> o contacta a SAE UTP (`sae@utp.edu.pe`) si no recibes el correo en 5 minutos.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (recoveryEmail.trim()) setRecoverySent(true);
                }}
                className="space-y-3"
              >
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ingresa tu correo institucional (`@utp.edu.pe`) para recibir las instrucciones de recuperación de acceso.
                </p>
                <input
                  type="email"
                  required
                  value={recoveryEmail}
                  onChange={(e) => setRecoveryEmail(e.target.value)}
                  placeholder="u22224908@utp.edu.pe"
                  aria-label="Correo institucional para recuperación"
                  className="w-full px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-300 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-utp-red"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-utp-red hover:bg-utp-redDark text-white font-bold text-xs rounded-xl shadow transition-all"
                >
                  Enviar enlace de recuperación
                </button>
              </form>
            )}
            <button
              type="button"
              onClick={() => setIsRecoveryOpen(false)}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Volver al inicio de sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginScreen;
