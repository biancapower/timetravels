import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import styles from './App.module.css';
import { catalogues, pickLocale, type Locale } from './i18n/messages';
import { aliases } from './places/aliases';
import { buildPlaces, cityOf, type Place } from './places/places';
import { loadPlace, savePlace } from './places/storage';
import { LiveAnswer } from './sentence/LiveAnswer';
import { Sentence } from './sentence/Sentence';

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

  const choosePlace = (chosen: Place | null) => {
    setPlace(chosen);
    savePlace(chosen);
  };

  return (
    <IntlProvider locale={locale} messages={catalogues[locale]}>
      <main className={styles.page}>
        <Sentence place={place} places={places} onPlaceChange={choosePlace} />
        <LiveAnswer
          zone={place?.zone ?? zone}
          city={place?.city ?? cityOf(zone)}
        />
      </main>
    </IntlProvider>
  );
}
