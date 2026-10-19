import { test, expect, loginAsDemoUser } from './support/test.js';
import { expectNoEmoji, expectNoHorizontalScroll, expectContentVisible } from './support/checks.js';

const PATH = '/roadmap';

async function openPage(page) {
  await loginAsDemoUser(page);
  await page.goto(PATH);
  await expect(page.getByRole('group', { name: 'Secțiune' })).toBeVisible();
  await page.waitForTimeout(300);
}

const section = (page, name) => page.getByRole('group', { name: 'Secțiune' }).getByRole('button', { name });

test('rolurile tehnice se randeaza fara emoji si fara card in card', async ({ page }) => {
  await openPage(page);
  await expect(page.locator('[data-resource]').first()).toBeVisible();
  await expectNoEmoji(page.locator('main'));
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);
});

test('alegerea unui rol schimba resursele si cautarea le filtreaza', async ({ page }) => {
  await openPage(page);
  const tracks = page.locator('[data-track]');
  const count = await tracks.count();
  expect(count).toBeGreaterThan(1);
  const second = tracks.nth(1);
  await second.click();
  await expect(second).toHaveAttribute('aria-pressed', 'true');

  await page.getByLabel('Filtrează resurse').fill('zzz-fara-rezultat');
  await expect(page.locator('[data-resource]')).toHaveCount(0);
  await expect(page.getByText(/Nicio resursă găsită/)).toBeVisible();
  await page.getByRole('button', { name: 'Șterge căutarea' }).last().click();
  await expect(page.locator('[data-resource]').first()).toBeVisible();

  await page.getByLabel('Caută rol').fill('zzz-fara-rezultat');
  await expect(tracks).toHaveCount(0);
});

test('linkul unei resurse se copiaza si apare confirmarea', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await openPage(page);
  await page.locator('[data-resource]').first().getByRole('button', { name: /Copiază linkul/ }).click();
  await expect(page.getByRole('status')).toContainText('Link copiat');
});

test('interviul HR: sectiunile, intrebarile si scriptul', async ({ page }) => {
  await openPage(page);
  await section(page, 'Interviu HR').click();
  await expectNoEmoji(page.locator('main'));
  expect(await page.locator('[data-card] [data-card]').count()).toBe(0);

  await page.getByRole('group', { name: 'Secțiuni HR' }).getByRole('button', { name: 'Întrebări' }).click();
  const first = page.getByRole('button', { expanded: false }).first();
  await first.click();
  await expect(page.getByText('Răspuns recomandat').first()).toBeVisible();
  await expect(page.getByText('De evitat').first()).toBeVisible();
});

test('flashcard-uri: intoarcere, evaluare, filtre si catalog', async ({ page }) => {
  await openPage(page);
  await section(page, 'Flashcard-uri').click();
  await expect(page.getByText(/^Card 1 din/)).toBeVisible();
  await expectNoEmoji(page.locator('main'));

  await page.getByRole('button', { name: 'Întoarce cardul' }).click();
  await expect(page.getByText('Cât de bine ai știut răspunsul?')).toBeVisible();
  await page.getByRole('button', { name: /^2.*Greu/ }).click();
  await expect(page.getByText(/^Card 2 din/)).toBeVisible();

  await page.getByRole('button', { name: 'Ușor', exact: true }).first().click();
  await expect(page.getByText(/^Card 1 din/)).toBeVisible();

  await page.getByRole('group', { name: 'Mod afișare' }).getByRole('button', { name: /Catalog/ }).click();
  await expect(page.getByText(/întrebări$/).first()).toBeVisible();
  await expectNoEmoji(page.locator('main'));

  await page.getByLabel('Caută în întrebări').fill('zzz-fara-rezultat');
  await page.getByRole('group', { name: 'Mod afișare' }).getByRole('button', { name: 'Carduri' }).click();
  await expect(page.getByText('Niciun card pentru filtrele alese')).toBeVisible();
});

test.describe('la 375px', () => {
  test.use({ viewport: { width: 375, height: 812 } });
  test('nu are scroll orizontal in nicio sectiune', async ({ page }) => {
    await openPage(page);
    await expectNoHorizontalScroll(page);
    await section(page, 'Interviu HR').click();
    await expectNoHorizontalScroll(page);
    await section(page, 'Flashcard-uri').click();
    await expect(page.getByText(/^Card 1 din/)).toBeVisible();
    await expectNoHorizontalScroll(page);
    await page.getByRole('button', { name: 'Întoarce cardul' }).last().click();
    await expect(page.getByText('Cât de bine ai știut răspunsul?')).toBeVisible();
    await expectNoHorizontalScroll(page);
  });
});

test.describe('cu reduced-motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('continutul e vizibil', async ({ page }) => {
    await openPage(page);
    await expectContentVisible(page.locator('main'));
    await section(page, 'Interviu HR').click();
    await expectContentVisible(page.locator('main'));
  });
});
