import { afterEach, expect, test, vi } from 'vitest';
import { noSavedPlaces, type SavedPlaces } from './named';
import type { Place } from './places';
import {
  loadAnchorPlace,
  loadPlace,
  loadSavedPlaces,
  saveAnchorPlace,
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
  const india: Place = {
    city: 'India',
    zone: 'Asia/Calcutta',
    searchOnly: true,
  };
  expect(loadPlace([india, kolkata], noSavedPlaces)).toEqual({
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

test('a third place for the chosen time is loaded again, and cleared', () => {
  saveAnchorPlace(sydney);
  expect(loadAnchorPlace(places)).toEqual(sydney);
  saveAnchorPlace(null);
  expect(loadAnchorPlace(places)).toBeNull();
});

test('a third place that is unreadable or not in the list is ignored', () => {
  localStorage.setItem('timetravels.anchorPlace', '{not json');
  expect(loadAnchorPlace(places)).toBeNull();
  localStorage.setItem(
    'timetravels.anchorPlace',
    JSON.stringify({ city: 'Atlantis', zone: 'X/Y' }),
  );
  expect(loadAnchorPlace(places)).toBeNull();
});

test('a country or state is saved as its name and zone, and found in the list again', () => {
  const tasmania: Place = {
    city: 'Tasmania',
    zone: 'Australia/Hobart',
    searchOnly: true,
  };
  const withStates = [...places, tasmania];
  savePlace({ kind: 'city', place: tasmania });
  saveSavedPlaces({
    home: tasmania,
    named: [{ name: 'Work', place: tasmania }],
  });
  saveAnchorPlace(tasmania);

  for (const key of [
    'timetravels.place',
    'timetravels.savedPlaces',
    'timetravels.anchorPlace',
  ])
    expect(localStorage.getItem(key)).not.toContain('searchOnly');
  const loaded = loadSavedPlaces(withStates);
  expect(loaded).toEqual({
    home: tasmania,
    named: [{ name: 'Work', place: tasmania }],
  });
  expect(loadPlace(withStates, loaded)).toEqual({
    kind: 'city',
    place: tasmania,
  });
  expect(loadAnchorPlace(withStates)).toEqual(tasmania);
});
