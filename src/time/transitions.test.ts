import { expect, test } from 'vitest';
import { clockDifference, transitionsBetween } from './index';

const instant = (text: string) => Temporal.Instant.from(text);

// Sydney: forward at 02:00 on Sunday 4 October 2026, back at 03:00 on Sunday 5 April 2026.
// London: back at 02:00 on Sunday 25 October 2026.

test('finds a clocks-forward change inside the span', () => {
  const found = transitionsBetween(
    instant('2026-10-03T11:00:00Z'), // 22:00 Saturday, Sydney
    instant('2026-10-03T21:00:00Z'), // 10 hours later
    ['Australia/Sydney'],
  );
  expect(found).toHaveLength(1);
  const [change] = found;
  expect(change?.zone).toBe('Australia/Sydney');
  expect(change?.direction).toBe('forward');
  expect(change?.minutes).toBe(60);
  expect(change?.wallTime.toString()).toBe('2026-10-04T02:00:00');
});

test('finds a clocks-back change, and reports the wall time before it', () => {
  const [change] = transitionsBetween(
    instant('2026-04-04T11:00:00Z'),
    instant('2026-04-04T21:00:00Z'),
    ['Australia/Sydney'],
  );
  expect(change?.direction).toBe('back');
  expect(change?.minutes).toBe(60);
  expect(change?.wallTime.toString()).toBe('2026-04-05T03:00:00');
});

test('finds nothing when no change lies inside the span', () => {
  expect(
    transitionsBetween(
      instant('2026-10-10T11:00:00Z'),
      instant('2026-10-10T21:00:00Z'),
      ['Australia/Sydney', 'Europe/London'],
    ),
  ).toEqual([]);
});

test('works with the span given backwards, as for "ago"', () => {
  expect(
    transitionsBetween(
      instant('2026-10-03T21:00:00Z'),
      instant('2026-10-03T11:00:00Z'),
      ['Australia/Sydney'],
    ),
  ).toHaveLength(1);
});

test('checks every zone given, once each', () => {
  const found = transitionsBetween(
    instant('2026-10-24T12:00:00Z'),
    instant('2026-10-25T12:00:00Z'),
    ['Australia/Sydney', 'Europe/London', 'Europe/London'],
  );
  expect(found.map((change) => change.zone)).toEqual(['Europe/London']);
});

test('a zone without daylight saving never has a change', () => {
  expect(
    transitionsBetween(
      instant('2026-01-01T00:00:00Z'),
      instant('2026-02-11T00:00:00Z'),
      ['Asia/Tokyo'],
    ),
  ).toEqual([]);
});

test('clockDifference is how far the wall clock moves, not the elapsed time', () => {
  // 10 hours across Sydney's clocks-forward change: the clock moves 11.
  expect(
    clockDifference(
      instant('2026-10-03T11:00:00Z'),
      instant('2026-10-03T21:00:00Z'),
      'Australia/Sydney',
    ),
  ).toEqual({ hours: 11, minutes: 0 });
  // The same span, given backwards.
  expect(
    clockDifference(
      instant('2026-10-03T21:00:00Z'),
      instant('2026-10-03T11:00:00Z'),
      'Australia/Sydney',
    ),
  ).toEqual({ hours: 11, minutes: 0 });
});
