import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney', locale: 'en-AU' });

// 22:00 on Saturday 3 October 2026 in Sydney, the evening before its
// clocks go forward, so a 10-hour answer shows the clock-change note.
test.beforeEach(async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-03T11:00:00Z') });
});

async function expectNoViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
  // axe marks contrast it cannot measure as incomplete rather than failed.
  // Text covered by an open popup ("bgOverlap") is checked in the states
  // where nothing covers it; any other reason is unproven, so it fails.
  const unmeasured = results.incomplete
    .filter((rule) => rule.id === 'color-contrast')
    .flatMap((rule) => rule.nodes)
    .filter((node) => !node.any.some((check) => isCovered(check.data)))
    .map((node) => node.target.join(' '));
  expect(unmeasured).toEqual([]);
}

function isCovered(data: unknown) {
  return (
    typeof data === 'object' &&
    data !== null &&
    'messageKey' in data &&
    data.messageKey === 'bgOverlap'
  );
}

function slot(page: Page, name: string | RegExp) {
  return page.getByRole('heading', { level: 1 }).getByRole('button', { name });
}

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(`${colorScheme} theme`, () => {
    test.use({ colorScheme });

    test('the sentence and answer', async ({ page }) => {
      await page.goto('/');
      await expect(slot(page, 'here')).toBeVisible();
      await expectNoViolations(page);
    });

    test('the place picker, open', async ({ page }) => {
      await page.goto('/');
      await slot(page, 'here').click();
      const search = page.getByRole('combobox', { name: 'Search for a city' });
      await expect(search).toBeVisible();
      await expectNoViolations(page);
      await search.fill('lo');
      await page.keyboard.press('ArrowDown');
      await expect(page.getByRole('option').first()).toBeVisible();
      await expectNoViolations(page);
    });

    test('the time menu, open', async ({ page }) => {
      await page.goto('/');
      await slot(page, 'right now').click();
      await expect(
        page.getByRole('menuitemradio', { name: 'from now' }),
      ).toBeVisible();
      await expectNoViolations(page);
    });

    test('the duration picker, open, with an error', async ({ page }) => {
      await page.goto('/');
      await slot(page, 'right now').click();
      await page.getByRole('menuitemradio', { name: 'from now' }).click();
      await slot(page, '1 hour').click();
      await page.getByRole('textbox', { name: 'Type a duration' }).fill('soon');
      await page.keyboard.press('Enter');
      await expect(page.getByRole('alert')).not.toBeEmpty();
      await expectNoViolations(page);
    });

    test('an answer with a clock-change note', async ({ page }) => {
      await page.goto('/');
      await slot(page, 'right now').click();
      await page.getByRole('menuitemradio', { name: 'from now' }).click();
      await slot(page, '1 hour').click();
      await page.getByRole('button', { name: '10 hours' }).click();
      await expect(page.getByText(/^Sydney’s clocks go forward/)).toBeVisible();
      await expectNoViolations(page);
    });

    test('sentence 5 with a place: whose time, and the time picker with an error', async ({
      page,
    }) => {
      await page.goto('/');
      await page.evaluate(() => {
        localStorage.setItem(
          'timetravels.place',
          JSON.stringify({ city: 'London', zone: 'Europe/London' }),
        );
      });
      await page.reload();
      await slot(page, 'right now').click();
      await page.getByRole('menuitemradio', { name: 'after a time' }).click();
      await expect(slot(page, 'my time')).toBeVisible();
      await expectNoViolations(page);
      await slot(page, 'my time').click();
      await expect(
        page.getByRole('menuitemradio', { name: 'London time' }),
      ).toBeVisible();
      await expectNoViolations(page);
      await page.keyboard.press('Escape');

      await slot(page, /^\d{1,2}(:\d{2})?\s?[ap]m$/).click();
      const dialog = page.getByRole('dialog', { name: 'Choose a time' });
      await expect(dialog).toBeVisible();
      await expectNoViolations(page);
      await dialog.getByLabel('Time').fill('');
      await dialog.getByRole('button', { name: 'Set' }).click();
      await expect(dialog.getByRole('alert')).not.toBeEmpty();
      await expectNoViolations(page);
    });
  });
}
