import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import { App } from '../App';

afterEach(() => {
  history.replaceState(null, '', '/');
});

const sentence = () => screen.getByRole('heading', { level: 1 });

test('the help button opens the guide, and Close returns focus to it', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  const help = screen.getByRole('button', { name: 'Help' });
  fireEvent.click(help);

  const title = screen.getByRole('heading', { name: 'How TimeTravels works' });
  expect(title).toHaveFocus();
  expect(location.hash).toBe('#help');
  expect(screen.getByText(/1h30 or 1:30/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(await screen.findByRole('button', { name: 'Help' })).toHaveFocus();
  expect(sentence()).toHaveTextContent(/^What time is it here/);
});

test('Escape closes the guide', async () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  fireEvent.click(screen.getByRole('button', { name: 'Help' }));
  fireEvent.keyDown(document, { key: 'Escape' });
  expect(await screen.findByRole('button', { name: 'Help' })).toHaveFocus();
});

test('Privacy in the footer opens About at its Privacy section', () => {
  render(<App zone="Australia/Sydney" locale="en" />);
  fireEvent.click(screen.getByRole('link', { name: 'Privacy' }));
  expect(
    screen.getByRole('heading', { name: 'About TimeTravels' }),
  ).toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Privacy' })).toHaveFocus();
  expect(location.hash).toBe('#privacy');
});

test('an address with #about opens About, and Close drops the hash', () => {
  history.replaceState(null, '', '/#about');
  render(<App zone="Australia/Sydney" locale="en" />);
  expect(
    screen.getByRole('heading', { name: 'About TimeTravels' }),
  ).toHaveFocus();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(location.hash).toBe('');
  expect(sentence()).toHaveTextContent(/^What time is it here/);
});
