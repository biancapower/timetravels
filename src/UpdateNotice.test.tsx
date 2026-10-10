import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import { beforeEach, expect, test, vi } from 'vitest';
import { catalogues } from './i18n/messages';
import { UpdateNotice } from './UpdateNotice';

const sw = vi.hoisted(() => ({
  waiting: false,
  updateServiceWorker: vi.fn(),
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: useState(sw.waiting),
    offlineReady: useState(false),
    updateServiceWorker: sw.updateServiceWorker,
  }),
}));

beforeEach(() => {
  sw.waiting = false;
  sw.updateServiceWorker.mockReset();
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
