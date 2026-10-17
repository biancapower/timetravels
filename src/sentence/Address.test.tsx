import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from '../App';
import { named } from '../testing/named';

// 9:41 am on Saturday 10 October 2026 in Sydney.
beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-10-09T22:41:00Z'), toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

function open(address: string) {
  history.replaceState(null, '', address);
  render(<App zone="Australia/Sydney" locale="en" />);
}

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

test('opening an address shows its question and answer', () => {
  open('/?in=Europe/London&when=from-now&for=10h');
  expect(
    screen.getByRole('heading', {
      name: named('What time will it be in London 10 hours from now?'),
    }),
  ).toBeInTheDocument();
  // 9:41 am in Sydney is 11:41 pm Friday in London; 10 hours on is 9:41 am.
  expect(
    screen.getByText(/^tomorrow, Saturday 9:41\sAM$/i),
  ).toBeInTheDocument();
});

test('opening an address changes nothing saved on this device', () => {
  open('/?in=Europe/London');
  expect(screen.getByText(/^London \(GMT/)).toBeInTheDocument();
  expect(localStorage.getItem('timetravels.place')).toBeNull();
});

test('the address gets the question without adding a step for Back', () => {
  const steps = history.length;
  open('/');
  expect(location.search).toBe('?in=Australia/Sydney');
  expect(history.length).toBe(steps);
});

test('changing a slot writes the new question as a new step', async () => {
  open('/');
  const steps = history.length;
  fireEvent.click(within(heading()).getByRole('button', { name: 'right now' }));
  fireEvent.click(
    await screen.findByRole('menuitemradio', { name: 'from now' }),
  );
  expect(location.search).toBe('?in=Australia/Sydney&when=from-now&for=1h');
  expect(history.length).toBe(steps + 1);
});

test('parts that can’t be read fall back, and the rest still applies', () => {
  open('/?in=Atlantis/Nowhere&when=from-now&for=banana');
  expect(
    screen.getByRole('heading', {
      name: named('What time will it be here 1 hour from now?'),
    }),
  ).toBeInTheDocument();
});

test('Help and About keep their own addresses after the question', () => {
  open('/?in=Europe/London#about');
  expect(
    screen.getByRole('heading', { name: 'About TimeTravels' }),
  ).toBeInTheDocument();
  expect(location.hash).toBe('#about');
});
