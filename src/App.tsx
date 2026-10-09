import { useState } from 'react';
import { IntlProvider } from 'react-intl';
import styles from './App.module.css';
import { catalogues, pickLocale, type Locale } from './i18n/messages';
import { aliases } from './places/aliases';
import { buildPlaces, cityOf, type Place } from './places/places';
import { loadPlace, savePlace } from './places/storage';
import type { When } from './sentence/DirectionPicker';
import { LiveAnswer } from './sentence/LiveAnswer';
import {
  resolveAnswer,
  type AnchorSetting,
  type Question,
} from './sentence/resolveAnswer';
import { Sentence } from './sentence/Sentence';
import { isPast, nextWholeHour, type Duration } from './time';

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
  const [anchor, setAnchor] = useState<AnchorSetting>(() => ({
    ...nextWholeHour(Temporal.Now.instant(), zone),
    inPlace: false,
  }));

  const choosePlace = (chosen: Place | null) => {
    setPlace(chosen);
    savePlace(chosen);
  };

  const question: Question = {
    when,
    duration,
    // With no place picked there is only one place, so "my time" is the only reading.
    anchor: place ? anchor : { ...anchor, inPlace: false },
    answerZone: place?.zone ?? zone,
    deviceZone: zone,
  };
  // The verb of sentence 5 follows whether its answer is past; it is set
  // when the sentence changes, not on every minute.
  const tense = isPast(
    resolveAnswer(Temporal.Now.instant(), question).moment,
    Temporal.Now.instant(),
  )
    ? 'past'
    : 'future';

  return (
    <IntlProvider locale={locale} messages={catalogues[locale]}>
      <main className={styles.page}>
        <Sentence
          when={when}
          duration={duration}
          place={place}
          places={places}
          anchor={question.anchor}
          tense={tense}
          onWhenChange={setWhen}
          onDurationChange={setDuration}
          onPlaceChange={choosePlace}
          onAnchorChange={setAnchor}
        />
        <LiveAnswer
          question={question}
          city={place?.city ?? cityOf(zone)}
          anchorCity={question.anchor.inPlace ? place?.city : cityOf(zone)}
        />
      </main>
    </IntlProvider>
  );
}
