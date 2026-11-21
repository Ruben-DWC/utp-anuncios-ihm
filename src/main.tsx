import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { AccessibilityProvider } from '@/context/AccessibilityContext';
import { NoticesProvider } from '@/context/NoticesContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AccessibilityProvider>
      <NoticesProvider>
        <App />
      </NoticesProvider>
    </AccessibilityProvider>
  </React.StrictMode>,
);
