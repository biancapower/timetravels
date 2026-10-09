import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The reset comes first so component styles override it.
import './styles/reset.css';
import './styles/global.css';
// Static imports run before the polyfill below, so no module may use
// Temporal at load time, only inside functions called after it.
import { App } from './App';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

// Download the Temporal polyfill only where the browser lacks Temporal.
if (!('Temporal' in globalThis)) {
  try {
    await import('temporal-polyfill/global');
  } catch (error) {
    root.textContent =
      'TimeTravels could not load. Check your connection and reload the page.';
    throw error;
  }
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
