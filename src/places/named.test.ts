import { expect, test } from 'vitest';
import {
  nameProblem,
  noSavedPlaces,
  withNamed,
  withoutNamed,
  type SavedPlaces,
} from './named';
import type { Place } from './places';

const london: Place = { city: 'London', zone: 'Europe/London' };
const tokyo: Place = { city: 'Tokyo', zone: 'Asia/Tokyo' };
const saved: SavedPlaces = {
  home: null,
  named: [
    { name: 'Mark’s place', place: london },
    { name: 'Office', place: tokyo },
  ],
};
const reserved = ['home', 'here'];

test('a new name is fine, with any spacing around it', () => {
  expect(nameProblem('  at Mark ', saved, { reserved })).toBeNull();
});

test('a name must have some text', () => {
  expect(nameProblem('   ', saved, { reserved })).toBe('empty');
});

test('a name is at most 30 characters', () => {
  expect(nameProblem('a'.repeat(30), saved, { reserved })).toBeNull();
  expect(nameProblem('a'.repeat(31), saved, { reserved })).toBe('long');
  expect(nameProblem('🏠'.repeat(30), saved, { reserved })).toBeNull();
});

test('the app’s own words are not names, whatever their case', () => {
  expect(nameProblem('Home', saved, { reserved })).toBe('reserved');
  expect(nameProblem('HERE', saved, { reserved })).toBe('reserved');
});

test('two places cannot share a name, whatever its case', () => {
  expect(nameProblem('office', saved, { reserved })).toBe('taken');
});

test('a place keeps its own name, or changes its case, when edited', () => {
  expect(
    nameProblem('Office', saved, { reserved, original: 'Office' }),
  ).toBeNull();
  expect(
    nameProblem('OFFICE', saved, { reserved, original: 'Office' }),
  ).toBeNull();
  expect(
    nameProblem('office', saved, { reserved, original: 'Mark’s place' }),
  ).toBe('taken');
});

test('a new named place goes at the end', () => {
  expect(withNamed(noSavedPlaces, { name: 'Office', place: tokyo })).toEqual({
    home: null,
    named: [{ name: 'Office', place: tokyo }],
  });
});

test('an edited named place keeps its position', () => {
  const edited = withNamed(
    saved,
    { name: 'Mark', place: tokyo },
    'Mark’s place',
  );
  expect(edited.named.map((entry) => entry.name)).toEqual(['Mark', 'Office']);
  expect(edited.named[0]?.place).toEqual(tokyo);
});

test('a removed named place is gone, and the others stay', () => {
  expect(withoutNamed(saved, 'Office').named).toEqual([
    { name: 'Mark’s place', place: london },
  ]);
});
