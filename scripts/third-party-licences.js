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

writeFileSync(
  'public/third-party-licences.txt',
  [
    'TimeTravels includes the following open-source software.',
    ...sections,
  ].join(`\n\n${'-'.repeat(72)}\n\n`) + '\n',
);
