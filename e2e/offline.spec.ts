import { expect, test, type Page } from '@playwright/test';

async function controlledByServiceWorker(page: Page) {
  await page.goto('/');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect
    .poll(() =>
      page.evaluate(() => navigator.serviceWorker.controller !== null),
    )
    .toBe(true);
}

async function expectAppShown(page: Page) {
  await expect(
    page.getByRole('heading', { name: /^What time is it here right now ?\?$/ }),
  ).toBeVisible();
  await expect(
    page.getByText(/^\p{L}+,? \d{1,2}:\d{2}(\s?[ap]m)?$/iu),
  ).toBeVisible();
}

test('the manifest is linked and names the app with a 512 px icon', async ({
  page,
}) => {
  await page.goto('/');
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  expect(href).not.toBeNull();
  const response = await page.request.get(new URL(href ?? '', page.url()).href);
  expect(response.ok()).toBe(true);
  const manifest = (await response.json()) as {
    name: string;
    short_name: string;
    icons: { sizes: string; src: string }[];
  };
  expect(manifest.name).toBe('TimeTravels');
  expect(manifest.short_name).toBe('TimeTravels');
  expect(manifest.icons.map((icon) => icon.sizes)).toContain('512x512');
});

test('after one visit the app loads with the network off', async ({
  page,
  context,
}) => {
  await controlledByServiceWorker(page);
  await context.setOffline(true);
  await page.reload();
  await expectAppShown(page);
});

test('offline without native Temporal, the precached polyfill is used', async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(globalThis, 'Temporal');
  });
  await controlledByServiceWorker(page);
  await context.setOffline(true);
  await page.reload();
  await expectAppShown(page);
});
