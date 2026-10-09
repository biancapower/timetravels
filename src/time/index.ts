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

// Long enough for any sensible question; far longer spans are typing errors.
const longestMinutes = 1000 * 60;
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
 * Returns null for anything else, for zero, and for 1000 hours or more.
 */
export function parseDuration(text: string): Duration | null {
  const input = text.trim().toLowerCase();
  for (const [pattern, toMinutes] of durationPatterns) {
    const match = pattern.exec(input);
    if (!match) continue;
    const total = Math.round(toMinutes(match));
    if (total <= 0 || total >= longestMinutes) return null;
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

export type DayRelation = 'today' | 'tomorrow' | 'yesterday' | 'further';

/** How the answer's day relates to today, judged in the answer's own zone. */
export function dayRelation(reference: Moment, moment: Moment): DayRelation {
  const days = daysBetween(reference, moment);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  if (days === -1) return 'yesterday';
  return 'further';
}

export interface DateTimeOptions extends FormatOptions {
  /** Today; the year is shown when the moment falls in another year. */
  reference?: Moment;
}

/** Weekday, date and time, for answers more than a day away. */
export function formatDateTime(
  moment: Moment,
  options: DateTimeOptions = {},
): string {
  const otherYear =
    options.reference !== undefined &&
    options.reference.withTimeZone(moment.timeZoneId).year !== moment.year;
  return moment.toLocaleString(options.locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: otherYear ? 'numeric' : undefined,
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** -1 for yesterday, 0 for today, 1 for tomorrow. */
export type AnchorDay = -1 | 0 | 1;

/**
 * "none", or "skipped" for a time the clocks jumped over, or "repeated"
 * for a time that happened twice when the clocks went back.
 */
export type AnchorIssue = 'none' | 'skipped' | 'repeated';

export interface Anchored {
  moment: Moment;
  issue: AnchorIssue;
}

/**
 * The moment a wall-clock time names on today, tomorrow or yesterday in
 * a zone, "today" being today there. A skipped time counts from the same
 * distance after the jump; a repeated time uses its first occurrence.
 */
export function anchorAt(
  now: Temporal.Instant,
  zone: string,
  time: Temporal.PlainTime,
  day: AnchorDay,
): Anchored {
  const wall = nowIn(zone, now)
    .toPlainDate()
    .add({ days: day })
    .toPlainDateTime(time);
  const first = wall.toZonedDateTime(zone, { disambiguation: 'earlier' });
  const last = wall.toZonedDateTime(zone, { disambiguation: 'later' });
  if (!first.toPlainDateTime().equals(wall)) {
    return {
      moment: wall.toZonedDateTime(zone, { disambiguation: 'compatible' }),
      issue: 'skipped',
    };
  }
  if (!first.equals(last)) return { moment: first, issue: 'repeated' };
  return { moment: first, issue: 'none' };
}

/** The current time in a zone rounded up to the next whole hour. */
export function nextWholeHour(
  now: Temporal.Instant,
  zone: string,
): Temporal.PlainTime {
  return nowIn(zone, now)
    .round({ smallestUnit: 'hour', roundingMode: 'ceil' })
    .toPlainTime();
}

/** Whether a moment is before now. */
export function isPast(moment: Moment, now: Temporal.Instant): boolean {
  return Temporal.Instant.compare(moment.toInstant(), now) < 0;
}

/** A time of day such as "3 pm" or "3:30 pm", or "15:00" where the locale uses a 24-hour clock. */
export function formatClockTime(
  time: Temporal.PlainTime,
  options: FormatOptions = {},
): string {
  const { hourCycle } = new Intl.DateTimeFormat(options.locale, {
    hour: 'numeric',
  }).resolvedOptions();
  const twelveHour = hourCycle === 'h11' || hourCycle === 'h12';
  return time.toLocaleString(options.locale, {
    hour: 'numeric',
    minute: twelveHour && time.minute === 0 ? undefined : '2-digit',
  });
}
