import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import styles from './App.module.css';
import { catalogues, pickLocale, type Locale } from './i18n/messages';
import { aliases } from './places/aliases';
import { buildPlaces, cityOf, type Place } from './places/places';
import { loadPlace, savePlace } from './places/storage';
import type { When } from './sentence/DirectionPicker';
import { LiveAnswer } from './sentence/LiveAnswer';
import { Sentence } from './sentence/Sentence';
import type { Duration } from './time';

interface AppProps {
  /** The device's own zone when omitted. */
  zone?: string;
  /** The device's preferred language with messages when omitted. */
  locale?: Locale;
}

export function App({
  zone = Temporal.Now.timeZoneId(),
  locale = pickLocale(navigator.languages),
}: AppProps) {
  const [places] = useState(() =>
    buildPlaces(Intl.supportedValuesOf('timeZone'), aliases),
  );
  const [place, setPlace] = useState(() => loadPlace(places));
  const [when, setWhen] = useState<When>('now');
  const [duration, setDuration] = useState<Duration>({ hours: 1, minutes: 0 });

  const choosePlace = (chosen: Place | null) => {
    setPlace(chosen);
    savePlace(chosen);
  };

  return (
    <IntlProvider locale={locale} messages={catalogues[locale]}>
      <main className={styles.page}>
        <Sentence
          when={when}
          duration={duration}
          place={place}
          places={places}
          onWhenChange={setWhen}
          onDurationChange={setDuration}
          onPlaceChange={choosePlace}
        />
        <LiveAnswer
          zone={place?.zone ?? zone}
          city={place?.city ?? cityOf(zone)}
          when={when}
          duration={duration}
        />
      </main>
    </IntlProvider>
  );
}
