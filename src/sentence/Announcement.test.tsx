import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from '../App';

const saturdayEvening = new Date('2026-10-10T11:00:30Z');

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

function announcement() {
  return within(screen.getByRole('main')).getByRole('status');
}

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

test('the answer is announced politely when a choice changes it', async () => {
  vi.useFakeTimers({ now: saturdayEvening, toFake: ['Date'] });
  render(<App zone="Australia/Sydney" locale="en" />);
  const region = announcement();
  expect(region).toHaveAttribute('aria-live', 'polite');
  expect(region).toBeEmptyDOMElement();

  fireEvent.click(within(heading()).getByRole('button', { name: 'right now' }));
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'from now' }),
  );

  expect(region).toHaveTextContent(/Saturday 11:00\sPM/i);
  expect(region).toHaveTextContent('Sydney (GMT+11)');
});

test('choosing a place announces the answer there', async () => {
  vi.useFakeTimers({ now: saturdayEvening, toFake: ['Date'] });
  render(<App zone="Australia/Sydney" locale="en" />);
  fireEvent.click(within(heading()).getByRole('button', { name: 'here' }));
  fireEvent.change(
    await screen.findByRole('combobox', { name: 'Search for a city' }),
    {
      target: { value: 'tokyo' },
    },
  );
  fireEvent.click(await screen.findByRole('option', { name: 'Tokyo' }));
  expect(announcement()).toHaveTextContent('Tokyo (GMT+9)');
});

test('the announcement clears soon after, so no stale copy stays on the page', () => {
  vi.useFakeTimers({ now: saturdayEvening });
  render(<App zone="Australia/Sydney" locale="en" />);
  fireEvent.click(within(heading()).getByRole('button', { name: 'right now' }));
  fireEvent.click(screen.getByRole('menuitemradio', { name: 'from now' }));
  expect(announcement()).not.toBeEmptyDOMElement();
  act(() => {
    vi.advanceTimersByTime(5_000);
  });
  expect(announcement()).toBeEmptyDOMElement();
});

test('the minute tick changes the answer without announcing it', () => {
  vi.useFakeTimers({ now: saturdayEvening });
  render(<App zone="Australia/Sydney" locale="en" />);
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  expect(announcement()).toBeEmptyDOMElement();
});
