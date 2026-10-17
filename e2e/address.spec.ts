import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

// 9:41 am on Saturday 10 October 2026 in Sydney.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-09T22:41:00Z') });
});

function heading(page: Page) {
  return page.getByRole('heading', { level: 1 });
}

test('a question’s address opens that question and its answer', async ({
  page,
}) => {
  await page.goto(
    '/?in=Europe/London&when=after&for=10h&at=15:00&at-in=Asia/Tokyo',
  );
  await expect(heading(page)).toHaveAccessibleName(
    /^What time will it be in London 10 hours after it’s 3\spm in Tokyo ?\?$/,
  );
  // 3 pm in Tokyo is 7 am in London; 10 hours on is 5 pm, on what is still
  // Friday in London as the page opens.
  await expect(page.getByText(/^tomorrow, Saturday 5:00\spm$/i)).toBeVisible();
});

test('Back undoes a change to the question, and Forward redoes it', async ({
  page,
}) => {
  await page.goto('/?in=Europe/London');
  await heading(page).getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'from now' }).click();
  await expect(page).toHaveURL(/\?in=Europe\/London&when=from-now&for=1h$/);

  await page.goBack();
  await expect(heading(page)).toHaveAccessibleName(
    /^What time is it in London right now ?\?$/,
  );
  await expect(page).toHaveURL(/\?in=Europe\/London$/);

  await page.goForward();
  await expect(heading(page)).toHaveAccessibleName(
    /^What time will it be in London 1 hour from now ?\?$/,
  );
});

test('a reload keeps the whole question', async ({ page }) => {
  await page.goto('/');
  await heading(page).getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'ago' }).click();
  await page.reload();
  await expect(heading(page)).toHaveAccessibleName(
    /^What time was it here 1 hour ago ?\?$/,
  );
});

test('Help sits between questions in Back, and closing it keeps the question', async ({
  page,
}) => {
  await page.goto('/?in=Europe/London');
  await heading(page).getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'from now' }).click();
  await page.getByRole('button', { name: 'Help' }).click();
  await expect(
    page.getByRole('heading', { name: 'How TimeTravels works' }),
  ).toBeVisible();
  await expect(page).toHaveURL(
    /\?in=Europe\/London&when=from-now&for=1h#help$/,
  );

  await page.goBack();
  await expect(heading(page)).toHaveAccessibleName(
    /^What time will it be in London 1 hour from now ?\?$/,
  );
  await page.goBack();
  await expect(heading(page)).toHaveAccessibleName(
    /^What time is it in London right now ?\?$/,
  );

  await page.goto('/?in=Asia/Tokyo#help');
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(heading(page)).toHaveAccessibleName(
    /^What time is it in Tokyo right now ?\?$/,
  );
  await expect(page).toHaveURL(/\?in=Asia\/Tokyo$/);
});
