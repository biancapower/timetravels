import { noSavedPlaces, type SavedPlaces, type Where } from './named';
import type { Place } from './places';

// Per-device conveniences only: losing them just means starting from "here"
// with no named places.
const key = 'timetravels.place';
const savedKey = 'timetravels.savedPlaces';
const anchorKey = 'timetravels.anchorPlace';

function read(from: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(from) ?? 'null');
  } catch {
    return null;
  }
}

function write(to: string, value: unknown): void {
  try {
    if (value === null) localStorage.removeItem(to);
    else localStorage.setItem(to, JSON.stringify(value));
  } catch {
    // Storage can be unavailable, for example in some private windows.
  }
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * A stored place, if it is still one of the places offered. A place whose
 * city name has changed since it was saved is found by its zone.
 */
function findPlace(places: readonly Place[], stored: unknown): Place | null {
  if (!isObject(stored)) return null;
  const { city, zone } = stored;
  return (
    places.find((place) => place.city === city && place.zone === zone) ??
    places.find((place) => place.zone === zone) ??
    null
  );
}

/** The saved home and named places, leaving out any whose zone this browser doesn't know. */
export function loadSavedPlaces(places: readonly Place[]): SavedPlaces {
  const stored = read(savedKey);
  if (!isObject(stored)) return noSavedPlaces;
  const named = Array.isArray(stored.named) ? (stored.named as unknown[]) : [];
  return {
    home: findPlace(places, stored.home),
    named: named.flatMap((entry) => {
      if (!isObject(entry) || typeof entry.name !== 'string') return [];
      const place = findPlace(places, entry.place);
      return place ? [{ name: entry.name, place }] : [];
    }),
  };
}

export function saveSavedPlaces(saved: SavedPlaces): void {
  write(savedKey, saved);
}

/** The place the sentence was last asked about, if it still exists. */
export function loadPlace(
  places: readonly Place[],
  saved: SavedPlaces,
): Where | null {
  const stored = read(key);
  if (!isObject(stored)) return null;
  if (stored.home === true)
    return saved.home ? { kind: 'home', place: saved.home } : null;
  if (typeof stored.name === 'string') {
    const entry = saved.named.find((other) => other.name === stored.name);
    return entry ? { kind: 'named', ...entry } : null;
  }
  const place = findPlace(places, stored);
  return place ? { kind: 'city', place } : null;
}

/** Saves the place, or clears it when the sentence is back to "here". */
export function savePlace(where: Where | null): void {
  write(
    key,
    where?.kind === 'city'
      ? where.place
      : where?.kind === 'home'
        ? { home: true }
        : where?.kind === 'named'
          ? { name: where.name }
          : null,
  );
}

/** The third place sentence 5's chosen time was last given in, if it still exists. */
export function loadAnchorPlace(places: readonly Place[]): Place | null {
  return findPlace(places, read(anchorKey));
}

/** Saves the third place, or clears it when the time is mine or the picked place's. */
export function saveAnchorPlace(place: Place | null): void {
  write(anchorKey, place);
}
