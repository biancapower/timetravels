// The time logic: plain TypeScript, no React. Everything public is exported here.

/** A moment in a particular time zone. */
export type Moment = Temporal.ZonedDateTime;

/** A span of hours and minutes, each a non-negative whole number; direction comes from Direction. */
export interface Duration {
  hours: number;
  minutes: number;
}

export type Direction = 'later' | 'earlier';

/**
 * Moves a moment by a duration in exact elapsed time, not wall-clock
 * time, so a span across a daylight-saving change is the real span.
 */
export function shift(
  moment: Moment,
  duration: Duration,
  direction: Direction,
): Moment {
  return direction === 'later'
    ? moment.add(duration)
    : moment.subtract(duration);
}

/** Thrown when a time zone name is not in the runtime's zone data. */
export class UnknownZoneError extends Error {
  readonly zone: string;

  constructor(zone: string, options?: ErrorOptions) {
    super(`Unknown time zone: ${zone}`, options);
    this.name = 'UnknownZoneError';
    this.zone = zone;
  }
}

/**
 * The wall-clock time in a zone at the given instant. The caller passes
 * the current instant, so nothing here reads the system clock.
 */
export function nowIn(zone: string, now: Temporal.Instant): Moment {
  try {
    return now.toZonedDateTimeISO(zone);
  } catch (error) {
    if (error instanceof RangeError)
      throw new UnknownZoneError(zone, { cause: error });
    throw error;
  }
}

export interface FormatOptions {
  /** A BCP 47 locale; the device's own when omitted, so its 12- or 24-hour preference applies. */
  locale?: string;
}

/** The answer line: weekday and time, in the moment's own zone. */
export function formatTime(
  moment: Moment,
  options: FormatOptions = {},
): string {
  return moment.toLocaleString(options.locale, {
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * A label for the moment's zone: the city from the zone name and the
 * offset in force at that moment, such as "Sydney (GMT+11)".
 */
export function zoneLabel(moment: Moment, options: FormatOptions = {}): string {
  const zone = moment.timeZoneId;
  const city = (zone.split('/').at(-1) ?? zone).replaceAll('_', ' ');
  const offset = new Intl.DateTimeFormat(options.locale, {
    timeZone: zone,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(moment.epochMilliseconds)
    .find((part) => part.type === 'timeZoneName')?.value;
  return offset ? `${city} (${offset})` : city;
}
