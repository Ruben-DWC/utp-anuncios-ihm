import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '@/types';

export const OFFICIAL_PROFILES: UserProfile[] = [
  {
    id: 'ruben',
    name: 'Ruben Walter Vivas Jimenez',
    code: 'u22224908',
    email: 'u22224908@utp.edu.pe',
    campus: 'Campus Central - Lima',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Estudiante Autor (AP3 & PF)',
  },
  {
    id: 'diego',
    name: 'Diego Mendoza Ramos',
    code: 'u22244804',
    email: 'u22244804@utp.edu.pe',
    campus: 'Sede Lima Norte',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Persona: Tiempo Ajustado',
  },
  {
    id: 'lucia',
    name: 'Lucía Paredes Valdivia',
    code: 'u22251092',
    email: 'u22251092@utp.edu.pe',
    campus: 'Sede Lima Norte',
    career: 'Psicología',
    cycle: '3er Ciclo - 2026-I',
    tag: 'Persona: Baja Visión (Alto Contraste)',
  },
  {
    id: 'mateo',
    name: 'Mateo Flores Quispe',
    code: 'u22238120',
    email: 'u22238120@utp.edu.pe',
    campus: 'Sede San Juan de Lurigancho',
    career: 'Diseño Digital Publicitario',
    cycle: '4to Ciclo - 2026-I',
    tag: 'Persona: TDAH & Alertas Hápticas',
  },
];

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (code: string, password?: string, remember?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  switchProfile: (profileId: string) => void;
  guestAccess: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'utp_anuncios_auth_user';
const AUTH_LOGGED_OUT_KEY = 'utp_anuncios_logged_out';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rememberSession, setRememberSession] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(AUTH_STORAGE_KEY)) return false;
    }
    return true;
  });
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(AUTH_LOGGED_OUT_KEY) === 'true' || localStorage.getItem(AUTH_LOGGED_OUT_KEY) === 'true') {
        return null;
      }
      const stored = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          // ignore parsing error
        }
      }
    }
    // Por defecto inicia con el perfil de Rubén Walter para experiencia fluida en demo
    return OFFICIAL_PROFILES[0];
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (currentUser) {
        localStorage.removeItem(AUTH_LOGGED_OUT_KEY);
        sessionStorage.removeItem(AUTH_LOGGED_OUT_KEY);
        if (rememberSession) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
          sessionStorage.removeItem(AUTH_STORAGE_KEY);
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.removeItem(AUTH_STORAGE_KEY);
        sessionStorage.setItem(AUTH_LOGGED_OUT_KEY, 'true');
      }
    }
  }, [currentUser, rememberSession]);

  const login = (code: string, password?: string, remember = true): { success: boolean; error?: string } => {
    setRememberSession(remember);
    const cleanCode = code.trim().toLowerCase();
    
    // Validación de código institucional UTP (prefijo 'u' seguido de 8 dígitos o correo institucional)
    const normalizedCode = cleanCode.replace('@utp.edu.pe', '');
    
    if (!normalizedCode) {
      return {
        success: false,
        error: 'Por favor, ingresa tu código institucional UTP (@utp.edu.pe).',
      };
    }

    if (password !== undefined && password.trim().length === 0) {
      return {
        success: false,
        error: 'Ingresa tu contraseña del portal UTP.',
      };
    }

    // Buscar si coincide con alguno de los perfiles demo de las fichas de campo AP2/AP3
    const matchedProfile = OFFICIAL_PROFILES.find(
      (p) => p.code.toLowerCase() === normalizedCode || p.id === normalizedCode
    );

    if (matchedProfile) {
      setCurrentUser(matchedProfile);
      return { success: true };
    }

    // Permitir cualquier código institucional válido que comience con 'u' y números
    if (/^u\d{8}$/i.test(normalizedCode)) {
      const newCustomUser: UserProfile = {
        id: normalizedCode,
        name: `Estudiante ${normalizedCode.toUpperCase()}`,
        code: normalizedCode,
        email: `${normalizedCode}@utp.edu.pe`,
        campus: 'Campus Central - Lima',
        career: 'Ingeniería de Sistemas e Informática',
        cycle: '6to Ciclo - 2026-I',
        tag: 'Estudiante UTP Registrado',
      };
      setCurrentUser(newCustomUser);
      return { success: true };
    }

    // Error de validación según Estado E-07 de AP3
    return {
      success: false,
      error: 'Formato inválido. El código debe tener el formato u22224908 o correo @utp.edu.pe.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchProfile = (profileId: string) => {
    const target = OFFICIAL_PROFILES.find((p) => p.id === profileId);
    if (target) {
      setCurrentUser(target);
    }
  };

  const guestAccess = () => {
    // Permite navegar sin sesión activa en modo invitado
    setCurrentUser({
      id: 'invitado',
      name: 'Estudiante Invitado',
      code: 'invitado',
      email: 'comunicados@utp.edu.pe',
      campus: 'Acceso Público General',
      career: 'Portal Académico',
      cycle: 'Periodo 2026-I',
      tag: 'Modo Público',
    });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: currentUser !== null,
        login,
        logout,
        switchProfile,
        guestAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
