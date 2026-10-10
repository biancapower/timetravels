import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

async function tabOrder(page: Page, count: number) {
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    await page.keyboard.press('Tab');
    names.push(
      await page.evaluate(() => document.activeElement?.textContent ?? ''),
    );
  }
  return names;
}

test('Tab reaches every slot of sentence 1 in reading order', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  expect(await tabOrder(page, 2)).toEqual(['here', 'right now']);
});

test('Tab reaches every slot of sentence 5 in reading order', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem(
      'timetravels.place',
      JSON.stringify({ city: 'London', zone: 'Europe/London' }),
    );
  });
  await page.reload();
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).focus();
  await page.keyboard.press('Enter');
  await page
    .getByRole('menuitemradio', { name: 'after a time' })
    .press('Enter');
  await expect(heading.getByRole('button', { name: 'my time' })).toBeVisible();

  // Browsers resume tabbing from the last focused element, so start from
  // the first slot and check the order from there.
  await heading.getByRole('button', { name: 'London' }).focus();
  const order = await tabOrder(page, 4);
  expect(order.map((name) => name.replace(/\s/g, ' '))).toEqual([
    '1 hour',
    'after',
    expect.stringMatching(/^\d{1,2}(:\d{2})? [ap]m$/) as unknown as string,
    'my time',
  ]);
});

test('every slot opens with Enter and closes with Escape, returning focus', async ({
  page,
}) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: 'from now' }).press('Enter');

  for (const name of ['here', '1 hour', 'from now']) {
    const slot = heading.getByRole('button', { name });
    await slot.focus();
    await page.keyboard.press('Enter');
    await expect(slot).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Escape');
    await expect(slot).toHaveAttribute('aria-expanded', 'false');
    await expect(slot).toBeFocused();
  }
});
