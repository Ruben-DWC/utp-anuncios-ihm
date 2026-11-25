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
    tag: 'Grupo 05 • Líder / Estados AP3',
  },
  {
    id: 'renzo',
    name: 'Renzo José Garavito Valdivia',
    code: 'u22234050',
    email: 'u22234050@utp.edu.pe',
    campus: 'Campus Central - Lima',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Grupo 05 • Accesibilidad',
  },
  {
    id: 'anais',
    name: 'Anais Milenka Huillca Rojas',
    code: 'u22223726',
    email: 'u22223726@utp.edu.pe',
    campus: 'Campus Central - Lima',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Grupo 05 • Análisis UX',
  },
  {
    id: 'angela',
    name: 'Angela Torres Francia',
    code: 'u22216957',
    email: 'u22216957@utp.edu.pe',
    campus: 'Campus Central - Lima',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Grupo 05 • Prototipado',
  },
  {
    id: 'juancarlos',
    name: 'Juan Carlos Quirita Llasa',
    code: 'u23258409',
    email: 'u23258409@utp.edu.pe',
    campus: 'Campus Central - Lima',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Grupo 05 • Integrante',
  },
  {
    id: 'alisson',
    name: 'Alisson Kristel Proleon Mondragón',
    code: 'u23319724',
    email: 'u23319724@utp.edu.pe',
    campus: 'Campus Central - Lima',
    career: 'Ingeniería de Sistemas e Informática',
    cycle: '6to Ciclo - 2026-I',
    tag: 'Grupo 05 • Integrante',
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

export const COMMON_PORTAL_PASSWORD = '123456';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (code: string, password?: string, remember?: boolean) => { success: boolean; error?: string };
  logout: () => void;
  switchProfile: (profileId: string) => void;
  guestAccess: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'utp_anuncios_auth_user';
const AUTH_LOGGED_OUT_KEY = 'utp_anuncios_logged_out';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rememberSession, setRememberSession] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      if (sessionStorage.getItem(AUTH_STORAGE_KEY) && !localStorage.getItem(AUTH_STORAGE_KEY)) {
        return false;
      }
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
    return null;
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
    const cleanCode = code.trim().toLowerCase();

    if (!cleanCode) {
      return {
        success: false,
        error: 'Por favor, ingresa tu código o correo institucional UTP (@utp.edu.pe).',
      };
    }

    if (cleanCode.includes('@') && !cleanCode.endsWith('@utp.edu.pe')) {
      return {
        success: false,
        error: 'El correo debe terminar en @utp.edu.pe (Ej: u22224908@utp.edu.pe)',
      };
    }

    const normalizedCode = cleanCode.endsWith('@utp.edu.pe')
      ? cleanCode.slice(0, -'@utp.edu.pe'.length)
      : cleanCode;

    if (!normalizedCode) {
      return {
        success: false,
        error: 'Por favor, ingresa tu código institucional UTP (@utp.edu.pe).',
      };
    }

    if (password !== undefined) {
      if (password.trim().length < 6) {
        return {
          success: false,
          error: 'La contraseña debe tener al menos 6 caracteres.',
        };
      }
      if (password.trim() !== COMMON_PORTAL_PASSWORD) {
        return {
          success: false,
          error: `Contraseña incorrecta. Usa la clave común del equipo: ${COMMON_PORTAL_PASSWORD}`,
        };
      }
    }

    // Buscar si coincide con alguno de los perfiles oficiales
    const matchedProfile = OFFICIAL_PROFILES.find(
      (p) =>
        p.code.toLowerCase() === normalizedCode ||
        p.email.toLowerCase() === cleanCode ||
        p.id.toLowerCase() === normalizedCode
    );

    if (matchedProfile) {
      setRememberSession(remember);
      setCurrentUser(matchedProfile);
      return { success: true };
    }

    // Error de validación según Estado E-07 de AP3
    return {
      success: false,
      error: 'Código o usuario no encontrado en los perfiles oficiales UTP.',
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
    // Permite navegar sin sesión activa en modo invitado (solo sesión actual)
    setRememberSession(false);
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

  const updateProfile = (updates: Partial<UserProfile>) => {
    setCurrentUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };
      if (typeof window !== 'undefined') {
        if (rememberSession) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        } else {
          sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
        }
      }
      return updated;
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
        updateProfile,
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
