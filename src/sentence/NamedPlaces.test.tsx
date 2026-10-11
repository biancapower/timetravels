import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { App } from '../App';
import { named } from '../testing/named';

afterEach(() => {
  localStorage.clear();
});

function remember(saved: unknown, chosen: unknown) {
  localStorage.setItem('timetravels.savedPlaces', JSON.stringify(saved));
  localStorage.setItem('timetravels.place', JSON.stringify(chosen));
}

const london = { city: 'London', zone: 'Europe/London' };

test('a chosen named place reads “at” its name, and the answer names it and its city', () => {
  remember(
    { home: null, named: [{ name: 'Mark’s place', place: london }] },
    {
      name: 'Mark’s place',
    },
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it at Mark’s place right now?'),
    }),
  ).toBeInTheDocument();
  expect(
    screen.getByText(/^Mark’s place \(London, GMT[+−-]?\d*\)$/),
  ).toBeInTheDocument();
});

test('a chosen home reads “at home”, and the answer says Home and its city', () => {
  remember({ home: london, named: [] }, { home: true });
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it at home right now?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Home \(London, GMT/)).toBeInTheDocument();
});

test('a saved place in a zone this browser doesn’t know falls back to here', () => {
  remember(
    {
      home: null,
      named: [{ name: 'Lost', place: { city: 'Atlantis', zone: 'X/Y' } }],
    },
    { name: 'Lost' },
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it here right now?'),
    }),
  ).toBeInTheDocument();
});

function openPicker(slotName: string) {
  fireEvent.click(screen.getByRole('button', { name: slotName }));
}

async function openForm(option: string | RegExp, title: string) {
  fireEvent.click(await screen.findByRole('option', { name: option }));
  return screen.findByRole('dialog', { name: title });
}

function choosePlace(form: HTMLElement, search: string, city: string) {
  fireEvent.change(
    within(form).getByRole('combobox', { name: 'Search for a city' }),
    { target: { value: search } },
  );
  fireEvent.click(within(form).getByRole('option', { name: city }));
}

test('home is set up from the picker, starting at the device’s own place', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('here');
  const form = await openForm(/^Home/, 'Where is home?');
  expect(within(form).getByText('Place: Sydney')).toBeInTheDocument();
  expect(form).toHaveTextContent('What time is it at home right now?');

  fireEvent.click(within(form).getByRole('button', { name: 'Save' }));
  expect(
    await screen.findByRole('heading', {
      name: named('What time is it at home right now?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Home \(Sydney, GMT/)).toBeInTheDocument();
});

test('home can be anywhere, not only where the device is', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('here');
  const form = await openForm(/^Home/, 'Where is home?');
  choosePlace(form, 'lond', 'London');
  fireEvent.click(within(form).getByRole('button', { name: 'Save' }));
  expect(await screen.findByText(/^Home \(London, GMT/)).toBeInTheDocument();
});

test('a place is named, previewed, saved and chosen', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('here');
  const form = await openForm('Name a place', 'Name a place');
  fireEvent.change(within(form).getByRole('textbox', { name: 'Name' }), {
    target: { value: 'Mark’s place' },
  });
  choosePlace(form, 'lond', 'London');
  expect(form).toHaveTextContent('What time is it at Mark’s place right now?');

  fireEvent.click(within(form).getByRole('button', { name: 'Save' }));
  expect(
    await screen.findByRole('heading', {
      name: named('What time is it at Mark’s place right now?'),
    }),
  ).toBeInTheDocument();
  expect(
    JSON.parse(localStorage.getItem('timetravels.savedPlaces') ?? 'null'),
  ).toEqual({
    home: null,
    named: [{ name: 'Mark’s place', place: london }],
  });
});

test('a name that is empty, the app’s own word, or taken is refused with a reason', async () => {
  remember({ home: null, named: [{ name: 'Office', place: london }] }, null);
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('here');
  const form = await openForm('Name a place', 'Name a place');
  const name = within(form).getByRole('textbox', { name: 'Name' });
  const save = within(form).getByRole('button', { name: 'Save' });

  fireEvent.click(save);
  expect(within(form).getByRole('alert')).toHaveTextContent(
    'Give the place a name.',
  );
  fireEvent.change(name, { target: { value: 'HOME' } });
  expect(within(form).getByRole('alert')).toHaveTextContent(
    '“HOME” is already one of the choices.',
  );
  fireEvent.change(name, { target: { value: 'office' } });
  expect(within(form).getByRole('alert')).toHaveTextContent(
    'You already have a place called “office”.',
  );
  expect(name).toHaveAccessibleDescription(
    'You already have a place called “office”.',
  );
  fireEvent.change(name, { target: { value: 'a'.repeat(31) } });
  expect(within(form).getByRole('alert')).toHaveTextContent(
    'Keep the name to 30 characters or fewer.',
  );
  fireEvent.change(name, { target: { value: 'Gym' } });
  fireEvent.click(save);
  expect(within(form).getByRole('alert')).toHaveTextContent(
    'Choose a place for it.',
  );
  expect(name).not.toHaveAttribute('aria-describedby');
  expect(name).not.toHaveAttribute('aria-invalid');
});

test('a chosen named place is renamed and moved with Edit, and the sentence follows', async () => {
  remember(
    { home: null, named: [{ name: 'Mark’s place', place: london }] },
    {
      name: 'Mark’s place',
    },
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('Mark’s place');
  const form = await openForm('Edit Mark’s place', 'Change Mark’s place');
  fireEvent.change(within(form).getByRole('textbox', { name: 'Name' }), {
    target: { value: 'Mark' },
  });
  choosePlace(form, 'tokyo', 'Tokyo');
  fireEvent.click(within(form).getByRole('button', { name: 'Save' }));

  expect(
    await screen.findByRole('heading', {
      name: named('What time is it at Mark right now?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Mark \(Tokyo, GMT/)).toBeInTheDocument();
});

test('removing the chosen named place goes back to here', async () => {
  remember(
    { home: null, named: [{ name: 'Mark’s place', place: london }] },
    {
      name: 'Mark’s place',
    },
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('Mark’s place');
  const form = await openForm('Edit Mark’s place', 'Change Mark’s place');
  fireEvent.click(within(form).getByRole('button', { name: 'Remove' }));

  expect(
    await screen.findByRole('heading', {
      name: named('What time is it here right now?'),
    }),
  ).toBeInTheDocument();
  openPicker('here');
  expect(
    screen.queryByRole('option', { name: /Mark’s place/ }),
  ).not.toBeInTheDocument();
});

test('Cancel leaves everything as it was', async () => {
  remember({ home: london, named: [] }, { home: true });
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('home');
  const form = await openForm('Edit Home', 'Where is home?');
  choosePlace(form, 'tokyo', 'Tokyo');
  fireEvent.click(within(form).getByRole('button', { name: 'Cancel' }));
  expect(screen.getByText(/^Home \(London, GMT/)).toBeInTheDocument();
});

test('typing the start of “Name a place” offers it', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('here');
  fireEvent.change(
    screen.getByRole('combobox', { name: 'Search for a city' }),
    {
      target: { value: 'name' },
    },
  );
  expect(
    await screen.findByRole('option', { name: 'Name a place' }),
  ).toBeInTheDocument();
});
