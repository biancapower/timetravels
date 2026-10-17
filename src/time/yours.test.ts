import { expect, test } from 'vitest';
import { yourTime } from './index';

function at(dateTime: string, zone: string) {
  return Temporal.ZonedDateTime.from(`${dateTime}[${zone}]`);
}

test('a place behind you gives your later clock time, on the same day', () => {
  // 11 am Saturday in London (GMT+1) is 8 pm Saturday in Sydney (GMT+10).
  const yours = yourTime(
    at('2026-08-08T11:00', 'Europe/London'),
    'Australia/Sydney',
  );
  expect(yours?.moment.toString()).toBe(
    '2026-08-08T20:00:00+10:00[Australia/Sydney]',
  );
  expect(yours?.otherDay).toBe(false);
});

test('a place ahead of you gives your earlier clock time', () => {
  // 9 pm Saturday in Sydney is 12 pm Saturday in London.
  const yours = yourTime(
    at('2026-08-08T21:00', 'Australia/Sydney'),
    'Europe/London',
  );
  expect(yours?.moment.toPlainDateTime().toString()).toBe(
    '2026-08-08T12:00:00',
  );
  expect(yours?.otherDay).toBe(false);
});

test('your day is named when it differs from the place’s', () => {
  // 4 pm Saturday in London is 1 am Sunday in Sydney.
  const ahead = yourTime(
    at('2026-08-08T16:00', 'Europe/London'),
    'Australia/Sydney',
  );
  expect(ahead?.moment.toPlainDateTime().toString()).toBe(
    '2026-08-09T01:00:00',
  );
  expect(ahead?.otherDay).toBe(true);
  // 8 am Sunday in Sydney is 11 pm Saturday in London.
  const behind = yourTime(
    at('2026-08-09T08:00', 'Australia/Sydney'),
    'Europe/London',
  );
  expect(behind?.moment.toPlainDateTime().toString()).toBe(
    '2026-08-08T23:00:00',
  );
  expect(behind?.otherDay).toBe(true);
});

test('a place whose clock reads the same as yours gives nothing', () => {
  expect(
    yourTime(at('2026-08-08T11:00', 'Australia/Melbourne'), 'Australia/Sydney'),
  ).toBeNull();
  expect(
    yourTime(at('2026-08-08T11:00', 'Australia/Sydney'), 'Australia/Sydney'),
  ).toBeNull();
});

test('each zone’s offset is taken at the answer’s moment, not now', () => {
  // Brisbane keeps GMT+10 all year; Sydney is GMT+10 in winter and GMT+11
  // from the first Sunday in October.
  expect(
    yourTime(at('2026-08-08T11:00', 'Australia/Brisbane'), 'Australia/Sydney'),
  ).toBeNull();
  const summer = yourTime(
    at('2026-12-05T11:00', 'Australia/Brisbane'),
    'Australia/Sydney',
  );
  expect(summer?.moment.toPlainDateTime().toString()).toBe(
    '2026-12-05T12:00:00',
  );
});
