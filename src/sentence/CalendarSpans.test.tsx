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

const day = { days: 1, hours: 0, minutes: 0 };
const notes = () => screen.queryAllByText(/clocks (go|went)|no .* in|twice in/);

// 22:00 on Saturday 3 October 2026 in Sydney, the evening before its
// clocks go forward at 02:00.
const saturdayEvening = '2026-10-03T12:00:00Z';

test('a calendar answer a day away says tomorrow, with its date', () => {
  show(saturdayEvening, 'Australia/Sydney', { when: 'later', duration: day });
  expect(
    screen.getByText(/^tomorrow, Sunday 4 October.*10:00 pm$/),
  ).toBeInTheDocument();
});

test('a calendar answer a day back says yesterday, with its date', () => {
  show(saturdayEvening, 'Australia/Sydney', { when: 'earlier', duration: day });
  expect(
    screen.getByText(/^yesterday, Friday 2 October.*10:00 pm$/),
  ).toBeInTheDocument();
});

test('a calendar answer further away shows only its date', () => {
  show(saturdayEvening, 'Australia/Sydney', {
    when: 'later',
    duration: { weeks: 1, hours: 0, minutes: 0 },
  });
  expect(
    screen.getByText(/^Saturday 10 October.*10:00 pm$/),
  ).toBeInTheDocument();
});

test('a day across the change says how long it really is', () => {
  show(saturdayEvening, 'Australia/Sydney', { when: 'later', duration: day });
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so 1 day from now is 23 hours away.',
    ),
  ).toBeInTheDocument();
});

test('a day ago across a past change reads in the past', () => {
  // 22:00 on Sunday 4 October, after the change.
  show('2026-10-04T11:00:00Z', 'Australia/Sydney', {
    when: 'earlier',
    duration: day,
  });
  expect(
    screen.getByText(
      'Sydney’s clocks went forward an hour at 2 am on Sunday 4 October, so 1 day ago was 23 hours ago.',
    ),
  ).toBeInTheDocument();
});

test('a day after a chosen time says how long after it is', () => {
  show(saturdayEvening, 'Australia/Sydney', {
    when: 'after',
    duration: day,
    anchor: { time: Temporal.PlainTime.from('22:00'), day: 0, inPlace: false },
  });
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so 1 day after 10 pm is 23 hours after it.',
    ),
  ).toBeInTheDocument();
});

test('a span of months names each change, and says the clock time is kept', () => {
  show(saturdayEvening, 'Australia/Sydney', {
    when: 'later',
    duration: { months: 7, hours: 0, minutes: 0 },
  });
  expect(notes()).toHaveLength(2);
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getByText(
      'Sydney’s clocks go back an hour at 3 am on Sunday 4 April.',
    ),
  ).toBeInTheDocument();
  expect(
    screen.getAllByText(
      'Calculations done in days or longer keep the clock time, so the answer is the same time of day.',
    ),
  ).toHaveLength(1);
});

test('a day that lands on a skipped time says so', () => {
  // 02:30 on Saturday 3 October; 02:30 on the 4th never happens.
  show('2026-10-02T16:30:00Z', 'Australia/Sydney', {
    when: 'later',
    duration: day,
  });
  expect(
    screen.getByText(
      'There’s no 2:30 am in Sydney on Sunday 4 October: the clocks go forward. This counts from 3:30 am.',
    ),
  ).toBeInTheDocument();
});

test('a day that lands on a repeated time says which one', () => {
  // 01:30 on Saturday 24 October in London; 01:30 on the 25th happens twice.
  show(
    '2026-10-24T00:30:00Z',
    'Europe/London',
    { when: 'later', duration: day },
    { city: 'London' },
  );
  expect(
    screen.getByText(
      '1:30 am happens twice in London on Sunday 25 October, when the clocks go back. This counts from the first, at GMT+1.',
    ),
  ).toBeInTheDocument();
});

test('an exact span says how the change moves the answer', () => {
  show(saturdayEvening, 'Australia/Sydney', {
    when: 'later',
    duration: { hours: 24, minutes: 0 },
  });
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so the answer is an hour later than counting on the clock gives.',
    ),
  ).toBeInTheDocument();
});

test('a skipped landing doesn’t also count the day’s hours', () => {
  // 02:30 plus a day lands in the skipped hour and moves to 03:30, so the
  // span is a full 24 hours; counting it would explain nothing.
  show('2026-10-02T16:30:00Z', 'Australia/Sydney', {
    when: 'later',
    duration: day,
  });
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October.',
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText(/keep the clock time/)).not.toBeInTheDocument();
});

test('a change only in the answer’s place doesn’t count the hours', () => {
  // The day is counted in London, "my time", where nothing changes; the
  // change is Sydney's.
  show(
    saturdayEvening,
    'Australia/Sydney',
    {
      when: 'after',
      duration: day,
      deviceZone: 'Europe/London',
      anchor: {
        time: Temporal.PlainTime.from('12:00'),
        day: 0,
        inPlace: false,
      },
    },
    { city: 'Sydney', anchorCity: 'London' },
  );
  expect(
    screen.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October.',
    ),
  ).toBeInTheDocument();
  expect(screen.queryByText(/keep the clock time/)).not.toBeInTheDocument();
});
