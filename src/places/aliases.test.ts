import { expect, test } from 'vitest';
import { aliases } from './aliases';

test('every alias points at a zone the runtime knows', () => {
  for (const { zone } of aliases) {
    expect(
      () => new Intl.DateTimeFormat('en', { timeZone: zone }),
    ).not.toThrow();
  }
});

test('no city appears twice', () => {
  const cities = aliases.map((alias) => alias.city);
  expect(new Set(cities).size).toBe(cities.length);
});
