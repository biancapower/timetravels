import { useEffect, useState } from 'react';

const minute = 60_000;

/**
 * The current instant, refreshed on each minute boundary and whenever
 * the page becomes visible again, since a sleeping device fires no timers.
 */
export function useMinuteClock(): Temporal.Instant {
  const [now, setNow] = useState(() => Temporal.Now.instant());

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    const refresh = () => {
      clearTimeout(timer);
      setNow(Temporal.Now.instant());
      scheduleNextMinute();
    };
    const scheduleNextMinute = () => {
      const untilNextMinute =
        minute - (Temporal.Now.instant().epochMilliseconds % minute);
      timer = setTimeout(refresh, untilNextMinute);
    };
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };

    scheduleNextMinute();
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, []);

  return now;
}
