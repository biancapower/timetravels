import data from './regions.json';
import { cityOf, fold, type Place } from './places';

// The data comes from scripts/places-data.js: the time-zone database's
// zone.tab for countries, and GeoNames for states (CC BY 4.0).

/**
 * Countries, and the states of countries with several zones, as places:
 * "Japan", "Tasmania". One with several zones gives a place for each,
 * "Australia: Perth", so the list and the sentence say which part is meant.
 * A state named like a country, or like a place in another zone, gets its
 * country: "Georgia, United States". Country names follow the locale; only
 * zones this browser knows are kept.
 */
export function regionPlaces(
  supported: readonly string[],
  locale: string,
  taken: readonly Place[],
): Place[] {
  const known = knownZones(supported);
  const countryNames = new Intl.DisplayNames(locale, { type: 'region' });
  const countryName = (code: string) => {
    const name = countryNames.of(code);
    return name && name !== code ? name : undefined;
  };
  const places: Place[] = [];
  const named = new Map<string, string>();
  for (const place of taken) named.set(fold(place.city), place.zone);
  const add = (name: string, zones: string[]) => {
    for (const zone of zones) {
      const city = zones.length > 1 ? `${name}: ${zoneCity(zone)}` : name;
      if (named.get(fold(city)) === zone) continue;
      named.set(fold(city), zone);
      places.push({ city, zone, searchOnly: true });
    }
  };
  const keep = (zones: readonly string[]) =>
    zones.flatMap((zone) => known(zone) ?? []);

  const countries = new Set<string>();
  for (const [code, zones] of Object.entries(data.countries)) {
    const name = countryName(code);
    if (!name) continue;
    countries.add(fold(name));
    add(name, keep(zones));
  }
  for (const [name, code, ...rest] of data.regions) {
    const zones = keep(rest);
    if (!name || !code || zones.length === 0) continue;
    const other = named.get(fold(name));
    const clash =
      countries.has(fold(name)) ||
      (other !== undefined && !zones.includes(other));
    add(clash ? `${name}, ${countryName(code) ?? code}` : name, zones);
  }
  return places;
}

/**
 * Turns a zone id into the one this browser lists, or null when it doesn't
 * know the zone. Browsers differ on renamed zones, such as Asia/Kolkata and
 * Asia/Calcutta, so an id it doesn't list is matched by what it resolves to.
 */
function knownZones(supported: readonly string[]) {
  const listed = new Set(supported);
  return (zone: string): string | null => {
    if (listed.has(zone)) return zone;
    try {
      const id = new Intl.DateTimeFormat('en', {
        timeZone: zone,
      }).resolvedOptions().timeZone;
      return listed.has(id) ? id : null;
    } catch {
      return null;
    }
  };
}

/** "America/Indiana/Indianapolis" to "Indianapolis", "Asia/Calcutta" to "Kolkata". */
function zoneCity(zone: string): string {
  return cityOf(zone)?.split(',')[0] ?? zone;
}
