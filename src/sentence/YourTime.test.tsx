import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect, test } from 'vitest';
import { catalogues } from '../i18n/messages';
import { question } from '../testing/question';
import { Answer } from './Answer';
import type { Question } from './resolveAnswer';

// 9:41 am on Saturday 10 October 2026 in Sydney (GMT+11).
const now = Temporal.Instant.from('2026-10-09T22:41:00Z');

function renderAnswer(answerZone: string, overrides: Partial<Question> = {}) {
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer
        now={now}
        question={question(answerZone, {
          deviceZone: 'Australia/Sydney',
          ...overrides,
        })}
        locale="en-AU"
      />
    </IntlProvider>,
  );
}

test('another place’s answer gives your time, without the day when it’s the same', () => {
  renderAnswer('Asia/Tokyo');
  expect(screen.getByText(/^Saturday 7:41\sam$/)).toBeInTheDocument();
  expect(screen.getByText(/^9:41\sam your time$/)).toBeInTheDocument();
});

test('your day is named when it differs from the place’s', () => {
  renderAnswer('Europe/London');
  expect(screen.getByText(/^Friday 11:41\spm$/)).toBeInTheDocument();
  expect(screen.getByText(/^Saturday 9:41\sam your time$/)).toBeInTheDocument();
});

test('a place ahead of you gives your earlier time, on your day', () => {
  // 9:41 am in Sydney is 11:41 am in Auckland (GMT+13).
  renderAnswer('Pacific/Auckland');
  expect(screen.getByText(/^9:41\sam your time$/)).toBeInTheDocument();
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
  expect(
    screen.getByText(/^Saturday 10 April 2027 at 8:41\sam your time$/),
  ).toBeInTheDocument();
});
