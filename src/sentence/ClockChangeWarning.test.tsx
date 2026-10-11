import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect, test } from 'vitest';
import { catalogues } from '../i18n/messages';
import { question } from '../testing/question';
import { Answer } from './Answer';
import type { Question } from './resolveAnswer';

function show(
  now: string,
  zone: string,
  overrides: Parameters<typeof question>[1],
  props: { city?: string; anchorCity?: string } = {},
) {
  const q: Question = question(zone, overrides);
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer
        now={Temporal.Instant.from(now)}
        question={q}
        locale="en-AU"
        {...props}
      />
    </IntlProvider>,
  );
}

const tenHours = { hours: 10, minutes: 0 };
const clocks = () => screen.queryAllByText(/clocks (go|went)/);

test('a span across the spring change says the answer is an hour later', () => {
  show('2026-10-03T11:00:00Z', 'Australia/Sydney', {
    when: 'later',
    duration: tenHours,
  });
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so the answer is an hour later than counting on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('a span across the autumn change says the answer is an hour earlier', () => {
  show('2026-04-04T11:00:00Z', 'Australia/Sydney', {
    when: 'later',
    duration: tenHours,
  });
  expect(
    screen.getByText(
      'Sydney’s clocks go back an hour at 3 am on Sunday 5 April, so the answer is an hour earlier than counting on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('"ago" across a change already past reads "went" and counts back', () => {
  show('2026-10-04T00:00:00Z', 'Australia/Sydney', {
    when: 'earlier',
    duration: tenHours,
  });
  expect(clocks()).toHaveLength(1);
  expect(
    screen.getByText(
      'Sydney’s clocks went forward an hour at 2 am on Sunday 4 October, so the answer is an hour earlier than counting back on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('an ordinary span has no line', () => {
  show('2026-10-10T11:00:00Z', 'Australia/Sydney', {
    when: 'later',
    duration: tenHours,
  });
  expect(clocks()).toHaveLength(0);
});

test('"right now" has no line, even on a change day', () => {
  show('2026-10-03T16:30:00Z', 'Australia/Sydney', { when: 'now' });
  expect(clocks()).toHaveLength(0);
});

test('in a place, the line names the place', () => {
  show(
    '2026-10-24T20:00:00Z',
    'Europe/London',
    { when: 'later', duration: tenHours },
    { city: 'London' },
  );
  expect(
    screen.getByText(
      'London’s clocks go back an hour at 2 am on Sunday 25 October, so the answer is an hour earlier than counting on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('a change only in the chosen time’s place names that place', () => {
  show(
    '2026-10-24T20:00:00Z',
    'Australia/Sydney',
    {
      when: 'after',
      duration: tenHours,
      deviceZone: 'Europe/London',
      anchor: {
        time: Temporal.PlainTime.from('22:00'),
        day: 0,
        inPlace: false,
      },
    },
    { city: 'Sydney', anchorCity: 'London' },
  );
  expect(clocks()).toHaveLength(1);
  expect(
    screen.getByText(
      'London’s clocks go back an hour at 2 am on Sunday 25 October, so the time in London is an hour earlier than counting on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('Lord Howe Island moves 30 minutes', () => {
  show('2026-10-03T11:00:00Z', 'Australia/Lord_Howe', {
    when: 'later',
    duration: tenHours,
  });
  expect(
    screen.getByText(/go forward 30 minutes at 2 am.*30 minutes later than/),
  ).toBeInTheDocument();
});

test('a one-hour span across a change reads naturally', () => {
  // 1:30 am on Sunday 4 October in Sydney, half an hour before the change.
  show('2026-10-03T15:30:00Z', 'Australia/Sydney', {
    when: 'later',
    duration: { hours: 1, minutes: 0 },
  });
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so the answer is an hour later than counting on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('"before a time" across a change counts back', () => {
  // 10 hours before 10 am on Sunday 4 October in Sydney crosses 2 am.
  show(
    '2026-10-03T11:00:00Z',
    'Australia/Sydney',
    {
      when: 'before',
      duration: tenHours,
      anchor: {
        time: Temporal.PlainTime.from('10:00'),
        day: 1,
        inPlace: false,
      },
    },
    { city: 'Sydney' },
  );
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so the answer is an hour earlier than counting back on the clock gives.',
    ),
  ).toBeInTheDocument();
});
