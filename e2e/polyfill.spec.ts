import { expect, test } from '@playwright/test';

// Chrome has native Temporal; removing it before the app starts takes
// the path a browser without Temporal takes.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Reflect.deleteProperty(globalThis, 'Temporal');
  });
});

test('without native Temporal, the polyfill loads and the answer shows', async ({
  page,
}) => {
  const polyfill = page.waitForResponse(/global\.esm-.*\.js$/);
  await page.goto('/');
  expect((await polyfill).ok()).toBe(true);
  await expect(
    page.getByText(/^\p{L}+,? \d{1,2}:\d{2}(\s?[ap]m)?$/iu),
  ).toBeVisible();
});

test('if the polyfill cannot load, the page says so instead of staying blank', async ({
  page,
}) => {
  await page.route('**/global.esm-*.js', (route) => route.abort());
  await page.goto('/');
  await expect(page.getByText(/could not load/i)).toBeVisible();
});
