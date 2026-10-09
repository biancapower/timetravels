import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The reset comes first so component styles override it.
import './styles/reset.css';
import './styles/global.css';
import { App } from './App';

// Download the Temporal polyfill only where the browser lacks Temporal.
if (!('Temporal' in globalThis)) await import('temporal-polyfill/global');

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
