import {
  anchorAt,
  nowIn,
  shift,
  type AnchorDay,
  type Anchored,
  type Duration,
  type Moment,
} from '../time';
import type { When } from './DirectionPicker';

/** The chosen time in sentence 5: a time of day, which day, and whose time. */
export interface AnchorSetting {
  time: Temporal.PlainTime;
  day: AnchorDay;
  /** The picked place's time rather than the device's. */
  inPlace: boolean;
}

export interface Question {
  when: When;
  duration: Duration;
  anchor: AnchorSetting;
  /** Where the answer is asked about: the picked place, or the device. */
  answerZone: string;
  deviceZone: string;
}

export interface Resolved {
  /** Now, where the answer is asked about. */
  today: Moment;
  moment: Moment;
  /** The chosen time, for sentence 5 only. */
  anchored?: Anchored;
}

/** Puts the sentence's slots together using src/time; no arithmetic of its own. */
export function resolveAnswer(
  now: Temporal.Instant,
  question: Question,
): Resolved {
  const { when, duration, anchor, answerZone, deviceZone } = question;
  const today = nowIn(answerZone, now);
  if (when === 'now') return { today, moment: today };
  if (when === 'later' || when === 'earlier') {
    return { today, moment: shift(today, duration, when) };
  }
  const anchored = anchorAt(
    now,
    anchor.inPlace ? answerZone : deviceZone,
    anchor.time,
    anchor.day,
  );
  const moment = shift(
    anchored.moment,
    duration,
    when === 'after' ? 'later' : 'earlier',
  );
  return { today, moment: moment.withTimeZone(answerZone), anchored };
}
