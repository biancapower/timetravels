import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

// 09:41 on Saturday 10 October 2026 in Sydney; 23:41 on Friday in London.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-09T22:41:00Z') });
});

const sentence = (text: string) =>
  new RegExp(`^${text.replace(/[?]/g, '').replace(/ /g, ' ?')} ?\\?$`);

test('the time here when it’s 10 am tomorrow in London, kept on reload', async ({
  page,
}, testInfo) => {
  const press = (locator: ReturnType<typeof page.getByRole>) =>
    testInfo.project.use.hasTouch ? locator.tap() : locator.click();

  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });

  await press(heading.getByRole('button', { name: 'right now' }));
  await press(page.getByRole('menuitemradio', { name: 'at a time' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be here when it’s 10 am here?'),
  );

  await press(heading.getByRole('button', { name: 'here' }).nth(1));
  await press(page.getByRole('menuitem', { name: 'another place…' }));
  await page
    .getByRole('combobox', { name: 'Search for a city' })
    .fill('london');
  await press(page.getByRole('option', { name: 'London', exact: true }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time was it here when it was 10 am in London?'),
  );

  await press(heading.getByRole('button', { name: '10 am' }));
  const dialog = page.getByRole('dialog', { name: 'Choose a time' });
  await press(dialog.getByRole('radio', { name: 'Tomorrow' }));
  await press(dialog.getByRole('button', { name: 'Set' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be here when it’s 10 am tomorrow in London?'),
  );
  // 10 am on Saturday in London is 8 pm on Saturday in Sydney.
  await expect(page.getByText(/^Saturday 8:00\spm$/i)).toBeVisible();

  await page.reload();
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be here when it’s 10 am tomorrow in London?'),
  );
});
