import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { NoticesProvider } from '@/context/NoticesContext';
import { AuthProvider } from '@/context/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <AccessibilityProvider>
        <NoticesProvider>
          <App />
        </NoticesProvider>
      </AccessibilityProvider>
    </AuthProvider>
  </React.StrictMode>,
);

if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // Registro silencioso si el navegador bloquea SW en contextos restringidos
    });
  });
}
