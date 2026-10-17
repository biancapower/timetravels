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
import { regionPlaces } from './places/regions';
import {
  loadAnchorPlace,
  loadPlace,
  loadSavedPlaces,
  saveAnchorPlace,
  savePlace,
  saveSavedPlaces,
} from './places/storage';
import { counts, isAnchored, type When } from './sentence/DirectionPicker';
import { readAddress, writeAddress } from './sentence/address';
import { LiveAnswer } from './sentence/LiveAnswer';
import {
  resolveAnswer,
  type AnchorSetting,
  type Question,
} from './sentence/resolveAnswer';
import { Sentence } from './sentence/Sentence';
import { isPast, nextWholeHour, type Duration, type Moment } from './time';
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
  const [places] = useState(() => {
    const zones = Intl.supportedValuesOf('timeZone');
    const cities = buildPlaces(zones, aliases);
    return [...cities, ...regionPlaces(zones, locale, cities)].sort((a, b) =>
      a.city.localeCompare(b.city),
    );
  });
  const [saved, setSaved] = useState(() => loadSavedPlaces(places));
  // A question in the address wins over what's saved, without changing it.
  const [opened] = useState(() =>
    readAddress(location.search, {
      places,
      deviceZone: zone,
      now: Temporal.Now.instant(),
      where: loadPlace(places, saved),
    }),
  );
  const [where, setWhere] = useState(() =>
    opened ? opened.where : loadPlace(places, saved),
  );
  const place = where?.place;
  const [when, setWhen] = useState<When>(opened?.when ?? 'now');
  const [duration, setDuration] = useState<Duration>(
    opened?.duration ?? { hours: 1, minutes: 0 },
  );
  const [anchor, setAnchor] = useState<AnchorSetting>(() =>
    opened && isAnchored(opened.when)
      ? opened.anchor
      : {
          ...nextWholeHour(Temporal.Now.instant(), zone),
          whose: loadAnchorPlace(places) ?? 'mine',
        },
  );

  // Each change to the question is a step for Back. Tidying the address the
  // page opened at, or one reached by Back or Forward, replaces its entry
  // rather than adding one.
  // With no place picked, the chosen time is here's, except that "at a
  // time" can take another place's.
  const anchorShown =
    place || (when === 'at' && typeof anchor.whose === 'object')
      ? anchor
      : { ...anchor, whose: 'mine' as const };
  const address = writeAddress(
    { where, when, duration, anchor: anchorShown },
    zone,
  );
  const replaceNext = useRef(true);
  useEffect(() => {
    if (location.search !== address) {
      const url = location.pathname + address + location.hash;
      if (replaceNext.current) history.replaceState(history.state, '', url);
      else history.pushState(null, '', url);
    }
    replaceNext.current = false;
  }, [address]);
  useEffect(() => {
    const back = () => {
      if (location.search === address) return;
      const asked = readAddress(location.search, {
        places,
        deviceZone: zone,
        now: Temporal.Now.instant(),
        where,
      });
      if (!asked) return;
      if (writeAddress(asked, zone) === address) {
        history.replaceState(
          history.state,
          '',
          location.pathname + address + location.hash,
        );
        return;
      }
      replaceNext.current = true;
      setWhere(asked.where);
      setWhen(asked.when);
      if (counts(asked.when)) setDuration(asked.duration);
      if (isAnchored(asked.when)) setAnchor(asked.anchor);
    };
    addEventListener('popstate', back);
    return () => {
      removeEventListener('popstate', back);
    };
  }, [address, places, zone, where]);

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
    anchor: anchorShown,
    answerZone: place?.zone ?? zone,
    deviceZone: zone,
  };
  // Sentence 5's verb follows whether its answer is past, and "it's" before
  // the chosen time whether that time or the answer is. Both are worked out
  // whenever the app renders, which is on any choice, not on the minute tick.
  const { tense, anchorTense } = tensesOf(question);

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
            anchorTense={anchorTense}
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

type Tense = 'past' | 'future';

/**
 * Whether sentence 5's answer is past, and whether its chosen time reads as
 * past: "was it … before it's 10 am" clashes, so a past answer makes it so.
 */
function tensesOf(question: Question): { tense: Tense; anchorTense: Tense } {
  if (!isAnchored(question.when))
    return { tense: 'future', anchorTense: 'future' };
  const now = Temporal.Now.instant();
  const { moment, anchored } = resolveAnswer(now, question);
  const tenseAt = (of: Moment | undefined): Tense =>
    of && isPast(of, now) ? 'past' : 'future';
  const tense = tenseAt(moment);
  return {
    tense,
    anchorTense: tense === 'past' ? 'past' : tenseAt(anchored?.moment),
  };
}
