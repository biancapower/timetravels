import { expect, test } from 'vitest';
import { readDuration } from './index';

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
  ['2 days', { days: 2, hours: 0, minutes: 0 }],
  ['3d', { days: 3, hours: 0, minutes: 0 }],
  ['1 day', { days: 1, hours: 0, minutes: 0 }],
  ['2 weeks', { weeks: 2, hours: 0, minutes: 0 }],
  ['1w', { weeks: 1, hours: 0, minutes: 0 }],
  ['6 months', { months: 6, hours: 0, minutes: 0 }],
  ['6mo', { months: 6, hours: 0, minutes: 0 }],
  ['1 month', { months: 1, hours: 0, minutes: 0 }],
  ['1y', { years: 1, hours: 0, minutes: 0 }],
  ['2 years', { years: 2, hours: 0, minutes: 0 }],
  ['1 day 2 hours', { days: 1, hours: 2, minutes: 0 }],
  ['1d2h', { days: 1, hours: 2, minutes: 0 }],
  ['1 year, 6 months', { years: 1, months: 6, hours: 0, minutes: 0 }],
  ['2 weeks and 3 days', { weeks: 2, days: 3, hours: 0, minutes: 0 }],
  ['1d 90m', { days: 1, hours: 1, minutes: 30 }],
  ['2h 3d', { days: 3, hours: 2, minutes: 0 }],
])('"%s" reads as %o', (text, expected) => {
  expect(readDuration(text)).toEqual({ duration: expected });
});

test.each([
  '',
  'soon',
  '0',
  '0m',
  '-2h',
  '1:75',
  'h',
  '1h30x',
  '1..5',
  '1000',
  '60000m',
  '99999999999999999999',
  '1.5 days',
  '0.5 months',
  '1 day 1 day',
  '2 fortnights',
  '1 day soon',
  'and 2 days',
  '0d',
  '100 years',
  '1200 months',
  '5200 weeks',
  '36500 days',
  '1d 1000h',
])('"%s" is not a duration', (text) => {
  expect(readDuration(text)).not.toHaveProperty('duration');
});

test('a duration that reads gives the duration', () => {
  expect(readDuration('90m')).toEqual({
    duration: { hours: 1, minutes: 30 },
  });
});

test.each(['0', '0m', '0h', '0d', '0.2m', '0 days 0 hours'])(
  '"%s" is under a minute',
  (text) => {
    expect(readDuration(text)).toEqual({ problem: 'zero' });
  },
);

test.each([
  ['1000', 'hours', 1000],
  ['60000m', 'hours', 1000],
  ['99999999999999999999', 'hours', 1000],
  ['1d 1000h', 'hours', 1000],
  ['100 years', 'years', 100],
  ['1200 months', 'months', 1200],
  ['5200 weeks', 'weeks', 5200],
  ['36500 days', 'days', 36500],
] as const)('"%s" is too long: under %s %s', (text, unit, limit) => {
  expect(readDuration(text)).toEqual({ problem: 'tooLong', unit, limit });
});

test.each(['', 'soon', 'banana', '-2h', '1:75', '1 day 1 day'])(
  '"%s" is unreadable',
  (text) => {
    expect(readDuration(text)).toEqual({ problem: 'unreadable' });
  },
);

test.each(['1.5 days', '0.5 months', '1.5w', '2 hours 1.5 years'])(
  '"%s" has a calendar unit that isn’t whole',
  (text) => {
    expect(readDuration(text)).toEqual({ problem: 'notWhole' });
  },
);
