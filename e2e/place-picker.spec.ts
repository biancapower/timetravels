import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney' });

const sentenceIn = (city: string) =>
  new RegExp(`^What time is it now in ${city} ?\\?$`);

function slot(page: Page, name: string) {
  return page.getByRole('heading').getByRole('button', { name });
}

test('pick a city by keyboard, and focus returns to the slot', async ({
  page,
}) => {
  await page.goto('/');
  await slot(page, 'here').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.type('lond');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  await expect(
    page.getByRole('heading', { name: sentenceIn('London') }),
  ).toBeVisible();
  await expect(page.getByText(/^London \(GMT/)).toBeVisible();
  await expect(slot(page, 'London')).toBeFocused();
});

test('Escape closes the picker without changing the place', async ({
  page,
}) => {
  await page.goto('/');
  await slot(page, 'here').focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('combobox', { name: 'Search for a city' }),
  ).toBeVisible();
  await page.keyboard.press('Escape');

  await expect(
    page.getByRole('combobox', { name: 'Search for a city' }),
  ).toBeHidden();
  await expect(slot(page, 'here')).toBeFocused();
});

test('pick a city by tap or click, and it is remembered', async ({
  page,
}, testInfo) => {
  const press = testInfo.project.use.hasTouch
    ? (name: string) => page.getByRole('option', { name, exact: true }).tap()
    : (name: string) => page.getByRole('option', { name, exact: true }).click();

  await page.goto('/');
  await slot(page, 'here').click();
  await page.getByRole('combobox', { name: 'Search for a city' }).fill('tokyo');
  await press('Tokyo');
  await expect(
    page.getByRole('heading', { name: sentenceIn('Tokyo') }),
  ).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole('heading', { name: sentenceIn('Tokyo') }),
  ).toBeVisible();

  await slot(page, 'Tokyo').click();
  await press('Here');
  await expect(
    page.getByRole('heading', { name: /^What time is it now here ?\?$/ }),
  ).toBeVisible();
  await expect(page.getByText(/^Sydney \(GMT/)).toBeVisible();
});

test('arrow keys move through several matches', async ({ page }) => {
  await page.goto('/');
  await slot(page, 'here').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.type('new');
  const options = page.getByRole('option');
  await expect(options.nth(1)).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(options.nth(1)).toHaveAttribute('data-highlighted', '');
  await page.keyboard.press('ArrowUp');
  await expect(options.nth(0)).toHaveAttribute('data-highlighted', '');

  const first = (await options.nth(0).textContent()) ?? '';
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: sentenceIn(first) }),
  ).toBeVisible();
  await expect(slot(page, first)).toBeFocused();
});
