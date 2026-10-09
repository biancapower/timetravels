import { expect, test } from 'vitest';
import * as time from './index';

test('the time module loads', () => {
  expect(time).toBeDefined();
});

test('Temporal is available to the time logic', () => {
  expect(Temporal.Instant.from('2026-10-03T12:00:00Z').epochMilliseconds).toBe(
    Date.UTC(2026, 9, 3, 12),
  );
});
