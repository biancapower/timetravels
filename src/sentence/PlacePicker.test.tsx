import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { App } from '../App';
import { named } from '../testing/named';

afterEach(() => {
  localStorage.clear();
});

function openPicker(slotName: string) {
  fireEvent.click(screen.getByRole('button', { name: slotName }));
  return screen.getByRole('combobox', { name: 'Search for a city' });
}

test('picking a city puts it in the sentence and the answer', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  const search = openPicker('here');
  fireEvent.change(search, { target: { value: 'lond' } });
  fireEvent.click(await screen.findByRole('option', { name: 'London' }));

  expect(
    await screen.findByRole('heading', {
      name: named('What time is it now in London?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^London \(GMT/)).toBeInTheDocument();
});

test('the chosen place is remembered on this device', async () => {
  const first = render(<App zone="Australia/Sydney" locale="en" />);
  fireEvent.change(openPicker('here'), { target: { value: 'tokyo' } });
  fireEvent.click(await screen.findByRole('option', { name: 'Tokyo' }));
  first.unmount();

  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', {
      name: named('What time is it now in Tokyo?'),
    }),
  ).toBeInTheDocument();
});

test('choosing Here goes back to the device’s own place and forgets the city', async () => {
  localStorage.setItem(
    'timetravels.place',
    JSON.stringify({ city: 'London', zone: 'Europe/London' }),
  );
  render(<App zone="Australia/Sydney" locale="en" />);
  openPicker('London');
  fireEvent.click(await screen.findByRole('option', { name: 'Here' }));

  expect(
    await screen.findByRole('heading', {
      name: named('What time is it now here?'),
    }),
  ).toBeInTheDocument();
  expect(screen.getByText(/^Sydney \(GMT/)).toBeInTheDocument();
  expect(localStorage.getItem('timetravels.place')).toBeNull();
});

test('a search with no matches says so', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  fireEvent.change(openPicker('here'), { target: { value: 'atlantis' } });
  expect(await screen.findByText('No matching places')).toBeInTheDocument();
});

test('the slot is a button that opens a labelled dialog holding a listbox', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  const slot = screen.getByRole('button', { name: 'here' });
  expect(slot).toHaveAttribute('aria-haspopup', 'dialog');
  expect(slot).toHaveAttribute('aria-expanded', 'false');

  openPicker('here');
  expect(slot).toHaveAttribute('aria-expanded', 'true');
  const dialog = await screen.findByRole('dialog', { name: 'Choose a place' });
  expect(
    within(dialog).getByRole('combobox', { name: 'Search for a city' }),
  ).toBeInTheDocument();
  expect(within(dialog).getByRole('listbox')).toBeInTheDocument();
});

test('Here is offered first, and only until a search is typed', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  const search = openPicker('here');
  const options = await screen.findAllByRole('option');
  expect(options[0]).toHaveTextContent('Here');

  fireEvent.change(search, { target: { value: 'syd' } });
  expect(
    await screen.findByRole('option', { name: 'Sydney' }),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('option', { name: 'Here' }),
  ).not.toBeInTheDocument();
});
