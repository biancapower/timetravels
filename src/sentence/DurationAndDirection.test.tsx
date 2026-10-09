import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { IntlProvider } from 'react-intl';
import { afterEach, expect, test } from 'vitest';
import { App } from '../App';
import { catalogues } from '../i18n/messages';
import { named } from '../testing/named';
import { Answer } from './Answer';

afterEach(() => {
  localStorage.clear();
});

function heading() {
  return screen.getByRole('heading', { level: 1 });
}

async function chooseWhen(current: string, choice: string) {
  fireEvent.click(within(heading()).getByRole('button', { name: current }));
  fireEvent.click(await screen.findByRole('menuitemradio', { name: choice }));
}

test('choosing "from now" rewrites the sentence and adds a duration', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'from now');
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be 1 hour from now here?'),
    }),
  ).toBeInTheDocument();
});

test('choosing "ago" changes the verb to the past', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'ago');
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it 1 hour ago here?'),
    }),
  ).toBeInTheDocument();
});

test('choosing "now" again removes the duration', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'ago');
  await chooseWhen('ago', 'now');
  expect(
    await screen.findByRole('heading', {
      name: named('What time is it now here?'),
    }),
  ).toBeInTheDocument();
});

test('a typed duration sets the slot', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'from now');
  fireEvent.click(within(heading()).getByRole('button', { name: '1 hour' }));
  const input = await screen.findByRole('textbox', { name: 'Type a duration' });
  fireEvent.change(input, { target: { value: '1h30' } });
  fireEvent.submit(input);
  expect(
    await screen.findByRole('heading', {
      name: named('What time will it be 1 hour 30 minutes from now here?'),
    }),
  ).toBeInTheDocument();
});

test('a duration that cannot be read says so and leaves the slot alone', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'from now');
  fireEvent.click(within(heading()).getByRole('button', { name: '1 hour' }));
  const input = await screen.findByRole('textbox', { name: 'Type a duration' });
  fireEvent.change(input, { target: { value: 'soon' } });
  fireEvent.submit(input);
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Couldn’t read that duration',
  );
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(
    within(heading()).getByRole('button', { name: '1 hour' }),
  ).toBeInTheDocument();
});

test('a common duration can be picked with one tap', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'ago');
  fireEvent.click(within(heading()).getByRole('button', { name: '1 hour' }));
  fireEvent.click(await screen.findByRole('button', { name: '8 hours' }));
  expect(
    await screen.findByRole('heading', {
      name: named('What time was it 8 hours ago here?'),
    }),
  ).toBeInTheDocument();
});

function renderAnswer(props: Parameters<typeof Answer>[0]) {
  render(
    <IntlProvider locale="en" messages={catalogues.en}>
      <Answer {...props} />
    </IntlProvider>,
  );
}

// 22:00 Saturday 10 October 2026 in Sydney.
const saturdayNight = Temporal.Instant.from('2026-10-10T11:00:00Z');

test('an answer on the same day shows the weekday and time', () => {
  renderAnswer({
    now: saturdayNight,
    zone: 'Australia/Sydney',
    when: 'earlier',
    duration: { hours: 2, minutes: 0 },
    locale: 'en-AU',
  });
  expect(screen.getByText(/^Saturday 8:00\sp\.?m\.?$/)).toBeInTheDocument();
});

test('an answer tomorrow says tomorrow', () => {
  renderAnswer({
    now: saturdayNight,
    zone: 'Australia/Sydney',
    when: 'later',
    duration: { hours: 10, minutes: 0 },
    locale: 'en-AU',
  });
  expect(screen.getByText(/^tomorrow, Sunday 8:00\sam$/)).toBeInTheDocument();
});

test('an answer yesterday says yesterday', () => {
  renderAnswer({
    now: Temporal.Instant.from('2026-10-09T14:00:00Z'), // 01:00 Saturday in Sydney
    zone: 'Australia/Sydney',
    when: 'earlier',
    duration: { hours: 3, minutes: 0 },
    locale: 'en-AU',
  });
  expect(screen.getByText(/^yesterday, Friday 10:00\spm$/)).toBeInTheDocument();
});

test('24 hours later is still tomorrow', () => {
  renderAnswer({
    now: saturdayNight,
    zone: 'Australia/Sydney',
    when: 'later',
    duration: { hours: 24, minutes: 0 },
    locale: 'en-AU',
  });
  expect(screen.getByText(/^tomorrow, Sunday 10:00\spm$/)).toBeInTheDocument();
});

test('an answer further away gives the date', () => {
  renderAnswer({
    now: saturdayNight,
    zone: 'Australia/Sydney',
    when: 'later',
    duration: { hours: 48, minutes: 0 },
    locale: 'en-AU',
  });
  expect(
    screen.getByText(/^Monday 12 October at 10:00\spm$/),
  ).toBeInTheDocument();
});

test('focus returns to the slot after choosing from the now menu', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  await chooseWhen('now', 'from now');
  const slot = await within(heading()).findByRole('button', {
    name: 'from now',
  });
  await waitFor(() => {
    expect(slot).toHaveFocus();
  });
});
