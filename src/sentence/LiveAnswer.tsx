import { useMinuteClock } from '../clock/useMinuteClock';
import { Answer } from './Answer';

/** The answer for the current time. Only this re-renders each minute. */
export function LiveAnswer({ zone, city }: { zone: string; city?: string }) {
  const now = useMinuteClock();
  return <Answer now={now} zone={zone} city={city} />;
}
