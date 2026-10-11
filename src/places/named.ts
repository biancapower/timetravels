import type { Place } from './places';

/** A place the person has named, such as "Mark's place". */
export interface NamedPlace {
  name: string;
  place: Place;
}

/** The places a person has named on this device. Home is built in, so it has no name of its own. */
export interface SavedPlaces {
  home: Place | null;
  named: readonly NamedPlace[];
}

export const noSavedPlaces: SavedPlaces = { home: null, named: [] };

/** Where the sentence asks about, when it isn't "here". */
export type Where =
  | { kind: 'city'; place: Place }
  | { kind: 'home'; place: Place }
  | { kind: 'named'; name: string; place: Place };

export const longestName = 30;

export type NameProblem = 'empty' | 'long' | 'reserved' | 'taken';

/**
 * What is wrong with a name, if anything. `reserved` holds the app's own
 * words for places, such as "home" and "here"; `original` is the name being
 * changed, which may be kept. Case is ignored throughout.
 */
export function nameProblem(
  name: string,
  saved: SavedPlaces,
  { reserved, original }: { reserved: readonly string[]; original?: string },
): NameProblem | null {
  const trimmed = name.trim();
  if (!trimmed) return 'empty';
  if (characters(trimmed) > longestName) return 'long';
  const same = (other: string) =>
    other.localeCompare(trimmed, undefined, { sensitivity: 'accent' }) === 0;
  if (reserved.some(same)) return 'reserved';
  if (saved.named.some((entry) => entry.name !== original && same(entry.name)))
    return 'taken';
  return null;
}

/** Characters as a person counts them, so an emoji or an accented letter is one. */
function characters(text: string): number {
  return Array.from(new Intl.Segmenter().segment(text)).length;
}

/** Adds a named place, or replaces the one called `original` where it stands. */
export function withNamed(
  saved: SavedPlaces,
  entry: NamedPlace,
  original?: string,
): SavedPlaces {
  const index = saved.named.findIndex((other) => other.name === original);
  const named =
    index === -1 ? [...saved.named, entry] : saved.named.with(index, entry);
  return { ...saved, named };
}

export function withoutNamed(saved: SavedPlaces, name: string): SavedPlaces {
  return {
    ...saved,
    named: saved.named.filter((entry) => entry.name !== name),
  };
}
