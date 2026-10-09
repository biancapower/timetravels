import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { App } from '../App';

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
      name: /^What time is it now in London ?\?$/,
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
    screen.getByRole('heading', { name: /^What time is it now in Tokyo ?\?$/ }),
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
      name: /^What time is it now here ?\?$/,
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
