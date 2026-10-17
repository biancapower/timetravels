import { expect, test } from 'vitest';
import { aliases } from './aliases';
import { buildPlaces, filterPlaces } from './places';
import { regionPlaces } from './regions';

const zones = Intl.supportedValuesOf('timeZone');
const cities = buildPlaces(zones, aliases);
const regions = regionPlaces(zones, 'en', cities);
const all = [...cities, ...regions].sort((a, b) =>
  a.city.localeCompare(b.city),
);

const zoneOf = (city: string) =>
  regions.filter((place) => place.city === city).map((place) => place.zone);

test('a country with one zone is that zone, by its own name', () => {
  expect(zoneOf('Japan')).toEqual(['Asia/Tokyo']);
  expect(zoneOf('Iceland')).toEqual(['Atlantic/Reykjavik']);
  expect(zoneOf('Christmas Island')).toEqual(['Indian/Christmas']);
});

test('a country with several zones offers each, named so they differ', () => {
  const australia = regions
    .filter((place) => place.city.startsWith('Australia: '))
    .map((place) => place.city);
  expect(australia).toEqual(
    expect.arrayContaining([
      'Australia: Perth',
      'Australia: Adelaide',
      'Australia: Sydney',
    ]),
  );
  expect(zoneOf('Australia')).toEqual([]);
});

test('a state maps to the zone its people use', () => {
  expect(zoneOf('Tasmania')).toEqual(['Australia/Hobart']);
  expect(zoneOf('Queensland')).toEqual(['Australia/Brisbane']);
});

test('a state across several zones offers each', () => {
  expect(
    regions.filter((place) => place.city.startsWith('Indiana: ')).length,
  ).toBeGreaterThan(1);
});

test('a state named like a country, or like a city in another zone, names its country', () => {
  expect(zoneOf('Georgia')).toEqual(['Asia/Tbilisi']);
  expect(zoneOf('Georgia, United States')).toEqual(['America/New_York']);
});

test('states that share a name each name their country', () => {
  expect(zoneOf('La Rioja')).toEqual([]);
  expect(zoneOf('La Rioja, Spain')).toEqual(['Europe/Madrid']);
  expect(
    all.filter((place) => place.city === 'La Rioja, Argentina'),
  ).toHaveLength(1);
});

test('a name already in the list for the same zone isn’t repeated', () => {
  expect(all.filter((place) => place.city === 'Singapore')).toHaveLength(1);
});

test('country names follow the locale', () => {
  const french = regionPlaces(zones, 'fr', cities);
  expect(french).toContainEqual({
    city: 'Japon',
    zone: 'Asia/Tokyo',
    searchOnly: true,
  });
});

test('only zones this browser knows are kept', () => {
  const few = ['Asia/Tokyo', 'Australia/Hobart'];
  expect(regionPlaces(few, 'en', [])).toEqual(
    expect.arrayContaining([
      { city: 'Japan', zone: 'Asia/Tokyo', searchOnly: true },
      { city: 'Tasmania', zone: 'Australia/Hobart', searchOnly: true },
    ]),
  );
  expect(
    regionPlaces(few, 'en', []).every((place) => few.includes(place.zone)),
  ).toBe(true);
});

test('searching a country finds it before places that merely start the same', () => {
  expect(filterPlaces(all, 'india')[0]).toEqual({
    city: 'India',
    zone: zones.includes('Asia/Kolkata') ? 'Asia/Kolkata' : 'Asia/Calcutta',
    searchOnly: true,
  });
  expect(filterPlaces(all, 'tas').map((place) => place.city)).toContain(
    'Tasmania',
  );
});

test('countries and states wait for something to be typed', () => {
  const opening = filterPlaces(all, '');
  expect(opening).toHaveLength(cities.length);
  expect(opening.some((place) => place.city === 'Tasmania')).toBe(false);
});

test('a city starting with the search comes before a country or state that does, unless one is named exactly', () => {
  const first = (query: string) => filterPlaces(all, query)[0]?.city;
  expect(first('tok')).toBe('Tokyo');
  expect(first('tas')).toBe('Tashkent');
  expect(first('india')).toBe('India');
  expect(first('japan')).toBe('Japan');
});
