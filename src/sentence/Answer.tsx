import { useIntl } from 'react-intl';
import { cityOf } from '../places/places';
import {
  clockMoveAcross,
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
  /** The city whose time the chosen time is, for the note on a skipped or repeated time. */
  anchorCity?: string;
  /** The device's own locale when omitted. */
  locale?: string;
}

export function Answer({
  now,
  question,
  city,
  anchorCity,
  locale,
}: AnswerProps) {
  const intl = useIntl();
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
  // A calendar span's real length is worth saying when one change makes a
  // short span an hour longer or shorter; across months it's just a number.
  const reach =
    calendar && changes.length === 1 && isShort(question.duration)
      ? question.when
      : 'none';
  return (
    <div className={styles.answer}>
      <p className={styles.time}>
        {calendar
          ? formatDateTime(moment, { locale, reference: today })
          : answerTime(today, moment, locale, intl)}
      </p>
      <p className={styles.zone}>{zoneLabel(moment, { locale, city })}</p>
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
                  clock: formatDuration(
                    intl,
                    clockMoveAcross(question.duration, change),
                  ),
                  span: formatDuration(intl, question.duration),
                },
              )}
        </p>
      ))}
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

function answerTime(
  today: Moment,
  moment: Moment,
  locale: string | undefined,
  intl: ReturnType<typeof useIntl>,
): string {
  const relation = dayRelation(today, moment);
  if (relation === 'today') return formatTime(moment, { locale });
  if (relation === 'further')
    return formatDateTime(moment, { locale, reference: today });
  return intl.formatMessage(
    { id: 'answer.relativeDay' },
    {
      relativeDay: new Intl.RelativeTimeFormat(locale, {
        numeric: 'auto',
      }).format(relation === 'tomorrow' ? 1 : -1, 'day'),
      time: formatTime(moment, { locale }),
    },
  );
}

/** A calendar span of a week or less, with no months or years. */
function isShort({ years, months, weeks, days }: Duration): boolean {
  return !years && !months && (weeks ?? 0) * 7 + (days ?? 0) <= 7;
}
