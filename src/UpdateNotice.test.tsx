import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { catalogues } from './i18n/messages';
import { UpdateNotice } from './UpdateNotice';

const sw = vi.hoisted(() => ({
  waiting: false,
  updateServiceWorker: vi.fn(),
  options: undefined as
    | {
        onRegisteredSW?: (
          url: string,
          registration: ServiceWorkerRegistration | undefined,
        ) => void;
      }
    | undefined,
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: (options?: typeof sw.options) => {
    sw.options = options;
    return {
      needRefresh: useState(sw.waiting),
      offlineReady: useState(false),
      updateServiceWorker: sw.updateServiceWorker,
    };
  },
}));

beforeEach(() => {
  sw.waiting = false;
  sw.updateServiceWorker.mockReset();
  sw.options = undefined;
});

afterEach(() => {
  vi.useRealTimers();
});

function renderNotice() {
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <UpdateNotice />
    </IntlProvider>,
  );
}

const message = 'A new version of TimeTravels is ready.';

test('shows nothing when no update is waiting', () => {
  renderNotice();
  expect(screen.queryByText(message)).not.toBeInTheDocument();
  expect(screen.queryByRole('button')).not.toBeInTheDocument();
});

test('offers the update, and "Update now" installs it', () => {
  sw.waiting = true;
  renderNotice();
  expect(screen.getByText(message)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Later' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Update now' }));
  expect(sw.updateServiceWorker).toHaveBeenCalledOnce();
});

test('"Later" hides the notice without updating', () => {
  sw.waiting = true;
  renderNotice();
  fireEvent.click(screen.getByRole('button', { name: 'Later' }));
  expect(screen.queryByText(message)).not.toBeInTheDocument();
  expect(sw.updateServiceWorker).not.toHaveBeenCalled();
});

test('the announcement region is present before any update arrives', () => {
  renderNotice();
  expect(screen.getByRole('status')).toBeEmptyDOMElement();
});

test('an open app checks for a new version every hour', () => {
  vi.useFakeTimers();
  renderNotice();
  const update = vi.fn(() => Promise.resolve());
  sw.options?.onRegisteredSW?.('/sw.js', {
    update,
  } as unknown as ServiceWorkerRegistration);
  expect(update).not.toHaveBeenCalled();
  vi.advanceTimersByTime(60 * 60 * 1000);
  expect(update).toHaveBeenCalledOnce();
});
