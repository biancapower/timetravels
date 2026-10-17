// Writes src/places/regions.json: which time zones each country uses, and
// the states, provinces and territories of countries with several zones,
// each with the zones its people use. Run by hand with `pnpm places-data`
// to update it, as with a time-zone database update; it downloads the
// latest of its inputs to .cache/ each time.
//
// Countries come from the time-zone database's zone.tab (public domain).
// States come from GeoNames (CC BY 4.0): its admin1 names, with each
// state's zones taken from the populations of its cities in cities1000,
// keeping any zone with at least 1% of the state's people.
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const cache = '.cache/places-data';
const share = 0.01;

mkdirSync(cache, { recursive: true });
// Downloads to a temporary name first, so a failed download leaves nothing
// that looks complete. Returns the file's path and its Last-Modified date.
function download(url, file) {
  const path = join(cache, file);
  const headers = `${path}.headers`;
  execFileSync('curl', ['-sSfL', '-D', headers, '-o', `${path}.part`, url]);
  renameSync(`${path}.part`, path);
  const modified = readFileSync(headers, 'utf8')
    .split(/\r?\n/)
    .findLast((line) => /^last-modified:/i.test(line))
    ?.replace(/^last-modified:\s*/i, '')
    .trim();
  return { path, modified };
}

const tzdata = download(
  'https://data.iana.org/time-zones/tzdata-latest.tar.gz',
  'tzdata.tar.gz',
).path;
execFileSync('tar', ['-xzf', tzdata, '-C', cache, 'zone.tab', 'version']);
const tzVersion = readFileSync(join(cache, 'version'), 'utf8').trim();

download(
  'https://download.geonames.org/export/dump/admin1CodesASCII.txt',
  'admin1CodesASCII.txt',
);
const cities = download(
  'https://download.geonames.org/export/dump/cities1000.zip',
  'cities1000.zip',
);
execFileSync('unzip', ['-o', '-q', cities.path, '-d', cache]);
// The date records which GeoNames export the file was made from.
const geonamesDate = cities.modified;
if (!geonamesDate) throw new Error('GeoNames sent no Last-Modified date');

const lines = (file) =>
  readFileSync(join(cache, file), 'utf8')
    .split('\n')
    .filter((line) => line && !line.startsWith('#'));

// Country code to its zones, in zone.tab's order.
const countries = {};
for (const line of lines('zone.tab')) {
  const [code, , zone] = line.split('\t');
  (countries[code] ??= []).push(zone);
}

// The population of each state, by zone.
const people = {};
for (const line of lines('cities1000.txt')) {
  const fields = line.split('\t');
  const state = `${fields[8]}.${fields[10]}`;
  const zone = fields[17];
  const population = Math.max(Number(fields[14]) || 0, 1);
  people[state] ??= {};
  people[state][zone] = (people[state][zone] ?? 0) + population;
}

const regions = [];
for (const line of lines('admin1CodesASCII.txt')) {
  const [code, name] = line.split('\t');
  const country = code.split('.')[0];
  if ((countries[country]?.length ?? 0) < 2) continue;
  const byZone = people[code];
  if (!byZone) continue;
  const total = Object.values(byZone).reduce((sum, n) => sum + n, 0);
  const zones = Object.entries(byZone)
    .filter(([, n]) => n / total >= share)
    .sort(([, a], [, b]) => b - a)
    .map(([zone]) => zone);
  regions.push([name, country, ...zones]);
}
regions.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));

// One entry per line, so an update's diff shows what changed.
const entries = (list) => list.map((entry) => `    ${entry}`).join(',\n');
writeFileSync(
  'src/places/regions.json',
  [
    '{',
    `  "tzdata": ${JSON.stringify(tzVersion)},`,
    `  "geonames": ${JSON.stringify(geonamesDate)},`,
    '  "countries": {',
    entries(
      Object.entries(countries).map(
        ([code, zones]) => `${JSON.stringify(code)}: ${JSON.stringify(zones)}`,
      ),
    ),
    '  },',
    '  "regions": [',
    entries(regions.map((region) => JSON.stringify(region))),
    '  ]',
    '}',
    '',
  ].join('\n'),
);
console.log(
  `${String(Object.keys(countries).length)} countries, ${String(regions.length)} states, tzdata ${tzVersion}, GeoNames ${geonamesDate}`,
);
