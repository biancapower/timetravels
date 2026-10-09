import { expect, test } from 'vitest';
import { anchorAt, formatClockTime, isPast, nextWholeHour } from './index';

const time = (text: string) => Temporal.PlainTime.from(text);

// 09:41 on Saturday 10 October 2026 in Sydney.
const now = Temporal.Instant.from('2026-10-09T22:41:00Z');

test('anchorAt places a time on today, tomorrow or yesterday in a zone', () => {
  const today = anchorAt(now, 'Australia/Sydney', time('15:00'), 0);
  expect(today.moment.toString()).toBe(
    '2026-10-10T15:00:00+11:00[Australia/Sydney]',
  );
  expect(today.issue).toBe('none');
  expect(
    anchorAt(now, 'Australia/Sydney', time('15:00'), 1)
      .moment.toPlainDate()
      .toString(),
  ).toBe('2026-10-11');
  expect(
    anchorAt(now, 'Australia/Sydney', time('15:00'), -1)
      .moment.toPlainDate()
      .toString(),
  ).toBe('2026-10-09');
});

test('"today" means today in the anchor’s zone, not the device’s', () => {
  // At 09:41 Saturday in Sydney it is still 23:41 Friday in London.
  const london = anchorAt(now, 'Europe/London', time('15:00'), 0);
  expect(london.moment.toString()).toBe(
    '2026-10-09T15:00:00+01:00[Europe/London]',
  );
});

test('a time skipped when the clocks go forward is flagged and counted from just after', () => {
  // Sydney's clocks jump from 02:00 to 03:00 on Sunday 4 October 2026.
  const saturday = Temporal.Instant.from('2026-10-03T01:00:00Z');
  const skipped = anchorAt(saturday, 'Australia/Sydney', time('02:30'), 1);
  expect(skipped.issue).toBe('skipped');
  expect(skipped.moment.toPlainTime().toString()).toBe('03:30:00');
});

test('a time that happens twice when the clocks go back is flagged and the first is used', () => {
  // Sydney's clocks go back from 03:00 to 02:00 on Sunday 5 April 2026.
  const saturday = Temporal.Instant.from('2026-04-04T01:00:00Z');
  const repeated = anchorAt(saturday, 'Australia/Sydney', time('02:30'), 1);
  expect(repeated.issue).toBe('repeated');
  expect(repeated.moment.toString()).toBe(
    '2026-04-05T02:30:00+11:00[Australia/Sydney]',
  );
});

test('nextWholeHour rounds the current time up to the hour in a zone', () => {
  expect(nextWholeHour(now, 'Australia/Sydney')).toEqual({
    time: time('10:00'),
    day: 0,
  });
  expect(
    nextWholeHour(
      Temporal.Instant.from('2026-10-09T23:00:00Z'),
      'Australia/Sydney',
    ),
  ).toEqual({ time: time('10:00'), day: 0 });
});

test('nextWholeHour late in the evening is midnight tomorrow, not today', () => {
  // 23:30 on Saturday 10 October in Sydney.
  const lateEvening = Temporal.Instant.from('2026-10-10T12:30:00Z');
  expect(nextWholeHour(lateEvening, 'Australia/Sydney')).toEqual({
    time: time('00:00'),
    day: 1,
  });
});

test('isPast compares a moment with now', () => {
  const sydney = (text: string) =>
    Temporal.ZonedDateTime.from(`${text}[Australia/Sydney]`);
  expect(isPast(sydney('2026-10-10T09:00'), now)).toBe(true);
  expect(isPast(sydney('2026-10-10T10:00'), now)).toBe(false);
});

// Intl may separate "pm" with a narrow no-break space; compare plain spaces.
const plain = (text: string) => text.replace(/\s/g, ' ');

test('formatClockTime leaves out minutes on the hour', () => {
  expect(plain(formatClockTime(time('15:00'), { locale: 'en-AU' }))).toBe(
    '3 pm',
  );
  expect(plain(formatClockTime(time('15:30'), { locale: 'en-AU' }))).toBe(
    '3:30 pm',
  );
  expect(plain(formatClockTime(time('15:00'), { locale: 'en-GB' }))).toBe(
    '15:00',
  );
});

// Lord Howe Island moves its clocks by 30 minutes: forward from 02:00 to
// 02:30 on Sunday 4 October 2026, and back from 02:00 to 01:30 on Sunday
// 5 April 2026.
test('a time in a 30-minute gap counts from 30 minutes after the jump', () => {
  const saturday = Temporal.Instant.from('2026-10-03T01:00:00Z');
  const skipped = anchorAt(saturday, 'Australia/Lord_Howe', time('02:15'), 1);
  expect(skipped.issue).toBe('skipped');
  expect(skipped.moment.toPlainTime().toString()).toBe('02:45:00');
});

test('a time in a 30-minute overlap uses its first occurrence', () => {
  const saturday = Temporal.Instant.from('2026-04-04T01:00:00Z');
  const repeated = anchorAt(saturday, 'Australia/Lord_Howe', time('01:45'), 1);
  expect(repeated.issue).toBe('repeated');
  expect(repeated.moment.toString()).toBe(
    '2026-04-05T01:45:00+11:00[Australia/Lord_Howe]',
  );
});

test('yesterday is the day before today in the anchor’s zone', () => {
  const yesterday = anchorAt(now, 'Australia/Sydney', time('15:00'), -1);
  expect(yesterday.moment.toString()).toBe(
    '2026-10-09T15:00:00+11:00[Australia/Sydney]',
  );
  expect(yesterday.issue).toBe('none');
});
