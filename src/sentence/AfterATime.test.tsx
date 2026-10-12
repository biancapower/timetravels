import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { App } from '../App';
import { catalogues } from '../i18n/messages';
import { named } from '../testing/named';
import { question } from '../testing/question';
import { Answer } from './Answer';

// 09:41 on Saturday 10 October 2026 in Sydney, so the next whole hour is 10 am.
const saturdayMorning = new Date('2026-10-09T22:41:00Z');

beforeEach(() => {
  vi.useFakeTimers({ now: saturdayMorning, toFake: ['Date'] });
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.clear();
});

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

async function choose(current: string, choice: string) {
  fireEvent.click(within(heading()).getByRole('button', { name: current }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: choice }));
}

function pickLondon() {
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'London', zone: 'Europe/London' }),
  );
}

test('choosing "after a time" anchors on the next whole hour', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here 1 hour after it’s 10 AM?'),
    }),
  ).toBeInTheDocument();
});

test('with a place, "here" switches to the place’s time and changes the answer', async () => {
  pickLondon();
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  expect(
    await screen.findByRole('heading', {
      name: named(
        'What time will it be in London 1 hour after it’s 10 AM here?',
      ),
    }),
  ).toBeInTheDocument();
  // 11 am in Sydney is 1 am in London (BST, UTC+1).
  expect(
    screen.getByText(/^tomorrow, Saturday 1:00\sam$/i),
  ).toBeInTheDocument();

  await choose('here', 'in London');
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it in London 1 hour after 10 AM in London?'),
    }),
  ).toBeInTheDocument();
  // "Today" is London's Friday, so 10 AM plus an hour is already past.
  expect(screen.getByText(/^Friday 11:00\sam$/i)).toBeInTheDocument();
});

test('the dialog sets the time and the day', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  fireEvent.click(within(heading()).getByRole('button', { name: '10 AM' }));
  const dialog = await screen.findByRole('dialog', { name: 'Choose a time' });
  fireEvent.change(within(dialog).getByLabelText('Time'), {
    target: { value: '15:00' },
  });
  const day = within(dialog).getByRole('group', { name: 'Day' });
  fireEvent.click(within(day).getByRole('radio', { name: 'Tomorrow' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Set' }));
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here 1 hour after it’s 3 PM tomorrow?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^tomorrow, Sunday 4:00\spm$/i)).toBeInTheDocument();
});

test('the verb is "was it" when the answer is in the past', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'before a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it here 1 hour before it’s 10 AM?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Saturday 9:00\sam$/i)).toBeInTheDocument();
});

async function chooseAnotherPlace(search: string, city: string) {
  fireEvent.click(within(heading()).getByRole('button', { name: 'here' }));
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'another place…' }),
  );
  const dialog = await screen.findByRole('dialog', { name: 'Choose a place' });
  fireEvent.change(
    within(dialog).getByRole('combobox', { name: 'Search for a city' }),
    { target: { value: search } },
  );
  fireEvent.click(within(dialog).getByRole('option', { name: city }));
}

