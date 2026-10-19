import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/cv-library';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.locator('[data-cv-card]').first()).toBeVisible();
  await page.waitForTimeout(300);
}

test('pagina se randeaza fara emoji', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
});

test('fiecare CV e un card simplu, fara card in card', async ({ page }) => {
  await openPage(page);
  const cvs = fixture('cv-profiles');
  await expect(page.locator('[data-cv-card]')).toHaveCount(cvs.length);
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('cautarea filtreaza lista de CV-uri', async ({ page }) => {
  await openPage(page);
  const [first] = fixture('cv-profiles');
  await page.getByLabel('Caută în CV-uri').fill('zzz-fara-rezultat');
  await expect(page.locator('[data-cv-card]')).toHaveCount(0);
  await page.getByLabel('Caută în CV-uri').fill(first.title);
  await expect(page.locator(`[data-cv-card="${first.id}"]`)).toBeVisible();
});

test('actiunile pe CV: setare principal, duplicare si stergere cu confirmare', async ({ page, api }) => {
  const nonPrimary = { ...fixture('cv-profiles')[0], id: 'c2222222-2222-4222-8222-222222222222', title: 'CV Frontend React', isPrimary: false };
  api.on('GET', /^\/api\/v1\/cv\/list$/, () => [...fixture('cv-profiles'), nonPrimary]);
  await openPage(page);
  const card = page.locator(`[data-cv-card="${nonPrimary.id}"]`);

  const primary = page.waitForRequest((r) => r.url().endsWith(`/api/v1/cv/${nonPrimary.id}/primary`) && r.method() === 'PATCH');
  await card.getByRole('button', { name: /ca principal/ }).click();
  await primary;

  const duplicate = page.waitForRequest((r) => r.url().endsWith(`/api/v1/cv/${nonPrimary.id}/duplicate`) && r.method() === 'POST');
  await card.getByRole('button', { name: /^Duplică/ }).click();
  await duplicate;

  page.once('dialog', (dialog) => dialog.dismiss());
  await card.getByRole('button', { name: /^Șterge/ }).click();

  page.once('dialog', (dialog) => dialog.accept());
  const deleted = page.waitForRequest((r) => r.url().endsWith(`/api/v1/cv/${nonPrimary.id}`) && r.method() === 'DELETE');
  await card.getByRole('button', { name: /^Șterge/ }).click();
  await deleted;
});

test('Editează deschide CV-ul in studio', async ({ page }) => {
  await openPage(page);
  const [first] = fixture('cv-profiles');
  await page.locator(`[data-cv-card="${first.id}"]`).getByRole('button', { name: 'Editează' }).click();
  await expect(page).toHaveURL('/cv-studio');
});

test('modalul CV nou creeaza un CV, fara emoji', async ({ page }) => {
  await openPage(page);
  await page.getByRole('button', { name: 'CV nou' }).click();
  const dialog = page.getByRole('dialog', { name: 'CV nou' });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);
  await expect(dialog.getByRole('button', { name: /Creează și editează/ })).toBeDisabled();
  await dialog.getByLabel('Denumire').fill('CV Frontend');
  const created = page.waitForRequest((r) => r.url().endsWith('/api/v1/cv') && r.method() === 'POST');
  await dialog.getByRole('button', { name: /Creează și editează/ }).click();
  expect((await created).postDataJSON()).toMatchObject({ title: 'CV Frontend' });
});

test('importul trimite fisierul ales', async ({ page }) => {
  await openPage(page);
  const upload = page.waitForRequest((r) => r.url().endsWith('/api/v1/resumes') && r.method() === 'POST');
  await page.getByLabel('Fișier CV pentru import').first()
    .setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  await upload;
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal, nici cu modalul deschis', async ({ page }) => {
    await openPage(page);
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'CV nou' }).click();
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
