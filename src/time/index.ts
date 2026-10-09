// The time logic: plain TypeScript, no React. Everything public is exported here.

/** A moment in a particular time zone. */
export type Moment = Temporal.ZonedDateTime;

/** A span of whole hours and minutes. */
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
