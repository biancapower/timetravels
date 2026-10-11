import type { IntlShape } from 'react-intl';
import type { Duration } from '../time';

const units = ['years', 'months', 'weeks', 'days', 'hours', 'minutes'] as const;

/**
 * A duration in words from the catalogue, largest unit first, such as
 * "1 day 2 hours". The parts are joined the way the locale lists units.
 */
export function formatDuration(intl: IntlShape, duration: Duration): string {
  const parts = units
    .filter((unit) => (duration[unit] ?? 0) > 0)
    .map((unit) =>
      intl.formatMessage(
        { id: `duration.${unit}` },
        { [unit]: duration[unit] ?? 0 },
      ),
    );
  if (parts.length === 0) {
    return intl.formatMessage({ id: 'duration.minutes' }, { minutes: 0 });
  }
  return new Intl.ListFormat(intl.locale, {
    type: 'unit',
    style: 'narrow',
  }).format(parts);
}
