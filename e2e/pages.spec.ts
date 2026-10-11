import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

test('open help, read it, and close it back to the sentence as it was', async ({
  page,
}) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'from now' }).click();

  await page.getByRole('button', { name: 'Help' }).click();
  await expect(
    page.getByRole('heading', { name: 'How TimeTravels works' }),
  ).toBeFocused();
  await expect(page.getByText(/1h30 or 1:30/)).toBeVisible();

  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('button', { name: 'Help' })).toBeFocused();
  await expect(heading.getByRole('button', { name: 'from now' })).toBeVisible();
});

test('About from the footer, then Back, returns to the sentence', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/#about$/);
  await expect(
    page.getByRole('heading', { name: 'About TimeTravels' }),
  ).toBeFocused();
  await expect(page.getByText(/^Version \d+\.\d+\.\d+$/)).toBeVisible();

  await page.goBack();
  await expect(page.getByRole('link', { name: 'About' })).toBeFocused();
  await expect(
    page.getByRole('heading', { name: /^What time is it here/ }),
  ).toBeVisible();
});

test('a link to #privacy opens About at its Privacy section', async ({
  page,
}) => {
  await page.goto('/#privacy');
  await expect(page.getByRole('heading', { name: 'Privacy' })).toBeFocused();
  await expect(page.getByText(/Cloudflare Web Analytics/)).toBeVisible();
});

test('the licences file covers every production dependency', async ({
  page,
}) => {
  await page.goto('/#about');
  const href = await page
    .getByRole('link', { name: /Licences for all the code/ })
    .getAttribute('href');
  const response = await page.request.get(href ?? '');
  expect(response.ok()).toBe(true);
  const text = await response.text();
  const { dependencies } = JSON.parse(readFileSync('package.json', 'utf8')) as {
    dependencies: Record<string, string>;
  };
  for (const [name, version] of Object.entries(dependencies)) {
    expect(text).toContain(`${name}@${version}`);
  }
});
