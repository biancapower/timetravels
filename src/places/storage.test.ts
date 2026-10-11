import { afterEach, expect, test, vi } from 'vitest';
import { noSavedPlaces, type SavedPlaces } from './named';
import type { Place } from './places';
import {
  loadPlace,
  loadSavedPlaces,
  savePlace,
  saveSavedPlaces,
} from './storage';

const london: Place = { city: 'London', zone: 'Europe/London' };
const sydney: Place = { city: 'Sydney', zone: 'Australia/Sydney' };
const places: Place[] = [london, sydney];
const saved: SavedPlaces = {
  home: sydney,
  named: [{ name: 'Mark’s place', place: london }],
};

afterEach(() => {
  localStorage.clear();
  vi.restoreAllMocks();
});

test('a saved city is loaded again', () => {
  savePlace({ kind: 'city', place: london });
  expect(loadPlace(places, noSavedPlaces)).toEqual({
    kind: 'city',
    place: london,
  });
});

test('saving no place clears it, which means here', () => {
  savePlace({ kind: 'city', place: london });
  savePlace(null);
  expect(loadPlace(places, noSavedPlaces)).toBeNull();
});

test('a stored place that is not in the list is ignored', () => {
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'Atlantis', zone: 'X/Y' }),
  );
  expect(loadPlace(places, noSavedPlaces)).toBeNull();
});

test('unreadable stored data is ignored', () => {
  localStorage.setItem('timetravels.place', '{not json');
  localStorage.setItem('timetravels.savedPlaces', '{not json');
  expect(loadPlace(places, noSavedPlaces)).toBeNull();
  expect(loadSavedPlaces(places)).toEqual(noSavedPlaces);
});

test('storage that throws, as in some private windows, is ignored', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked');
  });
  expect(() => {
    savePlace({ kind: 'city', place: london });
    saveSavedPlaces(saved);
  }).not.toThrow();
  expect(loadPlace(places, saved)).toBeNull();
  expect(loadSavedPlaces(places)).toEqual(noSavedPlaces);
});

test('a saved place whose city has since been renamed is found by its zone', () => {
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'Calcutta', zone: 'Asia/Calcutta' }),
  );
  const kolkata: Place = { city: 'Kolkata', zone: 'Asia/Calcutta' };
  expect(loadPlace([kolkata], noSavedPlaces)).toEqual({
    kind: 'city',
    place: kolkata,
  });
});

test('home and named places are loaded again', () => {
  saveSavedPlaces(saved);
  expect(loadSavedPlaces(places)).toEqual(saved);
});

test('a named place whose zone this browser doesn’t know is left out', () => {
  saveSavedPlaces({
    home: { city: 'Atlantis', zone: 'X/Y' },
    named: [
      { name: 'Lost', place: { city: 'Atlantis', zone: 'X/Y' } },
      { name: 'Mark’s place', place: london },
    ],
  });
  expect(loadSavedPlaces(places)).toEqual({
    home: null,
    named: [{ name: 'Mark’s place', place: london }],
  });
});

test('choosing home or a named place is remembered by name, so edits follow it', () => {
  savePlace({ kind: 'home', place: sydney });
  expect(loadPlace(places, saved)).toEqual({ kind: 'home', place: sydney });

  savePlace({ kind: 'named', name: 'Mark’s place', place: london });
  const moved: SavedPlaces = {
    home: null,
    named: [{ name: 'Mark’s place', place: sydney }],
  };
  expect(loadPlace(places, moved)).toEqual({
    kind: 'named',
    name: 'Mark’s place',
    place: sydney,
  });
});

test('a chosen home or named place that has gone means here', () => {
  savePlace({ kind: 'home', place: sydney });
  expect(loadPlace(places, noSavedPlaces)).toBeNull();
  savePlace({ kind: 'named', name: 'Mark’s place', place: london });
  expect(loadPlace(places, noSavedPlaces)).toBeNull();
});
