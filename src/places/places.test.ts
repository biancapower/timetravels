import { expect, test } from 'vitest';
import { buildPlaces, cityOf, filterPlaces, type Place } from './places';

const zones = [
  'Australia/Sydney',
  'America/New_York',
  'America/Argentina/Buenos_Aires',
  'America/Los_Angeles',
  'Asia/Calcutta',
  'Europe/Kiev',
  'Europe/Zurich',
  'Etc/GMT+5',
  'UTC',
];

function cities(places: readonly Place[]) {
  return places.map((place) => place.city);
}

test('a place is named after the city in its zone id', () => {
  const places = buildPlaces(zones, []);
  expect(cities(places)).toContain('Sydney');
  expect(cities(places)).toContain('New York');
  expect(cities(places)).toContain('Buenos Aires');
});

test('zones that are not cities are left out', () => {
  const places = buildPlaces(zones, []);
  expect(places.map((place) => place.zone)).not.toContain('Etc/GMT+5');
  expect(places.map((place) => place.zone)).not.toContain('UTC');
});

test('cities with an old spelling in the zone data use the current name', () => {
  const places = buildPlaces(zones, []);
  expect(places).toContainEqual({ city: 'Kolkata', zone: 'Asia/Calcutta' });
  expect(places).toContainEqual({ city: 'Kyiv', zone: 'Europe/Kiev' });
  expect(cities(places)).not.toContain('Calcutta');
});

test('aliases add cities that share another city’s zone', () => {
  const places = buildPlaces(zones, [
    { city: 'San Francisco', zone: 'America/Los_Angeles' },
  ]);
  expect(places).toContainEqual({
    city: 'San Francisco',
    zone: 'America/Los_Angeles',
  });
});

test('places are in alphabetical order', () => {
  const names = cities(buildPlaces(zones, []));
  expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
});

test('filtering matches the city name, ignoring case and accents', () => {
  const places = buildPlaces(zones, []);
  expect(cities(filterPlaces(places, 'zürich'))).toEqual(['Zurich']);
  expect(cities(filterPlaces(places, 'NEW'))).toEqual(['New York']);
});

test('filtering also matches the zone id', () => {
  const places = buildPlaces(zones, []);
  expect(cities(filterPlaces(places, 'australia'))).toEqual(['Sydney']);
});

test('cities that start with the query come before other matches', () => {
  const places = buildPlaces(zones, [
    { city: 'Aires Town', zone: 'Australia/Sydney' },
  ]);
  expect(cities(filterPlaces(places, 'aires'))).toEqual([
    'Aires Town',
    'Buenos Aires',
  ]);
});

test('an empty query keeps every place', () => {
  const places = buildPlaces(zones, []);
  expect(filterPlaces(places, '  ')).toEqual(places);
});

test('cityOf names the city of a zone, with current spellings', () => {
  expect(cityOf('Asia/Calcutta')).toBe('Kolkata');
  expect(cityOf('America/New_York')).toBe('New York');
  expect(cityOf('UTC')).toBeUndefined();
});
