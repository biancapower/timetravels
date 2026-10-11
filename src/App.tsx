import { useEffect, useRef, useState } from 'react';
import { IntlProvider } from 'react-intl';
import styles from './App.module.css';
import { formatLocale } from './i18n/formatLocale';
import { catalogues, pickLocale, type Locale } from './i18n/messages';
import { About } from './pages/About';
import { Help } from './pages/Help';
import { HelpButton } from './pages/HelpButton';
import { useRoute } from './pages/useRoute';
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
import { UpdateNotice } from './UpdateNotice';

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

  const { route, open, close } = useRoute();
  // The control on the sentence screen that opened Help, to return focus to
  // on closing. Moving from Help to About doesn't change it.
  const opener = useRef<HTMLElement | null>(null);
  const openPage = (hash: string, from: HTMLElement) => {
    opener.current = from;
    open(hash);
  };
  useEffect(() => {
    if (route.view !== 'sentence') return;
    opener.current?.focus();
    opener.current = null;
  }, [route.view]);

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
  // Sentence 5's verb follows whether its answer is past. It is worked out
  // whenever the app renders, which is on any choice, not on the minute tick.
  const tense = tenseOf(question);

  return (
    <IntlProvider
      locale={formatLocale(navigator.languages, locale)}
      messages={catalogues[locale]}
    >
      {/* Hidden, not removed, under Help and About, so it comes back as it was. */}
      <div className={styles.screen} hidden={route.view !== 'sentence'}>
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
        {/* After the sentence in reading order, though it sits in the top corner. */}
        <HelpButton onOpen={openPage} />
      </div>
      {route.view === 'help' && <Help onOpen={open} onClose={close} />}
      {route.view === 'about' && (
        <About section={route.section} onClose={close} />
      )}
      <UpdateNotice />
    </IntlProvider>
  );
}

function tenseOf(question: Question): 'past' | 'future' {
  if (question.when !== 'after' && question.when !== 'before') return 'future';
  const now = Temporal.Now.instant();
  return isPast(resolveAnswer(now, question).moment, now) ? 'past' : 'future';
}
