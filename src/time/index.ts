// The time logic: plain TypeScript, no React. Everything public is exported here.

/** A moment in a particular time zone. */
export type Moment = Temporal.ZonedDateTime;

/**
 * A span, each part a non-negative whole number; direction comes from
 * Direction. Hours and minutes are exact elapsed time. Years, months, weeks
 * and days are calendar units: they move the date and keep the clock time.
 */
export interface Duration {
  years?: number;
  months?: number;
  weeks?: number;
  days?: number;
  hours: number;
  minutes: number;
}

const calendarUnits = ['years', 'months', 'weeks', 'days'] as const;

/** Whether a duration has any calendar part: days, weeks, months or years. */
export function isCalendar(duration: Duration): boolean {
  return calendarUnits.some((unit) => (duration[unit] ?? 0) > 0);
}

export type Direction = 'later' | 'earlier';

/**
 * Moves a moment by a duration. Hours and minutes are exact elapsed time,
 * so a span across a daylight-saving change is the real span. A calendar
 * part moves the date first and keeps the clock time, falling back to the
 * month's last day when the day doesn't exist (Temporal's default).
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
  const offset = formatOffset(moment, options);
  return offset ? `${city} (${offset})` : city;
}

/** The offset in force at a moment, such as "GMT+11". Empty if Intl gives none. */
export function formatOffset(
  moment: Moment,
  options: FormatOptions = {},
): string {
  return (
    new Intl.DateTimeFormat(options.locale, {
      timeZone: moment.timeZoneId,
      timeZoneName: 'shortOffset',
    })
      .formatToParts(moment.epochMilliseconds)
      .find((part) => part.type === 'timeZoneName')?.value ?? ''
  );
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

// Calendar units are whole numbers, kept to about a century each.
const unitNames: Record<string, keyof Duration> = {};
for (const [unit, names] of [
  ['years', ['y', 'yr', 'yrs', 'year', 'years']],
  ['months', ['mo', 'mos', 'month', 'months']],
  ['weeks', ['w', 'wk', 'wks', 'week', 'weeks']],
  ['days', ['d', 'day', 'days']],
  ['hours', ['h', 'hr', 'hrs', 'hour', 'hours']],
  ['minutes', ['m', 'min', 'mins', 'minute', 'minutes']],
] as const) {
  for (const name of names) unitNames[name] = unit;
}
const calendarLimits = { years: 100, months: 1200, weeks: 5200, days: 36500 };
const part = String.raw`(\d+(?:\.\d+)?)\s*([a-z]+)`;
const separator = String.raw`(?:\s*,\s*|\s+and\s+|\s*)`;
const listPattern = new RegExp(`^${part}(?:${separator}${part})*$`);

/**
 * Reads a typed duration such as "10", "1.5h", "90m", "1h30", "1:30",
 * "3d", "6 months" or "1 day 2 hours". Returns null for anything else,
 * for zero, for 1000 hours or more of exact time, and for a calendar unit
 * at or over its limit.
 */
export function parseDuration(text: string): Duration | null {
  const input = text.trim().toLowerCase();
  for (const [pattern, toMinutes] of durationPatterns) {
    const match = pattern.exec(input);
    if (!match) continue;
    return exact(Math.round(toMinutes(match)));
  }
  return listPattern.test(input) ? parseParts(input) : null;
}

function exact(totalMinutes: number): Duration | null {
  if (totalMinutes <= 0 || totalMinutes >= longestMinutes) return null;
  return { hours: Math.floor(totalMinutes / 60), minutes: totalMinutes % 60 };
}

/** "1 year, 6 months", "1d2h": each unit at most once, in any order. */
function parseParts(input: string): Duration | null {
  const seen = new Set<keyof Duration>();
  const calendar: Partial<Record<(typeof calendarUnits)[number], number>> = {};
  let minutes = 0;
  for (const [, amount = '', name = ''] of input.matchAll(
    new RegExp(part, 'g'),
  )) {
    const unit = unitNames[name];
    if (!unit || seen.has(unit)) return null;
    seen.add(unit);
    const value = Number(amount);
    if (unit === 'hours') minutes += value * 60;
    else if (unit === 'minutes') minutes += value;
    else if (!Number.isInteger(value) || value >= calendarLimits[unit]) {
      return null;
    } else if (value > 0) {
      calendar[unit] = value;
    }
  }
  const total = Math.round(minutes);
  if (total >= longestMinutes) return null;
  if (Object.keys(calendar).length === 0) return exact(total);
  return { ...calendar, hours: Math.floor(total / 60), minutes: total % 60 };
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
  const issue = issueAt(wall, zone);
  return {
    moment: wall.toZonedDateTime(zone, {
      disambiguation: issue === 'repeated' ? 'earlier' : 'compatible',
    }),
    issue,
  };
}

/** Whether a wall-clock time was skipped, or happened twice, in a zone. */
function issueAt(wall: Temporal.PlainDateTime, zone: string): AnchorIssue {
  const first = wall.toZonedDateTime(zone, { disambiguation: 'earlier' });
  const last = wall.toZonedDateTime(zone, { disambiguation: 'later' });
  if (!first.toPlainDateTime().equals(wall)) return 'skipped';
  return first.equals(last) ? 'none' : 'repeated';
}

export interface Landing {
  /** The clock time the calendar part names, before any exact part. */
  wall: Temporal.PlainDateTime;
  /** Where that lands: moved on past a skipped time, the first of a repeated one. */
  moment: Moment;
  issue: AnchorIssue;
}

/**
 * Where a duration's calendar part lands, and whether that clock time was
 * skipped or repeated. Temporal then moves a skipped time on by the jump
 * and takes the first of a repeated one, as anchorAt does. Null for a
 * duration with no calendar part.
 */
export function calendarLanding(
  moment: Moment,
  duration: Duration,
  direction: Direction,
): Landing | null {
  if (!isCalendar(duration)) return null;
  const sign = direction === 'later' ? 1 : -1;
  const wall = moment.toPlainDateTime().add({
    years: sign * (duration.years ?? 0),
    months: sign * (duration.months ?? 0),
    weeks: sign * (duration.weeks ?? 0),
    days: sign * (duration.days ?? 0),
  });
  const zone = moment.timeZoneId;
  const issue = issueAt(wall, zone);
  return {
    wall,
    moment: wall.toZonedDateTime(zone, {
      disambiguation: issue === 'repeated' ? 'earlier' : 'compatible',
    }),
    issue,
  };
}

/** The exact time between two moments, in either order, in hours and minutes. */
export function elapsed(a: Moment, b: Moment): Duration {
  const minutes = Math.round(
    Math.abs(b.epochMilliseconds - a.epochMilliseconds) / 60000,
  );
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}

/**
 * The current time in a zone rounded up to the next whole hour, with the
 * day it falls on: late in the evening that is midnight tomorrow.
 */
export function nextWholeHour(
  now: Temporal.Instant,
  zone: string,
): { time: Temporal.PlainTime; day: AnchorDay } {
  const current = nowIn(zone, now);
  const rounded = current.round({ smallestUnit: 'hour', roundingMode: 'ceil' });
  const day = daysBetween(current, rounded) === 0 ? 0 : 1;
  return { time: rounded.toPlainTime(), day };
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

/** A clock change in a zone. */
export interface Transition {
  zone: string;
  instant: Temporal.Instant;
  direction: 'forward' | 'back';
  /** How many minutes the clocks move: usually 60, 30 on Lord Howe Island. */
  minutes: number;
  /** What the clocks read just before they changed, such as 2 am. */
  wallTime: Temporal.PlainDateTime;
}

/**
 * Every clock change inside a span, in each zone given, from the time-zone
 * database. The span can be given in either order.
 */
export function transitionsBetween(
  start: Temporal.Instant,
  end: Temporal.Instant,
  zones: readonly string[],
): Transition[] {
  const [from, to] =
    Temporal.Instant.compare(start, end) <= 0 ? [start, end] : [end, start];
  const found: Transition[] = [];
  for (const zone of new Set(zones)) {
    let cursor = from.toZonedDateTimeISO(zone);
    for (;;) {
      const next = cursor.getTimeZoneTransition('next');
      if (!next || Temporal.Instant.compare(next.toInstant(), to) > 0) break;
      const before = next.subtract({ nanoseconds: 1 }).offsetNanoseconds;
      const nanoseconds = next.offsetNanoseconds - before;
      found.push({
        zone,
        instant: next.toInstant(),
        direction: nanoseconds > 0 ? 'forward' : 'back',
        minutes: Math.abs(nanoseconds) / 60e9,
        wallTime: next.toPlainDateTime().subtract({ nanoseconds }),
      });
      cursor = next;
    }
  }
  return found;
}

/**
 * How far the wall clock moves across a span because of one clock change:
 * 10 hours across a change forward an hour is 11 hours on the clock.
 */
export function clockMoveAcross(
  span: Duration,
  change: Pick<Transition, 'direction' | 'minutes'>,
): Duration {
  const sign = change.direction === 'forward' ? 1 : -1;
  const minutes = span.hours * 60 + span.minutes + sign * change.minutes;
  return { hours: Math.floor(minutes / 60), minutes: minutes % 60 };
}
