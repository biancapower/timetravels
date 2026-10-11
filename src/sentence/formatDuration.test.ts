import { createIntl } from 'react-intl';
import { expect, test } from 'vitest';
import { catalogues } from '../i18n/messages';
import { formatDuration } from './formatDuration';

const intl = createIntl({ locale: 'en', messages: catalogues.en });

test.each([
  [{ hours: 1, minutes: 0 }, '1 hour'],
  [{ hours: 0, minutes: 30 }, '30 minutes'],
  [{ hours: 1, minutes: 30 }, '1 hour 30 minutes'],
  [{ days: 1, hours: 0, minutes: 0 }, '1 day'],
  [{ weeks: 2, hours: 0, minutes: 0 }, '2 weeks'],
  [{ months: 6, hours: 0, minutes: 0 }, '6 months'],
  [{ years: 1, months: 6, hours: 0, minutes: 0 }, '1 year 6 months'],
  [{ days: 1, hours: 2, minutes: 0 }, '1 day 2 hours'],
  [
    { weeks: 1, days: 2, hours: 3, minutes: 4 },
    '1 week 2 days 3 hours 4 minutes',
  ],
])('%o reads as "%s"', (duration, expected) => {
  expect(formatDuration(intl, duration)).toBe(expected);
});
