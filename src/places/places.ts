// Places a person can pick: a city name and the time zone it uses.

export interface Place {
  city: string;
  zone: string;
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

function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Places whose city or zone id contains the query; cities starting with it first. */
export function filterPlaces(places: readonly Place[], query: string): Place[] {
  const wanted = fold(query.trim());
  if (!wanted) return [...places];
  const starts: Place[] = [];
  const contains: Place[] = [];
  for (const place of places) {
    const city = fold(place.city);
    if (city.startsWith(wanted)) starts.push(place);
    else if (city.includes(wanted) || fold(place.zone).includes(wanted))
      contains.push(place);
  }
  return [...starts, ...contains];
}
