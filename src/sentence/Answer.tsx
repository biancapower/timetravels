import { formatTime, nowIn, zoneLabel } from '../time';
import styles from './Answer.module.css';

interface AnswerProps {
  now: Temporal.Instant;
  zone: string;
  /** The device's own locale when omitted. */
  locale?: string;
}

export function Answer({ now, zone, locale }: AnswerProps) {
  const moment = nowIn(zone, now);
  return (
    <p className={styles.answer}>
      <span className={styles.time}>{formatTime(moment, { locale })}</span>
      <span className={styles.zone}>{zoneLabel(moment, { locale })}</span>
    </p>
  );
}
