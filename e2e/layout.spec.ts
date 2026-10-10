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
