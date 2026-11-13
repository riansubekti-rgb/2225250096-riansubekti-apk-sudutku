import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { requestPersistentStorage } from './platform/storage';
import { initPwa } from './platform/pwa';
import './styles/index.css';

// D3: data hanya di perangkat → minta penyimpanan persisten sedini mungkin.
void requestPersistentStorage();
initPwa();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
