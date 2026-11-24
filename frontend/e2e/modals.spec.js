import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll } from './support/checks.js';

test('modalul de autentificare se deschide, conecteaza utilizatorul si se inchide', async ({ page }) => {
  await page.goto('/tracker');
  await page.locator('aside').getByRole('button', { name: 'Conectare' }).click();

  const dialog = page.getByRole('dialog', { name: 'Autentificare' });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);

  await dialog.getByLabel('Email').fill('demo@jobflow.test');
  await dialog.getByLabel('Parolă').fill('parola-test');
  const login = page.waitForRequest((r) => r.url().endsWith('/api/v1/auth/login') && r.method() === 'POST');
  await dialog.getByRole('button', { name: 'Conectează-te' }).click();
  expect((await login).postDataJSON()).toMatchObject({ email: 'demo@jobflow.test', password: 'parola-test' });

  await expect(dialog).toBeHidden();
  await expect(page.locator('aside')).toContainText('Utilizator Demo');
});

test('modalul de autentificare comuta pe inregistrare si se inchide cu Escape', async ({ page }) => {
  await page.goto('/tracker');
  await page.locator('aside').getByRole('button', { name: 'Conectare' }).click();
  await page.getByRole('button', { name: 'Creează cont' }).click();

  const dialog = page.getByRole('dialog', { name: 'Cont nou' });
  await expect(dialog.getByLabel('Nume complet')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('modalul de adaugare job salveaza jobul in tracker', async ({ page }) => {
  await page.goto('/tracker');
  await page.getByRole('button', { name: /adaug[aă] job/i }).click();

  const dialog = page.getByRole('dialog', { name: 'Adaugă un job' });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);

  await dialog.getByLabel('Companie').fill('Firma Test');
  await dialog.getByLabel('Rol').fill('QA Engineer');
  await dialog.getByLabel('Descrierea jobului').fill('Testare automata cu Playwright.');
  const created = page.waitForRequest((r) => r.url().endsWith('/api/v1/jobs') && r.method() === 'POST');
  await dialog.getByRole('button', { name: 'Salvează' }).click();
  expect((await created).postDataJSON()).toMatchObject({ companyName: 'Firma Test', jobTitle: 'QA Engineer' });

  await expect(dialog).toBeHidden();
  await expect(page.getByText('Firma Test').first()).toBeVisible();
});

test('modalul de adaugare job se inchide cu Anulează fara sa trimita nimic', async ({ page }) => {
  await page.goto('/tracker');
  await page.getByRole('button', { name: /adaug[aă] job/i }).click();
  const dialog = page.getByRole('dialog', { name: 'Adaugă un job' });
  await dialog.getByRole('button', { name: 'Anulează' }).click();
  await expect(dialog).toBeHidden();
});

test('modalul de upload CV trimite fisierul ales', async ({ page }) => {
  await loginAsDemoUser(page);
  await page.goto('/cv-library');
  await page.getByRole('banner').getByRole('button', { name: 'Încarcă CV' }).click();

  const dialog = page.getByRole('dialog', { name: 'Încarcă un CV' });
  await expect(dialog).toBeVisible();
  await expectNoEmoji(dialog);
  await expect(dialog.getByRole('button', { name: 'Procesează CV-ul' })).toBeDisabled();

  await dialog.getByLabel('Fișier CV').setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
  const upload = page.waitForRequest((r) => r.url().endsWith('/api/v1/resumes') && r.method() === 'POST');
  await dialog.getByRole('button', { name: 'Procesează CV-ul' }).click();
  await upload;
  await expect(dialog).toBeHidden();
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('modalele de autentificare si adaugare job nu produc scroll orizontal', async ({ page }) => {
    await page.goto('/tracker');
    await page.getByRole('banner').getByRole('button', { name: 'Conectare' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Închide' }).click();

    await page.getByRole('button', { name: /adaug[aă] job/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});
