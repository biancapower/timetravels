// Writes public/third-party-licences.txt: the licence of every production
// dependency, which the MIT and similar licences require to travel with
// the bundled code. pnpm lists the packages; their own licence files supply
// the text.
import { execFileSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const listing = JSON.parse(
  execFileSync('pnpm', ['licenses', 'list', '--prod', '--json'], {
    encoding: 'utf8',
  }),
);

const packages = Object.values(listing)
  .flat()
  .sort((a, b) => a.name.localeCompare(b.name));

function licenceText(directory) {
  const file = readdirSync(directory).find((name) =>
    /^(licen[cs]e|copying)(\.|$)/i.test(name),
  );
  return file
    ? readFileSync(join(directory, file), 'utf8').trim()
    : '(The package includes no licence file.)';
}

const sections = packages.map(({ name, versions, license, paths }) =>
  [
    `${name}@${versions.join(', ')}`,
    `Licence: ${license}`,
    '',
    licenceText(paths[0]),
  ].join('\n'),
);

// Data the app includes, written by scripts/places-data.js.
const data = [
  [
    'GeoNames: names of states, provinces and territories',
    'Licence: CC BY 4.0, https://creativecommons.org/licenses/by/4.0/',
    '',
    'Source: GeoNames, https://www.geonames.org/, from',
    'https://download.geonames.org/export/dump/ (admin1CodesASCII.txt and',
    'cities1000.zip).',
    '',
    'Changed: reduced to the states of countries with more than one time',
    'zone, each with the time zones that at least 1% of its people use,',
    'worked out from the populations of its cities.',
    '',
    'GeoNames provides the data "as is" without warranty or any',
    'representation of accuracy, timeliness or completeness.',
  ].join('\n'),
  [
    'Time zone database: zone.tab, which countries use which time zones',
    'Licence: public domain',
    '',
    'Source: https://www.iana.org/time-zones',
  ].join('\n'),
];

writeFileSync(
  'public/third-party-licences.txt',
  [
    'TimeTravels includes the following open-source software.',
    ...sections,
    'TimeTravels includes the following data.',
    ...data,
  ].join(`\n\n${'-'.repeat(72)}\n\n`) + '\n',
);
