import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

const time = (page: Page) =>
  page.getByText(/^\p{L}+,? \d{1,2}:\d{2}(\s?[ap]m)?$/iu);

test('the answer sits at the foot of the screen, below the sentence', async ({
  page,
}) => {
  await page.goto('/');
  const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
  const answer = await time(page).boundingBox();
  const viewport = page.viewportSize();
  if (!heading || !answer || !viewport) throw new Error('nothing to measure');
  expect(heading.y).toBeLessThan(viewport.height / 4);
  expect(answer.y).toBeGreaterThan(viewport.height / 2);
  expect(answer.y + answer.height).toBeLessThanOrEqual(viewport.height);
});

test('each slot has a wavy underline', async ({ page }) => {
  await page.goto('/');
  const slots = page.getByRole('heading', { level: 1 }).getByRole('button');
  await expect(slots).toHaveCount(2);
  for (const slot of await slots.all()) {
    await expect(slot).toHaveCSS('text-decoration-style', 'wavy');
  }
});

test('the longest sentence fits 360 px without scrolling sideways', async ({
  page,
}) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem(
      'timetravels.place',
      JSON.stringify({ city: 'London', zone: 'Europe/London' }),
    );
  });
  await page.reload();
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'after a time' }).click();
  await expect(heading.getByRole('button', { name: 'my time' })).toBeVisible();
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test('the longest weekday fits the answer at 360 px', async ({ page }) => {
  // 10 pm on a Tuesday in Sydney, so 10 hours from now is Wednesday.
  await page.clock.install({ time: new Date('2026-10-13T11:00:00Z') });
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'from now' }).click();
  await heading.getByRole('button', { name: '1 hour' }).click();
  await page.getByRole('button', { name: '10 hours' }).click();
  const answer = page.getByText(/^tomorrow, Wednesday \d{1,2}:\d{2}\s?[ap]m$/i);
  await expect(answer).toBeVisible();
  const overflow = await answer.evaluate(
    (element) => element.scrollWidth - element.clientWidth,
  );
  expect(overflow).toBe(0);
});
