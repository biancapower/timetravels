import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from '../App';
import { named } from '../testing/named';

// 09:41 on Saturday 10 October 2026 in Sydney, so the next whole hour is
// 10 am. It is 11:41 pm on Friday in London.
beforeEach(() => {
  vi.useFakeTimers({ now: new Date('2026-10-09T22:41:00Z'), toFake: ['Date'] });
  // The full city list is slow to render under jsdom; these need only a few.
  vi.spyOn(Intl, 'supportedValuesOf').mockReturnValue([
    'Asia/Tokyo',
    'Australia/Sydney',
    'Europe/London',
  ]);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

async function choose(current: string, choice: string) {
  fireEvent.click(within(heading()).getByRole('button', { name: current }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: choice }));
}

function open(address: string) {
  history.replaceState(null, '', address);
  render(<App zone="Australia/Sydney" locale="en" />);
}

test('"at a time" asks the time here when it’s a time in another place', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'at a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here when it’s 10 AM here?'),
    }),
  ).toBeInTheDocument();

  // The first "here" is the place; the second is whose time it is, which
  // offers no "in <place>" while the place is here.
  fireEvent.click(
    within(heading()).getAllByRole('button', { name: 'here' })[1] as Element,
  );
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'another place…' }),
  );
  expect(
    screen.queryByRole('menuitemradio', { name: /^in / }),
  ).not.toBeInTheDocument();
  const dialog = await screen.findByRole('dialog', { name: 'Choose a place' });
  fireEvent.change(
    within(dialog).getByRole('combobox', { name: 'Search for a city' }),
    { target: { value: 'lond' } },
  );
  fireEvent.click(within(dialog).getByRole('option', { name: 'London' }));

  // London's today is Friday, so its 10 am has passed: 8 pm Friday here.
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it here when it was 10 AM in London?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^yesterday, Friday 8:00\sPM$/i)).toBeInTheDocument();
  expect(location.search).toBe(
    '?in=Australia/Sydney&when=at&at=10:00&at-in=Europe/London',
  );
});

test('an address with "at" opens the question, with tomorrow’s time', () => {
  open(
    '/?in=Australia/Sydney&when=at&at=10:00&day=tomorrow&at-in=Europe/London',
  );
  expect(
    screen.getByRole('heading', {
      name: named(
        'What time will it be here when it’s 10 AM tomorrow in London?',
      ),
    }),
  ).toBeInTheDocument();
  // 10 am on Saturday in London is 8 pm on Saturday in Sydney.
  expect(screen.getByText(/^Saturday 8:00\sPM$/i)).toBeInTheDocument();
});

test('with a place, the chosen time can be mine, and my time is shown too', async () => {
  open('/?in=Europe/London');
  await choose('right now', 'at a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be in London when it’s 10 AM here?'),
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/^tomorrow, Saturday 12:00\sAM$/i),
  ).toBeInTheDocument();
  expect(screen.getByText(/10:00\sAM your time/i)).toBeInTheDocument();
});

test('a length chosen before doesn’t apply, so a month’s date isn’t shown', async () => {
  open('/?in=Australia/Sydney&when=from-now&for=6mo');
  await choose('from now', 'at a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here when it’s 10 AM here?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Saturday 10:00\sAM$/i)).toBeInTheDocument();
  expect(location.search).not.toContain('for=');
});

test('Back to an “at” question leaves the length chosen before', async () => {
  open('/?in=Australia/Sydney&when=from-now&for=2h');
  history.pushState(
    null,
    '',
    '/?in=Australia/Sydney&when=at&at=10:00&day=tomorrow&at-in=Europe/London',
  );
  act(() => {
    dispatchEvent(new PopStateEvent('popstate'));
  });
  expect(
    screen.getByRole('heading', {
      name: named(
        'What time will it be here when it’s 10 AM tomorrow in London?',
      ),
    }),
  ).toBeInTheDocument();

  await choose('when', 'from now');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here 2 hours from now?'),
    }),
  ).toBeInTheDocument();
});

test('a length in an “at” address is ignored, and tidied away', () => {
  open('/?in=Australia/Sydney&when=at&for=6mo&at=10:00&at-in=Europe/London');
  expect(
    screen.getByRole('heading', {
      name: named('What time was it here when it was 10 AM in London?'),
    }),
  ).toBeInTheDocument();
  expect(location.search).toBe(
    '?in=Australia/Sydney&when=at&at=10:00&at-in=Europe/London',
  );
});

test('another place’s time, once left for “after a time” with no place, leaves the address too', async () => {
  open('/?in=Australia/Sydney&when=at&at=10:00&at-in=Europe/London');
  await choose('when', 'after a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here 1 hour after it’s 10 AM?'),
    }),
  ).toBeInTheDocument();
  expect(location.search).toContain('at-in=Australia/Sydney');
});
