import { useIntl } from 'react-intl';
import { cityOf } from '../places/places';
import {
  clockMoveAcross,
  dayRelation,
  formatClockTime,
  formatDateTime,
  formatOffset,
  formatTime,
  transitionsBetween,
  zoneLabel,
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
  const { today, moment, anchored, span } = resolveAnswer(now, question);
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
  return (
    <div className={styles.answer}>
      <p className={styles.time}>{answerTime(today, moment, locale, intl)}</p>
      <p className={styles.zone}>{zoneLabel(moment, { locale, city })}</p>
      {changes.map((change) => (
        <p
          key={`${change.zone}:${change.instant.toString()}`}
          className={styles.note}
        >
          {intl.formatMessage(
            { id: 'answer.transition' },
            {
              city: cityFor(change.zone),
              tense:
                Temporal.Instant.compare(change.instant, now) < 0
                  ? 'past'
                  : 'future',
              direction: change.direction,
              amount: change.minutes,
              time: formatClockTime(change.wallTime.toPlainTime(), { locale }),
              date: change.wallTime.toPlainDate().toLocaleString(locale, {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              }),
              clock: formatDuration(
                intl,
                clockMoveAcross(question.duration, change),
              ),
              span: formatDuration(intl, question.duration),
            },
          )}
        </p>
      ))}
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
