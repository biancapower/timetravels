import { expect, test } from 'vitest';
import { formatTime } from './index';

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

test.todo('zoneLabel gives the city and the offset at that moment');
