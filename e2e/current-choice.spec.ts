import { expect, test, type Locator } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

/** Whether the row shows the tick that marks the current choice. */
const ticked = (row: Locator) =>
  row.evaluate((element) =>
    getComputedStyle(element, '::after').content.includes('✓'),
  );

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'timetravels.place',
      JSON.stringify({ city: 'London', zone: 'Europe/London' }),
    );
  });
  await page.goto('/');
});

test('the time menu ticks the current choice, and checks it', async ({
  page,
}) => {
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  const now = page.getByRole('menuitemradio', { name: 'right now' });
  await expect(now).toBeChecked();
  expect(await ticked(now)).toBe(true);
  const later = page.getByRole('menuitemradio', { name: 'from now' });
  await expect(later).not.toBeChecked();
  expect(await ticked(later)).toBe(false);
});

test('the duration picker ticks the common duration that matches, and marks it current', async ({
  page,
}) => {
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'from now' }).click();
  await heading.getByRole('button', { name: '1 hour' }).click();
  const durations = page.getByRole('group', { name: 'Common durations' });
  const hour = durations.getByRole('button', { name: '1 hour' });
  await expect(hour).toHaveAttribute('aria-current', 'true');
  expect(await ticked(hour)).toBe(true);
  const halfHour = durations.getByRole('button', { name: '30 minutes' });
  await expect(halfHour).not.toHaveAttribute('aria-current');
  expect(await ticked(halfHour)).toBe(false);

  await page.getByRole('textbox', { name: 'Type a duration' }).fill('90m');
  await page.keyboard.press('Enter');
  await heading.getByRole('button', { name: '1 hour 30 minutes' }).click();
  await expect(durations.locator('[aria-current]')).toHaveCount(0);

  await page.getByRole('textbox', { name: 'Type a duration' }).fill('24h');
  await page.keyboard.press('Enter');
  await heading.getByRole('button', { name: '24 hours' }).click();
  await expect(
    durations.getByRole('button', { name: '24 hours' }),
  ).toHaveAttribute('aria-current', 'true');
  await expect(durations.locator('[aria-current]')).toHaveCount(1);
});

test('the place list ticks the current place, and selects it', async ({
  page,
}) => {
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'London' }).click();
  const london = page.getByRole('option', { name: 'London' });
  await expect(london).toHaveAttribute('aria-selected', 'true');
  expect(await ticked(london)).toBe(true);
  const here = page.getByRole('option', { name: 'Here' });
  await expect(here).toHaveAttribute('aria-selected', 'false');
  expect(await ticked(here)).toBe(false);
});

test('the whose-time menu ticks the current choice, and checks it', async ({
  page,
}) => {
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'after a time' }).click();
  await heading.getByRole('button', { name: 'here' }).click();
  const here = page.getByRole('menuitemradio', { name: 'here' });
  await expect(here).toBeChecked();
  expect(await ticked(here)).toBe(true);
  expect(
    await ticked(page.getByRole('menuitem', { name: 'another place…' })),
  ).toBe(false);
});
