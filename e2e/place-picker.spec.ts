import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney' });

const sentenceIn = (city: string) =>
  new RegExp(`^What time is it in ${city} right now ?\\?$`);

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
    page.getByRole('heading', { name: /^What time is it here right now ?\?$/ }),
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

test('a letter typed on the closed place slot leaves the place unchanged', async ({
  page,
}) => {
  await page.goto('/');
  const heading = page.getByRole('heading', { level: 1 });
  await heading.getByRole('button', { name: 'here' }).focus();
  await page.keyboard.press('h');
  await expect(
    page.getByRole('combobox', { name: 'Search for a city' }),
  ).not.toBeVisible();
  await expect(heading).toHaveText(/^What time is it here right now ?\?$/);
  expect(
    await page.evaluate(() => localStorage.getItem('timetravels.place')),
  ).toBeNull();
});

test('another place’s answer gives your own time, and here’s doesn’t', async ({
  page,
}) => {
  // 9:41 am on Saturday 10 October 2026 in Sydney: 11:41 pm Friday in London.
  await page.clock.install({ time: new Date('2026-10-09T22:41:00Z') });
  await page.goto('/');
  await expect(page.getByText(/your time$/)).toBeHidden();

  await slot(page, 'here').click();
  await page.getByRole('combobox', { name: 'Search for a city' }).fill('lond');
  await page.getByRole('option', { name: 'London', exact: true }).click();
  await expect(page.getByText(/^Friday 11:41\spm$/i)).toBeVisible();
  const yours = page.getByText(/^Saturday 9:41\sam your time$/i);
  await expect(yours).toBeVisible();
  await expect(yours).toHaveCSS('font-style', 'italic');

  await slot(page, 'London').click();
  await page.getByRole('option', { name: 'Here', exact: true }).click();
  await expect(page.getByText(/your time$/)).toBeHidden();
});

test('a state is found by its name and reads naturally', async ({ page }) => {
  await page.goto('/');
  await slot(page, 'here').click();
  await page.getByRole('combobox', { name: 'Search for a city' }).fill('tas');
  await page.getByRole('option', { name: 'Tasmania', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: sentenceIn('Tasmania') }),
  ).toBeVisible();
  await expect(page.getByText(/^Tasmania \(GMT\+1[01]\)$/)).toBeVisible();
});

test('a country with several zones offers each by name', async ({ page }) => {
  await page.goto('/');
  await slot(page, 'here').click();
  await page
    .getByRole('combobox', { name: 'Search for a city' })
    .fill('australia');
  await page
    .getByRole('option', { name: 'Australia: Perth', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: sentenceIn('Australia: Perth') }),
  ).toBeVisible();
});
