import { render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { expect, test, vi } from 'vitest';
import { catalogues, type Messages } from '../i18n/messages';
import { Sentence } from './Sentence';

// A test-only locale that puts the slots in the other order.
const reordered: Messages = {
  ...catalogues.en,
  'sentence.nowHere':
    '<place>Here</place> and <now>now</now>: what time is it?',
};

test('the sentence follows the message, so a translation can reorder the slots', () => {
  render(
    <IntlProvider locale="en" messages={reordered}>
      <Sentence place={null} places={[]} onPlaceChange={vi.fn()} />
    </IntlProvider>,
  );
  const heading = screen.getByRole('heading', {
    name: 'Here and now: what time is it?',
  });
  const here = within(heading).getByText('Here', { exact: true });
  const now = within(heading).getByText('now', { exact: true });
  expect(
    here.compareDocumentPosition(now) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});
