import { useIntl } from 'react-intl';
import {
  dayRelation,
  formatClockTime,
  formatDateTime,
  formatOffset,
  formatTime,
  zoneLabel,
  type Moment,
} from '../time';
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
  const { today, moment, anchored } = resolveAnswer(now, question);
  const chosen = formatClockTime(question.anchor.time, { locale });
  return (
    <div className={styles.answer}>
      <p className={styles.time}>{answerTime(today, moment, locale, intl)}</p>
      <p className={styles.zone}>{zoneLabel(moment, { locale, city })}</p>
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
