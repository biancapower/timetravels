import { render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect, test, vi } from 'vitest';
import { catalogues, type Messages } from '../i18n/messages';
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
  for (const place of [null, london]) {
    test(`the closing “?” is grouped with the slot before it: ${when}, ${place ? 'a place' : 'here'}`, () => {
      render(
        <IntlProvider locale="en" messages={catalogues.en}>
          <Sentence
            when={when}
            duration={{ hours: 1, minutes: 0 }}
            place={place}
            places={[london]}
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
      const heading = screen.getByRole('heading', { level: 1 });
      const slots = within(heading).getAllByRole('button');
      const group = slots.at(-1)?.parentElement;
      expect(group).not.toBe(heading);
      expect(group?.textContent).toMatch(/\?$/);
    });
  }
}
