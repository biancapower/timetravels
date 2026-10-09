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
