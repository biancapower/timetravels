import { render, screen } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from '../App';
import { catalogues } from '../i18n/messages';
import { question } from '../testing/question';
import { Answer } from './Answer';
import { Sentence } from './Sentence';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

test('the answer formats dates in the interface’s locale when given none', () => {
  // 22:00 on Saturday 3 October in Sydney; the next 24 hours cross the
  // clock change, so the note names its date.
  render(
    <IntlProvider locale="en-AU" messages={catalogues.en}>
      <Answer
        now={Temporal.Instant.from('2026-10-03T12:00:00Z')}
        question={question('Australia/Sydney', {
          when: 'later',
          duration: { hours: 24, minutes: 0 },
        })}
      />
    </IntlProvider>,
  );
  expect(screen.getByText(/on Sunday 4 October,/)).toBeInTheDocument();
});

test('the sentence’s chosen time follows the interface’s locale', () => {
  render(
    <IntlProvider locale="en-GB" messages={catalogues.en}>
      <Sentence
        when="after"
        duration={{ hours: 1, minutes: 0 }}
        place={null}
        places={[]}
        onWhenChange={vi.fn()}
        onDurationChange={vi.fn()}
        onPlaceChange={vi.fn()}
        anchor={{
          time: Temporal.PlainTime.from('15:00'),
          day: 0,
          inPlace: false,
        }}
        tense="future"
        onAnchorChange={vi.fn()}
      />
    </IntlProvider>,
  );
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
    /after 15:00\s*\?$/,
  );
});

test('the app formats with the browser’s first preferred language', () => {
  // The test proves nothing where the machine's own default is British.
  const machine = new Intl.Locale(
    new Intl.DateTimeFormat().resolvedOptions().locale,
  );
  expect(machine.region).not.toBe('GB');
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB', 'en']);
  vi.useFakeTimers({ now: new Date('2026-10-04T06:05:00Z') });
  render(<App zone="Australia/Sydney" />);
  expect(screen.getByText(/^Sunday 17:05$/)).toBeInTheDocument();
});
