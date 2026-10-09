import { useMinuteClock } from '../clock/useMinuteClock';
import { Answer } from './Answer';
import type { Question } from './resolveAnswer';

interface LiveAnswerProps {
  question: Question;
  city?: string;
  anchorCity?: string;
}

/** The answer for the current time. Only this re-renders each minute. */
export function LiveAnswer({ question, city, anchorCity }: LiveAnswerProps) {
  const now = useMinuteClock();
  return (
    <Answer now={now} question={question} city={city} anchorCity={anchorCity} />
  );
}
