import { render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { App } from '../App';
import { named } from '../testing/named';

afterEach(() => {
  localStorage.clear();
});

function remember(saved: unknown, chosen: unknown) {
  localStorage.setItem('timetravels.savedPlaces', JSON.stringify(saved));
  localStorage.setItem('timetravels.place', JSON.stringify(chosen));
}

const london = { city: 'London', zone: 'Europe/London' };

test('a chosen named place reads “at” its name, and the answer names it and its city', () => {
  remember(
    { home: null, named: [{ name: 'Mark’s place', place: london }] },
    {
      name: 'Mark’s place',
    },
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it at Mark’s place right now?'),
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/^Mark’s place \(London, GMT[+−-]?\d*\)$/),
  ).toBeInTheDocument();
});

test('a chosen home reads “at home”, and the answer says Home and its city', () => {
  remember({ home: london, named: [] }, { home: true });
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it at home right now?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Home \(London, GMT/)).toBeInTheDocument();
});

test('a saved place in a zone this browser doesn’t know falls back to here', () => {
  remember(
    {
      home: null,
      named: [{ name: 'Lost', place: { city: 'Atlantis', zone: 'X/Y' } }],
    },
    { name: 'Lost' },
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it here right now?'),
    }),
  ).toBeInTheDocument();
});
