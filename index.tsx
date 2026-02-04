import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Root element missing");

// Enregistrement PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        // Log discret en production
        console.debug('AESCOMPT: Core Active', reg.scope);
      })
      .catch(err => {
        // On évite les logs d'erreur bruyants si on est en environnement local
        console.debug('AESCOMPT: local mode');
      });
  });
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);