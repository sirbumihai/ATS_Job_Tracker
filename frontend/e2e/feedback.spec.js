import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/feedback';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.locator('[data-idea]').first()).toBeVisible();
  await page.waitForTimeout(300);
}

test('pagina se randeaza fara emoji si fara card in card', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('body'));
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('formularul are doar titlu si detalii vizibile, restul e in optiuni', async ({ page }) => {
  await openPage(page);
  await expect(page.getByLabel('Titlu', { exact: true }).first()).toBeVisible();
  await expect(page.getByLabel('Detalii')).toBeVisible();
  await expect(page.getByLabel('Email', { exact: true })).toBeHidden();
  await page.getByText('Mai multe opțiuni').click();
  await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Nume', { exact: true }).first()).toBeVisible();
});

test('trimiterea feedback-ului apeleaza API-ul si arata confirmarea', async ({ page }) => {
  await openPage(page);
  const submit = page.locator('#formular').getByRole('button', { name: 'Trimite feedback' });
  await expect(submit).toBeDisabled();
  await page.getByRole('group', { name: 'Tipul mesajului' }).getByRole('button', { name: 'Problemă' }).click();
  await page.getByLabel('Titlu', { exact: true }).first().fill('Titlu test');
  await page.getByLabel('Detalii').fill('Mesaj de test');
  const sent = page.waitForRequest((r) => r.url().endsWith('/api/v1/feedback') && r.method() === 'POST');
  await submit.click();
  expect((await sent).postDataJSON()).toMatchObject({ category: 'bug', title: 'Titlu test', message: 'Mesaj de test', rating: 5, shareInCommunity: true });
  await expect(page.getByRole('status')).toContainText('Feedback trimis');
  await expectNoEmoji(page.locator('body'));
});

test('votul trimite voterToken si actualizeaza contorul', async ({ page }) => {
  await openPage(page);
  const [idea] = fixture('feedback-ideas');
  const vote = page.waitForRequest((r) => /\/feedback\/ideas\/[^/]+\/vote$/.test(r.url()) && r.method() === 'POST');
  await page.locator(`[data-idea="${idea.id}"]`).getByRole('button', { name: /^Votează/ }).click();
  expect((await vote).postDataJSON()).toHaveProperty('voterToken');
  await expect(page.locator(`[data-idea="${idea.id}"]`).getByRole('button', { name: /^Retrage votul/ })).toContainText('5');
});

test('filtrarea dupa categorie ascunde ideile din alte categorii', async ({ page }) => {
  await openPage(page);
  await page.getByRole('group', { name: 'Filtrare după categorie' }).getByRole('button', { name: 'Piața IT' }).click();
  await expect(page.locator('[data-idea]')).toHaveCount(0);
  await expect(page.getByText('Nicio idee în această categorie.')).toBeVisible();
});

test('o idee noua se propune din modalul comun', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'Propune o idee' }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Propune o idee' });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);
  await dialog.getByLabel('Titlu').fill('Idee noua');
  await dialog.getByLabel('Descriere').fill('De ce ar ajuta');
  const created = page.waitForRequest((r) => r.url().endsWith('/api/v1/feedback/ideas') && r.method() === 'POST');
  await dialog.getByRole('button', { name: 'Publică' }).click();
  expect((await created).postDataJSON()).toMatchObject({ title: 'Idee noua', category: 'Functie Noua' });
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('heading', { name: 'Idee noua' })).toBeVisible();
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal, nici cu modalul deschis', async ({ page }) => {
    await openPage(page);
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Propune o idee' }).first().click();
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
