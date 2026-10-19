import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';
import { fixture } from './support/mockApi.js';

const PATH = '/market-insights';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.getByText(fixture('market-insights').domains[0].title).first()).toBeVisible();
  await page.waitForTimeout(400);
}

test('pagina se randeaza fara emoji', async ({ page }) => {
  await openPage(page);
  await expectNoEmoji(page.locator('main'));
});

test('cifrele din indicatori vin din raspunsul API', async ({ page }) => {
  await openPage(page);
  const data = fixture('market-insights');
  await expect(page.locator('main')).toContainText(data.totalJobsAnalyzed.toLocaleString());
  await expect(page.locator('main')).toContainText(`${data.overallLowCompetitionPct}%`);
});

test('cardurile sunt simple, fara card in card', async ({ page }) => {
  await openPage(page);
  expect(await page.locator('[data-card]').count()).toBeGreaterThan(3);
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('filtrele de nivel schimba cererea catre API', async ({ page }) => {
  await openPage(page);
  const request = page.waitForRequest((r) => r.url().includes('/api/v1/market-insights') && r.url().includes('level=SENIOR'));
  await page.getByRole('button', { name: /Senior/ }).click();
  await request;
});

test('detaliile unui domeniu se deschid si se inchid, fara emoji', async ({ page }) => {
  await openPage(page);
  const domain = fixture('market-insights').domains[0];
  await page.getByRole('button', { name: /Cerințe|Detalii/ }).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(domain.title);
  await expectNoEmoji(dialog);
  await expect(dialog.locator('[data-card] [data-card]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
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
