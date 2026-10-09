import { afterEach, expect, test, vi } from 'vitest';
import type { Place } from './places';
import { loadPlace, savePlace } from './storage';

const london: Place = { city: 'London', zone: 'Europe/London' };
const places: Place[] = [london, { city: 'Sydney', zone: 'Australia/Sydney' }];

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

test('a saved place is loaded again', () => {
  savePlace(london);
  expect(loadPlace(places)).toEqual(london);
});

test('saving no place clears it, which means here', () => {
  savePlace(london);
  savePlace(null);
  expect(loadPlace(places)).toBeNull();
});

test('a stored place that is not in the list is ignored', () => {
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'Atlantis', zone: 'X/Y' }),
  );
  expect(loadPlace(places)).toBeNull();
});

test('unreadable stored data is ignored', () => {
  localStorage.setItem('timetravels.place', '{not json');
  expect(loadPlace(places)).toBeNull();
});

test('storage that throws, as in some private windows, is ignored', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(() => {
    savePlace(london);
  }).not.toThrow();
  expect(loadPlace(places)).toBeNull();
});

test('a saved place whose city has since been renamed is found by its zone', () => {
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'Calcutta', zone: 'Asia/Calcutta' }),
  );
  const kolkata: Place = { city: 'Kolkata', zone: 'Asia/Calcutta' };
  expect(loadPlace([kolkata])).toEqual(kolkata);
});
