import {
  anchorAt,
  calendarLanding,
  nowIn,
  shift,
  type AnchorDay,
  type Anchored,
  type Duration,
  type Landing,
  type Moment,
} from '../time';
import type { Place } from '../places/places';
import type { When } from './DirectionPicker';

/** The chosen time for "at", "after" or "before" a time: a time of day, which day, and whose time. */
export interface AnchorSetting {
  time: Temporal.PlainTime;
  day: AnchorDay;
  /** Whose time it is: the device's, the picked place's, or a third place's. */
  whose: 'mine' | 'theirs' | Place;
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
  /** The chosen time, for "at", "after" and "before" a time. */
  anchored?: Anchored;
  /** Where the span starts and the places it involves, when there is a span. */
  span?: { start: Moment; zones: string[] };
  /** Where a duration's calendar part lands, when it has one. */
  landing?: Landing;
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
    return {
      today,
      moment: shift(today, duration, when),
      span: { start: today, zones: [answerZone] },
      landing: calendarLanding(today, duration, when) ?? undefined,
    };
  }
  const anchorZone =
    anchor.whose === 'mine'
      ? deviceZone
      : anchor.whose === 'theirs'
        ? answerZone
        : anchor.whose.zone;
  const anchored = anchorAt(now, anchorZone, anchor.time, anchor.day);
  if (when === 'at')
    return {
      today,
      moment: anchored.moment.withTimeZone(answerZone),
      anchored,
    };
  const direction = when === 'after' ? 'later' : 'earlier';
  const moment = shift(anchored.moment, duration, direction);
  return {
    today,
    moment: moment.withTimeZone(answerZone),
    anchored,
    span: { start: anchored.moment, zones: [answerZone, anchorZone] },
    landing: calendarLanding(anchored.moment, duration, direction) ?? undefined,
  };
}
