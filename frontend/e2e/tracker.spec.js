import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/tracker';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.getByText(fixture('applications')[0].jobTitle).first()).toBeVisible();
}

test('pagina se randeaza fara emoji, in toate cele 3 vizualizari', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
  for (const view of ['Listă', 'Calendar', 'Kanban']) {
    await page.getByRole('button', { name: view, exact: true }).click();
    await expectNoEmoji(page.locator('main'));
  }
});

test('cardurile din board sunt carduri simple, fara card in card', async ({ page }) => {
  await openPage(page);
  await expect(page.locator('[data-card]').first()).toBeVisible();
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('cardul de aplicatie arata rolul, compania si data', async ({ page }) => {
  await openPage(page);
  const app = fixture('applications')[0];
  const card = page.locator(`[data-card-id="${app.id}"]`);
  await expect(card).toContainText(app.jobTitle);
  await expect(card).toContainText(app.companyName);
  await expect(card).toContainText(app.appliedDate);
});

test('vizualizarea Listă arata aplicatiile si schimba statusul', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'Listă', exact: true }).click();
  const app = fixture('applications')[0];
  await expect(page.getByRole('cell', { name: new RegExp(app.jobTitle) })).toBeVisible();
  const patch = page.waitForRequest((r) => /\/applications\/[^/]+\/status/.test(r.url()) && r.method() === 'PATCH');
  await page.getByRole('row', { name: new RegExp(app.jobTitle) }).getByRole('combobox').first().selectOption('REJECTED');
  await patch;
});

test('cautarea filtreaza aplicatiile', async ({ page }) => {
  await openPage(page);
  const [first, , third] = fixture('applications');
  await page.getByPlaceholder(/Caută/).fill(third.companyName);
  await expect(page.getByText(third.jobTitle).first()).toBeVisible();
  await expect(page.getByText(first.jobTitle)).toHaveCount(0);
});

test('Gmail Sync se deschide fara emoji si se inchide', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: /Gmail Sync/ }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);
  await expect(dialog.locator('[data-card] [data-card]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('butonul Adaugă job deschide modalul', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: /Adaugă job/ }).click();
  await expect(page.getByRole('dialog', { name: 'Adaugă un job' })).toBeVisible();
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal', async ({ page }) => {
    await openPage(page);
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Listă', exact: true }).click();
    await expectNoHorizontalScroll(page);
  });
});

test.describe('cu reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('continutul e vizibil', async ({ page }) => {
    await openPage(page);
    await expectContentVisible(page.locator('main'));
  });
});
