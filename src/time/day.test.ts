import { expect, test } from 'vitest';
import { dayRelation, daysBetween, formatDateTime } from './index';

function at(dateTime: string, zone: string) {
  return Temporal.ZonedDateTime.from(`${dateTime}[${zone}]`);
}

const saturdayNight = at('2026-10-10T22:00', 'Australia/Sydney');

test('daysBetween counts calendar days, not 24-hour spans', () => {
  expect(
    daysBetween(saturdayNight, at('2026-10-10T23:59', 'Australia/Sydney')),
  ).toBe(0);
  expect(
    daysBetween(saturdayNight, at('2026-10-11T00:30', 'Australia/Sydney')),
  ).toBe(1);
  expect(
    daysBetween(saturdayNight, at('2026-10-09T23:00', 'Australia/Sydney')),
  ).toBe(-1);
  expect(
    daysBetween(saturdayNight, at('2026-10-13T08:00', 'Australia/Sydney')),
  ).toBe(3);
});

test('daysBetween judges the day in the answer’s own zone', () => {
  // 22:00 Saturday in Sydney is 12:00 Saturday in London.
  expect(
    daysBetween(saturdayNight, at('2026-10-10T23:00', 'Europe/London')),
  ).toBe(0);
});

// Intl may separate "am" with a narrow no-break space; compare plain spaces.
function plain(text: string) {
  return text.replace(/\s/g, ' ');
}

test('formatDateTime gives the weekday, date and time', () => {
  const later = at('2026-10-13T04:49', 'Australia/Sydney');
  expect(plain(formatDateTime(later, { locale: 'en-AU' }))).toBe(
    'Tuesday 13 October at 4:49 am',
  );
});

test('daysBetween counts across a daylight-saving change by calendar day', () => {
  // Sydney's clocks go forward at 02:00 on Sunday 4 October 2026, so that day has 23 hours.
  const saturdayLate = at('2026-10-03T23:30', 'Australia/Sydney');
  expect(
    daysBetween(saturdayLate, at('2026-10-04T23:30', 'Australia/Sydney')),
  ).toBe(1);
  expect(
    daysBetween(saturdayLate, at('2026-10-05T00:10', 'Australia/Sydney')),
  ).toBe(2);
});

test('daysBetween counts a 25-hour day as one day', () => {
  // Sydney's clocks go back at 03:00 on Sunday 5 April 2026, so that day has 25 hours.
  const sundayEarly = at('2026-04-05T00:30', 'Australia/Sydney');
  expect(daysBetween(sundayEarly, sundayEarly.add({ hours: 24 }))).toBe(0);
  expect(daysBetween(sundayEarly, sundayEarly.add({ hours: 25 }))).toBe(1);
});

test('dayRelation names today, tomorrow and yesterday, and nothing further', () => {
  expect(
    dayRelation(saturdayNight, at('2026-10-10T23:00', 'Australia/Sydney')),
  ).toBe('today');
  expect(
    dayRelation(saturdayNight, at('2026-10-11T08:00', 'Australia/Sydney')),
  ).toBe('tomorrow');
  expect(
    dayRelation(saturdayNight, at('2026-10-09T08:00', 'Australia/Sydney')),
  ).toBe('yesterday');
  expect(
    dayRelation(saturdayNight, at('2026-10-12T08:00', 'Australia/Sydney')),
  ).toBe('further');
});

test('formatDateTime adds the year when it differs from the reference', () => {
  const newYearsEve = at('2026-12-31T20:00', 'Australia/Sydney');
  const later = at('2027-01-02T10:49', 'Australia/Sydney');
  expect(
    plain(formatDateTime(later, { locale: 'en-AU', reference: newYearsEve })),
  ).toBe('Saturday 2 January 2027 at 10:49 am');
  expect(
    plain(
      formatDateTime(at('2026-12-31T23:00', 'Australia/Sydney'), {
        locale: 'en-AU',
        reference: at('2026-12-29T09:00', 'Australia/Sydney'),
      }),
    ),
  ).toBe('Thursday 31 December at 11:00 pm');
});
