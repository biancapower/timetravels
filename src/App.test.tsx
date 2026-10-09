import { act, render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { catalogues } from './i18n/messages';
import { Answer } from './sentence/Answer';
import { Sentence } from './sentence/Sentence';
import { named } from './testing/named';

const { sentenceRenders } = vi.hoisted(() => ({ sentenceRenders: vi.fn() }));

vi.mock('./sentence/Sentence', async (importOriginal) => {
  const original = await importOriginal<typeof import('./sentence/Sentence')>();
  return {
    Sentence: (props: Parameters<typeof original.Sentence>[0]) => {
      sentenceRenders();
      return original.Sentence(props);
    },
  };
});

afterEach(() => {
  vi.useRealTimers();
  sentenceRenders.mockClear();
});

test('renders the sentence with its two slots', () => {
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Sentence
        when="now"
        duration={{ hours: 1, minutes: 0 }}
        place={null}
        places={[]}
        onWhenChange={vi.fn()}
        onDurationChange={vi.fn()}
        onPlaceChange={vi.fn()}
      />
    </IntlProvider>,
  );
  const heading = screen.getByRole('heading', {
    name: named('What time is it here right now?'),
  });
  expect(heading).toBeInTheDocument();
  for (const slot of ['here', 'right now']) {
    expect(
      within(heading).getByText(slot, { exact: true }),
    ).toBeInTheDocument();
  }
});

test('renders the answer for an injected now', () => {
  const now = Temporal.Instant.from('2026-10-03T23:05:00Z');
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer now={now} zone="Australia/Sydney" locale="en-AU" />
    </IntlProvider>,
  );
  expect(screen.getByText(/^Sunday 10:05\sam$/)).toBeInTheDocument();
  expect(screen.getByText('Sydney (GMT+11)')).toBeInTheDocument();
});

test('the answer uses a 24-hour clock where the locale prefers it', () => {
  const now = Temporal.Instant.from('2026-10-04T06:05:00Z');
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer now={now} zone="Australia/Sydney" locale="en-GB" />
    </IntlProvider>,
  );
  expect(screen.getByText(/^Sunday 17:05$/)).toBeInTheDocument();
});

test('the answer updates on the minute without re-rendering the sentence', () => {
  vi.useFakeTimers({ now: new Date('2026-10-03T23:05:30Z') });
  render(<App zone="Australia/Sydney" />);
  expect(screen.getByText(/10:05/)).toBeInTheDocument();
  expect(sentenceRenders).toHaveBeenCalledTimes(1);

  act(() => {
    vi.advanceTimersByTime(30_000);
  });

  expect(screen.getByText(/10:06/)).toBeInTheDocument();
  expect(sentenceRenders).toHaveBeenCalledTimes(1);
});

test('the answer catches up as soon as the page is visible again', () => {
  vi.useFakeTimers({ now: new Date('2026-10-03T23:05:30Z') });
  render(<App zone="Australia/Sydney" />);
  expect(screen.getByText(/10:05/)).toBeInTheDocument();

  // A sleeping device moves the clock on without firing timers.
  vi.setSystemTime(new Date('2026-10-03T23:20:10Z'));
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });

  expect(screen.getByText(/10:20/)).toBeInTheDocument();
});
