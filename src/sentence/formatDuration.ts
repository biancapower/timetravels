import type { IntlShape } from 'react-intl';
import type { Duration } from '../time';

/** A duration in words from the catalogue, such as "1 hour 30 minutes". */
export function formatDuration(
  intl: IntlShape,
  { hours, minutes }: Duration,
): string {
  if (hours && minutes) {
    return intl.formatMessage(
      { id: 'duration.hoursMinutes' },
      { hours, minutes },
    );
  }
  if (hours) return intl.formatMessage({ id: 'duration.hours' }, { hours });
  return intl.formatMessage({ id: 'duration.minutes' }, { minutes });
}
