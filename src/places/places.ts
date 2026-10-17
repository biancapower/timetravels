// Places a person can pick: a city name and the time zone it uses.

export interface Place {
  city: string;
  zone: string;
  /** A country or state, offered once something is typed rather than in the list a picker opens with. */
  searchOnly?: true;
}

// Zone data keeps some old spellings as the canonical id.
const currentNames: Record<string, string> = {
  'Asia/Calcutta': 'Kolkata',
  'Asia/Katmandu': 'Kathmandu',
  'Asia/Rangoon': 'Yangon',
  'Asia/Saigon': 'Ho Chi Minh City',
  'Europe/Kiev': 'Kyiv',
  'America/Godthab': 'Nuuk',
};

/** The city a zone is named after, or undefined for zones such as UTC. */
export function cityOf(zone: string): string | undefined {
  if (!zone.includes('/') || zone.startsWith('Etc/')) return undefined;
  const renamed = currentNames[zone];
  if (renamed) return renamed;
  const parts = zone.split('/').map((part) => part.replaceAll('_', ' '));
  const city = parts.at(-1);
  // "America/North_Dakota/Center": the city alone would be just "Center".
  return parts.length > 2 ? `${city ?? ''}, ${parts.at(-2) ?? ''}` : city;
}

/** Every city zone, plus the aliases, in alphabetical order. */
export function buildPlaces(
  zones: readonly string[],
  aliases: readonly Place[],
): Place[] {
  const places: Place[] = [...aliases];
  for (const zone of zones) {
    const city = cityOf(zone);
    if (city) places.push({ city, zone });
  }
  return places.sort((a, b) => a.city.localeCompare(b.city));
}

export function fold(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/**
 * Places whose city or zone id contains the query: one named exactly first,
 * then cities starting with it, then countries and states starting with it,
 * then the rest. With nothing typed, the places a picker opens with.
 */
export function filterPlaces(places: readonly Place[], query: string): Place[] {
  const wanted = fold(query.trim());
  if (!wanted) return places.filter((place) => !place.searchOnly);
  const exact: Place[] = [];
  const cities: Place[] = [];
  const regions: Place[] = [];
  const contains: Place[] = [];
  for (const place of places) {
    const city = fold(place.city);
    if (city === wanted) exact.push(place);
    else if (city.startsWith(wanted))
      (place.searchOnly ? regions : cities).push(place);
    else if (city.includes(wanted) || fold(place.zone).includes(wanted))
      contains.push(place);
  }
  return [...exact, ...cities, ...regions, ...contains];
}
