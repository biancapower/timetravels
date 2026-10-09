import { expect, test } from 'vitest';
import { formatTime, zoneLabel } from './index';

const sundayMorning = Temporal.ZonedDateTime.from(
  '2026-10-04T09:05[Australia/Sydney]',
);

// Intl may separate "am" with a narrow no-break space; compare plain spaces.
function plain(text: string) {
  return text.replace(/\s/g, ' ');
}

test('formatTime uses a 12-hour clock where the locale prefers it', () => {
  expect(plain(formatTime(sundayMorning, { locale: 'en-AU' }))).toBe(
    'Sunday 9:05 am',
  );
});

test('formatTime uses a 24-hour clock where the locale prefers it', () => {
  expect(plain(formatTime(sundayMorning, { locale: 'en-GB' }))).toBe(
    'Sunday 09:05',
  );
});

test('formatTime shows the time in the moment’s own zone', () => {
  const inLondon = sundayMorning.withTimeZone('Europe/London');
  expect(plain(formatTime(inLondon, { locale: 'en-GB' }))).toBe(
    'Saturday 23:05',
  );
});

test('zoneLabel gives the city and the offset at that moment', () => {
  expect(zoneLabel(sundayMorning, { locale: 'en-AU' })).toBe('Sydney (GMT+11)');
});

test('zoneLabel follows the offset through the year', () => {
  const july = Temporal.ZonedDateTime.from(
    '2026-07-01T12:00[Australia/Sydney]',
  );
  expect(zoneLabel(july, { locale: 'en-AU' })).toBe('Sydney (GMT+10)');
});

test('zoneLabel spells out multi-word cities and zero offsets', () => {
  const newYork = Temporal.ZonedDateTime.from(
    '2026-10-04T12:00[America/New_York]',
  );
  const london = Temporal.ZonedDateTime.from('2026-12-01T12:00[Europe/London]');
  expect(zoneLabel(newYork, { locale: 'en-AU' })).toBe('New York (GMT-4)');
  // Node prints a zero offset as "GMT+0"; other Intl implementations may print "GMT".
  expect(zoneLabel(london, { locale: 'en-AU' })).toMatch(
    /^London \(GMT(\+0)?\)$/,
  );
});

test('zoneLabel uses a given city name instead of the one in the zone id', () => {
  const losAngeles = Temporal.ZonedDateTime.from(
    '2026-10-04T12:00[America/Los_Angeles]',
  );
  expect(
    zoneLabel(losAngeles, { locale: 'en-AU', city: 'San Francisco' }),
  ).toBe('San Francisco (GMT-7)');
});
