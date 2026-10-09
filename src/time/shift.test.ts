import { expect, test } from 'vitest';
import { shift } from './index';

const tenHours = { hours: 10, minutes: 0 };

function at(dateTime: string, zone: string) {
  return Temporal.ZonedDateTime.from(`${dateTime}[${zone}]`);
}

function wallTime(moment: Temporal.ZonedDateTime) {
  return moment.toPlainDateTime().toString();
}

// Sydney's clocks go forward at 02:00 on 4 October 2026 and back at
// 03:00 on 5 April 2026; London's go back at 02:00 on 25 October 2026.

test('10 hours later from 22:00 the evening before Sydney springs forward is 09:00', () => {
  const result = shift(
    at('2026-10-03T22:00', 'Australia/Sydney'),
    tenHours,
    'later',
  );
  expect(wallTime(result)).toBe('2026-10-04T09:00:00');
});

test('10 hours later from 22:00 the evening before Sydney falls back is 07:00', () => {
  const result = shift(
    at('2026-04-04T22:00', 'Australia/Sydney'),
    tenHours,
    'later',
  );
  expect(wallTime(result)).toBe('2026-04-05T07:00:00');
});

test('10 hours earlier from 09:00 the morning after Sydney springs forward is 22:00', () => {
  const result = shift(
    at('2026-10-04T09:00', 'Australia/Sydney'),
    tenHours,
    'earlier',
  );
  expect(wallTime(result)).toBe('2026-10-03T22:00:00');
});

test('10 hours earlier from 07:00 the morning after Sydney falls back is 22:00', () => {
  const result = shift(
    at('2026-04-05T07:00', 'Australia/Sydney'),
    tenHours,
    'earlier',
  );
  expect(wallTime(result)).toBe('2026-04-04T22:00:00');
});

test('a span from Sydney across a change in Sydney gives the right London time', () => {
  const result = shift(
    at('2026-10-03T22:00', 'Australia/Sydney'),
    tenHours,
    'later',
  );
  expect(wallTime(result.withTimeZone('Europe/London'))).toBe(
    '2026-10-03T23:00:00',
  );
});

test('a span from Sydney across a change in London gives the right London time', () => {
  const result = shift(
    at('2026-10-25T08:00', 'Australia/Sydney'),
    tenHours,
    'later',
  );
  expect(wallTime(result.withTimeZone('Europe/London'))).toBe(
    '2026-10-25T07:00:00',
  );
});

test('minutes count as well as hours', () => {
  const result = shift(
    at('2026-10-03T22:00', 'Australia/Sydney'),
    { hours: 1, minutes: 30 },
    'later',
  );
  expect(wallTime(result)).toBe('2026-10-03T23:30:00');
});
