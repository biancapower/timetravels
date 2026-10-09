import { useIntl } from 'react-intl';
import {
  dayRelation,
  formatDateTime,
  formatTime,
  nowIn,
  shift,
  zoneLabel,
  type Duration,
  type Moment,
} from '../time';
import styles from './Answer.module.css';
import type { When } from './DirectionPicker';

interface AnswerProps {
  now: Temporal.Instant;
  zone: string;
  /** "now" when omitted. */
  when?: When;
  duration?: Duration;
  /** The city to name in the label; taken from the zone id when omitted. */
  city?: string;
  /** The device's own locale when omitted. */
  locale?: string;
}

export function Answer({
  now,
  zone,
  when = 'now',
  duration = { hours: 0, minutes: 0 },
  city,
  locale,
}: AnswerProps) {
  const intl = useIntl();
  const today = nowIn(zone, now);
  const moment = when === 'now' ? today : shift(today, duration, when);
  return (
    <p className={styles.answer}>
      <span className={styles.time}>
        {answerTime(today, moment, locale, intl)}
      </span>
      <span className={styles.zone}>{zoneLabel(moment, { locale, city })}</span>
    </p>
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
  if (relation === 'further') return formatDateTime(moment, { locale });
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
