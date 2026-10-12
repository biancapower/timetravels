import { render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect, test, vi } from 'vitest';
import { catalogues, type Messages } from '../i18n/messages';
import { noSavedPlaces, type Where } from '../places/named';
import { Sentence } from './Sentence';
import { named } from '../testing/named';

// A test-only locale that puts the slots in the other order.
const reordered: Messages = {
  ...catalogues.en,
  'sentence.nowHere':
    '<place>Here</place> and <direction>now</direction>: what time is it?',
};

test('the sentence follows the message, so a translation can reorder the slots', () => {
  render(
    <IntlProvider locale="en" messages={reordered}>
      <Sentence
        when="now"
        duration={{ hours: 1, minutes: 0 }}
        where={null}
        places={[]}
        saved={noSavedPlaces}
        onSavedChange={vi.fn()}
        onWhenChange={vi.fn()}
        onDurationChange={vi.fn()}
        onPlaceChange={vi.fn()}
        anchor={{
          time: Temporal.PlainTime.from('15:00'),
          day: 0,
          whose: 'mine',
        }}
        tense="future"
        onAnchorChange={vi.fn()}
      />
    </IntlProvider>,
  );
  const heading = screen.getByRole('heading', {
    name: named('Here and now: what time is it?'),
  });
  const here = within(heading).getByText('Here', { exact: true });
  const now = within(heading).getByText('now', { exact: true });
  expect(
    here.compareDocumentPosition(now) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

// The group's CSS keeps it on one line; jsdom doesn't apply CSS modules, so
// this checks the grouping the style hangs on.
const london = { city: 'London', zone: 'Europe/London' };
for (const when of ['now', 'later', 'earlier', 'after', 'before'] as const) {
  for (const where of [null, { kind: 'city', place: london } as const]) {
    test(`the closing “?” is grouped with the slot before it: ${when}, ${where ? 'a place' : 'here'}`, () => {
      render(
        <IntlProvider locale="en" messages={catalogues.en}>
          <Sentence
            when={when}
            duration={{ hours: 1, minutes: 0 }}
            where={where}
            places={[london]}
            saved={noSavedPlaces}
            onSavedChange={vi.fn()}
            onWhenChange={vi.fn()}
            onDurationChange={vi.fn()}
            onPlaceChange={vi.fn()}
            anchor={{
              time: Temporal.PlainTime.from('15:00'),
              day: 0,
              whose: 'mine',
            }}
            tense="future"
            onAnchorChange={vi.fn()}
          />
        </IntlProvider>,
      );
      const heading = screen.getByRole('heading', { level: 1 });
      const slots = within(heading).getAllByRole('button');
      const group = slots.at(-1)?.parentElement;
      expect(group).not.toBe(heading);
      expect(group?.textContent).toMatch(/\?$/);
    });
  }
}

const wording = [
  [
    'now',
    'What time is it at Mark’s place right now?',
    'What time is it at home right now?',
  ],
  [
    'later',
    'What time will it be at Mark’s place 1 hour from now?',
    'What time will it be at home 1 hour from now?',
  ],
  [
    'earlier',
    'What time was it at Mark’s place 1 hour ago?',
    'What time was it at home 1 hour ago?',
  ],
  [
    'after',
    'What time will it be at Mark’s place 1 hour after 3 PM my time?',
    'What time will it be at home 1 hour after 3 PM my time?',
  ],
  [
    'before',
    'What time will it be at Mark’s place 1 hour before 3 PM my time?',
    'What time will it be at home 1 hour before 3 PM my time?',
  ],
] as const;
for (const [when, atMark, atHome] of wording) {
  test(`a named place and home read “at”: ${when}`, () => {
    const sentence = (where: Where) => (
      <IntlProvider locale="en" messages={catalogues.en}>
        <Sentence
          when={when}
          duration={{ hours: 1, minutes: 0 }}
          where={where}
          places={[london]}
          saved={noSavedPlaces}
          onSavedChange={vi.fn()}
          onWhenChange={vi.fn()}
          onDurationChange={vi.fn()}
          onPlaceChange={vi.fn()}
          anchor={{
            time: Temporal.PlainTime.from('15:00'),
            day: 0,
            whose: 'mine',
          }}
          tense="future"
          onAnchorChange={vi.fn()}
        />
      </IntlProvider>
    );
    const { rerender } = render(
      sentence({ kind: 'named', name: 'Mark’s place', place: london }),
    );
    expect(
      screen.getByRole('heading', { level: 1, name: named(atMark) }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mark’s place' }),
    ).toBeInTheDocument();

    rerender(sentence({ kind: 'home', place: london }));
    expect(
      screen.getByRole('heading', { level: 1, name: named(atHome) }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'home' })).toBeInTheDocument();
  });
}
