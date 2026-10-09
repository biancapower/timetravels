import { expect, test } from '@playwright/test';

test('the page shows the sentence and a time', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('TimeTravels');
  await expect(
    page.getByRole('heading', { name: /^What time is it here right now ?\?$/ }),
  ).toBeVisible();
  await expect(
    page.getByText(/^\p{L}+,? \d{1,2}:\d{2}(\s?[ap]m)?$/iu),
  ).toBeVisible();
});

for (const width of [360, 1280]) {
  test(`no horizontal scroll at ${String(width)} px wide`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('heading')).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}
