import { expect, test } from 'vitest';
import { UnknownZoneError, nowIn } from './index';

const instant = Temporal.Instant.from('2026-10-03T12:00:00Z');

test('nowIn gives the wall-clock time in a zone for an injected instant', () => {
  expect(nowIn('Australia/Sydney', instant).toPlainDateTime().toString()).toBe(
    '2026-10-03T22:00:00',
  );
  expect(nowIn('Europe/London', instant).toPlainDateTime().toString()).toBe(
    '2026-10-03T13:00:00',
  );
});

test('a zone name that does not exist throws UnknownZoneError', () => {
  expect(() => nowIn('Mars/Olympus_Mons', instant)).toThrow(UnknownZoneError);
});

test('UnknownZoneError names the zone it could not find', () => {
  try {
    nowIn('Mars/Olympus_Mons', instant);
    expect.unreachable();
  } catch (error) {
    expect(error).toBeInstanceOf(UnknownZoneError);
    expect((error as UnknownZoneError).zone).toBe('Mars/Olympus_Mons');
  }
});
