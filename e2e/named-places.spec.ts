import { expect, test, type Page } from '@playwright/test';

test.use({ timezoneId: 'Australia/Sydney' });

const asked = (where: string) =>
  new RegExp(`^What time is it ${where} right now ?\\?$`);

function slot(page: Page, name: string) {
  return page.getByRole('heading').getByRole('button', { name });
}

test('set up home, use it, keep it across a reload, then remove it', async ({
  page,
}, testInfo) => {
  const press = testInfo.project.use.hasTouch
    ? (target: ReturnType<Page['getByRole']>) => target.tap()
    : (target: ReturnType<Page['getByRole']>) => target.click();

  await page.goto('/');
  await press(slot(page, 'here'));
  await press(page.getByRole('option', { name: /^Home/ }));
  const form = page.getByRole('dialog', { name: 'Where is home?' });
  await expect(form.getByRole('combobox', { name: 'Place' })).toHaveValue(
    'Sydney',
  );
  await expect(form).toContainText('What time is it at home right now?');
  await press(form.getByRole('button', { name: 'Save' }));

  await expect(
    page.getByRole('heading', { name: asked('at home') }),
  ).toBeVisible();
  await expect(page.getByText(/^Home \(Sydney, GMT/)).toBeVisible();
  await expect(slot(page, 'home')).toBeFocused();

  await page.reload();
  await expect(
    page.getByRole('heading', { name: asked('at home') }),
  ).toBeVisible();

  await press(slot(page, 'home'));
  await press(page.getByRole('option', { name: 'Edit Home' }));
  await press(
    page
      .getByRole('dialog', { name: 'Where is home?' })
      .getByRole('button', { name: 'Clear home' }),
  );
  await expect(
    page.getByRole('heading', { name: asked('here') }),
  ).toBeVisible();
  await expect(page.getByText(/^Sydney \(GMT/)).toBeVisible();

  await page.reload();
  await press(slot(page, 'here'));
  await expect(page.getByRole('option', { name: /^Home/ })).toContainText(
    'not set up',
  );
});

test('name a place by keyboard, and Escape leaves the form', async ({
  page,
}) => {
  await page.goto('/');
  await slot(page, 'here').focus();
  await page.keyboard.press('Enter');
  await page.keyboard.type('nam');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');

  const form = page.getByRole('dialog', { name: 'Name a place' });
  await expect(form.getByRole('textbox', { name: 'Name' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(form).toBeHidden();
  await expect(slot(page, 'here')).toBeFocused();
});

test('Enter in the place search picks a city, and never saves the form', async ({
  page,
}) => {
  await page.goto('/');
  await slot(page, 'here').click();
  await page.getByRole('option', { name: /^Home/ }).click();
  const form = page.getByRole('dialog', { name: 'Where is home?' });
  const search = form.getByRole('combobox', { name: 'Place' });

  await search.fill('tok');
  await page.keyboard.press('Enter');
  await expect(form).toBeVisible();
  await expect(search).toHaveValue('tok');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await expect(form).toBeVisible();
  await expect(search).toHaveValue('Tokyo');
  await expect(form).toContainText('What time is it at home right now?');
});

test('tapping away saves a change, closes an untouched form, and keeps an unfinished one open', async ({
  page,
}, testInfo) => {
  // The page's top corner, clear of the sentence and the form.
  const away = () =>
    testInfo.project.use.hasTouch
      ? page.touchscreen.tap(4, 4)
      : page.mouse.click(4, 4);

  await page.goto('/');
  await slot(page, 'here').click();
  await page.getByRole('option', { name: /^Home/ }).click();
  const home = page.getByRole('dialog', { name: 'Where is home?' });
  await expect(home).toBeVisible();
  await away();
  await expect(home).toBeHidden();
  await expect(
    page.getByRole('heading', { name: asked('here') }),
  ).toBeVisible();

  await slot(page, 'here').click();
  await page.getByRole('option', { name: 'Name a place' }).click();
  const form = page.getByRole('dialog', { name: 'Name a place' });
  await form.getByRole('textbox', { name: 'Name' }).fill('Gym');
  await away();
  await expect(form.getByRole('alert')).toHaveText('Choose a place for it.');

  await form.getByRole('combobox', { name: 'Place' }).fill('lond');
  await form.getByRole('option', { name: 'London' }).click();
  await away();
  await expect(form).toBeHidden();
  await expect(
    page.getByRole('heading', { name: asked('at Gym') }),
  ).toBeVisible();
});

test('the city list shows only while searching', async ({ page }) => {
  await page.goto('/');
  await slot(page, 'here').click();
  await page.getByRole('option', { name: /^Home/ }).click();
  const form = page.getByRole('dialog', { name: 'Where is home?' });
  const search = form.getByRole('combobox', { name: 'Place' });
  await expect(search).toHaveValue('Sydney');
  await expect(form.getByRole('option')).toHaveCount(0);
  await expect(form.getByRole('button', { name: 'Save' })).toBeInViewport();

  await search.fill('lond');
  await expect(form.getByRole('option', { name: 'London' })).toBeVisible();
  await form.getByRole('option', { name: 'London' }).click();
  await expect(search).toHaveValue('London');
  await expect(form.getByRole('option')).toHaveCount(0);
});
