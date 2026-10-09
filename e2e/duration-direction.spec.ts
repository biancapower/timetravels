import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

// 22:00 on Saturday 10 October 2026 in Sydney.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-10T11:00:00Z') });
});

const sentence = (text: string) =>
  new RegExp(`^${text.replace(/[?]/g, '').replace(/ /g, ' ?')} ?\\?$`);

test('10 hours from now, then ago, by keyboard', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });

  await heading.getByRole('button', { name: 'now' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: 'from now' }).press('Enter');
  await expect(heading.getByRole('button', { name: 'from now' })).toBeFocused();
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be here 1 hour from now?'),
  );

  await heading.getByRole('button', { name: '1 hour' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('textbox', { name: 'Type a duration' }).fill('10');
  await page.keyboard.press('Enter');
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be here 10 hours from now?'),
  );
  await expect(page.getByText(/^tomorrow, Sunday 8:00\sam$/)).toBeVisible();
  await expect(heading.getByRole('button', { name: '10 hours' })).toBeFocused();

  await heading.getByRole('button', { name: 'from now' }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('menuitemradio', { name: 'ago' }).press('Enter');
  await expect(heading).toHaveAccessibleName(
    sentence('What time was it here 10 hours ago?'),
  );
  await expect(page.getByText(/^Saturday 12:00\spm$/)).toBeVisible();
});

test('pick a common duration by tap or click', async ({ page }, testInfo) => {
  const press = (locator: ReturnType<typeof page.getByRole>) =>
    testInfo.project.use.hasTouch ? locator.tap() : locator.click();

  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await press(heading.getByRole('button', { name: 'now' }));
  await press(page.getByRole('menuitemradio', { name: 'ago' }));
  await press(heading.getByRole('button', { name: '1 hour' }));
  await press(page.getByRole('button', { name: '8 hours' }));

  await expect(heading).toHaveAccessibleName(
    sentence('What time was it here 8 hours ago?'),
  );
  await expect(page.getByText(/^Saturday 2:00\spm$/)).toBeVisible();
});

test('a duration that cannot be read is reported', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'now' }).click();
  await page.getByRole('menuitemradio', { name: 'from now' }).click();
  await heading.getByRole('button', { name: '1 hour' }).click();
  await page.getByRole('textbox', { name: 'Type a duration' }).fill('soon');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('alert')).toHaveText(
    'Couldn’t read that duration',
  );
});
