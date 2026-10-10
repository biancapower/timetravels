import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from '../App';

const saturdayEvening = new Date('2026-10-10T11:00:30Z');

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

function announcement() {
  return screen.getByTestId('answer-announcement');
}

test('the answer is announced politely when a choice changes it', async () => {
  vi.useFakeTimers({ now: saturdayEvening, toFake: ['Date'] });
  render(<App zone="Australia/Sydney" locale="en" />);
  const region = announcement();
  expect(region).toHaveAttribute('aria-live', 'polite');
  expect(region).toBeEmptyDOMElement();

  const heading = screen.getByRole('heading', { level: 1 });
  fireEvent.click(within(heading).getByRole('button', { name: 'right now' }));
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'from now' }),
  );

  expect(region).toHaveTextContent(/Saturday 11:00\sPM/i);
  expect(region).toHaveTextContent('Sydney (GMT+11)');
});

test('the minute tick changes the answer without announcing it', () => {
  vi.useFakeTimers({ now: saturdayEvening });
  render(<App zone="Australia/Sydney" locale="en" />);
  act(() => {
    vi.advanceTimersByTime(60_000);
  });
  expect(announcement()).toBeEmptyDOMElement();
});
