/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        utp: {
          red: '#B50E30',       // Rojo institucional UTP primario
          redDark: '#8E0B25',   // Rojo oscuro para hover/active
          redLight: '#FEF2F2',  // Fondo tenue de alerta (Tokens AP3)
          dark: '#1E293B',      // Slate oscuro para textos y contrastes altos
          grayBg: '#F8FAFC',    // Fondo neutro de pantalla
          cardBorder: '#E2E8F0',// Borde sutil de tarjeta accesible
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      keyframes: {
        'perimeter-strobe': {
          '0%, 100%': { boxShadow: 'inset 0 0 0 0px rgba(181, 14, 48, 0)' },
          '50%': { boxShadow: 'inset 0 0 0 6px rgba(181, 14, 48, 0.9), 0 0 20px rgba(181, 14, 48, 0.6)' },
        },
        'micro-shake': {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '20%, 60%': { transform: 'translate3d(-3px, 0, 0)' },
          '40%, 80%': { transform: 'translate3d(3px, 0, 0)' },
        },
      },
      animation: {
        'strobe-safe': 'perimeter-strobe 0.5s ease-in-out infinite', // 2.0 Hz safe clamp (WCAG 2.3.1)
        'haptic-shake': 'micro-shake 0.3s ease-in-out 3',           // 3 ráfagas (300ms)
      },
      zIndex: {
        '20': '20',
        '30': '30',
        '40': '40',
        '50': '50',
      },
    },
  },
  plugins: [],
};
