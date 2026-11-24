import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/github-readme';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.getByRole('button', { name: 'Previzualizare' })).toBeVisible();
  await expect(page.getByLabel('CV sursă')).toBeVisible();
  await page.waitForTimeout(300);
}

test('pagina se randeaza fara emoji si fara card in card', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('previzualizarea urmeaza campurile din formular', async ({ page }) => {
  await openPage(page);
  await page.getByLabel('Nume complet').fill('Ana Test');
  await expect(page.getByRole('heading', { name: 'Ana Test' })).toBeVisible();
});

test('tab-ul Markdown arata codul si permite copierea', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'Markdown', exact: true }).click();
  await expect(page.getByLabel('Cod Markdown README')).toHaveValue(/^# /);
  await expect(page.getByRole('button', { name: /Copiază Markdown/ })).toBeVisible();
});

test('lustruirea cu filtru Non-AI apeleaza API-ul si aplica raspunsul', async ({ page }) => {
  await openPage(page);
  const refined = page.waitForRequest((r) => r.url().endsWith('/api/v1/github-readme') && r.method() === 'POST');
  await page.getByRole('button', { name: /Lustruiește cu filtru Non-AI/ }).click();
  await refined;
  await expect(page.getByLabel('Headline')).toHaveValue(fixture('github-readme').headline);
});

test('descarcarea produce README.md', async ({ page }) => {
  await openPage(page);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: /Descarcă README.md/ }).click();
  expect((await download).suggestedFilename()).toBe('README.md');
});

test('ghidul se deschide pe modalul comun, fara emoji', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'Ghid GitHub' }).click();
  const dialog = page.getByRole('dialog', { name: /Activează README-ul/ });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);
  await dialog.getByRole('button', { name: 'Am înțeles' }).click();
  await expect(dialog).toBeHidden();
});

test('criteriile Non-AI sunt in detalii la cerere', async ({ page }) => {
  await openPage(page);
  const details = page.locator('details', { hasText: 'Criteriile filtrului Non-AI' });
  await expect(details).not.toHaveAttribute('open', '');
  await details.locator('summary').click();
  await expect(details.getByRole('listitem').first()).toBeVisible();
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal', async ({ page }) => {
    await openPage(page);
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Ghid GitHub' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
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
