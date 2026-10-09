import { expect, test } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

// 09:41 on Saturday 10 October 2026 in Sydney; 23:41 on Friday in London.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-09T22:41:00Z') });
  await page.addInitScript(() => {
    localStorage.setItem(
      'timetravels.place',
      JSON.stringify({ city: 'London', zone: 'Europe/London' }),
    );
  });
});

const sentence = (text: string) =>
  new RegExp(`^${text.replace(/[?]/g, '').replace(/ /g, ' ?')} ?\\?$`);

test('10 hours after 3 pm today, in my time and then London time', async ({
  page,
}, testInfo) => {
  const press = (locator: ReturnType<typeof page.getByRole>) =>
    testInfo.project.use.hasTouch ? locator.tap() : locator.click();

  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });

  await press(heading.getByRole('button', { name: 'right now' }));
  await press(page.getByRole('menuitemradio', { name: 'after a time' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 1 hour after 10 am my time?'),
  );

  await press(heading.getByRole('button', { name: '1 hour' }));
  await page.getByRole('textbox', { name: 'Type a duration' }).fill('10');
  await page.keyboard.press('Enter');
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 10 hours after 10 am my time?'),
  );

  await press(heading.getByRole('button', { name: '10 am' }));
  const dialog = page.getByRole('dialog', { name: 'Choose a time' });
  await dialog.getByLabel('Time').fill('15:00');
  await expect(dialog.getByRole('radio', { name: 'Today' })).toBeChecked();
  await press(dialog.getByRole('button', { name: 'Set' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 10 hours after 3 pm my time?'),
  );
  // 3 pm in Sydney is 5 am in London; ten hours on is 3 pm.
  await expect(page.getByText(/^tomorrow, Saturday 3:00\spm$/)).toBeVisible();

  await press(heading.getByRole('button', { name: 'my time' }));
  await press(page.getByRole('menuitemradio', { name: 'London time' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 10 hours after 3 pm London time?'),
  );
  // Today is London's Friday: 3 pm then plus ten hours is 1 am Saturday.
  await expect(page.getByText(/^tomorrow, Saturday 1:00\sam$/)).toBeVisible();
});
