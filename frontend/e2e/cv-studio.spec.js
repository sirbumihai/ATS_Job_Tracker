import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/cv-studio';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.locator('#cv-page-1')).toBeVisible();
  await expect(page.getByText('Salvat', { exact: true })).toBeVisible();
  await page.waitForTimeout(300);
}

test('pagina se randeaza fara emoji, nici in documentul CV', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
});

test('controalele din CV nu folosesc sageti text, ci iconite', async ({ page }) => {
  await openPage(page);
  const text = await page.locator('#cv-page-1').innerText();
  expect(text).not.toMatch(/[↑↓↷↶]/u);
  await expect(page.getByRole('button', { name: 'Mută mai sus' }).first()).toBeVisible();
});

test('bara de unelte e un card simplu, fara card in card', async ({ page }) => {
  await openPage(page);
  expect(await page.locator('[data-card]').count()).toBeGreaterThan(0);
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('titlul CV-ului si datele din fixture apar in editor', async ({ page }) => {
  await openPage(page);
  const cv = fixture('cv-profiles')[0];
  await expect(page.getByPlaceholder('Denumire CV')).toHaveValue(cv.title);
  await expect(page.locator('#cv-page-1')).toContainText(new RegExp(cv.fullName, 'i'));
});

test('modul de pagini comuta intre 1 si 2 pagini', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: '2 pagini', exact: true }).click();
  await expect(page.locator('#cv-page-2')).toBeVisible();
  await expectNoEmoji(page.locator('main'));
  await page.getByRole('button', { name: '1 pagină', exact: true }).click();
  await expect(page.locator('#cv-page-2')).toHaveCount(0);
});

test('modalul de contact se deschide, editeaza si se inchide, fara emoji', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: /Date contact/ }).click();
  const dialog = page.getByRole('dialog', { name: 'Date de contact' });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);
  await dialog.getByLabel('Telefon').fill('+40 711 111 111');
  await dialog.getByRole('button', { name: 'Gata' }).click();
  await expect(dialog).toBeHidden();
  await expect(page.locator('#cv-page-1')).toContainText('+40 711 111 111');
});

test('AI Review arata inelul de scor si 6 bare, aplica o sugestie si se inchide', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'AI Review' }).click();
  const coach = page.getByTestId('polish-coach');
  await expect(coach).toBeVisible();
  const data = fixture('polish-diagnosis');
  await expect(coach.getByRole('img', { name: /Scor ATS/ })).toBeVisible();
  await expect(coach.getByRole('progressbar')).toHaveCount(6);
  await expectNoEmoji(coach);
  expect(await coach.locator('[data-card]').count()).toBe(0);

  const first = data.suggestions[0];
  // prima sugestie e deschisa implicit; a doua apare doar dupa click
  await expect(coach.getByText(first.afterText)).toBeVisible();
  const second = data.suggestions[1];
  await expect(coach.getByText(second.afterText)).toBeHidden();
  await coach.getByRole('button', { name: second.title }).click();
  await expect(coach.getByText(second.afterText)).toBeVisible();
  await coach.getByRole('button', { name: 'Aplică', exact: true }).first().click();
  await expect(coach.getByText('1 din 2 îmbunătățiri aplicate')).toBeVisible();

  await coach.getByRole('button', { name: 'Închide AI Review' }).click();
  await expect(coach).toBeHidden();
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
