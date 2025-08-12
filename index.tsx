
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { DataProvider } from './hooks/useUmkmData';
import { LanguageProvider } from './hooks/useLanguage';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './hooks/useToast';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <ToastProvider>
          <DataProvider>
            <App />
          </DataProvider>
        </ToastProvider>
      </AuthProvider>
    </LanguageProvider>
  </React.StrictMode>
);