test('another place’s time is judged by its own today, and is remembered', async () => {
  pickLondon();
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  await chooseAnotherPlace('los', 'Los Angeles');
  // Today is Los Angeles' Friday: 10 AM there is 6 pm in London, so an hour
  // on is already past.
  expect(
    await screen.findByRole('heading', {
      name: named(
        'What time was it in London 1 hour after 10 AM in Los Angeles?',
      ),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Friday 7:00\spm$/i)).toBeInTheDocument();
  expect(
    JSON.parse(localStorage.getItem('timetravels.anchorPlace') ?? 'null'),
  ).toEqual({ city: 'Los Angeles', zone: 'America/Los_Angeles' });

  await choose('in Los Angeles', 'here');
  expect(
    await screen.findByRole('heading', {
      name: named(
        'What time will it be in London 1 hour after it’s 10 AM here?',
      ),
    }),
  ).toBeInTheDocument();
  expect(localStorage.getItem('timetravels.anchorPlace')).toBeNull();
});

test.each([
  ['unreadable', '{not json'],
  ['no longer offered', JSON.stringify({ city: 'Atlantis', zone: 'X/Y' })],
])(
  'a remembered third place that is %s falls back to here',
  async (_, stored) => {
    pickLondon();
    localStorage.setItem('timetravels.anchorPlace', stored);
    render(<App zone="Australia/Sydney" locale="en" />);
    await choose('right now', 'after a time');
    expect(
      await screen.findByRole('heading', {
        name: named(
          'What time will it be in London 1 hour after it’s 10 AM here?',
        ),
      }),
    ).toBeInTheDocument();
  },
);

test('a remembered third place reads in the sentence, and its skipped time names it', async () => {
  // 10 am on Saturday 3 October in Sydney; its clocks go forward at 2 am
  // tomorrow.
  vi.setSystemTime(new Date('2026-10-03T00:00:00Z'));
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'Tokyo', zone: 'Asia/Tokyo' }),
  );
  localStorage.setItem(
    'timetravels.anchorPlace',
    JSON.stringify({ city: 'Sydney', zone: 'Australia/Sydney' }),
  );
  render(<App zone="Europe/London" locale="en" />);
  await choose('right now', 'after a time');
  fireEvent.click(within(heading()).getByRole('button', { name: /AM$/ }));
  const dialog = await screen.findByRole('dialog', { name: 'Choose a time' });
  fireEvent.change(within(dialog).getByLabelText('Time'), {
    target: { value: '02:30' },
  });
  const day = within(dialog).getByRole('group', { name: 'Day' });
  fireEvent.click(within(day).getByRole('radio', { name: 'Tomorrow' }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Set' }));
  expect(
    await screen.findByRole('heading', {
      name: named(
        'What time will it be in Tokyo 1 hour after it’s 2:30 AM tomorrow in Sydney?',
      ),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^There was no 2:30\sam in Sydney/i)).toBeVisible();
});

function renderAnswer(now: string, time: string, zoneDay = 0) {
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer
        now={Temporal.Instant.from(now)}
        question={question('Australia/Sydney', {
          when: 'after',
          anchor: {
            time: Temporal.PlainTime.from(time),
            day: zoneDay as -1 | 0 | 1,
            whose: 'mine',
          },
        })}
        anchorCity="Sydney"
        locale="en-AU"
      />
    </IntlProvider>,
  );
}

test('a chosen time the clocks skipped gets a note', () => {
  // Saturday 3 October 2026 in Sydney; the clocks go forward at 2 am the next day.
  renderAnswer('2026-10-03T00:00:00Z', '02:30', 1);
  expect(screen.getByText(/^There was no 2:30\sam in Sydney/)).toBeVisible();
});

test('a chosen time the clocks repeated gets a note', () => {
  // Saturday 4 April 2026 in Sydney; the clocks go back at 3 am the next day.
  renderAnswer('2026-04-04T00:00:00Z', '02:30', 1);
  const note = screen.getByText(/happened twice in Sydney/);
  expect(note).toHaveTextContent(/GMT\+11/);
});

test('a chosen time that has passed drops “it’s”, whatever the answer’s tense', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  fireEvent.click(within(heading()).getByRole('button', { name: '10 AM' }));
  const dialog = await screen.findByRole('dialog', { name: 'Choose a time' });
  fireEvent.change(within(dialog).getByLabelText('Time'), {
    target: { value: '09:00' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Set' }));
  // 9 AM has passed; an hour on, 10 AM, is still to come.
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be here 1 hour after 9 AM?'),
    }),
  ).toBeInTheDocument();
});

test('the verb and “it’s” are set by choices, not by the clock passing them', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  const future = named('What time will it be here 1 hour after it’s 10 AM?');
  expect(
    await screen.findByRole('heading', { name: future }),
  ).toBeInTheDocument();

  // Noon: 10 am and the answer, 11 am, are now past, but nothing was chosen.
  vi.setSystemTime(new Date('2026-10-10T01:00:00Z'));
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(screen.getByRole('heading', { name: future })).toBeInTheDocument();
});
