import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/job-search';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.getByText(fixture('jobs-search').content[0].jobTitle).first()).toBeVisible();
  // dupa incarcare, butoanele dezactivate cat timp lista se incarca isi termina tranzitia de opacitate
  await expect(page.getByRole('button', { name: 'Exportă CSV' })).toBeEnabled();
  await page.waitForTimeout(400);
}

test('pagina se randeaza fara emoji', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
});

test('cardul de job arata doar titlu, companie, locatie si scor ATS', async ({ page }) => {
  await openPage(page);
  const job = fixture('jobs-search').content[0];
  const card = page.locator(`[data-job-card="${job.id}"]`);
  await expect(card).toContainText(job.jobTitle);
  await expect(card).toContainText(job.companyName);
  await expect(card).toContainText(job.location);
  await expect(card.getByLabel(/Scor ATS/)).toHaveText(`${Math.round(job.atsMatchScore)}%`);
  // detaliile raman in modal
  await expect(card).not.toContainText('Competitie');
  await expect(card).not.toContainText(job.workModel === 'HYBRID' ? 'Hibrid' : 'Remote');
});

test('cardurile sunt simple, fara card in card', async ({ page }) => {
  await openPage(page);
  expect(await page.locator('[data-card]').count()).toBeGreaterThan(1);
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('modalul de job se deschide cu sectiuni, fara emoji, si se inchide', async ({ page }) => {
  await openPage(page);
  const job = fixture('jobs-search').content[0];
  await page.locator(`[data-job-card="${job.id}"]`).getByRole('button', { name: job.jobTitle }).click();
  const dialog = page.getByRole('dialog', { name: job.jobTitle });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Potrivire cu CV-ul' })).toBeVisible();
  await expectNoEmoji(dialog);
  await expect(dialog.locator('[data-card]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Închide' }).click();
  await expect(dialog).toBeHidden();
});

test('Adaugă la Aplicat trimite jobul in tracker', async ({ page }) => {
  await openPage(page);
  const job = fixture('jobs-search').content[0];
  const created = page.waitForRequest((r) => r.url().endsWith('/api/v1/jobs/save-to-kanban') && r.method() === 'POST');
  await page.locator(`[data-job-card="${job.id}"]`).getByRole('button', { name: 'Adaugă la Aplicat' }).click();
  expect((await created).postDataJSON()).toMatchObject({ jobTitle: job.jobTitle });
  await expect(page.locator(`[data-job-card="${job.id}"]`)).toContainText('Aplicat');
});

test('cautarea trimite cuvantul cheie catre API', async ({ page }) => {
  await openPage(page);
  const search = page.waitForRequest((r) => r.url().includes('/api/v1/jobs/search') && r.url().includes('keyword=java'));
  await page.getByPlaceholder(/Titlu rol/).fill('java');
  await page.getByRole('button', { name: 'Caută', exact: true }).click();
  await search;
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal, nici cu modalul deschis', async ({ page }) => {
    await openPage(page);
    await expectNoHorizontalScroll(page);
    await page.locator('[data-job-card]').first().getByRole('button', { name: 'Vezi fișa jobului' }).click();
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
