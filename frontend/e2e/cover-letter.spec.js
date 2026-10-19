import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/cover-letter';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.locator('#cover-letter-paper')).toBeVisible();
  await expect(page.getByLabel('CV sursă')).toBeVisible();
  await page.waitForTimeout(300);
}

test('pagina se randeaza fara emoji si fara card in card', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('generarea trimite datele jobului si afiseaza scrisoarea', async ({ page }) => {
  await openPage(page);
  await page.getByLabel('Companie').fill('Endava');
  await page.getByLabel('Titlu job').fill('Junior Java Developer');
  const generated = page.waitForRequest((r) => r.url().endsWith('/api/v1/ai/cover-letter') && r.method() === 'POST');
  await page.getByRole('button', { name: 'Generează scrisoarea' }).click();
  expect((await generated).postDataJSON()).toMatchObject({ companyName: 'Endava', jobTitle: 'Junior Java Developer' });
  const letter = fixture('cover-letter');
  await expect(page.locator('#cover-letter-paper')).toContainText(letter.openingParagraph);
  await expectNoEmoji(page.locator('main'));
});

test('fara companie sau titlu arata o eroare si nu apeleaza API-ul', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'Generează scrisoarea' }).click();
  await expect(page.getByText('Completează cel puțin compania sau titlul jobului.')).toBeVisible();
});

test('editarea directa permite modificarea textului', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'Editează' }).click();
  await expect(page.getByRole('button', { name: 'Previzualizare' })).toBeVisible();
  await page.locator('#cover-letter-paper input').first().fill('Nume Nou');
  await page.getByRole('button', { name: 'Previzualizare' }).click();
  await expect(page.locator('#cover-letter-paper')).toContainText('Nume Nou');
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal', async ({ page }) => {
    await openPage(page);
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
