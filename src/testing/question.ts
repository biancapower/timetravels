import type { Question } from '../sentence/resolveAnswer';
import type { Duration } from '../time';
import type { When } from '../sentence/DirectionPicker';

/** A question for one zone, with "now" and a 3 pm "my time" anchor unless overridden. */
export function question(
  zone: string,
  overrides: { when?: When; duration?: Duration } & Partial<Question> = {},
): Question {
  return {
    when: 'now',
    duration: { hours: 1, minutes: 0 },
    anchor: { time: Temporal.PlainTime.from('15:00'), day: 0, inPlace: false },
    answerZone: zone,
    deviceZone: zone,
    ...overrides,
  };
}
