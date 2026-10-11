import { expect, test } from 'vitest';
import { calendarLanding, elapsed, isCalendar, shift } from './index';

function at(dateTime: string, zone: string) {
  return Temporal.ZonedDateTime.from(`${dateTime}[${zone}]`);
}

function wallTime(moment: Temporal.ZonedDateTime) {
  return moment.toPlainDateTime().toString();
}

const none = { hours: 0, minutes: 0 };

// Sydney's clocks go forward at 02:00 on 4 October 2026 and back at
// 03:00 on 4 April 2027; London's go back at 02:00 on 25 October 2026.

test('a day later keeps the clock time across a clock change', () => {
  const start = at('2026-10-03T22:00', 'Australia/Sydney');
  const result = shift(start, { ...none, days: 1 }, 'later');
  expect(wallTime(result)).toBe('2026-10-04T22:00:00');
  expect(elapsed(start, result)).toEqual({ hours: 23, minutes: 0 });
});

test('24 hours later is still exact elapsed time', () => {
  const start = at('2026-10-03T22:00', 'Australia/Sydney');
  const result = shift(start, { hours: 24, minutes: 0 }, 'later');
  expect(wallTime(result)).toBe('2026-10-04T23:00:00');
});

test('a month later keeps the day, falling back to the month’s last day', () => {
  const month = { ...none, months: 1 };
  expect(
    wallTime(shift(at('2026-01-31T09:00', 'Europe/London'), month, 'later')),
  ).toBe('2026-02-28T09:00:00');
  expect(
    wallTime(shift(at('2028-01-31T09:00', 'Europe/London'), month, 'later')),
  ).toBe('2028-02-29T09:00:00');
  expect(
    wallTime(shift(at('2026-03-31T09:00', 'Europe/London'), month, 'earlier')),
  ).toBe('2026-02-28T09:00:00');
});

test('6 months from 4 October is 4 April at the same time, across the change', () => {
  const result = shift(
    at('2026-10-04T09:00', 'Australia/Sydney'),
    { ...none, months: 6 },
    'later',
  );
  expect(wallTime(result)).toBe('2027-04-04T09:00:00');
});

test('weeks and years are calendar units too', () => {
  const start = at('2026-10-01T09:00', 'Australia/Sydney');
  expect(wallTime(shift(start, { ...none, weeks: 2 }, 'later'))).toBe(
    '2026-10-15T09:00:00',
  );
  expect(wallTime(shift(start, { ...none, years: 1 }, 'earlier'))).toBe(
    '2025-10-01T09:00:00',
  );
});

test('mixed units move the calendar part first, then the exact part', () => {
  // 01:00 plus a day is 01:00 on the 4th, before the change; two exact
  // hours from there cross the skipped hour and land at 04:00.
  const result = shift(
    at('2026-10-03T01:00', 'Australia/Sydney'),
    { days: 1, hours: 2, minutes: 0 },
    'later',
  );
  expect(wallTime(result)).toBe('2026-10-04T04:00:00');
});

test('isCalendar is true when any day, week, month or year is set', () => {
  expect(isCalendar({ hours: 10, minutes: 0 })).toBe(false);
  expect(isCalendar({ ...none, days: 1 })).toBe(true);
  expect(isCalendar({ years: 0, months: 0, hours: 1, minutes: 0 })).toBe(false);
  expect(isCalendar({ months: 6, hours: 0, minutes: 0 })).toBe(true);
});

test('calendarLanding flags a step that lands on a skipped time', () => {
  // 02:30 on the 4th never happened in Sydney.
  const start = at('2026-10-03T02:30', 'Australia/Sydney');
  expect(calendarLanding(start, { ...none, days: 1 }, 'later')).toBe('skipped');
});

test('calendarLanding flags a step that lands on a repeated time', () => {
  // 01:30 on the 25th happened twice in London.
  const start = at('2026-10-24T01:30', 'Europe/London');
  expect(calendarLanding(start, { ...none, days: 1 }, 'later')).toBe(
    'repeated',
  );
});

test('calendarLanding is none for ordinary steps and exact spans', () => {
  const start = at('2026-10-03T02:30', 'Australia/Sydney');
  expect(calendarLanding(start, { ...none, days: 2 }, 'later')).toBe('none');
  expect(calendarLanding(start, { hours: 24, minutes: 0 }, 'later')).toBe(
    'none',
  );
});

test('elapsed is the exact time between two moments, in either order', () => {
  const start = at('2026-10-03T22:00', 'Australia/Sydney');
  const end = at('2026-10-05T09:30', 'Australia/Sydney');
  expect(elapsed(start, end)).toEqual({ hours: 34, minutes: 30 });
  expect(elapsed(end, start)).toEqual({ hours: 34, minutes: 30 });
});
