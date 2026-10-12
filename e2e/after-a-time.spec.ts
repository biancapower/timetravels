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

test('10 hours after 3 pm today, here and then in London', async ({
  page,
}, testInfo) => {
  const press = (locator: ReturnType<typeof page.getByRole>) =>
    testInfo.project.use.hasTouch ? locator.tap() : locator.click();

  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });

  await press(heading.getByRole('button', { name: 'right now' }));
  await press(page.getByRole('menuitemradio', { name: 'after a time' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 1 hour after it’s 10 am here?'),
  );

  await press(heading.getByRole('button', { name: '1 hour' }));
  await page.getByRole('textbox', { name: 'Type a duration' }).fill('10');
  await page.keyboard.press('Enter');
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 10 hours after it’s 10 am here?'),
  );

  await press(heading.getByRole('button', { name: '10 am' }));
  const dialog = page.getByRole('dialog', { name: 'Choose a time' });
  await dialog.getByLabel('Time').fill('15:00');
  await expect(dialog.getByRole('radio', { name: 'Today' })).toBeChecked();
  await press(dialog.getByRole('button', { name: 'Set' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 10 hours after it’s 3 pm here?'),
  );
  // 3 pm in Sydney is 5 am in London; ten hours on is 3 pm.
  await expect(page.getByText(/^tomorrow, Saturday 3:00\spm$/)).toBeVisible();

  await press(heading.getByRole('button', { name: 'here' }));
  await press(page.getByRole('menuitemradio', { name: 'in London' }));
  await expect(heading).toHaveAccessibleName(
    sentence('What time will it be in London 10 hours after 3 pm in London?'),
  );
  // Today is London's Friday: 3 pm then plus ten hours is 1 am Saturday.
  await expect(page.getByText(/^tomorrow, Saturday 1:00\sam$/)).toBeVisible();
});

test('another place’s time, picked by tap or click, and remembered', async ({
  page,
}, testInfo) => {
  const press = (locator: ReturnType<typeof page.getByRole>) =>
    testInfo.project.use.hasTouch ? locator.tap() : locator.click();

  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await press(heading.getByRole('button', { name: 'right now' }));
  await press(page.getByRole('menuitemradio', { name: 'after a time' }));
  await press(heading.getByRole('button', { name: 'here' }));
  await press(page.getByRole('menuitem', { name: 'another place…' }));
  const search = page.getByRole('dialog', { name: 'Choose a place' });
  await search.getByRole('combobox', { name: 'Search for a city' }).fill('tok');
  await press(search.getByRole('option', { name: 'Tokyo' }));

  await expect(heading).toHaveAccessibleName(
    sentence(
      'What time will it be in London 1 hour after it’s 10 am in Tokyo?',
    ),
  );
  await expect(heading.getByRole('button', { name: 'in Tokyo' })).toBeFocused();
  // Today is Tokyo's Saturday: 10 am there is 2 am in London; an hour on is 3 am.
  await expect(page.getByText(/^tomorrow, Saturday 3:00\sam$/)).toBeVisible();

  await page.reload();
  await press(heading.getByRole('button', { name: 'right now' }));
  await press(page.getByRole('menuitemradio', { name: 'after a time' }));
  await expect(heading).toHaveAccessibleName(
    sentence(
      'What time will it be in London 1 hour after it’s 10 am in Tokyo?',
    ),
  );
});

test('another place’s time, picked by keyboard', async ({ page }) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'right now' }).click();
  await page.getByRole('menuitemradio', { name: 'after a time' }).click();

  await heading.getByRole('button', { name: 'here' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemradio', { name: 'here' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitem', { name: 'another place…' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');

  const field = page
    .getByRole('dialog', { name: 'Choose a place' })
    .getByRole('combobox', { name: 'Search for a city' });
  await expect(field).toBeFocused();
  await page.keyboard.type('tok');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(heading).toHaveAccessibleName(
    sentence(
      'What time will it be in London 1 hour after it’s 10 am in Tokyo?',
    ),
  );
  await expect(heading.getByRole('button', { name: 'in Tokyo' })).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('menuitemradio', { name: 'here' })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(
    page.getByRole('menuitem', { name: 'another place…' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('dialog', { name: 'Choose a place' }),
  ).toBeVisible();
  await page.keyboard.type('par');
  await page.keyboard.press('Escape');
  await expect(
    page.getByRole('dialog', { name: 'Choose a place' }),
  ).toBeHidden();
  await expect(heading.getByRole('button', { name: 'in Tokyo' })).toBeFocused();
});
