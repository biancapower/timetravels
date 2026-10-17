import type { Where } from '../places/named';
import { cityOf, type Place } from '../places/places';
import {
  nextWholeHour,
  readDuration,
  writeDuration,
  type Duration,
} from '../time';
import { counts, isAnchored, type When } from './DirectionPicker';
import type { AnchorSetting } from './resolveAnswer';

/** The parts of the question the address holds. */
export interface Asked {
  where: Where | null;
  when: When;
  duration: Duration;
  anchor: AnchorSetting;
}

const whenWords: Record<When, string | null> = {
  now: null,
  later: 'from-now',
  earlier: 'ago',
  at: 'at',
  after: 'after',
  before: 'before',
};

const dayWords = { [-1]: 'yesterday', 0: null, 1: 'tomorrow' } as const;

/**
 * The question as a query string, such as
 * "?in=Europe/London&when=from-now&for=10h". "Here" and "my time" are
 * written as the device's zone, so the address means the same to whoever
 * opens it.
 */
export function writeAddress(asked: Asked, deviceZone: string): string {
  const { where, when, duration, anchor } = asked;
  const placeZone = where?.place.zone ?? deviceZone;
  const parts: [string, string | null][] = [
    ['in', placeZone],
    ['when', whenWords[when]],
  ];
  if (counts(when)) parts.push(['for', writeDuration(duration)]);
  if (isAnchored(when)) {
    const whose =
      anchor.whose === 'mine'
        ? deviceZone
        : anchor.whose === 'theirs'
          ? placeZone
          : anchor.whose.zone;
    parts.push(
      ['at', anchor.time.toString({ smallestUnit: 'minute' })],
      ['day', dayWords[anchor.day]],
      ['at-in', whose],
    );
  }
  const query = parts
    .filter((part): part is [string, string] => part[1] !== null)
    .map(([key, value]) => `${key}=${readable(value)}`)
    .join('&');
  return `?${query}`;
}

/** Encodes a value, leaving the slashes and colons of zones and times as they are. */
function readable(value: string): string {
  return encodeURIComponent(value)
    .replaceAll('%2F', '/')
    .replaceAll('%3A', ':');
}

const keys = ['in', 'when', 'for', 'at', 'day', 'at-in'];

/**
 * The question in a query string, or null when it holds none. A part that
 * can't be read takes its default, and the rest still applies.
 */
export function readAddress(
  search: string,
  options: {
    places: readonly Place[];
    deviceZone: string;
    now: Temporal.Instant;
    /**
     * The place saved on this device: it's used when the address's place
     * can't be read, and kept, with its name, when it's in the same zone.
     */
    where: Where | null;
  },
): Asked | null {
  const params = new URLSearchParams(search);
  if (!keys.some((key) => params.has(key))) return null;
  const { places, deviceZone, now } = options;

  const placeZone = params.get('in');
  const place = placeZone ? placeIn(places, placeZone) : null;
  const where: Where | null =
    place === null
      ? options.where
      : options.where && sameZone(place.zone, options.where.place.zone)
        ? options.where
        : sameZone(place.zone, deviceZone)
          ? null
          : { kind: 'city', place };

  const when =
    (Object.keys(whenWords) as When[]).find(
      (key) => key !== 'now' && whenWords[key] === params.get('when'),
    ) ?? 'now';

  const read = readDuration(params.get('for') ?? '');
  const duration =
    'duration' in read ? read.duration : { hours: 1, minutes: 0 };

  const fallback = nextWholeHour(now, deviceZone);
  const at = /^\d{2}:\d{2}$/.test(params.get('at') ?? '')
    ? safely(() => Temporal.PlainTime.from(params.get('at') ?? ''))
    : null;
  const dayWord = params.get('day');
  const day = at
    ? dayWord === 'tomorrow'
      ? 1
      : dayWord === 'yesterday'
        ? -1
        : 0
    : fallback.day;

  const anchorZone = params.get('at-in');
  const anchorPlace = anchorZone ? placeIn(places, anchorZone) : null;
  const whose: AnchorSetting['whose'] =
    anchorPlace === null || sameZone(anchorPlace.zone, deviceZone)
      ? 'mine'
      : where && sameZone(anchorPlace.zone, where.place.zone)
        ? 'theirs'
        : anchorPlace;

  return {
    where,
    when,
    duration,
    anchor: { time: at ?? fallback.time, day, whose },
  };
}

/**
 * The place for a zone id: the city the zone is named after where there is
 * one, as for a zone shared with an alias. Browsers differ in which of a
 * renamed zone's ids they list, so an id this one doesn't list is matched
 * by the id it resolves to here.
 */
function placeIn(places: readonly Place[], zone: string): Place | null {
  const own = (inZone: Place[]) =>
    inZone.find((place) => place.city === cityOf(place.zone));
  const exact = places.filter((place) => place.zone === zone);
  const found = own(exact);
  if (found) return found;
  const id = resolve(zone);
  const resolved = id
    ? places.filter((place) => resolve(place.zone) === id)
    : [];
  return own(resolved) ?? exact[0] ?? resolved[0] ?? null;
}

/** Whether two zone ids name the same zone in this browser. */
function sameZone(a: string, b: string): boolean {
  return a === b || resolve(a) === resolve(b);
}

/** A zone id as this browser names it, or null when it doesn't know it. */
function resolve(zone: string): string | null {
  return safely(
    () =>
      new Intl.DateTimeFormat('en', { timeZone: zone }).resolvedOptions()
        .timeZone,
  );
}

function safely<T>(make: () => T): T | null {
  try {
    return make();
  } catch {
    return null;
  }
}
