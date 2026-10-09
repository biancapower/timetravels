import { act, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { App } from './App';
import { Answer } from './sentence/Answer';
import { Sentence } from './sentence/Sentence';

const { sentenceRenders } = vi.hoisted(() => ({ sentenceRenders: vi.fn() }));

vi.mock('./sentence/Sentence', async (importOriginal) => {
  const original = await importOriginal<typeof import('./sentence/Sentence')>();
  return {
    Sentence: () => {
      sentenceRenders();
      return original.Sentence();
    },
  };
});

afterEach(() => {
  vi.useRealTimers();
  sentenceRenders.mockClear();
});

test('renders the sentence with its two slots', () => {
  render(<Sentence />);
  expect(
    screen.getByRole('heading', { name: 'What time is it now here?' }),
  ).toBeInTheDocument();
});

test('renders the answer for an injected now', () => {
  const now = Temporal.Instant.from('2026-10-03T23:05:00Z');
  render(<Answer now={now} zone="Australia/Sydney" locale="en-AU" />);
  expect(screen.getByText(/^Sunday 10:05\sam$/)).toBeInTheDocument();
  expect(screen.getByText('Sydney (GMT+11)')).toBeInTheDocument();
});

test('the answer updates on the minute without re-rendering the sentence', () => {
  vi.useFakeTimers({ now: new Date('2026-10-03T23:05:30Z') });
  render(<App zone="Australia/Sydney" />);
  expect(screen.getByText(/10:05/)).toBeInTheDocument();
  expect(sentenceRenders).toHaveBeenCalledTimes(1);

  act(() => {
    vi.advanceTimersByTime(30_000);
  });

  expect(screen.getByText(/10:06/)).toBeInTheDocument();
  expect(sentenceRenders).toHaveBeenCalledTimes(1);
});
