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
import type { SavedPlaces, Where } from './places/named';
import { buildPlaces, cityOf, type Place } from './places/places';
import {
  loadAnchorPlace,
  loadPlace,
  loadSavedPlaces,
  saveAnchorPlace,
  savePlace,
  saveSavedPlaces,
} from './places/storage';
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
  const [saved, setSaved] = useState(() => loadSavedPlaces(places));
  const [where, setWhere] = useState(() => loadPlace(places, saved));
  const place = where?.place;
  const [when, setWhen] = useState<When>('now');
  const [duration, setDuration] = useState<Duration>({ hours: 1, minutes: 0 });
  const [anchor, setAnchor] = useState<AnchorSetting>(() => ({
    ...nextWholeHour(Temporal.Now.instant(), zone),
    whose: loadAnchorPlace(places) ?? 'mine',
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

  const choosePlace = (chosen: Where | null) => {
    setWhere(chosen);
    savePlace(chosen);
  };
  const changeAnchor = (next: AnchorSetting) => {
    setAnchor(next);
    if (next.whose !== anchor.whose)
      saveAnchorPlace(typeof next.whose === 'object' ? next.whose : null);
  };
  const changeSaved = (next: SavedPlaces, chosen: Where | null) => {
    setSaved(next);
    saveSavedPlaces(next);
    choosePlace(chosen);
  };
  // The city the device's zone is named after, rather than an alias that
  // shares the zone, such as Canberra for Sydney.
  const homeDefault =
    places.find((p) => p.zone === zone && p.city === cityOf(zone)) ??
    places.find((p) => p.zone === zone);

  const question: Question = {
    when,
    duration,
    // With no place picked there is only one place, so "my time" is the only reading.
    anchor: place ? anchor : { ...anchor, whose: 'mine' },
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
            where={where}
            places={places}
            saved={saved}
            homeDefault={homeDefault}
            anchor={question.anchor}
            tense={tense}
            onWhenChange={setWhen}
            onDurationChange={setDuration}
            onPlaceChange={choosePlace}
            onSavedChange={changeSaved}
            onAnchorChange={changeAnchor}
          />
          <LiveAnswer
            question={question}
            city={place?.city ?? cityOf(zone)}
            where={where}
            anchorCity={anchorCityOf(question.anchor.whose, place, zone)}
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

function anchorCityOf(
  whose: AnchorSetting['whose'],
  place: Place | undefined,
  zone: string,
): string | undefined {
  if (whose === 'mine') return cityOf(zone);
  return whose === 'theirs' ? place?.city : whose.city;
}

function tenseOf(question: Question): 'past' | 'future' {
  if (question.when !== 'after' && question.when !== 'before') return 'future';
  const now = Temporal.Now.instant();
  return isPast(resolveAnswer(now, question).moment, now) ? 'past' : 'future';
}
