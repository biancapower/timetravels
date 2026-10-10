import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

// 22:00 on Saturday 3 October 2026 in Sydney; the clocks go forward at 2 am.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-03T11:00:00Z') });
});

test('10 hours from now across the spring change shows the warning', async ({
  page,
}, testInfo) => {
  const press = (locator: ReturnType<typeof page.getByRole>) =>
    testInfo.project.use.hasTouch ? locator.tap() : locator.click();

  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await press(heading.getByRole('button', { name: 'right now' }));
  await press(page.getByRole('menuitemradio', { name: 'from now' }));
  await press(heading.getByRole('button', { name: '1 hour' }));
  await press(page.getByRole('button', { name: '10 hours' }));

  await expect(
    page.getByText(
      'Sydney’s clocks go forward an hour at 2 am on Sunday 4 October, so the clock moves 11 hours in these 10 hours.',
      { exact: true },
    ),
  ).toBeVisible();
});
