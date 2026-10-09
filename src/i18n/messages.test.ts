import { expect, test } from 'vitest';
import { pickLocale } from './messages';

test('pickLocale falls back to English when no preferred language has messages', () => {
  expect(pickLocale(['de-DE', 'fr'])).toBe('en');
  expect(pickLocale([])).toBe('en');
});

test('pickLocale matches a regional preference to its language', () => {
  expect(pickLocale(['en-AU'])).toBe('en');
});
