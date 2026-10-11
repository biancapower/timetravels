import { expect, test } from 'vitest';
import { formatLocale } from './formatLocale';

test('dates follow the first preferred language, not the browser’s own', () => {
  expect(formatLocale(['en-AU', 'en'], 'en-US')).toBe('en-AU');
});

test('the browser’s default is kept when it is the same language and region', () => {
  // The default can carry the device's own 12- or 24-hour setting.
  expect(formatLocale(['en-AU'], 'en-AU-u-hc-h23')).toBe('en-AU-u-hc-h23');
});

test('with no preferred language, the browser’s default is used', () => {
  expect(formatLocale([], 'en-GB')).toBe('en-GB');
});

test('a malformed tag is skipped, not fatal', () => {
  expect(formatLocale(['en_US', 'en-AU'], 'en-US')).toBe('en-AU');
});
