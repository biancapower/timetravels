import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// The reset comes first so component styles override it.
import './styles/reset.css';
import './styles/global.css';
// Static imports run before the polyfill below, so no module may use
// Temporal at load time, only inside functions called after it.
import { App } from './App';
import { catalogues, pickLocale } from './i18n/messages';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root element');

const locale = pickLocale(navigator.languages);
const messages = catalogues[locale];
document.title = messages['app.title'];

// Download the Temporal polyfill only where the browser lacks Temporal.
if (!('Temporal' in globalThis)) {
  try {
    await import('temporal-polyfill/global');
  } catch (error) {
    root.textContent = messages['app.loadFailed'];
    throw error;
  }
}

createRoot(root).render(
  <StrictMode>
    <App locale={locale} />
  </StrictMode>,
);
