import { useMinuteClock } from '../clock/useMinuteClock';
import type { Duration } from '../time';
import { Answer } from './Answer';
import type { When } from './DirectionPicker';

interface LiveAnswerProps {
  zone: string;
  city?: string;
  when: When;
  duration: Duration;
}

/** The answer for the current time. Only this re-renders each minute. */
export function LiveAnswer({ zone, city, when, duration }: LiveAnswerProps) {
  const now = useMinuteClock();
  return (
    <Answer now={now} zone={zone} city={city} when={when} duration={duration} />
  );
}
