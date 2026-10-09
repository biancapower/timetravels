import { expect, test } from 'vitest';
import { parseDuration } from './index';

test.each([
  ['10', { hours: 10, minutes: 0 }],
  ['1.5', { hours: 1, minutes: 30 }],
  ['1.5h', { hours: 1, minutes: 30 }],
  ['90m', { hours: 1, minutes: 30 }],
  ['90 min', { hours: 1, minutes: 30 }],
  ['90 minutes', { hours: 1, minutes: 30 }],
  ['2h', { hours: 2, minutes: 0 }],
  ['2 hr', { hours: 2, minutes: 0 }],
  ['2 hours', { hours: 2, minutes: 0 }],
  ['1 hour', { hours: 1, minutes: 0 }],
  ['1h30', { hours: 1, minutes: 30 }],
  ['1h 30m', { hours: 1, minutes: 30 }],
  ['1h30m', { hours: 1, minutes: 30 }],
  ['1:30', { hours: 1, minutes: 30 }],
  ['  2H 5M  ', { hours: 2, minutes: 5 }],
  ['45m', { hours: 0, minutes: 45 }],
  ['0.25h', { hours: 0, minutes: 15 }],
  ['1.01h', { hours: 1, minutes: 1 }],
])('"%s" reads as %o', (text, expected) => {
  expect(parseDuration(text)).toEqual(expected);
});

test.each([
  '',
  'soon',
  '0',
  '0m',
  '-2h',
  '1:75',
  '2 days',
  'h',
  '1h30x',
  '1..5',
  '1000',
  '60000m',
  '99999999999999999999',
])('"%s" is not a duration', (text) => {
  expect(parseDuration(text)).toBeNull();
});
