import { expect, test } from 'vitest';
import { formatLocale } from './formatLocale';

test('dates follow the first preferred language, not the browser’s own', () => {
  expect(formatLocale(['en-AU', 'en'], 'en', 'en-US')).toBe('en-AU');
});

test('the browser’s default is kept when it is the same language and region', () => {
  expect(formatLocale(['en-AU'], 'en', 'en-AU-u-hc-h23')).toBe(
    'en-AU-u-hc-h23',
  );
});

test('with no preferred language, the browser’s default is used', () => {
  expect(formatLocale([], 'en', 'en-GB')).toBe('en-GB');
});

test('a malformed tag is skipped, not fatal', () => {
  expect(formatLocale(['en_US', 'en-AU'], 'en', 'en-US')).toBe('en-AU');
});

test('a preferred language without messages is passed over', () => {
  // German dates in an English sentence would read oddly.
  expect(formatLocale(['de', 'en-AU'], 'en', 'de-DE')).toBe('en-AU');
  expect(formatLocale(['de'], 'en', 'de-DE')).toBe('en');
});

test('an en-US visitor still sees US dates', () => {
  expect(formatLocale(['en-US'], 'en', 'en-AU')).toBe('en-US');
});

test('a bare language keeps the browser’s region', () => {
  expect(formatLocale(['en'], 'en', 'en-AU')).toBe('en-AU');
});
