import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect, test } from 'vitest';
import { catalogues } from '../i18n/messages';
import { question } from '../testing/question';
import { Answer } from './Answer';
import type { Question } from './resolveAnswer';

// 9:41 am on Saturday 10 October 2026 in Sydney (GMT+11).
const now = Temporal.Instant.from('2026-10-09T22:41:00Z');

/** The line with your time, whose time is in an element of its own. */
function yourLine() {
  return screen.getByText(/your time$/);
}

function renderAnswer(
  answerZone: string,
  overrides: Partial<Question> = {},
  { at = now, locale = 'en-AU' } = {},
) {
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer
        now={at}
        question={question(answerZone, {
          deviceZone: 'Australia/Sydney',
          ...overrides,
        })}
        locale={locale}
      />
    </IntlProvider>,
  );
}

test('another place’s answer gives your time, without the day when it’s the same', () => {
  renderAnswer('Asia/Tokyo');
  expect(screen.getByText(/^Saturday 7:41\sam$/)).toBeInTheDocument();
  expect(yourLine()).toHaveTextContent(/^9:41\sam your time$/);
});

test('your day is named when it differs from the place’s', () => {
  renderAnswer('Europe/London');
  expect(screen.getByText(/^Friday 11:41\spm$/)).toBeInTheDocument();
  expect(yourLine()).toHaveTextContent(/^Saturday 9:41\sam your time$/);
});

test('a place ahead of you gives your earlier time, on your day', () => {
  // 9:41 am in Sydney is 11:41 am in Auckland (GMT+13).
  renderAnswer('Pacific/Auckland');
  expect(yourLine()).toHaveTextContent(/^9:41\sam your time$/);
});

test.each([
  ['here', 'Australia/Sydney'],
  ['in another zone on the same clock', 'Australia/Melbourne'],
])('no line when the place is %s', (_, zone) => {
  renderAnswer(zone);
  expect(screen.queryByText(/your time/)).not.toBeInTheDocument();
});

test('a dated answer gives your date, at your offset then', () => {
  // Six months on, London is still on GMT+1 on 9 April but Sydney is back on
  // GMT+10, so the gap is nine hours, not ten.
  renderAnswer('Europe/London', {
    when: 'later',
    duration: { months: 6, hours: 0, minutes: 0 },
  });
  expect(yourLine()).toHaveTextContent(
    /^Saturday 10 April 2027 at 8:41\sam your time$/,
  );
});

test('your time follows the locale’s clock', () => {
  renderAnswer('Asia/Tokyo', {}, { locale: 'en-GB' });
  expect(yourLine()).toHaveTextContent(/^09:41 your time$/);
});

test('your date gives its year when only yours is in the next one', () => {
  // 10 am on Friday 25 December 2026 in Sydney is 11 pm on the 24th in
  // London, so a week on is New Year's Eve there and New Year's Day here.
  renderAnswer(
    'Europe/London',
    { when: 'later', duration: { weeks: 1, hours: 0, minutes: 0 } },
    { at: Temporal.Instant.from('2026-12-24T23:00:00Z') },
  );
  expect(
    screen.getByText(/^Thursday 31 December at 11:00\spm$/),
  ).toBeInTheDocument();
  expect(yourLine()).toHaveTextContent(
    /^Friday 1 January 2027 at 10:00\sam your time$/,
  );
});

test('after a time of yours, your time is that time plus the span', () => {
  // 3 pm today in Sydney, plus an hour, is 6 am in London, where it's still
  // Friday, so London's "tomorrow" is your today.
  renderAnswer('Europe/London', { when: 'after' });
  expect(screen.getByText(/^tomorrow, Saturday 6:00\sam$/)).toBeInTheDocument();
  expect(yourLine()).toHaveTextContent(/^4:00\spm your time$/);
});
