import data from './regions.json';
import { cityOf, fold, type Place } from './places';

// The data comes from scripts/places-data.js: the time-zone database's
// zone.tab for countries, and GeoNames for states (CC BY 4.0).

/**
 * Countries, and the states of countries with several zones, as places:
 * "Japan", "Tasmania". One with several zones gives a place for each,
 * "Australia: Perth", so the list and the sentence say which part is meant.
 * A state named like a country, a city in another zone or another state
 * gets its country: "Georgia, United States", "La Rioja, Spain". Country names follow the locale; only
 * zones this browser knows are kept.
 */
export function regionPlaces(
  supported: readonly string[],
  locale: string,
  taken: readonly Place[],
): Place[] {
  const known = knownZones(supported);
  const countryNames = new Intl.DisplayNames(locale, {
    type: 'region',
    fallback: 'none',
  });
  const countryName = (code: string) => countryNames.of(code);
  const places: Place[] = [];
  const cityZones = new Map<string, string>();
  for (const place of taken) cityZones.set(fold(place.city), place.zone);
  const named = new Map(cityZones);
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
  const states = data.regions.flatMap(([name, code, ...rest]) => {
    const zones = keep(rest);
    return name && code && zones.length > 0 ? [{ name, code, zones }] : [];
  });
  const stateNames = new Map<string, number>();
  for (const { name } of states)
    stateNames.set(fold(name), (stateNames.get(fold(name)) ?? 0) + 1);
  for (const { name, code, zones } of states) {
    const city = cityZones.get(fold(name));
    const clash =
      countries.has(fold(name)) ||
      (stateNames.get(fold(name)) ?? 0) > 1 ||
      (city !== undefined && !zones.includes(city));
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
