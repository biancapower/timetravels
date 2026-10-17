import { expect, test } from 'vitest';
import { aliases } from '../places/aliases';
import { buildPlaces } from '../places/places';
import { readAddress, writeAddress, type Asked } from './address';

const places = buildPlaces(Intl.supportedValuesOf('timeZone'), aliases);
const deviceZone = 'Australia/Sydney';
// 9:41 am on Saturday 10 October 2026 in Sydney, so the next whole hour is 10 am.
const now = Temporal.Instant.from('2026-10-09T22:41:00Z');
const london = { city: 'London', zone: 'Europe/London' };
const tokyo = { city: 'Tokyo', zone: 'Asia/Tokyo' };
const at3pm = {
  time: Temporal.PlainTime.from('15:00'),
  day: 0 as const,
  whose: 'mine' as const,
};
// With no chosen time in the address, it's the next whole hour, as on opening the app.
const nextHour = { ...at3pm, time: Temporal.PlainTime.from('10:00') };

function asked(overrides: Partial<Asked> = {}): Asked {
  return {
    where: null,
    when: 'now',
    duration: { hours: 1, minutes: 0 },
    anchor: nextHour,
    ...overrides,
  };
}

function read(search: string, where: Asked['where'] = null) {
  return readAddress(search, { places, deviceZone, now, where });
}

test.each([
  ['here, right now', asked(), '?in=Australia/Sydney'],
  [
    'London, 10 hours from now',
    asked({
      where: { kind: 'city', place: london },
      when: 'later',
      duration: { hours: 10, minutes: 0 },
    }),
    '?in=Europe/London&when=from-now&for=10h',
  ],
  [
    'London, 6 months ago',
    asked({
      where: { kind: 'city', place: london },
      when: 'earlier',
      duration: { months: 6, hours: 0, minutes: 0 },
    }),
    '?in=Europe/London&when=ago&for=6mo',
  ],
  [
    'London, 1 hour 30 after 3 pm tomorrow my time',
    asked({
      where: { kind: 'city', place: london },
      when: 'after',
      duration: { hours: 1, minutes: 30 },
      anchor: { ...at3pm, day: 1 },
    }),
    '?in=Europe/London&when=after&for=1h30m&at=15:00&day=tomorrow&at-in=Australia/Sydney',
  ],
  [
    'London, 1 hour before 3 pm in London',
    asked({
      where: { kind: 'city', place: london },
      when: 'before',
      anchor: { ...at3pm, whose: 'theirs' },
    }),
    '?in=Europe/London&when=before&for=1h&at=15:00&at-in=Europe/London',
  ],
  [
    'London, 1 hour after 3 pm yesterday in Tokyo',
    asked({
      where: { kind: 'city', place: london },
      when: 'after',
      anchor: { ...at3pm, day: -1, whose: tokyo },
    }),
    '?in=Europe/London&when=after&for=1h&at=15:00&day=yesterday&at-in=Asia/Tokyo',
  ],
  [
    'here, at 3 pm in Tokyo, with no length',
    asked({ when: 'at', anchor: { ...at3pm, whose: tokyo } }),
    '?in=Australia/Sydney&when=at&at=15:00&at-in=Asia/Tokyo',
  ],
])('%s is written as its address, and reads back', (_, question, search) => {
  expect(writeAddress(question, deviceZone)).toBe(search);
  expect(read(search)).toEqual(question);
});

test('home and named places are written as their zone, and read back as cities', () => {
  const home = asked({ where: { kind: 'home', place: london } });
  const named = asked({
    where: { kind: 'named', name: 'Mark’s place', place: tokyo },
  });
  expect(writeAddress(home, deviceZone)).toBe('?in=Europe/London');
  expect(writeAddress(named, deviceZone)).toBe('?in=Asia/Tokyo');
  expect(read('?in=Asia/Tokyo')?.where).toEqual({ kind: 'city', place: tokyo });
});

test('a zone shared with an alias reads as the zone’s own city', () => {
  expect(read('?in=Australia/Melbourne')?.where).toEqual({
    kind: 'city',
    place: { city: 'Melbourne', zone: 'Australia/Melbourne' },
  });
  // Canberra is an alias in Sydney's zone, which is here.
  expect(read('?in=Australia/Sydney')?.where).toBeNull();
});

test('a renamed zone’s other id finds the zone this browser lists', () => {
  const listed = places.find((place) => place.city === 'Kolkata');
  const other =
    listed?.zone === 'Asia/Calcutta' ? 'Asia/Kolkata' : 'Asia/Calcutta';
  expect(read(`?in=${other}`)?.where).toEqual({ kind: 'city', place: listed });
});

test('an address with no question in it gives nothing', () => {
  expect(read('')).toBeNull();
  expect(read('?utm_source=x')).toBeNull();
});

test('each part that can’t be read falls back, and the rest still applies', () => {
  const saved = { kind: 'city' as const, place: tokyo };
  expect(read('?in=Atlantis/Nowhere&when=from-now&for=10h', saved)).toEqual(
    asked({
      where: saved,
      when: 'later',
      duration: { hours: 10, minutes: 0 },
    }),
  );
  expect(read('?in=Europe/London&when=soon&for=banana')).toMatchObject({
    when: 'now',
    duration: { hours: 1, minutes: 0 },
  });
  expect(
    read('?in=Europe/London&when=after&for=2h&at=25:99&day=tomorrow&at-in=X/Y'),
  ).toMatchObject({
    when: 'after',
    duration: { hours: 2, minutes: 0 },
    anchor: nextHour,
  });
});

test('a place in the same zone as the one saved here reads as the saved one', () => {
  const home = { kind: 'home' as const, place: london };
  expect(read('?in=Europe/London', home)?.where).toEqual(home);
  // Home here, in the device's own zone, stays home rather than "here".
  const homeHere = {
    kind: 'home' as const,
    place: { city: 'Sydney', zone: 'Australia/Sydney' },
  };
  expect(read('?in=Australia/Sydney', homeHere)?.where).toEqual(homeHere);
  // Another zone is just its city.
  expect(read('?in=Asia/Tokyo', home)?.where).toEqual({
    kind: 'city',
    place: tokyo,
  });
});
