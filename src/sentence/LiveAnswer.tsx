import { useEffect, useRef, useState } from 'react';
import { useMinuteClock } from '../clock/useMinuteClock';
import { Answer } from './Answer';
import type { Question } from './resolveAnswer';
import styles from './LiveAnswer.module.css';

interface LiveAnswerProps {
  question: Question;
  city?: string;
  anchorCity?: string;
}

/**
 * The answer for the current time. Only this re-renders each minute. A screen
 * reader hears the new answer when a choice changes it, but not on every
 * minute tick, which would interrupt every sixty seconds.
 */
export function LiveAnswer({ question, city, anchorCity }: LiveAnswerProps) {
  const now = useMinuteClock();
  const answer = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');

  const choices = JSON.stringify({ question, city, anchorCity });
  const announcedChoices = useRef(choices);
  useEffect(() => {
    if (announcedChoices.current === choices) return;
    announcedChoices.current = choices;
    const lines = answer.current?.querySelectorAll('p') ?? [];
    setAnnouncement(Array.from(lines, (line) => line.textContent).join('. '));
  }, [choices]);

  return (
    <>
      <div ref={answer}>
        <Answer
          now={now}
          question={question}
          city={city}
          anchorCity={anchorCity}
        />
      </div>
      <p
        className={styles.visuallyHidden}
        aria-live="polite"
        aria-atomic="true"
        data-testid="answer-announcement"
      >
        {announcement}
      </p>
    </>
  );
}
