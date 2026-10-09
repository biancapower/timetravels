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
      name: named('What time will it be here 1 hour after 10 AM?'),
    }),
  ).toBeInTheDocument();
});

test('with a place, "my time" switches to the place’s time and changes the answer', async () => {
  pickLondon();
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be in London 1 hour after 10 AM my time?'),
    }),
  ).toBeInTheDocument();
  // 11 am in Sydney is 1 am in London (BST, UTC+1).
  expect(
    screen.getByText(/^tomorrow, Saturday 1:00\sam$/i),
  ).toBeInTheDocument();

  await choose('my time', 'London time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it in London 1 hour after 10 AM London time?'),
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
      name: named('What time will it be here 1 hour after 3 PM tomorrow?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^tomorrow, Sunday 4:00\spm$/i)).toBeInTheDocument();
});

test('the verb is "was it" when the answer is in the past', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'before a time');
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it here 1 hour before 10 AM?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Saturday 9:00\sam$/i)).toBeInTheDocument();
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
            inPlace: false,
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

test('the verb is set by choices, not by the clock passing the answer', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await choose('right now', 'after a time');
  const future = named('What time will it be here 1 hour after 10 AM?');
  expect(
    await screen.findByRole('heading', { name: future }),
  ).toBeInTheDocument();

  // Noon: the answer, 11 am, is now past, but nothing was chosen.
  vi.setSystemTime(new Date('2026-10-10T01:00:00Z'));
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'));
  });
  expect(screen.getByRole('heading', { name: future })).toBeInTheDocument();
});
