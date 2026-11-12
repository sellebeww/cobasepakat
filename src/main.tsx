import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);

// PWA: shell aplikasi tersedia luring. Hanya di build produksi agar tidak mengganggu HMR.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      /* luring/diblokir: aplikasi tetap berjalan tanpa cache */
    });
  });
}
