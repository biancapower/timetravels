import { formatTime, nowIn, zoneLabel } from '../time';
import styles from './Answer.module.css';

interface AnswerProps {
  now: Temporal.Instant;
  zone: string;
  /** The city to name in the label; taken from the zone id when omitted. */
  city?: string;
  /** The device's own locale when omitted. */
  locale?: string;
}

export function Answer({ now, zone, city, locale }: AnswerProps) {
  const moment = nowIn(zone, now);
  return (
    <p className={styles.answer}>
      <span className={styles.time}>{formatTime(moment, { locale })}</span>
      <span className={styles.zone}>{zoneLabel(moment, { locale, city })}</span>
    </p>
  );
}
