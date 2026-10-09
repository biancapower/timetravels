import { useEffect, useState } from 'react';

const minute = 60_000;

/** The current instant, refreshed on each minute boundary. */
export function useMinuteClock(): Temporal.Instant {
  const [now, setNow] = useState(() => Temporal.Now.instant());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const scheduleNextMinute = () => {
      const untilNextMinute =
        minute - (Temporal.Now.instant().epochMilliseconds % minute);
      timer = setTimeout(() => {
        setNow(Temporal.Now.instant());
        scheduleNextMinute();
      }, untilNextMinute);
    };
    scheduleNextMinute();
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return now;
}
