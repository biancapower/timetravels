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

export interface LabelOptions extends FormatOptions {
  /** The city to name; taken from the zone id when omitted. */
  city?: string;
}

/**
 * A label for the moment's zone: the city from the zone name and the
 * offset in force at that moment, such as "Sydney (GMT+11)".
 */
export function zoneLabel(moment: Moment, options: LabelOptions = {}): string {
  const zone = moment.timeZoneId;
  const city =
    options.city ?? (zone.split('/').at(-1) ?? zone).replaceAll('_', ' ');
  const offset = new Intl.DateTimeFormat(options.locale, {
    timeZone: zone,
    timeZoneName: 'shortOffset',
  })
    .formatToParts(moment.epochMilliseconds)
    .find((part) => part.type === 'timeZoneName')?.value;
  return offset ? `${city} (${offset})` : city;
}

const number = String.raw`(\d+(?:\.\d+)?)`;
const hourUnit = '(?:h|hrs?|hours?)';
const minuteUnit = '(?:m|mins?|minutes?)';
const durationPatterns: readonly [
  RegExp,
  (match: RegExpExecArray) => number,
][] = [
  // "10", "1.5": a bare number is hours.
  [new RegExp(`^${number}$`), (m) => Number(m[1]) * 60],
  [new RegExp(`^${number}\\s*${hourUnit}$`), (m) => Number(m[1]) * 60],
  [new RegExp(`^${number}\\s*${minuteUnit}$`), (m) => Number(m[1])],
  // "1h30", "1h 30m", "1:30": whole hours, then minutes under 60.
  [
    new RegExp(String.raw`^(\d+)\s*${hourUnit}\s*([0-5]?\d)\s*${minuteUnit}?$`),
    (m) => Number(m[1]) * 60 + Number(m[2]),
  ],
  [/^(\d+):([0-5]\d)$/, (m) => Number(m[1]) * 60 + Number(m[2])],
];

/**
 * Reads a typed duration such as "10", "1.5h", "90m", "1h30" or "1:30".
 * Returns null for anything else, and for zero.
 */
export function parseDuration(text: string): Duration | null {
  const input = text.trim().toLowerCase();
  for (const [pattern, toMinutes] of durationPatterns) {
    const match = pattern.exec(input);
    if (!match) continue;
    const total = Math.round(toMinutes(match));
    if (total <= 0) return null;
    return { hours: Math.floor(total / 60), minutes: total % 60 };
  }
  return null;
}

/**
 * Calendar days from the reference to the moment, judged in the
 * moment's own zone: 1 is tomorrow there, -1 yesterday.
 */
export function daysBetween(reference: Moment, moment: Moment): number {
  const today = reference.withTimeZone(moment.timeZoneId).toPlainDate();
  return today.until(moment.toPlainDate(), { largestUnit: 'days' }).days;
}

/** Weekday, date and time, for answers more than a day away. */
export function formatDateTime(
  moment: Moment,
  options: FormatOptions = {},
): string {
  return moment.toLocaleString(options.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: 'numeric',
    minute: '2-digit',
  });
}
