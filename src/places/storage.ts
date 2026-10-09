import type { Place } from './places';

// A per-device convenience only: losing it just means starting from "here".
const key = 'timetravels.place';

/** The saved place, if it is still one of the places offered. */
export function loadPlace(places: readonly Place[]): Place | null {
  try {
    const stored: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    if (typeof stored !== 'object' || stored === null) return null;
    const { city, zone } = stored as Partial<Place>;
    return (
      places.find((place) => place.city === city && place.zone === zone) ?? null
    );
  } catch {
    return null;
  }
}

/** Saves the place, or clears it when the sentence is back to "here". */
export function savePlace(place: Place | null): void {
  try {
    if (place) localStorage.setItem(key, JSON.stringify(place));
    else localStorage.removeItem(key);
  } catch {
    // Storage can be unavailable, for example in some private windows.
  }
}
