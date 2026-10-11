import { useIntl } from 'react-intl';
import type { Where } from '../places/named';
import { cityOf } from '../places/places';
import {
  dayRelation,
  elapsed,
  formatClockTime,
  formatDateTime,
  formatOffset,
  formatTime,
  isCalendar,
  transitionsBetween,
  zoneLabel,
  type Duration,
  type Moment,
} from '../time';
import { formatDuration } from './formatDuration';
import styles from './Answer.module.css';
import { resolveAnswer, type Question } from './resolveAnswer';

interface AnswerProps {
  now: Temporal.Instant;
  question: Question;
  /** The city to name in the label; taken from the zone id when omitted. */
  city?: string;
  /** Home or a named place, to name in the label before its city. */
  where?: Where | null;
  /** The city whose time the chosen time is, for the note on a skipped or repeated time. */
  anchorCity?: string;
  /** The interface's locale when omitted. */
  locale?: string;
}

export function Answer({
  now,
  question,
  city,
  where,
  anchorCity,
  locale: given,
}: AnswerProps) {
  const intl = useIntl();
  const locale = given ?? intl.locale;
  const { today, moment, anchored, span, landing } = resolveAnswer(
    now,
    question,
  );
  const calendar = isCalendar(question.duration);
  const cityFor = (zone: string) =>
    (zone === question.answerZone ? city : undefined) ??
    (anchored && zone === anchored.moment.timeZoneId
      ? anchorCity
      : undefined) ??
    cityOf(zone) ??
    zone;
  const changes = span
    ? transitionsBetween(span.start.toInstant(), moment.toInstant(), span.zones)
    : [];
  const chosen = formatClockTime(question.anchor.time, { locale });
  const longDate = (date: Temporal.PlainDate) =>
    date.toLocaleString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  const tenseOf = (instant: Temporal.Instant) =>
    Temporal.Instant.compare(instant, now) < 0 ? 'past' : 'future';
  // A calendar span's real length is worth saying when one change, in the
  // zone the days were counted in, makes a short span an hour longer or
  // shorter. Across months it's just a big number, a change elsewhere
  // doesn't alter it, and a skipped landing has its own note.
  const reach =
    calendar &&
    span &&
    changes.length === 1 &&
    changes[0]?.zone === span.start.timeZoneId &&
    landing?.issue === 'none' &&
    isShort(question.duration)
      ? question.when
      : 'none';
  // Across a longer calendar span, it's worth saying that the clock time is
  // kept, when it is: the days were counted on the answer's own clock, no
  // hours were added after them, and the landing wasn't moved.
  const kept =
    calendar &&
    span &&
    reach === 'none' &&
    landing?.issue === 'none' &&
    !question.duration.hours &&
    !question.duration.minutes &&
    span.start.timeZoneId === question.answerZone &&
    changes.every((change) => change.zone === question.answerZone);
  const countsBack = question.when === 'earlier' || question.when === 'before';
  const name =
    where?.kind === 'home'
      ? intl.formatMessage({ id: 'placePicker.home' })
      : where?.kind === 'named'
        ? where.name
        : undefined;
  const label = name
    ? intl.formatMessage(
        { id: 'answer.named' },
        { name, city, offset: formatOffset(moment, { locale }) },
      )
    : zoneLabel(moment, { locale, city });
  return (
    <div className={styles.answer}>
      <p className={styles.time}>
        {answerTime(today, moment, locale, intl, calendar)}
      </p>
      <p className={styles.zone}>{label}</p>
      {changes.map((change) => (
        <p
          key={`${change.zone}:${change.instant.toString()}`}
          className={styles.note}
        >
          {calendar
            ? intl.formatMessage(
                { id: 'answer.transitionCalendar' },
                {
                  city: cityFor(change.zone),
                  tense: tenseOf(change.instant),
                  direction: change.direction,
                  amount: change.minutes,
                  time: formatClockTime(change.wallTime.toPlainTime(), {
                    locale,
                  }),
                  date: longDate(change.wallTime.toPlainDate()),
                  reach,
                  span: formatDuration(intl, question.duration),
                  anchor: chosen,
                  actual: span
                    ? formatDuration(intl, elapsed(span.start, moment))
                    : '',
                },
              )
            : intl.formatMessage(
                { id: 'answer.transition' },
                {
                  city: cityFor(change.zone),
                  tense: tenseOf(change.instant),
                  direction: change.direction,
                  amount: change.minutes,
                  time: formatClockTime(change.wallTime.toPlainTime(), {
                    locale,
                  }),
                  date: longDate(change.wallTime.toPlainDate()),
                  whose:
                    change.zone === question.answerZone ? 'answer' : 'other',
                  // Forward makes the clock read later counting on, and
                  // earlier counting back; back does the opposite.
                  shift:
                    (change.direction === 'forward') === !countsBack
                      ? 'later'
                      : 'earlier',
                  count: countsBack ? 'back' : 'on',
                },
              )}
        </p>
      ))}
      {kept && changes.length > 0 && (
        <p className={styles.note}>
          {intl.formatMessage({ id: 'answer.calendarKept' })}
        </p>
      )}
      {landing && landing.issue !== 'none' && (
        <p className={styles.note}>
          {intl.formatMessage(
            {
              id:
                landing.issue === 'skipped'
                  ? 'answer.landingSkipped'
                  : 'answer.landingRepeated',
            },
            {
              tense: tenseOf(landing.moment.toInstant()),
              time: formatClockTime(landing.wall.toPlainTime(), { locale }),
              city: cityFor(landing.moment.timeZoneId),
              date: longDate(landing.wall.toPlainDate()),
              actual: formatClockTime(landing.moment.toPlainTime(), {
                locale,
              }),
              offset: formatOffset(landing.moment, { locale }),
            },
          )}
        </p>
      )}
      {anchored?.issue === 'skipped' && (
        <p className={styles.note}>
          {intl.formatMessage(
            { id: 'answer.skipped' },
            {
              time: chosen,
              city: anchorCity,
              actual: formatClockTime(anchored.moment.toPlainTime(), {
                locale,
              }),
            },
          )}
        </p>
      )}
      {anchored?.issue === 'repeated' && (
        <p className={styles.note}>
          {intl.formatMessage(
            { id: 'answer.repeated' },
            {
              time: chosen,
              city: anchorCity,
              offset: formatOffset(anchored.moment, { locale }),
            },
          )}
        </p>
      )}
    </div>
  );
}

/**
 * The answer's time: with "tomorrow" or "yesterday" when it is, and the
 * date when it's further away or the span was counted in calendar units.
 */
function answerTime(
  today: Moment,
  moment: Moment,
  locale: string,
  intl: ReturnType<typeof useIntl>,
  withDate: boolean,
): string {
  const relation = dayRelation(today, moment);
  const time = withDate
    ? formatDateTime(moment, { locale, reference: today })
    : formatTime(moment, { locale });
  if (relation === 'today') return time;
  if (relation === 'further')
    return formatDateTime(moment, { locale, reference: today });
  return intl.formatMessage(
    { id: 'answer.relativeDay' },
    {
      relativeDay: new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
      }).format(relation === 'tomorrow' ? 1 : -1, 'day'),
      time,
    },
  );
}

/** A calendar span of a week or less, with no months or years. */
function isShort({ years, months, weeks, days }: Duration): boolean {
  return !years && !months && (weeks ?? 0) * 7 + (days ?? 0) <= 7;
}
