import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';

// Registro manual del service worker: además de registrarlo, chequea si hay una versión
// nueva cada vez que la app vuelve a primer plano (y cada una hora si queda abierta), y
// recarga sola apenas la nueva versión toma control. Sin esto, una PWA instalada en iOS
// puede quedarse mostrando una versión vieja por días — el chequeo automático del navegador
// no es confiable ahí.
// Solo en producción: en dev, vite-plugin-pwa sirve un service worker virtual en otra ruta
// (/dev-sw.js) y no hace falta este chequeo manual (ya recargás todo el tiempo con HMR).
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    });
    const checkForUpdate = () => registration.update().catch(() => {});
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkForUpdate();
    });
    setInterval(checkForUpdate, 60 * 60 * 1000);
  });

  let reloadedOnce = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloadedOnce) return;
    reloadedOnce = true;
    window.location.reload();
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
